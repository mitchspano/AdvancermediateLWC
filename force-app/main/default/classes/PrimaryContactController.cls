public with sharing class PrimaryContactController {
    @AuraEnabled(cacheable=true)
    public static List<Contact> getContactList(Id accountId) {
        if (accountId == null ) return null;
        if (accountId.getSObjectType().getDescribe().getName() != 'Account') {
            throw new AuraHandledException('Invalid Account Id');
        }
        return [SELECT Id, Name, Title, Phone, Email, Picture__c FROM Contact WHERE Picture__c != null AND AccountId = : accountId LIMIT 10];
       
    }

     @AuraEnabled(cacheable=true)
    public static Account getAccountWithPrimaryContact(Id accountId) {
        if (accountId == null ) return null;
        if (accountId.getSObjectType().getDescribe().getName() != 'Account') {
            throw new AuraHandledException('Invalid Account Id');
        }
        return [SELECT Id, Primary_Contact__c FROM Account WHERE Id = : accountId];
       
    }

    @AuraEnabled
    public static void updateAccountPrimaryContact(Id accountId, Id contactId) {
        if (accountId == null || accountId.getSObjectType().getDescribe().getName() != 'Account') {
            throw new AuraHandledException('Invalid Account Id');
        }
        Savepoint sp = Database.setSavepoint();
        try {
            update new Account(Id = accountId, Primary_Contact__c = contactId);
        } catch ( Exception e ){
            Database.rollBack(sp);
            throw new AuraHandledException(e.getMessage());
        }
    }
}