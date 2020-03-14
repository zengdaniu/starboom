import { Win } from "../Win";
import { Cmn } from "../../frame/Cmn";
import { OfflineCfg } from "../../cfg/OfflineCfg";
import { CfgConstants } from "../../cfg/CfgConstants";
import { AttributesCfg} from "../../cfg/AttributesCfg"
import { CalcType } from "../../frame/Calc";
import { TipsType } from "../tip/TipItem";
import { UserDataKey } from "../../frame/UserData";
import {ViewPosID} from "../../pt/Platform";
const { ccclass, property } = cc._decorator;

@ccclass
export class LeaveGet extends Win {

    @property(cc.Label)
    timeLabel: cc.Label = null;
    @property(cc.Label)
    goldNum: cc.Label = null;
    @property(cc.Label)
    tips: cc.Label = null;
    @property(cc.Toggle)
    viewVideo: cc.Toggle = null;

    private _leaveTime: number = 0;
    private _getMoney: number[] = [];
    private _addVal :number [] = [];

    setArgs(args: any[]) {
        this._leaveTime = args[0];
    }

    onEnable() {
        Cmn.ud.totalLeaveTime = 0;
        if (180>= this._leaveTime ) {
            this.closeWindow();
        }
        let attrcfg:AttributesCfg =  Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES, 3);
        this.timeLabel.string = "离线" + this.getTimeStr(this._leaveTime) + "获得";
        this._leaveTime *=(attrcfg.value+attrcfg.upValue*(Cmn.ud.userDB.weapon.wage-1))/100 ; //Cmn.calc.strToArr(cfg.gold);
        this._addVal = Cmn.calc.strToArr("5");
        Cmn.calc.calcNum(CalcType.RIDE, this._addVal , this._leaveTime);
        this.goldNum.string = "x" + Cmn.calc.arrToStr(this._addVal );
        this.tips.string = 5 + "/s，上限2小时"
    }

    onDouble() {
        let udb = Cmn.ud.userDB;
        let addVal: number[] = Cmn.ud.newArr(this._getMoney);
        Cmn.calc.calcNum(CalcType.RIDE, addVal, 2 * this._leaveTime);
        udb.money = Cmn.calc.calcNum(CalcType.PLUS, udb.money, addVal);
        udb.upMoney++;
        Cmn.ui.tip.pushLblArr(Cmn.calc.arrToStr(addVal), TipsType.GOLD);
        Cmn.ud.saveLocalSolt(UserDataKey.MONEY);
        this.closeWindow();
    }

    onGetBtnClick() {
        if (this.viewVideo.isChecked){
            Cmn.pf.showVideo(ViewPosID.LeaveGet,null, null, this.watchVideoCB, this);
            Cmn.pf.hideBanner();
        }else{
            this.getGold();
        }
        
    }
    watchVideoCB(status: boolean){
        if (!status) {
            Cmn.pf.showBanner();
            return;
        }
        Cmn.ud.userDB.watchTv++;
        this.getGold();
    }
    getGold(){
        let udb = Cmn.ud.userDB;
        let addVal: number[] = Cmn.ud.newArr(this._addVal);
        if(this.viewVideo.isChecked){
            Cmn.pf.showBanner();
            Cmn.calc.calcNum(CalcType.RIDE, addVal, 2);
        }
        let money :number []=Cmn.ud.newArr(udb.money);
        Cmn.calc.calcNum(CalcType.PLUS,money, addVal);
        udb.upMoney++;
        Cmn.ui.tip.pushLblArr(Cmn.calc.arrToStr(addVal), TipsType.GOLD);
        udb.money =money;
        Cmn.ud.saveLocalSolt(UserDataKey.MONEY);
        this.closeWindow();
    }

    private getTimeStr(time: number): string {
        let timeStr: string = "";
        let h: number = Math.floor(time / 3600);
        let m: number = Math.floor((time - h * 3600) / 60);
        let s: number = time - h * 3600 - m * 60;
        if (0 > s) return timeStr;
        timeStr = (0 < h ? h + "小时" : "") + (0 < m ? m + "分" : "") + s + "秒";
        return timeStr;
    }
}