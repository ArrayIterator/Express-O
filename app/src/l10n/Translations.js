import Translation, {CreateTranslationFromFile} from "./Translation.js";
import {NormalizeLocale} from "./Filter.js";

export const DEFAULT_DOMAIN = 'default';
export const DEFAULT_LOCALE = 'en';

/**
 * Gettext translations
 */
export default class Translations {

    /**
     * Translations
     *
     * @type {{
     *     [domain: string]: {
     *         [locale: string]: Translation
     *     }
     * }}
     * @private
     */
    _translations = {};

    /**
     * Translations
     *
     * @param locale
     */
    constructor(locale = DEFAULT_LOCALE) {
        this._locale = NormalizeLocale(locale);
    }

    /**
     * Locale
     *
     * @type {string}
     * @private
     */
    _locale = DEFAULT_LOCALE;

    /**
     * Get locale
     *
     * @return {string}
     */
    get locale() {
        return this._locale;
    }

    /**
     * Set locale
     *
     * @param {string} language
     */
    set locale(language) {
        this.setLocale(language);
    }

    /**
     * Get local list
     *
     * @return {{[locale: string]: [domain: string][]}}
     */
    get locales() {
        const locales = {};
        for (let _domain in this._translations) {
            for (let _locale in this._translations[_domain]) {
                if (!locales[_locale]) {
                    locales[_locale] = [];
                }
                locales[_locale].push(_domain);
            }
        }
        return locales;
    }

    /**
     * Get domain list
     *
     * @return {{[domain: string]: [locale: string][]}}
     */
    get domains() {
        const domains = {};
        for (let _domain in this._translations) {
            for (let _locale in this._translations[_domain]) {
                if (!domains[_domain]) {
                    domains[_domain] = [];
                }
                domains[_domain].push(_locale);
            }
        }
        return domains;
    }

    /**
     * Set locale
     *
     * @param {string} language
     * @return {string}
     */
    setLocale(language) {
        if (typeof language === 'string') {
            this._locale = NormalizeLocale(language);
        }
        return this._locale;
    }

    /**
     * Remove translations
     *
     * @param {string} language
     * @param {string} domain
     * @return {?Translation}
     */
    remove(language, domain) {
        if (typeof domain !== 'string' || typeof language !== 'string') {
            return null;
        }
        if (!this._translations[domain]) {
            return null;
        }
        if (Object.keys(this._translations[domain]).length === 0) {
            delete this._translations[domain];
            return null;
        }

        language = NormalizeLocale(language);
        if (!this._translations[domain][language]) {
            return null;
        }
        let trans = this._translations[domain][language];
        delete this._translations[domain][language];
        if (Object.keys(this._translations[domain]).length === 0) {
            delete this._translations[domain];
        }

        return trans;
    }

    /**
     * Add translation
     *
     * @param {string} domain
     * @param {Translation} translation
     * @return {boolean}
     */
    addTranslation(translation, domain = DEFAULT_DOMAIN) {
        if (typeof domain !== 'string' || !(translation instanceof Translation)) {
            return false;
        }
        if (!this._translations[domain]) {
            this._translations[domain] = {};
        }
        let locale = NormalizeLocale(translation.locale);
        if (this._translations[domain][locale]) {
            this._translations[domain][locale].mergeTranslations(translation);
            return true;
        }
        this._translations[domain][locale] = translation;
        return true;
    }

    /**
     * Add translation from file
     *
     * @param {string} fileName the filename
     * @param {?string} domain
     * @param {?string} language
     * @return {boolean}
     */
    addFromFile(fileName, domain = null, language = null) {
        const translation = CreateTranslationFromFile(fileName, language);
        domain = typeof domain === 'string' ? domain : (translation.header.get('X-Domain') || translation.header.get('Domain'));
        domain = typeof domain === 'string' ? domain : DEFAULT_DOMAIN;
        return this.addTranslation(translation, domain);
    }

    /**
     * Get translations
     *
     * @param domain
     * @return {?{[locale: string]: Translation}}
     */
    getTranslations(domain) {
        if (typeof domain !== 'string') {
            return null;
        }
        return this._translations[domain] || null;
    }

    /**
     * Get locale translations
     *
     * @param {string} locale
     * @param {string} domain
     * @return {?Translation}
     */
    getLocaleTranslations(locale, domain = DEFAULT_DOMAIN) {
        if (typeof domain !== 'string' || typeof locale !== 'string') {
            return null;
        }
        if (!this._translations[domain]) {
            return null;
        }
        if (this._translations[domain].hasOwnProperty(locale)) {
            return this._translations[domain][locale];
        }
        locale = NormalizeLocale(locale);
        return this._translations[domain][locale] || null;
    }

    /**
     * Translate locale
     *
     * @param {string} locale locale
     * @param {string} text text to translate
     * @param {string} domain domain
     * @param {string} context context
     * @return {string} translated text
     */
    translateLocale(locale, text, domain = DEFAULT_DOMAIN, context = '') {
        const translation = this.getLocaleTranslations(domain, locale);
        return translation ? translation.translate(text, context) : (typeof text === 'string' ? text : '');
    }

    /**
     * Translate plural locale
     *
     * @param {string} locale locale
     * @param {string} singular
     * @param {string} plural
     * @param {number} n
     * @param {string} domain
     * @param {string} context
     * @return {string} translated text
     */
    translatePluralLocale(
        locale,
        singular,
        plural,
        n,
        domain = DEFAULT_DOMAIN,
        context = ''
    ) {
        const translation = this.getLocaleTranslations(domain, locale);
        let translated = translation ? translation.translatePlural(singular, plural, n, context) : n === 1 ? singular : plural;
        return typeof translated === 'string' ? translated : '';
    }

    /**
     * Translate singular
     *
     * @param {string} text text to translate
     * @param {string} domain domain
     * @param {string} context context
     * @return {string} translated text
     */
    translate(text, domain = DEFAULT_DOMAIN, context = '') {
        return this.translateLocale(this._locale, text, domain, context);
    }

    /**
     * Translate plural
     *
     * @param {string} singular
     * @param {string} plural
     * @param {number} n
     * @param {string} domain
     * @param {string} context
     * @return {string}
     */
    translatePlural(singular, plural, n, domain = DEFAULT_DOMAIN, context = '') {
        return this.translatePluralLocale(this._locale, singular, plural, n, domain, context);
    }
}
