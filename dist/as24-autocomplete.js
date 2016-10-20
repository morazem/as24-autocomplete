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

var showList = function showList(list) {
  return list.classList.add('as24-autocomplete__list--visible');
};

var hideList = function hideList(list) {
  return function (e) {
    return list.classList.remove('as24-autocomplete__list--visible');
  };
};

var isListVisible = function isListVisible(list) {
  return list.classList.contains('as24-autocomplete__list--visible');
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
    var df = document.createDocumentFragment();
    itemsModel.map(renderLI).forEach(appendTo(df));
    appendTo(list)(df);
    showList(list);
  };
};

var fetchList = function fetchList(dataSource, labelInput, list) {
  return function (e) {
    e.stopPropagation();
    dataSource.fetchItems(labelInput.value).then(renderList(list));
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
  nextActiveItem.scrollIntoView();
};

var onKeyDown = function onKeyDown(dataSource, valueInput, labelInput, list) {
  return function (e) {
    switch (e.which) {
      case 38:
        return moveSelection(-1, list);
      case 40:
        return isListVisible(list) ? moveSelection(1, list) : showList(list);
      case 27:
        return hideList(list)();
    }
  };
};

var onKeyUp = function onKeyUp(dataSource, valueInput, labelInput, list) {
  return function (e) {
    if (e.which === 13) {
      selectItem(valueInput, labelInput, $('.as24-autocomplete__list-item--selected', list));
      hideList(list)();
      return;
    }
    if ([38, 40, 27].indexOf(e.which) === -1) {
      return fetchList(dataSource, labelInput, list)(e);
    }
  };
};

function elementAttached() {
  var labelInput = $('[type=text]', this);
  var valueInput = $('[type=hidden]', this);
  var list = $('.as24-autocomplete__list', this);
  var dataSource = $('#' + this.getAttribute('data-source'), document);
  on('click', hideList(list), document);
  on('click', fetchList(dataSource, labelInput, list), labelInput);
  on('focus', fetchList(dataSource, labelInput, list), labelInput);
  on('click', onItemClicked(valueInput, labelInput, list), list);
  on('keyup', onKeyUp(dataSource, valueInput, labelInput, list), labelInput);
  on('keydown', onKeyDown(dataSource, valueInput, labelInput, list), labelInput);
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

var extractKeyValues = function extractKeyValues(root) {
  return Array.prototype.slice.call(root.querySelectorAll('item')).map(function (tag) {
    return {
      key: tag.getAttribute('key'),
      value: tag.getAttribute('value')
    };
  });
};

var valuePredicate = function valuePredicate(queryString) {
  return function (item) {
    return item.value.match(new RegExp('^' + queryString, 'ig')) !== null;
  };
};

function fetchItems(queryString) {
  var thisID = this.id;
  return new Promise(function (res) {
    itemsCache[thisID] = itemsCache[thisID] || extractKeyValues(elementsCache[thisID]);
    res(queryString ? itemsCache[thisID].filter(valuePredicate(queryString)) : itemsCache[thisID]);
  });
}

function elementAttached$1() {
  itemsCache[this.id] = null;
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
        fetchItems: fetchItems
      })
    });
  } catch (e) {}
};

input();
tagsDataSourse();

}());
