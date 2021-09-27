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
