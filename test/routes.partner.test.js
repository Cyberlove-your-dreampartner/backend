process.env.NODE_ENV === "development";

require("dotenv").config();

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require("sinon")

const app = require("../app");
const dId = require("../utils/d-id");
const jwt = require("jsonwebtoken");

const Partner = require("../models/partner");
const Image = require("../models/image");

// const usersForCreatePartner = {
//   data: {
//     name: "testPartner",
//   },
//   expectedStatus: 201,
//   expectedMessage: "Partner created"
// };

// describe("POST /partner/create", () => {

//   it("should create a new partner", async () => {
//     const response = await request(app)
//       .post("/partner/create")
//       .send({"name": usersForCreatePartner.data.name})
//       .set("authorization", jwtTokenForTest);
//       expect(response.status).to.equal(usersForCreatePartner.expectedStatus);
//       expect(response.body.message).to.equal(usersForCreatePartner.expectedMessage);

//     await Partner.findOneAndDelete({ name: usersForCreatePartner.name });
//   });

// });


// describe("POST /partner/generateImage", () => {
//   it("should return an array of 4 images or less", async () => {
//     const res = await request(app)
//       .post("/partner/generateImage")
//       .send({
//         "origin": "Japanese",
//         "hair": "straight"
//       })
//       .set("authorization", jwtTokenForTest)
//       .expect(200);

//     expect(res.body.images.length).to.be.gte(0);
//   });
// });

// // describe('POST /partner/characterSetting', () => {
//   it('should update partner and chat', async () => {
//     const req = {
//       body: {
//         nickname: 'Alice',
//         name: 'Alice Smith',
//         MBTI: 'INTJ',
//         job: 'Engineer',
//         personality: 'Introverted',
//       }
//     };
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.stub(),
//     };

//     const partnerSaveStub = sinon.stub().resolves();
//     const partnerFindOneStub = sinon.stub(Partner, 'findOne').resolves({
//       nickname: 'OldNickname',
//       name: 'OldName',
//       MBTI: 'OldMBTI',
//       job: 'OldJob',
//       personality: 'OldPersonality',
//       save: partnerSaveStub,
//     });

//     const chatSaveStub = sinon.stub().resolves();
//     const chatFindOneStub = sinon.stub(Chat, 'findOne').resolves({
//       system: 'OldSystem',
//       save: chatSaveStub,
//     });

//     await characterSetting(req, res);

//     expect(partnerFindOneStub.calledOnceWithExactly({ userId: req.user._id })).to.be.true;
//     expect(chatFindOneStub.calledOnceWithExactly({ userId: req.user._id })).to.be.true;

//     expect(partnerSaveStub.calledOnce).to.be.true;
//     expect(chatSaveStub.calledOnce).to.be.true;

//     expect(res.status.calledOnceWithExactly(201)).to.be.true;
//     expect(res.json.calledOnceWithExactly({ message: 'CharacterSetting success' })).to.be.true;

//     partnerFindOneStub.restore();
//     chatFindOneStub.restore();
//   });

//   it('should handle errors', async () => {
//     const req = {
//       body: {
//         // ... request body values ...
//       },
//       user: {
//         _id: 'userId123',
//       },
//     };
//     const res = {
//       status: sinon.stub().returnsThis(),
//       json: sinon.stub(),
//     };

//     sinon.stub(Partner, 'findOne').throws(new Error('Database error'));
//     sinon.stub(Chat, 'findOne').resolves(null);

//     await characterSetting(req, res);

//     expect(res.status.calledOnceWithExactly(500)).to.be.true;
//     expect(res.json.calledOnceWithExactly({ message: 'Internal server error' })).to.be.true;

//     Partner.findOne.restore();
//     Chat.findOne.restore();
//   });
// });

// describe("POST /partner/", () => {

//   let verifyStub;
//   let createPartnerStub;
//   let findImageStub;
//   let createIdleVideoStub;
//   let getIdleVideoURLStub;
//   let saveImageStub;

//   // Set up stubs before each test
//   beforeEach(() => {
//     // Stub the JWT verification function
//     verifyStub = sinon.stub(jwt, "verify");

//     // Stub the save method of the Partner model
//     createPartnerStub = sinon.stub(Partner.prototype, "save");

//     // Stub the findById method of the Image model
//     findImageStub = sinon.stub(Image, "findById");

//     // Stub the createIdleVideo function
//     createIdleVideoStub = sinon.stub(dId, "createIdleVideo");

//     // Stub the getIdleVideoURL function
//     getIdleVideoURLStub = sinon.stub(dId, "getIdleVideoURL");
//   });

//   // Restore stubs after each test
//   afterEach(() => {
//     verifyStub.restore();
//     createPartnerStub.restore();
//     findImageStub.restore();
//     createIdleVideoStub.restore();
//     getIdleVideoURLStub.restore();
//   });

//   it("should create a partner and return a success message", async () => {

//     verifyStub.returns({ userId: "fakeUserId" });
//     createPartnerStub.resolves();
//     findImageStub.resolves({ videoURL: '' });
//     createIdleVideoStub.resolves("fakeVideoId");
//     getIdleVideoURLStub.resolves("fakeVideoURL");
//     // Stub the save method of the Image model
//     findImageStub.resolves({
//       save: sinon.stub().resolves(true)
//     });

//     // Send a POST request to create a partner
//     const response = await request(app)
//       .post("/partner/")
//       .set("authorization", "jwtToken")
//       .send({
//         name: "Partner Name",
//         imageId: "fakeImageId",
//       });

//     expect(response.status).to.equal(201);
//     expect(response.body.message).to.equal("Partner created");

//     sinon.assert.calledOnce(createPartnerStub);
//     sinon.assert.calledOnce(findImageStub);
//     sinon.assert.calledOnce(createIdleVideoStub);
//     sinon.assert.calledOnce(getIdleVideoURLStub);
//   });

//   it("should return an error if an exception is thrown", async () => {

//     verifyStub.returns({ userId: "fakeUserId" });
//     createPartnerStub.resolves();
//     findImageStub.rejects(new Error("Database error")); // Simulate database error

//     // Send a POST request to create a partner
//     const response = await request(app)
//       .post("/partner/")
//       .set("authorization", "jwtToken")
//       .send({
//         name: "Partner Name",
//         imageId: "fakeImageId",
//       });

//     expect(response.status).to.equal(500);
//     expect(response.body.message).to.equal("Internal server error");

//     sinon.assert.calledOnce(verifyStub);
//     sinon.assert.calledOnce(createPartnerStub);
//     sinon.assert.calledOnce(findImageStub);
//   });
// });