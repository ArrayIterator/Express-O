import CacheItemPool from "../CacheItemPool.js";
import {strval} from "../../helpers/DataType.js";
import CacheItem from "../CacheItem.js";

/**
 * Void adapter, no storage.
 */
export default class VoidAdapter extends CacheItemPool {

    constructor() {
        super('void');
    }

    /**
     * @inheritDoc
     */
    getAdapterName() {
        return 'void';
    }

    /**
     * @inheritDoc
     */
    clear() {
        return Promise.resolve(true);
    }

    /**
     * @inheritDoc
     */
    commit() {
        return Promise.resolve(true);
    }

    /**
     * @inheritDoc
     */
    deleteItem(_key) {
        return Promise.resolve(true);
    }

    /**
     * @inheritDoc
     */
    getItem(key) {
        return Promise.resolve(new CacheItem(strval(key), null, null, null, null));
    }

    /**
     * @inheritDoc
     */
    hasItem(_key) {
        return Promise.resolve(false);
    }

    /**
     * @inheritDoc
     */
    save(_item) {
        return Promise.resolve(true);
    }

    /**
     * @inheritDoc
     */
    deleteItems(_keys) {
        return Promise.resolve(true)
    }

    /**
     * @inheritDoc
     */
    saveDeferred(_item) {
        return Promise.resolve(true);
    }
}
