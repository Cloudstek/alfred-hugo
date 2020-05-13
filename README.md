# ![Hugo](https://cdn.rawgit.com/cloudstek/alfred-hugo/master/media/logo-hugo.svg)

[![CircleCI](https://img.shields.io/circleci/build/github/Cloudstek/alfred-hugo.svg)](https://circleci.com/gh/Cloudstek/alfred-hugo) [![Coverage Status](https://coveralls.io/repos/github/Cloudstek/alfred-hugo/badge.svg?branch=master)](https://coveralls.io/github/Cloudstek/alfred-hugo?branch=master) [![Open Issues](https://img.shields.io/github/issues/Cloudstek/alfred-hugo.svg)](https://github.com/Cloudstek/alfred-hugo/issues) ![npm](https://img.shields.io/npm/dt/alfred-hugo.svg) ![GitHub](https://img.shields.io/github/license/Cloudstek/alfred-hugo.svg) ![GitHub stars](https://img.shields.io/github/stars/Cloudstek/alfred-hugo.svg)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FCloudstek%2Falfred-hugo.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2FCloudstek%2Falfred-hugo?ref=badge_shield)

Hugo is a [script filter](https://www.alfredapp.com/help/workflows/inputs/script-filter/) framework for your Alfred workflows. It can handle fetching and caching data, configuration storage, checking for updates and much much more. But I suppose you can use it for other purposes in your workflow as well :man_shrugging:

### Highlights

* Written in Typescript :star:
* Well tested :thumbsup:
* Built-in cache and configuration storage
* Advanced filtering of items using [Fuse.js](http://fusejs.io) :mag:
* Fetch (JSON) from REST API's using [Axios](https://github.com/axios/axios) :earth_americas:
* Update notifications :mailbox:

## Getting started

### Prerequisites

* NodeJS 10 or higher
* Alfred 4 with [paid powerpack addon](https://www.alfredapp.com/powerpack/buy/)

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

To publish your workflow to NPM, set up the `postinstall` and `preuninstall` scripts in your `package.json` as follows to automatically add your workflow to Alfred.

```json
{
  "name": "alfred-unicorn",
  "scripts": {
    "postinstall": "hugo-link",
    "preuninstall": "hugo-unlink"
  }
}
```

People can now install your package globally like this:

```bash
$ npm install -g my-alfred-package
```

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


[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2FCloudstek%2Falfred-hugo.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2FCloudstek%2Falfred-hugo?ref=badge_large)