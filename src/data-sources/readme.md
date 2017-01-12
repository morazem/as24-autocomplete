# Data Sources

A Data Source is a custom element that fetches suggestions for the list. It filters these in the meantime using the input from the user.

A Data Source must have the following API:

Name|Arguments|Return value
--|---|--
fetchItems|`queryString`:string|Promise<Suggestions>
getSuggestionByKey|`keyValue`:string|Promise<Suggestion>

A Data Source component must have a `role` attribute with value of `data-source`

### Plain Data Source

This one provides a plain array of Suggestions

```html
<as24-plain-data-source role="data-source">
  <item key="1" value="Option 1"></item>
  <item key="2" value="Option 2"></item>
  <!-- ... -->
  <item key="n" value="Option N"></item>
</as24-plain-data-source>
```

### Grouped Data Source

This one provides an array of groups of suggestions

```html
<as24-grouped-items-data-source role="data-source">
  <group label="Group 1">
    <item key="1.1" value="Option 1.1"></item>
    <item key="1.2" value="Option 1.2"></item>
    <!-- ... -->
    <item key="1.n" value="Option 1.n"></item>
  </group>
  <group label="Group 2">
    <item key="2.1" value="Option 2.1"></item>
    <item key="2.2" value="Option 2.2"></item>
    <!-- ... -->
    <item key="2.n" value="Option 2.n"></item>
  </group>
  <!-- ... -->
  <group label="Group N">
    <item key="n.1" value="Option n.1"></item>
    <item key="n.2" value="Option n.2"></item>
    <!-- ... -->
    <item key="n.n" value="Option n.n"></item>
  </group>
</as24-grouped-items-data-source>
```
