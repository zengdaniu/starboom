import Actor, { ActorState } from "./Actor";
import { Cmn } from "../../../frame/Cmn";
import { Res } from "../../../frame/Res";
import Leader from "./Leader";

const { ccclass, property } = cc._decorator;

@ccclass
export default class BuffItem extends Actor {

    @property(cc.Sprite)
    sprite: cc.Sprite = null;

    private readonly _waitTime:number = 1.5;

    private _itemId: number = 0;
    private _leader: Leader = null;
    private _leaderDir: cc.Vec2 = null;
    private _waitCD:number = 0;   

    get id(): number { return this._itemId; }

    onEnable(){
        this._moveSpeed = 1000;
        this._state = ActorState.Hide;
        this._waitCD = 0;
    }

    onDisable(){
        this._leader = null;
        this._leaderDir = null;
        this._moveSpeed = 0;
        this._waitCD = 0;
    }

    setData(id: number, pos: cc.Vec2, icon: string, leader:Leader) {
        super.init();
        this.show();
        this._leader =leader;
        this._itemId = id;
        this.node.setPosition(pos);
        Cmn.res.setSprite(Res.PATH_ACTOR + icon, this.sprite);
        this.setState(ActorState.Wait);
    }

    update(dt){
        switch (this._state) {
            case ActorState.Wait:
                this._waitCD -= dt;
                if (0 >= this._waitCD) {
                    this._waitCD = 0;
                    this.setState(ActorState.Run);
                }
                break;
            case ActorState.Run:
                    if (null == this._leader) return;
                    let newPos: cc.Vec2 = this.node.position.add(this._leaderDir.mul(this._moveSpeed * dt));
                    this.node.setPosition(newPos);
                break;
        }
    }

    setState(newState:ActorState){
        if (newState == this._state) return;
        
        switch (newState) {
            case ActorState.Wait:
                this._waitCD = this._waitTime;
                break;
            case ActorState.Run:
                this._leaderDir = this._leader.node.position.sub(this.node.position).normalize();
                break;
            default:
                super.setState(newState);
                return;
        }
        this._state = newState;
    }
}

// buff类型
export enum BuffType {
    AddHp = 1,          // 加血
    Invincible = 2,     // 无敌
    AttUp = 3,          // 增加伤害
    AttSpeedUp = 4,     // 增加攻速
    SpeedUp = 5,        // 增加移速
    Bombing = 6,        // 飞机轰炸
    Ejection = 7,       // 弹射
    Penetrate = 8,      // 穿透
    Shotgun = 9,        // 散弹
}
