import { Sentence } from "nlptoolkit-corpus/dist/Sentence";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
import { ContextFreeGrammar } from "../ContextFreeGrammar/ContextFreeGrammar";
import { SyntacticParser } from "./SyntacticParser";
export declare class CYKParser extends SyntacticParser {
    parse(cfg: ContextFreeGrammar, sentence: Sentence): Array<ParseTree>;
}
