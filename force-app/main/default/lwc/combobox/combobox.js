import { LightningElement, api, track } from 'lwc';

export default class Combobox extends LightningElement {
    
    @api options = [{label:'test1 Label', value:'test1'}, {label:'test2 Label', value:'test2'}];
    @api value = '--None--';
    @api label = 'Placeholder';
    @track filteredOpt = [];
    _handler;

    connectedCallback(){
        this.filteredOpt = this.options
        document.addEventListener('click', this._handler = this.closeListBox.bind(this))
    }

    disconnectedCallback(){
        document.removeEventListener('click', this._handler)
    }

    closeListBox(event){
        console.log('Close');
        let target = this.template.querySelector('.slds-dropdown-trigger_click');
        target.classList.remove('slds-is-open')
    }

    openListBox(event){
        let target = this.template.querySelector('.slds-dropdown-trigger_click');
        target.classList.add('slds-is-open')
        console.log('Open');
        event.stopImmediatePropagation()
    }

    handleChange(event){
        this.value = event.target.dataset.label
        let target = this.template.querySelector('.slds-dropdown-trigger_click');
        target.classList.remove('slds-is-open')
        const evt = new CustomEvent('valuechange', {
            detail: event.target.dataset.value
        })
        this.dispatchEvent(evt);
    }

    handleSearch(event){
        console.log(event.target.value);
        this.filteredOpt = [];
        this.value = event.target.value
        let searchTerm = (event.target.value).toLowerCase()       
        let newFilteredList = []; 
        if(searchTerm == null || searchTerm == ''){
            newFilteredList = this.options
        } else {
            this.options.find((opt, index) => {
                let curLabel = (opt.label).toLowerCase()
                if(curLabel.includes(searchTerm))
                    newFilteredList.push({
                        label : opt.label,
                        value : opt.value
                    })
            });
        }
        
        console.log('New List: ', newFilteredList);
        this.filteredOpt = newFilteredList;
        console.log(this.filteredOpt);
        
    }
}