import { GameSheet, Player, CardCategory, Card, Weapon, Suspect, Room } from './index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

describe("Game Sheet Suite", () => {
    describe("When starting a game sheet", () => {
        it("it should make sure a suspect isn't playing twice", () => {
            var players = [ new Player("Player 1", Suspect.PEACOCK), new Player("Player 2", Suspect.PEACOCK), new Player("Player 3", Suspect.GREEN)];
        
            expect(() => new GameSheet(players)).toThrowError("Player suspect used more than once");
        });
        
        it("it should require at least 3 players", () => {
            expect(() => new GameSheet([])).toThrowError("At least 3 players are required to play a game")
        });
    });

    describe("When interacting with the game sheet", () => {
        let defaultThreePlayers = [
            new Player("Player 1", Suspect.GREEN), new Player("Player 2", Suspect.MUSTARD), new Player("Player 3", Suspect.PLUM)
        ];

        let verifySheetForPlayer = (sheet : GameSheet, expectedCardsHad : Card[], player : Player) => {
            _.forEach(EnumValues.getValues(Suspect), (suspectIndex) => {
                let card = new Card(CardCategory.SUSPECT, suspectIndex);
                expect(sheet.doesPlayerHaveCard(player, card)).toBe(_.findIndex(expectedCardsHad, card) != -1);
            });

            _.forEach(EnumValues.getValues(Weapon), (weaponIndex) => {
                let card = new Card(CardCategory.WEAPON, weaponIndex);
                expect(sheet.doesPlayerHaveCard(player, card)).toBe(_.findIndex(expectedCardsHad, card) != -1);
            });

            _.forEach(EnumValues.getValues(Room), (roomIndex) => {
                let card = new Card(CardCategory.ROOM, roomIndex);
                expect(sheet.doesPlayerHaveCard(player, card)).toBe(_.findIndex(expectedCardsHad, card) != -1);
            });
        };

        it("it should throw an error when checking the status for a player that's not playing", () => {
            let sheet = new GameSheet(defaultThreePlayers);
            let playerToCheck = new Player("Player 4", Suspect.PEACOCK);
            let cardToCheck = new Card(CardCategory.SUSPECT, Suspect.SCARLET);

            expect(() => sheet.doesPlayerHaveCard(playerToCheck, cardToCheck))
                              .toThrowError("Invalid player supplied");
        });

       it("it should throw an error when marking the status for a player that's not playing", () => {
            let sheet = new GameSheet(defaultThreePlayers);
            let playerToMark = new Player("Player 4", Suspect.PEACOCK);
            let cardToMark = new Card(CardCategory.SUSPECT, Suspect.SCARLET);

            expect(() => sheet.markCardAsHadByPlayer(playerToMark, cardToMark))
                              .toThrowError("Invalid player supplied");
        });

        describe("When checking the status for a player and card", () => {
            it("it should show all cards as not had for new game sheet", () => {
                let sheet = new GameSheet(defaultThreePlayers);
                
                _.forEach(defaultThreePlayers, (player) => {
                    verifySheetForPlayer(sheet, [], player);
                });
            });

            it("it should show the revolver as had by Player 1 after marking it that way", () => {
                let sheet = new GameSheet(defaultThreePlayers);
                let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                sheet.markCardAsHadByPlayer(defaultThreePlayers[0], cardToMark);

                verifySheetForPlayer(sheet, [cardToMark], defaultThreePlayers[0]);
                verifySheetForPlayer(sheet, [], defaultThreePlayers[1]);
                verifySheetForPlayer(sheet, [], defaultThreePlayers[2]);                
            });
        });
    });
});