import { GameAlgorithm, Player, CardCategory, Card, Weapon, Suspect, Room, CellStatus, Guess, GameConstants } from './index';

import { EnumValues } from 'enum-values';

import * as _ from 'lodash';

//All cards constructed to use throughout testing
let green = new Card(CardCategory.SUSPECT, Suspect.GREEN);
let mustard = new Card(CardCategory.SUSPECT, Suspect.MUSTARD);
let peacock = new Card(CardCategory.SUSPECT, Suspect.PEACOCK);
let plum = new Card(CardCategory.SUSPECT, Suspect.PLUM);
let scarlet = new Card(CardCategory.SUSPECT, Suspect.SCARLET);
let white = new Card(CardCategory.SUSPECT, Suspect.WHITE);
    
let candlestick = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
let knife = new Card(CardCategory.WEAPON, Weapon.KNIFE);
let leadpipe = new Card(CardCategory.WEAPON, Weapon.LEADPIPE);
let revolver = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
let rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
let wrench = new Card(CardCategory.WEAPON, Weapon.WRENCH);
    
let ballroom = new Card(CardCategory.ROOM, Room.BALLROOM);
let billiardRoom = new Card(CardCategory.ROOM, Room.BILLIARD);
let conservatory = new Card(CardCategory.ROOM, Room.CONSERVATORY);
let diningRoom = new Card(CardCategory.ROOM, Room.DINING);
let hall = new Card(CardCategory.ROOM, Room.HALL);
let kitchen = new Card(CardCategory.ROOM, Room.KITCHEN);
let library = new Card(CardCategory.ROOM, Room.LIBRARY);
let lounge = new Card(CardCategory.ROOM, Room.LOUNGE);
let study = new Card(CardCategory.ROOM, Room.STUDY);

describe("When interacting with the game algorithm", () => {
    describe("and exercising error condtions", () => {
        let defaultPlayers = [ new Player("Player 1", Suspect.PEACOCK, 6, true), new Player("Player 2", Suspect.PLUM, 6, false), new Player("Player 3", Suspect.GREEN, 6, false)];
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.DINING),
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.REVOLVER),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        it("it should make sure a suspect isn't playing twice", () => {
            let duplicatePlayers = [ new Player("Player 1", Suspect.PEACOCK, 6, true), new Player("Player 2", Suspect.PEACOCK, 6, false), new Player("Player 3", Suspect.GREEN, 6, false)];
            expect(() => new GameAlgorithm(duplicatePlayers, cardsInHand)).toThrowError("Player suspect used more than once");
        });
        
        it("it should require at least 3 players", () => {
            expect(() => new GameAlgorithm([], cardsInHand)).toThrowError("At least 3 players are required to play a game")
        });

        it("it should throw an error when getting the status for a player and card for a player that isn't playing", () => {
            var gameAlgroithm = new GameAlgorithm(defaultPlayers, cardsInHand);
            
            let player = new Player("Player 4", Suspect.SCARLET, 6, true);
            let card = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            expect(() => gameAlgroithm.gameSheet.getStatusForPlayerAndCard(player, card))
                                    .toThrowError("Player not found");
        });

        it("it should throw an error when the player who guessed isn't playing", () => {
            let gameAlgroithm = new GameAlgorithm(defaultPlayers, cardsInHand);

            let guessingplayer = new Player("Player 4", Suspect.SCARLET, 6, true);
            let guess = new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.HALL, guessingplayer, null, null);
            
            expect(() => gameAlgroithm.applyGuess(guess))
                                      .toThrowError("Guessing player not found");
        });

        it("it should throw an error when the player who showed isn't playing", () => {
            let gameAlgroithm = new GameAlgorithm(defaultPlayers, cardsInHand);

            let guessingplayer = new Player("Player 3", Suspect.GREEN, 6, false);
            let showingPlayer = new Player("Player 5", Suspect.WHITE, 6, false);
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
        _.forEach(EnumValues.getValues(Suspect), (suspectIndex : number) => {
            let card = new Card(CardCategory.SUSPECT, suspectIndex);
            let expectedCellStatus = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
            let failMessage = `Expected ${Suspect[suspectIndex]} to be in state ${CellStatus[expectedCellStatus]} for ${player.name}`;
            expect(gameAlgorithm.gameSheet.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });

        //For all Weapon Cards
        _.forEach(EnumValues.getValues(Weapon), (weaponIndex : number) => {
            let card = new Card(CardCategory.WEAPON, weaponIndex);
            let expectedCellStatus = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
            let failMessage = `Expected ${Weapon[weaponIndex]} to be in state ${CellStatus[expectedCellStatus]} for ${player.name}`;
            expect(gameAlgorithm.gameSheet.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });

        //For all Room Cards
        _.forEach(EnumValues.getValues(Room), (roomIndex : number) => {
            let card = new Card(CardCategory.ROOM, roomIndex);
            let expectedCellStatus = expectedCardStatus(card, expectedCardsHad, expectedCardsNotHad);
            let failMessage = `Expected ${Room[roomIndex]} to be in state ${CellStatus[expectedCellStatus]} for ${player.name}`;
            expect(gameAlgorithm.gameSheet.getStatusForPlayerAndCard(player, card)).toBe(expectedCellStatus, failMessage);
        });
    };

    let allCardsExcept = (cards : Card[]) : Card[] =>
    {
        return GameConstants.getAllCardsExcept(cards);
    }

    describe("for a 3 player game", () => {
        let gameAlgorithm : GameAlgorithm;
        let gamePlayers : Player[];

        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.DINING),
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.REVOLVER),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        let initializeAlgorithm = (detectiveIndex) =>
        {
            gamePlayers = [
                new Player("Player 1", Suspect.GREEN, 6, detectiveIndex == 0), 
                new Player("Player 2", Suspect.MUSTARD, 6, detectiveIndex == 1), 
                new Player("Player 3", Suspect.PLUM, 6, detectiveIndex == 2),
            ];
            gameAlgorithm = new GameAlgorithm(gamePlayers, cardsInHand);
        }

        it("it should show all cards as not had for new game sheet", () => {
            _.forEach(gamePlayers, (player) => {
                verifySheetForPlayer(gameAlgorithm, player, [], []);
            });
        });

        it("it should fill out the detecitves cards when starting a game", () => {
            initializeAlgorithm(0);

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);                
        });

        it("it should mark a card as had by the shower and not had by everyone else when shown a card", () => {
            initializeAlgorithm(0);

            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let roomCard = new Card(CardCategory.ROOM, Room.LOUNGE);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], suspectCard));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([suspectCard, weaponCard, roomCard]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [suspectCard], cardsInHand);             
        });

        it("it should mark a card as had by no one when bluffing on everything but the room", () => {
            initializeAlgorithm(0);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));                
        });

        it("it should mark cards as not had by people who passed up until shower when card shown is not known", () => {
            initializeAlgorithm(0);
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
        });

        it("it should resolve guess immediately if enough information is known", () => {
            initializeAlgorithm(0);
            
            let hall = new Card(CardCategory.ROOM, Room.HALL);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.KNIFE, Room.HALL, gamePlayers[1], gamePlayers[2], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([hall]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [hall], cardsInHand);
        });

        it("it should resolve guess if later one of the guessed cards is known to not be had by the shower, and another is later known to be had by someone else ", () => {
            initializeAlgorithm(0);
            
            let white = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let peacock = new Card(CardCategory.SUSPECT, Suspect.PEACOCK);
            let rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let hall = new Card(CardCategory.ROOM, Room.HALL);
            
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.HALL, gamePlayers[0], gamePlayers[1], white));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.KNIFE, Room.HALL, gamePlayers[1], gamePlayers[0], peacock));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [white], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [rope], cardsInHand.concat([white, hall]));
        });

        it("it should resolve guess a couple guesses later when enough information is known", () => {
            initializeAlgorithm(0);
            
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
            initializeAlgorithm(0);
            
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.WRENCH, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.WRENCH, Room.HALL, gamePlayers[0], gamePlayers[2], new Card(CardCategory.SUSPECT, Suspect.WHITE)));

            expect(gameAlgorithm.turns[1].guess.resolvedTurn).toBe(2);
        });

        it("it should mark a a card as had in a category if the verdict in the category is already known and the player is the only one left who might have that card", () => {
            initializeAlgorithm(0);

            let suspectVerdict = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let weaponVerdict = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let roomVerdict = new Card(CardCategory.ROOM, Room.LOUNGE);
            let suspectCard = new Card(CardCategory.SUSPECT, Suspect.SCARLET);
            let weaponCard = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let roomCard = new Card(CardCategory.ROOM, Room.CONSERVATORY);
            gameAlgorithm.applyGuess(new Guess(+suspectVerdict.cardIndex, +weaponVerdict.cardIndex, +roomVerdict.cardIndex, gamePlayers[0], null, null));
            gameAlgorithm.applyGuess(new Guess(+suspectCard.cardIndex, +weaponCard.cardIndex, +roomCard.cardIndex, gamePlayers[1], null, null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [suspectCard, weaponCard, roomCard], cardsInHand.concat(suspectVerdict, weaponVerdict, roomVerdict));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([suspectCard, weaponCard, roomCard, suspectVerdict, weaponVerdict, roomVerdict]));             
        });

        it("it should resolve guess based on another resolved guess", () => {
            initializeAlgorithm(1);

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
            initializeAlgorithm(0);
            
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

        //Test if only one card left in category left unknown it must be the verdict, no one has that card

        //Test resolving verdict cascades to resolve guess

        //Test resolving guess cascades to resolving verdict

        it("it should mark remaining cards as known for a player if all their other cards are marked as not had", () => {
            initializeAlgorithm(0);

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
            initializeAlgorithm(0);

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
        let gamePlayers : Player[];

        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.KITCHEN),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        let initializeAlgorithm = (detectiveIndex) =>
        {
            gamePlayers =  [ 
                new Player("Player 1", Suspect.GREEN, 4, detectiveIndex == 0), new Player("Player 2", Suspect.MUSTARD, 4, detectiveIndex == 1), 
                new Player("Player 3", Suspect.PLUM, 5, detectiveIndex == 2), new Player("Player 4", Suspect.PEACOCK, 5, detectiveIndex == 3)
            ]; 
            gameAlgorithm = new GameAlgorithm(gamePlayers, cardsInHand);
        }

        it("it should fill out all of the detectives cards", () => {
            initializeAlgorithm(0);

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);           
        });

        it("it should mark a card as had by the shower and not had by everyone else when shown a card", () => {
            initializeAlgorithm(0);

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
            initializeAlgorithm(0);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([rope]));               
        });

        it("it should mark cards as not had by people who passed up until shower when card shown is not known", () => {
            initializeAlgorithm(0);

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
            initializeAlgorithm(1);

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
            initializeAlgorithm(0);

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

        it("it should apply inter-related turn rules if the number of unqiue cards for different shows equals the number of shows involved", () => {
            initializeAlgorithm(0);

            let candlestick = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let hall = new Card(CardCategory.ROOM, Room.HALL);      

            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.CANDLESTICK, Room.HALL, gamePlayers[2], gamePlayers[3], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([candlestick, hall]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
        });

        it("it should not apply inter-related turn rules for unresolved turns by the same player", () => {
            initializeAlgorithm(0);
  
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.REVOLVER, Room.CONSERVATORY, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.REVOLVER, Room.CONSERVATORY, gamePlayers[2], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.REVOLVER, Room.KITCHEN, gamePlayers[2], gamePlayers[3], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
        });
    });

    describe("for a 5 player game", () => {
        let gameAlgorithm : GameAlgorithm;
        let gamePlayers : Player[];
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.KITCHEN),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        let initializeAlgorithm = (detectiveIndex) =>
        {
            gamePlayers =  [ 
                new Player("Player 1", Suspect.GREEN, 4, detectiveIndex == 0), new Player("Player 2", Suspect.MUSTARD, 4, detectiveIndex == 1), 
                new Player("Player 3", Suspect.PLUM, 4, detectiveIndex == 2), new Player("Player 4", Suspect.PEACOCK, 3, detectiveIndex == 3), 
                new Player("Player 5", Suspect.SCARLET, 3, detectiveIndex == 4) 
            ]; 
            gameAlgorithm = new GameAlgorithm(gamePlayers, cardsInHand);
        }

        it("it should fill out the detectives cards", () => {
            initializeAlgorithm(0);
            
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand);        
        });

        it("it should mark a card as had by the shower and not had by everyone else when shown a card", () => {
            initializeAlgorithm(0);

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
            initializeAlgorithm(0);
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.ROPE, Room.KITCHEN, gamePlayers[0], null, null));

            var rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat([rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([rope]));      
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([rope]));        
        });

        it("it should mark cards as not had by people who passed up until shower when card shown is not known", () => {
            initializeAlgorithm(0);

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
            initializeAlgorithm(1);

            var player3Cards = [
                new Card(CardCategory.SUSPECT, Suspect.MUSTARD), new Card(CardCategory.ROOM, Room.DINING),
                new Card(CardCategory.WEAPON, Weapon.WRENCH), new Card(CardCategory.ROOM, Room.STUDY)
            ];
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.REVOLVER, Room.BILLIARD, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.CONSERVATORY, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.LEADPIPE, Room.HALL, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.ROPE, Room.LIBRARY, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.REVOLVER, Room.LOUNGE, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.REVOLVER, Room.LOUNGE, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.REVOLVER, Room.HALL, gamePlayers[1], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.REVOLVER, Room.LIBRARY, gamePlayers[1], gamePlayers[3], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], [], cardsInHand.concat(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], player3Cards, allCardsExcept(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat(player3Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat(player3Cards));
        });

        it("it should mark all other cards for a player as not had when their last card is deduced", () => {
            initializeAlgorithm(0);

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
        let gamePlayers : Player[];
        
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.KNIFE), 
            new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        let initializeAlgorithm = (detectiveIndex) =>
        {
            gamePlayers =  [ 
                new Player("Player 1", Suspect.GREEN, 3, detectiveIndex == 0), new Player("Player 2", Suspect.MUSTARD, 3, detectiveIndex == 1), 
                new Player("Player 3", Suspect.PLUM, 3, detectiveIndex == 2), new Player("Player 4", Suspect.PEACOCK, 3, detectiveIndex == 3), 
                new Player("Player 5", Suspect.SCARLET, 3, detectiveIndex == 4), new Player("Player 6", Suspect.WHITE, 3, detectiveIndex == 5) 
            ]; 
            gameAlgorithm = new GameAlgorithm(gamePlayers, cardsInHand);
        }

        it("it should fill out the detectives cards", () => {
            initializeAlgorithm(0);
            
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand);        
        });

        it("it should mark a card as had by the shower and not had by everyone else when shown a card", () => {
            initializeAlgorithm(0);

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
            initializeAlgorithm(0);
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
            initializeAlgorithm(0);

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

        it("it should mark remaining cards as known for a player if all their other cards are marked as not had", () => {
            initializeAlgorithm(5);

            var player1Cards = [
                new Card(CardCategory.SUSPECT, Suspect.MUSTARD), new Card(CardCategory.ROOM, Room.DINING),
                new Card(CardCategory.WEAPON, Weapon.WRENCH)
            ];
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.CANDLESTICK, Room.BALLROOM, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.LEADPIPE, Room.BILLIARD, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.REVOLVER, Room.CONSERVATORY, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.HALL, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.LEADPIPE, Room.LIBRARY, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.LEADPIPE, Room.LOUNGE, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.LEADPIPE, Room.STUDY, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.LEADPIPE, Room.STUDY, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.LEADPIPE, Room.LOUNGE, gamePlayers[5], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.LEADPIPE, Room.BALLROOM, gamePlayers[5], gamePlayers[1], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], player1Cards, allCardsExcept(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand.concat(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat(player1Cards));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], cardsInHand, allCardsExcept(cardsInHand));
        });

        it("it should mark all other cards for a player as not had when their last card is deduced", () => {
            initializeAlgorithm(0);

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

        it("it should mark all currently unknown cards as had by player if only one card is left unknown and they showed another card", () => {
            initializeAlgorithm(0);

            let white = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let lounge = new Card(CardCategory.ROOM, Room.LOUNGE);
          
            let plum = new Card(CardCategory.SUSPECT, Suspect.PLUM);
            let candleStick = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let hall = new Card(CardCategory.ROOM, Room.HALL);

            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], white));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], rope));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([white, rope, lounge]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [white, rope], allCardsExcept([white, rope, plum, candleStick, hall])); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([white, rope]));  
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([white, rope]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand.concat([white, rope]));
        });

        it("it should not mark all currently unknown cards as had by player if two cards are left unknown for player and there are 2 unresolved guesses, but the guesses share a card in common", () => {
            initializeAlgorithm(0);

            let white = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let lounge = new Card(CardCategory.ROOM, Room.LOUNGE);

            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], white));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.REVOLVER, Room.LIBRARY, gamePlayers[1], gamePlayers[2], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([white, rope, lounge]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [white], cardsInHand); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([white]));  
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([white]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand.concat([white]));
        });

        it("it should mark all currently unknown cards as had by player if only two cards are left unknown for player and there are 2 unresolved guesses, and the guesses don't share a common card", () => {
            initializeAlgorithm(0);

            let white = new Card(CardCategory.SUSPECT, Suspect.WHITE);
            let rope = new Card(CardCategory.WEAPON, Weapon.ROPE);
            let lounge = new Card(CardCategory.ROOM, Room.LOUNGE);
          
            let green = new Card(CardCategory.SUSPECT, Suspect.GREEN);
            let candleStick = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let hall = new Card(CardCategory.ROOM, Room.HALL);

            let scarlet = new Card(CardCategory.SUSPECT, Suspect.SCARLET);
            let revolver = new Card(CardCategory.WEAPON, Weapon.REVOLVER);
            let ballroom = new Card(CardCategory.ROOM, Room.BALLROOM);

            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], gamePlayers[2], white));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.REVOLVER, Room.BALLROOM, gamePlayers[1], gamePlayers[2], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([white, rope, lounge]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [white], allCardsExcept([green, candleStick, hall, scarlet, revolver, ballroom])); 
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([white]));  
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([white]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand.concat([white]));
        });

        it("it should apply inter-related turn rules if the number of unqiue cards for different shows equals the number of shows involved", () => {
            initializeAlgorithm(0);

            let candlestick = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let hall = new Card(CardCategory.ROOM, Room.HALL);
            let plum = new Card(CardCategory.SUSPECT, Suspect.PLUM);
            let library = new Card(CardCategory.ROOM, Room.LIBRARY); 

            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.CANDLESTICK, Room.LIBRARY, gamePlayers[2], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.CANDLESTICK, Room.LIBRARY, gamePlayers[3], gamePlayers[4], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.KNIFE, Room.LIBRARY, gamePlayers[4], gamePlayers[5], null));

            //Player 3 doesn't have plum, conervatory, library because guess 2,3,4 must be shared, which means player 3 has the hall
            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([candlestick, hall, plum, library]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [hall], cardsInHand.concat([candlestick, plum, library]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand.concat([hall]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand.concat([hall]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand.concat([hall]));
        });

        it("it should apply inter-related turn rules if the number of unqiue cards for different shows equals the number of shows involved, even for the same player", () => {
            initializeAlgorithm(0);
            
            let candlestick = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let hall = new Card(CardCategory.ROOM, Room.HALL);
            let plum = new Card(CardCategory.SUSPECT, Suspect.PLUM);
            let library = new Card(CardCategory.ROOM, Room.LIBRARY); 

            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.CANDLESTICK, Room.LIBRARY, gamePlayers[2], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.CANDLESTICK, Room.LIBRARY, gamePlayers[3], gamePlayers[4], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.KNIFE, Room.HALL, gamePlayers[3], gamePlayers[4], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand.concat([candlestick, hall, plum, library]));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand.concat([candlestick, hall, plum, library]));
        });

        it("it should not apply inter-related turn rules for unresolved turns by the same player", () => {
            initializeAlgorithm(0);
            
            let candlestick = new Card(CardCategory.WEAPON, Weapon.CANDLESTICK);
            let hall = new Card(CardCategory.ROOM, Room.HALL);
            let plum = new Card(CardCategory.SUSPECT, Suspect.PLUM);
            let library = new Card(CardCategory.ROOM, Room.LIBRARY); 

            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.CANDLESTICK, Room.HALL, gamePlayers[1], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.CANDLESTICK, Room.LIBRARY, gamePlayers[2], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.CANDLESTICK, Room.LIBRARY, gamePlayers[3], gamePlayers[4], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.KNIFE, Room.CONSERVATORY, gamePlayers[3], gamePlayers[4], null));

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], cardsInHand, allCardsExcept(cardsInHand));
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [], cardsInHand);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [], cardsInHand);
        });
    });

    describe("for real life games", () => {
        it("the board should look as follows", () => {
            let cardsInHand = [ 
                new Card(CardCategory.SUSPECT, Suspect.PLUM), new Card(CardCategory.ROOM, Room.KITCHEN), 
                new Card(CardCategory.ROOM, Room.LOUNGE)
            ];
            let gamePlayers =  [ 
                new Player("Player 1", Suspect.GREEN, 3, true), new Player("Player 2", Suspect.PEACOCK, 3, false), 
                new Player("Player 3", Suspect.PLUM, 3, false), new Player("Player 4", Suspect.MUSTARD, 3, false), 
                new Player("Player 5", Suspect.WHITE, 3, false), new Player("Player 6", Suspect.SCARLET, 3, false) 
            ]; 
            let gameAlgorithm = new GameAlgorithm(gamePlayers, cardsInHand);
            
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.BALLROOM, gamePlayers[0], gamePlayers[4], new Card(CardCategory.ROOM, Room.BALLROOM)));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.KNIFE, Room.LIBRARY, gamePlayers[1], gamePlayers[5], null));
            gameAlgorithm.enterPass(gamePlayers[2]);
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.WRENCH, Room.LOUNGE, gamePlayers[3], gamePlayers[0], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.MUSTARD, Weapon.ROPE, Room.BALLROOM, gamePlayers[4], gamePlayers[1], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.LEADPIPE, Room.LOUNGE, gamePlayers[5], gamePlayers[0], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.LEADPIPE, Room.CONSERVATORY, gamePlayers[0], gamePlayers[2], new Card(CardCategory.WEAPON, Weapon.LEADPIPE)));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.ROPE, Room.BALLROOM, gamePlayers[1], gamePlayers[4], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.REVOLVER, Room.BALLROOM, gamePlayers[2], gamePlayers[3], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.REVOLVER, Room.BALLROOM, gamePlayers[3], gamePlayers[4], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.REVOLVER, Room.KITCHEN, gamePlayers[4], gamePlayers[5], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.MUSTARD, Weapon.LEADPIPE, Room.BALLROOM, gamePlayers[5], gamePlayers[2], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.REVOLVER, Room.BILLIARD, gamePlayers[0], gamePlayers[4], new Card(CardCategory.ROOM, Room.BILLIARD)));
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.REVOLVER, Room.CONSERVATORY, gamePlayers[1], gamePlayers[5], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.PLUM, Weapon.KNIFE, Room.KITCHEN, gamePlayers[2], gamePlayers[5], null));
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.KNIFE, Room.DINING, gamePlayers[3], gamePlayers[4], null)); 
            gameAlgorithm.applyGuess(new Guess(Suspect.SCARLET, Weapon.WRENCH, Room.STUDY, gamePlayers[4], gamePlayers[1], null)); 
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.CANDLESTICK, Room.LIBRARY, gamePlayers[5], gamePlayers[1], null)); 

            verifySheetForPlayer(gameAlgorithm, gamePlayers[0], [plum, lounge, kitchen], [green, mustard, peacock, scarlet, white, candlestick, knife, leadpipe, revolver, rope, wrench, ballroom, billiardRoom, conservatory, diningRoom, hall, library, study ]);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[1], [library, rope], [green, mustard, peacock, plum, white, candlestick, knife, leadpipe, revolver, ballroom, billiardRoom, conservatory, diningRoom, hall, kitchen, lounge]);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[2], [leadpipe], [green, peacock, plum, white, candlestick, knife, revolver, rope, ballroom, billiardRoom, conservatory, diningRoom, kitchen, library, lounge]);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[3], [white], [green, peacock, plum, candlestick, knife, leadpipe, revolver, rope, ballroom, billiardRoom, conservatory, diningRoom, kitchen, library, lounge]);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[4], [ballroom, billiardRoom, diningRoom], [green, mustard, peacock, plum, scarlet, white, candlestick, knife, leadpipe, revolver, rope, wrench, conservatory, hall, kitchen, library, lounge, study]);
            verifySheetForPlayer(gameAlgorithm, gamePlayers[5], [revolver, knife], [mustard, plum, scarlet, white, leadpipe, rope, wrench, ballroom, billiardRoom, diningRoom, kitchen, library, lounge, study]);
        });
    });

    describe("When making a guess that proves to be invalid", () => {
        let gamePlayers = [
            new Player("Player 1", Suspect.GREEN, 6, true), new Player("Player 2", Suspect.MUSTARD, 6, false), new Player("Player 3", Suspect.PLUM, 6, false),
        ];
        let cardsInHand = [ 
            new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.DINING),
            new Card(CardCategory.ROOM, Room.KITCHEN), new Card(CardCategory.WEAPON, Weapon.REVOLVER),
            new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.SUSPECT, Suspect.PEACOCK)
        ];

        it("it should throw an error when an improper guess is entered", () => {
            let gameAlgorithm = new GameAlgorithm(gamePlayers, cardsInHand);

            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.ROPE, Room.HALL, gamePlayers[1], gamePlayers[2], null));

            expect(() => {
                gameAlgorithm.applyGuess(new Guess(Suspect.PEACOCK, Weapon.KNIFE, Room.KITCHEN, gamePlayers[1], gamePlayers[2], null));
            }).toThrowError("Player 3 does not have any of the cards being guessed");
        });

        it("it should reset the game sheet and turns when an error occurs when making a guess and throw proper error", () => {
            let gameAlgorithm = new GameAlgorithm(gamePlayers, cardsInHand);
  
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.ROPE, Room.HALL, gamePlayers[0], gamePlayers[2], new Card(CardCategory.SUSPECT, Suspect.GREEN)));
            
            let previousSheet = _.cloneDeep(gameAlgorithm.gameSheet.data);
            let previousTurns = _.cloneDeep(gameAlgorithm.turns);   
            expect(() => {
                gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.LEADPIPE, Room.DINING, gamePlayers[0], null, null));
            }).toThrowError("Mr. Green is already marked as had by Player 3, can't mark it as not had");

            expect(gameAlgorithm.gameSheet.data).toEqual(previousSheet);
            expect(gameAlgorithm.turns).toEqual(previousTurns);
        });

        it("it should reset the game sheet and turns when an error occurs when making a guess and throw proper error", () => {
            let gameAlgorithm = new GameAlgorithm(gamePlayers, cardsInHand);
  
            gameAlgorithm.applyGuess(new Guess(Suspect.GREEN, Weapon.ROPE, Room.HALL, gamePlayers[0], gamePlayers[2], new Card(CardCategory.WEAPON, Weapon.ROPE)));
            
            let previousSheet = _.cloneDeep(gameAlgorithm.gameSheet.data);
            let previousTurns = _.cloneDeep(gameAlgorithm.turns);   
            expect(() => {
                gameAlgorithm.applyGuess(new Guess(Suspect.WHITE, Weapon.ROPE, Room.LOUNGE, gamePlayers[0], null, null));
            }).toThrowError("The rope is already marked as had by Player 3, can't mark it as not had");

            expect(gameAlgorithm.gameSheet.data).toEqual(previousSheet);
            expect(gameAlgorithm.turns).toEqual(previousTurns);
        });
    });
});