import { CardCategory, Suspect, Weapon, Room } from '../index';

let baseIconLocation = 'assets/img/cards';
let suspectIconLocation = `${baseIconLocation}/suspects`;
let weaponIconLocation = `${baseIconLocation}/weapons`;
let roomIconLocation = `${baseIconLocation}/rooms`;

export class Card
{
    category: CardCategory
    cardIndex: Number

    friendlyName: string
    icon: string

    //TODO: Stop the duplication with GameConstants
    private displayForCards = [
        [
            {friendlyName: 'Mr. Green', icon: `${suspectIconLocation}/green.png`},
            {friendlyName: 'Colonel Mustard', icon: `${suspectIconLocation}/mustard.png`},
            {friendlyName: 'Mrs. Peacock', icon: `${suspectIconLocation}/peacock.png`},
            {friendlyName: 'Professor Plum', icon: `${suspectIconLocation}/plum.png`},
            {friendlyName: 'Miss Scarlet', icon: `${suspectIconLocation}/scarlet.png`},
            {friendlyName: 'Mrs. White', icon: `${suspectIconLocation}/white.png`}
        ],
        [
            {friendlyName: 'Candlestick', icon: `${weaponIconLocation}/candlestick.png`},
            {friendlyName: 'Knife', icon: `${weaponIconLocation}/knife.png`},
            {friendlyName: 'Lead Pipe', icon: `${weaponIconLocation}/leadpipe.png`},
            {friendlyName: 'Revolver', icon: `${weaponIconLocation}/revolver.png`},
            {friendlyName: 'Rope', icon: `${weaponIconLocation}/rope.png`},
            {friendlyName: 'Wrench', icon: `${weaponIconLocation}/wrench.png`}
        ],
        [
            {friendlyName: 'Ballroom', icon: `${roomIconLocation}/ballroom.png`},
            {friendlyName: 'Billiard Room', icon: `${roomIconLocation}/billiardroom.png`},
            {friendlyName: 'Conservatory', icon: `${roomIconLocation}/conservatory.png`},
            {friendlyName: 'Dining Room', icon: `${roomIconLocation}/diningroom.png`},
            {friendlyName: 'Hall', icon: `${roomIconLocation}/hall.png`},
            {friendlyName: 'Kitchen', icon: `${roomIconLocation}/kitchen.png`},
            {friendlyName: 'Library', icon: `${roomIconLocation}/library.png`},
            {friendlyName: 'Lounge', icon: `${roomIconLocation}/lounge.png`},
            {friendlyName: 'Study', icon: `${roomIconLocation}/study.png`}
        ]
    ];

    constructor(category : CardCategory, cardIndex : number)
    {
        this.category = category;
        this.cardIndex = cardIndex;
        this.friendlyName = this.displayForCards[category][cardIndex].friendlyName;
        this.icon = this.displayForCards[category][cardIndex].icon;
    }
}