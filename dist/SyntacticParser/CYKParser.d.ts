import { Sentence } from "nlptoolkit-corpus/dist/Sentence";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
import { ContextFreeGrammar } from "../ContextFreeGrammar/ContextFreeGrammar";
import { SyntacticParser } from "./SyntacticParser";
export declare class CYKParser extends SyntacticParser {
    /**
     * Constructs an array of possible parse trees for a given sentence according to the given grammar. CYK parser
     * is based on a dynamic programming algorithm.
     * @param cfg Context free grammar used in parsing.
     * @param sentence Sentence to be parsed.
     * @return Array list of possible parse trees for the given sentence.
     */
    parse(cfg: ContextFreeGrammar, sentence: Sentence): Array<ParseTree>;
}
