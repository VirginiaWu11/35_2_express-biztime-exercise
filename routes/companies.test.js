process.env.NODE_ENV = "test";

const require = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async () => {
    const result = await db.query(
        `INSERT INTO companies (code, name, description) VALUES ('google', 'Google') RETURNING  code, name, description`
    );
    testCompany = result.rows[0];
});

afterEach(async () => {
    await db.query(`DELETE FROM companies`);
});

afterAll(async () => {
    await db.end(); // sever the connection with the database
});
