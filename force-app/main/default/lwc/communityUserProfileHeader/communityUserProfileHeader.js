import { LightningElement, track, api, wire } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getUserDetails from '@salesforce/apex/NavigationMenuItemsController.getUserDetails';


export default class CommunityUserProfileHeader extends NavigationMixin(LightningElement)  {
    @track isDropdownOpen = false;
    @api userName = '';
    @api userAvatar = '';
    @api companyName = '';

    @wire(getUserDetails)
    processUserDetals(res){
        if(res.data){
            this.userName = res.data.Name	
            this.userAvatar = res.data.SmallPhotoUrl
            this.companyName = res.data.CompanyName 
        }
    }

    toggleDropdown(event) {
        event.stopPropagation();
        event.preventDefault();
        this.isDropdownOpen = !this.isDropdownOpen;
    }   

    handleLogout() {
        // Implement the logic to log out the user
        // This can be a call to an Apex controller or a direct navigation to the logout URL
        // Example:
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/login'
            }
        });
    }

    // Optional: close the dropdown when clicking outside
    handleDocumentClick(event) {
        if (!this.template.contains(event.target)) {
            this.isDropdownOpen = false;
        }
    }

    connectedCallback() {
        document.addEventListener('click', this.handleDocumentClick.bind(this));
    }

    disconnectedCallback() {
        document.removeEventListener('click', this.handleDocumentClick.bind(this));
    }
}