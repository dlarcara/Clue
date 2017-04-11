import { Suspect } from '../index';

export class Player
{
    name: string
    suspect: Suspect
    numberOfCards: number;

    constructor(name: string, suspect: Suspect, numberOfCards : number)
    {
        this.name = name;
        this.suspect = suspect;
        this.numberOfCards = numberOfCards;
    }
}