import { Sentence } from "nlptoolkit-corpus/dist/Sentence";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
import { ProbabilisticContextFreeGrammar } from "../ProbabilisticContextFreeGrammar/ProbabilisticContextFreeGrammar";
import { ProbabilisticParser } from "./ProbabilisticParser";
export declare class ProbabilisticCYKParser extends ProbabilisticParser {
    /**
     * Constructs an array of most probable parse trees for a given sentence according to the given grammar. CYK parser
     * is based on a dynamic programming algorithm.
     * @param pcfg Probabilistic context free grammar used in parsing.
     * @param sentence Sentence to be parsed.
     * @return Array list of most probable parse trees for the given sentence.
     */
    parse(pcfg: ProbabilisticContextFreeGrammar, sentence: Sentence): Array<ParseTree>;
}
