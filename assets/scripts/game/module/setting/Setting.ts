import { Win } from "../Win";
import { Slider } from "../../base/Slider";

const { ccclass, property } = cc._decorator;

@ccclass
export class Setting extends Win {

    @property(Slider)
    music: Slider = null;
    @property(Slider)
    vibrate: Slider = null;

    onEnable() {
        super.onEnable();
    }

    private onBtnClick(event: cc.Event.EventTouch, customEventData: string) {
        let name: string = customEventData;
        // todo 接入音乐和震动开关
        switch (name) {
            case "music":
                if (this.music.move()) {
                    cc.log("开启音乐");
                } else {
                    cc.log("关闭音乐");
                }
                break;
            case "vibrate":
                if (this.vibrate.move()) {
                    cc.log("开启震动");
                } else {
                    cc.log("关闭震动");
                }
                break;
        }
    }
}