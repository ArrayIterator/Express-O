import Plurals from "./Plurals.js";

/**
 * Create a plural form function
 * @param {string} form eg : 'nplurals=2; plural=n != 1;'
 */
export const CreatePluralFormFunctionFromForm = (form) => {
    const [nplurals, plural] = form.split(';').map(s => s.trim());
    if (!nplurals || !plural) {
        throw new Error('Invalid plural form');
    }
    let npluralsValue = nplurals.split('=');
    if (npluralsValue.length !== 2) {
        throw new Error('Invalid nplurals value');
    }
    npluralsValue = parseInt(npluralsValue[1], 10);
    const pluralBody = plural.split('=')[1].trim();
    const pluralFunc = new Function('n', `return ${pluralBody};`);
    return {nplurals: npluralsValue, plural: pluralFunc};
}

export const defaultPluralForm = Plurals.default;

/**
 * Get plural definition from language code
 *
 * @param languageCode
 * @return {{name: string, examples: {plural: number, sample: number}[], nplurals: number, form: string, function: (function(number): boolean)}}
 */
export const GetPluralDefinitionFromLanguageCode = (languageCode) => {
    if (typeof languageCode !== 'string') {
        throw new Error('Invalid language code');
    }
    languageCode = languageCode.trim().toLowerCase();
    // split underscore or hyphen
    languageCode = languageCode.split(/[_-]/)[0];
    if (Plurals.hasOwnProperty(languageCode)) {
        return Plurals[languageCode];
    }
    if (languageCode.length > 2) {
        languageCode = languageCode.substring(0, 2);
        if (Plurals.hasOwnProperty(languageCode)) {
            return Plurals[languageCode];
        }
    }
    return defaultPluralForm;
}

/**
 * Plural Form
 */
export class PluralForm {
    /**
     * Plural Form
     *
     * @param {string} form
     * @param {(n?: number) => boolean|number} func
     * @constructor
     */
    constructor(form, func) {
        if (typeof form !== 'string') {
            throw new Error('Invalid form');
        }
        this._form = form;
        const {nplurals, plural} = CreatePluralFormFunctionFromForm(this.form);
        this._n = nplurals;
        this._function = typeof func === 'function' ? func : plural;
    }

    /**
     * @type {number} n
     * @private
     */
    _n;

    /**
     * N value
     *
     * @return {number}
     */
    get n() {
        return this._n;
    }

    /**
     * @type {string} form
     * @private
     */
    _form;

    /**
     * Form
     *
     * @return {string}
     */
    get form() {
        return this._form;
    }

    /**
     * @type {(n?: number) => boolean} func
     * @private
     */
    _function;

    /**
     * Function
     * @return {(n?: number) => boolean|number}
     */
    get function() {
        return this._function;
    }

    /**
     * Create from language code
     *
     * @param {string} languageCode eg: 'en', 'en_US', 'fr', 'fr_FR'
     * @return {PluralForm}
     */
    static createFromLanguageCode(languageCode) {
        const form = GetPluralDefinitionFromLanguageCode(languageCode);
        return new PluralForm(form.form, form.function);
    }

    /**
     * Is plural
     *
     * @param {number} n
     * @return {boolean}
     */
    is_plural(n) {
        return this.index(n) > 0;
    }

    /**
     * Get index
     *
     * @param {number} n
     *
     * @return {number} returning positive integer number
     */
    index(n) {
        if (typeof n === 'string' && /^[0-9]+(\.\d+)?$/.test(n)) {
            n = parseInt(n, 10);
        }
        if (typeof n !== 'number') {
            return false;
        }
        const plural = this.function(n);
        return typeof plural === "number" ? plural : (plural ? 1 : 0);
    }

    /**
     * Plural form
     *
     * @return {string}
     */
    toString() {
        return this.form;
    }
}
