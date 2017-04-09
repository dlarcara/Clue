import { Player, Suspect, Weapon, Room, Card } from '../index';

export class Guess
{
    suspect: Suspect;
    weapon: Weapon;
    room: Room;
    playerThatShowed: Player;
    cardShown: Card;
}