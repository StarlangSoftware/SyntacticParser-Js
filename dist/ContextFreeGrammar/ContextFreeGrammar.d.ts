import { Rule } from "./Rule";
import { Symbol } from "nlptoolkit-parsetree/dist/Symbol";
import { CounterHashMap } from "nlptoolkit-datastructure/dist/CounterHashMap";
import { TreeBank } from "nlptoolkit-parsetree/dist/TreeBank";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
import { Sentence } from "nlptoolkit-corpus/dist/Sentence";
import { ParseNode } from "nlptoolkit-parsetree/dist/ParseNode";
export declare class ContextFreeGrammar {
    protected dictionary: CounterHashMap<string>;
    protected rules: Array<Rule>;
    protected rulesRightSorted: Array<Rule>;
    protected minCount: number;
    constructor1(): void;
    constructor2(ruleFileName: string, dictionaryFileName: string, minCount: number): void;
    constructor3(treeBank: TreeBank, minCount: number): void;
    constructor(param1?: string | TreeBank, param2?: string | number, param3?: number);
    readDictionary(dictionaryFileName: string): void;
    constructDictionary(treeBank: TreeBank): void;
    ruleLeftComparator: (ruleA: Rule, ruleB: Rule) => number;
    ruleRightComparator: (ruleA: Rule, ruleB: Rule) => number;
    ruleComparator: (ruleA: Rule, ruleB: Rule) => number;
    ruleRightCompare(ruleA: Rule, ruleB: Rule): number;
    updateTypes(): void;
    updateTree(parseTree: ParseTree, minCount: number): void;
    removeExceptionalWordsFromSentence(sentence: Sentence): void;
    reinsertExceptionalWordsFromSentence(parseTree: ParseTree, sentence: Sentence): void;
    static toRule(parseNode: ParseNode, trim: boolean): Rule;
    addRules(parseNode: ParseNode): void;
    binarySearch(rules: Array<Rule>, rule: Rule, comparator: (a: Rule, b: Rule) => number): number;
    addRule(newRule: Rule): void;
    removeRule(rule: Rule): void;
    getRulesWithLeftSideX(X: Symbol): Array<Rule>;
    partOfSpeechTags(): Array<Symbol>;
    getLeftSide(): Array<Symbol>;
    getTerminalRulesWithRightSideX(S: Symbol): Array<Rule>;
    getRulesWithRightSideX(S: Symbol): Array<Rule>;
    getRulesWithTwoNonTerminalsOnRightSide(A: Symbol, B: Symbol): Array<Rule>;
    getSingleNonTerminalCandidateToRemove(removedList: Array<Symbol>): Symbol;
    getMultipleNonTerminalCandidateToUpdate(): Rule;
    removeSingleNonTerminalFromRightHandSide(): void;
    updateAllMultipleNonTerminalWithNewRule(first: Symbol, second: Symbol, _with: Symbol): void;
    updateMultipleNonTerminalFromRightHandSide(): void;
    convertToChomskyNormalForm(): void;
    searchRule(rule: Rule): Rule;
    size(): number;
}
