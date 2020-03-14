import { Mod } from "./Mod";
import { Cmn } from "../frame/Cmn";

const { ccclass, property } = cc._decorator;

@ccclass
export class Win extends Mod {

    @property(cc.Button)
    closeButton: cc.Button = null; //返回按钮——引导用
    @property(Boolean)
    clickToClose: boolean = true;
    @property(Boolean)
    openEffect: boolean = true;//是否启用开启窗口动画，默认开启
    @property(Boolean)
    isMask: boolean = true;  //是否使用遮罩，默认开启
    @property({ type: cc.Integer, range: [0, 255, 1] })
    alpha: number = 200;
    @property(Boolean)
    isSubWindow: boolean = true;    //是否是子窗口
    @property(Boolean)
    outside: boolean = false;    //是否点击外面，关闭窗口
    mask: cc.Node = null;
    @property(Boolean)
    ignoreautoWindow: boolean = false;    //是否无视掉自动弹窗

    private _recoverFlag: boolean = false;

    init() {
        this.isWindow = true;
    }

    onEnable() {
        if (this.closeButton) {
            this.closeButton.node.on("click", this.closeWindow, this);
        }
        if (this.outside) {
            this.node.parent.on(cc.Node.EventType.TOUCH_END, this.touchend, this);
        }
        Cmn.ui.setWindowDarkOpacity(this.alpha);
    }

    onDisable() {
        //引导的时候closeButton会变为returnBtn，会导致触发returnBtn和closeButton的回调
        if (this.closeButton) {
            this.closeButton.node.off("click", this.closeWindow, this);
        }
        if (this.outside) {
            this.node.parent.off(cc.Node.EventType.TOUCH_END, this.touchend, this);
        }
    }

    closeWindow() {
        Cmn.ui.closeWindow(this);
    }

    touchend(event: cc.Event.EventTouch) {
        let viewPos = this.node.convertTouchToNodeSpaceAR(event.touch);
        //if (!cc.rectContainsPoint(this.node.getBoundingBox(), nodepoint)) {
        if (!this.node.getBoundingBox().contains(viewPos)) {
            this.closeWindow();
        }
    }

    set recoverFlag(recover: boolean) {
        this._recoverFlag = recover;
    }

    get recoverFlag() {
        return this._recoverFlag;
    }
}