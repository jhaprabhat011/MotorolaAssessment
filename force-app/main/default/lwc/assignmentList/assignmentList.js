import { LightningElement , wire, track} from 'lwc';
import getAssignmentList from '@salesforce/apex/Motorola_AssignmentController.getAssignmentRecords';
import SAMPLEMC from "@salesforce/messageChannel/SampleMessageChannel__c"
import {subscribe, MessageContext, APPLICATION_SCOPE, unsubscribe} from 'lightning/messageService';
import { refreshApex } from '@salesforce/apex';
import getAllAssignmentList from '@salesforce/apex/Motorola_AssignmentController.getAllAssignmentList';


export default class AssignmentList extends LightningElement {
    assignmentList;
    error;
	wiredAllUserData;
    assignmentAllList;
    wiredUserData;
    columns = [
        {label: 'Title' , fieldName: 'Title__c'},
        {label: 'Status' , fieldName: 'Status__c'},
        {label: 'Description' , fieldName: 'Description__c'},
        {label: 'DueDate' , fieldName: 'DueDate__c'}
    ];
    
    pageSize = 10;
    pageNumber = 1;
    dataSize;
    lastPage = false;
    searchText = '';
    timer;

    recievedMessage;
    subscription;
    // context on load 
    @wire(MessageContext)
    context

    // get all the assignment data => search
    @wire(getAllAssignmentList)
    handleAllRecords(result){
        this.wiredAllUserData = result;
        if(result.data){
            this.assignmentAllList = result.data;
            console.log('Obtained results wiredAllUserData: '+JSON.stringify(this.wiredAllUserData ));
        }
        else if(result.error){
            this.error = result.error;
            console.log('Error occurred wiredAllUserData'+JSON.stringify(this.error));
        }
    }

    // on load
    connectedCallback(){
        this.subscribeMessage();
    }

    // subscribe event
    subscribeMessage(){
        //subscribe(messageContext, messageChannel, listener, subscriberOptions
        this.subscription= subscribe(this.context, SAMPLEMC, (message)=>{this.handleMessage(message)}, {scope:APPLICATION_SCOPE})
    }
    // refresh event from assignment form
    handleMessage(message){
        this.recievedMessage = message.isValidData.value? message.isValidData.value :'NO Message published';
        if(this.recievedMessage == true){
            // refresh wire functions
            this.refresh();
        }
    }

    async refresh() {
        await refreshApex(this.wiredUserData);
        await refreshApex(this.wiredAllUserData);
    }

    handleSearch(event){
        this.searchText = event.target.value.toLowerCase().trim();
        this.fetchUserRecordsBySearchText();
    }

    async fetchUserRecordsBySearchText(){
        if (this.searchText.trim() !== '') {
            window.clearTimeout(this.timer);
            await new Promise(resolve => {
                // timer added when keyup 0.5sec
                this.timer = window.setTimeout(() => {
                    // filtering all data stored in wiredAllUserData
                    this.assignmentList = this.wiredAllUserData.data.filter(eachObj => {
                        // for every item
                        return Object.keys(eachObj).some(key => {
                            // sort only key as title
                            if (key === 'Title__c') {
                                // match value
                                return eachObj[key].toLowerCase().includes(this.searchText);
                            }
                        });
                    });
                    resolve();
                }, 500)
            });
        }
        else{
            // when search text is empty
            this.assignmentList =  this.wiredUserData.data;
        }
    }

    @wire(getAssignmentList, {pageSize: '$pageSize', pageNumber: '$pageNumber'})
    handleRecords(result){
        this.wiredUserData = result;
        if(result.data){
            this.assignmentList = result.data;
            this.dataSize = result.data.length;
            if(this.dataSize < this.pageSize){
                this.lastPage = true;
            }else{
                this.lastPage = false;
            }
            console.log('Obtained results: '+JSON.stringify(this.assignmentList ));
        }
        else if(result.error){
            this.error = result.error;
            console.log('Error occurred '+JSON.stringify(this.error));
        }
    }

    handleNext() { 
        this.pageNumber = this.pageNumber + 1;
        this.refresh();
    }
     
    handlePrev() {        
        this.pageNumber = this.pageNumber - 1;
        this.refresh();
    }
    
}