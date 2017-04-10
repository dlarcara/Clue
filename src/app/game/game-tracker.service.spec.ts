import { GameTracker, Player, Suspect, Card, CardCategory } from './index';

describe("When working with the game tracker", () => {
  describe("and starting a game", () => {
    let defaultDetective = new Player("Player 1", Suspect.GREEN);

    let defaultThreePlayers = [
      new Player("Player 1", Suspect.GREEN), new Player("Player 2", Suspect.MUSTARD), new Player("Player 3", Suspect.PLUM)
    ];

    let allSuspectCards = [
      new Card(CardCategory.SUSPECT, 1), new Card(CardCategory.SUSPECT, 2), new Card(CardCategory.SUSPECT, 3),
      new Card(CardCategory.SUSPECT, 4), new Card(CardCategory.SUSPECT, 5), new Card(CardCategory.SUSPECT, 6)
    ];

    it("it should make sure the detective is included in the list of players", () => {
      expect(() => new GameTracker(defaultDetective, defaultThreePlayers.slice(1,2), allSuspectCards)).toThrowError("Detective not included in list of players");
    });

    it("it should make sure a suspect isn't playing twice", () => {
      var players = defaultThreePlayers.concat(new Player("Player 1", Suspect.GREEN));
      
      expect(() => new GameTracker(defaultDetective, players, allSuspectCards)).toThrowError("Player suspect used more than once");
    });

    it("it should make sure at least 3 players are playing", () => {
      var players = defaultThreePlayers.slice(0,2);

      expect(() => new GameTracker(defaultDetective, players, [])).toThrowError("At least 3 players are required to play a game");
    });

    describe("with 3 players", () => {
      it("it should throw an error when starting with 5 cards", () => {
        let cards = allSuspectCards.slice(0,5);

        expect(() => new GameTracker(defaultDetective, defaultThreePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start game when 6 cards are passed in", () => {
        let game = new GameTracker(defaultDetective, defaultThreePlayers, allSuspectCards);

        expect(game.turns.length).toBe(1);
      });

      it("it should throw an error when 7 cards are passed in", () => {
        let cards = allSuspectCards.concat(new Card(CardCategory.ROOM, 1));

        expect(() => new GameTracker(defaultDetective, defaultThreePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });

    describe("with 4 players", () => {
      let fourPlayers : Player[];
      beforeEach(() => {
        fourPlayers = defaultThreePlayers.concat([new Player("Player 4", Suspect.PEACOCK)]);
      });

      it("it should throw an error when starting with 3 cards", () => {
        let cards = allSuspectCards.slice(0,3);

        expect(() => new GameTracker(defaultDetective, fourPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 4 cards", () => {
        let cards = allSuspectCards.slice(0,4);
        let game = new GameTracker(defaultDetective, fourPlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should successfully start a game with 5 cards", () => {
        let cards = allSuspectCards.slice(0,5);
        let game = new GameTracker(defaultDetective, fourPlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should throw an error when starting a game with 6 cards", () => {
        let cards = allSuspectCards;

        expect(() => new GameTracker(defaultDetective, fourPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });

    describe("with 5 players", () => {
      let fivePlayers : Player[];
      beforeEach(() => {
        fivePlayers = defaultThreePlayers.concat([new Player("Player 4", Suspect.PEACOCK), new Player("Player 5", Suspect.WHITE)]);
      });

      it("it should throw an error when starting game with 2 cards", () => {
        let cards = allSuspectCards.slice(0,2);

        expect(() => new GameTracker(defaultDetective, fivePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 3 cards", () => {
        let cards = allSuspectCards.slice(0,3);
        let game = new GameTracker(defaultDetective, fivePlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should successfully start a game with 4 cards", () => {
        let cards = allSuspectCards.slice(0,4);
        let game = new GameTracker(defaultDetective, fivePlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should throw an error when starting a game with 5 cards", () => {
        let cards = allSuspectCards.slice(0,5);

        expect(() => new GameTracker(defaultDetective, fivePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });  

    describe("with 6 players", () => {
      let sixPlayers : Player[];
      beforeEach(() => {
        sixPlayers = defaultThreePlayers.concat([new Player("Player 4", Suspect.PEACOCK), new Player("Player 5", Suspect.WHITE), new Player("Player 6", Suspect.SCARLET)]);
      });

      it("it should throw an error when starting with 2 cards", () => {
        let cards = allSuspectCards.slice(0,2);

        expect(() => new GameTracker(defaultDetective, sixPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 3 cards", () => {
        let cards = allSuspectCards.slice(0,3);
        let game = new GameTracker(defaultDetective, sixPlayers, cards)

        expect(game.turns.length).toBe(1);
      });

      it("it should throw an error when starting a game with 4 cards", () => {
        let cards = allSuspectCards.slice(0,4);

        expect(() => new GameTracker(defaultDetective, sixPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });  

    it("it should throw an error if duplicate cards are passed in", () => {
      var duplicateCards = allSuspectCards.slice(0,5).concat(new Card(CardCategory.SUSPECT, 1));
 
      expect(() => new GameTracker(defaultDetective, defaultThreePlayers, duplicateCards)).toThrowError('Duplicate cards were supplied');
    });

    it("it should create an initial turn", () => {
      var game = new GameTracker(defaultDetective, defaultThreePlayers, allSuspectCards);
      
      expect(game.turns[0].number).toBe(1);
      expect(game.turns[0].player).toBe(defaultDetective);
      expect(game.turns[0].guess).toBe(null);
      expect(game.turns[0].resultingSheet).toBe(null);
    }); 
  });
});