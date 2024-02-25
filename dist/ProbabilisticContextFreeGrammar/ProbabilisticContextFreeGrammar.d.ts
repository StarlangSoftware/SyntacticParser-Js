import { ContextFreeGrammar } from "../ContextFreeGrammar/ContextFreeGrammar";
import { TreeBank } from "nlptoolkit-parsetree/dist/TreeBank";
import { ProbabilisticRule } from "./ProbabilisticRule";
import { ParseNode } from "nlptoolkit-parsetree/dist/ParseNode";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
export declare class ProbabilisticContextFreeGrammar extends ContextFreeGrammar {
    constructor2(ruleFileName: string, dictionaryFileName: string, minCount: number): void;
    constructor3(treeBank: TreeBank, minCount: number): void;
    constructor(param1?: string | TreeBank, param2?: string | number, param3?: number);
    static toRule(parseNode: ParseNode, trim: boolean): ProbabilisticRule;
    addRules(parseNode: ParseNode): void;
    probabilityOfParseNode(parseNode: ParseNode): number;
    probabilityOfParseTree(parseTree: ParseTree): number;
    removeSingleNonTerminalFromRightHandSide(): void;
    updateMultipleNonTerminalFromRightHandSide(): void;
    convertToChomskyNormalForm(): void;
}
