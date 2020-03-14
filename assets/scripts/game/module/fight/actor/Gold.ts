import Actor, { ActorState } from "./Actor";
import DropPlayer from "./DropPlayer";
import { Cmn } from "../../../frame/Cmn";
import { Res } from "../../../frame/Res";
import { GoldCfg } from "../../../cfg/GoldCfg";
import { CfgConstants } from "../../../cfg/CfgConstants";
import Leader from "./Leader";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Gold extends Actor {

    @property(Number)
    aniType: number = 0;
    @property(DropPlayer)
    dropPlayer: DropPlayer = null;
    @property(cc.Node)
    goldLab : cc.Node = null;
    @property(String)
    resName: string = "jinbi";

    private _curIndex:number = 1;
    private _leader:Leader =null;
    public _value :number = 0;
    update(){
        if(!this._leader) return;
        if(this.rect.intersects(this._leader.rect)){
            this._leader.getGold(this);
            this._leader=null;
            this.dropPlayer.stop();
            let self = this;
            let endCall = cc.callFunc(function () {
                self.death();
            })
            this.node.runAction(cc.sequence(cc.moveTo(0.5,this.goldLab.position) ,endCall));
        }
    }
    setData(type: GoldType,leader:Leader ,pos: cc.Vec2,speedX:number,speedY:number) {
        this._curIndex =type;
        this.show();
        this.node.setPosition(pos);
        let cfg:GoldCfg = Cmn.cfg.getCfg(CfgConstants.RES_GOLD,type);
        this._value = cfg.gold;
        this._leader =leader;
        this.dropPlayer.setEndCB(this, this.aniEnd);
        this.dropPlayer.play(speedX,speedY);

        this.setState(ActorState.Run);
        this.setFrame();
    }
    setFrame() {
        let path: string = "";
        path = Res.PATH_FIGHT_EFF + this.resName + "/" + "Sales_" + this._curIndex;
        Cmn.res.setSprite(path, this.node.getComponent(cc.Sprite));
    }
    death() {
        this.node.stopAllActions();
        super.death();
    }

    private aniEnd() {
        null != this.dropPlayer && this.dropPlayer.setEndCB(null, null);
        this.death();
    }
}

// 金币类型
export enum GoldType {
    Purple = 1,      // 紫色
    Gold = 2,      // 金色
    Blue = 3,    // 蓝色
    Pink = 4,       // 粉色
    Red = 5,       // 红色
}

// 对象状态
export enum FrameAniType {
    Spine = 0,       // 骨骼动画
    Frame = 1,      // 帧动画
}
