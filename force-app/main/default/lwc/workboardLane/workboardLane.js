import { LightningElement, api, track } from 'lwc';

export default class DragAndDropList extends LightningElement {
    @api records
    @api status
    @api colorsettings
    @api sobject
    @api column_length
    @track notTop = false
    @track notBottom = true
    count = 0;

    connectedCallback
    renderedCallback() {
        // console.log('Record Details: ', this.records.length);
        for (let i = 0; i < this.records.length; i++) {
            if (this.records[i].Status__c === this.status){
            }
        }

    }

    // drag source event handler for dispatch event from child component
    handleItemDrag(evt){
        const event = new CustomEvent('listitemdrag', {
            detail: evt.detail
        })
        this.dispatchEvent(event)
    }

    handleLoaded(event){
        
        const evt = new CustomEvent('laneloaded', {
            detail: 'loaded lane'
        })
        this.dispatchEvent(evt)

    }

    handleDragOver(evt){
        evt.preventDefault();
    }

    handleDragLeave(event){
        event.preventDefault();
    }

    handleDrop(evt){
        evt.preventDefault();
        const event = new CustomEvent('itemdrop', {
            detail: this.status
        })
        this.dispatchEvent(event)
    }


    handleChild(evt){
        const event = new CustomEvent ('parent', {
            detail: evt.detail
        });
        this.dispatchEvent(event)        
    }

    scrollUp(evt){
        this.template.querySelector(`[data-id="${this.status}"]`).scrollTop = 0
    }

    scrollBottom(evt){
        this.template.querySelector(`[data-id="${this.status}"]`).scrollTo({
            top: this.template.querySelector(`[data-id="${this.status}"]`).scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    }
    onScroll(){
        let myDiv = this.template.querySelector(`[data-id="${this.status}"]`);
        if(myDiv.scrollTop === 0){
            this.notTop = true;
        }
        else{
            this.notBottom = true;
        }
    }

    get PathStyle(){
        let color = this.colorsettings.pathColor
        return `background: ${color}`
    }

    get getCount(){
        let count = 0;
        for (let i = 0; i < this.records.length; i++) {
            if (this.records[i].Status__c === this.status){
                count++;
            }
        }
        return count;

    }

    addDragOverStyle(){
        // let draggableELement = this.template.querySelector('[data-role="drop-target"]');
        // draggableELement.classList.add('over')
    }

    // get scrollBottom
    
}