# CommandBar for HubSpot

A simple Chrome Extension that adds [CommandBar](https://www.commandbar.com/) to HubSpot, with additional support for adding Algolia Indexes as a data source.

## Features

- Search Companies or Contacts from your HubSpot instance directly in CommandBar
- Add a connection to Algolia to search through your own search index

## Install

Download the source, then run:

```
npm ci
npm run build
```

Next, open chrome://extensions in a new tab, enable developer mode, and then "Load Unpacked Extension". Navigate to the build folder that was produced by `npm run build`, and hit "select". This will let you load the development version of this chrome extension.

## Contribution

Suggestions and pull requests are welcomed!.

---

This project was bootstrapped with [Chrome Extension CLI](https://github.com/dutiyesh/chrome-extension-cli)

