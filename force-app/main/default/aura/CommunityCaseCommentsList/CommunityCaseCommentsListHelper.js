({
    getData: function(component, page) {
        this.showSpinner(component);
        var recordToDisplay = component.get("v.tableSize");
        var parentRecordId = component.get("v.recordId");

        console.log('Page Number: ' + page)
        console.log('Record to Display: ' + recordToDisplay)
        console.log('Parent Record: ' + parentRecordId)
        
        var action = component.get("c.fetchData");
        action.setParams({
            infoJSON : JSON.stringify({
                "pageNumber": page,
                "recordToDisplay": recordToDisplay,
                "parentRecordId": parentRecordId,
                "recordId": null
            })
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                console.log('Results');
                console.log(result);
                component.set("v.data", result.data);
                component.set("v.page", result.page);
                component.set("v.total", result.total);
                component.set("v.pages", Math.ceil(result.total / recordToDisplay));
                this.hideSpinner(component);                
            } else if (state === "ERROR") {
                console.log('This is an error:');
                //this.handleResponseError(component, response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    deleteRecord: function (component, page, recordId) {
        this.showSpinner(component);
        var recordToDisplay = component.get("v.tableSize");
        var parentRecordId = component.get("v.recordId");
        var action = component.get("c.deleteRecord");
        action.setParams({
            infoJSON : JSON.stringify({
                "pageNumber": page,
                "recordToDisplay": recordToDisplay,
                "parentRecordId": parentRecordId,
                "recordId": recordId
            })
        });
        action.setCallback(this, function(response) {
            var state = response.getState();
            if (state === "SUCCESS") {
                var result = response.getReturnValue();
                component.set("v.data", result.data);
                component.set("v.page", result.page);
                component.set("v.total", result.total);
                component.set("v.pages", Math.ceil(result.total / recordToDisplay));
                this.hideSpinner(component);
                this.showToast(component, 'success', 'Object was deleted.');
            } else if (state === "ERROR") {
                this.handleResponseError(component, response.getError());
            }
        });
        $A.enqueueAction(action);
    },

    sortData: function (component, fieldName, sortDirection) {
        this.showSpinner(component);
        var data = component.get("v.data");
        var reverse = sortDirection !== 'asc';
        data.sort(this.sortBy(fieldName, reverse));
        component.set("v.data", data);
        this.hideSpinner(component);
    },

    sortBy: function (field, reverse, primer) {
        var key = primer ?
            function(x) {return primer(x[field])} :
            function(x) {return x[field]};
        reverse = !reverse ? 1 : -1;
        return function (a, b) {
            return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
        }
    },

    showSpinner: function (component) {
        var spinner = component.find("spinner");
        $A.util.removeClass(spinner, "slds-hide");
    },

    hideSpinner: function (component) {
        var spinner = component.find("spinner");
        $A.util.addClass(spinner, "slds-hide");
    },

    showToast : function(component, type, message) {
        var toastEvent = $A.get("e.force:showToast");
        toastEvent.setParams({
            title : 'Related List Message',
            message: message,
            duration: '3000',
            key: 'info_alt',
            type: type,
            mode: 'pester'
        });
        toastEvent.fire();
    },

    handleResponseError: function (component, errors) {
        if (errors) {
            if (errors[0] && errors[0].message) {
                this.showToast(component, 'error', "Error message: " +
                    errors[0].message);
            }
        } else {
            this.showToast(component, 'error', 'Unknown error.');
        }
        this.hideSpinner(component);
    }
})