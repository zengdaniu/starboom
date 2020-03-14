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
    pipe :cc.Sprite=null;
    @property([cc.Sprite])
    wheel: cc.Sprite[] = [];

    private _pipeVec:cc.Vec2 = null;
    private _bulletPos :number[][] = [[],[0],[3,-3],[6,0,-6,],[9,3,-3,-9]];
    getBoxSize():any{
        return cc.v2(110,50) ;
    }
    getFirePos():any{
        return cc.v2(-8,54) ;
    }
    onLoad(){
        this._pipeVec = this.pipe.node.getPosition();        
    }
    
    shootEff(start:Boolean) {  
        if(start)
            this.pipe.node.y =this._pipeVec.y-10;
        else
            this.pipe.node.setPosition(this._pipeVec);
    }
    setXDirMove(move:number){
        let angle = -(move / 157) * 360;  //157=2r*3.14
        this.wheel[0].node.angle=angle ;
        this.wheel[1].node.angle=angle ;
        this.wheel[2].node.angle=angle ;
         
    }
    shootBullet(num :number, pos: cc.Vec2, speed: number, attVal: number,headVal: number, critVal: number, ejection: Buff){
        for (let i = 0; i < this._bulletPos[num].length; ++i) {
            let tempos: cc.Vec2= new cc.Vec2(pos.x+this._bulletPos[num][i],pos.y) ;
            this._actorMgr.addBullet(1, tempos, 0, MixedUtils.degreesToVec2(-0, cc.v2(0,1)),
            speed, attVal,headVal, critVal, ejection);
            //angle += 20;
        }
    }

    // updata(){

    // }
}