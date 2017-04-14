import { CircularArray } from "../shared/index";

describe("When using a closed array:", () => {
    it("it should throw an error if unique values are not provided", () => {
        expect(() => new CircularArray<any>([{a: 1},{a : 1}])).toThrowError("Duplicate values provided");
    });

    it("it should throw an error when getting the index and the provided player can not be found", () => {
        let closedArray = new CircularArray<number>([1,2]);
        
        expect(() => closedArray.getIndexOf(3)).toThrowError("Value not found");
    });

    it("it should return the index of a given number", () => {
        let closedArray = new CircularArray<number>([1,2]);

        expect(closedArray.getIndexOf(1)).toBe(0);
    });

    it("it should return the index of a given object", () => {
        let closedArray = new CircularArray<any>([{a: 1},{b : 2}]);

        expect(closedArray.getIndexOf({b : 2})).toBe(1);
    });

    it("it should throw an error when getting the next value and the provided value can not be found", () => {
        let closedArray = new CircularArray<number>([1,2]);
        
        expect(() => closedArray.getNext(3)).toThrowError("Value not found");
    });

    it("it should get the next value when index of value provided is in middle of array", () => {
        let closedArray = new CircularArray<number>([1,2,3,4]);
        
        expect(closedArray.getNext(2)).toBe(3);
    });

    it("it should get the first value when index of value provided is the last item of array", () => {
        let closedArray = new CircularArray<number>([1,2,3,4]);
        
        expect(closedArray.getNext(4)).toBe(1);
    });
});