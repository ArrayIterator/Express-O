import TranslationEntry from "./TranslationEntry.js";
import {PluralForm} from "./PluralForm.js";
import {GenerateTranslationId, NormalizeHeaderKeys, NormalizeLocale} from "./Filter.js";
import Header from "./Header.js";
import gettextParser from "gettext-parser";
import {readFileSync} from "node:fs";
import {extname} from "node:path";

/**
 * @template {{
 *   [context_msgid: string]: TranslationEntry
 * }} TranslationEntries
 */
export default class Translation {
    /**
     * Translations
     *
     * @param {string} locale
     * @param {?PluralForm} headerOrPluralForm
     * @param {TranslationEntry|{
     *         msgctxt?: string,
     *         msgid: string,
     *         msgid_plural?: string,
     *         msgstr?: string[],
     *         comments?: string[]
     *     }} translations
     */
    constructor(locale, headerOrPluralForm = null, ...translations) {
        this._locale = NormalizeLocale(locale);
        if (headerOrPluralForm instanceof Header) {
            this._header = headerOrPluralForm;
        } else if ((headerOrPluralForm instanceof PluralForm)) {
            this._header = new Header({
                plural_forms: headerOrPluralForm,
                language: this._locale
            })
        } else if (typeof headerOrPluralForm === 'string') {
            this._header = new Header({
                plural_forms: new PluralForm(headerOrPluralForm),
                language: this._locale
            });
        } else if (headerOrPluralForm && typeof headerOrPluralForm === 'object') {
            this._header = new Header({language: this._locale, ...headerOrPluralForm});
        } else {
            this._header = new Header({
                language: this._locale
            });
        }
        this._header = headerOrPluralForm;
        this.addTranslations(...translations);
    }

    /**
     * Header
     * @type {Header} header
     *
     * @private
     */
    _header;

    /**
     * Get Header
     *
     * @return {Header}
     */
    get header() {
        return this._header;
    }

    /**
     * Charset
     *
     * @type {string}
     * @private
     */
    _charset = 'UTF-8';

    /**
     * Get charset
     *
     * @return {string}
     */
    get charset() {
        return this._charset;
    }

    /**
     * Set charset
     *
     * @param {string} charset
     */
    set charset(charset) {
        if (typeof charset === 'string' && charset.trim().length > 0) {
            this._charset = charset;
        }
    }

    /**
     * Locale
     *
     * @type {string} locale
     * @private
     */
    _locale;

    /**
     * Locale
     *
     * @return {string}
     */
    get locale() {
        return this._locale;
    }

    /**
     * Translations
     *
     * @type {TranslationEntries}
     * @private
     */
    _entries = {};

    /**
     * Translations
     *
     * @return {TranslationEntries}
     */
    get entries() {
        return this._entries;
    }

    /**
     * Plural Form
     *
     * @return {PluralForm}
     */
    get pluralForm() {
        return this.header.plural_forms;
    }

    /**
     * Add translations
     * @param {
     *      TranslationEntry|{
     *         msgctxt?: string,
     *         msgid: string,
     *         msgid_plural?: string,
     *         msgstr?: string[],
     *         comments?: string[]
     *     }|{
     *         context?: string,
     *         singular: string,
     *         plural?: string,
     *         translations?: string[],
     *         comments?: string[]
     *     }} translations
     */
    addTranslations(...translations) {
        for (let translation of translations) {
            this.addTranslation(translation);
        }
    }

    /**
     * Add translation
     *
     * @param {
     *      TranslationEntry|{
     *         msgctxt?: string,
     *         msgid: string,
     *         msgid_plural?: string,
     *         msgstr?: string[],
     *         comments?: string[]
     *     }|{
     *         context?: string,
     *         singular: string,
     *         plural?: string,
     *         translations?: string[],
     *         comments?: string[]
     *     }
     * } translation
     */
    addTranslation(translation) {
        if (translation instanceof TranslationEntry) {
            this._entries[translation.id] = translation;
            return true;
        }
        if (translation
            && typeof translation === 'object'
            && (
                translation.hasOwnProperty('msgctxt')
                && translation.hasOwnProperty('msgid')
                || translation.hasOwnProperty('context')
                && translation.hasOwnProperty('singular')
            )
        ) {
            let msgctxt = translation.msgctxt || translation.context;
            let msgid = translation.msgid || translation.singular;
            let msgid_plural = translation.msgid_plural || translation.plural;
            let msgstr = translation.msgstr || translation.translations;
            let comments = translation.comments;
            try {
                let entry = new TranslationEntry(msgctxt, msgid, msgid_plural, msgstr, comments);
                this._entries[entry.id] = entry;
                return true;
            } catch (e) {
                // skip
            }
        }
        return false;
    }

    /**
     * Merge translations
     *
     * @param {TranslationEntry} entry
     */
    mergeTranslation(...entry) {
        for (let e of entry) {
            if (e instanceof TranslationEntry) {
                this.addTranslation(e);
            }
        }
    }

    /**
     * Merge the translations
     *
     * @param {Translation} translation
     */
    mergeTranslations(translation) {
        if (!(translation instanceof Translation)) {
            throw new Error('Translation must be an instance of Translation.' + (typeof translation) + ' given');
        }
        this.mergeTranslation(...Object.values(translation.entries));
    }

    /**
     * Get translation
     *
     * @param singular
     * @param context
     * @return {?string[]}
     */
    getTranslations(singular, context = '') {
        return this.getEntry(singular, context)?.translations;
    }

    /**
     * Get entry
     *
     * @param singular
     * @param context
     * @return {?TranslationEntry}
     */
    getEntry(singular, context = '') {
        if (typeof singular !== 'string' || typeof context !== 'string') {
            return null;
        }
        return this.entries[GenerateTranslationId(context, singular)] || null;
    }

    /**
     * Translate text
     *
     * @param {string} text text to translate
     * @param {string} context context of translation
     * @return {string} translated text
     */
    translate(text, context = '') {
        let entry = this.getTranslations(text, context);
        return entry && entry.length > 0 ? entry[0] : text;
    }

    /**
     * Get translation index
     *
     * @param {number} index
     * @param {string} singular
     * @param {string} context
     * @return {?string}
     */
    getTranslationIndex(index, singular, context = '') {
        let entry = this.getTranslations(singular, context);
        if (!entry) {
            return null;
        }
        index = this.pluralForm.index(index);
        return typeof entry[index] === 'string' ? entry[index] : null;
    }

    /**
     * Translate plural
     *
     * @param {string} singular single text
     * @param {string} plural plural text
     * @param {number} n number of items
     * @param {string} context context of translation
     * @return {string} translated text
     */
    translatePlural(singular, plural, n, context = '') {
        let index = this.pluralForm.index(n);
        let _translation = this.getTranslationIndex(index, singular, context);
        if (_translation) {
            return _translation;
        }

        return index > 0 ? plural : singular;
    }
}

/**
 * Create translation from object definition
 *
 * @param {{[key: string]: string|object}} obj
 * @param {?string} language force language used
 * @return {Translation}
 */
export const CreateTranslationFromObject = (obj, language = null) => {
    if (typeof obj !== 'object') {
        throw new Error(
            'Invalid object. Object must be an object'
        )
    }
    let headers = obj.header;
    if (!headers || typeof headers !== 'object') {
        headers = {};
    }
    language = typeof language === 'string' ? NormalizeLocale(language) : null;
    headers = NormalizeHeaderKeys(headers);
    if (!headers.Language) {
        headers.Language = language;
    }
    if (!language) {
        language = headers.Language;
    }
    let _locale = obj.local || obj.language;
    if (_locale && !headers.Language) {
        headers.Language = _locale;
    }
    if (typeof obj.charset === 'string') {
        headers.charset = obj.charset;
    }
    let translation = new Translation(language, headers);
    if (obj.translations && typeof obj.translations === "object") {
        for (let context in obj.translations) {
            let _translations = obj.translations[context];
            if (typeof _translations !== 'object') {
                continue;
            }
            translation.addTranslations(...Object.values(_translations));
        }
    }
    return translation;
}

/**
 * Create translation object from mo file
 *
 * @param {string} fileName
 * @param {?string} language force language used
 * @return {Translation}
 */
export const CreateTranslationFromMoFile = (fileName, language = null) => {
    if (typeof fileName !== 'string') {
        throw new Error(
            'Invalid file. File must be a string'
        )
    }
    return CreateTranslationFromObject(gettextParser.mo.parse(readFileSync(fileName, 'utf-8')), language);
}

/**
 * Create translation object from po/pot file
 *
 * @param {string} fileName
 * @param {?string} language force language used
 * @return {Translation}
 */
export const CreateTranslationFromPoFile = (fileName, language = null) => {
    if (typeof fileName !== 'string') {
        throw new Error(
            'Invalid fileName. File must be a string'
        )
    }
    return CreateTranslationFromObject(gettextParser.po.parse(readFileSync(fileName, 'utf-8')), language);
}

/**
 * Create translation object from json file
 *
 * @param {string} fileName
 * @param {?string} language force language used
 * @return {Translation}
 */
export const CreateTranslationFromJsonFile = (fileName, language = null) => {
    if (typeof fileName !== 'string') {
        throw new Error(
            'Invalid file. File must be a string'
        )
    }
    return CreateTranslationFromObject(JSON.parse(readFileSync(fileName, 'utf-8')), language);
}

/**
 * Create translation object from file
 *
 * @param {string} fileName
 * @param {?string} language force language used
 * @return {Translation}
 */
export const CreateTranslationFromFile = (fileName, language = null) => {
    if (typeof fileName !== 'string') {
        throw new Error(
            'Invalid file. File must be a string'
        )
    }
    switch ((extname(fileName) || '').toLowerCase()) {
        case '.json':
            return CreateTranslationFromJsonFile(fileName, language);
        case '.mo':
            return CreateTranslationFromMoFile(fileName, language);
        case '.pot':
        case '.po':
            return CreateTranslationFromPoFile(fileName, language);
    }
    throw new Error('Invalid file extension');
}
