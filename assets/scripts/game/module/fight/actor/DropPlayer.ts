
const { ccclass, property } = cc._decorator;

@ccclass
export default class DropPlayer extends cc.Component {

    @property(Boolean)
    playOnLoad: boolean = false;
    @property(Number)
    blinkTimeout: number = 3;

    private _curTimeIT: number = 0;
    private _cbFun: Function = null;
    private _cbObj: any = null;
    private _speedY:number =null;
    private _speedX:number =null;
    private _g     :number =70;
    private _move  :Boolean =true;
    private _blink :number =0;
    onEnable() {
        this.playOnLoad && this.play(0);
    }

    update(dt) {
        if(this._cbObj==null) return;
        if(this._move) //控制降落
        {
            this.node.angle += dt*40;
            if(this.node.angle >=450) this.node.angle =0;
            //加速度的方式
            let sY = this._speedY*dt-this._g*dt*dt/2;
            let sX = this._speedX*dt;
            this._speedY -= this._g*dt; 
    
            let newPos: cc.Vec2 = this.node.position.add(cc.v2(sX,sY).mul(10));
            if((newPos.y-this.node.width/2) < -450){
                newPos.y=-450+this.node.width/2;
                this._speedY = -this._speedY*0.5;  //高速衰减
                if(this._speedY < this._g*dt){
                    this._move =false;
                }
            }
    
            if(Math.abs(newPos.x)+this.node.width/2 >350){
                newPos.x /= Math.abs(newPos.x); //保持符号不变
                newPos.x *= (350-this.node.width/2) ;
                this._speedX= -this._speedX;
            }
            this.node.setPosition(newPos);
        }else{  //控制闪烁
            this._curTimeIT +=dt;
            if(this._curTimeIT >= this.blinkTimeout){
                if(this._cbObj!=null && this._cbFun !=null)
                    this._cbFun.call(this._cbObj);
            }
            else{
                if(this._blink<5){
                    var opacityRatio = 1 - this._curTimeIT/this.blinkTimeout;
                    var minOpacity = 50 ;
                    this.node.opacity = minOpacity+ Math.floor(opacityRatio * (255 - minOpacity));
                    this._blink ++;
                }else{
                    this._blink =0;
                    this.node.opacity =255;
                }
            }
        }
    }

    play(speedX:number=0,speedY:number=0) {
        this._speedX=speedX;
        this._speedY =speedY;
        this._move =true;
        this._curTimeIT =0;
        this.node.opacity =255;
    }
    stop() {
        this._cbFun = null;
        this._cbObj = null;
        this.node.opacity =255;
    }
    setEndCB(obj: any, fun: Function) {
        this._cbObj = obj;
        this._cbFun = fun;
    }
}


// 对象状态
export enum FrameType {
    Enemy = 0,       // 怪物
    Effect = 1,      // 特效
}