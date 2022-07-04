const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../src/app");
const {
  mongoose,
  dbFunction,
  createUserObject,
} = require("../src/db/mongoose");

const userOne = {
  name: "Elham",
  age: "18",
  email: "mike@hotmail.com",
  password: bcrypt.hashSync("soranXD555", 8),
};

beforeEach(async function () {
  const User = await dbFunction("GET_USER_COLLECTION");
  await User.deleteMany();
  await createUserObject(User, userOne);
});

afterEach(async function () {
  mongoose.disconnect();
});

describe("POST (Request) /users - Create User/Signup User", function () {
  it("Should signup/create a new user", async function () {
    await request(app)
      .post("/users")
      .send({
        name: "Elham",
        age: "18",
        email: "ilhamrezaie@hotmail.com",
        password: "soranXD555",
      })
      .expect(201)
      .expect("Content-Type", /json/);
  });

  it("Should fail if don't provide the required data", async function () {
    await request(app)
      .post("/users")
      .send({
        age: "18",
        email: "ilhamrezaie@hotmail.com",
        password: "soranXD555",
      })
      .expect(400)
      .expect("Content-Type", /html/);
  });

  it("Should fail if creating new user with existing email", async function () {
    await request(app)
      .post("/users")
      .send(userOne)
      .expect(400)
      .expect("Content-Type", /html/);
  });
});

describe("POST (Request) /users/login - Login User", function () {
  it("Should login existing user", async function () {
    await request(app)
      .post("/users/login")
      .send({ email: "mike@hotmail.com", password: "soranXD555" })
      .expect(200)
      .expect("Content-Type", /json/);
  });
  it("Should not login nonexistent user", async function () {
    await request(app)
      .post("/users/login")
      .send({ email: "tike@hotmail.com", password: "soranXD123" })
      .expect(401)
      .expect("Content-Type", /html/);
  });
});

//Test endpoint that requires authentication
