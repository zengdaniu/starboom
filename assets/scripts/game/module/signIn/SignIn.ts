import { Win } from "../Win";
import { SignInItem } from "./SignInItem";
import { UserDB, UserDataKey } from "../../frame/UserData";
import { Cmn } from "../../frame/Cmn";
import { CfgConstants } from "../../cfg/CfgConstants";
import MixedUtils from "../../utils/MixedUtils";
import { CalcType } from "../../frame/Calc";
import { SignCfg } from "../../cfg/SignCfg";
import { TipsType } from "../tip/TipItem";
import {ViewPosID} from "../../pt/Platform";
const { ccclass, property } = cc._decorator;

@ccclass
export class SignIn extends Win {

    @property(SignInItem)
    item: SignInItem[] = [];
    @property(cc.Node)
    signBtn: cc.Node = null;
    @property(cc.Node)
    done: cc.Node = null;
    @property(cc.Toggle)
    viewVideo: cc.Toggle = null;

    private _userDB: UserDB;
    private _starStamp: number;
    private _endStame: number;
    private _signData: SignData[];

    private _cbObject: any;
    private _cbFun: Function;
    
    setArgs(args: any[]) {
        this._cbFun = args[0];
        this._cbObject = args[1];
    }

    onEnable() {
        super.onEnable();
        this._userDB = Cmn.ud.userDB;
        // 获取今天0点和23点59分59秒时间戳
        this._starStamp = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
        this._endStame = new Date(new Date().setHours(23, 59, 59, 0)).getTime();
        this.buildData();
        this.setUi();
    }
    onDisable() {
        Cmn.pf.hideBanner();
    }
    /** 控制基本ui显示隐藏 */
    private setUi() {
        // 为了测试讲获取0点的时间戳转换出来看是否正确,先保留
        // cc.error(new Date(this._starStamp).toLocaleString().replace(/:\d{1,2}$/, ' '));
        this.signBtn.active = this._userDB.signDate < this._starStamp;
        this.done.active = this._userDB.signDate >= this._starStamp;
    }

    /** 构建适用的数据结构 */
    private buildData() {
        if (null != this._signData) return;
        this._signData = [];
        let days: number = this._userDB.signDays % 7;
        let data: SignData;
        for (let i: number = 0; i < this.item.length; i++) {
            data = new SignData();
            data.index = i;
            data.isSign = i < days;
            data.cfg = Cmn.cfg.getCfg(CfgConstants.RES_SIGN, i + 1, true);
            this._signData.push(data);
            this.item[i].data = data;
        }
    }

    // 签到按钮点击
    private onBtnClick() {
        if (this._userDB.signDate > this._starStamp) {
            Cmn.ui.tip.pushLblArr("今天已经签到过了");
            return;
        }
        if (this.viewVideo.isChecked){
            Cmn.pf.showVideo(ViewPosID.SignIn,null, null, this.watchVideoCB, this);
            Cmn.pf.hideBanner();
        }else{
            this.updataSign();
        }
    }
    watchVideoCB(status: boolean){
        if (!status) {
            Cmn.pf.showBanner();
            return;
        }
        Cmn.ud.userDB.watchTv++;
        this.updataSign();
    }
    updataSign(){
        this._userDB.signDays++;
        this._userDB.signDate = MixedUtils.getTimeStamp();
        Cmn.ud.saveLocalSolt(UserDataKey.SIGNDAYS);
        Cmn.ud.saveLocalSolt(UserDataKey.SIGNDATE);
        let index = (this._userDB.signDays > 0 && this._userDB.signDays % 7 == 0) ? 6 : this._userDB.signDays % 7 - 1;
        let addVal: string = this._signData[index].cfg.gold;
        let addNum: number[] = Cmn.calc.strToArr(addVal);
        if(this.viewVideo.isChecked){
            Cmn.pf.showBanner();
            addNum=Cmn.calc.calcNum(CalcType.RIDE, addNum, 2);
        }
        this._userDB.money = Cmn.calc.calcNum(CalcType.PLUS, this._userDB.money, addNum);
        this._userDB.upMoney++;
        Cmn.ui.tip.pushLblArr(Cmn.calc.arrToStr(addNum), TipsType.GOLD);
        Cmn.ud.saveLocalSolt(UserDataKey.MONEY);
        this._signData[index].isSign = true;
        this.item[index].data = this._signData[index];
        this.setUi();
        Cmn.ud.userDB.signIn++;
        this._cbFun.call(this._cbObject);
    }
}

/** 签到每个Item的数据 */
export class SignData {
    index: number;
    isSign: boolean;
    cfg: SignCfg;
}