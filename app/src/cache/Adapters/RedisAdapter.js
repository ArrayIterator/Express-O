import CacheItemPool from "../CacheItemPool.js";
import {is_numeric, is_scalar, is_string} from "../../helpers/Is.js";
import Redis from "ioredis";
import {__} from "../../l10n/Translator.js";
import CacheInvalidArgumentException from "../Exceptions/CacheInvalidArgumentException.js";
import {sha1} from "../../helpers/Hash.js";
import CacheItem from "../CacheItem.js";
import {sprintf} from "../../helpers/Formatting.js";
import CacheRuntimeException from "../Exceptions/CacheRuntimeException.js";

// noinspection JSUnusedGlobalSymbols
export default class RedisAdapter extends CacheItemPool {
    /**
     * Redis client
     *
     * @type {Redis}
     * @private
     */
    #redis;

    /**
     * RedisAdapter constructor.
     *
     * @param {string} namespace
     * @param {Redis} redisClient
     * @param {number|null} defaultExpiration
     */
    constructor(namespace = '_', redisClient, defaultExpiration = null) {
        super(namespace, defaultExpiration);
        if (!(redisClient instanceof Redis)) {
            throw new CacheInvalidArgumentException(__('Invalid redis client'));
        }

        this.#redis = redisClient;
    }

    /**
     * Get prefix
     *
     * @return {string}
     */
    getPrefix() {
        return `cache:${this.namespace}`;
    }

    /**
     * Generate key
     *
     * @param {string} key
     * @return {string}
     */
    genKey(key) {
        return `${this.getPrefix()}:${sha1(key)}`;
    }

    /**
     * @inheritDoc
     */
    getAdapterName() {
        return 'redis';
    }

    /**
     * @inheritDoc
     */
    isValidNamespace(namespace) {
        if (!is_string(namespace) || namespace.length === 0 || namespace.default > 32) {
            return false;
        }
        // check if valid namespace
        return /^[a-zA-Z0-9_]+$/.test(namespace);
    }

    /**
     * Get redis
     *
     * @return {Promise<Redis>}
     */
    getRedis() {
        return new Promise((resolve, reject) => {
            if (this.#redis.status === 'ready') {
                resolve(this.#redis);
                return this.#redis;
            }
            if (this.#redis.status === 'connecting' || this.#redis.status === 'reconnecting') {
                this.#redis.once('connect', () => {
                    resolve(this.#redis);
                }).once('error', reject);
                return this.#redis;
            }
            if (this.#redis.status === 'end') {
                this.#redis.connect().then(() => {
                    resolve(this.#redis);
                }).catch(reject);
                return this.#redis;
            }
            reject(new CacheRuntimeException(
                __('Redis is not connected')
            ));
        });
    }

    /**
     * @inheritDoc
     */
    clear() {
        return new Promise((resolve, reject) => {
            this._deferred = {};
            this.getRedis()
                .then((redis) => {
                    redis
                        .scanStream({match: `${this.getPrefix()}:*`})
                        .on('data', (keys) => {
                            keys.forEach((key) => redis.del(key).catch(() => undefined));
                        })
                        .on('end', () => {
                            resolve(true);
                        });
                }).catch((e) => {
                reject(e);
            });
        });
    }


    /**
     * @inheritDoc
     */
    commit() {
        return super.commit();
    }

    /**
     * @inheritDoc
     */
    deleteItem(key) {
        return new Promise((resolve) => {
            key = key instanceof CacheItem ? key.getKey() : key;
            if (!is_scalar(key)) {
                resolve(false);
                return false;
            }
            key = this.genKey(key);
            this.getRedis()
                .then((redis) => {
                    redis.del(key).then(() => {
                        resolve(true);
                    });
                }).catch(() => {
                resolve(false);
            });
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
            key = this.genKey(key);
            this.getRedis()
                .then(async (redis) => {
                    const exists = await redis.exists(key).then((result) => is_numeric(result) && result > 0);
                    redis.get(key).then((value) => {
                        redis.ttl(key).then((ttl) => {
                            resolve(new CacheItem(key, value, exists, ttl, this.defaultLifetime));
                        }).catch(() => {
                            resolve(new CacheItem(key, value, exists, this.defaultLifetime, this.defaultLifetime));
                        });
                    });
                }).catch((e) => {
                reject(e);
            });
        });
    }

    /**
     * @inheritDoc
     */
    hasItem(key) {
        return new Promise((resolve) => {
            key = key instanceof CacheItem ? key.getKey() : key;
            if (!is_scalar(key)) {
                resolve(false);
                return false;
            }
            key = this.genKey(key);
            this.getRedis()
                .then((redis) => {
                    redis.exists(key).then((result) => {
                        resolve(is_numeric(result) && result > 0);
                    });
                }).catch(() => {
                resolve(false);
            });
        })
    }

    /**
     * @inheritDoc
     */
    save(item) {
        return new Promise((resolve, reject) => {
            if (!(item instanceof CacheItem)) {
                resolve(false);
                return false;
            }
            this.getRedis()
                .then((redis) => {
                    const key = this.genKey(item.getKey());
                    const expiration = item.expiration;
                    if (expiration === null || expiration === 0) {
                        redis.set(key, item.value).then(() => {
                            resolve(true);
                        });
                    } else {
                        redis.set(
                            key,
                            item.value,
                            'PX',
                            expiration * 1000
                        ).then(() => {
                            resolve(true);
                        });
                    }
                }).catch((e) => {
                reject(e);
            });
        })
    }

    /**
     * @inheritDoc
     */
    saveDeferred(item) {
        return super.saveDeferred(item);
    }
}
