/**
 * Generate translation id
 *
 * @param {string} context
 * @param {string} msgid
 * @return {string}
 */
export const GenerateTranslationId = (context, msgid) => context + "\x04" + msgid;

/**
 * Normalize locale
 *
 * @param {string} locale
 * @return {string}
 */
export const NormalizeLocale = (locale) => {
    locale = locale.trim().toLowerCase();
    // split underscore or hyphen
    locale = locale
        .replace(/[_-]/, '-')
        .replace(/^-+|-+$/g, '');
    const locales = locale.split('-');
    if (locales.length > 1) {
        locale = locales[0] + '-' + locales[1].toUpperCase();
    }
    return locale;
}

/**
 * Normalize header key
 * @param {string} key
 * @return {string}
 */
export const NormalizeHeaderKey = (key) => {
    if (!key) {
        return '';
    }
    key = key.toString().trim().toLowerCase().replace(/[\s_]+/, '-');
    // make Uppercase first and uppercase after dash
    return key.replace(/(^[a-z]|-[a-z])/g, (match) => match.toUpperCase());
}

/**
 * Normalize header keys
 *
 * @param {{[key: string]: any}} headers
 * @return {{[key: string]: any}}
 */
export const NormalizeHeaderKeys = (headers) => {
    if (typeof headers !== 'object') {
        return {};
    }

    const normalized = {};
    for (const key in headers) {
        normalized[NormalizeHeaderKey(key)] = headers[key];
    }
    return normalized;
}
