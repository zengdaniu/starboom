import { UserDB } from "../../frame/UserData";
import { Cmn } from "../../frame/Cmn";
import { MixedUtils } from "../../utils/MixedUtils";
import { SportUtils } from "../../utils/SportUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export class ChapterNomal extends cc.Component {

    // 上一关
    @property(cc.Node)
    prev: cc.Node = null;
    @property(cc.Label)
    prevLbl: cc.Label = null;
    // 当前关
    @property(cc.Node)
    now: cc.Node = null;
    @property(cc.Label)
    nowLbl: cc.Label = null;
    // 下一关
    @property(cc.Node)
    next: cc.Node = null;
    @property(cc.Label)
    nextLbl: cc.Label = null;
    // 其他节点
    @property(cc.Node)
    left: cc.Node = null;
    @property(cc.Node)
    right: cc.Node = null;

    private _userDB: UserDB;
    private _nodeArr: cc.Node[] = [];
    private _lblArr: cc.Label[] = [];
    private _sprotArr: cc.Node[] = [];

    onEnable() {
        this._userDB = Cmn.ud.userDB;
        // 构建组件数组
        this._nodeArr.push(this.prev, this.now, this.next);
        this._lblArr.push(this.prevLbl, this.nowLbl, this.nextLbl);
        this._sprotArr.push(this.prev, this.left, this.now, this.right, this.next);
        this.setUI();
    }

    onDisable() {
        this._nodeArr = [];
        this._lblArr = [];
        this._sprotArr = [];
    }

    private setUI() {
        // 设置ui显示以及文本
        let cur: number = Cmn.ud.chapter;
        let max: number = Cmn.ud.maxChapter;
        cur = cur > max ? max : cur;
        for (let i: number = 0; i < this._nodeArr.length; i++) {
            this._nodeArr[i].active = 0 < cur + (-1 + i) && max >= cur + (-1 + i);
            this._lblArr[i].string = "第" + (cur + (-1 + i)).toString() + "关";
        }
        this.left.active = this.prev.active;
        this.right.active = this.next.active;
        // 播放动画
        let delay: number = 0;
        for (let i: number = 0; i < this._sprotArr.length; i++) {
            if (!this._sprotArr[i].active) continue;
            SportUtils.chapterNomalSport(this._sprotArr[i], delay);
            delay += 0.1;
        }
    }
}