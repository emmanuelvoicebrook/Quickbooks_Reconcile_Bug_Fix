@isTest
public class TestVB_QB_Reconciliation_Controller{

	// @testSetup static void setup(){
		
	// }

	@isTest static void test_init() {
		try{
		string json_records = '[{"PO__c":"9184","Account_Name__c":"VA - West Palm","Invoice_Number__c":"INV98667","Class__c":"Billing Milestones:M&S Renewal","Trans_Num__c":"35565","QB_Last_Modified__c":"2022-05-13T16:47:00.000Z","QB_Last_Modified_By__c":"Timorae Waite","Invoice_Date__c":"2022-05-13","Paid_Status__c":"Unpaid","Invoice_Amount__c":"13215","Aging__c":"567","Open_Balance__c":"13215","key":0,"Last_Reconcile__c":"2022-06-01T13:11:47"},{"PO__c":"7022022510","Account_Name__c":"Northwell Health (NSLIJ)","Invoice_Number__c":"INV98668","Class__c":"","Trans_Num__c":"35566","QB_Last_Modified__c":"2022-05-13T17:05:00.000Z","QB_Last_Modified_By__c":"Timorae Waite","Invoice_Date__c":"2022-05-13","Paid_Status__c":"Unpaid","Invoice_Amount__c":"13215","Aging__c":"597","Open_Balance__c":"750","key":1,"Last_Reconcile__c":"2022-06-01T13:11:47"},{"PO__c":"","Account_Name__c":"Clinical Labs of the Black Hills","Invoice_Number__c":"INV98660","Class__c":"Billing Milestones:Existing (Order)","Trans_Num__c":"35552","QB_Last_Modified__c":"2022-05-12T10:33:00.000Z","QB_Last_Modified_By__c":"Timorae Waite","Invoice_Date__c":"2022-05-12","Paid_Status__c":"Unpaid","Invoice_Amount__c":"13215","Aging__c":"598","Open_Balance__c":"6938.69","key":2,"Last_Reconcile__c":"2022-06-01T13:11:47"}]';
		List<Quickbooks_Invoice__c> invoices = (List<Quickbooks_Invoice__c>) JSON.Deserialize(json_records, List<Quickbooks_Invoice__c>.class);
		
		Quickbooks_Reconciliation__c recon = VB_QB_Reconciliation_Controller.createReconciliationRecord();
		Test.startTest();
			VB_QB_Reconciliation_Controller.init_reconciliation(json_records, recon.Id);
		Test.stopTest();
		}catch(Exception e){
			//do nothing for now	
		}
		// code_block	
	}

	@isTest
	static void test_handleSingleBatch(){
		Quickbooks_Reconciliation__c recon = new Quickbooks_Reconciliation__c();
		recon.Upload_Total_Count__c = 200;
		insert recon;
		List<String> new_invoices = new List<String>();
		List<String> updated_invoices = new List<String>();
		Test.startTest();
			VB_QB_Reconciliation_Controller.handleSingleBatchCompletion(recon.Id, 200, new_invoices, updated_invoices);
			new_invoices.add('INV98667');
			updated_invoices.add('INV98667');
			VB_QB_Reconciliation_Controller.handleSingleBatchCompletion(recon.Id, 200, new_invoices, updated_invoices);
		Test.stopTest();

	}
	
	@isTest
	static void test_handleSingleBMBatch(){
		Quickbooks_Reconciliation__c recon = VB_QB_Reconciliation_Controller.createReconciliationRecord();
		recon.BM_Total_Count__c = 200;
		List<Map<String, String>> failedBms = new List<Map<String, String>>();
		Map<String, String> failedBm = new Map<String, String>();
		failedBm.put('Error', '9184');
		failedBm.put('Error_Message', 'Error Message');
		failedBms.add(failedBm);
		update recon;
		Test.startTest();
			VB_QB_Reconciliation_Controller.handleSingleBMBatchCompletion( recon.Id, 200,failedBms);
		Test.stopTest();
		
	}

	
	@isTest
	static void test_handleAllBMJobs(){
		Quickbooks_Reconciliation__c recon = VB_QB_Reconciliation_Controller.createReconciliationRecord();
		string debug = 'debug';

		Test.startTest();
			VB_QB_Reconciliation_Controller.handleAllBMJobsCompletion( recon.Id, 200, debug);
		Test.stopTest();
		
	}
	
	@isTest
	static void test_handleAllJobs(){
		Quickbooks_Reconciliation__c recon = VB_QB_Reconciliation_Controller.createReconciliationRecord();
		string debug = 'debug';
		Test.startTest();
			VB_QB_Reconciliation_Controller.handleAllJobsCompletion( recon.Id, 200, debug);
		Test.stopTest();
		
	}

	@isTest 
	static void test_handleBMReconStart(){
		Quickbooks_Reconciliation__c recon = VB_QB_Reconciliation_Controller.createReconciliationRecord();
		Test.startTest();
			VB_QB_Reconciliation_Controller.handleBMReconciliationStart( recon.Id);
		Test.stopTest();

	}

	@isTest
	static void test_handleKill(){
		Quickbooks_Reconciliation__c recon = VB_QB_Reconciliation_Controller.createReconciliationRecord();
		string debug = 'debug';
		Test.startTest();
			VB_QB_Reconciliation_Controller.handleKillJob( recon.Id, debug);
		Test.stopTest();
		
	}

	@isTest
	static void test_getReconciliationRecord(){
		Quickbooks_Reconciliation__c recon = VB_QB_Reconciliation_Controller.createReconciliationRecord();
		Quickbooks_Reconciliation__c recon1 = VB_QB_Reconciliation_Controller.getReconciliationRecord( recon.Id);
		Test.startTest();
			System.assertEquals(recon.Id, recon1.Id);
		Test.stopTest();
		
	}

	@isTest
	static void test_getLatestReconciliation(){
		Quickbooks_Reconciliation__c recon = VB_QB_Reconciliation_Controller.createReconciliationRecord();
		Quickbooks_Reconciliation__c recon1 = VB_QB_Reconciliation_Controller.getLastRecocile();
		Test.startTest();
			System.assertEquals(recon.Id, recon1.Id);
		Test.stopTest();
		
	}



}