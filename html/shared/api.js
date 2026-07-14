/* CHODRUM — FO ↔ BO data bridge via Supabase (fallback: local data.js) */
(function () {
  var sb = function () { return window.ChodrumSB && window.ChodrumSB.client; };
  var live = function () { return !!(window.ChodrumSB && window.ChodrumSB.configured && sb()); };

  function mapSheet(row) {
    return {
      id: row.id,
      code: row.code || '',
      title: row.title,
      artist: row.artist,
      genre: row.genre,
      level: row.level,
      pages: row.pages || 0,
      price: row.price || 0,
      orig: row.orig == null ? undefined : row.orig,
      popular: !!row.popular,
      isNew: !!row.is_new,
      rating: Number(row.rating) || 0,
      sold: row.sold || 0,
      status: row.status || '판매중',
    };
  }

  function sheetToRow(s) {
    return {
      id: s.id,
      code: s.code || null,
      title: s.title,
      artist: s.artist,
      genre: s.genre,
      level: s.level,
      pages: Number(s.pages) || 0,
      price: Number(s.price) || 0,
      orig: s.orig == null || s.orig === '' ? null : Number(s.orig),
      popular: !!s.popular,
      is_new: !!s.isNew,
      rating: Number(s.rating) || 0,
      sold: Number(s.sold) || 0,
      status: s.status || '판매중',
    };
  }

  function ddayFromExpires(expiresAt, status) {
    if (status === 'REVOKED') return null;
    if (!expiresAt) return status === 'EXPIRED' ? -1 : 7;
    var ms = new Date(expiresAt).getTime() - Date.now();
    return Math.ceil(ms / 86400000);
  }

  function fmtJoined(d) {
    if (!d) return '';
    var x = String(d).slice(0, 10).split('-');
    return x.length === 3 ? x[0] + '.' + x[1] + '.' + x[2] : d;
  }

  function fmtOrderDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    var mm = String(d.getMonth() + 1).padStart(2, '0');
    var dd = String(d.getDate()).padStart(2, '0');
    var hh = String(d.getHours()).padStart(2, '0');
    var mi = String(d.getMinutes()).padStart(2, '0');
    return mm + '.' + dd + ' ' + hh + ':' + mi;
  }

  function hydrateLocalFallback() {
    var D = window.DrumData;
    var A = window.AdminData;
    if (D && D.sheets) {
      D.sheets.forEach(function (s) {
        if (!s.status) s.status = (A && A.sheetStatus && A.sheetStatus[s.id]) || '판매중';
      });
      D.byId = function (id) { return D.sheets.find(function (s) { return s.id === id; }); };
      D.visibleSheets = function () {
        return D.sheets.filter(function (s) { return s.status === '판매중'; });
      };
    }
    return { mode: 'demo', error: null };
  }

  async function hydrateFromSupabase() {
    var client = sb();
    var D = window.DrumData;
    var A = window.AdminData;

    var sheetsRes = await client.from('sheets').select('*').order('sold', { ascending: false });
    if (sheetsRes.error) throw sheetsRes.error;

    var sheets = (sheetsRes.data || []).map(mapSheet);
    D.sheets = sheets;
    D.byId = function (id) { return D.sheets.find(function (s) { return s.id === id; }); };
    D.visibleSheets = function () {
      return D.sheets.filter(function (s) { return s.status === '판매중'; });
    };

    A.sheetStatus = {};
    sheets.forEach(function (s) {
      if (s.status && s.status !== '판매중') A.sheetStatus[s.id] = s.status;
    });

    var featRes = await client.from('featured_sheets').select('sheet_id, sort_order').order('sort_order');
    if (!featRes.error) {
      D.recommended = (featRes.data || []).map(function (r) { return r.sheet_id; });
    }

    var promoRes = await client.from('home_promo').select('*').eq('id', 1).maybeSingle();
    if (!promoRes.error && promoRes.data) {
      D.banner = {
        sheetId: promoRes.data.sheet_id,
        label: promoRes.data.label,
        title: promoRes.data.title,
        copy: promoRes.data.copy,
      };
    }

    var banRes = await client.from('banners').select('*').order('sort_order');
    if (!banRes.error) {
      A.banners = (banRes.data || []).map(function (b) {
        return {
          id: b.id,
          title: b.title,
          link: b.link || '',
          period: b.period || '상시',
          img: b.image_name || '',
          on: !!b.is_on,
        };
      });
    }

    var setRes = await client.from('site_settings').select('key, value');
    if (!setRes.error && setRes.data) {
      setRes.data.forEach(function (row) {
        if (row.key === 'genres' && Array.isArray(row.value)) D.genres = row.value;
        if (row.key === 'levels' && Array.isArray(row.value)) D.levels = row.value;
      });
    }

    var ordRes = await client
      .from('orders')
      .select('*, order_items(sheet_id, qty, price)')
      .order('created_at', { ascending: false });
    if (!ordRes.error) {
      A.orders = (ordRes.data || []).map(function (o) {
        return {
          no: o.order_no,
          buyer: o.buyer_name,
          email: o.email,
          member: !!o.is_member,
          items: (o.order_items || []).map(function (it) {
            return { id: it.sheet_id, qty: it.qty, price: it.price };
          }),
          method: o.method,
          status: o.status,
          date: fmtOrderDate(o.created_at),
          total: o.total,
          _id: o.id,
        };
      });
    }

    var memRes = await client.from('members').select('*').order('joined_at', { ascending: false });
    if (!memRes.error) {
      A.members = (memRes.data || []).map(function (m) {
        return {
          name: m.name,
          email: m.email,
          type: m.auth_type,
          joined: fmtJoined(m.joined_at),
          orders: m.orders_count || 0,
          status: m.status,
        };
      });
    }

    var dlRes = await client.from('downloads').select('*').order('created_at', { ascending: false });
    if (!dlRes.error) {
      A.downloads = (dlRes.data || []).map(function (d) {
        return {
          at: fmtOrderDate(d.created_at),
          email: d.email,
          member: !!d.is_member,
          sheetId: d.sheet_id,
          orderNo: d.order_no,
          status: d.status,
          dday: ddayFromExpires(d.expires_at, d.status),
          _id: d.id,
        };
      });
    }

    return { mode: 'live', error: null };
  }

  async function hydrate() {
    if (!live()) return hydrateLocalFallback();
    try {
      return await hydrateFromSupabase();
    } catch (e) {
      console.warn('[CHODRUM] Supabase hydrate 실패 → 로컬 데모 데이터 사용', e);
      var fb = hydrateLocalFallback();
      fb.error = e;
      fb.mode = 'demo';
      return fb;
    }
  }

  /* -------- sheets CRUD -------- */
  async function listSheets() {
    if (!live()) return (window.DrumData.sheets || []).slice();
    var res = await sb().from('sheets').select('*').order('sold', { ascending: false });
    if (res.error) throw res.error;
    return (res.data || []).map(mapSheet);
  }

  async function upsertSheet(sheet) {
    var row = sheetToRow(sheet);
    if (!row.id) row.id = 's' + Date.now();
    if (!row.code) row.code = 'DS-' + String(1000 + Math.floor(Math.random() * 9000));
    if (!live()) {
      var D = window.DrumData;
      var i = D.sheets.findIndex(function (s) { return s.id === row.id; });
      var mapped = mapSheet(row);
      if (i >= 0) D.sheets[i] = Object.assign({}, D.sheets[i], mapped);
      else D.sheets.unshift(mapped);
      return mapped;
    }
    var res = await sb().from('sheets').upsert(row).select().single();
    if (res.error) throw res.error;
    var mapped = mapSheet(res.data);
    var D = window.DrumData;
    var i = D.sheets.findIndex(function (s) { return s.id === mapped.id; });
    if (i >= 0) D.sheets[i] = mapped; else D.sheets.unshift(mapped);
    return mapped;
  }

  async function deleteSheets(ids) {
    ids = [].concat(ids);
    if (!live()) {
      window.DrumData.sheets = window.DrumData.sheets.filter(function (s) {
        return ids.indexOf(s.id) === -1;
      });
      return;
    }
    var res = await sb().from('sheets').delete().in('id', ids);
    if (res.error) throw res.error;
    window.DrumData.sheets = window.DrumData.sheets.filter(function (s) {
      return ids.indexOf(s.id) === -1;
    });
  }

  async function setSheetStatus(ids, status) {
    ids = [].concat(ids);
    if (!live()) {
      window.DrumData.sheets.forEach(function (s) {
        if (ids.indexOf(s.id) !== -1) s.status = status;
      });
      return;
    }
    var res = await sb().from('sheets').update({ status: status }).in('id', ids);
    if (res.error) throw res.error;
    window.DrumData.sheets.forEach(function (s) {
      if (ids.indexOf(s.id) !== -1) s.status = status;
    });
  }

  /* -------- featured / promo / banners -------- */
  async function saveFeatured(ids) {
    ids = ids || [];
    window.DrumData.recommended = ids.slice();
    if (!live()) return;
    var client = sb();
    var del = await client.from('featured_sheets').delete().gte('sort_order', -999999);
    if (del.error) throw del.error;
    if (!ids.length) return;
    var rows = ids.map(function (id, i) { return { sheet_id: id, sort_order: i }; });
    var ins = await client.from('featured_sheets').insert(rows);
    if (ins.error) throw ins.error;
  }

  async function saveHomePromo(promo) {
    window.DrumData.banner = {
      sheetId: promo.sheetId,
      label: promo.label,
      title: promo.title,
      copy: promo.copy,
    };
    if (!live()) return;
    var res = await sb().from('home_promo').upsert({
      id: 1,
      sheet_id: promo.sheetId,
      label: promo.label,
      title: promo.title,
      copy: promo.copy,
    });
    if (res.error) throw res.error;
  }

  async function saveBanners(list) {
    window.AdminData.banners = list.slice();
    if (!live()) return;
    var client = sb();
    var del = await client.from('banners').delete().gte('sort_order', -999999);
    if (del.error) throw del.error;
    if (!list.length) return;
    var rows = list.map(function (b, i) {
      return {
        id: b.id || ('b' + Date.now() + i),
        title: b.title,
        link: b.link || '',
        period: b.period || '상시',
        image_name: b.img || '',
        is_on: !!b.on,
        sort_order: i,
      };
    });
    var ins = await client.from('banners').insert(rows);
    if (ins.error) throw ins.error;
  }

  /* -------- orders -------- */
  async function createOrder(order) {
    /* order: { no, buyer, email, member, method, status, total, items:[{id,qty,price}] } */
    if (!live()) {
      window.AdminData.orders = [{
        no: order.no,
        buyer: order.buyer,
        email: order.email,
        member: !!order.member,
        items: order.items.map(function (it) { return { id: it.id, qty: it.qty, price: it.price }; }),
        method: order.method,
        status: order.status || '결제완료',
        date: fmtOrderDate(new Date().toISOString()),
        total: order.total,
      }].concat(window.AdminData.orders || []);
      return order;
    }

    var client = sb();
    var ordIns = await client.from('orders').insert({
      order_no: order.no,
      buyer_name: order.buyer,
      email: order.email,
      is_member: !!order.member,
      method: order.method,
      status: order.status || '결제완료',
      total: order.total || 0,
    }).select().single();
    if (ordIns.error) throw ordIns.error;

    var items = (order.items || []).map(function (it) {
      return {
        order_id: ordIns.data.id,
        sheet_id: it.id,
        qty: it.qty || 1,
        price: it.price || 0,
      };
    });
    if (items.length) {
      var itemIns = await client.from('order_items').insert(items);
      if (itemIns.error) throw itemIns.error;
    }

    var expires = new Date(Date.now() + 7 * 86400000).toISOString();
    var dls = (order.items || []).map(function (it) {
      return {
        email: order.email,
        is_member: !!order.member,
        sheet_id: it.id,
        order_no: order.no,
        status: 'ACTIVE',
        expires_at: expires,
      };
    });
    if (dls.length) {
      var dlIns = await client.from('downloads').insert(dls);
      if (dlIns.error) console.warn('[CHODRUM] downloads insert', dlIns.error);
    }

    return Object.assign({}, order, { _id: ordIns.data.id });
  }

  async function updateOrderStatus(orderNo, status, opts) {
    opts = opts || {};
    if (!live()) {
      (window.AdminData.orders || []).forEach(function (o) {
        if (o.no === orderNo) o.status = status;
      });
      return;
    }
    var client = sb();
    var res = await client.from('orders').update({ status: status }).eq('order_no', orderNo);
    if (res.error) throw res.error;
    if (status === '환불' && opts.revoke !== false) {
      await client.from('downloads').update({ status: 'REVOKED', expires_at: null }).eq('order_no', orderNo);
    }
  }

  async function ordersForEmail(email) {
    email = (email || '').toLowerCase();
    if (!live()) {
      return (window.Store && Store.guestOrders.forEmail(email)) || [];
    }
    var client = sb();
    var o2 = await client
      .from('orders')
      .select('order_no, created_at, order_items(sheet_id, qty)')
      .ilike('email', email)
      .order('created_at', { ascending: false });
    if (o2.error) throw o2.error;
    var dl = await client.from('downloads').select('*').ilike('email', email);
    var byOrder = {};
    (dl.data || []).forEach(function (d) {
      byOrder[d.order_no] = byOrder[d.order_no] || {};
      byOrder[d.order_no][d.sheet_id] = d;
    });
    return (o2.data || []).map(function (o) {
      return {
        orderNo: o.order_no,
        date: fmtOrderDate(o.created_at),
        items: (o.order_items || []).map(function (it) {
          var d = (byOrder[o.order_no] || {})[it.sheet_id];
          return {
            id: it.sheet_id,
            dday: d ? ddayFromExpires(d.expires_at, d.status) : 7,
          };
        }),
      };
    });
  }

  /* -------- members (simple upsert on FO signup) -------- */
  async function getMemberByEmail(email) {
    if (!live() || !email) return null;
    var res = await sb()
      .from('members')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (res.error) {
      console.warn('[CHODRUM] member getByEmail', res.error);
      return null;
    }
    return res.data || null;
  }

  function memberHasConsent(row) {
    if (!row) return false;
    /* 신규 가입: 필수 동의 시각이 있어야 완료 회원 */
    if (row.terms_agreed_at && row.privacy_agreed_at) return true;
    /*
     * migration 002 미적용: 컬럼 자체가 응답에 없음 → 기존 행은 회원으로 간주.
     * 컬럼은 있는데 null → OTP만 하고 약관 전인 고스트 행 (미완료).
     */
    if (row.terms_agreed_at === undefined && row.privacy_agreed_at === undefined) {
      return true;
    }
    return false;
  }

  async function upsertMember(profile) {
    if (!live()) return profile;
    var authType = profile.auth_type || profile.type || '이메일';
    if (authType === 'social') authType = '소셜';
    if (authType === 'email') authType = '이메일';
    var row = {
      name: profile.name,
      email: profile.email,
      auth_type: authType,
      status: '정상',
    };
    if (profile.terms_agreed_at) row.terms_agreed_at = profile.terms_agreed_at;
    if (profile.privacy_agreed_at) row.privacy_agreed_at = profile.privacy_agreed_at;
    if (Object.prototype.hasOwnProperty.call(profile, 'marketing_agreed_at')) {
      row.marketing_agreed_at = profile.marketing_agreed_at || null;
    }
    var res = await sb().from('members').upsert(row, { onConflict: 'email' });
    /* migration 002 미적용 시 동의 컬럼이 없어 PGRST204 → 기본 컬럼만 재시도 */
    if (res.error && res.error.code === 'PGRST204' && /agreed_at/.test(res.error.message || '')) {
      console.warn('[CHODRUM] members consent columns missing — upsert without them', res.error.message);
      delete row.terms_agreed_at;
      delete row.privacy_agreed_at;
      delete row.marketing_agreed_at;
      res = await sb().from('members').upsert(row, { onConflict: 'email' });
    }
    if (res.error) {
      console.warn('[CHODRUM] member upsert', res.error);
      var err = new Error(res.error.message || '회원 정보를 저장하지 못했어요.');
      err.supabase = res.error;
      throw err;
    }
    return profile;
  }

  /* -------- boot -------- */
  var state = { mode: 'demo', error: null, ready: false };
  var readyPromise = hydrate().then(function (r) {
    state.mode = r.mode;
    state.error = r.error || null;
    state.ready = true;
    window.dispatchEvent(new CustomEvent('chodrum:ready', { detail: state }));
    return state;
  });

  window.ChodrumAPI = {
    get mode() { return state.mode; },
    get readyState() { return state; },
    ready: readyPromise,
    isLive: live,
    hydrate: hydrate,
    sheets: {
      list: listSheets,
      upsert: upsertSheet,
      remove: deleteSheets,
      setStatus: setSheetStatus,
    },
    featured: { save: saveFeatured },
    homePromo: { save: saveHomePromo },
    banners: { save: saveBanners },
    orders: {
      create: createOrder,
      updateStatus: updateOrderStatus,
      forEmail: ordersForEmail,
    },
    members: {
      upsert: upsertMember,
      getByEmail: getMemberByEmail,
      hasConsent: memberHasConsent,
    },
  };

  window.ChodrumBoot = {
    whenReady: function (fn) {
      readyPromise.then(function () { fn(state); }).catch(function () { fn(state); });
    },
  };
})();
