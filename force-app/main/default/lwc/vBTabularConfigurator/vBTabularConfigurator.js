import { LightningElement, track, api, wire } from 'lwc';
import getObjectNames from '@salesforce/apex/VBTabularController.getObjectNames';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import getAllVBTabularFormData from '@salesforce/apex/VBTabularController.getAllVBTabularFormData';
import deleteForm from '@salesforce/apex/VBTabularController.deleteForm';
import createNewCollector from '@salesforce/apex/VBTabularController.createVBTabularForm';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


const columns = [
    {label: 'Form Name', fieldName: 'Name', type:'text', sortable: true},
    {label: 'Object Name', fieldName: 'Object_Name__c', type: 'text', sortable: true},
    {label: 'Flow Handler', fieldName: 'Flow_Handler__c', type: 'text', sortable: true},
    {type: 'button',initialWidth:100, typeAttributes: {label: 'Preview', name: 'preview', title: 'Preview'}},
    {label: '', type: 'action', typeAttributes: { rowActions: [{label: 'Edit', name: 'edit'}, {label: 'Delete', name: 'delete'}]}}
];

export default class VBTabularConfigurator extends LightningElement {
    @track collector = {
        collectorName: '',
        objectName: '',
        collectorDescription: [],
        flowHandler: '',
        fields : [
            {
                Id: '1',
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
    @track nextSortOrder = 2
    @track data
    @track error = false;
    @track errorMessage;
    @track objectOptions = [];
    @track objectChoices = [];
    @track tableError = false;
    @track tableErrorMessage;
    columns = columns;
    @track defaultSortDirection = 'asc';
    @track sortDirection = 'asc';
    @track sortedBy
    @track newCollectorModal = false;
    @track showTemplate = false;
    @track previewTemplateName = '';
    @track isInitialized = false;
    pushTopicName = 'TabularUpdates';

    sortBy(field, reverse, primer) {
        const key = primer
            ? function (x) {
                  return primer(x[field]);
              }
            : function (x) {
                  return x[field];
              };

        return function (a, b) {
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
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
    handleSort(event) {
        const { fieldName: sortedBy, sortDirection } = event.detail;
        const cloneData = [...this.data];

        cloneData.sort(this.sortBy(sortedBy, sortDirection === 'asc' ? 1 : -1));
        this.data = cloneData;
        this.sortDirection = sortDirection;
        this.sortedBy = sortedBy;
    }

    handleRowAction(event){
        const action = event.detail.action
        const row = event.detail.row
        switch(action.name){
            case 'edit':
                console.log('Editing Row Id: ', row.Id);
                var editModal = this.template.querySelector('c-v-b-tabular-edit-collector');
                editModal.openModal(row.Id);
                break;
            case 'delete':
                console.log('Delete: ', row.Id);
                // alert for confirmation
                let confirmation = confirm('Are you sure you want to delete this collector?');
                if(confirmation){
                    deleteForm({str_id:row.Id})
                    .then(result => {
                        console.log('Delete Result: ', result);
                        const event = new ShowToastEvent({
                            title: 'Success',
                            message: 'Delete Successfull.',
                            variant : 'success'
                        });
                        this.dispatchEvent(event);
                        this.getData();
                    })
                }
                break;
            case 'preview':
                console.log('Preview: ', row.Name);
                // this.showTemplate = true;
                var template = this.template.querySelector('.preview');
                var previewModal = this.template.querySelector('c-v-b-tabular-collector');
                template.classList.remove("hide");
                previewModal.handleLoad(row.Name);
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
        this.getData()
        if (!this.isInitialized) {
            this.isInitialized = true;
            try {
                const messageCallback = (response) => {
                    console.log('New message received: ', JSON.parse(JSON.stringify(response)));
                    if (response != undefined && response != null) {
                        this.getData();
                        if(response.data.event.type == 'delete'){
                            // remeove the deleted row from the table
                            this.data = this.data.filter(row => row.Id != response.data.sobject.Id);
                        }
                    } else {
                        this.processError = true;
                    }
                };

                const topicName = "/topic/" + this.pushTopicName;
                // Invoke subscribe method of empApi. Pass reference to messageCallback
                subscribe(topicName, -1, messageCallback).then(response => {
                    // Response contains the subscription information on subscribe call
                    console.log('Subscription request sent to: ', JSON.stringify(response.channel));
                });
                //subscribe(topicName, -1, messageCallback);
                this.registerErrorListener();
            } catch (err) {
                console.log("error inside connectedcallback =>" + err.message + err.stack);
            }
        }
    }
    

    registerErrorListener() {
        // Invoke onError empApi method
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
            this.processError = true;
        });
    }

    getData(){
        getAllVBTabularFormData()
        .then(result => {
            this.data = result;
            console.log('Data: ', this.data);
        })
        .catch(error => {
            console.log('Error: ', error);
            this.tableErrorMessage = error;
        });
    }

    reorderFields(event){
        let tempFields = [...this.collector.fields];
        for(let i = 0; i < tempFields.length; i++){
            tempFields[i].sortOrder = i + 1;
        }
        this.collector.fields = tempFields;
    }
    handleChange(event){
        const fieldName = event.target.name;
        const fieldValue = event.target.value;
        this.collector[fieldName] = fieldValue;
    }
    handleObjectNameChange(event){
        const objectName = event.detail.value;
        this.collector.objectName = objectName;
    }

    handleAddCollector(event){
        this.newCollectorModal = true;
        let modal = this.template.querySelector('c-v-b-tabular-new-collector');
        modal.handleAddCollector();
    }

    closeModal(event){
        this.newCollectorModal = false;
    }
    handleSaveCollector(){
        //uncomment this to check for errors 

        let rows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        let tempError = false;
        this.template.querySelectorAll('lightning-input').forEach(element => {
            element.reportValidity();
            console.log('Element: ', element.name, ' : ' , element.reportValidity());
            if(element.reportValidity() === false){
                tempError = true;
            }
        });
        this.template.querySelectorAll('lightning-combobox').forEach(element => {
            element.reportValidity();
            console.log('Element: ', element.name, ' : ' , element.reportValidity());
            if(element.reportValidity() === false){
                tempError = true;
            }
        })

        rows.forEach(row => {
            row.validate();
            if (row.error) {
                tempError = true;
                this.errorMessage = row.errorMessage;
            } 
        });
        console.log('Temp Error: ', tempError);
        if(tempError === true){
            this.error = true;
        } else{
            this.error = false;
        }
        console.log('Save Collector: ', this.collector.fields);
        let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        console.log('Configurator Rows: ', configuratorRows);
        // let newMap = this.fields.map(field => configuratorRows.forEach(row => (row.info.id == field.id) ? row.info : null) || field);
        let newMap = []

        this.collector.fields.forEach(field => {
            configuratorRows.forEach(row => {
                if(row.info.Id == field.Id){
                    newMap.push(row.info);
                }
            })
        });
        this.collector.fields = JSON.parse(JSON.stringify(newMap));
        let jsonMap = {}

        jsonMap.fields = JSON.stringify(this.collector.fields);
        jsonMap.collectorName = this.collector.collectorName;
        jsonMap.objectName = this.collector.objectName;
        jsonMap.collectorDescription = this.collector.collectorDescription;
        jsonMap.flowHandler = this.collector.flowHandler;

        console.log('Created Object: ', jsonMap);
        jsonMap  = JSON.stringify(jsonMap);
        console.log('JSON MAP: ', jsonMap);
        // create new collector
        createNewCollector({dat : jsonMap})
        .then(result => {
            console.log('Create New Collector Result: ', result);
        })
        .catch(error => {
            console.log('Create New Collector Error: ', error);
        });
        console.log('Data: ', this.collector);
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
        for(let i = 0; i < this.collector.fields.length; i++){
            if(this.collector.fields[i].Id == removedFieldId){
                index = i;
                break;
            }
        }
        this.collector.fields.splice(index, 1);
        
        console.log('Index: ', index);
        console.log('removedFieldId: ', removedFieldId);
        console.log('Fields: ', this.collector.fields);

        if(this.collector.fields.length === 0){
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
        // for(let i = 0; i < this.collector.fields.length; i++){
        //     if(this.collector.fields[i].id == pushedFieldId){
        //         // index = i+1;
        //         index = i;
        //         break;
        //     }
        // }
        this.collector.fields.forEach(field => {
            if(field.Id == pushedFieldId){
                index = this.collector.fields.indexOf(field)
            }
        })


        this.collector.fields = this.moveArrayItemToNewIndex(this.collector.fields, index, index+1);
        let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        configuratorRows.forEach(element => {
            element.updateChevron();
        })
        event.stopPropagation();
    }

    handlePushUp(event){
        console.log('Push Up: ', event.detail.id);
        let pushedFieldId = event.detail.id;
        let index
        // for(let i = 0; i < this.collector.fields.length; i++){
        //     if(this.collector.fields[i].id == pushedFieldId){
        //         index = i;
        //         break;
        //     }
        // }
        this.collector.fields.forEach(field => {
            if(field.Id == pushedFieldId){
                index = this.collector.fields.indexOf(field)
            }
        })
        
        this.collector.fields = this.moveArrayItemToNewIndex(this.collector.fields, index, index-1);
        let configuratorRows = this.template.querySelectorAll('c-v-b-tabular-configurator-row');
        configuratorRows.forEach(element => {
            element.updateChevron();
        })
        event.stopPropagation();
    }

    get getNoItems(){
        return this.collector.fields.length;
    }


}