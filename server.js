// server.js - Final Code with Confirm/Delete APIs (इसे पूरा Replace करें)

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = process.env.PORT || 3000;

// CORS सेटिंग्स
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// In-Memory Storage
let appointments = [];

// ✅ GOOGLE APPS SCRIPT URL: यह आपका नया URL है
const GOOGLE_SHEET_URL = "https://script.google.com/macros/s/AKfycbzDQRdF2buG_Ka17xeBwd0S9ZNRkX4UQij5jn6C0ar-cNMaGSJnl59wozvZ1btzOOUc/exec";

// ----------------------
// 1. CLIENT API: NEW BOOKING
// ----------------------
app.post('/api/send-appointment', async (req, res) => {
    const bookingData = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        confirmed: false,
        ...req.body
    };

    // 1. In-memory storage (Admin Dashboard के लिए)
    appointments.unshift(bookingData); 

    // 2. Google Sheet में डेटा भेजना (Backup के लिए)
    try {
        const sheetResponse = await fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            body: JSON.stringify(bookingData),
            headers: { 'Content-Type': 'application/json' }
        });
        
        console.log('Data sent to Google Sheet URL successfully.');
        
        res.status(200).json({ 
            success: true, 
            message: "Appointment booked and data sent to sheet backup.",
            ref: bookingData.id
        });

    } catch (error) {
        console.error('Error sending data to Google Sheet URL:', error.message);
        res.status(200).json({ 
            success: true, 
            message: "Appointment booked, but error sending to Google Sheet backup.",
            ref: bookingData.id
        });
    }
});

// ----------------------
// 2. ADMIN API: GET APPOINTMENTS
// ----------------------
app.get('/api/get-appointments', (req, res) => {
    res.status(200).json({
        success: true,
        data: appointments 
    });
});

// ----------------------
// 3. ADMIN API: CLEAR ALL
// ----------------------
app.post('/api/clear-all', (req, res) => {
    appointments = [];
    console.log('All in-memory appointments cleared.');
    res.status(200).json({
        success: true,
        message: 'All appointments cleared from server memory.'
    });
});

// ----------------------
// 4. ADMIN API: CONFIRM APPOINTMENT (NEW!)
// ----------------------
app.post('/api/confirm-appointment', (req, res) => {
    const { index } = req.body;
    const idx = parseInt(index, 10);
    
    if (idx >= 0 && idx < appointments.length) {
        appointments[idx].confirmed = true;
        res.status(200).json({
            success: true,
            message: `Appointment at index ${idx} confirmed.`,
            appointment: appointments[idx]
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Appointment not found.'
        });
    }
});

// ----------------------
// 5. ADMIN API: DELETE APPOINTMENT (NEW!)
// ----------------------
app.post('/api/delete-appointment', (req, res) => {
    const { index } = req.body;
    const idx = parseInt(index, 10);

    if (idx >= 0 && idx < appointments.length) {
        const deletedAppointment = appointments.splice(idx, 1);
        res.status(200).json({
            success: true,
            message: `Appointment at index ${idx} deleted.`,
            deleted: deletedAppointment[0]
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'Appointment not found.'
        });
    }
});

// ----------------------
// ROOT & SERVER START
// ----------------------
app.get('/', (req, res) => {
    res.json({ message: "Pet Paradise Server Working!", server: "online" });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
