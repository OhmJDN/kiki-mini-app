# คู่มือการนำ KIKI Beauty Space ไปเผยแพร่เป็น LINE Mini App

คู่มือนี้สรุปขั้นตอนทั้งหมดตั้งแต่การเตรียมโปรเจกต์ การตั้งค่าใน **LINE Developers Console** การปฏิบัติตาม **LINE Mini App Guidelines** จนถึงการส่งแอปให้ทีมงาน LINE ตรวจสอบ (Review & Publish)

---

## 1. LINE Mini App ต่างจาก LIFF ธรรมดาอย่างไร?

| ฟีเจอร์ | LIFF ทั่วไป | LINE Mini App |
| :--- | :--- | :--- |
| **URL รูปแบบ** | `https://liff.line.me/{liffId}` | `https://miniapp.line.me/{liffId}` (Permanent Link) |
| **การติดตั้งไอคอน** | ทำไม่ได้ | ลูกค้าสามารถกด **"Add to Home Screen"** เป็นไอคอนแอปบนหน้าจอมือถือได้ |
| **การแจ้งเตือน** | ใช้โควต้า Messaging API (เสียเงินถ้าเกิน) | ส่ง **Service Messages** แจ้งเตือนสถานะคิวได้ **ฟรี** ไม่กินโควต้า Broadcast |
| **การค้นหา** | ไม่แสดงในหน้าค้นหา LINE | ค้นหาเจอใน **LINE Search** และหมวด **Services** บนหน้าแรกของ LINE |
| **การตรวจสอบ (Review)** | ไม่ต้องตรวจ เปิดใช้งานได้ทันที | ต้องส่งให้ **LINE Thailand Review** ก่อน Publish สู่สาธารณะ |

---

## 2. สิ่งที่โปรเจกต์นี้รองรับเรียบร้อยแล้ว (Ready in Code)

1. **Viewport & Safe Area:** ตั้งค่า `viewport-fit=cover` ใน `index.html` ไม่ให้ชนกับ Native Header Bar ของ LINE
2. **Auto Authentication:** เรียก `liff.init()` และดึง Profile LINE ทันทีที่เปิดแอป
3. **Chat Confirmation:** ส่งการ์ดสรุปการจองเข้าห้องแชทอัตโนมัติด้วย `liff.sendMessages()`
4. **Mobile Responsive:** หน้าตา UI สเกลพอดีหน้าจอมือถือ ไม่เกิด Scroll แนวนอน

---

## 3. ขั้นตอนการตั้งค่าใน LINE Developers Console

### ขั้นตอนที่ 1: ตรวจสอบประเภท Provider
1. ไปที่ [LINE Developers Console](https://developers.line.biz/)
2. สร้าง Provider ที่เป็นชื่อแบรนด์ของคุณ เช่น `KIKI Beauty Space`

### ขั้นตอนที่ 2: สร้าง Channel สำหรับ LINE Mini App
*สำหรับประเทศไทย มี 2 กรณี:*
- **กรณีขอเป็น LINE Mini App ทางการ:** ติดต่อพาร์ตเนอร์หรือตัวแทน LINE เพื่อเปิดฟีเจอร์ Mini App บน Provider หรือสร้าง Channel ประเภท **LINE Mini App** (หากบัญชีได้รับสิทธิ์)
- **กรณีใช้ในฐานะ Verified LIFF:** สร้าง Channel ประเภท **LINE Login** แล้วเปิด LIFF Scopes ให้ครบ (`profile`, `openid`, `chat_message.write`)

### ขั้นตอนที่ 3: ตั้งค่า LIFF สำหรับ Mini App
1. ในแถบ **LIFF** กด **Add**:
   - **Size:** เลือก `Full`
   - **Endpoint URL:** ใส่ URL Production ของเว็บคุณ (เช่น `https://kiki-beauty.vercel.app/home`)
   - **Scopes:** ติ๊กเลือก `profile`, `openid`, และ `chat_message.write`
   - **Bot link feature:** เลือก `Normal` หรือ `Aggressive` (เพื่อให้ลูกค้ากดติดตาม LINE OA ร้านอัตโนมัติเมื่อเปิดแอป)
   - **Module mode:** ปิดไว้ (Off)
2. คัดลอก **LIFF ID** มาใส่ในไฟล์ `.env`:
   ```env
   VITE_LIFF_ID=2000000000-XXXXXXXX
   ```

---

## 4. Checklist สำหรับการส่ง Review กับ LINE

ก่อนส่ง Review ให้แน่ใจว่าเว็บของคุณผ่านเกณฑ์เหล่านี้:

- [x] **HTTPS Only:** เว็บต้องรันด้วย SSL Certificate (HTTPS) เช่น Deploy บน Vercel, Netlify, Cloudflare
- [x] **No Duplicate Back/Close:** ไม่ใส่ปุ่มปิดหน้าต่างขนาดใหญ่ที่ซ้ำซ้อนกับปุ่มปิด Native ของ LINE
- [x] **Fast Loading:** โหลดหน้าแรกได้เร็วกว่า 2 วินาที (Vite Bundle ผ่านการ Optimize แล้ว)
- [x] **Friendly Fallback:** มีระบบรองรับเมื่อเปิดนอก LINE หรือเปิดบนบราวเซอร์ทั่วไป
- [ ] **Privacy Policy & Terms:** เพิ่มหน้าหรือลิงก์นโยบายความเป็นส่วนตัวของร้านค้าที่ Footer

---

## 5. การตั้งค่า Rich Menu ใน LINE OA ให้เปิด Mini App

เมื่อได้ Permanent Link ของ LINE Mini App (เช่น `https://miniapp.line.me/{liffId}`) ให้นำไปใส่ใน Rich Menu:

1. เปิดไฟล์ `scripts/create-rich-menu.ts`
2. แก้ไขค่า URL:
   ```ts
   const LIFF_URL_SERVICES = 'https://miniapp.line.me/YOUR_LIFF_ID/home/services';
   const LIFF_URL_BOOKING = 'https://miniapp.line.me/YOUR_LIFF_ID/home/bookings';
   ```
3. รันสคริปต์เพื่ออัปโหลด Rich Menu ไปยัง LINE Official Account:
   ```bash
   npx tsx scripts/create-rich-menu.ts
   ```

---

## 6. คำแนะนำในการ Deploy สู่ Production

แนะนำให้ Deploy ผ่าน **Vercel** เนื่องจากรองรับ React Router SPA และ HTTPS อัตโนมัติ:
```bash
# 1. ติดตั้ง Vercel CLI
npm i -g vercel

# 2. ทำการ Deploy
vercel --prod
```
หลังจาก Deploy เสร็จ ให้นำ Domain ที่ได้ (เช่น `https://kiki-beauty.vercel.app`) ไปใส่เป็น **Endpoint URL** ในหน้า LINE Developers Console ทันที
