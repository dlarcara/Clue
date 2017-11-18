import { Injectable } from "@angular/core";

import { GameConstants, Player, Card, Turn, Guess, GameAlgorithm, CellStatus, Verdict, TurnLessons, LessonsLearnedForPlayer } from './index';
import { GameLoaderService, GameDetails } from '../shared/index';

import * as _ from 'lodash';

@Injectable()

export class GameTracker
{
    detectiveCards : Card[]
    players : Player[]
    useOrchid : Boolean

    get turns() : Turn[] { return this.gameAlgorithm.turns; }

    private gameAlgorithm : GameAlgorithm;

    constructor(private gameLoaderService : GameLoaderService){}

    configureGame(useOrchid : Boolean)
    {
        this.useOrchid = useOrchid; 
        GameConstants.useDrOrchid(useOrchid);
    }

    startGame(players: Player[], detectiveCards: Card[]) : void 
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

        this.addLessonsLearnedForTurn();
        this.saveGame();
    }

    enterPass(player : Player) : void
    {
        this.enterPassInternal(player);
        this.saveGame();
    }

    private enterPassInternal(player : Player) : void
    {
        this.gameAlgorithm.enterPass(player);
        this.addLessonsLearnedForTurn();
    }

    enterTurn(guess : Guess) : void
    {
        this.enterTurnInternal(guess);
        this.saveGame();
    }

    private enterTurnInternal(guess : Guess) : void 
    {
        this.gameAlgorithm.applyGuess(guess);
        this.addLessonsLearnedForTurn();
    }

    //TODO: Test this
    replayTurns(turns : Turn[]) : void
    {
        let previousAlgorithm = _.cloneDeep(this.gameAlgorithm);

        let successfulReplay = true;
        this.gameAlgorithm = new GameAlgorithm(this.players, this.detectiveCards);
        this.addLessonsLearnedForTurn();
        
        try
        {
            _.forEach(turns, (turn) => {
                //Don't replay the start game turn
                if (turn.number == 0)
                    return;

                if (!turn.guess)
                {
                    this.enterPassInternal(turn.player);
                } 
                else
                {
                    //Reconstruct Turn & Guess to ensure all calculated information is wiped off
                    let guess = new Guess(turn.guess.suspect, turn.guess.weapon, turn.guess.room, turn.guess.playerThatGuessed,
                                          turn.guess.playerThatShowed, turn.guess.cardShown);

                    this.enterTurnInternal(guess);
                }    
            });
        }
        catch(error)
        {
            successfulReplay = false;
            throw error;
        }

        if (!successfulReplay)
            this.gameAlgorithm = previousAlgorithm;

        this.saveGame();
    }

    //TODO: Test this
    getActivePlayer() : Player
    {
        //First turn is the start game turn, still player 1's turn
        if (this.turns.length == 1)
            return this.players[0];

        return this.getNextPlayer(this.getActiveTurn().player);
    }

    getActiveTurn() : Turn
    {   
        return this.turns[this.turns.length-1];
    }

    getDetective() : Player
    {
        return this.gameAlgorithm.detective;
    }

    getNextPlayer(player : Player) : Player
    {
        return this.gameAlgorithm.getNextPlayer(player);
    }

    private saveGame() : void
    {
        let gameDetails = new GameDetails(this.players, this.detectiveCards, this.turns, this.useOrchid);
        this.gameLoaderService.saveGame(gameDetails);
    }

    //TODO: Test this
    private addLessonsLearnedForTurn() : void
    {
        let turnToFillOut = this.getActiveTurn();

        //Tack on resulting sheet to turn
        turnToFillOut.resultingSheet = _.cloneDeep(this.gameAlgorithm.gameSheet);

        //Create Lessons Learned for Players this Turn
        let lessonsLearnedForPlayers = [];
        _.forEach(this.players, (player : Player) => {
            let cardsHad = turnToFillOut.resultingSheet.getAllEntriesForPlayerAndTurnAndStatus(player, turnToFillOut.number, CellStatus.HAD);
            let cardsNotHad = turnToFillOut.resultingSheet.getAllEntriesForPlayerAndTurnAndStatus(player, turnToFillOut.number, CellStatus.NOTHAD);

            lessonsLearnedForPlayers.push(new LessonsLearnedForPlayer(player, cardsHad, cardsNotHad));
        });
        
        //Create Gueses resolved by this turn
        let resolvedTurns = _.filter(this.turns, (t) => {
            return t.guess && t.guess.resolvedTurn == turnToFillOut.number && !t.guess.playerThatGuessed.isDetective && !t.guess.playerThatShowed.isDetective;
        }).map((t) => t.number);

        //Unresolved Turns
        let unresolvedTurns = this.gameAlgorithm.getUnresolvedTurns().map((t) => t.number);

        //Mark if given category verdict was identified
        let suspectIdentified : Boolean, weaponIdentified : Boolean, roomIdentified : Boolean;
        let currentVerdict : Verdict = this.gameAlgorithm.gameSheet.getVerdict();
        let previousVerdict : Verdict = (this.turns.length > 1) ? 
            this.turns[this.turns.length-2].lessonsLearned.verdict : 
            new Verdict(null, null, null);

        suspectIdentified = (currentVerdict.suspect != null && previousVerdict.suspect == null);
        weaponIdentified = (currentVerdict.weapon != null && previousVerdict.weapon == null);
        roomIdentified = (currentVerdict.room != null && previousVerdict.room == null);
    
        //Get Progress for the given turn
        let progress = turnToFillOut.resultingSheet.getProgress();

        //Assign all lessons learned to turn
        let lessonsLearned = new TurnLessons(lessonsLearnedForPlayers, resolvedTurns, unresolvedTurns, currentVerdict,
                                             suspectIdentified, weaponIdentified, roomIdentified, progress);
        turnToFillOut.lessonsLearned = lessonsLearned;
    }
}