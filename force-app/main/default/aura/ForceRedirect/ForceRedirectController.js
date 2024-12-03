({
    invoke : function(component) {
        console.log("Connected");
        var recordId = component.get("v.recordId");
        console.log("Record Id:" + recordId);
        var url = "/"+recordId;
        var navEvt = $A.get("e.force:navigateToURL");
        navEvt.setParams({
            "url": url
        });
        navEvt.fire();
    },
    provide: function (component, event, helper) {
    // You might want to do the redirection here instead of in the init method.
    helper.invoke(component);
    var navigate = component.get('v.navigateFlow');
    navigate('NEXT');
},

cancel: function (component, event, helper) {
    var navigate = component.get('v.navigateFlow');
    navigate('BACK');
}

})