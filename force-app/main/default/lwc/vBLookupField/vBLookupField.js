import { LightningElement, track, api } from 'lwc';

export default class VBLookupField extends LightningElement {

    @api comboboxList = [];
    @api selectedValue = '';
    @api label = '';
    @api contactSelected;
    @track showListbox = false;
    @api showSubtext;
    @api icon;
    @api required;
    @api disabled;


    renderedCallback() {
        if (!this.contactSelected) {
            if (this.comboboxList != null && this.comboboxList.length > 0) {
                this.template.querySelector('[data-id="contact_control"]').classList.add('slds-is-open');
            } else {
                this.template.querySelector('[data-id="contact_control"]').classList.remove('slds-is-open');
            }
        }
        // if disabled ensure the input is empty
        if (this.disabled) {
            this.template.querySelector('lightning-input').value = '';
        }
    }


    @api update() {
        this.renderedCallback();
    }

    @api reset(){
        if(this.template.querySelector('[data-id="contact_control"]') != null){
            this.template.querySelector('[data-id="contact_control"]').classList.remove('slds-is-open');
            this.renderedCallback();
        }
    }

    // handleSearch 
    handleSearch(event) {
        // get the search field value
        const searchKey = event.target.value;
        // send the searchKey to the parent component
        const searchEvent = new CustomEvent('search', {
            detail: searchKey
        });
        this.dispatchEvent(searchEvent);

    }
    handleFocus() {
        this.showListbox = true;
    }

    @api
    close(event) {
        try {
            if (event.target.classList.contains('ignore-click')) {
            } else {
                this.template.querySelector('[data-id="contact_control"]').classList.remove('slds-is-open');
            }
        } catch (e) {
        }
    }
    handleSelection(event) {
        event.preventDefault();
        event.stopPropagation();
        // close the lookup menu
        this.template.querySelector('[data-id="contact_control"]').classList.remove('slds-is-open');
        // get the value in data id
        const selectedContactId = event.currentTarget.dataset.id;

        // send event to parent component
        const selectionEvent = new CustomEvent('selection', {
            detail: selectedContactId
        });
        this.dispatchEvent(selectionEvent);
        this.showListbox = false;

    }

    clearSelection() {
        const clearEvent = new CustomEvent('clear');
        this.dispatchEvent(clearEvent);

    }

    closeMenu() {
        this.template.querySelector('[data-id="contact_control"]').classList.remove('slds-is-open');
    }

    get iconName() {
        return 'standard:' + this.icon;
    }
}