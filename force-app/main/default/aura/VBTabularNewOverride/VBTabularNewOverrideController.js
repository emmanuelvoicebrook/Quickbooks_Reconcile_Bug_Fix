({
    
    handleModalClose : function(component, event, helper) {
        console.log('Modal Closed');
        let urlString = window.location.href;
        let baseURL = urlString.substring(0, urlString.indexOf("/lightning"));
        console.log(baseURL);
        var urlEvent = $A.get("e.force:navigateToURL");
        urlEvent.setParams({
        "url": baseURL +"/lightning/o/VB_Tabular_Form__c/list?filterName=Recent"
        });
        urlEvent.fire();

        var workspaceAPI = component.find("workspace")
        workspaceAPI.getFocusedTabInfo().then(function(response) {
            var focusedTabId = response.tabId;
            workspaceAPI.closeTab({tabId: focusedTabId});
        })
        .catch(function(error) {
            console.log(error);
        });
    },
})