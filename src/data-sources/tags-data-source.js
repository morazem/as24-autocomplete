var itemsCache = {};

const extractKeyValues = root =>
  Array.prototype.slice.call(root.querySelectorAll('item')).map(tag => ({
      key: tag.getAttribute('key'),
      value: tag.getAttribute('value')
  }));

const valuePredicate = queryString => item =>
  item.value.match(new RegExp('^' + queryString, 'ig')) !== null;

function fetchItems(queryString) {
    var root = this;
    var thisID = root.id;
    return new Promise(res => {
        itemsCache[thisID] = itemsCache[thisID] || extractKeyValues(root);
        res(queryString ? itemsCache[thisID].filter(valuePredicate(queryString)) : itemsCache[thisID])
    });
}

function elementAttached() {
    itemsCache[this.id] = null;
}

function elementDetached() {
    itemsCache[this.id] = null;
}

export default function() {
    try {
        return document.registerElement('as24-tags-data-source', {
            prototype: Object.assign(
            Object.create(HTMLElement.prototype, {
                attachedCallback: { value: elementAttached },
                detachedCallback: { value: elementDetached },
                attributeChangedCallback: { value: function () { } }
            }), {
                fetchItems: fetchItems
            }
        )
        });
    } catch(e) {
        return null;
    }
}
