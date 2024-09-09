const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// const { OAuth2Client } = require('google-auth-library')
const router = express.Router();



// const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// router.get('/google', (req, res) => {
//   const redirectUrl = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  
//   const url = client.generateAuthUrl({
//     access_type: 'offline',
//     scope: ['profile', 'email'],
//     redirect_uri: redirectUrl
//   });

//   res.redirect(url);
// });


router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

   
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();

    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});




module.exports = router;