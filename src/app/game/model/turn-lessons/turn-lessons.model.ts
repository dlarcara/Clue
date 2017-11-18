import { LessonsLearnedForPlayer, Verdict } from '../../index';

export class TurnLessons
{
    //Lessons Learned for Player holds cards identified as had or not had for all players in this turn
    //ResolvedTurns holds all turn numbers closed by this turn
    //UnresolvedTurns holds all turn numbers still open as of this turn
    //Verdict holds the current verdict known at the end of this turn
    //IdentifiedSuspect, Weapon, Room hold if the verdict for the given category was identified in this turn
    //Progress holds the total progress made in this turn
    constructor(public lessonsLearnedForPlayers : LessonsLearnedForPlayer[], public resolvedTurns : number[],
                public unresolvedTurns : number[], public verdict : Verdict, public identifiedSuspect : Boolean, 
                public identifiedWeapon : Boolean, public identifiedRoom : Boolean, public progress : number) {}
}