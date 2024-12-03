({
    init : function (component) {
        let pageRef = component.get("v.pageReference");
        let state = pageRef.state; // state holds any query params
        let base64Context = state.inContextOfRef;
        if ( base64Context.startsWith("1\.") ) {
            base64Context = base64Context.substring( 2 );
        }
        let addressableContext = JSON.parse( window.atob( base64Context ) );
        component.set( "v.recordId", addressableContext.attributes.recordId );
        
        var recordId = component.get("v.recordId"); // gets the current record ID
        
        console.log('Record Id: ' + recordId);
        
        // Find the component whose aura:id is "flowData"
        var flow = component.find("flowData");
        // Prepare input variables for the flow
        var inputVariables = [
            {
                name : "RecordId", // Replace with the API Name of the Flow Variable
                type : "String",
                value : recordId
            }
        ];
        // start your flow. Reference the flow’s Unique Name.
        flow.startFlow("New_Project_Team_Member", inputVariables);
    },
    
    handleStatusChange : function (component, event) {
       if(event.getParam("status") === "FINISHED") {    
            $A.get("e.force:closeQuickAction").fire();
       }
    }

})