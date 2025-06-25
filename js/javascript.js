const alertPlaceholder = document.getElementById('liveAlertPlaceholder')
const appendAlert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert" data-bs-theme="dark">`,
        `   <div>${message}</div>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    alertPlaceholder.append(wrapper)
}

document.getElementById('1')?.addEventListener('click', () => {
    appendAlert('TERREMOTO, CUIDADO!', 'danger')
})

document.getElementById('2')?.addEventListener('click', () => {
    appendAlert('🚧 Zona de risco à frente. Prossiga com cautela.', 'danger')
})

document.getElementById('3')?.addEventListener('click', () => {
    appendAlert('✅ Situação sob controle. Nenhum perigo detectado.', 'danger')
})

let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop) {
        // rolando para baixo
        navbar.style.top = '-80px'; // Esconde
    } else {
        // rolando para cima
        navbar.style.top = '0'; // Mostra
    }

    lastScrollTop = scrollTop <= 0 ? 0 : scrollTop; // evita valor negativo
});

//
// SmoothScroll for websites v1.4.10 (Balazs Galambosi)
// http://www.smoothscroll.net/
//
// Licensed under the terms of the MIT license.
//
// You may use it in your theme if you credit me. 
// It is also free to use on any individual website.
//
// Exception:
// The only restriction is to not publish any  
// extension for browsers or native application
// without getting a written permission first.
//

(function () {

    // Scroll Variables (tweakable)
    var defaultOptions = {

        // Scrolling Core
        frameRate: 150, // [Hz]
        animationTime: 600, // [ms]
        stepSize: 100, // [px]

        // Pulse (less tweakable)
        // ratio of "tail" to "acceleration"
        pulseAlgorithm: true,
        pulseScale: 4,
        pulseNormalize: 1,

        // Acceleration
        accelerationDelta: 50,  // 50
        accelerationMax: 3,   // 3

        // Keyboard Settings
        keyboardSupport: true,  // option
        arrowScroll: 50,    // [px]

        // Other
        fixedBackground: true,
        excluded: ''
    };

    var options = defaultOptions;


    // Other Variables
    var isExcluded = false;
    var isFrame = false;
    var direction = { x: 0, y: 0 };
    var initDone = false;
    var root = document.documentElement;
    var activeElement;
    var observer;
    var refreshSize;
    var deltaBuffer = [];
    var deltaBufferTimer;
    var isMac = /^Mac/.test(navigator.platform);

    var key = {
        left: 37, up: 38, right: 39, down: 40, spacebar: 32,
        pageup: 33, pagedown: 34, end: 35, home: 36
    };
    var arrowKeys = { 37: 1, 38: 1, 39: 1, 40: 1 };

    /***********************************************
     * INITIALIZE
     ***********************************************/

    /**
     * Tests if smooth scrolling is allowed. Shuts down everything if not.
     */
    function initTest() {
        if (options.keyboardSupport) {
            addEvent('keydown', keydown);
        }
    }

    /**
     * Sets up scrolls array, determines if frames are involved.
     */
    function init() {

        if (initDone || !document.body) return;

        initDone = true;

        var body = document.body;
        var html = document.documentElement;
        var windowHeight = window.innerHeight;
        var scrollHeight = body.scrollHeight;

        // check compat mode for root element
        root = (document.compatMode.indexOf('CSS') >= 0) ? html : body;
        activeElement = body;

        initTest();

        // Checks if this script is running in a frame
        if (top != self) {
            isFrame = true;
        }

        /**
         * Safari 10 fixed it, Chrome fixed it in v45:
         * This fixes a bug where the areas left and right to 
         * the content does not trigger the onmousewheel event
         * on some pages. e.g.: html, body { height: 100% }
         */
        else if (isOldSafari &&
            scrollHeight > windowHeight &&
            (body.offsetHeight <= windowHeight ||
                html.offsetHeight <= windowHeight)) {

            var fullPageElem = document.createElement('div');
            fullPageElem.style.cssText = 'position:absolute; z-index:-10000; ' +
                'top:0; left:0; right:0; height:' +
                root.scrollHeight + 'px';
            document.body.appendChild(fullPageElem);

            // DOM changed (throttled) to fix height
            var pendingRefresh;
            refreshSize = function () {
                if (pendingRefresh) return; // could also be: clearTimeout(pendingRefresh);
                pendingRefresh = setTimeout(function () {
                    if (isExcluded) return; // could be running after cleanup
                    fullPageElem.style.height = '0';
                    fullPageElem.style.height = root.scrollHeight + 'px';
                    pendingRefresh = null;
                }, 500); // act rarely to stay fast
            };

            setTimeout(refreshSize, 10);

            addEvent('resize', refreshSize);

            // TODO: attributeFilter?
            var config = {
                attributes: true,
                childList: true,
                characterData: false
                // subtree: true
            };

            observer = new MutationObserver(refreshSize);
            observer.observe(body, config);

            if (root.offsetHeight <= windowHeight) {
                var clearfix = document.createElement('div');
                clearfix.style.clear = 'both';
                body.appendChild(clearfix);
            }
        }

        // disable fixed background
        if (!options.fixedBackground && !isExcluded) {
            body.style.backgroundAttachment = 'scroll';
            html.style.backgroundAttachment = 'scroll';
        }
    }

    /**
     * Removes event listeners and other traces left on the page.
     */
    function cleanup() {
        observer && observer.disconnect();
        removeEvent(wheelEvent, wheel);
        removeEvent('mousedown', mousedown);
        removeEvent('keydown', keydown);
        removeEvent('resize', refreshSize);
        removeEvent('load', init);
    }


    /************************************************
     * SCROLLING 
     ************************************************/

    var que = [];
    var pending = false;
    var lastScroll = Date.now();

    /**
     * Pushes scroll actions to the scrolling queue.
     */
    function scrollArray(elem, left, top) {

        directionCheck(left, top);

        if (options.accelerationMax != 1) {
            var now = Date.now();
            var elapsed = now - lastScroll;
            if (elapsed < options.accelerationDelta) {
                var factor = (1 + (50 / elapsed)) / 2;
                if (factor > 1) {
                    factor = Math.min(factor, options.accelerationMax);
                    left *= factor;
                    top *= factor;
                }
            }
            lastScroll = Date.now();
        }

        // push a scroll command
        que.push({
            x: left,
            y: top,
            lastX: (left < 0) ? 0.99 : -0.99,
            lastY: (top < 0) ? 0.99 : -0.99,
            start: Date.now()
        });

        // don't act if there's a pending queue
        if (pending) {
            return;
        }

        var scrollRoot = getScrollRoot();
        var isWindowScroll = (elem === scrollRoot || elem === document.body);

        // if we haven't already fixed the behavior, 
        // and it needs fixing for this sesh
        if (elem.$scrollBehavior == null && isScrollBehaviorSmooth(elem)) {
            elem.$scrollBehavior = elem.style.scrollBehavior;
            elem.style.scrollBehavior = 'auto';
        }

        var step = function (time) {

            var now = Date.now();
            var scrollX = 0;
            var scrollY = 0;

            for (var i = 0; i < que.length; i++) {

                var item = que[i];
                var elapsed = now - item.start;
                var finished = (elapsed >= options.animationTime);

                // scroll position: [0, 1]
                var position = (finished) ? 1 : elapsed / options.animationTime;

                // easing [optional]
                if (options.pulseAlgorithm) {
                    position = pulse(position);
                }

                // only need the difference
                var x = (item.x * position - item.lastX) >> 0;
                var y = (item.y * position - item.lastY) >> 0;

                // add this to the total scrolling
                scrollX += x;
                scrollY += y;

                // update last values
                item.lastX += x;
                item.lastY += y;

                // delete and step back if it's over
                if (finished) {
                    que.splice(i, 1); i--;
                }
            }

            // scroll left and top
            if (isWindowScroll) {
                window.scrollBy(scrollX, scrollY);
            }
            else {
                if (scrollX) elem.scrollLeft += scrollX;
                if (scrollY) elem.scrollTop += scrollY;
            }

            // clean up if there's nothing left to do
            if (!left && !top) {
                que = [];
            }

            if (que.length) {
                requestFrame(step, elem, (1000 / options.frameRate + 1));
            } else {
                pending = false;
                // restore default behavior at the end of scrolling sesh
                if (elem.$scrollBehavior != null) {
                    elem.style.scrollBehavior = elem.$scrollBehavior;
                    elem.$scrollBehavior = null;
                }
            }
        };

        // start a new queue of actions
        requestFrame(step, elem, 0);
        pending = true;
    }


    /***********************************************
     * EVENTS
     ***********************************************/

    /**
     * Mouse wheel handler.
     * @param {Object} event
     */
    function wheel(event) {

        if (!initDone) {
            init();
        }

        var target = event.target;

        // leave early if default action is prevented   
        // or it's a zooming event with CTRL 
        if (event.defaultPrevented || event.ctrlKey) {
            return true;
        }

        // leave embedded content alone (flash & pdf)
        if (isNodeName(activeElement, 'embed') ||
            (isNodeName(target, 'embed') && /\.pdf/i.test(target.src)) ||
            isNodeName(activeElement, 'object') ||
            target.shadowRoot) {
            return true;
        }

        var deltaX = -event.wheelDeltaX || event.deltaX || 0;
        var deltaY = -event.wheelDeltaY || event.deltaY || 0;

        if (isMac) {
            if (event.wheelDeltaX && isDivisible(event.wheelDeltaX, 120)) {
                deltaX = -120 * (event.wheelDeltaX / Math.abs(event.wheelDeltaX));
            }
            if (event.wheelDeltaY && isDivisible(event.wheelDeltaY, 120)) {
                deltaY = -120 * (event.wheelDeltaY / Math.abs(event.wheelDeltaY));
            }
        }

        // use wheelDelta if deltaX/Y is not available
        if (!deltaX && !deltaY) {
            deltaY = -event.wheelDelta || 0;
        }

        // line based scrolling (Firefox mostly)
        if (event.deltaMode === 1) {
            deltaX *= 40;
            deltaY *= 40;
        }

        var overflowing = overflowingAncestor(target);

        // nothing to do if there's no element that's scrollable
        if (!overflowing) {
            // except Chrome iframes seem to eat wheel events, which we need to 
            // propagate up, if the iframe has nothing overflowing to scroll
            if (isFrame && isChrome) {
                // change target to iframe element itself for the parent frame
                Object.defineProperty(event, "target", { value: window.frameElement });
                return parent.wheel(event);
            }
            return true;
        }

        // check if it's a touchpad scroll that should be ignored
        if (isTouchpad(deltaY)) {
            return true;
        }

        // scale by step size
        // delta is 120 most of the time
        // synaptics seems to send 1 sometimes
        if (Math.abs(deltaX) > 1.2) {
            deltaX *= options.stepSize / 120;
        }
        if (Math.abs(deltaY) > 1.2) {
            deltaY *= options.stepSize / 120;
        }

        scrollArray(overflowing, deltaX, deltaY);
        event.preventDefault();
        scheduleClearCache();
    }

    /**
     * Keydown event handler.
     * @param {Object} event
     */
    function keydown(event) {

        var target = event.target;
        var modifier = event.ctrlKey || event.altKey || event.metaKey ||
            (event.shiftKey && event.keyCode !== key.spacebar);

        // our own tracked active element could've been removed from the DOM
        if (!document.body.contains(activeElement)) {
            activeElement = document.activeElement;
        }

        // do nothing if user is editing text
        // or using a modifier key (except shift)
        // or in a dropdown
        // or inside interactive elements
        var inputNodeNames = /^(textarea|select|embed|object)$/i;
        var buttonTypes = /^(button|submit|radio|checkbox|file|color|image)$/i;
        if (event.defaultPrevented ||
            inputNodeNames.test(target.nodeName) ||
            isNodeName(target, 'input') && !buttonTypes.test(target.type) ||
            isNodeName(activeElement, 'video') ||
            isInsideYoutubeVideo(event) ||
            target.isContentEditable ||
            modifier) {
            return true;
        }

        // [spacebar] should trigger button press, leave it alone
        if ((isNodeName(target, 'button') ||
            isNodeName(target, 'input') && buttonTypes.test(target.type)) &&
            event.keyCode === key.spacebar) {
            return true;
        }

        // [arrwow keys] on radio buttons should be left alone
        if (isNodeName(target, 'input') && target.type == 'radio' &&
            arrowKeys[event.keyCode]) {
            return true;
        }

        var shift, x = 0, y = 0;
        var overflowing = overflowingAncestor(activeElement);

        if (!overflowing) {
            // Chrome iframes seem to eat key events, which we need to 
            // propagate up, if the iframe has nothing overflowing to scroll
            return (isFrame && isChrome) ? parent.keydown(event) : true;
        }

        var clientHeight = overflowing.clientHeight;

        if (overflowing == document.body) {
            clientHeight = window.innerHeight;
        }

        switch (event.keyCode) {
            case key.up:
                y = -options.arrowScroll;
                break;
            case key.down:
                y = options.arrowScroll;
                break;
            case key.spacebar: // (+ shift)
                shift = event.shiftKey ? 1 : -1;
                y = -shift * clientHeight * 0.9;
                break;
            case key.pageup:
                y = -clientHeight * 0.9;
                break;
            case key.pagedown:
                y = clientHeight * 0.9;
                break;
            case key.home:
                if (overflowing == document.body && document.scrollingElement)
                    overflowing = document.scrollingElement;
                y = -overflowing.scrollTop;
                break;
            case key.end:
                var scroll = overflowing.scrollHeight - overflowing.scrollTop;
                var scrollRemaining = scroll - clientHeight;
                y = (scrollRemaining > 0) ? scrollRemaining + 10 : 0;
                break;
            case key.left:
                x = -options.arrowScroll;
                break;
            case key.right:
                x = options.arrowScroll;
                break;
            default:
                return true; // a key we don't care about
        }

        scrollArray(overflowing, x, y);
        event.preventDefault();
        scheduleClearCache();
    }

    /**
     * Mousedown event only for updating activeElement
     */
    function mousedown(event) {
        activeElement = event.target;
    }


    /***********************************************
     * OVERFLOW
     ***********************************************/

    var uniqueID = (function () {
        var i = 0;
        return function (el) {
            return el.uniqueID || (el.uniqueID = i++);
        };
    })();

    var cacheX = {}; // cleared out after a scrolling session
    var cacheY = {}; // cleared out after a scrolling session
    var clearCacheTimer;
    var smoothBehaviorForElement = {};

    //setInterval(function () { cache = {}; }, 10 * 1000);

    function scheduleClearCache() {
        clearTimeout(clearCacheTimer);
        clearCacheTimer = setInterval(function () {
            cacheX = cacheY = smoothBehaviorForElement = {};
        }, 1 * 1000);
    }

    function setCache(elems, overflowing, x) {
        var cache = x ? cacheX : cacheY;
        for (var i = elems.length; i--;)
            cache[uniqueID(elems[i])] = overflowing;
        return overflowing;
    }

    function getCache(el, x) {
        return (x ? cacheX : cacheY)[uniqueID(el)];
    }

    //  (body)                (root)
    //         | hidden | visible | scroll |  auto  |
    // hidden  |   no   |    no   |   YES  |   YES  |
    // visible |   no   |   YES   |   YES  |   YES  |
    // scroll  |   no   |   YES   |   YES  |   YES  |
    // auto    |   no   |   YES   |   YES  |   YES  |

    function overflowingAncestor(el) {
        var elems = [];
        var body = document.body;
        var rootScrollHeight = root.scrollHeight;
        do {
            var cached = getCache(el, false);
            if (cached) {
                return setCache(elems, cached);
            }
            elems.push(el);
            if (rootScrollHeight === el.scrollHeight) {
                var topOverflowsNotHidden = overflowNotHidden(root) && overflowNotHidden(body);
                var isOverflowCSS = topOverflowsNotHidden || overflowAutoOrScroll(root);
                if (isFrame && isContentOverflowing(root) ||
                    !isFrame && isOverflowCSS) {
                    return setCache(elems, getScrollRoot());
                }
            } else if (isContentOverflowing(el) && overflowAutoOrScroll(el)) {
                return setCache(elems, el);
            }
        } while ((el = el.parentElement));
    }

    function isContentOverflowing(el) {
        return (el.clientHeight + 10 < el.scrollHeight);
    }

    // typically for <body> and <html>
    function overflowNotHidden(el) {
        var overflow = getComputedStyle(el, '').getPropertyValue('overflow-y');
        return (overflow !== 'hidden');
    }

    // for all other elements
    function overflowAutoOrScroll(el) {
        var overflow = getComputedStyle(el, '').getPropertyValue('overflow-y');
        return (overflow === 'scroll' || overflow === 'auto');
    }

    // for all other elements
    function isScrollBehaviorSmooth(el) {
        var id = uniqueID(el);
        if (smoothBehaviorForElement[id] == null) {
            var scrollBehavior = getComputedStyle(el, '')['scroll-behavior'];
            smoothBehaviorForElement[id] = ('smooth' == scrollBehavior);
        }
        return smoothBehaviorForElement[id];
    }


    /***********************************************
     * HELPERS
     ***********************************************/

    function addEvent(type, fn, arg) {
        window.addEventListener(type, fn, arg || false);
    }

    function removeEvent(type, fn, arg) {
        window.removeEventListener(type, fn, arg || false);
    }

    function isNodeName(el, tag) {
        return el && (el.nodeName || '').toLowerCase() === tag.toLowerCase();
    }

    function directionCheck(x, y) {
        x = (x > 0) ? 1 : -1;
        y = (y > 0) ? 1 : -1;
        if (direction.x !== x || direction.y !== y) {
            direction.x = x;
            direction.y = y;
            que = [];
            lastScroll = 0;
        }
    }

    if (window.localStorage && localStorage.SS_deltaBuffer) {
        try { // #46 Safari throws in private browsing for localStorage 
            deltaBuffer = localStorage.SS_deltaBuffer.split(',');
        } catch (e) { }
    }

    function isTouchpad(deltaY) {
        if (!deltaY) return;
        if (!deltaBuffer.length) {
            deltaBuffer = [deltaY, deltaY, deltaY];
        }
        deltaY = Math.abs(deltaY);
        deltaBuffer.push(deltaY);
        deltaBuffer.shift();
        clearTimeout(deltaBufferTimer);
        deltaBufferTimer = setTimeout(function () {
            try { // #46 Safari throws in private browsing for localStorage
                localStorage.SS_deltaBuffer = deltaBuffer.join(',');
            } catch (e) { }
        }, 1000);
        var dpiScaledWheelDelta = deltaY > 120 && allDeltasDivisableBy(deltaY); // win64 
        var tp = !allDeltasDivisableBy(120) && !allDeltasDivisableBy(100) && !dpiScaledWheelDelta;
        if (deltaY < 50) return true;
        return tp;
    }

    function isDivisible(n, divisor) {
        return (Math.floor(n / divisor) == n / divisor);
    }

    function allDeltasDivisableBy(divisor) {
        return (isDivisible(deltaBuffer[0], divisor) &&
            isDivisible(deltaBuffer[1], divisor) &&
            isDivisible(deltaBuffer[2], divisor));
    }

    function isInsideYoutubeVideo(event) {
        var elem = event.target;
        var isControl = false;
        if (document.URL.indexOf('www.youtube.com/watch') != -1) {
            do {
                isControl = (elem.classList &&
                    elem.classList.contains('html5-video-controls'));
                if (isControl) break;
            } while ((elem = elem.parentNode));
        }
        return isControl;
    }

    var requestFrame = (function () {
        return (window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            function (callback, element, delay) {
                window.setTimeout(callback, delay || (1000 / 60));
            });
    })();

    var MutationObserver = (window.MutationObserver ||
        window.WebKitMutationObserver ||
        window.MozMutationObserver);

    var getScrollRoot = (function () {
        var SCROLL_ROOT = document.scrollingElement;
        return function () {
            if (!SCROLL_ROOT) {
                var dummy = document.createElement('div');
                dummy.style.cssText = 'height:10000px;width:1px;';
                document.body.appendChild(dummy);
                var bodyScrollTop = document.body.scrollTop;
                var docElScrollTop = document.documentElement.scrollTop;
                window.scrollBy(0, 3);
                if (document.body.scrollTop != bodyScrollTop)
                    (SCROLL_ROOT = document.body);
                else
                    (SCROLL_ROOT = document.documentElement);
                window.scrollBy(0, -3);
                document.body.removeChild(dummy);
            }
            return SCROLL_ROOT;
        };
    })();


    /***********************************************
     * PULSE (by Michael Herf)
     ***********************************************/

    /**
     * Viscous fluid with a pulse for part and decay for the rest.
     * - Applies a fixed force over an interval (a damped acceleration), and
     * - Lets the exponential bleed away the velocity over a longer interval
     * - Michael Herf, http://stereopsis.com/stopping/
     */
    function pulse_(x) {
        var val, start, expx;
        // test
        x = x * options.pulseScale;
        if (x < 1) { // acceleartion
            val = x - (1 - Math.exp(-x));
        } else {     // tail
            // the previous animation ended here:
            start = Math.exp(-1);
            // simple viscous drag
            x -= 1;
            expx = 1 - Math.exp(-x);
            val = start + (expx * (1 - start));
        }
        return val * options.pulseNormalize;
    }

    function pulse(x) {
        if (x >= 1) return 1;
        if (x <= 0) return 0;

        if (options.pulseNormalize == 1) {
            options.pulseNormalize /= pulse_(1);
        }
        return pulse_(x);
    }


    /***********************************************
     * FIRST RUN
     ***********************************************/

    var userAgent = window.navigator.userAgent;
    var isEdge = /Edge/.test(userAgent); // thank you MS
    var isChrome = /chrome/i.test(userAgent) && !isEdge;
    var isSafari = /safari/i.test(userAgent) && !isEdge;
    var isMobile = /mobile/i.test(userAgent);
    var isIEWin7 = /Windows NT 6.1/i.test(userAgent) && /rv:11/i.test(userAgent);
    var isOldSafari = isSafari && (/Version\/8/i.test(userAgent) || /Version\/9/i.test(userAgent));
    var isEnabledForBrowser = (isChrome || isSafari || isIEWin7) && !isMobile;

    var supportsPassive = false;
    try {
        window.addEventListener("test", null, Object.defineProperty({}, 'passive', {
            get: function () {
                supportsPassive = true;
            }
        }));
    } catch (e) { }

    var wheelOpt = supportsPassive ? { passive: false } : false;
    var wheelEvent = 'onwheel' in document.createElement('div') ? 'wheel' : 'mousewheel';

    if (wheelEvent && isEnabledForBrowser) {
        addEvent(wheelEvent, wheel, wheelOpt);
        addEvent('mousedown', mousedown);
        addEvent('load', init);
    }


    /***********************************************
     * PUBLIC INTERFACE
     ***********************************************/

    function SmoothScroll(optionsToSet) {
        for (var key in optionsToSet)
            if (defaultOptions.hasOwnProperty(key))
                options[key] = optionsToSet[key];
    }
    SmoothScroll.destroy = cleanup;

    if (window.SmoothScrollOptions) // async API
        SmoothScroll(window.SmoothScrollOptions);

    if (typeof define === 'function' && define.amd)
        define(function () {
            return SmoothScroll;
        });
    else if ('object' == typeof exports)
        module.exports = SmoothScroll;
    else
        window.SmoothScroll = SmoothScroll;

})();

function mostrarTexto1() {
    document.getElementById('tex1').innerHTML = `<h2>Descrição:</h2><q>Tente se aproximar deste dragão... se conseguir encontrar um. Seu hálito tóxico e
					sua cauda afiada os tornam perigosos de cima a baixo!
					Não chegue muito perto! Este dragão respira toxinas em seus inimigos. Que mau hálito!</q>`;
}

function mostrarTexto2() {
    document.getElementById('tex1').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Chifre no focinho</li>
					<li>Espinhos afiados</li>
					<li>Espinhos na borda das asas</li>
					<li>Escamas reflexivas</li>
				</ul>`;
}

function mostrarTexto3() {
    document.getElementById('tex1').innerHTML = `<h2>Habilidades:</h2>
				<ul>
                <li>Tipo de fogo: Fogo azul brilhante</li>
					<li>Cauda preênsil afiada e telescópica que pode ser usada como chicote</li>
					<li>Preciso e facilmente manobrável em voo</li>
					<li>Lágrimas venenosas</li>
					<li>Farpas de cauda disparadas</li>
					<li>Escamas semelhantes a armaduras</li>
				</ul>`;
}

function mostrarTexto01() {
    document.getElementById('tex1').innerHTML = ``;
}

function mostrarTextoAlert1() {
    document.getElementById('tex1').innerHTML = `<div class="alert alert-danger" role="alert">
EXTREMAMENTE PERIGOSO, MATAR NA HORA!
</div>`;
}

function mostrarTexto4() {
    document.getElementById('tex2').innerHTML = `<h2>Descrição:</h2>
<q>Terremotos Catastróficos são conhecidos por suas atitudes cruéis. Eles não deixam ninguém atrapalhar e fazem de tudo para causar estragos em seus alvos.
Terremotos Catastróficos comem mais pedras do que qualquer outro da sua classe! Eles também têm o péssimo hábito de cuspir pedras digeridas nos atacantes na forma de lava incandescente!</q>`;
}

function mostrarTexto5() {
    document.getElementById('tex2').innerHTML = `<h2>Características:</h2><ul><li>Cheio de espinhos</li><li>Mandíbula
triplamente dividida</li><li>Pele
dura como rocha</li></ul>`;
}

function mostrarTexto6() {
    document.getElementById('tex2').innerHTML = `<h2>Habilidades:</h2><ul>
    <li>Tipo de tiro:
					Baba de magma de mandíbulas trifurcadas</li>
					<li>Enrolando-se em uma pedra,
						criando uma onda de choque</li>
				</ul>`;
}

function mostrarTexto02() {
    document.getElementById('tex2').innerHTML = ``;
}

function mostrarTextoAlert2() {
    document.getElementById('tex2').innerHTML = `<div class="alert alert-danger" role="alert">
DEMONIO POR TRÁS DOS TREMORES DA TERRA, EXTREMAMENTE PERIGOSO, MATAR NA HORA!
</div>`;
}

function mostrarTexto7() {
    document.getElementById('tex3').innerHTML = `<h2>Descrições:</h2><q>Embora os Goregutters tenham conjuntos impressionantes de chifres e caudas em forma de
machado, eles são mais gentis do que aparentam e gostam de ficar em paz. Em batalha, porém, eles têm a
capacidade de cuspir lava derretida em seus chifres antes de atacar os oponentes com força
impetuosa.</q>`;
}

function mostrarTexto8() {
    document.getElementById('tex3').innerHTML = `<h2>Características:</h2>
<ul>
<li>Chifres metálicos semelhantes aos de alce</li>
<li>Cauda em forma de machado</li>
<li>Espinhos em forma de rocha</li>
</ul>`;
}

function mostrarTexto9() {
    document.getElementById('tex3').innerHTML = `<h2>Habilidades:</h2>
<ul>
<li>Tipo de tiro: Lava derretida</li>
<li>Chifres flamejantes</li>
<li>Chamado ensurdecedor</li>
</ul>`;
}

function mostrarTexto03() {
    document.getElementById('tex3').innerHTML = ``;
}

function mostrarTextoAlert3() {
    document.getElementById('tex3').innerHTML = `<div class="alert alert-success" role="alert">
ESTE DRAGÃO... é de boa, simpatico, NÃO O MACHUQUE!
</div>`;
}

function mostrarTexto10() {
    document.getElementById('tex4').innerHTML = `<h2>Descrições:</h2><q>A temperatura corporal de Eruptodon está diretamente ligada à sua experiência.
				Quando
				seu poder atinge o pico, sua pele brilha.
				Embora não seja um guerreiro, este dragão libera uma violência explosiva quando em apuros. Quase imune a
				danos causados pelo calor, é uma força imensa a ser reconhecida.</q>`;
}

function mostrarTexto11() {
    document.getElementById('tex4').innerHTML = `<h2>Características:</h2>
			<ul>
				<li>Lóbulos pontiagudos e saliências nas costas e na cauda</li>
				<li>Cabeça grande e redonda</li>
				<li>Pernas
					dianteiras minúsculas</li>
			</ul>`;
}

function mostrarTexto12() {
    document.getElementById('tex4').innerHTML = `<h2>Habilidades:</h2>
			<ul>
            <li>Tipo de tiro:
					Explosão de lava em grande escala</li>
				<li>Escavação na crosta de um vulcão adormecido</li>
				<li>Ingestão de grandes quantidades de lava</li>
				<li>Paragem e causação de erupções vulcânicas</li>
				<li>Pele à prova de lava</li>
				<li>Saliva resistente ao calor</li>
			</ul>`;
}

function mostrarTexto04() {
    document.getElementById('tex4').innerHTML = ``;
}

function mostrarTextoAlert4() {
    document.getElementById('tex4').innerHTML = `<div class="alert alert-warning" role="alert">
ENORME E PODEROSO, UM VULCÃO AMBULANTE COM ASAS, POREM... é docil, NÃO O MACHUQUE!
</div>`;
}

function mostrarTexto13() {
    document.getElementById('tex5').innerHTML = `<h2>Descrição:</h2><q>Embora cegos, os Sentinelas ainda vigiam de perto o Cemitério dos Dragões na Ilha de
				Vanaheim.
				Esses enormes e pétreos Dragões demonstram pouca fraqueza, mas uma mente astuta pode explorar sua
				cegueira. Mas cuidado: eles têm um olfato apurado.</q>`;
}


function mostrarTexto14() {
    document.getElementById('tex5').innerHTML = `<h2>Características:</h2>
			<ul>
				<li>Corpo grande coberto por camadas epidérmicas e escamas duras semelhantes a rochas.</li>
				<li>Cauda arredondada.</li>
			</ul>`;
}

function mostrarTexto15() {
    document.getElementById('tex5').innerHTML = `<h2>Habilidades:</h2>
			<ul>
            <li>Tipo de tiro: Fogo de pira funerária/Grito sônico</li>
				<li>Explosões de asas</li>
				<li>Permanecer imóvel por dias a fio</li>
				<li>Sentidos extremamente desenvolvidos, exceto a visão</li>
				<li>Hibernação</li>
			</ul>`;
}

function mostrarTexto05() {
    document.getElementById('tex5').innerHTML = ``;
}

function mostrarTextoAlert5() {
    document.getElementById('tex5').innerHTML = `<div class="alert alert-success" role="alert">
PODE PARECER QUE ESTA DORMINDO, e realmente ele deve estar, NÃO O MACHUQUE!
</div>`;
}

function mostrarTexto16() {
    document.getElementById('tex6').innerHTML = `<h2>Descrição:</h2><q>Nascido a cada cem anos ou mais, o Screaming Death tem todas as forças de seu primo
				subordinado, o Whispering Death, sem nenhuma de suas fraquezas.
				É o dragão mais poderoso que Berk enfrentou desde o Red Death . Ao contrário do Whispering Death , este
				dragão não tem aversão à luz do sol. Na verdade, os jovens Screaming Deaths são atraídos pela luz
				brilhante. A atração pela luz desaparece à medida que o dragão envelhece. Ele atira grandes espinhos de
				sua cauda e pode cuspir grandes quantidades de fogo em uma única explosão, mas a verdadeira força do
				Screaming Death é seu apetite insaciável. Como o Whispering Death, o Screaming Death gosta de túneis,
				consumindo pilhas do mar e dizimando ilhas inteiras. Um adolescente Screaming Death quase destruiu a
				cidade de Berk, e quando chegou à idade adulta, quase comeu toda a Dragon Island (junto com outras cinco
				ilhas antes disso). Você não pode realmente derrotar o Screaming Death. É muito rápido, muito bravo,
				muito poderoso. O melhor que você pode esperar é encontrar uma maneira de atraí-lo para outro lugar. Os
				Screaming Deaths SEMPRE retornam ao seu local de nascimento para fazer o ninho.
				Apesar das distâncias que os separam, os Screaming Deaths permanecem extremamente conscientes do
				bem-estar de suas mães Whispering Deaths. Portanto, se você quiser manter a simpatia de um Screaming
				Death, não insulte sua mãe!</q>`;
}

function mostrarTexto17() {
    document.getElementById('tex6').innerHTML = `<h2>Características:</h2>
			<ul>
				<li>
					Corpo longo semelhante ao de uma cobra</li>
				<li>Boca grande e mastigadora</li>
				<li>Fileiras de dentes</li>
				<li>Asas pequenas</li>
				<li>Babados espinhosos ao longo da barriga</li>
				<li>Espinhos vermelhos na cabeça</li>
				<li>Camadas expansíveis de babados espinhosos no pescoço</li>
				<li>Escamas ásperas</li>
			</ul>`;
}

function mostrarTexto18() {
    document.getElementById('tex6').innerHTML = `<h2>Habilidades:</h2>
			<ul>
            <li>Tipo de tiro: Lança anéis concêntricos de bolas de fogo , cuspindo várias bolas de fogo em um único tiro.</li>
				<li>Tiro na espinha</li>
				<li>Grito desorientador</li>
				<li>Túnel</li>
				<li>Várias rodadas de bolas de fogo</li>
			</ul>`;
}

function mostrarTexto06() {
    document.getElementById('tex6').innerHTML = ``;
}

function mostrarTextoAlert6() {
    document.getElementById('tex6').innerHTML = `<div class="alert alert-danger" role="alert">
ESTE DRAGÃO É A CRIAÇÃO MALIGNA DA MORTE, NÃO SE APROXIME, VOCÊ JAMAS PODERA VENCE-LO!
</div>`;
}

function mostrarTexto19() {
    document.getElementById('tex7').innerHTML = `<h2>Descrição:</h2>
				<q>Este necrófago da Classe Mistério se cobre de ossos para proteger seu corpo delicado. Sua escolha de armadura o torna impopular entre outros Dragões!
O Quebra-Ossos está bem protegido em sua armadura enquanto se aproxima e dispara um potente jato de fogo contra seus oponentes em fuga.</q>`;
}

function mostrarTexto20() {
    document.getElementById('tex7').innerHTML = `<h2>Características:</h2>
				<ul><li>Armadura óssea</li><li>Cauda em forma de clava</li></ul>`;
}

function mostrarTexto21() {
    document.getElementById('tex7').innerHTML = `<h2>Habilidades:</h2>
				<ul><li>Tipo de fogo:
Chamas ondulantes</li><li>Armadura de osso</li><li>Rugido estrondoso</li></ul>`;
}

function mostrarTexto07() {
    document.getElementById('tex7').innerHTML = ``;
}

function mostrarTextoAlert7() {
    document.getElementById('tex7').innerHTML = `<div class="alert alert-danger" role="alert">
ROUBA OSSOS PARA SI, E ADIVINHA, VC TEM BELOS OSSOS, EXTREMAMENTE PERIGOSO!
`;
}

function mostrarTexto22() {
    document.getElementById('tex8').innerHTML = `<h2>Descrição:</h2><q>Não se deixe enganar pelo seu comportamento dócil! Considerado extinto, este dragão
				já enorme dobrará de tamanho e se tornará extremamente agressivo se for removido de sua fonte de
				alimento.
				Em batalha (ou longe de sua comida), este dragão pode inchar e revelar espinhos que o cobrem da cabeça à
				cauda. Se não estiver explodindo esses espinhos, estará cuspindo chamas...</q>`;
}

function mostrarTexto23() {
    document.getElementById('tex8').innerHTML = `<h2>Características:</h2>
			<ul><li>Corpo blindado</li><li>Chifres semelhantes aos de carneiro</li><li>Pequenas fileiras de espinhos ao longo das costas</li><li>Pernas curtas</li></ul>`;
}

function mostrarTexto24() {
    document.getElementById('tex8').innerHTML = `<h2>Habilidades:</h2>
			<ul><li>Tipo de fogo:
Chamas explosivas</li><li>Inflando seu corpo a um tamanho imenso</li><li>Disparando espinhos de qualquer parte do corpo</li><li>Saliva extremamente potente</li></ul>`;
}

function mostrarTexto08() {
    document.getElementById('tex8').innerHTML = ``;
}

function mostrarTextoAlert8() {
    document.getElementById('tex8').innerHTML = `<div class="alert alert-success" role="alert">
coisa fofa, cute cute, não se deixe enganar ele é perigoso, mas é fofo`
}

function mostrarTexto25() {
    document.getElementById('tex9').innerHTML = `<h2>Descrição:</h2><q>Este especialista em camuflagem da Classe Mistério é capaz de disparar ácido
					corrosivo quente capaz de queimar madeira e rocha (e vikings!).
					A Asa Transformadora distrai oponentes à distância enquanto lança bolas de ácido em sua direção.</q>`;
}

function mostrarTexto26() {
    document.getElementById('tex9').innerHTML = `<h2>Características:</h2><ul><li>Chifres laterais projetando-se da cabeça</li><li>Antenas com lóbulos em forma de folha</li><li>Mordida inferior
Corno nasal</li></ul>`;
}

function mostrarTexto27() {
    document.getElementById('tex9').innerHTML = `<h2>Habilidades:</h2>
				<ul><li>Tipo de fogo:
Ácido quente, corrosivo e viscoso que pode queimar madeira, rocha e metal à prova de dragões</li><li>Camuflagem</li><li>Cauda preênsil</li><li>Hipnose</li><li>Imunidade ao próprio ácido</li></ul>`;
}

function mostrarTexto09() {
    document.getElementById('tex9').innerHTML = ``;
}

function mostrarTextoAlert9() {
    document.getElementById('tex9').innerHTML = `<div class="alert alert-danger" role="alert">
CUIDADO, VOCÊ NÃO PODE VE-LO, MAS ELE PODE VER VOCÊ, MATAR NA HORA!`;
}

function mostrarTexto28() {
    document.getElementById('tex10').innerHTML = `<h2>Descrição:</h2><q>Este Dragão usa seu chamado melódico para atrair seus alvos para as densas selvas
					da Ilha da Melodia. Lá, ele pode observá-los enquanto eles buscam a fonte da música.</q>`;
}

function mostrarTexto29() {
    document.getElementById('tex10').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Asas coloridas</li>
					<li>Barbatanas na cabeça</li>
					<li>Longos espinhos ao longo das costas</li>
					<li>Chifres longos</li>
					<li>Barbelas</li>
				</ul>`;
}

function mostrarTexto30() {
    document.getElementById('tex10').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo:
						Substância semelhante ao âmbar que endurece rapidamente</li>
					<li>Canção de atração semelhante a uma sereia</li>
					<li>Imunidade a enguias</li>
					<li>Imunidade às suas próprias canções de atração</li>
				</ul>`;
}

function mostrarTexto110() {
    document.getElementById('tex10').innerHTML = ``;
}

function mostrarTextoAlert010() {
    document.getElementById('tex10').innerHTML = `<div class="alert alert-danger" role="alert">
SE OUVIR SEU CANTO, VOCÊ ESTÁ MORTO, ESCONDASSE E TAPE OS OUVIDOS!`;
}

function mostrarTexto31() {
    document.getElementById('tex11').innerHTML = `<h2>Descrição:</h2><q>Os Dramillions são frequentemente chamados de papagaios do mundo dos dragões,
					pois essas criaturas misteriosas conseguem reproduzir qualquer tipo de dragão que veem!
					Os Dramillions têm, de longe, o maior número de disparos entre todas as espécies. E se um deles
					ficar sem cio, o resto da matilha compartilha suas reservas!</q>`;
}

function mostrarTexto32() {
    document.getElementById('tex11').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Cabeça pontiaguda</li>
					<li>Membros anteriores pequenos</li>
					<li>Cauda com barbatanas</li>
				</ul>`;
}

function mostrarTexto33() {
    document.getElementById('tex11').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo:
						Fac-símiles flamejantes</li>
					<li>Imitar o fogo de outros dragões</li>
					<li>Compartilhando reservas de fogo</li>
					<li>Camuflagem (apenas Asas de Titã)</li>
				</ul>`;
}

function mostrarTexto011() {
    document.getElementById('tex11').innerHTML = ``;
}

function mostrarTextoAlert11() {
    document.getElementById('tex11').innerHTML = `<div class="alert alert-danger" role="alert">
CUIDADE, ESTE DRAGÃO ATACA EM BANDO, ONDE TEM 1 TEM VÁRIOS, MATAR NA HORA!`;
}

function mostrarTexto34() {
    document.getElementById('tex12').innerHTML = `<h2>Descrição:</h2><q>O voador da Classe Sharp, com suas quatro asas, consegue virar a cabeça tanto que
					consegue enxergar atrás. Você nunca conseguirá se aproximar furtivamente de um Cortador de
					Tempestades!
					Voando com quatro asas, o Cortador de Tempestades esculpe espirais no céu e dispara arcos
					flamejantes de destruição contra seus adversários.</q>`;
}

function mostrarTexto35() {
    document.getElementById('tex12').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Dois pares de asas</li>
					<li>Babados na cabeça</li>
					<li>Rosto "esmagado"</li>
					<li>Três barbatanas na cauda</li>
					<li>Garras em forma de gancho</li>/ul>`;
}

function mostrarTexto36() {
    document.getElementById('tex12').innerHTML = `<h2>Habilidades:</h2>
					<ul>
						<li>Tipo de fogo:
							Toro de fogo sustentado e ardente</li>
						<li>Manobrabilidade e mergulho excepcionais</li>
						<li>Voando para os lados
							Girando a cabeça em cerca de 180°</li>
						<li>Saliva inflamável</li>
					</ul>`;
}

function mostrarTexto012() {
    document.getElementById('tex12').innerHTML = ``;
}

function mostrarTextoAlert12() {
    document.getElementById('tex12').innerHTML = `<div class="alert alert-danger" role="alert">
EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto37() {
    document.getElementById('tex13').innerHTML = `<h2>Descrição:</h2><q>Cuidado, Vikings ! Embora não possam voar, os Ferrões Velozes são os dragões mais
					rápidos em terra ou na água! Suas caudas venenosas podem picar com a mesma rapidez, deixando suas
					vítimas temporariamente paralisadas.</q>`;
}

function mostrarTexto38() {
    document.getElementById('tex13').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Ferrão afiado como navalha</li>
					<li>Listras vermelhas (ferrão de chumbo)</li>
					<li>Barbatana de vela na cabeça</li>
					<li>Pequeno par de asas nas costas</li>
					<li>Pés palmados extensíveis (ferrões de velocidade do arquipélago)</li>
					<li>Estatura semelhante à de um terópode</li>
				</ul>`;
}

function mostrarTexto39() {
    document.getElementById('tex13').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo:
						Explosão ácida</li>
					<li>Picada paralisante</li>
					<li>Visão noturna incrível</li>
					<li>Correr sobre a água</li>
				</ul>`;
}

function mostrarTexto013() {
    document.getElementById('tex13').innerHTML = ``;
}

function mostrarTextoAlert13() {
    document.getElementById('tex13').innerHTML = `<div class="alert alert-danger" role="alert">
EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto40() {
    document.getElementById('tex14').innerHTML = `<h2>Descrição:</h2><q> Arisco e protetor, este planador gracioso da Classe Afiada pode cortar árvores
				enormes com suas asas largas e ultraafiadas. Madeira!
				As asas do poderoso Timberjack podem absorver uma grande quantidade de dano enquanto ele se prepara para
				liberar seu ataque de nova de fogo!</q>`;
}

function mostrarTexto41() {
    document.getElementById('tex14').innerHTML = `<h2>Características:</h2>
			<ul>
				<li>Enormes asas afiadas</li>
				<li>Sem pernas</li>
				<li>Chifres longos e retorcidos</li>
				<li>Corpo e pescoço delgados</li>
				<li>Gavinhas sob o queixo</li>
			</ul>`;
}

function mostrarTexto42() {
    document.getElementById('tex14').innerHTML = `<h2>Habilidades:</h2>
			<ul>
				<li>Tipo de fogo: Fogo à base de óleo</li>
				<li>Ataque de nova de fogo com fatia de asa</li>
				<li>Usando suas asas enormes como escudos</li>
			</ul>`;
}

function mostrarTexto014() {
    document.getElementById('tex14').innerHTML = ``;
}

function mostrarTextoAlert14() {
    document.getElementById('tex14').innerHTML = `<div class="alert alert-danger" role="alert">
EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto43() {
    document.getElementById('tex15').innerHTML = `<h2>Descrição:</h2><q>Um dragão da classe Rastreador, vaidoso e agressivo, que atira espinhos. Seu olfato
				apurado compensa o ponto cego bem na frente do seu nariz.
				O Nadder Mortal ataca à distância, sempre se mantendo fora do alcance enquanto lança bolas de fogo
				contra os oponentes.</q>`;
}

function mostrarTexto44() {
    document.getElementById('tex15').innerHTML = `<h2>Características:</h2>
			<ul>
				<li>Corno nasal</li>
				<li>Coroa pontiaguda</li>
				<li>Cauda
					espinhosa</li>
				<li>Mandíbula
					superior em forma de bico</li>
				<li>Sobremordida</li>
			</ul>`;
}

function mostrarTexto45() {
    document.getElementById('tex15').innerHTML = `<h2>Habilidades:</h2>
			<ul>
				<li>Tipo de fogo:
					Fogo de magnésio</li>
				<li>Tiro na espinha</li>
				<li>Incrível olfato</li>
				<li>Velocidade aprimorada</li>
				<li>Cauda preênsil</li>
			</ul>`;
}

function mostrarTexto015() {
    document.getElementById('tex15').innerHTML = ``;
}

function mostrarTextoAlert15() {
    document.getElementById('tex15').innerHTML = `<div class="alert alert-danger" role="alert">
EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto016() {
    document.getElementById('tex16').innerHTML = ``;
}

function mostrarTexto46() {
    document.getElementById('tex16').innerHTML = `<h2>Descrição:</h2><q> Um dragão da classe Stoker, teimoso e tenaz. Cuidado com sua Jaqueta de Fogo: ela se
				cobre de chamas ao atacar!
				O Pesadelo Monstruoso ataca seus inimigos com poderosos jatos de fogo.</q>`;
}

function mostrarTexto47() {
    document.getElementById('tex16').innerHTML = `<h2>Características:</h2>
			<ul>
				<li>Asas com garras duplas</li>
				<li>Dois pares de chifres longos</li>
				<li>Espinhos afiados</li>
				<li>Pescoço de cobra</li>
				<li>Cauda de cobra com babados</li>
				<li>Barbilhões</li>
				<li>Chifre nasal</li>
				<li>Gel inflamável na pele</li>
			</ul>`;
}

function mostrarTexto48() {
    document.getElementById('tex16').innerHTML = `<h2>Habilidades:</h2>
			<ul>
				<li>Tipo de fogo:
					Gel de querosene</li>
				<li>
					Autoimolação</li>
				<li>Explosão de asa</li>
				<li>Explosão de mandíbula</li>
				<li>Criando Gel de Pesadelo Monstruoso</li>
			</ul>`;
}

function mostrarTextoAlert16() {
    document.getElementById('tex16').innerHTML = `<div class="alert alert-danger" role="alert">
 EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto017() {
    document.getElementById('tex17').innerHTML = ``;
}

function mostrarTexto49() {
    document.getElementById('tex17').innerHTML = `<h2>Descrição:</h2><q>Esses elusivos Dragões da Classe Stoker podem ser difíceis de lidar! Mas, se
					devidamente treinados, permanecem leais e excelentes dragões de guarda.
					O Terror Noturno prefere lutar ao lado de outros dragões. Mantendo seus oponentes à distância, seu
					tamanho permanece um mistério.</q>`;
}

function mostrarTexto50() {
    document.getElementById('tex17').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Chifre nasal duplo</li>
					<li>Chifre sob o queixo</li>
					<li>Cauda curta e grossa com quatro ou mais pontas curtas e finas</li>
				</ul>`;
}

function mostrarTexto51() {
    document.getElementById('tex17').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo:
						Vários fluxos discretos de fogo de cada dragão se fundem em uma bola de fogo gigante quando em
						formação de bando</li>
					<li>Cria bandos enormes para parecer um dragão maior e assustar predadores</li>
				</ul>`;
}

function mostrarTextoAlert17() {
    document.getElementById('tex17').innerHTML = `<div class="alert alert-danger" role="alert">
 EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto018() {
    document.getElementById('tex18').innerHTML = ``;
}

function mostrarTexto52() {
    document.getElementById('tex18').innerHTML = `<h2>Descrição:</h2><q>Secretamente responsável por séculos de conflitos entre humanos e dragões, a Morte Vermelha usou sua presença dominante para ordenar que outros dragões atacassem aldeias próximas e lhe trouxessem um suprimento constante de comida.
De seu covil nas profundezas da coroa de um vulcão, esta Asa Titânica reinou suprema, até que Banguela liderou Stoico , Bocão e os outros vikings de Berk para as costas devastadas da Ilha do Dragão .
A Morte Vermelha estava tão absorta em poder nessa época que teve que destruir seu lar nas montanhas para emergir e lutar contra esses intrusos humanos. Felizmente, a chegada oportuna dos cavaleiros de dragões de Berk e o fatídico reencontro de Soluço e Banguela levaram à descoberta do único ponto vulnerável da Morte Vermelha: suas entranhas.
Semelhante à habilidade da Besta Perplexa de dobrar outros dragões à sua vontade, a Morte Vermelha emitiu um sinal de retorno que convocou outros dragões para seu ninho coberto de lava. Esse chamado foi produzido por uma combinação de ululação subvocal e o olhar assustador de seus muitos, muitos olhos!</q>`;
}

function mostrarTexto53() {
    document.getElementById('tex18').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Cauda em forma de clava</li>
					<li>Três pares de olhos</li>
                    <li>Tamanho enorme</li>
                    <li>Babado na cabeça</li>
                    <li>Caroços e verrugas por todo o corpo</li>
				</ul>`;
}

function mostrarTexto54() {
    document.getElementById('tex18').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Metano</li>
					<li>Emite sinal de orientação para controlar outros dragões</li>
                    <li>Pele à prova de magma</li>
                    <li>Boca a vácuo</li>
				</ul>`;
}

function mostrarTextoAlert18() {
    document.getElementById('tex19').innerHTML = `<div class="alert alert-danger" role="alert">
 	Todos os dragões têm um ponto cego. Exceto este, não tente lutar, corra e torça para que ele não te veja!`;
}

function mostrarTexto019() {
    document.getElementById('tex19').innerHTML = ``;
}

function mostrarTexto55() {
    document.getElementById('tex19').innerHTML = `<h2>Descrição:</h2><q>É melhor não atrapalhar um Cauda-de-Fogo. Esses dragões territoriais podem cuspir fogo pelas mandíbulas, guelras e caudas!
Aproximar-se furtivamente de um Cauda-de-Sangue já é difícil, mas encontrar seu ponto fraco durante a batalha é quase impossível!</q>`;
}

function mostrarTexto56() {
    document.getElementById('tex19').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Dois conjuntos de asas</li>
					<li>Brânquias</li>
                    <li>Olhos articulados</li>
                    <li>Corpo plano</li>
                    <li>Três fileiras de espinhos ao longo das costas</li>
				</ul>`;
}

function mostrarTexto57() {
    document.getElementById('tex19').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Chamas escarlates</li>
                    <li>Movimento dos olhos</li>
                    <li>Emissão de fogo de diferentes partes do corpo</li>
                    <li>Imunidade à sálvia</li>
				</ul>`;
}

function mostrarTextoAlert19() {
    document.getElementById('tex19').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto020() {
    document.getElementById('tex20').innerHTML = ``;
}

function mostrarTexto55() {
    document.getElementById('tex20').innerHTML = `<h2>Descrição:</h2><q>Notoriamente dramático, este inseguro Dragão da Classe Stoker é conhecido por sua manobra giratória de Ciclone Flamejante em batalha... e no acasalamento!
O Tufãomerangue entra em ação e derrota os inimigos cuspindo jatos de fogo.</q>`;
}

function mostrarTexto56() {
    document.getElementById('tex20').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Asas grandes</li>
					<li>Par de chifres lisos</li>
                    <li>Espinhos ao longo das costas</li>
                    <li>Garras longas e afiadas</li>
				</ul>`;
}

function mostrarTexto57() {
    document.getElementById('tex20').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Jatos ciclônicos de chamas</li>
                    <li>Ciclone em chamas</li>
                    <li>A estocada em saca-rolhas em chamas</li>
                    <li>Imunidade à varíola de enguia Chuva de faíscas Promovendo o crescimento das flores após um ciclone Comer enguias para aumentar o limite de tiro</li>
				</ul>`;
}

function mostrarTextoAlert20() {
    document.getElementById('tex20').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto021() {
    document.getElementById('tex21').innerHTML = ``;
}

function mostrarTexto58() {
    document.getElementById('tex21').innerHTML = `<h2>Descrição:</h2><q>Os Ferrões Letais são dragões venenosos, violentos e vis. Talvez um verdadeiro treinador berkiano possa trazer à tona seu lado mais suave... mas por enquanto: evite-os a todo custo. O monstruoso Deathgripper pode cortar, retalhar e golpear um inimigo com força letal. Eles devem ser evitados a todo custo... a menos que estejam do seu lado.</q>`;
}

function mostrarTexto59() {
    document.getElementById('tex21').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Presas retráteis salientes</li>
					<li>Armadura de placas ao longo das costas</li>
                    <li>Ferrão venenoso embainhado na ponta da cauda telescópica</li>
                    <li>Pinças dentadas</li>
				</ul>`;
}

function mostrarTexto60() {
    document.getElementById('tex21').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Explosões de chamas ácidas raivosas</li>
                    <li>Picada sedativa</li>
                    <li>Dentes venenosos</li>
				</ul>`;
}

function mostrarTextoAlert21() {
    document.getElementById('tex21').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto022() {
    document.getElementById('tex22').innerHTML = ``;
}

function mostrarTexto61() {
    document.getElementById('tex22').innerHTML = `<h2>Descrição:</h2><q>A Fúria da Luz se move tão rápido quanto Banguela e compartilha sua habilidade de se camuflar no céu — mesmo durante o dia.
Com sua coloração branca, a Fúria da Luz se esconde perfeitamente em nuvens, neblina marítima e horizontes distantes. Embora arisca e cética, a Fúria da Luz também compartilha o profundo senso de empatia de Banguela e sempre empunhará sua rajada de plasma para defender qualquer um em necessidade.
Transforma temporariamente cada escama em uma superfície reflexiva que espelha o ambiente da Fúria da Luz, essencialmente tornando-a invisível.</q>`;
}

function mostrarTexto62() {
    document.getElementById('tex22').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Olhos de gato</li>
					<li>Crista longa e fina que percorre a espinha</li>
                    <li>Caudas triangulares</li>
                    <li>Quatro pequenas protuberâncias na cabeça</li>
                    <li>Crista longa e fina nas pernas</li>
				</ul>`;
}

function mostrarTexto63() {
    document.getElementById('tex22').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Cargas plasmáticas em forma de acetileno e oxigênio</li>
                    <li>Camuflagem por meio de rajadas de plasma</li>
                    <li>Camuflagem</li>
                    <li>Voo furtivo</li>
                    <li>Escamas reflexivas</li>
                    <li>Dentes retráteis</li>
                    <li>Bombardeio de mergulho</li>
				</ul>`;
}

function mostrarTextoAlert22() {
    document.getElementById('tex22').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto023() {
    document.getElementById('tex23').innerHTML = ``;
}

function mostrarTexto64() {
    document.getElementById('tex23').innerHTML = `<h2>Descrição:</h2><q>Um choque da Classe Strike, este Dragão está entre os mais temidos. Ele pode invocar raios para disparar rajadas elétricas. Que choque!
Inimigos, cuidado! O Skrill tempestade estimulou o ataque com bolas de raios mais poderosas do que qualquer natural.</q>`;
}

function mostrarTexto65() {
    document.getElementById('tex23').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Espinhos metálicos refinados nas costas</li>
					<li>Garras longas nas asas</li>
                    <li>Coroa pontiaguda na cabeça</li>
                    <li>Quatro pequenas protuberâncias na cabeça</li>
                    <li>Espinhos semelhantes a barbas sob o queixo</li>
				</ul>`;
}

function mostrarTexto66() {
    document.getElementById('tex23').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Relâmpago</li>
                    <li>Eletrocinese</li>
                    <li>Hibernação no gelo</li>
                    <li>Misturar-se com nuvens escuras</li>
                    <li>Montar em raios para atingir velocidades supersônicas</li>
                    <li>Consumo de canto</li>
                    <li>Imunidade a enguias elétricas</li>
				</ul>`;
}

function mostrarTextoAlert23() {
    document.getElementById('tex23').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto024() {
    document.getElementById('tex24').innerHTML = ``;
}

function mostrarTexto67() {
    document.getElementById('tex24').innerHTML = `<h2>Descrição:</h2><q>Este dragão tem uma visão notoriamente ruim e usa sensores térmicos para localizar suas presas. Ele se camufla na neve porque, se não consegue te ver, não quer que você o veja!
O Fantasma da Neve usa sua visão térmica para encontrar suas presas. Então, se a situação esquentar, encontre um pouco de neve para se proteger e se refrescar!</q>`;
}

function mostrarTexto68() {
    document.getElementById('tex24').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Longa saliência sob o queixo</li>
					<li>Espinhos na cauda</li>
                    <li>Língua saliente</li>
                    <li>Par de presas grandes</li>
                    <li>Apêndices longos semelhantes a sobrancelhas</li>
				</ul>`;
}

function mostrarTexto69() {
    document.getElementById('tex24').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Fuzilaria de gelo</li>
                    <li>Visão térmica</li>
                    <li>Adaptado a nevascas</li>
                    <li>Misturando-se à neve</li>
                    <li>Agarrando o gelo com garras afiadas e pontas de cauda</li>
                    <li>Escavando o gelo</li>
				</ul>`;
}

function mostrarTextoAlert24() {
    document.getElementById('tex24').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto025() {
    document.getElementById('tex25').innerHTML = ``;
}

function mostrarTexto70() {
    document.getElementById('tex25').innerHTML = `<h2>Descrição:</h2><q>As três caudas deste dragão gigante da classe Strike podem cortar seus inimigos ou serpentear ao redor de suas presas. Ao se deparar com um, a melhor coisa a fazer é virar as costas e correr!
Cuidado com este dragão, vikings! Uma vez que ele os tenha na mira, é quase impossível se livrar da sua cauda.</q>`;
}

function mostrarTexto71() {
    document.getElementById('tex25').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Três caudas que se unem para formar uma</li>
					<li>Dois apêndices semelhantes a orelhas na cabeça</li>
                    <li>Pinças grandes como antebraços</li>
				</ul>`;
}

function mostrarTexto72() {
    document.getElementById('tex25').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Fluxos contínuos de chamas laranja altamente concentradas</li>
                    <li>Veneno único em cada ferrão</li>
                    <li>Teste de defesa</li>
                    <li>Placas defensivas</li>
                    <li>Cauda preênsil</li>
				</ul>`;
}

function mostrarTextoAlert25() {
    document.getElementById('tex25').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto026() {
    document.getElementById('tex26').innerHTML = ``;
}

function mostrarTexto73() {
    document.getElementById('tex26').innerHTML = `<h2>Descrição:</h2><q>Assim como todos os membros do reino animal, os dragões também devem seguir uma hierarquia de poder e liderança.
No topo dessa cadeia de comando, reina um dragão alfa extremamente raro , diante do qual todos os outros se curvam — a Besta Perplexa. No entanto, as Bestas Perplexas não nascem com esse status alfa; ele é conquistado por meio de combate, vigilância e, mais importante, do desejo de proteger os dragões e todas as outras criaturas em seu ninho. Felizmente para as Bestas Perplexas, existem poucos dragões no mundo que podem igualar sua estatura intimidadora e sequer sonhar em competir pelo título de "rei de todos os dragões".
As Bestas Perplexas também são arquitetos impressionantes, construindo ninhos quase impenetráveis com o gelo que elas mesmas criam e usando fontes termais naturais para fornecer calor e sustento ao rebanho sob seus cuidados. De seu oásis dentro desse casulo gelado, a Besta Perplexa governa todos os dragões sem preconceito, sem malícia e sem questionamentos.</q>`;
}

function mostrarTexto74() {
    document.getElementById('tex26').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Grandes espinhos projetando-se da parte de trás do pescoço</li>
					<li>Dentes pequenos em comparação com a proporção do corpo</li>
                    <li>Escamas semelhantes a corais</li>
                    <li>Barbatanas da cauda</li>
				</ul>`;
}

function mostrarTexto75() {
    document.getElementById('tex26').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Massas de água que congelam com o impacto quando disparadas</li>
                    <li>Dragões controladores da mente</li>
                    <li>Criando ninhos de dragões a partir do gelo que eles mesmos geram</li>
                    <li>Placas defensivas</li>
                    <li>Adaptações subaquáticas</li>
				</ul>`;
}

function mostrarTextoAlert26() {
    document.getElementById('tex26').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto027() {
    document.getElementById('tex27').innerHTML = ``;
}

function mostrarTexto76() {
    document.getElementById('tex27').innerHTML = `<h2>Descrição:</h2><q>Emergindo das profundezas dos mares do Norte, este nadador da Classe Maré ataca os inimigos com jatos fumegantes de água fervente!
Uma barriga cheia de água fervente ensina rapidamente os oponentes a não se aproximarem muito de um Caldeirão furioso em batalha.</q>`;
}

function mostrarTexto77() {
    document.getElementById('tex27').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Pescoço longo</li>
					<li>Dentes pequenos em comparação com a proporção do corpo</li>
                    <li>Cavidade elástica da mandíbula inferior</li>
                    <li>Barbatana caudal em forma de leque</li>
                    <li>Corno nasal</li>
                    <li>Gavinhas longas em forma de bigode</li>
                    <li>Estômago enorme para armazenamento</li>
                    <li>Pés pequenos com garras longas</li>
				</ul>`;
}

function mostrarTexto78() {
    document.getElementById('tex27').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Água fervente</li>
                    <li>Imunidade dos dentes venenosos à eletrorrecepção do oleandro azul</li>
				</ul>`;
}

function mostrarTextoAlert27() {
    document.getElementById('tex27').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto028() {
    document.getElementById('tex28').innerHTML = ``;
}

function mostrarTexto79() {
    document.getElementById('tex28').innerHTML = `<h2>Descrição:</h2><q>Um enorme habitante das profundezas do mar com atributos de crustáceo, o Shellfire desliza pelo oceano a velocidades incríveis e reboca o navio de guerra Dragon Hunter aparafusado em suas costas.
Reminiscente de um caranguejo-ferradura muito maior — muito mais raivoso —, o Shellfire ignora ataques com sua carapaça durável e causa devastação com seus chifres salientes. No passado, marinheiros desavisados ​​costumavam confundir sua concha considerável com uma massa de terra e afundar seus navios nela. Essa foi a última vez que alguém ouviu falar desses marinheiros, mas rumores de sua morte provavelmente deram a Viggo Grimborn a ideia de prender um navio de guerra de metal, caçador de dragões, às costas do Shellfire.
O Shellfire é um gigantesco dragão de águas profundas com Asas de Titã e uma concha traseira dura e plana para proteção.
O Shellfire pode lançar enormes pedras flamejantes que explodem como balas de canhão gigantes.
Não se sabe muito sobre ele; Os vikings do passado distante confundiam a enorme concha com massas de terra e naufragavam seus navios nela.</q>`;
}

function mostrarTexto80() {
    document.getElementById('tex28').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Asas longas, mas proporcionalmente pequenas</li>
					<li>Chifres longos</li>
                    <li>Chifre nasal</li>
                    <li>Armadura dura semelhante a uma carapaça</li>
				</ul>`;
}

function mostrarTexto81() {
    document.getElementById('tex28').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Cargas de plasma do tamanho de balas de canhão</li>
                    <li>Expulsando algas vermelhas das guelras</li>
                    <li>Nadando em grandes profundidades</li>
				</ul>`;
}

function mostrarTextoAlert28() {
    document.getElementById('tex28').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto029() {
    document.getElementById('tex29').innerHTML = ``;
}

function mostrarTexto82() {
    document.getElementById('tex29').innerHTML = `<h2>Descrição:</h2><q>Em terra ou no mar, este boquirroto da Classe Maré possui uma Explosão Sônica forte o suficiente para matar um Viking... ou pelo menos sujar suas calças.
O Tambor Trovejante mantém um curso estável em uma luta enquanto explode os oponentes com um estrondo sônico.</q>`;
}

function mostrarTexto83() {
    document.getElementById('tex29').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Boca expansível</li>
					<li>Pernas pequenas</li>
                    <li>Dois pares de asas</li>
                    <li>Corno nasal</li>
                    <li>Espinhos</li>
				</ul>`;
}

function mostrarTexto84() {
    document.getElementById('tex29').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Sonic explode/bolas de fogo</li>
                    <li>Expulsando o ar do corpo para nadar</li>
                    <li>Ser quase surdo o torna imune ao chamado da Canção da Morte</li>
				</ul>`;
}

function mostrarTextoAlert29() {
    document.getElementById('tex29').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}

function mostrarTexto030() {
    document.getElementById('tex30').innerHTML = ``;
}

function mostrarTexto85() {
    document.getElementById('tex30').innerHTML = `<h2>Descrição:</h2><q>Caríbdis. O Kraken. Serpentes marinhas. Durante séculos, marinheiros assustados contaram histórias de uma fera que poderia virar os próprios oceanos contra eles — se soubessem o quão certos esses mitos estavam! O dragão Submaripper cria redemoinhos criando um vórtice em sua boca e inicia tsunamis quando seu corpo maciço rompe a superfície da água como uma baleia . No entanto, o Submaripper só libera essas defesas quando atacado por vikings tolos e quando encontra seu inimigo natural, o Shellfire !
O Submaripper é um gigantesco dragão marinho profundo que cria redemoinhos e ondas gigantes para trazer presas até suas mandíbulas à espreita.
O Submaripper pode ser reconhecido pelas bolhas distintas e malcheirosas que aparecem quando se aproxima.
Ele reage às vibrações na água acima dele e as segue na esperança de encontrar comida. Normalmente não é um dragão agressivo, mas ataca se ameaçado.
O Submaripper não cospe fogo, mas vomita os destroços que ingeriu, pulverizando os oponentes com detritos cravejados de arpões. Ele também caça presas sentindo suas vibrações na água, tornando o Submaripper o único dragão nas classes Maré e Rastreador !</q>`;
}

function mostrarTexto86() {
    document.getElementById('tex30').innerHTML = `<h2>Características:</h2>
				<ul>
					<li>Pés palmados</li>
					<li>Saliências nas costas</li>
                    <li>Dentes longos e afiados</li>
                    <li>Grande proporção cabeça-corpo</li>
				</ul>`;
}

function mostrarTexto87() {
    document.getElementById('tex30').innerHTML = `<h2>Habilidades:</h2>
				<ul>
					<li>Tipo de fogo: Detritos cravejados de arpões/Bolas de fogo do redemoinho</li>
                    <li>Criando redemoinhos e maremotos</li>
                    <li>Bolhas de gás</li>
				</ul>`;
}

function mostrarTextoAlert30() {
    document.getElementById('tex30').innerHTML = `<div class="alert alert-danger" role="alert">
 	EXTREMAMENTE PERIGOSO, MATAR NA HORA!`;
}