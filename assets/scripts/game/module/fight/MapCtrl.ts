import Leader from "./actor/Leader";
import ActorMgr from "./actor/ActorMgr";
import MixedUtils from "../../utils/MixedUtils";
import { Cmn } from "../../frame/Cmn";
import { Res } from "../../frame/Res";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MapCtrl extends cc.Component {


    @property(Number)
    moveSpeed: number = 2;
    @property(Leader)
    leader: Leader = null;
    @property(ActorMgr)
    actorMgr: ActorMgr = null;
    // @property(cc.Sprite)
    // block: cc.Sprite = null;
    @property(cc.Sprite)
    lower: cc.Sprite = null;

    private readonly _maxSpeed: number = 10;
    private readonly _imgHeight: number = 696;
    private readonly _areaIT: number = 720;
    private readonly _maxBlockNum: number = 4;
    private _state: MapState = 0;
    private _moveDis: number = 0;
    private _lBlockList: cc.Sprite[] = [];
    private _rBlockList: cc.Sprite[] = [];
    private _leftBlockY: number = 0;
    private _rightBlockY: number = 0;

    onLoad() {
    }

    onEnable() {
        this.setState(MapState.Normal);
    }

    initMap(mapName: string) {
        if (0 >= mapName.length) return;
        Cmn.res.setSprite(Res.PATH_MAP +mapName, this.lower);
    }

    lateUpdate() {
        return;
    }

    reset(mapName: string) {
        this.initMap(mapName);
        return;
    }

    isReachNext() {
        return true;
        //return this._areaIT <= this._moveDis;
    }

    setState(newState: MapState) {
        if (newState == this._state) return;
        switch (newState) {
            case MapState.Reset:
            case MapState.Normal:
                this._moveDis = 0;
                break;
        }
        this._state = newState;
    }

    cleanBlock() {
        this._lBlockList.forEach(e => { e.node.removeFromParent(); });
        this._lBlockList = [];
        this._rBlockList.forEach(e => { e.node.removeFromParent(); });
        this._rBlockList = [];
    }

    private move(speed: number, isMove: boolean = true) {
        return;
    }

    private setSprite(sprite: cc.Sprite) {
        let name: string = "wu0" + MixedUtils.randomFrom(1, 8);
        Cmn.res.setSprite(Res.PATH_MAP + name, sprite);
    }
}


// 地图状态
export enum MapState {
    Normal = 0,     // 普通
    Lock = 1,       // 锁定
    Reset = 2,      // 复位
}
