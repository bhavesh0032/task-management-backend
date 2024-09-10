const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();


const client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

// Initiate Google OAuth flow
router.get('/google', (req, res) => {
  const url = client.generateAuthUrl({
    access_type: ['offline', 'online'],
    scope: ['profile', 'email']
  });
  res.redirect(url);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
    const { code } = req.query;
  try {
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        googleId: sub
      });
      await user.save();
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${token}`);
  } catch (error) {
    console.error('Google login error:', error);
    
    const errorMessage = encodeURIComponent('Google login failed. Please try again.');
    res.redirect(`${process.env.FRONTEND_URL}/login?error=${errorMessage}`);
  }
});


router.post('/google/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        firstName: given_name,
        lastName: family_name,
        email,
        googleId: payload.sub
      });
      await user.save();
    }

    const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token: jwtToken });
  } catch (error) {
    console.error('Google token verification error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
});

module.exports = router;