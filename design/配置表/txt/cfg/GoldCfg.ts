// 代码生成,请不要手动修改
export class GoldCfg {

	public readonly id: number;     // Id
	public readonly icon: string;     // Icon
	public readonly gold: number;     // 金币值

	constructor(param: string) {
		let data: Array<string> = param.split("\t");
		let index: number = 0;
		this.id = Number(data[index++]);
		this.icon = data[index++];
		this.gold = Number(data[index++]);
		return;
	}
}