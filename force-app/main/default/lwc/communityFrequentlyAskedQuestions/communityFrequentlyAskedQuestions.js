import { LightningElement, wire, track } from 'lwc';
import getFAQArticles from '@salesforce/apex/CommunityArticlesController.getFAQArticles';
import { loadStyle } from 'lightning/platformResourceLoader';
import colorCSS from '@salesforce/resourceUrl/CommunityAccordionCSS';

export default class CommunityFrequentlyAskedQuestions extends LightningElement {
    articles;
    open = false
    cssLoaded = false; // Track if CSS is already loaded

    renderedCallback() {
        if (this.cssLoaded) {
            return;
        }
        this.cssLoaded = true;
        Promise.all([
            loadStyle(this, colorCSS)
        ]).then(() => {
            console.log('Custom CSS files loaded successfully');
        }).catch(error => {
            console.error('Error loading custom CSS', error);
        });
    }

    @wire(getFAQArticles)
    wiredArticles({ data, error}){
        if(data){
            this.articles = data
        }
    }
}