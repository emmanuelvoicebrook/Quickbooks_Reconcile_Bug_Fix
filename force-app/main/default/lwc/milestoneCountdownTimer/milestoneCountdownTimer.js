import { LightningElement, track, api } from 'lwc';

export default class CountdownTimer extends LightningElement {
    @track timeVal = '0 days 0 hr 0 min 0 sec';
    @track isOverdue = false;
    @track progressPercentage = 0; // explicitly track this property

    timeIntervalInstance;
    totalMilliseconds = 0; // Will be computed based on activeMilestone data
    totalDuration = 0; // Total duration from start date to target date

    @api activeMilestone;  // assuming this is passed in from the parent component

    connectedCallback() {
         
        const startDate = new Date(this.activeMilestone.StartDate);
        const targetDate = new Date(this.activeMilestone.TargetDate);
        
        this.totalDuration = targetDate - startDate;
        const now = new Date();
        this.totalMilliseconds = targetDate - now;
        
        if (this.totalMilliseconds < 0) {
            this.isOverdue = true;
        }

        this.start();
    }



    start() {
         
        this.timeIntervalInstance = setInterval(() => {
            let absMilliseconds = Math.abs(this.totalMilliseconds);

            const days = Math.floor(absMilliseconds / (1000 * 60 * 60 * 24));
            absMilliseconds -= days * (1000 * 60 * 60 * 24);

            const hours = Math.floor(absMilliseconds / (1000 * 60 * 60));
            absMilliseconds -= hours * (1000 * 60 * 60);

            const minutes = Math.floor(absMilliseconds / (1000 * 60));
            absMilliseconds -= minutes * (1000 * 60);

            const seconds = Math.floor(absMilliseconds / 1000);

            this.timeVal = `${days} days ${hours} hr ${minutes} min ${seconds} sec`;

            if (this.isOverdue) {
                this.timeVal += ' overdue';
                this.totalMilliseconds += 1000; // counting up
            } else {
                this.totalMilliseconds -= 1000; // counting down
                if (this.totalMilliseconds < 0) {
                    this.isOverdue = true; // if we hit the target, switch to overdue mode
                    this.totalMilliseconds = 0; // reset to 0 before starting the overdue count up
                }
            }
            const elapsedDuration = new Date() - new Date(this.activeMilestone.StartDate);
            this.progressPercentage = 100 - Math.min((elapsedDuration / this.totalDuration) * 100, 100); // Compute and cap at 100%


        }, 1000);  // Update every second
    }

    stop() {
        clearInterval(this.timeIntervalInstance);
        this.timeIntervalInstance = undefined;
    }

    disconnectedCallback() {
        this.stop();  // cleanup to avoid memory leaks
    }

    // Computed properties for conditional rendering
    get daysRemaining() {
         
        const days = parseInt(this.timeVal.split(' ')[0]);
        return days > 0 ? days : undefined;
    }
    
    get hoursRemaining() {
         
        const hours = parseInt(this.timeVal.split(' ')[2]);
        return hours > 0 ? hours : undefined;
    }
    
    get minutesRemaining() {
        const minutes = parseInt(this.timeVal.split(' ')[4]);
         
        return minutes > 0 ? minutes : undefined;
    }

    get secondsRemaining() {
        return this.timeVal.split(' ')[6];
    }

    handleClick(event){
        event.preventDefault();
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('navigate', { detail: this.activeMilestone.Id }));
    }
}