import { v as vue_cjs_prod, s as serverRenderer } from '../handlers/renderer.mjs';
import { joinURL, hasProtocol, isEqual, withBase, withQuery } from 'ufo';
import { u as useRuntimeConfig$1 } from '../nitro/node-server.mjs';
import 'h3';
import 'unenv/runtime/mock/proxy';
import 'stream';
import 'node-fetch-native/polyfill';
import 'http';
import 'https';
import 'destr';
import 'ohmyfetch';
import 'radix3';
import 'unenv/runtime/fetch/index';
import 'hookable';
import 'scule';
import 'ohash';
import 'unstorage';
import 'fs';
import 'pathe';
import 'url';

var vueRouter_prod = {};

/*!
  * vue-router v4.1.3
  * (c) 2022 Eduardo San Martin Morote
  * @license MIT
  */

(function (exports) {

	Object.defineProperty(exports, '__esModule', { value: true });

	var vue = vue_cjs_prod;

	function isESModule(obj) {
	    return obj.__esModule || obj[Symbol.toStringTag] === 'Module';
	}
	const assign = Object.assign;
	function applyToParams(fn, params) {
	    const newParams = {};
	    for (const key in params) {
	        const value = params[key];
	        newParams[key] = isArray(value)
	            ? value.map(fn)
	            : fn(value);
	    }
	    return newParams;
	}
	const noop = () => { };
	/**
	 * Typesafe alternative to Array.isArray
	 * https://github.com/microsoft/TypeScript/pull/48228
	 */
	const isArray = Array.isArray;

	const TRAILING_SLASH_RE = /\/$/;
	const removeTrailingSlash = (path) => path.replace(TRAILING_SLASH_RE, '');
	/**
	 * Transforms an URI into a normalized history location
	 *
	 * @param parseQuery
	 * @param location - URI to normalize
	 * @param currentLocation - current absolute location. Allows resolving relative
	 * paths. Must start with `/`. Defaults to `/`
	 * @returns a normalized history location
	 */
	function parseURL(parseQuery, location, currentLocation = '/') {
	    let path, query = {}, searchString = '', hash = '';
	    // Could use URL and URLSearchParams but IE 11 doesn't support it
	    // TODO: move to new URL()
	    const hashPos = location.indexOf('#');
	    let searchPos = location.indexOf('?');
	    // the hash appears before the search, so it's not part of the search string
	    if (hashPos < searchPos && hashPos >= 0) {
	        searchPos = -1;
	    }
	    if (searchPos > -1) {
	        path = location.slice(0, searchPos);
	        searchString = location.slice(searchPos + 1, hashPos > -1 ? hashPos : location.length);
	        query = parseQuery(searchString);
	    }
	    if (hashPos > -1) {
	        path = path || location.slice(0, hashPos);
	        // keep the # character
	        hash = location.slice(hashPos, location.length);
	    }
	    // no search and no query
	    path = resolveRelativePath(path != null ? path : location, currentLocation);
	    // empty path means a relative query or hash `?foo=f`, `#thing`
	    return {
	        fullPath: path + (searchString && '?') + searchString + hash,
	        path,
	        query,
	        hash,
	    };
	}
	/**
	 * Stringifies a URL object
	 *
	 * @param stringifyQuery
	 * @param location
	 */
	function stringifyURL(stringifyQuery, location) {
	    const query = location.query ? stringifyQuery(location.query) : '';
	    return location.path + (query && '?') + query + (location.hash || '');
	}
	/**
	 * Strips off the base from the beginning of a location.pathname in a non
	 * case-sensitive way.
	 *
	 * @param pathname - location.pathname
	 * @param base - base to strip off
	 */
	function stripBase(pathname, base) {
	    // no base or base is not found at the beginning
	    if (!base || !pathname.toLowerCase().startsWith(base.toLowerCase()))
	        return pathname;
	    return pathname.slice(base.length) || '/';
	}
	/**
	 * Checks if two RouteLocation are equal. This means that both locations are
	 * pointing towards the same {@link RouteRecord} and that all `params`, `query`
	 * parameters and `hash` are the same
	 *
	 * @param a - first {@link RouteLocation}
	 * @param b - second {@link RouteLocation}
	 */
	function isSameRouteLocation(stringifyQuery, a, b) {
	    const aLastIndex = a.matched.length - 1;
	    const bLastIndex = b.matched.length - 1;
	    return (aLastIndex > -1 &&
	        aLastIndex === bLastIndex &&
	        isSameRouteRecord(a.matched[aLastIndex], b.matched[bLastIndex]) &&
	        isSameRouteLocationParams(a.params, b.params) &&
	        stringifyQuery(a.query) === stringifyQuery(b.query) &&
	        a.hash === b.hash);
	}
	/**
	 * Check if two `RouteRecords` are equal. Takes into account aliases: they are
	 * considered equal to the `RouteRecord` they are aliasing.
	 *
	 * @param a - first {@link RouteRecord}
	 * @param b - second {@link RouteRecord}
	 */
	function isSameRouteRecord(a, b) {
	    // since the original record has an undefined value for aliasOf
	    // but all aliases point to the original record, this will always compare
	    // the original record
	    return (a.aliasOf || a) === (b.aliasOf || b);
	}
	function isSameRouteLocationParams(a, b) {
	    if (Object.keys(a).length !== Object.keys(b).length)
	        return false;
	    for (const key in a) {
	        if (!isSameRouteLocationParamsValue(a[key], b[key]))
	            return false;
	    }
	    return true;
	}
	function isSameRouteLocationParamsValue(a, b) {
	    return isArray(a)
	        ? isEquivalentArray(a, b)
	        : isArray(b)
	            ? isEquivalentArray(b, a)
	            : a === b;
	}
	/**
	 * Check if two arrays are the same or if an array with one single entry is the
	 * same as another primitive value. Used to check query and parameters
	 *
	 * @param a - array of values
	 * @param b - array of values or a single value
	 */
	function isEquivalentArray(a, b) {
	    return isArray(b)
	        ? a.length === b.length && a.every((value, i) => value === b[i])
	        : a.length === 1 && a[0] === b;
	}
	/**
	 * Resolves a relative path that starts with `.`.
	 *
	 * @param to - path location we are resolving
	 * @param from - currentLocation.path, should start with `/`
	 */
	function resolveRelativePath(to, from) {
	    if (to.startsWith('/'))
	        return to;
	    if (!to)
	        return from;
	    const fromSegments = from.split('/');
	    const toSegments = to.split('/');
	    let position = fromSegments.length - 1;
	    let toPosition;
	    let segment;
	    for (toPosition = 0; toPosition < toSegments.length; toPosition++) {
	        segment = toSegments[toPosition];
	        // we stay on the same position
	        if (segment === '.')
	            continue;
	        // go up in the from array
	        if (segment === '..') {
	            // we can't go below zero but we still need to increment toPosition
	            if (position > 1)
	                position--;
	            // continue
	        }
	        // we reached a non relative path, we stop here
	        else
	            break;
	    }
	    return (fromSegments.slice(0, position).join('/') +
	        '/' +
	        toSegments
	            // ensure we use at least the last element in the toSegments
	            .slice(toPosition - (toPosition === toSegments.length ? 1 : 0))
	            .join('/'));
	}

	var NavigationType;
	(function (NavigationType) {
	    NavigationType["pop"] = "pop";
	    NavigationType["push"] = "push";
	})(NavigationType || (NavigationType = {}));
	var NavigationDirection;
	(function (NavigationDirection) {
	    NavigationDirection["back"] = "back";
	    NavigationDirection["forward"] = "forward";
	    NavigationDirection["unknown"] = "";
	})(NavigationDirection || (NavigationDirection = {}));
	/**
	 * Starting location for Histories
	 */
	const START = '';
	// Generic utils
	/**
	 * Normalizes a base by removing any trailing slash and reading the base tag if
	 * present.
	 *
	 * @param base - base to normalize
	 */
	function normalizeBase(base) {
	    if (!base) {
	        {
	            base = '/';
	        }
	    }
	    // ensure leading slash when it was removed by the regex above avoid leading
	    // slash with hash because the file could be read from the disk like file://
	    // and the leading slash would cause problems
	    if (base[0] !== '/' && base[0] !== '#')
	        base = '/' + base;
	    // remove the trailing slash so all other method can just do `base + fullPath`
	    // to build an href
	    return removeTrailingSlash(base);
	}
	// remove any character before the hash
	const BEFORE_HASH_RE = /^[^#]+#/;
	function createHref(base, location) {
	    return base.replace(BEFORE_HASH_RE, '#') + location;
	}
	const computeScrollPosition = () => ({
	    left: window.pageXOffset,
	    top: window.pageYOffset,
	});
	// TODO: RFC about how to save scroll position
	/**
	 * ScrollBehavior instance used by the router to compute and restore the scroll
	 * position when navigating.
	 */
	// export interface ScrollHandler<ScrollPositionEntry extends HistoryStateValue, ScrollPosition extends ScrollPositionEntry> {
	//   // returns a scroll position that can be saved in history
	//   compute(): ScrollPositionEntry
	//   // can take an extended ScrollPositionEntry
	//   scroll(position: ScrollPosition): void
	// }
	// export const scrollHandler: ScrollHandler<ScrollPosition> = {
	//   compute: computeScroll,
	//   scroll: scrollToPosition,
	// }

	let createBaseLocation = () => location.protocol + '//' + location.host;
	/**
	 * Creates a normalized history location from a window.location object
	 * @param location -
	 */
	function createCurrentLocation(base, location) {
	    const { pathname, search, hash } = location;
	    // allows hash bases like #, /#, #/, #!, #!/, /#!/, or even /folder#end
	    const hashPos = base.indexOf('#');
	    if (hashPos > -1) {
	        let slicePos = hash.includes(base.slice(hashPos))
	            ? base.slice(hashPos).length
	            : 1;
	        let pathFromHash = hash.slice(slicePos);
	        // prepend the starting slash to hash so the url starts with /#
	        if (pathFromHash[0] !== '/')
	            pathFromHash = '/' + pathFromHash;
	        return stripBase(pathFromHash, '');
	    }
	    const path = stripBase(pathname, base);
	    return path + search + hash;
	}
	function useHistoryListeners(base, historyState, currentLocation, replace) {
	    let listeners = [];
	    let teardowns = [];
	    // TODO: should it be a stack? a Dict. Check if the popstate listener
	    // can trigger twice
	    let pauseState = null;
	    const popStateHandler = ({ state, }) => {
	        const to = createCurrentLocation(base, location);
	        const from = currentLocation.value;
	        const fromState = historyState.value;
	        let delta = 0;
	        if (state) {
	            currentLocation.value = to;
	            historyState.value = state;
	            // ignore the popstate and reset the pauseState
	            if (pauseState && pauseState === from) {
	                pauseState = null;
	                return;
	            }
	            delta = fromState ? state.position - fromState.position : 0;
	        }
	        else {
	            replace(to);
	        }
	        // console.log({ deltaFromCurrent })
	        // Here we could also revert the navigation by calling history.go(-delta)
	        // this listener will have to be adapted to not trigger again and to wait for the url
	        // to be updated before triggering the listeners. Some kind of validation function would also
	        // need to be passed to the listeners so the navigation can be accepted
	        // call all listeners
	        listeners.forEach(listener => {
	            listener(currentLocation.value, from, {
	                delta,
	                type: NavigationType.pop,
	                direction: delta
	                    ? delta > 0
	                        ? NavigationDirection.forward
	                        : NavigationDirection.back
	                    : NavigationDirection.unknown,
	            });
	        });
	    };
	    function pauseListeners() {
	        pauseState = currentLocation.value;
	    }
	    function listen(callback) {
	        // setup the listener and prepare teardown callbacks
	        listeners.push(callback);
	        const teardown = () => {
	            const index = listeners.indexOf(callback);
	            if (index > -1)
	                listeners.splice(index, 1);
	        };
	        teardowns.push(teardown);
	        return teardown;
	    }
	    function beforeUnloadListener() {
	        const { history } = window;
	        if (!history.state)
	            return;
	        history.replaceState(assign({}, history.state, { scroll: computeScrollPosition() }), '');
	    }
	    function destroy() {
	        for (const teardown of teardowns)
	            teardown();
	        teardowns = [];
	        window.removeEventListener('popstate', popStateHandler);
	        window.removeEventListener('beforeunload', beforeUnloadListener);
	    }
	    // setup the listeners and prepare teardown callbacks
	    window.addEventListener('popstate', popStateHandler);
	    window.addEventListener('beforeunload', beforeUnloadListener);
	    return {
	        pauseListeners,
	        listen,
	        destroy,
	    };
	}
	/**
	 * Creates a state object
	 */
	function buildState(back, current, forward, replaced = false, computeScroll = false) {
	    return {
	        back,
	        current,
	        forward,
	        replaced,
	        position: window.history.length,
	        scroll: computeScroll ? computeScrollPosition() : null,
	    };
	}
	function useHistoryStateNavigation(base) {
	    const { history, location } = window;
	    // private variables
	    const currentLocation = {
	        value: createCurrentLocation(base, location),
	    };
	    const historyState = { value: history.state };
	    // build current history entry as this is a fresh navigation
	    if (!historyState.value) {
	        changeLocation(currentLocation.value, {
	            back: null,
	            current: currentLocation.value,
	            forward: null,
	            // the length is off by one, we need to decrease it
	            position: history.length - 1,
	            replaced: true,
	            // don't add a scroll as the user may have an anchor and we want
	            // scrollBehavior to be triggered without a saved position
	            scroll: null,
	        }, true);
	    }
	    function changeLocation(to, state, replace) {
	        /**
	         * if a base tag is provided and we are on a normal domain, we have to
	         * respect the provided `base` attribute because pushState() will use it and
	         * potentially erase anything before the `#` like at
	         * https://github.com/vuejs/router/issues/685 where a base of
	         * `/folder/#` but a base of `/` would erase the `/folder/` section. If
	         * there is no host, the `<base>` tag makes no sense and if there isn't a
	         * base tag we can just use everything after the `#`.
	         */
	        const hashIndex = base.indexOf('#');
	        const url = hashIndex > -1
	            ? (location.host && document.querySelector('base')
	                ? base
	                : base.slice(hashIndex)) + to
	            : createBaseLocation() + base + to;
	        try {
	            // BROWSER QUIRK
	            // NOTE: Safari throws a SecurityError when calling this function 100 times in 30 seconds
	            history[replace ? 'replaceState' : 'pushState'](state, '', url);
	            historyState.value = state;
	        }
	        catch (err) {
	            {
	                console.error(err);
	            }
	            // Force the navigation, this also resets the call count
	            location[replace ? 'replace' : 'assign'](url);
	        }
	    }
	    function replace(to, data) {
	        const state = assign({}, history.state, buildState(historyState.value.back, 
	        // keep back and forward entries but override current position
	        to, historyState.value.forward, true), data, { position: historyState.value.position });
	        changeLocation(to, state, true);
	        currentLocation.value = to;
	    }
	    function push(to, data) {
	        // Add to current entry the information of where we are going
	        // as well as saving the current position
	        const currentState = assign({}, 
	        // use current history state to gracefully handle a wrong call to
	        // history.replaceState
	        // https://github.com/vuejs/router/issues/366
	        historyState.value, history.state, {
	            forward: to,
	            scroll: computeScrollPosition(),
	        });
	        changeLocation(currentState.current, currentState, true);
	        const state = assign({}, buildState(currentLocation.value, to, null), { position: currentState.position + 1 }, data);
	        changeLocation(to, state, false);
	        currentLocation.value = to;
	    }
	    return {
	        location: currentLocation,
	        state: historyState,
	        push,
	        replace,
	    };
	}
	/**
	 * Creates an HTML5 history. Most common history for single page applications.
	 *
	 * @param base -
	 */
	function createWebHistory(base) {
	    base = normalizeBase(base);
	    const historyNavigation = useHistoryStateNavigation(base);
	    const historyListeners = useHistoryListeners(base, historyNavigation.state, historyNavigation.location, historyNavigation.replace);
	    function go(delta, triggerListeners = true) {
	        if (!triggerListeners)
	            historyListeners.pauseListeners();
	        history.go(delta);
	    }
	    const routerHistory = assign({
	        // it's overridden right after
	        location: '',
	        base,
	        go,
	        createHref: createHref.bind(null, base),
	    }, historyNavigation, historyListeners);
	    Object.defineProperty(routerHistory, 'location', {
	        enumerable: true,
	        get: () => historyNavigation.location.value,
	    });
	    Object.defineProperty(routerHistory, 'state', {
	        enumerable: true,
	        get: () => historyNavigation.state.value,
	    });
	    return routerHistory;
	}

	/**
	 * Creates a in-memory based history. The main purpose of this history is to handle SSR. It starts in a special location that is nowhere.
	 * It's up to the user to replace that location with the starter location by either calling `router.push` or `router.replace`.
	 *
	 * @param base - Base applied to all urls, defaults to '/'
	 * @returns a history object that can be passed to the router constructor
	 */
	function createMemoryHistory(base = '') {
	    let listeners = [];
	    let queue = [START];
	    let position = 0;
	    base = normalizeBase(base);
	    function setLocation(location) {
	        position++;
	        if (position === queue.length) {
	            // we are at the end, we can simply append a new entry
	            queue.push(location);
	        }
	        else {
	            // we are in the middle, we remove everything from here in the queue
	            queue.splice(position);
	            queue.push(location);
	        }
	    }
	    function triggerListeners(to, from, { direction, delta }) {
	        const info = {
	            direction,
	            delta,
	            type: NavigationType.pop,
	        };
	        for (const callback of listeners) {
	            callback(to, from, info);
	        }
	    }
	    const routerHistory = {
	        // rewritten by Object.defineProperty
	        location: START,
	        // TODO: should be kept in queue
	        state: {},
	        base,
	        createHref: createHref.bind(null, base),
	        replace(to) {
	            // remove current entry and decrement position
	            queue.splice(position--, 1);
	            setLocation(to);
	        },
	        push(to, data) {
	            setLocation(to);
	        },
	        listen(callback) {
	            listeners.push(callback);
	            return () => {
	                const index = listeners.indexOf(callback);
	                if (index > -1)
	                    listeners.splice(index, 1);
	            };
	        },
	        destroy() {
	            listeners = [];
	            queue = [START];
	            position = 0;
	        },
	        go(delta, shouldTrigger = true) {
	            const from = this.location;
	            const direction = 
	            // we are considering delta === 0 going forward, but in abstract mode
	            // using 0 for the delta doesn't make sense like it does in html5 where
	            // it reloads the page
	            delta < 0 ? NavigationDirection.back : NavigationDirection.forward;
	            position = Math.max(0, Math.min(position + delta, queue.length - 1));
	            if (shouldTrigger) {
	                triggerListeners(this.location, from, {
	                    direction,
	                    delta,
	                });
	            }
	        },
	    };
	    Object.defineProperty(routerHistory, 'location', {
	        enumerable: true,
	        get: () => queue[position],
	    });
	    return routerHistory;
	}

	/**
	 * Creates a hash history. Useful for web applications with no host (e.g. `file://`) or when configuring a server to
	 * handle any URL is not possible.
	 *
	 * @param base - optional base to provide. Defaults to `location.pathname + location.search` If there is a `<base>` tag
	 * in the `head`, its value will be ignored in favor of this parameter **but note it affects all the history.pushState()
	 * calls**, meaning that if you use a `<base>` tag, it's `href` value **has to match this parameter** (ignoring anything
	 * after the `#`).
	 *
	 * @example
	 * ```js
	 * // at https://example.com/folder
	 * createWebHashHistory() // gives a url of `https://example.com/folder#`
	 * createWebHashHistory('/folder/') // gives a url of `https://example.com/folder/#`
	 * // if the `#` is provided in the base, it won't be added by `createWebHashHistory`
	 * createWebHashHistory('/folder/#/app/') // gives a url of `https://example.com/folder/#/app/`
	 * // you should avoid doing this because it changes the original url and breaks copying urls
	 * createWebHashHistory('/other-folder/') // gives a url of `https://example.com/other-folder/#`
	 *
	 * // at file:///usr/etc/folder/index.html
	 * // for locations with no `host`, the base is ignored
	 * createWebHashHistory('/iAmIgnored') // gives a url of `file:///usr/etc/folder/index.html#`
	 * ```
	 */
	function createWebHashHistory(base) {
	    // Make sure this implementation is fine in terms of encoding, specially for IE11
	    // for `file://`, directly use the pathname and ignore the base
	    // location.pathname contains an initial `/` even at the root: `https://example.com`
	    base = location.host ? base || location.pathname + location.search : '';
	    // allow the user to provide a `#` in the middle: `/base/#/app`
	    if (!base.includes('#'))
	        base += '#';
	    return createWebHistory(base);
	}

	function isRouteLocation(route) {
	    return typeof route === 'string' || (route && typeof route === 'object');
	}
	function isRouteName(name) {
	    return typeof name === 'string' || typeof name === 'symbol';
	}

	/**
	 * Initial route location where the router is. Can be used in navigation guards
	 * to differentiate the initial navigation.
	 *
	 * @example
	 * ```js
	 * import { START_LOCATION } from 'vue-router'
	 *
	 * router.beforeEach((to, from) => {
	 *   if (from === START_LOCATION) {
	 *     // initial navigation
	 *   }
	 * })
	 * ```
	 */
	const START_LOCATION_NORMALIZED = {
	    path: '/',
	    name: undefined,
	    params: {},
	    query: {},
	    hash: '',
	    fullPath: '/',
	    matched: [],
	    meta: {},
	    redirectedFrom: undefined,
	};

	const NavigationFailureSymbol = Symbol('');
	/**
	 * Enumeration with all possible types for navigation failures. Can be passed to
	 * {@link isNavigationFailure} to check for specific failures.
	 */
	exports.NavigationFailureType = void 0;
	(function (NavigationFailureType) {
	    /**
	     * An aborted navigation is a navigation that failed because a navigation
	     * guard returned `false` or called `next(false)`
	     */
	    NavigationFailureType[NavigationFailureType["aborted"] = 4] = "aborted";
	    /**
	     * A cancelled navigation is a navigation that failed because a more recent
	     * navigation finished started (not necessarily finished).
	     */
	    NavigationFailureType[NavigationFailureType["cancelled"] = 8] = "cancelled";
	    /**
	     * A duplicated navigation is a navigation that failed because it was
	     * initiated while already being at the exact same location.
	     */
	    NavigationFailureType[NavigationFailureType["duplicated"] = 16] = "duplicated";
	})(exports.NavigationFailureType || (exports.NavigationFailureType = {}));
	// DEV only debug messages
	const ErrorTypeMessages = {
	    [1 /* ErrorTypes.MATCHER_NOT_FOUND */]({ location, currentLocation }) {
	        return `No match for\n ${JSON.stringify(location)}${currentLocation
	            ? '\nwhile being at\n' + JSON.stringify(currentLocation)
	            : ''}`;
	    },
	    [2 /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */]({ from, to, }) {
	        return `Redirected from "${from.fullPath}" to "${stringifyRoute(to)}" via a navigation guard.`;
	    },
	    [4 /* ErrorTypes.NAVIGATION_ABORTED */]({ from, to }) {
	        return `Navigation aborted from "${from.fullPath}" to "${to.fullPath}" via a navigation guard.`;
	    },
	    [8 /* ErrorTypes.NAVIGATION_CANCELLED */]({ from, to }) {
	        return `Navigation cancelled from "${from.fullPath}" to "${to.fullPath}" with a new navigation.`;
	    },
	    [16 /* ErrorTypes.NAVIGATION_DUPLICATED */]({ from, to }) {
	        return `Avoided redundant navigation to current location: "${from.fullPath}".`;
	    },
	};
	function createRouterError(type, params) {
	    // keep full error messages in cjs versions
	    {
	        return assign(new Error(ErrorTypeMessages[type](params)), {
	            type,
	            [NavigationFailureSymbol]: true,
	        }, params);
	    }
	}
	function isNavigationFailure(error, type) {
	    return (error instanceof Error &&
	        NavigationFailureSymbol in error &&
	        (type == null || !!(error.type & type)));
	}
	const propertiesToLog = ['params', 'query', 'hash'];
	function stringifyRoute(to) {
	    if (typeof to === 'string')
	        return to;
	    if ('path' in to)
	        return to.path;
	    const location = {};
	    for (const key of propertiesToLog) {
	        if (key in to)
	            location[key] = to[key];
	    }
	    return JSON.stringify(location, null, 2);
	}

	// default pattern for a param: non greedy everything but /
	const BASE_PARAM_PATTERN = '[^/]+?';
	const BASE_PATH_PARSER_OPTIONS = {
	    sensitive: false,
	    strict: false,
	    start: true,
	    end: true,
	};
	// Special Regex characters that must be escaped in static tokens
	const REGEX_CHARS_RE = /[.+*?^${}()[\]/\\]/g;
	/**
	 * Creates a path parser from an array of Segments (a segment is an array of Tokens)
	 *
	 * @param segments - array of segments returned by tokenizePath
	 * @param extraOptions - optional options for the regexp
	 * @returns a PathParser
	 */
	function tokensToParser(segments, extraOptions) {
	    const options = assign({}, BASE_PATH_PARSER_OPTIONS, extraOptions);
	    // the amount of scores is the same as the length of segments except for the root segment "/"
	    const score = [];
	    // the regexp as a string
	    let pattern = options.start ? '^' : '';
	    // extracted keys
	    const keys = [];
	    for (const segment of segments) {
	        // the root segment needs special treatment
	        const segmentScores = segment.length ? [] : [90 /* PathScore.Root */];
	        // allow trailing slash
	        if (options.strict && !segment.length)
	            pattern += '/';
	        for (let tokenIndex = 0; tokenIndex < segment.length; tokenIndex++) {
	            const token = segment[tokenIndex];
	            // resets the score if we are inside a sub segment /:a-other-:b
	            let subSegmentScore = 40 /* PathScore.Segment */ +
	                (options.sensitive ? 0.25 /* PathScore.BonusCaseSensitive */ : 0);
	            if (token.type === 0 /* TokenType.Static */) {
	                // prepend the slash if we are starting a new segment
	                if (!tokenIndex)
	                    pattern += '/';
	                pattern += token.value.replace(REGEX_CHARS_RE, '\\$&');
	                subSegmentScore += 40 /* PathScore.Static */;
	            }
	            else if (token.type === 1 /* TokenType.Param */) {
	                const { value, repeatable, optional, regexp } = token;
	                keys.push({
	                    name: value,
	                    repeatable,
	                    optional,
	                });
	                const re = regexp ? regexp : BASE_PARAM_PATTERN;
	                // the user provided a custom regexp /:id(\\d+)
	                if (re !== BASE_PARAM_PATTERN) {
	                    subSegmentScore += 10 /* PathScore.BonusCustomRegExp */;
	                    // make sure the regexp is valid before using it
	                    try {
	                        new RegExp(`(${re})`);
	                    }
	                    catch (err) {
	                        throw new Error(`Invalid custom RegExp for param "${value}" (${re}): ` +
	                            err.message);
	                    }
	                }
	                // when we repeat we must take care of the repeating leading slash
	                let subPattern = repeatable ? `((?:${re})(?:/(?:${re}))*)` : `(${re})`;
	                // prepend the slash if we are starting a new segment
	                if (!tokenIndex)
	                    subPattern =
	                        // avoid an optional / if there are more segments e.g. /:p?-static
	                        // or /:p?-:p2
	                        optional && segment.length < 2
	                            ? `(?:/${subPattern})`
	                            : '/' + subPattern;
	                if (optional)
	                    subPattern += '?';
	                pattern += subPattern;
	                subSegmentScore += 20 /* PathScore.Dynamic */;
	                if (optional)
	                    subSegmentScore += -8 /* PathScore.BonusOptional */;
	                if (repeatable)
	                    subSegmentScore += -20 /* PathScore.BonusRepeatable */;
	                if (re === '.*')
	                    subSegmentScore += -50 /* PathScore.BonusWildcard */;
	            }
	            segmentScores.push(subSegmentScore);
	        }
	        // an empty array like /home/ -> [[{home}], []]
	        // if (!segment.length) pattern += '/'
	        score.push(segmentScores);
	    }
	    // only apply the strict bonus to the last score
	    if (options.strict && options.end) {
	        const i = score.length - 1;
	        score[i][score[i].length - 1] += 0.7000000000000001 /* PathScore.BonusStrict */;
	    }
	    // TODO: dev only warn double trailing slash
	    if (!options.strict)
	        pattern += '/?';
	    if (options.end)
	        pattern += '$';
	    // allow paths like /dynamic to only match dynamic or dynamic/... but not dynamic_something_else
	    else if (options.strict)
	        pattern += '(?:/|$)';
	    const re = new RegExp(pattern, options.sensitive ? '' : 'i');
	    function parse(path) {
	        const match = path.match(re);
	        const params = {};
	        if (!match)
	            return null;
	        for (let i = 1; i < match.length; i++) {
	            const value = match[i] || '';
	            const key = keys[i - 1];
	            params[key.name] = value && key.repeatable ? value.split('/') : value;
	        }
	        return params;
	    }
	    function stringify(params) {
	        let path = '';
	        // for optional parameters to allow to be empty
	        let avoidDuplicatedSlash = false;
	        for (const segment of segments) {
	            if (!avoidDuplicatedSlash || !path.endsWith('/'))
	                path += '/';
	            avoidDuplicatedSlash = false;
	            for (const token of segment) {
	                if (token.type === 0 /* TokenType.Static */) {
	                    path += token.value;
	                }
	                else if (token.type === 1 /* TokenType.Param */) {
	                    const { value, repeatable, optional } = token;
	                    const param = value in params ? params[value] : '';
	                    if (isArray(param) && !repeatable) {
	                        throw new Error(`Provided param "${value}" is an array but it is not repeatable (* or + modifiers)`);
	                    }
	                    const text = isArray(param)
	                        ? param.join('/')
	                        : param;
	                    if (!text) {
	                        if (optional) {
	                            // if we have more than one optional param like /:a?-static we don't need to care about the optional param
	                            if (segment.length < 2) {
	                                // remove the last slash as we could be at the end
	                                if (path.endsWith('/'))
	                                    path = path.slice(0, -1);
	                                // do not append a slash on the next iteration
	                                else
	                                    avoidDuplicatedSlash = true;
	                            }
	                        }
	                        else
	                            throw new Error(`Missing required param "${value}"`);
	                    }
	                    path += text;
	                }
	            }
	        }
	        // avoid empty path when we have multiple optional params
	        return path || '/';
	    }
	    return {
	        re,
	        score,
	        keys,
	        parse,
	        stringify,
	    };
	}
	/**
	 * Compares an array of numbers as used in PathParser.score and returns a
	 * number. This function can be used to `sort` an array
	 *
	 * @param a - first array of numbers
	 * @param b - second array of numbers
	 * @returns 0 if both are equal, < 0 if a should be sorted first, > 0 if b
	 * should be sorted first
	 */
	function compareScoreArray(a, b) {
	    let i = 0;
	    while (i < a.length && i < b.length) {
	        const diff = b[i] - a[i];
	        // only keep going if diff === 0
	        if (diff)
	            return diff;
	        i++;
	    }
	    // if the last subsegment was Static, the shorter segments should be sorted first
	    // otherwise sort the longest segment first
	    if (a.length < b.length) {
	        return a.length === 1 && a[0] === 40 /* PathScore.Static */ + 40 /* PathScore.Segment */
	            ? -1
	            : 1;
	    }
	    else if (a.length > b.length) {
	        return b.length === 1 && b[0] === 40 /* PathScore.Static */ + 40 /* PathScore.Segment */
	            ? 1
	            : -1;
	    }
	    return 0;
	}
	/**
	 * Compare function that can be used with `sort` to sort an array of PathParser
	 *
	 * @param a - first PathParser
	 * @param b - second PathParser
	 * @returns 0 if both are equal, < 0 if a should be sorted first, > 0 if b
	 */
	function comparePathParserScore(a, b) {
	    let i = 0;
	    const aScore = a.score;
	    const bScore = b.score;
	    while (i < aScore.length && i < bScore.length) {
	        const comp = compareScoreArray(aScore[i], bScore[i]);
	        // do not return if both are equal
	        if (comp)
	            return comp;
	        i++;
	    }
	    if (Math.abs(bScore.length - aScore.length) === 1) {
	        if (isLastScoreNegative(aScore))
	            return 1;
	        if (isLastScoreNegative(bScore))
	            return -1;
	    }
	    // if a and b share the same score entries but b has more, sort b first
	    return bScore.length - aScore.length;
	    // this is the ternary version
	    // return aScore.length < bScore.length
	    //   ? 1
	    //   : aScore.length > bScore.length
	    //   ? -1
	    //   : 0
	}
	/**
	 * This allows detecting splats at the end of a path: /home/:id(.*)*
	 *
	 * @param score - score to check
	 * @returns true if the last entry is negative
	 */
	function isLastScoreNegative(score) {
	    const last = score[score.length - 1];
	    return score.length > 0 && last[last.length - 1] < 0;
	}

	const ROOT_TOKEN = {
	    type: 0 /* TokenType.Static */,
	    value: '',
	};
	const VALID_PARAM_RE = /[a-zA-Z0-9_]/;
	// After some profiling, the cache seems to be unnecessary because tokenizePath
	// (the slowest part of adding a route) is very fast
	// const tokenCache = new Map<string, Token[][]>()
	function tokenizePath(path) {
	    if (!path)
	        return [[]];
	    if (path === '/')
	        return [[ROOT_TOKEN]];
	    if (!path.startsWith('/')) {
	        throw new Error(`Invalid path "${path}"`);
	    }
	    // if (tokenCache.has(path)) return tokenCache.get(path)!
	    function crash(message) {
	        throw new Error(`ERR (${state})/"${buffer}": ${message}`);
	    }
	    let state = 0 /* TokenizerState.Static */;
	    let previousState = state;
	    const tokens = [];
	    // the segment will always be valid because we get into the initial state
	    // with the leading /
	    let segment;
	    function finalizeSegment() {
	        if (segment)
	            tokens.push(segment);
	        segment = [];
	    }
	    // index on the path
	    let i = 0;
	    // char at index
	    let char;
	    // buffer of the value read
	    let buffer = '';
	    // custom regexp for a param
	    let customRe = '';
	    function consumeBuffer() {
	        if (!buffer)
	            return;
	        if (state === 0 /* TokenizerState.Static */) {
	            segment.push({
	                type: 0 /* TokenType.Static */,
	                value: buffer,
	            });
	        }
	        else if (state === 1 /* TokenizerState.Param */ ||
	            state === 2 /* TokenizerState.ParamRegExp */ ||
	            state === 3 /* TokenizerState.ParamRegExpEnd */) {
	            if (segment.length > 1 && (char === '*' || char === '+'))
	                crash(`A repeatable param (${buffer}) must be alone in its segment. eg: '/:ids+.`);
	            segment.push({
	                type: 1 /* TokenType.Param */,
	                value: buffer,
	                regexp: customRe,
	                repeatable: char === '*' || char === '+',
	                optional: char === '*' || char === '?',
	            });
	        }
	        else {
	            crash('Invalid state to consume buffer');
	        }
	        buffer = '';
	    }
	    function addCharToBuffer() {
	        buffer += char;
	    }
	    while (i < path.length) {
	        char = path[i++];
	        if (char === '\\' && state !== 2 /* TokenizerState.ParamRegExp */) {
	            previousState = state;
	            state = 4 /* TokenizerState.EscapeNext */;
	            continue;
	        }
	        switch (state) {
	            case 0 /* TokenizerState.Static */:
	                if (char === '/') {
	                    if (buffer) {
	                        consumeBuffer();
	                    }
	                    finalizeSegment();
	                }
	                else if (char === ':') {
	                    consumeBuffer();
	                    state = 1 /* TokenizerState.Param */;
	                }
	                else {
	                    addCharToBuffer();
	                }
	                break;
	            case 4 /* TokenizerState.EscapeNext */:
	                addCharToBuffer();
	                state = previousState;
	                break;
	            case 1 /* TokenizerState.Param */:
	                if (char === '(') {
	                    state = 2 /* TokenizerState.ParamRegExp */;
	                }
	                else if (VALID_PARAM_RE.test(char)) {
	                    addCharToBuffer();
	                }
	                else {
	                    consumeBuffer();
	                    state = 0 /* TokenizerState.Static */;
	                    // go back one character if we were not modifying
	                    if (char !== '*' && char !== '?' && char !== '+')
	                        i--;
	                }
	                break;
	            case 2 /* TokenizerState.ParamRegExp */:
	                // TODO: is it worth handling nested regexp? like :p(?:prefix_([^/]+)_suffix)
	                // it already works by escaping the closing )
	                // https://paths.esm.dev/?p=AAMeJbiAwQEcDKbAoAAkP60PG2R6QAvgNaA6AFACM2ABuQBB#
	                // is this really something people need since you can also write
	                // /prefix_:p()_suffix
	                if (char === ')') {
	                    // handle the escaped )
	                    if (customRe[customRe.length - 1] == '\\')
	                        customRe = customRe.slice(0, -1) + char;
	                    else
	                        state = 3 /* TokenizerState.ParamRegExpEnd */;
	                }
	                else {
	                    customRe += char;
	                }
	                break;
	            case 3 /* TokenizerState.ParamRegExpEnd */:
	                // same as finalizing a param
	                consumeBuffer();
	                state = 0 /* TokenizerState.Static */;
	                // go back one character if we were not modifying
	                if (char !== '*' && char !== '?' && char !== '+')
	                    i--;
	                customRe = '';
	                break;
	            default:
	                crash('Unknown state');
	                break;
	        }
	    }
	    if (state === 2 /* TokenizerState.ParamRegExp */)
	        crash(`Unfinished custom RegExp for param "${buffer}"`);
	    consumeBuffer();
	    finalizeSegment();
	    // tokenCache.set(path, tokens)
	    return tokens;
	}

	function createRouteRecordMatcher(record, parent, options) {
	    const parser = tokensToParser(tokenizePath(record.path), options);
	    const matcher = assign(parser, {
	        record,
	        parent,
	        // these needs to be populated by the parent
	        children: [],
	        alias: [],
	    });
	    if (parent) {
	        // both are aliases or both are not aliases
	        // we don't want to mix them because the order is used when
	        // passing originalRecord in Matcher.addRoute
	        if (!matcher.record.aliasOf === !parent.record.aliasOf)
	            parent.children.push(matcher);
	    }
	    return matcher;
	}

	/**
	 * Creates a Router Matcher.
	 *
	 * @internal
	 * @param routes - array of initial routes
	 * @param globalOptions - global route options
	 */
	function createRouterMatcher(routes, globalOptions) {
	    // normalized ordered array of matchers
	    const matchers = [];
	    const matcherMap = new Map();
	    globalOptions = mergeOptions({ strict: false, end: true, sensitive: false }, globalOptions);
	    function getRecordMatcher(name) {
	        return matcherMap.get(name);
	    }
	    function addRoute(record, parent, originalRecord) {
	        // used later on to remove by name
	        const isRootAdd = !originalRecord;
	        const mainNormalizedRecord = normalizeRouteRecord(record);
	        // we might be the child of an alias
	        mainNormalizedRecord.aliasOf = originalRecord && originalRecord.record;
	        const options = mergeOptions(globalOptions, record);
	        // generate an array of records to correctly handle aliases
	        const normalizedRecords = [
	            mainNormalizedRecord,
	        ];
	        if ('alias' in record) {
	            const aliases = typeof record.alias === 'string' ? [record.alias] : record.alias;
	            for (const alias of aliases) {
	                normalizedRecords.push(assign({}, mainNormalizedRecord, {
	                    // this allows us to hold a copy of the `components` option
	                    // so that async components cache is hold on the original record
	                    components: originalRecord
	                        ? originalRecord.record.components
	                        : mainNormalizedRecord.components,
	                    path: alias,
	                    // we might be the child of an alias
	                    aliasOf: originalRecord
	                        ? originalRecord.record
	                        : mainNormalizedRecord,
	                    // the aliases are always of the same kind as the original since they
	                    // are defined on the same record
	                }));
	            }
	        }
	        let matcher;
	        let originalMatcher;
	        for (const normalizedRecord of normalizedRecords) {
	            const { path } = normalizedRecord;
	            // Build up the path for nested routes if the child isn't an absolute
	            // route. Only add the / delimiter if the child path isn't empty and if the
	            // parent path doesn't have a trailing slash
	            if (parent && path[0] !== '/') {
	                const parentPath = parent.record.path;
	                const connectingSlash = parentPath[parentPath.length - 1] === '/' ? '' : '/';
	                normalizedRecord.path =
	                    parent.record.path + (path && connectingSlash + path);
	            }
	            // create the object before hand so it can be passed to children
	            matcher = createRouteRecordMatcher(normalizedRecord, parent, options);
	            // if we are an alias we must tell the original record that we exist
	            // so we can be removed
	            if (originalRecord) {
	                originalRecord.alias.push(matcher);
	            }
	            else {
	                // otherwise, the first record is the original and others are aliases
	                originalMatcher = originalMatcher || matcher;
	                if (originalMatcher !== matcher)
	                    originalMatcher.alias.push(matcher);
	                // remove the route if named and only for the top record (avoid in nested calls)
	                // this works because the original record is the first one
	                if (isRootAdd && record.name && !isAliasRecord(matcher))
	                    removeRoute(record.name);
	            }
	            if (mainNormalizedRecord.children) {
	                const children = mainNormalizedRecord.children;
	                for (let i = 0; i < children.length; i++) {
	                    addRoute(children[i], matcher, originalRecord && originalRecord.children[i]);
	                }
	            }
	            // if there was no original record, then the first one was not an alias and all
	            // other alias (if any) need to reference this record when adding children
	            originalRecord = originalRecord || matcher;
	            // TODO: add normalized records for more flexibility
	            // if (parent && isAliasRecord(originalRecord)) {
	            //   parent.children.push(originalRecord)
	            // }
	            insertMatcher(matcher);
	        }
	        return originalMatcher
	            ? () => {
	                // since other matchers are aliases, they should be removed by the original matcher
	                removeRoute(originalMatcher);
	            }
	            : noop;
	    }
	    function removeRoute(matcherRef) {
	        if (isRouteName(matcherRef)) {
	            const matcher = matcherMap.get(matcherRef);
	            if (matcher) {
	                matcherMap.delete(matcherRef);
	                matchers.splice(matchers.indexOf(matcher), 1);
	                matcher.children.forEach(removeRoute);
	                matcher.alias.forEach(removeRoute);
	            }
	        }
	        else {
	            const index = matchers.indexOf(matcherRef);
	            if (index > -1) {
	                matchers.splice(index, 1);
	                if (matcherRef.record.name)
	                    matcherMap.delete(matcherRef.record.name);
	                matcherRef.children.forEach(removeRoute);
	                matcherRef.alias.forEach(removeRoute);
	            }
	        }
	    }
	    function getRoutes() {
	        return matchers;
	    }
	    function insertMatcher(matcher) {
	        let i = 0;
	        while (i < matchers.length &&
	            comparePathParserScore(matcher, matchers[i]) >= 0 &&
	            // Adding children with empty path should still appear before the parent
	            // https://github.com/vuejs/router/issues/1124
	            (matcher.record.path !== matchers[i].record.path ||
	                !isRecordChildOf(matcher, matchers[i])))
	            i++;
	        matchers.splice(i, 0, matcher);
	        // only add the original record to the name map
	        if (matcher.record.name && !isAliasRecord(matcher))
	            matcherMap.set(matcher.record.name, matcher);
	    }
	    function resolve(location, currentLocation) {
	        let matcher;
	        let params = {};
	        let path;
	        let name;
	        if ('name' in location && location.name) {
	            matcher = matcherMap.get(location.name);
	            if (!matcher)
	                throw createRouterError(1 /* ErrorTypes.MATCHER_NOT_FOUND */, {
	                    location,
	                });
	            name = matcher.record.name;
	            params = assign(
	            // paramsFromLocation is a new object
	            paramsFromLocation(currentLocation.params, 
	            // only keep params that exist in the resolved location
	            // TODO: only keep optional params coming from a parent record
	            matcher.keys.filter(k => !k.optional).map(k => k.name)), location.params);
	            // throws if cannot be stringified
	            path = matcher.stringify(params);
	        }
	        else if ('path' in location) {
	            // no need to resolve the path with the matcher as it was provided
	            // this also allows the user to control the encoding
	            path = location.path;
	            matcher = matchers.find(m => m.re.test(path));
	            // matcher should have a value after the loop
	            if (matcher) {
	                // TODO: dev warning of unused params if provided
	                // we know the matcher works because we tested the regexp
	                params = matcher.parse(path);
	                name = matcher.record.name;
	            }
	            // location is a relative path
	        }
	        else {
	            // match by name or path of current route
	            matcher = currentLocation.name
	                ? matcherMap.get(currentLocation.name)
	                : matchers.find(m => m.re.test(currentLocation.path));
	            if (!matcher)
	                throw createRouterError(1 /* ErrorTypes.MATCHER_NOT_FOUND */, {
	                    location,
	                    currentLocation,
	                });
	            name = matcher.record.name;
	            // since we are navigating to the same location, we don't need to pick the
	            // params like when `name` is provided
	            params = assign({}, currentLocation.params, location.params);
	            path = matcher.stringify(params);
	        }
	        const matched = [];
	        let parentMatcher = matcher;
	        while (parentMatcher) {
	            // reversed order so parents are at the beginning
	            matched.unshift(parentMatcher.record);
	            parentMatcher = parentMatcher.parent;
	        }
	        return {
	            name,
	            path,
	            params,
	            matched,
	            meta: mergeMetaFields(matched),
	        };
	    }
	    // add initial routes
	    routes.forEach(route => addRoute(route));
	    return { addRoute, resolve, removeRoute, getRoutes, getRecordMatcher };
	}
	function paramsFromLocation(params, keys) {
	    const newParams = {};
	    for (const key of keys) {
	        if (key in params)
	            newParams[key] = params[key];
	    }
	    return newParams;
	}
	/**
	 * Normalizes a RouteRecordRaw. Creates a copy
	 *
	 * @param record
	 * @returns the normalized version
	 */
	function normalizeRouteRecord(record) {
	    return {
	        path: record.path,
	        redirect: record.redirect,
	        name: record.name,
	        meta: record.meta || {},
	        aliasOf: undefined,
	        beforeEnter: record.beforeEnter,
	        props: normalizeRecordProps(record),
	        children: record.children || [],
	        instances: {},
	        leaveGuards: new Set(),
	        updateGuards: new Set(),
	        enterCallbacks: {},
	        components: 'components' in record
	            ? record.components || null
	            : record.component && { default: record.component },
	    };
	}
	/**
	 * Normalize the optional `props` in a record to always be an object similar to
	 * components. Also accept a boolean for components.
	 * @param record
	 */
	function normalizeRecordProps(record) {
	    const propsObject = {};
	    // props does not exist on redirect records but we can set false directly
	    const props = record.props || false;
	    if ('component' in record) {
	        propsObject.default = props;
	    }
	    else {
	        // NOTE: we could also allow a function to be applied to every component.
	        // Would need user feedback for use cases
	        for (const name in record.components)
	            propsObject[name] = typeof props === 'boolean' ? props : props[name];
	    }
	    return propsObject;
	}
	/**
	 * Checks if a record or any of its parent is an alias
	 * @param record
	 */
	function isAliasRecord(record) {
	    while (record) {
	        if (record.record.aliasOf)
	            return true;
	        record = record.parent;
	    }
	    return false;
	}
	/**
	 * Merge meta fields of an array of records
	 *
	 * @param matched - array of matched records
	 */
	function mergeMetaFields(matched) {
	    return matched.reduce((meta, record) => assign(meta, record.meta), {});
	}
	function mergeOptions(defaults, partialOptions) {
	    const options = {};
	    for (const key in defaults) {
	        options[key] = key in partialOptions ? partialOptions[key] : defaults[key];
	    }
	    return options;
	}
	function isRecordChildOf(record, parent) {
	    return parent.children.some(child => child === record || isRecordChildOf(record, child));
	}

	/**
	 * Encoding Rules ␣ = Space Path: ␣ " < > # ? { } Query: ␣ " < > # & = Hash: ␣ "
	 * < > `
	 *
	 * On top of that, the RFC3986 (https://tools.ietf.org/html/rfc3986#section-2.2)
	 * defines some extra characters to be encoded. Most browsers do not encode them
	 * in encodeURI https://github.com/whatwg/url/issues/369, so it may be safer to
	 * also encode `!'()*`. Leaving unencoded only ASCII alphanumeric(`a-zA-Z0-9`)
	 * plus `-._~`. This extra safety should be applied to query by patching the
	 * string returned by encodeURIComponent encodeURI also encodes `[\]^`. `\`
	 * should be encoded to avoid ambiguity. Browsers (IE, FF, C) transform a `\`
	 * into a `/` if directly typed in. The _backtick_ (`````) should also be
	 * encoded everywhere because some browsers like FF encode it when directly
	 * written while others don't. Safari and IE don't encode ``"<>{}``` in hash.
	 */
	// const EXTRA_RESERVED_RE = /[!'()*]/g
	// const encodeReservedReplacer = (c: string) => '%' + c.charCodeAt(0).toString(16)
	const HASH_RE = /#/g; // %23
	const AMPERSAND_RE = /&/g; // %26
	const SLASH_RE = /\//g; // %2F
	const EQUAL_RE = /=/g; // %3D
	const IM_RE = /\?/g; // %3F
	const PLUS_RE = /\+/g; // %2B
	/**
	 * NOTE: It's not clear to me if we should encode the + symbol in queries, it
	 * seems to be less flexible than not doing so and I can't find out the legacy
	 * systems requiring this for regular requests like text/html. In the standard,
	 * the encoding of the plus character is only mentioned for
	 * application/x-www-form-urlencoded
	 * (https://url.spec.whatwg.org/#urlencoded-parsing) and most browsers seems lo
	 * leave the plus character as is in queries. To be more flexible, we allow the
	 * plus character on the query but it can also be manually encoded by the user.
	 *
	 * Resources:
	 * - https://url.spec.whatwg.org/#urlencoded-parsing
	 * - https://stackoverflow.com/questions/1634271/url-encoding-the-space-character-or-20
	 */
	const ENC_BRACKET_OPEN_RE = /%5B/g; // [
	const ENC_BRACKET_CLOSE_RE = /%5D/g; // ]
	const ENC_CARET_RE = /%5E/g; // ^
	const ENC_BACKTICK_RE = /%60/g; // `
	const ENC_CURLY_OPEN_RE = /%7B/g; // {
	const ENC_PIPE_RE = /%7C/g; // |
	const ENC_CURLY_CLOSE_RE = /%7D/g; // }
	const ENC_SPACE_RE = /%20/g; // }
	/**
	 * Encode characters that need to be encoded on the path, search and hash
	 * sections of the URL.
	 *
	 * @internal
	 * @param text - string to encode
	 * @returns encoded string
	 */
	function commonEncode(text) {
	    return encodeURI('' + text)
	        .replace(ENC_PIPE_RE, '|')
	        .replace(ENC_BRACKET_OPEN_RE, '[')
	        .replace(ENC_BRACKET_CLOSE_RE, ']');
	}
	/**
	 * Encode characters that need to be encoded on the hash section of the URL.
	 *
	 * @param text - string to encode
	 * @returns encoded string
	 */
	function encodeHash(text) {
	    return commonEncode(text)
	        .replace(ENC_CURLY_OPEN_RE, '{')
	        .replace(ENC_CURLY_CLOSE_RE, '}')
	        .replace(ENC_CARET_RE, '^');
	}
	/**
	 * Encode characters that need to be encoded query values on the query
	 * section of the URL.
	 *
	 * @param text - string to encode
	 * @returns encoded string
	 */
	function encodeQueryValue(text) {
	    return (commonEncode(text)
	        // Encode the space as +, encode the + to differentiate it from the space
	        .replace(PLUS_RE, '%2B')
	        .replace(ENC_SPACE_RE, '+')
	        .replace(HASH_RE, '%23')
	        .replace(AMPERSAND_RE, '%26')
	        .replace(ENC_BACKTICK_RE, '`')
	        .replace(ENC_CURLY_OPEN_RE, '{')
	        .replace(ENC_CURLY_CLOSE_RE, '}')
	        .replace(ENC_CARET_RE, '^'));
	}
	/**
	 * Like `encodeQueryValue` but also encodes the `=` character.
	 *
	 * @param text - string to encode
	 */
	function encodeQueryKey(text) {
	    return encodeQueryValue(text).replace(EQUAL_RE, '%3D');
	}
	/**
	 * Encode characters that need to be encoded on the path section of the URL.
	 *
	 * @param text - string to encode
	 * @returns encoded string
	 */
	function encodePath(text) {
	    return commonEncode(text).replace(HASH_RE, '%23').replace(IM_RE, '%3F');
	}
	/**
	 * Encode characters that need to be encoded on the path section of the URL as a
	 * param. This function encodes everything {@link encodePath} does plus the
	 * slash (`/`) character. If `text` is `null` or `undefined`, returns an empty
	 * string instead.
	 *
	 * @param text - string to encode
	 * @returns encoded string
	 */
	function encodeParam(text) {
	    return text == null ? '' : encodePath(text).replace(SLASH_RE, '%2F');
	}
	/**
	 * Decode text using `decodeURIComponent`. Returns the original text if it
	 * fails.
	 *
	 * @param text - string to decode
	 * @returns decoded string
	 */
	function decode(text) {
	    try {
	        return decodeURIComponent('' + text);
	    }
	    catch (err) {
	    }
	    return '' + text;
	}

	/**
	 * Transforms a queryString into a {@link LocationQuery} object. Accept both, a
	 * version with the leading `?` and without Should work as URLSearchParams

	 * @internal
	 *
	 * @param search - search string to parse
	 * @returns a query object
	 */
	function parseQuery(search) {
	    const query = {};
	    // avoid creating an object with an empty key and empty value
	    // because of split('&')
	    if (search === '' || search === '?')
	        return query;
	    const hasLeadingIM = search[0] === '?';
	    const searchParams = (hasLeadingIM ? search.slice(1) : search).split('&');
	    for (let i = 0; i < searchParams.length; ++i) {
	        // pre decode the + into space
	        const searchParam = searchParams[i].replace(PLUS_RE, ' ');
	        // allow the = character
	        const eqPos = searchParam.indexOf('=');
	        const key = decode(eqPos < 0 ? searchParam : searchParam.slice(0, eqPos));
	        const value = eqPos < 0 ? null : decode(searchParam.slice(eqPos + 1));
	        if (key in query) {
	            // an extra variable for ts types
	            let currentValue = query[key];
	            if (!isArray(currentValue)) {
	                currentValue = query[key] = [currentValue];
	            }
	            currentValue.push(value);
	        }
	        else {
	            query[key] = value;
	        }
	    }
	    return query;
	}
	/**
	 * Stringifies a {@link LocationQueryRaw} object. Like `URLSearchParams`, it
	 * doesn't prepend a `?`
	 *
	 * @internal
	 *
	 * @param query - query object to stringify
	 * @returns string version of the query without the leading `?`
	 */
	function stringifyQuery(query) {
	    let search = '';
	    for (let key in query) {
	        const value = query[key];
	        key = encodeQueryKey(key);
	        if (value == null) {
	            // only null adds the value
	            if (value !== undefined) {
	                search += (search.length ? '&' : '') + key;
	            }
	            continue;
	        }
	        // keep null values
	        const values = isArray(value)
	            ? value.map(v => v && encodeQueryValue(v))
	            : [value && encodeQueryValue(value)];
	        values.forEach(value => {
	            // skip undefined values in arrays as if they were not present
	            // smaller code than using filter
	            if (value !== undefined) {
	                // only append & with non-empty search
	                search += (search.length ? '&' : '') + key;
	                if (value != null)
	                    search += '=' + value;
	            }
	        });
	    }
	    return search;
	}
	/**
	 * Transforms a {@link LocationQueryRaw} into a {@link LocationQuery} by casting
	 * numbers into strings, removing keys with an undefined value and replacing
	 * undefined with null in arrays
	 *
	 * @param query - query object to normalize
	 * @returns a normalized query object
	 */
	function normalizeQuery(query) {
	    const normalizedQuery = {};
	    for (const key in query) {
	        const value = query[key];
	        if (value !== undefined) {
	            normalizedQuery[key] = isArray(value)
	                ? value.map(v => (v == null ? null : '' + v))
	                : value == null
	                    ? value
	                    : '' + value;
	        }
	    }
	    return normalizedQuery;
	}

	/**
	 * RouteRecord being rendered by the closest ancestor Router View. Used for
	 * `onBeforeRouteUpdate` and `onBeforeRouteLeave`. rvlm stands for Router View
	 * Location Matched
	 *
	 * @internal
	 */
	const matchedRouteKey = Symbol('');
	/**
	 * Allows overriding the router view depth to control which component in
	 * `matched` is rendered. rvd stands for Router View Depth
	 *
	 * @internal
	 */
	const viewDepthKey = Symbol('');
	/**
	 * Allows overriding the router instance returned by `useRouter` in tests. r
	 * stands for router
	 *
	 * @internal
	 */
	const routerKey = Symbol('');
	/**
	 * Allows overriding the current route returned by `useRoute` in tests. rl
	 * stands for route location
	 *
	 * @internal
	 */
	const routeLocationKey = Symbol('');
	/**
	 * Allows overriding the current route used by router-view. Internally this is
	 * used when the `route` prop is passed.
	 *
	 * @internal
	 */
	const routerViewLocationKey = Symbol('');

	/**
	 * Create a list of callbacks that can be reset. Used to create before and after navigation guards list
	 */
	function useCallbacks() {
	    let handlers = [];
	    function add(handler) {
	        handlers.push(handler);
	        return () => {
	            const i = handlers.indexOf(handler);
	            if (i > -1)
	                handlers.splice(i, 1);
	        };
	    }
	    function reset() {
	        handlers = [];
	    }
	    return {
	        add,
	        list: () => handlers,
	        reset,
	    };
	}

	function registerGuard(record, name, guard) {
	    const removeFromList = () => {
	        record[name].delete(guard);
	    };
	    vue.onUnmounted(removeFromList);
	    vue.onDeactivated(removeFromList);
	    vue.onActivated(() => {
	        record[name].add(guard);
	    });
	    record[name].add(guard);
	}
	/**
	 * Add a navigation guard that triggers whenever the component for the current
	 * location is about to be left. Similar to {@link beforeRouteLeave} but can be
	 * used in any component. The guard is removed when the component is unmounted.
	 *
	 * @param leaveGuard - {@link NavigationGuard}
	 */
	function onBeforeRouteLeave(leaveGuard) {
	    const activeRecord = vue.inject(matchedRouteKey, 
	    // to avoid warning
	    {}).value;
	    if (!activeRecord) {
	        return;
	    }
	    registerGuard(activeRecord, 'leaveGuards', leaveGuard);
	}
	/**
	 * Add a navigation guard that triggers whenever the current location is about
	 * to be updated. Similar to {@link beforeRouteUpdate} but can be used in any
	 * component. The guard is removed when the component is unmounted.
	 *
	 * @param updateGuard - {@link NavigationGuard}
	 */
	function onBeforeRouteUpdate(updateGuard) {
	    const activeRecord = vue.inject(matchedRouteKey, 
	    // to avoid warning
	    {}).value;
	    if (!activeRecord) {
	        return;
	    }
	    registerGuard(activeRecord, 'updateGuards', updateGuard);
	}
	function guardToPromiseFn(guard, to, from, record, name) {
	    // keep a reference to the enterCallbackArray to prevent pushing callbacks if a new navigation took place
	    const enterCallbackArray = record &&
	        // name is defined if record is because of the function overload
	        (record.enterCallbacks[name] = record.enterCallbacks[name] || []);
	    return () => new Promise((resolve, reject) => {
	        const next = (valid) => {
	            if (valid === false) {
	                reject(createRouterError(4 /* ErrorTypes.NAVIGATION_ABORTED */, {
	                    from,
	                    to,
	                }));
	            }
	            else if (valid instanceof Error) {
	                reject(valid);
	            }
	            else if (isRouteLocation(valid)) {
	                reject(createRouterError(2 /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */, {
	                    from: to,
	                    to: valid,
	                }));
	            }
	            else {
	                if (enterCallbackArray &&
	                    // since enterCallbackArray is truthy, both record and name also are
	                    record.enterCallbacks[name] === enterCallbackArray &&
	                    typeof valid === 'function') {
	                    enterCallbackArray.push(valid);
	                }
	                resolve();
	            }
	        };
	        // wrapping with Promise.resolve allows it to work with both async and sync guards
	        const guardReturn = guard.call(record && record.instances[name], to, from, next);
	        let guardCall = Promise.resolve(guardReturn);
	        if (guard.length < 3)
	            guardCall = guardCall.then(next);
	        guardCall.catch(err => reject(err));
	    });
	}
	function extractComponentsGuards(matched, guardType, to, from) {
	    const guards = [];
	    for (const record of matched) {
	        for (const name in record.components) {
	            let rawComponent = record.components[name];
	            // skip update and leave guards if the route component is not mounted
	            if (guardType !== 'beforeRouteEnter' && !record.instances[name])
	                continue;
	            if (isRouteComponent(rawComponent)) {
	                // __vccOpts is added by vue-class-component and contain the regular options
	                const options = rawComponent.__vccOpts || rawComponent;
	                const guard = options[guardType];
	                guard && guards.push(guardToPromiseFn(guard, to, from, record, name));
	            }
	            else {
	                // start requesting the chunk already
	                let componentPromise = rawComponent();
	                guards.push(() => componentPromise.then(resolved => {
	                    if (!resolved)
	                        return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}"`));
	                    const resolvedComponent = isESModule(resolved)
	                        ? resolved.default
	                        : resolved;
	                    // replace the function with the resolved component
	                    // cannot be null or undefined because we went into the for loop
	                    record.components[name] = resolvedComponent;
	                    // __vccOpts is added by vue-class-component and contain the regular options
	                    const options = resolvedComponent.__vccOpts || resolvedComponent;
	                    const guard = options[guardType];
	                    return guard && guardToPromiseFn(guard, to, from, record, name)();
	                }));
	            }
	        }
	    }
	    return guards;
	}
	/**
	 * Allows differentiating lazy components from functional components and vue-class-component
	 * @internal
	 *
	 * @param component
	 */
	function isRouteComponent(component) {
	    return (typeof component === 'object' ||
	        'displayName' in component ||
	        'props' in component ||
	        '__vccOpts' in component);
	}
	/**
	 * Ensures a route is loaded so it can be passed as o prop to `<RouterView>`.
	 *
	 * @param route - resolved route to load
	 */
	function loadRouteLocation(route) {
	    return route.matched.every(record => record.redirect)
	        ? Promise.reject(new Error('Cannot load a route that redirects.'))
	        : Promise.all(route.matched.map(record => record.components &&
	            Promise.all(Object.keys(record.components).reduce((promises, name) => {
	                const rawComponent = record.components[name];
	                if (typeof rawComponent === 'function' &&
	                    !('displayName' in rawComponent)) {
	                    promises.push(rawComponent().then(resolved => {
	                        if (!resolved)
	                            return Promise.reject(new Error(`Couldn't resolve component "${name}" at "${record.path}". Ensure you passed a function that returns a promise.`));
	                        const resolvedComponent = isESModule(resolved)
	                            ? resolved.default
	                            : resolved;
	                        // replace the function with the resolved component
	                        // cannot be null or undefined because we went into the for loop
	                        record.components[name] = resolvedComponent;
	                        return;
	                    }));
	                }
	                return promises;
	            }, [])))).then(() => route);
	}

	// TODO: we could allow currentRoute as a prop to expose `isActive` and
	// `isExactActive` behavior should go through an RFC
	function useLink(props) {
	    const router = vue.inject(routerKey);
	    const currentRoute = vue.inject(routeLocationKey);
	    const route = vue.computed(() => router.resolve(vue.unref(props.to)));
	    const activeRecordIndex = vue.computed(() => {
	        const { matched } = route.value;
	        const { length } = matched;
	        const routeMatched = matched[length - 1];
	        const currentMatched = currentRoute.matched;
	        if (!routeMatched || !currentMatched.length)
	            return -1;
	        const index = currentMatched.findIndex(isSameRouteRecord.bind(null, routeMatched));
	        if (index > -1)
	            return index;
	        // possible parent record
	        const parentRecordPath = getOriginalPath(matched[length - 2]);
	        return (
	        // we are dealing with nested routes
	        length > 1 &&
	            // if the parent and matched route have the same path, this link is
	            // referring to the empty child. Or we currently are on a different
	            // child of the same parent
	            getOriginalPath(routeMatched) === parentRecordPath &&
	            // avoid comparing the child with its parent
	            currentMatched[currentMatched.length - 1].path !== parentRecordPath
	            ? currentMatched.findIndex(isSameRouteRecord.bind(null, matched[length - 2]))
	            : index);
	    });
	    const isActive = vue.computed(() => activeRecordIndex.value > -1 &&
	        includesParams(currentRoute.params, route.value.params));
	    const isExactActive = vue.computed(() => activeRecordIndex.value > -1 &&
	        activeRecordIndex.value === currentRoute.matched.length - 1 &&
	        isSameRouteLocationParams(currentRoute.params, route.value.params));
	    function navigate(e = {}) {
	        if (guardEvent(e)) {
	            return router[vue.unref(props.replace) ? 'replace' : 'push'](vue.unref(props.to)
	            // avoid uncaught errors are they are logged anyway
	            ).catch(noop);
	        }
	        return Promise.resolve();
	    }
	    return {
	        route,
	        href: vue.computed(() => route.value.href),
	        isActive,
	        isExactActive,
	        navigate,
	    };
	}
	const RouterLinkImpl = /*#__PURE__*/ vue.defineComponent({
	    name: 'RouterLink',
	    compatConfig: { MODE: 3 },
	    props: {
	        to: {
	            type: [String, Object],
	            required: true,
	        },
	        replace: Boolean,
	        activeClass: String,
	        // inactiveClass: String,
	        exactActiveClass: String,
	        custom: Boolean,
	        ariaCurrentValue: {
	            type: String,
	            default: 'page',
	        },
	    },
	    useLink,
	    setup(props, { slots }) {
	        const link = vue.reactive(useLink(props));
	        const { options } = vue.inject(routerKey);
	        const elClass = vue.computed(() => ({
	            [getLinkClass(props.activeClass, options.linkActiveClass, 'router-link-active')]: link.isActive,
	            // [getLinkClass(
	            //   props.inactiveClass,
	            //   options.linkInactiveClass,
	            //   'router-link-inactive'
	            // )]: !link.isExactActive,
	            [getLinkClass(props.exactActiveClass, options.linkExactActiveClass, 'router-link-exact-active')]: link.isExactActive,
	        }));
	        return () => {
	            const children = slots.default && slots.default(link);
	            return props.custom
	                ? children
	                : vue.h('a', {
	                    'aria-current': link.isExactActive
	                        ? props.ariaCurrentValue
	                        : null,
	                    href: link.href,
	                    // this would override user added attrs but Vue will still add
	                    // the listener so we end up triggering both
	                    onClick: link.navigate,
	                    class: elClass.value,
	                }, children);
	        };
	    },
	});
	// export the public type for h/tsx inference
	// also to avoid inline import() in generated d.ts files
	/**
	 * Component to render a link that triggers a navigation on click.
	 */
	const RouterLink = RouterLinkImpl;
	function guardEvent(e) {
	    // don't redirect with control keys
	    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
	        return;
	    // don't redirect when preventDefault called
	    if (e.defaultPrevented)
	        return;
	    // don't redirect on right click
	    if (e.button !== undefined && e.button !== 0)
	        return;
	    // don't redirect if `target="_blank"`
	    // @ts-expect-error getAttribute does exist
	    if (e.currentTarget && e.currentTarget.getAttribute) {
	        // @ts-expect-error getAttribute exists
	        const target = e.currentTarget.getAttribute('target');
	        if (/\b_blank\b/i.test(target))
	            return;
	    }
	    // this may be a Weex event which doesn't have this method
	    if (e.preventDefault)
	        e.preventDefault();
	    return true;
	}
	function includesParams(outer, inner) {
	    for (const key in inner) {
	        const innerValue = inner[key];
	        const outerValue = outer[key];
	        if (typeof innerValue === 'string') {
	            if (innerValue !== outerValue)
	                return false;
	        }
	        else {
	            if (!isArray(outerValue) ||
	                outerValue.length !== innerValue.length ||
	                innerValue.some((value, i) => value !== outerValue[i]))
	                return false;
	        }
	    }
	    return true;
	}
	/**
	 * Get the original path value of a record by following its aliasOf
	 * @param record
	 */
	function getOriginalPath(record) {
	    return record ? (record.aliasOf ? record.aliasOf.path : record.path) : '';
	}
	/**
	 * Utility class to get the active class based on defaults.
	 * @param propClass
	 * @param globalClass
	 * @param defaultClass
	 */
	const getLinkClass = (propClass, globalClass, defaultClass) => propClass != null
	    ? propClass
	    : globalClass != null
	        ? globalClass
	        : defaultClass;

	const RouterViewImpl = /*#__PURE__*/ vue.defineComponent({
	    name: 'RouterView',
	    // #674 we manually inherit them
	    inheritAttrs: false,
	    props: {
	        name: {
	            type: String,
	            default: 'default',
	        },
	        route: Object,
	    },
	    // Better compat for @vue/compat users
	    // https://github.com/vuejs/router/issues/1315
	    compatConfig: { MODE: 3 },
	    setup(props, { attrs, slots }) {
	        const injectedRoute = vue.inject(routerViewLocationKey);
	        const routeToDisplay = vue.computed(() => props.route || injectedRoute.value);
	        const injectedDepth = vue.inject(viewDepthKey, 0);
	        // The depth changes based on empty components option, which allows passthrough routes e.g. routes with children
	        // that are used to reuse the `path` property
	        const depth = vue.computed(() => {
	            let initialDepth = vue.unref(injectedDepth);
	            const { matched } = routeToDisplay.value;
	            let matchedRoute;
	            while ((matchedRoute = matched[initialDepth]) &&
	                !matchedRoute.components) {
	                initialDepth++;
	            }
	            return initialDepth;
	        });
	        const matchedRouteRef = vue.computed(() => routeToDisplay.value.matched[depth.value]);
	        vue.provide(viewDepthKey, vue.computed(() => depth.value + 1));
	        vue.provide(matchedRouteKey, matchedRouteRef);
	        vue.provide(routerViewLocationKey, routeToDisplay);
	        const viewRef = vue.ref();
	        // watch at the same time the component instance, the route record we are
	        // rendering, and the name
	        vue.watch(() => [viewRef.value, matchedRouteRef.value, props.name], ([instance, to, name], [oldInstance, from, oldName]) => {
	            // copy reused instances
	            if (to) {
	                // this will update the instance for new instances as well as reused
	                // instances when navigating to a new route
	                to.instances[name] = instance;
	                // the component instance is reused for a different route or name so
	                // we copy any saved update or leave guards. With async setup, the
	                // mounting component will mount before the matchedRoute changes,
	                // making instance === oldInstance, so we check if guards have been
	                // added before. This works because we remove guards when
	                // unmounting/deactivating components
	                if (from && from !== to && instance && instance === oldInstance) {
	                    if (!to.leaveGuards.size) {
	                        to.leaveGuards = from.leaveGuards;
	                    }
	                    if (!to.updateGuards.size) {
	                        to.updateGuards = from.updateGuards;
	                    }
	                }
	            }
	            // trigger beforeRouteEnter next callbacks
	            if (instance &&
	                to &&
	                // if there is no instance but to and from are the same this might be
	                // the first visit
	                (!from || !isSameRouteRecord(to, from) || !oldInstance)) {
	                (to.enterCallbacks[name] || []).forEach(callback => callback(instance));
	            }
	        }, { flush: 'post' });
	        return () => {
	            const route = routeToDisplay.value;
	            // we need the value at the time we render because when we unmount, we
	            // navigated to a different location so the value is different
	            const currentName = props.name;
	            const matchedRoute = matchedRouteRef.value;
	            const ViewComponent = matchedRoute && matchedRoute.components[currentName];
	            if (!ViewComponent) {
	                return normalizeSlot(slots.default, { Component: ViewComponent, route });
	            }
	            // props from route configuration
	            const routePropsOption = matchedRoute.props[currentName];
	            const routeProps = routePropsOption
	                ? routePropsOption === true
	                    ? route.params
	                    : typeof routePropsOption === 'function'
	                        ? routePropsOption(route)
	                        : routePropsOption
	                : null;
	            const onVnodeUnmounted = vnode => {
	                // remove the instance reference to prevent leak
	                if (vnode.component.isUnmounted) {
	                    matchedRoute.instances[currentName] = null;
	                }
	            };
	            const component = vue.h(ViewComponent, assign({}, routeProps, attrs, {
	                onVnodeUnmounted,
	                ref: viewRef,
	            }));
	            return (
	            // pass the vnode to the slot as a prop.
	            // h and <component :is="..."> both accept vnodes
	            normalizeSlot(slots.default, { Component: component, route }) ||
	                component);
	        };
	    },
	});
	function normalizeSlot(slot, data) {
	    if (!slot)
	        return null;
	    const slotContent = slot(data);
	    return slotContent.length === 1 ? slotContent[0] : slotContent;
	}
	// export the public type for h/tsx inference
	// also to avoid inline import() in generated d.ts files
	/**
	 * Component to display the current route the user is at.
	 */
	const RouterView = RouterViewImpl;

	/**
	 * Creates a Router instance that can be used by a Vue app.
	 *
	 * @param options - {@link RouterOptions}
	 */
	function createRouter(options) {
	    const matcher = createRouterMatcher(options.routes, options);
	    const parseQuery$1 = options.parseQuery || parseQuery;
	    const stringifyQuery$1 = options.stringifyQuery || stringifyQuery;
	    const routerHistory = options.history;
	    const beforeGuards = useCallbacks();
	    const beforeResolveGuards = useCallbacks();
	    const afterGuards = useCallbacks();
	    const currentRoute = vue.shallowRef(START_LOCATION_NORMALIZED);
	    let pendingLocation = START_LOCATION_NORMALIZED;
	    const normalizeParams = applyToParams.bind(null, paramValue => '' + paramValue);
	    const encodeParams = applyToParams.bind(null, encodeParam);
	    const decodeParams = 
	    // @ts-expect-error: intentionally avoid the type check
	    applyToParams.bind(null, decode);
	    function addRoute(parentOrRoute, route) {
	        let parent;
	        let record;
	        if (isRouteName(parentOrRoute)) {
	            parent = matcher.getRecordMatcher(parentOrRoute);
	            record = route;
	        }
	        else {
	            record = parentOrRoute;
	        }
	        return matcher.addRoute(record, parent);
	    }
	    function removeRoute(name) {
	        const recordMatcher = matcher.getRecordMatcher(name);
	        if (recordMatcher) {
	            matcher.removeRoute(recordMatcher);
	        }
	    }
	    function getRoutes() {
	        return matcher.getRoutes().map(routeMatcher => routeMatcher.record);
	    }
	    function hasRoute(name) {
	        return !!matcher.getRecordMatcher(name);
	    }
	    function resolve(rawLocation, currentLocation) {
	        // const objectLocation = routerLocationAsObject(rawLocation)
	        // we create a copy to modify it later
	        currentLocation = assign({}, currentLocation || currentRoute.value);
	        if (typeof rawLocation === 'string') {
	            const locationNormalized = parseURL(parseQuery$1, rawLocation, currentLocation.path);
	            const matchedRoute = matcher.resolve({ path: locationNormalized.path }, currentLocation);
	            const href = routerHistory.createHref(locationNormalized.fullPath);
	            // locationNormalized is always a new object
	            return assign(locationNormalized, matchedRoute, {
	                params: decodeParams(matchedRoute.params),
	                hash: decode(locationNormalized.hash),
	                redirectedFrom: undefined,
	                href,
	            });
	        }
	        let matcherLocation;
	        // path could be relative in object as well
	        if ('path' in rawLocation) {
	            matcherLocation = assign({}, rawLocation, {
	                path: parseURL(parseQuery$1, rawLocation.path, currentLocation.path).path,
	            });
	        }
	        else {
	            // remove any nullish param
	            const targetParams = assign({}, rawLocation.params);
	            for (const key in targetParams) {
	                if (targetParams[key] == null) {
	                    delete targetParams[key];
	                }
	            }
	            // pass encoded values to the matcher so it can produce encoded path and fullPath
	            matcherLocation = assign({}, rawLocation, {
	                params: encodeParams(rawLocation.params),
	            });
	            // current location params are decoded, we need to encode them in case the
	            // matcher merges the params
	            currentLocation.params = encodeParams(currentLocation.params);
	        }
	        const matchedRoute = matcher.resolve(matcherLocation, currentLocation);
	        const hash = rawLocation.hash || '';
	        // decoding them) the matcher might have merged current location params so
	        // we need to run the decoding again
	        matchedRoute.params = normalizeParams(decodeParams(matchedRoute.params));
	        const fullPath = stringifyURL(stringifyQuery$1, assign({}, rawLocation, {
	            hash: encodeHash(hash),
	            path: matchedRoute.path,
	        }));
	        const href = routerHistory.createHref(fullPath);
	        return assign({
	            fullPath,
	            // keep the hash encoded so fullPath is effectively path + encodedQuery +
	            // hash
	            hash,
	            query: 
	            // if the user is using a custom query lib like qs, we might have
	            // nested objects, so we keep the query as is, meaning it can contain
	            // numbers at `$route.query`, but at the point, the user will have to
	            // use their own type anyway.
	            // https://github.com/vuejs/router/issues/328#issuecomment-649481567
	            stringifyQuery$1 === stringifyQuery
	                ? normalizeQuery(rawLocation.query)
	                : (rawLocation.query || {}),
	        }, matchedRoute, {
	            redirectedFrom: undefined,
	            href,
	        });
	    }
	    function locationAsObject(to) {
	        return typeof to === 'string'
	            ? parseURL(parseQuery$1, to, currentRoute.value.path)
	            : assign({}, to);
	    }
	    function checkCanceledNavigation(to, from) {
	        if (pendingLocation !== to) {
	            return createRouterError(8 /* ErrorTypes.NAVIGATION_CANCELLED */, {
	                from,
	                to,
	            });
	        }
	    }
	    function push(to) {
	        return pushWithRedirect(to);
	    }
	    function replace(to) {
	        return push(assign(locationAsObject(to), { replace: true }));
	    }
	    function handleRedirectRecord(to) {
	        const lastMatched = to.matched[to.matched.length - 1];
	        if (lastMatched && lastMatched.redirect) {
	            const { redirect } = lastMatched;
	            let newTargetLocation = typeof redirect === 'function' ? redirect(to) : redirect;
	            if (typeof newTargetLocation === 'string') {
	                newTargetLocation =
	                    newTargetLocation.includes('?') || newTargetLocation.includes('#')
	                        ? (newTargetLocation = locationAsObject(newTargetLocation))
	                        : // force empty params
	                            { path: newTargetLocation };
	                // @ts-expect-error: force empty params when a string is passed to let
	                // the router parse them again
	                newTargetLocation.params = {};
	            }
	            return assign({
	                query: to.query,
	                hash: to.hash,
	                // avoid transferring params if the redirect has a path
	                params: 'path' in newTargetLocation ? {} : to.params,
	            }, newTargetLocation);
	        }
	    }
	    function pushWithRedirect(to, redirectedFrom) {
	        const targetLocation = (pendingLocation = resolve(to));
	        const from = currentRoute.value;
	        const data = to.state;
	        const force = to.force;
	        // to could be a string where `replace` is a function
	        const replace = to.replace === true;
	        const shouldRedirect = handleRedirectRecord(targetLocation);
	        if (shouldRedirect)
	            return pushWithRedirect(assign(locationAsObject(shouldRedirect), {
	                state: data,
	                force,
	                replace,
	            }), 
	            // keep original redirectedFrom if it exists
	            redirectedFrom || targetLocation);
	        // if it was a redirect we already called `pushWithRedirect` above
	        const toLocation = targetLocation;
	        toLocation.redirectedFrom = redirectedFrom;
	        let failure;
	        if (!force && isSameRouteLocation(stringifyQuery$1, from, targetLocation)) {
	            failure = createRouterError(16 /* ErrorTypes.NAVIGATION_DUPLICATED */, { to: toLocation, from });
	            // trigger scroll to allow scrolling to the same anchor
	            handleScroll();
	        }
	        return (failure ? Promise.resolve(failure) : navigate(toLocation, from))
	            .catch((error) => isNavigationFailure(error)
	            ? // navigation redirects still mark the router as ready
	                isNavigationFailure(error, 2 /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */)
	                    ? error
	                    : markAsReady(error) // also returns the error
	            : // reject any unknown error
	                triggerError(error, toLocation, from))
	            .then((failure) => {
	            if (failure) {
	                if (isNavigationFailure(failure, 2 /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */)) {
	                    return pushWithRedirect(
	                    // keep options
	                    assign({
	                        // preserve an existing replace but allow the redirect to override it
	                        replace,
	                    }, locationAsObject(failure.to), {
	                        state: data,
	                        force,
	                    }), 
	                    // preserve the original redirectedFrom if any
	                    redirectedFrom || toLocation);
	                }
	            }
	            else {
	                // if we fail we don't finalize the navigation
	                failure = finalizeNavigation(toLocation, from, true, replace, data);
	            }
	            triggerAfterEach(toLocation, from, failure);
	            return failure;
	        });
	    }
	    /**
	     * Helper to reject and skip all navigation guards if a new navigation happened
	     * @param to
	     * @param from
	     */
	    function checkCanceledNavigationAndReject(to, from) {
	        const error = checkCanceledNavigation(to, from);
	        return error ? Promise.reject(error) : Promise.resolve();
	    }
	    // TODO: refactor the whole before guards by internally using router.beforeEach
	    function navigate(to, from) {
	        let guards;
	        const [leavingRecords, updatingRecords, enteringRecords] = extractChangingRecords(to, from);
	        // all components here have been resolved once because we are leaving
	        guards = extractComponentsGuards(leavingRecords.reverse(), 'beforeRouteLeave', to, from);
	        // leavingRecords is already reversed
	        for (const record of leavingRecords) {
	            record.leaveGuards.forEach(guard => {
	                guards.push(guardToPromiseFn(guard, to, from));
	            });
	        }
	        const canceledNavigationCheck = checkCanceledNavigationAndReject.bind(null, to, from);
	        guards.push(canceledNavigationCheck);
	        // run the queue of per route beforeRouteLeave guards
	        return (runGuardQueue(guards)
	            .then(() => {
	            // check global guards beforeEach
	            guards = [];
	            for (const guard of beforeGuards.list()) {
	                guards.push(guardToPromiseFn(guard, to, from));
	            }
	            guards.push(canceledNavigationCheck);
	            return runGuardQueue(guards);
	        })
	            .then(() => {
	            // check in components beforeRouteUpdate
	            guards = extractComponentsGuards(updatingRecords, 'beforeRouteUpdate', to, from);
	            for (const record of updatingRecords) {
	                record.updateGuards.forEach(guard => {
	                    guards.push(guardToPromiseFn(guard, to, from));
	                });
	            }
	            guards.push(canceledNavigationCheck);
	            // run the queue of per route beforeEnter guards
	            return runGuardQueue(guards);
	        })
	            .then(() => {
	            // check the route beforeEnter
	            guards = [];
	            for (const record of to.matched) {
	                // do not trigger beforeEnter on reused views
	                if (record.beforeEnter && !from.matched.includes(record)) {
	                    if (isArray(record.beforeEnter)) {
	                        for (const beforeEnter of record.beforeEnter)
	                            guards.push(guardToPromiseFn(beforeEnter, to, from));
	                    }
	                    else {
	                        guards.push(guardToPromiseFn(record.beforeEnter, to, from));
	                    }
	                }
	            }
	            guards.push(canceledNavigationCheck);
	            // run the queue of per route beforeEnter guards
	            return runGuardQueue(guards);
	        })
	            .then(() => {
	            // NOTE: at this point to.matched is normalized and does not contain any () => Promise<Component>
	            // clear existing enterCallbacks, these are added by extractComponentsGuards
	            to.matched.forEach(record => (record.enterCallbacks = {}));
	            // check in-component beforeRouteEnter
	            guards = extractComponentsGuards(enteringRecords, 'beforeRouteEnter', to, from);
	            guards.push(canceledNavigationCheck);
	            // run the queue of per route beforeEnter guards
	            return runGuardQueue(guards);
	        })
	            .then(() => {
	            // check global guards beforeResolve
	            guards = [];
	            for (const guard of beforeResolveGuards.list()) {
	                guards.push(guardToPromiseFn(guard, to, from));
	            }
	            guards.push(canceledNavigationCheck);
	            return runGuardQueue(guards);
	        })
	            // catch any navigation canceled
	            .catch(err => isNavigationFailure(err, 8 /* ErrorTypes.NAVIGATION_CANCELLED */)
	            ? err
	            : Promise.reject(err)));
	    }
	    function triggerAfterEach(to, from, failure) {
	        // navigation is confirmed, call afterGuards
	        // TODO: wrap with error handlers
	        for (const guard of afterGuards.list())
	            guard(to, from, failure);
	    }
	    /**
	     * - Cleans up any navigation guards
	     * - Changes the url if necessary
	     * - Calls the scrollBehavior
	     */
	    function finalizeNavigation(toLocation, from, isPush, replace, data) {
	        // a more recent navigation took place
	        const error = checkCanceledNavigation(toLocation, from);
	        if (error)
	            return error;
	        // only consider as push if it's not the first navigation
	        const isFirstNavigation = from === START_LOCATION_NORMALIZED;
	        const state = {} ;
	        // change URL only if the user did a push/replace and if it's not the initial navigation because
	        // it's just reflecting the url
	        if (isPush) {
	            // on the initial navigation, we want to reuse the scroll position from
	            // history state if it exists
	            if (replace || isFirstNavigation)
	                routerHistory.replace(toLocation.fullPath, assign({
	                    scroll: isFirstNavigation && state && state.scroll,
	                }, data));
	            else
	                routerHistory.push(toLocation.fullPath, data);
	        }
	        // accept current navigation
	        currentRoute.value = toLocation;
	        handleScroll();
	        markAsReady();
	    }
	    let removeHistoryListener;
	    // attach listener to history to trigger navigations
	    function setupListeners() {
	        // avoid setting up listeners twice due to an invalid first navigation
	        if (removeHistoryListener)
	            return;
	        removeHistoryListener = routerHistory.listen((to, _from, info) => {
	            if (!router.listening)
	                return;
	            // cannot be a redirect route because it was in history
	            const toLocation = resolve(to);
	            // due to dynamic routing, and to hash history with manual navigation
	            // (manually changing the url or calling history.hash = '#/somewhere'),
	            // there could be a redirect record in history
	            const shouldRedirect = handleRedirectRecord(toLocation);
	            if (shouldRedirect) {
	                pushWithRedirect(assign(shouldRedirect, { replace: true }), toLocation).catch(noop);
	                return;
	            }
	            pendingLocation = toLocation;
	            const from = currentRoute.value;
	            navigate(toLocation, from)
	                .catch((error) => {
	                if (isNavigationFailure(error, 4 /* ErrorTypes.NAVIGATION_ABORTED */ | 8 /* ErrorTypes.NAVIGATION_CANCELLED */)) {
	                    return error;
	                }
	                if (isNavigationFailure(error, 2 /* ErrorTypes.NAVIGATION_GUARD_REDIRECT */)) {
	                    // Here we could call if (info.delta) routerHistory.go(-info.delta,
	                    // false) but this is bug prone as we have no way to wait the
	                    // navigation to be finished before calling pushWithRedirect. Using
	                    // a setTimeout of 16ms seems to work but there is not guarantee for
	                    // it to work on every browser. So Instead we do not restore the
	                    // history entry and trigger a new navigation as requested by the
	                    // navigation guard.
	                    // the error is already handled by router.push we just want to avoid
	                    // logging the error
	                    pushWithRedirect(error.to, toLocation
	                    // avoid an uncaught rejection, let push call triggerError
	                    )
	                        .then(failure => {
	                        // manual change in hash history #916 ending up in the URL not
	                        // changing but it was changed by the manual url change, so we
	                        // need to manually change it ourselves
	                        if (isNavigationFailure(failure, 4 /* ErrorTypes.NAVIGATION_ABORTED */ |
	                            16 /* ErrorTypes.NAVIGATION_DUPLICATED */) &&
	                            !info.delta &&
	                            info.type === NavigationType.pop) {
	                            routerHistory.go(-1, false);
	                        }
	                    })
	                        .catch(noop);
	                    // avoid the then branch
	                    return Promise.reject();
	                }
	                // do not restore history on unknown direction
	                if (info.delta) {
	                    routerHistory.go(-info.delta, false);
	                }
	                // unrecognized error, transfer to the global handler
	                return triggerError(error, toLocation, from);
	            })
	                .then((failure) => {
	                failure =
	                    failure ||
	                        finalizeNavigation(
	                        // after navigation, all matched components are resolved
	                        toLocation, from, false);
	                // revert the navigation
	                if (failure) {
	                    if (info.delta &&
	                        // a new navigation has been triggered, so we do not want to revert, that will change the current history
	                        // entry while a different route is displayed
	                        !isNavigationFailure(failure, 8 /* ErrorTypes.NAVIGATION_CANCELLED */)) {
	                        routerHistory.go(-info.delta, false);
	                    }
	                    else if (info.type === NavigationType.pop &&
	                        isNavigationFailure(failure, 4 /* ErrorTypes.NAVIGATION_ABORTED */ | 16 /* ErrorTypes.NAVIGATION_DUPLICATED */)) {
	                        // manual change in hash history #916
	                        // it's like a push but lacks the information of the direction
	                        routerHistory.go(-1, false);
	                    }
	                }
	                triggerAfterEach(toLocation, from, failure);
	            })
	                .catch(noop);
	        });
	    }
	    // Initialization and Errors
	    let readyHandlers = useCallbacks();
	    let errorHandlers = useCallbacks();
	    let ready;
	    /**
	     * Trigger errorHandlers added via onError and throws the error as well
	     *
	     * @param error - error to throw
	     * @param to - location we were navigating to when the error happened
	     * @param from - location we were navigating from when the error happened
	     * @returns the error as a rejected promise
	     */
	    function triggerError(error, to, from) {
	        markAsReady(error);
	        const list = errorHandlers.list();
	        if (list.length) {
	            list.forEach(handler => handler(error, to, from));
	        }
	        else {
	            console.error(error);
	        }
	        return Promise.reject(error);
	    }
	    function isReady() {
	        if (ready && currentRoute.value !== START_LOCATION_NORMALIZED)
	            return Promise.resolve();
	        return new Promise((resolve, reject) => {
	            readyHandlers.add([resolve, reject]);
	        });
	    }
	    function markAsReady(err) {
	        if (!ready) {
	            // still not ready if an error happened
	            ready = !err;
	            setupListeners();
	            readyHandlers
	                .list()
	                .forEach(([resolve, reject]) => (err ? reject(err) : resolve()));
	            readyHandlers.reset();
	        }
	        return err;
	    }
	    // Scroll behavior
	    function handleScroll(to, from, isPush, isFirstNavigation) {
	        return Promise.resolve();
	    }
	    const go = (delta) => routerHistory.go(delta);
	    const installedApps = new Set();
	    const router = {
	        currentRoute,
	        listening: true,
	        addRoute,
	        removeRoute,
	        hasRoute,
	        getRoutes,
	        resolve,
	        options,
	        push,
	        replace,
	        go,
	        back: () => go(-1),
	        forward: () => go(1),
	        beforeEach: beforeGuards.add,
	        beforeResolve: beforeResolveGuards.add,
	        afterEach: afterGuards.add,
	        onError: errorHandlers.add,
	        isReady,
	        install(app) {
	            const router = this;
	            app.component('RouterLink', RouterLink);
	            app.component('RouterView', RouterView);
	            app.config.globalProperties.$router = router;
	            Object.defineProperty(app.config.globalProperties, '$route', {
	                enumerable: true,
	                get: () => vue.unref(currentRoute),
	            });
	            const reactiveRoute = {};
	            for (const key in START_LOCATION_NORMALIZED) {
	                // @ts-expect-error: the key matches
	                reactiveRoute[key] = vue.computed(() => currentRoute.value[key]);
	            }
	            app.provide(routerKey, router);
	            app.provide(routeLocationKey, vue.reactive(reactiveRoute));
	            app.provide(routerViewLocationKey, currentRoute);
	            const unmountApp = app.unmount;
	            installedApps.add(app);
	            app.unmount = function () {
	                installedApps.delete(app);
	                // the router is not attached to an app anymore
	                if (installedApps.size < 1) {
	                    // invalidate the current navigation
	                    pendingLocation = START_LOCATION_NORMALIZED;
	                    removeHistoryListener && removeHistoryListener();
	                    removeHistoryListener = null;
	                    currentRoute.value = START_LOCATION_NORMALIZED;
	                    ready = false;
	                }
	                unmountApp();
	            };
	        },
	    };
	    return router;
	}
	function runGuardQueue(guards) {
	    return guards.reduce((promise, guard) => promise.then(() => guard()), Promise.resolve());
	}
	function extractChangingRecords(to, from) {
	    const leavingRecords = [];
	    const updatingRecords = [];
	    const enteringRecords = [];
	    const len = Math.max(from.matched.length, to.matched.length);
	    for (let i = 0; i < len; i++) {
	        const recordFrom = from.matched[i];
	        if (recordFrom) {
	            if (to.matched.find(record => isSameRouteRecord(record, recordFrom)))
	                updatingRecords.push(recordFrom);
	            else
	                leavingRecords.push(recordFrom);
	        }
	        const recordTo = to.matched[i];
	        if (recordTo) {
	            // the type doesn't matter because we are comparing per reference
	            if (!from.matched.find(record => isSameRouteRecord(record, recordTo))) {
	                enteringRecords.push(recordTo);
	            }
	        }
	    }
	    return [leavingRecords, updatingRecords, enteringRecords];
	}

	/**
	 * Returns the router instance. Equivalent to using `$router` inside
	 * templates.
	 */
	function useRouter() {
	    return vue.inject(routerKey);
	}
	/**
	 * Returns the current route location. Equivalent to using `$route` inside
	 * templates.
	 */
	function useRoute() {
	    return vue.inject(routeLocationKey);
	}

	exports.RouterLink = RouterLink;
	exports.RouterView = RouterView;
	exports.START_LOCATION = START_LOCATION_NORMALIZED;
	exports.createMemoryHistory = createMemoryHistory;
	exports.createRouter = createRouter;
	exports.createRouterMatcher = createRouterMatcher;
	exports.createWebHashHistory = createWebHashHistory;
	exports.createWebHistory = createWebHistory;
	exports.isNavigationFailure = isNavigationFailure;
	exports.loadRouteLocation = loadRouteLocation;
	exports.matchedRouteKey = matchedRouteKey;
	exports.onBeforeRouteLeave = onBeforeRouteLeave;
	exports.onBeforeRouteUpdate = onBeforeRouteUpdate;
	exports.parseQuery = parseQuery;
	exports.routeLocationKey = routeLocationKey;
	exports.routerKey = routerKey;
	exports.routerViewLocationKey = routerViewLocationKey;
	exports.stringifyQuery = stringifyQuery;
	exports.useLink = useLink;
	exports.useRoute = useRoute;
	exports.useRouter = useRouter;
	exports.viewDepthKey = viewDepthKey;
} (vueRouter_prod));

const suspectProtoRx = /"(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])"\s*:/;
const suspectConstructorRx = /"(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)"\s*:/;
const JsonSigRx = /^["{[]|^-?[0-9][0-9.]{0,14}$/;
function jsonParseTransform(key, value) {
  if (key === "__proto__" || key === "constructor") {
    return;
  }
  return value;
}
function destr(val) {
  if (typeof val !== "string") {
    return val;
  }
  const _lval = val.toLowerCase();
  if (_lval === "true") {
    return true;
  }
  if (_lval === "false") {
    return false;
  }
  if (_lval === "null") {
    return null;
  }
  if (_lval === "nan") {
    return NaN;
  }
  if (_lval === "infinity") {
    return Infinity;
  }
  if (_lval === "undefined") {
    return void 0;
  }
  if (!JsonSigRx.test(val)) {
    return val;
  }
  try {
    if (suspectProtoRx.test(val) || suspectConstructorRx.test(val)) {
      return JSON.parse(val, jsonParseTransform);
    }
    return JSON.parse(val);
  } catch (_e) {
    return val;
  }
}
class FetchError extends Error {
  constructor() {
    super(...arguments);
    this.name = "FetchError";
  }
}
function createFetchError(request, error, response) {
  let message = "";
  if (request && response) {
    message = `${response.status} ${response.statusText} (${request.toString()})`;
  }
  if (error) {
    message = `${error.message} (${message})`;
  }
  const fetchError = new FetchError(message);
  Object.defineProperty(fetchError, "request", { get() {
    return request;
  } });
  Object.defineProperty(fetchError, "response", { get() {
    return response;
  } });
  Object.defineProperty(fetchError, "data", { get() {
    return response && response._data;
  } });
  return fetchError;
}
const payloadMethods = new Set(Object.freeze(["PATCH", "POST", "PUT", "DELETE"]));
function isPayloadMethod(method = "GET") {
  return payloadMethods.has(method.toUpperCase());
}
function isJSONSerializable(val) {
  if (val === void 0) {
    return false;
  }
  const t = typeof val;
  if (t === "string" || t === "number" || t === "boolean" || t === null) {
    return true;
  }
  if (t !== "object") {
    return false;
  }
  if (Array.isArray(val)) {
    return true;
  }
  return val.constructor && val.constructor.name === "Object" || typeof val.toJSON === "function";
}
const textTypes = /* @__PURE__ */ new Set([
  "image/svg",
  "application/xml",
  "application/xhtml",
  "application/html"
]);
const JSON_RE = /^application\/(?:[\w!#$%&*`\-.^~]*\+)?json(;.+)?$/i;
function detectResponseType(_contentType = "") {
  if (!_contentType) {
    return "json";
  }
  const contentType = _contentType.split(";").shift();
  if (JSON_RE.test(contentType)) {
    return "json";
  }
  if (textTypes.has(contentType) || contentType.startsWith("text/")) {
    return "text";
  }
  return "blob";
}
const retryStatusCodes = /* @__PURE__ */ new Set([
  408,
  409,
  425,
  429,
  500,
  502,
  503,
  504
]);
function createFetch(globalOptions) {
  const { fetch: fetch2, Headers: Headers2 } = globalOptions;
  function onError(ctx) {
    if (ctx.options.retry !== false) {
      const retries = typeof ctx.options.retry === "number" ? ctx.options.retry : isPayloadMethod(ctx.options.method) ? 0 : 1;
      const responseCode = ctx.response && ctx.response.status || 500;
      if (retries > 0 && retryStatusCodes.has(responseCode)) {
        return $fetchRaw(ctx.request, {
          ...ctx.options,
          retry: retries - 1
        });
      }
    }
    const err = createFetchError(ctx.request, ctx.error, ctx.response);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(err, $fetchRaw);
    }
    throw err;
  }
  const $fetchRaw = async function $fetchRaw2(_request, _opts = {}) {
    const ctx = {
      request: _request,
      options: { ...globalOptions.defaults, ..._opts },
      response: void 0,
      error: void 0
    };
    if (ctx.options.onRequest) {
      await ctx.options.onRequest(ctx);
    }
    if (typeof ctx.request === "string") {
      if (ctx.options.baseURL) {
        ctx.request = withBase(ctx.request, ctx.options.baseURL);
      }
      if (ctx.options.params) {
        ctx.request = withQuery(ctx.request, ctx.options.params);
      }
      if (ctx.options.body && isPayloadMethod(ctx.options.method)) {
        if (isJSONSerializable(ctx.options.body)) {
          ctx.options.body = typeof ctx.options.body === "string" ? ctx.options.body : JSON.stringify(ctx.options.body);
          ctx.options.headers = new Headers2(ctx.options.headers);
          if (!ctx.options.headers.has("content-type")) {
            ctx.options.headers.set("content-type", "application/json");
          }
          if (!ctx.options.headers.has("accept")) {
            ctx.options.headers.set("accept", "application/json");
          }
        }
      }
    }
    ctx.response = await fetch2(ctx.request, ctx.options).catch(async (error) => {
      ctx.error = error;
      if (ctx.options.onRequestError) {
        await ctx.options.onRequestError(ctx);
      }
      return onError(ctx);
    });
    const responseType = (ctx.options.parseResponse ? "json" : ctx.options.responseType) || detectResponseType(ctx.response.headers.get("content-type") || "");
    if (responseType === "json") {
      const data = await ctx.response.text();
      const parseFn = ctx.options.parseResponse || destr;
      ctx.response._data = parseFn(data);
    } else {
      ctx.response._data = await ctx.response[responseType]();
    }
    if (ctx.options.onResponse) {
      await ctx.options.onResponse(ctx);
    }
    if (!ctx.response.ok) {
      if (ctx.options.onResponseError) {
        await ctx.options.onResponseError(ctx);
      }
    }
    return ctx.response.ok ? ctx.response : onError(ctx);
  };
  const $fetch2 = function $fetch22(request, opts) {
    return $fetchRaw(request, opts).then((r) => r._data);
  };
  $fetch2.raw = $fetchRaw;
  $fetch2.create = (defaultOptions = {}) => createFetch({
    ...globalOptions,
    defaults: {
      ...globalOptions.defaults,
      ...defaultOptions
    }
  });
  return $fetch2;
}
const _globalThis$2 = function() {
  if (typeof globalThis !== "undefined") {
    return globalThis;
  }
  if (typeof self !== "undefined") {
    return self;
  }
  if (typeof global !== "undefined") {
    return global;
  }
  throw new Error("unable to locate global object");
}();
const fetch = _globalThis$2.fetch || (() => Promise.reject(new Error("[ohmyfetch] global.fetch is not supported!")));
const Headers = _globalThis$2.Headers;
const $fetch$1 = createFetch({ fetch, Headers });
const appConfig = useRuntimeConfig$1().app;
const baseURL = () => appConfig.baseURL;
const publicAssetsURL = (...path) => {
  const publicBase = appConfig.cdnURL || appConfig.baseURL;
  return path.length ? joinURL(publicBase, ...path) : publicBase;
};
function flatHooks(configHooks, hooks = {}, parentName) {
  for (const key in configHooks) {
    const subHook = configHooks[key];
    const name = parentName ? `${parentName}:${key}` : key;
    if (typeof subHook === "object" && subHook !== null) {
      flatHooks(subHook, hooks, name);
    } else if (typeof subHook === "function") {
      hooks[name] = subHook;
    }
  }
  return hooks;
}
function serialCaller(hooks, args) {
  return hooks.reduce((promise, hookFn) => promise.then(() => hookFn.apply(void 0, args)), Promise.resolve(null));
}
function parallelCaller(hooks, args) {
  return Promise.all(hooks.map((hook) => hook.apply(void 0, args)));
}
class Hookable {
  constructor() {
    this._hooks = {};
    this._deprecatedHooks = {};
    this.hook = this.hook.bind(this);
    this.callHook = this.callHook.bind(this);
    this.callHookWith = this.callHookWith.bind(this);
  }
  hook(name, fn) {
    if (!name || typeof fn !== "function") {
      return () => {
      };
    }
    const originalName = name;
    let deprecatedHookObj;
    while (this._deprecatedHooks[name]) {
      const deprecatedHook = this._deprecatedHooks[name];
      if (typeof deprecatedHook === "string") {
        deprecatedHookObj = { to: deprecatedHook };
      } else {
        deprecatedHookObj = deprecatedHook;
      }
      name = deprecatedHookObj.to;
    }
    if (deprecatedHookObj) {
      if (!deprecatedHookObj.message) {
        console.warn(`${originalName} hook has been deprecated` + (deprecatedHookObj.to ? `, please use ${deprecatedHookObj.to}` : ""));
      } else {
        console.warn(deprecatedHookObj.message);
      }
    }
    this._hooks[name] = this._hooks[name] || [];
    this._hooks[name].push(fn);
    return () => {
      if (fn) {
        this.removeHook(name, fn);
        fn = null;
      }
    };
  }
  hookOnce(name, fn) {
    let _unreg;
    let _fn = (...args) => {
      _unreg();
      _unreg = null;
      _fn = null;
      return fn(...args);
    };
    _unreg = this.hook(name, _fn);
    return _unreg;
  }
  removeHook(name, fn) {
    if (this._hooks[name]) {
      const idx = this._hooks[name].indexOf(fn);
      if (idx !== -1) {
        this._hooks[name].splice(idx, 1);
      }
      if (this._hooks[name].length === 0) {
        delete this._hooks[name];
      }
    }
  }
  deprecateHook(name, deprecated) {
    this._deprecatedHooks[name] = deprecated;
  }
  deprecateHooks(deprecatedHooks) {
    Object.assign(this._deprecatedHooks, deprecatedHooks);
  }
  addHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    const removeFns = Object.keys(hooks).map((key) => this.hook(key, hooks[key]));
    return () => {
      removeFns.splice(0, removeFns.length).forEach((unreg) => unreg());
    };
  }
  removeHooks(configHooks) {
    const hooks = flatHooks(configHooks);
    for (const key in hooks) {
      this.removeHook(key, hooks[key]);
    }
  }
  callHook(name, ...args) {
    return serialCaller(this._hooks[name] || [], args);
  }
  callHookParallel(name, ...args) {
    return parallelCaller(this._hooks[name] || [], args);
  }
  callHookWith(caller, name, ...args) {
    return caller(this._hooks[name] || [], args);
  }
}
function createHooks() {
  return new Hookable();
}
function createContext() {
  let currentInstance = null;
  let isSingleton = false;
  const checkConflict = (instance) => {
    if (currentInstance && currentInstance !== instance) {
      throw new Error("Context conflict");
    }
  };
  return {
    use: () => currentInstance,
    set: (instance, replace) => {
      if (!replace) {
        checkConflict(instance);
      }
      currentInstance = instance;
      isSingleton = true;
    },
    unset: () => {
      currentInstance = null;
      isSingleton = false;
    },
    call: (instance, cb) => {
      checkConflict(instance);
      currentInstance = instance;
      try {
        return cb();
      } finally {
        if (!isSingleton) {
          currentInstance = null;
        }
      }
    },
    async callAsync(instance, cb) {
      currentInstance = instance;
      const onRestore = () => {
        currentInstance = instance;
      };
      const onLeave = () => currentInstance === instance ? onRestore : void 0;
      asyncHandlers.add(onLeave);
      try {
        const r = cb();
        if (!isSingleton) {
          currentInstance = null;
        }
        return await r;
      } finally {
        asyncHandlers.delete(onLeave);
      }
    }
  };
}
function createNamespace() {
  const contexts = {};
  return {
    get(key) {
      if (!contexts[key]) {
        contexts[key] = createContext();
      }
      contexts[key];
      return contexts[key];
    }
  };
}
const _globalThis$1 = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof global !== "undefined" ? global : {};
const globalKey = "__unctx__";
const defaultNamespace = _globalThis$1[globalKey] || (_globalThis$1[globalKey] = createNamespace());
const getContext = (key) => defaultNamespace.get(key);
const asyncHandlersKey = "__unctx_async_handlers__";
const asyncHandlers = _globalThis$1[asyncHandlersKey] || (_globalThis$1[asyncHandlersKey] = /* @__PURE__ */ new Set());
const nuxtAppCtx = getContext("nuxt-app");
const NuxtPluginIndicator = "__nuxt_plugin";
function createNuxtApp(options) {
  const nuxtApp = {
    provide: void 0,
    globalName: "nuxt",
    payload: vue_cjs_prod.reactive({
      data: {},
      state: {},
      _errors: {},
      ...{ serverRendered: true }
    }),
    isHydrating: false,
    _asyncDataPromises: {},
    ...options
  };
  nuxtApp.hooks = createHooks();
  nuxtApp.hook = nuxtApp.hooks.hook;
  nuxtApp.callHook = nuxtApp.hooks.callHook;
  nuxtApp.provide = (name, value) => {
    const $name = "$" + name;
    defineGetter(nuxtApp, $name, value);
    defineGetter(nuxtApp.vueApp.config.globalProperties, $name, value);
  };
  defineGetter(nuxtApp.vueApp, "$nuxt", nuxtApp);
  defineGetter(nuxtApp.vueApp.config.globalProperties, "$nuxt", nuxtApp);
  if (nuxtApp.ssrContext) {
    nuxtApp.ssrContext.nuxt = nuxtApp;
  }
  {
    nuxtApp.ssrContext = nuxtApp.ssrContext || {};
    nuxtApp.ssrContext.payload = nuxtApp.payload;
  }
  {
    nuxtApp.payload.config = {
      public: options.ssrContext.runtimeConfig.public,
      app: options.ssrContext.runtimeConfig.app
    };
  }
  const runtimeConfig = options.ssrContext.runtimeConfig;
  const compatibilityConfig = new Proxy(runtimeConfig, {
    get(target, prop) {
      var _a;
      if (prop === "public") {
        return target.public;
      }
      return (_a = target[prop]) != null ? _a : target.public[prop];
    },
    set(target, prop, value) {
      {
        return false;
      }
    }
  });
  nuxtApp.provide("config", compatibilityConfig);
  return nuxtApp;
}
async function applyPlugin(nuxtApp, plugin) {
  if (typeof plugin !== "function") {
    return;
  }
  const { provide: provide2 } = await callWithNuxt(nuxtApp, plugin, [nuxtApp]) || {};
  if (provide2 && typeof provide2 === "object") {
    for (const key in provide2) {
      nuxtApp.provide(key, provide2[key]);
    }
  }
}
async function applyPlugins(nuxtApp, plugins2) {
  for (const plugin of plugins2) {
    await applyPlugin(nuxtApp, plugin);
  }
}
function normalizePlugins(_plugins2) {
  const plugins2 = _plugins2.map((plugin) => {
    if (typeof plugin !== "function") {
      return null;
    }
    if (plugin.length > 1) {
      return (nuxtApp) => plugin(nuxtApp, nuxtApp.provide);
    }
    return plugin;
  }).filter(Boolean);
  return plugins2;
}
function defineNuxtPlugin(plugin) {
  plugin[NuxtPluginIndicator] = true;
  return plugin;
}
function callWithNuxt(nuxt, setup, args) {
  const fn = () => args ? setup(...args) : setup();
  {
    return nuxtAppCtx.callAsync(nuxt, fn);
  }
}
function useNuxtApp() {
  const nuxtAppInstance = nuxtAppCtx.use();
  if (!nuxtAppInstance) {
    const vm = vue_cjs_prod.getCurrentInstance();
    if (!vm) {
      throw new Error("nuxt instance unavailable");
    }
    return vm.appContext.app.$nuxt;
  }
  return nuxtAppInstance;
}
function useRuntimeConfig() {
  return useNuxtApp().$config;
}
function defineGetter(obj, key, val) {
  Object.defineProperty(obj, key, { get: () => val });
}
const wrapInRef = (value) => vue_cjs_prod.isRef(value) ? value : vue_cjs_prod.ref(value);
const getDefault = () => null;
function useAsyncData(...args) {
  var _a, _b, _c, _d, _e, _f, _g;
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  let [key, handler, options = {}] = args;
  if (typeof key !== "string") {
    throw new TypeError("[nuxt] [asyncData] key must be a string.");
  }
  if (typeof handler !== "function") {
    throw new TypeError("[nuxt] [asyncData] handler must be a function.");
  }
  options.server = (_a = options.server) != null ? _a : true;
  options.default = (_b = options.default) != null ? _b : getDefault;
  if (options.defer) {
    console.warn("[useAsyncData] `defer` has been renamed to `lazy`. Support for `defer` will be removed in RC.");
  }
  options.lazy = (_d = (_c = options.lazy) != null ? _c : options.defer) != null ? _d : false;
  options.initialCache = (_e = options.initialCache) != null ? _e : true;
  const nuxt = useNuxtApp();
  const instance = vue_cjs_prod.getCurrentInstance();
  if (instance && !instance._nuxtOnBeforeMountCbs) {
    const cbs = instance._nuxtOnBeforeMountCbs = [];
    if (instance && false) {
      vue_cjs_prod.onUnmounted(() => cbs.splice(0, cbs.length));
    }
  }
  const useInitialCache = () => options.initialCache && nuxt.payload.data[key] !== void 0;
  const asyncData = {
    data: wrapInRef((_f = nuxt.payload.data[key]) != null ? _f : options.default()),
    pending: vue_cjs_prod.ref(!useInitialCache()),
    error: vue_cjs_prod.ref((_g = nuxt.payload._errors[key]) != null ? _g : null)
  };
  asyncData.refresh = (opts = {}) => {
    if (nuxt._asyncDataPromises[key]) {
      return nuxt._asyncDataPromises[key];
    }
    if (opts._initial && useInitialCache()) {
      return nuxt.payload.data[key];
    }
    asyncData.pending.value = true;
    nuxt._asyncDataPromises[key] = Promise.resolve(handler(nuxt)).then((result) => {
      if (options.transform) {
        result = options.transform(result);
      }
      if (options.pick) {
        result = pick(result, options.pick);
      }
      asyncData.data.value = result;
      asyncData.error.value = null;
    }).catch((error) => {
      asyncData.error.value = error;
      asyncData.data.value = vue_cjs_prod.unref(options.default());
    }).finally(() => {
      asyncData.pending.value = false;
      nuxt.payload.data[key] = asyncData.data.value;
      if (asyncData.error.value) {
        nuxt.payload._errors[key] = true;
      }
      delete nuxt._asyncDataPromises[key];
    });
    return nuxt._asyncDataPromises[key];
  };
  const initialFetch = () => asyncData.refresh({ _initial: true });
  const fetchOnServer = options.server !== false && nuxt.payload.serverRendered;
  if (fetchOnServer) {
    const promise = initialFetch();
    vue_cjs_prod.onServerPrefetch(() => promise);
  }
  const asyncDataPromise = Promise.resolve(nuxt._asyncDataPromises[key]).then(() => asyncData);
  Object.assign(asyncDataPromise, asyncData);
  return asyncDataPromise;
}
function pick(obj, keys) {
  const newObj = {};
  for (const key of keys) {
    newObj[key] = obj[key];
  }
  return newObj;
}
function useState(...args) {
  const autoKey = typeof args[args.length - 1] === "string" ? args.pop() : void 0;
  if (typeof args[0] !== "string") {
    args.unshift(autoKey);
  }
  const [_key, init] = args;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useState] key must be a string: " + _key);
  }
  if (init !== void 0 && typeof init !== "function") {
    throw new Error("[nuxt] [useState] init must be a function: " + init);
  }
  const key = "$s" + _key;
  const nuxt = useNuxtApp();
  const state = vue_cjs_prod.toRef(nuxt.payload.state, key);
  if (state.value === void 0 && init) {
    const initialValue = init();
    if (vue_cjs_prod.isRef(initialValue)) {
      nuxt.payload.state[key] = initialValue;
      return initialValue;
    }
    state.value = initialValue;
  }
  return state;
}
const useError = () => {
  const nuxtApp = useNuxtApp();
  return useState("error", () => nuxtApp.ssrContext.error, "$bWWAMK0bSA");
};
const throwError = (_err) => {
  const nuxtApp = useNuxtApp();
  useError();
  const err = typeof _err === "string" ? new Error(_err) : _err;
  nuxtApp.callHook("app:error", err);
  {
    nuxtApp.ssrContext.error = nuxtApp.ssrContext.error || err;
  }
  return err;
};
function useFetch(request, arg1, arg2) {
  const [opts, autoKey] = typeof arg1 === "string" ? [{}, arg1] : [arg1, arg2];
  const _key = opts.key || autoKey;
  if (!_key || typeof _key !== "string") {
    throw new TypeError("[nuxt] [useFetch] key must be a string: " + _key);
  }
  if (!request) {
    throw new Error("[nuxt] [useFetch] request is missing.");
  }
  const key = "$f" + _key;
  const _request = vue_cjs_prod.computed(() => {
    let r = request;
    if (typeof r === "function") {
      r = r();
    }
    return vue_cjs_prod.isRef(r) ? r.value : r;
  });
  const {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    watch,
    initialCache,
    ...fetchOptions
  } = opts;
  const _fetchOptions = {
    ...fetchOptions,
    cache: typeof opts.cache === "boolean" ? void 0 : opts.cache
  };
  const _asyncDataOptions = {
    server,
    lazy,
    default: defaultFn,
    transform,
    pick: pick2,
    initialCache,
    watch: [
      _request,
      ...watch || []
    ]
  };
  const asyncData = useAsyncData(key, () => {
    return $fetch(_request.value, _fetchOptions);
  }, _asyncDataOptions, "$Y1nhoWDLED");
  return asyncData;
}
const MIMES = {
  html: "text/html",
  json: "application/json"
};
const defer = typeof setImmediate !== "undefined" ? setImmediate : (fn) => fn();
function send(event, data, type) {
  if (type) {
    defaultContentType(event, type);
  }
  return new Promise((resolve) => {
    defer(() => {
      event.res.end(data);
      resolve(void 0);
    });
  });
}
function defaultContentType(event, type) {
  if (type && !event.res.getHeader("Content-Type")) {
    event.res.setHeader("Content-Type", type);
  }
}
function sendRedirect(event, location, code = 302) {
  event.res.statusCode = code;
  event.res.setHeader("Location", location);
  const html = `<!DOCTYPE html>
<html>
  <head><meta http-equiv="refresh" content="0; url=${encodeURI(location)}"></head>
  <body>Redirecting to <a href=${JSON.stringify(location)}>${encodeURI(location)}</a></body>
</html>`;
  return send(event, html, MIMES.html);
}
class H3Error extends Error {
  constructor() {
    super(...arguments);
    this.statusCode = 500;
    this.fatal = false;
    this.unhandled = false;
    this.statusMessage = "Internal Server Error";
  }
}
H3Error.__h3_error__ = true;
function createError(input) {
  var _a;
  if (typeof input === "string") {
    return new H3Error(input);
  }
  if (isError(input)) {
    return input;
  }
  const err = new H3Error((_a = input.message) != null ? _a : input.statusMessage, input.cause ? { cause: input.cause } : void 0);
  if (input.statusCode) {
    err.statusCode = input.statusCode;
  }
  if (input.statusMessage) {
    err.statusMessage = input.statusMessage;
  }
  if (input.data) {
    err.data = input.data;
  }
  if (input.fatal !== void 0) {
    err.fatal = input.fatal;
  }
  if (input.unhandled !== void 0) {
    err.unhandled = input.unhandled;
  }
  return err;
}
function isError(input) {
  var _a;
  return ((_a = input == null ? void 0 : input.constructor) == null ? void 0 : _a.__h3_error__) === true;
}
const useRouter = () => {
  var _a;
  return (_a = useNuxtApp()) == null ? void 0 : _a.$router;
};
const useRoute = () => {
  return useNuxtApp()._route;
};
const navigateTo = (to, options = {}) => {
  if (!to) {
    to = "/";
  }
  const router = useRouter();
  {
    const nuxtApp = useNuxtApp();
    if (nuxtApp.ssrContext && nuxtApp.ssrContext.event) {
      const redirectLocation = joinURL(useRuntimeConfig().app.baseURL, router.resolve(to).fullPath || "/");
      return nuxtApp.callHook("app:redirected").then(() => sendRedirect(nuxtApp.ssrContext.event, redirectLocation, options.redirectCode || 302));
    }
  }
  return options.replace ? router.replace(to) : router.push(to);
};
const firstNonUndefined = (...args) => args.find((arg) => arg !== void 0);
const DEFAULT_EXTERNAL_REL_ATTRIBUTE = "noopener noreferrer";
function defineNuxtLink(options) {
  const componentName = options.componentName || "NuxtLink";
  return vue_cjs_prod.defineComponent({
    name: componentName,
    props: {
      to: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      href: {
        type: [String, Object],
        default: void 0,
        required: false
      },
      target: {
        type: String,
        default: void 0,
        required: false
      },
      rel: {
        type: String,
        default: void 0,
        required: false
      },
      noRel: {
        type: Boolean,
        default: void 0,
        required: false
      },
      activeClass: {
        type: String,
        default: void 0,
        required: false
      },
      exactActiveClass: {
        type: String,
        default: void 0,
        required: false
      },
      replace: {
        type: Boolean,
        default: void 0,
        required: false
      },
      ariaCurrentValue: {
        type: String,
        default: void 0,
        required: false
      },
      external: {
        type: Boolean,
        default: void 0,
        required: false
      },
      custom: {
        type: Boolean,
        default: void 0,
        required: false
      }
    },
    setup(props, { slots }) {
      const router = useRouter();
      const to = vue_cjs_prod.computed(() => {
        return props.to || props.href || "";
      });
      const isExternal = vue_cjs_prod.computed(() => {
        if (props.external) {
          return true;
        }
        if (props.target && props.target !== "_self") {
          return true;
        }
        if (typeof to.value === "object") {
          return false;
        }
        return to.value === "" || hasProtocol(to.value, true);
      });
      return () => {
        var _a, _b, _c;
        if (!isExternal.value) {
          return vue_cjs_prod.h(vue_cjs_prod.resolveComponent("RouterLink"), {
            to: to.value,
            activeClass: props.activeClass || options.activeClass,
            exactActiveClass: props.exactActiveClass || options.exactActiveClass,
            replace: props.replace,
            ariaCurrentValue: props.ariaCurrentValue,
            custom: props.custom
          }, slots.default);
        }
        const href = typeof to.value === "object" ? (_b = (_a = router.resolve(to.value)) == null ? void 0 : _a.href) != null ? _b : null : to.value || null;
        const target = props.target || null;
        const rel = props.noRel ? null : firstNonUndefined(props.rel, options.externalRelAttribute, href ? DEFAULT_EXTERNAL_REL_ATTRIBUTE : "") || null;
        const navigate = () => navigateTo(href, { replace: props.replace });
        if (props.custom) {
          if (!slots.default) {
            return null;
          }
          return slots.default({
            href,
            navigate,
            route: router.resolve(href),
            rel,
            target,
            isActive: false,
            isExactActive: false
          });
        }
        return vue_cjs_prod.h("a", { href, rel, target }, (_c = slots.default) == null ? void 0 : _c.call(slots));
      };
    }
  });
}
const __nuxt_component_0 = defineNuxtLink({ componentName: "NuxtLink" });
const nuxtLink = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  defineNuxtLink,
  "default": __nuxt_component_0
}, Symbol.toStringTag, { value: "Module" }));
var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
var shared_cjs_prod = {};
Object.defineProperty(shared_cjs_prod, "__esModule", { value: true });
function makeMap(str, expectsLowerCase) {
  const map = /* @__PURE__ */ Object.create(null);
  const list = str.split(",");
  for (let i = 0; i < list.length; i++) {
    map[list[i]] = true;
  }
  return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
const PatchFlagNames = {
  [1]: `TEXT`,
  [2]: `CLASS`,
  [4]: `STYLE`,
  [8]: `PROPS`,
  [16]: `FULL_PROPS`,
  [32]: `HYDRATE_EVENTS`,
  [64]: `STABLE_FRAGMENT`,
  [128]: `KEYED_FRAGMENT`,
  [256]: `UNKEYED_FRAGMENT`,
  [512]: `NEED_PATCH`,
  [1024]: `DYNAMIC_SLOTS`,
  [2048]: `DEV_ROOT_FRAGMENT`,
  [-1]: `HOISTED`,
  [-2]: `BAIL`
};
const slotFlagsText = {
  [1]: "STABLE",
  [2]: "DYNAMIC",
  [3]: "FORWARDED"
};
const GLOBALS_WHITE_LISTED = "Infinity,undefined,NaN,isFinite,isNaN,parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,BigInt";
const isGloballyWhitelisted = /* @__PURE__ */ makeMap(GLOBALS_WHITE_LISTED);
const range = 2;
function generateCodeFrame(source, start = 0, end = source.length) {
  let lines = source.split(/(\r?\n)/);
  const newlineSequences = lines.filter((_, idx) => idx % 2 === 1);
  lines = lines.filter((_, idx) => idx % 2 === 0);
  let count = 0;
  const res = [];
  for (let i = 0; i < lines.length; i++) {
    count += lines[i].length + (newlineSequences[i] && newlineSequences[i].length || 0);
    if (count >= start) {
      for (let j = i - range; j <= i + range || end > count; j++) {
        if (j < 0 || j >= lines.length)
          continue;
        const line = j + 1;
        res.push(`${line}${" ".repeat(Math.max(3 - String(line).length, 0))}|  ${lines[j]}`);
        const lineLength = lines[j].length;
        const newLineSeqLength = newlineSequences[j] && newlineSequences[j].length || 0;
        if (j === i) {
          const pad = start - (count - (lineLength + newLineSeqLength));
          const length = Math.max(1, end > count ? lineLength - pad : end - start);
          res.push(`   |  ` + " ".repeat(pad) + "^".repeat(length));
        } else if (j > i) {
          if (end > count) {
            const length = Math.max(Math.min(end - count, lineLength), 1);
            res.push(`   |  ` + "^".repeat(length));
          }
          count += lineLength + newLineSeqLength;
        }
      }
      break;
    }
  }
  return res.join("\n");
}
const specialBooleanAttrs = `itemscope,allowfullscreen,formnovalidate,ismap,nomodule,novalidate,readonly`;
const isSpecialBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs);
const isBooleanAttr = /* @__PURE__ */ makeMap(specialBooleanAttrs + `,async,autofocus,autoplay,controls,default,defer,disabled,hidden,loop,open,required,reversed,scoped,seamless,checked,muted,multiple,selected`);
function includeBooleanAttr(value) {
  return !!value || value === "";
}
const unsafeAttrCharRE = /[>/="'\u0009\u000a\u000c\u0020]/;
const attrValidationCache = {};
function isSSRSafeAttrName(name) {
  if (attrValidationCache.hasOwnProperty(name)) {
    return attrValidationCache[name];
  }
  const isUnsafe = unsafeAttrCharRE.test(name);
  if (isUnsafe) {
    console.error(`unsafe attribute name: ${name}`);
  }
  return attrValidationCache[name] = !isUnsafe;
}
const propsToAttrMap = {
  acceptCharset: "accept-charset",
  className: "class",
  htmlFor: "for",
  httpEquiv: "http-equiv"
};
const isNoUnitNumericStyleProp = /* @__PURE__ */ makeMap(`animation-iteration-count,border-image-outset,border-image-slice,border-image-width,box-flex,box-flex-group,box-ordinal-group,column-count,columns,flex,flex-grow,flex-positive,flex-shrink,flex-negative,flex-order,grid-row,grid-row-end,grid-row-span,grid-row-start,grid-column,grid-column-end,grid-column-span,grid-column-start,font-weight,line-clamp,line-height,opacity,order,orphans,tab-size,widows,z-index,zoom,fill-opacity,flood-opacity,stop-opacity,stroke-dasharray,stroke-dashoffset,stroke-miterlimit,stroke-opacity,stroke-width`);
const isKnownHtmlAttr = /* @__PURE__ */ makeMap(`accept,accept-charset,accesskey,action,align,allow,alt,async,autocapitalize,autocomplete,autofocus,autoplay,background,bgcolor,border,buffered,capture,challenge,charset,checked,cite,class,code,codebase,color,cols,colspan,content,contenteditable,contextmenu,controls,coords,crossorigin,csp,data,datetime,decoding,default,defer,dir,dirname,disabled,download,draggable,dropzone,enctype,enterkeyhint,for,form,formaction,formenctype,formmethod,formnovalidate,formtarget,headers,height,hidden,high,href,hreflang,http-equiv,icon,id,importance,integrity,ismap,itemprop,keytype,kind,label,lang,language,loading,list,loop,low,manifest,max,maxlength,minlength,media,min,multiple,muted,name,novalidate,open,optimum,pattern,ping,placeholder,poster,preload,radiogroup,readonly,referrerpolicy,rel,required,reversed,rows,rowspan,sandbox,scope,scoped,selected,shape,size,sizes,slot,span,spellcheck,src,srcdoc,srclang,srcset,start,step,style,summary,tabindex,target,title,translate,type,usemap,value,width,wrap`);
const isKnownSvgAttr = /* @__PURE__ */ makeMap(`xmlns,accent-height,accumulate,additive,alignment-baseline,alphabetic,amplitude,arabic-form,ascent,attributeName,attributeType,azimuth,baseFrequency,baseline-shift,baseProfile,bbox,begin,bias,by,calcMode,cap-height,class,clip,clipPathUnits,clip-path,clip-rule,color,color-interpolation,color-interpolation-filters,color-profile,color-rendering,contentScriptType,contentStyleType,crossorigin,cursor,cx,cy,d,decelerate,descent,diffuseConstant,direction,display,divisor,dominant-baseline,dur,dx,dy,edgeMode,elevation,enable-background,end,exponent,fill,fill-opacity,fill-rule,filter,filterRes,filterUnits,flood-color,flood-opacity,font-family,font-size,font-size-adjust,font-stretch,font-style,font-variant,font-weight,format,from,fr,fx,fy,g1,g2,glyph-name,glyph-orientation-horizontal,glyph-orientation-vertical,glyphRef,gradientTransform,gradientUnits,hanging,height,href,hreflang,horiz-adv-x,horiz-origin-x,id,ideographic,image-rendering,in,in2,intercept,k,k1,k2,k3,k4,kernelMatrix,kernelUnitLength,kerning,keyPoints,keySplines,keyTimes,lang,lengthAdjust,letter-spacing,lighting-color,limitingConeAngle,local,marker-end,marker-mid,marker-start,markerHeight,markerUnits,markerWidth,mask,maskContentUnits,maskUnits,mathematical,max,media,method,min,mode,name,numOctaves,offset,opacity,operator,order,orient,orientation,origin,overflow,overline-position,overline-thickness,panose-1,paint-order,path,pathLength,patternContentUnits,patternTransform,patternUnits,ping,pointer-events,points,pointsAtX,pointsAtY,pointsAtZ,preserveAlpha,preserveAspectRatio,primitiveUnits,r,radius,referrerPolicy,refX,refY,rel,rendering-intent,repeatCount,repeatDur,requiredExtensions,requiredFeatures,restart,result,rotate,rx,ry,scale,seed,shape-rendering,slope,spacing,specularConstant,specularExponent,speed,spreadMethod,startOffset,stdDeviation,stemh,stemv,stitchTiles,stop-color,stop-opacity,strikethrough-position,strikethrough-thickness,string,stroke,stroke-dasharray,stroke-dashoffset,stroke-linecap,stroke-linejoin,stroke-miterlimit,stroke-opacity,stroke-width,style,surfaceScale,systemLanguage,tabindex,tableValues,target,targetX,targetY,text-anchor,text-decoration,text-rendering,textLength,to,transform,transform-origin,type,u1,u2,underline-position,underline-thickness,unicode,unicode-bidi,unicode-range,units-per-em,v-alphabetic,v-hanging,v-ideographic,v-mathematical,values,vector-effect,version,vert-adv-y,vert-origin-x,vert-origin-y,viewBox,viewTarget,visibility,width,widths,word-spacing,writing-mode,x,x-height,x1,x2,xChannelSelector,xlink:actuate,xlink:arcrole,xlink:href,xlink:role,xlink:show,xlink:title,xlink:type,xml:base,xml:lang,xml:space,y,y1,y2,yChannelSelector,z,zoomAndPan`);
function normalizeStyle(value) {
  if (isArray(value)) {
    const res = {};
    for (let i = 0; i < value.length; i++) {
      const item = value[i];
      const normalized = isString(item) ? parseStringStyle(item) : normalizeStyle(item);
      if (normalized) {
        for (const key in normalized) {
          res[key] = normalized[key];
        }
      }
    }
    return res;
  } else if (isString(value)) {
    return value;
  } else if (isObject$1(value)) {
    return value;
  }
}
const listDelimiterRE = /;(?![^(]*\))/g;
const propertyDelimiterRE = /:(.+)/;
function parseStringStyle(cssText) {
  const ret = {};
  cssText.split(listDelimiterRE).forEach((item) => {
    if (item) {
      const tmp = item.split(propertyDelimiterRE);
      tmp.length > 1 && (ret[tmp[0].trim()] = tmp[1].trim());
    }
  });
  return ret;
}
function stringifyStyle(styles) {
  let ret = "";
  if (!styles || isString(styles)) {
    return ret;
  }
  for (const key in styles) {
    const value = styles[key];
    const normalizedKey = key.startsWith(`--`) ? key : hyphenate(key);
    if (isString(value) || typeof value === "number" && isNoUnitNumericStyleProp(normalizedKey)) {
      ret += `${normalizedKey}:${value};`;
    }
  }
  return ret;
}
function normalizeClass(value) {
  let res = "";
  if (isString(value)) {
    res = value;
  } else if (isArray(value)) {
    for (let i = 0; i < value.length; i++) {
      const normalized = normalizeClass(value[i]);
      if (normalized) {
        res += normalized + " ";
      }
    }
  } else if (isObject$1(value)) {
    for (const name in value) {
      if (value[name]) {
        res += name + " ";
      }
    }
  }
  return res.trim();
}
function normalizeProps(props) {
  if (!props)
    return null;
  let { class: klass, style } = props;
  if (klass && !isString(klass)) {
    props.class = normalizeClass(klass);
  }
  if (style) {
    props.style = normalizeStyle(style);
  }
  return props;
}
const HTML_TAGS = "html,body,base,head,link,meta,style,title,address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,nav,section,div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,ruby,s,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,embed,object,param,source,canvas,script,noscript,del,ins,caption,col,colgroup,table,thead,tbody,td,th,tr,button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,output,progress,select,textarea,details,dialog,menu,summary,template,blockquote,iframe,tfoot";
const SVG_TAGS = "svg,animate,animateMotion,animateTransform,circle,clipPath,color-profile,defs,desc,discard,ellipse,feBlend,feColorMatrix,feComponentTransfer,feComposite,feConvolveMatrix,feDiffuseLighting,feDisplacementMap,feDistanceLight,feDropShadow,feFlood,feFuncA,feFuncB,feFuncG,feFuncR,feGaussianBlur,feImage,feMerge,feMergeNode,feMorphology,feOffset,fePointLight,feSpecularLighting,feSpotLight,feTile,feTurbulence,filter,foreignObject,g,hatch,hatchpath,image,line,linearGradient,marker,mask,mesh,meshgradient,meshpatch,meshrow,metadata,mpath,path,pattern,polygon,polyline,radialGradient,rect,set,solidcolor,stop,switch,symbol,text,textPath,title,tspan,unknown,use,view";
const VOID_TAGS = "area,base,br,col,embed,hr,img,input,link,meta,param,source,track,wbr";
const isHTMLTag = /* @__PURE__ */ makeMap(HTML_TAGS);
const isSVGTag = /* @__PURE__ */ makeMap(SVG_TAGS);
const isVoidTag = /* @__PURE__ */ makeMap(VOID_TAGS);
const escapeRE = /["'&<>]/;
function escapeHtml(string) {
  const str = "" + string;
  const match = escapeRE.exec(str);
  if (!match) {
    return str;
  }
  let html = "";
  let escaped;
  let index;
  let lastIndex = 0;
  for (index = match.index; index < str.length; index++) {
    switch (str.charCodeAt(index)) {
      case 34:
        escaped = "&quot;";
        break;
      case 38:
        escaped = "&amp;";
        break;
      case 39:
        escaped = "&#39;";
        break;
      case 60:
        escaped = "&lt;";
        break;
      case 62:
        escaped = "&gt;";
        break;
      default:
        continue;
    }
    if (lastIndex !== index) {
      html += str.slice(lastIndex, index);
    }
    lastIndex = index + 1;
    html += escaped;
  }
  return lastIndex !== index ? html + str.slice(lastIndex, index) : html;
}
const commentStripRE = /^-?>|<!--|-->|--!>|<!-$/g;
function escapeHtmlComment(src) {
  return src.replace(commentStripRE, "");
}
function looseCompareArrays(a, b) {
  if (a.length !== b.length)
    return false;
  let equal = true;
  for (let i = 0; equal && i < a.length; i++) {
    equal = looseEqual(a[i], b[i]);
  }
  return equal;
}
function looseEqual(a, b) {
  if (a === b)
    return true;
  let aValidType = isDate(a);
  let bValidType = isDate(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? a.getTime() === b.getTime() : false;
  }
  aValidType = isSymbol(a);
  bValidType = isSymbol(b);
  if (aValidType || bValidType) {
    return a === b;
  }
  aValidType = isArray(a);
  bValidType = isArray(b);
  if (aValidType || bValidType) {
    return aValidType && bValidType ? looseCompareArrays(a, b) : false;
  }
  aValidType = isObject$1(a);
  bValidType = isObject$1(b);
  if (aValidType || bValidType) {
    if (!aValidType || !bValidType) {
      return false;
    }
    const aKeysCount = Object.keys(a).length;
    const bKeysCount = Object.keys(b).length;
    if (aKeysCount !== bKeysCount) {
      return false;
    }
    for (const key in a) {
      const aHasKey = a.hasOwnProperty(key);
      const bHasKey = b.hasOwnProperty(key);
      if (aHasKey && !bHasKey || !aHasKey && bHasKey || !looseEqual(a[key], b[key])) {
        return false;
      }
    }
  }
  return String(a) === String(b);
}
function looseIndexOf(arr, val) {
  return arr.findIndex((item) => looseEqual(item, val));
}
const toDisplayString = (val) => {
  return isString(val) ? val : val == null ? "" : isArray(val) || isObject$1(val) && (val.toString === objectToString || !isFunction(val.toString)) ? JSON.stringify(val, replacer, 2) : String(val);
};
const replacer = (_key, val) => {
  if (val && val.__v_isRef) {
    return replacer(_key, val.value);
  } else if (isMap(val)) {
    return {
      [`Map(${val.size})`]: [...val.entries()].reduce((entries, [key, val2]) => {
        entries[`${key} =>`] = val2;
        return entries;
      }, {})
    };
  } else if (isSet(val)) {
    return {
      [`Set(${val.size})`]: [...val.values()]
    };
  } else if (isObject$1(val) && !isArray(val) && !isPlainObject(val)) {
    return String(val);
  }
  return val;
};
const EMPTY_OBJ = {};
const EMPTY_ARR = [];
const NOOP = () => {
};
const NO = () => false;
const onRE = /^on[^a-z]/;
const isOn = (key) => onRE.test(key);
const isModelListener = (key) => key.startsWith("onUpdate:");
const extend = Object.assign;
const remove = (arr, el) => {
  const i = arr.indexOf(el);
  if (i > -1) {
    arr.splice(i, 1);
  }
};
const hasOwnProperty = Object.prototype.hasOwnProperty;
const hasOwn = (val, key) => hasOwnProperty.call(val, key);
const isArray = Array.isArray;
const isMap = (val) => toTypeString(val) === "[object Map]";
const isSet = (val) => toTypeString(val) === "[object Set]";
const isDate = (val) => toTypeString(val) === "[object Date]";
const isFunction = (val) => typeof val === "function";
const isString = (val) => typeof val === "string";
const isSymbol = (val) => typeof val === "symbol";
const isObject$1 = (val) => val !== null && typeof val === "object";
const isPromise = (val) => {
  return isObject$1(val) && isFunction(val.then) && isFunction(val.catch);
};
const objectToString = Object.prototype.toString;
const toTypeString = (value) => objectToString.call(value);
const toRawType = (value) => {
  return toTypeString(value).slice(8, -1);
};
const isPlainObject = (val) => toTypeString(val) === "[object Object]";
const isIntegerKey = (key) => isString(key) && key !== "NaN" && key[0] !== "-" && "" + parseInt(key, 10) === key;
const isReservedProp = /* @__PURE__ */ makeMap(
  ",key,ref,ref_for,ref_key,onVnodeBeforeMount,onVnodeMounted,onVnodeBeforeUpdate,onVnodeUpdated,onVnodeBeforeUnmount,onVnodeUnmounted"
);
const isBuiltInDirective = /* @__PURE__ */ makeMap("bind,cloak,else-if,else,for,html,if,model,on,once,pre,show,slot,text,memo");
const cacheStringFunction = (fn) => {
  const cache = /* @__PURE__ */ Object.create(null);
  return (str) => {
    const hit = cache[str];
    return hit || (cache[str] = fn(str));
  };
};
const camelizeRE = /-(\w)/g;
const camelize = cacheStringFunction((str) => {
  return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : "");
});
const hyphenateRE = /\B([A-Z])/g;
const hyphenate = cacheStringFunction((str) => str.replace(hyphenateRE, "-$1").toLowerCase());
const capitalize = cacheStringFunction((str) => str.charAt(0).toUpperCase() + str.slice(1));
const toHandlerKey = cacheStringFunction((str) => str ? `on${capitalize(str)}` : ``);
const hasChanged = (value, oldValue) => !Object.is(value, oldValue);
const invokeArrayFns = (fns, arg) => {
  for (let i = 0; i < fns.length; i++) {
    fns[i](arg);
  }
};
const def = (obj, key, value) => {
  Object.defineProperty(obj, key, {
    configurable: true,
    enumerable: false,
    value
  });
};
const toNumber = (val) => {
  const n = parseFloat(val);
  return isNaN(n) ? val : n;
};
let _globalThis;
const getGlobalThis = () => {
  return _globalThis || (_globalThis = typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof commonjsGlobal !== "undefined" ? commonjsGlobal : {});
};
const identRE = /^[_$a-zA-Z\xA0-\uFFFF][_$a-zA-Z0-9\xA0-\uFFFF]*$/;
function genPropsAccessExp(name) {
  return identRE.test(name) ? `__props.${name}` : `__props[${JSON.stringify(name)}]`;
}
shared_cjs_prod.EMPTY_ARR = EMPTY_ARR;
shared_cjs_prod.EMPTY_OBJ = EMPTY_OBJ;
shared_cjs_prod.NO = NO;
shared_cjs_prod.NOOP = NOOP;
shared_cjs_prod.PatchFlagNames = PatchFlagNames;
shared_cjs_prod.camelize = camelize;
shared_cjs_prod.capitalize = capitalize;
shared_cjs_prod.def = def;
shared_cjs_prod.escapeHtml = escapeHtml;
shared_cjs_prod.escapeHtmlComment = escapeHtmlComment;
shared_cjs_prod.extend = extend;
shared_cjs_prod.genPropsAccessExp = genPropsAccessExp;
shared_cjs_prod.generateCodeFrame = generateCodeFrame;
shared_cjs_prod.getGlobalThis = getGlobalThis;
shared_cjs_prod.hasChanged = hasChanged;
shared_cjs_prod.hasOwn = hasOwn;
shared_cjs_prod.hyphenate = hyphenate;
shared_cjs_prod.includeBooleanAttr = includeBooleanAttr;
shared_cjs_prod.invokeArrayFns = invokeArrayFns;
shared_cjs_prod.isArray = isArray;
shared_cjs_prod.isBooleanAttr = isBooleanAttr;
shared_cjs_prod.isBuiltInDirective = isBuiltInDirective;
shared_cjs_prod.isDate = isDate;
var isFunction_1 = shared_cjs_prod.isFunction = isFunction;
shared_cjs_prod.isGloballyWhitelisted = isGloballyWhitelisted;
shared_cjs_prod.isHTMLTag = isHTMLTag;
shared_cjs_prod.isIntegerKey = isIntegerKey;
shared_cjs_prod.isKnownHtmlAttr = isKnownHtmlAttr;
shared_cjs_prod.isKnownSvgAttr = isKnownSvgAttr;
shared_cjs_prod.isMap = isMap;
shared_cjs_prod.isModelListener = isModelListener;
shared_cjs_prod.isNoUnitNumericStyleProp = isNoUnitNumericStyleProp;
shared_cjs_prod.isObject = isObject$1;
shared_cjs_prod.isOn = isOn;
shared_cjs_prod.isPlainObject = isPlainObject;
shared_cjs_prod.isPromise = isPromise;
shared_cjs_prod.isReservedProp = isReservedProp;
shared_cjs_prod.isSSRSafeAttrName = isSSRSafeAttrName;
shared_cjs_prod.isSVGTag = isSVGTag;
shared_cjs_prod.isSet = isSet;
shared_cjs_prod.isSpecialBooleanAttr = isSpecialBooleanAttr;
shared_cjs_prod.isString = isString;
shared_cjs_prod.isSymbol = isSymbol;
shared_cjs_prod.isVoidTag = isVoidTag;
shared_cjs_prod.looseEqual = looseEqual;
shared_cjs_prod.looseIndexOf = looseIndexOf;
shared_cjs_prod.makeMap = makeMap;
shared_cjs_prod.normalizeClass = normalizeClass;
shared_cjs_prod.normalizeProps = normalizeProps;
shared_cjs_prod.normalizeStyle = normalizeStyle;
shared_cjs_prod.objectToString = objectToString;
shared_cjs_prod.parseStringStyle = parseStringStyle;
shared_cjs_prod.propsToAttrMap = propsToAttrMap;
shared_cjs_prod.remove = remove;
shared_cjs_prod.slotFlagsText = slotFlagsText;
shared_cjs_prod.stringifyStyle = stringifyStyle;
shared_cjs_prod.toDisplayString = toDisplayString;
shared_cjs_prod.toHandlerKey = toHandlerKey;
shared_cjs_prod.toNumber = toNumber;
shared_cjs_prod.toRawType = toRawType;
shared_cjs_prod.toTypeString = toTypeString;
function useHead(meta2) {
  const resolvedMeta = isFunction_1(meta2) ? vue_cjs_prod.computed(meta2) : meta2;
  useNuxtApp()._useHead(resolvedMeta);
}
const preload = defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.mixin({
    beforeCreate() {
      const { _registeredComponents } = this.$nuxt.ssrContext;
      const { __moduleIdentifier } = this.$options;
      _registeredComponents.add(__moduleIdentifier);
    }
  });
});
const components = {};
const _47Users_47bonn_47Documents_47GitHub_47nuxt_45app_47_46nuxt_47components_46plugin_46mjs = defineNuxtPlugin((nuxtApp) => {
  for (const name in components) {
    nuxtApp.vueApp.component(name, components[name]);
    nuxtApp.vueApp.component("Lazy" + name, components[name]);
  }
});
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var PROVIDE_KEY = `usehead`;
var HEAD_COUNT_KEY = `head:count`;
var HEAD_ATTRS_KEY = `data-head-attrs`;
var SELF_CLOSING_TAGS = ["meta", "link", "base"];
var BODY_TAG_ATTR_NAME = `data-meta-body`;
var createElement = (tag, attrs, document) => {
  const el = document.createElement(tag);
  for (const key of Object.keys(attrs)) {
    if (key === "body" && attrs.body === true) {
      el.setAttribute(BODY_TAG_ATTR_NAME, "true");
    } else {
      let value = attrs[key];
      if (key === "key" || value === false) {
        continue;
      }
      if (key === "children") {
        el.textContent = value;
      } else {
        el.setAttribute(key, value);
      }
    }
  }
  return el;
};
var htmlEscape = (str) => str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
var stringifyAttrs = (attributes) => {
  const handledAttributes = [];
  for (let [key, value] of Object.entries(attributes)) {
    if (key === "children" || key === "key") {
      continue;
    }
    if (value === false || value == null) {
      continue;
    }
    let attribute = htmlEscape(key);
    if (value !== true) {
      attribute += `="${htmlEscape(String(value))}"`;
    }
    handledAttributes.push(attribute);
  }
  return handledAttributes.length > 0 ? " " + handledAttributes.join(" ") : "";
};
function isEqualNode(oldTag, newTag) {
  if (oldTag instanceof HTMLElement && newTag instanceof HTMLElement) {
    const nonce = newTag.getAttribute("nonce");
    if (nonce && !oldTag.getAttribute("nonce")) {
      const cloneTag = newTag.cloneNode(true);
      cloneTag.setAttribute("nonce", "");
      cloneTag.nonce = nonce;
      return nonce === oldTag.nonce && oldTag.isEqualNode(cloneTag);
    }
  }
  return oldTag.isEqualNode(newTag);
}
var getTagKey = (props) => {
  const names = ["key", "id", "name", "property"];
  for (const n of names) {
    const value = typeof props.getAttribute === "function" ? props.hasAttribute(n) ? props.getAttribute(n) : void 0 : props[n];
    if (value !== void 0) {
      return { name: n, value };
    }
  }
};
var acceptFields = [
  "title",
  "meta",
  "link",
  "base",
  "style",
  "script",
  "noscript",
  "htmlAttrs",
  "bodyAttrs"
];
var renderTemplate = (template, title) => {
  if (template == null)
    return "";
  if (typeof template === "string") {
    return template.replace("%s", title != null ? title : "");
  }
  return template(vue_cjs_prod.unref(title));
};
var headObjToTags = (obj) => {
  const tags = [];
  const keys = Object.keys(obj);
  for (const key of keys) {
    if (obj[key] == null)
      continue;
    switch (key) {
      case "title":
        tags.push({ tag: key, props: { children: obj[key] } });
        break;
      case "titleTemplate":
        break;
      case "base":
        tags.push({ tag: key, props: __spreadValues({ key: "default" }, obj[key]) });
        break;
      default:
        if (acceptFields.includes(key)) {
          const value = obj[key];
          if (Array.isArray(value)) {
            value.forEach((item) => {
              tags.push({ tag: key, props: item });
            });
          } else if (value) {
            tags.push({ tag: key, props: value });
          }
        }
        break;
    }
  }
  return tags;
};
var setAttrs = (el, attrs) => {
  const existingAttrs = el.getAttribute(HEAD_ATTRS_KEY);
  if (existingAttrs) {
    for (const key of existingAttrs.split(",")) {
      if (!(key in attrs)) {
        el.removeAttribute(key);
      }
    }
  }
  const keys = [];
  for (const key in attrs) {
    const value = attrs[key];
    if (value == null)
      continue;
    if (value === false) {
      el.removeAttribute(key);
    } else {
      el.setAttribute(key, value);
    }
    keys.push(key);
  }
  if (keys.length) {
    el.setAttribute(HEAD_ATTRS_KEY, keys.join(","));
  } else {
    el.removeAttribute(HEAD_ATTRS_KEY);
  }
};
var updateElements = (document = window.document, type, tags) => {
  var _a, _b;
  const head = document.head;
  const body = document.body;
  let headCountEl = head.querySelector(`meta[name="${HEAD_COUNT_KEY}"]`);
  let bodyMetaElements = body.querySelectorAll(`[${BODY_TAG_ATTR_NAME}]`);
  const headCount = headCountEl ? Number(headCountEl.getAttribute("content")) : 0;
  const oldHeadElements = [];
  const oldBodyElements = [];
  if (bodyMetaElements) {
    for (let i = 0; i < bodyMetaElements.length; i++) {
      if (bodyMetaElements[i] && ((_a = bodyMetaElements[i].tagName) == null ? void 0 : _a.toLowerCase()) === type) {
        oldBodyElements.push(bodyMetaElements[i]);
      }
    }
  }
  if (headCountEl) {
    for (let i = 0, j = headCountEl.previousElementSibling; i < headCount; i++, j = (j == null ? void 0 : j.previousElementSibling) || null) {
      if (((_b = j == null ? void 0 : j.tagName) == null ? void 0 : _b.toLowerCase()) === type) {
        oldHeadElements.push(j);
      }
    }
  } else {
    headCountEl = document.createElement("meta");
    headCountEl.setAttribute("name", HEAD_COUNT_KEY);
    headCountEl.setAttribute("content", "0");
    head.append(headCountEl);
  }
  let newElements = tags.map((tag) => {
    var _a2;
    return {
      element: createElement(tag.tag, tag.props, document),
      body: (_a2 = tag.props.body) != null ? _a2 : false
    };
  });
  newElements = newElements.filter((newEl) => {
    for (let i = 0; i < oldHeadElements.length; i++) {
      const oldEl = oldHeadElements[i];
      if (isEqualNode(oldEl, newEl.element)) {
        oldHeadElements.splice(i, 1);
        return false;
      }
    }
    for (let i = 0; i < oldBodyElements.length; i++) {
      const oldEl = oldBodyElements[i];
      if (isEqualNode(oldEl, newEl.element)) {
        oldBodyElements.splice(i, 1);
        return false;
      }
    }
    return true;
  });
  oldBodyElements.forEach((t) => {
    var _a2;
    return (_a2 = t.parentNode) == null ? void 0 : _a2.removeChild(t);
  });
  oldHeadElements.forEach((t) => {
    var _a2;
    return (_a2 = t.parentNode) == null ? void 0 : _a2.removeChild(t);
  });
  newElements.forEach((t) => {
    if (t.body === true) {
      body.insertAdjacentElement("beforeend", t.element);
    } else {
      head.insertBefore(t.element, headCountEl);
    }
  });
  headCountEl.setAttribute("content", "" + (headCount - oldHeadElements.length + newElements.filter((t) => !t.body).length));
};
var createHead = (initHeadObject) => {
  let allHeadObjs = [];
  let previousTags = /* @__PURE__ */ new Set();
  if (initHeadObject) {
    allHeadObjs.push(vue_cjs_prod.shallowRef(initHeadObject));
  }
  const head = {
    install(app) {
      app.config.globalProperties.$head = head;
      app.provide(PROVIDE_KEY, head);
    },
    get headTags() {
      const deduped = [];
      const titleTemplate = allHeadObjs.map((i) => vue_cjs_prod.unref(i).titleTemplate).reverse().find((i) => i != null);
      allHeadObjs.forEach((objs) => {
        const tags = headObjToTags(vue_cjs_prod.unref(objs));
        tags.forEach((tag) => {
          if (tag.tag === "meta" || tag.tag === "base" || tag.tag === "script") {
            const key = getTagKey(tag.props);
            if (key) {
              let index = -1;
              for (let i = 0; i < deduped.length; i++) {
                const prev = deduped[i];
                const prevValue = prev.props[key.name];
                const nextValue = tag.props[key.name];
                if (prev.tag === tag.tag && prevValue === nextValue) {
                  index = i;
                  break;
                }
              }
              if (index !== -1) {
                deduped.splice(index, 1);
              }
            }
          }
          if (titleTemplate && tag.tag === "title") {
            tag.props.children = renderTemplate(titleTemplate, tag.props.children);
          }
          deduped.push(tag);
        });
      });
      return deduped;
    },
    addHeadObjs(objs) {
      allHeadObjs.push(objs);
    },
    removeHeadObjs(objs) {
      allHeadObjs = allHeadObjs.filter((_objs) => _objs !== objs);
    },
    updateDOM(document = window.document) {
      let title;
      let htmlAttrs = {};
      let bodyAttrs = {};
      const actualTags = {};
      for (const tag of head.headTags) {
        if (tag.tag === "title") {
          title = tag.props.children;
          continue;
        }
        if (tag.tag === "htmlAttrs") {
          Object.assign(htmlAttrs, tag.props);
          continue;
        }
        if (tag.tag === "bodyAttrs") {
          Object.assign(bodyAttrs, tag.props);
          continue;
        }
        actualTags[tag.tag] = actualTags[tag.tag] || [];
        actualTags[tag.tag].push(tag);
      }
      if (title !== void 0) {
        document.title = title;
      }
      setAttrs(document.documentElement, htmlAttrs);
      setAttrs(document.body, bodyAttrs);
      const tags = /* @__PURE__ */ new Set([...Object.keys(actualTags), ...previousTags]);
      for (const tag of tags) {
        updateElements(document, tag, actualTags[tag] || []);
      }
      previousTags.clear();
      Object.keys(actualTags).forEach((i) => previousTags.add(i));
    }
  };
  return head;
};
var tagToString = (tag) => {
  let isBodyTag = false;
  if (tag.props.body) {
    isBodyTag = true;
    delete tag.props.body;
  }
  let attrs = stringifyAttrs(tag.props);
  if (SELF_CLOSING_TAGS.includes(tag.tag)) {
    return `<${tag.tag}${attrs}${isBodyTag ? `  ${BODY_TAG_ATTR_NAME}="true"` : ""}>`;
  }
  return `<${tag.tag}${attrs}${isBodyTag ? ` ${BODY_TAG_ATTR_NAME}="true"` : ""}>${tag.props.children || ""}</${tag.tag}>`;
};
var renderHeadToString = (head) => {
  const tags = [];
  let titleTag = "";
  let htmlAttrs = {};
  let bodyAttrs = {};
  let bodyTags = [];
  for (const tag of head.headTags) {
    if (tag.tag === "title") {
      titleTag = tagToString(tag);
    } else if (tag.tag === "htmlAttrs") {
      Object.assign(htmlAttrs, tag.props);
    } else if (tag.tag === "bodyAttrs") {
      Object.assign(bodyAttrs, tag.props);
    } else if (tag.props.body) {
      bodyTags.push(tagToString(tag));
    } else {
      tags.push(tagToString(tag));
    }
  }
  tags.push(`<meta name="${HEAD_COUNT_KEY}" content="${tags.length}">`);
  return {
    get headTags() {
      return titleTag + tags.join("");
    },
    get htmlAttrs() {
      return stringifyAttrs(__spreadProps(__spreadValues({}, htmlAttrs), {
        [HEAD_ATTRS_KEY]: Object.keys(htmlAttrs).join(",")
      }));
    },
    get bodyAttrs() {
      return stringifyAttrs(__spreadProps(__spreadValues({}, bodyAttrs), {
        [HEAD_ATTRS_KEY]: Object.keys(bodyAttrs).join(",")
      }));
    },
    get bodyTags() {
      return bodyTags.join("");
    }
  };
};
function isObject(val) {
  return val !== null && typeof val === "object";
}
function _defu(baseObj, defaults, namespace = ".", merger) {
  if (!isObject(defaults)) {
    return _defu(baseObj, {}, namespace, merger);
  }
  const obj = Object.assign({}, defaults);
  for (const key in baseObj) {
    if (key === "__proto__" || key === "constructor") {
      continue;
    }
    const val = baseObj[key];
    if (val === null || val === void 0) {
      continue;
    }
    if (merger && merger(obj, key, val, namespace)) {
      continue;
    }
    if (Array.isArray(val) && Array.isArray(obj[key])) {
      obj[key] = val.concat(obj[key]);
    } else if (isObject(val) && isObject(obj[key])) {
      obj[key] = _defu(val, obj[key], (namespace ? `${namespace}.` : "") + key.toString(), merger);
    } else {
      obj[key] = val;
    }
  }
  return obj;
}
function createDefu(merger) {
  return (...args) => args.reduce((p, c) => _defu(p, c, "", merger), {});
}
const defu = createDefu();
const _47Users_47bonn_47Documents_47GitHub_47nuxt_45app_47node_modules_47nuxt_47dist_47head_47runtime_47lib_47vueuse_45head_46plugin = defineNuxtPlugin((nuxtApp) => {
  const head = createHead();
  nuxtApp.vueApp.use(head);
  nuxtApp.hooks.hookOnce("app:mounted", () => {
    vue_cjs_prod.watchEffect(() => {
      head.updateDOM();
    });
  });
  const titleTemplate = vue_cjs_prod.ref();
  nuxtApp._useHead = (_meta) => {
    const meta2 = vue_cjs_prod.ref(_meta);
    if ("titleTemplate" in meta2.value) {
      titleTemplate.value = meta2.value.titleTemplate;
    }
    const headObj = vue_cjs_prod.computed(() => {
      const overrides = { meta: [] };
      if (titleTemplate.value && "title" in meta2.value) {
        overrides.title = typeof titleTemplate.value === "function" ? titleTemplate.value(meta2.value.title) : titleTemplate.value.replace(/%s/g, meta2.value.title);
      }
      if (meta2.value.charset) {
        overrides.meta.push({ key: "charset", charset: meta2.value.charset });
      }
      if (meta2.value.viewport) {
        overrides.meta.push({ name: "viewport", content: meta2.value.viewport });
      }
      return defu(overrides, meta2.value);
    });
    head.addHeadObjs(headObj);
    {
      return;
    }
  };
  {
    nuxtApp.ssrContext.renderMeta = () => renderHeadToString(head);
  }
});
const removeUndefinedProps = (props) => Object.fromEntries(Object.entries(props).filter(([, value]) => value !== void 0));
const setupForUseMeta = (metaFactory, renderChild) => (props, ctx) => {
  useHead(() => metaFactory({ ...removeUndefinedProps(props), ...ctx.attrs }, ctx));
  return () => {
    var _a, _b;
    return renderChild ? (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a) : null;
  };
};
const globalProps = {
  accesskey: String,
  autocapitalize: String,
  autofocus: {
    type: Boolean,
    default: void 0
  },
  class: String,
  contenteditable: {
    type: Boolean,
    default: void 0
  },
  contextmenu: String,
  dir: String,
  draggable: {
    type: Boolean,
    default: void 0
  },
  enterkeyhint: String,
  exportparts: String,
  hidden: {
    type: Boolean,
    default: void 0
  },
  id: String,
  inputmode: String,
  is: String,
  itemid: String,
  itemprop: String,
  itemref: String,
  itemscope: String,
  itemtype: String,
  lang: String,
  nonce: String,
  part: String,
  slot: String,
  spellcheck: {
    type: Boolean,
    default: void 0
  },
  style: String,
  tabindex: String,
  title: String,
  translate: String
};
const Script = vue_cjs_prod.defineComponent({
  name: "Script",
  inheritAttrs: false,
  props: {
    ...globalProps,
    async: Boolean,
    crossorigin: {
      type: [Boolean, String],
      default: void 0
    },
    defer: Boolean,
    integrity: String,
    nomodule: Boolean,
    nonce: String,
    referrerpolicy: String,
    src: String,
    type: String,
    charset: String,
    language: String
  },
  setup: setupForUseMeta((script) => ({
    script: [script]
  }))
});
const Link = vue_cjs_prod.defineComponent({
  name: "Link",
  inheritAttrs: false,
  props: {
    ...globalProps,
    as: String,
    crossorigin: String,
    disabled: Boolean,
    href: String,
    hreflang: String,
    imagesizes: String,
    imagesrcset: String,
    integrity: String,
    media: String,
    prefetch: {
      type: Boolean,
      default: void 0
    },
    referrerpolicy: String,
    rel: String,
    sizes: String,
    title: String,
    type: String,
    methods: String,
    target: String
  },
  setup: setupForUseMeta((link) => ({
    link: [link]
  }))
});
const Base = vue_cjs_prod.defineComponent({
  name: "Base",
  inheritAttrs: false,
  props: {
    ...globalProps,
    href: String,
    target: String
  },
  setup: setupForUseMeta((base) => ({
    base
  }))
});
const Title = vue_cjs_prod.defineComponent({
  name: "Title",
  inheritAttrs: false,
  setup: setupForUseMeta((_, { slots }) => {
    var _a, _b, _c;
    const title = ((_c = (_b = (_a = slots.default) == null ? void 0 : _a.call(slots)) == null ? void 0 : _b[0]) == null ? void 0 : _c.children) || null;
    return {
      title
    };
  })
});
const Meta = vue_cjs_prod.defineComponent({
  name: "Meta",
  inheritAttrs: false,
  props: {
    ...globalProps,
    charset: String,
    content: String,
    httpEquiv: String,
    name: String
  },
  setup: setupForUseMeta((meta2) => ({
    meta: [meta2]
  }))
});
const Style = vue_cjs_prod.defineComponent({
  name: "Style",
  inheritAttrs: false,
  props: {
    ...globalProps,
    type: String,
    media: String,
    nonce: String,
    title: String,
    scoped: {
      type: Boolean,
      default: void 0
    }
  },
  setup: setupForUseMeta((props, { slots }) => {
    var _a, _b, _c;
    const style = { ...props };
    const textContent = (_c = (_b = (_a = slots.default) == null ? void 0 : _a.call(slots)) == null ? void 0 : _b[0]) == null ? void 0 : _c.children;
    if (textContent) {
      style.children = textContent;
    }
    return {
      style: [style]
    };
  })
});
const Head = vue_cjs_prod.defineComponent({
  name: "Head",
  inheritAttrs: false,
  setup: (_props, ctx) => () => {
    var _a, _b;
    return (_b = (_a = ctx.slots).default) == null ? void 0 : _b.call(_a);
  }
});
const Html = vue_cjs_prod.defineComponent({
  name: "Html",
  inheritAttrs: false,
  props: {
    ...globalProps,
    manifest: String,
    version: String,
    xmlns: String
  },
  setup: setupForUseMeta((htmlAttrs) => ({ htmlAttrs }), true)
});
const Body = vue_cjs_prod.defineComponent({
  name: "Body",
  inheritAttrs: false,
  props: globalProps,
  setup: setupForUseMeta((bodyAttrs) => ({ bodyAttrs }), true)
});
const Components = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  Script,
  Link,
  Base,
  Title,
  Meta,
  Style,
  Head,
  Html,
  Body
}, Symbol.toStringTag, { value: "Module" }));
const metaConfig = { "globalMeta": { "charset": "utf-8", "viewport": "width=device-width, initial-scale=1", "meta": [], "link": [], "style": [], "script": [] } };
const metaMixin = {
  created() {
    const instance = vue_cjs_prod.getCurrentInstance();
    if (!instance) {
      return;
    }
    const options = instance.type;
    if (!options || !("head" in options)) {
      return;
    }
    const nuxtApp = useNuxtApp();
    const source = typeof options.head === "function" ? vue_cjs_prod.computed(() => options.head(nuxtApp)) : options.head;
    useHead(source);
  }
};
const _47Users_47bonn_47Documents_47GitHub_47nuxt_45app_47node_modules_47nuxt_47dist_47head_47runtime_47plugin = defineNuxtPlugin((nuxtApp) => {
  useHead(vue_cjs_prod.markRaw({ title: "", ...metaConfig.globalMeta }));
  nuxtApp.vueApp.mixin(metaMixin);
  for (const name in Components) {
    nuxtApp.vueApp.component(name, Components[name]);
  }
});
const interpolatePath = (route, match) => {
  return match.path.replace(/(:\w+)\([^)]+\)/g, "$1").replace(/(:\w+)[?+*]/g, "$1").replace(/:\w+/g, (r) => {
    var _a;
    return ((_a = route.params[r.slice(1)]) == null ? void 0 : _a.toString()) || "";
  });
};
const generateRouteKey = (override, routeProps) => {
  var _a;
  const matchedRoute = routeProps.route.matched.find((m) => m.components.default === routeProps.Component.type);
  const source = (_a = override != null ? override : matchedRoute == null ? void 0 : matchedRoute.meta.key) != null ? _a : interpolatePath(routeProps.route, matchedRoute);
  return typeof source === "function" ? source(routeProps.route) : source;
};
const wrapInKeepAlive = (props, children) => {
  return { default: () => children };
};
const Fragment = {
  setup(_props, { slots }) {
    return () => {
      var _a;
      return (_a = slots.default) == null ? void 0 : _a.call(slots);
    };
  }
};
const _wrapIf = (component, props, slots) => {
  return { default: () => props ? vue_cjs_prod.h(component, props === true ? {} : props, slots) : vue_cjs_prod.h(Fragment, {}, slots) };
};
const isNestedKey = Symbol("isNested");
const NuxtPage = vue_cjs_prod.defineComponent({
  name: "NuxtPage",
  inheritAttrs: false,
  props: {
    name: {
      type: String
    },
    route: {
      type: Object
    },
    pageKey: {
      type: [Function, String],
      default: null
    }
  },
  setup(props, { attrs }) {
    const nuxtApp = useNuxtApp();
    const isNested = vue_cjs_prod.inject(isNestedKey, false);
    vue_cjs_prod.provide(isNestedKey, true);
    return () => {
      return vue_cjs_prod.h(vueRouter_prod.RouterView, { name: props.name, route: props.route, ...attrs }, {
        default: (routeProps) => {
          var _a;
          return routeProps.Component && _wrapIf(vue_cjs_prod.Transition, (_a = routeProps.route.meta.pageTransition) != null ? _a : defaultPageTransition, wrapInKeepAlive(routeProps.route.meta.keepalive, isNested && nuxtApp.isHydrating ? vue_cjs_prod.h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) }) : vue_cjs_prod.h(vue_cjs_prod.Suspense, {
            onPending: () => nuxtApp.callHook("page:start", routeProps.Component),
            onResolve: () => nuxtApp.callHook("page:finish", routeProps.Component)
          }, { default: () => vue_cjs_prod.h(routeProps.Component, { key: generateRouteKey(props.pageKey, routeProps) }) }))).default();
        }
      });
    };
  }
});
const defaultPageTransition = { name: "page", mode: "out-in" };
const PageTypes = {
  _banner: "banner",
  _cover: "cover",
  _menu: "menu",
  _trend: "trend",
  _representCategory: "representCategory",
  _recommendation: "recommendation",
  _newest: "newest",
  _comingSoon: "comingSoon",
  _funtoonChoice: "funtoonChoice"
};
const _imports_0$1 = publicAssetsURL(`images/ranking.png`);
const _imports_1$1 = publicAssetsURL(`images/category.png`);
const TRUYEN_TRANH = "truyen-tranh";
const DANH_MUC = "danh-muc";
const TAG = "tag";
const _sfc_main$6 = {
  __name: "Banner",
  __ssrInlineRender: true,
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "py-2 mt-6" }, _attrs))}><div class="grid grid-cols-4"><div class="grid grid-cols-1"><div class="flex items-center justify-center">`);
      _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "rounded-[100%] bg-yellow-200"
      }, {
        default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="icon w-16 h-16 rounded-[100%] flex items-center justify-center"${_scopeId}><img alt="ranking" class="w-9 h-9 mb-2"${serverRenderer.exports.ssrRenderAttr("src", _imports_0$1)}${_scopeId}></div>`);
          } else {
            return [
              vue_cjs_prod.createVNode("div", { class: "icon w-16 h-16 rounded-[100%] flex items-center justify-center" }, [
                vue_cjs_prod.createVNode("img", {
                  alt: "ranking",
                  class: "w-9 h-9 mb-2",
                  src: _imports_0$1
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><p class="text-center font-semibold text-xl mt-2"> B\u1EA3ng x\u1EBFp h\u1EA1ng </p></div><div class="grid grid-cols-1"><div class="flex items-center justify-center">`);
      _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtLink, {
        to: `${vue_cjs_prod.unref(DANH_MUC)}/all`,
        class: "rounded-[100%] bg-blue-200"
      }, {
        default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="icon w-16 h-16 flex items-center justify-center rounded-[100%]"${_scopeId}><img alt="category" class="w-9 h-9"${serverRenderer.exports.ssrRenderAttr("src", _imports_1$1)}${_scopeId}></div>`);
          } else {
            return [
              vue_cjs_prod.createVNode("div", { class: "icon w-16 h-16 flex items-center justify-center rounded-[100%]" }, [
                vue_cjs_prod.createVNode("img", {
                  alt: "category",
                  class: "w-9 h-9",
                  src: _imports_1$1
                })
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><p class="text-center font-semibold text-xl mt-2"> Th\u1EC3 lo\u1EA1i </p></div><div class="grid grid-cols-1"><div class="flex items-center justify-center">`);
      _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtLink, {
        to: "/",
        class: "rounded-[100%] bg-amber-200"
      }, {
        default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="icon w-16 h-16 rounded-[100%] flex items-center justify-center"${_scopeId}></div>`);
          } else {
            return [
              vue_cjs_prod.createVNode("div", { class: "icon w-16 h-16 rounded-[100%] flex items-center justify-center" })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><p class="text-center font-semibold text-xl mt-2"> Theo d\xF5i </p></div><div class="grid grid-cols-1"><div class="flex items-center justify-center">`);
      _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtLink, { class: "rounded-[100%] bg-green-200" }, {
        default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="icon w-16 h-16 rounded-[100%] flex items-center justify-center text-3xl"${_scopeId}> \u{1F4DA} </div>`);
          } else {
            return [
              vue_cjs_prod.createVNode("div", { class: "icon w-16 h-16 rounded-[100%] flex items-center justify-center text-3xl" }, " \u{1F4DA} ")
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><p class="text-center font-semibold text-xl mt-2"> L\u1ECBch s\u1EED </p></div></div></div>`);
    };
  }
};
const _sfc_setup$6 = _sfc_main$6.setup;
_sfc_main$6.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/Banner.vue");
  return _sfc_setup$6 ? _sfc_setup$6(props, ctx) : void 0;
};
const Banner = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$6
}, Symbol.toStringTag, { value: "Module" }));
const _sfc_main$5 = {};
const _sfc_setup$5 = _sfc_main$5.setup;
_sfc_main$5.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/NewStory.vue");
  return _sfc_setup$5 ? _sfc_setup$5(props, ctx) : void 0;
};
const NewStory = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$5
}, Symbol.toStringTag, { value: "Module" }));
function useNavigatorComicPreview(slug, _id) {
  return `/${TRUYEN_TRANH}/${slug}/${_id}`;
}
const _imports_0 = publicAssetsURL(`icons/comicPage/icon-star.svg`);
const _imports_1 = publicAssetsURL(`icons/comicPage/icon-comment-count.svg`);
const COMIC_STATUS = {
  inprogress: "\u0110ang ra",
  complete: "Full"
};
const _sfc_main$4 = /* @__PURE__ */ vue_cjs_prod.defineComponent({
  __name: "RepresentCategory",
  __ssrInlineRender: true,
  props: {
    record: Object
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      const _component_NuxtLink = __nuxt_component_0;
      const _component_SharedMeeToonImg = vue_cjs_prod.resolveComponent("SharedMeeToonImg");
      _push(`<!--[-->`);
      serverRenderer.exports.ssrRenderList(__props.record.content, (content) => {
        _push(`<div class="px-4"><div class="h-[70px] mb-4 flex justify-between"><h2 class="text-3xl font-bold flex justify-start items-center text-black">${serverRenderer.exports.ssrInterpolate(content.name || content.categoryVietName)}</h2>`);
        _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtLink, {
          to: content.type !== "category" ? `${vue_cjs_prod.unref(TAG)}/${content.slug}` : `${vue_cjs_prod.unref(DANH_MUC)}/${content.slug}`,
          class: "text-xl font-semibold flex items-center text-primary mr-1"
        }, {
          default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
            if (_push2) {
              _push2(` Th\xEAm `);
            } else {
              return [
                vue_cjs_prod.createTextVNode(" Th\xEAm ")
              ];
            }
          }),
          _: 2
        }, _parent));
        _push(`</div><div class="grid grid-cols-1 md:grid-cols-2 gap-14 mb-10"><!--[-->`);
        serverRenderer.exports.ssrRenderList(content.comicsReviewNewest, (comic) => {
          _push(`<div class="col-span-1 rounded-[8px] p-13 max-w-[384px] w-full h-[138px] bg-white relative shadow-[0_3px_20px_rgba(0,0,0,10%)]"><div class="absolute bottom-[13px] left-[13px]">`);
          _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtLink, {
            to: vue_cjs_prod.unref(useNavigatorComicPreview)(comic.slug, comic._id)
          }, {
            default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="max-w-full w-[105px]"${_scopeId}><div class="relative"${_scopeId}><div class="absolute top-0"${_scopeId}>`);
                if (!comic.adultContent) {
                  _push2(`<span class="bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"${_scopeId}>${serverRenderer.exports.ssrInterpolate(vue_cjs_prod.unref(COMIC_STATUS)[comic.status])}</span>`);
                } else {
                  _push2(`<span class="bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"${_scopeId}> 17+ </span>`);
                }
                _push2(`</div>`);
                _push2(serverRenderer.exports.ssrRenderComponent(_component_SharedMeeToonImg, {
                  class: "rounded-2xl visible h-full left-0 relative top-0 w-full",
                  src: comic.verticalLogo,
                  width: 105,
                  height: 138
                }, null, _parent2, _scopeId));
                _push2(`</div></div>`);
              } else {
                return [
                  vue_cjs_prod.createVNode("div", { class: "max-w-full w-[105px]" }, [
                    vue_cjs_prod.createVNode("div", { class: "relative" }, [
                      vue_cjs_prod.createVNode("div", { class: "absolute top-0" }, [
                        !comic.adultContent ? (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock("span", {
                          key: 0,
                          class: "bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"
                        }, vue_cjs_prod.toDisplayString(vue_cjs_prod.unref(COMIC_STATUS)[comic.status]), 1)) : (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock("span", {
                          key: 1,
                          class: "bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"
                        }, " 17+ "))
                      ]),
                      vue_cjs_prod.createVNode(_component_SharedMeeToonImg, {
                        class: "rounded-2xl visible h-full left-0 relative top-0 w-full",
                        src: comic.verticalLogo,
                        width: 105,
                        height: 138
                      }, null, 8, ["src"])
                    ])
                  ])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`</div><div class="ml-[118px] p-4"><h3 class="text-xl font-medium"><a>${serverRenderer.exports.ssrInterpolate(comic.comicName)}</a></h3><div><div class="rating flex items-center"><!--[-->`);
          serverRenderer.exports.ssrRenderList(5, (i) => {
            _push(`<img${serverRenderer.exports.ssrRenderAttr("src", _imports_0)} alt="rating">`);
          });
          _push(`<!--]--><p class="text-xl">${serverRenderer.exports.ssrInterpolate(comic.avgRate.toFixed(1))} <span class="text-xl font-semibold text-gray-500"> (369)</span></p></div><a><i class="w-full text-base line-clamp-3"> &quot;${serverRenderer.exports.ssrInterpolate(comic.contentReview)}&quot; </i></a><div class="mt-3"><a class="mt-3"><p class="flex items-center justify-start w-full text-gray-500"><img${serverRenderer.exports.ssrRenderAttr("src", _imports_1)} class="mr-2" alt="comment"><span class="name text-base font-semibold">${serverRenderer.exports.ssrInterpolate(comic.userComment.name)}</span></p></a></div></div></div></div>`);
        });
        _push(`<!--]--></div><!--[-->`);
        serverRenderer.exports.ssrRenderList(content.comics, (comic) => {
          _push(`<div class="w-[75px]">`);
          _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtLink, {
            to: vue_cjs_prod.unref(useNavigatorComicPreview)(comic.slug, comic._id)
          }, {
            default: vue_cjs_prod.withCtx((_, _push2, _parent2, _scopeId) => {
              if (_push2) {
                _push2(`<div class="absolute top-0"${_scopeId}>`);
                if (!comic.adultContent) {
                  _push2(`<span class="bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"${_scopeId}>${serverRenderer.exports.ssrInterpolate(vue_cjs_prod.unref(COMIC_STATUS)[comic.status])}</span>`);
                } else {
                  _push2(`<span class="bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"${_scopeId}> 17+ </span>`);
                }
                _push2(`</div>`);
                _push2(serverRenderer.exports.ssrRenderComponent(_component_SharedMeeToonImg, {
                  loading: "lazy",
                  class: "rounded-xl w-full",
                  src: comic.verticalLogo,
                  width: 105,
                  height: 138
                }, null, _parent2, _scopeId));
              } else {
                return [
                  vue_cjs_prod.createVNode("div", { class: "absolute top-0" }, [
                    !comic.adultContent ? (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock("span", {
                      key: 0,
                      class: "bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"
                    }, vue_cjs_prod.toDisplayString(vue_cjs_prod.unref(COMIC_STATUS)[comic.status]), 1)) : (vue_cjs_prod.openBlock(), vue_cjs_prod.createBlock("span", {
                      key: 1,
                      class: "bg-primary rounded-xl text-white text-xl font-bold px-3 py-1 ml-1"
                    }, " 17+ "))
                  ]),
                  vue_cjs_prod.createVNode(_component_SharedMeeToonImg, {
                    loading: "lazy",
                    class: "rounded-xl w-full",
                    src: comic.verticalLogo,
                    width: 105,
                    height: 138
                  }, null, 8, ["src"])
                ];
              }
            }),
            _: 2
          }, _parent));
          _push(`<div class="h-[40px] flex flex-wrap"><h2 class="text-xl line-clamp-1 mt-1 text-black font-semibold">${serverRenderer.exports.ssrInterpolate(comic.comicName)}</h2></div></div>`);
        });
        _push(`<!--]--></div>`);
      });
      _push(`<!--]-->`);
    };
  }
});
const _sfc_setup$4 = _sfc_main$4.setup;
_sfc_main$4.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/RepresentCategory.vue");
  return _sfc_setup$4 ? _sfc_setup$4(props, ctx) : void 0;
};
const RepresentCategory = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": _sfc_main$4
}, Symbol.toStringTag, { value: "Module" }));
const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};
const _sfc_main$3 = {
  __name: "welcome",
  __ssrInlineRender: true,
  props: {
    appName: {
      type: String,
      default: "Nuxt"
    },
    version: {
      type: String,
      default: ""
    },
    title: {
      type: String,
      default: "Welcome to Nuxt 3!"
    },
    readDocs: {
      type: String,
      default: "We highly recommend you take a look at the Nuxt documentation, whether you are new or have previous experience with the framework."
    },
    followTwitter: {
      type: String,
      default: "Follow the Nuxt Twitter account to get latest news about releases, new modules, tutorials and tips."
    },
    starGitHub: {
      type: String,
      default: "Nuxt is open source and the code is available on GitHub, feel free to star it, participate in discussions or dive into the source."
    }
  },
  setup(__props) {
    const props = __props;
    useHead({
      title: `${props.title}`,
      script: [],
      style: [
        {
          children: `*,:before,:after{-webkit-box-sizing:border-box;box-sizing:border-box;border-width:0;border-style:solid;border-color:#e5e7eb}*{--tw-ring-inset:var(--tw-empty, );--tw-ring-offset-width:0px;--tw-ring-offset-color:#fff;--tw-ring-color:rgba(14, 165, 233, ;a{color:inherit;text-decoration:inherit}body{margin:0;font-family:inherit;line-height:inherit}html{-webkit-text-size-adjust:100%;font-family:ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,"Apple Color Emoji","Segoe UI Emoji",Segoe UI Symbol,"Noto Color Emoji";line-height:1;h4,h5{font-size:inherit;font-weight:inherit}svg{display:block;vertical-align:middle}`
        }
      ]
    });
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "font-sans antialiased bg-white dark:bg-black text-black dark:text-white min-h-screen place-content-center flex flex-col items-center justify-center p-8 text-sm sm:text-base" }, _attrs))} data-v-d2e18222><div class="grid grid-cols-3 gap-4 md:gap-8 max-w-5xl w-full z-20" data-v-d2e18222><div class="flex justify-between items-end col-span-3" data-v-d2e18222><a href="https://v3.nuxtjs.org" target="_blank" rel="noopener" class="nuxt-logo" data-v-d2e18222><svg viewBox="0 0 221 65" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-40 text-black dark:text-white" data-v-d2e18222><g clip-path="url(#a)" data-v-d2e18222><path fill="currentColor" d="M82.5623 18.5705h7.3017l15.474 24.7415V18.5705h6.741v35.0576h-7.252L89.3025 28.938v24.6901h-6.7402V18.5705ZM142.207 53.628h-6.282v-3.916c-1.429 2.7559-4.339 4.3076-8.015 4.3076-5.822 0-9.603-4.1069-9.603-10.0175V28.3847h6.282v14.3251c0 3.4558 2.146 5.8592 5.362 5.8592 3.524 0 5.974-2.7044 5.974-6.4099V28.3847h6.282V53.628ZM164.064 53.2289l-6.026-8.4144-6.027 8.4144h-6.69l9.296-13.1723-8.58-12.0709h6.843l5.158 7.2641 5.106-7.2641h6.895l-8.632 12.0709 9.295 13.1723h-6.638ZM183.469 20.7726v7.6116h7.149v5.1593h-7.149v12.5311c0 .4208.17.8245.473 1.1223.303.2978.715.4654 1.144.4661h5.532v5.9547h-4.137c-5.617 0-9.293-3.2062-9.293-8.8109V33.5484h-5.056v-5.1642h3.172c1.479 0 2.34-.8639 2.34-2.2932v-5.3184h5.825Z" data-v-d2e18222></path><path fill-rule="evenodd" clip-rule="evenodd" d="M30.1185 11.5456c-1.8853-3.24168-6.5987-3.24169-8.484 0L1.08737 46.8747c-1.885324 3.2417.47133 7.2938 4.24199 7.2938H21.3695c-1.6112-1.4081-2.2079-3.8441-.9886-5.9341l15.5615-26.675-5.8239-10.0138Z" fill="#80EEC0" data-v-d2e18222></path><path d="M43.1374 19.2952c1.5603-2.6523 5.461-2.6523 7.0212 0l17.0045 28.9057c1.5603 2.6522-.39 5.9676-3.5106 5.9676h-34.009c-3.1206 0-5.0709-3.3154-3.5106-5.9676l17.0045-28.9057ZM209.174 53.8005H198.483c0-1.8514.067-3.4526 0-6.0213h10.641c1.868 0 3.353.1001 4.354-.934 1-1.0341 1.501-2.3351 1.501-3.9029 0-1.8347-.667-3.2191-2.002-4.1532-1.301-.9674-2.985-1.4511-5.054-1.4511h-2.601v-5.2539h2.652c1.701 0 3.119-.4003 4.253-1.2009 1.134-.8006 1.701-1.9849 1.701-3.5527 0-1.301-.434-2.3351-1.301-3.1023-.834-.8007-2.001-1.201-3.503-1.201-1.634 0-2.918.4837-3.853 1.4511-.9.9674-1.401 2.1517-1.501 3.5527h-6.254c.133-3.2358 1.251-5.7877 3.352-7.6558 2.135-1.868 4.887-2.8021 8.256-2.8021 2.402 0 4.42.4337 6.055 1.301 1.668.834 2.919 1.9515 3.753 3.3525.867 1.4011 1.301 2.9523 1.301 4.6536 0 1.9681-.551 3.636-1.651 5.0037-1.068 1.3344-2.402 2.235-4.004 2.7021 1.969.4003 3.57 1.3677 4.804 2.9022 1.234 1.5011 1.852 3.4025 1.852 5.7043 0 1.9347-.468 3.7028-1.402 5.304-.934 1.6012-2.301 2.8855-4.103 3.8529-1.768.9674-3.953 1.4511-6.555 1.4511Z" fill="#00DC82" data-v-d2e18222></path></g><defs data-v-d2e18222><clipPath id="a" data-v-d2e18222><path fill="#fff" d="M0 0h221v65H0z" data-v-d2e18222></path></clipPath></defs></svg></a><a href="https://github.com/nuxt/framework/releases/tag/{{ version }}" target="_blank" rel="noopener" class="flex justify-end pb-1 sm:pb-2" data-v-d2e18222>${serverRenderer.exports.ssrInterpolate(__props.version)}</a><div class="spotlight-wrapper" data-v-d2e18222><div class="fixed z-10 left-0 right-0 spotlight" data-v-d2e18222></div></div></div><div class="col-span-3 rounded p-4 flex flex-col gradient-border" data-v-d2e18222><div class="flex justify-between items-center mb-4" data-v-d2e18222><h4 class="font-medium text-2xl" data-v-d2e18222>Get Started</h4><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d2e18222><path d="M29.4284 31.095C26.9278 33.5955 23.5364 35.0003 20.0001 35.0003C16.4637 35.0003 13.0723 33.5955 10.5717 31.095C8.07118 28.5944 6.66638 25.203 6.66638 21.6667C6.66638 18.1304 8.07118 14.7389 10.5717 12.2383C10.5717 12.2383 11.6667 15 15.0001 16.6667C15.0001 13.3333 15.8334 8.33333 19.9767 5C23.3334 8.33333 26.8167 9.62833 29.4267 12.2383C30.667 13.475 31.6506 14.9446 32.321 16.5626C32.9915 18.1806 33.3355 19.9152 33.3334 21.6667C33.3357 23.418 32.9919 25.1525 32.3218 26.7705C31.6516 28.3886 30.6683 29.8582 29.4284 31.095V31.095Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-d2e18222></path><path d="M16.465 26.8683C17.0456 27.4491 17.7604 27.878 18.5462 28.1169C19.3319 28.3559 20.1644 28.3976 20.9701 28.2385C21.7758 28.0793 22.5299 27.7241 23.1657 27.2043C23.8015 26.6845 24.2995 26.016 24.6157 25.2581C24.9318 24.5001 25.0564 23.6759 24.9784 22.8584C24.9004 22.0408 24.6222 21.2551 24.1684 20.5705C23.7146 19.886 23.0992 19.3238 22.3766 18.9336C21.6539 18.5434 20.8463 18.3373 20.025 18.3333L18.3333 23.3333H15C15 24.6133 15.4883 25.8933 16.465 26.8683Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-d2e18222></path></svg></div><p class="mb-2" data-v-d2e18222>Remove this welcome page by removing <a class="bg-gray-100 dark:bg-white/10 rounded font-mono p-1 font-bold" data-v-d2e18222>&lt;NuxtWelcome /&gt;</a> tag or creating an <a href="https://v3.nuxtjs.org/docs/directory-structure/app" target="_blank" rel="noopener" class="bg-gray-100 dark:bg-white/10 rounded font-mono p-1 font-bold" data-v-d2e18222>app.vue</a> file.</p></div><a href="https://v3.nuxtjs.org" target="_blank" rel="noopener" class="gradient-border cursor-pointer col-span-3 sm:col-span-1 p-4 flex flex-col" data-v-d2e18222><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d2e18222><path d="M20 10.4217C21.9467 9.12833 24.59 8.33333 27.5 8.33333C30.4117 8.33333 33.0533 9.12833 35 10.4217V32.0883C33.0533 30.795 30.4117 30 27.5 30C24.59 30 21.9467 30.795 20 32.0883M20 10.4217V32.0883V10.4217ZM20 10.4217C18.0533 9.12833 15.41 8.33333 12.5 8.33333C9.59 8.33333 6.94667 9.12833 5 10.4217V32.0883C6.94667 30.795 9.59 30 12.5 30C15.41 30 18.0533 30.795 20 32.0883V10.4217Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" data-v-d2e18222></path><rect x="23.3334" y="13.3333" width="8.33334" height="1.66667" rx="0.833333" fill="currentColor" data-v-d2e18222></rect><rect x="8.33337" y="13.3333" width="8.33333" height="1.66667" rx="0.833333" fill="currentColor" data-v-d2e18222></rect><rect x="8.33337" y="18.3333" width="8.33333" height="1.66667" rx="0.833333" fill="currentColor" data-v-d2e18222></rect><rect x="8.33337" y="23.3333" width="8.33333" height="1.66667" rx="0.833334" fill="currentColor" data-v-d2e18222></rect><rect x="23.3334" y="18.3333" width="8.33334" height="1.66667" rx="0.833333" fill="currentColor" data-v-d2e18222></rect><rect x="23.3334" y="23.3333" width="8.33334" height="1.66667" rx="0.833334" fill="currentColor" data-v-d2e18222></rect></svg><h5 class="font-semibold text-xl mt-4" data-v-d2e18222>Documentation</h5><p class="mt-2" data-v-d2e18222>${serverRenderer.exports.ssrInterpolate(__props.readDocs)}</p></a><a href="https://github.com/nuxt/framework" target="_blank" rel="noopener" class="cursor-pointer gradient-border col-span-3 sm:col-span-1 p-4 flex flex-col" data-v-d2e18222><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d2e18222><path fill-rule="evenodd" clip-rule="evenodd" d="M20 3.33333C10.795 3.33333 3.33337 10.8067 3.33337 20.0283C3.33337 27.4033 8.10837 33.6617 14.7317 35.8683C15.565 36.0217 15.8684 35.5067 15.8684 35.0633C15.8684 34.6683 15.855 33.6167 15.8467 32.225C11.21 33.2333 10.2317 29.9867 10.2317 29.9867C9.47504 28.0567 8.38171 27.5433 8.38171 27.5433C6.86837 26.51 8.49671 26.53 8.49671 26.53C10.1684 26.6467 11.0484 28.25 11.0484 28.25C12.535 30.8 14.95 30.0633 15.8984 29.6367C16.0517 28.5583 16.4817 27.8233 16.9584 27.4067C13.2584 26.985 9.36671 25.5517 9.36671 19.155C9.36671 17.3333 10.0167 15.8417 11.0817 14.675C10.91 14.2533 10.3384 12.555 11.245 10.2583C11.245 10.2583 12.645 9.80833 15.8284 11.9683C17.188 11.5975 18.5908 11.4087 20 11.4067C21.4167 11.4133 22.8417 11.5983 24.1734 11.9683C27.355 9.80833 28.7517 10.2567 28.7517 10.2567C29.6617 12.555 29.0884 14.2533 28.9184 14.675C29.985 15.8417 30.6317 17.3333 30.6317 19.155C30.6317 25.5683 26.7334 26.98 23.0217 27.3933C23.62 27.9083 24.1517 28.9267 24.1517 30.485C24.1517 32.715 24.1317 34.5167 24.1317 35.0633C24.1317 35.51 24.4317 36.03 25.2784 35.8667C28.5972 34.7535 31.4823 32.6255 33.5258 29.7834C35.5694 26.9413 36.6681 23.5289 36.6667 20.0283C36.6667 10.8067 29.2034 3.33333 20 3.33333Z" fill="currentColor" data-v-d2e18222></path></svg><h5 class="font-semibold text-xl mt-4" data-v-d2e18222>GitHub</h5><p class="mt-2" data-v-d2e18222>${serverRenderer.exports.ssrInterpolate(__props.starGitHub)}</p></a><a href="https://twitter.com/nuxt_js" target="_blank" rel="noopener" class="cursor-pointer gradient-border col-span-3 sm:col-span-1 p-4 flex flex-col" data-v-d2e18222><svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" data-v-d2e18222><path d="M13.8167 33.7557C26.395 33.7557 33.275 23.334 33.275 14.2973C33.275 14.0007 33.275 13.7057 33.255 13.414C34.5937 12.4449 35.7489 11.245 36.6667 9.87066C35.4185 10.424 34.0943 10.7869 32.7384 10.9473C34.1661 10.0924 35.2346 8.74791 35.745 7.164C34.4029 7.96048 32.9345 8.52188 31.4034 8.824C30.3724 7.72694 29.0084 7.00039 27.5228 6.75684C26.0371 6.51329 24.5126 6.76633 23.1852 7.47678C21.8579 8.18723 20.8018 9.31545 20.1805 10.6868C19.5592 12.0581 19.4073 13.596 19.7484 15.0623C17.0294 14.9261 14.3694 14.2195 11.9411 12.9886C9.51285 11.7577 7.37059 10.0299 5.65337 7.91733C4.7789 9.42267 4.51102 11.2047 4.90427 12.9006C5.29751 14.5965 6.32232 16.0788 7.77004 17.0457C6.68214 17.0142 5.61776 16.7215 4.66671 16.1923V16.279C4.66736 17.8578 5.21403 19.3878 6.21404 20.6096C7.21404 21.8313 8.60582 22.6696 10.1534 22.9823C9.14639 23.2569 8.08986 23.2968 7.06504 23.099C7.50198 24.4581 8.35284 25.6467 9.49859 26.4984C10.6443 27.35 12.0277 27.8223 13.455 27.849C12.0369 28.9633 10.413 29.7871 8.67625 30.2732C6.93948 30.7594 5.12391 30.8984 3.33337 30.6823C6.46105 32.6896 10.1004 33.7542 13.8167 33.749" fill="currentColor" data-v-d2e18222></path></svg><h5 class="font-semibold text-xl mt-4" data-v-d2e18222>Twitter</h5><p class="mt-2" data-v-d2e18222>${serverRenderer.exports.ssrInterpolate(__props.followTwitter)}</p></a></div></div>`);
    };
  }
};
const _sfc_setup$3 = _sfc_main$3.setup;
_sfc_main$3.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/@nuxt/ui-templates/dist/templates/welcome.vue");
  return _sfc_setup$3 ? _sfc_setup$3(props, ctx) : void 0;
};
const welcome = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["__scopeId", "data-v-d2e18222"]]);
const welcome$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": welcome
}, Symbol.toStringTag, { value: "Module" }));
const layouts = {};
const defaultLayoutTransition = { name: "layout", mode: "out-in" };
const layout = vue_cjs_prod.defineComponent({
  props: {
    name: {
      type: [String, Boolean, Object],
      default: null
    }
  },
  setup(props, context) {
    const route = useRoute();
    return () => {
      var _a, _b, _c;
      const layout2 = (_b = (_a = vue_cjs_prod.isRef(props.name) ? props.name.value : props.name) != null ? _a : route.meta.layout) != null ? _b : "default";
      const hasLayout = layout2 && layout2 in layouts;
      return _wrapIf(vue_cjs_prod.Transition, hasLayout && ((_c = route.meta.layoutTransition) != null ? _c : defaultLayoutTransition), _wrapIf(layouts[layout2], hasLayout, context.slots)).default();
    };
  }
});
const layout$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": layout
}, Symbol.toStringTag, { value: "Module" }));
const nuxtErrorBoundary = vue_cjs_prod.defineComponent({
  setup(_props, { slots, emit }) {
    const error = vue_cjs_prod.ref(null);
    useNuxtApp();
    vue_cjs_prod.onErrorCaptured((err) => {
    });
    return () => {
      var _a, _b;
      return error.value ? (_a = slots.error) == null ? void 0 : _a.call(slots, { error }) : (_b = slots.default) == null ? void 0 : _b.call(slots);
    };
  }
});
const nuxtErrorBoundary$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": nuxtErrorBoundary
}, Symbol.toStringTag, { value: "Module" }));
const clientOnly = vue_cjs_prod.defineComponent({
  name: "ClientOnly",
  props: ["fallback", "placeholder", "placeholderTag", "fallbackTag"],
  setup(_, { slots }) {
    const mounted = vue_cjs_prod.ref(false);
    return (props) => {
      var _a;
      if (mounted.value) {
        return (_a = slots.default) == null ? void 0 : _a.call(slots);
      }
      const slot = slots.fallback || slots.placeholder;
      if (slot) {
        return slot();
      }
      const fallbackStr = props.fallback || props.placeholder || "";
      const fallbackTag = props.fallbackTag || props.placeholderTag || "span";
      return vue_cjs_prod.createElementBlock(fallbackTag, null, fallbackStr);
    };
  }
});
function createClientOnly(component) {
  return vue_cjs_prod.defineComponent({
    name: "ClientOnlyWrapper",
    inheritAttrs: false,
    setup(_props, { attrs, slots }) {
      const mounted = vue_cjs_prod.ref(false);
      return () => {
        if (mounted.value) {
          return vue_cjs_prod.h(component, attrs, slots);
        }
        return vue_cjs_prod.h("div", { class: attrs.class, style: attrs.style });
      };
    }
  });
}
const clientOnly$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": clientOnly,
  createClientOnly
}, Symbol.toStringTag, { value: "Module" }));
const serverPlaceholder = vue_cjs_prod.defineComponent({
  name: "ServerPlaceholder",
  render() {
    return vue_cjs_prod.createElementBlock("div");
  }
});
const serverPlaceholder$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": serverPlaceholder
}, Symbol.toStringTag, { value: "Module" }));
const nuxtLoadingIndicator = vue_cjs_prod.defineComponent({
  name: "NuxtLoadingIndicator",
  props: {
    throttle: {
      type: Number,
      default: 200
    },
    duration: {
      type: Number,
      default: 2e3
    },
    height: {
      type: Number,
      default: 3
    },
    color: {
      type: String,
      default: "repeating-linear-gradient(to right,#00dc82 0%,#34cdfe 50%,#0047e1 100%)"
    }
  },
  setup(props) {
    const indicator = useLoadingIndicator({
      duration: props.duration,
      throttle: props.throttle
    });
    const nuxtApp = useNuxtApp();
    nuxtApp.hook("page:start", indicator.start);
    nuxtApp.hook("page:finish", indicator.finish);
    return () => vue_cjs_prod.h("div", {
      class: "nuxt-loading-indicator",
      style: {
        position: "fixed",
        top: 0,
        right: 0,
        left: 0,
        pointerEvents: "none",
        width: `${indicator.progress.value}%`,
        height: `${props.height}px`,
        opacity: indicator.isLoading.value ? 1 : 0,
        background: props.color,
        backgroundSize: `${100 / indicator.progress.value * 100}% auto`,
        transition: "width 0.1s, height 0.4s, opacity 0.4s",
        zIndex: 999999
      }
    });
  }
});
function useLoadingIndicator(opts) {
  const progress = vue_cjs_prod.ref(0);
  const isLoading = vue_cjs_prod.ref(false);
  vue_cjs_prod.computed(() => 1e4 / opts.duration);
  let _timer = null;
  let _throttle = null;
  function start() {
    clear();
    progress.value = 0;
    isLoading.value = true;
    if (opts.throttle)
      ;
  }
  function finish() {
    progress.value = 100;
    _hide();
  }
  function clear() {
    clearInterval(_timer);
    clearTimeout(_throttle);
    _timer = null;
    _throttle = null;
  }
  function _hide() {
    clear();
  }
  return {
    progress,
    isLoading,
    start,
    finish,
    clear
  };
}
const nuxtLoadingIndicator$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  "default": nuxtLoadingIndicator
}, Symbol.toStringTag, { value: "Module" }));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return Banner;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return NewStory;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return RepresentCategory;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return welcome$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return layout$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return nuxtErrorBoundary$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return clientOnly$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return serverPlaceholder$1;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return nuxtLink;
}).then((c) => c.default || c));
vue_cjs_prod.defineAsyncComponent(() => Promise.resolve().then(function() {
  return nuxtLoadingIndicator$1;
}).then((c) => c.default || c));
const _sfc_main$2 = /* @__PURE__ */ vue_cjs_prod.defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { data: homepages } = useFetch("/api/home", "$wmD6MRdwcx");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<main${serverRenderer.exports.ssrRenderAttrs(vue_cjs_prod.mergeProps({ class: "h-[auto] bg-white" }, _attrs))}><h1> Hello nuxt </h1><!--[-->`);
      serverRenderer.exports.ssrRenderList(vue_cjs_prod.unref(homepages), (record) => {
        _push(`<div>`);
        if (record.type === vue_cjs_prod.unref(PageTypes)._representCategory) {
          _push(serverRenderer.exports.ssrRenderComponent(vue_cjs_prod.unref(_sfc_main$4), { record }, null, _parent));
        } else {
          _push(`<!---->`);
        }
        _push(`</div>`);
      });
      _push(`<!--]--></main>`);
    };
  }
});
const _sfc_setup$2 = _sfc_main$2.setup;
_sfc_main$2.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/index.vue");
  return _sfc_setup$2 ? _sfc_setup$2(props, ctx) : void 0;
};
const meta = void 0;
const routes = [
  {
    name: "index",
    path: "/",
    file: "/Users/bonn/Documents/GitHub/nuxt-app/pages/index.vue",
    children: [],
    meta,
    alias: [],
    component: () => import('./index.d00aa9be.mjs')
  }
];
const configRouterOptions = {};
const routerOptions = {
  ...configRouterOptions
};
const globalMiddleware = [];
const namedMiddleware = {};
const _47Users_47bonn_47Documents_47GitHub_47nuxt_45app_47node_modules_47nuxt_47dist_47pages_47runtime_47router = defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.vueApp.component("NuxtPage", NuxtPage);
  nuxtApp.vueApp.component("NuxtNestedPage", NuxtPage);
  nuxtApp.vueApp.component("NuxtChild", NuxtPage);
  const baseURL2 = useRuntimeConfig().app.baseURL;
  const routerHistory = vueRouter_prod.createMemoryHistory(baseURL2);
  const initialURL = nuxtApp.ssrContext.url;
  const router = vueRouter_prod.createRouter({
    ...routerOptions,
    history: routerHistory,
    routes
  });
  nuxtApp.vueApp.use(router);
  const previousRoute = vue_cjs_prod.shallowRef(router.currentRoute.value);
  router.afterEach((_to, from) => {
    previousRoute.value = from;
  });
  Object.defineProperty(nuxtApp.vueApp.config.globalProperties, "previousRoute", {
    get: () => previousRoute.value
  });
  const route = {};
  for (const key in router.currentRoute.value) {
    route[key] = vue_cjs_prod.computed(() => router.currentRoute.value[key]);
  }
  const _activeRoute = vue_cjs_prod.shallowRef(router.resolve(initialURL));
  const syncCurrentRoute = () => {
    _activeRoute.value = router.currentRoute.value;
  };
  nuxtApp.hook("page:finish", syncCurrentRoute);
  router.afterEach((to, from) => {
    var _a, _b, _c, _d;
    if (((_b = (_a = to.matched[0]) == null ? void 0 : _a.components) == null ? void 0 : _b.default) === ((_d = (_c = from.matched[0]) == null ? void 0 : _c.components) == null ? void 0 : _d.default)) {
      syncCurrentRoute();
    }
  });
  const activeRoute = {};
  for (const key in _activeRoute.value) {
    activeRoute[key] = vue_cjs_prod.computed(() => _activeRoute.value[key]);
  }
  nuxtApp._route = vue_cjs_prod.reactive(route);
  nuxtApp._activeRoute = vue_cjs_prod.reactive(activeRoute);
  nuxtApp._middleware = nuxtApp._middleware || {
    global: [],
    named: {}
  };
  useError();
  try {
    if (true) {
      await router.push(initialURL);
    }
    await router.isReady();
  } catch (error2) {
    callWithNuxt(nuxtApp, throwError, [error2]);
  }
  router.beforeEach(async (to, from) => {
    var _a;
    to.meta = vue_cjs_prod.reactive(to.meta);
    nuxtApp._processingMiddleware = true;
    const middlewareEntries = /* @__PURE__ */ new Set([...globalMiddleware, ...nuxtApp._middleware.global]);
    for (const component of to.matched) {
      const componentMiddleware = component.meta.middleware;
      if (!componentMiddleware) {
        continue;
      }
      if (Array.isArray(componentMiddleware)) {
        for (const entry2 of componentMiddleware) {
          middlewareEntries.add(entry2);
        }
      } else {
        middlewareEntries.add(componentMiddleware);
      }
    }
    for (const entry2 of middlewareEntries) {
      const middleware = typeof entry2 === "string" ? nuxtApp._middleware.named[entry2] || await ((_a = namedMiddleware[entry2]) == null ? void 0 : _a.call(namedMiddleware).then((r) => r.default || r)) : entry2;
      if (!middleware) {
        throw new Error(`Unknown route middleware: '${entry2}'.`);
      }
      const result = await callWithNuxt(nuxtApp, middleware, [to, from]);
      {
        if (result === false || result instanceof Error) {
          const error2 = result || createError({
            statusMessage: `Route navigation aborted: ${initialURL}`
          });
          return callWithNuxt(nuxtApp, throwError, [error2]);
        }
      }
      if (result || result === false) {
        return result;
      }
    }
  });
  router.afterEach(async (to) => {
    delete nuxtApp._processingMiddleware;
    if (to.matched.length === 0) {
      callWithNuxt(nuxtApp, throwError, [createError({
        statusCode: 404,
        statusMessage: `Page not found: ${to.fullPath}`
      })]);
    } else if (to.matched[0].name === "404" && nuxtApp.ssrContext) {
      nuxtApp.ssrContext.res.statusCode = 404;
    } else {
      const currentURL = to.fullPath || "/";
      if (!isEqual(currentURL, initialURL)) {
        await callWithNuxt(nuxtApp, navigateTo, [currentURL]);
      }
    }
  });
  nuxtApp.hooks.hookOnce("app:created", async () => {
    try {
      await router.replace({
        ...router.resolve(initialURL),
        name: void 0,
        force: true
      });
    } catch (error2) {
      callWithNuxt(nuxtApp, throwError, [error2]);
    }
  });
  return { provide: { router } };
});
const _plugins = [
  preload,
  _47Users_47bonn_47Documents_47GitHub_47nuxt_45app_47_46nuxt_47components_46plugin_46mjs,
  _47Users_47bonn_47Documents_47GitHub_47nuxt_45app_47node_modules_47nuxt_47dist_47head_47runtime_47lib_47vueuse_45head_46plugin,
  _47Users_47bonn_47Documents_47GitHub_47nuxt_45app_47node_modules_47nuxt_47dist_47head_47runtime_47plugin,
  _47Users_47bonn_47Documents_47GitHub_47nuxt_45app_47node_modules_47nuxt_47dist_47pages_47runtime_47router
];
const _sfc_main$1 = {
  __name: "nuxt-root",
  __ssrInlineRender: true,
  setup(__props) {
    const ErrorComponent = vue_cjs_prod.defineAsyncComponent(() => import('./error-component.79b5bde8.mjs'));
    const nuxtApp = useNuxtApp();
    nuxtApp.hooks.callHookWith((hooks) => hooks.map((hook) => hook()), "vue:setup");
    const error = useError();
    vue_cjs_prod.onErrorCaptured((err, target, info) => {
      nuxtApp.hooks.callHook("vue:error", err, target, info).catch((hookError) => console.error("[nuxt] Error in `vue:error` hook", hookError));
      {
        callWithNuxt(nuxtApp, throwError, [err]);
      }
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_App = vue_cjs_prod.resolveComponent("App");
      serverRenderer.exports.ssrRenderSuspense(_push, {
        default: () => {
          if (vue_cjs_prod.unref(error)) {
            _push(serverRenderer.exports.ssrRenderComponent(vue_cjs_prod.unref(ErrorComponent), { error: vue_cjs_prod.unref(error) }, null, _parent));
          } else {
            _push(serverRenderer.exports.ssrRenderComponent(_component_App, null, null, _parent));
          }
        },
        _: 1
      });
    };
  }
};
const _sfc_setup$1 = _sfc_main$1.setup;
_sfc_main$1.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("node_modules/nuxt/dist/app/components/nuxt-root.vue");
  return _sfc_setup$1 ? _sfc_setup$1(props, ctx) : void 0;
};
const _sfc_main = {};
function _sfc_ssrRender(_ctx, _push, _parent, _attrs) {
  const _component_NuxtPage = vue_cjs_prod.resolveComponent("NuxtPage");
  _push(`<div${serverRenderer.exports.ssrRenderAttrs(_attrs)}>`);
  _push(serverRenderer.exports.ssrRenderComponent(_component_NuxtPage, null, null, _parent));
  _push(`</div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = vue_cjs_prod.useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("app.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const AppComponent = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
if (!globalThis.$fetch) {
  globalThis.$fetch = $fetch$1.create({
    baseURL: baseURL()
  });
}
let entry;
const plugins = normalizePlugins(_plugins);
{
  entry = async function createNuxtAppServer(ssrContext) {
    const vueApp = vue_cjs_prod.createApp(_sfc_main$1);
    vueApp.component("App", AppComponent);
    const nuxt = createNuxtApp({ vueApp, ssrContext });
    try {
      await applyPlugins(nuxt, plugins);
      await nuxt.hooks.callHook("app:created", vueApp);
    } catch (err) {
      await nuxt.callHook("app:error", err);
      ssrContext.error = ssrContext.error || err;
    }
    return vueApp;
  };
}
const entry$1 = (ctx) => entry(ctx);

export { PageTypes as P, _sfc_main$4 as _, _export_sfc as a, useHead as b, __nuxt_component_0 as c, entry$1 as default, useFetch as u };
//# sourceMappingURL=server.mjs.map
