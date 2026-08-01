/* ---- Fit every display equation to its column ----
 *
 * These formulas were written to fit a phone, so none of them should ever need a
 * scrollbar. CSS alone cannot guarantee that: it has no way to ask how wide an
 * equation turned out, so a fixed set of `scale()` breakpoints is always a guess —
 * too weak for the widest formula on the narrowest screen, and needlessly small for
 * everything else.
 *
 * This measures each equation once MathJax has typeset it and scales that one by
 * exactly the ratio it needs, so the result is always `<= 1` and always fits. The
 * container can then keep `overflow: hidden` with nothing to hide, and no scroll
 * track is ever painted.
 *
 * Notes on the mechanics:
 *   - The transform goes on `mjx-math`, the inner box. MathJax writes `font-size` as
 *     an inline style on `mjx-container`, and an inline style beats any stylesheet
 *     rule, so scaling by font-size is not available.
 *   - `transform` does not affect layout, so the container would still report the
 *     unscaled width. The height is corrected explicitly and the origin is `left top`,
 *     because `center` leaves the shrunken content centred on its original centre —
 *     hanging off both edges instead of shrinking inward.
 *   - Re-run on resize, since the available width changes and an equation scaled for
 *     a narrow column would otherwise stay small when the window grows.
 */
(function () {
    "use strict";

    var pending = false;

    function fitAll() {
        var eqs = document.querySelectorAll('mjx-container[display="true"]');
        for (var i = 0; i < eqs.length; i++) fit(eqs[i]);
    }

    function fit(container) {
        var math = container.querySelector("mjx-math");
        if (!math) return;

        /* Measure unscaled. Clearing the transform first matters on a re-run: the width
           read back from an already-scaled box would be the scaled one, and the ratios
           would compound until the equation vanished. */
        math.style.transform = "";
        math.style.transformOrigin = "";
        container.style.height = "";

        var natural = math.getBoundingClientRect().width;
        var available = container.clientWidth;
        if (!natural || !available) return;

        if (natural <= available) return;   // already fits; leave it at full size

        var scale = available / natural;
        math.style.transformOrigin = "left top";
        math.style.transform = "scale(" + scale + ")";

        /* A transform leaves the layout box at its original size, so the container would
           reserve the unscaled height and open a gap underneath. */
        var h = math.getBoundingClientRect().height;
        if (h) container.style.height = h + "px";
    }

    function schedule() {
        if (pending) return;
        pending = true;
        requestAnimationFrame(function () {
            pending = false;
            fitAll();
        });
    }

    /* MathJax typesets asynchronously, and its script is `async` while this one is
       `defer` — so `startup.promise` may not exist yet when this runs, and hooking it
       only if present silently did nothing. Wait for whichever arrives.

       `startup.promise` resolves once, after the first pass over the page — which is all
       these pages need, since nothing re-typesets after load. */
    function afterTypeset() {
        var MJ = window.MathJax;
        if (MJ && MJ.startup && MJ.startup.promise) {
            MJ.startup.promise.then(fitAll).catch(function () { });
            return true;
        }
        return false;
    }

    function start() {
        window.addEventListener("resize", schedule, { passive: true });
        window.addEventListener("orientationchange", schedule, { passive: true });
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(schedule).catch(function () { });
        }

        if (afterTypeset()) return;

        /* MathJax has not booted yet. Poll briefly for it, then give up — a page with no
           MathJax has nothing to fit, and an unbounded poll would run forever. Also fit
           on every settle in the meantime, so a slow CDN still ends up measured. */
        var tries = 0;
        var iv = setInterval(function () {
            tries++;
            if (afterTypeset() || tries > 40) {   // ~10s at 250ms
                clearInterval(iv);
                fitAll();
            }
        }, 250);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", start);
    } else {
        start();
    }
})();
