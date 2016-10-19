const $ = (selector, root) => root.querySelector(selector);
const $$ = (selector, root) => root.querySelectorAll(selector);
const on = (event, cb, el) => el.addEventListener(event, cb);
const off = (event, cb, el) => el.removeEventListener(event, cb);

const appendTo = target => child => {target.appendChild(child); return target};

const renderLI = item => {
  var li = document.createElement('li');
  li.classList.add('as24-autocomplete__list-item');
  li.key = item.key;
  li.innerText = item.value;
  return li;
}

const renderList = list => itemsModel => {
  list.innerHTML = '';
  itemsModel.map(renderLI).forEach(appendTo(list));
  list.classList.add('as24-autocomplete__list--visible');
}

const toggleList = (list, dataSource) => e => {
  e.stopPropagation();
  e.target.tagName === 'INPUT'
    ? dataSource.fetchItems().then(renderList(list))
    : hideList(list)();
}

const onInputKeyup = dataSource => e => dataSource.reduceItems(e.target.value).then(renderList);

const hideList = list => e => list.classList.remove('as24-autocomplete__list--visible');

const selectItem = (valueInput, labelInput, li) => {
  valueInput.value = li.key;
  labelInput.value = li.innerText;
}

const onItemClicked = (valueInput, labelInput, list) => e => {
  selectItem(valueInput, labelInput, e.target);
  hideList(list)();
}

const onKeyUpped = (valueInput, labelInput, list) => e => {
  var currActiveItem;
  var nextActiveItem;

  if (e.which === 38) {
    currActiveItem = $('.as24-autocomplete__list-item--selected', list);
    nextActiveItem = currActiveItem === null
      ? $('.as24-autocomplete__list-item', list)
      : !!currActiveItem.previousSibling
        ? currActiveItem.previousSibling
        : currActiveItem;
    currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
    nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
  }

  if (e.which === 40) {
    if (!list.classList.contains('as24-autocomplete__list--visible')) {
      list.classList.add('as24-autocomplete__list--visible')
      return;
    }
    currActiveItem = $('.as24-autocomplete__list-item--selected', list);
    nextActiveItem = currActiveItem === null
      ? $('.as24-autocomplete__list-item', list)
      : !!currActiveItem.nextSibling
        ? currActiveItem.nextSibling
        : currActiveItem;
    currActiveItem && currActiveItem.classList.remove('as24-autocomplete__list-item--selected');
    nextActiveItem.classList.add('as24-autocomplete__list-item--selected');
  }

  if (e.which === 13) {
    selectItem(valueInput, labelInput, $('.as24-autocomplete__list-item--selected', list));
    hideList(list)();
  }

  if (e.which === 27) {
    hideList(list)();
  }
}

function elementAttached() {
  var labelInput = $('[type=text]', this);
  var valueInput = $('[type=hidden]', this);
  var list = $('.as24-autocomplete__list', this);
  var dataSource = $('#' + this.getAttribute('data-source'), document);
  on('click', hideList(list), document);
  on('click', toggleList(list, dataSource), labelInput);
  on('focus', toggleList(list, dataSource), labelInput);
  on('keyup', onInputKeyup(dataSource), labelInput);
  on('click', onItemClicked(valueInput, labelInput, list), list);
  on('keyup', onKeyUpped(valueInput, labelInput, list), this);
}

function elementDetached() {}

export default function() {
  try {
    document.registerElement('as24-autocomplete', {
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
    }
  }
}
