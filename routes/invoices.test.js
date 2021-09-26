process.env.NODE_ENV = "test";

const require = require("supertest");
const app = require("../app");
const db = require("../db");
