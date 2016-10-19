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
    target.appendChild(child);
    return target;
  };
};

var renderLI = function renderLI(item) {
  var li = document.createElement('li');
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

var onInputFocused = function onInputFocused(list, dataSource) {
  return function (e) {
    return dataSource.fetchItems().then(renderList(list));
  };
};

var onInputKeyup = function onInputKeyup(dataSource) {
  return function (e) {
    return dataSource.reduceItems(e.target.value).then(renderList);
  };
};

var onItemClicked = function onItemClicked(valueInput, labelInput, list) {
  return function (e) {
    valueInput.value = e.target.key;
    labelInput.value = e.target.innerText;
    list.classList.remove('as24-autocomplete__list--visible');
  };
};

function elementAttached() {
  var labelInput = $('[type=text]', this);
  var valueInput = $('[type=hidden]', this);
  var list = $('.as24-autocomplete__list', this);
  var dataSource = $('#' + this.getAttribute('data-source'), document);
  on('focus', onInputFocused(list, dataSource), labelInput);
  on('keyup', onInputKeyup(dataSource), labelInput);
  on('click', onItemClicked(valueInput, labelInput, list), list);
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
