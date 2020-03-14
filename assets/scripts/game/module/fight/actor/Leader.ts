import Actor, { ActorState, DirType } from "./Actor";
import MixedUtils from "../../../utils/MixedUtils";
import Enemy from "./Enemy";
import Gold from "./Gold";
import { BulletType } from "./Bullet";
import { Cmn } from "../../../frame/Cmn";
import { VolumeType, AudioMgr } from "../../../frame/AudioMgr";
import { ArmsCfg } from "../../../cfg/ArmsCfg";
import { CfgConstants } from "../../../cfg/CfgConstants";
import { WeaponData, UserDB ,UserDataKey} from "../../../frame/UserData";
import { Calc,CalcType } from "../../../frame/Calc";
import { AttributesCfg } from "../../../cfg/AttributesCfg";
import BuffItem, { BuffType } from "./BuffItem";
import Buff from "./Buff";
import FramePlayer from "./FramePlayer";
import { Player } from "./Player";
const { ccclass, property } = cc._decorator;

@ccclass
export default class Leader extends Actor {

    @property(cc.Node)
    bulletPos: cc.Node = null;
    @property(cc.Node)
    targetCircle: cc.Node = null;
    @property(sp.Skeleton)
    fireEff: sp.Skeleton = null;
    @property(cc.Node)
    players: cc.Node[] = [];
    @property(cc.Label)
    goldLeb: cc.Label = null;
    
    @property(Number)
    invincibleTime : number = 5;
    @property(Number)
    moveSpeed : number = 10;

    private readonly _invincibleTime: number = 3;       // 复活时的无敌时间
    private readonly _height: number = 100;             // 血条离脚底距离
    private _lostTargetStep: number = 0;

    private _player :Player = null;
    private _bulletSpeed: number = 5;   // 子弹速度
    private _attVal: number = 100;      // 子弹伤害
    private _bulletNum :number = 1;
    private _attIT: number = 0.2;       // 射速
    private _runnFireIT: number = 0;    // 连射间隔
    private _runnFireNum: number = -1;       // 连射数量
    private _yUpLimit: number = 0;
    private _yDownLimit: number = 0;
    private _curInvincibleTime :number = 0;
    private _blinkGap :number = 0.2;
    private _curBlinkTime : number = 0;
    private _getGold :number = 0;
    get attVal(): number {
        let val = this._attVal+4; //+4 策划说初始值改为5 ，开始初始值是1 现在改成5 又不是配置里面弄得 只能这里加4
        if (null != this._buffAttUp) {      // 增伤 buff
            val = Math.floor(val + val * this._buffAttUp.value / 100);
        }
        return val;
    }

    get attIT(): number {
        let it = this._attIT;
        if (null != this._buffAttSpeedUp) {      // 增攻速 buff
            it = it / (1 + this._buffAttSpeedUp.value / 100)
        }
        return it;
    }


    get pos(): cc.Vec2 {
        return this.node.position;
    }

    // buff
    private _buffAttUp: Buff = null;
    private _buffAttSpeedUp: Buff = null;
    private _buffShotgun: Buff = null;
    private _ejection: Buff = null;

    private _moveDir: cc.Vec2 = null;
    private _attStep: number = 0;
    private _joyDis: number = 0;
    private _maxHP: number = 1;
    private _curHP: number = 0;
    private _cldHurtStep: number = 0;
    private _invincibleStep: number = 0;
    private _bullteDir: cc.Vec2 = null;
    private _bulletAngle: number = 0;
    private _curRunFireNum: number = 0;
    private _bulletType: BulletType = BulletType.GunNormal_1;
    private _shootPos: cc.Vec2 = null;
    private _pipeVec :cc.Vec2 =null;
    private _isDoubleHurt: boolean = false;
    private _isAutoShoot: boolean = false;
    private _Attacked: boolean = false;
    private _targetMove :number = 0;

    private _trySpeed:boolean =false;
    private _tryDoubleGold:boolean =false;
    onLoad() {

    }
    onEnable() {
        let udb: UserDB = Cmn.ud.userDB;
        
        this._maxHP = 1;
        this._yUpLimit = this._yLimit - 100;
        this._yDownLimit = -this._yLimit + 20;
        
        this.goldLeb.string='0';
        this._curBlinkTime =this._blinkGap;
        this._curInvincibleTime= this.invincibleTime;
        this.init();
        this.reset();
    }

    init() {
        super.init();
        this.show();
        this.cleanBuff();
    }
    initBulletSpeed(){
        // 武器初始化
        let udb: UserDB = Cmn.ud.userDB;
        let weaponData: WeaponData = Cmn.ud.userDB.weapon;
        if (null == weaponData) {
            cc.error("no weaponData! >> curWeaponIndex = ");
            return;
        }
        let Armscfg: ArmsCfg = Cmn.cfg.getCfg(CfgConstants.RES_ARMS, udb.curArmsId);
        let gunCfg: AttributesCfg = Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES, 2);
        if (null == gunCfg || null == Armscfg) return;
        this._attVal = MixedUtils.calcAttr(gunCfg.value, gunCfg.upValue,weaponData.attLv , gunCfg.maxLevel) / 100; 
        gunCfg = Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES, 1);

        let cutSpeed:number = 0
        if(this._trySpeed ){
            cutSpeed=MixedUtils.calcAttr(gunCfg.value, gunCfg.upValue,100 , gunCfg.maxLevel) / 10000;            
        }else
            cutSpeed=MixedUtils.calcAttr(gunCfg.value, gunCfg.upValue,weaponData.speed , gunCfg.maxLevel) / 10000;
        this._attIT = Armscfg.fireIT / 100;
        this._attIT *=( 1 - cutSpeed);
        this._bulletSpeed = 60*(1-this._attIT);

        this._runnFireIT =Armscfg.fireTI / 100;
        this._runnFireNum = 0;
    }
    initTank(curArmsId:number){
        this.players.forEach(element => {
            element.active = false;
        });
        let cur_tank :string = "tank_" + curArmsId;
        this.players[curArmsId-1].active =true;
        this._player = this.players[curArmsId-1].getComponent(cur_tank);
        let size :cc.Vec2 = this._player.getBoxSize();
        this.setBoxSize(size.x,size.y);
        this.bulletPos.setPosition(this._player.getFirePos());
        this._player.setActMgr(this._actorMgr);

        this._actorMgr.resetBullet(curArmsId);
    }
    setTrySpeed(){
        this._trySpeed =true;
        this.initBulletSpeed();
    }
    setDoubleGold(){
        this._tryDoubleGold =true;
    }
    onDisable() {
        this._moveDir = null;
        this.cleanBuff();
        this._isDoubleHurt = false;
        this._isAutoShoot = false;
    }

    isLive() {
        return ActorState.Death != this._state && super.isLive();
    }

    setShootPos(pos: cc.Vec2) {
        if (null == this._shootPos && null != pos) {
            this.setState(ActorState.Att);
        } else if (null != this._shootPos && null == pos) {
            this.setState(ActorState.Wait);
        }
        this._shootPos = pos;
    }
    
    setXDirMove(x:number){
        if (this.isEnd()) return;

        // if(Math.abs(x-this.node.x)>this.moveSpeed){
        //     x= this.node.x + (x>this.node.x? this.moveSpeed : -this.moveSpeed );
        // }
        if(x == null ){ 
            this._targetMove = null ;
            return ;
        }
        this._targetMove = x;
        
        //this._player.setXDirMove(this.node.x);
         
    }
    moving(){
        if(this._targetMove == null) return ;
        if(this._targetMove == this.node.x) return ;
        
        let x :number = this._targetMove;

        if(Math.abs(x-this.node.x)>this.moveSpeed){
            x= this.node.x + (x>this.node.x? this.moveSpeed : -this.moveSpeed );
        }

        if(Math.abs(x)+this.box.width/2 <350){
            this.node.x =x;
        }

        this._player.setXDirMove(this.node.x)
    }
    setMoveDir(dir: cc.Vec2, dis: number = 0) {
        if (!this.isEnd()) return;
        this._moveDir = dir;
        this._curDir = dir;
        this.setAngle(-(MixedUtils.vec2ToDegrees(dir, this._dirVec2) + 90));
        this.setState(ActorState.Run);
    }

    setState(newState: ActorState) {
        if (newState == this._state) return;
        this._curRunFireNum = 0;
        this._bullteDir = null;
        this._bulletAngle = 0;
        switch (newState) {
            case ActorState.Run:
                break;
            case ActorState.Att:
                break;
            case ActorState.Wait:
                break;
            default:
                super.setState(newState);
                break;
        }
        this._state = newState;
        this.changeAni();
    }

    update(dt) {
        this.moving();
        this.shooting(dt);
        this.beAttBlink(dt);
        return;
    }

    lateUpdate() {

       
    }


    // updateMove(dt) {
    //     let newPos: cc.Vec2 = this.node.position.add(this._moveDir.mul(this._moveSpeed * dt));
    //     newPos.x = MixedUtils.limitVal(newPos.x, -this._xLimit, this._xLimit);
    //     newPos.y = MixedUtils.limitVal(newPos.y, this._yDownLimit, this._yUpLimit);
    //     this.node.setPosition(newPos);
    //     newPos.y += this._height;
    // }

    reviev() {
        this._attStep = 0;
        this.setHp(1);
        this.setAngle(0);
        this._invincibleStep = this._invincibleTime;
        this.setState(ActorState.Wait);
    }

    cleanTarget() {
        this._lostTargetStep = 0;
        this.targetCircle.setPosition(new cc.Vec2(-500, -800));
    }

    getGold(gold:Gold){
        if(this._tryDoubleGold)
            this._getGold += gold._value*2;
        else  
            this._getGold += gold._value;

        this.goldLeb.string =''+this._getGold;
        Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.GET_COIN);
    }
    calcGold(){
        return this._getGold;
    }
    beAttBlink(dt :number){
        if(!this._Attacked) return ;
       
        this._curInvincibleTime +=dt;
        if(this._curInvincibleTime>this.invincibleTime){
            this._curInvincibleTime= 0 ;
            this._Attacked =false;
            this.node.opacity =255;
        }else{
            this._curBlinkTime +=dt;
            if(this._curBlinkTime > this._blinkGap){
                this.node.opacity = this.node.opacity? 0:255;
                this._curBlinkTime = 0 ;
            }
                            
        }
    }
    beAtt(hurt: number) {
        if (!this.canBeAtt() || this._Attacked) return;
        this._curHP -= 1;
        if (0 >= this._curHP) {
            this._curHP = 0;
            this.death();
        }
        this._Attacked =true;
        this._curInvincibleTime=0;
        this._curBlinkTime = 0;
        // let self = this;
        // let endCall = cc.callFunc(function () {
        //     self.hurtUI.active=false;
        // })
        // this.node.runAction(cc.sequence(cc.delayTime(1), endCall));
        Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_HIT);
    }

    reset() {
        this.initTank(Cmn.ud.userDB.curArmsId);
        this._trySpeed=false;
        this._tryDoubleGold=false;
        this.initBulletSpeed();
        
        this.fireEff.node.active = false;
        this._curRunFireNum = 0;
        this._moveDir = null;
        this._attStep = 0;
        this.setHp(1);
        this.setAngle(0);
        this.setState(ActorState.Wait);
        this.node.x = 0;
        this._getGold = 0;
        //this.node.y = -450;
        this.cleanBuff();
        this.targetCircle.setPosition(new cc.Vec2(-500, -800));
        this._bulletType = BulletType.GunNormal_1;
        this.goldLeb.string = "0";
        this._isDoubleHurt = (0 < Cmn.ud.userDB.doubleHurtTime);
        this._isAutoShoot = (0 < Cmn.ud.userDB.autoShootTime);
    }

    setY(val: number) {
        //this.node.y = val;
    }

    

    death() {
        this.setState(ActorState.End);
        Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_DEATH);
    }


    private cleanBuff() {
        null != this._buffAttUp && this._buffAttUp.cleanUI();
        this._buffAttUp = null;
        null != this._buffAttSpeedUp && this._buffAttSpeedUp.cleanUI();
        this._buffAttSpeedUp = null;
        null != this._ejection && this._ejection.cleanUI();
        this._ejection = null;
    }


    protected setAngle(angle: number) {
        if (angle == this._curAngle) return;
        this._curAngle = angle;
        let a: number = (360 - angle) % 360;
        let dirId: number = this.getAttDirIdBtAngle(a);
        if (dirId == this._curDirId) return;
        this._curDirId = dirId;
        this.changeAni();
    }

    private getAttDirIdBtAngle(angle: number) {
        let type: number = 0;
        let a: number = (360 + angle) % 360;
        if ((354.375 < a && a < 360) || (0 <= a && a <= 5.625)) {
            type = 0;
        } else {
            for (let i = 0; i < 32; ++i) {
                if (5.625 + i * 11.25 < angle && angle <= 16.875 + i * 11.25) {
                    type = i;
                }
            }
        }
        return type;
    }

    private shooting(dt) {  
        if(this._state !=ActorState.Att ) {
            //this.pipe.node.setPosition(this._pipeVec);
            this._player.shootEff(false);
            this._attStep =0 ;
            return;
        }
        this._attStep += dt;
        if (this._attStep <this._runnFireIT||this._attStep < this._attIT) {
            if(this._attStep > this._attIT/3) this._player.shootEff(false); //this.pipe.node.setPosition(this._pipeVec); 
        } else {
            let tmpPos: cc.Vec2 = null;
            tmpPos = this.node.convertToWorldSpaceAR(this.bulletPos.position);
            tmpPos = this.node.parent.convertToNodeSpaceAR(tmpPos);
            this._attStep -= this._attIT;
            let bulletNums :number = 0;
            while( this._attStep >0&&bulletNums<4){
                bulletNums ++;
                this._attStep -= this._attIT;
            }
            let bulletAtt: number = (this._isDoubleHurt ? 2 * this.attVal : this.attVal);
            if(bulletNums > 3){
                cc.error("bulletNums too large "+bulletNums);
                cc.error("this._attStep ="+this._attStep);
                cc.error("this._attIT ="+this._attIT);
            }
            this._player.shootBullet(bulletNums,tmpPos,this._bulletSpeed, bulletAtt, 0, 0, this._ejection);
            this._player.shootEff(true);
            // let self = this;
            // let endCall = cc.callFunc(function () {
            //     self.pipe.node.setPosition(self._pipeVec);  
            // })
            // this.pipe.node.runAction(cc.sequence(cc.delayTime(0.05), endCall));

            0 < this._curRunFireNum && --this._curRunFireNum;
            this.fireEff.node.active = true;
            this.fireEff.setAnimation(0, "qianghuo", false);
            Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_SHOOT);
        }
    }

    private setHp(val: number) {
        this._curHP = (0 > val ? 0 : val);
    }

    protected changeAni() {
        return;
    }

    private deathAniEnd() {
        this.setState(ActorState.End);
    }


}


export class attDirMsg {
    pos: cc.Vec2 = null;
    angle: number = 0;

    constructor(x: number, y: number, angle: number) {
        this.pos = new cc.Vec2(x, y);
        this.angle = angle;
    }
}