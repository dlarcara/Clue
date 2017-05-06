import { GameTracker, Player, Suspect, Card, CardCategory } from './index';
import { GameDetails } from '../shared/index';

class MockGameLoaderService
{
    saveGame(gameDetails : GameDetails) : void { }
    loadGame() : GameDetails { return null; }
    removeGame() : void { }
}

describe("When working with the game tracker", () => {
  let gameTracker : GameTracker;
  beforeEach(() => {
    gameTracker = new GameTracker(new MockGameLoaderService());
  });
  describe("and starting a game", () => {
    let defaultThreePlayers = [
      new Player("Player 1", Suspect.GREEN, 6, true), new Player("Player 2", Suspect.MUSTARD, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)
    ];

    let allSuspectCards = [
      new Card(CardCategory.SUSPECT, 1), new Card(CardCategory.SUSPECT, 2), new Card(CardCategory.SUSPECT, 3),
      new Card(CardCategory.SUSPECT, 4), new Card(CardCategory.SUSPECT, 5), new Card(CardCategory.SUSPECT, 6)
    ];

    it("it should make sure only one detective is identified", () => {
      
      expect(() => gameTracker.startGame(defaultThreePlayers.concat(new Player("Player 4", Suspect.WHITE, 6, true)), allSuspectCards))
            .toThrowError("Must define a single detective");
    });

    it("it should make sure at least one detective is identified", () => {
      let noDetectivePlayerList = [
        new Player("Player 1", Suspect.GREEN, 6, false), new Player("Player 2", Suspect.MUSTARD, 6, false), new Player("Player 3", Suspect.PLUM, 6, false)
      ];
      expect(() => gameTracker.startGame(noDetectivePlayerList, allSuspectCards.slice(0,5))).toThrowError("Must define a single detective");
    });


    it("it should make sure the right number of cards are identified for the detective", () => {
      expect(() => gameTracker.startGame(defaultThreePlayers, allSuspectCards.slice(0,2)))
            .toThrowError("Wrong number of cards identified for the detective");
    });

    it("it should make sure a suspect isn't playing twice", () => {
      var players = defaultThreePlayers.slice(0,2).concat(new Player("Player 2", Suspect.MUSTARD, 6, false));
      
      expect(() => gameTracker.startGame(players, allSuspectCards)).toThrowError("Player suspect used more than once");
    });

    it("it should make sure at least 3 players are playing", () => {
      var players = defaultThreePlayers.slice(0,2);

      expect(() => gameTracker.startGame(players, allSuspectCards)).toThrowError("At least 3 players are required to play a game");
    });

    it("it should throw an error if total number of cards amongst players is not 18", () => {
      expect(true).toBe(false);
    });

    describe("with 3 players", () => {
      it("it should throw an when the cards are not evenly distributed among the players", () => {
        expect(true).toBe(false);
      });
    });

    describe("with 4 players", () => {
      let defaultFourPlayers = [
        new Player("Player 1", Suspect.GREEN, 5, true), new Player("Player 2", Suspect.MUSTARD, 5, false), 
        new Player("Player 3", Suspect.PLUM, 4, false), new Player("Player 4", Suspect.PEACOCK, 4, false)
      ];

      it("it should throw an when the cards are not evenly distributed among the players", () => {
        expect(true).toBe(false);
      });
    });

    describe("with 5 players", () => {
      let defaultFivePlayers = [
        new Player("Player 1", Suspect.GREEN, 4, true), new Player("Player 2", Suspect.MUSTARD, 4, false), new Player("Player 3", Suspect.PLUM, 4, false), 
        new Player("Player 4", Suspect.PEACOCK, 3, false), new Player("Player 5", Suspect.WHITE, 3, false)
      ];

      it("it should throw an when the cards are not evenly distributed among the players", () => {
        expect(true).toBe(false);
      });
    });  

    describe("with 6 players", () => {
      let defaultSixPlayers = [
        new Player("Player 1", Suspect.GREEN, 3, true), new Player("Player 2", Suspect.MUSTARD, 3, false), new Player("Player 3", Suspect.PLUM, 3, false), 
        new Player("Player 4", Suspect.PEACOCK, 3, false), new Player("Player 5", Suspect.WHITE, 3, false), new Player("Player 6", Suspect.SCARLET, 3, false)
      ];

      it("it should throw an when the cards are not evenly distributed among the players", () => {
        expect(true).toBe(false);
      });
    });  

    it("it should throw an error if duplicate cards are passed in", () => {
      var duplicateCards = allSuspectCards.slice(0,5).concat(new Card(CardCategory.SUSPECT, 1));
 
      expect(() => gameTracker.startGame(defaultThreePlayers, duplicateCards)).toThrowError('Duplicate cards were supplied');
    });
  });
});