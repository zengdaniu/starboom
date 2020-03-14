import { UIMgr } from "./UIMgr";
import { Res } from "./Res";
import { Cfg } from "./Cfg";
import { UserData } from "./UserData";
import { Platform } from "../pt/Platform";
import { Calc } from "./Calc";
import { AudioMgr } from "./AudioMgr";

export class Cmn {
    static debug: boolean = false;
    static ui: UIMgr;
    static res: Res;
    static cfg: Cfg;
    static ud: UserData;
    static pf: Platform;
    static calc: Calc;
    static audio: AudioMgr;
}