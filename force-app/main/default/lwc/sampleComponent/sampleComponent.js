import { LightningElement, track, api, wire } from "lwc";
import { getRecordUi } from "lightning/uiRecordApi";

export default class SampleComponent extends LightningElement {
  @track mapData = [];
  @api recordId;
  @wire(getRecordUi, {
    recordIds: "$recordId",
    childRelationships: "Opportunity.OpportunityLineItems",
    layoutTypes: "Compact",
    modes: "View"
  })
  wiredResult(result) {
    if (result.data) {
      let conts = result.data;
      for (let key in conts) {
        if (key) {
          this.mapData.push({ value: conts[key], key: key });
        }
      }
    }
  }

  print() {
    console.log(JSON.stringify(this.mapData));
  }
}