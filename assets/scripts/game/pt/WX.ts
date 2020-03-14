import { Cmn } from "../frame/Cmn";

export class WX {

    private static _instance: WX = null;
    static get instance(): WX {
        if (this._instance == null) this._instance = new WX();
        return this._instance;
    }

    init() {
        Cmn.ud.checkLocal();
    }
}