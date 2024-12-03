public without sharing class VB_QB_Reconciliation_Controller {

    // create a list of ALL Invoices currently in the system
    class CustomException extends Exception{}
    private static List<String> allInvoicesNumbers = new List<String>();

    /**
     * Intiates the reconciliation process
     * @param {string} Invoice_Records - The list of invoices to reconcile
     * @return {boolean} - True if the process was successful
    */
    @AuraEnabled
    public static ApexResponse init_reconciliation(string JSON_Invoice_Records, string reconciliation_record_id) {
        string debug_log = 'Starting the Process \\n';
        ApexResponse response = new ApexResponse();
        try {
            //print the JSON string to the console
            // convert the list of invoices to a list of invoice objects
            debug_log += 'Converting JSON to Invoice Objects \\n';
            List<Quickbooks_Invoice__c> Invoice_Records = (List<Quickbooks_Invoice__c>) JSON.deserialize(JSON_Invoice_Records, List<Quickbooks_Invoice__c>.class);
            debug_log += 'Converted JSON to Invoice Objects \\n';
            // iterate through the list of invoices and add each invoice to the list of all invoices

            debug_log += 'Iterating through Invoice Records\\n';
            for (Quickbooks_Invoice__c invoice : Invoice_Records) {
                allInvoicesNumbers.add(invoice.Invoice_Number__c);
            }

            // upsert the list of invoice objects
            debug_log += 'Enqueueing job\\n';
            if(!Invoice_Records.isEmpty()) {
                System.enqueueJob(new VB_ExecuteQBInvoicesDmlQueuableBatches(Invoice_Records,200,reconciliation_record_id, null, allInvoicesNumbers));
                Quickbooks_Reconciliation__c reconciliation = updateCurrentStatusinParent(reconciliation_record_id, Invoice_Records.size(), 0,'In Progress', allInvoicesNumbers, null, null, null);
                response.status = true;
                response.message = 'Reconciliation started';
            } else {

                throw new CustomException('No accounts to upload!');
            }

        } catch (Exception e) {
            Quickbooks_Reconciliation__c recon = [SELECT Id, Debug_Logs__c, Status__c FROM Quickbooks_Reconciliation__c WHERE Id = :reconciliation_record_id];
            recon.Status__c = 'Failed';
            if(recon.Debug_Logs__c == null) {
                recon.Debug_Logs__c = '<br/>****************<br/>';
                recon.Debug_Logs__c =+ '<br/>Process Failed : ' + e.getMessage() + '<br/>';
            } else {
                recon.Debug_Logs__c =+ '<br/>****************<br/>';
                recon.Debug_Logs__c =+ '<br/>Process Failed : ' + e.getMessage() + '<br/>';
            }
            update recon;
            system.debug('Recon: ' + recon);
        }
        return response;
    }

    public static void handleSingleBatchCompletion(Id parentId, Integer successCount, List<String> new_invoices, List<String> updated_invoices){
        system.debug('updated invoices: ' + updated_invoices);
        system.debug('new invoices: ' + new_invoices);
        updateCurrentStatusinParent(parentId, null, successCount, 'In Progress', null, new_invoices, updated_invoices, null);
    }
    public static void handleSingleBMBatchCompletion(Id parentId, Integer successCount, List<Map<String, String>> failedBms ){
        system.debug('handleSingleBMBatchCompletion' + parentId + ' ' + successCount + ' With failed BMs: ' + failedBms.size());
        updateBMStatusinParent(parentId, successCount, 'Reconcile Partially Successful', null, failedBms);
    }

    public static void handleAllJobsCompletion(Id parentId, Integer successCount, string debug_logs){
        updateCurrentStatusinParent(parentId, null, successCount, 'COMPLETED', null, null, null, debug_logs);
    }

    public static void handleAllBMJobsCompletion(Id parentId, Integer successCount, string debug_logs){
        system.debug('handleAllBMJobsCompletion' + parentId + ' ' + successCount);
        updateBMStatusinParent(parentId, successCount, 'COMPLETED', debug_logs, null);
    }
    
    public static void handleBMReconciliationStart(Id parentId){
        Quickbooks_Reconciliation__c parentUpdate = [SELECT Id FROM Quickbooks_Reconciliation__c WHERE Id = :parentId];
        updateBMStatusinParent(parentUpdate.Id,  null, 'Starting Billable Milestones', null, null);
    }

    public static void handleKillJob(Id parentId, string debug_logs){
        Quickbooks_Reconciliation__c parentUpdate = [SELECT Id,Status__c FROM Quickbooks_Reconciliation__c WHERE Id = :parentId];
        parentUpdate.Status__c = 'Failed';
        update parentUpdate;
    }

    private static Quickbooks_Reconciliation__c updateBMStatusinParent(Id parentId, Integer successCount, string status, string debug_logs, List<Map<String, String>> failedBms){
        Quickbooks_Reconciliation__c parentUpdate = [SELECT Id,Upload_Total_Count__c, Failed_Bms__c, Debug_Logs__c, BM_Total_Count__c,Upload_Success_Count__c FROM Quickbooks_Reconciliation__c WHERE Id = :parentId];
        
        
        parentUpdate.BM_Success_Count__c = successCount;
        parentUpdate.Status__c = status;
        if(failedBms != null ){
            try {

                List<Map<String, String>> allFailedBms = new List<Map<String, String>>();
                if(parentUpdate.Failed_Bms__c != null && parentUpdate.Failed_Bms__c != '')
                    allFailedBms = (List<Map<String, String>>) JSON.deserialize(parentUpdate.Failed_Bms__c, List<Map<String, String>>.class);
                allFailedBms.addAll(failedBms);
                Set<Map<String, String>> failedBmsSet = new Set<Map<String, String>>(allFailedBms);
                List<Map<String, String>> failedBmsList = new List<Map<String, String>>(failedBmsSet);

                parentUpdate.Failed_Bms__c = JSON.serialize(failedBmsList);
            } catch (Exception e) {
                // Do nothing if the failed bms are not in JSON forma
                
            }
        }
        if(status == 'COMPLETED'){
            if(parentUpdate.BM_Total_Count__c == successCount){
                parentUpdate.Status__c = '	Reconcile Successful';
            } else if(successCount == null || successCount == 0){
                parentUpdate.Status__c = 'Failed';
            } else {
                parentUpdate.Status__c= 'Reconcile Partially Successful';
            }
        } else {
            parentUpdate.Status__c = status;
        } 

        if(debug_logs != null){
            if(parentUpdate.Debug_Logs__c == null){
                parentUpdate.Debug_Logs__c = debug_logs;
            } else {
                parentUpdate.Debug_Logs__c += debug_logs;
            }
        }
        system.debug('Parent Update: ' + parentUpdate);
        system.debug('updateBMStatusinParent BM total: ' + parentUpdate.BM_Total_Count__c);
        
        update parentUpdate;
        return parentUpdate;
    }
    private static List<String> removeDuplicates(List<String> list_with_duplicates) {
        Set<String> cleanSet = new Set<String>();
        List<String> newList = new List<String>();
        cleanSet.addAll(list_with_duplicates);
        newList.addAll(cleanSet);
        return newList;
    }

    private static Quickbooks_Reconciliation__c updateCurrentStatusinParent(Id parentId, Integer totalCount, Integer successCount, String status, List<String> Invoice_Numbers, List<String> new_invoices, List<String> updated_invoices, string debug_logs){
        try{
            Quickbooks_Reconciliation__c parentUpdate = [SELECT Id,Upload_Total_Count__c, Failed_Bms__c, Debug_Logs__c, New_Invoices__c,Updated_Invoices__c, Upload_Success_Count__c FROM Quickbooks_Reconciliation__c WHERE Id = :parentId];

            if(totalCount != null){
                parentUpdate.Upload_Total_Count__c = totalCount;
            }
            if(Invoice_Numbers != null){
                List<Billable_Milestone__c> bms = [SELECT Id FROM Billable_Milestone__c WHERE Invoice_Number__c IN :Invoice_Numbers  AND Invoice_Date__c > 2020-12-31];
                system.debug('bms: ' + bms.size());
                parentUpdate.BM_Total_Count__c = bms.size();
            }

            if(new_invoices != null){
                system.debug('new_invoices in main: ' + new_invoices);
                try{
                    List<String> existing_list = (List<String>) JSON.deserialize(parentUpdate.New_Invoices__c, List<String>.class);
                    existing_list.addAll(new_invoices);
                    parentUpdate.New_Invoices__c = JSON.serialize(removeDuplicates(existing_list));
                }
                catch(Exception e){
                    parentUpdate.New_Invoices__c = JSON.serialize(removeDuplicates(new_invoices));
                }
            }

            if(debug_logs != null){
                if(parentUpdate.Debug_Logs__c == null){
                    parentUpdate.Debug_Logs__c = debug_logs;
                } else {
                    parentUpdate.Debug_Logs__c += debug_logs;
                }
            }
            if(updated_invoices != null && (parentUpdate.Updated_Invoices__c != null || parentUpdate.Updated_Invoices__c != '')){
                try{
                    system.debug('updated_invoices in main: ' + updated_invoices);
                    List<String> existing_list = (List<String>) JSON.deserialize(parentUpdate.Updated_Invoices__c, List<String>.class);
                    existing_list.addAll(updated_invoices);
                    parentUpdate.Updated_Invoices__c = JSON.serialize(removeDuplicates(existing_list));
                } catch(Exception e){
                    parentUpdate.Updated_Invoices__c = JSON.serialize(removeDuplicates(updated_invoices));
                }
            }
            parentUpdate.Upload_Success_Count__c = successCount;
            if(status == 'COMPLETED'){
                if(parentUpdate.Upload_Total_Count__c == successCount){
                    parentUpdate.Status__c = 'QB Invoices Upsert Successful';
                } else if(successCount == null || successCount == 0){
                    parentUpdate.Status__c = 'Failed';
                } else {
                    parentUpdate.Status__c= 'QB Invoices Upsert Partially Successful';
                }
            } else {
                parentUpdate.Status__c = status;
            }     
            system.debug('Status: ' + status);
            system.debug('parentUpdate: ' + parentUpdate);   
            update parentUpdate;
            return parentUpdate;
        } catch(Exception e){
            system.debug('Error in updateCurrentStatusinParent: ' + e);
            return null;
        }
    }
    
    @AuraEnabled
    public static Quickbooks_Reconciliation__c createReconciliationRecord(){
        Quickbooks_Reconciliation__c newReconciliation = new Quickbooks_Reconciliation__c();
        insert newReconciliation;
        return newReconciliation;
    }

    @AuraEnabled
    public static Quickbooks_Reconciliation__c getLastRecocile(){
        Quickbooks_Reconciliation__c lastReconciliation = [SELECT CreatedDate,Id FROM Quickbooks_Reconciliation__c ORDER BY CreatedDate DESC NULLS FIRST LIMIT 1];
        return lastReconciliation;
    }

    @AuraEnabled
    public static Quickbooks_Reconciliation__c getReconciliationRecord(string parentId){
        Quickbooks_Reconciliation__c reconciliation = [SELECT Id, Upload_Total_Count__c, Upload_Success_Count__c,BM_Success_Count__c, BM_Total_Count__c, Status__c, Failed_Bms__c, Debug_Logs__c, New_Invoices__c, Updated_Invoices__c FROM Quickbooks_Reconciliation__c WHERE Id = :parentId];
        return reconciliation;
    }

}