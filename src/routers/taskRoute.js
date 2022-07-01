const express = require("express");
const dbFunction = require("../db/mongoose");
const auth = require("../middlewares/auth");

//Create Router for task
const router = new express.Router();

const ReqInfo = {
  CREATE_TASK: "CREATE_TASK",
  GET_ALL_TASKS: "GET_ALL_TASKS",
  GET_TASK: "GET_TASK",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
};

//To make sure that when a task is created, it's associated
//with the person who is authticated
router.post("/", auth, async (req, res) => {
  const reqObject = {
    requestBody: req.body,
    requestInfo: ReqInfo.CREATE_TASK,
    userId: req.user._id,
  };
  try {
    const result = await dbFunction(reqObject);
    res
      .setHeader("Content-Type", "application/json")
      .status(201)
      .send({ msg: "Task added", result: result });
  } catch (error) {
    res
      .setHeader("Content-Type", "text/html")
      .status(400)
      .send(error.message);
  }
});

//use query parameters/string to allow for data filtering
//GET all completed. URL -localhost:3000/tasks?completed=true
//Pagination is configured using limit and skip to get data.
//If a client wanted the first page of 10 tasks, limit would
//be set to 10 and skip would be set to 0 . If the client
//wanted the third page of 10 tasks, limit would be set to 10
//and skip would be set to 20.
//GET /tasks?completed=true&limit=10&skip=0
router.get("/", auth, async (req, res) => {
  try {
    const { completed, limit, skip, sortBy } = req.query;
    //Return an array of document objects when called find()
    const requestObj = {
      requestInfo: ReqInfo.GET_ALL_TASKS,
      owner_id: req.user._id,
      completed,
      limit,
      skip,
      sortBy,
    };
    const results = await dbFunction(requestObj);
    if (results.length === 0) {
      return res
        .setHeader("Content-Type", "text/html")
        .status(404)
        .send("Tasks not found in our database system ");
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

//route parameter to capture dynamic value on the url '/:id'
router.get("/:id", auth, async (req, res) => {
  const requestObj = {
    _id: req.params.id,
    owner_id: req.user._id,
    requestInfo: ReqInfo.GET_TASK,
  };
  try {
    const result = await dbFunction(requestObj);
    if (!result) {
      return res
        .setHeader("Content-Type", "text/html")
        .status(404)
        .send(`task not found with id ${requestObj._id}`);
    }
    res
      .setHeader("Content-Type", "application/json")
      .status(200)
      .send(result);
  } catch (error) {
    res
      .setHeader("Content-Type", "text/html")
      .status(404)
      .send(`Task not found with id ${requestObj._id}`);
  }
});

router.patch("/:id", auth, async function (req, res) {
  //returns an array of object's property names
  const updatesProps = Object.keys(req.body);
  const allowPropsUpdate = ["description", "completed"];
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
    owner_id: req.user._id,
    requestInfo: ReqInfo.UPDATE_TASK,
    body: req.body,
  };
  try {
    const result = await dbFunction(reqObj);
    console.log(result);
    if (!result) {
      return res.status(404).send("Task not found");
    }
    res.status(200).send(result);
  } catch (error) {
    return res.status(400).send(error.message);
  }
});

router.delete("/:id", auth, async function (req, res) {
  const reqObj = {
    _id: req.params.id,
    owner_id: req.user._id,
    requestInfo: ReqInfo.DELETE_TASK,
  };
  try {
    const result = await dbFunction(reqObj);
    if (!result) {
      return res.status(404).send("Task not found");
    }
    res.status(200).send({ msg: "Task successfully deleted", result });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
