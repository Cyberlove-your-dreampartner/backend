process.env.NODE_ENV === "development";

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon")

const app = require("../app");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Partner = require("../models/partner");

describe("POST /user/register", () => {

  let findOneStub;
  let saveStub;

  beforeEach(() => {
    findOneStub = sinon.stub(User, "findOne");
    saveStub = sinon.stub(User.prototype, "save");
  });

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

    findOneStub.resolves(null); // Simulate user does not exist
    saveStub.resolves(); // Simulate successful save

    const response = await request(app)
      .post("/user/register")
      .send(userData);

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal("User created");

    sinon.assert.calledOnce(findOneStub);
    sinon.assert.calledOnce(saveStub);
  });

  it("should return an error if user already exists", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "password",
    };

    findOneStub.resolves({ username: "testuser" }); // Simulate user already exists

    const response = await request(app)
      .post("/user/register")
      .send(userData);

    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("User already exists");

    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(saveStub);
  });

  it('should return err.name + err.message if err.name is not empty', async () => {
    const userData = {
      username: 'testuser',
      email: 'testuser@example.com',
      password: 'testpassword',
    };

    findOneStub.throws({
      name: 'CustomError',
      message: 'Custom error message',
    });

    const response = await request(app)
      .post('/user/register')
      .send(userData);

    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal('CustomError Custom error message');

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

    sinon.assert.calledOnce(findOneStub);
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
    sinon.assert.calledOnce(findOneStub);
  });

  it("should return an error if an exception is thrown", async () => {
    // Prepare test data
    const userData = {
      username: "testuser",
      password: "password",
    };

    // Simulate a database error
    findOneStub.throws({
      name: 'CustomError',
      message: 'Custom error message',
    });

    // Send a request to the login endpoint
    const response = await request(app)
      .post("/user/login")
      .send(userData);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal('CustomError Custom error message');

    sinon.assert.calledOnce(findOneStub);
  });
});

describe('Get /user/status', () => {
  let verifyStub;

  // Set up stubs before each test
  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
  });

  // Restore stubs after each test
  afterEach(() => {
    verifyStub.restore();
    sinon.restore();
  });

  it('should return user status as false if no partner exists', async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    // Stub Partner.findOne to return null (no partner exists)
    const findOneStub = sinon.stub(Partner, 'findOne').resolves(null);

    const response = await request(app)
      .get('/user/status')
      .set('Authorization', 'jwtToken');

    expect(response.status).to.equal(200);
    expect(response.body.userInfo.status).to.equal(false);

    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findOneStub);
  });
});