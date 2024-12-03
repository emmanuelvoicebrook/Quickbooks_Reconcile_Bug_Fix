import { LightningElement, wire, track } from 'lwc';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import WORKBOARD_ITEM_OBJECT from '@salesforce/schema/Workboard_Item__c';
import ID_FIELD from '@salesforce/schema/Workboard_Item__c.Id'; 
import STATUS_FIELD from '@salesforce/schema/Workboard_Item__c.Status__c'; 
import getWorkboardRecords  from '@salesforce/apex/WorkboardController.getObjectRecords';
import getSettings from '@salesforce/apex/WorkboardController.getWorkboardSetting'
import getBaseSetting from '@salesforce/apex/WorkboardController.getSettingInstance'
import getThemes from '@salesforce/apex/workboardMetadata.getThemes'
import getUsers from '@salesforce/apex/WorkboardController.getUserList';
import updateWorkboard from '@salesforce/apex/workboardMetadata.updateWorkboardData'
import getRecordTypes from '@salesforce/apex/WorkboardController.getRecordTypes';
import { ShowToastEvent } from 'lightning/platformShowToastEvent'
import { updateRecord, getRecord } from 'lightning/uiRecordApi';
import {
    subscribe,
    unsubscribe,
    onError
} from 'lightning/empApi';
import { refreshApex } from '@salesforce/apex';
import Id from '@salesforce/user/Id';
// import AuthSession from '@salesforce/authsession/Id';
import Close from '@salesforce/resourceUrl/Close';
import Add from '@salesforce/resourceUrl/Add';

const UserFields = [
    'User.LastName',
    'User.FirstName',
]

export default class Kanban extends LightningElement {
    //initializing the platform event settings
    channelName = '/event/VB_Workboard_Event__e';
    isSubscribeDisabled = false;
    isUnsubscribeDisabled = !this.isSubscribeDisabled

    subscription ={}

    //workboard variables 
    @track isLoading = true
    @track currentUser =[]
    @track columns;
    @track columnLabels =[] ;
    @track cases
    @track isModalOpen = false
    @track workboardData
    @track workboardRecords
    @track currRecord;
    @track userTheme
    @track isCreateNewCaseOpen = false
    @track isSettingOpen = false
    @track ownerSearch = false
    @track currentTheme = {};
    @track userTheme;
    @track userSearchTxt
    @track userIdFilter
    @track ownerIdFilter
    @track priority
    @track queryTerm
    @track assets =[]
    @track recordTypes = [];
    @track checkWorkboardRecords = false;
    @track _selectedAssignedTo = '';
    @track _selectedRequestedBy = '';
    @track _selectedRequestedFor = ''
    @track _selectedDivision = '';
    @track _selectedPriority = '';
    @track _selectedAsset = '';
    @track _setCreatedDat = '';
    @track _setClosedDat = ''
    @track _setOverDueFilt = false
    @track _setSortCriteria1 = ''
    @track _setSortCriteria2 = ''
    @track _selectedRecordTypes = []
    @track dropdownList = 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta';
    @track filters = {
                        requestedBy : this._selectedRequestedBy,
                        requestedFor : this._selectedRequestedFor,
                        AssignedTo : this._selectedAssignedTo,
                        priority : this._selectedPriority,
                        assetType : this._selectedAsset,
                        createdDat : this._setCreatedDat,
                        closedDat : this._setClosedDat,
                        recTypes : this.getSelectedRecordTypes,
                        overdue : this._setOverDueFilt,
                        sortCriteria1 : this._setSortCriteria1,
                        sortCriteria2 : this._setSortCriteria2
                     }

    @track users
    @track userRecords
    @track baseRecordTypeId
    @track RecordCreationFlow
    @track RecordUpdateFlow
    @track header
    
    @track colorSettings = new Map();
    @track statusMetrics = [];
    @track themeOptions = []
    @track value = ''
    @track searchText =''
    @track requestedForOptions = []
    @track requestedByOptions = [] 
    @track assignedToOptions = [] 
    // @track requestedByUsers = []
    // @track assignedToUsers = []
    error;
    recordId;

    addImage = Add;
    closeImage = Close;
    userId = Id;
    workboardId;
    sObject = WORKBOARD_ITEM_OBJECT

 
    @wire(getWorkboardRecords, {filters : '$stringFilters', searchText : '$searchText'})
    handleRecords(results) {
        console.log('Check function: ', results);
        this.workboardData = results
        if (this.workboardData.data) {
            console.log('Filter Obj: ', this.filters);
            this.workboardRecords = this.workboardData.data;
            let dat = (this.workboardData.data)
            if (this.workboardRecords.length > 0) this.checkWorkboardRecords = true
            console.table(JSON.parse(JSON.stringify(this.workboardRecords)))
            console.log('Records: ', dat.length);            

        } else if (this.workboardData.error) {
            console.log('Test Error', this.workboardData.error)
        }
    }

    @wire (getRecordTypes)
    async recordTypes({error, data}){
        if(data){
            console.log('FETCHING RECORD TYPES: ', data);
            // console.log('Record Types: ', data);
            var dataList = data;
            // for(let i = 0; i < dataList.length; i++){
            //     this.recordTypes = [ ...this.recordTypes, {value : dataList[i].Id, label: dataList[i].Name, isChecked:false, class:this.dropdownList}];
            // }

            data.forEach( rec => {
                this._selectedRecordTypes.push(rec.Name)
            });
            console.log('HERE ARE THE RECORD TYPES: ', this._selectedRecordTypes);
            refreshApex(this.workboardData)

            // this.handleRecords();
        } else if(error){
            console.log('Record Types Error: ', error);
        }
    }   

    
    //get the picklist values to use as the columns
    @wire(getPicklistValuesByRecordType, { objectApiName: WORKBOARD_ITEM_OBJECT, recordTypeId: '$baseRecordTypeId'})
        wiredPicklistValue({data, error}){
            if(data){
                console.log('Data: ', data);
                this.columns = data.picklistFieldValues.Status__c.values;  
                this.priority =   data.picklistFieldValues.Priority__c.values; 
                this.assets = data.picklistFieldValues.VB_Asset_Type__c.values;
            
            }
            else if(error){
                console.log('Error while fetching Picklist values, ', error);
            }
        }

    @wire (getUsers)
        userRec(results){
            this.userRecords = results;
            if(this.userRecords.data){
                this.users = this.userRecords.data
            } else if (this.userRecords.error){
                console.log('Error getting users: ', this.userRecords.error);
            }
        }

    @wire (getRecord, { recordId : '$userId', fields : UserFields})
    getCurrentUser({data, error}){
        if(data){
            console.log('Current User: ', data);
            this.currentUser = data
            
        }
            
        else if(error)
            console.log('Error: ', error);
    }

    connectedCallback(){
        // console.log('User: ', User)
        getBaseSetting()
            .then(
                result => {
                    let data = JSON.parse(result);
                    console.log('Base Settings: ', data);
                    this.baseRecordTypeId = data.Record_Type_Id__c;
                    this.RecordCreationFlow = data.Record_Creation_Flow_Name__c
                    this.RecordUpdateFlow = data.Record_Update_Flow_Name__c
                    this.header = data.Workboard_Header__c
                }
            )
            
        getThemes()
        .then(
            result => {
                // console.log('Results: ', result);
                if(result){
                    var colors = [];
                    let count = 0;
                    result.forEach(theme => {
                        this.themeOptions.push({
                            label : theme.Label,
                            value : theme.Label
                        });
                        console.log(typeof theme);
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
                    console.log('Color Settings: ', this.colorSettings);

                }
            }, error => {
                console.log('Error fetching themes!');
            }
        )
        
        //get loggedin user workboard settings.
        getSettings()
        .then(
            results => {
                console.log('Workboard Record: ', results);
                this.workboardId = results.Id;
                this.value = results.Workboard_Theme__c;
                try{
                    this.currentTheme = this.colorSettings.get(this.value)
                    if(this.currentTheme === undefined){
                        this.value = 'Standard'
                        this.currentTheme = this.colorSettings.get(this.value)
                    }
                } catch(e){
                    console.log('Error getting current theme: ', e);
                    this.value = 'Standard'
                    this.currentTheme = this.colorSettings.get(this.value)
                }
                
            }, 
            error => {
                console.log('Error Fetching the user\'s workboard settings!', error);
                this.value = 'Standard'
                this.currentTheme = this.colorSettings.get(this.value)
            }
        )

        getRecordTypes()
        .then(
            result => {
                var dataList = result;
                for(let i = 0; i < dataList.length; i++){
                    this.recordTypes = [ ...this.recordTypes, {value : dataList[i].Name, apiname : dataList[i].DeveloperName, label: dataList[i].Name, isChecked:false, class:this.dropdownList}];
                }

                // result.forEach( rec => {
                //     this._selectedRecordTypes.push(rec.Name)
                // });
            },
            error => {
                console.log('Record Types Error: ', error);
            }
        )
        this.handleSubscribe()
        //register Error Listener
        this.registerErrorListener()

        // add all the recordtypes to the filter
        // this.filters = { ...this.filters, recordTypes: this._selectedRecordTypes}

    }
    disconnectedCallback(){
        this.handleUnsubscribe()
    }
    renderedCallback(){   
    }

    
    handleSubscribe(){
        const messageCallback =  (response) => {
            console.log('New Message received: ', JSON.stringify(response));
            refreshApex(this.workboardData)
        }

        subscribe(this.channelName, -1, messageCallback)
        .then(
            (response) =>{
                console.log('Subscription request sent to: ', JSON.stringify(response.channel));
                this.subscription = response;
                this.toggleSubscription(true);
            }
        )
    }

    handleUnsubscribe(){
        this.toggleSubscription(false)
        unsubscribe(this.subscription, (response) => {
            console.log('Unsubscribe() response: ' , JSON.stringify(response));

        })
    }

    toggleSubscription(prop){
        this.isSubscribeDisabled = prop;
        this.isUnsubscribeDisabled = !prop
    }

    registerErrorListener(){
        onError((error) =>{
            console.log('Received error from server: ', JSON.stringify(error));

        })
    }
    handleLoaded(event){
        this.isLoading = false;
    }
    
    get stringFilters(){
        console.log('JSON FILTERS: ', JSON.stringify(this.filters));
        return JSON.stringify(this.filters)
    }
    get divisionOptions(){
        return [
            { label: 'Product', value:'Product'},
            { label: 'Client Success', value:'Client Success'},
            { label: 'Client Acquisition', value:'Client Acquisition'},
            { label: 'Internal Operations', value:'Internal Operations'},
        ]
    }

    dynamicSort(property){
        var sortOrder = 1;
        if(property[0] === "-"){
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b){
            var result = (a[property] < b[property]) ? -1 : (a[property] > b(property)) ? 1 : 0;
            return result * sortOrder;
        }
    }

    sortObjectsArray(objectsArray, sortKey)
    {
        // Quick Sort:
        var retVal;

        if (1 < objectsArray.length)
        {
            var pivotIndex = Math.floor((objectsArray.length - 1) / 2);  // middle index
            var pivotItem = objectsArray[pivotIndex];                    // value in the middle index
            var less = [], more = [];

            objectsArray.splice(pivotIndex, 1);                          // remove the item in the pivot position
            objectsArray.forEach(function(value, index, array)
            {
                value[sortKey] <= pivotItem[sortKey] ?                   // compare the 'sortKey' proiperty
                    less.push(value) :
                    more.push(value) ;
            });

            retVal = sortObjectsArray(less, sortKey).concat([pivotItem], sortObjectsArray(more, sortKey));
        }
        else
        {
            retVal = objectsArray;
        }

        return retVal;
    }
    get requestedByUsers(){
        console.log('Requested By Details: ', this.requestedByOptions);
        if(this.requestedByOptions.length <= 1){
            var options = []
            let tempvalues = [];
            options.push({
                label : "",
                value : ""
            })
            if(this.workboardRecords){
                this.workboardRecords.forEach( opt => {
                    if(opt.Requested_By__c){
                        if (options.length === 0 || !tempvalues.find(ele => ele === opt.Requested_By__c)){
                            options.push({
                                label : opt.Requested_By__r.Name,
                                value : opt.Requested_By__c
                            })
                            tempvalues.push(opt.Requested_By__c)
                        }
                    }            
                })
            }

            function compare( a, b ) {
                if ( a.label < b.label ){
                return -1;
                }
                if ( a.label > b.label ){
                return 1;
                }
                return 0;
            }
            options.sort(compare)
            this.requestedByOptions = options
            return options
        }else {
            return this.requestedByOptions
        }
    }
    
    get requestedForUsers(){
        console.log('Requested For Details: ', this.requestedForOptions);
        if(this.requestedForOptions.length <= 1){
            var options = []
            let tempvalues = [];
            options.push({
                label : "",
                value : ""
            })
            if(this.workboardRecords ){
            this.workboardRecords.forEach( opt => {
                if(opt.Requested_For__c){
                    if (options.length === 0 || !tempvalues.find(ele => ele === opt.Requested_For__c)){
                        options.push({
                            label : opt.Requested_For__r.Name,
                            value : opt.Requested_For__c
                        })
                        tempvalues.push(opt.Requested_For__c)
                        
                    }
                }            
            })
            }
            function compare( a, b ) {
                if ( a.label < b.label ){
                return -1;
                }
                if ( a.label > b.label ){
                return 1;
                }
                return 0;
            }
            options.sort(compare)
            this.requestedForOptions = options
            console.log('Requested for options being returned: ', options);
            return options
        }else {
            return this.requestedForOptions
        }
    }

    get assignedToUsers(){
        if(this.assignedToOptions.length <= 1){
            let tempvalues = []
            let options = []
            options.push({
                label : "",
                value : ""
            })
            if(this.workboardRecords){
                this.workboardRecords.forEach( opt => {
                    if(opt.Assigned_To__c){
                        if((options.length === 0 || !tempvalues.find(ele => ele === opt.Assigned_To__c) && opt.Assigned_To__c)){
                            options.push({
                                label : opt.Assigned_To__r.Name,
                                value : opt.Assigned_To__c
                            })
                            tempvalues.push(opt.Assigned_To__c)
                        }
                    }
                
                })
            }
            function compare( a, b ) {
                if ( a.label < b.label ){
                return -1;
                }
                if ( a.label > b.label ){
                return 1;
                }
                return 0;
            }
            options.sort(compare)
            this.assignedToOptions = options
            return options
        } else {
            return this.assignedToOptions
        }
    }
    handleRecordSearch(event){
        console.log('Search information', event.target.value);
        this.searchText = event.target.value
        refreshApex(this.wo)

    }
    handleUserSearch(event){
        console.log(event.detail.value);
        this.userSearchTxt = event.detail.value;
        refreshApex(this.userRecords)
    }

    userClick(event){
        console.log('User Clicked: ', event.target.dataset.id);
    }

    handleListItem(event){
        this.recordId = event.detail;
    }

    handleFilterChange(event){
        
        // create new logic
        console.log('Filters Changed: ', event.detail);
        this.filters = event.detail;
        refreshApex(this.workboardData)
        refreshApex(this.wiredPicklistValue)

    }
    handleKeyUp(evt) {
        const isEnterKey = evt.keyCode === 13;
        if (isEnterKey) {
            this.queryTerm = evt.target.value;
        }
        refreshApex(this.workboardData)
    }
    
    handleRecordEditError(event){
        console.log('Error: ', event.detail);
    }
    get getSelectedRecordTypes(){
        return JSON.stringify(this._selectedRecordTypes)
    }

        
    
    get recordTypeSettings(){
        let settings = []
        let themeSetting = this.currentTheme.recordTypeColors
        if(themeSetting){
            themeSetting.forEach(set =>{
                let recT = set.RecordType.replace(/_/g, ' ')
                let styleAtt = 'background: '
                styleAtt = styleAtt + set.color
                let obj = {
                    RecordType : recT,
                    style : styleAtt
                }
                settings.push(obj)
            })
        }

        let selectedRecordTypes = []
        this.recordTypes.forEach(rec =>{
            console.log('recordTypeSettings rec', rec);
            selectedRecordTypes.push(rec.label)
        })
        console.log('recordTypeSettings before settings', settings);
        settings = settings.filter(set => selectedRecordTypes.includes(set.RecordType))
        console.log('recordTypeSettings : recordTypes: ' + this.recordTypes)

        console.log('recordTypeSettings  recordTypes: ' + selectedRecordTypes)
        console.log('recordTypeSettings  Settings: ' + settings)


        return settings
    }

    get calcWidth(){
        let len = this.columns.length
        return `width: calc(100%/ ${len})`
    }

    get PathStyle(){
        let len = this.columns.length
        let color = this.currentTheme.pathColor
        return `width: calc(100%/ ${len}); background: ${color}`
    }


    get column_length(){
        let len = this.columns.length
        return 100/len
    }
    get getBackground(){
        let color = this.currentTheme.background; 
        console.log('Background: ', JSON.stringify(this.currentTheme));
        return `background: ${color}`
    }

    get getTitleColor(){
        let color =  this.currentTheme.fontColor;
        return `color: ${color} !important`
    }

    get flowParamsJSON(){
    }
    
    get editFlowParamsJSON(){
        console.log('Record Id: ', this.currRecord);
        let flowParams = [{
            name: 'StartingRecordId',
            type: 'String',
            value : this.currRecord
        }]
        return JSON.stringify(flowParams)
    }

    changeTheme(event) {
        console.log(event.detail.value);
        this.value = event.detail.value
        console.log('New Theme: ', this.value);
        this.currentTheme = this.colorSettings.get(this.value)

        updateWorkboard({themeName : this.value, workboardId : this.workboardId})
        .then(() => {
            console.log('Second Theme Executed');
        })
    }

    handleItemDrop(event){
        let status = event.detail
        this.updateHandler(status);
    }

    updateHandler(status){
        const fields = {};
        fields[ID_FIELD.fieldApiName] = this.recordId;
        fields[STATUS_FIELD.fieldApiName] = status
        const recordInput = {fields}
        updateRecord(recordInput)
        .then(()=> {
            console.log("Updated Successfully")
            this.showToast();
            refreshApex(this.wiredPicklistValue)
            return refreshApex(this.workboardData);
        }).catch(error=>{
            console.error(error)
        })
    }
    showToast(){
        const event = new ShowToastEvent({
            title:'Success',
            message: 'Status updated successfully',
            variant: 'success'
        });
        this.dispatchEvent(event);
    }
    

    handleParent(event){
        console.log('GrandParent',event.detail)
        console.log(event.detail);
        this.currRecord = event.detail;
        this.isModalOpen = true;
    }

    openModal(){
        this.isModalOpen = true;
    }
    closeModal(){
        this.isModalOpen = false;
    }
    valueUpdate(event){
        event.preventDefault()
        this.isModalOpen = false;
        const evt = new ShowToastEvent({
            title: 'Success',
            message: 'Record Updated Successfully',
            variant: 'success'
        })
        this.dispatchEvent(evt)
        return refreshApex(this.workboardData);

    }
    submitDetails(){
        this.isModalOpen=false;
    }

    handleOwnerChange(event){
        this._selectedAssignedTo = event.detail
        refreshApex(this.workboardData)
    }

    handleUserChange(event){
        this._selectedRequestedBy = event.detail
        refreshApex(this.workboardData)
    }

    handleDivisionChange(event){
        this._selectedDivision = event.detail
        refreshApex(this.workboardData)
    }

    handleRecordTypeChange(event){
        if(!event.target.checked){
            this._selectedRecordTypes = this._selectedRecordTypes.filter(value => value !== event.target)
        }
    }
    get userOptions(){
        var returnOptions = [];
        returnOptions.push({
            label : '--None--',
            value : '--None--'
        })   

        if(this.users){
            this.users.forEach(user => {
                returnOptions.push({ 
                    label:user.Name__c , 
                    value:user.Id 
                });
            });
        }
        return returnOptions;
    }

    newCase(){
        this.isCreateNewCaseOpen = true;
    }

    closeNewCaseForm(){
        this.isCreateNewCaseOpen = false;
        return refreshApex(this.workboardData);
    }

    openSettings(){
        this.isSettingOpen = true;
    }

    closeSettings(){
        this.isSettingOpen = false; 
    }

    get getFilters(){
        console.log('Fetching Filters: ', this.filters);
        return this.filters
    }

    }