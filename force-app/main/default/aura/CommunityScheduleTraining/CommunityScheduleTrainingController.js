({
    doInit : function(component, event, helper) {
        var caseId = component.get("v.recordId");
        var action = component.get("c.isTrainingExecutionCase");
        action.setParams({ caseId: caseId });
        
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var isTrainingExecution = response.getReturnValue();
                if (isTrainingExecution) {
                    component.set("v.showButton", true);
                    helper.checkCanScheduleTraining(component);
                } else {
                    component.set("v.showButton", false);
                }
            } else {
                console.error("Failed to check if case is a training execution.");
            }
        });
        $A.enqueueAction(action);
    },

    openModal : function(component, event, helper) {
        var flowApiName = component.get("v.flowApiName");
        var recordId = component.get("v.recordId");
    
        // Dynamically create the Flow component
        $A.createComponent(
            "c:CommunityFlowComponent",
            {
                "flowApiName": flowApiName,
                "recordId": recordId
            },
            function(modalComponent, status, errorMessage) {
                if (status === "SUCCESS") {
                    component.find('overlayLib').showCustomModal({
                        header: "Case Management",
                        body: modalComponent,
                        showCloseButton: true,
                        cssClass: "slds-modal_large",
                        closeCallback: function() {
                            console.log("Flow modal closed.");
                        }
                    });
                } else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.");
                } else if (status === "ERROR") {
                    console.log("Error: " + errorMessage);
                }
            }
        );
        /*$A.createComponent(
        "lightning:flow",
        {
            "aura:id": "flowData",
            "flowApiName" : 'Case_Management_Schedule_Training_Community'
        },
        function(content, status) {
            if (status === "SUCCESS") {
                var overlayLib = component.find("overlayLib");
                overlayLib.showCustomModal({
                    header: "Schedule Training",
                    body: content,
                    showCloseButton: true,
                    cssClass: "slds-modal_medium"
                });
            } else if (status === "INCOMPLETE") {
                console.log("No response from server or client is offline.");
            } else if (status === "ERROR") {
                console.error("Error: " + status);
            }
        }
    );*/
    },

    handleStatusChange : function(component, event, helper) {
        if (event.getParam("status") === "FINISHED") {
            var modalReference = component.get("v.modalReference");
            if (modalReference) {
                modalReference.close();
            }
        }
    },
    
    refreshPage: function(component, event, helper) {
        // Fire the force:refreshView event to refresh the page
        var refreshEvent = $A.get("e.force:refreshView");
        if (refreshEvent) {
            refreshEvent.fire();
        }
    },
})