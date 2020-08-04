import { TranslationBaseComponent } from '../../@shared/language-base/translation-base.component';
import { OnInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { LocalDataSource } from 'ng2-smart-table';
import { PaymentService } from '../../@core/services/payment.service';
import { Store } from '../../@core/services/store.service';
import { takeUntil, first } from 'rxjs/operators';
import { Subject } from 'rxjs';
import {
	Payment,
	ComponentLayoutStyleEnum,
	Invoice,
	Organization,
	OrganizationSelectInput
} from '@gauzy/models';
import { OrganizationContactService } from '../../@core/services/organization-contact.service';
import { InvoicePaymentOverdueComponent } from '../invoices/table-components/invoice-payment-overdue.component';
import { ComponentEnum } from '../../@core/constants/layout.constants';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { PaymentMutationComponent } from '../invoices/invoice-payments/payment-mutation/payment-mutation.component';
import { NbDialogService, NbToastrService } from '@nebular/theme';
import { InvoicesService } from '../../@core/services/invoices.service';
import { OrganizationsService } from '../../@core/services/organizations.service';
import { DeleteConfirmationComponent } from '../../@shared/user/forms/delete-confirmation/delete-confirmation.component';

@Component({
	selector: 'ngx-payments',
	templateUrl: './payments.component.html',
	styleUrls: ['./payments.component.scss']
})
export class PaymentsComponent extends TranslationBaseComponent
	implements OnInit, OnDestroy {
	@ViewChild('invoicesTable') paymentsTable;

	constructor(
		readonly translateService: TranslateService,
		private paymentService: PaymentService,
		private store: Store,
		private organizationContactService: OrganizationContactService,
		private dialogService: NbDialogService,
		private router: Router,
		private invoicesService: InvoicesService,
		private organizationsService: OrganizationsService,
		private toastrService: NbToastrService
	) {
		super(translateService);
		this.setView();
	}

	settingsSmartTable: object;
	smartTableSource = new LocalDataSource();
	selectedPayment: Payment;
	payments: Payment[];
	paymentsData: Payment[];
	private _ngDestroy$ = new Subject<void>();
	viewComponentName: ComponentEnum;
	dataLayoutStyle = ComponentLayoutStyleEnum.TABLE;
	invoices: Invoice[];
	organization: Organization;
	disableButton = true;
	currency: string;

	ngOnInit() {
		this.loadSmartTable();
		this._applyTranslationOnSmartTable();
		this.loadSettings();
		this.router.events
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((event: RouterEvent) => {
				if (event instanceof NavigationEnd) {
					this.setView();
				}
			});
	}

	setView() {
		this.viewComponentName = ComponentEnum.PAYMENTS;
		this.store
			.componentLayout$(this.viewComponentName)
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe((componentLayout) => {
				this.dataLayoutStyle = componentLayout;
			});
	}

	async loadSettings() {
		this.store.selectedOrganization$
			.pipe(takeUntil(this._ngDestroy$))
			.subscribe(async (org) => {
				if (org) {
					this.organization = org;
					const orgData = await this.organizationsService
						.getById(org.id, [OrganizationSelectInput.currency])
						.pipe(first())
						.toPromise();
					this.currency = orgData.currency;
					const invoices = await this.invoicesService.getAll([], {
						organizationId: org.id,
						isEstimate: false
					});
					this.invoices = invoices.items;
					this.selectedPayment = null;
					const { items } = await this.paymentService.getAll(
						['invoice', 'recordedBy'],
						{
							organizationId: org.id
						}
					);
					for (const payment of items) {
						if (payment.invoice) {
							const organizationContact = await this.organizationContactService.getById(
								payment.invoice.organizationContactId
							);
							payment.invoice.toContact = organizationContact;
						}
					}
					this.smartTableSource.load(items);
				}
			});
	}

	async recordPayment() {
		const result = await this.dialogService
			.open(PaymentMutationComponent, {
				context: {
					invoices: this.invoices,
					organization: this.organization,
					currencyString: this.currency
				}
			})
			.onClose.pipe(first())
			.toPromise();

		if (result) {
			result['organizationId'] = this.organization.id;
			await this.paymentService.add(result);
			await this.loadSettings();
		}
	}

	async editPayment() {
		const result = await this.dialogService
			.open(PaymentMutationComponent, {
				context: {
					invoices: this.invoices,
					organization: this.organization,
					payment: this.selectedPayment
				}
			})
			.onClose.pipe(first())
			.toPromise();

		if (result) {
			await this.paymentService.update(result.id, result);
			await this.loadSettings();
		}
	}

	async deletePayment() {
		const result = await this.dialogService
			.open(DeleteConfirmationComponent)
			.onClose.pipe(first())
			.toPromise();

		if (result) {
			await this.paymentService.delete(this.selectedPayment.id);
			this.loadSettings();
			this.toastrService.primary(
				this.getTranslation('INVOICES_PAGE.PAYMENTS.PAYMENT_DELETE'),
				this.getTranslation('TOASTR.TITLE.SUCCESS')
			);
		}
		this.disableButton = true;
	}

	loadSmartTable() {
		this.settingsSmartTable = {
			actions: false,
			columns: {
				amount: {
					title: this.getTranslation('PAYMENTS_PAGE.AMOUNT'),
					type: 'text',
					filter: false
				},
				paymentDate: {
					title: this.getTranslation('PAYMENTS_PAGE.PAYMENT_DATE'),
					type: 'text',
					valuePrepareFunction: (cell, row) => {
						return `${cell.slice(0, 10)}`;
					}
				},
				paymentMethod: {
					title: 'Payment Method',
					type: 'text'
				},
				currency: {
					title: 'Currency',
					type: 'text'
				},
				recordedBy: {
					title: this.getTranslation('PAYMENTS_PAGE.RECORDED_BY'),
					type: 'text',
					filter: false,
					valuePrepareFunction: (cell, row) => {
						if (cell.firstName && cell.lastName) {
							return `${cell.firstName} ${cell.lastName}`;
						} else {
							return ``;
						}
					}
				},
				note: {
					title: this.getTranslation('PAYMENTS_PAGE.NOTE'),
					type: 'text',
					filter: false
				},
				invoiceNumber: {
					title: this.getTranslation('INVOICES_PAGE.INVOICE_NUMBER'),
					type: 'text',
					filter: false,
					valuePrepareFunction: (cell, row) => {
						if (row.invoice) {
							return row.invoice.invoiceNumber;
						}
					}
				},
				organizationContactName: {
					title: this.getTranslation('PAYMENTS_PAGE.CONTACT'),
					type: 'text',
					valuePrepareFunction: (cell, row) => {
						if (row.invoice) {
							return row.invoice.toContact.name;
						}
					}
				},
				overdue: {
					title: this.getTranslation('PAYMENTS_PAGE.STATUS'),
					type: 'custom',
					renderComponent: InvoicePaymentOverdueComponent
				}
			}
		};
	}

	async selectPayment({ isSelected, data }) {
		const selectedPayment = isSelected ? data : null;
		if (this.paymentsTable) {
			this.paymentsTable.grid.dataSet.willSelect = false;
		}
		this.disableButton = !isSelected;
		this.selectedPayment = selectedPayment;
	}

	_applyTranslationOnSmartTable() {
		this.translateService.onLangChange.subscribe(() => {
			this.loadSmartTable();
		});
	}

	ngOnDestroy() {
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
}
