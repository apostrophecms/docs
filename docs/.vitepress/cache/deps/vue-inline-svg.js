import {
  h
} from "./chunk-V634PGSD.js";

// node_modules/vue-inline-svg/src/index.js
var cache = {};
function filterAttrs(attrs) {
  return Object.keys(attrs).reduce((result, key) => {
    if (attrs[key] !== false && attrs[key] !== null && attrs[key] !== void 0) {
      result[key] = attrs[key];
    }
    return result;
  }, {});
}
var InlineSvg = {
  name: "InlineSvg",
  inheritAttrs: false,
  render() {
    if (!this.svgElSource) {
      return null;
    }
    return h(
      "svg",
      Object.assign(
        {},
        // source attrs
        this.getSvgAttrs(this.svgElSource),
        // component attrs and listeners
        filterAttrs(this.$attrs),
        // content
        { innerHTML: this.getSvgContent(this.svgElSource) }
      )
    );
  },
  props: {
    src: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    transformSource: {
      type: Function,
      default: (svg) => svg
    },
    keepDuringLoading: {
      type: Boolean,
      default: true
    }
  },
  emits: ["loaded", "unloaded", "error"],
  data() {
    return {
      /** @type SVGElement */
      svgElSource: null
    };
  },
  watch: {
    src(newValue) {
      this.getSource(newValue);
    }
  },
  mounted() {
    this.getSource(this.src);
  },
  methods: {
    getSvgAttrs(svgEl) {
      let svgAttrs = {};
      const attrs = svgEl.attributes;
      if (!attrs) {
        return svgAttrs;
      }
      for (let i = attrs.length - 1; i >= 0; i--) {
        svgAttrs[attrs[i].name] = attrs[i].value;
      }
      return svgAttrs;
    },
    getSvgContent(svgEl) {
      svgEl = svgEl.cloneNode(true);
      svgEl = this.transformSource(svgEl);
      if (this.title) {
        setTitle(svgEl, this.title);
      }
      return svgEl.innerHTML;
    },
    /**
     * Get svgElSource
     * @param {string} src
     */
    getSource(src) {
      if (!cache[src]) {
        cache[src] = this.download(src);
      }
      if (this.svgElSource && cache[src].getIsPending() && !this.keepDuringLoading) {
        this.svgElSource = null;
        this.$emit("unloaded");
      }
      cache[src].then((svg) => {
        this.svgElSource = svg;
        this.$nextTick(() => {
          this.$emit("loaded", this.$el);
        });
      }).catch((err) => {
        if (this.svgElSource) {
          this.svgElSource = null;
          this.$emit("unloaded");
        }
        delete cache[src];
        this.$emit("error", err);
      });
    },
    /**
     * Get the contents of the SVG
     * @param {string} url
     * @returns {PromiseWithState<Element>}
     */
    download(url) {
      return makePromiseState(new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.onload = () => {
          if (request.status >= 200 && request.status < 400) {
            try {
              const parser = new DOMParser();
              const result = parser.parseFromString(request.responseText, "text/xml");
              let svgEl = result.getElementsByTagName("svg")[0];
              if (svgEl) {
                resolve(svgEl);
              } else {
                reject(new Error('Loaded file is not valid SVG"'));
              }
            } catch (e) {
              reject(e);
            }
          } else {
            reject(new Error("Error loading SVG"));
          }
        };
        request.onerror = reject;
        request.send();
      }));
    }
  }
};
function setTitle(svg, title) {
  const titleTags = svg.getElementsByTagName("title");
  if (titleTags.length) {
    titleTags[0].textContent = title;
  } else {
    const titleEl = document.createElementNS("http://www.w3.org/2000/svg", "title");
    titleEl.textContent = title;
    svg.insertBefore(titleEl, svg.firstChild);
  }
}
function makePromiseState(promise) {
  if (promise.getIsPending)
    return promise;
  let isPending = true;
  let result = promise.then(
    (v) => {
      isPending = false;
      return v;
    },
    (e) => {
      isPending = false;
      throw e;
    }
  );
  result.getIsPending = function getIsPending() {
    return isPending;
  };
  return result;
}
var src_default = InlineSvg;
export {
  src_default as default
};
//# sourceMappingURL=vue-inline-svg.js.map
