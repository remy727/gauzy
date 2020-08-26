import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
	Column,
	Entity,
	JoinColumn,
	RelationId,
	ManyToOne,
	OneToMany
} from 'typeorm';
import { Tenant } from '../tenant/tenant.entity';
import { IIntegrationTenant } from '@gauzy/models';
import { IntegrationEntitySetting } from '../integration-entity-setting/integration-entity-setting.entity';
import { TenantBase } from '../core/entities/tenant-base';

@Entity('integration_tenant')
export class IntegrationTenant extends TenantBase
	implements IIntegrationTenant {
	@ApiProperty({ type: Tenant })
	@ManyToOne((type) => Tenant, {
		nullable: false
	})
	@JoinColumn()
	tenant: Tenant;

	@ApiProperty({ type: String, readOnly: true })
	@RelationId((integration: IntegrationTenant) => integration.tenant)
	readonly tenantId: string;

	@ApiPropertyOptional({ type: IntegrationEntitySetting, isArray: true })
	@OneToMany(
		(type) => IntegrationEntitySetting,
		(setting) => setting.integration
	)
	@JoinColumn()
	entitySettings?: IntegrationEntitySetting[];

	@ApiProperty({ type: String })
	@Column({ nullable: false })
	name: string;
}
