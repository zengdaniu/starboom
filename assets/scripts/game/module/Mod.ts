import { GameSprite } from "../base/GameSprite";
import { Win } from "./Win";

const { ccclass, property } = cc._decorator;

@ccclass
export class Mod extends GameSprite {
  @property(Number)
  selfId: number = 0;
  @property(cc.Button)
  returnButton: cc.Button = null; //返回按钮——引导用
  @property(Boolean)
  protected ifStopGuide: Boolean = true; //引导时该面板弹出，是否可以打断当前引导，导致其返回第一步（此类面板一经发现不是目标面板，都是能导致引导返回第一步的，特效类面板暂时设定为不能打断引导）

  moduleName: string;
  _windowList: Win[] = [];

  isWindow: boolean = false;

  init() {
    this.isWindow = false;
  }

  /**
   * 设置模块参数
   *
   * @param {...any[]} args
   * @memberof Module
   */
  setArgs(...args: any[]) { }

  //获取当前面板是否可以打断引导
  get canStopGuide(): boolean {
    return this.ifStopGuide == true;
  }

  /**
   * 释放模块资源
   *
   * @memberof Module
   */
  release() { }
}
