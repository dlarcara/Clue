import { Injectable } from "@angular/core";

import { Card, Suspect, Weapon, Room, Player, CardCategory } from '../../game/index';

import * as _ from "lodash";

export class ParsedGuess
{
    suspect: Card
    weapon: Card
    room: Card
    player: Player
}

@Injectable()

export class GuessParser
{
    cardSearchTerms: any

    constructor() 
    {
        this.cardSearchTerms = [];
        this.cardSearchTerms[CardCategory.SUSPECT] = [
            { card: new Card(CardCategory.SUSPECT, Suspect.GREEN), searchTerms: ["green"] },
            { card: new Card(CardCategory.SUSPECT, Suspect.MUSTARD), searchTerms: ["colonel", "mustard"] },
            { card: new Card(CardCategory.SUSPECT, Suspect.WHITE), searchTerms: ["white"] },
            { card: new Card(CardCategory.SUSPECT, Suspect.PLUM), searchTerms: ["professor", "plum"] },
            { card: new Card(CardCategory.SUSPECT, Suspect.SCARLET), searchTerms: ["scarlet"] },
            { card: new Card(CardCategory.SUSPECT, Suspect.PEACOCK), searchTerms: ["peacock"] }
        ];
        this.cardSearchTerms[CardCategory.WEAPON] = [
            { card: new Card(CardCategory.WEAPON, Weapon.CANDLESTICK), searchTerms: ["candlestick", "candle", "stick"] },
            { card: new Card(CardCategory.WEAPON, Weapon.REVOLVER), searchTerms: ["revolver", "gun"] },
            { card: new Card(CardCategory.WEAPON, Weapon.ROPE), searchTerms: ["rope"] },
            { card: new Card(CardCategory.WEAPON, Weapon.WRENCH), searchTerms: ["wrench"] },
            { card: new Card(CardCategory.WEAPON, Weapon.LEADPIPE), searchTerms: ["led", "lead", "pipe", "leadpipe"] },
            { card: new Card(CardCategory.WEAPON, Weapon.KNIFE), searchTerms: ["knife"] }
        ];
        this.cardSearchTerms[CardCategory.ROOM] = [
            { card: new Card(CardCategory.ROOM, Room.BALLROOM), searchTerms: ["ball", "ballroom"] },
            { card: new Card(CardCategory.ROOM, Room.BILLIARD)  , searchTerms: ["billiard", "pool"] },
            { card: new Card(CardCategory.ROOM, Room.CONSERVATORY), searchTerms: ["conservatory"] },
            { card: new Card(CardCategory.ROOM, Room.DINING), searchTerms: ["dining"] },
            { card: new Card(CardCategory.ROOM, Room.HALL), searchTerms: ["hall"] },
            { card: new Card(CardCategory.ROOM, Room.KITCHEN), searchTerms: ["kitchen"] },
            { card: new Card(CardCategory.ROOM, Room.LIBRARY), searchTerms: ["library"] },
            { card: new Card(CardCategory.ROOM, Room.LOUNGE), searchTerms: ["lounge"] },
            { card: new Card(CardCategory.ROOM, Room.STUDY), searchTerms: ["study"] }
        ];
    }

    parse(guesses : string[], players : Player[]) : ParsedGuess
    {
        let parsedGuess = new ParsedGuess();
        
        _.forEach(guesses, (guess) => {
            let guessTerms = guess.split(" ").map((g) => _.trim(g).toLowerCase()).filter((g) => g.length);

            if (!parsedGuess.suspect)
                parsedGuess.suspect = this.findCardMatch(guessTerms, CardCategory.SUSPECT);

            if (!parsedGuess.weapon)
                parsedGuess.weapon = this.findCardMatch(guessTerms, CardCategory.WEAPON);

            if (!parsedGuess.room)
                parsedGuess.room = this.findCardMatch(guessTerms, CardCategory.ROOM);

            if (!parsedGuess.player)
                parsedGuess.player = this.findPlayerMatch(guessTerms, players);
        });

        return parsedGuess;
    }   

    private findCardMatch(guessTerms : string[], cardCategory : CardCategory) : Card
    {
        let matchedCard : Card;
        _.forEach(this.cardSearchTerms[cardCategory], (cardSearch) => {
            if (_.intersectionWith(guessTerms, cardSearch.searchTerms, _.isEqual).length)
                matchedCard = cardSearch.card;
        });

        return matchedCard;
    }

    private findPlayerMatch(guessTerms : string[], players : Player[]) : Player
    {
        let matchedPlayer : Player;
        _.forEach(players, (player) => {
            if (_.indexOf(guessTerms, player.name.toLowerCase()) != -1)
                matchedPlayer = player;
        });

        return matchedPlayer;
    }
}