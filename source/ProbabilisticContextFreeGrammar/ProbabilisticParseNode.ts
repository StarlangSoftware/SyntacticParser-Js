import {ParseNode} from "nlptoolkit-parsetree/dist/ParseNode";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";

export class ProbabilisticParseNode extends ParseNode{

    private readonly logProbability: number

    /**
     * Constructor for the ProbabilisticParseNode class. Extends the parse node with a probability.
     * @param param1 Left child of this node.
     * @param param2 Right child of this node.
     * @param param3 Data for this node.
     * @param param4 Logarithm of the probability of the node.
     */
    constructor(param1: ParseNode | Symbol,
                param2: ParseNode | Symbol | number,
                param3?: Symbol | number,
                param4?: number) {
        if (param4 != undefined){
            super(param1, param2, param3);
            this.logProbability = param4
        } else {
            if (param3 != undefined && typeof param3 == "number"){
                super(param1, param2)
                this.logProbability = param3
            } else {
                if (typeof param2 == "number"){
                    super(param1)
                    this.logProbability = param2
                }
            }
        }
    }

    /**
     * Accessor for the logProbability attribute.
     * @return logProbability attribute.
     */
    getLogProbability(): number{
        return this.logProbability
    }
}