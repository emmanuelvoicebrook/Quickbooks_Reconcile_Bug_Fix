import { LightningElement, api, track } from 'lwc';

export default class VbAccordion extends LightningElement {
    @api open;
    @api keyText;
    @api hiddenText;
    
    activeSections = [];
    activeSectionsMessage = '';

    connectedCallback(){
        
    }
    renderedCallback(){
        if(this.open){
            // this.activeSections.push('main')
            let currentsection = this.template.querySelector('[data-id="opener"]');
            currentsection.className = 'slds-section slds-is-open';
        }
    }

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

        if (openSections.length === 0) {
            this.activeSectionsMessage = 'All sections are closed';
        } else {
            this.activeSectionsMessage =
                'Open sections: ' + openSections.join(', ');
        }
    }

    toggleSection(event) {
        console.log('toggleSection');
        let buttonid = event.currentTarget.dataset.buttonid;
        let currentsection = this.template.querySelector('[data-id="' + buttonid + '"]');
        if (currentsection.className.search('slds-is-open') == -1) {
            currentsection.className = 'slds-section slds-is-open';
        } else {
            currentsection.className = 'slds-section slds-is-close';
        }
    }
}