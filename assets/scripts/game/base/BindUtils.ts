import { DataChEvt } from "./DataChEvt";

export class BindUtils {
    private static __index = 0;
    private static __hosts = {};

    private _index;
    private _sHost;
    private _sProp;
    private _setter;
    private _target;

    constructor(index, eventDispatcher, prop, func, target) {
        this._index = index;
        this._sHost = eventDispatcher;
        this._sProp = prop;
        this._setter = func;
        this._target = target;
        this.bind();
    }

    bind() {
        if (this._sHost) {
            this._sHost.addListener(DataChEvt.CHANGE, this.dataChangeHander, this);
        }
    }

    dataChangeHander(event) {
        if (event.valueName == this._sProp) {
            if (this._setter) {
                this._setter.apply(this._target, [event.newValue]);
            }
        }
    }

    static bindSetter(func, target, eventDispatcher, eventType): BindUtils {
        var total = BindUtils.__index + 1;
        BindUtils.__index = total;
        var bind: BindUtils = new BindUtils(BindUtils.__index, eventDispatcher, eventType, func, target);
        BindUtils.__hosts[BindUtils.__index] = bind;
        return bind;
    }

    unbind() {
        if (this._sHost) {
            this._sHost.delListener(DataChEvt.CHANGE, this.dataChangeHander, this);
        }
    }

    clear() {
        this.unbind();
        this._sHost = null;
        this._setter = null;
        this._target = null;
        this._sProp = null;
        delete BindUtils.__hosts[this._index];
    }

    static allUnbind() {
        var host = null;
        for (host in BindUtils.__hosts) {
            BindUtils.__hosts[host].clear();
        }
        BindUtils.__index = 0;
        BindUtils.__hosts = {};
    }
}
