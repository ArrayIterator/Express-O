#!/usr/bin/env node
/**
 * This script is used to watch for changes in the project and restart the server
 * @see package.json (npm run watch)
 */
import {existsSync, statSync, watch} from "node:fs";
import {chdir} from "node:process";
import chalk from "chalk";
import {resolve} from "node:path";
import {fork} from "node:child_process";
import {COMPILATION_EXTENSION} from "./app/src/engine/react/RequireEngineComponent.js";
import {STORAGE_DIR} from "./app/src/app/Config.js";

/**
 * Js File
 * @type {string}
 */
export const MainFile = 'app.js'; // change this to the name of your server file

/**
 * Delay
 *
 * @type {number}
 */
export const TimeoutDelay = 700;

/**
 * Regex Match for exclusion
 *
 * @type {RegExp}
 */
export const RegexExclusion = /\.(?:[tj]sx?|mjs|json|(?!\.example\.)yaml)$/i;

/**
 * Current Working Directory
 *
 * @type {string}
 */
export const cwd = import.meta.dirname;

/**
 * App Directory
 *
 * @type {string}
 */
export const AppDir = resolve(cwd, 'app');

/**
 * Application root file
 *
 * @type {string}
 */
export const AppFile = resolve(cwd, MainFile);

/**
 * Root file changes list
 *
 * @type {string[]}
 */
export const RootFileChangeList = [
    MainFile
];

// set as current working directory
chdir(cwd);

if (!existsSync(AppFile)) {
    throw new Error(
        'server.js file not found. Please create a server.js file in the root of your project.'
    )
}
if (!statSync(AppFile).isFile()) {
    throw new Error(
        'server.js is not a file. Please create a server.js file in the root of your project.'
    )
}
if (!existsSync(AppDir)) {
    throw new Error(
        'app directory not found. Please create an app directory in the root of your project.'
    );
}

/**
 * Timeout Interval
 *
 * @type {?number}
 */
let timeout = null;

/**
 * Child fork
 *
 * @type {?ChildProcess}
 */
let childFork = null;

/**
 * Process ID
 *
 * @type {?number}
 */
let pid = null;

/**
 * Get current PID
 *
 * @return {?number}
 */
export const getPid = () => pid;

/**
 * Get child fork
 *
 * @return {?ChildProcess}
 */
export const getChildFork = () => childFork;

/**
 * Start the server
 *
 * @return {void}
 */
export const StartWatch = () => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    // clearing
    console.clear();
    if (getChildFork()) {
        console.log(chalk.yellow('Restarting server...'));
        try {
            getChildFork().kill();
        } catch (err) {
            // pass
        }
        try {
            process.kill(getPid());
        } catch (err) {
            // ignore
        }
        childFork = null;
        pid = null;
    } else {
        console.log(chalk.green('Starting server...'));
    }
    childFork = fork(AppFile, [],
        {
            // silent: true,
            // detached: true,
            stdio: 'inherit',
            env: {
                ENV: process.env.ENV || process.env.NODE_ENV || 'test',
                ...process.env,
            }
        }
    );
    pid = childFork.pid;
    childFork.on('exit', (code, signal) => {
        pid = null;
        if (code !== 0 && code !== null && signal !== null ) {
            console.error(chalk.red(`Server stopped with code ${code} and signal ${signal}`));
        }
        if (code !== null && signal !== 'SIGTERM') {
            process.exit(code);
        }
        if (code === 0 && signal === null) {
            console.log(chalk.green('Completed running server.js'));
        }
    });
}

process.on('SIGINT', function () {
    if (pid) {
        try {
            process.kill(pid);
        } catch (er) {
            // pass
        }
        childFork = null;
    }
    process.exit();
})

/**
 * Last listened file
 *
 * @type {?string}
 */
let lastFile = null;

/**
 * Last listened time
 *
 * @type {?number}
 */
let lastTime = null;

/**
 * Get last file
 *
 * @return {?string}
 */
export const getLastFile = () => lastFile;

/**
 * Get last time
 *
 * @return {?number}
 */
export const getLastTime = () => lastTime;

/**
 * Listen for file changes
 *
 * @param {WatchEventType} _event
 * @param {?string} filename
 */
export const FileListener = (_event, filename) => {
    if (filename.startsWith('.')) {
        return;
    }
    let time = Date.now();
    if (getLastFile() === filename && getLastTime() !== null && (time - getLastTime()) < 50) {
        return;
    }

    lastTime = time;
    lastFile = filename;
    filename = resolve(filename);
    if (filename.endsWith(COMPILATION_EXTENSION)
        || filename.startsWith(STORAGE_DIR)
        || filename.endsWith('.example.yaml')
        || ! RegexExclusion.test(filename)
    ) {
        return;
    }
    if (filename === import.meta.filename) {
        return;
    }
    console.log(chalk.blue('File changed:'), filename);
    if (!filename.startsWith(AppDir)) {
        const fileName = filename.replace(cwd, '').replace(/\\/g, '/').replace(/^\//, '');
        if (!RootFileChangeList.includes(fileName)) {
            return;
        }
    }
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }
    timeout = setTimeout(StartWatch, TimeoutDelay);
};

watch(cwd, {recursive: true}, FileListener);

StartWatch();
