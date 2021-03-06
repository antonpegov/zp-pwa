import { Injectable } from '@angular/core';
import { combineLatest, defer, Observable, of } from 'rxjs';
import { StateStorageService } from './state.storage.service';
import { catchError, delay, filter, map, mergeMap, repeatWhen, shareReplay, take, tap } from 'rxjs/operators';
import { MyUtxoState, Utxo } from 'zeropool-lib';
import { AccountService, IAccount } from './account.service';
import { environment } from '../../environments/environment';
import { ZeroPoolService } from './zero-pool.service';
import { TransactionService } from './transaction.service';
import { TransactionSynchronizer } from './observable-synchronizer';

export const defaultGasMaxFeeGwei = environment.relayerFee;
export const defaultMinUtxoSizeGwei = environment.relayerFee * 100;

export interface AutoJoinSettings {
  maxGasFee: number;
  minUtxoSize: number;
  isActivated: boolean;
  feeSpent: number;
}

@Injectable({
  providedIn: 'root'
})
export class AutoJoinUtxoService {

  public start$: Observable<any>;

  private isReady$ = this.zpService.isReady$.pipe(
    filter((isReady: boolean) => isReady),
    take(1),
    shareReplay(1),
    mergeMap(() => {
      return this.zpService.transactionBlocker.transactionLock$;
    }),
    filter((isBlocked: boolean) => !isBlocked),
    take(1),
  );

  constructor(
    private txService: TransactionService,
    private stateStorageService: StateStorageService,
    private accountService: AccountService,
    private zpService: ZeroPoolService
  ) {

    const account$ = this.accountService.account$;

    this.start$ = combineLatest([account$, this.isReady$]).pipe(
      mergeMap(
        (x: any) => {

          const [account, isReady]: [IAccount, boolean] = x;

          return defer(() => this.processJoinUtxo(account).pipe(
            tap((data: any) => {
              if (data !== '') {
                console.log('join-utxo: ', data);
              }
            }),
          )).pipe(
            repeatWhen(completed => completed.pipe(delay(5000)))
          );

        }
      )
    );

  }

  private processJoinUtxo(account: IAccount): Observable<any> {

    const o$: Observable<{ myAddress, amountToJoin }> = this.isReady$.pipe(
      mergeMap(() => {
        return combineLatest([
          this.stateStorageService.getUtxoState(),
          this.stateStorageService.getGasUtxoState()
        ]);
      }),
      map(
        (x) => {

          const [state, gasState]: [MyUtxoState<string>, MyUtxoState<string>] = x;

          return this.calculateJoinAmount(state, gasState, account);

        }
      )
    );

    const calculatedJoinAmount$ = TransactionSynchronizer.execute<{ myAddress, amountToJoin }>({
      observable: o$
    });

    return calculatedJoinAmount$.pipe(
      mergeMap(
        ({ myAddress, amountToJoin }) => {
          if (amountToJoin === 0 && myAddress === '0') {
            return of('');
          }

          console.log('start join');
          return this.txService.transfer(environment.ethToken, myAddress, amountToJoin, environment.relayerFee).pipe(
            catchError((e) => {
              return of('tx failed');
            })
          );
        }
      ),
      take(1)
    );

  }

  private calculateJoinAmount(state, gasState, account: IAccount) {
    const settings = this.getSettings();
    if (!settings.isActivated) {
      console.log('auto join deactivated');
      return { myAddress: '0', amountToJoin: 0 };
    }

    if (state.utxoList.length < 3) {
      console.log('nothing to join');
      return { myAddress: '0', amountToJoin: 0 };
    }

    // todo: add support of multi assets
    let amountToJoin = 0;
    let countOfUtxoToJoin = 0;

    state.utxoList = state.utxoList.sort(sortUtxo);

    for (const utxo of state.utxoList) {
      if (countOfUtxoToJoin === 2) {
        break;
      }

      if (Number(utxo.amount) < settings.minUtxoSize) {
        continue;
      }
      amountToJoin += Number(utxo.amount);
      countOfUtxoToJoin += 1;
    }

    if (countOfUtxoToJoin < 2) {
      console.log('nothing to join');
      return { myAddress: '0', amountToJoin: 0 };
    }

    if (
      gasState.utxoList
        .slice(0, 2)
        .reduce((acc, utxo) => {
          acc += Number(utxo.amount);
          return acc;
        }, 0) < environment.relayerFee
    ) {
      console.log('not enough fee');
      return { myAddress: '0', amountToJoin: 0 };
    }

    return {
      myAddress: account.zeropoolAddress,
      amountToJoin
    };
  }

  activateAutoJoin(maxGasFee: number, minUtxoSize: number): void {
    localStorage.setItem('auto-join', 'true');
    localStorage.setItem('max-gas-fee', String(maxGasFee));
    localStorage.setItem('min-utxo-size', String(minUtxoSize));
  }

  deactivateAutoJoin(): void {
    localStorage.setItem('auto-join', 'false');
    localStorage.removeItem('max-gas-fee');
    localStorage.removeItem('min-utxo-size');
  }

  getSettings(): AutoJoinSettings {
    return {
      maxGasFee: Number(localStorage.getItem('max-gas-fee')) || defaultGasMaxFeeGwei,
      minUtxoSize: Number(localStorage.getItem('min-utxo-size')) || defaultMinUtxoSizeGwei,
      isActivated: localStorage.getItem('auto-join') !== 'false', // activated by default
      feeSpent: Number(localStorage.getItem('fee-spent')) || 0
    };
  }

}

function sortUtxo(a: Utxo<string>, b: Utxo<string>): number {
  const diff = Number(b.amount) - Number(a.amount);
  if (diff < 0) {
    return -1;
  } else if (diff > 0) {
    return 1;
  } else {
    return 0;
  }
}
