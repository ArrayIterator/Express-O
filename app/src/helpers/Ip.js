// noinspection JSUnusedGlobalSymbols

export const IPv4_REGEX = /^(?:[0-1]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[0-1]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[0-1]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])\.(?:[0-1]?[0-9]{1,2}|2[0-4][0-9]|25[0-5])$/;
// ::1 is also valid IPv6 address
export const IPv6_REGEX = /^([0-9a-fA-F]{0,4}:){1,7}([0-9a-fA-F]{1,4})$/;

// broadcast range
export const IPv4_BROADCAST_RANGE = '255.255.255.255/32';

/**
 * 0.0.0.0/8: Current network (only valid as source address)
 * 10.0.0.0/8: Private network
 * 100.64.0.0/10: Shared Address Space
 * 127.0.0.0/8: Loopback
 * 169.254.0.0/16: Link-local
 * 172.16.0.0/12: Private network
 * 192.0.0.0/24: IETF Protocol Assignments
 * 192.0.2.0/24: TEST-NET-1, documentation and examples
 * 192.88.99.0/24: IPv6 to IPv4 relay
 * 192.168.0.0/16: Private network
 * 198.18.0.0/15: Network Interconnect Device Benchmark Testing
 * 198.51.100.0/24: TEST-NET-2, documentation and examples
 * 203.0.113.0/24: TEST-NET-3, documentation and examples
 * 224.0.0.0/4: IP Multicast (former Class D network)
 * 240.0.0.0/4: Reserved (former Class E network)
 * 255.255.255.255/32: Broadcast
 * @type {string[]}
 */
export const IPv4_BOGON_RANGES = [
    '0.0.0.0/8',
    '10.0.0.0/8',
    '100.64.0.0/10',
    '127.0.0.0/8',
    '169.254.0.0/16',
    '172.16.0.0/12',
    '192.0.0.0/24',
    '192.0.2.0/24',
    '192.88.99.0/24',
    '192.168.0.0/16',
    '198.18.0.0/15',
    '198.51.100.0/24',
    '203.0.113.0/24',
    '224.0.0.0/4',
    '240.0.0.0/4',
    IPv4_BROADCAST_RANGE,
];

/**
 * ::/128: Unspecified address
 * ::1/128: Loopback address
 * 2001::/32: Teredo tunneling
 * 2002::/16: 6to4
 * fc00::/7: Unique local address
 * fe80::/10: Link-local address
 * ff00::/8: Multicast
 *
 * @type {string[]}
 */
export const IPv6_RESERVED_RANGES = [
    '::/128', // Unspecified address
    '::1/128', // Loopback address
    '2001::/32', // Teredo tunneling
    '2002::/16', // 6to4
    'fc00::/7', // Unique local address
    'fe80::/10', // Link-local address
    'ff00::/8', // Multicast
];

/**
 * Check if an IP is a bogon IP
 *
 * @param ip
 * @return {boolean}
 */
export const is_bogon_ip = (ip) => {
    return ip_in_range(ip, [
        ...IPv4_BOGON_RANGES,
        ...IPv6_RESERVED_RANGES,
    ]);
}

/**
 * Check if an IP is a broadcast IP
 *
 * @param {string} ip
 * @return {boolean}
 */
export const is_broadcast_ip = (ip) => {
    return ip_in_range(ip, IPv4_BROADCAST_RANGE);
}

/**
 * Filter IPv4 address
 *
 * @param {string} ip
 * @return {string|false}
 */
export const filter_ipv4 = (ip) => {
    const split = ip.split('.');
    if (split.length !== 4) {
        return false;
    }
    const number = '0123456789';
    for (let i = 0; i < split.length; i++) {
        let num = split[i];
        if (num.length > 3) {
            return false;
        }
        for (let j = 0; j < num.length; j++) {
            if (!number.includes(num[j])) {
                return false;
            }
        }
        num = parseInt(num);
        if (num > 255) {
            return false;
        }
        split[i] = num;
    }
    return split.join('.');
}

/**
 * Filter IPv6 address
 *
 * @param {string} ip
 * @return {*|boolean}
 */
export const filter_ipv6 = (ip) => {
    if (typeof ip !== 'string' || !ip.includes(':') || ip.includes('.')) {
        return false;
    }
    ip = ip.toLowerCase();
    const split = ip.split(':');
    if (split.length > 8 || split.length < 3) {
        return false;
    }
    const hex_chars = '0123456789abcdef';
    for (let i = 0; i < split.length; i++) {
        let hex = split[i];
        if (hex.length > 4) {
            return false;
        }
        for (let j = 0; j < split[i].length; j++) {
            if (!hex_chars.includes(split[i][j])) {
                return false;
            }
        }
    }

    return split
        .join(':')
        .replace(/(^:|)0+/, '$1')
        .replace(/^::+/, '::');
}

/**
 * Get IP version
 *
 * @param {string} ip
 * @return {4|6|null}
 */
export const ip_version = (ip) => {
    if (filter_ipv4(ip) !== false) {
        return 4;
    }
    if (filter_ipv6(ip) !== false) {
        return 6;
    }
    return null;
}

/**
 * Convert IP to long
 *
 * @param {string} ip
 * @return {number|BigInt|boolean}
 */
export const ip2long = (ip) => {
    const version = ip_version(ip);
    if (version === null) {
        return false;
    }
    ip = version === 4 ? filter_ipv4(ip) : filter_ipv6(ip);
    if (ip === false) {
        return false;
    }

    if (version === 4) {
        return ip.split('.').reduce((acc, octet, i) => acc + (parseInt(octet) << (24 - 8 * i)), 0) >>> 0;
    }
    let bigInt = BigInt(0);
    ip.split(':').forEach((hextet, i) => {
        bigInt += BigInt(parseInt(hextet, 16) << (112 - 16 * i));
    });

    // check if bigint less than MAX_SAFE_INTEGER
    if (bigInt <= BigInt(Number.MAX_SAFE_INTEGER)) {
        return Number(bigInt);
    }
    return bigInt;
}

/**
 * Convert long to IP
 *
 * @param {number} long
 * @return {string|boolean}
 */
export const long2ip = (long) => {
    // 2^128 = 340282366920938463463374607431768211455
    const LargestInteger = BigInt('340282366920938463463374607431768211455');
    const CurrentInteger = BigInt(long);
    if (CurrentInteger < BigInt(0) || CurrentInteger > LargestInteger) {
        return false;
    }
    // if ipv4 long
    if (CurrentInteger <= CurrentInteger) {
        const Shifter = BigInt(0xFF);
        return [
            CurrentInteger >> BigInt(24) & Shifter,
            CurrentInteger >> BigInt(16) & Shifter,
            CurrentInteger >> BigInt(8) & Shifter,
            CurrentInteger & Shifter,
        ].join('.');
    }
    if (CurrentInteger <= LargestInteger) {
        const Shifter = BigInt(0xFFFF);
        return [
            (CurrentInteger >> BigInt(112)) & Shifter,
            (CurrentInteger >> BigInt(96)) & Shifter,
            (CurrentInteger >> BigInt(80)) & Shifter,
            (CurrentInteger >> BigInt(64)) & Shifter,
            (CurrentInteger >> BigInt(48)) & Shifter,
            (CurrentInteger >> BigInt(32)) & Shifter,
            (CurrentInteger >> BigInt(16)) & Shifter,
            CurrentInteger & Shifter,
        ].map(x => x.toString(16)).join(':');
    }

    return false;
}

/**
 * Check if an IP is in a range
 *
 * @param {string} ip
 * @param {string|Array<string>} ip_ranges
 * @return {boolean}
 */
export const ip_in_range = (ip, ip_ranges) => {
    const version = ip_version(ip);
    if (version === null) {
        return false;
    }
    if (typeof ip_ranges === 'string') {
        ip_ranges = [ip_ranges];
    }
    if (!Array.isArray(ip_ranges)) {
        return false;
    }
    ip = version === 4 ? filter_ipv4(ip) : filter_ipv6(ip);
    if (ip === false) {
        return false;
    }
    let ipNum;
    ipNum = ip2long(ip);
    for (let _ip of ip_ranges) {
        if (typeof _ip !== 'string') {
            continue;
        }
        let _version;
        let range;
        if (!_ip.includes('/')) {
            _ip = filter_ipv4(_ip);
            if (_ip === ip) {
                return true;
            }
            continue;
        }

        let split = _ip.split('/');
        if (split.length !== 2) {
            continue;
        }
        _version = ip_version(split[0]);
        if (_version === null || !split[1] || !/^\d+$/.test(split[1])) {
            continue;
        }
        range = parseInt(split[1]);
        _ip = split[0];
        if (_version === 4 && (range < 0 || range > 32)) {
            continue;
        }
        if (_version === 6 && (range < 0 || range > 128)) {
            continue;
        }
        _ip = _version === 4 ? filter_ipv4(_ip) : filter_ipv6(_ip);
        if (_ip === false) {
            continue;
        }

        if (_ip === ip) {
            return true;
        }
        let mask = _version === 4 ? (1 << (32 - range)) - 1 : (1 << (128 - range)) - 1;
        let _ipNum = ip2long(_ip);
        if ((_ipNum & ~mask) === (ipNum & ~mask)) {
            return true;
        }
    }
    return false;
}
