import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatRadioModule,
    MatMenuModule,
    MatSlideToggleModule,
    MatTooltipModule
} from '@angular/material';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { PagerComponent } from './components/pager/pager.component';
import { PopupPagerComponent } from './components/popup-pager/popup-pager.component';

import { LimitStrPipe } from './pipes/limit-str.pipe';
import { LimitPageStringPipe } from './pipes/limit-page-string.pipe';
import { LanguageNamePipe } from './pipes/language-name.pipe';
import { CopyDirective } from './directives/copy';
import { AvatarDirective } from './directives/avatar';
import { TranslatePipe } from './pipes/translate.pipe';
import { NumberDirective } from './directives/number';

@NgModule({
    declarations: [
        PagerComponent,
        PopupPagerComponent,
        LimitStrPipe,
        LimitPageStringPipe,
        LanguageNamePipe,
        TranslatePipe,
        CopyDirective,
        NumberDirective,
        AvatarDirective,
    ],
    imports: [CommonModule, MatIconModule, MatButtonModule],
    exports: [
        FormsModule,
        LimitPageStringPipe,
        LimitStrPipe,
        LanguageNamePipe,
        TranslatePipe,
        NumberDirective,
        CopyDirective,
        AvatarDirective,
        MatButtonModule,
        MatCheckboxModule,
        MatDialogModule,
        MatIconModule,
        MatInputModule,
        MatMenuModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatToolbarModule,
        MatTooltipModule,
        PagerComponent,
        PopupPagerComponent,
        ReactiveFormsModule,
    ],
    providers: [],
    entryComponents: []
})
export class ShareModule { }
