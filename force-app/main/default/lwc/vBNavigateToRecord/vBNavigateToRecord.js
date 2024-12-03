import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';


export default class VBNavigateToRecord extends LightningElement {
    @api recordId;

    connectedCallback() {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.recordId,
                actionName: 'view'
            }
        });
    }
}