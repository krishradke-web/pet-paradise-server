// server.js - Pet Paradise Global Server (Google Sheets Version)
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ YAHAN APNA GOOGLE SCRIPT URL HAI
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyV19YuaTOUwhiBTyMiRYLFkBScOgmxVfh7ecoBTZfZe_LUFhdFt7sOqkAuCGHH5sXE/exec";

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Pet Paradise Server (Google Sheets) चालू है! 🚀',
        status: 'Working',
        googleSheets: 'Connected',
        endpoints: {
            sendAppointment: 'POST /api/send-appointment',
            getAppointments: 'GET /api/get-appointments'
        }
    });
});

// API: Appointment Google Sheets में सेव करें
app.post('/api/send-appointment', async (req, res) => {
    try {
        const { name, phone, pet, service } = req.body;
        
        if (!name || !phone || !pet || !service) {
            return res.status(400).json({ success: false, message: 'सारी जानकारी भरें!' });
        }
        
        // Google Apps Script को डेटा भेजें
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone, pet, service })
        });
        
        const result = await response.json();
        
        if (result.success) {
            res.status(201).json({
                success: true,
                message: '✅ Appointment बुक हुआ और Google Sheets में सेव हो गया!',
                ref: result.ref,
                timestamp: result.timestamp
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: 'Google Sheets में सेव नहीं हुआ: ' + (result.message || 'Unknown error') 
            });
        }
        
    } catch (error) {
        console.error('❌ Server error:', error);
        res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
});

// API: Google Sheets से सारे Appointments लाएं
app.get('/api/get-appointments', async (req, res) => {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL);
        const appointments = await response.json();
        res.json(appointments);
    } catch (error) {
        console.error('❌ Fetch error:', error);
        res.status(500).json({ success: false, message: 'Error fetching appointments' });
    }
});

// Server Start करें
app.listen(PORT, () => {
    console.log(`🚀 Pet Paradise Server (Google Sheets) ${PORT} पर चालू है`);
    console.log(`📊 Google Sheets URL: ${GOOGLE_SCRIPT_URL}`);
});