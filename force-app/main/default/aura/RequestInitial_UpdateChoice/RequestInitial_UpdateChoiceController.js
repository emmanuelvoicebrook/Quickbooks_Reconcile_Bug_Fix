({
    doInit: function (component, event, helper) {
        let opportunityExists = component.get("v.opportunityExists")
        let isTraining = component.get("v.caseType") === 'Initial Training';

        let allOptions = [
            { 'label': 'More Information Is Needed!', 'value': 'Gathering Info', 'helperText': 'Specific user(s) training requested. Send Questionnaire to client.' },
            { 'label': 'Take ownership', 'value': 'Take Ownership', 'helperText': 'Assigns case to you. If was assigned to "Needs Analysis Queue", sets status to "Analyzing Request"; otherwise, "Gathering Info"' },
            { 'label': 'Analysis is required', 'value': 'Analysis Needed', 'helperText': 'Sets case status to new, assigns it to the "Needs Analysis queue" and notifies the members.' },
            { 'label': isTraining ? 'Necessary Information Obtained!' : 'I am doing analysis', 'value': 'Analyzing Request', 'helperText': 'Sets the case to analyzing request. Quote need is also going to be assed.' },
            { 'label': 'Awaiting Client Action', 'value': 'On Hold - Client', 'helperText': 'Place the case on hold awaiting client action.' },
            { 'label': 'Awaiting Internal Action', 'value': 'On Hold - Internal', 'helperText': 'Place the case on hold while awaiting internal action.' },
            { 'label': 'Quote Needed', 'value': 'Quote', 'helperText': 'Creates an opportunity which turns to a quote. This includes $0 quotes.' },
            { 'label': 'Create Training Execution Case', 'value': 'Training Exec Case', 'helperText': 'Completed this request and creates a training execution case.' },
            { 'label': 'Ready to Execute', 'value': 'Ready to Execute', 'helperText': 'Converts the case record type to a \'Request Execution\' case and assigns it to the \'Request Queue\'.' },
            { 'label': 'Request Cancelled', 'value': 'Cancelled', 'helperText': 'Client no longer needs the request.' },
            { 'label': 'Close Case', 'value': 'Closed', 'helperText': 'Closes the case.' },
            { 'label': 'Close as Duplicate', 'value': 'Closed - Duplicate', 'helperText': 'Similar request already exists. Please close this case.' },
            { 'label': 'Re-Open Case', 'value': 'Re-Open', 'helperText': 'Re-Open this case' },
        ];


        let InitialTraining_TransitionMatrix = {
            'New': ['Gathering Info', 'On Hold - Client', 'On Hold - Internal', 'Analyzing Request', 'Cancelled', 'Closed', 'Closed - Duplicate'],
            'Open': ['Gathering Info', 'On Hold - Client', 'On Hold - Internal', 'Analyzing Request', 'Cancelled', 'Closed', 'Closed - Duplicate'],
            'Gathering Info': ['On Hold - Client', 'On Hold - Internal', 'Analyzing Request', 'Cancelled', 'Closed', 'Closed - Duplicate'],
            'On Hold - Client': ['Gathering Info', 'On Hold - Internal', 'Analyzing Request', 'Cancelled', 'Closed', 'Closed - Duplicate'],
            'On Hold - Internal': ['Analyzing Request', 'On Hold - Client', 'Cancelled', 'Closed', 'Closed - Duplicate'],
            'Analyzing Request': ['On Hold - Client', 'On Hold - Internal', 'Quote', 'Training Exec Case', 'Cancelled', 'Closed', 'Closed - Duplicate'],
            'Closed': ['Re-Open']  // For instance, once a case is closed, it might have no available next statuses.
        };

        let OtherRequests_TransitionMatrix = {
            'New': ['Take Ownership', 'On Hold - Client', 'On Hold - Internal', 'Closed - Duplicate'],
            'Open': ['Take Ownership', 'On Hold - Client', 'On Hold - Internal', 'Closed - Duplicate'],
            'Gathering Info': ['Analyzing Request', 'On Hold - Client', 'On Hold - Internal', 'Closed', 'Closed - Duplicate'],
            'On Hold - Client': ['Gathering Info', 'On Hold - Internal', 'Analyzing Request', 'Closed', 'Closed - Duplicate'],
            'On Hold - Internal': ['Analyzing Request', 'On Hold - Client', 'Closed', 'Closed - Duplicate'],
            'Analyzing Request': ['Quote', 'On Hold - Client', 'On Hold - Internal', 'Ready to Execute', 'Closed', 'Closed - Duplicate'],
            'Closed': ['Re-Open']  // For instance, once a case is closed, it might have no available next statuses.
        };


        let caseStatus = component.get("v.caseStatus");
        // Get available statuses based on the matrix and doesn't include Quote if opportunity exists
        let currentOptions;
        try {

            // Ensure that caseStatus is defined
            if (!caseStatus) {
                throw new Error('The Case Status is undefined or null');
            }

            if (isTraining) {
                if (!InitialTraining_TransitionMatrix[caseStatus]) {
                    throw new Error('Case Status not found in InitialTraining_TransitionMatrix');
                }
                currentOptions = InitialTraining_TransitionMatrix[caseStatus];
            } else {
                if (!OtherRequests_TransitionMatrix[caseStatus]) {
                    throw new Error('Case Status not found in OtherRequests_TransitionMatrix');
                }
                currentOptions = OtherRequests_TransitionMatrix[caseStatus];
            }
        } catch (error) {
            console.error("An error occurred:", error.message);
            // set errorMessage and hasError attributes
            component.set("v.errorMessage", error.message);
            component.set("v.hasError", true);
            return;
        }

        try {
            // Ensure allOptions and currentOptions are arrays
            if (!Array.isArray(allOptions) || !Array.isArray(currentOptions)) {
                throw new Error('allOptions or currentOptions is not an array');
            }
        
            // Filter allOptions to only include the currentOptions
            let radioOptions = allOptions.filter(function (option) {
                return option && currentOptions.includes(option.value);
            });
        
            // If opportunity exists, remove quote from the options
            if (opportunityExists) {
                radioOptions = radioOptions.filter(function (option) {
                    return option && option.value !== 'Quote';
                });
            }
        
            component.set("v.options", radioOptions);
        
            component.set('v.validate', function () {
                let radioSelection = component.get('v.selectedOption'); // Assuming 'v.value' holds the radio button selection
                if (radioSelection) {
                    // If a radio button is selected...
                    return { isValid: true };
                } else {
                    // If no radio button is selected...
                    return { isValid: false, errorMessage: 'A selection is required.' };
                }
            });
        } catch (error) {
            console.error("An error occurred:", error.message);
            // set errorMessage and hasError attributes
            component.set("v.errorMessage", error.message);
            component.set("v.hasError", true);
        }

    },

    handleRadioChange: function (component, event, helper) {
        console.log('handleRadioChange');
        console.log('Value', event.target.value);
        let selectedOption = event.target.value;
        component.set('v.selectedOption', selectedOption);
    },
})