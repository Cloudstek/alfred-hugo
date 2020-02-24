# Items & Variables

Hugo is mainly intended as a framework for writing [script filters](https://www.alfredapp.com/help/workflows/inputs/script-filter/), therefore you have direct access to the items that will be sent to Alfred and displayed. The same goes for variables and the rerun parameter, all part of the output sent to Alfred.

To learn more about items, variables and the rerun parameter, please see the Alfred documentation at https://www.alfredapp.com/help/workflows/inputs/script-filter/json

### Examples

#### Items

```js
import { Hugo } from "alfred-hugo";

const hugo = new Hugo();

// Add single item
hugo.items.push({
  title: "Foo",
  subtitle: "Bar",
  arg: "foobar"
});

// Add multiple items
const items = [
  {
    title: "Foo",
    subtitle: "Bar",
    arg: "foobar"
  },
  {
    title: "Apple",
    subtitle: "Pie",
    arg: "omnomnom"
  }
];

hugo.items = hugo.items.concat(items);

// Flush output buffer
hugo.feedack();
```

#### Variables

Besides item variables you can also set global/session variables (please see the [documentation](https://www.alfredapp.com/help/workflows/inputs/script-filter/json/#variables)). Much like items, the variables are directly exposed as an object.

```js
import { Hugo } from "alfred-hugo";

const hugo = new Hugo();

// Set a variable
hugo.variables.foo = "bar";

// Set (override) multiple
hugo.variables = {
  foo: "bar",
  apple: "pie"
};
```

#### Rerun

> Scripts can be set to re-run automatically after an interval using the 'rerun' key with a value of 0.1 to 5.0 seconds. The script will only be re-run if the script filter is still active and the user hasn't changed the state of the filter by typing and triggering a re-run.

```js
import { Hugo } from "alfred-hugo";

const hugo = new Hugo();

// Will re-run the script each 650ms after output
hugo.rerun = 0.65;

hugo.
```

