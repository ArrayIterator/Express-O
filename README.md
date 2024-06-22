# EXPRESS-O SERVE
 
**Express-O SERVE** simple serving web application.

## DIRECTORY STRUCTURE

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
│   └── xxxxx.js (Middlewares)
├── migrations/ (migrations directory)
│   └── xxxxx.js (Migrations)
├── routes/ (routes directory)
│   └── xxxxx.js (Routes)
├── src/ (source directory)
│   ├── app/ (app directory)
│   │   ├── middlewares/ (source default middlewares directory)
│   │   │   ├── MiddlewareErrorHandler.js (Middleware Error Handler)
│   │   │   ├── MiddlewareGlobalErrorHandler.js (Middleware Global Error Handler)
│   │   │   ├── MiddlewareHandler.js (Middleware Handler)
│   │   │   └── MiddlewareNotFoundHandler.js (Middleware Not Found Handler)
│   │   ├── AbstractMiddleware.js (Abstract Middleware)
│   │   ├── Application.js (Application)
│   │   ├── Config.js (Config)
│   │   ├── Database.js (Database - todo)
│   │   ├── Json.js (Json Object Helper)
│   │   └──  Logger.js (Logger)
│   ├── cache/ (cache source code directory)
|   |   └── (xxxxx|xxx/)*.js (Cache)
│   ├── errors/ (errors source code directory)
|   |   └── (xxxxx|xxx/)*.js (Errors)
│   ├── helpers/ (helpers source code directory)
│   │   ├── Constants.js (Constants)
│   │   ├── DataTypes.js (Data Types Helper)
│   │   ├── Formatting.js (Formatting Helper)
│   │   ├── Hashing.js (Crypto Hashing Helper)
│   │   ├── Is.js (Validation Helper)
│   │   ├── PortTester.js (Port Tester Helper)
|   |   └── Serializer.js (Serializer Helper)
│   ├── l10n/ (languages source code directory)
|   |   └── (xxxxx|xxx/)*.js (Languages)
│   ├── router/ (router source code directory)
│   │   ├── AbstractRoute.js (Abstract Route Object)
│   │   ├── Method.js (Method Collection)
│   │   ├── Route.js (Route Class)
│   │   └──  Router.js (Router Class)
│   ├── views/ (server source code directory)
│   │   └── (xxxxx|xxx/)*.tsx (Views - React Typescript)
├── public/ (public directory)
│   └── xxxx (any public files)
├── storage/ (storage directory)
│   └── xxxx (any storage files)
├── .gitingore (git ignore)
├── app.js (app entry point)
├── babel.config.js (babel config)
├── LICENSE (license)
├── package.json (node package.json)
├── README.md (readme)
├── watch.json (watcher daemon for development only)
└── tsconfig.json (typescript config)

```

## LICENSE

MIT License (MIT) - [LICENSE](LICENSE)