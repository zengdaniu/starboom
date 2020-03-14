const { ccclass, property } = cc._decorator;

@ccclass
export class SportUtils extends cc.Component {

    /**
     * 主界面关卡动画运动库
     * @param node 节点
     * @param delay 延时
     */
    static chapterNomalSport(node: cc.Node, delay: number = 0) {
        node.active = true;
        node.scale = "now" == node.name ? 0.6 : 0.3;
        node.opacity = 0;
        let seq = cc.sequence(
            cc.delayTime(delay),
            cc.spawn(
                cc.scaleTo(0.3, 1.1, 1.1),
                cc.fadeIn(0.3)
            ),
            cc.scaleTo(0.3, 1, 1),
        );
        node.runAction(seq);
    }

    /**
     * 主界面关卡选择动画运动库
     * @param node 节点
     * @param delay 延时
     */
    static chapterChooseSport(node: cc.Node, delay: number = 0) {
        node.active = true;
        node.scale = .3;
        node.opacity = 0;
        let seq = cc.sequence(
            cc.delayTime(delay),
            cc.spawn(
                cc.scaleTo(0.3, 1.1, 1.1),
                cc.fadeIn(0.3)
            ),
            cc.scaleTo(0.3, 1, 1)
        );
        node.runAction(seq);
    }
}