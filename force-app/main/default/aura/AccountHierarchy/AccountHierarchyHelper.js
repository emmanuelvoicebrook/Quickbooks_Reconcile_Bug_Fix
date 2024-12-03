({
    getAccountId : function(component, event, helper) {
        console.log("Calling getAccountId");
        var action = component.get("c.getAccountId");  // Assuming this retrieves the Account ID
        var impId = component.get("v.recordId");
        action.setParams({"impId" : impId});
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log("Account ID retrieved: " + result);
                component.set("v.accountId", result);

                // Now, after successfully getting accountId, call the other helper functions
                console.log("Calling checkForParent after getting Account ID");
                helper.checkForParent(component, event, helper);

                console.log("Calling checkForChildren after getting Account ID");
                helper.checkForChildren(component, event, helper);
            } else {
                console.error("Error in getAccountId: ", response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    checkForParent : function(component, event, helper) {
        console.log("Calling checkForParent");
        var acctId = component.get('v.accountId');
        if (!acctId) {
            console.error("Account ID is not set, cannot check for parent");
            return;
        }

        var action = component.get("c.hasParent");
        action.setParams({"accountId": acctId});

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log("Parent check result: " + result);
                component.set("v.hasParent", result);
            } else {
                console.error("Error in checkForParent: ", response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    checkForChildren : function(component, event, helper) {
        console.log("Calling checkForChildren");
        var acctId = component.get('v.accountId');
        if (!acctId) {
            console.error("Account ID is not set, cannot check for children");
            return;
        }

        var action = component.get("c.numChildren");
        action.setParams({"accountId": acctId});

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log("Children check result: " + result);
                component.set("v.numChildren", result);
                if(result == 1) {
                    component.set("v.childOrChildren", "child");
                } else {
                    component.set("v.childOrChildren", "children");
                }
            } else {
                console.error("Error in checkForChildren: ", response.getError());
            }
        });
        $A.enqueueAction(action);
    }
})