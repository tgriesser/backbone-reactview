var $;
var _ = require('underscore');

module.exports = {

  // Whenever there may be a change in the Backbone data, trigger a reconcile.
  componentDidMount: function() {
    if (this.props.model) this._subscribeModel(this.props.model);
    if (this.props.collection) this._subscribeCollection(this.props.collection);
    if (typeof this.on === 'function') this.on();
    if (this.el || this.$el) {
      this.el = this.isMounted() && this.getDOMNode();
      if (this.$el) {
        $ = $ || require('jquery');
        var $el = this.$el = $(this.el);
        this.$ = function(selector) {
          return $el.find(selector);
        };
      }
    }

    // Used for initializing anything that happens only on the browser.
    if (this.jqueryInit && typeof window !== 'undefined') {
      this.jqueryInit();
    }
  },

  // Whenever the component updates.
  componentWillReceiveProps: function(nextProps) {
    if (this.props.model !== nextProps.model) {
      if (this.props.model) this._unsubscribe(this.props.model);
    }
    if (this.props.collection !== nextProps.collection) {
      if (this.props.collection) this._unsubscribe(this.props.model);
    }
    if (nextProps.model) this._subscribeModel(nextProps.model);
    if (nextProps.collection) this._subscribeCollection(nextProps.collection);
  },

  // Ensure that we clean up any dangling references when the component is destroyed.
  componentWillUnmount: function() {
    if (this.props.model) this._unsubscribe(this.props.model);
    if (this.props.collection) this._unsubscribe(this.props.collection);
    if (this.off) this.off();

    // Used if there's any teardown necessary for jquery items.
    if (this.jqueryTeardown && typeof window !== 'undefined') {
      this.jqueryTeardown();
    }

    this.el = void 0;
    if (this.$el) {
      this.$el.off();
      this.$el = void 0;
    }
  },

  model: function() {
    return this.props.model;
  },

  collection: function() {
    return this.props.collection;
  },

  _subscribeCollection: function(collection) {
    var changeOptions = this.collectionChangeEvents || 'add remove reset sort';
    collection.on(changeOptions, (this.onCollectionChange || _.debounce(function() {
      this.forceUpdate();
    })), this);
  },

  _subscribeModel: function(model) {
    var changeOptions = this.modelChangeEvents || 'change';
    model.on(changeOptions, (this.onModelChange ||
    function() {
      this.forceUpdate();
    }), this);
  },

  _unsubscribe: function(obj) {
    obj.off(null, null, this);
  }

};