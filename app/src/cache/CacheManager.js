// noinspection JSUnusedGlobalSymbols

import {is_date, is_numeric, is_numeric_integer, is_object, is_string} from "../helpers/Is.js";
import Config, {CACHE_DIR} from "../app/Config.js";
import {accessSync, constants, existsSync, mkdirSync} from "node:fs";
import {floatval, intval} from "../helpers/DataType.js";
import CacheInvalidArgumentException from "./Exceptions/CacheInvalidArgumentException.js";
import {sprintf} from "../helpers/Formatting.js";
import {__} from "../l10n/Translator.js";
import CacheItem from "./CacheItem.js";
import CacheItemPool from "./CacheItemPool.js";
import RedisAdapter from "./Adapters/RedisAdapter.js";
import MemoryAdapter from "./Adapters/MemoryAdapter.js";
import VoidAdapter from "./Adapters/VoidAdapter.js";
import FileSystemAdapter from "./Adapters/FileSystemAdapter.js";
import Redis from "ioredis";

/**
 * Available adapters
 *
 * @type {string[]}
 */
export const AVAILABLE_ADAPTERS = [
    'file',
    'memory',
    // 'memcached',
    'redis',
    'void',
];

/**
 * Create cache pool item
 *
 * @return {InstanceType<CacheItemPool>}
 */
const CreateCachePoolItem = () => {
    const cache = Config.getObject('cache');
    const enable = is_object(cache) && is_numeric(cache.enable) ? !!cache.enable : true;
    // if not enabled
    if (!enable) {
        return new VoidAdapter();
    }
    const defaultLifetime = is_numeric(cache.defaultLifetime) ? intval(cache.defaultLifetime) : 0;
    const defaultCacheDir = CACHE_DIR;
    let adapter = is_object(cache) && is_string(cache.adapter) ? cache.adapter.trim().toLowerCase() : null;
    const adapters = is_object(cache) && is_object(cache.adapters) ? cache.adapters : null;
    let namespace = cache.namespace;
    namespace = !is_string(namespace) ? '_' : namespace.trim();

    // file
    const cacheFileConfig = is_object(adapters.file) ? adapters.file : {};
    if (!is_string(cacheFileConfig.directory) || cacheFileConfig.directory.trim() === '') {
        cacheFileConfig.directory = defaultCacheDir;
    }
    // redis
    const redisConfig = is_object(adapters.redis) ? adapters.redis : {};
    if (!is_string(redisConfig.host) || redisConfig.host.trim() === '') {
        redisConfig.host = '127.0.0.1';
    }
    if (!is_numeric_integer(redisConfig.port) || intval(redisConfig.port) > 65534 || intval(redisConfig.port) < 1) {
        redisConfig.port = 6379;
    }
    redisConfig.port = intval(redisConfig.port);
    if (!is_numeric_integer(redisConfig.database) || intval(redisConfig.database) < 0) {
        redisConfig.database = 0;
    }
    redisConfig.database = intval(redisConfig.database);
    if (!is_string(redisConfig.password)) {
        redisConfig.password = null;
    }
    if (!is_numeric(redisConfig.timeout)) {
        redisConfig.timeout = 0.0;
    }
    redisConfig.timeout = floatval(redisConfig.timeout);
    if (!is_numeric(redisConfig.connection_timeout)) {
        redisConfig.connection_timeout = 0.0;
    }
    redisConfig.connection_timeout = floatval(redisConfig.connection_timeout);
    // memcached
    const memcachedConfig = !is_object(adapters.memcached) ? adapters.memcached : {};
    if (!is_string(memcachedConfig.host) || memcachedConfig.host.trim() === '') {
        memcachedConfig.host = '127.0.0.1';
    }
    if (!is_numeric_integer(memcachedConfig.port) || intval(memcachedConfig.port) > 65534 || intval(memcachedConfig.port) < 1) {
        memcachedConfig.port = 11211;
    }
    memcachedConfig.port = intval(memcachedConfig.port);
    if (!is_numeric_integer(memcachedConfig.timeout) || intval(memcachedConfig.timeout) < 1) {
        memcachedConfig.timeout = 1;
    }
    adapter = !is_string(adapter) ? 'file' : adapter;
    if (/void|null|none/.test(adapter)) {
        return new VoidAdapter();
    }
    if (/redis/.test(adapter)) {
        let redis = new Redis({
            noDelay: true,
            host: redisConfig.host,
            commandTimeout: redisConfig.timeout,
            connectTimeout: redisConfig.connection_timeout,
            db: redisConfig.database,
            name: namespace,
            disconnectTimeout: 2000
        });
        return new RedisAdapter(namespace, redis, defaultLifetime);
    }
    if (/memory/.test(adapter)) {
        return new MemoryAdapter(namespace, defaultLifetime);
    }
    let dir = cacheFileConfig.directory;
    if (!existsSync(dir)) {
        try {
            mkdirSync(dir, {recursive: true});
        } catch (e) {
            if (dir !== defaultCacheDir) {
                dir = defaultCacheDir;
                if (!existsSync(dir)) {
                    mkdirSync(dir, {recursive: true});
                }
            }
            // pass
        }
    }
    try {
        accessSync(dir, constants.R_OK | constants.W_OK);
        return new FileSystemAdapter(namespace, dir, defaultLifetime);
    } catch (e) {
        return new VoidAdapter(); // no cache
    }
}

export default class CacheManager {
    /**
     * Cache item pool
     *
     * @type {CacheItemPool}
     * @private
     */
    #cacheItemPool;

    /**
     * Cache constructor.
     *
     * @param {CacheItemPool} adapter
     */
    constructor(adapter = null) {
        this.setAdapter(adapter instanceof CacheItemPool ? adapter : CreateCachePoolItem());
    }

    /**
     * Get adapter name
     *
     * @return {string}
     */
    get adapterName() {
        return this.adapter.adapterName;
    }

    /**
     * Get cache item pool
     *
     * @return {CacheItemPool}
     */
    get adapter() {
        return this.#cacheItemPool;
    }

    /**
     * Set cache item pool
     *
     * @param {CacheItemPool} cacheItemPool
     * @return {this}
     */
    setAdapter(cacheItemPool) {
        if (!(cacheItemPool instanceof CacheItemPool)) {
            throw new CacheInvalidArgumentException(
                sprintf(
                    __('Invalid cache adapter, must be instance of %s'),
                    CacheItemPool.name
                )
            );
        }
        this.#cacheItemPool = cacheItemPool;
        return this;
    }

    /**
     * Confirms if the cache contains specified cache item.
     *
     * @param {string} key
     * @return {Promise<boolean>}
     */
    hasItem(key) {
        return this.#cacheItemPool.hasItem(key);
    }

    /**
     * Get cache item
     *
     * @param {string} key
     * @return {Promise<CacheItem>}
     */
    getItem(key) {
        return this.#cacheItemPool.getItem(key);
    }

    /**
     * Get items
     *
     * @param keys
     * @return {Promise<{[key: string|number]: CacheItem}>}
     */
    getItems(keys) {
        return this.#cacheItemPool.getItems(keys);
    }

    /**
     * Save cache item
     *
     * @param item
     * @return {Promise<boolean>}
     */
    saveItem(item) {
        return this.#cacheItemPool.save(item);
    }

    /**
     * Delete cache item
     *
     * @param {string} key
     * @return {Promise<boolean>}
     */
    deleteItem(key) {
        return this.#cacheItemPool.deleteItem(key);
    }

    /**
     * Delete cache items
     *
     * @param {string[]} keys
     * @return {Promise<boolean>}
     */
    deleteItems(keys) {
        return this.#cacheItemPool.deleteItems(keys);
    }

    /**
     * Clear cache
     *
     * @return {Promise<boolean>}
     */
    clearItems() {
        return this.#cacheItemPool.clear();
    }

    /**
     * Get cache item value
     *
     * @param key
     * @return {Promise<any>}
     */
    get(key) {
        return new Promise(async (resolve) => {
            const item = await this.getItem(key).catch(() => null);
            if (item === null) {
                resolve(null);
                return null;
            }
            resolve(item.value);
            return item.value;
        });
    }

    /**
     * Save cache item
     *
     * @param {string|CacheItem} key
     * @param {any} value
     * @param {number|null|undefined} expireAfter
     * @return {Promise<CacheItem>}
     */
    save(key, value, expireAfter = undefined) {
        return new Promise(async (resolve) => {
            let item;
            if (key instanceof CacheItem) {
                item = key;
                if (value !== null && value !== undefined) {
                    item.setValue(value);
                }
            } else {
                item = await this.getItem(key);
                item.setValue(value);
            }
            if (is_numeric_integer(expireAfter) || is_date(expireAfter)) {
                item.expiresAfter(expireAfter);
            }
            const result = await this.saveItem(item).catch(() => false);
            if (!result) {
                resolve(null);
                return null;
            }
            resolve(item);
            return item;
        });
    }
}
