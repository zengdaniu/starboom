import Actor, { ActorState } from "./Actor";
import { Cmn } from "../../../frame/Cmn";
import { Res } from "../../../frame/Res";
import Buff from "./Buff";
import Enemy from "./Enemy";
import MixedUtils from "../../../utils/MixedUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export abstract default class Bullet extends Actor {

    protected _speed: number = 0;
    protected _dir: cc.Vec2 = null;
    protected _attVal: number = 0;
    protected _type: BulletType;
    protected _headVal: number = 0;
    protected _critVal: number = 0;
    protected _ejtRange: number = 0;
    protected _leftEJTNum: number = 0;
    protected _hitIdList: number[] = [];
    protected _ejtTarget: Enemy = null;

    get type(): BulletType { return this._type; }
    get attVal(): number { return this._attVal; }
    get headVal(): number { return this._headVal; }
    get critVal(): number { return this._critVal; }
    get ejtRange(): number { return this._ejtRange; }

    setData(type: BulletType, pos: cc.Vec2, angle: number, dir: cc.Vec2, speed: number, attVal: number, headVal: number, critVal: number, ejection: Buff) {
        super.init();
        this.show();
        this._type = type;
        this.node.setPosition(pos);
        this.node.angle = angle;
        this._dir = dir;
        this._speed = speed * 60;
        this._attVal = attVal;
        this._headVal = headVal;
        this._critVal = critVal;
        if (null != ejection) {
            this._leftEJTNum = ejection.value;
            this._ejtRange = ejection.range;
        } else {
            this._leftEJTNum = 0;
            this._ejtRange = 0;
        }
        this._hitIdList = [];
        this._ejtTarget = null;
        this.setState(ActorState.Run);
        this._yLimit += 20;
        this._xLimit += 20;
        this.onValid();
    }
    abstract hitEnemy(enemy: Enemy):boolean ;
    abstract onValid();
    death() {
        this._leftEJTNum = 0;
        this._ejtRange = 0;
        this._hitIdList = [];
        this._ejtTarget = null;
        super.death();
    }

    isHit(id: number) {
        this._hitIdList.forEach(e => {
            if (id == e) {
                return true;
            }
        });
        return false;
    }
    abstract checkEnd() ;
    // checkEnd() {
    //     if (ActorState.Run != this._state) return;
    //     if (this.node.x < -this._xLimit || this.node.x > this._xLimit || this.node.y < -this._yLimit || this.node.y > this._yLimit) {
    //         this.death();
    //     }
    // }
}

export enum BulletType {
    // 主角
    GunNormal_1 = 1,
    GunNormal_2 = 2,
    GunNormal_3 = 3,
    // 敌人
    Rock = 10,
}
