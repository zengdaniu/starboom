import { Cmn } from "../../frame/Cmn";
import { UIKeyEnum } from "../../frame/UIMgr";
import { Win } from "../Win";
import { LevelCfg } from "../../cfg/LevelCfg";
import { CfgConstants } from "../../cfg/CfgConstants";
import { CalcType } from "../../frame/Calc";
import { UserDB, UserDataKey } from "../../frame/UserData";
import Fight from "./Fight";
import { TipsType } from "../tip/TipItem";
import { GameSprite } from "../../base/GameSprite";
import { AudioMgr, VolumeType } from "../../frame/AudioMgr";
import {ViewPosID} from "../../pt/Platform";
const { ccclass, property } = cc._decorator;

@ccclass
export default class FightResult extends Win {//

    @property(cc.Label)
    wage: cc.Label = null;
    @property(cc.Label)
    bestScore: cc.Label = null;
    @property(cc.Label)
    curScore: cc.Label = null;
    @property(cc.ProgressBar)
    progress: cc.ProgressBar = null;
    @property(cc.Label)
    pgcontent: cc.Label = null;
    
    @property(cc.Label)
    grade: cc.Label = null;
    @property(cc.Label)
    gradeNext: cc.Label = null;

    @property(cc.Label)
    screenBtnLeb: cc.Label = null;
    @property(cc.Node)
    reviveBtnNode: cc.Node = null;
    @property(cc.Node)
    BtnNode: cc.Node = null;
    @property(cc.Node)
    ResultNode: cc.Node = null;

    private _isPass: boolean = false;
    private _finished :number = 0;
    private _reviveNum: number = 0;
    private _cbObject: any;
    private _cbFun: Function;
    private _getCoin: number[] = [];
    private _getGold: number =0;
    setArgs(args: any[]) {
        this._finished = args[0];
        if(this._finished>=1)
            this._isPass = true;
        else
            this._isPass = false;
        this._reviveNum = args[1];
        this._cbObject = args[2];
        this._cbFun = args[3];
        this._getGold =  args[4];
    }
    onEnable() {
        this.reviveBtnNode.active = (!this._isPass && 0 < this._reviveNum);
       
        Cmn.ud.lastFightIsWin = this._isPass;
        let udb = Cmn.ud.userDB;
        this.wage.string ='恭喜获得金币：'+this._getGold;
        this.curScore.string =''+ udb.curScore;
        if(udb.curScore > udb.bestScore){
            this.bestScore.string ="恭喜破纪录";
            udb.bestScore =udb.curScore;
            Cmn.ud.saveLocalSolt(UserDataKey.BESTSCORE);
        }   
        else
            this.bestScore.string ="最高记录："+udb.bestScore;

        this.progress.progress=this._finished;
        this.grade.string = ''+udb.curChapter;
        this.gradeNext.string = ''+(udb.curChapter+1);
        if(this._isPass){
            this.pgcontent.string = "打通第"+udb.curChapter+"关！";
            this.screenBtnLeb.string = "点击屏幕继续游戏";
        }else{
            this.pgcontent.string = Math.floor(this._finished*100)+"% 已完成";
            this.screenBtnLeb.string = "点击屏幕回到主页面";
            Cmn.ud.userDB.curScore = 0;
        }
        // udb.money = Cmn.calc.calcNum(CalcType.PLUS, udb.money, Cmn.calc.strToArr(this._getCoin));
        // Cmn.ud.saveLocalSolt(UserDataKey.MONEY);
        // udb.upMoney++;
        // Cmn.ui.tip.pushLblArr(this._getCoin, TipsType.GOLD);
        
        if (this._isPass && udb.curChapter < Fight.MaxLv) {
            udb.curChapter += 1;
            Cmn.ud.saveLocalSolt(UserDataKey.CURCHAPTER);
            this.BtnNode.active =false;
            this.ResultNode.active =true;
        }
        if(!this._isPass){
            this.ResultNode.active =false;
            this.BtnNode.active =true;
        }
        Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_SWITCH);
        cc.director.pause();
    }
    calcMoney(){
        Cmn.ud.userDB.money=Cmn.calc.calcNum(CalcType.PLUS,Cmn.ud.userDB.money,this._getGold );
        Cmn.ud.userDB.upMoney++;
        Cmn.ud.saveLocalSolt(UserDataKey.MONEY);
    }
    onDisable() {
        Cmn.pf.hideBanner();
        cc.director.resume();
    }

    onReviveBtnClicl() {
        if (null != this._cbFun && null != this._cbObject) {
            this._cbFun.call(this._cbObject);
        }
        this._cbFun = null;
        this._cbObject = null;

        Cmn.ud.userDB.weapon.hp -= 1 ;
        Cmn.ud.saveLocalSolt(UserDataKey.WEAPON);
        this.closeWindow();
    }

    onContinueBtnClick(){
        if(this._isPass){
            if (null != this._cbFun && null != this._cbObject) {
                this._cbFun.call(this._cbObject);
            }
            this._cbFun = null;
            this._cbObject = null;

            this.closeWindow();
        }else{
            Cmn.ud.userDB.curScore = 0;
            this.closeWindow();
            Cmn.ui.showModule(UIKeyEnum.MAIN_UI);
        }
    }

    onRetrunBtnClick() {
        this.BtnNode.active =false;
        this.ResultNode.active =true;
    }
    watchVideo(){
        Cmn.pf.showVideo(ViewPosID.FreeRelive,null, null, this.onExtraHpCB, this);
        Cmn.pf.hideBanner();
    }
    onExtraHpCB(status:boolean){
        if(!status){
            Cmn.pf.showBanner();
            return;
        }

        if (null != this._cbFun && null != this._cbObject) {
            this._cbFun.call(this._cbObject);
        }
        this._cbFun = null;
        this._cbObject = null;
        Cmn.ud.userDB.watchTv++;
        this.closeWindow();
    }
    onExtraHpBtnClick() {
        this.watchVideo();
    }
}
