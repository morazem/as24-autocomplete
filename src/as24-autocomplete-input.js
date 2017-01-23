import { $, on, triggerEvent } from './helper';

/**
 * @class
 * @typedef SeparatedItemsDataSource
 */
class AutocompleteInput extends HTMLElement {

    setValue(str) {
        this.input.value = str;
    }

    getValue() {
        return this.input.value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    setDisabled(flag) {
        if (flag) {
            this.input.setAttribute('disabled', 'disabled');
        } else {
            this.input.removeAttribute('disabled');
        }
    }

    isDisabled() {
        return this.input.hasAttribute('disabled');
    }

    setError(flag) {
        this.input.classList[flag ? 'add' : 'remove']('error');
    }

    renderInput() {
        return function inputRenderer(suggestions) {
            this.setError(suggestions.length === 0);
            return suggestions;
        }.bind(this);
    }

    onKeyDown(e) {
        if (e.which === 9) {
            triggerEvent('as24-autocomplete:input:focus-lost', this.input);
        }
        if (e.which === 40) {
            triggerEvent('as24-autocomplete:input:go-down', this.input);
        }
        if (e.which === 38) {
            triggerEvent('as24-autocomplete:input:go-up', this.input);
        }
    }

    onKeyUp(e) {
        if (this.isVisible && (e.which === 13 || e.which === 9)) {
            e.stopPropagation();
            e.preventDefault();
            this.selectItem();
            return false;
        }
        if (e.which === 13) {
            triggerEvent('as24-autocomplete:input:enter', this.input);
        }
        if (e.which === 27) {
            this.onCrossClick();
        }
        if (e.which !== 40 && e.which !== 38 && e.which !== 13 && e.which !== 27) {
            triggerEvent('as24-autocomplete:input:query', this.input);
        }
        return null;
    }

    onInputClick() {
        this.isOpened = true;
        if (this.isOpened) {
            triggerEvent('as24-autocomplete:input:trigger-suggestions', this.input);
        }
    }

    onDropDownClick() {
        this.input.focus();
        if (this.isOpened) {
            this.isOpened = false;
            triggerEvent('as24-autocomplete:input:close', this.input);
        } else {
            this.isOpened = true;
            triggerEvent('as24-autocomplete:input:trigger-suggestions', this.input);
        }
    }

    onCrossClick() {
        this.input.focus();
        if (this.input.value === '') {
            this.isOpened = false;
            triggerEvent('as24-autocomplete:input:close', this.input);
        } else {
            this.input.value = '';
            triggerEvent('as24-autocomplete:input:cleanup', this.input);
            if (this.isOpened) {
                triggerEvent('as24-autocomplete:input:trigger-suggestions', this.input);
            }
        }
    }

    attachedCallback() {
        this.isOpened = false;
        this.isDirty = false;
        this.dropDown = $('.as24-autocomplete__icon-dropdown', this);
        this.cross = $('.as24-autocomplete__icon-cross', this);
        this.input = $('input', this);
        on('click', this.onInputClick.bind(this), this.input);
        on('click', this.onDropDownClick.bind(this), this.dropDown);
        on('click', this.onCrossClick.bind(this), this.cross);
        on('keyup', this.onKeyUp.bind(this), this.input, true);
        on('keydown', this.onKeyDown.bind(this), this.input, true);
    }



}

export default function registerDS() {
    try {
        return document.registerElement('as24-autocomplete-input', AutocompleteInput);
    } catch (e) {
        return null;
    }
}
