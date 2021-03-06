import {
    Component,
    OnDestroy
} from '@angular/core';
import {
    Router,
    NavigationEnd
} from '@angular/router';
import {
    ChromeService,
    GlobalService,
    NeonService,
    AssetState
} from './core';
import {
    MatDialog
} from '@angular/material';
import {
    LogoutDialog
} from './+logout/logout.dialog';
import {
    Wallet
} from '@cityofzion/neon-core/lib/wallet';
import {
    PopupLogoutDialogComponent
} from './popup/_dialogs/logout/logout.dialog';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'neo-line',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    public walletArr: Array < Wallet > ;
    public wallet: Wallet;
    public address: string;
    public hideNav: boolean = true;
    public walletIsOpen: boolean = false;
    public net: string;
    public hideNav404: boolean = false;

    constructor(
        private router: Router,
        private chrome: ChromeService,
        private global: GlobalService,
        private neon: NeonService,
        private dialog: MatDialog,
        private assetSer: AssetState,
        private http: HttpClient
    ) {
        this.chrome.getLang().subscribe(res => {
            this.http.get(`/_locales/${res}/messages.json`).subscribe(temp => {
                this.global.languageJson = temp;
            });
        });
        this.router.events.subscribe((event) => {
            this.hideNav404 = false;
            this.global.$404.subscribe(() => {
                this.hideNav404 = true;
            });
            if (event instanceof NavigationEnd) {
                this.hideNav = event.url.startsWith('/popup') || event.url.startsWith('/login');
            }
        });
        this.global.walletListen().subscribe((res) => {
            switch (res) {
                case 'open':
                    this.walletIsOpen = true;
                    break;
                case 'close':
                    this.walletIsOpen = false;
                    break;
            }
        });
        this.neon.walletIsOpen().subscribe((res) => {
            this.global.$wallet.next(res ? 'open' : 'close');
        });
        this.neon.walletSub().subscribe(() => {
            this.wallet = this.neon.wallet;
            this.walletArr = this.neon.walletArr;
            this.address = this.neon.address;
        });
        this.chrome.getNet().subscribe(net => {
            this.net = net;
        });
    }

    public modifyNet(net: string) {
        if (this.net === net) {
            return;
        }
        this.net = net;
        this.chrome.setNet(net);
        this.global.modifyNet(net);
        location.reload();
    }

    public isActivityWallet(w: Wallet) {
        if (w.accounts[0].address === this.wallet.accounts[0].address) {
            return true;
        } else {
            return false;
        }
    }

    public chooseAccount(w: Wallet) {
        if (this.isActivityWallet(w)) {
            return;
        } else {
            this.wallet = this.neon.parseWallet(w);
            this.chrome.setWallet(this.wallet.export());
            this.chrome.windowCallback({
                data: {
                    address: this.wallet.accounts[0].address
                },
                target: 'account_changed'
            });
            location.href = `index.html`;
        }
    }
    public closeWallet() {
        this.dialog.open(PopupLogoutDialogComponent).afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.chrome.clearLogin();
                this.router.navigateByUrl('/login');
            }
        });
    }
    public close() {
        this.dialog.open(LogoutDialog, {
            panelClass: 'custom-dialog-container'
        }).afterClosed().subscribe((confirm) => {
            if (confirm) {
                this.chrome.closeWallet();
                this.global.$wallet.next('close');
                this.router.navigateByUrl(this.router.url.indexOf('/popup') >= 0 ? '/popup/wallet' : '/wallet');
            }
        });
    }
}
