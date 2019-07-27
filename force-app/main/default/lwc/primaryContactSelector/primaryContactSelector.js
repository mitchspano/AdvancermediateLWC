import { LightningElement, wire, track, api } from 'lwc';

import getContactListFromAccount from '@salesforce/apex/PrimaryContactController.getContactList';
import updateAccountPrimaryContact from '@salesforce/apex/PrimaryContactController.updateAccountPrimaryContact';
import getAccountWithPrimaryContact from '@salesforce/apex/PrimaryContactController.getAccountWithPrimaryContact';

import ACCOUNT_PRIMARY_CONTACT_FIELD from '@salesforce/schema/Account.Primary_Contact__c';

import { fireEvent } from 'c/pubsub'
import { registerListener } from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";
import { refreshApex } from "@salesforce/apex";
import { getRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const SUCCESS_MESSAGE = "Records Updated Successfully.";
const TOAST_TITLE_SUCCESS = "Success";
const TOAST_TITLE_ERROR = "Error";
const TOAST_VARIANT_SUCCESS = "success";
const TOAST_VARIANT_ERROR = "error";

export default class primaryContactSelector extends LightningElement {

	_rerenderCount = 0;
	@api recordId;
	@track selectedContact;

	@wire(CurrentPageReference) pageRef;
	@wire(getContactListFromAccount, { accountId: "$recordId" }) contacts;
	@wire(getRecord, { recordId: "$recordId", fields: [ACCOUNT_PRIMARY_CONTACT_FIELD] }) thisAccount;

	get showMarkAsPrimary() {
		let returnValue = true;
		if (this.selectedContact && this.thisAccount.data &&  this.thisAccount.data.fields  && this.thisAccount.data.fields[ACCOUNT_PRIMARY_CONTACT_FIELD.fieldApiName].value &&  this.selectedContact.Id === this.thisAccount.data.fields[ACCOUNT_PRIMARY_CONTACT_FIELD.fieldApiName].value) {
			returnValue = false;
		}
		return returnValue;
	}

	handleContactSelect(event) {
		this.selectedContact = event.target.contact;
	}

	selectPrimary() {
		let selectedId = this.selectedContact.Id;
		updateAccountPrimaryContact({ accountId: this.recordId, contactId: selectedId })
			.then(() => {
				this.showToast(TOAST_TITLE_SUCCESS, SUCCESS_MESSAGE, TOAST_VARIANT_SUCCESS);
				this.forceRefreshView();
			})
			.catch(error => {
				this.showToast(TOAST_TITLE_ERROR, JSON.stringify(error), TOAST_VARIANT_ERROR);
				this.forceRefreshView();
			});

	}


	connectedCallback() {
		registerListener("refresh", this.handleRefresh, this);
	}

	renderedCallback() {
		if (this._rerenderCount < 3) {
			if (this.contacts && this.contacts.data) {
				let matchisFound = false;
				for (let contact of this.contacts.data) {
					if ((this.thisAccount && this.thisAccount.data && this.thisAccount.data.fields) && contact.Id === this.thisAccount.data.fields[ACCOUNT_PRIMARY_CONTACT_FIELD.fieldApiName].value && (contact.Id)) {
						this.selectedContact = contact;
						matchisFound = true;
					}
				}
				if (!matchisFound) this.selectedContact = null;
				this._rerenderCount++;
			}
		}
	}

	handleRefresh() {
		this._rerenderCount = 1;
		refreshApex(this.contacts);
		refreshApex(this.thisAccount);
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
		fireEvent(this.pageRef, 'forceRefreshView', this.name);
	}

}