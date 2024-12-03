import { LightningElement, api, track } from 'lwc';

export default class WorkboardColorConfigurationRow extends LightningElement {
    @track _info = {};

    @api 
    get info(){
        return  this._info;
    }

    set info(value){
        this._info = {...value};
    }

    @api disabled 

    colorChange(event){
        this.info.color = event.detail.value;
        const evt = new CustomEvent('colorchange', {
            detail: this.info
        });
        this.dispatchEvent(evt);
    }

    connectedCallback(){
        console.log('Color row connected: ', this.info);
    }
    handleDelete(event){
        const evt = new CustomEvent('delete', {
            detail : this.info
        })
        this.dispatchEvent(evt)
    }

}