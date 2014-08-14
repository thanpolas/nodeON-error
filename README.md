# nodeON-error

> Error Objects for the nodeON package

[![Build Status](https://secure.travis-ci.org/thanpolas/nodeON-error.png?branch=master)](http://travis-ci.org/thanpolas/nodeON-error)

## Install

Install the module using NPM:

```
npm install nodeON-error --save
```

## <a name='TOC'>Table of Contents</a>

1. [Overview](#overview)
1. [API](#api)
    1. [Signing the Error Objects](#setName)

## Overview

the nodeON-error package offers signed Error Objects which are an extension of the `Error` native Object.

```js
var appError = require('nodeON-error');

var error = new appError.Error();
```

## API

### <a name='setName'>Signing the Error Objects</a>

> ### appError.setName(name)
>
>    * **name** `string` The Application's name

All Error Objects are *signed* by setting the `name` property. This method sets the name with which to prepend all signatures, make sure the first char is uppercase.

```js
var appErr = require('nodeON-error');

appErr.setName('Myapp');

var error = new appErr.Error();

console.log(error.name);
// prints: "MyappBaseError"
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
* `srcError` **?Object** If an Error Object was supplied it will exist here.
* `error` **boolean** Always true.
* `stack` **string** The stack trace.

**[[⬆]](#TOC)**

### <a name='unknownError'>The Unknown Error</a>

> ### new appError.Unknown(optMessage)
>
>    * **optMessage** `string|Error=` Optionally define a message for the error or supply an existing error.

This is for errors of unknown nature.

**[[⬆]](#TOC)**

#### Instance Properties

* `name` **string** Signs the error.
* `message` **string** The error message.
* `srcError` **?Object** If an Error Object was supplied it will exist here.
* `error` **boolean** Always true.
* `stack` **string** The stack trace.

### <a name='databaseError'>The Database Error</a>

> ### new appError.Database(optMessage)
>
>    * **optMessage** `string|Error=` Optionally define a message for the error or supply an existing error.

This is for errors originating for the database.

#### Instance Properties

* `name` **string** Signs the error.
* `message` **string** The error message.
* `srcError` **?Object** If an Error Object was supplied it will exist here.
* `error` **boolean** Always true.
* `stack` **string** The stack trace.
* `type` **string** A value from the db error types enumeration available through `appError.Database.Type`:
    * `appError.Database.Type.UNKNOWN` "unknown" The unknown error type.
    * `appError.Database.Type.MONGO` "mongo" The mongo error type.
    * `appError.Database.Type.REDIS` "redis" The redis error type.
    * `appError.Database.Type.MONGOOSE` "mongoose" The mongoose error type.
    * `appError.Database.Type.CAST` "cast" The cast error type.
    * `appError.Database.Type.VALIDATION` "validation" The validation error type.
    * `appError.Database.Type.CRYPTO` "crypto" The crypto error type.

**[[⬆]](#TOC)**


## Release History

- **v0.0.1**, *TBD*
    - Big Bang

## License

Copyright (c) 2014 Thanasis Polychronakis. Licensed under the MIT license.
