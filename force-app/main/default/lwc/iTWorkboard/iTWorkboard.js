import { LightningElement, wire, track } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import WORKBOARD_ITEM_OBJECT from '@salesforce/schema/Workboard_Item__c';
import ID_FIELD from '@salesforce/schema/Workboard_Item__c.Id';
import STATUS_FIELD from '@salesforce/schema/Workboard_Item__c.Status__c';
import getWorkboardRecords from '@salesforce/apex/WorkboardController.getObjectRecords';
import getSettings from '@salesforce/apex/WorkboardController.getWorkboardSetting';
import getBaseSetting from '@salesforce/apex/WorkboardController.getSettingInstance';
import getRecordTypes from '@salesforce/apex/WorkboardController.getRecordTypes';

const RECORD_TYPE_COLORS = {
    'IT Support': 'bg-red-100 border-red-300 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
    'Internal Project': 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
    'Change Request': 'bg-green-100 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200',
    'Asset Request': 'bg-yellow-100 border-yellow-300 text-yellow-800 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200'
};

export default class ITWorkboard extends LightningElement {
    @track columnsArray = [];
    @track workboardRecords;
    @track isModalOpen = false;
    @track isCreateNewCaseOpen = false;
    @track isSettingOpen = false;
    @track isColumnSelectorOpen = false;
    @track filters = {
        requestedBy: '',
        requestedFor: '',
        assignedTo: '',
        priority: '',
        assetType: '',
        createdDate: null,
        closedDate: null,
        recordTypes: [],
        showOverdue: false,
        sortCriteria1: '',
        sortCriteria2: ''
    };
    @track searchText = '';
    @track requestedByUsers = [];
    @track requestedForUsers = [];
    @track assignedToUsers = [];
    @track recordTypes = [];
    @track priority = [];
    @track assets = [];
    @track visibleColumns = [];
    @track isDarkMode = false;

    workboardId;
    header;
    RecordCreationFlow;
    RecordUpdateFlow;
    baseRecordTypeId;
    currRecord;
    _selectedRecordTypes = [];


    get recordTypeColors() {
        return Object.entries(RECORD_TYPE_COLORS).map(([type, color]) => ({ type, color }));
    }

    get boardClass() {
        return `slds-card workboard ${this.isDarkMode ? 'dark' : ''}`;
    }


    get themeLabel() {
        return this.isDarkMode ? 'Light Mode' : 'Dark Mode';
    }


    @wire(getWorkboardRecords, { filters: '$stringFilters', searchText: '$searchText' })
    wiredWorkboardRecords(result) {
        this.workboardData = result;
        if (result.data) {
            this.workboardRecords = result.data.map(record => ({
                ...record,
                colorClass: `slds-tile slds-tile_board ${RECORD_TYPE_COLORS[record.RecordType.Name] || ''}`
            }));
            this.updateColumnItems();
            this.updateUserOptions();
        } else if (result.error) {
            this.showToast('Error', 'Failed to fetch workboard records', 'error');
        }
    }

    @wire(getRecordTypes)
    wiredRecordTypes({ error, data }) {
        if (data) {
            console.log('FETCHING RECORD TYPES: ', data);
            this._selectedRecordTypes = data.map(rt => rt.Name);
            console.log('HERE ARE THE RECORD TYPES: ', this._selectedRecordTypes);

            this.recordTypes = data.map(rt => ({
                value: rt.Id,
                label: rt.Name,
                isChecked: true
            }));

            this.filters.recordTypes = this._selectedRecordTypes;
            refreshApex(this.workboardData);
        } else if (error) {
            console.error('Record Types Error: ', error);
            this.showToast('Error', 'Failed to fetch record types', 'error');
        }
    }

    @wire(getPicklistValuesByRecordType, { objectApiName: WORKBOARD_ITEM_OBJECT, recordTypeId: '$baseRecordTypeId' })
    wiredPicklistValues({ data, error }) {
        if (data) {
            console.log('Picklist Data: ', data);
            this.initializeColumns(data.picklistFieldValues.Status__c.values);
            this.priority = data.picklistFieldValues.Priority__c.values;
            this.assets = data.picklistFieldValues.VB_Asset_Type__c.values;
        }
        else if (error) {
            console.error('Error while fetching Picklist values: ', error);
            this.showToast('Error', 'Failed to fetch picklist values', 'error');
        }
    }

    connectedCallback() {
        console.log('ConnectedCallback called');
        this.loadSettings();
    }

    loadSettings() {
        console.log('Loading settings');
        getBaseSetting()
            .then(result => {
                console.log('Base settings received:', result);
                const data = JSON.parse(result);
                this.baseRecordTypeId = data.Record_Type_Id__c;
                this.RecordCreationFlow = data.Record_Creation_Flow_Name__c;
                this.RecordUpdateFlow = data.Record_Update_Flow_Name__c;
                this.header = data.Workboard_Header__c;
            })
            .catch(error => {
                console.error('Error loading base settings', error);
                this.showToast('Error', 'Failed to load base settings', 'error');
            });

        getSettings()
            .then(result => {
                console.log('Workboard settings received:', result);
                this.workboardId = result.Id;
            })
            .catch(error => {
                console.error('Error loading workboard settings', error);
                this.showToast('Error', 'Failed to load workboard settings', 'error');
            });
    }

    initializeColumns(statusValues) {
        if (statusValues) {
            this.columnsArray = statusValues.map(status => ({
                id: status.value,
                title: status.label,
                items: [],
                visible: true
            }));
            console.log('Initialized columns:', this.columnsArray);
        } else {
            console.error('No status values found in picklist');
        }
    }

    // updateColumnItems() {
    //     console.log('Updating column items');
    //     if (this.columnsArray && this.workboardRecords) {
    //         this.columnsArray = this.columnsArray.map(column => {
    //             const items = this.workboardRecords.filter(record => record.Status__c === column.id);
    //             console.log(`Column ${column.id} has ${items.length} items`);
    //             return {
    //                 ...column,
    //                 items: items
    //             };
    //         });
    //         console.log('Updated columnsArray:', JSON.parse(JSON.stringify(this.columnsArray)));
    //     } else {
    //         console.warn('Columns or workboardRecords not available for updating column items');
    //         console.log('columnsArray:', this.columnsArray);
    //         console.log('workboardRecords:', this.workboardRecords);
    //     }
    // }
    updateColumnItems() {
        console.log('Updating column items');
        if (this.columnsArray && this.workboardRecords) {
            this.columnsArray = this.columnsArray.map(column => ({
                ...column,
                items: this.workboardRecords.filter(record => record.Status__c === column.id)
            }));
            console.log('Updated columnsArray:', JSON.parse(JSON.stringify(this.columnsArray)));
        } else {
            console.warn('Columns or workboardRecords not available for updating column items');
        }
    }
    updateUserOptions() {
        console.log('Updating user options');
        this.requestedByUsers = this.getUniqueUsers('Requested_By__r');
        this.requestedForUsers = this.getUniqueUsers('Requested_For__r');
        this.assignedToUsers = this.getUniqueUsers('Assigned_To__r');
    }

    getUniqueUsers(field) {
        const uniqueUsers = new Set();
        this.workboardRecords.forEach(record => {
            if (record[field]) {
                uniqueUsers.add(JSON.stringify({ label: record[field].Name, value: record[field].Id }));
            }
        });
        return [{ label: '--None--', value: '' }, ...Array.from(uniqueUsers, JSON.parse)];
    }

    handleDragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.dataset.id);
        event.target.classList.add('dragging');
    }

    handleDragOver(event) {
        event.preventDefault();
        const draggingElement = this.template.querySelector('.dragging');
        if (draggingElement) {
            const closestElement = this.getClosestElement(event.clientY, event.currentTarget);
            if (closestElement) {
                event.currentTarget.insertBefore(draggingElement, closestElement);
            } else {
                event.currentTarget.appendChild(draggingElement);
            }
        }
    }

    handleDrop(event) {
        event.preventDefault();
        const itemId = event.dataTransfer.getData('text');
        const newStatus = event.currentTarget.dataset.columnId;
        this.updateItemStatus(itemId, newStatus);
    }

    getClosestElement(y, container) {
        const draggableElements = [...container.querySelectorAll('.slds-item:not(.dragging)')];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    updateItemStatus(itemId, newStatus) {
        const fields = {};
        fields[ID_FIELD.fieldApiName] = itemId;
        fields[STATUS_FIELD.fieldApiName] = newStatus;
        const recordInput = { fields };

        updateRecord(recordInput)
            .then(() => {
                this.showToast('Success', 'Item updated successfully', 'success');
                return refreshApex(this.workboardData);
            })
            .catch(error => {
                console.error('Error updating record', error);
                this.showToast('Error', 'Error updating item', 'error');
            });
    }

    handleRecordSearch(event) {
        this.searchText = event.target.value;
    }

    handleFilterChange(event) {
        const { name, value, checked } = event.target;
        if (name === 'showOverdue') {
            this.filters.showOverdue = checked;
        } else if (name.startsWith('recordType-')) {
            const recordTypeName = name.replace('recordType-', '');
            if (checked) {
                this.filters.recordTypes.push(recordTypeName);
            } else {
                this.filters.recordTypes = this.filters.recordTypes.filter(rt => rt !== recordTypeName);
            }
        } else {
            this.filters[name] = value;
        }
    }

    resetFilters() {
        this.filters = {
            requestedBy: '',
            requestedFor: '',
            assignedTo: '',
            priority: '',
            assetType: '',
            createdDate: null,
            closedDate: null,
            recordTypes: this._selectedRecordTypes,
            showOverdue: false,
            sortCriteria1: '',
            sortCriteria2: ''
        };
        this.recordTypes.forEach(rt => rt.isChecked = true);
    }

    applyFilters() {
        this.closeSettings();
        refreshApex(this.workboardData);
    }

    get stringFilters() {
        return JSON.stringify({
            ...this.filters,
            recTypes: JSON.stringify(this.filters.recordTypes)
        });
    }

    get flowParamsJSON() {
        return JSON.stringify([]);
    }

    get editFlowParamsJSON() {
        return JSON.stringify([
            {
                name: 'StartingRecordId',
                type: 'String',
                value: this.currRecord
            }
        ]);
    }

    newCase() {
        this.isCreateNewCaseOpen = true;
    }

    closeNewCaseForm() {
        this.isCreateNewCaseOpen = false;
        return refreshApex(this.workboardData);
    }

    openSettings() {
        this.isSettingOpen = true;
    }

    closeSettings() {
        this.isSettingOpen = false;
    }

    openColumnSelector() {
        this.isColumnSelectorOpen = true;
    }

    closeColumnSelector() {
        this.isColumnSelectorOpen = false;
    }

    handleColumnToggle(event) {
        const columnId = event.target.name;
        const isChecked = event.target.checked;
        this.columnsArray = this.columnsArray.map(column =>
            column.id === columnId ? { ...column, visible: isChecked } : column
        );
    }

    toggleDarkMode() {
        this.isDarkMode = !this.isDarkMode;
        if (this.isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }

    showToast(title, message, variant) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                message: message,
                variant: variant,
            }),
        );
    }
}