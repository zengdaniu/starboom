import { Cmn } from "../../frame/Cmn";

const { ccclass, property } = cc._decorator;

@ccclass
export class PushBtnCtrl extends cc.Component {

    @property(cc.Sprite)
    imgNode: cc.Sprite = null;

    private _data: any = null;
    private _curIndex: number = 0;
    private _step: number = 15;

    onEnable() {
        this._step = 15;
    }

    update(dt) {
        this._step -= dt;
        if (0 > this._step) {
            this.showNext();
            this._step = 15;
        }
    }

    onBtnClick() {
        if (null == this._data) return;
        window.platform.jumpProgram(this._data.gamekey);
    }

    showNext() {
        let data: any = Cmn.ud.moreGameData;
        if (null == data || null == data.data || 0 >= data.data.length) return;
        ++this._curIndex;
        this._curIndex = this._curIndex % data.data.length;
        this._data = data.data[this._curIndex];
        this.setData(this._data);
    }

    /** @param data {
        name  游戏名
        icon    游戏头像地址
        proxy  游戏渠道
        gameid  游戏渠道ID
        gamekey  游戏渠道key
        gamesecret  游戏渠道secret
        }
     */
    setData(data: any) {
        this._data = data;
        //this.nameLabel.string = data.cname;
        let self = this;
        cc.loader.load(this._data.icon, function (err, texture) {
            let sprite = new cc.SpriteFrame(texture);
            self.imgNode.spriteFrame = sprite;
        });
    }
}