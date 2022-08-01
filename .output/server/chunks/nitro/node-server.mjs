globalThis._importMeta_=globalThis._importMeta_||{url:"file:///_entry.js",env:process.env};import 'node-fetch-native/polyfill';
import { Server as Server$1 } from 'http';
import { Server } from 'https';
import destr from 'destr';
import { defineEventHandler, handleCacheHeaders, createEvent, eventHandler, createError, createApp, createRouter, lazyEventHandler } from 'h3';
import { createFetch as createFetch$1, Headers } from 'ohmyfetch';
import { createRouter as createRouter$1 } from 'radix3';
import { createCall, createFetch } from 'unenv/runtime/fetch/index';
import { createHooks } from 'hookable';
import { snakeCase } from 'scule';
import { hash } from 'ohash';
import { parseURL, withQuery, withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { createStorage } from 'unstorage';
import { promises } from 'fs';
import { dirname, resolve } from 'pathe';
import { fileURLToPath } from 'url';

const _runtimeConfig = {"app":{"baseURL":"/","buildAssetsDir":"/_nuxt/","cdnURL":""},"nitro":{"routes":{},"envPrefix":"NUXT_"},"public":{}};
const ENV_PREFIX = "NITRO_";
const ENV_PREFIX_ALT = _runtimeConfig.nitro.envPrefix ?? process.env.NITRO_ENV_PREFIX ?? "_";
const getEnv = (key) => {
  const envKey = snakeCase(key).toUpperCase();
  return destr(process.env[ENV_PREFIX + envKey] ?? process.env[ENV_PREFIX_ALT + envKey]);
};
function isObject(input) {
  return typeof input === "object" && !Array.isArray(input);
}
function overrideConfig(obj, parentKey = "") {
  for (const key in obj) {
    const subKey = parentKey ? `${parentKey}_${key}` : key;
    const envValue = getEnv(subKey);
    if (isObject(obj[key])) {
      if (isObject(envValue)) {
        obj[key] = { ...obj[key], ...envValue };
      }
      overrideConfig(obj[key], subKey);
    } else {
      obj[key] = envValue ?? obj[key];
    }
  }
}
overrideConfig(_runtimeConfig);
const config = deepFreeze(_runtimeConfig);
const useRuntimeConfig = () => config;
function deepFreeze(object) {
  const propNames = Object.getOwnPropertyNames(object);
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value);
    }
  }
  return Object.freeze(object);
}

const globalTiming = globalThis.__timing__ || {
  start: () => 0,
  end: () => 0,
  metrics: []
};
function timingMiddleware(_req, res, next) {
  const start = globalTiming.start();
  const _end = res.end;
  res.end = (data, encoding, callback) => {
    const metrics = [["Generate", globalTiming.end(start)], ...globalTiming.metrics];
    const serverTiming = metrics.map((m) => `-;dur=${m[1]};desc="${encodeURIComponent(m[0])}"`).join(", ");
    if (!res.headersSent) {
      res.setHeader("Server-Timing", serverTiming);
    }
    _end.call(res, data, encoding, callback);
  };
  next();
}

const _assets = {

};

function normalizeKey(key) {
  if (!key) {
    return "";
  }
  return key.replace(/[/\\]/g, ":").replace(/:+/g, ":").replace(/^:|:$/g, "");
}

const assets$1 = {
  getKeys() {
    return Promise.resolve(Object.keys(_assets))
  },
  hasItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(id in _assets)
  },
  getItem (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].import() : null)
  },
  getMeta (id) {
    id = normalizeKey(id);
    return Promise.resolve(_assets[id] ? _assets[id].meta : {})
  }
};

const storage = createStorage({});

const useStorage = () => storage;

storage.mount('/assets', assets$1);

const defaultCacheOptions = {
  name: "_",
  base: "/cache",
  swr: true,
  maxAge: 1
};
function defineCachedFunction(fn, opts) {
  opts = { ...defaultCacheOptions, ...opts };
  const pending = {};
  const group = opts.group || "nitro";
  const name = opts.name || fn.name || "_";
  const integrity = hash([opts.integrity, fn, opts]);
  async function get(key, resolver) {
    const cacheKey = [opts.base, group, name, key + ".json"].filter(Boolean).join(":").replace(/:\/$/, ":index");
    const entry = await useStorage().getItem(cacheKey) || {};
    const ttl = (opts.maxAge ?? opts.maxAge ?? 0) * 1e3;
    if (ttl) {
      entry.expires = Date.now() + ttl;
    }
    const expired = entry.integrity !== integrity || ttl && Date.now() - (entry.mtime || 0) > ttl;
    const _resolve = async () => {
      if (!pending[key]) {
        entry.value = void 0;
        entry.integrity = void 0;
        entry.mtime = void 0;
        entry.expires = void 0;
        pending[key] = Promise.resolve(resolver());
      }
      entry.value = await pending[key];
      entry.mtime = Date.now();
      entry.integrity = integrity;
      delete pending[key];
      useStorage().setItem(cacheKey, entry).catch((error) => console.error("[nitro] [cache]", error));
    };
    const _resolvePromise = expired ? _resolve() : Promise.resolve();
    if (opts.swr && entry.value) {
      _resolvePromise.catch(console.error);
      return Promise.resolve(entry);
    }
    return _resolvePromise.then(() => entry);
  }
  return async (...args) => {
    const key = (opts.getKey || getKey)(...args);
    const entry = await get(key, () => fn(...args));
    let value = entry.value;
    if (opts.transform) {
      value = await opts.transform(entry, ...args) || value;
    }
    return value;
  };
}
const cachedFunction = defineCachedFunction;
function getKey(...args) {
  return args.length ? hash(args, {}) : "";
}
function defineCachedEventHandler(handler, opts = defaultCacheOptions) {
  const _opts = {
    ...opts,
    getKey: (event) => {
      return decodeURI(parseURL(event.req.originalUrl || event.req.url).pathname).replace(/\/$/, "/index");
    },
    group: opts.group || "nitro/handlers",
    integrity: [
      opts.integrity,
      handler
    ]
  };
  const _cachedHandler = cachedFunction(async (incomingEvent) => {
    const reqProxy = cloneWithProxy(incomingEvent.req, { headers: {} });
    const resHeaders = {};
    const resProxy = cloneWithProxy(incomingEvent.res, {
      statusCode: 200,
      getHeader(name) {
        return resHeaders[name];
      },
      setHeader(name, value) {
        resHeaders[name] = value;
        return this;
      },
      getHeaderNames() {
        return Object.keys(resHeaders);
      },
      hasHeader(name) {
        return name in resHeaders;
      },
      removeHeader(name) {
        delete resHeaders[name];
      },
      getHeaders() {
        return resHeaders;
      }
    });
    const event = createEvent(reqProxy, resProxy);
    event.context = incomingEvent.context;
    const body = await handler(event);
    const headers = event.res.getHeaders();
    headers.Etag = `W/"${hash(body)}"`;
    headers["Last-Modified"] = new Date().toUTCString();
    const cacheControl = [];
    if (opts.swr) {
      if (opts.maxAge) {
        cacheControl.push(`s-maxage=${opts.maxAge}`);
      }
      if (opts.staleMaxAge) {
        cacheControl.push(`stale-while-revalidate=${opts.staleMaxAge}`);
      } else {
        cacheControl.push("stale-while-revalidate");
      }
    } else if (opts.maxAge) {
      cacheControl.push(`max-age=${opts.maxAge}`);
    }
    if (cacheControl.length) {
      headers["Cache-Control"] = cacheControl.join(", ");
    }
    const cacheEntry = {
      code: event.res.statusCode,
      headers,
      body
    };
    return cacheEntry;
  }, _opts);
  return defineEventHandler(async (event) => {
    const response = await _cachedHandler(event);
    if (event.res.headersSent || event.res.writableEnded) {
      return response.body;
    }
    if (handleCacheHeaders(event, {
      modifiedTime: new Date(response.headers["Last-Modified"]),
      etag: response.headers.etag,
      maxAge: opts.maxAge
    })) {
      return;
    }
    event.res.statusCode = response.code;
    for (const name in response.headers) {
      event.res.setHeader(name, response.headers[name]);
    }
    return response.body;
  });
}
function cloneWithProxy(obj, overrides) {
  return new Proxy(obj, {
    get(target, property, receiver) {
      if (property in overrides) {
        return overrides[property];
      }
      return Reflect.get(target, property, receiver);
    },
    set(target, property, value, receiver) {
      if (property in overrides) {
        overrides[property] = value;
        return true;
      }
      return Reflect.set(target, property, value, receiver);
    }
  });
}
const cachedEventHandler = defineCachedEventHandler;

const plugins = [
  
];

function hasReqHeader(req, header, includes) {
  const value = req.headers[header];
  return value && typeof value === "string" && value.toLowerCase().includes(includes);
}
function isJsonRequest(event) {
  return hasReqHeader(event.req, "accept", "application/json") || hasReqHeader(event.req, "user-agent", "curl/") || hasReqHeader(event.req, "user-agent", "httpie/") || event.req.url?.endsWith(".json") || event.req.url?.includes("/api/");
}
function normalizeError(error) {
  const cwd = process.cwd();
  const stack = (error.stack || "").split("\n").splice(1).filter((line) => line.includes("at ")).map((line) => {
    const text = line.replace(cwd + "/", "./").replace("webpack:/", "").replace("file://", "").trim();
    return {
      text,
      internal: line.includes("node_modules") && !line.includes(".cache") || line.includes("internal") || line.includes("new Promise")
    };
  });
  const statusCode = error.statusCode || 500;
  const statusMessage = error.statusMessage ?? (statusCode === 404 ? "Route Not Found" : "Internal Server Error");
  const message = error.message || error.toString();
  return {
    stack,
    statusCode,
    statusMessage,
    message
  };
}

const errorHandler = (async function errorhandler(_error, event) {
  const { stack, statusCode, statusMessage, message } = normalizeError(_error);
  const errorObject = {
    url: event.req.url,
    statusCode,
    statusMessage,
    message,
    description: "",
    data: _error.data
  };
  event.res.statusCode = errorObject.statusCode;
  event.res.statusMessage = errorObject.statusMessage;
  if (errorObject.statusCode !== 404) {
    console.error("[nuxt] [request error]", errorObject.message + "\n" + stack.map((l) => "  " + l.text).join("  \n"));
  }
  if (isJsonRequest(event)) {
    event.res.setHeader("Content-Type", "application/json");
    event.res.end(JSON.stringify(errorObject));
    return;
  }
  const url = withQuery("/__nuxt_error", errorObject);
  const html = await $fetch(url).catch((error) => {
    console.error("[nitro] Error while generating error response", error);
    return errorObject.statusMessage;
  });
  event.res.setHeader("Content-Type", "text/html;charset=UTF-8");
  event.res.end(html);
});

const assets = {
  "/logo.png": {
    "type": "image/png",
    "etag": "\"259-BPKv6v286zPBhLP/MeGlEyVttcQ\"",
    "mtime": "2022-08-01T14:20:41.255Z",
    "path": "../public/logo.png"
  },
  "/robots.txt": {
    "type": "text/plain; charset=utf-8",
    "etag": "\"16-iUOtJ2RsHfdY9DoQxaq0wz1LZCU\"",
    "mtime": "2022-08-01T14:20:41.255Z",
    "path": "../public/robots.txt"
  },
  "/_nuxt/Banner-501b6149.mjs": {
    "type": "application/javascript",
    "etag": "\"736-aYNjUNe78ewS0Kh7dlh2u5St7qM\"",
    "mtime": "2022-08-01T14:20:41.254Z",
    "path": "../public/_nuxt/Banner-501b6149.mjs"
  },
  "/_nuxt/NewStory-81555e75.mjs": {
    "type": "application/javascript",
    "etag": "\"21-9spEOGVcmW89hqFrYBxSkrRDzAU\"",
    "mtime": "2022-08-01T14:20:41.254Z",
    "path": "../public/_nuxt/NewStory-81555e75.mjs"
  },
  "/_nuxt/RepresentCategory-c191b65f.mjs": {
    "type": "application/javascript",
    "etag": "\"c6f-Nm6oBGzKb3xnJvpdA6fsOyE87mQ\"",
    "mtime": "2022-08-01T14:20:41.254Z",
    "path": "../public/_nuxt/RepresentCategory-c191b65f.mjs"
  },
  "/_nuxt/entry-a1c6b58f.mjs": {
    "type": "application/javascript",
    "etag": "\"1dd20-NJCqIxjPzSyqnMddYk8Nx9kQbTs\"",
    "mtime": "2022-08-01T14:20:41.254Z",
    "path": "../public/_nuxt/entry-a1c6b58f.mjs"
  },
  "/_nuxt/entry.417f810f.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"15cd-b0j/QEgs6fxBXM0xoJb4rxRmgA0\"",
    "mtime": "2022-08-01T14:20:41.253Z",
    "path": "../public/_nuxt/entry.417f810f.css"
  },
  "/_nuxt/error-404-44a92b61.mjs": {
    "type": "application/javascript",
    "etag": "\"81f-vzQMtCDR+RYB+1sVjZJ1I46NQp0\"",
    "mtime": "2022-08-01T14:20:41.253Z",
    "path": "../public/_nuxt/error-404-44a92b61.mjs"
  },
  "/_nuxt/error-404.314f7075.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"11bd-kF6SKfdJYaoPOx5XSNB4IuKqq6c\"",
    "mtime": "2022-08-01T14:20:41.252Z",
    "path": "../public/_nuxt/error-404.314f7075.css"
  },
  "/_nuxt/error-500-72ea5855.mjs": {
    "type": "application/javascript",
    "etag": "\"6c8-tgU9Cs2DgTOtB/oFNhnx+AUi4HI\"",
    "mtime": "2022-08-01T14:20:41.252Z",
    "path": "../public/_nuxt/error-500-72ea5855.mjs"
  },
  "/_nuxt/error-500.4e3461e5.css": {
    "type": "text/css; charset=utf-8",
    "etag": "\"af4-ckENJljqPJ6JYcymKbQpp8F2r1I\"",
    "mtime": "2022-08-01T14:20:41.252Z",
    "path": "../public/_nuxt/error-500.4e3461e5.css"
  },
  "/_nuxt/error-component-d8b91945.mjs": {
    "type": "application/javascript",
    "etag": "\"425-WWK4nfsjas99HTiCdNNcN+5n9w0\"",
    "mtime": "2022-08-01T14:20:41.252Z",
    "path": "../public/_nuxt/error-component-d8b91945.mjs"
  },
  "/_nuxt/index-2d2e7140.mjs": {
    "type": "application/javascript",
    "etag": "\"d66-PGnIUMtvdGVdlb4u+4JaaLzI+fE\"",
    "mtime": "2022-08-01T14:20:41.249Z",
    "path": "../public/_nuxt/index-2d2e7140.mjs"
  },
  "/_nuxt/manifest.json": {
    "type": "application/json",
    "etag": "\"b54-1hkK4ZD/q6lEajHvgfK6WUJtSS8\"",
    "mtime": "2022-08-01T14:20:41.249Z",
    "path": "../public/_nuxt/manifest.json"
  },
  "/_nuxt/path-547c5d89.mjs": {
    "type": "application/javascript",
    "etag": "\"4a-tiR9oPljEl2RInOJ9UjCz+6nvew\"",
    "mtime": "2022-08-01T14:20:41.249Z",
    "path": "../public/_nuxt/path-547c5d89.mjs"
  },
  "/_nuxt/welcome-e58c96b9.mjs": {
    "type": "application/javascript",
    "etag": "\"2dc8-OGdxNMWK4HWZCj6G5rQqCo4mZk0\"",
    "mtime": "2022-08-01T14:20:41.248Z",
    "path": "../public/_nuxt/welcome-e58c96b9.mjs"
  },
  "/images/bg-spotlight.png": {
    "type": "image/png",
    "etag": "\"afce-Fv92f75+twXYgi7IhMurXn3C/YU\"",
    "mtime": "2022-08-01T14:20:41.262Z",
    "path": "../public/images/bg-spotlight.png"
  },
  "/images/bg-wrapper-spotlight.png": {
    "type": "image/png",
    "etag": "\"14ddf-naVXN9F2enq+MJHhgCb4iiVNFP8\"",
    "mtime": "2022-08-01T14:20:41.262Z",
    "path": "../public/images/bg-wrapper-spotlight.png"
  },
  "/images/category.png": {
    "type": "image/png",
    "etag": "\"857-E65BKOki9tXQ+iUe1t0+97yohKc\"",
    "mtime": "2022-08-01T14:20:41.262Z",
    "path": "../public/images/category.png"
  },
  "/images/dam-my.png": {
    "type": "image/png",
    "etag": "\"96d9-FGyvJa2ABdzlSz/cr338ggdkNEM\"",
    "mtime": "2022-08-01T14:20:41.261Z",
    "path": "../public/images/dam-my.png"
  },
  "/images/huyen-huyen.png": {
    "type": "image/png",
    "etag": "\"88f7-WNKcF+vfYPMHUeTfwehM2bhgJ6E\"",
    "mtime": "2022-08-01T14:20:41.261Z",
    "path": "../public/images/huyen-huyen.png"
  },
  "/images/img-avatar.png": {
    "type": "image/png",
    "etag": "\"1f4a-Mv7atszIBIS+Gs9JYfFRzccyzXg\"",
    "mtime": "2022-08-01T14:20:41.261Z",
    "path": "../public/images/img-avatar.png"
  },
  "/images/mao-hiem.png": {
    "type": "image/png",
    "etag": "\"9fea-q7aahfuruaacccLx99Mo3TosRFU\"",
    "mtime": "2022-08-01T14:20:41.261Z",
    "path": "../public/images/mao-hiem.png"
  },
  "/images/nu-cuong.png": {
    "type": "image/png",
    "etag": "\"9402-Z2c0olLUOM77c5ydX+gWeu8KwUc\"",
    "mtime": "2022-08-01T14:20:41.261Z",
    "path": "../public/images/nu-cuong.png"
  },
  "/images/ranking.png": {
    "type": "image/png",
    "etag": "\"82c-/xslGZS+mtDeoIlpem5pCeqfEJ0\"",
    "mtime": "2022-08-01T14:20:41.261Z",
    "path": "../public/images/ranking.png"
  },
  "/images/spotlight-1.png": {
    "type": "image/png",
    "etag": "\"6e167-QR1+PI/vDr3jPvyOTWx6LPJbRUI\"",
    "mtime": "2022-08-01T14:20:41.260Z",
    "path": "../public/images/spotlight-1.png"
  },
  "/images/spotlight-2.png": {
    "type": "image/png",
    "etag": "\"20734-2ZjV6bURjiLLPEGRhoK8i+0Kons\"",
    "mtime": "2022-08-01T14:20:41.259Z",
    "path": "../public/images/spotlight-2.png"
  },
  "/images/spotlight-3.png": {
    "type": "image/png",
    "etag": "\"1f6b8-cIpGQEjNfizyaXbDGRTd7x7rmyA\"",
    "mtime": "2022-08-01T14:20:41.259Z",
    "path": "../public/images/spotlight-3.png"
  },
  "/images/spotlight-5.png": {
    "type": "image/png",
    "etag": "\"2fdfb-vjpSmy63NYvM/1IIhCap1yrJqJ0\"",
    "mtime": "2022-08-01T14:20:41.259Z",
    "path": "../public/images/spotlight-5.png"
  },
  "/images/spotlight-7.png": {
    "type": "image/png",
    "etag": "\"6b158-fgnxEDxvJSQqAO99kHRgHqZlrwM\"",
    "mtime": "2022-08-01T14:20:41.258Z",
    "path": "../public/images/spotlight-7.png"
  },
  "/images/tong-tai.png": {
    "type": "image/png",
    "etag": "\"7bd2-bKpMyMVdKevDX5rHj6U9+tmNs3E\"",
    "mtime": "2022-08-01T14:20:41.257Z",
    "path": "../public/images/tong-tai.png"
  },
  "/images/truong-hoc.png": {
    "type": "image/png",
    "etag": "\"a103-1Dcggw6172hOqXZLQW2LJ8KSy74\"",
    "mtime": "2022-08-01T14:20:41.256Z",
    "path": "../public/images/truong-hoc.png"
  },
  "/icons/chapterItem/icon-comment.svg": {
    "type": "image/svg+xml",
    "etag": "\"30a-tKaEVrz0AGgkFsmtzZoiK249TOg\"",
    "mtime": "2022-08-01T14:20:41.272Z",
    "path": "../public/icons/chapterItem/icon-comment.svg"
  },
  "/icons/chapterItem/icon-like.svg": {
    "type": "image/svg+xml",
    "etag": "\"338-Mu3PLBD3C+VbyRHNntvb/evTs98\"",
    "mtime": "2022-08-01T14:20:41.272Z",
    "path": "../public/icons/chapterItem/icon-like.svg"
  },
  "/icons/chapterItem/icon-view.svg": {
    "type": "image/svg+xml",
    "etag": "\"2ff-EuS8o4d69l/BxN7Ip58G0DNY2ZU\"",
    "mtime": "2022-08-01T14:20:41.271Z",
    "path": "../public/icons/chapterItem/icon-view.svg"
  },
  "/icons/comicPage/backgroundInfo.png": {
    "type": "image/png",
    "etag": "\"30d4-o2f3aSZrDK2vB+thMfxXpqIPbxc\"",
    "mtime": "2022-08-01T14:20:41.271Z",
    "path": "../public/icons/comicPage/backgroundInfo.png"
  },
  "/icons/comicPage/icon-back.svg": {
    "type": "image/svg+xml",
    "etag": "\"119-EYaRxectNOBTtXeZEsmwnSTB+bQ\"",
    "mtime": "2022-08-01T14:20:41.271Z",
    "path": "../public/icons/comicPage/icon-back.svg"
  },
  "/icons/comicPage/icon-comment-count.svg": {
    "type": "image/svg+xml",
    "etag": "\"28a-PgPoMRg6jcTxhJURo48TG+lc6Ss\"",
    "mtime": "2022-08-01T14:20:41.271Z",
    "path": "../public/icons/comicPage/icon-comment-count.svg"
  },
  "/icons/comicPage/icon-follow-count.svg": {
    "type": "image/svg+xml",
    "etag": "\"3c2-mcOabHBYmJOjYl1TSMVRd9w3sCA\"",
    "mtime": "2022-08-01T14:20:41.271Z",
    "path": "../public/icons/comicPage/icon-follow-count.svg"
  },
  "/icons/comicPage/icon-follow.svg": {
    "type": "image/svg+xml",
    "etag": "\"3c2-mcOabHBYmJOjYl1TSMVRd9w3sCA\"",
    "mtime": "2022-08-01T14:20:41.270Z",
    "path": "../public/icons/comicPage/icon-follow.svg"
  },
  "/icons/comicPage/icon-promote.png": {
    "type": "image/png",
    "etag": "\"ae6-ChBGJd6lmGsfyZoYsPfoavAeQys\"",
    "mtime": "2022-08-01T14:20:41.270Z",
    "path": "../public/icons/comicPage/icon-promote.png"
  },
  "/icons/comicPage/icon-report.svg": {
    "type": "image/svg+xml",
    "etag": "\"2f8-tcGpENfuInaasFGvALGYLxbxxSk\"",
    "mtime": "2022-08-01T14:20:41.270Z",
    "path": "../public/icons/comicPage/icon-report.svg"
  },
  "/icons/comicPage/icon-share.svg": {
    "type": "image/svg+xml",
    "etag": "\"4db-suvf51D+kGPy94FT1U0BiisG6Lc\"",
    "mtime": "2022-08-01T14:20:41.270Z",
    "path": "../public/icons/comicPage/icon-share.svg"
  },
  "/icons/comicPage/icon-star-deactive.svg": {
    "type": "image/svg+xml",
    "etag": "\"0-2jmj7l5rSw0yVb/vlWAYkK/YBwk\"",
    "mtime": "2022-08-01T14:20:41.270Z",
    "path": "../public/icons/comicPage/icon-star-deactive.svg"
  },
  "/icons/comicPage/icon-star.svg": {
    "type": "image/svg+xml",
    "etag": "\"33d-leI151VDTgvlK2pUxO+VRE19rR0\"",
    "mtime": "2022-08-01T14:20:41.270Z",
    "path": "../public/icons/comicPage/icon-star.svg"
  },
  "/icons/comicPage/icon-view-count.svg": {
    "type": "image/svg+xml",
    "etag": "\"2ff-RCrIOPQmJIjlK3sNCpVZ2JPJRsA\"",
    "mtime": "2022-08-01T14:20:41.269Z",
    "path": "../public/icons/comicPage/icon-view-count.svg"
  },
  "/icons/header/icon-back-white.svg": {
    "type": "image/svg+xml",
    "etag": "\"f0-AHS3nfopH5kdniGlg2rbUHb5sVE\"",
    "mtime": "2022-08-01T14:20:41.269Z",
    "path": "../public/icons/header/icon-back-white.svg"
  },
  "/icons/header/icon-search.svg": {
    "type": "image/svg+xml",
    "etag": "\"1ab-YJ8OrjmJIGFDfBMQQABSueOkt/w\"",
    "mtime": "2022-08-01T14:20:41.269Z",
    "path": "../public/icons/header/icon-search.svg"
  },
  "/icons/homePage/icon-view-chapter.svg": {
    "type": "image/svg+xml",
    "etag": "\"30e-+XXJMOqo2k6wq93ILanbxLFS15E\"",
    "mtime": "2022-08-01T14:20:41.268Z",
    "path": "../public/icons/homePage/icon-view-chapter.svg"
  },
  "/icons/searchPage/icon-back.svg": {
    "type": "image/svg+xml",
    "etag": "\"f0-NujVPaP8y67ZtwgqY9O0QkCh7ss\"",
    "mtime": "2022-08-01T14:20:41.265Z",
    "path": "../public/icons/searchPage/icon-back.svg"
  },
  "/icons/searchPage/icon-close.svg": {
    "type": "image/svg+xml",
    "etag": "\"20b-Nq/7L9bkiCddZSY0Xm4X8/mFdlM\"",
    "mtime": "2022-08-01T14:20:41.265Z",
    "path": "../public/icons/searchPage/icon-close.svg"
  },
  "/icons/searchPage/icon-search.svg": {
    "type": "image/svg+xml",
    "etag": "\"1ff-bbuK3n5mjvz2hNkwLX81QEeKbtc\"",
    "mtime": "2022-08-01T14:20:41.265Z",
    "path": "../public/icons/searchPage/icon-search.svg"
  },
  "/icons/searchPage/icon-star.svg": {
    "type": "image/svg+xml",
    "etag": "\"30e-xOosY3V0XdXZf7KUQyFRh0gN0UM\"",
    "mtime": "2022-08-01T14:20:41.265Z",
    "path": "../public/icons/searchPage/icon-star.svg"
  },
  "/icons/searchPage/icon-view-count.svg": {
    "type": "image/svg+xml",
    "etag": "\"2ff-EuS8o4d69l/BxN7Ip58G0DNY2ZU\"",
    "mtime": "2022-08-01T14:20:41.264Z",
    "path": "../public/icons/searchPage/icon-view-count.svg"
  },
  "/icons/tabbar/icon-canhan.svg": {
    "type": "image/svg+xml",
    "etag": "\"5b0-QgHHSy6i78LIgWCWol0tHvfsJNY\"",
    "mtime": "2022-08-01T14:20:41.264Z",
    "path": "../public/icons/tabbar/icon-canhan.svg"
  },
  "/icons/tabbar/icon-newsfeed.svg": {
    "type": "image/svg+xml",
    "etag": "\"66f-B/o0NLlN4OPOTUBooEFdc2zRl6M\"",
    "mtime": "2022-08-01T14:20:41.264Z",
    "path": "../public/icons/tabbar/icon-newsfeed.svg"
  },
  "/icons/tabbar/icon-novel.svg": {
    "type": "image/svg+xml",
    "etag": "\"936-hOMOXh2+fGNAlYTGhu09kfNIB3Y\"",
    "mtime": "2022-08-01T14:20:41.264Z",
    "path": "../public/icons/tabbar/icon-novel.svg"
  },
  "/icons/tabbar/icon-toon-active.svg": {
    "type": "image/svg+xml",
    "etag": "\"67d-A5yStXKRiUCbVR4qfno/x3Skk5Q\"",
    "mtime": "2022-08-01T14:20:41.264Z",
    "path": "../public/icons/tabbar/icon-toon-active.svg"
  },
  "/icons/tabbar/icon-tutruyen.svg": {
    "type": "image/svg+xml",
    "etag": "\"650-AgiyMw1qU7jOgUv5W/U1W+hyxk8\"",
    "mtime": "2022-08-01T14:20:41.264Z",
    "path": "../public/icons/tabbar/icon-tutruyen.svg"
  },
  "/images/trending/bg-trending.png": {
    "type": "image/png",
    "etag": "\"bd222-hJzVmGMgWNspLIVzjjiCCds+AC4\"",
    "mtime": "2022-08-01T14:20:41.257Z",
    "path": "../public/images/trending/bg-trending.png"
  },
  "/icons/widgets/trend/img-header.svg": {
    "type": "image/svg+xml",
    "etag": "\"3fa0b-LgQNTFo/k4fJnjlNaSm46AmHX4E\"",
    "mtime": "2022-08-01T14:20:41.263Z",
    "path": "../public/icons/widgets/trend/img-header.svg"
  }
};

function readAsset (id) {
  const serverDir = dirname(fileURLToPath(globalThis._importMeta_.url));
  return promises.readFile(resolve(serverDir, assets[id].path))
}

const publicAssetBases = ["/_nuxt"];

function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base of publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

function getAsset (id) {
  return assets[id]
}

const METHODS = ["HEAD", "GET"];
const _f4b49z = eventHandler(async (event) => {
  if (event.req.method && !METHODS.includes(event.req.method)) {
    return;
  }
  let id = decodeURIComponent(withLeadingSlash(withoutTrailingSlash(parseURL(event.req.url).pathname)));
  let asset;
  for (const _id of [id, id + "/index.html"]) {
    const _asset = getAsset(_id);
    if (_asset) {
      asset = _asset;
      id = _id;
      break;
    }
  }
  if (!asset) {
    if (isPublicAssetURL(id)) {
      throw createError({
        statusMessage: "Cannot find static asset " + id,
        statusCode: 404
      });
    }
    return;
  }
  const ifNotMatch = event.req.headers["if-none-match"] === asset.etag;
  if (ifNotMatch) {
    event.res.statusCode = 304;
    event.res.end("Not Modified (etag)");
    return;
  }
  const ifModifiedSinceH = event.req.headers["if-modified-since"];
  if (ifModifiedSinceH && asset.mtime) {
    if (new Date(ifModifiedSinceH) >= new Date(asset.mtime)) {
      event.res.statusCode = 304;
      event.res.end("Not Modified (mtime)");
      return;
    }
  }
  if (asset.type) {
    event.res.setHeader("Content-Type", asset.type);
  }
  if (asset.etag) {
    event.res.setHeader("ETag", asset.etag);
  }
  if (asset.mtime) {
    event.res.setHeader("Last-Modified", asset.mtime);
  }
  const contents = await readAsset(id);
  event.res.end(contents);
});

const _lazy_bU2Ua0 = () => import('../home.mjs');
const _lazy_Xd80E1 = () => import('../handlers/renderer.mjs').then(function (n) { return n.r; });

const handlers = [
  { route: '', handler: _f4b49z, lazy: false, middleware: true, method: undefined },
  { route: '/api/home', handler: _lazy_bU2Ua0, lazy: true, middleware: false, method: undefined },
  { route: '/__nuxt_error', handler: _lazy_Xd80E1, lazy: true, middleware: false, method: undefined },
  { route: '/**', handler: _lazy_Xd80E1, lazy: true, middleware: false, method: undefined }
];

function createNitroApp() {
  const config = useRuntimeConfig();
  const hooks = createHooks();
  const h3App = createApp({
    debug: destr(false),
    onError: errorHandler
  });
  h3App.use(config.app.baseURL, timingMiddleware);
  const router = createRouter();
  const routerOptions = createRouter$1({ routes: config.nitro.routes });
  for (const h of handlers) {
    let handler = h.lazy ? lazyEventHandler(h.handler) : h.handler;
    const referenceRoute = h.route.replace(/:\w+|\*\*/g, "_");
    const routeOptions = routerOptions.lookup(referenceRoute) || {};
    if (routeOptions.swr) {
      handler = cachedEventHandler(handler, {
        group: "nitro/routes"
      });
    }
    if (h.middleware || !h.route) {
      const middlewareBase = (config.app.baseURL + (h.route || "/")).replace(/\/+/g, "/");
      h3App.use(middlewareBase, handler);
    } else {
      router.use(h.route, handler, h.method);
    }
  }
  h3App.use(config.app.baseURL, router);
  const localCall = createCall(h3App.nodeHandler);
  const localFetch = createFetch(localCall, globalThis.fetch);
  const $fetch = createFetch$1({ fetch: localFetch, Headers, defaults: { baseURL: config.app.baseURL } });
  globalThis.$fetch = $fetch;
  const app = {
    hooks,
    h3App,
    router,
    localCall,
    localFetch
  };
  for (const plugin of plugins) {
    plugin(app);
  }
  return app;
}
const nitroApp = createNitroApp();

const cert = process.env.NITRO_SSL_CERT;
const key = process.env.NITRO_SSL_KEY;
const server = cert && key ? new Server({ key, cert }, nitroApp.h3App.nodeHandler) : new Server$1(nitroApp.h3App.nodeHandler);
const port = destr(process.env.NITRO_PORT || process.env.PORT) || 3e3;
const hostname = process.env.NITRO_HOST || process.env.HOST || "0.0.0.0";
server.listen(port, hostname, (err) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  const protocol = cert && key ? "https" : "http";
  console.log(`Listening on ${protocol}://${hostname}:${port}${useRuntimeConfig().app.baseURL}`);
});
{
  process.on("unhandledRejection", (err) => console.error("[nitro] [dev] [unhandledRejection] " + err));
  process.on("uncaughtException", (err) => console.error("[nitro] [dev] [uncaughtException] " + err));
}
const nodeServer = {};

export { nodeServer as n, useRuntimeConfig as u };
//# sourceMappingURL=node-server.mjs.map
