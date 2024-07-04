import {readFileSync} from "node:fs";
import {extname, join} from "node:path";
import {is_string} from "./Is.js";

/**
 * @type {{[MediaType: string]: string[]}}
 */
let mimeTypes;

/**
 * @type {{[extension: string]: string}}
 */
let mimeTypeExtensions;

/**
 * MimeTypes List
 *
 * @return {{[p: string]: string[]}}
 */
export const MimeTypes = () => {
    if (mimeTypes) {
        return mimeTypes;
    }
    mimeTypeExtensions = {};
    mimeTypes = {};
    let alternatesMediaTypes = [];
    let start = false;

    /**
     * @link https://svn.apache.org/repos/asf/httpd/httpd/trunk/docs/conf/mime.types
     */
    readFileSync(join(__dirname, 'mime.types'), 'utf8')
        .split('\n')
        .forEach((line) => {
            if (line.startsWith('#')) {
                if (!start) {
                    return;
                }
                alternatesMediaTypes.push(line);
                return;
            }
            let [type, ...extensions] = line.split(/\s+/);
            type = type.trim().toLowerCase();
            mimeTypes[type] = extensions.map((ext) => ext.trim().toLowerCase()).filter((ext) => ext.length > 0);
            extensions.forEach((ext) => {
                mimeTypeExtensions[ext] = type;
            });
            if (alternatesMediaTypes.length) {
                while (alternatesMediaTypes.length > 0) {
                    mimeTypes[alternatesMediaTypes.shift()] = extensions;
                }
            }
        });
    Object.freeze(mimeTypes);
    Object.freeze(mimeTypeExtensions);
    return mimeTypes;
}

/**
 * MimeType Extensions List
 *
 * @return {{[extension: string]: string}}
 */
export const MimeTypeExtensions = () => {
    if (!mimeTypeExtensions) {
        MimeTypes();
    }
    return mimeTypeExtensions;
}

/**
 * Get MimeType by extension
 *
 * @param {string} extension
 * @return {?string}
 */
export const MimeTypeExtension = (extension) => {
    extension = is_string(extension) ? extension.trim().toLowerCase() : null;
    if (!extension) {
        return null;
    }
    if (extension.includes('/') || extension.includes('\\')) {
        extension = extname(extension);
    }
    extension = extension.startsWith('.') ? extension.substring(1) : extension;
    return MimeTypeExtensions()[extension] || null;
}

/**
 * Get extension by MimeType
 *
 * @param {string} mediaType
 * @return {?string[]}
 */
export const ExtensionsMimeType = (mediaType) => {
    mediaType = is_string(mediaType) ? mediaType.trim().toLowerCase() : null;
    if (!mediaType || mediaType.includes('/')) {
        return null;
    }

    return MimeTypes()[mediaType] || null;
}

/**
 * Get extension by MimeType
 *
 * @param mediaType
 * @return {?string}
 */
export const ExtensionMimeType = (mediaType) => {
    mediaType = is_string(mediaType) ? mediaType.trim().toLowerCase() : null;
    if (!mediaType || mediaType.includes('/')) {
        return null;
    }
    const extensions = MimeTypeExtensions();
    for (let extension in extensions) {
        if (extensions[extension] === mediaType) {
            return extension;
        }
    }
    return null;
}
