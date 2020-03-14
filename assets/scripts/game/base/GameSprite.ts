const { ccclass, property } = cc._decorator;

@ccclass
export class GameSprite extends cc.Component {
    show() {
        if (!this.node.active) this.node.active = true;
    }

    hide() {
        if (this.node.active) this.node.active = false;
    }
}