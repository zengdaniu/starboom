import Actor, { ActorState } from "./Actor";
import { Cmn } from "../../../frame/Cmn";
import { Res } from "../../../frame/Res";
import Buff from "./Buff";
import Enemy from "./Enemy";
import Bullet from "./Bullet";
import MixedUtils from "../../../utils/MixedUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Bullet_2 extends Bullet {
    private lastBulletId:number = -1;
    onValid(){}
    update(dt) {
        if (ActorState.Run != this._state) return;
        let newPos: cc.Vec2 = this.node.position.add(this._dir.mul(this._speed * dt));
        this.node.setPosition(newPos);
        this.checkEnd();
    }

    hitEnemy(enemy: Enemy): boolean {
        if (null == enemy || this.lastBulletId ==enemy.createId ) return false;
        this.lastBulletId =enemy.createId;    
        // this._hitIdList.pop();
        // this._hitIdList.push(enemy.createId);
        
        let pos: cc.Vec2 = new cc.Vec2(-enemy.node.position.x, -enemy.node.position.y);
        this._dir = pos.sub(this.node.position).normalize();
        //this.node.angle = -MixedUtils.vec2ToDegrees(this._dir, this._dirVec2) - 90;
        return true;
    }

    checkEnd() {
        if (ActorState.Run != this._state) return;
        if (this.node.x < -this._xLimit || this.node.x > this._xLimit || this.node.y < -this._yLimit || this.node.y > this._yLimit) {
            this.death();
            this.lastBulletId =-1;
        }
    }
}
