import Leader from "./Leader";
import Bullet, { BulletType } from "./Bullet";
import Enemy from "./Enemy";
import HurtStr from "./HurtStr";
import BuffItem from "./BuffItem";
import { Cmn } from "../../../frame/Cmn";
import { CfgConstants } from "../../../cfg/CfgConstants";
import { MonsterCfg } from "../../../cfg/MonsterCfg";
import { LevelCfg } from "../../../cfg/LevelCfg";
import {ArmsCfg} from "../../../cfg/ArmsCfg";
import Effect, { EffectType } from "./Effect";
import Buff from "./Buff";
import ShakeCtrl from "../ShakeCtrl";
import MixedUtils from "../../../utils/MixedUtils";
import Gold ,{GoldType} from "./Gold";

const { ccclass, property } = cc._decorator;

@ccclass
export default class ActorMgr extends cc.Component {

    @property(Leader)
    leader: Leader = null;
    @property([cc.Node])
    bulletNode: cc.Node[] = [];
    @property(cc.Node)
    enemyNode: cc.Node = null;
    @property(cc.Node)
    enemyHP: cc.Node = null;
    @property(cc.ProgressBar)
    enemyNumPB: cc.ProgressBar = null;
    @property(cc.Node)
    dzEffectNode: cc.Node = null;
    @property(cc.Node)
    deathEffectNode: cc.Node = null;
    @property(cc.Node)
    goldNode: cc.Node = null;
    @property(cc.Node)
    bombEffectNode: cc.Node = null;
    @property(ShakeCtrl)
    shakeCtrl: ShakeCtrl = null;
    @property(cc.Label)
    scoreLab : cc.Label = null ;
    @property(cc.Label)
    curLevel : cc.Label = null ;
    @property(cc.Label)
    nextLevel : cc.Label = null ;



    private readonly _deathEffZI: number = -100;
    private readonly _runActorZI: number = 2500;
    private readonly _bulletZI: number = 3000;
    private readonly _dzEffZI: number = 4600;
    private readonly _goldEffZI: number = 6000;
    private readonly _bombEffZI: number = 5900;
    private readonly _heroBltMaxNum: number = 100;
    private readonly _enemyBltMaxNum: number = 30;
    //private readonly _enemyMaxNum: number = 50;
    private readonly _dzEffMaxNum: number = 5;
    private readonly _deathEffMaxNum: number = 5;
    private readonly _goldEffMaxNum: number = 40;
    private readonly _bombEffMaxNum: number = 5;
    private readonly _sortIT: number = 0.5;
    
    private  _arms:ArmsCfg;
    private _enemyZI: number = 0;
    private _enemyMaxNum: { [key: string]: number } = {};
    private _enemyWaitArr: { [key: string]: Enemy[] } = {};
    private _enemyRunArr: { [key: string]: Enemy[] } = {};
    private _enemyHPWaitArr: cc.Label[] = [];
    //private _enemyHPtRunArr: cc.Label[] = [];

    private _heroBltWaitArr: Bullet[] = [];
    private _heroBltRunArr: Bullet[] = [];


    private _dzEffWaitArr: Effect[] = [];
    private _dzEffRunArr: Effect[] = [];
    private _deathEffWaitArr: Effect[] = [];
    private _deathEffRunArr: Effect[] = [];
    private _goldWaitArr:Gold[] = [];
    private _goldRunArr: Gold[] = [];
    private _bombEffWaitArr: Effect[] = [];
    private _bombEffRunArr: Effect[] = [];
    private _curJSZI: number = 0;
    private _curSortStep: number = 0;
    private _maxLvEnemyScore: number = 0;
    private _curLvEnemyScore: number = 0;
    private _createId: number = 0;
    private _difficultLv:number = 1;

    get runEnemyNum(): number {
        let num: number = 0;
        for (const key in this._enemyRunArr) {
            num += this._enemyRunArr[key].length;
        }
        return num;
    }
    get finished(): number{
        if(this.runEnemyNum == 0) return 1;
        return this._curLvEnemyScore/this._maxLvEnemyScore >= 1 ? 0.9 : this._curLvEnemyScore/this._maxLvEnemyScore ;
    }

    get score(): number{
        return Math.floor(this._curLvEnemyScore);
    }

    get makingEnemyNum(): number { 
        return 0; 
    }

    get Difficient(): number{
        
        return this._difficultLv;
    }
    onLoad() {
        this.goldNode.active = false;
        
        this.bulletNode.forEach(element => {
            element.active = false;
        });

        this.enemyNode.active = false;
        this.dzEffectNode.active = false;
        this.deathEffectNode.active = false;
        this.leader.node.zIndex = this._bulletZI - 1;
        this._enemyMaxNum["Ball_1"] = 50;
        this._enemyMaxNum["Ball_2"] = 50; 
        this._enemyMaxNum["Ball_3"] = 50; 
        this._enemyMaxNum["Ball_4"] = 50; 
        this._enemyMaxNum["Ball_5"] = 50; 
        this._enemyMaxNum["Ball_6"] = 50; 
        this._enemyZI = 1000;
        this.loadConfig();
    }

    onEnable() {
        this.loadConfig();
        this.initCache();
        this._curSortStep = 0;
        this._curJSZI = 0;
        this._createId = 0;
    }

    onDisable() {
        // this.cleanAllActors();
        // this.cleanEnemys();
    }
    loadConfig(){
        this._arms =Cmn.cfg.getCfg(CfgConstants.RES_ARMS, Cmn.ud.userDB.curArmsId);
        let level:LevelCfg =Cmn.cfg.getCfg(CfgConstants.RES_LEVEL,Cmn.ud.userDB.curChapter);
        this._difficultLv =level.coefficient/100;
        this.curLevel.string = "" +Cmn.ud.userDB.curChapter ;
        this.nextLevel.string = "" +(Cmn.ud.userDB.curChapter+1);
        this.scoreLab.string =''+Math.floor(Cmn.ud.userDB.curScore);
    }
    reset() {
        this.loadConfig();
        this.leader.reset();
        this.resetAllActors();
        this._curSortStep = 0;
        this._curJSZI = 0;
        this._createId = 0;
        this.setMaxLvEnemyNum(this._maxLvEnemyScore);
    }

    update(dt) {
        this._curSortStep += dt;
        if (this._sortIT <= this._curSortStep) {
            this._curSortStep -= this._sortIT;
            this.sortActors();
        }

    }

    lateUpdate() {
        let enemy: Enemy = null;
        let enemyList: Enemy[] = [];
        for (const key in this._enemyRunArr) {
            enemyList = this._enemyRunArr[key];
            for (let i = enemyList.length - 1; i >= 0; --i) {
                enemy = enemyList[i];
                if (enemy.isEnd()) {
                    enemy.hide();
                    this._enemyWaitArr[key].push(enemy);
                    this._enemyRunArr[key].splice(i, 1);
                }
                 else {
                    if (enemy.rect.intersects(this.leader.rect)) {
                        this.leader.beAtt(1);
                    }
                }
            }
        }

        let bullet: Bullet = null;
        let updataScore :boolean =false;
        // 主角子弹遍历怪物
        for (let i = this._heroBltRunArr.length - 1; i >= 0; --i) {
            bullet = this._heroBltRunArr[i];
            if (bullet.isEnd()) {
                bullet.hide();
                this._heroBltWaitArr.push(bullet);
                this._heroBltRunArr.splice(i, 1);
            } else {
                for (const key in this._enemyRunArr) {
                    enemyList = this._enemyRunArr[key];
                    for (let i = 0; i < enemyList.length; ++i) {
                        enemy = enemyList[i];
                        if (!enemy.canBeAtt()) continue;
                        if (bullet.rect.intersects(enemy.rect) && bullet.hitEnemy(enemy)) {
                            updataScore =true;
                            enemy.beAtt(bullet);
                            this._curLvEnemyScore +=enemy.curCutHp;
                            //if(bullet.hitEnemy(enemy)) break;
                            break ; //一颗子弹一帧只能打到一个
                        }
                    }
                }
            }
        }
        if(updataScore){
            this.enemyNumPB.progress=this._curLvEnemyScore/this._maxLvEnemyScore;
            this.scoreLab.string =''+Math.floor(Cmn.ud.userDB.curScore+this._curLvEnemyScore);
        }

        
        let effect: Effect = null;
        for (let i = this._dzEffRunArr.length - 1; i >= 0; --i) {
            effect = this._dzEffRunArr[i];
            if (effect.isEnd()) {
                effect.hide();
                this._dzEffWaitArr.push(effect);
                this._dzEffRunArr.splice(i, 1);
            }
        }

        for (let i = this._deathEffRunArr.length - 1; i >= 0; --i) {
            effect = this._deathEffRunArr[i];
            if (effect.isEnd()) {
                effect.hide();
                this._deathEffWaitArr.push(effect);
                this._deathEffRunArr.splice(i, 1);
            }
        }
        let gold:Gold =null;
        for (let i = this._goldRunArr.length - 1; i >= 0; --i) {
            gold= this._goldRunArr[i];
            if (gold.isEnd()) {
                gold.hide();
                this._goldWaitArr.push(gold);
                this._goldRunArr.splice(i, 1);
            }
        }

        for (let i = this._bombEffRunArr.length - 1; i >= 0; --i) {
            effect=this._bombEffRunArr[i];
            if (effect.isEnd()) {
                effect.hide();
                this._bombEffWaitArr.push(effect);
                this._bombEffRunArr.splice(i, 1);
            }
        }
    }

    addBullet(type: BulletType, pos: cc.Vec2, angle: number, dir: cc.Vec2, speed: number, attVal: number,
        headVal: number = 0, critVal: number = 0, ejection: Buff = null) {
        let bullet: Bullet = this.getHeroBullet();
        bullet.setData(type, pos, angle, dir, speed, attVal, headVal, critVal, ejection);
    }

    addEnemy(enemyId: number, pos: cc.Vec2, lvValue: number) {
        // enemyId = 28;
        //if (0 < this.runEnemyNum) return;
        let cfg: MonsterCfg = Cmn.cfg.getCfg(CfgConstants.RES_MONSTER, enemyId);
        if (null == cfg) return;
        let enemy: Enemy = this.getEnemy(cfg.icon);
        if (null == enemy) return;
        enemy.setData(this._createId++, cfg, pos, this.leader, lvValue);
        enemy.setGold(cfg.gold,cfg.goldNum);
        enemy.appear();
        
    }
    addGold(goldType: GoldType, pos: cc.Vec2,speedX:number,speedY:number ){
        let gold:Gold = this.getGoldEff();
        gold.setData(goldType,this.leader,pos,speedX,speedY);
    }
    enemyBreak(enemy: Enemy) {
        // enemyId = 28;
        //if (0 < this.runEnemyNum) return;
        var pos =enemy.node.getPosition();
        for(let i =0;i<2 ;i++){
            let cfg: MonsterCfg = Cmn.cfg.getCfg(CfgConstants.RES_MONSTER,enemy.cfg.monsterId[i]);
            if (null == cfg) return;
            let speedX = 0;
            if(i==0) 
            {
                pos.x-=cfg.frame[1]/2;
                speedX = -10;
            }   
            else
            {
                pos.x+=cfg.frame[1]/2;
                speedX =10 ;
            }
            let newEnemy: Enemy = this.getEnemy(cfg.icon);
            if (null == newEnemy) return;
            newEnemy.setData(this._createId++, cfg, pos, this.leader, 0);
            //if(this._createId%2 == 1){ newEnemy.setGold(enemy.getMakeGold(),enemy.getMakeGoldNums());}
            
            newEnemy.setSpeed(speedX,cfg.speed*0.5);
        }
    }

    addEffect(type: EffectType, pos: cc.Vec2, enemyId: number = 0, enemtLv: number = 0) {
        let effect: Effect = null;
        switch (type) {
            case EffectType.Hit:
                effect = this.getDZEff();
                break;
            case EffectType.Death:
                effect = this.getDeathEff();
                break;
            case EffectType.bomb:
                effect = this.getBombEff();
                break;
        }
        if (null == effect) return;
        effect.setData(type, pos, enemyId, enemtLv);
    }



    setMaxLvEnemyNum(num: number) {
        this._maxLvEnemyScore = num;
        this._curLvEnemyScore = 0;
    }
    
    getEjectionTarget(bullet: Bullet): Enemy {
        let target: Enemy = null;
        let targetDis: number = 0;
        let pos: cc.Vec2 = bullet.node.position;
        let range: number = bullet.ejtRange;
        let enemyList: Enemy[] = [];
        let enemy: Enemy = null;
        let dis: number = 0;
        for (const key in this._enemyRunArr) {
            enemyList = this._enemyRunArr[key];
            for (let i = 0; i < enemyList.length; ++i) {
                enemy = enemyList[i];
                if (!enemy.canBeAtt() || bullet.isHit(enemy.createId)) continue;
                dis = enemy.node.position.sub(pos).mag();
                if (dis > range) continue;
                if (null == target || dis < targetDis) {
                    target = enemy;
                    targetDis = dis;
                }
            }
        }
        return target;
    }

    getAttTarget(): Enemy {
        let target: Enemy = null;
        let targetDis: number = 0;
        let leadetPos: cc.Vec2 = this.leader.node.position;
        let enemyList: Enemy[] = [];
        let enemy: Enemy = null;
        let dis: number = 0;
        for (const key in this._enemyRunArr) {
            enemyList = this._enemyRunArr[key];
            for (let i = 0; i < enemyList.length; ++i) {
                enemy = enemyList[i];
                if (!enemy.canBeAtt()) continue;
                dis = enemy.node.position.sub(leadetPos).mag();
                if (null == target || dis < targetDis) {
                    target = enemy;
                    targetDis = dis;
                }
            }
        }
        return target;
    }

    isLeaderDeath() {
        return this.leader.isEnd();
    }

    leaderRevive() {
        this.leader.reviev();
    }
    resetBullet(curArmsId:number){
        this.cleanBullets();
        let objNode = null;
        let objCmp: Bullet = null;
        let bulletType=Cmn.cfg.getCfg(CfgConstants.RES_ARMS, curArmsId).bullet;
        for (let i = this._heroBltWaitArr.length; i < this._heroBltMaxNum; ++i) {
            objNode = cc.instantiate(this.bulletNode[bulletType-1]);
            if (null == objNode) return null;
            this.node.addChild(objNode, this._bulletZI + i);
            objNode.active = true;
            objCmp = objNode.getComponent("Bullet_"+bulletType);
            if (null == objCmp) return null;
            objCmp.init();
            objCmp.hide();
            this._heroBltWaitArr.push(objCmp as Bullet);
        }
    }
    initBullet(){
        this.cleanBullets();
        let objNode = null;
        let objCmp: Bullet = null;
        for (let i = this._heroBltWaitArr.length; i < this._heroBltMaxNum; ++i) {
            objNode = cc.instantiate(this.bulletNode[this._arms.bullet-1]);
            if (null == objNode) return null;
            this.node.addChild(objNode, this._bulletZI + i);
            objNode.active = true;
            objCmp = objNode.getComponent("Bullet_"+this._arms.bullet);
            if (null == objCmp) return null;
            objCmp.init();
            objCmp.hide();
            this._heroBltWaitArr.push(objCmp as Bullet);
        }
    }
    initEnemyCache(resList: string[]) {
        this.cleanEnemys();
        let resName: string = "";
        let prefab = null;
        let objNode = null;
        let nodeHp :cc.Node= null;
        let Hpleb : cc.Label= null;
        let objCmp: Enemy = null;
        let maxNum: number = 0;
        let zIndex: number = 0;
        
        for (let j = 0; j < resList.length; ++j) {
            resName = resList[j];
            //prefab = Cmn.res.getData(resName, false);
            maxNum = this._enemyMaxNum[resName];
            zIndex = this._enemyZI;
            this._enemyWaitArr[resName] = [];
            this._enemyRunArr[resName] = [];
            for (let i = 0; i < maxNum; ++i) {
                //objNode = cc.instantiate(prefab);
                objNode = cc.instantiate(this.enemyNode);
                //Hpleb =this._enemyHPWaitArr.pop();
                if (null == objNode /*|| null== Hpleb*/ ) return null;
                this.node.addChild(objNode, zIndex + i);
                //Hpleb.node.zIndex=this._enemyZI+10+i;

                objNode.active = true;
                objCmp = objNode.getComponent(Enemy);
                if (null == objCmp) return null;
                //objCmp.setHpLable(Hpleb);
                objCmp.init();
                objCmp.hide();
                this._enemyWaitArr[resName].push(objCmp as Enemy);
            }
        }
        for (let j = 0; j < resList.length; ++j) {
            resName = resList[j];
            maxNum = this._enemyMaxNum[resName];
            for (let i = 0; i < maxNum; ++i) {
                nodeHp = cc.instantiate(this.enemyHP);
                if(null== nodeHp) return null;
                this.node.addChild(nodeHp,zIndex+i);
                nodeHp.active =false;
                
                //this._enemyHPWaitArr.push(nodeHp.getComponent(cc.Label));
                this._enemyWaitArr[resName][i].setHpLable(nodeHp.getComponent(cc.Label));

            }
        }
    }

    shakeScreen(isMax: boolean = false) {
        this.shakeCtrl.play(isMax);
    }
    shakeScreenUD(level:number = 0) {
        this.shakeCtrl.playUpDown(level);
    }

    deathBomb(pos: cc.Vec2) {
        let enemy: Enemy = null;
        let enemyList: Enemy[] = [];
        for (const key in this._enemyRunArr) {
            enemyList = this._enemyRunArr[key];
            for (let i = 0; i < enemyList.length; ++i) {
                enemy = enemyList[i];
                if (!enemy.canBeAtt()) continue;
                if (150 > enemy.node.position.sub(pos).mag()) {
                    //enemy.bePush(pos, 40);
                }
            }
        }
    }


    private initCache() {
        this.cleanAllActors();
        //this.initBullet();
        let objNode: cc.Node = null;
        let objCmp: Bullet | Enemy | HurtStr | BuffItem | Effect = null;

        for (let i = this._dzEffWaitArr.length; i < this._dzEffMaxNum; ++i) {
            objNode = cc.instantiate(this.dzEffectNode);
            if (null == objNode) return null;
            this.node.addChild(objNode, this._dzEffZI + i);
            objNode.active = true;
            objCmp = objNode.getComponent(Effect);
            if (null == objCmp) return null;
            objCmp.init();
            objCmp.hide();
            this._dzEffWaitArr.push(objCmp as Effect);
        }

        for (let i = this._deathEffWaitArr.length; i < this._deathEffMaxNum; ++i) {
            objNode = cc.instantiate(this.deathEffectNode);
            if (null == objNode) return null;
            this.node.addChild(objNode, this._deathEffZI + i);
            objNode.active = true;
            objCmp = objNode.getComponent(Effect);
            if (null == objCmp) return null;
            objCmp.init();
            objCmp.hide();
            this._deathEffWaitArr.push(objCmp as Effect);
        }


        for (let i = this._goldWaitArr.length; i < this._goldEffMaxNum; ++i) {
            objNode = cc.instantiate(this.goldNode);
            if (null == objNode) return null;
            this.node.addChild(objNode, this._goldEffZI + i);
            objNode.active = true;
            let goldCmp:Gold = objNode.getComponent(Gold);
            if (null == goldCmp) return null;
            goldCmp.init();
            goldCmp.hide();
            this._goldWaitArr.push(goldCmp as Gold);
        }

        for (let i = this._bombEffWaitArr.length; i < this._bombEffMaxNum; ++i) {
            objNode = cc.instantiate(this.bombEffectNode);
            if (null == objNode) return null;
            this.node.addChild(objNode, this._bombEffZI + i);
            objNode.active = true;
            objCmp = objNode.getComponent(Effect);
            if (null == objCmp) return null;
            objCmp.init();
            objCmp.hide();
            this._bombEffWaitArr.push(objCmp as Effect);
        }
    }

    private resetAllActors() {
        let enemyList: Enemy[] = [];
        let enemy: Enemy = null;
        for (const key in this._enemyRunArr) {
            enemyList = this._enemyRunArr[key];
            for (let i = enemyList.length - 1; i >= 0; --i) {
                enemy = enemyList[i];
                enemy.enemyHide();
                this._enemyWaitArr[key].push(enemy);
                enemyList.splice(i, 1);
            }
        }

        let bullet: Bullet = null;
        for (let i = this._heroBltRunArr.length - 1; i >= 0; --i) {
            bullet = this._heroBltRunArr[i];
            bullet.hide();
            this._heroBltWaitArr.push(bullet);
            this._heroBltRunArr.splice(i, 1);
        }



        let effect: Effect = null;
        for (let i = this._dzEffRunArr.length - 1; i >= 0; --i) {
            effect = this._dzEffRunArr[i];
            effect.hide();
            this._dzEffWaitArr.push(effect);
            this._dzEffRunArr.splice(i, 1);
        }

        for (let i = this._deathEffRunArr.length - 1; i >= 0; --i) {
            effect = this._deathEffRunArr[i];
            effect.hide();
            this._deathEffWaitArr.push(effect);
            this._deathEffRunArr.splice(i, 1);
        }

        for (let i = this._goldRunArr.length - 1; i >= 0; --i) {
            let gold:Gold = this._goldRunArr[i];
            gold.hide();
            this._goldWaitArr.push(gold);
            this._goldRunArr.splice(i, 1);
        }

        for (let i = this._bombEffRunArr.length - 1; i >= 0; --i) {
            effect = this._bombEffRunArr[i];
            effect.hide();
            this._bombEffWaitArr.push(effect);
            this._bombEffRunArr.splice(i, 1);
        }
    }

    cleanAllActors() {
        this._heroBltRunArr.forEach(e => { e.node.removeFromParent(); });
        this._heroBltRunArr = [];
        this._heroBltWaitArr.forEach(e => { e.node.removeFromParent(); });
        this._heroBltWaitArr = [];

        this._dzEffRunArr.forEach(e => { e.node.removeFromParent(); });
        this._dzEffRunArr = [];
        this._dzEffWaitArr.forEach(e => { e.node.removeFromParent(); });
        this._dzEffWaitArr = [];

        this._deathEffRunArr.forEach(e => { e.node.removeFromParent(); });
        this._deathEffRunArr = [];
        this._deathEffWaitArr.forEach(e => { e.node.removeFromParent(); });
        this._deathEffWaitArr = [];

        this._goldRunArr.forEach(e => { e.node.removeFromParent(); });
        this._goldRunArr = [];
        this._goldWaitArr.forEach(e => { e.node.removeFromParent(); });
        this._goldWaitArr = [];

        this._bombEffRunArr.forEach(e => { e.node.removeFromParent(); });
        this._bombEffRunArr = [];
        this._bombEffWaitArr.forEach(e => { e.node.removeFromParent(); });
        this._bombEffWaitArr = [];
    }

    cleanEnemys() {
        // this._enemyHPWaitArr.forEach(e=>{
        //     e.node.removeFromParent();
        //     e.destroy();
        // })
        this._enemyHPWaitArr =[];

        let enemyList: Enemy[] = [];
        for (const key in this._enemyRunArr) {
            enemyList = this._enemyRunArr[key];
            enemyList.forEach(e => {
                e.removeHpLabel();
                e.node.removeFromParent();
                e.destroy();
            });
            enemyList = [];
        }
        this._enemyRunArr = {};

        for (const key in this._enemyWaitArr) {
            enemyList = this._enemyWaitArr[key];
            enemyList.forEach(e => {
                e.node.removeFromParent();
                e.destroy();
            });
            enemyList = [];
        }
        this._enemyWaitArr = {};
    }
    cleanBullets() {
        this._heroBltWaitArr.forEach(e=>{
            e.node.removeFromParent();
            e.destroy();
        })
        this._heroBltWaitArr =[];
        this._heroBltRunArr.forEach(e => {
                e.node.removeFromParent();
                e.destroy();
            });

        this._heroBltRunArr = [];
    }

    private getHeroBullet(): Bullet {
        let actor: Bullet = null;
        if (0 < this._heroBltWaitArr.length) {
            actor = this._heroBltWaitArr.pop();
            this._heroBltRunArr.push(actor);
        } else if (0 < this._heroBltRunArr.length) {
            actor = this._heroBltRunArr.splice(0, 1)[0];
            this._heroBltRunArr.push(actor);
        }
        return actor;
    }

    private getEnemy(resName: string): Enemy {
        let actor: Enemy = null;
        let enemyList: Enemy[] = this._enemyWaitArr[resName];
        if (null != enemyList && 0 < enemyList.length) {
            actor = enemyList.pop();
            this._enemyRunArr[resName].push(actor);
        } else {
            cc.error(resName + " enemy cache num not enough!");
        }
        return actor;
    }



    private getDZEff(): Effect {
        let effect: Effect = null;
        if (0 < this._dzEffWaitArr.length) {
            effect = this._dzEffWaitArr.pop();
            this._dzEffRunArr.push(effect);
        } else if (0 < this._dzEffRunArr.length) {
            effect = this._dzEffRunArr.splice(0, 1)[0];
            this._dzEffRunArr.push(effect);
        }
        return effect;
    }

    private getDeathEff(): Effect {
        let effect: Effect = null;
        if (0 < this._deathEffWaitArr.length) {
            effect = this._deathEffWaitArr.pop();
            this._deathEffRunArr.push(effect);
        } else if (0 < this._deathEffRunArr.length) {
            effect = this._deathEffRunArr.splice(0, 1)[0];
            this._deathEffRunArr.push(effect);
        }
        return effect;
    }


    private getGoldEff(): Gold {
        let gold: Gold = null;
        if (0 < this._goldWaitArr.length) {
            gold = this._goldWaitArr.pop();
            this._goldRunArr.push(gold);
        } if (0 < this._goldRunArr.length) {
            gold = this._goldRunArr.splice(0, 1)[0];
            this._goldRunArr.push(gold);
        }
        return gold;
    }

    private getBombEff(): Effect {
        let effect: Effect = null;
        if (0 < this._bombEffWaitArr.length) {
            effect = this._bombEffWaitArr.pop();
            this._bombEffRunArr.push(effect);
        } if (0 < this._bombEffRunArr.length) {
            effect = this._bombEffRunArr.splice(0, 1)[0];
            this._bombEffRunArr.push(effect);
        }
        return effect;
    }

    private sortActors() {
        // if (0 == this.runEnemyNum) return;
        // let actorNodeArr: cc.Node[] = [];
        // //actorNodeArr.push(this.leader.node);
        // for (const key in this._enemyRunArr) {
        //     this._enemyRunArr[key].forEach(e => { actorNodeArr.push(e.node); });
        // }
        // actorNodeArr.sort(this.sortNodeY);
        // for (let i = 0; i < actorNodeArr.length; ++i) {
        //     actorNodeArr[i].zIndex = this._runActorZI + i;
        // }

        // let enemyList: Enemy[] = [];
        // let zIndex: number = 0;
        // for (const key in this._enemyWaitArr) {
        //     enemyList = this._enemyWaitArr[key];
        //     zIndex = this._enemyZI[key];
        //     for (let i = 0; i < enemyList.length; i++) {
        //         enemyList[i].node.zIndex = zIndex + i;
        //     }
        // }
    }

    private sortNodeY(actor1: cc.Node, actor2: cc.Node): number {
        return (actor1.position.y < actor2.position.y ? 1 : -1);
    }

}
