import Leader from "./actor/Leader";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShootCtl extends cc.Component {

    @property(Leader)
    leader: Leader = null;

    onLoad() {
        this.node.on(cc.Node.EventType.TOUCH_START, this.shooting, this);
        this.node.on(cc.Node.EventType.TOUCH_END, this.shootEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_CANCEL, this.shootEnd, this);
        this.node.on(cc.Node.EventType.TOUCH_MOVE, this.shooting, this);
    }

    private shooting(evt: cc.Event.EventTouch) {
        let touchPos:cc.Vec2 = this.node.parent.convertToNodeSpaceAR(evt.getLocation());
        //if(this.leader.rect.contains(touchPos))
        //{
            this.leader.setShootPos(new cc.Vec2(0,1));
        //}
        this.leader.setXDirMove(touchPos.x);      
        // let ver: cc.Vec2 = touchPos.sub(this.leader.pos);
        // let norVer: cc.Vec2 = ver.normalize();
    }

    private shootEnd(evt: cc.Event.EventTouch) {
        this.leader.setShootPos(null);
    }
}
