import { Suspect, Weapon, Room } from '../index';

export class Verdict
{
    suspect: Suspect
    weapon: Weapon
    room: Room

    constructor(suspect : Suspect = null, weapon : Weapon = null, room : Room = null)
    {
        this.suspect = suspect;
        this.weapon = weapon;
        this.room = room;
    }
}