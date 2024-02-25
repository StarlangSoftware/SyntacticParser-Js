import {Sentence} from "nlptoolkit-corpus/dist/Sentence";
import {ParseTree} from "nlptoolkit-parsetree/dist/ParseTree";
import {ProbabilisticContextFreeGrammar} from "../ProbabilisticContextFreeGrammar/ProbabilisticContextFreeGrammar";

export abstract class ProbabilisticParser {

    abstract parse(cfg: ProbabilisticContextFreeGrammar, sentence: Sentence): Array<ParseTree>

}