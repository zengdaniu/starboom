import { Mod } from "../Mod";
import ActorMgr from "./actor/ActorMgr";
import MapCtrl, { MapState } from "./MapCtrl";
import { LevelCfg } from "../../cfg/LevelCfg";
import { Cmn } from "../../frame/Cmn";
import { CfgConstants } from "../../cfg/CfgConstants";
import MakeEnemyCtrl from "./makeEnemy/MakeEnemyCtrl";
import { UserDB, UserDataKey } from "../../frame/UserData";
import { UIKeyEnum } from "../../frame/UIMgr";
import { AudioMgr, VolumeType } from "../../frame/AudioMgr";
import { Res } from "../../frame/Res";
import Leader from "./actor/Leader";
import MixedUtils from "../../utils/MixedUtils";

const { ccclass, property } = cc._decorator;


@ccclass
export default class Fight extends Mod {

    @property(ActorMgr)
    actorMgr: ActorMgr = null;
    @property(MapCtrl)
    mapCtrl: MapCtrl = null;
    @property(MakeEnemyCtrl)
    makeEnemyCtrl: MakeEnemyCtrl = null;
    @property(cc.Node)
    pauseNode: cc.Node = null;
    @property(cc.Node)
    warningNode: cc.Node = null;
    @property(sp.Skeleton)
    warningSp: sp.Skeleton = null;
    @property(cc.Node)
    topNode: cc.Node = null;
    @property(Leader)
    leader: Leader = null;

    static readonly MaxLv: number = 500;
    private readonly _nextTime: number = 2;      // 波次间隔时间啊

    private _state: FightState = 0;
    private _lastState: FightState = 0;
    private _curLv: number = 0;
    private _leftRevive: number = 0;
    private _resList: string[] = [];
    private _mapList: string[] = [];
    private _nextCD: number = 0;
    private _loaded:boolean =false;

    setArgs(args: any[]) {
        this._resList = args[0];
        this._mapList = args[1];
    }

    onLoad() {
        this.warningNode.active = false;
        //let self = this;
        // this.warningAni.onFinish = function () {
        //     self.warningAni.stop();
        //     self.warningNode.active = false;
        //     self.setState(FightState.Battle);
        // }.bind(this);
        this.topNode.y = Cmn.ui.yLimit;
    }
    //每次节点由disable改为enable时触发
    onEnable() {
        this._nextCD = 0;
        this.setState(FightState.Warning);
        this._curLv = Cmn.ud.chapter;
        this.actorMgr.initEnemyCache(this._resList);
        this.makeEnemyCtrl.setLevel(this._curLv);
        // this.lvLabel.string = "第" + this._curLv + "关";
        this.pauseNode.active = false;
        this._leftRevive = Cmn.ud.userDB.weapon.hp;
        // Cmn.audio.playMusic(VolumeType.MUSIC, AudioMgr.MUSIC_FIGHT, true);
        // this.warningSp.setCompleteListener(this.warningEnd.bind(this));
        this.mapCtrl.initMap(this._mapList[0]);
        Cmn.ui.isFighting = true;
        this._loaded =true;
        let self = this;
        this.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(function(){self.startGame()})));
    }
    //只有第一次加载的时候才会执行
    startGame(){
        let levelCfg:LevelCfg = Cmn.cfg.getCfg(CfgConstants.RES_LEVEL, this._curLv);
        if(levelCfg.event == 1){
            Cmn.ui.showModule(UIKeyEnum.TRYOUT, [this, this.tyrOutEvent]);
        }
        else{
            // let self = this;
            // this.node.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(function(){self.warningEnd()})));
            this.setState(FightState.Battle);
        }
    }
    tyrOutEvent(bTry:boolean,types:number){
        this.setState(FightState.Battle);
        if(bTry){
            /*
            0 tank 
            1 speed 
            2 gold
            */
            if(types[0]!=0){
                this.leader.initTank(types[0]);
            }else if(types[1]!=0){
                this.leader.setTrySpeed();
            }else if(types[2]!=0){
                this.leader.setDoubleGold();
            }
        }
    }
    onDisable() {
        cc.director.resume();
        this._nextCD = 0;
        this.mapCtrl.cleanBlock();
        this.actorMgr.cleanAllActors();
        this.actorMgr.cleanEnemys();
        // for (let i = 0; i < this._resList.length; ++i) {
        //     Cmn.res.releaseData(this._resList[i]);
        // }
        this._resList = [];
        // for (let i = 1; i < this._mapList.length; ++i) {
        //     Cmn.res.releaseData(this._mapList[i]);
        // }
        this._mapList = [];
        //this.warningSp.setCompleteListener(null);
        Cmn.ui.isFighting = false;
    }

    update(dt) {
        if (FightState.Result != this._state && this.actorMgr.isLeaderDeath()) {
            this.showResult();
        }

        this.updateState(dt);
    }

    onRetrunBtnClick() {
        Cmn.ui.showModule(UIKeyEnum.MAIN_UI);
    }

    onRefreshBtnClick() {
        this.resetLv();
    }

    onPauseBtnClick() {
        this.pauseNode.active = true;
        cc.director.pause();
    }

    onGoOnBtnClick() {
        this.pauseNode.active = false;
        cc.director.resume();
    }

    onNextBtnClick() {
        if (Fight.MaxLv > this._curLv) {
            this._curLv += 1;
            this.resetLv();
        }
    }

    onLastBtnClick() {
        if (1 < this._curLv) {
            this._curLv -= 1;
            this.resetLv();
        }
    }

    showResult() {
        let pass: number = this.actorMgr.finished;
        let getScore :number = this.leader.calcGold();
        Cmn.ud.userDB.curScore += this.actorMgr.score;
        if(pass == 1){
            Cmn.ui.showModule(UIKeyEnum.FIGHT_RESULT, [pass, this._leftRevive, this, this.continueCallBack,getScore]);
        }else{
            Cmn.ui.showModule(UIKeyEnum.FIGHT_RESULT, [pass, this._leftRevive, this, this.reviveCallBack,getScore]);
        }
        
        this.setState(FightState.Result);
    }

    shakeScreen() {

    }

    private warningEnd() {
        this.warningNode.active = false;
        this.setState(FightState.Battle);
        // if (1 == Cmn.ud.userDB.guideStep) {
        //     Cmn.ui.showModule(UIKeyEnum.GUIDE);
        // }
    }

    private reviveCallBack() {
        //this.actorMgr.leaderRevive();
        this._state = this._lastState;
        this._leftRevive -= 1;
        this.leader.reviev();
    }

    private continueCallBack() {
        if (Fight.MaxLv > this._curLv) {
            this._curLv = Cmn.ud.userDB.curChapter ;
            this.resetLv();
            //this.setState(FightState.Battle);
            this.startGame();    
            return;
        }
        
    }

    private resetLv() {
        this.actorMgr.reset();
        this.makeEnemyCtrl.setLevel(this._curLv);
        this.makeEnemyCtrl.setWaitState();
        
        let levelCfg:LevelCfg = Cmn.cfg.getCfg(CfgConstants.RES_LEVEL, this._curLv);
        let resList: string[] = MixedUtils.getLvResName(levelCfg);
        for (let i = 0; i < resList.length; ++i) {
            // 序列帧动画，发版前序列帧散图要设置好自动图集，不然此处的预加载就没有实际效果了
            Cmn.res.addRes(resList[i], Res.PATH_FIGHT_ENEMY + resList[i], Res.RES_T_IMG);
        }
        this._resList = resList;
        this.actorMgr.initEnemyCache(this._resList);
        this.mapCtrl.reset(levelCfg.map);
        this.pauseNode.active = false;
    }

    private updateState(dt) {
        switch (this._state) {
            case FightState.Next:
                // if (this.mapCtrl.isReachNext()) {
                //     //this.setState(FightState.Battle);
                //     this.setState(FightState.Warning);
                // }
                this._nextCD -= dt;
                if (0 >= this._nextCD) {
                    this._nextCD = 0;
                    this.setState(FightState.Battle);
                }
                break;
            case FightState.Battle:
                if (0 == this.actorMgr.runEnemyNum) {
                    if (this.makeEnemyCtrl.isWaitNext()) {
                        this.setState(FightState.Next);
                    } else if (this.makeEnemyCtrl.isEnd() && 0 == this.actorMgr.makingEnemyNum){
                        this.showResult();  
                    }
                }

                if (this.leader.isEnd()) {
                    this.showResult();
                }
                break
        }
    }

    private setState(newState: FightState) {
        if (newState == this._state) return;
        switch (newState) {
            case FightState.Next:
                this.mapCtrl.setState(MapState.Reset);
                //this.goNode.active = true;
                this._nextCD = this._nextTime;
                break;
            case FightState.Battle:
                this.mapCtrl.setState(MapState.Lock);
                this.makeEnemyCtrl.goNext();
                break;
            case FightState.Warning:
                // this.warningNode.active = true;
                // this.warningSp.setAnimation(0, "animation", false);
                //this.warningAni.play();
                //Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_WARNING);
                break;
        }
        this._lastState = this._state;
        this._state = newState;
    }

    private cleanRes() {
        for (let i = 0; i < this._resList.length; ++i) {
            Cmn.res.releaseData(this._resList[i]);
        }
        this._resList = [];
    }
}

// 地图状态
export enum FightState {
    Next = 0,       // 下一波
    Battle = 1,     // 战斗
    Warning = 2,    // 警告
    Result = 3,     // 结算
}
