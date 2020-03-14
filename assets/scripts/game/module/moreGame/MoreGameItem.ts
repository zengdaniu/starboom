const { ccclass, property } = cc._decorator;

@ccclass
export default class MoreGameItem extends cc.Component {

    @property(cc.Sprite)
    icon: cc.Sprite = null;
    @property(cc.Label)
    nameLabel: cc.Label = null;

    private _data: any = null;

    onDisable() {
        this._data = null;
    }

    onBtnClick() {
        if (null == this._data) return;
        window.platform.jumpProgram(this._data.gamekey);
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
        this.nameLabel.string = data.cname;
        let self = this;
        cc.loader.load(this._data.icon, function (err, texture) {
            let sprite = new cc.SpriteFrame(texture);
            self.icon.spriteFrame = sprite;
        });
    }
}
