import { Injectable } from '@angular/core';
import { PayNote, toHex, Tx } from 'zeropool-lib';
import { ZeroPoolService } from './zero-pool.service';
import { combineLatest, Observable, of, timer } from 'rxjs';
import { filter, map, mergeMap, take, tap } from 'rxjs/operators';
import { fromPromise } from 'rxjs/internal-compatibility';
import { environment } from '../../environments/environment';
import { RelayerApiService } from './relayer.api.service';

export interface ZpTransaction {
  tx: Tx<string>;
  zpTxHash: string;
  timestamp?: number;
}

const dateExpiresInMinutes = 5;

@Injectable({
  providedIn: 'root'
})
export class UnconfirmedTransactionService {

  static saveDepositTransaction(tx: ZpTransaction): void {
    this.save('deposit', {
      tx: tx.tx,
      zpTxHash: tx.zpTxHash,
      timestamp: Date.now()
    });
  }

  static deleteDepositTransaction(): void {
    this.delete('deposit');
  }

  private static save(key: string, item: any): void {
    localStorage.setItem(key, JSON.stringify(item));
  }

  private static delete(key: string): void {
    localStorage.removeItem(key);
  }

  constructor(private zpService: ZeroPoolService, private relayerApi: RelayerApiService) {

    const depositZpTx = this.getDepositTransaction();
    if (!depositZpTx) {
      return;
    }

    const timePassed = Date.now() - depositZpTx.timestamp;

    if (timePassed > 60000 * dateExpiresInMinutes) {
      console.log('unconfirmed deposit transaction time expired');
      UnconfirmedTransactionService.deleteDepositTransaction();
      return;
    }

    const unconfirmedDeposit$ = this.getUnconfirmedDeposit(depositZpTx);
    const gasTx$ = this.zpService.isReady$.pipe(
      filter((isReady: boolean) => isReady),
      mergeMap(
        () => {
          return fromPromise(
            this.zpService.zpGas.prepareWithdraw(environment.ethToken, environment.relayerFee)
          );
        }
      )
    );

    const tryEachMillisecond = 30000;

    timer(0, tryEachMillisecond).pipe(
      take(Math.ceil(timePassed / tryEachMillisecond)),
      mergeMap(() => {
        return combineLatest([unconfirmedDeposit$, gasTx$]);
      }),
      mergeMap(
        (x) => {
          const [unconfirmedDeposit, gasTx]: [PayNote | undefined, [Tx<string>, string]] = x;

          if (!unconfirmedDeposit) {
            return of(`cannot find deposit ${depositZpTx.zpTxHash}`);
          }
          console.log(unconfirmedDeposit)
          return this.relayerApi.sendTx$(depositZpTx.tx, toHex(unconfirmedDeposit.blockNumber), gasTx[0]).pipe(
            tap(() => {
              UnconfirmedTransactionService.deleteDepositTransaction();
            })
          );
        }
      )
    ).subscribe(
      (data: any) => {
        if (data.transactionHash) {
          console.log({
            unconfirmedDeposit: data.transactionHash
          });
        }

        console.log(data);
      },
      (e) => {
        UnconfirmedTransactionService.deleteDepositTransaction();
        console.log('unconfirmed transaction failed: ', e.message || e);
      }
    );

  }

  getUnconfirmedDeposit(tx: ZpTransaction): Observable<PayNote | undefined> {
    return this.zpService.isReady$.pipe(
      filter((isReady: boolean) => isReady),
      mergeMap(() => {
        return fromPromise(
          this.zpService.zp.getUncompleteDeposits()
        );
      }),
      map((payNoteList: PayNote[]) => {
        const unconfirmedDeposit = payNoteList.filter((note) => {
          return note.txHash === tx.zpTxHash;
        });
        return unconfirmedDeposit && unconfirmedDeposit[0];
      })
    );
  }

  getDepositTransaction(): ZpTransaction | undefined {
    return this.get<ZpTransaction>('deposit');
  }

  private get<T>(key: string): T | undefined {
    const item = localStorage.getItem(key);
    try {
      return JSON.parse(item) as T;
    } catch (e) {
      return undefined;
    }
  }

}
