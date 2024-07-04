/**
 * @typedef {"cockroachdb"|"sqlite3"|"redshift"|"oracledb"|"postgres"|"mssql"|"mysql2"} DriverName
 * @typedef {"cockroachdb"|"sqlite3"|"redshift"|"oracledb"|"postgres"|"mssql"|"mysql2"} Dialect
 * @typedef {{
 *      debug?:boolean,
 *      nullable?:boolean,
 *      driver: string,
 *      user: ?string,
 *      password: ?string,
 *      dialect: ?Dialect,
 *      host: ?string,
 *      port: number,
 *      unix_socket?: ?string,
 *      database: ?string,
 *      filename: ?string,
 *      timezone: ?string,
 *      timeout?: number,
 *      connect_timeout?:number,
 *      prefix: string,
 *      pool?: number,
 *      migration_table: string,
 *      query_timeout?: number,
 *      environment: "production"|"development"|"test",
 *      [key: string]: any
 * }} DatabaseConfiguration
 * @typedef {any} TRecord
 * @typedef {any[]} TResult
 * @typedef {TResult & any} TResult2
 * @typedef {TRecord & {}} TRecord2
 * @typedef {KnexFn.Knex} KnexInstance
 */

import {
    is_array,
    is_boolean,
    is_number,
    is_numeric,
    is_numeric_integer,
    is_object,
    is_string
} from "../helpers/Is.js";
import InvalidArgumentException from "../errors/exceptions/InvalidArgumentException.js";
import {__} from "../l10n/Translator.js";
import {sprintf} from "../helpers/Formatting.js";
import {floatval, intval, strval} from "../helpers/DataType.js";
import KnexFn from "knex";
import Config, {
    ENVIRONMENT_MODE,
    ENVIRONMENT_MODES,
    MIGRATIONS_DIR,
    PRODUCTION_NAME_MODE,
    SEEDERS_DIR,
    TEST_NAME_MODE
} from "../app/Config.js";
import {resolve as resolvePath} from "node:path";
import RuntimeException from "../errors/exceptions/RuntimeException.js";
import {readFileSync} from "node:fs";

/**
 * Drivers regex
 *
 * @type {RegExp}
 */
const DRIVER_REGEX = /((?<mysql2>mysq)|(?<sqlite3>sqlite)|(?<postgres>postgre)|(?<oracledb>oracle)|(?<mssql>mssql)|(?<redshift>reds)|(?<cockroachdb>cockr))/i;

/**
 * Default migration table
 *
 * @type {string}
 */
export const DEFAULT_MIGRATION_TABLE = 'knex_migration';

/**
 * Migration stub
 *
 * @file stub/migration.stub
 * @type {string}
 */
export const MIGRATION_STUB = resolvePath(import.meta.dirname, 'stub/migration.stub');

/**
 * Seed stub
 *
 * @file stub/seed.stub
 * @type {string}
 */
export const SEED_STUB = resolvePath(import.meta.dirname, 'stub/seed.stub');

/**
 * Drivers port
 *
 * @type {{[key: DriverName]: number}}
 */
const DRIVERS_PORT = {
    mysql2: 3306, // default using mysql2 for better feature
    sqlite3: 0,
    postgres: 5432,
    mssql: 1433,
    oracledb: 1521,
    // mongodb: 27017,
    redshift: 5439,
    cockroachdb: 26257,
};

/**
 * Dialects
 *
 * @type {{
 *      [key: DriverName]: Dialect
 * }}
 */
const DIALECTS = {
    mysql2: "mysql2", // default using mysql2 for better feature
    sqlite3: "better-sqlite3",
    postgres: "postgres",
    mssql: "mssql",
    oracledb: "oracledb",
    redshift: "redshift",
    cockroachdb: "cockroachdb",
};

/**
 * Default port
 *
 * @param driver
 * @return {number|null}
 */
export const DefaultPort = (driver) => {
    driver = NormalizeDriver(driver);
    if (!driver) {
        return null;
    }
    return DRIVERS_PORT.hasOwnProperty(driver)
        ? DRIVERS_PORT[driver]
        : null;
}

/**
 * Normalize driver
 *
 * @param {number|string} driver
 * @return {?DriverName}
 */
export const NormalizeDriver = (driver) => {
    if (is_numeric(driver)) {
        const port = intval(driver);
        return Object.keys(DRIVERS_PORT).find(key => DRIVERS_PORT[key] === port) || null;
    }
    driver = strval(driver).trim().toLowerCase();
    const match = driver.match(DRIVER_REGEX);
    if (!match || !match.groups) {
        return null;
    }
    for (let _driver in match.groups) {
        if (match.groups[_driver]) {
            return _driver;
        }
    }
    return null;
}

/**
 * Parse the dsn
 *
 * @param {string} dsn
 * @return {DatabaseConfiguration}
 */
export const ParseDSN = (dsn) => {
    if (!is_string(dsn)) {
        throw new InvalidArgumentException(
            sprintf(
                __('DSN must be a string. %s given.', dsn === null ? 'null' : typeof dsn),
            )
        );
    }
    dsn = dsn.trim();
    let driverMatch = dsn.match(/^([a-zA-Z_]+):\/*/);
    if (!driverMatch) {
        throw new InvalidArgumentException(
            __('Driver not found in DSN.'),
        )
    }
    driverMatch = driverMatch[1];
    const driver = NormalizeDriver(driverMatch);
    if (!driver) {
        throw new InvalidArgumentException(
            sprintf(
                __('Unsupported driver "%s" in DSN.'),
                driverMatch,
                dsn
            )
        );
    }
    const regexLoop = {
        user: /(?:^|\s*;)\s*(?:db|database)?user(?:name)?\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        password: /(?:^|\s*;)\s*(?:db|database)?pass(?:word)?\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        host: /(?:^|\s*;)\s*(?:db|database)?host(?:name)?\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        unix_socket: /(?:^|\s*;)\s*unix(?:_*sockets?)?\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        port: /(?:^|\s*;)\s*(?:db|database)?port\s*=\s*(['"]?)\s*(?<value>\D*)\1\s*(;|$)/i,
        database: /(?:^|\s*;)\s*(?:db|database|dbname)\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        filename: /(?:^|\s*;)\s*(?:db|database)?(?:file(?:name)?|path)\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        charset: /(?:^|\s*;)\s*(?:db|database)?(?:charset|character_*set)\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        collation: /(?:^|\s*;)\s*(?:db|database)?(?:collate|collation)\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        timezone: /(?:^|\s*;)\s*(?:db|database)?timezone\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        debug: /(?:^|\s*;)\s*(?:db|database)?debug\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        nullable: /(?:^|\s*;)\s*(?:db|database)?nullable\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        timeout: /(?:^|\s*;)\s*(?:db|database)?time_*out\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        query_timeout: /(?:^|\s*;)\s*(?:db|database)?query_time*out\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        pool: /(?:^|\s*;)\s*(?:db|database)?pools?\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        connect_timeout: /(?:^|\s*;)\s*(?:db|database)?connect_*time_*out\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        token: /(?:^|\s*;)\s*(?:db|database)?token\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        prefix: /(?:^|\s*;)\s*(?:db|database)?prefix\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        environment: /(?:^|\s*;)\s*(?:db|database)?environment\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
        migration_table: /(?:^|\s*;)\s*(?:db|database)?migration_*table\s*=\s*(['"]?)(?<value>[^\1;]*)\1\s*(;|$)/i,
    }
    const result = {
        debug: ENVIRONMENT_MODE === TEST_NAME_MODE,
        nullable: true,
        driver: driver,
        user: null,
        password: null,
        dialect: DIALECTS[driver] || null,
        host: '127.0.0.1',
        port: DefaultPort(driver),
        database: null,
        filename: null,
        timezone: null,
        connect_timeout: null,
        timeout: null,
        environment: ENVIRONMENT_MODE,
        prefix: '',
        query_timeout: null,
        pool: null,
        migration_table: DEFAULT_MIGRATION_TABLE
    };
    const skip_name = [
        'driver',
        'dialect',
    ];
    if (dsn.includes('=') && dsn.includes(';') && /^[a-zA-Z]:\/*[a-zA-Z_]+=/.test(dsn)) {
        dsn = dsn.replace(/^([a-zA-Z_]+):\/*/, '').replace(/^\/+/, '');
    } else {
        // dsn = dsn.replace(/^([a-zA-Z])+:\/*/, '').replace(/^\/+/, '');
        // parse like mysql://username:password/database?query=query_val&any
        const matchDSN = dsn.match(
            /^(<driver>[a-zA-Z]+):\/*(?<user>[^:]*):(?<password>[^\/@]*)(?:@(?<host>[^\/]+))?(?:\/+(?<database>[^?]+))?(?:\?+(?<query>.+))?$/
        );
        if (!matchDSN) {
            throw new InvalidArgumentException(
                __('Could not parse DSN')
            );
        }
        const groups = matchDSN.groups || {};
        const to_search = [
            'user',
            'password',
            'host',
            'database'
        ];
        to_search.forEach((key) => {
            if (groups.hasOwnProperty(key)) {
                if (groups[key]) {
                    skip_name.push(key);
                }
                result[key] = groups[key];
            }
        });
        dsn = groups.query || '';
    }
    // split query=value or query="value" or query='value'
    // eg: username="password" ; host=localhost;port='3306';dbname="test"
    for (let key in regexLoop) {
        // just safe for next match
        if (skip_name.includes(key)) {
            continue;
        }
        let match = dsn.match(regexLoop[key]);
        if (!match) {
            continue;
        }
        let value = match.groups['value'] || '';
        if (key === 'port') {
            value = intval(value);
        }
        if (value === '' && result.hasOwnProperty(key) && result[key] === null) {
            value = null;
        }
        result[key] = value;
    }
    if (is_string(result.debug)) {
        result.debug = result.debug.trim().toLowerCase();
    }
    if (is_string(result.nullable)) {
        result.debug = result.nullable.trim().toLowerCase();
    }
    result.debug = result.debug === true || result.debug === 'true' || result.debug === '1' || result.debug === 'yes';
    result.nullable = result.nullable === true || result.nullable === 'true' || result.nullable === '1' || result.nullable === 'yes';
    if (result.connect_timeout !== null) {
        if (is_numeric(result.connect_timeout)) {
            result.connect_timeout = is_numeric_integer(result.connect_timeout) ? intval(result.connect_timeout) : floatval(result.connect_timeout);
        } else {
            result.connect_timeout = null;
        }
    }
    if (result.timeout) {
        if (is_numeric(result.timeout)) {
            result.timeout = is_numeric_integer(result.timeout) ? intval(result.timeout) : floatval(result.timeout);
        } else {
            result.timeout = null;
        }
    }
    if (result.query_timeout) {
        if (is_numeric(result.query_timeout)) {
            result.query_timeout = is_numeric_integer(result.query_timeout) ? intval(result.query_timeout) : floatval(result.query_timeout);
        } else {
            result.query_timeout = null;
        }
    }
    if (!is_string(result.prefix)) {
        result.prefix = '';
    }
    if (is_numeric(result.pool)) {
        result.pool = intval(result.pool);
    }
    if (isNaN(result.pool) || result.pool < 1) {
        result.pool = null;
    }
    if (!is_string(result.migration_table) || result.migration_table.trim() === '') {
        result.migration_table = DEFAULT_MIGRATION_TABLE;
    } else {
        result.migration_table = result.migration_table.trim();
    }
    result.environment = is_string(result.environment) ? result.environment.trim().toLowerCase() : ENVIRONMENT_MODE;
    result.environment = ENVIRONMENT_MODES.includes(result.environment) ? result.environment : ENVIRONMENT_MODE;
    result.prefix = result.prefix.trim();
    return result;
}

/**
 * Normalize configuration
 *
 * @param {string|{[key: string]: string|any}} config
 * @return {DatabaseConfiguration}
 */
export const NormalizeConfiguration = (config) => {
    if (is_string(config)) {
        return ParseDSN(config);
    }
    if (!is_object(config)) {
        throw new InvalidArgumentException(
            sprintf(
                __('Database connection configuration must be an object. %s given.'),
                config === null ? 'null' : typeof config
            )
        );
    }
    let driver = is_string(config.driver) && config.driver ? config.driver : (
        is_string(config.adapter) ? config.adapter : null
    );
    if (!driver) {
        throw new InvalidArgumentException(
            __('Database driver not found in configuration.')
        );
    }
    const original_driver = driver;
    driver = NormalizeDriver(driver);
    if (!driver) {
        throw new InvalidArgumentException(
            sprintf(
                __('Unsupported driver "%s" in configuration.'),
                original_driver
            )
        );
    }
    const user = is_string(config.user) ? config.user : (
        (is_string(config.username) ? config.username : (
            is_string(config.dbuser) ? config.dbuser : (
                is_string(config.dbusername) ? config.dbusername : null
            )
        ))
    );
    const password = is_string(config.password)  ? config.password : (
        is_string(config.pass) ? config.pass : (
            is_string(config.dbpassword) ? config.dbpassword : (
                is_string(config.dbpass) ? config.dbpass : null
            )
        )
    );
    const host = is_string(config.host) ? config.host : (
        is_string(config.hostname) ? config.hostname : (
            is_string(config.dbhost) ? config.dbhost : (
                is_string(config.dbhostname) ? config.dbhostname : '127.0.0.1'
            )
        )
    );
    const port = is_numeric_integer(config.port) ? intval(config.port) : (
        is_numeric_integer(config.dbport) ? intval(config.dbport) : DefaultPort(driver)
    );
    const database = is_string(config.database) ? config.database : (
        is_string(config.dbname) ? config.dbname : null
    );
    const filename = is_string(config.filename) ? config.filename : (
        is_string(config.dbfilename) ? config.dbfilename : (
            is_string(config.dbfile) ? config.dbfile : null
        )
    )
    const timezone = is_string(config.timezone) ? config.timezone : (
        is_string(config.dbtimezone) ? config.dbtimezone : null
    )
    const unix_socket = is_string(config.unix_socket) ? config.unix_socket : (
        is_string(config.socket) ? config.socket : null
    );
    const pool = is_numeric(config.pool) && intval(config.pool) > 0 ? intval(config.pool) : (
        is_numeric(config.dbpool) && intval(config.dbpool) > 0 ? intval(config.dbpool) : null
    );
    const nullable = is_boolean(config.nullable) ? config.nullable : (
        is_boolean(config.dbnullable) ? config.dbnullable : true
    );
    const debug = is_boolean(config.debug) ? config.debug : (
        is_boolean(config.dbdebug) ? config.dbdebug : (
            ENVIRONMENT_MODE === TEST_NAME_MODE
        )
    );
    let environment = is_string(config.environment) ? config.environment.trim().toLowerCase() : (
        is_string(config.dbenvironment) ? config.dbenvironment.trim().toLowerCase() : ENVIRONMENT_MODE
    );
    environment = ENVIRONMENT_MODES.includes(environment) ? environment : ENVIRONMENT_MODE;
    const connect_timeout = is_numeric(config.connect_timeout) ? (
        is_numeric_integer(config.connect_timeout) ? intval(config.connect_timeout) : floatval(config.connect_timeout)
    ) : (
        is_numeric(config.dbconnect_timeout) ? (
            is_numeric_integer(config.dbconnect_timeout) ? intval(config.dbconnect_timeout) : floatval(config.dbconnect_timeout)
        ) : null
    );
    const timeout = is_numeric(config.timeout) ? (
        is_numeric_integer(config.timeout) ? intval(config.timeout) : floatval(config.timeout)
    ) : (
        is_numeric(config.dbtimeout) ? (
            is_numeric_integer(config.dbtimeout) ? intval(config.dbtimeout) : floatval(config.dbtimeout)
        ) : null
    );
    const query_timeout = is_numeric(config.query_timeout) ? (
        is_numeric_integer(config.query_timeout) ? intval(config.query_timeout) : floatval(config.query_timeout)
    ) : (
        is_numeric(config.dbquery_timeout) ? (
            is_numeric_integer(config.dbquery_timeout) ? intval(config.dbquery_timeout) : floatval(config.dbquery_timeout)
        ) : null
    );
    const migration_table = is_string(config.migration_table) && config.migration_table.trim() !== '' ? config.migration_table.trim() : (
        is_string(config.dbmigration_table) && config.dbmigration_table.trim() !== '' ? config.dbmigration_table.trim() : DEFAULT_MIGRATION_TABLE
    );
    const to_skip = [
        'user',
        'username',
        'dbuser',
        'dbusername',
        'password',
        'pass',
        'dbpass',
        'dbpassword',
        'host',
        'hostname',
        'dbhost',
        'dbhostname',
        'port',
        'dbport',
        'filename',
        'dbfilename',
        'dbfile',
        'timezone',
        'dbtimezone',
        'pool',
        'dbpool',
        'environment',
        'dbenvironment',
        'timeout',
        'dbtimeout',
        'connect_timeout',
        'dbconnect_timeout',
        'migration_table',
        'dbmigration_table',
    ];
    const result = {
        debug,
        nullable,
        driver,
        user,
        password,
        dialect: DIALECTS[driver] || null,
        host: host || '127.0.0.1',
        port: port || DefaultPort(driver),
        database,
        filename,
        timezone,
        unix_socket,
        connect_timeout,
        timeout,
        environment,
        prefix: '',
        pool,
        query_timeout,
        migration_table
    };
    for (let key in config) {
        if (to_skip.includes(key)) {
            continue;
        }
        result[key] = config[key]
    }
    return result;
}

/**
 * Create Knex configuration
 *
 * @param {string|{[key: string]: any}} config
 * @return {
 *  {
 *      useNullAsDefault: boolean,
 *      debug: boolean,
 *      dialect: string,
 *      migrations: {extension: string, directory: string, stub: string},
 *      seeds: {extension: string, directory: string, stub: string},
 *      pool: {min: number, max: number},
 *      client: string,
 *      connection: {
 *          database: string,
 *          host: string,
 *          charset?: string,
 *          user?: string,
 *          password?: string,
 *          compress?: boolean,
 *          connectionTimeout?: number,
 *          connTimeout?:number,
 *          timeout?: number,
 *          query_timeout?:number,
 *          collation?: string
 *      }
 *  }
 * }
 */
export const CreateKnexConfig = (config) => {
    config = NormalizeConfiguration(config);
    const connection = {
        host: config.host,
        database: config.database,
    };
    if (config.charset && is_string(config.charset)) {
        connection.charset = config.charset
    }
    if (config.user && is_string(config.user)) {
        connection.user = config.user
    }
    if (config.password && is_string(config.password)) {
        connection.password = config.password
    }
    if (config.hasOwnProperty('compress')) {
        config.compress = is_string(config.compress) ? config.compress.trim().toLowerCase() : config.compress;
        connection.compress = (
            config.compress === 1 || config.compress === 'true' || config.compress === '1' || config.compress === 'yes'
                ? true
                : (
                    is_boolean(config.compress) ? config.compress : (
                        config.compress === 'false' || config.compress === '0' || config.compress === 'no'
                            ? false
                            : !!config.compress
                    )
                )
        );
    }
    if (is_number(config.connect_timeout)) {
        connection.connectionTimeout = config.connect_timeout;
        connection.connTimeout = config.connect_timeout;
    }
    if (is_number(config.timeout)) {
        connection.timeout = config.timeout;
    }
    if (is_number(config.query_timeout)) {
        connection.query_timeout = config.query_timeout;
    }
    if (config.uri && is_string(config.uri)) {
        connection.uri = config.uri;
    }
    if (config.token && is_string(config.token)) {
        connection.token = config.token;
    }
    if (config.unix_socket && is_string(config.unix_socket)) {
        connection.socketPath = config.unix_socket;
    }
    if (is_boolean(config.debug)) {
        connection.debug = config.debug;
    } else {
        connection.debug = ENVIRONMENT_MODE !== PRODUCTION_NAME_MODE;
    }
    if (is_numeric_integer(config.pool)) {
        connection.pool = {
            min: config.pool > 2 ? 2 : 1,
            max: config.pool,
            // refreshIdle: true,
        }
    } else {
        connection.pool = {
            min: 2,
            max: 10,
            // refreshIdle: true,
        }
    }
    if (is_string(config.collation)) {
        connection.collation = config.collation;
    }
    return {
        seeds: {
            directory: resolvePath(SEEDERS_DIR, config.environment),
            extension: 'js',
            stub: SEED_STUB
        },
        migrations: {
            directory: resolvePath(MIGRATIONS_DIR, config.environment),
            extension: 'js',
            stub: MIGRATION_STUB
        },
        debug: connection.debug,
        client: config.driver,
        dialect: config.dialect,
        useNullAsDefault: config.nullable,
        connection: {
            ...connection,
            pool: {
                ...connection.pool,
                name: 'knex_pool@' + config.environment,
                refreshIdle: true,
            },
        },
        pool: connection.pool,
    };
}

/**
 * Create Knex object connection
 *
 * @param {string|{[key: string]: any}} config
 * @return {KnexInstance&{
 *     connection_configuration: DatabaseConfiguration
 * }}
 */
export const CreateKnexConnection = (config) => {
    const knex = KnexFn(CreateKnexConfig(config));
    const configuration = Object.assign({}, config);
    Object.freeze(configuration);
    Object.defineProperty(knex, 'connection_configuration', {
        value: configuration,
        writable: false,
        configurable: false
    })
    return knex;
}

/**
 * Create Default Knex Configuration
 *
 * @param {string} mode
 * @return {
 *  {
 *      useNullAsDefault: boolean,
 *      debug: boolean,
 *      dialect: string,
 *      migrations: {extension: string, directory: string},
 *      seeds: {extension: string, directory: string},
 *      pool: {min: number, max: number},
 *      client: string,
 *      connection: {
 *          database: string,
 *          host: string,
 *          charset?: string,
 *          user?: string,
 *          password?: string,
 *          compress?: boolean,
 *          connectionTimeout?: number,
 *          connTimeout?:number,
 *          timeout?: number,
 *          query_timeout?:number,
 *          collation?: string
 *      }
 *  }
 * }
 */
export const CreateDefaultKnexConfiguration = (mode = ENVIRONMENT_MODE) => {
    const configs = Config.getObject('database');
    const environment = is_string(mode) && ENVIRONMENT_MODES.includes(mode) ? mode : ENVIRONMENT_MODE;
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
    return CreateKnexConfig(config);
}

/**
 * Quote identifier
 *
 * @param {string|object|Array} identity
 */
export const QuoteIdentifier = (identity) => {
    if (is_object(identity)) {
        const obj = Object.assign({}, identity);
        for (let key in obj) {
            obj[key] = QuoteIdentifier(obj[key]);
        }
        return obj;
    }
    if (is_array(identity)) {
        return identity.map((value) => QuoteIdentifier(value));
    }
    if (!is_string(identity)) {
        identity = '*';
    }
    identity = identity.trim();
    if (identity === '*') {
        return '*';
    }
    if (identity.includes(',')) {
        let split_commas = identity.split(',').map((value) => value.trim());
        // filter empty
        split_commas = split_commas.filter((value) => value !== '');
        return QuoteIdentifier(split_commas).join(', ');
    }
    if (identity.includes('.')) {
        let split_dots = identity.split('.').map((value) => value.trim());
        // filter empty
        split_dots = split_dots.filter((value) => value !== '');
        return QuoteIdentifier(split_dots).join('.');
    }
    // check if started with ` or "
    if (identity.startsWith('`') || identity.endsWith('`')) {
        // replace ` with " on start & end
        return '"' + identity.substring(1, identity.length - 1) + '"';
    }
    if (identity.startsWith('"') || identity.endsWith('"')) {
        // replace ` with " on start & end
        return '"' + identity.substring(1, identity.length - 1) + '"';
    }
    // quote double quote
    return '"' + identity.replace(/"/g, '""') + '"';
}

/**
 * Connection
 */
export default class Connection {
    /**
     * Configuration
     *
     * @type {DatabaseConfiguration}
     * @private
     */
    #config;

    /**
     * Knex instance
     *
     * @type {KnexInstance&{
     *     connection_configuration: DatabaseConfiguration
     * }}
     */
    #knex;

    /**
     * Connection constructor
     *
     * @param {string|{host?:string, user?:string, port?: number, [key: string]: any}} config
     */
    constructor(config) {
        this.#config = config;
    }

    /**
     * Run raw
     *
     * @param {string|KnexFn.Knex.Value} value
     * @param {?KnexFn.Knex.RawBinding} binding
     * @return {KnexFn.Knex.Raw<TResult2>}
     */
    raw(value, binding = undefined) {
        return this.knex.raw(value, binding);
    }

    /**
     * Check if connected
     *
     * @return {boolean}
     */
    get connected() {
        if (this.#knex && this.#knex.client && this.#knex.client.pool && this.#knex.client.pool.destroyed === false) {
            return true;
        }
        this.#knex = undefined;
        return false;
    }

    /**
     * Knex
     *
     * @return {KnexInstance&{connection_configuration: DatabaseConfiguration}}
     */
    get knex() {
        if (!this.#knex || !this.connected) {
            this.#knex = CreateKnexConnection(this.#config);
            this.#config = this.#knex.connection_configuration;
        }
        return this.#knex;
    }

    /**
     * Destroy
     *
     * @return {Promise<boolean>}
     */
    destroy() {
        return new Promise((resolve, reject) => {
            if (this.connected && this.#knex && this.#knex.client && this.#knex.client.pool) {
                this.#knex.client.pool.destroy()
                    .then(() => {
                    this.#knex = undefined;
                    resolve(true);
                })
                .catch((error) => {
                    this.#knex = undefined;
                    reject(error);
                })
                return true;
            }
            this.#knex = undefined;
            resolve(true);
            return true;
        })
    }

    /**
     * Get configuration
     *
     * @return {DatabaseConfiguration}
     */
    get config() {
        return this.#config;
    }

    /**
     * @return {knex.QueryBuilder<TRecord2, TResult2>}
     */
    get queryBuilder() {
        return this.knex['queryBuilder']();
    }
}
