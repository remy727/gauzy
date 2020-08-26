import { Column, Entity, Index, ManyToOne, RelationId } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
	IsNotEmpty,
	IsString,
	IsNumber,
	Min,
	Max,
	IsEnum
} from 'class-validator';
import {
	EmployeeSetting as IEmployeeSetting,
	CurrenciesEnum
} from '@gauzy/models';
import { Employee } from '../employee/employee.entity';
import { TenantBase } from '../core/entities/tenant-base';

@Entity('employee_setting')
export class EmployeeSetting extends TenantBase implements IEmployeeSetting {
	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@Index()
	@Column()
	employeeId: string;

	@ApiProperty({ type: Number, minimum: 1, maximum: 12 })
	@IsNumber()
	@IsNotEmpty()
	@Min(1)
	@Max(12)
	@Column()
	month: number;

	@ApiProperty({ type: Number, minimum: 1 })
	@IsNumber()
	@IsNotEmpty()
	@Min(0)
	@Column()
	year: number;

	@ApiProperty({ type: String })
	@IsString()
	@IsNotEmpty()
	@Index()
	@Column()
	settingType: string;

	@ApiProperty({ type: Number })
	@IsNumber()
	@IsNotEmpty()
	@Column()
	value: number;

	@ApiProperty({ type: String, enum: CurrenciesEnum })
	@IsEnum(CurrenciesEnum)
	@IsNotEmpty()
	@Index()
	@Column()
	currency: string;

	@ManyToOne((type) => Employee, (employee) => employee.id)
	employee: Employee;

	@ApiProperty({ type: String })
	@Column()
	organization: string;

	@ApiProperty({ type: String, readOnly: true })
	@RelationId(
		(employeeSetting: EmployeeSetting) => employeeSetting.organization
	)
	@IsString()
	@Column({ nullable: true })
	organizationId: string;
}
