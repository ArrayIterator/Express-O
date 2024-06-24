// noinspection ExceptionCaughtLocallyJS,JSUnusedGlobalSymbols

/**
 * @typedef {{
 *      extensions?: string[],
 *      docType?: string,
 *      staticMarkup?: boolean,
 *      viewsDir?: string,
 *      wrapperFile: string|null,
 *      defaultHtmlAttributes: {[key: string]: any},
 *      defaultBodyAttributes: {[key: string]: any},
 *      charset: string,
 *      app?: Express,
 *      wrapperFile?: string|null
 *      [key: string] :any
 * }} EngineOptions
 */

import ReactDOMServer from 'react-dom/server';
import {is_function, is_object, is_string} from "../../helpers/Is.js";
import InvalidArgumentException from "../../errors/exceptions/InvalidArgumentException.js";
import {E_ERROR} from "../../errors/exceptions/ErrorCode.js";
import {existsSync, statSync} from "node:fs";
import View from "./renderer/View.js";
import RuntimeException from "../../errors/exceptions/RuntimeException.js";
import {sprintf} from "../../helpers/Formatting.js";
import {__} from "../../l10n/Translator.js";
import RequireEngineComponent, {LastError} from "./RequireEngineComponent.js";

/**
 * Register React Engine
 *
 * @param {Express} app
 * @param {{
 *      extensions?: string[],
 *      docType?: string,
 *      staticMarkup?: boolean,
 *      viewsDir?: string,
 *      [key: string] :any
 * }} engineOptions
 * @return {ReactEngine}
 */
export const RegisterReactEngine = (app, engineOptions) => {
    return new ReactEngine(engineOptions).register(app);
}

/**
 * Default Extensions
 *
 * @type {[".tsx", ".jsx", ".js", ".mjs"]}
 */
export const DEFAULT_EXTENSIONS = ['.tsx', '.jsx', '.js', '.mjs'];

/**
 * React Engine - Compiler
 */
export class ReactEngine {

    /**
     * React Engine
     *
     * @param {EngineOptions} engineOptions
     */
    constructor(engineOptions = {}) {
        engineOptions = !is_object(engineOptions) ? {} : engineOptions;
        this._engineOptions = {
            extensions: DEFAULT_EXTENSIONS,
            docType: '<!DOCTYPE html>',
            staticMarkup: false,
            app: null,
            viewsDir: null,
            defaultHtmlAttributes: {},
            defaultBodyAttributes: {},
            charset: 'utf-8',
            ...engineOptions
        };
        this.setWrapperFile(import.meta.dirname + '/wrapper/Wrapper.tsx');
        if (is_string(this._engineOptions.extensions)) {
            this._engineOptions.extensions = [this._engineOptions.extensions];
        }
        if (!Array.isArray(this._engineOptions.extensions) || this._engineOptions.extensions.length === 0) {
            this._engineOptions.extensions = DEFAULT_EXTENSIONS;
        }
        if (!this._engineOptions.extensions.includes('.tsx')) {
            this._engineOptions.extensions.push('.tsx');
        }
        if (!this._engineOptions.extensions.includes('.jsx')) {
            this._engineOptions.extensions.push('.jsx');
        }
        if (!is_object(this._engineOptions.defaultHtmlAttributes)) {
            this._engineOptions.defaultHtmlAttributes = {};
        }
        if (!is_object(this._engineOptions.defaultBodyAttributes)) {
            this._engineOptions.defaultBodyAttributes = {};
        }
        if (is_string(this._engineOptions.viewsDir)) {
            this._engineOptions.viewsDir = [this._engineOptions.viewsDir];
        }
        // make unique
        this._engineOptions.extensions = [...new Set(this._engineOptions.extensions)];
        let opts = [];
        this._engineOptions.extensions = Object.values(this._engineOptions.extensions);
        for (let ext of this._engineOptions.extensions) {
            if (!is_string(ext) || ext.trim() === '') {
                continue;
            }
            if (ext[0] !== '.') {
                ext = '.' + ext;
            }
            opts.push(ext);
        }
        if (this._engineOptions.wrapperFile && !existsSync(this._engineOptions.wrapperFile)) {
            this._engineOptions.wrapperFile = null;
        }
        // filter extension
        this._engineOptions.extensions = opts.filter((ext) => ext.trim() !== '');
        // freeze engine options
        if (this._engineOptions.app) {
            this.register(this._engineOptions.app);
        }
    }

    /**
     * Engine Options
     *
     * @type {EngineOptions} _engineOptions
     * @private
     */
    _engineOptions;

    /**
     * Get Engine Options
     *
     * @return {EngineOptions}
     */
    get engineOptions() {
        return this._engineOptions;
    }

    /**
     * Get last error
     *
     * @return {?Error}
     */
    get lastError() {
        return LastError;
    }

    /**
     * Register React Engine
     *
     * @param {Express} app
     * @return {ReactEngine}
     */
    register(app) {
        if (!(this instanceof ReactEngine)) {
            throw new RuntimeException(
                sprintf(
                    __('%s must be called in instance of %s'),
                    'ReactEngine.register()',
                    'ReactEngine'
                ),
            );
        }
        if (!app || !is_function(app) || !is_function(app.set) || !is_function(app.engine)) {
            throw new InvalidArgumentException('Express app is required', E_ERROR);
        }
        app.set('views', this._engineOptions.viewsDir);

        /**
         * @param {string} name
         * @param {{
         *      defaultEngine:string,
         *      engines: {
         *          [key: string]: (filename:string, options: object, callback: Function) => any
         *      },
         *      [key: string]: any
         * }} options
         * @return {object}
         */
        app.set('view', View);
        app.set('view engine', 'tsx'); // set default to tsx
        app.set('reactEngine', this);
        // app.set('view engine', 'jsx');
        for (let ext of this._engineOptions.extensions) {
            app.engine(ext.substring(1), this.renderComponent);
        }
        return this;
    }

    /**
     * Set Wrapper File
     *
     * @param {string} wrapperFile
     * @return {ReactEngine}
     */
    setWrapperFile(wrapperFile) {
        if (!wrapperFile) {
            this._engineOptions.wrapperFile = null;
            return this;
        }
        if (is_string(wrapperFile) && existsSync(wrapperFile) && statSync(wrapperFile).isFile()) {
            this._engineOptions.wrapperFile = wrapperFile;
        }
        return this;
    }

    /**
     * Render Component
     *
     * @param {string} filename
     * @param {{settings: {[key: string]: any}, arguments?: {[key: string]: any}, [key: string]: any}} options
     * @param {(error: ?Error, result?: string) => any} callback
     * @return {Promise<unknown>}
     */
    renderComponent(filename, options, callback) {
        return new Promise(async (resolve, reject) => {
            if (typeof options === 'function') {
                callback = options;
                options = {};
            }
            if (!is_function(callback)) {
                callback = () => null;
            }
            options.charset = !options.charset || !is_string(options) ? 'utf-8' : options.charset;
            try {
                if (!(options.settings.reactEngine instanceof ReactEngine)) {
                    throw new InvalidArgumentException(
                        __('Options settings does not contain reactEngine instance'),
                        E_ERROR,
                        LastError
                    );
                }
                if (!is_string(filename)) {
                    throw new InvalidArgumentException(
                        __('Filename is required'),
                        E_ERROR,
                        LastError
                    );
                }
                if (!existsSync(filename) || !statSync(filename).isFile()) {
                    throw new InvalidArgumentException(
                        sprintf(__('File %s has not found'), filename),
                        E_ERROR,
                        LastError
                    );
                }
                const reactEngine = options.settings.reactEngine;
                options = !is_object(options) ? {} : options;
                options.settings = !is_object(options.settings) ? {} : options.settings;
                options.arguments = !is_object(options.arguments) ? {} : options.arguments;
                options.charset = !is_string(options.charset) ? reactEngine.engineOptions.charset : options.charset;
                options.htmlAttributes = !is_object(options.htmlAttributes) ? reactEngine.engineOptions.defaultHtmlAttributes : options.htmlAttributes;
                options.bodyAttributes = !is_object(options.bodyAttributes) ? reactEngine.engineOptions.defaultBodyAttributes : options.bodyAttributes;
                // clone
                options = Object.assign({}, options);
                const {docType, staticMarkup} = reactEngine.engineOptions;
                let fn = await RequireEngineComponent(filename).catch(() => undefined);
                if (!is_function(fn)) {
                    throw new InvalidArgumentException(
                        sprintf(
                            __('File %s is not a valid React Component'),
                            filename
                        ),
                        E_ERROR,
                        LastError
                    );
                }
                let children = fn(options);
                if (reactEngine.engineOptions.wrapperFile && existsSync(reactEngine.engineOptions.wrapperFile)) {
                    const wrapper = await RequireEngineComponent(reactEngine.engineOptions.wrapperFile).catch(() => undefined);
                    if (options.hasOwnProperty('children')) {
                        delete options.children;
                    }
                    if (is_function(wrapper)) {
                        children = wrapper({
                            ...options,
                            children
                        });
                    }
                }
                let markup = is_string(docType) ? docType : '';
                if (staticMarkup) {
                    markup += ReactDOMServer.renderToStaticMarkup(children);
                } else {
                    markup += ReactDOMServer.renderToString(children);
                }
                callback(null, markup);
                resolve(null);
            } catch (error) {
                reject(error);
                callback(error);
            }
        });
    }
}

export default ReactEngine;
