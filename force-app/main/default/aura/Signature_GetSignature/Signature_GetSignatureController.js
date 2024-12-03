({
    doInit: function (component, event, helper) {
        var selectedUserId = component.get("v.SelectedUserId");
        var selectedAccountId = component.get("v.SelectedAccountId");
        // https://voicebrook--main--c.sandbox.vf.force.com/apex/Signature?id=a0E3400000PjJYrEAN
        
        var vfPageUrl = "https://voicebrook.lightning.force.com/apex/Signature?id=" + selectedUserId;
        // set vfPageUrl attribute
        component.set("v.vfPageUrl", vfPageUrl);

        component.set("v.ready", true);



        window.addEventListener("message", function (event) {
            // Check the origin of the message for security
            // if(event.origin !== "EXPECTED_ORIGIN") return;

            var messageData = JSON.parse(event.data);
            // Handle the message data received from VF Page

            // if message from VF page has status complete then show next button
            if (messageData.status === "complete") {
                // set the next button to visible
                component.set("v.showNext", true);
            } else if (messageData.status === "loaded") {

                // fore event next to parent component
                var NextEvent = component.getEvent("loaded");
                NextEvent.setParams({});
                NextEvent.fire();
            }
        }, false);

    }
})