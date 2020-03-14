import { EvtDpc } from "./EvtDpc";
import { DataChEvt } from "./DataChEvt";

export class Data extends EvtDpc {
    public valueChanged(name, field, val) {
        var old = this.getProperty(field);
        this.setProperty(field, val);
        if (old != val) {
            this.dpcEvt(new DataChEvt(name, old, val));
        }
    }

    public valueModified(name, field, val) {
        var old = this.getProperty(field);
        this.setProperty(field, val);
        this.dpcEvt(new DataChEvt(name, old, val));
    }

    public getProperty(field) {
        return this[field];
    }

    public setProperty(field, val) {
        this[field] = val;
    }
}