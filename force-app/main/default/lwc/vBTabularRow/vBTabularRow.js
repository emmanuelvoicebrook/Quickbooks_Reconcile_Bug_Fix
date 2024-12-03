import { LightningElement,api, track, wire } from 'lwc';
import { getPicklistValues, getPicklistValuesByRecordType  } from 'lightning/uiObjectInfoApi';


export default class VBTabularRow extends LightningElement {
    @track _info;
    @api fields
    @api label
    @api noitems
    @track _info;
    @track _picklistValues= []
    @track _picklistObject
    @track _picklistRecordType
    @track _picklistFieldLabel


    @api
    get info() {
        return this._info;
    }
    set info(value) {
        this._info = {...value};
    }

    connectedCallback() {
    }

    get noFields(){
        if(this._info.fieldData.length === 0)
            return true
        return false
    }
    get getVariantDetails() {
        console.log('Variant Details: ', this._info);
        if(this.info.id == 1 || this.noitems == 1){
            return
        }
        return `label-hidden`
    }

    get getStyle(){
        if(this.info.id == 1){
            return `margin-top: 1.7em`
        }
    }


    //dynamically set the height of the row by checking the id
    get getHeight(){
        //set height value to 7 if it is the firt row or the number of rows is just one
        if(this.info.id == 1 || this.noitems == 1){
            return `min-height: 7em;`
        }
        // set height value to 5 if it is the subsequent rows
        return `min-height: 5em;`
    }
    get getValue(){
        // console.log('Event: ', event.target.dataset.name);
        // console.log('Value: ', event.target.value);
        // this._info[event.target.dataset.name] = event.target.value;
    }

    get isSFPicklist(){
        return this._info.isInput__c
    }

    get isCustomPicklist(){
        return this._info.isCustomPicklist__c
    }
    get isTypeInput(){
        return this._info.isInput__c
    }
    get isTypeLookup(){
        if(this.fields.fieldType == 'LookUp'){
            return true
        }
        return false
    }
    updateData(event){
        // this._info.fieldData[event.target.dataset.name] = event.detail.value;        
        // this._info.fieldData.find(element => (element.fieldname == event.target.dataset.name) ? element.value = event.detail.value : ;)
        // if( event.target !== this.template ) {
        //     return;
        // }
        
        this._info.fieldData.forEach(element => {
            if(element.Name === event.target.dataset.name){
                let tempObj = {...element};
                tempObj.value = event.detail.value;
                let tempArr = [...this._info.fieldData];
                tempArr.splice(this._info.fieldData.indexOf(element), 1, tempObj);
                this._info.fieldData = tempArr;
            }
        });
        // stop propagation to prevent the event from bubbling up to the parent
        return
    }

    // fucntion that deletes the row 
    deleteEntry(){

        let lookupFields = this.template.querySelectorAll('c-v-b-tabular-salesforce-lookup');

        lookupFields.forEach(element => {
            element.deleteEntry();
        });
        // if(this.info.id == 1){
        //     console.log('Fields: ', this._info.fieldData);
        //     for(let i =0; i < this._info.fieldData.length; i++){
        //         let tempObj = {...this._info.fieldData[i]};
        //         tempObj.value = '';
        //         let tempArr = [...this._info.fieldData];
        //         tempArr.splice(i, 1, tempObj);
        //         this._info.fieldData = tempArr;
        //     }
        //     console.log('Fields: ', this._info.fieldData);
            
        // }
        console.log('Deleting: ', this.info.id);
        const deleteEvent = new CustomEvent('deleteentry', {
            detail: this._info
        });
        this.dispatchEvent(deleteEvent);
    }
}