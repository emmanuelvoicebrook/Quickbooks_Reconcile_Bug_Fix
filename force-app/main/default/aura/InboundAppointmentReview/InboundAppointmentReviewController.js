({
    
     handleInputChange: function(component, event, helper) {
        // Get the value of the input field that triggered the change event
        var value = event.getSource().get("v.value");
        var fieldName = event.getSource().get("v.name");
         console.log('Updating : ' + fieldName + ' With ' + value);
        // Update the component attribute with the new value
        component.set("v." + fieldName, value);
    },
    
    init: function(cmp, event, helper) {
    // Set the validate attribute to a function that includes validation logic for multiple fields
    cmp.set('v.validate', function() {
        // Retrieve contact field values
        var firstName = cmp.get('v.FirstName');
        var lastName = cmp.get('v.LastName');
        var email = cmp.get('v.Email');
        var phone = cmp.get('v.Phone');

        // Validate each field
        if (firstName && firstName.length > 0 &&
            lastName && lastName.length > 0 &&
            email && email.length > 0 &&
            phone && phone.length > 0) {
            // If all fields are valid...
            return { isValid: true };
        } else {
            // If any of the fields are invalid...
            return { isValid: false, errorMessage: 'Please ensure all contact fields are filled.' };
        }
    });
}

})