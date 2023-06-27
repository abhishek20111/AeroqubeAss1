const express = require('express')
const router = express.Router()

const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const User = mongoose.model('AssigR2')
const Unit_User = mongoose.model('UnitChanger')
const Template = mongoose.model('template')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const jwtDecode = require('jwt-decode')


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


router.post("/register", async (req, res) => {
    const { name, email, password, CurrentUserType } = req.body;
    if (!name || !email || !password || !currentRole) {
        return res.send({ error: "Fill Complete details" })
    }

    const encryptedPassword = await bcrypt.hash(password, 10);
    try {
        const oldUser = await User.findOne({ email });

        if (oldUser) {
            return res.json({ error: "User Exists" });
        }
        const response = await User.create({
            name,
            email,
            password: encryptedPassword,
            role: CurrentUserType,
        });
        return res.json({ success: "User Registered Successfully" });
        // res.send({ status: "Data Save Succesfully" });
    } catch (error) {
        res.status(400).send({ message: error });
    }
});

router.post("/loginUser", async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        return res.json({ error: "User Not found" });
    }
    if (await bcrypt.compare(password, user.password)) {
        console.log(user);
        const token = jwt.sign({ email: user.email, role: user.role, name: user.name }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });

        if (res.status(201)) {
            return res.json({ status: "ok", message: "Login Successfully", data: token });
        } else {
            return res.json({ error: "error" });
        }
    }
    res.json({ status: "error", error: "Invalid Authentication" });
});


// it is route for super admin it give all user name email id  and role so that super user can modify it 
router.get('/getDataAll', async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).send('No token provided');
    }

    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { email, role } = decodedToken;
        // console.log(email); 

        if (role === 'User') {
            return res.status(403).send('Access denied. User is not an admin');
        }
        const data = await User.find().select('name email role').sort("-createdAt")

        res.status(200).send(data);
        // console.log(data);
    } catch (err) {
        console.error('Server error ' + err);
        res.status(500).send('Server error' + err);
    }
});


//save edited data 


// router.post('/saveData', async (req, res) => {
//     const { HeadEmail, userId, dataId, data, history } = req.body;
//     console.log(HeadEmail + ' ' + userId + ' ' + dataId + ' ' );

//     try {
//       // Find the user by their userId
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       } 

//       // Find the data by its dataId
//       const dataIndex = user.Collection.findIndex(item => item._id.toString() === dataId);
//     //   console.log(dataIndex);

//       if (dataIndex === -1) {
//         return res.status(404).json({ error: 'Data not found' });
//       }

//       // Update only the specified fields in the data object
//       const existingData = user.Collection[dataIndex];
//       const updatedData = { ...existingData, ...data };

//       // Update the data in the user's Collection
//       user.Collection[dataIndex] = updatedData;

//       // Add the updated data to the user's History
//       if (!user.History) {
//         user.History = {};
//       }

//       // Check if the email ID exists in the user's history
//       if (!user.History[HeadEmail]) {
//         user.History[HeadEmail] = [];
//       }

//       // Append the new history data to the email's history array
//       user.History[HeadEmail].push(...[history]);


//       // Save the updated user
//       await user.save();

//       res.json({ success: true, History: user.History, data: updatedData });
//     } catch (error) {
//       console.error('Error saving data:', error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });


// router.post('/saveData', async (req, res) => {
//     const { HeadEmail, userId, dataId, data, history } = req.body;
//     console.log(HeadEmail + ' ' + userId + ' ' + dataId + ' ');

//     try {
//       // Find the user by their userId
//       const user = await User.findById(userId);
//       if (!user) {
//         return res.status(404).json({ error: 'User not found' });
//       }

//       // Find the data by its dataId
//       const dataIndex = user.Collection.findIndex(item => item._id.toString() === dataId);
//       // console.log(dataIndex);

//       if (dataIndex === -1) {
//         return res.status(404).json({ error: 'Data not found' });
//       }

//       // Update the specific fields in the data object
//       const existingData = user.Collection[dataIndex];
//       Object.assign(existingData, data);

//       // Add the updated data to the user's History
//       if (!user.History) {
//         user.History = {};
//       }

//       // Check if the email ID exists in the user's history
//       if (!user.History[HeadEmail]) {
//         user.History[HeadEmail] = [];
//       }

//       // Append the new history data to the email's history array
//       user.History[HeadEmail].push(history);

//       // Save the updated user
//       await user.save();

//       res.json({ success: true, History: user.History, data: existingData });
//     } catch (error) {
//       console.error('Error saving data:', error);
//       res.status(500).json({ error: 'Server error' });
//     }
//   });



router.post('/saveData', async (req, res) => {
    const { HeadEmail, userId, dataId, data, history } = req.body;
    // console.log(HeadEmail + ' ' + userId + ' ' + dataId + ' ' + "Hitsory" + history);

    try {
        // Find the user by their userId
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the data by its dataId
        const dataIndex = user.Collection.findIndex(item => item._id.toString() === dataId);
        // console.log(dataIndex);

        if (dataIndex === -1) {
            return res.status(404).json({ error: 'Data not found' });
        }

        // Update the specific fields in the data object
        const existingData = user.Collection[dataIndex];
        Object.assign(existingData, data);

        const time = new Date();
        const timeString = time.toISOString();

        history.editor = HeadEmail;
        history.time = timeString;

        // console.log("------------------------------------------------------------------------------------Actual History", JSON.stringify(history));

        existingData.History.push(history);

        // Save the updated user
        await user.save();

        res.json({ success: true, History: user.History, data: existingData });
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).json({ error: 'Server error' });
    }
});











//create unit for Unit Schema
router.post("/createDocument", (req, res) => {
    const id = req.body.id; // Assuming the ID is sent in the request body

    const newDocument = new Unit_User({
        docID: id,
    });

    newDocument
        .save()
        .then(() => {
            console.log("Document created");
            res.status(200).json({ message: "Document created successfully" });
        })
        .catch((error) => {
            console.error("Error creating document:", error);
            res.status(500).json({ error: "Error creating document" });
        });
});

router.post("/replaceNames", async (req, res) => {
    const { id, names } = req.body;
    console.log(names);
    try {
        let checkup = await Unit_User.findOneAndUpdate({ docID: id }, { dropdown: names }, { new: true });

        if (checkup) {
            res.status(200).json({ message: "Names replaced successfully", data: checkup });
        } else {
            // Document not found, create a new one
            const newDocument = new Unit_User({ docID: id, dropdown: names });
            checkup = await newDocument.save();
            res.status(200).json({ message: "New document created", data: checkup });
        }
    } catch (error) {
        console.error("Error replacing names:", error);
        res.status(500).json({ message: "An error occurred while replacing names" });
    }
});

router.post("/replaceut", async (req, res) => {
    const { id, ut } = req.body;

    try {
        // Update the document to replace the "dropdown" array with new values
        await Unit_User.findOneAndUpdate({ docID: id }, { ut: ut });

        res.status(200).json({ message: "Ut replaced successfully" });
    } catch (error) {
        console.error("Error replacing ut:", error);
        res.status(500).json({ message: "An error occurred while replacing ut" });
    }
});

router.post("/replaceproperty", async (req, res) => {
    const { id, property } = req.body;

    try {
        // Update the document to replace the "dropdown" array with new values
        await Unit_User.findOneAndUpdate({ docID: id }, { property: property });

        res.status(200).json({ message: "property replaced successfully" });
    } catch (error) {
        console.error("Error replacing property:", error);
        res
            .status(500)
            .json({ message: "An error occurred while replacing property" });
    }
});

router.post("/replacebuilder", async (req, res) => {
    const { id, builder } = req.body;

    try {
        await Unit_User.findOneAndUpdate({ docID: id }, { builder: builder });

        res.status(200).json({ message: "builder replaced successfully" });
    } catch (error) {
        console.error("Error replacing builder:", error);
        res
            .status(500)
            .json({ message: "An error occurred while replacing builder" });
    }
});

router.post("/replacetitle", async (req, res) => {
    const { id, title } = req.body;

    try {
        // Update the document to replace the "dropdown" array with new values
        await Unit_User.findOneAndUpdate({ docID: id }, { title: title });

        res.status(200).json({ message: "title replaced successfully" });
    } catch (error) {
        console.error("Error replacing title:", error);
        res
            .status(500)
            .json({ message: "An error occurred while replacing title" });
    }
});

router.post("/replaceunits", async (req, res) => {
    const { id, unit } = req.body;
    try {
        // Update the document to replace the "unit" array with new values
        await Unit_User.findOneAndUpdate({ docID: id }, { unit: unit });

        res.status(200).json({ message: "Units replaced successfully in backend" });
    } catch (error) {
        console.error("Error replacing units:", error);
        res
            .status(500)
            .json({ message: "An error occurred while replacing units" });
    }
});

router.post("/replacestatus1", async (req, res) => {
    const { id, status1 } = req.body;
    try {
        // Update the document to replace the "status1" array with new values
        await Unit_User.findOneAndUpdate({ docID: id }, { status1: status1 });

        res.status(200).json({ message: "Status1 replaced successfully" });
    } catch (error) {
        console.error("Error replacing Status1:", error);
        res
            .status(500)
            .json({ message: "An error occurred while replacing Status1" });
    }
});

router.post("/replacestatus2", async (req, res) => {
    const { id, status2 } = req.body;
    try {
        // Update the document to replace the "status1" array with new values
        await Unit_User.findOneAndUpdate({ docID: id }, { status2: status2 });

        res.status(200).json({ message: "Status1 replaced successfully" });
    } catch (error) {
        console.error("Error replacing Status1:", error);
        res
            .status(500)
            .json({ message: "An error occurred while replacing Status1" });
    }
});

router.get("/fetchAllById/:docID", async (req, res) => {
    const { docID } = req.params;
    console.log(docID);

    try {
        // Find the document with the specified ID
        const document = await Unit_User.findOne({ docID: docID });

        if (!document) {
            return res.status(404).json({ message: "Document not found" });
        }

        const all = document; // Retrieve the "dropdown" field from the document
        console.log(all);
        res.status(200).json(all);
    } catch (error) {
        console.error("Error fetching names:", error);
        res.status(500).json({ message: "An error occurred while fetching names" });
    }
});





// it is route which use to get data of any particular user
router.post('/getData', async (req, res) => {
    const { email } = req.body;
    try {
        const data = await User.findOne({ email }).
            populate("Collection", "Address Unit_No City Zip_Code State property_Description Builder_Type Age_of_Builder Property_Type Square_Footage Parking_Type Title Date status EndDate status Bedroom Bedrooms AddedFields Appliance_Include Utilies Utilies_Include ExttraAppliance_Include School SchoolDistance Market MarketDistance Community CommunityDistance Pets_alloed Rentals Latitude Longitude Image_url Message")
            .select("-password")
            .sort("-createdAt")
        res.status(200).send(data);
        console.log(data);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }
});


// this route can change the role from user to admin 
router.put('/changeUserRole', async (req, res) => {
    const { userEmail, role } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).send('No token provided');
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { email, role: currentRole } = decodedToken;

        if (currentRole !== 'Super Admin') {
            return res.status(403).send('Access denied. Only Super Admin can change user roles');
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update the user's role
        user.role = role;
        await user.save();

        res.status(200).send(`Role updated for ${user.name}`);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).send('Server error: ' + err);
    }
});


router.post('/createTemplate', async (req, res) => {
    try {
        const { name, forms, create_by } = req.body;

        // Create a new template object
        const template = new Template({
            name,
            forms,
            create_by
        }); 

        // Save the template to the database
        await template.save();
        console.log(template);
        res.status(201).json({ success: true, message: 'Template created successfully.' });
    } catch (error) {
        console.error("Error in createTemplate router - " + error);
        res.status(500).json({ success: false, message: 'An error occurred while creating the template.' });
    }
});


router.get('/getAllTemplates', async (req, res) => {
    try {
        // Fetch all templates from the database
        console.log("getAllTemplates");
        const templates = await Template.find();
        res.status(200).json({ success: true, data: templates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the templates.' });
    }
});

router.post('/giveTemplate', async (req, res) => {
    try {
        const { email, templateId } = req.body;
         // console.log("giveTemplate "+ email +" "+ templateId);
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        const template = await Template.findById(templateId);

        if (!template) {
            return res.status(404).json({ success: false, message: 'Template not found.' });
        }

        // Check if the email is already present in the template's user array
        if (!template.user.includes(email)) {
            // Add the email to the template's user array
            template.user.push(email);
            await template.save();
        }
        res.status(200).json({ success: true, message: 'Template assigned successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while assigning the template.' });
    }
});


router.get('/getUserProfile', async (req, res) => {
    console.log("getUserProfile \n\n\n\n");
    try {
        const { email } = req.query;
        console.log(email);
        // Find the user by email in the User database
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found.' });
        }

        // Get the template details based on the IDs stored in the user's template array
        const templateIds = user.template;
        const templates = await Template.find({ _id: { $in: templateIds } });

        res.status(200).json({ success: true, template_Info: templates });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'An error occurred while fetching the user profile.' });
    }
});

router.post("/fill-form", async (req, res) => {
    try {
        const { a1, a2, a3, a4, a5, a6, b1, b2, b3, b4, b5, b6, c1, c2, c3, c4, d1, d2, d3, e1, e2, e3, e4, f1, f11, f2, f22, f3, f33, f4, f5, g1, g2, h1, h2 } = req.body.Collection[0]

        console.log("request body " + req.body);
        const { email, role } = jwtDecode(req.headers.authorization.split(" ")[1]);
        const user = await User.findOneAndUpdate(
            { email, role },
            {
                $push: {
                    Collection: {
                        Address: a1,
                        Unit_No: a2,
                        City: a3,
                        Zip_Code: a4,
                        State: a5,
                        property_Description: a6,
                        Builder_Type: b1,
                        Age_of_Builder: b2,
                        Property_Type: b3,
                        Square_Footage: b4,
                        Parking_Type: b5,
                        Title: b6,
                        Date: c1,
                        Status: c2,
                        EndDate: c3,
                        status: c4,
                        Bedroom: d1,
                        Bedrooms: d2,
                        AddedFields: d3,
                        Appliance_Include: e1,
                        Utilies: e2,
                        Utilies_Include: e3,
                        ExtraAppliance_Include: e4,
                        School: f1,
                        SchoolDistance: f11,
                        Market: f2,
                        MarketDistance: f22,
                        Community: f3,
                        CommunityDistance: f33,
                        Pets_alloed: f4,
                        Rentals: f5,
                        Latitude: g1,
                        Longitude: g2,
                        Image_url: h1,
                        Message: h2
                    }
                }
            },
            { new: true }
        ).select("name email status").populate("Collection", "Address City");
        console.log("userData " + user);
        res.status(200).json({ status: "ok", message: "Data Saved Successfully", data: user });
    } catch (error) {
        console.log("error in fill form route is " + error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router; 