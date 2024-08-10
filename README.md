# Furbooru Tagging Assistant

[![Get the Add-on on Firefox](.github/assets/firefox.png)](https://addons.mozilla.org/en-US/firefox/addon/furbooru-tagging-assistant/)
[![Get the extension on Chrome](.github/assets/chrome.png)](https://chromewebstore.google.com/detail/kpgaphaooaaodgodmnkamhmoedjcnfkj)

This is a browser extension written for the [Furbooru](https://furbooru.org) image-board. It gives you the ability to
tag the images more easily and quickly.

## Building

Recommendations on environment:

- Recommended version of Node.js: LTS (20)

First you need to clone the repository and install all packages:

```shell
npm install --save-dev
```

Second, you need to run the `build` command. It will first build the popup using SvelteKit and then build all the 
content scripts/stylesheets and copy the manifest afterward. Simply run:

```shell
npm run build
```

When building is complete, resulting files can be found in the `/build` directory. These files can be either used 
directly in Chrome (via loading the extension as unpacked extension) or manually compressed into `*.zip` file.  
