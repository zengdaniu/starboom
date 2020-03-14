import { Cmn } from "./Cmn";
import { Platform } from "../pt/Platform";
import { UIKeyEnum } from "./UIMgr";
import MixedUtils from "../utils/MixedUtils";
import { CfgConstants } from "../cfg/CfgConstants";
//import { WelfareCfg } from "../cfg/WelfareCfg";
import { Data } from "../base/Data";

/** 货币类型 CurrencyType */
export enum CyType {
    MONEY = 1,
    STRENGTH = 2,
}

export class UserData {
    static readonly leaveTimeIT: number = 180; // 每3分钟存一次离线时间，当做玩家下线时间，3分钟以内不产生连收益
    static get instance(): UserData {
        if (this._instance == null) this._instance = new UserData();
        return this._instance;
    }
        /** 更多游戏回调数据结构
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
    public moreGameData: any = null;
    
    private readonly saveName: string = "starBoom_3_";
    private readonly timeSaveIT: number = 3;
    private static _instance: UserData = null;

    public lastFightIsWin: boolean = true;
    public totalLeaveTime: number = 0;     // 读档的时候算一下，离线收益界面打开了，就重新归零

    private _userDB: UserDB = new UserDB();
    private _chooseChapter: number;// 选择的关卡
    private _maxChapter: number = 500;// 最大关卡数
    private _maxStrength: number = 10;// 最大体力值
    private _resumeSec: number = 300;// 体力恢复间隔时间(秒)(多少秒恢复一点体力)
    private _bonusData: BonusData;
    private _timeSaveStep: number = 0;
    private _leaveTimeStep: number = 0;

    get userDB() { return this, this._userDB }

    set UserDB(value: UserDB) { this._userDB = value }

    get maxChapter() { return this._maxChapter }

    get chapter() {
        if (this._chooseChapter && this._chooseChapter == this.userDB.curChapter) {
            this._chooseChapter = null;
            return this.userDB.curChapter
        } else if (this._chooseChapter) {
            return this._chooseChapter;
        } else {
            return this.userDB.curChapter;
        }
    }

    set chapter(value: number) {
        if (value > this.userDB.curChapter) {
            this._chooseChapter = null;
            this.userDB.curChapter = value;
        } else if (value == this.userDB.curChapter) {
            this._chooseChapter = null;
        } else {
            this._chooseChapter = value;
        }
    }

    get maxStrength() { return this._maxStrength }

    get resumeSec() { return this._resumeSec }

    update(dt) {
        this.calcTime(dt);
        this.updateLeaveTime(dt);
    }

    /** 检测本地数据 */
    checkLocal() {
        let loginTime: number = this.getLocal(UserDataKey.LOGINTIME);
        if (null == loginTime || 0 == loginTime.toString().length || "" == loginTime.toString()) {
            cc.error("未找到本地数据");
            cc.error("平台,为玩家初始化数据");
            this._userDB = this.initData(this._userDB);
            this.setLocalAll();
            Cmn.ui.showModule(UIKeyEnum.MAIN_UI, null);

            // switch (Cmn.pf.ptName) {
            //     case PTEnum.NOMAL:
            //     case PTEnum.WX:
            //         cc.error(PTEnum.NOMAL + "平台,为玩家初始化数据");
            //         this._userDB = this.initData(this._userDB);
            //         this.setLocalAll();
            //         Cmn.ui.showModule(UIKeyEnum.MAIN_UI, null);
            //         break;
            //     // case PTEnum.WX:
            //     // todo 对接微信
            //     // cc.error(PTEnum.WX + "平台,获取服务器数据,todo");
            //     // break;
            // }
        } else {
            cc.error("找到本地数据,老玩家登录");
            this.getLocalAll();
            this._userDB.loginTime = MixedUtils.getTimeStamp();
            this.saveLocalSolt(UserDataKey.LOGINTIME);
            Cmn.ui.showModule(UIKeyEnum.MAIN_UI, null);
        }
    }

    /**
     * 保存本地数据接口
     * @param key 只要一个key值,找到这个类里面的userDB里面对应字段,构造一个新的json对象,再保存到本地
     */
    saveLocalSolt(key: string) {
        this.setLocal(key, this.newJson(key, this._userDB));
    }

    /**
     * 构建一个新的josn结构用于存储
     * @param key 
     * @param data 
     * @param simple 为true,则会使用数据本体为对应的key值赋值
     */
    private newJson(key: string, data: any, simple: boolean = false): object {
        let json: object = {};
        if (simple) {
            json[key] = data;
        } else {
            if (null == data || null == data[key]) return null;
            json[key] = data[key];
        }
        return json;
    }

    /**
     * 设置本地数据
     * @param key 
     * @param data 
     */
    private setLocal(key: string, data: any) {
        cc.sys.localStorage.setItem(this.saveName + key, JSON.stringify(data));
    }

    /**
     * 获取本地数据
     * @param key 
     */
    getLocal(key: UserDataKey | string) {
        let data = cc.sys.localStorage.getItem(this.saveName + key);
        if ("" == data || "null" == data || null == data || undefined == data) return null;
        data = JSON.parse(data)
        return data[key];
    }

    /** 存储所有数据到本地 */
    setLocalAll() {
        for (let key in UserDataKey) {
            this.saveLocalSolt(UserDataKey[key]);
        }
    }

    /** 获取所有本地数据 */
    private getLocalAll() {
        this._userDB = this.initData(this._userDB);
        let data: any = null;
        for (let key in UserDataKey) {
            // 因为登录时间在登录的时候从新设置一遍,不需要获取本地的
            if (UserDataKey.LOGINTIME == UserDataKey[key]) continue;
            data = this.getLocal(UserDataKey[key]);
            if (null != data) {
                this._userDB[UserDataKey[key]] = data;
            }
        }
        // 时间相关数据
        let nowTime: number = MixedUtils.getTimeStamp();
        for (let key in UserDataKey) {
            switch (UserDataKey[key]) {
                case UserDataKey.DOUBLEGOLDEND:
                    if (0 < this._userDB.doubleGoldEnd) {
                        this._userDB.doubleGoldEnd = (0 < this._userDB.doubleGoldTime ? nowTime + this._userDB.doubleGoldTime * 1000 : 0);
                    }
                    break;
                case UserDataKey.DOUBLEHURTEND:
                    if (0 < this._userDB.doubleHurtEnd) {
                        this._userDB.doubleHurtEnd = (0 < this._userDB.doubleHurtTime ? nowTime + this._userDB.doubleHurtTime * 1000 : 0);
                    }
                    break;
                case UserDataKey.AUTOSHOOTEND:
                    if (0 < this._userDB.autoShootEnd) {
                        this._userDB.autoShootEnd = (0 < this._userDB.autoShootTime ? nowTime + this._userDB.autoShootTime * 1000 : 0);
                    }
                    break;
                case UserDataKey.STRENGTHAUTOADDTIME:
                    if (0 < this._userDB.strengthAutoAddTime) {
                        let diffSec: number = Math.floor((nowTime - this._userDB.strengthAutoAddTime) / 1000);
                        if (0 < diffSec && this.userDB.nowStrength < Cmn.ud.maxStrength) {
                            let addVal: number = Math.floor(diffSec / Cmn.ud.resumeSec);
                            let difVal: number = Cmn.ud.maxStrength - this.userDB.nowStrength;
                            addVal = (difVal < addVal ? difVal : addVal);
                            Cmn.ud.addStrength(addVal);
                        }
                        this.userDB.cdStrength = nowTime;
                    }
                    break;
                case UserDataKey.LEAVETIME:
                    this.totalLeaveTime = Math.floor((nowTime - this.userDB.leaveTime) / 1000);
                    this.totalLeaveTime = (7200 < this.totalLeaveTime ? 7200 : this.totalLeaveTime);
                    if (0 > this.totalLeaveTime || UserData.leaveTimeIT > this.totalLeaveTime) {
                        this.totalLeaveTime = 0;
                    }
                    this.userDB.leaveTime = nowTime
                    break;
            }
        }
        this.setLocalAll();
    }

    /**
     * 初始化角色数据
     * @param userDB 
     */
    initData(userDB: UserDB): UserDB {
        userDB || new UserDB();
        userDB.nowStrength = 5;
        userDB.cdStrength = 0
        userDB.money = [0, 0];
        userDB.weapon = this.initWeapon();
        userDB.curArmsId =1;
        userDB.taskId = 1 ;
        userDB.ownArmsId = [1];
        userDB.turnTime = 5;
        userDB.signDays = 0;
        userDB.signDate = 0;
        userDB.curChapter = 1;
        userDB.loginTime = MixedUtils.getTimeStamp();
        userDB.leaveTime = MixedUtils.getTimeStamp();
        userDB.doubleGoldEnd = 0;
        userDB.doubleGoldTime = 0;
        userDB.curBonusId = 0;
        userDB.doubleHurtEnd = 0;
        userDB.doubleHurtTime = 0;
        userDB.autoShootEnd = 0;
        userDB.autoShootTime = 0;
        userDB.guideStep = 0;
        return userDB;
    }

    /** 初始化枪支数据 */
    initWeapon() {
        //let cfg: Object = Cmn.cfg.getCfgObj(CfgConstants.RES_ARMS);
        let weapon: WeaponData =new WeaponData();
        weapon.attLv = 1;
        weapon.gold = 1;
        weapon.hp = 0;
        weapon.speed =1;
        weapon.wage = 1;
        return weapon;
    }

    /**
     * 添加体力接口
     * @param value 增加的数量
     * 返回值 true已达到体力上限 false未达到体力上限
     */
    addStrength(value: number): boolean {
        this._userDB.nowStrength += value;
        if (this._userDB.nowStrength >= this._maxStrength) {
            this._userDB.cdStrength = 0;
            this._userDB.strengthAutoAddTime = 0;
            Cmn.ud.saveLocalSolt(UserDataKey.STRENGTHAUTOADDTIME);
            this._userDB.upStrength++;
            return true;
        }
        this._userDB.upStrength++;
        return false;
    }

    /**
     * 减少体力接口
     * @param value 减少的数量 
     * 返回值 true体力足够相减 false体力不足相减
     */
    reduceStrength(value: number) {
        if (this._userDB.nowStrength < value) return false;
        this._userDB.nowStrength -= value;
        if (0 == this._userDB.cdStrength) {
            this._userDB.cdStrength = MixedUtils.getTimeStamp();
            this._userDB.strengthAutoAddTime = MixedUtils.getTimeStamp();
            Cmn.ud.saveLocalSolt(UserDataKey.STRENGTHAUTOADDTIME);
        }
        this._userDB.upStrength++;
        return true;
    }

    /** 计算福利是否满足条件 */
    bonusShort() {
        // let obj: any = Cmn.cfg.getCfgObj(CfgConstants.RES_WELFARE);
        // let item: WelfareCfg;
        // let cfg: WelfareCfg;
        // let passNum: number = this._userDB.curChapter - 1;
        // let curRewardId: number = this._userDB.curBonusId;
        // for (let key in obj) {
        //     item = obj[key];
        //     if (item.id <= curRewardId) passNum -= item.levelNum;
        //     if (item.id == (curRewardId + 1)) cfg = item;
        // }
        // this._bonusData = new BonusData(passNum, cfg);
        // return this._bonusData;
    }

    /**
     * new一个新的数据出来,避免污染
     * @param arr 
     */
    newArr(arr: any[]) {
        let newArr: any[] = new Array(arr.length);
        for (let i: number = 0; i < arr.length; i++) {
            newArr[i] = arr[i];
        }
        return newArr;
    }

    /** 时效性数值计算 */
    private calcTime(dt) {
        this._timeSaveStep -= dt;
        let nowTime: number = MixedUtils.getTimeStamp();
        let diffTime: number = 0;

        // 双倍收益
        if (0 < this._userDB.doubleGoldEnd) {
            diffTime = this._userDB.doubleGoldEnd - nowTime;
            this._userDB.doubleGoldEnd = (0 >= diffTime ? 0 : this._userDB.doubleGoldEnd);
            this._userDB.doubleGoldTime = (0 >= diffTime ? 0 : Math.ceil(diffTime / 1000));
            if (!Cmn.ui.isFighting && (0 == this._userDB.doubleGoldEnd || 0 > this._timeSaveStep)) {
                Cmn.ud.saveLocalSolt(UserDataKey.DOUBLEGOLDEND);
                Cmn.ud.saveLocalSolt(UserDataKey.DOUBLEGOLDTIME);
            }
        }

        // 双倍伤害
        if (0 < this._userDB.doubleHurtEnd) {
            diffTime = this._userDB.doubleHurtEnd - nowTime;
            this._userDB.doubleHurtEnd = (0 >= diffTime ? 0 : this._userDB.doubleHurtEnd);
            this._userDB.doubleHurtTime = (0 >= diffTime ? 0 : Math.ceil(diffTime / 1000));
            if (!Cmn.ui.isFighting && (0 == this._userDB.doubleHurtEnd || 0 > this._timeSaveStep)) {
                Cmn.ud.saveLocalSolt(UserDataKey.DOUBLEHURTEND);
                Cmn.ud.saveLocalSolt(UserDataKey.DOUBLEHURTTIME);
            }
        }

        // 自动攻击
        if (0 < this._userDB.autoShootEnd) {
            diffTime = this._userDB.autoShootEnd - nowTime;
            this._userDB.autoShootEnd = (0 >= diffTime ? 0 : this._userDB.autoShootEnd);
            this._userDB.autoShootTime = (0 >= diffTime ? 0 : Math.ceil(diffTime / 1000));
            if (!Cmn.ui.isFighting && (0 == this._userDB.autoShootEnd || 0 > this._timeSaveStep)) {
                Cmn.ud.saveLocalSolt(UserDataKey.AUTOSHOOTEND);
                Cmn.ud.saveLocalSolt(UserDataKey.AUTOSHOOTTIME);
            }
        }

        this._timeSaveStep = (0 > this._timeSaveStep ? this.timeSaveIT : this._timeSaveStep);
    }


    private updateLeaveTime(dt) {
        this._leaveTimeStep += dt;
        if (UserData.leaveTimeIT < this._leaveTimeStep) {
            this._leaveTimeStep -= UserData.leaveTimeIT;
            this._userDB.leaveTime = MixedUtils.getTimeStamp();
            !Cmn.ui.isFighting && Cmn.ud.saveLocalSolt(UserDataKey.LEAVETIME);
        }
    }
}

export class UserDB extends Data {
    /** 当前体力 */
    nowStrength: number;
    /** 体力恢复倒计时起始时间 */
    cdStrength: number;
    /** 上次体力自动恢复时间 */
    strengthAutoAddTime: number;
    /** 金币数 */
    money: number[];
    /** 任务id */
    taskId :number =1;
    /** 枪支数据 */
    weapon: WeaponData;
    /** 人物id*/
    curArmsId : number ;
    /** 拥有武器*/
    ownArmsId :number[]=[1];
    /** 当前关卡分数*/
    curScore :number = 0;
    /** 最高分数*/
    bestScore :number = 0;
    /** 转盘次数 */
    turnTime: number;
    /** 签到多少天 */
    signDays: number;
    /** 最后签到时间 */
    signDate: number;
    /** 当前关卡,1表示第一关(表示当前最大通关数下一关,例如:9表示1~8已通关,当前需要攻打第9关) */
    curChapter: number;
    /** 登录时间戳 */
    loginTime: number;
    /** 离线时间戳 */
    leaveTime: number;
    /** 双倍收益开始时间 */
    doubleGoldEnd: number;
    /** 双倍收益持续时间 */
    doubleGoldTime: number;
    /** 当前已领取关卡奖励id,0表示未领取过 */
    curBonusId: number;
    /** 双倍伤害开始时间 */
    doubleHurtEnd: number;
    /** 双倍伤害持续时间 */
    doubleHurtTime: number;
    /** 自动攻击开始时间 */
    autoShootEnd: number;
    /** 自动攻击持续时间 */
    autoShootTime: number;
    /** 新手提示步骤 */
    guideStep: number;

    /**任务相关 */
    upAttribute:number =0;
    /**任务相关 */
    watchTv:number =0;
    /**任务相关 */
    signIn:number =0;

    // 体力发生变化驱动更新
    private _upStrength: number = 0;
    public get upStrength(): number {
        return this._upStrength;
    }
    public set upStrength(value: number) {
        this.valueChanged("upStrength", "_upStrength", value);
        return;
    }

    // 金币发生变化驱动更新
    private _upMoney: number = 0;
    public get upMoney(): number {
        return this._upMoney;
    }
    public set upMoney(value: number) {
        this.valueChanged("upMoney", "_upMoney", value);
        return;
    }

    // 当前关卡发生变化驱动更新
    private _upTurnTime: number = 0;
    public get upTurnTime(): number {
        return this._upTurnTime;
    }
    public set upTurnTime(value: number) {
        this.valueChanged("upTurnTime", "_upTurnTime", value);
        return;
    }
}

/** userDB 对应枚举键值 */
export enum UserDataKey {
    NOWSTRENGTH = "nowStrength",
    CDSTRENGTH = "cdStrength",
    STRENGTHAUTOADDTIME = "strengthAutoAddTime",
    MONEY = "money",
    WEAPON = "weapon",
    TURNTIME = "turnTime",
    SIGNDAYS = "signDays",
    SIGNDATE = "signDate",
    CURCHAPTER = "curChapter",
    LOGINTIME = "loginTime",
    LEAVETIME = "leaveTime",
    DOUBLEGOLDEND = "doubleGoldEnd",
    DOUBLEGOLDTIME = "doubleGoldTime",
    CURBONUSID = "curBonusId",
    DOUBLEHURTEND = "doubleHurtEnd",
    DOUBLEHURTTIME = "doubleHurtTime",
    AUTOSHOOTEND = "autoShootEnd",
    AUTOSHOOTTIME = "autoShootTime",
    GUIDESTEP = "guideStep",
    CURARMSID = "curArmsId",
    OWNARMSID ="ownArmsId",
    BESTSCORE ="bestScore",
    TASKID ="taskId" 
}

/** 福利用到的数据结构 */
export class BonusData {
    passNum: number;
    // cfg: WelfareCfg;
    // constructor(passNum: number, cfg: WelfareCfg) {
    //     this.passNum = passNum;
    //     this.cfg = cfg;
    // }
}

/** 枪支数据结构 */
export class WeaponData {
    /** 开火速度*/
    speed :number 
    /** 伤害等级 */
    attLv: number;
    /** 获取金币等级 */
    gold: number;
    /** 休息金币获取 */
    wage: number;
    /** 生命数 */
    hp: number;
}