import { Injectable } from "@angular/core";

import { GameSheet, Player, CardCategory, Card, Suspect, Weapon, Room, CellStatus, Guess, GameConstants } from "./index";
import { CircularArray } from "../shared/index";

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

@Injectable()

export class GameAlgorithm
{
    private _playersArray: CircularArray<Player>;
    get _players(): Player[] { return this._playersArray.values; }

    get detective(): Player { return _.find(this._players, { 'isDetective': true }); }

    private _gameSheet: GameSheet;
    get gameSheet() : GameSheet { return this._gameSheet; }
    
    private _unresolvedGuesses : Guess[]
    get unresolvedGuesses() : Guess[] { return this._unresolvedGuesses; }

    constructor(players : Player[], detectivesCards : Card[])
    {
        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
           throw new Error("Player suspect used more than once");

        if (players.length < 3)
            throw new Error("At least 3 players are required to play a game");

        this._playersArray = new CircularArray(players);
        this._gameSheet = new GameSheet(players);
        this._unresolvedGuesses = [];

        this.fillOutKnownCards(this.detective, detectivesCards);
    }

    applyGuess(guess : Guess) : void
    {
        if (!_.find(this._players, guess.playerThatGuessed))
            throw new Error("Guessing player not found");
            
        if (!!guess.playerThatShowed && !_.find(this._players, guess.playerThatShowed))
            throw new Error("Showing player not found");

        //Ensure that the shower might still have one of the guessed cards
        if (guess.playerThatShowed)
        {
            let guessedCards = [new Card(CardCategory.SUSPECT, guess.suspect), new Card(CardCategory.WEAPON, guess.weapon), new Card(CardCategory.ROOM, guess.room)];
            let cardsNotHad = _.filter(guessedCards, (card) => this._gameSheet.getStatusForPlayerAndCard(guess.playerThatShowed, card) == CellStatus.NOTHAD);
            if (cardsNotHad.length == 3)
            {
                if (_.isEqual(guess.playerThatShowed, this.detective))
                    throw new Error(`You do not have any of the cards being guessed`);
                else
                    throw new Error(`${guess.playerThatShowed.name} does not have any of the cards being guessed`);
            }
        }
  
        //Create copy of game sheet data and unresolved guesses
        //If something goes wrong during applying this guess we'll need to reset this
        let priorGameSheetData = _.cloneDeep(this._gameSheet.data);
        let priorUnresolvedGuesses = _.cloneDeep(this._unresolvedGuesses);

        try
        {
            this.evaluateGuess(guess);
        }
        catch(error)
        {
            //Reset game sheet data and unresolved guesses
            this._gameSheet.resetData(priorGameSheetData);
            this._unresolvedGuesses = priorUnresolvedGuesses;
            
            throw error; //Rethrow error
        }
    }

    getNextPlayer(player: Player) : Player
    {
        return this._playersArray.getNext(player);
    }

    private fillOutKnownCards(player : Player, cardsInHand : Card[]) : void
    {
        //Mark all cards passed in as had by this player
        _.forEach(cardsInHand, (card) => { this.markCardAsHadByPlayer(player, card); });

        //Mark all other cards as not had for this player
        _.forEach(GameConstants.getAllCardsExcept(cardsInHand), (card) => { this.markCardAsNotHadByPlayer(player, card); });
    }

    private evaluateGuess(guess : Guess) : void 
    {
        //Mark all people who passed as not having any of the cards
        this.markCardsAsNotHadForPlayersWhoDidNotShowByGuess(guess);

        //If shower and shown card is known mark it appropiately, otherwise start tracking the guess as unresolved if someone did show
        if (guess.playerThatShowed && guess.cardShown)
            this.markCardAsHadByPlayer(guess.playerThatShowed, guess.cardShown);
        else if (guess.playerThatShowed)
            this._unresolvedGuesses.push(guess);

        //Recursively attempt to resovle all unresolved guesses and deduce verdicts for each category until nothing new is found out
        this.replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut();
    }

    private markCardAsHadByPlayer(player : Player, card : Card) : void
    {
        //Short circuit any work if the card is already marked as had
        if(this._gameSheet.getStatusForPlayerAndCard(player, card) == CellStatus.HAD)
            return;

        //Mark this card as had by this player
        this._gameSheet.markCardAsHadByPlayer(player, card);

        //Mark all other players as not having this card
        let allOtherPlayers = _.differenceWith(this._players, [player], _.isEqual);
        _.forEach(allOtherPlayers, (p) => { this.markCardAsNotHadByPlayer(p, card); });

        //Mark all other cards as not had by this player if all their cards are known
        let knownHadCardsForPlayer = this._gameSheet.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);
        if (player.numberOfCards == knownHadCardsForPlayer.length)
            _.forEach(GameConstants.getAllCardsExcept(knownHadCardsForPlayer), (c) => { this.markCardAsNotHadByPlayer(player, c)});
    }

    private markCardAsNotHadByPlayer(player : Player, card : Card) : void
    {
        //Short circuit any work if the card is already marked as not had
        if(this._gameSheet.getStatusForPlayerAndCard(player, card) == CellStatus.NOTHAD)
            return;

        //Mark this card as not had by a player
        this._gameSheet.markCardAsNotHadByPlayer(player, card);

        //Mark all remaining cards as had by this player if all their not had cards have been identified
        let knowNotHadCardsForPlayer = this._gameSheet.getAllCardsForPlayerInGivenStatus(player, CellStatus.NOTHAD);
        if ((GameConstants.ALLCARDS.length - knowNotHadCardsForPlayer.length) == player.numberOfCards)
            _.forEach(GameConstants.getAllCardsExcept(knowNotHadCardsForPlayer), (c) => { this.markCardAsHadByPlayer(player, c)});
    }

    private markCardsAsNotHadForPlayersWhoDidNotShowByGuess(guess : Guess)
    {
        //Last player in the turn is either the shower, or guesser if no one showed
        let lastPlayerInTurn = (!guess.playerThatShowed) ? guess.playerThatGuessed : guess.playerThatShowed;

        //Iterate through all players who passed and mark them as not having any of the cards guessed
        let currentPlayer = this.getNextPlayer(guess.playerThatGuessed);
        while(!_.isEqual(currentPlayer, lastPlayerInTurn))
        { 
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.SUSPECT, guess.suspect));
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.WEAPON, guess.weapon));
            this.markCardAsNotHadByPlayer(currentPlayer, new Card(CardCategory.ROOM, guess.room));

            currentPlayer = this.getNextPlayer(currentPlayer);
        }
    }

    private replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut() : void
    {
        //Itereate through all unresolved guesses and attempt to resolve them
        let previousNumberOfUnresolvedGuesses = this._unresolvedGuesses.length;
        _.forEach(this._unresolvedGuesses, (guess) => {this.attemptToResolveGuess(guess); });

        //If any guess was resolved try replaying guesses again in case the new information resolves another guess
        if (previousNumberOfUnresolvedGuesses != this._unresolvedGuesses.length)
            this.replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut();

        //Check all categories to see if the verdict can be deduced for that category
        //Can be done if the owner for all other cards in that category have been identified
        let previousVerdict = this._gameSheet.getVerdict();
        this.attemptToDeduceVerdictInEachCategory();

        //If verdict has changed attempt replaying all guesses again, the board now has new informtion on it
        if (!_.isEqual(previousVerdict, this._gameSheet.getVerdict()))
            this.replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut();

        //If only one player can have a card in a given category and the verdict is already known for that category, that player has that card
        let previousGameSheet = _.cloneDeep(this._gameSheet);
        this.attemptToResolveMustHaves();
        
        //If the game sheet has changed in any way attempt replaying all guess again
        if (!_.isEqual(this._gameSheet, previousGameSheet))
            this.replayAllGuessesAndCheckVerdictsUntilNothingNewIsFoundOut();
    }

    private attemptToResolveGuess(guess : Guess) : void
    {
        //Defensive addition for casses where method is called without a guess
        if(!guess)
            return;
            
        let shower = guess.playerThatShowed;
        let guessedCards = [new Card(CardCategory.SUSPECT, guess.suspect), new Card(CardCategory.WEAPON, guess.weapon), new Card(CardCategory.ROOM, guess.room)];

        //Check to see if all cards are already owned by someone else, if they are throw an error
        let cardOwners = _.map(guessedCards, (card) => { return this._gameSheet.getPlayerWhoHasCard(card); }).filter(Boolean);
        if (cardOwners.length == 3 && !_.find(cardOwners, shower))
            throw new Error("Invalid guess, all cards are already marked as owned by someone else")

        //If any of the cards is known to be had by the shower we can stop trying to resolve this guess
        //They may have more than one of these cards, but there is no way of knowing which one it is they showed for sure
        let cardsPlayerDefinitelyHas = _.filter(guessedCards, (card) => { return this._gameSheet.getStatusForPlayerAndCard(shower, card) == CellStatus.HAD});
        if (cardsPlayerDefinitelyHas.length)
        {
            _.remove(this._unresolvedGuesses, guess);
            return; 
        }

        //If there is only 1 card left that this player might have than we can resolve this guess
        let cardsPlayerMightHave = _.filter(guessedCards, (card) => { return this._gameSheet.getStatusForPlayerAndCard(shower, card) == CellStatus.UNKNOWN});
        if (cardsPlayerMightHave.length == 1)
        {
            this.markCardAsHadByPlayer(shower, cardsPlayerMightHave[0]);
            _.remove(this._unresolvedGuesses, guess); 
        }

        //Otherwise we don't have enough information to resolve the guess and it remains unresolved
    }

    private attemptToDeduceVerdictInEachCategory() : void
    {
        this.attemptToDeduceVerdictInCategory(CardCategory.SUSPECT);
        this.attemptToDeduceVerdictInCategory(CardCategory.WEAPON);
        this.attemptToDeduceVerdictInCategory(CardCategory.ROOM);
    }

    private attemptToDeduceVerdictInCategory(cardCategory : CardCategory) : void
    {
        //Get all cards in the given category
        let allCardsInCategory = GameConstants.getAllCardsInCategory(cardCategory);
        
        //Check if all but one card in this category has an identified owner, if so no one has the last card
        let knownCardsInCategory = _.filter(allCardsInCategory, (card) => { return this._gameSheet.getPlayerWhoHasCard(card); });
        if (knownCardsInCategory.length == allCardsInCategory.length - 1)
        {
            let verdictInCategory = _.difference(allCardsInCategory, knownCardsInCategory)[0];
            _.forEach(this._players, (player) => { this.markCardAsNotHadByPlayer(player, verdictInCategory)});
        }
    }

    //If only one player is left as possibly having a card in a given category, and the verdict for that category is known
    //then that player must have the card
    private attemptToResolveMustHaves()
    {
        let verdict = this._gameSheet.getVerdict();

        if (verdict.suspect != null)
            this.attemptToResolveMustHaveForCategory(CardCategory.SUSPECT);

        if (verdict.weapon != null)
            this.attemptToResolveMustHaveForCategory(CardCategory.WEAPON);

        if (verdict.room != null)
            this.attemptToResolveMustHaveForCategory(CardCategory.ROOM);
    }

    private attemptToResolveMustHaveForCategory(cardCategory : CardCategory)
    {
        _.forEach(GameConstants.getAllCardsInCategory(cardCategory), (card : Card) => {
            let cellStatusForPlayers = _.groupBy(this._players, (player : Player) => {
                return this._gameSheet.getStatusForPlayerAndCard(player, card);
            });

            let notHadCount = cellStatusForPlayers[CellStatus.NOTHAD] ? cellStatusForPlayers[CellStatus.NOTHAD].length : 0;
            let unknownCount = cellStatusForPlayers[CellStatus.UNKNOWN] ? cellStatusForPlayers[CellStatus.UNKNOWN].length : 0;
            
            if (notHadCount == (this._players.length - 1) && unknownCount == 1)
                this.markCardAsHadByPlayer(cellStatusForPlayers[CellStatus.UNKNOWN][0], card);
        });
    }
}