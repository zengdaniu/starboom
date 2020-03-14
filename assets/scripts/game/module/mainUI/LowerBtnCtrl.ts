import { Mod } from "../Mod";
import { Cmn } from "../../frame/Cmn";
import { UIKeyEnum } from "../../frame/UIMgr";
import { UserDB, UserDataKey, UserData } from "../../frame/UserData";
import { Strength } from "./Strength";
import { Money } from "./Money";
import { Calc,CalcType } from "../../frame/Calc";
import MixedUtils from "../../utils/MixedUtils";
//import { PTEnum } from "../../pt/Platform";
import { LoadModeEnum } from "../loading/Loading";
import { Res } from "../../frame/Res";
import { LevelCfg } from "../../cfg/LevelCfg";
import {AttributesCfg} from "../../cfg/AttributesCfg"
import { CfgConstants } from "../../cfg/CfgConstants";
import { AudioMgr, VolumeType } from "../../frame/AudioMgr";
import {ViewPosID} from "../../pt/Platform";
const { ccclass, property } = cc._decorator;

@ccclass
export class MainUI extends Mod {
    @property(cc.Button)
    dynamicBtn :cc.Button[] =[];

    @property(cc.Sprite)
    dynamicSp :cc.Sprite[] =[];
    @property(Number)
    maxScale:number = 1.2;
    @property(cc.Node)
    spHp : cc.Node =null;

    @property(cc.Label)
    labMain: cc.Label = null;
    @property(cc.Label)
    labLevel: cc.Label = null;
    @property(cc.Label)
    upMian: cc.Label = null;
    @property(cc.Label)
    upNum: cc.Label = null;

    private _cfg :AttributesCfg;
    static instance: MainUI;
    private _userDB: UserDB;
    private _dbTime: number = 0;// 双倍时间(多少秒)
    private _dbFlag: boolean = false;// 双倍时间倒计时flag
    private _curScale: number =1;
    private _timeInterval :number =0.08;
    private _curInterval :number =0;
    private _addVal: number[] =[0];
    private _curEventData : string ='speed';
    private _cannotUp :boolean =false;
    onLoad() {
        MainUI.instance;
        this._userDB = Cmn.ud.userDB;

    }

    onEnable() {
        // let self = this;
        // let endCall = cc.callFunc(function () {
        //     if (0 == self._userDB.guideStep ||
        //         (2 == self._userDB.guideStep && !Cmn.ud.lastFightIsWin)) {
        //         Cmn.ui.showModule(UIKeyEnum.GUIDE);
        //     } else {
        //         let leaveTime: number = Cmn.ud.totalLeaveTime;
        //         if (0 < leaveTime && UserData.leaveTimeIT < leaveTime) {
        //             Cmn.ui.showModule(UIKeyEnum.LEAVEGET, [leaveTime]);
        //         }
        //     }
        //     self.node.stopAllActions();
        // })
        // this.node.runAction(cc.sequence(cc.delayTime(0.5), endCall));
        this._cfg = Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES,1);
        this.dynamicBtn[0].node.y=30;
        this.labMain.string = '开火速度';
        this.labLevel.string = '等级'+this._userDB.weapon.speed;
        this._addVal = Cmn.calc.strToArr(this._cfg.upGold);
        Cmn.calc.calcNum(CalcType.RIDE, this._addVal, this._userDB.weapon.speed-1);
        this._addVal=Cmn.calc.calcNum(CalcType.PLUS,Cmn.calc.strToArr(this._cfg.gold),this._addVal );
        this.upNum.string = Cmn.calc.arrToStr(this._addVal);
        this.spHp.active =false;
    }

    update(dt) {
        //this.speedBtn.getChildByName('sprite').setScale(1);
        this._curInterval +=dt;
        if(this._curInterval<this._timeInterval) return ;
        this._curInterval = 0;

        this._curScale += dt;
        this.dynamicSp.forEach(element => {
            element.node.scale =this._curScale;
        }); 
        if(this._curScale >= this.maxScale){
            this._curScale = 1;
        }
    }

    onBtnClick(event: cc.Event.EventTouch, customEventData: string){
        Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_BUTTON);
        this.dynamicBtn.forEach(element => {
            element.node.y = 47
        });
        this.spHp.active =false;
        event.getCurrentTarget().y=30; 
        let level :number = 0;
        this._curEventData = customEventData;
        if(customEventData == 'speed'){
            this.labMain.string = '开火速度';
            level = this._userDB.weapon.speed;
            this._cfg = Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES,1);
            this.labLevel.string = '等级'+level;
        }else if(customEventData == 'power'){
            this.labMain.string = '子弹威力';
            level = this._userDB.weapon.attLv;
            this._cfg = Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES,2);
            let percent :number = this._cfg.value+this._cfg.upValue*(level-1)
            this.labLevel.string = percent + "%";
        }else if(customEventData == 'gold'){
            this.labMain.string = '金币获得';
            level = this._userDB.weapon.gold;
            this._cfg = Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES,3);
        }else if(customEventData == 'wage'){
            this.labMain.string = '离线收入';
            level = this._userDB.weapon.wage;
            this._cfg = Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES,3);
            let percent :number = this._cfg.value+this._cfg.upValue*(level-1)
            this.labLevel.string = percent + "%";
        }else if(customEventData == 'hp'){
            this.labMain.string = '额外生命';
            level = this._userDB.weapon.hp;
            this._cfg = Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES,4);
            this.spHp.active =true;
            this.labLevel.string = level+ "";
        }
        if(this._cfg.maxLevel==level){
            Cmn.ui.tip.pushLblArr("已到满级");
            this._cannotUp = true;
        }else{
            this._cannotUp = false;            
        }

        this._addVal = Cmn.calc.strToArr(this._cfg.upGold);
        Cmn.calc.calcNum(CalcType.RIDE, this._addVal, level-1);
        this._addVal=Cmn.calc.calcNum(CalcType.PLUS,Cmn.calc.strToArr(this._cfg.gold),this._addVal );

        this.upNum.string = Cmn.calc.arrToStr(this._addVal);
    }

    onBtnBuyClick(event: cc.Event.EventTouch, customEventData: string){
        //this._userDB.money = Cmn.calc.calcNum(CalcType.REDUCE, this._userDB.money, this._addVal);
        if(this._cannotUp){
            Cmn.ui.tip.pushLblArr("已到满级");
            return;
        }
        let num: number[] = Cmn.ud.newArr(this._userDB.money);
        num = Cmn.calc.calcNum(CalcType.REDUCE, num, this._addVal);
        if (1 == num.length && -1 == num[0]) {
            Cmn.ui.tip.pushLblArr("金币不足，请前往关卡获取");
            return;
        } else {
            this._userDB.money = num;
            this._userDB.upMoney++;
        }
       
        this.upWeapon();
        Cmn.ud.saveLocalSolt(UserDataKey.MONEY);
    }
    upWeapon(){
        //判断满级
        let level :number = 0;
        if(this._curEventData == 'speed'){
            this.labMain.string = '开火速度';
            level = ++this._userDB.weapon.speed ;
            this.labLevel.string = '等级'+level;
            this._userDB.upAttribute++;
        }else if(this._curEventData == 'power'){
            level = ++this._userDB.weapon.attLv ;
            let percent :number = this._cfg.value+this._cfg.upValue*(level-1)
            this.labLevel.string = percent + "%";
            this._userDB.upAttribute++;
        }else if(this._curEventData == 'gold'){
            level = ++this._userDB.weapon.gold;
            this.labLevel.string = '等级'+level;
            this._userDB.upAttribute++;
        }else if(this._curEventData == 'wage'){
            level=++this._userDB.weapon.wage;
            let percent :number = this._cfg.value+this._cfg.upValue*(level-1)
            this.labLevel.string = percent + "%";
            this._userDB.upAttribute++;
        }else if(this._curEventData == 'hp'){
            level = ++this._userDB.weapon.hp;
            this.labLevel.string = ''+level;
        }

        this._addVal = Cmn.calc.strToArr(this._cfg.upGold);
        Cmn.calc.calcNum(CalcType.RIDE, this._addVal, level-1);
        this._addVal=Cmn.calc.calcNum(CalcType.PLUS,Cmn.calc.strToArr(this._cfg.gold),this._addVal );
        this.upNum.string = Cmn.calc.arrToStr(this._addVal);

        Cmn.ud.saveLocalSolt(UserDataKey.WEAPON);
    }
    onBtnVideoBuyClick(event: cc.Event.EventTouch, customEventData: string){
        if(this._cannotUp){
            Cmn.ui.tip.pushLblArr("已到满级");
            return;
        }
        Cmn.pf.showVideo(ViewPosID.FreeUpgrade,null, null, this.videoCloseCB, this);
        Cmn.pf.hideBanner();
    }
    watchVideo(){
        
        
    }
    videoCloseCB(status : boolean){
        Cmn.pf.showBanner();
        if(!status){
            return;
        }
        this.upWeapon();
        this._userDB.watchTv++;

    }

}