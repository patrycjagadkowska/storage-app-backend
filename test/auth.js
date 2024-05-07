const expect = require("chai").expect;
const jwt = require("jsonwebtoken");
const sinon = require("sinon");

const isAuth = require("../middleware/isAuth");

describe("auth middleware", function() {
    it("should throw an error if not authorization header", function() {
        const req = {
            get: function(headerName) {
                return null
            }
        };
    
        expect(isAuth.bind(this, req, {}, () => {})).to.throw("Not authenticated!");
    });
    
    it("should throw an error if an Authoriation header is only one string", function() {
        const req = {
            get: function(headerName) {
                return "string";
            }
        };
    
        expect(isAuth.bind(this, req, {}, () => {})).to.throw();
    });

    it("req should have a userId property", function() {
        const req = {
            get: function(headerName) {
                return "token token";
            }
        };
        sinon.stub(jwt, "verify");
        jwt.verify.returns({ userId: "abc" });
        // jwt.verify = function() {
        //     return { userId: "abc" };
        // };
        isAuth(req, {}, () => {});
        expect(req).to.have.property("userId");
        expect(req).to.have.property("userId", "abc");
        expect(jwt.verify.called).to.be.true;
        jwt.verify.restore();
    });

    it("should throw an error if the token is not verified", function() {
        const req = {
            get: function(headerName) {
                return "token token";
            }
        };

        expect(isAuth.bind(this, req, {}, () => {})).to.throw();
    });
});