import {ParseNode} from "nlptoolkit-parsetree/dist/ParseNode";
import {ProbabilisticParseNode} from "../ProbabilisticContextFreeGrammar/ProbabilisticParseNode";

export class PartialParseList {

    private readonly partialParses: Array<ParseNode>

    constructor() {
        this.partialParses = []
    }

    addPartialParse(parseNode: ParseNode){
        this.partialParses.push(parseNode)
    }

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

    getPartialParse(index: number): ParseNode{
        return this.partialParses[index]
    }

    size(): number{
        return this.partialParses.length
    }

}