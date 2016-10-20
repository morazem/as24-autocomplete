const $ = (selector, root) => root.querySelector(selector);
const $$ = (selector, root) => root.querySelectorAll(selector);
const on = (event, cb, el) => el.addEventListener(event, cb);
const off = (event, cb, el) => el.removeEventListener(event, cb);

const appendTo = target => child => { target.appendChild(child); return target };

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

const hideList = list => e =>
  list.classList.remove('as24-autocomplete__list--visible');

const selectItem = (valueInput, labelInput, li) => {
  valueInput.value = li.key;
  labelInput.value = li.innerText;
}

const onItemClicked = (valueInput, labelInput, list) => e => {
  selectItem(valueInput, labelInput, e.target);
  hideList(list)();
}

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
}

const onKeyUpped = (dataSource, valueInput, labelInput, list) => e => {
  switch(e.which) {
    case 38: return moveSelection(-1, list);
    case 40: return moveSelection(1, list);
    case 27: return hideList(list)();
    case 13: {
      selectItem(valueInput, labelInput, $('.as24-autocomplete__list-item--selected', list));
      hideList(list)();
      return;
    }
    default: return dataSource.reduceItems(e.target.value).then(renderList(list));
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
  on('click', onItemClicked(valueInput, labelInput, list), list);
  on('keyup', onKeyUpped(dataSource, valueInput, labelInput, list), labelInput);
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
