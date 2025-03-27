const express = require('express');
const database = require('./database.js');
const app = express();
app.use(express.json());
const PORT = 3000;
const path = require('path');
app.use(express.static(path.join(__dirname,'public')));

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on http://localhost:"+ PORT)
    else 
        console.log("Error occurred, server can't start", error);
    }
);

// -- Club Member APIs -- 
// ----------------------
// ----------------------
app.get('/clubmembers', (req, res) => {
    const sql = `
      SELECT c.*, CONCAT(f.first_name, ' ', f.last_name) AS family_member_name
      FROM Club_Member c
      LEFT JOIN Family_Member f ON c.family_member_id = f.family_member_id
    `;
    database.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    });
  });
// Select Club Member based on ID
app.get('/clubmembers/:id', (req, res) => {
    const memberid = req.params.id;
    database.query('SELECT * FROM Club_Member WHERE club_member_id = ?', [memberid], (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});
// Create a new Club Member
app.post('/clubmembers', (req,res) => {
    // Destructure the fields expected in the request body
    const {
        first_name,
        last_name,
        age,
        date_of_birth,
        height,
        weight,
        ssn,
        medicare_card,
        phone_number,
        address,
        city,
        province,
        postal_code,
        family_member_id,
        member_status
    } = req.body;

    const sql = `
        INSERT INTO Club_Member
        (
        first_name,
        last_name,
        age,
        date_of_birth,
        height,
        weight,
        ssn,
        medicare_card,
        phone_number,
        address,
        city,
        province,
        postal_code,
        family_member_id,
        member_status
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        first_name,
        last_name,
        age,
        date_of_birth,   
        height,
        weight,
        ssn,
        medicare_card,
        phone_number,
        address,
        city,
        province,
        postal_code,
        family_member_id,
        member_status   
    ];

    database.query(sql, values, (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({ message:'New Club Member created', insertedId: results.insertedId})
    });
});
// Delete a club member
app.delete('/clubmembers/:id', (req,res) =>{
    const memberid = req.params.id;
    database.query('DELETE FROM Club_Member WHERE club_member_id = ?', [memberid], (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message})
        }
        res.json({message:'Club Member Deleted'})
    });
});

// -- Family Member APIs --
// ------------------------
// ------------------------
app.get('/familymember', (req,res) => {
    const sql = `
      SELECT f.*, l.name AS location_name
      FROM Family_Member f
      LEFT JOIN Location l ON f.location_id = l.location_id
    `;

    database.query(sql, (err, results) => {
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});
// Retrieve a specific family member
app.get('/familymember/:id', (req,res) =>{
    const memberid = req.params.id;
    database.query('SELECT * FROM Family_Member WHERE family_member_id = ?', [memberid], (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});

// Create a new Club Member
app.post('/familymember', (req,res) => {
    // Destructure the fields expected in the request body
    const {
        first_name,
        last_name,
        age,
        date_of_birth,
        height,
        weight,
        ssn,
        medicare_card,
        phone_number,
        address,
        city,
        province,
        postal_code,
        email_address,
        location_id,
        start_date
    } = req.body;

    const sql = `
        INSERT INTO Family_Member
        (
        first_name,
        last_name,
        age,
        date_of_birth,
        height,
        weight,
        ssn,
        medicare_card,
        phone_number,
        address,
        city,
        province,
        postal_code,
        email_address,
        location_id,
        start_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        first_name,
        last_name,
        age,
        date_of_birth,   
        height,
        weight,
        ssn,
        medicare_card,
        phone_number,
        address,
        city,
        province,
        postal_code,
        email_address,
        location_id,
        start_date   
    ];

    database.query(sql, values, (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({ message:'New Family Member created', insertedId: results.insertedId})
    });
});

// Deletes a Family Member
app.delete('familymember/:id', (req,res)=>{
    const memberid = req.params.id;
    database.query('DELETE FROM Family_Member WHERE family_member_id = ?',[memberid], (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json({message:'Deleted Family Member'})
    });
});

// -- Location APIs -- 
// -------------------
// -------------------
app.get('/location', (req,res) => {
    database.query('SELECT * FROM Location', (err,results) => {
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});
// Retrieve a specific location
app.get('/location/:id', (req,res) =>{
    const locationid = req.params.id;
    database.query('Select * FROM Location WHERE location_id = ?', [locationid], (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});
// Create a new Location
app.post('/Location', (req,res) => {
    const {
        name,
        type,
        address,
        city,
        province,
        postal_code,
        phone_number,
        web_address,
        max_capacity
    } = req.body;

    const sql = `
        INSERT INTO Location
        (
        name,
        type,
        address,
        city,
        province,
        postal_code,
        phone_number,
        web_address,
        max_capacity
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        name,
        type,
        address,
        city,
        province,
        postal_code,
        phone_number,
        web_address,
        max_capacity  
    ];

    database.query(sql, values, (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.status(201).json({ message:'New Location created', insertedId: results.insertedId})
    });
});
// Delete a Location
app.delete('/Location/:id', (req,res) =>{
    const locationid = req.params.id;
    database.query('DELETE FROM Location WHERE location_id = ?', [locationid], (err, results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json({message:'Location deleted'})
    });
});

// -- Payment APIs --
// ------------------
// ------------------
app.get('/payment', (req, res) => {
    database.query('SELECT * FROM Payment', (err,results) => {
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});
// Retrieve specific payment
app.get('/payment/:id', (req,res) =>{
    const paymentid = req.params.id;
    database.query('SELECT * FROM Payment WHERE payment_id = ?', [paymentid], (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});
app.post('/payment', (req,res) => {
    const {
        club_member_id,
        payment_date,
        amount_paid,
        method,
        membership_year,
        installment_number
    } = req.params;

    const sql = `
        INSERT INTO Payment
        (
            club_member_id,
            payment_date,
            amount_paid,
            method,
            membership_year,
            installment_number
        )
        Values(?, ?, ?, ?, ?, ?)
    `;
    const values = {
        club_member_id,
        payment_date,
        amount_paid,
        method,
        membership_year,
        installment_number
    };
    database.query(sql, values, (err, results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json({message:'Payment created'});
    });
});

// -- Personnel APIs --
// --------------------
// --------------------
app.get('/personnel', (req, res) => {
    database.query('SELECT * FROM Personnel', (err, results) => {
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});
app.get('/personnel/:id', (req, res) =>{
    const personnelid = req.params.id;
    database.query('SELECT * FROM Personnel WHERE personnel_id = ?', [personnelid], (err,results) =>{
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});

app.get('/familychildrelation', (req, res) => {
    database.query('SELECT * FROM family_child_relation', (err, results) => {
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});

app.get('/familymemberlocation', (req, res) => {
    database.query('SELECT * FROM family_member_location', (err, results) => {
        if(err){
            return res.status(500).json({error: err.message});
        }
        res.json(results);
    });
});

