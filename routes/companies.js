const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const { throwErrorIfEmpty } = require("../helpers");
const slugify = require("slugify");

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (e) {
        next(e);
    }
});

//2 separate queries
// router.get("/:code", async (req, res, next) => {
//     try {
//         const { code } = req.params;
//         const companyResults = await db.query(
//             `SELECT * FROM companies WHERE code = $1`,
//             [code]
//         );
//         const invoicesResults = await db.query(
//             "SELECT * FROM invoices WHERE comp_code = $1",
//             [code]
//         );

//         throwErrorIfEmpty(companyResults.rows.length, code);

//         const company = companyResults.rows[0];
//         const invoices = invoicesResults.rows;

//         company.invoices = invoices.map((inv) => inv.id);
//         return res.json({ company: company });
//         //sample output: {
//         //   "company": {
//         //     "code": "apple",
//         //     "name": "Apple Computer",
//         //     "description": "Maker of OSX.",
//         //     "invoices": [
//         //       1,
//         //       2,
//         //       3
//         //     ]
//         //   }
//         // }
//     } catch (e) {
//         next(e);
//     }
// });

// try with LEFT JOIN - one query
router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const joinInvoiceResults = await db.query(
            `SELECT c.code, c.name, c.description, i.id
            FROM companies AS c 
            LEFT JOIN invoices AS i
            ON c.code = i.comp_code
            WHERE c.code=$1`,
            [code]
        );
        // sample joinInvoiceResults.rows data:
        // [
        // {
        //     "code": "apple",
        //     "name": "Apple Computer",
        //     "description": "Maker of OSX.",
        //     "id": 1
        //   },
        //   {
        //     "code": "apple",
        //     "name": "Apple Computer",
        //     "description": "Maker of OSX.",
        //     "id": 2
        //   },
        //   {
        //     "code": "apple",
        //     "name": "Apple Computer",
        //     "description": "Maker of OSX.",
        //     "id": 3
        //   }
        // ]
        throwErrorIfEmpty(joinInvoiceResults.rows.length, code);
        const { name, description } = joinInvoiceResults.rows[0];
        const invoices = joinInvoiceResults.rows.map((invoice) => invoice.id);

        // for Many-to-Many join
        const companiesIndustriesResults = await db.query(
            `SELECT c.code, c.name, c.description, i.industry FROM companies AS c
            LEFT JOIN industries_companies AS ic
            ON c.code = ic.comp_code
            LEFT JOIN industries AS i
            ON ic.industry_code = i.code
            WHERE c.code=$1`,
            [code]
        );

        // sample data companiesIndustriesResults.rows:
        // [
        //     {
        //       code: 'apple',
        //       name: 'Apple Computer',
        //       description: 'Maker of OSX.',
        //       industry: 'Technology'
        //     },
        //     {
        //       code: 'apple',
        //       name: 'Apple Computer',
        //       description: 'Maker of OSX.',
        //       industry: 'Artificial intelligence'
        //     },
        //     {
        //       code: 'apple',
        //       name: 'Apple Computer',
        //       description: 'Maker of OSX.',
        //       industry: 'Media'
        //     },
        //     {
        //       code: 'apple',
        //       name: 'Apple Computer',
        //       description: 'Maker of OSX.',
        //       industry: 'Retail'
        //     }
        //   ]

        const industries = companiesIndustriesResults.rows.map(
            (industry) => industry.industry
        );
        return res.json({
            company: { code, name, invoices, description, industries },
        });
        // sample return output:
        // {
        //     "company": {
        //       "code": "apple",
        //       "name": "Apple Computer",
        //       "invoices": [
        //         1,
        //         2,
        //         3
        //       ],
        //       "industries": [
        //         "Technology",
        //         "Artificial intelligence",
        //         "Media",
        //         "Retail"
        //       ]
        //     }
        //   }
    } catch (e) {
        next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) RETURNING code, name, description`,
            [
                slugify(name, {
                    replacement: "-",
                    lower: true,
                }),
                name,
                description,
            ]
        );
        return res.status(201).json({ companies: results.rows[0] });
    } catch (e) {
        next(e);
    }
});

router.put("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const { name, description } = req.body;
        const results = await db.query(
            `UPDATE companies SET name=$1, description=$2 WHERE code=$3 RETURNING code, name, description`,
            [name, description, code]
        );
        throwErrorIfEmpty(results.rows.length, code);

        return res.status(201).json({ companies: results.rows[0] });
    } catch (e) {
        next(e);
    }
});

router.delete("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const results = await db.query(
            "DELETE FROM companies WHERE code=$1 RETURNING code, name, description",
            [code]
        );
        console.log(results);
        throwErrorIfEmpty(results.rows.length, code);

        return res.send({ msg: "Deleted" });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
