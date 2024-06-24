# EXPRESS-O SERVE
 
**Express-O SERVE** simple serving web application.

## ENVIRONMENT MODE

The application running 1 instance, and only accepted 1 environment mode variable `development`, `production`, or `test`.

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
├── package.json (node package.json)
├── README.md (readme)
├── watch.json (watcher daemon for development / testing only - the environment mode is `test`)
└── tsconfig.json (typescript config)

```

## LICENSE

MIT License (MIT) - [LICENSE](LICENSE)
