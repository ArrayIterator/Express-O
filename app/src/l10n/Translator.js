// noinspection JSUnusedGlobalSymbols

import Translations, {DEFAULT_DOMAIN} from "./Translations.js";
import Config, {LANGUAGES_DIR} from "../app/Config.js";
import {is_string} from "../helpers/Is.js";
import {NormalizeLocale} from "./Filter.js";
import {existsSync, readdirSync, statSync} from "node:fs";
import {basename, extname, resolve} from "node:path";
import {debug, warn} from "../app/Logger.js";
import {dirname} from "path";

/**
 * List registered files
 *
 * @type {{[domain:string]: {
 *     [locale: string]: {
 *         [file: string]: boolean
 *     }
 * }}}
 */
const DOMAIN_LISTS = {};

/**
 * Allowed extensions
 *
 * @type {string[]}
 */
const ALLOWED_EXTENSIONS = [
    '.mo',
    '.po',
    '.pot',
    '.json'
];

let language = Config.get('environment.language');
language = is_string(language) ? language : 'en';
language = NormalizeLocale(language);

const translations = new Translations(language);

/**
 * Set language
 *
 * @param {string} language
 * @return {string|false}
 */
export const set_language_translation = (language) => {
    if (typeof language !== 'string') {
        return false;
    }
    language = NormalizeLocale(language);
    for (let domain in DOMAIN_LISTS) {
        for (let file in DOMAIN_LISTS[domain][language]) {
            if (DOMAIN_LISTS[domain][language][file]) {
                continue;
            }
            DOMAIN_LISTS[domain][language][file] = true;
            try {
                debug('translation', `Loading translation (${language}) for domain : ${domain}`);
                translations.addFromFile(file, domain, language);
            } catch (err) {
                warn('translation', err);
            }
        }
    }

    return translations.setLocale(language);
}

/**
 * Exclude languages, exclude en & en-US by default
 *
 * @type {string[]}
 */
export const EXCLUDE_LANGUAGES = ['en', 'en-US'];

/**
 * Load domain language
 *
 * @param {string} domain
 * @param {string} directory
 * @return {boolean} true if success, false otherwise
 */
export const load_domain_translation = (domain, directory) => {
    if (!is_string(domain) || !is_string(directory)) {
        return false;
    }

    directory = resolve(directory);
    if (!existsSync(directory)) {
        return false;
    }
    const stats = statSync(directory);
    if (stats.isFile()) {
        const ext = extname(directory).toLowerCase();
        if (!ALLOWED_EXTENSIONS.includes(ext)) {
            return false;
        }
        const locale = NormalizeLocale(basename(directory, ext));
        if (!locale || locale.length < 2
            || EXCLUDE_LANGUAGES.includes(locale) // exclude languages
        ) {
            return false;
        }
        if (!DOMAIN_LISTS[domain]) {
            DOMAIN_LISTS[domain] = {};
        }
        if (DOMAIN_LISTS[domain][locale]) {
            DOMAIN_LISTS[domain] = {};
        }
        if (DOMAIN_LISTS[domain][locale][directory]) {
            return true;
        }
        DOMAIN_LISTS[domain][locale][directory] = false;
        return true;
    }
    if (!stats.isDirectory()) {
        return false;
    }
    if (!DOMAIN_LISTS[domain]) {
        DOMAIN_LISTS[domain] = {};
    }
    try {
        // list file language dir, json, mo, po
        for (const file of readdirSync(LANGUAGES_DIR)) {
            const ext = extname(file).toLowerCase();
            const locale = NormalizeLocale(basename(file, ext));
            if (!locale || locale.length < 2) {
                continue;
            }
            if (ext && ALLOWED_EXTENSIONS.includes(ext)) {
                if (!DOMAIN_LISTS[domain][locale]) {
                    DOMAIN_LISTS[domain][locale] = {};
                }
                if (!DOMAIN_LISTS[domain][locale][file]) {
                    DOMAIN_LISTS[domain][locale][file] = false;
                }
            }
        }
    } catch (err) {
        warn('translation', err);
        // pass
    }
}

/**
 * Translate
 *
 * @param {string} text text to translate
 * @param {string} domain translation text domain
 * @param {string} context
 * @return {string} translated text
 */
export const translator = (text, domain = DEFAULT_DOMAIN, context = '') => {
    return translations.translate(text, domain, context);
}

/**
 * Translate Plural
 *
 * @param {string} single text to translate
 * @param {string} plural plural translation
 * @param {number} count number of items
 * @param {string} domain translation text domain
 * @param {string} context translation context
 * @return {string} translated text
 */
export const translate_plural = (single, plural, count, domain = DEFAULT_DOMAIN, context = '') => {
    return translations.translatePlural(single, plural, count, domain, context);
}

/**
 * Translate with context
 *
 * @param {string} context translation context
 * @param {string} text text to translate
 * @param {string} domain translation text domain
 * @return {string} translated text
 */
export const translate_context = (context, text, domain = DEFAULT_DOMAIN) => {
    return translator(context, text, domain);
}

/**
 * Translate Plural with context
 *
 * @param {string} context translation context
 * @param {string} single text to translate
 * @param {string} plural plural translation
 * @param {number} count number of items
 * @param {string} domain translation text domain
 * @return {string} translated text
 */
export const translate_plural_context = (context, single, plural, count, domain = DEFAULT_DOMAIN) => {
    return translate_plural(single, plural, count, domain, context);
}

export const __ = translator;
export const _n = translate_plural;
export const _c = translate_context;
export const _nc = translate_plural_context;

/**
 * Add translation by file
 *
 * @param {string} language
 * @param {string} domain
 * @param {string} file
 * @return {boolean} true if success, otherwise false
 */
export const add_translation_file = (language, domain, file) => {
    if (!is_string(language) || !is_string(domain) || !is_string(file)) {
        return false;
    }
    language = NormalizeLocale(language);
    if (language.length < 2) {
        return false;
    }
    file = resolve(file);
    const directory = dirname(file);

    if (DOMAIN_LISTS[domain] && DOMAIN_LISTS[domain][directory] && DOMAIN_LISTS[domain][directory][language]) {
        return true; // already loaded
    }
    debug('translation', `Loading translation (${language}) for domain : ${domain}`);
    if (!existsSync(file)) {
        return false;
    }
    if (!statSync(file).isFile()) {
        return false;
    }

    if (!DOMAIN_LISTS[domain][language]) {
        DOMAIN_LISTS[domain][language] = {};
    }
    DOMAIN_LISTS[domain][language][file] = true;
    try {
        debug('translation', `Loading translation (${language}) for domain : ${domain}`);
        translations.addFromFile(file, domain, language);
        return true;
    } catch (err) {
        warn('translation', err);
    }
    return false;
}

// load text domain
load_domain_translation(DEFAULT_DOMAIN, LANGUAGES_DIR);
if (DOMAIN_LISTS[translations.locale]) {
    set_language_translation(translations.locale);
}
