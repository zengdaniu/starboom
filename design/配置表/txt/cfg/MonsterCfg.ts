// 代码生成,请不要手动修改
export class MonsterCfg {

	public readonly id: number;     // Id
	public readonly icon: string;     // Icon
	public readonly split: number;     // 能否分裂,1.可以,2.不可以
	public readonly hp: number;     // 生命值
	public readonly g: number;     // 重力加速度
	public readonly speed: number;     // 速度,底部反弹时初始速度
	public readonly high: number;     // 弹跳高度
	public readonly gold: number[];     // 击杀获得金币
	public readonly goldNum: number[];     // 金币数量
	public readonly monsterId: number[];     // 分裂怪物id
	public readonly frame: number[];     // 碰撞框大小

	constructor(param: string) {
		let data: Array<string> = param.split("\t");
		let index: number = 0;
		this.id = Number(data[index++]);
		this.icon = data[index++];
		this.split = Number(data[index++]);
		this.hp = Number(data[index++]);
		this.g = Number(data[index++]);
		this.speed = Number(data[index++]);
		this.high = Number(data[index++]);
		this.gold = [];
		var strList: Array<string> = data[index++].split("|");
		var len: number = strList.length;
		for (let i: number = 0; i < len; i++) {
			this.gold.push(Number(strList[i]))
		}
		this.goldNum = [];
		var strList: Array<string> = data[index++].split("|");
		var len: number = strList.length;
		for (let i: number = 0; i < len; i++) {
			this.goldNum.push(Number(strList[i]))
		}
		this.monsterId = [];
		var strList: Array<string> = data[index++].split("|");
		var len: number = strList.length;
		for (let i: number = 0; i < len; i++) {
			this.monsterId.push(Number(strList[i]))
		}
		this.frame = [];
		var strList: Array<string> = data[index++].split("|");
		var len: number = strList.length;
		for (let i: number = 0; i < len; i++) {
			this.frame.push(Number(strList[i]))
		}
		return;
	}
}