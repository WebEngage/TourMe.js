;(function ($, window) {
  var document = window.document,
      webEngageCalloutInstance,
      calloutManager,
      callbacks,
      hasSessionStorage = false,
      about = {
        name: "TourMe.js",
        version: 1.0,
        lastUpdated: "05/04/2016"
      };

  /*
   * Checking for a valid WebEngage widget code on the page
   * before initializing TourMe
   */
  $.when(function(){
    var deferred = $.Deferred();

    var _timer = setInterval(function(){
      if(typeof window.webengage != "undefined"){
        clearInterval(_timer);
        deferred.resolve();
      }
    }, 10);

    return deferred.promise();
  }()).done(function() {

    // setting default rendering options on this page for
    // notifications - no rules, no default rendering etc
    window._weq = window._weq || {};
    _weq["webengage.notification.defaultRender"] = false;
    _weq["webengage.notification.forcedRender"] = true;
    _weq['webengage.enableCallbacks'] = true;
    _weq['webengage.notification.skipRules'] = true;

    /*
     * TODO: WebEngage should implement a promise object to
     * streamline onReady usage. The code undeneath
     * doesn't guarantee readyState being always invoked
     * as the event might have occured prior
     */
    _weq["webengage.onReady"] = function(){
      var defaults = {
        tours: [],                      // list of tours
        baseCalloutNotificationId: "",  // token notification to be used
        baseModalNotificationId: "",    // TODO
        startWithModal: true,           // TODO
        startIndex: 0,                  // start at this point
        nextText: "Next",               // token for call-to-action button
        prevText: "Previous",           // TODO
        finishTest: "Finish",
        scrollDuration: 1000,           // scroll delay b/w two tours
        showClose: true,                // TODO
        showPrev: true,                 // TODO
        onTourStart: $.noop,            // TODO
        onTourEnd: $.noop,              // TODO
        onTourExit: $.noop              // TODO
      };

      // TODO: Callbacks to be implemented on each tour
      var callbacks = {
        next: [],
        prev: [],
        start: [],
        end: [],
        show: [],
        error: [],
        close: []
      };


      // initializing TourMe
      var TourMe = function(options){
        var settings = $.extend({}, defaults, options);

        // system settings
        settings.stateStorageIdentifier = 'tourme.state';   //TODO: for session storage/cookie persistence
        settings.currentIndex = settings.startIndex;

        _weq['webengage.notification.notificationId'] = settings.baseCalloutNotificationId;

        // jQuery event for creating tours
        $(window).bind("webengage.createTour", function(event, idx){

          var tour = settings.tours[idx];
          var tokenData = {
            title: tour.title || "" ,
            description: tour.content || "",
            callToAction: settings.nextText
          };

          _weq['webengage.notification.tokens'] = tokenData;

          // scroll to the new selector
          // TODO: needs to be integrated with the notification
          // render, should be an animate callback with
          // little time delay
          $('html, body').animate({
            scrollTop: $(tour.selector).offset().top - 250
          }, settings.scrollDuration);

          // add element with bubble animation
          $(tour.selector).append("<div class='we_bubble'><span></span></div>");

          // invoke WebEngage's render method
          var _currentNotificationInstance = webengage.notification.render({
            // called when the notification frame gets created
            // assumes that the layout js and css has loaded
            onLoad:function(){
              var nFrame = window.webengage.notification.getNotificationFrame();
              n$ = nFrame.contentWindow.$;

              if(idx === settings.tours.length-1){

                  n$("button").html(defaults.finishTest);

              }

              n$(".title").html(tokenData.title);

              n$(".description").html(tokenData.description);

              /*
               * Overriding the alignLayout method to accomodate
               * TourMe kind of selectors. This method
               * "modified" the attributeData parameter and overrides
               * the type and value properties of dom_id key
               */
              var _defaultAlignLayout = n$.alignLayout;
              n$.alignLayout = function(attributeData) {

                // loading the XPath library and
                // overriding the getXPathElement method to handle CSS selectors
                webengage.XPATH.util.loadXPath(function(){
                  _currGetXpathElement = webengage.XPATH.util.getXPathElement;
                  webengage.XPATH.util.getXPathElement = function(path){
                    var elem = null;
                    try{
                      elem = $(path).get(0);
                    }catch(e){}

                    return (elem == null ? _currGetXpathElement.apply(this, arguments) : elem);
                  };

                });

                // faking the type to xpath for the super() code
                // to understand it without any hassle
                attributeData.dom_id.type = "xpath";
                attributeData.dom_id.value = tour.selector;

                // calling super()
                return _defaultAlignLayout.apply(this, arguments);
              };

              /*
               * space to add all custom CSS overrides
               * for simplicilty, should ideally load a remote CSS file
               */

              var modifyCSS = function(win){
                $("#tourme-style").remove();
                var customCssStr = '<style id="tourme-style" type="text/css">.callToAction {text-align: right;}</style>',
                customCssForBubble = "<style>@keyframes bubble { 0% { left: 0;top: 0;width: 10px;height: 10px;background: rgba(255, 188, 0, 0.5);} 100% { left: -20px;top: -20px;width: 50px;height: 50px;background: rgba(255, 188, 0, 0);}}.we_bubble{ width: 10px; height: 10px; background: rgba(255, 188, 0, 1); border-radius: 50%; position: absolute; left: 50%; top: 50%;}.we_bubble span{ border-radius: 50%; position: absolute; animation: bubble 1.5s infinite;}</style>";
                n$(customCssStr).appendTo(n$("head"));

                $(customCssForBubble).appendTo($("head"));
              }(nFrame.contentWindow);
            },

            // called upon clicking next
            onClick:function(){
              // add element with bubble animation
              $(".we_bubble").remove();

              if(settings.currentIndex < settings.tours.length-1){
                setTimeout(function(){
                  // incerment the current index and invoke createTour
                  $(window).trigger("webengage.createTour", ++settings.currentIndex);
                }, 1);
              }
              //else{
                // alert("Tour complete. Yay!");
              // }

              return false;
            }

          });

        });

        $(window).trigger("webengage.createTour", settings.startIndex);

        return this;
      };

      window.TourMe = TourMe;

    };

  });

})(jQuery, this);