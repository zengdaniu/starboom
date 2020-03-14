// 代码生成,请不要手动修改
export class OfflineCfg {

	public readonly id: number;     // Id
	public readonly level: number;     // 关卡数
	public readonly gold: string;     // 每秒获得金币

	constructor(param: string) {
		let data: Array<string> = param.split("\t");
		let index: number = 0;
		this.id = Number(data[index++]);
		this.level = Number(data[index++]);
		this.gold = data[index++];
		return;
	}
}