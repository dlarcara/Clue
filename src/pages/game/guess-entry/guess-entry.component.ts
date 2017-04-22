import { Component, Input, Output, EventEmitter } from '@angular/core';

import { } from 'ionic-angular';

import { CardCategory, Player, Guess, Card } from '../../../app/game/index';
import { GameCard } from '../../../app/shared/index';

@Component({
    selector: 'guess-entry-component',
    templateUrl: 'guess-entry.component.html'
})

export class GuessEntryComponent {
    accusedSuspect: GameCard
    accusedWeapon: GameCard
    accusedRoom: GameCard
    playerThatShowed: Player
    cardShown: GameCard

    @Input() activePlayer: Player
    @Input() players: Player[]
    @Input() enterShownCard : Boolean = true;

    @Output() guessEntered = new EventEmitter();

    CardCategory = CardCategory

    constructor() { }

    guessIsValid() : Boolean
    {
        let baseValidation = this.accusedSuspect && this.accusedWeapon && this.accusedRoom && this.playerThatShowed;

        return baseValidation && (this.enterShownCard ? !!this.cardShown : true);
    }

    enterGuess() : void
    {
        if (!this.guessIsValid())
            return;

        let shownCard = this.enterShownCard ? new Card(this.cardShown.cardCategory, this.cardShown.cardIndex) : null;
        let guess = new Guess(+this.accusedSuspect.cardCategory, +this.accusedWeapon.cardIndex, +this.accusedRoom.cardIndex, 
                              this.activePlayer, this.playerThatShowed, shownCard);
        
        this.guessEntered.emit(guess);

        this.resetEntry();
    }

    resetEntry() : void 
    {
        this.accusedSuspect = null;
        this.accusedWeapon = null;
        this.accusedRoom = null;
        this.playerThatShowed = null;
        this.cardShown = null;
    }

    suspectSelected(selectedSuspect : GameCard) : void { this.accusedSuspect = selectedSuspect; }
    weaponSelected(selectedWeapon : GameCard) : void { this.accusedWeapon = selectedWeapon; }
    roomSelected(selectedRoom : GameCard) : void { this.accusedRoom = selectedRoom; }
    playerThatShowedSelected(selectedPlayer : Player) : void { this.playerThatShowed = selectedPlayer; }
    cardShownSelected(selectedCard : GameCard) : void { this.cardShown = selectedCard; }
}