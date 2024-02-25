import { Rule } from "../ContextFreeGrammar/Rule";
import { Symbol } from "nlptoolkit-parsetree/dist/Symbol";
import { RuleType } from "../ContextFreeGrammar/RuleType";
export declare class ProbabilisticRule extends Rule {
    private probability;
    private count;
    constructor6(rule: string): void;
    constructor(param1?: Symbol | string, param2?: Array<Symbol>, param3?: RuleType, param4?: number);
    getProbability(): number;
    increment(): void;
    normalizeProbability(total: number): void;
    getCount(): number;
    toString(): string;
}
