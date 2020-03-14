const { ccclass, property } = cc._decorator;;

@ccclass
export class AudioMgr {
    /**
     * 是否激活音乐的标志
     * 如果这里设置为false,那么整个项目里面都不会存在声音
     */
    private _isActive: boolean = true;

    static _instance: AudioMgr;
    static get instance() {
        if (!this._instance) {
            this._instance = new AudioMgr();
        }
        return this._instance;
    }

    static MUSIC_FIGHT = "startBG";
    static EFF_SHOOT = "shoot1";
    static EFF_HIT = "game_over";
    static EFF_BUTTON = "bottonBtn";
    static EFF_SWITCH = "Switch";
    static EFF_DEATH = "game_over";
    static EFF_BOMB1 = "explosion1";
    static EFF_BOMB2 = "explosion2";
    static EFF_BOMB3 = "explosion3";
    static GET_COIN = "coin";

    private _isBg: boolean = false;// 是否切换后台
    private _isMute: boolean = false;// 是否静音    
    private _maxVolume: number = 1.0;// 最大音量
    private _minVolume: number = 0.0;// 最小音量

    private _mPool: any = {};
    private _mVolume: number = 1.0;// 音乐声音大小
    private _mVolumeBak: number = 0;// 音乐声音大小备份
    private _mMute: boolean = false;// 音乐是否静音
    private _curMName: string = "";// 当前播放的音乐名字
    private _catchMName: string = "";// 捕获到的音乐名字

    private _ePool: any = {};
    private _eVolume: number = 1.0;// 音效声音大小
    private _eVolumeBak: number = 0;// 音效声音大小备份
    private _eMute: boolean = false;// 音效是否静音
    private _curEName: string = "";// 当前播放的音效名字

    /** 切入后台 */
    enterBg() {
        this._isBg = true;
        this.pauseAll();
        this._catchMName = "";
    }

    /** 切入前台 */
    enterFg() {
        this._isBg = false;
        this.resumeAll();
        0 < this._catchMName.length && this.playMusic(VolumeType.MUSIC, this._catchMName, true);
        this._catchMName = "";
    }

    /**
     * 获取声音大小
     * @param type 获取类型
     */
    getVolume(type: VolumeType) {
        return type = VolumeType.MUSIC ? this._mVolume : this._eVolume;
    }

    /**
     * 设置声音大小
     * @param type 设置类型
     * @param value 大小 范围0.0~1.0
     */
    setVolume(type: VolumeType, value: number) {
        let val: number = this._minVolume > value ? 0 : this._maxVolume < value ? 1 : value;
        let pool: any;
        if (type == VolumeType.MUSIC) {
            this._mVolume = val;
            pool = this._mPool;
        } else {
            this._eVolume = val;
            pool = this._ePool;
        }
        for (let key in pool) {
            cc.audioEngine.setVolume(pool[key], val);
        }
    }

    /**
     * 获取是否静音
     * @param type 获取类型
     */
    getMute(type: VolumeType) {
        return type == VolumeType.MUSIC ? this._mMute : this._eMute;
    }

    /**
     * 设置是否静音
     * @param type 设置类型
     * @param value 
     */
    setMute(type: VolumeType, value: boolean) {
        if (type == VolumeType.MUSIC) {
            this._mMute = value;
            if (this._mMute) {
                this._mVolumeBak = this._mVolume;
                this._mVolume = 0;
                this.pauseMusic(this._curMName);
            } else {
                this._mVolume = this._mVolumeBak;
                this.resumeMusic(this._curMName);
            }
        } else {
            this._eMute = value;
            if (this._eMute) {
                this._eVolumeBak = this._eVolume;
                this._eVolume = 0;
            } else {
                this._eVolume = this._eVolumeBak;
            }
        }
    }

    /**
     * 设置全局是否静音
     * @param value 
     */
    setMuteAll(value: boolean) {
        this.setMute(VolumeType.MUSIC, value);
        this.setMute(VolumeType.EFFECT, value);
    }

    /**
     * 恢复播放
     * @param name 
     */
    resumeMusic(name: string) {
        if (this._mPool[name] >= 0) {
            cc.audioEngine.resume(this._mPool[name]);
        }
    }

    /**
     * 暂停播放
     * @param name 
     */
    pauseMusic(name: string) {
        if (this._mPool[name] >= 0) {
            cc.audioEngine.pause(this._mPool[name]);
        }
    }

    /**
     * 停止播放
     * @param name 
     */
    stopMusic(name: string) {
        if (this._mPool[name] >= 0) {
            cc.audioEngine.stop(this._mPool[name]);
            delete this._mPool[name];
            if (name == this._curMName) {
                this._curMName = "";
            }
        }
    }

    /** 恢复全部 */
    private resumeAll() {
        cc.audioEngine.resumeAll();
    }

    /** 暂停全部 */
    private pauseAll() {
        cc.audioEngine.pauseAll();
    }

    /** 停止全部 */
    private stopAll() {
        cc.audioEngine.stopAll();
    }

    /** 卸载全部 */
    private uncacheAll() {
        cc.audioEngine.uncacheAll();
    }

    /**
     * 播放音乐
     * @param type 播放类型
     * @param name 音效名字
     * @param loop 是否循环
     */
    playMusic(type: VolumeType, name: string, loop: boolean = false) {
        if (!this._isActive) return;
        let self = this;
        let pool: any;
        let volume: number;
        if (type == VolumeType.MUSIC) {
            // 后台状态记录名字
            if (this._isBg) {
                this._catchMName = name;
                return;
            }
            // 音乐静音不播放
            if (name == this._curMName || this._mMute) return;
            pool = this._mPool;
            volume = this._mVolume;
            // 先将之前的音乐停掉
            this.stopMusic(this._curMName);
        } else {
            // 后台状态和音效静音不播放
            if (this._isBg || this._eMute) return;
            pool = this._ePool;
            volume = this._eVolume;
        }
        cc.loader.loadRes("audio/" + name, cc.AudioClip, function (err, clip) {
            if (null == err) {
                let audioId: number = cc.audioEngine.play(clip, loop, volume);
                pool[name] = audioId;
                if (type == VolumeType.MUSIC) self._curMName = name;
            } else {
                cc.error(err);
            }
        });
        this.resumeAll();
    }

    stopEff(name: string) {
        if (this._ePool[name] >= 0) {
            cc.audioEngine.stop(this._ePool[name]);
            delete this._ePool[name];
        }
    }

    stopAllEff() {
        for (const key in this._ePool) {
            cc.audioEngine.stop(this._ePool[key]);
        }
        this._ePool = {}
    }

    get curMName() {
        return this._curMName;
    }
};

export enum VolumeType {
    MUSIC = 1,
    EFFECT = 2,
}