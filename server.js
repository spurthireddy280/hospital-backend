const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');

// Load the JSON file you downloaded from Google Cloud
const creds = require('./google-credentials.json');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 1. Authenticate with Google
const serviceAccountAuth = new JWT({
    email: creds.client_email,
    key: creds.private_key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// 2. Connect to your specific Google Sheet (Paste your Sheet ID here)
const doc = new GoogleSpreadsheet('14_zM0FsBCs_fFV6wDvIcykAqfFiSY4v27MODeN3fGvc', serviceAccountAuth);

// 3. The API Route receiving data from React
app.post('/', async (req, res) => {
    try {
        const { name, phone, date, department, gender, village, district, state } = req.body;

        // Load the document properties and get the first tab
        await doc.loadInfo();
        const sheet = doc.sheetsByIndex[0];

        // Append a new row mapping to your Google Sheet headers
        await sheet.addRow({
            Name: name,
            Gender: gender,
            Contact: phone,
            Date: date,
            Department: department,
            Timestamp: new Date().toLocaleString(),
            Village: village,
            District: district,
            State: state

        });

        console.log(`Successfully added appointment for ${name}`);
        res.status(200).json({ message: "Success" });

    } catch (error) {
        console.error("Spreadsheet Error:", error);
        res.status(500).json({ error: "Failed to save to Google Sheets" });
    }
});

app.listen(PORT, () => {
    console.log(`Google Sheets Backend running on http://localhost:${PORT}`);
});