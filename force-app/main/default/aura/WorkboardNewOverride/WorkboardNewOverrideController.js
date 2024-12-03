({
    init : function(component){
        var flow = component.find("flowData")
        flow.startFlow("IT_Workboard_Item_Creation");
    },
    
    exit : function (component, event, helper){
        console.log('I have been click');
        let urlString = window.location.href;
        let baseURL = urlString.substring(0, urlString.indexOf("/lightning"));
        console.log(baseURL);
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
        "url": baseURL +"/lightning/o/Workboard_Item__c/list?filterName=Recent"
        });
        urlEvent.fire();
    }

})