import {
    Component,
    OnInit,
    AfterViewInit
} from '@angular/core';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import {
    AssetState,
    NeonService,
    HttpService,
    GlobalService,
    ChromeService,
    TransactionState
} from '@/app/core';
import {
    Balance
} from '@/models/models';
import {
    Transaction
} from '@cityofzion/neon-core/lib/tx';
import {
    TransferService
} from '@/app/transfer/transfer.service';
@Component({
    templateUrl: 'transfer.component.html',
    styleUrls: ['transfer.component.scss']
})
export class PopupNoticeTransferComponent implements OnInit, AfterViewInit {
    public balance: Balance;
    public creating = false;
    public fromAddress: string;
    public toAddress: string;
    public assetId: string;
    public amount: number;
    public loading = false;
    public loadingMsg: string;
    public wallet: any;
    public pwd = '';
    public fee: number;
    public init = false;

    public net: string;
    constructor(
        private router: Router,
        private aRoute: ActivatedRoute,
        private asset: AssetState,
        private transfer: TransferService,
        private neon: NeonService,
        private http: HttpService,
        private global: GlobalService,
        private chrome: ChromeService,
        private txState: TransactionState
    ) { }

    ngOnInit(): void {
        this.net = this.global.net;
        this.fromAddress = this.neon.address;
        this.wallet = this.neon.wallet;
        this.aRoute.queryParams.subscribe((params: any) => {
            if (JSON.stringify(params) === '{}') {
                return;
            }
            window.onbeforeunload = () => {
                this.chrome.windowCallback({
                    data: 'cancel',
                    target: 'transferRes'
                });
            };
            if (params.network === 'MainNet') {
                this.global.modifyNet('main');
            } else {
                this.global.modifyNet('test');
            }
            this.toAddress = params.to_address || '';
            this.assetId = params.asset_id || '';
            this.amount = params.amount || 0;
            this.fee = params.fee || 0;
            if (this.assetId !== undefined && this.assetId !== '') {
                this.asset.detail(this.neon.address, this.assetId).subscribe((res: Balance) => {
                    this.init = true;
                    this.balance = res;
                });
            } else {
                this.asset.fetchBalance(this.neon.address).subscribe(res => {
                    const filterAsset = res.filter(item => item.symbol === params.symbol );
                    if (filterAsset.length > 0) {
                        this.init = true;
                        this.assetId = filterAsset[0].asset_id;
                        this.balance = filterAsset[0];
                    } else {
                        this.global.snackBarTip('balanceLack');
                        return;
                    }
                });
            }
        });
    }

    ngAfterViewInit(): void { }

    public submit() {
        this.loading = true;
        this.loadingMsg = 'Loading';
        if (this.creating) {
            return;
        }
        if (this.balance.balance === undefined || this.balance.balance <= 0) {
            this.global.snackBarTip('balanceLack');
            return;
        }
        if (parseFloat(this.balance.balance.toString()) < parseFloat(this.amount.toString()) || this.amount === 0) {
            this.global.snackBarTip('balanceLack');
            return;
        }
        this.creating = true;
        this.asset.detail(this.neon.address, this.assetId).subscribe((res: Balance) => {
            this.loading = false;
            this.loadingMsg = '';
            this.balance = res;
            this.transfer.create(this.fromAddress, this.toAddress, this.assetId, this.amount, this.fee).subscribe((tx) => {
                if (this.pwd && this.pwd.length) {
                    this.global.log('start transfer with pwd');
                    this.resolveSign(tx, this.pwd);
                } else {
                    this.creating = false;
                    this.global.log('cancel pay');
                }
            }, (err) => {
                this.creating = false;
                this.global.snackBarTip('wentWrong');
            });
        });

    }

    public cancel() {
        this.chrome.windowCallback({
            data: 'cancel',
            target: 'transferRes'
        });
        window.close();
    }

    private resolveSign(tx: Transaction, pwd: string) {
        this.loading = true;
        this.loadingMsg = 'Wait';
        this.neon.wallet.accounts[0].decrypt(pwd).then((acc) => {
            tx.sign(acc);
            this.loading = false;
            this.loadingMsg = '';
            this.creating = false;
            this.resolveSend(tx);
        }).catch((err) => {
            this.loading = false;
            this.loadingMsg = '';
            this.creating = false;
            this.global.snackBarTip('verifyFailed', err);
        });
    }

    private resolveSend(tx: Transaction) {
        this.loadingMsg = 'Wait';
        return this.http.post(`${this.global.apiDomain}/v1/transactions/transfer`, {
            signature_transaction: tx.serialize(true)
        }).subscribe(res => {
            this.loading = false;
            this.loadingMsg = '';
            this.creating = false;
            if (this.fromAddress !== this.toAddress) {
                const txTarget = {
                    txid: '0x' + tx.hash,
                    value: -this.amount,
                    block_time: res.response_time
                };
                this.pushTransaction(txTarget);
            }
            this.chrome.windowCallback({
                data: tx.hash,
                target: 'transferRes'
            });
            this.router.navigate([{
                outlets: {
                    transfer: ['transfer', 'result']
                }
            }]);
        }, err => {
            this.loading = false;
            this.loadingMsg = '';
            this.creating = false;
            this.chrome.windowCallback({
                data: 'rpcWrong',
                target: 'transferRes'
            });
            this.global.snackBarTip('transferFailed', err);
        });
    }

    public pushTransaction(transaction: object) {
        const net = this.net;
        const address = this.fromAddress;
        const assetId = this.assetId;
        this.chrome.getTransaction().subscribe(res => {
            if (res === null || res === undefined) {
                res = {};
            }
            if (res[net] === undefined) {
                res[net] = {};
            }
            if (res[net][address] === undefined) {
                res[net][address] = {};
            }
            if (res[net][address][assetId] === undefined) {
                res[net][address][assetId] = [];
            }
            res[net][address][assetId].unshift(transaction);
            this.chrome.setTransaction(res);
            this.txState.pushTxSource();
        });
    }

}
