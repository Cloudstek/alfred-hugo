# Cache

As Hugo is a framework for building [script filters](https://www.alfredapp.com/help/workflows/inputs/script-filter/), you often get to deal with dynamic data. [Fetching](./fetch.md) and processing it can take quite some time which means users have to wait each time they run your workflow.

To make your workflow more responsive, Hugo initialises a [cache](https://www.npmjs.com/package/@cloudstek/cache) for you to use in your workflow. It's a simple key/value store stored as JSON in your workflow cache directory. Each item has a TTL (Time To Live) of 1 hour by default, after that time it will be removed from the cache. You can override this TTL or even disable it when setting a cache value. Disabling the TTL means it will be available forever so it acts as a normal key/value store.

If you want to store configuration details for your workflow, please do not use the cache but use the [config](./config) instead. It has the same API but is stored in a different directory and has no TTL set by default, making it act as a proper key/value store.

If you deal with processing local files a lot, please also see the [file cache](./file-cache.md) :star:

For more details about [Cache](https://www.npmjs.com/package/@cloudstek/cache), please see: https://www.npmjs.com/package/@cloudstek/cache.

### Example

```js
import { Hugo } from "alfred-hugo";

const hugo = new Hugo();

// Store "foo" with value "bar" for 1 hour
hugo.cache.set("foo", "bar");

// Store "pie" with value "apple" for 5 seconds
hugo.cache.set("pie", "apple", 5);

hugo.cache.has("pie"); // true
hugo.cache.get("pie"); // apple

// Wait 5 seconds. ZzzZzZzZZz
// sleep(5000);

hugo.cache.has("pie"); // false
hugo.cache.get("pie"); // undefined
```

