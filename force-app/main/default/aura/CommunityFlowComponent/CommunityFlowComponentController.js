({
    startFlow : function(component, event, helper) {
        var flowApiName = component.get("v.flowApiName");
        var recordId = component.get("v.recordId");

        // Create input variables for the flow
        var inputVariables = [
            {
                name: "recordId", 
                type: "String", 
                value: recordId
            }
        ];

        // Find the flow component and start the flow
        var flow = component.find("flowData");
        if (flow) {
            flow.startFlow(flowApiName, inputVariables);
        } else {
            console.error("Flow component not found.");
        }
    },

    handleStatusChange: function(component, event, helper) {
        var status = event.getParam("status");
        // When flow finishes, close the modal
        if (status === "FINISHED") {
            var appEvent = $A.get("e.c:CaseCommentCreatedEvent");
            appEvent.fire();
            component.find("overlayLib").notifyClose();
        }
    }
})