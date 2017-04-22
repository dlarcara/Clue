import { Component, Input, Output, EventEmitter } from '@angular/core';

import { } from 'ionic-angular';

import { CardCategory, Player, Guess, Card } from '../../../app/game/index';
import { GameCard } from '../../../app/shared/index';

import * as _ from "lodash";

@Component({
    selector: 'guess-entry-component',
    templateUrl: 'guess-entry.component.html'
})

export class GuessEntryComponent {
    accusedSuspect: GameCard
    accusedWeapon: GameCard
    accusedRoom: GameCard
    playerThatShowed: Player
    shownCategory : CardCategory

    @Input() activePlayer: Player
    @Input() players: Player[]
    @Input() enterShownCard : Boolean;

    @Output() guessEntered = new EventEmitter();

    CardCategory = CardCategory

    guessIsValid() : Boolean
    {
        let baseValidation = this.accusedSuspect && this.accusedWeapon && this.accusedRoom && this.playerThatShowed;

        return baseValidation && (this.enterShownCard ? !!this.getShownCard() : true);
    }

    enterGuess() : void
    {
        let shownCard = this.enterShownCard ? this.getShownCard() : null;
        let guess = new Guess(+this.accusedSuspect.cardCategory, +this.accusedWeapon.cardIndex, +this.accusedRoom.cardIndex, 
                              this.activePlayer, this.playerThatShowed, shownCard);
        
        try
        {
            this.guessEntered.emit(guess);
        }
        catch(Error)
        {
            alert("Conflicting change, TODO: Handle this gracefully");
        }

        this.resetEntry();
    }

    enterPass() : void
    {
        this.guessEntered.emit(null);
        this.resetEntry();
    }

    resetEntry() : void 
    {
        this.accusedSuspect = null;
        this.accusedWeapon = null;
        this.accusedRoom = null;
        this.playerThatShowed = null;
        this.shownCategory = null;
    }

    getPlayersToShow()
    {
        return _.filter(this.players, (player) => !_.isEqual(player,this.activePlayer));
    }

    cardActiveChange(cardCategory: CardCategory, isActive : Boolean)
    {
        if (isActive)
            this.shownCategory = cardCategory;
        else if (!isActive && this.shownCategory == cardCategory)
            this.shownCategory = null;
    }

    getShownCard() : Card
    {
        switch(this.shownCategory)
        {
            case CardCategory.SUSPECT: return new Card(CardCategory.SUSPECT, +this.accusedSuspect.cardIndex);
            case CardCategory.WEAPON: return new Card(CardCategory.WEAPON, +this.accusedWeapon.cardIndex);
            case CardCategory.ROOM: return new Card(CardCategory.ROOM, +this.accusedRoom.cardIndex);
            default: return null;
        }
    }

    suspectSelected(selectedSuspect : GameCard) : void { this.accusedSuspect = selectedSuspect; }
    weaponSelected(selectedWeapon : GameCard) : void { this.accusedWeapon = selectedWeapon; }
    roomSelected(selectedRoom : GameCard) : void { this.accusedRoom = selectedRoom; }
    playerThatShowedSelected(selectedPlayer : Player) : void { this.playerThatShowed = selectedPlayer; }
}