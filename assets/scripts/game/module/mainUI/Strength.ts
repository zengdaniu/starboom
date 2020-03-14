import { UserDB, UserDataKey } from "../../frame/UserData";
import { Cmn } from "../../frame/Cmn";
import { BindUtils } from "../../base/BindUtils";
import MixedUtils from "../../utils/MixedUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export class Strength extends cc.Component {

    @property(cc.Label)
    num: cc.Label = null;
    @property(cc.ProgressBar)
    bar: cc.ProgressBar = null;
    @property(cc.Label)
    cd: cc.Label = null;

    private _userDB: UserDB;
    private _binds: BindUtils[] = [];
    private _resumeSec: number;
    private _interval: any;

    onEnable() {
        this._userDB = Cmn.ud.userDB;
        this._binds.push(BindUtils.bindSetter(this.setUI, this, this._userDB, "upStrength"));
        this._resumeSec = Cmn.ud.resumeSec;
        this.setUI();
    }

    onDisable() {
        this._binds.forEach(e => { e.clear() });
        this._binds = [];
    }

    private setUI() {
        let now: number = this._userDB.nowStrength;
        let max: number = Cmn.ud.maxStrength;
        this.num.string = now + "/" + max;
        this.bar.progress = now / max;
        this.cd.node.active = now < max;
        if (this.cd.node.active) this.cd.string = MixedUtils.formatSec(this.calcSec()) + "后恢复1点";
        this.countDown();
    }

    private countDown() {
        if (this.cd.node.active && 0 != this._userDB.cdStrength && this._userDB.nowStrength < Cmn.ud.maxStrength) {
            if (this._interval) return;
            let self = this;
            let sec: number = this.calcSec();
            this._interval = setInterval(function () {
                --sec;
                self.cd.string = MixedUtils.formatSec(sec) + "后恢复1点";
                /**
                 * 条件一:如果有其他渠道增加了体力,这时体力达到上限,userDB里的cdStrength会被清零,这个时候可以停止定时器
                 * 条件二:读秒到达0,体力增加一点
                 */
                if (0 == self._userDB.cdStrength || 0 == sec) {
                    sec = self._resumeSec;
                    if (Cmn.ud.addStrength(1)) {
                        self._userDB.strengthAutoAddTime = 0;
                        clearInterval(self._interval);
                        self._interval = null;
                    } else {
                        self._userDB.strengthAutoAddTime = MixedUtils.getTimeStamp();
                    }
                    Cmn.ud.saveLocalSolt(UserDataKey.STRENGTHAUTOADDTIME);
                }
            }, 1000)
        }
    }

    private calcSec() {
        let sec: number = this._resumeSec - Math.floor((MixedUtils.getTimeStamp() - this._userDB.cdStrength) / 1000) % this._resumeSec;
        return sec;
    }
}