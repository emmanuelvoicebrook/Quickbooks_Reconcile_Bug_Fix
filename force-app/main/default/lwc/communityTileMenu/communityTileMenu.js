import { LightningElement, api, wire, track } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import NavigationImages from '@salesforce/resourceUrl/CommunityNavigation';
import getNavigationMenuItems from '@salesforce/apex/NavigationMenuItemsController.getNavigationMenuItems';
import isGuestUser from '@salesforce/user/isGuest';
import basePath from '@salesforce/community/basePath';

/**
 * This is a custom LWC navigation menu component.
 * Make sure the Guest user profile has access to the NavigationMenuItemsController apex class.
 */
export default class CommunityTileMenu extends NavigationMixin(LightningElement) {
    @api buttonLabel;
    @api buttonRedirectPageAPIName;
    @api menuName;


    testImage = NavigationImages + "/Images/FAQ.jpg"
    error;

    href = basePath;
    isLoaded;
    menuItems = [];

    publishedState;


    @wire(getNavigationMenuItems, {
        menuName: '$menuName',
        publishedState: '$publishedState'
    })
    wiredMenuItems({ error, data }) {
        if (data && !this.isLoaded) {
            this.menuItems = data
                .map((item, index) => {

                    return {
                        target: item.Target,
                        id: index,
                        label: item.Label,
                        defaultListViewId: item.DefaultListViewId,
                        type: item.Type,
                        accessRestriction: item.AccessRestriction,
                        image: NavigationImages + "/Images/" + this.refineLabel(item.Label) + ".jpg"
                    };
                })
                .filter((item) => {
                    // Only show "Public" items if guest user
                    return (
                        item.accessRestriction === 'None' ||
                        (item.accessRestriction === 'LoginRequired' &&
                            !isGuestUser)
                    );
                });
            this.error = undefined;
            this.isLoaded = true;

        } else if (error) {
            this.error = error;
            this.menuItems = [];
            this.isLoaded = true;
            console.log(`Navigation menu error: ${JSON.stringify(this.error)}`);
        }
    }

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

    handleClick() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                name: this.buttonRedirectPageAPIName
            }
        });
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

}