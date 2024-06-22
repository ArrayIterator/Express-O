import {ReactNode} from "react";
import HTMLReactParser from 'html-react-parser';
import {is_array, is_object, is_string} from "../../../helpers/Is.js";

export default function Wrapper(
    {
        children,
        header,
        htmlAttributes = {},
        bodyAttributes = {},
        title = '',
        charset = 'utf-8',
        viewport = 'width=device-width, initial-scale=1',
        type = 'common',
        rootId = 'root'
    }: {
        children?: ReactNode | ReactNode[] | string,
        header?: ReactNode | ReactNode[] | string,
        htmlAttributes?: {
            [_key: string]: string
        },
        bodyAttributes?: {
            [_key: string]: string
        },
        type?: string,
        title?: string,
        charset?: string
        viewport?: string,
        rootId?: string
    }
) {
    type = !type || !is_string(type) ? 'common' : type;
    charset = !charset || !is_string(charset) ? 'utf-8' : charset;
    title = !title || !is_string(title) ? '' : title;
    viewport = !viewport || !is_string(viewport) ? 'width=device-width, initial-scale=1' : viewport;
    htmlAttributes = !htmlAttributes || typeof htmlAttributes !== 'object' ? {} : htmlAttributes;
    htmlAttributes.lang = !htmlAttributes.lang || !is_string(htmlAttributes.lang) ? 'en' : htmlAttributes.lang;
    bodyAttributes = !bodyAttributes || !is_object(bodyAttributes) ? {} : bodyAttributes;
    rootId = !rootId || !is_string(rootId) ? 'root' : rootId;
    rootId = rootId.trim().replace(/[^a-zA-Z0-9-_]/g, '');
    rootId = rootId.length === 0 ? 'root' : rootId;
    if (typeof header === 'string') {
        header = HTMLReactParser(header);
    }
    if (typeof children === 'string') {
        children = HTMLReactParser(children);
    }
    if (is_array(header)) {
        header = (
            <>{header}</>
        );
    }
    if (is_array(children)) {
        children = (
            <>{children}</>
        );
    }
    return (
        <html {...htmlAttributes}>
        <head>
            <meta charSet={charset}/>
            <meta name={"viewport"} content={viewport}/>
            <title>{title}</title>
            {header || null}
        </head>
        <body {...bodyAttributes}>
        <div id={rootId} className={"wrapper"} datatype={type}>
            {children || null}
        </div>
        </body>
        </html>
    )
}
