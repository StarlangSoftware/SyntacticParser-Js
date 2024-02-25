import {Sentence} from "nlptoolkit-corpus/dist/Sentence";
import {ParseTree} from "nlptoolkit-parsetree/dist/ParseTree";
import {ContextFreeGrammar} from "../ContextFreeGrammar/ContextFreeGrammar";
import {SyntacticParser} from "./SyntacticParser";
import {Word} from "nlptoolkit-dictionary/dist/Dictionary/Word";
import {PartialParseList} from "./PartialParseList";
import {ParseNode} from "nlptoolkit-parsetree/dist/ParseNode";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";

export class CYKParser extends SyntacticParser {
    parse(cfg: ContextFreeGrammar, sentence: Sentence): Array<ParseTree> {
        let parseTrees : Array<ParseTree> = []
        let backUp = new Sentence()
        for (let i = 0; i < sentence.wordCount(); i++){
            backUp.addWord(new Word(sentence.getWord(i).getName()));
        }
        cfg.removeExceptionalWordsFromSentence(sentence);
        let table = new Array<Array<PartialParseList>>()
        for (let i = 0; i < sentence.wordCount(); i++){
            table.push(new Array<PartialParseList>())
            for (let j = i; j < sentence.wordCount(); j++){
                table[i].push(new PartialParseList())
            }
        }
        for (let i = 0; i < sentence.wordCount(); i++){
            let candidates = cfg.getTerminalRulesWithRightSideX(new Symbol(sentence.getWord(i).getName()))
            for (let candidate of candidates){
                table[i][i].addPartialParse(new ParseNode(new ParseNode(new Symbol(sentence.getWord(i).getName())), candidate.getLeftHandSide()))
            }
        }
        for (let j = 1; j < sentence.wordCount(); j++){
            for (let i = j - 1; i >= 0; i--)
                for (let k = i; k < j; k++){
                    for (let x = 0; x < table[i][k].size(); x++)
                        for (let y = 0; y < table[k + 1][j].size(); y++){
                            let leftNode = table[i][k].getPartialParse(x)
                            let rightNode = table[k + 1][j].getPartialParse(y)
                            let candidates = cfg.getRulesWithTwoNonTerminalsOnRightSide(leftNode.getData(), rightNode.getData())
                            for (let candidate of candidates){
                                table[i][j].addPartialParse(new ParseNode(leftNode, rightNode, candidate.getLeftHandSide()))
                            }
                        }
                }
        }
        for (let i = 0; i < table[0][sentence.wordCount() - 1].size(); i++){
            if (table[0][sentence.wordCount() - 1].getPartialParse(i).getData().getName() == "S") {
                let parseTree = new ParseTree(table[0][sentence.wordCount() - 1].getPartialParse(i))
                parseTree.correctParents()
                parseTree.removeXNodes()
                parseTrees.push(parseTree)
            }
        }
        for (let parseTree of parseTrees){
            cfg.reinsertExceptionalWordsFromSentence(parseTree, backUp)
        }
        return parseTrees
    }

}