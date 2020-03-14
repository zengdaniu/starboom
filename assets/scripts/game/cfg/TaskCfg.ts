// 代码生成,请不要手动修改
export class TaskCfg {

	public readonly id: number;     // Id
	public readonly rearTask: number;     // 后置任务
	public readonly des: string;     // 任务描述
	public readonly type: number;     // 任务类型
	public readonly condition1: number;     // 条件1
	public readonly condition2: number;     // 条件2
	public readonly num: string;     // 金币数量

	constructor(param: string) {
		let data: Array<string> = param.split("\t");
		let index: number = 0;
		this.id = Number(data[index++]);
		this.rearTask = Number(data[index++]);
		this.des = data[index++];
		this.type = Number(data[index++]);
		this.condition1 = Number(data[index++]);
		this.condition2 = Number(data[index++]);
		this.num = data[index++];
		return;
	}
}