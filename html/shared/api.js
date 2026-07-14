/* CHODRUM — FO ↔ BO data bridge via Supabase (fallback: local data.js) */
(function () {
  var sb = function () { return window.ChodrumSB && window.ChodrumSB.client; };
  var live = function () { return !!(window.ChodrumSB && window.ChodrumSB.configured && sb()); };

  /** Normalize preview image URLs (max 2). Prefer preview_urls[], fall back to preview_url. */
  function normalizePreviewUrls(rowOrSheet) {
    var urls = [];
    var fromArr = rowOrSheet.preview_urls != null ? rowOrSheet.preview_urls : rowOrSheet.previewUrls;
    if (Array.isArray(fromArr)) {
      urls = fromArr.filter(Boolean);
    } else if (typeof fromArr === 'string' && fromArr) {
      /* PostgREST sometimes returns text[] as "{url1,url2}" */
      var raw = fromArr.trim();
      if (raw.charAt(0) === '{' && raw.charAt(raw.length - 1) === '}') {
        urls = raw.slice(1, -1).split(',').map(function (p) {
          return p.replace(/^"|"$/g, '').trim();
        }).filter(Boolean);
      } else if (raw.charAt(0) === '[') {
        try {
          var parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) urls = parsed.filter(Boolean);
          else urls = [raw];
        } catch (_) {
          urls = [raw];
        }
      } else {
        urls = [raw];
      }
    }
    var single = rowOrSheet.preview_url != null ? rowOrSheet.preview_url : rowOrSheet.previewUrl;
    if (!urls.length && single) urls = [single];
    /* If array missing 1st but single exists, ensure single is first */
    if (single && urls.indexOf(single) === -1 && urls.length < 2) {
      /* keep array as-is when it already has entries */
    }
    return urls.slice(0, 2);
  }

  function mapSheet(row) {
    var previewUrls = normalizePreviewUrls(row);
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
      pdfUrl: row.pdf_url || '',
      previewUrl: previewUrls[0] || '',
      previewUrls: previewUrls,
    };
  }

  function sheetToRow(s) {
    var previewUrls = normalizePreviewUrls(s);
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
      pdf_url: s.pdfUrl || null,
      preview_url: previewUrls[0] || null,
      preview_urls: previewUrls.length ? previewUrls : null,
    };
  }

  function sanitizeFileName(name) {
    return String(name || 'file')
      .replace(/[^\w.\-가-힣]+/g, '_')
      .replace(/_+/g, '_')
      .slice(0, 120);
  }

  /**
   * Bake preview protection into image (clean, minimal):
   * subtle diagonal watermark across the full image,
   * clear top ~22% / soft nearly-opaque veil on bottom ~78%,
   * plus a slightly larger watermark clipped to the veil only.
   * Returns a JPEG File; on failure returns the original file.
   */
  function stampPreviewWatermark(file) {
    return new Promise(function (resolve) {
      if (typeof document === 'undefined' || !file) {
        resolve(file);
        return;
      }
      var img = new Image();
      var objUrl = URL.createObjectURL(file);
      var done = function (out) {
        try { URL.revokeObjectURL(objUrl); } catch (_) {}
        resolve(out || file);
      };
      img.onload = function () {
        try {
          var w = img.naturalWidth || img.width;
          var h = img.naturalHeight || img.height;
          if (!w || !h) { done(file); return; }
          var canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          var ctx = canvas.getContext('2d');
          if (!ctx) { done(file); return; }
          ctx.drawImage(img, 0, 0, w, h);

          var label = 'CHODRUM PREVIEW';
          var fontFamily = '"IBM Plex Sans", "Noto Sans KR", sans-serif';
          var angle = -Math.PI / 8;

          /* --- Full-image: sparse diagonal tiling at low opacity --- */
          var fullSize = Math.max(14, Math.round(Math.min(w, h) / 18));
          var stepX = Math.round(fullSize * 7.5);
          var stepY = Math.round(fullSize * 5.5);
          ctx.save();
          ctx.translate(w / 2, h / 2);
          ctx.rotate(angle);
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = '500 ' + fullSize + 'px ' + fontFamily;
          ctx.fillStyle = 'rgba(0,0,0,0.045)';
          var span = Math.ceil(Math.sqrt(w * w + h * h));
          for (var y = -span; y <= span; y += stepY) {
            for (var x = -span; x <= span; x += stepX) {
              ctx.fillText(label, x, y);
            }
          }
          ctx.restore();

          /* --- Clear zone: top ~22%; remaining ~78% nearly opaque soft veil --- */
          var visibleRatio = 0.22;
          var obscureY = Math.floor(h * visibleRatio);
          var obscureH = h - obscureY;
          if (obscureH > 8) {
            var fadeH = Math.max(24, Math.round(h * 0.06));
            var veil = ctx.createLinearGradient(0, obscureY - fadeH, 0, h);
            veil.addColorStop(0, 'rgba(252,252,252,0)');
            veil.addColorStop(0.12, 'rgba(250,250,250,0.72)');
            veil.addColorStop(0.35, 'rgba(248,248,248,0.94)');
            veil.addColorStop(0.6, 'rgba(247,247,247,0.97)');
            veil.addColorStop(1, 'rgba(246,246,246,0.985)');
            ctx.fillStyle = veil;
            ctx.fillRect(0, obscureY - fadeH, w, obscureH + fadeH);

            /* --- Larger diagonal label, clipped to veil zone only --- */
            var veilSize = Math.max(22, Math.round(Math.min(w, obscureH) / 10));
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, obscureY, w, obscureH);
            ctx.clip();
            ctx.translate(w / 2, obscureY + obscureH * 0.42);
            ctx.rotate(angle);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = '600 ' + veilSize + 'px ' + fontFamily;
            ctx.fillStyle = 'rgba(0,0,0,0.08)';
            ctx.fillText(label, 0, 0);
            ctx.restore();
          }

          canvas.toBlob(function (blob) {
            if (!blob) { done(file); return; }
            var base = String(file.name || 'preview').replace(/\.[^.]+$/, '');
            var stamped = new File([blob], base + '-wm.jpg', { type: 'image/jpeg' });
            done(stamped);
          }, 'image/jpeg', 0.9);
        } catch (e) {
          console.warn('[CHODRUM] watermark stamp failed', e);
          done(file);
        }
      };
      img.onerror = function () { done(file); };
      img.src = objUrl;
    });
  }

  /**
   * Upload PDF or preview image to Storage bucket `sheets`.
   * Preview images get full subtle watermark + top-clear / heavy bottom veil
   * (with a larger mark on the veil) before upload.
   * PDF originals are uploaded as-is for purchasers.
   * @param {File} file
   * @param {'pdf'|'preview'} kind
   * @returns {Promise<{ url: string, path: string, name: string }>}
   */
  async function uploadSheetFile(file, kind) {
    if (!file) throw new Error('파일이 선택되지 않았어요.');
    var isPdf = kind === 'pdf';
    var mime = (file.type || '').toLowerCase();
    var lower = (file.name || '').toLowerCase();

    if (isPdf) {
      if (mime !== 'application/pdf' && !lower.endsWith('.pdf')) {
        throw new Error('PDF 파일만 업로드할 수 있어요.');
      }
    } else {
      var okImg =
        /^image\/(png|jpe?g|webp|gif)$/.test(mime) ||
        /\.(png|jpe?g|webp|gif)$/.test(lower);
      if (!okImg) {
        throw new Error('이미지 파일(PNG, JPG, WEBP)만 업로드할 수 있어요.');
      }
      /* Permanent obscure + watermark baked into stored preview (not PDF) */
      file = await stampPreviewWatermark(file);
      mime = (file.type || 'image/jpeg').toLowerCase();
      lower = (file.name || '').toLowerCase();
    }

    var folder = isPdf ? 'pdf' : 'preview';
    var path = folder + '/' + Date.now() + '-' + sanitizeFileName(file.name);

    if (!live()) {
      return {
        url: (typeof URL !== 'undefined' && URL.createObjectURL) ? URL.createObjectURL(file) : '',
        path: path,
        name: file.name,
      };
    }

    var client = sb();
    var up = await client.storage.from('sheets').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || (isPdf ? 'application/pdf' : 'image/jpeg'),
    });
    if (up.error) {
      var msg = up.error.message || '';
      if (/bucket|not found|does not exist/i.test(msg)) {
        throw new Error('Storage 버킷(sheets)이 없어요. supabase/migrations/003_sheet_files.sql 을 실행해 주세요.');
      }
      if (/mime|type|not allowed|invalid/i.test(msg)) {
        throw new Error(isPdf
          ? 'PDF 파일만 업로드할 수 있어요.'
          : '이미지 파일(PNG, JPG, WEBP)만 업로드할 수 있어요.');
      }
      throw new Error('파일 업로드에 실패했어요. Storage 정책·용량을 확인해 주세요.');
    }

    var pub = client.storage.from('sheets').getPublicUrl(path);
    var url = pub && pub.data && pub.data.publicUrl;
    if (!url) throw new Error('업로드 URL을 만들지 못했어요.');
    return { url: url, path: path, name: file.name };
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
      D.byId = function (id) {
        var key = id == null ? '' : String(id);
        return D.sheets.find(function (s) { return String(s.id) === key; });
      };
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
    D.byId = function (id) {
      var key = id == null ? '' : String(id);
      return D.sheets.find(function (s) { return String(s.id) === key; });
    };
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
    var wantedMulti = Array.isArray(row.preview_urls) && row.preview_urls.length > 1;
    var res = await sb().from('sheets').upsert(row).select().single();
    var droppedPreviewUrls = false;
    /* PGRST204 = schema cache miss; 42703 = column does not exist */
    var colMiss = res.error && (
      res.error.code === 'PGRST204' ||
      res.error.code === '42703' ||
      /column.*does not exist|Could not find.*column/i.test(res.error.message || '')
    );
    if (colMiss && /(pdf_url|preview_urls?)/.test(res.error.message || '')) {
      var miss = res.error.message || '';
      console.warn('[CHODRUM] sheets file URL columns missing — upsert without them', miss);
      if (/pdf_url/.test(miss)) delete row.pdf_url;
      if (/preview_urls/.test(miss)) {
        if (wantedMulti) droppedPreviewUrls = true;
        delete row.preview_urls;
      }
      if (/preview_url(?!s)/.test(miss)) {
        delete row.preview_url;
        delete row.preview_urls;
      }
      res = await sb().from('sheets').upsert(row).select().single();
    }
    if (res.error) throw res.error;
    var mapped = mapSheet(res.data);
    /* Keep local multi-URL view even if DB only stored preview_url (until 004 runs) */
    if (droppedPreviewUrls && wantedMulti) {
      mapped.previewUrls = normalizePreviewUrls(sheet);
      mapped.previewUrl = mapped.previewUrls[0] || mapped.previewUrl || '';
      mapped._warn =
        '미리보기 2장이 업로드됐지만 DB에 preview_urls 컬럼이 없어 1장만 저장됐어요. ' +
        'Supabase SQL Editor에서 supabase/migrations/004_preview_urls.sql 을 실행한 뒤 다시 등록해 주세요.';
    }
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
      uploadFile: uploadSheetFile,
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
