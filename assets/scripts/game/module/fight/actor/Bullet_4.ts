import Actor, { ActorState } from "./Actor";
import { Cmn } from "../../../frame/Cmn";
import { Res } from "../../../frame/Res";
import Buff from "./Buff";
import Enemy from "./Enemy";
import Bullet from "./Bullet";
import MixedUtils from "../../../utils/MixedUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet_3 extends Bullet {
    private lastBulletId:number = -1;
    onValid(){
        this._leftEJTNum = 1;
        this._ejtTarget=this._actorMgr.getAttTarget();
    }
    update(dt) {
        if (ActorState.Run != this._state) return;
        if (this._leftEJTNum==0) {
            this.death();
            return;
        }
        if(this._ejtTarget==null)
        {
            this._ejtTarget=this._actorMgr.getAttTarget()
        }
        if(this._ejtTarget!=null){
            let pos: cc.Vec2 = new cc.Vec2(this._ejtTarget.node.position.x, this._ejtTarget.node.position.y+30);
            this._dir = pos.sub(this.node.position).normalize();
            this.node.angle = -MixedUtils.vec2ToDegrees(this._dir, this._dirVec2) - 90;
        }
        //this.node.y += this._speed * dt;
        let newPos: cc.Vec2 = this.node.position.add(this._dir.mul(this._speed * dt));
        this.node.setPosition(newPos);
        this.checkEnd();
    }

    hitEnemy(enemy: Enemy): boolean {
        if (null == enemy || this.lastBulletId ==enemy.createId ) return false;
        this.lastBulletId =enemy.createId; 
        // if (null == enemy || this.isHit(enemy.createId)) return false;
        // this._hitIdList.push(enemy.createId);
        // this._leftEJTNum -= 1;
        this.lastBulletId = -1;
        this.death();
        return true;
    }

    checkEnd() {
        if (ActorState.Run != this._state) return;
        if (this.node.x < -this._xLimit || this.node.x > this._xLimit || this.node.y < -this._yLimit || this.node.y > this._yLimit) {
            this.death();
        }
    }
}
