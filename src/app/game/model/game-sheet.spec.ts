import { Player, Suspect, Card, CardCategory } from '../index';

describe("When filling out a game sheet", () => {
    it("it should throw an error when checking the status for a card and player that's not playing", () => {
        expect(true).toBe(false);
    });

    it("it should throw an error when marking a card as had for a player that isn't playing", () => {
        expect(true).toBe(false);
    });

    it("it should throw an error when a card is already marked as not had and is requested to be marked as had", () => {
        expect(true).toBe(false);
    });

    it("it should throw an error when marking a card as not had for a player that isn't playing", () => {
        expect(true).toBe(false);
    });

    it("it should throw an error when a card is already marked as had and is requested to be marked as not had", () => {
        expect(true).toBe(false);
    });

    it("it should set all cards as unknown for all players when starting the sheets", () => {
        expect(true).toBe(false);
    });

    it("it should track that a card is had when marking it as such", () => {
        expect(true).toBe(false);
    });

    it("it should track that a card is not had when marking it as such", () => {
        expect(true).toBe(false);
    });
});