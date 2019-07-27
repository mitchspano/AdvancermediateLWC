import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getLayouts from "@salesforce/apex/LayoutExplorerController.getLayouts";
import getfullName from "@salesforce/apex/LayoutExplorerController.getfullName";



export default class LayoutExplorerLWC extends LightningElement {
    actions = [
        { label: 'Show details', name: 'show_details' },
    ];
    columns = [/*{
        label: 'View',
        type: 'button-icon',
        initialWidth: 75,
        typeAttributes: {
            iconName: 'action:preview',
            title: 'Preview',
            variant: 'border-filled',
            alternativeText: 'View'
        }
    },*/
        { label: 'Related Object', fieldName: 'TableEnumOrId' },
        { label: 'LayoutType', fieldName: 'LayoutType' },
        { label: 'Name', fieldName: 'Name' },
        {
            type: 'action',
            typeAttributes: { rowActions: this.actions },
        },
    ];
    

    @wire(getLayouts) layoutsJSON; 
    //@wire(getfullName, { id: '$showFullForId' }) fullName;
    @track showFullNameModal = false;
    @track showFullForId;
    @track fullNameDisplay = ':/';
    @track error;

    get layouts () {
        if (this.layoutsJSON.data) return JSON.parse(this.layoutsJSON.data);
        return null;
    }

    get tableData (){
        if (this.layoutsJSON.data) return JSON.parse(this.layoutsJSON.data).records;
        return [];
    }
   

    handleRowAction(event) {
        const actionName = event.detail.action.name;
        const row = event.detail.row;
        switch (actionName) {
            case 'show_details':
                this.showRowDetails(row);
                break;
            default:
        }
    }

    showRowDetails(row) {
        getfullName({id : row.Id})
            .then(result => {
                let a = JSON.parse(result).records[0].FullName;
                this.fullNameDisplay = decodeURIComponent(a);
                this.showFullNameModal = true;
            })
            .catch(error => {
                this.error = error;
                this.showFullNameModal = true;
            });
    }

    closeModal() {
        this.fullNameDisplay = null;
        this.showFullNameModal = false;
    }

}