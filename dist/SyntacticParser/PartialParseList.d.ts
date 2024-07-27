import { ParseNode } from "nlptoolkit-parsetree/dist/ParseNode";
import { ProbabilisticParseNode } from "../ProbabilisticContextFreeGrammar/ProbabilisticParseNode";
export declare class PartialParseList {
    private readonly partialParses;
    /**
     * Constructor for the PartialParseList class. Initializes partial parses array list.
     */
    constructor();
    /**
     * Adds a new partial parse (actually a parse node representing the root of the subtree of the partial parse)
     * @param parseNode Root of the subtree showing the partial parse.
     */
    addPartialParse(parseNode: ParseNode): void;
    /**
     * Updates the partial parse by removing less probable nodes with the given parse node.
     * @param parseNode Parse node to be added to the partial parse.
     */
    updatePartialParse(parseNode: ProbabilisticParseNode): void;
    /**
     * Accessor for the partialParses array list.
     * @param index Position of the parse node.
     * @return Parse node at the given position.
     */
    getPartialParse(index: number): ParseNode;
    /**
     * Returns size of the partial parse.
     * @return Size of the partial parse.
     */
    size(): number;
}
