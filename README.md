# nodeON-error

> Error Objects for everybody!

[![Build Status](https://secure.travis-ci.org/thanpolas/nodeON-error.png?branch=master)](http://travis-ci.org/thanpolas/nodeON-error)

## Install

Install the module using NPM:

```
npm install nodeon-error --save
```

## <a name='TOC'>Table of Contents</a>

1. [Overview](#overview)
1. [API](#api)
    1. [Signing the Error Objects](#setName)
    1. [Getting an API Safe verison](#toApi)
1. [Error Types](#error-types)
    1. [The Unknown Error](#unknownError)
    1. [The JSON Error](#jsonError)
    1. [The Database Error](#databaseError)
    1. [The Validation Error](#validationError)
        1. [The Validation Item](#validationItem)
    1. [The Authentication Error](#authError)

## Overview

the nodeon-error package offers signed Error Objects which are an extension of the `Error` native Object.

```js
var appError = require('nodeon-error');

// A new error with a message
var error = new appError.Error('A message');
```

### Handling Existing Errors

When an Error gets thrown from a any other library than your app or library then simply supply the *alien* to the constructor:

```js
var fs = require('fs');

var appError = require('nodeon-error');

function stat(filepath, cb) {
    fs.stat(filepath, function (err, stats) {
        if (err) {
            var ourErr = appError.Error(err);
            ourErr.message('Oppsy');
            cb(ourErr);
        } else {
            cb(null, stats);
        }
    });
}
```

## API

### <a name='setName'>Signing the Error Objects</a>

> ### appError.setName(name)
>
>    * **name** `string` The Application's name

All Error Objects are *signed* by setting the `name` property. This method sets the name with which to prepend all signatures, make sure the first char is uppercase.

```js
var appErr = require('nodeon-error');

appErr.setName('Myapp');

var error = new appErr.Error();

console.log(error.name);
// prints: "MyappBaseError"
```

**[[⬆]](#TOC)**

### <a name='toApi'>Getting an API Safe verison</a>

> ### errInstance.toApi()
>
> *Returns* `Object` A sanitized object.

Clones the error object and strips it of all the `Error` getters (like `stack`) and the following attributes:
    
    * `srcError`

```js
var appErr = require('nodeon-error');

var error = new appErr.Error();

console.log(error.toApi());
```

**[[⬆]](#TOC)**


## Error Types

The following error types are available:

### <a name='baseError'>The Base Error</a>

> ### new appError.Error(optMessage)
>
>    * **optMessage** `string|Error=` Optionally define a message for the error or supply an existing error.

This is the default base error object.

#### Instance Properties

* `name` **string** Signs the error.
* `message` **string** The error message.
* `srcError` **?Error** If an Error Object was supplied it will exist here.
* `error` **boolean** Always true.
* `stack` **string** The stack trace.

**[[⬆]](#TOC)**

### <a name='unknownError'>The Unknown Error</a>

> ### new appError.Unknown(optMessage)
>
>    * **optMessage** `string|Error=` Optionally define a message for the error or supply an existing error.

This is for errors of unknown nature.

#### Instance Properties

* `name` **string** Signs the error.
* `message` **string** The error message.
* `srcError` **?Error** If an Error Object was supplied it will exist here.
* `error` **boolean** Always true.
* `stack` **string** The stack trace.

**[[⬆]](#TOC)**

### <a name='jsonError'>The JSON Error</a>

> ### new appError.JSON(exception)
>
>    * **exception** `Error` The JSON Exception.

This is for errors originating from JSON parsing or stringifying.

#### Instance Properties

* `name` **string** Signs the error.
* `message` **string** The error message.
* `srcError` **Error** The original JSON exception.
* `error` **boolean** Always true.
* `stack` **string** The stack trace.

**[[⬆]](#TOC)**


### <a name='databaseError'>The Database Error</a>

> ### new appError.Database(optMessage)
>
>    * **optMessage** `string|Error=` Optionally define a message for the error or supply an existing error.

This is for errors originating for the database.

#### Instance Properties

* `name` **string** Signs the error.
* `message` **string** The error message.
* `srcError` **?Error** If an Error Object was supplied it will exist here.
* `error` **boolean** Always true.
* `stack` **string** The stack trace.
* `type` **string** A value from the db error types enumeration available through `appError.Database.Type`:
    * `appError.Database.Type.UNKNOWN` "unknown" **default**
    * `appError.Database.Type.MONGO` "mongo"
    * `appError.Database.Type.REDIS` "redis"
    * `appError.Database.Type.MONGOOSE` "mongoose"
    * `appError.Database.Type.CAST` "cast"
    * `appError.Database.Type.VALIDATION` "validation"
    * `appError.Database.Type.CRYPTO` "crypto"

**[[⬆]](#TOC)**

### <a name='validationError'>The Validation Error</a>

> ### new appError.Validation(optMessage)
>
>    * **optMessage** `string|Error=` Optionally define a message for the error or supply an existing error.

This is for errors originating from validation operations.

#### Instance Properties

* `name` **string** Signs the error.
* `message` **string** The error message.
* `srcError` **?Error** If an Error Object was supplied it will exist here.
* `error` **boolean** Always true.
* `errors` **Array** An array of `appError.ValidationItem` objects, see [validationItem](#validationItem).

#### <a name='validationItem'>The Validation Item</a>

> #### new appError.ValidationItem(message, optPath, optType, optValue)
>
>    * **message** `string` The message for the error.
>    * **optPath** `string=` The key that triggered the validation error.
>    * **optType** `string=` The type of the validation error.
>    * **optValue** `string=` The value used that generated the error.

Creates a Validation Item to inject to the [Validation Error](#validationError).

##### Validation Item Properties

* `message` **string** The error message.
* `path` **string** The attribute that generated the error.
* `value` ** * ** The value that generated the error.
* `type` **string** A value for the validation error type (free text).

##### Example Usage

```js
var appError = require('nodeon-error');

var validationError = new appError.ValidationError();

var validItem = new appError.ValidationItem('Not valid email');
validItem.path = 'email';
validItem.type = 'invalid';
validItem.value = 'email@bogus';

validationError.errors.push(validItem);
```

**[[⬆]](#TOC)**

### <a name='authError'>The Authentication Error</a>

> ### new appError.Authentication(optMessage)
>
>    * **optMessage** `string|Error=` Optionally define a message for the error or supply an existing error.

This is for errors of authentication nature.

#### Instance Properties

* `name` **string** Signs the error.
* `message` **string** The error message.
* `srcError` **?Error** If an Error Object was supplied it will exist here.
* `error` **boolean** Always true.
* `stack` **string** The stack trace.
* `type` **string** A value from the auth error types enumeration available through `appError.Authentication.Type`:
    * `appError.Authentication.Type.UNKNOWN` "unknown" **default**
    * `appError.Authentication.Type.EMAIL` "email"
    * `appError.Authentication.Type.PASSWORD` "password"
    * `appError.Authentication.Type.SESSION` "session"
    * `appError.Authentication.Type.SOCKET` "socket"
    * `appError.Authentication.Type.AUTH_TOKEN` "authToken"
    * `appError.Authentication.Type.INSUFFICIENT_CREDENTIALS` "insufficientCredentials"

**[[⬆]](#TOC)**

## Release History

- **v0.1.1**, *21 Nov 2014*
    - Handle external errors wrapping better.
- **v0.1.0**, *14 Aug 2014*
    - Big Bang

## License

Copyright (c) 2014 Thanasis Polychronakis. Licensed under the MIT license.
