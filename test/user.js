//Make a request to the endpoints (for testing HTTP)
const request = require("supertest");
const app = require("../src/app");
const {
  mongoose,
  dbFunction,
  createUserObject,
} = require("../src/db/mongoose");

const userOne = {
  name: "Elham",
  age: "18",
  email: "Mike@hotmail.com",
  password: "soranXD555",
};

// //beforeEach - Run this callback function before each test case. We need to
// //make sure that every single test case that runs in the same enviroment with
// //the same test data in the database
// beforeEach(async function () {
//   await mongoose.connect(process.env.MONGODB_DRIVER_URL);
//   //Delete all user document objects from the users collection before
//   //running the testcase (Starting off always with empty database)
//   const User = await dbFunction("GET_USER_COLLECTION");
//   await User.deleteMany();
//   //There are test cases that are going to test features like logging in and
//   //in that case we need a User data and save it to the user collection)
//   await createUserObject(User, userOne);
// });

// afterEach(async function () {
//   //await mongoose.disconnect();
//   await mongoose.connection.close();
// });

/**
 * add test cases for the Express API. Each test case will focus on testing a
 * specific endpoint, making assertions about the response from the server.
 */

//Test POST request - Create User/Signup
// describe("POST (Request) /users - Create User/SignUp", function () {
//   it("Should signup a new user successfully", async function () {
//     await request(app)
//       .post("/users")
//       .send({
//         name: "Elham",
//         age: "18",
//         email: "ilhamrezaie@hotmail.com",
//         password: "soranXD555",
//       })
//       .expect(201) //user successfully created
//       .expect("Content-Type", /json/); //Send back JSON data
//   });

//   it("Should fail if user don't provide the required data", async function () {
//     await request(app)
//       .post("/users")
//       .send({
//         age: "18",
//         email: "ilhamrezaie@hotmail.com",
//         password: "soranXD555",
//       })
//       .expect(400)
//       .expect("Content-Type", /html/);
//   });

//   it("Should fail if creating new user with existing email", async function () {
//     await request(app)
//       .post("/users")
//       .send(userOne) //User alreay exist with that email in the database
//       .expect(400) //Bad request
//       .expect("Content-Type", /html/);
//   });
// });

//Test POST request - User Login
// describe("POST (Request) /users/login", function () {
//   it("Should login existing user (Valid credential)", async function () {
//     await request(app)
//       .post("/users/login")
//       .send({
//         email: userOne.email,
//         password: userOne.password,
//       })
//       .expect(200);

//     //console.log(response);
//     //expect(response.status).toBe(200);
//   });

// it("Should not login non-existent user (Invalid Credential)", async function () {
//   await request(app)
//     .post("/users/login")
//     .send({
//       email: "soran@email.com",
//       password: "soran123",
//     })
//     .expect(404);
// });
//});
