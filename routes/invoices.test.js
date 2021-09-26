process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;
let testCompany;
beforeEach(async () => {
    const companyResult = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('google', 'Google', 'search engine') RETURNING  code, name, description`
    );
    const invoiceResult = await db.query(
        `INSERT INTO invoices (comp_code, amt) VALUES ('google', '999') RETURNING  id, comp_code`
    );
    testInvoice = invoiceResult.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM invoices`);
});

afterAll(async () => {
    await db.end();
});

describe("GET /invoices", () => {
    test("Get a list with one invoice", async () => {
        const res = await request(app).get("/invoices");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ invoices: [testInvoice] });
    });
});
