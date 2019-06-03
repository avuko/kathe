// Version 1.14.3 force-graph - https://github.com/vasturiano/force-graph
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.ForceGraph = factory());
}(this, function () { 'use strict';

  function styleInject(css, ref) {
    if ( ref === void 0 ) ref = {};
    var insertAt = ref.insertAt;

    if (!css || typeof document === 'undefined') { return; }

    var head = document.head || document.getElementsByTagName('head')[0];
    var style = document.createElement('style');
    style.type = 'text/css';

    if (insertAt === 'top') {
      if (head.firstChild) {
        head.insertBefore(style, head.firstChild);
      } else {
        head.appendChild(style);
      }
    } else {
      head.appendChild(style);
    }

    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }
  }

  var css = ".graph-tooltip {\n  position: absolute;\n  transform: translate(-50%, 25px);\n  font-family: Sans-serif;\n  font-size: 16px;\n  padding: 4px;\n  border-radius: 3px;\n  color: #eee;\n  background: rgba(0,0,0,0.65);\n  visibility: hidden; /* by default */\n}\n\n.grabbable {\n  cursor: move;\n  cursor: grab;\n  cursor: -moz-grab;\n  cursor: -webkit-grab;\n}\n\n.grabbable:active {\n  cursor: grabbing;\n  cursor: -moz-grabbing;\n  cursor: -webkit-grabbing;\n}\n";
  styleInject(css);

  function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _construct(Parent, args, Class) {
    if (isNativeReflectConstruct()) {
      _construct = Reflect.construct;
    } else {
      _construct = function _construct(Parent, args, Class) {
        var a = [null];
        a.push.apply(a, args);
        var Constructor = Function.bind.apply(Parent, a);
        var instance = new Constructor();
        if (Class) _setPrototypeOf(instance, Class.prototype);
        return instance;
      };
    }

    return _construct.apply(null, arguments);
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var xhtml = "http://www.w3.org/1999/xhtml";

  var namespaces = {
    svg: "http://www.w3.org/2000/svg",
    xhtml: xhtml,
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace",
    xmlns: "http://www.w3.org/2000/xmlns/"
  };

  function namespace(name) {
    var prefix = name += "", i = prefix.indexOf(":");
    if (i >= 0 && (prefix = name.slice(0, i)) !== "xmlns") name = name.slice(i + 1);
    return namespaces.hasOwnProperty(prefix) ? {space: namespaces[prefix], local: name} : name;
  }

  function creatorInherit(name) {
    return function() {
      var document = this.ownerDocument,
          uri = this.namespaceURI;
      return uri === xhtml && document.documentElement.namespaceURI === xhtml
          ? document.createElement(name)
          : document.createElementNS(uri, name);
    };
  }

  function creatorFixed(fullname) {
    return function() {
      return this.ownerDocument.createElementNS(fullname.space, fullname.local);
    };
  }

  function creator(name) {
    var fullname = namespace(name);
    return (fullname.local
        ? creatorFixed
        : creatorInherit)(fullname);
  }

  function none() {}

  function selector(selector) {
    return selector == null ? none : function() {
      return this.querySelector(selector);
    };
  }

  function selection_select(select) {
    if (typeof select !== "function") select = selector(select);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function empty() {
    return [];
  }

  function selectorAll(selector) {
    return selector == null ? empty : function() {
      return this.querySelectorAll(selector);
    };
  }

  function selection_selectAll(select) {
    if (typeof select !== "function") select = selectorAll(select);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          subgroups.push(select.call(node, node.__data__, i, group));
          parents.push(node);
        }
      }
    }

    return new Selection(subgroups, parents);
  }

  function matcher(selector) {
    return function() {
      return this.matches(selector);
    };
  }

  function selection_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Selection(subgroups, this._parents);
  }

  function sparse(update) {
    return new Array(update.length);
  }

  function selection_enter() {
    return new Selection(this._enter || this._groups.map(sparse), this._parents);
  }

  function EnterNode(parent, datum) {
    this.ownerDocument = parent.ownerDocument;
    this.namespaceURI = parent.namespaceURI;
    this._next = null;
    this._parent = parent;
    this.__data__ = datum;
  }

  EnterNode.prototype = {
    constructor: EnterNode,
    appendChild: function(child) { return this._parent.insertBefore(child, this._next); },
    insertBefore: function(child, next) { return this._parent.insertBefore(child, next); },
    querySelector: function(selector) { return this._parent.querySelector(selector); },
    querySelectorAll: function(selector) { return this._parent.querySelectorAll(selector); }
  };

  function constant(x) {
    return function() {
      return x;
    };
  }

  var keyPrefix = "$"; // Protect against keys like “__proto__”.

  function bindIndex(parent, group, enter, update, exit, data) {
    var i = 0,
        node,
        groupLength = group.length,
        dataLength = data.length;

    // Put any non-null nodes that fit into update.
    // Put any null nodes into enter.
    // Put any remaining data into enter.
    for (; i < dataLength; ++i) {
      if (node = group[i]) {
        node.__data__ = data[i];
        update[i] = node;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Put any non-null nodes that don’t fit into exit.
    for (; i < groupLength; ++i) {
      if (node = group[i]) {
        exit[i] = node;
      }
    }
  }

  function bindKey(parent, group, enter, update, exit, data, key) {
    var i,
        node,
        nodeByKeyValue = {},
        groupLength = group.length,
        dataLength = data.length,
        keyValues = new Array(groupLength),
        keyValue;

    // Compute the key for each node.
    // If multiple nodes have the same key, the duplicates are added to exit.
    for (i = 0; i < groupLength; ++i) {
      if (node = group[i]) {
        keyValues[i] = keyValue = keyPrefix + key.call(node, node.__data__, i, group);
        if (keyValue in nodeByKeyValue) {
          exit[i] = node;
        } else {
          nodeByKeyValue[keyValue] = node;
        }
      }
    }

    // Compute the key for each datum.
    // If there a node associated with this key, join and add it to update.
    // If there is not (or the key is a duplicate), add it to enter.
    for (i = 0; i < dataLength; ++i) {
      keyValue = keyPrefix + key.call(parent, data[i], i, data);
      if (node = nodeByKeyValue[keyValue]) {
        update[i] = node;
        node.__data__ = data[i];
        nodeByKeyValue[keyValue] = null;
      } else {
        enter[i] = new EnterNode(parent, data[i]);
      }
    }

    // Add any remaining nodes that were not bound to data to exit.
    for (i = 0; i < groupLength; ++i) {
      if ((node = group[i]) && (nodeByKeyValue[keyValues[i]] === node)) {
        exit[i] = node;
      }
    }
  }

  function selection_data(value, key) {
    if (!value) {
      data = new Array(this.size()), j = -1;
      this.each(function(d) { data[++j] = d; });
      return data;
    }

    var bind = key ? bindKey : bindIndex,
        parents = this._parents,
        groups = this._groups;

    if (typeof value !== "function") value = constant(value);

    for (var m = groups.length, update = new Array(m), enter = new Array(m), exit = new Array(m), j = 0; j < m; ++j) {
      var parent = parents[j],
          group = groups[j],
          groupLength = group.length,
          data = value.call(parent, parent && parent.__data__, j, parents),
          dataLength = data.length,
          enterGroup = enter[j] = new Array(dataLength),
          updateGroup = update[j] = new Array(dataLength),
          exitGroup = exit[j] = new Array(groupLength);

      bind(parent, group, enterGroup, updateGroup, exitGroup, data, key);

      // Now connect the enter nodes to their following update node, such that
      // appendChild can insert the materialized enter node before this node,
      // rather than at the end of the parent node.
      for (var i0 = 0, i1 = 0, previous, next; i0 < dataLength; ++i0) {
        if (previous = enterGroup[i0]) {
          if (i0 >= i1) i1 = i0 + 1;
          while (!(next = updateGroup[i1]) && ++i1 < dataLength);
          previous._next = next || null;
        }
      }
    }

    update = new Selection(update, parents);
    update._enter = enter;
    update._exit = exit;
    return update;
  }

  function selection_exit() {
    return new Selection(this._exit || this._groups.map(sparse), this._parents);
  }

  function selection_join(onenter, onupdate, onexit) {
    var enter = this.enter(), update = this, exit = this.exit();
    enter = typeof onenter === "function" ? onenter(enter) : enter.append(onenter + "");
    if (onupdate != null) update = onupdate(update);
    if (onexit == null) exit.remove(); else onexit(exit);
    return enter && update ? enter.merge(update).order() : update;
  }

  function selection_merge(selection$$1) {

    for (var groups0 = this._groups, groups1 = selection$$1._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Selection(merges, this._parents);
  }

  function selection_order() {

    for (var groups = this._groups, j = -1, m = groups.length; ++j < m;) {
      for (var group = groups[j], i = group.length - 1, next = group[i], node; --i >= 0;) {
        if (node = group[i]) {
          if (next && node.compareDocumentPosition(next) ^ 4) next.parentNode.insertBefore(node, next);
          next = node;
        }
      }
    }

    return this;
  }

  function selection_sort(compare) {
    if (!compare) compare = ascending;

    function compareNode(a, b) {
      return a && b ? compare(a.__data__, b.__data__) : !a - !b;
    }

    for (var groups = this._groups, m = groups.length, sortgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, sortgroup = sortgroups[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          sortgroup[i] = node;
        }
      }
      sortgroup.sort(compareNode);
    }

    return new Selection(sortgroups, this._parents).order();
  }

  function ascending(a, b) {
    return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
  }

  function selection_call() {
    var callback = arguments[0];
    arguments[0] = this;
    callback.apply(null, arguments);
    return this;
  }

  function selection_nodes() {
    var nodes = new Array(this.size()), i = -1;
    this.each(function() { nodes[++i] = this; });
    return nodes;
  }

  function selection_node() {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length; i < n; ++i) {
        var node = group[i];
        if (node) return node;
      }
    }

    return null;
  }

  function selection_size() {
    var size = 0;
    this.each(function() { ++size; });
    return size;
  }

  function selection_empty() {
    return !this.node();
  }

  function selection_each(callback) {

    for (var groups = this._groups, j = 0, m = groups.length; j < m; ++j) {
      for (var group = groups[j], i = 0, n = group.length, node; i < n; ++i) {
        if (node = group[i]) callback.call(node, node.__data__, i, group);
      }
    }

    return this;
  }

  function attrRemove(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant(name, value) {
    return function() {
      this.setAttribute(name, value);
    };
  }

  function attrConstantNS(fullname, value) {
    return function() {
      this.setAttributeNS(fullname.space, fullname.local, value);
    };
  }

  function attrFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttribute(name);
      else this.setAttribute(name, v);
    };
  }

  function attrFunctionNS(fullname, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.removeAttributeNS(fullname.space, fullname.local);
      else this.setAttributeNS(fullname.space, fullname.local, v);
    };
  }

  function selection_attr(name, value) {
    var fullname = namespace(name);

    if (arguments.length < 2) {
      var node = this.node();
      return fullname.local
          ? node.getAttributeNS(fullname.space, fullname.local)
          : node.getAttribute(fullname);
    }

    return this.each((value == null
        ? (fullname.local ? attrRemoveNS : attrRemove) : (typeof value === "function"
        ? (fullname.local ? attrFunctionNS : attrFunction)
        : (fullname.local ? attrConstantNS : attrConstant)))(fullname, value));
  }

  function defaultView(node) {
    return (node.ownerDocument && node.ownerDocument.defaultView) // node is a Node
        || (node.document && node) // node is a Window
        || node.defaultView; // node is a Document
  }

  function styleRemove(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant(name, value, priority) {
    return function() {
      this.style.setProperty(name, value, priority);
    };
  }

  function styleFunction(name, value, priority) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) this.style.removeProperty(name);
      else this.style.setProperty(name, v, priority);
    };
  }

  function selection_style(name, value, priority) {
    return arguments.length > 1
        ? this.each((value == null
              ? styleRemove : typeof value === "function"
              ? styleFunction
              : styleConstant)(name, value, priority == null ? "" : priority))
        : styleValue(this.node(), name);
  }

  function styleValue(node, name) {
    return node.style.getPropertyValue(name)
        || defaultView(node).getComputedStyle(node, null).getPropertyValue(name);
  }

  function propertyRemove(name) {
    return function() {
      delete this[name];
    };
  }

  function propertyConstant(name, value) {
    return function() {
      this[name] = value;
    };
  }

  function propertyFunction(name, value) {
    return function() {
      var v = value.apply(this, arguments);
      if (v == null) delete this[name];
      else this[name] = v;
    };
  }

  function selection_property(name, value) {
    return arguments.length > 1
        ? this.each((value == null
            ? propertyRemove : typeof value === "function"
            ? propertyFunction
            : propertyConstant)(name, value))
        : this.node()[name];
  }

  function classArray(string) {
    return string.trim().split(/^|\s+/);
  }

  function classList(node) {
    return node.classList || new ClassList(node);
  }

  function ClassList(node) {
    this._node = node;
    this._names = classArray(node.getAttribute("class") || "");
  }

  ClassList.prototype = {
    add: function(name) {
      var i = this._names.indexOf(name);
      if (i < 0) {
        this._names.push(name);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    remove: function(name) {
      var i = this._names.indexOf(name);
      if (i >= 0) {
        this._names.splice(i, 1);
        this._node.setAttribute("class", this._names.join(" "));
      }
    },
    contains: function(name) {
      return this._names.indexOf(name) >= 0;
    }
  };

  function classedAdd(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.add(names[i]);
  }

  function classedRemove(node, names) {
    var list = classList(node), i = -1, n = names.length;
    while (++i < n) list.remove(names[i]);
  }

  function classedTrue(names) {
    return function() {
      classedAdd(this, names);
    };
  }

  function classedFalse(names) {
    return function() {
      classedRemove(this, names);
    };
  }

  function classedFunction(names, value) {
    return function() {
      (value.apply(this, arguments) ? classedAdd : classedRemove)(this, names);
    };
  }

  function selection_classed(name, value) {
    var names = classArray(name + "");

    if (arguments.length < 2) {
      var list = classList(this.node()), i = -1, n = names.length;
      while (++i < n) if (!list.contains(names[i])) return false;
      return true;
    }

    return this.each((typeof value === "function"
        ? classedFunction : value
        ? classedTrue
        : classedFalse)(names, value));
  }

  function textRemove() {
    this.textContent = "";
  }

  function textConstant(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.textContent = v == null ? "" : v;
    };
  }

  function selection_text(value) {
    return arguments.length
        ? this.each(value == null
            ? textRemove : (typeof value === "function"
            ? textFunction
            : textConstant)(value))
        : this.node().textContent;
  }

  function htmlRemove() {
    this.innerHTML = "";
  }

  function htmlConstant(value) {
    return function() {
      this.innerHTML = value;
    };
  }

  function htmlFunction(value) {
    return function() {
      var v = value.apply(this, arguments);
      this.innerHTML = v == null ? "" : v;
    };
  }

  function selection_html(value) {
    return arguments.length
        ? this.each(value == null
            ? htmlRemove : (typeof value === "function"
            ? htmlFunction
            : htmlConstant)(value))
        : this.node().innerHTML;
  }

  function raise() {
    if (this.nextSibling) this.parentNode.appendChild(this);
  }

  function selection_raise() {
    return this.each(raise);
  }

  function lower() {
    if (this.previousSibling) this.parentNode.insertBefore(this, this.parentNode.firstChild);
  }

  function selection_lower() {
    return this.each(lower);
  }

  function selection_append(name) {
    var create = typeof name === "function" ? name : creator(name);
    return this.select(function() {
      return this.appendChild(create.apply(this, arguments));
    });
  }

  function constantNull() {
    return null;
  }

  function selection_insert(name, before) {
    var create = typeof name === "function" ? name : creator(name),
        select = before == null ? constantNull : typeof before === "function" ? before : selector(before);
    return this.select(function() {
      return this.insertBefore(create.apply(this, arguments), select.apply(this, arguments) || null);
    });
  }

  function remove() {
    var parent = this.parentNode;
    if (parent) parent.removeChild(this);
  }

  function selection_remove() {
    return this.each(remove);
  }

  function selection_cloneShallow() {
    return this.parentNode.insertBefore(this.cloneNode(false), this.nextSibling);
  }

  function selection_cloneDeep() {
    return this.parentNode.insertBefore(this.cloneNode(true), this.nextSibling);
  }

  function selection_clone(deep) {
    return this.select(deep ? selection_cloneDeep : selection_cloneShallow);
  }

  function selection_datum(value) {
    return arguments.length
        ? this.property("__data__", value)
        : this.node().__data__;
  }

  var filterEvents = {};

  var event = null;

  if (typeof document !== "undefined") {
    var element = document.documentElement;
    if (!("onmouseenter" in element)) {
      filterEvents = {mouseenter: "mouseover", mouseleave: "mouseout"};
    }
  }

  function filterContextListener(listener, index, group) {
    listener = contextListener(listener, index, group);
    return function(event) {
      var related = event.relatedTarget;
      if (!related || (related !== this && !(related.compareDocumentPosition(this) & 8))) {
        listener.call(this, event);
      }
    };
  }

  function contextListener(listener, index, group) {
    return function(event1) {
      var event0 = event; // Events can be reentrant (e.g., focus).
      event = event1;
      try {
        listener.call(this, this.__data__, index, group);
      } finally {
        event = event0;
      }
    };
  }

  function parseTypenames(typenames) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      return {type: t, name: name};
    });
  }

  function onRemove(typename) {
    return function() {
      var on = this.__on;
      if (!on) return;
      for (var j = 0, i = -1, m = on.length, o; j < m; ++j) {
        if (o = on[j], (!typename.type || o.type === typename.type) && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.capture);
        } else {
          on[++i] = o;
        }
      }
      if (++i) on.length = i;
      else delete this.__on;
    };
  }

  function onAdd(typename, value, capture) {
    var wrap = filterEvents.hasOwnProperty(typename.type) ? filterContextListener : contextListener;
    return function(d, i, group) {
      var on = this.__on, o, listener = wrap(value, i, group);
      if (on) for (var j = 0, m = on.length; j < m; ++j) {
        if ((o = on[j]).type === typename.type && o.name === typename.name) {
          this.removeEventListener(o.type, o.listener, o.capture);
          this.addEventListener(o.type, o.listener = listener, o.capture = capture);
          o.value = value;
          return;
        }
      }
      this.addEventListener(typename.type, listener, capture);
      o = {type: typename.type, name: typename.name, value: value, listener: listener, capture: capture};
      if (!on) this.__on = [o];
      else on.push(o);
    };
  }

  function selection_on(typename, value, capture) {
    var typenames = parseTypenames(typename + ""), i, n = typenames.length, t;

    if (arguments.length < 2) {
      var on = this.node().__on;
      if (on) for (var j = 0, m = on.length, o; j < m; ++j) {
        for (i = 0, o = on[j]; i < n; ++i) {
          if ((t = typenames[i]).type === o.type && t.name === o.name) {
            return o.value;
          }
        }
      }
      return;
    }

    on = value ? onAdd : onRemove;
    if (capture == null) capture = false;
    for (i = 0; i < n; ++i) this.each(on(typenames[i], value, capture));
    return this;
  }

  function customEvent(event1, listener, that, args) {
    var event0 = event;
    event1.sourceEvent = event;
    event = event1;
    try {
      return listener.apply(that, args);
    } finally {
      event = event0;
    }
  }

  function dispatchEvent(node, type, params) {
    var window = defaultView(node),
        event = window.CustomEvent;

    if (typeof event === "function") {
      event = new event(type, params);
    } else {
      event = window.document.createEvent("Event");
      if (params) event.initEvent(type, params.bubbles, params.cancelable), event.detail = params.detail;
      else event.initEvent(type, false, false);
    }

    node.dispatchEvent(event);
  }

  function dispatchConstant(type, params) {
    return function() {
      return dispatchEvent(this, type, params);
    };
  }

  function dispatchFunction(type, params) {
    return function() {
      return dispatchEvent(this, type, params.apply(this, arguments));
    };
  }

  function selection_dispatch(type, params) {
    return this.each((typeof params === "function"
        ? dispatchFunction
        : dispatchConstant)(type, params));
  }

  var root = [null];

  function Selection(groups, parents) {
    this._groups = groups;
    this._parents = parents;
  }

  function selection() {
    return new Selection([[document.documentElement]], root);
  }

  Selection.prototype = selection.prototype = {
    constructor: Selection,
    select: selection_select,
    selectAll: selection_selectAll,
    filter: selection_filter,
    data: selection_data,
    enter: selection_enter,
    exit: selection_exit,
    join: selection_join,
    merge: selection_merge,
    order: selection_order,
    sort: selection_sort,
    call: selection_call,
    nodes: selection_nodes,
    node: selection_node,
    size: selection_size,
    empty: selection_empty,
    each: selection_each,
    attr: selection_attr,
    style: selection_style,
    property: selection_property,
    classed: selection_classed,
    text: selection_text,
    html: selection_html,
    raise: selection_raise,
    lower: selection_lower,
    append: selection_append,
    insert: selection_insert,
    remove: selection_remove,
    clone: selection_clone,
    datum: selection_datum,
    on: selection_on,
    dispatch: selection_dispatch
  };

  function select(selector) {
    return typeof selector === "string"
        ? new Selection([[document.querySelector(selector)]], [document.documentElement])
        : new Selection([[selector]], root);
  }

  function sourceEvent() {
    var current = event, source;
    while (source = current.sourceEvent) current = source;
    return current;
  }

  function point(node, event) {
    var svg = node.ownerSVGElement || node;

    if (svg.createSVGPoint) {
      var point = svg.createSVGPoint();
      point.x = event.clientX, point.y = event.clientY;
      point = point.matrixTransform(node.getScreenCTM().inverse());
      return [point.x, point.y];
    }

    var rect = node.getBoundingClientRect();
    return [event.clientX - rect.left - node.clientLeft, event.clientY - rect.top - node.clientTop];
  }

  function mouse(node) {
    var event = sourceEvent();
    if (event.changedTouches) event = event.changedTouches[0];
    return point(node, event);
  }

  function touch(node, touches, identifier) {
    if (arguments.length < 3) identifier = touches, touches = sourceEvent().changedTouches;

    for (var i = 0, n = touches ? touches.length : 0, touch; i < n; ++i) {
      if ((touch = touches[i]).identifier === identifier) {
        return point(node, touch);
      }
    }

    return null;
  }

  var noop = {value: function() {}};

  function dispatch() {
    for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
      if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
      _[t] = [];
    }
    return new Dispatch(_);
  }

  function Dispatch(_) {
    this._ = _;
  }

  function parseTypenames$1(typenames, types) {
    return typenames.trim().split(/^|\s+/).map(function(t) {
      var name = "", i = t.indexOf(".");
      if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
      if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
      return {type: t, name: name};
    });
  }

  Dispatch.prototype = dispatch.prototype = {
    constructor: Dispatch,
    on: function(typename, callback) {
      var _ = this._,
          T = parseTypenames$1(typename + "", _),
          t,
          i = -1,
          n = T.length;

      // If no callback was specified, return the callback of the given type and name.
      if (arguments.length < 2) {
        while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
        return;
      }

      // If a type was specified, set the callback for the given type and name.
      // Otherwise, if a null callback was specified, remove callbacks of the given name.
      if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
      while (++i < n) {
        if (t = (typename = T[i]).type) _[t] = set$1(_[t], typename.name, callback);
        else if (callback == null) for (t in _) _[t] = set$1(_[t], typename.name, null);
      }

      return this;
    },
    copy: function() {
      var copy = {}, _ = this._;
      for (var t in _) copy[t] = _[t].slice();
      return new Dispatch(copy);
    },
    call: function(type, that) {
      if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    },
    apply: function(type, that, args) {
      if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
      for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
    }
  };

  function get(type, name) {
    for (var i = 0, n = type.length, c; i < n; ++i) {
      if ((c = type[i]).name === name) {
        return c.value;
      }
    }
  }

  function set$1(type, name, callback) {
    for (var i = 0, n = type.length; i < n; ++i) {
      if (type[i].name === name) {
        type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
        break;
      }
    }
    if (callback != null) type.push({name: name, value: callback});
    return type;
  }

  function nopropagation() {
    event.stopImmediatePropagation();
  }

  function noevent() {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function nodrag(view) {
    var root = view.document.documentElement,
        selection$$1 = select(view).on("dragstart.drag", noevent, true);
    if ("onselectstart" in root) {
      selection$$1.on("selectstart.drag", noevent, true);
    } else {
      root.__noselect = root.style.MozUserSelect;
      root.style.MozUserSelect = "none";
    }
  }

  function yesdrag(view, noclick) {
    var root = view.document.documentElement,
        selection$$1 = select(view).on("dragstart.drag", null);
    if (noclick) {
      selection$$1.on("click.drag", noevent, true);
      setTimeout(function() { selection$$1.on("click.drag", null); }, 0);
    }
    if ("onselectstart" in root) {
      selection$$1.on("selectstart.drag", null);
    } else {
      root.style.MozUserSelect = root.__noselect;
      delete root.__noselect;
    }
  }

  function constant$1(x) {
    return function() {
      return x;
    };
  }

  function DragEvent(target, type, subject, id, active, x, y, dx, dy, dispatch) {
    this.target = target;
    this.type = type;
    this.subject = subject;
    this.identifier = id;
    this.active = active;
    this.x = x;
    this.y = y;
    this.dx = dx;
    this.dy = dy;
    this._ = dispatch;
  }

  DragEvent.prototype.on = function() {
    var value = this._.on.apply(this._, arguments);
    return value === this._ ? this : value;
  };

  // Ignore right-click, since that should open the context menu.
  function defaultFilter() {
    return !event.button;
  }

  function defaultContainer() {
    return this.parentNode;
  }

  function defaultSubject(d) {
    return d == null ? {x: event.x, y: event.y} : d;
  }

  function defaultTouchable() {
    return "ontouchstart" in this;
  }

  function d3Drag() {
    var filter = defaultFilter,
        container = defaultContainer,
        subject = defaultSubject,
        touchable = defaultTouchable,
        gestures = {},
        listeners = dispatch("start", "drag", "end"),
        active = 0,
        mousedownx,
        mousedowny,
        mousemoving,
        touchending,
        clickDistance2 = 0;

    function drag(selection$$1) {
      selection$$1
          .on("mousedown.drag", mousedowned)
        .filter(touchable)
          .on("touchstart.drag", touchstarted)
          .on("touchmove.drag", touchmoved)
          .on("touchend.drag touchcancel.drag", touchended)
          .style("touch-action", "none")
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }

    function mousedowned() {
      if (touchending || !filter.apply(this, arguments)) return;
      var gesture = beforestart("mouse", container.apply(this, arguments), mouse, this, arguments);
      if (!gesture) return;
      select(event.view).on("mousemove.drag", mousemoved, true).on("mouseup.drag", mouseupped, true);
      nodrag(event.view);
      nopropagation();
      mousemoving = false;
      mousedownx = event.clientX;
      mousedowny = event.clientY;
      gesture("start");
    }

    function mousemoved() {
      noevent();
      if (!mousemoving) {
        var dx = event.clientX - mousedownx, dy = event.clientY - mousedowny;
        mousemoving = dx * dx + dy * dy > clickDistance2;
      }
      gestures.mouse("drag");
    }

    function mouseupped() {
      select(event.view).on("mousemove.drag mouseup.drag", null);
      yesdrag(event.view, mousemoving);
      noevent();
      gestures.mouse("end");
    }

    function touchstarted() {
      if (!filter.apply(this, arguments)) return;
      var touches$$1 = event.changedTouches,
          c = container.apply(this, arguments),
          n = touches$$1.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = beforestart(touches$$1[i].identifier, c, touch, this, arguments)) {
          nopropagation();
          gesture("start");
        }
      }
    }

    function touchmoved() {
      var touches$$1 = event.changedTouches,
          n = touches$$1.length, i, gesture;

      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches$$1[i].identifier]) {
          noevent();
          gesture("drag");
        }
      }
    }

    function touchended() {
      var touches$$1 = event.changedTouches,
          n = touches$$1.length, i, gesture;

      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() { touchending = null; }, 500); // Ghost clicks are delayed!
      for (i = 0; i < n; ++i) {
        if (gesture = gestures[touches$$1[i].identifier]) {
          nopropagation();
          gesture("end");
        }
      }
    }

    function beforestart(id, container, point$$1, that, args) {
      var p = point$$1(container, id), s, dx, dy,
          sublisteners = listeners.copy();

      if (!customEvent(new DragEvent(drag, "beforestart", s, id, active, p[0], p[1], 0, 0, sublisteners), function() {
        if ((event.subject = s = subject.apply(that, args)) == null) return false;
        dx = s.x - p[0] || 0;
        dy = s.y - p[1] || 0;
        return true;
      })) return;

      return function gesture(type) {
        var p0 = p, n;
        switch (type) {
          case "start": gestures[id] = gesture, n = active++; break;
          case "end": delete gestures[id], --active; // nobreak
          case "drag": p = point$$1(container, id), n = active; break;
        }
        customEvent(new DragEvent(drag, type, s, id, n, p[0] + dx, p[1] + dy, p[0] - p0[0], p[1] - p0[1], sublisteners), sublisteners.apply, sublisteners, [type, that, args]);
      };
    }

    drag.filter = function(_) {
      return arguments.length ? (filter = typeof _ === "function" ? _ : constant$1(!!_), drag) : filter;
    };

    drag.container = function(_) {
      return arguments.length ? (container = typeof _ === "function" ? _ : constant$1(_), drag) : container;
    };

    drag.subject = function(_) {
      return arguments.length ? (subject = typeof _ === "function" ? _ : constant$1(_), drag) : subject;
    };

    drag.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$1(!!_), drag) : touchable;
    };

    drag.on = function() {
      var value = listeners.on.apply(listeners, arguments);
      return value === listeners ? drag : value;
    };

    drag.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, drag) : Math.sqrt(clickDistance2);
    };

    return drag;
  }

  function define(constructor, factory, prototype) {
    constructor.prototype = factory.prototype = prototype;
    prototype.constructor = constructor;
  }

  function extend(parent, definition) {
    var prototype = Object.create(parent.prototype);
    for (var key in definition) prototype[key] = definition[key];
    return prototype;
  }

  function Color() {}

  var darker = 0.7;
  var brighter = 1 / darker;

  var reI = "\\s*([+-]?\\d+)\\s*",
      reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
      reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
      reHex3 = /^#([0-9a-f]{3})$/,
      reHex6 = /^#([0-9a-f]{6})$/,
      reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
      reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
      reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
      reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
      reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
      reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

  var named = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32
  };

  define(Color, color, {
    displayable: function() {
      return this.rgb().displayable();
    },
    hex: function() {
      return this.rgb().hex();
    },
    toString: function() {
      return this.rgb() + "";
    }
  });

  function color(format) {
    var m;
    format = (format + "").trim().toLowerCase();
    return (m = reHex3.exec(format)) ? (m = parseInt(m[1], 16), new Rgb((m >> 8 & 0xf) | (m >> 4 & 0x0f0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1)) // #f00
        : (m = reHex6.exec(format)) ? rgbn(parseInt(m[1], 16)) // #ff0000
        : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
        : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
        : (m = reRgbaInteger.exec(format)) ? rgba(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
        : (m = reRgbaPercent.exec(format)) ? rgba(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
        : (m = reHslPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
        : (m = reHslaPercent.exec(format)) ? hsla(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
        : named.hasOwnProperty(format) ? rgbn(named[format])
        : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
        : null;
  }

  function rgbn(n) {
    return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
  }

  function rgba(r, g, b, a) {
    if (a <= 0) r = g = b = NaN;
    return new Rgb(r, g, b, a);
  }

  function rgbConvert(o) {
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Rgb;
    o = o.rgb();
    return new Rgb(o.r, o.g, o.b, o.opacity);
  }

  function rgb(r, g, b, opacity) {
    return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
  }

  function Rgb(r, g, b, opacity) {
    this.r = +r;
    this.g = +g;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Rgb, rgb, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
    },
    rgb: function() {
      return this;
    },
    displayable: function() {
      return (0 <= this.r && this.r <= 255)
          && (0 <= this.g && this.g <= 255)
          && (0 <= this.b && this.b <= 255)
          && (0 <= this.opacity && this.opacity <= 1);
    },
    hex: function() {
      return "#" + hex(this.r) + hex(this.g) + hex(this.b);
    },
    toString: function() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }
  }));

  function hex(value) {
    value = Math.max(0, Math.min(255, Math.round(value) || 0));
    return (value < 16 ? "0" : "") + value.toString(16);
  }

  function hsla(h, s, l, a) {
    if (a <= 0) h = s = l = NaN;
    else if (l <= 0 || l >= 1) h = s = NaN;
    else if (s <= 0) h = NaN;
    return new Hsl(h, s, l, a);
  }

  function hslConvert(o) {
    if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Color)) o = color(o);
    if (!o) return new Hsl;
    if (o instanceof Hsl) return o;
    o = o.rgb();
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        min = Math.min(r, g, b),
        max = Math.max(r, g, b),
        h = NaN,
        s = max - min,
        l = (max + min) / 2;
    if (s) {
      if (r === max) h = (g - b) / s + (g < b) * 6;
      else if (g === max) h = (b - r) / s + 2;
      else h = (r - g) / s + 4;
      s /= l < 0.5 ? max + min : 2 - max - min;
      h *= 60;
    } else {
      s = l > 0 && l < 1 ? 0 : h;
    }
    return new Hsl(h, s, l, o.opacity);
  }

  function hsl(h, s, l, opacity) {
    return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
  }

  function Hsl(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hsl, hsl, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Hsl(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = this.h % 360 + (this.h < 0) * 360,
          s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
          l = this.l,
          m2 = l + (l < 0.5 ? l : 1 - l) * s,
          m1 = 2 * l - m2;
      return new Rgb(
        hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
        hsl2rgb(h, m1, m2),
        hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
        this.opacity
      );
    },
    displayable: function() {
      return (0 <= this.s && this.s <= 1 || isNaN(this.s))
          && (0 <= this.l && this.l <= 1)
          && (0 <= this.opacity && this.opacity <= 1);
    }
  }));

  /* From FvD 13.37, CSS Color Module Level 3 */
  function hsl2rgb(h, m1, m2) {
    return (h < 60 ? m1 + (m2 - m1) * h / 60
        : h < 180 ? m2
        : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
        : m1) * 255;
  }

  var deg2rad = Math.PI / 180;
  var rad2deg = 180 / Math.PI;

  // https://beta.observablehq.com/@mbostock/lab-and-rgb
  var K = 18,
      Xn = 0.96422,
      Yn = 1,
      Zn = 0.82521,
      t0 = 4 / 29,
      t1 = 6 / 29,
      t2 = 3 * t1 * t1,
      t3 = t1 * t1 * t1;

  function labConvert(o) {
    if (o instanceof Lab) return new Lab(o.l, o.a, o.b, o.opacity);
    if (o instanceof Hcl) {
      if (isNaN(o.h)) return new Lab(o.l, 0, 0, o.opacity);
      var h = o.h * deg2rad;
      return new Lab(o.l, Math.cos(h) * o.c, Math.sin(h) * o.c, o.opacity);
    }
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = rgb2lrgb(o.r),
        g = rgb2lrgb(o.g),
        b = rgb2lrgb(o.b),
        y = xyz2lab((0.2225045 * r + 0.7168786 * g + 0.0606169 * b) / Yn), x, z;
    if (r === g && g === b) x = z = y; else {
      x = xyz2lab((0.4360747 * r + 0.3850649 * g + 0.1430804 * b) / Xn);
      z = xyz2lab((0.0139322 * r + 0.0971045 * g + 0.7141733 * b) / Zn);
    }
    return new Lab(116 * y - 16, 500 * (x - y), 200 * (y - z), o.opacity);
  }

  function lab(l, a, b, opacity) {
    return arguments.length === 1 ? labConvert(l) : new Lab(l, a, b, opacity == null ? 1 : opacity);
  }

  function Lab(l, a, b, opacity) {
    this.l = +l;
    this.a = +a;
    this.b = +b;
    this.opacity = +opacity;
  }

  define(Lab, lab, extend(Color, {
    brighter: function(k) {
      return new Lab(this.l + K * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    darker: function(k) {
      return new Lab(this.l - K * (k == null ? 1 : k), this.a, this.b, this.opacity);
    },
    rgb: function() {
      var y = (this.l + 16) / 116,
          x = isNaN(this.a) ? y : y + this.a / 500,
          z = isNaN(this.b) ? y : y - this.b / 200;
      x = Xn * lab2xyz(x);
      y = Yn * lab2xyz(y);
      z = Zn * lab2xyz(z);
      return new Rgb(
        lrgb2rgb( 3.1338561 * x - 1.6168667 * y - 0.4906146 * z),
        lrgb2rgb(-0.9787684 * x + 1.9161415 * y + 0.0334540 * z),
        lrgb2rgb( 0.0719453 * x - 0.2289914 * y + 1.4052427 * z),
        this.opacity
      );
    }
  }));

  function xyz2lab(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
  }

  function lab2xyz(t) {
    return t > t1 ? t * t * t : t2 * (t - t0);
  }

  function lrgb2rgb(x) {
    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
  }

  function rgb2lrgb(x) {
    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  }

  function hclConvert(o) {
    if (o instanceof Hcl) return new Hcl(o.h, o.c, o.l, o.opacity);
    if (!(o instanceof Lab)) o = labConvert(o);
    if (o.a === 0 && o.b === 0) return new Hcl(NaN, 0, o.l, o.opacity);
    var h = Math.atan2(o.b, o.a) * rad2deg;
    return new Hcl(h < 0 ? h + 360 : h, Math.sqrt(o.a * o.a + o.b * o.b), o.l, o.opacity);
  }

  function hcl(h, c, l, opacity) {
    return arguments.length === 1 ? hclConvert(h) : new Hcl(h, c, l, opacity == null ? 1 : opacity);
  }

  function Hcl(h, c, l, opacity) {
    this.h = +h;
    this.c = +c;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Hcl, hcl, extend(Color, {
    brighter: function(k) {
      return new Hcl(this.h, this.c, this.l + K * (k == null ? 1 : k), this.opacity);
    },
    darker: function(k) {
      return new Hcl(this.h, this.c, this.l - K * (k == null ? 1 : k), this.opacity);
    },
    rgb: function() {
      return labConvert(this).rgb();
    }
  }));

  var A = -0.14861,
      B = +1.78277,
      C = -0.29227,
      D = -0.90649,
      E = +1.97294,
      ED = E * D,
      EB = E * B,
      BC_DA = B * C - D * A;

  function cubehelixConvert(o) {
    if (o instanceof Cubehelix) return new Cubehelix(o.h, o.s, o.l, o.opacity);
    if (!(o instanceof Rgb)) o = rgbConvert(o);
    var r = o.r / 255,
        g = o.g / 255,
        b = o.b / 255,
        l = (BC_DA * b + ED * r - EB * g) / (BC_DA + ED - EB),
        bl = b - l,
        k = (E * (g - l) - C * bl) / D,
        s = Math.sqrt(k * k + bl * bl) / (E * l * (1 - l)), // NaN if l=0 or l=1
        h = s ? Math.atan2(k, bl) * rad2deg - 120 : NaN;
    return new Cubehelix(h < 0 ? h + 360 : h, s, l, o.opacity);
  }

  function cubehelix(h, s, l, opacity) {
    return arguments.length === 1 ? cubehelixConvert(h) : new Cubehelix(h, s, l, opacity == null ? 1 : opacity);
  }

  function Cubehelix(h, s, l, opacity) {
    this.h = +h;
    this.s = +s;
    this.l = +l;
    this.opacity = +opacity;
  }

  define(Cubehelix, cubehelix, extend(Color, {
    brighter: function(k) {
      k = k == null ? brighter : Math.pow(brighter, k);
      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
    },
    darker: function(k) {
      k = k == null ? darker : Math.pow(darker, k);
      return new Cubehelix(this.h, this.s, this.l * k, this.opacity);
    },
    rgb: function() {
      var h = isNaN(this.h) ? 0 : (this.h + 120) * deg2rad,
          l = +this.l,
          a = isNaN(this.s) ? 0 : this.s * l * (1 - l),
          cosh = Math.cos(h),
          sinh = Math.sin(h);
      return new Rgb(
        255 * (l + a * (A * cosh + B * sinh)),
        255 * (l + a * (C * cosh + D * sinh)),
        255 * (l + a * (E * cosh)),
        this.opacity
      );
    }
  }));

  function basis(t1, v0, v1, v2, v3) {
    var t2 = t1 * t1, t3 = t2 * t1;
    return ((1 - 3 * t1 + 3 * t2 - t3) * v0
        + (4 - 6 * t2 + 3 * t3) * v1
        + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
        + t3 * v3) / 6;
  }

  function basis$1(values) {
    var n = values.length - 1;
    return function(t) {
      var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
          v1 = values[i],
          v2 = values[i + 1],
          v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
          v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
      return basis((t - i / n) * n, v0, v1, v2, v3);
    };
  }

  function constant$2(x) {
    return function() {
      return x;
    };
  }

  function linear(a, d) {
    return function(t) {
      return a + t * d;
    };
  }

  function exponential(a, b, y) {
    return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
      return Math.pow(a + t * b, y);
    };
  }

  function hue(a, b) {
    var d = b - a;
    return d ? linear(a, d > 180 || d < -180 ? d - 360 * Math.round(d / 360) : d) : constant$2(isNaN(a) ? b : a);
  }

  function gamma(y) {
    return (y = +y) === 1 ? nogamma : function(a, b) {
      return b - a ? exponential(a, b, y) : constant$2(isNaN(a) ? b : a);
    };
  }

  function nogamma(a, b) {
    var d = b - a;
    return d ? linear(a, d) : constant$2(isNaN(a) ? b : a);
  }

  var interpolateRgb = (function rgbGamma(y) {
    var color$$1 = gamma(y);

    function rgb$$1(start, end) {
      var r = color$$1((start = rgb(start)).r, (end = rgb(end)).r),
          g = color$$1(start.g, end.g),
          b = color$$1(start.b, end.b),
          opacity = nogamma(start.opacity, end.opacity);
      return function(t) {
        start.r = r(t);
        start.g = g(t);
        start.b = b(t);
        start.opacity = opacity(t);
        return start + "";
      };
    }

    rgb$$1.gamma = rgbGamma;

    return rgb$$1;
  })(1);

  function rgbSpline(spline) {
    return function(colors) {
      var n = colors.length,
          r = new Array(n),
          g = new Array(n),
          b = new Array(n),
          i, color$$1;
      for (i = 0; i < n; ++i) {
        color$$1 = rgb(colors[i]);
        r[i] = color$$1.r || 0;
        g[i] = color$$1.g || 0;
        b[i] = color$$1.b || 0;
      }
      r = spline(r);
      g = spline(g);
      b = spline(b);
      color$$1.opacity = 1;
      return function(t) {
        color$$1.r = r(t);
        color$$1.g = g(t);
        color$$1.b = b(t);
        return color$$1 + "";
      };
    };
  }

  var rgbBasis = rgbSpline(basis$1);

  function interpolateNumber(a, b) {
    return a = +a, b -= a, function(t) {
      return a + b * t;
    };
  }

  var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
      reB = new RegExp(reA.source, "g");

  function zero(b) {
    return function() {
      return b;
    };
  }

  function one(b) {
    return function(t) {
      return b(t) + "";
    };
  }

  function interpolateString(a, b) {
    var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
        am, // current match in a
        bm, // current match in b
        bs, // string preceding current number in b, if any
        i = -1, // index in s
        s = [], // string constants and placeholders
        q = []; // number interpolators

    // Coerce inputs to strings.
    a = a + "", b = b + "";

    // Interpolate pairs of numbers in a & b.
    while ((am = reA.exec(a))
        && (bm = reB.exec(b))) {
      if ((bs = bm.index) > bi) { // a string precedes the next number in b
        bs = b.slice(bi, bs);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }
      if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
        if (s[i]) s[i] += bm; // coalesce with previous string
        else s[++i] = bm;
      } else { // interpolate non-matching numbers
        s[++i] = null;
        q.push({i: i, x: interpolateNumber(am, bm)});
      }
      bi = reB.lastIndex;
    }

    // Add remains of b.
    if (bi < b.length) {
      bs = b.slice(bi);
      if (s[i]) s[i] += bs; // coalesce with previous string
      else s[++i] = bs;
    }

    // Special optimization for only a single match.
    // Otherwise, interpolate each of the numbers and rejoin the string.
    return s.length < 2 ? (q[0]
        ? one(q[0].x)
        : zero(b))
        : (b = q.length, function(t) {
            for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
            return s.join("");
          });
  }

  var degrees = 180 / Math.PI;

  var identity = {
    translateX: 0,
    translateY: 0,
    rotate: 0,
    skewX: 0,
    scaleX: 1,
    scaleY: 1
  };

  function decompose(a, b, c, d, e, f) {
    var scaleX, scaleY, skewX;
    if (scaleX = Math.sqrt(a * a + b * b)) a /= scaleX, b /= scaleX;
    if (skewX = a * c + b * d) c -= a * skewX, d -= b * skewX;
    if (scaleY = Math.sqrt(c * c + d * d)) c /= scaleY, d /= scaleY, skewX /= scaleY;
    if (a * d < b * c) a = -a, b = -b, skewX = -skewX, scaleX = -scaleX;
    return {
      translateX: e,
      translateY: f,
      rotate: Math.atan2(b, a) * degrees,
      skewX: Math.atan(skewX) * degrees,
      scaleX: scaleX,
      scaleY: scaleY
    };
  }

  var cssNode,
      cssRoot,
      cssView,
      svgNode;

  function parseCss(value) {
    if (value === "none") return identity;
    if (!cssNode) cssNode = document.createElement("DIV"), cssRoot = document.documentElement, cssView = document.defaultView;
    cssNode.style.transform = value;
    value = cssView.getComputedStyle(cssRoot.appendChild(cssNode), null).getPropertyValue("transform");
    cssRoot.removeChild(cssNode);
    value = value.slice(7, -1).split(",");
    return decompose(+value[0], +value[1], +value[2], +value[3], +value[4], +value[5]);
  }

  function parseSvg(value) {
    if (value == null) return identity;
    if (!svgNode) svgNode = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svgNode.setAttribute("transform", value);
    if (!(value = svgNode.transform.baseVal.consolidate())) return identity;
    value = value.matrix;
    return decompose(value.a, value.b, value.c, value.d, value.e, value.f);
  }

  function interpolateTransform(parse, pxComma, pxParen, degParen) {

    function pop(s) {
      return s.length ? s.pop() + " " : "";
    }

    function translate(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push("translate(", null, pxComma, null, pxParen);
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb || yb) {
        s.push("translate(" + xb + pxComma + yb + pxParen);
      }
    }

    function rotate(a, b, s, q) {
      if (a !== b) {
        if (a - b > 180) b += 360; else if (b - a > 180) a += 360; // shortest path
        q.push({i: s.push(pop(s) + "rotate(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "rotate(" + b + degParen);
      }
    }

    function skewX(a, b, s, q) {
      if (a !== b) {
        q.push({i: s.push(pop(s) + "skewX(", null, degParen) - 2, x: interpolateNumber(a, b)});
      } else if (b) {
        s.push(pop(s) + "skewX(" + b + degParen);
      }
    }

    function scale(xa, ya, xb, yb, s, q) {
      if (xa !== xb || ya !== yb) {
        var i = s.push(pop(s) + "scale(", null, ",", null, ")");
        q.push({i: i - 4, x: interpolateNumber(xa, xb)}, {i: i - 2, x: interpolateNumber(ya, yb)});
      } else if (xb !== 1 || yb !== 1) {
        s.push(pop(s) + "scale(" + xb + "," + yb + ")");
      }
    }

    return function(a, b) {
      var s = [], // string constants and placeholders
          q = []; // number interpolators
      a = parse(a), b = parse(b);
      translate(a.translateX, a.translateY, b.translateX, b.translateY, s, q);
      rotate(a.rotate, b.rotate, s, q);
      skewX(a.skewX, b.skewX, s, q);
      scale(a.scaleX, a.scaleY, b.scaleX, b.scaleY, s, q);
      a = b = null; // gc
      return function(t) {
        var i = -1, n = q.length, o;
        while (++i < n) s[(o = q[i]).i] = o.x(t);
        return s.join("");
      };
    };
  }

  var interpolateTransformCss = interpolateTransform(parseCss, "px, ", "px)", "deg)");
  var interpolateTransformSvg = interpolateTransform(parseSvg, ", ", ")", ")");

  var rho = Math.SQRT2,
      rho2 = 2,
      rho4 = 4,
      epsilon2 = 1e-12;

  function cosh(x) {
    return ((x = Math.exp(x)) + 1 / x) / 2;
  }

  function sinh(x) {
    return ((x = Math.exp(x)) - 1 / x) / 2;
  }

  function tanh(x) {
    return ((x = Math.exp(2 * x)) - 1) / (x + 1);
  }

  // p0 = [ux0, uy0, w0]
  // p1 = [ux1, uy1, w1]
  function interpolateZoom(p0, p1) {
    var ux0 = p0[0], uy0 = p0[1], w0 = p0[2],
        ux1 = p1[0], uy1 = p1[1], w1 = p1[2],
        dx = ux1 - ux0,
        dy = uy1 - uy0,
        d2 = dx * dx + dy * dy,
        i,
        S;

    // Special case for u0 ≅ u1.
    if (d2 < epsilon2) {
      S = Math.log(w1 / w0) / rho;
      i = function(t) {
        return [
          ux0 + t * dx,
          uy0 + t * dy,
          w0 * Math.exp(rho * t * S)
        ];
      };
    }

    // General case.
    else {
      var d1 = Math.sqrt(d2),
          b0 = (w1 * w1 - w0 * w0 + rho4 * d2) / (2 * w0 * rho2 * d1),
          b1 = (w1 * w1 - w0 * w0 - rho4 * d2) / (2 * w1 * rho2 * d1),
          r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0),
          r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      i = function(t) {
        var s = t * S,
            coshr0 = cosh(r0),
            u = w0 / (rho2 * d1) * (coshr0 * tanh(rho * s + r0) - sinh(r0));
        return [
          ux0 + u * dx,
          uy0 + u * dy,
          w0 * coshr0 / cosh(rho * s + r0)
        ];
      };
    }

    i.duration = S * 1000;

    return i;
  }

  function cubehelix$1(hue$$1) {
    return (function cubehelixGamma(y) {
      y = +y;

      function cubehelix$$1(start, end) {
        var h = hue$$1((start = cubehelix(start)).h, (end = cubehelix(end)).h),
            s = nogamma(start.s, end.s),
            l = nogamma(start.l, end.l),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.h = h(t);
          start.s = s(t);
          start.l = l(Math.pow(t, y));
          start.opacity = opacity(t);
          return start + "";
        };
      }

      cubehelix$$1.gamma = cubehelixGamma;

      return cubehelix$$1;
    })(1);
  }

  cubehelix$1(hue);
  var cubehelixLong = cubehelix$1(nogamma);

  var frame = 0, // is an animation frame pending?
      timeout = 0, // is a timeout pending?
      interval = 0, // are any timers active?
      pokeDelay = 1000, // how frequently we check for clock skew
      taskHead,
      taskTail,
      clockLast = 0,
      clockNow = 0,
      clockSkew = 0,
      clock = typeof performance === "object" && performance.now ? performance : Date,
      setFrame = typeof window === "object" && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : function(f) { setTimeout(f, 17); };

  function now() {
    return clockNow || (setFrame(clearNow), clockNow = clock.now() + clockSkew);
  }

  function clearNow() {
    clockNow = 0;
  }

  function Timer() {
    this._call =
    this._time =
    this._next = null;
  }

  Timer.prototype = timer.prototype = {
    constructor: Timer,
    restart: function(callback, delay, time) {
      if (typeof callback !== "function") throw new TypeError("callback is not a function");
      time = (time == null ? now() : +time) + (delay == null ? 0 : +delay);
      if (!this._next && taskTail !== this) {
        if (taskTail) taskTail._next = this;
        else taskHead = this;
        taskTail = this;
      }
      this._call = callback;
      this._time = time;
      sleep();
    },
    stop: function() {
      if (this._call) {
        this._call = null;
        this._time = Infinity;
        sleep();
      }
    }
  };

  function timer(callback, delay, time) {
    var t = new Timer;
    t.restart(callback, delay, time);
    return t;
  }

  function timerFlush() {
    now(); // Get the current time, if not already set.
    ++frame; // Pretend we’ve set an alarm, if we haven’t already.
    var t = taskHead, e;
    while (t) {
      if ((e = clockNow - t._time) >= 0) t._call.call(null, e);
      t = t._next;
    }
    --frame;
  }

  function wake() {
    clockNow = (clockLast = clock.now()) + clockSkew;
    frame = timeout = 0;
    try {
      timerFlush();
    } finally {
      frame = 0;
      nap();
      clockNow = 0;
    }
  }

  function poke() {
    var now = clock.now(), delay = now - clockLast;
    if (delay > pokeDelay) clockSkew -= delay, clockLast = now;
  }

  function nap() {
    var t0, t1 = taskHead, t2, time = Infinity;
    while (t1) {
      if (t1._call) {
        if (time > t1._time) time = t1._time;
        t0 = t1, t1 = t1._next;
      } else {
        t2 = t1._next, t1._next = null;
        t1 = t0 ? t0._next = t2 : taskHead = t2;
      }
    }
    taskTail = t0;
    sleep(time);
  }

  function sleep(time) {
    if (frame) return; // Soonest alarm already set, or will be.
    if (timeout) timeout = clearTimeout(timeout);
    var delay = time - clockNow; // Strictly less than if we recomputed clockNow.
    if (delay > 24) {
      if (time < Infinity) timeout = setTimeout(wake, time - clock.now() - clockSkew);
      if (interval) interval = clearInterval(interval);
    } else {
      if (!interval) clockLast = clock.now(), interval = setInterval(poke, pokeDelay);
      frame = 1, setFrame(wake);
    }
  }

  function timeout$1(callback, delay, time) {
    var t = new Timer;
    delay = delay == null ? 0 : +delay;
    t.restart(function(elapsed) {
      t.stop();
      callback(elapsed + delay);
    }, delay, time);
    return t;
  }

  var emptyOn = dispatch("start", "end", "cancel", "interrupt");
  var emptyTween = [];

  var CREATED = 0;
  var SCHEDULED = 1;
  var STARTING = 2;
  var STARTED = 3;
  var RUNNING = 4;
  var ENDING = 5;
  var ENDED = 6;

  function schedule(node, name, id, index, group, timing) {
    var schedules = node.__transition;
    if (!schedules) node.__transition = {};
    else if (id in schedules) return;
    create$1(node, id, {
      name: name,
      index: index, // For context during callback.
      group: group, // For context during callback.
      on: emptyOn,
      tween: emptyTween,
      time: timing.time,
      delay: timing.delay,
      duration: timing.duration,
      ease: timing.ease,
      timer: null,
      state: CREATED
    });
  }

  function init(node, id) {
    var schedule = get$1(node, id);
    if (schedule.state > CREATED) throw new Error("too late; already scheduled");
    return schedule;
  }

  function set$2(node, id) {
    var schedule = get$1(node, id);
    if (schedule.state > STARTED) throw new Error("too late; already running");
    return schedule;
  }

  function get$1(node, id) {
    var schedule = node.__transition;
    if (!schedule || !(schedule = schedule[id])) throw new Error("transition not found");
    return schedule;
  }

  function create$1(node, id, self) {
    var schedules = node.__transition,
        tween;

    // Initialize the self timer when the transition is created.
    // Note the actual delay is not known until the first callback!
    schedules[id] = self;
    self.timer = timer(schedule, 0, self.time);

    function schedule(elapsed) {
      self.state = SCHEDULED;
      self.timer.restart(start, self.delay, self.time);

      // If the elapsed delay is less than our first sleep, start immediately.
      if (self.delay <= elapsed) start(elapsed - self.delay);
    }

    function start(elapsed) {
      var i, j, n, o;

      // If the state is not SCHEDULED, then we previously errored on start.
      if (self.state !== SCHEDULED) return stop();

      for (i in schedules) {
        o = schedules[i];
        if (o.name !== self.name) continue;

        // While this element already has a starting transition during this frame,
        // defer starting an interrupting transition until that transition has a
        // chance to tick (and possibly end); see d3/d3-transition#54!
        if (o.state === STARTED) return timeout$1(start);

        // Interrupt the active transition, if any.
        if (o.state === RUNNING) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("interrupt", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }

        // Cancel any pre-empted transitions.
        else if (+i < id) {
          o.state = ENDED;
          o.timer.stop();
          o.on.call("cancel", node, node.__data__, o.index, o.group);
          delete schedules[i];
        }
      }

      // Defer the first tick to end of the current frame; see d3/d3#1576.
      // Note the transition may be canceled after start and before the first tick!
      // Note this must be scheduled before the start event; see d3/d3-transition#16!
      // Assuming this is successful, subsequent callbacks go straight to tick.
      timeout$1(function() {
        if (self.state === STARTED) {
          self.state = RUNNING;
          self.timer.restart(tick, self.delay, self.time);
          tick(elapsed);
        }
      });

      // Dispatch the start event.
      // Note this must be done before the tween are initialized.
      self.state = STARTING;
      self.on.call("start", node, node.__data__, self.index, self.group);
      if (self.state !== STARTING) return; // interrupted
      self.state = STARTED;

      // Initialize the tween, deleting null tween.
      tween = new Array(n = self.tween.length);
      for (i = 0, j = -1; i < n; ++i) {
        if (o = self.tween[i].value.call(node, node.__data__, self.index, self.group)) {
          tween[++j] = o;
        }
      }
      tween.length = j + 1;
    }

    function tick(elapsed) {
      var t = elapsed < self.duration ? self.ease.call(null, elapsed / self.duration) : (self.timer.restart(stop), self.state = ENDING, 1),
          i = -1,
          n = tween.length;

      while (++i < n) {
        tween[i].call(node, t);
      }

      // Dispatch the end event.
      if (self.state === ENDING) {
        self.on.call("end", node, node.__data__, self.index, self.group);
        stop();
      }
    }

    function stop() {
      self.state = ENDED;
      self.timer.stop();
      delete schedules[id];
      for (var i in schedules) return; // eslint-disable-line no-unused-vars
      delete node.__transition;
    }
  }

  function interrupt(node, name) {
    var schedules = node.__transition,
        schedule$$1,
        active,
        empty = true,
        i;

    if (!schedules) return;

    name = name == null ? null : name + "";

    for (i in schedules) {
      if ((schedule$$1 = schedules[i]).name !== name) { empty = false; continue; }
      active = schedule$$1.state > STARTING && schedule$$1.state < ENDING;
      schedule$$1.state = ENDED;
      schedule$$1.timer.stop();
      schedule$$1.on.call(active ? "interrupt" : "cancel", node, node.__data__, schedule$$1.index, schedule$$1.group);
      delete schedules[i];
    }

    if (empty) delete node.__transition;
  }

  function selection_interrupt(name) {
    return this.each(function() {
      interrupt(this, name);
    });
  }

  function tweenRemove(id, name) {
    var tween0, tween1;
    return function() {
      var schedule$$1 = set$2(this, id),
          tween = schedule$$1.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = tween0 = tween;
        for (var i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1 = tween1.slice();
            tween1.splice(i, 1);
            break;
          }
        }
      }

      schedule$$1.tween = tween1;
    };
  }

  function tweenFunction(id, name, value) {
    var tween0, tween1;
    if (typeof value !== "function") throw new Error;
    return function() {
      var schedule$$1 = set$2(this, id),
          tween = schedule$$1.tween;

      // If this node shared tween with the previous node,
      // just assign the updated shared tween and we’re done!
      // Otherwise, copy-on-write.
      if (tween !== tween0) {
        tween1 = (tween0 = tween).slice();
        for (var t = {name: name, value: value}, i = 0, n = tween1.length; i < n; ++i) {
          if (tween1[i].name === name) {
            tween1[i] = t;
            break;
          }
        }
        if (i === n) tween1.push(t);
      }

      schedule$$1.tween = tween1;
    };
  }

  function transition_tween(name, value) {
    var id = this._id;

    name += "";

    if (arguments.length < 2) {
      var tween = get$1(this.node(), id).tween;
      for (var i = 0, n = tween.length, t; i < n; ++i) {
        if ((t = tween[i]).name === name) {
          return t.value;
        }
      }
      return null;
    }

    return this.each((value == null ? tweenRemove : tweenFunction)(id, name, value));
  }

  function tweenValue(transition, name, value) {
    var id = transition._id;

    transition.each(function() {
      var schedule$$1 = set$2(this, id);
      (schedule$$1.value || (schedule$$1.value = {}))[name] = value.apply(this, arguments);
    });

    return function(node) {
      return get$1(node, id).value[name];
    };
  }

  function interpolate(a, b) {
    var c;
    return (typeof b === "number" ? interpolateNumber
        : b instanceof color ? interpolateRgb
        : (c = color(b)) ? (b = c, interpolateRgb)
        : interpolateString)(a, b);
  }

  function attrRemove$1(name) {
    return function() {
      this.removeAttribute(name);
    };
  }

  function attrRemoveNS$1(fullname) {
    return function() {
      this.removeAttributeNS(fullname.space, fullname.local);
    };
  }

  function attrConstant$1(name, interpolate$$1, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttribute(name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate$$1(string00 = string0, value1);
    };
  }

  function attrConstantNS$1(fullname, interpolate$$1, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = this.getAttributeNS(fullname.space, fullname.local);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate$$1(string00 = string0, value1);
    };
  }

  function attrFunction$1(name, interpolate$$1, value$$1) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value$$1(this), string1;
      if (value1 == null) return void this.removeAttribute(name);
      string0 = this.getAttribute(name);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate$$1(string00 = string0, value1));
    };
  }

  function attrFunctionNS$1(fullname, interpolate$$1, value$$1) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0, value1 = value$$1(this), string1;
      if (value1 == null) return void this.removeAttributeNS(fullname.space, fullname.local);
      string0 = this.getAttributeNS(fullname.space, fullname.local);
      string1 = value1 + "";
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate$$1(string00 = string0, value1));
    };
  }

  function transition_attr(name, value$$1) {
    var fullname = namespace(name), i = fullname === "transform" ? interpolateTransformSvg : interpolate;
    return this.attrTween(name, typeof value$$1 === "function"
        ? (fullname.local ? attrFunctionNS$1 : attrFunction$1)(fullname, i, tweenValue(this, "attr." + name, value$$1))
        : value$$1 == null ? (fullname.local ? attrRemoveNS$1 : attrRemove$1)(fullname)
        : (fullname.local ? attrConstantNS$1 : attrConstant$1)(fullname, i, value$$1));
  }

  function attrInterpolate(name, i) {
    return function(t) {
      this.setAttribute(name, i(t));
    };
  }

  function attrInterpolateNS(fullname, i) {
    return function(t) {
      this.setAttributeNS(fullname.space, fullname.local, i(t));
    };
  }

  function attrTweenNS(fullname, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolateNS(fullname, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function attrTween(name, value) {
    var t0, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t0 = (i0 = i) && attrInterpolate(name, i);
      return t0;
    }
    tween._value = value;
    return tween;
  }

  function transition_attrTween(name, value) {
    var key = "attr." + name;
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    var fullname = namespace(name);
    return this.tween(key, (fullname.local ? attrTweenNS : attrTween)(fullname, value));
  }

  function delayFunction(id, value) {
    return function() {
      init(this, id).delay = +value.apply(this, arguments);
    };
  }

  function delayConstant(id, value) {
    return value = +value, function() {
      init(this, id).delay = value;
    };
  }

  function transition_delay(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? delayFunction
            : delayConstant)(id, value))
        : get$1(this.node(), id).delay;
  }

  function durationFunction(id, value) {
    return function() {
      set$2(this, id).duration = +value.apply(this, arguments);
    };
  }

  function durationConstant(id, value) {
    return value = +value, function() {
      set$2(this, id).duration = value;
    };
  }

  function transition_duration(value) {
    var id = this._id;

    return arguments.length
        ? this.each((typeof value === "function"
            ? durationFunction
            : durationConstant)(id, value))
        : get$1(this.node(), id).duration;
  }

  function easeConstant(id, value) {
    if (typeof value !== "function") throw new Error;
    return function() {
      set$2(this, id).ease = value;
    };
  }

  function transition_ease(value) {
    var id = this._id;

    return arguments.length
        ? this.each(easeConstant(id, value))
        : get$1(this.node(), id).ease;
  }

  function transition_filter(match) {
    if (typeof match !== "function") match = matcher(match);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = [], node, i = 0; i < n; ++i) {
        if ((node = group[i]) && match.call(node, node.__data__, i, group)) {
          subgroup.push(node);
        }
      }
    }

    return new Transition(subgroups, this._parents, this._name, this._id);
  }

  function transition_merge(transition$$1) {
    if (transition$$1._id !== this._id) throw new Error;

    for (var groups0 = this._groups, groups1 = transition$$1._groups, m0 = groups0.length, m1 = groups1.length, m = Math.min(m0, m1), merges = new Array(m0), j = 0; j < m; ++j) {
      for (var group0 = groups0[j], group1 = groups1[j], n = group0.length, merge = merges[j] = new Array(n), node, i = 0; i < n; ++i) {
        if (node = group0[i] || group1[i]) {
          merge[i] = node;
        }
      }
    }

    for (; j < m0; ++j) {
      merges[j] = groups0[j];
    }

    return new Transition(merges, this._parents, this._name, this._id);
  }

  function start(name) {
    return (name + "").trim().split(/^|\s+/).every(function(t) {
      var i = t.indexOf(".");
      if (i >= 0) t = t.slice(0, i);
      return !t || t === "start";
    });
  }

  function onFunction(id, name, listener) {
    var on0, on1, sit = start(name) ? init : set$2;
    return function() {
      var schedule$$1 = sit(this, id),
          on = schedule$$1.on;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0) (on1 = (on0 = on).copy()).on(name, listener);

      schedule$$1.on = on1;
    };
  }

  function transition_on(name, listener) {
    var id = this._id;

    return arguments.length < 2
        ? get$1(this.node(), id).on.on(name)
        : this.each(onFunction(id, name, listener));
  }

  function removeFunction(id) {
    return function() {
      var parent = this.parentNode;
      for (var i in this.__transition) if (+i !== id) return;
      if (parent) parent.removeChild(this);
    };
  }

  function transition_remove() {
    return this.on("end.remove", removeFunction(this._id));
  }

  function transition_select(select$$1) {
    var name = this._name,
        id = this._id;

    if (typeof select$$1 !== "function") select$$1 = selector(select$$1);

    for (var groups = this._groups, m = groups.length, subgroups = new Array(m), j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, subgroup = subgroups[j] = new Array(n), node, subnode, i = 0; i < n; ++i) {
        if ((node = group[i]) && (subnode = select$$1.call(node, node.__data__, i, group))) {
          if ("__data__" in node) subnode.__data__ = node.__data__;
          subgroup[i] = subnode;
          schedule(subgroup[i], name, id, i, subgroup, get$1(node, id));
        }
      }
    }

    return new Transition(subgroups, this._parents, name, id);
  }

  function transition_selectAll(select$$1) {
    var name = this._name,
        id = this._id;

    if (typeof select$$1 !== "function") select$$1 = selectorAll(select$$1);

    for (var groups = this._groups, m = groups.length, subgroups = [], parents = [], j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          for (var children = select$$1.call(node, node.__data__, i, group), child, inherit = get$1(node, id), k = 0, l = children.length; k < l; ++k) {
            if (child = children[k]) {
              schedule(child, name, id, k, children, inherit);
            }
          }
          subgroups.push(children);
          parents.push(node);
        }
      }
    }

    return new Transition(subgroups, parents, name, id);
  }

  var Selection$1 = selection.prototype.constructor;

  function transition_selection() {
    return new Selection$1(this._groups, this._parents);
  }

  function styleNull(name, interpolate$$1) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          string1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : interpolate0 = interpolate$$1(string00 = string0, string10 = string1);
    };
  }

  function styleRemove$1(name) {
    return function() {
      this.style.removeProperty(name);
    };
  }

  function styleConstant$1(name, interpolate$$1, value1) {
    var string00,
        string1 = value1 + "",
        interpolate0;
    return function() {
      var string0 = styleValue(this, name);
      return string0 === string1 ? null
          : string0 === string00 ? interpolate0
          : interpolate0 = interpolate$$1(string00 = string0, value1);
    };
  }

  function styleFunction$1(name, interpolate$$1, value$$1) {
    var string00,
        string10,
        interpolate0;
    return function() {
      var string0 = styleValue(this, name),
          value1 = value$$1(this),
          string1 = value1 + "";
      if (value1 == null) string1 = value1 = (this.style.removeProperty(name), styleValue(this, name));
      return string0 === string1 ? null
          : string0 === string00 && string1 === string10 ? interpolate0
          : (string10 = string1, interpolate0 = interpolate$$1(string00 = string0, value1));
    };
  }

  function styleMaybeRemove(id, name) {
    var on0, on1, listener0, key = "style." + name, event$$1 = "end." + key, remove;
    return function() {
      var schedule$$1 = set$2(this, id),
          on = schedule$$1.on,
          listener = schedule$$1.value[key] == null ? remove || (remove = styleRemove$1(name)) : undefined;

      // If this node shared a dispatch with the previous node,
      // just assign the updated shared dispatch and we’re done!
      // Otherwise, copy-on-write.
      if (on !== on0 || listener0 !== listener) (on1 = (on0 = on).copy()).on(event$$1, listener0 = listener);

      schedule$$1.on = on1;
    };
  }

  function transition_style(name, value$$1, priority) {
    var i = (name += "") === "transform" ? interpolateTransformCss : interpolate;
    return value$$1 == null ? this
        .styleTween(name, styleNull(name, i))
        .on("end.style." + name, styleRemove$1(name))
      : typeof value$$1 === "function" ? this
        .styleTween(name, styleFunction$1(name, i, tweenValue(this, "style." + name, value$$1)))
        .each(styleMaybeRemove(this._id, name))
      : this
        .styleTween(name, styleConstant$1(name, i, value$$1), priority)
        .on("end.style." + name, null);
  }

  function styleInterpolate(name, i, priority) {
    return function(t) {
      this.style.setProperty(name, i(t), priority);
    };
  }

  function styleTween(name, value, priority) {
    var t, i0;
    function tween() {
      var i = value.apply(this, arguments);
      if (i !== i0) t = (i0 = i) && styleInterpolate(name, i, priority);
      return t;
    }
    tween._value = value;
    return tween;
  }

  function transition_styleTween(name, value, priority) {
    var key = "style." + (name += "");
    if (arguments.length < 2) return (key = this.tween(key)) && key._value;
    if (value == null) return this.tween(key, null);
    if (typeof value !== "function") throw new Error;
    return this.tween(key, styleTween(name, value, priority == null ? "" : priority));
  }

  function textConstant$1(value) {
    return function() {
      this.textContent = value;
    };
  }

  function textFunction$1(value) {
    return function() {
      var value1 = value(this);
      this.textContent = value1 == null ? "" : value1;
    };
  }

  function transition_text(value) {
    return this.tween("text", typeof value === "function"
        ? textFunction$1(tweenValue(this, "text", value))
        : textConstant$1(value == null ? "" : value + ""));
  }

  function transition_transition() {
    var name = this._name,
        id0 = this._id,
        id1 = newId();

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          var inherit = get$1(node, id0);
          schedule(node, name, id1, i, group, {
            time: inherit.time + inherit.delay + inherit.duration,
            delay: 0,
            duration: inherit.duration,
            ease: inherit.ease
          });
        }
      }
    }

    return new Transition(groups, this._parents, name, id1);
  }

  function transition_end() {
    var on0, on1, that = this, id = that._id, size = that.size();
    return new Promise(function(resolve, reject) {
      var cancel = {value: reject},
          end = {value: function() { if (--size === 0) resolve(); }};

      that.each(function() {
        var schedule$$1 = set$2(this, id),
            on = schedule$$1.on;

        // If this node shared a dispatch with the previous node,
        // just assign the updated shared dispatch and we’re done!
        // Otherwise, copy-on-write.
        if (on !== on0) {
          on1 = (on0 = on).copy();
          on1._.cancel.push(cancel);
          on1._.interrupt.push(cancel);
          on1._.end.push(end);
        }

        schedule$$1.on = on1;
      });
    });
  }

  var id$1 = 0;

  function Transition(groups, parents, name, id) {
    this._groups = groups;
    this._parents = parents;
    this._name = name;
    this._id = id;
  }

  function transition(name) {
    return selection().transition(name);
  }

  function newId() {
    return ++id$1;
  }

  var selection_prototype = selection.prototype;

  Transition.prototype = transition.prototype = {
    constructor: Transition,
    select: transition_select,
    selectAll: transition_selectAll,
    filter: transition_filter,
    merge: transition_merge,
    selection: transition_selection,
    transition: transition_transition,
    call: selection_prototype.call,
    nodes: selection_prototype.nodes,
    node: selection_prototype.node,
    size: selection_prototype.size,
    empty: selection_prototype.empty,
    each: selection_prototype.each,
    on: transition_on,
    attr: transition_attr,
    attrTween: transition_attrTween,
    style: transition_style,
    styleTween: transition_styleTween,
    text: transition_text,
    remove: transition_remove,
    tween: transition_tween,
    delay: transition_delay,
    duration: transition_duration,
    ease: transition_ease,
    end: transition_end
  };

  function cubicInOut(t) {
    return ((t *= 2) <= 1 ? t * t * t : (t -= 2) * t * t + 2) / 2;
  }

  var pi = Math.PI;

  var tau = 2 * Math.PI;

  var defaultTiming = {
    time: null, // Set on use.
    delay: 0,
    duration: 250,
    ease: cubicInOut
  };

  function inherit(node, id) {
    var timing;
    while (!(timing = node.__transition) || !(timing = timing[id])) {
      if (!(node = node.parentNode)) {
        return defaultTiming.time = now(), defaultTiming;
      }
    }
    return timing;
  }

  function selection_transition(name) {
    var id,
        timing;

    if (name instanceof Transition) {
      id = name._id, name = name._name;
    } else {
      id = newId(), (timing = defaultTiming).time = now(), name = name == null ? null : name + "";
    }

    for (var groups = this._groups, m = groups.length, j = 0; j < m; ++j) {
      for (var group = groups[j], n = group.length, node, i = 0; i < n; ++i) {
        if (node = group[i]) {
          schedule(node, name, id, i, group, timing || inherit(node, id));
        }
      }
    }

    return new Transition(groups, this._parents, name, id);
  }

  selection.prototype.interrupt = selection_interrupt;
  selection.prototype.transition = selection_transition;

  function constant$3(x) {
    return function() {
      return x;
    };
  }

  function ZoomEvent(target, type, transform) {
    this.target = target;
    this.type = type;
    this.transform = transform;
  }

  function Transform(k, x, y) {
    this.k = k;
    this.x = x;
    this.y = y;
  }

  Transform.prototype = {
    constructor: Transform,
    scale: function(k) {
      return k === 1 ? this : new Transform(this.k * k, this.x, this.y);
    },
    translate: function(x, y) {
      return x === 0 & y === 0 ? this : new Transform(this.k, this.x + this.k * x, this.y + this.k * y);
    },
    apply: function(point) {
      return [point[0] * this.k + this.x, point[1] * this.k + this.y];
    },
    applyX: function(x) {
      return x * this.k + this.x;
    },
    applyY: function(y) {
      return y * this.k + this.y;
    },
    invert: function(location) {
      return [(location[0] - this.x) / this.k, (location[1] - this.y) / this.k];
    },
    invertX: function(x) {
      return (x - this.x) / this.k;
    },
    invertY: function(y) {
      return (y - this.y) / this.k;
    },
    rescaleX: function(x) {
      return x.copy().domain(x.range().map(this.invertX, this).map(x.invert, x));
    },
    rescaleY: function(y) {
      return y.copy().domain(y.range().map(this.invertY, this).map(y.invert, y));
    },
    toString: function() {
      return "translate(" + this.x + "," + this.y + ") scale(" + this.k + ")";
    }
  };

  var identity$1 = new Transform(1, 0, 0);

  transform.prototype = Transform.prototype;

  function transform(node) {
    return node.__zoom || identity$1;
  }

  function nopropagation$1() {
    event.stopImmediatePropagation();
  }

  function noevent$1() {
    event.preventDefault();
    event.stopImmediatePropagation();
  }

  // Ignore right-click, since that should open the context menu.
  function defaultFilter$1() {
    return !event.button;
  }

  function defaultExtent() {
    var e = this, w, h;
    if (e instanceof SVGElement) {
      e = e.ownerSVGElement || e;
      w = e.width.baseVal.value;
      h = e.height.baseVal.value;
    } else {
      w = e.clientWidth;
      h = e.clientHeight;
    }
    return [[0, 0], [w, h]];
  }

  function defaultTransform() {
    return this.__zoom || identity$1;
  }

  function defaultWheelDelta() {
    return -event.deltaY * (event.deltaMode ? 120 : 1) / 500;
  }

  function defaultTouchable$1() {
    return "ontouchstart" in this;
  }

  function defaultConstrain(transform$$1, extent, translateExtent) {
    var dx0 = transform$$1.invertX(extent[0][0]) - translateExtent[0][0],
        dx1 = transform$$1.invertX(extent[1][0]) - translateExtent[1][0],
        dy0 = transform$$1.invertY(extent[0][1]) - translateExtent[0][1],
        dy1 = transform$$1.invertY(extent[1][1]) - translateExtent[1][1];
    return transform$$1.translate(
      dx1 > dx0 ? (dx0 + dx1) / 2 : Math.min(0, dx0) || Math.max(0, dx1),
      dy1 > dy0 ? (dy0 + dy1) / 2 : Math.min(0, dy0) || Math.max(0, dy1)
    );
  }

  function d3Zoom() {
    var filter = defaultFilter$1,
        extent = defaultExtent,
        constrain = defaultConstrain,
        wheelDelta = defaultWheelDelta,
        touchable = defaultTouchable$1,
        scaleExtent = [0, Infinity],
        translateExtent = [[-Infinity, -Infinity], [Infinity, Infinity]],
        duration = 250,
        interpolate = interpolateZoom,
        gestures = [],
        listeners = dispatch("start", "zoom", "end"),
        touchstarting,
        touchending,
        touchDelay = 500,
        wheelDelay = 150,
        clickDistance2 = 0;

    function zoom(selection$$1) {
      selection$$1
          .property("__zoom", defaultTransform)
          .on("wheel.zoom", wheeled)
          .on("mousedown.zoom", mousedowned)
          .on("dblclick.zoom", dblclicked)
        .filter(touchable)
          .on("touchstart.zoom", touchstarted)
          .on("touchmove.zoom", touchmoved)
          .on("touchend.zoom touchcancel.zoom", touchended)
          .style("touch-action", "none")
          .style("-webkit-tap-highlight-color", "rgba(0,0,0,0)");
    }

    zoom.transform = function(collection, transform$$1) {
      var selection$$1 = collection.selection ? collection.selection() : collection;
      selection$$1.property("__zoom", defaultTransform);
      if (collection !== selection$$1) {
        schedule(collection, transform$$1);
      } else {
        selection$$1.interrupt().each(function() {
          gesture(this, arguments)
              .start()
              .zoom(null, typeof transform$$1 === "function" ? transform$$1.apply(this, arguments) : transform$$1)
              .end();
        });
      }
    };

    zoom.scaleBy = function(selection$$1, k) {
      zoom.scaleTo(selection$$1, function() {
        var k0 = this.__zoom.k,
            k1 = typeof k === "function" ? k.apply(this, arguments) : k;
        return k0 * k1;
      });
    };

    zoom.scaleTo = function(selection$$1, k) {
      zoom.transform(selection$$1, function() {
        var e = extent.apply(this, arguments),
            t0 = this.__zoom,
            p0 = centroid(e),
            p1 = t0.invert(p0),
            k1 = typeof k === "function" ? k.apply(this, arguments) : k;
        return constrain(translate(scale(t0, k1), p0, p1), e, translateExtent);
      });
    };

    zoom.translateBy = function(selection$$1, x, y) {
      zoom.transform(selection$$1, function() {
        return constrain(this.__zoom.translate(
          typeof x === "function" ? x.apply(this, arguments) : x,
          typeof y === "function" ? y.apply(this, arguments) : y
        ), extent.apply(this, arguments), translateExtent);
      });
    };

    zoom.translateTo = function(selection$$1, x, y) {
      zoom.transform(selection$$1, function() {
        var e = extent.apply(this, arguments),
            t = this.__zoom,
            p = centroid(e);
        return constrain(identity$1.translate(p[0], p[1]).scale(t.k).translate(
          typeof x === "function" ? -x.apply(this, arguments) : -x,
          typeof y === "function" ? -y.apply(this, arguments) : -y
        ), e, translateExtent);
      });
    };

    function scale(transform$$1, k) {
      k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], k));
      return k === transform$$1.k ? transform$$1 : new Transform(k, transform$$1.x, transform$$1.y);
    }

    function translate(transform$$1, p0, p1) {
      var x = p0[0] - p1[0] * transform$$1.k, y = p0[1] - p1[1] * transform$$1.k;
      return x === transform$$1.x && y === transform$$1.y ? transform$$1 : new Transform(transform$$1.k, x, y);
    }

    function centroid(extent) {
      return [(+extent[0][0] + +extent[1][0]) / 2, (+extent[0][1] + +extent[1][1]) / 2];
    }

    function schedule(transition$$1, transform$$1, center) {
      transition$$1
          .on("start.zoom", function() { gesture(this, arguments).start(); })
          .on("interrupt.zoom end.zoom", function() { gesture(this, arguments).end(); })
          .tween("zoom", function() {
            var that = this,
                args = arguments,
                g = gesture(that, args),
                e = extent.apply(that, args),
                p = center || centroid(e),
                w = Math.max(e[1][0] - e[0][0], e[1][1] - e[0][1]),
                a = that.__zoom,
                b = typeof transform$$1 === "function" ? transform$$1.apply(that, args) : transform$$1,
                i = interpolate(a.invert(p).concat(w / a.k), b.invert(p).concat(w / b.k));
            return function(t) {
              if (t === 1) t = b; // Avoid rounding error on end.
              else { var l = i(t), k = w / l[2]; t = new Transform(k, p[0] - l[0] * k, p[1] - l[1] * k); }
              g.zoom(null, t);
            };
          });
    }

    function gesture(that, args) {
      for (var i = 0, n = gestures.length, g; i < n; ++i) {
        if ((g = gestures[i]).that === that) {
          return g;
        }
      }
      return new Gesture(that, args);
    }

    function Gesture(that, args) {
      this.that = that;
      this.args = args;
      this.index = -1;
      this.active = 0;
      this.extent = extent.apply(that, args);
    }

    Gesture.prototype = {
      start: function() {
        if (++this.active === 1) {
          this.index = gestures.push(this) - 1;
          this.emit("start");
        }
        return this;
      },
      zoom: function(key, transform$$1) {
        if (this.mouse && key !== "mouse") this.mouse[1] = transform$$1.invert(this.mouse[0]);
        if (this.touch0 && key !== "touch") this.touch0[1] = transform$$1.invert(this.touch0[0]);
        if (this.touch1 && key !== "touch") this.touch1[1] = transform$$1.invert(this.touch1[0]);
        this.that.__zoom = transform$$1;
        this.emit("zoom");
        return this;
      },
      end: function() {
        if (--this.active === 0) {
          gestures.splice(this.index, 1);
          this.index = -1;
          this.emit("end");
        }
        return this;
      },
      emit: function(type) {
        customEvent(new ZoomEvent(zoom, type, this.that.__zoom), listeners.apply, listeners, [type, this.that, this.args]);
      }
    };

    function wheeled() {
      if (!filter.apply(this, arguments)) return;
      var g = gesture(this, arguments),
          t = this.__zoom,
          k = Math.max(scaleExtent[0], Math.min(scaleExtent[1], t.k * Math.pow(2, wheelDelta.apply(this, arguments)))),
          p = mouse(this);

      // If the mouse is in the same location as before, reuse it.
      // If there were recent wheel events, reset the wheel idle timeout.
      if (g.wheel) {
        if (g.mouse[0][0] !== p[0] || g.mouse[0][1] !== p[1]) {
          g.mouse[1] = t.invert(g.mouse[0] = p);
        }
        clearTimeout(g.wheel);
      }

      // If this wheel event won’t trigger a transform change, ignore it.
      else if (t.k === k) return;

      // Otherwise, capture the mouse point and location at the start.
      else {
        g.mouse = [p, t.invert(p)];
        interrupt(this);
        g.start();
      }

      noevent$1();
      g.wheel = setTimeout(wheelidled, wheelDelay);
      g.zoom("mouse", constrain(translate(scale(t, k), g.mouse[0], g.mouse[1]), g.extent, translateExtent));

      function wheelidled() {
        g.wheel = null;
        g.end();
      }
    }

    function mousedowned() {
      if (touchending || !filter.apply(this, arguments)) return;
      var g = gesture(this, arguments),
          v = select(event.view).on("mousemove.zoom", mousemoved, true).on("mouseup.zoom", mouseupped, true),
          p = mouse(this),
          x0 = event.clientX,
          y0 = event.clientY;

      nodrag(event.view);
      nopropagation$1();
      g.mouse = [p, this.__zoom.invert(p)];
      interrupt(this);
      g.start();

      function mousemoved() {
        noevent$1();
        if (!g.moved) {
          var dx = event.clientX - x0, dy = event.clientY - y0;
          g.moved = dx * dx + dy * dy > clickDistance2;
        }
        g.zoom("mouse", constrain(translate(g.that.__zoom, g.mouse[0] = mouse(g.that), g.mouse[1]), g.extent, translateExtent));
      }

      function mouseupped() {
        v.on("mousemove.zoom mouseup.zoom", null);
        yesdrag(event.view, g.moved);
        noevent$1();
        g.end();
      }
    }

    function dblclicked() {
      if (!filter.apply(this, arguments)) return;
      var t0 = this.__zoom,
          p0 = mouse(this),
          p1 = t0.invert(p0),
          k1 = t0.k * (event.shiftKey ? 0.5 : 2),
          t1 = constrain(translate(scale(t0, k1), p0, p1), extent.apply(this, arguments), translateExtent);

      noevent$1();
      if (duration > 0) select(this).transition().duration(duration).call(schedule, t1, p0);
      else select(this).call(zoom.transform, t1);
    }

    function touchstarted() {
      if (!filter.apply(this, arguments)) return;
      var g = gesture(this, arguments),
          touches$$1 = event.changedTouches,
          started,
          n = touches$$1.length, i, t, p;

      nopropagation$1();
      for (i = 0; i < n; ++i) {
        t = touches$$1[i], p = touch(this, touches$$1, t.identifier);
        p = [p, this.__zoom.invert(p), t.identifier];
        if (!g.touch0) g.touch0 = p, started = true;
        else if (!g.touch1) g.touch1 = p;
      }

      // If this is a dbltap, reroute to the (optional) dblclick.zoom handler.
      if (touchstarting) {
        touchstarting = clearTimeout(touchstarting);
        if (!g.touch1) {
          g.end();
          p = select(this).on("dblclick.zoom");
          if (p) p.apply(this, arguments);
          return;
        }
      }

      if (started) {
        touchstarting = setTimeout(function() { touchstarting = null; }, touchDelay);
        interrupt(this);
        g.start();
      }
    }

    function touchmoved() {
      var g = gesture(this, arguments),
          touches$$1 = event.changedTouches,
          n = touches$$1.length, i, t, p, l;

      noevent$1();
      if (touchstarting) touchstarting = clearTimeout(touchstarting);
      for (i = 0; i < n; ++i) {
        t = touches$$1[i], p = touch(this, touches$$1, t.identifier);
        if (g.touch0 && g.touch0[2] === t.identifier) g.touch0[0] = p;
        else if (g.touch1 && g.touch1[2] === t.identifier) g.touch1[0] = p;
      }
      t = g.that.__zoom;
      if (g.touch1) {
        var p0 = g.touch0[0], l0 = g.touch0[1],
            p1 = g.touch1[0], l1 = g.touch1[1],
            dp = (dp = p1[0] - p0[0]) * dp + (dp = p1[1] - p0[1]) * dp,
            dl = (dl = l1[0] - l0[0]) * dl + (dl = l1[1] - l0[1]) * dl;
        t = scale(t, Math.sqrt(dp / dl));
        p = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2];
        l = [(l0[0] + l1[0]) / 2, (l0[1] + l1[1]) / 2];
      }
      else if (g.touch0) p = g.touch0[0], l = g.touch0[1];
      else return;
      g.zoom("touch", constrain(translate(t, p, l), g.extent, translateExtent));
    }

    function touchended() {
      var g = gesture(this, arguments),
          touches$$1 = event.changedTouches,
          n = touches$$1.length, i, t;

      nopropagation$1();
      if (touchending) clearTimeout(touchending);
      touchending = setTimeout(function() { touchending = null; }, touchDelay);
      for (i = 0; i < n; ++i) {
        t = touches$$1[i];
        if (g.touch0 && g.touch0[2] === t.identifier) delete g.touch0;
        else if (g.touch1 && g.touch1[2] === t.identifier) delete g.touch1;
      }
      if (g.touch1 && !g.touch0) g.touch0 = g.touch1, delete g.touch1;
      if (g.touch0) g.touch0[1] = this.__zoom.invert(g.touch0[0]);
      else g.end();
    }

    zoom.wheelDelta = function(_) {
      return arguments.length ? (wheelDelta = typeof _ === "function" ? _ : constant$3(+_), zoom) : wheelDelta;
    };

    zoom.filter = function(_) {
      return arguments.length ? (filter = typeof _ === "function" ? _ : constant$3(!!_), zoom) : filter;
    };

    zoom.touchable = function(_) {
      return arguments.length ? (touchable = typeof _ === "function" ? _ : constant$3(!!_), zoom) : touchable;
    };

    zoom.extent = function(_) {
      return arguments.length ? (extent = typeof _ === "function" ? _ : constant$3([[+_[0][0], +_[0][1]], [+_[1][0], +_[1][1]]]), zoom) : extent;
    };

    zoom.scaleExtent = function(_) {
      return arguments.length ? (scaleExtent[0] = +_[0], scaleExtent[1] = +_[1], zoom) : [scaleExtent[0], scaleExtent[1]];
    };

    zoom.translateExtent = function(_) {
      return arguments.length ? (translateExtent[0][0] = +_[0][0], translateExtent[1][0] = +_[1][0], translateExtent[0][1] = +_[0][1], translateExtent[1][1] = +_[1][1], zoom) : [[translateExtent[0][0], translateExtent[0][1]], [translateExtent[1][0], translateExtent[1][1]]];
    };

    zoom.constrain = function(_) {
      return arguments.length ? (constrain = _, zoom) : constrain;
    };

    zoom.duration = function(_) {
      return arguments.length ? (duration = +_, zoom) : duration;
    };

    zoom.interpolate = function(_) {
      return arguments.length ? (interpolate = _, zoom) : interpolate;
    };

    zoom.on = function() {
      var value$$1 = listeners.on.apply(listeners, arguments);
      return value$$1 === listeners ? zoom : value$$1;
    };

    zoom.clickDistance = function(_) {
      return arguments.length ? (clickDistance2 = (_ = +_) * _, zoom) : Math.sqrt(clickDistance2);
    };

    return zoom;
  }

  var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as the `TypeError` message for "Functions" methods. */
  var FUNC_ERROR_TEXT = 'Expected a function';

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal == 'object' && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root$2 = freeGlobal || freeSelf || Function('return this')();

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max,
      nativeMin = Math.min;

  /**
   * Gets the timestamp of the number of milliseconds that have elapsed since
   * the Unix epoch (1 January 1970 00:00:00 UTC).
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Date
   * @returns {number} Returns the timestamp.
   * @example
   *
   * _.defer(function(stamp) {
   *   console.log(_.now() - stamp);
   * }, _.now());
   * // => Logs the number of milliseconds it took for the deferred invocation.
   */
  var now$1 = function() {
    return root$2.Date.now();
  };

  /**
   * Creates a debounced function that delays invoking `func` until after `wait`
   * milliseconds have elapsed since the last time the debounced function was
   * invoked. The debounced function comes with a `cancel` method to cancel
   * delayed `func` invocations and a `flush` method to immediately invoke them.
   * Provide `options` to indicate whether `func` should be invoked on the
   * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
   * with the last arguments provided to the debounced function. Subsequent
   * calls to the debounced function return the result of the last `func`
   * invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the debounced function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.debounce` and `_.throttle`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to debounce.
   * @param {number} [wait=0] The number of milliseconds to delay.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=false]
   *  Specify invoking on the leading edge of the timeout.
   * @param {number} [options.maxWait]
   *  The maximum time `func` is allowed to be delayed before it's invoked.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new debounced function.
   * @example
   *
   * // Avoid costly calculations while the window size is in flux.
   * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
   *
   * // Invoke `sendMail` when clicked, debouncing subsequent calls.
   * jQuery(element).on('click', _.debounce(sendMail, 300, {
   *   'leading': true,
   *   'trailing': false
   * }));
   *
   * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
   * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
   * var source = new EventSource('/stream');
   * jQuery(source).on('message', debounced);
   *
   * // Cancel the trailing debounced invocation.
   * jQuery(window).on('popstate', debounced.cancel);
   */
  function debounce(func, wait, options) {
    var lastArgs,
        lastThis,
        maxWait,
        result,
        timerId,
        lastCallTime,
        lastInvokeTime = 0,
        leading = false,
        maxing = false,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    wait = toNumber(wait) || 0;
    if (isObject(options)) {
      leading = !!options.leading;
      maxing = 'maxWait' in options;
      maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }

    function invokeFunc(time) {
      var args = lastArgs,
          thisArg = lastThis;

      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = func.apply(thisArg, args);
      return result;
    }

    function leadingEdge(time) {
      // Reset any `maxWait` timer.
      lastInvokeTime = time;
      // Start the timer for the trailing edge.
      timerId = setTimeout(timerExpired, wait);
      // Invoke the leading edge.
      return leading ? invokeFunc(time) : result;
    }

    function remainingWait(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime,
          result = wait - timeSinceLastCall;

      return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
    }

    function shouldInvoke(time) {
      var timeSinceLastCall = time - lastCallTime,
          timeSinceLastInvoke = time - lastInvokeTime;

      // Either this is the first call, activity has stopped and we're at the
      // trailing edge, the system time has gone backwards and we're treating
      // it as the trailing edge, or we've hit the `maxWait` limit.
      return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
        (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
    }

    function timerExpired() {
      var time = now$1();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      // Restart the timer.
      timerId = setTimeout(timerExpired, remainingWait(time));
    }

    function trailingEdge(time) {
      timerId = undefined;

      // Only invoke if we have `lastArgs` which means `func` has been
      // debounced at least once.
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      lastArgs = lastThis = undefined;
      return result;
    }

    function cancel() {
      if (timerId !== undefined) {
        clearTimeout(timerId);
      }
      lastInvokeTime = 0;
      lastArgs = lastCallTime = lastThis = timerId = undefined;
    }

    function flush() {
      return timerId === undefined ? result : trailingEdge(now$1());
    }

    function debounced() {
      var time = now$1(),
          isInvoking = shouldInvoke(time);

      lastArgs = arguments;
      lastThis = this;
      lastCallTime = time;

      if (isInvoking) {
        if (timerId === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxing) {
          // Handle invocations in a tight loop.
          timerId = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timerId === undefined) {
        timerId = setTimeout(timerExpired, wait);
      }
      return result;
    }
    debounced.cancel = cancel;
    debounced.flush = flush;
    return debounced;
  }

  /**
   * Creates a throttled function that only invokes `func` at most once per
   * every `wait` milliseconds. The throttled function comes with a `cancel`
   * method to cancel delayed `func` invocations and a `flush` method to
   * immediately invoke them. Provide `options` to indicate whether `func`
   * should be invoked on the leading and/or trailing edge of the `wait`
   * timeout. The `func` is invoked with the last arguments provided to the
   * throttled function. Subsequent calls to the throttled function return the
   * result of the last `func` invocation.
   *
   * **Note:** If `leading` and `trailing` options are `true`, `func` is
   * invoked on the trailing edge of the timeout only if the throttled function
   * is invoked more than once during the `wait` timeout.
   *
   * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
   * until to the next tick, similar to `setTimeout` with a timeout of `0`.
   *
   * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
   * for details over the differences between `_.throttle` and `_.debounce`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Function
   * @param {Function} func The function to throttle.
   * @param {number} [wait=0] The number of milliseconds to throttle invocations to.
   * @param {Object} [options={}] The options object.
   * @param {boolean} [options.leading=true]
   *  Specify invoking on the leading edge of the timeout.
   * @param {boolean} [options.trailing=true]
   *  Specify invoking on the trailing edge of the timeout.
   * @returns {Function} Returns the new throttled function.
   * @example
   *
   * // Avoid excessively updating the position while scrolling.
   * jQuery(window).on('scroll', _.throttle(updatePosition, 100));
   *
   * // Invoke `renewToken` when the click event is fired, but not more than once every 5 minutes.
   * var throttled = _.throttle(renewToken, 300000, { 'trailing': false });
   * jQuery(element).on('click', throttled);
   *
   * // Cancel the trailing throttled invocation.
   * jQuery(window).on('popstate', throttled.cancel);
   */
  function throttle(func, wait, options) {
    var leading = true,
        trailing = true;

    if (typeof func != 'function') {
      throw new TypeError(FUNC_ERROR_TEXT);
    }
    if (isObject(options)) {
      leading = 'leading' in options ? !!options.leading : leading;
      trailing = 'trailing' in options ? !!options.trailing : trailing;
    }
    return debounce(func, wait, {
      'leading': leading,
      'maxWait': wait,
      'trailing': trailing
    });
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && objectToString.call(value) == symbolTag);
  }

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var lodash_throttle = throttle;

  var Tween = createCommonjsModule(function (module, exports) {
  /**
   * Tween.js - Licensed under the MIT license
   * https://github.com/tweenjs/tween.js
   * ----------------------------------------------
   *
   * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
   * Thank you all, you're awesome!
   */


  var _Group = function () {
  	this._tweens = {};
  	this._tweensAddedDuringUpdate = {};
  };

  _Group.prototype = {
  	getAll: function () {

  		return Object.keys(this._tweens).map(function (tweenId) {
  			return this._tweens[tweenId];
  		}.bind(this));

  	},

  	removeAll: function () {

  		this._tweens = {};

  	},

  	add: function (tween) {

  		this._tweens[tween.getId()] = tween;
  		this._tweensAddedDuringUpdate[tween.getId()] = tween;

  	},

  	remove: function (tween) {

  		delete this._tweens[tween.getId()];
  		delete this._tweensAddedDuringUpdate[tween.getId()];

  	},

  	update: function (time, preserve) {

  		var tweenIds = Object.keys(this._tweens);

  		if (tweenIds.length === 0) {
  			return false;
  		}

  		time = time !== undefined ? time : TWEEN.now();

  		// Tweens are updated in "batches". If you add a new tween during an update, then the
  		// new tween will be updated in the next batch.
  		// If you remove a tween during an update, it may or may not be updated. However,
  		// if the removed tween was added during the current batch, then it will not be updated.
  		while (tweenIds.length > 0) {
  			this._tweensAddedDuringUpdate = {};

  			for (var i = 0; i < tweenIds.length; i++) {

  				var tween = this._tweens[tweenIds[i]];

  				if (tween && tween.update(time) === false) {
  					tween._isPlaying = false;

  					if (!preserve) {
  						delete this._tweens[tweenIds[i]];
  					}
  				}
  			}

  			tweenIds = Object.keys(this._tweensAddedDuringUpdate);
  		}

  		return true;

  	}
  };

  var TWEEN = new _Group();

  TWEEN.Group = _Group;
  TWEEN._nextId = 0;
  TWEEN.nextId = function () {
  	return TWEEN._nextId++;
  };


  // Include a performance.now polyfill.
  // In node.js, use process.hrtime.
  if (typeof (window) === 'undefined' && typeof (process) !== 'undefined' && process.hrtime) {
  	TWEEN.now = function () {
  		var time = process.hrtime();

  		// Convert [seconds, nanoseconds] to milliseconds.
  		return time[0] * 1000 + time[1] / 1000000;
  	};
  }
  // In a browser, use window.performance.now if it is available.
  else if (typeof (window) !== 'undefined' &&
           window.performance !== undefined &&
  		 window.performance.now !== undefined) {
  	// This must be bound, because directly assigning this function
  	// leads to an invocation exception in Chrome.
  	TWEEN.now = window.performance.now.bind(window.performance);
  }
  // Use Date.now if it is available.
  else if (Date.now !== undefined) {
  	TWEEN.now = Date.now;
  }
  // Otherwise, use 'new Date().getTime()'.
  else {
  	TWEEN.now = function () {
  		return new Date().getTime();
  	};
  }


  TWEEN.Tween = function (object, group) {
  	this._object = object;
  	this._valuesStart = {};
  	this._valuesEnd = {};
  	this._valuesStartRepeat = {};
  	this._duration = 1000;
  	this._repeat = 0;
  	this._repeatDelayTime = undefined;
  	this._yoyo = false;
  	this._isPlaying = false;
  	this._reversed = false;
  	this._delayTime = 0;
  	this._startTime = null;
  	this._easingFunction = TWEEN.Easing.Linear.None;
  	this._interpolationFunction = TWEEN.Interpolation.Linear;
  	this._chainedTweens = [];
  	this._onStartCallback = null;
  	this._onStartCallbackFired = false;
  	this._onUpdateCallback = null;
  	this._onCompleteCallback = null;
  	this._onStopCallback = null;
  	this._group = group || TWEEN;
  	this._id = TWEEN.nextId();

  };

  TWEEN.Tween.prototype = {
  	getId: function getId() {
  		return this._id;
  	},

  	isPlaying: function isPlaying() {
  		return this._isPlaying;
  	},

  	to: function to(properties, duration) {

  		this._valuesEnd = properties;

  		if (duration !== undefined) {
  			this._duration = duration;
  		}

  		return this;

  	},

  	start: function start(time) {

  		this._group.add(this);

  		this._isPlaying = true;

  		this._onStartCallbackFired = false;

  		this._startTime = time !== undefined ? typeof time === 'string' ? TWEEN.now() + parseFloat(time) : time : TWEEN.now();
  		this._startTime += this._delayTime;

  		for (var property in this._valuesEnd) {

  			// Check if an Array was provided as property value
  			if (this._valuesEnd[property] instanceof Array) {

  				if (this._valuesEnd[property].length === 0) {
  					continue;
  				}

  				// Create a local copy of the Array with the start value at the front
  				this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);

  			}

  			// If `to()` specifies a property that doesn't exist in the source object,
  			// we should not set that property in the object
  			if (this._object[property] === undefined) {
  				continue;
  			}

  			// Save the starting value.
  			this._valuesStart[property] = this._object[property];

  			if ((this._valuesStart[property] instanceof Array) === false) {
  				this._valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
  			}

  			this._valuesStartRepeat[property] = this._valuesStart[property] || 0;

  		}

  		return this;

  	},

  	stop: function stop() {

  		if (!this._isPlaying) {
  			return this;
  		}

  		this._group.remove(this);
  		this._isPlaying = false;

  		if (this._onStopCallback !== null) {
  			this._onStopCallback(this._object);
  		}

  		this.stopChainedTweens();
  		return this;

  	},

  	end: function end() {

  		this.update(this._startTime + this._duration);
  		return this;

  	},

  	stopChainedTweens: function stopChainedTweens() {

  		for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
  			this._chainedTweens[i].stop();
  		}

  	},

  	group: function group(group) {
  		this._group = group;
  		return this;
  	},

  	delay: function delay(amount) {

  		this._delayTime = amount;
  		return this;

  	},

  	repeat: function repeat(times) {

  		this._repeat = times;
  		return this;

  	},

  	repeatDelay: function repeatDelay(amount) {

  		this._repeatDelayTime = amount;
  		return this;

  	},

  	yoyo: function yoyo(yy) {

  		this._yoyo = yy;
  		return this;

  	},

  	easing: function easing(eas) {

  		this._easingFunction = eas;
  		return this;

  	},

  	interpolation: function interpolation(inter) {

  		this._interpolationFunction = inter;
  		return this;

  	},

  	chain: function chain() {

  		this._chainedTweens = arguments;
  		return this;

  	},

  	onStart: function onStart(callback) {

  		this._onStartCallback = callback;
  		return this;

  	},

  	onUpdate: function onUpdate(callback) {

  		this._onUpdateCallback = callback;
  		return this;

  	},

  	onComplete: function onComplete(callback) {

  		this._onCompleteCallback = callback;
  		return this;

  	},

  	onStop: function onStop(callback) {

  		this._onStopCallback = callback;
  		return this;

  	},

  	update: function update(time) {

  		var property;
  		var elapsed;
  		var value;

  		if (time < this._startTime) {
  			return true;
  		}

  		if (this._onStartCallbackFired === false) {

  			if (this._onStartCallback !== null) {
  				this._onStartCallback(this._object);
  			}

  			this._onStartCallbackFired = true;
  		}

  		elapsed = (time - this._startTime) / this._duration;
  		elapsed = (this._duration === 0 || elapsed > 1) ? 1 : elapsed;

  		value = this._easingFunction(elapsed);

  		for (property in this._valuesEnd) {

  			// Don't update properties that do not exist in the source object
  			if (this._valuesStart[property] === undefined) {
  				continue;
  			}

  			var start = this._valuesStart[property] || 0;
  			var end = this._valuesEnd[property];

  			if (end instanceof Array) {

  				this._object[property] = this._interpolationFunction(end, value);

  			} else {

  				// Parses relative end values with start as base (e.g.: +10, -3)
  				if (typeof (end) === 'string') {

  					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
  						end = start + parseFloat(end);
  					} else {
  						end = parseFloat(end);
  					}
  				}

  				// Protect against non numeric properties.
  				if (typeof (end) === 'number') {
  					this._object[property] = start + (end - start) * value;
  				}

  			}

  		}

  		if (this._onUpdateCallback !== null) {
  			this._onUpdateCallback(this._object);
  		}

  		if (elapsed === 1) {

  			if (this._repeat > 0) {

  				if (isFinite(this._repeat)) {
  					this._repeat--;
  				}

  				// Reassign starting values, restart by making startTime = now
  				for (property in this._valuesStartRepeat) {

  					if (typeof (this._valuesEnd[property]) === 'string') {
  						this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property]);
  					}

  					if (this._yoyo) {
  						var tmp = this._valuesStartRepeat[property];

  						this._valuesStartRepeat[property] = this._valuesEnd[property];
  						this._valuesEnd[property] = tmp;
  					}

  					this._valuesStart[property] = this._valuesStartRepeat[property];

  				}

  				if (this._yoyo) {
  					this._reversed = !this._reversed;
  				}

  				if (this._repeatDelayTime !== undefined) {
  					this._startTime = time + this._repeatDelayTime;
  				} else {
  					this._startTime = time + this._delayTime;
  				}

  				return true;

  			} else {

  				if (this._onCompleteCallback !== null) {

  					this._onCompleteCallback(this._object);
  				}

  				for (var i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
  					// Make the chained tweens start exactly at the time they should,
  					// even if the `update()` method was called way past the duration of the tween
  					this._chainedTweens[i].start(this._startTime + this._duration);
  				}

  				return false;

  			}

  		}

  		return true;

  	}
  };


  TWEEN.Easing = {

  	Linear: {

  		None: function (k) {

  			return k;

  		}

  	},

  	Quadratic: {

  		In: function (k) {

  			return k * k;

  		},

  		Out: function (k) {

  			return k * (2 - k);

  		},

  		InOut: function (k) {

  			if ((k *= 2) < 1) {
  				return 0.5 * k * k;
  			}

  			return - 0.5 * (--k * (k - 2) - 1);

  		}

  	},

  	Cubic: {

  		In: function (k) {

  			return k * k * k;

  		},

  		Out: function (k) {

  			return --k * k * k + 1;

  		},

  		InOut: function (k) {

  			if ((k *= 2) < 1) {
  				return 0.5 * k * k * k;
  			}

  			return 0.5 * ((k -= 2) * k * k + 2);

  		}

  	},

  	Quartic: {

  		In: function (k) {

  			return k * k * k * k;

  		},

  		Out: function (k) {

  			return 1 - (--k * k * k * k);

  		},

  		InOut: function (k) {

  			if ((k *= 2) < 1) {
  				return 0.5 * k * k * k * k;
  			}

  			return - 0.5 * ((k -= 2) * k * k * k - 2);

  		}

  	},

  	Quintic: {

  		In: function (k) {

  			return k * k * k * k * k;

  		},

  		Out: function (k) {

  			return --k * k * k * k * k + 1;

  		},

  		InOut: function (k) {

  			if ((k *= 2) < 1) {
  				return 0.5 * k * k * k * k * k;
  			}

  			return 0.5 * ((k -= 2) * k * k * k * k + 2);

  		}

  	},

  	Sinusoidal: {

  		In: function (k) {

  			return 1 - Math.cos(k * Math.PI / 2);

  		},

  		Out: function (k) {

  			return Math.sin(k * Math.PI / 2);

  		},

  		InOut: function (k) {

  			return 0.5 * (1 - Math.cos(Math.PI * k));

  		}

  	},

  	Exponential: {

  		In: function (k) {

  			return k === 0 ? 0 : Math.pow(1024, k - 1);

  		},

  		Out: function (k) {

  			return k === 1 ? 1 : 1 - Math.pow(2, - 10 * k);

  		},

  		InOut: function (k) {

  			if (k === 0) {
  				return 0;
  			}

  			if (k === 1) {
  				return 1;
  			}

  			if ((k *= 2) < 1) {
  				return 0.5 * Math.pow(1024, k - 1);
  			}

  			return 0.5 * (- Math.pow(2, - 10 * (k - 1)) + 2);

  		}

  	},

  	Circular: {

  		In: function (k) {

  			return 1 - Math.sqrt(1 - k * k);

  		},

  		Out: function (k) {

  			return Math.sqrt(1 - (--k * k));

  		},

  		InOut: function (k) {

  			if ((k *= 2) < 1) {
  				return - 0.5 * (Math.sqrt(1 - k * k) - 1);
  			}

  			return 0.5 * (Math.sqrt(1 - (k -= 2) * k) + 1);

  		}

  	},

  	Elastic: {

  		In: function (k) {

  			if (k === 0) {
  				return 0;
  			}

  			if (k === 1) {
  				return 1;
  			}

  			return -Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);

  		},

  		Out: function (k) {

  			if (k === 0) {
  				return 0;
  			}

  			if (k === 1) {
  				return 1;
  			}

  			return Math.pow(2, -10 * k) * Math.sin((k - 0.1) * 5 * Math.PI) + 1;

  		},

  		InOut: function (k) {

  			if (k === 0) {
  				return 0;
  			}

  			if (k === 1) {
  				return 1;
  			}

  			k *= 2;

  			if (k < 1) {
  				return -0.5 * Math.pow(2, 10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI);
  			}

  			return 0.5 * Math.pow(2, -10 * (k - 1)) * Math.sin((k - 1.1) * 5 * Math.PI) + 1;

  		}

  	},

  	Back: {

  		In: function (k) {

  			var s = 1.70158;

  			return k * k * ((s + 1) * k - s);

  		},

  		Out: function (k) {

  			var s = 1.70158;

  			return --k * k * ((s + 1) * k + s) + 1;

  		},

  		InOut: function (k) {

  			var s = 1.70158 * 1.525;

  			if ((k *= 2) < 1) {
  				return 0.5 * (k * k * ((s + 1) * k - s));
  			}

  			return 0.5 * ((k -= 2) * k * ((s + 1) * k + s) + 2);

  		}

  	},

  	Bounce: {

  		In: function (k) {

  			return 1 - TWEEN.Easing.Bounce.Out(1 - k);

  		},

  		Out: function (k) {

  			if (k < (1 / 2.75)) {
  				return 7.5625 * k * k;
  			} else if (k < (2 / 2.75)) {
  				return 7.5625 * (k -= (1.5 / 2.75)) * k + 0.75;
  			} else if (k < (2.5 / 2.75)) {
  				return 7.5625 * (k -= (2.25 / 2.75)) * k + 0.9375;
  			} else {
  				return 7.5625 * (k -= (2.625 / 2.75)) * k + 0.984375;
  			}

  		},

  		InOut: function (k) {

  			if (k < 0.5) {
  				return TWEEN.Easing.Bounce.In(k * 2) * 0.5;
  			}

  			return TWEEN.Easing.Bounce.Out(k * 2 - 1) * 0.5 + 0.5;

  		}

  	}

  };

  TWEEN.Interpolation = {

  	Linear: function (v, k) {

  		var m = v.length - 1;
  		var f = m * k;
  		var i = Math.floor(f);
  		var fn = TWEEN.Interpolation.Utils.Linear;

  		if (k < 0) {
  			return fn(v[0], v[1], f);
  		}

  		if (k > 1) {
  			return fn(v[m], v[m - 1], m - f);
  		}

  		return fn(v[i], v[i + 1 > m ? m : i + 1], f - i);

  	},

  	Bezier: function (v, k) {

  		var b = 0;
  		var n = v.length - 1;
  		var pw = Math.pow;
  		var bn = TWEEN.Interpolation.Utils.Bernstein;

  		for (var i = 0; i <= n; i++) {
  			b += pw(1 - k, n - i) * pw(k, i) * v[i] * bn(n, i);
  		}

  		return b;

  	},

  	CatmullRom: function (v, k) {

  		var m = v.length - 1;
  		var f = m * k;
  		var i = Math.floor(f);
  		var fn = TWEEN.Interpolation.Utils.CatmullRom;

  		if (v[0] === v[m]) {

  			if (k < 0) {
  				i = Math.floor(f = m * (1 + k));
  			}

  			return fn(v[(i - 1 + m) % m], v[i], v[(i + 1) % m], v[(i + 2) % m], f - i);

  		} else {

  			if (k < 0) {
  				return v[0] - (fn(v[0], v[0], v[1], v[1], -f) - v[0]);
  			}

  			if (k > 1) {
  				return v[m] - (fn(v[m], v[m], v[m - 1], v[m - 1], f - m) - v[m]);
  			}

  			return fn(v[i ? i - 1 : 0], v[i], v[m < i + 1 ? m : i + 1], v[m < i + 2 ? m : i + 2], f - i);

  		}

  	},

  	Utils: {

  		Linear: function (p0, p1, t) {

  			return (p1 - p0) * t + p0;

  		},

  		Bernstein: function (n, i) {

  			var fc = TWEEN.Interpolation.Utils.Factorial;

  			return fc(n) / fc(i) / fc(n - i);

  		},

  		Factorial: (function () {

  			var a = [1];

  			return function (n) {

  				var s = 1;

  				if (a[n]) {
  					return a[n];
  				}

  				for (var i = n; i > 1; i--) {
  					s *= i;
  				}

  				a[n] = s;
  				return s;

  			};

  		})(),

  		CatmullRom: function (p0, p1, p2, p3, t) {

  			var v0 = (p2 - p0) * 0.5;
  			var v1 = (p3 - p1) * 0.5;
  			var t2 = t * t;
  			var t3 = t * t2;

  			return (2 * p1 - 2 * p2 + v0 + v1) * t3 + (- 3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 + v0 * t + p1;

  		}

  	}

  };

  // UMD (Universal Module Definition)
  (function (root) {

  	{

  		// Node.js
  		module.exports = TWEEN;

  	}

  })(commonjsGlobal);
  });

  var kapsule_min = createCommonjsModule(function (module, exports) {
  !function(n,t){module.exports=t();}("undefined"!=typeof self?self:commonjsGlobal,function(){return function(n){var t={};function e(r){if(t[r])return t[r].exports;var o=t[r]={i:r,l:!1,exports:{}};return n[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=n,e.c=t,e.d=function(n,t,r){e.o(n,t)||Object.defineProperty(n,t,{configurable:!1,enumerable:!0,get:r});},e.n=function(n){var t=n&&n.__esModule?function(){return n.default}:function(){return n};return e.d(t,"a",t),t},e.o=function(n,t){return Object.prototype.hasOwnProperty.call(n,t)},e.p="",e(e.s=0)}([function(n,t,e){var r,o,i;u=function(n,t,e){Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(n){var t=n.stateInit,e=void 0===t?function(){return {}}:t,r=n.props,a=void 0===r?{}:r,f=n.methods,l=void 0===f?{}:f,c=n.aliases,s=void 0===c?{}:c,d=n.init,p=void 0===d?function(){}:d,v=n.update,h=void 0===v?function(){}:v,y=Object.keys(a).map(function(n){return new u(n,a[n])});return function(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},t=Object.assign({},e instanceof Function?e(n):e,{initialised:!1});function r(t){return u(t,n),a(),r}var u=function(n,e){p.call(r,n,t,e),t.initialised=!0;},a=(0, o.default)(function(){t.initialised&&h.call(r,t);},1);return y.forEach(function(n){r[n.name]=function(n){var e=arguments.length>1&&void 0!==arguments[1]&&arguments[1],o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(n,t){};return function(i){return arguments.length?(t[n]=i,o.call(r,i,t),e&&a(),r):t[n]}}(n.name,n.triggerUpdate,n.onChange);}),Object.keys(l).forEach(function(n){r[n]=function(){for(var e,o=arguments.length,i=Array(o),u=0;u<o;u++)i[u]=arguments[u];return (e=l[n]).call.apply(e,[r,t].concat(i))};}),Object.entries(s).forEach(function(n){var t=i(n,2),e=t[0],o=t[1];return r[e]=r[o]}),r.resetProps=function(){return y.forEach(function(n){r[n.name](n.defaultVal);}),r},r.resetProps(),t._rerender=a,r}};var r,o=(r=e,r&&r.__esModule?r:{default:r});var i=function(){return function(n,t){if(Array.isArray(n))return n;if(Symbol.iterator in Object(n))return function(n,t){var e=[],r=!0,o=!1,i=void 0;try{for(var u,a=n[Symbol.iterator]();!(r=(u=a.next()).done)&&(e.push(u.value),!t||e.length!==t);r=!0);}catch(n){o=!0,i=n;}finally{try{!r&&a.return&&a.return();}finally{if(o)throw i}}return e}(n,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}}();var u=function n(t,e){var r=e.default,o=void 0===r?null:r,i=e.triggerUpdate,u=void 0===i||i,a=e.onChange,f=void 0===a?function(n,t){}:a;!function(n,t){if(!(n instanceof t))throw new TypeError("Cannot call a class as a function")}(this,n),this.name=t,this.defaultVal=o,this.triggerUpdate=u,this.onChange=f;};n.exports=t.default;},o=[n,t,e(1)],void 0===(i="function"==typeof(r=u)?r.apply(t,o):r)||(n.exports=i);var u;},function(n,t){n.exports=function(n,t,e){var r,o,i,u,a;null==t&&(t=100);function f(){var l=Date.now()-u;l<t&&l>=0?r=setTimeout(f,t-l):(r=null,e||(a=n.apply(i,o),i=o=null));}var l=function(){i=this,o=arguments,u=Date.now();var l=e&&!r;return r||(r=setTimeout(f,t)),l&&(a=n.apply(i,o),i=o=null),a};return l.clear=function(){r&&(clearTimeout(r),r=null);},l.flush=function(){r&&(a=n.apply(i,o),i=o=null,clearTimeout(r),r=null);},l};}])});
  });

  var Kapsule = unwrapExports(kapsule_min);
  var kapsule_min_1 = kapsule_min.Kapsule;

  var accessor_min = createCommonjsModule(function (module, exports) {
  !function(e,t){module.exports=t();}(commonjsGlobal,function(){return function(e){function t(o){if(n[o])return n[o].exports;var r=n[o]={i:o,l:!1,exports:{}};return e[o].call(r.exports,r,r.exports,t),r.l=!0,r.exports}var n={};return t.m=e,t.c=n,t.d=function(e,n,o){t.o(e,n)||Object.defineProperty(e,n,{configurable:!1,enumerable:!0,get:o});},t.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(n,"a",n),n},t.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},t.p="",t(t.s=0)}([function(e,t,n){var o,r,u;!function(n,c){r=[e,t],void 0!==(u="function"==typeof(o=c)?o.apply(t,r):o)&&(e.exports=u);}(0,function(e,t){Object.defineProperty(t,"__esModule",{value:!0}),t.default=function(e){return e instanceof Function?e:"string"==typeof e?function(t){return t[e]}:function(t){return e}},e.exports=t.default;});}])});
  });

  var accessorFn = unwrapExports(accessor_min);
  var accessor_min_1 = accessor_min.accessorFn;

  var canvasColorTracker_min = createCommonjsModule(function (module, exports) {
  // Version 1.0.1 canvas-color-tracker - https://github.com/vasturiano/canvas-color-tracker
  !function(t,r){module.exports=r();}(commonjsGlobal,function(){var a=function(t,r){if(Array.isArray(t))return t;if(Symbol.iterator in Object(t))return function(t,r){var e=[],n=!0,i=!1,o=void 0;try{for(var s,u=t[Symbol.iterator]();!(n=(s=u.next()).done)&&(e.push(s.value),!r||e.length!==r);n=!0);}catch(t){i=!0,o=t;}finally{try{!n&&u.return&&u.return();}finally{if(i)throw o}}return e}(t,r);throw new TypeError("Invalid attempt to destructure non-iterable instance")},t=function(){function n(t,r){for(var e=0;e<r.length;e++){var n=r[e];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n);}}return function(t,r,e){return r&&n(t.prototype,r),e&&n(t,e),t}}();var c=function(t,r){return 123*t%Math.pow(2,r)};return function(){function r(){var t=0<arguments.length&&void 0!==arguments[0]?arguments[0]:6;!function(t,r){if(!(t instanceof r))throw new TypeError("Cannot call a class as a function")}(this,r),this.csBits=t,this.registry=["__reserved for background__"];}return t(r,[{key:"register",value:function(t){if(this.registry.length>=Math.pow(2,24-this.csBits))return null;var r,e=this.registry.length,n=c(e,this.csBits),i=(r=e+(n<<24-this.csBits),"#"+Math.min(r,Math.pow(2,24)).toString(16).padStart(6,"0"));return this.registry.push(t),i}},{key:"lookup",value:function(t){var r=a(t,3),e=r[0],n=r[1],i=r[2],o=(e<<16)+(n<<8)+i;if(!o)return null;var s=o&Math.pow(2,24-this.csBits)-1,u=o>>24-this.csBits&Math.pow(2,this.csBits)-1;return c(s,this.csBits)!==u||s>=this.registry.length?null:this.registry[s]}}]),r}()});
  });

  function d3ForceCenter(x, y, z) {
    var nodes;

    if (x == null) x = 0;
    if (y == null) y = 0;
    if (z == null) z = 0;

    function force() {
      var i,
          n = nodes.length,
          node,
          sx = 0,
          sy = 0,
          sz = 0;

      for (i = 0; i < n; ++i) {
        node = nodes[i], sx += node.x || 0, sy += node.y || 0, sz += node.z || 0;
      }

      for (sx = sx / n - x, sy = sy / n - y, sz = sz / n - z, i = 0; i < n; ++i) {
        node = nodes[i];
        if (sx) { node.x -= sx; }
        if (sy) { node.y -= sy; }
        if (sz) { node.z -= sz; }
      }
    }

    force.initialize = function(_) {
      nodes = _;
    };

    force.x = function(_) {
      return arguments.length ? (x = +_, force) : x;
    };

    force.y = function(_) {
      return arguments.length ? (y = +_, force) : y;
    };

    force.z = function(_) {
      return arguments.length ? (z = +_, force) : z;
    };

    return force;
  }

  function tree_add(d) {
    var x = +this._x.call(null, d);
    return add(this.cover(x), x, d);
  }

  function add(tree, x, d) {
    if (isNaN(x)) return tree; // ignore invalid points

    var parent,
        node = tree._root,
        leaf = {data: d},
        x0 = tree._x0,
        x1 = tree._x1,
        xm,
        xp,
        right,
        i,
        j;

    // If the tree is empty, initialize the root as a leaf.
    if (!node) return tree._root = leaf, tree;

    // Find the existing leaf for the new point, or add it.
    while (node.length) {
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (parent = node, !(node = node[i = +right])) return parent[i] = leaf, tree;
    }

    // Is the new point is exactly coincident with the existing point?
    xp = +tree._x.call(null, node.data);
    if (x === xp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

    // Otherwise, split the leaf node until the old and new point are separated.
    do {
      parent = parent ? parent[i] = new Array(2) : tree._root = new Array(2);
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
    } while ((i = +right) === (j = +(xp >= xm)));
    return parent[j] = node, parent[i] = leaf, tree;
  }

  function addAll(data) {
    var i, n = data.length,
        x,
        xz = new Array(n),
        x0 = Infinity,
        x1 = -Infinity;

    // Compute the points and their extent.
    for (i = 0; i < n; ++i) {
      if (isNaN(x = +this._x.call(null, data[i]))) continue;
      xz[i] = x;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
    }

    // If there were no (valid) points, inherit the existing extent.
    if (x1 < x0) x0 = this._x0, x1 = this._x1;

    // Expand the tree to cover the new points.
    this.cover(x0).cover(x1);

    // Add the new points.
    for (i = 0; i < n; ++i) {
      add(this, xz[i], data[i]);
    }

    return this;
  }

  function tree_cover(x) {
    if (isNaN(x = +x)) return this; // ignore invalid points

    var x0 = this._x0,
        x1 = this._x1;

    // If the binarytree has no extent, initialize them.
    // Integer extent are necessary so that if we later double the extent,
    // the existing half boundaries don’t change due to floating point error!
    if (isNaN(x0)) {
      x1 = (x0 = Math.floor(x)) + 1;
    }

    // Otherwise, double repeatedly to cover.
    else if (x0 > x || x > x1) {
      var z = x1 - x0,
          node = this._root,
          parent,
          i;

      switch (i = +(x < (x0 + x1) / 2)) {
        case 0: {
          do parent = new Array(2), parent[i] = node, node = parent;
          while (z *= 2, x1 = x0 + z, x > x1);
          break;
        }
        case 1: {
          do parent = new Array(2), parent[i] = node, node = parent;
          while (z *= 2, x0 = x1 - z, x0 > x);
          break;
        }
      }

      if (this._root && this._root.length) this._root = node;
    }

    // If the binarytree covers the point already, just return.
    else return this;

    this._x0 = x0;
    this._x1 = x1;
    return this;
  }

  function tree_data() {
    var data = [];
    this.visit(function(node) {
      if (!node.length) do data.push(node.data); while (node = node.next)
    });
    return data;
  }

  function tree_extent(_) {
    return arguments.length
        ? this.cover(+_[0][0]).cover(+_[1][0])
        : isNaN(this._x0) ? undefined : [[this._x0], [this._x1]];
  }

  function Half(node, x0, x1) {
    this.node = node;
    this.x0 = x0;
    this.x1 = x1;
  }

  function tree_find(x, radius) {
    var data,
        x0 = this._x0,
        x1,
        x2,
        x3 = this._x1,
        halves = [],
        node = this._root,
        q,
        i;

    if (node) halves.push(new Half(node, x0, x3));
    if (radius == null) radius = Infinity;
    else {
      x0 = x - radius;
      x3 = x + radius;
    }

    while (q = halves.pop()) {

      // Stop searching if this half can’t contain a closer node.
      if (!(node = q.node)
          || (x1 = q.x0) > x3
          || (x2 = q.x1) < x0) continue;

      // Bisect the current half.
      if (node.length) {
        var xm = (x1 + x2) / 2;

        halves.push(
          new Half(node[1], xm, x2),
          new Half(node[0], x1, xm)
        );

        // Visit the closest half first.
        if (i = +(x >= xm)) {
          q = halves[halves.length - 1];
          halves[halves.length - 1] = halves[halves.length - 1 - i];
          halves[halves.length - 1 - i] = q;
        }
      }

      // Visit this point. (Visiting coincident points isn’t necessary!)
      else {
        var d = Math.abs(x - +this._x.call(null, node.data));
        if (d < radius) {
          radius = d;
          x0 = x - d;
          x3 = x + d;
          data = node.data;
        }
      }
    }

    return data;
  }

  function tree_remove(d) {
    if (isNaN(x = +this._x.call(null, d))) return this; // ignore invalid points

    var parent,
        node = this._root,
        retainer,
        previous,
        next,
        x0 = this._x0,
        x1 = this._x1,
        x,
        xm,
        right,
        i,
        j;

    // If the tree is empty, initialize the root as a leaf.
    if (!node) return this;

    // Find the leaf node for the point.
    // While descending, also retain the deepest parent with a non-removed sibling.
    if (node.length) while (true) {
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (!(parent = node, node = node[i = +right])) return this;
      if (!node.length) break;
      if (parent[(i + 1) & 1]) retainer = parent, j = i;
    }

    // Find the point to remove.
    while (node.data !== d) if (!(previous = node, node = node.next)) return this;
    if (next = node.next) delete node.next;

    // If there are multiple coincident points, remove just the point.
    if (previous) return (next ? previous.next = next : delete previous.next), this;

    // If this is the root point, remove it.
    if (!parent) return this._root = next, this;

    // Remove this leaf.
    next ? parent[i] = next : delete parent[i];

    // If the parent now contains exactly one leaf, collapse superfluous parents.
    if ((node = parent[0] || parent[1])
        && node === (parent[1] || parent[0])
        && !node.length) {
      if (retainer) retainer[j] = node;
      else this._root = node;
    }

    return this;
  }

  function removeAll(data) {
    for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
    return this;
  }

  function tree_root() {
    return this._root;
  }

  function tree_size() {
    var size = 0;
    this.visit(function(node) {
      if (!node.length) do ++size; while (node = node.next)
    });
    return size;
  }

  function tree_visit(callback) {
    var halves = [], q, node = this._root, child, x0, x1;
    if (node) halves.push(new Half(node, this._x0, this._x1));
    while (q = halves.pop()) {
      if (!callback(node = q.node, x0 = q.x0, x1 = q.x1) && node.length) {
        var xm = (x0 + x1) / 2;
        if (child = node[1]) halves.push(new Half(child, xm, x1));
        if (child = node[0]) halves.push(new Half(child, x0, xm));
      }
    }
    return this;
  }

  function tree_visitAfter(callback) {
    var halves = [], next = [], q;
    if (this._root) halves.push(new Half(this._root, this._x0, this._x1));
    while (q = halves.pop()) {
      var node = q.node;
      if (node.length) {
        var child, x0 = q.x0, x1 = q.x1, xm = (x0 + x1) / 2;
        if (child = node[0]) halves.push(new Half(child, x0, xm));
        if (child = node[1]) halves.push(new Half(child, xm, x1));
      }
      next.push(q);
    }
    while (q = next.pop()) {
      callback(q.node, q.x0, q.x1);
    }
    return this;
  }

  function defaultX(d) {
    return d[0];
  }

  function tree_x(_) {
    return arguments.length ? (this._x = _, this) : this._x;
  }

  function binarytree(nodes, x) {
    var tree = new Binarytree(x == null ? defaultX : x, NaN, NaN);
    return nodes == null ? tree : tree.addAll(nodes);
  }

  function Binarytree(x, x0, x1) {
    this._x = x;
    this._x0 = x0;
    this._x1 = x1;
    this._root = undefined;
  }

  function leaf_copy(leaf) {
    var copy = {data: leaf.data}, next = copy;
    while (leaf = leaf.next) next = next.next = {data: leaf.data};
    return copy;
  }

  var treeProto = binarytree.prototype = Binarytree.prototype;

  treeProto.copy = function() {
    var copy = new Binarytree(this._x, this._x0, this._x1),
        node = this._root,
        nodes,
        child;

    if (!node) return copy;

    if (!node.length) return copy._root = leaf_copy(node), copy;

    nodes = [{source: node, target: copy._root = new Array(2)}];
    while (node = nodes.pop()) {
      for (var i = 0; i < 2; ++i) {
        if (child = node.source[i]) {
          if (child.length) nodes.push({source: child, target: node.target[i] = new Array(2)});
          else node.target[i] = leaf_copy(child);
        }
      }
    }

    return copy;
  };

  treeProto.add = tree_add;
  treeProto.addAll = addAll;
  treeProto.cover = tree_cover;
  treeProto.data = tree_data;
  treeProto.extent = tree_extent;
  treeProto.find = tree_find;
  treeProto.remove = tree_remove;
  treeProto.removeAll = removeAll;
  treeProto.root = tree_root;
  treeProto.size = tree_size;
  treeProto.visit = tree_visit;
  treeProto.visitAfter = tree_visitAfter;
  treeProto.x = tree_x;

  function tree_add$1(d) {
    var x = +this._x.call(null, d),
        y = +this._y.call(null, d);
    return add$1(this.cover(x, y), x, y, d);
  }

  function add$1(tree, x, y, d) {
    if (isNaN(x) || isNaN(y)) return tree; // ignore invalid points

    var parent,
        node = tree._root,
        leaf = {data: d},
        x0 = tree._x0,
        y0 = tree._y0,
        x1 = tree._x1,
        y1 = tree._y1,
        xm,
        ym,
        xp,
        yp,
        right,
        bottom,
        i,
        j;

    // If the tree is empty, initialize the root as a leaf.
    if (!node) return tree._root = leaf, tree;

    // Find the existing leaf for the new point, or add it.
    while (node.length) {
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      if (parent = node, !(node = node[i = bottom << 1 | right])) return parent[i] = leaf, tree;
    }

    // Is the new point is exactly coincident with the existing point?
    xp = +tree._x.call(null, node.data);
    yp = +tree._y.call(null, node.data);
    if (x === xp && y === yp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

    // Otherwise, split the leaf node until the old and new point are separated.
    do {
      parent = parent ? parent[i] = new Array(4) : tree._root = new Array(4);
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
    } while ((i = bottom << 1 | right) === (j = (yp >= ym) << 1 | (xp >= xm)));
    return parent[j] = node, parent[i] = leaf, tree;
  }

  function addAll$1(data) {
    var d, i, n = data.length,
        x,
        y,
        xz = new Array(n),
        yz = new Array(n),
        x0 = Infinity,
        y0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity;

    // Compute the points and their extent.
    for (i = 0; i < n; ++i) {
      if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d))) continue;
      xz[i] = x;
      yz[i] = y;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }

    // If there were no (valid) points, inherit the existing extent.
    if (x1 < x0) x0 = this._x0, x1 = this._x1;
    if (y1 < y0) y0 = this._y0, y1 = this._y1;

    // Expand the tree to cover the new points.
    this.cover(x0, y0).cover(x1, y1);

    // Add the new points.
    for (i = 0; i < n; ++i) {
      add$1(this, xz[i], yz[i], data[i]);
    }

    return this;
  }

  function tree_cover$1(x, y) {
    if (isNaN(x = +x) || isNaN(y = +y)) return this; // ignore invalid points

    var x0 = this._x0,
        y0 = this._y0,
        x1 = this._x1,
        y1 = this._y1;

    // If the quadtree has no extent, initialize them.
    // Integer extent are necessary so that if we later double the extent,
    // the existing quadrant boundaries don’t change due to floating point error!
    if (isNaN(x0)) {
      x1 = (x0 = Math.floor(x)) + 1;
      y1 = (y0 = Math.floor(y)) + 1;
    }

    // Otherwise, double repeatedly to cover.
    else if (x0 > x || x > x1 || y0 > y || y > y1) {
      var z = x1 - x0,
          node = this._root,
          parent,
          i;

      switch (i = (y < (y0 + y1) / 2) << 1 | (x < (x0 + x1) / 2)) {
        case 0: {
          do parent = new Array(4), parent[i] = node, node = parent;
          while (z *= 2, x1 = x0 + z, y1 = y0 + z, x > x1 || y > y1);
          break;
        }
        case 1: {
          do parent = new Array(4), parent[i] = node, node = parent;
          while (z *= 2, x0 = x1 - z, y1 = y0 + z, x0 > x || y > y1);
          break;
        }
        case 2: {
          do parent = new Array(4), parent[i] = node, node = parent;
          while (z *= 2, x1 = x0 + z, y0 = y1 - z, x > x1 || y0 > y);
          break;
        }
        case 3: {
          do parent = new Array(4), parent[i] = node, node = parent;
          while (z *= 2, x0 = x1 - z, y0 = y1 - z, x0 > x || y0 > y);
          break;
        }
      }

      if (this._root && this._root.length) this._root = node;
    }

    // If the quadtree covers the point already, just return.
    else return this;

    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    return this;
  }

  function tree_data$1() {
    var data = [];
    this.visit(function(node) {
      if (!node.length) do data.push(node.data); while (node = node.next)
    });
    return data;
  }

  function tree_extent$1(_) {
    return arguments.length
        ? this.cover(+_[0][0], +_[0][1]).cover(+_[1][0], +_[1][1])
        : isNaN(this._x0) ? undefined : [[this._x0, this._y0], [this._x1, this._y1]];
  }

  function Quad(node, x0, y0, x1, y1) {
    this.node = node;
    this.x0 = x0;
    this.y0 = y0;
    this.x1 = x1;
    this.y1 = y1;
  }

  function tree_find$1(x, y, radius) {
    var data,
        x0 = this._x0,
        y0 = this._y0,
        x1,
        y1,
        x2,
        y2,
        x3 = this._x1,
        y3 = this._y1,
        quads = [],
        node = this._root,
        q,
        i;

    if (node) quads.push(new Quad(node, x0, y0, x3, y3));
    if (radius == null) radius = Infinity;
    else {
      x0 = x - radius, y0 = y - radius;
      x3 = x + radius, y3 = y + radius;
      radius *= radius;
    }

    while (q = quads.pop()) {

      // Stop searching if this quadrant can’t contain a closer node.
      if (!(node = q.node)
          || (x1 = q.x0) > x3
          || (y1 = q.y0) > y3
          || (x2 = q.x1) < x0
          || (y2 = q.y1) < y0) continue;

      // Bisect the current quadrant.
      if (node.length) {
        var xm = (x1 + x2) / 2,
            ym = (y1 + y2) / 2;

        quads.push(
          new Quad(node[3], xm, ym, x2, y2),
          new Quad(node[2], x1, ym, xm, y2),
          new Quad(node[1], xm, y1, x2, ym),
          new Quad(node[0], x1, y1, xm, ym)
        );

        // Visit the closest quadrant first.
        if (i = (y >= ym) << 1 | (x >= xm)) {
          q = quads[quads.length - 1];
          quads[quads.length - 1] = quads[quads.length - 1 - i];
          quads[quads.length - 1 - i] = q;
        }
      }

      // Visit this point. (Visiting coincident points isn’t necessary!)
      else {
        var dx = x - +this._x.call(null, node.data),
            dy = y - +this._y.call(null, node.data),
            d2 = dx * dx + dy * dy;
        if (d2 < radius) {
          var d = Math.sqrt(radius = d2);
          x0 = x - d, y0 = y - d;
          x3 = x + d, y3 = y + d;
          data = node.data;
        }
      }
    }

    return data;
  }

  function tree_remove$1(d) {
    if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d))) return this; // ignore invalid points

    var parent,
        node = this._root,
        retainer,
        previous,
        next,
        x0 = this._x0,
        y0 = this._y0,
        x1 = this._x1,
        y1 = this._y1,
        x,
        y,
        xm,
        ym,
        right,
        bottom,
        i,
        j;

    // If the tree is empty, initialize the root as a leaf.
    if (!node) return this;

    // Find the leaf node for the point.
    // While descending, also retain the deepest parent with a non-removed sibling.
    if (node.length) while (true) {
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      if (!(parent = node, node = node[i = bottom << 1 | right])) return this;
      if (!node.length) break;
      if (parent[(i + 1) & 3] || parent[(i + 2) & 3] || parent[(i + 3) & 3]) retainer = parent, j = i;
    }

    // Find the point to remove.
    while (node.data !== d) if (!(previous = node, node = node.next)) return this;
    if (next = node.next) delete node.next;

    // If there are multiple coincident points, remove just the point.
    if (previous) return (next ? previous.next = next : delete previous.next), this;

    // If this is the root point, remove it.
    if (!parent) return this._root = next, this;

    // Remove this leaf.
    next ? parent[i] = next : delete parent[i];

    // If the parent now contains exactly one leaf, collapse superfluous parents.
    if ((node = parent[0] || parent[1] || parent[2] || parent[3])
        && node === (parent[3] || parent[2] || parent[1] || parent[0])
        && !node.length) {
      if (retainer) retainer[j] = node;
      else this._root = node;
    }

    return this;
  }

  function removeAll$1(data) {
    for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
    return this;
  }

  function tree_root$1() {
    return this._root;
  }

  function tree_size$1() {
    var size = 0;
    this.visit(function(node) {
      if (!node.length) do ++size; while (node = node.next)
    });
    return size;
  }

  function tree_visit$1(callback) {
    var quads = [], q, node = this._root, child, x0, y0, x1, y1;
    if (node) quads.push(new Quad(node, this._x0, this._y0, this._x1, this._y1));
    while (q = quads.pop()) {
      if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1) && node.length) {
        var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
        if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
        if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
        if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
        if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
      }
    }
    return this;
  }

  function tree_visitAfter$1(callback) {
    var quads = [], next = [], q;
    if (this._root) quads.push(new Quad(this._root, this._x0, this._y0, this._x1, this._y1));
    while (q = quads.pop()) {
      var node = q.node;
      if (node.length) {
        var child, x0 = q.x0, y0 = q.y0, x1 = q.x1, y1 = q.y1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2;
        if (child = node[0]) quads.push(new Quad(child, x0, y0, xm, ym));
        if (child = node[1]) quads.push(new Quad(child, xm, y0, x1, ym));
        if (child = node[2]) quads.push(new Quad(child, x0, ym, xm, y1));
        if (child = node[3]) quads.push(new Quad(child, xm, ym, x1, y1));
      }
      next.push(q);
    }
    while (q = next.pop()) {
      callback(q.node, q.x0, q.y0, q.x1, q.y1);
    }
    return this;
  }

  function defaultX$1(d) {
    return d[0];
  }

  function tree_x$1(_) {
    return arguments.length ? (this._x = _, this) : this._x;
  }

  function defaultY(d) {
    return d[1];
  }

  function tree_y(_) {
    return arguments.length ? (this._y = _, this) : this._y;
  }

  function quadtree(nodes, x, y) {
    var tree = new Quadtree(x == null ? defaultX$1 : x, y == null ? defaultY : y, NaN, NaN, NaN, NaN);
    return nodes == null ? tree : tree.addAll(nodes);
  }

  function Quadtree(x, y, x0, y0, x1, y1) {
    this._x = x;
    this._y = y;
    this._x0 = x0;
    this._y0 = y0;
    this._x1 = x1;
    this._y1 = y1;
    this._root = undefined;
  }

  function leaf_copy$1(leaf) {
    var copy = {data: leaf.data}, next = copy;
    while (leaf = leaf.next) next = next.next = {data: leaf.data};
    return copy;
  }

  var treeProto$1 = quadtree.prototype = Quadtree.prototype;

  treeProto$1.copy = function() {
    var copy = new Quadtree(this._x, this._y, this._x0, this._y0, this._x1, this._y1),
        node = this._root,
        nodes,
        child;

    if (!node) return copy;

    if (!node.length) return copy._root = leaf_copy$1(node), copy;

    nodes = [{source: node, target: copy._root = new Array(4)}];
    while (node = nodes.pop()) {
      for (var i = 0; i < 4; ++i) {
        if (child = node.source[i]) {
          if (child.length) nodes.push({source: child, target: node.target[i] = new Array(4)});
          else node.target[i] = leaf_copy$1(child);
        }
      }
    }

    return copy;
  };

  treeProto$1.add = tree_add$1;
  treeProto$1.addAll = addAll$1;
  treeProto$1.cover = tree_cover$1;
  treeProto$1.data = tree_data$1;
  treeProto$1.extent = tree_extent$1;
  treeProto$1.find = tree_find$1;
  treeProto$1.remove = tree_remove$1;
  treeProto$1.removeAll = removeAll$1;
  treeProto$1.root = tree_root$1;
  treeProto$1.size = tree_size$1;
  treeProto$1.visit = tree_visit$1;
  treeProto$1.visitAfter = tree_visitAfter$1;
  treeProto$1.x = tree_x$1;
  treeProto$1.y = tree_y;

  function tree_add$2(d) {
    var x = +this._x.call(null, d),
        y = +this._y.call(null, d),
        z = +this._z.call(null, d);
    return add$2(this.cover(x, y, z), x, y, z, d);
  }

  function add$2(tree, x, y, z, d) {
    if (isNaN(x) || isNaN(y) || isNaN(z)) return tree; // ignore invalid points

    var parent,
        node = tree._root,
        leaf = {data: d},
        x0 = tree._x0,
        y0 = tree._y0,
        z0 = tree._z0,
        x1 = tree._x1,
        y1 = tree._y1,
        z1 = tree._z1,
        xm,
        ym,
        zm,
        xp,
        yp,
        zp,
        right,
        bottom,
        deep,
        i,
        j;

    // If the tree is empty, initialize the root as a leaf.
    if (!node) return tree._root = leaf, tree;

    // Find the existing leaf for the new point, or add it.
    while (node.length) {
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      if (deep = z >= (zm = (z0 + z1) / 2)) z0 = zm; else z1 = zm;
      if (parent = node, !(node = node[i = deep << 2 | bottom << 1 | right])) return parent[i] = leaf, tree;
    }

    // Is the new point is exactly coincident with the existing point?
    xp = +tree._x.call(null, node.data);
    yp = +tree._y.call(null, node.data);
    zp = +tree._z.call(null, node.data);
    if (x === xp && y === yp && z === zp) return leaf.next = node, parent ? parent[i] = leaf : tree._root = leaf, tree;

    // Otherwise, split the leaf node until the old and new point are separated.
    do {
      parent = parent ? parent[i] = new Array(8) : tree._root = new Array(8);
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      if (deep = z >= (zm = (z0 + z1) / 2)) z0 = zm; else z1 = zm;
    } while ((i = deep << 2 | bottom << 1 | right) === (j = (zp >= zm) << 2 | (yp >= ym) << 1 | (xp >= xm)));
    return parent[j] = node, parent[i] = leaf, tree;
  }

  function addAll$2(data) {
    var d, i, n = data.length,
        x,
        y,
        z,
        xz = new Array(n),
        yz = new Array(n),
        zz = new Array(n),
        x0 = Infinity,
        y0 = Infinity,
        z0 = Infinity,
        x1 = -Infinity,
        y1 = -Infinity,
        z1 = -Infinity;

    // Compute the points and their extent.
    for (i = 0; i < n; ++i) {
      if (isNaN(x = +this._x.call(null, d = data[i])) || isNaN(y = +this._y.call(null, d)) || isNaN(z = +this._z.call(null, d))) continue;
      xz[i] = x;
      yz[i] = y;
      zz[i] = z;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (z < z0) z0 = z;
      if (z > z1) z1 = z;
    }

    // If there were no (valid) points, inherit the existing extent.
    if (x1 < x0) x0 = this._x0, x1 = this._x1;
    if (y1 < y0) y0 = this._y0, y1 = this._y1;
    if (z1 < z0) z0 = this._z0, z1 = this._z1;

    // Expand the tree to cover the new points.
    this.cover(x0, y0, z0).cover(x1, y1, z1);

    // Add the new points.
    for (i = 0; i < n; ++i) {
      add$2(this, xz[i], yz[i], zz[i], data[i]);
    }

    return this;
  }

  function tree_cover$2(x, y, z) {
    if (isNaN(x = +x) || isNaN(y = +y) || isNaN(z = +z)) return this; // ignore invalid points

    var x0 = this._x0,
        y0 = this._y0,
        z0 = this._z0,
        x1 = this._x1,
        y1 = this._y1,
        z1 = this._z1;

    // If the octree has no extent, initialize them.
    // Integer extent are necessary so that if we later double the extent,
    // the existing octant boundaries don’t change due to floating point error!
    if (isNaN(x0)) {
      x1 = (x0 = Math.floor(x)) + 1;
      y1 = (y0 = Math.floor(y)) + 1;
      z1 = (z0 = Math.floor(z)) + 1;
    }

    // Otherwise, double repeatedly to cover.
    else if (x0 > x || x > x1 || y0 > y || y > y1 || z0 > z || z > z1) {
      var t = x1 - x0,
          node = this._root,
          parent,
          i;

      switch (i = (z < (z0 + z1) / 2) << 2 | (y < (y0 + y1) / 2) << 1 | (x < (x0 + x1) / 2)) {
        case 0: {
          do parent = new Array(8), parent[i] = node, node = parent;
          while (t *= 2, x1 = x0 + t, y1 = y0 + t, z1 = z0 + t, x > x1 || y > y1 || z > z1);
          break;
        }
        case 1: {
          do parent = new Array(8), parent[i] = node, node = parent;
          while (t *= 2, x0 = x1 - t, y1 = y0 + t, z1 = z0 + t, x0 > x || y > y1 || z > z1);
          break;
        }
        case 2: {
          do parent = new Array(8), parent[i] = node, node = parent;
          while (t *= 2, x1 = x0 + t, y0 = y1 - t, z1 = z0 + t, x > x1 || y0 > y || z > z1);
          break;
        }
        case 3: {
          do parent = new Array(8), parent[i] = node, node = parent;
          while (t *= 2, x0 = x1 - t, y0 = y1 - t, z1 = z0 + t, x0 > x || y0 > y || z > z1);
          break;
        }
        case 4: {
          do parent = new Array(8), parent[i] = node, node = parent;
          while (t *= 2, x1 = x0 + t, y1 = y0 + t, z0 = z1 - t, x > x1 || y > y1 || z0 > z);
          break;
        }
        case 5: {
          do parent = new Array(8), parent[i] = node, node = parent;
          while (t *= 2, x0 = x1 - t, y1 = y0 + t, z0 = z1 - t, x0 > x || y > y1 || z0 > z);
          break;
        }
        case 6: {
          do parent = new Array(8), parent[i] = node, node = parent;
          while (t *= 2, x1 = x0 + t, y0 = y1 - t, z0 = z1 - t, x > x1 || y0 > y || z0 > z);
          break;
        }
        case 7: {
          do parent = new Array(8), parent[i] = node, node = parent;
          while (t *= 2, x0 = x1 - t, y0 = y1 - t, z0 = z1 - t, x0 > x || y0 > y || z0 > z);
          break;
        }
      }

      if (this._root && this._root.length) this._root = node;
    }

    // If the octree covers the point already, just return.
    else return this;

    this._x0 = x0;
    this._y0 = y0;
    this._z0 = z0;
    this._x1 = x1;
    this._y1 = y1;
    this._z1 = z1;
    return this;
  }

  function tree_data$2() {
    var data = [];
    this.visit(function(node) {
      if (!node.length) do data.push(node.data); while (node = node.next)
    });
    return data;
  }

  function tree_extent$2(_) {
    return arguments.length
        ? this.cover(+_[0][0], +_[0][1], +_[0][2]).cover(+_[1][0], +_[1][1], +_[1][2])
        : isNaN(this._x0) ? undefined : [[this._x0, this._y0, this._z0], [this._x1, this._y1, this._z1]];
  }

  function Octant(node, x0, y0, z0, x1, y1, z1) {
    this.node = node;
    this.x0 = x0;
    this.y0 = y0;
    this.z0 = z0;
    this.x1 = x1;
    this.y1 = y1;
    this.z1 = z1;
  }

  function tree_find$2(x, y, z, radius) {
    var data,
        x0 = this._x0,
        y0 = this._y0,
        z0 = this._z0,
        x1,
        y1,
        z1,
        x2,
        y2,
        z2,
        x3 = this._x1,
        y3 = this._y1,
        z3 = this._z1,
        octs = [],
        node = this._root,
        q,
        i;

    if (node) octs.push(new Octant(node, x0, y0, z0, x3, y3, z3));
    if (radius == null) radius = Infinity;
    else {
      x0 = x - radius, y0 = y - radius, z0 = z - radius;
      x3 = x + radius, y3 = y + radius, z3 = z + radius;
      radius *= radius;
    }

    while (q = octs.pop()) {

      // Stop searching if this octant can’t contain a closer node.
      if (!(node = q.node)
          || (x1 = q.x0) > x3
          || (y1 = q.y0) > y3
          || (z1 = q.z0) > z3
          || (x2 = q.x1) < x0
          || (y2 = q.y1) < y0
          || (z2 = q.z1) < z0) continue;

      // Bisect the current octant.
      if (node.length) {
        var xm = (x1 + x2) / 2,
            ym = (y1 + y2) / 2,
            zm = (z1 + z2) / 2;

        octs.push(
          new Octant(node[7], xm, ym, zm, x2, y2, z2),
          new Octant(node[6], x1, ym, zm, xm, y2, z2),
          new Octant(node[5], xm, y1, zm, x2, ym, z2),
          new Octant(node[4], x1, y1, zm, xm, ym, z2),
          new Octant(node[3], xm, ym, z1, x2, y2, zm),
          new Octant(node[2], x1, ym, z1, xm, y2, zm),
          new Octant(node[1], xm, y1, z1, x2, ym, zm),
          new Octant(node[0], x1, y1, z1, xm, ym, zm)
        );

        // Visit the closest octant first.
        if (i = (z >= zm) << 2 | (y >= ym) << 1 | (x >= xm)) {
          q = octs[octs.length - 1];
          octs[octs.length - 1] = octs[octs.length - 1 - i];
          octs[octs.length - 1 - i] = q;
        }
      }

      // Visit this point. (Visiting coincident points isn’t necessary!)
      else {
        var dx = x - +this._x.call(null, node.data),
            dy = y - +this._y.call(null, node.data),
            dz = z - +this._z.call(null, node.data),
            d2 = dx * dx + dy * dy + dz * dz;
        if (d2 < radius) {
          var d = Math.sqrt(radius = d2);
          x0 = x - d, y0 = y - d, z0 = z - d;
          x3 = x + d, y3 = y + d, z3 = z + d;
          data = node.data;
        }
      }
    }

    return data;
  }

  function tree_remove$2(d) {
    if (isNaN(x = +this._x.call(null, d)) || isNaN(y = +this._y.call(null, d)) || isNaN(z = +this._z.call(null, d))) return this; // ignore invalid points

    var parent,
        node = this._root,
        retainer,
        previous,
        next,
        x0 = this._x0,
        y0 = this._y0,
        z0 = this._z0,
        x1 = this._x1,
        y1 = this._y1,
        z1 = this._z1,
        x,
        y,
        z,
        xm,
        ym,
        zm,
        right,
        bottom,
        deep,
        i,
        j;

    // If the tree is empty, initialize the root as a leaf.
    if (!node) return this;

    // Find the leaf node for the point.
    // While descending, also retain the deepest parent with a non-removed sibling.
    if (node.length) while (true) {
      if (right = x >= (xm = (x0 + x1) / 2)) x0 = xm; else x1 = xm;
      if (bottom = y >= (ym = (y0 + y1) / 2)) y0 = ym; else y1 = ym;
      if (deep = z >= (zm = (z0 + z1) / 2)) z0 = zm; else z1 = zm;
      if (!(parent = node, node = node[i = deep << 2 | bottom << 1 | right])) return this;
      if (!node.length) break;
      if (parent[(i + 1) & 7] || parent[(i + 2) & 7] || parent[(i + 3) & 7] || parent[(i + 4) & 7] || parent[(i + 5) & 7] || parent[(i + 6) & 7] || parent[(i + 7) & 7]) retainer = parent, j = i;
    }

    // Find the point to remove.
    while (node.data !== d) if (!(previous = node, node = node.next)) return this;
    if (next = node.next) delete node.next;

    // If there are multiple coincident points, remove just the point.
    if (previous) return (next ? previous.next = next : delete previous.next), this;

    // If this is the root point, remove it.
    if (!parent) return this._root = next, this;

    // Remove this leaf.
    next ? parent[i] = next : delete parent[i];

    // If the parent now contains exactly one leaf, collapse superfluous parents.
    if ((node = parent[0] || parent[1] || parent[2] || parent[3] || parent[4] || parent[5] || parent[6] || parent[7])
        && node === (parent[7] || parent[6] || parent[5] || parent[4] || parent[3] || parent[2] || parent[1] || parent[0])
        && !node.length) {
      if (retainer) retainer[j] = node;
      else this._root = node;
    }

    return this;
  }

  function removeAll$2(data) {
    for (var i = 0, n = data.length; i < n; ++i) this.remove(data[i]);
    return this;
  }

  function tree_root$2() {
    return this._root;
  }

  function tree_size$2() {
    var size = 0;
    this.visit(function(node) {
      if (!node.length) do ++size; while (node = node.next)
    });
    return size;
  }

  function tree_visit$2(callback) {
    var octs = [], q, node = this._root, child, x0, y0, z0, x1, y1, z1;
    if (node) octs.push(new Octant(node, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1));
    while (q = octs.pop()) {
      if (!callback(node = q.node, x0 = q.x0, y0 = q.y0, z0 = q.z0, x1 = q.x1, y1 = q.y1, z1 = q.z1) && node.length) {
        var xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
        if (child = node[7]) octs.push(new Octant(child, xm, ym, zm, x1, y1, z1));
        if (child = node[6]) octs.push(new Octant(child, x0, ym, zm, xm, y1, z1));
        if (child = node[5]) octs.push(new Octant(child, xm, y0, zm, x1, ym, z1));
        if (child = node[4]) octs.push(new Octant(child, x0, y0, zm, xm, ym, z1));
        if (child = node[3]) octs.push(new Octant(child, xm, ym, z0, x1, y1, zm));
        if (child = node[2]) octs.push(new Octant(child, x0, ym, z0, xm, y1, zm));
        if (child = node[1]) octs.push(new Octant(child, xm, y0, z0, x1, ym, zm));
        if (child = node[0]) octs.push(new Octant(child, x0, y0, z0, xm, ym, zm));
      }
    }
    return this;
  }

  function tree_visitAfter$2(callback) {
    var octs = [], next = [], q;
    if (this._root) octs.push(new Octant(this._root, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1));
    while (q = octs.pop()) {
      var node = q.node;
      if (node.length) {
        var child, x0 = q.x0, y0 = q.y0, z0 = q.z0, x1 = q.x1, y1 = q.y1, z1 = q.z1, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
        if (child = node[0]) octs.push(new Octant(child, x0, y0, z0, xm, ym, zm));
        if (child = node[1]) octs.push(new Octant(child, xm, y0, z0, x1, ym, zm));
        if (child = node[2]) octs.push(new Octant(child, x0, ym, z0, xm, y1, zm));
        if (child = node[3]) octs.push(new Octant(child, xm, ym, z0, x1, y1, zm));
        if (child = node[4]) octs.push(new Octant(child, x0, y0, zm, xm, ym, z1));
        if (child = node[5]) octs.push(new Octant(child, xm, y0, zm, x1, ym, z1));
        if (child = node[6]) octs.push(new Octant(child, x0, ym, zm, xm, y1, z1));
        if (child = node[7]) octs.push(new Octant(child, xm, ym, zm, x1, y1, z1));
      }
      next.push(q);
    }
    while (q = next.pop()) {
      callback(q.node, q.x0, q.y0, q.z0, q.x1, q.y1, q.z1);
    }
    return this;
  }

  function defaultX$2(d) {
    return d[0];
  }

  function tree_x$2(_) {
    return arguments.length ? (this._x = _, this) : this._x;
  }

  function defaultY$1(d) {
    return d[1];
  }

  function tree_y$1(_) {
    return arguments.length ? (this._y = _, this) : this._y;
  }

  function defaultZ(d) {
    return d[2];
  }

  function tree_z(_) {
    return arguments.length ? (this._z = _, this) : this._z;
  }

  function octree(nodes, x, y, z) {
    var tree = new Octree(x == null ? defaultX$2 : x, y == null ? defaultY$1 : y, z == null ? defaultZ : z, NaN, NaN, NaN, NaN, NaN, NaN);
    return nodes == null ? tree : tree.addAll(nodes);
  }

  function Octree(x, y, z, x0, y0, z0, x1, y1, z1) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._x0 = x0;
    this._y0 = y0;
    this._z0 = z0;
    this._x1 = x1;
    this._y1 = y1;
    this._z1 = z1;
    this._root = undefined;
  }

  function leaf_copy$2(leaf) {
    var copy = {data: leaf.data}, next = copy;
    while (leaf = leaf.next) next = next.next = {data: leaf.data};
    return copy;
  }

  var treeProto$2 = octree.prototype = Octree.prototype;

  treeProto$2.copy = function() {
    var copy = new Octree(this._x, this._y, this._z, this._x0, this._y0, this._z0, this._x1, this._y1, this._z1),
        node = this._root,
        nodes,
        child;

    if (!node) return copy;

    if (!node.length) return copy._root = leaf_copy$2(node), copy;

    nodes = [{source: node, target: copy._root = new Array(8)}];
    while (node = nodes.pop()) {
      for (var i = 0; i < 8; ++i) {
        if (child = node.source[i]) {
          if (child.length) nodes.push({source: child, target: node.target[i] = new Array(8)});
          else node.target[i] = leaf_copy$2(child);
        }
      }
    }

    return copy;
  };

  treeProto$2.add = tree_add$2;
  treeProto$2.addAll = addAll$2;
  treeProto$2.cover = tree_cover$2;
  treeProto$2.data = tree_data$2;
  treeProto$2.extent = tree_extent$2;
  treeProto$2.find = tree_find$2;
  treeProto$2.remove = tree_remove$2;
  treeProto$2.removeAll = removeAll$2;
  treeProto$2.root = tree_root$2;
  treeProto$2.size = tree_size$2;
  treeProto$2.visit = tree_visit$2;
  treeProto$2.visitAfter = tree_visitAfter$2;
  treeProto$2.x = tree_x$2;
  treeProto$2.y = tree_y$1;
  treeProto$2.z = tree_z;

  function constant$4(x) {
    return function() {
      return x;
    };
  }

  function jiggle() {
    return (Math.random() - 0.5) * 1e-6;
  }

  function index(d) {
    return d.index;
  }

  function find(nodeById, nodeId) {
    var node = nodeById.get(nodeId);
    if (!node) throw new Error("missing: " + nodeId);
    return node;
  }

  function d3ForceLink(links) {
    var id = index,
        strength = defaultStrength,
        strengths,
        distance = constant$4(30),
        distances,
        nodes,
        nDim,
        count,
        bias,
        iterations = 1;

    if (links == null) links = [];

    function defaultStrength(link) {
      return 1 / Math.min(count[link.source.index], count[link.target.index]);
    }

    function force(alpha) {
      for (var k = 0, n = links.length; k < iterations; ++k) {
        for (var i = 0, link, source, target, x = 0, y = 0, z = 0, l, b; i < n; ++i) {
          link = links[i], source = link.source, target = link.target;
          x = target.x + target.vx - source.x - source.vx || jiggle();
          if (nDim > 1) { y = target.y + target.vy - source.y - source.vy || jiggle(); }
          if (nDim > 2) { z = target.z + target.vz - source.z - source.vz || jiggle(); }
          l = Math.sqrt(x * x + y * y + z * z);
          l = (l - distances[i]) / l * alpha * strengths[i];
          x *= l, y *= l, z *= l;

          target.vx -= x * (b = bias[i]);
          if (nDim > 1) { target.vy -= y * b; }
          if (nDim > 2) { target.vz -= z * b; }

          source.vx += x * (b = 1 - b);
          if (nDim > 1) { source.vy += y * b; }
          if (nDim > 2) { source.vz += z * b; }
        }
      }
    }

    function initialize() {
      if (!nodes) return;

      var i,
          n = nodes.length,
          m = links.length,
          nodeById = new Map(nodes.map((d, i) => [id(d, i, nodes), d])),
          link;

      for (i = 0, count = new Array(n); i < m; ++i) {
        link = links[i], link.index = i;
        if (typeof link.source !== "object") link.source = find(nodeById, link.source);
        if (typeof link.target !== "object") link.target = find(nodeById, link.target);
        count[link.source.index] = (count[link.source.index] || 0) + 1;
        count[link.target.index] = (count[link.target.index] || 0) + 1;
      }

      for (i = 0, bias = new Array(m); i < m; ++i) {
        link = links[i], bias[i] = count[link.source.index] / (count[link.source.index] + count[link.target.index]);
      }

      strengths = new Array(m), initializeStrength();
      distances = new Array(m), initializeDistance();
    }

    function initializeStrength() {
      if (!nodes) return;

      for (var i = 0, n = links.length; i < n; ++i) {
        strengths[i] = +strength(links[i], i, links);
      }
    }

    function initializeDistance() {
      if (!nodes) return;

      for (var i = 0, n = links.length; i < n; ++i) {
        distances[i] = +distance(links[i], i, links);
      }
    }

    force.initialize = function(initNodes, numDimensions) {
      nodes = initNodes;
      nDim = numDimensions;
      initialize();
    };

    force.links = function(_) {
      return arguments.length ? (links = _, initialize(), force) : links;
    };

    force.id = function(_) {
      return arguments.length ? (id = _, force) : id;
    };

    force.iterations = function(_) {
      return arguments.length ? (iterations = +_, force) : iterations;
    };

    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initializeStrength(), force) : strength;
    };

    force.distance = function(_) {
      return arguments.length ? (distance = typeof _ === "function" ? _ : constant$4(+_), initializeDistance(), force) : distance;
    };

    return force;
  }

  var MAX_DIMENSIONS = 3;

  function x$1(d) {
    return d.x;
  }

  function y$1(d) {
    return d.y;
  }

  function z$1(d) {
    return d.z;
  }

  var initialRadius = 10,
      initialAngleRoll = Math.PI * (3 - Math.sqrt(5)), // Golden angle
      initialAngleYaw = Math.PI / 24; // Sequential

  function d3ForceSimulation(nodes, numDimensions) {
    numDimensions = numDimensions || 2;

    var nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(numDimensions))),
        simulation,
        alpha = 1,
        alphaMin = 0.001,
        alphaDecay = 1 - Math.pow(alphaMin, 1 / 300),
        alphaTarget = 0,
        velocityDecay = 0.6,
        forces = new Map(),
        stepper = timer(step),
        event = dispatch("tick", "end");

    if (nodes == null) nodes = [];

    function step() {
      tick();
      event.call("tick", simulation);
      if (alpha < alphaMin) {
        stepper.stop();
        event.call("end", simulation);
      }
    }

    function tick(iterations) {
      var i, n = nodes.length, node;

      if (iterations === undefined) iterations = 1;

      for (var k = 0; k < iterations; ++k) {
        alpha += (alphaTarget - alpha) * alphaDecay;

        forces.forEach(function (force) {
          force(alpha);
        });

        for (i = 0; i < n; ++i) {
          node = nodes[i];
          if (node.fx == null) node.x += node.vx *= velocityDecay;
          else node.x = node.fx, node.vx = 0;
          if (nDim > 1) {
            if (node.fy == null) node.y += node.vy *= velocityDecay;
            else node.y = node.fy, node.vy = 0;
          }
          if (nDim > 2) {
            if (node.fz == null) node.z += node.vz *= velocityDecay;
            else node.z = node.fz, node.vz = 0;
          }
        }
      }

      return simulation;
    }

    function initializeNodes() {
      for (var i = 0, n = nodes.length, node; i < n; ++i) {
        node = nodes[i], node.index = i;
        if (!isNaN(node.fx)) node.x = node.fx;
        if (!isNaN(node.fy)) node.y = node.fy;
        if (!isNaN(node.fz)) node.z = node.fz;
        if (isNaN(node.x) || (nDim > 1 && isNaN(node.y)) || (nDim > 2 && isNaN(node.z))) {
          var radius = initialRadius * (nDim > 2 ? Math.cbrt(i) : (nDim > 1 ? Math.sqrt(i) : i)),
            rollAngle = i * initialAngleRoll,
            yawAngle = i * initialAngleYaw;
          node.x = radius * (nDim > 1 ? Math.cos(rollAngle) : 1);
          if (nDim > 1) { node.y = radius * Math.sin(rollAngle); }
          if (nDim > 2) { node.z = radius * Math.sin(yawAngle); }
        }
        if (isNaN(node.vx) || (nDim > 1 && isNaN(node.vy)) || (nDim > 2 && isNaN(node.vz))) {
          node.vx = 0;
          if (nDim > 1) { node.vy = 0; }
          if (nDim > 2) { node.vz = 0; }
        }
      }
    }

    function initializeForce(force) {
      if (force.initialize) force.initialize(nodes, nDim);
      return force;
    }

    initializeNodes();

    return simulation = {
      tick: tick,

      restart: function() {
        return stepper.restart(step), simulation;
      },

      stop: function() {
        return stepper.stop(), simulation;
      },

      numDimensions: function(_) {
        return arguments.length
            ? (nDim = Math.min(MAX_DIMENSIONS, Math.max(1, Math.round(_))), forces.forEach(initializeForce), simulation)
            : nDim;
      },

      nodes: function(_) {
        return arguments.length ? (nodes = _, initializeNodes(), forces.forEach(initializeForce), simulation) : nodes;
      },

      alpha: function(_) {
        return arguments.length ? (alpha = +_, simulation) : alpha;
      },

      alphaMin: function(_) {
        return arguments.length ? (alphaMin = +_, simulation) : alphaMin;
      },

      alphaDecay: function(_) {
        return arguments.length ? (alphaDecay = +_, simulation) : +alphaDecay;
      },

      alphaTarget: function(_) {
        return arguments.length ? (alphaTarget = +_, simulation) : alphaTarget;
      },

      velocityDecay: function(_) {
        return arguments.length ? (velocityDecay = 1 - _, simulation) : 1 - velocityDecay;
      },

      force: function(name, _) {
        return arguments.length > 1 ? ((_ == null ? forces.delete(name) : forces.set(name, initializeForce(_))), simulation) : forces.get(name);
      },

      find: function() {
        var args = Array.prototype.slice.call(arguments);
        var x = args.shift() || 0,
            y = (nDim > 1 ? args.shift() : null) || 0,
            z = (nDim > 2 ? args.shift() : null) || 0,
            radius = args.shift() || Infinity;

        var i = 0,
            n = nodes.length,
            dx,
            dy,
            dz,
            d2,
            node,
            closest;

        radius *= radius;

        for (i = 0; i < n; ++i) {
          node = nodes[i];
          dx = x - node.x;
          dy = y - (node.y || 0);
          dz = z - (node.z ||0);
          d2 = dx * dx + dy * dy + dz * dz;
          if (d2 < radius) closest = node, radius = d2;
        }

        return closest;
      },

      on: function(name, _) {
        return arguments.length > 1 ? (event.on(name, _), simulation) : event.on(name);
      }
    };
  }

  function d3ForceManyBody() {
    var nodes,
        nDim,
        node,
        alpha,
        strength = constant$4(-30),
        strengths,
        distanceMin2 = 1,
        distanceMax2 = Infinity,
        theta2 = 0.81;

    function force(_) {
      var i,
          n = nodes.length,
          tree =
              (nDim === 1 ? binarytree(nodes, x$1)
              :(nDim === 2 ? quadtree(nodes, x$1, y$1)
              :(nDim === 3 ? octree(nodes, x$1, y$1, z$1)
              :null
          ))).visitAfter(accumulate);

      for (alpha = _, i = 0; i < n; ++i) node = nodes[i], tree.visit(apply);
    }

    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length, node;
      strengths = new Array(n);
      for (i = 0; i < n; ++i) node = nodes[i], strengths[node.index] = +strength(node, i, nodes);
    }

    function accumulate(treeNode) {
      var strength = 0, q, c, weight = 0, x, y, z, i;

      // For internal nodes, accumulate forces from children.
      if (treeNode.length) {
        for (x = y = z = i = 0; i < 4; ++i) {
          if ((q = treeNode[i]) && (c = Math.abs(q.value))) {
            strength += q.value, weight += c, x += c * (q.x || 0), y += c * (q.y || 0), z += c * (q.z || 0);
          }
        }
        treeNode.x = x / weight;
        if (nDim > 1) { treeNode.y = y / weight; }
        if (nDim > 2) { treeNode.z = z / weight; }
      }

      // For leaf nodes, accumulate forces from coincident nodes.
      else {
        q = treeNode;
        q.x = q.data.x;
        if (nDim > 1) { q.y = q.data.y; }
        if (nDim > 2) { q.z = q.data.z; }
        do strength += strengths[q.data.index];
        while (q = q.next);
      }

      treeNode.value = strength;
    }

    function apply(treeNode, x1, arg1, arg2, arg3) {
      if (!treeNode.value) return true;
      var x2 = [arg1, arg2, arg3][nDim-1];

      var x = treeNode.x - node.x,
          y = (nDim > 1 ? treeNode.y - node.y : 0),
          z = (nDim > 2 ? treeNode.z - node.z : 0),
          w = x2 - x1,
          l = x * x + y * y + z * z;

      // Apply the Barnes-Hut approximation if possible.
      // Limit forces for very close nodes; randomize direction if coincident.
      if (w * w / theta2 < l) {
        if (l < distanceMax2) {
          if (x === 0) x = jiggle(), l += x * x;
          if (nDim > 1 && y === 0) y = jiggle(), l += y * y;
          if (nDim > 2 && z === 0) z = jiggle(), l += z * z;
          if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
          node.vx += x * treeNode.value * alpha / l;
          if (nDim > 1) { node.vy += y * treeNode.value * alpha / l; }
          if (nDim > 2) { node.vz += z * treeNode.value * alpha / l; }
        }
        return true;
      }

      // Otherwise, process points directly.
      else if (treeNode.length || l >= distanceMax2) return;

      // Limit forces for very close nodes; randomize direction if coincident.
      if (treeNode.data !== node || treeNode.next) {
        if (x === 0) x = jiggle(), l += x * x;
        if (nDim > 1 && y === 0) y = jiggle(), l += y * y;
        if (nDim > 2 && z === 0) z = jiggle(), l += z * z;
        if (l < distanceMin2) l = Math.sqrt(distanceMin2 * l);
      }

      do if (treeNode.data !== node) {
        w = strengths[treeNode.data.index] * alpha / l;
        node.vx += x * w;
        if (nDim > 1) { node.vy += y * w; }
        if (nDim > 2) { node.vz += z * w; }
      } while (treeNode = treeNode.next);
    }

    force.initialize = function(initNodes, numDimensions) {
      nodes = initNodes;
      nDim = numDimensions;
      initialize();
    };

    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : strength;
    };

    force.distanceMin = function(_) {
      return arguments.length ? (distanceMin2 = _ * _, force) : Math.sqrt(distanceMin2);
    };

    force.distanceMax = function(_) {
      return arguments.length ? (distanceMax2 = _ * _, force) : Math.sqrt(distanceMax2);
    };

    force.theta = function(_) {
      return arguments.length ? (theta2 = _ * _, force) : Math.sqrt(theta2);
    };

    return force;
  }

  function d3ForceRadial(radius, x, y, z) {
    var nodes,
        nDim,
        strength = constant$4(0.1),
        strengths,
        radiuses;

    if (typeof radius !== "function") radius = constant$4(+radius);
    if (x == null) x = 0;
    if (y == null) y = 0;
    if (z == null) z = 0;

    function force(alpha) {
      for (var i = 0, n = nodes.length; i < n; ++i) {
        var node = nodes[i],
            dx = node.x - x || 1e-6,
            dy = (node.y || 0) - y || 1e-6,
            dz = (node.z || 0) - z || 1e-6,
            r = Math.sqrt(dx * dx + dy * dy + dz * dz),
            k = (radiuses[i] - r) * strengths[i] * alpha / r;
        node.vx += dx * k;
        if (nDim>1) { node.vy += dy * k; }
        if (nDim>2) { node.vz += dz * k; }
      }
    }

    function initialize() {
      if (!nodes) return;
      var i, n = nodes.length;
      strengths = new Array(n);
      radiuses = new Array(n);
      for (i = 0; i < n; ++i) {
        radiuses[i] = +radius(nodes[i], i, nodes);
        strengths[i] = isNaN(radiuses[i]) ? 0 : +strength(nodes[i], i, nodes);
      }
    }

    force.initialize = function(initNodes, numDimensions) {
      nodes = initNodes;
      nDim = numDimensions;
      initialize();
    };

    force.strength = function(_) {
      return arguments.length ? (strength = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : strength;
    };

    force.radius = function(_) {
      return arguments.length ? (radius = typeof _ === "function" ? _ : constant$4(+_), initialize(), force) : radius;
    };

    force.x = function(_) {
      return arguments.length ? (x = +_, force) : x;
    };

    force.y = function(_) {
      return arguments.length ? (y = +_, force) : y;
    };

    force.z = function(_) {
      return arguments.length ? (z = +_, force) : z;
    };

    return force;
  }

  var utils = createCommonjsModule(function (module) {
  (function() {

    // math-inlining.
    var abs = Math.abs,
      cos = Math.cos,
      sin = Math.sin,
      acos = Math.acos,
      atan2 = Math.atan2,
      sqrt = Math.sqrt,
      pow = Math.pow,
      // cube root function yielding real roots
      crt = function(v) {
        return v < 0 ? -pow(-v, 1 / 3) : pow(v, 1 / 3);
      },
      // trig constants
      pi = Math.PI,
      tau = 2 * pi,
      quart = pi / 2,
      // float precision significant decimal
      epsilon = 0.000001,
      // extremas used in bbox calculation and similar algorithms
      nMax = Number.MAX_SAFE_INTEGER || 9007199254740991,
      nMin = Number.MIN_SAFE_INTEGER || -9007199254740991,
      // a zero coordinate, which is surprisingly useful
      ZERO = { x: 0, y: 0, z: 0 };

    // Bezier utility functions
    var utils = {
      // Legendre-Gauss abscissae with n=24 (x_i values, defined at i=n as the roots of the nth order Legendre polynomial Pn(x))
      Tvalues: [
        -0.0640568928626056260850430826247450385909,
        0.0640568928626056260850430826247450385909,
        -0.1911188674736163091586398207570696318404,
        0.1911188674736163091586398207570696318404,
        -0.3150426796961633743867932913198102407864,
        0.3150426796961633743867932913198102407864,
        -0.4337935076260451384870842319133497124524,
        0.4337935076260451384870842319133497124524,
        -0.5454214713888395356583756172183723700107,
        0.5454214713888395356583756172183723700107,
        -0.6480936519369755692524957869107476266696,
        0.6480936519369755692524957869107476266696,
        -0.7401241915785543642438281030999784255232,
        0.7401241915785543642438281030999784255232,
        -0.8200019859739029219539498726697452080761,
        0.8200019859739029219539498726697452080761,
        -0.8864155270044010342131543419821967550873,
        0.8864155270044010342131543419821967550873,
        -0.9382745520027327585236490017087214496548,
        0.9382745520027327585236490017087214496548,
        -0.9747285559713094981983919930081690617411,
        0.9747285559713094981983919930081690617411,
        -0.9951872199970213601799974097007368118745,
        0.9951872199970213601799974097007368118745
      ],

      // Legendre-Gauss weights with n=24 (w_i values, defined by a function linked to in the Bezier primer article)
      Cvalues: [
        0.1279381953467521569740561652246953718517,
        0.1279381953467521569740561652246953718517,
        0.1258374563468282961213753825111836887264,
        0.1258374563468282961213753825111836887264,
        0.121670472927803391204463153476262425607,
        0.121670472927803391204463153476262425607,
        0.1155056680537256013533444839067835598622,
        0.1155056680537256013533444839067835598622,
        0.1074442701159656347825773424466062227946,
        0.1074442701159656347825773424466062227946,
        0.0976186521041138882698806644642471544279,
        0.0976186521041138882698806644642471544279,
        0.086190161531953275917185202983742667185,
        0.086190161531953275917185202983742667185,
        0.0733464814110803057340336152531165181193,
        0.0733464814110803057340336152531165181193,
        0.0592985849154367807463677585001085845412,
        0.0592985849154367807463677585001085845412,
        0.0442774388174198061686027482113382288593,
        0.0442774388174198061686027482113382288593,
        0.0285313886289336631813078159518782864491,
        0.0285313886289336631813078159518782864491,
        0.0123412297999871995468056670700372915759,
        0.0123412297999871995468056670700372915759
      ],

      arcfn: function(t, derivativeFn) {
        var d = derivativeFn(t);
        var l = d.x * d.x + d.y * d.y;
        if (typeof d.z !== "undefined") {
          l += d.z * d.z;
        }
        return sqrt(l);
      },

      compute: function(t, points, _3d) {
        // shortcuts
        if (t === 0) {
          return points[0];
        }

        var order = points.length-1;

        if (t === 1) {
          return points[order];
        }

        var p = points;
        var mt = 1 - t;

        // constant?
        if (order === 0) {
          return points[0];
        }

        // linear?
        if (order === 1) {
          ret = {
            x: mt * p[0].x + t * p[1].x,
            y: mt * p[0].y + t * p[1].y
          };
          if (_3d) {
            ret.z = mt * p[0].z + t * p[1].z;
          }
          return ret;
        }

        // quadratic/cubic curve?
        if (order < 4) {
          var mt2 = mt * mt,
            t2 = t * t,
            a,
            b,
            c,
            d = 0;
          if (order === 2) {
            p = [p[0], p[1], p[2], ZERO];
            a = mt2;
            b = mt * t * 2;
            c = t2;
          } else if (order === 3) {
            a = mt2 * mt;
            b = mt2 * t * 3;
            c = mt * t2 * 3;
            d = t * t2;
          }
          var ret = {
            x: a * p[0].x + b * p[1].x + c * p[2].x + d * p[3].x,
            y: a * p[0].y + b * p[1].y + c * p[2].y + d * p[3].y
          };
          if (_3d) {
            ret.z = a * p[0].z + b * p[1].z + c * p[2].z + d * p[3].z;
          }
          return ret;
        }

        // higher order curves: use de Casteljau's computation
        var dCpts = JSON.parse(JSON.stringify(points));
        while (dCpts.length > 1) {
          for (var i = 0; i < dCpts.length - 1; i++) {
            dCpts[i] = {
              x: dCpts[i].x + (dCpts[i + 1].x - dCpts[i].x) * t,
              y: dCpts[i].y + (dCpts[i + 1].y - dCpts[i].y) * t
            };
            if (typeof dCpts[i].z !== "undefined") {
              dCpts[i] = dCpts[i].z + (dCpts[i + 1].z - dCpts[i].z) * t;
            }
          }
          dCpts.splice(dCpts.length - 1, 1);
        }
        return dCpts[0];
      },

      derive: function (points, _3d) {
        var dpoints = [];
        for (var p = points, d = p.length, c = d - 1; d > 1; d--, c--) {
          var list = [];
          for (var j = 0, dpt; j < c; j++) {
            dpt = {
              x: c * (p[j + 1].x - p[j].x),
              y: c * (p[j + 1].y - p[j].y)
            };
            if (_3d) {
              dpt.z = c * (p[j + 1].z - p[j].z);
            }
            list.push(dpt);
          }
          dpoints.push(list);
          p = list;
        }
        return dpoints;
      },

      between: function(v, m, M) {
        return (
          (m <= v && v <= M) ||
          utils.approximately(v, m) ||
          utils.approximately(v, M)
        );
      },

      approximately: function(a, b, precision) {
        return abs(a - b) <= (precision || epsilon);
      },

      length: function(derivativeFn) {
        var z = 0.5,
          sum = 0,
          len = utils.Tvalues.length,
          i,
          t;
        for (i = 0; i < len; i++) {
          t = z * utils.Tvalues[i] + z;
          sum += utils.Cvalues[i] * utils.arcfn(t, derivativeFn);
        }
        return z * sum;
      },

      map: function(v, ds, de, ts, te) {
        var d1 = de - ds,
          d2 = te - ts,
          v2 = v - ds,
          r = v2 / d1;
        return ts + d2 * r;
      },

      lerp: function(r, v1, v2) {
        var ret = {
          x: v1.x + r * (v2.x - v1.x),
          y: v1.y + r * (v2.y - v1.y)
        };
        if (!!v1.z && !!v2.z) {
          ret.z = v1.z + r * (v2.z - v1.z);
        }
        return ret;
      },

      pointToString: function(p) {
        var s = p.x + "/" + p.y;
        if (typeof p.z !== "undefined") {
          s += "/" + p.z;
        }
        return s;
      },

      pointsToString: function(points) {
        return "[" + points.map(utils.pointToString).join(", ") + "]";
      },

      copy: function(obj) {
        return JSON.parse(JSON.stringify(obj));
      },

      angle: function(o, v1, v2) {
        var dx1 = v1.x - o.x,
          dy1 = v1.y - o.y,
          dx2 = v2.x - o.x,
          dy2 = v2.y - o.y,
          cross = dx1 * dy2 - dy1 * dx2,
          dot = dx1 * dx2 + dy1 * dy2;
        return atan2(cross, dot);
      },

      // round as string, to avoid rounding errors
      round: function(v, d) {
        var s = "" + v;
        var pos = s.indexOf(".");
        return parseFloat(s.substring(0, pos + 1 + d));
      },

      dist: function(p1, p2) {
        var dx = p1.x - p2.x,
          dy = p1.y - p2.y;
        return sqrt(dx * dx + dy * dy);
      },

      closest: function(LUT, point) {
        var mdist = pow(2, 63),
          mpos,
          d;
        LUT.forEach(function(p, idx) {
          d = utils.dist(point, p);
          if (d < mdist) {
            mdist = d;
            mpos = idx;
          }
        });
        return { mdist: mdist, mpos: mpos };
      },

      abcratio: function(t, n) {
        // see ratio(t) note on http://pomax.github.io/bezierinfo/#abc
        if (n !== 2 && n !== 3) {
          return false;
        }
        if (typeof t === "undefined") {
          t = 0.5;
        } else if (t === 0 || t === 1) {
          return t;
        }
        var bottom = pow(t, n) + pow(1 - t, n),
          top = bottom - 1;
        return abs(top / bottom);
      },

      projectionratio: function(t, n) {
        // see u(t) note on http://pomax.github.io/bezierinfo/#abc
        if (n !== 2 && n !== 3) {
          return false;
        }
        if (typeof t === "undefined") {
          t = 0.5;
        } else if (t === 0 || t === 1) {
          return t;
        }
        var top = pow(1 - t, n),
          bottom = pow(t, n) + top;
        return top / bottom;
      },

      lli8: function(x1, y1, x2, y2, x3, y3, x4, y4) {
        var nx =
            (x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4),
          ny = (x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4),
          d = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (d == 0) {
          return false;
        }
        return { x: nx / d, y: ny / d };
      },

      lli4: function(p1, p2, p3, p4) {
        var x1 = p1.x,
          y1 = p1.y,
          x2 = p2.x,
          y2 = p2.y,
          x3 = p3.x,
          y3 = p3.y,
          x4 = p4.x,
          y4 = p4.y;
        return utils.lli8(x1, y1, x2, y2, x3, y3, x4, y4);
      },

      lli: function(v1, v2) {
        return utils.lli4(v1, v1.c, v2, v2.c);
      },

      makeline: function(p1, p2) {
        var Bezier = bezier;
        var x1 = p1.x,
          y1 = p1.y,
          x2 = p2.x,
          y2 = p2.y,
          dx = (x2 - x1) / 3,
          dy = (y2 - y1) / 3;
        return new Bezier(
          x1,
          y1,
          x1 + dx,
          y1 + dy,
          x1 + 2 * dx,
          y1 + 2 * dy,
          x2,
          y2
        );
      },

      findbbox: function(sections) {
        var mx = nMax,
          my = nMax,
          MX = nMin,
          MY = nMin;
        sections.forEach(function(s) {
          var bbox = s.bbox();
          if (mx > bbox.x.min) mx = bbox.x.min;
          if (my > bbox.y.min) my = bbox.y.min;
          if (MX < bbox.x.max) MX = bbox.x.max;
          if (MY < bbox.y.max) MY = bbox.y.max;
        });
        return {
          x: { min: mx, mid: (mx + MX) / 2, max: MX, size: MX - mx },
          y: { min: my, mid: (my + MY) / 2, max: MY, size: MY - my }
        };
      },

      shapeintersections: function(
        s1,
        bbox1,
        s2,
        bbox2,
        curveIntersectionThreshold
      ) {
        if (!utils.bboxoverlap(bbox1, bbox2)) return [];
        var intersections = [];
        var a1 = [s1.startcap, s1.forward, s1.back, s1.endcap];
        var a2 = [s2.startcap, s2.forward, s2.back, s2.endcap];
        a1.forEach(function(l1) {
          if (l1.virtual) return;
          a2.forEach(function(l2) {
            if (l2.virtual) return;
            var iss = l1.intersects(l2, curveIntersectionThreshold);
            if (iss.length > 0) {
              iss.c1 = l1;
              iss.c2 = l2;
              iss.s1 = s1;
              iss.s2 = s2;
              intersections.push(iss);
            }
          });
        });
        return intersections;
      },

      makeshape: function(forward, back, curveIntersectionThreshold) {
        var bpl = back.points.length;
        var fpl = forward.points.length;
        var start = utils.makeline(back.points[bpl - 1], forward.points[0]);
        var end = utils.makeline(forward.points[fpl - 1], back.points[0]);
        var shape = {
          startcap: start,
          forward: forward,
          back: back,
          endcap: end,
          bbox: utils.findbbox([start, forward, back, end])
        };
        var self = utils;
        shape.intersections = function(s2) {
          return self.shapeintersections(
            shape,
            shape.bbox,
            s2,
            s2.bbox,
            curveIntersectionThreshold
          );
        };
        return shape;
      },

      getminmax: function(curve, d, list) {
        if (!list) return { min: 0, max: 0 };
        var min = nMax,
          max = nMin,
          t,
          c;
        if (list.indexOf(0) === -1) {
          list = [0].concat(list);
        }
        if (list.indexOf(1) === -1) {
          list.push(1);
        }
        for (var i = 0, len = list.length; i < len; i++) {
          t = list[i];
          c = curve.get(t);
          if (c[d] < min) {
            min = c[d];
          }
          if (c[d] > max) {
            max = c[d];
          }
        }
        return { min: min, mid: (min + max) / 2, max: max, size: max - min };
      },

      align: function(points, line) {
        var tx = line.p1.x,
          ty = line.p1.y,
          a = -atan2(line.p2.y - ty, line.p2.x - tx),
          d = function(v) {
            return {
              x: (v.x - tx) * cos(a) - (v.y - ty) * sin(a),
              y: (v.x - tx) * sin(a) + (v.y - ty) * cos(a)
            };
          };
        return points.map(d);
      },

      roots: function(points, line) {
        line = line || { p1: { x: 0, y: 0 }, p2: { x: 1, y: 0 } };
        var order = points.length - 1;
        var p = utils.align(points, line);
        var reduce = function(t) {
          return 0 <= t && t <= 1;
        };

        if (order === 2) {
          var a = p[0].y,
            b = p[1].y,
            c = p[2].y,
            d = a - 2 * b + c;
          if (d !== 0) {
            var m1 = -sqrt(b * b - a * c),
              m2 = -a + b,
              v1 = -(m1 + m2) / d,
              v2 = -(-m1 + m2) / d;
            return [v1, v2].filter(reduce);
          } else if (b !== c && d === 0) {
            return [(2*b - c)/(2*b - 2*c)].filter(reduce);
          }
          return [];
        }

        // see http://www.trans4mind.com/personal_development/mathematics/polynomials/cubicAlgebra.htm
        var pa = p[0].y,
          pb = p[1].y,
          pc = p[2].y,
          pd = p[3].y,
          d = -pa + 3 * pb - 3 * pc + pd,
          a = 3 * pa - 6 * pb + 3 * pc,
          b = -3 * pa + 3 * pb,
          c = pa;

        if (utils.approximately(d, 0)) {
          // this is not a cubic curve.
          if (utils.approximately(a, 0)) {
            // in fact, this is not a quadratic curve either.
            if (utils.approximately(b, 0)) {
              // in fact in fact, there are no solutions.
              return [];
            }
            // linear solution:
            return [-c / b].filter(reduce);
          }
          // quadratic solution:
          var q = sqrt(b * b - 4 * a * c),
            a2 = 2 * a;
          return [(q - b) / a2, (-b - q) / a2].filter(reduce);
        }

        // at this point, we know we need a cubic solution:

        a /= d;
        b /= d;
        c /= d;

        var p = (3 * b - a * a) / 3,
          p3 = p / 3,
          q = (2 * a * a * a - 9 * a * b + 27 * c) / 27,
          q2 = q / 2,
          discriminant = q2 * q2 + p3 * p3 * p3,
          u1,
          v1,
          x1,
          x2,
          x3;
        if (discriminant < 0) {
          var mp3 = -p / 3,
            mp33 = mp3 * mp3 * mp3,
            r = sqrt(mp33),
            t = -q / (2 * r),
            cosphi = t < -1 ? -1 : t > 1 ? 1 : t,
            phi = acos(cosphi),
            crtr = crt(r),
            t1 = 2 * crtr;
          x1 = t1 * cos(phi / 3) - a / 3;
          x2 = t1 * cos((phi + tau) / 3) - a / 3;
          x3 = t1 * cos((phi + 2 * tau) / 3) - a / 3;
          return [x1, x2, x3].filter(reduce);
        } else if (discriminant === 0) {
          u1 = q2 < 0 ? crt(-q2) : -crt(q2);
          x1 = 2 * u1 - a / 3;
          x2 = -u1 - a / 3;
          return [x1, x2].filter(reduce);
        } else {
          var sd = sqrt(discriminant);
          u1 = crt(-q2 + sd);
          v1 = crt(q2 + sd);
          return [u1 - v1 - a / 3].filter(reduce);
        }
      },

      droots: function(p) {
        // quadratic roots are easy
        if (p.length === 3) {
          var a = p[0],
            b = p[1],
            c = p[2],
            d = a - 2 * b + c;
          if (d !== 0) {
            var m1 = -sqrt(b * b - a * c),
              m2 = -a + b,
              v1 = -(m1 + m2) / d,
              v2 = -(-m1 + m2) / d;
            return [v1, v2];
          } else if (b !== c && d === 0) {
            return [(2 * b - c) / (2 * (b - c))];
          }
          return [];
        }

        // linear roots are even easier
        if (p.length === 2) {
          var a = p[0],
            b = p[1];
          if (a !== b) {
            return [a / (a - b)];
          }
          return [];
        }
      },

      curvature: function(t, points, _3d) {
        var dpoints = utils.derive(points);
        var d1 = dpoints[0];
        var d2 = dpoints[1];

        //
        // We're using the following formula for curvature:
        //
        //              x'y" - y'x"
        //   k(t) = ------------------
        //           (x'² + y'²)^(2/3)
        //
        // from https://en.wikipedia.org/wiki/Radius_of_curvature#Definition
        //
        // With it corresponding 3D counterpart:
        //
        //          sqrt( (y'z" - y"z')² + (z'x" - z"x')² + (x'y" - x"y')²)
        //   k(t) = -------------------------------------------------------
        //                     (x'² + y'² + z'²)^(2/3)
        //
        var d = utils.compute(t, d1);
        var dd = utils.compute(t, d2);
        var num, dnm;
        if (_3d) {
          num = sqrt(
            pow(d.y*dd.z - dd.y*d.z, 2) +
            pow(d.z*dd.x - dd.z*d.x, 2) +
            pow(d.x*dd.y - dd.x*d.y, 2)
          );
          dnm = pow(d.x*d.x + d.y*d.y + d.z*d.z, 2/3);
        } else {
          num = d.x*dd.y - d.y*dd.x;
          dnm = pow(d.x*d.x + d.y*d.y, 2/3);
        }

        if (num === 0 || dnm === 0) {
          return { k:0, r:0 };
        }

        return { k: num/dnm, r: dnm/num };
      },

      inflections: function(points) {
        if (points.length < 4) return [];

        // FIXME: TODO: add in inflection abstraction for quartic+ curves?

        var p = utils.align(points, { p1: points[0], p2: points.slice(-1)[0] }),
          a = p[2].x * p[1].y,
          b = p[3].x * p[1].y,
          c = p[1].x * p[2].y,
          d = p[3].x * p[2].y,
          v1 = 18 * (-3 * a + 2 * b + 3 * c - d),
          v2 = 18 * (3 * a - b - 3 * c),
          v3 = 18 * (c - a);

        if (utils.approximately(v1, 0)) {
          if (!utils.approximately(v2, 0)) {
            var t = -v3 / v2;
            if (0 <= t && t <= 1) return [t];
          }
          return [];
        }

        var trm = v2 * v2 - 4 * v1 * v3,
          sq = Math.sqrt(trm),
          d = 2 * v1;

        if (utils.approximately(d, 0)) return [];

        return [(sq - v2) / d, -(v2 + sq) / d].filter(function(r) {
          return 0 <= r && r <= 1;
        });
      },

      bboxoverlap: function(b1, b2) {
        var dims = ["x", "y"],
          len = dims.length,
          i,
          dim,
          l,
          t,
          d;
        for (i = 0; i < len; i++) {
          dim = dims[i];
          l = b1[dim].mid;
          t = b2[dim].mid;
          d = (b1[dim].size + b2[dim].size) / 2;
          if (abs(l - t) >= d) return false;
        }
        return true;
      },

      expandbox: function(bbox, _bbox) {
        if (_bbox.x.min < bbox.x.min) {
          bbox.x.min = _bbox.x.min;
        }
        if (_bbox.y.min < bbox.y.min) {
          bbox.y.min = _bbox.y.min;
        }
        if (_bbox.z && _bbox.z.min < bbox.z.min) {
          bbox.z.min = _bbox.z.min;
        }
        if (_bbox.x.max > bbox.x.max) {
          bbox.x.max = _bbox.x.max;
        }
        if (_bbox.y.max > bbox.y.max) {
          bbox.y.max = _bbox.y.max;
        }
        if (_bbox.z && _bbox.z.max > bbox.z.max) {
          bbox.z.max = _bbox.z.max;
        }
        bbox.x.mid = (bbox.x.min + bbox.x.max) / 2;
        bbox.y.mid = (bbox.y.min + bbox.y.max) / 2;
        if (bbox.z) {
          bbox.z.mid = (bbox.z.min + bbox.z.max) / 2;
        }
        bbox.x.size = bbox.x.max - bbox.x.min;
        bbox.y.size = bbox.y.max - bbox.y.min;
        if (bbox.z) {
          bbox.z.size = bbox.z.max - bbox.z.min;
        }
      },

      pairiteration: function(c1, c2, curveIntersectionThreshold) {
        var c1b = c1.bbox(),
          c2b = c2.bbox(),
          r = 100000,
          threshold = curveIntersectionThreshold || 0.5;
        if (
          c1b.x.size + c1b.y.size < threshold &&
          c2b.x.size + c2b.y.size < threshold
        ) {
          return [
            ((r * (c1._t1 + c1._t2) / 2) | 0) / r +
              "/" +
              ((r * (c2._t1 + c2._t2) / 2) | 0) / r
          ];
        }
        var cc1 = c1.split(0.5),
          cc2 = c2.split(0.5),
          pairs = [
            { left: cc1.left, right: cc2.left },
            { left: cc1.left, right: cc2.right },
            { left: cc1.right, right: cc2.right },
            { left: cc1.right, right: cc2.left }
          ];
        pairs = pairs.filter(function(pair) {
          return utils.bboxoverlap(pair.left.bbox(), pair.right.bbox());
        });
        var results = [];
        if (pairs.length === 0) return results;
        pairs.forEach(function(pair) {
          results = results.concat(
            utils.pairiteration(pair.left, pair.right, threshold)
          );
        });
        results = results.filter(function(v, i) {
          return results.indexOf(v) === i;
        });
        return results;
      },

      getccenter: function(p1, p2, p3) {
        var dx1 = p2.x - p1.x,
          dy1 = p2.y - p1.y,
          dx2 = p3.x - p2.x,
          dy2 = p3.y - p2.y;
        var dx1p = dx1 * cos(quart) - dy1 * sin(quart),
          dy1p = dx1 * sin(quart) + dy1 * cos(quart),
          dx2p = dx2 * cos(quart) - dy2 * sin(quart),
          dy2p = dx2 * sin(quart) + dy2 * cos(quart);
        // chord midpoints
        var mx1 = (p1.x + p2.x) / 2,
          my1 = (p1.y + p2.y) / 2,
          mx2 = (p2.x + p3.x) / 2,
          my2 = (p2.y + p3.y) / 2;
        // midpoint offsets
        var mx1n = mx1 + dx1p,
          my1n = my1 + dy1p,
          mx2n = mx2 + dx2p,
          my2n = my2 + dy2p;
        // intersection of these lines:
        var arc = utils.lli8(mx1, my1, mx1n, my1n, mx2, my2, mx2n, my2n),
          r = utils.dist(arc, p1),
          // arc start/end values, over mid point:
          s = atan2(p1.y - arc.y, p1.x - arc.x),
          m = atan2(p2.y - arc.y, p2.x - arc.x),
          e = atan2(p3.y - arc.y, p3.x - arc.x),
          _;
        // determine arc direction (cw/ccw correction)
        if (s < e) {
          // if s<m<e, arc(s, e)
          // if m<s<e, arc(e, s + tau)
          // if s<e<m, arc(e, s + tau)
          if (s > m || m > e) {
            s += tau;
          }
          if (s > e) {
            _ = e;
            e = s;
            s = _;
          }
        } else {
          // if e<m<s, arc(e, s)
          // if m<e<s, arc(s, e + tau)
          // if e<s<m, arc(s, e + tau)
          if (e < m && m < s) {
            _ = e;
            e = s;
            s = _;
          } else {
            e += tau;
          }
        }
        // assign and done.
        arc.s = s;
        arc.e = e;
        arc.r = r;
        return arc;
      },

      numberSort: function(a, b) {
        return a - b;
      }
    };

    module.exports = utils;
  })();
  });

  var polyBezier = createCommonjsModule(function (module) {
  (function() {

    var utils$$1 = utils;

    /**
     * Poly Bezier
     * @param {[type]} curves [description]
     */
    var PolyBezier = function(curves) {
      this.curves = [];
      this._3d = false;
      if (!!curves) {
        this.curves = curves;
        this._3d = this.curves[0]._3d;
      }
    };

    PolyBezier.prototype = {
      valueOf: function() {
        return this.toString();
      },
      toString: function() {
        return (
          "[" +
          this.curves
            .map(function(curve) {
              return utils$$1.pointsToString(curve.points);
            })
            .join(", ") +
          "]"
        );
      },
      addCurve: function(curve) {
        this.curves.push(curve);
        this._3d = this._3d || curve._3d;
      },
      length: function() {
        return this.curves
          .map(function(v) {
            return v.length();
          })
          .reduce(function(a, b) {
            return a + b;
          });
      },
      curve: function(idx) {
        return this.curves[idx];
      },
      bbox: function() {
        var c = this.curves;
        var bbox = c[0].bbox();
        for (var i = 1; i < c.length; i++) {
          utils$$1.expandbox(bbox, c[i].bbox());
        }
        return bbox;
      },
      offset: function(d) {
        var offset = [];
        this.curves.forEach(function(v) {
          offset = offset.concat(v.offset(d));
        });
        return new PolyBezier(offset);
      }
    };

    module.exports = PolyBezier;
  })();
  });

  /**
   * Normalise an SVG path to absolute coordinates
   * and full commands, rather than relative coordinates
   * and/or shortcut commands.
   */
  function normalizePath(d) {
    // preprocess "d" so that we have spaces between values
    d = d
      .replace(/,/g, " ") // replace commas with spaces
      .replace(/-/g, " - ") // add spacing around minus signs
      .replace(/-\s+/g, "-") // remove spacing to the right of minus signs.
      .replace(/([a-zA-Z])/g, " $1 ");

    // set up the variables used in this function
    var instructions = d.replace(/([a-zA-Z])\s?/g, "|$1").split("|"),
      instructionLength = instructions.length,
      i,
      instruction,
      op,
      lop,
      args = [],
      alen,
      a,
      sx = 0,
      sy = 0,
      x = 0,
      y = 0,
      cx = 0,
      cy = 0,
      cx2 = 0,
      cy2 = 0,
      normalized = "";

    // we run through the instruction list starting at 1, not 0,
    // because we split up "|M x y ...." so the first element will
    // always be an empty string. By design.
    for (i = 1; i < instructionLength; i++) {
      // which instruction is this?
      instruction = instructions[i];
      op = instruction.substring(0, 1);
      lop = op.toLowerCase();

      // what are the arguments? note that we need to convert
      // all strings into numbers, or + will do silly things.
      args = instruction
        .replace(op, "")
        .trim()
        .split(" ");
      args = args
        .filter(function(v) {
          return v !== "";
        })
        .map(parseFloat);
      alen = args.length;

      // we could use a switch, but elaborate code in a "case" with
      // fallthrough is just horrid to read. So let's use ifthen
      // statements instead.

      // moveto command (plus possible lineto)
      if (lop === "m") {
        normalized += "M ";
        if (op === "m") {
          x += args[0];
          y += args[1];
        } else {
          x = args[0];
          y = args[1];
        }
        // records start position, for dealing
        // with the shape close operator ('Z')
        sx = x;
        sy = y;
        normalized += x + " " + y + " ";
        if (alen > 2) {
          for (a = 0; a < alen; a += 2) {
            if (op === "m") {
              x += args[a];
              y += args[a + 1];
            } else {
              x = args[a];
              y = args[a + 1];
            }
            normalized += ["L",x,y,''].join(" ");
          }
        }
      } else if (lop === "l") {
        // lineto commands
        for (a = 0; a < alen; a += 2) {
          if (op === "l") {
            x += args[a];
            y += args[a + 1];
          } else {
            x = args[a];
            y = args[a + 1];
          }
          normalized += ["L",x,y,''].join(" ");
        }
      } else if (lop === "h") {
        for (a = 0; a < alen; a++) {
          if (op === "h") {
            x += args[a];
          } else {
            x = args[a];
          }
          normalized += ["L",x,y,''].join(" ");
        }
      } else if (lop === "v") {
        for (a = 0; a < alen; a++) {
          if (op === "v") {
            y += args[a];
          } else {
            y = args[a];
          }
          normalized += ["L",x,y,''].join(" ");
        }
      } else if (lop === "q") {
        // quadratic curveto commands
        for (a = 0; a < alen; a += 4) {
          if (op === "q") {
            cx = x + args[a];
            cy = y + args[a + 1];
            x += args[a + 2];
            y += args[a + 3];
          } else {
            cx = args[a];
            cy = args[a + 1];
            x = args[a + 2];
            y = args[a + 3];
          }
          normalized += ["Q",cx,cy,x,y,''].join(" ");
        }
      } else if (lop === "t") {
        for (a = 0; a < alen; a += 2) {
          // reflect previous cx/cy over x/y
          cx = x + (x - cx);
          cy = y + (y - cy);
          // then get real end point
          if (op === "t") {
            x += args[a];
            y += args[a + 1];
          } else {
            x = args[a];
            y = args[a + 1];
          }
          normalized += ["Q",cx,cy,x,y,''].join(" ");
        }
      } else if (lop === "c") {
        // cubic curveto commands
        for (a = 0; a < alen; a += 6) {
          if (op === "c") {
            cx = x + args[a];
            cy = y + args[a + 1];
            cx2 = x + args[a + 2];
            cy2 = y + args[a + 3];
            x += args[a + 4];
            y += args[a + 5];
          } else {
            cx = args[a];
            cy = args[a + 1];
            cx2 = args[a + 2];
            cy2 = args[a + 3];
            x = args[a + 4];
            y = args[a + 5];
          }
          normalized += ["C",cx,cy,cx2,cy2,x,y,''].join(" ");
        }
      } else if (lop === "s") {
        for (a = 0; a < alen; a += 4) {
          // reflect previous cx2/cy2 over x/y
          cx = x + (x - cx2);
          cy = y + (y - cy2);
          // then get real control and end point
          if (op === "s") {
            cx2 = x + args[a];
            cy2 = y + args[a + 1];
            x += args[a + 2];
            y += args[a + 3];
          } else {
            cx2 = args[a];
            cy2 = args[a + 1];
            x = args[a + 2];
            y = args[a + 3];
          }
          normalized +=["C",cx,cy,cx2,cy2,x,y,''].join(" ");
        }
      } else if (lop === "z") {
        normalized += "Z ";
        // not unimportant: path closing changes the current x/y coordinate
        x = sx;
        y = sy;
      }
    }
    return normalized.trim();
  }

  var normaliseSvg = normalizePath;

  var M = { x: false, y: false };

  function makeBezier(Bezier, term, values) {
    if (term === 'Z') return;
    if (term === 'M') {
      M = {x: values[0], y: values[1]};
      return;
    }
    // ES7: new Bezier(M.x, M.y, ...values)
    var cvalues = [false, M.x, M.y].concat(values);
    var PreboundConstructor = Bezier.bind.apply(Bezier, cvalues);
    var curve = new PreboundConstructor();
    var last = values.slice(-2);
    M = { x : last[0], y: last[1] };
    return curve;
  }

  function convertPath(Bezier, d) {
    var terms = normaliseSvg(d).split(" "),
      term,
      matcher = new RegExp("[MLCQZ]", ""),
      segment,
      values,
      segments = [],
      ARGS = { "C": 6, "Q": 4, "L": 2, "M": 2};

    while (terms.length) {
      term = terms.splice(0,1)[0];
      if (matcher.test(term)) {
        values = terms.splice(0, ARGS[term]).map(parseFloat);
        segment = makeBezier(Bezier, term, values);
        if (segment) segments.push(segment);
      }
    }

    return new Bezier.PolyBezier(segments);
  }

  var svgToBeziers = convertPath;

  var bezier = createCommonjsModule(function (module) {
  /**
    A javascript Bezier curve library by Pomax.

    Based on http://pomax.github.io/bezierinfo

    This code is MIT licensed.
  **/
  (function() {

    // math-inlining.
    var abs = Math.abs,
      min = Math.min,
      max = Math.max,
      cos = Math.cos,
      sin = Math.sin,
      acos = Math.acos,
      sqrt = Math.sqrt,
      pi = Math.PI,
      // a zero coordinate, which is surprisingly useful
      ZERO = { x: 0, y: 0, z: 0 };

    // quite needed
    var utils$$1 = utils;

    // only used for outlines atm.
    var PolyBezier = polyBezier;

    /**
     * Bezier curve constructor. The constructor argument can be one of three things:
     *
     * 1. array/4 of {x:..., y:..., z:...}, z optional
     * 2. numerical array/8 ordered x1,y1,x2,y2,x3,y3,x4,y4
     * 3. numerical array/12 ordered x1,y1,z1,x2,y2,z2,x3,y3,z3,x4,y4,z4
     *
     */
    var Bezier = function(coords) {
      var args = coords && coords.forEach ? coords : [].slice.call(arguments);
      var coordlen = false;
      if (typeof args[0] === "object") {
        coordlen = args.length;
        var newargs = [];
        args.forEach(function(point) {
          ["x", "y", "z"].forEach(function(d) {
            if (typeof point[d] !== "undefined") {
              newargs.push(point[d]);
            }
          });
        });
        args = newargs;
      }
      var higher = false;
      var len = args.length;
      if (coordlen) {
        if (coordlen > 4) {
          if (arguments.length !== 1) {
            throw new Error(
              "Only new Bezier(point[]) is accepted for 4th and higher order curves"
            );
          }
          higher = true;
        }
      } else {
        if (len !== 6 && len !== 8 && len !== 9 && len !== 12) {
          if (arguments.length !== 1) {
            throw new Error(
              "Only new Bezier(point[]) is accepted for 4th and higher order curves"
            );
          }
        }
      }
      var _3d =
        (!higher && (len === 9 || len === 12)) ||
        (coords && coords[0] && typeof coords[0].z !== "undefined");
      this._3d = _3d;
      var points = [];
      for (var idx = 0, step = _3d ? 3 : 2; idx < len; idx += step) {
        var point = {
          x: args[idx],
          y: args[idx + 1]
        };
        if (_3d) {
          point.z = args[idx + 2];
        }
        points.push(point);
      }
      this.order = points.length - 1;
      this.points = points;
      var dims = ["x", "y"];
      if (_3d) dims.push("z");
      this.dims = dims;
      this.dimlen = dims.length;

      (function(curve) {
        var order = curve.order;
        var points = curve.points;
        var a = utils$$1.align(points, { p1: points[0], p2: points[order] });
        for (var i = 0; i < a.length; i++) {
          if (abs(a[i].y) > 0.0001) {
            curve._linear = false;
            return;
          }
        }
        curve._linear = true;
      })(this);

      this._t1 = 0;
      this._t2 = 1;
      this.update();
    };

    var svgToBeziers$$1 = svgToBeziers;

    /**
     * turn an svg <path> d attribute into a sequence of Bezier segments.
     */
    Bezier.SVGtoBeziers = function(d) {
      return svgToBeziers$$1(Bezier, d);
    };

    function getABC(n, S, B, E, t) {
      if (typeof t === "undefined") {
        t = 0.5;
      }
      var u = utils$$1.projectionratio(t, n),
        um = 1 - u,
        C = {
          x: u * S.x + um * E.x,
          y: u * S.y + um * E.y
        },
        s = utils$$1.abcratio(t, n),
        A = {
          x: B.x + (B.x - C.x) / s,
          y: B.y + (B.y - C.y) / s
        };
      return { A: A, B: B, C: C };
    }

    Bezier.quadraticFromPoints = function(p1, p2, p3, t) {
      if (typeof t === "undefined") {
        t = 0.5;
      }
      // shortcuts, although they're really dumb
      if (t === 0) {
        return new Bezier(p2, p2, p3);
      }
      if (t === 1) {
        return new Bezier(p1, p2, p2);
      }
      // real fitting.
      var abc = getABC(2, p1, p2, p3, t);
      return new Bezier(p1, abc.A, p3);
    };

    Bezier.cubicFromPoints = function(S, B, E, t, d1) {
      if (typeof t === "undefined") {
        t = 0.5;
      }
      var abc = getABC(3, S, B, E, t);
      if (typeof d1 === "undefined") {
        d1 = utils$$1.dist(B, abc.C);
      }
      var d2 = d1 * (1 - t) / t;

      var selen = utils$$1.dist(S, E),
        lx = (E.x - S.x) / selen,
        ly = (E.y - S.y) / selen,
        bx1 = d1 * lx,
        by1 = d1 * ly,
        bx2 = d2 * lx,
        by2 = d2 * ly;
      // derivation of new hull coordinates
      var e1 = { x: B.x - bx1, y: B.y - by1 },
        e2 = { x: B.x + bx2, y: B.y + by2 },
        A = abc.A,
        v1 = { x: A.x + (e1.x - A.x) / (1 - t), y: A.y + (e1.y - A.y) / (1 - t) },
        v2 = { x: A.x + (e2.x - A.x) / t, y: A.y + (e2.y - A.y) / t },
        nc1 = { x: S.x + (v1.x - S.x) / t, y: S.y + (v1.y - S.y) / t },
        nc2 = {
          x: E.x + (v2.x - E.x) / (1 - t),
          y: E.y + (v2.y - E.y) / (1 - t)
        };
      // ...done
      return new Bezier(S, nc1, nc2, E);
    };

    var getUtils = function() {
      return utils$$1;
    };

    Bezier.getUtils = getUtils;

    Bezier.PolyBezier = PolyBezier;

    Bezier.prototype = {
      getUtils: getUtils,
      valueOf: function() {
        return this.toString();
      },
      toString: function() {
        return utils$$1.pointsToString(this.points);
      },
      toSVG: function(relative) {
        if (this._3d) return false;
        var p = this.points,
          x = p[0].x,
          y = p[0].y,
          s = ["M", x, y, this.order === 2 ? "Q" : "C"];
        for (var i = 1, last = p.length; i < last; i++) {
          s.push(p[i].x);
          s.push(p[i].y);
        }
        return s.join(" ");
      },
      update: function() {
        // invalidate any precomputed LUT
        this._lut = [];
        this.dpoints = utils$$1.derive(this.points, this._3d);
        this.computedirection();
      },
      computedirection: function() {
        var points = this.points;
        var angle = utils$$1.angle(points[0], points[this.order], points[1]);
        this.clockwise = angle > 0;
      },
      length: function() {
        return utils$$1.length(this.derivative.bind(this));
      },
      _lut: [],
      getLUT: function(steps) {
        steps = steps || 100;
        if (this._lut.length === steps) {
          return this._lut;
        }
        this._lut = [];
        // We want a range from 0 to 1 inclusive, so
        // we decrement and then use <= rather than <:
        steps--;
        for (var t = 0; t <= steps; t++) {
          this._lut.push(this.compute(t / steps));
        }
        return this._lut;
      },
      on: function(point, error) {
        error = error || 5;
        var lut = this.getLUT(),
          hits = [],
          c,
          t = 0;
        for (var i = 0; i < lut.length; i++) {
          c = lut[i];
          if (utils$$1.dist(c, point) < error) {
            hits.push(c);
            t += i / lut.length;
          }
        }
        if (!hits.length) return false;
        return (t /= hits.length);
      },
      project: function(point) {
        // step 1: coarse check
        var LUT = this.getLUT(),
          l = LUT.length - 1,
          closest = utils$$1.closest(LUT, point),
          mdist = closest.mdist,
          mpos = closest.mpos;
        if (mpos === 0 || mpos === l) {
          var t = mpos / l,
            pt = this.compute(t);
          pt.t = t;
          pt.d = mdist;
          return pt;
        }

        // step 2: fine check
        var ft,
          t,
          p,
          d,
          t1 = (mpos - 1) / l,
          t2 = (mpos + 1) / l,
          step = 0.1 / l;
        mdist += 1;
        for (t = t1, ft = t; t < t2 + step; t += step) {
          p = this.compute(t);
          d = utils$$1.dist(point, p);
          if (d < mdist) {
            mdist = d;
            ft = t;
          }
        }
        p = this.compute(ft);
        p.t = ft;
        p.d = mdist;
        return p;
      },
      get: function(t) {
        return this.compute(t);
      },
      point: function(idx) {
        return this.points[idx];
      },
      compute: function(t) {
        return utils$$1.compute(t, this.points, this._3d);
      },
      raise: function() {
        var p = this.points,
          np = [p[0]],
          i,
          k = p.length,
          pi,
          pim;
        for (var i = 1; i < k; i++) {
          pi = p[i];
          pim = p[i - 1];
          np[i] = {
            x: (k - i) / k * pi.x + i / k * pim.x,
            y: (k - i) / k * pi.y + i / k * pim.y
          };
        }
        np[k] = p[k - 1];
        return new Bezier(np);
      },
      derivative: function(t) {
        var mt = 1 - t,
          a,
          b,
          c = 0,
          p = this.dpoints[0];
        if (this.order === 2) {
          p = [p[0], p[1], ZERO];
          a = mt;
          b = t;
        }
        if (this.order === 3) {
          a = mt * mt;
          b = mt * t * 2;
          c = t * t;
        }
        var ret = {
          x: a * p[0].x + b * p[1].x + c * p[2].x,
          y: a * p[0].y + b * p[1].y + c * p[2].y
        };
        if (this._3d) {
          ret.z = a * p[0].z + b * p[1].z + c * p[2].z;
        }
        return ret;
      },
      curvature: function(t) {
        return utils$$1.curvature(t, this.points, this._3d);
      },
      inflections: function() {
        return utils$$1.inflections(this.points);
      },
      normal: function(t) {
        return this._3d ? this.__normal3(t) : this.__normal2(t);
      },
      __normal2: function(t) {
        var d = this.derivative(t);
        var q = sqrt(d.x * d.x + d.y * d.y);
        return { x: -d.y / q, y: d.x / q };
      },
      __normal3: function(t) {
        // see http://stackoverflow.com/questions/25453159
        var r1 = this.derivative(t),
          r2 = this.derivative(t + 0.01),
          q1 = sqrt(r1.x * r1.x + r1.y * r1.y + r1.z * r1.z),
          q2 = sqrt(r2.x * r2.x + r2.y * r2.y + r2.z * r2.z);
        r1.x /= q1;
        r1.y /= q1;
        r1.z /= q1;
        r2.x /= q2;
        r2.y /= q2;
        r2.z /= q2;
        // cross product
        var c = {
          x: r2.y * r1.z - r2.z * r1.y,
          y: r2.z * r1.x - r2.x * r1.z,
          z: r2.x * r1.y - r2.y * r1.x
        };
        var m = sqrt(c.x * c.x + c.y * c.y + c.z * c.z);
        c.x /= m;
        c.y /= m;
        c.z /= m;
        // rotation matrix
        var R = [
          c.x * c.x,
          c.x * c.y - c.z,
          c.x * c.z + c.y,
          c.x * c.y + c.z,
          c.y * c.y,
          c.y * c.z - c.x,
          c.x * c.z - c.y,
          c.y * c.z + c.x,
          c.z * c.z
        ];
        // normal vector:
        var n = {
          x: R[0] * r1.x + R[1] * r1.y + R[2] * r1.z,
          y: R[3] * r1.x + R[4] * r1.y + R[5] * r1.z,
          z: R[6] * r1.x + R[7] * r1.y + R[8] * r1.z
        };
        return n;
      },
      hull: function(t) {
        var p = this.points,
          _p = [],
          pt,
          q = [],
          idx = 0,
          i = 0,
          l = 0;
        q[idx++] = p[0];
        q[idx++] = p[1];
        q[idx++] = p[2];
        if (this.order === 3) {
          q[idx++] = p[3];
        }
        // we lerp between all points at each iteration, until we have 1 point left.
        while (p.length > 1) {
          _p = [];
          for (i = 0, l = p.length - 1; i < l; i++) {
            pt = utils$$1.lerp(t, p[i], p[i + 1]);
            q[idx++] = pt;
            _p.push(pt);
          }
          p = _p;
        }
        return q;
      },
      split: function(t1, t2) {
        // shortcuts
        if (t1 === 0 && !!t2) {
          return this.split(t2).left;
        }
        if (t2 === 1) {
          return this.split(t1).right;
        }

        // no shortcut: use "de Casteljau" iteration.
        var q = this.hull(t1);
        var result = {
          left:
            this.order === 2
              ? new Bezier([q[0], q[3], q[5]])
              : new Bezier([q[0], q[4], q[7], q[9]]),
          right:
            this.order === 2
              ? new Bezier([q[5], q[4], q[2]])
              : new Bezier([q[9], q[8], q[6], q[3]]),
          span: q
        };

        // make sure we bind _t1/_t2 information!
        result.left._t1 = utils$$1.map(0, 0, 1, this._t1, this._t2);
        result.left._t2 = utils$$1.map(t1, 0, 1, this._t1, this._t2);
        result.right._t1 = utils$$1.map(t1, 0, 1, this._t1, this._t2);
        result.right._t2 = utils$$1.map(1, 0, 1, this._t1, this._t2);

        // if we have no t2, we're done
        if (!t2) {
          return result;
        }

        // if we have a t2, split again:
        t2 = utils$$1.map(t2, t1, 1, 0, 1);
        var subsplit = result.right.split(t2);
        return subsplit.left;
      },
      extrema: function() {
        var dims = this.dims,
          result = {},
          roots = [],
          p,
          mfn;
        dims.forEach(
          function(dim) {
            mfn = function(v) {
              return v[dim];
            };
            p = this.dpoints[0].map(mfn);
            result[dim] = utils$$1.droots(p);
            if (this.order === 3) {
              p = this.dpoints[1].map(mfn);
              result[dim] = result[dim].concat(utils$$1.droots(p));
            }
            result[dim] = result[dim].filter(function(t) {
              return t >= 0 && t <= 1;
            });
            roots = roots.concat(result[dim].sort(utils$$1.numberSort));
          }.bind(this)
        );
        roots = roots.sort(utils$$1.numberSort).filter(function(v, idx) {
          return roots.indexOf(v) === idx;
        });
        result.values = roots;
        return result;
      },
      bbox: function() {
        var extrema = this.extrema(),
          result = {};
        this.dims.forEach(
          function(d) {
            result[d] = utils$$1.getminmax(this, d, extrema[d]);
          }.bind(this)
        );
        return result;
      },
      overlaps: function(curve) {
        var lbbox = this.bbox(),
          tbbox = curve.bbox();
        return utils$$1.bboxoverlap(lbbox, tbbox);
      },
      offset: function(t, d) {
        if (typeof d !== "undefined") {
          var c = this.get(t);
          var n = this.normal(t);
          var ret = {
            c: c,
            n: n,
            x: c.x + n.x * d,
            y: c.y + n.y * d
          };
          if (this._3d) {
            ret.z = c.z + n.z * d;
          }
          return ret;
        }
        if (this._linear) {
          var nv = this.normal(0);
          var coords = this.points.map(function(p) {
            var ret = {
              x: p.x + t * nv.x,
              y: p.y + t * nv.y
            };
            if (p.z && n.z) {
              ret.z = p.z + t * nv.z;
            }
            return ret;
          });
          return [new Bezier(coords)];
        }
        var reduced = this.reduce();
        return reduced.map(function(s) {
          return s.scale(t);
        });
      },
      simple: function() {
        if (this.order === 3) {
          var a1 = utils$$1.angle(this.points[0], this.points[3], this.points[1]);
          var a2 = utils$$1.angle(this.points[0], this.points[3], this.points[2]);
          if ((a1 > 0 && a2 < 0) || (a1 < 0 && a2 > 0)) return false;
        }
        var n1 = this.normal(0);
        var n2 = this.normal(1);
        var s = n1.x * n2.x + n1.y * n2.y;
        if (this._3d) {
          s += n1.z * n2.z;
        }
        var angle = abs(acos(s));
        return angle < pi / 3;
      },
      reduce: function() {
        var i,
          t1 = 0,
          t2 = 0,
          step = 0.01,
          segment,
          pass1 = [],
          pass2 = [];
        // first pass: split on extrema
        var extrema = this.extrema().values;
        if (extrema.indexOf(0) === -1) {
          extrema = [0].concat(extrema);
        }
        if (extrema.indexOf(1) === -1) {
          extrema.push(1);
        }

        for (t1 = extrema[0], i = 1; i < extrema.length; i++) {
          t2 = extrema[i];
          segment = this.split(t1, t2);
          segment._t1 = t1;
          segment._t2 = t2;
          pass1.push(segment);
          t1 = t2;
        }

        // second pass: further reduce these segments to simple segments
        pass1.forEach(function(p1) {
          t1 = 0;
          t2 = 0;
          while (t2 <= 1) {
            for (t2 = t1 + step; t2 <= 1 + step; t2 += step) {
              segment = p1.split(t1, t2);
              if (!segment.simple()) {
                t2 -= step;
                if (abs(t1 - t2) < step) {
                  // we can never form a reduction
                  return [];
                }
                segment = p1.split(t1, t2);
                segment._t1 = utils$$1.map(t1, 0, 1, p1._t1, p1._t2);
                segment._t2 = utils$$1.map(t2, 0, 1, p1._t1, p1._t2);
                pass2.push(segment);
                t1 = t2;
                break;
              }
            }
          }
          if (t1 < 1) {
            segment = p1.split(t1, 1);
            segment._t1 = utils$$1.map(t1, 0, 1, p1._t1, p1._t2);
            segment._t2 = p1._t2;
            pass2.push(segment);
          }
        });
        return pass2;
      },
      scale: function(d) {
        var order = this.order;
        var distanceFn = false;
        if (typeof d === "function") {
          distanceFn = d;
        }
        if (distanceFn && order === 2) {
          return this.raise().scale(distanceFn);
        }

        // TODO: add special handling for degenerate (=linear) curves.
        var clockwise = this.clockwise;
        var r1 = distanceFn ? distanceFn(0) : d;
        var r2 = distanceFn ? distanceFn(1) : d;
        var v = [this.offset(0, 10), this.offset(1, 10)];
        var o = utils$$1.lli4(v[0], v[0].c, v[1], v[1].c);
        if (!o) {
          throw new Error("cannot scale this curve. Try reducing it first.");
        }
        // move all points by distance 'd' wrt the origin 'o'
        var points = this.points,
          np = [];

        // move end points by fixed distance along normal.
        [0, 1].forEach(
          function(t) {
            var p = (np[t * order] = utils$$1.copy(points[t * order]));
            p.x += (t ? r2 : r1) * v[t].n.x;
            p.y += (t ? r2 : r1) * v[t].n.y;
          }.bind(this)
        );

        if (!distanceFn) {
          // move control points to lie on the intersection of the offset
          // derivative vector, and the origin-through-control vector
          [0, 1].forEach(
            function(t) {
              if (this.order === 2 && !!t) return;
              var p = np[t * order];
              var d = this.derivative(t);
              var p2 = { x: p.x + d.x, y: p.y + d.y };
              np[t + 1] = utils$$1.lli4(p, p2, o, points[t + 1]);
            }.bind(this)
          );
          return new Bezier(np);
        }

        // move control points by "however much necessary to
        // ensure the correct tangent to endpoint".
        [0, 1].forEach(
          function(t) {
            if (this.order === 2 && !!t) return;
            var p = points[t + 1];
            var ov = {
              x: p.x - o.x,
              y: p.y - o.y
            };
            var rc = distanceFn ? distanceFn((t + 1) / order) : d;
            if (distanceFn && !clockwise) rc = -rc;
            var m = sqrt(ov.x * ov.x + ov.y * ov.y);
            ov.x /= m;
            ov.y /= m;
            np[t + 1] = {
              x: p.x + rc * ov.x,
              y: p.y + rc * ov.y
            };
          }.bind(this)
        );
        return new Bezier(np);
      },
      outline: function(d1, d2, d3, d4) {
        d2 = typeof d2 === "undefined" ? d1 : d2;
        var reduced = this.reduce(),
          len = reduced.length,
          fcurves = [],
          bcurves = [],
          p,
          alen = 0,
          tlen = this.length();

        var graduated = typeof d3 !== "undefined" && typeof d4 !== "undefined";

        function linearDistanceFunction(s, e, tlen, alen, slen) {
          return function(v) {
            var f1 = alen / tlen,
              f2 = (alen + slen) / tlen,
              d = e - s;
            return utils$$1.map(v, 0, 1, s + f1 * d, s + f2 * d);
          };
        }

        // form curve oulines
        reduced.forEach(function(segment) {
          slen = segment.length();
          if (graduated) {
            fcurves.push(
              segment.scale(linearDistanceFunction(d1, d3, tlen, alen, slen))
            );
            bcurves.push(
              segment.scale(linearDistanceFunction(-d2, -d4, tlen, alen, slen))
            );
          } else {
            fcurves.push(segment.scale(d1));
            bcurves.push(segment.scale(-d2));
          }
          alen += slen;
        });

        // reverse the "return" outline
        bcurves = bcurves
          .map(function(s) {
            p = s.points;
            if (p[3]) {
              s.points = [p[3], p[2], p[1], p[0]];
            } else {
              s.points = [p[2], p[1], p[0]];
            }
            return s;
          })
          .reverse();

        // form the endcaps as lines
        var fs = fcurves[0].points[0],
          fe = fcurves[len - 1].points[fcurves[len - 1].points.length - 1],
          bs = bcurves[len - 1].points[bcurves[len - 1].points.length - 1],
          be = bcurves[0].points[0],
          ls = utils$$1.makeline(bs, fs),
          le = utils$$1.makeline(fe, be),
          segments = [ls]
            .concat(fcurves)
            .concat([le])
            .concat(bcurves),
          slen = segments.length;

        return new PolyBezier(segments);
      },
      outlineshapes: function(d1, d2, curveIntersectionThreshold) {
        d2 = d2 || d1;
        var outline = this.outline(d1, d2).curves;
        var shapes = [];
        for (var i = 1, len = outline.length; i < len / 2; i++) {
          var shape = utils$$1.makeshape(
            outline[i],
            outline[len - i],
            curveIntersectionThreshold
          );
          shape.startcap.virtual = i > 1;
          shape.endcap.virtual = i < len / 2 - 1;
          shapes.push(shape);
        }
        return shapes;
      },
      intersects: function(curve, curveIntersectionThreshold) {
        if (!curve) return this.selfintersects(curveIntersectionThreshold);
        if (curve.p1 && curve.p2) {
          return this.lineIntersects(curve);
        }
        if (curve instanceof Bezier) {
          curve = curve.reduce();
        }
        return this.curveintersects(
          this.reduce(),
          curve,
          curveIntersectionThreshold
        );
      },
      lineIntersects: function(line) {
        var mx = min(line.p1.x, line.p2.x),
          my = min(line.p1.y, line.p2.y),
          MX = max(line.p1.x, line.p2.x),
          MY = max(line.p1.y, line.p2.y),
          self = this;
        return utils$$1.roots(this.points, line).filter(function(t) {
          var p = self.get(t);
          return utils$$1.between(p.x, mx, MX) && utils$$1.between(p.y, my, MY);
        });
      },
      selfintersects: function(curveIntersectionThreshold) {
        var reduced = this.reduce();
        // "simple" curves cannot intersect with their direct
        // neighbour, so for each segment X we check whether
        // it intersects [0:x-2][x+2:last].
        var i,
          len = reduced.length - 2,
          results = [],
          result,
          left,
          right;
        for (i = 0; i < len; i++) {
          left = reduced.slice(i, i + 1);
          right = reduced.slice(i + 2);
          result = this.curveintersects(left, right, curveIntersectionThreshold);
          results = results.concat(result);
        }
        return results;
      },
      curveintersects: function(c1, c2, curveIntersectionThreshold) {
        var pairs = [];
        // step 1: pair off any overlapping segments
        c1.forEach(function(l) {
          c2.forEach(function(r) {
            if (l.overlaps(r)) {
              pairs.push({ left: l, right: r });
            }
          });
        });
        // step 2: for each pairing, run through the convergence algorithm.
        var intersections = [];
        pairs.forEach(function(pair) {
          var result = utils$$1.pairiteration(
            pair.left,
            pair.right,
            curveIntersectionThreshold
          );
          if (result.length > 0) {
            intersections = intersections.concat(result);
          }
        });
        return intersections;
      },
      arcs: function(errorThreshold) {
        errorThreshold = errorThreshold || 0.5;
        var circles = [];
        return this._iterate(errorThreshold, circles);
      },
      _error: function(pc, np1, s, e) {
        var q = (e - s) / 4,
          c1 = this.get(s + q),
          c2 = this.get(e - q),
          ref = utils$$1.dist(pc, np1),
          d1 = utils$$1.dist(pc, c1),
          d2 = utils$$1.dist(pc, c2);
        return abs(d1 - ref) + abs(d2 - ref);
      },
      _iterate: function(errorThreshold, circles) {
        var t_s = 0,
          t_e = 1,
          safety;
        // we do a binary search to find the "good `t` closest to no-longer-good"
        do {
          safety = 0;

          // step 1: start with the maximum possible arc
          t_e = 1;

          // points:
          var np1 = this.get(t_s),
            np2,
            np3,
            arc,
            prev_arc;

          // booleans:
          var curr_good = false,
            prev_good = false,
            done;

          // numbers:
          var t_m = t_e,
            prev_e = 1;

          // step 2: find the best possible arc
          do {
            prev_good = curr_good;
            prev_arc = arc;
            t_m = (t_s + t_e) / 2;

            np2 = this.get(t_m);
            np3 = this.get(t_e);

            arc = utils$$1.getccenter(np1, np2, np3);

            //also save the t values
            arc.interval = {
              start: t_s,
              end: t_e
            };

            var error = this._error(arc, np1, t_s, t_e);
            curr_good = error <= errorThreshold;

            done = prev_good && !curr_good;
            if (!done) prev_e = t_e;

            // this arc is fine: we can move 'e' up to see if we can find a wider arc
            if (curr_good) {
              // if e is already at max, then we're done for this arc.
              if (t_e >= 1) {
                // make sure we cap at t=1
                arc.interval.end = prev_e = 1;
                prev_arc = arc;
                // if we capped the arc segment to t=1 we also need to make sure that
                // the arc's end angle is correct with respect to the bezier end point.
                if (t_e > 1) {
                  var d = {
                    x: arc.x + arc.r * cos(arc.e),
                    y: arc.y + arc.r * sin(arc.e)
                  };
                  arc.e += utils$$1.angle({ x: arc.x, y: arc.y }, d, this.get(1));
                }
                break;
              }
              // if not, move it up by half the iteration distance
              t_e = t_e + (t_e - t_s) / 2;
            } else {
              // this is a bad arc: we need to move 'e' down to find a good arc
              t_e = t_m;
            }
          } while (!done && safety++ < 100);

          if (safety >= 100) {
            break;
          }

          // console.log("L835: [F] arc found", t_s, prev_e, prev_arc.x, prev_arc.y, prev_arc.s, prev_arc.e);

          prev_arc = prev_arc ? prev_arc : arc;
          circles.push(prev_arc);
          t_s = prev_e;
        } while (t_e < 1);
        return circles;
      }
    };

    module.exports = Bezier;
  })();
  });

  var bezierJs = bezier;

  var indexArrayBy_min = createCommonjsModule(function (module, exports) {
  !function(r,e){module.exports=e();}("undefined"!=typeof self?self:commonjsGlobal,function(){return function(t){var n={};function o(r){if(n[r])return n[r].exports;var e=n[r]={i:r,l:!1,exports:{}};return t[r].call(e.exports,e,e.exports,o),e.l=!0,e.exports}return o.m=t,o.c=n,o.d=function(r,e,t){o.o(r,e)||Object.defineProperty(r,e,{configurable:!1,enumerable:!0,get:t});},o.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return o.d(e,"a",e),e},o.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},o.p="",o(o.s=0)}([function(r,e,t){var n,o,i;o=[r,e],void 0===(i="function"==typeof(n=function(r,e){Object.defineProperty(e,"__esModule",{value:!0});var f=function(r,e){if(Array.isArray(r))return r;if(Symbol.iterator in Object(r))return function(r,e){var t=[],n=!0,o=!1,i=void 0;try{for(var u,f=r[Symbol.iterator]();!(n=(u=f.next()).done)&&(t.push(u.value),!e||t.length!==e);n=!0);}catch(r){o=!0,i=r;}finally{try{!n&&f.return&&f.return();}finally{if(o)throw i}}return t}(r,e);throw new TypeError("Invalid attempt to destructure non-iterable instance")};e.default=function(r,e){var a=!(2<arguments.length&&void 0!==arguments[2])||arguments[2],t=3<arguments.length&&void 0!==arguments[3]&&arguments[3],s=(e instanceof Array?e:[e]).map(function(r){return {keyAccessor:r,isProp:!(r instanceof Function)}}),n=r.reduce(function(r,e){var f=r,c=e;return s.forEach(function(r,e){var t=r.keyAccessor,n=void 0;if(r.isProp){var o=c,i=o[t],u=function(r,e){var t={};for(var n in r)0<=e.indexOf(n)||Object.prototype.hasOwnProperty.call(r,n)&&(t[n]=r[n]);return t}(o,[t]);n=i,c=u;}else n=t(c);e+1<s.length?(f.hasOwnProperty(n)||(f[n]={}),f=f[n]):a?(f.hasOwnProperty(n)||(f[n]=[]),f[n].push(c)):f[n]=c;}),r},{});a instanceof Function&&function e(t){var n=1<arguments.length&&void 0!==arguments[1]?arguments[1]:1;n===s.length?Object.keys(t).forEach(function(r){return t[r]=a(t[r])}):Object.values(t).forEach(function(r){return e(r,n+1)});}(n);var u=n;return t&&(u=[],function o(r){var i=1<arguments.length&&void 0!==arguments[1]?arguments[1]:[];i.length===s.length?u.push({keys:i,vals:r}):Object.entries(r).forEach(function(r){var e=f(r,2),t=e[0],n=e[1];return o(n,[].concat(function(r){if(Array.isArray(r)){for(var e=0,t=Array(r.length);e<r.length;e++)t[e]=r[e];return t}return Array.from(r)}(i),[t]))});}(n)),u},r.exports=e.default;})?n.apply(e,o):n)||(r.exports=i);}])});
  });

  var indexBy = unwrapExports(indexArrayBy_min);
  var indexArrayBy_min_1 = indexArrayBy_min.indexBy;

  function colors(specifier) {
    var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
    while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
    return colors;
  }

  colors("1f77b4ff7f0e2ca02cd627289467bd8c564be377c27f7f7fbcbd2217becf");

  colors("7fc97fbeaed4fdc086ffff99386cb0f0027fbf5b17666666");

  colors("1b9e77d95f027570b3e7298a66a61ee6ab02a6761d666666");

  var schemePaired = colors("a6cee31f78b4b2df8a33a02cfb9a99e31a1cfdbf6fff7f00cab2d66a3d9affff99b15928");

  colors("fbb4aeb3cde3ccebc5decbe4fed9a6ffffcce5d8bdfddaecf2f2f2");

  colors("b3e2cdfdcdaccbd5e8f4cae4e6f5c9fff2aef1e2cccccccc");

  colors("e41a1c377eb84daf4a984ea3ff7f00ffff33a65628f781bf999999");

  colors("66c2a5fc8d628da0cbe78ac3a6d854ffd92fe5c494b3b3b3");

  colors("8dd3c7ffffb3bebadafb807280b1d3fdb462b3de69fccde5d9d9d9bc80bdccebc5ffed6f");

  function ramp(scheme) {
    return rgbBasis(scheme[scheme.length - 1]);
  }

  var scheme = new Array(3).concat(
    "d8b365f5f5f55ab4ac",
    "a6611adfc27d80cdc1018571",
    "a6611adfc27df5f5f580cdc1018571",
    "8c510ad8b365f6e8c3c7eae55ab4ac01665e",
    "8c510ad8b365f6e8c3f5f5f5c7eae55ab4ac01665e",
    "8c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e",
    "8c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e",
    "5430058c510abf812ddfc27df6e8c3c7eae580cdc135978f01665e003c30",
    "5430058c510abf812ddfc27df6e8c3f5f5f5c7eae580cdc135978f01665e003c30"
  ).map(colors);

  ramp(scheme);

  var scheme$1 = new Array(3).concat(
    "af8dc3f7f7f77fbf7b",
    "7b3294c2a5cfa6dba0008837",
    "7b3294c2a5cff7f7f7a6dba0008837",
    "762a83af8dc3e7d4e8d9f0d37fbf7b1b7837",
    "762a83af8dc3e7d4e8f7f7f7d9f0d37fbf7b1b7837",
    "762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b7837",
    "762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b7837",
    "40004b762a839970abc2a5cfe7d4e8d9f0d3a6dba05aae611b783700441b",
    "40004b762a839970abc2a5cfe7d4e8f7f7f7d9f0d3a6dba05aae611b783700441b"
  ).map(colors);

  ramp(scheme$1);

  var scheme$2 = new Array(3).concat(
    "e9a3c9f7f7f7a1d76a",
    "d01c8bf1b6dab8e1864dac26",
    "d01c8bf1b6daf7f7f7b8e1864dac26",
    "c51b7de9a3c9fde0efe6f5d0a1d76a4d9221",
    "c51b7de9a3c9fde0eff7f7f7e6f5d0a1d76a4d9221",
    "c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221",
    "c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221",
    "8e0152c51b7dde77aef1b6dafde0efe6f5d0b8e1867fbc414d9221276419",
    "8e0152c51b7dde77aef1b6dafde0eff7f7f7e6f5d0b8e1867fbc414d9221276419"
  ).map(colors);

  ramp(scheme$2);

  var scheme$3 = new Array(3).concat(
    "998ec3f7f7f7f1a340",
    "5e3c99b2abd2fdb863e66101",
    "5e3c99b2abd2f7f7f7fdb863e66101",
    "542788998ec3d8daebfee0b6f1a340b35806",
    "542788998ec3d8daebf7f7f7fee0b6f1a340b35806",
    "5427888073acb2abd2d8daebfee0b6fdb863e08214b35806",
    "5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b35806",
    "2d004b5427888073acb2abd2d8daebfee0b6fdb863e08214b358067f3b08",
    "2d004b5427888073acb2abd2d8daebf7f7f7fee0b6fdb863e08214b358067f3b08"
  ).map(colors);

  ramp(scheme$3);

  var scheme$4 = new Array(3).concat(
    "ef8a62f7f7f767a9cf",
    "ca0020f4a58292c5de0571b0",
    "ca0020f4a582f7f7f792c5de0571b0",
    "b2182bef8a62fddbc7d1e5f067a9cf2166ac",
    "b2182bef8a62fddbc7f7f7f7d1e5f067a9cf2166ac",
    "b2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac",
    "b2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac",
    "67001fb2182bd6604df4a582fddbc7d1e5f092c5de4393c32166ac053061",
    "67001fb2182bd6604df4a582fddbc7f7f7f7d1e5f092c5de4393c32166ac053061"
  ).map(colors);

  ramp(scheme$4);

  var scheme$5 = new Array(3).concat(
    "ef8a62ffffff999999",
    "ca0020f4a582bababa404040",
    "ca0020f4a582ffffffbababa404040",
    "b2182bef8a62fddbc7e0e0e09999994d4d4d",
    "b2182bef8a62fddbc7ffffffe0e0e09999994d4d4d",
    "b2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d",
    "b2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d",
    "67001fb2182bd6604df4a582fddbc7e0e0e0bababa8787874d4d4d1a1a1a",
    "67001fb2182bd6604df4a582fddbc7ffffffe0e0e0bababa8787874d4d4d1a1a1a"
  ).map(colors);

  ramp(scheme$5);

  var scheme$6 = new Array(3).concat(
    "fc8d59ffffbf91bfdb",
    "d7191cfdae61abd9e92c7bb6",
    "d7191cfdae61ffffbfabd9e92c7bb6",
    "d73027fc8d59fee090e0f3f891bfdb4575b4",
    "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
    "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
    "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
    "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
    "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
  ).map(colors);

  ramp(scheme$6);

  var scheme$7 = new Array(3).concat(
    "fc8d59ffffbf91cf60",
    "d7191cfdae61a6d96a1a9641",
    "d7191cfdae61ffffbfa6d96a1a9641",
    "d73027fc8d59fee08bd9ef8b91cf601a9850",
    "d73027fc8d59fee08bffffbfd9ef8b91cf601a9850",
    "d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850",
    "d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850",
    "a50026d73027f46d43fdae61fee08bd9ef8ba6d96a66bd631a9850006837",
    "a50026d73027f46d43fdae61fee08bffffbfd9ef8ba6d96a66bd631a9850006837"
  ).map(colors);

  ramp(scheme$7);

  var scheme$8 = new Array(3).concat(
    "fc8d59ffffbf99d594",
    "d7191cfdae61abdda42b83ba",
    "d7191cfdae61ffffbfabdda42b83ba",
    "d53e4ffc8d59fee08be6f59899d5943288bd",
    "d53e4ffc8d59fee08bffffbfe6f59899d5943288bd",
    "d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd",
    "d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd",
    "9e0142d53e4ff46d43fdae61fee08be6f598abdda466c2a53288bd5e4fa2",
    "9e0142d53e4ff46d43fdae61fee08bffffbfe6f598abdda466c2a53288bd5e4fa2"
  ).map(colors);

  ramp(scheme$8);

  var scheme$9 = new Array(3).concat(
    "e5f5f999d8c92ca25f",
    "edf8fbb2e2e266c2a4238b45",
    "edf8fbb2e2e266c2a42ca25f006d2c",
    "edf8fbccece699d8c966c2a42ca25f006d2c",
    "edf8fbccece699d8c966c2a441ae76238b45005824",
    "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45005824",
    "f7fcfde5f5f9ccece699d8c966c2a441ae76238b45006d2c00441b"
  ).map(colors);

  ramp(scheme$9);

  var scheme$a = new Array(3).concat(
    "e0ecf49ebcda8856a7",
    "edf8fbb3cde38c96c688419d",
    "edf8fbb3cde38c96c68856a7810f7c",
    "edf8fbbfd3e69ebcda8c96c68856a7810f7c",
    "edf8fbbfd3e69ebcda8c96c68c6bb188419d6e016b",
    "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d6e016b",
    "f7fcfde0ecf4bfd3e69ebcda8c96c68c6bb188419d810f7c4d004b"
  ).map(colors);

  ramp(scheme$a);

  var scheme$b = new Array(3).concat(
    "e0f3dba8ddb543a2ca",
    "f0f9e8bae4bc7bccc42b8cbe",
    "f0f9e8bae4bc7bccc443a2ca0868ac",
    "f0f9e8ccebc5a8ddb57bccc443a2ca0868ac",
    "f0f9e8ccebc5a8ddb57bccc44eb3d32b8cbe08589e",
    "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe08589e",
    "f7fcf0e0f3dbccebc5a8ddb57bccc44eb3d32b8cbe0868ac084081"
  ).map(colors);

  ramp(scheme$b);

  var scheme$c = new Array(3).concat(
    "fee8c8fdbb84e34a33",
    "fef0d9fdcc8afc8d59d7301f",
    "fef0d9fdcc8afc8d59e34a33b30000",
    "fef0d9fdd49efdbb84fc8d59e34a33b30000",
    "fef0d9fdd49efdbb84fc8d59ef6548d7301f990000",
    "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301f990000",
    "fff7ecfee8c8fdd49efdbb84fc8d59ef6548d7301fb300007f0000"
  ).map(colors);

  ramp(scheme$c);

  var scheme$d = new Array(3).concat(
    "ece2f0a6bddb1c9099",
    "f6eff7bdc9e167a9cf02818a",
    "f6eff7bdc9e167a9cf1c9099016c59",
    "f6eff7d0d1e6a6bddb67a9cf1c9099016c59",
    "f6eff7d0d1e6a6bddb67a9cf3690c002818a016450",
    "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016450",
    "fff7fbece2f0d0d1e6a6bddb67a9cf3690c002818a016c59014636"
  ).map(colors);

  ramp(scheme$d);

  var scheme$e = new Array(3).concat(
    "ece7f2a6bddb2b8cbe",
    "f1eef6bdc9e174a9cf0570b0",
    "f1eef6bdc9e174a9cf2b8cbe045a8d",
    "f1eef6d0d1e6a6bddb74a9cf2b8cbe045a8d",
    "f1eef6d0d1e6a6bddb74a9cf3690c00570b0034e7b",
    "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0034e7b",
    "fff7fbece7f2d0d1e6a6bddb74a9cf3690c00570b0045a8d023858"
  ).map(colors);

  ramp(scheme$e);

  var scheme$f = new Array(3).concat(
    "e7e1efc994c7dd1c77",
    "f1eef6d7b5d8df65b0ce1256",
    "f1eef6d7b5d8df65b0dd1c77980043",
    "f1eef6d4b9dac994c7df65b0dd1c77980043",
    "f1eef6d4b9dac994c7df65b0e7298ace125691003f",
    "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125691003f",
    "f7f4f9e7e1efd4b9dac994c7df65b0e7298ace125698004367001f"
  ).map(colors);

  ramp(scheme$f);

  var scheme$g = new Array(3).concat(
    "fde0ddfa9fb5c51b8a",
    "feebe2fbb4b9f768a1ae017e",
    "feebe2fbb4b9f768a1c51b8a7a0177",
    "feebe2fcc5c0fa9fb5f768a1c51b8a7a0177",
    "feebe2fcc5c0fa9fb5f768a1dd3497ae017e7a0177",
    "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a0177",
    "fff7f3fde0ddfcc5c0fa9fb5f768a1dd3497ae017e7a017749006a"
  ).map(colors);

  ramp(scheme$g);

  var scheme$h = new Array(3).concat(
    "edf8b17fcdbb2c7fb8",
    "ffffcca1dab441b6c4225ea8",
    "ffffcca1dab441b6c42c7fb8253494",
    "ffffccc7e9b47fcdbb41b6c42c7fb8253494",
    "ffffccc7e9b47fcdbb41b6c41d91c0225ea80c2c84",
    "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea80c2c84",
    "ffffd9edf8b1c7e9b47fcdbb41b6c41d91c0225ea8253494081d58"
  ).map(colors);

  ramp(scheme$h);

  var scheme$i = new Array(3).concat(
    "f7fcb9addd8e31a354",
    "ffffccc2e69978c679238443",
    "ffffccc2e69978c67931a354006837",
    "ffffccd9f0a3addd8e78c67931a354006837",
    "ffffccd9f0a3addd8e78c67941ab5d238443005a32",
    "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443005a32",
    "ffffe5f7fcb9d9f0a3addd8e78c67941ab5d238443006837004529"
  ).map(colors);

  ramp(scheme$i);

  var scheme$j = new Array(3).concat(
    "fff7bcfec44fd95f0e",
    "ffffd4fed98efe9929cc4c02",
    "ffffd4fed98efe9929d95f0e993404",
    "ffffd4fee391fec44ffe9929d95f0e993404",
    "ffffd4fee391fec44ffe9929ec7014cc4c028c2d04",
    "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c028c2d04",
    "ffffe5fff7bcfee391fec44ffe9929ec7014cc4c02993404662506"
  ).map(colors);

  ramp(scheme$j);

  var scheme$k = new Array(3).concat(
    "ffeda0feb24cf03b20",
    "ffffb2fecc5cfd8d3ce31a1c",
    "ffffb2fecc5cfd8d3cf03b20bd0026",
    "ffffb2fed976feb24cfd8d3cf03b20bd0026",
    "ffffb2fed976feb24cfd8d3cfc4e2ae31a1cb10026",
    "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cb10026",
    "ffffccffeda0fed976feb24cfd8d3cfc4e2ae31a1cbd0026800026"
  ).map(colors);

  ramp(scheme$k);

  var scheme$l = new Array(3).concat(
    "deebf79ecae13182bd",
    "eff3ffbdd7e76baed62171b5",
    "eff3ffbdd7e76baed63182bd08519c",
    "eff3ffc6dbef9ecae16baed63182bd08519c",
    "eff3ffc6dbef9ecae16baed64292c62171b5084594",
    "f7fbffdeebf7c6dbef9ecae16baed64292c62171b5084594",
    "f7fbffdeebf7c6dbef9ecae16baed64292c62171b508519c08306b"
  ).map(colors);

  ramp(scheme$l);

  var scheme$m = new Array(3).concat(
    "e5f5e0a1d99b31a354",
    "edf8e9bae4b374c476238b45",
    "edf8e9bae4b374c47631a354006d2c",
    "edf8e9c7e9c0a1d99b74c47631a354006d2c",
    "edf8e9c7e9c0a1d99b74c47641ab5d238b45005a32",
    "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45005a32",
    "f7fcf5e5f5e0c7e9c0a1d99b74c47641ab5d238b45006d2c00441b"
  ).map(colors);

  ramp(scheme$m);

  var scheme$n = new Array(3).concat(
    "f0f0f0bdbdbd636363",
    "f7f7f7cccccc969696525252",
    "f7f7f7cccccc969696636363252525",
    "f7f7f7d9d9d9bdbdbd969696636363252525",
    "f7f7f7d9d9d9bdbdbd969696737373525252252525",
    "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525",
    "fffffff0f0f0d9d9d9bdbdbd969696737373525252252525000000"
  ).map(colors);

  ramp(scheme$n);

  var scheme$o = new Array(3).concat(
    "efedf5bcbddc756bb1",
    "f2f0f7cbc9e29e9ac86a51a3",
    "f2f0f7cbc9e29e9ac8756bb154278f",
    "f2f0f7dadaebbcbddc9e9ac8756bb154278f",
    "f2f0f7dadaebbcbddc9e9ac8807dba6a51a34a1486",
    "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a34a1486",
    "fcfbfdefedf5dadaebbcbddc9e9ac8807dba6a51a354278f3f007d"
  ).map(colors);

  ramp(scheme$o);

  var scheme$p = new Array(3).concat(
    "fee0d2fc9272de2d26",
    "fee5d9fcae91fb6a4acb181d",
    "fee5d9fcae91fb6a4ade2d26a50f15",
    "fee5d9fcbba1fc9272fb6a4ade2d26a50f15",
    "fee5d9fcbba1fc9272fb6a4aef3b2ccb181d99000d",
    "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181d99000d",
    "fff5f0fee0d2fcbba1fc9272fb6a4aef3b2ccb181da50f1567000d"
  ).map(colors);

  ramp(scheme$p);

  var scheme$q = new Array(3).concat(
    "fee6cefdae6be6550d",
    "feeddefdbe85fd8d3cd94701",
    "feeddefdbe85fd8d3ce6550da63603",
    "feeddefdd0a2fdae6bfd8d3ce6550da63603",
    "feeddefdd0a2fdae6bfd8d3cf16913d948018c2d04",
    "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d948018c2d04",
    "fff5ebfee6cefdd0a2fdae6bfd8d3cf16913d94801a636037f2704"
  ).map(colors);

  ramp(scheme$q);

  cubehelixLong(cubehelix(300, 0.5, 0.0), cubehelix(-240, 0.5, 1.0));

  var warm = cubehelixLong(cubehelix(-100, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

  var cool = cubehelixLong(cubehelix(260, 0.75, 0.35), cubehelix(80, 1.50, 0.8));

  var c = cubehelix();

  var c$1 = rgb(),
      pi_1_3 = Math.PI / 3,
      pi_2_3 = Math.PI * 2 / 3;

  function ramp$1(range) {
    var n = range.length;
    return function(t) {
      return range[Math.max(0, Math.min(n - 1, Math.floor(t * n)))];
    };
  }

  ramp$1(colors("44015444025645045745055946075a46085c460a5d460b5e470d60470e6147106347116447136548146748166848176948186a481a6c481b6d481c6e481d6f481f70482071482173482374482475482576482677482878482979472a7a472c7a472d7b472e7c472f7d46307e46327e46337f463480453581453781453882443983443a83443b84433d84433e85423f854240864241864142874144874045884046883f47883f48893e49893e4a893e4c8a3d4d8a3d4e8a3c4f8a3c508b3b518b3b528b3a538b3a548c39558c39568c38588c38598c375a8c375b8d365c8d365d8d355e8d355f8d34608d34618d33628d33638d32648e32658e31668e31678e31688e30698e306a8e2f6b8e2f6c8e2e6d8e2e6e8e2e6f8e2d708e2d718e2c718e2c728e2c738e2b748e2b758e2a768e2a778e2a788e29798e297a8e297b8e287c8e287d8e277e8e277f8e27808e26818e26828e26828e25838e25848e25858e24868e24878e23888e23898e238a8d228b8d228c8d228d8d218e8d218f8d21908d21918c20928c20928c20938c1f948c1f958b1f968b1f978b1f988b1f998a1f9a8a1e9b8a1e9c891e9d891f9e891f9f881fa0881fa1881fa1871fa28720a38620a48621a58521a68522a78522a88423a98324aa8325ab8225ac8226ad8127ad8128ae8029af7f2ab07f2cb17e2db27d2eb37c2fb47c31b57b32b67a34b67935b77937b87838b9773aba763bbb753dbc743fbc7340bd7242be7144bf7046c06f48c16e4ac16d4cc26c4ec36b50c46a52c56954c56856c66758c7655ac8645cc8635ec96260ca6063cb5f65cb5e67cc5c69cd5b6ccd5a6ece5870cf5773d05675d05477d1537ad1517cd2507fd34e81d34d84d44b86d54989d5488bd6468ed64590d74393d74195d84098d83e9bd93c9dd93ba0da39a2da37a5db36a8db34aadc32addc30b0dd2fb2dd2db5de2bb8de29bade28bddf26c0df25c2df23c5e021c8e020cae11fcde11dd0e11cd2e21bd5e21ad8e219dae319dde318dfe318e2e418e5e419e7e419eae51aece51befe51cf1e51df4e61ef6e620f8e621fbe723fde725"));

  var magma = ramp$1(colors("00000401000501010601010802010902020b02020d03030f03031204041405041606051806051a07061c08071e0907200a08220b09240c09260d0a290e0b2b100b2d110c2f120d31130d34140e36150e38160f3b180f3d19103f1a10421c10441d11471e114920114b21114e22115024125325125527125829115a2a115c2c115f2d11612f116331116533106734106936106b38106c390f6e3b0f703d0f713f0f72400f74420f75440f764510774710784910784a10794c117a4e117b4f127b51127c52137c54137d56147d57157e59157e5a167e5c167f5d177f5f187f601880621980641a80651a80671b80681c816a1c816b1d816d1d816e1e81701f81721f817320817521817621817822817922827b23827c23827e24828025828125818326818426818627818827818928818b29818c29818e2a81902a81912b81932b80942c80962c80982d80992d809b2e7f9c2e7f9e2f7fa02f7fa1307ea3307ea5317ea6317da8327daa337dab337cad347cae347bb0357bb2357bb3367ab5367ab73779b83779ba3878bc3978bd3977bf3a77c03a76c23b75c43c75c53c74c73d73c83e73ca3e72cc3f71cd4071cf4070d0416fd2426fd3436ed5446dd6456cd8456cd9466bdb476adc4869de4968df4a68e04c67e24d66e34e65e44f64e55064e75263e85362e95462ea5661eb5760ec5860ed5a5fee5b5eef5d5ef05f5ef1605df2625df2645cf3655cf4675cf4695cf56b5cf66c5cf66e5cf7705cf7725cf8745cf8765cf9785df9795df97b5dfa7d5efa7f5efa815ffb835ffb8560fb8761fc8961fc8a62fc8c63fc8e64fc9065fd9266fd9467fd9668fd9869fd9a6afd9b6bfe9d6cfe9f6dfea16efea36ffea571fea772fea973feaa74feac76feae77feb078feb27afeb47bfeb67cfeb77efeb97ffebb81febd82febf84fec185fec287fec488fec68afec88cfeca8dfecc8ffecd90fecf92fed194fed395fed597fed799fed89afdda9cfddc9efddea0fde0a1fde2a3fde3a5fde5a7fde7a9fde9aafdebacfcecaefceeb0fcf0b2fcf2b4fcf4b6fcf6b8fcf7b9fcf9bbfcfbbdfcfdbf"));

  var inferno = ramp$1(colors("00000401000501010601010802010a02020c02020e03021004031204031405041706041907051b08051d09061f0a07220b07240c08260d08290e092b10092d110a30120a32140b34150b37160b39180c3c190c3e1b0c411c0c431e0c451f0c48210c4a230c4c240c4f260c51280b53290b552b0b572d0b592f0a5b310a5c320a5e340a5f3609613809623909633b09643d09653e0966400a67420a68440a68450a69470b6a490b6a4a0c6b4c0c6b4d0d6c4f0d6c510e6c520e6d540f6d550f6d57106e59106e5a116e5c126e5d126e5f136e61136e62146e64156e65156e67166e69166e6a176e6c186e6d186e6f196e71196e721a6e741a6e751b6e771c6d781c6d7a1d6d7c1d6d7d1e6d7f1e6c801f6c82206c84206b85216b87216b88226a8a226a8c23698d23698f24699025689225689326679526679727669827669a28659b29649d29649f2a63a02a63a22b62a32c61a52c60a62d60a82e5fa92e5eab2f5ead305dae305cb0315bb1325ab3325ab43359b63458b73557b93556ba3655bc3754bd3853bf3952c03a51c13a50c33b4fc43c4ec63d4dc73e4cc83f4bca404acb4149cc4248ce4347cf4446d04545d24644d34743d44842d54a41d74b3fd84c3ed94d3dda4e3cdb503bdd513ade5238df5337e05536e15635e25734e35933e45a31e55c30e65d2fe75e2ee8602de9612bea632aeb6429eb6628ec6726ed6925ee6a24ef6c23ef6e21f06f20f1711ff1731df2741cf3761bf37819f47918f57b17f57d15f67e14f68013f78212f78410f8850ff8870ef8890cf98b0bf98c0af98e09fa9008fa9207fa9407fb9606fb9706fb9906fb9b06fb9d07fc9f07fca108fca309fca50afca60cfca80dfcaa0ffcac11fcae12fcb014fcb216fcb418fbb61afbb81dfbba1ffbbc21fbbe23fac026fac228fac42afac62df9c72ff9c932f9cb35f8cd37f8cf3af7d13df7d340f6d543f6d746f5d949f5db4cf4dd4ff4df53f4e156f3e35af3e55df2e661f2e865f2ea69f1ec6df1ed71f1ef75f1f179f2f27df2f482f3f586f3f68af4f88ef5f992f6fa96f8fb9af9fc9dfafda1fcffa4"));

  var plasma = ramp$1(colors("0d088710078813078916078a19068c1b068d1d068e20068f2206902406912605912805922a05932c05942e05952f059631059733059735049837049938049a3a049a3c049b3e049c3f049c41049d43039e44039e46039f48039f4903a04b03a14c02a14e02a25002a25102a35302a35502a45601a45801a45901a55b01a55c01a65e01a66001a66100a76300a76400a76600a76700a86900a86a00a86c00a86e00a86f00a87100a87201a87401a87501a87701a87801a87a02a87b02a87d03a87e03a88004a88104a78305a78405a78606a68707a68808a68a09a58b0aa58d0ba58e0ca48f0da4910ea3920fa39410a29511a19613a19814a099159f9a169f9c179e9d189d9e199da01a9ca11b9ba21d9aa31e9aa51f99a62098a72197a82296aa2395ab2494ac2694ad2793ae2892b02991b12a90b22b8fb32c8eb42e8db52f8cb6308bb7318ab83289ba3388bb3488bc3587bd3786be3885bf3984c03a83c13b82c23c81c33d80c43e7fc5407ec6417dc7427cc8437bc9447aca457acb4679cc4778cc4977cd4a76ce4b75cf4c74d04d73d14e72d24f71d35171d45270d5536fd5546ed6556dd7566cd8576bd9586ada5a6ada5b69db5c68dc5d67dd5e66de5f65de6164df6263e06363e16462e26561e26660e3685fe4695ee56a5de56b5de66c5ce76e5be76f5ae87059e97158e97257ea7457eb7556eb7655ec7754ed7953ed7a52ee7b51ef7c51ef7e50f07f4ff0804ef1814df1834cf2844bf3854bf3874af48849f48948f58b47f58c46f68d45f68f44f79044f79143f79342f89441f89540f9973ff9983ef99a3efa9b3dfa9c3cfa9e3bfb9f3afba139fba238fca338fca537fca636fca835fca934fdab33fdac33fdae32fdaf31fdb130fdb22ffdb42ffdb52efeb72dfeb82cfeba2cfebb2bfebd2afebe2afec029fdc229fdc328fdc527fdc627fdc827fdca26fdcb26fccd25fcce25fcd025fcd225fbd324fbd524fbd724fad824fada24f9dc24f9dd25f8df25f8e125f7e225f7e425f6e626f6e826f5e926f5eb27f4ed27f3ee27f3f027f2f227f1f426f1f525f0f724f0f921"));

  // If an object has already a color, don't set it
  // Objects can be nodes or links

  function autoColorObjects(objects, colorByAccessor, colorField) {
    if (!colorByAccessor || typeof colorField !== 'string') return;
    var colors = schemePaired; // Paired color set from color brewer

    var uncoloredObjects = objects.filter(function (obj) {
      return !obj[colorField];
    });
    var objGroups = {};
    uncoloredObjects.forEach(function (obj) {
      objGroups[colorByAccessor(obj)] = null;
    });
    Object.keys(objGroups).forEach(function (group, idx) {
      objGroups[group] = idx;
    });
    uncoloredObjects.forEach(function (obj) {
      obj[colorField] = colors[objGroups[colorByAccessor(obj)] % colors.length];
    });
  }

  function getDagDepths (_ref, idAccessor) {
    var nodes = _ref.nodes,
        links = _ref.links;
    // linked graph
    var graph = {};
    nodes.forEach(function (node) {
      return graph[idAccessor(node)] = {
        data: node,
        out: [],
        depth: -1
      };
    });
    links.forEach(function (_ref2) {
      var source = _ref2.source,
          target = _ref2.target;
      var sourceId = getNodeId(source);
      var targetId = getNodeId(target);
      if (!graph.hasOwnProperty(sourceId)) throw "Missing source node with id: ".concat(sourceId);
      if (!graph.hasOwnProperty(targetId)) throw "Missing target node with id: ".concat(targetId);
      var sourceNode = graph[sourceId];
      var targetNode = graph[targetId];
      sourceNode.out.push(targetNode);

      function getNodeId(node) {
        return _typeof(node) === 'object' ? idAccessor(node) : node;
      }
    });
    traverse(Object.values(graph)); // cleanup

    Object.keys(graph).forEach(function (id) {
      return graph[id] = graph[id].depth;
    });
    return graph;

    function traverse(nodes) {
      var nodeStack = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var currentDepth = nodeStack.length;

      for (var i = 0, l = nodes.length; i < l; i++) {
        var node = nodes[i];

        if (nodeStack.indexOf(node) !== -1) {
          throw "Invalid DAG structure! Found cycle from node ".concat(idAccessor(nodeStack[nodeStack.length - 1].data), " to ").concat(idAccessor(node.data));
        }

        if (currentDepth > node.depth) {
          // Don't unnecessarily revisit chunks of the graph
          node.depth = currentDepth;
          traverse(node.out, [].concat(_toConsumableArray(nodeStack), [node]));
        }
      }
    }
  }

  var DAG_LEVEL_NODE_RATIO = 2;
  var CanvasForceGraph = Kapsule({
    props: {
      graphData: {
        default: {
          nodes: [],
          links: []
        },
        onChange: function onChange(_, state) {
          state.engineRunning = false;
        } // Pause simulation

      },
      dagMode: {},
      // td, bu, lr, rl, radialin, radialout
      dagLevelDistance: {},
      nodeRelSize: {
        default: 4,
        triggerUpdate: false
      },
      // area per val unit
      nodeId: {
        default: 'id'
      },
      nodeVal: {
        default: 'val',
        triggerUpdate: false
      },
      nodeColor: {
        default: 'color',
        triggerUpdate: false
      },
      nodeAutoColorBy: {},
      nodeCanvasObject: {
        triggerUpdate: false
      },
      linkSource: {
        default: 'source'
      },
      linkTarget: {
        default: 'target'
      },
      linkVisibility: {
        default: true,
        triggerUpdate: false
      },
      linkColor: {
        default: 'color',
        triggerUpdate: false
      },
      linkAutoColorBy: {},
      // avuko
      linkWidth: {
        default: 'name',
        triggerUpdate: true 
      },
      linkCurvature: {
        default: 0,
        triggerUpdate: false
      },
      linkCanvasObject: {
        triggerUpdate: false
      },
      linkDirectionalArrowLength: {
        default: 0,
        triggerUpdate: false
      },
      linkDirectionalArrowColor: {
        triggerUpdate: false
      },
      linkDirectionalArrowRelPos: {
        default: 0.5,
        triggerUpdate: false
      },
      // value between 0<>1 indicating the relative pos along the (exposed) line
      linkDirectionalParticles: {
        default: 0
      },
      // animate photons travelling in the link direction
      linkDirectionalParticleSpeed: {
        default: 0.01,
        triggerUpdate: false
      },
      // in link length ratio per frame
      linkDirectionalParticleWidth: {
        default: 4,
        triggerUpdate: false
      },
      linkDirectionalParticleColor: {
        triggerUpdate: false
      },
      globalScale: {
        default: 1,
        triggerUpdate: false
      },
      d3AlphaDecay: {
        default: 0.0228,
        triggerUpdate: false,
        onChange: function onChange(alphaDecay, state) {
          state.forceLayout.alphaDecay(alphaDecay);
        }
      },
      d3AlphaTarget: {
        default: 0,
        triggerUpdate: false,
        onChange: function onChange(alphaTarget, state) {
          state.forceLayout.alphaTarget(alphaTarget);
        }
      },
      d3VelocityDecay: {
        default: 0.4,
        triggerUpdate: false,
        onChange: function onChange(velocityDecay, state) {
          state.forceLayout.velocityDecay(velocityDecay);
        }
      },
      warmupTicks: {
        default: 0,
        triggerUpdate: false
      },
      // how many times to tick the force engine at init before starting to render
      cooldownTicks: {
        default: Infinity,
        triggerUpdate: false
      },
      cooldownTime: {
        default: 15000,
        triggerUpdate: false
      },
      // ms
      onLoading: {
        default: function _default() {},
        triggerUpdate: false
      },
      onFinishLoading: {
        default: function _default() {},
        triggerUpdate: false
      },
      onEngineTick: {
        default: function _default() {},
        triggerUpdate: false
      },
      onEngineStop: {
        default: function _default() {},
        triggerUpdate: false
      },
      isShadow: {
        default: false,
        triggerUpdate: false
      }
    },
    methods: {
      // Expose d3 forces for external manipulation
      d3Force: function d3Force(state, forceName, forceFn) {
        if (forceFn === undefined) {
          return state.forceLayout.force(forceName); // Force getter
        }

        state.forceLayout.force(forceName, forceFn); // Force setter

        return this;
      },
      // reset cooldown state
      resetCountdown: function resetCountdown(state) {
        state.cntTicks = 0;
        state.startTickTime = new Date();
        state.engineRunning = true;
        return this;
      },
      tickFrame: function tickFrame(state) {
        layoutTick();
        paintLinks();
        paintArrows();
        paintPhotons();
        paintNodes();
        return this; //

        function layoutTick() {
          if (state.engineRunning) {
            if (++state.cntTicks > state.cooldownTicks || new Date() - state.startTickTime > state.cooldownTime) {
              state.engineRunning = false; // Stop ticking graph

              state.onEngineStop();
            } else {
              state.forceLayout.tick(); // Tick it

              state.onEngineTick();
            }
          }
        }

        function paintNodes() {
          var getVal = accessorFn(state.nodeVal);
          var getColor = accessorFn(state.nodeColor);
          var ctx = state.ctx; // Draw wider nodes by 1px on shadow canvas for more precise hovering (due to boundary anti-aliasing)

          var padAmount = state.isShadow / state.globalScale;
          ctx.save();
          state.graphData.nodes.forEach(function (node) {
            if (state.nodeCanvasObject) {
              // Custom node paint
              state.nodeCanvasObject(node, state.ctx, state.globalScale);
              return;
            } // Draw wider nodes by 1px on shadow canvas for more precise hovering (due to boundary anti-aliasing)


            var r = Math.sqrt(Math.max(0, getVal(node) || 1)) * state.nodeRelSize + padAmount;
            ctx.beginPath();
            ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
            ctx.fillStyle = getColor(node) || 'rgba(31, 120, 180, 0.92)';
            ctx.fill();
          });
          ctx.restore();
        }

        function paintLinks() {
          var getVisibility = accessorFn(state.linkVisibility);
          var getColor = accessorFn(state.linkColor);
          // avuko
          // var getWidth = accessorFn(Math.ceil((state.linkWidth * 10) ) /10);
          var getWidth = accessorFn(state.linkWidth);
          // console.log(getWidth);
          var getCurvature = accessorFn(state.linkCurvature);
          var ctx = state.ctx; // Draw wider lines by 2px on shadow canvas for more precise hovering (due to boundary anti-aliasing)

          var padAmount = state.isShadow * 2;
          ctx.save();
          var visibleLinks = state.graphData.links.filter(getVisibility);

          if (state.linkCanvasObject) {
            // Custom link paints
            visibleLinks.forEach(function (link) {
              return state.linkCanvasObject(link, state.ctx, state.globalScale);
            });
            return;
          } // Bundle strokes per unique color/width for performance optimization


          var linksPerColor = indexBy(visibleLinks, [getColor, getWidth]);
          Object.entries(linksPerColor).forEach(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                color = _ref2[0],
                linksPerWidth = _ref2[1];

            var lineColor = !color || color === 'undefined' ? 'rgba(0,0,0,0.15)' : color;
            Object.entries(linksPerWidth).forEach(function (_ref3) {
              var _ref4 = _slicedToArray(_ref3, 2),
                  width = _ref4[0],
                  links = _ref4[1];

              // avuko
              var lineWidth = (Math.ceil((width / 10) * 2) || 1) / state.globalScale + padAmount;
              ctx.beginPath();
              links.forEach(function (link) {
                var start = link.source;
                var end = link.target;
                if (!start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

                var curvature = getCurvature(link);
                ctx.moveTo(start.x, start.y);

                if (!curvature) {
                  // Straight line
                  ctx.lineTo(end.x, end.y);
                  link.__controlPoints = null;
                  return;
                }

                var l = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)); // line length

                if (l > 0) {
                  var a = Math.atan2(end.y - start.y, end.x - start.x); // line angle

                  var d = l * curvature; // control point distance

                  var cp = {
                    // control point
                    x: (start.x + end.x) / 2 + d * Math.cos(a - Math.PI / 2),
                    y: (start.y + end.y) / 2 + d * Math.sin(a - Math.PI / 2)
                  };
                  ctx.quadraticCurveTo(cp.x, cp.y, end.x, end.y);
                  link.__controlPoints = [cp.x, cp.y];
                } else {
                  // Same point, draw a loop
                  var _d = curvature * 70;

                  var cps = [end.x, end.y - _d, end.x + _d, end.y];
                  ctx.bezierCurveTo.apply(ctx, cps.concat([end.x, end.y]));
                  link.__controlPoints = cps;
                }
              });
              ctx.strokeStyle = lineColor;
              ctx.lineWidth = lineWidth;
              ctx.stroke();
            });
          });
          ctx.restore();
        }

        function paintArrows() {
          var ARROW_WH_RATIO = 1.6;
          var ARROW_VLEN_RATIO = 0.2;
          var getLength = accessorFn(state.linkDirectionalArrowLength);
          var getRelPos = accessorFn(state.linkDirectionalArrowRelPos);
          var getVisibility = accessorFn(state.linkVisibility);
          var getColor = accessorFn(state.linkDirectionalArrowColor || state.linkColor);
          var getNodeVal = accessorFn(state.nodeVal);
          var ctx = state.ctx;
          ctx.save();
          state.graphData.links.filter(getVisibility).forEach(function (link) {
            var arrowLength = getLength(link);
            if (!arrowLength || arrowLength < 0) return;
            var start = link.source;
            var end = link.target;
            if (!start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

            var startR = Math.sqrt(Math.max(0, getNodeVal(start) || 1)) * state.nodeRelSize;
            var endR = Math.sqrt(Math.max(0, getNodeVal(end) || 1)) * state.nodeRelSize;
            var arrowRelPos = Math.min(1, Math.max(0, getRelPos(link)));
            var arrowColor = getColor(link) || 'rgba(0,0,0,0.28)';
            var arrowHalfWidth = arrowLength / ARROW_WH_RATIO / 2; // Construct bezier for curved lines

            var bzLine = link.__controlPoints && _construct(bezierJs, [start.x, start.y].concat(_toConsumableArray(link.__controlPoints), [end.x, end.y]));

            var getCoordsAlongLine = bzLine ? function (t) {
              return bzLine.get(t);
            } // get position along bezier line
            : function (t) {
              return {
                // straight line: interpolate linearly
                x: start.x + (end.x - start.x) * t || 0,
                y: start.y + (end.y - start.y) * t || 0
              };
            };
            var lineLen = bzLine ? bzLine.length() : Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
            var posAlongLine = startR + arrowLength + (lineLen - startR - endR - arrowLength) * arrowRelPos;
            var arrowHead = getCoordsAlongLine(posAlongLine / lineLen);
            var arrowTail = getCoordsAlongLine((posAlongLine - arrowLength) / lineLen);
            var arrowTailVertex = getCoordsAlongLine((posAlongLine - arrowLength * (1 - ARROW_VLEN_RATIO)) / lineLen);
            var arrowTailAngle = Math.atan2(arrowHead.y - arrowTail.y, arrowHead.x - arrowTail.x) - Math.PI / 2;
            ctx.beginPath();
            ctx.moveTo(arrowHead.x, arrowHead.y);
            ctx.lineTo(arrowTail.x + arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y + arrowHalfWidth * Math.sin(arrowTailAngle));
            ctx.lineTo(arrowTailVertex.x, arrowTailVertex.y);
            ctx.lineTo(arrowTail.x - arrowHalfWidth * Math.cos(arrowTailAngle), arrowTail.y - arrowHalfWidth * Math.sin(arrowTailAngle));
            ctx.fillStyle = arrowColor;
            ctx.fill();
          });
          ctx.restore();
        }

        function paintPhotons() {
          var getNumPhotons = accessorFn(state.linkDirectionalParticles);
          var getSpeed = accessorFn(state.linkDirectionalParticleSpeed);
          var getDiameter = accessorFn(state.linkDirectionalParticleWidth);
          var getVisibility = accessorFn(state.linkVisibility);
          var getColor = accessorFn(state.linkDirectionalParticleColor || state.linkColor);
          var ctx = state.ctx;
          ctx.save();
          state.graphData.links.filter(getVisibility).forEach(function (link) {
            if (!getNumPhotons(link)) return;
            var start = link.source;
            var end = link.target;
            if (!start.hasOwnProperty('x') || !end.hasOwnProperty('x')) return; // skip invalid link

            var particleSpeed = getSpeed(link);
            var photons = link.__photons || [];
            var photonR = Math.max(0, getDiameter(link) / 2) / Math.sqrt(state.globalScale);
            var photonColor = getColor(link) || 'rgba(0,0,0,0.28)';
            ctx.fillStyle = photonColor; // Construct bezier for curved lines

            var bzLine = link.__controlPoints ? _construct(bezierJs, [start.x, start.y].concat(_toConsumableArray(link.__controlPoints), [end.x, end.y])) : null;
            photons.forEach(function (photon, idx) {
              var photonPosRatio = photon.__progressRatio = ((photon.__progressRatio || idx / photons.length) + particleSpeed) % 1;
              var coords = bzLine ? bzLine.get(photonPosRatio) // get position along bezier line
              : {
                // straight line: interpolate linearly
                x: start.x + (end.x - start.x) * photonPosRatio || 0,
                y: start.y + (end.y - start.y) * photonPosRatio || 0
              };
              ctx.beginPath();
              ctx.arc(coords.x, coords.y, photonR, 0, 2 * Math.PI, false);
              ctx.fill();
            });
          });
          ctx.restore();
        }
      }
    },
    stateInit: function stateInit() {
      return {
        forceLayout: d3ForceSimulation().force('link', d3ForceLink()).force('charge', d3ForceManyBody()).force('center', d3ForceCenter()).force('dagRadial', null).stop(),
        engineRunning: false
      };
    },
    init: function init(canvasCtx, state) {
      // Main canvas object to manipulate
      state.ctx = canvasCtx;
    },
    update: function update(state) {
      state.engineRunning = false; // Pause simulation

      state.onLoading();

      if (state.nodeAutoColorBy !== null) {
        // Auto add color to uncolored nodes
        autoColorObjects(state.graphData.nodes, accessorFn(state.nodeAutoColorBy), state.nodeColor);
      }

      if (state.linkAutoColorBy !== null) {
        // Auto add color to uncolored links
        autoColorObjects(state.graphData.links, accessorFn(state.linkAutoColorBy), state.linkColor);
      } // parse links


      state.graphData.links.forEach(function (link) {
        link.source = link[state.linkSource];
        link.target = link[state.linkTarget];
      }); // Add photon particles

      var linkParticlesAccessor = accessorFn(state.linkDirectionalParticles);
      state.graphData.links.forEach(function (link) {
        var numPhotons = Math.round(Math.abs(linkParticlesAccessor(link)));

        if (numPhotons) {
          link.__photons = _toConsumableArray(Array(numPhotons)).map(function () {
            return {};
          });
        }
      }); // Feed data to force-directed layout

      state.forceLayout.stop().alpha(1) // re-heat the simulation
      .nodes(state.graphData.nodes); // add links (if link force is still active)

      var linkForce = state.forceLayout.force('link');

      if (linkForce) {
        linkForce.id(function (d) {
          return d[state.nodeId];
        }).links(state.graphData.links);
      } // setup dag force constraints


      var nodeDepths = state.dagMode && getDagDepths(state.graphData, function (node) {
        return node[state.nodeId];
      });
      var maxDepth = Math.max.apply(Math, _toConsumableArray(Object.values(nodeDepths || [])));
      var dagLevelDistance = state.dagLevelDistance || state.graphData.nodes.length / (maxDepth || 1) * DAG_LEVEL_NODE_RATIO * (['radialin', 'radialout'].indexOf(state.dagMode) !== -1 ? 0.7 : 1); // Fix nodes to x,y for dag mode

      if (state.dagMode) {
        var getFFn = function getFFn(fix, invert) {
          return function (node) {
            return !fix ? undefined : (nodeDepths[node[state.nodeId]] - maxDepth / 2) * dagLevelDistance * (invert ? -1 : 1);
          };
        };

        var fxFn = getFFn(['lr', 'rl'].indexOf(state.dagMode) !== -1, state.dagMode === 'rl');
        var fyFn = getFFn(['td', 'bu'].indexOf(state.dagMode) !== -1, state.dagMode === 'bu');
        state.graphData.nodes.forEach(function (node) {
          node.fx = fxFn(node);
          node.fy = fyFn(node);
        });
      }

      state.forceLayout.force('dagRadial', ['radialin', 'radialout'].indexOf(state.dagMode) !== -1 ? d3ForceRadial(function (node) {
        var nodeDepth = nodeDepths[node[state.nodeId]];
        return (state.dagMode === 'radialin' ? maxDepth - nodeDepth : nodeDepth) * dagLevelDistance;
      }).strength(1) : null);

      for (var i = 0; i < state.warmupTicks; i++) {
        state.forceLayout.tick();
      } // Initial ticks before starting to render


      this.resetCountdown();
      state.onFinishLoading();
    }
  });

  function linkKapsule (kapsulePropNames, kapsuleType) {
    var propNames = kapsulePropNames instanceof Array ? kapsulePropNames : [kapsulePropNames];
    var dummyK = new kapsuleType(); // To extract defaults

    return {
      linkProp: function linkProp(prop) {
        // link property config
        return {
          default: dummyK[prop](),
          onChange: function onChange(v, state) {
            propNames.forEach(function (propName) {
              return state[propName][prop](v);
            });
          },
          triggerUpdate: false
        };
      },
      linkMethod: function linkMethod(method) {
        // link method pass-through
        return function (state) {
          for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            args[_key - 1] = arguments[_key];
          }

          var returnVals = [];
          propNames.forEach(function (propName) {
            var kapsuleInstance = state[propName];
            var returnVal = kapsuleInstance[method].apply(kapsuleInstance, args);

            if (returnVal !== kapsuleInstance) {
              returnVals.push(returnVal);
            }
          });
          return returnVals.length ? returnVals[0] : this; // chain based on the parent object, not the inner kapsule
        };
      }
    };
  }

  var HOVER_CANVAS_THROTTLE_DELAY = 800; // ms to throttle shadow canvas updates for perf improvement

  var ZOOM2NODES_FACTOR = 4; // Expose config from forceGraph

  var bindFG = linkKapsule('forceGraph', CanvasForceGraph);
  var bindBoth = linkKapsule(['forceGraph', 'shadowGraph'], CanvasForceGraph);
  var linkedProps = Object.assign.apply(Object, _toConsumableArray(['nodeColor', 'nodeAutoColorBy', 'nodeCanvasObject', 'linkColor', 'linkAutoColorBy', 'linkWidth', 'linkCanvasObject', 'linkDirectionalArrowLength', 'linkDirectionalArrowColor', 'linkDirectionalArrowRelPos', 'linkDirectionalParticles', 'linkDirectionalParticleSpeed', 'linkDirectionalParticleWidth', 'linkDirectionalParticleColor', 'dagMode', 'dagLevelDistance', 'd3AlphaDecay', 'd3VelocityDecay', 'warmupTicks', 'cooldownTicks', 'cooldownTime', 'onEngineTick', 'onEngineStop'].map(function (p) {
    return _defineProperty({}, p, bindFG.linkProp(p));
  })).concat(_toConsumableArray(['nodeRelSize', 'nodeId', 'nodeVal', 'linkSource', 'linkTarget', 'linkVisibility', 'linkCurvature'].map(function (p) {
    return _defineProperty({}, p, bindBoth.linkProp(p));
  }))));
  var linkedMethods = Object.assign.apply(Object, _toConsumableArray(['d3Force'].map(function (p) {
    return _defineProperty({}, p, bindFG.linkMethod(p));
  })));

  function adjustCanvasSize(state) {
    if (state.canvas) {
      var curWidth = state.canvas.width;
      var curHeight = state.canvas.height;

      if (curWidth === 300 && curHeight === 150) {
        // Default canvas dimensions
        curWidth = curHeight = 0;
      }

      var pxScale = window.devicePixelRatio; // 2 on retina displays

      curWidth /= pxScale;
      curHeight /= pxScale; // Resize canvases

      [state.canvas, state.shadowCanvas].forEach(function (canvas) {
        // Element size
        canvas.style.width = "".concat(state.width, "px");
        canvas.style.height = "".concat(state.height, "px"); // Memory size (scaled to avoid blurriness)

        canvas.width = state.width * pxScale;
        canvas.height = state.height * pxScale; // Normalize coordinate system to use css pixels (on init only)

        if (!curWidth && !curHeight) {
          canvas.getContext('2d').scale(pxScale, pxScale);
        }
      }); // Relative center panning based on 0,0

      var k = transform(state.canvas).k;
      state.zoom.translateBy(state.zoom.__baseElem, (state.width - curWidth) / 2 / k, (state.height - curHeight) / 2 / k);
    }
  }

  function resetTransform(ctx) {
    var pxRatio = window.devicePixelRatio;
    ctx.setTransform(pxRatio, 0, 0, pxRatio, 0, 0);
  }

  function clearCanvas(ctx, width, height) {
    ctx.save();
    resetTransform(ctx); // reset transform

    ctx.clearRect(0, 0, width, height);
    ctx.restore(); //restore transforms
  } //


  var forceGraph = Kapsule({
    props: _objectSpread({
      width: {
        default: window.innerWidth,
        onChange: function onChange(_, state) {
          return adjustCanvasSize(state);
        },
        triggerUpdate: false
      },
      height: {
        default: window.innerHeight,
        onChange: function onChange(_, state) {
          return adjustCanvasSize(state);
        },
        triggerUpdate: false
      },
      graphData: {
        default: {
          nodes: [],
          links: []
        },
        onChange: function onChange(d, state) {
          if (d.nodes.length || d.links.length) {
            console.info('force-graph loading', d.nodes.length + ' nodes', d.links.length + ' links');
          }

          [{
            type: 'Node',
            objs: d.nodes
          }, {
            type: 'Link',
            objs: d.links
          }].forEach(hexIndex);
          state.forceGraph.graphData(d);
          state.shadowGraph.graphData(d);

          function hexIndex(_ref4) {
            var type = _ref4.type,
                objs = _ref4.objs;
            objs.filter(function (d) {
              return !d.hasOwnProperty('__indexColor') || d !== state.colorTracker.lookup(d.__indexColor);
            }).forEach(function (d) {
              // store object lookup color
              d.__indexColor = state.colorTracker.register({
                type: type,
                d: d
              });
            });
          }
        },
        triggerUpdate: false
      },
      backgroundColor: {
        onChange: function onChange(color, state) {
          state.canvas && color && (state.canvas.style.background = color);
        },
        triggerUpdate: false
      },
      nodeLabel: {
        default: 'name',
        triggerUpdate: false
      },
      linkLabel: {
        default: 'name'.toString(),
        triggerupdate: true
      },
      linkHoverPrecision: {
        default: 4,
        triggerUpdate: false
      },
      enableNodeDrag: {
        default: true,
        triggerUpdate: false
      },
      enableZoomPanInteraction: {
        default: true,
        triggerUpdate: false
      },
      enablePointerInteraction: {
        default: true,
        onChange: function onChange(_, state) {
          state.hoverObj = null;
        },
        triggerUpdate: false
      },
      onNodeDrag: {
        default: function _default() {},
        triggerUpdate: false
      },
      onNodeDragEnd: {
        default: function _default() {},
        triggerUpdate: false
      },
      onNodeClick: {
        default: function _default() {},
        triggerUpdate: false
      },
      onNodeRightClick: {
        triggerUpdate: false
      },
      onNodeHover: {
        default: function _default() {},
        triggerUpdate: false
      },
      onLinkClick: {
        default: function _default() {},
        triggerUpdate: false
      },
      onLinkRightClick: {
        triggerUpdate: false
      },
      onLinkHover: {
        default: function _default() {},
        triggerUpdate: false
      }
    }, linkedProps),
    aliases: {
      // Prop names supported for backwards compatibility
      stopAnimation: 'pauseAnimation'
    },
    methods: _objectSpread({
      centerAt: function centerAt(state, x, y, transitionDuration) {
        if (!state.canvas) return null; // no canvas yet
        // setter

        if (x !== undefined || y !== undefined) {
          var finalPos = Object.assign({}, x !== undefined ? {
            x: x
          } : {}, y !== undefined ? {
            y: y
          } : {});

          if (!transitionDuration) {
            // no animation
            setCenter(finalPos);
          } else {
            new Tween.Tween(getCenter()).to(finalPos, transitionDuration).easing(Tween.Easing.Quadratic.Out).onUpdate(setCenter).start();
          }

          return this;
        } // getter


        return getCenter(); //

        function getCenter() {
          var t = transform(state.canvas);
          return {
            x: (state.width / 2 - t.x) / t.k,
            y: (state.height / 2 - t.y) / t.k
          };
        }

        function setCenter(_ref5) {
          var x = _ref5.x,
              y = _ref5.y;
          state.zoom.translateTo(state.zoom.__baseElem, x === undefined ? getCenter().x : x, y === undefined ? getCenter().y : y);
        }
      },
      zoom: function zoom$$1(state, k, transitionDuration) {
        if (!state.canvas) return null; // no canvas yet
        // setter

        if (k !== undefined) {
          if (!transitionDuration) {
            // no animation
            setZoom(k);
          } else {
            new Tween.Tween({
              k: getZoom()
            }).to({
              k: k
            }, transitionDuration).easing(Tween.Easing.Quadratic.Out).onUpdate(function (_ref6) {
              var k = _ref6.k;
              return setZoom(k);
            }).start();
          }

          return this;
        } // getter


        return getZoom(); //

        function getZoom() {
          return transform(state.canvas).k;
        }

        function setZoom(k) {
          state.zoom.scaleTo(state.zoom.__baseElem, k);
        }
      },
      pauseAnimation: function pauseAnimation(state) {
        if (state.animationFrameRequestId) {
          cancelAnimationFrame(state.animationFrameRequestId);
          state.animationFrameRequestId = null;
        }

        return this;
      },
      resumeAnimation: function resumeAnimation(state) {
        if (!state.animationFrameRequestId) {
          this._animationCycle();
        }

        return this;
      },
      _destructor: function _destructor() {
        this.pauseAnimation();
        this.graphData({
          nodes: [],
          links: []
        });
      }
    }, linkedMethods),
    stateInit: function stateInit() {
      return {
        lastSetZoom: 1,
        forceGraph: new CanvasForceGraph(),
        shadowGraph: new CanvasForceGraph().cooldownTicks(0).nodeColor('__indexColor').linkColor('__indexColor').isShadow(true),
        colorTracker: new canvasColorTracker_min() // indexed objects for rgb lookup

      };
    },
    init: function init(domNode, state) {
      // Wipe DOM
      domNode.innerHTML = ''; // Container anchor for canvas and tooltip

      var container = document.createElement('div');
      container.style.position = 'relative';
      domNode.appendChild(container);
      state.canvas = document.createElement('canvas');
      if (state.backgroundColor) state.canvas.style.background = state.backgroundColor;
      container.appendChild(state.canvas);
      state.shadowCanvas = document.createElement('canvas'); // Show shadow canvas
      //state.shadowCanvas.style.position = 'absolute';
      //state.shadowCanvas.style.top = '0';
      //state.shadowCanvas.style.left = '0';
      //container.appendChild(state.shadowCanvas);

      var ctx = state.canvas.getContext('2d');
      var shadowCtx = state.shadowCanvas.getContext('2d'); // Setup node drag interaction

      select(state.canvas).call(d3Drag().subject(function () {
        if (!state.enableNodeDrag) {
          return null;
        }

        var obj = state.hoverObj;
        return obj && obj.type === 'Node' ? obj.d : null; // Only drag nodes
      }).on('start', function () {
        var obj = event.subject;
        obj.__initialDragPos = {
          x: obj.x,
          y: obj.y,
          fx: obj.fx,
          fy: obj.fy
        }; // keep engine running at low intensity throughout drag

        if (!event.active) {
          state.forceGraph.d3AlphaTarget(0.3); // keep engine running at low intensity throughout drag

          obj.fx = obj.x;
          obj.fy = obj.y; // Fix points
        } // drag cursor


        state.canvas.classList.add('grabbable');
      }).on('drag', function () {
        var obj = event.subject;
        var initPos = obj.__initialDragPos;
        var dragPos = event;
        var k = transform(state.canvas).k; // Move fx/fy (and x/y) of nodes based on the scaled drag distance since the drag start

        ['x', 'y'].forEach(function (c) {
          return obj["f".concat(c)] = obj[c] = initPos[c] + (dragPos[c] - initPos[c]) / k;
        }); // prevent freeze while dragging

        state.forceGraph.resetCountdown();
        state.onNodeDrag(obj);
      }).on('end', function () {
        var obj = event.subject;
        var initPos = obj.__initialDragPos;

        if (initPos.fx === undefined) {
          obj.fx = undefined;
        }

        if (initPos.fy === undefined) {
          obj.fy = undefined;
        }

        delete obj.__initialDragPos;
        state.forceGraph.d3AlphaTarget(0) // release engine low intensity
        .resetCountdown(); // let the engine readjust after releasing fixed nodes
        // drag cursor

        state.canvas.classList.remove('grabbable');
        state.onNodeDragEnd(obj);
      })); // Setup zoom / pan interaction

      state.zoom = d3Zoom();
      state.zoom(state.zoom.__baseElem = select(state.canvas)); // Attach controlling elem for easy access

      state.zoom.__baseElem.on('dblclick.zoom', null); // Disable double-click to zoom


      state.zoom.filter(function () {
        return state.enableZoomPanInteraction ? !event.button : false;
      }) // disable zoom interaction
      .scaleExtent([0.01, 1000]).on('zoom', function () {
        var t = transform(this); // Same as d3.event.transform

        [ctx, shadowCtx].forEach(function (c) {
          resetTransform(c);
          c.translate(t.x, t.y);
          c.scale(t.k, t.k);
        });
      });
      adjustCanvasSize(state);
      state.forceGraph.onFinishLoading(function () {
        // re-zoom, if still in default position (not user modified)
        if (transform(state.canvas).k === state.lastSetZoom) {
          state.zoom.scaleTo(state.zoom.__baseElem, state.lastSetZoom = ZOOM2NODES_FACTOR / Math.cbrt(state.graphData.nodes.length));
        }
      }); // Setup tooltip

      var toolTipElem = document.createElement('div');
      toolTipElem.classList.add('graph-tooltip');
      container.appendChild(toolTipElem); // Capture mouse coords on move

      var mousePos = {
        x: -1e12,
        y: -1e12
      };
      state.canvas.addEventListener('mousemove', function (ev) {
        // update the mouse pos
        var offset = getOffset(container);
        mousePos.x = ev.pageX - offset.left;
        mousePos.y = ev.pageY - offset.top; // Move tooltip

        toolTipElem.style.top = "".concat(mousePos.y, "px");
        toolTipElem.style.left = "".concat(mousePos.x, "px"); //

        function getOffset(el) {
          var rect = el.getBoundingClientRect(),
              scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
              scrollTop = window.pageYOffset || document.documentElement.scrollTop;
          return {
            top: rect.top + scrollTop,
            left: rect.left + scrollLeft
          };
        }
      }, false); // Handle click events on nodes/links

      container.addEventListener('click', function (ev) {
        if (state.hoverObj) {
          state["on".concat(state.hoverObj.type, "Click")](state.hoverObj.d);
        }
      }, false); // Handle right-click events

      container.addEventListener('contextmenu', function (ev) {
        if (!state.onNodeRightClick && !state.onLinkRightClick) return true; // default contextmenu behavior

        ev.preventDefault();

        if (state.hoverObj) {
          var fn = state["on".concat(state.hoverObj.type, "RightClick")];
          fn && fn(state.hoverObj.d);
        }

        return false;
      }, false);
      state.forceGraph(ctx);
      state.shadowGraph(shadowCtx); //

      var refreshShadowCanvas = lodash_throttle(function () {
        // wipe canvas
        clearCanvas(shadowCtx, state.width, state.height); // Adjust link hover area

        state.shadowGraph.linkWidth(function (l) {
          return accessorFn(state.linkWidth)(l) + state.linkHoverPrecision;
        }); // redraw

        var t = transform(state.canvas);
        state.shadowGraph.globalScale(t.k).tickFrame();
      }, HOVER_CANVAS_THROTTLE_DELAY); // Kick-off renderer

      (this._animationCycle = function animate() {
        // IIFE
        if (state.enablePointerInteraction) {
          // Update tooltip and trigger onHover events
          // Lookup object per pixel color
          var pxScale = window.devicePixelRatio;
          var px = shadowCtx.getImageData(mousePos.x * pxScale, mousePos.y * pxScale, 1, 1);
          var obj = px ? state.colorTracker.lookup(px.data) : null;

          if (obj !== state.hoverObj) {
            var prevObj = state.hoverObj;
            var prevObjType = prevObj ? prevObj.type : null;
            var objType = obj ? obj.type : null;

            if (prevObjType && prevObjType !== objType) {
              // Hover out
              state["on".concat(prevObjType, "Hover")](null, prevObj.d);
            }

            if (objType) {
              // Hover in
              state["on".concat(objType, "Hover")](obj.d, prevObjType === objType ? prevObj.d : null);
            }

            var tooltipContent = obj ? accessorFn(state["".concat(obj.type.toLowerCase(), "Label")])(obj.d) || '' : '';
            toolTipElem.style.visibility = tooltipContent ? 'visible' : 'hidden';
            toolTipElem.innerHTML = tooltipContent;
            state.hoverObj = obj;
          }

          refreshShadowCanvas();
        } // Wipe canvas


        clearCanvas(ctx, state.width, state.height); // Frame cycle

        var t = transform(state.canvas);
        state.forceGraph.globalScale(t.k).tickFrame();
        Tween.update(); // update canvas animation tweens

        state.animationFrameRequestId = requestAnimationFrame(animate);
      })();
    },
    update: function updateFn(state) {}
  });

  return forceGraph;

}));
//# sourceMappingURL=force-graph.js.map
