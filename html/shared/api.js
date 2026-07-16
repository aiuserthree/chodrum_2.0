/* CHODRUM — FO ↔ BO data bridge via Supabase (fallback: local data.js) */
(function () {
  var sb = function () { return window.ChodrumSB && window.ChodrumSB.client; };
  var live = function () { return !!(window.ChodrumSB && window.ChodrumSB.configured && sb()); };

  function isBoPage() {
    try {
      var p = location.pathname || '';
      return /\/bo(\/|$)/i.test(p) || /BO-\d+/i.test(p);
    } catch (_) {
      return false;
    }
  }

  function edgeFnUrl(configKey, fnName) {
    var c = window.CHODRUM_CONFIG || {};
    var explicit = String(c[configKey] || '').trim();
    if (explicit && explicit.indexOf('YOUR_') !== 0) return explicit;
    var base = String(c.SUPABASE_URL || '').replace(/\/$/, '');
    if (!base || /YOUR_/i.test(base)) return '';
    return base + '/functions/v1/' + fnName;
  }

  /** Extract storage object path from path or legacy public/sign URL. */
  function sheetsStoragePath(urlOrPath, folderHint) {
    if (!urlOrPath) return '';
    var raw = String(urlOrPath).trim();
    if (!raw) return '';
    if (/^(pdf|preview)\//.test(raw)) return raw.split('?')[0];
    var m = raw.match(/\/storage\/v1\/object\/(?:public|sign)\/sheets\/([^?]+)/);
    if (m && m[1]) return decodeURIComponent(m[1]);
    var idx = raw.indexOf('pdf/');
    if (idx >= 0) return raw.slice(idx).split('?')[0];
    idx = raw.indexOf('preview/');
    if (idx >= 0) return raw.slice(idx).split('?')[0];
    if (folderHint && raw.indexOf('/') === -1) return folderHint + '/' + raw;
    return '';
  }

  /** NEW badge window: sheets created within this many days. */
  var NEW_SHEET_DAYS = 14;
  var NEW_SHEET_MS = NEW_SHEET_DAYS * 24 * 60 * 60 * 1000;

  /** True if created_at / createdAt falls within the NEW window. */
  function isSheetNew(sheetOrCreatedAt) {
    var raw = sheetOrCreatedAt;
    if (raw && typeof raw === 'object') {
      raw = raw.createdAt != null ? raw.createdAt : raw.created_at;
    }
    if (!raw) return false;
    var t = new Date(raw).getTime();
    if (isNaN(t)) return false;
    return (Date.now() - t) <= NEW_SHEET_MS;
  }

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

  /**
   * Extract YouTube video id from common URL formats:
   * watch?v=, youtu.be/, shorts/, embed/, live/, m.youtube.com
   */
  function parseYouTubeId(raw) {
    if (!raw) return '';
    var url = String(raw).trim();
    if (!url) return '';
    /* Bare 11-char id */
    if (/^[\w-]{11}$/.test(url)) return url;
    try {
      var u = new URL(url.indexOf('://') === -1 ? 'https://' + url : url);
      var host = (u.hostname || '').replace(/^www\./, '').toLowerCase();
      if (host === 'youtu.be') {
        var shortId = (u.pathname || '').split('/').filter(Boolean)[0] || '';
        return /^[\w-]{11}$/.test(shortId) ? shortId : '';
      }
      if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com'
          || host === 'youtube-nocookie.com') {
        var v = u.searchParams.get('v');
        if (v && /^[\w-]{11}$/.test(v)) return v;
        var parts = (u.pathname || '').split('/').filter(Boolean);
        var kind = parts[0];
        var id = parts[1] || '';
        if ((kind === 'embed' || kind === 'shorts' || kind === 'live' || kind === 'v')
            && /^[\w-]{11}$/.test(id)) {
          return id;
        }
      }
    } catch (_) {
      /* fall through */
    }
    var m = url.match(
      /(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/|v\/)|youtu\.be\/)([\w-]{11})/
    );
    return m ? m[1] : '';
  }

  function youtubeEmbedUrl(id, autoplay) {
    if (!id) return '';
    // www.youtube.com — same host as oEmbed. Minimal params for reliability.
    // Error 153: pair with page <meta name="referrer"> + iframe referrerpolicy.
    // Note: Referer http://127.0.0.1 is rejected by YouTube ("재생할 수 없음");
    // use http://localhost (see config.js rewrite).
    var q = ['rel=0', 'modestbranding=1', 'playsinline=1'];
    if (autoplay) q.push('autoplay=1');
    return 'https://www.youtube.com/embed/' + encodeURIComponent(id)
      + '?' + q.join('&');
  }

  function youtubeWatchUrl(id) {
    if (!id) return '';
    return 'https://www.youtube.com/watch?v=' + encodeURIComponent(id);
  }

  function youtubeThumbUrl(id) {
    if (!id) return '';
    return 'https://i.ytimg.com/vi/' + encodeURIComponent(id) + '/hqdefault.jpg';
  }

  /** True when this page's origin cannot embed YouTube (IP loopback Referer). */
  function youtubeEmbedBlockedOnHost() {
    try {
      return location.hostname === '127.0.0.1';
    } catch (_) {
      return false;
    }
  }

  /**
   * Probe whether YouTube still serves an oEmbed for this video.
   * Resolves true if embeddable, false if owner disabled / missing.
   * Network errors resolve null (unknown — keep trying iframe).
   */
  function youtubeCanEmbed(id) {
    if (!id) return Promise.resolve(false);
    var oembed = 'https://www.youtube.com/oembed?format=json&url='
      + encodeURIComponent('https://www.youtube.com/watch?v=' + id);
    return fetch(oembed, { method: 'GET', mode: 'cors', credentials: 'omit' })
      .then(function (r) {
        if (r.ok) return true;
        if (r.status === 401 || r.status === 403 || r.status === 404) return false;
        return null;
      })
      .catch(function () { return null; });
  }

  function mapSheet(row) {
    var previewUrls = normalizePreviewUrls(row);
    var createdAt = row.created_at || row.createdAt || null;
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
      /* Display NEW from created_at (14-day auto-expiry), not permanent is_new flag */
      isNew: isSheetNew(createdAt),
      createdAt: createdAt || undefined,
      rating: Number(row.rating) || 0,
      sold: row.sold || 0,
      status: row.status || '판매중',
      /* FO never gets a usable PDF URL — download via sheet-download Edge */
      pdfUrl: isBoPage() ? (row.pdf_url || '') : '',
      previewUrl: previewUrls[0] || '',
      previewUrls: previewUrls,
      youtubeUrl: row.youtube_url || row.youtubeUrl || '',
    };
  }

  /**
   * Sign preview/* paths so private sheets bucket still works in <img src>.
   * Batches createSignedUrls (one round-trip) instead of N sequential calls —
   * critical after migration 013 made the sheets bucket private.
   */
  async function signPreviewUrlsForSheets(sheets) {
    if (!live() || !sheets || !sheets.length) return sheets;
    var client = sb();
    var pathSet = {};
    var pathList = [];
    sheets.forEach(function (s) {
      (s.previewUrls || []).forEach(function (url) {
        var p = sheetsStoragePath(url, 'preview');
        if (p && p.indexOf('preview/') === 0 && !pathSet[p]) {
          pathSet[p] = true;
          pathList.push(p);
        }
      });
    });
    var signedMap = {};
    if (pathList.length) {
      try {
        /* supabase-js batches; chunk to stay under URL/body limits */
        var CHUNK = 100;
        for (var c = 0; c < pathList.length; c += CHUNK) {
          var chunk = pathList.slice(c, c + CHUNK);
          var r = await client.storage.from('sheets').createSignedUrls(chunk, 3600);
          if (r.error) {
            console.warn('[CHODRUM] createSignedUrls', r.error);
            continue;
          }
          (r.data || []).forEach(function (item) {
            if (!item) return;
            var key = item.path || '';
            var url = item.signedUrl || item.signedURL || '';
            if (key && url && !item.error) signedMap[key] = url;
          });
        }
      } catch (e) {
        console.warn('[CHODRUM] preview sign batch failed', e);
      }
    }
    return sheets.map(function (s) {
      var urls = (s.previewUrls || []).map(function (url) {
        var p = sheetsStoragePath(url, 'preview');
        if (p && signedMap[p]) return signedMap[p];
        return url;
      });
      var copy = Object.assign({}, s);
      copy.previewUrls = urls;
      copy.previewUrl = urls[0] || '';
      return copy;
    });
  }

  /** Auth / legal / payment interstitial — skip catalog hydrate for first paint. */
  function isLightHydratePage() {
    try {
      var p = location.pathname || '';
      if (/\/(login|signup|find-id|password-reset|oauth-terms|terms|privacy|marketing|guide)(\/|$)/i.test(p)) {
        return true;
      }
      if (/\/payment\/(success|fail)/i.test(p)) return true;
      if (/FO-08-|FO-11-|FO-06-payment/i.test(p)) return true;
      if (/BO-00-login/i.test(p) || /\/bo\/login/i.test(p)) return true;
      return false;
    } catch (_) {
      return false;
    }
  }

  function sheetToRow(s) {
    var previewUrls = normalizePreviewUrls(s);
    var yt = (s.youtubeUrl != null ? s.youtubeUrl : s.youtube_url) || '';
    yt = String(yt).trim();
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
      youtube_url: yt || null,
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
      if (/row-level security|violates|policy|unauthorized|permission|403/i.test(msg)
          || String(up.error.statusCode || '') === '403') {
        throw new Error('Storage 업로드 권한이 없어요. BO 관리자(app_metadata.role=admin)로 로그인했는지, migration 013·014를 적용했는지 확인하세요.');
      }
      throw new Error('파일 업로드에 실패했어요. Storage 정책·용량을 확인해 주세요.');
    }

    /*
     * Store storage path (pdf/… · preview/…) — bucket is private after 013.
     * FO signs preview on hydrate; PDF download uses sheet-download Edge.
     */
    return { url: path, path: path, name: file.name };
  }

  /** True when Storage reports the target bucket is missing (not RLS/MIME). */
  function isMissingBucketError(err) {
    var msg = String((err && (err.message || err.error)) || '');
    var code = String((err && (err.statusCode || err.status)) || '');
    return /bucket not found/i.test(msg)
      || (/bucket/i.test(msg) && /not found|does not exist/i.test(msg))
      || (code === '404' && /bucket/i.test(msg));
  }

  /**
   * Upload banner image to Storage bucket `banners` (path: img/...).
   * Stores the file as-is — no canvas resize, WebP conversion, or quality compression.
   * Public URL has no image-transform query params (full resolution).
   * Requires migration 006_banner_images.sql (bucket + policies + image_url).
   * Mobile column: 008_banner_mobile_image.sql (image_url_mobile).
   * Recommended masters (retina): PC 2240×440, Mobile 1500×704.
   * @param {File} file
   * @returns {Promise<{ url: string, path: string, name: string }>}
   */
  async function uploadBannerImage(file) {
    if (!file) throw new Error('파일이 선택되지 않았어요.');
    var mime = (file.type || '').toLowerCase();
    var lower = (file.name || '').toLowerCase();
    var okImg =
      /^image\/(png|jpe?g|webp|gif)$/.test(mime) ||
      /\.(png|jpe?g|webp|gif)$/.test(lower);
    if (!okImg) {
      throw new Error('이미지 파일(PNG, JPG, WEBP)만 업로드할 수 있어요.');
    }

    var path = 'img/' + Date.now() + '-' + sanitizeFileName(file.name);
    var contentType = file.type || 'image/jpeg';
    if (contentType === 'image/jpg') contentType = 'image/jpeg';

    if (!live()) {
      return {
        url: (typeof URL !== 'undefined' && URL.createObjectURL) ? URL.createObjectURL(file) : '',
        path: path,
        name: file.name,
      };
    }

    var client = sb();
    /* Original bytes only — do not transform or downscale before upload. */
    var up = await client.storage.from('banners').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: contentType,
    });
    if (up.error) {
      var msg = up.error.message || String(up.error.error || up.error) || '';
      if (isMissingBucketError(up.error)) {
        throw new Error('Storage 버킷(banners)이 없어요. Supabase SQL Editor에서 supabase/migrations/006_banner_images.sql 을 실행해 주세요.');
      }
      if (/mime|not supported|not allowed|invalid.*type/i.test(msg)) {
        throw new Error('이미지 파일(PNG, JPG, WEBP)만 업로드할 수 있어요.');
      }
      if (/row-level security|violates|policy|unauthorized|permission|403/i.test(msg)
          || String(up.error.statusCode || '') === '403') {
        throw new Error('Storage 업로드 권한이 없어요. 006_banner_images.sql 의 banners_storage_* 정책을 다시 실행해 주세요.');
      }
      throw new Error('배너 업로드 실패: ' + (msg || '알 수 없는 오류') + ' — 006_banner_images.sql(버킷·정책)을 확인해 주세요.');
    }

    var pub = client.storage.from('banners').getPublicUrl(path);
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
    if (D && A && A.banners) {
      D.homeBanners = A.banners.slice();
    }
    return { mode: 'demo', error: null };
  }

  async function hydrateFromSupabase() {
    var client = sb();
    var D = window.DrumData;
    var A = window.AdminData;

    /* Login / legal / payment interstitials: mark ready without catalog fetch. */
    if (isLightHydratePage()) {
      return { mode: 'live', error: null, light: true };
    }

    var bo = isBoPage();
    var sheetsPromise = client.from('sheets').select('*').order('sold', { ascending: false });
    var metaPromise = Promise.all([
      client.from('featured_sheets').select('sheet_id, sort_order').order('sort_order'),
      client.from('home_promo').select('*').eq('id', 1).maybeSingle(),
      client.from('banners').select('*').order('sort_order'),
      client.from('site_settings').select('key, value'),
      bo
        ? client.from('orders').select('*, order_items(sheet_id, qty, price)').order('created_at', { ascending: false })
        : Promise.resolve({ error: null, data: [] }),
      bo
        ? client.from('members').select('*').order('joined_at', { ascending: false })
        : Promise.resolve({ error: null, data: [] }),
      bo
        ? client.from('downloads').select('*').order('created_at', { ascending: false })
        : Promise.resolve({ error: null, data: [] }),
    ]);

    /* Sign previews while other tables load (overlap network). */
    var sheetsRes = await sheetsPromise;
    if (sheetsRes.error) throw sheetsRes.error;
    var signPromise = signPreviewUrlsForSheets((sheetsRes.data || []).map(mapSheet));
    var settled = await Promise.all([signPromise, metaPromise]);
    var sheets = settled[0];
    var featRes = settled[1][0];
    var promoRes = settled[1][1];
    var banRes = settled[1][2];
    var setRes = settled[1][3];
    var ordRes = settled[1][4];
    var memRes = settled[1][5];
    var dlRes = settled[1][6];

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

    if (!featRes.error) {
      D.recommended = (featRes.data || []).map(function (r) { return r.sheet_id; });
    }

    if (!promoRes.error && promoRes.data) {
      D.banner = {
        sheetId: promoRes.data.sheet_id,
        label: promoRes.data.label,
        title: promoRes.data.title,
        copy: promoRes.data.copy,
      };
    }

    if (banRes.error) {
      console.warn('[CHODRUM] banners hydrate 실패', banRes.error);
    } else {
      A.banners = (banRes.data || []).map(function (b) {
        return {
          id: b.id,
          title: b.title,
          link: b.link || '',
          period: b.period || '상시',
          img: b.image_name || '',
          imgUrl: b.image_url || b.imgUrl || '',
          imgMobile: b.image_name_mobile || '',
          imgUrlMobile: b.image_url_mobile || b.imgUrlMobile || '',
          sheetId: b.sheet_id || b.sheetId || '',
          on: b.is_on == null ? !!b.on : !!b.is_on,
        };
      });
      D.homeBanners = A.banners.slice();
    }

    if (!setRes.error && setRes.data) {
      setRes.data.forEach(function (row) {
        if (row.key === 'genres' && Array.isArray(row.value)) D.genres = row.value;
        if (row.key === 'levels' && Array.isArray(row.value)) D.levels = row.value;
      });
    }

    /* Sensitive tables: BO admin only (014 RLS). FO must not pull all rows. */
    if (!ordRes.error && bo) {
      A.orders = (ordRes.data || []).map(function (o) {
        return {
          no: o.order_no,
          buyer: o.buyer_name,
          email: o.email,
          member: !!o.is_member,
          authUserId: o.auth_user_id || null,
          provider: o.auth_provider || null,
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

    if (!memRes.error && bo) {
      var orderCountByIdentity = {};
      (A.orders || []).forEach(function (o) {
        if (!o || !o.email || !o.member) return;
        var prov = o.provider || 'email';
        var key = prov + '|' + String(o.email).toLowerCase();
        orderCountByIdentity[key] = (orderCountByIdentity[key] || 0) + 1;
      });
      A.members = (memRes.data || []).map(function (m) {
        var prov = normalizeMemberProvider(m.auth_provider || m.auth_type || 'email');
        var emailKey = prov + '|' + String(m.email || '').toLowerCase();
        return {
          name: m.name,
          email: m.email,
          type: m.auth_type,
          provider: prov,
          authUserId: m.auth_user_id || null,
          birth: m.birth || '',
          joined: fmtJoined(m.joined_at),
          orders: orderCountByIdentity[emailKey] != null ? orderCountByIdentity[emailKey] : (m.orders_count || 0),
          status: m.status,
        };
      });
    }

    if (!dlRes.error && bo) {
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
    return signPreviewUrlsForSheets((res.data || []).map(mapSheet));
  }

  async function upsertSheet(sheet) {
    var row = sheetToRow(sheet);
    if (!row.id) row.id = 's' + Date.now();
    if (!row.code) row.code = 'DS-' + String(1000 + Math.floor(Math.random() * 9000));
    if (!live()) {
      var D = window.DrumData;
      var i = D.sheets.findIndex(function (s) { return s.id === row.id; });
      /* Local demo: preserve createdAt on edit; stamp now on create (for NEW window) */
      var createdAt = sheet.createdAt
        || (i >= 0 && D.sheets[i].createdAt)
        || new Date().toISOString();
      row.created_at = createdAt;
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
    if (colMiss && /(pdf_url|preview_urls?|youtube_url)/.test(res.error.message || '')) {
      var miss = res.error.message || '';
      console.warn('[CHODRUM] sheets URL columns missing — upsert without them', miss);
      if (/pdf_url/.test(miss)) delete row.pdf_url;
      if (/preview_urls/.test(miss)) {
        if (wantedMulti) droppedPreviewUrls = true;
        delete row.preview_urls;
      }
      if (/preview_url(?!s)/.test(miss)) {
        delete row.preview_url;
        delete row.preview_urls;
      }
      if (/youtube_url/.test(miss)) delete row.youtube_url;
      res = await sb().from('sheets').upsert(row).select().single();
    }
    if (res.error) throw res.error;
    var mappedList = await signPreviewUrlsForSheets([mapSheet(res.data)]);
    var mapped = mappedList[0];
    /* Keep local multi-URL view even if DB only stored preview_url (until 004 runs) */
    if (droppedPreviewUrls && wantedMulti) {
      mapped.previewUrls = normalizePreviewUrls(sheet);
      mapped.previewUrl = mapped.previewUrls[0] || mapped.previewUrl || '';
      mapped._warn =
        '미리보기 2장이 업로드됐지만 DB에 preview_urls 컬럼이 없어 1장만 저장됐어요. ' +
        'Supabase SQL Editor에서 supabase/migrations/004_preview_urls.sql 을 실행한 뒤 다시 등록해 주세요.';
    }
    if (isBoPage()) mapped.pdfUrl = res.data.pdf_url || mapped.pdfUrl || '';
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
    window.DrumData.homeBanners = list.slice();
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
        image_url: b.imgUrl || '',
        image_name_mobile: b.imgMobile || '',
        image_url_mobile: b.imgUrlMobile || '',
        sheet_id: b.sheetId || null,
        is_on: !!b.on,
        sort_order: i,
      };
    });
    var ins = await client.from('banners').insert(rows);
    if (ins.error) throw ins.error;
  }

  /* -------- orders -------- */

  function isMissingOrderIdentityColumn(err) {
    if (!err) return false;
    if (err.code === 'PGRST204') return true;
    var msg = err.message || '';
    return /auth_user_id|auth_provider/.test(msg);
  }

  function mapOrderRowsWithDownloads(orderRows, downloadRows) {
    var byOrder = {};
    (downloadRows || []).forEach(function (d) {
      byOrder[d.order_no] = byOrder[d.order_no] || {};
      byOrder[d.order_no][d.sheet_id] = d;
    });
    return (orderRows || []).map(function (o) {
      return {
        orderNo: o.order_no,
        date: fmtOrderDate(o.created_at),
        createdAt: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
        items: (o.order_items || []).map(function (it) {
          var d = (byOrder[o.order_no] || {})[it.sheet_id];
          var sheet = (window.DrumData && typeof window.DrumData.byId === 'function')
            ? window.DrumData.byId(it.sheet_id)
            : null;
          return {
            id: it.sheet_id,
            sheetId: it.sheet_id,
            title: (sheet && sheet.title) || '',
            dday: d ? ddayFromExpires(d.expires_at, d.status) : 7,
          };
        }),
      };
    });
  }

  async function createOrder(order) {
    /* order: { no, buyer, email, member, method, status, total, items, authUserId?, provider? } */
    var authUserId = order.authUserId || order.auth_user_id || null;
    var authProvider = order.member
      ? normalizeMemberProvider(order.auth_provider || order.provider || 'email')
      : null;
    var status = order.status || '결제완료';
    var grantDownloads = status === '결제완료' && order.skipDownloads !== true;

    if (!live()) {
      window.AdminData.orders = [{
        no: order.no,
        buyer: order.buyer,
        email: order.email,
        member: !!order.member,
        authUserId: authUserId,
        provider: authProvider,
        items: order.items.map(function (it) { return { id: it.id, qty: it.qty, price: it.price }; }),
        method: order.method,
        status: status,
        date: fmtOrderDate(new Date().toISOString()),
        total: order.total,
      }].concat(window.AdminData.orders || []);
      return order;
    }

    var client = sb();
    var orderRow = {
      order_no: order.no,
      buyer_name: order.buyer,
      email: order.email,
      is_member: !!order.member,
      method: order.method,
      status: status,
      total: order.total || 0,
    };
    if (order.member && authUserId) orderRow.auth_user_id = authUserId;
    if (order.member && authProvider) orderRow.auth_provider = authProvider;

    var ordIns = await client.from('orders').insert(orderRow).select().single();
    if (ordIns.error && isMissingOrderIdentityColumn(ordIns.error)) {
      delete orderRow.auth_user_id;
      delete orderRow.auth_provider;
      ordIns = await client.from('orders').insert(orderRow).select().single();
    }
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

    if (grantDownloads) {
      var expires = new Date(Date.now() + 7 * 86400000).toISOString();
      var dls = (order.items || []).map(function (it) {
        var row = {
          email: order.email,
          is_member: !!order.member,
          sheet_id: it.id,
          order_no: order.no,
          status: 'ACTIVE',
          expires_at: expires,
        };
        if (order.member && authUserId) row.auth_user_id = authUserId;
        if (order.member && authProvider) row.auth_provider = authProvider;
        return row;
      });
      if (dls.length) {
        var dlIns = await client.from('downloads').insert(dls);
        if (dlIns.error && isMissingOrderIdentityColumn(dlIns.error)) {
          dls.forEach(function (row) {
            delete row.auth_user_id;
            delete row.auth_provider;
          });
          dlIns = await client.from('downloads').insert(dls);
        }
        if (dlIns.error) console.warn('[CHODRUM] downloads insert', dlIns.error);
      }

      if (order.member && order.email) {
        try {
          var mem = null;
          if (authUserId) mem = await getMemberByAuthUserId(authUserId);
          if (!mem) {
            mem = await getMemberByEmail(order.email, authProvider || order.auth_provider || order.provider || null);
          }
          if (mem) {
            var countQ = client
              .from('members')
              .update({ orders_count: (mem.orders_count || 0) + 1 });
            if (mem.id) countQ = countQ.eq('id', mem.id);
            else if (mem.auth_user_id) countQ = countQ.eq('auth_user_id', mem.auth_user_id);
            else countQ = countQ.eq('email', mem.email).eq('auth_provider', mem.auth_provider || authProvider || 'email');
            await countQ;
          }
        } catch (e) {
          console.warn('[CHODRUM] members orders_count', e);
        }
      }
    }

    return Object.assign({}, order, { _id: ordIns.data.id });
  }

  /** Checkout: insert status=대기 (+ items). Paid + downloads via toss-confirm Edge. */
  async function createPendingOrder(order) {
    return createOrder(Object.assign({}, order, {
      status: '대기',
      skipDownloads: true,
    }));
  }

  /**
   * Entitlement-checked PDF signed URL (Edge sheet-download).
   * @param {{ sheetId: string, email?: string, orderNo?: string }} opts
   */
  async function requestSignedPdfUrl(opts) {
    opts = opts || {};
    var sheetId = String(opts.sheetId || opts.id || '').trim();
    if (!sheetId) throw new Error('sheetId가 없어요');

    if (!live()) {
      var local = (window.DrumData && typeof window.DrumData.byId === 'function')
        ? window.DrumData.byId(sheetId)
        : null;
      var localUrl = local && (local.pdfUrl || local.pdf_url);
      if (localUrl) return { ok: true, url: localUrl, demo: true };
      throw new Error('데모 모드에서 PDF가 없어요');
    }

    var url = edgeFnUrl('SHEET_DOWNLOAD_URL', 'sheet-download');
    if (!url) throw new Error('SHEET_DOWNLOAD_URL / SUPABASE_URL 이 없어요');

    var headers = { 'Content-Type': 'application/json' };
    var anon = (window.CHODRUM_CONFIG && window.CHODRUM_CONFIG.SUPABASE_ANON_KEY) || '';
    if (anon) headers.apikey = anon;

    var body = { sheetId: sheetId };
    var client = sb();
    if (client) {
      try {
        var sess = await client.auth.getSession();
        var token = sess.data && sess.data.session && sess.data.session.access_token;
        if (token) headers.Authorization = 'Bearer ' + token;
      } catch (_) { /* guest path */ }
    }
    if (opts.email) body.email = opts.email;
    if (opts.orderNo) body.orderNo = opts.orderNo;

    var res = await fetch(url, { method: 'POST', headers: headers, body: JSON.stringify(body) });
    var data = await res.json().catch(function () { return {}; });
    if (!res.ok || !data.ok || !data.url) {
      throw new Error((data && data.error) || '다운로드 권한 확인에 실패했어요 (' + res.status + ')');
    }
    return data;
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

  /** Guest lookup (FO-10) — RPC lookup_guest_orders (014); fallback open select if RPC missing */
  async function ordersForEmail(email) {
    email = (email || '').toLowerCase();
    if (!live()) {
      return (window.Store && Store.guestOrders.forEmail(email)) || [];
    }
    var client = sb();
    var rpc = await client.rpc('lookup_guest_orders', { p_email: email });
    if (!rpc.error) {
      var rows = rpc.data;
      if (typeof rows === 'string') {
        try { rows = JSON.parse(rows); } catch (_) { rows = []; }
      }
      if (Array.isArray(rows)) {
        return rows.map(function (o) {
          return {
            orderNo: o.order_no,
            date: fmtOrderDate(o.created_at),
            createdAt: o.created_at ? new Date(o.created_at).getTime() : Date.now(),
            items: (o.items || []).map(function (it) {
              var sheet = (window.DrumData && typeof window.DrumData.byId === 'function')
                ? window.DrumData.byId(it.sheet_id)
                : null;
              return {
                id: it.sheet_id,
                sheetId: it.sheet_id,
                title: (sheet && sheet.title) || '',
                dday: ddayFromExpires(it.expires_at, it.status),
              };
            }),
          };
        });
      }
    }
    /* Pre-014 fallback */
    var o2 = await client
      .from('orders')
      .select('order_no, created_at, order_items(sheet_id, qty)')
      .ilike('email', email)
      .eq('is_member', false)
      .order('created_at', { ascending: false });
    if (o2.error) throw o2.error;
    var dl = await client.from('downloads').select('*').ilike('email', email).eq('is_member', false);
    return mapOrderRowsWithDownloads(o2.data, dl.error ? [] : dl.data);
  }

  /**
   * Member purchase history — identity-scoped.
   *
   * Rules (same contact email ≠ same buyer):
   *  - auth_user_id match always wins when present
   *  - Kakao/Naver/Google: NEVER claim email-provider or null-provider rows
   *  - email-password: may also claim email/null-provider legacy for that email
   *    (excluding rows already tagged to another auth_user_id)
   */
  async function ordersForMember(identity) {
    identity = identity || {};
    var email = (identity.email || '').toLowerCase();
    var authUserId = identity.authUserId || identity.auth_user_id || null;
    var provider = normalizeMemberProvider(
      identity.provider || identity.auth_provider || identity.authProvider || 'email'
    );
    var isSocial =
      identity.fromOAuth === true ||
      identity.type === 'social' ||
      (provider && provider !== 'email' && provider !== 'email_password');
    if (isSocial && (provider === 'email' || provider === 'email_password')) {
      /* Guard: social session must not fall into email legacy path */
      provider = normalizeMemberProvider(
        identity.provider || identity.auth_provider || identity.authProvider || 'social'
      );
      if (provider === 'email' || provider === 'social') {
        console.warn('[CHODRUM] social identity missing provider — purchase history empty');
        return [];
      }
    }
    if (!email && !authUserId) return [];

    if (!live()) {
      return [];
    }

    var client = sb();
    var selectCols = 'order_no, created_at, auth_user_id, auth_provider, order_items(sheet_id, qty)';
    var byNo = {};
    var identityColsMissing = false;

    function orderBelongs(o) {
      if (!o || !o.order_no) return false;
      var rowProv = o.auth_provider
        ? normalizeMemberProvider(o.auth_provider)
        : null;
      var rowUid = o.auth_user_id || null;

      /* Another Auth user's order — never */
      if (authUserId && rowUid && rowUid !== authUserId) return false;

      if (authUserId && rowUid === authUserId) {
        /* Own auth_user_id: social must not inherit mis-tagged email/null rows */
        if (isSocial || provider !== 'email') {
          if (!rowProv || rowProv === 'email') return false;
          if (rowProv !== provider) return false;
          return true;
        }
        /* Email account: reject rows tagged to a social provider */
        if (rowProv && rowProv !== 'email') return false;
        return true;
      }

      /* Untagged / provider-only rows */
      if (provider === 'email' && !isSocial) {
        if (rowUid && authUserId && rowUid !== authUserId) return false;
        return !rowProv || rowProv === 'email';
      }

      /* Social: only exact provider, never null/email */
      if (!rowProv || rowProv === 'email') return false;
      return rowProv === provider;
    }

    function mergeRows(rows) {
      (rows || []).forEach(function (o) {
        if (orderBelongs(o)) byNo[o.order_no] = o;
      });
    }

    /* 1) Primary: this Auth user only */
    if (authUserId) {
      var byId = await client
        .from('orders')
        .select(selectCols)
        .eq('auth_user_id', authUserId)
        .eq('is_member', true)
        .order('created_at', { ascending: false });
      if (byId.error && isMissingOrderIdentityColumn(byId.error)) {
        identityColsMissing = true;
      } else if (byId.error) {
        throw byId.error;
      } else {
        mergeRows(byId.data);
      }
    }

    if (!identityColsMissing && email) {
      if (provider === 'email' && !isSocial) {
        /* 2a) Email account: email-provider + null legacy (not another user's) */
        var byEmailProv = await client
          .from('orders')
          .select(selectCols)
          .ilike('email', email)
          .eq('is_member', true)
          .eq('auth_provider', 'email')
          .order('created_at', { ascending: false });
        if (byEmailProv.error && isMissingOrderIdentityColumn(byEmailProv.error)) {
          identityColsMissing = true;
        } else if (byEmailProv.error) {
          throw byEmailProv.error;
        } else {
          mergeRows(byEmailProv.data);
        }
        if (!identityColsMissing) {
          var legacy = await client
            .from('orders')
            .select(selectCols)
            .ilike('email', email)
            .eq('is_member', true)
            .is('auth_provider', null)
            .order('created_at', { ascending: false });
          if (!legacy.error) mergeRows(legacy.data);
        }
      } else if (provider !== 'email') {
        /*
         * 2b) Social: only same-provider rows.
         * Prefer untagged-null auth_user_id orphans for THIS provider only.
         * Do NOT query auth_provider=email or null.
         */
        var bySocial = await client
          .from('orders')
          .select(selectCols)
          .ilike('email', email)
          .eq('is_member', true)
          .eq('auth_provider', provider)
          .order('created_at', { ascending: false });
        if (bySocial.error && isMissingOrderIdentityColumn(bySocial.error)) {
          identityColsMissing = true;
        } else if (bySocial.error) {
          throw bySocial.error;
        } else {
          mergeRows(bySocial.data);
        }
      }
    }

    if (identityColsMissing) {
      /* migration 011 not applied — social must see nothing (would leak by email) */
      if (provider !== 'email' || isSocial) {
        console.warn('[CHODRUM] orders identity columns missing — social purchase history empty until 011');
        return [];
      }
      var bare = await client
        .from('orders')
        .select('order_no, created_at, order_items(sheet_id, qty)')
        .ilike('email', email)
        .eq('is_member', true)
        .order('created_at', { ascending: false });
      if (bare.error) throw bare.error;
      mergeRows(bare.data);
    }

    var orderRows = Object.keys(byNo).map(function (k) { return byNo[k]; });
    orderRows.sort(function (a, b) {
      return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    });

    var dlRows = [];
    var orderNos = orderRows.map(function (o) { return o.order_no; });
    function mergeDl(rows) {
      (rows || []).forEach(function (d) {
        if (!d) return;
        if (authUserId && d.auth_user_id && d.auth_user_id !== authUserId) return;
        if (orderNos.length && d.order_no && orderNos.indexOf(d.order_no) === -1) {
          /* only enrich downloads for already-accepted orders */
          return;
        }
        dlRows.push(d);
      });
    }
    if (authUserId && !identityColsMissing) {
      var dlId = await client.from('downloads').select('*').eq('auth_user_id', authUserId);
      if (!dlId.error) mergeDl(dlId.data);
      else if (isMissingOrderIdentityColumn(dlId.error)) identityColsMissing = true;
    }
    if (!identityColsMissing && email && orderNos.length) {
      if (provider === 'email' && !isSocial) {
        var dlEmail = await client
          .from('downloads')
          .select('*')
          .ilike('email', email)
          .eq('auth_provider', 'email');
        if (!dlEmail.error) mergeDl(dlEmail.data);
        var dlLegacy = await client
          .from('downloads')
          .select('*')
          .ilike('email', email)
          .eq('is_member', true)
          .is('auth_provider', null);
        if (!dlLegacy.error) mergeDl(dlLegacy.data);
      } else if (provider !== 'email') {
        var dlSocial = await client
          .from('downloads')
          .select('*')
          .ilike('email', email)
          .eq('auth_provider', provider);
        if (!dlSocial.error) mergeDl(dlSocial.data);
      }
    }
    if (identityColsMissing && email && provider === 'email' && !isSocial) {
      var dlBare = await client.from('downloads').select('*').ilike('email', email).eq('is_member', true);
      if (!dlBare.error) mergeDl(dlBare.data);
    }

    return mapOrderRowsWithDownloads(orderRows, dlRows);
  }

  function filterLocalPurchases(local, email, authUserId, provider, isSocial) {
    var day = 86400000;
    provider = normalizeMemberProvider(provider || 'email');
    return (local || []).filter(function (p) {
      if (!p || typeof p !== 'object') return false;
      var pUid = p.authUserId || p.auth_user_id || null;
      var pProv = p.provider || p.auth_provider || null;
      if (pUid || pProv) {
        if (authUserId && pUid && pUid !== authUserId) return false;
        if (isSocial || provider !== 'email') {
          if (!pProv || normalizeMemberProvider(pProv) !== provider) return false;
          if (authUserId && pUid && pUid !== authUserId) return false;
          return true;
        }
        /* email account */
        if (pUid && authUserId && pUid !== authUserId) return false;
        if (pProv && normalizeMemberProvider(pProv) !== 'email') return false;
        return true;
      }
      /* Untagged local cache: only email-password may see (never social) */
      return provider === 'email' && !isSocial;
    }).map(function (p) {
      var id = p.sheetId != null && p.sheetId !== '' ? p.sheetId : p.id;
      var paidAt = Number(p.paidAt) || Date.now();
      return {
        id: id,
        sheetId: id,
        title: p.title || '',
        orderNo: p.orderNo,
        paidAt: paidAt,
        date: new Date(paidAt).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\. /g, '.').replace(/\.$/, ''),
        dday: 7 - Math.floor((Date.now() - paidAt) / day),
        authUserId: p.authUserId || p.auth_user_id || null,
        provider: p.provider || p.auth_provider || null,
      };
    }).filter(function (p) { return p.id != null && p.id !== ''; });
  }

  /* FO 마이페이지용 — 주문+다운로드를 구매 행으로 펼침 (identity-scoped) */
  async function purchasesForEmail(email, opts) {
    opts = opts || {};
    email = (email || opts.email || '').toLowerCase();
    var authUserId = opts.authUserId || opts.auth_user_id || null;
    var provider = opts.provider || opts.auth_provider || opts.authProvider || null;
    var isSocial =
      opts.fromOAuth === true ||
      opts.type === 'social' ||
      (!!provider && normalizeMemberProvider(provider) !== 'email');

    if (!email && !authUserId) return [];
    if (!live()) {
      var local = (window.Store && Store.purchases && Store.purchases.list()) || [];
      return filterLocalPurchases(local, email, authUserId, provider || 'email', isSocial);
    }

    if (isSocial && !provider) {
      console.warn('[CHODRUM] purchasesForEmail: social without provider');
      return [];
    }

    var orders = await ordersForMember({
      email: email,
      authUserId: authUserId,
      provider: provider || (isSocial ? null : 'email'),
      fromOAuth: opts.fromOAuth,
      type: opts.type || (isSocial ? 'social' : 'email'),
    });
    var out = [];
    orders.forEach(function (o) {
      (o.items || []).forEach(function (it) {
        var id = it.sheetId || it.id;
        out.push({
          id: id,
          sheetId: id,
          title: it.title || '',
          orderNo: o.orderNo,
          paidAt: o.createdAt || Date.now(),
          date: o.date,
          dday: typeof it.dday === 'number' ? it.dday : 7,
        });
      });
    });
    return out;
  }

  /* -------- members (provider-scoped; Kakao ≠ Naver by email) -------- */

  function normalizeMemberProvider(raw) {
    if (!raw) return 'email';
    var p = String(raw).toLowerCase();
    if (p === 'custom:naver' || p.indexOf('naver') !== -1 || raw === '네이버') return 'naver';
    if (p.indexOf('kakao') !== -1 || raw === '카카오') return 'kakao';
    if (p.indexOf('google') !== -1 || raw === '구글') return 'google';
    if (p === 'email' || p === 'email_password' || p === '이메일' || raw === '이메일') return 'email';
    if (p === 'social' || p === '소셜' || raw === '소셜') return 'social';
    return p;
  }

  async function getMemberByAuthUserId(authUserId) {
    if (!live() || !authUserId) return null;
    var res = await sb()
      .from('members')
      .select('*')
      .eq('auth_user_id', authUserId)
      .maybeSingle();
    if (res.error) {
      /* migration 009 미적용 시 컬럼 없음 */
      if (res.error.code === 'PGRST204' || /auth_user_id/.test(res.error.message || '')) {
        return null;
      }
      console.warn('[CHODRUM] member getByAuthUserId', res.error);
      return null;
    }
    return res.data || null;
  }

  /**
   * Lookup by contact email + provider.
   * Without provider, prefers email-password members (never treat Kakao as Naver).
   */
  async function getMemberByEmail(email, provider) {
    if (!live() || !email) return null;
    var q = sb().from('members').select('*').eq('email', email);
    var prov = provider != null ? normalizeMemberProvider(provider) : null;
    if (prov) {
      q = q.eq('auth_provider', prov);
    } else {
      q = q.eq('auth_provider', 'email');
    }
    var res = await q.maybeSingle();
    if (res.error) {
      /* auth_provider 컬럼 없음 → legacy email-only unique */
      if (res.error.code === 'PGRST204' || /auth_provider/.test(res.error.message || '')) {
        var legacy = await sb()
          .from('members')
          .select('*')
          .eq('email', email)
          .limit(1)
          .maybeSingle();
        if (legacy.error) {
          console.warn('[CHODRUM] member getByEmail', legacy.error);
          return null;
        }
        return legacy.data || null;
      }
      /* multiple rows without provider filter */
      if (res.error.code === 'PGRST116') {
        var any = await sb()
          .from('members')
          .select('*')
          .eq('email', email)
          .limit(1);
        if (any.error) {
          console.warn('[CHODRUM] member getByEmail', any.error);
          return null;
        }
        return (any.data && any.data[0]) || null;
      }
      console.warn('[CHODRUM] member getByEmail', res.error);
      return null;
    }
    if (res.data) return res.data;
    /* Legacy rows may lack auth_provider; only when provider omitted / email */
    if (!prov || prov === 'email') {
      var loose = await sb()
        .from('members')
        .select('*')
        .eq('email', email)
        .is('auth_provider', null)
        .limit(1);
      if (!loose.error && loose.data && loose.data[0]) return loose.data[0];
    }
    return null;
  }

  async function getMemberForProfile(profile) {
    if (!profile) return null;
    if (profile.authId) {
      var byId = await getMemberByAuthUserId(profile.authId);
      if (byId) return byId;
    }
    var provider = normalizeMemberProvider(profile.provider || profile.auth_provider || 'email');
    if (profile.email) {
      var byProv = await getMemberByEmail(profile.email, provider);
      if (byProv) return byProv;
      /*
       * Legacy FO rows used auth_type='소셜' without kakao/naver split.
       * Claim only unscoped orphans (auth_provider=social, no auth_user_id)
       * so the first returning provider keeps consent; the other must re-agree.
       */
      if (provider === 'kakao' || provider === 'naver' || provider === 'google') {
        var orphan = await getMemberByEmail(profile.email, 'social');
        if (orphan && !orphan.auth_user_id) return orphan;
      }
    }
    return null;
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
    var provider = normalizeMemberProvider(
      profile.auth_provider || profile.provider || (authType === '이메일' ? 'email' : 'social')
    );
    if (provider === 'kakao') authType = '카카오';
    else if (provider === 'naver') authType = '네이버';
    else if (provider === 'google') authType = '구글';
    else if (provider === 'email') authType = '이메일';

    var existing = null;
    try {
      existing = await getMemberForProfile(profile);
    } catch (e) {
      existing = null;
    }
    /* 정지 상태는 유지. 탈퇴 후 재가입(동의 완료 upsert)은 정상으로 복구 */
    var nextStatus = '정상';
    if (profile.status) nextStatus = profile.status;
    else if (existing && existing.status && existing.status !== '탈퇴') nextStatus = existing.status;
    var row = {
      name: profile.name,
      email: String(profile.email || '').trim().toLowerCase(),
      auth_type: authType,
      auth_provider: provider,
      status: nextStatus,
    };
    if (profile.authId) row.auth_user_id = profile.authId;
    if (Object.prototype.hasOwnProperty.call(profile, 'birth')) {
      row.birth = profile.birth ? String(profile.birth).replace(/\D/g, '').slice(0, 8) : null;
    }
    if (profile.terms_agreed_at) row.terms_agreed_at = profile.terms_agreed_at;
    if (profile.privacy_agreed_at) row.privacy_agreed_at = profile.privacy_agreed_at;
    if (Object.prototype.hasOwnProperty.call(profile, 'marketing_agreed_at')) {
      row.marketing_agreed_at = profile.marketing_agreed_at || null;
    }

    var res;
    /* Claim legacy 소셜 orphan onto this provider instead of inserting a duplicate */
    if (
      existing &&
      existing.id &&
      profile.authId &&
      (!existing.auth_user_id || existing.auth_provider === 'social')
    ) {
      res = await sb().from('members').update(row).eq('id', existing.id);
    } else if (profile.authId) {
      res = await sb().from('members').upsert(row, { onConflict: 'auth_user_id' });
      /* Same provider+email legacy row without auth_user_id → attach this Auth user */
      if (res.error && /provider_email|unique|duplicate/i.test(res.error.message || '')) {
        res = await sb().from('members').upsert(row, { onConflict: 'auth_provider,email' });
      }
    } else {
      res = await sb().from('members').upsert(row, { onConflict: 'email' });
    }
    /* migration 009 미적용: auth_user_id / auth_provider 컬럼 없음 → email upsert */
    if (
      res.error &&
      (res.error.code === 'PGRST204' ||
        /auth_user_id|auth_provider/.test(res.error.message || ''))
    ) {
      console.warn('[CHODRUM] members identity columns missing — upsert by email', res.error.message);
      delete row.auth_user_id;
      delete row.auth_provider;
      res = await sb().from('members').upsert(row, { onConflict: 'email' });
    }
    /* migration 002 미적용 시 동의 컬럼이 없어 PGRST204 → 기본 컬럼만 재시도 */
    if (res.error && res.error.code === 'PGRST204' && /agreed_at/.test(res.error.message || '')) {
      console.warn('[CHODRUM] members consent columns missing — upsert without them', res.error.message);
      delete row.terms_agreed_at;
      delete row.privacy_agreed_at;
      delete row.marketing_agreed_at;
      res = await sb().from('members').upsert(row, {
        onConflict: row.auth_user_id ? 'auth_user_id' : 'email',
      });
    }
    /* migration 010 미적용 시 birth 컬럼 없음 → 제외 후 재시도 */
    if (res.error && res.error.code === 'PGRST204' && /birth/.test(res.error.message || '')) {
      console.warn('[CHODRUM] members.birth missing — upsert without birth', res.error.message);
      delete row.birth;
      res = await sb().from('members').upsert(row, {
        onConflict: row.auth_user_id ? 'auth_user_id' : 'email',
      });
    }
    if (res.error) {
      console.warn('[CHODRUM] member upsert', res.error);
      var err = new Error(res.error.message || '회원 정보를 저장하지 못했어요.');
      err.supabase = res.error;
      throw err;
    }
    return profile;
  }

  async function updateMemberStatus(email, status) {
    if (!email || !status) return false;
    if (!live()) {
      (window.AdminData.members || []).forEach(function (m) {
        if (m.email === email) m.status = status;
      });
      return true;
    }
    var res = await sb().from('members').update({ status: status }).eq('email', email);
    if (res.error) {
      console.warn('[CHODRUM] member status', res.error);
      throw new Error(res.error.message || '회원 상태를 변경하지 못했어요.');
    }
    (window.AdminData.members || []).forEach(function (m) {
      if (m.email === email) m.status = status;
    });
    return true;
  }

  async function updateMemberProfile(profile) {
    if (!profile || !profile.email) return profile;
    var email = String(profile.email || '').trim().toLowerCase();
    if (!live()) {
      (window.AdminData.members || []).forEach(function (m) {
        if (String(m.email || '').toLowerCase() !== email) return;
        if (profile.name) m.name = profile.name;
        if (Object.prototype.hasOwnProperty.call(profile, 'birth')) m.birth = profile.birth || '';
      });
      return profile;
    }
    var patch = {};
    if (profile.name) patch.name = profile.name;
    if (Object.prototype.hasOwnProperty.call(profile, 'birth')) {
      patch.birth = profile.birth ? String(profile.birth).replace(/\D/g, '').slice(0, 8) : null;
    }
    if (!Object.keys(patch).length) return profile;
    var q = sb().from('members').update(patch);
    if (profile.authId) q = q.eq('auth_user_id', profile.authId);
    else q = q.eq('email', email);
    var res = await q;
    /* migration 010 미적용: birth 컬럼 없으면 name만 저장 */
    if (res.error && res.error.code === 'PGRST204' && /birth/.test(res.error.message || '')) {
      console.warn('[CHODRUM] members.birth missing — update name only', res.error.message);
      delete patch.birth;
      if (!Object.keys(patch).length) return profile;
      q = sb().from('members').update(patch);
      if (profile.authId) q = q.eq('auth_user_id', profile.authId);
      else q = q.eq('email', email);
      res = await q;
    }
    if (res.error) {
      console.warn('[CHODRUM] member profile', res.error);
      throw new Error(res.error.message || '회원 정보를 저장하지 못했어요.');
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
    NEW_SHEET_DAYS: NEW_SHEET_DAYS,
    isSheetNew: isSheetNew,
    parseYouTubeId: parseYouTubeId,
    youtubeEmbedUrl: youtubeEmbedUrl,
    youtubeWatchUrl: youtubeWatchUrl,
    youtubeThumbUrl: youtubeThumbUrl,
    youtubeEmbedBlockedOnHost: youtubeEmbedBlockedOnHost,
    youtubeCanEmbed: youtubeCanEmbed,
    sheets: {
      list: listSheets,
      upsert: upsertSheet,
      remove: deleteSheets,
      setStatus: setSheetStatus,
      uploadFile: uploadSheetFile,
    },
    featured: { save: saveFeatured },
    homePromo: { save: saveHomePromo },
    banners: { save: saveBanners, uploadImage: uploadBannerImage },
    orders: {
      create: createOrder,
      createPending: createPendingOrder,
      updateStatus: updateOrderStatus,
      forEmail: ordersForEmail,
      forMember: ordersForMember,
      purchasesForEmail: purchasesForEmail,
    },
    downloads: {
      signedPdfUrl: requestSignedPdfUrl,
    },
    edgeFnUrl: edgeFnUrl,
    members: {
      upsert: upsertMember,
      getByEmail: getMemberByEmail,
      getByAuthUserId: getMemberByAuthUserId,
      getForProfile: getMemberForProfile,
      hasConsent: memberHasConsent,
      updateStatus: updateMemberStatus,
      updateProfile: updateMemberProfile,
    },
  };

  window.ChodrumBoot = {
    whenReady: function (fn) {
      readyPromise.then(function () { fn(state); }).catch(function () { fn(state); });
    },
  };
})();
