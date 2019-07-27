public with sharing class AuraUtilities {

    @AuraEnabled(cacheable=true)
    public static List<SObject> soqlQuery(String queryString) {
        List<SObject> returnValue;
        try {
           returnValue = Database.query(queryString);
        } catch ( Exception e ){
            throw new AuraHandledException(e.getMessage());
        }
        return returnValue;
    }

    @AuraEnabled
    public static void dmlUpdate(List<SObject> objects) {
        Savepoint sp = Database.setSavepoint();
        try {
            update objects;
        } catch ( Exception e ){
            Database.rollBack(sp);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void dmlInsert(List<SObject> objects) {
        Savepoint sp = Database.setSavepoint();
        try {
            insert objects;
        } catch ( Exception e ){
            Database.rollBack(sp);
            throw new AuraHandledException(e.getMessage());
        }
    }

    @AuraEnabled
    public static void dmlDelete(List<SObject> objects) {
        Savepoint sp = Database.setSavepoint();
        try {
            delete objects;
        } catch ( Exception e ){
            Database.rollBack(sp);
            throw new AuraHandledException(e.getMessage());
        }
    }


}