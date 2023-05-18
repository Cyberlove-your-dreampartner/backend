process.env.NODE_ENV === "development";

require("dotenv").config();

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon")

const app = require("../app");
const dId = require("../utils/d-id");
const CLOUDINARY = require("../utils/cloudinary");
const jwt = require("jsonwebtoken");

const Partner = require("../models/partner");
const Image = require("../models/image");


describe("POST /partner/generateImage", () => {
  let verifyStub;
  let aggregateStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    aggregateStub = sinon.stub(Image, "aggregate");
  });

  // Restore the stubs after each test
  afterEach(() => {
    verifyStub.restore();
    aggregateStub.restore();
  });

  it("should return an array of 4 images based on the query", async () => {

    verifyStub.returns({ userId: "fakeUserId" });

    // Define the query parameters for the request
    const query = {
      origin: "fakeOrigin",
      hair: "fakeHair",
      hairColor: "fakeHairColor",
      breast: "fakeBreast",
      glasses: "fakeGlasses",
    };

    // Define the sample result from the aggregate query
    const sampleResult = [
      { _id: "image1", imgBase64: "imageBase641" },
      { _id: "image2", imgBase64: "imageBase642" },
      { _id: "image3", imgBase64: "imageBase643" },
      { _id: "image4", imgBase64: "imageBase644" },
    ];

    // Stub the aggregate function to return the sample result
    aggregateStub.resolves(sampleResult);

    // Define the expected response
    const expectedResponse = {
      images: [
        { imageId: "image1", imageBase64: "imageBase641" },
        { imageId: "image2", imageBase64: "imageBase642" },
        { imageId: "image3", imageBase64: "imageBase643" },
        { imageId: "image4", imageBase64: "imageBase644" },
      ],
    };

    // Send a POST request to generate Images
    const response = await request(app)
      .post("/partner/generateImage")
      .set("authorization", "jwtToken")
      .send(query);

    // Perform assertions on the response
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal(expectedResponse);
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnceWithExactly(aggregateStub, [
      { $match: query },
      { $sample: { size: 6 } },
      { $project: { _id: 1, imgBase64: 1 } },
    ]);
  });

  it("should handle errors and return the appropriate response", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    // Stub the aggregate function to return the sample result
    aggregateStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    // Define the query parameters for the request
    const query = {
      origin: "fakeOrigin",
      hair: "fakeHair",
      hairColor: "fakeHairColor",
      breast: "fakeBreast",
      glasses: "fakeGlasses",
    };

    // Send a POST request to generate Images
    const response = await request(app)
      .post("/partner/generateImage")
      .set("authorization", "jwtToken")
      .send(query);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body).to.deep.equal({ message: "CustomError Custom error message" });
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnceWithExactly(aggregateStub, [
      { $match: query },
      { $sample: { size: 6 } },
      { $project: { _id: 1, imgBase64: 1 } },
    ]);
  });
});

describe("POST /partner/characterSetting", () => {
  let verifyStub;
  let findOneStub;
  let saveStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    findOneStub = sinon.stub(Partner, "findOne");
    saveStub = sinon.stub(Partner.prototype, "save");
  });

  // Restore the stubs after each test
  afterEach(() => {
    verifyStub.restore();
    findOneStub.restore();
    saveStub.restore();
  });

  it("should return an error if user has not selected a partner", async () => {

    // Stub the JWT verification to return an empty userId
    verifyStub.returns({ userId: "" });

    const updateData = {
      nickname: "John",
      name: "John Doe",
      MBTI: "INFJ",
      job: "Engineer",
      personality: "Introverted",
    };

    // Send a request without a selected partner
    const response = await request(app)
      .post("/partner/characterSetting")
      .set("authorization", "jwtToken")
      .send(updateData);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("The user has not yet selected a partner");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.notCalled(findOneStub);
    sinon.assert.notCalled(saveStub);
  });

  it("should update partner and return success message", async () => {

    // Stub the JWT verification to return a fake userId
    verifyStub.returns({ _id: "fakeUserId" });

    const updateData = {
      nickname: "John",
      name: "John Doe",
      MBTI: "INFJ",
      job: "Engineer",
      personality: "Introverted",
    };
    // Create a test partner object with empty fields
    const testpartner = new Partner ({
      nickname: "",
      name: "",
      MBTI: "",
      job: "",
      personality: "",
    });

    // Stub the Partner.findOne and Partner.prototype.save methods
    findOneStub.resolves(testpartner);
    saveStub.resolves();

    // Send a request to update the partner
    const response = await request(app)
      .post("/partner/characterSetting")
      .set("authorization", "jwtToken")
      .send(updateData);

    // Perform assertions on the response
    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal("CharacterSetting success");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.calledOnce(saveStub);
    sinon.assert.calledWithExactly(saveStub);
  });

  it("should return an error if an exception is thrown", async () => {

    // Stub the JWT verification to return a fake userId
    verifyStub.returns({ _id: "fakeUserId" });
    const updateData = {
      nickname: "John",
      name: "John Doe",
      MBTI: "INFJ",
      job: "Engineer",
      personality: "Introverted",
    };

    // Simulate a database error by throwing a custom error
    findOneStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    // Send a request to update the partner
    const response = await request(app)
      .post("/partner/characterSetting")
      .set("authorization", "jwtToken")
      .send(updateData);

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(saveStub);
  });
});

describe("POST /partner/", () => {
  let verifyStub;
  let createPartnerStub;
  let findImageStub;
  let createIdleVideoStub;
  let getIdleVideoURLStub;
  let uploadVideoStub;

  // Set up stubs before each test
  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");

    // Stub the save method of the Partner model
    createPartnerStub = sinon.stub(Partner.prototype, "save");

    // Stub the findById method of the Image model
    findImageStub = sinon.stub(Image, "findById");

    // Stub the createIdleVideo function
    createIdleVideoStub = sinon.stub(dId, "createIdleVideo");

    // Stub the getIdleVideoURL function
    getIdleVideoURLStub = sinon.stub(dId, "getIdleVideoURL");

    // Stub the getIdleVideoURL function
    uploadVideoStub = sinon.stub(CLOUDINARY, "uploadVideo");
  });

  // Restore stubs after each test
  afterEach(() => {
    verifyStub.restore();
    createPartnerStub.restore();
    findImageStub.restore();
    createIdleVideoStub.restore();
    getIdleVideoURLStub.restore();
    uploadVideoStub.restore();
  });

  it("should create a partner and return a success message", async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    createPartnerStub.resolves();
    findImageStub.resolves({ videoURL: "" });
    createIdleVideoStub.resolves("fakeVideoId");
    getIdleVideoURLStub.resolves("fakeVideoURL");
    uploadVideoStub.resolves("fakeUploadedVideoURL")
    // Stub the save method of the Image model
    findImageStub.resolves({
      save: sinon.stub().resolves(true)
    });

    // Send a POST request to create a partner
    const response = await request(app)
      .post("/partner/")
      .set("authorization", "jwtToken")
      .send({
        name: "Partner Name",
        imageId: "fakeImageId",
      });

    // Perform assertions on the response
    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal("Partner created");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(createPartnerStub);
    sinon.assert.calledOnce(findImageStub);
    sinon.assert.calledOnce(createIdleVideoStub);
    sinon.assert.calledOnce(getIdleVideoURLStub);
    sinon.assert.calledOnce(uploadVideoStub);
  });

  it("should return an error if an exception is thrown", async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    createPartnerStub.resolves();
    // Simulate a database error by throwing a custom error
    findImageStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    // Send a POST request to create a partner
    const response = await request(app)
      .post("/partner/")
      .set("authorization", "jwtToken")
      .send({
        name: "Partner Name",
        imageId: "fakeImageId",
      });

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(createPartnerStub);
    sinon.assert.calledOnce(findImageStub);
    sinon.assert.notCalled(createIdleVideoStub);
    sinon.assert.notCalled(getIdleVideoURLStub);
    sinon.assert.notCalled(uploadVideoStub);
  });
});