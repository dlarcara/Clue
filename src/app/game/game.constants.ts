import { CardCategory, Card, Suspect, Weapon, Room } from "./index";

import * as _ from 'lodash';

let baseIconLocation = 'assets/img/cards';
let suspectIconLocation = `${baseIconLocation}/suspects`;
let weaponIconLocation = `${baseIconLocation}/weapons`;
let roomIconLocation = `${baseIconLocation}/rooms`;

class CardDisplay {
    constructor (public card : Card, public friendlyName : string, public icon : string, public color : string) {}
}

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

    private static displayForCards : CardDisplay[] = [
        new CardDisplay(GameConstants.ALLCARDS[0], 'Mr. Green', `${suspectIconLocation}/green.png`, 'green' ),
        new CardDisplay(GameConstants.ALLCARDS[1], 'Colonel Mustard', `${suspectIconLocation}/mustard.png`, 'mustard' ),
        new CardDisplay(GameConstants.ALLCARDS[2], 'Mrs. Peacock', `${suspectIconLocation}/peacock.png`, 'peacock' ),
        new CardDisplay(GameConstants.ALLCARDS[3], 'Professor Plum', `${suspectIconLocation}/plum.png`, 'plum' ),
        new CardDisplay(GameConstants.ALLCARDS[4], 'Miss Scarlet', `${suspectIconLocation}/scarlet.png`, 'scarlet' ),
        new CardDisplay(GameConstants.ALLCARDS[5], 'Mrs. White', `${suspectIconLocation}/white.png`, 'white' ),
        new CardDisplay(GameConstants.ALLCARDS[6], 'Candlestick', `${weaponIconLocation}/candlestick.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[7], 'Knife', `${weaponIconLocation}/knife.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[8], 'Lead Pipe', `${weaponIconLocation}/leadpipe.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[9],  'Revolver', `${weaponIconLocation}/revolver.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[10], 'Rope', `${weaponIconLocation}/rope.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[11], 'Wrench', `${weaponIconLocation}/wrench.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[12], 'Ballroom', `${roomIconLocation}/ballroom.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[13], 'Billiard Room', `${roomIconLocation}/billiardroom.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[14], 'Conservatory', `${roomIconLocation}/conservatory.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[15], 'Dining Room', `${roomIconLocation}/diningroom.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[16], 'Hall', `${roomIconLocation}/hall.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[17], 'Kitchen', `${roomIconLocation}/kitchen.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[18], 'Library', `${roomIconLocation}/library.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[19], 'Lounge', `${roomIconLocation}/lounge.png`, ''),
        new CardDisplay(GameConstants.ALLCARDS[20], 'Study', `${roomIconLocation}/study.png`, ''),
    ]
    
    static useDrOrchid(useOrchid : Boolean) : void 
    {
        if (useOrchid)
        {
            this.displayForCards[5].friendlyName = "Dr. Orchid";
            this.displayForCards[5].icon = `${suspectIconLocation}/orchid.png`;
            this.displayForCards[5].color = `orchid`;
        }
        else 
        {
            this.displayForCards[5].friendlyName = "Mrs. White";
            this.displayForCards[5].icon = `${suspectIconLocation}/white.png`;
            this.displayForCards[5].color = `white`;
        }
    }

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
        let cardDisplay =  _.find(this.displayForCards, (d : CardDisplay) => _.isEqual(d.card, card));
        return cardDisplay ? cardDisplay.friendlyName : '';
    }

    static getSuspectColor(suspect : Suspect) : string
    {
        let cardDisplay =  _.find(this.displayForCards, (d : CardDisplay) => d.card.cardIndex == suspect && d.card.category == CardCategory.SUSPECT);
        return cardDisplay ? cardDisplay.color : '';
    }

    static getCardIcon(card : Card)
    {
        let cardDisplay =  _.find(this.displayForCards, (d) => _.isEqual(d.card, card));
        return cardDisplay ? cardDisplay.icon : '';
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