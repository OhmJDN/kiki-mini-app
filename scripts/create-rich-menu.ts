import fetch from 'node-fetch';
import * as fs from 'fs';
import * as path from 'path';

// ใส่ Channel Access Token ของคุณที่นี่
const CHANNEL_ACCESS_TOKEN = 'YOUR_CHANNEL_ACCESS_TOKEN';

// ใส่ LIFF URL ของคุณ (เช่น https://liff.line.me/1234567890-AbCdeF)
const LIFF_URL_SERVICES = 'https://liff.line.me/YOUR_LIFF_ID';
const LIFF_URL_BOOKING = 'https://liff.line.me/YOUR_LIFF_ID/bookings';

async function createRichMenu() {
  // 1. Create Rich Menu definition
  const richMenuPayload = {
    size: {
      width: 2500,
      height: 1686,
    },
    selected: true,
    name: "KIKI Beauty Salon Menu",
    chatBarText: "เมนูหลัก",
    areas: [
      {
        bounds: {
          x: 0,
          y: 0,
          width: 1250,
          height: 1686,
        },
        action: {
          type: "uri",
          uri: LIFF_URL_SERVICES,
        },
      },
      {
        bounds: {
          x: 1250,
          y: 0,
          width: 1250,
          height: 1686,
        },
        action: {
          type: "uri",
          uri: LIFF_URL_BOOKING,
        },
      },
    ],
  };

  try {
    const res = await fetch('https://api.line.me/v2/bot/richmenu', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(richMenuPayload),
    });

    const data = await res.json();
    console.log('Created Rich Menu ID:', data.richMenuId);
    return data.richMenuId;
  } catch (error) {
    console.error('Error creating rich menu:', error);
  }
}

async function uploadRichMenuImage(richMenuId: string) {
  // 2. Upload Image
  const imagePath = path.join(__dirname, 'richmenu-bg.jpg'); // เตรียมรูปภาพชื่อนี้ไว้
  const imageBuffer = fs.readFileSync(imagePath);

  try {
    const res = await fetch(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
        'Content-Type': 'image/jpeg',
      },
      body: imageBuffer,
    });

    console.log('Upload image status:', res.status);
    return res.status === 200;
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

async function setDefaultRichMenu(richMenuId: string) {
  // 3. Set as default
  try {
    const res = await fetch(`https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
    });

    console.log('Set default status:', res.status);
  } catch (error) {
    console.error('Error setting default menu:', error);
  }
}

async function main() {
  if (CHANNEL_ACCESS_TOKEN === 'YOUR_CHANNEL_ACCESS_TOKEN') {
    console.error('Please put your channel access token in the script first.');
    return;
  }

  const richMenuId = await createRichMenu();
  if (richMenuId) {
    const uploaded = await uploadRichMenuImage(richMenuId);
    if (uploaded) {
      await setDefaultRichMenu(richMenuId);
      console.log('Success! Rich menu is now active.');
    }
  }
}

main();
