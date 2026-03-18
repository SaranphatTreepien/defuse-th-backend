// routes/auth.js — แก้ตรง Steam callback return

router.get('/steam/return',
  passport.authenticate('steam', { failureRedirect: '/auth/failed', session: false }),
  async (req, res) => {
    try {
      const steamUser = req.user;

      // บันทึก/อัปเดต User ใน MongoDB
      let user = await User.findOneAndUpdate(
        { steamId: steamUser.id },
        {
          steamId:     steamUser.id,
          displayName: steamUser.displayName,
          avatar:      steamUser.photos?.[2]?.value || steamUser.photos?.[0]?.value || '',
          profileUrl:  steamUser.profileUrl,
          lastLogin:   new Date(),
        },
        { upsert: true, returnDocument: 'after' }  // ✅ แก้ deprecated warning ด้วย
      );

      // สร้าง JWT Token
      const token = jwt.sign(
        {
          steamId:     steamUser.id,
          displayName: steamUser.displayName,
          avatar:      steamUser.photos?.[2]?.value || '',
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // ✅ Redirect กลับ App ผ่าน Deep Link พร้อม Token
      const appUrl = `myapp://auth/callback?token=${token}&steamId=${steamUser.id}&name=${encodeURIComponent(steamUser.displayName)}`;
      res.redirect(appUrl);

    } catch (err) {
      console.error('Steam callback error:', err);
      res.redirect('myapp://auth/callback?error=server_error');
    }
  }
);

// เพิ่ม route สำหรับ failed login
router.get('/failed', (req, res) => {
  res.redirect('myapp://auth/callback?error=login_failed');
});