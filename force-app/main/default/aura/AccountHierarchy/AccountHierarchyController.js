({
    init : function(component, event, helper) {
        helper.getAccountId(component, event, helper);
    },

    navigateToAccountHierarchy: function(component, event, helper) {
        var acctId = component.get('v.accountId');
        console.log("Account Id: "  +acctId)
        var evt = $A.get("e.force:navigateToComponent");
        evt.setParams({
            componentDef: "sfa:hierarchyFullView",
            componentAttributes: {
                recordId: acctId,
                sObjectName: "Account"
            }
        });
        evt.fire();
    }
})