({
    doInit: function(component, event, helper) {
        var actions = [
            { label: 'View', name: 'view' },
        ];

        component.set('v.columns', [
            {label: 'Comment', fieldName: 'External_Comments__c', type: 'component', typeAttributes: { componentName: 'c:CommunityCaseCommentRenderer', value: { fieldName: 'External_Comments__c' }}},
            {label: 'Created By', fieldName: 'Created_By_Text__c'},
            {label: 'Created Date', fieldName: 'CreatedDate', type: 'date', sortable: 'true', typeAttributes: {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            }, initialWidth: 300},
            { type: 'action', typeAttributes: { rowActions: actions }}
        ]);
        
        var page = component.get("v.page") || 1;
        helper.getData(component, page);
    },

    navigate: function(component, event, helper) {
        var page = component.get("v.page") || 1;
        var direction = event.getSource().get("v.label");
        page = direction === "Previous" ? (page - 1) : (page + 1);

        helper.getData(component, page);
    },

    onSelectChange: function(component, event, helper) {
        var page = 1;
        helper.getData(component, page);
    },

    handleRowAction: function (component, event, helper) {
        var action = event.getParam('action');
        var row = event.getParam('row');
        switch (action.name) {
            case 'view':
                $A.createComponent(
                    "c:CommunityCaseCommentViewModal",
                    {
                        "recordId": row.Id
                    },
                    function(modalComponent, status, errorMessage) {
                        if (status === "SUCCESS") {
                            var body = component.find('overlayLib').get('v.body');
                            body.push(modalComponent);
                            component.find('overlayLib').showCustomModal({
                                header: "Case Comment Details",
                                body: modalComponent,
                                showCloseButton: true,
                                cssClass: "slds-modal_medium",
                                closeCallback: function() {
                                    // Callback after closing the modal
                                }
                            });
                        } else if (status === "INCOMPLETE") {
                            console.log("No response from server or client is offline.");
                        } else if (status === "ERROR") {
                            console.log("Error: " + errorMessage);
                        }
                    }
                );
                break;
        }
    },

    createRecord : function(component, event, helper) {
        $A.createComponent(
            "c:CommunityCreateCaseComment",
            {
                caseId: component.get("v.recordId")
            },
            function(content, status) {
                if (status === "SUCCESS") {
                    var overlayLib = component.find("overlayLib");
                    overlayLib.showCustomModal({
                        header: "Create Case Comment",
                        body: content,
                        showCloseButton: true,
                        cssClass: "slds-modal_medium"
                    });
                } else if (status === "INCOMPLETE") {
                    console.log("No response from server or client is offline.");
                } else if (status === "ERROR") {
                    console.log("Error: " + JSON.stringify(errorMessage));
                }
            }
        );
    },

    handleApplicationEvent: function (component, event, helper) {
        var page = component.get("v.page") || 1;
        helper.getData(component, page);
    },

    
    handleChild: function (component, event, helper) {
        console.log('Handle Child');
        var page = component.get("v.page") || 1;
        helper.getData(component, page);

    },

    updateColumnSorting: function (component, event, helper) {
        var fieldName = event.getParam('fieldName');
        var sortDirection = event.getParam('sortDirection');
        component.set("v.sortedBy", fieldName);
        component.set("v.sortedDirection", sortDirection);
        helper.sortData(component, fieldName, sortDirection);
    }
})