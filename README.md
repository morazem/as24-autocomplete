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

Check the [demo](https://autoscout24.github.io/as24-autocomplete/) out

## Getting Started

### Run the demo

```
npm install
npm run serve
```

### Use/Add to you project

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


### Attributes of `autocomplete`

- `disabled` [optional] - self-explanatory
- `empty-list-message` [optional] - the message that user  will see when there's nothing to suggest

### Public APi

- `.selectedValue()` - returns the selected value
- `.userQuery()` - returns the query that user has entered
- `.dataSourceElement()` - returns the data source element
- `.reset()` - resets the component (clears values)

Example:

```html
<as24-autocomplete id="my-ac">
<!-- ... -->
</as24-autocomplete>
```

```js
document.querySelector('#my-ac').selectedValue();
// > selected value or ""
```

### Code

This is how you add the autocomplete itself:

```html
<as24-autocomplete empty-list-message="No items satisfying your request">
  <input type="hidden" name="makeId" value="10"> <!-- Predefined value -->
  <div class="as24-autocomplete__input-wrapper">
    <input type="text" class="as24-autocomplete__input" placeholder="Optional placeholder">
    <div class="as24-autocomplete__icon-wrapper">
        <div class="as24-autocomplete__icon-dropdown">
        <svg class="as24-autocomplete__icon-dropdown__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 13 7" height="16px" width="16px">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M6.5 7L0 .5.5 0l6 6 5.9-6 .6.5"></path>
        </svg>
      </div>
      <div class="as24-autocomplete__icon-cross">
         <svg class="as24-autocomplete__icon-cross__icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" height="16px" width="16px">
            <rect x="-2" y="6.8" transform="matrix(0.7071 -0.7071 0.7071 0.7071 -3.2215 7.7782)" width="20" height="1"/>
            <rect x="-3" y="6.8" transform="matrix(0.7071 0.7071 -0.7071 0.7071 7.7786 -3.2215)" width="20" height="1"/>
        </svg>
      </div>
    </div>
  </div>
  <ul class="as24-autocomplete__list"></ul>
  <as24-tags-data-source role="data-source">
    <item key="10" value="Audi"></item>
    <!-- ... -->
    <item key="60" value="Volkswagen"></item>
  </as24-tags-data-source>
</as24-autocomplete>
```

Autocomplete needs a data source. This package provides the default one. It uses tags to hold raw data. Those tags are being parsed and JSON data is being extracted.

```html
<as24-tags-data-source id="your-data-source-id">
    <item key="1" value="Option 1"></item>
    <!-- ... -->
    <item key="N" value="xxxx"></item>
</as24-tags-data-source>
```

```
[
    {key:"1", value:"Option 1"}
    ...
    {key:"N", value:"xxxx"}
]
```

Happy autocompleting :)
