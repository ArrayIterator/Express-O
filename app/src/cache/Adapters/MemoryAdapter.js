import CacheItemPool from "../CacheItemPool.js";
import {is_scalar} from "../../helpers/Is.js";
import CacheItem from "../CacheItem.js";
import CacheInvalidArgumentException from "../Exceptions/CacheInvalidArgumentException.js";
import {sprintf} from "../../helpers/Formatting.js";
import {__} from "../../l10n/Translator.js";

/**
 * Memory adapter
 *
 * @type {Map<string, CacheItem>}
 */
const cacheItems = new Map();

/**
 * Clear expired
 */
const ClearExpired = () => {
    if (cacheItems.size === 0) {
        return;
    }
    const time = Date.now() / 1000;
    for (let key of cacheItems.keys()) {
        const cache = cacheItems.get(key);
        if (cache !== null && cache.expiration !== 0 && cache.expiration < time) {
            cacheItems.delete(key);
        }
    }
}

/**
 * Interval milliseconds to clear Expired
 *
 * @type {number}
 */
const INTERVAL_GARBAGE_TIME = 1000;

let timeless_interval;

/**
 * Start Clear
 */
const StartClear = () => {
    if (timeless_interval) {
        clearInterval(timeless_interval);
    }
    // interval Garbage every 10 seconds
    timeless_interval = setInterval(ClearExpired, INTERVAL_GARBAGE_TIME); // infinity loop
}

/**
 * Just-In-Time Memory Cache adapter
 */
export default class MemoryAdapter extends CacheItemPool {

    /**
     * MemoryAdapter constructor
     *
     * @param {string} namespace
     * @param {?number} defaultLifetime
     */
    constructor(namespace = '_', defaultLifetime = null) {
        super(namespace, defaultLifetime);
        StartClear(); // call clear
    }

    /**
     * @inheritDoc
     */
    getAdapterName() {
        return 'memory';
    }

    /**
     *  @inheritDoc
     */
    clear() {
        return new Promise((resolve) => {
            this._deferred = {};
            const time = Date.now() / 1000;
            // clear by namespace
            for (let key of cacheItems.keys()) {
                if (key.startsWith(this.namespace + ':')) {
                    cacheItems.delete(key);
                    continue;
                }
                const cache = cacheItems.get(key);
                if (cache !== null && cache.expiration !== 0 && cache.expiration < time) {
                    cacheItems.delete(key);
                }
            }

            resolve(true);
        });
    }

    /**
     *  @inheritDoc
     */
    commit() {
        return new Promise((resolve) => {
            for (let key in this._deferred) {
                if (this._deferred.hasOwnProperty(key)) {
                    key = `${this.namespace}:${key}`;
                    cacheItems.set(key, this._deferred[key]);
                }
            }
            this._deferred = {};
            resolve(true);
            return true;
        });
    }

    /**
     *  @inheritDoc
     */
    deleteItem(key) {
        return new Promise((resolve) => {
            key = key instanceof CacheItem ? key.getKey() : key;
            if (!is_scalar(key)) {
                resolve(false);
                return false;
            }
            key = `${this.namespace}:${key}`;
            cacheItems.delete(key);
            delete this._deferred[key];
            return Promise.resolve(true);
        });
    }

    /**
     * @inheritDoc
     */
    getItem(key) {
        return new Promise((resolve, reject) => {
            key = key instanceof CacheItem ? key.getKey() : key;
            if (!is_scalar(key)) {
                reject(new CacheInvalidArgumentException(
                    sprintf(
                        __('Key must be a string, %s given.'),
                        key === null ? 'null' : typeof key
                    )
                ));
                return;
            }
            key = `${this.namespace}:${key}`;
            if (cacheItems.has(key)) {
                let item = cacheItems.get(key);
                if (item.expiration !== null && item !== 0 && item < Date.now() / 1000) {
                    cacheItems.delete(key);
                    item = new CacheItem(key, null, false, this.defaultLifetime, this.defaultLifetime);
                } else {
                    item = new CacheItem(item.getKey(), item.get(), true, item.expiration, this.defaultLifetime);
                }
                resolve(item);
                return item;
            }
            let item = new CacheItem(key, null, false, this.defaultLifetime, this.defaultLifetime);
            resolve(item);
            return item;
        })
    }

    /**
     * @inheritDoc
     */
    hasItem(key) {
        return new Promise((resolve) => {
            if (!is_scalar(key)) {
                return resolve(false);
            }
            key = `${this.namespace}:${key}`;
            if (cacheItems.has(key)) {
                const item = cacheItems.get(key);
                if (item.expiration !== null && cacheItems.expiration !== 0 && cacheItems.expiration < Date.now() / 1000) {
                    cacheItems.delete(key);
                    return false;
                }
                resolve(true);
                return true;
            }
            resolve(false);
            return false;
        });
    }

    /**
     * @inheritDoc
     */
    save(item) {
        return new Promise((resolve) => {
            if (!(item instanceof CacheItem)) {
                resolve(false);
                return false;
            }
            cacheItems.set(item.getKey(), item);
            resolve(true);
        });
    }

    /**
     * @inheritDoc
     */
    saveDeferred(item) {
        return super.save(item);
    }
}