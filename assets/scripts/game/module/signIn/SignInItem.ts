import { SignData } from "./SignIn";
import { Cmn } from "../../frame/Cmn";
import { Res } from "../../frame/Res";

const { ccclass, property } = cc._decorator;

@ccclass
export class SignInItem extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    num: cc.Label = null;
    @property(cc.Sprite)
    bg: cc.Sprite = null;

    private _data: SignData

    set data(data: SignData) {
        this._data = data;
        this.setUi()
    }

    private setUi() {
        Cmn.res.setSprite(Res.PATH_ICON + 'Icon_Gold', this.icon);
        //this.mark.active = this._data.isSign;
        Cmn.res.setSprite(Res.PATH_MAINUI + (this._data.isSign ? "ScorePanel" : "UI"), this.bg);
        //this.bg.setState((this._data.isSign ? cc.Sprite.State.GRAY : cc.Sprite.State.NORMAL));
        this.num.string = "x" + this._data.cfg.gold
    }
}