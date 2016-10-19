const $ = (selector, root) => root.querySelector(selector);
const on = (event, cb, el) => el.addEventListener(event, cb);
const off = (event, cb, el) => el.removeEventListener(event, cb);

const appendTo = target => child => target.appendChild(child), target;

const renderLI = item => {
  var li = document.createElement('li');
  li.key = item.key;
  li.innerText = item.value;
  return li;
}

const renderList = list => itemsModel => {
  list.innerHTML = '';
  itemsModel.map(renderLI).forEach(appendTo(list));
  list.classList.add('as24-autocomplete__list--visible');
}

const onInputFocused = (list, dataSource) => e => dataSource.fetchItems().then(renderList(list));

const onInputKeyup = dataSource => e => dataSource.reduceItems(e.target.value).then(renderList);

const onItemClicked = (valueInput, labelInput, list) => e => {
  valueInput.value = e.target.key;
  labelInput.value = e.target.innerText;
  list.classList.remove('as24-autocomplete__list--visible');
}

function elementAttached() {
  var labelInput = $('[type=text]', this);
  var valueInput = $('[type=hidden]', this);
  var list = $('.as24-autocomplete__list', this);
  var dataSource = $('#' + this.getAttribute('data-source'), document);
  on('focus', onInputFocused(list, dataSource), labelInput);
  on('keyup', onInputKeyup(dataSource), labelInput);
  on('click', onItemClicked(valueInput, labelInput, list), list);
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
