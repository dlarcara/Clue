import { Suspect } from '../index';

export class Player
{
    name: string
    suspect: Suspect

    constructor(name: string, suspect: Suspect)
    {
        this.name = name;
        this.suspect = suspect;
    }
}