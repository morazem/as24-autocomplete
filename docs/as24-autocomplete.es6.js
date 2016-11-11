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
  list.classList.add('as24-autocomplete__list--visible');
  return false;
};

var hideList = function hideList(list) {
  return function (e) {
    list.classList.remove('as24-autocomplete__list--visible');
    return false;
  };
};

var isListVisible = function isListVisible(list) {
  return list.classList.contains('as24-autocomplete__list--visible');
};

/**
 * Renders a li item for the suggestions list
 * @param {{key: string, value: string}} item
 * @returns {HTMLElement} {Element}
 */
var renderLI = function renderLI(searchInput) {
  return function (item) {
    var li = document.createElement('li');
    var searchValue = searchInput;
    var resultValue = item.value.replace(new RegExp('^' + searchValue, 'i'), "");
    li.classList.add('as24-autocomplete__list-item');
    li.key = item.key;
    li.innerHTML = searchInput.length ? searchValue + "<b>" + resultValue + "</b>" : resultValue;
    return li;
  };
};

var renderEmptyListItem = function renderEmptyListItem(emptyMessage) {
  var li = document.createElement('li');
  li.classList.add('as24-autocomplete__list-item');
  li.key = '';
  li.innerText = emptyMessage;
  return li;
};

/**
 * Renders a collection of raw suggestions to the list
 * @param {string} emptyMessage
 * @param {HTMLElement} list
 * @returns {Function}
 */
var renderList = function renderList(emptyMessage, list, labelInput) {
  return function (itemsModel) {
    list.innerHTML = '';
    var df = document.createDocumentFragment();
    (itemsModel.length ? itemsModel.map(renderLI(labelInput.value)) : [renderEmptyListItem(emptyMessage)]).forEach(appendTo(df));
    list.classList[itemsModel.length ? 'remove' : 'add']('as24-autocomplete__list--empty');
    appendTo(list)(df);
    showList(list);
  };
};

var fetchList = function fetchList(dataSource, labelInput, list, emptyMessage) {
  return function (e) {
    e.stopPropagation();
    dataSource.fetchItems(labelInput.value).then(renderList(emptyMessage, list, labelInput));
  };
};

var selectItem = function selectItem(valueInput, labelInput, li) {
  valueInput.value = li.key;
  labelInput.value = li.innerText;
};

var onItemClicked = function onItemClicked(valueInput, labelInput, list) {
  return function (e) {
    selectItem(valueInput, labelInput, e.target);
    hideList(list)(e);
  };
};

/**
 *
 * @param {HTMLElement} list
 * @param {HTMLElement} selected
 */
var followSelectedItem = function followSelectedItem(dir, list, selected) {
  var listHeight = list.getBoundingClientRect().height;
  var selectedTop = selected.offsetTop;
  var selectedHeight = selected.offsetHeight;
  var scrollDist = dir === 1 ? -1 * (listHeight - (selectedTop + selectedHeight)) : selectedTop;
  if (dir === 1 && scrollDist > 0) {
    list.scrollTop = scrollDist;
  }
  if (dir === -1 && selectedTop < listHeight) {
    list.scrollTop = scrollDist;
  }
};

var moveSelection = function moveSelection(dir, list) {
  var next = dir === 1 ? 'nextSibling' : 'previousSibling';
  var currActiveItem = $('.as24-autocomplete__list-item--selected', list);
  var nextActiveItem = currActiveItem === null ? $('.as24-autocomplete__list-item', list) : !!currActiveItem[next] ? currActiveItem[next] : currActiveItem;
  currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
  nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
  followSelectedItem(dir, list, nextActiveItem);
  return false;
};

var onKeyDown = function onKeyDown(dataSource, valueInput, labelInput, list) {
  return function (e) {
    if (e.target === labelInput) {
      if ([38, 40, 27].indexOf(e.which) >= 0) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (e.which === 38) {
        return moveSelection(-1, list);
      }
      if (e.which === 40) {
        return isListVisible(list) ? moveSelection(1, list) : showList(list);
      }
      if (e.which === 27) {
        return hideList(list)();
      }
    }
  };
};

var onKeyUp = function onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage) {
  return function (e) {
    e.stopPropagation();
    if (e.which === 13) {
      selectItem(valueInput, labelInput, $('.as24-autocomplete__list-item--selected', list));
      hideList(list)();
      return;
    }
    if ([38, 40, 27].indexOf(e.which) === -1) {
      return fetchList(dataSource, labelInput, list, emptyListMessage)(e);
    }
  };
};

function elementAttached() {
  var emptyListMessage = this.getAttribute('empty-list-message') || "---";
  var dataSourceName = this.getAttribute('data-source');
  if (!dataSourceName) {
    throw "The data source is missing";
  }
  var labelInput = $('[type=text]', this);
  var valueInput = $('[type=hidden]', this);
  var list = $('.as24-autocomplete__list', this);
  var dataSource = $('#' + dataSourceName, document);
  var fetchListCallback = fetchList(dataSource, labelInput, list, emptyListMessage);
  on('click', hideList(list), document);
  on('click', fetchListCallback, labelInput);
  on('focus', fetchListCallback, labelInput);
  on('click', onItemClicked(valueInput, labelInput, list), list);
  on('keyup', onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage), labelInput);
  // on('keydown', onKeyDown(dataSource, valueInput, labelInput, list), labelInput);
  on('keydown', onKeyDown(dataSource, valueInput, labelInput, list), window);
}

function elementDetached() {}

var input = function () {
  try {
    return document.registerElement('as24-autocomplete', {
      prototype: Object.assign(Object.create(HTMLElement.prototype, {
        attachedCallback: { value: elementAttached },
        detachedCallback: { value: elementDetached },
        attributeChangedCallback: { value: function value() {} }
      }))
    });
  } catch (e) {
    if (window && window.console) {
      window.console.warn('Failed to register CustomElement "as24-autocomplete".', e);
      return null;
    }
  }
};

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
  var root = this;
  var thisID = root.id;
  return new Promise(function (res) {
    itemsCache[thisID] = itemsCache[thisID] || extractKeyValues(root);
    res(queryString ? itemsCache[thisID].filter(valuePredicate(queryString)) : itemsCache[thisID]);
  });
}

function elementAttached$1() {
  itemsCache[this.id] = null;
}

function elementDetached$1() {
  itemsCache[this.id] = null;
}

var tagsDataSource = function () {
  try {
    return document.registerElement('as24-tags-data-source', {
      prototype: Object.assign(Object.create(HTMLElement.prototype, {
        attachedCallback: { value: elementAttached$1 },
        detachedCallback: { value: elementDetached$1 },
        attributeChangedCallback: { value: function value() {} }
      }), {
        fetchItems: fetchItems
      })
    });
  } catch (e) {
    return null;
  }
};

var as24Autocomplete = (function init() {
    var inputCtr = input();
    var tagsDataSourceCtr = tagsDataSource();
    return { inputCtr: inputCtr, tagsDataSourceCtr: tagsDataSourceCtr };
})();

export default as24Autocomplete;

//# sourceMappingURL=as24-autocomplete.es6.js.map
