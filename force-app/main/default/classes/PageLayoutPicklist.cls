global class PageLayoutPicklist  extends VisualEditor.DynamicPickList{
    VisualEditor.DesignTimePageContext context;

    global PageLayoutPicklist(VisualEditor.DesignTimePageContext context) {
       this.context = context;
    }

    global override VisualEditor.DataRow getDefaultValue(){
        return new VisualEditor.DataRow('--None--', '--None--');
    }

    global override VisualEditor.DynamicPickListRows getValues() {
        String sObjectName = context.entityName;
        VisualEditor.DynamicPickListRows  myValues = new VisualEditor.DynamicPickListRows();
        String objectLayoutsJSON = getLayouts(context.entityName);
        Map<String, Object> m = (Map<String, Object>) JSON.deserializeUntyped(objectLayoutsJSON);
        system.debug(m);
        List<Object> rows = (List<Object>) m.get('records');
        for (object row : rows) {
            Map<String, Object> rowMap = (Map<String, Object>) row;
            System.debug('rowMap>>> ' + rowMap);
            if (rowMap.get('LayoutType') != 'ProcessDefinition'){
                String name = (String) rowMap.get('Name');
                String value;
                String layoutWithFillNameJSON = getfullName((String)rowMap.get('Id'));
                Map<String, Object> fullNameMap = (Map<String, Object>) JSON.deserializeUntyped(layoutWithFillNameJSON);
                List<Object> fullNameRows = (List<Object>) fullNameMap.get('records');
                for (object fullNameRow : fullNameRows) {
                    Map<String, Object> fullNameRowMap = (Map<String, Object>) fullNameRow;
                    System.debug('FullNameRowMap>>> ' + fullNameRowMap);
                    value = (String) fullNameRowMap.get('FullName');
                }
                myValues.addRow( new VisualEditor.DataRow(Name, EncodingUtil.urlDecode(value, 'UTF-8')));
            }
        }
        //myValues.addRow( new VisualEditor.DataRow('Opportunity-Opportunity Layout', 'Opportunity-Opportunity Layout'));
    
        return myValues;
    }

    public static String getLayouts(String sObjectName){
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Tooling_API/services/data/v45.0/tooling/query?q=SELECT+Id,Name,TableEnumOrId,LayoutType+FROM+Layout+WHERE+TableEnumOrId=\''+sObjectName+'\'');
        req.setMethod('GET'); 
        Http h = new Http();
        HttpResponse res = h.send(req);
        while (res.getStatusCode() == 302) {
            req.setEndpoint(res.getHeader('Location'));
            res = new Http().send(req);
        }
        return res.getBody(); 
    }

    public static String getfullName(String id){
        if (String.isBlank(id)) return null;
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:Tooling_API/services/data/v45.0/tooling/query?q=SELECT+FullName+FROM+Layout+WHERE+Id=\''+id+'\'');
        req.setMethod('GET'); 
        Http h = new Http();
        HttpResponse res = h.send(req);
       
        while (res.getStatusCode() == 302) {
            req.setEndpoint(res.getHeader('Location'));
            res = new Http().send(req);
        }
        return res.getBody(); 
    }

    class myException extends exception{}
}