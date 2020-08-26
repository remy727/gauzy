import { ITenant } from './tenant.model';
import { BaseEntityModel as IBaseEntityModel } from './base-entity.model';
import { Tag } from './tag-entity.model';

export interface OrganizationPositions extends IBaseEntityModel {
	name: string;
	organizationId: string;
	tags: Tag[];
	tenant: ITenant;
}

export interface OrganizationPositionsFindInput extends IBaseEntityModel {
	name?: string;
	organizationId?: string;
}

export interface OrganizationPositionsCreateInput {
	name: string;
	organizationId: string;
	tags: Tag[];
}
