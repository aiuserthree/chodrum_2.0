/* 드럼악보 스토어 — 페이지 간 상태 공유 (localStorage) */
(function () {
  var P = 'dss_';
  function get(k, d) {
    try { var v = localStorage.getItem(P + k); return v === null ? d : JSON.parse(v); }
    catch (e) { return d; }
  }
  function set(k, v) {
    try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {}
    window.dispatchEvent(new Event('store:change'));
  }

  window.Store = {
    get: get, set: set,
    cart: {
      list: function () { return get('cart', []); },
      count: function () { return this.list().reduce(function (n, c) { return n + c.qty; }, 0); },
      /* 동일 악보는 1건만 — 이미 있으면 qty 증가 없이 false 반환 */
      add: function (id, qty) {
        qty = qty || 1;
        var key = id == null ? '' : String(id);
        var c = this.list();
        if (c.some(function (x) { return String(x.id) === key; })) return false;
        c.push({ id: key, qty: Math.min(10, qty) });
        set('cart', c);
        return true;
      },
      setQty: function (id, q) {
        var key = id == null ? '' : String(id);
        set('cart', this.list().map(function (x) { return String(x.id) === key ? { id: x.id, qty: q } : x; }));
      },
      remove: function (ids) {
        ids = [].concat(ids).map(function (x) { return String(x); });
        set('cart', this.list().filter(function (x) { return ids.indexOf(String(x.id)) === -1; }));
      },
      clear: function () { set('cart', []); },
    },
    fav: {
      list: function () { return get('fav', []); },
      has: function (id) { return this.list().indexOf(id) !== -1; },
      toggle: function (id) {
        var f = this.list(); var had = f.indexOf(id) !== -1;
        set('fav', had ? f.filter(function (x) { return x !== id; }) : f.concat(id));
        return !had;
      },
      clear: function () { set('fav', []); },
    },
    user: {
      get: function () { return get('user', null); },
      set: function (u) { set('user', u); },
      clear: function () { set('user', null); },
    },
    purchases: {
      list: function () { return get('purchases', []); },
      add: function (items) { set('purchases', this.list().concat(items)); },
    },
    guestOrders: {
      map: function () { return get('guestOrders', {}); },
      forEmail: function (email) { return this.map()[(email || '').toLowerCase()] || []; },
      add: function (email, order) {
        var m = this.map(); var k = (email || '').toLowerCase();
        m[k] = (m[k] || []).concat([order]); set('guestOrders', m);
      },
    },
    lastOrder: {
      get: function () { return get('lastOrder', null); },
      set: function (o) { set('lastOrder', o); },
    },
  };

  window.orderNo = function () {
    var d = new Date();
    var ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    return 'ORD-' + ymd + '-' + String(Math.floor(1000 + Math.random() * 8999));
  };
})();
