import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class NavigateButton extends NavigationMixin(LightningElement) {

    @api pageName;
    @api buttonLabel;

    navigateToNewCase() {
        this[NavigationMixin.Navigate]({
            type: 'comm__namedPage',
            attributes: {
                pageName: this.pageName
            }
        });
    }
}