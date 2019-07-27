import { LightningElement, api } from 'lwc';

export default class EventButton extends LightningElement {
    @api detail;
    @api eventName;
    @api name;
    @api value;
    @api label;
    @api variant;
    @api iconName;
    @api iconPosition;
    @api type;

    buttonClick() {
        const event = new CustomEvent(this.eventName, {
            // detail contains only primitives
            detail: this.detail
        });
        // Fire the event from c-tile
        this.dispatchEvent(event);
       
    }
}