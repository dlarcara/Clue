import { Card, CardCategory, Suspect, Player } from '../../game/index';
import { GuessParser } from '../index';

describe("When working with the guess parser", () => {
  let guessParser;
  beforeEach(() => {
    guessParser = new GuessParser();
  });
  
  describe("and suspects", () => {
    //Green
    describe("and green", () => {
      it("it should parse green out of the guess 'Mr. Green'", () => {
        expect(guessParser.parse(["Mr. Green"], []).suspect).toEqual(new Card(CardCategory.SUSPECT, Suspect.GREEN));
      });
      
      it("it should parse green out of the guess 'Green'", () => {
        expect(guessParser.parse(["Green"], []).suspect).toEqual(new Card(CardCategory.SUSPECT, Suspect.GREEN));
      });

      it("it should parse green out of the guess 'Mr. Green in the'", () => {
        expect(guessParser.parse(["Green"], []).suspect).toEqual(new Card(CardCategory.SUSPECT, Suspect.GREEN));
      });

      it("it should parse green out of the guess 'It was green'", () => {
        expect(guessParser.parse(["It was green"], []).suspect).toEqual(new Card(CardCategory.SUSPECT, Suspect.GREEN));
      });
    });
  }); 

  describe("and players", () => {
    it("it should parse Jackie out of the guess 'Shown by Jackie'", () => {
      let players = [new Player("Jackie", Suspect.GREEN, 0, false)];
      expect(guessParser.parse(["Shown by Jackie"], players).player).toEqual(players[0]);
    });
  });   
});