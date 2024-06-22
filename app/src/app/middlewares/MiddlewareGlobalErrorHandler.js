import Config, {ROOT_DIR} from "../Config.js";
import {error} from "../Logger.js";
import {__} from "../../l10n/Translator.js";
import AbstractMiddleware from "../AbstractMiddleware.js";

class MiddlewareGlobalErrorHandler extends AbstractMiddleware {

    /**
     * Dispatch the error.
     *
     * @param {?Error} err
     * @param {Request} _req
     * @param {Response} res
     * @param {Function} next
     */
    dispatch(err, _req, res, next) {
        if (!err) {
            next();
            return;
        }
        res.status(500);
        if (res.headersSent) {
            res.end();
            return;
        }
        error('unhandledError', err);
        res.end(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noodp, noimageindex, noydir">
    <title>${__('Internal Server Error')}</title>
    <style>
        body {
            margin:0;
            padding: 0;
            background: #f8f9fa;
            font-size: 16px;
            color: #333;
            font-family: system-ui,-apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        }
        .wrapper {
            width: 100%;
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .error-code {
            display: flex;
            flex-direction: row;
            justify-content: center;
            align-items: center;
            align-self: center;
            color: #333;
            margin: 0 0 1rem 0;
        }
        h1 {
            margin: 0;
            font-size: 3rem;
        }
        .separator {
            height: 3rem;
            width: 2px;
            background-color: #555;
            margin: 0 1rem;
        }
        h2 {
            margin: 0;
            font-size: 2rem;
            font-weight: normal;
        }
        .error-info-container {
            max-width: 100%;
            width: 600px;
            padding: 1rem;
        }
        p {
            font-size: .9rem;
        }
        pre {
            font-size: 0.8rem;
            border-left: 4px solid #666;
            font-family: mono, monospace, Serif;
            overflow: auto;
            max-height: 300px;
            padding: 1rem;
            background: #f1f1f1;
        }
    </style>
</head>
<body>
<div class="wrapper error" id="content">
<div class="error-code">
    <h1>500</h1>
    <div class="separator"></div>
    <h2>${__('Internal Server Error')}</h2>
</div>
${Config.is_production ? '' : `
<div class="error-info-container">
    <p>${err.message.replaceAll(ROOT_DIR, '[ROOT]')}</p>
    <pre>${err.stack.replaceAll(ROOT_DIR, '[ROOT]')}</pre>
</div>
    `}
</div>
</body>
</html>
    `);
    }

    getPriority() {
        return 0;
    }
}

export default new MiddlewareGlobalErrorHandler();
