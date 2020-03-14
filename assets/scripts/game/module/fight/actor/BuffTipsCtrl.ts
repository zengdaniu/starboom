import { BuffType } from "./BuffItem";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuffTipsCtrl extends cc.Component {

    @property(cc.Node)
    bgNode: cc.Node = null;
    @property(cc.Node)
    attNode: cc.Node = null;
    @property(cc.Label)
    attVal: cc.Label = null;
    @property(cc.Node)
    attSpeedNode: cc.Node = null;
    @property(cc.Label)
    attSpeedVal: cc.Label = null;
    @property(cc.Node)
    tanSheNode: cc.Node = null;
    @property(cc.Label)
    tanSheVal: cc.Label = null;
    @property(cc.Node)
    sanDanNode: cc.Node = null;
    @property(cc.Label)
    sanDanNum: cc.Label = null;

    private readonly showTime: number = 2;
    private _curTIme: number = 0;

    onEnable() {
        this.bgNode.active = false;
        this.attNode.active = false;
        this.attSpeedNode.active = false;
        this.tanSheNode.active = false;
        this.sanDanNode.active = false;
        this._curTIme = 0;
    }

    update(dt) {
        if (!this.node.active) return;
        this._curTIme += dt;
        if (this.showTime < this._curTIme) {
            this.bgNode.stopAllActions();
            this.bgNode.active = false;
        }
    }

    show(type: BuffType, value: number) {
        switch (type) {
            case BuffType.AttSpeedUp:       // 增加攻速
                this.attSpeedVal.string = "+" + value + "%";
                break;
            case BuffType.AttUp:            // 增加伤害
                this.attVal.string = "+" + value + "%";
                break;
            case BuffType.Ejection:         // 弹射
                this.tanSheVal.string = "+" + value;
                break;
            case BuffType.Shotgun:          // 散弹
                this.sanDanNum.string = value.toString();
                break;
            default:
                return;
        }
        this.attNode.active = (BuffType.AttUp == type);
        this.attSpeedNode.active = (BuffType.AttSpeedUp == type);
        this.tanSheNode.active = (BuffType.Ejection == type);
        this.sanDanNode.active = (BuffType.Shotgun == type);
        if (!this.bgNode.active) {
            this.bgNode.active = true;
            this.playShow();
        }
        this._curTIme = 0;
    }

    private playShow() {
        this.bgNode.stopAllActions();
        this.bgNode.scaleY = 0.1;
        this.bgNode.runAction(cc.sequence(cc.scaleTo(0.05, 1, 1.2), cc.scaleTo(0.03, 1, 0.8), cc.scaleTo(0.03, 1, 1)));
    }
}
