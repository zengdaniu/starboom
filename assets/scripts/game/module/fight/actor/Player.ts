import ActorMgr from "./ActorMgr";
import Buff from "./Buff";
const { ccclass, property } = cc._decorator;
@ccclass
export default abstract class Player extends cc.Component {
    protected _actorMgr: ActorMgr = null;
    setActMgr(actorMgr: ActorMgr){ this._actorMgr = actorMgr ;}
    abstract shootBullet(num :number, pos: cc.Vec2, speed: number, attVal: number,headVal: number, critVal: number, ejection: Buff):any;
    abstract shootEff(start:Boolean):any;
    abstract setXDirMove(move:number):any;
    abstract getBoxSize():any;
    abstract getFirePos():any;
}