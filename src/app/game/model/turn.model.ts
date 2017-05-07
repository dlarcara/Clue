import { Player, GameSheet, Guess, TurnLessons } from '../index';

export class Turn
{
    number: number
    player: Player
    guess: Guess

    resultingSheet: GameSheet
    lessonsLearned : TurnLessons

    constructor(number : Number, player : Player, guess : Guess, resultingSheet : GameSheet)
    {
        this.number = +number;
        this.player = player;
        this.guess = guess;
        this.resultingSheet = resultingSheet;
    }
}