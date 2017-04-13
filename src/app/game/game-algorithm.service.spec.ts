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

        it("it should mark a card as had by no one when bluffing on everything but the room", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));                
        });

        it("it should mark cards as not had by people who passed up until shower when card shown is not known", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
        });

        it("it should resolve guess immediately if enough information is known", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            
            let hall = new Card(CardCategory.ROOM, Room.HALL);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.KNIFE, Room.HALL, gamePlayers[1], gamePlayers[2], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([hall]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [hall], cardsInHand);
        });

        it("it should resolve guess a couple guesses later when enough information is known", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            
            let white = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let hall = new Card(CardCategory.ROOM, Room.HALL);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.HALL, gamePlayers[0], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.HALL, gamePlayers[1], gamePlayers[2], rope));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.HALL, gamePlayers[1], gamePlayers[2], hall));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [white], cardsInHand.concat([rope, hall]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [rope, hall], cardsInHand.concat([white]));
        });

        it("it should resolve a guess if any of the guessed cards are later identified", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            
            let hall = new Card(CardCategory.ROOM, Room.HALL);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.WRENCH, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.WRENCH, Room.HALL, gamePlayers[0], gamePlayers[2], new Card(CardCategory.SUSPECT, Suspect.WHITE)));

            expect(gameAlgorithm.getUnresolvedGuesses().length).toBe(0);
        });

        it("it should resolve guess based on another resolved guess", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[1], cardsInHand);
            
            let white = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let candleStick = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let hall = new Card(CardCategory.ROOM, Room.HALL);
     
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.HALL, gamePlayers[2], gamePlayers[0], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.HALL, gamePlayers[0], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.BALLROOM, gamePlayers[1], gamePlayers[0], white));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.BALLROOM, gamePlayers[1], gamePlayers[0], candleStick));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], [candleStick, white, rope], cardsInHand.concat([hall]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [hall], cardsInHand.concat([candleStick, white, rope]));
        });

        it("it should mark all players as not having a card if every other card in that category is marked as had", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            
            let green = new Card(CardCategory.SUSPECT, Suspect.GREEN);
            let mustard = new Card(CardCategory.SUSPECT, Suspect.MUSTARD);
            let plum = new Card(CardCategory.SUSPECT, Suspect.PLUM);
            let scarlet = new Card(CardCategory.SUSPECT, Suspect.SCARLET);
            let white = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.WRENCH, Room.HALL, gamePlayers[0], gamePlayers[1], green));
            gameAlgorithm.applyGuess(new Guess(Suspect.MUSTARD, Weapon.WRENCH, Room.HALL, gamePlayers[0], gamePlayers[1], mustard));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.WRENCH, Room.HALL, gamePlayers[0], gamePlayers[1], plum));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.WRENCH, Room.HALL, gamePlayers[0], gamePlayers[1], scarlet));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [green, mustard, plum, scarlet], cardsInHand.concat([white]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([green, mustard, plum, scarlet, white]));
        });

        //Test if only one card left in category left unknown it must be the verdict

        it("it should mark remaining cards as known for a player if all their other cards are marked as not had", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            var player2Cards = [
                new Card(CardCategory.SUSPECT, Suspect.MUSTARD), new Card(CardCategory.SUSPECT, Suspect.WHITE),
                new Card(CardCategory.WEAPON, Weapon.WRENCH), new Card(CardCategory.ROOM, Room.LIBRARY),
                new Card(CardCategory.ROOM, Room.STUDY), new Card(CardCategory.ROOM, Room.LOUNGE)
            ]
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.BILLIARD, gamePlayers[0], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.HALL, gamePlayers[0], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.LEADPIPE, Room.CONSERVATORY, gamePlayers[0], gamePlayers[2], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], player2Cards, allCardsExcept(player2Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat(player2Cards));
        });

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

        it("it should mark a card as had by no one when bluffing on everything but the weapon", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([rope]));               
        });

        it("it should mark cards as not had by people who passed up until shower when card shown is not known", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let roomCard = new Card(CardCategory.ROOM, Room.HALL);       
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[3], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
        });

        it("it should mark remaining cards as known for a player if all their other cards are marked as not had", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[1], cardsInHand);

            var player3Cards = [
                new Card(CardCategory.SUSPECT, Suspect.MUSTARD), new Card(CardCategory.ROOM, Room.DINING),
                new Card(CardCategory.WEAPON, Weapon.WRENCH), new Card(CardCategory.ROOM, Room.LIBRARY),
                new Card(CardCategory.ROOM, Room.STUDY)
            ]
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.BILLIARD, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.REVOLVER, Room.CONSERVATORY, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.LEADPIPE, Room.LOUNGE, gamePlayers[1], gamePlayers[3], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], [], cardsInHand.concat(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], player3Cards, allCardsExcept(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat(player3Cards));
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

        it("it should mark a card as had by no one when bluffing on everything but the weapon", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([rope]));      
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([rope]));        
        });

        it("it should mark cards as not had by people who passed up until shower when card shown is not known", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let roomCard = new Card(CardCategory.ROOM, Room.HALL);       
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[3], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand);
        });

        it("it should mark remaining cards as known for a player if all their other cards are marked as not had", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[1], cardsInHand);

            var player3Cards = [
                new Card(CardCategory.SUSPECT, Suspect.MUSTARD), new Card(CardCategory.ROOM, Room.DINING),
                new Card(CardCategory.WEAPON, Weapon.WRENCH), new Card(CardCategory.ROOM, Room.STUDY)
            ];
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.REVOLVER, Room.BILLIARD, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.CONSERVATORY, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.LEADPIPE, Room.HALL, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.ROPE, Room.LIBRARY, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.REVOLVER, Room.LOUNGE, gamePlayers[1], gamePlayers[3], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], [], cardsInHand.concat(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], player3Cards, allCardsExcept(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat(player3Cards));
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

        it("filling out known cards for a player should mark them as had and no one else having them", () => {
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

        it("it should mark cards as not had by people who passed up until shower when card shown is not known", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[0], cardsInHand);

            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let roomCard = new Card(CardCategory.ROOM, Room.HALL);       
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[5], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand);
        });

        // let cardsInHand = [ 
        //     new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.KNIFE), 
        //     new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        // ];
        it("it should mark remaining cards as known for a player if all their other cards are marked as not had", () => {
            gameAlgorithm.fillOutKnownCards(gamePlayers[5], cardsInHand);

            var player1Cards = [
                new Card(CardCategory.SUSPECT, Suspect.MUSTARD), new Card(CardCategory.ROOM, Room.DINING),
                new Card(CardCategory.WEAPON, Weapon.WRENCH)
            ];
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.CANDLESTICK, Room.BALLROOM, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.LEADPIPE, Room.BILLIARD, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.REVOLVER, Room.CONSERVATORY, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.ROPE, Room.HALL, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.CANDLESTICK, Room.LIBRARY, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.LEADPIPE, Room.LOUNGE, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.LEADPIPE, Room.STUDY, gamePlayers[5], gamePlayers[1], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], player1Cards, allCardsExcept(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], cardsInHand, allCardsExcept(cardsInHand));
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