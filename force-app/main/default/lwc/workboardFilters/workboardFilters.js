import { LightningElement, api, track } from 'lwc';

export default class WorkboardFilters extends LightningElement {
    constructor() {
        super();
        let multipicklist = this.template.querySelector('c-multi-select-picklist');
        // this.template.addEventListener('click', multipicklist.handleClose);
    }
     
    @track _filters = {};
    @track requestedByVal
    @track requestedForVal
    @track ownerVal
    @track recordTypeVal = [];
    @track tempRecordTypeVal = [];
    @track departmentVal 
    @track priorityVal
    @track assetVal
    @track assign

    @track createdFilter
    @track closedFilter
    @track createdDate
    @track closedDate
    @track overdueFilter
    @track sortOrder1
    @track sortOrder2
    @track sortBy1
    @track sortBy2
    @track filterProcessed = false;

    @track createdDateFilter
    @track closedDateFilter
    @track sortCriteria1
    @track sortCriteria2

    @api assignedtousers
    @api requestedbyusers
    @api requestedforusers
    @api users
    @api assettypes
    @api priorities
    @api recordtypes
    @api departments
    @api 
    set filters(value){
        this._filters = {
            ...value
        }
    }
    get filters(){
        return this._filters;
    }
    
    // @api assignedtousers
    
    requestedForOptions = []
    requestedByOptions = []
    assignedToOptions = []

    @track showPopup = false;

    dateToday
    _handler
    sortorderoptions = [{'label' : '', 'value' : ''},{'label' : 'Ascending', 'value' : 'ASC'},{'label' : 'Descending', 'value' : 'DESC'}]
    sortOptions = [{'label' : '', 'value' : ''},
                   {'label' : 'Priority', 'value' : 'Priority__c'},
                   {'label' : 'Subject', 'value' : 'Subject__c'},
                   {'label' : 'VB Asset Type', 'value' : 'VB_Asset_Type__c'},
                   {'label' : 'Requested Date', 'value' : 'CreatedDate'},
                   {'label' : 'Closed Date', 'value' : 'Closed_Date__c'},
                   {'label' : 'Due Date', 'value' : 'Due_Date__c'},
                   {'label' : 'Record Type', 'value' : 'RecordType.Name'},]

    

    connectedCallback(){
        this.template.addEventListener('click', event =>{
            if (this.template.querySelector('.filter-menu').contains(event.target)){
                console.log('Inside');
                // this.openFilters()
            } else {
                console.log('Outside');
            }
            
        })

        // $("input").focus(function() {
        //     alert("Hello World");
        // });
        // let inputs = this.template.querySelectorAll('input');

        
        this.filteredOpt = this.options
        console.log('Filters on connect: ', this._filters);
     
    }

    renderedCallback(){
        // console.log("Current Filters: ", this.recordTypeVal);
        // console.log("current filters type: ", typeof this.recordTypeVal);
        console.log('New Filters: ', JSON.stringify(this._filters));
    }
    get getAssetOptions(){
        let options = []
        options.push({label : ' ', value : ' '})
        if(this.assettypes){
            this.assettypes.forEach( opt => {
                options.push({
                    label :  opt.label,
                    value : opt.value
                })
            })
        }
        return options
    }

    get getPriorityOptions(){
        let options = []
        options.push({label : ' ', value : ' '})
        if(this.priorities){
            this.priorities.forEach( opt => {
                options.push({
                    label :  opt.label,
                    value : opt.value
                })
            })
        }
        return options
    }
    get dateOptions(){
        return [
            {label: '--None--', value : '--None--'},
            {label: 'Equal', value:'='},
            {label: 'After', value:'>'},
            {label: 'Before', value:'<'},
        ]
    }
    get getrecordtypes(){
        var retOptions = [];
        this.recordtypes.forEach(dat => {
            retOptions.push({
                label : dat.label,
                value : dat.value
            })
        })
        return retOptions
    }

    get RecordTypeActiveStatus(){
        const dat = this._filters.recTypes;
        try{
          
            if(this._filters === undefined)
                return true
            else if(dat != undefined )
                if(JSON.parse(dat).length === 0)
                    return true
                if((JSON.parse(dat).length === this.recordtypes.length || JSON.parse(dat).length === 0) )
                    return true
            else 
                return false  
        } catch(error){
            console.log('Record Types Filter Error: ', error);
            return true
        }
    }
    get activeStatus(){
        console.log('Active Status: ', this._filters);
        console.log('Processed: ', this.filterProcessed);
        if((this._filters.sortCriteria1 != "" || this._filters.sortCriteria2 != "" ||
        (this._filters.requestedBy != "" || this._filters.requestedBy != '--None--') ||
        (this._filters.requestedFor != "" || this._filters.requestedFor != '--None--') ||
        (this._filters.AssignedTo != "" || this._filters.AssignedTo != '--None--') ||
        (this._filters.priority != "" || this._filters.priority != '--None--') ||
        (this._filters.assetType != "" || this._filters.assetType != '--None--') ||
        (this._filters.createdDat != "" || this._filters.createdDat != '--None--') ||
        (this._filters.closedDat != "" || this._filters.closedDat != '--None--') ||
        (this._filters.overdue != "" || this._filters.overdue != false) ||
        (!this.RecordTypeActiveStatus)) && this.filterProcessed) 
           return true
        else {
            return false
        }
    }

    closeRecordTypes(){
        //close the multiselect if it is open
        console.log('Close Record Types');
        this.template.querySelector('c-v-b-multi-select-picklist').handleCloseFromParent()
    }

    openFilters(event){
        console.log('Open');
        let target = this.template.querySelector('.popup');
        target.classList.remove('filter-is-closed');
    }

    closeFilters(event){
        console.log('Close');
        let target = this.template.querySelector('.popup');
        target.classList.add('filter-is-closed');
        event.stopImmediatePropagation()
    }

    toggleFilter(){
        this.showPopup = !this.showPopup;
    }

    // methods to handle changes in the fields 

    handleRecTypeChange(event){
        
        // we need to store this values in JSOn format
        console.log('Record Type change: ', event.detail.value);
        let newRecordTypes = []
        let values = (JSON.parse(JSON.stringify(event.detail.value))).split(',')
        values.forEach(dat => {
            newRecordTypes.push(dat.trim())
        }
        )
        this._filters.recTypes = JSON.stringify(newRecordTypes)
        console.log('New Filters: ',this._filters.recTypes);
    }


    handleFilterChanges(event){
        let value = event.target.value
        let fieldName  = event.target.dataset.name
        console.log('Field Name: ', fieldName);
        console.log('Value: ', value);
        this._filters = { ...this._filters, [fieldName] : value}
        console.log('New Filter: ', this._filters);
    }

    handleOverdue(event){
        console.log('Overdue checked');
        if(!event.target.checked){
            this._filters.overdue = false
            this.overdueFilter = false
            console.log('Overdue Filter Reset');
            return
        }
        console.log(event.target.checked)
        this.overdueFilter = event.target.checked
    }

    handleCreatedFilter(event){
        this.createdFilter = event.target.value
        // if(event.target.value === '--None--'){
        // }
        if(this.createdDate){
            this._filters.createdDat = this.createdFilter + ' ' + this.createdDate
        }
        console.log(this.createdDateFilter);
    }

    handleClosedFilter(event){
        this.closedFilter = event.target.value
        if(this.closedDate){
            this._filters.closedDat = this.closedFilter + ' ' + this.closedDate
        }
        // this.closedDateFilter = this.closedFilter + ' ' + event.target.value
        console.log(this.closedDateFilter);
    }

    handleCreatedDate(event){
        console.log(event.target.value);
        this.createdDate = event.target.value
        if(this.createdFilter){
            this._filters.createdDat = this.createdFilter + ' ' + this.createdDate
        }
        // this.createdDateFilter = this.createdFilter + ' ' + this.createdDate
        console.log(this.createdDateFilter);
    }

    handleClosedDate(event){
        console.log(event.target.value);
        this.closedDate = event.target.value
        if(this.closedFilter){
            this._filters.closedDat = this.closedFilter + ' ' + this.closedDate
        }
        // this.closedDateFilter = this.closedFilter + ' ' + this.closedDate
        console.log(this.closedDateFilter);
    }
    handleSortChange1(event){
        // console.log('Criteria 1: ', event.target.value);
        // let sortfield = event.target.valuejh
        // let sortCriteria = sortfield + ' ' + this.sortBy1
        // if(this.sortOrder1){
        //     this.sortCriteria1 = sortfield + ' ' + this.sortOrder1
        // this._filters.sortCriteria1 = sortCriteria
        // }
        console.log('Criteria 1: ', event.target.value);
        let sortfield = event.target.value
        this.sortBy1 = sortfield
        if(this.sortOrder1){
            this._filters.sortCriteria1 = sortfield + ' ' + this.sortOrder1
        }
    }

    handleSortChange2(event){
        // let sortfield = event.target.value
        // this.sortBy2 = sortfield
        // let sortCriteria = this.sortBy2 + ' ' + sortfield
        // if(this.sortOrder2){
        //     this.sortCriteria2 = sortfield + ' ' + this.sortOrder2
        // this._filters.sortCriteria2 = sortCriteria
        // }
        let sortfield = event.target.value
        this.sortBy2 = sortfield
        if(this.sortOrder2){
            this._filters.sortCriteria2 = sortfield + ' ' + this.sortOrder2
        }
    }

    handlesortorder1(event){        
        let sortorder = event.target.value
        this.sortOrder1 = sortorder
        let nullPlacement = ''
        if(sortorder == 'ASC')
            nullPlacement = 'NUllS FIRST'
        else if(sortorder == 'DSC')
            nullPlacement = 'NULLS LAST'
        else 
            nullPlacement = ''
        if(this.sortBy1){
            this._filters.sortCriteria1 = this.sortBy1 + ' ' + sortorder + ' ' + nullPlacement
        }
    }

    handlesortorder2(event){
        let sortorder = event.target.value
        this.sortOrder2 = sortorder
        let nullPlacement = ''
        if(sortorder == 'ASC')
            nullPlacement = 'NUllS FIRST'
        else if(sortorder == 'DSC')
            nullPlacement = 'NULLS LAST'
        else 
            nullPlacement = ''
        if(this.sortBy2){
            this._filters.sortCriteria2 = this.sortBy2 + ' ' + sortorder + ' ' + nullPlacement
        }
    }

    handleSortChange(event){
        this.sortBy = event.target.value
    }
    
    handleSortChange1(event){
        this.sortBy1 = event.target.value
    }


    //method to be alled on apply button click
    handleApply(evt){
        console.log('Filter to be sent: ',  this._filters);
        const event = new CustomEvent('newfilters', {
            detail : this._filters
        })
        this.dispatchEvent(event)
        this.showPopup = false
        this.filterProcessed = true
    }

    handleReset(){
        var tempRecTypes = []; 
        this.tempRecordTypeVal = []
        this.recordtypes.forEach(dat => {
            tempRecTypes.push(dat.label)
        })
        // this.template.querySelector('c-multi-select-picklist').resetValues();
        this.template.querySelector('.overdue').checked = false
        this._filters = {
            requestedBy : '',
            requestedFor : '',
            AssignedTo : '',
            department : '',
            recTypes : JSON.stringify([]),
            priority : '',
            assetType : '',
            createdDat : '',
            closedDat : '',
            overdue: false,
            sortCriteria1: '',
            sortCriteria2: ''
        }

        //clear the date filters
        this.createdDate = ''
        this.closedDate = ''
        this.createdFilter = ''
        this.closedFilter = ''

        
        const event = new CustomEvent('newfilters', {
            detail : this._filters
        })
        this.dispatchEvent(event)
        let target = this.template.querySelector('.popup');
        this.showPopup = false
        this.filterProcessed = false
        console.log('Reset Filter values: ',this._filters);

    }

    // method to validate the sort criteria
    get validateSortCriteria(){
        if ((this.sortBy1 === this.sortBy2) && this.sortBy2 && this.sortBy1){
            return true
        }
        return false
    }

    // get record types
    get getRecordTypes(){
        console.log('Getting record types: ', this._filters.recTypes);
        // get the record type options
        let recTypes = this.getrecordtypes;
        console.log('Record Type Options: ', recTypes);
        // get the currently selected record types
        let selectedRecTypes = JSON.parse(this._filters.recTypes)
        //loop through the record type options and get the ids of the selected record types
        let selectedRecTypeIds = []
        recTypes.forEach(dat => {
            if(selectedRecTypes.includes(dat.label)){
                selectedRecTypeIds.push(dat.value)
            }
        })
        console.log('Selected Record Type Ids: ', selectedRecTypeIds);
        
        // return the ids
        return selectedRecTypeIds

    }

}