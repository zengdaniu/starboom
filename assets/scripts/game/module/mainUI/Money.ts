import { UserDB } from "../../frame/UserData";
import { Cmn } from "../../frame/Cmn";
import { BindUtils } from "../../base/BindUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export class Money extends cc.Component {

    @property(cc.Label)
    num: cc.Label = null;

    private _userDB: UserDB
    private _binds: BindUtils[] = [];

    onEnable() {
        this._userDB = Cmn.ud.userDB;
        this._binds.push(BindUtils.bindSetter(this.setUI, this, this._userDB, "upMoney"));
        this.setUI();
    }

    onDisable() {
        this._binds.forEach(e => { e.clear() });
        this._binds = [];
    }

    private setUI() {
        this.num.string = Cmn.calc.arrToStr(this._userDB.money, true);
    }
}