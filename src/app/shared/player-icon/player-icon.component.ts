import { Component, Input } from '@angular/core';

import { Player } from '../../game/index';

@Component({
    selector: 'player-icon',
    template: `<span [style.color]=suspectBgColors[player.suspect]>
        {{player.name.substring(0,1)}}
    </span>`
})

export class PlayerIconComponent {
    private suspectBgColors : string[] = ['#253783','#B22E2D','#000000','#522D61','#DFBD45','#1A4C28']
    
    @Input() player: Player
}