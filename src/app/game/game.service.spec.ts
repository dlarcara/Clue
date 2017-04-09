import { Game, Player, Suspect, Card, CardCategory } from './index';

describe("Game Suite", () => {
  describe("When starting a game", () => {
    let defaultDetective = new Player("Player 1", Suspect.Green);

    let defaultThreePlayers = [
      new Player("Player 1", Suspect.Green), new Player("Player 2", Suspect.Mustard), new Player("Player 3", Suspect.Plum)
    ];

    let allSuspectCards = [
      new Card(CardCategory.Suspect, 1), new Card(CardCategory.Suspect, 2), new Card(CardCategory.Suspect, 3),
      new Card(CardCategory.Suspect, 4), new Card(CardCategory.Suspect, 5), new Card(CardCategory.Suspect, 6)
    ];

    it("it should make sure the detective is included in the list of players", () => {
      expect(() => new Game(new Player("Player 1", Suspect.Peacock), [new Player("Player 2", Suspect.Green)], allSuspectCards)).toThrowError("Detective not included in list of players");
    });

    it("it should make sure a suspect isn't playing twice", () => {
      var detective = new Player("Player 1", Suspect.Peacock);
      var players = [ new Player("Player 1", Suspect.Peacock), new Player("Player 2", Suspect.Peacock), new Player("Player 3", Suspect.Green)];
      
      expect(() => new Game(detective, players, allSuspectCards)).toThrowError("Player suspect used more than once");
    });

    it("it should make sure at least 3 players are playing", () => {
      var detective = new Player("Player 1", Suspect.Peacock);
      var players = [ new Player("Player 1", Suspect.Peacock), new Player("Player 2", Suspect.Green) ];

      expect(() => new Game(detective, players, [])).toThrowError("At least 3 players are required to play a game");
    });

    describe("with 3 players", () => {
      it("it should throw an error when starting with 5 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 5);

        expect(() => new Game(defaultDetective, defaultThreePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should throw an error when 7 cards are passed in", () => {
        let cards = allSuspectCards.concat(new Card(CardCategory.Room, 1));

        expect(() => new Game(defaultDetective, defaultThreePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start game when 6 cards are passed in", () => {
        let game = new Game(defaultDetective, defaultThreePlayers, allSuspectCards);

        expect(game.detectiveCards).toBe(allSuspectCards);
      });
    });

    describe("with 4 players", () => {
      let fourPlayers : Player[];
      beforeEach(() => {
        fourPlayers = defaultThreePlayers.concat([new Player("Player 4", Suspect.Peacock)]);
      });

      it("it should throw an error when starting with 4 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 3);

        expect(() => new Game(defaultDetective, fourPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 4 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 4);

        let game = new Game(defaultDetective, fourPlayers, cards)

        expect(game.detectiveCards).toBe(cards);
      });

      it("it should successfully start a game with 5 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 5);

        let game = new Game(defaultDetective, fourPlayers, cards)

        expect(game.detectiveCards).toBe(cards);
      });

      it("it should throw an error when starting a game with 6 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 6);

        expect(() => new Game(defaultDetective, fourPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });

    describe("with 5 players", () => {
      let fivePlayers : Player[];
      beforeEach(() => {
        fivePlayers = defaultThreePlayers.concat([new Player("Player 4", Suspect.Peacock), new Player("Player 5", Suspect.White)]);
      });

      it("it should throw an error when starting game with 2 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 2);

        expect(() => new Game(defaultDetective, fivePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 3 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 3);

        let game = new Game(defaultDetective, fivePlayers, cards)

        expect(game.detectiveCards).toBe(cards);
      });

      it("it should successfully start a game with 4 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 4);

        let game = new Game(defaultDetective, fivePlayers, cards)

        expect(game.detectiveCards).toBe(cards);
      });

      it("it should throw an error when starting a game with 6 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 5);

        expect(() => new Game(defaultDetective, fivePlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });  

    describe("with 6 players", () => {
      let sixPlayers : Player[];
      beforeEach(() => {
        sixPlayers = defaultThreePlayers.concat([new Player("Player 4", Suspect.Peacock), new Player("Player 5", Suspect.White), new Player("Player 6", Suspect.Scarlet)]);
      });

      it("it should throw an error when starting with 2 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 2);

        expect(() => new Game(defaultDetective, sixPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });

      it("it should successfully start a game with 3 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 3);

        let game = new Game(defaultDetective, sixPlayers, cards)

        expect(game.detectiveCards).toBe(cards);
      });

      it("it should throw an error when starting a game with 4 cards", () => {
        let cards = allSuspectCards.filter(x => x.cardIndex <= 4);

        expect(() => new Game(defaultDetective, sixPlayers, cards)).toThrowError("The wrong number of cards was supplied");
      });
    });  

    it("it should throw an error if duplicate cards are passed in", () => {
      var duplicateCards = allSuspectCards.filter(x => x.cardIndex <= 5).concat(new Card(CardCategory.Suspect, 1));
 
      expect(() => new Game(defaultDetective, defaultThreePlayers, duplicateCards)).toThrowError('Duplicate cards were supplied');
    });

    it("it should track who you are, the players, and your cards", () => {
      var game = new Game(defaultDetective, defaultThreePlayers, allSuspectCards);
      
      expect(game.detective.name).toBe('Player 1');
      expect(game.detective.suspect).toBe(Suspect.Green);

      expect(game.players).toBe(defaultThreePlayers);

      expect(game.detectiveCards).toBe(allSuspectCards);
    });
  });
});