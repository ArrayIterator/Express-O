// noinspection JSUnusedGlobalSymbols

import crypto from "crypto";
import {readFileSync} from "node:fs";
import {is_error, is_string} from "./Is.js";
import FileNotFoundException from "../errors/exceptions/FileNotFoundException.js";
import {E_WARNING} from "../errors/exceptions/ErrorCode.js";
import PermissionException from "../errors/exceptions/PermissionException.js";
import Exception from "../errors/exceptions/Exception.js";
import {strval} from "./DataType.js";

/**
 * Hash algorithms
 * @type {{
 *     [key: string]: string
 * }}
 */
const ALGORITHMS = {};

for (let algo of crypto.getHashes()) {
    ALGORITHMS[algo.toLowerCase()] = algo;
}

/**
 * Normalize hash algorithm
 *
 * @param {string} hash Hash algorithm
 * @return {?string} Returns null if hash is not a valid algorithm
 */
const normalize_hash = (hash) => {
    if (!is_string(hash)) {
        return null;
    }
    hash = hash.trim().toLowerCase();
    return ALGORITHMS[hash] || null;
}

/**
 * Hash
 *
 * @param {string|"sha1"|"sha256"|"sha384"|"sha512"|"md5"} hash_algo Hash algorithm
 * @param {string} data Data to hash
 * @param {boolean} raw If true, the output is raw binary data. False for hex
 * @return {string|false} Returns false if hash algorithm is not valid
 */
export const hash = (hash_algo, data, raw = false) => {
    hash_algo = normalize_hash(hash_algo);
    if (!hash_algo) {
        return false;
    }
    data = strval(data);
    const hash = crypto.createHash(hash_algo);
    hash.update(data);
    return hash.digest(raw ? "binary" : "hex");
}

/**
 * Read file
 *
 * @param {string} file_path File path
 * @return {Buffer} File content
 * @throws Exception
 * @throws PermissionException
 * @throws FileNotFoundException
 */
const readFile = (file_path) => {
    let result;
    readFileSync(file_path, function (err, data) {
        if (err) {
            if (err.code === "ENOENT") {
                throw new FileNotFoundException(err.message, E_WARNING, err);
            }
            if (err.code === "EACCES") {
                throw new PermissionException(err.message, E_WARNING, err);
            }
            if (is_error(err)) {
                throw err;
            }
            throw new Exception(err.message, E_WARNING);
        }
        result = strval(data);
    });
    return result;
}

/**
 * Hash file
 *
 * @param {string|"sha1"|"sha256"|"sha384"|"sha512"|"md5"} hash_algo Hash algorithm
 * @param {string} file_path File path
 * @param {boolean} raw If true, the output is raw binary data. False for hex
 * @return {string|false} Returns false if hash algorithm is not valid
 */
export const hash_file = (hash_algo, file_path, raw = false) => {
    hash_algo = normalize_hash(hash_algo);
    if (!hash_algo) {
        return false;
    }
    return hash(hash_algo, readFile(file_path), raw);
}

/**
 * Hash file hmac
 *
 * @param {string|"sha1"|"sha256"|"sha384"|"sha512"|"md5"} hash_algo Hash algorithm
 * @param {string} file_path
 * @param {string} key Key for hash
 * @param {boolean} raw If true, the output is raw binary data. False for hex
 * @return {string|false} Returns false if hash algorithm is not valid
 */
export const hash_hmac_file = (hash_algo, file_path, key, raw = false) => {
    hash_algo = normalize_hash(hash_algo);
    if (!hash_algo) {
        return false;
    }
    return hash_hmac(hash_algo, readFile(file_path), key, raw);
}

/**
 * Hash hmac
 *
 * @param {string|"sha1"|"sha256"|"sha384"|"sha512"|"md5"} hash_algo Hash algorithm
 * @param {string} data Data to hash
 * @param {string} key Key for hash
 * @param {boolean} raw If true, the output is raw binary data. False for hex
 * @return {string|false} Returns false if hash algorithm is not valid
 */
export const hash_hmac = (hash_algo, data, key, raw = false) => {
    hash_algo = normalize_hash(hash_algo);
    if (!hash_algo) {
        return false;
    }
    data = strval(data);
    const hmac = crypto.createHmac(hash_algo, key);
    hmac.update(data);
    return hmac.digest(raw ? "binary" : "hex");
}

/**
 * Hash file async
 *
 * @param {string|"sha1"|"sha256"|"sha384"|"sha512"|"md5"} hash_algo Hash algorithm
 * @param {string} file_path File path
 * @param {boolean} raw If true, the output is raw binary data. False for hex
 * @return {Promise<string>} Returns false if hash algorithm is not valid
 */
export const hash_file_async = (hash_algo, file_path, raw = false) => {
    return new Promise((resolve, reject) => {
        try {
            const result = hash_file(hash_algo, file_path, raw);
            resolve(result);
            return result;
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Hash hmac file async
 *
 * @param {string|"sha1"|"sha256"|"sha384"|"sha512"|"md5"} hash_algo Hash algorithm
 * @param {string} file_path File path
 * @param {string} key Key for hash
 * @param {boolean} raw If true, the output is raw binary data. False for hex
 * @return {Promise<string>} Returns false if hash algorithm is not valid
 */
export const hash_hmac_file_async = (hash_algo, file_path, key, raw = false) => {
    return new Promise((resolve, reject) => {
        try {
            const result = hash_hmac_file(hash_algo, file_path, key, raw);
            resolve(result);
            return result;
        } catch (err) {
            reject(err);
        }
    });
}

export const sha1 = (data, raw = false) => hash("sha1", data, raw);
export const sha1_file = (file_path, raw = false) => hash_file("sha1", file_path, raw);
export const sha256 = (data, raw = false) => hash("sha256", data, raw);
export const sha256_file = (file_path, raw = false) => hash_file("sha256", file_path, raw);
export const sha384 = (data, raw = false) => hash("sha384", data, raw);
export const sha384_file = (file_path, raw = false) => hash_file("sha384", file_path, raw);
export const sha512 = (data, raw = false) => hash("sha512", data, raw);
export const sha512_file = (file_path, raw = false) => hash_file("sha512", file_path, raw);
export const md5 = (data, raw = false) => hash("md5", data, raw);
export const md5_file = (file_path, raw = false) => hash_file("md5", file_path, raw);
export const hmac_sha1 = (data, key, raw = false) => hash_hmac("sha1", data, key, raw);
export const hmac_sha1_file = (file_path, key, raw = false) => hash_hmac_file("sha1", file_path, key, raw);
export const hmac_sha256 = (data, key, raw = false) => hash_hmac("sha256", data, key, raw);
export const hmac_sha256_file = (file_path, key, raw = false) => hash_hmac_file("sha256", file_path, key, raw);
export const hmac_sha384 = (data, key, raw = false) => hash_hmac("sha384", data, key, raw);
export const hmac_sha384_file = (file_path, key, raw = false) => hash_hmac_file("sha384", file_path, key, raw);
export const hmac_sha512 = (data, key, raw = false) => hash_hmac("sha512", data, key, raw);
export const hmac_sha512_file = (file_path, key, raw = false) => hash_hmac_file("sha512", file_path, key, raw);
export const hmac_md5 = (data, key, raw = false) => hash_hmac("md5", data, key, raw);
export const hmac_md5_file = (file_path, key, raw = false) => hash_hmac_file("md5", file_path, key, raw);
export const hash_algorithms = () => Object.keys(ALGORITHMS);
export default hash;
