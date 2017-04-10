import { Player, Card, Turn, Guess, GameSheet } from './index';

import * as _ from 'lodash';

export class GameTracker
{
    turns: Turn[] = [];

    private detective: Player;
    private detectiveCards: Card[]
    private players: Player[]

    constructor(detective: Player, players: Player[], detectiveCards: Card[])
    {
        //Ensure detective is included in the list of players
        if (!players.find(p => p.suspect == detective.suspect && p.name == detective.name))
            throw new Error("Detective not included in list of players");

        //Ensure unique players 
        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
           throw new Error("Player suspect used more than once");

        //Ensure game involves at least 3 players
        if (players.length < 3)
            throw new Error("At least 3 players are required to play a game");

        //Ensure no duplicate cards are passed in
        if(_.uniqWith(detectiveCards, _.isEqual).length != detectiveCards.length)
            throw new Error("Duplicate cards were supplied");

        //Ensure proper number of cards are passed in
        var expectedNumberOfCards = this.getCardCountPossibilities(players.length);
        if (expectedNumberOfCards.indexOf(detectiveCards.length) == -1)
            throw new Error("The wrong number of cards was supplied");

        this.detective = detective;
        this.players = players;
        this.detectiveCards = detectiveCards;

        this.addTurn(detective, null, null);
    }

    //Return possible number of cards a player can have based on the total number of players
    private getCardCountPossibilities (numberOfPlayers : number) : number[]
    {
        var totalNumberOfAvailableCards = 18; 
        var averageCardsPerPerson = totalNumberOfAvailableCards/numberOfPlayers;
        return _.uniq([Math.floor(averageCardsPerPerson), Math.ceil(averageCardsPerPerson)]);
    }

    private addTurn(player : Player, guess : Guess, gameSheet : GameSheet) : void
    {
        let turn = new Turn(1, player, guess, gameSheet);
        this.turns.push(turn);
    }
}