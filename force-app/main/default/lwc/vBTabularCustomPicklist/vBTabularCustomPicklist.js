import { LightningElement, api, track } from 'lwc';

export default class VBTabularCustomPicklist extends LightningElement {

    @track data

    @api
    get value() {
        return this.data;
    }
    
    set value(value) {
        this.data = {...value};
    }

    @api validate(){
        let rows = this.template.querySelectorAll('lightning-input');
        rows.forEach(row => {
            if(row.reportValidity()){
                return true;
            }
        });
    }


    handleChange(event) {
        event.preventDefault();
        let property = event.target.dataset.name;
        this.data[property] = event.target.value;
        this.fireUpdateEvent()
        event.stopPropagation();
    }

    handleLabelChange(event) {
        this.data.label = event.detail.value;
        this.fireUpdateEvent()
    }

    fireUpdateEvent() {
        const updateEvent = new CustomEvent('update', {
            detail: this.data
        });
        this.dispatchEvent(updateEvent);
    }

    handlePicklistOptionRemove(){
        // dispatch event with Id 
        const event = new CustomEvent('remove', {
            detail: {
                value: this.data.value
            }
        });
        this.dispatchEvent(event);
    }
}