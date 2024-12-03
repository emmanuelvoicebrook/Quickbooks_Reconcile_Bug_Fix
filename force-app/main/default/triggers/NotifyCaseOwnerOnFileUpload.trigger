trigger NotifyCaseOwnerOnFileUpload  on ContentDocumentLink (after insert) {
    // Collect Case IDs from new ContentDocumentLinks
    Set<Id> caseIds = new Set<Id>();
    Set<Id> contentDocumentIds = new Set<Id>();

    for (ContentDocumentLink link : Trigger.New) {
        if (link.LinkedEntityId != null && link.LinkedEntityId.getSObjectType() == Case.SObjectType) {
            caseIds.add(link.LinkedEntityId);
            contentDocumentIds.add(link.ContentDocumentId);
        }
    }

    if (!caseIds.isEmpty()) {
        // Query Cases with their owners
        Map<Id, Case> caseMap = new Map<Id, Case>([SELECT Id FROM Case WHERE Id IN :caseIds]);

        // Query ContentVersions to get the CreatedById (who uploaded the file)
        List<ContentVersion> contentVersions = [SELECT Id, CreatedById, ContentDocumentId FROM ContentVersion WHERE ContentDocumentId IN :contentDocumentIds AND IsLatest = true];
        Map<Id, ContentVersion> contentVersionMap = new Map<Id, ContentVersion>();
        for (ContentVersion cv : contentVersions) {
            contentVersionMap.put(cv.ContentDocumentId, cv);
        }

        // Query User details to check if they are external users
        Set<Id> userIds = new Set<Id>();
        for (ContentVersion cv : contentVersions) {
            userIds.add(cv.CreatedById);
        }

        Map<Id, User> userMap = new Map<Id, User>([SELECT Id, IsPortalEnabled FROM User WHERE Id IN :userIds]);

        // Prepare Case Comment records
        List<Custom_Case_Comments__c> caseComments = new List<Custom_Case_Comments__c>();

        for (ContentDocumentLink link : Trigger.New) {
            if (caseMap.containsKey(link.LinkedEntityId) && contentVersionMap.containsKey(link.ContentDocumentId)) {
                ContentVersion contentVersion = contentVersionMap.get(link.ContentDocumentId);
                User uploader = userMap.get(contentVersion.CreatedById);

                if (uploader != null && uploader.IsPortalEnabled) { // Check if the user is external
                    Case relatedCase = caseMap.get(link.LinkedEntityId);

                    // Create a Case Comment
                    Custom_Case_Comments__c caseComment = new Custom_Case_Comments__c();
                    caseComment.Case__c = relatedCase.Id; // Link to the related Case
                    caseComment.External_Comments__c = 'A file has been uploaded to this case by an external user.';
                    caseComment.Is_Visible_Externally__c = true; // Mark as visible externally if needed

                    caseComments.add(caseComment);
                }
            }
        }

        // Insert the Case Comment records
        if (!caseComments.isEmpty()) {
            insert caseComments;
        }
    }
}