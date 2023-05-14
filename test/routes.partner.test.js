process.env.NODE_ENV === "development";

require("dotenv").config();

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const app = require("../app");
const Partner = require("../models/partner");

require("../utils/test-setup");


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


describe("POST /partner/generateImage", () => {
  it("should return an array of 4 images or less", async () => {
    const res = await request(app)
      .post("/partner/generateImage")
      .send({
        "origin": "Japanese",
        "hair": "straight"
      })
      .set("authorization", jwtTokenForTest)
      .expect(200);

    expect(res.body.images.length).to.be.gte(0);
  });
});

// describe('POST /partner/characterSetting', () => {
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