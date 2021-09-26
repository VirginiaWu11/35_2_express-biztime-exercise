const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const db = require("../db");
const { throwErrorIfEmpty } = require("../helpers");

module.exports = router;

router.get("/", async (req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`);
        return res.json({ companies: results.rows });
    } catch (e) {
        next(e);
    }
});

router.get("/:code", async (req, res, next) => {
    try {
        const { code } = req.params;
        const companyResults = await db.query(
            `SELECT * FROM companies WHERE code = $1`,
            [code]
        );
        const invoicesResults = await db.query(
            "SELECT * FROM invoices WHERE comp_code = $1",
            [code]
        );

        throwErrorIfEmpty(companyResults.rows.length, code);

        const company = companyResults.rows[0];
        const invoices = invoicesResults.rows;

        company.invoices = invoices.map((inv) => inv.id);
        return res.json({ company: company });
    } catch (e) {
        next(e);
    }
});

router.post("/", async (req, res, next) => {
    try {
        const { code, name, description } = req.body;
        const results = await db.query(
            `INSERT INTO companies (code, name, description) VALUES ($1,$2,$3) RETURNING code, name, description`,
            [code, name, description]
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
