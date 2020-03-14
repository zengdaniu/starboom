// 代码生成,请不要手动修改
export class MonsterTeamCfg {

	public readonly id: number;     // Id
	public readonly monsterId: number[];     // 怪物id
	public readonly num: number[];     // 怪物数量

	constructor(param: string) {
		let data: Array<string> = param.split("\t");
		let index: number = 0;
		this.id = Number(data[index++]);
		this.monsterId = [];
		var strList: Array<string> = data[index++].split("|");
		var len: number = strList.length;
		for (let i: number = 0; i < len; i++) {
			this.monsterId.push(Number(strList[i]))
		}
		this.num = [];
		var strList: Array<string> = data[index++].split("|");
		var len: number = strList.length;
		for (let i: number = 0; i < len; i++) {
			this.num.push(Number(strList[i]))
		}
		return;
	}
}