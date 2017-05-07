import { Player, Card, CardCategory } from '../../index';

export class LessonsLearnedForPlayer
{
    constructor(public player : Player, public cardsHad : Card[], public cardsNotHad : Card[]) {}

    toFriendlyString()
    {
        let playerDisplay = this.wrapDisplayValue(this.player.name);

        if (this.cardsHad.length && !this.cardsNotHad.length)
        {
            let names = this.getCardFriendlyNames(this.cardsHad);
            let cardsHadDisplay = this.getJoinedDisplay(names);
            return `${playerDisplay} has ${cardsHadDisplay}.`;
        }
        else if (!this.cardsHad.length && this.cardsNotHad.length)
        {
            let names = this.getCardFriendlyNames(this.cardsNotHad);
            let cardsNotHadDisplay = this.getJoinedDisplay(names);
            return `${playerDisplay} doesn't have ${cardsNotHadDisplay}.`;
        }
        else if (this.cardsHad.length && this.cardsNotHad.length)
        {
            let hadNames = this.getCardFriendlyNames(this.cardsHad);
            let cardsHadDisplay = this.getJoinedDisplay(hadNames);

            let cardsNotHadNames = this.getCardFriendlyNames(this.cardsNotHad);
            let cardsNotHadDisplay = this.getJoinedDisplay(cardsNotHadNames);
            
            return `${playerDisplay} has ${cardsHadDisplay} plus doesn't have ${cardsNotHadDisplay}.`;
        }

        return '';
    }

    private getCardFriendlyNames(cards : Card[])
    {
        return cards.map((c) => {
            if (c.category == CardCategory.SUSPECT)
                return `${this.wrapDisplayValue(c.friendlyName)}`;

            return `the ${this.wrapDisplayValue(c.friendlyName)}`;
        });
    }

    private getJoinedDisplay(values : string[]) : string
    {
        if (!values.length)
            return '';

        if (values.length == 1)
            return values[0];

        return values.slice(0, -1).join(', ') + ' and ' + values[values.length - 1];
    }

    private wrapDisplayValue(value : string) : string
    {
        return `<span class="display-value">${value}</span>`;
    }
}