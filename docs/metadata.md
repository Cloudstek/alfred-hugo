# Metadata

Alfred exposes some useful metadata to the script using environment variables. This for example gives you information about Alfred's version, prefrerences and more. Alfred also exposes metadata about the workflow.

Hugo makes it easy for you to access both Alfred's metadata and your workflow metadata.

## Alfred metadata

Alfred metadata can be accessed using the `alfredMeta` property of Hugo and is an object containing the following items:

```json
{
    debug: true, // True when debug panel is opened
    preferences: // Path to Alfred preferences file,
    preferencesLocalHash: // Contains hash from alfred_preferences_localhash,
    theme: // Theme file name,
    themeBackground: // Theme background colour,
    themeSelectionBackground: // Colour of the selected result,
    themeSubtext: // Contains value from alfred_theme_subtext,
    themeFile: // Absolute path to theme file (if found),
    version: // Alfred version
}
```

For background information, see: https://www.alfredapp.com/help/workflows/script-environment-variables

## Workflow metadata

Workflow metadata can be accessed through the `workflowMeta` property of Hugo.

```json
{
    bundleId: // The bundle ID of the current running workflow,
    cache: // Path to workflow cache directory,
    data: // Path to workflow data directory,
    icon: // Path to workflow icon,
    name: // Workflow name,
    uid: // Unique ID of the workflow,
    version: // Workflow version
}
```

## Theme data

To save you some effort when you really want to blend in, Hugo has an easy way of loading the theme file for you (if it was found). You can access the active theme data using the `alfredTheme` property of Hugo.

```js
import { Hugo } from 'alfred-hugo';

const hugo = new Hugo();

const themeData = hugo.alfredTheme;

// themeData will contain the parsed JSON contents of the active Alfred theme
```

## Example

```js
import { Hugo } from 'alfred-hugo';

const hugo = new Hugo();

console.log(`Alfred version ${hugo.alfredMeta.version}`);
console.log(`Workflow ${hugo.workflowMeta.name} version ${hugo.workflowMeta.version}`);

// Alfred version 4.0.0
// Workflow alfred-foobar version 1.0.0
```

