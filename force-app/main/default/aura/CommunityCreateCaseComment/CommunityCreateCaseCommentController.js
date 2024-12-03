({
    handleSave: function(component, event, helper) {
        component.set("v.isLoading", true);  // Show spinner

        var action = component.get("c.createCaseComment");
        action.setParams({
            caseId: component.get("v.caseId"),
            externalComments: component.get("v.externalComments")
        });

        action.setCallback(this, function(response) {
            component.set("v.isLoading", false);  // Hide spinner

            var state = response.getState();
            if (state === "SUCCESS") {
                var appEvent = $A.get("e.c:CaseCommentCreatedEvent");
                appEvent.fire();
                component.find("overlayLib").notifyClose();
            } else {
                // Handle errors
                console.log("Error: " + JSON.stringify(response.getError()));
            }
        });

        $A.enqueueAction(action);
    },

    handleCancel: function(component, event, helper) {
        component.find("overlayLib").notifyClose();
    }
})