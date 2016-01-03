/**
 * nodeON-error
 * Error Objects for everybody!
 * https://github.com/thanpolas/nodeON-error
 *
 * Copyright ©2016 Thanasis Polychronakis
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
 * Deprecated in v1.0.0
 *
 * @deprecated in v1.0.0
 */
appError.setName = function () {
  console.log('setName() of "nodeon-error" has been deprecated and will be',
    'removed in future versions.');
};

/**
 * Helper for extending the native Error Object.
 *
 * @param {Function=} optCtor The custom error constructor.
 * @return {Function} The extended Error constructor.
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
 * @see http://stackoverflow.com/questions/8802845/inheriting-from-the-error-object-where-is-the-message-property
 * @see http://stackoverflow.com/questions/1382107/whats-a-good-way-to-extend-error-in-javascript
 */
appError.extend = function(optCtor) {
  var Ctor = function() {};
  if (typeof optCtor === 'function') {
    Ctor = optCtor;
  }

  var ExtendedCtor = function NodeonError(optMsg) {
    Error.call(this);

    // V8 & Firefox
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    } else {
      // IE and rest
      this.stack = (new Error()).stack;
    }

    var msg = '';
    if (typeof optMsg === 'string' && optMsg.length) {
      msg = optMsg;
    }

    this.message = msg;

    Ctor.call(this);
  };
  util.inherits(ExtendedCtor, Error);

  // chain extension
  ExtendedCtor.extend = appError.extend;

  return ExtendedCtor;
};

/**
 * The Base Error all Errors inherit from.
 *
 *
 * @param {string|Error=} optMsg the message or an Error Object.
 * @constructor
 * @alias Error
 */
appError.BaseError = appError.Error = appError.extend(function(optMsg) {
  /**
   * If an instance of Error is passed to the arguments it is
   * assigned into this property.
   * @type {?Error}
   */
  this.srcError = null;


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

    this.message = optMsg.message;
  }

  /** @type {boolean} Mark this as an error */
  this.error = true;

  /** @type {appError.ErrorType} Set the error type */
  this.type = appError.ErrorType.ERROR;

  /** @type {number} Default http code to use */
  this.httpCode = 500;

  /** @type {boolean} Sign all the generated errors */
  this.isNodeon = true;
});

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
appError.Validation = appError.BaseError.extend(function(optMsg) {
  this.name = appError._appName + 'ValidationError';
  var msg = (optMsg && optMsg.length) ? optMsg  : 'Validation Error';
  this.message = msg;

  // Set http code to Bad Request
  this.httpCode = 400;

  this.type = appError.ErrorType.VALIDATION;

  /** @type {Array.<app.Error.ValidationItem>} An array of validation errors */
  this.errors = [];

});

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
