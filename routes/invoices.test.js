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
