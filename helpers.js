const ExpressError = require("./expressError");

class Helpers {
    static throwErrorIfEmpty(resultsLength, item) {
        if (resultsLength === 0) {
            throw new ExpressError(
                `${item} does not exist in our database`,
                404
            );
        }
    }
}

module.exports = Helpers;
