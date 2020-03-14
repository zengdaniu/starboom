// 代码生成,请不要手动修改
export class AttributesCfg {

	public readonly id: number;     // Id
	public readonly type: number;     // 类型,1.射速,2.攻击,3.离线奖励,4.复活次数
	public readonly value: number;     // 初始值,/100
	public readonly upValue: number;     // 增长值,/100
	public readonly gold: string;     // 初始升级消耗金钱
	public readonly upGold: string;     // 每级增长
	public readonly maxLevel: number;     // 等级上限

	constructor(param: string) {
		let data: Array<string> = param.split("\t");
		let index: number = 0;
		this.id = Number(data[index++]);
		this.type = Number(data[index++]);
		this.value = Number(data[index++]);
		this.upValue = Number(data[index++]);
		this.gold = data[index++];
		this.upGold = data[index++];
		this.maxLevel = Number(data[index++]);
		return;
	}
}