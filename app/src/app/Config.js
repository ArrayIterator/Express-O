// noinspection JSUnusedGlobalSymbols

import {intval, strval} from "../helpers/DataType.js";
import path from "node:path";
import {glob} from "glob";
import {parse} from "yaml";
import {existsSync, mkdirSync, readFileSync} from "node:fs";
import {
    is_array,
    is_async_function,
    is_boolean,
    is_function,
    is_integer, is_numeric_integer,
    is_object,
    is_scalar,
    is_string
} from "../helpers/Is.js";

export const NODE_ENV = strval(process.env.ENV).trim();
export const NODE_PORT = intval(process.env.PORT);
export const NODE_TIMEOUT = intval(process.env.TIMEOUT);
export const NODE_LANGUAGE = strval(process.env.LANGUAGE).trim();

/**
 * Resolve path
 *
 * @param {string} source the source path
 * @param {string} _path the path to resolve
 * @return {string} the resolved path
 */
const resolvePath = (source, _path = '') => {
    _path = strval(_path);
    _path = _path.replace(/^[\/\\]+/g, '/');
    if (_path.startsWith('/')) {
        return _path;
    }
    if (_path.startsWith('./')) {
        _path = _path.substring(2);
    }
    return path.resolve(source, _path);
}

export const SRC_DIR = resolvePath(import.meta.dirname, '../');
export const APP_DIR = resolvePath(SRC_DIR, '../');
export const ROOT_DIR = resolvePath(APP_DIR, '../');
export const CONFIG_DIR = resolvePath(APP_DIR, 'configs');
export const LANGUAGE_DIR = resolvePath(APP_DIR, 'languages');
export const ROUTES_DIR = resolvePath(APP_DIR, 'routes');
export const MIDDLEWARES_DIR = resolvePath(APP_DIR, 'middlewares');
export const VIEWS_DIR = resolvePath(APP_DIR, 'views');
export const SRC_VIEWS_DIR = resolvePath(SRC_DIR, 'views');

/**
 * Directories
 *
 * @type {{
 *      app: string,
 *      routes: string,
 *      src: string,
 *      root: string,
 *      language: string,
 *      config: string,
 *      views: string,
 *      storage: string,
 *      public: string,
 *      migrations: string
 * }}
 */
const DIRS = {
    src: SRC_DIR,
    app: APP_DIR,
    root: ROOT_DIR,
    config: CONFIG_DIR,
    language: LANGUAGE_DIR,
    routes: ROUTES_DIR,
    views: VIEWS_DIR,
};

/**
 * Replace placeholder
 *
 * @param {any} str
 * @return {{}|string|any[]}
 */
const replacePlaceHolder = (str) => {
    if (str instanceof Buffer || str instanceof ArrayBuffer || str instanceof Uint8Array) {
        str = strval(str)
    }
    if (is_object(str)) {
        let new_str = {};
        for (let key in str) {
            new_str[key] = replacePlaceHolder(str[key]);
        }
        return new_str;
    }
    if (is_array(str)) {
        return str.map(replacePlaceHolder);
    }
    if (!is_string(str)) {
        return str;
    }
    return str.replace(/%([a-z_]+)_dir%/g, (a, placeholder) => {
        return DIRS[placeholder] || a;
    });
}

const CONFIGS = {
    environment: {
        mode: 'production',
        timezone: 'UTC',
        timeout: 30000,
        public: false,
        port: null,
        remove_x_powered_by: true,
        ssl: {
            enable: null,
            key: '',
            cert: ''
        },
        language: 'en',
        directory: {
            storage: replacePlaceHolder('%root_dir%/storage'),
            public: replacePlaceHolder('%root_dir%/public'),
            migrations: replacePlaceHolder('%app_dir%/migrations'),
        }
    },
    cache: {},
    database: {},
    log: {}
};

// build environment
if (existsSync(resolvePath(CONFIG_DIR, 'environment.yaml'))) {
    try {
        /**
         * Environment
         *
         * @type {{
         *     mode?: string,
         *     timezone?: string,
         *     timeout?: number,
         *     language?: string,
         *     public?: boolean,
         *     port?: number,
         *     ssl?: {
         *          key?: string,
         *          cert?: string
         *     },
         *     remove_x_powered_by?: boolean,
         *     directory?: {
         *          storage?: string,
         *          public?: string,
         *          migrations?: string
         *     }
         * }}
         */
        let env = replacePlaceHolder(readFileSync(resolvePath(CONFIG_DIR, 'environment.yaml')));
        env = parse(env);
        if (is_object(env)) {
            ['mode', 'timezone', 'language'].forEach(key => {
                CONFIGS.environment[key] = is_string(env[key]) ? env[key] : CONFIG_DIR[key];
                delete env[key];
            });
            CONFIGS.environment.remove_x_powered_by = is_boolean(env.remove_x_powered_by) ? env.remove_x_powered_by : CONFIGS.environment.remove_x_powered_by;
            CONFIGS.environment.timeout = is_numeric_integer(env.timeout) ? intval(env.timeout) : CONFIGS.environment.timeout;
            CONFIGS.environment.public = is_boolean(env.public) ? env.public : CONFIGS.environment.public;
            CONFIGS.environment.port = is_numeric_integer(env.port) ? intval(env.port) : CONFIGS.environment.port;
            CONFIGS.environment.ssl = !is_object(env.ssl) ? CONFIGS.environment.ssl : env.ssl;
            if (!is_boolean(CONFIGS.environment.ssl.enable)) {
                CONFIGS.environment.ssl.enable = null;
            }
            if (!is_string(CONFIGS.environment.ssl.key)) {
                CONFIGS.environment.ssl.key = '';
            }
            if (!is_string(CONFIGS.environment.ssl.cert)) {
                CONFIGS.environment.ssl.cert = '';
            }
            if (CONFIGS.environment.ssl.enable === null) {
                CONFIGS.environment.ssl.enable = !!CONFIGS.environment.ssl.key && !!CONFIGS.environment.ssl.cert;
            }
            if (is_integer(CONFIGS.environment.port) && (CONFIGS.environment.port < 1) || CONFIGS.environment.port > 65535) {
                CONFIGS.environment.port = null;
            }
            delete env.remove_x_powered_by;
            delete env.ssl;
            delete env.public;
            delete env.port;
            delete env.timeout;
            if (is_object(env.directory)) {
                for (let key in env.directory) {
                    if (!is_string(env.directory[key])) {
                        continue;
                    }
                    CONFIGS.environment.directory[key] = is_string(env.directory[key]) ? env.directory[key] : CONFIGS.environment.directory[key];
                }
                delete env.directory;
            }
            for (let key in env) {
                CONFIGS.environment[key] = env[key];
            }
        }
    } catch (err) {
        // pass
    }
}

if (NODE_ENV !== '') {
    CONFIGS.environment.mode = NODE_ENV.startsWith('prod') ? 'production' : (
        NODE_ENV.startsWith('dev') ? 'development' : (
            NODE_ENV.startsWith('test') ? 'test' : CONFIGS.environment.mode
        )
    );
}
if (NODE_PORT > 0 && NODE_PORT < 65536) {
    CONFIGS.environment.port = NODE_PORT;
}
if (NODE_TIMEOUT > 0) {
    CONFIGS.environment.timeout = NODE_TIMEOUT;
}
if (NODE_LANGUAGE !== '' && NODE_LANGUAGE.length === 2) {
    CONFIGS.environment.language = NODE_LANGUAGE.toLowerCase();
}
if (!CONFIGS.environment.mode) {
    CONFIGS.environment.mode = 'production';
} else {
    let env_ = CONFIGS.environment.mode.trim().toLowerCase();
    CONFIGS.environment.mode = env_.startsWith('prod') ? 'production' : (
        env_.startsWith('dev') ? 'development' : (
            env_.startsWith('test') ? 'test' : CONFIGS.environment.mode
        )
    );
}
DIRS.storage = CONFIGS.environment.directory.storage;
DIRS.public = CONFIGS.environment.directory.public;
DIRS.migrations = CONFIGS.environment.directory.migrations;

export const STORAGE_DIR = DIRS.storage;
export const PUBLIC_DIR = DIRS.public;
export const MIGRATION_DIR = DIRS.migrations;

for (let key in DIRS) {
    if (!existsSync(DIRS[key])) {
        mkdirSync(DIRS[key], {recursive: true});
    }
}

glob.sync(resolvePath(CONFIG_DIR, '*.yaml')).forEach(file => {
    let name = path.basename(file, '.yaml');
    // exclude environment and example files
    if (name === 'environment' || name.endsWith('.example')) {
        return;
    }
    try {
        let config = parse(replacePlaceHolder(readFileSync(file)));
        if (is_object(config)) {
            CONFIGS[name] = config;
        }
        config = null;
    } catch (err) {
        // pass
    }
});

for (let key in CONFIGS) {
    if (is_object(CONFIGS[key])) {
        CONFIGS[key] = replacePlaceHolder(CONFIGS[key]);
    }
}

if (!is_boolean(CONFIGS['cache'].enable)) {
    CONFIGS['cache'].enable = !!CONFIGS['cache'].enable;
}

/**
 * Configuration
 */
export class Configuration {

    /**
     * Config
     * @type {{[key: string]: any|Configuration}}
     */
    #config = {};

    /**
     * Config constructor
     * @param {any} config
     */
    constructor(config) {
        if (Object.prototype.toString.call(config) === '[object Object]') {
            for (let key in config) {
                if (Object.prototype.toString.call(config[key]) === '[object Object]') {
                    this.#config[key] = new Configuration(config[key]);
                    continue;
                }
                this.#config[key] = config[key];
            }
        } else if (is_array(config)) {
            for (let key in config) {
                if (Object.prototype.toString.call(config[key]) === '[object Object]') {
                    this.#config[key] = new Configuration(config[key]);
                    continue;
                }

                this.#config[key.toString()] = config[key];
            }
        }
    }

    /**
     * Check if environment is production
     *
     * @return {boolean}
     */
    get is_development() {
        return this.environment_mode === 'development';
    }

    /**
     * Check if environment is production
     *
     * @return {boolean}
     */
    get is_test() {
        return this.environment_mode === 'test';
    }

    /**
     * Check if environment is production
     *
     * @return {boolean}
     */
    get is_production() {
        return !this.is_development && !this.is_test;
    }

    /**
     * Get environment mode
     *
     * @return {string}
     */
    get environment_mode() {
        return Config.get('environment.mode');
    }

    /**
     * Get config length
     *
     * @return {number}
     */
    get length() {
        return Object.keys(this.#config).length;
    }

    /**
     * Check if config has key
     *
     * @param {string|number} key the key to check
     * @return {boolean}
     */
    has(key) {
        return is_scalar(key) ? this.#config.hasOwnProperty(strval(key)) : false;
    }

    /**
     * @param {string|number} key
     * @param {any} defaultValue
     * @return {any}
     */
    get(key, defaultValue = null) {
        key = strval(key);
        if (!this.has(key)) {
            if (key.includes('.')) {
                let keys = key.split('.');
                let config = this.getObject() || {};
                for (let key of keys) {
                    if (!config.hasOwnProperty(key)) {
                        return defaultValue;
                    }
                    config = config[key];
                }
                return config;
            }
            return defaultValue;
        }
        return this.#config[key] || defaultValue;
    }

    /**
     * @param key
     * @return {{[key: string]: any|{[key: string]: any}}|undefined}
     */
    getObject(key) {
        if (arguments.length === 0) {
            let val = {};
            for (let key in this.#config) {
                let value = this.#config[key];
                if (value instanceof Configuration) {
                    val[key] = value.getObject();
                    continue;
                }
                val[key] = value;
            }
            return val;
        }
        let value = this.get(key, null);
        if (!value || !(value instanceof Configuration)) {
            return undefined;
        }
        return value.getObject();
    }

    /**
     * Get entries
     *
     * @return {[string, any|Configuration][]}
     */
    entries() {
        return Object.entries(this.#config);
    }

    /**
     * Get values
     *
     * @return {[any|Configuration][]}
     */
    values() {
        return Object.values(this.#config);
    }

    /**
     * Get keys
     *
     * @return {string[]}
     */
    keys() {
        return Object.keys(this.#config);
    }

    /**
     * Loop through each config
     *
     * @param {(key: string, value: any) => any} callback
     */
    each(callback) {
        if (!is_function(callback)) {
            return;
        }
        const config = Object.assign({}, this.#config);
        if (is_async_function(callback)) {
            callback = (value, key, obj) => callback(value, key, obj).catch(() => undefined);
        }
        for (let key in this.#config) {
            callback(this.#config[key], key, config);
        }
    }

    /**
     * Loop through each config
     *
     * @param {(key: number, value: any) => any} callback
     */
    forEach(callback) {
        if (!is_function(callback)) {
            return;
        }
        Object.values(this.#config).forEach(callback);
    }

    /**
     * @return {[string, any][]}
     */
    [Symbol.iterator]() {
        return this.entries();
    }
}

const Config = new Configuration(CONFIGS);
export default Config;
