import { Win } from "../Win";
import { Cmn } from "../../frame/Cmn";
import { UserDataKey } from "../../frame/UserData";


const { ccclass, property } = cc._decorator;

@ccclass
export class Guide extends Win {

    @property([cc.Node])
    msgList: cc.Node[] = [];

    onEnable() {
        let step: number = Cmn.ud.userDB.guideStep;
        if (step >= this.msgList.length) {
            this.closeWindow();
        }
        for (let i = 0; i < this.msgList.length; ++i) {
            this.msgList[i].active = (step == i);
        }

        cc.director.pause();
    }

    onCloseBtnClick() {
        Cmn.ud.userDB.guideStep += 1;
        Cmn.ud.saveLocalSolt(UserDataKey.GUIDESTEP);
        cc.director.resume();
        super.closeWindow();
    }
}