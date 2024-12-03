import { LightningElement, track, wire, api } from 'lwc';
import getArticles from '@salesforce/apex/knowledgeSearchController.getKnowledgeArticles'
import { refreshApex } from '@salesforce/apex';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import INDUSTRY_FIELD from '@salesforce/schema/Account.Industry';

export default class ArticleSearchCMP extends LightningElement {
    @api noRecords = 10;
    @api selectedArticleId
    @track articles =[];
    @track searchTxt = ''
    @track filter = 'title'
    records
    

    @wire(getPicklistValues, { recordTypeId: '012000000000000AAA', fieldApiName: INDUSTRY_FIELD })
        accounts(results){
            if(results.data){
                console.log('There is something: ', results.data)
            } else if(results.error){
                console.log('Error: ', error)
            }
        }

    @api resetValues(){
        this.searchTxt = ''
        this.filter = 'title'
        this.articles = []
    }
    
    get filterOptions() {
        return [
            { label: 'Title', value: 'title' },
            { label: 'Body', value: 'body' },
            { label: 'Whole Article', value: 'both' },
        ]
    }

    clearText(event){
        console.log(this.template.querySelector('.searchField'))
        this.template.querySelector('.searchField').value = null;
        this.articles =[];
        this.searchTxt = '';
        console.log("clear text")
    }
    handleSelected(event){
        console.log('Selected Value: ', event.target.value )
        this.articles =[];
        this.filter = event.target.value
    }

    handleSearch(event){
        this.searchTxt = event.target.value;
        this.articles = [];
        console.log(this.searchTxt)
        getArticles({searchText : this.searchTxt, noRecs : this.noRecords, filter : this.filter})
        .then(result => {
            this.articles = result;
            console.log('Articles: ', this.articles)
        })
        .catch(error => {
            console.log('Error: ', error)
        })
    }

    checkValue(event){
        console.log('Loading Radio',event.target.value)
    }

    handleCheck(event){
        console.log('Test: ',event.target.value)
        if(this.selectedArticleId !== event.target.value)
            this.selectedArticleId = event.target.value
        
        if(event.target.checked == false){
            this.selectedArticleId = ''
        }
        console.log('isChecked: ', event.target.checked)
        console.log('Selected Article: ', this.selectedArticleId)
        //avoid multiple box checking 
        let boxes = this.template.querySelectorAll('.articles');
        console.log('Boxes', boxes)
        let currentBox = event.target.label;
        console.log('Current Box: ',currentBox);
        for(let i = 0; i < boxes.length; i++){
            console.log('Test started')
            let box = boxes[i];
            if(box.label !== currentBox && box.checked){
                box.checked = false;
            }
        }

    }

    renderedCallback(){
        let radioGroup = this.template.querySelectorAll('.filterRadio')
        for(let i = 0; i < radioGroup.length; i++){
            let btn = radioGroup[i];
            if(btn.value == this.filter){
                btn.checked = true
            }
        }
        // this.searchTxt = '';
        // this.articles =[];
    }
}