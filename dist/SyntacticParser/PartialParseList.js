(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.PartialParseList = void 0;
    class PartialParseList {
        /**
         * Constructor for the PartialParseList class. Initializes partial parses array list.
         */
        constructor() {
            this.partialParses = [];
        }
        /**
         * Adds a new partial parse (actually a parse node representing the root of the subtree of the partial parse)
         * @param parseNode Root of the subtree showing the partial parse.
         */
        addPartialParse(parseNode) {
            this.partialParses.push(parseNode);
        }
        /**
         * Updates the partial parse by removing less probable nodes with the given parse node.
         * @param parseNode Parse node to be added to the partial parse.
         */
        updatePartialParse(parseNode) {
            let found = false;
            for (let i = 0; i < this.partialParses.length; i++) {
                let partialParse = this.partialParses[i];
                if (partialParse.getData().getName() == parseNode.getData().getName()) {
                    if (partialParse.getLogProbability() < parseNode.getLogProbability()) {
                        this.partialParses.splice(i, 1);
                        this.partialParses.push(parseNode);
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.partialParses.push(parseNode);
            }
        }
        /**
         * Accessor for the partialParses array list.
         * @param index Position of the parse node.
         * @return Parse node at the given position.
         */
        getPartialParse(index) {
            return this.partialParses[index];
        }
        /**
         * Returns size of the partial parse.
         * @return Size of the partial parse.
         */
        size() {
            return this.partialParses.length;
        }
    }
    exports.PartialParseList = PartialParseList;
});
//# sourceMappingURL=PartialParseList.js.map