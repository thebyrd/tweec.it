/*!
  * =============================================================
  * Ender: open module JavaScript framework (https://ender.no.de)
  * Build: ender build bean bonzo domready qwery jeesh ender-bootstrap-base ender-bootstrap-transition ender-bootstrap-alert ender-bootstrap-button ender-bootstrap-carousel ender-bootstrap-collapse ender-bootstrap-dropdown ender-bootstrap-modal ender-bootstrap-tooltip ender-bootstrap-popover ender-bootstrap-scrollspy ender-bootstrap-tab ender-bootstrap-typeahead bowser ender-bootstrap valentine
  * =============================================================
  */

/*!
  * Ender: open module JavaScript framework (client-lib)
  * copyright Dustin Diaz & Jacob Thornton 2011-2012 (@ded @fat)
  * http://ender.no.de
  * License MIT
  */
(function (context) {

  // a global object for node.js module compatiblity
  // ============================================

  context['global'] = context

  // Implements simple module system
  // losely based on CommonJS Modules spec v1.1.1
  // ============================================

  var modules = {}
    , old = context['$']
    , oldRequire = context['require']
    , oldProvide = context['provide']

  function require (identifier) {
    // modules can be required from ender's build system, or found on the window
    var module = modules['$' + identifier] || window[identifier]
    if (!module) throw new Error("Ender Error: Requested module '" + identifier + "' has not been defined.")
    return module
  }

  function provide (name, what) {
    return (modules['$' + name] = what)
  }

  context['provide'] = provide
  context['require'] = require

  function aug(o, o2) {
    for (var k in o2) k != 'noConflict' && k != '_VERSION' && (o[k] = o2[k])
    return o
  }

  /**
   * main Ender class
   * @constructor
   * @param {Array.<Element>|Element|Ender|string} s a CSS selector or DOM node(s)
   * @param {Array.<Element>|Element|Ender|string=} opt_r a root node(s)
   */
  function Ender(s, opt_r) {
    var elements
      , i

    this.selector = s
    // string || node || nodelist || window
    if (typeof s == 'undefined') {
      elements = []
      this.selector = ''
    } else if (typeof s == 'string' || s.nodeName || (s.length && 'item' in s) || s == window) {
      elements = ender._select(s, opt_r)
    } else {
      elements = isFinite(s.length) ? s : [s]
    }
    this.length = elements.length
    for (i = this.length; i--;) this[i] = elements[i]
  }

  /**
   * @param {function(Element, number, Ender)} fn
   * @param {Object=} opt_scope
   * @return {Ender}
   */
  Ender.prototype['forEach'] = function (fn, opt_scope) {
    var i, l
    // opt out of native forEach so we can intentionally call our own scope
    // defaulting to the current item and be able to return self
    for (i = 0, l = this.length; i < l; ++i) i in this && fn.call(opt_scope || this[i], this[i], i, this)
    // return self for chaining
    return this
  }

  /** @type {Ender} */
  Ender.prototype.$ = ender // handy reference to self


  function ender(s, opt_r) {
    return new Ender(s, opt_r)
  }

  ender['_VERSION'] = '0.4.5-dev'

  ender.fn = Ender.prototype // for easy compat to jQuery plugins

  ender.ender = function (o, chain) {
    aug(chain ? Ender.prototype : ender, o)
  }

  ender._select = function (s, r) {
    if (typeof s == 'string') return (r || document).querySelectorAll(s)
    if (s.nodeName) return [s]
    return s
  }


  // use callback to receive Ender's require & provide
  ender.noConflict = function (callback) {
    context['$'] = old
    if (callback) {
      context['provide'] = oldProvide
      context['require'] = oldRequire
      callback(require, provide, this)
    }
    return this
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = ender
  // use subscript notation as extern for Closure compilation
  context['ender'] = context['$'] = context['ender'] || ender

}(this));


(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Valentine: JavaScript's functional Sister
    * (c) Dustin Diaz 2012
    * https://github.com/ded/valentine
    * License MIT
    */
  
  (function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function') define(definition)
    else this[name] = this['v'] = definition()
  })('valentine', function () {
  
    var context = this
      , old = context.v
      , ap = []
      , hasOwn = Object.prototype.hasOwnProperty
      , n = null
      , slice = ap.slice
      , nativ = 'map' in ap
      , nativ18 = 'reduce' in ap
      , trimReplace = /(^\s*|\s*$)/g
      , iters = {
      each: nativ ?
        function (a, fn, scope) {
          ap.forEach.call(a, fn, scope)
        } :
        function (a, fn, scope) {
          for (var i = 0, l = a.length; i < l; i++) {
            i in a && fn.call(scope, a[i], i, a)
          }
        }
  
    , map: nativ ?
        function (a, fn, scope) {
          return ap.map.call(a, fn, scope)
        } :
        function (a, fn, scope) {
          var r = [], i
          for (i = 0, l = a.length; i < l; i++) {
            i in a && (r[i] = fn.call(scope, a[i], i, a))
          }
          return r
        }
  
    , some: nativ ?
        function (a, fn, scope) {
          return a.some(fn, scope)
        } :
        function (a, fn, scope) {
          for (var i = 0, l = a.length; i < l; i++) {
            if (i in a && fn.call(scope, a[i], i, a)) return true
          }
          return false
        }
  
    , every: nativ ?
        function (a, fn, scope) {
          return a.every(fn, scope)
        } :
        function (a, fn, scope) {
          for (var i = 0, l = a.length; i < l; i++) {
            if (i in a && !fn.call(scope, a[i], i, a)) return false
          }
          return true
        }
  
    , filter: nativ ?
        function (a, fn, scope) {
          return a.filter(fn, scope)
        } :
        function (a, fn, scope) {
          for (var r = [], i = 0, j = 0, l = a.length; i < l; i++) {
            if (i in a) {
              if (!fn.call(scope, a[i], i, a)) continue;
              r[j++] = a[i]
            }
          }
          return r
        }
  
    , indexOf: nativ ?
        function (a, el, start) {
          return a.indexOf(el, isFinite(start) ? start : 0)
        } :
        function (a, el, start) {
          start = start || 0
          start = start < 0 ? 0 : start
          start = start > a.length ? a.length : start
          for (var i = start; i < a.length; i++) {
            if (i in a && a[i] === el) return i
          }
          return -1
        }
  
    , lastIndexOf: nativ ?
        function (a, el, start) {
          return a.lastIndexOf(el, isFinite(start) ? start : a.length)
        } :
        function (a, el, start) {
          start = start || a.length
          start = start >= a.length ? a.length :
            start < 0 ? a.length + start : start
          for (var i = start; i >= 0; --i) {
            if (i in a && a[i] === el) {
              return i
            }
          }
          return -1
        }
  
    , reduce: nativ18 ?
        function (o, i, m, c) {
          return ap.reduce.call(o, i, m, c);
        } :
        function (obj, iterator, memo, context) {
          if (!obj) obj = []
          var i = 0, l = obj.length
          if (arguments.length < 3) {
            do {
              if (i in obj) {
                memo = obj[i++]
                break;
              }
              if (++i >= l) {
                throw new TypeError('Empty array')
              }
            } while (1)
          }
          for (; i < l; i++) {
            if (i in obj) {
              memo = iterator.call(context, memo, obj[i], i, obj)
            }
          }
          return memo
        }
  
    , reduceRight: nativ18 ?
        function (o, i, m, c) {
          return ap.reduceRight.call(o, i, m, c)
        } :
        function (obj, iterator, memo, context) {
          !obj && (obj = [])
          var l = obj.length, i = l - 1
          if (arguments.length < 3) {
            do {
              if (i in obj) {
                memo = obj[i--]
                break;
              }
              if (--i < 0) {
                throw new TypeError('Empty array')
              }
            } while (1)
          }
          for (; i >= 0; i--) {
            if (i in obj) {
              memo = iterator.call(context, memo, obj[i], i, obj)
            }
          }
          return memo
        }
  
    , find: function (obj, iterator, context) {
        var result
        iters.some(obj, function (value, index, list) {
          if (iterator.call(context, value, index, list)) {
            result = value
            return true
          }
        })
        return result
      }
  
    , reject: function (a, fn, scope) {
        var r = []
        for (var i = 0, j = 0, l = a.length; i < l; i++) {
          if (i in a) {
            if (fn.call(scope, a[i], i, a)) {
              continue;
            }
            r[j++] = a[i]
          }
        }
        return r
      }
  
    , size: function (a) {
        return o.toArray(a).length
      }
  
    , compact: function (a) {
        return iters.filter(a, function (value) {
          return !!value
        })
      }
  
    , flatten: function (a) {
        return iters.reduce(a, function (memo, value) {
          if (is.arr(value)) {
            return memo.concat(iters.flatten(value))
          }
          memo[memo.length] = value
          return memo
        }, [])
      }
  
    , uniq: function (ar, opt_iterator) {
        var a = [], i, j
        ar = opt_iterator ? iters.map(ar, opt_iterator) : ar
        label:
        for (i = 0; i < ar.length; i++) {
          for (j = 0; j < a.length; j++) {
            if (a[j] === ar[i]) {
              continue label
            }
          }
          a[a.length] = ar[i]
        }
        return a
      }
  
    , merge: function (one, two) {
        var i = one.length, j = 0, l
        if (isFinite(two.length)) {
          for (l = two.length; j < l; j++) {
            one[i++] = two[j]
          }
        } else {
          while (two[j] !== undefined) {
            first[i++] = second[j++]
          }
        }
        one.length = i
        return one
      }
  
    , inArray: function (ar, needle) {
        return !!~iters.indexOf(ar, needle)
      }
  
    }
  
    var is = {
      fun: function (f) {
        return typeof f === 'function'
      }
  
    , str: function (s) {
        return typeof s === 'string'
      }
  
    , ele: function (el) {
        return !!(el && el.nodeType && el.nodeType == 1)
      }
  
    , arr: function (ar) {
        return ar instanceof Array
      }
  
    , arrLike: function (ar) {
        return (ar && ar.length && isFinite(ar.length))
      }
  
    , num: function (n) {
        return typeof n === 'number'
      }
  
    , bool: function (b) {
        return (b === true) || (b === false)
      }
  
    , args: function (a) {
        return !!(a && hasOwn.call(a, 'callee'))
      }
  
    , emp: function (o) {
        var i = 0
        return is.arr(o) ? o.length === 0 :
          is.obj(o) ? (function () {
            for (var k in o) {
              i++
              break;
            }
            return (i === 0)
          }()) :
          o === ''
      }
  
    , dat: function (d) {
        return !!(d && d.getTimezoneOffset && d.setUTCFullYear)
      }
  
    , reg: function (r) {
        return !!(r && r.test && r.exec && (r.ignoreCase || r.ignoreCase === false))
      }
  
    , nan: function (n) {
        return n !== n
      }
  
    , nil: function (o) {
        return o === n
      }
  
    , und: function (o) {
        return typeof o === 'undefined'
      }
  
    , def: function (o) {
        return typeof o !== 'undefined'
      }
  
    , obj: function (o) {
        return o instanceof Object && !is.fun(o) && !is.arr(o)
      }
    }
  
    var o = {
      each: function (a, fn, scope) {
        is.arrLike(a) ?
          iters.each(a, fn, scope) : (function () {
            for (var k in a) {
              hasOwn.call(a, k) && fn.call(scope, k, a[k], a)
            }
          }())
      }
  
    , map: function (a, fn, scope) {
        var r = [], i = 0
        return is.arrLike(a) ?
          iters.map(a, fn, scope) : !function () {
            for (var k in a) {
              hasOwn.call(a, k) && (r[i++] = fn.call(scope, k, a[k], a))
            }
          }() && r
      }
  
    , pluck: function (a, k) {
        return is.arrLike(a) ?
          iters.map(a, function (el) {
            return el[k]
          }) :
          o.map(a, function (_, v) {
            return v[k]
          })
      }
  
    , toArray: function (a) {
        if (!a) return []
  
        if (is.arr(a)) return a
  
        if (a.toArray) return a.toArray()
  
        if (is.args(a)) return slice.call(a)
  
        return iters.map(a, function (k) {
          return k
        })
      }
  
    , first: function (a) {
        return a[0]
      }
  
    , last: function (a) {
        return a[a.length - 1]
      }
  
    , keys: Object.keys ?
        function (o) {
          return Object.keys(o)
        } :
        function (obj) {
          var keys = [], key
          for (key in obj) if (hasOwn.call(obj, key)) keys[keys.length] = key
          return keys
        }
  
    , values: function (ob) {
        return o.map(ob, function (k, v) {
          return v
        })
      }
  
    , extend: function () {
        // based on jQuery deep merge
        var options, name, src, copy, clone
          , target = arguments[0], i = 1, length = arguments.length
  
        for (; i < length; i++) {
          if ((options = arguments[i]) !== n) {
            // Extend the base object
            for (name in options) {
              src = target[name]
              copy = options[name]
              if (target === copy) {
                continue;
              }
              if (copy && (is.obj(copy))) {
                clone = src && is.obj(src) ? src : {}
                target[name] = o.extend(clone, copy);
              } else if (copy !== undefined) {
                target[name] = copy
              }
            }
          }
        }
        return target
      }
  
    , trim: String.prototype.trim ?
        function (s) {
          return s.trim()
        } :
        function (s) {
          return s.replace(trimReplace, '')
        }
  
    , bind: function (scope, fn) {
        var args = arguments.length > 2 ? slice.call(arguments, 2) : null
        return function () {
          return fn.apply(scope, args ? args.concat(slice.call(arguments)) : arguments)
        }
      }
  
    , curry: function (fn) {
        if (arguments.length == 1) return fn
        var args = slice.call(arguments, 1)
        return function () {
          return fn.apply(null, args.concat(slice.call(arguments)))
        }
      }
  
    , parallel: function (fns, callback) {
        var args = o.toArray(arguments)
          , len = 0
          , returns = []
          , flattened = []
  
        if (is.arr(fns) && fns.length === 0 || (is.fun(fns) && args.length === 1)) throw new TypeError('Empty parallel array')
        if (!is.arr(fns)) {
          callback = args.pop()
          fns = args
        }
  
        iters.each(fns, function (el, i) {
          el(function () {
            var a = o.toArray(arguments)
              , e = a.shift()
            if (e) return callback(e)
            returns[i] = a
            if (fns.length == ++len) {
              returns.unshift(n)
  
              iters.each(returns, function (r) {
                flattened = flattened.concat(r)
              })
  
              callback.apply(n, flattened)
            }
          })
        })
      }
  
    , waterfall: function (fns, callback) {
        var args = o.toArray(arguments)
          , index = 0
  
        if (is.arr(fns) && fns.length === 0 || (is.fun(fns) && args.length === 1)) throw new TypeError('Empty waterfall array')
        if (!is.arr(fns)) {
          callback = args.pop()
          fns = args
        }
  
        (function f() {
          var args = o.toArray(arguments)
          args.push(f)
          var err = args.shift()
          if (!err && fns.length) fns.shift().apply(n, args)
          else {
            args.pop()
            args.unshift(err)
            callback.apply(n, args)
          }
        }(n))
      }
    , queue: function (ar) {
        return new Queue(is.arrLike(ar) ? ar : o.toArray(arguments))
      }
    }
  
    function Queue (a) {
      this.values = a
      this.index = 0
    }
  
    Queue.prototype.next = function () {
      this.index < this.values.length && this.values[this.index++]()
      return this
    }
  
    function v(a, scope) {
      return new Valentine(a, scope)
    }
  
    function aug(o, o2) {
      for (var k in o2) o[k] = o2[k]
    }
  
    aug(v, iters)
    aug(v, o)
    v.is = is
  
    v.v = v // vainglory
  
    // peoples like the object style
    function Valentine(a, scope) {
      this.val = a
      this._scope = scope || n
      this._chained = 0
    }
  
    v.each(v.extend({}, iters, o), function (name, fn) {
      Valentine.prototype[name] = function () {
        var a = v.toArray(arguments)
        a.unshift(this.val)
        var ret = fn.apply(this._scope, a)
        this.val = ret
        return this._chained ? this : ret
      }
    })
  
    // people like chaining
    aug(Valentine.prototype, {
      chain: function () {
        this._chained = 1
        return this
      }
    , value: function () {
        return this.val
      }
    })
  
  
    v.noConflict = function () {
      context.v = old
      return this
    }
  
    return v
  });

  provide("valentine", module.exports);

  var v = require('valentine')
  ender.ender(v)
  ender.ender({
      merge: v.merge
    , extend: v.extend
    , each: v.each
    , map: v.map
    , toArray: v.toArray
    , keys: v.keys
    , values: v.values
    , trim: v.trim
    , bind: v.bind
    , curry: v.curry
    , parallel: v.parallel
    , waterfall: v.waterfall
    , inArray: v.inArray
    , queue: v.queue
  })
  

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * bean.js - copyright Jacob Thornton 2011
    * https://github.com/fat/bean
    * MIT License
    * special thanks to:
    * dean edwards: http://dean.edwards.name/
    * dperini: https://github.com/dperini/nwevents
    * the entire mootools team: github.com/mootools/mootools-core
    */
  !function (name, context, definition) {
    if (typeof module !== 'undefined') module.exports = definition(name, context);
    else if (typeof define === 'function' && typeof define.amd  === 'object') define(definition);
    else context[name] = definition(name, context);
  }('bean', this, function (name, context) {
    var win = window
      , old = context[name]
      , overOut = /over|out/
      , namespaceRegex = /[^\.]*(?=\..*)\.|.*/
      , nameRegex = /\..*/
      , addEvent = 'addEventListener'
      , attachEvent = 'attachEvent'
      , removeEvent = 'removeEventListener'
      , detachEvent = 'detachEvent'
      , ownerDocument = 'ownerDocument'
      , targetS = 'target'
      , qSA = 'querySelectorAll'
      , doc = document || {}
      , root = doc.documentElement || {}
      , W3C_MODEL = root[addEvent]
      , eventSupport = W3C_MODEL ? addEvent : attachEvent
      , slice = Array.prototype.slice
      , mouseTypeRegex = /click|mouse(?!(.*wheel|scroll))|menu|drag|drop/i
      , mouseWheelTypeRegex = /mouse.*(wheel|scroll)/i
      , textTypeRegex = /^text/i
      , touchTypeRegex = /^touch|^gesture/i
      , ONE = {} // singleton for quick matching making add() do one()
  
      , nativeEvents = (function (hash, events, i) {
          for (i = 0; i < events.length; i++)
            hash[events[i]] = 1
          return hash
        }({}, (
            'click dblclick mouseup mousedown contextmenu ' +                  // mouse buttons
            'mousewheel mousemultiwheel DOMMouseScroll ' +                     // mouse wheel
            'mouseover mouseout mousemove selectstart selectend ' +            // mouse movement
            'keydown keypress keyup ' +                                        // keyboard
            'orientationchange ' +                                             // mobile
            'focus blur change reset select submit ' +                         // form elements
            'load unload beforeunload resize move DOMContentLoaded '+          // window
            'readystatechange message ' +                                      // window
            'error abort scroll ' +                                            // misc
            (W3C_MODEL ? // element.fireEvent('onXYZ'... is not forgiving if we try to fire an event
                         // that doesn't actually exist, so make sure we only do these on newer browsers
              'show ' +                                                          // mouse buttons
              'input invalid ' +                                                 // form elements
              'touchstart touchmove touchend touchcancel ' +                     // touch
              'gesturestart gesturechange gestureend ' +                         // gesture
              'readystatechange pageshow pagehide popstate ' +                   // window
              'hashchange offline online ' +                                     // window
              'afterprint beforeprint ' +                                        // printing
              'dragstart dragenter dragover dragleave drag drop dragend ' +      // dnd
              'loadstart progress suspend emptied stalled loadmetadata ' +       // media
              'loadeddata canplay canplaythrough playing waiting seeking ' +     // media
              'seeked ended durationchange timeupdate play pause ratechange ' +  // media
              'volumechange cuechange ' +                                        // media
              'checking noupdate downloading cached updateready obsolete ' +     // appcache
              '' : '')
          ).split(' ')
        ))
  
      , customEvents = (function () {
          var cdp = 'compareDocumentPosition'
            , isAncestor = cdp in root
                ? function (element, container) {
                    return container[cdp] && (container[cdp](element) & 16) === 16
                  }
                : 'contains' in root
                  ? function (element, container) {
                      container = container.nodeType === 9 || container === window ? root : container
                      return container !== element && container.contains(element)
                    }
                  : function (element, container) {
                      while (element = element.parentNode) if (element === container) return 1
                      return 0
                    }
  
          function check(event) {
            var related = event.relatedTarget
            return !related
              ? related === null
              : (related !== this && related.prefix !== 'xul' && !/document/.test(this.toString()) && !isAncestor(related, this))
          }
  
          return {
              mouseenter: { base: 'mouseover', condition: check }
            , mouseleave: { base: 'mouseout', condition: check }
            , mousewheel: { base: /Firefox/.test(navigator.userAgent) ? 'DOMMouseScroll' : 'mousewheel' }
          }
        }())
  
      , fixEvent = (function () {
          var commonProps = 'altKey attrChange attrName bubbles cancelable ctrlKey currentTarget detail eventPhase getModifierState isTrusted metaKey relatedNode relatedTarget shiftKey srcElement target timeStamp type view which'.split(' ')
            , mouseProps = commonProps.concat('button buttons clientX clientY dataTransfer fromElement offsetX offsetY pageX pageY screenX screenY toElement'.split(' '))
            , mouseWheelProps = mouseProps.concat('wheelDelta wheelDeltaX wheelDeltaY wheelDeltaZ axis'.split(' ')) // 'axis' is FF specific
            , keyProps = commonProps.concat('char charCode key keyCode keyIdentifier keyLocation'.split(' '))
            , textProps = commonProps.concat(['data'])
            , touchProps = commonProps.concat('touches targetTouches changedTouches scale rotation'.split(' '))
            , messageProps = commonProps.concat(['data', 'origin', 'source'])
            , preventDefault = 'preventDefault'
            , createPreventDefault = function (event) {
                return function () {
                  if (event[preventDefault])
                    event[preventDefault]()
                  else
                    event.returnValue = false
                }
              }
            , stopPropagation = 'stopPropagation'
            , createStopPropagation = function (event) {
                return function () {
                  if (event[stopPropagation])
                    event[stopPropagation]()
                  else
                    event.cancelBubble = true
                }
              }
            , createStop = function (synEvent) {
                return function () {
                  synEvent[preventDefault]()
                  synEvent[stopPropagation]()
                  synEvent.stopped = true
                }
              }
            , copyProps = function (event, result, props) {
                var i, p
                for (i = props.length; i--;) {
                  p = props[i]
                  if (!(p in result) && p in event) result[p] = event[p]
                }
              }
  
          return function (event, isNative) {
            var result = { originalEvent: event, isNative: isNative }
            if (!event)
              return result
  
            var props
              , type = event.type
              , target = event[targetS] || event.srcElement
  
            result[preventDefault] = createPreventDefault(event)
            result[stopPropagation] = createStopPropagation(event)
            result.stop = createStop(result)
            result[targetS] = target && target.nodeType === 3 ? target.parentNode : target
  
            if (isNative) { // we only need basic augmentation on custom events, the rest is too expensive
              if (type.indexOf('key') !== -1) {
                props = keyProps
                result.keyCode = event.keyCode || event.which
              } else if (mouseTypeRegex.test(type)) {
                props = mouseProps
                result.rightClick = event.which === 3 || event.button === 2
                result.pos = { x: 0, y: 0 }
                if (event.pageX || event.pageY) {
                  result.clientX = event.pageX
                  result.clientY = event.pageY
                } else if (event.clientX || event.clientY) {
                  result.clientX = event.clientX + doc.body.scrollLeft + root.scrollLeft
                  result.clientY = event.clientY + doc.body.scrollTop + root.scrollTop
                }
                if (overOut.test(type))
                  result.relatedTarget = event.relatedTarget || event[(type === 'mouseover' ? 'from' : 'to') + 'Element']
              } else if (touchTypeRegex.test(type)) {
                props = touchProps
              } else if (mouseWheelTypeRegex.test(type)) {
                props = mouseWheelProps
              } else if (textTypeRegex.test(type)) {
                props = textProps
              } else if (type === 'message') {
                props = messageProps
              }
              copyProps(event, result, props || commonProps)
            }
            return result
          }
        }())
  
        // if we're in old IE we can't do onpropertychange on doc or win so we use doc.documentElement for both
      , targetElement = function (element, isNative) {
          return !W3C_MODEL && !isNative && (element === doc || element === win) ? root : element
        }
  
        // we use one of these per listener, of any type
      , RegEntry = (function () {
          function entry(element, type, handler, original, namespaces) {
            var isNative = this.isNative = nativeEvents[type] && element[eventSupport]
            this.element = element
            this.type = type
            this.handler = handler
            this.original = original
            this.namespaces = namespaces
            this.custom = customEvents[type]
            this.eventType = W3C_MODEL || isNative ? type : 'propertychange'
            this.customType = !W3C_MODEL && !isNative && type
            this[targetS] = targetElement(element, isNative)
            this[eventSupport] = this[targetS][eventSupport]
          }
  
          entry.prototype = {
              // given a list of namespaces, is our entry in any of them?
              inNamespaces: function (checkNamespaces) {
                var i, j
                if (!checkNamespaces)
                  return true
                if (!this.namespaces)
                  return false
                for (i = checkNamespaces.length; i--;) {
                  for (j = this.namespaces.length; j--;) {
                    if (checkNamespaces[i] === this.namespaces[j])
                      return true
                  }
                }
                return false
              }
  
              // match by element, original fn (opt), handler fn (opt)
            , matches: function (checkElement, checkOriginal, checkHandler) {
                return this.element === checkElement &&
                  (!checkOriginal || this.original === checkOriginal) &&
                  (!checkHandler || this.handler === checkHandler)
              }
          }
  
          return entry
        }())
  
      , registry = (function () {
          // our map stores arrays by event type, just because it's better than storing
          // everything in a single array. uses '$' as a prefix for the keys for safety
          var map = {}
  
            // generic functional search of our registry for matching listeners,
            // `fn` returns false to break out of the loop
            , forAll = function (element, type, original, handler, fn) {
                if (!type || type === '*') {
                  // search the whole registry
                  for (var t in map) {
                    if (t.charAt(0) === '$')
                      forAll(element, t.substr(1), original, handler, fn)
                  }
                } else {
                  var i = 0, l, list = map['$' + type], all = element === '*'
                  if (!list)
                    return
                  for (l = list.length; i < l; i++) {
                    if (all || list[i].matches(element, original, handler))
                      if (!fn(list[i], list, i, type))
                        return
                  }
                }
              }
  
            , has = function (element, type, original) {
                // we're not using forAll here simply because it's a bit slower and this
                // needs to be fast
                var i, list = map['$' + type]
                if (list) {
                  for (i = list.length; i--;) {
                    if (list[i].matches(element, original, null))
                      return true
                  }
                }
                return false
              }
  
            , get = function (element, type, original) {
                var entries = []
                forAll(element, type, original, null, function (entry) { return entries.push(entry) })
                return entries
              }
  
            , put = function (entry) {
                (map['$' + entry.type] || (map['$' + entry.type] = [])).push(entry)
                return entry
              }
  
            , del = function (entry) {
                forAll(entry.element, entry.type, null, entry.handler, function (entry, list, i) {
                  list.splice(i, 1)
                  if (list.length === 0)
                    delete map['$' + entry.type]
                  return false
                })
              }
  
              // dump all entries, used for onunload
            , entries = function () {
                var t, entries = []
                for (t in map) {
                  if (t.charAt(0) === '$')
                    entries = entries.concat(map[t])
                }
                return entries
              }
  
          return { has: has, get: get, put: put, del: del, entries: entries }
        }())
  
      , selectorEngine = doc[qSA]
          ? function (s, r) {
              return r[qSA](s)
            }
          : function () {
              throw new Error('Bean: No selector engine installed') // eeek
            }
  
      , setSelectorEngine = function (e) {
          selectorEngine = e
        }
  
        // add and remove listeners to DOM elements
      , listener = W3C_MODEL ? function (element, type, fn, add) {
          element[add ? addEvent : removeEvent](type, fn, false)
        } : function (element, type, fn, add, custom) {
          if (custom && add && element['_on' + custom] === null)
            element['_on' + custom] = 0
          element[add ? attachEvent : detachEvent]('on' + type, fn)
        }
  
      , nativeHandler = function (element, fn, args) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, true)
            if (beanDel) // delegated event, fix the fix
              event.currentTarget = beanDel.ft(event[targetS], element)
            return fn.apply(element, [event].concat(args))
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , customHandler = function (element, fn, type, condition, args, isNative) {
          var beanDel = fn.__beanDel
            , handler = function (event) {
            var target = beanDel ? beanDel.ft(event[targetS], element) : this // deleated event
            if (condition ? condition.apply(target, arguments) : W3C_MODEL ? true : event && event.propertyName === '_on' + type || !event) {
              if (event) {
                event = fixEvent(event || ((this[ownerDocument] || this.document || this).parentWindow || win).event, isNative)
                event.currentTarget = target
              }
              fn.apply(element, event && (!args || args.length === 0) ? arguments : slice.call(arguments, event ? 0 : 1).concat(args))
            }
          }
          handler.__beanDel = beanDel
          return handler
        }
  
      , once = function (rm, element, type, fn, originalFn) {
          // wrap the handler in a handler that does a remove as well
          return function () {
            rm(element, type, originalFn)
            fn.apply(this, arguments)
          }
        }
  
      , removeListener = function (element, orgType, handler, namespaces) {
          var i, l, entry
            , type = (orgType && orgType.replace(nameRegex, ''))
            , handlers = registry.get(element, type, handler)
  
          for (i = 0, l = handlers.length; i < l; i++) {
            if (handlers[i].inNamespaces(namespaces)) {
              if ((entry = handlers[i])[eventSupport])
                listener(entry[targetS], entry.eventType, entry.handler, false, entry.type)
              // TODO: this is problematic, we have a registry.get() and registry.del() that
              // both do registry searches so we waste cycles doing this. Needs to be rolled into
              // a single registry.forAll(fn) that removes while finding, but the catch is that
              // we'll be splicing the arrays that we're iterating over. Needs extra tests to
              // make sure we don't screw it up. @rvagg
              registry.del(entry)
            }
          }
        }
  
      , addListener = function (element, orgType, fn, originalFn, args) {
          var entry
            , type = orgType.replace(nameRegex, '')
            , namespaces = orgType.replace(namespaceRegex, '').split('.')
  
          if (registry.has(element, type, fn))
            return element // no dupe
          if (type === 'unload')
            fn = once(removeListener, element, type, fn, originalFn) // self clean-up
          if (customEvents[type]) {
            if (customEvents[type].condition)
              fn = customHandler(element, fn, type, customEvents[type].condition, args, true)
            type = customEvents[type].base || type
          }
          entry = registry.put(new RegEntry(element, type, fn, originalFn, namespaces[0] && namespaces))
          entry.handler = entry.isNative ?
            nativeHandler(element, entry.handler, args) :
            customHandler(element, entry.handler, type, false, args, false)
          if (entry[eventSupport])
            listener(entry[targetS], entry.eventType, entry.handler, true, entry.customType)
        }
  
      , del = function (selector, fn, $) {
              //TODO: findTarget (therefore $) is called twice, once for match and once for
              // setting e.currentTarget, fix this so it's only needed once
          var findTarget = function (target, root) {
                var i, array = typeof selector === 'string' ? $(selector, root) : selector
                for (; target && target !== root; target = target.parentNode) {
                  for (i = array.length; i--;) {
                    if (array[i] === target)
                      return target
                  }
                }
              }
            , handler = function (e) {
                var match = findTarget(e[targetS], this)
                match && fn.apply(match, arguments)
              }
  
          handler.__beanDel = {
              ft: findTarget // attach it here for customEvents to use too
            , selector: selector
            , $: $
          }
          return handler
        }
  
      , remove = function (element, typeSpec, fn) {
          var k, type, namespaces, i
            , rm = removeListener
            , isString = typeSpec && typeof typeSpec === 'string'
  
          if (isString && typeSpec.indexOf(' ') > 0) {
            // remove(el, 't1 t2 t3', fn) or remove(el, 't1 t2 t3')
            typeSpec = typeSpec.split(' ')
            for (i = typeSpec.length; i--;)
              remove(element, typeSpec[i], fn)
            return element
          }
          type = isString && typeSpec.replace(nameRegex, '')
          if (type && customEvents[type])
            type = customEvents[type].type
          if (!typeSpec || isString) {
            // remove(el) or remove(el, t1.ns) or remove(el, .ns) or remove(el, .ns1.ns2.ns3)
            if (namespaces = isString && typeSpec.replace(namespaceRegex, ''))
              namespaces = namespaces.split('.')
            rm(element, type, fn, namespaces)
          } else if (typeof typeSpec === 'function') {
            // remove(el, fn)
            rm(element, null, typeSpec)
          } else {
            // remove(el, { t1: fn1, t2, fn2 })
            for (k in typeSpec) {
              if (typeSpec.hasOwnProperty(k))
                remove(element, k, typeSpec[k])
            }
          }
          return element
        }
  
        // 5th argument, $=selector engine, is deprecated and will be removed
      , add = function (element, events, fn, delfn, $) {
          var type, types, i, args
            , originalFn = fn
            , isDel = fn && typeof fn === 'string'
  
          if (events && !fn && typeof events === 'object') {
            for (type in events) {
              if (events.hasOwnProperty(type))
                add.apply(this, [ element, type, events[type] ])
            }
          } else {
            args = arguments.length > 3 ? slice.call(arguments, 3) : []
            types = (isDel ? fn : events).split(' ')
            isDel && (fn = del(events, (originalFn = delfn), $ || selectorEngine)) && (args = slice.call(args, 1))
            // special case for one()
            this === ONE && (fn = once(remove, element, events, fn, originalFn))
            for (i = types.length; i--;) addListener(element, types[i], fn, originalFn, args)
          }
          return element
        }
  
      , one = function () {
          return add.apply(ONE, arguments)
        }
  
      , fireListener = W3C_MODEL ? function (isNative, type, element) {
          var evt = doc.createEvent(isNative ? 'HTMLEvents' : 'UIEvents')
          evt[isNative ? 'initEvent' : 'initUIEvent'](type, true, true, win, 1)
          element.dispatchEvent(evt)
        } : function (isNative, type, element) {
          element = targetElement(element, isNative)
          // if not-native then we're using onpropertychange so we just increment a custom property
          isNative ? element.fireEvent('on' + type, doc.createEventObject()) : element['_on' + type]++
        }
  
      , fire = function (element, type, args) {
          var i, j, l, names, handlers
            , types = type.split(' ')
  
          for (i = types.length; i--;) {
            type = types[i].replace(nameRegex, '')
            if (names = types[i].replace(namespaceRegex, ''))
              names = names.split('.')
            if (!names && !args && element[eventSupport]) {
              fireListener(nativeEvents[type], type, element)
            } else {
              // non-native event, either because of a namespace, arguments or a non DOM element
              // iterate over all listeners and manually 'fire'
              handlers = registry.get(element, type)
              args = [false].concat(args)
              for (j = 0, l = handlers.length; j < l; j++) {
                if (handlers[j].inNamespaces(names))
                  handlers[j].handler.apply(element, args)
              }
            }
          }
          return element
        }
  
      , clone = function (element, from, type) {
          var i = 0
            , handlers = registry.get(from, type)
            , l = handlers.length
            , args, beanDel
  
          for (;i < l; i++) {
            if (handlers[i].original) {
              beanDel = handlers[i].handler.__beanDel
              if (beanDel) {
                args = [ element, beanDel.selector, handlers[i].type, handlers[i].original, beanDel.$]
              } else
                args = [ element, handlers[i].type, handlers[i].original ]
              add.apply(null, args)
            }
          }
          return element
        }
  
      , bean = {
            add: add
          , one: one
          , remove: remove
          , clone: clone
          , fire: fire
          , setSelectorEngine: setSelectorEngine
          , noConflict: function () {
              context[name] = old
              return this
            }
        }
  
    if (win[attachEvent]) {
      // for IE, clean up on unload to avoid leaks
      var cleanup = function () {
        var i, entries = registry.entries()
        for (i in entries) {
          if (entries[i].type && entries[i].type !== 'unload')
            remove(entries[i].element, entries[i].type)
        }
        win[detachEvent]('onunload', cleanup)
        win.CollectGarbage && win.CollectGarbage()
      }
      win[attachEvent]('onunload', cleanup)
    }
  
    return bean
  })
  

  provide("bean", module.exports);

  !function ($) {
    var b = require('bean')
      , integrate = function (method, type, method2) {
          var _args = type ? [type] : []
          return function () {
            for (var i = 0, l = this.length; i < l; i++) {
              if (!arguments.length && method == 'add' && type) method = 'fire'
              b[method].apply(this, [this[i]].concat(_args, Array.prototype.slice.call(arguments, 0)))
            }
            return this
          }
        }
      , add = integrate('add')
      , remove = integrate('remove')
      , fire = integrate('fire')
  
      , methods = {
            on: add // NOTE: .on() is likely to change in the near future, don't rely on this as-is see https://github.com/fat/bean/issues/55
          , addListener: add
          , bind: add
          , listen: add
          , delegate: add
  
          , one: integrate('one')
  
          , off: remove
          , unbind: remove
          , unlisten: remove
          , removeListener: remove
          , undelegate: remove
  
          , emit: fire
          , trigger: fire
  
          , cloneEvents: integrate('clone')
  
          , hover: function (enter, leave, i) { // i for internal
              for (i = this.length; i--;) {
                b.add.call(this, this[i], 'mouseenter', enter)
                b.add.call(this, this[i], 'mouseleave', leave)
              }
              return this
            }
        }
  
      , shortcuts =
           ('blur change click dblclick error focus focusin focusout keydown keypress '
          + 'keyup load mousedown mouseenter mouseleave mouseout mouseover mouseup '
          + 'mousemove resize scroll select submit unload').split(' ')
  
    for (var i = shortcuts.length; i--;) {
      methods[shortcuts[i]] = integrate('add', shortcuts[i])
    }
  
    b.setSelectorEngine($)
  
    $.ender(methods, true)
  }(ender)
  

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Bonzo: DOM Utility (c) Dustin Diaz 2012
    * https://github.com/ded/bonzo
    * License MIT
    */
  (function (name, definition, context) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof context['define'] == 'function' && context['define']['amd']) define(name, definition)
    else context[name] = definition()
  })('bonzo', function() {
    var win = window
      , doc = win.document
      , html = doc.documentElement
      , parentNode = 'parentNode'
      , query = null // used for setting a selector engine host
      , specialAttributes = /^(checked|value|selected)$/i
      , specialTags = /^(select|fieldset|table|tbody|tfoot|td|tr|colgroup)$/i // tags that we have trouble inserting *into*
      , table = ['<table>', '</table>', 1]
      , td = ['<table><tbody><tr>', '</tr></tbody></table>', 3]
      , option = ['<select>', '</select>', 1]
      , noscope = ['_', '', 0, 1]
      , tagMap = { // tags that we have trouble *inserting*
            thead: table, tbody: table, tfoot: table, colgroup: table, caption: table
          , tr: ['<table><tbody>', '</tbody></table>', 2]
          , th: td , td: td
          , col: ['<table><colgroup>', '</colgroup></table>', 2]
          , fieldset: ['<form>', '</form>', 1]
          , legend: ['<form><fieldset>', '</fieldset></form>', 2]
          , option: option, optgroup: option
          , script: noscope, style: noscope, link: noscope, param: noscope, base: noscope
        }
      , stateAttributes = /^(checked|selected)$/
      , ie = /msie/i.test(navigator.userAgent)
      , hasClass, addClass, removeClass
      , uidMap = {}
      , uuids = 0
      , digit = /^-?[\d\.]+$/
      , dattr = /^data-(.+)$/
      , px = 'px'
      , setAttribute = 'setAttribute'
      , getAttribute = 'getAttribute'
      , byTag = 'getElementsByTagName'
      , features = function() {
          var e = doc.createElement('p')
          e.innerHTML = '<a href="#x">x</a><table style="float:left;"></table>'
          return {
            hrefExtended: e[byTag]('a')[0][getAttribute]('href') != '#x' // IE < 8
          , autoTbody: e[byTag]('tbody').length !== 0 // IE < 8
          , computedStyle: doc.defaultView && doc.defaultView.getComputedStyle
          , cssFloat: e[byTag]('table')[0].style.styleFloat ? 'styleFloat' : 'cssFloat'
          , transform: function () {
              var props = ['webkitTransform', 'MozTransform', 'OTransform', 'msTransform', 'Transform'], i
              for (i = 0; i < props.length; i++) {
                if (props[i] in e.style) return props[i]
              }
            }()
          , classList: 'classList' in e
          , opasity: function () {
              return typeof doc.createElement('a').style.opacity !== 'undefined'
            }()
          }
        }()
      , trimReplace = /(^\s*|\s*$)/g
      , whitespaceRegex = /\s+/
      , toString = String.prototype.toString
      , unitless = { lineHeight: 1, zoom: 1, zIndex: 1, opacity: 1, boxFlex: 1, WebkitBoxFlex: 1, MozBoxFlex: 1 }
      , trim = String.prototype.trim ?
          function (s) {
            return s.trim()
          } :
          function (s) {
            return s.replace(trimReplace, '')
          }
  
  
    /**
     * @param {string} c a class name to test
     * @return {boolean}
     */
    function classReg(c) {
      return new RegExp("(^|\\s+)" + c + "(\\s+|$)")
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @param {boolean=} opt_rev
     * @return {Bonzo|Array}
     */
    function each(ar, fn, opt_scope, opt_rev) {
      var ind, i = 0, l = ar.length
      for (; i < l; i++) {
        ind = opt_rev ? ar.length - i - 1 : i
        fn.call(opt_scope || ar[ind], ar[ind], ind, ar)
      }
      return ar
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {Bonzo|Array}
     */
    function deepEach(ar, fn, opt_scope) {
      for (var i = 0, l = ar.length; i < l; i++) {
        if (isNode(ar[i])) {
          deepEach(ar[i].childNodes, fn, opt_scope)
          fn.call(opt_scope || ar[i], ar[i], i, ar)
        }
      }
      return ar
    }
  
  
    /**
     * @param {string} s
     * @return {string}
     */
    function camelize(s) {
      return s.replace(/-(.)/g, function (m, m1) {
        return m1.toUpperCase()
      })
    }
  
  
    /**
     * @param {string} s
     * @return {string}
     */
    function decamelize(s) {
      return s ? s.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase() : s
    }
  
  
    /**
     * @param {Element} el
     * @return {*}
     */
    function data(el) {
      el[getAttribute]('data-node-uid') || el[setAttribute]('data-node-uid', ++uuids)
      var uid = el[getAttribute]('data-node-uid')
      return uidMap[uid] || (uidMap[uid] = {})
    }
  
  
    /**
     * removes the data associated with an element
     * @param {Element} el
     */
    function clearData(el) {
      var uid = el[getAttribute]('data-node-uid')
      if (uid) delete uidMap[uid]
    }
  
  
    function dataValue(d) {
      var f
      try {
        return (d === null || d === undefined) ? undefined :
          d === 'true' ? true :
            d === 'false' ? false :
              d === 'null' ? null :
                (f = parseFloat(d)) == d ? f : d;
      } catch(e) {}
      return undefined
    }
  
    function isNode(node) {
      return node && node.nodeName && (node.nodeType == 1 || node.nodeType == 11)
    }
  
  
    /**
     * @param {Bonzo|Array} ar
     * @param {function(Object, number, (Bonzo|Array))} fn
     * @param {Object=} opt_scope
     * @return {boolean} whether `some`thing was found
     */
    function some(ar, fn, opt_scope) {
      for (var i = 0, j = ar.length; i < j; ++i) if (fn.call(opt_scope || null, ar[i], i, ar)) return true
      return false
    }
  
  
    /**
     * this could be a giant enum of CSS properties
     * but in favor of file size sans-closure deadcode optimizations
     * we're just asking for any ol string
     * then it gets transformed into the appropriate style property for JS access
     * @param {string} p
     * @return {string}
     */
    function styleProperty(p) {
        (p == 'transform' && (p = features.transform)) ||
          (/^transform-?[Oo]rigin$/.test(p) && (p = features.transform + "Origin")) ||
          (p == 'float' && (p = features.cssFloat))
        return p ? camelize(p) : null
    }
  
    var getStyle = features.computedStyle ?
      function (el, property) {
        var value = null
          , computed = doc.defaultView.getComputedStyle(el, '')
        computed && (value = computed[property])
        return el.style[property] || value
      } :
  
      (ie && html.currentStyle) ?
  
      /**
       * @param {Element} el
       * @param {string} property
       * @return {string|number}
       */
      function (el, property) {
        if (property == 'opacity' && !features.opasity) {
          var val = 100
          try {
            val = el['filters']['DXImageTransform.Microsoft.Alpha'].opacity
          } catch (e1) {
            try {
              val = el['filters']('alpha').opacity
            } catch (e2) {}
          }
          return val / 100
        }
        var value = el.currentStyle ? el.currentStyle[property] : null
        return el.style[property] || value
      } :
  
      function (el, property) {
        return el.style[property]
      }
  
    // this insert method is intense
    function insert(target, host, fn, rev) {
      var i = 0, self = host || this, r = []
        // target nodes could be a css selector if it's a string and a selector engine is present
        // otherwise, just use target
        , nodes = query && typeof target == 'string' && target.charAt(0) != '<' ? query(target) : target
      // normalize each node in case it's still a string and we need to create nodes on the fly
      each(normalize(nodes), function (t, j) {
        each(self, function (el) {
          fn(t, r[i++] = j > 0 ? cloneNode(self, el) : el)
        }, null, rev)
      }, this, rev)
      self.length = i
      each(r, function (e) {
        self[--i] = e
      }, null, !rev)
      return self
    }
  
  
    /**
     * sets an element to an explicit x/y position on the page
     * @param {Element} el
     * @param {?number} x
     * @param {?number} y
     */
    function xy(el, x, y) {
      var $el = bonzo(el)
        , style = $el.css('position')
        , offset = $el.offset()
        , rel = 'relative'
        , isRel = style == rel
        , delta = [parseInt($el.css('left'), 10), parseInt($el.css('top'), 10)]
  
      if (style == 'static') {
        $el.css('position', rel)
        style = rel
      }
  
      isNaN(delta[0]) && (delta[0] = isRel ? 0 : el.offsetLeft)
      isNaN(delta[1]) && (delta[1] = isRel ? 0 : el.offsetTop)
  
      x != null && (el.style.left = x - offset.left + delta[0] + px)
      y != null && (el.style.top = y - offset.top + delta[1] + px)
  
    }
  
    // classList support for class management
    // altho to be fair, the api sucks because it won't accept multiple classes at once
    if (features.classList) {
      hasClass = function (el, c) {
        return el.classList.contains(c)
      }
      addClass = function (el, c) {
        el.classList.add(c)
      }
      removeClass = function (el, c) {
        el.classList.remove(c)
      }
    }
    else {
      hasClass = function (el, c) {
        return classReg(c).test(el.className)
      }
      addClass = function (el, c) {
        el.className = trim(el.className + ' ' + c)
      }
      removeClass = function (el, c) {
        el.className = trim(el.className.replace(classReg(c), ' '))
      }
    }
  
  
    /**
     * this allows method calling for setting values
     *
     * @example
     * bonzo(elements).css('color', function (el) {
     *   return el.getAttribute('data-original-color')
     * })
     *
     * @param {Element} el
     * @param {function (Element)|string}
     * @return {string}
     */
    function setter(el, v) {
      return typeof v == 'function' ? v(el) : v
    }
  
    /**
     * @constructor
     * @param {Array.<Element>|Element|Node|string} elements
     */
    function Bonzo(elements) {
      this.length = 0
      if (elements) {
        elements = typeof elements !== 'string' &&
          !elements.nodeType &&
          typeof elements.length !== 'undefined' ?
            elements :
            [elements]
        this.length = elements.length
        for (var i = 0; i < elements.length; i++) this[i] = elements[i]
      }
    }
  
    Bonzo.prototype = {
  
        /**
         * @param {number} index
         * @return {Element|Node}
         */
        get: function (index) {
          return this[index] || null
        }
  
        // itetators
        /**
         * @param {function(Element|Node)} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , each: function (fn, opt_scope) {
          return each(this, fn, opt_scope)
        }
  
        /**
         * @param {Function} fn
         * @param {Object=} opt_scope
         * @return {Bonzo}
         */
      , deepEach: function (fn, opt_scope) {
          return deepEach(this, fn, opt_scope)
        }
  
  
        /**
         * @param {Function} fn
         * @param {Function=} opt_reject
         * @return {Array}
         */
      , map: function (fn, opt_reject) {
          var m = [], n, i
          for (i = 0; i < this.length; i++) {
            n = fn.call(this, this[i], i)
            opt_reject ? (opt_reject(n) && m.push(n)) : m.push(n)
          }
          return m
        }
  
      // text and html inserters!
  
      /**
       * @param {string} h the HTML to insert
       * @param {boolean=} opt_text whether to set or get text content
       * @return {Bonzo|string}
       */
      , html: function (h, opt_text) {
          var method = opt_text
                ? html.textContent === undefined ? 'innerText' : 'textContent'
                : 'innerHTML'
            , that = this
            , append = function (el, i) {
                each(normalize(h, that, i), function (node) {
                  el.appendChild(node)
                })
              }
            , updateElement = function (el, i) {
                try {
                  if (opt_text || (typeof h == 'string' && !specialTags.test(el.tagName))) {
                    return el[method] = h
                  }
                } catch (e) {}
                append(el, i)
              }
          return typeof h != 'undefined'
            ? this.empty().each(updateElement)
            : this[0] ? this[0][method] : ''
        }
  
        /**
         * @param {string=} opt_text the text to set, otherwise this is a getter
         * @return {Bonzo|string}
         */
      , text: function (opt_text) {
          return this.html(opt_text, true)
        }
  
        // more related insertion methods
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , append: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el.appendChild(i)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , prepend: function (node) {
          var that = this
          return this.each(function (el, i) {
            var first = el.firstChild
            each(normalize(node, that, i), function (i) {
              el.insertBefore(i, first)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , appendTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.appendChild(el)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , prependTo: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t.insertBefore(el, t.firstChild)
          }, 1)
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , before: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el)
            })
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @return {Bonzo}
         */
      , after: function (node) {
          var that = this
          return this.each(function (el, i) {
            each(normalize(node, that, i), function (i) {
              el[parentNode].insertBefore(i, el.nextSibling)
            }, null, 1)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertBefore: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            t[parentNode].insertBefore(el, t)
          })
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} target the location for which you'll insert your new content
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , insertAfter: function (target, opt_host) {
          return insert.call(this, target, opt_host, function (t, el) {
            var sibling = t.nextSibling
            sibling ?
              t[parentNode].insertBefore(el, sibling) :
              t[parentNode].appendChild(el)
          }, 1)
        }
  
  
        /**
         * @param {Bonzo|string|Element|Array} node
         * @param {Object=} opt_host an optional host scope (primarily used when integrated with Ender)
         * @return {Bonzo}
         */
      , replaceWith: function (node, opt_host) {
          var ret = bonzo(normalize(node)).insertAfter(this, opt_host)
          this.remove()
          Bonzo.call(opt_host || this, ret)
          return opt_host || this
        }
  
        // class management
  
        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , addClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            // we `each` here so you can do $el.addClass('foo bar')
            each(c, function (c) {
              if (c && !hasClass(el, setter(el, c)))
                addClass(el, setter(el, c))
            })
          })
        }
  
  
        /**
         * @param {string} c
         * @return {Bonzo}
         */
      , removeClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c && hasClass(el, setter(el, c)))
                removeClass(el, setter(el, c))
            })
          })
        }
  
  
        /**
         * @param {string} c
         * @return {boolean}
         */
      , hasClass: function (c) {
          c = toString.call(c).split(whitespaceRegex)
          return some(this, function (el) {
            return some(c, function (c) {
              return c && hasClass(el, c)
            })
          })
        }
  
  
        /**
         * @param {string} c classname to toggle
         * @param {boolean=} opt_condition whether to add or remove the class straight away
         * @return {Bonzo}
         */
      , toggleClass: function (c, opt_condition) {
          c = toString.call(c).split(whitespaceRegex)
          return this.each(function (el) {
            each(c, function (c) {
              if (c) {
                typeof opt_condition !== 'undefined' ?
                  opt_condition ? addClass(el, c) : removeClass(el, c) :
                  hasClass(el, c) ? removeClass(el, c) : addClass(el, c)
              }
            })
          })
        }
  
        // display togglers
  
        /**
         * @param {string=} opt_type useful to set back to anything other than an empty string
         * @return {Bonzo}
         */
      , show: function (opt_type) {
          return this.each(function (el) {
            el.style.display = opt_type || ''
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , hide: function () {
          return this.each(function (el) {
            el.style.display = 'none'
          })
        }
  
  
        /**
         * @param {Function=} opt_callback
         * @param {string=} opt_type
         * @return {Bonzo}
         */
      , toggle: function (opt_callback, opt_type) {
          this.each(function (el) {
            el.style.display = (el.offsetWidth || el.offsetHeight) ? 'none' : opt_type || ''
          })
          if (opt_callback) opt_callback()
          return this
        }
  
  
        // DOM Walkers & getters
  
        /**
         * @return {Element|Node}
         */
      , first: function () {
          return bonzo(this.length ? this[0] : [])
        }
  
  
        /**
         * @return {Element|Node}
         */
      , last: function () {
          return bonzo(this.length ? this[this.length - 1] : [])
        }
  
  
        /**
         * @return {Element|Node}
         */
      , next: function () {
          return this.related('nextSibling')
        }
  
  
        /**
         * @return {Element|Node}
         */
      , previous: function () {
          return this.related('previousSibling')
        }
  
  
        /**
         * @return {Element|Node}
         */
      , parent: function() {
          return this.related(parentNode)
        }
  
  
        /**
         * @private
         * @param {string} method the directional DOM method
         * @return {Element|Node}
         */
      , related: function (method) {
          return this.map(
            function (el) {
              el = el[method]
              while (el && el.nodeType !== 1) {
                el = el[method]
              }
              return el || 0
            },
            function (el) {
              return el
            }
          )
        }
  
  
        /**
         * @return {Bonzo}
         */
      , focus: function () {
          this.length && this[0].focus()
          return this
        }
  
  
        /**
         * @return {Bonzo}
         */
      , blur: function () {
          this.length && this[0].blur()
          return this
        }
  
        // style getter setter & related methods
  
        /**
         * @param {Object|string} o
         * @param {string=} opt_v
         * @return {Bonzo|string}
         */
      , css: function (o, opt_v) {
          var p, iter = o
          // is this a request for just getting a style?
          if (opt_v === undefined && typeof o == 'string') {
            // repurpose 'v'
            opt_v = this[0]
            if (!opt_v) return null
            if (opt_v === doc || opt_v === win) {
              p = (opt_v === doc) ? bonzo.doc() : bonzo.viewport()
              return o == 'width' ? p.width : o == 'height' ? p.height : ''
            }
            return (o = styleProperty(o)) ? getStyle(opt_v, o) : null
          }
  
          if (typeof o == 'string') {
            iter = {}
            iter[o] = opt_v
          }
  
          if (ie && iter.opacity) {
            // oh this 'ol gamut
            iter.filter = 'alpha(opacity=' + (iter.opacity * 100) + ')'
            // give it layout
            iter.zoom = o.zoom || 1;
            delete iter.opacity;
          }
  
          function fn(el, p, v) {
            for (var k in iter) {
              if (iter.hasOwnProperty(k)) {
                v = iter[k];
                // change "5" to "5px" - unless you're line-height, which is allowed
                (p = styleProperty(k)) && digit.test(v) && !(p in unitless) && (v += px)
                el.style[p] = setter(el, v)
              }
            }
          }
          return this.each(fn)
        }
  
  
        /**
         * @param {number=} opt_x
         * @param {number=} opt_y
         * @return {Bonzo|number}
         */
      , offset: function (opt_x, opt_y) {
          if (typeof opt_x == 'number' || typeof opt_y == 'number') {
            return this.each(function (el) {
              xy(el, opt_x, opt_y)
            })
          }
          if (!this[0]) return {
              top: 0
            , left: 0
            , height: 0
            , width: 0
          }
          var el = this[0]
            , width = el.offsetWidth
            , height = el.offsetHeight
            , top = el.offsetTop
            , left = el.offsetLeft
          while (el = el.offsetParent) {
            top = top + el.offsetTop
            left = left + el.offsetLeft
  
            if (el != doc.body) {
              top -= el.scrollTop
              left -= el.scrollLeft
            }
          }
  
          return {
              top: top
            , left: left
            , height: height
            , width: width
          }
        }
  
  
        /**
         * @return {number}
         */
      , dim: function () {
          if (!this.length) return { height: 0, width: 0 }
          var el = this[0]
            , orig = !el.offsetWidth && !el.offsetHeight ?
               // el isn't visible, can't be measured properly, so fix that
               function (t) {
                 var s = {
                     position: el.style.position || ''
                   , visibility: el.style.visibility || ''
                   , display: el.style.display || ''
                 }
                 t.first().css({
                     position: 'absolute'
                   , visibility: 'hidden'
                   , display: 'block'
                 })
                 return s
              }(this) : null
            , width = el.offsetWidth
            , height = el.offsetHeight
  
          orig && this.first().css(orig)
          return {
              height: height
            , width: width
          }
        }
  
        // attributes are hard. go shopping
  
        /**
         * @param {string} k an attribute to get or set
         * @param {string=} opt_v the value to set
         * @return {Bonzo|string}
         */
      , attr: function (k, opt_v) {
          var el = this[0]
          if (typeof k != 'string' && !(k instanceof String)) {
            for (var n in k) {
              k.hasOwnProperty(n) && this.attr(n, k[n])
            }
            return this
          }
          return typeof opt_v == 'undefined' ?
            !el ? null : specialAttributes.test(k) ?
              stateAttributes.test(k) && typeof el[k] == 'string' ?
                true : el[k] : (k == 'href' || k =='src') && features.hrefExtended ?
                  el[getAttribute](k, 2) : el[getAttribute](k) :
            this.each(function (el) {
              specialAttributes.test(k) ? (el[k] = setter(el, opt_v)) : el[setAttribute](k, setter(el, opt_v))
            })
        }
  
  
        /**
         * @param {string} k
         * @return {Bonzo}
         */
      , removeAttr: function (k) {
          return this.each(function (el) {
            stateAttributes.test(k) ? (el[k] = false) : el.removeAttribute(k)
          })
        }
  
  
        /**
         * @param {string=} opt_s
         * @return {Bonzo|string}
         */
      , val: function (s) {
          return (typeof s == 'string') ?
            this.attr('value', s) :
            this.length ? this[0].value : null
        }
  
        // use with care and knowledge. this data() method uses data attributes on the DOM nodes
        // to do this differently costs a lot more code. c'est la vie
        /**
         * @param {string|Object=} opt_k the key for which to get or set data
         * @param {Object=} opt_v
         * @return {Bonzo|Object}
         */
      , data: function (opt_k, opt_v) {
          var el = this[0], o, m
          if (typeof opt_v === 'undefined') {
            if (!el) return null
            o = data(el)
            if (typeof opt_k === 'undefined') {
              each(el.attributes, function (a) {
                (m = ('' + a.name).match(dattr)) && (o[camelize(m[1])] = dataValue(a.value))
              })
              return o
            } else {
              if (typeof o[opt_k] === 'undefined')
                o[opt_k] = dataValue(this.attr('data-' + decamelize(opt_k)))
              return o[opt_k]
            }
          } else {
            return this.each(function (el) { data(el)[opt_k] = opt_v })
          }
        }
  
        // DOM detachment & related
  
        /**
         * @return {Bonzo}
         */
      , remove: function () {
          this.deepEach(clearData)
  
          return this.each(function (el) {
            el[parentNode] && el[parentNode].removeChild(el)
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , empty: function () {
          return this.each(function (el) {
            deepEach(el.childNodes, clearData)
  
            while (el.firstChild) {
              el.removeChild(el.firstChild)
            }
          })
        }
  
  
        /**
         * @return {Bonzo}
         */
      , detach: function () {
          return this.each(function (el) {
            el[parentNode].removeChild(el)
          })
        }
  
        // who uses a mouse anyway? oh right.
  
        /**
         * @param {number} y
         */
      , scrollTop: function (y) {
          return scroll.call(this, null, y, 'y')
        }
  
  
        /**
         * @param {number} x
         */
      , scrollLeft: function (x) {
          return scroll.call(this, x, null, 'x')
        }
  
    }
  
    function normalize(node, host, clone) {
      var i, l, ret
      if (typeof node == 'string') return bonzo.create(node)
      if (isNode(node)) node = [ node ]
      if (clone) {
        ret = [] // don't change original array
        for (i = 0, l = node.length; i < l; i++) ret[i] = cloneNode(host, node[i])
        return ret
      }
      return node
    }
  
    function cloneNode(host, el) {
      var c = el.cloneNode(true)
        , cloneElems
        , elElems
  
      // check for existence of an event cloner
      // preferably https://github.com/fat/bean
      // otherwise Bonzo won't do this for you
      if (host.$ && typeof host.cloneEvents == 'function') {
        host.$(c).cloneEvents(el)
  
        // clone events from every child node
        cloneElems = host.$(c).find('*')
        elElems = host.$(el).find('*')
  
        for (var i = 0; i < elElems.length; i++)
          host.$(cloneElems[i]).cloneEvents(elElems[i])
      }
      return c
    }
  
    function scroll(x, y, type) {
      var el = this[0]
      if (!el) return this
      if (x == null && y == null) {
        return (isBody(el) ? getWindowScroll() : { x: el.scrollLeft, y: el.scrollTop })[type]
      }
      if (isBody(el)) {
        win.scrollTo(x, y)
      } else {
        x != null && (el.scrollLeft = x)
        y != null && (el.scrollTop = y)
      }
      return this
    }
  
    function isBody(element) {
      return element === win || (/^(?:body|html)$/i).test(element.tagName)
    }
  
    function getWindowScroll() {
      return { x: win.pageXOffset || html.scrollLeft, y: win.pageYOffset || html.scrollTop }
    }
  
    /**
     * @param {Array.<Element>|Element|Node|string} els
     * @return {Bonzo}
     */
    function bonzo(els) {
      return new Bonzo(els)
    }
  
    bonzo.setQueryEngine = function (q) {
      query = q;
      delete bonzo.setQueryEngine
    }
  
    bonzo.aug = function (o, target) {
      // for those standalone bonzo users. this love is for you.
      for (var k in o) {
        o.hasOwnProperty(k) && ((target || Bonzo.prototype)[k] = o[k])
      }
    }
  
    bonzo.create = function (node) {
      // hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
      return typeof node == 'string' && node !== '' ?
        function () {
          var tag = /^\s*<([^\s>]+)/.exec(node)
            , el = doc.createElement('div')
            , els = []
            , p = tag ? tagMap[tag[1].toLowerCase()] : null
            , dep = p ? p[2] + 1 : 1
            , ns = p && p[3]
            , pn = parentNode
            , tb = features.autoTbody && p && p[0] == '<table>' && !(/<tbody/i).test(node)
  
          el.innerHTML = p ? (p[0] + node + p[1]) : node
          while (dep--) el = el.firstChild
          // for IE NoScope, we may insert cruft at the begining just to get it to work
          if (ns && el && el.nodeType !== 1) el = el.nextSibling
          do {
            // tbody special case for IE<8, creates tbody on any empty table
            // we don't want it if we're just after a <thead>, <caption>, etc.
            if ((!tag || el.nodeType == 1) && (!tb || el.tagName.toLowerCase() != 'tbody')) {
              els.push(el)
            }
          } while (el = el.nextSibling)
          // IE < 9 gives us a parentNode which messes up insert() check for cloning
          // `dep` > 1 can also cause problems with the insert() check (must do this last)
          each(els, function(el) { el[pn] && el[pn].removeChild(el) })
          return els
        }() : isNode(node) ? [node.cloneNode(true)] : []
    }
  
    bonzo.doc = function () {
      var vp = bonzo.viewport()
      return {
          width: Math.max(doc.body.scrollWidth, html.scrollWidth, vp.width)
        , height: Math.max(doc.body.scrollHeight, html.scrollHeight, vp.height)
      }
    }
  
    bonzo.firstChild = function (el) {
      for (var c = el.childNodes, i = 0, j = (c && c.length) || 0, e; i < j; i++) {
        if (c[i].nodeType === 1) e = c[j = i]
      }
      return e
    }
  
    bonzo.viewport = function () {
      return {
          width: ie ? html.clientWidth : self.innerWidth
        , height: ie ? html.clientHeight : self.innerHeight
      }
    }
  
    bonzo.isAncestor = 'compareDocumentPosition' in html ?
      function (container, element) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (container, element) {
        return container !== element && container.contains(element);
      } :
      function (container, element) {
        while (element = element[parentNode]) {
          if (element === container) {
            return true
          }
        }
        return false
      }
  
    return bonzo
  }, this); // the only line we care about using a semi-colon. placed here for concatenation tools

  provide("bonzo", module.exports);

  (function ($) {
  
    var b = require('bonzo')
    b.setQueryEngine($)
    $.ender(b)
    $.ender(b(), true)
    $.ender({
      create: function (node) {
        return $(b.create(node))
      }
    })
  
    $.id = function (id) {
      return $([document.getElementById(id)])
    }
  
    function indexOf(ar, val) {
      for (var i = 0; i < ar.length; i++) if (ar[i] === val) return i
      return -1
    }
  
    function uniq(ar) {
      var r = [], i = 0, j = 0, k, item, inIt
      for (; item = ar[i]; ++i) {
        inIt = false
        for (k = 0; k < r.length; ++k) {
          if (r[k] === item) {
            inIt = true; break
          }
        }
        if (!inIt) r[j++] = item
      }
      return r
    }
  
    $.ender({
      parents: function (selector, closest) {
        if (!this.length) return this
        var collection = $(selector), j, k, p, r = []
        for (j = 0, k = this.length; j < k; j++) {
          p = this[j]
          while (p = p.parentNode) {
            if (~indexOf(collection, p)) {
              r.push(p)
              if (closest) break;
            }
          }
        }
        return $(uniq(r))
      }
  
    , parent: function() {
        return $(uniq(b(this).parent()))
      }
  
    , closest: function (selector) {
        return this.parents(selector, true)
      }
  
    , first: function () {
        return $(this.length ? this[0] : this)
      }
  
    , last: function () {
        return $(this.length ? this[this.length - 1] : [])
      }
  
    , next: function () {
        return $(b(this).next())
      }
  
    , previous: function () {
        return $(b(this).previous())
      }
  
    , appendTo: function (t) {
        return b(this.selector).appendTo(t, this)
      }
  
    , prependTo: function (t) {
        return b(this.selector).prependTo(t, this)
      }
  
    , insertAfter: function (t) {
        return b(this.selector).insertAfter(t, this)
      }
  
    , insertBefore: function (t) {
        return b(this.selector).insertBefore(t, this)
      }
  
    , replaceWith: function (t) {
        return b(this.selector).replaceWith(t, this)
      }
  
    , siblings: function () {
        var i, l, p, r = []
        for (i = 0, l = this.length; i < l; i++) {
          p = this[i]
          while (p = p.previousSibling) p.nodeType == 1 && r.push(p)
          p = this[i]
          while (p = p.nextSibling) p.nodeType == 1 && r.push(p)
        }
        return $(r)
      }
  
    , children: function () {
        var i, l, el, r = []
        for (i = 0, l = this.length; i < l; i++) {
          if (!(el = b.firstChild(this[i]))) continue;
          r.push(el)
          while (el = el.nextSibling) el.nodeType == 1 && r.push(el)
        }
        return $(uniq(r))
      }
  
    , height: function (v) {
        return dimension.call(this, 'height', v)
      }
  
    , width: function (v) {
        return dimension.call(this, 'width', v)
      }
    }, true)
  
    /**
     * @param {string} type either width or height
     * @param {number=} opt_v becomes a setter instead of a getter
     * @return {number}
     */
    function dimension(type, opt_v) {
      return typeof opt_v == 'undefined'
        ? b(this).dim()[type]
        : this.css(type, opt_v)
    }
  }(ender));

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * domready (c) Dustin Diaz 2012 - License MIT
    */
  !function (name, definition) {
    if (typeof module != 'undefined') module.exports = definition()
    else if (typeof define == 'function' && typeof define.amd == 'object') define(definition)
    else this[name] = definition()
  }('domready', function (ready) {
  
    var fns = [], fn, f = false
      , doc = document
      , testEl = doc.documentElement
      , hack = testEl.doScroll
      , domContentLoaded = 'DOMContentLoaded'
      , addEventListener = 'addEventListener'
      , onreadystatechange = 'onreadystatechange'
      , readyState = 'readyState'
      , loaded = /^loade|c/.test(doc[readyState])
  
    function flush(f) {
      loaded = 1
      while (f = fns.shift()) f()
    }
  
    doc[addEventListener] && doc[addEventListener](domContentLoaded, fn = function () {
      doc.removeEventListener(domContentLoaded, fn, f)
      flush()
    }, f)
  
  
    hack && doc.attachEvent(onreadystatechange, fn = function () {
      if (/^c/.test(doc[readyState])) {
        doc.detachEvent(onreadystatechange, fn)
        flush()
      }
    })
  
    return (ready = hack ?
      function (fn) {
        self != top ?
          loaded ? fn() : fns.push(fn) :
          function () {
            try {
              testEl.doScroll('left')
            } catch (e) {
              return setTimeout(function() { ready(fn) }, 50)
            }
            fn()
          }()
      } :
      function (fn) {
        loaded ? fn() : fns.push(fn)
      })
  })

  provide("domready", module.exports);

  !function ($) {
    var ready = require('domready')
    $.ender({domReady: ready})
    $.ender({
      ready: function (f) {
        ready(f)
        return this
      }
    }, true)
  }(ender);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * @preserve Qwery - A Blazing Fast query selector engine
    * https://github.com/ded/qwery
    * copyright Dustin Diaz & Jacob Thornton 2012
    * MIT License
    */
  
  (function (name, definition, context) {
    if (typeof module != 'undefined' && module.exports) module.exports = definition()
    else if (typeof context['define'] == 'function' && context['define']['amd']) define(name, definition)
    else context[name] = definition()
  })('qwery', function () {
    var doc = document
      , html = doc.documentElement
      , byClass = 'getElementsByClassName'
      , byTag = 'getElementsByTagName'
      , qSA = 'querySelectorAll'
      , useNativeQSA = 'useNativeQSA'
      , tagName = 'tagName'
      , nodeType = 'nodeType'
      , select // main select() method, assign later
  
      , id = /#([\w\-]+)/
      , clas = /\.[\w\-]+/g
      , idOnly = /^#([\w\-]+)$/
      , classOnly = /^\.([\w\-]+)$/
      , tagOnly = /^([\w\-]+)$/
      , tagAndOrClass = /^([\w]+)?\.([\w\-]+)$/
      , splittable = /(^|,)\s*[>~+]/
      , normalizr = /^\s+|\s*([,\s\+\~>]|$)\s*/g
      , splitters = /[\s\>\+\~]/
      , splittersMore = /(?![\s\w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^'"]*\]|[\s\w\+\-]*\))/
      , specialChars = /([.*+?\^=!:${}()|\[\]\/\\])/g
      , simple = /^(\*|[a-z0-9]+)?(?:([\.\#]+[\w\-\.#]+)?)/
      , attr = /\[([\w\-]+)(?:([\|\^\$\*\~]?\=)['"]?([ \w\-\/\?\&\=\:\.\(\)\!,@#%<>\{\}\$\*\^]+)["']?)?\]/
      , pseudo = /:([\w\-]+)(\(['"]?([^()]+)['"]?\))?/
      , easy = new RegExp(idOnly.source + '|' + tagOnly.source + '|' + classOnly.source)
      , dividers = new RegExp('(' + splitters.source + ')' + splittersMore.source, 'g')
      , tokenizr = new RegExp(splitters.source + splittersMore.source)
      , chunker = new RegExp(simple.source + '(' + attr.source + ')?' + '(' + pseudo.source + ')?')
      , walker = {
          ' ': function (node) {
            return node && node !== html && node.parentNode
          }
        , '>': function (node, contestant) {
            return node && node.parentNode == contestant.parentNode && node.parentNode
          }
        , '~': function (node) {
            return node && node.previousSibling
          }
        , '+': function (node, contestant, p1, p2) {
            if (!node) return false
            return (p1 = previous(node)) && (p2 = previous(contestant)) && p1 == p2 && p1
          }
        }
  
    function cache() {
      this.c = {}
    }
    cache.prototype = {
      g: function (k) {
        return this.c[k] || undefined
      }
    , s: function (k, v, r) {
        v = r ? new RegExp(v) : v
        return (this.c[k] = v)
      }
    }
  
    var classCache = new cache()
      , cleanCache = new cache()
      , attrCache = new cache()
      , tokenCache = new cache()
  
    function classRegex(c) {
      return classCache.g(c) || classCache.s(c, '(^|\\s+)' + c + '(\\s+|$)', 1)
    }
  
    // not quite as fast as inline loops in older browsers so don't use liberally
    function each(a, fn) {
      var i = 0, l = a.length
      for (; i < l; i++) fn(a[i])
    }
  
    function flatten(ar) {
      for (var r = [], i = 0, l = ar.length; i < l; ++i) arrayLike(ar[i]) ? (r = r.concat(ar[i])) : (r[r.length] = ar[i])
      return r
    }
  
    function arrayify(ar) {
      var i = 0, l = ar.length, r = []
      for (; i < l; i++) r[i] = ar[i]
      return r
    }
  
    function previous(n) {
      while (n = n.previousSibling) if (n[nodeType] == 1) break;
      return n
    }
  
    function q(query) {
      return query.match(chunker)
    }
  
    // called using `this` as element and arguments from regex group results.
    // given => div.hello[title="world"]:foo('bar')
    // div.hello[title="world"]:foo('bar'), div, .hello, [title="world"], title, =, world, :foo('bar'), foo, ('bar'), bar]
    function interpret(whole, tag, idsAndClasses, wholeAttribute, attribute, qualifier, value, wholePseudo, pseudo, wholePseudoVal, pseudoVal) {
      var i, m, k, o, classes
      if (this[nodeType] !== 1) return false
      if (tag && tag !== '*' && this[tagName] && this[tagName].toLowerCase() !== tag) return false
      if (idsAndClasses && (m = idsAndClasses.match(id)) && m[1] !== this.id) return false
      if (idsAndClasses && (classes = idsAndClasses.match(clas))) {
        for (i = classes.length; i--;) if (!classRegex(classes[i].slice(1)).test(this.className)) return false
      }
      if (pseudo && qwery.pseudos[pseudo] && !qwery.pseudos[pseudo](this, pseudoVal)) return false
      if (wholeAttribute && !value) { // select is just for existance of attrib
        o = this.attributes
        for (k in o) {
          if (Object.prototype.hasOwnProperty.call(o, k) && (o[k].name || k) == attribute) {
            return this
          }
        }
      }
      if (wholeAttribute && !checkAttr(qualifier, getAttr(this, attribute) || '', value)) {
        // select is for attrib equality
        return false
      }
      return this
    }
  
    function clean(s) {
      return cleanCache.g(s) || cleanCache.s(s, s.replace(specialChars, '\\$1'))
    }
  
    function checkAttr(qualify, actual, val) {
      switch (qualify) {
      case '=':
        return actual == val
      case '^=':
        return actual.match(attrCache.g('^=' + val) || attrCache.s('^=' + val, '^' + clean(val), 1))
      case '$=':
        return actual.match(attrCache.g('$=' + val) || attrCache.s('$=' + val, clean(val) + '$', 1))
      case '*=':
        return actual.match(attrCache.g(val) || attrCache.s(val, clean(val), 1))
      case '~=':
        return actual.match(attrCache.g('~=' + val) || attrCache.s('~=' + val, '(?:^|\\s+)' + clean(val) + '(?:\\s+|$)', 1))
      case '|=':
        return actual.match(attrCache.g('|=' + val) || attrCache.s('|=' + val, '^' + clean(val) + '(-|$)', 1))
      }
      return 0
    }
  
    // given a selector, first check for simple cases then collect all base candidate matches and filter
    function _qwery(selector, _root) {
      var r = [], ret = [], i, l, m, token, tag, els, intr, item, root = _root
        , tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        , dividedTokens = selector.match(dividers)
  
      if (!tokens.length) return r
  
      token = (tokens = tokens.slice(0)).pop() // copy cached tokens, take the last one
      if (tokens.length && (m = tokens[tokens.length - 1].match(idOnly))) root = byId(_root, m[1])
      if (!root) return r
  
      intr = q(token)
      // collect base candidates to filter
      els = root !== _root && root[nodeType] !== 9 && dividedTokens && /^[+~]$/.test(dividedTokens[dividedTokens.length - 1]) ?
        function (r) {
          while (root = root.nextSibling) {
            root[nodeType] == 1 && (intr[1] ? intr[1] == root[tagName].toLowerCase() : 1) && (r[r.length] = root)
          }
          return r
        }([]) :
        root[byTag](intr[1] || '*')
      // filter elements according to the right-most part of the selector
      for (i = 0, l = els.length; i < l; i++) {
        if (item = interpret.apply(els[i], intr)) r[r.length] = item
      }
      if (!tokens.length) return r
  
      // filter further according to the rest of the selector (the left side)
      each(r, function(e) { if (ancestorMatch(e, tokens, dividedTokens)) ret[ret.length] = e })
      return ret
    }
  
    // compare element to a selector
    function is(el, selector, root) {
      if (isNode(selector)) return el == selector
      if (arrayLike(selector)) return !!~flatten(selector).indexOf(el) // if selector is an array, is el a member?
  
      var selectors = selector.split(','), tokens, dividedTokens
      while (selector = selectors.pop()) {
        tokens = tokenCache.g(selector) || tokenCache.s(selector, selector.split(tokenizr))
        dividedTokens = selector.match(dividers)
        tokens = tokens.slice(0) // copy array
        if (interpret.apply(el, q(tokens.pop())) && (!tokens.length || ancestorMatch(el, tokens, dividedTokens, root))) {
          return true
        }
      }
      return false
    }
  
    // given elements matching the right-most part of a selector, filter out any that don't match the rest
    function ancestorMatch(el, tokens, dividedTokens, root) {
      var cand
      // recursively work backwards through the tokens and up the dom, covering all options
      function crawl(e, i, p) {
        while (p = walker[dividedTokens[i]](p, e)) {
          if (isNode(p) && (interpret.apply(p, q(tokens[i])))) {
            if (i) {
              if (cand = crawl(p, i - 1, p)) return cand
            } else return p
          }
        }
      }
      return (cand = crawl(el, tokens.length - 1, el)) && (!root || isAncestor(cand, root))
    }
  
    function isNode(el, t) {
      return el && typeof el === 'object' && (t = el[nodeType]) && (t == 1 || t == 9)
    }
  
    function uniq(ar) {
      var a = [], i, j
      o: for (i = 0; i < ar.length; ++i) {
        for (j = 0; j < a.length; ++j) if (a[j] == ar[i]) continue o
        a[a.length] = ar[i]
      }
      return a
    }
  
    function arrayLike(o) {
      return (typeof o === 'object' && isFinite(o.length))
    }
  
    function normalizeRoot(root) {
      if (!root) return doc
      if (typeof root == 'string') return qwery(root)[0]
      if (!root[nodeType] && arrayLike(root)) return root[0]
      return root
    }
  
    function byId(root, id, el) {
      // if doc, query on it, else query the parent doc or if a detached fragment rewrite the query and run on the fragment
      return root[nodeType] === 9 ? root.getElementById(id) :
        root.ownerDocument &&
          (((el = root.ownerDocument.getElementById(id)) && isAncestor(el, root) && el) ||
            (!isAncestor(root, root.ownerDocument) && select('[id="' + id + '"]', root)[0]))
    }
  
    function qwery(selector, _root) {
      var m, el, root = normalizeRoot(_root)
  
      // easy, fast cases that we can dispatch with simple DOM calls
      if (!root || !selector) return []
      if (selector === window || isNode(selector)) {
        return !_root || (selector !== window && isNode(root) && isAncestor(selector, root)) ? [selector] : []
      }
      if (selector && arrayLike(selector)) return flatten(selector)
      if (m = selector.match(easy)) {
        if (m[1]) return (el = byId(root, m[1])) ? [el] : []
        if (m[2]) return arrayify(root[byTag](m[2]))
        if (hasByClass && m[3]) return arrayify(root[byClass](m[3]))
      }
  
      return select(selector, root)
    }
  
    // where the root is not document and a relationship selector is first we have to
    // do some awkward adjustments to get it to work, even with qSA
    function collectSelector(root, collector) {
      return function(s) {
        var oid, nid
        if (splittable.test(s)) {
          if (root[nodeType] !== 9) {
           // make sure the el has an id, rewrite the query, set root to doc and run it
           if (!(nid = oid = root.getAttribute('id'))) root.setAttribute('id', nid = '__qwerymeupscotty')
           s = '[id="' + nid + '"]' + s // avoid byId and allow us to match context element
           collector(root.parentNode || root, s, true)
           oid || root.removeAttribute('id')
          }
          return;
        }
        s.length && collector(root, s, false)
      }
    }
  
    var isAncestor = 'compareDocumentPosition' in html ?
      function (element, container) {
        return (container.compareDocumentPosition(element) & 16) == 16
      } : 'contains' in html ?
      function (element, container) {
        container = container[nodeType] === 9 || container == window ? html : container
        return container !== element && container.contains(element)
      } :
      function (element, container) {
        while (element = element.parentNode) if (element === container) return 1
        return 0
      }
    , getAttr = function() {
        // detect buggy IE src/href getAttribute() call
        var e = doc.createElement('p')
        return ((e.innerHTML = '<a href="#x">x</a>') && e.firstChild.getAttribute('href') != '#x') ?
          function(e, a) {
            return a === 'class' ? e.className : (a === 'href' || a === 'src') ?
              e.getAttribute(a, 2) : e.getAttribute(a)
          } :
          function(e, a) { return e.getAttribute(a) }
     }()
    , hasByClass = !!doc[byClass]
      // has native qSA support
    , hasQSA = doc.querySelector && doc[qSA]
      // use native qSA
    , selectQSA = function (selector, root) {
        var result = [], ss, e
        try {
          if (root[nodeType] === 9 || !splittable.test(selector)) {
            // most work is done right here, defer to qSA
            return arrayify(root[qSA](selector))
          }
          // special case where we need the services of `collectSelector()`
          each(ss = selector.split(','), collectSelector(root, function(ctx, s) {
            e = ctx[qSA](s)
            if (e.length == 1) result[result.length] = e.item(0)
            else if (e.length) result = result.concat(arrayify(e))
          }))
          return ss.length > 1 && result.length > 1 ? uniq(result) : result
        } catch(ex) { }
        return selectNonNative(selector, root)
      }
      // no native selector support
    , selectNonNative = function (selector, root) {
        var result = [], items, m, i, l, r, ss
        selector = selector.replace(normalizr, '$1')
        if (m = selector.match(tagAndOrClass)) {
          r = classRegex(m[2])
          items = root[byTag](m[1] || '*')
          for (i = 0, l = items.length; i < l; i++) {
            if (r.test(items[i].className)) result[result.length] = items[i]
          }
          return result
        }
        // more complex selector, get `_qwery()` to do the work for us
        each(ss = selector.split(','), collectSelector(root, function(ctx, s, rewrite) {
          r = _qwery(s, ctx)
          for (i = 0, l = r.length; i < l; i++) {
            if (ctx[nodeType] === 9 || rewrite || isAncestor(r[i], root)) result[result.length] = r[i]
          }
        }))
        return ss.length > 1 && result.length > 1 ? uniq(result) : result
      }
    , configure = function (options) {
        // configNativeQSA: use fully-internal selector or native qSA where present
        if (typeof options[useNativeQSA] !== 'undefined')
          select = !options[useNativeQSA] ? selectNonNative : hasQSA ? selectQSA : selectNonNative
      }
  
    configure({ useNativeQSA: true })
  
    qwery.configure = configure
    qwery.uniq = uniq
    qwery.is = is
    qwery.pseudos = {}
  
    return qwery
  }, this);
  

  provide("qwery", module.exports);

  (function ($) {
    var q = function () {
      var r
      try {
        r = require('qwery')
      } catch (ex) {
        r = require('qwery-mobile')
      } finally {
        return r
      }
    }()
  
    $.pseudos = q.pseudos
  
    $._select = function (s, r) {
      // detect if sibling module 'bonzo' is available at run-time
      // rather than load-time since technically it's not a dependency and
      // can be loaded in any order
      // hence the lazy function re-definition
      return ($._select = (function () {
        var b
        if (typeof $.create == 'function') return function (s, r) {
          return /^\s*</.test(s) ? $.create(s, r) : q(s, r)
        }
        try {
          b = require('bonzo')
          return function (s, r) {
            return /^\s*</.test(s) ? b.create(s, r) : q(s, r)
          }
        } catch (e) { }
        return q
      })())(s, r)
    }
  
    $.ender({
        find: function (s) {
          var r = [], i, l, j, k, els
          for (i = 0, l = this.length; i < l; i++) {
            els = q(s, this[i])
            for (j = 0, k = els.length; j < k; j++) r.push(els[j])
          }
          return $(q.uniq(r))
        }
      , and: function (s) {
          var plus = $(s)
          for (var i = this.length, j = 0, l = this.length + plus.length; i < l; i++, j++) {
            this[i] = plus[j]
          }
          this.length += plus.length
          return this
        }
      , is: function(s, r) {
          var i, l
          for (i = 0, l = this.length; i < l; i++) {
            if (q.is(this[i], s, r)) {
              return true
            }
          }
          return false
        }
    }, true)
  }(ender));
  

}());



(function () {

  var module = { exports: {} }, exports = module.exports;

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

  provide("ender-bootstrap-base", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* ===================================================
   * bootstrap-transition.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#transitions
   * ===================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ========================================================== */
  
  
  !function ($) {
  
    $.domReady(function () {
  
      "use strict"; // jshint ;_;
  
  
      /* CSS TRANSITION SUPPORT (http://www.modernizr.com/)
       * ======================================================= */
  
      $.support.transition = (function () {
  
        var transitionEnd = (function () {
  
          var el = document.createElement('bootstrap')
            , transEndEventNames = {
                 'WebkitTransition' : 'webkitTransitionEnd'
              ,  'MozTransition'    : 'transitionend'
              ,  'OTransition'      : 'oTransitionEnd'
              ,  'msTransition'     : 'MSTransitionEnd'
              ,  'transition'       : 'transitionend'
              }
            , name
  
          for (name in transEndEventNames){
            if (el.style[name] !== undefined) {
              return transEndEventNames[name]
            }
          }
  
        }())
  
        return transitionEnd && {
          end: transitionEnd
        }
  
      })()
  
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-transition", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* ==========================================================
   * bootstrap-alert.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#alerts
   * ==========================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ========================================================== */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* ALERT CLASS DEFINITION
    * ====================== */
  
    var dismiss = '[data-dismiss="alert"]'
      , Alert = function (el) {
          $(el).on('click', dismiss, this.close)
        }
  
    Alert.prototype.close = function (e) {
      var $this = $(this)
        , selector = $this.attr('data-target')
        , $parent
  
      if (!selector) {
        selector = $this.attr('href')
        selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
      }
  
      $parent = $(selector)
  
      e && e.preventDefault()
  
      $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent())
  
      $parent.trigger(e = $.Event('close'))
  
      if (false) return
  
      $parent.removeClass('in')
  
      function removeElement() {
        $parent
          .trigger('closed')
          .remove()
      }
  
      $.support.transition && $parent.hasClass('fade') ?
        $parent.on($.support.transition.end, removeElement) :
        removeElement()
    }
  
  
   /* ALERT PLUGIN DEFINITION
    * ======================= */
  
    $.fn.alert = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('alert')
        if (!data) $this.data('alert', (data = new Alert(this)))
        if (typeof option == 'string') data[option].call($this)
      })
    }
  
    $.fn.alert.Constructor = Alert
  
  
   /* ALERT DATA-API
    * ============== */
  
    $.domReady(function () {
      $('body').on('click.alert.data-api', dismiss, Alert.prototype.close)
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-alert", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* ============================================================
   * bootstrap-button.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#buttons
   * ============================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ============================================================ */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* BUTTON PUBLIC CLASS DEFINITION
    * ============================== */
  
    var Button = function (element, options) {
      this.$element = $(element)
      this.options = $.extend({}, $.fn.button.defaults, options)
    }
  
    Button.prototype.setState = function (state) {
      var d = 'disabled'
        , $el = this.$element
        , data = $el.data()
        , val = $el.is('input') ? 'val' : 'html'
  
      state = state + 'Text'
      data.resetText || $el.data('resetText', $el[val]())
  
      $el[val](data[state] || this.options[state])
  
      // push to event loop to allow forms to submit
      setTimeout(function () {
        state == 'loadingText' ?
          $el.addClass(d).attr(d, d) :
          $el.removeClass(d).removeAttr(d)
      }, 0)
    }
  
    Button.prototype.toggle = function () {
      var $parent = this.$element.parent('[data-toggle="buttons-radio"]')
  
      $parent && $(this.$element.parent()).data('toggle') == 'buttons-radio' && $parent.find('.active').removeClass('active')
  
      this.$element.toggleClass('active')
    }
  
  
   /* BUTTON PLUGIN DEFINITION
    * ======================== */
  
    $.fn.button = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('button')
          , options = typeof option == 'object' && option
        if (!data) $this.data('button', (data = new Button(this, options)))
        if (option == 'toggle') data.toggle()
        else if (option) data.setState(option)
      })
    }
  
    $.fn.button.defaults = {
      loadingText: 'loading...'
    }
  
    $.fn.button.Constructor = Button
  
  
   /* BUTTON DATA-API
    * =============== */
  
    $.domReady(function () {
      $('body').on('click.button.data-api', '[data-toggle^=button]', function ( e ) {
        var $btn = $(e.target)
        if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
        $btn.button('toggle')
      })
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-button", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* ==========================================================
   * bootstrap-carousel.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#carousel
   * ==========================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ========================================================== */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* CAROUSEL CLASS DEFINITION
    * ========================= */
  
    var Carousel = function (element, options) {
      this.$element = $(element)
      this.options = options
      this.options.slide && this.slide(this.options.slide)
      this.options.pause == 'hover' && this.$element
        .on('mouseenter', $.proxy(this.pause, this))
        .on('mouseleave', $.proxy(this.cycle, this))
    }
  
    Carousel.prototype = {
  
      cycle: function (e) {
        if (!e) this.paused = false
        this.options.interval
          && !this.paused
          && (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
        return this
      }
  
    , to: function (pos) {
        var $active = this.$element.find('.active')
          , children = $active.parent().children()
          , activePos = children.index($active)
          , that = this
  
        if (pos > (children.length - 1) || pos < 0) return
  
        if (this.sliding) {
          return this.$element.one('slid', function () {
            that.to(pos)
          })
        }
  
        if (activePos == pos) {
          return this.pause().cycle()
        }
  
        return this.slide(pos > activePos ? 'next' : 'prev', $(children[pos]))
      }
  
    , pause: function (e) {
        if (!e) this.paused = true
        clearInterval(this.interval)
        this.interval = null
        return this
      }
  
    , next: function () {
        if (this.sliding) return
        return this.slide('next')
      }
  
    , prev: function () {
        if (this.sliding) return
        return this.slide('prev')
      }
  
    , slide: function (type, next) {
        var $active = this.$element.find('.active')
          , $next = next || $active[type]()
          , isCycling = this.interval
          , direction = type == 'next' ? 'left' : 'right'
          , fallback  = type == 'next' ? 'first' : 'last'
          , that = this
          , e = $.Event('slide')
  
        this.sliding = true
  
        isCycling && this.pause()
  
        $next = $next.length ? $next : this.$element.find('.item')[fallback]()
  
        if ($next.hasClass('active')) return
  
        if ($.support.transition && this.$element.hasClass('slide')) {
          this.$element.trigger(e)
          if (false) return
          $next.addClass(type)
          $next[0].offsetWidth // force reflow
          $active.addClass(direction)
          $next.addClass(direction)
          this.$element.one($.support.transition.end, function () {
            $next.removeClass([type, direction].join(' ')).addClass('active')
            $active.removeClass(['active', direction].join(' '))
            that.sliding = false
            setTimeout(function () { that.$element.trigger('slid') }, 0)
          })
        } else {
          this.$element.trigger(e)
          if (false) return
          $active.removeClass('active')
          $next.addClass('active')
          this.sliding = false
          this.$element.trigger('slid')
        }
  
        isCycling && this.cycle()
  
        return this
      }
  
    }
  
  
   /* CAROUSEL PLUGIN DEFINITION
    * ========================== */
  
    $.fn.carousel = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('carousel')
          , options = $.extend({}, $.fn.carousel.defaults, typeof option == 'object' && option)
        if (!data) $this.data('carousel', (data = new Carousel(this, options)))
        if (typeof option == 'number') data.to(option)
        else if (typeof option == 'string' || (option = options.slide)) data[option]()
        else if (options.interval) data.cycle()
      })
    }
  
    $.fn.carousel.defaults = {
      interval: 5000
    , pause: 'hover'
    }
  
    $.fn.carousel.Constructor = Carousel
  
  
   /* CAROUSEL DATA-API
    * ================= */
  
    $.domReady(function () {
      $('body').on('click.carousel.data-api', '[data-slide]', function ( e ) {
        var $this = $(this), href
          , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
          , options = !$target.data('modal') && $.extend({}, $target.data(), $this.data())
        $target.carousel(options)
        e.preventDefault()
      })
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-carousel", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* =============================================================
   * bootstrap-collapse.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#collapse
   * =============================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ============================================================ */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* COLLAPSE PUBLIC CLASS DEFINITION
    * ================================ */
  
    var Collapse = function (element, options) {
      this.$element = $(element)
      this.options = $.extend({}, $.fn.collapse.defaults, options)
  
      if (this.options.parent) {
        this.$parent = $(this.options.parent)
      }
  
      this.options.toggle && this.toggle()
    }
  
    Collapse.prototype = {
  
      constructor: Collapse
  
    , dimension: function () {
        var hasWidth = this.$element.hasClass('width')
        return hasWidth ? 'width' : 'height'
      }
  
    , show: function () {
        var dimension
          , scroll
          , actives
          , hasData
  
        if (this.transitioning) return
  
        dimension = this.dimension()
        scroll = $.camelCase(['scroll', dimension].join('-'))
        actives = this.$parent && this.$parent.find('> .accordion-group > .in')
  
        if (actives && actives.length) {
          hasData = actives.data('collapse')
          if (hasData && hasData.transitioning) return
          actives.collapse('hide')
          hasData || actives.data('collapse', null)
        }
  
        this.$element[dimension](0)
        this.transition('addClass', $.Event('show'), 'shown')
        this.$element[dimension](this.$element[0][scroll])
      }
  
    , hide: function () {
        var dimension
        if (this.transitioning) return
        dimension = this.dimension()
        this.reset(this.$element[dimension]())
        this.transition('removeClass', $.Event('hide'), 'hidden')
        this.$element[dimension](0)
      }
  
    , reset: function (size) {
        var dimension = this.dimension()
  
        this.$element
          .removeClass('collapse')
          [dimension](size || 'auto')
          [0].offsetWidth
  
        this.$element[size !== null ? 'addClass' : 'removeClass']('collapse')
  
        return this
      }
  
    , transition: function (method, startEvent, completeEvent) {
        var that = this
          , complete = function () {
              if (startEvent.type == 'show') that.reset()
              that.transitioning = 0
              that.$element.trigger(completeEvent)
            }
  
        this.$element.trigger(startEvent)
  
        if (false) return
  
        this.transitioning = 1
  
        this.$element[method]('in')
  
        $.support.transition && this.$element.hasClass('collapse') ?
          this.$element.one($.support.transition.end, complete) :
          complete()
      }
  
    , toggle: function () {
        this[this.$element.hasClass('in') ? 'hide' : 'show']()
      }
  
    }
  
  
   /* COLLAPSIBLE PLUGIN DEFINITION
    * ============================== */
  
    $.fn.collapse = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('collapse')
          , options = typeof option == 'object' && option
        if (!data) $this.data('collapse', (data = new Collapse(this, options)))
        if (typeof option == 'string') data[option]()
      })
    }
  
    $.fn.collapse.defaults = {
      toggle: true
    }
  
    $.fn.collapse.Constructor = Collapse
  
  
   /* COLLAPSIBLE DATA-API
    * ==================== */
  
    $.domReady(function () {
      $('body').on('click.collapse.data-api', '[data-toggle=collapse]', function ( e ) {
        var $this = $(this), href
          , target = $this.attr('data-target')
            || e.preventDefault()
            || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '') //strip for ie7
          , option = $(target).data('collapse') ? 'toggle' : $this.data()
        $(target).collapse(option)
      })
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-collapse", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* ============================================================
   * bootstrap-dropdown.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#dropdowns
   * ============================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ============================================================ */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* DROPDOWN CLASS DEFINITION
    * ========================= */
  
    var toggle = '[data-toggle="dropdown"]'
      , Dropdown = function (element) {
          var $el = $(element).on('click.dropdown.data-api', this.toggle)
          $('html').on('click.dropdown.data-api', function () {
            $el.parent().removeClass('open')
          })
        }
  
    Dropdown.prototype = {
  
      constructor: Dropdown
  
    , toggle: function (e) {
        var $this = $(this)
          , $parent
          , selector
          , isActive
  
        if ($this.is('.disabled')) return
  
        selector = $this.attr('data-target')
  
        if (!selector) {
          selector = $this.attr('href')
          selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
        }
  
        $parent = $(selector)
        $parent.length || ($parent = $this.parent())
  
        isActive = $parent.hasClass('open')
  
        clearMenus()
  
        if (!isActive) $parent.toggleClass('open')
  
        e.stop()
      }
  
    }
  
    function clearMenus() {
      $(toggle).parent().removeClass('open')
    }
  
  
    /* DROPDOWN PLUGIN DEFINITION
     * ========================== */
  
    $.fn.dropdown = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('dropdown')
        if (!data) $this.data('dropdown', (data = new Dropdown(this)))
        if (typeof option == 'string') data[option].call($this)
      })
    }
  
    $.fn.dropdown.Constructor = Dropdown
  
  
    /* APPLY TO STANDARD DROPDOWN ELEMENTS
     * =================================== */
  
    $.domReady(function () {
      $('html').on('click.dropdown.data-api', clearMenus)
      $('body')
        .on('click.dropdown', '.dropdown form', function (e) { e.stopPropagation() })
        .on('click.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-dropdown", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* =========================================================
   * bootstrap-modal.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#modals
   * =========================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ========================================================= */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* MODAL CLASS DEFINITION
    * ====================== */
  
    var Modal = function (content, options) {
      this.options = options
      this.$element = $(content)
        .delegate('[data-dismiss="modal"]', 'click.dismiss.modal', $.proxy(this.hide, this))
    }
  
    Modal.prototype = {
  
        constructor: Modal
  
      , toggle: function () {
          return this[!this.isShown ? 'show' : 'hide']()
        }
  
      , show: function () {
          var that = this
            , e = $.Event('show')
  
          this.$element.trigger(e)
  
          if (this.isShown || false) return
  
          $('body').addClass('modal-open')
  
          this.isShown = true
  
          escape.call(this)
          backdrop.call(this, function () {
            var transition = $.support.transition && that.$element.hasClass('fade')
  
            if (!that.$element.parent().length) {
              that.$element.appendTo(document.body) //don't move modals dom position
            }
  
            that.$element.show('block')
  
            if (transition) {
              that.$element[0].offsetWidth // force reflow
            }
  
            that.$element.addClass('in')
  
            transition ?
              that.$element.one($.support.transition.end, function () { that.$element.trigger('shown') }) :
              that.$element.trigger('shown')
  
          })
        }
  
      , hide: function (e) {
          e && e.preventDefault()
  
          var that = this
  
          e = $.Event('hide')
  
          this.$element.trigger(e)
  
          if (!this.isShown || false) return
  
          this.isShown = false
  
          $('body').removeClass('modal-open')
  
          escape.call(this)
  
          this.$element.removeClass('in')
  
          $.support.transition && this.$element.hasClass('fade') ?
            hideWithTransition.call(this) :
            hideModal.call(this)
        }
  
    }
  
  
   /* MODAL PRIVATE METHODS
    * ===================== */
  
    function hideWithTransition() {
      var that = this
        , timeout = setTimeout(function () {
            that.$element.off($.support.transition.end)
            hideModal.call(that)
          }, 500)
  
      this.$element.one($.support.transition.end, function () {
        clearTimeout(timeout)
        hideModal.call(that)
      })
    }
  
    function hideModal(that) {
      this.$element
        .hide()
        .trigger('hidden')
  
      backdrop.call(this)
    }
  
    function backdrop(callback) {
      var that = this
        , animate = this.$element.hasClass('fade') ? 'fade' : ''
  
      if (this.isShown && this.options.backdrop) {
        var doAnimate = $.support.transition && animate
  
        this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
          .appendTo(document.body)
  
        if (this.options.backdrop != 'static') {
          this.$backdrop.click($.proxy(this.hide, this))
        }
  
        if (doAnimate) this.$backdrop[0].offsetWidth // force reflow
  
        this.$backdrop.addClass('in')
  
        doAnimate ?
          this.$backdrop.one($.support.transition.end, callback) :
          callback()
  
      } else if (!this.isShown && this.$backdrop) {
        this.$backdrop.removeClass('in')
  
        $.support.transition && this.$element.hasClass('fade')?
          this.$backdrop.one($.support.transition.end, $.proxy(removeBackdrop, this)) :
          removeBackdrop.call(this)
  
      } else if (callback) {
        callback()
      }
    }
  
    function removeBackdrop() {
      this.$backdrop.remove()
      this.$backdrop = null
    }
  
    function escape() {
      var that = this
      if (this.isShown && this.options.keyboard) {
        $(document).on('keyup.dismiss.modal', function ( e ) {
          e.which == 27 && that.hide()
        })
      } else if (!this.isShown) {
        $(document).off('keyup.dismiss.modal')
      }
    }
  
  
   /* MODAL PLUGIN DEFINITION
    * ======================= */
  
    $.fn.modal = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('modal')
          , options = $.extend({}, $.fn.modal.defaults, $this.data(), typeof option == 'object' && option)
        if (!data) $this.data('modal', (data = new Modal(this, options)))
        if (typeof option == 'string') data[option]()
        else if (options.show) data.show()
      })
    }
  
    $.fn.modal.defaults = {
        backdrop: true
      , keyboard: true
      , show: true
    }
  
    $.fn.modal.Constructor = Modal
  
  
   /* MODAL DATA-API
    * ============== */
  
    $.domReady(function () {
      $('body').on('click.modal.data-api', '[data-toggle="modal"]', function ( e ) {
        var $this = $(this), href
          , $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
          , option = $target.data('modal') ? 'toggle' : $.extend({}, $target.data(), $this.data())
  
        e.preventDefault()
        $target.modal(option)
      })
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-modal", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* ===========================================================
   * bootstrap-tooltip.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#tooltips
   * Inspired by the original jQuery.tipsy by Jason Frame
   * ===========================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ========================================================== */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* TOOLTIP PUBLIC CLASS DEFINITION
    * =============================== */
  
    var Tooltip = function (element, options) {
      this.init('tooltip', element, options)
    }
  
    Tooltip.prototype = {
  
      constructor: Tooltip
  
    , init: function (type, element, options) {
        var eventIn
          , eventOut
  
        this.type = type
        this.$element = $(element)
        this.options = this.getOptions(options)
        this.enabled = true
  
        if (this.options.trigger != 'manual') {
          eventIn  = this.options.trigger == 'hover' ? 'mouseenter' : 'focus'
          eventOut = this.options.trigger == 'hover' ? 'mouseleave' : 'blur'
          this.$element.on(eventIn, this.options.selector, $.proxy(this.enter, this))
          this.$element.on(eventOut, this.options.selector, $.proxy(this.leave, this))
        }
  
        this.options.selector ?
          (this._options = $.extend({}, this.options, { trigger: 'manual', selector: '' })) :
          this.fixTitle()
      }
  
    , getOptions: function (options) {
        options = $.extend({}, $.fn[this.type].defaults, options, this.$element.data())
  
        if (options.delay && typeof options.delay == 'number') {
          options.delay = {
            show: options.delay
          , hide: options.delay
          }
        }
  
        return options
      }
  
    , enter: function (e) {
        var self = $(e.currentTarget)[this.type](this._options).data(this.type)
  
        if (!self.options.delay || !self.options.delay.show) return self.show()
  
        clearTimeout(this.timeout)
        self.hoverState = 'in'
        this.timeout = setTimeout(function() {
          if (self.hoverState == 'in') self.show()
        }, self.options.delay.show)
      }
  
    , leave: function (e) {
        var self = $(e.currentTarget)[this.type](this._options).data(this.type)
  
        if (!self.options.delay || !self.options.delay.hide) return self.hide()
  
        clearTimeout(this.timeout)
        self.hoverState = 'out'
        this.timeout = setTimeout(function() {
          if (self.hoverState == 'out') self.hide()
        }, self.options.delay.hide)
      }
  
    , show: function () {
        var $tip
          , inside
          , pos
          , actualWidth
          , actualHeight
          , placement
          , tp
  
        if (this.hasContent() && this.enabled) {
          $tip = this.tip()
          this.setContent()
  
          if (this.options.animation) {
            $tip.addClass('fade')
          }
  
          placement = typeof this.options.placement == 'function' ?
            this.options.placement.call(this, $tip[0], this.$element[0]) :
            this.options.placement
  
          inside = /in/.test(placement)
  
          $tip
            .remove()
            .css({ top: 0, left: 0, display: 'block' })
            .appendTo(inside ? this.$element : document.body)
  
          pos = this.getPosition(inside)
  
          actualWidth = $tip[0].offsetWidth
          actualHeight = $tip[0].offsetHeight
  
          switch (inside ? placement.split(' ')[1] : placement) {
            case 'bottom':
              tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2}
              break
            case 'top':
              tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2}
              break
            case 'left':
              tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth}
              break
            case 'right':
              tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width}
              break
          }
  
          $tip
            .css(tp)
            .addClass(placement)
            .addClass('in')
        }
      }
  
    , isHTML: function(text) {
        // html string detection logic adapted from jQuery
        return typeof text != 'string'
          || ( text.charAt(0) === "<"
            && text.charAt( text.length - 1 ) === ">"
            && text.length >= 3
          ) || /^(?:[^<]*<[\w\W]+>[^>]*$)/.exec(text)
      }
  
    , setContent: function () {
        var $tip = this.tip()
          , title = this.getTitle()
  
        $tip.find('.tooltip-inner')[this.isHTML(title) ? 'html' : 'text'](title)
        $tip.removeClass('fade in top bottom left right')
      }
  
    , hide: function () {
        var that = this
          , $tip = this.tip()
  
        $tip.removeClass('in')
  
        function removeWithAnimation() {
          var timeout = setTimeout(function () {
            $tip.off($.support.transition.end).remove()
          }, 500)
  
          $tip.one($.support.transition.end, function () {
            clearTimeout(timeout)
            $tip.remove()
          })
        }
  
        $.support.transition && this.$tip.hasClass('fade') ?
          removeWithAnimation() :
          $tip.remove()
      }
  
    , fixTitle: function () {
        var $e = this.$element
        if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
          $e.attr('data-original-title', $e.attr('title') || '').removeAttr('title')
        }
      }
  
    , hasContent: function () {
        return this.getTitle()
      }
  
    , getPosition: function (inside) {
        return $.extend({}, (inside ? {top: 0, left: 0} : this.$element.offset()), {
          width: this.$element[0].offsetWidth
        , height: this.$element[0].offsetHeight
        })
      }
  
    , getTitle: function () {
        var title
          , $e = this.$element
          , o = this.options
  
        title = $e.attr('data-original-title')
          || (typeof o.title == 'function' ? o.title.call($e[0]) :  o.title)
  
        return title
      }
  
    , tip: function () {
        return this.$tip = this.$tip || $(this.options.template)
      }
  
    , validate: function () {
        if (!this.$element[0].parentNode) {
          this.hide()
          this.$element = null
          this.options = null
        }
      }
  
    , enable: function () {
        this.enabled = true
      }
  
    , disable: function () {
        this.enabled = false
      }
  
    , toggleEnabled: function () {
        this.enabled = !this.enabled
      }
  
    , toggle: function () {
        this[this.tip().hasClass('in') ? 'hide' : 'show']()
      }
  
    }
  
  
   /* TOOLTIP PLUGIN DEFINITION
    * ========================= */
  
    $.fn.tooltip = function ( option ) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('tooltip')
          , options = typeof option == 'object' && option
        if (!data) $this.data('tooltip', (data = new Tooltip(this, options)))
        if (typeof option == 'string') data[option]()
      })
    }
  
    $.fn.tooltip.Constructor = Tooltip
  
    $.fn.tooltip.defaults = {
      animation: true
    , placement: 'top'
    , selector: false
    , template: '<div class="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>'
    , trigger: 'hover'
    , title: ''
    , delay: 0
    }
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-tooltip", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* ===========================================================
   * bootstrap-popover.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#popovers
   * ===========================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * =========================================================== */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* POPOVER PUBLIC CLASS DEFINITION
    * =============================== */
  
    var Popover = function ( element, options ) {
      this.init('popover', element, options)
    }
  
  
    /* NOTE: POPOVER EXTENDS BOOTSTRAP-TOOLTIP.js
       ========================================== */
  
    Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype, {
  
      constructor: Popover
  
    , setContent: function () {
        var $tip = this.tip()
          , title = this.getTitle()
          , content = this.getContent()
  
        $tip.find('.popover-title')[this.isHTML(title) ? 'html' : 'text'](title)
        $tip.find('.popover-content > *')[this.isHTML(content) ? 'html' : 'text'](content)
  
        $tip.removeClass('fade top bottom left right in')
      }
  
    , hasContent: function () {
        return this.getTitle() || this.getContent()
      }
  
    , getContent: function () {
        var content
          , $e = this.$element
          , o = this.options
  
        content = $e.attr('data-content')
          || (typeof o.content == 'function' ? o.content.call($e[0]) :  o.content)
  
        return content
      }
  
    , tip: function () {
        if (!this.$tip) {
          this.$tip = $(this.options.template)
        }
        return this.$tip
      }
  
    })
  
  
   /* POPOVER PLUGIN DEFINITION
    * ======================= */
  
    $.fn.popover = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('popover')
          , options = typeof option == 'object' && option
        if (!data) $this.data('popover', (data = new Popover(this, options)))
        if (typeof option == 'string') data[option]()
      })
    }
  
    $.fn.popover.Constructor = Popover
  
    $.fn.popover.defaults = $.extend({} , $.fn.tooltip.defaults, {
      placement: 'right'
    , content: ''
    , template: '<div class="popover"><div class="arrow"></div><div class="popover-inner"><h3 class="popover-title"></h3><div class="popover-content"><p></p></div></div></div>'
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-popover", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* =============================================================
   * bootstrap-scrollspy.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#scrollspy
   * =============================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ============================================================== */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
    /* SCROLLSPY CLASS DEFINITION
     * ========================== */
  
    function ScrollSpy( element, options) {
      var process = $.proxy(this.process, this)
        , $element = $(element).is('body') ? $(window) : $(element)
        , href
      this.options = $.extend({}, $.fn.scrollspy.defaults, options)
      this.$scrollElement = $element.on('scroll.scroll.data-api', process)
      this.selector = (this.options.target
        || ((href = $(element).attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')) //strip for ie7
        || '') + ' .nav li > a'
      this.$body = $('body')
      this.refresh()
      this.process()
    }
  
    ScrollSpy.prototype = {
  
        constructor: ScrollSpy
  
      , refresh: function () {
          var self = this
            , $targets
  
          this.offsets = []
          this.targets = []
  
          $targets = this.$body
            .find(this.selector)
            .map(function () {
              var $el = $(this)
                , href = $el.data('target') || $el.attr('href')
                , $href = /^#\w/.test(href) && $(href)
              return ( $href
                && href.length
                && [ $href.position().top, href ] ) || null
            })
            .sort(function (a, b) { return a[0] - b[0] })
            .each(function () {
              self.offsets.push(this[0])
              self.targets.push(this[1])
            })
        }
  
      , process: function () {
          var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
            , scrollHeight = this.$scrollElement[0].scrollHeight || this.$body[0].scrollHeight
            , maxScroll = scrollHeight - this.$scrollElement.height()
            , offsets = this.offsets
            , targets = this.targets
            , activeTarget = this.activeTarget
            , i
  
          if (scrollTop >= maxScroll) {
            return activeTarget != (i = targets[targets.length-1])
              && this.activate ( i )
          }
  
          for (i = offsets.length; i--;) {
            activeTarget != targets[i]
              && scrollTop >= offsets[i]
              && (!offsets[i + 1] || scrollTop <= offsets[i + 1])
              && this.activate( targets[i] )
          }
        }
  
      , activate: function (target) {
          var active
            , selector
  
          this.activeTarget = target
  
          $(this.selector)
            .parent('.active')
            .removeClass('active')
  
          selector = this.selector
            + '[data-target="' + target + '"],'
            + this.selector + '[href="' + target + '"]'
  
          active = $(selector)
            .parent('li')
            .addClass('active')
  
          if (active.parent('.dropdown-menu'))  {
            active = active.closest('li.dropdown').addClass('active')
          }
  
          active.trigger('activate')
        }
  
    }
  
  
   /* SCROLLSPY PLUGIN DEFINITION
    * =========================== */
  
    $.fn.scrollspy = function ( option ) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('scrollspy')
          , options = typeof option == 'object' && option
        if (!data) $this.data('scrollspy', (data = new ScrollSpy(this, options)))
        if (typeof option == 'string') data[option]()
      })
    }
  
    $.fn.scrollspy.Constructor = ScrollSpy
  
    $.fn.scrollspy.defaults = {
      offset: 10
    }
  
  
   /* SCROLLSPY DATA-API
    * ================== */
  
    $.domReady(function () {
      $('[data-spy="scroll"]').each(function () {
        var $spy = $(this)
        $spy.scrollspy($spy.data())
      })
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-scrollspy", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* ========================================================
   * bootstrap-tab.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#tabs
   * ========================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ======================================================== */
  
  
  !function ($) {
  
    "use strict"; // jshint ;_;
  
  
   /* TAB CLASS DEFINITION
    * ==================== */
  
    var Tab = function ( element ) {
      this.element = $(element)
    }
  
    Tab.prototype = {
  
      constructor: Tab
  
    , show: function () {
        var $this = this.element
          , $ul = $this.closest('ul:not(.dropdown-menu)')
          , selector = $this.attr('data-target')
          , previous
          , $target
          , e
  
        if (!selector) {
          selector = $this.attr('href')
          selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') //strip for ie7
        }
  
        if ( $this.parent('li').hasClass('active') ) return
  
        previous = $ul.find('.active a').last()[0]
  
        e = $.Event('show', {
          relatedTarget: previous
        })
  
        $this.trigger(e)
  
        if (false) return
  
        $target = $(selector)
  
        this.activate($this.parent('li'), $ul)
        this.activate($target, $target.parent(), function () {
          $this.trigger({
            type: 'shown'
          , relatedTarget: previous
          })
        })
      }
  
    , activate: function ( element, container, callback) {
        var $active = container.find('> .active')
          , transition = callback
              && $.support.transition
              && $active.hasClass('fade')
  
        function next() {
          $active
            .removeClass('active')
            .find('> .dropdown-menu > .active')
            .removeClass('active')
  
          element.addClass('active')
  
          if (transition) {
            element[0].offsetWidth // reflow for transition
            element.addClass('in')
          } else {
            element.removeClass('fade')
          }
  
          if ( element.parent('.dropdown-menu') ) {
            element.closest('li.dropdown').addClass('active')
          }
  
          callback && callback()
        }
  
        transition ?
          $active.one($.support.transition.end, next) :
          next()
  
        $active.removeClass('in')
      }
    }
  
  
   /* TAB PLUGIN DEFINITION
    * ===================== */
  
    $.fn.tab = function ( option ) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('tab')
        if (!data) $this.data('tab', (data = new Tab(this)))
        if (typeof option == 'string') data[option]()
      })
    }
  
    $.fn.tab.Constructor = Tab
  
  
   /* TAB DATA-API
    * ============ */
  
    $.domReady(function () {
      $('body').on('click.tab.data-api', '[data-toggle="tab"], [data-toggle="pill"]', function (e) {
        e.preventDefault()
        $(this).tab('show')
      })
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-tab", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /* =============================================================
   * bootstrap-typeahead.js v2.0.3
   * http://twitter.github.com/bootstrap/javascript.html#typeahead
   * =============================================================
   * Copyright 2012 Twitter, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   * ============================================================ */
  
  
  !function($){
  
    "use strict"; // jshint ;_;
  
  
   /* TYPEAHEAD PUBLIC CLASS DEFINITION
    * ================================= */
  
    var Typeahead = function (element, options) {
      this.$element = $(element)
      this.options = $.extend({}, $.fn.typeahead.defaults, options)
      this.matcher = this.options.matcher || this.matcher
      this.sorter = this.options.sorter || this.sorter
      this.highlighter = this.options.highlighter || this.highlighter
      this.updater = this.options.updater || this.updater
      this.$menu = $(this.options.menu).appendTo('body')
      this.source = this.options.source
      this.shown = false
      this.listen()
    }
  
    Typeahead.prototype = {
  
      constructor: Typeahead
  
    , select: function () {
        var val = this.$menu.find('.active').attr('data-value')
        this.$element
          .val(this.updater(val))
          .change()
        return this.hide()
      }
  
    , updater: function (item) {
        return item
      }
  
    , show: function () {
        var pos = $.extend({}, this.$element.offset(), {
          height: this.$element[0].offsetHeight
        })
  
        this.$menu.css({
          top: pos.top + pos.height
        , left: pos.left
        })
  
        this.$menu.show('block')
        this.shown = true
        return this
      }
  
    , hide: function () {
        this.$menu.hide()
        this.shown = false
        return this
      }
  
    , lookup: function (event) {
        var that = this
          , items
          , q
  
        this.query = this.$element.val()
  
        if (!this.query) {
          return this.shown ? this.hide() : this
        }
  
        items = $.grep(this.source, function (item) {
          return that.matcher(item)
        })
  
        items = this.sorter(items)
  
        if (!items.length) {
          return this.shown ? this.hide() : this
        }
  
        return this.render(items.slice(0, this.options.items)).show()
      }
  
    , matcher: function (item) {
        return ~item.toLowerCase().indexOf(this.query.toLowerCase())
      }
  
    , sorter: function (items) {
        var beginswith = []
          , caseSensitive = []
          , caseInsensitive = []
          , item
  
        while (item = items.shift()) {
          if (!item.toLowerCase().indexOf(this.query.toLowerCase())) beginswith.push(item)
          else if (~item.indexOf(this.query)) caseSensitive.push(item)
          else caseInsensitive.push(item)
        }
  
        return beginswith.concat(caseSensitive, caseInsensitive)
      }
  
    , highlighter: function (item) {
        var query = this.query.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&')
        return item.replace(new RegExp('(' + query + ')', 'ig'), function ($1, match) {
          return '<strong>' + match + '</strong>'
        })
      }
  
    , render: function (items) {
        var that = this
  
        items = $(items).map(function (item, i) {
          i = $(that.options.item).attr('data-value', item)
          i.find('a').html(that.highlighter(item))
          return i[0]
        })
  
        $(items).first().addClass('active')
        this.$menu.empty().append(items)
        return this
      }
  
    , next: function (event) {
        var active = this.$menu.find('.active').removeClass('active')
          , next = active.next()
  
        if (!next.length) {
          next = $(this.$menu.find('li')[0])
        }
  
        next.addClass('active')
      }
  
    , prev: function (event) {
        var active = this.$menu.find('.active').removeClass('active')
          , prev = active.prev()
  
        if (!prev.length) {
          prev = this.$menu.find('li').last()
        }
  
        prev.addClass('active')
      }
  
    , listen: function () {
        this.$element
          .on('blur',     $.proxy(this.blur, this))
          .on('keypress', $.proxy(this.keypress, this))
          .on('keyup',    $.proxy(this.keyup, this))
  
        if ($.browser.webkit || $.browser.msie) {
          this.$element.on('keydown', $.proxy(this.keypress, this))
        }
  
        this.$menu
          .on('click', $.proxy(this.click, this))
          .on('mouseenter', 'li', $.proxy(this.mouseenter, this))
      }
  
    , keyup: function (e) {
        switch(e.keyCode) {
          case 40: // down arrow
          case 38: // up arrow
            break
  
          case 9: // tab
          case 13: // enter
            if (!this.shown) return
            this.select()
            break
  
          case 27: // escape
            if (!this.shown) return
            this.hide()
            break
  
          default:
            this.lookup()
        }
  
        e.stopPropagation()
        e.preventDefault()
    }
  
    , keypress: function (e) {
        if (!this.shown) return
  
        switch(e.keyCode) {
          case 9: // tab
          case 13: // enter
          case 27: // escape
            e.preventDefault()
            break
  
          case 38: // up arrow
            if (e.type != 'keydown') break
            e.preventDefault()
            this.prev()
            break
  
          case 40: // down arrow
            if (e.type != 'keydown') break
            e.preventDefault()
            this.next()
            break
        }
  
        e.stopPropagation()
      }
  
    , blur: function (e) {
        var that = this
        setTimeout(function () { that.hide() }, 150)
      }
  
    , click: function (e) {
        e.stopPropagation()
        e.preventDefault()
        this.select()
      }
  
    , mouseenter: function (e) {
        this.$menu.find('.active').removeClass('active')
        $(e.currentTarget).addClass('active')
      }
  
    }
  
  
    /* TYPEAHEAD PLUGIN DEFINITION
     * =========================== */
  
    $.fn.typeahead = function (option) {
      return this.each(function () {
        var $this = $(this)
          , data = $this.data('typeahead')
          , options = typeof option == 'object' && option
        if (!data) $this.data('typeahead', (data = new Typeahead(this, options)))
        if (typeof option == 'string') data[option]()
      })
    }
  
    $.fn.typeahead.defaults = {
      source: []
    , items: 8
    , menu: '<ul class="typeahead dropdown-menu"></ul>'
    , item: '<li><a href="#"></a></li>'
    }
  
    $.fn.typeahead.Constructor = Typeahead
  
  
   /* TYPEAHEAD DATA-API
    * ================== */
  
    $.domReady(function () {
      $('[data-provide="typeahead"]').on('focus.typeahead.data-api', function (e) {
        var $this = $(this)
        if ($this.data('typeahead')) return
        e.preventDefault()
        $this.typeahead($this.data())
      })
    })
  }(require('ender-bootstrap-base-faker'))

  provide("ender-bootstrap-typeahead", module.exports);

  $.ender(module.exports);

}());

(function () {

  var module = { exports: {} }, exports = module.exports;

  /*!
    * Bowser - a browser detector
    * https://github.com/ded/bowser
    * MIT License | (c) Dustin Diaz 2011
    */
  !function (name, definition) {
    if (typeof define == 'function') define(definition)
    else if (typeof module != 'undefined' && module.exports) module.exports['browser'] = definition()
    else this[name] = definition()
  }('bowser', function () {
    /**
      * navigator.userAgent =>
      * Chrome:  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.24 (KHTML, like Gecko) Chrome/11.0.696.57 Safari/534.24"
      * Opera:   "Opera/9.80 (Macintosh; Intel Mac OS X 10.6.7; U; en) Presto/2.7.62 Version/11.01"
      * Safari:  "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_7; en-us) AppleWebKit/533.21.1 (KHTML, like Gecko) Version/5.0.5 Safari/533.21.1"
      * IE:      "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1; Trident/5.0; SLCC2; .NET CLR 2.0.50727; .NET CLR 3.5.30729; .NET CLR 3.0.30729; Media Center PC 6.0; .NET4.0C)"
      * Firefox: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.6; rv:2.0) Gecko/20100101 Firefox/4.0"
      * iPhone:  "Mozilla/5.0 (iPhone Simulator; U; CPU iPhone OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5"
      * iPad:    "Mozilla/5.0 (iPad; U; CPU OS 4_3_2 like Mac OS X; en-us) AppleWebKit/533.17.9 (KHTML, like Gecko) Version/5.0.2 Mobile/8H7 Safari/6533.18.5",
      * Android: "Mozilla/5.0 (Linux; U; Android 2.3.4; en-us; T-Mobile G2 Build/GRJ22) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1"
      * Touchpad: "Mozilla/5.0 (hp-tabled;Linux;hpwOS/3.0.5; U; en-US)) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/234.83 Safari/534.6 TouchPad/1.0"
      */
  
    var ua = navigator.userAgent
      , t = true
      , ie = /msie/i.test(ua)
      , chrome = /chrome/i.test(ua)
      , safari = /safari/i.test(ua) && !chrome
      , iphone = /iphone/i.test(ua)
      , ipad = /ipad/i.test(ua)
      , touchpad = /touchpad/i.test(ua)
      , android = /android/i.test(ua)
      , opera = /opera/i.test(ua)
      , firefox = /firefox/i.test(ua)
      , gecko = /gecko\//i.test(ua)
      , seamonkey = /seamonkey\//i.test(ua)
      , webkitVersion = /version\/(\d+(\.\d+)?)/i
      , o
  
    function detect() {
  
      if (ie) return {
          msie: t
        , version: ua.match(/msie (\d+(\.\d+)?);/i)[1]
      }
      if (chrome) return {
          webkit: t
        , chrome: t
        , version: ua.match(/chrome\/(\d+(\.\d+)?)/i)[1]
      }
      if (touchpad) return {
          webkit: t
        , touchpad: t
        , version : ua.match(/touchpad\/(\d+(\.\d+)?)/i)[1]
      }
      if (iphone || ipad) {
        o = {
            webkit: t
          , mobile: t
          , ios: t
          , iphone: iphone
          , ipad: ipad
        }
        // WTF: version is not part of user agent in web apps
        if (webkitVersion.test(ua)) {
          o.version = ua.match(webkitVersion)[1]
        }
        return o
      }
      if (android) return {
          webkit: t
        , android: t
        , mobile: t
        , version: ua.match(webkitVersion)[1]
      }
      if (safari) return {
          webkit: t
        , safari: t
        , version: ua.match(webkitVersion)[1]
      }
      if (opera) return {
          opera: t
        , version: ua.match(webkitVersion)[1]
      }
      if (gecko) {
        o = {
            gecko: t
          , mozilla: t
          , version: ua.match(/firefox\/(\d+(\.\d+)?)/i)[1]
        }
        if (firefox) o.firefox = t
        return o
      }
      if (seamonkey) return {
          seamonkey: t
        , version: ua.match(/seamonkey\/(\d+(\.\d+)?)/i)[1]
      }
    }
  
    var bowser = detect()
  
    // Graded Browser Support
    // http://developer.yahoo.com/yui/articles/gbs
    if ((bowser.msie && bowser.version >= 7) ||
        (bowser.chrome && bowser.version >= 10) ||
        (bowser.firefox && bowser.version >= 4.0) ||
        (bowser.safari && bowser.version >= 5) ||
        (bowser.opera && bowser.version >= 10.0)) {
      bowser.a = t;
    }
  
    else if ((bowser.msie && bowser.version < 7) ||
        (bowser.chrome && bowser.version < 10) ||
        (bowser.firefox && bowser.version < 4.0) ||
        (bowser.safari && bowser.version < 5) ||
        (bowser.opera && bowser.version < 10.0)) {
      bowser.c = t
    } else bowser.x = t
  
    return bowser
  })
  

  provide("bowser", module.exports);

  $.ender(module.exports);

}());

