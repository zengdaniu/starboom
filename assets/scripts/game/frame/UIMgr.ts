import { EvtDpc } from "../base/EvtDpc";
import { Mod } from "../module/Mod";
import { Loading, LoadModeEnum } from "../module/loading/Loading";
import { Cmn } from "./Cmn";
import { ModuleCtrlEvt } from "../base/ModuleCtrlEvt";
import { Tip } from "../module/tip/Tip";
const { ccclass, property } = cc._decorator;

@ccclass
export class UIMgr extends EvtDpc {

    /** 场景层 */
    @property(cc.Node)
    moduleLayer: cc.Node = null;
    /** 窗口层 */
    @property(cc.Node)
    windowLayer: cc.Node = null;
    /** 窗口层的背景 */
    @property(cc.Node)
    windowMask: cc.Node = null;
    /** 提示层 */
    @property(Tip)
    tip: Tip = null;
    /** 加载层 */
    @property(cc.Node)
    loadLayer: cc.Node = null;
    /** 顶层 */
    @property(cc.Node)
    topLayer: cc.Node = null;
    @property(cc.Node)
    firstNode: cc.Node = null;

    /** 实例对象 */
    static instance: UIMgr = null;

    // 是否在战斗中
    public isFighting: boolean = false;
    /** UI模块信息集 */
    private _data: { [key: string]: UIMsg } = {};
    /** 当前打开模块 */
    private _curScene: Mod = null;
    /** 上一个打开模块 */
    private _lastScene: Mod = null;
    /** 打开的窗口列表 */
    private _openWindowList = [];
    /** 是否启动 */
    private _isRun: boolean = false;
    private _loading: Loading;
    protected _yLimit: number = 640;
    protected _xLimit: number = 360;

    get openWindowList() { return this._openWindowList; }
    get yLimit() { return this._yLimit; }
    get xLimit() { return this._xLimit; }

    onLoad() {
        if (null == UIMgr.instance) UIMgr.instance = this;
        this.initData();
        this._openWindowList = [];
        this.windowLayer.active = false;
    }

    lateUpdate() {
        if (!this._isRun) {
            Cmn.cfg.loadCfg();
            this.showModule(UIKeyEnum.LOADING, [LoadModeEnum.CAR]);
            this._isRun = true;
        }
    }

    hideFirstNode() {
        this.firstNode.active = false;
    }

    setXYLimit(x: number, y: number) {
        this._xLimit = x;
        this._yLimit = y;
    }

    /** 初始化各ui模块信息 */
    private initData() {
        this._data[UIKeyEnum.LOADING] = new UIMsg(UIKeyEnum.LOADING, "ui/loading", "Loading");
        this._data[UIKeyEnum.MAIN_UI] = new UIMsg(UIKeyEnum.MAIN_UI, "ui/mainUI", "MainUI");
        this._data[UIKeyEnum.FIGHT] = new UIMsg(UIKeyEnum.FIGHT, "ui/fight", "Fight");
        this._data[UIKeyEnum.FIGHT_RESULT] = new UIMsg(UIKeyEnum.FIGHT_RESULT, "ui/fightResult", "FightResult");
        this._data[UIKeyEnum.OFFLINE] = new UIMsg(UIKeyEnum.OFFLINE, "ui/offline", "Offline");
        this._data[UIKeyEnum.TURNTABLE] = new UIMsg(UIKeyEnum.TURNTABLE, "ui/turntable", "Turntable");
        this._data[UIKeyEnum.SETTING] = new UIMsg(UIKeyEnum.SETTING, "ui/setting", "Setting");
        this._data[UIKeyEnum.TRYOUT] = new UIMsg(UIKeyEnum.TRYOUT, "ui/tryOutEvent", "TryOutEvent");
        this._data[UIKeyEnum.BONUS] = new UIMsg(UIKeyEnum.BONUS, "ui/bonus", "Bonus");
        this._data[UIKeyEnum.SIGNIN] = new UIMsg(UIKeyEnum.SIGNIN, "ui/signIn", "SignIn");
        this._data[UIKeyEnum.WEAPON] = new UIMsg(UIKeyEnum.WEAPON, "ui/weapon", "Weapon");
        this._data[UIKeyEnum.ACTIVATE] = new UIMsg(UIKeyEnum.ACTIVATE, "ui/activate", "Activate");
        this._data[UIKeyEnum.MOREGAME] = new UIMsg(UIKeyEnum.MOREGAME, "ui/moreGame", "MoreGame");
        this._data[UIKeyEnum.GUIDE] = new UIMsg(UIKeyEnum.GUIDE, "ui/guide", "Guide");
        this._data[UIKeyEnum.LEAVEGET] = new UIMsg(UIKeyEnum.LEAVEGET, "ui/leaveGet", "LeaveGet");
    }

    /** 加载完配置表后回调 */
    loadCfgCB() {
        Cmn.ud.checkLocal();
        Cmn.ui.showModule(UIKeyEnum.MAIN_UI);
        //Cmn.pf.init();
    }

    /**
     * 展示ui模块
     * @param moduleKey 模块对应枚举key
     * @param args 参数
     * @param loadMode 加载样式
     */
    showModule(moduleKey: UIKeyEnum, args: any[] = null, loadMode: LoadModeEnum = LoadModeEnum.CAR) {
        let uiMsg: UIMsg = this._data[moduleKey];
        uiMsg.args = (null != args ? args : []);
        if (null != uiMsg.mainScript) {
            if (UIKeyEnum.FIGHT == moduleKey) {
                this.setLoadingMode(loadMode)
                let cbObject: any = this;
                let cbFun: Function = this.openModule;
                Cmn.res.load(cbFun, cbObject, [moduleKey]);
            } else {
                this.openModule(moduleKey);
            }
        } else {
            if (UIKeyEnum.LOADING != moduleKey) {
                this.setLoadingMode(loadMode)
            }
            Cmn.res.addRes(uiMsg.key, uiMsg.path);
            let cb: Function = this.openModule;
            let target: any = this;
            Cmn.res.load(cb, target, [moduleKey]);
        }
    }

    /**
     * 打开ui模块
     * @param moduleKey 模块对应枚举key
     */
    private openModule(moduleKey: UIKeyEnum) {
        let uiMsg: UIMsg = this._data[moduleKey];
        if (null == uiMsg.mainScript) {
            let prefab: cc.Prefab = Cmn.res.getData(uiMsg.key, false, false);
            if (!prefab) return;
            let node: cc.Node = cc.instantiate(prefab);
            uiMsg.mainScript = node.getComponent(uiMsg.className);
            uiMsg.mainScript.init();
        }
        if (null == uiMsg.mainScript) return;
        if (UIKeyEnum.LOADING == uiMsg.key) {
            this._loading = uiMsg.mainScript;
            this.addToParent(this.loadLayer, this._loading.node);
            this._loading.setArgs(uiMsg.args);
            this._loading.show();
            this._loading.node.setPosition(cc.Vec2.ZERO);
        } else if (uiMsg.mainScript.isWindow) {
            this.openWindow(uiMsg.mainScript, uiMsg.args);
        } else {
            this.switchScene(uiMsg.mainScript, uiMsg.args);
        }
        // 隐藏加载界面
        if (UIKeyEnum.LOADING != moduleKey) {
            this.setLoadingMode(LoadModeEnum.SILENCE);
        }
    }

    /**
     * 释放ui模块
     * @param deleteModule 
     */
    private releaseModule(deleteModule: Mod) {
        if (null == deleteModule) return;
        if (deleteModule.isWindow) {
            let index: number = this._openWindowList.indexOf(window);
            if (index > -1) this._openWindowList.splice(index, 1);
        } else {
            if (this._curScene == deleteModule) this._curScene = null;
            if (this._lastScene == deleteModule) this._lastScene = null;
            // 删除场景里面引用的所有window
            deleteModule._windowList.splice(0, deleteModule._windowList.length);
        }
        deleteModule.release();
        deleteModule.node.active = false;
    }

    /**
     * 打开窗口
     * @param window 
     * @param args 
     */
    private openWindow(window: any, args: any[]) {
        if (null == window) return;
        this._openWindowList.push(window);
        window.setArgs(args);
        this.addToParent(this.windowLayer, window.node);
        window.node.setPosition(cc.Vec2.ZERO);
        window.show();
        this.windowLayer.active = true;
        this.windowMask.setSiblingIndex(this.windowLayer.childrenCount - 2);
        window.node.setSiblingIndex(this.windowLayer.childrenCount - 1);
        this.dpcEvt(new ModuleCtrlEvt(ModuleCtrlEvt.OPEN_WINDOW, window));
    }

    /**
     * 关闭窗口
     * @param window 
     */
    closeWindow(window: any) {
        if (null == window || null == window.node) return;
        if (!window.node.active) return;
        window.recoverFlag = false;
        let idx = this._openWindowList.indexOf(window);
        if (idx >= 0) this._openWindowList.splice(idx, 1);
        if (this._curScene && this._curScene._windowList) {
            let idxsw = this._curScene._windowList.indexOf(window);
            if (idxsw >= 0) this._curScene._windowList.splice(idxsw, 1);
        }
        window.hide();
        window.node.removeFromParent();
        this.windowLayer.childrenCount <= 1 ? this.windowLayer.active = false : this.windowMask.setSiblingIndex(this.windowLayer.childrenCount - 2);
        this.dpcEvt(new ModuleCtrlEvt(ModuleCtrlEvt.CLOSE_WINDOW, window));
    }

    /** 关闭所有窗口 */
    private closeAllWindow() {
        this.windowLayer.active = false;
        for (let i: number = this._openWindowList.length - 1; i >= 0; i--) {
            this.closeWindow(this._openWindowList[i]);
        }
    }

    /**
     * 设置窗口背景透明度
     * @param opacity 透明度 255完全不透明 0完全透明
     */
    setWindowDarkOpacity(opacity: number) {
        this.windowMask.opacity = opacity
    }

    /**
     * 设置加载样式
     * @param mode 
     */
    private setLoadingMode(mode: LoadModeEnum) {
        if (null == this._loading) return;
        this._loading.setLoadingMode(mode);
    }

    /**
     * 切换场景
     * @param scene 
     * @param args 
     */
    private switchScene(scene: Mod, args: any[]) {
        if (scene == this._curScene) return;
        this.closeAllWindow();
        if (this._curScene != null && this._curScene != scene) {
            if (this._lastScene != null && this._lastScene != scene) this.releaseModule(this._lastScene);
            this._lastScene = this._curScene;
            this._lastScene.hide();
        }
        this._curScene = scene;
        if (this._curScene) {
            this._curScene.setArgs(args);
            this.addToParent(this.moduleLayer, this._curScene.node);
            this._curScene.node.setPosition(cc.Vec2.ZERO);
            this._curScene.show();
            this.dpcEvt(new ModuleCtrlEvt(ModuleCtrlEvt.OPEN_SCENE, this._curScene));
        }
    }

    /**
     * 添加到父节点
     * @param parent 父节点
     * @param child 子节点
     */
    private addToParent(parent: cc.Node, child: cc.Node) {
        if (null == parent || null == child || child.parent == parent) return;
        if (child.parent) {
            if (child.parent != parent) child.removeFromParent();
        }
        parent.addChild(child);
    }
}

/** ui模块信息 */
class UIMsg {
    /** 模块名 */
    key: UIKeyEnum;
    /** 路径 */
    path: string = "";
    /** 参数 */
    args: any[] = [];
    /** 脚本名 */
    className: string = "";
    /** 脚本实体 */
    mainScript: any = null;

    constructor(key: UIKeyEnum, path: string, className: string) {
        this.key = key;
        this.path = path;
        this.className = className;
    }
}

/** ui模块枚举 */
export enum UIKeyEnum {
    /** 加载界面 */
    LOADING = "loading",
    /** 主界面 */
    MAIN_UI = "mainUI",
    /**  战斗 */
    FIGHT = "fight",
    /**  战斗结算 */
    FIGHT_RESULT = "fightResult",
    /** 离线奖励 */
    OFFLINE = "offline",
    /** 转盘抽奖 */
    TURNTABLE = "turntable",
    /** 设置 */
    SETTING = "setting",
    /** 试玩事件 */
    TRYOUT = "tryOutEvent",
    /** 福利 */
    BONUS = "bonus",
    /** 排行榜 */
    RANK = "rank",
    /** 签到 */
    SIGNIN = "signIn",
    /** 武器库 */
    WEAPON = "weapon",
    /** 激活成功奖励 */
    ACTIVATE = "activate",
    /** 商店 */
    MOREGAME = "moreGame",
    /** 新手提示 */
    GUIDE = "guide",
    /** 离线收益 */
    LEAVEGET = "leaveGet",
}