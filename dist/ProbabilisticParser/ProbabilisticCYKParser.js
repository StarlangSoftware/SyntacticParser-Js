(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "nlptoolkit-corpus/dist/Sentence", "nlptoolkit-parsetree/dist/ParseTree", "./ProbabilisticParser", "nlptoolkit-dictionary/dist/Dictionary/Word", "../SyntacticParser/PartialParseList", "nlptoolkit-parsetree/dist/Symbol", "nlptoolkit-parsetree/dist/ParseNode", "../ProbabilisticContextFreeGrammar/ProbabilisticParseNode"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProbabilisticCYKParser = void 0;
    const Sentence_1 = require("nlptoolkit-corpus/dist/Sentence");
    const ParseTree_1 = require("nlptoolkit-parsetree/dist/ParseTree");
    const ProbabilisticParser_1 = require("./ProbabilisticParser");
    const Word_1 = require("nlptoolkit-dictionary/dist/Dictionary/Word");
    const PartialParseList_1 = require("../SyntacticParser/PartialParseList");
    const Symbol_1 = require("nlptoolkit-parsetree/dist/Symbol");
    const ParseNode_1 = require("nlptoolkit-parsetree/dist/ParseNode");
    const ProbabilisticParseNode_1 = require("../ProbabilisticContextFreeGrammar/ProbabilisticParseNode");
    class ProbabilisticCYKParser extends ProbabilisticParser_1.ProbabilisticParser {
        /**
         * Constructs an array of most probable parse trees for a given sentence according to the given grammar. CYK parser
         * is based on a dynamic programming algorithm.
         * @param pcfg Probabilistic context free grammar used in parsing.
         * @param sentence Sentence to be parsed.
         * @return Array list of most probable parse trees for the given sentence.
         */
        parse(pcfg, sentence) {
            let parseTrees = [];
            let backUp = new Sentence_1.Sentence();
            for (let i = 0; i < sentence.wordCount(); i++) {
                backUp.addWord(new Word_1.Word(sentence.getWord(i).getName()));
            }
            pcfg.removeExceptionalWordsFromSentence(sentence);
            let table = new Array();
            for (let i = 0; i < sentence.wordCount(); i++) {
                table.push(new Array());
                for (let j = i; j < sentence.wordCount(); j++) {
                    table[i].push(new PartialParseList_1.PartialParseList());
                }
            }
            for (let i = 0; i < sentence.wordCount(); i++) {
                let candidates = pcfg.getTerminalRulesWithRightSideX(new Symbol_1.Symbol(sentence.getWord(i).getName()));
                for (let candidate of candidates) {
                    table[i][i].addPartialParse(new ProbabilisticParseNode_1.ProbabilisticParseNode(new ParseNode_1.ParseNode(new Symbol_1.Symbol(sentence.getWord(i).getName())), candidate.getLeftHandSide(), Math.log(candidate.getProbability())));
                }
            }
            for (let j = 1; j < sentence.wordCount(); j++) {
                for (let i = j - 1; i >= 0; i--) {
                    for (let k = i; k < j; k++)
                        for (let x = 0; x < table[i][k].size(); x++)
                            for (let y = 0; y < table[k + 1][j].size(); y++) {
                                let leftNode = table[i][k].getPartialParse(x);
                                let rightNode = table[k + 1][j].getPartialParse(y);
                                let candidates = pcfg.getRulesWithTwoNonTerminalsOnRightSide(leftNode.getData(), rightNode.getData());
                                for (let candidate of candidates) {
                                    let probability = Math.log(candidate.getProbability()) + leftNode.getLogProbability() + rightNode.getLogProbability();
                                    table[i][j].updatePartialParse(new ProbabilisticParseNode_1.ProbabilisticParseNode(leftNode, rightNode, candidate.getLeftHandSide(), probability));
                                }
                            }
                }
            }
            let bestProbability = -1;
            for (let i = 0; i < table[0][sentence.wordCount() - 1].size(); i++) {
                if (table[0][sentence.wordCount() - 1].getPartialParse(i).getData().getName() == "S" && table[0][sentence.wordCount() - 1].getPartialParse(i).getLogProbability() > bestProbability) {
                    bestProbability = table[0][sentence.wordCount() - 1].getPartialParse(i).getLogProbability();
                }
            }
            for (let i = 0; i < table[0][sentence.wordCount() - 1].size(); i++) {
                if (table[0][sentence.wordCount() - 1].getPartialParse(i).getData().getName() == "S" && table[0][sentence.wordCount() - 1].getPartialParse(i).getLogProbability() == bestProbability) {
                    let parseTree = new ParseTree_1.ParseTree(table[0][sentence.wordCount() - 1].getPartialParse(i));
                    parseTree.correctParents();
                    parseTree.removeXNodes();
                    parseTrees.push(parseTree);
                }
            }
            for (let parseTree of parseTrees) {
                pcfg.reinsertExceptionalWordsFromSentence(parseTree, backUp);
            }
            return parseTrees;
        }
    }
    exports.ProbabilisticCYKParser = ProbabilisticCYKParser;
});
//# sourceMappingURL=ProbabilisticCYKParser.js.map