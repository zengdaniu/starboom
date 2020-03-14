import { Cmn } from "../frame/Cmn";
import { CfgConstants } from "../cfg/CfgConstants";
import { LevelCfg } from "../cfg/LevelCfg";
import { MonsterTeamCfg } from "../cfg/MonsterTeamCfg";
import { MonsterCfg } from "../cfg/MonsterCfg";

const { ccclass, property } = cc._decorator;

@ccclass
export default class MixedUtils {

    /**
     * 角度转向量
     * @param degree 向量角度
     * @param comVec 方向相对向量
     * @return 向量
     */
    static degreesToVec2(degree: number, comVec: cc.Vec2): cc.Vec2 {
        if (180 < degree) {
            degree = degree - 360;
        }
        let radian = cc.misc.degreesToRadians(degree);      // 将角度转换为弧度
        let dirVec = comVec.rotate(-radian);                // 将对比向量旋转给定的弧度返回一个新的向量
        return dirVec;
    }

    /**
     * 向量转角度
     * @param dirVec 方向向量
     * @param comVec 方向相对向量
     * @return 角度
     * 注意：转换出来的角度值范围为(-180~180)，使用时要注意临界值
     */
    static vec2ToDegrees(dirVec: cc.Vec2, comVec: cc.Vec2): number {
        //let radian = dirVec.signAngle(comVec);          // 求方向向量与相对向量间的弧度
        let radian = cc.v2(dirVec).signAngle(comVec);
        let degree = cc.misc.radiansToDegrees(radian);  // 将弧度转换为角度
        return (degree + 360) % 360;
    }

    /**
     * 求区间随机数
     * @param lowerValue 下限值
     * @param upperValue 上限值
     */
    static randomFrom(lowerValue, upperValue): number {
        return Math.floor(Math.random() * (upperValue - lowerValue + 1) + lowerValue);
    }

    /**
     * 根据距离获取向量上的点
     * @param start    向量起点
     * @param end      向量终点
     * @param dis      距离
     * 注意：若距离大于向量长，则返回向量终点
     */
    static v2GetPosByDis(start: cc.Vec2, end: cc.Vec2, dis: number): cc.Vec2 {
        let vec2: cc.Vec2 = end.sub(start);
        let normal: cc.Vec2 = vec2.normalize();
        let distance: number = vec2.mag();
        return dis > distance ? end : normal.mul(dis).add(start);
    }

    /**
     * 限制值在区间内
     * @param val    输入值
     * @param min    区间下限
     * @param max    区间上限
     */
    static limitVal(val: number, min: number, max: number): number {
        return val < min ? min : (val > max ? max : val);
    }

    /** 获取当前时间戳 */
    static getTimeStamp(): number {
        return new Date().getTime();
    }

    /**
     * 将秒数格式化
     * @param sec 秒数
     */
    static formatSec(sec: number): string {
        let str: string = "";
        var hour = Math.floor(sec / 3600);
        var minute = Math.floor(sec / 60) % 60;
        var second = sec % 60;
        str += 0 == hour ? "" : (10 > hour ? "0" + hour.toString() : hour.toString()) + "小时";
        str += 0 == minute && 0 == hour ? "" : (10 > minute ? "0" + minute.toString() : minute.toString()) + "分";
        str += 0 == second ? "00秒" : (10 > second ? "0" + second.toString() : second.toString()) + "秒";
        return str;
    }

    /**
     * 计算枪支攻击力
     * @param start 激活初始化属性
     * @param lvUp 升级每级属性
     * @param lv 当前等级
     * @param maxLv 最高等级
     */
    static calcAttr(start: number, lvUp: number, lv: number, maxLv: number): number {
        let realLv: number = lv > maxLv ? maxLv : lv;
        let attr: number = start + (realLv - 1) * lvUp;
        return attr;
    }

    /**
     * 获取关卡相关的资源名列表
     * @param lvCfg 关卡配置
     * @return 资源名列表
     */
    static getLvResName(lvCfg: LevelCfg): string[] {
        let resList: string[] = [];
        if (null == lvCfg) return resList;
        let mtCfg: MonsterTeamCfg = Cmn.cfg.getCfg(CfgConstants.RES_MONSTERTEAM, lvCfg.monsterTeam);
        let mCfg: MonsterCfg = null;
        let name: string = "";

        for (let k = 0; k < mtCfg.monsterId.length; ++k) {
            mCfg = Cmn.cfg.getCfg(CfgConstants.RES_MONSTER, mtCfg.monsterId[k]);
            if (null == mCfg) continue;
            name = mCfg.icon;
            for (let l = 0; l < resList.length; ++l) {
                if (name == resList[l]) {
                    name = "";
                    break;
                }
            }
            0 < name.length && resList.push(name);
        }
        return resList;
    }

    /**
     * 时间搓格式转换
     * @param timeStamp 时间搓（小数）
     * @return 时间格式 00:00 秒秒
     */
    static timeStampToSS(timeStamp: number): string {
        let s: number = Math.floor(timeStamp);
        let ss: number = timeStamp % 1 * 100;
        ss = Math.floor(ss * 3 / 5);
        return this.timeFillZero(s) + ":" + this.timeFillZero(ss);
    }

    /**
     * 时间搓格式转换
     * @param time 时间搓
     * @return 时间格式 00:00 分秒
     */
    static timeStampToMS(time: number): string {
        let m: number = Math.floor(time / 60);
        let s: number = time % 60;
        return this.timeFillZero(m) + ":" + this.timeFillZero(s);
    }

    /**
     * 时间值补零 不足两位数补0
     * @param time 时间值
     */
    static timeFillZero(time: number): string {
        let str: string = time.toString();
        if (1 < str.length) return str;
        return "0" + str;
    }
}

export class MinAndMax {
    min: number = 0;
    max: number = 0;
    get random(): number {
        if (this.min == this.max) return this.min;
        return MixedUtils.randomFrom(this.min, this.max);
    }

    constructor(min: number = 0, max: number = 0) {
        this.set(min, max);
    }

    set(min: number, max: number) {
        this.min = min;
        this.max = max;
    }
}
