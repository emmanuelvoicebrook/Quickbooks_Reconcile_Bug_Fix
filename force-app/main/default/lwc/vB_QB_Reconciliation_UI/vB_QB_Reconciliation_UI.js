import { LightningElement, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Reconcile_Records from '@salesforce/apex/VB_QB_Reconciliation_Controller.init_reconciliation';
import NewReconciliation from '@salesforce/apex/VB_QB_Reconciliation_Controller.createReconciliationRecord';
import getLastReconcile from '@salesforce/apex/VB_QB_Reconciliation_Controller.getLastRecocile';
import QBMAPFILE from '@salesforce/resourceUrl/QBMapFile';
import QUICKBOOKS_INVOICES_OBJECT from '@salesforce/schema/Quickbooks_Invoice__c';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { loadScript } from 'lightning/platformResourceLoader';
import PARSER from '@salesforce/resourceUrl/PapaParse'

export default class VB_QB_Reconciliation_UI extends LightningElement {
    
    @track fileData = [];
    @track loading = false;
    @track MapData = [];
    @track pageReady = false;
    @track _rows = [];
    @track _results;
    @track recordsReadyToView = false;

    @track reconcile_progress = 0;
    @track reconcile_status = 'Not Started';
    @track reconcile_in_progress = false;

    @track lastReconcileDate
    @track reconciliationRecordId;
    @track usePushTopicEvent = true
    @track pushTopicName = 'QuickbooksReconciliation'
    @track lastReconcileRecord 


    get columns(){
        const columns = [
            {label : 'Invoice Number', fieldName : 'Invoice_Number__c', type : 'text'},
            {label : 'Account Name', fieldName : 'Account_Name__c', type : 'text'},
            {label : 'Invoice Date', fieldName : 'Invoice_Date__c', type : 'date'},
            {label : 'Paid Status', fieldName : 'Paid_Status__c', type : 'text'},
            {label : 'Class', fieldName : 'Class__c', type : 'text'},
            {label : 'Open Balance', fieldName : 'Open_Balance__c', type : 'currency'},
            {label : 'Trans Num', fieldName : 'Trans_Num__c', type : 'test'}

        ]
        return columns
    }
    labels = {
        progressMsg: "Uploaded {0} out of {1} child account records...",
        successMsg: "Successfully uploaded {0} child accounts!",
        partialFailureMsg: "Upload process hit an unexpected error and failed to upload {0} out of {1} records!",
        failureMsg: "Upload process hit an unexpected error and couldn't upload any record!",
    };
    showProgressBar = true;


    QBMapData = {};
    ObjectInfo = {};

    parserInitialized = false;


    connectedCallback() {
        this.init()
        try {
            if (this.usePushTopicEvent) {
                // Callback invoked whenever a new event message is received
                const messageCallback = (response) => {
                    if (response != undefined && response != null) {
                        if (response["data"] != undefined && response["data"] != null &&
                            response["data"]["sobject"] != undefined && response["data"]["sobject"] != null) {
                            var sObject = response["data"]["sobject"];
                            if(sObject.Id == this.reconciliationRecordId){
                                if(sObject.Status__c == 'Failed'){
                                    this.dispatchEvent(new ShowToastEvent({
                                        title: 'Reconciliation Failed',
                                        message: 'Reconciliation Failed',
                                        variant: 'error'
                                    }));
                                }
                            }
                                
                        } else {
                            ;
                        }
                    } else {
                        ;
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
            }
            getLastReconcile()
            .then(result => {
                this.lastReconcileRecord = result;
            })
            .catch(error => {
                console.log('Error getting last reconcile record' + error);
            })
        } catch (err) {
            console.log("error inside connectedcallback =>" + err.message + err.stack);
        }
    }

    renderedCallback(){
        if(!this.parserInitialized) {
            loadScript(this, PARSER).then(() => {
                this.parserInitialized = true;
            })
            .catch(error => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error loading Script',
                    message: 'Please refresh the page',
                    variant: 'error'
                }));
            });
        }
    }
    

    @wire(getObjectInfo, { objectApiName: QUICKBOOKS_INVOICES_OBJECT })
    oppInfo({ data, error }) {
        if (data) {
            var obj = {}
            Object.values(data.fields).map((fld) => {
                let { apiName, dataType } = fld;
                obj[apiName] = dataType;
            });
            this.ObjectInfo = obj;
        }
    }

    async init() {
        // this.loading = true;
        console.log(QBMAPFILE)
        this.mapfile = await fetch(QBMAPFILE, {credentials: 'include'})
        .then(response => response.text());
        
        
        this.QBMapData = this.cleanupMapFile(this.mapfile);
        this.pageReady = true;

    }

    appendLeadingZeroes(n){
        if(n <= 9){
          return "0" + n;
        }
        return n
    }

    cleanUpRecords(records) {
        var data = [];
        //if Name or Num is blank, skip
        try {
            for(let i = 0; i < records.length; i++) {
                var object ={};
                for(let j = 0; j < Object.keys(records[i]).length; j++) {
                    if(Object.keys(records[i])[j] != '') {
                        // replace the key with its map value
                        let oldKey = Object.keys(records[i])[j]
                        let newKey = this.QBMapData[oldKey]
                        let value = records[i][oldKey]

                        if((newKey == 'Invoice_Number__c' && !value.includes('INV')) || (newKey == 'Account_Name__c' && value.length == 0)) {
                            object = {};
                            break;
                        }
                        // check the new key agains the object info and if the type is a date, convert it to a date
                        if(this.ObjectInfo[newKey] == 'Date') {
                            var date_test = new Date(value)
                            value =  date_test.getFullYear() + "-" + this.appendLeadingZeroes(date_test.getMonth() + 1) + "-" + this.appendLeadingZeroes(date_test.getDate())
                            value = new String(value)
                        } else if(this.ObjectInfo[newKey] == 'DateTime') {
                            var date_test = new Date(value)
                            value =  date_test.getFullYear() + "-" + (date_test.getMonth() + 1) + "-" + (date_test.getDate()) + "T" + (date_test.getHours()) + ":" + (date_test.getMinutes()) + ":" + (date_test.getSeconds())
                            value = new String(value)
                        }

                        object[newKey] = value;
                    }
                }
                if(Object.keys(object).length > 0)
                    data.push(object);
            }
            return data;
        } catch(e) {
            //  show toast

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error mapping fields',
                    message: 'Error mapping fields, Please check the file format',
                    variant: 'error'
                })
            );
            
        }
    }
    // cleanupMapFile
    cleanupMapFile(mapFile) {
        var data = [];
        var object = {};
        try{
            for(let i = 0; i < mapFile.split('\r\n').length; i++) {
                if(mapFile.split('\r\n')[i][0] == '#' || mapFile.split('\r\n')[i] == '') 
                    continue;
                
                var currentLine = mapFile.split('\r\n')[i]
                // split the line using = and make the first part key and second one value
                object[String(currentLine.split('=')[0]).replaceAll('\\', '')] = currentLine.split('=')[1];
                
            }
            return object;
        } catch(e) {
            //  show toast

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error setting up file, Please check the file fields',
                    variant: 'error'
                })
            );
        }
    }

    feedLastReconcileDate() {
        // now
        var now = new Date();
        var year = now.getFullYear();
        var month = now.getMonth();
        var day = now.getDate();
        var hour = now.getHours();
        var minute = now.getMinutes();
        var second = now.getSeconds();
        //time zone
        var timezone = now.getTimezoneOffset();
        // EST
        var lastReconcileDate = year + "-" + this.appendLeadingZeroes(month + 1) + "-" + this.appendLeadingZeroes(day) + "T" + this.appendLeadingZeroes(hour) + ":" + this.appendLeadingZeroes(minute) + ":" + this.appendLeadingZeroes(second);
        // var lastReconcileDate = '2017-12-06T18:46:00.000Z'
        this.lastReconcileDate = lastReconcileDate;
        
        //update all the records with the last reconcile date
        this.rows.forEach(row => {
            row.Last_Reconcile__c = lastReconcileDate;
        });
    }

    handleFileChange(event) {
        this._rows = [];
        this.recordsReadyToView = false
        if(event.target.files.length > 0) {
            this.loading = true;
            const file = event.target.files[0];
            Papa.parse(file, {
                quoteChar: '"',
                header: 'true',
                complete: (results) => {
                    this._rows = this.cleanUpRecords(results.data);
                    this.dispatchEvent( new ShowToastEvent({
                        title: 'Success',
                        message: 'File uploaded successfully',
                        variant: 'success'
                    }));
                    this.loading = false;
                },
                error: (err) => {
                    this.dispatchEvent( new ShowToastEvent({
                        title: 'Error',
                        message: 'Error parsing file, Please check the file format',
                        variant: 'error'
                    }));
                    this.loading = false;
                }
            })
            var table = this.template.querySelector('c-v-b_-q-b_-record_-table');
            this.reloadTable();
        }
    }

    closeModal(event) {
        this.reconcile_in_progress = false;
    }

    reloadTable(){
        // make rows undefiend for 100ms to allow the table to render
        setTimeout(() => {
            this.recordsReadyToView = true;
        },  100);

    }

    handleCancel(event) {
        this.reconcile_in_progress = false;
        this._rows = [];
        this.recordsReadyToView = false
    }
    handleFinish(e){
        this.closeModal
        this.handleCancel(e)
        // refresh last reconcile date
        getLastReconcile()
        .then(result => {
            console.log(result)
            this.lastReconcileRecord = result;
        })
        .catch(error => {
            console.log('Error getting last reconcile record' + error);
        })
    }

    handleReconcile(event) {
        this.feedLastReconcileDate()
        this.loading = true;
        if(!this.rows)
            return
        this.reconcile_in_progress = true;
        this.reconcile_status - 'Uploading Quickbooks Invoices';
        this.reconcile_progress = 0;

        try{
            NewReconciliation()
            .then(data => {
                console.log('Result: ', data)
                this.reconciliationRecordId = data.Id;
                var id = data.Id;
                // console.log(JSON.stringify(this.rows))
                Reconcile_Records({JSON_Invoice_Records : JSON.stringify(this.rows), reconciliation_record_id : id})
                .then(result => {
                    console.log('Job Sent' + result);
                })
                .catch(error => {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: 'Error',
                            message: 'Upload Failed',
                            variant: 'error'
                        })
                    );
                });
            })
            this.loading = false;
        } catch(e) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: 'Error Reconciling, Please contact your administrator',
                    variant: 'error'
                })
            );
            // close modal
            this.closeModal();
        }
    }


    get rows(){
        if(this._rows.length === 0)
            return null;
        if(this._rows && this.recordsReadyToView) {
            return this._rows.map((row, index) => {
                row.key = index;
                return row;
            });
            return [];
        }
    }

    get results(){
        if(this._results){
            return this._results.map(r => {
                const results = {};
                result.success = r.status === 'fulfilled';
                result.id = result.success ? r.value.id : undefined;
                result.error = !result.success ? r.reason.body.message : undefined;
                return result;
            })
        }
    }
    
    get papaReady(){
        return !this.parserInitialized
    }

    get getLastReconcileDate(){
        return new Date(Date.parse(this.lastReconcileRecord.CreatedDate));
    }

    registerErrorListener() {
        // Invoke onError empApi method
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
            
        });
    }
    
}