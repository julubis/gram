const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const express = require('express');
const axios = require('axios');
const app = express();

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH;
const stringSession = new StringSession(process.env.SESSION); // fill this later with the value from session.save()

async function sendSN(url) {
  if (url.startsWith('https://shope.ee/')) {
    const resp = await axios({ method: 'GET', url: url, maxRedirects: 0 , validateStatus: function (status) {
    return status >= 200 && status < 500
  },})
    if (resp.headers.location) {
      const parsedUrl = new URL(resp.headers.location);
      const sn = parsedUrl.searchParams.get('angbao_sn');
      if (sn) {
        axios({method: 'GET', url: `https://carnine.julubis.repl.co/sn/${sn}`})
      }
    }
  } else if (url.startsWith('https://sppay.shopee.co.id/angbao/')) {
    const parsedUrl = new URL(url);
    const sn = parsedUrl.pathname.split("/")[2];
    if (sn) {
      axios({method: 'GET', url: `https://carnine.julubis.repl.co/sn/${sn}`})
    }
  }
}

async function eventPrint(event) {
  const message = event.message;
  if (message && message.entities) {
    const entities = message.entities;
    entities.forEach(async (e) => {
      try {
        if (e.className === 'MessageEntityUrl') {
          const url = message.message.slice(e.offset, e.offset + e.length);
          sendSN(url)
        } else if (e.className === 'MessageEntityTextUrl') {
          sendSN(e.url)
        }
      } catch {}
    })
  }
}

app.get("/", async (req, res) => {
  res.json({})
});

app.listen(8000, async () => {
  console.log('Server running...');
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.start({
    phoneNumber: async () => await input.text("Please enter your number: "),
    password: async () => await input.text("Please enter your password: "),
    phoneCode: async () =>
      await input.text("Please enter the code you received: "),
    onError: (err) => console.log(err),
  });
  console.log("Client conneted");
  client.addEventHandler(eventPrint);
});

