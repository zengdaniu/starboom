import { Evt } from "./Evt";
import { GameSprite } from "./GameSprite";

export class ModuleCtrlEvt extends Evt {
    /** 加载模块资源中 */
    static LOADIGN: string = "loading";
    /** 打开场景 */
    static OPEN_SCENE: string = "openScene";
    /** 打开窗口 */
    static OPEN_WINDOW: string = "openWindow";
    /** 打开特效播放完毕 */
    static OPEN_WINDOW_FINISH: string = "openWindowFinish";
    /** 关闭场景 */
    static CLOSE_SCENE: string = "closeScene";
    /** 关闭窗口 */
    static CLOSE_WINDOW: string = "closeWindow";
    private _module: GameSprite = null;

    get module(): GameSprite {
        return this._module;
    }

    set module(value: GameSprite) {
        this._module = value;
    }

    constructor(control: string, module: GameSprite) {
        super(control);
        this._module = module;
    }
}