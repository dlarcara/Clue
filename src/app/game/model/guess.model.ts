import { Player, Suspect, Weapon, Room, Card, CardCategory  } from '../index';

export class Guess
{
    suspect: Suspect
    weapon: Weapon
    room: Room
    playerThatGuessed: Player
    playerThatShowed: Player
    cardShown: Card
    resolvedTurn: number

    //Card versions for Suspect, Weapon Room 
    private suspectCard: Card 
    private weaponCard: Card 
    private roomCard: Card 

    constructor(suspect : Suspect, weapon : Weapon, room : Room, playerThatGuessed : Player, playerThatShowed : Player, cardShown : Card)
    {
        this.suspect = suspect;
        this.weapon = weapon;
        this.room = room;
        this.playerThatGuessed = playerThatGuessed
        this.playerThatShowed = playerThatShowed;
        this.cardShown = cardShown;

        //Cards Guessed Calculated 
        this.suspectCard = new Card(CardCategory.SUSPECT, this.suspect); 
        this.weaponCard = new Card(CardCategory.WEAPON, this.weapon); 
        this.roomCard = new Card(CardCategory.ROOM, this.room); 
    }
}