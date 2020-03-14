import { Win } from "../Win";
import { UserDB, WeaponData, UserDataKey } from "../../frame/UserData";
import { Cmn } from "../../frame/Cmn";
import { CfgConstants } from "../../cfg/CfgConstants";
import { ArmsCfg } from "../../cfg/ArmsCfg";
import { CalcType } from "../../frame/Calc";
import { UIKeyEnum } from "../../frame/UIMgr";
import MixedUtils from "../../utils/MixedUtils";

const { ccclass, property } = cc._decorator;

@ccclass
export class Weapon extends Win {

    @property(cc.Node)
    goodsBtn: cc.Node[] = [];
    @property(cc.Label)
    needGold: cc.Label[] = [];
    @property(cc.Label)
    content: cc.Label[] = [];
    @property(cc.Node)
    goldIcon: cc.Node[] = [];
    @property(cc.Sprite)
    panel: cc.Sprite[] = [];

    @property(cc.Label)
    buyLeb: cc.Label =null;

    private _userDB: UserDB;
    private _curArms: ArmsCfg;
    private _curData: WeaponData;
    private _curIndex: number;
    private _curSelect: number;

    private static att: string = "attactExpend";
    private static speed: string = "speedExpend";
    private static head: string = "spikeExpend";

    private _cbObject: any;
    private _cbFun: Function;
    setArgs(args: any[]) {
        this._cbObject = args[0];
        this._cbFun = args[1]; 
    }
    onEnable() {
        super.onEnable();
        this._userDB = Cmn.ud.userDB;
        for(let i:number = 0 ; i < this.goodsBtn.length ; i ++){
            if(i == this._userDB.curArmsId-1) {
                this.goodsBtn[i].getChildByName('Background').active =false ;
                this.panel[i].spriteFrame =this.panel[0].spriteFrame;
                this.needGold[i].node.active =false ;
                this.goldIcon[i].active =false;
                this.content[i].string ='已选择';
                this.buyLeb.string ='选择';
                this._curSelect = i ;
            }else if(this._userDB.ownArmsId.indexOf(i+1) !=-1 ){
                this.goodsBtn[i].getChildByName('Background').active =true ;
                this.panel[i].spriteFrame =this.panel[0].spriteFrame;
                this.needGold[i].node.active =false ;
                this.goldIcon[i].active =false;
                this.content[i].string ='可选择';
            }else{
                this.goodsBtn[i].getChildByName('Background').active =true ;
                this.content[i].node.active =false;

                let cfg :ArmsCfg = Cmn.cfg.getCfg(CfgConstants.RES_ARMS,i+1);
                this.needGold[i].string = cfg.gold ;                
                this.needGold[i].node.active =true ;
                this.goldIcon[i].active =true;
            }
        }
        
    }
    onBtnClick(event: cc.Event.EventTouch, customEventData: string){
        this.goodsBtn[this._curSelect].getChildByName('Background').active =true ;
        this.content[this._curSelect].string ='可选择';
        
        this._curSelect = Number(customEventData)-1;
        this.goodsBtn[this._curSelect].getChildByName('Background').active =false ;
        if(this._userDB.ownArmsId.indexOf(this._curSelect+1) !=-1){
            this.buyLeb.string ='选择';
            this.content[this._curSelect].string ='已选择';
            this._userDB.curArmsId = this._curSelect + 1;
            if (null != this._cbFun && null != this._cbObject) {
                this._cbFun.call(this._cbObject);
            }
        }else{
            this.buyLeb.string ='购买';
            this._curArms =Cmn.cfg.getCfg(CfgConstants.RES_ARMS,this._curSelect+1);
        }   

    }

    onBuyBtnClick(event: cc.Event.EventTouch, customEventData: string){
        if(this.content[this._curSelect].node.active == true){
            this.buyLeb.string ='已选择';
            this._userDB.curArmsId = this._curSelect + 1;
            return;
        }else{
            let num: number[] = Cmn.ud.newArr(this._userDB.money);
            num = Cmn.calc.calcNum(CalcType.REDUCE, num, Cmn.calc.strToArr(this._curArms.gold));
            if (1 == num.length && -1 == num[0]) {
                Cmn.ui.tip.pushLblArr("金币不足，请前往关卡获取");
                return;
            } else {
                this._userDB.money = num;
                this._userDB.upMoney++;
            }
            this._userDB.ownArmsId.push(this._curSelect+1);
            this._userDB.curArmsId = this._curSelect + 1;
            this.needGold[this._curSelect].node.active =false ;
            this.goldIcon[this._curSelect].active =false;
            this.content[this._curSelect].node.active =true;
            this.content[this._curSelect].string ='已选择';
            this.panel[this._curSelect].spriteFrame =this.panel[0].spriteFrame;
            this.buyLeb.string ='选择';

            Cmn.ud.saveLocalSolt(UserDataKey.OWNARMSID);
            Cmn.ud.saveLocalSolt(UserDataKey.CURARMSID);
            Cmn.ud.saveLocalSolt(UserDataKey.MONEY);
        }
        if (null != this._cbFun && null != this._cbObject) {
            this._cbFun.call(this._cbObject);
        }
    }

}