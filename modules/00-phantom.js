/*
  Copyright (c) 2015 Klaralvdalens Datakonsult AB (KDAB).

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the following conditions are met:

    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the <organization> nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
  AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
  IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
  ARE DISCLAIMED. IN NO EVENT SHALL <COPYRIGHT HOLDER> BE LIABLE FOR ANY
  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
  THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

var phantom;

if (!phantom)
  phantom = {};

(function() {
  phantom.query = function(request) {
    return new Promise(function(resolve, reject) {
      startPhantomJsQuery({
        request: JSON.stringify(request),
        persistent: false,
        onSuccess: resolve,
        onFailure: reject
      });
    });
  }

  phantom.require = function(file) {
    if (file === "webpage") {
      return { create: function() { return new phantom.WebPage; } };
    }
    /// TODO:
    native function require();
    return require(file);
  };
  phantom.exit = function() {
    native function exit();
    exit();
  };
  // can be overwritten by the user
  phantom.onError = null;
  // this is set to window.onerror by default
  phantom.propagateOnError = function(errorMessage, url, lineNumber, columnNumber, error) {
    if (typeof phantom.onError === "function") {
      // keep compatibility with old phantomjs onError handler
      phantom.onError(errorMessage, error.stack, url, lineNumber, columnNumber, error);
    } else {
      native function printError();
      if (error.stack) {
        printError(String(error.stack));
      } else {
        printError(errorMessage + " at " + url + ":" + lineNumber + ":" + columnNumber);
      }
    }
  };
  phantom.handleEvaluateJavaScript = function(script, queryId) {
    var retval = null;
    var exception = null;
    try {
      func = eval(script);
      retval = func();
    } catch(e) {
      exception = e;
      if (e.stack) {
        exception = e.stack;
      }
    }
    startPhantomJsQuery({
      request: JSON.stringify({
        type: 'returnEvaluateJavaScript',
        retval: JSON.stringify(retval),
        exception: exception ? String(exception) : "",
        queryId: queryId
      }),
      persistent: false,
      onSuccess: function() {},
      onFailure: function() {}
    });
  };
})();