process.env.NODE_ENV === "development";

const Partner = require("../models/partner");
const Image = require("../models/image");

const { describe, it } = require("mocha");
const { expect } = require("chai");
const request = require("supertest");
const sinon = require('sinon');

const app = require("../app");


const testUser = {
  username: "testUser",
  password: "testpassword",
  email: "testUser@example.com"
};

const testPartner = {
  name: "partner",
};


// describe("GET /chat/imageURL", () => {

  // it("should return 404 if partner not found", async () => {

  //   const response = await request(app)
  //     .get("/chat/imageURL")
  //     .set("authorization", jwtTokenForTest)
  //     .expect(404);

  //   expect(response.body.message).to.equal("Partner not found");

  // });



//   it("should return the partner imgURL", async () => {

//     const res = await request(app)
//       .get("/chat/imageURL")
//       .set("authorization", jwtTokenForTest)
//       .expect(200);

//   });
// });



// describe("POST /chat/replyMessage", () => {
//   it("should return the script and config", async () => {
//     const res = await request(app)
//       .post("/chat/replyMessage")
//       .set("authorization", jwtTokenForTest)
//       .send({ message: "fakeMessage" })
//       .expect(200);

//     expect(res.body).to.have.property("script");
//     expect(res.body).to.have.property("config");
//     expect(res.body.script.type).to.be.a("string");
//     expect(res.body.script.input).to.be.a("string");
//     expect(res.body.script).to.have.property("ssml").to.be.true;
//     expect(res.body.script.provider).to.be.a("object");

//   });

// });



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