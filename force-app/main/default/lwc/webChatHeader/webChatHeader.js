import { LightningElement, api, track } from "lwc";
import { dispatchMessagingEvent, assignMessagingEventHandler, MESSAGING_EVENT } from "lightningsnapin/eventStore";
import voicebrook_logo from '@salesforce/resourceUrl/voicebrook_log_white';
const SLDS_MENU_SELECTOR = "slds-dropdown-trigger slds-dropdown-trigger_click";

export default class ChatHeader extends LightningElement {

    @track voicebrook_logo = voicebrook_logo;
    /**
    * Deployment configuration data.
    * @type {Object}
    */
    @api configuration = {};

    /**
    * The status of the conversation. Valid values:
    * - NOT_STARTED
    * - OPEN
    * - CLOSED
    * @type {ConversationStatus}
    */
    @api conversationStatus;

    /**
    * Class name for header menu.
    * @type {String}
    */
    menuClass = SLDS_MENU_SELECTOR;

    /**
    * Array to store bot options menu.
    * @type {Array}
    */
    chatbotOptionsMenu = [];

    /**
    * Whether the use is authenticated.
    * AuthMode can have the following values:
    * - Auth: user is in verified, which corresponds to the authenticated user mode.
    * - UnAuth: user is in unverified,  which corresponds to the guest user mode.
    */
    get isAuthenticatedContext() {
        return this.configuration.embeddedServiceMessagingChannel.authMode === "Auth";
    }

    /**
    * Whether to show the back button.
    * @type {Boolean}
    */
    showBackButton = false;

    /**
    * Whether to show the header menu button.
    * @returns {Boolean}
    */
    get showMenuButton() {
        return this.conversationStatus === "OPEN";
    }

    /**
    * Whether to show the header menu.
    * @type {Boolean}
    */
    _showMenu = false;
    get showMenu() {
        return this._showMenu;
    }
    set showMenu(shouldShow) {
        this.menuClass = SLDS_MENU_SELECTOR + (shouldShow ? " slds-is-open" : "");
        this._showMenu = shouldShow;
    }

    /**
    * Whether to show the close button.
    * @returns {Boolean}
    */
    get showCloseButton() {
        return this.conversationStatus !== "OPEN";
    }

    /**
    * Handle back button click.
    */
    onBackButtonClick() {
        dispatchMessagingEvent(MESSAGING_EVENT.BACK_BUTTON_CLICK, {});
    }

    /**
    * Handle menu button click.
    */
    onMenuButtonClick() {
        this.showMenu = !this.showMenu;
    }

    /**
    * Handle minimize button click.
    */
    onMinimizeButtonClick() {
        dispatchMessagingEvent(MESSAGING_EVENT.MINIMIZE_BUTTON_CLICK, {});
    }

    /**
    * Handle close button click.
    */
    onCloseButtonClick() {
        dispatchMessagingEvent(MESSAGING_EVENT.CLOSE_CONTAINER, {});
    }

    /**
    * Handle end conversation button click.
    */
    onMenuOptionClick(event) {
        event.preventDefault();

        dispatchMessagingEvent(MESSAGING_EVENT.MENU_ITEM_SELECTED, {
            selectedOption: this.chatbotOptionsMenu.find(option => option.optionIdentifier === event.target.getAttribute("value"))
        });

        this.showMenu = false;
    }

    /**
    * Handle end conversation button click.
    */
    onEndConversationClick() {
        dispatchMessagingEvent(MESSAGING_EVENT.CLOSE_CONVERSATION, {});

        this.showMenu = false;
    }

    connectedCallback() {
        assignMessagingEventHandler(MESSAGING_EVENT.PARTICIPANT_JOINED, (data) => {
            console.log(`Participant joined`);

            if (data.options && Array.isArray(data.options)) {
                data.options.forEach((participantOption) => {
                    this.chatbotOptionsMenu.push(participantOption);
                });
            }
        });

        assignMessagingEventHandler(MESSAGING_EVENT.PARTICIPANT_LEFT, (data) => {
            console.log(`Participant left`);

            this.chatbotOptionsMenu = [];
        });

        assignMessagingEventHandler(MESSAGING_EVENT.UPDATE_HEADER_TEXT, (data) => {
            console.log(`Update header text: ${data.text}`);
        });

        assignMessagingEventHandler(MESSAGING_EVENT.TOGGLE_BACK_BUTTON, (data) => {
            console.log(`Toggle back button visibility.`);

            this.showBackButton = !this.showBackButton;
        });
    }
}