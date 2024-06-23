// noinspection JSUnusedGlobalSymbols

import {Model} from "objection";
import Knex from "knex";
import Config from "../app/Config.js";
import {is_boolean, is_numeric_integer, is_object, is_string} from "../helpers/Is.js";
import RuntimeException from "../errors/exceptions/RuntimeException.js";
import {__} from "../l10n/Translator.js";
import {intval} from "../helpers/DataType.js";

export const DEFAULT_DRIVER = 'mysql';

/**
 * @typedef {any} TRecord
 * @typedef {any} TResult
 * @typedef {any} T
 * @typedef {any} T1
 * @typedef {any} T2
 * @typedef {string} K
 * @typedef {unknown extends T ? unknown : T} AnyToUnknown<T>
 * @typedef {object} DeferredKeySelection<TRecord, K>
 * @typedef {AnyToUnknown<T1> extends any[] ? T2[] : T2} ArrayIfAlready<T1, T2>
 */
export class DatabaseWrapper {
    /**
     * Current config
     *
     * @type {{
     *    [key: string]: any
     * }}
     * @private
     */
    _selectedConfig;
    /**
     * Has init
     *
     * @type {boolean}
     */
    #hasInit = false;

    /**
     * Constructor
     */
    constructor() {
        Object.defineProperty(this, 'init', {
            enumerable: false,
            writable: false,
        })
    }

    /**
     * @type {Knex<TRecord, TResult>}
     * @private
     */
    _knex;

    /**
     * Get Knex connection
     *
     * @return {Knex<TRecord, TResult>}
     */
    get knex() {
        return this.init()._knex;
    }

    /**
     * Global config
     *
     * @type {{[env: string]: {
     *     [key: string]: any
     * }}}
     * @private
     */
    _config;

    /**
     * Get config
     *
     * @return {{[p: string]: *}}
     */
    get config() {
        return this.init()._selectedConfig;
    }

    /**
     * Get Knex
     *
     * @alias this.knex()
     * @return {Knex<TRecord, TResult>}
     * @constructor
     */
    get Knex() {
        return this.knex;
    }

    /**
     * Model
     *
     * @return {Model}
     * @constructor
     */
    get Model() {
        this.init();
        return Model;
    }

    /**
     * Init
     *
     * @return {this}
     */
    init() {
        if (this.#hasInit) {
            return this;
        }
        this.#hasInit = true;
        this._config = Config.getObject('database');
        const environment = Config.environment_mode;
        if (is_object(this._config[environment])) {
            this._selectedConfig = this._config[environment];
        } else if (is_object(this._config.default)) {
            this._selectedConfig = this._config.default;
        } else {
            if (Config.is_production) {
                if (!is_object(this._config['prod'])) {
                    throw new RuntimeException(
                        __('Database configuration not found')
                    );
                }
                this._selectedConfig = this._config['prod'];
            } else {
                if (Config.is_test && is_object(this._config['test'])) {
                    this._selectedConfig = this._config['test'] || undefined;
                } else if (Config.is_development && is_object(this._config['development'])) {
                    this._selectedConfig = this._config['development'] || undefined;
                } else if (Config.is_development && is_object(this._config['dev'])) {
                    this._selectedConfig = this._config['dev'] || undefined;
                } else if (is_string(this.config.driver)
                    && /(sqlite|mysql|postgre|oracle|mssql)/.test(this.config.driver.toLowerCase())
                ) {
                    this._selectedConfig = this._config;
                }

                if (!this._selectedConfig) {
                    throw new RuntimeException(
                        __('Database configuration not found')
                    );
                }
            }
        }
        let driver = this.config.driver || this.config.adapter || DEFAULT_DRIVER;
        driver = !is_string(driver) ? DEFAULT_DRIVER : driver.trim().toLowerCase();
        driver = driver.includes('mysql') ? 'mysql' : (
            driver.includes('sqlite') ? 'sqlite3' : (
                driver.includes('postgre') ? 'postgres' : driver
            )
        );
        this._selectedConfig.client = driver;
        const defaultPort = (driver) => {
            driver = driver.trim().toLowerCase();
            switch (driver) {
                case 'mysql':
                    return 3306;
                case 'sqlite':
                case 'sqlite3':
                    return 0;
                case 'postgres':
                case 'postgresql':
                    return 5432;
                case 'mssql':
                    return 1433;
                default:
                    return null;
            }
        }
        let connection = {
            host: is_string(this.config.host) ? this.config.host : '127.0.0.1',
            user: is_string(this.config.user) && this.config.user ? this.config.user : (
                is_string(this.config.username) ? this.config.username : 'root'
            ),
            password: is_string(this.config.password) ? this.config.password : '',
            port: driver.includes('sqlite') ? null : (is_numeric_integer(this.config.port) && (
                intval(this.config.port) > 0 && intval(this.config.port) < 65535
            ) ? intval(this.config.port) : defaultPort(driver)),
            unixSocket: is_string(this.config.socket) ? this.config.socket : null,
            db: is_string(this.config.database) ? this.config.database : null,
            charset: is_string(this.config.charset) ? this.config.charset : 'utf8',
        };
        if (driver.includes('sqlite')) {
            let fileName = is_string(this.config.filename)
                ? this.config.filename
                : (
                    is_string(this.config.database) ? this.config.database : null
                );
            if (!is_string(fileName)) {
                throw new RuntimeException(
                    __('Database filename not found')
                );
            }
            connection.filename = fileName;
        }
        connection = {...this.config, connection};
        this._knex = Knex({
            debug: is_boolean(this.config.debug) || Config.is_test,
            client: driver,
            dialect: is_string(this.config.dialect) ? this.config.dialect : null,
            useNullAsDefault: is_boolean(this.config.null) ? this.config.null : null,
            connection
        })
        Model.knex(this.knex);
        return this;
    }

    /**
     * Get table
     *
     * @param tableName
     * @return {Knex.QueryBuilder}
     */
    table(tableName) {
        return this.knex(tableName);
    }

    /**
     * Select Query builder
     *
     * @param {string} tableName
     * @param {string} selects
     * @return {Knex.QueryBuilder<TRecord, ArrayIfAlready<TResult, DeferredKeySelection<TRecord, string>>>}
     */
    select(tableName, selects = '*') {
        return this.table(tableName).select(selects);
    }
}

const Database = new DatabaseWrapper();
export const Model = Database.Model;
export default Database;
