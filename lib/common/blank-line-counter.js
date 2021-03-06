

class BlankLineCounter {

    constructor() {
        this.tokenLines = new Set();
    }

    countOfEmptyLinesBetweenTokens(start, end) {
        const startLine = (start.stop || start.symbol).line;
        const endLine = (end.start || end.symbol).line;

        return this.countOfEmptyLinesBetween(startLine, endLine);
    }

    countOfEmptyLinesBetween(start, end) {
        let count = 0;

        for (let i = start + 1; i < end; i += 1) {
            !this.tokenLines.has(i) && count++;
        }

        return count;
    }

    calcTokenLines(ctx) {
        if (this.tokenLines.size === 0) {
            ctx.parser._input.tokens
                .forEach(i => this.addTokenLinesToMap(i));
        }
    }

    addTokenLinesToMap(token) {
        const HIDDEN = 1;
        if (token.channel === HIDDEN) {
            const linesCount = token.text.split('\n').length;
            for (let curLine = token.line; curLine < token.line + linesCount; curLine += 1) {
                this.tokenLines.add(curLine);
            }
        } else {
            this.tokenLines.add(token.line);
        }
    }

}


module.exports = BlankLineCounter;