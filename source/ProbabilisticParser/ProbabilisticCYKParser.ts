import { Sentence } from "nlptoolkit-corpus/dist/Sentence";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
import { ProbabilisticContextFreeGrammar } from "../ProbabilisticContextFreeGrammar/ProbabilisticContextFreeGrammar";
import {ProbabilisticParser} from "./ProbabilisticParser";
import {Word} from "nlptoolkit-dictionary/dist/Dictionary/Word";
import {PartialParseList} from "../SyntacticParser/PartialParseList";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";
import {ParseNode} from "nlptoolkit-parsetree/dist/ParseNode";
import {ProbabilisticParseNode} from "../ProbabilisticContextFreeGrammar/ProbabilisticParseNode";
import {ProbabilisticRule} from "../ProbabilisticContextFreeGrammar/ProbabilisticRule";

export class ProbabilisticCYKParser extends ProbabilisticParser {
    parse(pcfg: ProbabilisticContextFreeGrammar, sentence: Sentence): Array<ParseTree> {
        let parseTrees : Array<ParseTree> = []
        let backUp = new Sentence()
        for (let i = 0; i < sentence.wordCount(); i++){
            backUp.addWord(new Word(sentence.getWord(i).getName()));
        }
        pcfg.removeExceptionalWordsFromSentence(sentence);
        let table = new Array<Array<PartialParseList>>()
        for (let i = 0; i < sentence.wordCount(); i++){
            table.push(new Array<PartialParseList>())
            for (let j = i; j < sentence.wordCount(); j++){
                table[i].push(new PartialParseList())
            }
        }
        for (let i = 0; i < sentence.wordCount(); i++){
            let candidates = pcfg.getTerminalRulesWithRightSideX(new Symbol(sentence.getWord(i).getName()))
            for (let candidate of candidates){
                table[i][i].addPartialParse(new ProbabilisticParseNode(new ParseNode(new Symbol(sentence.getWord(i).getName())), candidate.getLeftHandSide(), Math.log((candidate as ProbabilisticRule).getProbability())))
            }
        }
        for (let j = 1; j < sentence.wordCount(); j++){
            for (let i = j - 1; i >= 0; i--){
                for (let k = i; k < j; k++)
                    for (let x = 0; x < table[i][k].size(); x++)
                        for (let y = 0; y < table[k + 1][j].size(); y++){
                            let leftNode = table[i][k].getPartialParse(x) as ProbabilisticParseNode
                            let rightNode = table[k + 1][j].getPartialParse(y) as ProbabilisticParseNode
                            let candidates = pcfg.getRulesWithTwoNonTerminalsOnRightSide(leftNode.getData(), rightNode.getData())
                            for (let candidate of candidates){
                                let probability = Math.log((candidate as ProbabilisticRule).getProbability()) + leftNode.getLogProbability() + rightNode.getLogProbability()
                                table[i][j].updatePartialParse(new ProbabilisticParseNode(leftNode, rightNode, candidate.getLeftHandSide(), probability))
                            }
                        }
            }
        }
        let bestProbability = -1
        for (let i = 0; i < table[0][sentence.wordCount() - 1].size(); i++){
            if (table[0][sentence.wordCount() - 1].getPartialParse(i).getData().getName() == "S" && (table[0][sentence.wordCount() - 1].getPartialParse(i) as ProbabilisticParseNode).getLogProbability() > bestProbability) {
                bestProbability = (table[0][sentence.wordCount() - 1].getPartialParse(i) as ProbabilisticParseNode).getLogProbability()
            }
        }
        for (let i = 0; i < table[0][sentence.wordCount() - 1].size(); i++){
            if (table[0][sentence.wordCount() - 1].getPartialParse(i).getData().getName() == "S" && (table[0][sentence.wordCount() - 1].getPartialParse(i) as ProbabilisticParseNode).getLogProbability() == bestProbability) {
                let parseTree = new ParseTree(table[0][sentence.wordCount() - 1].getPartialParse(i))
                parseTree.correctParents()
                parseTree.removeXNodes()
                parseTrees.push(parseTree)
            }
        }
        for (let parseTree of parseTrees){
            pcfg.reinsertExceptionalWordsFromSentence(parseTree, backUp)
        }
        return parseTrees
    }

}