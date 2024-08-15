import {md5, sha1} from "./Hash";
import {
    dechex,
    hexdec,
    implode,
    random_bytes,
    random_int,
    str_pad,
    str_replace,
    str_split,
    substr
} from "./DataType.js";
import {sprintf} from "./Formatting.js";

/**
 * UUID class to generate and parse UUID.
 * Only support uuid 1 - 5
 *
 * Usage:
 * - Generate UUID v1: UUID::v1() or UUID::generate(1), UUID::generate(1, UUID::UUID_VARIANT_DCE, UUID::UUID_TYPE_TIME)
 * - Generate UUID v2: UUID::v2() or UUID::generate(2), UUID::generate(2, UUID::UUID_VARIANT_DCE, UUID::UUID_TYPE_TIME)
 * - Generate UUID v3:
 *      UUID::v3(UUID::NAMESPACE_DNS, 'www.example.com')
 *      or UUID::generate(3, UUID::UUID_VARIANT_RFC4122, UUID::UUID_TYPE_MD5, UUID::NAMESPACE_DNS, 'www.example.com')
 * - Generate UUID v4:
 *      UUID::v4()
 *      or UUID::generate(4), UUID::generate(4, UUID::UUID_VARIANT_RFC4122, UUID::UUID_TYPE_RANDOM)
 * - Generate UUID v5:
 *      UUID::v5(UUID::NAMESPACE_DNS, 'www.example.com')
 *      or UUID::generate(5, UUID::UUID_VARIANT_RFC4122, UUID::UUID_TYPE_SHA1, UUID::NAMESPACE_DNS, 'www.example.com')
 * - Parse UUID: UUID::parse('550e8400-e29b-41d4-a716-446655440000')
 * - Get UUID version: UUID::version('550e8400-e29b-41d4-a716-446655440000')
 * - Get UUID integer id: UUID::integerId('550e8400-e29b-41d4-a716-446655440000')
 * - Check if a string is a valid UUID: UUID::isValid('550e8400-e29b-41d4-a716-446655440000')
 * - Extract UUID: UUID::extractUUID('550e8400-e29b-41d4-a716-446655440000')
 * - Extract UUID part: UUID::extractUUIDPart('550e8400-e29b-41d4-a716-446655440000')
 * - Calculate namespace and name:
 *      UUID::calculateNamespaceAndName(UUID::NAMESPACE_DNS, 'www.example.com', UUID::UUID_TYPE_MD5)
 *
 */


export const UUID_V1 = 1;
export const UUID_V2 = 2;
export const UUID_V3 = 3;
export const UUID_V4 = 4;
export const UUID_V5 = 5;

/* ----------------------------------------------------------------------
* UUID Types
* ----------------------------------------------------------------------
*/
export const UUID_TYPE_TIME = 1;
export const UUID_TYPE_MD5 = 2;
export const UUID_TYPE_SHA1 = 3;
export const UUID_TYPE_RANDOM = 4;

/* ----------------------------------------------------------------------
 * UUID Variant
 * ----------------------------------------------------------------------
 */
export const UUID_VARIANT_NCS = 0x00;
export const UUID_VARIANT_DCE = 0x80;
export const UUID_VARIANT_RFC4122 = 0x80;
export const UUID_VARIANT_MICROSOFT = 0x40;
export const UUID_VARIANT_RESERVED_FUTURE = 0xe0;

// NCS backward compatibility (with the obsolete Apollo Network Computing System 1.5 UUID format)
// is: 0 - 7 (0x0 - 0x7)
export const UUID_PREFIX_VARIANT_NCS = 0;
// DCE 1.1, ISO/IEC 11578:1996 is: 128 - 191 (0x80 - 0xbf)
export const UUID_PREFIX_VARIANT_DCE = 1;
//  microsoft is 192 - 223 (0xc0 - 0xdf)
export const UUID_PREFIX_VARIANT_MICROSOFT = 2;
// reserved for future definition is: 224 - 255 (0xe0 - 0xff)
export const UUID_PREFIX_VARIANT_RESERVED_FUTURE = 3;
// RFC 4122, IETF is: 64 - 79 (0x40 - 0x4f)
export const UUID_PREFIX_VARIANT_RFC4122 = 4;

/* ----------------------------------------------------------------------
 * UUID namespace constants for UUID::calculateNamespaceAndName()
 * ----------------------------------------------------------------------
 * https://tools.ietf.org/html/rfc4122#appendix-C
 */
export const UUID_NAMESPACE_DNS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
export const UUID_NAMESPACE_URL = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';
export const UUID_NAMESPACE_OID = '6ba7b812-9dad-11d1-80b4-00c04fd430c8';
export const UUID_NAMESPACE_X500 = '6ba7b814-9dad-11d1-80b4-00c04fd430c8';

/* ------------------------------------------------------------------------
 * Variant Name Constants
 * ------------------------------------------------------------------------
 */
export const UUID_DCE_VERSION_NAME = 'DCE 1.1, ISO/IEC 11578:1996';
export const UUID_MICROSOFT_VERSION_NAME = 'Microsoft Corporation GUID';
export const UUID_NCS_VERSION_NAME = 'RESERVED, NCS backward compatibility';
export const UUID_RFC4122_VERSION_NAME = 'RFC 4122, IETF';
export const UUID_RESERVED_FUTURE_VERSION_NAME = 'RESERVED, future definition';

/**
 * UUID variants for UUID_VARIANT_* constants single prefix variant for UUID
 */
export const UUID_SINGLE_PREFIX_VARIANT = {
    '0': UUID_PREFIX_VARIANT_NCS,
    '1': UUID_PREFIX_VARIANT_NCS,
    '2': UUID_PREFIX_VARIANT_NCS,
    '3': UUID_PREFIX_VARIANT_NCS,
    '4': UUID_PREFIX_VARIANT_NCS,
    '5': UUID_PREFIX_VARIANT_NCS,
    '6': UUID_PREFIX_VARIANT_NCS,
    '7': UUID_PREFIX_VARIANT_NCS,
    '8': UUID_PREFIX_VARIANT_DCE,
    '9': UUID_PREFIX_VARIANT_DCE,
    'a': UUID_PREFIX_VARIANT_DCE,
    'b': UUID_PREFIX_VARIANT_DCE,
    'c': UUID_PREFIX_VARIANT_MICROSOFT,
    'd': UUID_PREFIX_VARIANT_MICROSOFT,
    'e': UUID_PREFIX_VARIANT_RESERVED_FUTURE,
    'f': UUID_PREFIX_VARIANT_RESERVED_FUTURE,
};

/**
 * UUID variants for UUID::UUID_VARIANT_* constants
 */
export const UUID_VARIANTS = {
    [UUID_PREFIX_VARIANT_NCS]: UUID_VARIANT_NCS,
    [UUID_PREFIX_VARIANT_DCE]: UUID_VARIANT_DCE,
    [UUID_PREFIX_VARIANT_MICROSOFT]: UUID_VARIANT_MICROSOFT,
    [UUID_PREFIX_VARIANT_RFC4122]: UUID_VARIANT_RFC4122,
    [UUID_PREFIX_VARIANT_RESERVED_FUTURE]: UUID_VARIANT_RESERVED_FUTURE,
}

/**
 * UUID variant names for UUID::UUID_VARIANT_* constants
 */
export const UUID_VARIANT_NAMES = {
    [UUID_PREFIX_VARIANT_NCS]: UUID_NCS_VERSION_NAME,
    [UUID_PREFIX_VARIANT_DCE]: UUID_DCE_VERSION_NAME,
    [UUID_PREFIX_VARIANT_MICROSOFT]: UUID_MICROSOFT_VERSION_NAME,
    [UUID_PREFIX_VARIANT_RFC4122]: UUID_RFC4122_VERSION_NAME,
    [UUID_PREFIX_VARIANT_RESERVED_FUTURE]: UUID_RESERVED_FUTURE_VERSION_NAME,
};

/**
 * Extract uuid part:
 * 1. time low
 * 2. time mid
 * 3. time hi and version
 * 4. clock seq hi and reserved
 * 5. clock seq low
 * 6. node
 *
 * @param {string} uuid
 * @return {{
 * time_low: number,
 * clock_seq_low: number,
 * node: number,
 * time_mid: number,
 * time_hi_and_version: number,
 * variant: (*|number),
 * variant_name: (*|string),
 * clock_seq_hi_and_reserved: number,
 * version: number}|null}
 */
export const extract = (uuid) => {
    const matches = /([0-9a-f]{8})-([0-9a-f]{4})-([1-5][0-9a-f]{3})-([0-9a-f]{4})-([0-9a-f]{12})/i.exec(uuid);
    if (matches === null) {
        return null;
    }
    let timeLow = hexdec(matches[1]);
    let timeMid = hexdec(matches[2]);
    let timeHiAndVersion = hexdec(matches[3]);
    let clockSeqHiAndReserved = hexdec(matches[4]);
    let clockSeqLow = hexdec(matches[4].substring(2));
    let node = hexdec(matches[5]);
    let variant = matches[4].substring(0, 1);
    // uuid is hex: 0-9, a-f
    // by default, variant is NCS backward compatibility
    let variants = UUID_SINGLE_PREFIX_VARIANT.hasOwnProperty(
        variant
    ) ? UUID_SINGLE_PREFIX_VARIANT[variant] : UUID_PREFIX_VARIANT_NCS;
    let variantName = UUID_VARIANT_NAMES.hasOwnProperty(
        variants
    ) ? UUID_VARIANT_NAMES[variants] : UUID_NCS_VERSION_NAME;
    return {
        'time_low': timeLow,
        'time_mid': timeMid,
        'time_hi_and_version': timeHiAndVersion,
        'clock_seq_hi_and_reserved': clockSeqHiAndReserved,
        'clock_seq_low': clockSeqLow,
        'node': node,
        'version': timeHiAndVersion >> 12,
        'variant': variants,
        'variant_name': variantName,
    }
}

/**
 * Check if a string is a valid UUID.
 *
 * @param {string} uuid
 * @return {boolean} true if the string is a valid UUID, false otherwise
 */
export const valid = (uuid) => extract(uuid) !== null;

/**
 * Get version from uuid
 *
 * @param {string} uuid
 * @return int|null null if not valid uuid
 */
export const version = (uuid) => {
    // a0eebc99-9c0b-11d1-0000-000000000000
    if (!valid(uuid)) {
        return null;
    }
    const uuidDetails = extract(uuid);
    return uuidDetails ? uuidDetails['version'] : null;
}

/**
 * Get UUID integer id.
 *
 * @param {string} uuid UUID to convert
 * @return {?bigint} unsigned numeric string known as single integer value or null if not valid uuid
 */
export const integerId = (uuid) => {
    if (!extract(uuid)) {
        return null;
    }
    // remove hyphens
    const hex = uuid.replace(/-/g, '');
    // convert hex to decimal
    let dec = BigInt(0);
    // get length of hex
    let length = hex.length;
    // loop hex
    for (let i = 0; i < length; i++) {
        // get the char from hex at position $i
        // -> the decimal by 16
        dec = dec * BigInt(16);
        dec = dec + BigInt(parseInt(hex[i], 16));
    }
    return dec;
}

/**
 * Parse the uuid and show the detail of:
 *
 * 1. Single Integer (64 bits) (big endian) from UUID
 * 2. Version
 * 3. Variant
 * 4. Timestamp ISO 8601
 * 6. Node / Contents
 * The contents (and content node for version 1) are per hex string separated by :
 * @param {string} uuid UUID to parse
 *
 * @return {null|{
 *     uuid,
 *     single_integer,
 *     version,
 *     variant,
 *     variant_name,
 *     contents_node,
 *     contents_time: ?string,
 *     contents_clock,
 *     contents,
 *     time_low,
 *     time_mid,
 *     time_hi_and_version,
 *     clock_seq_hi_and_reserved,
 *     clock_seq_low,
 *     node,
 * }} null if not valid uuid if the version is not 1 the time will be null
 */
export const parse = (uuid) => {
    const uuidDetails = extract(uuid);
    if (!uuidDetails) {
        return null;
    }

    let timestamp;
    if (uuidDetails['version'] === 1) {
        timestamp = (BigInt(uuidDetails['time_hi_and_version']) & BigInt(0x0fff)) << BigInt(48);
        timestamp |= BigInt(uuidDetails['time_mid']) << BigInt(32);
        timestamp |= BigInt(uuidDetails['time_low']);
        timestamp = timestamp - BigInt(0x01B21DD213814000n);
        timestamp = timestamp / BigInt(10000000);
        timestamp = parseInt(timestamp.toString());
        try {
            timestamp = new Date(timestamp);
            timestamp = timestamp.toISOString();
            // $timestamp = $timestamp->format(DateTimeInterface::ATOM);
        } catch (Throwable) {
            timestamp = null;
        }
    } else {
        timestamp = null;
    }
    let clock = uuidDetails['clock_seq_hi_and_reserved'] << 8;
    clock |= uuidDetails['clock_seq_low'];
    clock = clock & 0x3fff;
    let node = str_pad(dechex(uuidDetails['node']), 12, '0', 'STR_PAD_LEFT');
    node = str_split(node, 2);
    node = implode(':', node);
    let contents = str_split(str_replace('-', '', uuid), 2);
    contents = implode(':', contents);
    return {
        'uuid': uuid,
        'single_integer': integerId(uuid) || BigInt(0),
        'version': uuidDetails['version'],
        'variant': uuidDetails['variant'],
        'variant_name': uuidDetails['variant_name'],
        'contents_node': node,
        'contents_time': timestamp,
        'contents_clock': clock,
        'contents': contents,
        'time_low': uuidDetails['time_low'],
        'time_mid': uuidDetails['time_mid'],
        'time_hi_and_version': uuidDetails['time_hi_and_version'],
        'clock_seq_hi_and_reserved': uuidDetails['clock_seq_hi_and_reserved'],
        'clock_seq_low': uuidDetails['clock_seq_low'],
        'node': uuidDetails['node'],
    }
}
/**
 * Calculate namespace and name.
 *
 * @param {string} namespace namespace to calculate is uuid
 * @param {string} name name to calculate
 * @param {?number} algorithm UUID::UUID_TYPE_MD5 or UUID::UUID_TYPE_SHA1 default is UUID::UUID_TYPE_SHA1
 * @return string calculated namespace and name
 */
export const calculateNamespaceAndName = (
    namespace,
    name,
    algorithm = null
) => {
    const $version = version(namespace);
    if ($version === null) {
        throw new Error(
            'Invalid namespace'
        );
    }
    if ((algorithm !== UUID_TYPE_MD5 && algorithm !== UUID_TYPE_SHA1)) {
        algorithm = $version === UUID_V3 ? UUID_TYPE_MD5 : UUID_TYPE_SHA1;
    }
    // fallback to sha1 if algorithm is not valid
    algorithm = algorithm ?? UUID_TYPE_SHA1;
    // Get hexadecimal components of namespace
    const $nHex = str_replace(['-', '{', '}'], '', namespace);
    // Binary Value
    let $nStr = '';
    // Convert Namespace UUID to bits
    for (let $i = 0, $len = $nHex.length; $i < $len; $i += 2) {
        $nStr += String.fromCharCode(parseInt($nHex[$i] + $nHex[$i + 1], 16));
    }
    // Calculate hash value
    return algorithm === UUID_TYPE_MD5 ? md5($nStr + name) : sha1($nStr + name);
}

export const generate = (
    uuidVersion,
    uuidVariant = null,
    uuidType = null,
    hashOrNamespace = null,
    node = null
) => {
    if (uuidVariant === null) {
        switch (uuidVersion) {
            case UUID_V1:
            case UUID_V2:
                uuidVariant = UUID_VARIANT_DCE;
                break;
            default:
                uuidVariant = UUID_VARIANT_RFC4122;
        }
    }

    if (uuidType === null) {
        switch (uuidVersion) {
            case UUID_V1:
            case UUID_V2:
                uuidType = UUID_TYPE_TIME;
                break;
            case UUID_V3:
                uuidType = UUID_TYPE_MD5;
                break;
            case UUID_V5:
                uuidType = UUID_TYPE_SHA1;
                break;
            case UUID_V4:
            default:
                uuidType = UUID_TYPE_RANDOM;
        }
    }

    if (typeof hashOrNamespace === 'string'
        && uuidType !== UUID_TYPE_RANDOM
        && uuidType !== UUID_TYPE_TIME
        && uuidType !== UUID_TYPE_MD5
        && uuidType !== UUID_TYPE_SHA1
        && (hashOrNamespace.length === 32 || hashOrNamespace.length === 40)
        && /^[0-9a-f]{32,40}$/i.test(hashOrNamespace)
    ) {
        uuidType = (hashOrNamespace.length === 32 ? UUID_TYPE_MD5 : UUID_TYPE_SHA1);
    }

    let timeLow, timeMid, timeHi, clockSeqHi, clockSeqLow;
    uuidVariant = (UUID_VARIANTS[uuidVariant] || UUID_VARIANTS[UUID_VARIANT_NCS]);
    if (uuidType === UUID_TYPE_MD5 || uuidType === UUID_TYPE_SHA1) {
        if (!hashOrNamespace) {
            switch (uuidType) {
                case UUID_TYPE_MD5:
                    hashOrNamespace = md5(random_bytes(16));
                    break;
                default:
                    hashOrNamespace = sha1(random_bytes(16));
            }
        } else if (uuidType === UUID_TYPE_SHA1) {
            if (hashOrNamespace.length < 40 && uuidVersion !== UUID_V5) {
                throw new Error(
                    'Invalid hash for UUID v5'
                );
            }
            if (!/^[0-9a-f]{40}$/i.test(hashOrNamespace)) {
                if (uuidVersion === 5) {
                    throw new Error(
                        'Invalid hash for UUID v5'
                    );
                } else if (uuidVersion === UUID_V3) {
                    throw new Error(
                        'Invalid hash for UUID v3'
                    );
                } else {
                    throw new Error(
                        'Invalid hash for SHA1 UUID'
                    );
                }
            }
        } else {
            if (hashOrNamespace.length < 32 && uuidVersion !== UUID_V3) {
                throw new Error(
                    'Invalid hash for UUID v3'
                );
            }
            if (!/^[0-9a-f]{32}$/i.test(hashOrNamespace)) {
                if (uuidVersion === UUID_V5) {
                    throw new Error(
                        'Invalid hash for UUID v5'
                    );
                } else if (uuidVersion === UUID_V3) {
                    throw new Error(
                        'Invalid hash for UUID v3'
                    );
                } else {
                    throw new Error(
                        'Invalid hash for MD5 UUID'
                    );
                }
            }
        }
        // 32 bits for "time_low"
        timeLow = hexdec(substr(hashOrNamespace, 0, 8)) & 0xffffffff;
        // 16 bits for "time_mid"
        timeMid = hexdec(substr(hashOrNamespace, 8, 4)) & 0xffff;
        // 16 bits for "time_hi_and_version",
        timeHi = hexdec(substr(hashOrNamespace, 12, 4)) & 0x0fff;
        // 16 bits, 8 bits for "clk_seq_hi_res",
        clockSeqHi = hexdec(substr(hashOrNamespace, 16, 2)) & 0x3f;
        // 8 bits for "clk_seq_low",
        clockSeqLow = hexdec(substr(hashOrNamespace, 18, 2)) & 0xff;
        // 48 bits for "node"
        node = (node ?? hexdec(substr(hashOrNamespace, 20, 12))) & 0xffffffffffff;
    } else {
        if (uuidType === UUID_TYPE_TIME) {
            // 60-bits timestamp
            // https://datatracker.ietf.org/doc/html/rfc4122#section-4.2.1
            // Get the current time as a 60-bit count of 100-nanosecond intervals
            // since 00:00:00.00, 15 October 1582
            let timestamp = BigInt((new Date().getTime() / 1000) * 10000000) + BigInt(0x01B21DD213814000n);
            // timeLow 32 bits of time
            timeLow = BigInt(timestamp) & BigInt(0xffffffff);
            // timeMid 16 bits of timeMid
            timeMid = (timestamp >> BigInt(32)) & BigInt(0xffff);
            // time high and version bits (12)
            timeHi = (timestamp >> BigInt(48)) & BigInt(0x0fff);
            timeLow = parseInt(timeLow.toString());
            timeMid = parseInt(timeMid.toString());
            timeHi = parseInt(timeHi.toString());
        } else {
            timeLow = (random_int(0, 0xffffffff)); // random_int
            timeMid = (random_int(0, 0xffff));
            timeHi = (random_int(0, 0x0fff));
        }
        // clock sequence high and reserved
        clockSeqHi = random_int(0, 0xffff) & 0x3f;
        clockSeqLow = random_int(0, 0xff) & 0xff;
        node = node ?? random_int(0, 0xffffffffffff);
        node = node & 0xffffffffffff;
    }
    switch (uuidVersion) {
        case 1:
            timeHi = timeHi | 0x1000;
            break;
        case 2:
            timeHi = timeHi | 0x2000;
            break;
        case 3:
            timeHi = timeHi | 0x3000;
            break;
        case 5:
            timeHi = timeHi | 0x5000;
            break;
        default:
            timeHi = timeHi | 0x4000;
    }

    // clock_seq_hi_and_variant
    clockSeqHi |= uuidVariant;
    return sprintf('%08x-%04x-%04x-%02x%02x-%012x', timeLow, timeMid, timeHi, clockSeqHi, clockSeqLow, node);
}

export const generateV1 = () => {
    return generate(UUID_V1, UUID_VARIANT_DCE, UUID_TYPE_TIME);
}
export const generateV2 = () => {
    return generate(UUID_V2, UUID_VARIANT_DCE, UUID_TYPE_TIME);
}
export const generateV3 = (namespace, name) => {
    const hash = calculateNamespaceAndName(namespace, name, UUID_TYPE_MD5);
    return generate(UUID_V3, UUID_VARIANT_RFC4122, UUID_TYPE_MD5, hash);
}
export const generateV4 = () => {
    return generate(UUID_V4, UUID_VARIANT_RFC4122, UUID_TYPE_RANDOM);
}
export const generateV5 = (namespace, name) => {
    const hash = calculateNamespaceAndName(namespace, name, UUID_TYPE_SHA1);
    return generate(UUID_V5, UUID_VARIANT_RFC4122, UUID_TYPE_SHA1, hash);
}
