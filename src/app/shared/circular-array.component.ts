import * as _ from 'lodash';

export class CircularArray<T>
{
    constructor(private values : T[]) 
    {
        if (_.uniqWith(values, _.isEqual).length != values.length)
            throw new Error("Duplicate values provided");
    }

    getIndexOf(value : T) : number
    {
        let index = _.findIndex(this.values, (v) => { return _.isEqual(v, value); });

        if (index == -1)
            throw new Error("Value not found");

        return index;
    }

    getNext(value : T) : T
    {
        let valueIndex = this.getIndexOf(value);
        let nextIndex = (valueIndex == (this.values.length - 1)) ? 0 : valueIndex + 1;
        return this.values[nextIndex];
    }
}