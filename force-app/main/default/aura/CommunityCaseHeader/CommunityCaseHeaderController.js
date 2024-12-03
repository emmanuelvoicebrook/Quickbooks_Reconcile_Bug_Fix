({
    handleRecordUpdated: function(component, event, helper) {
        var eventParams = event.getParams();
        if(eventParams.changeType === "LOADED") {
            // Record is loaded successfully
        } else if(eventParams.changeType === "CHANGED") {
            // Record is changed successfully
        } else if(eventParams.changeType === "REMOVED") {
            // Record is deleted
        } else if(eventParams.changeType === "ERROR") {
            // There’s an error while loading, saving, or deleting the record
        }
    }
})