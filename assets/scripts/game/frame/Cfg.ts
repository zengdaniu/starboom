import { Res } from "./Res";
import { Cmn } from "./Cmn";
import { CfgConstants } from "../cfg/CfgConstants";
import { GunUpCfg } from "../cfg/GunUpCfg";

export class Cfg {
    private static _instance: Cfg = null;
    static get instance(): Cfg {
        if (this._instance == null) this._instance = new Cfg();
        return this._instance;
    }

    private _cb: Function = null;
    private _target = null;
    private _cfgObject: object = {};

    /**
     * 添加配置到加载队列
     * @param name 名字
     * @param path 路径
     * @param type 类型
     */
    private addCfgRes(name: string, path: string = "txt", type: string = Res.RES_T_TXT) {
        Cmn.res.addRes(name, "config/" + path + "/" + name, type);
    }

    /**
     * 加载配置
     * @param cb 
     * @param target 
     */
    loadCfg(cb?: Function, target?: any) {
        this._cb = cb;
        this._target = target;
        let names: Array<string> = CfgConstants.getAllCfgName;
        for (let i: number = 0; i < names.length; i++) {
            this.addCfgRes(names[i]);
        }
        Cmn.res.load(this.loadCfgCB, this, null);
    }

    /** 配置加载完成回调 */
    private loadCfgCB() {
        this._cfgObject = {};
        let names: Array<string> = CfgConstants.getAllCfgName;
        for (let i: number = 0; i < names.length; i++) {
            this.initTxtCfg(names[i]);
        }
        if (this._cb) {
            this._cb.apply(this._target);
            this._cb = this._target = null;
        }
        Cmn.ui.loadCfgCB();
    }

    /**
     * 解析TXT格式配置
     * @param name 名字
     */
    private initTxtCfg(name: string) {
        let cfgClass: any = CfgConstants.getCfgToName(name);
        let strList: Array<string> = Cmn.res.getData(name, false).text.split("\r\n");
        let tsCfg: any;
        let tsObj: object = {};
        for (let i: number = 0; i < strList.length; i++) {
            if (strList[i] == "") continue;
            tsCfg = new cfgClass(strList[i]);
            tsObj[tsCfg.id] = tsCfg;
        }
        this._cfgObject[name] = tsObj;
        return;
    }

    /**
     * 获取某个配置文件的所有内容
     * @param name 
     */
    getCfgObj(name: string): any {
        return this._cfgObject[name];
    }

    /**
     * 根据ID获取表的相应配置
     * @param name 表名
     * @param id 
     * @param err 报错打印
     */
    getCfg(name, id, err: boolean = true): any {
        let cfg = this._cfgObject[name][id];
        if (null != cfg) return cfg;
        err && cc.error(name + " can not find by id : " + id);
        return undefined;
    }

    getWeaponGRByIDLV(gunId: number, lv: number, err: boolean = true): GunUpCfg {
        let cfgAtt = this.getCfgObj(CfgConstants.RES_GUNUP);
        let cfg: GunUpCfg = null;
        for (const key in cfgAtt) {
            cfg = cfgAtt[key];
            if (gunId == cfg.gunId && lv == cfg.level) {
                return cfg;
            }
        }
        err && cc.error(name + " can not find by gunId = " + gunId + " and lv = " + lv);
        return undefined;
    }
}