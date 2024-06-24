// noinspection JSUnusedGlobalSymbols

import {Model as KnexModel} from "objection";
import Config from "../app/Config.js";
import {is_object, is_string} from "../helpers/Is.js";
import RuntimeException from "../errors/exceptions/RuntimeException.js";
import {__} from "../l10n/Translator.js";
import Connection from "./Connection.js";

/**
 * @typedef {any&{}} TRecord
 * @typedef {any[]} TResult
 * @typedef {any} T
 * @typedef {any} T1
 * @typedef {any} T2
 * @typedef {string} K
 * @typedef {unknown extends T ? unknown : T} AnyToUnknown<T>
 * @typedef {object} DeferredKeySelection<TRecord, K>
 */
export class DatabaseWrapper {
    /**
     * @type {Connection}
     * @private
     */
    #connection;

    /**
     * Constructor
     */
    constructor() {
        Object.defineProperty(this, 'connect', {
            value: this.connect.bind(this),
            enumerable: false,
            writable: false,
        })
        Object.defineProperty(this, 'connection', {
            get: () => this.connect().#connection,
            enumerable: false,
        });
    }

    /**
     * Get connection
     *
     * @return {Connection}
     */
    get connection() {
        return this.connect().#connection;
    }

    /**
     * Get knex instance
     *
     * @return {KnexInstance&{connection_configuration: DatabaseConfiguration}}
     */
    get knex() {
        return this.connection.knex;
    }

    /**
     * Model
     *
     * @return {Model}
     * @constructor
     */
    get Model() {
        this.connect();
        return KnexModel;
    }

    /**
     * Ping
     *
     * @return {Promise<T | boolean>}
     */
    ping() {
        return new Promise((resolve) => {
            this
                .connection
                .raw('SELECT 1')
                .then(() => resolve(true))
                .catch(() => resolve(false));
        });
    }

    /**
     * Init
     *
     * @return {this}
     */
    connect() {
        if (this.#connection) {
            return this;
        }

        const configs = Config.getObject('database');
        const environment = Config.environment_mode;
        let config;
        if (is_object(configs[environment])) {
            config = configs[environment];
        } else if (is_object(configs.default)) {
            config = configs.default;
        } else {
            if (Config.is_production) {
                if (!is_object(configs['prod'])) {
                    throw new RuntimeException(
                        __('Database configuration not found')
                    );
                }
                config = configs['prod'];
            } else {
                if (Config.is_test && is_object(configs['test'])) {
                    config = configs['test'] || undefined;
                } else if (Config.is_development && is_object(configs['development'])) {
                    config = configs['development'] || undefined;
                } else if (Config.is_development && is_object(configs['dev'])) {
                    config = configs['dev'] || undefined;
                } else if (is_string(configs.driver)
                    && /(sqlite|mysql|postgre|oracle|mssql)/.test(configs.driver.toLowerCase())
                ) {
                    config = configs;
                }

                if (!config) {
                    throw new RuntimeException(
                        __('Database configuration not found')
                    );
                }
            }
        }
        this.#connection = new Connection(config);
        KnexModel.knex(this.knex);
        return this;
    }

    /**
     * Destroy connection
     *
     * @return {Promise<boolean>}
     */
    destroy() {
        return new Promise(async (resolve, reject) => {
            if (this.#connection) {
               return await this.#connection.destroy().then((e) => {
                    this.#connection = null;
                    resolve(e);
                }).catch((e) => {
                    this.#connection = null;
                    reject(e);
                });
            }
            resolve(true);
            return true;
        })
    }

    /**
     * Get Query Builder
     *
     * @template {TRecord & {}} TRecord2
     * @template {TResult & {}} TResult2
     * @return {knex.QueryBuilder<TRecord2, TResult2>}
     */
    get queryBuilder() {
        return this.connection.queryBuilder;
    }

    /**
     * Select query builder
     *
     * @param {string} selects
     * @return {knex.QueryBuilder<knex.TableType<knex.TableNames>, DeferredKeySelection.ReplaceBase<TResult, knex.ResolveTableType<knex.TableType<knex.TableNames>>>>}
     */
    select(selects = '*') {
        return this.queryBuilder.select(selects);
    }
}

const Database = new DatabaseWrapper();
export const Model = Database.Model;
export const Builder = () => Database.queryBuilder;
export default Database;
