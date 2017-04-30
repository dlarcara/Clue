import { CardCategory, Card, Suspect, Weapon, Room } from "./index";

import * as _ from 'lodash';

let baseIconLocation = 'assets/img/cards';
let suspectIconLocation = `${baseIconLocation}/suspects`;
let weaponIconLocation = `${baseIconLocation}/weapons`;
let roomIconLocation = `${baseIconLocation}/rooms`;

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

    private static readonly displayForCards = [
        { card: GameConstants.ALLCARDS[0], friendlyName: 'Mr. Green', icon: `${suspectIconLocation}/green.png` },
        { card: GameConstants.ALLCARDS[1], friendlyName: 'Colonel Mustard', icon: `${suspectIconLocation}/mustard.png` },
        { card: GameConstants.ALLCARDS[2], friendlyName: 'Mrs. Peacock', icon: `${suspectIconLocation}/peacock.png` },
        { card: GameConstants.ALLCARDS[3], friendlyName: 'Professor Plum', icon: `${suspectIconLocation}/plum.png` },
        { card: GameConstants.ALLCARDS[4], friendlyName: 'Miss Scarlet', icon: `${suspectIconLocation}/scarlet.png` },
        { card: GameConstants.ALLCARDS[5], friendlyName: 'Mrs. White', icon: `${suspectIconLocation}/white.png` },
        { card: GameConstants.ALLCARDS[6], friendlyName: 'Candlestick', icon: `${weaponIconLocation}/candlestick.png` },
        { card: GameConstants.ALLCARDS[7], friendlyName: 'Knife', icon: `${weaponIconLocation}/knife.png` },
        { card: GameConstants.ALLCARDS[8], friendlyName: 'Lead Pipe', icon: `${weaponIconLocation}/leadpipe.png` },
        { card: GameConstants.ALLCARDS[9], friendlyName: 'Revolver', icon: `${weaponIconLocation}/revolver.png` },
        { card: GameConstants.ALLCARDS[10], friendlyName: 'Rope', icon: `${weaponIconLocation}/rope.png` },
        { card: GameConstants.ALLCARDS[11], friendlyName: 'Wrench', icon: `${weaponIconLocation}/wrench.png` },
        { card: GameConstants.ALLCARDS[12], friendlyName: 'Ballroom', icon: `${roomIconLocation}/ballroom.png` },
        { card: GameConstants.ALLCARDS[13], friendlyName: 'Billiard Room', icon: `${roomIconLocation}/billiardroom.png` },
        { card: GameConstants.ALLCARDS[14], friendlyName: 'Conservatory', icon: `${roomIconLocation}/conservatory.png` },
        { card: GameConstants.ALLCARDS[15], friendlyName: 'Dining Room', icon: `${roomIconLocation}/diningroom.png` },
        { card: GameConstants.ALLCARDS[16], friendlyName: 'Hall', icon: `${roomIconLocation}/hall.png` },
        { card: GameConstants.ALLCARDS[17], friendlyName: 'Kitchen', icon: `${roomIconLocation}/kitchen.png` },
        { card: GameConstants.ALLCARDS[18], friendlyName: 'Library', icon: `${roomIconLocation}/library.png` },
        { card: GameConstants.ALLCARDS[19], friendlyName: 'Lounge', icon: `${roomIconLocation}/lounge.png` },
        { card: GameConstants.ALLCARDS[20], friendlyName: 'Study', icon: `${roomIconLocation}/study.png` }
    ]
    
    static getAllCards() : Card[]
    {
        return this.ALLCARDS;
    }

    static getAllCardsExcept(cards : Card[]) : Card[]
    {
        return this.ALLCARDS.filter((card) => { return !_.find(cards, card); });
    }

    static getAllCardsInCategory(cardCategory : CardCategory) : Card[]
    {
        return _.filter(this.ALLCARDS, (card) => { return card.category == cardCategory; });
    }

    static getCard(cardCategory : CardCategory, cardIndex : number) : Card
    {
        return _.find(this.ALLCARDS, (c) => { return c.category == cardCategory && c.cardIndex == cardIndex; });
    }

    static getCardFriendlyName(card : Card)
    {
        return _.find(this.displayForCards, (d) => _.isEqual(d.card, card)).friendlyName;
    }

    static getCardIcon(card : Card)
    {
        return _.find(this.displayForCards, (d) => _.isEqual(d.card, card)).icon;
    }

    static groupAllCardsByCategory() : any[]
    {
        return this.groupCardsByCategory(this.ALLCARDS);
    }

    static groupCardsByCategory(cards : Card[]) : any[]
    {
        return _.chain(cards)
                .groupBy('category')
                .toPairs()
                .map(item => _.zipObject(['category', 'cards'], item))
                .map((item : {category, cards}) =>  { return {category: CardCategory[item.category], cards: item.cards }; })
                .value();
    }
}