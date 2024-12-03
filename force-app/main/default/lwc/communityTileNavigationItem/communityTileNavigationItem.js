import { LightningElement, api, track } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';

export default class CommunityTileNavigationItem extends NavigationMixin (
    LightningElement
) {

    @api item = {};
    @track active = false;

    @track href = '#';

    /**
     * the PageReference object used by lightning/navigation
     */
    pageReference;

    connectedCallback() {
        const { type, target, defaultListViewId } = this.item;
        console.log('Im Here')
        const currentPath = window.location.pathname;
        if (this.item.target == this.getLastSegment(currentPath)) {
            this.active = true;
        } else {
            this.active = false;
        }

        // get the correct PageReference object for the menu item type
        if (type === 'SalesforceObject') {
            // aka "Salesforce Object" menu item
            this.pageReference = {
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: target
                },
                state: {
                    filterName: defaultListViewId
                }
            };
        } else if (type === 'InternalLink') {
            // aka "Site Page" menu item

            // WARNING: Normally you shouldn't use 'standard__webPage' for internal relative targets, but
            // we don't have a way of identifying the Page Reference type of an InternalLink URL
            this.pageReference = {
                type: 'standard__webPage',
                attributes: {
                    url: basePath + target
                }
            };
        } else if (type === 'ExternalLink') {
            // aka "External URL" menu item
            this.pageReference = {
                type: 'standard__webPage',
                attributes: {
                    url: target
                }
            };
        } else if (type === "HomePage") {
            this.pageReference = {
                type: 'comm__namedPage',
                attributes: {
                    name: 'Home'
                }
            }
        }

        // use the NavigationMixin from lightning/navigation to generate the URL for navigation.
        if (this.pageReference) {
            this[NavigationMixin.GenerateUrl](this.pageReference).then(
                (url) => {
                    this.href = url;
                }
            );
        }
    }

    handleNavigation() {
        this.dispatchEvent(new CustomEvent('navigation'));
    }

    handleClick(evt) {
        // use the NavigationMixin from lightning/navigation to perform the navigation.
        evt.stopPropagation();
        evt.preventDefault();
        this.handleNavigation();
        if (this.pageReference) {
            this[NavigationMixin.Navigate](this.pageReference);
        } else {
            console.log(
                `Navigation menu type "${this.item.type
                }" not implemented for item ${JSON.stringify(this.item)}`
            );
        }
    }
    get getClasses() {
        let classes = 'navbar-item-link'
        if (this.active) {
            classes += ' active';
        }
        return classes
    }
    getLastSegment(url) {
        // Split the string by '/'
        const segments = url.split('/');

        // Retrieve the last segment
        const lastSegment = segments[segments.length - 1];

        return '/' + lastSegment;
    }

}