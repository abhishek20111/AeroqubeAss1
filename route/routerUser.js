const express = require('express')
const router = express.Router()

const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const User = mongoose.model('AssigR2')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const userSchema = require('../model/UserData.js')
const jwtDecode = require('jwt-decode')


router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());


router.post("/register", async (req, res) => {
    const { name, email, password, CurrentUserType } = req.body;

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
    res.json({ status: "error", error: "InvAlid Password" });
});


//it is route for normal admin to check all user data , like name , email and id
// router.get('/getDataUser', async (req, res) => {
//     try {
//         const data = await User.find({ role: 'User' })
//             .select('name email')

//         res.status(200).send(data);
//         console.log(data);
//     } catch (err) {
//         console.error(err);
//         res.status(500).send("Server error" + err);
//     }
// });



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
        console.log(data);
    } catch (err) {
        console.error('Server error ' + err);
        res.status(500).send('Server error' + err);
    }
});


// it is route which use to get data of any particular user
router.post('/getData', async (req, res) => {
    const { email } = req.body;
    try {
        const data = await User.findOne({ email }).
            populate("Collection", "Address Unit_No City Zip_Code State property_Description Builder_Type Age_of_Builder Square_Footage Parking_Type Title Date status EndDate status Bedroom Bedrooms AddedFields Appliance_Include Utilies Utilies_Include ExttraAppliance_Include School SchoolDistance Market MarketDistance Community CommunityDistance Pets_alloed Rentals Latitude Longitude Image_url Message")
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
    const { UserEmail } = req.body;
    const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
    if (!token) {
        return res.status(401).send('No token provided');
    }
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const { email, role } = decodedToken;
        
        if (role !== 'Super Admin') {
            return res.status(403).send('Access denied. Only Super Admin can change user roles');
        }
        
        const user = await User.findOne({ email: UserEmail });
        if (!user) {
            return res.status(404).send('User not found');
        }

        // Update the user's role
        user.role = "Admin";
        await user.save();
        res.status(200).send(`User role updated successfully of ${user.name}`);
    } catch (err) {
        console.error('Server error ' + err);
        res.status(500).send('Server error' + err);
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
                        Builder_Type: b3,
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
        res.status(200).json({ status: "ok", message: "Form data saved successfully", data: user });
    } catch (error) {
        console.log("error in fill form route is " + error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router; 