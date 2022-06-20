const express = require("express");
const dbFunction = require("../db/mongoose");

const router = new express.Router();

const ReqInfo = {
  CREATE_USER: "CREATE_USER",
  GET_USER: "GET_USER",
  GET_ALL_USERS: "GET_ALL_USERS",
  UPDATE_USER: "UPDATE_USER",
  DELETE_USER: "DELETE_USER",
};

//Fire the hanlder function when client make a POST request
//on route "" (send back a response to that client)
router.post("/", async (req, res) => {
  req.body.requestInfo = ReqInfo.CREATE_USER;
  try {
    const result = await dbFunction(req.body);
    res
      .setHeader("Content-Type", "application/json")
      .status(201) //Object added to the database
      .send({ result: result });
  } catch (error) {
    res
      .setHeader("Content-Type", "text/html")
      .status(400) //(Bad request made by client)
      .send(error.message);
  }
});

//Fire route handler function when client make GET Request
//on route "/users" (Get all user documents)
router.get("/", async (req, res) => {
  try {
    //Return an array of document objects when called find()
    const results = await dbFunction(ReqInfo.GET_ALL_USERS);
    if (results.length === 0) {
      return res
        .setHeader("Content-Type", "text/html")
        .status(404)
        .send("Users not found in our database system ");
    }
    res
      .setHeader("Content-Type", "application/json")
      .status(200)
      .send(results);
  } catch (error) {
    res
      .setHeader("Content-Type", "text/html")
      .status(500) //Server Error (Database connection lost)
      .send("Server Problem");
  }
});

//route parameter to capture dynamic value on the url
//Get a single user document object
router.get("/:id", async (req, res) => {
  const requestObj = {
    _id: req.params.id,
    requestInfo: ReqInfo.GET_USER,
  };
  try {
    const result = await dbFunction(requestObj);
    if (!result) {
      return res
        .setHeader("Content-Type", "text/html")
        .status(404)
        .send(`User not found with id ${requestObj._id}`);
    }
    res
      .setHeader("Content-Type", "application/json")
      .status(200)
      .send(result);
  } catch (error) {
    res
      .setHeader("Content-Type", "text/html")
      .status(500)
      .send(`Server Error`);
  }
});

router.patch("/:id", async function (req, res) {
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
    _id: req.params.id,
    requestInfo: ReqInfo.UPDATE_USER,
    body: req.body,
  };
  try {
    const result = await dbFunction(reqObj);
    console.log(result);
    if (!result) {
      return res.status(404).send("User not found");
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

router.delete("/:id", async function (req, res) {
  const reqObj = {
    _id: req.params.id,
    requestInfo: ReqInfo.DELETE_USER,
  };
  try {
    const result = await dbFunction(reqObj);
    if (!result) {
      return res.status(404).send("User not found");
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
