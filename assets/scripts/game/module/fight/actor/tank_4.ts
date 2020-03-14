import Actor, { ActorState, DirType } from "./Actor";
import MixedUtils from "../../../utils/MixedUtils";
import Player from "./Player";
import { Cmn } from "../../../frame/Cmn";
import { VolumeType, AudioMgr } from "../../../frame/AudioMgr";
import { WeaponData, UserDB } from "../../../frame/UserData";
import Buff from "./Buff";
const { ccclass, property } = cc._decorator;

@ccclass
export default class tank_1 extends Player{
    @property(cc.Sprite)
    head :cc.Sprite=null;
    @property([cc.Sprite])
    fire: cc.Sprite[] =[];

    private _pipeVec:cc.Vec2 = null;
    private _tmpX :number =0;
    private _newX :number =0;
    private _fireGap :number =0.3;
    private _curTime :number =0;
    private _curIndex :number =0;
    private _bulletAngles :number[][] = [[],[0],[10,-10],[15,0,-15],[20,10,-10,-20]];
    
    onLoad(){
        this._pipeVec = this.head.node.getPosition();  
    }

    getBoxSize():any{
        return cc.v2(50,150) ;
    }
    getFirePos():any{
        return cc.v2(3,88) ;
    }
    shootEff(start:Boolean) {  
        if(start)
            this.head.node.y =this._pipeVec.y-10;
        else
            this.head.node.setPosition(this._pipeVec);
    }
    shootBullet(num :number, pos: cc.Vec2, speed: number, attVal: number,headVal: number, critVal: number, ejection: Buff){
        for (let i = 0; i < this._bulletAngles[num].length; ++i) {
            let angle: number = this._bulletAngles[num][i];
            this._actorMgr.addBullet(1, pos, angle, MixedUtils.degreesToVec2(-angle, cc.v2(0,1)),
            speed, attVal,headVal, critVal, ejection);
        }
    }
    setXDirMove(move:number){
        
    }
    move(){
        
    }
    update(dt){
        this._curTime +=dt;
        if(this._curTime>this._fireGap){
            this._curTime =0 ;
            this.fire[this._curIndex].node.active =false;
            this._curIndex=(this._curIndex + 1)%this.fire.length ;
            this.fire[this._curIndex].node.active =true;
        }
    }
}