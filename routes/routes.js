const express = require('express');
const router = express.Router();
const multer = require('multer');
const User = require('../models/user');
const fs = require('fs');
const { resourceLimits } = require('worker_threads');

//image upload

var storage = multer.diskStorage({

    destination: function (req, file, callback) { 

        callback(null, "./uploads");
    },
    filename: function (req, file, callback) { 

        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
    }

});

var upload = multer({

    storage: storage,
    
}).single("image")

// Insert an user into database route

router.post('/add', upload ,async(req, res) => { 
    
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.filename
        });

        await user.save();
        // console.log('User saved successfully');
        req.session.message = {
            type: 'success',
            message: 'User added successfully'
        };
        res.redirect('/');
    } catch (err) {
        console.error('Error saving user:', err);
        res.json({ message: err.message, type: 'danger' });
    }

})

router.get('/', async(req, res) => {   

    // res.render('index', {'title':"Home Page"})
   try {
    const users = await User.find(); // Use await to wait for the promise
    res.render('index', { title: 'Home page', users });
  } catch (err) {
    res.json({ message: err.message }); // Handle errors
  }
         
});

router.get('/edit/:id', async(req, res) => { 

    try {
        
        let id = req.params.id;
        // console.log(id);
        const user_detail = await User.findById(id);
        // console.log(user_detail);
        res.render('edit_user', {

            title: 'Edit User Page',
            user : user_detail
        })
    }
    catch (err) { 

        res.json({ message: err.message });
    }
    
})

router.get('/add', (req, res) => { 

    res.render('add_user', { 'title': "Add User" });
})

// Update User route

router.post('/update/:id', upload, async (req, res) => {

    let id = req.params.id;
    let new_img = "";

    if (req.file) {

        new_img = req.file.filename;
        try {

            fs.unlinkSync("./uploads/" + req.body.old_image);

        } catch (err) {

            console.log(err);
        }

    }
    else {

        new_img = req.body.old_image;
    }

    try {

        const updatedData = {

            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_img
        };

        await User.findByIdAndUpdate(id, updatedData, { new: true });
        req.session.message = {

            type: 'success',
            message: 'User Updated Successfully'
        }

        res.redirect('/');

    }
    catch (err) {

        res.json({ message: err.message, type: 'danger' });
    }

});

router.get('/delete/:id', async(req, res) => { 

    try {

        let id = req.params.id;
        let user_data = await User.findById(id);

        await User.findByIdAndDelete(id);

        if (user_data.image) { 

            try {
                
                fs.unlinkSync('./uploads/' + user_data.image);
            }
            catch (err) { 

                console.log(err);
            }
        }

        req.session.message = {

            type: 'info',
            message : 'User Deleted Successfully...'
        }
        res.redirect('/');

    } catch (err) { 

        res.json({ message: err.message });
    }


})





module.exports = router;
