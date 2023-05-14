process.env.NODE_ENV === "development";

require("dotenv").config();

const sinon = require("sinon")
const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");
require("../utils/test-setup");
const dId = require("../utils/d-id");


const testUser = {
  username: "testUser",
  password: "testpassword",
  email: "testUser@example.com",
};

const usersForRegister = [
  {
    data: {
      username: "test_1",
      email: "test_1@example.com",
      password: "test_1",
    },
    expectedStatus: 201,
    expectedMessage: "User created",
  },
  {
    data: {
      username: "test_1",
      email: "test_2@example.com",
      password: "test_1",
    },
    expectedStatus: 409,
    expectedMessage: "User already exists",
  },
];


describe("POST /user/register", () => {
  for (let user of usersForRegister) {
    it("should return the expected response if user is created successfully or failed", async () => {
      const res = await request(app).post("/user/register").send(user.data);
      expect(res.status).to.equal(user.expectedStatus);
      expect(res.body.message).to.equal(user.expectedMessage);
    });
  }
});

const usersForLogin = [
  {
    data: {
      username: "wrongTestUser",
      password: "testpassword",
    },
    expectedStatus: 409,
    expectedMessage: "User not found",
  },
  {
    data: {
      username: "testUser",
      password: "wrongtestpassword",
    },
    expectedStatus: 409,
    expectedMessage: "Password incorrect",
  },
];

describe("POST /user/login", () => {
  for (let user of usersForLogin) {
    it("should return the expected response if login failed", async () => {
      const res = await request(app).post("/user/login").send(user.data);
      expect(res.status).to.equal(user.expectedStatus);
      expect(res.body.message).to.equal(user.expectedMessage);
    });
  }

  it("should return 200 and JWT on successful login", async () => {
    const res = await request(app)
      .post("/user/login")
      .send({
        username: testUser.username,
        password: testUser.password
      })
      .set("authorization", jwtTokenForTest);
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property("authorization");
  });
});

const testPartner = {
  name: "testPartner",
};

// describe("POST /user/partner", () => {
//   it("should return 201 and create a partner with idle video URL", async () => {


//     const partner = await Partner.findOne({ name: testPartner.name });
//     const image = await Image.findOne({ imgBase64: partner.imageId });
//     image.videoURL = "test-video-url";
//     await image.save();

//     const getImageStub = sinon.stub(dId, "getIdleVideoURL").resolves({ videoURL: "test-video-url" });

//     const res = await request(app)
//       .post("/user/partner")
//       .send({
//         imageId: "Test_Partner",
//         name: "645201ba7d6edb1ef9314867",
//       });
//     expect(res.status).to.equal(201);
//     expect(res.body.message).to.equal("Partner created");

//     getImageStub.restore();
//   });
// });

