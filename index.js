require('dotenv').config({ quiet: true });

const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// The token remains in .env, which is ignored by Git.
const privateAppAccess = process.env.HUBSPOT_ACCESS_TOKEN || process.env.PRIVATE_APP_TOKEN;
const customObjectType = process.env.HUBSPOT_CUSTOM_OBJECT_TYPE || process.env.CUSTOM_OBJECT_TYPE_ID;
const customObjectUrl = `https://api.hubapi.com/crm/v3/objects/${customObjectType}`;
const headers = {
    Authorization: `Bearer ${privateAppAccess}`,
    'Content-Type': 'application/json'
};

// Route 1: Retrieve Video Game custom-object records for the homepage table.
app.get('/', async (req, res) => {
    try {
        const response = await axios.get(customObjectUrl, {
            headers,
            params: {
                properties: 'name,publisher,price'
            }
        });

        res.render('homepage', {
            title: 'Custom Object Table | Integrating With HubSpot I Practicum',
            data: response.data.results
        });
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send('Unable to retrieve Video Game records from HubSpot.');
    }
});

// Route 2: Render the Pug form for creating a new Video Game record.
app.get('/update-cobj', (req, res) => {
    res.render('updates', {
        title: 'Update Custom Object Form | Integrating With HubSpot I Practicum'
    });
});

// Route 3: Send the three form values to HubSpot, then return to the homepage.
app.post('/update-cobj', async (req, res) => {
    const newVideoGame = {
        properties: {
            name: req.body.name,
            publisher: req.body.publisher,
            price: req.body.price
        }
    };

    try {
        await axios.post(customObjectUrl, newVideoGame, { headers });
        res.redirect('/');
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).send('Unable to create the Video Game record in HubSpot.');
    }
});


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));
