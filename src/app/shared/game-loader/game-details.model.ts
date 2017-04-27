import { Player, Card, Turn } from '../../game/index';

export class GameDetails
{
    constructor(public players: Player[], public  detectivesCards: Card[], 
                public turns: Turn[], public activePlayer: Player) 
    { }
}