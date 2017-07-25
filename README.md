# ![Hugo](https://cdn.rawgit.com/cloudstek/alfred-hugo/master/media/logo-hugo.svg)

> Alfred workflow bindings for NodeJS. Inspired by [Alfy](https://github.com/sindresorhus/alfy) and [alfred-workflow-nodejs](https://github.com/giangvo/alfred-workflow-nodejs).

[![Build Status](https://travis-ci.org/Cloudstek/alfred-hugo.svg?branch=master)](https://travis-ci.org/Cloudstek/alfred-hugo) [![Open Issues](https://img.shields.io/github/issues/Cloudstek/alfred-hugo.svg)](https://github.com/Cloudstek/alfred-hugo/issues)

### Highlights

* Written in [Flow](https://flowtype.org) using [Babel](https://babeljs.io).
* Fuzzy search/filter your data using [Fuse.js](http://fusejs.io).
* Fetch (JSON) from REST API's using [Got](https://github.com/sindresorhus/got).
* Group multiple actions in one file.
* Update notifications (for both NPM and Packal workflows).

## Index

* [Prerequisites](#prerequisites)
* [Installing](#installing)
* [Usage](#usage)
* [Examples](#examples)
* [API](#api)
  * [Options](#options)
  * [Properties](#properties)
  * [Methods](#methods)
* [Publishing your workflow to NPM](#publishing-your-workflow-to-npm)
* [Workflows using Hugo](#workflows-using-hugo)
* [Contributing](#contributing)
* [Authors](#authors)
  * [Contributors](#contributors)
* [License](#license)

## Prerequisites

* NodeJS 4 or higher
* Alfred 3 with [paid powerpack addon](https://www.alfredapp.com/powerpack/buy/)

## Installing

Hugo is available as NPM package and can be installed with `npm`.

```bash
$ npm install --save alfred-hugo
```

## Usage

In your project simply require/import Hugo and off you go :sunglasses:

```javascript
var Hugo = require('alfred-hugo');
// or
import Hugo from 'alfred-hugo';
```

When you decide to write your Alfred workflow in [Flow](https://flowtype.org),  you'll benefit from static type checking. Flow will automatically find and use the Flow annotations in the Hugo package and any other packages written in Flow. Please see the [Flow documentation](https://flowtype.org/docs/declarations.html#declaration-files) for more info about declarations.

Example:

```javascript
// @flow
var Hugo = require('alfred-hugo');

var myOptions = false;
Hugo.options(myOptions); // Will cause an error as Hugo.options expects an Object
```

​If you feel like writing your code in plain Javascript … that's fine too :smile: You can still use all the wonderful features of Hugo.

## Examples

Please see the [examples](examples) directory for, well ... examples.

## API

### Options

#### checkUpdates

Type: `boolean`

Default: `true`

Enable/disable checking for updates.

#### updateSource

Type: `string`

Default: `packal`

Possible values: `packal` `npm`

Check Packal or NPM for updates of the workflow. If the package can't be found on NPM then Packal will be checked as fallback.

#### updateInterval

Type: `number` [`Duration`](https://momentjs.com/docs/#/durations/)

Default: 1 day (86400 seconds)

Interval to check for updates in seconds or as [Duration](https://momentjs.com/docs/#/durations/).

#### updateNotification

Type: `boolean`

Default: `true`

Display a notification bubble when a workflow update is available. The notification bubble will only display once every `updateInterval`.

*Clicking the notification won't do anything at this moment but [`node-notifier`](https://github.com/mikaelbr/node-notifier) has extensive support for user interaction. Pull requests are welcome!*

#### updateItem

Type: `boolean`

Default: `true`

Display an update item at the bottom of the list when an update is available. 

When the item is activated, it will set a variable named `task` (`{var:task}` in Alfred) with the value `wfUpdate`. The argument is set to the URL where the update can be found, either on Packal or NPM depending on `updateSource`. You can link the output to an [Open URL](https://www.alfredapp.com/help/workflows/actions/open-url/) action so a browser opens when the user selects the update item.

![Opening a browser for updates](media/update-action.png)

#### useTmpCache

Type: `boolean`

Default: `true`

Use the OS temp directory for your workflow cache when `true`, otherwise use the directory set by Alfred in  the`alfred_workflow_cache` environment variable. It's recommended to leave this set at `true` unless you want your cache to survive reboots and clean it up yourself every once in a while.

### Properties

#### Hugo.alfredMeta

Type: `Object`

Collection of Alfred metadata that is available to the script through environment variables. See the alfred documentation for more info: https://www.alfredapp.com/help/workflows/script-environment-variables/.

When you use a custom Alfred theme, the `themeFile` property will be set to the path of the theme file (which is a JSON file). Also see [Hugo.alfredTheme](#hugo.alfredtheme).

```javascript
{
    version: process.env.alfred_version,
    theme: process.env.alfred_theme,
    themeFile: '',
    themeBackground: process.env.alfred_theme_background,
    themeSelectionBackground: process.env.alfred_theme_selection_background,
    themeSubtext: parseFloat(process.env.alfred_theme_subtext),
    preferences: process.env.alfred_preferences,
    preferencesLocalHash: process.env.alfred_preferences_localhash,
    debug: process.env.alfred_debug === '1'
}
```
*Also see: [Hugo.workflowMeta](#hugo.workflowmeta)*

#### Hugo.alfredTheme

Type: `Object`

When a custom Alfred theme is used, this will return the contents of the theme file. Usefull if you need to render icons on-the-fly and want to know the background colour.

#### Hugo.cache

Type: [`cache-conf `](https://github.com/samverschueren/cache-conf)

> Simple cache config handling for your app or module

#### Hugo.config

Type: [`conf `](https://github.com/sindresorhus/conf)

> Simple config handling for your app or module

#### Hugo.input

Type: `string`

Hugo.input contains the user input (first argument to the script) and can be used to filter your items. 

Even if you use this inside an `action` method, it will still return the correct user input, though I recommend using the provided query argument as can be seen in the [examples](#multiple-actions-in-one-file).

#### Hugo.itemCount

Type: `number`

Number of Alfred items in the current output buffer.

#### Hugo.outputBuffer

Type: `Object`

Current output buffer (read-only).

#### Hugo.workflowMeta

Type: `Object`

Collection of workflow metadata that is available to the script through environment variables. See the alfred documentation for more info: https://www.alfredapp.com/help/workflows/script-environment-variables/.

```javascript
{
    name: process.env.alfred_workflow_name,
    version: process.env.alfred_workflow_version,
    uid: process.env.alfred_workflow_uid,
    bundleId: process.env.alfred_workflow_bundleid,
    data: process.env.alfred_workflow_data,
    cache: process.env.alfred_workflow_cache,
    icon: path.join(process.cwd(), 'icon.png')
}
```

### Methods

#### Hugo.addItem(item)

##### item

Type: `Object`

Item to add to the list of items which will be displayed. The only property that is required is `title`, all the others are optional. See the [Alfred documentation](https://www.alfredapp.com/help/workflows/inputs/script-filter/json/) for all the supported properties.

###### Item variables

~~One thing that is simplified in Hugo (and quite undocumented in Alfred) is the way to add variables to items using the `arg` property. Instead of supplying a `string` you can supply an `Object` to assign variables to an item instead of globally. Now when an item is activated it will set those environment variables during this session so you can use them throughout your Alfred workflow in other actions.~~

Since [version 3.4.1](https://www.alfredapp.com/help/workflows/inputs/script-filter/json/#variables) Alfred now supports item and item modifier variables and have added documentation on the subject. You don't have to worry about what version of Alfred is running, Hugo takes care of that so you can use either syntax, though we prefer the new ​:smile:​.

Old syntax:

```javascript
{
    title: 'My item',
    valid: true,
    arg: {
        arg: 'my argument',
        variables: {
            foo: 'bar',
            bleep: 'bloop'
        }
    }
}
```

New (preferred) syntax:

```javascript
{
    title: 'My item',
    valid: true,
    arg: 'my argument',
    variables: {
        foo: 'bar',
        bleep: 'bloop'
    },
    mods: {
        alt: {
            valid: true,
            arg: 'my alt argument',
            variables: {
                bar: 'foo'
            }
        }
    }
}
```

#### Hugo.addItems(items)

##### items

Type: `Array`

Add multiple items to the list of items which will be displayed. See Hugo.addItem for more info.

#### Hugo.addVariable(key, value)

##### key

Type: `string`

##### value

Type: `string` `Object`

###### Variables

> Variables can be passed out of the script filter within a `variables` object. This is useful for two things. Firstly, these variables will be passed out of the script filter's outputs when actioning a result. Secondly, any variables passed out of a script will be passed back in as environment variables when the script is run within the same session. This can be used for very simply managing state between runs as the user types input or when the script is set to re-run after an interval.

```json
{
    "variables": {
        "foo": "bar"
    },
    "items": [
        ...
    ]
}
```

See the [Alfred documentation](https://www.alfredapp.com/help/workflows/inputs/script-filter/json/) for more info about session variables.

#### Hugo.getVariable(key)

Type: `string`

Get the value of a session variable, see Hugo.addVariable for more info.

##### key

Type: `string`

#### Hugo.addVariables(variables)

##### variables

Type: `Object`

#### Hugo.getVariables()

Type: `Object`

Get all the session variables, , see Hugo.addVariables for more info.

#### Hugo.getItemVariables(item)

Type: `Object`

Get all the item variables without having to deal with version differences, see Hugo.addItem for more info.

##### item

Type: `Object`

#### Hugo.action(keyword, callback)

##### keyword

Type: `string`

Action name (myaction in the example below), 

##### callback

Type: `function`

Callback to execute when the keyword matches the first argument. The callback takes one argument, the user input (myquery in the example below).

###### Example

```bash
/usr/local/bin/node index.js myaction "myquery"
```

#### Hugo.cacheFile(filepath, cacheName)

Processing/parsing files often takes time and is only needed when the file has changed. You can cache the results for a period of time, but you'll be left with an outdated cache when the file changes.

This method makes caching the processed results a lot easier by checking whether a file has changed. If it hasn't changed, `get()` will return the cached value. If no cached result is found or the file has changed, the `change` event will be emitted with a reference to the cache store, file contents and SHA-1 hash so you can process your file and store the results in the cache store.

*\* It's recommended to have the `useTmpCache` option set to `true` to prevent the cache from piling up as it isn't cleaned from time to time, unlike your OS temporary folder (for example `/tmp`) which is cleared after a reboot.*

##### filepath

Type: `string`

Absolute path to the file that you like to process and check for changes.

##### cacheName

Type: `string`

Cache name, this will be the name of the directory where the cached results are stored. It's possible but not recommended to share one cache name with other `cacheFile` instances.

Check out [file-cache.js.flow](file-cache.js.flow) and the [example](examples/file-cache.js) to see how to implement it.

#### Hugo.checkUpdates()

Checks for workflow package updates on either NPM or Packal when enabled. No need to call this method manually, updates will be checked automagically ​:sparkles:​

#### Hugo.clearCache()

Empties the workflow cache directory but doesn't remove the directory itself.

Call `Hugo.clearCacheSync()` if you need it synchronously.

#### Hugo.filterItems(query, options)

Fuzzy filter the output buffer by search query using Fuse.js. Add items to the output buffer first and then call `filterItems` to remove the items that do not match the search query. This method alters the output buffer directly.

##### query

Type: `string`

Search query

##### options

Type: `Object`

[Fuse.js](http://fusejs.io) options, please see the [documentation](https://github.com/krisk/fuse#usage) for available options.

#### Hugo.options(options)

##### options

Type: `Object`

Set Hugo options, see below for available options and their defaults:

```javascript
{
    checkUpdates: true,
    updateSource: 'packal',
    updateInterval: moment.duration(1, 'days'), // 86.400 seconds
    updateNotification: true,
    updateItem: true
}
```

#### Hugo.matches(candidates, query, options)

Filter the list of candidates by search query using Fuse.js. This will return the filtered candidates list.

##### candidates

Type: `Array<Object>`

List of candidates to filter. This may be any object, not specifically an Alfred item.

##### query

Type: `string`

Search query

##### options

Type: `Object`

[Fuse.js](http://fusejs.io) options, please see the [documentation](https://github.com/krisk/fuse#usage) for available options.

#### Hugo.notification(options)

Display a notification using [node-notifier](https://www.npmjs.com/package/node-notifier). For all available configuration options see their documentation.

The title option defaults to the workflow name or 'Alfred' when not available for some reason.

##### option

Type: `Object`

#### Hugo.rerun(value)

> Scripts can be set to re-run automatically after an interval using the 'rerun' key with a value of 0.1 to 5.0 seconds. The script will only be re-run if the script filter is still active and the user hasn't changed the state of the filter by typing and triggering a re-run.

##### value

Type: `number`

#### Hugo.feedback()

Checks for updates (if enabled) and flushes the output buffer to the console so Alfred can display the items.

#### Hugo.fetch(url, options, cacheAge)

Helper method to fetch an URL with `got` and optionally cache the result. Useful when working with REST API's.

##### url

Type: `string`

##### options

Type: `Object`

See the [got documentation](https://www.npmjs.com/package/got#api) for all available options.

##### cacheAge

Type: `number` `null`

Number of seconds to cache the result.

## Publishing your workflow to NPM

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

```
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
