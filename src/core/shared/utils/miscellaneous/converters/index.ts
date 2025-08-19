import { BoolEnum } from '../../../models/enums/bool.enum';
import { StatusEnum } from '../../../models/enums/status.enum';

export namespace ConvertersWrapper {
	export function booleanToBoolEnum(value: boolean): BoolEnum {
		return value ? BoolEnum.YES : BoolEnum.NO;
	}

	export function boolEnumToBoolean(value: BoolEnum): boolean {
		return value === BoolEnum.YES;
	}

	export function booleanToStatusEnum(value: boolean): StatusEnum {
		return value ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
	}

	export function statusEnumToBoolean(value: StatusEnum): boolean {
		return value === StatusEnum.ACTIVE;
	}

	export function boolEnumToStatusEnum(value: BoolEnum): StatusEnum {
		return value === BoolEnum.YES ? StatusEnum.ACTIVE : StatusEnum.INACTIVE;
	}

	export function statusEnumToBoolEnum(value: StatusEnum): BoolEnum {
		return value === StatusEnum.ACTIVE ? BoolEnum.YES : BoolEnum.NO;
	}

	export function toObject<T>(value: any | unknown | object): T {
		return value as T;
	}
}
