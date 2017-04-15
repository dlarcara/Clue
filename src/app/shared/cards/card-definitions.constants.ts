import { CardDefinition } from './card-definition';
import { CardCategory } from '../../game/index';

let baseIconLocation = 'assets/img/cards';
let suspectIconLocation = `${baseIconLocation}/suspects`;
let weaponIconLocation = `${baseIconLocation}/weapons`;
let roomIconLocation = `${baseIconLocation}/rooms`;

export class CardDefinitions
{
    static SUSPECTS = [
        new CardDefinition(CardCategory.SUSPECT, 0, 'Mr. Green', `${suspectIconLocation}/green.png`),
        new CardDefinition(CardCategory.SUSPECT, 1, 'Colonel Mustard', `${suspectIconLocation}/mustard.png`),
        new CardDefinition(CardCategory.SUSPECT, 2, 'Mrs. Peacock', `${suspectIconLocation}/peacock.png`),
        new CardDefinition(CardCategory.SUSPECT, 3, 'Professor Plum', `${suspectIconLocation}/plum.png`),
        new CardDefinition(CardCategory.SUSPECT, 4, 'Mrs. Scarlet', `${suspectIconLocation}/scarlet.png`),
        new CardDefinition(CardCategory.SUSPECT, 5, 'Mrs. White', `${suspectIconLocation}/white.png`)
    ];

    static WEAPONS = [
        new CardDefinition(CardCategory.WEAPON, 0, 'Candlestick', `${roomIconLocation}/candlestick.png`),
        new CardDefinition(CardCategory.WEAPON, 1, 'Knife', `${roomIconLocation}/knife.png`),
        new CardDefinition(CardCategory.WEAPON, 2, 'Lead Pipe', `${roomIconLocation}/leadpipe.png`),
        new CardDefinition(CardCategory.WEAPON, 3, 'Revolver', `${roomIconLocation}/revolver.png`),
        new CardDefinition(CardCategory.WEAPON, 4, 'Rope', `${roomIconLocation}/rope.png`),
        new CardDefinition(CardCategory.WEAPON, 5, 'Wrench', `${roomIconLocation}/wrench.png`)
    ];

    static ROOMS = [
        new CardDefinition(CardCategory.ROOM, 0, 'Ballroom', `${roomIconLocation}/ballroom.png`),
        new CardDefinition(CardCategory.ROOM, 1, 'Billiard Room', `${roomIconLocation}/billiard.png`),
        new CardDefinition(CardCategory.ROOM, 2, 'Conservatory', `${roomIconLocation}/conservatory.png`),
        new CardDefinition(CardCategory.ROOM, 3, 'Dining Room', `${roomIconLocation}/dining.png`),
        new CardDefinition(CardCategory.ROOM, 5, 'Hall', `${roomIconLocation}/hall.png`),
        new CardDefinition(CardCategory.ROOM, 6, 'Kitchen', `${roomIconLocation}/kitchen.png`),
        new CardDefinition(CardCategory.ROOM, 7, 'Library', `${roomIconLocation}/library.png`),
        new CardDefinition(CardCategory.ROOM, 8, 'Lounge', `${roomIconLocation}/lounge.png`),
        new CardDefinition(CardCategory.ROOM, 9, 'Stucy', `${roomIconLocation}/study.png`)
    ];
}