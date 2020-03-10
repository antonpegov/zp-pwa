import {Component, OnInit, ViewChild} from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { tw } from 'zeropool-lib';
import { getEthAddressSafe } from '../../services/web3.provider.service';
import { environment } from '../../../environments/environment';
import { catchError, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ProgressMessageComponent } from '../progress-message/progress-message.component';
import { TransactionService } from '../../services/transaction/transaction.service';

@Component({
  selector: 'app-withdraw',
  templateUrl: './withdraw.component.html',
  styleUrls: ['./withdraw.component.scss']
})
export class WithdrawComponent implements OnInit {

  transactionHash: string;

  myZpBalance: number;

  isDone = false;
  isDoneWithError = false;
  withdrawIsInProgress = true;

  @ViewChild('progressDialog')
  progressDialog: ProgressMessageComponent;

  public transferForm: FormGroup = this.fb.group({
    toAmount: [''],
    toAddress: new FormControl('', [
      // Validators.required,
      // ValidateMnemonic
    ])
  });

  get toAmount(): number {
    return this.transferForm.get('toAmount').value;
  }

  get toAddress(): string {
    return this.transferForm.get('toAddress').value;
  }

  constructor(
    private fb: FormBuilder,
    private txService: TransactionService
  ) {
  }

  ngOnInit(): void {
    const a = getEthAddressSafe();
    this.transferForm.get('toAddress').setValue(a.replace('0x', ''));
  }

  onSendClick(): void {
    this.withdrawIsInProgress = true;

    const amount = tw(this.toAmount).toNumber();

    const progressCallback = (progressStep) => {
      if (progressStep === 'generate-zp-tx') {
        this.progressDialog.showMessage({
          title: 'Withdraw in progress',
          lineOne: 'Generating Zero Pool Transaction',
          lineTwo: 'It will take a bit'
          // isLineTwoBold: true
        });
      } else if (progressStep === 'wait-for-zp-block') {
        this.progressDialog.showMessage({
          title: 'Withdraw in progress',
          lineOne: 'Transaction published',
          lineTwo: 'Wait for ZeroPool block',
          isLineTwoBold: true
        });
      }
    };

    this.txService.prepareWithdraw(environment.ethToken, amount, environment.relayerFee, progressCallback).pipe(
      tap((txHash: any) => {
        this.withdrawIsInProgress = false;
        this.isDone = true;
        console.log({
          prepareWithdraw: txHash
        });
      }),
      catchError((e) => {
        this.withdrawIsInProgress = false;
        this.isDoneWithError = true;

        console.log(e);
        return of('');
      })
    ).subscribe();

  }

}
