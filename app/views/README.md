# VIEWS DIRECTORY

This directory contains all the views of the application. The views are written in `.tsx` format and are responsible for rendering the UI of the application.

Rendered using `express.response.render` method, the views are served to the client as HTML.

This folder maybe should contains 3 environments : `development`, `production` and `test`.

```text
views/
├── development/ (development environment)
│   └── xxx.tsx (template file)
├── production/ (production environment)
│   └── xxx.tsx (template file)
└── test/ (test environment)
    └── xxx.tsx (template file)
```
