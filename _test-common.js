//helper functions for test files

const db = require("./db");

class testHelpers {
    static async createData() {
        await db.query("");
    }

    static async deleteData() {
        await db.query("DELETE FROM invoices");
        await db.query("DELETE FROM companies");
    }
}

module.exports = testHelpers;
