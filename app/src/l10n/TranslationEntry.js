import {GenerateTranslationId} from "./Filter.js";

export default class TranslationEntry {

    /**
     * Translation Entry
     *
     * @param {string} context
     * @param {string} singular
     * @param {?string} plural
     * @param {string[]|string} translations
     * @param {string[]|string} comments
     */
    constructor(context, singular, plural = null, translations = [], comments = []) {
        context = context || '';
        if (typeof context !== 'string') {
            throw new Error('Invalid context. Context must be as a string');
        }
        if (typeof singular !== 'string') {
            throw new Error('Invalid singular. Singular must be as a string');
        }
        if (typeof plural !== 'string' && plural !== null) {
            throw new Error('Invalid plural. Plural must be as a string');
        }
        comments = comments || [];
        translations = translations || [];
        if (typeof translations === 'string') {
            translations = [translations];
        }
        if (!Array.isArray(translations)) {
            throw new Error('Invalid translation. Translation must be as a string or an array of strings');
        }
        if (typeof comments === 'string') {
            comments = [comments];
        }
        if (translations.length > 0) {
            for (let i = 0; i < translations.length; i++) {
                if (typeof translations[i] !== 'string') {
                    throw new Error('Invalid translations offset ' + i + '. Translation must be as a string');
                }
            }
        }
        if (comments.length > 0) {
            for (let i = 0; i < comments.length; i++) {
                comments[i] = comments[i] || '';
                if (typeof comments[i] !== 'string') {
                    throw new Error('Invalid comments offset ' + i + '. Comment must be as a string');
                }
            }
        }
        this._id = GenerateTranslationId(context, singular);
        this._context = context;
        this._singular = singular;
        this._plural = plural;
        this._translations = translations;
        this._comments = comments;
    }

    /**
     * Translation id
     *
     * @private
     */
    _id;

    /**
     * Get translation id
     *
     * @return {string}
     */
    get id() {
        return this._id;
    }

    /**
     * @type {string} context
     * @private
     */
    _context;

    /**
     * Context
     *
     * @return {string}
     */
    get context() {
        return this._context;
    }

    /**
     * Message ID
     *
     * @type {string} msgid
     * @private
     */
    _singular;

    /**
     * Message ID
     *
     * @return {string}
     */
    get singular() {
        return this._singular;
    }

    /**
     * Message ID Plural
     *
     * @type {?string} msgid_plural
     * @private
     */
    _plural;

    /**
     * Plural Message ID
     *
     * @return {?string}
     */
    get plural() {
        return this._plural;
    }

    /**
     * Message String
     * @type {string[]} msgstr
     * @private
     */
    _translations = []

    /**
     * Messages String translations
     *
     * @return {string[]}
     */
    get translations() {
        return this._translations;
    }

    /**
     * Comments
     *
     * @type {string[]} comments
     * @private
     */
    _comments = [];

    /**
     * Comments
     *
     * @return {string[]}
     */
    get comments() {
        return this._comments;
    }
}
