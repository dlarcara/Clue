import { Component, Input } from '@angular/core';

import { Player } from '../../game/index';

@Component({
    selector: 'player-icon',
    template: 'D'
    // template: `<ng2-letter-avatar avatar-data='{{player.name}}' 
    //                               avatar-height='25px' 
    //                               avatar-width='25px' 
    //                               avatar-font-size='17px'
    //                               avatar-shape='round'
    //                               avatar-custom-bg-color='{{suspectBgColors[player.suspect]}}'
    //                             >
    //            </ng2-letter-avatar>`
})

export class PlayerIconComponent {
    private suspectBgColors : string[] = ['#253783','#B22E2D','#000000','#522D61','#FDCD26','#1A4C28']
    
    @Input() player: Player
}