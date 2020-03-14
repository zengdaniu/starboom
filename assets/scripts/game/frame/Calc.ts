export class Calc {

    private _unit: string[] = [
        "", "K", "M", "G", "B", "T",
        "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AX", "AY", "AZ",
        "BA", "BB", "BC", "BD", "BE", "BF", "BG", "BH", "BI", "BJ", "BK", "BL", "BM", "BN", "BO", "BP", "BQ", "BR", "BS", "BT", "BU", "BV", "BW", "BX", "BY", "BZ",
    ];

    private static _instance: Calc;
    static get instance(): Calc {
        if (!this._instance) {
            this._instance = new Calc;
        }
        return this._instance;
    }

    get unit() {
        return this._unit;
    }

    /**
     * 将带单位字符串转化成真实的数组
     * @param str 
     */
    strToArr(data: string): number[] {
        if (null == data || "" == data || 0 == data.length) return [0];
        if (!parseInt(data)) {
            cc.error("参数异常,data:", data);
            return [0];
        }
        let len: number = data.length;
        let unit: string = "";  // 单位
        let unitLen: number;    // 单位长度
        let time: number = 0;   // 循环检测次数
        let index: number = -1; // 单位对应下标
        let arr: number[] = []; // 数组
        let hasPoint: boolean = false;// 是否有小数点
        /**
         * 获取字符串单位对应下标
         * 取字符串后n位,强转数字
         * 如果强转有数字,证明单位长度过长,截取到数字部分了,不做处理
         * 如果强转为NaN,证明截取部分只包含单位字符,去查找一次下标就可以了
         */
        while (0 > index && time < len) {
            let cut: string = data.substring(time, len);
            if ("." == cut.substring(0, 1)) {
                hasPoint = true;
            } else if ("0" != cut.substring(0, 1)) {
                if (!parseInt(cut)) {
                    index = this._unit.indexOf(cut.toUpperCase());
                    break;
                }
            }
            time++;
        }
        /**
         * 如果检测单位后index仍然为-1,那么存在两种可能
         * 1.参数字符串不包含单位
         * 2.参数字符串包含单位,但单位不再this._unit数组里面
         * 所以下面判断最后一个字符是否为数字,如果不是就表示单位有误
         * (虽然上一步while基本可以排除第1种可能,但是再确认一遍也无妨)
         */
        let last = Number(data.substring(len - 1, len));
        if (-1 == index && !last && 0 != last) {
            cc.error("参数异常,单位不存在,data:", data);
            return [0];
        }
        // 如果是纯数字,那么单位下标就为0
        index = -1 == index ? 0 : index;
        unit = this._unit[index];
        unitLen = this._unit[index].length;
        // 为数组赋长度
        arr.length = index + 1;
        // 初始化数组
        for (let i: number = 0; i < arr.length; i++) {
            arr[i] = 0;
        }
        // 截取字符串数字部分
        let numStr: string = data.substring(0, (0 == index ? len : len - unitLen));
        // 判断是否有小数点
        if (hasPoint) {
            let strArr: string[] = numStr.split(".");
            arr[0] = Number(strArr[0]);
            let second: string = strArr[1];
            index = 1
            while (second.length > 0) {
                second = second + (1 == second.length ? "00" : 2 == second.length ? "0" : "");
                arr[index] = Number(second.substring(0, 3));
                second = second.substring(3, second.length);
                index++;
            }
            if (arr.length > this._unit.indexOf(unit) + 1) {
                cc.error("数组长度与单位长度不一致,请检查");
                return [0];
            }
        } else {
            arr[0] = Number(numStr);
        }
        arr = this.adjustNum(arr);
        cc.log("文字转换成数组返回结果为:", arr);
        return arr;
    }

    /**
     * 货币数组转换成带单位字符串
     * @param val 数组
     * @param point 是否带有小数点(一位小数点)
     */
    arrToStr(val: number[], point: boolean = false): string {
        if (null == val || 0 == val.length) return "0";
        let str: string = val[0].toString();
        if (point) {
            if (val.length >= 2) {
                str += ".";
                str += val[1] ? (Math.floor(val[1] / 100)).toString() : "0";
            }
        }
        str += this._unit[val.length - 1];
        return str;
    }

    /**
     * 根据参数,获取对应的NumInfo数据,用于比较
     * @param val 
     */
    realAllMoney(val: number[] | number): NumInfo {
        let isValArr: boolean = "object" == typeof val;
        let numInfo: NumInfo = new NumInfo();
        let num: number[] | number;
        if (isValArr) {
            num = val as number[];
            let str: string = "";
            for (let i: number = 0; i < num.length; i++) {
                str += (0 == i || 100 <= num[i]) ? num[i].toString() : 10 <= num[i] ? "0" + num[i].toString() : "00" + num[i].toString();
            }
            numInfo.val = num;
            numInfo.str = str;
        } else {
            num = val as number;
            numInfo.str = num.toString();
            while (0 != num) {
                numInfo.val.unshift(num % 1000);
                num = Math.floor(num / 1000);
            }
        }
        numInfo.valLen = numInfo.val.length;
        numInfo.strLen = numInfo.str.length;
        numInfo.unit = "" == this._unit[numInfo.val.length - 1] ? "无" : this._unit[numInfo.val.length - 1];
        return numInfo;
    }

    /**
     * 计算数值
     * @param type 计算的类型(CalcType,加减乘除)
     * @param base 基础的数值
     * @param change 变化的数值
     */
    calcNum(type: CalcType, base: number[], change: number[] | number): number[] {
        // cc.log("计算前：" + base + "~" + change);
        let isValArr: boolean = "object" == typeof change;
        let num: number[] | number;
        switch (type) {
            case CalcType.PLUS://加
                if (isValArr) {
                    num = change as number[];
                    while (num.length > base.length) {
                        base.unshift(0);
                    }
                    let i: number = 0;
                    while (i < num.length) {
                        base[base.length - i - 1] += num[num.length - i - 1]
                        ++i;
                    }
                } else {
                    base[base.length - 1] += (change as number);
                }
                return this.adjustNum(base);
            case CalcType.REDUCE://减
                let bInfo: NumInfo = this.realAllMoney(base);
                let cInfo: NumInfo = this.realAllMoney(change);
                let canReduce: boolean = false;
                if (bInfo.strLen > cInfo.strLen) {// 被减数长度大于减数长度,可以相减
                    canReduce = true;
                } else if (bInfo.strLen == cInfo.strLen) {// 被减数长度等于减数长度,还需内部判断
                    if (bInfo.str === cInfo.str) {
                        canReduce = true;
                    } else {
                        let b: number;
                        let c: number;
                        for (let i: number = 0; i < bInfo.valLen; i++) {
                            if (bInfo.val[i] >= cInfo.val[i]) {
                                canReduce = true;
                                continue;
                            } else {
                                if (i == 0) {
                                    canReduce = false;
                                    break;
                                } else if (i > 0) {
                                    canReduce = false;
                                    for (let j: number = 0; j < i; j++) {
                                        if (bInfo.val[j] > cInfo.val[j]) {
                                            canReduce = true;
                                            break;
                                        }
                                    }
                                    if (!canReduce) break;
                                }
                            }
                        }
                    }
                } else {// 被减数长度小于减数长度,不可以相减
                    canReduce = false;
                }
                if (canReduce) {
                    let count: number = 0;
                    while (count < cInfo.valLen) {
                        base[base.length - 1 - count] -= cInfo.val[cInfo.valLen - 1 - count];
                        ++count;
                    }
                    return this.adjustNum(base);
                } else {
                    cc.error("不足相减");
                    return [-1];
                }
            case CalcType.RIDE://乘
                if (isValArr) {
                    cc.error("功能未实现");
                    return base;
                } else {
                    for (let i: number = 0; i < base.length; i++) {
                        base[i] *= (change as number);
                    }
                }
                return this.adjustNum(base);
            case CalcType.EXCEPT://除
                cc.error("功能未实现");
                return base;
        }
    }

    /**
     * 调整数组中每个值的大小
     * @param base 
     */
    adjustNum(base: number[]): number[] {
        let num: number = 0;
        let less: boolean = false;
        for (let i: number = base.length - 1; i >= 0; i--) {
            base[i] += num;
            less = base[i] < 0;
            if (0 == i && 0 == base[0]) {
                base.shift();
            }
            if (less) {
                num = -Math.ceil(Math.abs(base[i]) / 1000);
                base[i] = 1000 - Math.abs(base[i] % 1000);
            }
            else {
                num = Math.floor(base[i] / 1000);
                if (num) {
                    base[i] = base[i] % 1000;
                    if (0 == i && 0 != num) {
                        base.unshift(num);
                    }
                }
            }
        }
        while (1000 <= base[0]) {
            num = Math.floor(base[0] / 1000);
            base[0] = base[0] % 1000;
            base.unshift(num);
        }
        // cc.log("计算后：" + base);
        return base;
    }
}

export enum CalcType {
    /** 加 */
    PLUS = 1,
    /** 减 */
    REDUCE = 2,
    /** 乘 */
    RIDE = 3,
    /** 除 */
    EXCEPT = 4,
}

export class NumInfo {
    /** 值所对应的数组 */
    val: number[] = [];
    /** 数组的长度 */
    valLen: number;
    /** 值转换的字符串 */
    str: string;
    /** 字符串长度 */
    strLen: number;
    /** 单位 */
    unit: string;
}