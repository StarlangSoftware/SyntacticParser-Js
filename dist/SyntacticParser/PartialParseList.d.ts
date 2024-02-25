import { ParseNode } from "nlptoolkit-parsetree/dist/ParseNode";
import { ProbabilisticParseNode } from "../ProbabilisticContextFreeGrammar/ProbabilisticParseNode";
export declare class PartialParseList {
    private readonly partialParses;
    constructor();
    addPartialParse(parseNode: ParseNode): void;
    updatePartialParse(parseNode: ProbabilisticParseNode): void;
    getPartialParse(index: number): ParseNode;
    size(): number;
}
