/* @ds-bundle: {"format":4,"namespace":"DrumSheetStoreDesignSystem_3a2462","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"IconButton","sourcePath":"components/actions/IconButton.jsx"},{"name":"Badge","sourcePath":"components/display/Badge.jsx"},{"name":"Card","sourcePath":"components/display/Card.jsx"},{"name":"Chip","sourcePath":"components/display/Chip.jsx"},{"name":"Divider","sourcePath":"components/display/Divider.jsx"},{"name":"Icon","sourcePath":"components/display/Icon.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"QuantityStepper","sourcePath":"components/forms/QuantityStepper.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"SocialButton","sourcePath":"components/forms/SocialButton.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"d0077e6446bd","components/actions/IconButton.jsx":"f068d79deb9b","components/display/Badge.jsx":"a7a09f4ae6bc","components/display/Card.jsx":"2c1a1b075186","components/display/Chip.jsx":"c1f61ffa04f1","components/display/Divider.jsx":"2039743b3200","components/display/Icon.jsx":"7293cfe5bcd2","components/forms/Checkbox.jsx":"ebaae360a542","components/forms/Input.jsx":"8ac9cfac64e2","components/forms/QuantityStepper.jsx":"272654892b51","components/forms/Select.jsx":"4ac670612b9d","components/forms/SocialButton.jsx":"3453c47b548e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.DrumSheetStoreDesignSystem_3a2462 = window.DrumSheetStoreDesignSystem_3a2462 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/display/Card.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Card — the primary content container (sheet-music cards, order summaries,
 * panels). White surface, 12px radius, hairline shadow. Set `interactive` for
 * a subtle hover lift on clickable cards.
 */
function Card({
  children,
  padding = 16,
  elevation = 'card',
  interactive = false,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  let shadow = 'var(--shadow-subtle)';
  if (elevation === 'none') shadow = 'none';else if (elevation === 'outline') shadow = 'var(--shadow-subtle-2)';else if (interactive && hover) shadow = 'var(--shadow-subtle-3)';
  return /*#__PURE__*/React.createElement("div", _extends({
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      background: 'var(--surface-card)',
      borderRadius: 'var(--radius-cards)',
      boxShadow: shadow,
      padding,
      transition: 'box-shadow 140ms ease, transform 140ms ease',
      transform: interactive && hover ? 'translateY(-1px)' : 'none',
      cursor: onClick ? 'pointer' : 'default',
      ...style
    }
  }, rest), children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Card.jsx", error: String((e && e.message) || e) }); }

// components/display/Divider.jsx
try { (() => {
/**
 * Divider — a 1px Line separator. Horizontal or vertical; horizontal supports a
 * centred label ("또는" between login options).
 */
function Divider({
  label,
  spacing = 16,
  orientation = 'horizontal',
  style
}) {
  if (orientation === 'vertical') {
    return /*#__PURE__*/React.createElement("span", {
      style: {
        display: 'inline-block',
        width: 1,
        alignSelf: 'stretch',
        background: 'var(--border-default)',
        margin: `0 ${spacing}px`,
        ...style
      }
    });
  }
  if (label) {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: `${spacing}px 0`,
        ...style
      }
    }, /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--border-default)'
      }
    }), /*#__PURE__*/React.createElement("span", {
      style: {
        fontSize: 12,
        color: 'var(--text-secondary)'
      }
    }, label), /*#__PURE__*/React.createElement("span", {
      style: {
        flex: 1,
        height: 1,
        background: 'var(--border-default)'
      }
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      height: 1,
      background: 'var(--border-default)',
      margin: `${spacing}px 0`,
      ...style
    }
  });
}
Object.assign(__ds_scope, { Divider });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Divider.jsx", error: String((e && e.message) || e) }); }

// components/display/Icon.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Icon — thin-stroke glyphs from the Lucide set, fetched once from CDN and
 * inlined as real <svg> (so they inherit `currentColor`, size freely, and
 * render in screenshots / PPTX / PDF exports as well as live browsers).
 * Use Lucide names (e.g. "heart", "shopping-cart").
 */
const _iconCache = {};
const _iconPending = {};
function _loadIcon(name) {
  if (name in _iconCache) return Promise.resolve(_iconCache[name]);
  if (_iconPending[name]) return _iconPending[name];
  const url = 'https://cdn.jsdelivr.net/npm/lucide-static/icons/' + name + '.svg';
  _iconPending[name] = fetch(url).then(r => r.ok ? r.text() : '').then(txt => {
    _iconCache[name] = txt || '';
    return _iconCache[name];
  }).catch(() => {
    _iconCache[name] = '';
    return '';
  });
  return _iconPending[name];
}
function Icon({
  name = 'circle',
  size = 18,
  label,
  style,
  ...rest
}) {
  const [svg, setSvg] = React.useState(name in _iconCache ? _iconCache[name] : '');
  React.useEffect(() => {
    let alive = true;
    if (name in _iconCache) {
      setSvg(_iconCache[name]);
      return;
    }
    _loadIcon(name).then(s => {
      if (alive) setSvg(s);
    });
    return () => {
      alive = false;
    };
  }, [name]);
  const markup = svg ? svg.replace(/<svg([^>]*)>/, (_m, attrs) => {
    const cleaned = attrs.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '');
    return '<svg' + cleaned + ' width="100%" height="100%">';
  }) : '';
  return /*#__PURE__*/React.createElement("span", _extends({
    role: "img",
    "aria-label": label || name,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flex: 'none',
      lineHeight: 0,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: markup
    }
  }, rest));
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    padding: '6px 10px',
    fontSize: 13,
    icon: 15,
    gap: 6
  },
  md: {
    padding: '8px 12px',
    fontSize: 14,
    icon: 16,
    gap: 6
  },
  lg: {
    padding: '11px 16px',
    fontSize: 16,
    icon: 18,
    gap: 8
  }
};

/**
 * Button — the brand's action control. Solid Ink for primary, bordered white
 * for secondary, text-only for ghost. 8px radius, weight 500, never a shadow.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  iconLeft,
  iconRight,
  type = 'button',
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const base = {
    display: fullWidth ? 'flex' : 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: s.gap,
    fontFamily: 'var(--font-sans)',
    fontSize: s.fontSize,
    fontWeight: 500,
    lineHeight: 1,
    letterSpacing: '-0.1px',
    padding: s.padding,
    borderRadius: 'var(--radius-buttons)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    whiteSpace: 'nowrap',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease, transform 80ms ease',
    transform: active && !disabled ? 'scale(0.985)' : 'none',
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none'
  };
  let look;
  if (disabled) {
    look = {
      background: 'var(--action-disabled-bg)',
      color: 'var(--action-disabled-text)'
    };
  } else if (variant === 'secondary') {
    look = {
      background: 'var(--action-secondary-bg)',
      color: 'var(--action-secondary-text)',
      borderColor: hover ? 'var(--border-strong)' : 'var(--border-default)'
    };
  } else if (variant === 'ghost') {
    look = {
      background: hover ? 'rgba(0,0,0,0.04)' : 'transparent',
      color: hover ? 'var(--action-ghost-hover)' : 'var(--action-ghost-text)'
    };
  } else {
    look = {
      background: hover ? 'var(--action-primary-hover)' : 'var(--action-primary)',
      color: 'var(--action-primary-text)'
    };
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      ...base,
      ...look,
      ...style
    }
  }, rest), iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: s.icon
  }) : null, children, iconRight ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconRight,
    size: s.icon
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/actions/IconButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    box: 32,
    icon: 16
  },
  md: {
    box: 38,
    icon: 18
  },
  lg: {
    box: 46,
    icon: 20
  }
};

/**
 * IconButton — a square, label-less action (favourite, close, menu, quantity).
 * Same hierarchy language as Button: solid / bordered / ghost.
 */
function IconButton({
  name = 'circle',
  variant = 'ghost',
  size = 'md',
  disabled = false,
  round = false,
  label,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [active, setActive] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const base = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: s.box,
    height: s.box,
    padding: 0,
    borderRadius: round ? 'var(--radius-pill)' : 'var(--radius-buttons)',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease, transform 80ms ease',
    transform: active && !disabled ? 'scale(0.94)' : 'none',
    WebkitTapHighlightColor: 'transparent'
  };
  let look;
  if (disabled) {
    look = {
      background: 'var(--action-disabled-bg)',
      color: 'var(--action-disabled-text)'
    };
  } else if (variant === 'primary') {
    look = {
      background: hover ? 'var(--action-primary-hover)' : 'var(--action-primary)',
      color: 'var(--action-primary-text)'
    };
  } else if (variant === 'secondary') {
    look = {
      background: 'var(--surface-card)',
      color: 'var(--color-ink)',
      borderColor: hover ? 'var(--border-strong)' : 'var(--border-default)'
    };
  } else {
    look = {
      background: hover ? 'rgba(0,0,0,0.04)' : 'transparent',
      color: hover ? 'var(--color-ink)' : 'var(--color-icon)'
    };
  }
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    "aria-label": label || name,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setActive(false);
    },
    onMouseDown: () => setActive(true),
    onMouseUp: () => setActive(false),
    style: {
      ...base,
      ...look,
      ...style
    }
  }, rest), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: name,
    size: s.icon
  }));
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/display/Badge.jsx
try { (() => {
const TONES = {
  neutral: {
    bg: '#f1f1f1',
    color: 'var(--text-secondary)',
    border: 'transparent'
  },
  solid: {
    bg: 'var(--color-ink)',
    color: 'var(--color-paper-white)',
    border: 'transparent'
  },
  outline: {
    bg: 'transparent',
    color: 'var(--text-primary)',
    border: 'var(--border-strong)'
  },
  success: {
    bg: 'var(--status-success-bg)',
    color: 'var(--status-success)',
    border: 'transparent'
  },
  warning: {
    bg: 'var(--status-warning-bg)',
    color: 'var(--status-warning)',
    border: 'transparent'
  },
  danger: {
    bg: 'var(--status-danger-bg)',
    color: 'var(--status-danger)',
    border: 'transparent'
  }
};

/**
 * Badge — a small non-interactive label. `solid` for 인기 / NEW, `outline` for
 * difficulty/genre, and the status tones for order & download state.
 */
function Badge({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  style
}) {
  const s = size === 'sm' ? {
    fs: 11,
    pad: '2px 6px'
  } : {
    fs: 12,
    pad: '3px 8px'
  };
  const t = TONES[variant] || TONES.neutral;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      fontFamily: 'var(--font-sans)',
      fontSize: s.fs,
      fontWeight: 500,
      lineHeight: 1.3,
      padding: s.pad,
      borderRadius: 'var(--radius-chips)',
      background: t.bg,
      color: t.color,
      border: `1px solid ${t.border}`,
      whiteSpace: 'nowrap',
      ...style
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.fs + 1
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Badge.jsx", error: String((e && e.message) || e) }); }

// components/display/Chip.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Chip — a pill-shaped filter / category toggle (카테고리, 장르, 난이도) and
 * suggestion chip. Solid Ink when selected, bordered white when not.
 */
function Chip({
  children,
  selected = false,
  icon,
  count,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const borderColor = selected ? 'var(--color-ink)' : hover ? 'var(--border-strong)' : 'var(--border-faint)';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      height: 34,
      padding: '0 14px',
      borderRadius: 'var(--radius-pill)',
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      fontWeight: 500,
      lineHeight: 1,
      background: selected ? 'var(--color-ink)' : 'var(--surface-card)',
      color: selected ? 'var(--color-paper-white)' : 'var(--text-primary)',
      border: `1px solid ${borderColor}`,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      transition: 'background 120ms ease, color 120ms ease, border-color 120ms ease',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, rest), icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 14
  }) : null, children, count != null ? /*#__PURE__*/React.createElement("span", {
    style: {
      opacity: 0.55,
      fontVariantNumeric: 'tabular-nums'
    }
  }, count) : null);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/display/Chip.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * Checkbox — square control for cart selection and terms agreement. Solid Ink
 * when checked, 1px Line when empty. Supports an indeterminate ("select all")
 * state.
 */
function Checkbox({
  checked = false,
  indeterminate = false,
  disabled = false,
  label,
  onChange,
  size = 18,
  style,
  ...rest
}) {
  const on = checked || indeterminate;
  return /*#__PURE__*/React.createElement("label", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      userSelect: 'none',
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", _extends({
    onClick: () => {
      if (!disabled && onChange) onChange(!checked);
    },
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      flex: 'none',
      borderRadius: 'var(--radius-md)',
      background: on ? 'var(--color-ink)' : 'var(--surface-card)',
      border: on ? '1px solid var(--color-ink)' : '1px solid var(--border-strong)',
      color: 'var(--color-paper-white)',
      transition: 'background 100ms ease, border-color 100ms ease'
    }
  }, rest), indeterminate ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "minus",
    size: size - 6
  }) : checked ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "check",
    size: size - 5
  }) : null), label ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 14,
      color: 'var(--text-primary)'
    }
  }, label) : null);
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: 36,
    fs: 14,
    px: 12
  },
  md: {
    h: 44,
    fs: 16,
    px: 14
  },
  lg: {
    h: 50,
    fs: 16,
    px: 16
  }
};

/**
 * Input — single-line text field. 12px radius, 1px Line border, Subtext
 * placeholder, subtle outer glow on focus. Optional label / hint / error.
 */
function Input({
  label,
  hint,
  error,
  iconLeft,
  size = 'md',
  disabled = false,
  fullWidth = true,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const uid = id || React.useId();
  const borderColor = error ? 'var(--status-danger)' : focus ? 'var(--color-ink)' : 'var(--border-default)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: fullWidth ? '100%' : 'auto',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    style: {
      fontSize: 13,
      fontWeight: 500,
      color: 'var(--text-primary)'
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      height: s.h,
      padding: `0 ${s.px}px`,
      background: disabled ? 'var(--action-disabled-bg)' : 'var(--surface-card)',
      border: `1px solid ${borderColor}`,
      borderRadius: 'var(--radius-inputs)',
      boxShadow: focus && !error ? '0 0 0 3px var(--focus-ring)' : 'none',
      transition: 'border-color 120ms ease, box-shadow 120ms ease'
    }
  }, iconLeft ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: iconLeft,
    size: 18,
    style: {
      color: 'var(--color-icon)'
    }
  }) : null, /*#__PURE__*/React.createElement("input", _extends({
    id: uid,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      flex: 1,
      minWidth: 0,
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: s.fs,
      color: 'var(--text-primary)',
      padding: 0,
      lineHeight: 1.3
    }
  }, rest))), error ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--status-danger)'
    }
  }, error) : hint ? /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: 12,
      color: 'var(--text-secondary)'
    }
  }, hint) : null);
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/QuantityStepper.jsx
try { (() => {
/**
 * QuantityStepper — minus / value / plus control for the sheet-music detail and
 * cart rows. Clamps between min and max.
 */
function QuantityStepper({
  value = 1,
  min = 1,
  max = 99,
  size = 'md',
  onChange,
  disabled = false,
  style
}) {
  const btnSize = size === 'sm' ? 'sm' : 'md';
  const w = size === 'sm' ? 40 : 48;
  const fs = size === 'sm' ? 14 : 16;
  const set = n => {
    if (!disabled && onChange) onChange(Math.max(min, Math.min(max, n)));
  };
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 4,
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-buttons)',
      padding: 4,
      background: 'var(--surface-card)',
      opacity: disabled ? 0.5 : 1,
      ...style
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    name: "minus",
    variant: "ghost",
    size: btnSize,
    label: "\uC218\uB7C9 \uAC10\uC18C",
    disabled: disabled || value <= min,
    onClick: () => set(value - 1)
  }), /*#__PURE__*/React.createElement("span", {
    className: "ds-mono",
    style: {
      width: w,
      textAlign: 'center',
      fontSize: fs,
      fontWeight: 500,
      color: 'var(--text-primary)'
    }
  }, value), /*#__PURE__*/React.createElement(__ds_scope.IconButton, {
    name: "plus",
    variant: "ghost",
    size: btnSize,
    label: "\uC218\uB7C9 \uC99D\uAC00",
    disabled: disabled || value >= max,
    onClick: () => set(value + 1)
  }));
}
Object.assign(__ds_scope, { QuantityStepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/QuantityStepper.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
const SIZES = {
  sm: {
    h: 36,
    fs: 14,
    px: 12
  },
  md: {
    h: 44,
    fs: 16,
    px: 14
  }
};

/**
 * Select — native dropdown styled to match Input (used for sort order, genre,
 * difficulty filters). Chevron affordance on the right.
 */
function Select({
  label,
  options = [],
  size = 'md',
  disabled = false,
  fullWidth = true,
  placeholder,
  id,
  style,
  ...rest
}) {
  const [focus, setFocus] = React.useState(false);
  const s = SIZES[size] || SIZES.md;
  const uid = id || React.useId();
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
      width: fullWidth ? '100%' : 'auto',
      ...style
    }
  }, label ? /*#__PURE__*/React.createElement("label", {
    htmlFor: uid,
    style: {
      fontSize: 13,
      fontWeight: 500
    }
  }, label) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      height: s.h,
      borderRadius: 'var(--radius-inputs)',
      border: `1px solid ${focus ? 'var(--color-ink)' : 'var(--border-default)'}`,
      background: disabled ? 'var(--action-disabled-bg)' : 'var(--surface-card)',
      boxShadow: focus ? '0 0 0 3px var(--focus-ring)' : 'none',
      transition: 'border-color 120ms ease, box-shadow 120ms ease'
    }
  }, /*#__PURE__*/React.createElement("select", _extends({
    id: uid,
    disabled: disabled,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      appearance: 'none',
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      flex: 1,
      height: '100%',
      border: 'none',
      outline: 'none',
      background: 'transparent',
      fontFamily: 'var(--font-sans)',
      fontSize: s.fs,
      color: 'var(--text-primary)',
      padding: `0 ${s.px + 22}px 0 ${s.px}px`,
      cursor: disabled ? 'not-allowed' : 'pointer'
    }
  }, rest), placeholder ? /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder) : null, options.map(o => {
    const value = typeof o === 'string' ? o : o.value;
    const labelText = typeof o === 'string' ? o : o.label;
    return /*#__PURE__*/React.createElement("option", {
      key: value,
      value: value
    }, labelText);
  })), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-down",
    size: 16,
    style: {
      position: 'absolute',
      right: s.px,
      color: 'var(--color-icon)',
      pointerEvents: 'none'
    }
  })));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/forms/SocialButton.jsx
try { (() => {
function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
/**
 * SocialButton — account entry via Kakao / Naver / Google, or email. Uses each
 * provider's mandated brand colour (the one place colour enters the chrome).
 * Kakao & Naver glyphs load from the Simple Icons CDN (inlined as SVG); supply
 * Google's official mark via `iconUrl` for production.
 */
const PROVIDERS = {
  kakao: {
    bg: '#FEE500',
    fg: '#191919',
    border: false,
    si: 'kakaotalk',
    label: '카카오로 계속하기'
  },
  naver: {
    bg: '#03C75A',
    fg: '#FFFFFF',
    border: false,
    si: 'naver',
    label: '네이버로 계속하기'
  },
  google: {
    bg: '#FFFFFF',
    fg: '#171717',
    border: true,
    si: null,
    label: 'Google로 계속하기'
  },
  email: {
    bg: '#171717',
    fg: '#FFFFFF',
    border: false,
    lucide: 'mail',
    label: '이메일로 계속하기'
  }
};
function SocialButton({
  provider = 'kakao',
  children,
  iconUrl,
  onClick,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const [svg, setSvg] = React.useState('');
  const p = PROVIDERS[provider] || PROVIDERS.kakao;
  const src = iconUrl || (p.si ? 'https://cdn.jsdelivr.net/npm/simple-icons@13/icons/' + p.si + '.svg' : null);
  React.useEffect(() => {
    if (!src) {
      setSvg('');
      return;
    }
    let alive = true;
    fetch(src).then(r => r.ok ? r.text() : '').then(t => {
      if (alive) setSvg(t);
    }).catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);
  const glyph = svg ? svg.replace(/<svg([^>]*)>/, (_m, a) => '<svg' + a.replace(/\swidth="[^"]*"/, '').replace(/\sheight="[^"]*"/, '') + ' width="18" height="18" fill="currentColor">') : '';
  return /*#__PURE__*/React.createElement("button", _extends({
    type: "button",
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      width: '100%',
      height: 48,
      padding: '0 44px',
      background: p.bg,
      color: p.fg,
      border: p.border ? '1px solid var(--border-default)' : '1px solid transparent',
      borderRadius: 'var(--radius-buttons)',
      cursor: 'pointer',
      fontFamily: 'var(--font-sans)',
      fontSize: 15,
      fontWeight: 500,
      letterSpacing: '-0.2px',
      filter: hover ? 'brightness(0.96)' : 'none',
      transition: 'filter 120ms ease',
      WebkitTapHighlightColor: 'transparent',
      ...style
    }
  }, rest), p.lucide ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      left: 16,
      display: 'inline-flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: p.lucide,
    size: 18
  })) : glyph ? /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      position: 'absolute',
      left: 16,
      width: 18,
      height: 18,
      display: 'inline-flex',
      color: p.fg
    },
    dangerouslySetInnerHTML: {
      __html: glyph
    }
  }) : null, children || p.label);
}
Object.assign(__ds_scope, { SocialButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/SocialButton.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.Divider = __ds_scope.Divider;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.QuantityStepper = __ds_scope.QuantityStepper;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.SocialButton = __ds_scope.SocialButton;

})();
