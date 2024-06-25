import {Fragment, ReactNode, isValidElement} from "react";
import HTMLReactParser from 'html-react-parser';
import {is_array, is_object, is_string} from "../../../helpers/Is.js";
import {strval} from "../../../helpers/DataType.js";

// noinspection JSUnusedGlobalSymbols
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
    const createFragment = (children: ReactNode[]|any[]|string|ReactNode) => {
        if (is_string(children)) {
            return HTMLReactParser(children);
        }
        if (!is_array(children)) {
            if (is_object(children) && isValidElement(children)) {
                return children;
            }
            return strval(children);
        }
        return (
            <>{children.map((child, index) => {
                return (
                    <Fragment key={index}>{
                        is_string(child) ? HTMLReactParser(child) : (
                            is_array(child) ? createFragment(child) : (
                                isValidElement(child) ? child : strval(child)
                            )
                        )
                    }</Fragment>
                );
            })}</>
        );
    }
    children = createFragment(children);
    header = createFragment(header);
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
