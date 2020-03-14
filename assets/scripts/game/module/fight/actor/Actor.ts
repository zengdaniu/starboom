import { Cmn } from "../../../frame/Cmn";
import ActorMgr from "./ActorMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Actor extends cc.Component {

    @property(cc.Node)
    box: cc.Node = null;

    protected readonly _dirVec2: cc.Vec2 = cc.v2(1, 0);
    protected _state: ActorState;
    protected _rect: cc.Rect = new cc.Rect(0, 0, 0, 0);
    protected _actorMgr: ActorMgr = null;
    protected _moveSpeed: number = 0;
    protected _curDirId: number = 0;
    protected _curAngle: number = -1;
    protected _curDir: cc.Vec2 = cc.v2(0, 1);
    protected _boxOffsetX: number = 0;
    protected _boxOffsetY: number = 0;
    protected _yLimit: number = 610;
    protected _xLimit: number = 220;

    get rect(): cc.Rect {
        this._rect.x = this.node.x - this._boxOffsetX;
        this._rect.y = this.node.y - this._boxOffsetY;

        return this._rect;
    }

    init() {
        this._actorMgr = this.node.parent.getComponent(ActorMgr);
        this._state = ActorState.Hide;
        if (null != this.box) {
            this._rect.width = this.box.width;
            this._rect.height = this.box.height;
            this._boxOffsetY = this.box.y;
            this._boxOffsetX = this.box.width / 2;
            this.box.active = Cmn.debug;
        }
        this._yLimit = Cmn.ui.yLimit;
    }

    setBoxSize(w: number, h: number) {
        this.box.width = w * 0.8;
        this.box.height = h *0.8;
        this._rect.width =this.box.width;
        this._rect.height = this.box.height;
        this._boxOffsetY = this.box.height /2;
        this._boxOffsetX = this.box.width / 2;
    }

    // lateUpdate() {
    //     this._rect.x = this.node.x;
    //     this._rect.y = this.node.y;
    // }

    setScale(scale: number) {
        this.node.setScale(scale);
        this._boxOffsetX *= scale;
        this._boxOffsetY *= scale;
        this._rect.width *= scale;
        this._rect.height *= scale;
    }

    setState(newState: ActorState) {
        if (newState == this._state) return;
        switch (newState) {
            case ActorState.End:
                this.node.stopAllActions();
                break;
            case ActorState.Hide:
                this.node.setPosition(-800, -700);
                this.node.active = false;
                break;
        }
        this._state = newState;
    }

    hide() {
        this.setState(ActorState.Hide);
    }

    show() {
        this.node.active = true;
    }

    isEnd() {
        return ActorState.End == this._state;
    }

    isLive() {
        return ActorState.Hide != this._state && ActorState.End != this._state;
    }

    isJump() {
        return ActorState.Jump == this._state;
    }

    canBeAtt() {
        return this.isLive() ;
    }

    death() {
        this.setState(ActorState.End);
    }

    protected setAngle(angle: number) {
        if (angle == this._curAngle) return;
        this._curAngle = angle;
        let a: number = (360 - angle) % 360;
        let dirId: number = this.getDirIdByAngle(a);
        if (dirId == this._curDirId) return;
        this._curDirId = dirId;
        this.changeAni();
    }

    protected changeAni() { }

    protected getDirIdByAngle(angle: number): DirType {
        let type: DirType = DirType.Up;
        let a: number = (360 + angle) % 360;
        let difAngle: number = 45;
        if ((337.5 < a && a < 360) || (0 <= a && a <= 22.5)) {
            type = DirType.Up;
        } else if (22.5 < a && a <= 67.5) {
            type = DirType.UpRight;
        } else if (67.5 < a && a <= 112.5) {
            type = DirType.Right;
        } else if (112.5 < a && a <= 157.5) {
            type = DirType.DownRight;
        } else if (157.5 < a && a <= 202.5) {
            type = DirType.Down;
        } else if (202.5 < a && a <= 247.5) {
            type = DirType.DownLeft;
        } else if (247.5 < a && a <= 292.5) {
            type = DirType.Left;
        } else if (292.5 < a && a <= 337.5) {
            type = DirType.UpLeft;
        }
        return type;
    }
}

// 对象状态
export enum ActorState {
    Hide = 0,       // 隐藏
    Wait = 1,       // 等待
    Run = 2,        // 行走
    Att = 3,        // 攻击
    End = 4,        // 结束
    Hard = 5,       // 硬直
    Repel = 6,      // 击退
    Jump = 7,       // 跳跃
    Death = 8,      // 死亡  
}

// 朝向类型
export enum DirType {
    Up = 1,
    UpRight = 2,
    Right = 3,
    DownRight = 4,
    Down = 5,
    DownLeft = 6,
    Left = 7,
    UpLeft = 8,
}