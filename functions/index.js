const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');
const app = express();
const serviceAccount = require("./permissions.json");

app.use(cors({ origin: true }));

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.DB_HOST
});

const db = admin.firestore();

app.get('/', (req, res) => {
    (async () => {
        try {
            return res.status(200).send(['OK']);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.get('/api/devices', (req, res) => {
    (async () => {
        try {
            let query = db.collection('devices');
            let response = [];
            await query.get().then(querySnapshot => {
                let docs = querySnapshot.docs;
                for (let doc of docs) {
                    const selectedItem = {
                        id: doc.id,
                        on: doc.data().on,
                        updated: doc.data().updated
                    };
                    response.push(selectedItem);
                }
                return res.status(200).send(response);
            });
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.post('/api/create', (req, res) => {
    (async () => {
        try {
            await db.collection('devices')
                .doc('/' + req.body.name + '/')
                .create({
                    on: false,
                    updated: (new Date()).toString()
                });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.put('/api/update/:device_name/:device_state', (req, res) => {
    (async () => {
        try {
            const document = db.collection('devices')
                .doc(req.params.device_name);
            await document.update({
                on: Boolean(Number(req.params.device_state)),
                updated: (new Date()).toString()
            });
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.delete('/api/delete/:device_name', (req, res) => {
    (async () => {
        try {
            const document = db.collection('devices')
                .doc(req.params.device_name);
            await document.delete();
            return res.status(200).send();
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

app.get('/api/device/:device_name', (req, res) => {
    (async () => {
        try {
            const document = db.collection('devices')
                .doc(req.params.device_name);
            let item = await document.get();
            let response = item.data();
            return res.status(200).send(response);
        } catch (error) {
            console.log(error);
            return res.status(500).send(error);
        }
    })();
});

exports.app = functions.https.onRequest(app);