process.env.NODE_ENV === "development";

const Partner = require("../models/partner");
const Image = require("../models/image");
const Chat = require("../models/chat");

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon");

const app = require("../app");
const jwt = require("jsonwebtoken");

const OPENAI = require("../utils/openai");
const DID = require("../utils/d-id");

describe("GET /chat/imageURL", () => {
  let verifyStub;
  let findPartnerStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    findPartnerStub = sinon.stub(Partner, "findOne");
  });

  afterEach(() => {
    verifyStub.restore();
    findPartnerStub.restore();
  });

  it("should return the image URL if the partner exists", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate partner exists
    findPartnerStub.resolves({imageId: "fakeImageId" });
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
    sinon.assert.calledOnce(findPartnerStub);
  });

  it("should return an error if the partner does not exist", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate partner does not exist
    findPartnerStub.resolves(null);

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
    sinon.assert.calledOnce(findPartnerStub);
  });

  it("should return an internal server error if an exception is thrown", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate database error if an exception is thrown
    findPartnerStub.throws({
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
    sinon.assert.calledOnce(findPartnerStub);
  });
});



describe("POST /chat/replyMessage", () => {
  let verifyStub;
  let findChatStub;
  let saveChatStub;
  let insertMessageStub;
  let getReplyStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    findChatStub = sinon.stub(Chat, "findOne");
    saveChatStub = sinon.stub(Chat.prototype, "save");
    insertMessageStub = sinon.stub(Chat.prototype, "insertMessage");
    // Stub the getReplyStub function
    getReplyStub = sinon.stub(OPENAI, "getReply");
  });

  afterEach(() => {
    verifyStub.restore();
    findChatStub.restore();
    saveChatStub.restore();
    insertMessageStub.restore();
    getReplyStub.restore();
  });

  it("should reply to a user message and return the script and config", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    // Simulate chat does not exist
    findChatStub.resolves(null);
    // Simulate successful save
    saveChatStub.resolves();
    // Simulate successful insert message
    insertMessageStub.resolves();
    // Simulate successful get reply
    getReplyStub.resolves({ role: "system", content: "Reply message" });


    // Send a POST request to reply Message
    const response = await request(app)
      .post("/chat/replyMessage")
      .set("authorization", "jwtToken")
      .send({ message: "fakeMessage" });

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
    sinon.assert.calledOnce(findChatStub);
    sinon.assert.calledOnce(saveChatStub);
    sinon.assert.calledTwice(insertMessageStub);
    sinon.assert.calledOnce(getReplyStub);
  });

  it("should return an error if an exception is thrown", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate database error if an exception is thrown
    findChatStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    // Send a POST request to reply Message
    const response = await request(app)
      .post("/chat/replyMessage")
      .set("authorization", "jwtToken")
      .send({ message: "fakeMessage" });

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findChatStub);
    sinon.assert.notCalled(saveChatStub);
    sinon.assert.notCalled(insertMessageStub);
    sinon.assert.notCalled(getReplyStub);
  });
});



describe("GET /chat/idlevideo", () => {
  let verifyStub;
  let findPartnerStub;
  let findImageStub;
  let getIdleVideoURLStub;

  beforeEach(() => {
    // Remove the existing stubs or wraps before creating new ones
    sinon.restore();
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    findPartnerStub = sinon.stub(Partner, "findOne");
    findImageStub = sinon.stub(Image, "findOne");
    getIdleVideoURLStub = sinon.stub(DID, "getIdleVideoURL");
  });

  afterEach(() => {
    verifyStub.restore();
    findPartnerStub.restore();
    findImageStub.restore();
    getIdleVideoURLStub.restore();
  });

  it("should return an error if the partner is not found", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    findPartnerStub.resolves(null);

    const response = await request(app)
      .get("/chat/idlevideo")
      .set("authorization", "jwtToken")
      .send();

    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal("Partner not found");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findPartnerStub);
    sinon.assert.notCalled(findImageStub);
    sinon.assert.notCalled(getIdleVideoURLStub);
  });

  it("should return an error if image is not found", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    findPartnerStub.resolves({ imageId: "fakeImageId" });
    findImageStub.resolves(null);

    const response = await request(app)
      .get("/chat/idlevideo")
      .set("authorization", "jwtToken")
      .send();

    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal("You haven't chosen partner yet");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findPartnerStub);
    sinon.assert.calledOnce(findImageStub);
    sinon.assert.notCalled(getIdleVideoURLStub);
  });


  it("should get the idle video URL of the partner", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    findPartnerStub.resolves({ imageId: "fakeImageId" });
    findImageStub.resolves({ videoURL: null, videoId: "fakeVideoId" });
    getIdleVideoURLStub.resolves({ videoURL: "fakeVideoURL"})
    // Stub the save method of the Image model
    findImageStub.resolves({
      save: sinon.stub().resolves(true)
    });

    const response = await request(app)
      .get("/chat/idlevideo")
      .set("authorization", "jwtToken")
      .send();

    expect(response.status).to.equal(200);
    expect(response.body.videoURL.videoURL).to.equal("fakeVideoURL");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findPartnerStub);
    sinon.assert.calledOnce(findImageStub);
    sinon.assert.calledOnce(getIdleVideoURLStub);
  });

  it("should return an error if an exception is thrown", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    // Simulate database error if an exception is thrown
    findPartnerStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    const response = await request(app)
      .get("/chat/idlevideo")
      .set("authorization", "jwtToken")
      .send();

    // Perform assertions on the response
    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findPartnerStub);
    sinon.assert.notCalled(findImageStub);
    sinon.assert.notCalled(getIdleVideoURLStub);
  });
});

describe("getChatHistory", () => {
  let verifyStub;
  let findChatStub;

  beforeEach(() => {
    // Stub the JWT verification function
    verifyStub = sinon.stub(jwt, "verify");
    findChatStub = sinon.stub(Chat, "findOne");
  });

  afterEach(() => {
    verifyStub.restore();
    findChatStub.restore();
  });

  it("should return an error if chat is not found", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    // Simulate chat not found
    findChatStub.resolves(null);

    const response = await request(app)
      .get("/chat/chatHistory")
      .set("authorization", "jwtToken");

    expect(response.status).to.equal(404);
    expect(response.body.message).to.equal("Partner not found");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findChatStub);
  });

  it("should get the chat history of the user", async () => {
    verifyStub.returns({ userId: "fakeUserId" });

    const chat = {
      userId: "fakeUserId",
      messages: [
        { role: "user", content: "Hello" },
        { role: "bot", content: "Hi there" },
      ],
    };

    findChatStub.resolves(chat); // Simulate chat found

    const response = await request(app)
      .get("/chat/chatHistory")
      .set("authorization", "jwtToken");

    expect(response.status).to.equal(200);
    expect(response.body).to.deep.equal({ chatHistory: chat.messages });
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findChatStub);
  });

  it("should return an error if an exception is thrown", async () => {
    verifyStub.returns({ userId: "fakeUserId" });
    // Simulate database error if an exception is thrown
    findChatStub.throws({
      name: "CustomError",
      message: "Custom error message",
    });

    const response = await request(app)
      .get("/chat/chatHistory")
      .set("authorization", "jwtToken");

    expect(response.status).to.equal(409);
    expect(response.body.message).to.equal("CustomError Custom error message");
    // Verify the function calls and stub invocations
    sinon.assert.calledOnce(verifyStub);
    sinon.assert.calledOnce(findChatStub);
  });
});