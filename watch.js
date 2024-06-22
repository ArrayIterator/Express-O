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

const js_file = 'app.js'; // change this to the name of your server file
const delay = 700;
const regexMatch = /\.(?:[tj]sx?|mjs|json|(?!\.example\.)yaml)$/i;
const cwd = import.meta.dirname;
const appDir = resolve(cwd, 'app');
const file = resolve(cwd, js_file);
const rootFileChanges = [
    js_file
];

// set as current working directory
chdir(cwd);

if (!existsSync(file)) {
    throw new Error(
        'server.js file not found. Please create a server.js file in the root of your project.'
    )
}
if (!statSync(file).isFile()) {
    throw new Error(
        'server.js is not a file. Please create a server.js file in the root of your project.'
    )
}
if (!existsSync(appDir)) {
    throw new Error(
        'app directory not found. Please create an app directory in the root of your project.'
    );
}
let timeout = null;
let childFork = null;
let pid = null;
const start = () => {
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }

    console.clear();
    if (childFork) {
        console.log(chalk.yellow('Restarting server...'));
        try {
            childFork.kill();
        } catch (err) {
            // pass
        }
        try {
            process.kill(pid);
        } catch (err) {
            // ignore
        }
        childFork = null;
        pid = null;
    } else {
        console.log(chalk.green('Starting server...'));
    }
    childFork = fork(file, [],
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
let lastFile = null;
let lastTime = null;
const listen = (event, filename) => {
    if (filename.startsWith('.')) {
        return;
    }
    let time = Date.now();
    if (lastFile === filename && lastTime !== null && (time - lastTime) < 50) {
        return;
    }

    lastTime = time;
    lastFile = filename;
    filename = resolve(filename);
    if (filename.endsWith(COMPILATION_EXTENSION)
        || filename.startsWith(STORAGE_DIR)
        || filename.endsWith('.example.yaml')
        || ! regexMatch.test(filename)
    ) {
        return;
    }
    if (filename === import.meta.filename) {
        return;
    }
    console.log(chalk.blue('File changed:'), filename);
    if (!filename.startsWith(appDir)) {
        const fileName = filename.replace(cwd, '').replace(/\\/g, '/').replace(/^\//, '');
        if (!rootFileChanges.includes(fileName)) {
            return;
        }
    }
    if (timeout) {
        clearTimeout(timeout);
        timeout = null;
    }
    timeout = setTimeout(start, delay);
};

watch(cwd, {recursive: true}, listen);

start();
