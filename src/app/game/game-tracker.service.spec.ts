import { GameTracker, Player, Suspect, Card, CardCategory } from './index';

describe("When working with the game tracker", () => {
  describe("and starting a game", () => {
    let defaultThreePlayers = [
      new Player("Player 1", Suspect.GREEN, 6), new Player("Player 2", Suspect.MUSTARD, 6), new Player("Player 3", Suspect.PLUM, 6)
    ];

    let allSuspectCards = [
      new Card(CardCategory.SUSPECT, 1), new Card(CardCategory.SUSPECT, 2), new Card(CardCategory.SUSPECT, 3),
      new Card(CardCategory.SUSPECT, 4), new Card(CardCategory.SUSPECT, 5), new Card(CardCategory.SUSPECT, 6)
    ];

    it("it should make sure the detective is included in the list of players", () => {
      expect(() => new GameTracker(new Player("Player 4", Suspect.WHITE, 6), defaultThreePlayers, allSuspectCards)).toThrowError("Detective not included in list of players");
    });

    it("it should make sure a suspect isn't playing twice", () => {
      var players = defaultThreePlayers.slice(0,2).concat(new Player("Player 1", Suspect.GREEN, 6));
      
      expect(() => new GameTracker(defaultThreePlayers[0], players, allSuspectCards)).toThrowError("Player suspect used more than once");
    });

    it("it should make sure at least 3 players are playing", () => {
      var players = defaultThreePlayers.slice(0,2);

      expect(() => new GameTracker(defaultThreePlayers[0], players, [])).toThrowError("At least 3 players are required to play a game");
    });

    it("it should throw an error if total number of cards amongst players is not 18", () => {
      expect(true).toBe(false);
    });

    describe("with 3 players", () => {
      it("it should throw an error when starting with 5 cards", () => {
        let cards = allSuspectCards.slice(0,5);

        expect(() => new GameTracker(defaultThreePlayers[0], defaultThreePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start game when 6 cards are passed in", () => {
        let game = new GameTracker(defaultThreePlayers[0], defaultThreePlayers, allSuspectCards);

        expect(game.turns.length).toBe(1);
      });

      it("it should throw an error when 7 cards are passed in", () => {
        let cards = allSuspectCards.concat(new Card(CardCategory.ROOM, 1));

        expect(() => new GameTracker(defaultThreePlayers[0], defaultThreePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });

    describe("with 4 players", () => {
      let defaultFourPlayers = [
        new Player("Player 1", Suspect.GREEN, 5), new Player("Player 2", Suspect.MUSTARD, 5), 
        new Player("Player 3", Suspect.PLUM, 4), new Player("Player 4", Suspect.PEACOCK, 4)
      ];

      it("it should throw an error when starting with 3 cards", () => {
        let cards = allSuspectCards.slice(0,3);

        expect(() => new GameTracker(defaultFourPlayers[0], defaultFourPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 4 cards", () => {
        let cards = allSuspectCards.slice(0,4);
        let game = new GameTracker(defaultFourPlayers[0], defaultFourPlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should successfully start a game with 5 cards", () => {
        let cards = allSuspectCards.slice(0,5);
        let game = new GameTracker(defaultFourPlayers[0], defaultFourPlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should throw an error when starting a game with 6 cards", () => {
        let cards = allSuspectCards;

        expect(() => new GameTracker(defaultFourPlayers[0], defaultFourPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });

    describe("with 5 players", () => {
      let defaultFivePlayers = [
        new Player("Player 1", Suspect.GREEN, 4), new Player("Player 2", Suspect.MUSTARD, 4), new Player("Player 3", Suspect.PLUM, 4), 
        new Player("Player 4", Suspect.PEACOCK, 3), new Player("Player 5", Suspect.WHITE, 3)
      ];

      it("it should throw an error when starting game with 2 cards", () => {
        let cards = allSuspectCards.slice(0,2);

        expect(() => new GameTracker(defaultFivePlayers[0], defaultFivePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 3 cards", () => {
        let cards = allSuspectCards.slice(0,3);
        let game = new GameTracker(defaultFivePlayers[0], defaultFivePlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should successfully start a game with 4 cards", () => {
        let cards = allSuspectCards.slice(0,4);
        let game = new GameTracker(defaultFivePlayers[0], defaultFivePlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should throw an error when starting a game with 5 cards", () => {
        let cards = allSuspectCards.slice(0,5);

        expect(() => new GameTracker(defaultFivePlayers[0], defaultFivePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });  

    describe("with 6 players", () => {
      let defaultSixPlayers = [
        new Player("Player 1", Suspect.GREEN, 3), new Player("Player 2", Suspect.MUSTARD, 3), new Player("Player 3", Suspect.PLUM, 3), 
        new Player("Player 4", Suspect.PEACOCK, 3), new Player("Player 5", Suspect.WHITE, 3), new Player("Player 6", Suspect.SCARLET, 3)
      ];

      it("it should throw an error when starting with 2 cards", () => {
        let cards = allSuspectCards.slice(0,2);

        expect(() => new GameTracker(defaultSixPlayers[0], defaultSixPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 3 cards", () => {
        let cards = allSuspectCards.slice(0,3);
        let game = new GameTracker(defaultSixPlayers[0], defaultSixPlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should throw an error when starting a game with 4 cards", () => {
        let cards = allSuspectCards.slice(0,4);

        expect(() => new GameTracker(defaultSixPlayers[0], defaultSixPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });  

    it("it should throw an error if duplicate cards are passed in", () => {
      var duplicateCards = allSuspectCards.slice(0,5).concat(new Card(CardCategory.SUSPECT, 1));
 
      expect(() => new GameTracker(defaultThreePlayers[0], defaultThreePlayers, duplicateCards)).toThrowError('Duplicate cards were supplied');
    });

    it("it should create an initial turn", () => {
      var game = new GameTracker(defaultThreePlayers[0], defaultThreePlayers, allSuspectCards);
      
      expect(game.turns[0].number).toBe(1);
      expect(game.turns[0].player).toBe(defaultThreePlayers[0]);
      expect(game.turns[0].guess).toBe(null);
      expect(game.turns[0].resultingSheet).toBe(null);
    });
  });
});