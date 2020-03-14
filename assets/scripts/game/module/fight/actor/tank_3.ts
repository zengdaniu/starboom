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
    fire: cc.Sprite[] = [];

    private _pipeVec:cc.Vec2 = null;
    private _tmpX :number =0;
    private _newX :number =0;
    private _fireGap :number =0.2;
    private _curTime :number =0;
    private _bulletAngles :number[][] = [[],[0],[10,-10],[20,0,-20],[20,10,-10,-20]];
    
    onLoad(){
        this._pipeVec = this.head.node.getPosition();        
    }
    getBoxSize():any{
        return cc.v2(60,150) ;
    }
    getFirePos():any{
        return cc.v2(6,88) ;
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
        this._newX =move ; 
    }
    move(){
        let angle :number =0;
        if(this._tmpX < this._newX)
        {
            angle = -10
        }
        else if(this._tmpX>this._newX){
            angle = 10
        }
        this._tmpX = this._newX;
        this.fire.forEach(element => {
            element.node.angle=angle ;
        });
    }
    update(dt){
        this._curTime +=dt;
        if(this._curTime>this._fireGap){
            this.move();
            let scale :number =1;
            this._curTime = 0;
            if(this.fire[0].node.scale == 1){
                scale=0.8;
            }
            this.fire.forEach(element => {
                element.node.scale =scale ;
            });
        }
    }
}