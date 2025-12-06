// server.js - Render के लिए बैकएंड सर्वर
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// CORS और मिडलवेयर सेटअप
app.use(cors({
    origin: '*', // सभी डोमेन से रिक्वेस्ट स्वीकार करें
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(express.json());

// अपॉइंटमेंट डेटा स्टोर करने के लिए (रियल एप्लीकेशन में डेटाबेस का उपयोग करें)
let appointments = [];

// रूट टेस्ट करने के लिए
app.get('/', (req, res) => {
    res.json({
        message: 'Pet Paradise Global Server is Running!',
        endpoints: {
            sendAppointment: 'POST /api/send-appointment',
            getAppointments: 'GET /api/get-appointments',
            test: 'GET /api/test'
        },
        status: 'active',
        timestamp: new Date().toISOString()
    });
});

// टेस्ट एंडपॉइंट
app.get('/api/test', (req, res) => {
    res.json({
        success: true,
        message: 'API is working perfectly!',
        serverTime: new Date().toISOString()
    });
});

// अपॉइंटमेंट रिसीव करने का एंडपॉइंट
app.post('/api/send-appointment', (req, res) => {
    try {
        const { name, phone, pet, service, time } = req.body;
        
        // डेटा वैलिडेशन
        if (!name || !phone || !pet || !service) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required!'
            });
        }
        
        // नया अपॉइंटमेंट ऑब्जेक्ट
        const newAppointment = {
            id: Date.now().toString(),
            name: name.trim(),
            phone: phone.trim(),
            pet: pet.trim(),
            service: service.trim(),
            time: time || new Date().toLocaleString(),
            timestamp: new Date().toISOString(),
            status: 'pending'
        };
        
        // अपॉइंटमेंट्स ऐरे में जोड़ें
        appointments.push(newAppointment);
        
        // सफलता प्रतिक्रिया
        res.status(201).json({
            success: true,
            message: 'Appointment booked successfully!',
            ref: `PET-${newAppointment.id.slice(-6)}`,
            appointment: newAppointment
        });
        
        console.log(`✅ New appointment received: ${newAppointment.name} - ${newAppointment.service}`);
        
    } catch (error) {
        console.error('❌ Appointment error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// सभी अपॉइंटमेंट्स प्राप्त करने का एंडपॉइंट
app.get('/api/get-appointments', (req, res) => {
    try {
        // अपॉइंटमेंट्स को नए से पुराने क्रम में सॉर्ट करें
        const sortedAppointments = [...appointments].sort((a, b) => 
            new Date(b.timestamp) - new Date(a.timestamp)
        );
        
        res.json(sortedAppointments);
        
    } catch (error) {
        console.error('❌ Get appointments error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching appointments'
        });
    }
});

// एक अपॉइंटमेंट डिलीट करने का एंडपॉइंट
app.delete('/api/delete-appointment/:id', (req, res) => {
    try {
        const { id } = req.params;
        const initialLength = appointments.length;
        
        appointments = appointments.filter(app => app.id !== id);
        
        if (appointments.length < initialLength) {
            res.json({
                success: true,
                message: 'Appointment deleted successfully'
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Appointment not found'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting appointment'
        });
    }
});

// अपॉइंटमेंट्स क्लियर करने का एंडपॉइंट
app.delete('/api/clear-appointments', (req, res) => {
    appointments = [];
    res.json({
        success: true,
        message: 'All appointments cleared'
    });
});

// सर्वर स्टार्ट करें
app.listen(PORT, () => {
    console.log(`🚀 Pet Paradise Server is running on port ${PORT}`);
    console.log(`🌍 Access the API at: http://localhost:${PORT}`);
    console.log(`📞 Endpoints:`);
    console.log(`   GET  /                 - Server status`);
    console.log(`   GET  /api/test         - Test API`);
    console.log(`   POST /api/send-appointment - Book appointment`);
    console.log(`   GET  /api/get-appointments - Get all appointments`);
});