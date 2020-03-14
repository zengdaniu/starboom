// 代码生成,请不要手动修改
import { LevelCfg } from "./LevelCfg";
import { MonsterTeamCfg } from "./MonsterTeamCfg";
import { MonsterCfg } from "./MonsterCfg";
import { GoldCfg } from "./GoldCfg";
import { SignCfg } from "./SignCfg";
import { TaskCfg } from "./TaskCfg";
import { ArmsCfg } from "./ArmsCfg";
import { AttributesCfg } from "./AttributesCfg";

export class CfgConstants {

	public static readonly RES_LEVEL: string = "Level";
	public static readonly RES_MONSTERTEAM: string = "MonsterTeam";
	public static readonly RES_MONSTER: string = "Monster";
	public static readonly RES_GOLD: string = "Gold";
	public static readonly RES_SIGN: string = "Sign";
	public static readonly RES_TASK: string = "Task";
	public static readonly RES_ARMS: string = "Arms";
	public static readonly RES_ATTRIBUTES: string = "Attributes";

	public static getAllCfgName: Array<string> = 
		[
			CfgConstants.RES_LEVEL,
			CfgConstants.RES_MONSTERTEAM,
			CfgConstants.RES_MONSTER,
			CfgConstants.RES_GOLD,
			CfgConstants.RES_SIGN,
			CfgConstants.RES_TASK,
			CfgConstants.RES_ARMS,
			CfgConstants.RES_ATTRIBUTES
		];

	public static getCfgToName(name: string): any {
		switch (name) {
			case CfgConstants.RES_LEVEL:
				return LevelCfg;
			case CfgConstants.RES_MONSTERTEAM:
				return MonsterTeamCfg;
			case CfgConstants.RES_MONSTER:
				return MonsterCfg;
			case CfgConstants.RES_GOLD:
				return GoldCfg;
			case CfgConstants.RES_SIGN:
				return SignCfg;
			case CfgConstants.RES_TASK:
				return TaskCfg;
			case CfgConstants.RES_ARMS:
				return ArmsCfg;
			case CfgConstants.RES_ATTRIBUTES:
				return AttributesCfg;
		}
	}
}