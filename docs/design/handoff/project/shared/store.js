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
      add: function (id, qty) {
        qty = qty || 1;
        var c = this.list(); var f = c.find(function (x) { return x.id === id; });
        if (f) f.qty = Math.min(10, f.qty + qty); else c.push({ id: id, qty: qty });
        set('cart', c);
      },
      setQty: function (id, q) { set('cart', this.list().map(function (x) { return x.id === id ? { id: x.id, qty: q } : x; })); },
      remove: function (ids) { ids = [].concat(ids); set('cart', this.list().filter(function (x) { return ids.indexOf(x.id) === -1; })); },
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

  /* 최초 방문 시 데모 데이터 시드 (장바구니/찜) */
  if (!get('seeded', false)) {
    set('cart', [{ id: 's1', qty: 1 }, { id: 's9', qty: 2 }]);
    set('fav', ['s3', 's5', 's10']);
    set('seeded', true);
  }

  window.orderNo = function () {
    var d = new Date();
    var ymd = d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    return 'ORD-' + ymd + '-' + String(Math.floor(1000 + Math.random() * 8999));
  };
})();
