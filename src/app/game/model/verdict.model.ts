import { Card } from '../index';

export class Verdict
{
    suspect: Card
    weapon: Card
    room: Card

    constructor(suspect : Card, weapon : Card, room : Card)
    {
        this.suspect = suspect;
        this.weapon = weapon;
        this.room = room;
    }
}