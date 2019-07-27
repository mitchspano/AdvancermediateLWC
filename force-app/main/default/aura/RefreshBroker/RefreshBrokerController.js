({
    handleForceRefreshViewForLWC: function(component, event, helper) {
        component.find("refreshBroker").refresh();
    },

    forceRefreshView: function(component, event, helper) {
        $A.get('e.force:refreshView').fire();
    }

})