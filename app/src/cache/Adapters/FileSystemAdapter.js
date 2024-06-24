import CacheItemPool from "../CacheItemPool.js";
import {is_boolean, is_integer, is_object, is_scalar, is_string} from "../../helpers/Is.js";
import {CACHE_DIR} from "../../app/Config.js";
import {dirname, resolve} from "node:path";
import {md5} from "../../helpers/Hash.js";
import {base64_encode} from "../../helpers/DataType.js";
import CacheItem from "../CacheItem.js";
import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    rmdirSync,
    statSync,
    unlinkSync,
    writeFileSync
} from "node:fs";
import {unserialize} from "../../helpers/Serializer.js";
import CacheInvalidArgumentException from "../Exceptions/CacheInvalidArgumentException.js";
import {sprintf} from "../../helpers/Formatting.js";
import {__} from "../../l10n/Translator.js";

const CACHE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ_+';
const MAX_CACHE_ITEMS = 1000;
const RESERVED_CACHE_ITEMS_COUNT = 50;

/**
 * Generate file name
 *
 * @param {string} key
 * @return {string}
 */
const GenerateFileName = (key) => {
    key = md5(key);
    const one_char = base64_encode(key).replace(/[^ABCDEFGHIJKLMNOPQRSTUVWXYZ_+]/gi, '_').substring(0, 1).toUpperCase();
    return one_char + '/' + key;
};

/**
 * Generate file path
 *
 * @param {string} directory
 * @param {string} key
 * @return {string}
 */
const GenerateFilePath = (directory, key) => {
    return resolve(directory, GenerateFileName(key));
}

/**
 * Caches
 *
 * @type {{[key: string]: CacheItem}}
 */
let caches = {};

/**
 * Reserve cache items
 */
const ReserveCacheItems = () => {
    if (Object.keys(caches).length >= MAX_CACHE_ITEMS) {
        const keys = Object.keys(caches);
        for (let i = 0; i < RESERVED_CACHE_ITEMS_COUNT; i++) {
            delete caches[keys[i]];
        }
    }
}

export default class FileSystemAdapter extends CacheItemPool {

    /**
     * Cache directory
     *
     * @type {string}
     *
     * @private
     */
    #cacheDirectory;

    /**
     * FileSystemAdapter constructor.
     *
     * @param {string} namespace
     * @param {string} directory
     * @param {number|null} defaultExpiration
     */
    constructor(namespace = '', directory = null, defaultExpiration = null) {
        namespace = namespace || '_';
        super(namespace, defaultExpiration);
        if (!is_string(directory)) {
            directory = CACHE_DIR;
        }
        if (!this.isValidNamespace(namespace)) {
            throw new CacheInvalidArgumentException(
                'Namespace must be a string, 1 to 32 characters in length and contain only alphanumeric characters and underscores.'
            );
        }
        this.#cacheDirectory = resolve(directory, namespace);
    }

    /**
     * Get cache directory
     *
     * @return {string}
     */
    get cacheDirectory() {
        return this.#cacheDirectory;
    }

    /**
     * @inheritDoc
     */
    getAdapterName() {
        return 'filesystem';
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
     * @inheritDoc
     */
    clear() {
        return new Promise(async (_resolve) => {
            await this.resultCall(super.clear()).catch(() => undefined);
            caches = {};
            const dir = this.cacheDirectory;
            if (!existsSync(dir)) {
                resolve(true);
                return true;
            }
            const remove = (dir) => {
                if (!existsSync(dir)) {
                    return;
                }
                const files = readdirSync(dir);
                let filesLength = files.length;
                while (files.length > 0) {
                    const file = files.shift();
                    const path = resolve(dir, file);
                    if (!existsSync(path)) {
                        continue;
                    }
                    filesLength--;
                    if (statSync(path).isDirectory()) {
                        remove(path);
                        continue;
                    }
                    unlinkSync(path);
                }
                if (filesLength === 0) {
                    try {
                        rmdirSync(dir);
                    } catch (err) {
                        // pass
                    }
                }
            }
            const alpha = CACHE_CHARS.split('');
            for (let a of alpha) {
                remove(resolve(dir, a));
            }
            _resolve(true);
            return true;
        });
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
            const hasKey = GenerateFileName(key);
            delete this._deferred[key];
            if (caches.hasOwnProperty(hasKey)) {
                delete caches[hasKey];
            }
            const fileName = GenerateFilePath(this.cacheDirectory, key);
            if (!existsSync(fileName)) {
                return resolve(true);
            }
            if (statSync(fileName).isFile()) {
                try {
                    unlinkSync(fileName);
                } catch (err) {
                    resolve(false);
                    return;
                }
            }
            return resolve(true);
        });
    }

    /**
     * @inheritDoc
     */
    getItem(key) {
        return new Promise(async (resolve, reject) => {
            if (!is_scalar(key)) {
                reject(new CacheInvalidArgumentException(
                    sprintf(
                        __('Key must be a string, %s given.'),
                        key === null ? 'null' : typeof key
                    )
                ));
                return;
            }
            const hasKey = GenerateFileName(key);
            if (caches.hasOwnProperty(hasKey)) {
                if (caches[hasKey] instanceof CacheItem
                    && (caches[hasKey].expiration === null || caches[hasKey].expiration > Date.now() / 1000)
                ) {
                    resolve(caches[hasKey]);
                    return caches[hasKey];
                }
                await this.resultCall(this.deleteItem(key)).catch(() => undefined);
            }

            const path = GenerateFilePath(this.cacheDirectory, key);

            if (!existsSync(path)) {
                const item = new CacheItem(
                    key,
                    null,
                    false,
                    this.defaultLifetime,
                    this.defaultLifetime
                );
                resolve(item);
                return item;
            }
            let stats;
            try {
                stats = statSync(path);
            } catch (err) {
                // pass
            }
            if (!stats || !stats.isFile()) {
                const item = new CacheItem(
                    key,
                    null,
                    false,
                    this.defaultLifetime,
                    this.defaultLifetime
                );
                resolve(item);
                return item;
            }
            let value = readFileSync(path, 'utf-8');
            if (!is_string(value)) {
                const item = new CacheItem(
                    key,
                    null,
                    false,
                    this.defaultLifetime,
                    this.defaultLifetime
                );
                resolve(item);
                return item;
            }
            /**
             * @type {{
             *     key: string,
             *     value: any,
             *     hit: boolean,
             *     expiration: number|null
             * }} item
             */
            let item = unserialize(value);
            if (!is_object(item)
                || !item.hasOwnProperty('key')
                || !item.hasOwnProperty('value')
                || !item.hasOwnProperty('hit')
                || !item.hasOwnProperty('expiration')
                || !is_string(item.key)
                || key !== item.key
                || !is_boolean(item.hit)
                || (item.expiration !== null && !is_integer(item.expiration))
                || item.expiration !== null && item.expiration < Date.now() / 1000
            ) {
                await this.resultCall(this.deleteItem(key)).catch(() => undefined);
                const item = new CacheItem(
                    key,
                    null,
                    false,
                    this.defaultLifetime,
                    this.defaultLifetime
                );
                resolve(item);
                return item;
            }

            ReserveCacheItems();
            caches[hasKey] = new CacheItem(
                item.key,
                item.value,
                true,
                item.expiration,
                this.defaultLifetime
            )
            if (!item.hit) {
                await this.resultCall(this.save(caches[hasKey])).catch(() => undefined);
            }
            const _item = new CacheItem(
                item.key,
                item.value,
                item.hit,
                item.expiration,
                this.defaultLifetime
            );
            resolve(_item);
            return _item;
        });
    }

    /**
     * @inheritDoc
     */
    hasItem(key) {
        return new Promise(async (resolve) => {
            if (!is_scalar(key)) {
                resolve(false);
                return false;
            }
            const hasKey = GenerateFileName(key);
            if (caches.hasOwnProperty(hasKey)) {
                return resolve(true);
            }
            const path = GenerateFilePath(this.cacheDirectory, key);
            if (!existsSync(path)) {
                resolve(false);
                return false;
            }
            await this.resultCall(this.getItem(key)).catch(() => undefined);
            const result = caches.hasOwnProperty(hasKey);
            resolve(result);
            return result;
        });
    }

    /**
     * @inheritDoc
     */
    save(item) {
        return new Promise(async (resolve) => {
            if (!(item instanceof CacheItem)) {
                resolve(false);
                return false;
            }
            delete caches[item.getKey()];
            delete this._deferred[item.getKey()];
            const key = GenerateFileName(item.getKey());
            const fileName = GenerateFilePath(this.cacheDirectory, item.getKey());
            const _dirname = dirname(fileName);
            if (!existsSync(_dirname)) {
                mkdirSync(_dirname, {recursive: true});
            }
            if (!existsSync(_dirname)) {
                resolve(false);
                return false;
            }
            try {
                writeFileSync(fileName, item.serialize());
                caches[key] = item;
                ReserveCacheItems();
                resolve(true);
                return true;
            } catch (err) {
                resolve(false);
                return false;
            }
        });
    }

    /**
     * @inheritDoc
     */
    saveDeferred(item) {
        return super.saveDeferred(item);
    }

    /**
     * @inheritDoc
     */
    commit() {
        return super.commit();
    }
}
