import { LightningElement } from 'lwc';
import phoneVolume from '@salesforce/resourceUrl/icon_phoneVolume'; 
import clock from  '@salesforce/resourceUrl/icon_clock'

export default class CommunitySupportPageMidContent extends LightningElement {
    phoneVolumeIcon = phoneVolume + '#phoneVolume'
    clockIcon = clock + '#clock'
}