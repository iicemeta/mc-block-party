import { jsx as D, jsxs as re, Fragment as er } from "react/jsx-runtime";
import * as O from "react";
import z, { useLayoutEffect as tr, useRef as P, useMemo as $, useEffect as F, useCallback as G, useState as ne, memo as Jr, useReducer as Qr, createContext as ft, useContext as Le, useImperativeHandle as Zr } from "react";
import * as es from "react-dom";
import nr, { unstable_batchedUpdates as yt, createPortal as ts, flushSync as ns } from "react-dom";
function rr(e) {
  var t, n, r = "";
  if (typeof e == "string" || typeof e == "number") r += e;
  else if (typeof e == "object") if (Array.isArray(e)) {
    var s = e.length;
    for (t = 0; t < s; t++) e[t] && (n = rr(e[t])) && (r && (r += " "), r += n);
  } else for (n in e) e[n] && (r && (r += " "), r += n);
  return r;
}
function rs() {
  for (var e, t, n = 0, r = "", s = arguments.length; n < s; n++) (e = arguments[n]) && (t = rr(e)) && (r && (r += " "), r += t);
  return r;
}
const I = rs, Ke = O.forwardRef(
  ({ children: e, onClick: t, active: n, disabled: r, className: s, type: o, variant: i, ...l }, c) => /* @__PURE__ */ D(
    "button",
    {
      ref: c,
      ...l,
      type: o,
      onClick: t,
      className: I("Button", s, {
        [`Button_${i}`]: i,
        Button_active: n,
        Button_disabled: r
      }),
      children: /* @__PURE__ */ D("span", { className: I("ButtonText"), children: e })
    }
  )
);
Ke.displayName = "Button";
const ss = ({ options: e, disabled: t, className: n, onChange: r, value: s }) => {
  const o = (i, l) => {
    i.onClick && i.onClick(l), r && r(i.value);
  };
  return /* @__PURE__ */ D("div", { className: I("ButtonGroup", n), children: e.map((i, l) => /* @__PURE__ */ D(
    Ke,
    {
      disabled: t,
      type: "button",
      active: i.value === s,
      className: I("ButtonGroupButton", {
        "ButtonGroupButton-active": i.value === s
      }),
      onClick: (c) => o(i, c),
      variant: i.value === s ? "primary" : "secondary",
      children: i.label
    },
    l
  )) });
};
ss.displayName = "ButtonGroup";
const Xe = Math.min, Ae = Math.max, Dt = Math.round, xt = Math.floor, we = (e) => ({
  x: e,
  y: e
});
function os(e, t, n) {
  return Ae(e, Xe(t, n));
}
function cn(e, t) {
  return typeof e == "function" ? e(t) : e;
}
function sr(e) {
  return e.split("-")[0];
}
function an(e) {
  return e.split("-")[1];
}
function is(e) {
  return e === "x" ? "y" : "x";
}
function or(e) {
  return e === "y" ? "height" : "width";
}
function un(e) {
  const t = e[0];
  return t === "t" || t === "b" ? "y" : "x";
}
function ir(e) {
  return is(un(e));
}
function ls(e) {
  var t, n, r, s;
  return {
    top: (t = e.top) != null ? t : 0,
    right: (n = e.right) != null ? n : 0,
    bottom: (r = e.bottom) != null ? r : 0,
    left: (s = e.left) != null ? s : 0
  };
}
function lr(e) {
  return typeof e != "number" ? ls(e) : {
    top: e,
    right: e,
    bottom: e,
    left: e
  };
}
function Ot(e) {
  const {
    x: t,
    y: n,
    width: r,
    height: s
  } = e;
  return {
    width: r,
    height: s,
    top: n,
    left: t,
    right: t + r,
    bottom: n + s,
    x: t,
    y: n
  };
}
function zn(e, t, n) {
  let {
    reference: r,
    floating: s
  } = e;
  const o = un(t), i = ir(t), l = or(i), c = sr(t), a = o === "y", u = r.x + r.width / 2 - s.width / 2, d = r.y + r.height / 2 - s.height / 2, h = r[l] / 2 - s[l] / 2;
  let f;
  switch (c) {
    case "top":
      f = {
        x: u,
        y: r.y - s.height
      };
      break;
    case "bottom":
      f = {
        x: u,
        y: r.y + r.height
      };
      break;
    case "right":
      f = {
        x: r.x + r.width,
        y: d
      };
      break;
    case "left":
      f = {
        x: r.x - s.width,
        y: d
      };
      break;
    default:
      f = {
        x: r.x,
        y: r.y
      };
  }
  const g = an(t);
  return g && (f[i] += h * (g === "end" ? 1 : -1) * (n && a ? -1 : 1)), f;
}
async function cs(e, t) {
  var n;
  t === void 0 && (t = {});
  const {
    x: r,
    y: s,
    platform: o,
    rects: i,
    elements: l,
    strategy: c
  } = e, {
    boundary: a = "clippingAncestors",
    rootBoundary: u = "viewport",
    elementContext: d = "floating",
    altBoundary: h = !1,
    padding: f = 0
  } = cn(t, e), g = lr(f), v = l[h ? d === "floating" ? "reference" : "floating" : d], p = Ot(await o.getClippingRect({
    element: (n = await (o.isElement == null ? void 0 : o.isElement(v))) == null || n ? v : v.contextElement || await (o.getDocumentElement == null ? void 0 : o.getDocumentElement(l.floating)),
    boundary: a,
    rootBoundary: u,
    strategy: c
  })), b = d === "floating" ? {
    x: r,
    y: s,
    width: i.floating.width,
    height: i.floating.height
  } : i.reference, w = await (o.getOffsetParent == null ? void 0 : o.getOffsetParent(l.floating)), x = await (o.isElement == null ? void 0 : o.isElement(w)) && await (o.getScale == null ? void 0 : o.getScale(w)) || {
    x: 1,
    y: 1
  }, y = Ot(o.convertOffsetParentRelativeRectToViewportRelativeRect ? await o.convertOffsetParentRelativeRectToViewportRelativeRect({
    elements: l,
    rect: b,
    offsetParent: w,
    strategy: c
  }) : b);
  return {
    top: (p.top - y.top + g.top) / x.y,
    bottom: (y.bottom - p.bottom + g.bottom) / x.y,
    left: (p.left - y.left + g.left) / x.x,
    right: (y.right - p.right + g.right) / x.x
  };
}
const as = 50, us = async (e, t, n) => {
  const {
    placement: r = "bottom",
    strategy: s = "absolute",
    middleware: o = [],
    platform: i
  } = n, l = i.detectOverflow ? i : {
    ...i,
    detectOverflow: cs
  }, c = await (i.isRTL == null ? void 0 : i.isRTL(t));
  let a = await i.getElementRects({
    reference: e,
    floating: t,
    strategy: s
  }), {
    x: u,
    y: d
  } = zn(a, r, c), h = r, f = 0;
  const g = {};
  for (let m = 0; m < o.length; m++) {
    const v = o[m];
    if (!v)
      continue;
    const {
      name: p,
      fn: b
    } = v, {
      x: w,
      y: x,
      data: y,
      reset: S
    } = await b({
      x: u,
      y: d,
      initialPlacement: r,
      placement: h,
      strategy: s,
      middlewareData: g,
      rects: a,
      platform: l,
      elements: {
        reference: e,
        floating: t
      }
    });
    u = w ?? u, d = x ?? d, g[p] = {
      ...g[p],
      ...y
    }, S && f < as && (f++, typeof S == "object" && (S.placement && (h = S.placement), S.rects && (a = S.rects === !0 ? await i.getElementRects({
      reference: e,
      floating: t,
      strategy: s
    }) : S.rects), {
      x: u,
      y: d
    } = zn(a, h, c)), m = -1);
  }
  return {
    x: u,
    y: d,
    placement: h,
    strategy: s,
    middlewareData: g
  };
}, ds = (e) => ({
  name: "arrow",
  options: e,
  async fn(t) {
    const {
      x: n,
      y: r,
      placement: s,
      rects: o,
      platform: i,
      elements: l,
      middlewareData: c
    } = t, {
      element: a,
      padding: u = 0
    } = cn(e, t) || {};
    if (a == null)
      return {};
    const d = lr(u), h = {
      x: n,
      y: r
    }, f = ir(s), g = or(f), m = await i.getDimensions(a), v = f === "y", p = v ? "top" : "left", b = v ? "bottom" : "right", w = v ? "clientHeight" : "clientWidth", x = o.reference[g] + o.reference[f] - h[f] - o.floating[g], y = h[f] - o.reference[f], S = await (i.getOffsetParent == null ? void 0 : i.getOffsetParent(a));
    let C = S ? S[w] : 0;
    (!C || !await (i.isElement == null ? void 0 : i.isElement(S))) && (C = l.floating[w] || o.floating[g]);
    const E = x / 2 - y / 2, A = C / 2 - m[g] / 2 - 1, M = Xe(d[p], A), R = Xe(d[b], A), L = C - m[g] - R, T = C / 2 - m[g] / 2 + E, _ = os(M, T, L), V = !c.arrow && an(s) != null && T !== _ && o.reference[g] / 2 - (T < M ? M : R) - m[g] / 2 < 0, X = V ? T < M ? T - M : T - L : 0;
    return {
      [f]: h[f] + X,
      data: {
        [f]: _,
        centerOffset: T - _ - X,
        ...V && {
          alignmentOffset: X
        }
      },
      reset: V
    };
  }
}), fs = /* @__PURE__ */ new Set(["left", "top"]);
async function hs(e, t) {
  const {
    placement: n,
    platform: r,
    elements: s
  } = e, o = await (r.isRTL == null ? void 0 : r.isRTL(s.floating)), i = sr(n), l = an(n), c = un(n) === "y", a = fs.has(i) ? -1 : 1, u = o && c ? -1 : 1, d = cn(t, e);
  let {
    mainAxis: h,
    crossAxis: f,
    alignmentAxis: g
  } = typeof d == "number" ? {
    mainAxis: d,
    crossAxis: 0,
    alignmentAxis: null
  } : {
    mainAxis: d.mainAxis || 0,
    crossAxis: d.crossAxis || 0,
    alignmentAxis: d.alignmentAxis
  };
  return l && typeof g == "number" && (f = l === "end" ? g * -1 : g), c ? {
    x: f * u,
    y: h * a
  } : {
    x: h * a,
    y: f * u
  };
}
const gs = function(e) {
  return e === void 0 && (e = 0), {
    name: "offset",
    options: e,
    async fn(t) {
      var n, r;
      const {
        x: s,
        y: o,
        placement: i,
        middlewareData: l
      } = t, c = await hs(t, e);
      return i === ((n = l.offset) == null ? void 0 : n.placement) && (r = l.arrow) != null && r.alignmentOffset ? {} : {
        x: s + c.x,
        y: o + c.y,
        data: {
          ...c,
          placement: i
        }
      };
    }
  };
};
function _t() {
  return typeof window < "u";
}
function He(e) {
  return cr(e) ? (e.nodeName || "").toLowerCase() : "#document";
}
function J(e) {
  var t;
  return (e == null || (t = e.ownerDocument) == null ? void 0 : t.defaultView) || window;
}
function ye(e) {
  var t;
  return (t = (cr(e) ? e.ownerDocument : e.document) || window.document) == null ? void 0 : t.documentElement;
}
function cr(e) {
  return _t() ? e instanceof Node || e instanceof J(e).Node : !1;
}
function fe(e) {
  return _t() ? e instanceof Element || e instanceof J(e).Element : !1;
}
function Ie(e) {
  return _t() ? e instanceof HTMLElement || e instanceof J(e).HTMLElement : !1;
}
function kn(e) {
  return !_t() || typeof ShadowRoot > "u" ? !1 : e instanceof ShadowRoot || e instanceof J(e).ShadowRoot;
}
function zt(e) {
  const {
    overflow: t,
    overflowX: n,
    overflowY: r,
    display: s
  } = he(e);
  return /auto|scroll|overlay|hidden|clip/.test(t + r + n) && s !== "inline" && s !== "contents";
}
function ms(e) {
  return /^(table|td|th)$/.test(He(e));
}
function kt(e) {
  try {
    if (e.matches(":popover-open"))
      return !0;
  } catch {
  }
  try {
    return e.matches(":modal");
  } catch {
    return !1;
  }
}
const ps = /transform|translate|scale|rotate|perspective|filter/, vs = /paint|layout|strict|content/, Te = (e) => !!e && e !== "none";
let Xt;
function dn(e) {
  const t = fe(e) ? he(e) : e;
  return Te(t.transform) || Te(t.translate) || Te(t.scale) || Te(t.rotate) || Te(t.perspective) || !fn() && (Te(t.backdropFilter) || Te(t.filter)) || ps.test(t.willChange || "") || vs.test(t.contain || "");
}
function bs(e) {
  let t = Ne(e);
  for (; Ie(t) && !it(t); ) {
    if (dn(t))
      return t;
    if (kt(t))
      return null;
    t = Ne(t);
  }
  return null;
}
function fn() {
  return Xt == null && (Xt = typeof CSS < "u" && CSS.supports && CSS.supports("-webkit-backdrop-filter", "none")), Xt;
}
function it(e) {
  return /^(html|body|#document)$/.test(He(e));
}
function he(e) {
  return J(e).getComputedStyle(e);
}
function Ft(e) {
  return fe(e) ? {
    scrollLeft: e.scrollLeft,
    scrollTop: e.scrollTop
  } : {
    scrollLeft: e.scrollX,
    scrollTop: e.scrollY
  };
}
function Ne(e) {
  if (He(e) === "html")
    return e;
  const t = (
    // Step into the shadow DOM of the parent of a slotted node.
    e.assignedSlot || // DOM Element detected.
    e.parentNode || // ShadowRoot detected.
    kn(e) && e.host || // Fallback.
    ye(e)
  );
  return kn(t) ? t.host : t;
}
function ar(e) {
  const t = Ne(e);
  return it(t) ? (e.ownerDocument || e).body : Ie(t) && zt(t) ? t : ar(t);
}
function lt(e, t, n) {
  var r;
  t === void 0 && (t = []), n === void 0 && (n = !0);
  const s = ar(e), o = s === ((r = e.ownerDocument) == null ? void 0 : r.body), i = J(s);
  if (o) {
    const l = tn(i);
    return t.concat(i, i.visualViewport || [], zt(s) ? s : [], l && n ? lt(l) : []);
  } else
    return t.concat(s, lt(s, [], n));
}
function tn(e) {
  return e.parent && Object.getPrototypeOf(e.parent) ? e.frameElement : null;
}
function ur(e) {
  const t = he(e);
  let n = parseFloat(t.width) || 0, r = parseFloat(t.height) || 0;
  const s = Ie(e), o = s ? e.offsetWidth : n, i = s ? e.offsetHeight : r, l = Dt(n) !== o || Dt(r) !== i;
  return l && (n = o, r = i), {
    width: n,
    height: r,
    $: l
  };
}
function hn(e) {
  return fe(e) ? e : e.contextElement;
}
function Ve(e) {
  const t = hn(e);
  if (!Ie(t))
    return we(1);
  const n = t.getBoundingClientRect(), {
    width: r,
    height: s,
    $: o
  } = ur(t);
  let i = (o ? Dt(n.width) : n.width) / r, l = (o ? Dt(n.height) : n.height) / s;
  return (!i || !Number.isFinite(i)) && (i = 1), (!l || !Number.isFinite(l)) && (l = 1), {
    x: i,
    y: l
  };
}
const ws = /* @__PURE__ */ we(0);
function dr(e) {
  const t = J(e);
  return !fn() || !t.visualViewport ? ws : {
    x: t.visualViewport.offsetLeft,
    y: t.visualViewport.offsetTop
  };
}
function ys(e, t, n) {
  return t === void 0 && (t = !1), !!n && t && n === J(e);
}
function _e(e, t, n, r) {
  t === void 0 && (t = !1), n === void 0 && (n = !1);
  const s = e.getBoundingClientRect(), o = hn(e);
  let i = we(1);
  t && (r ? fe(r) && (i = Ve(r)) : i = Ve(e));
  const l = ys(o, n, r) ? dr(o) : we(0);
  let c = (s.left + l.x) / i.x, a = (s.top + l.y) / i.y, u = s.width / i.x, d = s.height / i.y;
  if (o && r) {
    const h = J(o), f = fe(r) ? J(r) : r;
    let g = h, m = tn(g);
    for (; m && f !== g; ) {
      const v = Ve(m), p = m.getBoundingClientRect(), b = he(m), w = p.left + (m.clientLeft + parseFloat(b.paddingLeft)) * v.x, x = p.top + (m.clientTop + parseFloat(b.paddingTop)) * v.y;
      c *= v.x, a *= v.y, u *= v.x, d *= v.y, c += w, a += x, g = J(m), m = tn(g);
    }
  }
  return Ot({
    width: u,
    height: d,
    x: c,
    y: a
  });
}
function $t(e, t) {
  const n = Ft(e).scrollLeft;
  return t ? t.left + n : _e(ye(e)).left + n;
}
function fr(e, t) {
  const n = e.getBoundingClientRect(), r = n.left + t.scrollLeft - $t(e, n), s = n.top + t.scrollTop;
  return {
    x: r,
    y: s
  };
}
function xs(e) {
  let {
    elements: t,
    rect: n,
    offsetParent: r,
    strategy: s
  } = e;
  const o = s === "fixed", i = ye(r), l = t ? kt(t.floating) : !1;
  if (r === i || l && o)
    return n;
  let c = {
    scrollLeft: 0,
    scrollTop: 0
  }, a = we(1);
  const u = we(0), d = Ie(r);
  if ((d || !o) && ((He(r) !== "body" || zt(i)) && (c = Ft(r)), d)) {
    const f = _e(r);
    a = Ve(r), u.x = f.x + r.clientLeft, u.y = f.y + r.clientTop;
  }
  const h = i && !d && !o ? fr(i, c) : we(0);
  return {
    width: n.width * a.x,
    height: n.height * a.y,
    x: n.x * a.x - c.scrollLeft * a.x + u.x + h.x,
    y: n.y * a.y - c.scrollTop * a.y + u.y + h.y
  };
}
function Ss(e) {
  return e.getClientRects ? Array.from(e.getClientRects()) : [];
}
function Cs(e) {
  const t = Ft(e), n = e.ownerDocument.body, r = Ae(e.scrollWidth, e.clientWidth, n.scrollWidth, n.clientWidth), s = Ae(e.scrollHeight, e.clientHeight, n.scrollHeight, n.clientHeight);
  let o = -t.scrollLeft + $t(e);
  const i = -t.scrollTop;
  return he(n).direction === "rtl" && (o += Ae(e.clientWidth, n.clientWidth) - r), {
    width: r,
    height: s,
    x: o,
    y: i
  };
}
const Rs = 25;
function Es(e, t, n) {
  n === void 0 && (n = "viewport");
  const r = n === "layoutViewport", s = J(e), o = ye(e), i = s.visualViewport;
  let l = o.clientWidth, c = o.clientHeight, a = 0, u = 0;
  if (i) {
    const h = !fn() || t === "fixed";
    r ? h || (a = -i.offsetLeft, u = -i.offsetTop) : (l = i.width, c = i.height, h && (a = i.offsetLeft, u = i.offsetTop));
  }
  if ($t(o) <= 0) {
    const h = o.ownerDocument, f = h.body, g = getComputedStyle(f), m = h.compatMode === "CSS1Compat" && parseFloat(g.marginLeft) + parseFloat(g.marginRight) || 0, v = Math.abs(o.clientWidth - f.clientWidth - m), p = getComputedStyle(o).scrollbarGutter === "stable both-edges" ? v / 2 : v;
    p <= Rs && (l -= p);
  }
  return {
    width: l,
    height: c,
    x: a,
    y: u
  };
}
function Ds(e, t) {
  const n = _e(e, !0, t === "fixed"), r = n.top + e.clientTop, s = n.left + e.clientLeft, o = Ve(e), i = e.clientWidth * o.x, l = e.clientHeight * o.y, c = s * o.x, a = r * o.y;
  return {
    width: i,
    height: l,
    x: c,
    y: a
  };
}
function Fn(e, t, n) {
  let r;
  if (t === "viewport" || t === "layoutViewport")
    r = Es(e, n, t);
  else if (t === "document")
    r = Cs(ye(e));
  else if (fe(t))
    r = Ds(t, n);
  else {
    const s = dr(e);
    r = {
      x: t.x - s.x,
      y: t.y - s.y,
      width: t.width,
      height: t.height
    };
  }
  return Ot(r);
}
function Os(e, t) {
  const n = t.get(e);
  if (n)
    return n;
  let r = lt(e, [], !1).filter((l) => fe(l) && He(l) !== "body"), s = null;
  const o = he(e).position === "fixed";
  let i = o ? Ne(e) : e;
  for (; fe(i) && !it(i); ) {
    const l = he(i), c = dn(i), a = s ? s.position : o ? "fixed" : "";
    !c && (a === "fixed" || a === "absolute" && l.position === "static") ? r = r.filter((d) => d !== i) : s = l, i = Ne(i);
  }
  return t.set(e, r), r;
}
function Is(e) {
  let {
    element: t,
    boundary: n,
    rootBoundary: r,
    strategy: s
  } = e;
  const i = [...n === "clippingAncestors" ? kt(t) ? [] : Os(t, this._c) : [].concat(n), r], l = Fn(t, i[0], s);
  let c = l.top, a = l.right, u = l.bottom, d = l.left;
  for (let h = 1; h < i.length; h++) {
    const f = Fn(t, i[h], s);
    c = Ae(f.top, c), a = Xe(f.right, a), u = Xe(f.bottom, u), d = Ae(f.left, d);
  }
  return {
    width: a - d,
    height: u - c,
    x: d,
    y: c
  };
}
function Ms(e) {
  const {
    width: t,
    height: n
  } = ur(e);
  return {
    width: t,
    height: n
  };
}
function Ts(e, t, n) {
  const r = Ie(t), s = ye(t), o = n === "fixed", i = _e(e, !0, o, t);
  let l = {
    scrollLeft: 0,
    scrollTop: 0
  };
  const c = we(0);
  if ((r || !o) && ((He(t) !== "body" || zt(s)) && (l = Ft(t)), r)) {
    const h = _e(t, !0, o, t);
    c.x = h.x + t.clientLeft, c.y = h.y + t.clientTop;
  }
  !r && s && (c.x = $t(s));
  const a = s && !r && !o ? fr(s, l) : we(0), u = i.left + l.scrollLeft - c.x - a.x, d = i.top + l.scrollTop - c.y - a.y;
  return {
    x: u,
    y: d,
    width: i.width,
    height: i.height
  };
}
function Ht(e) {
  return he(e).position === "static";
}
function $n(e, t) {
  if (!Ie(e) || he(e).position === "fixed")
    return null;
  if (t)
    return t(e);
  let n = e.offsetParent;
  return ye(e) === n && (n = n.ownerDocument.body), n;
}
function hr(e, t) {
  const n = J(e);
  if (kt(e))
    return n;
  if (!Ie(e)) {
    let s = Ne(e);
    for (; s && !it(s); ) {
      if (fe(s) && !Ht(s))
        return s;
      s = Ne(s);
    }
    return n;
  }
  let r = $n(e, t);
  for (; r && ms(r) && Ht(r); )
    r = $n(r, t);
  return r && it(r) && Ht(r) && !dn(r) ? n : r || bs(e) || n;
}
const As = async function(e) {
  const t = this.getOffsetParent || hr, n = this.getDimensions, r = await n(e.floating);
  return {
    reference: Ts(e.reference, await t(e.floating), e.strategy),
    floating: {
      x: 0,
      y: 0,
      width: r.width,
      height: r.height
    }
  };
};
function Ls(e) {
  return he(e).direction === "rtl";
}
const Ns = {
  convertOffsetParentRelativeRectToViewportRelativeRect: xs,
  getDocumentElement: ye,
  getClippingRect: Is,
  getOffsetParent: hr,
  getElementRects: As,
  getClientRects: Ss,
  getDimensions: Ms,
  getScale: Ve,
  isElement: fe,
  isRTL: Ls
};
function gr(e, t) {
  return e.x === t.x && e.y === t.y && e.width === t.width && e.height === t.height;
}
function _s(e, t, n) {
  let r = null, s;
  const o = ye(e);
  function i() {
    var u;
    clearTimeout(s), (u = r) == null || u.disconnect(), r = null;
  }
  function l(u, d) {
    u === void 0 && (u = !1), d === void 0 && (d = 1), i();
    const h = e.getBoundingClientRect(), {
      left: f,
      top: g,
      width: m,
      height: v
    } = h;
    if (u || t(), !m || !v)
      return;
    const p = xt(g), b = xt(o.clientWidth - (f + m)), w = xt(o.clientHeight - (g + v)), x = xt(f), S = {
      rootMargin: -p + "px " + -b + "px " + -w + "px " + -x + "px",
      threshold: Ae(0, Xe(1, d)) || 1
    };
    let C = !0;
    function E(A) {
      const M = A[0].intersectionRatio;
      if (!gr(h, e.getBoundingClientRect()))
        return l();
      if (M !== d) {
        if (!C)
          return l();
        M ? l(!1, M) : s = setTimeout(() => {
          l(!1, 1e-7);
        }, 1e3);
      }
      C = !1;
    }
    try {
      r = new IntersectionObserver(E, {
        ...S,
        // Handle <iframe>s
        root: o.ownerDocument
      });
    } catch {
      r = new IntersectionObserver(E, S);
    }
    r.observe(e);
  }
  const c = J(e), a = () => l(n);
  return c.addEventListener("resize", a), l(!0), () => {
    c.removeEventListener("resize", a), i();
  };
}
function mr(e, t, n, r) {
  r === void 0 && (r = {});
  const {
    ancestorScroll: s = !0,
    ancestorResize: o = !0,
    elementResize: i = typeof ResizeObserver == "function",
    layoutShift: l = typeof IntersectionObserver == "function",
    animationFrame: c = !1
  } = r, a = hn(e), u = s || o ? [...a ? lt(a) : [], ...t ? lt(t) : []] : [];
  u.forEach((p) => {
    s && p.addEventListener("scroll", n), o && p.addEventListener("resize", n);
  });
  const d = a && l ? _s(a, n, o) : null;
  let h = -1, f = null;
  i && (f = new ResizeObserver((p) => {
    let [b] = p;
    b && b.target === a && f && t && (f.unobserve(t), cancelAnimationFrame(h), h = requestAnimationFrame(() => {
      var w;
      (w = f) == null || w.observe(t);
    })), n();
  }), a && !c && f.observe(a), t && f.observe(t));
  let g, m = c ? _e(e) : null;
  c && v();
  function v() {
    const p = _e(e);
    m && !gr(m, p) && n(), m = p, g = requestAnimationFrame(v);
  }
  return n(), () => {
    var p;
    u.forEach((b) => {
      s && b.removeEventListener("scroll", n), o && b.removeEventListener("resize", n);
    }), d == null || d(), (p = f) == null || p.disconnect(), f = null, c && cancelAnimationFrame(g);
  };
}
const zs = gs, Pn = ds, ks = (e, t, n) => {
  const r = /* @__PURE__ */ new Map(), s = n ?? {}, o = {
    ...Ns,
    ...s.platform,
    _c: r
  };
  return us(e, t, {
    ...s,
    platform: o
  });
};
var Fs = typeof document < "u", $s = function() {
}, Rt = Fs ? tr : $s;
function It(e, t) {
  if (e === t)
    return !0;
  if (typeof e != typeof t)
    return !1;
  if (typeof e == "function" && e.toString() === t.toString())
    return !0;
  let n, r, s;
  if (e && t && typeof e == "object") {
    if (Array.isArray(e)) {
      if (n = e.length, n !== t.length) return !1;
      for (r = n; r-- !== 0; )
        if (!It(e[r], t[r]))
          return !1;
      return !0;
    }
    if (s = Object.keys(e), n = s.length, n !== Object.keys(t).length)
      return !1;
    for (r = n; r-- !== 0; )
      if (!{}.hasOwnProperty.call(t, s[r]))
        return !1;
    for (r = n; r-- !== 0; ) {
      const o = s[r];
      if (!(o === "_owner" && e.$$typeof) && !It(e[o], t[o]))
        return !1;
    }
    return !0;
  }
  return e !== e && t !== t;
}
function pr(e) {
  return typeof window > "u" ? 1 : (e.ownerDocument.defaultView || window).devicePixelRatio || 1;
}
function Bn(e, t) {
  const n = pr(e);
  return Math.round(t * n) / n;
}
function Yt(e) {
  const t = O.useRef(e);
  return Rt(() => {
    t.current = e;
  }), t;
}
function vr(e) {
  e === void 0 && (e = {});
  const {
    placement: t = "bottom",
    strategy: n = "absolute",
    middleware: r = [],
    platform: s,
    elements: {
      reference: o,
      floating: i
    } = {},
    transform: l = !0,
    whileElementsMounted: c,
    open: a
  } = e, [u, d] = O.useState({
    x: 0,
    y: 0,
    strategy: n,
    placement: t,
    middlewareData: {},
    isPositioned: !1
  }), [h, f] = O.useState(r);
  It(h, r) || f(r);
  const [g, m] = O.useState(null), [v, p] = O.useState(null), b = O.useCallback((B) => {
    B !== S.current && (S.current = B, m(B));
  }, []), w = O.useCallback((B) => {
    B !== C.current && (C.current = B, p(B));
  }, []), x = o || g, y = i || v, S = O.useRef(null), C = O.useRef(null), E = O.useRef(u), A = c != null, M = Yt(c), R = Yt(s), L = Yt(a), T = O.useCallback(() => {
    if (!S.current || !C.current)
      return;
    const B = {
      placement: t,
      strategy: n,
      middleware: h
    };
    R.current && (B.platform = R.current), ks(S.current, C.current, B).then((U) => {
      const se = {
        ...U,
        // The floating element's position may be recomputed while it's closed
        // but still mounted (such as when transitioning out). To ensure
        // `isPositioned` will be `false` initially on the next open, avoid
        // setting it to `true` when `open === false` (must be specified).
        isPositioned: L.current !== !1
      };
      _.current && !It(E.current, se) && (E.current = se, es.flushSync(() => {
        d(se);
      }));
    });
  }, [h, t, n, R, L]);
  Rt(() => {
    a === !1 && E.current.isPositioned && (E.current.isPositioned = !1, d((B) => ({
      ...B,
      isPositioned: !1
    })));
  }, [a]);
  const _ = O.useRef(!1);
  Rt(() => (_.current = !0, () => {
    _.current = !1;
  }), []), Rt(() => {
    if (x && (S.current = x), y && (C.current = y), x && y) {
      if (M.current)
        return M.current(x, y, T);
      T();
    }
  }, [x, y, T, M, A]);
  const V = O.useMemo(() => ({
    reference: S,
    floating: C,
    setReference: b,
    setFloating: w
  }), [b, w]), X = O.useMemo(() => ({
    reference: x,
    floating: y
  }), [x, y]), H = O.useMemo(() => {
    const B = {
      position: n,
      left: 0,
      top: 0
    };
    if (!X.floating)
      return B;
    const U = Bn(X.floating, u.x), se = Bn(X.floating, u.y);
    return l ? {
      ...B,
      transform: "translate(" + U + "px, " + se + "px)",
      ...pr(X.floating) >= 1.5 && {
        willChange: "transform"
      }
    } : {
      position: n,
      left: U,
      top: se
    };
  }, [n, l, X.floating, u.x, u.y]);
  return O.useMemo(() => ({
    ...u,
    update: T,
    refs: V,
    elements: X,
    floatingStyles: H
  }), [u, T, V, X, H]);
}
const Ps = (e) => {
  function t(n) {
    return {}.hasOwnProperty.call(n, "current");
  }
  return {
    name: "arrow",
    options: e,
    fn(n) {
      const {
        element: r,
        padding: s
      } = typeof e == "function" ? e(n) : e;
      return r && t(r) ? r.current != null ? Pn({
        element: r.current,
        padding: s
      }).fn(n) : {} : r ? Pn({
        element: r,
        padding: s
      }).fn(n) : {};
    }
  };
}, Bs = (e, t) => {
  const n = zs(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, Ws = (e, t) => {
  const n = Ps(e);
  return {
    name: n.name,
    fn: n.fn,
    options: [e, t]
  };
}, br = ({
  content: e,
  target: t,
  placement: n = "bottom-start",
  closeOnClickContent: r,
  closeOnClickOutside: s,
  trigger: o = "click"
}) => {
  const [i, l] = z.useState(!1), { refs: c, floatingStyles: a, elements: u } = vr({
    placement: n,
    open: i,
    whileElementsMounted: mr
  }), d = () => {
    l(!i);
  }, h = () => {
    o === "hover" && !i && l(!0);
  }, f = () => {
    o === "hover" && i && l(!1);
  }, g = u.reference, m = u.floating, v = () => {
    r && l(!1);
  };
  z.useEffect(() => {
    if (i && o === "click") {
      const b = (w) => {
        s && g && m && !g.contains(w.target) && !m.contains(w.target) && l(!1);
      };
      return document.addEventListener("mousedown", b), () => document.removeEventListener("mousedown", b);
    }
  }, [i, g, m]), z.useEffect(() => {
    if (i && o === "hover") {
      const b = (w) => {
        g && m && !g.contains(w.target) && !m.contains(w.target) && l(!1);
      };
      return document.addEventListener("mouseleave", b), () => document.removeEventListener("mouseleave", b);
    }
  }, [i, g, m]);
  const p = g ? `${g.offsetWidth}px` : void 0;
  return /* @__PURE__ */ re(er, { children: [
    typeof t == "function" ? t({
      ref: c.setReference,
      open: () => l(!0),
      close: () => l(!1),
      visible: i,
      className: I("DropdownTarget", {
        DropdownTarget_visible: i
      })
    }) : z.cloneElement(t, {
      ref: c.setReference,
      onClick: d,
      onMouseEnter: h,
      onMouseMove: h,
      onMouseLeave: f,
      active: i,
      className: I("DropdownTarget", t.props.className, {
        DropdownTarget_visible: i
      })
    }),
    i && nr.createPortal(
      /* @__PURE__ */ D(
        "div",
        {
          ref: c.setFloating,
          style: { ...a, minWidth: p },
          className: I("Dropdown", { Dropdown_visible: i }),
          onClick: v,
          onMouseEnter: h,
          onMouseMove: h,
          onMouseLeave: f,
          children: e
        }
      ),
      document.body
    )
  ] });
}, Vs = ({ label: e, onClick: t, disabled: n, ...r }) => /* @__PURE__ */ D(
  "div",
  {
    onClick: t,
    className: I("MenuItem", { MenuItem_disabled: n }),
    ...r,
    children: e
  }
), gn = O.forwardRef(({ items: e }, t) => /* @__PURE__ */ D("div", { ref: t, className: I("Menu"), children: e.map((n) => /* @__PURE__ */ D(Vs, { ...n }, n.id)) }));
gn.displayName = "Menu";
const js = ({ className: e }) => /* @__PURE__ */ D("i", { className: I("MenuIcon", e), children: /* @__PURE__ */ D("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", children: /* @__PURE__ */ D("path", { d: "m 0 2 h 20 M 0 10 h 20 M 0 18 h 20 " }) }) }), wr = ({
  items: e,
  placement: t = "bottom-start",
  className: n,
  onClick: r,
  tabIndex: s
}) => /* @__PURE__ */ D(
  br,
  {
    closeOnClickOutside: !0,
    closeOnClickContent: !0,
    placement: t,
    content: /* @__PURE__ */ D(gn, { items: e }),
    target: /* @__PURE__ */ D(
      Ke,
      {
        onClick: r,
        variant: "clear",
        className: n,
        tabIndex: s,
        children: /* @__PURE__ */ D(js, {})
      }
    )
  }
);
function Ks() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
    t[n] = arguments[n];
  return $(
    () => (r) => {
      t.forEach((s) => s(r));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    t
  );
}
const Pt = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
function Ye(e) {
  const t = Object.prototype.toString.call(e);
  return t === "[object Window]" || // In Electron context the Window object serializes to [object global]
  t === "[object global]";
}
function mn(e) {
  return "nodeType" in e;
}
function Q(e) {
  var t, n;
  return e ? Ye(e) ? e : mn(e) && (t = (n = e.ownerDocument) == null ? void 0 : n.defaultView) != null ? t : window : window;
}
function pn(e) {
  const {
    Document: t
  } = Q(e);
  return e instanceof t;
}
function ht(e) {
  return Ye(e) ? !1 : e instanceof Q(e).HTMLElement;
}
function yr(e) {
  return e instanceof Q(e).SVGElement;
}
function Ge(e) {
  return e ? Ye(e) ? e.document : mn(e) ? pn(e) ? e : ht(e) || yr(e) ? e.ownerDocument : document : document : document;
}
const ge = Pt ? tr : F;
function vn(e) {
  const t = P(e);
  return ge(() => {
    t.current = e;
  }), G(function() {
    for (var n = arguments.length, r = new Array(n), s = 0; s < n; s++)
      r[s] = arguments[s];
    return t.current == null ? void 0 : t.current(...r);
  }, []);
}
function Xs() {
  const e = P(null), t = G((r, s) => {
    e.current = setInterval(r, s);
  }, []), n = G(() => {
    e.current !== null && (clearInterval(e.current), e.current = null);
  }, []);
  return [t, n];
}
function ct(e, t) {
  t === void 0 && (t = [e]);
  const n = P(e);
  return ge(() => {
    n.current !== e && (n.current = e);
  }, t), n;
}
function gt(e, t) {
  const n = P();
  return $(
    () => {
      const r = e(n.current);
      return n.current = r, r;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...t]
  );
}
function Mt(e) {
  const t = vn(e), n = P(null), r = G(
    (s) => {
      s !== n.current && (t == null || t(s, n.current)), n.current = s;
    },
    //eslint-disable-next-line
    []
  );
  return [n, r];
}
function nn(e) {
  const t = P();
  return F(() => {
    t.current = e;
  }, [e]), t.current;
}
let Gt = {};
function mt(e, t) {
  return $(() => {
    if (t)
      return t;
    const n = Gt[e] == null ? 0 : Gt[e] + 1;
    return Gt[e] = n, e + "-" + n;
  }, [e, t]);
}
function xr(e) {
  return function(t) {
    for (var n = arguments.length, r = new Array(n > 1 ? n - 1 : 0), s = 1; s < n; s++)
      r[s - 1] = arguments[s];
    return r.reduce((o, i) => {
      const l = Object.entries(i);
      for (const [c, a] of l) {
        const u = o[c];
        u != null && (o[c] = u + e * a);
      }
      return o;
    }, {
      ...t
    });
  };
}
const je = /* @__PURE__ */ xr(1), Tt = /* @__PURE__ */ xr(-1);
function Hs(e) {
  return "clientX" in e && "clientY" in e;
}
function bn(e) {
  if (!e)
    return !1;
  const {
    KeyboardEvent: t
  } = Q(e.target);
  return t && e instanceof t;
}
function Ys(e) {
  if (!e)
    return !1;
  const {
    TouchEvent: t
  } = Q(e.target);
  return t && e instanceof t;
}
function rn(e) {
  if (Ys(e)) {
    if (e.touches && e.touches.length) {
      const {
        clientX: t,
        clientY: n
      } = e.touches[0];
      return {
        x: t,
        y: n
      };
    } else if (e.changedTouches && e.changedTouches.length) {
      const {
        clientX: t,
        clientY: n
      } = e.changedTouches[0];
      return {
        x: t,
        y: n
      };
    }
  }
  return Hs(e) ? {
    x: e.clientX,
    y: e.clientY
  } : null;
}
const at = /* @__PURE__ */ Object.freeze({
  Translate: {
    toString(e) {
      if (!e)
        return;
      const {
        x: t,
        y: n
      } = e;
      return "translate3d(" + (t ? Math.round(t) : 0) + "px, " + (n ? Math.round(n) : 0) + "px, 0)";
    }
  },
  Scale: {
    toString(e) {
      if (!e)
        return;
      const {
        scaleX: t,
        scaleY: n
      } = e;
      return "scaleX(" + t + ") scaleY(" + n + ")";
    }
  },
  Transform: {
    toString(e) {
      if (e)
        return [at.Translate.toString(e), at.Scale.toString(e)].join(" ");
    }
  },
  Transition: {
    toString(e) {
      let {
        property: t,
        duration: n,
        easing: r
      } = e;
      return t + " " + n + "ms " + r;
    }
  }
}), Wn = "a,frame,iframe,input:not([type=hidden]):not(:disabled),select:not(:disabled),textarea:not(:disabled),button:not(:disabled),*[tabindex]";
function Gs(e) {
  return e.matches(Wn) ? e : e.querySelector(Wn);
}
const Us = {
  display: "none"
};
function qs(e) {
  let {
    id: t,
    value: n
  } = e;
  return z.createElement("div", {
    id: t,
    style: Us
  }, n);
}
function Js(e) {
  let {
    id: t,
    announcement: n,
    ariaLiveType: r = "assertive"
  } = e;
  const s = {
    position: "fixed",
    top: 0,
    left: 0,
    width: 1,
    height: 1,
    margin: -1,
    border: 0,
    padding: 0,
    overflow: "hidden",
    clip: "rect(0 0 0 0)",
    clipPath: "inset(100%)",
    whiteSpace: "nowrap"
  };
  return z.createElement("div", {
    id: t,
    style: s,
    role: "status",
    "aria-live": r,
    "aria-atomic": !0
  }, n);
}
function Qs() {
  const [e, t] = ne("");
  return {
    announce: G((r) => {
      r != null && t(r);
    }, []),
    announcement: e
  };
}
const Sr = /* @__PURE__ */ ft(null);
function Zs(e) {
  const t = Le(Sr);
  F(() => {
    if (!t)
      throw new Error("useDndMonitor must be used within a children of <DndContext>");
    return t(e);
  }, [e, t]);
}
function eo() {
  const [e] = ne(() => /* @__PURE__ */ new Set()), t = G((r) => (e.add(r), () => e.delete(r)), [e]);
  return [G((r) => {
    let {
      type: s,
      event: o
    } = r;
    e.forEach((i) => {
      var l;
      return (l = i[s]) == null ? void 0 : l.call(i, o);
    });
  }, [e]), t];
}
const to = {
  draggable: `
    To pick up a draggable item, press the space bar.
    While dragging, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `
}, no = {
  onDragStart(e) {
    let {
      active: t
    } = e;
    return "Picked up draggable item " + t.id + ".";
  },
  onDragOver(e) {
    let {
      active: t,
      over: n
    } = e;
    return n ? "Draggable item " + t.id + " was moved over droppable area " + n.id + "." : "Draggable item " + t.id + " is no longer over a droppable area.";
  },
  onDragEnd(e) {
    let {
      active: t,
      over: n
    } = e;
    return n ? "Draggable item " + t.id + " was dropped over droppable area " + n.id : "Draggable item " + t.id + " was dropped.";
  },
  onDragCancel(e) {
    let {
      active: t
    } = e;
    return "Dragging was cancelled. Draggable item " + t.id + " was dropped.";
  }
};
function ro(e) {
  let {
    announcements: t = no,
    container: n,
    hiddenTextDescribedById: r,
    screenReaderInstructions: s = to
  } = e;
  const {
    announce: o,
    announcement: i
  } = Qs(), l = mt("DndLiveRegion"), [c, a] = ne(!1);
  if (F(() => {
    a(!0);
  }, []), Zs($(() => ({
    onDragStart(d) {
      let {
        active: h
      } = d;
      o(t.onDragStart({
        active: h
      }));
    },
    onDragMove(d) {
      let {
        active: h,
        over: f
      } = d;
      t.onDragMove && o(t.onDragMove({
        active: h,
        over: f
      }));
    },
    onDragOver(d) {
      let {
        active: h,
        over: f
      } = d;
      o(t.onDragOver({
        active: h,
        over: f
      }));
    },
    onDragEnd(d) {
      let {
        active: h,
        over: f
      } = d;
      o(t.onDragEnd({
        active: h,
        over: f
      }));
    },
    onDragCancel(d) {
      let {
        active: h,
        over: f
      } = d;
      o(t.onDragCancel({
        active: h,
        over: f
      }));
    }
  }), [o, t])), !c)
    return null;
  const u = z.createElement(z.Fragment, null, z.createElement(qs, {
    id: r,
    value: s.draggable
  }), z.createElement(Js, {
    id: l,
    announcement: i
  }));
  return n ? ts(u, n) : u;
}
var W;
(function(e) {
  e.DragStart = "dragStart", e.DragMove = "dragMove", e.DragEnd = "dragEnd", e.DragCancel = "dragCancel", e.DragOver = "dragOver", e.RegisterDroppable = "registerDroppable", e.SetDroppableDisabled = "setDroppableDisabled", e.UnregisterDroppable = "unregisterDroppable";
})(W || (W = {}));
function At() {
}
function Ut(e, t) {
  return $(
    () => ({
      sensor: e,
      options: t ?? {}
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e, t]
  );
}
function so() {
  for (var e = arguments.length, t = new Array(e), n = 0; n < e; n++)
    t[n] = arguments[n];
  return $(
    () => [...t].filter((r) => r != null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...t]
  );
}
const ce = /* @__PURE__ */ Object.freeze({
  x: 0,
  y: 0
});
function oo(e, t) {
  let {
    data: {
      value: n
    }
  } = e, {
    data: {
      value: r
    }
  } = t;
  return r - n;
}
function io(e, t) {
  if (!e || e.length === 0)
    return null;
  const [n] = e;
  return n[t];
}
function lo(e, t) {
  const n = Math.max(t.top, e.top), r = Math.max(t.left, e.left), s = Math.min(t.left + t.width, e.left + e.width), o = Math.min(t.top + t.height, e.top + e.height), i = s - r, l = o - n;
  if (r < s && n < o) {
    const c = t.width * t.height, a = e.width * e.height, u = i * l, d = u / (c + a - u);
    return Number(d.toFixed(4));
  }
  return 0;
}
const co = (e) => {
  let {
    collisionRect: t,
    droppableRects: n,
    droppableContainers: r
  } = e;
  const s = [];
  for (const o of r) {
    const {
      id: i
    } = o, l = n.get(i);
    if (l) {
      const c = lo(l, t);
      c > 0 && s.push({
        id: i,
        data: {
          droppableContainer: o,
          value: c
        }
      });
    }
  }
  return s.sort(oo);
};
function ao(e, t, n) {
  return {
    ...e,
    scaleX: t && n ? t.width / n.width : 1,
    scaleY: t && n ? t.height / n.height : 1
  };
}
function Cr(e, t) {
  return e && t ? {
    x: e.left - t.left,
    y: e.top - t.top
  } : ce;
}
function uo(e) {
  return function(n) {
    for (var r = arguments.length, s = new Array(r > 1 ? r - 1 : 0), o = 1; o < r; o++)
      s[o - 1] = arguments[o];
    return s.reduce((i, l) => ({
      ...i,
      top: i.top + e * l.y,
      bottom: i.bottom + e * l.y,
      left: i.left + e * l.x,
      right: i.right + e * l.x
    }), {
      ...n
    });
  };
}
const fo = /* @__PURE__ */ uo(1);
function ho(e) {
  if (e.startsWith("matrix3d(")) {
    const t = e.slice(9, -1).split(/, /);
    return {
      x: +t[12],
      y: +t[13],
      scaleX: +t[0],
      scaleY: +t[5]
    };
  } else if (e.startsWith("matrix(")) {
    const t = e.slice(7, -1).split(/, /);
    return {
      x: +t[4],
      y: +t[5],
      scaleX: +t[0],
      scaleY: +t[3]
    };
  }
  return null;
}
function go(e, t, n) {
  const r = ho(t);
  if (!r)
    return e;
  const {
    scaleX: s,
    scaleY: o,
    x: i,
    y: l
  } = r, c = e.left - i - (1 - s) * parseFloat(n), a = e.top - l - (1 - o) * parseFloat(n.slice(n.indexOf(" ") + 1)), u = s ? e.width / s : e.width, d = o ? e.height / o : e.height;
  return {
    width: u,
    height: d,
    top: a,
    right: c + u,
    bottom: a + d,
    left: c
  };
}
const mo = {
  ignoreTransform: !1
};
function Ue(e, t) {
  t === void 0 && (t = mo);
  let n = e.getBoundingClientRect();
  if (t.ignoreTransform) {
    const {
      transform: a,
      transformOrigin: u
    } = Q(e).getComputedStyle(e);
    a && (n = go(n, a, u));
  }
  const {
    top: r,
    left: s,
    width: o,
    height: i,
    bottom: l,
    right: c
  } = n;
  return {
    top: r,
    left: s,
    width: o,
    height: i,
    bottom: l,
    right: c
  };
}
function Vn(e) {
  return Ue(e, {
    ignoreTransform: !0
  });
}
function po(e) {
  const t = e.innerWidth, n = e.innerHeight;
  return {
    top: 0,
    left: 0,
    right: t,
    bottom: n,
    width: t,
    height: n
  };
}
function vo(e, t) {
  return t === void 0 && (t = Q(e).getComputedStyle(e)), t.position === "fixed";
}
function bo(e, t) {
  t === void 0 && (t = Q(e).getComputedStyle(e));
  const n = /(auto|scroll|overlay)/;
  return ["overflow", "overflowX", "overflowY"].some((s) => {
    const o = t[s];
    return typeof o == "string" ? n.test(o) : !1;
  });
}
function wn(e, t) {
  const n = [];
  function r(s) {
    if (t != null && n.length >= t || !s)
      return n;
    if (pn(s) && s.scrollingElement != null && !n.includes(s.scrollingElement))
      return n.push(s.scrollingElement), n;
    if (!ht(s) || yr(s) || n.includes(s))
      return n;
    const o = Q(e).getComputedStyle(s);
    return s !== e && bo(s, o) && n.push(s), vo(s, o) ? n : r(s.parentNode);
  }
  return e ? r(e) : n;
}
function Rr(e) {
  const [t] = wn(e, 1);
  return t ?? null;
}
function qt(e) {
  return !Pt || !e ? null : Ye(e) ? e : mn(e) ? pn(e) || e === Ge(e).scrollingElement ? window : ht(e) ? e : null : null;
}
function Er(e) {
  return Ye(e) ? e.scrollX : e.scrollLeft;
}
function Dr(e) {
  return Ye(e) ? e.scrollY : e.scrollTop;
}
function sn(e) {
  return {
    x: Er(e),
    y: Dr(e)
  };
}
var j;
(function(e) {
  e[e.Forward = 1] = "Forward", e[e.Backward = -1] = "Backward";
})(j || (j = {}));
function Or(e) {
  return !Pt || !e ? !1 : e === document.scrollingElement;
}
function Ir(e) {
  const t = {
    x: 0,
    y: 0
  }, n = Or(e) ? {
    height: window.innerHeight,
    width: window.innerWidth
  } : {
    height: e.clientHeight,
    width: e.clientWidth
  }, r = {
    x: e.scrollWidth - n.width,
    y: e.scrollHeight - n.height
  }, s = e.scrollTop <= t.y, o = e.scrollLeft <= t.x, i = e.scrollTop >= r.y, l = e.scrollLeft >= r.x;
  return {
    isTop: s,
    isLeft: o,
    isBottom: i,
    isRight: l,
    maxScroll: r,
    minScroll: t
  };
}
const wo = {
  x: 0.2,
  y: 0.2
};
function yo(e, t, n, r, s) {
  let {
    top: o,
    left: i,
    right: l,
    bottom: c
  } = n;
  r === void 0 && (r = 10), s === void 0 && (s = wo);
  const {
    isTop: a,
    isBottom: u,
    isLeft: d,
    isRight: h
  } = Ir(e), f = {
    x: 0,
    y: 0
  }, g = {
    x: 0,
    y: 0
  }, m = {
    height: t.height * s.y,
    width: t.width * s.x
  };
  return !a && o <= t.top + m.height ? (f.y = j.Backward, g.y = r * Math.abs((t.top + m.height - o) / m.height)) : !u && c >= t.bottom - m.height && (f.y = j.Forward, g.y = r * Math.abs((t.bottom - m.height - c) / m.height)), !h && l >= t.right - m.width ? (f.x = j.Forward, g.x = r * Math.abs((t.right - m.width - l) / m.width)) : !d && i <= t.left + m.width && (f.x = j.Backward, g.x = r * Math.abs((t.left + m.width - i) / m.width)), {
    direction: f,
    speed: g
  };
}
function xo(e) {
  if (e === document.scrollingElement) {
    const {
      innerWidth: o,
      innerHeight: i
    } = window;
    return {
      top: 0,
      left: 0,
      right: o,
      bottom: i,
      width: o,
      height: i
    };
  }
  const {
    top: t,
    left: n,
    right: r,
    bottom: s
  } = e.getBoundingClientRect();
  return {
    top: t,
    left: n,
    right: r,
    bottom: s,
    width: e.clientWidth,
    height: e.clientHeight
  };
}
function Mr(e) {
  return e.reduce((t, n) => je(t, sn(n)), ce);
}
function So(e) {
  return e.reduce((t, n) => t + Er(n), 0);
}
function Co(e) {
  return e.reduce((t, n) => t + Dr(n), 0);
}
function Ro(e, t) {
  if (t === void 0 && (t = Ue), !e)
    return;
  const {
    top: n,
    left: r,
    bottom: s,
    right: o
  } = t(e);
  Rr(e) && (s <= 0 || o <= 0 || n >= window.innerHeight || r >= window.innerWidth) && e.scrollIntoView({
    block: "center",
    inline: "center"
  });
}
const Eo = [["x", ["left", "right"], So], ["y", ["top", "bottom"], Co]];
class yn {
  constructor(t, n) {
    this.rect = void 0, this.width = void 0, this.height = void 0, this.top = void 0, this.bottom = void 0, this.right = void 0, this.left = void 0;
    const r = wn(n), s = Mr(r);
    this.rect = {
      ...t
    }, this.width = t.width, this.height = t.height;
    for (const [o, i, l] of Eo)
      for (const c of i)
        Object.defineProperty(this, c, {
          get: () => {
            const a = l(r), u = s[o] - a;
            return this.rect[c] + u;
          },
          enumerable: !0
        });
    Object.defineProperty(this, "rect", {
      enumerable: !1
    });
  }
}
class rt {
  constructor(t) {
    this.target = void 0, this.listeners = [], this.removeAll = () => {
      this.listeners.forEach((n) => {
        var r;
        return (r = this.target) == null ? void 0 : r.removeEventListener(...n);
      });
    }, this.target = t;
  }
  add(t, n, r) {
    var s;
    (s = this.target) == null || s.addEventListener(t, n, r), this.listeners.push([t, n, r]);
  }
}
function Do(e) {
  const {
    EventTarget: t
  } = Q(e);
  return e instanceof t ? e : Ge(e);
}
function Jt(e, t) {
  const n = Math.abs(e.x), r = Math.abs(e.y);
  return typeof t == "number" ? Math.sqrt(n ** 2 + r ** 2) > t : "x" in t && "y" in t ? n > t.x && r > t.y : "x" in t ? n > t.x : "y" in t ? r > t.y : !1;
}
var le;
(function(e) {
  e.Click = "click", e.DragStart = "dragstart", e.Keydown = "keydown", e.ContextMenu = "contextmenu", e.Resize = "resize", e.SelectionChange = "selectionchange", e.VisibilityChange = "visibilitychange";
})(le || (le = {}));
function jn(e) {
  e.preventDefault();
}
function Oo(e) {
  e.stopPropagation();
}
var N;
(function(e) {
  e.Space = "Space", e.Down = "ArrowDown", e.Right = "ArrowRight", e.Left = "ArrowLeft", e.Up = "ArrowUp", e.Esc = "Escape", e.Enter = "Enter", e.Tab = "Tab";
})(N || (N = {}));
const Tr = {
  start: [N.Space, N.Enter],
  cancel: [N.Esc],
  end: [N.Space, N.Enter, N.Tab]
}, Io = (e, t) => {
  let {
    currentCoordinates: n
  } = t;
  switch (e.code) {
    case N.Right:
      return {
        ...n,
        x: n.x + 25
      };
    case N.Left:
      return {
        ...n,
        x: n.x - 25
      };
    case N.Down:
      return {
        ...n,
        y: n.y + 25
      };
    case N.Up:
      return {
        ...n,
        y: n.y - 25
      };
  }
};
class xn {
  constructor(t) {
    this.props = void 0, this.autoScrollEnabled = !1, this.referenceCoordinates = void 0, this.listeners = void 0, this.windowListeners = void 0, this.props = t;
    const {
      event: {
        target: n
      }
    } = t;
    this.props = t, this.listeners = new rt(Ge(n)), this.windowListeners = new rt(Q(n)), this.handleKeyDown = this.handleKeyDown.bind(this), this.handleCancel = this.handleCancel.bind(this), this.attach();
  }
  attach() {
    this.handleStart(), this.windowListeners.add(le.Resize, this.handleCancel), this.windowListeners.add(le.VisibilityChange, this.handleCancel), setTimeout(() => this.listeners.add(le.Keydown, this.handleKeyDown));
  }
  handleStart() {
    const {
      activeNode: t,
      onStart: n
    } = this.props, r = t.node.current;
    r && Ro(r), n(ce);
  }
  handleKeyDown(t) {
    if (bn(t)) {
      const {
        active: n,
        context: r,
        options: s
      } = this.props, {
        keyboardCodes: o = Tr,
        coordinateGetter: i = Io,
        scrollBehavior: l = "smooth"
      } = s, {
        code: c
      } = t;
      if (o.end.includes(c)) {
        this.handleEnd(t);
        return;
      }
      if (o.cancel.includes(c)) {
        this.handleCancel(t);
        return;
      }
      const {
        collisionRect: a
      } = r.current, u = a ? {
        x: a.left,
        y: a.top
      } : ce;
      this.referenceCoordinates || (this.referenceCoordinates = u);
      const d = i(t, {
        active: n,
        context: r.current,
        currentCoordinates: u
      });
      if (d) {
        const h = Tt(d, u), f = {
          x: 0,
          y: 0
        }, {
          scrollableAncestors: g
        } = r.current;
        for (const m of g) {
          const v = t.code, {
            isTop: p,
            isRight: b,
            isLeft: w,
            isBottom: x,
            maxScroll: y,
            minScroll: S
          } = Ir(m), C = xo(m), E = {
            x: Math.min(v === N.Right ? C.right - C.width / 2 : C.right, Math.max(v === N.Right ? C.left : C.left + C.width / 2, d.x)),
            y: Math.min(v === N.Down ? C.bottom - C.height / 2 : C.bottom, Math.max(v === N.Down ? C.top : C.top + C.height / 2, d.y))
          }, A = v === N.Right && !b || v === N.Left && !w, M = v === N.Down && !x || v === N.Up && !p;
          if (A && E.x !== d.x) {
            const R = m.scrollLeft + h.x, L = v === N.Right && R <= y.x || v === N.Left && R >= S.x;
            if (L && !h.y) {
              m.scrollTo({
                left: R,
                behavior: l
              });
              return;
            }
            L ? f.x = m.scrollLeft - R : f.x = v === N.Right ? m.scrollLeft - y.x : m.scrollLeft - S.x, f.x && m.scrollBy({
              left: -f.x,
              behavior: l
            });
            break;
          } else if (M && E.y !== d.y) {
            const R = m.scrollTop + h.y, L = v === N.Down && R <= y.y || v === N.Up && R >= S.y;
            if (L && !h.x) {
              m.scrollTo({
                top: R,
                behavior: l
              });
              return;
            }
            L ? f.y = m.scrollTop - R : f.y = v === N.Down ? m.scrollTop - y.y : m.scrollTop - S.y, f.y && m.scrollBy({
              top: -f.y,
              behavior: l
            });
            break;
          }
        }
        this.handleMove(t, je(Tt(d, this.referenceCoordinates), f));
      }
    }
  }
  handleMove(t, n) {
    const {
      onMove: r
    } = this.props;
    t.preventDefault(), r(n);
  }
  handleEnd(t) {
    const {
      onEnd: n
    } = this.props;
    t.preventDefault(), this.detach(), n();
  }
  handleCancel(t) {
    const {
      onCancel: n
    } = this.props;
    t.preventDefault(), this.detach(), n();
  }
  detach() {
    this.listeners.removeAll(), this.windowListeners.removeAll();
  }
}
xn.activators = [{
  eventName: "onKeyDown",
  handler: (e, t, n) => {
    let {
      keyboardCodes: r = Tr,
      onActivation: s
    } = t, {
      active: o
    } = n;
    const {
      code: i
    } = e.nativeEvent;
    if (r.start.includes(i)) {
      const l = o.activatorNode.current;
      return l && e.target !== l ? !1 : (e.preventDefault(), s == null || s({
        event: e.nativeEvent
      }), !0);
    }
    return !1;
  }
}];
function Kn(e) {
  return !!(e && "distance" in e);
}
function Xn(e) {
  return !!(e && "delay" in e);
}
class Sn {
  constructor(t, n, r) {
    var s;
    r === void 0 && (r = Do(t.event.target)), this.props = void 0, this.events = void 0, this.autoScrollEnabled = !0, this.document = void 0, this.activated = !1, this.initialCoordinates = void 0, this.timeoutId = null, this.listeners = void 0, this.documentListeners = void 0, this.windowListeners = void 0, this.props = t, this.events = n;
    const {
      event: o
    } = t, {
      target: i
    } = o;
    this.props = t, this.events = n, this.document = Ge(i), this.documentListeners = new rt(this.document), this.listeners = new rt(r), this.windowListeners = new rt(Q(i)), this.initialCoordinates = (s = rn(o)) != null ? s : ce, this.handleStart = this.handleStart.bind(this), this.handleMove = this.handleMove.bind(this), this.handleEnd = this.handleEnd.bind(this), this.handleCancel = this.handleCancel.bind(this), this.handleKeydown = this.handleKeydown.bind(this), this.removeTextSelection = this.removeTextSelection.bind(this), this.attach();
  }
  attach() {
    const {
      events: t,
      props: {
        options: {
          activationConstraint: n,
          bypassActivationConstraint: r
        }
      }
    } = this;
    if (this.listeners.add(t.move.name, this.handleMove, {
      passive: !1
    }), this.listeners.add(t.end.name, this.handleEnd), t.cancel && this.listeners.add(t.cancel.name, this.handleCancel), this.windowListeners.add(le.Resize, this.handleCancel), this.windowListeners.add(le.DragStart, jn), this.windowListeners.add(le.VisibilityChange, this.handleCancel), this.windowListeners.add(le.ContextMenu, jn), this.documentListeners.add(le.Keydown, this.handleKeydown), n) {
      if (r != null && r({
        event: this.props.event,
        activeNode: this.props.activeNode,
        options: this.props.options
      }))
        return this.handleStart();
      if (Xn(n)) {
        this.timeoutId = setTimeout(this.handleStart, n.delay), this.handlePending(n);
        return;
      }
      if (Kn(n)) {
        this.handlePending(n);
        return;
      }
    }
    this.handleStart();
  }
  detach() {
    this.listeners.removeAll(), this.windowListeners.removeAll(), setTimeout(this.documentListeners.removeAll, 50), this.timeoutId !== null && (clearTimeout(this.timeoutId), this.timeoutId = null);
  }
  handlePending(t, n) {
    const {
      active: r,
      onPending: s
    } = this.props;
    s(r, t, this.initialCoordinates, n);
  }
  handleStart() {
    const {
      initialCoordinates: t
    } = this, {
      onStart: n
    } = this.props;
    t && (this.activated = !0, this.documentListeners.add(le.Click, Oo, {
      capture: !0
    }), this.removeTextSelection(), this.documentListeners.add(le.SelectionChange, this.removeTextSelection), n(t));
  }
  handleMove(t) {
    var n;
    const {
      activated: r,
      initialCoordinates: s,
      props: o
    } = this, {
      onMove: i,
      options: {
        activationConstraint: l
      }
    } = o;
    if (!s)
      return;
    const c = (n = rn(t)) != null ? n : ce, a = Tt(s, c);
    if (!r && l) {
      if (Kn(l)) {
        if (l.tolerance != null && Jt(a, l.tolerance))
          return this.handleCancel();
        if (Jt(a, l.distance))
          return this.handleStart();
      }
      if (Xn(l) && Jt(a, l.tolerance))
        return this.handleCancel();
      this.handlePending(l, a);
      return;
    }
    t.cancelable && t.preventDefault(), i(c);
  }
  handleEnd() {
    const {
      onAbort: t,
      onEnd: n
    } = this.props;
    this.detach(), this.activated || t(this.props.active), n();
  }
  handleCancel() {
    const {
      onAbort: t,
      onCancel: n
    } = this.props;
    this.detach(), this.activated || t(this.props.active), n();
  }
  handleKeydown(t) {
    t.code === N.Esc && this.handleCancel();
  }
  removeTextSelection() {
    var t;
    (t = this.document.getSelection()) == null || t.removeAllRanges();
  }
}
const Mo = {
  cancel: {
    name: "pointercancel"
  },
  move: {
    name: "pointermove"
  },
  end: {
    name: "pointerup"
  }
};
class Cn extends Sn {
  constructor(t) {
    const {
      event: n
    } = t, r = Ge(n.target);
    super(t, Mo, r);
  }
}
Cn.activators = [{
  eventName: "onPointerDown",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    return !n.isPrimary || n.button !== 0 ? !1 : (r == null || r({
      event: n
    }), !0);
  }
}];
const To = {
  move: {
    name: "mousemove"
  },
  end: {
    name: "mouseup"
  }
};
var on;
(function(e) {
  e[e.RightClick = 2] = "RightClick";
})(on || (on = {}));
class Ao extends Sn {
  constructor(t) {
    super(t, To, Ge(t.event.target));
  }
}
Ao.activators = [{
  eventName: "onMouseDown",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    return n.button === on.RightClick ? !1 : (r == null || r({
      event: n
    }), !0);
  }
}];
const Qt = {
  cancel: {
    name: "touchcancel"
  },
  move: {
    name: "touchmove"
  },
  end: {
    name: "touchend"
  }
};
class Ar extends Sn {
  constructor(t) {
    super(t, Qt);
  }
  static setup() {
    return window.addEventListener(Qt.move.name, t, {
      capture: !1,
      passive: !1
    }), function() {
      window.removeEventListener(Qt.move.name, t);
    };
    function t() {
    }
  }
}
Ar.activators = [{
  eventName: "onTouchStart",
  handler: (e, t) => {
    let {
      nativeEvent: n
    } = e, {
      onActivation: r
    } = t;
    const {
      touches: s
    } = n;
    return s.length > 1 ? !1 : (r == null || r({
      event: n
    }), !0);
  }
}];
var st;
(function(e) {
  e[e.Pointer = 0] = "Pointer", e[e.DraggableRect = 1] = "DraggableRect";
})(st || (st = {}));
var Lt;
(function(e) {
  e[e.TreeOrder = 0] = "TreeOrder", e[e.ReversedTreeOrder = 1] = "ReversedTreeOrder";
})(Lt || (Lt = {}));
function Lo(e) {
  let {
    acceleration: t,
    activator: n = st.Pointer,
    canScroll: r,
    draggingRect: s,
    enabled: o,
    interval: i = 5,
    order: l = Lt.TreeOrder,
    pointerCoordinates: c,
    scrollableAncestors: a,
    scrollableAncestorRects: u,
    delta: d,
    threshold: h
  } = e;
  const f = _o({
    delta: d,
    disabled: !o
  }), [g, m] = Xs(), v = P({
    x: 0,
    y: 0
  }), p = P({
    x: 0,
    y: 0
  }), b = $(() => {
    switch (n) {
      case st.Pointer:
        return c ? {
          top: c.y,
          bottom: c.y,
          left: c.x,
          right: c.x
        } : null;
      case st.DraggableRect:
        return s;
    }
  }, [n, s, c]), w = P(null), x = G(() => {
    const S = w.current;
    if (!S)
      return;
    const C = v.current.x * p.current.x, E = v.current.y * p.current.y;
    S.scrollBy(C, E);
  }, []), y = $(() => l === Lt.TreeOrder ? [...a].reverse() : a, [l, a]);
  F(
    () => {
      if (!o || !a.length || !b) {
        m();
        return;
      }
      for (const S of y) {
        if ((r == null ? void 0 : r(S)) === !1)
          continue;
        const C = a.indexOf(S), E = u[C];
        if (!E)
          continue;
        const {
          direction: A,
          speed: M
        } = yo(S, E, b, t, h);
        for (const R of ["x", "y"])
          f[R][A[R]] || (M[R] = 0, A[R] = 0);
        if (M.x > 0 || M.y > 0) {
          m(), w.current = S, g(x, i), v.current = M, p.current = A;
          return;
        }
      }
      v.current = {
        x: 0,
        y: 0
      }, p.current = {
        x: 0,
        y: 0
      }, m();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      t,
      x,
      r,
      m,
      o,
      i,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(b),
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(f),
      g,
      a,
      y,
      u,
      // eslint-disable-next-line react-hooks/exhaustive-deps
      JSON.stringify(h)
    ]
  );
}
const No = {
  x: {
    [j.Backward]: !1,
    [j.Forward]: !1
  },
  y: {
    [j.Backward]: !1,
    [j.Forward]: !1
  }
};
function _o(e) {
  let {
    delta: t,
    disabled: n
  } = e;
  const r = nn(t);
  return gt((s) => {
    if (n || !r || !s)
      return No;
    const o = {
      x: Math.sign(t.x - r.x),
      y: Math.sign(t.y - r.y)
    };
    return {
      x: {
        [j.Backward]: s.x[j.Backward] || o.x === -1,
        [j.Forward]: s.x[j.Forward] || o.x === 1
      },
      y: {
        [j.Backward]: s.y[j.Backward] || o.y === -1,
        [j.Forward]: s.y[j.Forward] || o.y === 1
      }
    };
  }, [n, t, r]);
}
function zo(e, t) {
  const n = t != null ? e.get(t) : void 0, r = n ? n.node.current : null;
  return gt((s) => {
    var o;
    return t == null ? null : (o = r ?? s) != null ? o : null;
  }, [r, t]);
}
function ko(e, t) {
  return $(() => e.reduce((n, r) => {
    const {
      sensor: s
    } = r, o = s.activators.map((i) => ({
      eventName: i.eventName,
      handler: t(i.handler, r)
    }));
    return [...n, ...o];
  }, []), [e, t]);
}
var ut;
(function(e) {
  e[e.Always = 0] = "Always", e[e.BeforeDragging = 1] = "BeforeDragging", e[e.WhileDragging = 2] = "WhileDragging";
})(ut || (ut = {}));
var ln;
(function(e) {
  e.Optimized = "optimized";
})(ln || (ln = {}));
const Hn = /* @__PURE__ */ new Map();
function Fo(e, t) {
  let {
    dragging: n,
    dependencies: r,
    config: s
  } = t;
  const [o, i] = ne(null), {
    frequency: l,
    measure: c,
    strategy: a
  } = s, u = P(e), d = v(), h = ct(d), f = G(function(p) {
    p === void 0 && (p = []), !h.current && i((b) => b === null ? p : b.concat(p.filter((w) => !b.includes(w))));
  }, [h]), g = P(null), m = gt((p) => {
    if (d && !n)
      return Hn;
    if (!p || p === Hn || u.current !== e || o != null) {
      const b = /* @__PURE__ */ new Map();
      for (let w of e) {
        if (!w)
          continue;
        if (o && o.length > 0 && !o.includes(w.id) && w.rect.current) {
          b.set(w.id, w.rect.current);
          continue;
        }
        const x = w.node.current, y = x ? new yn(c(x), x) : null;
        w.rect.current = y, y && b.set(w.id, y);
      }
      return b;
    }
    return p;
  }, [e, o, n, d, c]);
  return F(() => {
    u.current = e;
  }, [e]), F(
    () => {
      d || f();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n, d]
  ), F(
    () => {
      o && o.length > 0 && i(null);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(o)]
  ), F(
    () => {
      d || typeof l != "number" || g.current !== null || (g.current = setTimeout(() => {
        f(), g.current = null;
      }, l));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [l, d, f, ...r]
  ), {
    droppableRects: m,
    measureDroppableContainers: f,
    measuringScheduled: o != null
  };
  function v() {
    switch (a) {
      case ut.Always:
        return !1;
      case ut.BeforeDragging:
        return n;
      default:
        return !n;
    }
  }
}
function Lr(e, t) {
  return gt((n) => e ? n || (typeof t == "function" ? t(e) : e) : null, [t, e]);
}
function $o(e, t) {
  return Lr(e, t);
}
function Po(e) {
  let {
    callback: t,
    disabled: n
  } = e;
  const r = vn(t), s = $(() => {
    if (n || typeof window > "u" || typeof window.MutationObserver > "u")
      return;
    const {
      MutationObserver: o
    } = window;
    return new o(r);
  }, [r, n]);
  return F(() => () => s == null ? void 0 : s.disconnect(), [s]), s;
}
function Bt(e) {
  let {
    callback: t,
    disabled: n
  } = e;
  const r = vn(t), s = $(
    () => {
      if (n || typeof window > "u" || typeof window.ResizeObserver > "u")
        return;
      const {
        ResizeObserver: o
      } = window;
      return new o(r);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [n]
  );
  return F(() => () => s == null ? void 0 : s.disconnect(), [s]), s;
}
function Bo(e) {
  return new yn(Ue(e), e);
}
function Yn(e, t, n) {
  t === void 0 && (t = Bo);
  const [r, s] = ne(null);
  function o() {
    s((c) => {
      if (!e)
        return null;
      if (e.isConnected === !1) {
        var a;
        return (a = c ?? n) != null ? a : null;
      }
      const u = t(e);
      return JSON.stringify(c) === JSON.stringify(u) ? c : u;
    });
  }
  const i = Po({
    callback(c) {
      if (e)
        for (const a of c) {
          const {
            type: u,
            target: d
          } = a;
          if (u === "childList" && d instanceof HTMLElement && d.contains(e)) {
            o();
            break;
          }
        }
    }
  }), l = Bt({
    callback: o
  });
  return ge(() => {
    o(), e ? (l == null || l.observe(e), i == null || i.observe(document.body, {
      childList: !0,
      subtree: !0
    })) : (l == null || l.disconnect(), i == null || i.disconnect());
  }, [e]), r;
}
function Wo(e) {
  const t = Lr(e);
  return Cr(e, t);
}
const Gn = [];
function Vo(e) {
  const t = P(e), n = gt((r) => e ? r && r !== Gn && e && t.current && e.parentNode === t.current.parentNode ? r : wn(e) : Gn, [e]);
  return F(() => {
    t.current = e;
  }, [e]), n;
}
function jo(e) {
  const [t, n] = ne(null), r = P(e), s = G((o) => {
    const i = qt(o.target);
    i && n((l) => l ? (l.set(i, sn(i)), new Map(l)) : null);
  }, []);
  return F(() => {
    const o = r.current;
    if (e !== o) {
      i(o);
      const l = e.map((c) => {
        const a = qt(c);
        return a ? (a.addEventListener("scroll", s, {
          passive: !0
        }), [a, sn(a)]) : null;
      }).filter((c) => c != null);
      n(l.length ? new Map(l) : null), r.current = e;
    }
    return () => {
      i(e), i(o);
    };
    function i(l) {
      l.forEach((c) => {
        const a = qt(c);
        a == null || a.removeEventListener("scroll", s);
      });
    }
  }, [s, e]), $(() => e.length ? t ? Array.from(t.values()).reduce((o, i) => je(o, i), ce) : Mr(e) : ce, [e, t]);
}
function Un(e, t) {
  t === void 0 && (t = []);
  const n = P(null);
  return F(
    () => {
      n.current = null;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    t
  ), F(() => {
    const r = e !== ce;
    r && !n.current && (n.current = e), !r && n.current && (n.current = null);
  }, [e]), n.current ? Tt(e, n.current) : ce;
}
function Ko(e) {
  F(
    () => {
      if (!Pt)
        return;
      const t = e.map((n) => {
        let {
          sensor: r
        } = n;
        return r.setup == null ? void 0 : r.setup();
      });
      return () => {
        for (const n of t)
          n == null || n();
      };
    },
    // TO-DO: Sensors length could theoretically change which would not be a valid dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
    e.map((t) => {
      let {
        sensor: n
      } = t;
      return n;
    })
  );
}
function Xo(e, t) {
  return $(() => e.reduce((n, r) => {
    let {
      eventName: s,
      handler: o
    } = r;
    return n[s] = (i) => {
      o(i, t);
    }, n;
  }, {}), [e, t]);
}
function Nr(e) {
  return $(() => e ? po(e) : null, [e]);
}
const qn = [];
function Ho(e, t) {
  t === void 0 && (t = Ue);
  const [n] = e, r = Nr(n ? Q(n) : null), [s, o] = ne(qn);
  function i() {
    o(() => e.length ? e.map((c) => Or(c) ? r : new yn(t(c), c)) : qn);
  }
  const l = Bt({
    callback: i
  });
  return ge(() => {
    l == null || l.disconnect(), i(), e.forEach((c) => l == null ? void 0 : l.observe(c));
  }, [e]), s;
}
function Yo(e) {
  if (!e)
    return null;
  if (e.children.length > 1)
    return e;
  const t = e.children[0];
  return ht(t) ? t : e;
}
function Go(e) {
  let {
    measure: t
  } = e;
  const [n, r] = ne(null), s = G((a) => {
    for (const {
      target: u
    } of a)
      if (ht(u)) {
        r((d) => {
          const h = t(u);
          return d ? {
            ...d,
            width: h.width,
            height: h.height
          } : h;
        });
        break;
      }
  }, [t]), o = Bt({
    callback: s
  }), i = G((a) => {
    const u = Yo(a);
    o == null || o.disconnect(), u && (o == null || o.observe(u)), r(u ? t(u) : null);
  }, [t, o]), [l, c] = Mt(i);
  return $(() => ({
    nodeRef: l,
    rect: n,
    setRef: c
  }), [n, l, c]);
}
const Uo = [{
  sensor: Cn,
  options: {}
}, {
  sensor: xn,
  options: {}
}], qo = {
  current: {}
}, Et = {
  draggable: {
    measure: Vn
  },
  droppable: {
    measure: Vn,
    strategy: ut.WhileDragging,
    frequency: ln.Optimized
  },
  dragOverlay: {
    measure: Ue
  }
};
class ot extends Map {
  get(t) {
    var n;
    return t != null && (n = super.get(t)) != null ? n : void 0;
  }
  toArray() {
    return Array.from(this.values());
  }
  getEnabled() {
    return this.toArray().filter((t) => {
      let {
        disabled: n
      } = t;
      return !n;
    });
  }
  getNodeFor(t) {
    var n, r;
    return (n = (r = this.get(t)) == null ? void 0 : r.node.current) != null ? n : void 0;
  }
}
const Jo = {
  activatorEvent: null,
  active: null,
  activeNode: null,
  activeNodeRect: null,
  collisions: null,
  containerNodeRect: null,
  draggableNodes: /* @__PURE__ */ new Map(),
  droppableRects: /* @__PURE__ */ new Map(),
  droppableContainers: /* @__PURE__ */ new ot(),
  over: null,
  dragOverlay: {
    nodeRef: {
      current: null
    },
    rect: null,
    setRef: At
  },
  scrollableAncestors: [],
  scrollableAncestorRects: [],
  measuringConfiguration: Et,
  measureDroppableContainers: At,
  windowRect: null,
  measuringScheduled: !1
}, Qo = {
  activatorEvent: null,
  activators: [],
  active: null,
  activeNodeRect: null,
  ariaDescribedById: {
    draggable: ""
  },
  dispatch: At,
  draggableNodes: /* @__PURE__ */ new Map(),
  over: null,
  measureDroppableContainers: At
}, Wt = /* @__PURE__ */ ft(Qo), _r = /* @__PURE__ */ ft(Jo);
function Zo() {
  return {
    draggable: {
      active: null,
      initialCoordinates: {
        x: 0,
        y: 0
      },
      nodes: /* @__PURE__ */ new Map(),
      translate: {
        x: 0,
        y: 0
      }
    },
    droppable: {
      containers: new ot()
    }
  };
}
function ei(e, t) {
  switch (t.type) {
    case W.DragStart:
      return {
        ...e,
        draggable: {
          ...e.draggable,
          initialCoordinates: t.initialCoordinates,
          active: t.active
        }
      };
    case W.DragMove:
      return e.draggable.active == null ? e : {
        ...e,
        draggable: {
          ...e.draggable,
          translate: {
            x: t.coordinates.x - e.draggable.initialCoordinates.x,
            y: t.coordinates.y - e.draggable.initialCoordinates.y
          }
        }
      };
    case W.DragEnd:
    case W.DragCancel:
      return {
        ...e,
        draggable: {
          ...e.draggable,
          active: null,
          initialCoordinates: {
            x: 0,
            y: 0
          },
          translate: {
            x: 0,
            y: 0
          }
        }
      };
    case W.RegisterDroppable: {
      const {
        element: n
      } = t, {
        id: r
      } = n, s = new ot(e.droppable.containers);
      return s.set(r, n), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: s
        }
      };
    }
    case W.SetDroppableDisabled: {
      const {
        id: n,
        key: r,
        disabled: s
      } = t, o = e.droppable.containers.get(n);
      if (!o || r !== o.key)
        return e;
      const i = new ot(e.droppable.containers);
      return i.set(n, {
        ...o,
        disabled: s
      }), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: i
        }
      };
    }
    case W.UnregisterDroppable: {
      const {
        id: n,
        key: r
      } = t, s = e.droppable.containers.get(n);
      if (!s || r !== s.key)
        return e;
      const o = new ot(e.droppable.containers);
      return o.delete(n), {
        ...e,
        droppable: {
          ...e.droppable,
          containers: o
        }
      };
    }
    default:
      return e;
  }
}
function ti(e) {
  let {
    disabled: t
  } = e;
  const {
    active: n,
    activatorEvent: r,
    draggableNodes: s
  } = Le(Wt), o = nn(r), i = nn(n == null ? void 0 : n.id);
  return F(() => {
    if (!t && !r && o && i != null) {
      if (!bn(o) || document.activeElement === o.target)
        return;
      const l = s.get(i);
      if (!l)
        return;
      const {
        activatorNode: c,
        node: a
      } = l;
      if (!c.current && !a.current)
        return;
      requestAnimationFrame(() => {
        for (const u of [c.current, a.current]) {
          if (!u)
            continue;
          const d = Gs(u);
          if (d) {
            d.focus();
            break;
          }
        }
      });
    }
  }, [r, t, s, i, o]), null;
}
function ni(e, t) {
  let {
    transform: n,
    ...r
  } = t;
  return e != null && e.length ? e.reduce((s, o) => o({
    transform: s,
    ...r
  }), n) : n;
}
function ri(e) {
  return $(
    () => ({
      draggable: {
        ...Et.draggable,
        ...e == null ? void 0 : e.draggable
      },
      droppable: {
        ...Et.droppable,
        ...e == null ? void 0 : e.droppable
      },
      dragOverlay: {
        ...Et.dragOverlay,
        ...e == null ? void 0 : e.dragOverlay
      }
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [e == null ? void 0 : e.draggable, e == null ? void 0 : e.droppable, e == null ? void 0 : e.dragOverlay]
  );
}
function si(e) {
  let {
    activeNode: t,
    measure: n,
    initialRect: r,
    config: s = !0
  } = e;
  const o = P(!1), {
    x: i,
    y: l
  } = typeof s == "boolean" ? {
    x: s,
    y: s
  } : s;
  ge(() => {
    if (!i && !l || !t) {
      o.current = !1;
      return;
    }
    if (o.current || !r)
      return;
    const a = t == null ? void 0 : t.node.current;
    if (!a || a.isConnected === !1)
      return;
    const u = n(a), d = Cr(u, r);
    if (i || (d.x = 0), l || (d.y = 0), o.current = !0, Math.abs(d.x) > 0 || Math.abs(d.y) > 0) {
      const h = Rr(a);
      h && h.scrollBy({
        top: d.y,
        left: d.x
      });
    }
  }, [t, i, l, r, n]);
}
const zr = /* @__PURE__ */ ft({
  ...ce,
  scaleX: 1,
  scaleY: 1
});
var Oe;
(function(e) {
  e[e.Uninitialized = 0] = "Uninitialized", e[e.Initializing = 1] = "Initializing", e[e.Initialized = 2] = "Initialized";
})(Oe || (Oe = {}));
const oi = /* @__PURE__ */ Jr(function(t) {
  var n, r, s, o;
  let {
    id: i,
    accessibility: l,
    autoScroll: c = !0,
    children: a,
    sensors: u = Uo,
    collisionDetection: d = co,
    measuring: h,
    modifiers: f,
    ...g
  } = t;
  const m = Qr(ei, void 0, Zo), [v, p] = m, [b, w] = eo(), [x, y] = ne(Oe.Uninitialized), S = x === Oe.Initialized, {
    draggable: {
      active: C,
      nodes: E,
      translate: A
    },
    droppable: {
      containers: M
    }
  } = v, R = C != null ? E.get(C) : null, L = P({
    initial: null,
    translated: null
  }), T = $(() => {
    var Y;
    return C != null ? {
      id: C,
      // It's possible for the active node to unmount while dragging
      data: (Y = R == null ? void 0 : R.data) != null ? Y : qo,
      rect: L
    } : null;
  }, [C, R]), _ = P(null), [V, X] = ne(null), [H, B] = ne(null), U = ct(g, Object.values(g)), se = mt("DndDescribedBy", i), pt = $(() => M.getEnabled(), [M]), q = ri(h), {
    droppableRects: me,
    measureDroppableContainers: Me,
    measuringScheduled: qe
  } = Fo(pt, {
    dragging: S,
    dependencies: [A.x, A.y],
    config: q.droppable
  }), oe = zo(E, C), vt = $(() => H ? rn(H) : null, [H]), xe = qr(), pe = $o(oe, q.draggable.measure);
  si({
    activeNode: C != null ? E.get(C) : null,
    config: xe.layoutShiftCompensation,
    initialRect: pe,
    measure: q.draggable.measure
  });
  const k = Yn(oe, q.draggable.measure, pe), Je = Yn(oe ? oe.parentElement : null), ae = P({
    activatorEvent: null,
    active: null,
    activeNode: oe,
    collisionRect: null,
    collisions: null,
    droppableRects: me,
    draggableNodes: E,
    draggingNode: null,
    draggingNodeRect: null,
    droppableContainers: M,
    over: null,
    scrollableAncestors: [],
    scrollAdjustedTranslate: null
  }), ze = M.getNodeFor((n = ae.current.over) == null ? void 0 : n.id), ve = Go({
    measure: q.dragOverlay.measure
  }), ke = (r = ve.nodeRef.current) != null ? r : oe, Fe = S ? (s = ve.rect) != null ? s : k : null, On = !!(ve.nodeRef.current && ve.rect), In = Wo(On ? null : k), Vt = Nr(ke ? Q(ke) : null), Se = Vo(S ? ze ?? oe : null), bt = Ho(Se), wt = ni(f, {
    transform: {
      x: A.x - In.x,
      y: A.y - In.y,
      scaleX: 1,
      scaleY: 1
    },
    activatorEvent: H,
    active: T,
    activeNodeRect: k,
    containerNodeRect: Je,
    draggingNodeRect: Fe,
    over: ae.current.over,
    overlayNodeRect: ve.rect,
    scrollableAncestors: Se,
    scrollableAncestorRects: bt,
    windowRect: Vt
  }), Mn = vt ? je(vt, A) : null, Tn = jo(Se), jr = Un(Tn), Kr = Un(Tn, [k]), $e = je(wt, jr), Pe = Fe ? fo(Fe, wt) : null, Qe = T && Pe ? d({
    active: T,
    collisionRect: Pe,
    droppableRects: me,
    droppableContainers: pt,
    pointerCoordinates: Mn
  }) : null, An = io(Qe, "id"), [Ce, Ln] = ne(null), Xr = On ? wt : je(wt, Kr), Hr = ao(Xr, (o = Ce == null ? void 0 : Ce.rect) != null ? o : null, k), jt = P(null), Nn = G(
    (Y, Z) => {
      let {
        sensor: ee,
        options: Re
      } = Z;
      if (_.current == null)
        return;
      const ie = E.get(_.current);
      if (!ie)
        return;
      const te = Y.nativeEvent, ue = new ee({
        active: _.current,
        activeNode: ie,
        event: te,
        options: Re,
        // Sensors need to be instantiated with refs for arguments that change over time
        // otherwise they are frozen in time with the stale arguments
        context: ae,
        onAbort(K) {
          if (!E.get(K))
            return;
          const {
            onDragAbort: de
          } = U.current, be = {
            id: K
          };
          de == null || de(be), b({
            type: "onDragAbort",
            event: be
          });
        },
        onPending(K, Ee, de, be) {
          if (!E.get(K))
            return;
          const {
            onDragPending: et
          } = U.current, De = {
            id: K,
            constraint: Ee,
            initialCoordinates: de,
            offset: be
          };
          et == null || et(De), b({
            type: "onDragPending",
            event: De
          });
        },
        onStart(K) {
          const Ee = _.current;
          if (Ee == null)
            return;
          const de = E.get(Ee);
          if (!de)
            return;
          const {
            onDragStart: be
          } = U.current, Ze = {
            activatorEvent: te,
            active: {
              id: Ee,
              data: de.data,
              rect: L
            }
          };
          yt(() => {
            be == null || be(Ze), y(Oe.Initializing), p({
              type: W.DragStart,
              initialCoordinates: K,
              active: Ee
            }), b({
              type: "onDragStart",
              event: Ze
            }), X(jt.current), B(te);
          });
        },
        onMove(K) {
          p({
            type: W.DragMove,
            coordinates: K
          });
        },
        onEnd: Be(W.DragEnd),
        onCancel: Be(W.DragCancel)
      });
      jt.current = ue;
      function Be(K) {
        return async function() {
          const {
            active: de,
            collisions: be,
            over: Ze,
            scrollAdjustedTranslate: et
          } = ae.current;
          let De = null;
          if (de && et) {
            const {
              cancelDrop: tt
            } = U.current;
            De = {
              activatorEvent: te,
              active: de,
              collisions: be,
              delta: et,
              over: Ze
            }, K === W.DragEnd && typeof tt == "function" && await Promise.resolve(tt(De)) && (K = W.DragCancel);
          }
          _.current = null, yt(() => {
            p({
              type: K
            }), y(Oe.Uninitialized), Ln(null), X(null), B(null), jt.current = null;
            const tt = K === W.DragEnd ? "onDragEnd" : "onDragCancel";
            if (De) {
              const Kt = U.current[tt];
              Kt == null || Kt(De), b({
                type: tt,
                event: De
              });
            }
          });
        };
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [E]
  ), Yr = G((Y, Z) => (ee, Re) => {
    const ie = ee.nativeEvent, te = E.get(Re);
    if (
      // Another sensor is already instantiating
      _.current !== null || // No active draggable
      !te || // Event has already been captured
      ie.dndKit || ie.defaultPrevented
    )
      return;
    const ue = {
      active: te
    };
    Y(ee, Z.options, ue) === !0 && (ie.dndKit = {
      capturedBy: Z.sensor
    }, _.current = Re, Nn(ee, Z));
  }, [E, Nn]), _n = ko(u, Yr);
  Ko(u), ge(() => {
    k && x === Oe.Initializing && y(Oe.Initialized);
  }, [k, x]), F(
    () => {
      const {
        onDragMove: Y
      } = U.current, {
        active: Z,
        activatorEvent: ee,
        collisions: Re,
        over: ie
      } = ae.current;
      if (!Z || !ee)
        return;
      const te = {
        active: Z,
        activatorEvent: ee,
        collisions: Re,
        delta: {
          x: $e.x,
          y: $e.y
        },
        over: ie
      };
      yt(() => {
        Y == null || Y(te), b({
          type: "onDragMove",
          event: te
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [$e.x, $e.y]
  ), F(
    () => {
      const {
        active: Y,
        activatorEvent: Z,
        collisions: ee,
        droppableContainers: Re,
        scrollAdjustedTranslate: ie
      } = ae.current;
      if (!Y || _.current == null || !Z || !ie)
        return;
      const {
        onDragOver: te
      } = U.current, ue = Re.get(An), Be = ue && ue.rect.current ? {
        id: ue.id,
        rect: ue.rect.current,
        data: ue.data,
        disabled: ue.disabled
      } : null, K = {
        active: Y,
        activatorEvent: Z,
        collisions: ee,
        delta: {
          x: ie.x,
          y: ie.y
        },
        over: Be
      };
      yt(() => {
        Ln(Be), te == null || te(K), b({
          type: "onDragOver",
          event: K
        });
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [An]
  ), ge(() => {
    ae.current = {
      activatorEvent: H,
      active: T,
      activeNode: oe,
      collisionRect: Pe,
      collisions: Qe,
      droppableRects: me,
      draggableNodes: E,
      draggingNode: ke,
      draggingNodeRect: Fe,
      droppableContainers: M,
      over: Ce,
      scrollableAncestors: Se,
      scrollAdjustedTranslate: $e
    }, L.current = {
      initial: Fe,
      translated: Pe
    };
  }, [T, oe, Qe, Pe, E, ke, Fe, me, M, Ce, Se, $e]), Lo({
    ...xe,
    delta: A,
    draggingRect: Pe,
    pointerCoordinates: Mn,
    scrollableAncestors: Se,
    scrollableAncestorRects: bt
  });
  const Gr = $(() => ({
    active: T,
    activeNode: oe,
    activeNodeRect: k,
    activatorEvent: H,
    collisions: Qe,
    containerNodeRect: Je,
    dragOverlay: ve,
    draggableNodes: E,
    droppableContainers: M,
    droppableRects: me,
    over: Ce,
    measureDroppableContainers: Me,
    scrollableAncestors: Se,
    scrollableAncestorRects: bt,
    measuringConfiguration: q,
    measuringScheduled: qe,
    windowRect: Vt
  }), [T, oe, k, H, Qe, Je, ve, E, M, me, Ce, Me, Se, bt, q, qe, Vt]), Ur = $(() => ({
    activatorEvent: H,
    activators: _n,
    active: T,
    activeNodeRect: k,
    ariaDescribedById: {
      draggable: se
    },
    dispatch: p,
    draggableNodes: E,
    over: Ce,
    measureDroppableContainers: Me
  }), [H, _n, T, k, p, se, E, Ce, Me]);
  return z.createElement(Sr.Provider, {
    value: w
  }, z.createElement(Wt.Provider, {
    value: Ur
  }, z.createElement(_r.Provider, {
    value: Gr
  }, z.createElement(zr.Provider, {
    value: Hr
  }, a)), z.createElement(ti, {
    disabled: (l == null ? void 0 : l.restoreFocus) === !1
  })), z.createElement(ro, {
    ...l,
    hiddenTextDescribedById: se
  }));
  function qr() {
    const Y = (V == null ? void 0 : V.autoScrollEnabled) === !1, Z = typeof c == "object" ? c.enabled === !1 : c === !1, ee = S && !Y && !Z;
    return typeof c == "object" ? {
      ...c,
      enabled: ee
    } : {
      enabled: ee
    };
  }
}), ii = /* @__PURE__ */ ft(null), Jn = "button", li = "Draggable";
function ci(e) {
  let {
    id: t,
    data: n,
    disabled: r = !1,
    attributes: s
  } = e;
  const o = mt(li), {
    activators: i,
    activatorEvent: l,
    active: c,
    activeNodeRect: a,
    ariaDescribedById: u,
    draggableNodes: d,
    over: h
  } = Le(Wt), {
    role: f = Jn,
    roleDescription: g = "draggable",
    tabIndex: m = 0
  } = s ?? {}, v = (c == null ? void 0 : c.id) === t, p = Le(v ? zr : ii), [b, w] = Mt(), [x, y] = Mt(), S = Xo(i, t), C = ct(n);
  ge(
    () => (d.set(t, {
      id: t,
      key: o,
      node: b,
      activatorNode: x,
      data: C
    }), () => {
      const A = d.get(t);
      A && A.key === o && d.delete(t);
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [d, t]
  );
  const E = $(() => ({
    role: f,
    tabIndex: m,
    "aria-disabled": r,
    "aria-pressed": v && f === Jn ? !0 : void 0,
    "aria-roledescription": g,
    "aria-describedby": u.draggable
  }), [r, f, m, v, g, u.draggable]);
  return {
    active: c,
    activatorEvent: l,
    activeNodeRect: a,
    attributes: E,
    isDragging: v,
    listeners: r ? void 0 : S,
    node: b,
    over: h,
    setNodeRef: w,
    setActivatorNodeRef: y,
    transform: p
  };
}
function ai() {
  return Le(_r);
}
const ui = "Droppable", di = {
  timeout: 25
};
function fi(e) {
  let {
    data: t,
    disabled: n = !1,
    id: r,
    resizeObserverConfig: s
  } = e;
  const o = mt(ui), {
    active: i,
    dispatch: l,
    over: c,
    measureDroppableContainers: a
  } = Le(Wt), u = P({
    disabled: n
  }), d = P(!1), h = P(null), f = P(null), {
    disabled: g,
    updateMeasurementsFor: m,
    timeout: v
  } = {
    ...di,
    ...s
  }, p = ct(m ?? r), b = G(
    () => {
      if (!d.current) {
        d.current = !0;
        return;
      }
      f.current != null && clearTimeout(f.current), f.current = setTimeout(() => {
        a(Array.isArray(p.current) ? p.current : [p.current]), f.current = null;
      }, v);
    },
    //eslint-disable-next-line react-hooks/exhaustive-deps
    [v]
  ), w = Bt({
    callback: b,
    disabled: g || !i
  }), x = G((E, A) => {
    w && (A && (w.unobserve(A), d.current = !1), E && w.observe(E));
  }, [w]), [y, S] = Mt(x), C = ct(t);
  return F(() => {
    !w || !y.current || (w.disconnect(), d.current = !1, w.observe(y.current));
  }, [y, w]), F(
    () => (l({
      type: W.RegisterDroppable,
      element: {
        id: r,
        key: o,
        disabled: n,
        node: y,
        rect: h,
        data: C
      }
    }), () => l({
      type: W.UnregisterDroppable,
      key: o,
      id: r
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [r]
  ), F(() => {
    n !== u.current.disabled && (l({
      type: W.SetDroppableDisabled,
      id: r,
      key: o,
      disabled: n
    }), u.current.disabled = n);
  }, [r, o, n, l]), {
    active: i,
    rect: h,
    isOver: (c == null ? void 0 : c.id) === r,
    node: y,
    over: c,
    setNodeRef: S
  };
}
function Rn(e, t, n) {
  const r = e.slice();
  return r.splice(n < 0 ? r.length + n : n, 0, r.splice(t, 1)[0]), r;
}
function hi(e, t) {
  return e.reduce((n, r, s) => {
    const o = t.get(r);
    return o && (n[s] = o), n;
  }, Array(e.length));
}
function St(e) {
  return e !== null && e >= 0;
}
function gi(e, t) {
  if (e === t)
    return !0;
  if (e.length !== t.length)
    return !1;
  for (let n = 0; n < e.length; n++)
    if (e[n] !== t[n])
      return !1;
  return !0;
}
function mi(e) {
  return typeof e == "boolean" ? {
    draggable: e,
    droppable: e
  } : e;
}
const kr = (e) => {
  let {
    rects: t,
    activeIndex: n,
    overIndex: r,
    index: s
  } = e;
  const o = Rn(t, r, n), i = t[s], l = o[s];
  return !l || !i ? null : {
    x: l.left - i.left,
    y: l.top - i.top,
    scaleX: l.width / i.width,
    scaleY: l.height / i.height
  };
}, Ct = {
  scaleX: 1,
  scaleY: 1
}, pi = (e) => {
  var t;
  let {
    activeIndex: n,
    activeNodeRect: r,
    index: s,
    rects: o,
    overIndex: i
  } = e;
  const l = (t = o[n]) != null ? t : r;
  if (!l)
    return null;
  if (s === n) {
    const a = o[i];
    return a ? {
      x: 0,
      y: n < i ? a.top + a.height - (l.top + l.height) : a.top - l.top,
      ...Ct
    } : null;
  }
  const c = vi(o, s, n);
  return s > n && s <= i ? {
    x: 0,
    y: -l.height - c,
    ...Ct
  } : s < n && s >= i ? {
    x: 0,
    y: l.height + c,
    ...Ct
  } : {
    x: 0,
    y: 0,
    ...Ct
  };
};
function vi(e, t, n) {
  const r = e[t], s = e[t - 1], o = e[t + 1];
  return r ? n < t ? s ? r.top - (s.top + s.height) : o ? o.top - (r.top + r.height) : 0 : o ? o.top - (r.top + r.height) : s ? r.top - (s.top + s.height) : 0 : 0;
}
const Fr = "Sortable", $r = /* @__PURE__ */ z.createContext({
  activeIndex: -1,
  containerId: Fr,
  disableTransforms: !1,
  items: [],
  overIndex: -1,
  useDragOverlay: !1,
  sortedRects: [],
  strategy: kr,
  disabled: {
    draggable: !1,
    droppable: !1
  }
});
function bi(e) {
  let {
    children: t,
    id: n,
    items: r,
    strategy: s = kr,
    disabled: o = !1
  } = e;
  const {
    active: i,
    dragOverlay: l,
    droppableRects: c,
    over: a,
    measureDroppableContainers: u
  } = ai(), d = mt(Fr, n), h = l.rect !== null, f = $(() => r.map((S) => typeof S == "object" && "id" in S ? S.id : S), [r]), g = i != null, m = i ? f.indexOf(i.id) : -1, v = a ? f.indexOf(a.id) : -1, p = P(f), b = !gi(f, p.current), w = v !== -1 && m === -1 || b, x = mi(o);
  ge(() => {
    b && g && u(f);
  }, [b, f, g, u]), F(() => {
    p.current = f;
  }, [f]);
  const y = $(
    () => ({
      activeIndex: m,
      containerId: d,
      disabled: x,
      disableTransforms: w,
      items: f,
      overIndex: v,
      useDragOverlay: h,
      sortedRects: hi(f, c),
      strategy: s
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [m, d, x.draggable, x.droppable, w, f, v, c, h, s]
  );
  return z.createElement($r.Provider, {
    value: y
  }, t);
}
const wi = (e) => {
  let {
    id: t,
    items: n,
    activeIndex: r,
    overIndex: s
  } = e;
  return Rn(n, r, s).indexOf(t);
}, yi = (e) => {
  let {
    containerId: t,
    isSorting: n,
    wasDragging: r,
    index: s,
    items: o,
    newIndex: i,
    previousItems: l,
    previousContainerId: c,
    transition: a
  } = e;
  return !a || !r || l !== o && s === i ? !1 : n ? !0 : i !== s && t === c;
}, xi = {
  duration: 200,
  easing: "ease"
}, Pr = "transform", Si = /* @__PURE__ */ at.Transition.toString({
  property: Pr,
  duration: 0,
  easing: "linear"
}), Ci = {
  roleDescription: "sortable"
};
function Ri(e) {
  let {
    disabled: t,
    index: n,
    node: r,
    rect: s
  } = e;
  const [o, i] = ne(null), l = P(n);
  return ge(() => {
    if (!t && n !== l.current && r.current) {
      const c = s.current;
      if (c) {
        const a = Ue(r.current, {
          ignoreTransform: !0
        }), u = {
          x: c.left - a.left,
          y: c.top - a.top,
          scaleX: c.width / a.width,
          scaleY: c.height / a.height
        };
        (u.x || u.y) && i(u);
      }
    }
    n !== l.current && (l.current = n);
  }, [t, n, r, s]), F(() => {
    o && i(null);
  }, [o]), o;
}
function Ei(e) {
  let {
    animateLayoutChanges: t = yi,
    attributes: n,
    disabled: r,
    data: s,
    getNewIndex: o = wi,
    id: i,
    strategy: l,
    resizeObserverConfig: c,
    transition: a = xi
  } = e;
  const {
    items: u,
    containerId: d,
    activeIndex: h,
    disabled: f,
    disableTransforms: g,
    sortedRects: m,
    overIndex: v,
    useDragOverlay: p,
    strategy: b
  } = Le($r), w = Di(r, f), x = u.indexOf(i), y = $(() => ({
    sortable: {
      containerId: d,
      index: x,
      items: u
    },
    ...s
  }), [d, s, x, u]), S = $(() => u.slice(u.indexOf(i)), [u, i]), {
    rect: C,
    node: E,
    isOver: A,
    setNodeRef: M
  } = fi({
    id: i,
    data: y,
    disabled: w.droppable,
    resizeObserverConfig: {
      updateMeasurementsFor: S,
      ...c
    }
  }), {
    active: R,
    activatorEvent: L,
    activeNodeRect: T,
    attributes: _,
    setNodeRef: V,
    listeners: X,
    isDragging: H,
    over: B,
    setActivatorNodeRef: U,
    transform: se
  } = ci({
    id: i,
    data: y,
    attributes: {
      ...Ci,
      ...n
    },
    disabled: w.draggable
  }), pt = Ks(M, V), q = !!R, me = q && !g && St(h) && St(v), Me = !p && H, qe = Me && me ? se : null, vt = me ? qe ?? (l ?? b)({
    rects: m,
    activeNodeRect: T,
    activeIndex: h,
    overIndex: v,
    index: x
  }) : null, xe = St(h) && St(v) ? o({
    id: i,
    items: u,
    activeIndex: h,
    overIndex: v
  }) : x, pe = R == null ? void 0 : R.id, k = P({
    activeId: pe,
    items: u,
    newIndex: xe,
    containerId: d
  }), Je = u !== k.current.items, ae = t({
    active: R,
    containerId: d,
    isDragging: H,
    isSorting: q,
    id: i,
    index: x,
    items: u,
    newIndex: k.current.newIndex,
    previousItems: k.current.items,
    previousContainerId: k.current.containerId,
    transition: a,
    wasDragging: k.current.activeId != null
  }), ze = Ri({
    disabled: !ae,
    index: x,
    node: E,
    rect: C
  });
  return F(() => {
    q && k.current.newIndex !== xe && (k.current.newIndex = xe), d !== k.current.containerId && (k.current.containerId = d), u !== k.current.items && (k.current.items = u);
  }, [q, xe, d, u]), F(() => {
    if (pe === k.current.activeId)
      return;
    if (pe != null && k.current.activeId == null) {
      k.current.activeId = pe;
      return;
    }
    const ke = setTimeout(() => {
      k.current.activeId = pe;
    }, 50);
    return () => clearTimeout(ke);
  }, [pe]), {
    active: R,
    activeIndex: h,
    attributes: _,
    data: y,
    rect: C,
    index: x,
    newIndex: xe,
    items: u,
    isOver: A,
    isSorting: q,
    isDragging: H,
    listeners: X,
    node: E,
    overIndex: v,
    over: B,
    setNodeRef: pt,
    setActivatorNodeRef: U,
    setDroppableNodeRef: M,
    setDraggableNodeRef: V,
    transform: ze ?? vt,
    transition: ve()
  };
  function ve() {
    if (
      // Temporarily disable transitions for a single frame to set up derived transforms
      ze || // Or to prevent items jumping to back to their "new" position when items change
      Je && k.current.newIndex === x
    )
      return Si;
    if (!(Me && !bn(L) || !a) && (q || ae))
      return at.Transition.toString({
        ...a,
        property: Pr
      });
  }
}
function Di(e, t) {
  var n, r;
  return typeof e == "boolean" ? {
    draggable: e,
    // Backwards compatibility
    droppable: !1
  } : {
    draggable: (n = e == null ? void 0 : e.draggable) != null ? n : t.draggable,
    droppable: (r = e == null ? void 0 : e.droppable) != null ? r : t.droppable
  };
}
N.Down, N.Right, N.Up, N.Left;
function Oi(e, t, n) {
  const r = new Array(e);
  return new Proxy(r, {
    get(s, o, i) {
      if (typeof o == "string") {
        const l = o.charCodeAt(0);
        if (l >= 48 && l <= 57) {
          const c = +o;
          if (Number.isInteger(c) && c >= 0 && c < e) {
            let a = s[c];
            if (!a) {
              const u = t[c * 2];
              a = s[c] = {
                index: c,
                key: n(c),
                start: u,
                size: t[c * 2 + 1],
                end: u + t[c * 2 + 1],
                lane: 0
              };
            }
            return a;
          }
        }
        if (o === "length") return e;
      }
      return Reflect.get(s, o, i);
    }
  });
}
function We(e, t, n) {
  let r = n.initialDeps ?? [], s, o = !0;
  function i() {
    var l;
    const c = process.env.NODE_ENV !== "production" && !!n.key && !!((l = n.debug) != null && l.call(n));
    let a = 0;
    c && (a = Date.now());
    const u = e();
    if (!(u.length !== r.length || u.some((f, g) => r[g] !== f)))
      return s;
    r = u;
    let h = 0;
    if (c && (h = Date.now()), s = t(...u), c) {
      const f = Math.round((Date.now() - a) * 100) / 100, g = Math.round((Date.now() - h) * 100) / 100, m = g / 16, v = (p, b) => {
        for (p = String(p); p.length < b; )
          p = " " + p;
        return p;
      };
      console.info(
        `%c⏱ ${v(g, 5)} /${v(f, 5)} ms`,
        `
            font-size: .6rem;
            font-weight: bold;
            color: hsl(${Math.max(
          0,
          Math.min(120 - 120 * m, 120)
        )}deg 100% 31%);`,
        n == null ? void 0 : n.key
      );
    }
    return n != null && n.onChange && !(o && n.skipInitialOnChange) && n.onChange(s), o = !1, s;
  }
  return i.updateDeps = (l) => {
    r = l;
  }, i;
}
function Qn(e, t) {
  if (e === void 0)
    throw new Error("Unexpected undefined");
  return e;
}
const Ii = (e, t) => Math.abs(e - t) < 1.01, Mi = (e, t, n) => {
  let r;
  return Object.assign(
    function(...s) {
      e.clearTimeout(r), r = e.setTimeout(() => t.apply(this, s), n);
    },
    {
      // The handle is closure-local, so a caller that has already
      // unsubscribed has no way to stop a queued call. Teardown paths use
      // this to drop the pending invocation instead of letting it land.
      cancel: () => {
        e.clearTimeout(r);
      }
    }
  );
};
let nt;
const Zt = () => {
  if (nt !== void 0) return nt;
  if (typeof navigator > "u") return nt = !1;
  if (/iP(hone|od|ad)/.test(navigator.userAgent)) return nt = !0;
  const e = navigator.maxTouchPoints;
  return nt = navigator.platform === "MacIntel" && e !== void 0 && e > 0;
}, Zn = (e) => {
  const { offsetWidth: t, offsetHeight: n } = e;
  return { width: t, height: n };
}, Ti = (e) => e, Ai = (e) => {
  const t = Math.max(e.startIndex - e.overscan, 0), r = Math.min(e.endIndex + e.overscan, e.count - 1) - t + 1, s = new Array(r);
  for (let o = 0; o < r; o++)
    s[o] = t + o;
  return s;
}, Li = (e, t) => {
  const n = e.scrollElement;
  if (!n)
    return;
  const r = e.targetWindow;
  if (!r)
    return;
  const s = (i) => {
    const { width: l, height: c } = i;
    t({ width: Math.round(l), height: Math.round(c) });
  };
  if (s(Zn(n)), !r.ResizeObserver)
    return () => {
    };
  const o = new r.ResizeObserver((i) => {
    const l = () => {
      const c = i[0];
      if (c != null && c.borderBoxSize) {
        const a = c.borderBoxSize[0];
        if (a) {
          s({ width: a.inlineSize, height: a.blockSize });
          return;
        }
      }
      s(Zn(n));
    };
    e.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(l) : l();
  });
  return o.observe(n, { box: "border-box" }), () => {
    o.unobserve(n);
  };
}, Nt = {
  passive: !0
}, Ni = typeof window > "u" ? !0 : "onscrollend" in window, _i = (e, t, n) => {
  const r = e.scrollElement;
  if (!r)
    return;
  const s = e.targetWindow;
  if (!s)
    return;
  const o = e.options.useScrollendEvent && Ni;
  let i = 0;
  const l = o ? null : Mi(
    s,
    () => t(i, !1),
    e.options.isScrollingResetDelay
  ), c = (d) => () => {
    i = n(r), l == null || l(), t(i, d);
  }, a = c(!0), u = c(!1);
  return r.addEventListener("scroll", a, Nt), o && r.addEventListener("scrollend", u, Nt), () => {
    r.removeEventListener("scroll", a), o && r.removeEventListener("scrollend", u), l == null || l.cancel();
  };
}, zi = (e, t) => _i(e, t, (n) => {
  const { horizontal: r, isRtl: s } = e.options;
  return r ? n.scrollLeft * (s && -1 || 1) : n.scrollTop;
}), ki = (e, t, n) => {
  if (n.options.useCachedMeasurements) {
    const r = n.indexFromElement(e), s = n.options.getItemKey(r);
    return n.itemSizeCache.get(s) ?? n.options.estimateSize(r);
  }
  if (t != null && t.borderBoxSize) {
    const r = t.borderBoxSize[0];
    if (r)
      return Math.round(
        r[n.options.horizontal ? "inlineSize" : "blockSize"]
      );
  }
  if (!t) {
    const r = n.indexFromElement(e), s = n.options.getItemKey(r), o = n.itemSizeCache.get(s);
    if (o !== void 0)
      return o;
  }
  return e[n.options.horizontal ? "offsetWidth" : "offsetHeight"];
}, Fi = (e, {
  adjustments: t = 0,
  behavior: n
}, r) => {
  var s, o;
  (o = (s = r.scrollElement) == null ? void 0 : s.scrollTo) == null || o.call(s, {
    [r.options.horizontal ? "left" : "top"]: e + t,
    behavior: n
  });
}, $i = Fi;
class Pi {
  constructor(t) {
    this.unsubs = [], this.scrollElement = null, this.targetWindow = null, this.isScrolling = !1, this.scrollState = null, this.measurementsCache = [], this._flatMeasurements = null, this.itemSizeCache = /* @__PURE__ */ new Map(), this.itemSizeCacheVersion = 0, this.laneAssignments = /* @__PURE__ */ new Map(), this.pendingMin = null, this.prevLanes = void 0, this.lanesChangedFlag = !1, this.lanesSettling = !1, this.pendingScrollAnchor = null, this.scrollRect = null, this.scrollOffset = null, this.scrollDirection = null, this.scrollAdjustments = 0, this._iosDeferredAdjustment = 0, this._iosTouching = !1, this._iosJustTouchEnded = !1, this._iosTouchEndTimerId = null, this._intendedScrollOffset = null, this.elementsCache = /* @__PURE__ */ new Map(), this.now = () => {
      var n, r, s;
      return ((s = (r = (n = this.targetWindow) == null ? void 0 : n.performance) == null ? void 0 : r.now) == null ? void 0 : s.call(r)) ?? Date.now();
    }, this.observer = /* @__PURE__ */ (() => {
      let n = null;
      const r = () => n || (!this.targetWindow || !this.targetWindow.ResizeObserver ? null : n = new this.targetWindow.ResizeObserver((s) => {
        s.forEach((o) => {
          const i = () => {
            const l = o.target, c = this.indexFromElement(l);
            if (!l.isConnected) {
              this.observer.unobserve(l);
              for (const [a, u] of this.elementsCache)
                if (u === l) {
                  this.elementsCache.delete(a);
                  break;
                }
              return;
            }
            this.isIndexInRange(c) && this.shouldMeasureDuringScroll(c) && this.resizeItem(
              c,
              this.options.measureElement(l, o, this)
            );
          };
          this.options.useAnimationFrameWithResizeObserver ? requestAnimationFrame(i) : i();
        });
      }));
      return {
        disconnect: () => {
          var s;
          (s = r()) == null || s.disconnect(), n = null;
        },
        observe: (s) => {
          var o;
          return (o = r()) == null ? void 0 : o.observe(s, { box: "border-box" });
        },
        unobserve: (s) => {
          var o;
          return (o = r()) == null ? void 0 : o.unobserve(s);
        }
      };
    })(), this.range = null, this.setOptions = (n) => {
      var r, s;
      const o = {
        debug: !1,
        initialOffset: 0,
        overscan: 1,
        paddingStart: 0,
        paddingEnd: 0,
        scrollPaddingStart: 0,
        scrollPaddingEnd: 0,
        horizontal: !1,
        getItemKey: Ti,
        rangeExtractor: Ai,
        onChange: () => {
        },
        measureElement: ki,
        initialRect: { width: 0, height: 0 },
        scrollMargin: 0,
        gap: 0,
        indexAttribute: "data-index",
        initialMeasurementsCache: [],
        lanes: 1,
        anchorTo: "start",
        followOnAppend: !1,
        scrollEndThreshold: 1,
        isScrollingResetDelay: 150,
        enabled: !0,
        isRtl: !1,
        useScrollendEvent: !1,
        useAnimationFrameWithResizeObserver: !1,
        laneAssignmentMode: "estimate",
        useCachedMeasurements: !1
      };
      for (const h in n) {
        const f = n[h];
        f !== void 0 && (o[h] = f);
      }
      const i = this.options;
      let l = null, c = null, a = !1;
      if (i !== void 0 && i.enabled && o.enabled && o.anchorTo === "end" && this.scrollElement !== null) {
        const h = i.count, f = o.count, g = this.getMeasurements(), m = h > 0 ? ((r = g[0]) == null ? void 0 : r.key) ?? i.getItemKey(0) : null, v = h > 0 ? ((s = g[h - 1]) == null ? void 0 : s.key) ?? i.getItemKey(h - 1) : null;
        if (f !== h || h > 0 && f > 0 && (o.getItemKey(0) !== m || o.getItemKey(f - 1) !== v)) {
          a = !0;
          const w = h > 0 ? this.getVirtualItemForOffset(this.getScrollOffset()) ?? g[0] : null;
          w && (l = [w.key, this.getScrollOffset() - w.start]);
          const x = o.followOnAppend === !0 ? "auto" : o.followOnAppend || null;
          x && f > h && this.isAtEnd(i.scrollEndThreshold) && (h === 0 || o.getItemKey(f - 1) !== v) && (c = x);
        }
      }
      this.options = o, a && (this.pendingMin = 0, this.itemSizeCacheVersion++);
      let u = !1, d = 0;
      if (l && this.scrollOffset !== null) {
        const [h, f] = l, g = this.getMeasurements(), { count: m, getItemKey: v } = this.options;
        let p = 0;
        for (; p < m && v(p) !== h; )
          p++;
        if (p < m) {
          const b = g[p];
          if (b) {
            const w = Math.max(0, b.start + f);
            w !== this.scrollOffset && (d = w - this.scrollOffset, this.scrollOffset = w, u = !0);
          }
        }
      }
      (u || c) && (this.pendingScrollAnchor = [
        u ? l[0] : null,
        u ? l[1] : 0,
        c,
        d
      ]);
    }, this.notify = (n) => {
      var r, s;
      (s = (r = this.options).onChange) == null || s.call(r, this, n);
    }, this.maybeNotify = We(
      () => (this.calculateRange(), [
        this.isScrolling,
        this.range ? this.range.startIndex : null,
        this.range ? this.range.endIndex : null
      ]),
      (n) => {
        this.notify(n);
      },
      {
        key: process.env.NODE_ENV !== "production" && "maybeNotify",
        debug: () => this.options.debug,
        initialDeps: [
          this.isScrolling,
          this.range ? this.range.startIndex : null,
          this.range ? this.range.endIndex : null
        ]
      }
    ), this.cleanup = () => {
      this.unsubs.filter(Boolean).forEach((n) => n()), this.unsubs = [], this.observer.disconnect(), this.rafId != null && this.targetWindow && (this.targetWindow.cancelAnimationFrame(this.rafId), this.rafId = null), this.scrollState = null, this.isScrolling = !1, this.scrollDirection = null, this._iosDeferredAdjustment = 0, this._iosTouching = !1, this._iosJustTouchEnded = !1, this.scrollElement = null, this.targetWindow = null;
    }, this._didMount = () => () => {
      this.cleanup();
    }, this._willUpdate = () => {
      var n;
      const r = this.options.enabled ? this.options.getScrollElement() : null;
      if (this.scrollElement !== r) {
        if (this.cleanup(), !r) {
          this.maybeNotify();
          return;
        }
        if (this.scrollElement = r, this.scrollElement && "ownerDocument" in this.scrollElement ? this.targetWindow = this.scrollElement.ownerDocument.defaultView : this.targetWindow = ((n = this.scrollElement) == null ? void 0 : n.window) ?? null, this.elementsCache.forEach((o) => {
          this.observer.observe(o);
        }), this.unsubs.push(
          this.options.observeElementRect(this, (o) => {
            this.scrollRect = o, this.maybeNotify();
          })
        ), this.unsubs.push(
          this.options.observeElementOffset(this, (o, i) => {
            if (i && this._intendedScrollOffset === null && o === this.scrollOffset)
              return;
            this._intendedScrollOffset !== null && Math.abs(o - this._intendedScrollOffset) < 1.5 && (o = this._intendedScrollOffset), this._intendedScrollOffset = null, this.scrollAdjustments = 0;
            const l = this.getScrollOffset();
            this.scrollDirection = i ? l === o ? this.scrollDirection : l < o ? "forward" : "backward" : null, this.scrollOffset = o, this.isScrolling = i, this._flushIosDeferredIfReady(), this.scrollState && this.scheduleScrollReconcile(), this.maybeNotify();
          })
        ), "addEventListener" in this.scrollElement) {
          const o = this.scrollElement, i = () => {
            this._iosTouching = !0, this._iosJustTouchEnded = !1, this._iosTouchEndTimerId !== null && this.targetWindow != null && (this.targetWindow.clearTimeout(this._iosTouchEndTimerId), this._iosTouchEndTimerId = null);
          }, l = () => {
            this._iosTouching = !1, !(!Zt() || this.targetWindow == null) && (this._iosJustTouchEnded = !0, this._iosTouchEndTimerId = this.targetWindow.setTimeout(() => {
              this._iosJustTouchEnded = !1, this._iosTouchEndTimerId = null, this._flushIosDeferredIfReady();
            }, 150));
          };
          o.addEventListener(
            "touchstart",
            i,
            Nt
          ), o.addEventListener(
            "touchend",
            l,
            Nt
          ), this.unsubs.push(() => {
            o.removeEventListener("touchstart", i), o.removeEventListener("touchend", l), this._iosTouchEndTimerId !== null && this.targetWindow != null && (this.targetWindow.clearTimeout(this._iosTouchEndTimerId), this._iosTouchEndTimerId = null);
          });
        }
        this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        });
      }
      const s = this.pendingScrollAnchor;
      if (this.pendingScrollAnchor = null, s && this.scrollElement && this.options.enabled) {
        const [o, i, l, c] = s;
        o !== null && !l && (Zt() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded) ? c !== 0 && (this._iosDeferredAdjustment += c) : this._scrollToOffset(this.getScrollOffset(), {
          adjustments: void 0,
          behavior: void 0
        })), l && this.scrollToEnd({ behavior: l });
      }
    }, this._flushIosDeferredIfReady = () => {
      if (this._iosDeferredAdjustment === 0 || this.isScrolling || this._iosTouching || this._iosJustTouchEnded) return;
      const n = this.getScrollOffset(), r = this.getMaxScrollOffset();
      if (n < 0 || n > r) return;
      if (this._iosDeferredAdjustment < 0 && n >= r - 1) {
        this._iosDeferredAdjustment = 0;
        return;
      }
      const s = this._iosDeferredAdjustment;
      this._iosDeferredAdjustment = 0, this._scrollToOffset(n, {
        adjustments: this.scrollAdjustments += s,
        behavior: void 0
      });
    }, this.rafId = null, this.getSize = () => this.options.enabled ? (this.scrollRect = this.scrollRect ?? this.options.initialRect, this.scrollRect[this.options.horizontal ? "width" : "height"]) : (this.scrollRect = null, 0), this.getScrollOffset = () => this.options.enabled ? (this.scrollOffset = this.scrollOffset ?? (typeof this.options.initialOffset == "function" ? this.options.initialOffset() : this.options.initialOffset), this.scrollOffset) : (this.scrollOffset = null, 0), this.getMeasurementOptions = We(
      () => [
        this.options.count,
        this.options.paddingStart,
        this.options.scrollMargin,
        this.options.getItemKey,
        this.options.enabled,
        this.options.lanes,
        this.options.laneAssignmentMode,
        this.options.gap
      ],
      (n, r, s, o, i, l, c, a) => (this.prevLanes !== void 0 && this.prevLanes !== l && (this.lanesChangedFlag = !0), this.prevLanes = l, this.pendingMin = null, {
        count: n,
        paddingStart: r,
        scrollMargin: s,
        getItemKey: o,
        enabled: i,
        lanes: l,
        laneAssignmentMode: c,
        gap: a
      }),
      {
        key: !1
      }
    ), this.isIndexInRange = (n) => n >= 0 && n < this.options.count, this.getMeasurements = We(
      () => [this.getMeasurementOptions(), this.itemSizeCacheVersion],
      ({
        count: n,
        paddingStart: r,
        scrollMargin: s,
        getItemKey: o,
        enabled: i,
        lanes: l,
        laneAssignmentMode: c,
        gap: a
      }, u) => {
        const d = this.itemSizeCache;
        if (!i)
          return this.measurementsCache = [], this.itemSizeCache.clear(), this.laneAssignments.clear(), [];
        if (this.laneAssignments.size > n)
          for (const p of this.laneAssignments.keys())
            p >= n && this.laneAssignments.delete(p);
        this.lanesChangedFlag && (this.lanesChangedFlag = !1, this.lanesSettling = !0, this.measurementsCache = [], this.itemSizeCache.clear(), this.laneAssignments.clear(), this.pendingMin = null), this.measurementsCache.length === 0 && !this.lanesSettling && (this.measurementsCache = this.options.initialMeasurementsCache, this.measurementsCache.forEach((p) => {
          this.itemSizeCache.set(p.key, p.size);
        }));
        const h = this.lanesSettling ? 0 : this.pendingMin ?? 0;
        if (this.pendingMin = null, this.lanesSettling && this.measurementsCache.length === n && (this.lanesSettling = !1), l === 1) {
          const p = n * 2;
          let b = this._flatMeasurements;
          if (!b || b.length < p) {
            const y = new Float64Array(p);
            b && h > 0 && y.set(b.subarray(0, h * 2)), b = y, this._flatMeasurements = b;
          }
          let w;
          if (h === 0)
            w = r + s;
          else {
            const y = h - 1;
            w = b[y * 2] + b[y * 2 + 1] + a;
          }
          for (let y = h; y < n; y++) {
            const S = o(y), C = d.get(S), E = typeof C == "number" ? C : this.options.estimateSize(y);
            b[y * 2] = w, b[y * 2 + 1] = E, w += E + a;
          }
          const x = Oi(n, b, o);
          return this.measurementsCache = x, x;
        }
        const f = this.measurementsCache.slice(0, h), g = new Array(l).fill(
          void 0
        ), m = new Float64Array(l);
        let v = 0;
        for (let p = 0; p < h; p++) {
          const b = f[p];
          b && (g[b.lane] === void 0 && v++, g[b.lane] = p, m[b.lane] = b.end);
        }
        for (let p = h; p < n; p++) {
          const b = o(p), w = this.laneAssignments.get(p);
          let x, y;
          const S = c === "estimate" || d.has(b);
          if (w !== void 0 && this.options.lanes > 1) {
            x = w;
            const M = g[x], R = M !== void 0 ? f[M] : void 0;
            y = R ? R.end + a : r + s;
          } else if (v === l) {
            let M = 0, R = m[0], L = g[0];
            for (let T = 1; T < l; T++) {
              const _ = m[T];
              (_ < R || _ === R && g[T] < L) && (M = T, R = _, L = g[T]);
            }
            x = M, y = R + a, S && this.laneAssignments.set(p, x);
          } else
            x = p % this.options.lanes, y = r + s, S && this.laneAssignments.set(p, x);
          const C = d.get(b), E = typeof C == "number" ? C : this.options.estimateSize(p), A = y + E;
          f[p] = {
            index: p,
            start: y,
            size: E,
            end: A,
            key: b,
            lane: x
          }, g[x] === void 0 && v++, g[x] = p, m[x] = A;
        }
        return this.measurementsCache = f, f;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getMeasurements",
        debug: () => this.options.debug
      }
    ), this.calculateRange = We(
      () => [
        this.getMeasurements(),
        this.getSize(),
        this.getScrollOffset(),
        this.options.lanes
      ],
      (n, r, s, o) => n.length === 0 || r === 0 ? (this.range = null, null) : (this.range = Wi(
        n,
        r,
        s,
        o,
        // Pass the typed array so binary search + forward-walk can read
        // start/end directly from Float64Array, skipping the Proxy traps.
        o === 1 && this._flatMeasurements != null ? this._flatMeasurements : null
      ), this.range),
      {
        key: process.env.NODE_ENV !== "production" && "calculateRange",
        debug: () => this.options.debug
      }
    ), this.getVirtualIndexes = We(
      () => {
        let n = null, r = null;
        const s = this.calculateRange();
        return s && (n = s.startIndex, r = s.endIndex), this.maybeNotify.updateDeps([this.isScrolling, n, r]), [
          this.options.rangeExtractor,
          this.options.overscan,
          this.options.count,
          n,
          r
        ];
      },
      (n, r, s, o, i) => o === null || i === null ? [] : n({
        startIndex: o,
        endIndex: i,
        overscan: r,
        count: s
      }),
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualIndexes",
        debug: () => this.options.debug
      }
    ), this.indexFromElement = (n) => {
      const r = this.options.indexAttribute, s = n.getAttribute(r);
      return s ? parseInt(s, 10) : (console.warn(
        `Missing attribute name '${r}={index}' on measured element.`
      ), -1);
    }, this.shouldMeasureDuringScroll = (n) => {
      var r;
      if (!this.scrollState || this.scrollState.behavior !== "smooth")
        return !0;
      const s = this.scrollState.index ?? ((r = this.getVirtualItemForOffset(this.scrollState.lastTargetOffset)) == null ? void 0 : r.index);
      if (s !== void 0 && this.range) {
        const o = Math.max(
          this.options.overscan,
          Math.ceil((this.range.endIndex - this.range.startIndex) / 2)
        ), i = Math.max(0, s - o), l = Math.min(
          this.options.count - 1,
          s + o
        );
        return n >= i && n <= l;
      }
      return !0;
    }, this.measureElement = (n) => {
      if (!n) {
        this.elementsCache.forEach((i, l) => {
          i.isConnected || (this.observer.unobserve(i), this.elementsCache.delete(l));
        });
        return;
      }
      const r = this.indexFromElement(n);
      if (!this.isIndexInRange(r)) return;
      const s = this.options.getItemKey(r), o = this.elementsCache.get(s);
      o !== n && (o && this.observer.unobserve(o), this.observer.observe(n), this.elementsCache.set(s, n)), (!this.isScrolling || this.scrollState) && this.shouldMeasureDuringScroll(r) && this.resizeItem(r, this.options.measureElement(n, void 0, this));
    }, this.resizeItem = (n, r) => {
      var s, o;
      if (!this.isIndexInRange(n)) return;
      let i, l, c;
      const a = this._flatMeasurements;
      if (this.options.lanes === 1 && a !== null)
        c = this.options.getItemKey(n), l = a[n * 2], i = a[n * 2 + 1];
      else {
        const h = this.measurementsCache[n];
        if (!h) return;
        c = h.key, l = h.start, i = h.size;
      }
      const u = this.itemSizeCache.get(c) ?? i, d = r - u;
      if (d !== 0) {
        const h = this.options.anchorTo === "end" && ((s = this.scrollState) == null ? void 0 : s.behavior) !== "smooth" && this.getVirtualDistanceFromEnd() <= this.options.scrollEndThreshold, f = h ? this.getTotalSize() : 0, g = this.getScrollOffset() + this.scrollAdjustments, v = !this.itemSizeCache.has(c) ? (
          // First measurement: compensate any item whose top sits above the
          // fold — the estimate→actual delta must be corrected regardless of
          // scroll direction, since the whole estimated block was above it.
          l < g
        ) : (
          // Re-measurement: only compensate an item that is ENTIRELY above the
          // fold. An item that merely *spans* the fold (top above, bottom
          // below — e.g. a streaming chat message growing at its bottom)
          // changes size *below* the anchor point, so shifting scrollTop by the
          // delta would drag the viewport downward on every growth (#1218).
          // Also skip during backward scroll to avoid the "items jump while
          // scrolling up" cascade.
          l + u <= g && this.scrollDirection !== "backward"
        ), p = ((o = this.scrollState) == null ? void 0 : o.behavior) !== "smooth" && (this.shouldAdjustScrollPositionOnItemSizeChange !== void 0 ? this.shouldAdjustScrollPositionOnItemSizeChange(
          // The callback expects a VirtualItem; build one lazily only
          // when the consumer actually supplied a custom predicate.
          this.measurementsCache[n] ?? {
            index: n,
            key: c,
            start: l,
            size: i,
            end: l + i,
            lane: 0
          },
          d,
          this
        ) : v);
        (this.pendingMin === null || n < this.pendingMin) && (this.pendingMin = n), this.itemSizeCache.set(c, r), this.itemSizeCacheVersion++;
        let b = !1;
        h ? b = this.applyScrollAdjustment(
          this.getTotalSize() - f
        ) : p && (b = this.applyScrollAdjustment(d)), this.notify(b);
      }
    }, this.getVirtualItems = We(
      () => [this.getVirtualIndexes(), this.getMeasurements()],
      (n, r) => {
        const s = [];
        for (let o = 0, i = n.length; o < i; o++) {
          const l = n[o], c = r[l];
          s.push(c);
        }
        return s;
      },
      {
        key: process.env.NODE_ENV !== "production" && "getVirtualItems",
        debug: () => this.options.debug
      }
    ), this.getVirtualItemForOffset = (n) => {
      const r = this.getMeasurements();
      if (r.length === 0)
        return;
      const s = this._flatMeasurements, o = this.options.lanes === 1 && s != null, i = Br(
        0,
        r.length - 1,
        o ? (l) => s[l * 2] : (l) => Qn(r[l]).start,
        n
      );
      return Qn(r[i]);
    }, this.getMaxScrollOffset = () => {
      if (!this.scrollElement) return 0;
      if ("scrollHeight" in this.scrollElement)
        return this.options.horizontal ? this.scrollElement.scrollWidth - this.scrollElement.clientWidth : this.scrollElement.scrollHeight - this.scrollElement.clientHeight;
      {
        const n = this.scrollElement.document.documentElement;
        return this.options.horizontal ? n.scrollWidth - this.scrollElement.innerWidth : n.scrollHeight - this.scrollElement.innerHeight;
      }
    }, this.getVirtualDistanceFromEnd = () => Math.max(
      this.getTotalSize() - this.getSize() - this.getScrollOffset(),
      0
    ), this.getDistanceFromEnd = () => Math.max(this.getMaxScrollOffset() - this.getScrollOffset(), 0), this.isAtEnd = (n = this.options.scrollEndThreshold) => this.getDistanceFromEnd() <= n, this.getOffsetForAlignment = (n, r, s = 0) => {
      if (!this.scrollElement) return 0;
      const o = this.getSize(), i = this.getScrollOffset();
      r === "auto" && (r = n >= i + o ? "end" : "start"), r === "center" ? n += (s - o) / 2 : r === "end" && (n -= o);
      const l = this.getMaxScrollOffset();
      return Math.max(Math.min(l, n), 0);
    }, this.getOffsetForIndex = (n, r = "auto") => {
      n = Math.max(0, Math.min(n, this.options.count - 1));
      const s = this.getSize(), o = this.getScrollOffset(), i = this.measurementsCache[n];
      if (!i) return;
      if (r === "auto")
        if (i.end >= o + s - this.options.scrollPaddingEnd)
          r = "end";
        else if (i.start <= o + this.options.scrollPaddingStart)
          r = "start";
        else
          return [o, r];
      if (r === "end" && n === this.options.count - 1)
        return [this.getMaxScrollOffset(), r];
      const l = r === "end" ? i.end + this.options.scrollPaddingEnd : i.start - this.options.scrollPaddingStart;
      return [
        this.getOffsetForAlignment(l, r, i.size),
        r
      ];
    }, this.scrollToOffset = (n, { align: r = "start", behavior: s = "auto" } = {}) => {
      this._iosDeferredAdjustment = 0;
      const o = this.getOffsetForAlignment(n, r), i = this.now();
      this.scrollState = {
        index: null,
        align: r,
        behavior: s,
        startedAt: i,
        lastTargetOffset: o,
        stableFrames: 0
      }, this._scrollToOffset(o, { adjustments: void 0, behavior: s }), this.scheduleScrollReconcile();
    }, this.scrollToIndex = (n, {
      align: r = "auto",
      behavior: s = "auto"
    } = {}) => {
      this._iosDeferredAdjustment = 0, n = Math.max(0, Math.min(n, this.options.count - 1));
      const o = this.getOffsetForIndex(n, r);
      if (!o)
        return;
      const [i, l] = o, c = this.now();
      this.scrollState = {
        index: n,
        align: l,
        behavior: s,
        startedAt: c,
        lastTargetOffset: i,
        stableFrames: 0
      }, this._scrollToOffset(i, { adjustments: void 0, behavior: s }), this.scheduleScrollReconcile();
    }, this.scrollBy = (n, { behavior: r = "auto" } = {}) => {
      const s = this.getScrollOffset() + n, o = this.now();
      this.scrollState = {
        index: null,
        align: "start",
        behavior: r,
        startedAt: o,
        lastTargetOffset: s,
        stableFrames: 0
      }, this._scrollToOffset(s, { adjustments: void 0, behavior: r }), this.scheduleScrollReconcile();
    }, this.scrollToEnd = ({ behavior: n = "auto" } = {}) => {
      if (this.options.count > 0) {
        this.scrollToIndex(this.options.count - 1, {
          align: "end",
          behavior: n
        });
        return;
      }
      this.scrollToOffset(Math.max(this.getTotalSize() - this.getSize(), 0), {
        behavior: n
      });
    }, this.getTotalSize = () => {
      var n;
      const r = this.getMeasurements();
      let s;
      if (r.length === 0)
        s = this.options.paddingStart;
      else if (this.options.lanes === 1) {
        const o = r.length - 1, i = this._flatMeasurements;
        i != null ? s = i[o * 2] + i[o * 2 + 1] : s = ((n = r[o]) == null ? void 0 : n.end) ?? 0;
      } else {
        const o = Array(this.options.lanes).fill(null);
        let i = r.length - 1;
        for (; i >= 0 && o.some((l) => l === null); ) {
          const l = r[i];
          o[l.lane] === null && (o[l.lane] = l.end), i--;
        }
        s = Math.max(...o.filter((l) => l !== null));
      }
      return Math.max(
        s - this.options.scrollMargin + this.options.paddingEnd,
        0
      );
    }, this.takeSnapshot = () => {
      const n = [];
      if (this.itemSizeCache.size === 0) return n;
      const r = this.getMeasurements();
      for (const s of r)
        s && this.itemSizeCache.has(s.key) && n.push({
          index: s.index,
          key: s.key,
          start: s.start,
          size: s.size,
          end: s.end,
          lane: s.lane
        });
      return n;
    }, this._scrollToOffset = (n, {
      adjustments: r,
      behavior: s
    }) => {
      this._intendedScrollOffset = n + (r ?? 0), this.options.scrollToFn(n, { behavior: s, adjustments: r }, this);
    }, this.measure = () => {
      this.pendingMin = null, this.itemSizeCache.clear(), this.laneAssignments.clear(), this.itemSizeCacheVersion++, this.notify(!1);
    }, this.setOptions(t);
  }
  // Returns `true` when it performed a synchronous `scrollTop` write this
  // tick, `false` when the delta was zero or the write was deferred (iOS).
  // `resizeItem` uses that to decide whether the follow-up `notify` must be
  // synchronous so the grown transforms commit in the same paint (#1227).
  applyScrollAdjustment(t, n) {
    return t === 0 ? !1 : (process.env.NODE_ENV !== "production" && this.options.debug && console.info("correction", t), Zt() && (this.isScrolling || this._iosTouching || this._iosJustTouchEnded) ? (this._iosDeferredAdjustment += t, !1) : (this._scrollToOffset(this.getScrollOffset(), {
      adjustments: this.scrollAdjustments += t,
      behavior: n
    }), this.scrollOffset !== null && (this.scrollOffset += this.scrollAdjustments, this.scrollOffset < 0 && (this.scrollOffset = 0), this.scrollAdjustments = 0), !0));
  }
  scheduleScrollReconcile() {
    if (!this.targetWindow) {
      this.scrollState = null;
      return;
    }
    this.rafId == null && (this.rafId = this.targetWindow.requestAnimationFrame(() => {
      this.rafId = null, this.reconcileScroll();
    }));
  }
  reconcileScroll() {
    if (!this.scrollState || !this.scrollElement) return;
    if (this.now() - this.scrollState.startedAt > 5e3) {
      this.scrollState = null;
      return;
    }
    const r = this.scrollState.index != null ? this.getOffsetForIndex(this.scrollState.index, this.scrollState.align) : void 0, s = r ? r[0] : this.scrollState.lastTargetOffset, o = 1, i = s !== this.scrollState.lastTargetOffset;
    if (!i && Ii(s, this.getScrollOffset())) {
      if (this.scrollState.stableFrames++, this.scrollState.stableFrames >= o) {
        this.getScrollOffset() !== s && this._scrollToOffset(s, {
          adjustments: void 0,
          behavior: "auto"
        }), this.scrollState = null;
        return;
      }
    } else if (this.scrollState.stableFrames = 0, i) {
      const l = this.getSize() || 600, c = Math.abs(s - this.getScrollOffset()), a = this.scrollState.behavior === "smooth" && c > l;
      this.scrollState.lastTargetOffset = s, a || (this.scrollState.behavior = "auto"), this._scrollToOffset(s, {
        adjustments: void 0,
        behavior: a ? "smooth" : "auto"
      });
    }
    this.scheduleScrollReconcile();
  }
}
const Br = (e, t, n, r) => {
  for (; e <= t; ) {
    const s = (e + t) / 2 | 0, o = n(s);
    if (o < r)
      e = s + 1;
    else if (o > r)
      t = s - 1;
    else
      return s;
  }
  return e > 0 ? e - 1 : 0;
};
function Bi(e, t, n) {
  let r = 0;
  for (; r <= t; ) {
    const s = (r + t) / 2 | 0, o = e[s * 2];
    if (o < n)
      r = s + 1;
    else if (o > n)
      t = s - 1;
    else
      return s;
  }
  return r > 0 ? r - 1 : 0;
}
function Wi(e, t, n, r, s) {
  const o = e.length - 1;
  if (e.length <= r)
    return { startIndex: 0, endIndex: o };
  if (r === 1 && s !== null) {
    const a = Bi(
      s,
      o,
      n
    );
    let u = a;
    const d = n + t;
    for (; u < o && s[u * 2] + s[u * 2 + 1] < d; )
      u++;
    return { startIndex: a, endIndex: u };
  }
  let l = Br(0, o, (a) => e[a].start, n), c = l;
  if (r === 1)
    for (; c < o && e[c].end < n + t; )
      c++;
  else if (r > 1) {
    const a = Array(r).fill(0);
    for (; c < o && a.some((d) => d < n + t); ) {
      const d = e[c];
      a[d.lane] = d.end, c++;
    }
    const u = Array(r).fill(n + t);
    for (; l >= 0 && u.some((d) => d >= n); ) {
      const d = e[l];
      u[d.lane] = d.start, l--;
    }
    l = Math.max(0, l - l % r), c = Math.min(o, c + (r - 1 - c % r));
  }
  return { startIndex: l, endIndex: c };
}
const en = typeof document < "u" ? O.useLayoutEffect : O.useEffect;
function Vi({
  useFlushSync: e = !0,
  directDomUpdates: t = !1,
  directDomUpdatesMode: n = "transform",
  ...r
}) {
  const s = O.useReducer((u) => u + 1, 0)[1], o = O.useRef({
    enabled: t,
    mode: n,
    container: null,
    lastSize: null,
    // Keyed by the element itself so a remounted node (same key, new DOM
    // node — e.g. when `enabled` is toggled off then on) is treated as fresh
    // and gets its style written.
    lastPositions: /* @__PURE__ */ new WeakMap(),
    prevRange: null
  });
  o.current.enabled = t, o.current.mode = n;
  const i = (u) => {
    const d = o.current;
    if (!d.enabled || !d.container) return;
    const h = u.getTotalSize();
    if (h !== d.lastSize) {
      d.lastSize = h;
      const f = u.options.horizontal ? "width" : "height";
      d.container.style[f] = `${h}px`;
    }
  }, l = (u) => {
    const d = o.current;
    if (!d.enabled || !d.container) return;
    i(u);
    const h = !!u.options.horizontal, f = d.mode === "transform", g = h ? "left" : "top", m = u.options.scrollMargin, v = u.getVirtualItems();
    for (const p of v) {
      const b = p.start - m, w = u.elementsCache.get(p.key);
      w && d.lastPositions.get(w) !== b && (d.lastPositions.set(w, b), f ? w.style.transform = h ? `translate3d(${b}px, 0, 0)` : `translate3d(0, ${b}px, 0)` : w.style[g] = `${b}px`);
    }
  }, c = {
    ...r,
    onChange: (u, d) => {
      var h;
      const f = o.current;
      let g = !0;
      if (f.enabled) {
        l(u);
        const m = u.range, v = f.prevRange;
        g = !v || v.isScrolling !== u.isScrolling || v.startIndex !== (m == null ? void 0 : m.startIndex) || v.endIndex !== (m == null ? void 0 : m.endIndex), g && (f.prevRange = m ? {
          startIndex: m.startIndex,
          endIndex: m.endIndex,
          isScrolling: u.isScrolling
        } : null);
      }
      g && (e && d ? ns(s) : s()), (h = r.onChange) == null || h.call(r, u, d);
    }
  }, [a] = O.useState(() => {
    const u = new Pi(c);
    return Object.assign(u, {
      containerRef: (d) => {
        const h = o.current;
        if (h.container = d, h.lastSize = null, d && h.enabled) {
          const f = u.getTotalSize();
          h.lastSize = f;
          const g = u.options.horizontal ? "width" : "height";
          d.style[g] = `${f}px`;
        }
      }
    });
  });
  return a.setOptions(c), en(() => a._didMount(), []), en(() => (i(a), a._willUpdate())), en(() => {
    l(a);
  }), a;
}
function ji(e) {
  return Vi({
    observeElementRect: Li,
    observeElementOffset: zi,
    scrollToFn: $i,
    ...e
  });
}
const dt = O.forwardRef(
  ({
    onChange: e,
    disabled: t,
    className: n,
    value: r,
    indeterminate: s,
    label: o,
    onClick: i,
    ...l
  }, c) => /* @__PURE__ */ D(
    "input",
    {
      ref: c,
      type: "checkbox",
      disabled: t,
      checked: r,
      onChange: (u) => {
        e(u.target.checked, u);
      },
      className: I("Checkbox", n, {
        Checkbox_indeterminate: s
      }),
      ...l
    }
  )
);
dt.displayName = "Checkbox";
const Wr = z.createContext({
  items: [],
  renderItem: ({ item: e }) => e.id
}), En = () => z.useContext(Wr), Ki = ({ item: e, index: t }) => {
  const { selection: n, menu: r, search: s, renderItem: o } = En(), i = (() => {
    if (r)
      return {
        items: r.items(e)
      };
  })(), l = (() => {
    if (n) {
      const { itemSelected: a, selectedIds: u, setSelectedIds: d, itemDisabled: h } = n, f = !!(a && a(e)), g = !!(h && h(e));
      return {
        selected: f,
        selectedIds: u,
        toggle: () => {
          d([
            ...u.filter((v) => v !== e.id),
            ...f ? [] : [e.id]
          ]);
        },
        disabled: g
      };
    }
  })(), c = (() => {
    if (s)
      return {
        ...s,
        filtered: s.searchItem(e, s.keywords)
      };
  })();
  return {
    index: t,
    item: e,
    renderItem: o,
    menu: i,
    selection: l,
    search: c
  };
}, Xi = ({
  value: e,
  children: t
}) => /* @__PURE__ */ D(Wr.Provider, { value: e, children: t }), Hi = z.forwardRef(
  ({ children: e, index: t, className: n, item: r, dragging: s, ...o }, i) => {
    const { selection: l, menu: c, renderItem: a, search: u } = Ki({
      item: r,
      index: t
    }), d = l && l.selectedIds.length > 0, h = l && l.selected, f = () => {
      l && l.selectedIds.length > 0 && l.toggle();
    };
    return /* @__PURE__ */ re(
      "li",
      {
        ref: i,
        ...o,
        className: I("ListItem", n, {
          ListItem_selected: h,
          ListItem_selection: d,
          ListItem_dragging: s,
          ListItem_filtered: u == null ? void 0 : u.filtered,
          ListItem_highlighted: (u == null ? void 0 : u.currentResultItemIndex) === t
        }),
        children: [
          l && /* @__PURE__ */ D(
            dt,
            {
              className: I("ListItemCheckbox"),
              onChange: () => l.toggle(),
              value: l.selected
            }
          ),
          /* @__PURE__ */ D("div", { onClick: f, className: I("ListItemContent"), children: a({ item: r, index: t }) }),
          c && /* @__PURE__ */ D(
            wr,
            {
              className: I("ListItemOptions"),
              onClick: (g) => g.stopPropagation(),
              tabIndex: l && l.selectedIds.length > 0 ? -1 : 0,
              placement: "bottom-end",
              ...c
            }
          )
        ]
      }
    );
  }
), Dn = O.forwardRef(
  ({ onChange: e, disabled: t, className: n, ...r }, s) => /* @__PURE__ */ D(
    "input",
    {
      ref: s,
      disabled: t,
      onChange: (i) => {
        e(i.target.value, i);
      },
      className: I("Input", n),
      ...r
    }
  )
);
Dn.displayName = "Input";
const Yi = () => {
  var n;
  const { selection: e, items: t } = En();
  if (e) {
    const { selectedIds: r, setSelectedIds: s } = e, o = t.every(({ id: l }) => e.selectedIds.includes(l)), i = !o && t.some(({ id: l }) => r.includes(l));
    return /* @__PURE__ */ re("label", { className: I("SelectAll"), children: [
      /* @__PURE__ */ D(
        dt,
        {
          onChange: () => {
            s(o ? [] : t.map(({ id: l }) => l));
          },
          value: o,
          indeterminate: i
        }
      ),
      /* @__PURE__ */ D("span", { className: "SelectAllCheckbox", children: (n = e.selectedIds) != null && n.length ? `Selected ${e.selectedIds.length}` : "Select all" })
    ] });
  }
  return null;
}, Gi = z.forwardRef(
  ({ className: e, children: t, ...n }, r) => {
    const { selection: s, menu: o, search: i } = En();
    return /* @__PURE__ */ re("div", { className: I("ListOptions", e), ref: r, children: [
      s && /* @__PURE__ */ D(Yi, {}),
      t && /* @__PURE__ */ D("div", { className: I("ListOptionsContent"), ...n, children: t }),
      i && /* @__PURE__ */ D(
        Dn,
        {
          className: I("ListOptionsFilter"),
          placeholder: "Search items",
          value: i.keywords,
          onChange: (l) => i.onChange(l),
          onKeyDown: (l) => {
            const c = l.key || l.keyCode;
            c === "Enter" && l.shiftKey || c === "ArrowUp" ? (l.preventDefault(), i.prev(l)) : (c === "Enter" || c === "ArrowDown") && (l.preventDefault(), i.next(l));
          }
        }
      ),
      o && /* @__PURE__ */ D(wr, { items: o.items() })
    ] });
  }
), Ui = ({
  index: e,
  item: t,
  items: n,
  draggable: r
}) => {
  const {
    attributes: s,
    listeners: o,
    setNodeRef: i,
    transform: l,
    transition: c,
    isDragging: a
  } = Ei({
    id: t.id,
    disabled: !r
  }), u = O.useMemo(
    () => ({
      transform: at.Translate.toString(l),
      transition: c
    }),
    [l, c]
  );
  return /* @__PURE__ */ D(
    Hi,
    {
      ref: i,
      ...s,
      ...o,
      item: t,
      index: e,
      dragging: a,
      style: u
    }
  );
}, qi = O.forwardRef(
  ({
    className: e,
    renderItem: t,
    items: n,
    selection: r,
    menu: s,
    search: o,
    draggable: i = !1,
    itemSize: l = 48
  }, c) => {
    const [a, u] = O.useState(n), [d, h] = O.useState(!1), [f, g] = O.useState(
      (r == null ? void 0 : r.initialSelectedIds) || []
    ), [m, v] = O.useState(""), [p, b] = O.useState(-1), w = O.useRef(null), x = (R) => f.includes(R.id);
    O.useEffect(() => {
      u(n);
    }, [n]);
    const y = ji({
      count: a.length,
      getScrollElement: () => w.current,
      estimateSize: () => l,
      overscan: 10
    }), S = () => {
      window.navigator.vibrate && window.navigator.vibrate(100), h(!0);
    }, C = ({ active: R, over: L }) => {
      if (h(!1), L && R.id !== L.id) {
        const T = a.findIndex((V) => V.id === R.id), _ = a.findIndex((V) => V.id === L.id);
        T !== -1 && _ !== -1 && u((V) => Rn(V, T, _));
      }
    }, E = so(
      Ut(Cn, { activationConstraint: { distance: 5 } }),
      Ut(Ar),
      Ut(xn)
    );
    O.useEffect(() => {
      o && b(
        m ? n.findIndex((R) => o.searchItem(R, m)) : -1
      );
    }, [m, n, o]);
    const A = () => {
      if (o && n.filter(
        (L) => o.searchItem(L, m)
      ).length > 1) {
        const L = n.findIndex(
          (T, _) => _ > p && o.searchItem(T, m)
        );
        b(
          L === -1 ? n.findIndex((T, _) => o.searchItem(T, m)) : L
        );
      }
    }, M = () => {
      if (o) {
        const R = n.reduce(
          (L, T, _) => o.searchItem(T, m) ? [...L, _] : L,
          []
        );
        if (R.length > 1) {
          const L = R.indexOf(p) - 1;
          b(
            L === -1 ? R[R.length - 1] : R[L]
          );
        }
      }
    };
    return O.useEffect(() => {
      p > -1 && y.scrollToIndex(p, { align: "center" });
    }, [p, y]), /* @__PURE__ */ D(
      Xi,
      {
        value: {
          items: n,
          menu: s,
          renderItem: t,
          search: o && {
            ...o,
            keywords: m,
            onChange: v,
            next: A,
            prev: M,
            currentResultItemIndex: p
          },
          selection: r && {
            ...r,
            selectedIds: f,
            setSelectedIds: g,
            itemSelected: x
          }
        },
        children: /* @__PURE__ */ D(
          oi,
          {
            sensors: E,
            onDragStart: S,
            onDragEnd: C,
            children: /* @__PURE__ */ D(
              bi,
              {
                items: a.map((R) => R.id),
                strategy: pi,
                children: /* @__PURE__ */ re("div", { ref: w, className: I("ListContainer", e), children: [
                  /* @__PURE__ */ D(Gi, {}),
                  /* @__PURE__ */ D("div", { className: I("ListScroll", { List_dragging: d }), children: /* @__PURE__ */ D("ul", { ref: c, className: I("List"), style: { height: y.getTotalSize(), position: "relative" }, children: y.getVirtualItems().map((R) => {
                    const L = a[R.index];
                    return L ? /* @__PURE__ */ D(
                      "div",
                      {
                        "data-index": R.index,
                        ref: y.measureElement,
                        style: {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${R.start}px)`
                        },
                        children: /* @__PURE__ */ D(
                          Ui,
                          {
                            index: R.index,
                            item: L,
                            items: a,
                            draggable: i,
                            itemSize: l
                          }
                        )
                      },
                      L.id
                    ) : null;
                  }) }) })
                ] })
              }
            )
          }
        )
      }
    );
  }
);
qi.displayName = "List";
const ol = ({
  direction: e = "row",
  align: t = "flex-start",
  justify: n = "flex-start",
  className: r,
  style: s,
  children: o
}) => /* @__PURE__ */ D(
  "div",
  {
    style: s,
    className: I("FlexBox", r, {
      [`FlexBox_${e}`]: !0,
      [`FlexBox_justify_${n}`]: !0,
      [`FlexBox_align_${t}`]: !0,
      [`FlexBox_${n}`]: !0
    }),
    children: o
  }
), Ji = O.forwardRef(
  ({ name: e, value: t, onChange: n, options: r, disabled: s, readOnly: o, className: i, showSelectAll: l, direction: c = "column" }, a) => {
    const u = (g) => `${e}-${g.value}`, d = (g, m, v) => {
      n(
        [...(t == null ? void 0 : t.filter((p) => p !== g.value)) || [], ...m ? [g.value] : []],
        v
      );
    }, h = r.every((g) => t == null ? void 0 : t.includes(g.value)), f = (g, m) => {
      n(h ? [] : r.map((v) => v.value), m);
    };
    return /* @__PURE__ */ re(
      "div",
      {
        className: I("CheckboxGroup", i, {
          [`CheckboxGroup_${c}`]: !0,
          CheckboxGroup_disabled: s
        }),
        ref: a,
        children: [
          r.map((g) => /* @__PURE__ */ re(
            "label",
            {
              htmlFor: u(g),
              className: I("CheckboxOption", {
                CheckboxOption_readOnly: o || g.readOnly,
                CheckboxOption_disabled: s || g.disabled
              }),
              children: [
                /* @__PURE__ */ D(
                  dt,
                  {
                    id: u(g),
                    disabled: s || g.disabled,
                    readOnly: o || g.readOnly,
                    value: (t == null ? void 0 : t.includes(g.value)) ?? !1,
                    onChange: (m, v) => d(g, m, v)
                  }
                ),
                /* @__PURE__ */ D("span", { title: g.label, children: g.label })
              ]
            },
            u(g)
          )),
          l && /* @__PURE__ */ re("label", { htmlFor: `${e}-SELECT_ALL`, className: I("CheckboxOption"), children: [
            /* @__PURE__ */ D(
              dt,
              {
                id: "select_all",
                disabled: s,
                value: r.every((g) => t == null ? void 0 : t.includes(g.value)),
                onChange: f,
                indeterminate: !h && (t ? t.length > 0 : !1)
              }
            ),
            /* @__PURE__ */ D("span", { children: "Select all" })
          ] })
        ]
      }
    );
  }
);
Ji.displayName = "CheckboxGroup";
const Vr = O.forwardRef(
  ({ onChange: e, disabled: t, className: n, value: r, checked: s, indeterminate: o, ...i }, l) => /* @__PURE__ */ D(
    "input",
    {
      ref: l,
      type: "radio",
      disabled: t,
      value: r,
      checked: s,
      onChange: (a) => {
        e(a.target.value, a);
      },
      className: I("Radio", n, {
        Radio_indeterminate: o
      }),
      ...i
    }
  )
);
Vr.displayName = "Radio";
const Qi = O.forwardRef(
  ({ name: e, value: t, onChange: n, options: r, disabled: s, readOnly: o, className: i, direction: l = "column" }, c) => {
    const a = (d) => `${e}-${d.value}`, u = (d, h) => {
      n(d.value, h);
    };
    return /* @__PURE__ */ D(
      "div",
      {
        className: I("RadioGroup", i, {
          [`RadioGroup_${l}`]: !0,
          RadioGroup_disabled: s
        }),
        ref: c,
        children: r.map((d) => /* @__PURE__ */ re(
          "label",
          {
            htmlFor: a(d),
            className: I("RadioOption", {
              RadioOption_readOnly: o || d.readOnly,
              RadioOption_disabled: s || d.disabled
            }),
            children: [
              /* @__PURE__ */ D(
                Vr,
                {
                  id: a(d),
                  disabled: s || d.disabled,
                  readOnly: o || d.readOnly,
                  value: d.value,
                  checked: t === d.value,
                  onChange: (h, f) => u(d, f)
                }
              ),
              /* @__PURE__ */ D("span", { title: d.label, children: d.label })
            ]
          },
          a(d)
        ))
      }
    );
  }
);
Qi.displayName = "RadioGroup";
const il = ({
  className: e,
  disabled: t,
  options: n,
  value: r,
  placeholder: s,
  searchPlaceholder: o,
  onChange: i,
  onFocus: l = () => {
  },
  onBlur: c = () => {
  }
}) => {
  const [a, u] = z.useState(!1), [d, h] = z.useState(""), f = z.useRef(null), g = (S) => {
    i(S.value), u(!1);
  }, m = (S) => {
    u(!0), l(S);
  }, v = (S) => {
    u(!1), c(S);
  }, p = (S) => {
    h(S);
  };
  z.useEffect(() => {
    h("");
  }, [a]);
  const b = n.filter((S) => S.label.toLowerCase().includes(d.toLowerCase()) || S.value.toLowerCase().includes(d.toLowerCase())), w = a && o ? o : s, x = n.find((S) => S.value === r), y = a ? d : r && x ? x.label : "";
  return /* @__PURE__ */ D(
    br,
    {
      closeOnClickOutside: !0,
      content: /* @__PURE__ */ D(
        gn,
        {
          items: b.map((S) => ({
            id: S.value,
            label: S.label,
            disabled: S.disabled,
            onMouseDown: () => g(S)
          }))
        }
      ),
      target: ({ open: S, close: C, visible: E, ref: A, className: M }) => /* @__PURE__ */ re(
        "div",
        {
          ref: A,
          className: I(e, M, "Select", {
            Select_disabled: t,
            Select_focus: a,
            Select_visible: E
          }),
          children: [
            /* @__PURE__ */ D(
              Dn,
              {
                ref: f,
                className: I("SelectValue"),
                disabled: t,
                onFocus: (R) => {
                  S(), m(R);
                },
                onBlur: (R) => {
                  C(), v(R);
                },
                placeholder: w,
                value: y,
                onChange: p
              }
            ),
            /* @__PURE__ */ re("div", { className: I("SelectActions"), children: [
              /* @__PURE__ */ D(
                Ke,
                {
                  onClick: () => i(void 0),
                  className: I("SelectAction", "SelectActionClear"),
                  variant: "clear",
                  children: "✕"
                }
              ),
              /* @__PURE__ */ D(
                Ke,
                {
                  onClick: () => {
                    E ? C() : S();
                  },
                  className: I("SelectAction", "SelectActionOpen"),
                  variant: "clear",
                  children: E ? "▲" : "▼"
                }
              )
            ] })
          ]
        }
      )
    }
  );
}, Zi = ({
  disabled: e,
  className: t,
  value: n = 50,
  onChange: r,
  min: s = 0,
  max: o = 100
}) => {
  const [i, l] = O.useState(!1), [c, a] = O.useState(!1), u = O.useRef(null), d = () => l(!0), h = () => l(!1), f = (x) => {
    x.preventDefault(), a(!0);
  }, g = O.useCallback(
    (x) => {
      c && (x.preventDefault(), a(!1));
    },
    [c]
  ), m = O.useCallback(
    (x) => {
      if (c && u.current) {
        const { clientX: y } = x, { left: S, width: C } = u.current.getBoundingClientRect(), E = (y - S) / C, A = Math.round(E * (o - s)) + s;
        r(Math.min(o, Math.max(s, A)));
      }
    },
    [c, s, o, r]
  ), v = (x) => {
    if (!u.current) return;
    const { clientX: y } = x, { left: S, width: C } = u.current.getBoundingClientRect(), E = (y - S) / C, A = Math.round(E * (o - s)) + s;
    r(Math.min(o, Math.max(s, A)));
  }, p = (x) => {
    x.key === "ArrowLeft" ? r(Math.max(s, n - 1)) : x.key === "ArrowRight" && r(Math.min(o, n + 1));
  };
  O.useEffect(() => (window.addEventListener("mousemove", m), window.addEventListener("mouseup", g), () => {
    window.removeEventListener("mousemove", m), window.removeEventListener("mouseup", g);
  }), [m, g]);
  const b = (n - s) / (o - s) * 100, w = O.useMemo(() => ({
    backgroundImage: `
      linear-gradient(to right, ${n === s ? "transparent" : "var(--slider-rail-fill-color)"},
      ${Array.from(new Array(o - s - 1)).map(
      (x, y) => `${y + 1 <= n - s ? "var(--slider-rail-fill-color)" : "transparent"} calc(${100 / (o - s) * (y + 1)}% - 2px), black calc(${100 / (o - s) * (y + 1)}% - 2px), black calc(${100 / (o - s) * (y + 1)}% + 2px), ${y + 2 <= n - s ? "var(--slider-rail-fill-color)" : "transparent"} calc(${100 / (o - s) * (y + 1)}% + 2px)`
    ).join(", ")}, ${n === o ? "var(--slider-rail-fill-color)" : "transparent"})
    `
  }), [n, s, o]);
  return /* @__PURE__ */ D(
    "div",
    {
      className: I("Slider", t, {
        Slider_disabled: e,
        Slider_dragging: c,
        Slider_focus: i
      }),
      onClick: v,
      onMouseDown: f,
      children: /* @__PURE__ */ D(
        "div",
        {
          ref: u,
          className: I("SliderRail", t, { Slider_disabled: e }),
          style: w,
          children: /* @__PURE__ */ D(
            Ke,
            {
              variant: "secondary",
              disabled: e,
              style: { left: `calc(${b}% )` },
              onKeyDown: p,
              onFocus: d,
              onBlur: h,
              children: /* @__PURE__ */ D("span", { className: I("SliderTooltip"), style: { left: "50%" }, children: /* @__PURE__ */ D("span", { className: I("SliderTooltipWrapper"), children: n }) })
            }
          )
        }
      )
    }
  );
};
Zi.displayName = "Slider";
const el = O.forwardRef(
  ({ onChange: e, disabled: t, className: n, value: r, indeterminate: s, label: o, onClick: i, ...l }, c) => /* @__PURE__ */ D(
    "input",
    {
      ref: c,
      type: "checkbox",
      disabled: t,
      checked: r,
      onChange: (u) => {
        e(u.target.checked, u);
      },
      className: I("Switch", n, {
        Switch_indeterminate: s
      }),
      ...l
    }
  )
);
el.displayName = "Switch";
const tl = z.forwardRef(
  ({ content: e, children: t, placement: n = "bottom", trigger: r = "hover" }, s) => {
    var w, x;
    const [o, i] = z.useState(!1), [l, c] = z.useState(null), { refs: a, floatingStyles: u, elements: d, update: h, middlewareData: f } = vr({
      placement: n,
      open: o,
      middleware: [Bs(0), Ws({ element: l, padding: 0 })],
      whileElementsMounted: mr
    });
    Zr(s, () => ({ update: h, middlewareData: f, elements: d, floatingStyles: u, placement: n }));
    const g = () => {
      r === "hover" && i(!0);
    }, m = () => {
      r === "hover" && i(!1);
    }, v = () => {
      r === "click" && i(!o);
    };
    F(() => {
      if (o && r === "click") {
        const y = d.reference, S = d.floating, C = (E) => {
          !(y != null && y.contains(E.target)) && !(S != null && S.contains(E.target)) && i(!1);
        };
        return document.addEventListener("touchstart", C), document.addEventListener("mousedown", C), () => {
          document.removeEventListener("touchstart", C), document.removeEventListener("mousedown", C);
        };
      }
    }, [o, r, d.reference, d.floating]);
    const p = ((w = f.arrow) == null ? void 0 : w.x) ?? 0, b = ((x = f.arrow) == null ? void 0 : x.y) ?? 0;
    return /* @__PURE__ */ re(er, { children: [
      /* @__PURE__ */ D(
        "span",
        {
          ref: a.setReference,
          onMouseEnter: g,
          onMouseLeave: m,
          onMouseDown: v,
          className: I("TooltipTarget", { visible: o }),
          children: t
        }
      ),
      o && nr.createPortal(
        /* @__PURE__ */ re(
          "div",
          {
            ref: a.setFloating,
            style: u,
            className: I("Tooltip", {
              Tooltip_visible: o,
              [`Tooltip_${n}`]: !0
            }),
            onMouseEnter: g,
            onMouseLeave: m,
            children: [
              /* @__PURE__ */ D(
                "span",
                {
                  ref: c,
                  style: { left: p, top: b },
                  className: I("TooltipArrow")
                }
              ),
              /* @__PURE__ */ D("div", { className: I("TooltipWrapper"), children: e })
            ]
          }
        ),
        document.body
      )
    ] });
  }
);
tl.displayName = "Tooltip";
const ll = ({ className: e, children: t }) => /* @__PURE__ */ D("span", { className: I("Tag", e), children: t });
export {
  Ke as Button,
  ss as ButtonGroup,
  dt as Checkbox,
  Ji as CheckboxGroup,
  br as Dropdown,
  wr as DropdownMenu,
  ol as FlexBox,
  Dn as Input,
  qi as List,
  gn as Menu,
  js as MenuIcon,
  Vs as MenuItem,
  Vr as Radio,
  Qi as RadioGroup,
  il as Select,
  Zi as Slider,
  el as Switch,
  ll as Tag,
  tl as Tooltip
};
//# sourceMappingURL=index.js.map
