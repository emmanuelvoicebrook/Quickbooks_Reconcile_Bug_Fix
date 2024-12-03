({
    doInit: function(component, event, helper) {
        // Retrieve the email and recordId attributes
        var email = component.get("v.email");
        var recordId = component.get("v.recordId");

        // Check if either email or recordId is missing
        if (!email || !recordId) {
            // Set the error message if variables are missing
            var errorMessage = "Error: Missing required variables. There seems to be an issue with the link. Please check the link and try again.";
            component.set("v.errorMessage", errorMessage);
        } else {
            // Both variables are present, start the flow
            var flow = component.find("flowData");
            
            // Prepare input variables for the flow
            var inputVariables = [
                { name: "Email", type: "String", value: email },
                { name: "recordId", type: "String", value: recordId }
            ];

            // Start the flow with the provided variables
            var flowName = "jrsl_ul_Unsubscribe_Link"; // Replace with your flow's API name
            flow.startFlow(flowName, inputVariables);
        }
    },

    handleStatusChange: function(component, event, helper) {
        if (event.getParam("status") === "FINISHED") {
            // Redirect to voicebrook.com when the flow finishes
            window.location.href = "https://www.voicebrook.com";
        }
    }
})