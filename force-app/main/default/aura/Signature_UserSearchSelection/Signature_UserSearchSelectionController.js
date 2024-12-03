({
    doInit: function (component, event, helper) {
        var selectedImplementation = component.get("v.selectedImplementation");
        var queryCondition = "Implementation__c = '" + selectedImplementation + "' AND Status__c = 'Active'";
        // set query condition attribute
        component.set("v.queryCondition", queryCondition);
    },

    goToNext: function (component, event, helper) {

        // validate email 
        var email = component.get("v.email");
        
        var re = /\S+@\S+\.\S+/;
        var valid = re.test(email);

        if (!valid) {
            // set error attribute
            component.set("v.error", "Invalid email");
            return;
        }

        // fore event next to parent component
        var NextEvent = component.getEvent("next");
        var SelectedUserId = component.get("v.selectedUser");

        // create a service echo event to checkForSignatureAndGetName
        var action = component.get("c.CheckForsignature");
        action.setParams({
            "userId": SelectedUserId,
            "email": email
        });

        // create a callback that is executed after the server-side action returns
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var hasSignature = response.getReturnValue();

                if (hasSignature.hasSignature) {
                    var error = hasSignature.Name + " already has a signature";
                    // set error attribute
                    component.set("v.error", error);
                    return;
                }

                NextEvent.setParams({
                    "NextScreen": "GetSignature",
                    "SelectedUserId": SelectedUserId

                });
                NextEvent.fire();

            }
            else if (state === "INCOMPLETE") {
                console.log("Incomplete");
                // set error attribute
                component.set("v.error", "Incomplete");

            }

            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
                        console.log("Error message: ", errors[0].message);
                        // set error attribute
                        component.set("v.error", errors[0].message);
                    }
                } else {
                    console.log("Unknown error");
                    // set error attribute
                    component.set("v.error", "Unknown error");
                }
            }
        });

        // enqueue the action
        $A.enqueueAction(action);

    },

    goBack: function (component, event, helper) {

        // fore event next to parent component
        var NextEvent = component.getEvent("next");
        NextEvent.setParams({
            "NextScreen": "AccountAndImplementation",
        });
        NextEvent.fire();

    },

    handleChange: function (component, event, helper) {
        // get the selected user
        var selectedUser = component.get("v.selectedUser");
        
        // create a service echo event to checkForSignatureAndGetName
        var action = component.get("c.getEmail");
        action.setParams({
            "userId": selectedUser
        });

        // create a callback that is executed after the server-side action returns
        action.setCallback(this, function (response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var email = response.getReturnValue();
                // set email attribute
                component.set("v.email", email);
            }
            else if (state === "INCOMPLETE") {
                console.log("Incomplete");
            }
            else if (state === "ERROR") {
                var errors = response.getError();
                if (errors) {
                    if (errors[0] && errors[0].message) {
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