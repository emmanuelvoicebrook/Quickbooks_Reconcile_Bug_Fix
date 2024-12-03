import {LightningElement} from 'lwc';

export default class TestScreenFlow extends LightningElement {
    flowParams = [{
        name: 'param1',
        type: 'String',
        value: 'I\'m a param that\'s being passed in from the container lwc'
    }, {
        name: 'param2',
        type: 'String',
        value: 'Hello World2'
    }];

    get flowParamsJSON() {
        return JSON.stringify(this.flowParams);
    }
}