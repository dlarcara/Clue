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
}