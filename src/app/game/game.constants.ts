import { CardCategory, Card, Suspect, Weapon, Room } from "./index";

import * as _ from 'lodash';

export class GameConstants
{
    static ALLCARDS : Card[] = [
        new Card(CardCategory.SUSPECT, Suspect.GREEN), new Card(CardCategory.SUSPECT, Suspect.MUSTARD), new Card(CardCategory.SUSPECT, Suspect.PEACOCK),
        new Card(CardCategory.SUSPECT, Suspect.PLUM), new Card(CardCategory.SUSPECT, Suspect.SCARLET), new Card(CardCategory.SUSPECT, Suspect.WHITE),
        new Card(CardCategory.WEAPON, Weapon.CANDLESTICK), new Card(CardCategory.WEAPON, Weapon.KNIFE), new Card(CardCategory.WEAPON, Weapon.LEADPIPE),
        new Card(CardCategory.WEAPON, Weapon.REVOLVER), new Card(CardCategory.WEAPON, Weapon.ROPE), new Card(CardCategory.WEAPON, Weapon.WRENCH),
        new Card(CardCategory.ROOM, Room.BALLROOM), new Card(CardCategory.ROOM, Room.BILLIARD), new Card(CardCategory.ROOM, Room.CONSERVATORY),
        new Card(CardCategory.ROOM, Room.DINING), new Card(CardCategory.ROOM, Room.HALL), new Card(CardCategory.ROOM, Room.KITCHEN),
        new Card(CardCategory.ROOM, Room.LIBRARY), new Card(CardCategory.ROOM, Room.LOUNGE), new Card(CardCategory.ROOM, Room.STUDY)
    ];

    static allCardsExcept(cards : Card[]) : Card[]
    {
        return this.ALLCARDS.filter((card) => { return !_.find(cards, card); });
    }

    static allCardsInCategory(cardCategory : CardCategory) : Card[]
    {
        return _.filter(GameConstants.ALLCARDS, (card) => { return card.category == cardCategory; });
    }

    static SUSPECTS = [
        {index: 0, name: "Mr. Green", icon: 'green.png'}, {index: 1, name: "Colonel Mustard", icon: 'mustard.png'}, {index: 2, name: "Mrs. Peacock", icon: 'peacock.png'}, 
        {index: 3, name: "Professor Plum", icon: 'plum.png'}, {index: 4, name: "Mrs. Scarlet", icon: 'scarlet.png'}, {index: 5, name: "Mrs. White", icon: 'white.png'}, 
    ];

    static WEAPONS = [
        {index: 0, name: "Candlestick", icon: 'candlestick.png'}, {index: 1, name: "Knife", icon: 'knife.png'}, {index: 2, name: "Lead Pipe", icon: 'leadpipe.png'}, 
        {index: 3, name: "Revolver", icon: 'revolver.png'}, {index: 4, name: "Rope", icon: 'rope.png'}, {index: 5, name: "Wrench", icon: 'wrench.png'}, 
    ];

    static ROOMS = [
        {index: 0, name: "Ballroom", icon: 'ballroom.png'}, {index: 1, name: "Billiard Room", icon: 'billiard.png'}, {index: 2, name: "Conservatory", icon: 'conservatory.png'}, 
        {index: 3, name: "Dining Room", icon: 'dining.png'}, {index: 4, name: "Hall", icon: 'hall.png'}, {index: 5, name: "Kitchen", icon: 'kitchen.png'},
        {index: 6, name: "Library", icon: 'library.png'}, {index: 7, name: "Lounge", icon: 'lounge.png'}, {index: 8, name: "Study", icon: 'study.png'}, 
    ];
}