var elementsCache = {};
var itemsCache = {};

function fetchItems() {
  var thisID = this.id;
  return new Promise(res => {
    var thisElement = elementsCache[thisID];
    var result = itemsCache[thisID]
      ? itemsCache[thisID]
      : Array.from(thisElement.querySelectorAll('item')).map(tag => {
        return { key: tag.getAttribute('key'), value: tag.getAttribute('value') };
      });
    res(result);
  });
}

function reduceItems(queryString) {
  var thisID = this.id;
  return new Promise(res => {
    var reducedItems = (itemsCache[thisID] || []).filter(item => {
      return item.value.match(new RegExp('^' + queryString, 'ig')) !== null;
    });
    res(reducedItems);
  });
}

function elementAttached() {
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
                fetchItems: fetchItems,
                reduceItems: reduceItems
            }
        )
    });
  } catch(e) {
  }
}
