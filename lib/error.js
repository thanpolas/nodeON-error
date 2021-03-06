/**
 * nodeON-error
 * Error Objects for everybody!
 * https://github.com/thanpolas/nodeON-error
 *
 * Copyright (c) 2014 Thanasis Polychronakis
 * Licensed under the MIT license.
 */


/*jshint camelcase:false */
/**
 * @fileoverview Application error codes.
 */

var util = require('util');

var __ = require('lodash');

var appError = module.exports = {};

/** @type {string} The private var with the name to sign the error Objects */
appError._appName = 'App';

/** @enum {string} Error Types */
appError.ErrorType = {
  ERROR: 'error',
  UNKNOWN: 'unknown',
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  DATABASE: 'database',
  JSON: 'json',
};

/**
 * Set the Application name to use when signing the error Objects.
 *
 * @param {string} name The app name, first char uppercase.
 */
appError.setName = function (name) {
  appError._appName = name;
};

/**
 * The Base Error all Errors inherit from.
 *
 *
 * @param {string|Error=} optMsg the message or an Error Object.
 * @param {Object=} optCtor Calee constructor.
 * @constructor
 * @alias Error
 */
appError.BaseError = appError.Error = function(optMsg, optCtor) {
  var tmp = Error.call(this);

  Error.captureStackTrace(this, optCtor || this.constructor);

  /**
   * If an instance of Error is passed to the arguments it is
   * assigned into this property.
   * @type {?Error}
   */
  this.srcError = null;

  var msg = 'Error';
  if (typeof optMsg === 'string' && optMsg.length) {
    msg = optMsg;
  }

  // Set the protected properties to avoid overwritting by third-party
  // error objects.
  var protectedProperties = [
    'name',
    'srcError',
    'error',
    'type',
    'httpCode',
    'isNodeon',
  ];

  if (optMsg instanceof Error) {
    this.srcError = optMsg;
    // go through all itterable properties and assign them
    __.forIn(optMsg, function(val, key) {
      if (protectedProperties.indexOf(key) > -1) {
        this['src_' + key] = val;
      } else {
        this[key] = val;
      }
    }, this);

    msg = optMsg.message;
  }

  tmp.name = this.name = appError._appName + 'BaseError';

  this.message = msg;

  /** @type {boolean} Mark this as an error */
  this.error = true;

  /** @type {appError.ErrorType} Set the error type */
  this.type = appError.ErrorType.ERROR;

  /** @type {number} Default http code to use */
  this.httpCode = 500;

  /** @type {boolean} Sign all the generated errors */
  this.isNodeon = true;
};
util.inherits(appError.BaseError, Error);

/**
 * Last stop for the error object, strip it of internal properties.
 *
 * @return {Object} Sanitized object to use on external API.
 */
appError.BaseError.prototype.toApi = function() {
  var obj = __.cloneDeep(this);
  delete obj.srcError;
  return obj;
};

/**
 * Unknown Error.
 *
 * @param {string|Error=} optMsg the message or an Error Object.
 * @constructor
 * @extends {app.error.BaseError}
 */
appError.Unknown = function(optMsg) {
  var msg = (optMsg && optMsg.length) ? optMsg : 'Unknown Error';
  appError.Unknown.super_.call(this, msg, this.constructor);

  this.name = appError._appName + 'UnknownError';
  this.type = appError.ErrorType.UNKNOWN;
};
util.inherits(appError.Unknown, appError.BaseError);

/**
 * Database Error.
 *
 * @param {string|Error=} optMsg the message or an Error Object.
 * @constructor
 * @extends {app.error.BaseError}
 */
appError.Database = function (optMsg) {
  appError.Database.super_.call(this, optMsg, this.constructor);
  this.name = appError._appName + 'DatabaseError';
  var msg = (optMsg && optMsg.length) ? optMsg  : 'Database Error';
  this.message = msg;

  this.type = appError.ErrorType.DATABASE;

  /**
   * @type {app.error.Database.Type} The type of error.
   */
  this.subType = appError.Database.Type.UNKNOWN;

};
util.inherits(appError.Database, appError.BaseError);

/**
 * @enum {string} Database error types.
 */
appError.Database.Type = {
  UNKNOWN: 'unknown',
  MONGO: 'mongo',
  REDIS: 'redis',
  MONGOOSE: 'mongoose',
  CAST: 'cast',
  VALIDATION: 'validation',
  CRYPTO: 'crypto',
};

/**
 * Validation Error.
 *
 * @param {string=} optMsg the message.
 * @constructor
 * @extends {app.error.Database}
 * @see http://mongoosejs.com/docs/validation.html
 * @see https://github.com/LearnBoost/mongoose/blob/3.6.11/lib/errors/validation.js
 */
appError.Validation = function(optMsg) {
  appError.Validation.super_.call(this, optMsg, this.constructor);
  this.name = appError._appName + 'ValidationError';
  var msg = (optMsg && optMsg.length) ? optMsg  : 'Validation Error';
  this.message = msg;

  // Set http code to Bad Request
  this.httpCode = 400;

  this.type = appError.ErrorType.VALIDATION;

  /** @type {Array.<app.Error.ValidationItem>} An array of validation errors */
  this.errors = [];

};
util.inherits(appError.Validation, appError.BaseError);

/**
 * A validation item is a single validation error.
 * Instances of this class are included in the Validation Error Object.
 *
 * @param {string} message An error message.
 * @param {string=} optPath The key that triggered the validation error.
 * @param {string=} optType The type of the validation error.
 * @param {string=} optValue The value used that generated the error.
 * @constructor
 */
appError.ValidationItem = function(message, optPath, optType, optValue) {
  /** @type {string} An error message to be consumed by end users */
  this.message = '';
  /** @type {?string} The key that triggered the validation error */
  this.path = null;
  /** @type {?string} The type of the validation error */
  this.type = null;
  /** @type {?string} The value used that generated the error */
  this.value = null;

  this.message = message || '';
  this.path = optPath || null;
  this.type = optType || null;
  this.value = optValue || null;
};

/**
 * Authentication Error.
 *
 * @param {string=} optMsg the message.
 * @constructor
 * @extends {app.error.BaseError}
 */
appError.Authentication = function(optMsg) {
  appError.Authentication.super_.call(this, optMsg, this.constructor);
  /** @type {string} */
  this.name = appError._appName + 'AuthenticationError';
  var msg = (optMsg && optMsg.length) ? optMsg  : 'Authentication Error';
  this.message = msg;

  this.httpCode = 401; // Unauthorized
  this.type = appError.ErrorType.AUTHENTICATION;

  /** @type {app.error.Authentication.Type} */
  this.subType = appError.Authentication.Type.UNKNOWN;
};
util.inherits(appError.Authentication, appError.BaseError);

/**
 * @enum {number} authentication error Types.
 */
appError.Authentication.Type = {
  UNKNOWN: 'unknown',
  EMAIL: 'email',
  PASSWORD: 'password',
  SESSION: 'session',
  SOCKET: 'socket',
  AUTH_TOKEN: 'authToken',
  INSUFFICIENT_CREDENTIALS: 'insufficientCredentials',
};

/**
 * JSON encoding of data failed.
 *
 * @param {Error} ex the JSON exception
 * @extends {app.error.BaseError}
 */
appError.JSON = function (ex) {
  appError.JSON.super_.call(this, (ex + ''), this.constructor);
  this.name = appError._appName + 'JSONError';
  this.srcError = ex;

  this.type = appError.ErrorType.JSON;
};
util.inherits(appError.JSON, appError.BaseError);
