trigger updateLastActivity on FeedItem (after insert) {
  
  Map<string,FeedItem > mapfc = new Map<string,FeedItem >();
  List<Case> updateCase = new List<Case>();
  for(FeedItem fc : trigger.new)
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