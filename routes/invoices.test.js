process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");
const { createData, deleteData } = require("../_test-common");

beforeEach(createData);

afterEach(deleteData);

afterAll(async () => {
    await db.end(); // sever the connection with the database
});

describe("GET /", function () {
    test("It should respond with array of invoices", async function () {
        const response = await request(app).get("/invoices");
        expect(response.body).toEqual({
            invoices: [
                {
                    id: 1,
                    comp_code: "apple",
                    amt: 100,
                    add_date: expect.any(String),
                    paid: false,
                    paid_date: null,
                },
                {
                    id: 2,
                    comp_code: "apple",
                    amt: 200,
                    add_date: expect.any(String),
                    paid: true,
                    paid_date: expect.any(String),
                },
                {
                    id: 3,
                    comp_code: "ibm",
                    amt: 300,
                    add_date: expect.any(String),
                    paid: false,
                    paid_date: null,
                },
            ],
        });
    });
});

describe("GET /1", function () {
    test("It return invoice info", async function () {
        const response = await request(app).get("/invoices/1");
        expect(response.body).toEqual({
            invoice: [
                {
                    id: 1,
                    amt: 100,
                    add_date: "2018-01-01T05:00:00.000Z",
                    paid: false,
                    paid_date: null,
                    comp_code: "apple",
                },
            ],
        });
    });

    test("It should return 404 for no-such-invoice", async function () {
        const response = await request(app).get("/invoices/999");
        expect(response.status).toEqual(404);
    });
});

describe("POST /", function () {
    test("It should add invoice", async function () {
        const response = await request(app)
            .post("/invoices")
            .send({ amt: 400, comp_code: "ibm" });

        expect(response.body).toEqual({
            invoice: {
                id: 4,
                comp_code: "ibm",
                amt: 400,
                add_date: expect.any(String),
                paid: false,
                paid_date: null,
            },
        });
    });
});

describe("PUT /", function () {
    test("It should update an invoice", async function () {
        const response = await request(app)
            .put("/invoices/1")
            .send({ amt: 1000, paid: false });

        expect(response.body).toEqual({
            invoice: {
                id: 1,
                comp_code: "apple",
                paid: false,
                amt: 1000,
                add_date: expect.any(String),
                paid_date: null,
            },
        });
    });

    test("It should return 404 for no-such-invoice", async function () {
        const response = await request(app)
            .put("/invoices/9999")
            .send({ amt: 1000 });

        expect(response.status).toEqual(404);
    });

    test("It should return 500 for missing data", async function () {
        const response = await request(app).put("/invoices/1").send({});

        expect(response.status).toEqual(500);
    });
});

describe("DELETE /", function () {
    test("It should delete invoice", async function () {
        const response = await request(app).delete("/invoices/1");

        expect(response.body).toEqual({ status: "deleted" });
    });

    test("It should return 404 for no-such-invoices", async function () {
        const response = await request(app).delete("/invoices/999");

        expect(response.status).toEqual(404);
    });
});
