import { ParseNode } from "nlptoolkit-parsetree/dist/ParseNode";
import { Symbol } from "nlptoolkit-parsetree/dist/Symbol";
export declare class ProbabilisticParseNode extends ParseNode {
    private readonly logProbability;
    constructor(param1: ParseNode | Symbol, param2: ParseNode | Symbol | number, param3?: Symbol | number, param4?: number);
    getLogProbability(): number;
}
