import Config, {REACT_ENGINE_DIR} from "../../app/Config.js";
import {basename, extname, resolve as pathResolve} from "node:path";
import {md5} from "../../helpers/Hash.js";
import {accessSync, constants, existsSync, mkdirSync, readFileSync, statSync, writeFileSync} from "node:fs";
import RuntimeException from "../../errors/exceptions/RuntimeException.js";
import {sprintf} from "../../helpers/Formatting.js";
import {__} from "../../l10n/Translator.js";
import {E_ERROR} from "../../errors/exceptions/ErrorCode.js";
import {dirname} from "path";
import {transformSync} from "@babel/core";
import HTMLReactParser from "html-react-parser";

/**
 * Compiled Scripts Directory
 *
 * @type {string}
 */
export const COMPILED_SCRIPTS_DIR = REACT_ENGINE_DIR;

/**
 * Compilation Extension
 *
 * @type {string}
 */
export const COMPILATION_EXTENSION = '.c.min.js';

/**
 * Cached collection of files functions
 *
 * @type {{[key: string]: React.ReactNode|undefined}}
 */
const FunctionCaches = {};

/**
 * Error
 *
 * @type {?Error}
 */
export let LastError = null;

/**
 * Generate File Name
 *
 * @param fileName
 * @return {string}
 */
export const GenerateScriptCacheFileName = (fileName) => {
    const baseName = basename(fileName);
    const name = baseName.replace(/\.[^.]+$/, '');
    const ext = extname(baseName).toLowerCase().replace(/^\./, '');
    return pathResolve(
        COMPILED_SCRIPTS_DIR,
        ext,
        name + '-' + md5(fileName) + COMPILATION_EXTENSION
    );
}

/**
 * Compile TSX
 *
 * @param {string} fileName
 * @return {Promise<?[[code:string], [fileName:string]]>}
 */
export const CompileTsFile = (fileName) => {
    return new Promise(async (resolve, reject) => {
        if (!/\.(tsx?|jsx)$/i.test(fileName)) {
            reject(new RuntimeException(
                sprintf(
                    __('File %s is not a valid file'),
                    fileName
                ),
                E_ERROR
            ));
            return;
        }
        if (!existsSync(fileName)) {
            reject(new RuntimeException(
                sprintf(
                    __('File %s has not found'),
                    fileName
                ),
                E_ERROR
            ));
            return;
        }
        if (!statSync(fileName).isFile()) {
            reject(new RuntimeException(
                sprintf(
                    __('%s is not a file'),
                    fileName
                ),
                E_ERROR
            ));
            return;
        }
        const directory = dirname(fileName);
        const scriptName = GenerateScriptCacheFileName(fileName);
        const scriptDir = dirname(scriptName);
        let code;
        try {
            accessSync(fileName, constants.R_OK);
            code = readFileSync(fileName, 'utf-8');
        } catch (e) {
            reject(new RuntimeException(
                sprintf(
                    __('File %s is not readable'),
                    fileName
                ),
                E_ERROR,
                e
            ));
            return;
        }

        const sourceHash = md5(code);
        // always recompile if test mode
        if (!Config.is_test && existsSync(scriptName)) {
            try {
                let compiledCode = readFileSync(scriptName, 'utf-8');
                let comments = compiledCode.match(/^\/\/ ([^\n]+\n)/);
                if (comments) {
                    comments = comments[1];
                    try {
                        compiledCode = compiledCode.substring(comments.length);
                        comments = JSON.parse(comments);
                        if (comments.source_file === fileName
                            && comments.source_hash === sourceHash
                            && comments.compiled_hash === md5(compiledCode)
                        ) {
                            resolve([compiledCode, scriptName]);
                            return [compiledCode, scriptName];
                        }
                    } catch (error) {
                        // ignore
                    }
                    compiledCode = null;
                }
                compiledCode = null;
            } catch (e) {
                // ignore
            }
        }

        try {
            code = transformSync(code, {
                configFile: false,
                sourceType: "module",
                presets: [
                    "@babel/preset-modules",
                    "@babel/preset-react",
                    [
                        "@babel/preset-typescript",
                        {
                            "isTSX": true,
                            "allExtensions": true
                        }
                    ]
                ],
                compact: 'auto',
                comments: false,
                minified: true,
                targets: {
                    node: 'current'
                },
                plugins: [
                    '@babel/plugin-transform-typescript',
                    ['@babel/plugin-transform-react-jsx', {
                        "runtime": "automatic"
                    }],
                ]
            }).code;
        } catch (e) {
            LastError = e;
            reject(e);
            return;
        }
        if (!existsSync(scriptDir)) {
            mkdirSync(scriptDir, {recursive: true});
        }
        try {
            accessSync(scriptDir, constants.W_OK);
        } catch (e) {
            reject(new RuntimeException(
                sprintf(
                    __('%s is not writable'),
                    scriptDir
                ),
                E_ERROR,
                e
            ));
            return;
        }

        // check if contains import source and dot
        if (code.includes('import')) {
            const _imports = Array.from(
                code.matchAll(/import(?!from)(?:\{|\s+[^{])[^"']+\s*from(?<from>(?<sep>['"])(?<file>\.[^'"]+)\k<sep>)/g)
            ).map((match) => {
                return {
                    import: match[0],
                    from: match.groups.from,
                    file: match.groups.file,
                    separator: match.groups.sep
                };
            });
            const unresolved = {};
            for (let imp of _imports) {
                const importFile = pathResolve(directory, imp.file);
                if (!existsSync(importFile)) {
                    unresolved[imp.import] = [importFile, imp.from, imp.separator];
                } else {
                    code = code.replace(
                        imp.import,
                        imp.import.replace(imp.from, imp.separator + importFile + imp.separator)
                    );
                }
            }
            const ext = ['.tsx', '.ts', '.jsx']; // lowercase only
            for (let [imp, [importFile, _from, sep]] of Object.entries(unresolved)) {
                for (let e of ext) {
                    const file = importFile + e;
                    if (existsSync(file)) {
                        let compiled = await CompileTsFile(file, false).then(e => e).catch(() => null);
                        if (compiled) {
                            code = code.replace(
                                imp,
                                imp.replace(_from, sep + compiled[1] + sep)
                            );
                            compiled = null;
                            break;
                        }
                    }
                }
            }
            let json = JSON.stringify({
                source_file: fileName,
                compiled_date: new Date().toISOString(),
                source_hash: sourceHash,
                compiled_hash: md5(code)
            });
            code = `// ${json}\n${code}`;
            writeFileSync(scriptName, code);
            resolve([code, scriptName]);
            return [code, scriptName];
        }
    });
}

/**
 * Require Component
 *
 * @param {string} fileName
 * @return {Promise<React.ReactNode|undefined>}
 */
export const RequireEngineComponent = (fileName) => {
    return new Promise(async (resolve) => {
        fileName = pathResolve(fileName);
        const CacheFile = fileName;
        const baseNameLower = basename(fileName).toLowerCase();
        // if it has cache
        if (!Config.is_test && FunctionCaches.hasOwnProperty(CacheFile)) {
            resolve(FunctionCaches[CacheFile]);
            return FunctionCaches[CacheFile];
        }
        LastError = null;
        FunctionCaches[CacheFile] = undefined;

        const isTsxOrJsx = /\.(tsx?|jsx)$/.test(baseNameLower);
        // should ts, tsx, js, jsx, mjs
        if (!/\.([tj]sx?|m?js)$/.test(baseNameLower)) {
            if (!existsSync(fileName) || !statSync(fileName).isFile()) {
                return undefined;
            }
            // handle html
            if (/\.[xs]?html?/.test(baseNameLower)) {
                FunctionCaches[CacheFile] = (function () {
                    return HTMLReactParser(readFileSync(fileName, 'utf-8'));
                });
            }
            resolve(FunctionCaches[CacheFile]);
            return FunctionCaches[CacheFile];
        }

        FunctionCaches[CacheFile] = undefined;
        if (!existsSync(fileName) || !statSync(fileName).isFile()) {
            resolve(undefined);
            return undefined;
        }

        if (isTsxOrJsx) {
            const code = await CompileTsFile(fileName).catch((e) => {
                LastError = e;
            });
            if (!code) {
                resolve(undefined);
                return undefined;
            }
            fileName = code[1];
        }
        try {
            const module = await import(fileName).catch(() => undefined);
            FunctionCaches[CacheFile] = module ? (module.default || module) : undefined;
        } catch (e) {
            LastError = e;
            FunctionCaches[CacheFile] = undefined;
        }
        resolve(FunctionCaches[CacheFile]);
        return FunctionCaches[CacheFile];
    });
}

export default RequireEngineComponent;
