// noinspection JSUnusedGlobalSymbols

import {__} from "../../l10n/Translator.js";
import {is_object} from "../../helpers/Is.js";

/**
 * Not Found component
 *
 * @param {{header?: ReactNode|string, title?: string, [key: string]: any}} attributes
 * @constructor
 */
export default function NotFound(attributes: { [key: string]: any }) {
    attributes = !is_object(attributes) ? {} : attributes;
    // override the title and header
    attributes.header = (
        <>
            <meta name="robots" content="noindex, nofollow, noarchive, nosnippet, noodp, noydir"/>
            {attributes.header || ''}
        </>
    );
    attributes.title = __('Page Not Found');
    return (
        <>
            <div className={'notfound notfound-content'} style={{
                fontSize: '16px',
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
                    }}>404</h1>
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
                    }}>{__('Not Found')}</h2>
                </div>
                <p style={{
                    fontSize: '.9rem',
                    margin: '0',
                    fontWeight: '300',
                }}>{__('The page you are looking for does not exist.')}</p>
            </div>
        </>
    );
}
