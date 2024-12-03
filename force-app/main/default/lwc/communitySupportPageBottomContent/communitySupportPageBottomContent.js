import { LightningElement } from 'lwc';
import penSquare from '@salesforce/resourceUrl/icon_penSquare';
import { loadStyle } from 'lightning/platformResourceLoader';
import colorCSS from '@salesforce/resourceUrl/CommunityAccordionCSS';
import sizeCSS from '@salesforce/resourceUrl/CommunityAccordionHeaderSizeCSS';

export default class CommunitySupportPageBottomContent extends LightningElement {
    activeSections = [];
    activeSectionsMessage = '';
    penSquareIcon = penSquare + '#penSquare'; // Use a more descriptive variable name

    cssLoaded = false; // Track if CSS is already loaded

    renderedCallback() {
        if (this.cssLoaded) {
            return;
        }
        this.cssLoaded = true;
        Promise.all([
            loadStyle(this, colorCSS),
            loadStyle(this, sizeCSS)
        ]).then(() => {
            console.log('Custom CSS loaded successfully');
        }).catch(error => {
            console.error('Error loading custom CSS', error);
        });
    }

    handleSectionToggle(event) {
        const openSections = event.detail.openSections;

        if (openSections.length === 0) {
            this.activeSectionsMessage = 'All sections are closed';
        } else {
            this.activeSectionsMessage = 'Open sections: ' + openSections.join(', ');
        }
    }
}