import { Player, Suspect, Weapon, Room, Card } from '../index';

export class Guess
{
    suspect: Suspect;
    weapon: Weapon;
    room: Room;
    playerThatGuessed: Player;
    playerThatShowed: Player;
    cardShown: Card;

    constructor(suspect : Suspect, weapon : Weapon, room : Room, playerThatGuessed : Player, playerThatShowed : Player, cardShown : Card)
    {
        this.suspect = suspect;
        this.weapon = weapon;
        this.room = room;
        this.playerThatGuessed = playerThatGuessed
        this.playerThatShowed = playerThatShowed;
        this.cardShown = cardShown;
    }
}