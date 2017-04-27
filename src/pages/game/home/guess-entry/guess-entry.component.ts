import { Component, Input, Output, EventEmitter } from '@angular/core';

import { } from 'ionic-angular';

import { CardCategory, Player, Guess, Card } from '../../../../app/game/index';
import { GameCard, GameCardService } from '../../../../app/shared/index';

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
    @Input() enterShownCard : Boolean

    @Output() guessEntered = new EventEmitter();

    CardCategory = CardCategory

    constructor(private gameCardService : GameCardService) {}

    guessIsValid() : Boolean
    {
        let baseValidation = !!this.accusedSuspect && !!this.accusedWeapon && !!this.accusedRoom;
        
        if (!this.enterShownCard && baseValidation) 
            return true;
        
        if (this.enterShownCard && baseValidation)
        {
            if (!this.playerThatShowed && this.shownCategory == null)
                return true;

             if (this.playerThatShowed && this.shownCategory != null)
                return true;
        }

        return false;
    }

    enterGuess() : void
    {
        this.guessEntered.emit(this.buildGuess());
    }

    buildGuess() : Guess
    {
        let accusedSuspect = this.accusedSuspect ? +this.accusedSuspect.cardIndex : null;
        let accusedWeapon = this.accusedWeapon ? +this.accusedWeapon.cardIndex : null;
        let accusedRoom = this.accusedRoom ? +this.accusedRoom.cardIndex : null;

        let shownGameCard = this.getShownCard();
        let shownCard = (shownGameCard && this.enterShownCard) ? this.gameCardService.convertToCard(shownGameCard.cardCategory, shownGameCard.cardIndex) : null;

        return new Guess(accusedSuspect, accusedWeapon, accusedRoom, this.activePlayer, this.playerThatShowed, shownCard);
    }

    getGuessingPlayerDisplay = () => this.activePlayer.isDetective ? "You" : this.activePlayer.name;
    getSuspectDisplay = () => this.accusedSuspect ? this.accusedSuspect.friendlyName : '';
    getWeaponDisplay = () => this.accusedWeapon ? this.accusedWeapon.friendlyName : '';
    getRoomDisplay = () => this.accusedRoom ? this.accusedRoom.friendlyName : '';
    getShowingPlayerDisplay = () => this.playerThatShowed ? (this.playerThatShowed.isDetective ? "You" : this.playerThatShowed.name) : '';
    getShownCardDisplay = () => !!this.getShownCard() ? this.getShownCard().friendlyName : '';

    enterPass() : void
    {
        this.guessEntered.emit(null);
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

    getShownCard() : GameCard
    {
        switch(this.shownCategory)
        {
            case CardCategory.SUSPECT: return this.gameCardService.getCard(CardCategory.SUSPECT, this.accusedSuspect.cardIndex);
            case CardCategory.WEAPON: return this.gameCardService.getCard(CardCategory.WEAPON, this.accusedWeapon.cardIndex);
            case CardCategory.ROOM: return this.gameCardService.getCard(CardCategory.ROOM, this.accusedRoom.cardIndex);
            default: return null;
        }
    }

    suspectSelected(selectedSuspect : GameCard) : void { this.accusedSuspect = selectedSuspect; }
    weaponSelected(selectedWeapon : GameCard) : void { this.accusedWeapon = selectedWeapon; }
    roomSelected(selectedRoom : GameCard) : void { this.accusedRoom = selectedRoom; }
    playerThatShowedSelected(selectedPlayer : Player) : void { this.playerThatShowed = selectedPlayer; }
}