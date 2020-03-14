export class Evt {
    static CONNECT: string = "connect";
    static DATA: string = "data";
    static CLOSE: string = "close";
    static ERROR: string = "error";
    static SEND: string = "send";

    private _type: string = "";

    constructor(type: string) {
        this._type = type;
    }

    get type(): string {
        return this._type;
    }
}