public with sharing class LayoutExplorerController {
    @AuraEnabled(cacheable=true)
    public static String getLayouts(){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Tooling_API/services/data/v45.0/tooling/query?q=SELECT+Id,Name,TableEnumOrId,LayoutType+FROM+Layout');
        //req.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm()+'/services/data/v45.0/tooling/query?q=SELECT+Id,Name,TableEnumOrId+FROM+Layout');
        req.setMethod('GET'); 
        Http h = new Http();
        HttpResponse res = h.send(req);
        system.debug( res);
        system.debug( res.getHeaderKeys());
        for(String s : res.getHeaderKeys()){
            system.debug( s+' ---- '+  res.getHeader(s));
        }
        system.debug( res.getBody());
        while (res.getStatusCode() == 302) {
            req.setEndpoint(res.getHeader('Location'));
            res = new Http().send(req);
        }
        system.debug( res);
        return res.getBody(); 
    }
    
    public static String getLayouts(String sObjectName){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Tooling_API/services/data/v45.0/tooling/query?q=SELECT+Id,Name,TableEnumOrId,LayoutType+FROM+Layout+WHERE+TableEnumOrId=\''+sObjectName+'\'');
        //req.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm()+'/services/data/v45.0/tooling/query?q=SELECT+Id,Name,TableEnumOrId+FROM+Layout');
        req.setMethod('GET'); 
        Http h = new Http();
        HttpResponse res = h.send(req);
        system.debug( res);
        system.debug( res.getHeaderKeys());
        for(String s : res.getHeaderKeys()){
            system.debug( s+' ---- '+  res.getHeader(s));
        }
        system.debug( res.getBody());
        while (res.getStatusCode() == 302) {
            req.setEndpoint(res.getHeader('Location'));
            res = new Http().send(req);
        }
        system.debug( res);
        return res.getBody(); 
    }

    @AuraEnabled(cacheable=true)
    public static String getfullName(String id){
        if (String.isBlank(id)) return null;
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Tooling_API/services/data/v45.0/tooling/query?q=SELECT+FullName+FROM+Layout+WHERE+Id=\''+id+'\'');
        req.setMethod('GET'); 
        Http h = new Http();
        HttpResponse res = h.send(req);
        system.debug( res);
        system.debug( res.getHeaderKeys());
        for(String s : res.getHeaderKeys()){
            system.debug( s+' ---- '+  res.getHeader(s));
        }
        system.debug( res.getBody());
        while (res.getStatusCode() == 302) {
            req.setEndpoint(res.getHeader('Location'));
            res = new Http().send(req);
        }
        system.debug( res);
        return res.getBody(); 
    }
}