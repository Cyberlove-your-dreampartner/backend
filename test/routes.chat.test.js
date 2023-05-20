process.env.NODE_ENV === "development";

const Partner = require("../models/partner");
const Image = require("../models/image");
const Chat = require("../models/chat");

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const app = require("../app");
const jwt = require("jsonwebtoken");

const OPENAI = require("../utils/openai");
const DID = require("../utils/d-id");

describe("GET /chat/imageURL", () => {
  let verifyStub;
  let findOneStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    findOneStub = sinon.stub(Partner, "findOne");
  });

  afterEach(() => {
    verifyStub.restore();
    findOneStub.restore();
  });

  it("should return the image URL if the partner exists", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate partner exists
    findOneStub.resolves({imageId: "fakeImageId" });
    // Simulate image exists
    sinon.stub(Image, "findOne").resolves({ imgURL: "fakeImgURL" });

    // Send a GET request to get imageURL
    const response = await request(app)
      .get("/chat/imageURL")
      .set("authorization", "jwtToken")
      .send();

    // Perform assertions on the response
    expect(response.status).to.equal(200);
    expect(response.body.imgURL).to.equal("fakeImgURL");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findOneStub);
  });

  it("should return an error if the partner does not exist", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate partner does not exist
    findOneStub.resolves(null);

    // Send a GET request to get imageURL
    const response = await request(app)
      .get("/chat/imageURL")
      .set("authorization", "jwtToken")
      .send();

    // Perform assertions on the response
    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal("Partner not found");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findOneStub);
  });

  it("should return an internal server error if an exception is thrown", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate database error if an exception is thrown
    findOneStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    // Send a GET request to get imageURL
    const response = await request(app)
      .get("/chat/imageURL")
      .set("authorization", "jwtToken")
      .send();

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findOneStub);
  });
});



describe("POST /chat/replyMessage", () => {
  let verifyStub;
  let findOneStub;
  let saveStub;
  let insertMessageStub;
  let getReplyStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    findOneStub = sinon.stub(Chat, "findOne");
    saveStub = sinon.stub(Chat.prototype, "save");
    insertMessageStub = sinon.stub(Chat.prototype, "insertMessage");
    // Stub the getReplyStub function
    getReplyStub = sinon.stub(OPENAI, "getReply");
  });

  afterEach(() => {
    verifyStub.restore();
    findOneStub.restore();
    saveStub.restore();
    insertMessageStub.restore();
    getReplyStub.restore();
  });

  it("should reply to a user message and return the script and config", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    // Simulate chat does not exist
    findOneStub.resolves(null);
    // Simulate successful save
    saveStub.resolves();
    // Simulate successful insert message
    insertMessageStub.resolves();
    // Simulate successful get reply
    getReplyStub.resolves({ role: 'system', content: 'Reply message' });


    // Send a POST request to reply Message
    const response = await request(app)
      .post("/chat/replyMessage")
      .set("authorization", "jwtToken")
      .send({ message: 'fakeMessage' });

    // Perform assertions on the response
    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({
      script: {
        type: "text",
        input: "Reply message",
        ssml: true,
        provider: {
          type: "microsoft",
          voice_id: "zh-TW-HsiaoChenNeural",
        },
      },
      config: {
        stitch: true,
      },
    });
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.calledOnce(saveStub);
    sinon.assert.calledTwice(insertMessageStub);
    sinon.assert.calledOnce(getReplyStub);
  });

  it("should return an error if an exception is thrown", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate database error if an exception is thrown
    findOneStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    // Send a POST request to reply Message
    const response = await request(app)
      .post("/chat/replyMessage")
      .set("authorization", "jwtToken")
      .send({ message: 'fakeMessage' });

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findOneStub);
    sinon.assert.notCalled(saveStub);
    sinon.assert.notCalled(insertMessageStub);
    sinon.assert.notCalled(getReplyStub);
  });
});



// describe("GET /chat/idlevideo", () => {

//   it("should return 404 if partner is not found", async () => {

//     sinon.stub(Partner, "findOne").resolves(null);
//     const res = await request(app)
//       .get("/chat/idleVideo")
//       .set("authorization", jwtTokenForTest);

//     expect(res.status).to.equal(404);
//     expect(res.body.message).to.equal("Partner not found");

//     sinon.restore();
//   });


//   it("should return a video URL", async () => {

//     await request(app)
//       .post("/partner/create")
//       .send({"name": testPartner.name})
//       .set("authorization", jwtTokenForTest);

//     const partner = await Partner.findOne({ name: testPartner.name });
//     const image = await Image.findOne({ imgBase64: partner.imageId });
//     image.videoURL = "test-video-url";
//     await image.save();

//     const res = await request(app)
//       .get("/chat/idleVideo")
//       .set("authorization", jwtTokenForTest);
//       console.log("res",res);
//       expect(res.status).to.equal(200);
//       expect(res.body).to.have.property("videoURL", "test-video-url");

//     await Partner.findOneAndDelete({ name: testPartner.name });
//     await Image.findOneAndDelete({ imgBase64: partner.imageId });

//   });

// });