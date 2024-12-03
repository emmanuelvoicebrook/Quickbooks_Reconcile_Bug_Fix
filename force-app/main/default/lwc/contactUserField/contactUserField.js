import { LightningElement, track, api, wire } from 'lwc';
import { getFieldValue, getFieldDisplayValue, getRecord } from 'lightning/uiRecordApi';
import searchContact from '@salesforce/apex/VBContactUserFieldController.searchContacts';
import searchAccounts from '@salesforce/apex/VBContactUserFieldController.searchAccounts';

export default class UserContactLookup extends LightningElement {
    @track userSameAsContact = false;
    @api recordId;
    @api objectApiName;
    @api required;
    contactId = null;
    userId = null;
    @track possibleContacts = [];
    @track possibleUsers = [];
    @track possibleAccounts = [];
    @track contact_selected = false;
    @track user_selected = false;
    @track account_selected = false;
    @track selectedContactName = '';
    @track selectedUserName = '';
    @track selectedAccountName = '';
    @api selectedContactId = '';
    @api selectedUserId = '';
    @api selectedAccountId = null;
    @track accountId = null;
    @track contactDisabled = true;
    @track userDisabled = true;



    connectedCallback() {
        // window.addEventListener('click', this.handleClose.bind(this));
    }
    handleChange(event) {
        if (event.target.label === 'User is the Same as Contact') {
            this.userSameAsContact = event.target.checked;
            if (this.userSameAsContact && this.contact_selected) {
                // call handleContactSelection to set the user to the same as the contact
                // set the selected contact name
                this.selectedUserName = this.selectedContactName;
                // set the selected contact id
                this.selectedUserId = this.selectedContactId
                this.user_selected = true;

                this.refresh();
            } else {
                this.clearUserSelection();
            }

        }
    }


    @api validate() {
        if (this.required && (!this.contact_selected || !this.user_selected || !this.account_selected)) {
            return {
                isValid: false,
                errorMessage: 'Please select a Contact, User, and Account'
            }
        } else {
            return {
                isValid: true
            }
        }
    }



    handleContactSearch(event) {
        const searchKey = event.detail;
        // pass the seachKey to apex method
        if (searchKey) {
            searchContact({ searchKey: searchKey, accountId: this.selectedAccountId })
                .then(result => {
                    // set @track contacts variable with return contact list from server
                    this.possibleContacts = result;
                })
                .catch(error => {
                    this.error = error;
                });
        } else {
            this.possibleContacts = [];
        }
        window.addEventListener('click', this.handleClose.bind(this));

        // this.refresh();
    }
    handleAccountSearch(event) {
        const searchKey = event.detail;
        // pass the seachKey to apex method
        if (searchKey) {
            searchAccounts({ searchKey: searchKey, accountId: null })
                .then(result => {
                    // set @track contacts variable with return contact list from server
                    this.possibleAccounts = result;
                    // this.userDisabled = false;
                    // this.contactDisabled = false;
                })
                .catch(error => {
                    this.error = error;
                });
        } else {
            this.possibleAccounts = [];
        }

        window.addEventListener('click', this.handleClose.bind(this));
        // this.refresh();
    }

    handleUserSearch(event) {
        const searchKey = event.detail;
        // pass the seachKey to apex method
        if (searchKey) {
            searchContact({ searchKey: searchKey, accountId: this.selectedAccountId })
                .then(result => {
                    // set @track contacts variable with return contact list from server
                    this.possibleUsers = result;
                })
                .catch(error => {
                    this.error = error;
                });
        } else {
            this.possibleUsers = [];
        }

        window.addEventListener('click', this.handleClose.bind(this));
        // this.refresh();
    }

    handleSubmit(event) {
        event.preventDefault();

        if (this.userSameAsContact) {
            if (this.contactId) {
                this.template.querySelector('[data-id="user"]').value = this.contactId
            } else {
                console.log('Please select a contact');
            }
        } else {
            if (this.contactId && this.userId) {
                //this.saveRecord();
            } else {
                console.log('Please fill in both fields');
            }
        }
    }

    handleContactSelection(event) {
        // close the lookup menu
        // this.template.querySelector('[data-id="contact_control"]').classList.remove('slds-is-open');
        // get the value in data id
        const selectedContactId = event.detail;
        //find the contact in the list
        const selectedContact = this.possibleContacts.find(contact => contact.Id === selectedContactId);
        // set the selected contact name
        this.selectedContactName = selectedContact.Name;
        // set the selected contact id
        this.selectedContactId = selectedContact.Id;
        this.contact_selected = true;
        // if the user is the same as the contact, set the user to the contact
        if (this.userSameAsContact) {
            if (this.selectedContactId != this.selectedUserId) {
                this.selectedUserId = this.selectedContactId;
                this.selectedUserName = this.selectedContactName;
                this.user_selected = true;
            }
        }
        this.possibleContacts = [];
        this.refresh();
    }
    handleUserSelection(event) {
        // close the lookup menu
        // this.template.querySelector('[data-id="contact_control"]').classList.remove('slds-is-open');
        // get the value in data id
        const selectedUserId = event.detail;
        //find the contact in the list
        const selected = this.possibleUsers.find(user => user.Id === selectedUserId);
        // set the selected contact name
        this.selectedUserName = selected.Name;
        // set the selected contact id
        this.selectedUserId = selected.Id;
        this.user_selected = true;
        // check if the lightning input with id control is checked 
        if (this.userSameAsContact) {
            // check if the selected contact id matches the selected user id
            if (this.selectedContactId != this.selectedUserId) {
                // unchecked the lightning input with id control
                this.userSameAsContact = false;
                this.template.querySelector('[data-name="controller"]').checked = false;
            }
        }
        this.possibleUsers = [];
        this.refresh();
    }
    handleAccountSelection(event) {
        console.log('handleSelection');
        
        this.userDisabled = false;
        this.contactDisabled = false;
        // close the lookup menu
        // this.template.querySelector('[data-id="contact_control"]').classList.remove('slds-is-open');
        // get the value in data id
        const selectedAccountId = event.detail;
        //find the contact in the list
        const selected = this.possibleAccounts.find(account => account.Id === selectedAccountId);
        // set the selected contact name
        this.selectedAccountName = selected.Name;
        // set the selected contact id
        this.selectedAccountId = selected.Id;
        this.account_selected = true;
        this.possibleAccounts = [];
        this.refresh();
    }


    saveRecord() {
        const fields = {
            'Contact__c': this.contactId,
            'User__c': this.userId
        };
        const recordInput = { fields };

        this.template.querySelector('lightning-record-edit-form').submit(recordInput);
    }

    clearContactSelection() {
        this.selectedContactName = '';
        this.selectedContactId = '';
        this.contact_selected = false;
        this.refresh();

    }
    clearUserSelection() {
        this.selectedUserName = '';
        this.selectedUserId = '';
        this.user_selected = false;
        // if contact is selected. clear the User is same as contact field
        if (this.contact_selected) {
            this.userSameAsContact = false;
            this.template.querySelector('[data-name="controller"]').checked = false;
        }
        this.refresh();

    }
    clearAccountSelection() {
        this.selectedAccountName = '';
        this.selectedAccountId = null;
        this.account_selected = false;
        // this.clearContactSelection();
        //
        this.selectedContactName = '';
        this.selectedContactId = '';
        this.contact_selected = false;


        // this.clearUserSelection();

        this.selectedUserName = '';
        this.selectedUserId = '';
        this.user_selected = false;
        // if contact is selected. clear the User is same as contact field
        if (this.contact_selected) {
            this.userSameAsContact = false;
            this.template.querySelector('[data-name="controller"]').checked = false;
        }

        this.userDisabled = true;
        this.contactDisabled = true;
        this.reset();

    }

    refresh() {
        let components = this.template.querySelectorAll('c-v-b-lookup-field');
        components.forEach(component => {
            component.update();
        })
    }

    reset() {
        let components = this.template.querySelectorAll('c-v-b-lookup-field');
        components.forEach(component => {
            component.reset();
        })
    }
    handleClose(event) {
        let components = this.template.querySelectorAll('c-v-b-lookup-field');
        components.forEach(component => {
            component.close(event);
        })
    }
    cancel(e) {
        e.preventDefault();
    }
}