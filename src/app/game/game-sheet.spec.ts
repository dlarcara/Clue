import { GameSheet, Player, CardCategory, Card, Weapon, Suspect, Room, CellStatus } from './index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

describe("Game Sheet Suite:", () => {
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
        let defaultSixPlayers = [
            new Player("Player 1", Suspect.GREEN), new Player("Player 2", Suspect.MUSTARD), new Player("Player 3", Suspect.PLUM),
            new Player("Player 4", Suspect.PEACOCK), new Player("Player 5", Suspect.SCARLET), new Player("Player 6", Suspect.WHITE)
        ];

        describe("and passing in bad information", () => {
            it("it should throw an error when checking the status by a card for a player that's not playing", () => {
                let sheet = new GameSheet(defaultSixPlayers.slice(0,3));
                let playerToCheck = new Player("Player 4", Suspect.PEACOCK);
                let cardToCheck = new Card(CardCategory.SUSPECT, Suspect.SCARLET);

                expect(() => sheet.getStatusForPlayerAndCard(playerToCheck, cardToCheck))
                                .toThrowError("Invalid player supplied");
            });

            it("it should throw an error when marking a card as had by a player that's not playing", () => {
                let sheet = new GameSheet(defaultSixPlayers.slice(0,3));
                let playerToMark = new Player("Player 4", Suspect.PEACOCK);
                let cardToMark = new Card(CardCategory.SUSPECT, Suspect.SCARLET);

                expect(() => sheet.markCardAsHadByPlayer(playerToMark, cardToMark))
                                .toThrowError("Invalid player supplied");
            });

            it("it should throw an error when marking a card as note had by a player and the status has aleady been set to had", () => {
                let sheet = new GameSheet(defaultSixPlayers.slice(0,3));
                let cardToMark = new Card(CardCategory.SUSPECT, Suspect.SCARLET);

                sheet.markCardAsHadByPlayer(defaultSixPlayers[0], cardToMark)

                expect(() => sheet.markCardAsNotHadByPlayer(defaultSixPlayers[0], cardToMark))
                                .toThrowError("Cell status has already been set differently");
            });

            it("it should throw an error when marking a card as not had by a player that's not playing", () => {
                let sheet = new GameSheet(defaultSixPlayers.slice(0,3));
                let playerToMark = new Player("Player 4", Suspect.PEACOCK);
                let cardToMark = new Card(CardCategory.SUSPECT, Suspect.SCARLET);

                expect(() => sheet.markCardAsNotHadByPlayer(playerToMark, cardToMark))
                                .toThrowError("Invalid player supplied");
            });

            it("it should throw an error when marking a card as had by a player and the status has already been set to not had", () => {
                let sheet = new GameSheet(defaultSixPlayers.slice(0,3));
                let cardToMark = new Card(CardCategory.SUSPECT, Suspect.SCARLET);

                sheet.markCardAsNotHadByPlayer(defaultSixPlayers[0], cardToMark)

                expect(() => sheet.markCardAsHadByPlayer(defaultSixPlayers[0], cardToMark))
                                .toThrowError("Cell status has already been set differently");
            });
        });

        describe("and checking the status", () => {
            let gameSheet;
            let verifySheetForPlayer = (sheet : GameSheet, player : Player, expectedCardsHad : Card[], expectedCardsNotHad : Card[]) => {
                let expectedCardStatus = (card : Card, expectedCardsHad : Card[], expectedCardsNotHad : Card[]) =>
                {
                    if (_.findIndex(expectedCardsHad, card) != -1)
                        return CellStatus.Had;

                    if (_.findIndex(expectedCardsNotHad, card) != -1)
                        return CellStatus.NotHad;

                    return CellStatus.Unknown;
                }
                
                //For all Suspect Cards
                _.forEach(EnumValues.getValues(Suspect), (suspectIndex) => {
                    let card = new Card(CardCategory.SUSPECT, suspectIndex);
                    let expectedState = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
                    let failMessage = `Expected ${Suspect[suspectIndex]} to be in state ${expectedState} for ${player.name}`;
                    expect(sheet.getStatusForPlayerAndCard(player, card)).toBe(expectedState, failMessage);
                });

                //For all Weapon Cards
                _.forEach(EnumValues.getValues(Weapon), (weaponIndex) => {
                    let card = new Card(CardCategory.WEAPON, weaponIndex);
                    let expectedState = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
                    let failMessage = `Expected ${Weapon[weaponIndex]} to be in state ${expectedState} for ${player.name}`;
                    expect(sheet.getStatusForPlayerAndCard(player, card)).toBe(expectedState, failMessage);
                });

                //For all Room Cards
                _.forEach(EnumValues.getValues(Room), (roomIndex) => {
                    let card = new Card(CardCategory.ROOM, roomIndex);
                    let expectedState = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
                    let failMessage = `Expected ${Room[roomIndex]} to be in state ${expectedState} for ${player.name}`;
                    expect(sheet.getStatusForPlayerAndCard(player, card)).toBe(expectedState, failMessage);
                });
            };

            describe("for a 3 player game", () => {
                let defaultThreePlayers = defaultSixPlayers.slice(0,3);
                beforeEach(() => {
                    gameSheet = new GameSheet(defaultThreePlayers);
                });

                it("it should show all cards as not had for new game sheet", () => {
                    _.forEach(defaultThreePlayers, (player) => {
                        verifySheetForPlayer(gameSheet, player, [], []);
                    });
                });

                it("it should show the revolver as had by Player 1 and no one else after marking Player 1 as having the Revolver", () => {
                    let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                    gameSheet.markCardAsHadByPlayer(defaultThreePlayers[0], cardToMark);

                    verifySheetForPlayer(gameSheet, defaultThreePlayers[0], [cardToMark], []);
                    verifySheetForPlayer(gameSheet, defaultThreePlayers[1], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultThreePlayers[2], [], [cardToMark]);                
                });

                it("it should show the revolver as not had by Player 1 after marking Player 1 as not having the Revolver", () => {
                    let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                    gameSheet.markCardAsNotHadByPlayer(defaultThreePlayers[0], cardToMark);

                    verifySheetForPlayer(gameSheet, defaultThreePlayers[0], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultThreePlayers[1], [], []);
                    verifySheetForPlayer(gameSheet, defaultThreePlayers[2], [], []);                
                });
            });

            describe("for a 4 player game", () => {
                let defaultFourPlayers = defaultSixPlayers.slice(0,4);
                beforeEach(() => {
                    gameSheet = new GameSheet(defaultFourPlayers);
                });

                it("it should show all cards as not had for new game sheet", () => {
                    let sheet = new GameSheet(defaultFourPlayers);
                    
                    _.forEach(defaultFourPlayers, (player) => {
                        verifySheetForPlayer(sheet, player, [], []);
                    });
                });

                it("it should show the revolver as had by Player 1 and no one else after marking Player 1 as having the Revolver", () => {
                    let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                    gameSheet.markCardAsHadByPlayer(defaultFourPlayers[0], cardToMark);

                    verifySheetForPlayer(gameSheet, defaultFourPlayers[0], [cardToMark], []);
                    verifySheetForPlayer(gameSheet, defaultFourPlayers[1], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultFourPlayers[2], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultFourPlayers[3], [], [cardToMark]);
                });

                it("it should show the revolver as not had by Player 1 after marking Player 1 as not having the Revolver", () => {
                    let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                    gameSheet.markCardAsNotHadByPlayer(defaultFourPlayers[0], cardToMark);

                    verifySheetForPlayer(gameSheet, defaultFourPlayers[0], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultFourPlayers[1], [], []);
                    verifySheetForPlayer(gameSheet, defaultFourPlayers[2], [], []);
                    verifySheetForPlayer(gameSheet, defaultFourPlayers[3], [], []);              
                });
            });

            describe("for a 5 player game", () => {
                let defaultFivePlayers = defaultSixPlayers.slice(0,5);
                beforeEach(() => {
                    gameSheet = new GameSheet(defaultFivePlayers);
                });

                it("it should show all cards as not had for new game sheet", () => {
                    let sheet = new GameSheet(defaultFivePlayers);
                    
                    _.forEach(defaultFivePlayers, (player) => {
                        verifySheetForPlayer(sheet, player, [], []);
                    });
                });

                it("it should show the revolver as had by Player 1 and no one else after marking Player 1 as having the Revolver", () => {
                    let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                    gameSheet.markCardAsHadByPlayer(defaultFivePlayers[0], cardToMark);

                    verifySheetForPlayer(gameSheet, defaultFivePlayers[0], [cardToMark], []);
                    verifySheetForPlayer(gameSheet, defaultFivePlayers[1], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultFivePlayers[2], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultFivePlayers[3], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultFivePlayers[4], [], [cardToMark]);
                });

                it("it should show the revolver as not had by Player 1 after marking Player 1 as not having the Revolver", () => {
                    let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                    gameSheet.markCardAsNotHadByPlayer(defaultFivePlayers[0], cardToMark);

                    verifySheetForPlayer(gameSheet, defaultFivePlayers[0], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultFivePlayers[1], [], []);
                    verifySheetForPlayer(gameSheet, defaultFivePlayers[2], [], []);
                    verifySheetForPlayer(gameSheet, defaultFivePlayers[3], [], []);
                    verifySheetForPlayer(gameSheet, defaultFivePlayers[4], [], []);              
                });
            });

            describe("for a 6 player game", () => {
                beforeEach(() => {
                    gameSheet = new GameSheet(defaultSixPlayers);
                });

                it("it should show all cards as not had for new game sheet", () => {
                    let sheet = new GameSheet(defaultSixPlayers);
                    
                    _.forEach(defaultSixPlayers, (player) => {
                        verifySheetForPlayer(sheet, player, [], []);
                    });
                });

                it("it should show the revolver as had by Player 1 and no one else after marking Player 1 as having the Revolver", () => {
                    let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                    gameSheet.markCardAsHadByPlayer(defaultSixPlayers[0], cardToMark);

                    verifySheetForPlayer(gameSheet, defaultSixPlayers[0], [cardToMark], []);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[1], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[2], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[3], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[4], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[5], [], [cardToMark]);
                });

                it("it should show the revolver as not had by Player 1 after marking Player 1 as not having the Revolver", () => {
                    let cardToMark = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
                    gameSheet.markCardAsNotHadByPlayer(defaultSixPlayers[0], cardToMark);

                    verifySheetForPlayer(gameSheet, defaultSixPlayers[0], [], [cardToMark]);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[1], [], []);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[2], [], []);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[3], [], []);
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[4], [], []); 
                    verifySheetForPlayer(gameSheet, defaultSixPlayers[5], [], []);             
                });
            });
        });
    });
});