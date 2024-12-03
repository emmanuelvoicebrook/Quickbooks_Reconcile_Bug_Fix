import { LightningElement, api } from 'lwc';

export default class CommunityKnowledgeBaseMenuItem extends LightningElement {
    
    @api item = {};


    handleClick(){
        const buttonclicked = new CustomEvent('select', {
            //event options
            detail : this.item.label
        });
        this.dispatchEvent(buttonclicked);
    }

}