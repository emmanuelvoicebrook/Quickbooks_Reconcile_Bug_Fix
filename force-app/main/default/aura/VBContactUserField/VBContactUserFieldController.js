({
    init: function (component, event, helper) {
        //SET THE VALIDATION ACTION FUNCTION
        component.set("v.validate", function() {
            var isValid = true;
            var AccountId = component.get("v.AccountId");
            var ContactId = component.get("v.ContactId");
            var UserId = component.get("v.UserId");
            if (!AccountId) {
                isValid = false;
                component.set("v.ErrorMessage", "Account is required");
            }
            else if (!ContactId) {
                isValid = false;
                component.set("v.ErrorMessage", "Contact is required");
            }
            else if (!UserId) {
                isValid = false;
                component.set("v.ErrorMessage", "User is required");
            }
            return {
                isValid: isValid,
                errorMessage: component.get("v.ErrorMessage")
            };
        
        });
    },
    handleAccChange: function (component, event, helper) {
        // GET THE ACCOUNT ID 
        var AccountId = component.get("v.AccountId");
        console.log('AccountId: ' + AccountId);
        // SET THE QUERY CONDITION TO GET THE CONTACTS
        var condition = "AccountId = '" + AccountId + "'";
        component.set("v.QueryCondition", condition);
    },

    handleCheckbox: function (component, event, helper) {

        // check if the checkbox is checked (true) or not (false)
        var isChecked = component.find("checkbox").get("v.checked");

        if (isChecked) {
            // GET THE SELECTED CONTACT
            var ContactId = component.get("v.ContactId");
            // SET THE SELECTED USER
            component.find("UserId").fireChanging(ContactId)
        } 
    },

    handleUserChange: function (component, event, helper) {
        // unchecked the checkbox
        component.find("checkbox").set("v.checked", false);
    }
})