const sinon = require("sinon");
const expect = require("chai").expect;
const bcrypt = require("bcrypt");

const sequelize = require("../test-database");
const User = require("../models/User/User");
const authController = require("../controllers/auth");

describe("auth controller - sign up", function () {
  it("should throw a 500 error when accessing the database", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "test@test.com",
        password: "password",
      },
    };

    authController
      .postSignup(req, {}, () => {})
      .then((result) => {
        expect(result).to.be.an("error");
        done();
      })
      .catch((error) => {
        done(error);
      });

    User.findOne.restore();
  });

  it("should throw an error if email is already registered", function (done) {
    const req = {
      body: {
        email: "test@test.com",
        password: "password",
      },
    };

    sinon.stub(User, "findOne");
    User.findOne.returns({ email: "test@test.com", userId: 1 });

    authController
      .postSignup(req, {}, () => {})
      .then((result) => {
        expect(result).to.be.an("error");
        expect(result).to.have.property("code", 422);
        done();
      })
      .catch((error) => {
        done(error);
      });

    User.findOne.restore();
  });

  it("should add new user's data to the database", function (done) {
    sequelize
      .sync()
      .then(() => {
        const req = {
          body: {
            email: "test" + Math.random() + "@test.com",
            password: "password",
          },
        };
        const res = {
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          statusCode: undefined,
          json: function (data) {
            this.data = data;
            return this;
          },
          data: undefined,
        };
        const result = authController.postSignup(req, res, () => {});
        return result;
      })
      .then((res) => {
        expect(res).to.have.property("statusCode", 201);
        expect(res.data).to.have.property("userId");
        sequelize.truncate();
      })
      .then(() => {
        done();
      })
      .catch((error) => {
        done(error);
      });
  });
});

describe("auth controller - login", function () {
  before(function (done) {
    sequelize
      .sync()
      .then(() => {
        return bcrypt.hash("password", 12);
      })
      .then((hashedPassword) => {
        User.create({ email: "test@test.com", password: hashedPassword });
        done();
      });
  });

  it("should return an error if user is not registered yet", function (done) {
    const req = {
      body: {
        email: "notexistingemail@test.com",
        password: "password",
      },
    };
    authController
      .postLogin(req, {}, () => {})
      .then((res) => {
        expect(res).to.be.an("error");
        expect(res).to.have.property("code", 422);
        done();
      });
  });

  it("should return a 200 res after login", function (done) {
    const req = {
      body: {
        email: "test@test.com",
        password: "password",
      },
    };

    const res = {
      status: function (code) {
        this.code = code;
        return this;
      },
      code: 500,
      json: function (data) {
        this.data = data;
        return this;
      },
      data: "Error",
    };

    authController
      .postLogin(req, res, () => {})
      .then((res) => {
        expect(res).to.have.property("code", 200);
        expect(res).to.have.property("data");
        expect(res.data).to.have.property("userId");
        expect(res.data).to.have.property("token");
        expect(res.data).to.have.property("expiresIn");
        done();
      });
  });

  after(function (done) {
    sequelize
      .truncate()
      .then(() => {
        done();
      })
      .catch((error) => {
        done(error);
      });
  });
});