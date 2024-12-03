import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import NavigationImages from '@salesforce/resourceUrl/CommunityKnowledgeBaseNavigation';
import getArticles from '@salesforce/apex/NavigationMenuItemsController.getArticles';
import { getPicklistValuesByRecordType } from "lightning/uiObjectInfoApi";
import isGuestUser from '@salesforce/user/isGuest';
import basePath from '@salesforce/community/basePath';

/**
 * This is a custom LWC navigation menu component.
 * Make sure the Guest user profile has access to the NavigationMenuItemsController apex class.
 */
export default class CommunityKnowledgeBaseMenu extends NavigationMixin (
    LightningElement
) {
    @api buttonLabel;
    @api buttonRedirectPageAPIName;
    @api menuName;
    @api selectedCollections

    @track articlesByCategory;
    @track activeCollection;
    @track showDetails = false;

    testImage = NavigationImages + "/Images/FAQ.jpg"
    error;

    href = basePath;
    isLoaded;
    menuItems = [];

    publishedState;
    collectionPicklist;



    objectApiName = "Knowledge__kav";
    recordTypeId = "012000000000000AAA";
    @wire(getPicklistValuesByRecordType, {
        objectApiName: "$objectApiName",
        recordTypeId: "$recordTypeId",
    })
    picklistValues({ data, error }) {
        if (data) {
            let filterList = this.splitAndTrim(this.selectedCollections)
            let main_options = data.picklistFieldValues['Collection__c'].values;
            // this.collectionPicklist = data.picklistFieldValues['Collection__c'].values.filter(value => filterList.includes(value))
            let navigationItems = data.picklistFieldValues['Collection__c'].values
            .map(value => {
                if (filterList.includes(value.value)) {
                    let imageLabel  = NavigationImages + '/Icons/' +this.refineLabel(value.value) + '.png';
                    return { ...value, image: imageLabel };  // Add new property
                }
                return null;  // Exclude items not in filterList
            })
            .filter(value => value !== null);  // Remove null values
    
            this.collectionPicklist = navigationItems;
            let dependancy_data =
                data.picklistFieldValues['Collection_Category__c'].controllerValues;
            let all_dependent_options = data.picklistFieldValues['Collection_Category__c'].values;


        }
    }


    // @wire(getPicklistValues, { recordTypeId: "012000000000000AAA", fieldApiName: COLLECTION_FIELD })
    // processResults({ error, data }) {
    //     if (data) {
    //         let filterList = this.splitAndTrim(this.selectedCollections)
    //         this.collectionPicklist = data.values.filter(value => filterList.includes(value))

    //     }
    // }

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        const app =
            currentPageReference &&
            currentPageReference.state &&
            currentPageReference.state.app;
        if (app === 'commeditor') {
            this.publishedState = 'Draft';
        } else {
            this.publishedState = 'Live';
        }
    }
    

    fetchArticles(collection) {
        getArticles({ collection : collection })
            .then(result => {
                if (result) {
                    this.groupArticlesByCategory(result);
                    this.showDetails = true;
                }
            })
            .catch(error => {
                console.error('Error fetching articles:', error);
            });
    }
    groupArticlesByCategory(articles) {
        const groupedArticles = articles.reduce((acc, article) => {
            const category = article.Collection_Category__c;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(article);
            return acc;
        }, {});

        // this.articlesByCategory = groupedArticles;
        this.articlesByCategory = Object.keys(groupedArticles).map(category => ({
            category,
            articles: groupedArticles[category]
        }));

        console.log('Grouped Articles:', this.articlesByCategory);
    }
    handleSelection(event){
        let selected = event.detail
        this.articlesByCategory = [];
        this.activeCollection = selected;
        this.fetchArticles(selected);
    }
    handleClick(event) {
        let articleId = event.currentTarget.dataset.id
        this[NavigationMixin.Navigate]({
            type: "standard__recordPage",
            attributes: {
                recordId: articleId,
                objectApiName: "Knowledge__kav",
                actionName: "view",
            },
        });
    }
    handleBack(){
        this.showDetails = false;
        this.activeCollection = '';
        this.articlesByCategory = [];
    }

    refineLabel(label) {
        if (label.trim().split(/\s+/).length > 1) {
            // Remove all spaces and forward slashes
            return label.replace(/[\s\/]+/g, '');
        } else {
            // Remove forward slashes if any and return the label
            return label.replace(/\//g, '');
        }
    }

    splitAndTrim(inputString) {
        // Split the string by comma
        const splitArray = inputString.split(',');

        // Trim each value in the array
        const trimmedArray = splitArray.map(item => item.trim());

        return trimmedArray;
    }

}