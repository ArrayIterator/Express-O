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
    is_integer,
    is_numeric_integer,
    is_object,
    is_scalar,
    is_string
} from "../helpers/Is.js";
import {ip_version, is_bogon_ip, is_broadcast_ip} from "../helpers/Ip.js";
import {createSecureContext} from "node:tls";

const getEnvOf = (key) => {
    const processENV = strval(process.env[key]).toLowerCase().trim();
    key = key.toLowerCase().replace('_', '-');
    let env = processENV;
    for (let index in process.argv) {
        if (process.argv[index].startsWith(`--${key}`)) {
            index = intval(index);
            const val = strval(process.argv[index]).trim();
            env = '';
            if (val.startsWith(`--${key}=`)) {
                env = val.substring(key.length + 3).trim();
            }
            if (env === '' || index < process.argv.length - 1) {
                env = strval(process.argv[index + 1]).trim();
            }
            env = env.trim();
            env = env === '' ? processENV : env;
            break;
        }
    }
    return env;
}

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

export const PRODUCTION_NAME_MODE = 'production';
export const DEVELOPMENT_NAME_MODE = 'development';
export const TEST_NAME_MODE = 'test';
export const ENVIRONMENT_MODES = [PRODUCTION_NAME_MODE, DEVELOPMENT_NAME_MODE, TEST_NAME_MODE];
export const SRC_DIR = resolvePath(import.meta.dirname, '../');
export const APP_DIR = resolvePath(SRC_DIR, '../');
export const ROOT_DIR = resolvePath(APP_DIR, '../');
export const CONFIGS_DIR = resolvePath(APP_DIR, 'configs');
export const CONTROLLERS_DIR = resolvePath(APP_DIR, 'controllers');
export const LANGUAGES_DIR = resolvePath(APP_DIR, 'languages');
export const MIDDLEWARES_DIR = resolvePath(APP_DIR, 'middlewares');
export const VIEWS_DIR = resolvePath(APP_DIR, 'views');
export const SRC_VIEWS_DIR = resolvePath(SRC_DIR, 'views');
export const MODELS_DIR = resolvePath(APP_DIR, 'models');
export const MIGRATIONS_DIR = resolvePath(APP_DIR, 'migrations');
export const ENTITIES_DIR = resolvePath(APP_DIR, 'entities');
export const SEEDERS_DIR = resolvePath(APP_DIR, 'seeders');

/**
 * Environment References
 *
 * @type {string}
 */
export const NODE_MODE = getEnvOf('MODE');
/**
 * Port References
 *
 * @type {string}
 */
export const NODE_PORT = getEnvOf('PORT');
/**
 * Timeout References
 *
 * @type {number}
 */
export const NODE_TIMEOUT = intval(getEnvOf('TIMEOUT'));
/**
 * Language References
 *
 * @type {string}
 */
export const NODE_LANGUAGE = getEnvOf('LANG');
/**
 * IP References
 *
 * @type {string}
 */
export const NODE_IP = getEnvOf('IP');
/**
 * SSL key References
 *
 * @type {string}
 */
let ssl_key = getEnvOf('SSL_KEY');
if (ssl_key) {
    ssl_key = resolvePath(process.cwd(), ssl_key);
}
/**
 * SSL key References
 *
 * @type {string}
 */
export const NODE_SSL_KEY = ssl_key;
let ssl_cert = getEnvOf('SSL_CERT');
if (ssl_cert) {
    ssl_cert = resolvePath(process.cwd(), ssl_cert);
}
/**
 * SSL cert References
 *
 * @type {string}
 */
export const NODE_SSL_CERT = ssl_cert;

/**
 * SSL enable References
 *
 * @type {"true"|"false"}
 */
let enable_ssl = getEnvOf('SSL_ENABLE').trim().toLowerCase();
    enable_ssl = enable_ssl === '1' ? 'true' : (enable_ssl === '0' ? 'false' : enable_ssl);
/**
 * SSL enable References
 *
 * @type {string}
 */
export const NODE_SSL_ENABLE = enable_ssl;

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
 * }}
 */
const DIRS = {
    // alias of src_dir
    src: SRC_DIR,
    source: SRC_DIR,

    // alias of app_dir
    app: APP_DIR,
    application: APP_DIR,

    // alias of root_dir
    root: ROOT_DIR,
    main: ROOT_DIR,

    // alias of config_dir
    config: CONFIGS_DIR,
    configs: CONFIGS_DIR,
    configuration: CONFIGS_DIR,

    // alias of middlewares
    middlewares: MIDDLEWARES_DIR,

    // alias of language_dir
    language: LANGUAGES_DIR,
    lang: LANGUAGES_DIR,
    languages: LANGUAGES_DIR,

    // alias of views_dir
    views: VIEWS_DIR,

    // alias of models_dir
    models: MODELS_DIR,
    // alias of migrations_dir
    migrations: MIGRATIONS_DIR,
    // alias of entities_dir
    entities: ENTITIES_DIR,

    // alias of seeders_dir
    seeders: SEEDERS_DIR,

    // aliases of controller_dir
    routes: CONTROLLERS_DIR,
    controllers: CONTROLLERS_DIR,
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
        mode: PRODUCTION_NAME_MODE,
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
        }
    },
    cache: {},
    database: {
        production: {
            driver: null,
            user: null,
            password: null,
            host: 'localhost',
            port: null,
            dbname: null,
            charset: null,
            collation: null,
            prefix: null
        },
        development: {
            driver: null,
            user: null,
            password: null,
            host: 'localhost',
            port: null,
            dbname: null,
            charset: null,
            collation: null,
            prefix: null
        },
    },
    log: {}
};

// build environment
if (existsSync(resolvePath(CONFIGS_DIR, 'environment.yaml'))) {
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
         *          public?: string
         *     }
         * }}
         */
        let env = replacePlaceHolder(readFileSync(resolvePath(CONFIGS_DIR, 'environment.yaml')));
        env = parse(env);
        if (is_object(env)) {
            ['mode', 'timezone', 'language', 'ip'].forEach(key => {
                CONFIGS.environment[key] = is_string(env[key]) ? env[key] : CONFIGS_DIR[key];
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
if (NODE_MODE !== '') {
    CONFIGS.environment.mode = NODE_MODE.includes('prod') ? PRODUCTION_NAME_MODE : (
        NODE_MODE.includes('dev') ? DEVELOPMENT_NAME_MODE : (
            NODE_MODE.includes('tes') ? TEST_NAME_MODE : CONFIGS.environment.mode
        )
    );
}
if (ip_version(NODE_IP) && !is_broadcast_ip(NODE_IP) && is_bogon_ip(NODE_IP)) {
    CONFIGS.environment.ip = NODE_IP;
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
    CONFIGS.environment.mode = PRODUCTION_NAME_MODE;
} else {
    // only accept test/production/development
    let env_ = CONFIGS.environment.mode.trim().toLowerCase();
    CONFIGS.environment.mode = env_.includes('prod') ? PRODUCTION_NAME_MODE : (
        env_.includes('dev') ? DEVELOPMENT_NAME_MODE : (
            env_.includes('tes') ? TEST_NAME_MODE : PRODUCTION_NAME_MODE
        )
    );
}
if (NODE_SSL_ENABLE === 'false') {
    CONFIGS.environment.ssl.enable = false;
} else if (NODE_SSL_ENABLE === 'true') {
    CONFIGS.environment.ssl.enable = true;
}

/**
 * SSL REFERENCES
 * if ssl key & ssl certificate is provided will enable buy default,
 * and it should not port 80
 */
if (intval(CONFIGS.environment.port) !== 80
    && NODE_SSL_CERT !== ''
    && NODE_SSL_KEY !== ''
    && existsSync(NODE_SSL_CERT)
    && existsSync(NODE_SSL_KEY)
) {
    // tes cert
    try {
        // check if cert valid ssl cert
        createSecureContext({
            key: readFileSync(NODE_SSL_KEY, 'utf8'),
            cert: readFileSync(NODE_SSL_CERT, 'utf8')
        });
        if (!is_object(CONFIGS.environment.ssl)) {
            CONFIGS.environment.ssl = {};
        }
        if (NODE_SSL_ENABLE === 'false') {
            CONFIGS.environment.ssl.enable = false;
        } else if (NODE_SSL_ENABLE === 'true') {
            CONFIGS.environment.ssl.enable = true;
        } else {
            CONFIGS.environment.ssl.enable = true;
        }
        CONFIGS.environment.ssl.key = NODE_SSL_KEY;
        CONFIGS.environment.ssl.cert = NODE_SSL_CERT;
    } catch (e) {
        // use default
    }
}

DIRS.storage = CONFIGS.environment.directory.storage;
DIRS.public = CONFIGS.environment.directory.public;

export const STORAGE_DIR = DIRS.storage;
export const PUBLIC_DIR = DIRS.public;
export const LOGS_DIR = resolvePath(STORAGE_DIR, 'logs');
export const CACHES_DIR = resolvePath(STORAGE_DIR, 'caches');
export const REACT_ENGINES_DIR = resolvePath(STORAGE_DIR, 'react-engines');

// env
export const ENVIRONMENT_MODE = CONFIGS.environment.mode;
export const VIEW_DIR = resolvePath(VIEWS_DIR, ENVIRONMENT_MODE);
export const MODEL_DIR = resolvePath(MODELS_DIR, ENVIRONMENT_MODE);
export const MIGRATION_DIR = resolvePath(MIGRATIONS_DIR, ENVIRONMENT_MODE);
export const ENTITY_DIR = resolvePath(ENTITIES_DIR, ENVIRONMENT_MODE);
export const CONTROLLER_DIR = resolvePath(CONTROLLERS_DIR, ENVIRONMENT_MODE);
export const SEEDER_DIR = resolvePath(SEEDERS_DIR, ENVIRONMENT_MODE);
export const MIDDLEWARE_DIR = resolvePath(MIDDLEWARES_DIR, ENVIRONMENT_MODE);
export const LOG_DIR = resolvePath(LOGS_DIR, ENVIRONMENT_MODE);
export const CACHE_DIR = resolvePath(CACHES_DIR, ENVIRONMENT_MODE);
export const REACT_ENGINE_DIR = resolvePath(REACT_ENGINES_DIR, ENVIRONMENT_MODE);

// Placeholders
DIRS['view'] = VIEW_DIR;
DIRS['model'] = MODEL_DIR;
DIRS['migration'] = MIGRATION_DIR;
DIRS['entity'] = ENTITY_DIR;
DIRS['controller'] = CONTROLLER_DIR;
DIRS['route'] = CONTROLLER_DIR;
DIRS['seeder'] = SEEDER_DIR;
DIRS['middleware'] = MIDDLEWARE_DIR;
DIRS['logs'] = LOGS_DIR;
DIRS['log'] = LOG_DIR;
DIRS['caches'] = CACHES_DIR;
DIRS['cache'] = CACHE_DIR;

/**
 * Directories checked notes
 *
 * @type {{[key:string]: true}|null}
 */
let checked = {};
for (let key in DIRS) {
    // prevent multiple checks
    if (checked[DIRS[key]]) {
        continue;
    }
    checked[DIRS[key]] = true;
    if (!existsSync(DIRS[key])) {
        mkdirSync(DIRS[key], {recursive: true});
    }
}
// freed
checked = null;

glob.sync(resolvePath(CONFIGS_DIR, '*.yaml')).forEach(file => {
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
        return this.environment_mode === DEVELOPMENT_NAME_MODE;
    }

    /**
     * Check if environment is production
     *
     * @return {boolean}
     */
    get is_test() {
        return this.environment_mode === TEST_NAME_MODE;
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
        return ENVIRONMENT_MODE;
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
