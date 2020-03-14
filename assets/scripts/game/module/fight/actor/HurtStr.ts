import Actor, { ActorState } from "./Actor";
import { RoleCfg } from "../../../cfg/RoleCfg";
import { Cmn } from "../../../frame/Cmn";
import { CfgConstants } from "../../../cfg/CfgConstants";

const { ccclass, property } = cc._decorator;

@ccclass
export default class HurtStr extends Actor {

    @property(cc.Label)
    label: cc.Label = null;
    @property(cc.Animation)
    animation: cc.Animation = null;

    private _baseScale: number = 1.8;
    private _moveDis: number = 40;
    private _aniTime: number = 40;

    onLoad() {
        // let self = this;
        // this.animation.onFinish = function () {
        //     self.animation.stop();
        //     self.death();
        //     self.node.stopAllActions();
        // }.bind(this);
        let cfg: RoleCfg = Cmn.cfg.getCfg(CfgConstants.RES_ROLE, 1);
        if (null != cfg) {
            this._moveDis = cfg.hurtDistance;
            this._aniTime = cfg.hurtTime / 100;
        }
    }

    onDisable() {
        this.animation.stop();
        this.node.stopAllActions();
    }

    setData(pos: cc.Vec2, str: string, z: number, isCrit: boolean) {
        this.show();
        this.node.setPosition(pos);
        this.node.zIndex = z;
        this.label.string = str;
        // this.animation.stop();
        // this.animation.play();
        // this.node.stopAllActions();
        // this.node.runAction(cc.moveTo(0.84, this.node.x, this.node.y + this._moveDis));
        this.node.stopAllActions();
        this.node.setScale(1);
        this.node.opacity = 255;
        let self = this;
        let endCall = cc.callFunc(function () {
            self.node.stopAllActions();
            self.hide();
        })
        this.node.runAction(cc.spawn(
            cc.moveTo(this._aniTime, this.node.x, this.node.y + this._moveDis),
            cc.sequence(cc.scaleTo(0.1, 1.2 * this._baseScale * (isCrit ? 2 : 1)), cc.scaleTo(0.05, 1 * this._baseScale * (isCrit ? 2 : 1)),
                cc.delayTime(this._aniTime - 0.25), cc.fadeOut(0.1), endCall
            )));
        this.setState(ActorState.Run);
    }

}
