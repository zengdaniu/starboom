const { ccclass, property } = cc._decorator;

@ccclass
export class TipItem extends cc.Component {

    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.Label)
    txtLabel: cc.Label = null;

    @property(cc.Node)
    goldNode: cc.Node = null;
    @property(cc.Label)
    goldNum: cc.Label = null;

    private _data: any;

    setData(data: any) {
        if (!data || 0 == data.length) return;
        this._data = data;
        this.txtLabel.node.active = (TipsType.TXT == data.type);
        this.goldNode.active = (TipsType.GOLD == data.type);
        switch (data.type) {
            case TipsType.TXT:
                this.txtLabel.string = data.str;
                break;
            case TipsType.GOLD:
                this.goldNum.string = data.str;
                break;
        }
    }
}

// 提示类型
export enum TipsType {
    TXT = 1,        // 纯文本
    GOLD = 2,       // 获得金币
    DIAMON = 3,      // 获得皇冠
}