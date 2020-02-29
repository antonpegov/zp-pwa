import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { fromPromise } from 'rxjs/internal-compatibility';
import { mergeMap } from 'rxjs/operators';
import { BlockItem, tw } from 'zeropool-lib';
import { ZeroPoolService } from '../../services/zero-pool.service';
import { environment } from '../../../environments/environment';
import { RelayerApiService } from '../../services/relayer.api.service';

@Component({
  selector: 'app-transfer',
  templateUrl: './transfer.component.html',
  styleUrls: ['./transfer.component.scss']
})
export class TransferComponent implements OnInit {

  transactionHash: string;

  myZpBalance: number;

  isDone = false;
  transferIsInProgress = false;

  public transferForm: FormGroup = this.fb.group({
    toAmount: [''],
    toAddress: ['']
  });

  get toAmount(): number {
    return this.transferForm.get('toAmount').value;
  }

  get toAddress(): string {
    return this.transferForm.get('toAddress').value;
  }

  constructor(
    private fb: FormBuilder,
    private zpService: ZeroPoolService,
    private relayerApi: RelayerApiService
  ) {
  }

  ngOnInit(): void {
    //
  }

  onSendClick(): void {
    this.transferIsInProgress = true;

    const amount = tw(this.toAmount).toNumber();

    // generate tx and send eth to contract
    fromPromise(this.zpService.zp.transfer(environment.ethToken, this.toAddress, amount)).pipe(
      mergeMap((blockItem: BlockItem<string>) => {
          return this.relayerApi.sendTx$(blockItem);
        }
      )
    ).subscribe(
      (tx: any) => {
        // (tx: Transaction) => {
        this.isDone = true;
        this.transactionHash = tx.transactionHash;
      }
    );
  }
}
