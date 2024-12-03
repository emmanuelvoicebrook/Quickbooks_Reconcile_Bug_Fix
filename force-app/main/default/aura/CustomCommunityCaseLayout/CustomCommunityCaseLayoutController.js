({
    // This method will be called when the component is initialized
    doInit : function(component, event, helper) {
        var caseId = component.get("v.recordId");

        // Call the Apex method to check if it's a Training Execution case
        var action = component.get("c.isTrainingExecutionCase");
        action.setParams({ caseId: caseId });

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var isTrainingExecution = response.getReturnValue();
                // Set the isTrainingExecutionCase attribute based on the result
                component.set("v.isTrainingExecutionCase", isTrainingExecution);
            } else {
                console.error("Failed to check if case is a training execution.");
            }
        });

        $A.enqueueAction(action);
        
        
        var checkIfClosed = component.get("c.isClosed");
        checkIfClosed.setParams({ caseId: caseId });

        checkIfClosed.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var isCaseClosed = response.getReturnValue();
                // Set the isTrainingExecutionCase attribute based on the result
                component.set("v.isCaseClosed", isCaseClosed);
            } else {
                console.error("Failed to check if case is closed.");
            }
        });

        $A.enqueueAction(checkIfClosed);
        
    }
})