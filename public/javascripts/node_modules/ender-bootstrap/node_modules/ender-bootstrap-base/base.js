/*global provide:true,ender:true*/
// make a fake `ender` that can do some things slightly different
!(function ($) {
  var faker = function (selector) {
        return selector === null || selector === '#' ? $([]) : $.apply(this, arguments)
      }
    , hasComputedStyle = document.defaultView && document.defaultView.getComputedStyle
    , _$map = $.fn.map
    , _$on = $.fn.on
    , _$trigger = $.fn.trigger
    , _$height = $.fn.height
    , _$width = $.fn.width
    , _$data = $.fn.data
    , p

  for (p in $) {
    if (Object.prototype.hasOwnProperty.call($, p))
      faker[p] = $[p]
  }
  if (!faker.support) faker.support = {}

  // $.camelCase
  faker.camelCase = function (s) {
    return s.replace(/-([a-z]|[0-9])/ig, function(s, c) { return (c + '').toUpperCase() })
  }
  // $.extend(dst, src1, src2...)
  // simple shallow copy
  faker.extend = function () {
    var options, name, src, copy
      , target = arguments[0], i = 1, length = arguments.length

    for (; i < length; i++) {
      if ((options = arguments[i]) !== null) {
        for (name in options) {
          src = target[name]
          copy = options[name]
          if (target !== copy)
            target[name] = copy
        }
      }
    }
    return target
  }
  // $.map
  faker.map = function (a, fn, scope) {
    var r = [], tr, i, l
    for (i = 0, l = a.length; i < l; i++) {
      i in a && (tr = fn.call(scope, a[i], i, a)) != null && r.push(tr)
    }
    return r
  }
  // $.proxy
  faker.proxy = function (fn, ctx) {
    return function () { return fn.apply(ctx, arguments) }
  }
  // simplified version of jQuery's $.grep
  faker.grep = function(elems, callback) {
    var i = 0, l = elems.length, ret = []
    for (; i < l; i++) {
      if (!!callback(elems[i], i))
        ret.push(elems[i])
    }
    return ret;
  }

  // this is just nasty... Bootstrap uses $.Event(foo) so it can track state, we can't do that
  // with Bean but we need to pass Bean a string for trigger()
  faker.Event = function (s) {
    return s
  }

  // fix $().map to handle argument-less functions
  // also the explicit rejection of null values
  $.fn.map = function (fn) {
    if (!fn.length) { // no args
      return $(_$map.call(this, function(e) { return fn.call(e) }, function (e) { return e != null }))
    }
    return $(_$map.apply(this, arguments))
  }
  // fix $().on to handle jQuery style arguments
  $.fn.on = function () {
    if (arguments.length == 3 && typeof arguments[2] == 'function' && typeof arguments[1] != 'string')
      return $.fn.bind.call(this, arguments[0], arguments[2])
    else if (arguments.length == 3 && typeof arguments[2] == 'function' && typeof arguments[1] == 'string')
      return $.fn.bind.call(this, arguments[1], arguments[0], arguments[2])
    return _$on.apply(this, arguments)
  }
  // don't handle $().trigger({}) (object parameters)
  $.fn.trigger = function () {
    if (typeof arguments[0] == 'string')
      return _$trigger.apply(this, arguments)
    if (typeof arguments[0] == 'object' && typeof arguments[0].type == 'string')
      return _$trigger.call(this, arguments[0].type)
    return this
  }
  // fix up height() and width() call to use computedStyle where available
  var hwfn = function(_$fn, type) {
    return function () {
      if (arguments.length || !this.length)
        return _$fn.apply(this, arguments) // normal call

      if (this[0] === window) {
        return window.document.documentElement['client' + (name == 'height' ? 'Height' : 'Width')]
      }

      if (hasComputedStyle) {
        var computed = document.defaultView.getComputedStyle(this[0], '')
        if (computed)
          return computed.getPropertyValue(type)
      }

      return _$fn.apply(this)
    }
  }
  $.fn.height = hwfn(_$height, 'height')
  $.fn.width = hwfn(_$width, 'width')
  // a prev() alias for previous()
  $.fn.prev = function () {
    return $.fn.previous.apply(this, arguments)
  }
  // fix $().data() to handle a JSON array for typeahead's "source"
  $.fn.data = function () {
    var d = _$data.apply(this, arguments)
    if (!arguments.length && typeof d.source == 'string' && /^\[/.test(d.source)) {
      if (typeof JSON != 'undefined' && JSON.parse) {
        d.source = JSON.parse(d.source)
      } else {
        d.source = d.source.replace(/(^\s*[\s*")|("\s*]\s*$)/g, '').split(/"\s*,\s*"/)
      }
    }
    return d
  }
  // implement sort which is awkward because Array.prototype.sort won't sort an Ender object
  $.fn.sort = function (fn) {
    var ar = []
    for (var i = 0; i < this.length; i++) ar[i] = this[i]
    ar.sort(fn)
    return $(ar)
  }
  // for carousel.to()
  if (!$.fn.index) {
    $.fn.index = function (el) {
      if (el && (!!el.nodeType || !!(el = el[0]).nodeType)) {
        for (var i = 0, l = this.length; i < l; i++) {
          if (this[i] === el) return i
        }
      }
      return -1
    }
  }

  // lifted from jQuery, modified slightly
  var rroot = /^(?:body|html)$/i
  $.fn.position = function () {
    if (!this.length)
      return null

    var elem = this[0],
    // Get *real* offsetParent
    offsetParent = this.offsetParent(),

    // Get correct offsets
    offset       = this.offset(),
    parentOffset = rroot.test(offsetParent[0].nodeName) ? { top: 0, left: 0 } : offsetParent.offset()

    // Subtract element margins
    // note: when an element has margin: auto the offsetLeft and marginLeft
    // are the same in Safari causing offset.left to incorrectly be 0
    offset.top  -= parseFloat($(elem).css("marginTop")) || 0
    offset.left -= parseFloat($(elem).css("marginLeft")) || 0

    // Add offsetParent borders
    parentOffset.top  += parseFloat($(offsetParent[0]).css("borderTopWidth")) || 0
    parentOffset.left += parseFloat($(offsetParent[0]).css("borderLeftWidth")) || 0

    // Subtract the two offsets
    return {
        top:  offset.top  - parentOffset.top
      , left: offset.left - parentOffset.left
    }
  }
  $.fn.offsetParent = function () {
    return $(this.map(function() {
      var offsetParent = this.offsetParent || document.body
      while (offsetParent && (!rroot.test(offsetParent.nodeName) && $(offsetParent).css("position") === "static")) {
        offsetParent = offsetParent.offsetParent
      }
      return offsetParent
    }))
  }

  // if (typeof module !== 'undefined') module.exports = faker
  if (typeof provide !== 'undefined') provide('ender-bootstrap-base-faker', faker)
  // else, where are we??


}(ender))