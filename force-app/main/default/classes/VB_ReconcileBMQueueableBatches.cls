public with sharing class VB_ReconcileBMQueueableBatches implements Queueable {
    Map<Integer, List<Billable_Milestone__c>> records;
    private Integer batchSize;
    private Integer currentBatch;
    private String finallyHandlerName;
    private Id parentId;
    private Integer successCount;
    private string debug_log;
    class CustomException extends Exception{}

    // start 
    public VB_ReconcileBMQueueableBatches(List<String> InvoiceNumbers, Integer batchSize, Id parentId, string finallyHandlerName) {
        List<Billable_Milestone__c> all_records = [SELECT Id, Invoice_Number__c, ForceEdit__c FROM Billable_Milestone__c WHERE Invoice_Number__c IN :InvoiceNumbers AND Invoice_Date__c > 2020-12-31];
        this.records = batchOutDmls(all_records, batchSize);
        this.batchSize = batchSize;
        this.parentId = parentId;
        this.currentBatch = 1;
        this.successCount = 0;
        this.debug_log = 'Initializing VB_ReconcileBMQueueableBatches with ' + all_records.size() + ' records';
        this.debug_log += '  *working on batch ' + this.currentBatch + ' <br/>';
    }


    ///  queuable batches
    public VB_ReconcileBMQueueableBatches(Map<Integer, List<Billable_Milestone__c>> records, Integer batchSize, Integer currentBatch, String finallyHandlerName, Id parentId, Integer successCount){
        this.records = records;
        this.batchSize = batchSize;
        this.currentBatch = currentBatch;
        this.parentId = parentId;
        this.successCount = successCount;
        this.debug_log = 'Initializing VB_ReconcileBMQueueableBatches with ' + records.size() + ' records';
        this.debug_log = '  *working on batch ' + this.currentBatch + ' <br/>';

    }

    public void execute(QueueableContext context){
        this.debug_log += '  *Executing VB_ReconcileBMQueueableBatches';
        List<Map<String, String>> failedBms = new List<Map<String, String>>();
        List<String> failedIds = new List<String>();
        // Map<Id, List<Database.Error>> failed = new Map<Id, List<Database.Error>>(); 
        if(this.records.containsKey(this.currentBatch)){
            Boolean success = false;
            Integer processedRecords = 0;
            try{
                List<Billable_Milestone__c> thisBatchRecords = this.records.get(this.currentBatch);
                processedRecords = thisBatchRecords.size();
                this.debug_log += '  *Forcing edit process for the bms in this batch <br/>';
                for(Billable_Milestone__c rec : thisBatchRecords){
                    rec.Name = 'Force Edit By Reconcile';
                }
                
                Database.SaveResult[] updateResult = Database.update(thisBatchRecords, false);
                for(Database.SaveResult result : updateResult){
                    if(result.isSuccess()){
                        this.successCount++;
                        
                    } else {
                        for(Database.Error err : result.getErrors()) {
                            Map<String, String> error = new Map<String, String>();
                            System.debug('The following error has occurred.');                    
                            System.debug(err.getStatusCode() + ': ' + err.getMessage());
                            System.debug('Account fields that affected this error: ' + err.getFields());
                            error.put('Id', String.valueOf(result.getId()));
                            error.put('Error', err.getMessage());
                            error.put('Field', err.getFields().toString());
                            error.put('Status Code', String.valueOf(err.getStatusCode()));
                            failedIds.add(result.getId());
                            failedBms.add(error);
                        }
                    }

                }
                List<Billable_Milestone__c> failedBmsList = [SELECT Id, Account__c, ForceEdit__c FROM Billable_Milestone__c WHERE Id IN :failedIds];
                for(Map<String, String> error : failedBms){
                    for(Billable_Milestone__c failedBm : failedBmsList){
                        if(failedBm.Id == error.get('Id')){
                            error.put('Name', failedBm.Account__c);
                        }
                    }
                }
                // system.debug('Startting Error Log');
                // for(integer i = 0; i < 10; i++){
                //     Map<String, String> error = new Map<String, String>();
                //     error.put('Id', '14536061 ' + i);                   
                //     error.put('Error', 'err.getMessage()');
                //     error.put('Field', 'err.getFields().toString()');
                //     error.put('Status Code', 'String.valueOf(err.getStatusCode())');
                //     failedBms.add(error);
                // }
                this.records.remove(this.currentBatch);
                success = true;
            } catch(Exception e){
                this.debug_log += '  <br/>******************<br/>';
                this.debug_log += '  *Exception in VB_ReconcileBMQueueableBatches: ' + e.getMessage() + '<br/>';
                System.debug('Exception in queueable jobs chain ==> '+e.getMessage());
            }
            
            if(success){
                VB_QB_Reconciliation_Controller.handleSingleBMBatchCompletion(this.parentId, this.successCount, failedBms);
            }

            Integer nextBatch = this.currentBatch + 1;
            this.debug_log += '  *Next batch is ' + nextBatch;
            if(this.records.containsKey(nextBatch) && Limits.getQueueableJobs() < Limits.getLimitQueueableJobs()){
                this.debug_log += 'Creating new VB_ReconcileBMQueueableBatches for next batch <br/>';
                try{
                    this.debug_log += '  *Enqueuing new VB_ReconcileBMQueueableBatches for next batch <br/>';
                    System.enqueueJob(new VB_ReconcileBMQueueableBatches(this.records,  this.batchSize, nextBatch, this.finallyHandlerName, this.parentId, this.successCount));
                }catch(Exception e){
                    System.debug('Exception in queueable jobs chain ==> '+e.getMessage());
                }
            }
            system.debug('Debug log for VB_ReconcileBMQueueableBatches: ' + this.debug_log);
            VB_QB_Reconciliation_Controller.handleAllBMJobsCompletion(this.parentId, this.successCount, this.debug_log);
        }
    }

    public Map<Integer, List<Billable_Milestone__c>> batchOutDmls(List<Billable_Milestone__c> recordList, Integer batchSize) {
        Map<Integer, List<Billable_Milestone__c>> batchMap = new Map<Integer, List<Billable_Milestone__c>>();
        if(batchSize <= 10000){
            Integer batchCurrentSize = 0;
            Integer batchNumber = 1;
            List<Billable_Milestone__c> singleBatch = new List<Billable_Milestone__c>();
            for(Integer i = 0; i < recordList.size(); i++){
                if(batchCurrentSize == batchSize){
                    batchMap.put(batchNumber, singleBatch);
                    singleBatch = new List<Billable_Milestone__c>();
                    batchCurrentSize = 0;
                    batchNumber++;
                }
                singleBatch.add(recordList.get(i));
                batchCurrentSize++;
            }
            if(singleBatch.size() > 0){
                system.debug('singleBatch.size() > 0');
                batchMap.put(batchNumber, singleBatch);
            }
        } else {
             throw new CustomException('Batch size is too large');
        }
        return batchMap;
    }

}