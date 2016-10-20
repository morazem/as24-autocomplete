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

var moveSelection = function moveSelection(dir, list) {
  var next = dir === 1 ? 'nextSibling' : 'previousSibling';
  var currActiveItem = $('.as24-autocomplete__list-item--selected', list);
  var nextActiveItem = currActiveItem === null ? $('.as24-autocomplete__list-item', list) : !!currActiveItem[next] ? currActiveItem[next] : currActiveItem;
  currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
  nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
};

var onKeyUpped = function onKeyUpped(dataSource, valueInput, labelInput, list) {
  return function (e) {
    switch (e.which) {
      case 38:
        return moveSelection(-1, list);
      case 40:
        return moveSelection(1, list);
      case 27:
        return hideList(list)();
      case 13:
        {
          selectItem(valueInput, labelInput, $('.as24-autocomplete__list-item--selected', list));
          hideList(list)();
          return;
        }
      default:
        return dataSource.reduceItems(e.target.value).then(renderList(list));
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
  on('click', onItemClicked(valueInput, labelInput, list), list);
  on('keyup', onKeyUpped(dataSource, valueInput, labelInput, list), labelInput);
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
    var items = thisElement.querySelectorAll('item');
    itemsCache[thisID] = Array.from(items).map(function (tag) {
      return {
        key: tag.getAttribute('key'),
        value: tag.getAttribute('value')
      };
    });
    res(itemsCache[thisID]);
  });
}

function reduceItems(queryString) {
  var thisID = this.id;
  return new Promise(function (res) {
    res((itemsCache[thisID] || []).filter(function (item) {
      return item.value.match(new RegExp('^' + queryString, 'ig')) !== null;
    }));
  });
}

function elementAttached$1() {
  itemsCache[this.id] = [];
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
