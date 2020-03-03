import { Component, OnInit } from '@angular/core';
import { CircomLoaderService } from './services/circom-loader.service';
import { interval, Observable } from 'rxjs';
import { AccountService, toAddressPreview } from './services/account.service';
import { ZeroPoolService } from './services/zero-pool.service';
import { Web3ProviderService } from './services/web3.provider.service';
import { map, tap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'zp-ui';

  hasError$: Observable<boolean>;
  circomeResourcesLoaded$: Observable<boolean>;

  get displayWarning(): boolean{
    return !localStorage.warningWasRead;
  }

  balance = 1;
  history = [
    {type: 'transfer', amount: 10},
    {type: 'deposit', amount: 10},
    {type: 'prepareWithdraw', amount: 10},
  ];

  ethAddress$: Observable<{ full: string, short: string }>;

  constructor(
    private circomeSvc: CircomLoaderService,
    private accountSvc: AccountService,
    private zeropoolSvc: ZeroPoolService,
    private web3Service: Web3ProviderService
  ) {
    this.hasError$ = this.circomeSvc.hasError$;
    this.circomeResourcesLoaded$ = this.circomeSvc.isReady$;

    this.ethAddress$ = this.web3Service.address$.pipe(
      map((ethAddress: string) => {
        return {
          full: ethAddress, short: toAddressPreview(ethAddress)
        };
      })
    );
  }

  connectWallet() {
    this.web3Service.connectWeb3();
  }

  hideWarning() {
    localStorage.warningWasRead = true;
  }
}
