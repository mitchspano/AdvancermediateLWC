({
    forceRefreshView : function(component, event, helper) {
        console.log('e.force:refreshView Aura event is being dispatched by RefreshDemo.');
        $A.get('e.force:refreshView').fire();
                
    },

    handleRefresh : function(component, event, helper) {
        console.log('e.force:refreshView Aura event is being handled by RefreshDemo.');
    }

})