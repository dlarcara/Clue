import { Player, Suspect, Weapon, Room, Card, CardCategory, GameSheet, GameConstants, CellStatus, Verdict } from '../index';

import * as _ from 'lodash';

describe("When filling out a game sheet", () => {
    it("it should throw an error when starting a game sheet with less than 3 players", () => {
        expect(() => new GameSheet([])).toThrowError("Not enough players provided");
    });

    it("it should throw an error when starting a game sheet with more than 6 players", () => {
        let players = [
            new Player("Player 1", Suspect.GREEN, 3, true), new Player("Player 3", Suspect.MUSTARD, 3, false), new Player("Player 3", Suspect.PEACOCK, 3, false),
            new Player("Player 4", Suspect.PLUM, 3, false), new Player("Player 4", Suspect.SCARLET, 3, false), new Player("Player 6", Suspect.WHITE, 3, false),
            new Player("Player 7", Suspect.GREEN, 3, false)
        ]
        expect(() => new GameSheet(players)).toThrowError("Too many players provided");
    });

    it("it should throw an error when starting a game with duplicate suspects", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.WHITE, 6, false), new Player("Player 3", Suspect.WHITE, 6, false)];
        expect(() => new GameSheet(players)).toThrowError("Player suspect used more than once");
    });

    it("it should set all cards as unknown for all players when starting the sheets", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        _.forEach(GameConstants.ALLCARDS, (card) => {
            _.forEach(players, (player) => {
                expect(gameSheet.getStatusForPlayerAndCard(player, card)).toBe(CellStatus.UNKNOWN);
            });
        });
    });

    it("it should throw an error when attempting to set the status of a card for a player that is not playing", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        expect(() => gameSheet.markCardAsHadByPlayer(new Player("Player 2", Suspect.WHITE, 6, false), new Card(CardCategory.SUSPECT, Suspect.WHITE), 1))
            .toThrowError("Player not found");
    });

    it("it should throw an error when a card is already marked as not had and is requested to be marked as had", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsNotHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE), 1);
        expect(() => gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE), 2))
            .toThrowError("Mrs. White is already marked as not had by Player 1, can't mark it as had");
    });

    it("it should throw an error when a card is already marked as had and is requested to be marked as not had", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE), 1);
        expect(() => gameSheet.markCardAsNotHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE), 2))
            .toThrowError("Mrs. White is already marked as had by Player 1, can't mark it as not had");
    });

    it("it should throw an error when a card is already marked as had and is requested to be marked as not had", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.WEAPON, Weapon.ROPE), 1);
        expect(() => gameSheet.markCardAsNotHadByPlayer(players[0], new Card(CardCategory.WEAPON, Weapon.ROPE), 2))
            .toThrowError("The rope is already marked as had by Player 1, can't mark it as not had");
    });

    it("it should throw an error when the card is already had by someone else", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[1], new Card(CardCategory.SUSPECT, Suspect.WHITE),1 );
        expect(() => gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE), 2))
            .toThrowError("Player 2 already has Mrs. White, can't mark it as had by Player 1");
    });

    it("it should throw an error when attempting to mark the card has had and all the players cards are already identified", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.MUSTARD), 1);
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.GREEN), 2);
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.PEACOCK), 3);
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.PLUM), 4);
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.SCARLET), 5);
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE), 6);
        expect(() => gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.WEAPON, Weapon.ROPE), 7))
            .toThrowError("All 6 cards for Player 1 are already identified, can't mark the rope as had");
    });

    it("it should throw an error when marking a card as not known for all players and a verdict in that category has already been reached", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        _.forEach(players, (p) => gameSheet.markCardAsNotHadByPlayer(p, new Card(CardCategory.SUSPECT, Suspect.MUSTARD), 1));
        _.forEach(players.slice(0,2), (p) => gameSheet.markCardAsNotHadByPlayer(p, new Card(CardCategory.SUSPECT, Suspect.GREEN), 2));
        
        expect(() => gameSheet.markCardAsNotHadByPlayer(players[2], new Card(CardCategory.SUSPECT, Suspect.GREEN), 3))
            .toThrowError("Can't mark Mr. Green as not had by Player 3, no one else has Mr. Green and a verdict has already been reached in this category");        
    });

    it("it should show card as UNKNOWN if it's not known if the card is had or not", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        expect(gameSheet.getStatusForPlayerAndCard(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toBe(CellStatus.UNKNOWN);
    });

    it("it should track that a card as had when marking it as such", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE), 1);
        expect(gameSheet.getStatusForPlayerAndCard(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toBe(CellStatus.HAD);
    });

    it("it should track that a card as not had when marking it as such", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsNotHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE), 1);
        expect(gameSheet.getStatusForPlayerAndCard(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toBe(CellStatus.NOTHAD);
    });

    it("it should throw an error when checking the status for a card and player that's not playing", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        expect(() => gameSheet.getStatusForPlayerAndCard(new Player("Player 2", Suspect.WHITE, 6, false), new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toThrowError("Player not found");
    });
    
    it("it should return the current known verdict when requested", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6, true), new Player("Player 2", Suspect.GREEN, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)];
        let gameSheet = new GameSheet(players);

        let mustard = new Card(CardCategory.SUSPECT, Suspect.MUSTARD);
        let hall = new Card(CardCategory.ROOM, Room.HALL);

        _.forEach(players, (p) => gameSheet.markCardAsNotHadByPlayer(p, mustard, 1));
        _.forEach(players, (p) => gameSheet.markCardAsNotHadByPlayer(p, hall, 2));

        expect(gameSheet.getVerdict()).toEqual(new Verdict(mustard, null, hall));
    });
});