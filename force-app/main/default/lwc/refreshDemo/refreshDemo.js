import { LightningElement, wire } from 'lwc';

import { fireEvent } from 'c/pubsub'
import { registerListener } from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";

export default class RefreshDemo extends LightningElement {
    @wire(CurrentPageReference) pageRef;
    connectedCallback() {
		registerListener("refresh", this.handleRefresh, this);
    }

    handleRefresh() {
        console.log('refresh pubsub event was handled by RefreshDemo.');
    }
    
    forceRefreshView() {
        console.log('forceRefreshView pubsub event is being dispatched by RefreshDemo.');
        fireEvent(this.pageRef, 'forceRefreshView', this.name);
        
    }
    
}