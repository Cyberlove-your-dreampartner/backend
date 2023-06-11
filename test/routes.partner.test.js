process.env.NODE_ENV === "development";

const Partner = require("../models/partner");
const Image = require("../models/image");

require("dotenv").config();

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon")

const app = require("../app");
const jwt = require("jsonwebtoken");

const IMGUR = require("../utils/imgur");
const ADDPARTNER = require("../utils/addpartner");


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
  let saveImageStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    findOneStub = sinon.stub(Partner, "findOne");
    saveImageStub = sinon.stub(Partner.prototype, "save");
  });

  // Restore the stubs after each test
  afterEach(() => {
    verifyStub.restore();
    findOneStub.restore();
    saveImageStub.restore();
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
    sinon.assert.notCalled(saveImageStub);
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
    saveImageStub.resolves();

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
    sinon.assert.calledOnce(saveImageStub);
    sinon.assert.calledWithExactly(saveImageStub);
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
    sinon.assert.notCalled(saveImageStub);
  });
});

describe("POST /partner/", () => {
  let verifyStub;
  let addPartnerStub;


  // Set up stubs before each test
  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    addPartnerStub = sinon.stub(ADDPARTNER, 'addPartner');
  });

  // Restore stubs after each test
  afterEach(() => {
    verifyStub.restore();
    addPartnerStub.restore();
  });

  it("should create a partner and return a success message", async () => {

    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate successful partner creation
    addPartnerStub.resolves();

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
    sinon.assert.calledOnce(addPartnerStub);
  });

  it("should return an error if an exception is thrown", async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    addPartnerStub.throws({
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
    sinon.assert.calledOnce(addPartnerStub);
  });
});

describe("POST /partner/image", () => {
  let verifyStub;
  let uploadImgStub;
  let saveImageStub;
  let addPartnerStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    uploadImgStub = sinon.stub(IMGUR, "uploadImg");
    saveImageStub = sinon.stub(Image.prototype, "save");
    addPartnerStub = sinon.stub(ADDPARTNER, 'addPartner');
  });

  afterEach(() => {
    verifyStub.restore();
    uploadImgStub.restore();
    saveImageStub.restore();
    addPartnerStub.restore();
  });

  it("should upload an image and create a new record in the database", async () => {

    verifyStub.returns({ userId: "fakeUserId" });
    uploadImgStub.resolves("fakeImgURL");
    saveImageStub.resolves();
    addPartnerStub.resolves();

    const response = await request(app)
      .post("/partner/image")
      .set("authorization", "jwtToken")
      .send({
        imageBase64: "base64EncodedImage",
      });

    expect(response.status).to.equal(201);
    expect(response.body.message).to.equal("Image created");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(uploadImgStub);
    sinon.assert.calledOnce(saveImageStub);
    sinon.assert.calledOnce(addPartnerStub);
  });

  it("should handle errors during image upload", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    // Simulate image upload error
    uploadImgStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    const response = await request(app)
      .post("/partner/image")
      .set("authorization", "jwtToken")
      .send({
        imageBase64: "base64EncodedImage",
      });

    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(uploadImgStub);
    sinon.assert.notCalled(saveImageStub);
    sinon.assert.notCalled(addPartnerStub);
  });
});