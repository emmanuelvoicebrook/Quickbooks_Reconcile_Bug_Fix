// GENERAL MILESTONES FUNCTIONS
export function resetMilestones(component) {
    component.activeMilestones = [];
    component.completedMilestones = [];
}

export function calculateSlaCompliance(component) {
    const milestonesMet = component.completedMilestones.filter(milestone => !milestone.IsViolated).length;
    component.slaCompliancePercentage = Math.round((milestonesMet / component.completedMilestones.length) * 1000) / 10;
}

export function updateMilestoneFlags(component) {
    component.completeMilestonesExists = component.completedMilestones.length > 0;
    component.activeMilestonesExists = component.activeMilestones.length > 0;
}

export function logMilestoneSummary(component) {
    console.log('Active Milestones: ', JSON.stringify(component.activeMilestones));
    console.log('Completed Milestones: ', JSON.stringify(component.completedMilestones));
}



// PROJECT MILESTONES FUNCTIONS
export function processTask(component, task, SlaExitDate) {
    ensureMilestoneType(task);
    if (SlaExitDate == null) {
        if (task.IsCompleted) {
            component.completedMilestones.push(task);
        } else {
            task.MilestoneType.TargetDate = task.TargetDate;
            component.activeMilestones.push(task);
        }
    } else {
        component.completedMilestones.push(task);
    }
}

function ensureMilestoneType(task) {
    if (!task.Milestone) {
        task.MilestoneType = { Name: 'Project Update SLA' };
    }
}


// CASE MILESTONES FUNCTIONS
export function processCaseMilestones(component, caseData) {
    if (caseData.CaseMilestones.length === 0) {
        component.noMilestones = true;
        return;
    }

    component.noMilestones = false;

    const { CaseMilestones, SlaExitDate } = caseData;
    CaseMilestones.forEach(milestone => {
        if (SlaExitDate == null && !milestone.IsCompleted) {
            component.activeMilestones.push(milestone);
        } else {
            component.completedMilestones.push(milestone);
        }
    });

    if (SlaExitDate != null) {
        calculateSlaCompliance(component); // Corrected function call
    }
}