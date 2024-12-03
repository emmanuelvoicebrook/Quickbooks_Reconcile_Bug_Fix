import { LightningElement, api, track } from 'lwc';

export default class WorkboardGeneralConfigurationRow extends LightningElement {
    data
    @api disabled

    @api 
    get info(){
        return this.data
    }
    set info(value){
        this.data = {...value};
    }

    connectedCallback(){
        // this.fieldApiName = this.info.apiname
        // this.fieldName = this.info.label
        // console.log('Connected: ', this.fieldApiName);
    }

    apiChange(event){
        // console.log('API Value has changed: ', event.target.value);
        this.data.apiname = event.target.value
    }

    valueChange(event){
        // console.log('Label Value has changed: ', event.target.value);
        this.data.label = event.target.value
    }
    handleDelete(event){
        const evt = new CustomEvent('delete', {
            detail : this.data
        })
        this.dispatchEvent(evt)
    }
}