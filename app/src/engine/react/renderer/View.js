import {basename, extname, join} from "node:path";
import {existsSync, statSync} from "node:fs";
import RuntimeException from "../../../errors/exceptions/RuntimeException.js";
import {is_array, is_string} from "../../../helpers/Is.js";
import {sprintf} from "../../../helpers/Formatting.js";
import {__} from "../../../l10n/Translator.js";

class View {
    /**
     * View
     *
     * @param {string} name
     * @param {{
     *     defaultEngine: string,
     *     engines: {
     *     [key: string]: function
     *     },
     *     root: string
     * }} options
     * @constructor
     */
    constructor(name, options) {
        // get extension
        this.defaultEngine = options.defaultEngine;
        this.ext = options.defaultEngine[0] !== '.'
            ? '.' + options.defaultEngine
            : options.defaultEngine;
        this.name = name;
        if (is_string(options.root)) {
            options.root = [options.root];
        }
        let root = null;
        let file = this.resolve(root, name);
        this.path = file;
        for (let i = 0; i < options.root.length; i++) {
            let _root = options.root[i];
            file = this.resolve(_root, name);
            if (file) {
                root = _root;
                this.root = _root;
                this.ext = extname(file);
                this.path = file;
                break;
            }
        }
        root = root || options.root;
        this.path =  this.path || this.resolve(this.root, name);
        if (this.defaultEngine) {
            let extensionDefault = this.defaultEngine[0] !== '.' ? '.' + this.defaultEngine : this.defaultEngine;
            this.engine = extensionDefault ? options.engines[extensionDefault] : null;
        }
        root = !is_array(root) ? [root] : root;
        if (!this.engine || !this.path) {
            const originalEngine = this.engine || null;
            this.engine = null;
            for (let ext in options.engines) {
                if (this.path) {
                    break;
                }
                for (let i = 0; i < root.length; i++) {
                    this.path = this.resolve(root[i], name + ext);
                    if (this.path) {
                        this.root = root[i];
                        this.engine = options.engines[ext];
                        this.ext = ext;
                        break;
                    }
                }
            }
            this.root = this.root || root[0];
            this.path = this.path || join(this.root, name + this.ext);
            this.engine = this.engine || originalEngine;
        }
        if (!this.engine) {
            const mod = this.ext.slice(1);
            throw new RuntimeException(
                sprintf(__('Module "%s" does not provide a view engine.'), mod)
            );
        }
    }

    /**
     * Render the view
     *
     * @param {{[key: string]: any}} options
     * @param {(err: Error, html: string) => void} callback
     */
    render(options, callback) {
        if (typeof callback !== 'function') {
            callback = () => null;
        }
        let res = this.engine(this.path, options, (...args) => {
            callback(...args);
        });
        if (res instanceof Promise) {
            res.catch((err) => {
                callback(err);
            });
        }
    }

    /**
     * Resolve the file within the given directory.
     *
     * @param {string|string[]} directory The directory to resolve from
     * @param {string} file The file path to resolve
     * @return {string|undefined} The resolved file path or undefined
     */
    resolve(directory, file) {
        const ext = this.ext;
        if (!is_string(file) || file === '') {
            return;
        }

        if (file.startsWith('file://')) {
            file = file.slice(7);
        }

        if (/^(\/|[a-z]+:[\\\/])/i.test(file) && existsSync(file) && statSync(file).isFile()) {
            return file;
        }

        if (is_string(directory)) {
            directory = [directory];
        }
        if (!Array.isArray(directory)) {
            return;
        }
        for (let i = 0; i < directory.length; i++) {
            let dir = directory[i];
            if (!is_string(dir)) {
                continue;
            }

            // check if absolute
            // <path>.<ext>
            let path = join(dir, file);
            let stat = existsSync(path) ? statSync(path) : null;

            if (stat && stat.isFile()) {
                return path;
            }
            path = join(dir, file + ext);
            stat = existsSync(path) ? statSync(path) : null;
            if (stat && stat.isFile()) {
                return path;
            }
            // <path>/index.<ext>
            path = join(dir, basename(file, ext), 'index' + ext);
            stat = existsSync(path) ? statSync(path) : null;

            if (stat && stat.isFile()) {
                return path;
            }
        }
    }
}

export default View;
