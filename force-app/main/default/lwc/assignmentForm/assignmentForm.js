import { LightningElement, wire } from 'lwc';
import insertAssignmentList from '@salesforce/apex/Motorola_AssignmentController.insertAssignmentList';
import SAMPLEMC from "@salesforce/messageChannel/SampleMessageChannel__c"
import {MessageContext, publish} from 'lightning/messageService'
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class AssignmentForm extends LightningElement {

    title = '';
    description = '';
    status = '';
    dueDate = '';
    isValid = true;
    options = [
        {label: 'Not Started' , value: 'Not Started'},
        {label: 'In Progress' , value: 'In Progress'},
        {label: 'Completed' , value: 'Completed'}
    ];

    handleChange(event){
        // on change assignment values
        if(event.target.name == 'Title'){
            this.title = event.target.value;
        }
        if(event.target.name == 'Description'){
            this.description = event.target.value;
        }
        if(event.target.name == 'Status'){
            this.status = event.target.value;
        }
        if(event.target.name == 'Due Date'){
            this.dueDate = event.target.value;
        }
    }
    validateAssignment(){
        //isValid = false => error
        //isValid = true => success
        if(this.title == '' || this.status == '' || this.description == '' || this.dueDate == ''){
            this.isValid = false;
            return false;
        }else{
            this.isValid = true;
            return true;
        }
    }
    handleSave(){
        // validate form before submission
        this.validateAssignment();
        let tempAssignment = {
            "Title__c" : this.title,
            "Description__c" : this.description,
            "Status__c": this.status,
            "DueDate__c": this.dueDate
        }
        // on validation save the data
        if(this.isValid){
            insertAssignmentList({ assignInstance: tempAssignment })
            .then(() => {
                // clear form
                this.clearFormFields();
                // call toast
                this.showSuccessToast();
                // publish event
                this.publishMessage();
                })
                .catch(error => {
                    console.error('Error creating assignment: ', error);
                })
                
        }
        
    }

    showSuccessToast() {
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Assignment created successfully',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
    }
    

    clearFormFields() {
        this.title = '';
        this.description = '';
        this.status = '';
        this.dueDate = '';
    }

    // context on load
    @wire(MessageContext)
    context

    
    publishMessage(){
        const message={
            isValidData:{
                value: this.isValid
            }
        }
       //to publish event
        publish(this.context, SAMPLEMC, message)
    }
}