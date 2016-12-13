'use strict';

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
const closestByClassName = className =>
    /**
     * @param {HTMLElement} elem
     * @return {HTMLElement}
     */
    elem =>
        elem.classList.contains(className)
            ? elem
            : closestByClassName(className)(elem.parentElement);



/**
 * Selects an element using the root element.
 * @param {string} selector Specifies the selector for lookup
 * @param {Element} root Specified within which element to perform the lookup
 * @return {Element}
 */
const $ = (selector, root) =>
    root.querySelector(selector);



/**
 * Binds an event listener on the element
 * @param {string} event
 * @param {Function} cb
 * @param {Element} el
 * @param {boolean} capturing
 */
const on = (event, cb, el, capturing = false) =>
    el.addEventListener(event, cb, capturing);



/**
 * Appends a child element to a target element
 * @param {HTMLElement|DocumentFragment} target
 * @returns {function}
 */
const appendTo = target =>
    /**
     * @param {HTMLElement} child
     * @return {HTMLElement}
     */
    child => {
        target.appendChild(child);
        return target;
    };



/**
 * Shows the suggestions list
 * @param {Element} list
 * @return {boolean}
 */
const showList = list => {
    list.classList.add('as24-autocomplete__list--visible');
    moveSelection(1, list);
    return false;
};



/**
 * Hides the list and deactivates the root elment
 * @param {Element} list
 * @param {Element} rootElement
 */
const hideList = (list, rootElement) => () => {
    rootElement.classList.remove('as24-autocomplete--active');
    list.classList.remove('as24-autocomplete__list--visible');
    return false;
};



/**
 * Checks whether the list is visisible
 * @param {Element} list
 */
const isListVisible = list =>
    list.classList.contains('as24-autocomplete__list--visible');



/**
 * Renders a li item for the suggestions list
 * @param {string} searchStr
 * @returns {function}
 */
const renderLI = searchStr =>
    /**
     * @param {{key:string, value:string}} item
     * @return {HTMLLIElement}
     */
    item => {
        const li = document.createElement('li');
        const searchValue = searchStr;
        const resultValue = item.value.replace(new RegExp('^' + searchValue, 'gi'), '');
        li.classList.add('as24-autocomplete__list-item');
        li.key = item.key;
        (li.innerHTML = searchStr.length
            ? '<strong>' + searchValue + '</strong>' + resultValue
            : resultValue);
        return li;
    };



/**
 * What to render when there is nothing to suggest
 * @param {String} emptyMessage
 * @returns {HTMLLIElement}
 */
const renderEmptyListItem = emptyMessage => {
    /** @type {HTMLLIElement} */
    const li = document.createElement('li');
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
const renderList = (emptyMessage, list, labelInput) => itemsModel => {
    list.innerHTML = '';
    const df = document.createDocumentFragment();

    (itemsModel.length
        ? itemsModel.map(renderLI(labelInput.value))
        : [renderEmptyListItem(emptyMessage)]
    ).forEach(appendTo(df));

    list.classList[itemsModel.length ? 'remove' : 'add']('as24-autocomplete__list--empty');
    appendTo(list)(df);
    showList(list);
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
const fetchList = (dataSource, labelInput, list, emptyMessage, rootElement) =>
    /**
     * @param {{target:HTMLElement}} e
     * @return {undefined}
     */
    e => {
        e.stopPropagation();
        rootElement.classList.add('as24-autocomplete--active');
        dataSource.fetchItems(labelInput.value).then(renderList(emptyMessage, list, labelInput));
    };



/**
 * This is what happens after the user selected an item
 * @param valueInput
 * @param labelInput
 * @param li
 */
const selectItem = (valueInput, labelInput, li) => {
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
const onItemClicked = (valueInput, labelInput, list, rootElement) => e => {
    selectItem(valueInput, labelInput, closestByClassName('as24-autocomplete__list-item')(e.target));
    hideList(list, rootElement)(e);
};



/**
 *
 * @param {HTMLElement} list
 * @param {HTMLElement} selected
 */
const followSelectedItem = (list, selected) => {
    const listHeight = list.getBoundingClientRect().height;
    const selectedTop = selected.offsetTop;
    const selectedHeight = selected.offsetHeight;
    list.scrollTop = -1 * (listHeight - (selectedTop + selectedHeight));
};



/**
 * When mouse goes over the suggestion item
 * @param {HTMLUListElement} list
 * @return {function} a function that accepts an event
 */
const onItemMouseOver = list =>
    /**
     * @param {{target:HTMLElement}} e
     * @return {undefined}
     */
    e => {
        e.stopPropagation();
        const preselected = $('.as24-autocomplete__list-item--preselected', list);
        if (e.target.tagName === 'LI') {
            if(preselected) {
                preselected.classList.remove('as24-autocomplete__list-item--preselected');
            }
            e.target.classList.add('as24-autocomplete__list-item--preselected');
        }
    };



/**
 * Selected next/prev suggestion item
 * @param {number} dir
 * @param {Element} list
 * @return {boolean}
 */
const moveSelection = (dir, list) => {
    const next = dir === 1 ? 'nextSibling' : 'previousSibling';
    const currActiveItem = $('.as24-autocomplete__list-item--selected', list);
    const nextActiveItem = currActiveItem === null
        ? $('.as24-autocomplete__list-item', list)
        : !!currActiveItem[next]
        ? currActiveItem[next]
        : currActiveItem;
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
const onKeyDown = (dataSource, valueInput, labelInput, list, rootElement) => e => {
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



/**
 * Handles key up
 * @param dataSource
 * @param valueInput
 * @param labelInput
 * @param list
 * @param emptyListMessage
 * @param rootElement
 */
const onKeyUp = (dataSource, valueInput, labelInput, list, emptyListMessage, rootElement) => e => {
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



/**
 * Handles the click on an arrow
 * @param {Element} list
 * @param {HTMLInputElement} labelInput
 * @param {Function} fetchListFn
 * @param {Element} root
 */
const handleArrowClick = (list, labelInput, fetchListFn, root) => e => {
    e.stopPropagation();
    if(isListVisible(list)) {
        hideList(list, root)(e)
    } else {
        labelInput.focus();
        fetchListFn(e);
    }
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
    const root = this;

    /**
     * The message about no items has been found
     * @type {string}
     */
    const emptyListMessage = root.getAttribute('empty-list-message') || "---";

    /**
     * The id of the data-source element
     * @type {string}
     */
    const dataSourceName = root.getAttribute('data-source');

    if (!dataSourceName) {
        throw new Error("The data source is missing");
    }

    /**
     * The input with which the user can interract
     * @type {HTMLInputElement}
     */
    const labelInput = $('[type=text]', root);

    /**
     * Hidden input in which we actually set the value
     * @type {HTMLInputElement}
     */
    const valueInput = $('[type=hidden]', root);

    /**
     * The UL-element that represents the suggestion list
     * @type {HTMLUListElement}
     */
    const list = $('.as24-autocomplete__list', root);

    /**
     * The div that holds an arrow
     * @type {HTMLDivElement}
     */
    const arrow = $('.as24-autocomplete__icon-wrapper', root);

    /**
     * DataSource element
     * @type {DataSourceElement}
     */
    const dataSource = $('#' + dataSourceName, document);

    /**
     * The function that takes an Event and does call to DataSource
     * @type {Function}
     */
    const fetchListFn = fetchList(dataSource, labelInput, list, emptyListMessage, root);

    if(arrow) {
        on('click', handleArrowClick(list, labelInput, fetchListFn, this), arrow);
    }

    on('click', hideList(list, root), document);
    on('click', fetchListFn, labelInput);
    on('click', onItemClicked(valueInput, labelInput, list, root), list);
    on('keyup', onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage, root), labelInput);
    on('keydown', onKeyDown(dataSource, valueInput, labelInput, list, root), window);
    on('mouseover', onItemMouseOver(list), list, true);
}

function elementDetached() {
}

export default function () {
    try {
        return document.registerElement('as24-autocomplete', {
            prototype: Object.assign(
                Object.create(HTMLElement.prototype, {
                    attachedCallback: {value: elementAttached},
                    detachedCallback: {value: elementDetached},
                    attributeChangedCallback: {
                        value: function () {
                        }
                    }
                })
            )
        });
    } catch (e) {
        if (window && window.console) {
            window.console.warn('Failed to register CustomElement "as24-autocomplete".', e);
            return null;
        }
    }
}
