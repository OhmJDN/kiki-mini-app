# คู่มือการตั้งค่า LINE OA และ LIFF (KIKI Beauty Salon)

ระบบนี้เชื่อมต่อกับ **LINE OA** ผ่านทาง **Messaging API** และใช้ **LIFF (LINE Front-end Framework)** ในการแสดงหน้าจอจองบริการ

กรุณาทำตามขั้นตอนด้านล่างนี้เพื่อตั้งค่าระบบ

---

## 1. การสร้าง Provider และ LINE Login (LIFF)

1. ไปที่ [LINE Developers Console](https://developers.line.biz/) และเข้าสู่ระบบ
2. สร้าง Provider ใหม่ (เช่น `KIKI Beauty`)
3. ใน Provider ที่สร้าง ให้เลือก **Create a new channel**
4. เลือก **LINE Login**
5. กรอกข้อมูล:
   - Channel type: `LINE Login`
   - Provider: `KIKI Beauty`
   - Region: `Thailand`
   - Channel icon / name / description
   - App types: เลือก `Web app`
6. กดยืนยันเพื่อสร้าง Channel
7. ไปที่แถบ **LIFF** แล้วกดปุ่ม **Add**
8. ตั้งค่า LIFF:
   - Size: `Full`
   - Endpoint URL: `ใส่ URL ชั่วคราวไปก่อน หรือ URL ของ Vercel ที่ Deploy แล้ว` (ต้องเป็น HTTPS)
   - Scopes: ติ๊กเลือก `profile`, `openid`
   - Bot link feature: `On (Normal)`
9. กด Add จะได้ **LIFF ID** (นำไปใส่ในไฟล์ `.env` ที่ตัวแปร `VITE_LIFF_ID`)

---

## 2. การสร้าง Messaging API (สำหรับ Rich Menu)

1. กลับไปที่ Provider เดิม
2. เลือก **Create a new channel** -> เลือก **Messaging API**
3. กรอกข้อมูลร้านค้าให้ครบถ้วนแล้วกดยืนยัน
4. ในหน้าตั้งค่า Messaging API Channel:
   - ไปที่แถบ **Messaging API**
   - เลื่อนลงมาที่ **Channel access token (long-lived)**
   - กดปุ่ม `Issue` เพื่อสร้าง Token (เก็บไว้ใช้สำหรับ script สร้าง Rich menu)
   - จดค่า **Channel ID** (นำไปใส่ในไฟล์ `.env` ที่ตัวแปร `VITE_LINE_CHANNEL_ID`)

---

## 3. การสร้าง Rich Menu

คุณต้องใช้ `Channel access token` ที่ได้จากข้อ 2 มาใช้รันสคริปต์นี้
ระบบจะเตรียมโค้ดสำหรับการสร้าง Rich Menu ไว้ที่ไฟล์ `scripts/create-rich-menu.ts`

**วิธีรัน:**
1. ติดตั้ง `tsx` หรือใช้ `ts-node` (ตัวอย่าง: `npm i -g tsx`)
2. สร้างไฟล์รูปภาพสำหรับ Rich Menu ขนาด 2500x1686 px บันทึกชื่อ `richmenu-bg.jpg` ไว้ในโฟลเดอร์ `scripts/`
3. รันคำสั่ง `tsx scripts/create-rich-menu.ts`

---

## 4. การตั้งค่า Supabase

1. สร้างโปรเจคใหม่ที่ [Supabase](https://supabase.com/)
2. นำ `Project URL` และ `anon public key` ไปใส่ใน `.env`
3. ไปที่แถบ **SQL Editor**
4. ก๊อปปี้โค้ดในไฟล์ `supabase/migration.sql` ไปรันเพื่อสร้าง Database tables
5. (ถ้าต้องการทดสอบ) ไปที่แถบ Authentication -> Providers -> เลื่อนหา Email แล้วปิด Confirm Email เพื่อให้สมัครสมาชิกผ่าน LIFF ได้ง่ายขึ้น

---

## สรุปค่าในไฟล์ .env
```env
VITE_LIFF_ID=1234567890-AbCdeFgH
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_LINE_CHANNEL_ID=1234567890
```
