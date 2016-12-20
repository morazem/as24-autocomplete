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
 * @param {Element|Window|Document} el
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
* Finds the currently selected suggestion item
* @param {HTMLUListElement} list
* @returns {HTMLLIElement}
*/
const getSelectedSuggestionItem = list =>
    $('.as24-autocomplete__list-item--selected', list);



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
 * Selected next/prev suggestion item
 * @param {number} dir
 * @param {HTMLUListElement} list
 * @return {boolean}
 */
const moveSelection = (dir, list) => {
    const next = dir === 1 ? 'nextSibling' : 'previousSibling';
    const currActiveItem = getSelectedSuggestionItem(list);
    const nextActiveItem = currActiveItem === null
        ? $('.as24-autocomplete__list-item', list)
        : currActiveItem[next] !== null
            ? currActiveItem[next]
            : currActiveItem;
    if (currActiveItem) {
        currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
    }
    nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
    followSelectedItem(list, nextActiveItem);
    return false;
};



/**
 * Shows the suggestions list
 * @param {HTMLUListElement} list
 * @return {boolean}
 */
const showList = list => {
    list.classList.add('as24-autocomplete__list--visible');
    moveSelection(1, list);
    return false;
};



/**
 * Hides the list and deactivates the root element
 * @param {HTMLUListElement} list
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
 * When user clicks cross icon, all the input must be removed
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {Element} root
 * @return {*}
 */
const cleanup = (valueInput, labelInput, root) => {
    valueInput.value = '';
    labelInput.value = '';
    root.classList.remove('as24-autocomplete--user-input');
};



/**
 * When user types something in we mark the component as dirty
 * @param {Element} rootElement
 * @return {*}
 */
const dirtifyInput = (rootElement) =>
    rootElement.classList.add('as24-autocomplete--user-input');



/**
 * Renders a li item for the suggestions list
 * @param {string} searchStr
 * @returns {function}
 */
const renderLI = searchStr =>
    /**
     * @param {Suggestion} item
     * @returns {HTMLLIElement}
     */
    item => {
        const li = document.createElement('li');
        li.classList.add('as24-autocomplete__list-item');
        li.dataset.key = item.key;
        li.innerHTML = item.value.replace(new RegExp(`(${searchStr})`, 'ig'), '<strong>$1</strong>');
        return li;
    };



/**
 * What to render when there is nothing to suggest
 * @param {String} emptyMessage
 * @returns {HTMLLIElement}
 */
const renderEmptyListItem = emptyMessage => {
    /**
     * @type {HTMLLIElement}
     */
    const li = document.createElement('li');
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
const renderList = (emptyMessage, list, labelInput) =>
    /**
     * @param {Array<Suggestion>} suggestions
     */
    suggestions => {
        list.innerHTML = '';
        const df = document.createDocumentFragment();

        (suggestions.length
            ? suggestions.map(renderLI(labelInput.value))
            : [renderEmptyListItem(emptyMessage)]
        ).forEach(appendTo(df));

        list.classList[suggestions.length ? 'remove' : 'add']('as24-autocomplete__list--empty');
        appendTo(list)(df);
        showList(list);
    };



/**
 * Fetch data according to user input and renders the list
 * @param {DataSource} dataSource
 * @param {HTMLInputElement} labelInput
 * @param {Element} list
 * @param {String} emptyMessage
 * @param {Element} rootElement
 * @returns {function}
 */
const fetchList = (dataSource, labelInput, list, emptyMessage, rootElement) =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {undefined}
     */
    e => {
        e.stopPropagation();
        rootElement.classList.add('as24-autocomplete--active');
        dataSource.fetchItems(labelInput.value).then(renderList(emptyMessage, list, labelInput));
    };


/**
 *
 * @param {string} eventName
 * @param {HTMLInputElement} el
 */
const triggerChangeEvent = (eventName, el) => {
    const evt = document.createEvent('Event');
    evt.initEvent(eventName, true, true);
    el.dispatchEvent(evt);
};


/**
 * This is what happens after the user selected an item
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {HTMLLIElement} li
 * @param {Element} rootElement
 */
const selectItem = (valueInput, labelInput, li, rootElement) => {
    valueInput.value = li.dataset.key;
    labelInput.value = li.innerText;
    triggerChangeEvent('change', valueInput);
    dirtifyInput(rootElement);
};



/**
 * This is what happens then user clicked in the suggestion item
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {HTMLUListElement} list
 * @param {HTMLElement} rootElement
 */
const onItemClicked = (valueInput, labelInput, list, rootElement) => e => {
    selectItem(valueInput, labelInput, closestByClassName('as24-autocomplete__list-item')(e.target), rootElement);
    rootElement.classList.add('as24-autocomplete--user-input');
    hideList(list, rootElement)(e);
};



/**
 * When mouse goes over the suggestion item
 * @param {HTMLUListElement} list
 * @return {function} a function that accepts an event
 */
const onItemMouseOver = list =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {undefined}
     */
    e => {
        e.stopPropagation();
        const preselected = $('.as24-autocomplete__list-item--preselected', list);
        if (e.target.tagName === 'LI') {
            if (preselected) {
                preselected.classList.remove('as24-autocomplete__list-item--preselected');
            }
            e.target.classList.add('as24-autocomplete__list-item--preselected');
        }
    };



/**
 * Handles key down event from the label input
 * @param {DataSource} dataSource
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {HTMLUListElement} list
 * @param {string} emptyListMessage
 * @param {Element} rootElement
 * @return {function}
 */
const onKeyDown = (dataSource, valueInput, labelInput, list, emptyListMessage, rootElement) =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {undefined}
     */
    e => {
        if (e.target === labelInput) {
            if ([38, 40, 27].indexOf(e.which) >= 0) {
                e.stopPropagation();
                e.preventDefault();
            }
            if (e.which === 9) {
                if (isListVisible(list)) {
                    selectItem(valueInput, labelInput,
                        getSelectedSuggestionItem(list),
                        rootElement
                    );
                    hideList(list, rootElement)(e);
                }
            }
            if (e.which === 38) {
                return moveSelection(-1, list);
            }
            if (e.which === 40) {
                return isListVisible(list)
                    ? moveSelection(1, list)
                    : fetchList(dataSource, labelInput, list,
                        emptyListMessage, rootElement)(e);
            }
            if (e.which === 27) {
                cleanup(valueInput, labelInput, rootElement);
                return hideList(list, rootElement)();
            }
        }
        return null;
    };



/**
 * Handles key up event from the label input
 * @param {DataSource} dataSource
 * @param {HTMLInputElement} valueInput
 * @param {HTMLInputElement} labelInput
 * @param {HTMLUListElement} list
 * @param {string} emptyListMessage
 * @param {Element} rootElement
 * @return {function}
 */
const onKeyUp = (dataSource, valueInput, labelInput, list, emptyListMessage, rootElement) =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {*}
     */
    e => {
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
        return null;
    };



/**
 * Handles the click on the arrow icon
 * @param {HTMLUListElement} list
 * @param {HTMLInputElement} labelInput
 * @param {Function} fetchListFn
 * @param {Element} root
 * @returns {function}
 */
const handleArrowClick = (list, labelInput, fetchListFn, root) =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {undefined}
     */
    e => {
        e.stopPropagation();
        if (isListVisible(list)) {
            hideList(list, root)(e);
        } else {
            labelInput.focus();
            fetchListFn(e);
        }
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
const handleCrossClick = (list, valueInput, labelInput, fetchListFn, root) =>
    /**
     * @function
     * @param {DOMEvent} e
     * @return {undefined}
     */
    e => {
        cleanup(valueInput, labelInput, root);
        triggerChangeEvent('change', valueInput);
        if (isListVisible(list)) {
            fetchListFn(e);
            labelInput.focus();
        }
    };



/**
 * Returns promised Suggestion by key
 * @param  {DataSource} dataSource
 * @param  {string} keyValue
 * @return {Promise.<Suggestion>}
 */
const getInitialValueByKey = (dataSource, keyValue) =>
    dataSource.getSuggestionByKey(keyValue);



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
    const emptyListMessage = root.getAttribute('empty-list-message') || '---';

    /**
     * The id of the data-source element
     * @type {string}
     */
    const dataSourceName = root.getAttribute('data-source');

    if (!dataSourceName) {
        throw new Error('The data source is missing');
    }

    /**
     * The input with which the user can interact
     * @type {HTMLInputElement}
     */
    const userFacingInput = $('[type=text]', root);

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
     * The arrow down icon
     * @type {HTMLDivElement}
     */
    const iconDropdown = $('.as24-autocomplete__icon-dropdown', root);

    /**
     * The cross-arrow icon
     * @type {*}
     */
    const iconCross = $('.as24-autocomplete__icon-cross', root);

    /**
     * DataSource element
     * @type {DataSource}
     */
    const dataSource = $(`#${dataSourceName}`, document);

    if (!dataSource) {
        throw new Error(`The DataSource ${dataSourceName} has not been found`);
    }

    /**
     * The function that takes an Event and does call to DataSource
     * @type {Function}
     */
    const fetchListFn = fetchList(dataSource, userFacingInput, list, emptyListMessage, root);

    setTimeout(() => {
        if (valueInput.value) {
            getInitialValueByKey(dataSource, valueInput.value)
                .then(suggestion => {
                    if (suggestion) {
                        userFacingInput.value = suggestion.value;
                        dirtifyInput(root);
                    }
                    return true;
                });
        }
    });

    if (iconDropdown) {
        on('click', handleArrowClick(list, userFacingInput, fetchListFn, this), iconDropdown);
    }

    if (iconCross) {
        on('click', handleCrossClick(list, valueInput, userFacingInput, fetchListFn, this), iconCross);
    }

    on('click', hideList(list, root), document);
    on('click', fetchListFn, userFacingInput);
    on('click', onItemClicked(valueInput, userFacingInput, list, root), list);
    on('keyup', onKeyUp(dataSource, valueInput, userFacingInput, list, emptyListMessage, root), userFacingInput, true);
    on('keydown', onKeyDown(dataSource, valueInput, userFacingInput, list, emptyListMessage, root), window, true);
    on('mouseover', onItemMouseOver(list), list, true);
}



function elementDetached() { }



export default function() {
    try {
        return document.registerElement('as24-autocomplete', {
            prototype: Object.assign(
                Object.create(HTMLElement.prototype, {
                    attachedCallback: { value: elementAttached },
                    detachedCallback: { value: elementDetached },
                    attributeChangedCallback: {
                        value() {}
                    }
                }), {
                    /**
                     * @this {HTMLElement}
                     */
                    selectedValue() {
                        return $('[type=hidden]', this).value;
                    },
                    userQuery() {
                        return $('[type=text]', this).value;
                    },
                    dataSourceElement() {
                        return document.getElementById(this.getAttribute('data-source'));
                    }
                }
            )
        });
    } catch (e) {
        if (window && window.console) {
            window.console.warn('Failed to register CustomElement "as24-autocomplete".', e);
            return null;
        }
    }
    return true;
}
