import { LightningElement, api, track } from 'lwc';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import GetReconciliationRecord from '@salesforce/apex/VB_QB_Reconciliation_Controller.getReconciliationRecord';
import {exportCSVFile} from './utils'

const columns = [
    { label : 'Id', fieldName : 'Id', type : 'text' },
    { label : 'Name', fieldName : 'Name', type : 'text' },
    { label : 'Error', fieldName : 'Error', type : 'text'},
    { label : 'Status Code', fieldName : 'Status Code', type : 'text'},
]
export default class VB_QB_Progress_Bar extends LightningElement {
    @api size   
    @api variant
    @api containerClass
    @api progressCountMsg
    @api successMsg
    @api partialFailMsg
    @api failureMsg
    @api sectionHeader
    @api hideWhenProcessComplete
    @api freezeWhenProcessFails
    @api initialSobjecRecord
    @api recordId


    @api usePushTopicEvent;
    @api pushTopicName;

    @track status = 'Waiting for Server'
    @track failed_bms_count = 0;
    @track failed_bms = [];
    @track upload_total_count
    @track upload_current_count
    @track reconcile_total_count
    @track reconcile_current_count
    @track val = 0
    @track successfull = false
    @track done = false
    columns = columns;



    progressTotalValue = 0; 
    progressCurrentValue = 0;
    processRunning = true;
    processComplete = false;
    processFailed = false;
    processPartiallyFailed = false;
    processError = false;
    isInitialized = false;
    hasRendered = false;

    errorHeaders = {
        Id : 'Id',
        Name : 'Name',
        Error : 'Error',
        'Status Code' : 'Status Code'
    }

    get showSpinner() {
        return this.processRunning;
    }

    get progressHolderClass() {
        return (this.processRunning ? "progressHolder slds-p-left_small usepartial" : "progressHolder slds-p-left_small usefull");
    }

    get showError(){
        if(this.failed_bms.length > 0){
            return true;
        }
    }


    get progressText() {
        return this.progressCountMsg
    }

    get getStatus(){
        var status = '';
        if(this.status != undefined && this.status != null && this.status != ''){
            status = 'Status: ' + this.status;
        }
        return status;
    }

    get showProgressBar() {
        // var show;
        // if (this.processError) {
        //     show = false;
        // } else if (this.processPartiallyFailed && this.freezeWhenProcessFails) {
        //     show = true;
        // } else if (this.processCompleted && this.hideWhenProcessComplete) {
        //     show = false;
        // } else if ((this.progressTotalValue > 0 && this.progressCurrentValue > 0) || this.processRunning) {
        //     show = true;
        // } else {
        //     show = false;
        // }
        // return show;
        return true;
    }

    get cssClassNames() {
        var classNames = "";
        if (this.containerClass != undefined) {
            classNames = this.containerClass;
        }
        return classNames;
    }

    connectedCallback() {
        if (!this.isInitialized) {
            this.isInitialized = true;
            try {
                if (this.usePushTopicEvent) {
                    // Callback invoked whenever a new event message is received
                    const messageCallback = (response) => {
                        console.log('New message received: ', JSON.stringify(response));
                        if (response != undefined && response != null) {
                            if (response["data"] != undefined && response["data"] != null &&
                                response["data"]["sobject"] != undefined && response["data"]["sobject"] != null) {
                                var sObject = response["data"]["sobject"];
                                if(sObject.Id == this.recordId)
                                {
                                    GetReconciliationRecord({ parentId: sObject.Id })
                                    .then(result => {
                                        this.actOnEvent(result, true);
                                    })
                                }
                            } else {
                                this.processError = true;
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
                }
            } catch (err) {
                console.log("error inside connectedcallback =>" + err.message + err.stack);
            }
        }
 
    }

    renderedCallback() {
        if (!this.hasRendered) {
            this.hasRendered = true;
            if (this.usePushTopicEvent && this.initialSobjectRecord != undefined) {
                this.actOnEvent(this.initialSobjectRecord, false);
            }
        }
        
    }

    actOnEvent(sObject, onMessageCallback) {
        try {
            this.status = sObject.Status__c;
            switch (sObject.Status__c) {
                case 'In Progress':
                    this.processRunning = true;
                    // this.val = 70;
                    break;

                case 'QB Invoices Upsert Partially Successful':
                    this.processRunning = true;
                    this.upload_total_count__c = sObject.Upload_Total_Count__c ;
                    this.upload_current_count__c = sObject.Upload_Success_Count__c;
                    this.val = (parseInt(this.upload_current_count__c) / parseInt(this.upload_total_count__c)) * 100;
                    this.progressCountMsg = "Uploaded " + this.upload_current_count__c + " of " + this.upload_total_count__c + " Invoices";
                    break;
                case 'QB Invoices Upsert Successful':
                    this.processRunning = true;   
                    this.status = 'QB Invoices Upsert Successful  .... Starting Billable Milestones Reconcile'          
                    this.upload_total_count__c = sObject.Upload_Total_Count__c ;
                    this.upload_current_count__c = sObject.Upload_Success_Count__c;  
                    this.val = (parseInt(this.upload_current_count__c) / parseInt(this.upload_total_count__c)) * 100;    
                    this.progressCountMsg = "Uploaded " + this.upload_current_count__c + " of " + this.upload_total_count__c + " Invoices";     
                    break;
                
                case 'Starting Billable Milestones':
                    this.processRunning = true;  
                    this.reconcile_total_count__c = sObject.BM_Total_Count__c;
                    this.reconcile_current_count__c = sObject.BM_Success_Count__c; 
                    this.val = (parseInt(this.reconcile_current_count__c) / parseInt(this.reconcile_total_count__c)) * 100; 
                    this.progressCountMsg = "Starting Billable Milestones Reconciliation";                 
                    break;


                case 'Reconcile Partially Successful':
                    this.processRunning = true; 
                    let failedStr = sObject.Failed_Bms__c;

                    if(failedStr != undefined && failedStr != null && failedStr != ''){                          
                        this.failed_bms = JSON.parse(failedStr); 
                    }
                    if(this.failed_bms.length + this.reconcile_current_count__c == this.reconcile_total_count__c){
                        this.processRunning = false;
                        this.done = true;
                    }

                    this.reconcile_total_count__c = sObject.BM_Total_Count__c;
                    this.reconcile_current_count__c = sObject.BM_Success_Count__c;  
                    this.val = ((parseInt(this.reconcile_current_count__c)  + parseInt(this.failed_bms.length))/ parseInt(this.reconcile_total_count__c)) * 100;  
                    if(this.failed_bms.length > 0){
                        this.progressCountMsg = "Reconciled " + this.reconcile_current_count__c + " of " + this.reconcile_total_count__c + " Billable Milestones with " + this.failed_bms.length + " failure(s)";
                    }else{
                        this.progressCountMsg = "Reconciled " + this.reconcile_current_count__c + " of " + this.reconcile_total_count__c + " Billable Milestones";             
                    }
                    break;


                case 'Reconcile Successful':
                    this.processRunning = false;   
                    this.successfull = true;
                    let failed = sObject.Failed_Bms__c;
                    this.done = true;

                    if(failed != undefined && failed != null && failed != ''){                          
                        this.failed_bms = JSON.parse(failed); 
                    }  
                    this.reconcile_total_count__c = sObject.BM_Total_Count__c;
                    this.reconcile_current_count__c = sObject.BM_Success_Count__c;     
                    this.val = ((parseInt(this.reconcile_current_count__c) +  parseInt(this.failed_bms.length)) / parseInt(this.reconcile_total_count__c)) * 100; 
                    if(this.failed_bms.length > 0)
                        this.progressCountMsg = "Reconciled " + this.reconcile_current_count__c + " of " + this.reconcile_total_count__c + " Billable Milestones with " + this.failed_bms.length + " failed Billable Milestones";
                    else
                        this.progressCountMsg = "Reconciled " + this.reconcile_current_count__c + " of " + this.reconcile_total_count__c + " Billable Milestones";             
                    break

                case 'Failed':
                    let fail = sObject.Failed_Bms__c;
                    this.done = true;

                    if(fail != undefined && fail != null && fail != ''){                          
                        this.failed_bms = JSON.parse(fail); 
                    }  
                    this.processRunning = false;      
                    this.reconcile_total_count__c = sObject.BM_Total_Count__c;
                    this.reconcile_current_count__c = sObject.BM_Success_Count__c;          
                    this.val = 0;
                    this.progressCountMsg = "Please check the file format and try again, more information in the log section in this reconcile's record : " + sObject.Id;
                    break;


                default:
                    break;
            }
            
        } catch (err) {
            this.processError = true;
        };
    }

    registerErrorListener() {
        // Invoke onError empApi method
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
            this.processError = true;
        });
    }

    errorCallback(error, stack) {
        console.log('errorCallback error=' + error + stack);
    }

    showToast(variant, title, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
                message: message
            })
        );
    }

    showStickyToast(variant, title, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
                message: message,
                mode: "sticky"
            })
        );
    }

    handleFinsih(){
        const evt = new CustomEvent('finish', {
            detail: {
                message: 'Finished'
            }
        });
        this.dispatchEvent(evt);
    }

    downloadErrorReport(){
        exportCSVFile(this.errorHeaders, this.failed_bms, 'error_report.csv');
    }
}