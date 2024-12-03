import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class CommunityBackButton extends NavigationMixin(LightningElement) {
    @api pageName;

    navigateToPage() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: this.pageName
            }
        });
    }
}