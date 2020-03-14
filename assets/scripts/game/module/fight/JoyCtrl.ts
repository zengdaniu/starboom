import Leader from "./actor/Leader";
import MixedUtils from "../../utils/MixedUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class JoyCtrl extends cc.Component {

    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Node)
    touch: cc.Node = null;
    @property(cc.Node)
    showNode: cc.Node = null;
    @property(Leader)
    leader: Leader = null;
    @property(cc.Node)
    dirNode: cc.Node = null;

    protected readonly dirVec2: cc.Vec2 = cc.v2(1, 0);
    protected readonly waitPos: cc.Vec2 = cc.v2(360, 250);
    private readonly radius: number = 80;
    private startPos: cc.Vec2 = null;
    private touchPos: cc.Vec2 = null;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
    }

    onEnable() {
        this.showNode.active = false;
        this.leader.setMoveDir(null);
        //this.wait();
    }

    private onTouchStart(evt: cc.Event.EventTouch) {
        this.showNode.active = true;
        this.startPos = this.bg.parent.convertToNodeSpaceAR(evt.getLocation());
        this.bg.setPosition(this.startPos);
        this.touchPos = this.startPos;
        this.touch.setPosition(this.touchPos);
        this.leader.setMoveDir(null);
    }

    private onTouchEnd(evt: cc.Event.EventTouch) {
        this.showNode.active = false;
        this.leader.setMoveDir(null);
        //this.wait();
    }

    private onTouchMove(evt: cc.Event.EventTouch) {
        this.touchPos = this.bg.parent.convertToNodeSpaceAR(evt.getLocation());
        let ver: cc.Vec2 = this.touchPos.sub(this.startPos);
        let norVer: cc.Vec2 = ver.normalize();
        let dis: number = ver.mag();
        if (this.radius < dis) {
            ver = norVer.mul(this.radius);
            this.touchPos = this.startPos.add(ver);
        }
        this.touch.setPosition(this.touchPos);
        this.leader.setMoveDir(norVer, ver.mag());
        this.dirNode.angle = -MixedUtils.vec2ToDegrees(norVer, this.dirVec2) - 90;
    }

    private wait() {
        this.bg.setPosition(this.waitPos);
        this.touch.setPosition(this.waitPos);
        this.dirNode.angle = 0;
    }
}
