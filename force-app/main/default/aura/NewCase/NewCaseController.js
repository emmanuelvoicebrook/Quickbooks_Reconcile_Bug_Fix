({
    init : function (component) {
        // Find the component whose aura:id is "flowData"
        var flow = component.find("flowData");
        // start your flow. Reference the flow’s Unique Name.
        flow.startFlow("Case_Management_Create_Case_Quick_Support");
    }, 
    handleStatusChange : function (component, event) {
       if(event.getParam("status") === "FINISHED") {
          var outputVariables = event.getParam("outputVariables");
           var outputVar;
          for(var i = 0; i < outputVariables.length; i++) {
             outputVar = outputVariables[i];
              var case_number;
             if(outputVar.name === "case_id") {
                var urlEvent = $A.get("e.force:navigateToSObject");
                urlEvent.setParams({
                   "recordId": outputVar.value,
                   "isredirect": "true"
                });
                urlEvent.fire();
             } else if (outputVar.name === "case_number"){
				case_number = outputVar.value;              
             }
              if(case_number){
           var toastEvent = $A.get("e.force:showToast");
            toastEvent.setParams({
                "title": "Success!",
                "message": "Case "+ case_number +" has been created!",
                "type": "success",            
            });
            toastEvent.fire();
                  
              }
              
            $A.get("e.force:closeQuickAction").fire();
          }
        }
    }
})