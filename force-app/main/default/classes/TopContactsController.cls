public with sharing class TopContactsController {
    @AuraEnabled (cacheable=true)
    public static Contact [] getContactsForAccount(Id accountId){
        if (String.isNotBlank(accountId)) return [ SELECT Id, Name, Title, Phone,  Email FROM Contact WHERE AccountId = : accountId ];
        return null;
    }

    @AuraEnabled (cacheable=true)
    public static void updateAccountAndContacts (Account account, Contact [] contacts){
        Savepoint sp = Database.setSavepoint();
        try{
            if (account != null) update account;
            if (contacts != null) update contacts;
        } catch (Exception e) {
            Database.rollback(sp);
            throw new AuraHandledException(e.getMessage());
        }
    }
}