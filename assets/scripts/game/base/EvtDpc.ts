import { Evt } from "./Evt";

const { ccclass, property } = cc._decorator;

@ccclass
export class EvtDpc extends cc.Component {
    private events = {};

    dpcEvt(event: Evt) {
        let v = this.events[event.type];
        if (v == null) return;
        for (let i = v.length - 1; i >= 0; --i) {
            v[i].event.apply(v[i].target, [event]);
        }
    }

    addListener(type: string, event: Function, target) {
        let v = this.events[type];
        if (v == null) {
            this.events[type] = new Array();
            v = this.events[type];
        }
        for (let i = 0; i < v.length; i++) {
            if (v[i].event == event && v[i].target == target) {
                return;
            }
        }
        v.push({ event: event, target: target });
    }

    delListener(type: string, event: Function, target) {
        let v = this.events[type];
        if (v == null) { return; }
        for (let i = 0; i < v.length; i++) {
            if (v[i].event == event && v[i].target == target) {
                v.splice(i, 1);
                return;
            }
        }
    }

    getCount(type: string): number {
        if (this.events[type]) {
            return this.events[type].length;
        }
        return 0;
    }
}