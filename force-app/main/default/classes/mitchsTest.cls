public class mitchsTest {
    
    public void doIt (String sobectName){
        
        HttpRequest req = new HttpRequest();
        req.setHeader('Authorization', 'Bearer ' + UserInfo.getSessionID());
        req.setHeader('Content-Type', 'application/json');
        Http h = new Http();
        
        req.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm() +'/services/data/v45.0/tooling/query?q=SELECT+Id+FROM+Layout+WHERE+TableEnumOrId=\''+EncodingUtil.urlEncode(sobectName, 'UTF-8')+'\'');
        
        //req.setEndpoint(URL.getSalesforceBaseUrl().toExternalForm() +'/services/data/v45.0/tooling/query?q=SELECT+Id,FullName,Name+FROM+Layout+WHERE+TableEnumOrId=\''+EncodingUtil.urlEncode(sobectName, 'UTF-8')+'\'');
        req.setMethod('GET');
        HttpResponse res = h.send(req);
        system.debug('Here is my response '+res.getBody());
    }
    
}