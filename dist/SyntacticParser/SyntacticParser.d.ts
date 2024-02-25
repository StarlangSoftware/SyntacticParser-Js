import { ContextFreeGrammar } from "../ContextFreeGrammar/ContextFreeGrammar";
import { Sentence } from "nlptoolkit-corpus/dist/Sentence";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
export declare abstract class SyntacticParser {
    abstract parse(cfg: ContextFreeGrammar, sentence: Sentence): Array<ParseTree>;
}
