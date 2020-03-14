import Actor, { ActorState } from "./Actor";
import { Cmn } from "../../../frame/Cmn";
import { Res } from "../../../frame/Res";
import Buff from "./Buff";
import Enemy from "./Enemy";
import Bullet from "./Bullet";
import MixedUtils from "../../../utils/MixedUtils";
import { EffectType } from "./Effect";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet_1 extends Bullet {
    private lastBulletId:number = -1;
    onValid(){}
    update(dt) {
        if (ActorState.Run != this._state) return;
        if (null != this._ejtTarget && !this._ejtTarget.isLive()) {
            this.death();
            return;
        }
        //this.node.y += this._speed * dt;
        let newPos: cc.Vec2 = this.node.position.add(this._dir.mul(this._speed * dt));
        this.node.setPosition(newPos);
        this.checkEnd();
    }

    hitEnemy(enemy: Enemy): boolean {
        if (null == enemy || this.lastBulletId ==enemy.createId ) return false;
        this.lastBulletId =enemy.createId;    
        //if (null == enemy || this.isHit(enemy.createId)) return false;
        // this._hitIdList.push(enemy.createId);
        // if (0 < this._leftEJTNum) {
        //     this._ejtTarget = this._actorMgr.getEjectionTarget(this);
        //     if (null == this._ejtTarget) {
        //         this.death();
        //     } else {
        //         let pos: cc.Vec2 = new cc.Vec2(this._ejtTarget.node.position.x, this._ejtTarget.node.position.y + 30);
        //         this._dir = pos.sub(this.node.position).normalize();
        //         this.node.angle = -MixedUtils.vec2ToDegrees(this._dir, this._dirVec2) - 90;
        //         this._leftEJTNum -= 1;
        //     }
        // } else {
            this._actorMgr.addEffect(EffectType.Hit, this.node.position);
            this.lastBulletId = -1;
            this.death();
        //}
        return true;
    }

    checkEnd() {
        if (ActorState.Run != this._state) return;
        if (this.node.x < -this._xLimit || this.node.x > this._xLimit || this.node.y < -this._yLimit || this.node.y > this._yLimit) {
            this.death();
        }
    }
}
