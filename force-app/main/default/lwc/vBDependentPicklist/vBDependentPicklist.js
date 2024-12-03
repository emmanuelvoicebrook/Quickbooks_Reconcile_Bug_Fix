import { LightningElement, wire, api, track } from 'lwc';
import {  getPicklistValuesByRecordType  } from 'lightning/uiObjectInfoApi';


export default class PicklistByRecordType extends LightningElement {

    @api objectApiName   //name of the object to get the picklist values from
    @api controllingFieldApiName //name of the field that controls the dependent picklist
    @api dependentFieldApiName   //name of the field that is dependent on the controlling field
    @api recordTypeId            //id of the record type to get the picklist values from
    @api mainValue               //value of the main picklist
    @api dependentValue          //value of the dependent picklist
    @api controllingFieldLabel   //label of the controlling field
    @api dependentFieldLabel     //label of the dependent field
    @api required = false;       //if the field is required
    @api displayMode             // radio or checkbox
    @api displayOrientation
    @track mainOptions =[]       //options for the main picklist
    @track dependentOptions = []; //options for the dependent picklist
    @track allDependentFields     //all the dependent picklist values
    @track showRadio              //if the display mode is radio
    @track showDependent          //if the dependent picklist should be displayed
    dependentData
    

    /**
     * load the picklist values from salesforce using the api.
     * 
     */
    @wire(getPicklistValuesByRecordType, { objectApiName: '$objectApiName', recordTypeId: '$recordTypeId'})
        picklistValues({data, error}){
            if (data){
                console.log(data);
                this.mainOptions = data.
                picklistFieldValues[this.controllingFieldApiName].values
                this.dependentData = data.picklistFieldValues[this.dependentFieldApiName].controllerValues
                this.allDependentFields = data.picklistFieldValues[this.dependentFieldApiName].values
                
            }
            else if(error){
                console.log('Error Retrieving Fields', error)
            }
        }
    
    connectedCallback(){
        if(this.displayMode == 'Radio' || this.displayMode =='radio')
            this.showRadio = true
    }

    

    /**
     *  Checks if the field is required and if it is, if the value is undefined or null, it returns false.
     *  @returns {boolean}
     */
    @api
    validate(){
        //if the component is invalid, return the isValid as false and and error message
        console.log("Entering validate: required=" + this.required + " values=" + this.mainValue + " : " + this.dependentValue);
        let errorMessage = "You must make a selection to continue";
        
        if(this.required === true && (!this.mainValue || !this.dependentValue)){
            return {
                isValid: false,
                errorMessage: errorMessage
            }
        }

        return {isValid : true}
    }

    /**
     * Returns true if there are values to be displayed for the dependent picklist.
     */
    get showDependent(){
        if (this.dependentOptions.length == 0)
            return false
        else 
            return true
    }

    get containerClass() {
        return this.displayOrientation === 'horizontal' ? 'horizontal-layout' : '';
    }

    /**
     * 
     * @param {*} event 
     * @description This function is called when the main picklist is changed.
     *             It gets the values for the main picklist
     *            and then gets the values for the dependent picklist.
     *           It then sets the dependent picklist to the values for the main picklist.
     * 
     */
    handleMain(event){
        this.mainValue = event.target.value 
        let key = this.dependentData[this.mainValue];
        this.dependentValue = undefined
        console.log('Key: ', key);
        this.dependentOptions = this.allDependentFields.filter(opt =>
            opt.validFor.includes(key))
    }

    /** 
     * @param {*} event
     * @description This function is called when the dependent picklist is changed.
     *             It sets the value of the dependent picklist to the value of the event.
     */
    handleDependent(event){
        this.dependentValue = event.target.value
    }

}