import { Cmn } from "../../frame/Cmn";
import { Res } from "../../frame/Res";
import { BuffType } from "./actor/BuffItem";
import { ItemCfg } from "../../cfg/ItemCfg";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuffUIItem extends cc.Component {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;
    @property(cc.Label)
    valueLabel: cc.Label = null;

    private _isTwinkle: boolean = false;
    get isTwinkle(): boolean { return this._isTwinkle; }

    onEnable() {
        this.node.opacity = 255;
        this._isTwinkle = false;
    }

    onDisable() {
        this.node.stopAllActions();
    }

    setDataByPro(icon: string, val: number) {
        this._isTwinkle = false;
        Cmn.res.setSprite(Res.PATH_FIGHT_UI + icon, this.sprite);
        this.setPro(val);
    }

    setDataByCd(icon: string, cd: number) {
        this._isTwinkle = false;
        Cmn.res.setSprite(Res.PATH_FIGHT_UI + icon, this.sprite);
        this.setNum(cd);
    }

    setPro(val: number) {
        this.valueLabel.string = "+" + val + "%";
    }

    setNum(cd: number) {
        this.valueLabel.string = Math.ceil(cd).toString();
    }

    runTwinkle() {
        this.node.opacity = 255;
        this.node.runAction(cc.repeat(
            cc.sequence(cc.fadeTo(0.25, 1), cc.fadeTo(0.25, 255)), 4
        ));
        this._isTwinkle = true;
    }

    clean() {
        this.node.stopAllActions();
        this.node.removeFromParent();
    }
}
