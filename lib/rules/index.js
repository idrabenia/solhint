const security = require('./security/index');
const naming = require('./naming/index');
const order = require('./order/index');
const align = require('./align/index');
const bestPractises = require('./best-practises/index');
const QuotesChecker = require('./quotes');
const MaxLineLengthChecker = require('./max-line-length');


module.exports = function checkers(reporter, config={}) {
    return [
        ...security(reporter, config),
        ...order(reporter, config),
        ...naming(reporter, config),
        ...align(reporter, config),
        ...bestPractises(reporter, config),
        new QuotesChecker(reporter, config),
        new MaxLineLengthChecker(reporter, config)
    ];
};
