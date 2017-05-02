import { Player, GameSheet, Guess } from '../index';

export class Turn
{
    number: number
    player: Player
    guess: Guess
    resultingSheet: GameSheet

    constructor(number : Number, player : Player, guess : Guess, resultingSheet : GameSheet)
    {
        this.number = +number;
        this.player = player;
        this.guess = guess;
        this.resultingSheet = resultingSheet;
    }
}