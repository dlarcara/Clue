import { CardCategory, Suspect, Weapon, Room, CellStatus, Player, Card, GameConstants } from '../index';

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

        return GameConstants.ALLCARDS.filter((card) => {
            return this.getStatusForPlayerAndCard(player, card) == cellStatus;
        });
    }

    private getPlayerIndex(player : Player) : number
    {
        return _.findIndex(this.players, player);
    }
}