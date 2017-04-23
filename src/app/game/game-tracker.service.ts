import { Player, CardCategory, Card, Turn, Guess, GameSheet, GameAlgorithm, CellStatus } from './index';

import * as _ from 'lodash';

export class GameTracker
{
    detectiveCards : Card[]
    players : Player[]
    turns: Turn[] = [];

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

    enterTurn(player : Player, guess : Guess) : Turn
    {
        if (guess)
            this.gameAlgorithm.applyGuess(guess);

        let resultingSheet = _.cloneDeep(this.gameAlgorithm.gameSheet);
        let turn = new Turn(this.turns.length + 1, player, guess, resultingSheet);

        this.turns.push(turn);

        return turn;
    }

    getDetective() : Player
    {
        return _.find(this.players, (p) => p.isDetective);
    }

    getNextPlayer(player : Player) : Player
    {
        return this.gameAlgorithm.getNextPlayer(player);
    }
    
    getStatusForPlayerAndCard(player: Player, card : Card) : CellStatus
    {     
        return this.gameAlgorithm.getStatusForPlayerAndCard(player, card);
    }

    //TODO: Test This
    playerMightHaveCard(player : Player, card : Card) : Boolean
    {
        if (this.gameAlgorithm.getPlayerWhoHasCard(card))
            return false;

        let unresolvedShowsForPlayer = _.filter(this.gameAlgorithm.unresolvedGuesses, (g) => _.isEqual(player, g.playerThatShowed));
        
        return _.some(unresolvedShowsForPlayer, (g : Guess) => {
            return (card.category == CardCategory.SUSPECT && card.cardIndex == g.suspect) ||
                   (card.category == CardCategory.WEAPON && card.cardIndex == g.weapon) ||
                   (card.category == CardCategory.ROOM && card.cardIndex == g.room)
        });
    }

    //Return possible number of cards a player can have based on the total number of players
    private getCardCountPossibilities (numberOfPlayers : number) : number[]
    {
        var totalNumberOfAvailableCards = 18; 
        var averageCardsPerPerson = totalNumberOfAvailableCards/numberOfPlayers;
        return _.uniq([Math.floor(averageCardsPerPerson), Math.ceil(averageCardsPerPerson)]);
    }
}