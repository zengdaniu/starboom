import Actor, { ActorState } from "./Actor";
import FramePlayer from "./FramePlayer";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Effect extends Actor {

    @property(Number)
    aniType: number = 0;
    @property(sp.Skeleton)
    sp: sp.Skeleton = null;
    @property(FramePlayer)
    framePlayer: FramePlayer = null;

    private _enemyId: number = 0;
    private _enemyLv: number = 0;

    setData(type: EffectType, pos: cc.Vec2, enemyId: number, enemyLv: number) {
        this.show();
        this.node.setPosition(pos);
        if (FrameAniType.Spine == this.aniType) {
            let aniNam: string = "";
            switch (type) {
                case EffectType.ChuXian:
                    this._enemyId = enemyId;
                    this._enemyLv = enemyLv;
                    let self = this;
                    let endCall = cc.callFunc(function () {
                        self.node.stopAllActions();
                        self._actorMgr.addEnemy(self._enemyId, self.node.position, self._enemyLv);
                    })
                    this.node.runAction(cc.sequence(cc.delayTime(1.4), endCall));
                    aniNam = "chuxian";
                    break;
                case EffectType.Hit:
                    aniNam = "dazhong";
                    break;
                case EffectType.Death:
                    aniNam = "siwang";
                    break;
            }
            if (0 == aniNam.length) {
                let a = 0;
            }
            this.sp.setCompleteListener(this.aniEnd.bind(this));
            this.sp.setAnimation(0, aniNam, false);
        } else if (FrameAniType.Frame == this.aniType) {
            this.framePlayer.setEndCB(this, this.aniEnd);
            this.framePlayer.play();
        }

        this.setState(ActorState.Run);
    }

    death() {
        this._enemyId = 0;
        this._enemyLv = 0;
        this.node.stopAllActions();
        super.death();
    }

    private aniEnd() {
        null != this.sp && this.sp.setCompleteListener(null);
        null != this.framePlayer && this.framePlayer.setEndCB(null, null);
        this.death();
    }
}

// 特效类型
export enum EffectType {
    Hit = 1,        // 命中
    Death = 2,      // 死亡
    ChuXian = 3,    // 出现
    gold = 4,       // 金币
    bomb = 5,       // 爆开
}

// 对象状态
export enum FrameAniType {
    Spine = 0,       // 骨骼动画
    Frame = 1,      // 帧动画
}
