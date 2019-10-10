(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _utils = _interopRequireDefault(require("./utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

console.dir(_utils["default"]);

},{"./utils":2}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var Util = function () {
  return {
    hasClass: function hasClass(element, className) {
      if (element.classList) return element.classList.contains(className);else return !!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    },
    addClass: function (_addClass) {
      function addClass(_x, _x2) {
        return _addClass.apply(this, arguments);
      }

      addClass.toString = function () {
        return _addClass.toString();
      };

      return addClass;
    }(function (element, className) {
      var classList = className.split(' ');
      if (element.classList) element.classList.add(classList[0]);else if (!hasClass(element, classList[0])) element.className += " " + classList[0];
      if (classList.length > 1) addClass(element, classList.slice(1).join(' '));
    }),
    removeClass: function (_removeClass) {
      function removeClass(_x3, _x4) {
        return _removeClass.apply(this, arguments);
      }

      removeClass.toString = function () {
        return _removeClass.toString();
      };

      return removeClass;
    }(function (element, className) {
      var classList = className.split(' ');
      if (element.classList) element.classList.remove(classList[0]);else if (hasClass(element, classList[0])) {
        var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
        element.className = element.className.replace(reg, ' ');
      }
      if (classList.length > 1) removeClass(element, classList.slice(1).join(' '));
    }),
    toggleClass: function toggleClass(element, className, bool) {
      if (bool) addClass(element, className);else removeClass(element, className);
    },
    select: function select(element, parent) {
      return (parent ? parent : document).querySelector(element);
    },
    selectAll: function selectAll(element) {
      var context = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : document;
      return _toConsumableArray(context.querySelectorAll(element));
    },
    defer: function defer(fun) {
      if (typeof fun === 'function') setTimeout(fun, 0);
    },
    isInViewport: function isInViewport(element) {
      var distance = element.getBoundingClientRect();
      return distance.top >= 0 && distance.left >= 0 && distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) && distance.right <= (window.innerWidth || document.documentElement.clientWidth);
    }
  };
}();

var _default = Util;
exports["default"] = _default;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzb3VyY2Uvc2NyaXB0L2FwcC5qcyIsInNvdXJjZS9zY3JpcHQvdXRpbHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztBQ0FBOzs7O0FBRUEsT0FBTyxDQUFDLEdBQVIsQ0FBWSxpQkFBWjs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDRkEsSUFBTSxJQUFJLEdBQUksWUFBTTtBQUVsQixTQUFPO0FBRUwsSUFBQSxRQUZLLG9CQUVJLE9BRkosRUFFYSxTQUZiLEVBRXdCO0FBQzNCLFVBQUksT0FBTyxDQUFDLFNBQVosRUFDRSxPQUFPLE9BQU8sQ0FBQyxTQUFSLENBQWtCLFFBQWxCLENBQTJCLFNBQTNCLENBQVAsQ0FERixLQUdFLE9BQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxTQUFSLENBQWtCLEtBQWxCLENBQXdCLElBQUksTUFBSixDQUFXLFlBQVksU0FBWixHQUF3QixTQUFuQyxDQUF4QixDQUFUO0FBQ0gsS0FQSTtBQVNMLElBQUEsUUFUSztBQUFBO0FBQUE7QUFBQTs7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQSxnQkFTSSxPQVRKLEVBU2EsU0FUYixFQVN3QjtBQUMzQixVQUFJLFNBQVMsR0FBRyxTQUFTLENBQUMsS0FBVixDQUFnQixHQUFoQixDQUFoQjtBQUNBLFVBQUksT0FBTyxDQUFDLFNBQVosRUFBdUIsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsR0FBbEIsQ0FBc0IsU0FBUyxDQUFDLENBQUQsQ0FBL0IsRUFBdkIsS0FDSyxJQUFJLENBQUMsUUFBUSxDQUFDLE9BQUQsRUFBVSxTQUFTLENBQUMsQ0FBRCxDQUFuQixDQUFiLEVBQXNDLE9BQU8sQ0FBQyxTQUFSLElBQXFCLE1BQU0sU0FBUyxDQUFDLENBQUQsQ0FBcEM7QUFDM0MsVUFBSSxTQUFTLENBQUMsTUFBVixHQUFtQixDQUF2QixFQUEwQixRQUFRLENBQUMsT0FBRCxFQUFVLFNBQVMsQ0FBQyxLQUFWLENBQWdCLENBQWhCLEVBQW1CLElBQW5CLENBQXdCLEdBQXhCLENBQVYsQ0FBUjtBQUMzQixLQWRJO0FBZ0JMLElBQUEsV0FoQks7QUFBQTtBQUFBO0FBQUE7O0FBQUE7QUFBQTtBQUFBOztBQUFBO0FBQUEsZ0JBZ0JPLE9BaEJQLEVBZ0JnQixTQWhCaEIsRUFnQjJCO0FBQzlCLFVBQUksU0FBUyxHQUFHLFNBQVMsQ0FBQyxLQUFWLENBQWdCLEdBQWhCLENBQWhCO0FBQ0EsVUFBSSxPQUFPLENBQUMsU0FBWixFQUF1QixPQUFPLENBQUMsU0FBUixDQUFrQixNQUFsQixDQUF5QixTQUFTLENBQUMsQ0FBRCxDQUFsQyxFQUF2QixLQUNLLElBQUksUUFBUSxDQUFDLE9BQUQsRUFBVSxTQUFTLENBQUMsQ0FBRCxDQUFuQixDQUFaLEVBQXFDO0FBQ3hDLFlBQUksR0FBRyxHQUFHLElBQUksTUFBSixDQUFXLFlBQVksU0FBUyxDQUFDLENBQUQsQ0FBckIsR0FBMkIsU0FBdEMsQ0FBVjtBQUNBLFFBQUEsT0FBTyxDQUFDLFNBQVIsR0FBb0IsT0FBTyxDQUFDLFNBQVIsQ0FBa0IsT0FBbEIsQ0FBMEIsR0FBMUIsRUFBK0IsR0FBL0IsQ0FBcEI7QUFDRDtBQUNELFVBQUksU0FBUyxDQUFDLE1BQVYsR0FBbUIsQ0FBdkIsRUFBMEIsV0FBVyxDQUFDLE9BQUQsRUFBVSxTQUFTLENBQUMsS0FBVixDQUFnQixDQUFoQixFQUFtQixJQUFuQixDQUF3QixHQUF4QixDQUFWLENBQVg7QUFDM0IsS0F4Qkk7QUEwQkwsSUFBQSxXQTFCSyx1QkEwQk8sT0ExQlAsRUEwQmdCLFNBMUJoQixFQTBCMkIsSUExQjNCLEVBMEJpQztBQUNwQyxVQUFJLElBQUosRUFBVSxRQUFRLENBQUMsT0FBRCxFQUFVLFNBQVYsQ0FBUixDQUFWLEtBQ0ssV0FBVyxDQUFDLE9BQUQsRUFBVSxTQUFWLENBQVg7QUFDTixLQTdCSTtBQStCTCxJQUFBLE1BL0JLLGtCQStCRSxPQS9CRixFQStCVyxNQS9CWCxFQStCbUI7QUFDdEIsYUFBTyxDQUFDLE1BQU0sR0FBRyxNQUFILEdBQVksUUFBbkIsRUFBNkIsYUFBN0IsQ0FBMkMsT0FBM0MsQ0FBUDtBQUNELEtBakNJO0FBbUNMLElBQUEsU0FuQ0sscUJBbUNLLE9BbkNMLEVBbUNrQztBQUFBLFVBQXBCLE9BQW9CLHVFQUFWLFFBQVU7QUFDckMsZ0NBQVcsT0FBTyxDQUFDLGdCQUFSLENBQXlCLE9BQXpCLENBQVg7QUFDRCxLQXJDSTtBQXVDTCxJQUFBLEtBdkNLLGlCQXVDQyxHQXZDRCxFQXVDTTtBQUNULFVBQUksT0FBTyxHQUFQLEtBQWUsVUFBbkIsRUFBK0IsVUFBVSxDQUFDLEdBQUQsRUFBTSxDQUFOLENBQVY7QUFDaEMsS0F6Q0k7QUEyQ0wsSUFBQSxZQTNDSyx3QkEyQ1EsT0EzQ1IsRUEyQ2lCO0FBQ3BCLFVBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxxQkFBUixFQUFmO0FBQ0EsYUFDRSxRQUFRLENBQUMsR0FBVCxJQUFnQixDQUFoQixJQUNBLFFBQVEsQ0FBQyxJQUFULElBQWlCLENBRGpCLElBRUEsUUFBUSxDQUFDLE1BQVQsS0FBb0IsTUFBTSxDQUFDLFdBQVAsSUFBc0IsUUFBUSxDQUFDLGVBQVQsQ0FBeUIsWUFBbkUsQ0FGQSxJQUdBLFFBQVEsQ0FBQyxLQUFULEtBQW1CLE1BQU0sQ0FBQyxVQUFQLElBQXFCLFFBQVEsQ0FBQyxlQUFULENBQXlCLFdBQWpFLENBSkY7QUFNRDtBQW5ESSxHQUFQO0FBdURELENBekRZLEVBQWI7O2VBMkRlLEkiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJpbXBvcnQgVXRpbCBmcm9tICcuL3V0aWxzJ1xuXG5jb25zb2xlLmRpcihVdGlsKTsiLCJjb25zdCBVdGlsID0gKCgpID0+IHtcblxuICByZXR1cm4ge1xuXG4gICAgaGFzQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpXG4gICAgICAgIHJldHVybiBlbGVtZW50LmNsYXNzTGlzdC5jb250YWlucyhjbGFzc05hbWUpO1xuICAgICAgZWxzZVxuICAgICAgICByZXR1cm4gISFlbGVtZW50LmNsYXNzTmFtZS5tYXRjaChuZXcgUmVnRXhwKCcoXFxcXHN8XiknICsgY2xhc3NOYW1lICsgJyhcXFxcc3wkKScpKTtcbiAgICB9LFxuXG4gICAgYWRkQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICBsZXQgY2xhc3NMaXN0ID0gY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG4gICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIGVsZW1lbnQuY2xhc3NMaXN0LmFkZChjbGFzc0xpc3RbMF0pO1xuICAgICAgZWxzZSBpZiAoIWhhc0NsYXNzKGVsZW1lbnQsIGNsYXNzTGlzdFswXSkpIGVsZW1lbnQuY2xhc3NOYW1lICs9IFwiIFwiICsgY2xhc3NMaXN0WzBdO1xuICAgICAgaWYgKGNsYXNzTGlzdC5sZW5ndGggPiAxKSBhZGRDbGFzcyhlbGVtZW50LCBjbGFzc0xpc3Quc2xpY2UoMSkuam9pbignICcpKTtcbiAgICB9LFxuXG4gICAgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2xhc3NOYW1lKSB7XG4gICAgICBsZXQgY2xhc3NMaXN0ID0gY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG4gICAgICBpZiAoZWxlbWVudC5jbGFzc0xpc3QpIGVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShjbGFzc0xpc3RbMF0pO1xuICAgICAgZWxzZSBpZiAoaGFzQ2xhc3MoZWxlbWVudCwgY2xhc3NMaXN0WzBdKSkge1xuICAgICAgICB2YXIgcmVnID0gbmV3IFJlZ0V4cCgnKFxcXFxzfF4pJyArIGNsYXNzTGlzdFswXSArICcoXFxcXHN8JCknKTtcbiAgICAgICAgZWxlbWVudC5jbGFzc05hbWUgPSBlbGVtZW50LmNsYXNzTmFtZS5yZXBsYWNlKHJlZywgJyAnKTtcbiAgICAgIH1cbiAgICAgIGlmIChjbGFzc0xpc3QubGVuZ3RoID4gMSkgcmVtb3ZlQ2xhc3MoZWxlbWVudCwgY2xhc3NMaXN0LnNsaWNlKDEpLmpvaW4oJyAnKSk7XG4gICAgfSxcblxuICAgIHRvZ2dsZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSwgYm9vbCkge1xuICAgICAgaWYgKGJvb2wpIGFkZENsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XG4gICAgICBlbHNlIHJlbW92ZUNsYXNzKGVsZW1lbnQsIGNsYXNzTmFtZSk7XG4gICAgfSxcblxuICAgIHNlbGVjdChlbGVtZW50LCBwYXJlbnQpIHtcbiAgICAgIHJldHVybiAocGFyZW50ID8gcGFyZW50IDogZG9jdW1lbnQpLnF1ZXJ5U2VsZWN0b3IoZWxlbWVudCk7XG4gICAgfSxcblxuICAgIHNlbGVjdEFsbChlbGVtZW50LCBjb250ZXh0ID0gZG9jdW1lbnQpIHtcbiAgICAgIHJldHVybiBbLi4uY29udGV4dC5xdWVyeVNlbGVjdG9yQWxsKGVsZW1lbnQpXVxuICAgIH0sXG5cbiAgICBkZWZlcihmdW4pIHtcbiAgICAgIGlmICh0eXBlb2YgZnVuID09PSAnZnVuY3Rpb24nKSBzZXRUaW1lb3V0KGZ1biwgMCk7XG4gICAgfSxcblxuICAgIGlzSW5WaWV3cG9ydChlbGVtZW50KSB7XG4gICAgICBsZXQgZGlzdGFuY2UgPSBlbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgZGlzdGFuY2UudG9wID49IDAgJiZcbiAgICAgICAgZGlzdGFuY2UubGVmdCA+PSAwICYmXG4gICAgICAgIGRpc3RhbmNlLmJvdHRvbSA8PSAod2luZG93LmlubmVySGVpZ2h0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQpICYmXG4gICAgICAgIGRpc3RhbmNlLnJpZ2h0IDw9ICh3aW5kb3cuaW5uZXJXaWR0aCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGgpXG4gICAgICApO1xuICAgIH1cblxuICB9XG5cbn0pKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFV0aWw7Il19
