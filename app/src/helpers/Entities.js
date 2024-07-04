// noinspection JSUnusedGlobalSymbols

/**
 * @typedef {1} HTML_ENTITIES
 * @typedef {0} HTML_SPECIALCHARS
 */
import {is_integer, is_numeric, is_numeric_integer} from "./Is.js";
import {intval, strval} from "./DataType.js";

const HTML_ENTITIES = 1;
const HTML_SPECIALCHARS = 0;

/* --------------------------
ENT_COMPAT	Will convert double-quotes and leave single-quotes alone.
ENT_QUOTES	Will convert both double and single quotes.
ENT_NOQUOTES	Will leave both double and single quotes unconverted.
ENT_IGNORE	Silently discard invalid code unit sequences instead of returning an empty string. Using this flag is discouraged as it » may have security implications.
ENT_SUBSTITUTE	Replace invalid code unit sequences with a Unicode Replacement Character U+FFFD (UTF-8) or &#FFFD; (otherwise) instead of returning an empty string.
ENT_DISALLOWED	Replace invalid code points for the given document type with a Unicode Replacement Character U+FFFD (UTF-8) or &#FFFD; (otherwise) instead of leaving them as is. This may be useful, for instance, to ensure the well-formedness of XML documents with embedded external content.
ENT_HTML401	Handle code as HTML 4.01.
ENT_XML1	Handle code as XML 1.
ENT_XHTML	Handle code as XHTML.
ENT_HTML5	Handle code as HTML 5.
 */
const ENT_COMPAT = 2;
const ENT_QUOTES = 3;
const ENT_NOQUOTES = 0;
const ENT_IGNORE = 4;
const ENT_SUBSTITUTE = 8
const ENT_DISALLOWED = 128
const ENT_HTML401 = 0;
const ENT_XML1 = 16;
const ENT_XHTML = 32;
const ENT_HTML5 = 48;

/**
 * HTML translation tables
 */
const HTML_TRANSLATIONS_TABLES = {
    [HTML_SPECIALCHARS]: {
        "\"": "&quot;",
        "&": "&amp;",
        "'": "&#039;",
        "<": "&lt;",
        ">": "&gt;"
    },
    [HTML_ENTITIES]: {
        "\"": "&quot;",
        "&": "&amp;",
        "'": "&#039;",
        "<": "&lt;",
        ">": "&gt;",
        "\u00a0": "&nbsp;",
        "\u00a1": "&iexcl;",
        "\u00a2": "&cent;",
        "\u00a3": "&pound;",
        "\u00a4": "&curren;",
        "\u00a5": "&yen;",
        "\u00a6": "&brvbar;",
        "\u00a7": "&sect;",
        "\u00a8": "&uml;",
        "\u00a9": "&copy;",
        "\u00aa": "&ordf;",
        "\u00ab": "&laquo;",
        "\u00ac": "&not;",
        "\u00ad": "&shy;",
        "\u00ae": "&reg;",
        "\u00af": "&macr;",
        "\u00b0": "&deg;",
        "\u00b1": "&plusmn;",
        "\u00b2": "&sup2;",
        "\u00b3": "&sup3;",
        "\u00b4": "&acute;",
        "\u00b5": "&micro;",
        "\u00b6": "&para;",
        "\u00b7": "&middot;",
        "\u00b8": "&cedil;",
        "\u00b9": "&sup1;",
        "\u00ba": "&ordm;",
        "\u00bb": "&raquo;",
        "\u00bc": "&frac14;",
        "\u00bd": "&frac12;",
        "\u00be": "&frac34;",
        "\u00bf": "&iquest;",
        "\u00c0": "&Agrave;",
        "\u00c1": "&Aacute;",
        "\u00c2": "&Acirc;",
        "\u00c3": "&Atilde;",
        "\u00c4": "&Auml;",
        "\u00c5": "&Aring;",
        "\u00c6": "&AElig;",
        "\u00c7": "&Ccedil;",
        "\u00c8": "&Egrave;",
        "\u00c9": "&Eacute;",
        "\u00ca": "&Ecirc;",
        "\u00cb": "&Euml;",
        "\u00cc": "&Igrave;",
        "\u00cd": "&Iacute;",
        "\u00ce": "&Icirc;",
        "\u00cf": "&Iuml;",
        "\u00d0": "&ETH;",
        "\u00d1": "&Ntilde;",
        "\u00d2": "&Ograve;",
        "\u00d3": "&Oacute;",
        "\u00d4": "&Ocirc;",
        "\u00d5": "&Otilde;",
        "\u00d6": "&Ouml;",
        "\u00d7": "&times;",
        "\u00d8": "&Oslash;",
        "\u00d9": "&Ugrave;",
        "\u00da": "&Uacute;",
        "\u00db": "&Ucirc;",
        "\u00dc": "&Uuml;",
        "\u00dd": "&Yacute;",
        "\u00de": "&THORN;",
        "\u00df": "&szlig;",
        "\u00e0": "&agrave;",
        "\u00e1": "&aacute;",
        "\u00e2": "&acirc;",
        "\u00e3": "&atilde;",
        "\u00e4": "&auml;",
        "\u00e5": "&aring;",
        "\u00e6": "&aelig;",
        "\u00e7": "&ccedil;",
        "\u00e8": "&egrave;",
        "\u00e9": "&eacute;",
        "\u00ea": "&ecirc;",
        "\u00eb": "&euml;",
        "\u00ec": "&igrave;",
        "\u00ed": "&iacute;",
        "\u00ee": "&icirc;",
        "\u00ef": "&iuml;",
        "\u00f0": "&eth;",
        "\u00f1": "&ntilde;",
        "\u00f2": "&ograve;",
        "\u00f3": "&oacute;",
        "\u00f4": "&ocirc;",
        "\u00f5": "&otilde;",
        "\u00f6": "&ouml;",
        "\u00f7": "&divide;",
        "\u00f8": "&oslash;",
        "\u00f9": "&ugrave;",
        "\u00fa": "&uacute;",
        "\u00fb": "&ucirc;",
        "\u00fc": "&uuml;",
        "\u00fd": "&yacute;",
        "\u00fe": "&thorn;",
        "\u00ff": "&yuml;",
        "\u0152": "&OElig;",
        "\u0153": "&oelig;",
        "\u0160": "&Scaron;",
        "\u0161": "&scaron;",
        "\u0178": "&Yuml;",
        "\u0192": "&fnof;",
        "\u02c6": "&circ;",
        "\u02dc": "&tilde;",
        "\u0391": "&Alpha;",
        "\u0392": "&Beta;",
        "\u0393": "&Gamma;",
        "\u0394": "&Delta;",
        "\u0395": "&Epsilon;",
        "\u0396": "&Zeta;",
        "\u0397": "&Eta;",
        "\u0398": "&Theta;",
        "\u0399": "&Iota;",
        "\u039a": "&Kappa;",
        "\u039b": "&Lambda;",
        "\u039c": "&Mu;",
        "\u039d": "&Nu;",
        "\u039e": "&Xi;",
        "\u039f": "&Omicron;",
        "\u03a0": "&Pi;",
        "\u03a1": "&Rho;",
        "\u03a3": "&Sigma;",
        "\u03a4": "&Tau;",
        "\u03a5": "&Upsilon;",
        "\u03a6": "&Phi;",
        "\u03a7": "&Chi;",
        "\u03a8": "&Psi;",
        "\u03a9": "&Omega;",
        "\u03b1": "&alpha;",
        "\u03b2": "&beta;",
        "\u03b3": "&gamma;",
        "\u03b4": "&delta;",
        "\u03b5": "&epsilon;",
        "\u03b6": "&zeta;",
        "\u03b7": "&eta;",
        "\u03b8": "&theta;",
        "\u03b9": "&iota;",
        "\u03ba": "&kappa;",
        "\u03bb": "&lambda;",
        "\u03bc": "&mu;",
        "\u03bd": "&nu;",
        "\u03be": "&xi;",
        "\u03bf": "&omicron;",
        "\u03c0": "&pi;",
        "\u03c1": "&rho;",
        "\u03c2": "&sigmaf;",
        "\u03c3": "&sigma;",
        "\u03c4": "&tau;",
        "\u03c5": "&upsilon;",
        "\u03c6": "&phi;",
        "\u03c7": "&chi;",
        "\u03c8": "&psi;",
        "\u03c9": "&omega;",
        "\u03d1": "&thetasym;",
        "\u03d2": "&upsih;",
        "\u03d6": "&piv;",
        "\u2002": "&ensp;",
        "\u2003": "&emsp;",
        "\u2009": "&thinsp;",
        "\u200c": "&zwnj;",
        "\u200d": "&zwj;",
        "\u200e": "&lrm;",
        "\u200f": "&rlm;",
        "\u2013": "&ndash;",
        "\u2014": "&mdash;",
        "\u2018": "&lsquo;",
        "\u2019": "&rsquo;",
        "\u201a": "&sbquo;",
        "\u201c": "&ldquo;",
        "\u201d": "&rdquo;",
        "\u201e": "&bdquo;",
        "\u2020": "&dagger;",
        "\u2021": "&Dagger;",
        "\u2022": "&bull;",
        "\u2026": "&hellip;",
        "\u2030": "&permil;",
        "\u2032": "&prime;",
        "\u2033": "&Prime;",
        "\u2039": "&lsaquo;",
        "\u203a": "&rsaquo;",
        "\u203e": "&oline;",
        "\u2044": "&frasl;",
        "\u20ac": "&euro;",
        "\u2111": "&image;",
        "\u2118": "&weierp;",
        "\u211c": "&real;",
        "\u2122": "&trade;",
        "\u2135": "&alefsym;",
        "\u2190": "&larr;",
        "\u2191": "&uarr;",
        "\u2192": "&rarr;",
        "\u2193": "&darr;",
        "\u2194": "&harr;",
        "\u21b5": "&crarr;",
        "\u21d0": "&lArr;",
        "\u21d1": "&uArr;",
        "\u21d2": "&rArr;",
        "\u21d3": "&dArr;",
        "\u21d4": "&hArr;",
        "\u2200": "&forall;",
        "\u2202": "&part;",
        "\u2203": "&exist;",
        "\u2205": "&empty;",
        "\u2207": "&nabla;",
        "\u2208": "&isin;",
        "\u2209": "&notin;",
        "\u220b": "&ni;",
        "\u220f": "&prod;",
        "\u2211": "&sum;",
        "\u2212": "&minus;",
        "\u2217": "&lowast;",
        "\u221a": "&radic;",
        "\u221d": "&prop;",
        "\u221e": "&infin;",
        "\u2220": "&ang;",
        "\u2227": "&and;",
        "\u2228": "&or;",
        "\u2229": "&cap;",
        "\u222a": "&cup;",
        "\u222b": "&int;",
        "\u2234": "&there4;",
        "\u223c": "&sim;",
        "\u2245": "&cong;",
        "\u2248": "&asymp;",
        "\u2260": "&ne;",
        "\u2261": "&equiv;",
        "\u2264": "&le;",
        "\u2265": "&ge;",
        "\u2282": "&sub;",
        "\u2283": "&sup;",
        "\u2284": "&nsub;",
        "\u2286": "&sube;",
        "\u2287": "&supe;",
        "\u2295": "&oplus;",
        "\u2297": "&otimes;",
        "\u22a5": "&perp;",
        "\u22c5": "&sdot;",
        "\u2308": "&lceil;",
        "\u2309": "&rceil;",
        "\u230a": "&lfloor;",
        "\u230b": "&rfloor;",
        "\u2329": "&lang;",
        "\u232a": "&rang;",
        "\u25ca": "&loz;",
        "\u2660": "&spades;",
        "\u2663": "&clubs;",
        "\u2665": "&hearts;",
        "\u2666": "&diams;"
    }
};

let HTML_TRANSLATION_TABLES_HTML_ENTITIES_FLIPPED;

/**
 * Get flipped html translation tables
 *
 * @return {{[key: string]: string}|Object<string>}
 */
const get_html_entities_flipped = () => {
    if (HTML_TRANSLATION_TABLES_HTML_ENTITIES_FLIPPED) {
        return HTML_TRANSLATION_TABLES_HTML_ENTITIES_FLIPPED;
    }
    HTML_TRANSLATION_TABLES_HTML_ENTITIES_FLIPPED = {};
    for (let key in HTML_TRANSLATIONS_TABLES) {
        if (!HTML_TRANSLATIONS_TABLES.hasOwnProperty(key)) {
            continue;
        }
        HTML_TRANSLATION_TABLES_HTML_ENTITIES_FLIPPED[HTML_TRANSLATIONS_TABLES[key]] = key;
    }
    return HTML_TRANSLATION_TABLES_HTML_ENTITIES_FLIPPED;
}

/**
 * Get html translation tables
 *
 * @template {HTML_ENTITIES|HTML_SPECIALCHARS} T
 * @param {T} type
 * @returns {HTML_TRANSLATIONS_TABLES[T]}
 */
export const get_html_translation_tables = (type = HTML_SPECIALCHARS) => {
    type = is_numeric_integer(type) ? intval(type) : HTML_SPECIALCHARS;
    type = (type % 1);
    return HTML_TRANSLATIONS_TABLES[type];
}

const encode = (type = HTML_SPECIALCHARS, str, flags, double_encode = true) => {
    if (!str) {
        return '';
    }
    if (is_numeric(str)) {
        return strval(str);
    }
    type = is_numeric_integer(type) ? intval(type) : ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML401;
    type = [HTML_ENTITIES, HTML_SPECIALCHARS].includes(type) ? HTML_SPECIALCHARS : type;
    flags = !is_integer(flags) ? ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML401 : flags;
    const translation_tables = get_html_translation_tables(type)
    const regex = new RegExp(
        '&(?:#[0-9]+|#x[0-9a-fA-F]+|[a-zA-Z][0-9a-zA-Z]*);|[^\u0000-\u00ff]|' +
        Object.keys(translation_tables)
            .join('|'),
        'g'
    );

    return str.replace(regex, (entity) => {
        if (entity === "'") {
            if ((flags & ENT_COMPAT) === ENT_COMPAT || (flags & ENT_NOQUOTES) === ENT_NOQUOTES) {
                return entity;
            }
            if ((flags & ENT_QUOTES) === ENT_QUOTES) {
                if ((flags & ENT_HTML401) === ENT_HTML401) {
                    return '&#039;';
                }
                for (let _ent of [ ENT_XML1, ENT_XHTML, ENT_HTML5 ]) {
                    if ((flags & _ent) === _ent) {
                        return '&apos;';
                    }
                }
            }
        }
        if (entity === '"') {
            if ((flags & ENT_NOQUOTES) === ENT_NOQUOTES)  {
                return entity;
            }
        }

        if (translation_tables.hasOwnProperty(entity)) {
            return translation_tables[entity];
        }

        if (double_encode) {
            if (entity[0] === '&') {
                return translation_tables['&'] + entity.substring(1);
            }
        }

        if (entity.length === 1) {
            if ( (flags & ENT_SUBSTITUTE) ===  ENT_SUBSTITUTE || ENT_DISALLOWED === (flags & ENT_DISALLOWED)) {
                return '&#' + parseInt(entity, 16).toString().padStart(4, '0') + ';';
            }
            if ((flags & ENT_IGNORE) === ENT_IGNORE) {
                return '';
            }
            return '';
        }

        return entity;
    });
}

/**
 * Decode html entities
 *
 * @param {string} str
 * @param {int} flags
 * @return {string}
 */
export const html_entity_decode = (str, flags = ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML401) => {
    if (!str) {
        return '';
    }
    if (is_numeric(str)) {
        return strval(str);
    }
    flags = !is_integer(flags) ? ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML401 : flags;
    const translation_tables = get_html_entities_flipped();
    const regex = new RegExp(
        '&(?:#[0-9]+|#x[0-9a-fA-F]+);|' +
        Object.values(translation_tables)
            .join('|'),
        'g'
    );
    return str.replace(regex, (entity) => {
        if (entity === "&apos;" || entity === '&#039;') {
            if ((flags & ENT_QUOTES) === ENT_QUOTES) {
                return "'";
            }
            return entity;
        }
        if (entity === '&quot;') {
            if ((flags & ENT_NOQUOTES) === ENT_NOQUOTES)  {
                return entity;
            }
            return '"';
        }
        if (translation_tables.hasOwnProperty(entity)) {
            return translation_tables[entity];
        }
        return entity.substring(1, -1).split('').map(s => String.fromCharCode(parseInt(s,16))).join('');
    });
}

export const html_entities = (str, flags = ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML401, double_encode = true) => encode(HTML_ENTITIES, str, double_encode)
export const html_specialchars = (str, flags = ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML401, double_encode = true) => encode(HTML_SPECIALCHARS, str, double_encode)
