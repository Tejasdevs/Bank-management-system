import request from "supertest";
import app from "../src/app.js";

describe("Auth endpoints", () => {
  it("GET / should return running", async () => {
    const res = await request(app).get("/");
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBeDefined();
  });
});
