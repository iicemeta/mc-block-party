import { jsx as c, jsxs as _, Fragment as X } from "react/jsx-runtime";
import { clsx as J } from "clsx";
import * as w from "react";
import R, { useImperativeHandle as Q, useEffect as Z } from "react";
import W from "react-dom";
import { useFloating as j, autoUpdate as z, offset as ee, arrow as te } from "@floating-ui/react-dom";
import { useSensors as ne, useSensor as G, PointerSensor as se, TouchSensor as le, KeyboardSensor as oe, DndContext as re } from "@dnd-kit/core";
import { SortableContext as ae, verticalListSortingStrategy as ce, arrayMove as ie, useSortable as de } from "@dnd-kit/sortable";
import { CSS as ue } from "@dnd-kit/utilities";
import { useVirtualizer as fe } from "@tanstack/react-virtual";
const d = J, $ = w.forwardRef(
  ({ children: r, onClick: t, active: n, disabled: a, className: s, type: e, variant: o, ...l }, f) => /* @__PURE__ */ c(
    "button",
    {
      ref: f,
      ...l,
      type: e,
      onClick: t,
      className: d("Button", s, {
        [`Button_${o}`]: o,
        Button_active: n,
        Button_disabled: a
      }),
      children: /* @__PURE__ */ c("span", { className: d("ButtonText"), children: r })
    }
  )
);
$.displayName = "Button";
const he = ({ options: r, disabled: t, className: n, onChange: a, value: s }) => {
  const e = (o, l) => {
    o.onClick && o.onClick(l), a && a(o.value);
  };
  return /* @__PURE__ */ c("div", { className: d("ButtonGroup", n), children: r.map((o, l) => /* @__PURE__ */ c(
    $,
    {
      disabled: t,
      type: "button",
      active: o.value === s,
      className: d("ButtonGroupButton", {
        "ButtonGroupButton-active": o.value === s
      }),
      onClick: (f) => e(o, f),
      variant: o.value === s ? "primary" : "secondary",
      children: o.label
    },
    l
  )) });
};
he.displayName = "ButtonGroup";
const U = ({
  content: r,
  target: t,
  placement: n = "bottom-start",
  closeOnClickContent: a,
  closeOnClickOutside: s,
  trigger: e = "click"
}) => {
  const [o, l] = R.useState(!1), { refs: f, floatingStyles: m, elements: u } = j({
    placement: n,
    open: o,
    whileElementsMounted: z
  }), h = () => {
    l(!o);
  }, v = () => {
    e === "hover" && !o && l(!0);
  }, C = () => {
    e === "hover" && o && l(!1);
  }, i = u.reference, p = u.floating, N = () => {
    a && l(!1);
  };
  R.useEffect(() => {
    if (o && e === "click") {
      const y = (L) => {
        s && i && p && !i.contains(L.target) && !p.contains(L.target) && l(!1);
      };
      return document.addEventListener("mousedown", y), () => document.removeEventListener("mousedown", y);
    }
  }, [o, i, p]), R.useEffect(() => {
    if (o && e === "hover") {
      const y = (L) => {
        i && p && !i.contains(L.target) && !p.contains(L.target) && l(!1);
      };
      return document.addEventListener("mouseleave", y), () => document.removeEventListener("mouseleave", y);
    }
  }, [o, i, p]);
  const k = i ? `${i.offsetWidth}px` : void 0;
  return /* @__PURE__ */ _(X, { children: [
    typeof t == "function" ? t({
      ref: f.setReference,
      open: () => l(!0),
      close: () => l(!1),
      visible: o,
      className: d("DropdownTarget", {
        DropdownTarget_visible: o
      })
    }) : R.cloneElement(t, {
      ref: f.setReference,
      onClick: h,
      onMouseEnter: v,
      onMouseMove: v,
      onMouseLeave: C,
      active: o,
      className: d("DropdownTarget", t.props.className, {
        DropdownTarget_visible: o
      })
    }),
    o && W.createPortal(
      /* @__PURE__ */ c(
        "div",
        {
          ref: f.setFloating,
          style: { ...m, minWidth: k },
          className: d("Dropdown", { Dropdown_visible: o }),
          onClick: N,
          onMouseEnter: v,
          onMouseMove: v,
          onMouseLeave: C,
          children: r
        }
      ),
      document.body
    )
  ] });
}, me = ({ label: r, onClick: t, disabled: n, ...a }) => /* @__PURE__ */ c(
  "div",
  {
    onClick: t,
    className: d("MenuItem", { MenuItem_disabled: n }),
    ...a,
    children: r
  }
), V = w.forwardRef(({ items: r }, t) => /* @__PURE__ */ c("div", { ref: t, className: d("Menu"), children: r.map((n) => /* @__PURE__ */ c(me, { ...n }, n.id)) }));
V.displayName = "Menu";
const pe = ({ className: r }) => /* @__PURE__ */ c("i", { className: d("MenuIcon", r), children: /* @__PURE__ */ c("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 20 20", children: /* @__PURE__ */ c("path", { d: "m 0 2 h 20 M 0 10 h 20 M 0 18 h 20 " }) }) }), Y = ({
  items: r,
  placement: t = "bottom-start",
  className: n,
  onClick: a,
  tabIndex: s
}) => /* @__PURE__ */ c(
  U,
  {
    closeOnClickOutside: !0,
    closeOnClickContent: !0,
    placement: t,
    content: /* @__PURE__ */ c(V, { items: r }),
    target: /* @__PURE__ */ c(
      $,
      {
        onClick: a,
        variant: "clear",
        className: n,
        tabIndex: s,
        children: /* @__PURE__ */ c(pe, {})
      }
    )
  }
), T = w.forwardRef(
  ({
    onChange: r,
    disabled: t,
    className: n,
    value: a,
    indeterminate: s,
    label: e,
    onClick: o,
    ...l
  }, f) => /* @__PURE__ */ c(
    "input",
    {
      ref: f,
      type: "checkbox",
      disabled: t,
      checked: a,
      onChange: (u) => {
        r(u.target.checked, u);
      },
      className: d("Checkbox", n, {
        Checkbox_indeterminate: s
      }),
      ...l
    }
  )
);
T.displayName = "Checkbox";
const H = R.createContext({
  items: [],
  renderItem: ({ item: r }) => r.id
}), K = () => R.useContext(H), ge = ({ item: r, index: t }) => {
  const { selection: n, menu: a, search: s, renderItem: e } = K(), o = (() => {
    if (a)
      return {
        items: a.items(r)
      };
  })(), l = (() => {
    if (n) {
      const { itemSelected: m, selectedIds: u, setSelectedIds: h, itemDisabled: v } = n, C = !!(m && m(r)), i = !!(v && v(r));
      return {
        selected: C,
        selectedIds: u,
        toggle: () => {
          h([
            ...u.filter((N) => N !== r.id),
            ...C ? [] : [r.id]
          ]);
        },
        disabled: i
      };
    }
  })(), f = (() => {
    if (s)
      return {
        ...s,
        filtered: s.searchItem(r, s.keywords)
      };
  })();
  return {
    index: t,
    item: r,
    renderItem: e,
    menu: o,
    selection: l,
    search: f
  };
}, we = ({
  value: r,
  children: t
}) => /* @__PURE__ */ c(H.Provider, { value: r, children: t }), ve = R.forwardRef(
  ({ children: r, index: t, className: n, item: a, dragging: s, ...e }, o) => {
    const { selection: l, menu: f, renderItem: m, search: u } = ge({
      item: a,
      index: t
    }), h = l && l.selectedIds.length > 0, v = l && l.selected, C = () => {
      l && l.selectedIds.length > 0 && l.toggle();
    };
    return /* @__PURE__ */ _(
      "li",
      {
        ref: o,
        ...e,
        className: d("ListItem", n, {
          ListItem_selected: v,
          ListItem_selection: h,
          ListItem_dragging: s,
          ListItem_filtered: u == null ? void 0 : u.filtered,
          ListItem_highlighted: (u == null ? void 0 : u.currentResultItemIndex) === t
        }),
        children: [
          l && /* @__PURE__ */ c(
            T,
            {
              className: d("ListItemCheckbox"),
              onChange: () => l.toggle(),
              value: l.selected
            }
          ),
          /* @__PURE__ */ c("div", { onClick: C, className: d("ListItemContent"), children: m({ item: a, index: t }) }),
          f && /* @__PURE__ */ c(
            Y,
            {
              className: d("ListItemOptions"),
              onClick: (i) => i.stopPropagation(),
              tabIndex: l && l.selectedIds.length > 0 ? -1 : 0,
              placement: "bottom-end",
              ...f
            }
          )
        ]
      }
    );
  }
), P = w.forwardRef(
  ({ onChange: r, disabled: t, className: n, ...a }, s) => /* @__PURE__ */ c(
    "input",
    {
      ref: s,
      disabled: t,
      onChange: (o) => {
        r(o.target.value, o);
      },
      className: d("Input", n),
      ...a
    }
  )
);
P.displayName = "Input";
const Se = () => {
  var n;
  const { selection: r, items: t } = K();
  if (r) {
    const { selectedIds: a, setSelectedIds: s } = r, e = t.every(({ id: l }) => r.selectedIds.includes(l)), o = !e && t.some(({ id: l }) => a.includes(l));
    return /* @__PURE__ */ _("label", { className: d("SelectAll"), children: [
      /* @__PURE__ */ c(
        T,
        {
          onChange: () => {
            s(e ? [] : t.map(({ id: l }) => l));
          },
          value: e,
          indeterminate: o
        }
      ),
      /* @__PURE__ */ c("span", { className: "SelectAllCheckbox", children: (n = r.selectedIds) != null && n.length ? `Selected ${r.selectedIds.length}` : "Select all" })
    ] });
  }
  return null;
}, Ce = R.forwardRef(
  ({ className: r, children: t, ...n }, a) => {
    const { selection: s, menu: e, search: o } = K();
    return /* @__PURE__ */ _("div", { className: d("ListOptions", r), ref: a, children: [
      s && /* @__PURE__ */ c(Se, {}),
      t && /* @__PURE__ */ c("div", { className: d("ListOptionsContent"), ...n, children: t }),
      o && /* @__PURE__ */ c(
        P,
        {
          className: d("ListOptionsFilter"),
          placeholder: "Search items",
          value: o.keywords,
          onChange: (l) => o.onChange(l),
          onKeyDown: (l) => {
            const f = l.key || l.keyCode;
            f === "Enter" && l.shiftKey || f === "ArrowUp" ? (l.preventDefault(), o.prev(l)) : (f === "Enter" || f === "ArrowDown") && (l.preventDefault(), o.next(l));
          }
        }
      ),
      e && /* @__PURE__ */ c(Y, { items: e.items() })
    ] });
  }
), be = ({
  index: r,
  item: t,
  items: n,
  draggable: a
}) => {
  const {
    attributes: s,
    listeners: e,
    setNodeRef: o,
    transform: l,
    transition: f,
    isDragging: m
  } = de({
    id: t.id,
    disabled: !a
  }), u = w.useMemo(
    () => ({
      transform: ue.Translate.toString(l),
      transition: f
    }),
    [l, f]
  );
  return /* @__PURE__ */ c(
    ve,
    {
      ref: o,
      ...s,
      ...e,
      item: t,
      index: r,
      dragging: m,
      style: u
    }
  );
}, Ie = w.forwardRef(
  ({
    className: r,
    renderItem: t,
    items: n,
    selection: a,
    menu: s,
    search: e,
    draggable: o = !1,
    itemSize: l = 48
  }, f) => {
    const [m, u] = w.useState(n), [h, v] = w.useState(!1), [C, i] = w.useState(
      (a == null ? void 0 : a.initialSelectedIds) || []
    ), [p, N] = w.useState(""), [k, y] = w.useState(-1), L = w.useRef(null), I = (S) => C.includes(S.id);
    w.useEffect(() => {
      u(n);
    }, [n]);
    const b = fe({
      count: m.length,
      getScrollElement: () => L.current,
      estimateSize: () => l,
      overscan: 10
    }), g = () => {
      window.navigator.vibrate && window.navigator.vibrate(100), v(!0);
    }, M = ({ active: S, over: x }) => {
      if (v(!1), x && S.id !== x.id) {
        const D = m.findIndex((F) => F.id === S.id), B = m.findIndex((F) => F.id === x.id);
        D !== -1 && B !== -1 && u((F) => ie(F, D, B));
      }
    }, E = ne(
      G(se, { activationConstraint: { distance: 5 } }),
      G(le),
      G(oe)
    );
    w.useEffect(() => {
      e && y(
        p ? n.findIndex((S) => e.searchItem(S, p)) : -1
      );
    }, [p, n, e]);
    const O = () => {
      if (e && n.filter(
        (x) => e.searchItem(x, p)
      ).length > 1) {
        const x = n.findIndex(
          (D, B) => B > k && e.searchItem(D, p)
        );
        y(
          x === -1 ? n.findIndex((D, B) => e.searchItem(D, p)) : x
        );
      }
    }, A = () => {
      if (e) {
        const S = n.reduce(
          (x, D, B) => e.searchItem(D, p) ? [...x, B] : x,
          []
        );
        if (S.length > 1) {
          const x = S.indexOf(k) - 1;
          y(
            x === -1 ? S[S.length - 1] : S[x]
          );
        }
      }
    };
    return w.useEffect(() => {
      k > -1 && b.scrollToIndex(k, { align: "center" });
    }, [k, b]), /* @__PURE__ */ c(
      we,
      {
        value: {
          items: n,
          menu: s,
          renderItem: t,
          search: e && {
            ...e,
            keywords: p,
            onChange: N,
            next: O,
            prev: A,
            currentResultItemIndex: k
          },
          selection: a && {
            ...a,
            selectedIds: C,
            setSelectedIds: i,
            itemSelected: I
          }
        },
        children: /* @__PURE__ */ c(
          re,
          {
            sensors: E,
            onDragStart: g,
            onDragEnd: M,
            children: /* @__PURE__ */ c(
              ae,
              {
                items: m.map((S) => S.id),
                strategy: ce,
                children: /* @__PURE__ */ _("div", { ref: L, className: d("ListContainer", r), children: [
                  /* @__PURE__ */ c(Ce, {}),
                  /* @__PURE__ */ c("div", { className: d("ListScroll", { List_dragging: h }), children: /* @__PURE__ */ c("ul", { ref: f, className: d("List"), style: { height: b.getTotalSize(), position: "relative" }, children: b.getVirtualItems().map((S) => {
                    const x = m[S.index];
                    return x ? /* @__PURE__ */ c(
                      "div",
                      {
                        "data-index": S.index,
                        ref: b.measureElement,
                        style: {
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          transform: `translateY(${S.start}px)`
                        },
                        children: /* @__PURE__ */ c(
                          be,
                          {
                            index: S.index,
                            item: x,
                            items: m,
                            draggable: o,
                            itemSize: l
                          }
                        )
                      },
                      x.id
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
Ie.displayName = "List";
const Te = ({
  direction: r = "row",
  align: t = "flex-start",
  justify: n = "flex-start",
  className: a,
  style: s,
  children: e
}) => /* @__PURE__ */ c(
  "div",
  {
    style: s,
    className: d("FlexBox", a, {
      [`FlexBox_${r}`]: !0,
      [`FlexBox_justify_${n}`]: !0,
      [`FlexBox_align_${t}`]: !0,
      [`FlexBox_${n}`]: !0
    }),
    children: e
  }
), ye = w.forwardRef(
  ({ name: r, value: t, onChange: n, options: a, disabled: s, readOnly: e, className: o, showSelectAll: l, direction: f = "column" }, m) => {
    const u = (i) => `${r}-${i.value}`, h = (i, p, N) => {
      n(
        [...(t == null ? void 0 : t.filter((k) => k !== i.value)) || [], ...p ? [i.value] : []],
        N
      );
    }, v = a.every((i) => t == null ? void 0 : t.includes(i.value)), C = (i, p) => {
      n(v ? [] : a.map((N) => N.value), p);
    };
    return /* @__PURE__ */ _(
      "div",
      {
        className: d("CheckboxGroup", o, {
          [`CheckboxGroup_${f}`]: !0,
          CheckboxGroup_disabled: s
        }),
        ref: m,
        children: [
          a.map((i) => /* @__PURE__ */ _(
            "label",
            {
              htmlFor: u(i),
              className: d("CheckboxOption", {
                CheckboxOption_readOnly: e || i.readOnly,
                CheckboxOption_disabled: s || i.disabled
              }),
              children: [
                /* @__PURE__ */ c(
                  T,
                  {
                    id: u(i),
                    disabled: s || i.disabled,
                    readOnly: e || i.readOnly,
                    value: (t == null ? void 0 : t.includes(i.value)) ?? !1,
                    onChange: (p, N) => h(i, p, N)
                  }
                ),
                /* @__PURE__ */ c("span", { title: i.label, children: i.label })
              ]
            },
            u(i)
          )),
          l && /* @__PURE__ */ _("label", { htmlFor: `${r}-SELECT_ALL`, className: d("CheckboxOption"), children: [
            /* @__PURE__ */ c(
              T,
              {
                id: "select_all",
                disabled: s,
                value: a.every((i) => t == null ? void 0 : t.includes(i.value)),
                onChange: C,
                indeterminate: !v && (t ? t.length > 0 : !1)
              }
            ),
            /* @__PURE__ */ c("span", { children: "Select all" })
          ] })
        ]
      }
    );
  }
);
ye.displayName = "CheckboxGroup";
const q = w.forwardRef(
  ({ onChange: r, disabled: t, className: n, value: a, checked: s, indeterminate: e, ...o }, l) => /* @__PURE__ */ c(
    "input",
    {
      ref: l,
      type: "radio",
      disabled: t,
      value: a,
      checked: s,
      onChange: (m) => {
        r(m.target.value, m);
      },
      className: d("Radio", n, {
        Radio_indeterminate: e
      }),
      ...o
    }
  )
);
q.displayName = "Radio";
const xe = w.forwardRef(
  ({ name: r, value: t, onChange: n, options: a, disabled: s, readOnly: e, className: o, direction: l = "column" }, f) => {
    const m = (h) => `${r}-${h.value}`, u = (h, v) => {
      n(h.value, v);
    };
    return /* @__PURE__ */ c(
      "div",
      {
        className: d("RadioGroup", o, {
          [`RadioGroup_${l}`]: !0,
          RadioGroup_disabled: s
        }),
        ref: f,
        children: a.map((h) => /* @__PURE__ */ _(
          "label",
          {
            htmlFor: m(h),
            className: d("RadioOption", {
              RadioOption_readOnly: e || h.readOnly,
              RadioOption_disabled: s || h.disabled
            }),
            children: [
              /* @__PURE__ */ c(
                q,
                {
                  id: m(h),
                  disabled: s || h.disabled,
                  readOnly: e || h.readOnly,
                  value: h.value,
                  checked: t === h.value,
                  onChange: (v, C) => u(h, C)
                }
              ),
              /* @__PURE__ */ c("span", { title: h.label, children: h.label })
            ]
          },
          m(h)
        ))
      }
    );
  }
);
xe.displayName = "RadioGroup";
const Ae = ({
  className: r,
  disabled: t,
  options: n,
  value: a,
  placeholder: s,
  searchPlaceholder: e,
  onChange: o,
  onFocus: l = () => {
  },
  onBlur: f = () => {
  }
}) => {
  const [m, u] = R.useState(!1), [h, v] = R.useState(""), C = R.useRef(null), i = (g) => {
    o(g.value), u(!1);
  }, p = (g) => {
    u(!0), l(g);
  }, N = (g) => {
    u(!1), f(g);
  }, k = (g) => {
    v(g);
  };
  R.useEffect(() => {
    v("");
  }, [m]);
  const y = n.filter((g) => g.label.toLowerCase().includes(h.toLowerCase()) || g.value.toLowerCase().includes(h.toLowerCase())), L = m && e ? e : s, I = n.find((g) => g.value === a), b = m ? h : a && I ? I.label : "";
  return /* @__PURE__ */ c(
    U,
    {
      closeOnClickOutside: !0,
      content: /* @__PURE__ */ c(
        V,
        {
          items: y.map((g) => ({
            id: g.value,
            label: g.label,
            disabled: g.disabled,
            onMouseDown: () => i(g)
          }))
        }
      ),
      target: ({ open: g, close: M, visible: E, ref: O, className: A }) => /* @__PURE__ */ _(
        "div",
        {
          ref: O,
          className: d(r, A, "Select", {
            Select_disabled: t,
            Select_focus: m,
            Select_visible: E
          }),
          children: [
            /* @__PURE__ */ c(
              P,
              {
                ref: C,
                className: d("SelectValue"),
                disabled: t,
                onFocus: (S) => {
                  g(), p(S);
                },
                onBlur: (S) => {
                  M(), N(S);
                },
                placeholder: L,
                value: b,
                onChange: k
              }
            ),
            /* @__PURE__ */ _("div", { className: d("SelectActions"), children: [
              /* @__PURE__ */ c(
                $,
                {
                  onClick: () => o(void 0),
                  className: d("SelectAction", "SelectActionClear"),
                  variant: "clear",
                  children: "✕"
                }
              ),
              /* @__PURE__ */ c(
                $,
                {
                  onClick: () => {
                    E ? M() : g();
                  },
                  className: d("SelectAction", "SelectActionOpen"),
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
}, Ne = ({
  disabled: r,
  className: t,
  value: n = 50,
  onChange: a,
  min: s = 0,
  max: e = 100
}) => {
  const [o, l] = w.useState(!1), [f, m] = w.useState(!1), u = w.useRef(null), h = () => l(!0), v = () => l(!1), C = (I) => {
    I.preventDefault(), m(!0);
  }, i = w.useCallback(
    (I) => {
      f && (I.preventDefault(), m(!1));
    },
    [f]
  ), p = w.useCallback(
    (I) => {
      if (f && u.current) {
        const { clientX: b } = I, { left: g, width: M } = u.current.getBoundingClientRect(), E = (b - g) / M, O = Math.round(E * (e - s)) + s;
        a(Math.min(e, Math.max(s, O)));
      }
    },
    [f, s, e, a]
  ), N = (I) => {
    if (!u.current) return;
    const { clientX: b } = I, { left: g, width: M } = u.current.getBoundingClientRect(), E = (b - g) / M, O = Math.round(E * (e - s)) + s;
    a(Math.min(e, Math.max(s, O)));
  }, k = (I) => {
    I.key === "ArrowLeft" ? a(Math.max(s, n - 1)) : I.key === "ArrowRight" && a(Math.min(e, n + 1));
  };
  w.useEffect(() => (window.addEventListener("mousemove", p), window.addEventListener("mouseup", i), () => {
    window.removeEventListener("mousemove", p), window.removeEventListener("mouseup", i);
  }), [p, i]);
  const y = (n - s) / (e - s) * 100, L = w.useMemo(() => ({
    backgroundImage: `
      linear-gradient(to right, ${n === s ? "transparent" : "var(--slider-rail-fill-color)"},
      ${Array.from(new Array(e - s - 1)).map(
      (I, b) => `${b + 1 <= n - s ? "var(--slider-rail-fill-color)" : "transparent"} calc(${100 / (e - s) * (b + 1)}% - 2px), black calc(${100 / (e - s) * (b + 1)}% - 2px), black calc(${100 / (e - s) * (b + 1)}% + 2px), ${b + 2 <= n - s ? "var(--slider-rail-fill-color)" : "transparent"} calc(${100 / (e - s) * (b + 1)}% + 2px)`
    ).join(", ")}, ${n === e ? "var(--slider-rail-fill-color)" : "transparent"})
    `
  }), [n, s, e]);
  return /* @__PURE__ */ c(
    "div",
    {
      className: d("Slider", t, {
        Slider_disabled: r,
        Slider_dragging: f,
        Slider_focus: o
      }),
      onClick: N,
      onMouseDown: C,
      children: /* @__PURE__ */ c(
        "div",
        {
          ref: u,
          className: d("SliderRail", t, { Slider_disabled: r }),
          style: L,
          children: /* @__PURE__ */ c(
            $,
            {
              variant: "secondary",
              disabled: r,
              style: { left: `calc(${y}% )` },
              onKeyDown: k,
              onFocus: h,
              onBlur: v,
              children: /* @__PURE__ */ c("span", { className: d("SliderTooltip"), style: { left: "50%" }, children: /* @__PURE__ */ c("span", { className: d("SliderTooltipWrapper"), children: n }) })
            }
          )
        }
      )
    }
  );
};
Ne.displayName = "Slider";
const ke = w.forwardRef(
  ({ onChange: r, disabled: t, className: n, value: a, indeterminate: s, label: e, onClick: o, ...l }, f) => /* @__PURE__ */ c(
    "input",
    {
      ref: f,
      type: "checkbox",
      disabled: t,
      checked: a,
      onChange: (u) => {
        r(u.target.checked, u);
      },
      className: d("Switch", n, {
        Switch_indeterminate: s
      }),
      ...l
    }
  )
);
ke.displayName = "Switch";
const Le = R.forwardRef(
  ({ content: r, children: t, placement: n = "bottom", trigger: a = "hover" }, s) => {
    var L, I;
    const [e, o] = R.useState(!1), [l, f] = R.useState(null), { refs: m, floatingStyles: u, elements: h, update: v, middlewareData: C } = j({
      placement: n,
      open: e,
      middleware: [ee(0), te({ element: l, padding: 0 })],
      whileElementsMounted: z
    });
    Q(s, () => ({ update: v, middlewareData: C, elements: h, floatingStyles: u, placement: n }));
    const i = () => {
      a === "hover" && o(!0);
    }, p = () => {
      a === "hover" && o(!1);
    }, N = () => {
      a === "click" && o(!e);
    };
    Z(() => {
      if (e && a === "click") {
        const b = h.reference, g = h.floating, M = (E) => {
          !(b != null && b.contains(E.target)) && !(g != null && g.contains(E.target)) && o(!1);
        };
        return document.addEventListener("touchstart", M), document.addEventListener("mousedown", M), () => {
          document.removeEventListener("touchstart", M), document.removeEventListener("mousedown", M);
        };
      }
    }, [e, a, h.reference, h.floating]);
    const k = ((L = C.arrow) == null ? void 0 : L.x) ?? 0, y = ((I = C.arrow) == null ? void 0 : I.y) ?? 0;
    return /* @__PURE__ */ _(X, { children: [
      /* @__PURE__ */ c(
        "span",
        {
          ref: m.setReference,
          onMouseEnter: i,
          onMouseLeave: p,
          onMouseDown: N,
          className: d("TooltipTarget", { visible: e }),
          children: t
        }
      ),
      e && W.createPortal(
        /* @__PURE__ */ _(
          "div",
          {
            ref: m.setFloating,
            style: u,
            className: d("Tooltip", {
              Tooltip_visible: e,
              [`Tooltip_${n}`]: !0
            }),
            onMouseEnter: i,
            onMouseLeave: p,
            children: [
              /* @__PURE__ */ c(
                "span",
                {
                  ref: f,
                  style: { left: k, top: y },
                  className: d("TooltipArrow")
                }
              ),
              /* @__PURE__ */ c("div", { className: d("TooltipWrapper"), children: r })
            ]
          }
        ),
        document.body
      )
    ] });
  }
);
Le.displayName = "Tooltip";
const Ge = ({ className: r, children: t }) => /* @__PURE__ */ c("span", { className: d("Tag", r), children: t });
export {
  $ as Button,
  he as ButtonGroup,
  T as Checkbox,
  ye as CheckboxGroup,
  U as Dropdown,
  Y as DropdownMenu,
  Te as FlexBox,
  P as Input,
  Ie as List,
  V as Menu,
  pe as MenuIcon,
  me as MenuItem,
  q as Radio,
  xe as RadioGroup,
  Ae as Select,
  Ne as Slider,
  ke as Switch,
  Ge as Tag,
  Le as Tooltip
};
//# sourceMappingURL=index.js.map
