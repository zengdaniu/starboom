import { PointCfg } from "../../../cfg/PointCfg";
import { CfgConstants } from "../../../cfg/CfgConstants";
import { ZoneCfg } from "../../../cfg/ZoneCfg";
import { MonsterPoolCfg } from "../../../cfg/MonsterPoolCfg";
import ActorMgr from "../actor/ActorMgr";
import MixedUtils, { MinAndMax } from "../../../utils/MixedUtils";
import { Cmn } from "../../../frame/Cmn";
import { EffectType } from "../actor/Effect";

const { ccclass, property } = cc._decorator;

@ccclass
export default class EnemyPoint {

    private _actorMgr: ActorMgr = null

    private _times: number = 0;
    private _coolCd: number = 0;
    private _interval: number = 0;
    private _timeStep: number = 0;
    private _onceNum: number = 0;
    // private _xArea: MinAndMax = new MinAndMax();
    //private _yArea: MinAndMax = new MinAndMax();
    private _zoneArr: ZoneMsg[] = [];
    private _enemyIdArr: number[] = [];
    private _lvValue: number = 1;

    init(actorMgr: ActorMgr, pointId: number, poolId: number, lvValue: number): boolean {
        let pointCfg: PointCfg = Cmn.cfg.getCfg(CfgConstants.RES_POINT, pointId);
        if (null == pointCfg) return false;

        let poolCfg: MonsterPoolCfg = Cmn.cfg.getCfg(CfgConstants.RES_MONSTERPOOL, poolId);
        if (null == poolCfg) return false;

        this._actorMgr = actorMgr;
        this._lvValue = lvValue;

        this._times = pointCfg.times;
        this._coolCd = pointCfg.coolCd;
        this._interval = pointCfg.interval;
        this._onceNum = pointCfg.num;
        this._timeStep = 0;

        let zoneMsg: ZoneMsg = null;
        let xMin: number = 0;
        let yMin: number = 0;
        let zCfg: ZoneCfg = null;
        for (let i = 0; i < pointCfg.zoneId.length; i++) {
            zCfg = Cmn.cfg.getCfg(CfgConstants.RES_ZONE, pointCfg.zoneId[i]);
            if (null == zCfg) continue;
            xMin = Number(zCfg.coordinate[0]);
            yMin = Number(zCfg.coordinate[1]);
            zoneMsg = new ZoneMsg(xMin, xMin + zCfg.size[0], yMin, yMin + (0 < yMin ? zCfg.size[1] : -zCfg.size[1]), !(1 == zCfg.id || 2 == zCfg.id));
            this._zoneArr.push(zoneMsg);
        }
        this._enemyIdArr = poolCfg.monsterId;

        return true;
    }

    update(dt) {
        if (this.isEnd()) return;
        if (0 < this._coolCd) {
            this._coolCd -= dt;
            if (0 < this._coolCd) return;
        }

        this._timeStep -= dt;
        if (0 >= this._timeStep) {
            // 单批次出怪
            let pos: cc.Vec2 = null;
            let enemyId: number = 0;
            for (let i = 0; i < this._onceNum; ++i) {
                for (let j = 0; j < this._zoneArr.length; ++j) {
                    pos = new cc.Vec2(this._zoneArr[j].xArea.random, this._zoneArr[j].yArea.random);
                    enemyId = this._enemyIdArr[MixedUtils.randomFrom(0, this._enemyIdArr.length - 1)];
                    // if (Cmn.ui.yLimit > pos.y && -Cmn.ui.yLimit < pos.y) {
                    //     this._actorMgr.addEffect(EffectType.ChuXian, pos, enemyId, this._lvValue);
                    // } else {
                        
                    //}
                }
            }
            this._times -= 1;
            if (!this.isEnd()) {
                this._timeStep = this._interval;
            }
        }
    }

    isEnd(): boolean {
        return 0 >= this._times;
    }
}

export class ZoneMsg {
    xArea: MinAndMax = new MinAndMax();
    yArea: MinAndMax = new MinAndMax();
    isInScreen: boolean = false;

    constructor(xMin: number, xMax: number, yMin: number, yMax: number, inScreen: boolean) {
        this.xArea.min = xMin;
        this.xArea.max = xMax;
        this.yArea.min = yMin;
        this.yArea.max = yMax;
        this.isInScreen = inScreen;
        if (!inScreen) {
            let aa = 0;
        }
    }
}
