const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import your models (if they’re needed in other routes)
//const userModel = require('./models/Users');
//const userModel2 = require('./models/solid_waste');
const userModel3 = require('./models/wastedata');
const userModel4 = require('./models/waterdata');
const userModel5 = require('./models/airdata');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// -------------------- Connect to MongoDB --------------------
// Use .then/.catch instead of a try/catch around an async call
mongoose
  .connect(
    'mongodb+srv://kiepufyy:XXbgZOBc4H7pwHoF@upcodb.rlq5b.mongodb.net/data?retryWrites=true&w=majority&appName=UPCODB',
  )
  .then(() => {
    console.log('Database connected successfully');

  })
  .catch((error) => {
    console.log('Database connection failed:', error);
  });


app.get('/airquality_data/:year/:month', (req, res) => {
    const { year, month } = req.params;
    userModel5.find({ year: parseInt(year), month: month }, (err, data) => {
        if (err) {
            res.status(500).send(err);
        } else if (!data) {
            res.status(404).send('No data found for specified year and month.');
        } else {
            res.status(200).json(data);
        }
    });
});

app.get('/filterUsers', (req, res) => {
    const { month, year } = req.query;

    let filter = {};
    if (month) {
        filter.month = month;  // assuming the user model has a 'month' field
    }
    if (year) {
        filter.year = year; // assuming the user model has a 'year' field
    }

    userModel3.find(filter)
        .then(users => res.json(users))
        .catch(err => res.json(err));
});

app.post("/add_airquality", (req, res) => {
    userModel5.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.get('/airquality_data', (req, res) => {
    const { year, month } = req.query;

    // Build the query object
    let query = {};
    if (year) query.year = parseInt(year);
    if (month) query.month = month;

    userModel5.find(query, { _id: 0, year: 1, month: 1, CO: 1, NO2: 1, SO2: 1 }) 
        .then(data => {
            if (data.length > 0) {
                res.json(data[0]); // Return the first matching document
            } else {
                res.status(404).json({ message: 'No data found for the selected month and year.' });
            }
        })
        .catch(err => {
            console.error('Error fetching data:', err);
            res.status(500).json({ error: 'Internal server error' });
        });
});

app.post("/add_waterquality", (req, res) => {
    userModel4.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

// Add this route to fetch distinct years for air table
app.get('/available_year_air', async (req, res) => {
    try {
        const years = await userModel5.distinct('year');
        res.json(years.sort((a, b) => b - a)); // Sort in descending order
    } catch (err) {
        console.error("Error fetching available years:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

// Add this route to fetch distinct years for water table
app.get('/available_years', async (req, res) => {
    try {
        const years = await userModel4.distinct('year');
        res.json(years.sort((a, b) => b - a)); // Sort in descending order
    } catch (err) {
        console.error("Error fetching available years:", err);
        res.status(500).json({ error: "Server Error" });
    }
});


app.get('/waterquality_data', async (req, res) => {
    try {
        const { monthRange, year } = req.query;
        let filter = {};

        if (year) {
            filter.year = parseInt(year, 10);
        }

        if (monthRange) {
            // Directly filter by the exact month range string
            filter.month = monthRange;
        }

        const users = await userModel4.find(filter, {
            _id: 1,
            year: 1,
            month: 1,
            source_tank: 1,
            pH: 1,
            Color: 1,
            Fecal_Coliform: 1,
            TSS: 1,
            Chloride: 1,
            Nitrate: 1,
            Phosphate: 1
        });

        res.json(users);
    } catch (err) {
        console.error("Error fetching water quality data:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

app.post("/add_solidwaste", (req, res) => {
    userModel3.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.get('/solidwaste_data', (req, res) => {
    userModel3.find({}, { _id: 1, year: 1, month: 1, residual: 1, biodegradable: 1, recyclable: 1}) 
    .then(users => res.json(users))
    .catch(err => res.json(err))
})


app.delete('/delete_solidwaste/:id', (req, res) => {
    const id = req.params.id;
    userModel3.findByIdAndDelete({_id:id})
    .then(res => res.json(res))
    .catch(err => res.json(err))
})

app.get('/get_solidwaste/:id', (req, res) => {
    const id = req.params.id;
    userModel2serModel3.findById({_id:id})
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.put('/update_solidwaste/:id', (req, res) => {
    const id = req.params.id;
    userModel3.findByIdAndUpdate({_id:id}, {
        year: req.body.year,
        month: req.body.month,
        wastetype: req.body.wastetype,
        quantity: req.body.quantity
    })
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.get('/', (req, res) => {
    userModel3.find({})
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.listen(3001, () => {
    console.log("Sever is Running")
})