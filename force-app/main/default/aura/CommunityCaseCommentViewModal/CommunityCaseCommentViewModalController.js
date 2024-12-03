({
    doInit: function(component, event, helper) {
        var recordId = component.get("v.recordId");
        var action = component.get("c.getCaseComment");
        action.setParams({ recordId: recordId });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                component.set("v.caseComment", response.getReturnValue());
            }
            component.set("v.isLoading", false);  // Hide spinner
        });
        $A.enqueueAction(action);
    },

    closeModal: function(component, event, helper) {
        component.destroy();
    }
})