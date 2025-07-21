const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- MIDDLEWARE ---
app.use(cors()); 
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => {
        console.error("MongoDB connection error:", err);
    });

// --- Mongoose Schemas and Models ---
const workSchema = new mongoose.Schema({
    title: { type: String, required: true },
    category: { type: String, required: true },
    imageUrl: { type: String, required: true },
    description: { type: String, required: true },
});
const Work = mongoose.model('Work', workSchema);

const certificationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    issuer: { type: String, required: true },
    date: { type: String, required: true },
    imageUrl: { type: String, required: true },
});
const Certification = mongoose.model('Certification', certificationSchema);

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: String, required: true },
    slug: { type: String, required: true },
    excerpt: { type: String, required: true },
});
const Blog = mongoose.model('Blog', blogSchema);

// --- API Routes (Endpoints) ---

// Generic GET route to fetch all items from a collection
const getAllItems = (modelName, model) => async (req, res) => {
    console.log(`GET request received for /api/${modelName.toLowerCase()}`);
    try {
        const items = await model.find();
        res.json(items);
    } catch (err) {
        console.error(`Error fetching from ${modelName}:`, err);
        res.status(500).json({ message: `Internal Server Error while fetching ${modelName}.`, error: err.message });
    }
};

// Generic POST route to add a new item to a collection
const createItem = (modelName, model) => async (req, res) => {
    console.log(`POST request received for /api/${modelName.toLowerCase()}`);
    const newItem = new model(req.body);
    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        console.error(`Error saving to ${modelName}:`, err);
        // Mongoose validation errors often result in a 400 Bad Request
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: `Validation Error: ${err.message}`, error: err.errors });
        }
        res.status(500).json({ message: `Internal Server Error while creating ${modelName}.`, error: err.message });
    }
};

// Generic DELETE route to remove an item from a collection
const deleteItem = (modelName, model) => async (req, res) => {
    console.log(`DELETE request received for /api/${modelName.toLowerCase()}/${req.params.id}`);
    try {
        const deletedItem = await model.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        console.error(`Error deleting from ${modelName}:`, err);
        res.status(500).json({ message: `Internal Server Error while deleting ${modelName}.`, error: err.message });
    }
};

// Works Routes
app.get('/api/works', getAllItems('Works', Work));
app.post('/api/works', createItem('Works', Work));
app.delete('/api/works/:id', deleteItem('Works', Work));

// Certifications Routes
app.get('/api/certifications', getAllItems('Certifications', Certification));
app.post('/api/certifications', createItem('Certifications', Certification));
app.delete('/api/certifications/:id', deleteItem('Certifications', Certification));

// Blog Routes
app.get('/api/blog', getAllItems('Blog', Blog));
app.post('/api/blog', createItem('Blog', Blog));
app.delete('/api/blog/:id', deleteItem('Blog', Blog));

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
