import { Suspect } from '../index';

export class Player
{
    name : string
    suspect : Suspect
    numberOfCards : number
    isDetective : Boolean

    constructor(name: string, suspect: Suspect, numberOfCards : number, isDetective : Boolean)
    {
        this.name = name;
        this.suspect = suspect;
        this.numberOfCards = numberOfCards;
        this.isDetective = isDetective;
    }
}