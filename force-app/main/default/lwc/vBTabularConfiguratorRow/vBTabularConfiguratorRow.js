import { LightningElement, track, api, wire } from 'lwc';
import getObjectNames from '@salesforce/apex/VBTabularController.getObjectNames';
import getObjectFields from '@salesforce/apex/VBTabularController.getObjectFields';


export default class VBTabularConfiguratorRow extends LightningElement {
    typeOptions = [
        { label: 'Text', value: 'Text' },
        { label: 'Email', value: 'Email' },
        { label: 'Phone', value: 'Tel' },
        { label: 'SF Picklist', value: 'SF Picklist' },
        { label: 'Custom Picklist', value: 'Custom Picklist' },
        { label: 'Date', value: 'Date' },
        { label: 'Lookup', value: 'Lookup' },
    ];
    @track customPicklistId = 1;
    @track IsCustomPicklistVisible = true
    @track IsSFPicklistVisible = true
    @track IsLookupVisible = true
    @api error = false;
    @api errorMessages = [];
    @track objectOptions = []
    @track rowData
    @track salesforceFieldOptions = []
    @track lookupFieldOptions = []

    @track item_still_on_top = false;
    @track noOfItems = 0;
    @track showUpChevron = true
    @track showDownChevron = true

    @api 
    set info(value){
        console.log('setting row data: ', JSON.parse(JSON.stringify(value)));
        let tempObj = {}
        for (var key in value) {
            if(key != 'SFPicklistData' && key != 'customPicklistData' && key != 'lookupData'){
                tempObj[key] = value[key];
            } else if(key == 'SFPicklistData'){
                tempObj[key] = {...value[key]};
            } else if(key == 'customPicklistData'){
                tempObj[key] = [...value[key]];
            } else if(key == 'lookupData'){
                tempObj[key] = {...value[key]};
            }
        }
                
        this.rowData = tempObj;
        console.log('Row Data: ', this.rowData);
    }
    get info(){
        console.log('Row Data: ', this.rowData);
        return this.rowData;
    }
    
    @api 
    set noitems(value){
        this.noOfItems = value;
    }
    get noitems(){
        return this.noOfItems;
    }

    @api validate(){

        console.log('Validate Row');
        this.error = false;
        //check if all the felids are filled
        this.template.querySelectorAll('lightning-input').forEach(element => {
            element.reportValidity();
            console.log('Element: ', element.name, ' : ' , element.reportValidity());
            if(element.reportValidity() === false){
                this.error = true;
                this.errorMessages.push(element.name + ' is required');
            }
        });
        this.template.querySelectorAll('lightning-combobox').forEach(element => {
            element.reportValidity();
            console.log('Element: ', element.name, ' : ' , element.reportValidity());
            if(element.reportValidity() === false){
                this.error = true;
                this.errorMessages.push(element.name + ' is required');
            }
        })

        // check the fieldName values for duplicates
        let fieldNames = [];
        console.log('Row Data: ', this.rowData);

        // if is custom picklist check fro duplicates
        if(this.rowData.fieldType === 'Custom Picklist'){
            console.log('Validating Custom Picklist');
            this.rowData.customPicklistData.forEach(element => {
                console.log('Fields Names: ', fieldNames);
                if(fieldNames.includes(element.value) || element.value === '' || element.fieldName === ''){
                    this.error = true;
                    this.errorMessages.push('Ensure that all picklist values are unique and filled');
                } else {
                    fieldNames.push(element.value);
                }

                
            }
            );
        }

        // if sf picklist check to see if the objectName and fields are empty
        if(this.rowData.fieldType === 'SF Picklist'){
            console.log('Validating SF Picklist');
            if(this.rowData.SFPicklistData.objectName === '' || this.rowData.SFPicklistData.fieldName === ''){
                this.error = true;
                this.errorMessages.push('Please select a value for the object and field');
            }
        }

        // of fieldType is lookup check to see if the objectName and fields are empty
        if(this.rowData.fieldType === 'Lookup'){
            console.log('Validating Lookup');
            if(this.rowData.lookupData.objectName === '' || this.rowData.lookupData.fieldName === ''){
                this.error = true;
                this.errorMessages.push('Please select a value for the object and field');
                
            }
        }
        return this.error;
    }

    @wire(getObjectNames)
    wiredObjectNames({ error, data }) {
        if (data) {
            data.forEach(element => {
                this.objectOptions.push({label : element, value: element});
            });            
        } else if (error) {
            this.error = true;
            this.errorMessage = error.body.message;
            console.log('getObjectNames error: ', error);
        }
    }

    @api updateChevron(noItems){
        if(this.rowData.sortOrder == 1){
            this.showUpChevron = false;
        } else {
            this.showUpChevron = true;
        }

        if(this.rowData.sortOrder == noItems){
            this.showDownChevron = false;
        } else {
            this.showDownChevron = true;
        }
    }

    @api updateSortOrder(sortOrder){
        console.log('Update Sort Order: ', sortOrder);
        this.rowData.sortOrder = sortOrder;
    }

    connectedCallback(){
        console.log('Data passed to row', this.rowData);
        
    }

    renderedCallback(){
        // console.log('Row renderedCallback');
        this.updateChevron(this.noOfItems);
    }

    handleRequired(event){
        console.log('Required: ', event.target.checked);
        this.rowData.fieldRequired = event.target.checked;
        console.log('Row Data: ', this.rowData);
    }
    handleChange(event){
        this.template.querySelector(`[data-name="${event.target.dataset.name}"]`).value = event.target.value;
        this.rowData[event.target.dataset.name] = event.target.value;
        if (event.target.dataset.name === 'fieldType'){

            switch (event.target.value) {
                case 'SF Picklist':
                    this.rowData.customPicklistData = [];
                    this.rowData.lookupData = {};
                    this.rowData.SFPicklistData = {
                        objectName: '',
                        fieldName: ''
                    };
                    break;
                case 'Custom Picklist':
                    this.rowData.SFPicklistData = {}
                    this.rowData.lookupData = {}
                    this.rowData.customPicklistData = [
                        {id: this.customPicklistId, "label": "", "value": ""}
                    ]
                    this.customPicklistId++;
                    break;
                case 'Lookup':
                    this.rowData.SFPicklistData = {}
                    this.rowData.lookupData = {
                        "objectName": "",
                        "fieldName": ""
                    }
                    break;
                default:
                    this.rowData.SFPicklistData = {}
                    this.rowData.lookupData = {}
                    this.rowData.customPicklistData = [];
                    break;
            }
        }

        console.log('Set ', event.target.dataset.name, ' to ', event.target.value);
    }

    handleSFObjectChange(event){
        this.salesforceFieldOptions = [];
        this.rowData.SFPicklistData.fieldName = '';
        this.rowData.SFPicklistData.objectName = event.target.value;
        getObjectFields({objectName: this.rowData.SFPicklistData.objectName, field_type: 'PICKLIST'})
        .then (result => {
            result.forEach(element => {
                //print type of element
                this.salesforceFieldOptions.push({label : (Object.keys(element))[0], value: (Object.values(element))[0]});
            });
        })
        .catch(error => {
            console.log('SF Object Fields error: ', error);
        });


    }

    handleSFFieldChange(event){
        this.rowData.SFPicklistData.fieldName = event.target.value;
    }

    handlePicklistOptionChange(event){
        // let id = event.target.dataset.id;
        // // let label = event.target.value;
        // let newMap = [];
        // let found = false;
        // // check if the id is already in the map, and if so, update the label or value
        // this.rowData.customPicklistData.forEach(item => {
        //     console.log('Item: ', item);
        //     let tempItem = {...item};
        //     if(tempItem.id == id){
        //         tempItem[event.target.name] = event.target.value;
        //         found = true;
        //     }
        //     newMap.push(tempItem)
        // });
        // if(found == false)
        //     newMap.push({id: id, "label": event.target.value, "value": event.target.value});
        // this.rowData.customPicklistData = newMap;
        // // stop event propagation
        // // this.rowData.customPicklistData[event.target.dataset.id][event.target.name] = event.target.value;

        let new_data = [];

        let rows = this.template.querySelectorAll('c-v-b-tabular-custom-picklist');
        rows.forEach(row => {
            console.log('Row: ', row);
            new_data.push(row.value)
        })
        this.rowData.customPicklistData = new_data;
        console.log('New Data: ', this.rowData);

    }
    
    handlePicklistOptionAdd(event){
        console.log('Add Picklist Option: ', event.detail.value);
        let options = [...this.rowData.customPicklistData];
        options.push({id: this.customPicklistId, "label": " ", "value": " "});
        this.customPicklistId++;
        this.rowData.customPicklistData = options;
    }

    handlePicklistOptionRemove(event){
        console.log('Remove Picklist Option: ', event.target.dataset.id);
        // find the index of the item to remove
        let index = this.rowData.customPicklistData.findIndex(item => item.value == event.target.dataset.id);
        this.rowData.customPicklistData.splice(index, 1);
        if(this.rowData.customPicklistData.length === 0){
            this.rowData.customPicklistData = [{id: this.customPicklistId, "label": " ", "value": " "}];
            this.customPicklistId++;
        }
    }

    handleLookUpObjChange(event){
        console.log('Lookup Object: ', event.target.value);
        this.lookupFieldOptions = [];
        this.rowData.lookupData.fieldName = '';
        this.rowData.lookupData.objectName = event.target.value;
        getObjectFields({objectName: this.rowData.lookupData.objectName, field_type: 'STRING'})
        .then (result => {
            console.log('Lookup Object Fields: ', result);
            result.forEach(element => {
                this.lookupFieldOptions.push({label : (Object.keys(element))[0], value: (Object.values(element))[0]});
                
            });
            console.log('this Lookup Object Fields: ', this.lookupFieldOptions );
        })
        .catch(error => {
            console.log('Lookup Object Fields error: ', error);
        });
        event.stopPropagation();
    }

    handleLookUpFieldChange(event){
        console.log('Lookup Field: ', event.target.value);
        this.rowData.lookupData.fieldName = event.target.value;
    }

    handleToggle(event){
        let info = event.currentTarget.dataset.info;
        console.log('Dataset info: ', event.target.dataset.info)
        if(info === 'lookup'){
            this.IsLookupVisible = !this.IsLookupVisible;
        } else if( info === 'custom-picklist'){
            this.IsCustomPicklistVisible = !this.IsCustomPicklistVisible;
        } else if( info === 'sf-picklist'){
            this.IsSFPicklistVisible = !this.IsSFPicklistVisible;
        }
    }

    handleRemoveField(event){
        console.log('Remove Field: ', this.rowData.Id);
        //fiere event
        this.dispatchEvent(
            new CustomEvent('removefield', {
                detail: {
                    id: this.rowData.Id
                }
            })
        );
    }

    // handle the up and down arrow keys to move the fields up and down
    handleDownChevron(event){
        console.log("Push down: ", this.rowData.Id);
        //fire event
        this.dispatchEvent(
            new CustomEvent('pushdown', {
                detail: {
                    id: this.rowData.Id
                }
            })
        );

        event.stopPropagation();
    }

    handleUpChevron(event){
        console.log("Push up: (row)", this.rowData.Id);
        //fire event
        this.dispatchEvent(
            new CustomEvent('pushup', {
                detail: {
                    id: this.rowData.Id
                }
            })
        );
        console.log('After Push up: (row)', this.rowData);
        event.stopPropagation();
    }

    get IsCustomPicklist(){
        if (this.rowData.fieldType === 'Custom Picklist'){
            return true;
        }
        return false;

    }
    get IsSFPicklist(){
        if (this.rowData.fieldType === 'SF Picklist'){
            return true;
        }
        return false;

    }
    get IsLookup(){
        if (this.rowData.fieldType === 'Lookup'){
            return true;
        }
        return false;

    }

    get IsRequired(){
        if(this.rowData.fieldRequired === true){
            return true;
        }
        return false;
    }

    get getPicklistData(){
        let picklistData = JSON.parse(JSON.stringify(this.rowData.customPicklistData))
        return picklistData;
    }

}