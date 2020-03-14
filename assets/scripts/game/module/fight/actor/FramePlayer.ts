import { Cmn } from "../../../frame/Cmn";
import { Res } from "../../../frame/Res";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FramePlayer extends cc.Component {

    @property(Boolean)
    playOnLoad: boolean = false;
    @property(cc.Sprite)
    sprite: cc.Sprite = null;
    @property(Number)
    tiemInterval: number = 0.1;
    @property(Number)
    type: number = 0;
    @property(String)
    resName: string = "";
    @property(Number)
    frameNum: number = 0;

    private maxIndex: { [key: string]: number } = { "damage": 3, "walk": 20 };
    private readonly timeIT: { [key: string]: number } = { "damage": 0.03, "walk": 0.03 };
    private _curIndex: number = 1;
    private _timeStep: number = 0;
    private _curAniName: string = "";
    private _curDirId: number = 0;
    private _curMaxIndex: number = 0;
    private _lastIndex: number = 0;
    private _curTimeIT: number = 0;
    private _cbFun: Function = null;
    private _cbObj: any = null;

    onEnable() {
        this._curIndex = 1;
        this._timeStep = 0;
        this.playOnLoad && this.play();
    }

    update(dt) {
        if (FrameType.Enemy == this.type && 0 >= this._curAniName.length) return;
        this._timeStep += dt;
        if (this._timeStep < this._curTimeIT) return;
        this._timeStep -= this._curTimeIT;
        this._curIndex += 1;
        if (this._curIndex > this._curMaxIndex) {
            this._curIndex = 1;
            if (null != this._cbObj && null != this._cbFun) {
                this._cbFun.call(this._cbObj);
            }
        }
        this.setFrame();
    }

    setResName(name:string, damageNum:number, walkNum:number){
        this.resName = name;
        this.maxIndex["damage"] = damageNum;
        this.maxIndex["walk"] = walkNum;
        this._curAniName = "walk";
        this._curIndex = 1;
        this.setFrame();
    }

    setFrame() {
        let path: string = "";
        if (FrameType.Enemy == this.type) {
            path = Res.PATH_FIGHT_ENEMY + this.resName + "/" + this._curAniName + "_" + this._curIndex;
        } else {
            path = Res.PATH_FIGHT_EFF + this.resName + "/" + this.resName + "_" + this._curIndex;
        }

        Cmn.res.setSprite(path, this.sprite);
        this._lastIndex = this._curIndex;
    }

    play(aniName: string = "", dirId: number = 0) {
        if (FrameType.Enemy == this.type) {
            if (aniName == this._curAniName && dirId == this._curDirId) return;
            this._curAniName = aniName;
            this._curDirId = dirId;
            this._curMaxIndex = this.maxIndex[this._curAniName];
            this._curTimeIT = this.timeIT[this._curAniName];
        } else {
            this._curMaxIndex = this.frameNum;
            this._curTimeIT = this.tiemInterval;
        }
        this._timeStep = 0;
        this._curIndex = 1;
        this.setFrame();
    }

    setEndCB(obj: any, fun: Function) {
        this._cbObj = obj;
        this._cbFun = fun;
    }
}


// 对象状态
export enum FrameType {
    Enemy = 0,       // 怪物
    Effect = 1,      // 特效
}