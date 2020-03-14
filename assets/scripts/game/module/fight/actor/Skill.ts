import { MonsterSkillCfg } from "../../../cfg/MonsterSkillCfg";
import { Cmn } from "../../../frame/Cmn";
import { CfgConstants } from "../../../cfg/CfgConstants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Skill {

    private _cfg: MonsterSkillCfg = null;
    public _attStep: number;
    private _attackCd: number = 0;
    private _attack: number = 0;

    get type(): number { return this._cfg.skillType; }
    get attRange(): number { return this._cfg.range; }
    get attVal(): number { return this._attack; }
    get bulletSpeed(): number { return this._cfg.speed; }

    setData(id: number, lvValue: number): boolean {
        this._cfg = Cmn.cfg.getCfg(CfgConstants.RES_MONSTERSKILL, id);
        if (null == this._cfg) return false;

        this._attack = this._cfg.attack + this._cfg.attackGrowth * lvValue;
        this._attackCd = this._cfg.attackCd / 100;
        this._attStep = 0;
        return true;
    }

    update(dt) {
        if (0 < this._attStep) {
            this._attStep -= dt;
        }
    }

    runCD() {
        this._attStep = this._attackCd;
    }

    isReady(): boolean {
        return 0 >= this._attStep && -1 != this._attStep;
    }

    isSpecialCdt(): boolean {
        return ConditionType.None != this._cfg.condition;
    }

    isInAttDis(leaderDis: number): boolean {
        return ConditionType.None == this._cfg.condition && (0 == this._cfg.distance || leaderDis <= this._cfg.distance);
    }
}

// 技能类型
export enum SkillType {
    None = 0,
    Close = 1,      // 近战
    Bottle = 2,     // 汽油瓶
    OStone = 3,     // 单个石块
    TStone = 4,     // 三个石块
    FlyCutter = 5,  // 单个飞刀
    Venom = 6,      // 口水毒液
    PoolVenom = 7,  // 一滩毒液
    Detonate = 8,   // 自爆
    Split = 9,      // 分裂
}

// 触发条件类型
export enum ConditionType {
    None = 1,   // 无条件
    Death = 2,  // 死亡后触发
}