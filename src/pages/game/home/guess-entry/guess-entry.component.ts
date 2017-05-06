import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { } from 'ionic-angular';

import { CardCategory, Player, Guess, Card, Suspect } from '../../../../app/game/index';
import { GameCardService } from '../../../../app/shared/index';

import * as _ from "lodash";

@Component({
    selector: 'guess-entry-component',
    templateUrl: 'guess-entry.component.html'
})

export class GuessEntryComponent implements OnInit {
    accusedSuspect: Card
    accusedWeapon: Card
    accusedRoom: Card
    playerThatShowed: Player
    shownCategory : CardCategory

    @Input() activePlayer: Player
    @Input() players: Player[]
    @Input() enterShownCard : Boolean

    //Edit Mode
    @Input() editMode: Boolean
    @Input() editGuess : Guess

    @Output() guessEntered = new EventEmitter();

    CardCategory = CardCategory

    constructor(private gameCardService : GameCardService) {}

    ngOnInit () : void 
    {
        if (this.editMode && this.editGuess)
        {
            this.accusedSuspect = new Card(CardCategory.SUSPECT, this.editGuess.suspect);
            this.accusedWeapon = new Card(CardCategory.WEAPON, this.editGuess.weapon);
            this.accusedRoom = new Card(CardCategory.ROOM, this.editGuess.room);
            this.playerThatShowed = this.editGuess.playerThatShowed;
            this.shownCategory = this.editGuess.cardShown ? this.editGuess.cardShown.category : null;
        }
        else 
        {
            this.resetEntry();
        }
    }

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
        let shownCard = (shownGameCard && this.enterShownCard) ? shownGameCard : null;

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

    suspectSelected(selectedSuspect : Card) : void { this.accusedSuspect = selectedSuspect; }
    weaponSelected(selectedWeapon : Card) : void { this.accusedWeapon = selectedWeapon; }
    roomSelected(selectedRoom : Card) : void { this.accusedRoom = selectedRoom; }
    playerThatShowedSelected(selectedPlayer : Player) : void { this.playerThatShowed = selectedPlayer; }
}