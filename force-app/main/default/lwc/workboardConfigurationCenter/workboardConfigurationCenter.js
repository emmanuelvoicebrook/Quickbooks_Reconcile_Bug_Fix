import { LightningElement, api, track, wire } from 'lwc';
import getSettings from '@salesforce/apex/WorkboardController.getFullSettings'
import updateSettings from '@salesforce/apex/workboardMetadata.updateWorkboardConfiguration'
import getThemes from '@salesforce/apex/workboardMetadata.getThemes'
import getRecordTypes from '@salesforce/apex/WorkboardController.getAllRecordTypes'
import updateWorkboardColors from '@salesforce/apex/workboardMetadata.updateWorkboardTheme'
import Add from '@salesforce/resourceUrl/Add';
import { refreshApex } from '@salesforce/apex';

export default class WorkboardConfigurationCenter extends LightningElement {

    //Universal Variables 
    addImage = Add;

    // General Variables
    @track header
    @track recordTypeId
    @track recordTypeList
    @track updateFlow
    @track fieldsToDisplay = []
    @track displayFields
    @track noFieldEntries
    @track createFlow
    @track fieldIds = 1
    @track colorIds = 1
    @track recordTypeOptions
    @track generalEditDisabled = true
    @track themeEditDisabled = true

    //Theme Variables
    @track currentTheme
    @track themeOptions = []
    @track backColor
    @track fontColor
    @track headerColor
    @track noOfColorEntries
    @track colorSettings = new Map();
    @track currentSetting = {
        background : '',
        fontColor : '',
        pathColor : '',                          
        recordTypeColors : ''
    }

    //wire to get the record types
    @wire (getRecordTypes)
    async recordTypes({error, data}){
        if(data){
            console.log('FETCHING RECORD TYPES: ', data);
            // console.log('Record Types: ', data);
            let options = []
            // for(let i = 0; i < dataList.length; i++){
            //     this.recordTypes = [ ...this.recordTypes, {value : dataList[i].Id, label: dataList[i].Name, isChecked:false, class:this.dropdownList}];
            // }

            data.forEach( rec => {
                options.push({
                    label : rec.Name,
                    value : rec.Id,
                    apiname : rec.DeveloperName,
                })
            });
            console.log('HERE ARE THE RECORD TYPES: ', options);
            this.recordTypeOptions = options

            // this.handleRecords();
        } else if(error){
            console.log('Record Types Error: ', error);
        }
    }   

    connectedCallback(){
        getSettings()
            .then(
                result => {
                    
                    console.log('Settings: ', result);
                    this.recordTypeId = result.Record_Type_Id__c
                    this.recordTypeList = JSON.parse(result.Record_Types__c)
                    this.header = result.Workboard_Header__c
                    this.updateFlow = result.Record_Update_Flow_Name__c	
                    this.createFlow = result.Record_Creation_Flow_Name__c
                    let tempFieldsToDisplay =  JSON.parse(result.Fields_To_Display__c)
                    tempFieldsToDisplay.forEach(field => {
                        let newField = {
                            label: field.label,
                            apiname: field.apiname,
                            id: this.fieldIds
                        }
                        this.fieldsToDisplay.push(newField)
                        this.fieldIds++
                    })
                    console.log('Record Type Data: ', typeof(this.recordTypeList));
                    console.log('Record Type List: ', this.recordTypeList);
                },
                error => {
                    console.log('Error getting settings: ',error);
                }
            )

        getThemes()
            .then(
                result => {
                    // console.log('Results: ', result);
                    if(result){
                        var colors = [];
                        let count = 0;
                        let defaultTheme = ''
                        result.forEach(theme => {
                            count === 0 ? defaultTheme = theme.Label : console.log('no changes');
                            this.themeOptions.push({
                                label : theme.Label,
                                value : theme.Label,
                            });
                            let tempRecordTypeColors = JSON.parse(theme.Record_Types_Card_Colors__c)
                            let recordTypeColors = []
                            tempRecordTypeColors.forEach(colorSet => {
                                let newColor = {
                                    RecordType: colorSet.RecordType,
                                    color: colorSet.color,
                                    id: this.colorIds
                                }
                                recordTypeColors.push(newColor)
                                this.colorIds++
                            })
                            
                            colors.push(
                                {
                                fontColor: theme.Font_Color__c, 
                                background: theme.Background_Color__c,
                                pathColor : theme.Path_Color__c,                          
                                recordTypeColors : recordTypeColors
                                }
                            )
                            this.colorSettings.set(theme.Label, colors[count])
                            count++
                        })
                        console.log('Color Settings: ', this.colorSettings)
                        console.log('Default Themes: ', defaultTheme);
                        this.currentTheme = defaultTheme
                        this.currentSetting = this.colorSettings.get(`${defaultTheme}`)
    
                    }
                }, error => {
                    console.log('Error fetching themes!');
                }
            )
            

        }

    get getThemeOptions(){
        //only diplay recordtypes that are in the selected list of record types
        
        let options = []
        
        let selected_recordtypes = []
        if(this.recordTypeOptions){
            if(typeof(this.getSelectedRecordTypes) === 'string'){
                let temp_selected_recordtypes = (this.getSelectedRecordTypes).split(',')
                temp_selected_recordtypes.forEach(recordtype => {
                    //get the api name of the record type from the options 
                    let recordtype_apiname = this.recordTypeOptions.find(option => option.value === recordtype).apiname
                    selected_recordtypes.push(recordtype_apiname)
                })
            } else {
                if(this.getSelectedRecordTypes){
                    this.getSelectedRecordTypes.forEach(recordtype => {
                        //get the api name of the record type from the options 
                        let recordtype_apiname = this.recordTypeOptions.find(option => option.value === recordtype).apiname
                        selected_recordtypes.push(recordtype_apiname)
                    })
                }
            }
        }
        
        if(this.currentSetting.recordTypeColors ){
            let initial_options = (this.currentSetting.recordTypeColors)
            initial_options.forEach(rectype_color => {
                if(selected_recordtypes.includes(rectype_color.RecordType)){
                    options.push(rectype_color)
                }
            })
        }

        return options

    }
    
    handleEditGeneral(event){
        console.log('Allowing General Edit: ', this.generalEditDisabled);
        this.generalEditDisabled = !this.generalEditDisabled
    }

    handleEditThemes(event){
        console.log('Allowing Themes Edit: ', this.themeEditDisabled);
        this.themeEditDisabled = !this.themeEditDisabled
    }

    handleThemeChange(event){
        console.log(event.target.value);
        this.currentTheme = event.target.value
        const tempColor = this.colorSettings.get(`${this.currentTheme}`)
        console.log('Set Setting: ', this.colorSettings.get(`${this.currentTheme}`));
        this.currentSetting = this.colorSettings.get(`${this.currentTheme}`)
        this.backColor = tempColor.background
        this.fontColor = tempColor.fontColor
    }

    handleBackgroundChange(event){
        this.currentSetting.background = event.target.value        
        this.colorSettings.set(`${this.currentTheme}`, this.currentSetting)
    }

    handleFontChange(event){
        this.currentSetting.fontColor = event.target.value        
        this.colorSettings.set(`${this.currentTheme}`, this.currentSetting)
    }

    handlePathChange(event){
        this.currentSetting.fontColor = event.target.value        
        this.colorSettings.set(`${this.currentTheme}`, this.currentSetting)
    }
    handleColorchange(event){
        console.log('Color Change: ', event.detail.color);
        this.currentSetting.recordTypeColors.every(colorSetting => {
            if(colorSetting.RecordType === event.detail.RecordType){
                colorSetting.color = event.detail.color
                return false;
            }
            return true;
        }
        )
        this.colorSettings.set(`${this.currentTheme}`, this.currentSetting)


    }


    handleAddColor(event){
        console.log('Color List: ', this.currentSetting.recordTypeColors);
        this.currentSetting.recordTypeColors.push({
            RecordType: "",
            color: ""
        })
    }


    handleColorDelete(event){
        let index
        let deleted
        let data = JSON.stringify(event.detail)
        data = JSON.parse(data)
        let fields =  JSON.stringify(this.currentSetting.recordTypeColors)
        fields = JSON.parse(fields)
        for(let x = 0; x < this.currentSetting.recordTypeColors.length; x++ ){
            if(JSON.stringify(this.currentSetting.recordTypeColors[x]) == JSON.stringify(data)){
                console.log('found it!', JSON.stringify(this.currentSetting.recordTypeColors[x]));
                index = x
                deleted = fields.splice(index, 1)
                this.currentSetting.recordTypeColors = fields
            } else{
                console.log('Not it', this.currentSetting.recordTypeColors[x]);
            }
        }

        console.log('New List: ', this.currentSetting.recordTypeColors);
    }
    handleColorCancel(event){
        console.log('Cancelling');
        getThemes()
            .then(
                result => {
                    // console.log('Results: ', result);
                    if(result){
                        var colors = [];
                        let count = 0;
                        result.forEach(theme => {
                            
                            let recordTypeColors = JSON.parse(theme.Record_Types_Card_Colors__c)
                            // console.log('Record Type Colors: ', JSON.parse(theme.Record_Types_Card_Colors__c));
                            colors.push(
                                {
                                fontColor: theme.Font_Color__c, 
                                background: theme.Background_Color__c,
                                pathColor : theme.Path_Color__c,                          
                                recordTypeColors : recordTypeColors
                                }
                            )
                            this.colorSettings.set(theme.Label, colors[count])
                            count++
                        })
                        this.currentSetting = this.colorSettings.get(`${this.currentTheme}`)
                        console.log('Color Settings: ', this.colorSettings)
    
                    }
                }, error => {
                    console.log('Error fetching themes!', error);
                }
            )
        this.themeEditDisabled = true  

    }

    handleColorSave(event){
        console.log('Saving');

        // loop through the theme option
        let tempColorSettings =  this.colorSettings

        this.themeOptions.forEach(theme => {
            let tempCurrentSetting = tempColorSettings.get(`${theme.value}`)
            let data = tempCurrentSetting.recordTypeColors
            let dataMap = {}
            let recordTypesColors = []

            data.forEach(color => {
                let recordTypeProperty = {
                    RecordType: color.RecordType,
                    color: color.color
                }
                recordTypesColors.push(recordTypeProperty)
            })

            dataMap['Background_Color__c'] = tempCurrentSetting.background
            dataMap['Font_Color__c'] = tempCurrentSetting.fontColor
            dataMap['Path_Color__c'] = tempCurrentSetting.pathColor
            dataMap['Record_Types_Card_Colors__c'] = JSON.stringify(recordTypesColors)
            console.log('Theme Name: ', theme.value);
            console.log('Data Map: ', dataMap);
            updateWorkboardColors({label : theme.value, fieldValues : JSON.stringify(dataMap)})
        })
        this.themeEditDisabled = true
    }


    //General Settings 

    handleAddField(event){
        console.log('List: ', this.fieldsToDisplay);
        this.fieldsToDisplay.push({
            label: "",
            apiname : "",
            id : this.fieldIds
        })
        this.fieldIds++
    }

    handleHeaderChange(event){
        this.header = event.target.value
        
    }

    handleRecTypeChange(event){
        this.recordTypeId = event.target.value
    }

    handleRecTypeListChange(event){
        let receivedData = JSON.parse(JSON.stringify(event.detail))
        console.log('Record Type List: ', receivedData);
        
        let selectedIDs = receivedData.value
        // receivedData.forEach(element => {
        //     selectedIDs.push(element.value)
        // })
        console.log('Selected IDs: ', selectedIDs);
        this.recordTypeList = selectedIDs
    }

    handleUpdateFlowChange(event){
        this.updateFlow = event.target.value
    }

    handleCreationFlowChange(event){
        this.createFlow = event.target.value
    }

    
    handleDelete(event){
        let index
        let deleted
        let data = JSON.stringify(event.detail)
        data = JSON.parse(data)

        //filter the list
        console.log('Data: ', data);
        this.fieldsToDisplay = this.fieldsToDisplay.filter(field => {
            return field.id !== data.id
        })
        
        console.log('New List: ', this.fieldsToDisplay);

    }   

    handleCancelFields(event){
        getSettings()
        .then(
            result => {
                let recordTypeString = ''
                this.recordTypeId = result.Record_Type_Id__c
                recordTypeString = result.Record_Types__c
                this.header = result.Workboard_Header__c
                this.updateFlow = result.Record_UpdateFlow_NameRecord_Creation__c	
                this.createFlow = result.Record_Creation_Flow_Name__c
                this.fieldsToDisplay =  JSON.parse(result.Fields_To_Display__c)
                this.recordTypeList = recordTypeString.split(', ')
                console.log('Record Type List: ', this.recordTypeList);
            },
            error => {
                console.log('Error getting settings: ',error);
            }
        )

        this.generalEditDisabled = true
    }
    saveFields(event){
        console.log('...Updating Settings...');
        // get fields to display
        let fields = this.template.querySelectorAll('c-workboard-general-configuration-row');
        let fieldsToDisplay = []
        fields.forEach(element => {
            let field = {}
            field.label = element.info.label
            field.apiname = element.info.apiname
            fieldsToDisplay.push(field)
        })

        //get the record ids data 
        let recordTypeField = this.template.querySelector('c-v-b-multi-select-picklist');
        let recordTypeIdList = JSON.stringify((recordTypeField.value).split(','))
        console.log('Record Type Ids: ', recordTypeIdList);
        let settings = {
            fieldsToDisplay : JSON.stringify(fieldsToDisplay),
            header : this.header,
            recordTypeId : this.recordTypeId,
            creationFlow : this.createFlow,
            updateFlow : this.updateFlow,
            recordTypes : recordTypeIdList 
        }
        console.log('Obj Data: ', settings);
        let data = JSON.stringify(settings)
        console.log('New Values: ', data);
        updateSettings({jsonObjectData : `${data}`})
        this.generalEditDisabled = true
    
    }

    get getSelectedRecordTypes(){
        if(this.recordTypeList){
            console.log('Record Type List Type: ', this.recordTypeList + ' : '+ typeof(this.recordTypeList));
            return this.recordTypeList
        }
    }

    get getGeneralEditDisabled(){
        return !this.generalEditDisabled
    }

    get getThemeEditDisabled(){
        return !this.themeEditDisabled
    }
}