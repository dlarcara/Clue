import { Player, CardCategory, Card, Turn, Guess, GameSheet, GameAlgorithm, CellStatus, Verdict, CellData } from './index';

import * as _ from 'lodash';

export class GameTracker
{
    detectiveCards : Card[]
    players : Player[]

    get turns() : Turn[] { return this.gameAlgorithm.turns; }

    private gameAlgorithm : GameAlgorithm;

    constructor(players: Player[], detectiveCards: Card[])
    {
        //Ensure one detective is playing
        if (_.countBy(players, 'isDetective')['true'] != 1)
            throw new Error("Must define a single detective");

        //Ensure right number of cards for detective are passed in
        if (_.find(players, 'isDetective').numberOfCards != detectiveCards.length)
            throw new Error("Wrong number of cards identified for the detective");

        //Ensure unique players 
        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
           throw new Error("Player suspect used more than once");

        //Ensure game involves at least 3 players
        if (players.length < 3)
            throw new Error("At least 3 players are required to play a game");

        //Ensure no duplicate cards are passed in
        if(_.uniqWith(detectiveCards, _.isEqual).length != detectiveCards.length)
            throw new Error("Duplicate cards were supplied");

        //Ensure everyone the total number of cards pass in is 18, and broken out amongst player correctly

        this.players = players;
        this.detectiveCards = detectiveCards;
        
        this.gameAlgorithm = new GameAlgorithm(this.players, this.detectiveCards);
    }

    enterPass(player : Player) : void
    {
        this.gameAlgorithm.enterPass(player);
    }

    enterTurn(guess : Guess) : void
    {
        this.gameAlgorithm.applyGuess(guess);
    }

    getDetective() : Player
    {
        return this.gameAlgorithm.detective;
    }

    getNextPlayer(player : Player) : Player
    {
        return this.gameAlgorithm.getNextPlayer(player);
    }
    
    getStatusForPlayerAndCard(player: Player, card : Card) : CellStatus
    {     
        return this.gameAlgorithm.gameSheet.getStatusForPlayerAndCard(player, card);
    }

    getCellDataForPlayerAndCard(player: Player, card : Card) : CellData
    {     
        return this.gameAlgorithm.gameSheet.getCellDataForPlayerAndCard(player, card);
    }

    getVerdict() : Verdict
    {
        return this.gameAlgorithm.gameSheet.getVerdict()
    }

    getProgress() : number
    {
        return this.gameAlgorithm.gameSheet.getProgress();
    }

    getAllCardsForPlayerInGivenStatus(player : Player, cellStatus : CellStatus) : Card[]
    {
        return this.gameAlgorithm.gameSheet.getAllCardsForPlayerInGivenStatus(player, cellStatus);
    }

    getPlayerWhoHasCard(card : Card) : Player
    {
        return this.gameAlgorithm.gameSheet.getPlayerWhoHasCard(card);
    }

    getGameSheet() : GameSheet
    {
        return this.gameAlgorithm.gameSheet;
    }

    //Return possible number of cards a player can have based on the total number of players
    private getCardCountPossibilities (numberOfPlayers : number) : number[]
    {
        var totalNumberOfAvailableCards = 18; 
        var averageCardsPerPerson = totalNumberOfAvailableCards/numberOfPlayers;
        return _.uniq([Math.floor(averageCardsPerPerson), Math.ceil(averageCardsPerPerson)]);
    }
}