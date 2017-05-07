import { LessonsLearnedForPlayer, Card } from '../../index';

export class TurnLessons
{
    constructor(public lessonsLearnedForPlayers : LessonsLearnedForPlayer[], public resolvedTurns : number[],
                public identifiedSuspect : Card, public identifiedWeapon : Card, public identifiedRoom : Card) {}
}