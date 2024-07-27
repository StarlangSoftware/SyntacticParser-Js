import { ParseNode } from "nlptoolkit-parsetree/dist/ParseNode";
import { Symbol } from "nlptoolkit-parsetree/dist/Symbol";
export declare class ProbabilisticParseNode extends ParseNode {
    private readonly logProbability;
    /**
     * Constructor for the ProbabilisticParseNode class. Extends the parse node with a probability.
     * @param param1 Left child of this node.
     * @param param2 Right child of this node.
     * @param param3 Data for this node.
     * @param param4 Logarithm of the probability of the node.
     */
    constructor(param1: ParseNode | Symbol, param2: ParseNode | Symbol | number, param3?: Symbol | number, param4?: number);
    /**
     * Accessor for the logProbability attribute.
     * @return logProbability attribute.
     */
    getLogProbability(): number;
}
