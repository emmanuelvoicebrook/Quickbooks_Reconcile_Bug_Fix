({
    init : function(component){
        var flow = component.find("flowData")
        flow.startFlow("New_Ticket_Creation");
    },
    
    exit : function (component, event, helper){
        let urlString = window.location.href;
        let baseURL = urlString.substring(0, urlString.indexOf("/lightning"));
        console.log(baseURL);
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
        "url": baseURL +"/lightning/o/Case/list?filterName=Recent"
        });
        urlEvent.fire();
    }

})