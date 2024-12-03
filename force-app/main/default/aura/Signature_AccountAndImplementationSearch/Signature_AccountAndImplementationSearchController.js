// Screen1_AccountAndImplementationSelectionController.js
({
    doInit : function(component, event, helper) {
        // Initialize accounts attribute here, potentially querying from server
        // Implementations would be fetched based on the selected account
    },

    onAccountSelected : function(component, event, helper) {
        var selectedAccountId = component.find("accountSelect").get("v.value");
        component.set("v.selectedAccount", selectedAccountId);
        // Query and set implementations related to the selected account
        helper.fetchImplementations(component, selectedAccountId);
    },

    onImplementationSelected : function(component, event, helper) {
        var selectedImplementationId = component.find("implementationSelect").get("v.value");
        component.set("v.selectedImplementation", selectedImplementationId);
        // Additional logic can be performed here if needed
    },

    goToNext : function(component, event, helper) {
        
        // fore event next to parent component
        var NextEvent = component.getEvent("next");
        NextEvent.setParams({
            "NextScreen" : "UserSearch",
            "SelectedAccount" : component.get("v.selectedAccount"),
            "SelectedImplementation" : component.get("v.selectedImplementation")
        });
        NextEvent.fire();

    },

    

    handleChange: function (cmp, event, helper) {

        if(cmp.get("v.selectedAccount") == null || !cmp.get("v.selectedAccount")) {
            // clear implementation list and selected implementation
            cmp.set("v.implementations", []);
            cmp.set("v.selectedImplementation", null);

            return
        }
        
            
        // create a service echo event
        var action = cmp.get("c.getImplementations");
        action.setParams({ accountId : cmp.get("v.selectedAccount") });


        // create a callback that is executed after the server-side action returns
        action.setCallback(this, function(response) {
            var state = response.getState();
            if(state === "SUCCESS") {
                // populate the implementations list attribute with the returned data
                var implementationList  = [];
                for(var i = 0; i < response.getReturnValue().length; i++) {
                    implementationList.push({
                        label: response.getReturnValue()[i].Name,
                        value: response.getReturnValue()[i].Id
                    });
                }
                cmp.set("v.implementations", implementationList);
                // set the compoennt attribute for disablled to false
                cmp.set("v.isDisabled", false);

            }
            else if (state === "INCOMPLETE") {
                console.log("Incomplete");
            }

            else if (state === "ERROR") {
                var errors = response.getError();
                if(errors) {
                    if(errors[0] && errors[0].message) {
                        console.log("Error message: ", errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                }
            }
        });

        // enqueue the action
        $A.enqueueAction(action);
    },

})