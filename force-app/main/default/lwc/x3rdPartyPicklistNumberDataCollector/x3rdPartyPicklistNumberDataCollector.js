import id from '@salesforce/user/Id';
import { LightningElement, api, track } from 'lwc';

export default class PicklistNumberDataCollector extends LightningElement {
    // api
    @api picklistValues;
    @api picklistLabel;
    @api numberLabel;
    @api numberOfEntries;
    @api required;
    @api dateLabel

    // @api 
    // get entries() {
    //     // recreate the list without the id
    //     let entries = [];
    //     this._entries.forEach(entry => {
    //         // find the product code from the picklistData 
    //         let product_code = this.picklistData.find(data => data.product_name == entry.product_name).product_code;
    //         entries.push({
    //             product_name: entry.product_name,
    //             quantity: entry.quantity,
    //             product_code: product_code,
    //             required_by_date : entry.required_by_date
    //         });
    //     });
    //     return entries;
    // } 
    // set entries(value) {
    //     console.log('entries setter called');
    //     console.log(value);
    //     // duplicate the list
    //     let entries = [];

    //     value.forEach(entry => {
    //         entries.push({
    //             product_name: entry.product_name,
    //             quantity: entry.quantity,
    //             product_code: entry.product_code,
    //             required_by_date : entry.required_by_date,
    //             id : this.currentId
    //         });
    //         this.currentId++;
    //     });
    //     this._entries = entries;
    // }


    @api 
    get entry_data() {
        // recreate the list without the id
        let entries = [];
        this._entries.forEach(entry => {
            // find the product code from the picklistData 
            // check if all fields are filled
            // if(entry.product_name == "" || entry.product_name == null || entry.quantity == "" || entry.quantity == null || entry.required_by_date == "" || entry.required_by_date == null){

            // } else{
            
            //     let product_code = this.picklistData.find(data => data.product_name == entry.product_name).product_code;
            //     entries.push({
            //         product_name: entry.product_name,
            //         quantity: entry.quantity,
            //         product_code: product_code,
            //         required_by_date : entry.required_by_date
            //     });
            // }
            let product_code = this.picklistData.find(data => data.product_name == entry.product_name).product_code;
                entries.push({
                    product_name: entry.product_name,
                    quantity: entry.quantity,
                    product_code: product_code,
                    required_by_date : entry.required_by_date
                });
        });
        return entries;
    } 

    set entry_data(value) {
        console.log('entries setter called');
        console.log(value);
        // duplicate the list
        let entries = [];

        value.forEach(entry => {
            entries.push({
                product_name: entry.product_name,
                quantity: entry.quantity,
                product_code: entry.product_code,
                required_by_date : entry.required_by_date,
                id : this.currentId
            });
            this.currentId++;
        });
        this._entries = entries;
    }

    
    @api picklistData

    // validate 
    // @api
    // validate() {
    //     let valid = this.checkValidity();
    //     // check if atleast one entry is present
      
    //     if(valid){
    //         return { 
    //             isValid: true
    //          };
    //     } 
    //     return { 
    //         isValid: false, 
    //         errorMessage: this.errorMessage
    //      };
    // }

    // get checkValidity(){
    //     if (this._entries.length == 0 && this.required) {
    //         // this.error = true
    //         this.errorMessage = 'Atleast one entry is required!';
    //         return false
    //     }
    //     this._entries.forEach(entry => {
    //         if (entry.product_name == null || entry.product_name == '' || entry.quantity == null || entry.quantity == '' ||  entry.required_by_date == null || entry.required_by_date == '') {
    //             // this.error = true
    //             this.errorMessage = 'Ensure all fields are filled'
    //             return false
            
    //         }
    //     });
    //     return true
    // }
        
    // track
    @track selectedValue;
    @track _entries = [];
    @track currentId = 0;
    @track _picklistValues = [];
    @track _picklistData = [];
    @track error = false;
    @track errorMessage = '';

    
    connectedCallback() {
        
         // set _picklistValues
        this.picklistData.forEach(value => {
            this._picklistValues.push({label: value.product_name, value: value.product_name});
        });
        // check if atleast one entry is present
        if (this._entries.length == 0) {
            // instantiate entries with at least one entry
            this._entries = [{product_name: '', quantity: '', id: this.currentId}];
            this.currentId++;
        } 
    }


    addNewEntry() {
        this._entries = [...this._entries, {product_name: '', quantity: '', id: this.currentId}];
        this.currentId++;
    }
    
    handlePicklistChange(event) {
        // get data id from event
        const id = event.target.dataset.id;
        // get value from event
        const value = event.target.value;
        // update entry
        this._entries = this._entries.map(entry => {
            if (entry.id == id) {
                entry.product_name = value;
            }
            return entry;
        });

        console.log(this._entries);

    }

    handleNumberChange(event) {
        // get data id from event
        const id = event.target.dataset.id;
        // get value from event
        const value = event.target.value;
        // update entry
        this._entries = this._entries.map(entry => {
            if (entry.id == id) {
                entry.quantity = value;
            }
            return entry;
        });

        console.log(this._entries);
    }

    handleDateChange(event) {
        // get data id from event
        const id = event.target.dataset.id;
        // get value from event
        const value = event.target.value;
        // update entry
        this._entries = this._entries.map(entry => {
            if (entry.id == id) {
                entry.required_by_date = value;
            }
            return entry;
        });

        console.log(this._entries);
    }

    handleRemove(event) {
        // get data id from event
        const id = event.target.dataset.id;
        // remove entry
        this._entries = this._entries.filter(entry => entry.id != id);
        // check if there is at least one entry
        if (this._entries.length == 0) {
            this._entries = [{product_name: '', quantity: '', id: this.currentId}];
            this.currentId++;
        }
    }

    get getToday(){
        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        let yyyy = today.getFullYear();
        today = yyyy + '-' + mm + '-' + dd;
        return today;
    }



}