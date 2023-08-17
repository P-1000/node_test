import express from 'express';
import bodyParser from 'body-parser';
import nodemailer from 'nodemailer';
import admin from 'firebase-admin';
import otpGenerator from 'otp-generator';
import cors from 'cors';

const app = express();
const port = 3000;
// disable the cors
app.use(cors({ origin: true }));


// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize Firebase Admin SDK
const serviceAccount = {
  "type": "service_account",
  "project_id": "examly-9b1cf",
  "private_key_id": "28fba01091a5958868b7be721dc859f225558502",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCXmIoLeTOIVcWv\nw9SxgU5GO0bNazC8GJkFwwNxR1NN1LuTB4q8i/EveJUSG53TOReOSSRY3Ndbyy2u\npTiJIMT5GnBnpMWLO7C0kPUCVkI6sfH7n/55a0y/PD5LK76TmPsQ0yI2Ql07m5a9\n3rQhQWkswj5NYVB83kSbjN6L7FS82gdliRqlranV4knwN6V+E4DQ9XZei2/azozf\nBvHxGnl7Wgh6DooE0vakVA31JkEQUTKi7mNe1CeCp7CKU0kMrVemY3ukyqi658o0\np/K2Q7Z2oHOnKcOTf1qCGCzP0i559WXJi8s88+NhCEE8SYe27fjoaffLCGrE+PU/\nCIOhd1iPAgMBAAECggEABxmkYYwwLzMBOs27wQKS5XQyST27fxvR0vTCzQPvsWYE\n0QqZ42HUjoohxULY3gM/CLGBS84wIgL+pT7kyntn7ljgKeKMRAysJpDhgNYEbRZX\nhJcGRq6RXiWWr1Ohre0M2UliQVNTZY7QfR0Yp7QWFnwUifBEYkzQvs5WwAv2HhAv\npUBYYkVABXyhAm6/7pu0W8pSo/3Saf8OjYFmRl6KlIf9nShxzvAO37pHEF1JQLA6\nC3sBDammBAjDxWXMyhTuOGcY9THzoTCv9XiFvgV+MB5Y32MrzWNedOh6lllu+F3r\nnUeybCa1h6J3SOqUnccXWVJkrS5TgE1L2jIQyYSC3QKBgQDU1V1OfGwAFqB7oUIG\nYCmFnorAGi7o24xwa/i06bYtTuMRT2Bntso/OIY8L7bX1okMQ/7moT6E6I2MYrzW\npsfY398L+351u0QfrHiAIKfS5uuzLNUXSdtko1tgcfq+B2PHynIP/86Rj6iUVY5l\nLLZLjTq1aZbEqrP7iEqYx7vAcwKBgQC2V6A23QRBZHZZVUa9kfSTcj7OmA7DemcN\nxAAexgVEHpKPJywn8bhVW/HzFAL6zfzMXRi58XF3QoHol7b1LlU6RnhQHHt16o3Y\nI6WRUGh0YNTnXW24IC0AZa+fDWY8trd7nlRDHLEVvYZL/7iL+Io72rn/UeOvTsmS\nC/wYLBEMdQKBgG3x9qx3y9bT2X1kFVZz0J9NAkIwhHEYEVl1/Vl/rfOD3/ruNU/+\ndkXobjejMmIXWl6ytXfwbfp8o7qUuxZru6tGItPuzCoHXi66itkthWSGk9XQYBgS\nuDopxSdyWeRWru3jn76yF8TMIHrYI6ISUe1/fIeAjzjzMdzLUDXSYCQPAoGAJCiU\nOMzzPxRw854ZfRYobeTF16oHo3PuY6hubavO94cogQK/mtwwNZ0aCZ36SUn3y37a\nnGTon0GtCTasrUoW1IuM6DX9tZBhuG65MmvDivB4x7ibPVwEEIQZo2zAzWFeWUE4\nbGaQJ0OCEigPrJIIt33UTHEsuWLiTffaceCrMNECgYBrFT4wGqO/A3AtVqPcF2ON\nhWNL1OSVrwnIk+fwKr2lQHyLOLLkHIyiDRWud9crV7eaGBuEThOofbHHC+a1Y2O/\nxPaKZzSdyWmiLu7hY+93p81EHImQeY69z5X4bxaYJJW2+yCMpI5PNEwv9knvJUkN\nziERVHb0Y4CjQ6e64ouUYg==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-m14a3@examly-9b1cf.iam.gserviceaccount.com",
  "client_id": "117777106577020607613",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-m14a3%40examly-9b1cf.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://examly-9b1cf.firebaseio.com' // Replace with your Firebase project's database URL
});

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'flashpostmail@gmail.com',
    pass: 'hxzlsowcdvwheybt'
  }
});

// Route for sending OTP mail and storing in Firebase Firestore
app.post('/otp/mail/', async (req, res) => {
  const userMail = req.body.email || null;
  const firestore = admin.firestore();
  
  // Check if the email already exists in the collection
  const emailQuery = await firestore.collection('otps').where('email', '==', userMail).get();

  if (!emailQuery.empty) {
    // Email exists, update the existing document with a new OTP and set auth to false
    const existingDoc = emailQuery.docs[0];
    const newOtp = otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false
    });

    try {
      await existingDoc.ref.update({ otp: newOtp, auth: false });

      return res.status(200).json({ message: 'Email already exists. Updated OTP and set auth to false.' });
    } catch (error) {
      console.error('Error updating existing document:', error);
      return res.status(500).json({ message: 'Error updating existing document' });
    }
  }

  // Email doesn't exist, generate OTP and add a new document
  const otpCode = otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false
  });

  const mailOptions = {
    from: 'flashpostmail@gmail.com',
    to: userMail,
    subject: 'OTP Mail',
    html: `
      <!DOCTYPE html>
      <!-- Your email template here -->
      <p>Your OTP: ${otpCode}</p>
      <p>User Mail : ${userMail}</p>
      </html>
    `
  };

  try {
    await firestore.collection('otps').add({ email: userMail, otp: otpCode, auth: false });

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ message: 'Error sending email' });
      } else {
        res.status(200).json({ message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error saving OTP to Firestore:', error);
    res.status(500).json({ message: 'Error saving OTP to Firestore' });
  }
});



//post req for otp verification : 

app.post('/otp/verify', async (req, res) => {
  try {
    const otp = req.body.otp || null;
    const email = req.body.email || null;

    if (!otp || !email) {
      return res.status(400).json({ message: 'Both OTP and email are required for verification' });
    }

    const firestore = admin.firestore();
    const otpRef = firestore.collection('otps').where('otp', '==', otp).where('email', '==', email);
    const otpSnapshot = await otpRef.get();

    if (otpSnapshot.empty) {
      return res.status(400).json({ message: 'Invalid OTP or email combination' });
    }

    // Assuming the OTP and email combination is valid, update the document to set the auth field to true
    const batch = firestore.batch();
    otpSnapshot.forEach((doc) => {
      batch.update(doc.ref, { auth: true });
    });

    await batch.commit();

    return res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return res.status(500).json({ message: 'Error verifying OTP' });
  }
});

// auth : 

app.get('/otp/auth/:email', async (req, res) => {
  try {
    const email = req.params.email || null;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const firestore = admin.firestore();
    const otpRef = firestore.collection('otps').where('email', '==', email);
    const otpSnapshot = await otpRef.get();

    if (otpSnapshot.empty) {
      return res.status(404).json({ message: 'Email not found' });
    }

    // Assuming that you have an "auth" field in the Firestore document
    // that indicates whether the email is authenticated or not
    const isEmailAuthenticated = otpSnapshot.docs[0].data().auth || false;

    return res.status(200).json({ authenticated: isEmailAuthenticated });
  } catch (error) {
    console.error('Error checking email authentication status:', error);
    return res.status(500).json({ message: 'Error checking email authentication status' });
  }
});



// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
