import { Cmn } from "../../frame/Cmn";
import { UIKeyEnum } from "../../frame/UIMgr";
import { Win } from "../Win";
import { LevelCfg } from "../../cfg/LevelCfg";
import { CfgConstants } from "../../cfg/CfgConstants";
import { CalcType } from "../../frame/Calc";
import { UserDB, UserDataKey } from "../../frame/UserData";
import Fight from "./Fight";
import { TipsType } from "../tip/TipItem";
import { GameSprite } from "../../base/GameSprite";
import { AudioMgr, VolumeType } from "../../frame/AudioMgr";
import {ViewPosID} from "../../pt/Platform";
import MixedUtils from "../../utils/MixedUtils"
const { ccclass, property } = cc._decorator;

@ccclass
export default class TryOutEvent extends Win {//

    @property(cc.Node)
    progressBar: cc.Node = null;
    @property(cc.Node)
    LabelNode :cc.Node =null;
    @property(cc.Node)
    goods:cc.Node =null;

    private _timeInterval:number = 3;
    private _curTime:number =0;
    private _userDB: UserDB = null;
    private _finished :number = 0;
    private _reviveNum: number = 0;
    private _cbObject: any;
    private _cbFun: Function;
    private _weapons: number[] = [1,2,3,4];
    private _whichTry :number[] =[0,0,0];
    private sprite :cc.Sprite =null;
    setArgs(args: any[]) {
        this._cbObject = args[0];
        this._cbFun = args[1];
    }
    onEnable() {
        this._curTime=0;
        this._whichTry=[0,0,0];
        this.sprite =this.goods.getComponent(cc.Sprite);
        //获取玩家当前武器种类
        this._userDB = Cmn.ud.userDB;
        let unOwnArmsId:number[] =[];
        let types :number[]=[];
        let typeindex =0;
        for(let i:number = 0 ; i < this._weapons.length ; i ++){
            if(this._userDB.ownArmsId.indexOf(this._weapons[i])==-1){ //找不到该武器
                unOwnArmsId.push(this._weapons[i]);
            }
        }
        if(unOwnArmsId.length>0){
            types.push(1);
            types.push(1);  //策划说这个要两倍于双倍金币 权重30
        }
        //体验攻速
        if(this._userDB.weapon.speed<Cmn.cfg.getCfg(CfgConstants.RES_ATTRIBUTES,1).maxLevel*0.75){
            types.push(2);
            types.push(2);//策划说这个要两倍于双倍金币 权重30
        }
        //体验双倍金币
        types.push(3); //权重15
        
        typeindex =this.randomINdex(0,types.length-1);//MixedUtils.randomFrom(0,types.length-1);
        switch(types[typeindex]){
            case 1 :{
                this.LabelNode.getComponent(cc.Label).string ="观看视频免费体验炮台皮肤";
                this._whichTry[0] =2;
                this._whichTry.entries()
                typeindex =this.randomINdex(0,types.length-1);//MixedUtils.randomFrom(0,unOwnArmsId.length-1);
                this._whichTry[0] =unOwnArmsId[typeindex];
                let path: string ="img/mainUI/tank" +this._whichTry[0];// + index;
                Cmn.res.setSprite(path, this.sprite);
                break;
            }
            case 2:{
                this.LabelNode.getComponent(cc.Label).string ="观看视频免费体验满级攻速";
                this._whichTry[1] =1;
                let path: string ="img/mainUI/speed";// + index;
                Cmn.res.setSprite(path, this.sprite);
                break;
            }
            case 3 :{
                this.LabelNode.getComponent(cc.Label).string ="观看视频免费体验双倍金币";
                this._whichTry[2] =1;   
                let path: string ="img/mainUI/getGold";// + index;
                Cmn.res.setSprite(path, this.sprite);             
                break;
            }
        }
        this.progressBar.getComponent(cc.ProgressBar).progress=1;
        Cmn.audio.playMusic(VolumeType.EFFECT, AudioMgr.EFF_SWITCH);
        // cc.director.pause();
    }
    randomINdex(start:number,end:number){
        return Math.floor(Math.random()*999%(end-start+1))+start;
    }
    update(dt){
        this._curTime +=dt;
        if(this._curTime>this._timeInterval){
            this.closeWindow();
            return;
        }else{
            this.progressBar.getComponent(cc.ProgressBar).progress=(this._timeInterval-this._curTime)/this._timeInterval;
        }

    }
    onDisable() {
        Cmn.pf.hideBanner();
        // cc.director.resume();
    }
    watchVideo(){
        Cmn.pf.showVideo(ViewPosID.FreeRelive,null, null, this.onExtraHpCB, this);
        //Cmn.pf.hideBanner();
    }
    onExtraHpCB(status:boolean){
        if(!status){
            Cmn.pf.showBanner();
            return;
        }

        if (null != this._cbFun && null != this._cbObject) {
            this._cbFun.call(this._cbObject,true,this._whichTry);
        }
        this._cbFun = null;
        this._cbObject = null;
        Cmn.ud.userDB.watchTv++;
        Cmn.pf.showBanner();
        this.closeWindow();
    }
}
