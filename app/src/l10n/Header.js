import {GetPluralDefinitionFromLanguageCode, PluralForm} from "./PluralForm.js";
import {NormalizeHeaderKey, NormalizeHeaderKeys} from "./Filter.js";

const DEFAULT_HEADER_ATTRIBUTES = [
    'Revision-Date',
    'Translator',
    'Generator',
    'Project-Id-Version',
    'Last-Translator',
    'Language-Team',
    'Language',
    'Content-Type',
    'Content-Transfer-Encoding',
    'MIME-Version',
    'Charset',
];

/**
 * Normalize value
 *
 * @param {string} value
 * @return {string}
 */
const normalize_value = (value) => {
    return value
        .toString()
        .replace(/\t+/, ' ')
        .replace(/[\t\r\n\v\f\e\x08\x07]/, '');
}

/**
 * Normalize private attributes
 *
 * @param {string} key
 * @return {string}
 */
const normalize_private_attribute = (key) => {
    return '_' + key.toLowerCase().replaceAll('-', '_');
}

export default class Header {

    /**
     * Header
     *
     * @param {{
     *     content_type?: string,
     *     language?: string,
     *     charset?: string,
     *     plural_forms?: PluralForm|string
     *     [key: string]: any
     *     }} header
     */
    constructor(header) {
        header = NormalizeHeaderKeys(header);
        let plural_forms = header['Plural-Forms'] || header['Plural-Form'];
        delete header['Plural-Forms'];
        delete header['Plural-Form'];

        for (let key in header) {
            let value = header[key] || '';
            if (value && typeof value !== 'string') {
                value = value.toString() || null;
            }
            header[key] = normalize_value(value) || null;
        }
        for (let key in header) {
            if (DEFAULT_HEADER_ATTRIBUTES.includes(key)) {
                this[normalize_private_attribute(key)] = header[key];
                continue;
            }
            this._attributes[key] = header[key];
        }

        if (!this._generator && this._attributes['X-Generator']) {
            this._generator = this._attributes['X-Generator'];
        }
        if (this._revision_date) {
            try {
                this._revision_date = new Date(this._revision_date);
            } catch (err) {
                this._revision_date = null;
            }
        }
        if (!this._language) {
            this._language = '';
        }
        if (!this._content_type) {
            this._content_type = 'text/plain';
        }
        if (!this._charset) {
            // maybe content type charset=.+
            let cMatch = this._content_type.match(/;\s*charset=(\S+)\s*(?:;|$)/);
            this._charset = cMatch ? cMatch[1] : 'UTF-8';
        }
        if ((plural_forms instanceof PluralForm)) {
            this._plural_forms = plural_forms;
        }
        if (typeof plural_forms === 'string') {
            this._plural_forms = new PluralForm(plural_forms);
        } else {
            this._plural_forms = GetPluralDefinitionFromLanguageCode(this.language);
        }
    }

    /**
     * Project ID Version
     *
     * @type {?string}
     * @private
     */
    _project_id_version = null;

    /**
     * Get project id version
     *
     * @return {?string}
     */
    get project_id_version() {
        return this._project_id_version || null;
    }

    /**
     * Translator
     *
     * @type {?string}
     * @private
     */
    _translator = null;

    /**
     * Get generator
     *
     * @return {?string}
     */
    get translator() {
        return this._translator;
    }

    /**
     * Revision Date
     *
     * @type {?Date}
     * @private
     */
    _revision_date = null;

    /**
     * Get revision date
     *
     * @return {?Date}
     */
    get revision_date() {
        return this._revision_date;
    }

    /**
     * Generator
     *
     * @type {?string}
     * @private
     */
    _generator = null;

    /**
     * Get generator
     *
     * @return {?string}
     */
    get generator() {
        return this._generator || null;
    }

    /**
     * Last translator
     *
     * @type {?string}
     * @private
     */
    _last_translator = null;

    /**
     * Get last translator
     *
     * @return {?string}
     */
    get last_translator() {
        return this._last_translator || null;
    }

    /**
     * Language team
     *
     * @type {?string}
     * @private
     */
    _language_team = null;

    /**
     * Get language team
     *
     * @return {?string}
     */
    get language_team() {
        return this._language_team || null;
    }

    /**
     * Language
     * @type {?string} language
     * @private
     */
    _language = null;

    /**
     * Language
     * @return {?string}
     */
    get language() {
        return this._language;
    }

    /**
     * Content Type
     *
     * @type {string}
     * @private
     */
    _content_type;

    /**
     * Content Type
     *
     * @return {string}
     */
    get content_type() {
        return this._content_type;
    }

    /**
     * Content transfer encoding
     *
     * @type {?string}
     * @private
     */
    _content_transfer_encoding = null;

    /**
     * Content Transfer Encoding
     *
     * @return {?string}
     */
    get content_transfer_encoding() {
        return this._content_transfer_encoding || null;
    }

    /**
     * Mime version
     *
     * @type {?string}
     * @private
     */
    _mime_version = null;

    /**
     * Mime Version
     *
     * @return {?string}
     */
    get mime_version() {
        return this._mime_version || null;
    }

    /**
     * Charset
     *
     * @type {string} charset
     * @private
     */
    _charset = 'UTF-8';

    /**
     * Charset
     *
     * @return {string}
     */
    get charset() {
        return this._charset;
    }

    /**
     * Attributes
     *
     * @type {{}}
     * @private
     */
    _attributes = {};

    /**
     * Attributes
     * @return {{[p: string]: any}}
     */
    get attributes() {
        return this._attributes;
    }

    /**
     * Plural Forms
     * @type {PluralForm} plural_forms
     *
     * @private
     */
    _plural_forms;

    /**
     * Plural Forms
     *
     * @return {PluralForm}
     */
    get plural_forms() {
        return this._plural_forms;
    }

    /**
     * Get all attributes
     *
     * @return {{[p: string]: *}}
     */
    getAttributes() {
        return this.attributes;
    }

    /**
     * Get attribute by name
     *
     * @param {string} name
     * @return {PluralForm|undefined|any}
     */
    get(name) {
        if (typeof name !== 'string') {
            return undefined;
        }
        name = NormalizeHeaderKey(name);
        if (name === 'Plural-Forms' || name === 'Plural-Form') {
            return this.plural_forms;
        }
        if (DEFAULT_HEADER_ATTRIBUTES.includes(name)) {
            return this[normalize_private_attribute(name)];
        }
        return this.attributes[name]
    }
}
