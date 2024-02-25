import { RuleType } from "./RuleType";
import { Symbol } from "nlptoolkit-parsetree/dist/Symbol";
export declare class Rule {
    protected leftHandSide: Symbol;
    protected rightHandSide: Array<Symbol>;
    protected type: RuleType;
    constructor1(): void;
    constructor2(leftHandSide: Symbol, rightHandSideSymbol: Symbol): void;
    constructor3(leftHandSide: Symbol, rightHandSideSymbol1: Symbol, rightHandSideSymbol2: Symbol): void;
    constructor4(leftHandSide: Symbol, rightHandSide: Array<Symbol>): void;
    constructor5(leftHandSide: Symbol, rightHandSide: Array<Symbol>, type: RuleType): void;
    constructor6(rule: string): void;
    constructor(param1?: Symbol | string, param2?: Symbol | Array<Symbol>, param3?: Symbol | RuleType);
    leftRecursive(): boolean;
    updateMultipleNonTerminal(first: Symbol, second: Symbol, _with: Symbol): boolean;
    getType(): RuleType;
    setType(type: RuleType): void;
    getLeftHandSide(): Symbol;
    getRightHandSide(): Array<Symbol>;
    getRightHandSideSize(): number;
    getRightHandSideAt(index: number): Symbol;
    toString(): string;
}
