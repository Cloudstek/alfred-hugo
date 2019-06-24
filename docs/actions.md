# Actions

Actions are an easy way to structure your workflow in-code without having to drag all kinds of nodes in to launch different script for each action. Now you can run one script and have it handle all your actions.

Best way to understand is to look at the examples below!

### Examples

##### Simple action

```js
import { Hugo } from "alfred-hugo";

const hugo = new Hugo();

// Hello action
hugo.action("hello", (query) => {    
    console.log(`Hello ${query}!`);
});

// Run matching actions
hugo.run();
```
```sh
node index.js hello world 
# Hello world!
```

##### Action with nested sub-actions

```js
import { Hugo } from "alfred-hugo";

const hugo = new Hugo();

// List action
const listAction = hugo.action("list", (query) => {
    console.log("Usage: list <bikes|cars> <brand>");
});

// List bikes sub-action
listAction.action("bikes", (query) => {
	const brand = query[0] || "";
    
	console.log(`Here be a list of ${brand} bikes.`); 
});

// List cars sub-action
const listCarsAction = listAction.action("cars", (query) => {
    const brand = query[0] || "";
    
    console.log(`Here be a list of ${brand} cars.`);
});

// Sub-action of the list cars sub-action.
listCarsAction.action("Porsche", (query) => {
   console.log("Porsche, ahh very fancy cars!"); 
});

// Run matching actions
hugo.run();
```

```sh
node index.js list
# Usage: list <bikes|cars> <brand>

node index.js list bikes Ducati
# Here be a list of Ducati bikes.

node index.js list cars Ferrari
# Here be a list of Ferrari cars.

node index.js list cars Porsche
# Porsche, ahh very fancy cars!
```

