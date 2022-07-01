const express = require("express");
const bcrypt = require("bcrypt");
const multer = require("multer");
const dbFunction = require("../db/mongoose");
const auth = require("../middlewares/auth");
const {
  sendWelcomeEmail,
  sendCancelationEmail,
} = require("../emails/account");

const router = new express.Router();

const ReqInfo = {
  CREATE_USER: "CREATE_USER",
  GET_USER: "GET_USER",
  GET_ALL_USERS: "GET_ALL_USERS",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
  LOGIN_USER: "LOGIN_USER",
  LOGOUT_USER: "LOGOUT_USER",
  USER_PROFILE: "USER_PROFILE",
  UPLOAD_FILE: "UPLOAD_FILE",
  DELETE_UPLOAD_PROFILE: "DELETE_UPLOAD_PROFILE",
  GET_PROFILE_PIC: "GET_PROFILE_PIC",
};

//Every single request to the API is going to require authentication
//With exception of login and signup. For everything else the client
//needs to provide that authentication token and the server is going
//to validate before performing whatever operations they require to.

//Fire the hanlder function when client make a POST request on route
//"/user" (send back a response to that client).
//Sign Up (Create User) (Needs to be public) (API send back auth token)
router.post("/", async (req, res) => {
  req.body.requestInfo = ReqInfo.CREATE_USER;
  //Hash the plain text password using hash algorthim
  req.body.password = await bcrypt.hash(req.body.password, 8);
  try {
    const result = await dbFunction(req.body);
    await sendWelcomeEmail(result.user.email, result.user.name);
    res
      .setHeader("Content-Type", "application/json")
      .status(201) //Object added to the database
      .send({
        msg: "User successfully registerd",
        user: result.user,
        token: result.token,
      });
  } catch (error) {
    res
      .setHeader("Content-Type", "text/html")
      .status(400) //(Bad request made by client)
      .send(error.message);
  }
});

//Provide Login Credentials (Authentication - Who you say you are?)
//(route must be public so user can log in). You must be authenticated
//to perform the rest of the CRUD operation only user not someone else
router.post("/login", async function (req, res) {
  const requestObj = {
    requestBody: req.body,
    requestInfo: ReqInfo.LOGIN_USER,
  };
  try {
    const result = await dbFunction(requestObj);
    delete requestObj.requestBody;
    requestObj._id = result.user._id;
    requestObj.requestInfo = ReqInfo.USER_PROFILE;
    //Do not expose sensitive data to the client (tokens & password)
    const userProfile = await dbFunction(requestObj);
    //At this point we are provinding the authentication token
    //to the client and the client can take this and make another
    //request that require authentication
    res.status(200).send({
      msg: "Logged In Successfully",
      user: userProfile,
      token: result.token,
    });
  } catch (error) {
    res.status(404).send(error.message);
  }
});

//This endpoint require authentication because you have to be authenticated
//to log out. Now here we want to have access to particular token that they
//have used when authenticating (if i have five sessions where i'm logged in,
//such as for my personal computer, phone and tablet and i logged out of one
//of these devices, and need to make sure i'm not logged out of all other
//devices.) We need to target a specific token that was used when they
//authenticated in auth middleware function.
router.post("/logout", auth, async function (req, res) {
  const reqObj = { requestInfo: ReqInfo.LOGOUT_USER };
  try {
    //parameter token is an object element of tokens array
    req.user.tokens = req.user.tokens.filter((token) => {
      //to access token of the object (filter out the token that match)
      return token.token !== req.token;
    });
    reqObj.user = req.user;
    await dbFunction(reqObj);
    res.status(200).send({ msg: "You have logged out successfully" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Logout of all sessions (logged out of all devices)
router.post("/logoutAll", auth, async function (req, res) {
  try {
    const reqObj = { requestInfo: ReqInfo.LOGOUT_USER };
    req.user.tokens = []; //remove all tokens
    reqObj.user = req.user;
    await dbFunction(reqObj);
    res.status(200).send({ msg: "You have logged out of all devices" });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

/**
 * You can provide multiple callback functions that behave
 * like middleware to handle a request (auth middleware function)
 * When client make GET request to route "/users", its first going
 * to run the middleware function auth, then it run the route handler
 * if the middleware calls the next() function
 */

//Fire route handler function when client make GET Request
//on route "/users" (Get all user documents)
router.get("/me", auth, async (req, res) => {
  res
    .setHeader("Content-Type", "application/json")
    .status(200)
    .send(req.user);
});

//You should be able to update user profile if you are authenticated
router.patch("/me", auth, async function (req, res) {
  const passwordExist = req.body.password ? true : false;
  if (passwordExist) {
    //If user want to update password
    req.body.password = await bcrypt.hash(req.body.password, 8);
  }
  //returns an array of object's property names
  const updatesProps = Object.keys(req.body);
  const allowPropsUpdate = ["name", "email", "password", "age"];
  //if callbackFn returns a truthy value for all elements,
  //every() function returns true
  const isValidOperation = updatesProps.every((update) => {
    return allowPropsUpdate.includes(update);
  });
  if (!isValidOperation) {
    return res.status(400).send("You have an invalid property");
  }
  const reqObj = {
    _id: req.user._id,
    requestInfo: ReqInfo.UPDATE_USER,
    body: req.body,
  };
  try {
    const result = await dbFunction(reqObj);
    res
      .status(200)
      .send({ msg: "User have successfully updated", result });
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/me", auth, async function (req, res) {
  const reqObj = {
    _id: req.user._id,
    requestInfo: ReqInfo.DELETE_USER,
  };
  try {
    const result = await dbFunction(reqObj);
    await sendCancelationEmail(result.email, result.name);
    res.status(200).send({ msg: "User successfully deleted", result });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Multer is a node.js middleware for handling multipart/form-data,
//which is primarily used for uploading files.
//Configure multer - (creating instance of multer)
//Allow any file to be upload to the server
const upload = multer({
  //destination is used to determine within which folder the
  //uploaded files should be stored
  //dest: "avatars",
  limits: {
    fileSize: 1000000, //1MB
  },
  //Optional function to control which files are uploaded. This is
  //called for every file that is processed.
  //first arg - The Express Request object. second arg
  //second arg - Object containing information about the processed file
  fileFilter(req, file, cb) {
    //check if file does not ends with ".png" extension
    if (
      file.originalname.endsWith(".png") ||
      file.originalname.endsWith(".jpg") ||
      file.originalname.endsWith(".jpeg")
    ) {
      // To accept the file to be uploaded
      cb(undefined, true);
    } else {
      return cb(
        new Error(
          "File must support only these extentions: 'png', 'jpeg' ,'jpg'"
        )
      );
    }
  },
});

//Register a multer middleware (similar to auth middleware).
//Accept a single file with the name fieldname. The single
//file will be stored in req.file. filename is used to determine
//what the file should be named inside the folder
router.post(
  "/me/avatar",
  //Make sure users are authenticated before accepting their
  //upload image.
  auth,
  //Validate and accept upload
  upload.single("avatar"),
  //Send the success message to the client
  async (req, res) => {
    //buffer contains a buffer of all of the binary data for
    //that file (We can only access this when we don't have
    //'desc option set up')
    req.user.avatar = req.file.buffer;
    const requestObject = {
      requestInfo: ReqInfo.UPLOAD_FILE,
      user: req.user,
    };
    try {
      await dbFunction(requestObject);
      res.status(200).send();
    } catch (error) {
      res.status(500).send(error.message);
    }
  },
  //This middleware function call signature lets Express know
  //the function is designed to handle errors.
  (error, req, res, next) => {
    res.status(400).send({ err: error.message });
  }
);

router.delete("/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  const requestObject = {
    requestInfo: ReqInfo.DELETE_UPLOAD_PROFILE,
    user: req.user,
  };
  try {
    await dbFunction(requestObject);
    res.status(200).send({ msg: "Successfully deleted profile pic" });
  } catch (error) {
    res.status(500).send({ msg: error.message });
  }
});

router.get("/:id/avatar", async function (req, res) {
  const requestObject = {
    requestInfo: ReqInfo.USER_PROFILE,
    _id: req.params.id,
  };
  try {
    const user = await dbFunction(requestObject);
    //Handle if there is no user or user doesn't have an image
    //associated with their account.
    if (!user) {
      throw new Error("There is no user with this account");
    }
    if (!user.avatar) {
      throw new Error(
        "You don't have profile image asscoiated with your account"
      );
    }
    //We need to tell the requester what kind of data they're getting
    //back. By setting a response header by use set method
    res.setHeader("Content-Type", "text/html");
    res.status(200);
    const mimeType = "image/jpeg"; // e.g., image/png
    //Convert buffer to base64 string to get the image
    res.send(
      `<img src="data:${mimeType};base64,${user.avatar.toString(
        "base64"
      )}" width="200" height="180" />`
    );
  } catch (error) {
    res.status(404).send(error.message);
  }
});

module.exports = router;
