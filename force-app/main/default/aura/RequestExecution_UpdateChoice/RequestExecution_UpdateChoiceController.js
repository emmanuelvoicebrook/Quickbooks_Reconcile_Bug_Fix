({
    doInit: function (component, event, helper) {

        let allOptions = [
            { "label": "Reminder Sent", "value": "reminder_sent", "helperText": "Sets case to 'Executing request'." },
            { "label": "Ready for Training", "value": "ready_for_training", "helperText": "User contact created and added. User has date/time for training." },
            { "label": "Schedule Training", "value": "schedule_training", "helperText": "Allows choice to generate a scheduling link or schedule on behalf of the client." },
            { "label": "Training Owed", "value": "training_owed", "helperText": "Sets case to 'Training Owed'." },
            { "label": "Schedule on Behalf of Client", "value": "schedule_on_behalf_of_client", "helperText": "Provides a screen to choose training date and time." },
            { "label": "Re-Schedule Training", "value": "reschedule_training", "helperText": "Allows rescheduling of the training." },
            { "label": "Training Complete", "value": "training_complete", "helperText": "Training completed successfully." },
            { "label": "Training Complete (Follow-up Needed)", "value": "completed_follow_up", "helperText": "Training completed but follow-up is required." },
            { "label": "User - No Show", "value": "user_no_show", "helperText": "User did not show up for training." },
            { "label": "Incomplete", "value": "incomplete", "helperText": "Training incomplete. Needs rescheduling." },
            { "label": "Close - Duplicate", "value": "close_duplicate", "helperText": "Closes case as a duplicate." },
            { "label": "Profile Creation", "value": "profile_creation", "helperText": "This closes the case, but requires the case to be of 'Profile Creation' type" },
            { "label": "Client Cancel", "value": "client_cancel", "helperText": "Client cancelled and needs rescheduling. Provides the rescheduling screen." },
            { "label": "Cancel Training", "value": "cancel_training", "helperText": "Cancels the training; it will not be available." },
            { "label": "Close Case", "value": "close_case", "helperText": "Closes the case." }
        ];
        
        
        
        let TransitionMatrix = {
            'New': ['schedule_training',  'training_owed', 'close_duplicate', 'cancel_training'],
            'Open': ['schedule_training', 'training_owed', 'close_duplicate', 'cancel_training'],
            'Needs Scheduling': ['schedule_on_behalf_of_client', 'ready_for_training', 'close_duplicate', 'cancel_training'],
            'Training Owed': ['ready_for_training', 'schedule_training'],
            'Awaiting Execution': ['reminder_sent', 'reschedule_training', 'cancel_training'],
            'Executing Request': ['training_complete', 'completed_follow_up', 'user_no_show', 'incomplete', 'profile_creation', 'client_cancel', 'cancel_training'],
            'Request Complete': ['close_case']
        };
        
        let caseStatus = component.get("v.caseStatus");
        let currentOptions;
        try {

            // Ensure that caseStatus is defined
            if (!caseStatus) {
                throw new Error('The Case Status is undefined or null');
            }

           currentOptions = TransitionMatrix[caseStatus];
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