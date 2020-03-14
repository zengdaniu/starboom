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
    hand: cc.Sprite[] = [];

    private _pipeVec:cc.Vec2 = null;
    private _bulletAngles :number[][] = [[],[0],[5,-5],[10,0,-10],[15,5,-5,-15]];
    
    onLoad(){
        this._pipeVec = this.head.node.getPosition();        
    }
    
    getBoxSize():any{
        return cc.v2(70,110) ;
    }
    getFirePos():any{
        return cc.v2(6,65) ;
    }
    shootEff(start:Boolean) {  
        if(start)
            this.head.node.y =this._pipeVec.y-10;
        else
            this.head.node.setPosition(this._pipeVec);
    }
    shootBullet(num :number, pos: cc.Vec2, speed: number, attVal: number,headVal: number, critVal: number, ejection: Buff){
        for (let i = 0; i < this._bulletAngles[num].length; ++i) {
            let tempos: cc.Vec2= new cc.Vec2(pos.x+this._bulletAngles[num][i],pos.y) ;
            this._actorMgr.addBullet(1, tempos, 0, MixedUtils.degreesToVec2(0, cc.v2(0,1)),
            speed, attVal,headVal, critVal, ejection);
        }
    }
    setXDirMove(move:number){
        //根据x坐标计算手臂角度 
        //手臂摆动分4个阶段  中》右 右》中 中》左 左》中  
        let area :number = Math.floor(Math.abs(move)/45)%4;  //负数向下取整 -0.1 为 -1
        let v :number = 1;  //
        if(area>1 || area<-1) 
        {
            v =-1 ;
        }    
        let angle :number = 0;
        
        if(area %2 == 1) //  右》中 左》中 
        {
            if(move < 0 )
                angle = -45*v - v*(move % 45);  
            else
                angle = v*45 - v*(move % 45); 
        }
        else{ //中》左 中》右 
             angle = v*move % 45;  
        }


        this.hand[0].node.angle=angle ;
        this.hand[1].node.angle=angle ;
         
    }
    // updata(){

    // }
}