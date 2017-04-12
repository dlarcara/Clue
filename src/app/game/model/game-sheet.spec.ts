import { Player, Suspect, Weapon, Room, Card, CardCategory, GameSheet, GameConstants, CellStatus } from '../index';

import * as _ from 'lodash';

describe("When filling out a game sheet", () => {
    it("it should throw an error when starting a game sheet with less than 3 players", () => {
        expect(() => new GameSheet([])).toThrowError("Not enough players provided");
    });

    it("it should throw an error when starting a game sheet with more than 6 players", () => {
        let players = [
            new Player("Player 1", Suspect.GREEN, 3), new Player("Player 3", Suspect.MUSTARD, 3), new Player("Player 3", Suspect.PEACOCK, 3),
            new Player("Player 4", Suspect.PLUM, 3), new Player("Player 4", Suspect.SCARLET, 3), new Player("Player 6", Suspect.WHITE, 3),
            new Player("Player 7", Suspect.GREEN, 3)
        ]
        expect(() => new GameSheet(players)).toThrowError("Too many players provided");
    });

    it("it should throw an error when starting a game with duplicate suspects", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.WHITE, 6), new Player("Player 3", Suspect.WHITE, 6)];
        expect(() => new GameSheet(players)).toThrowError("Player suspect used more than once");
    });

    it("it should set all cards as unknown for all players when starting the sheets", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        _.forEach(GameConstants.ALLCARDS, (card) => {
            _.forEach(players, (player) => {
                expect(gameSheet.getStatusForPlayerAndCard(player, card)).toBe(CellStatus.UNKNOWN);
            });
        });
    });

    it("it should throw an error when attempting to set the status of a card for a player that is not playing", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        expect(() => gameSheet.markCardAsHadByPlayer(new Player("Player 2", Suspect.WHITE, 6), new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toThrowError("Player not found");
    });

    it("it should throw an error when a card is already marked as not had and is requested to be marked as had", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsNotHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE));
        expect(() => gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toThrowError("WHITE is already marked as NOTHAD for Player 1, can't mark it as HAD");
    });

    it("it should throw an error when a card is already marked as had and is requested to be marked as not had", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE));
        expect(() => gameSheet.markCardAsNotHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toThrowError("WHITE is already marked as HAD for Player 1, can't mark it as NOTHAD");
    });

    it("it should throw an error when the card is already had by someone else", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[1], new Card(CardCategory.SUSPECT, Suspect.WHITE));
        expect(() => gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toThrowError("Player 2 already already has WHITE");
    });

    it("it should throw an error when attempting to mark the card has had and all the players cards are already identified", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.MUSTARD));
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.GREEN));
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.PEACOCK));
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.PLUM));
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.SCARLET));
        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE));
        expect(() => gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.WEAPON, Weapon.ROPE)))
            .toThrowError("All 6 cards for Player 1 are already identified, can't mark ROPE as HAD");
    });

    it("it should show card as UNKNOWN if it's not known if the card is had or not", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        expect(gameSheet.getStatusForPlayerAndCard(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toBe(CellStatus.UNKNOWN);
    });

    it("it should track that a card as had when marking it as such", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE));
        expect(gameSheet.getStatusForPlayerAndCard(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toBe(CellStatus.HAD);
    });

    it("it should track that a card as not had when marking it as such", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        gameSheet.markCardAsNotHadByPlayer(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE));
        expect(gameSheet.getStatusForPlayerAndCard(players[0], new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toBe(CellStatus.NOTHAD);
    });

    it("it should throw an error when checking the status for a card and player that's not playing", () => {
        let players = [new Player("Player 1", Suspect.WHITE, 6), new Player("Player 2", Suspect.GREEN, 6), new Player("Player 3", Suspect.PLUM, 6)];
        let gameSheet = new GameSheet(players);

        expect(() => gameSheet.getStatusForPlayerAndCard(new Player("Player 2", Suspect.WHITE, 6), new Card(CardCategory.SUSPECT, Suspect.WHITE)))
            .toThrowError("Player not found");
    });
});