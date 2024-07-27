import { Rule } from "../ContextFreeGrammar/Rule";
import { Symbol } from "nlptoolkit-parsetree/dist/Symbol";
import { RuleType } from "../ContextFreeGrammar/RuleType";
export declare class ProbabilisticRule extends Rule {
    private probability;
    private count;
    /**
     * Constructor for any probabilistic rule from a string. The string is of the form X -> .... [probability] The
     * method constructs left hand side symbol and right hand side symbol(s) from the input string.
     * @param rule String containing the rule. The string is of the form X -> .... [probability]
     */
    constructor6(rule: string): void;
    constructor(param1?: Symbol | string, param2?: Array<Symbol>, param3?: RuleType, param4?: number);
    /**
     * Accessor for the probability attribute.
     * @return Probability attribute.
     */
    getProbability(): number;
    /**
     * Increments the count attribute.
     */
    increment(): void;
    /**
     * Calculates the probability from count and the given total value.
     * @param total Value used for calculating the probability.
     */
    normalizeProbability(total: number): void;
    /**
     * Accessor for the count attribute
     * @return Count attribute
     */
    getCount(): number;
    /**
     * Converts the rule to the form X -> ... [probability]
     * @return String form of the rule in the form of X -> ... [probability]
     */
    toString(): string;
}
