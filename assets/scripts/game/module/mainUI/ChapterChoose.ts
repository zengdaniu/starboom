import { UserDB } from "../../frame/UserData";
import { Cmn } from "../../frame/Cmn";
import { SportUtils } from "../../utils/SportUtils";
const { ccclass, property } = cc._decorator;

@ccclass
export class ChapterChoose extends cc.Component {

    @property([cc.Node])
    nodeArr: cc.Node[] = [];
    @property([cc.Label])
    lblArr: cc.Label[] = [];
    @property(cc.Node)
    nomal: cc.Node = null;

    private _userDB: UserDB;
    private _numArr: number[] = [];
    private _sprotArr: cc.Node[] = [];

    onEnable() {
        this._userDB = Cmn.ud.userDB;
        this._sprotArr.push(this.nodeArr[3], this.nodeArr[6], this.nodeArr[0], this.nodeArr[5], this.nodeArr[2], this.nodeArr[1], this.nodeArr[4]);
        this.setUI();
    }

    onDisable() {
        this._sprotArr = [];
    }

    private setUI() {
        let cur: number = Cmn.ud.chapter;
        let max: number = Cmn.ud.maxChapter;
        this._numArr = [];
        if (cur < 7) {
            for (let i: number = 1; i <= 7; i++) {
                this._numArr.push(i);
            }
        } else {
            cur = cur > max ? max : cur;
            this._numArr.push(cur);
            for (let i: number = 1; i < 7; i++) {
                this._numArr.unshift(cur - i);
            }
        }
        for (let i: number = 0; i < this.lblArr.length; i++) {
            this.lblArr[i].string = "第" + (this._numArr[i].toString()) + "关";
        }
        // 播放动画
        let delay: number = 0;
        for (let i: number = 0; i < this._sprotArr.length; i++) {
            if (!this._sprotArr[i].active) continue;
            SportUtils.chapterChooseSport(this._sprotArr[i], delay);
            delay += 0.05;
        }
    }

    private onBtnClick(event) {
        let index: number;
        for (let i: number = 0; i < this.nodeArr.length; i++) {
            if (this.nodeArr[i] == event.target) index = i;
        }
        if (this._numArr[index] <= this._userDB.curChapter) {
            Cmn.ud.chapter = this._numArr[index];
            this.node.active = false;
            this.nomal.active = true;
        } else {
            cc.error("前置关卡未通关");
        }
    }
}