public class OpportunityTriggerHandler extends TriggerHandler {
    private static String APPROVAL_PROCESS_STAGE = 'Approval Process';
    private static String COMMENTS = 'This record was automatically submitted for approval.';
    private static String OPP_APPROVAL_PROCESS_NAME = 'Sample_Approval_Process';

    
    private Map<Id, Opportunity> newMap;
    private Map<Id, Opportunity> oldMap;
    private List<Opportunity> newList;
    private List<Opportunity> oldList;
    
    public OpportunityTriggerHandler() {
        this.setMaxLoopCount(2);
        this.sObjectName = 'Opportunity';
        if (this.hasNewList){
            this.newList = (List<Opportunity>) Trigger.new;
        }
        if (this.hasNewMap){
            this.newMap = (Map<Id, Opportunity>) Trigger.newMap;
        }
        if (this.hasOld){
            this.oldList = (List<Opportunity>) Trigger.old;
            this.oldMap = (Map<Id, Opportunity>) Trigger.oldMap;
        }        
    }
    
    protected override void beforeUpdate() {
        List<Opportunity> opportunitiesToSubmit = new List<Opportunity>();
        for (Opportunity Opp : newList) {
            if (opp.StageName == APPROVAL_PROCESS_STAGE && opp.StageName != oldmap.get(opp.Id).StageName && !Approval.isLocked(opp.id)) {
                opportunitiesToSubmit.add(opp);
            }
        }
        if (!opportunitiesToSubmit.isEmpty()) submitForApproval(opportunitiesToSubmit);
     
        
    }

    private static void submitForApproval(List<Opportunity> opps) {
        Savepoint sp = Database.setSavepoint();
        try {
        List<Approval.ProcessSubmitRequest> myRequests = new  List<Approval.ProcessSubmitRequest>();
        for (Opportunity opp : opps) {
            
            Approval.ProcessSubmitRequest req1 =  new Approval.ProcessSubmitRequest();
            req1.setComments(COMMENTS);
            req1.setObjectId(opp.id);            
            req1.setSubmitterId(UserInfo.getUserId());             
            req1.setProcessDefinitionNameOrId(OPP_APPROVAL_PROCESS_NAME);
            req1.setSkipEntryCriteria(true);
            myRequests.add(req1);
        }
        List<Approval.ProcessResult> results = Approval.process(myRequests, true);
        for (Approval.ProcessResult result : results) {
            if (!result.isSuccess()) {
                for (Opportunity opp : opps) {
                    if (result.getEntityId() == opp.Id){
                        String errorMessage = '';
                        for (Database.Error error : result.getErrors()){
                            errorMessage += error.getMessage();
                        }
                        opp.addError(errorMessage);
                    }
                }
            }
        }
        } catch (Exception e){
            Database.rollback(sp);
            for (Opportunity opp : opps){
                opp.addError(e.getMessage());
            }
        }

    }
    
}