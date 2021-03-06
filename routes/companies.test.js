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

describe("GET /companies", () => {
    test("Get a list with two companies", async () => {
        const res = await request(app).get("/companies");
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({
            companies: [
                {
                    code: "apple",
                    name: "Apple",
                    description: "Maker of OSX.",
                },
                {
                    code: "ibm",
                    name: "IBM",
                    description: "Big blue.",
                },
            ],
        });
    });
});

describe("GET /companies/:code", function () {
    test("It return company info", async function () {
        const response = await request(app).get("/companies/apple");

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            company: {
                code: "apple",
                name: "Apple",
                description: "Maker of OSX.",
                invoices: [1, 2],
                industries: [null],
            },
        });
    });

    test("It should return 404 for no-such-company", async function () {
        const response = await request(app).get("/companies/blargh");
        expect(response.status).toEqual(404);
    });
});

describe("POST /companies", function () {
    test("It should add company", async function () {
        const response = await request(app)
            .post("/companies")
            .send({ name: "TacoTime", description: "Yum!" });

        expect(response.body).toEqual({
            company: {
                code: "tacotime",
                name: "TacoTime",
                description: "Yum!",
            },
        });
    });

    test("It should return 500 for conflict", async function () {
        const response = await request(app)
            .post("/companies")
            .send({ name: "Apple", description: "Huh?" });

        expect(response.status).toEqual(500);
    });
});

describe("PUT /companies/:code", function () {
    test("It should update company", async function () {
        const response = await request(app)
            .put("/companies/apple")
            .send({ name: "AppleEdit", description: "NewDescrip" });

        expect(response.body).toEqual({
            company: {
                code: "apple",
                name: "AppleEdit",
                description: "NewDescrip",
            },
        });
    });

    test("It should return 404 for no-such-comp", async function () {
        const response = await request(app)
            .put("/companies/blargh")
            .send({ name: "Blargh" });

        expect(response.status).toEqual(404);
    });

    test("It should return 500 for missing data", async function () {
        const response = await request(app).put("/companies/apple").send({});

        expect(response.status).toEqual(500);
    });
});

describe("DELETE /companies", function () {
    test("It should delete company", async function () {
        const response = await request(app).delete("/companies/apple");

        expect(response.body).toEqual({ status: "deleted" });
    });

    test("It should return 404 for no-such-comp", async function () {
        const response = await request(app).delete("/companies/blargh");

        expect(response.status).toEqual(404);
    });
});
