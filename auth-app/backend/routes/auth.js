const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const db = require('../database');
const { sendVerificationEmail } = require('../services/emailService');

const router = express.Router();

// Validation middleware
const validateSignup = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').notEmpty().withMessage('Date of birth is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  })
];

const validateLogin = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// SIGNUP ROUTE
router.post('/signup', validateSignup, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, dateOfBirth, email, password } = req.body;

  try {
    // Check if user already exists
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (row) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Insert user into database
      db.run(
        'INSERT INTO users (firstName, lastName, dateOfBirth, email, password, verificationToken, verificationTokenExpiry) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [firstName, lastName, dateOfBirth, email, hashedPassword, verificationToken, verificationTokenExpiry],
        async function (err) {
          if (err) {
            return res.status(500).json({ message: 'Error creating user' });
          }

          // Send verification email
          const emailSent = await sendVerificationEmail(email, verificationToken);

          if (!emailSent) {
            // Delete user if email fails to send
            db.run('DELETE FROM users WHERE id = ?', [this.lastID]);
            return res.status(500).json({ message: 'Failed to send verification email' });
          }

          res.status(201).json({
            message: 'User registered successfully. Please check your email to verify your account.',
            user: {
              id: this.lastID,
              email,
              firstName,
              lastName
            }
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGIN ROUTE
router.post('/login', validateLogin, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Check if user is verified
      if (!user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email first' });
      }

      // Compare passwords
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// EMAIL VERIFICATION ROUTE
router.get('/verify-email/:token', async (req, res) => {
  const { token } = req.params;

  try {
    db.get(
      'SELECT * FROM users WHERE verificationToken = ?',
      [token],
      (err, user) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }

        if (!user) {
          return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        // Check if token has expired
        const tokenExpiry = new Date(user.verificationTokenExpiry);
        if (new Date() > tokenExpiry) {
          return res.status(400).json({ message: 'Verification token has expired' });
        }

        // Update user to verified and clear token
        db.run(
          'UPDATE users SET isVerified = 1, verificationToken = NULL, verificationTokenExpiry = NULL WHERE id = ?',
          [user.id],
          (err) => {
            if (err) {
              return res.status(500).json({ message: 'Error verifying email' });
            }

            res.json({
              message: 'Email verified successfully! You can now log in.',
              user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName
              }
            });
          }
        );
      }
    );
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// RESEND VERIFICATION EMAIL
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      if (user.isVerified) {
        return res.status(400).json({ message: 'Email is already verified' });
      }

      // Generate new verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

      db.run(
        'UPDATE users SET verificationToken = ?, verificationTokenExpiry = ? WHERE id = ?',
        [verificationToken, verificationTokenExpiry, user.id],
        async (err) => {
          if (err) {
            return res.status(500).json({ message: 'Error updating verification token' });
          }

          // Send verification email
          const emailSent = await sendVerificationEmail(email, verificationToken);

          if (!emailSent) {
            return res.status(500).json({ message: 'Failed to send verification email' });
          }

          res.json({
            message: 'Verification email sent. Please check your inbox.'
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET USER PROFILE (Protected route)
router.get('/profile', require('../middleware/auth').authenticateToken, (req, res) => {
  db.get('SELECT id, email, firstName, lastName, dateOfBirth FROM users WHERE id = ?', [req.user.id], (err, user) => {
    if (err || !user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });
});

module.exports = router;
