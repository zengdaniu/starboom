import { Mod } from "../Mod";
import { Cmn } from "../../frame/Cmn";
import { UIKeyEnum } from "../../frame/UIMgr";
import { UserDB, UserDataKey, UserData } from "../../frame/UserData";
import { Strength } from "./Strength";
import { Money } from "./Money";
import  Tank  from "./Tank";
import {PushBtnCtrl} from "./PushBtnCtrl";
import { TipsType } from "../tip/TipItem";
import { CalcType } from "../../frame/Calc";
import MixedUtils from "../../utils/MixedUtils";
import { Platform } from "../../pt/Platform";
import { LoadModeEnum } from "../loading/Loading";
import { Res } from "../../frame/Res";
import { LevelCfg } from "../../cfg/LevelCfg";
import { CfgConstants } from "../../cfg/CfgConstants";
import { AudioMgr, VolumeType } from "../../frame/AudioMgr";
const { ccclass, property } = cc._decorator;

@ccclass
export class MainUI extends Mod {

    @property(Strength)
    strength: Strength = null;
    @property(Money)
    money: Money = null;
    @property(cc.Label)
    missionLabel: cc.Label = null;
    @property(cc.Node)
    slider : cc.Node = null;
    @property(cc.Node)
    tank : cc.Node = null;
    @property(cc.Node)
    moreGameNode :cc.Node =null;
    @property(PushBtnCtrl)
    pushBtnCtrl: PushBtnCtrl = null;
    @property(cc.Node)
    signNode :cc.Node = null;

    static instance: MainUI;
    private _userDB: UserDB;
    private _dbTime: number = 0;// 双倍时间(多少秒)
    private _dbFlag: boolean = false;// 双倍时间倒计时flag
    private _tank :Tank =null;
    private _curSliderTI :number= 0;
    private _gapSliderTI :number= 0.3;
    private _sliderMoveDir :number =1;
    private _slider :cc.Slider ;
    onLoad() {
        if (null == MainUI.instance) MainUI.instance = this;
        this._userDB = Cmn.ud.userDB;
        Cmn.ui.hideFirstNode();
        this._tank =this.tank.getComponent('Tank');
        this._slider =this.slider.getComponent(cc.Slider);
    }

    onEnable() {
        this.calcDbTime();
        this.missionLabel.string = "第 " + Cmn.ud.userDB.curChapter + " 关";
        let self = this;
        // let endCall = cc.callFunc(function () {
        //     if (0 == self._userDB.guideStep ||
        //         (2 == self._userDB.guideStep && !Cmn.ud.lastFightIsWin)) {
        //         Cmn.ui.showModule(UIKeyEnum.GUIDE);
        //     } else {
                // let leaveTime: number = Cmn.ud.totalLeaveTime;
                // if (0 < leaveTime && UserData.leaveTimeIT < leaveTime) {
                //     Cmn.ui.showModule(UIKeyEnum.LEAVEGET, [leaveTime]);
                // }
        //     }
        //     self.node.stopAllActions();
        // })
        // this.node.runAction(cc.sequence(cc.delayTime(0.5), endCall));
        let leaveTime: number = Cmn.ud.totalLeaveTime;
        if (0 < leaveTime && UserData.leaveTimeIT < leaveTime) {
            let endCall = cc.callFunc(function () {
                Cmn.ui.showModule(UIKeyEnum.LEAVEGET, [leaveTime]);
            })
            this.node.runAction(cc.sequence(cc.delayTime(0.3), endCall))
        }
        let starStamp :number = new Date(new Date().setHours(0, 0, 0, 0)).getTime();
        this.signNode.active=false;
        if(self._userDB.signDate < starStamp){
            let endCall = cc.callFunc(function () {
                Cmn.ui.showModule(UIKeyEnum.SIGNIN,[self.hideSignin,self]);
                //self.node.stopAllActions();
            })
            this.node.runAction(cc.sequence(cc.delayTime(0.5), endCall));
            this.signNode.active=true;
        }else{
            Cmn.ud.userDB.signIn = 1 ; //今日已签到，任务那边要用
        }
       
        {
            let endCall = cc.callFunc(function () {
                Cmn.audio.playMusic(VolumeType.MUSIC, AudioMgr.MUSIC_FIGHT, true);
            })
            this.node.runAction(cc.sequence(cc.delayTime(1), endCall));
        }
        window.platform.getGameInfo(this.getGameSCB, this.getGameECB, this);
        Cmn.ud.userDB.curScore=0;
    }


    hideSignin(){
        this.signNode.active=false;
    }

    private getGameSCB(data: any) {
        Cmn.ud.moreGameData = data;
        this.moreGameNode.active = data.status;
        this.pushBtnCtrl.showNext();
    }

    private getGameECB() {
        Cmn.ui.tip.pushLblArr("拉取推荐数据失败！", TipsType.TXT);
    }


    onDisable(){
        Cmn.audio.stopMusic(AudioMgr.MUSIC_FIGHT);
    }
    update(dt) {
        Cmn.ud.update(dt);
        // if (this._userDB.doubleGoldStart > 0 && !this._dbFlag) {
        //     this._dbFlag = true;
        //     this.calcDbTime();
        // }
        this.updateSlider(dt);

    }
    updateSlider(dt){
        this._curSliderTI +=dt;
        if(this._curSliderTI>this._gapSliderTI){
            let progress:number = this._slider.progress + this._sliderMoveDir*dt;
            if(progress > 1){
                this._sliderMoveDir = -1 ;
                progress =this._slider.progress + this._sliderMoveDir*dt;
            }else if(progress < 0){
                this._sliderMoveDir = 1 ;
                progress =this._slider.progress + this._sliderMoveDir*dt;
            }
            this._slider.progress = progress;
            let x :number = 300*progress -150 ;
            this._tank.setXDirMove(x);
        }
    }
    /** 计算双倍时间 */
    private calcDbTime() {
        if (this._userDB.doubleGoldEnd > 0) {
            this._dbTime = this._userDB.doubleGoldTime - Math.floor((MixedUtils.getTimeStamp() - this._userDB.doubleGoldEnd) / 1000);
            this._dbTime = this._dbTime > 0 ? this._dbTime : 0;
        }
    }


    /** 主界面按钮点击事件统一管理 */
    onBtnClick(event: cc.Event.EventTouch, customEventData: string) {
        let key: UIKeyEnum = UIKeyEnum[customEventData];
        switch (key) {
            // case UIKeyEnum.DOUBLE:
            //     this._dbTime > 0 ? Cmn.ui.tip.pushLblArr("Buff生效中") : Cmn.ui.showModule(key);
            //     break;
            case UIKeyEnum.RANK:
                // if (Cmn.pt.ptName != PTEnum.WX) {
                //     Cmn.ui.tip.pushLblArr("非正式环境无法打开");
                //     return;
                // }
                // Cmn.ui.showModule(key);
                break;
            case UIKeyEnum.FIGHT:
                // if (Cmn.ud.reduceStrength(1)) {
                //     Cmn.ud.saveLocalSolt(UserDataKey.NOWSTRENGTH);
                // } else {
                //     Cmn.ui.showModule(UIKeyEnum.SHOP);
                //     Cmn.ui.tip.pushLblArr("体力不足，可前往商店购买");
                //     return;
                // }
                let lvCfg: LevelCfg = Cmn.cfg.getCfg(CfgConstants.RES_LEVEL, Cmn.ud.userDB.curChapter);
                let resList: string[] = MixedUtils.getLvResName(lvCfg);
                for (let i = 0; i < resList.length; ++i) {
                    // 序列帧动画，发版前序列帧散图要设置好自动图集，不然此处的预加载就没有实际效果了
                    Cmn.res.addRes(resList[i], Res.PATH_FIGHT_ENEMY + resList[i], Res.RES_T_IMG);
                }
                // 地图资源
                let mapList: string[] = [lvCfg.map];
                for (let i = 1; i < mapList.length; ++i) {
                    Cmn.res.addRes(mapList[i], Res.PATH_MAP + mapList[i], Res.RES_T_IMG);
                }
                Cmn.ui.showModule(key, [resList, mapList], LoadModeEnum.FULL);
                break;
            case UIKeyEnum.WEAPON:
                Cmn.ui.showModule(key,[this._tank, this._tank.resetTank]);
                break;
            case UIKeyEnum.SIGNIN:
                Cmn.ui.showModule(key,[this.hideSignin,this]);
                break;
            default:
                Cmn.ui.showModule(key);
                break;
        }
    }

    /** GM功能按钮点击 */
    onGmBtnClick(event: cc.Event.EventTouch, customEventData: number) {
        let num: number = Number(customEventData);
        switch (num) {
            case 0:// 体力减少
                Cmn.ud.reduceStrength(1);
                break;
            case 1://体力增加
                Cmn.ud.addStrength(1);
                break;
            case 2:// 保存所有数据到本地
                Cmn.ud.setLocalAll();
                break;
            case 3:// 金币加1M
                this._userDB.money = Cmn.calc.calcNum(CalcType.PLUS, this._userDB.money, Cmn.calc.strToArr("1M"));
                this._userDB.upMoney++;
                break;
        }
    }
}