({
    checkCanScheduleTraining : function(component) {
        var caseId = component.get("v.recordId");

        var action = component.get("c.canScheduleTraining");
        action.setParams({ caseId: caseId });

        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var canSchedule = response.getReturnValue();
                component.set("v.isButtonDisabled", !canSchedule);
            } else {
                console.error("Failed to retrieve scheduling status.");
            }
        });
        $A.enqueueAction(action);
    }
})