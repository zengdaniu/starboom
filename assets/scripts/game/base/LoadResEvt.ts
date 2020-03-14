import { Evt } from "./Evt";

export class LoadResEvt extends Evt {
    /** 开始加载 */
    static START: string = "loadResStart";
    /** 完成所有加载 */
    static FINISH: string = "loadResFinish";
    /** 完成一次加载 */
    static COMPLETE: string = "loadResComplete";
    /** 完成一次最小的加载 */
    static PROGRESS: string = "loadResProgress";
    /** 出错 */
    static ERROR: string = "loadResError";
    /** 加载项键 */
    name: string = "";
    /** 加载列表总数量 */
    totalCount: number = 0;
    /** 加载列表完成数量 */
    completedCount: number = 0;
    /** 加载项总数量 */
    itemTotalCount: number = 0;
    /** 加载项完成数量 */
    itemCompletedCount: number = 0;

    constructor(type: string, name: string = "", completedCount: number = 0, totalCount: number = 0, itemCompletedCount: number = 0, itemTotalCount: number = 0) {
        super(type);
        this.name = name;
        this.completedCount = completedCount;
        this.totalCount = totalCount;
        this.itemCompletedCount = itemCompletedCount;
        this.itemTotalCount = itemTotalCount;
    }
}
