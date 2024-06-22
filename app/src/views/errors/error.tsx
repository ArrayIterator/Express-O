// noinspection JSUnusedGlobalSymbols

import {is_numeric_integer, is_object, is_string} from "../../helpers/Is.js";
import {http_message} from "../../helpers/HttpCode.js";
import {__} from "../../l10n/Translator.js";
import {intval} from "../../helpers/DataType.js";

/**
 * Error component
 *
 * @param {{header?: ReactNode|string, title?: string, error?: ErrorView, [key: string]: any}} attributes
 * @constructor
 */
export default function ErrorView(attributes: { [key: string]: any }) {

    const error = attributes.error || {};
    let errorCode: number = is_object(error) ? error.code : attributes.code;
    let message = attributes.message;
    errorCode = !is_numeric_integer(errorCode) ? 500 : intval(errorCode);
    if (!is_string(message)) {
        message = http_message(errorCode, __('Unknown'));
    }
    // override the title and header
    attributes.header = (
        <>
            <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noodp, noydir"/>
            {attributes.header || ''}
        </>
    );
    attributes.title = !is_string(attributes.title) ? http_message(errorCode, __('Error')) : attributes.title;
    return (
        <>
            <div className={'error error-content'} style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                padding: '0',
                margin: '0',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f8f9fa',
                fontFamily: 'system-ui,-apple-system, "Segoe UI", Roboto, "Helvetica Neue", "Noto Sans", "Liberation Sans", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 0 1rem 0',
                    // centered vertically
                    alignSelf: 'center',
                    color: '#333',
                }}>
                    <h1 style={{
                        margin: '0',
                        fontSize: '3rem',
                    }}>{errorCode}</h1>
                    <div style={{
                        height: '3rem',
                        width: '2px',
                        backgroundColor: '#555',
                        margin: '0 1rem'
                    }}></div>
                    <h2 style={{
                        margin: '0',
                        fontSize: '2rem',
                        fontWeight: '300',
                    }}>{message}</h2>
                </div>
            </div>
        </>
    );
}
