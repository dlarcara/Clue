import { Component, Input, ElementRef, Renderer, AfterViewInit  } from '@angular/core';

import { AlertController } from 'ionic-angular';

import { Card } from '../../game/index';

declare var jQuery:any;

@Component({
    selector: 'card-icon',
    template: `<img [src]="card.icon" class="game-card-icon"/>`
})

export class CardIconComponent implements AfterViewInit 
{
    @Input() card : Card
    @Input() message : string
    @Input() disableAlert : Boolean
    
    constructor(private alertCtrl : AlertController, private elRef : ElementRef, private renderer : Renderer) {}

    ngAfterViewInit() : void 
    {
        if (!this.disableAlert)
            this.renderer.listen(this.elRef.nativeElement, 'click', (event) => { this.showCardDetails();});
    }

    showCardDetails() : void
    {
        let alert = this.alertCtrl.create({
            title: this.card.friendlyName,
            subTitle: this.message,
            buttons: ['OK']
        });
        
        alert.present();
    }
}