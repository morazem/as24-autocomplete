/**
 * @class DOMEvent
 * @property {HTMLElement} target
 * @property {number} which
 * @property {function} stopPropagation
 * @property {function} preventDefault
 */

/**
 * @callback fetchItemsFn
 * @param {string} userInput
 * @return {Promise}
 */

/**
 * @class DataSourceElement
 * @property {fetchItemsFn} fetchItems
 */

/**
 * Finds a closest element by class name
 * @param className
 * @returns {function}
 */

var closestByClassName = function closestByClassName(className) {
    return (
        /**
         * @param {HTMLElement} elem
         * @return {HTMLElement}
         */
        function (elem) {
            return elem.classList.contains(className) ? elem : closestByClassName(className)(elem.parentElement);
        }
    );
};

/**
 * Selects an element using the root element.
 * @param {string} selector Specifies the selector for lookup
 * @param {Element} root Specified within which element to perform the lookup
 * @return {Element}
 */
var $ = function $(selector, root) {
    return root.querySelector(selector);
};

/**
 * Binds an event listener on the element
 * @param {string} event
 * @param {Function} cb
 * @param {Element|Window|Document} el
 * @param {boolean} capturing
 */
var on = function on(event, cb, el) {
    var capturing = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    return el.addEventListener(event, cb, capturing);
};

/**
 * Appends a child element to a target element
 * @param {HTMLElement|DocumentFragment} target
 * @returns {function}
 */
var appendTo = function appendTo(target) {
    return (
        /**
         * @param {HTMLElement} child
         * @return {HTMLElement}
         */
        function (child) {
            target.appendChild(child);
            return target;
        }
    );
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
 * Finds the currently selected suggestion item
 * @param {HTMLUListElement} list
 */
var getSelectedSuggestionItem = function getSelectedSuggestionItem(list) {
    return $('.as24-autocomplete__list-item--selected', list);
};

/**
 * Hides the list and deactivates the root element
 * @param {HTMLUListElement} list
 * @param {Element} rootElement
 */
var hideList = function hideList(list, rootElement) {
    return function () {
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
 * When user clicks cross icon, all the input must be removed
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {Element} root
 * @return {*}
 */
var cleanup = function cleanup(valueInput, labelInput, root) {
    valueInput.value = '';
    labelInput.value = '';
    root.classList.remove('as24-autocomplete--user-input');
};

/**
 * When user types something in we mark the component as dirty
 * @param {Element} rootElement
 * @return {*}
 */
var dirtifyInput = function dirtifyInput(rootElement) {
    return rootElement.classList.add('as24-autocomplete--user-input');
};

/**
 * Renders a li item for the suggestions list
 * @param {string} searchStr
 * @returns {function}
 */
var renderLI = function renderLI(searchStr) {
    return (
        /**
         * @function
         * @param {{key:string, value:string}} item
         * @return {HTMLLIElement}
         */
        function (item) {
            var li = document.createElement('li');
            var searchValue = searchStr;
            var resultValue = item.value.replace(new RegExp('^' + searchValue, 'gi'), '');
            li.classList.add('as24-autocomplete__list-item');
            li.dataset.key = item.key;
            li.innerHTML = searchStr.length ? '<strong>' + searchValue + '</strong>' + resultValue : resultValue;
            return li;
        }
    );
};

/**
 * What to render when there is nothing to suggest
 * @param {String} emptyMessage
 * @returns {HTMLLIElement}
 */
var renderEmptyListItem = function renderEmptyListItem(emptyMessage) {
    /**
     * @type {HTMLLIElement}
     */
    var li = document.createElement('li');
    li.classList.add('as24-autocomplete__list-item');
    li.dataset.key = '';
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
 * @param {DataSourceElement} dataSource
 * @param {HTMLInputElement} labelInput
 * @param {Element} list
 * @param {String} emptyMessage
 * @param {Element} rootElement
 * @returns {function}
 */
var fetchList = function fetchList(dataSource, labelInput, list, emptyMessage, rootElement) {
    return (
        /**
         * @function
         * @param {DOMEvent} e
         * @return {undefined}
         */
        function (e) {
            e.stopPropagation();
            rootElement.classList.add('as24-autocomplete--active');
            dataSource.fetchItems(labelInput.value).then(renderList(emptyMessage, list, labelInput));
        }
    );
};

/**
 * This is what happens after the user selected an item
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {HTMLLIElement} li
 * @param {Element} rootElement
 */
var selectItem = function selectItem(valueInput, labelInput, li, rootElement) {
    valueInput.value = li.dataset.key;
    labelInput.value = li.innerText;
    dirtifyInput(rootElement);
};

/**
 * This is what happens then user clicked in the suggestion item
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {HTMLUListElement} list
 * @param {HTMLElement} rootElement
 */
var onItemClicked = function onItemClicked(valueInput, labelInput, list, rootElement) {
    return function (e) {
        selectItem(valueInput, labelInput, closestByClassName('as24-autocomplete__list-item')(e.target), rootElement);
        rootElement.classList.add('as24-autocomplete--user-input');
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
 * @param {HTMLUListElement} list
 * @return {function} a function that accepts an event
 */
var onItemMouseOver = function onItemMouseOver(list) {
    return (
        /**
         * @function
         * @param {DOMEvent} e
         * @return {undefined}
         */
        function (e) {
            e.stopPropagation();
            var preselected = $('.as24-autocomplete__list-item--preselected', list);
            if (e.target.tagName === 'LI') {
                if (preselected) {
                    preselected.classList.remove('as24-autocomplete__list-item--preselected');
                }
                e.target.classList.add('as24-autocomplete__list-item--preselected');
            }
        }
    );
};

/**
 * Selected next/prev suggestion item
 * @param {number} dir
 * @param {HTMLUListElement} list
 * @return {boolean}
 */
var moveSelection = function moveSelection(dir, list) {
    var next = dir === 1 ? 'nextSibling' : 'previousSibling';
    var currActiveItem = getSelectedSuggestionItem(list);
    var nextActiveItem = currActiveItem === null ? $('.as24-autocomplete__list-item', list) : !!currActiveItem[next] ? currActiveItem[next] : currActiveItem;
    currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
    nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
    followSelectedItem(list, nextActiveItem);
    return false;
};

/**
 * Handles key down event from the label input
 * @param {DataSourceElement} dataSource
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {HTMLUListElement} list
 * @param {Element} rootElement
 * @return {function}
 */
var onKeyDown = function onKeyDown(dataSource, valueInput, labelInput, list, rootElement) {
    return (
        /**
         * @function
         * @param {DOMEvent} e
         * @return {undefined}
         */
        function (e) {
            if (e.target === labelInput) {
                if ([38, 40, 27].indexOf(e.which) >= 0) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                if (e.which === 9) {
                    if (isListVisible(list)) {
                        selectItem(valueInput, labelInput, getSelectedSuggestionItem(list), rootElement);
                        hideList(list, rootElement)(e);
                    }
                }
                if (e.which === 38) {
                    return moveSelection(-1, list);
                }
                if (e.which === 40) {
                    return isListVisible(list) ? moveSelection(1, list) : showList(list);
                }
                if (e.which === 27) {
                    cleanup(valueInput, labelInput, rootElement);
                    return hideList(list, rootElement)();
                }
            }
        }
    );
};

/**
 * Handles key up event from the label input
 * @param {DataSourceElement} dataSource
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {HTMLUListElement} list
 * @param {string} emptyListMessage
 * @param {Element} rootElement
 * @return {function}
 */
var onKeyUp = function onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage, rootElement) {
    return (
        /**
         * @function
         * @param {DOMEvent} e
         * @return {*}
         */
        function (e) {
            if (labelInput.value) {
                dirtifyInput(rootElement);
            } else {
                cleanup(valueInput, labelInput, rootElement);
            }
            if (isListVisible(list) && (e.which === 13 || e.which === 9)) {
                e.stopPropagation();
                e.preventDefault();
                selectItem(valueInput, labelInput, getSelectedSuggestionItem(list), rootElement);
                hideList(list, rootElement)();
                return false;
            }
            if ([38, 40, 27].indexOf(e.which) === -1) {
                e.stopPropagation();
                return fetchList(dataSource, labelInput, list, emptyListMessage, rootElement)(e);
            }
        }
    );
};

/**
 * Handles the click on the arrow icon
 * @param {HTMLUListElement} list
 * @param {HTMLInputElement} labelInput
 * @param {Function} fetchListFn
 * @param {Element} root
 * @returns {function}
 */
var handleArrowClick = function handleArrowClick(list, labelInput, fetchListFn, root) {
    return (
        /**
         * @function
         * @param {DOMEvent} e
         * @return {undefined}
         */
        function (e) {
            e.stopPropagation();
            if (isListVisible(list)) {
                hideList(list, root)(e);
            } else {
                labelInput.focus();
                fetchListFn(e);
            }
        }
    );
};

/**
 * Handles the click on the arrow icon
 * @param {HTMLUListElement} list
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {Function} fetchListFn
 * @param {Element} root
 * @returns {function}
 */
var handleCrossClick = function handleCrossClick(list, valueInput, labelInput, fetchListFn, root) {
    return (
        /**
         * @function
         * @param {DOMEvent} e
         * @return {undefined}
         */
        function (e) {
            cleanup(valueInput, labelInput, root);
            if (isListVisible(list)) {
                fetchListFn(e);
                labelInput.focus();
            }
        }
    );
};

/**
 * When the custom tag has been attached to DOM
 * @this HTMLElement
 */
function elementAttached() {
    /**
     * The as24-autocomplete DOM element
     * @type {HTMLElement}
     */
    var root = this;

    /**
     * The message about no items has been found
     * @type {string}
     */
    var emptyListMessage = root.getAttribute('empty-list-message') || "---";

    /**
     * The id of the data-source element
     * @type {string}
     */
    var dataSourceName = root.getAttribute('data-source');

    if (!dataSourceName) {
        throw new Error("The data source is missing");
    }

    /**
     * The input with which the user can interact
     * @type {HTMLInputElement}
     */
    var labelInput = $('[type=text]', root);

    /**
     * Hidden input in which we actually set the value
     * @type {HTMLInputElement}
     */
    var valueInput = $('[type=hidden]', root);

    /**
     * The UL-element that represents the suggestion list
     * @type {HTMLUListElement}
     */
    var list = $('.as24-autocomplete__list', root);

    /**
     * The arrow down icon
     * @type {HTMLDivElement}
     */
    var iconDropdown = $('.as24-autocomplete__icon-dropdown', root);

    /**
     * The cross-arrow icon
     * @type {*}
     */
    var iconCross = $('.as24-autocomplete__icon-cross', root);

    /**
     * DataSource element
     * @type {DataSourceElement}
     */
    var dataSource = $('#' + dataSourceName, document);

    /**
     * The function that takes an Event and does call to DataSource
     * @type {Function}
     */
    var fetchListFn = fetchList(dataSource, labelInput, list, emptyListMessage, root);

    if (iconDropdown) {
        on('click', handleArrowClick(list, labelInput, fetchListFn, this), iconDropdown);
    }

    if (iconCross) {
        on('click', handleCrossClick(list, valueInput, labelInput, fetchListFn, this), iconCross);
    }

    on('click', hideList(list, root), document);
    on('click', fetchListFn, labelInput);
    on('click', onItemClicked(valueInput, labelInput, list, root), list);
    on('keyup', onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage, root), labelInput, true);
    on('keydown', onKeyDown(dataSource, valueInput, labelInput, list, root), window, true);
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
