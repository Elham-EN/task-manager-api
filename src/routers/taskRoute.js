const express = require("express");
const dbFunction = require("../db/mongoose");

//Create Router for task
const router = new express.Router();

const ReqInfo = {
  CREATE_TASK: "CREATE_TASK",
  GET_ALL_TASKS: "GET_ALL_TASKS",
  GET_TASK: "GET_TASK",
  UPDATE_TASK: "UPDATE_TASK",
  DELETE_TASK: "DELETE_TASK",
};

router.post("/", async (req, res) => {
  req.body.requestInfo = ReqInfo.CREATE_TASK;
  try {
    const result = await dbFunction(req.body);
    res
      .setHeader("Content-Type", "application/json")
      .status(201)
      .send({ result: result });
  } catch (error) {
    res
      .setHeader("Content-Type", "text/html")
      .status(400)
      .send(error.message);
  }
});

router.get("/", async (req, res) => {
  try {
    //Return an array of document objects when called find()
    const results = await dbFunction(ReqInfo.GET_ALL_TASKS);
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

router.get("/:id", async (req, res) => {
  const requestObj = {
    _id: req.params.id,
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

router.patch("/:id", async function (req, res) {
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

router.delete("/:id", async function (req, res) {
  const reqObj = {
    _id: req.params.id,
    requestInfo: ReqInfo.DELETE_TASK,
  };
  try {
    const result = await dbFunction(reqObj);
    if (!result) {
      return res.status(404).send("Task not found");
    }
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
