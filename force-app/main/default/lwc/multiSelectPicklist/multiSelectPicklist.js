import { LightningElement, api,track } from 'lwc';

export default class LIB_MultiSelectPickList_LWC extends LightningElement {

@api options = [{label: 'Label 1', value : 'value1'}, {label: 'Label 2', value : 'value2'}, {label: 'Label 3', value : 'value3'},]
@api label
@track allOptions
@track error;
@track dropdown = 'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
@track dataList;
@track dropdownList = 'slds-media slds-listbox__option slds-listbox__option_entity slds-listbox__option_has-meta';
@track selectedValue = 'Select an Option';
@track selectedListOfValues=[];
@track value= ''
_handler

@api 
resetValues(){
    this.selectedListOfValues = []
}

connectedCallback(){
    document.addEventListener('click', this._handler = this.closeDropDown.bind(this))
}

disconnectedCallback(){
    document.removeEventListener('click', this._handler)
}
openDropdown(event){
    let target = this.template.querySelector('.slds-dropdown-trigger_click');
    target.classList.add('slds-is-open')
    console.log('Open');
    event.stopImmediatePropagation()
    // this.dropdown =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click slds-is-open';  
}
closeDropDown(event){
    console.log('Close');
    let target = this.template.querySelector('.slds-dropdown-trigger_click');
    target.classList.remove('slds-is-open')
//    this.dropdown =  'slds-combobox slds-dropdown-trigger slds-dropdown-trigger_click';
}

selectOption(event){
    // var label =  event.target.value;
    // console.log(event.target.value);
    var label =  event.currentTarget.dataset.name;

    if(label == '--None--'){
        this.selectedListOfValues = []
        const evt = new CustomEvent('change', {
            detail : this.selectedListOfValues
        })
        this.dispatchEvent(evt)
        console.log('Selected Values', this.selectedListOfValues);
        return
    }
    if (this.selectedListOfValues.find(lab => lab == label)){
        console.log('Item exists');
        var i = 0;
        while (i < this.selectedListOfValues.length){
            if(this.selectedListOfValues[i] === label)
                this.selectedListOfValues.splice(i,1)
            else 
                i++
        }
    } else {
        console.log('Doesnt exist');
        this.selectedListOfValues.push(label)
    }

    const evt = new CustomEvent('change', {
        detail : this.selectedListOfValues
    })
    this.dispatchEvent(evt)
    console.log('Selected Values', this.selectedListOfValues);

}
	
removeRecord(event){
    var value = event.detail.name;
    // var value = event.
    console.log('Removed item: ',value);
    var i = 0;
        while (i < this.selectedListOfValues.length){
            if(this.selectedListOfValues[i] === value)
                this.selectedListOfValues.splice(i,1)
            else 
                i++
    }

    if(this.selectedListOfValues.length == 0)
        this.resetValues()
    
    const evt = new CustomEvent('change', {
        detail : this.selectedListOfValues
    })
    this.dispatchEvent(evt)
    console.log('Selected Values', this.selectedListOfValues);
    }

get getValueDetails(){
    var selectedOptions = this.selectedListOfValues.length
    return `${selectedOptions} Options Selected`
}


}