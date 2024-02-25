import { Sentence } from "nlptoolkit-corpus/dist/Sentence";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
import { ProbabilisticContextFreeGrammar } from "../ProbabilisticContextFreeGrammar/ProbabilisticContextFreeGrammar";
import { ProbabilisticParser } from "./ProbabilisticParser";
export declare class ProbabilisticCYKParser extends ProbabilisticParser {
    parse(pcfg: ProbabilisticContextFreeGrammar, sentence: Sentence): Array<ParseTree>;
}
