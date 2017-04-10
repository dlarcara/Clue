import { GameAlgorithm, Player, CardCategory, Card, Weapon, Suspect, Room, CellStatus, Guess, GameConstants } from './index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

describe("When interacting with the game algorithm", () => {
    describe("and starting a game", () => {
        it("it should make sure a suspect isn't playing twice", () => {
            var players = [ new Player("Player 1", Suspect.PEACOCK), new Player("Player 2", Suspect.PEACOCK), new Player("Player 3", Suspect.GREEN)];
        
            expect(() => new GameAlgorithm(players)).toThrowError("Player suspect used more than once");
        });
        
        it("it should require at least 3 players", () => {
            expect(() => new GameAlgorithm([])).toThrowError("At least 3 players are required to play a game")
        });

        it("it should throw an error when getting the status for a player and card for a player that isn't playing", () => {
            expect(true).toBe(false);
        });

        it("it should throw an error when initializing the game for a detective that isn't playing", () => {
            expect(true).toBe(false);
        });

        it("it should throw an error when the player who guessed isn't playing", () => {
            expect(true).toBe(false);
        });

        it("it should throw an error when the player who showed isn't playing", () => {
            expect(true).toBe(false);
        });
    });

    let gameSheet;
    let defaultSixPlayers = [
        new Player("Player 1", Suspect.GREEN), new Player("Player 2", Suspect.MUSTARD), new Player("Player 3", Suspect.PLUM),
        new Player("Player 4", Suspect.PEACOCK), new Player("Player 5", Suspect.SCARLET), new Player("Player 6", Suspect.WHITE)
    ];

    let verifySheetForPlayer = (sheet : GameAlgorithm, player : Player, expectedCardsHad : Card[], expectedCardsNotHad : Card[]) => {
        let expectedCardStatus = (card : Card, expectedCardsHad : Card[], expectedCardsNotHad : Card[]) : CellStatus =>
        {
            if (_.findIndex(expectedCardsHad, card) != -1)
                return CellStatus.HAD;

            if (_.findIndex(expectedCardsNotHad, card) != -1)
                return CellStatus.NOTHAD;

            return CellStatus.UNKNOWN;
        }
        
        //For all Suspect Cards
        _.forEach(EnumValues.getValues(Suspect), (suspectIndex) => {
            let card = new Card(CardCategory.SUSPECT, suspectIndex);
            let expectedCellStatus = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
            let failMessage = `Expected ${Suspect[suspectIndex]} to be in state ${CellStatus[expectedCellStatus]} for ${player.name}`;
            expect(sheet.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });

        //For all Weapon Cards
        _.forEach(EnumValues.getValues(Weapon), (weaponIndex) => {
            let card = new Card(CardCategory.WEAPON, weaponIndex);
            let expectedCellStatus = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
            let failMessage = `Expected ${Weapon[weaponIndex]} to be in state ${CellStatus[expectedCellStatus]} for ${player.name}`;
            expect(sheet.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });

        //For all Room Cards
        _.forEach(EnumValues.getValues(Room), (roomIndex) => {
            let card = new Card(CardCategory.ROOM, roomIndex);
            let expectedCellStatus = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
            let failMessage = `Expected ${Room[roomIndex]} to be in state ${CellStatus[expectedCellStatus]} for ${player.name}`;
            expect(sheet.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });
    };

    let allCardsExcept = (cards : Card[]) : Card[] =>
    {
        return GameConstants.ALLCARDS.filter((card) => { return !_.find(cards, card); });
    }

    describe("for a 3 player game", () => {
        let gamePlayers;
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.DINING),
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.REVOLVER),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        beforeEach(() => {
            gamePlayers = defaultSixPlayers.slice(0,3);
            gameSheet = new GameAlgorithm(gamePlayers);
        });

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameSheet, player, [], []);
            });
        });

        it("initializing the detectives cards should mark them as had and no one else having them", () => {
            gameSheet.initializeCardsForDetective(gamePlayers[0], cardsInHand);
            
            verifySheetForPlayer(gameSheet, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameSheet, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[2], [], cardsInHand);                
        });

        it("it should show the rope as had by no one when detective guesses it and no one shows it", () => {
            gameSheet.initializeCardsForDetective(gamePlayers[0], cardsInHand);
            gameSheet.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameSheet, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameSheet, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameSheet, gamePlayers[2], [], cardsInHand.concat([rope]));                
        });
    });

    describe("for a 4 player game", () => {
        let gamePlayers;
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.KITCHEN),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        beforeEach(() => {
            gamePlayers = defaultSixPlayers.slice(0,4);
            gameSheet = new GameAlgorithm(gamePlayers);
        });

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameSheet, player, [], []);
            });
        });

        it("initializing the detectives cards should mark them as had and no one else having them", () => {
            gameSheet.initializeCardsForDetective(gamePlayers[0], cardsInHand);
            
            verifySheetForPlayer(gameSheet, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameSheet, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[3], [], cardsInHand);            
        });

        it("it should show the rope as had by no one when detective guesses it and no one shows it", () => {
            gameSheet.initializeCardsForDetective(gamePlayers[0], cardsInHand);
            gameSheet.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameSheet, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameSheet, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameSheet, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameSheet, gamePlayers[3], [], cardsInHand.concat([rope]));               
        });
    });

    describe("for a 5 player game", () => {
        let gamePlayers;
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.KNIFE), 
            new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        beforeEach(() => {
            gamePlayers = defaultSixPlayers.slice(0,5);
            gameSheet = new GameAlgorithm(gamePlayers);
        });

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameSheet, player, [], []);
            });
        });

        it("initializing the detectives cards should mark them as had and no one else having them", () => {
            gameSheet.initializeCardsForDetective(gamePlayers[0], cardsInHand);
            
            verifySheetForPlayer(gameSheet, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameSheet, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[4], [], cardsInHand);          
        });

        it("it should show the rope as had by no one when detective guesses it and no one shows it", () => {
            gameSheet.initializeCardsForDetective(gamePlayers[0], cardsInHand);
            gameSheet.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameSheet, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameSheet, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameSheet, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameSheet, gamePlayers[3], [], cardsInHand.concat([rope]));      
            verifySheetForPlayer(gameSheet, gamePlayers[4], [], cardsInHand.concat([rope]));        
        });
    });

    describe("for a 6 player game", () => {
        let gamePlayers;
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.KNIFE), 
            new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        beforeEach(() => {
            gamePlayers = defaultSixPlayers.slice(0,6);
            gameSheet = new GameAlgorithm(gamePlayers);
        });

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameSheet, player, [], []);
            });
        });

        it("initializing the detectives cards should mark them as had and no one else having them", () => {
            gameSheet.initializeCardsForDetective(gamePlayers[0], cardsInHand);
            
            verifySheetForPlayer(gameSheet, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameSheet, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameSheet, gamePlayers[4], [], cardsInHand); 
            verifySheetForPlayer(gameSheet, gamePlayers[5], [], cardsInHand);         
        });

        it("it should show the rope as had by no one when detective guesses it and no one shows it", () => {
            gameSheet.initializeCardsForDetective(gamePlayers[0], cardsInHand);
            gameSheet.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameSheet, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameSheet, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameSheet, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameSheet, gamePlayers[3], [], cardsInHand.concat([rope]));      
            verifySheetForPlayer(gameSheet, gamePlayers[4], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameSheet, gamePlayers[5], [], cardsInHand.concat([rope]));       
        });
    });
});