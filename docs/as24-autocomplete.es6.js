/**
 * Selects an element using the root element.
 * @param {string} selector
 * @param {Element} root
 */

var $ = function $(selector, root) {
    return root.querySelector(selector);
};

/**
 * Binds an event listener on the element
 * @param event
 * @param cb
 * @param el
 */
var on = function on(event, cb, el) {
    return el.addEventListener(event, cb);
};

/**
 * Appends a child element to a target element
 * @param target
 */
var appendTo = function appendTo(target) {
    return function (child) {
        target.appendChild(child);
        return target;
    };
};

/**
 * Shows the suggestions list
 * @param {Element} list
 * @return {boolean}
 */
var showList = function showList(list) {
    list.classList.add('as24-autocomplete__list--visible');
    moveSelection(1, list);
    return false;
};

/**
 * Hides the list and deactivates the root elment
 * @param {Element} list
 * @param {Element} rootElement
 */
var hideList = function hideList(list, rootElement) {
    return function (e) {
        rootElement.classList.remove('as24-autocomplete--active');
        list.classList.remove('as24-autocomplete__list--visible');
        return false;
    };
};

/**
 * Checks whether the list is visisible
 * @param {Element} list
 */
var isListVisible = function isListVisible(list) {
    return list.classList.contains('as24-autocomplete__list--visible');
};

/**
 * Renders a li item for the suggestions list
 * @param {{key: string, value: string}} item
 * @param {string} searchInput
 * @returns {HTMLElement} {Element}
 */
var renderLI = function renderLI(searchInput) {
    return function (item) {
        var li = document.createElement('li');
        var searchValue = searchInput;
        var resultValue = item.value.replace(new RegExp('^' + searchValue, 'gi'), '');
        li.classList.add('as24-autocomplete__list-item');
        li.key = item.key;
        li.innerHTML = searchInput.length ? searchValue + '<b>' + resultValue + '</b>' : resultValue;
        return li;
    };
};

/**
 * What to render when there is nothing to suggest
 * @param {String} emptyMessage
 * @return {Element}
 */
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
 * @param {Element} labelInput
 * @returns {Function}
 */
var renderList = function renderList(emptyMessage, list, labelInput) {
    return function (itemsModel) {
        list.innerHTML = '';
        var df = document.createDocumentFragment();
        (itemsModel.length ? itemsModel.map(renderLI(labelInput.value, list)) : [renderEmptyListItem(emptyMessage)]).forEach(appendTo(df));
        list.classList[itemsModel.length ? 'remove' : 'add']('as24-autocomplete__list--empty');
        appendTo(list)(df);
        showList(list);
    };
};

/**
 * Fetch data according to user input and renders the list
 * @param {Element} dataSource
 * @param {HTMLInputElement} labelInput
 * @param {Element} list
 * @param {String} emptyMessage
 * @param {Element} rootElement
 */
var fetchList = function fetchList(dataSource, labelInput, list, emptyMessage, rootElement) {
    return function (e) {
        e.stopPropagation();
        rootElement.classList.add('as24-autocomplete--active');
        dataSource.fetchItems(labelInput.value).then(renderList(emptyMessage, list, labelInput));
    };
};

/**
 * This is what happens after the user selected an item
 * @param valueInput
 * @param labelInput
 * @param li
 */
var selectItem = function selectItem(valueInput, labelInput, li) {
    valueInput.value = li.key;
    labelInput.value = li.innerText;
};

/**
 * This is what happens then user clicked in the suggestion item
 * @param valueInput
 * @param labelInput
 * @param list
 * @param rootElement
 */
var onItemClicked = function onItemClicked(valueInput, labelInput, list, rootElement) {
    return function (e) {
        selectItem(valueInput, labelInput, e.target);
        hideList(list, rootElement)(e);
    };
};

/**
 *
 * @param {HTMLElement} list
 * @param {HTMLElement} selected
 */
var followSelectedItem = function followSelectedItem(list, selected) {
    var listHeight = list.getBoundingClientRect().height;
    var selectedTop = selected.offsetTop;
    var selectedHeight = selected.offsetHeight;
    list.scrollTop = -1 * (listHeight - (selectedTop + selectedHeight));
};

/**
 * When mouse goes over the suggestion item
 * @param list
 */
var onItemMouseOver = function onItemMouseOver(list) {
    return function (e) {
        var currActiveItem = $('.as24-autocomplete__list-item--selected', list);
        var mouseOverElement = e.target;
        currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
        mouseOverElement.classList.add('as24-autocomplete__list-item--selected');
    };
};

/**
 * Selected next/prev suggestion item
 * @param {number} dir
 * @param {Element} list
 * @return {boolean}
 */
var moveSelection = function moveSelection(dir, list) {
    var next = dir === 1 ? 'nextSibling' : 'previousSibling';
    var currActiveItem = $('.as24-autocomplete__list-item--selected', list);
    var nextActiveItem = currActiveItem === null ? $('.as24-autocomplete__list-item', list) : !!currActiveItem[next] ? currActiveItem[next] : currActiveItem;
    currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
    nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
    followSelectedItem(list, nextActiveItem);
    return false;
};

/**
 * Handles key down
 * @param dataSource
 * @param valueInput
 * @param labelInput
 * @param list
 * @param rootElement
 */
var onKeyDown = function onKeyDown(dataSource, valueInput, labelInput, list, rootElement) {
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
                return hideList(list, rootElement)();
            }
        }
    };
};

/**
 * Handles key up
 * @param dataSource
 * @param valueInput
 * @param labelInput
 * @param list
 * @param emptyListMessage
 * @param rootElement
 */
var onKeyUp = function onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage, rootElement) {
    return function (e) {
        e.stopPropagation();
        if (e.which === 13) {
            selectItem(valueInput, labelInput, $('.as24-autocomplete__list-item--selected', list));
            hideList(list, rootElement)();
            return;
        }
        if ([38, 40, 27].indexOf(e.which) === -1) {
            return fetchList(dataSource, labelInput, list, emptyListMessage, rootElement)(e);
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
    var fetchListCallback = fetchList(dataSource, labelInput, list, emptyListMessage, this);

    on('click', hideList(list, this), document);
    on('click', fetchListCallback, labelInput);
    on('click', onItemClicked(valueInput, labelInput, list, this), list);
    on('keyup', onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage, this), labelInput);
    on('keydown', onKeyDown(dataSource, valueInput, labelInput, list, this), window);
    on('mouseover', onItemMouseOver(list), list);
}

function elementDetached() {}

var input = function () {
    try {
        return document.registerElement('as24-autocomplete', {
            prototype: Object.assign(Object.create(HTMLElement.prototype, {
                attachedCallback: { value: elementAttached },
                detachedCallback: { value: elementDetached },
                attributeChangedCallback: {
                    value: function value() {}
                }
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
