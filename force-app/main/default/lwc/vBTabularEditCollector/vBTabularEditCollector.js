import { LightningElement, track, api, wire } from 'lwc';
import getObjectNames from '@salesforce/apex/VBTabularController.getObjectNames';
import getObjectFields from '@salesforce/apex/VBTabularController.getObjectFields';
import updateCollector from '@salesforce/apex/VBTabularController.updateVBTabularForm';
import getCollector from '@salesforce/apex/VBTabularController.getVBTabularForm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class VBTabularConfigurator extends LightningElement {
    @api recordId = '';
    @api collectorid;
    @track collector = {
        Id: '',
        collectorName: '',
        ObjectName: '',
        CollectorDescription: '',
        FlowHandler: '',
        forFlow: false,
        TabularFields : [
            {
                Id: '',
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
    @track modalVisible = false

    @api openModal(recordId){
        this.recordId = recordId;
        this.modalVisible = true;
        console.log('Open Modal: ', recordId);
        getCollector({str_id : recordId})
        .then(result => {
            console.log('Collector: ', result);
            this.collector = {...result};
            console.log('Collector: ', this.collector);

            
            this.collector.TabularFields.forEach(element => {
                this.nextSortOrder = element.sortOrder + 1;
            });
            this.reorderFields();
        })
    }

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

    @api resetValues(){
        this.collector = {
            Id: '',
            collectorName: '',
            ObjectName: '',
            CollectorDescription: [],
            FlowHandler: '',
            forFlow: false,
            TabularFields : [
                {
                    Id: '',
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

    connectedCallback(){
        getCollector({str_id : this.recordId})
        .then(result => {
            console.log('Collector: ', result);
            this.collector = {...result};
            console.log('Collector: ', this.collector);

            
            this.collector.TabularFields.forEach(element => {
                this.nextSortOrder = element.sortOrder + 1;
            });
            this.reorderFields();
        })
    }
    
    handleAddField(){
        console.log('Add Field: ');
        console.log('Collector Before: ', this.collector);
        this.collector.TabularFields.push({
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
        console.log('Collector After: ', this.collector);
    }

    reorderFields(event){
        let tempFields = [...this.collector.TabularFields];
        var newFields = [];
        for(let i = 0; i < tempFields.length; i++){
            let fields = {...tempFields[i]};
            fields.sortOrder = i + 1;
            newFields.push(fields);
        }
        this.collector.TabularFields = newFields;

        var rows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        console.log('Rows: ', rows);
        rows.forEach(row => {
            let rowId = row.info.Id;
            this.collector.TabularFields.forEach(field => {
                if(field.Id == rowId){
                    row.updateSortOrder(row.sortOrder);
                }
            });
        });


    }

    handleChange(event){
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        this.collector[fieldName] = fieldValue;
    }

    handleObjectNameChange(event){
        const objectName = event.detail.value;
        this.collector.ObjectName = objectName;
    }

    closeModal(event){
        this.modalVisible = false;
        const closeEvent = new CustomEvent('closemodal');
        // reset values
        this.resetValues();
        this.dispatchEvent(closeEvent);
    }
    handleSaveCollector(){

        let tempError = false;
        this.errorMessages = []
        // validate the top fields
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

        // rowName = [];
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
            console.log('Errors',this.errorMessages);

            this.error = true;
        } else{
            this.error = false;
            console.log('Save Collector: ', this.collector.TabularFields);
            let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
            console.log('Configurator Rows: ', configuratorRows);
            // let newMap = this.fields.map(field => configuratorRows.forEach(row => (row.info.id == field.id) ? row.info : null) || field);
            let newMap = []

            configuratorRows.forEach(row => {
                newMap.push(row.info);
            })
            this.collector.TabularFields = JSON.parse(JSON.stringify(newMap));
            let jsonMap = {}

            jsonMap.old_fields = JSON.stringify(this.collector.TabularFields);
            jsonMap.TabularFields = this.collector.TabularFields;
            jsonMap.Id = this.collector.id;
            jsonMap.Name = this.collector.Name;
            jsonMap.ObjectName = this.collector.ObjectName;
            jsonMap.collectorDescription = this.collector.collectorDescription;
            jsonMap.FlowHandler = this.collector.FlowHandler;
            

            console.log('Updated Object: ', jsonMap);
            jsonMap  = JSON.stringify(jsonMap);
            console.log('JSON MAP: ', jsonMap);
            // create new collector
            updateCollector({dat : jsonMap})
            .then(result => {
                // close modal
                this.closeModal();
                console.log('Update Collector Result: ', result);
                // show success toast message
                const event = new ShowToastEvent({
                    title: 'Success',
                    message: 'Update Successful',
                    variant: 'success',
                });
                this.dispatchEvent(event);

            })
            .catch(error => {
                console.log('Update Collector Error: ', error);
            });
            console.log('Data: ', this.collector);
        }
        
    }

    handleSearch(event){
        console.log('Search: ', event.detail.value);
        let searchValue = event.detail.value;
        let options = []
        if(this.objectOptions.length > 0){
            this.objectOptions.forEach(element => {
                if(element.toLowerCase().includes(searchValue.toLowerCase())){
                    options.push({label: element, value: element});
                }
            });
        } else {
            options.push({label: 'Loading...', value: ''});
        }
        console.log('Options: ', options);
        this.objectChoices = options;
    }

    handleRemovedField(event){
        console.log('Removed Field: ', event.detail);
        let removedFieldId = event.detail.id;
        let index
        for(let i = 0; i < this.collector.TabularFields.length; i++){
            if(this.collector.TabularFields[i].Id == removedFieldId){
                index = i;
                break;
            }
        }
        // update the list of fields
        let newMap = []
        let rows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        rows.forEach(row => {
            newMap.push(row.info);
        })
        this.collector.TabularFields = JSON.parse(JSON.stringify(newMap));
        this.collector.TabularFields.splice(index, 1);
        
        console.log('Index: ', index);
        console.log('removedFieldId: ', removedFieldId);
        console.log('Fields: ', this.collector.TabularFields);

        if(this.collector.TabularFields.length === 0){
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
        this.collector.TabularFields.forEach(field => {
            if(field.Id == pushedFieldId){
                index = this.collector.TabularFields.indexOf(field)
            }
        })

        this.collector.TabularFields = this.moveArrayItemToNewIndex(this.collector.TabularFields, index, index+1);
        
        this.reorderFields();
        event.stopPropagation();
    }

    handlePushUp(event){
        console.log('Push Up: ', event.detail.id);
        let pushedFieldId = event.detail.id;
        let index
        this.collector.TabularFields.forEach(field => {
            if(field.Id == pushedFieldId){
                index = this.collector.TabularFields.indexOf(field)
            }
        })
        
        this.collector.TabularFields = this.moveArrayItemToNewIndex(this.collector.TabularFields, index, index-1);
        this.reorderFields();
        event.stopPropagation();
    }

    get getNoItems(){
        return this.collector.TabularFields.length;
    }

    get getFields(){
        return this.collector.TabularFields;
    }

}