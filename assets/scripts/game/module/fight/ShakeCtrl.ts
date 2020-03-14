import MixedUtils from "../../utils/MixedUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ShakeCtrl extends cc.Component {

    private readonly _maxAmplitude: number = 0.4;
    private readonly _baseVal: number = 0.15;
    private readonly _subVal: number = 0.004;
    private readonly _addVal: number = 0.1;
    private readonly _maxDuration: number = 0.3;
    private readonly _baseDuration: number = 0.1;
    private readonly _addDuration: number = 0.1;

    private _curDuration: number = 0;
    private _isPlay: boolean = false;
    private _curAmplitude: number = 0;
    private _dir: number = -1;

    private _isPlayUpDown = false;
    private _upDowndDuration :number = 0.5;
    private _curUpDowndDuration :number = 0;
    private _upDownLevel:number[] =[10,15,20,35];
    onEnable() {
        this._isPlay = false;
    }

    play(isMax: boolean) {
        if (isMax) {
            this._curAmplitude = this._maxAmplitude;
            this._curDuration = this._maxDuration;
        } else {
            this._curAmplitude = (this._isPlay ? this._curAmplitude + this._addVal : this._baseVal);
            this._curAmplitude = (this._curAmplitude > this._maxAmplitude ? this._maxAmplitude : this._curAmplitude);
            this._curDuration = (this._isPlay ? this._curDuration + this._addDuration : this._baseDuration);
            this._curDuration = (this._curDuration > this._maxDuration ? this._maxDuration : this._curDuration);
        }
        this._isPlay = true;
    }
    updatePlay(dt){
        if (!this._isPlay) return;
        this._dir *= -1;
        this._curDuration -= dt;
        this._curAmplitude -= this._subVal;
        this._isPlay = (0 < this._curDuration);
        this.node.angle = this._isPlay ? this._dir * MixedUtils.randomFrom(0.1, this._curAmplitude) : 0;
    }

    playUpDown(level: number) {
        this._isPlayUpDown = true;
        if(this.node.y > -this._upDownLevel[level])
            this.node.y = -this._upDownLevel[level];
    }
    updataUpDown(dt){
        if(!this._isPlayUpDown) return;
        this.node.y += dt*100;
        if(this.node.y >=0){
            this.node.y = 0;
            this._isPlayUpDown =false;
        }
    }
    

    update(dt) {
        this.updatePlay(dt);
        this.updataUpDown(dt);
    }
}
