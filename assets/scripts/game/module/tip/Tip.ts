import { TipItem, TipsType } from "./TipItem";

const { ccclass, property } = cc._decorator;

@ccclass
export class Tip extends cc.Component {

    @property(cc.Node)
    tipNode: cc.Node = null;
    @property(TipItem)
    tipItem: TipItem = null;

    private _lblArr: any[] = [];
    private _isNext: boolean = true;

    private static _instance: Tip;
    static get instance(): Tip {
        if (!this._instance) {
            this._instance = new Tip;
        }
        return this._instance;
    }

    onEnable() {

    }

    update() {
        if (0 == this._lblArr.length || 5 <= this.tipNode.childrenCount) return;
        this.addItem();
    }

    onDisable() {
        this._lblArr = [];
        this.clean();
    }

    get lblArr() {
        return this._lblArr;
    }

    set lblArr(value: any[]) {
        this._lblArr = value;
    }

    pushLblArr(value: string, type: TipsType = TipsType.TXT) {
        this._lblArr.push({ str: value, type: type });
    }

    addItem() {
        let node: cc.Node = cc.instantiate(this.tipItem.node);
        let comp: TipItem = node.getComponent(TipItem);
        if (!node || !comp) return;
        comp.setData(this._lblArr.shift());
        node.active = true;
        node.setPosition(new cc.Vec2(0, 0));
        this.tipNode.addChild(node);
        let ani: cc.Animation = node.getComponent(cc.Animation);
        let clip: cc.AnimationClip[] = ani.getClips();
        ani.play(clip[0].name);
        let self = this;
        this._isNext = false;
        ani.next = function () {
            self._isNext = true;
        }
        ani.end = function () {
            let count: number = self.tipNode.childrenCount;
            if (node == self.tipNode.children[count - 1]) {
                self.clean();
            }
        }
    }

    clean() {
        let child: cc.Node[] = this.tipNode.children;
        child.forEach(ele => {
            ele.removeFromParent();
            ele.parent = null;
        });
        this.tipNode.removeAllChildren();
    }
}