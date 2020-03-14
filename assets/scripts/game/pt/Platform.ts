import { Cmn } from "../frame/Cmn";
import { TipsType } from "../module/tip/TipItem";

export class Platform {

    private static _instance: Platform = null;
    static get instance(): Platform {
        if (this._instance == null) this._instance = new Platform();
        return this._instance;
    }

    private readonly bannerY: number = 930; // 1280 - 350 图高350,屏幕底端显示，锚点为顶端
    private _webPF: DebuWebPlatform = null;
    private _bannerSCB: Function = null;
    private _bannerECB: Function = null;
    private _bannerCBobj: object = null;
    private _viewSCB: Function = null;
    private _viewECB: Function = null;
    private _viewCCB: Function = null;
    private _viewCBobj: object = null;
    private _appletSCB: Function = null;
    private _appletECB: Function = null;
    private _appletCBobj: object = null;
    private _shareSCB: Function = null;
    private _shareECB: Function = null;
    private _shareCBobj: object = null;

    constructor() {
        this._webPF = window.platform;
        this._webPF.init(this.bannerY);     // 初始化横幅广告Y坐标
    }

    /**
     * 展示横幅广告
     * @param successCB 成功回调
     * @param errorCB 错误回调
     * @param obj 回调实体对象
     */
    showBanner(successCB?: Function, errorCB?: Function, obj?: object) {
        if (null == this._webPF) return;
        this._bannerSCB = successCB;
        this._bannerECB = errorCB;
        this._bannerCBobj = obj;
        this._webPF.showBanner(this.bannerSCB, this.bannerECB, this);
    }

    /**
     * 隐藏横幅广告
     */
    hideBanner() {
        if (null == this._webPF) return;
        this._webPF.hideBanner();
    }

    /**
     * 打开视频广告
     * @param successCB 成功回调
     * @param errorCB 错误回调
     * @param closeCB 关闭回调
     * @param obj 回调实体对象
     * @param posId 展示位id
     */
    showVideo(posId:number,successCB?: Function, errorCB?: Function, closeCB?: Function, obj?: object) {
        if (null == this._webPF) return;
        this._viewSCB = successCB;
        this._viewECB = errorCB;
        this._viewCCB = closeCB;
        this._viewCBobj = obj;
        this._webPF.showVideo(this.viewSCB, this.viewECB, this.viewCCB, this,posId);
    }

    /**
     * 引导添加小程序
     * @param successCB 成功回调
     * @param errorCB 错误回调
     * @param obj 回调实体对象
     */
    addApplet(successCB?: Function, errorCB?: Function, obj?: object) {
        if (null == this._webPF) return;
        this._appletSCB = successCB;
        this._appletECB = errorCB;
        this._appletCBobj = obj;
        this._webPF.addApplet(this.appletSCB, this.appletECB, this);
    }

    /**
     * 显示转发按钮
     * @param successCB 成功回调
     * @param errorCB 错误回调
     * @param obj 回调实体对象
     */
    shareMenu(successCB?: Function, errorCB?: Function, obj?: object) {
        if (null == this._webPF) return;
        this._shareSCB = successCB;
        this._shareECB = errorCB;
        this._shareCBobj = obj;
        this._webPF.shareMenu(this.shareSCB, this.shareECB, this);
    }

    /**
     * 设置防沉迷
     * @param s  防沉迷时间内（10001、10002、10003）
     * @param e  防沉迷时间外
     * @param thisobj  作用域
     */
    getAntiAddiction(successCB?: Function, errorCB?: Function, obj?: object) {
        if (null == this._webPF) return;
        this._webPF.getAntiAddiction(successCB, errorCB, obj);
    }

    // 分享成功回调
    private shareSCB(status: boolean) {
        if (null != this._shareCBobj && null != this._shareSCB) {
            this._shareSCB.call(this._shareCBobj, status);
        }
        this.cleanShareCB();
    }

    // 分享失败回调
    private shareECB(status: boolean) {
        Cmn.ui.tip.pushLblArr("分享失败", TipsType.TXT);
        if (null != this._shareCBobj && null != this._shareECB) {
            this._shareECB.call(this._shareCBobj, status);
        }
        this.cleanShareCB();
    }

    private cleanShareCB() {
        this._shareSCB = null;
        this._shareECB = null;
        this._shareCBobj = null;
    }

    // 添加小程序成功回调
    private appletSCB(status: boolean) {
        if (null != this._appletCBobj && null != this._appletSCB) {
            this._appletSCB.call(this._appletCBobj, status);
        }
        this.cleanAppletCB();
    }

    // 添加小程序失败回调
    private appletECB(status: boolean) {
        Cmn.ui.tip.pushLblArr("添加小程序失败", TipsType.TXT);
        if (null != this._appletCBobj && null != this._appletECB) {
            this._appletECB.call(this._appletCBobj, status);
        }
        this.cleanAppletCB();
    }

    private cleanAppletCB() {
        this._appletSCB = null;
        this._appletECB = null;
        this._appletCBobj = null;
    }

    // 打开视频成功回调
    private viewSCB(status: boolean) {
        if (null != this._viewCBobj && null != this._viewSCB) {
            this._viewSCB.call(this._viewCBobj, status);
        }
        this.cleanViewCB();
    }

    // 打开视频失败回调
    private viewECB(status: boolean) {
        Cmn.ui.tip.pushLblArr("视频广告还未准备好！", TipsType.TXT);
        if (null != this._viewCBobj && null != this._viewECB) {
            this._viewECB.call(this._viewCBobj, status);
        }
        this.cleanViewCB();
    }

    /**
     * 视频关闭回调
     * @param status true:视频看完 false:未看完
     */
    private viewCCB(status: boolean) {
        if (!status) {
            Cmn.ui.tip.pushLblArr("要看完视频才能获得奖励！", TipsType.TXT);
        }
        if (null != this._viewCBobj && null != this._viewCCB) {
            this._viewCCB.call(this._viewCBobj, status);
        }
        this.cleanViewCB();
    }

    private cleanViewCB() {
        this._viewSCB = null;
        this._viewECB = null;
        this._viewCCB = null;
        this._viewCBobj = null;
    }

    // 横幅广告成功回调
    private bannerSCB(status: boolean) {
        if (null != this._bannerCBobj && null != this._bannerSCB) {
            this._bannerSCB.call(this._bannerCBobj, status);
        }
        this.cleanBannerCB();
    }

    // 横幅广告失败回调
    private bannerECB(status: boolean) {
        Cmn.ui.tip.pushLblArr("横幅广告还未准备好！", TipsType.TXT);
        if (null != this._bannerCBobj && null != this._bannerECB) {
            this._bannerECB.call(this._bannerCBobj, status);
        }
        this.cleanBannerCB();
    }

    private cleanBannerCB() {
        this._bannerSCB = null;
        this._bannerECB = null;
        this._bannerCBobj = null;
    }
}
export enum ViewPosID {
    LeaveGet = 0 ,  //离线奖励双倍
    SignIn   = 1 ,  //签到奖励双倍
    FreeUpgrade = 2 , // 免费升级
    FreeRelive = 3 , //免费复活
}