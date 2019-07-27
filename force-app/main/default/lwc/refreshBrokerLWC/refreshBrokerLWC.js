import { LightningElement, api, wire } from "lwc";
import { CurrentPageReference } from "lightning/navigation";
import { fireEvent } from "c/pubsub";
import { registerListener } from "c/pubsub";

export default class RefreshBrokerLWC extends LightningElement {
  @wire(CurrentPageReference) pageRef;

  @api
  refresh() {
    fireEvent(this.pageRef, "refresh", this.name);
  }

  connectedCallback() {
    registerListener("forceRefreshView", this.forceRefreshView, this);
  }

  forceRefreshView() {
    this.dispatchEvent(new CustomEvent("forceRefreshView", { detail: null }));
  }
}