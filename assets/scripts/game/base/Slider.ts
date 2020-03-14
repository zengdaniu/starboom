const { ccclass, property } = cc._decorator;

@ccclass
export class Slider extends cc.Component {

    @property(cc.Button)
    btn: cc.Button = null;
    @property(cc.Node)
    box: cc.Node = null;
    @property(cc.Node)
    slide: cc.Node = null;
    @property(Number)
    startPos: number = 0;
    @property(Number)
    endPos: number = 0;

    private _default: boolean = true;// 默认初始状态为true

    /** 滑块移动 */
    move() {
        this._default = !this._default;
        this.slide.runAction(cc.moveTo(0.1, this._default ? this.startPos : this.endPos, 0));
        return this._default;
    }
}