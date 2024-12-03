import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getMilestonesForCase from '@salesforce/apex/SLAMilestoneService.getMilestonesForCase';
import getMilestonesForProject from '@salesforce/apex/SLAMilestoneService.getProjectMilestones';
import { subscribe, unsubscribe, onError, setDebugFlag, isEmpEnabled } from 'lightning/empApi';
import { resetMilestones, processTask, calculateSlaCompliance, updateMilestoneFlags, logMilestoneSummary,processCaseMilestones } from './functions';

export default class Milestones extends NavigationMixin(LightningElement) {
    @track activeMilestones = [];
    @track completedMilestones = [];
    @track completeMilestonesExists;
    @track activeMilestonesExists;

    @track MilestoneTypeName;
    @track hoursRemaining = 0;
    @track minutesRemaining = 0;
    @track secondsRemaining = 0;
    @track isOverdue = false;
    @track isExpanded = false;
    @track endTime;
    @track timeLeft;
    @track slaCompliancePercentage = 0;
    @track noMilestones = true;
    @track caseClosedDate = null;

    @api sobject = 'CaseMilestone';
    @api object;

    // Replace 'recordId' with an @api property if you want to set it from outside
    // @api recordId = '500DS00000EwYAaYAN';
    @api recordId;

    // render variables    
    @track componentKey = 1;
    isComponentVisible = true;


    // platform event subscription
    channelName = '/event/Milestone_Update__e';
    isSubscribeDisabled = false;
    isUnsubscribeDisabled = !this.isSubscribeDisabled;

    connectedCallback() {
        // Register error listener
        this.registerErrorListener()
        this.handleSubscribe();

        // Perform initialization and start timer
        console.log('Record Id: ' + this.recordId);
        if (this.object != undefined && this.object == 'Case') {
            this.getCaseMilestones();
        } else if (this.object == 'Taskray Project') {
            this.getProjectMilestones();
        }
    }

    disconnectedCallback() {
        // Unsubscribe from event channel
        this.handleUnsubscribe();
    }

    // Handles subscribe button click
    handleSubscribe() {
        // Callback invoked whenever a new event message is received
        const messageCallback = function (response) {
            console.log('New message received: ', JSON.stringify(response));
            // Response contains the payload of the new message received
            if (this.object != undefined && this.object == 'Case' && response.data.payload.Milestone_Type__c.toLowerCase() == 'case') {
                // this.refreshComponent();
                this.getCaseMilestones();
            } else if (this.object == 'Taskray Project' && response.data.payload.Milestone_Type__c.toLowerCase() == 'project') {

                // this.refreshComponent();
                this.getProjectMilestones();
            }

        };

        // Invoke subscribe method of empApi. Pass reference to messageCallback
        subscribe(this.channelName, -1, messageCallback.bind(this)).then((response) => {
            // Response contains the subscription information on subscribe call
            console.log(
                'Subscription request sent to: ',
                JSON.stringify(response.channel)
            );
            this.subscription = response;
            this.toggleSubscribeButton(true);
        });
    }

    // Handles unsubscribe button click
    handleUnsubscribe() {
        this.toggleSubscribeButton(false);

        // Invoke unsubscribe method of empApi
        unsubscribe(this.subscription, (response) => {
            console.log('unsubscribe() response: ', JSON.stringify(response));
            // Response is true for successful unsubscribe
        });
    }

    toggleSubscribeButton(enableSubscribe) {
        this.isSubscribeDisabled = enableSubscribe;
        this.isUnsubscribeDisabled = !enableSubscribe;
    }

    registerErrorListener() {
        // Invoke onError empApi method
        onError((error) => {
            console.log('Received error from server: ', JSON.stringify(error));
            // Error contains the server-side error
        });
    }


    getCaseMilestones() {
        getMilestonesForCase({ caseId: this.recordId })
            .then(result => {
                // Reset milestones
                resetMilestones(this);
                if (result.length === 0) {
                    console.log('No case found.');
                    return;
                }
    
                const caseData = result[0];
                this.caseClosedDate = caseData.ClosedDate;
                processCaseMilestones(this, caseData);
                updateMilestoneFlags(this);
                // this.showToast('Success', 'Milestones loaded successfully', 'success');
            })
            .catch(error => {
                console.error('Error: ', error);
                // this.showToast('Error', error, 'error');
            });
    }

    getProjectMilestones() {
        getMilestonesForProject({ projectId: this.recordId })
            .then(result => {
                console.log('Project Milestones: ', JSON.stringify(result));

                // Reset milestones
                resetMilestones(this);

                // Exit if no MilestoneTasks
                if (result.MilestoneTasks.length === 0) {
                    return;
                }

                this.noMilestones = false;

                result.MilestoneTasks.forEach(task => processTask(this, task, result.SlaExitDate));

                calculateSlaCompliance(this);


                updateMilestoneFlags(this);
                // this.showToast('Success', 'Milestones loaded successfully', 'success');
            })
            .catch(error => {
                console.error('Error: ', error);
                // this.showToast('Error', error, 'error');
            });
    }

   
    get milestonesWithSeparator() {
        return this.completedMilestones.map((milestone, index, array) => {
            return {
                ...milestone,
                isLast: index === array.length - 1, // Add an isLast property to each milestone
                StartDate: this.formatDate(milestone.StartDate),
                // Check if CompletionDate exists before formatting
                CompletionDate: milestone.CompletionDate ? this.formatDate(milestone.CompletionDate) : this.formatDate(this.caseClosedDate),
            };
        });
    }

    toggleMilestones() {
        this.isExpanded = !this.isExpanded;
    }

    formatDate(isoDate) {
        if (isoDate == null) return '  ';
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return new Date(isoDate).toLocaleString('en-US', options);
    }
    navigateRecordHandler(event) {
        event.stopImmediatePropagation()
        event.preventDefault()
        this.navigateHandler(event.target.dataset.id, this.sobject)
    }

    navigateHandler(Id, apiName) {
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: Id,
                objectApiName: apiName,
                actionName: 'view',
            },
        })
    }

    handleNavigate(event) {
        var Id = event.detail;
        this.navigateHandler(Id, this.sobject)
    }

    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            variant: variant,
            message: message,
        });
        this.dispatchEvent(event);
    }
    // refreshComponent() {
    //     this.componentKey += 1; // Changing the key forces re-render
    //     // Optionally, toggle visibility to force a more complete reset
    //     this.isComponentVisible = false;
    //     // You might need a slight delay here for the DOM updates to settle for 5 seconds
    //     setTimeout(() => {
    //         this.isComponentVisible = true;
    //     }, 5000);

    // }

}