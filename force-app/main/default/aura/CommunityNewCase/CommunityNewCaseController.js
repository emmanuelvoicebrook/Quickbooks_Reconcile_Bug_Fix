({
    doInit : function(component, event, helper) {
        // Correct initialization of the action
        var action = component.get("c.getUserDetails"); // Ensure this line is not commented out
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var userDetails = response.getReturnValue();
                component.set("v.accountId", userDetails.AccountId);
                var accountId = userDetails.AccountId;
                var condition = "AccountId = '" + accountId + "' AND No_Longer_with_Company__c = False";
                component.set("v.QueryCondition", condition);
            } else {
                console.error("Failed to fetch account details: " + response.getError());
            }
        });
    
        $A.enqueueAction(action);
    },

    
   handleSubmit: function(component, event, helper) {
        event.preventDefault(); // Prevent default submit
       	var userId = component.get("v.UserId");
       	var accountId = component.get("v.accountId");
        // Check if the required fields are filled
        if ( !userId) {
            // Display an error message if any required field is missing
            alert("Please fill in all required fields.");
            return;
        }
        var fields = event.getParam('fields');
        fields.RecordTypeId = '01280000000UG1AAAW';
        fields.Origin = 'Community Case';
        fields.OwnerId = '00G800000023rwFEAQ';
       	fields.AccountId = accountId;
       	fields.User__c = userId;
        component.find('recordEditForm').submit(fields); // Submit form with fields
    },
    handleSuccess: function(component, event, helper) {
        var payload = event.getParam("response");
        console.log("Record ID: " + payload.id);
        // Redirect to the newly created Case record page
        var navEvt = $A.get("e.force:navigateToSObject");
        navEvt.setParams({
          "recordId": payload.id
        });
        navEvt.fire();
    },
    handleError: function(component, event, helper) {
        var errors = event.getParam("errors");
        console.log("Errors: " + JSON.stringify(errors));
        // Display error message
        alert('Error creating case: ' + JSON.stringify(errors));
    }
})