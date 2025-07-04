define(function(require) {

  var ComponentView = require('coreViews/componentView');
  var Adapt = require('coreJS/adapt');

  var Chat = ComponentView.extend({

    events: {
      "click .stacklist-next": "nextItem"
    },

    preRender: function() {
      this.model.set("_stage", -1);
      this.setupButton();
    },

    postRender: function() {
      if (!this.model.get("_isComplete") || this.model.get("_isResetOnRevisit")) this.setupListItems();
      this.resize();
      this.listenTo(Adapt, 'device:resize', this.onScreenSizeChanged);
      this.setReadyStatus();
    },

    resize: function() {
      // Clear any inline height so .chat-lines can grow naturally
      this.$('.chat-lines').css('height', '');
    },

    setupButton: function() {
      var _button = this.model.get("_button") || {};

      if (!_button.startText) _button.startText = "Click here to begin";
      if (!_button.continueText) _button.continueText = "Next";

      this.model.set("_button", _button);
    },

    setupListItems: function() {
      this.$(".stacklist-button").removeClass('u-display-none')
      const context = this;
      _.each(this.model.get('_items'), function(item, index) {
        context.setImage(index, item);
      });
    },

    setImage: function(index, item) {
      var $icon = this.$('.chat-icon-inner').get(index);
      $($icon).attr('src', this.model.get('_participants')[item._participant]._icon);
      var $name = this.$('.chat-icon-name').get(index);
      $($name).html(this.model.get('_participants')[item._participant].name);
    },

    nextItem: function() {
      var stage = this.model.get("_stage") + 1;
      this.setStage(stage);
    },

    setStage: function(stage) {
      this.model.set("_stage", stage);
      this.$(".stacklist-next").hide();
      var context = this;
      setTimeout(function() {
        if (context.model.get("_items")[stage]._button._isEnabled || stage === 0) {
          var continueText = context.model.get("_items")[stage]._button.buttonText || "Start";
          context.$(".stacklist-next").html(continueText);
        }
        // Ensure .stacklist-button is positioned correctly on the first stage
        if (stage === 0) {
          var $item = context.$(".chat-line").eq(stage);
          var h = $item.outerHeight();
          var offset = $item.position();
          context.$(".stacklist-button").css({
            position: 'absolute',
            // top: offset.top + h + 16, // Removed to fix layout jump
            left: 0,
            right: 0,
            marginTop: 0
          });
        }
        context.showNextStage(stage);
      }, context.model.get("_items")[stage]._timeToShow * 1000);
    },

    showNextStage: function(stage) {
      var $item = this.$(".chat-line").eq(stage);
      $item.removeClass('u-display-none');
      var h = $item.outerHeight();
      var offset = $item.position();
      this.$(".stacklist-button").css({
        position: 'absolute',
        left: 0,
        right: 0,
        marginTop: 0
      });

      if (this.model.get("_items").length - 1 === stage) { // reached the end
        this.onComplete();
      } else if (this.checkNextButton(stage + 1)) { // show next button after x seconds
        this.$(".stacklist-next").show();
      } else { // show next item after x seconds
        this.nextItem();
      }
  
      window.scrollBy({
        top: 150,
        behavior: 'smooth'
      });
    },

    checkNextButton: function(nextStage) {
      return this.model.get("_items")[nextStage]._button._isEnabled;
    },

    onComplete: function() {
      var $button = this.$(".stacklist-button");
      $button.remove();
      this.setCompletionStatus();
    }
  });

  Adapt.register('chat', Chat);

  return Chat;

});
