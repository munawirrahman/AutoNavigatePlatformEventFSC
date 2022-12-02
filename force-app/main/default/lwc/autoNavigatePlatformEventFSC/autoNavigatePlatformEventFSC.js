import { LightningElement, api, track } from 'lwc';
import { subscribe, unsubscribe, onError }  from 'lightning/empApi';
import {FlowNavigationNextEvent, FlowNavigationBackEvent, FlowNavigationPauseEvent, FlowNavigationFinishEvent} from 'lightning/flowSupport';
import Id from '@salesforce/user/Id';
const NEXT = 'NEXT';
const BACK = 'BACK';
const PAUSE = 'PAUSE';
const FINSIH = 'FINISH';

export default class AutoNavigatePlatformEventFSC extends LightningElement {
    @api uniqueKey;
    subscription = {};
    channelName = '/event/Auto_Navigate_Event__e';
    myId = Id.slice(0,15);

    @track isUniqueKeyMatched = false;

    connectedCallback() {       
        this.registerErrorListener();
        this.handleSubscribe();
    }

    disconnectedCallback() {
        unsubscribe(this.subscription, response => {
            console.log('Un-Subscribed from Auto Navigate Event');
            console.log(response);
        });
    }

    handleSubscribe() {
        const thisReference = this;
        const messageCallback = function(response) {
            console.log(JSON.stringify(response));
            let eventData = response['data']['payload'];
            let navigationPath = eventData.Navigation_Path__c;
            let isUniqueKeyMatched = eventData.Unique_Key__c == thisReference.uniqueKey ? true : false;
            let targetUserIds = eventData.Target_User_Ids__c ? thisReference.setTargetUserIds(eventData.Target_User_Ids__c) : null;
            if((!targetUserIds || (targetUserIds && targetUserIds.includes(thisReference.myId))) && isUniqueKeyMatched){
                thisReference.navigateNow(navigationPath);
            }
        }

        subscribe(this.channelName, -1, messageCallback).then(response => {
            console.log('Subscribed to Auto Navigate Event');
            this.subscription = response;
        });
        onError(error => {
            console.log('Error in Auto Navigate Event');
            console.log(error);
        });
    }

    registerErrorListener() {
        onError(error => {
            console.log('Received error from server: ', JSON.stringify(error));
        });
    }

    setTargetUserIds(targetUserIdsInStr){
        let finalTargetUserIdArr = [];
        let targetUserIdArr = targetUserIdsInStr.split(',');
        for (let i = 0; i < targetUserIdArr.length; i++){
            finalTargetUserIdArr.push(targetUserIdArr[i].slice(0,15));
        }
        return finalTargetUserIdArr;
    }

    navigateNow(navigationPath) {
        if(navigationPath == NEXT){
            const navigateEvent = new FlowNavigationNextEvent();
            this.dispatchEvent(navigateEvent);
        }
        else if(navigationPath == BACK){
            const navigateEvent = new FlowNavigationBackEvent();
            this.dispatchEvent(navigateEvent);
        }
        else if(navigationPath == PAUSE){
            const navigateEvent = new FlowNavigationPauseEvent();
            this.dispatchEvent(navigateEvent);
        }
        else if(navigationPath == FINSIH){
            const navigateEvent = new FlowNavigationFinishEvent();
            this.dispatchEvent(navigateEvent);
        }
    }
}