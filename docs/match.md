# Matching

Alfred has a [pretty good matching](https://www.alfredapp.com/help/workflows/inputs/script-filter/#alfred-filters-results) algorithm which might good enough for most purposes. However, if you need more control over how your items are filtered you can use Hugo's `match` method which is a simple wrapper around [Fuse.js](https://fusejs.io/).

### Example

```js
import { Hugo } from "alfred-hugo";

const hugo = new Hugo();

// Add multiple items
hugo.items.push(
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
);

// Match items on arg
const results = hugo.match(hugo.items, "omnom", {
  keys: ["arg"]
});

// Filter items, discarding non-matching items
hugo.items = results;
```

