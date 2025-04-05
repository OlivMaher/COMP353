const express = require('express');
const database = require('./database.js');
const app = express();
app.use(express.json());
const PORT = 3000;
const path = require('path');
app.use(express.static(path.join(__dirname,'public')));

app.listen(PORT, (error) =>{
    if(!error)
        console.log("Server is Successfully Running, and App is listening on http://localhost:" + PORT);
    else 
        console.log("Error occurred, server can't start", error);
});

// -- Club Member APIs -- 
// ----------------------
// GET all Club Members with relationship details
app.get('/clubmembers', (req, res) => {
  const sql = `
    SELECT c.*, 
           r.family_member_id, r.relationship_type, r.start_date AS relationship_start, r.end_date AS relationship_end,
           f.first_name AS family_first_name, f.last_name AS family_last_name,
           CONCAT(f.first_name, " " ,f.last_name) AS family_member_name
    FROM Club_Member c
    LEFT JOIN Club_Member_Relationship r ON c.club_member_id = r.club_member_id
    LEFT JOIN Family_Member f ON r.family_member_id = f.family_member_id
  `;
  database.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// GET a single Club Member with relationship details
app.get('/clubmembers/:id', (req, res) => {
  const memberid = req.params.id;
  const sql = `
    SELECT c.*, 
           r.family_member_id, r.relationship_type, r.start_date AS relationship_start, r.end_date AS relationship_end,
           f.first_name AS family_first_name, f.last_name AS family_last_name,
           CONCAT(f.first_name, " " ,f.last_name) AS family_member_name
    FROM Club_Member c
    LEFT JOIN Club_Member_Relationship r ON c.club_member_id = r.club_member_id
    LEFT JOIN Family_Member f ON r.family_member_id = f.family_member_id
    WHERE c.club_member_id = ?
  `;
  database.query(sql, [memberid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

// Create a new Club Member with optional relationship details
app.post('/clubmembers', (req, res) => {
  // Destructure the fields expected in the request body.
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
    member_status,
    relationship  // structure: { family_member_id, relationship_type, start_date, end_date }
  } = req.body;

  const sql = `
    INSERT INTO Club_Member (
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
      member_status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
    member_status
  ];

  database.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const newClubMemberId = results.insertId;

    // If relationship details are provided, insert them into Club_Member_Relationship table.
    if (relationship && relationship.family_member_id && relationship.relationship_type && relationship.start_date) {
      const relSql = `
        INSERT INTO Club_Member_Relationship 
          (club_member_id, family_member_id, relationship_type, start_date, end_date)
        VALUES (?, ?, ?, ?, ?)
      `;
      const relValues = [
        newClubMemberId,
        relationship.family_member_id,
        relationship.relationship_type,
        relationship.start_date,
        relationship.end_date || null
      ];
      database.query(relSql, relValues, (relErr, relResults) => {
        if (relErr) return res.status(500).json({ error: relErr.message });
        res.status(201).json({ 
          message: 'New Club Member and relationship created',
          insertedId: newClubMemberId 
        });
      });
    } else {
      res.status(201).json({ message: 'New Club Member created', insertedId: newClubMemberId });
    }
  });
});
// DELETE a Club Member and associated Team_Member, Payment and Relationship records
app.delete('/clubmembers/:id', (req, res) => {
    const memberid = req.params.id;
    // Delete Team_Member records referencing this club member
    database.query('DELETE FROM Team_Member WHERE club_member_id = ?', [memberid], (err, teamResults) => {
      if (err) return res.status(500).json({ error: err.message });
      // Then, delete child Payment records
      database.query('DELETE FROM Payment WHERE club_member_id = ?', [memberid], (err, paymentResults) => {
        if (err) return res.status(500).json({ error: err.message });
        // Then, delete relationship record(s) for the club member
        database.query('DELETE FROM Club_Member_Relationship WHERE club_member_id = ?', [memberid], (err, relResults) => {
          if (err) return res.status(500).json({ error: err.message });
          // Now, delete the Club Member record
          database.query('DELETE FROM Club_Member WHERE club_member_id = ?', [memberid], (err, memberResults) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Club Member, associated Team_Member, relationships, and Payments deleted' });
          });
        });
      });
    });
  });

// -- Family Member APIs --
// GET all Family Members
app.get('/familymember', (req, res) => {
  const sql = `
    SELECT f.*, l.name AS location_name
    FROM Family_Member f
    LEFT JOIN Location l ON f.location_id = l.location_id
  `;
  database.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// GET a specific Family Member
app.get('/familymember/:id', (req, res) => {
  const memberid = req.params.id;
  const sql = `
    SELECT f.*, l.name AS location_name
    FROM Family_Member f
    LEFT JOIN Location l ON f.location_id = l.location_id
    WHERE f.family_member_id = ?
  `;
  database.query(sql, [memberid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Create a new Family Member
app.post('/familymember', (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
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
    INSERT INTO Family_Member (
      first_name,
      last_name,
      date_of_birth,    
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
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    first_name,
    last_name,
    date_of_birth,   
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

  database.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'New Family Member created', insertedId: results.insertId });
  });
});
// DELETE a Family Member along with associated Club Members and Payments
app.delete('/familymember/:id', (req, res) => {
  const memberid = req.params.id;
  const getClubMemberIdsSql = 'SELECT club_member_id FROM Club_Member WHERE family_member_id = ?';
  database.query(getClubMemberIdsSql, [memberid], (err, clubMembers) => {
    if (err) return res.status(500).json({ error: err.message });
    const clubMemberIds = clubMembers.map(cm => cm.club_member_id);
    if (clubMemberIds.length > 0) {
      const deletePaymentsSql = 'DELETE FROM Payment WHERE club_member_id IN (?)';
      database.query(deletePaymentsSql, [clubMemberIds], (err, paymentResults) => {
        if (err) return res.status(500).json({ error: err.message });
        const deleteClubSql = 'DELETE FROM Club_Member WHERE family_member_id = ?';
        database.query(deleteClubSql, [memberid], (err, clubResults) => {
          if (err) return res.status(500).json({ error: err.message });
          const deleteFamilySql = 'DELETE FROM Family_Member WHERE family_member_id = ?';
          database.query(deleteFamilySql, [memberid], (err, familyResults) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Deleted Family Member along with associated Club Members and Payments' });
          });
        });
      });
    } else {
      const deleteFamilySql = 'DELETE FROM Family_Member WHERE family_member_id = ?';
      database.query(deleteFamilySql, [memberid], (err, familyResults) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Deleted Family Member (no associated club members)' });
      });
    }
  });
});

// -- Location APIs -- 
// GET all Locations
app.get('/location', (req, res) => {
  database.query('SELECT * FROM Location', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// GET a specific Location
app.get('/location/:id', (req, res) => {
  const locationid = req.params.id;
  database.query('SELECT * FROM Location WHERE location_id = ?', [locationid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Create a new Location
app.post('/Location', (req, res) => {
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
    INSERT INTO Location (
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
  database.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'New Location created', insertedId: results.insertId });
  });
});
// DELETE a Location
app.delete('/Location/:id', (req, res) => {
  const locationid = req.params.id;
  database.query('DELETE FROM Location WHERE location_id = ?', [locationid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Location deleted' });
  });
});

// -- Payment APIs --
// GET all Payments
app.get('/payment', (req, res) => {
  const sql = `
    SELECT p.*, CONCAT(c.first_name, ' ', c.last_name) as club_member_name
    FROM Payment p
    LEFT JOIN Club_Member c on c.club_member_id = p.club_member_id
  `;
  database.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// GET a specific Payment
app.get('/payment/:id', (req, res) => {
  const paymentid = req.params.id;
  database.query('SELECT * FROM Payment WHERE payment_id = ?', [paymentid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Create a new Payment
app.post('/payment', (req, res) => {
  const {
    club_member_id,
    payment_date,
    amount_paid,
    method,
    membership_year,
    installment_number
  } = req.body;
  const sql = `
    INSERT INTO Payment (
      club_member_id,
      payment_date,
      amount_paid,
      method,
      membership_year,
      installment_number
    ) VALUES (?, ?, ?, ?, ?, ?)
  `;
  const values = [
    club_member_id,
    payment_date,
    amount_paid,
    method,
    membership_year,
    installment_number
  ];
  database.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Payment created' });
  });
});

// -- Personnel APIs --
// GET all Personnel
app.get('/personnel', (req, res) => {
  const sql = `
    SELECT p.*, l.name as location_name
    FROM Personnel p
    LEFT JOIN Location l on l.location_id = p.location_id
  `;
  database.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// GET a specific Personnel record
app.get('/personnel/:id', (req, res) => {
  const personnelid = req.params.id;
  database.query('SELECT * FROM Personnel WHERE personnel_id = ?', [personnelid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});
// Create a new Personnel record
app.post('/personnel', (req, res) => {
  const {
    first_name,
    last_name,
    date_of_birth,
    ssn,
    medicare_card,
    phone_number,
    address,
    city,
    province,
    postal_code,
    email_address,
    role,
    mandate,
    location_id,
    start_date,
    end_date
  } = req.body;
  const sql = `
    INSERT INTO Personnel
      (first_name, last_name, date_of_birth, ssn, medicare_card, phone_number, address, city, province, postal_code, email_address, role, mandate, location_id, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    first_name,
    last_name,
    date_of_birth,
    ssn,
    medicare_card,
    phone_number,
    address,
    city,
    province,
    postal_code,
    email_address,
    role,
    mandate,
    location_id,
    start_date,
    end_date || null
  ];
  database.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ message: 'New personnel created', insertedId: results.insertId });
  });
});
// DELETE a Personnel record
app.delete('/personnel/:id', (req, res) => {
  const personnelid = req.params.id;
  const sql = 'DELETE FROM Personnel WHERE personnel_id = ?';
  database.query(sql, [personnelid], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.affectedRows === 0) return res.status(404).json({ message: 'Personnel not found' });
    res.json({ message: 'Personnel removed' });
  });
});

// Additional endpoints for family child relation and family member location
app.get('/club_member_', (req, res) => {
  database.query('SELECT * FROM Club_Member_Relationship', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

