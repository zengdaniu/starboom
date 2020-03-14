import ActorMgr from "../actor/ActorMgr";
import { LevelCfg } from "../../../cfg/LevelCfg";
import { Cmn } from "../../../frame/Cmn";
import { CfgConstants } from "../../../cfg/CfgConstants";
import { MonsterTeamCfg } from "../../../cfg/MonsterTeamCfg";

import EnemyPoint from "./EnemyPoint";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MakeEnemyCtrl extends cc.Component {

    @property(ActorMgr)
    actorMgr: ActorMgr = null;

    private _state: MakeEnemyState = 0;
    private _curLv: number = 0;
    private _LevelCfg: LevelCfg = null;
    private _curTeamIndex: number = -1;
    private _maxTeamNum: number = 0;
    private _lvValue: number = 1;
    private _MonsterTeam :MonsterTeamCfg =null;
    private _appearTI :number[] =[5,10,10,10,15,15];
    private _curTI :number = 0 ;

    onDieable() {
        this.reset();
    }

    setLevel(lv: number) {
        this.reset();
        this._curLv = lv;
        this._LevelCfg = Cmn.cfg.getCfg(CfgConstants.RES_LEVEL, lv);
        if (null == this._LevelCfg) return;
        this.actorMgr.setMaxLvEnemyNum(this._LevelCfg.score);
        this._MonsterTeam = Cmn.cfg.getCfg(CfgConstants.RES_MONSTERTEAM, this._LevelCfg.monsterTeam);
        this._maxTeamNum =this._MonsterTeam.monsterId.length;
        if( this._maxTeamNum != this._MonsterTeam.num.length){
            cc.error("monsterId.length !=num.length");
        }
        this._curTeamIndex = -1;
        this.setState(MakeEnemyState.Ready);
    }

    update(dt) {
        switch (this._state) {
            case MakeEnemyState.Run:
                for(let i = 0 ; i <this._MonsterTeam.num[this._curTeamIndex];i++){
                    this.actorMgr.addEnemy(this._MonsterTeam.monsterId[this._curTeamIndex] , cc.v2(0,450), this._lvValue);
                }
                this.setState(MakeEnemyState.WaitNext);
                break;
        }
        this._curTI += dt;
        if(this._curTI >this._appearTI[this._curTeamIndex] && this.isWaitNext()){
            this._curTeamIndex++;
            this._curTI = 0;
            this.setState(MakeEnemyState.Run);
        }
    }
    /** 如果没有球了，马上产生新球，如果还有球时间到了也产生新球*/
    goNext() {
        if (MakeEnemyState.None == this._state || MakeEnemyState.Run == this._state || MakeEnemyState.End == this._state) return;
        if (this._curTeamIndex >= this._maxTeamNum) {
            this.setState(MakeEnemyState.End);
            return;
        }
        this._curTeamIndex++;
        this._curTI = 0;
        this.setState(MakeEnemyState.Run);
    }


    setState(newState: MakeEnemyState) {
        if (newState == this._state) return;
        switch (newState) {
            case MakeEnemyState.WaitNext:
            case MakeEnemyState.End:
                break;
        }
        this._state = newState;
    }

    isEnd(): boolean {
        return MakeEnemyState.End == this._state;
    }

    isWaitNext() {
        return MakeEnemyState.WaitNext == this._state;
    }

    private reset() {
        this._curLv = 0;
        this._LevelCfg = null;
        this._curTI = 0;
        this._maxTeamNum = 0;
        this.setState(MakeEnemyState.None);
    }

    setWaitState() {
        this.setState(MakeEnemyState.WaitNext);
    }
}

export enum MakeEnemyState {
    None = 0,
    Ready = 1,          // 准备好了
    WaitNext = 2,       // 等待下一波 
    Run = 3,            // 进行中
    End = 4,            // 结束
}