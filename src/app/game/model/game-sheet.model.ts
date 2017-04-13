import { CardCategory, Suspect, Weapon, Room, CellStatus, Player, Card, GameConstants, Verdict } from '../index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

export class GameSheet
{
    private players : Player[];
    private cells: any[] = [];

    constructor(players : Player[])
    {
        if (players.length < 3)
            throw new Error("Not enough players provided");

        if (players.length > 6)
            throw new Error("Too many players provided");

        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
            throw new Error("Player suspect used more than once");

        this.players = players;

        //Fill out game sheet with all UNKNOWN's
        this.cells[CardCategory.SUSPECT] = _.map(EnumValues.getValues(Suspect), () => { return _.times(players.length, _.constant(CellStatus.UNKNOWN)); });
        this.cells[CardCategory.WEAPON] = _.map(EnumValues.getValues(Weapon), () => { return _.times(players.length, _.constant(CellStatus.UNKNOWN)); });
        this.cells[CardCategory.ROOM] = _.map(EnumValues.getValues(Room), () => { return _.times(players.length, _.constant(CellStatus.UNKNOWN)); });
    }

    getStatusForPlayerAndCard(player: Player, card : Card) : CellStatus
    {
        //Ensure player is playing
        if (!_.find(this.players, player))
            throw new Error("Player not found");

        return this.cells[card.category][+card.cardIndex][this.getPlayerIndex(player)];
    }

    markCardAsHadByPlayer(player : Player, card : Card) : void
    {
        //Ensure player is playing
        if (!_.find(this.players, player))
            throw new Error("Player not found");
        
        //Ensure card is not already marked as NOTHAD
        let currentStatus = this.getStatusForPlayerAndCard(player, card);
        if (currentStatus != CellStatus.UNKNOWN && currentStatus == CellStatus.NOTHAD)
            throw new Error(`${card.getFriendlyDisplay()} is already marked as NOTHAD for ${player.name}, can't mark it as HAD`);

        //Ensure another player doesn't already have the card
        let currentCardOwner = this.getPlayerWhoHasCard(card)
        if(currentCardOwner && currentCardOwner != player)
            throw new Error(`${currentCardOwner.name} already already has ${card.getFriendlyDisplay()}`);

        //Ensure there are still cards left to be marked as had for this player
        let allPlayersCards = this.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);
        if (allPlayersCards.length == player.numberOfCards && !_.find(allPlayersCards, card))
            throw new Error(`All ${player.numberOfCards} cards for ${player.name} are already identified, can't mark ${card.getFriendlyDisplay()} as HAD`)

        this.cells[card.category][+card.cardIndex][this.getPlayerIndex(player)] = CellStatus.HAD;
    }
 
    markCardAsNotHadByPlayer(player : Player, card : Card) : void
    {
        //Ensure player is playing
        if (!_.find(this.players, player))
            throw new Error("Player not found");

        //Ensure card is not already marked as NOTHAD
        let currentStatus = this.getStatusForPlayerAndCard(player, card);
        if (currentStatus != CellStatus.UNKNOWN && currentStatus == CellStatus.HAD)
            throw new Error(`${card.getFriendlyDisplay()} is already marked as HAD for ${player.name}, can't mark it as NOTHAD`);

        //Ensure a verdict for this category has not yet been identified
        let verdictInCategory = this.getVerdictForCategory(card.category);
        if (verdictInCategory && verdictInCategory != card.cardIndex && _.countBy(this.cells[card.category][+card.cardIndex])[1] == (this.players.length - 1))
            throw new Error(`Can't mark ${card.getFriendlyDisplay()} as not had for ${player.name}, no one else has ${card.getFriendlyDisplay()} and a verdict has already been reached in this category`)

        this.cells[card.category][+card.cardIndex][this.getPlayerIndex(player)] = CellStatus.NOTHAD;
    }

    getPlayerWhoHasCard(card : Card) : Player
    {
        return _.find(this.players, (p) => { return this.getStatusForPlayerAndCard(p, card) == CellStatus.HAD; });
    }

    getAllCardsForPlayerInGivenStatus(player : Player, cellStatus : CellStatus)
    {
        //Ensure player is playing
        if (!_.find(this.players, player))
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

    private getVerdictForCategory(cardCategory : CardCategory) : number
    {
        let verdict = null;

        //Find any card in the given category that is marked as not had by every player
        _.forEach(this.cells[cardCategory], (cardValues, cardIndex) => {
            if (_.countBy(cardValues)[CellStatus.NOTHAD] == this.players.length)
                verdict = cardIndex;
        });

        return verdict;
    }

    private getPlayerIndex(player : Player) : number
    {
        return _.findIndex(this.players, player);
    }
}