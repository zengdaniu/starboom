import { Mod } from "../Mod";
import { Cmn } from "../../frame/Cmn";
import { ModuleCtrlEvt } from "../../base/ModuleCtrlEvt";
import { LoadResEvt } from "../../base/LoadResEvt";

const { ccclass, property } = cc._decorator;

@ccclass
export class Loading extends Mod {

    @property(cc.Node)
    bg: cc.Node = null;
    @property(cc.ProgressBar)
    progressBar: cc.ProgressBar = null;
    @property(cc.Label)
    pgblabel: cc.Label = null;
    @property(cc.Node)
    carNode: cc.Node = null;
    @property(cc.Label)
    carLabel: cc.Label = null;
    @property(cc.Node)
    driftNode: cc.Node = null;

    private _curModel: LoadModeEnum;
    private _carAngleSpeed: number = 240;

    onLoad() {
        this.bg.active = false;
        this.progressBar.node.active = false;
    }

    setArgs(args: any[]) {
        this.setLoadingMode(args[0]);
    }

    update(dt) {
        if (LoadModeEnum.SILENCE != this._curModel && LoadModeEnum.PGB != this._curModel) {
            this.driftNode.angle = (this.driftNode.angle - this._carAngleSpeed * dt) % 360;
        }
    }

    private addEventListeners() {
        Cmn.res.addListener(LoadResEvt.START, this.startHandler, this);
        Cmn.res.addListener(LoadResEvt.FINISH, this.finishHandler, this);
        Cmn.res.addListener(LoadResEvt.COMPLETE, this.completeHandler, this);
        Cmn.res.addListener(LoadResEvt.PROGRESS, this.progressHandler, this);
        Cmn.res.addListener(LoadResEvt.ERROR, this.errorHandler, this);
    }

    private removeEventListeners() {
        Cmn.res.delListener(LoadResEvt.FINISH, this.finishHandler, this);
        Cmn.res.delListener(LoadResEvt.COMPLETE, this.completeHandler, this);
        Cmn.res.delListener(LoadResEvt.PROGRESS, this.progressHandler, this);
        Cmn.res.delListener(LoadResEvt.ERROR, this.errorHandler, this);
    }

    private startHandler(event: LoadResEvt) {

    }

    private progressHandler(event: LoadResEvt) {
        let progress: number = 0;
        if (event.totalCount > 0) {
            if (event.itemTotalCount > 0) {
                progress = (event.completedCount + event.itemCompletedCount / event.itemTotalCount) / event.totalCount;
            }
            else {
                progress = event.completedCount / event.totalCount;
            }
            this.setProgress(progress);
        }
    }

    private finishHandler(event: LoadResEvt) {
        this.removeEventListeners();
    }

    private completeHandler(event: LoadResEvt) { }
    private errorHandler(event: LoadResEvt) { }

    setLoadingMode(model: LoadModeEnum) {
        this.node.active = (LoadModeEnum.SILENCE != model);
        this.bg.active = (LoadModeEnum.FULL == model);
        this.progressBar.node.active = (LoadModeEnum.PGB == model);
        this.carNode.active = (LoadModeEnum.SILENCE != model && LoadModeEnum.PGB != model);
        this.addEventListeners();
        Cmn.ui.dpcEvt(new ModuleCtrlEvt(ModuleCtrlEvt.LOADIGN, null)); //对外通知正在加载
        this.setProgress(0);
        this._curModel = model;
    }

    private setProgress(progress: number) {
        this.progressBar.progress = progress;
        let str: string = Math.floor(progress * 100).toString() + "%";
        if (LoadModeEnum.PGB == this._curModel) {
            this.pgblabel.string = str;
        } else {
            this.carLabel.string = str;
        }
    }
}

export enum LoadModeEnum {
    NONE = 0,
    /** 静默加载 */
    SILENCE = 1,
    /** 全屏加载 */
    FULL = 2,
    /** 进度加载 */
    PGB = 3,
    /** 车辆漂移loadding */
    CAR = 4,
}
