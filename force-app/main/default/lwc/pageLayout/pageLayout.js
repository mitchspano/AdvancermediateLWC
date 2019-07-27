import { LightningElement, api, wire, track } from "lwc";
import { getRecord } from "lightning/uiRecordApi";
import { registerListener } from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import getPageLayout from "@salesforce/apex/PageLayoutRecordDisplayController.getPageLayout";
import getPageLayoutMetadata from "@salesforce/apex/PageLayoutRecordDisplayController.getPageLayoutMetadata";

const INSERT_SUCCESS_MESSAGE = "Records inserted successfully.";
const DELETE_SUCCESS_MESSAGE = "Records deleted successfully.";
const TOAST_TITLE_SUCCESS = "Success";
const TOAST_TITLE_ERROR = "Error";
const TOAST_VARIANT_SUCCESS = "success";
const TOAST_VARIANT_ERROR= "error";


export default class PageLayout extends LightningElement {

    @api recordId;
    @api pageLayoutName;
    @api orientation;
    @api objectApiName;
    @track editMode = false;
  @wire(CurrentPageReference) pageRef;
  @wire(getPageLayout, { pageLayoutName: "$pageLayoutName" }) pageLayout;
  @wire(getPageLayoutMetadata, { pageLayoutName: "$pageLayoutName" }) pageLayoutMetadata;

  connectedCallback() {    
    registerListener("refresh", this.handleRefresh, this);
  }

  get metaJSON () {
      if (this.pageLayoutMetadata.data) return JSON.stringify(this.pageLayoutMetadata);
      return null
  }

  get isTab () {
    return this.orientation == "Tab";
  }

  get isVertical() {
    return !this.orientation || this.orientation == "Vertical";
  }

  handleRefresh() {
  }

  setEditMode () {
      this.editMode = true;
  }

  clearEditMode () {
      this.editMode = false;
  }


  showToast(theTitle, theMessage, theVariant) {
    const event = new ShowToastEvent({
      title: theTitle,
      message: theMessage,
      variant: theVariant
    });
    this.dispatchEvent(event);
  }

  forceRefreshView() {
    eval("$A.get('e.force:refreshView').fire();");
  }
}