import {Rule} from "../ContextFreeGrammar/Rule";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";
import {RuleType} from "../ContextFreeGrammar/RuleType";

export class ProbabilisticRule extends Rule {

    private probability: number = 0.0
    private count: number = 0

    /**
     * Constructor for any probabilistic rule from a string. The string is of the form X -> .... [probability] The
     * method constructs left hand side symbol and right hand side symbol(s) from the input string.
     * @param rule String containing the rule. The string is of the form X -> .... [probability]
     */
    constructor6(rule: string) {
        let prob = rule.substring(rule.indexOf('[') + 1, rule.indexOf(']'))
        let left = rule.substring(0, rule.indexOf("->")).trim()
        let right = rule.substring(rule.indexOf("->") + 2, rule.indexOf('[')).trim()
        this.leftHandSide = new Symbol(left)
        let rightSide = right.split(" ")
        this.rightHandSide = []
        for (let i = 0; i < rightSide.length; i++){
            this.rightHandSide.push(new Symbol(rightSide[i]))
        }
        this.probability = parseFloat(prob)
    }

    constructor(param1?: Symbol | string,
                param2?: Array<Symbol>,
                param3?: RuleType,
                param4?: number) {
        super()
        if (param1 instanceof Symbol && Array.isArray(param2) && param3 == undefined) {
            super(param1, param2)
        } else {
            if (param1 instanceof Symbol && Array.isArray(param2) && param3 != undefined) {
                super(param1, param2, param3 as RuleType)
                this.probability = param4
            } else {
                if (typeof param1 == "string") {
                    this.constructor6(param1)
                }
            }
        }
    }

    /**
     * Accessor for the probability attribute.
     * @return Probability attribute.
     */
    getProbability(): number{
        return this.probability
    }

    /**
     * Increments the count attribute.
     */
    increment(){
        this.count++
    }

    /**
     * Calculates the probability from count and the given total value.
     * @param total Value used for calculating the probability.
     */
    normalizeProbability(total: number){
        this.probability = this.count / total
    }

    /**
     * Accessor for the count attribute
     * @return Count attribute
     */
    getCount(): number{
        return this.count
    }

    /**
     * Converts the rule to the form X -> ... [probability]
     * @return String form of the rule in the form of X -> ... [probability]
     */
    toString(): string{
        return super.toString() + " [" + this.probability + "]"
    }

}