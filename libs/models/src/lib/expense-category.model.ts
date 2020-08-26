import { ITenant } from './tenant.model';
import { BaseEntityModel as IBaseEntityModel } from './base-entity.model';

export interface IExpenseCategory extends IBaseEntityModel {
	name: string;
	organizationId: string;
	tenant: ITenant;
}

export enum ExpenseCategoriesEnum {
	SOFTWARE = 'Software',
	EMPLOYEES_BENEFITS = 'Employees Benefits',
	COURSES = 'Courses',
	SUBSCRIPTIONS = 'Subscriptions',
	RENT = 'Rent',
	SERVICE_FEE = 'Service Fee'
}
