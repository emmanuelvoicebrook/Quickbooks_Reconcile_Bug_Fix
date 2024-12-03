import { LightningElement, track, api } from 'lwc';
import getRecords from '@salesforce/apex/VBTabularController.getRecords';

export default class VBTabularSalesforceLookup extends LightningElement {
    @api label
    @api noitems
    @api sobject
    @api variant
    @api required

    
    @track searchTerm = '';
    @track _value = ''
    @track _valueId = ''
    @track _options = []

    @api 
    get value(){
        return this._valueId;
    }
    set value(value){
        this._valueId = value;
    }


    handleSearch(event){
        this.searchTerm = event.detail.value;

        getRecords({searchTerm : this.searchTerm, obj : this.sobject})
        .then(result => {
            this._options = result;
        })
        .catch(error => {
            console.log('Error: ', error);
        });
        event.stopPropagation();
        event.preventDefault();
    }

    handleSelect(event){
        if(event.target.dataset.name){
            this._value = event.target.dataset.name;
            this._valueId = event.target.dataset.id;
            console.log('Selected: ', event.target.dataset.name);
            this.searchTerm = '';
            this._options = [];
            this.dispatchEvent(new CustomEvent('change', {
                detail : {
                    value : this._valueId
                }
            }));    
        } else {
            console.log('No value');
        }
        event.stopPropagation();
    }

    @api
    deleteEntry(){
        this._value = ''
        this._valueId = ''
    }
    
    get getIconName(){
        return 'standard:' + this.sobject.toLowerCase()
    }

    removeValue(event){
        this._value = '';
    }

}