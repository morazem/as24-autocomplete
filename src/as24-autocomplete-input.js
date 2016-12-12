'use strict';

/**
 * Selects an element using the root element.
 * @param {string} selector
 * @param {Element} root
 */
const $ = (selector, root) => root.querySelector(selector);

/**
 * Binds an event listener on the element
 * @param event
 * @param cb
 * @param el
 */
const on = (event, cb, el) => el.addEventListener(event, cb);

/**
 * Appends a child element to a target element
 * @param target
 */
const appendTo = target => child => {
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
const hideList = (list, rootElement) => e => {
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
 * @param {{key: string, value: string}} item
 * @param {string} searchInput
 * @returns {HTMLElement} {Element}
 */
const renderLI = searchInput => item => {
    const li = document.createElement('li');
    const searchValue = searchInput;
    const resultValue = item.value.replace(new RegExp('^' + searchValue, 'gi'), '');
    li.classList.add('as24-autocomplete__list-item');
    li.key = item.key;
    (li.innerHTML = searchInput.length
        ? searchValue + '<b>' + resultValue + '</b>'
        : resultValue);
    return li;
};

/**
 * What to render when there is nothing to suggest
 * @param {String} emptyMessage
 * @return {Element}
 */
const renderEmptyListItem = emptyMessage => {
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
 * @param {Element} labelInput
 * @returns {Function}
 */
const renderList = (emptyMessage, list, labelInput) => itemsModel => {
    list.innerHTML = '';
    const df = document.createDocumentFragment();
    (itemsModel.length
            ? itemsModel.map(renderLI(labelInput.value, list))
            : [renderEmptyListItem(emptyMessage)]
    ).forEach(appendTo(df));
    list.classList[itemsModel.length ? 'remove' : 'add']('as24-autocomplete__list--empty');
    appendTo(list)(df);
    showList(list);
};

/**
 * Fetch data according to user input and renders the list
 * @param {Element} dataSource
 * @param {HTMLInputElement} labelInput
 * @param {Element} list
 * @param {String} emptyMessage
 * @param {Element} rootElement
 */
const fetchList = (dataSource, labelInput, list, emptyMessage, rootElement) => e => {
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
    selectItem(valueInput, labelInput, e.target);
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
 * @param list
 */
const onItemMouseOver = list => e => {
    const currActiveItem = $('.as24-autocomplete__list-item--selected', list);
    const mouseOverElement = e.target;
    currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
    mouseOverElement.classList.add('as24-autocomplete__list-item--selected');
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

function elementAttached() {
    const emptyListMessage = this.getAttribute('empty-list-message') || "---";
    const dataSourceName = this.getAttribute('data-source');
    if (!dataSourceName) {
        throw "The data source is missing";
    }
    const labelInput = $('[type=text]', this);
    const valueInput = $('[type=hidden]', this);
    const list = $('.as24-autocomplete__list', this);

    const dataSource = $('#' + dataSourceName, document);
    const fetchListCallback = fetchList(dataSource, labelInput, list, emptyListMessage, this);

    on('click', hideList(list, this), document);
    on('click', fetchListCallback, labelInput);
    on('click', onItemClicked(valueInput, labelInput, list, this), list);
    on('keyup', onKeyUp(dataSource, valueInput, labelInput, list, emptyListMessage, this), labelInput);
    on('keydown', onKeyDown(dataSource, valueInput, labelInput, list, this), window);
    on('mouseover', onItemMouseOver(list), list);
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
