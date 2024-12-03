import { LightningElement, api, track, wire } from 'lwc';
import { getPicklistValues, getPicklistValuesByRecordType  } from 'lightning/uiObjectInfoApi';


export default class VBTabularSalesforcePicklist extends LightningElement {

    @api sobject;
    @api fieldsource;
    @api recordTypeId = "012000000000000AAA";
    @api required
    @api fieldLabel;
    @api options;
    @api label;
    @api variant;
    @track _value
    

    
    @api 
    get value(){
        return this._value;
    }
    set value(value){
        this._value = value;
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: '$sobject', recordTypeId: '$recordTypeId'})
    picklistValues({data, error}){
        if (data){
            console.log(data);
            this.options = data.picklistFieldValues[this.fieldsource].values
            console.log('Current options',this.options);
        }
        else if(error){
            console.log('Error Retrieving Fields', error)
        }
    }

    connectedCallback(){
        console.log('Salesforce Picklist is connected')
        console.log('sobject', this.sobject);
        console.log('Fields Source', this.fieldsource)
    }   

    handleChange(event){
        console.log('SF Picklist Event: ', event.detail.value);
        this.value = event.detail.value;
        const evt = new CustomEvent('sfpicklistchange', {
            detail: {
                value: this.value
            }
        });
        this.dispatchEvent(evt);
    }

}