import { UserDB, UserDataKey } from "../../frame/UserData";
import { Cmn } from "../../frame/Cmn";
import { CfgConstants } from "../../cfg/CfgConstants";
import { TaskCfg } from "../../cfg/TaskCfg";
import MixedUtils from "../../utils/MixedUtils";
import { CalcType } from "../../frame/Calc";

const { ccclass, property } = cc._decorator;
@ccclass
export class Task extends cc.Component {
    @property(cc.Label)
    content :cc.Label =null;
    @property(cc.Button)
    getBtn :cc.Label =null;
    @property(cc.Sprite)
    succeesBar :cc.Sprite =null;
    @property(cc.Label)
    unsuccees :cc.Label =null;

    private _curDt : number = 0;
    private _interval :number = 2;
    private _cfg :TaskCfg = null;
    onEnable(){
      
        this.initTask();
        //判断是否完成
        this.checkSuccees();
    }
    onGetBtnClick(){
        //领取
        let udb = Cmn.ud.userDB;
        let addVal: number[] = Cmn.ud.newArr(Cmn.calc.strToArr(this._cfg.num) );
        let money :number []=Cmn.ud.newArr(udb.money);
        Cmn.calc.calcNum(CalcType.PLUS,money, addVal);
        udb.upMoney++;
        udb.money =money;
        Cmn.ud.saveLocalSolt(UserDataKey.MONEY);
        
        //换一个任务
        Cmn.ud.userDB.taskId=this._cfg.rearTask;
        Cmn.ud.saveLocalSolt(UserDataKey.TASKID);
        this.initTask();
        //暂时不知道策划怎么想的，设想领取任务后才开始
        Cmn.ud.userDB.watchTv = 0;
        Cmn.ud.userDB.upAttribute = 0;
        this.checkSuccees();
        
    }
    initTask(){
        this._cfg = Cmn.cfg.getCfg(CfgConstants.RES_TASK, Cmn.ud.userDB.taskId);
        this.content.string =this._cfg.des;
    }
    checkSuccees(){
        let succees :boolean =false;
        switch(this._cfg.type){
            case TaskType.LEVEL :
                if (this._cfg.condition1 < Cmn.ud.userDB.curChapter && this._cfg.condition1 < Cmn.ud.userDB.curChapter)
                    succees = true;
                break;
            case TaskType.SIGNIN :
                if (Cmn.ud.userDB.signIn>0 && this._cfg.condition1 <= Cmn.ud.userDB.signDays)
                    succees = true;
                break;
            case TaskType.UPATTR :
                if (Cmn.ud.userDB.upAttribute>0 && this._cfg.condition1 < Cmn.ud.userDB.upAttribute)
                    succees = true;
                break;    
            case TaskType.WATCHTV :
                if (Cmn.ud.userDB.watchTv>0 && this._cfg.condition1 < Cmn.ud.userDB.watchTv)
                    succees = true;
                break;
            default :
                break;    
        }
        if(succees){
            this.getBtn.node.active = true;
            this.unsuccees.node.active =false;
            //this.succeesBar.node.color=new cc.Color(2,153,86);
            this.succeesBar.node.active=true;
        }else {
            this.getBtn.node.active = false;
            this.unsuccees.node.active =true;
            this.succeesBar.node.color=new cc.Color(255,255,255);
            this.succeesBar.node.active=false;
        }
    }

    update(dt){
        this._curDt +=dt;
        if(this._curDt > this._interval){
            this.checkSuccees();
        }
    }


}
enum TaskType {
    LEVEL = 1 ,
    SIGNIN = 2 ,
    UPATTR = 3 ,
    WATCHTV = 4
}