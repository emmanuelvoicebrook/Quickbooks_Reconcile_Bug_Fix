import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class TreeAccordions extends NavigationMixin(LightningElement)  {
    
    title_data = [];
    @track _accordionData = [];
    @track _active_article_title = '';
    @track _active_article_collection_category = '';
    @track _active_article_urlname = '';
    @track ready = false;
    @track rerender = true;
    @api internal;
    // @track categories = []; 
    @api 
    get accordionData(){
        return this._accordionData;
    }
    set accordionData(value){
        console.log('set accordionData');
        console.log(JSON.parse(JSON.stringify(value)));
        this._accordionData = value;
        console.log('this._accordionData');
        console.log(JSON.parse(JSON.stringify(this._accordionData)));
        if(this._accordionData && this.title_data.length == 0){
            this.ready = true;
            this.renderedCallback();
        }
    }

    @api 
    get active_article_title(){
        return this._active_article_title;
    }

    set active_article_title(value){
        console.log('set active_article_title');
        console.log(value);
        this._active_article_title = value;
    }

    @api
    get active_article_collection_category(){
        return this._active_article_collection_category;
    }

    set active_article_collection_category(value){
        console.log('set active_article_collection_category');
        console.log(value);
        this._active_article_collection_category = value;
    }

    @api name
    options =[
        {
            label: 'Category 1',
            value: 'Category 1',
            selected: false
        },
        {
            label: 'Category 2',
            value: 'Category 2',
            selected: false
        },
    ]

    @api
    get active_article_urlname(){
        return this._active_article_urlname;
    }

    set active_article_urlname(value){
        console.log('set active_article_urlname');
        console.log(value);
        this._active_article_urlname = value;
    }

    @api expand_navigation;
    connectedCallback(){
        console.log('connected');
        console.log(this._accordionData);
        console.log(this.name);
        try{
            console.log(JSON.parse(JSON.stringify(this._accordionData[this.name])))
            let temp_title_data = JSON.parse(JSON.stringify(this._accordionData[this.name]));
            // loop over the temp title data and remove the components with 0 titles
            for(let i = 0; i < temp_title_data.length; i++){
                if(temp_title_data[i].titles.length == 0){
                    temp_title_data.splice(i, 1);
                }
            }
            console.log('temp_title_data');
            console.log(temp_title_data);
            // this.title_data = this._accordionData[this.name];
            this.title_data = [];
            forEach(this._accordionData[this.name], (e) => {
                if(e.titles.length > 0){
                    this.title_data.push(e);
                }
            });
            console.log('this.title_data');
        }catch(e){
            console.log(e);
        }

        console.log('Title data: ');
        console.log(this.title_data)

    }

    renderedCallback(){
        console.log('rendered');
        console.log('Name is: ' + this.name);
        console.log(JSON.parse(JSON.stringify(this._accordionData)));
        // this.ready = true;
        try{
            console.log(JSON.parse(JSON.stringify(this._accordionData[this.name])))
            this.title_data = this._accordionData[this.name]
            // set the value of the active article
        }catch(e){
            console.log(e);
        }
        try{
            console.log("Checking if shoudl expand all sections")
            console.log(this.expand_navigation);
            if(this.expand_navigation){
                console.log('Expanding all sections');
                let sections = this.template.querySelectorAll('[data-name="accordions"]');
                console.log(sections);
                sections.forEach((section) => {
                    section.className = 'slds-section slds-is-open';
                });
                this.setDefaultSelection();
                
            }
            else{
                let activeSection = this.template.querySelector('[data-id="' + this._active_article_collection_category + '"]');
                activeSection.className = 'slds-section slds-is-open';
                this.setDefaultSelection();
            }
        }catch(e){
            console.log(e);
        }
    }

    handleTitleClick(event){
        console.log(event.target.value);
        let current_selected = event.target.value;
        // check if the current selected is the same as the active article
        if(current_selected == this._active_article_urlname){
            // if it is the same, then do nothing
            // ensure that the active article is selected
            this.setDefaultSelection();
            return;
        }
        //remove the actrive url from selection
        // let active_url = current_selected.filter(item => item != this._active_article_urlname);
        // if (active_url.length == 0){
        //     // cancel the selection
        //     console.log('Current Active:' + this._active_article_urlname);
        //     let check_box_group = this.template.querySelector('lightning-checkbox-group');
        //     check_box_group.value = this._active_article_urlname;
        //     console.log(check_box_group);
        //     this.rerender = false;
        //     this.rerender = true;
        //     return;
        // }
        this.unsetSpecificSelection(current_selected);
        if(this.internal){
            console.log('Internal Navigation');
            // fire event to parent
            const selectedEvent = new CustomEvent('internaltitleclick', {
                detail: current_selected
            });
            this.dispatchEvent(selectedEvent);
        } else {
            console.log('External Navigation');
            const selectedEvent = new CustomEvent('externaltitleclick', {
                detail: current_selected
            });
            this._active_article_urlname =  event.target.value
            this.dispatchEvent(selectedEvent);

        }
        this.setDefaultSelection();
    }

    navigateToInternalPage() {
        // Use the basePath from the Summer '20 module to construct the URL
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: 'My_Feed__c',
            }
        });
    }
    toggleSection(event) {
        console.log('toggleSection');
        let buttonid = event.currentTarget.dataset.buttonid;
        let currentsection = this.template.querySelector('[data-id="' + buttonid + '"]');
        if (currentsection.className.search('slds-is-open') == -1) {
            currentsection.className = 'slds-section slds-is-open';
        } else {
            currentsection.className = 'slds-section slds-is-close';
        }
    }

    setDefaultSelection(){
        // get the active article url name
        let active_url = this._active_article_urlname;
        // create a string with the data-name of the active article url
        let active_url_string = '[data-name=\"' + active_url + '\"]';
        let check_box_group = this.template.querySelector(active_url_string);
        check_box_group.checked = true;
    }

    unsetSpecificSelection(urlname){
        // get the active article url name
        let active_url = urlname;
        // create a string with the data-name of the active article url
        let active_url_string = '[data-name=\"' + active_url + '\"]';
        let check_box_group = this.template.querySelector(active_url_string);
        check_box_group.checked = false;

    }

}