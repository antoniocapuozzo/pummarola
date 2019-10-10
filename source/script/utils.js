const Util = (() => {

  return {

    hasClass(element, className) {
      if (element.classList)
        return element.classList.contains(className);
      else
        return !!element.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
    },

    addClass(element, className) {
      let classList = className.split(' ');
      if (element.classList) element.classList.add(classList[0]);
      else if (!hasClass(element, classList[0])) element.className += " " + classList[0];
      if (classList.length > 1) addClass(element, classList.slice(1).join(' '));
    },

    removeClass(element, className) {
      let classList = className.split(' ');
      if (element.classList) element.classList.remove(classList[0]);
      else if (hasClass(element, classList[0])) {
        var reg = new RegExp('(\\s|^)' + classList[0] + '(\\s|$)');
        element.className = element.className.replace(reg, ' ');
      }
      if (classList.length > 1) removeClass(element, classList.slice(1).join(' '));
    },

    toggleClass(element, className, bool) {
      if (bool) addClass(element, className);
      else removeClass(element, className);
    },

    select(element, parent) {
      return (parent ? parent : document).querySelector(element);
    },

    selectAll(element, context = document) {
      return [...context.querySelectorAll(element)]
    },

    defer(fun) {
      if (typeof fun === 'function') setTimeout(fun, 0);
    },

    isInViewport(element) {
      let distance = element.getBoundingClientRect();
      return (
        distance.top >= 0 &&
        distance.left >= 0 &&
        distance.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        distance.right <= (window.innerWidth || document.documentElement.clientWidth)
      );
    }

  }

})();

export default Util;