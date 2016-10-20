var elementsCache = {};
var itemsCache = {};

function fetchItems() {
  var thisID = this.id;
  return new Promise(res => {
    var thisElement = elementsCache[thisID];
    var items = thisElement.querySelectorAll('item');
    itemsCache[thisID] = Array.from(items).map(tag => ({
      key: tag.getAttribute('key'),
      value: tag.getAttribute('value')
    }));
    res(itemsCache[thisID]);
  });
}

function reduceItems(queryString) {
  var thisID = this.id;
  return new Promise(res => {
    res((itemsCache[thisID] || []).filter(item => {
      return item.value.match(new RegExp('^' + queryString, 'ig')) !== null;
    }));
  });
}

function elementAttached() {
  itemsCache[this.id] = [];
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
