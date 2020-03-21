# File Cache

Processing files is often takes time and waste of resources when the file hardly ever changes. Caching the processed data isn't very hard but you'd still have to check if the file has been changed over time and reprocess it, cache it again and so on.

The built-in file cache (for lack of a better name) does all this for you and is built upon the built-in [cache](./cache). Take a look at the examples on how to use it.

By default the TTL (cache lifetime) is set to `false`, which means the results are cached indefinitely until the file has been changed. You can force a different TTL by 

### Example

```js
import { Hugo } from 'alfred-hugo';

const hugo = new Hugo();

// Create the file cache
const fc = hugo.cacheFile('/path/to/file.to.process');

// Define the change handler for processing your file
fc.on('change', (cache, fileContents) => {
  // Process the file contents
  const foo = processFoo(fileContents);
  const bar = processBar(fileContents);
  
  // Set the results
  cache.set('foo', foo);
  cache.set('bar', bar);
});

// Get the results
const results = fc.get();

console.log(results.foo); // Will output processed foo data
console.log(results.bar); // Will output processed bar data
```

#### With a 1-hour TTL

```js
import { Hugo } from 'alfred-hugo';

const hugo = new Hugo();

// Create the file cache
const fc = hugo.cacheFile('/path/to/file.to.process', { ttl: 3600 });

// ... see example above.
```

