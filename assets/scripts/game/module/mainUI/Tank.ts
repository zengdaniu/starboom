import Player from "../fight/actor/Player"
import { Cmn } from "../../frame/Cmn";
import { CfgConstants } from "../../cfg/CfgConstants";
import { WeaponData, UserDB ,UserDataKey} from "../../frame/UserData";
const {ccclass, property} = cc._decorator;
@ccclass
export default class Tank extends cc.Component {

    @property(cc.Node)
    players: cc.Node[] = [];

    private _player:Player =null;
    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.resetTank();
    }
    resetTank(){
        this.players.forEach(element => {
            element.active = false;
        });

        let cur_tank :string = "tank_" + Cmn.ud.userDB.curArmsId;
        this.players[Cmn.ud.userDB.curArmsId-1].active =true;
        this._player = this.players[Cmn.ud.userDB.curArmsId-1].getComponent(cur_tank);
        Cmn.ud.saveLocalSolt(UserDataKey.CURARMSID);
    }
    setXDirMove(x:number){
        this.node.x=x; 
        this._player.setXDirMove(this.node.x);
    }

    // update (dt) {}
}
