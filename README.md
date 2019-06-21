# ![Hugo](https://cdn.rawgit.com/cloudstek/alfred-hugo/master/media/logo-hugo.svg)

![CircleCI](https://img.shields.io/circleci/build/github/Cloudstek/alfred-hugo.svg) [![Coverage Status](https://coveralls.io/repos/github/Cloudstek/alfred-hugo/badge.svg?branch=master)](https://coveralls.io/github/Cloudstek/alfred-hugo?branch=master) [![Open Issues](https://img.shields.io/github/issues/Cloudstek/alfred-hugo.svg)](https://github.com/Cloudstek/alfred-hugo/issues) ![npm](https://img.shields.io/npm/dt/alfred-hugo.svg) ![GitHub](https://img.shields.io/github/license/Cloudstek/alfred-hugo.svg) ![GitHub stars](https://img.shields.io/github/stars/Cloudstek/alfred-hugo.svg)

Hugo is a [script filter](https://www.alfredapp.com/help/workflows/inputs/script-filter/) framework for your Alfred workflows. It can handle fetching and caching data, configuration storage, checking for updates and much much more. But I suppose you can use it for other purposes in your workflow as well :man_shrugging:

### Highlights

* Written in Typescript :star:
* Well tested :thumbsup:
* Built-in cache and configuration storage
* Advanced filtering of items using [Fuse.js](http://fusejs.io) :mag:
* Fetch (JSON) from REST API's using [Axios](https://github.com/axios/axios) :earth_americas:
* Update notifications (for both NPM and Packal workflows) :mailbox:

## Getting started

### Prerequisites

* NodeJS 8 or higher
* Alfred 3.4.1+ with [paid powerpack addon](https://www.alfredapp.com/powerpack/buy/)

### Installing

Hugo can be installed using Yarn or NPM:

```bash
$ yarn add alfred-hugo
```

```bash
$ npm install --save alfred-hugo
```

### Writing your script filter

Please see the [docs](./docs) for documentation and examples on how to use Hugo to write your script filters.

### Publishing your workflow to NPM

To publish your workflow to NPM, use [alfred-link](github.com/samverschueren/alfred-link).

> Add the `alfred-link` command as `postinstall` script of your Alfred package and add `alfred-unlink` as `preuninstall` script to clean up the resources when the workflow gets uninstalled.

```json
{
  "name": "alfred-unicorn",
  "scripts": {
    "postinstall": "alfred-link",
    "preuninstall": "alfred-unlink"
  }
}
```

> You can now install the `alfred-unicorn` package like this

```bash
$ npm install -g alfred-unicorn
```

> This will update `info.plist` with the information from `package.json` and creates a `unicorn` symlink inside the Alfred workflows directory that points to the location of the `alfred-unicorn` module.

## Workflows using Hugo

List of Alfred workflows using Hugo. 

* [alfred-atom](https://github.com/Cloudstek/alfred-atom) - Alfred workflow to browse and open Atom projects

*Feel free to submit your own by opening an [issue](https://github.com/Cloudstek/alfred-hugo/issues) or submitting a [pull request](https://github.com/Cloudstek/alfred-hugo/pulls).*

## Contributing

See [CONTRIBUTING](CONTRIBUTING.md) for more info about how to contribute.

## Authors

* [Maarten de Boer](https://github.com/mdeboer)

### Contributors 
* [Marjolein Regterschot](https://github.com/rmarjolein) (Artwork)

## License

BSD-2-Clause license, see [LICENSE](LICENSE).
