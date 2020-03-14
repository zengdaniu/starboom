// 代码生成,请不要手动修改
export class ArmsCfg {

	public readonly id: number;     // Id
	public readonly icon: string;     // Icon
	public readonly gold: string;     // 激活金币
	public readonly bullet: number;     // 子弹效果,1.单弹道,2.多弹道,3.散弹,4.追踪弹
	public readonly fireIT: number;     // 发射间隔,/100
	public readonly fireTI: number;     // 发射时钟,/100

	constructor(param: string) {
		let data: Array<string> = param.split("\t");
		let index: number = 0;
		this.id = Number(data[index++]);
		this.icon = data[index++];
		this.gold = data[index++];
		this.bullet = Number(data[index++]);
		this.fireIT = Number(data[index++]);
		this.fireTI = Number(data[index++]);
		return;
	}
}