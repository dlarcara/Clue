import { } from "@angular/core";

import { GameSheet, Player, CardCategory, Card, CellStatus, Guess, Turn, GameConstants } from "./index";
import { CircularArray } from "../shared/index";

import * as _ from 'lodash';

export class GameAlgorithm
{
    private _playersArray: CircularArray<Player>;
    get _players(): Player[] { return this._playersArray.values; }

    get detective(): Player { return _.find(this._players, { 'isDetective': true }); }

    private _gameSheet: GameSheet;
    get gameSheet() : GameSheet { return this._gameSheet; }
    
    private _turns: Turn[];
    get turns() : Turn[] { return this._turns; }

    get activeTurnNumber() : number { return this._turns.length ? this._turns[this._turns.length-1].number  : 0; }

    constructor(players : Player[], detectivesCards : Card[])
    {
        if(_.some(_.countBy(players, 'suspect'), (c) => c > 1))
           throw new Error("Player suspect used more than once");

        if (players.length < 3)
            throw new Error("At least 3 players are required to play a game");

        this._turns = [];
        this._playersArray = new CircularArray(players);
        this._gameSheet = new GameSheet(players);
        
        this.fillOutKnownCards(this.detective, detectivesCards);
        this._turns.push(new Turn(0, this.detective, null, _.cloneDeep(this._gameSheet)));
    }

    enterPass(player : Player) : void
    {
        this._turns.push(new Turn(this.activeTurnNumber+1, player, null, _.cloneDeep(this._gameSheet)));
    }

    applyGuess(guess : Guess) : void
    {
        //Check validity of guess
        if (!guess)
            throw new Error("Error entering guess, no information entered");

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

        //Create copy of game sheet data and turns
        //If something goes wrong during applying this guess we'll need to reset this
        let priorGameSheetData = _.cloneDeep(this._gameSheet.data);
        let priorTurns = _.cloneDeep(this._turns);

        try
        {
            let turn = new Turn(this.activeTurnNumber+1, guess.playerThatGuessed, guess, null);
            this.evaluateTurn(turn);
        }
        catch(error)
        {
            //Reset game sheet data and turns
            this._gameSheet.resetData(priorGameSheetData);
            this._turns = priorTurns;
            
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

    private evaluateTurn(turn : Turn) : void 
    {  
        //Enter Turn
        this._turns.push(turn);

        //Mark all people who passed as not having any of the cards
        this.markCardsAsNotHadForPlayersWhoDidNotShowByGuess(turn.guess);

        //If shower and shown card is known mark it appropiately
        if (turn.guess.playerThatShowed && turn.guess.cardShown)
        {
            this.markCardAsHadByPlayer(turn.guess.playerThatShowed, turn.guess.cardShown);
            this.markTurnAsResolved(turn);
        }

        //Recursively assess different scenarios on card until nothing new is found out
        this.replayAllTurnsUntilNothingNewIsFoundOut();
    }

    private markCardAsHadByPlayer(player : Player, card : Card) : void
    {
        //Short circuit any work if the card is already marked as had
        if(this._gameSheet.getStatusForPlayerAndCard(player, card) == CellStatus.HAD)
            return;

        //Mark this card as had by this player
        this._gameSheet.markCardAsHadByPlayer(player, card, this.activeTurnNumber);

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
        this._gameSheet.markCardAsNotHadByPlayer(player, card, this.activeTurnNumber);

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

    // The following steps are taken in this order to attempt to gain new information
    // If at any point the status of a given cell is modified all steps are run again
    //   1. Attempt to resolve all unresolved turns
    //   2. Check to see if all cards for a player not included in an unresolved guess can be marked as not had
    //   3. Check to see if there are any inter-related unresolved turns where players involved must have all cards involved, and therefore no one else has them
    //   4. See if the verdict is known for all categories (all other cards identified as had by someone)
    //   5. If the verdict for a category is known and only one player still views a card in that category as Not Had, they have that card 
    private replayAllTurnsUntilNothingNewIsFoundOut() : void
    {
        //1. Iterate through all unresolved turns and attempt to resolve them
        let previousNumberOfUnresolvedTurns = this.getUnresolvedTurns().length;
        _.forEach(this.getUnresolvedTurns(), (turn : Turn) => { this.attemptToResolveTurn(turn); });

        //If any turn was resolved try replaying turns again in case the new information resolves another turn
        if (previousNumberOfUnresolvedTurns != this.getUnresolvedTurns().length)
            this.replayAllTurnsUntilNothingNewIsFoundOut();

        //2. Check to see if all cards for a player can be marked as not had based upon their remaining unresolved shows
        let gameSheetBeforeStep2 = _.cloneDeep(this._gameSheet);
        _.forEach(this._players, (player : Player) => { this.analyzeRemainingUnresolvedShowsForPlayer(player); });

        //If anything changed in step 2 attempt replaying all guesses again
        if (!_.isEqual(this._gameSheet, gameSheetBeforeStep2))
            this.replayAllTurnsUntilNothingNewIsFoundOut();

        //3 Analyze realted unresolved turns
        let gameSheetBeforeStep3 = _.cloneDeep(this._gameSheet);
        this.analyzeRelatedUnresolvedShowsBetweenPlayers();

        //If anything changed in step 3 attempt replaying all guesses again
        if (!_.isEqual(this._gameSheet, gameSheetBeforeStep3))
            this.replayAllTurnsUntilNothingNewIsFoundOut();

        //4. Check all categories to see if the verdict can be deduced for that category
        //Can be done if the owner for all other cards in that category have been identified
        let previousVerdict = this._gameSheet.getVerdict();
        this.attemptToDeduceVerdictInEachCategory();

        //If verdict has changed attempt replaying all guesses again, the board now has new informtion on it
        if (!_.isEqual(previousVerdict, this._gameSheet.getVerdict()))
            this.replayAllTurnsUntilNothingNewIsFoundOut();

        //5. If only one player can have a card in a given category and the verdict is already known for that category, that player has that card
        let previousGameSheet = _.cloneDeep(this._gameSheet);
        this.attemptToResolveMustHaves();
        
        //If the game sheet has changed in any way attempt replaying all guesses again
        if (!_.isEqual(this._gameSheet, previousGameSheet))
            this.replayAllTurnsUntilNothingNewIsFoundOut();
    }

    //Get unresolved turns, either no card was shown or the turn is not yet marked as resolved, also it wasn't the detective who guessed or showed
    getUnresolvedTurns() : Turn[]
    {
        return _.filter(this._turns, (t) => {
            return t.guess && !(t.guess.cardShown || t.guess.resolvedTurn) && (!t.player.isDetective || (t.guess.playerThatShowed && !t.guess.playerThatShowed.isDetective));
        });
    }

    // 1. Unresolved turns step
    private attemptToResolveTurn(turn : Turn) : void
    {
        //Defensive check for ensuring there is a guess to attempt to resolve
        if(!turn || !turn.guess)
            return;
            
        let guess = turn.guess;
        let shower = guess.playerThatShowed;
        let guessedCards = [new Card(CardCategory.SUSPECT, guess.suspect), new Card(CardCategory.WEAPON, guess.weapon), new Card(CardCategory.ROOM, guess.room)];

        //Check to see if all cards are already owned by someone else, if they are throw an error
        let cardOwners = _.map(guessedCards, (card) => { return this._gameSheet.getPlayerWhoHasCard(card); }).filter(Boolean);
        if (cardOwners.length == 3 && !_.find(cardOwners, shower))
            throw new Error("Invalid guess, all cards are already marked as owned by someone else")

        //If any of the cards is known to be had by the shower we can stop trying to resolve this turn
        //They may have more than one of these cards, but there is no way of knowing which one it is they showed for sure
        let cardsPlayerDefinitelyHas = _.filter(guessedCards, (card) => { return this._gameSheet.getStatusForPlayerAndCard(shower, card) == CellStatus.HAD});
        if (cardsPlayerDefinitelyHas.length)
        {
            this.markTurnAsResolved(turn);
            return; 
        }

        //If there is only 1 card left that this player might have than we can resolve this turn
        let cardsPlayerMightHave = _.filter(guessedCards, (card) => { return this._gameSheet.getStatusForPlayerAndCard(shower, card) == CellStatus.UNKNOWN});
        if (cardsPlayerMightHave.length == 1)
        {
            this.markCardAsHadByPlayer(shower, cardsPlayerMightHave[0]);
            this.markTurnAsResolved(turn);
            return;
        }

        //Otherwise we don't have enough information to resolve the turn and it remains unresolved
    }

    private markTurnAsResolved(turn : Turn) : void
    {
        //Find this turn in the list of turns and update the resolved turn number to the active turn    
        _.find(this._turns, (t : Turn) => t.number == turn.number).guess.resolvedTurn = this.activeTurnNumber;
    }

    // 2. Analyze Unresolved Shows for Player Step
    // If the minimum number of cards a player must have from unresolved shows equals the number of cards remaining to identify for this player
    // than all cards not included in the unresolved guesses that are still unknown for this player can be marked as not had 
    private analyzeRemainingUnresolvedShowsForPlayer(player : Player) : void
    {
        //Get unresolved turns for this player, don't do anything if there aren't any
        var unresolvedShowsForThisPlayer = this.getUnresolvedTurnsByPlayer(player);
        if (!unresolvedShowsForThisPlayer.length)
            return;

        //Figure out how many cards are left to be identified for this player 
        let cardsPlayerHas = this._gameSheet.getAllCardsForPlayerInGivenStatus(player, CellStatus.HAD);
        let cardsLeftToIdentifyForPlayer = player.numberOfCards - cardsPlayerHas.length;
        
        //If there is more cards left to learn about than unresolved guesses there's nothing to do here
        if (cardsLeftToIdentifyForPlayer > unresolvedShowsForThisPlayer.length)
            return;

        //Figure out the minimum number of cards this player must have from all of their unresolved turns
        let minimumCardsPlayerHasFromUnresolvedTurns = this.getMinimumMustHaveCardsForPlayerFromTurns(player, unresolvedShowsForThisPlayer);

        // If the minimum number of cards from unresolved turns is the same as the number of cards left for this player, all other unknown cards can be marked as not had 
        if (minimumCardsPlayerHasFromUnresolvedTurns == cardsLeftToIdentifyForPlayer)
        {
            // Get cards left as unknown 
            let unknownCardsForPlayer = this._gameSheet.getAllCardsForPlayerInGivenStatus(player, CellStatus.UNKNOWN);
            
            // Get cards left as unknown for this player not included in one of the remaining unresolvd turns
            let cardsIncludedInUnresolvedShows = _.flatMap(unresolvedShowsForThisPlayer, (turn : Turn) => { return this.getCardsPlayerMightHaveForTurn(player, turn); });
            let cardsToMarkAsUnknown = _.differenceWith(unknownCardsForPlayer, cardsIncludedInUnresolvedShows, _.isEqual);
            
            //Mark all of these cards as unknown
            _.forEach(cardsToMarkAsUnknown, (card : Card) => { this.markCardAsNotHadByPlayer(player, card); });
        }
    }

    // Get all turns that don't have a resolution where the player passed in was the one that showed that turn
    private getUnresolvedTurnsByPlayer(player : Player) : Turn[]
    {
        var unresolvedTurns = this.getUnresolvedTurns();
        return _.filter(unresolvedTurns, (t) => { return _.isEqual(t.guess.playerThatShowed, player); });
    }

    // Identify the minimum number of cards a player must have from a list of unresolved turns
    private getMinimumMustHaveCardsForPlayerFromTurns(player : Player, turns : Turn[]) : number
    {
        let minimumCardsPlayerHas = 0;
        let runningListOfCards : Card[] = [];

        //Iterate through all turns as passed in as being an unresolved turn for this player
        _.forEach(turns, (turn : Turn) => {
            //Identify cards the player might have from this turn
            let cardsPlayerMightHave = this.getCardsPlayerMightHaveForTurn(player, turn);

            //If none of the cards the player might have shown in this turn are in the running list of cards from all unresolved turns...
            //they must have at least one of the cards involved in this turn
            if (_.differenceWith(runningListOfCards, cardsPlayerMightHave, _.isEqual).length == runningListOfCards.length)
                minimumCardsPlayerHas++;

            //Keep running list going of all cards this player may have shown
            runningListOfCards = _.unionWith(runningListOfCards, cardsPlayerMightHave, _.isEqual);
        });
        
        return minimumCardsPlayerHas;
    }

    //Identify cards the player might have from this turn
    private getCardsPlayerMightHaveForTurn(player : Player, turn : Turn)
    {
        return _.filter(turn.guess.getGuessedCards(), (card : Card) => { 
            return this._gameSheet.getStatusForPlayerAndCard(player, card) == CellStatus.UNKNOWN;
        });
    }

    // 3. If for any combination of unresolved turns the players involved must have all the cards involved, then no one else has those cards
    //     - Generate all combinations of unresolved turns (at least 2 turns)
    //     - Run the following checks for each
    //     -   Identify unique cards involved in the combination
    //     -   Identify unique players involved in the combination
    //     -   For each player identify the minimum number of cards they must have to satisfy their shows
    //     -   Sum up this number for all players
    //     -   If this equals the unique cards involved in the combination, then the players involved hold all the cards involved. 
    //     -   Therefore no one else has these cards and can be marked appropiately
    private analyzeRelatedUnresolvedShowsBetweenPlayers() : void
    {
        //Get all combinations of unresolved turns 
        let turnCombinations = this.getAllUnresolvedTurnCombinations();
        
        //Iterate through all possible combinations of these turns
        _.forEach(turnCombinations, (turns : Turn[]) => {
            //Get unique cards involved in these turns guesses
            let allCards = _.flatMap(turns, (turn : Turn) => { return this.getCardsPlayerMightHaveForTurn(turn.guess.playerThatShowed, turn); });
            let uniqueCards = _.uniqWith(allCards, _.isEqual);

            //Get unique players involved in these turns guesses
            let allPlayers = _.map(turns, (turn : Turn) => { return turn.guess.playerThatShowed; })
            let uniquePlayers = _.uniqWith(allPlayers, _.isEqual);

            //Get the sum of minimum number of must have cards for each player's shows
            let minimumNumberOfMustHaveCards = _.sumBy(uniquePlayers, (player : Player) => {
                let turnsForPlayer = _.filter(turns, (t) => { return _.isEqual(t.guess.playerThatShowed, player); }); 
                return this.getMinimumMustHaveCardsForPlayerFromTurns(player, turnsForPlayer);
            });
         
            //If unique number of cards involved is the same as the minimum number of identified must have cards then no one else has any of these cards
            if (uniqueCards.length == minimumNumberOfMustHaveCards)
            {
                //Identify Players not involved in this guess combinations
                let otherPlayers = _.differenceWith(this._players, uniquePlayers, _.isEqual);

                //Mark all cards included in this guess combination as not had by all players not involved in guess combination
                _.forEach(otherPlayers, (player : Player) => {
                    _.forEach(uniqueCards, (card : Card) => {
                        this.markCardAsNotHadByPlayer(player, card);
                    });
                });
            }
        });
    }

    // Get all combinations of unresolved turns, minimum size of 2
    // Code adapted from https://stackoverflow.com/questions/5752002/find-all-possible-subset-combos-in-an-array
    private getAllUnresolvedTurnCombinations() {
        let unresolvedTurns = this.getUnresolvedTurns();
        if (unresolvedTurns.length == 1)
            return [];

        var fn = function(n, src, got, all) {
            if (n == 0) {
                if (got.length > 0) {
                    all[all.length] = got;
                }
                return;
            }
            for (var j = 0; j < src.length; j++) {
                fn(n - 1, src.slice(j + 1), got.concat([src[j]]), all);
            }
            return;
        }

        var all = [];
        let min = 2;
        for (var i = min; i < unresolvedTurns.length; i++) {
            fn(i, unresolvedTurns, [], all);
        }

        all.push(unresolvedTurns);
        
        return all;
    }

    // 4. Verdict Decution Step
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
        let knownCardsInCategory = _.filter(allCardsInCategory, (card) => { return !!this._gameSheet.getPlayerWhoHasCard(card); });
        if (knownCardsInCategory.length == allCardsInCategory.length - 1)
        {
            let verdictInCategory = _.difference(allCardsInCategory, knownCardsInCategory)[0];
            _.forEach(this._players, (player) => { this.markCardAsNotHadByPlayer(player, verdictInCategory)});
        }
    }

    //5. Must have resolution step
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