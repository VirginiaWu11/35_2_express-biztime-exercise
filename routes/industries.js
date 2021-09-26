const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const { throwErrorIfEmpty } = require("../helpers");

router.post("/", async (req, res, next) => {
    try {
        const { code, industry } = req.body;
        const results = await db.query(
            `INSERT INTO industries (code, industry) VALUES ($1,$2) RETURNING code, industry`,
            [code, industry]
        );
        return res.status(201).json({ industry: results.rows[0] });
    } catch (e) {
        next(e);
    }
});

//join Many-to-Many
router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;

        // for Many-to-Many join
        const results = await db.query(
            `SELECT i.industry, c.code, c.name FROM industries AS i
            LEFT JOIN industries_companies AS ic
            ON i.code = ic.industry_code
            LEFT JOIN companies AS c
            ON ic.comp_code = c.code
            WHERE i.code=$1`,
            [code]
        );
        console.log(results.rows);
        // sample data results.rows:
        // [
        //     { industry: 'Retail', code: 'apple', name: 'Apple Computer' },
        //     { industry: 'Retail', code: 'ibm', name: 'IBM' }
        //  ]
        throwErrorIfEmpty(results.rows.length, code);
        const { industry } = results.rows[0];
        const companies = results.rows.map((company) => company.code);
        return res.json({ industry: { industry, companies } });
        // sample return output:
        // {
        //     "industry": {
        //       "industry": "Retail",
        //       "companies": [
        //         "apple",
        //         "ibm"
        //       ]
        //     }
        //  }
    } catch (e) {
        next(e);
    }
});

module.exports = router;
