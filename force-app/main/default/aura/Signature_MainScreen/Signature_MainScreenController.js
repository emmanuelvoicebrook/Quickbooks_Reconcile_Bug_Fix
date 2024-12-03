({
    doInit: function (component, event, helper) {
        // document.body.setAttribute('style', 'overflow: hidden;')
    },
    handleAccountAndImplementationSelection: function (component, event, helper) {
        // Set selected account and implementation, then navigate to user search and signature screen
        component.set("v.selectedAccount", event.getParam("selectedAccount"));
        component.set("v.selectedImplementation", event.getParam("selectedImplementation"));
        component.set("v.currentScreen", "userSearchAndSignature");
    },

    handleUserSearchAndSignature: function (component, event, helper) {
        // Handle user selection and signature saving
        // This method will also handle the logic to decide if another signature is needed
    },

    handleAddAnother: function (component, event, helper) {
        // Logic to handle when a user wants to add another signature.
        // This could reset the selectedUser attribute and keep the current screen as 'userSearchAndSignature'
    },

    handleNext: function (component, event, helper) {
        var NextScreen = event.getParam("NextScreen");
        var selectedAccount = event.getParam("SelectedAccount");
        var selectedImplementation = event.getParam("SelectedImplementation");
        var SelectedUserId = event.getParam("SelectedUserId");


        if (selectedAccount !== null && selectedAccount !== undefined) {
            component.set("v.selectedAccount", selectedAccount);
        }
        if (selectedImplementation !== null && selectedImplementation !== undefined) {
            component.set("v.selectedImplementation", selectedImplementation);
        }
        if (SelectedUserId !== null && SelectedUserId !== undefined) {
            component.set("v.selectedUserId", SelectedUserId);
        }

        component.set("v.currentScreen", NextScreen);
        component.set("v.showBackButton", true);
        if (NextScreen == 'GetSignature') {
            // set loading to true
            component.set("v.loading", true);
        }
    },

    handleBack: function (component, event, helper) {
        var currentScreen = component.get("v.currentScreen");
        // if the current screen is user search, set the selected user to null and set the current screen to account and implementation selection and set showBackButton to false
        // else if the current screen is signature, set the current screen to user search and signature

        if (currentScreen === 'UserSearch') {
            component.set("v.selectedUser", null);
            component.set("v.currentScreen", "AccountAndImplementation");
            component.set("v.showBackButton", false);
        } else if (currentScreen === 'GetSignature') {
            component.set("v.currentScreen", "UserSearch");
        }
    },

    handleLoaded: function (component, event, helper) {
        // Handle the loaded event from the signature component
        // This will set the showNext attribute to true
        component.set("v.loading", false);
    }
})