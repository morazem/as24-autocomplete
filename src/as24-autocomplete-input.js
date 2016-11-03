const $ = (selector, root) => root.querySelector(selector);
const on = (event, cb, el) => el.addEventListener(event, cb);

const appendTo = target => child => { target.appendChild(child); return target };

const showList = list =>
  list.classList.add('as24-autocomplete__list--visible');

const hideList = list => e =>
  list.classList.remove('as24-autocomplete__list--visible');

const isListVisible = list =>
  list.classList.contains('as24-autocomplete__list--visible');

/**
 * Renders a li item for the suggestions list
 * @param {{key: string, value: string}} item
 * @returns {HTMLElement} {Element}
 */
const renderLI = item => {
  var li = document.createElement('li');
  li.classList.add('as24-autocomplete__list-item');
  li.key = item.key;
  li.innerText = item.value;
  return li;
};

const renderEmptyListItem = (emptyMessage) => {
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
const renderList = (emptyMessage, list) => itemsModel => {
  list.innerHTML = '';
  var df = document.createDocumentFragment();
  (itemsModel.length
      ? itemsModel.map(renderLI)
      : [renderEmptyListItem(emptyMessage)]
  ).forEach(appendTo(df));
  list.classList[itemsModel.length ? 'remove' : 'add']('as24-autocomplete__list--empty');
  appendTo(list)(df);
  showList(list);
};

const fetchList = (dataSource, labelInput, list, emptyMessage) => e => {
  e.stopPropagation();
  dataSource.fetchItems(labelInput.value).then(renderList(emptyMessage, list));
};

const selectItem = (valueInput, labelInput, li) => {
  valueInput.value = li.key;
  labelInput.value = li.innerText;
};

const onItemClicked = (valueInput, labelInput, list) => e => {
  selectItem(valueInput, labelInput, e.target);
  hideList(list)(e);
};

const moveSelection = (dir, list) => {
  var next = dir === 1 ? 'nextSibling' : 'previousSibling';
  var currActiveItem = $('.as24-autocomplete__list-item--selected', list);
  var nextActiveItem = currActiveItem === null
    ? $('.as24-autocomplete__list-item', list)
    : !!currActiveItem[next]
      ? currActiveItem[next]
      : currActiveItem;
  currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
  nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
  nextActiveItem.scrollIntoView();
};

const onKeyDown = (dataSource, valueInput, labelInput, list) => e => {
  switch(e.which) {
    case 38: return moveSelection(-1, list);
    case 40: return isListVisible(list) ? moveSelection(1, list) : showList(list);
    case 27: return hideList(list)();
  }
};

const onKeyUp = (dataSource, valueInput, labelInput, list, emptyListMessage) => e => {
  if (e.which === 13) {
    selectItem(valueInput, labelInput, $('.as24-autocomplete__list-item--selected', list));
    hideList(list)();
    return;
  }
  if ([38,40,27].indexOf(e.which) === -1) {
    return fetchList(dataSource, labelInput, list, emptyListMessage)(e);
  }
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
  on('keydown', onKeyDown(dataSource, valueInput, labelInput, list), labelInput);
}

function elementDetached() {}

export default function() {
  try {
    return document.registerElement('as24-autocomplete', {
        prototype: Object.assign(
            Object.create(HTMLElement.prototype, {
                attachedCallback: { value: elementAttached },
                detachedCallback: { value: elementDetached },
                attributeChangedCallback: { value: function () { } }
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
