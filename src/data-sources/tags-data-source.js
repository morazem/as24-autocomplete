var elementsCache = {};
var itemsCache = {};

const extractKeyValues = root =>
  Array.prototype.slice.call(root.querySelectorAll('item')).map(tag => ({
    key: tag.getAttribute('key'),
    value: tag.getAttribute('value')
  }));

const valuePredicate = queryString => item =>
  item.value.match(new RegExp('^' + queryString, 'ig')) !== null;

function fetchItems(queryString) {
  var thisID = this.id;
  return new Promise(res => {
    itemsCache[thisID] = itemsCache[thisID] || extractKeyValues(elementsCache[thisID]);
    res(queryString ? itemsCache[thisID].filter(valuePredicate(queryString)) : itemsCache[thisID])
  });
}

function elementAttached() {
  itemsCache[this.id] = null;
  elementsCache[this.id] = this;
}

function elementDetached() {
  elementsCache[this.id] = null;
  itemsCache[this.id] = null;
}

export default function() {
  try {
    document.registerElement('as24-tags-data-source', {
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
  }
}
