# Config

Hugo provides an easy way to store your workflow configuration by providing you with a simple key/value store that is automatically stored in a JSON file. No need to deal with handling files and serialising data, simply get and set your values.

Under the hood this uses the same package which handles the [cache](./cache.md) in Hugo, but with expiration of items disabled. For more details about the [Cache](https://www.npmjs.com/package/@cloudstek/cache) package, please see: https://www.npmjs.com/package/@cloudstek/cache.

You *can* let a configuration item expire but that is entirely optional and I'm not sure why you'd want that. Use the [cache](./cache) instead :wink:

### Example

```js
import { Hugo } from 'alfred-hugo';

const hugo = new Hugo();

// No need to load anything, just use it!

// Store 'foo' with value 'bar'
hugo.config.set('foo', 'bar');

// Get 'foo'
console.log(hugo.config.get('foo')); // bar
```

