import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const { Event, EventTarget } = globalThis;

// Exercise production modules with deterministic browser events and geometry.
function browser({
  width = 1440,
  height = 900,
  reduced = false,
  storageDenied = false,
  fontSize = 16,
} = {}) {
  const window = new EventTarget();
  const query = new EventTarget();
  query.matches = reduced;
  const frames = new Map();
  const storage = new Map();
  let nextFrame = 0;
  Object.assign(window, {
    innerWidth: width,
    innerHeight: height,
    matchMedia: (text) =>
      text.includes("prefers-reduced-motion")
        ? query
        : {
            get matches() {
              return (
                window.innerWidth >= 64 * fontSize &&
                window.innerHeight >= 45 * fontSize
              );
            },
          },
    requestAnimationFrame: (callback) => {
      frames.set(++nextFrame, callback);
      return nextFrame;
    },
    cancelAnimationFrame: (id) => frames.delete(id),
    localStorage: {
      getItem: (key) => {
        if (storageDenied) throw new Error("Storage denied");
        return storage.get(key) ?? null;
      },
      setItem: (key, value) => {
        if (storageDenied) throw new Error("Storage denied");
        storage.set(key, value);
      },
      removeItem: (key) => {
        if (storageDenied) throw new Error("Storage denied");
        storage.delete(key);
      },
    },
  });
  const observers = [];
  class Observer {
    constructor(callback, options) {
      Object.assign(this, { callback, options, elements: new Set() });
      observers.push(this);
    }
    observe(element) {
      this.elements.add(element);
    }
    unobserve(element) {
      this.elements.delete(element);
    }
    disconnect() {
      this.elements.clear();
    }
  }
  const animations = [];
  const seeks = [];
  const timelineResets = [];
  const context = vm.createContext({
    window,
    Event,
    document: {},
    ResizeObserver: Observer,
    IntersectionObserver: Observer,
  });
  const cache = new Map();
  const load = (name) => {
    const filename = path.resolve("src/lib/motion", name + ".ts");
    if (cache.has(filename)) return cache.get(filename);
    const module = { exports: {} };
    cache.set(filename, module.exports);
    const code = ts.transpileModule(readFileSync(filename, "utf8"), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
      },
    }).outputText;
    const require = (specifier) => {
      if (specifier === "animejs")
        return {
          createScope() {
            let cleanup;
            return {
              add(callback) {
                cleanup = callback();
              },
              revert() {
                cleanup?.();
              },
            };
          },
          createTimeline() {
            return {
              duration: 1000,
              reset() {
                timelineResets.push(true);
                return this;
              },
              add(element, options) {
                if (options.opacity) element.style.opacity = options.opacity[0];
                if (options.translateY)
                  element.style.transform = "translateY(20px)";
                return this;
              },
              seek(time) {
                seeks.push(time);
              },
            };
          },
          animate(element, options) {
            const animation = {
              element,
              options,
              reverted: false,
              revert() {
                this.reverted = true;
              },
            };
            animations.push(animation);
            return animation;
          },
        };
      return load(path.join(path.dirname(name), specifier));
    };
    vm.runInContext(
      "(function(require,module,exports) {" + code + "\n})",
      context,
    )(require, module, module.exports);
    return module.exports;
  };
  return {
    window,
    query,
    frames,
    observers,
    animations,
    seeks,
    timelineResets,
    load,
    flush() {
      const callbacks = [...frames.values()];
      frames.clear();
      callbacks.forEach((callback) => callback());
    },
    event(type) {
      window.dispatchEvent(new Event(type));
    },
    reduce(value) {
      query.matches = value;
      query.dispatchEvent(new Event("change"));
    },
  };
}

function element(top = 0, height = 240) {
  return {
    dataset: {},
    parentElement: null,
    top,
    height,
    style: {
      setProperty(name, value) {
        this[name] = value;
      },
      removeProperty(name) {
        delete this[name];
      },
    },
    getBoundingClientRect() {
      return {
        top: this.top,
        height: this.height,
        bottom: this.top + this.height,
      };
    },
  };
}

test("handoff clamps progress, reverses on scroll, and restores static styles", () => {
  const env = browser();
  const root = element(1000);
  const line = element();
  root.querySelector = () => line;
  const scope = env
    .load("tindatrack-review-handoff")
    .setupTindaTrackReviewHandoff(root);
  assert.equal(root.dataset.enhanced, "true");
  assert.equal(line.style.transform, "scaleX(0)");
  root.top = -240;
  env.event("scroll");
  env.flush();
  assert.equal(line.style.transform, "scaleX(1)");
  root.top = 330;
  env.event("scroll");
  env.flush();
  assert.equal(line.style.transform, "scaleX(0.5)");
  assert.equal(root.style["--handoff-accent-stop"], "50%");
  scope.revert();
  assert.equal(root.dataset.enhanced, undefined);
  assert.equal(line.style.transform, undefined);
  assert.equal(root.style["--handoff-accent-stop"], undefined);
});

test("resize switches between enhanced desktop and static mobile without stale styles", () => {
  const env = browser();
  const root = element();
  let renderCount = 0;
  const scope = env.load("extended-scroll").setupExtendedScrollMotion(root, {
    render() {
      root.style.opacity = "0.5";
      renderCount++;
    },
    reset() {
      root.style.removeProperty("opacity");
    },
  });
  env.window.innerWidth = 390;
  env.event("resize");
  env.flush();
  assert.equal(root.dataset.enhanced, undefined);
  assert.equal(root.style.opacity, undefined);
  env.window.innerWidth = 1440;
  env.event("resize");
  env.flush();
  assert.equal(root.dataset.enhanced, "true");
  assert.equal(renderCount, 2);
  scope.revert();
});

test("live motion preferences and storage restrictions remain safe", () => {
  const env = browser({ storageDenied: true });
  const preferences = env.load("preferences");
  assert.equal(preferences.getStoredMotionPreference(), "system");
  const root = element();
  const scope = env.load("extended-scroll").setupExtendedScrollMotion(root, {
    render() {
      root.style.opacity = "0.5";
    },
    reset() {
      root.style.removeProperty("opacity");
    },
  });
  env.reduce(true);
  env.flush();
  assert.equal(root.dataset.enhanced, undefined);
  preferences.setStoredMotionPreference("full");
  env.flush();
  assert.equal(root.dataset.enhanced, "true");
  preferences.setStoredMotionPreference("reduced");
  env.flush();
  assert.equal(root.dataset.enhanced, undefined);
  assert.equal(root.style.opacity, undefined);
  scope.revert();
});

test("fallback clears construction styles even when enhancement was never enabled", () => {
  const env = browser({ width: 390 });
  const root = element();
  root.style.opacity = "0";
  const scope = env.load("extended-scroll").setupExtendedScrollMotion(root, {
    render() {
      assert.fail("Mobile must not render extended motion");
    },
    reset() {
      root.style.removeProperty("opacity");
    },
  });
  assert.equal(root.style.opacity, undefined);
  scope.revert();
});

test("oversized content disables enhancement; changed geometry can enable it again", () => {
  const env = browser();
  const root = element();
  let fits = false;
  const scope = env.load("extended-scroll").setupExtendedScrollMotion(root, {
    canEnhance: () => fits,
    render() {},
    reset() {},
  });
  assert.equal(root.dataset.enhanced, undefined);
  fits = true;
  env.observers[0].callback();
  env.flush();
  assert.equal(root.dataset.enhanced, "true");
  fits = false;
  env.event("resize");
  env.flush();
  assert.equal(root.dataset.enhanced, undefined);
  scope.revert();
});

test("cleanup cancels queued work, disconnects observers, and removes listeners", () => {
  const env = browser();
  const root = element();
  let renders = 0;
  const scope = env.load("extended-scroll").setupExtendedScrollMotion(root, {
    render() {
      renders++;
    },
    reset() {},
  });
  env.event("scroll");
  env.event("scroll");
  assert.equal(env.frames.size, 1);
  scope.revert();
  scope.revert();
  assert.equal(env.frames.size, 0);
  assert.equal(env.observers[0].elements.size, 0);
  env.event("scroll");
  env.event("resize");
  env.event("pageshow");
  env.reduce(true);
  env.flush();
  assert.equal(env.frames.size, 0);
  assert.equal(renders, 1);
});

test("Review reveals tall media at first intersection and cleanup restores hidden content", () => {
  const env = browser();
  const copy = element(1100, 300);
  const media = element(1100, 12000);
  const root = element();
  root.querySelectorAll = () => [copy, media];
  const scope = env.load("case-study").setupCaseStudyMotion(root);
  const observer = env.observers[0];
  assert.equal(observer.options.threshold, 0);
  assert.equal(media.style.opacity, "0");
  observer.callback([
    { target: media, isIntersecting: true, intersectionRatio: 0.01 },
  ]);
  assert.equal(env.animations.length, 1);
  assert.equal(env.animations[0].element, media);
  assert.equal(observer.elements.has(media), false);
  scope.revert();
  assert.equal(env.animations[0].reverted, true);
  assert.equal(copy.style.opacity, undefined);
  assert.equal(media.style.transform, undefined);
  assert.equal(observer.elements.size, 0);
});

test("restored scroll positions stay readable and reduced motion reveals pending blocks", () => {
  const env = browser();
  const visible = element(100, 12000);
  const above = element(-400, 100);
  const pending = element(1400, 500);
  const root = element();
  root.querySelectorAll = () => [visible, above, pending];
  const scope = env.load("case-study").setupCaseStudyMotion(root);
  assert.equal(visible.style.opacity, undefined);
  assert.equal(above.style.opacity, undefined);
  assert.equal(pending.style.opacity, "0");
  env.reduce(true);
  assert.equal(pending.style.opacity, undefined);
  assert.equal(env.observers[0].elements.size, 0);
  scope.revert();
});

test("handoff tolerates incomplete markup", () => {
  const env = browser();
  const root = element();
  root.querySelector = () => null;
  assert.equal(
    env.load("tindatrack-review-handoff").setupTindaTrackReviewHandoff(root),
    null,
  );
  assert.equal(env.frames.size, 0);
});

function sequence(env, { tallCopy = false } = {}) {
  const root = element(0, 2160);
  const stage = element(0, 900);
  const sellCopy = element();
  const trackCopy = element();
  sellCopy.scrollHeight = tallCopy ? 800 : 300;
  trackCopy.scrollHeight = 320;
  const receipt = element();
  receipt.offsetHeight = 900;
  const sellMedia = element();
  const trackMedia = element();
  // The fallback receipt is taller than the viewport, but becomes an overlay.
  Object.defineProperty(sellMedia, "scrollHeight", {
    get: () => (root.dataset.enhanced === "true" ? 420 : 1320),
  });
  trackMedia.scrollHeight = 440;
  const dark = element();
  const bridge = element();
  const fill = element();
  const panels = [element(), element()];
  const layouts = [element(), element()];
  const selectors = {
    "[data-sequence-stage]": stage,
    "[data-sequence-sell-copy]": sellCopy,
    "[data-sequence-track-copy]": trackCopy,
    "[data-sequence-sell-media]": sellMedia,
    "[data-sequence-track-media]": trackMedia,
    "[data-sequence-receipt]": receipt,
    "[data-sequence-dark]": dark,
    "[data-sequence-bridge]": bridge,
    "[data-sequence-progress-fill]": fill,
  };
  root.querySelector = (selector) => selectors[selector] ?? null;
  root.querySelectorAll = (selector) =>
    selector === "[data-sequence-panel]" ? panels : layouts;
  env.window.getComputedStyle = (target) => ({
    paddingTop: panels.includes(target) ? "128px" : "0px",
    paddingBottom: panels.includes(target) ? "128px" : "0px",
  });
  return { root, sellCopy, trackCopy, sellMedia, trackMedia, fill };
}

test("sequence sizes its stage without counting the receipt overlay as normal flow", () => {
  const env = browser();
  const scene = sequence(env);
  const scope = env
    .load("tindatrack-sequence")
    .setupTindaTrackSequence(scene.root);
  assert.equal(scene.root.dataset.enhanced, "true");
  scene.root.top = -1260;
  env.event("scroll");
  env.flush();
  assert.equal(env.seeks.at(-1), 1000);
  assert.equal(scene.fill.style.transform, "scaleX(1)");
  env.window.innerWidth = 390;
  env.event("resize");
  env.flush();
  assert.equal(scene.root.dataset.enhanced, undefined);
  assert.equal(scene.trackCopy.style.opacity, undefined);
  assert.equal(scene.trackMedia.style.transform, undefined);
  env.window.innerWidth = 1440;
  env.event("resize");
  env.flush();
  assert.equal(scene.root.dataset.enhanced, "true");
  assert.equal(env.timelineResets.length, 2);
  assert.equal(env.seeks.at(-1), 1000);
  scope.revert();
});

test("sequence leaves oversized chapters readable and clears initial timeline styles", () => {
  const env = browser();
  const scene = sequence(env, { tallCopy: true });
  const scope = env
    .load("tindatrack-sequence")
    .setupTindaTrackSequence(scene.root);
  assert.equal(scene.root.dataset.enhanced, undefined);
  assert.equal(scene.trackCopy.style.opacity, undefined);
  assert.equal(scene.trackMedia.style.transform, undefined);
  assert.equal(env.seeks.length, 0);
  scope.revert();
});

test("short viewports and larger browser fonts use the static layout", () => {
  for (const options of [
    { height: 650 },
    { width: 1200, height: 800, fontSize: 20 },
  ]) {
    const env = browser(options);
    const root = element();
    const scope = env.load("extended-scroll").setupExtendedScrollMotion(root, {
      render() {
        assert.fail("Content must remain in the static layout");
      },
      reset() {},
    });
    assert.equal(root.dataset.enhanced, undefined);
    scope.revert();
  }
});
