import { LightningElement, api, track } from 'lwc';

export default class RadioRecordDisplay extends LightningElement {
    @api records;
    @api selectedRecordsIdCollection
    @api selectedRecordId
    @api required
    @api displayFieldName;
    @api masterLabel
    @api displayMode
    @api defaultCheckBoxValue;
    @track showRadio = false;
    @track testBool = true;
    selectedRecsCollection = [];


    @api validate(){
        if(this.required){
            console.log('validate');
            console.log(this.selectedRecsCollection.length);
            if (this.showRadio && (this.selectedRecordId == undefined || this.selectedRecordId == null || this.selectedRecordId == '')) {
                let errorMessage = 'Please select at least one record';
                return {
                    isValid: false,
                    errorMessage: errorMessage,
                };
            }
            else if(!this.showRadio && this.selectedRecsCollection.length == 0 ){
                let errorMessage = 'Please select at least one record';
                return {
                    isValid: false,
                    errorMessage: errorMessage,
                };
            }
        }
        return {
            isValid: true,
        };
    }
    get selectedRecordsIdCollection(){
        return this.selectedRecsCollection;
    }
    
    handleCheck(event){        
        if(!event.target.checked){
            this.selectedRecsCollection = this.selectedRecsCollection.filter(value => value !== event.target.value);
        } else if(event.target.checked){
            this.selectedRecsCollection.push(event.target.value);
        }
        console.log('Record Selected')
        console.log('checked Status',event.target.value);
    }

    connectedCallback(){
        console.log('Single/Multiple Choice Mode', this.displayMode)

        
        if(this.displayMode == 'Single' || this.displayMode == 'Radio') 
            this.showRadio = true;         

        // check if default value is true and add all the ids to the selectedRecordsId
        if(this.defaultCheckBoxValue &&  (this.displayMode != 'Single' && this.displayMode != 'Radio')){    
            console.log((this.displayMode != 'Single' || this.displayMode != 'Radio'))
            this.records.forEach(rec => {
                this.selectedRecsCollection.push(rec.Id);
            })
        }
    }

    renderedCallback(){
        if(this.displayMode == 'Single' || this.displayMode == 'Radio'){
            let inputTags = this.template.querySelectorAll(".radioLabels");
            console.log('TagsX', inputTags)
            
            for(let i = 0; i < this.records.length; i++){
                if(this.records[i][this.displayFieldName]) {
                    inputTags[i].innerHTML  = this.records[i][this.displayFieldName]
                    console.log('Found something in label field')
            }
                else {
                    inputTags[i].innerHTML  = "THE LABEL FIELD DOES NOT CONTAIN DATA - Ensure you GetRecords is pulling that field"
                    console.log('Did NOT find something in label field')
                }
            }
        }
        else{
            let inputTags = this.template.querySelectorAll(".checkBoxes");
            console.log('Tags', inputTags)
            
            for(let i = 0; i < this.records.length; i++){
                inputTags[i].label = this.records[i][this.displayFieldName]
            }
        }
    }

    handleRadio(event){
        this.selectedRecordId = event.target.value
        console.log('Selected Record', event.target.value)
    }

}