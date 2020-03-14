// 代码生成,请不要手动修改
export class SignCfg {

	public readonly id: number;     // Id
	public readonly icon: string;     // 金币Icon
	public readonly gold: string;     // 金币奖励

	constructor(param: string) {
		let data: Array<string> = param.split("\t");
		let index: number = 0;
		this.id = Number(data[index++]);
		this.icon = data[index++];
		this.gold = data[index++];
		return;
	}
}