import { LightningElement, api, track, wire } from "lwc";
import { uploadRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import VBRenewalsController from "@salesforce/apex/VBRenewalsController.VBRenewalsController";
import CreateNewRenewal from "@salesforce/apex/VBRenewalsController.createRenewalRecord";
import UpdateRenewal from "@salesforce/apex/VBRenewalsController.updateRenewalRecord";
import uploadFile from "@salesforce/apex/VBFileUploader.uploadFile";

export default class UploadFileLWC extends LightningElement {
  @track fileName = "No File Selected";
  @track file;
  @track data = [];
  @track errorData = [];
  @track columns = ["Type", "Date", "Amount", "Account"];
  @track errorColumns = [
    { label: 'Account Name/Id', fieldName: 'Account Name', initialWidth: 250, },
    { label: 'Date', fieldName: 'Date', initialWidth: 250, type: 'date' },
    { label: 'Amount on Record', fieldName: 'Amount on Record', type: 'currency',initialWidth: 250, },
    { label: 'Amount Received', fieldName: 'Amount Received', type: 'currency',initialWidth: 250, },
    { label: 'Error Message', fieldName: 'Error Message'}
  ];
  @track rawCSVErrorData = [];
  @track curatedData = [];
  @track error;
  @track dataProcessed = false;
  @track datacommited = false;
  @track success = false;
  @track status;
  @track statusMessage;
  @track errorCount = 0;
  @track successCount = 0;
  // @api recordId = 'a1PDS000004wlOz2AI'
  @api recordId;

  fileData;
  // pagination
  pageSizeOptions = [5, 10, 25, 50, 75, 100]; //Page size options
  totalRecords = 0; //Total no.of records
  pageSize; //No.of records to be displayed per page
  totalPages; //Total no.of pages
  pageNumber = 1; //Page number
  recordsToDisplay = [];

  get getColumns() {
    return [
      { label: "Type", fieldName: "Type" },
      { label: "Date", fieldName: "Date" },
      { label: "Amount", fieldName: "Amount" },
      { label: "Account", fieldName: "Account" },
    ];
  }

  get bDisableFirst() {
    return this.pageNumber == 1;
  }
  get bDisableLast() {
    return this.pageNumber == this.totalPages;
  }
  handleRecordsPerPage(event) {
    this.pageSize = event.target.value;
    this.paginationHelper();
  }
  previousPage() {
    this.pageNumber = this.pageNumber - 1;
    this.paginationHelper();
  }
  nextPage() {
    this.pageNumber = this.pageNumber + 1;
    this.paginationHelper();
  }
  firstPage() {
    this.pageNumber = 1;
    this.paginationHelper();
  }
  lastPage() {
    this.pageNumber = this.totalPages;
    this.paginationHelper();
  }
  // JS function to handel pagination logic
  paginationHelper() {
    this.recordsToDisplay = [];
    // calculate total pages
    this.totalPages = Math.ceil(this.totalRecords / this.pageSize);
    // set page number
    if (this.pageNumber <= 1) {
      this.pageNumber = 1;
    } else if (this.pageNumber >= this.totalPages) {
      this.pageNumber = this.totalPages;
    }
    // set records to display on current page
    for (
      let i = (this.pageNumber - 1) * this.pageSize;
      i < this.pageNumber * this.pageSize;
      i++
    ) {
      if (i === this.totalRecords) {
        break;
      }
      this.recordsToDisplay.push(this.curatedData[i]);
    }
  }

  handleUploadFinished(event) {
    
    this.clearData();
    if(this.checkFileType(event.detail.files[0])){
      this.file = event.detail.files[0];
      this.fileName = this.file.name;
      this.readFile(this.file);
    }else{      
      this.error = "File type not supported";
      this.dispatchEvent(
        new ShowToastEvent({
          title: "Error",
          message: "File type not supported",
          variant: "error",
        })
      );
    }
  }

  clearData() {
    
    // clear previous data
    this.data = [];
    this.curatedData = [];
    this.dataProcessed = false;
    this.datacommited = false;
    this.success = false;
    this.fileName = "No File Selected";
    this.file = null;
    this.error = null;
    this.totalRecords = 0;
    this.pageSize = null;
    this.totalPages = null;
    this.pageNumber = 1;
    this.recordsToDisplay = [];
  }

  checkFileType(file) {
    if (file.type === "text/csv") {
      return true;
    } else {
      return false;
    }
  }


  prepFileForImport(file) {
    var reader = new FileReader();
    reader.onload = () => {
      var base64 = reader.result.split(",")[1];
      this.fileData = {
        filename: file.name,
        base64: base64,
        recordId: this.recordId,
      };
      console.log(this.fileData);
      this.sendFileToServer()
    };
    reader.readAsDataURL(file);
  }
  readFile(file) {
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      this.parseCSV(reader.result);
    };
  }

  parseCSV(csv) {
    let allTextLines = csv.split(/\r\n|\n/);
    let headers = allTextLines[0].split(",");
    for (let i = 1; i < allTextLines.length; i++) {
      // let data = allTextLines[i].split(",");
      let data = this.customSplit(allTextLines[i]);
      if (data.length == headers.length) {
        let tarr = [];
        for (let j = 0; j < headers.length; j++) {
          tarr.push(data[j]);
        }
        this.data.push(tarr);
      }
    }
  }
  
  customSplit(str) {
    const placeholder = "{{MONEY}}"; // Placeholder string for monetary amount
    const regex = /(\$[\d,]+(\.\d{2})?)/; // Regular expression to match monetary amount with or without comma
    const matches = str.match(regex); // Find matches for the regular expression
  
    if (matches) {
      const [match] = matches;
      const replacedStr = str.replace(regex, placeholder); // Replace matches with placeholder
      const parts = replacedStr.split(","); // Split the string by comma
      const result = parts.map((part) => part.replace(/"/g, "").trim().replace(placeholder, match)); // Remove quotation marks and replace the placeholder with the original value
      return result;
    } else {
      return str.split(",").map((part) => part.replace(/"/g, "").trim()); // Remove quotation marks from parts after splitting by comma
    }
  }
  
  

  curateData() {
    let curatedData = [];
    try {
      for (let i = 0; i < this.data.length; i++) {
        let obj = {};
        // check that the first two columns are not empty
        if (this.data[i][0] == "" || this.data[i][1] == "") {
            continue;
        }

        for (let j = 0; j < this.columns.length; j++) {
          obj[this.columns[j]] = this.data[i][j];
        }
        curatedData.push(obj);
      }
      this.curatedData = curatedData;
    } catch (e) {
      this.error = e;
    }
    this.totalRecords = this.curatedData.length; // set total records
    this.dataProcessed = true;
    this.pageSize = this.pageSizeOptions[0]; //set pageSize with default value as first option
    this.paginationHelper(); // call helper menthod to update pagination logic
    return JSON.stringify(curatedData);
  }

  sendFileToServer() {
    const { base64, filename, recordId } = this.fileData;
    uploadFile({ base64, filename, recordId }).then((result) => {
      if (this.fileData) {
        this.fileData = null;
        let title = `${filename} uploaded successfully!!`;
        this.toast(title);
      }
    });
    VBRenewalsController({
      curatedData: this.curatedData,
      renwalId: this.recordId
    })
      .then((result) => {
        console.log(result);
        let csv = result['csv'];
        this.rawCSVErrorData = csv;
        this.statusMessage = result['message'];
        this.status = result['status'];
        this.errorCount = result['errorCount'];
        this.successCount = result['successCount'];
        // read the csv data and display it
        if(csv != null && csv != undefined && csv != ''){
          let allTextLines = csv.split(/\r\n|\n/);
          let headers = allTextLines[0].split(",");
          let errorData = [];
          for (let i = 1; i < allTextLines.length; i++) {
            let data = this.customSplit(allTextLines[i]);
            if (data.length == headers.length) {
              let tarr = [];
              for (let j = 0; j < headers.length; j++) {
                tarr.push(data[j]);
              }
              errorData.push(tarr);
            }
          }
          // loop through the error data create a new object and push it to the errorData array
          let errorDataArray = [];
          for (let i = 0; i < errorData.length; i++) {
            let obj = {};
            for (let j = 0; j < headers.length; j++) {
              obj[headers[j]] = errorData[i][j];
            }
            errorDataArray.push(obj);
          }
          this.errorData = errorDataArray;
        }
        this.datacommited = true;
        this.success = true;
        this.dispatchEvent(
          new ShowToastEvent({
            title: result['status'],
            message: result['message'],
            variant: result['status'],
          })
        );
      })
      .catch((error) => {
        this.datacommited = true;
        this.success = false;
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error updating data",
            message: error.message,
            variant: "error",
          })
        );
      });
  }
  saveLicenses() {
    //upload into salesforce
    // create new renewal record
    CreateNewRenewal({recordsCount: this.totalRecords})
      .then((result) => {
        this.recordId = result;
        this.prepFileForImport(this.file);
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error creating new renewal",
            message: error.message,
            variant: "error",
          })
        );        

      });
    if (this.recordId != null) {
    }
  }

  get showProcessDataButton() {
    return this.data.length > 0 && !this.dataProcessed;
  }
  get showTable(){
    return this.curatedData.length > 0 && !this.datacommited;
  }

  get get_icon_name(){
    if(this.status == 'Success' || this.status == 'success'){
      return 'utility:success';
    } else if (this.status == 'Warning' || this.status == 'warning'){
      return 'utility:warning';
    } else {
      return 'utility:error';
    }
  }

  get message_color_style(){
    if(this.status == 'Success' || this.status == 'success'){
      return 'color:green; font-size: 15px;';
    } else if (this.status == 'Warning' || this.status == 'warning'){
      return 'color:orange; font-size: 15px;';
    } else {
      return 'color:red; font-size: 15px;';
    }
  }

  get show_error_table(){
    return this.errorData.length > 0;
  }

  handleErrorDataDownload(){
    const csv = this.rawCSVErrorData;
    const encodedUri = encodeURI(csv);
    const link = document.createElement("a");
    link.setAttribute("href", 'data:text/csv;charset=utf-8,' + encodedUri);
    link.setAttribute("download", "error_data.csv");
    document.body.appendChild(link); 
    link.click();
  }
  toast(title) {
    const toastEvent = new ShowToastEvent({
      title,
      variant: "success",
    });
    this.dispatchEvent(toastEvent);
  }
}