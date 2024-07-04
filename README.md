# EXPRESS-O SERVE
 
**Express-O SERVE** simple serving web application.

## ENVIRONMENT MODE

The application running 1 instance, and only accepted 1 environment mode variable `development`, `production`, or `test`.

Environment mode can be override by node arguments or environment :

- ```MODE=production|development|test node app.js```
- ```node app.js ---mode=production|development|test```
- ```node app.js ---mode production|development|test```

Without environment mode variable, the application will running as default `mode` on **_[environment config](app/configs/environment.example.yaml)_**.

Running `watch.js` also affected by the environment mode.

### Development mode

Match include `dev` will also resolve as `development`

```bash
MODE=development node app.js
```

**OR**

```bash
node app.js --mode development
```

### Production mode

Match include `prod` will also resolve as `production`

```bash
MODE=production node app.js
```

**OR**

```bash
node app.js --mode production
```

### Test mode

Match include `tes` will also resolve as `test`

```bash
MODE=test node app.js
```

**OR**

```bash
node app.js --mode test
```

The priority match is `prod` > `dev` > `tes`

### RUNNING AS WATCH MODE

The application can be running as watch mode by using [watch.js](watch.js) file, by running with

```bash
npm run watch
```

**OR**

```bash
node watch.js
```

### AVAILABLE OVERRIDE ENVIRONMENT

1. `--port` / `PORT=xxxx` - Override port ( 0- 65535 )
2. `--ip` / `IP=xxxx` - Override host / ip binding (eg: 127.0.0.1)
3. `--mode` / `MODE=xxxx` - Override environment mode
4. `--timeout` / `TIMEOUT=xxxx` - Override timeout in milliseconds
5. `--lang` / `LANG=xx` - Override language 2 characters code
6. `--ssl-key` / `SSL_KEY=/path/to/key` - Override SSL Key file path
7. `--ssl-cert` / `SSL_CERT=/path/to/cert` - Override SSL Cert file path
8. `--ssl-enable` / `SSL_ENABLE=true|false` - Enable SSL

 - The IP will override of `public` config if IP is valid bogon ip.
 - When the SSL key & cert is valid, it will be used as SSL server certificate. The both key & cert must be valid file path.
 - The `ssl-enable` to force enable / not if ssl key & cert valid on configuration or env.
 - Language `en` is default language, if the language is not available, it will fall back to default language.


## DIRECTORY STRUCTURE

The applications folders that contains 3 environment mode directory `development`, `production`, and `test` are:

- [middlewares](app/middlewares) the middlewares directory
- [models](app/models) the models directory
- [seeders](app/seeders) the seeders directory
- [migrations](app/migrations) the migrations directory
- [controllers](app/controllers) the controllers directory
- [entities](app/entities) the entities directory
- [views](app/views) the views directory

```txt
app/
├── configs/ (configurations directory)
│   ├── cache.yaml (Cache configurations)
│   ├── database.yaml (Database configurations)
│   ├── environment.yaml (Environment configurations)
│   └── logger.yaml (Logger configurations) // end
├── languages/ (language directory)
│   └── xx.(po|mo|json) (Language file)
├── middlewares/ (middlewares directory)
│   ├── development/ (development middlewares directory)
│   │    └── xxxxx.js (Middlewares)
│   ├── production/ (production middlewares directory)
│   │    └── xxxxx.js (Middlewares)
│   └── test/ (test middlewares directory)
│        └── xxxxx.js (Middlewares)
├── entities/ (entities directory)
│   ├── development/ (development entities directory)
│   │    └── xxxxx.js (Entities)
│   ├── production/ (production entities directory)
│   │    └── xxxxx.js (Entities)
│   └── test/ (test entities directory)
│        └── xxxxx.js (Entities)
├── models/ (models directory)
│   ├── development/ (development models directory)
│   │    └── xxxxx.js (Models)
│   ├── production/ (production models directory)
│   │    └── xxxxx.js (Models)
│   └── test/ (test models directory)
│        └── xxxxx.js (Models)
├── seeders/ (seeders directory)
│   ├── development/ (development seeders directory)
│   │    └── xxxxx.js (Seeders)
│   ├── production/ (production seeders directory)
│   │    └── xxxxx.js (Seeders)
│   └── test/ (test seeders directory)
│        └── xxxxx.js (Seeders)
├── migrations/ (migrations directory)
│   ├── development/ (development migrations directory)
│   │    └── xxxxx.js (Migrations)
│   ├── production/ (production migrations directory)
│   │    └── xxxxx.js (Migrations)
│   └── test/ (test migrations directory)
│        └── xxxxx.js (Migrations)
├── controllers/ (Controllers / Routes directory)
│   ├── development/ (development controllers directory)
│   │    └── xxxxx.js (Controllers)
│   ├── production/ (production controllers directory)
│   │    └── xxxxx.js (Controllers)
│   └── test/ (test controllers directory)
│        └── xxxxx.js (Controllers)
├── views/ (Views directory)
│   ├── development/ (development views directory)
│   │    └── xxxxx.tsx (Views - React Typescript)
│   ├── production/ (production views directory)
│   │    └── xxxxx.tsx (Views - React Typescript)
│   └── test/ (test views directory)
│        └── xxxxx.tsx (Views - React Typescript)
├── src/ (source directory)
│   ├── abstracts/ (abstracts source code directory)
│   │   ├── Controller.js (Abstract Controller)
│   │   └── Middleware.js (Abstract Middleware)
│   ├── app/ (app directory)
│   │   ├── middlewares/ (source default middlewares directory)
│   │   │   ├── MiddlewareErrorHandler.js (Middleware Error Handler)
│   │   │   ├── MiddlewareGlobalErrorHandler.js (Middleware Global Error Handler)
│   │   │   ├── MiddlewareHandler.js (Middleware Handler)
│   │   │   └── MiddlewareNotFoundHandler.js (Middleware Not Found Handler)
│   │   ├── Application.js (Application)
│   │   ├── Config.js (Config)
│   │   ├── Database.js (Database - todo)
│   │   ├── Json.js (Json Object Helper)
│   │   └── Logger.js (Logger)
│   ├── cache/ (cache source code directory)
|   |   └── (xxxxx|xxx/)*.js (Cache)
│   ├── errors/ (errors source code directory)
|   |   └── (xxxxx|xxx/)*.js (Errors)
│   ├── helpers/ (helpers source code directory)
│   │   ├── Constants.js (Constants)
│   │   ├── DataTypes.js (Data Types Helper)
│   │   ├── Entities.js (Entities Helper)
│   │   ├── Formatting.js (Formatting Helper)
│   │   ├── Hashing.js (Crypto Hashing Helper)
│   │   ├── Is.js (Validation Helper)
│   │   ├── mime.types (Apache mime types file - to be used by MimeTypes.js)
│   │   ├── MimeTypes.js (Mime Types Helper)
│   │   ├── PortTester.js (Port Tester Helper)
|   |   └── Serializer.js (Serializer Helper)
│   ├── l10n/ (languages source code directory)
|   |   └── (xxxxx|xxx/)*.js (Languages)
│   ├── router/ (router source code directory)
│   │   ├── AbstractRoute.js (Abstract Route Object)
│   │   ├── Method.js (Method Collection)
│   │   ├── Route.js (Route Class)
│   │   └──  Router.js (Router Class)
│   └── views/ (server source code directory)
│       └── (xxxxx|xxx/)*.tsx (Views - React Typescript)
├── public/ (public directory)
│   └── xxxx (any public files)
├── storage/ (storage directory)
│   └── xxxx (any storage files)
├── .gitignore (git ignore)
├── app.js (app entry point)
├── babel.config.js (babel config)
├── LICENSE (license)
├── knexfile.js (Knex CLI configuration file)
├── package.json (node package.json)
├── README.md (readme)
├── watch.js (watcher daemon for development / testing only - the environment mode is `test`)
└── tsconfig.json (typescript config)

```

## LICENSE

The license of this code under [MIT LICENSE](LICENSE)

```txt
MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
