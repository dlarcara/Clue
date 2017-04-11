import { GameAlgorithm, Player, CardCategory, Card, Weapon, Suspect, Room, CellStatus, Guess, GameConstants } from './index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

describe("When interacting with the game algorithm", () => {
    describe("and exercising error condtions", () => {
        let defaultPlayers = [ new Player("Player 1", Suspect.PEACOCK, 6), new Player("Player 2", Suspect.PLUM, 6), new Player("Player 3", Suspect.GREEN, 6)];
        
        it("it should make sure a suspect isn't playing twice", () => {
            let duplicatePlayers = [ new Player("Player 1", Suspect.PEACOCK, 6), new Player("Player 2", Suspect.PEACOCK, 6), new Player("Player 3", Suspect.GREEN, 6)];
            expect(() => new GameAlgorithm(duplicatePlayers)).toThrowError("Player suspect used more than once");
        });
        
        it("it should require at least 3 players", () => {
            expect(() => new GameAlgorithm([])).toThrowError("At least 3 players are required to play a game")
        });

        it("it should throw an error when getting the status for a player and card for a player that isn't playing", () => {
            var gameAlgroithm = new GameAlgorithm(defaultPlayers);
            
            let player = new Player("Player 4", Suspect.SCARLET, 6);
            let card = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            expect(() => gameAlgroithm.getStatusForPlayerAndCard(player, card))
                                    .toThrowError("Player not found");
        });

        it("it should throw an error when initializing the game for a detective that isn't playing", () => {
            var gameAlgroithm = new GameAlgorithm(defaultPlayers);
            
            let player = new Player("Player 4", Suspect.SCARLET, 6);
            expect(() => gameAlgroithm.fillOutKnownCards(player, []))
                                      .toThrowError("Player not found");
        });

        it("it should throw an error when the player who guessed isn't playing", () => {
            let gameAlgroithm = new GameAlgorithm(defaultPlayers);

            let guessingplayer = new Player("Player 4", Suspect.SCARLET, 6);
            let guess = new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.HALL, guessingplayer, null, null);
            
            expect(() => gameAlgroithm.applyGuess(guess))
                                      .toThrowError("Guessing player not found");
        });

        it("it should throw an error when the player who showed isn't playing", () => {
            let gameAlgroithm = new GameAlgorithm(defaultPlayers);

            let guessingplayer = new Player("Player 3", Suspect.GREEN, 6);
            let showingPlayer = new Player("Player 5", Suspect.WHITE, 6);
            let shownCard = new Card(CardCategory.ROOM, Room.HALL)
            let guess = new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.HALL, guessingplayer, showingPlayer, shownCard);
            
            expect(() => gameAlgroithm.applyGuess(guess))
                                      .toThrowError("Showing player not found");
        });
    });

    let verifySheetForPlayer = (gameAlgorithm : GameAlgorithm, player : Player, expectedCardsHad : Card[], expectedCardsNotHad : Card[]) => {
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
            expect(gameAlgorithm.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });

        //For all Weapon Cards
        _.forEach(EnumValues.getValues(Weapon), (weaponIndex) => {
            let card = new Card(CardCategory.WEAPON, weaponIndex);
            let expectedCellStatus = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
            let failMessage = `Expected ${Weapon[weaponIndex]} to be in state ${CellStatus[expectedCellStatus]} for ${player.name}`;
            expect(gameAlgorithm.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });

        //For all Room Cards
        _.forEach(EnumValues.getValues(Room), (roomIndex) => {
            let card = new Card(CardCategory.ROOM, roomIndex);
            let expectedCellStatus = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
            let failMessage = `Expected ${Room[roomIndex]} to be in state ${CellStatus[expectedCellStatus]} for ${player.name}`;
            expect(gameAlgorithm.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });
    };

    let allCardsExcept = (cards : Card[]) : Card[] =>
    {
        return GameConstants.ALLCARDS.filter((card) => { return !_.find(cards, card); });
    }

    describe("for a 3 player game", () => {
        let gameAlgorithm : GameAlgorithm;
        let gamePlayers = [
            new Player("Player 1", Suspect.GREEN, 6), new Player("Player 2", Suspect.MUSTARD, 6), new Player("Player 3", Suspect.PLUM, 6),
        ];
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.DINING),
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.REVOLVER),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        beforeEach(() => {
            gameAlgorithm = new GameAlgorithm(gamePlayers);
        });

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameAlgorithm, player, [], []);
            });
        });

        it("filling out known cards for a player should mark them as had and no one else having them", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);                
        });

        it("it should mark a card as had by the shower and not had by everyone else when shown a card", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let roomCard = new Card(CardCategory.ROOM, Room.LOUNGE);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], suspectCard));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [suspectCard], cardsInHand);             
        });

        it("it should mark a card as had by no one when guessing a card you don't have and no one shows", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));                
        });

        //It should mark cards as not had by people who passed up until shower when card shown is not known
        //Start writing tests where guesser wasn't you and therefore the card shown wasn't known
        //Start writing tests around resolving guesses after the fact

        it("it should mark all other cards for a player as not had when their last card is deduced", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let player2Cards = [
                new Card(CardCategory.SUSPECT, Suspect.PLUM), new Card(CardCategory.WEAPON, Weapon.ROPE), new Card(CardCategory.ROOM, Room.LOUNGE),
                new Card(CardCategory.SUSPECT, Suspect.GREEN), new Card(CardCategory.WEAPON, Weapon.CANDLESTICK), new Card(CardCategory.ROOM, Room.CONSERVATORY)
            ];
           
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], player2Cards[0]));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], player2Cards[1]));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], player2Cards[2]));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.CONSERVATORY, gamePlayers[0], gamePlayers[2], player2Cards[3]));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.CONSERVATORY, gamePlayers[0], gamePlayers[2], player2Cards[4]));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.CONSERVATORY, gamePlayers[0], gamePlayers[2], player2Cards[5]));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat(player2Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], player2Cards, allCardsExcept(player2Cards));             
        });
    });

    describe("for a 4 player game", () => {
        let gameAlgorithm : GameAlgorithm;
        let gamePlayers = [ 
            new Player("Player 1", Suspect.GREEN, 4), new Player("Player 2", Suspect.MUSTARD, 4), 
            new Player("Player 3", Suspect.PLUM, 5), new Player("Player 4", Suspect.PEACOCK, 5)
        ]; 
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.KITCHEN),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        beforeEach(() => {
            gameAlgorithm = new GameAlgorithm(gamePlayers);
        });

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameAlgorithm, player, [], []);
            });
        });

        it("filling out known cards for a player should mark them as had and no one else having them", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);           
        });

        it("it should mark a card as had by the shower and not had by everyone else when shown a card", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let roomCard = new Card(CardCategory.ROOM, Room.LOUNGE);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], suspectCard));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [suspectCard], cardsInHand); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([suspectCard]));    
        });

        it("it should mark a card as had by no one when guessing a card you don't have and no one shows", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([rope]));               
        });

        it("it should mark all other cards for a player as not had when their last card is deduced", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let player3Cards = [
                new Card(CardCategory.SUSPECT, Suspect.PLUM), new Card(CardCategory.WEAPON, Weapon.ROPE), new Card(CardCategory.ROOM, Room.LOUNGE),
                new Card(CardCategory.SUSPECT, Suspect.GREEN), new Card(CardCategory.WEAPON, Weapon.CANDLESTICK)
            ];
           
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], player3Cards[0]));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], player3Cards[1]));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], player3Cards[2]));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.LOUNGE, gamePlayers[0], gamePlayers[2], player3Cards[3]));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.LOUNGE, gamePlayers[0], gamePlayers[2], player3Cards[4]));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], player3Cards, allCardsExcept(player3Cards));  
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat(player3Cards));           
        });
    });

    describe("for a 5 player game", () => {
        let gameAlgorithm : GameAlgorithm;
        let gamePlayers = [ 
            new Player("Player 1", Suspect.GREEN, 4), new Player("Player 2", Suspect.MUSTARD, 4), new Player("Player 3", Suspect.PLUM, 4), 
            new Player("Player 4", Suspect.PEACOCK, 3), new Player("Player 5", Suspect.SCARLET, 3) 
        ]; 
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.KNIFE), 
            new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        beforeEach(() => {
            gameAlgorithm = new GameAlgorithm(gamePlayers);
        });

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameAlgorithm, player, [], []);
            });
        });

        it("filling out known cards for a player should mark them as had and no one else having them", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand);        
        });

        it("it should mark a card as had by the shower and not had by everyone else when shown a card", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let roomCard = new Card(CardCategory.ROOM, Room.LOUNGE);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[3], suspectCard));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([suspectCard, weaponCard, roomCard])); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [suspectCard], cardsInHand);  
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat(suspectCard));
        });

        it("it should mark a card as had by no one when guessing a card you don't have and no one shows", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([rope]));      
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([rope]));        
        });

        it("it should mark all other cards for a player as not had when their last card is deduced", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let player4Cards = [
                new Card(CardCategory.SUSPECT, Suspect.PLUM), new Card(CardCategory.WEAPON, Weapon.ROPE), 
                new Card(CardCategory.ROOM, Room.LOUNGE)
            ];
           
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[3], player4Cards[0]));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[3], player4Cards[1]));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[3], player4Cards[2]));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat(player4Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat(player4Cards));  
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], player4Cards, allCardsExcept(player4Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat(player4Cards));           
        });
    });

    describe("for a 6 player game", () => {
        let gameAlgorithm : GameAlgorithm;
        let gamePlayers = [ 
            new Player("Player 1", Suspect.GREEN, 3), new Player("Player 2", Suspect.MUSTARD, 3), new Player("Player 3", Suspect.PLUM, 3), 
            new Player("Player 4", Suspect.PEACOCK, 3), new Player("Player 5", Suspect.SCARLET, 3), new Player("Player 6", Suspect.WHITE, 3) 
        ]; 
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.KNIFE), 
            new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        beforeEach(() => {
            gameAlgorithm = new GameAlgorithm(gamePlayers);
        });

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameAlgorithm, player, [], []);
            });
        });

        it("it should mark a card as had by no one when guessing a card you don't have and no one shows", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand);        
        });

        it("it should mark a card as had by the shower and not had by everyone else when shown a card", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let roomCard = new Card(CardCategory.ROOM, Room.LOUNGE);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[3], suspectCard));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([suspectCard, weaponCard, roomCard])); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [suspectCard], cardsInHand);  
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat(suspectCard));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand.concat(suspectCard));
        });

        it("it should show the rope as had by no one when detective guesses it and no one shows it", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([rope]));      
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand.concat([rope]));       
        });

        it("it should mark all other cards for a player as not had when their last card is deduced", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let player4Cards = [
                new Card(CardCategory.SUSPECT, Suspect.PLUM), new Card(CardCategory.WEAPON, Weapon.ROPE), 
                new Card(CardCategory.ROOM, Room.LOUNGE)
            ];
           
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[3], player4Cards[0]));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[3], player4Cards[1]));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[3], player4Cards[2]));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat(player4Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat(player4Cards));  
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], player4Cards, allCardsExcept(player4Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat(player4Cards)); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand.concat(player4Cards));        
        });
    });
});