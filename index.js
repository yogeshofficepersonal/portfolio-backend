const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

// --- Mongoose Schemas and Models ---
// A schema defines the structure of the documents in a collection.

const workSchema = new mongoose.Schema({
    title: String,
    category: String,
    imageUrl: String,
    description: String,
});
const Work = mongoose.model('Work', workSchema);

const certificationSchema = new mongoose.Schema({
    name: String,
    issuer: String,
    date: String,
    imageUrl: String,
});
const Certification = mongoose.model('Certification', certificationSchema);

const blogSchema = new mongoose.Schema({
    title: String,
    date: String,
    slug: String,
    excerpt: String,
});
const Blog = mongoose.model('Blog', blogSchema);

// --- API Routes (Endpoints) ---

// Generic GET route to fetch all items from a collection
const getAllItems = (model) => async (req, res) => {
    try {
        const items = await model.find();
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Generic POST route to add a new item to a collection
const createItem = (model) => async (req, res) => {
    const newItem = new model(req.body);
    try {
        const savedItem = await newItem.save();
        res.status(201).json(savedItem);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

// Generic DELETE route to remove an item from a collection
const deleteItem = (model) => async (req, res) => {
    try {
        const deletedItem = await model.findByIdAndDelete(req.params.id);
        if (!deletedItem) return res.status(404).json({ message: 'Item not found' });
        res.json({ message: 'Item deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Works Routes
app.get('/api/works', getAllItems(Work));
app.post('/api/works', createItem(Work));
app.delete('/api/works/:id', deleteItem(Work));

// Certifications Routes
app.get('/api/certifications', getAllItems(Certification));
app.post('/api/certifications', createItem(Certification));
app.delete('/api/certifications/:id', deleteItem(Certification));

// Blog Routes
app.get('/api/blog', getAllItems(Blog));
app.post('/api/blog', createItem(Blog));
app.delete('/api/blog/:id', deleteItem(Blog));

// --- Start Server ---
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
