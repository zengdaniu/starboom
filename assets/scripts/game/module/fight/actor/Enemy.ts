import Actor, { ActorState } from "./Actor";
import Bullet, { BulletType } from "./Bullet";
import Leader from "./Leader";
import MixedUtils, { MinAndMax } from "../../../utils/MixedUtils";
import { MonsterCfg } from "../../../cfg/MonsterCfg";
import { Cmn } from "../../../frame/Cmn";
import { Res } from "../../../frame/Res";
import Skill, { SkillType } from "./Skill";
import { EffectType } from "./Effect";
import { VolumeType, AudioMgr } from "../../../frame/AudioMgr";
import Player from "./Leader";

const { ccclass, property } = cc._decorator;

@ccclass
export default class Enemy extends Actor {

    @property(sp.Skeleton)
    sp: sp.Skeleton = null;
    @property(cc.Sprite)
    sprite: cc.Sprite = null;
    @property(Player)
    player: Player = null;
    @property(Number)
    appeartime  :number =1;

    private _leader: Leader = null;
    private _cfg :MonsterCfg =null;
    private  _label :cc.Label =null;
    private _curHp: number = 0;
    private _g     :number =40;
    private _maxHp: number = 0;
    private _itemId: number = 0;
    private _createId: number = 0;
    private _speedX:number = 0;
    private _speedY:number = 0;
    private _curDt :number =0;
    get createId(): number { return this._createId; }
    get cfg():MonsterCfg{ return this._cfg;}
    private _curAniStep: number = 0;
    private _aniStep: number = 0.2;
    private _aniIndex: number = 0;
    private _makeGold :number []= [];
    private _makeGoldNums :number []= [];
    private _attedIT :number =0;
    private _attedTI :number =0.1;
    private _curCutHp :number = 0;

    onDisable() {
        this._leader = null;
        this._itemId = 0;
    }

    update(dt) {
        if (ActorState.Hide == this._state) return;
        this.updateRun(dt);
    }

    setScale(scale: number) {
        super.setScale(scale);
    }
    get curCutHp():number{
        return this._curCutHp;
    }
    appear(){
        this.setState(ActorState.Wait);
        if(this._speedX > 0){
            this.node.x = -this.node.width/2 - 360;
        }else{
            this.node.x = this.node.width/2 + 360;
        }
    }
    setData(createId: number, cfg: MonsterCfg, pos: cc.Vec2, leader: Leader, lvValue: number) {
        if (null == cfg) return;
        //if (!this.setModel(cfg.model)) return;
        this.init();
        this.show();

        this._createId = createId;
        this.node.setPosition(pos);
        this.node.color = new cc.Color().fromHEX("#FFFFFF");
        this._leader = leader;
        this._cfg =cfg;
        this._maxHp = cfg.hp * this._actorMgr.Difficient ;
        this._curHp = this._maxHp;
        this._g =cfg.g;
        //暂时使用程序自定的
        // this._maxHp = 1+Math.floor(Math.random()*20)
        // this._curHp =this._maxHp;
        // var s :number =this._curHp*15;
        // if(s<30) s =30;
        // cfg.frame[0] =s;
        // cfg.frame[1] =s;
        this._label.string =" " + Math.ceil(this._curHp);
        this._label.fontSize =cfg.frame[0]/2;
        //外部传进来也是球体的大小
        this.node.width=cfg.frame[0];
        this.node.height=cfg.frame[1];

        this.setBoxSize(cfg.frame[0], cfg.frame[1]);
        this._speedX = 8+Math.random()%20;
        if(Math.random()<0.5) this._speedX=-this._speedX;
        this.setFrame();
        this.setState(ActorState.Run);
    }
    setSpeed(sX :number , sY:number){
       this._speedX =sX;
       this._speedY =sY;
    }

    setHpLable(label : cc.Label){
        this._label = label;
        //label.string = '0';
        this._label.string ='0';
        this._label.node.position = this.node.getPosition();
    }
    beAtt(bullet: Bullet) {
        if (!this.isLive()) return;
        let isDeath: boolean = false;
        let hurtVal: number = bullet.attVal;
        this._curCutHp = this._curHp-hurtVal > 0 ? hurtVal : this._curHp;
        this._curHp -= this._curCutHp;
        this._label.string =''+ Math.ceil(this._curHp);
        this._attedIT =this._attedTI;
        this.node.scale = 1.1;
        this._label.node.scale = 1.1;
        this._label.node.color=cc.Color.RED;
        if (this._curHp <=0) {
            
            if(this._cfg.split == 1) {
                this._actorMgr.enemyBreak(this);
                this._curHp=0;
            }
            isDeath = true;
            this.death();
            this._actorMgr.addEffect(EffectType.Death, bullet.node.position);
            //之前按照球体顺延，现在只读配置就行了
            // if(this._cfg.split == 2){
            //     for(let i = 0 ;i < this._makeGold.length;i++){
            //         for(let j = 0 ; j < this._makeGoldNums[i];j++){
            //             this._actorMgr.addGold(this._makeGold[i],this.node.getPosition(),this._speedX,this._speedY);
            //             this._speedX -=5;
            //         }
            //     }
            // }
            for(let i = 0 ;i < this._cfg.gold.length;i++){ 
                for(let j = 0 ; j < this._cfg.goldNum[i];j++){
                    this._actorMgr.addGold(this._cfg.gold[i],this.node.getPosition(),this._speedX,this._speedY);
                    this._speedX -=5;
                }
            }

            this._actorMgr.addEffect(EffectType.bomb, bullet.node.position);
            if(this._cfg.frame[0] >=220){
                Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_BOMB3);
                this._actorMgr.shakeScreen(true);
            }else if(this._cfg.frame[0] >=120){
                Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_BOMB2);
                this._actorMgr.shakeScreen(false);
            }else if(this._cfg.frame[0] >=80){
                Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_BOMB1);
                //this._actorMgr.shakeScreen(false);
            }
        } 

    }

    init() {
        super.init();
        if(this._label)
            this._label.node.active=false;
        this._moveSpeed = 0;
        this._itemId = 0;
        this._yLimit -= 50;
        this._xLimit += 20;
        this._speedY = 0;
        this._speedX = 0;
        this._makeGold= [];
        this._makeGoldNums= [];
    }
    setGold(makeGold:number[],makeGoldNums:number[]){
        this._makeGold= makeGold;
        this._makeGoldNums =makeGoldNums;
    }
    getMakeGold():any{
        return this._makeGold;
    }
    getMakeGoldNums():any{
        return this._makeGoldNums;
    }
    death() {
        super.death();
        if (0 < this._itemId && this.node.position.x > -this._xLimit && this.node.position.x < this._xLimit) {
            Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_BOMB1);
        }
        this._itemId = 0;
        this._label.node.active=false;
        //this._actorMgr.deathBomb(this.node.position);
    }
    enemyHide(){
        this._label.node.active=false;
        super.hide();
    }
    removeHpLabel(){
        this._label.node.removeFromParent();
        this._label = null;
    }
    private updateRun(dt) {
        this._attedIT -=dt;
        if( this._attedIT < 0){
            this.node.scale =1;
            this._label.node.color=cc.Color.WHITE;
        }
        
        if (null == this._leader || !this.isLive() ) return;
        this._label.node.active=true;
        //刚出现的时候不下落
        if(this._state == ActorState.Wait){
            this._curDt +=dt;
            if(this._curDt > this.appeartime) {
                this.setState(ActorState.Run)  
                return ;
            }
            let sX = this._speedX*dt*5;
            let newPos: cc.Vec2 = this.node.position.add(cc.v2(sX,0).mul(10));
            this.node.setPosition(newPos);
            this._label.node.setPosition(newPos);
            return;
        }

        this.node.angle += dt*10;
        if(this.node.angle >=360) this.node.angle =0;
        this._label.node.angle=this.node.angle;
        //加速度的方式
        let sY = this._speedY*dt-this._g*dt*dt/2;
        let sX = this._speedX*dt;
        this._speedY -= this._g*dt; 

        let newPos: cc.Vec2 = this.node.position.add(cc.v2(sX,sY).mul(10));
        if((newPos.y-this.node.width/2) < -450){
            newPos.y=-450+this.node.width/2;
            this._speedY = this.cfg.speed;
            if(this._cfg.frame[0] >220)
            {
                this._actorMgr.shakeScreenUD(3);
                
            }
            else if(this._cfg.frame[0] >160)
            {
                this._actorMgr.shakeScreenUD(2);
                
            }else if(this._cfg.frame[0] >80){
                //this._actorMgr.shakeScreen(false);
                this._actorMgr.shakeScreenUD( 1 );
            }
        }
        if(Math.abs(newPos.x)+this.node.width/2 >350){
            newPos.x /= Math.abs(newPos.x); //保持符号不变
            newPos.x *= (350-this.node.width/2) ;
            this._speedX= -this._speedX;
        }
        this.node.setPosition(newPos);
        this._label.node.setPosition(newPos);

    }
    private setFrame() {
        //暂时先随机
        //let index :number = 1+ Math.floor(Math.random()*6) ;
        let path: string =Res.PATH_FIGHT_ENEMY  +this._cfg.icon;// + index;
        Cmn.res.setSprite(path, this.sprite);
    }
}
