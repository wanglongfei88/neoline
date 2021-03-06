import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatMenuModule } from '@angular/material';

import { PopupAssetComponent } from '@popup/assets/asset/asset.component';
import { PopupAssetsComponent } from '@popup/assets/assets.component';
import { PopupAssetsRoutingModule } from '@popup/assets/assets.route';

import { ShareModule } from '@app/share';
import { PopupAssetSearchComponent } from './asset-search/asset-search.component';

@NgModule({
    declarations: [
        PopupAssetsComponent,
        PopupAssetComponent,
        PopupAssetSearchComponent
    ],
    imports: [
        CommonModule,
        ShareModule,
        PopupAssetsRoutingModule,
        MatMenuModule
    ],
    exports: [],
    providers: [],
})
export class PopupAssetsModule {}
