import { EvtDpc } from "../base/EvtDpc";
import { LoadResEvt } from "../base/LoadResEvt";

const { ccclass, property } = cc._decorator;

@ccclass
export class Res extends EvtDpc {
    static _instance: Res = null;
    static get instance(): Res {
        if (!this._instance) {
            this._instance = new Res();
        }
        return this._instance;
    }

    static PATH_ICON: string = "/img/mainUI/";                                    // icon路径
    static CURRENCY_ICON: string[] = ["", "Icon_Gold", "Icon_Diamond"];         // 货币icon
    static PATH_ACTOR: string = "/fight/actor/";         // 对象路径
    static PATH_FIGHT_ENEMY: string = "/fight/enemy/";         // 战斗中骨骼动画路径
    static PATH_MAP: string = "/fight/map/";         // 地图资源
    static PATH_FIGHT_UI: string = "/fight/ui/";         // 战斗中ui
    static PATH_FIGHT_EFF: string = "/fight/effect/";         // 战斗中特效
    static PATH_SHOP: string = "/img/shop/";         // 商店图片
    static PATH_MAINUI: string = "/img/mainUI/";         // 主UI

    /** 资源类型 */
    static RES_T_PFB: string = "prefab";
    static RES_T_TXT: string = "text";
    static RES_T_PLS: string = "plist";
    static RES_T_IMG: string = "image";
    static RES_T_TMX: string = "tmx";
    static RES_T_SPINE: string = "skeleton";

    /** 加载列表完成回调 */
    private _completeCallback: Function;
    /** 加载列表完成回调指针 */
    private _completeTarget = null;
    /** 加载列表完成回调参数 */
    private _completeArgs: any[] = [];
    /** 当前加载器是否正在执行回调（主要解决回调时添加新的加载序列，导致原加载逻辑异常问题） */
    private _completeCalling: boolean = false;
    /** 当前加载列表 */
    private _nowloadList: any[] = [];
    /** 当前加载列表名字 */
    private _nowloadName: string = "";
    /** 下一个加载列表 */
    private _nextLoadList: any[] = [];
    /** 加载列表队列 */
    private _loadListQueue: any[] = [];
    /** 加载列表数量 */
    private _loadListCount: number = 0;
    /** 正在加载项 */
    private _nowLoadItem = null;
    /** 资源列表 */
    private _resList = {};
    /** 标记是否正在loadRes */
    private _isLoading: boolean = false;
    /** 加载进来的spriteFrame列表， 用路径作为key保存起来，每次加载的时候先判断里面有没有，没有再加载 */
    private _spriteFrameList = {};
    private _checkSpriteFrame = {};
    private _nameToUrlMap = {};
    private _typeToUrlMap = {};


    resIsExists(name: string): boolean {
        return null != this._resList[name];
    }

    /** 添加加载列表项，name要是唯一的，url是相对resources的路径，只能使用正斜杠，要与load()方法同时使用 */
    addRes(name: string, url: string, type: string = Res.RES_T_PFB, version: string = "") {
        if (this._resList[name]) {
            cc.log("the name [%s] in resource list is exists", name);
            return;
        }
        let data = { name: name, url: url, type: type, version: version };
        this._nameToUrlMap[name] = url;
        this._typeToUrlMap[name] = type;
        //去除加载列表里面重复添加的
        for (let i: number = 0; i < this._nowloadList.length; i++) {
            if (name == this._nowloadList[i].name) {
                cc.log("the name [%s] in now load list is exists", name);
                return;
            }
        }
        if (this._nowLoadItem) {
            if (name == this._nowLoadItem.name) {
                cc.log("the name [%s] in now load list is exists", name);
                return;
            }
        }
        if (this._isLoading || this._completeCalling) {
            //去除加载列表队列里面重复添加的
            for (let j: number = 0; j < this._loadListQueue.length; j++) {
                for (let k: number = 0; k < this._loadListQueue[j].length; k++) {
                    if (name == this._loadListQueue[j][k].name) {
                        cc.log("the name [%s] in next load list is exists", name);
                        return;
                    }
                }
            }
            this._nextLoadList.push(data);
            cc.log("In loading, add resource to next load list > %s", JSON.stringify(data));
        }
        else {
            this._nowloadList.push(data);
            cc.log("add resource to now load list> %s", JSON.stringify(data));
        }
    }

    /** 要与addRes()方法同时使用,调用Common.ui.showLoading()可以显示加载进度 */
    load(cb: Function, target: any, args: any[], name: string = "") {
        cc.log("start load");
        if (this._isLoading || this._completeCalling) {
            //如果两次回调一样，就把两个列表合并
            if (this._completeCallback == cb && this._completeTarget == target && this._nowloadName == name) {
                while (this._nextLoadList.length > 0) {
                    this._nowloadList.push(this._nextLoadList.shift());
                }
            }
            else {
                this._loadListQueue.push({ loadList: this._nextLoadList, completeTarget: target, completeCallback: cb, cbArgs: args, tag: name });
                this._nextLoadList = [];
            }
        }
        else {
            this._completeCallback = cb;
            this._completeTarget = target;
            this._completeArgs = args;
            this._loadListCount = this._nowloadList.length;
            this._nowloadName = name;
            this.dpcEvt(new LoadResEvt(LoadResEvt.START));
            this.loadNext();
        }
    }

    private loadNext() {
        this._isLoading = true;
        //判断当前加载列表是否加载完成
        if (this._nowloadList.length <= 0) {
            this._isLoading = false;
            this._nowLoadItem = null;
            this._loadListCount = 0;
            this.dpcEvt(new LoadResEvt(LoadResEvt.FINISH, this._nowloadName));
            cc.log("load resource list finish");
            if (this._completeCallback) {
                this._completeCalling = true;
                this._completeCallback.apply(this._completeTarget, this._completeArgs);
                this._completeCalling = false;
            }
            //判断是否还有加载列表
            if (this._loadListQueue.length > 0) {
                let item = this._loadListQueue.shift();
                this._nowloadList = item.loadList;
                this.load(item.completeCallback, item.completeTarget, item.cbArgs, item.tag);
            }
            return;
        }
        this._nowLoadItem = this._nowloadList.shift();
        if (this._nowLoadItem) {
            if (this._nowLoadItem.type == Res.RES_T_PFB) {
                cc.loader.loadRes(this._nowLoadItem.url, cc.Prefab, this.itemProgressCallback.bind(this), this.itemCompleteCallback.bind(this));
            } else if (this._nowLoadItem.type == Res.RES_T_PLS) {
                cc.loader.loadRes(this._nowLoadItem.url, cc.SpriteAtlas, this.itemProgressCallback.bind(this), this.itemCompleteCallback.bind(this));
            } else if (this._nowLoadItem.type == Res.RES_T_TMX) {
                cc.loader.loadRes(this._nowLoadItem.url, cc.TiledMapAsset, this.itemProgressCallback.bind(this), this.itemCompleteCallback.bind(this));
            } else if (this._nowLoadItem.type == Res.RES_T_SPINE) {
                cc.loader.loadRes(this._nowLoadItem.url, sp.SkeletonData, this.itemProgressCallback.bind(this), this.itemCompleteCallback.bind(this));
            } else if (this._nowLoadItem.type == Res.RES_T_IMG) {
                cc.loader.loadRes(this._nowLoadItem.url, cc.SpriteFrame, this.itemProgressCallback.bind(this), this.itemCompleteCallback.bind(this));
            } else {
                cc.loader.loadRes(this._nowLoadItem.url, this.itemProgressCallback.bind(this), this.itemCompleteCallback.bind(this));
            }
        }
        cc.log("load resource > %s", JSON.stringify(this._nowLoadItem));
    }

    private itemProgressCallback(completedCount: number, totalCount: number, item: any) {
        let event = new LoadResEvt(LoadResEvt.PROGRESS);
        event.name = this._nowLoadItem.name;
        event.totalCount = this._loadListCount;
        event.completedCount = this._loadListCount - this._nowloadList.length - 1;
        event.itemCompletedCount = completedCount;
        event.itemTotalCount = totalCount;
        this.dpcEvt(event);
        cc.log("[%d/%d](%d/%d) load resource > %s", event.completedCount, event.totalCount, event.itemCompletedCount, event.itemTotalCount, JSON.stringify(this._nowLoadItem));
        // cc.log("[%d/%d](%d/%d) load resource > name = %s, url = %s", event.completedCount, event.totalCount, event.itemCompletedCount, event.itemTotalCount, item.content.name, item.url);
    }

    private itemCompleteCallback(err: Error, resource: any) {
        if (err) {
            this.dpcEvt(new LoadResEvt(LoadResEvt.ERROR, this._nowLoadItem.name));
            cc.warn("load resource error > %s", JSON.stringify(this._nowLoadItem));
        }
        else {
            this._resList[this._nowLoadItem.name] = resource;
            if (Res.RES_T_IMG == this._nowLoadItem.type) {
                this._spriteFrameList[this._nowLoadItem.url] = resource;
            }
            let event = new LoadResEvt(LoadResEvt.COMPLETE);
            event.name = this._nowLoadItem.name;
            event.totalCount = this._loadListCount;
            event.completedCount = this._loadListCount - this._nowloadList.length;
            this.dpcEvt(event);
            cc.log("load resource complete > %s", JSON.stringify(this._nowLoadItem));
        }
        //加载下一项
        this.loadNext();
    }

    clearRes(name: string, release: boolean = true) {
        if (this._resList[name] && release) {
            cc.loader.release(this._resList[name]);
        }
        delete this._resList[name];
    }

    getData(name, autodel = true, delSkeTex = true, canNull: boolean = false) {
        let res = this._resList[name];
        if (autodel) {
            cc.loader.releaseRes(this._nameToUrlMap[name], null, delSkeTex);
            delete this._resList[name];
        }
        if (!res) {
            cc.warn("resource getData failed:" + name);
            //canNull && (res = new cc.Node());
        }
        return res;
    }

    releaseData(name) {
        let item = this._nameToUrlMap[name];
        let type = this._typeToUrlMap[name];
        if (type == Res.RES_T_PFB) {
            cc.loader.releaseRes(item, cc.Prefab);
        } else if (type == Res.RES_T_PLS) {
            cc.loader.releaseRes(item, cc.SpriteAtlas);
        } else if (type == Res.RES_T_TMX) {
            cc.loader.releaseRes(item, cc.TiledMapAsset);
        } else if (type == Res.RES_T_SPINE) {
            cc.loader.releaseRes(item, sp.SkeletonData);
        } else if (type == Res.RES_T_IMG) {
            cc.loader.releaseRes(item, cc.SpriteFrame);
            delete this._spriteFrameList[name];
        } else {
            cc.loader.releaseRes(item, null);
        }
        delete this._resList[name];
        delete this._nameToUrlMap[name];
        delete this._typeToUrlMap[name];
    }

    /**
     * 
     * @param path 
     * @param sprite 
     * @param target 
     * @param cb 
     */
    setSprite(path: string, sprite: cc.Sprite, target?: any, cb?: Function) {
        // 判断路径非空
        if (path == null || path == "") {
            cc.log("path is empty");
            return;
        }
        // 去资源列表中找图片,找到就不加载图片
        let ob = this._spriteFrameList[path];
        if (null != ob) {
            if (sprite && sprite.isValid) {
                sprite.spriteFrame = ob;
                sprite.spriteFrame.ensureLoadTexture();
                if (this._checkSpriteFrame.hasOwnProperty(sprite.uuid)) {
                    delete this._checkSpriteFrame[sprite.uuid];
                }
            }
            if (target && cb) {
                cb.call(target);
            }
            return;
        }
        // 将路径加到字典中以后检测用
        if (path != null && path != "" && null != sprite) {
            this._checkSpriteFrame[sprite.uuid] = this.getSpritePathName(path);
        }
        // 加载图片资源
        let self = this;
        cc.loader.loadRes(path, cc.SpriteFrame, function (error: Error, spriteFrame: cc.SpriteFrame) {
            if (error) {
                cc.error("load spriteFrame fail , path : " + path);
            }
            else {
                if (sprite && sprite.isValid) {
                    if (null != self._checkSpriteFrame[sprite.uuid] && null != spriteFrame && self._checkSpriteFrame[sprite.uuid] == spriteFrame.name) {
                        sprite.spriteFrame = spriteFrame;
                        if (self._checkSpriteFrame.hasOwnProperty(sprite.uuid)) {
                            delete self._checkSpriteFrame[sprite.uuid];
                        }
                    }
                }
                self._spriteFrameList[path] = spriteFrame;
                self = null;
            }
            if (target && cb) {
                cb.call(target);
            }
        });
    }

    /**
     * 根据图片的路径,获取图片的名字
     * @param path 
     */
    getSpritePathName(path: string): string {
        let str: string[] = path.split("/");
        return str[str.length - 1];
    }
}