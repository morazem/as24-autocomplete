# as24-autocomplete

Autocomplete component. The input with the list of suggestions. It works with data sources. You can specify which one to use by means of `data-source` attribute.
Just type in the `id` of data-source component.

A Data source is a custom element. It should have `fetchItems` method that takes the input from autocomplete and returns a Promise of an array of key-value pairs:

```js
function fetchItems(queryString) {
  // ...
  return new Promise(res => res([{key:'N', value:'X'}]));
}
```

Thus, data source can fetch items from API, for example, and filter them according to what user has typed in.

Checkout the (demo)[https://autoscout24.github.io/as24-autocomplete/]

## Getting Started

### Run the demo

```
npm run serve 
```

### Installing

```
npm install --save-dev as24-autocomplete
```

Include the scripts into your build process:

```js
// es5 way
var as24Autocomplete = require('as24-autocomplete');

// es6 way
import as24Autocomplete from 'as24-autocomplete';
```

Include the styles into your project. You can use SASS module importer ([this](https://www.npmjs.com/package/sass-module-importer) one for example)

```scss
@import 'as24-autocomplete'
```

Or just `@import` it from `node_modules`:

```scss
@import 'node_modules/as24-autocomplete/src/as24-autocomplete.sass'
```

*Note: the `package.json` contains `jsnext:main` entry for the ES2015 modules so that you can use `import` statement from ES6*

### Code

This is how you add the autocomplete itself:

```html
<as24-autocomplete data-source="your-data-source-id">
    <input type="hidden" name="makeId"> <!-- This field has the selected value -->
    <input type="text" class="as24-autocomplete__input">
    <ul class="as24-autocomplete__list"></ul>
</as24-autocomplete>
```

Autocomplete needs a data source. This package provides the default one:

```html
<as24-tags-data-source id="your-data-source-id">
    <item key="1" value="Option 1"></item>
    <!-- ... -->
    <item key="N" value="xxxx"></item>
</as24-tags-data-source>
```

Happy autocompleting :)
