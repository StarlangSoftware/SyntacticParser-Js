import {ParseNode} from "nlptoolkit-parsetree/dist/ParseNode";
import {ProbabilisticParseNode} from "../ProbabilisticContextFreeGrammar/ProbabilisticParseNode";

export class PartialParseList {

    private readonly partialParses: Array<ParseNode>

    /**
     * Constructor for the PartialParseList class. Initializes partial parses array list.
     */
    constructor() {
        this.partialParses = []
    }

    /**
     * Adds a new partial parse (actually a parse node representing the root of the subtree of the partial parse)
     * @param parseNode Root of the subtree showing the partial parse.
     */
    addPartialParse(parseNode: ParseNode){
        this.partialParses.push(parseNode)
    }

    /**
     * Updates the partial parse by removing less probable nodes with the given parse node.
     * @param parseNode Parse node to be added to the partial parse.
     */
    updatePartialParse(parseNode: ProbabilisticParseNode){
        let found = false
        for (let i = 0; i < this.partialParses.length; i++){
            let partialParse = this.partialParses[i]
            if (partialParse.getData().getName() == parseNode.getData().getName()){
                if ((partialParse as ProbabilisticParseNode).getLogProbability() < parseNode.getLogProbability()){
                    this.partialParses.splice(i, 1)
                    this.partialParses.push(parseNode)
                }
                found = true
                break;
            }
        }
        if (!found){
            this.partialParses.push(parseNode)
        }
    }

    /**
     * Accessor for the partialParses array list.
     * @param index Position of the parse node.
     * @return Parse node at the given position.
     */
    getPartialParse(index: number): ParseNode{
        return this.partialParses[index]
    }

    /**
     * Returns size of the partial parse.
     * @return Size of the partial parse.
     */
    size(): number{
        return this.partialParses.length
    }

}