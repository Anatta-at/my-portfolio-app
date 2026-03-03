import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. กำหนดหน้าที่ต้อง "ล็อคกุญแจ"
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)', 
  '/plan(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. ถ้าเป็นหน้าที่ต้องป้องกัน และผู้ใช้ยังไม่ได้ล็อกอิน
  if (isProtectedRoute(req)) {
    // ต้องใส่ await นำหน้า และเรียกใช้ protect() แบบนี้ครับ
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // ป้องกันการดึงข้อมูลส่วนตัว ยกเว้นไฟล์ระบบและรูปภาพ
    '/((?!.*\\..*|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};