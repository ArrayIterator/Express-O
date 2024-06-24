# MODELS DIRECTORY

Models for database tables are stored here. Each model is a class that inherits from the `Database.Model` that returning Knex model class.

see the reference: [https://vincit.github.io/objection.js/guide/models.html#examples](https://vincit.github.io/objection.js/guide/models.html#examples)

This folder maybe should contains 3 environments : `development`, `production` and `test`.

```text
models/
├── development/ (development environment)
│   └── xxx.js (model file)
├── production/ (production environment)
│   └── xxx.js (model file)
└── test/ (test environment)
    └── xxx.js (model file)
```
