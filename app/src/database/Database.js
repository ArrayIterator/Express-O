// noinspection JSUnusedGlobalSymbols

/**
 * @typedef {any&{}} TRecord
 * @typedef {any[]} TResult
 * @typedef {any} T
 * @typedef {any} T1
 * @typedef {any} T2
 * @typedef {string} K
 * @typedef {TRecord & {}} TRecord2
 * @typedef {TResult & {}} TResult2
 * @typedef {unknown extends T ? unknown : T} AnyToUnknown<T>
 * @typedef {object} DeferredKeySelection<TRecord, K>
 */

import {Model as KnexModel} from "objection";
import {ENVIRONMENT_MODE, ENVIRONMENT_MODES} from "../app/Config.js";
import {is_string} from "../helpers/Is.js";
import Connection, {CreateDefaultKnexConfiguration} from "./Connection.js";

/**
 * Database Wrapper
 */
export class DatabaseWrapper {
    /**
     * @type {Connection}
     * @private
     */
    #connection;

    /**
     * @type {string|"production"|"development"|"test"}
     */
    mode;

    /**
     * Constructor
     */
    constructor(mode = null) {
        mode = is_string(mode) ? mode.trim().toLowerCase() : ENVIRONMENT_MODE;
        this.mode =  ENVIRONMENT_MODES.includes(mode) ? mode : ENVIRONMENT_MODE;
        Object.defineProperties(this, {
            mode: {
                value: this.mode,
                writable: false,
                enumerable: false,
            },
            connect: {
                value: this.connect.bind(this),
                enumerable: false,
                writable: false,
            },
            connection: {
                get: () => this.connect().#connection,
                enumerable: false,
            }
        })
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
        this.#connection = new Connection(CreateDefaultKnexConfiguration(this.mode));
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

export const Database = new DatabaseWrapper(ENVIRONMENT_MODE);
export const Model = Database.Model;
export const Builder = () => Database.queryBuilder;
export default Database;
