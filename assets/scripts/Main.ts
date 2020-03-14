import { Cmn } from "./game/frame/Cmn";
import { Res } from "./game/frame/Res";
import { Cfg } from "./game/frame/Cfg";
import { UIMgr } from "./game/frame/UIMgr";
import { UserData } from "./game/frame/UserData";
import { Platform } from "./game/pt/Platform";
import { Calc } from "./game/frame/Calc";
import { AudioMgr } from "./game/frame/AudioMgr";

const { ccclass, property } = cc._decorator;

@ccclass
export class Main extends cc.Component {

    @property(cc.Node)
    gameNode: cc.Node = null;

    onLoad() {
        Cmn.res = Res.instance;
        Cmn.cfg = Cfg.instance;
        Cmn.ui = UIMgr.instance;
        Cmn.ud = UserData.instance;
        Cmn.pf = Platform.instance;
        Cmn.calc = Calc.instance;
        Cmn.audio = AudioMgr.instance;
        this.fitView();
    }

    update(dt) {
        //Cmn.ud.update(dt);
    }

    /** 适配屏幕 */
    private fitView() {
        let viewH = cc.view.getFrameSize().height;
        let viewW = cc.view.getFrameSize().width;
        let scaleH: number = viewH / 1280;
        let scaleW: number = viewW / 720;
        let scale: number = 1 / scaleW * (scaleH > scaleW ? scaleW : scaleH);
        this.gameNode.setScale(scale);
        scale = (scaleH > scaleW ? scaleW : scaleH);
        Cmn.ui.setXYLimit(viewW / 2, (1 > scaleH ? viewH / 2 / scale : viewH));
    }

    /** 切换到后台 */
    private enterBackground(e: cc.Event.EventCustom) {
        cc.game.off(cc.game.EVENT_HIDE, this.enterBackground, this);
        cc.game.on(cc.game.EVENT_SHOW, this.enterForeground, this);// 监听游戏切换到前台
    }

    /** 恢复到前台 */
    private enterForeground(e: cc.Event.EventCustom) {
        cc.game.off(cc.game.EVENT_SHOW, this.enterForeground, this);
        cc.game.on(cc.game.EVENT_HIDE, this.enterBackground, this);// 监听游戏切换到后台
    }
}