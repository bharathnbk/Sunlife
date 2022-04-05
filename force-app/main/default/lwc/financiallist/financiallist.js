


import { LightningElement, wire, api,track } from 'lwc';
import getAccount from '@salesforce/apex/AccountController.getAccounts';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';

import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import Name_FIELD from '@salesforce/schema/Account.Name';
import Owner_FIELD from '@salesforce/schema/Account.Owner.Name';
import Phone_FIELD from '@salesforce/schema/Account.Phone';
import Website_FIELD from '@salesforce/schema/Account.Website';
import AnnualRevenue_FIELD from '@salesforce/schema/Account.AnnualRevenue';
import ID_FIELD from '@salesforce/schema/Account.Id';


const COLS = [
    { label: 'Name', fieldName: 'AccountURL', type: 'url',
    typeAttributes: {
        label: {
            fieldName: 'Name'
        },target: '_blank'
    },editable:true},
    { label: 'Owner', fieldName: 'OwnerName', editable: true ,sortable: "true"},
    { label: 'Phone', fieldName: 'Phone' ,type: 'phone',editable: true},
    { label: 'Website', fieldName: 'Website', type: 'text',editable: true },
    { label: 'Annual Revenue', fieldName: 'AnnualRevenue',editable: true }
];
export default class Financiallist extends LightningElement {

    @api recordId;
    columns = COLS;
    draftValues = [];
    @track sortBy;
    @track sortDirection;
     lstAccounts=[];
     copyLstAccounts=[];
     templist=[];
     filteredData;
    accountLst=[];
temp;
    @wire(getAccount)
    account;
    
    connectedCallback(){
        getAccount().then(response => {
            this.lstAccounts = response;
            if(this.lstAccounts){
                this.lstAccounts.forEach(item => {
                 this.temp = Object.assign({}, item);  
                this.temp.AccountURL = '/lightning/r/Account/' +item['Id'] +'/view';
                this.temp.OwnerName = item.Owner.Name;
                this.accountLst.push(this.temp);
                } );
            }
            this.lstAccounts = this.accountLst;
            this.copyLstAccounts = this.lstAccounts;
        }).catch(error => {
            console.log('Error: ' +error);
        });

    }

    handleSave(event) {
        const fields = {}; 
        fields[ID_FIELD.fieldApiName] = event.detail.draftValues[0].Id;
        fields[Name_FIELD.fieldApiName] = event.detail.draftValues[0].Name;
        fields[Owner_FIELD.fieldApiName] = event.detail.draftValues[0].Owner;
        fields[Phone_FIELD.fieldApiName] = event.detail.draftValues[0].Phone;
        fields[Website_FIELD.fieldApiName] = event.detail.draftValues[0].Website;
        fields[AnnualRevenue_FIELD.fieldApiName] = event.detail.draftValues[0].AnnualRevenue;

        const recordInput = {fields};

        updateRecord(recordInput)
        .then(() => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Account updated',
                    variant: 'success'
                })
            );
            // Display fresh data in the datatable
            return refreshApex(this.account).then(() => {

                // Clear all draft values in the datatable
                this.draftValues = [];

            });
        }).catch(error => {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error updating or reloading record',
                    message: error.body.message,
                    variant: 'error'
                })
            );
        });
    }

    doSorting(event) {
        this.sortBy = event.detail.fieldName;
        this.sortDirection = event.detail.sortDirection;
        this.sortData(this.sortBy, this.sortDirection);
    }

    sortData(fieldname, direction) {
        let parseData = JSON.parse(JSON.stringify(this.lstAccounts));
        // Return the value stored in the field
        let keyValue = (a) => {
            return a[fieldname];
        };
        // cheking reverse direction
        let isReverse = direction === 'asc' ? 1: -1;
        // sorting data
        parseData.sort((x, y) => {
            x = keyValue(x) ? keyValue(x) : ''; // handling null values
            y = keyValue(y) ? keyValue(y) : '';
            // sorting values based on direction
            return isReverse * ((x > y) - (y > x));
        });
        this.lstAccounts = parseData;
    } 
    
    updateSearch(event) {
        if(event.target.value == ''|| event.target.value ==undefined )
        this.lstAccounts = this.copyLstAccounts;
        //alert(event.target.value);
     else{
        this.tempList = this.lstAccounts;
        this.filteredData = this.tempList.filter(word => word.Name.toLowerCase() == (event.target.value.toLowerCase()));
        if(this.filteredData.length > 0)
            this.lstAccounts = this.filteredData;
     }
    }  
}

