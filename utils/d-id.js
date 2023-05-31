require("dotenv").config();
const fetch = require("node-fetch");
// if (process.env.NODE_ENV === "development") {
//   const fetch = require("node-fetch");
// }
// for test
const getCredit = async () => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Basic ${process.env.DID_API_KEY}}`,
    },
  };
  const res = await fetch(`${process.env.DID_URL}/credits`, options);
  if (!res.ok) {
    console.log(res);
  }
  const data = await res.json();
  console.log(data);
};

getCredit();

const createIdleVideo = async (imgURL) => {
  // generate 15 "abc"
  const breakTime = '<break time="1000ms"/>';
  const input = breakTime.repeat(15);
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Basic ${process.env.DID_API_KEY}`,
    },
    body: JSON.stringify({
      script: {
        type: "text",
        ssml: true,
        input: input,
      },
      config: {
        stitch: true,
      },
      source_url: imgURL,
    }),
  };
  const res = await fetch(`${process.env.DID_URL}/talks`, options);
  if (!res.ok) {
    throw new Error("Failed to create idle video");
  }
  const data = await res.json();
  const videoId = data.id;
  return videoId;
};

const getIdleVideoURL = async (videoId) => {
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
      authorization: `Basic ${process.env.DID_API_KEY}`,
    },
  };
  let videoURL = "";
  while (true) {
    const res = await fetch(`${process.env.DID_URL}/talks/${videoId}`, options);
    if (!res.ok) {
      throw new Error("Failed to get idle video URL");
    }
    const data = await res.json();
    if (data.status === "done") {
      videoURL = data.result_url;
      break;
    }
  }
  return videoURL;
};

module.exports = { createIdleVideo, getIdleVideoURL };
