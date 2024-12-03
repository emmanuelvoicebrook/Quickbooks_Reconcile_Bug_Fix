import { LightningElement, track, api, wire } from 'lwc';
import getObjectNames from '@salesforce/apex/VBTabularController.getObjectNames';
import getObjectFields from '@salesforce/apex/VBTabularController.getObjectFields';
import createNewCollector from '@salesforce/apex/VBTabularController.createVBTabularForm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class VBTabularConfigurator extends LightningElement {
    @track collector = {
        collectorName: '',
        objectName: '',
        collectorDescription: '',
        flowHandler: '',
        forFlow: false,
        fields : [
            {
                Id: 1,
                sortOrder: 1,
                fieldLabel: '',
                fieldName: '',
                fieldType: '',
                fieldHelp: '',
                fieldRequired: false,
                SFPicklistData : {},
                customPicklistData : [],
                lookupData : {},
                isLastItem : function() {
                    return this.sortOrder === this.nextSortOrder-1;
                },
            }
        ]
    }
    @track currentId = 2
    @track nextSortOrder = 2
    @track data
    @track error = false;
    @track errorMessages = [];
    @track objectOptions = [];
    @track objectChoices = [];
    @track sortedBy
    // change back to false
    @track newCollectorModal = false;
    @api calledFromAura = false;
    @wire(getObjectNames)
    wiredObjectNames({ error, data }) {
        if (data) {
            data.forEach(element => {
                this.objectOptions.push({label : element, value: element});
            });            
            console.log('this Object Names: ', this.objectOptions );
        } else if (error) {
            this.error = true;
            this.errorMessage = error.body.message;
            console.log('getObjectNames error: ', error);
        }
    }
    
    handleAddField(){
        this.collector.fields.push({
            Id: this.currentId,
            fieldLabel: '',
            fieldName: '',
            fieldType: '',
            fieldHelp: '',
            fieldRequired: false,
            sortOrder: this.nextSortOrder,
        });
        this.currentId++;
        this.nextSortOrder++;

        let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        configuratorRows.forEach(element => {
            element.updateChevron();
        })

    }

    connectedCallback(){
        this.resetValues
        this.errorMessages = []
        console.log('Connected Callback');
        
        if (this.calledFromAura){
            console.log('Called From Aura');
            this.handleAddCollector();
        }
    }

    renderedCallback(){
        console.log('Rendered Callback');
        
    }

    
    reorderFields(event){

        let tempFields =  [ ... this.collector.fields ];
        var newFields = [];
        for(let i = 0; i < tempFields.length; i++){
            let field = { ... tempFields[i] };
            field.sortOrder = i+1;
            newFields.push(field);
        }
        this.collector.fields = newFields;
        let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        let newMap = []

        configuratorRows.forEach(element => {
            let id = element.info.id;
            this.collector.fields.forEach(field => {
                if(field.Id === id){
                    element.updateSortOrder(element.sortOrder);
                }
            });
        });


    }
    handleChange(event){
        const fieldName = event.target.dataset.name;
        const fieldValue = event.target.value;
        this.collector[fieldName] = fieldValue;
    }
    handleObjectNameChange(event){
        const objectName = event.detail.value;
        this.collector.objectName = objectName;
    }

    updateValues(){
        let newMap = []
        let rows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        rows.forEach(row => {
            newMap.push(row.info);
        })
        this.collector.fields = JSON.parse(JSON.stringify(newMap));
        
    }

    @api handleAddCollector(){
        console.log('I have been called')
        this.newCollectorModal = true;
        // dispatch close evant
    }

    @api resetValues(){
        this.errorMessages = []
        this.collector = {
            collectorName: '',
            objectName: '',
            collectorDescription: [],
            flowHandler: '',
            forFlow: false,
            fields : [
                {
                    Id: 1,
                    sortOrder: 1,
                    fieldLabel: '',
                    fieldName: '',
                    fieldType: '',
                    fieldHelp: '',
                    fieldRequired: false,
                    SFPicklistData : {},
                    customPicklistData : [],
                    lookupData : {},
                    isLastItem : function() {
                        return this.sortOrder === this.nextSortOrder-1;
                    },
                }
            ]
        }
    }
    closeModal(event){
        this.newCollectorModal = false;
        const closeEvent = new CustomEvent('closemodal');
        this.dispatchEvent(closeEvent);
    }
    handleSaveCollector(){
        
        let tempError = false;
        this.errorMessages = []
        this.template.querySelectorAll('lightning-input').forEach(element => {
            element.reportValidity();
            console.log('Element: ', element.name, ' : ' , element.reportValidity());
            if(element.reportValidity() === false){
                tempError = true;
                this.errorMessages.push('Ensure you have selected a value for ' + element.label);
            }
        });
        this.template.querySelectorAll('lightning-combobox').forEach(element => {
            element.reportValidity();
            console.log('Element: ', element.name, ' : ' , element.reportValidity());
            if(element.reportValidity() === false){
                tempError = true;
                this.errorMessages.push('Ensure you have selected a value for ' + element.label);
            }
        })

        let rows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        rows.forEach(row => {
            // row.validate();
            if (row.validate()) {
                tempError = true;
                this.errorMessages.push(row.errorMessage);
            } 
        });
        console.log('Temp Error: ', tempError);
        if(tempError === true){
            this.error = true;
        } else{
            this.error = false;
            console.log('Save Collector: ', this.collector.fields);
            this.reorderFields();
            let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
            console.log('Configurator Rows: ', configuratorRows);
            // let newMap = this.fields.map(field => configuratorRows.forEach(row => (row.info.id == field.id) ? row.info : null) || field);
            this.updateValues()
            let jsonMap = {}
            console.log('Collector: ', this.collector);

            jsonMap.Id = this.collector.Id;
            jsonMap.old_fields = JSON.stringify(this.collector.fields);
            jsonMap.TabularFields = this.collector.fields;
            jsonMap.Name = this.collector.collectorName;
            jsonMap.ObjectName = this.collector.objectName;
            jsonMap.collectorDescription = this.collector.collectorDescription;
            jsonMap.FlowHandler = this.collector.flowHandler;

            console.log('Created Object: ', jsonMap);
            jsonMap  = JSON.stringify(jsonMap);
            console.log('JSON MAP: ', jsonMap);
            // create new collector
            createNewCollector({dat : jsonMap})
            .then(result => {
                console.log('Create New Collector Result: ', result);
                this.closeModal();
                //show success toast
                const toastEvent = new ShowToastEvent({
                    title: 'Success',
                    message: 'Collector Created Successfully',
                    variant: 'success',
                });
                this.dispatchEvent(toastEvent);
            })
            .catch(error => {
                console.log('Create New Collector Error: ', error);
            });
            console.log('Data: ', this.collector);
        }
        
    }

    handleSearch(event){
        console.log('Search: ', event.detail.value);
        let searchValue = event.detail.value;
        let options = []
        this.objectOptions.forEach(element => {
            if(element.toLowerCase().includes(searchValue.toLowerCase())){
                options.push({label: element, value: element});
            }
        });
        console.log('Options: ', options);
        this.objectChoices = options;
    }

    handleRemovedField(event){
        console.log('Removed Field: ', event.detail);
        let removedFieldId = event.detail.id;
        let index
        // find the index of the removed field
        for(let i = 0; i < this.collector.fields.length; i++){
            if(this.collector.fields[i].Id == removedFieldId){
                index = i;
                break;
            }
        }
        // update the list of fields
        this.updateValues()
        // remove the field from the collector
        this.collector.fields.splice(index, 1);
        
        console.log('Index: ', index);
        console.log('removedFieldId: ', removedFieldId);
        console.log('Fields: ', this.collector.fields);

        if(this.collector.fields.length == 0){
            this.handleAddField();
        }
        this.nextSortOrder --;
        this.reorderFields();
        let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        configuratorRows.forEach(element => {
            element.updateChevron();
        })
    }
    moveArrayItemToNewIndex(arr, old_index, new_index) {
        try{
            if (new_index >= arr.length) {
                //do nothing
                return arr;

            }
            arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
            return arr; 
        }catch(error){
            console.log('Error: ', error);
            return arr;
        }
    };

    handlePushDown(event){
        console.log('Push Down: ', event.detail.id);
        let pushedFieldId = event.detail.id;
        let index

        this.collector.fields.forEach(field => {
            if(field.Id == pushedFieldId){
                index = this.collector.fields.indexOf(field)
            }
        })

        this.updateValues()
        this.collector.fields = this.moveArrayItemToNewIndex(this.collector.fields, index, index+1);

        this.reorderFields();
        event.stopPropagation();
    }

    handlePushUp(event){
        console.log('Push Up: ', event.detail.id);
        let pushedFieldId = event.detail.id;
        let index
        this.collector.fields.forEach(field => {
            if(field.Id == pushedFieldId){
                index = this.collector.fields.indexOf(field)
            }
        })
        this.updateValues()
        this.collector.fields = this.moveArrayItemToNewIndex(this.collector.fields, index, index-1);
        // let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        // configuratorRows.forEach(element => {
        //     element.updateChevron();
        // })
        this.reorderFields();
        event.stopPropagation();
    }

    get getNoItems(){
        return this.collector.fields.length;
    }


}