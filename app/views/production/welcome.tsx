// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import {__} from "../../src/l10n/Translator.js";
import {sprintf} from "../../src/helpers/Formatting.js";
import {ENVIRONMENT_MODE} from "../../src/app/Config.js";

export default function Welcome(_attributes: { [key: string]: any } = {}) {
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
                    }}>{__('WELCOME')}</h1>
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
                    }}>{__('Hello World!')}</h2>
                </div>
                <div>
                    <p
                        style={{
                            fontSize: '1rem',
                            fontWeight: '300',
                            margin: '1rem 0 0 0',
                            textAlign: 'center',
                            color: '#555'
                        }}
                        dangerouslySetInnerHTML={{
                            __html: sprintf(__('You are running in %s mode'), sprintf('<strong>%s</strong>', ENVIRONMENT_MODE))}
                        }
                    />
                </div>
            </div>
        </>
    );
}
