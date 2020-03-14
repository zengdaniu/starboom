import { Win } from "../Win";
import MoreGameItem from "./MoreGameItem";
import { Cmn } from "../../frame/Cmn";
import { TipsType } from "../tip/TipItem";

const { ccclass, property } = cc._decorator;

@ccclass
export class MoreGame extends Win {

    @property([MoreGameItem])
    itemList: MoreGameItem[] = [];

    onEnable() {
        super.onEnable();
        //window.platform.getGameInfo(this.getGameSCB, this.getGameECB, this);
        this.getGameSCB(Cmn.ud.moreGameData);
    }

    /** 成功回调数据结构
     * {code:200, data:Array(1), message:"",status(是否显示该功能)}
     *  data:Array(1):{
        name  游戏名
        icon    游戏头像地址
        proxy  游戏渠道
        gameid  游戏渠道ID
        gamekey  游戏渠道key
        gamesecret  游戏渠道secret
        }
    */

    private getGameSCB(data: any) {
        for (let i = 0; i < this.itemList.length; ++i) {
            this.itemList[i].node.active = i < data.data.length;
            if (this.itemList[i].node.active) {
                this.itemList[i].setData(data.data[i]);
            }
        }
    }

    private getGameECB() {
        Cmn.ui.tip.pushLblArr("拉取推荐数据失败！", TipsType.TXT);
    }
}