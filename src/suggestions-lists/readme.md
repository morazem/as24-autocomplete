# Suggestions List

Displays suggestions that comes from a Data Source. Must have the following API:

Name|Arguments|Return value
--|---|--
show|-|-
hide|-|-
isVisible|-|-
getSelectedSuggestionItem|-|DOMElement
moveSelection|`dir`:number(`-1` or `1`)|-
selectItem|-|-
renderItems|`userQuery`:string, `emptyMessage`:string|`Function(suggestions)`

Must have a `role` attribute with value of `list`.

### Plain Suggestions List

This one provides a plain array of Suggestions

```html
<as24-plain-suggestions-list data-role="list" class="as24-autocomplete__list"></as24-plain-suggestion-list-list>
```

### Grouped Suggestions List

This one provides an array of groups of suggestions

```html
<as24-grouped-suggestions-list data-role="list" class="as24-autocomplete__list"></as24-grouped-suggestions-list>
```
