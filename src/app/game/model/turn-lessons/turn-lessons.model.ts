import { LessonsLearnedForPlayer, Card, Verdict } from '../../index';

export class TurnLessons
{
    //Lessons Learned for Player holds cards identified as had or not had for all players in this turn
    //ReolvedTurns holds all turn numbers closed by this turn
    //Verdict holds the current verdict known at the end of this turn
    //IdentifiedSuspect, Weapon, Room hold if the verdict for the given category was identified in this turn
    //Progress holds the total progress made in this turn
    constructor(public lessonsLearnedForPlayers : LessonsLearnedForPlayer[], public resolvedTurns : number[],
                public verdict : Verdict, public identifiedSuspect : Boolean, public identifiedWeapon : Boolean,
                public identifiedRoom : Boolean, public progress : number) {}
}