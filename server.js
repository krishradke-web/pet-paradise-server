// server.js - फाइनल और करेक्ट कोड

const express = require('express');
const cors = require('cors');
// 'node-fetch' का उपयोग बाहरी URL (Google Sheet) पर डेटा भेजने के लिए होता है।
const fetch = require('node-fetch'); 
const app = express();
const PORT = 3000;

// *************************************************************************
// ✅ GOOGLE APPS SCRIPT URL: यह URL डेटा को Google Sheet में परमानेंटली स्टोर करेगा।
// **यह वह नया URL है जो आपने माँगा है:**
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzDQRdF2buG_Ka17xeBwd0S9ZNRkX4UQij5jn6C0ar-cNMaGSJnl59wozvZ1btzOOUc/exec";
// *************************************************************************

// appointments: यह एक temporary लिस्ट है जो डैशबोर्ड को real-time डेटा दिखाएगा।
let appointments = [];

app.use(cors());
app.use(express.json());

// 1. सर्वर स्टेटस (Client/Admin स्टेटस चेक के लिए)
app.get('/', (req, res) => {
    res.json({ message: "Pet Paradise Server Working!", server: "online" });
});

// 2. बुकिंग भेजना (Client POSTs here)
app.post('/api/send-appointment', async (req, res) => {
    const newAppointment = {
        ...req.body,
        id: Date.now(),
        timestamp: new Date().toISOString()
    };
    
    // ➡️ Step A: Real-time डैशबोर्ड के लिए internal array में स्टोर करें
    appointments.unshift(newAppointment); 
    
    // ➡️ Step B: Permanent स्टोरेज के लिए NEW Google Sheet URL पर POST करें
    try {
        await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(newAppointment)
        });
        console.log("Appointment saved to NEW Google Sheet successfully.");
    } catch (error) {
        console.error("Error saving to Google Sheet:", error.message);
    }

    // Client को सक्सेसफुल बुकिंग का जवाब दें
    res.json({ success: true, ref: newAppointment.id });
});

// 3. बुकिंग प्राप्त करना (Admin GETs here)
app.get('/api/get-appointments', (req, res) => {
    // Real-time डैशबोर्ड को internal array का डेटा भेजें
    res.json({ success: true, data: appointments }); 
});

// 4. Admin Clear All (Optional - सिर्फ internal array को साफ करने के लिए)
app.post('/api/clear-all', (req, res) => {
    appointments = [];
    res.json({ success: true, message: "In-memory appointments cleared." });
});


app.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
});
