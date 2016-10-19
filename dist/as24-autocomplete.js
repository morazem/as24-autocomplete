(function () {
'use strict';

var $ = function $(selector, root) {
  return root.querySelector(selector);
};
var on = function on(event, cb, el) {
  return el.addEventListener(event, cb);
};
var appendTo = function appendTo(target) {
  return function (child) {
    target.appendChild(child);return target;
  };
};

var renderLI = function renderLI(item) {
  var li = document.createElement('li');
  li.classList.add('as24-autocomplete__list-item');
  li.key = item.key;
  li.innerText = item.value;
  return li;
};

var renderList = function renderList(list) {
  return function (itemsModel) {
    list.innerHTML = '';
    itemsModel.map(renderLI).forEach(appendTo(list));
    list.classList.add('as24-autocomplete__list--visible');
  };
};

var toggleList = function toggleList(list, dataSource) {
  return function (e) {
    e.stopPropagation();
    e.target.tagName === 'INPUT' ? dataSource.fetchItems().then(renderList(list)) : hideList(list)();
  };
};

var onInputKeyup = function onInputKeyup(dataSource) {
  return function (e) {
    return dataSource.reduceItems(e.target.value).then(renderList);
  };
};

var hideList = function hideList(list) {
  return function (e) {
    return list.classList.remove('as24-autocomplete__list--visible');
  };
};

var selectItem = function selectItem(valueInput, labelInput, li) {
  valueInput.value = li.key;
  labelInput.value = li.innerText;
};

var onItemClicked = function onItemClicked(valueInput, labelInput, list) {
  return function (e) {
    selectItem(valueInput, labelInput, e.target);
    hideList(list)();
  };
};

var onKeyUpped = function onKeyUpped(valueInput, labelInput, list) {
  return function (e) {
    var currActiveItem;
    var nextActiveItem;

    if (e.which === 38) {
      currActiveItem = $('.as24-autocomplete__list-item--selected', list);
      nextActiveItem = currActiveItem === null ? $('.as24-autocomplete__list-item', list) : !!currActiveItem.previousSibling ? currActiveItem.previousSibling : currActiveItem;
      currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
      nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
    }

    if (e.which === 40) {
      if (!list.classList.contains('as24-autocomplete__list--visible')) {
        list.classList.add('as24-autocomplete__list--visible');
        return;
      }
      currActiveItem = $('.as24-autocomplete__list-item--selected', list);
      nextActiveItem = currActiveItem === null ? $('.as24-autocomplete__list-item', list) : !!currActiveItem.nextSibling ? currActiveItem.nextSibling : currActiveItem;
      currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
      nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
    }

    if (e.which === 13) {
      selectItem(valueInput, labelInput, $('.as24-autocomplete__list-item--selected', list));
      hideList(list)();
    }

    if (e.which === 27) {
      hideList(list)();
    }
  };
};

function elementAttached() {
  var labelInput = $('[type=text]', this);
  var valueInput = $('[type=hidden]', this);
  var list = $('.as24-autocomplete__list', this);
  var dataSource = $('#' + this.getAttribute('data-source'), document);
  on('click', hideList(list), document);
  on('click', toggleList(list, dataSource), labelInput);
  on('focus', toggleList(list, dataSource), labelInput);
  on('keyup', onInputKeyup(dataSource), labelInput);
  on('click', onItemClicked(valueInput, labelInput, list), list);
  on('keyup', onKeyUpped(valueInput, labelInput, list), this);
}

function elementDetached() {}

var input = function () {
  try {
    document.registerElement('as24-autocomplete', {
      prototype: Object.assign(Object.create(HTMLElement.prototype, {
        attachedCallback: { value: elementAttached },
        detachedCallback: { value: elementDetached },
        attributeChangedCallback: { value: function value() {} }
      }))
    });
  } catch (e) {
    if (window && window.console) {
      window.console.warn('Failed to register CustomElement "as24-autocomplete".', e);
    }
  }
};

var elementsCache = {};
var itemsCache = {};

function fetchItems() {
  var thisID = this.id;
  return new Promise(function (res) {
    var thisElement = elementsCache[thisID];
    var result = itemsCache[thisID] ? itemsCache[thisID] : Array.from(thisElement.querySelectorAll('item')).map(function (tag) {
      return { key: tag.getAttribute('key'), value: tag.getAttribute('value') };
    });
    res(result);
  });
}

function reduceItems(queryString) {
  var thisID = this.id;
  return new Promise(function (res) {
    var reducedItems = (itemsCache[thisID] || []).filter(function (item) {
      return item.value.match(new RegExp('^' + queryString, 'ig')) !== null;
    });
    res(reducedItems);
  });
}

function elementAttached$1() {
  elementsCache[this.id] = this;
}

function elementDetached$1() {
  elementsCache[this.id] = null;
  itemsCache[this.id] = null;
}

var tagsDataSourse = function () {
  try {
    document.registerElement('as24-tags-data-source', {
      prototype: Object.assign(Object.create(HTMLElement.prototype, {
        attachedCallback: { value: elementAttached$1 },
        detachedCallback: { value: elementDetached$1 },
        attributeChangedCallback: { value: function value() {} }
      }), {
        fetchItems: fetchItems,
        reduceItems: reduceItems
      })
    });
  } catch (e) {}
};

input();
tagsDataSourse();

}());

//# sourceMappingURL=as24-autocomplete.js.map
