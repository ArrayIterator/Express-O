#!/usr/bin/env node

import {Application} from "./app/src/app/Application.js";

// start the application
(async() => await (new Application()).start())();
