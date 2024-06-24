// noinspection JSUnusedGlobalSymbols,DuplicatedCode

import Controller from "../../src/abstracts/Controller.js";
import {ALL} from "../../src/router/Methods.js";
import {__} from "../../src/l10n/Translator.js";

export default class Homepage extends Controller {
    name = 'homepage';

    path = '/';

    methods = [ALL];

    dispatch(_request, _response, next) {
        return this.render('welcome', {title: __('Welcome to the homepage')}, 200);
    }
}
