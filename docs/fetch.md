# Fetch

Hugo has a built-in method to make fetching data from other sites (e.g. REST APIs) a breeze and if you like, it can also cache the result for you, leveraging the built-in [cache](./cache.md).

Behind the scenes [Axios](https://github.com/axios/axios) is used to make the request and by default it automatically parses JSON for you. This means you can directly use your data.

*Note that this is only a simple wrapper function to make a GET request. Though you can specify the options for Axios, you might want to look into using Axios (or other libraries) directly if you need advanced options.*

### Example

```js
import { Hugo } from 'alfred-hugo';

const hugo = new Hugo();

// Fetch single todo item without caching
hugo
    .fetch('https://jsonplaceholder.typicode.com/todos/1')
	.then((data) => {
    	console.log(`#${data.id} ${data.title}`);
	});

// Fetch todo list and cache it for 1 hour
hugo
    .fetch('https://jsonplaceholder.typicode.com/todos', {/* Axios options */}, 3600)
	.then((data) => {
    	console.log(`${data.length} todo items fetched.`);
	});

// Fetch the todo list again, this time it's cached!
hugo
    .fetch('https://jsonplaceholder.typicode.com/todos', {/* Axios options */}, 3600)
	.then((data) => {
    	console.log(`${data.length} todo items loaded from cache.`);
	});
```

