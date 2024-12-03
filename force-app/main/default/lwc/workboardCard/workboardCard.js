import { LightningElement, api, track, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getFieldsToDisplay from '@salesforce/apex/WorkboardController.getDisplayFields'
// import getAssignedPhoto from '@salesforce/apex/WorkboardController.getSmallPhoto'
import QueueImage from '@salesforce/resourceUrl/IT_WorkboardQueue_Logo';
import ClockImage from '@salesforce/resourceUrl/whiteClock';
import canDragCard from '@salesforce/customPermission/Workboard_Can_Drag_Card';
import { publish } from 'lightning/messageService';


export default class DragAndDropCard extends NavigationMixin(LightningElement) {
    @api status
    @api record
    @api colorsettings 
    @api sobject
    @api superUser
    @track assignedPhoto
    @track displayFields 
    @track curApiName = 'Status__c'
    @track clockImage = ClockImage
    @track themeSettings
    @track assignedToName


    @wire(getFieldsToDisplay)
        handleFields({data, error}){
            if(data){
                this.displayFields = JSON.parse(data)
                this.displayFields.forEach(element => {
                    element.value=this.record[element.apiname]
                });
            }
            else if(error){
                console.log('Error while getting fields to display', error)
            }
        }



    renderedCallback(){
        const evt = new CustomEvent('loaded', {
            detail: 'loaded card'
        })

        this.dispatchEvent(evt);

        let dataFields = this.template.querySelectorAll(".card-details");
        
        
    }

    get getCanDragProperty(){
        return canDragCard
        
    }

    get isSameStatus(){
        return this.status === this.record.Status__c
    }
    navigateRecordHandler(event){
        event.stopImmediatePropagation()
        event.preventDefault()
        this.navigateHandler(event.target.dataset.id, this.sobject)
    }
    navigateAccHandler(event){
        event.preventDefault()
        this.navigateHandler(event.target.dataset.id, this.sobject)
    }
    navigateHandler(Id, apiName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: Id,
                objectApiName: apiName,
                actionName: 'view',
            },
        })

        publish
    }
    
    itemDragStart(){
        let draggableELement = this.template.querySelector('[data-id="' + this.record.Id + '"]');
        draggableELement.classList.add('moving-card');
        const event = new CustomEvent('itemdrag', {
            detail: this.record.Id
        });
        this.dispatchEvent(event)
    }

    removeDragStyle(){
        let draggableELement = this.template.querySelector('[data-id="' + this.record.Id + '"]');
        draggableELement.classList.remove('moving-card');
    }

    senddata(){
        const event = new CustomEvent ('child', {
            detail: this.record.Id
        });
        this.dispatchEvent(event)
    }

    getClass(event){
        let element = this.template.querySelector('.Card');
        let classname = this.RecordType.Name;
        element.classList.add(classname)
    }
    get getAssignedPhoto() {
        if(this.record.Assigned_To__c){
            if(this.record.Assigned_To__r.SmallPhotoUrl){
                return this.record.Assigned_To__r.SmallPhotoUrl;
            } else{
                return QueueImage;
            }
        } else {
            return QueueImage;
        }

    }
    get AssignedDetails(){
        if(this.record.Assigned_To__c){
            let label = 'Assigned:'
            let name = this.record.Assigned_To__r.Name;
            let final = label.concat(' ', name)
            return final
        } else {
            return 'Assigned: undefined'
        }

    }

    get getRequestedForPhoto(){
        
        if(this.record.Requested_For__c){
            if(this.record.Requested_For__r.SmallPhotoUrl){
                return this.record.Requested_For__r.SmallPhotoUrl
            } else {
                return QueueImage
            }
        } else {
            return QueueImage
        }
    }
    
    get RequestedForDetails(){
        let label = 'Requested For:'
        var name;
        if(this.record.Requested_For__c){
            name = this.record.Requested_For__r.Name
        } else{
            name = "Undefined"
        }
        
        let final = label.concat(' ', name)
        return final

    }
    get getTypeOfCase(){
        return this.record.RecordType.Name
    }

    get getCardColor(){         
        let recordTypeSettings = ''
        let mapProperty = this.record.RecordType.Name;
        mapProperty = mapProperty.replace(/ /g, "_")
        if( this.colorsettings.recordTypeColors){
            this.colorsettings.recordTypeColors.forEach(obj => {
                if(obj.RecordType == mapProperty)
                    recordTypeSettings = obj.color
            })
        }
        return `background: ${recordTypeSettings}`;
    }
}