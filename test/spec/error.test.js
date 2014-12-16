/**
 * @fileOverview Signed Error Objects tests.
 */
// var sinon = require('sinon');
var chai = require('chai');
var expect = chai.expect;
// var __ = require('lodash');

require('../lib/tester.lib');

chai.config.includeStack = true;

// lib to test
var appError = require('../..');

describe('Error Objects', function () {

  describe('API Surface', function() {
    function testError (instance) {
      expect(instance).to.be.instanceOf(appError.BaseError);
      expect(instance).to.be.instanceOf(Error);
      expect(instance.error).to.be.true;
      expect(instance.isNodeon).to.be.true;
      expect(instance.httpCode).to.be.a('number');
      expect(instance.type).to.be.a('string');
      expect(instance.stack).to.have.length.above(100);
    }

    it('Signed Error instances should be instances of Error', function() {
      var error = new appError.Error();

      expect(error).to.be.instanceOf(appError.Error);
      expect(error).to.be.instanceOf(Error);
      expect(error).to.have.property('name', 'AppBaseError');
      expect(error).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'httpCode',
        'type',
        'isNodeon',
      ]);
    });
    it('Validation Error should be instance of BaseError, Error', function(){
      var validationError = new appError.Validation();
      testError(validationError);
      expect(validationError).to.have.property('name', 'AppValidationError');
      expect(validationError.toApi).to.be.a('function');
      expect(validationError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'errors',
        'httpCode',
        'type',
        'isNodeon',
      ]);
    });
    it('Unknown Error should be instance of BaseError, Error', function(){
      var unknownError = new appError.Unknown();
      testError(unknownError);
      expect(unknownError).to.have.property('name', 'AppUnknownError');
      expect(unknownError.toApi).to.be.a('function');
      expect(unknownError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'httpCode',
        'type',
        'isNodeon',
      ]);

    });
    it('Database Error should be instance of BaseError, Error', function(){
      var databaseError = new appError.Database();
      testError(databaseError);
      expect(databaseError).to.have.property('name', 'AppDatabaseError');
      expect(databaseError.toApi).to.be.a('function');
      expect(databaseError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'type',
        'httpCode',
        'subType',
        'isNodeon',
      ]);
    });
    it('Authentication Error should be instance of BaseError, Error', function(){
      var authenticationError = new appError.Authentication();
      testError(authenticationError);
      expect(authenticationError).to.have.property('name', 'AppAuthenticationError');
      expect(authenticationError.toApi).to.be.a('function');
      expect(authenticationError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'type',
        'httpCode',
        'subType',
        'isNodeon',
      ]);
    });
    it('JSON Error should be instance of BaseError, Error', function(){
      var jsonError = new appError.JSON();
      testError(jsonError);
      expect(jsonError).to.have.property('name', 'AppJSONError');
      expect(jsonError.toApi).to.be.a('function');
      expect(jsonError).to.have.keys([
        'name',
        'message',
        'srcError',
        'error',
        'httpCode',
        'type',
        'isNodeon',
      ]);
    });
  });

  describe('Error Expectations', function () {
    it('the .toApi method should operate as expected', function () {
      var error = new appError.Error();
      var apiRes = error.toApi();

      expect(apiRes).to.have.keys([
        'name',
        'message',
        'error',
        'httpCode',
        'isNodeon',
        'type',
      ]);

      expect(apiRes.stack).to.be.an('undefined');
    });
    it('Message propagates using Ctor', function () {
      var error = new appError.Error('message');

      expect(error.message).to.equal('message');
    });
  });

  describe.only('Edge Cases', function () {
    it('should handle third-party error objects with overlapping properties', function () {
      var err = new Error('A message');
      err.name = 'CastError';
      err.type = 'ObjectId';
      err.error = 'bogus';
      err.srcError = 'bogus';
      err.httpCode = 'bogus';
      err.isNodeon = 'bogus';


      var nodeonError = new appError.Error(err);
      /*jshint camelcase:false */
      expect(nodeonError.src_name).to.equal('CastError');
      expect(nodeonError.src_error).to.equal('bogus');
      expect(nodeonError.src_srcError).to.equal('bogus');
      expect(nodeonError.src_httpCode).to.equal('bogus');
      expect(nodeonError.src_isNodeon).to.equal('bogus');

      expect(nodeonError.name).to.equal('AppBaseError');
      expect(nodeonError.error).to.be.true;
      expect(nodeonError.type).to.equal('error');
      expect(nodeonError.httpCode).to.equal(500);
      expect(nodeonError.isNodeon).to.be.true;
    });
  });
});
