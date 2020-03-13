import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ZeroPoolService } from '../../services/zero-pool.service';
import { tw } from 'zeropool-lib';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { of, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AmountValidatorParams, CustomValidators } from '../gas-deposit/custom-validators';
import { Web3ProviderService } from '../../services/web3.provider.service';
import {
  depositProgress,
  depositProgress$,
  UnconfirmedTransactionService,
  UnconfirmedTxProgressNotification
} from '../../services/unconfirmed-transaction.service';
import { TransactionService } from '../../services/transaction.service';
import { ProgressMessageComponent } from '../progress-message/progress-message.component';
import { environment } from '../../../environments/environment';
import { ActionList, StepList } from '../progress-message/transaction-progress';

@Component({
  selector: 'app-deposit',
  templateUrl: './deposit.component.html',
  styleUrls: ['./deposit.component.scss']
})
export class DepositComponent implements AfterViewInit, OnDestroy {

  availableEthAmount: number;

  transactionHash: string;

  isFinished = false;
  isFinishedWithError = false;

  depositInProgress = false;

  subscription: Subscription;

  @ViewChild('progressDialog')
  progressDialog: ProgressMessageComponent;

  public form: FormGroup = this.fb.group({
    amount: ['', [Validators.required, Validators.max(0.1)]], // Min, Balance
  });

  get amount(): AbstractControl {
    return this.form.get('amount');
  }

  get maxEth(): number {
    return 0.1;
  }

  get minEth(): number {
    return 10e-18;
  }

  get amountValidatorParams(): AmountValidatorParams {
    return {
      maxAmount: this.maxEth,
      minAmount: this.minEth,
    };
  }

  constructor(
    private location: Location,
    private zpService: ZeroPoolService,
    private txService: TransactionService,
    private web3Service: Web3ProviderService,
    private fb: FormBuilder
  ) {
    this.availableEthAmount = this.zpService.ethBalance;
  }

  ngAfterViewInit(): void {

    // Ethereum balances
    this.subscription = this.web3Service.isReady$.pipe(
      switchMap(
        () => this.web3Service.getEthBalance()
      ),
      tap((ethBalance: number) => {
        const amountValidatorParams = {
          ...this.amountValidatorParams,
          availableAmount: ethBalance,
        };

        const amountValidator = CustomValidators.amount(amountValidatorParams);
        this.amount.setValidators([Validators.required, amountValidator]);
        this.form.get('amount').updateValueAndValidity();
      })
    ).subscribe();


    setTimeout(() => {
      // Handling case when subscription is already in progress
      if (UnconfirmedTransactionService.hasOngoingDepositTransaction()) {

        if (depositProgress.value) {
          this.depositInProgress = true;
          this.setProgressState(depositProgress.value.step, depositProgress.value.extraData);
        }

        const progress = depositProgress$.subscribe(
          (progressStep: UnconfirmedTxProgressNotification) => {
            progressStep && this.setProgressState(progressStep.step, progressStep.extraData);
          },
          () => {
          },
          () => {
            this.depositInProgress = false;
            this.isFinished = true;
          }
        );

        this.subscription.add(progress);
      }
    });

  }

  private setProgressState(progressStep: StepList, txHash?: string) {
    if (progressStep === StepList.FAILED) {
      this.depositInProgress = false;
      this.isFinishedWithError = true;
      return;
    }

    if (txHash) {
      txHash = environment.etherscanPrefix + txHash;
    }

    const action = ActionList.DEPOSIT;
    this.progressDialog.showMessage(action, progressStep, txHash);
  }

  ngOnDestroy(): void {
    this.subscription && this.subscription.unsubscribe();
  }

  onDepositClick(): void {
    this.depositInProgress = true;

    this.setProgressState(StepList.GENERATE_TRANSACTION);

    const amount = tw(this.amount.value).toNumber();

    const progressCallback = (progressStep, txHash) => {
      this.setProgressState(progressStep, txHash);
    };

    // Generate ZeroPool transaction

    this.txService.deposit(environment.ethToken, amount, environment.relayerFee, progressCallback).pipe(
      tap((txHash: any) => {
        this.isFinished = true;

        console.log({
          deposit: txHash
        });

      }),
      catchError((e) => {
        this.isFinishedWithError = true;
        console.log(e);
        return of('');
      }),
      tap(() => {
        this.depositInProgress = false;
        UnconfirmedTransactionService.deleteDepositTransaction();

      })
    ).subscribe();
  }

}

