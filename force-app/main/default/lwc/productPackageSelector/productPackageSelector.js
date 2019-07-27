import { LightningElement, api, wire } from "lwc";
import soqlQuery from "@salesforce/apex/AuraUtilities.soqlQuery";
import dmlInsert from "@salesforce/apex/AuraUtilities.dmlInsert";
import dmlDelete from "@salesforce/apex/AuraUtilities.dmlDelete";

import OPPORTUNITY_PRICEBOOK2ID_FIELD from '@salesforce/schema/Opportunity.Pricebook2Id';

import PRICEBOOK_OBJECT from '@salesforce/schema/Pricebook2';
import PRICEBOOK_ID_FIELD from '@salesforce/schema/Pricebook2.Id';
import PRICEBOOK_IS_STANDARD_FIELD from '@salesforce/schema/Pricebook2.isStandard';

import PRICEBOOKENTRY_OBJECT from '@salesforce/schema/PricebookEntry';
import PRICEBOOKENTRY_ID_FIELD from '@salesforce/schema/PricebookEntry.Id';
import PRICEBOOKENTRY_UNIT_PRICE_FIELD from '@salesforce/schema/PricebookEntry.UnitPrice';
import PRICEBOOKENTRY_PRICEBOOK2ID_FIELD from '@salesforce/schema/PricebookEntry.Pricebook2Id';
import PRICEBOOKENTRY_PRODUCT2ID_FIELD from '@salesforce/schema/PricebookEntry.Product2Id';

import PRODUCT_PACKAGE_OBJECT from '@salesforce/schema/Product_Package__c';
import PRODUCT_PACKAGE_ID_FIELD from '@salesforce/schema/Product_Package__c.Id';
import PRODUCT_PACKAGE_NAME_FIELD from '@salesforce/schema/Product_Package__c.Name';

import PACKAGE_ELEMENT_OBJECT from '@salesforce/schema/Package_Element__c';
import PACKAGE_ELEMENT_ID_FIELD from '@salesforce/schema/Package_Element__c.Id';
import PACKAGE_ELEMENT_DEFAULT_QUANTITY_FIELD from '@salesforce/schema/Package_Element__c.Default_Quantity__c';
import PACKAGE_ELEMENT_PRODUCT_NAME_FIELD from '@salesforce/schema/Package_Element__c.Product__r.Name';
import PACKAGE_ELEMENT_PRODUCT_FIELD from '@salesforce/schema/Package_Element__c.Product__c';

import OPPORTUNITY_LINE_ITEM_OBJECT from '@salesforce/schema/OpportunityLineItem';
import OPPORTUNITY_LINE_ITEM_ID_FIELD from '@salesforce/schema/OpportunityLineItem.Id';
import OPPORTUNITY_LINE_ITEM_QUANTITY_FIELD from '@salesforce/schema/OpportunityLineItem.Quantity';
import OPPORTUNITY_LINE_ITEM_OPPORTUNITYID_FIELD from '@salesforce/schema/OpportunityLineItem.OpportunityId';
import OPPORTUNITY_LINE_ITEM_UNIT_PRICE_FIELD from '@salesforce/schema/OpportunityLineItem.UnitPrice';
import OPPORTUNITY_LINE_ITEM_TOTAL_PRICE__FIELD from '@salesforce/schema/OpportunityLineItem.TotalPrice';
import OPPORTUNITY_LINE_ITEM_PRICEBOOKENTRY_PRODUCT2ID_FIELD from '@salesforce/schema/OpportunityLineItem.PricebookEntry.Product2Id';
import OPPORTUNITY_LINE_ITEM_PRICEBOOKENTRY_PRODUCT2NAME_FIELD from '@salesforce/schema/OpportunityLineItem.PricebookEntry.Product2.Name';

import { fireEvent } from 'c/pubsub'
import { getRecord } from "lightning/uiRecordApi";
import { registerListener } from "c/pubsub";
import { CurrentPageReference } from "lightning/navigation";
import { refreshApex } from "@salesforce/apex";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const INSERT_SUCCESS_MESSAGE = "Records inserted successfully.";
const DELETE_SUCCESS_MESSAGE = "Records deleted successfully.";
const TOAST_TITLE_SUCCESS = "Success";
const TOAST_TITLE_ERROR = "Error";
const TOAST_VARIANT_SUCCESS = "success";
const TOAST_VARIANT_ERROR= "error";

export default class ProductPackageSelector extends LightningElement {

  @api recordId;
  @wire(CurrentPageReference) pageRef;
  @wire(soqlQuery, { queryString: "$oppLineItemsQueryString" }) oppLineItems;
  @wire(soqlQuery, { queryString: "$packageQueryString" }) productPackages;
  @wire(soqlQuery, { queryString: "$standardPriceBookQueryString" }) standardPricebook;
  @wire(soqlQuery, { queryString: "$pricebookEntriesQueryString" }) pricebookEntries;
  @wire(getRecord, { recordId: "$recordId", fields: [OPPORTUNITY_PRICEBOOK2ID_FIELD] }) myOpp;

  opportunityLineItemFields =[
    OPPORTUNITY_LINE_ITEM_ID_FIELD,
    OPPORTUNITY_LINE_ITEM_QUANTITY_FIELD,
    OPPORTUNITY_LINE_ITEM_OPPORTUNITYID_FIELD,
    OPPORTUNITY_LINE_ITEM_UNIT_PRICE_FIELD,
    OPPORTUNITY_LINE_ITEM_TOTAL_PRICE__FIELD,
    OPPORTUNITY_LINE_ITEM_PRICEBOOKENTRY_PRODUCT2ID_FIELD,
    OPPORTUNITY_LINE_ITEM_PRICEBOOKENTRY_PRODUCT2NAME_FIELD
  ];

  pricebookEntryFields = [
    PRICEBOOKENTRY_ID_FIELD,
    PRICEBOOKENTRY_UNIT_PRICE_FIELD,
    PRICEBOOKENTRY_PRICEBOOK2ID_FIELD,
    PRICEBOOKENTRY_PRODUCT2ID_FIELD
  ];

  productPackageFields = [
    PRODUCT_PACKAGE_ID_FIELD,
    PRODUCT_PACKAGE_NAME_FIELD
  ];

  packageElementFields = [
    PACKAGE_ELEMENT_ID_FIELD,
    PACKAGE_ELEMENT_DEFAULT_QUANTITY_FIELD,
    PACKAGE_ELEMENT_PRODUCT_NAME_FIELD,
    PACKAGE_ELEMENT_PRODUCT_FIELD
  ];

  connectedCallback() {    
    registerListener("refresh", this.handleRefresh, this);
  }

  handleRefresh() {
    refreshApex(this.myOpp);
    refreshApex(this.oppLineItems);
    refreshApex(this.productPackages);
    refreshApex(this.pricebookEntries);
  }

  buildQueryString(fieldsArray, subQueries, sObjectOrRelationshipName, orderByField, orderDirection, whereClause, limit){
    let fieldNames = [];
    let subQueryStrings = [];
    if (fieldsArray){
      for (let field of fieldsArray) {
          fieldNames.push(field.fieldApiName);        
      }
    }
    if (subQueries){
      for (let subquery of subQueries) {
        subQueryStrings.push("("+subquery+")");
      }
    }
    let fieldsAndSubqueries = [].concat(...[fieldNames, subQueryStrings]);
    let returnValue = "SELECT " + fieldsAndSubqueries.join(", ") +" FROM "+ sObjectOrRelationshipName;
    if (orderByField && orderDirection) returnValue += " ORDER BY " + orderByField + " " + orderDirection;
    if (whereClause) returnValue += " WHERE " + whereClause;
    if (limit) returnValue += " LIMIT "+limit
    return returnValue;    
}

  get oppLineItemsQueryString() {
    return this.buildQueryString(this.opportunityLineItemFields, null, OPPORTUNITY_LINE_ITEM_OBJECT.objectApiName, null, null,  OPPORTUNITY_LINE_ITEM_OPPORTUNITYID_FIELD.fieldApiName +" = '" +this.recordId + "'");
  }

  get packageQueryString() {    
    let whereClause;
    if (!this.isStandardPricebook) {
      whereClause = PRICEBOOKENTRY_PRODUCT2ID_FIELD.fieldApiName + " IN (" + this.buildQueryString([PRICEBOOKENTRY_PRICEBOOK2ID_FIELD], null ) + ")";
    }
    let subquery = this.buildQueryString(this.packageElementFields, null, 'Package_Elements__r', PACKAGE_ELEMENT_PRODUCT_NAME_FIELD.fieldApiName, 'ASC', whereClause );
    return this.buildQueryString(this.productPackageFields, [subquery], PRODUCT_PACKAGE_OBJECT.objectApiName );
  }

  get standardPriceBookQueryString() {
    return this.buildQueryString([PRICEBOOK_ID_FIELD], null, PRICEBOOK_OBJECT.objectApiName, null, null, PRICEBOOK_IS_STANDARD_FIELD.fieldApiName +" = true", 1);
  }

  get pricebookEntriesQueryString() {
    let whereClause = PRICEBOOKENTRY_PRODUCT2ID_FIELD.fieldApiName + " IN (" + this.buildQueryString([PACKAGE_ELEMENT_PRODUCT_FIELD], null, PACKAGE_ELEMENT_OBJECT.objectApiName)+ ")";
    return this.buildQueryString(this.pricebookEntryFields, null, PRICEBOOKENTRY_OBJECT.objectApiName, null, null, whereClause);
  }
  
  get opportunityPricebookId() {
    let returnValue;
    if (
      this.myOpp &&
      this.myOpp.data &&
      this.myOpp.data.fields &&
      this.myOpp.data.fields.Pricebook2Id &&
      this.myOpp.data.fields.Pricebook2Id.value
    ) {
      returnValue = this.myOpp.data.fields.Pricebook2Id.value;
    }
    return returnValue;
  }

  get standardPricebookId() {
    let returnValue;
    if (
      this.standardPricebook &&
      this.standardPricebook.data &&
      this.standardPricebook.data[0] &&
      this.standardPricebook.data[0].Id
    ) {
      returnValue = this.standardPricebook.data[0].Id;
    }
    return returnValue;
  }

  get isStandardPricebook() {
    let returnValue = false;
    if (this.opportunityPricebookId === this.standardPricebookId) {
      returnValue = true;
    }
    return returnValue;
  }

  get packageTiles() {
    let returnValue = [];
    if (this.productPackages && this.productPackages.data) {
      for (let productPackage of this.productPackages.data) {
        returnValue.push(this.productPackageToPackageTile(productPackage));
      }
    }
    return returnValue;
  }

  get currentProductIdSet() {
    let returnValue = new Set();
    if (this.oppLineItems && this.oppLineItems.data) {
      for (let oppLineItem of this.oppLineItems.data) {
        if (oppLineItem.PricebookEntry && oppLineItem.PricebookEntry.Product2Id) {
          returnValue.add(oppLineItem.PricebookEntry.Product2Id);
        }
      }
    }
    return returnValue;
  }

  productPackageToPackageTile(productPackage) {
    let label = productPackage.Name;
    let link = "/" + productPackage.Id;
    let productPackageId = productPackage.Id;
    let showAddAll = false;
    let showRemoveAll = false;
    let showAddRemaining = false;
    let products = [];
    if (productPackage.Package_Elements__r) {
      let numberOfProductsThisOppHas = 0;
      for (let element of productPackage.Package_Elements__r) {
        if (element.Product__r) {
          let name = element.Product__r.Name;
          let isBold = false;
          if (this.currentProductIdSet.has(element.Product__r.Id)) {
            numberOfProductsThisOppHas++;
            isBold = true;
          }
          products.push({ name, isBold });
        }
      }
      if (numberOfProductsThisOppHas === 0) {
        showAddAll = true;
      } else if (numberOfProductsThisOppHas < productPackage.Package_Elements__r.length) {
        showAddRemaining = true;
        showRemoveAll = true;
      } else {
        showRemoveAll = true;
      }
    }
    return { label, link, productPackageId, showAddAll, showRemoveAll, showAddRemaining, products };
  }

  addAllProducts(event) {
    let productPackageId = event.detail;
    let newRecords = [];
    if (productPackageId) {
      if (this.productPackages && this.productPackages.data) {
        for (let productPackage of this.productPackages.data) {
          if (productPackage.Package_Elements__r && productPackage.Id === productPackageId) {
            for (let element of productPackage.Package_Elements__r) {
              if (this.pricebookEntries.data) {
                for (let entry of this.pricebookEntries.data) {
                  if (entry.Pricebook2Id === this.opportunityPricebookId && entry.Product2Id === element.Product__c) {
                    let newRecord = {
                      sobjectType: OPPORTUNITY_LINE_ITEM_OBJECT.objectApiName,
                      PricebookEntryId: entry.Id,
                      Quantity: element.Default_Quantity__c,
                      ListPrice: entry.UnitPrice,
                      TotalPrice: element.Default_Quantity__c * entry.UnitPrice,
                      OpportunityId: this.recordId
                    };
                    newRecords.push(newRecord);
                  }
                }
              }
            }
          }
        }
      }
    }
    dmlInsert({ objects: newRecords })
      .then(() => {
        this.forceRefreshView();
        this.showToast(TOAST_TITLE_SUCCESS, INSERT_SUCCESS_MESSAGE, TOAST_VARIANT_SUCCESS);
      })
      .catch(error => {
        this.showToast(TOAST_TITLE_ERROR, JSON.stringify(error), TOAST_VARIANT_ERROR);
      });
  }

  removeAll(event) {
    let productPackageId = event.detail;
    let records = [];
    if (productPackageId) {
      if (this.productPackages && this.productPackages.data) {
        for (let productPackage of this.productPackages.data) {
          if (productPackage.Package_Elements__r && productPackage.Id === productPackageId) {
            for (let element of productPackage.Package_Elements__r) {
              if (this.oppLineItems.data) {
                for (let lineItem of this.oppLineItems.data) {
                  if (lineItem.PricebookEntry.Product2Id === element.Product__c) {
                    let record = {
                      sobjectType: OPPORTUNITY_LINE_ITEM_OBJECT.objectApiName,
                      Id: lineItem.Id
                    };
                    records.push(record);
                  }
                }
              }
            }
          }
        }
      }
    }
    dmlDelete({ objects: records })
      .then(() => {
        this.forceRefreshView();
        this.showToast(TOAST_TITLE_SUCCESS, DELETE_SUCCESS_MESSAGE, TOAST_VARIANT_SUCCESS);
      })
      .catch(error => {
        this.showToast(TOAST_TITLE_ERROR, JSON.stringify(error), TOAST_VARIANT_ERROR);
      });
  }

  addRemaining(event) {
    let productPackageId = event.detail;
    let newRecords = [];
    if (productPackageId) {
      if (this.productPackages && this.productPackages.data) {
        for (let productPackage of this.productPackages.data) {
          if (productPackage.Package_Elements__r && productPackage.Id === productPackageId) {
            for (let element of productPackage.Package_Elements__r) {
              if (this.pricebookEntries.data) {
                for (let entry of this.pricebookEntries.data) {
                  if (entry.Pricebook2Id === this.opportunityPricebookId && entry.Product2Id === element.Product__c && !this.currentProductIdSet.has(element.Product__c)) {
                    let newRecord = {
                      sobjectType: OPPORTUNITY_LINE_ITEM_OBJECT.objectApiName,
                      PricebookEntryId: entry.Id,
                      Quantity: element.Default_Quantity__c,
                      ListPrice: entry.UnitPrice,
                      TotalPrice: element.Default_Quantity__c * entry.UnitPrice,
                      OpportunityId: this.recordId
                    };
                    newRecords.push(newRecord);
                  }
                }
              }
            }
          }
        }
      }
    }
    dmlInsert({ objects: newRecords })
      .then(() => {
        this.forceRefreshView();
        this.showToast(TOAST_TITLE_SUCCESS, INSERT_SUCCESS_MESSAGE, TOAST_VARIANT_SUCCESS);
      })
      .catch(error => {
        this.showToast(TOAST_TITLE_ERROR, JSON.stringify(error), TOAST_VARIANT_ERROR);
      });
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