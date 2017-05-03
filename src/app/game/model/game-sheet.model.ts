import { CardCategory, Suspect, Weapon, Room, CellStatus, Player, Card, GameConstants, Verdict } from '../index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

export class CellData
{
    constructor(public status : CellStatus, public enteredTurn: number) {}
}

export class GameSheet
{
    private _players : Player[];
    private _data: any[] = [];
    get data() : any[] { return this._data; }

    constructor(players : Player[])
    {
        if (players.length < 3)
            throw new Error("Not enough players provided");

        if (players.length > 6)
            throw new Error("Too many players provided");

        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
            throw new Error("Player suspect used more than once");

        this._players = players;

        //Fill out game sheet with all UNKNOWN's and no entered turn
        let defaultValue = new CellData(CellStatus.UNKNOWN, null);
        this._data[CardCategory.SUSPECT] = _.map(EnumValues.getValues(Suspect), () => { return _.times(players.length, _.constant(defaultValue)); });
        this._data[CardCategory.WEAPON] = _.map(EnumValues.getValues(Weapon), () => { return _.times(players.length, _.constant(defaultValue)); });
        this._data[CardCategory.ROOM] = _.map(EnumValues.getValues(Room), () => { return _.times(players.length, _.constant(defaultValue)); });
    }

    getStatusForPlayerAndCard(player: Player, card : Card) : CellStatus
    {
        //Ensure player is playing
        if (!_.find(this._players, player))
            throw new Error("Player not found");

        return this.getCell(player, card).status;
    }

    getPlayerWhoHasCard(card : Card) : Player
    {
        return _.find(this._players, (p) => { return this.getStatusForPlayerAndCard(p, card) == CellStatus.HAD; });
    }

    getAllCardsForPlayerInGivenStatus(player : Player, cellStatus : CellStatus)
    {
        //Ensure player is playing
        if (!_.find(this._players, player))
            throw new Error("Player not found");

        //Get all cards that are in a particular status
        return GameConstants.ALLCARDS.filter((card) => {
            return this.getStatusForPlayerAndCard(player, card) == cellStatus;
        });
    }

    getVerdict() : Verdict
    {
        let verdict = new Verdict();
        verdict.suspect = this.getVerdictForCategory(CardCategory.SUSPECT);
        verdict.weapon = this.getVerdictForCategory(CardCategory.WEAPON);
        verdict.room = this.getVerdictForCategory(CardCategory.ROOM);
        return verdict;
    }

    //TODO: Test this
    getProgress() : number
    {
        let solvedCount = 0;
        let totalCount = 0;
        _.forEach(this._players, (player) => {
            _.forEach(GameConstants.ALLCARDS, (c) => {
                let status = this.getStatusForPlayerAndCard(player, c);
                if (status != CellStatus.UNKNOWN)
                    solvedCount ++;

                totalCount++;
            });
        });

        return solvedCount / totalCount;
    }

    markCardAsHadByPlayer(player : Player, card : Card, turnNumber : number) : void
    {
        //Ensure player is playing
        if (!_.find(this._players, player))
            throw new Error("Player not found");
        
        //Ensure card is not already marked as NOTHAD
        let currentStatus = this.getStatusForPlayerAndCard(player, card);
        if (currentStatus != CellStatus.UNKNOWN && currentStatus == CellStatus.NOTHAD)
            throw new Error(`${this.getCardFriendlyNameDispalyForError(card, true, true)} is already marked as not had by ${player.name}, can't mark it as had`);

        //Ensure another player doesn't already have the card
        let currentCardOwner = this.getPlayerWhoHasCard(card)
        if(currentCardOwner && currentCardOwner != player)
            throw new Error(`${currentCardOwner.name} already has ${this.getCardFriendlyNameDispalyForError(card, false, false)}, can't mark it as had by ${player.name}`);

        //Ensure there are still cards left to be marked as had for this player
        let allPlayersCards = this.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);
        if (allPlayersCards.length == player.numberOfCards && !_.find(allPlayersCards, card))
            throw new Error(`All ${player.numberOfCards} cards for ${player.name} are already identified, can't mark ${this.getCardFriendlyNameDispalyForError(card, false, false)} as had`)

        this.setStatus(player, card, new CellData(CellStatus.HAD, turnNumber));
    }
 
    markCardAsNotHadByPlayer(player : Player, card : Card, turnNumber : number) : void
    {
        //Ensure player is playing
        if (!_.find(this._players, player))
            throw new Error("Player not found");

        //Ensure card is not already marked as NOTHAD
        let currentStatus = this.getStatusForPlayerAndCard(player, card);
        if (currentStatus != CellStatus.UNKNOWN && currentStatus == CellStatus.HAD)
            throw new Error(`${this.getCardFriendlyNameDispalyForError(card, true, true)} is already marked as had by ${player.name}, can't mark it as not had`);

        //Ensure you're not marking the last card in the category as fully not had, avoid duplicate verdicts in category
        let verdictInCategory = this.getVerdictForCategory(card.category);
        if (verdictInCategory && verdictInCategory != card.cardIndex && _.countBy(this._data[card.category][+card.cardIndex], 'status')[CellStatus.NOTHAD] == (this._players.length - 1))
            throw new Error(`Can't mark ${this.getCardFriendlyNameDispalyForError(card, false, false)} as not had by ${player.name}, no one else has ${this.getCardFriendlyNameDispalyForError(card, false, false)} and a verdict has already been reached in this category`)

        this.setStatus(player, card, new CellData(CellStatus.NOTHAD, turnNumber));
    }

    resetData(dataToResetTo : any[]) : void
    {
        this._data = dataToResetTo;
    }

    private setStatus(player : Player, card : Card, cellData : CellData) : void
    {
        if (this.getCell(player, card).status == cellData.status)
            return;

        this._data[card.category][+card.cardIndex][this.getPlayerIndex(player)] = cellData;
    }

    private getCell(player : Player, card : Card) : CellData
    {
        return this._data[card.category][+card.cardIndex][this.getPlayerIndex(player)]
    }

    private getCardFriendlyNameDispalyForError(card : Card, capitalizeCard : boolean, capitalizeThe : boolean) : string
    {
        if (card.category == CardCategory.SUSPECT)
            return card.friendlyName;

        return `${capitalizeThe ?  "The" : "the"} ${_.lowerCase(card.friendlyName)}`;
    }

    private getVerdictForCategory(cardCategory : CardCategory) : number
    {
        let verdict = null;

        //Find any card in the given category that is marked as not had by every player
        _.forEach(this._data[cardCategory], (cardValues, cardIndex) => {
            if (_.countBy(cardValues, 'status')[CellStatus.NOTHAD] == this._players.length)
                verdict = cardIndex;
        });

        return verdict;
    }

    private getPlayerIndex(player : Player) : number
    {
        return _.findIndex(this._players, player);
    }
}