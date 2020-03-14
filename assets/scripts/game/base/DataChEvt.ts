import { Evt } from "./Evt";

export class DataChEvt extends Evt {
    public static CHANGE: string = "change";

    public valueName: string;
    public oldValue;
    public newValue;

    public constructor(name: string, old, val) {
        super(DataChEvt.CHANGE);
        this.valueName = name;
        this.oldValue = old;
        this.newValue = val;
    }
}