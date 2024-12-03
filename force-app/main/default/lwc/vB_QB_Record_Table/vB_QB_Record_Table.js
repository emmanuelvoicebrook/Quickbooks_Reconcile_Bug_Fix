import { LightningElement, track, api, wire } from 'lwc';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import dataTableResource from '@salesforce/resourceUrl/jQueryDatatable';
import JqueryResource from '@salesforce/resourceUrl/jQuery';

export default class VB_QB_Record_Table extends LightningElement {

    @api records;
    @track scriptLoaded = false;

    async connectedCallback() {
        console.log('connectedCallback');
        Promise.all([
            loadScript(this, JqueryResource),
            // loadScript(this, JqueryUI),
            loadScript(this, dataTableResource + '/DataTables-1.10.18/media/js/jquery.dataTables.min.js'),
            loadStyle(this, dataTableResource + '/DataTables-1.10.18/media/css/jquery.dataTables.min.css'),
        ]).then(() => {
            console.log('script loaded sucessfully');
            this.scriptLoaded = true;
            console.log('reloading records');
            const table = this.template.querySelector('.tableClass');
            // const columnNames = ['Name', 'Industry', 'Type', 'Phone', 'Rating'];
            const columnNames = ['Invoice Number', 'Account Number', 'Invoice Date', 'Paid Status', 'Invoice Amount', 'Trans Num', 'QB Last Modified'];
    
            let tableHeaders = '<thead> <tr>';
            columnNames.forEach(header => {
                tableHeaders += '<th>' + header + '</th>';
            });
            tableHeaders += '</tr></thead>';
            table.innerHTML = tableHeaders;
    
            let jqTable = $(table).DataTable();
            $('div.dataTables_filter input').addClass('slds-input');
            $('div.dataTables_filter input').css("marginBottom", "10px");
    
            this.records.forEach(rec => {
                let tableRows = [];
                tableRows.push(rec.Invoice_Number__c);
                tableRows.push(rec.Account_Name__c != undefined ? rec.Account_Name__c : '');
                tableRows.push(rec.Invoice_Date__c != undefined ? rec.Invoice_Date__c : '');
                tableRows.push(rec.Paid_Status__c != undefined ? rec.Paid_Status__c : '');
                tableRows.push(rec.Invoice_Amount__c != undefined ? rec.Invoice_Amount__c : '');    
                tableRows.push(rec.Trans_Num__c != undefined ? rec.Trans_Num__c : '');
                tableRows.push(rec.QB_Last_Modified__c != undefined ? rec.QB_Last_Modified__c: '');
                jqTable.row.add(tableRows);
            });
            jqTable.draw();
            this.removeSpinner();
        }).catch(error => {
            console.log('script load failed: ', error);
        });
    }


    removeSpinner(){
        let spinner = this.template.querySelector('lightning-spinner');
        spinner.classList.add('slds-hide');
    }


}