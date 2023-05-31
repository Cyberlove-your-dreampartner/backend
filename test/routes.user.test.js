process.env.NODE_ENV === "development";

const User = require("../models/user");
const Partner = require("../models/partner");
const Chat = require("../models/chat");

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon")

const app = require("../app");
const jwt = require("jsonwebtoken");

describe("POST /user/register", () => {
  let findOneStub;
  let saveStub;

  beforeEach(() => {
    findOneStub = sinon.stub(User, "findOne");
    saveStub = sinon.stub(User.prototype, "save");
  });

  // Restore the stubs after each test
  afterEach(() => {
    findOneStub.restore();
    saveStub.restore();
  });

  it("should create a new user if user does not exist", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password",
    };

    // Simulate user does not exist
    findOneStub.resolves(null);
    // Simulate successful save
    saveStub.resolves();

    // Send a POST request to register User
    const response = await request(app)
      .post("/user/register")
      .send(userData);

    // Perform assertions on the response
    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal("User created");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.calledOnce(saveStub);
  });

  it("should return an error if user already exists", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password",
    };

    // Simulate user already exists
    findOneStub.resolves({ username: "testuser" });

    // Send a POST request to register User
    const response = await request(app)
      .post("/user/register")
      .send(userData);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("User already exists");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(saveStub);
  });

  it("should return err.name + err.message if err.name is not empty", async () => {
    const userData = {
      username: "testuser",
      email: "testuser@example.com",
      password: "testpassword",
    };

    findOneStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    // Send a POST request to register User
    const response = await request(app)
      .post("/user/register")
      .send(userData);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(saveStub);
  });
});

describe("POST /user/login", () => {
  let findOneStub;
  let signStub;

  // Set up stubs before each test
  beforeEach(() => {
    findOneStub = sinon.stub(User, "findOne");
    signStub = sinon.stub(jwt, "sign");
  });

  // Restore stubs after each test
  afterEach(() => {
    findOneStub.restore();
    signStub.restore();
  });

  it("should generate a JWT token for a valid login", async () => {
    const userData = {
      username: "testuser",
      password: "password",
    };

    // Simulate user found
    findOneStub.resolves({ username: "testuser" });

    // Stub checkPassword method to always resolve to true
    findOneStub.resolves({
      checkPassword: sinon.stub().resolves(true)
    });

    // Stub the sign method to return a fake token
    signStub.returns("fakeToken");

    // Send a request to the login endpoint
    const response = await request(app)
      .post("/user/login")
      .send(userData);

    // Perform assertions on the response
    expect(response.status).to.equal(200);
    expect(response.body).to.have.property("authorization");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.calledOnce(signStub);
  });
  it("should return an error if the user is not found", async () => {
    // Prepare test data
    const userData = {
      username: "testuser",
      password: "password",
    };

    // Simulate user not found
    findOneStub.resolves(null);

    // Send a request to the login endpoint
    const response = await request(app)
      .post("/user/login")
      .send(userData);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("User not found");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(signStub);
  });

  it("should return an error if the password is incorrect", async () => {
    // Prepare test data
    const userData = {
      username: "testuser",
      password: "password",
    };

    // Simulate user found
    findOneStub.resolves({ username: "testuser" });

    // Stub checkPassword method to always resolve to false
    findOneStub.resolves({
      checkPassword: sinon.stub().resolves(false)
    });

    // Send a request to the login endpoint
    const response = await request(app)
      .post("/user/login")
      .send(userData);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("Password incorrect");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(signStub);
  });

  it("should return an error if an exception is thrown", async () => {
    // Prepare test data
    const userData = {
      username: "testuser",
      password: "password",
    };

    // Simulate a database error
    findOneStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    // Send a request to the login endpoint
    const response = await request(app)
      .post("/user/login")
      .send(userData);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(signStub);
  });
});

describe("Get /user/status", () => {
  let verifyStub;
  let findPartnerStub;
  let findChatStub;

  // Set up stubs before each test
  beforeEach(() => {
    // Remove the existing stubs or wraps before creating new ones
    sinon.restore();
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    // Stub the findOne method of the Partner model
    findPartnerStub = sinon.stub(Partner, "findOne")
    // Stub the findOne method of the Chat model
    findChatStub = sinon.stub(Chat, "findOne")
  });

  // Restore stubs after each test
  afterEach(() => {
    verifyStub.restore();
    findPartnerStub.restore();
    findChatStub.restore();
  });

  it("should return the user status with hasPartner as false if partner is not found and with hasCharacterSetting as false if chatSystemPrompt is not found", async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    // Stub Partner.findOne to return null (no partner exists)
    findPartnerStub.resolves(null);
    findChatStub.resolves();

    const response = await request(app)
      .get("/user/status")
      .set("authorization", "jwtToken");

    // Perform assertions on the response
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      userStatus: {
        hasPartner: false,
        hasCharacterSetting: false,
      },
    });
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findPartnerStub);
    sinon.assert.calledOnce(findChatStub);
  });

  it("should return the user status with hasPartner as true if partner is found and with hasCharacterSetting as false if chatSystemPrompt is not found", async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    // Stub Partner.findOne to return a partner
    findPartnerStub.resolves({ userId: "fakeUserId" });
    findChatStub.resolves();

    const response = await request(app)
      .get("/user/status")
      .set("authorization", "jwtToken");

    // Perform assertions on the response
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      userStatus: {
        hasPartner: true,
        hasCharacterSetting: false,
      },
    });
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findPartnerStub);
    sinon.assert.calledOnce(findChatStub);
  });

  it("should return the user status with hasPartner as false if partner is not found and with hasCharacterSetting as false if chatSystemPrompt is not found", async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    // Stub Partner.findOne to return a partner
    findPartnerStub.resolves({ userId: "fakeUserId" });
    findChatStub.resolves({ userId: "fakeUserId" });

    const response = await request(app)
      .get("/user/status")
      .set("authorization", "jwtToken");

    // Perform assertions on the response
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      userStatus: {
        hasPartner: true,
        hasCharacterSetting: true,
      },
    });
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findPartnerStub);
    sinon.assert.calledOnce(findChatStub);
  });

  it("should return the user status with hasPartner as false if partner is not found and with hasCharacterSetting as false if chatSystemPrompt is not found", async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    // Stub Partner.findOne to return null (no partner exists)
    findPartnerStub.resolves(null);
    findChatStub.resolves({ userId: "fakeUserId" });

    const response = await request(app)
      .get("/user/status")
      .set("authorization", "jwtToken");

    // Perform assertions on the response
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      userStatus: {
        hasPartner: false,
        hasCharacterSetting: true,
      },
    });
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findPartnerStub);
    sinon.assert.calledOnce(findChatStub);
  });
});