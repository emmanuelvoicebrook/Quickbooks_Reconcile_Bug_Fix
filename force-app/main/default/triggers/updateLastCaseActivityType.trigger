trigger updateLastCaseActivityType on Task (after insert) {
 List<Case> Cas= new List<Case>();
 Map<String,Task> mapEvent = new Map<String,Task>();
  for(Task t : trigger.new)
  {
    mapEvent.put(t.whatid,t);
  
  }
  
  for(Case c :[Select id,LastModifiedDate,Last_Activity_Type__c from Case where id in : mapEvent.keyset()])
   {
      c.Last_Activity_On__c = mapEvent.get(c.id).CreatedDate;
      if(mapEvent.get(c.Id).skyplatform__Activity_Type__c == 'Call')
        c.Last_Activity_Type__c = 'Outbound Call';
      else
        c.Last_Activity_Type__c = mapEvent.get(c.Id).skyplatform__Activity_Type__c;
      
      c.Last_Activity_Type__c = 'Outbound Call';  
      cas.add(c);
   }
   
   if(cas.size()>0)
     update cas;

}