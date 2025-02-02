import { jest } from "@jest/globals"; // eslint-disable-line import/no-extraneous-dependencies
import connector from "#models/databaseUtil"; // Update this import
import infrastructureModel from "#models/infrastructure"; // Update this import

jest.mock("#util");
const { agent } = global;

function cleanUp(callback) {
  infrastructureModel
    .remove({
      name: "Building A",
      type: "Office",
      wing: "East",
      floor: 3,
      capacity: 100,
    })
    .then(() => {
      connector.disconnect((DBerr) => {
        if (DBerr) console.log("Database disconnect error: ", DBerr);
        callback();
      });
    });
}

afterAll((done) => {
  cleanUp(done);
});

describe("Infrastructure API", () => {
  it("should create infrastructure", async () => {
    const response = await agent.post("/infrastructure/add").send({
      name: "Building A",
      type: "Office",
      wing: "East",
      floor: 3,
      capacity: 100,
    });

    expect(response.status).toBe(200);
    expect(response.body.res).toMatch(/added infrastructure/);
  });

  describe("after adding infrastructure", () => {
    let id;
    beforeEach(async () => {
      id = await agent.post("/infrastructure/add").send({
        name: "Building A",
        type: "Office",
        wing: "East",
        floor: 3,
        capacity: 100,
      });
      id = JSON.parse(id.res.text).id;
    });

    afterEach(async () => {
      await infrastructureModel.remove({
        name: "Building A",
        type: "Office",
        wing: "East",
        floor: 3,
        capacity: 100,
      });
    });

    it("should read infrastructure", async () => {
      const response = await agent
        .get("/infrastructure/list")
        .send({ name: "Building A" });
      expect(response.status).toBe(200);
      expect(response.body.res).toBeDefined();
    });

    it("should update infrastructure", async () => {
      const response = await agent
        .post(`/infrastructure/update/${id}`)
        .send({ name: "Building A" }, { capacity: 150 });

      expect(response.status).toBe(200);
      expect(response.body.res).toMatch(/updated infrastructure/);
    });
  });
});
