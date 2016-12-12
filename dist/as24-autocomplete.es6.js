/**
 * Finds a closest element by class name
 * @param className
 */

var closestByClassName = function closestByClassName(className) {
    return function (elem) {
        return elem.classList.contains(className) ? elem : closestByClassName(className)(elem.parentElement);
    };
};

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
 * @param {string} event
 * @param {Function} cb
 * @param {Element} el
 * @param {boolean} capturing
 */
var on = function on(event, cb, el) {
    var capturing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    return el.addEventListener(event, cb, capturing);
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
 * @param {string} searchStr
 * @returns {HTMLElement} {Element}
 */
var renderLI = function renderLI(searchStr) {
    return function (item) {
        var li = document.createElement('li');
        var searchValue = searchStr;
        var resultValue = item.value.replace(new RegExp('^' + searchValue, 'gi'), '');
        li.classList.add('as24-autocomplete__list-item');
        li.key = item.key;
        li.innerHTML = searchStr.length ? '<strong>' + searchValue + '</strong>' + resultValue : resultValue;
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
 * @param {HTMLInputElement} labelInput
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
        selectItem(valueInput, labelInput, closestByClassName('as24-autocomplete__list-item')(e.target));
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
        e.stopPropagation();
        var preselected = $('.as24-autocomplete__list-item--preselected', list);
        if (e.target.tagName === 'LI') {
            if (preselected) {
                preselected.classList.remove('as24-autocomplete__list-item--preselected');
            }
            e.target.classList.add('as24-autocomplete__list-item--preselected');
        }
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
    var root = this;
    var emptyListMessage = root.getAttribute('empty-list-message') || "---";
    var dataSourceName = root.getAttribute('data-source');
    if (!dataSourceName) {
        throw "The data source is missing";
    }
    var labelInput = $('[type=text]', root);
    var valueInput = $('[type=hidden]', root);
    var list = $('.as24-autocomplete__list', root);
    var arrow = $('.as24-autocomplete__icon-wrapper', root);

    var dataSource = $('#' + dataSourceName, document);

    if (arrow) {
        on('click', function (e) {
            e.stopPropagation();
            if (isListVisible(list)) {
                hideList(list, root)(e);
            } else {
                labelInput.focus();
                fetchList(dataSource, labelInput, list, emptyListMessage, root)(e);
            }
        }, arrow);
    }

    on('click', hideList(list, root), document);
    on('click', fetchList(dataSource, labelInput, list, emptyListMessage, root), labelInput);
    on('click', onItemClicked(valueInput, labelInput, list, root), list);
    on('keyup', onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage, root), labelInput);
    on('keydown', onKeyDown(dataSource, valueInput, labelInput, list, root), window);
    on('mouseover', onItemMouseOver(list), list, true);
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
