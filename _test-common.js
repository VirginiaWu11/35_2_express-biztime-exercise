//helper functions for test files

const db = require("./db");

class testHelpers {
    static async createData() {
        await db.query(`INSERT INTO companies (code, name, description)
        VALUES ('apple', 'Apple', 'Maker of OSX.'), 
        ('ibm', 'IBM', 'Big blue.')`);
        await db.query(
            `INSERT INTO invoices (comp_code, amt, paid, add_date, paid_date)
            VALUES ('apple', 100, false, '2018-01-01', null),
                    ('apple', 200, true, '2018-02-01', '2018-02-02'), 
                    ('ibm', 300, false, '2018-03-01', null)
            RETURNING id`
        );
    }

    static async deleteData() {
        await db.query("DELETE FROM invoices");
        await db.query("DELETE FROM companies");
    }
}

module.exports = testHelpers;
