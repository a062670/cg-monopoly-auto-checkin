const fs = require("fs");
// const path = require("path");
const iconv = require("iconv-lite");
const jschardet = require("jschardet");
const qs = require("qs");
const axios = require("axios");

const actId = 1344;

let text = fs.readFileSync("accounts.txt");
// let text = fs.readFileSync(path.join(__dirname, "accounts.txt"));
let encoding = jschardet.detect(text).encoding;
text = iconv.decode(text, encoding);
const accounts = text
  .split(/\n/)
  .map((account) => account.replace("\r", ""))
  .filter((account) => !!account);

run();

async function run() {
  for (let account of accounts) {
    await checkIn(account);
    console.log("-----");
    console.log("等候10秒");
    await sleep(10000);
  }

  const readline = require("readline").createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question(`任務完成。`, (name) => {
    console.log(`${name}`);
    readline.close();
  });
}

async function checkIn(account) {
  try {
    const accountInfo = account.split(/:/);
    console.log(accountInfo[0], accountInfo[1]);
    console.log("登入");
    const bodyData = {
      gamecode: "MLBB",
      areacode: accountInfo[0],
      mobile: accountInfo[1],
      password: accountInfo[2],
      verify: "",
      timestamp: Date.now(),
      signature: "none",
      comefrom: "web",
      language: "zh_TW",
      autoLogin: "0",
    };
    const response = await axios({
      method: "post",
      url: "https://pcweb.originmood.com/webClient/loginPwd",
      data: qs.stringify(bodyData),
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    console.log(response.data);
    if (response.data.code !== "1000") {
      return;
    }

    await sleep(1000);

    console.log("取得 user id");
    const responseInfo = await axios({
      method: "get",
      url: "https://activity.originmood.com/act/infoL",
      params: {
        actId: actId,
        gamecode: "MLBB",
        comefrom: "web",
        platform: "GD",
        // relaCode: "Sign933",
        timestamp: Date.now(),
      },
      headers: {
        Cookie: response.headers["set-cookie"][0],
      },
    });
    console.log(responseInfo.data);
    const userId = responseInfo.data.data.userid;

    console.log("簽到");

    const response2 = await axios({
      method: "get",
      url: "https://activity.originmood.com/act/condOperationRecord",
      params: {
        actId: actId,
        userid: userId,
        timestamp: Date.now(),
        relaCode: `FBLogin${actId}`,
        gamecode: "MLBB",
      },
      headers: {
        Cookie: response.headers["set-cookie"][0],
      },
    });
    console.log(response2.data);

    await sleep(1000);

    console.log("擲骰子1");
    const response3 = await axios({
      method: "get",
      url: "https://activity.originmood.com/act/useChance",
      params: {
        actId: actId,
        userid: userId,
        timestamp: Date.now(),
      },
      headers: {
        Cookie: response.headers["set-cookie"][0],
      },
    });
    console.log(response3.data);

    await sleep(1000);

    console.log("FB分享");
    const response4 = await axios({
      method: "get",
      url: "https://activity.originmood.com/act/condOperationRecord",
      params: {
        actId: actId,
        userid: userId,
        timestamp: Date.now(),
        relaCode: `FBShare${actId}`,
        gamecode: "MLBB",
      },
      headers: {
        Cookie: response.headers["set-cookie"][0],
      },
    });
    console.log(response4.data);

    await sleep(1000);

    console.log("擲骰子2");
    const response5 = await axios({
      method: "get",
      url: "https://activity.originmood.com/act/useChance",
      params: {
        actId: actId,
        userid: userId,
        timestamp: Date.now(),
      },
      headers: {
        Cookie: response.headers["set-cookie"][0],
      },
    });
    console.log(response5.data);
  } catch (error) {
    console.log(error);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
