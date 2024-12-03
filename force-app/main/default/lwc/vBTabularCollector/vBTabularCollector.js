import { LightningElement, api, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import createVBTabularDataRecord from '@salesforce/apex/VBTabularController.createVBTabularDataRecord';
import getVBTabularFormData from '@salesforce/apex/VBTabularController.getVBTabularFormData';
import getVBTabularFormById from '@salesforce/apex/VBTabularController.getVBTabularForm';
import VB_TABULAR_OBJECT from '@salesforce/schema/VB_Tabular_Data__c';
import STATUS_FIELD  from '@salesforce/schema/VB_Tabular_Data__c.Status__c';
import OBJECT_FIELD_NAME from '@salesforce/schema/VB_Tabular_Data__c.Object_API_Name__c';
import SOURCE_FORM from '@salesforce/schema/VB_Tabular_Data__c.Source_Form__c';
import DATA_FIELD from '@salesforce/schema/VB_Tabular_Data__c.Data__c';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class VBTabularCollector extends LightningElement {
    
    @api formName = 'Account Colector'
    @api recordId;
    @api defaultValues;
    @track fieldData = []
    @track collectedData = []
    @track numberOfRows = 0;
    @track formLabel;
    @track error
    @track objectName;
    @track flowHandler
    @api isPreview = false;
    @track formId


    @track labels = [];

    // @api 
    // get formname(){
    //     return this.formName;
    // }
    // set setData(data){
    //     console.log('Setting Data: ', data);
    //     this.formName = data;
    // }

    @api handleLoad(name){

        this.formName = name;
        console.log('Form Name: ', name);
        this.isPreview = true;
        this.fieldData = [];
        this.collectedData = [];
        this.numberOfRows = 0;
        this.formLabel = '';
        this.error = '';
        this.objectName = '';
        this.flowHandler = '';
        this.labels = [];
        getVBTabularFormData({name: this.formName})
        .then(result => {
            console.log('Data: ', JSON.parse(JSON.stringify(result)));
            //store the information about the fields
            this.fieldData = result.Fields;
            this.formLabel = result.Name;
            this.formId = result.id;
            this.numberOfRows++
            let tempFieldData = []
            this.flowHandler = result.FlowHandler;
            this.objectName = result.ObjectName;
            console.log('Fields: ', JSON.parse(JSON.stringify(this.fieldData)));
            this.fieldData.forEach(element => {
                tempFieldData.push({...element})
            });

            tempFieldData.forEach(element => {
                element.value = ""
                if(element.isSFPicklist__c){
                    // console.log('Wanted Format: ', JSON.parse(element.SF_Picklist_Data__c))
                    element.SF_Picklist_Data__c = JSON.parse(element.SF_Picklist_Data__c);
                }
                else if(element.isCustomPicklist__c){
                    console.log('Wanted Format: ', JSON.parse(element.Custom_Picklist_Data__c))
                    
                    element.Custom_Picklist_Data__c = JSON.parse(element.Custom_Picklist_Data__c);
                }
                else if(element.isLookup__c){
                    console.log('Wanted Format: ', JSON.parse(element.Lookup_Data__c))
                    element.Lookup_Data__c = JSON.parse(element.Lookup_Data__c);
                }
            });

            var tempObj = {
                id: this.numberOfRows,
                fieldData: tempFieldData
            }
            console.log('Temp Obj: ', tempObj);
            this.collectedData.push(tempObj)
            
            this.fieldData.forEach(element => {
                this.labels.push({
                    text : element.label,
                    required : element.required,
                })
            })
            console.log('Collected Data: ', this.collectedData);
            console.log('Labels: ', this.labels);
            console.log('Test Data: ', this.fieldData);
        })
        .catch(error => {
            console.log('Error: ', error);
            this.error = error;
        });
    }


    connectedCallback(){
        console.log('Connected Callback');
        if(this.recordId){
            getVBTabularFormById({str_id: this.recordId})
            .then(result => {
                console.log('Data: ', JSON.parse(JSON.stringify(result)));
            //store the information about the fields
            this.fieldData = result.Fields ;
            this.formLabel = result.Name;
            this.numberOfRows++
            let tempFieldData = []
            this.flowHandler = result.FlowHandler;
            this.objectName = result.ObjectName;
            this.formId = result.id;
            console.log('Fields: ', JSON.parse(JSON.stringify(this.fieldData)));
            this.fieldData.forEach(element => {
                tempFieldData.push({...element})
            });

            tempFieldData.forEach(element => {
                element.value = ""
                if(element.isSFPicklist__c){
                    // console.log('Wanted Format: ', JSON.parse(element.SF_Picklist_Data__c))
                    element.SF_Picklist_Data__c = JSON.parse(element.SF_Picklist_Data__c);
                }
                else if(element.isCustomPicklist__c){
                    console.log('Wanted Format: ', JSON.parse(element.Custom_Picklist_Data__c))
                    
                    element.Custom_Picklist_Data__c = JSON.parse(element.Custom_Picklist_Data__c);
                }
                else if(element.isLookup__c){
                    console.log('Wanted Format: ', JSON.parse(element.Lookup_Data__c))
                    element.Lookup_Data__c = JSON.parse(element.Lookup_Data__c);
                }
            });

            var tempObj = {
                id: this.numberOfRows,
                fieldData: tempFieldData
            }
            console.log('Temp Obj: ', tempObj);
            this.collectedData.push(tempObj)
            
            this.fieldData.forEach(element => {
                this.labels.push({
                    text : element.label,
                    required : element.required,
                })
            })
            console.log('Collected Data: ', this.collectedData);
            console.log('Labels: ', this.labels);
            console.log('Test Data: ', this.fieldData);
        })
        .catch(error => {
            console.log('Error: ', error);
            this.error = error;
        });
        }
        else{
            getVBTabularFormData({name: this.formName})
            .then(result => {
                console.log('Data: ', JSON.parse(JSON.stringify(result)));
                //store the information about the fields
                this.fieldData = result.Fields;
                this.formLabel = result.Name;
                this.numberOfRows++
                let tempFieldData = []
                this.flowHandler = result.FlowHandler;
                this.objectName = result.ObjectName;
                this.formId = result.id;
                console.log('Fields: ', JSON.parse(JSON.stringify(this.fieldData)));
                this.fieldData.forEach(element => {
                    tempFieldData.push({...element})
                });

                tempFieldData.forEach(element => {
                    element.value = ""
                    if(element.isSFPicklist__c){
                        // console.log('Wanted Format: ', JSON.parse(element.SF_Picklist_Data__c))
                        element.SF_Picklist_Data__c = JSON.parse(element.SF_Picklist_Data__c);
                    }
                    else if(element.isCustomPicklist__c){
                        console.log('Wanted Format: ', JSON.parse(element.Custom_Picklist_Data__c))
                        
                        element.Custom_Picklist_Data__c = JSON.parse(element.Custom_Picklist_Data__c);
                    }
                    else if(element.isLookup__c){
                        console.log('Wanted Format: ', JSON.parse(element.Lookup_Data__c))
                        element.Lookup_Data__c = JSON.parse(element.Lookup_Data__c);
                    }
                });

                var tempObj = {
                    id: this.numberOfRows,
                    fieldData: tempFieldData
                }
                console.log('Temp Obj: ', tempObj);
                this.collectedData.push(tempObj)
                
                this.fieldData.forEach(element => {
                    this.labels.push({
                        text : element.label,
                        required : element.required,
                    })
                })
                console.log('Collected Data: ', this.collectedData);
                console.log('Labels: ', this.labels);
                console.log('Test Data: ', this.fieldData);
            })
            .catch(error => {
                console.log('Error: ', error);
                this.error = error;
            });
        }
        
    }

    addEntry(){
        console.log("Add Entry was clicked")
        this.numberOfRows++
        let tempFieldData = []
        this.fieldData.forEach(element => {
            tempFieldData.push(element)
        });
        tempFieldData.forEach(element => {
            element = {...element}
            element.value = ""
        });


        let tempObj = {
            id: this.numberOfRows,
            fieldData: tempFieldData
        }
        this.collectedData.push(tempObj)
        // var tempObj = new Object()
        // tempObj.id = this.numberOfRows
        // this.fieldData.forEach(element => {
        //     tempObj[element] = ""
        // });
        // this.collectedData.push(tempObj)
        
        console.log('Updated Data: ', this.collectedData);
    }

    get getData(){
        console.log('Sending Data: ', this.collectedData);
        return this.fieldData
    }

    get validate(){
        let valid = true
        this.collectedData.forEach(element => {
            element.fieldData.forEach(field => {
                if(field.required == "True" && field.value == ""){
                    valid = false
                }
            })
        })

        return valid
    }
    
    get formAvailable(){
        if(this.collectedData.length > 0){
            return true
        }
        else{
            return false
        }
    }

    handleDelete(event){

       let id = event.detail.id
       let rows = this.template.querySelectorAll('c-v-b-tabular-row')
        console.log('Row: ', rows.length);
        let data = []
        rows.forEach(element => {
            let tempObj = new Object()
            tempObj = element.info
            data.push(tempObj)
        });
        data = data.filter(x => x.id != id)
        this.collectedData = data
       this.collectedData = this.collectedData.filter(element => element.id != id)
        if (this.collectedData.length == 0){
            this.addEntry()
            let data = this.collectedData
            data[0].id = 1
            this.collectedData = data
        } 
        if ( (id == 1) && (this.collectedData.length != 0) ){
            let data = this.collectedData
            data[0].id = 1
            this.collectedData = data
        }

    //check if the row is the first one and assign the first row to the first row
    }

    handleSubmit(event){

        let rows = this.template.querySelectorAll('c-v-b-tabular-row')
        console.log('Row: ', rows.length);
        let data = []
        rows.forEach(element => {
            let tempObj = new Object()
            tempObj = element.info
            data.push(tempObj)
        });
        this.collectedData = JSON.parse(JSON.stringify(data))

        // check if all required fields are filled
        if(this.validate){
            console.log('Updated Data: ', this.collectedData);
            this.error = false
            let dataObj = {}
            let fieldData = []
            this.collectedData.forEach(element => {
                console.log('Element: ', element.fieldData);
                element.fieldData.forEach(field => {
                    let newObject = new Object()
                    newObject.fieldName = field.Name
                    newObject.value = field.value
                    fieldData.push(newObject)
                })
                console.log('Field Data: ', fieldData);
            });
            console.log('Source Form: ', this.formId);
            dataObj.objectName = this.objectName
            dataObj.fieldData = fieldData
            dataObj.formSource = this.formId
            dataObj.flowHandler = this.flowHandler
            console.log('New Object: ', JSON.parse(JSON.stringify(dataObj)));
            let stringObj = JSON.stringify(dataObj)
            /**
             * load the default values
             */
            // var defaultList = JSON.parse(this.defaultValues)
            // console.log('Default List: ', defaultList);
            // var deleteObj = dataObj;
            // deleteObj.fieldData.append(defaultList)
            // console.log('Data With Default Data', JSON.parse(JSON.stringify(dataObj)));

            createVBTabularDataRecord({dat : stringObj})
            .then(result => {
                console.log('Result: ', result);
                this.error = false
                const toastEvent = new ShowToastEvent({
                    title: 'Success',
                    message: 'Data has been submitted',
                    variant: 'success',
                });
                this.dispatchEvent(toastEvent);
                this.collectedData = []
                this.addEntry()
                this.collectedData[0].id = 1
            })
            .catch(error => {
                console.log('Error: ', error);
                this.error = error
            })
        } else {
            this.error = "Please fill all required fields"
        }
    }
    
}