import { BuffType } from "./BuffItem";
import BuffUIItem from "../BuffUIItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Buff {

    private _type: BuffType = 0;
    private _value: number = 0;
    private _curCd: number = 0;
    private _uiItem: BuffUIItem = null;
    private _range: number = 0;

    get value(): number { return this._value; }
    get range(): number { return this._range; }

    constructor(type: BuffType, value: number, cd: number) {
        this._type = type;
        this._value = value;
        this._curCd = (0 == cd ? -1 : cd);
        if (BuffType.Ejection == this._type) {
            this._range = value;
            this._value = 1;
        }
    }

    update(dt) {
        if (-1 == this._curCd) return;
        if (0 < this._curCd) {
            this._curCd -= dt;
            this._uiItem.setNum(this._curCd);
            if (!this._uiItem.isTwinkle && 2 > this._curCd) {
                this._uiItem.runTwinkle();
            }
        }
    }

    isEnd() {
        return -1 != this._curCd && 0 >= this._curCd;
    }

    setUIItem(item: BuffUIItem) {
        this._uiItem = item;
    }

    setPro(val: number) {
        this._value = val;
        this._uiItem.setPro(this._value);
    }

    setCD(cd: number) {
        this._curCd = (0 == cd ? -1 : cd);
        this._uiItem.setNum(this._curCd);
    }

    setNum(num: number) {
        this._value = num;
        this._uiItem.setNum(this._value);
    }

    cleanUI() {
        if (null == this._uiItem) return;
        this._uiItem.clean();
    }
}
