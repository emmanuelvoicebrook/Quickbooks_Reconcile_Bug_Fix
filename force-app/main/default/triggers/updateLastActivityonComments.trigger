trigger updateLastActivityonComments on FeedComment (after insert) {
  
  Map<string,FeedComment> mapfc = new Map<string,FeedComment>();
  List<Case> updateCase = new List<Case>();
  for(FeedComment fc : trigger.new)
  { 
    mapfc.put(fc.parentid,fc);
  }
  
  for(Case cas : [Select id,Last_Activity_On__c from Case where id in : mapfc.keyset()])
  { 
    cas.Last_Activity_On__c = mapfc.get(cas.id).CreatedDate;
    cas.Last_Activity_Type__c = 'Chatter';
    updateCase.add(cas);
  }
  
  if(updateCase.size() > 0)
  {
    update updateCase;
  }
}