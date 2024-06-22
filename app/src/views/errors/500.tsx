import ErrorView from './error.js';

export default function _Error(attributes: { [key: string]: any }) {
    return (ErrorView(attributes));
}
