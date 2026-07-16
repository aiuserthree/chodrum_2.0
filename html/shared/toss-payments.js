/**
 * CHODRUM — 토스페이먼츠(PG) 클라이언트 연동
 *
 * 흐름:
 *  1) FO-06 결제하기 → pendingOrder 저장 → 토스 결제창(또는 데모 창)
 *  2) 성공 → /payment/success?paymentKey&orderId&amount → 금액 검증 → 주문 확정 → FO-07
 *  3) 실패/취소 → /payment/fail?code&message&orderId → 장바구니 유지, 재시도
 *
 * 프로덕션 필수 (서버):
 *  - Secret Key 로 POST https://api.tosspayments.com/v1/payments/confirm
 *  - body: { paymentKey, orderId, amount }
 *  - 금액은 서버에 저장해 둔 pending 주문과 반드시 대조
 *  - 승인 성공 후에만 orders / downloads 생성
 *  → supabase/functions/toss-confirm 스텁 참고
 */
(function () {
  var PENDING_KEY = 'pendingOrder';
  var SDK_URL = 'https://js.tosspayments.com/v2/standard';
  var METHOD_LABEL = {
    card: '신용 / 체크카드',
    kakao: '카카오페이',
    naver: '네이버페이',
    bank: '계좌이체',
  };

  function cfg() {
    return window.CHODRUM_CONFIG || {};
  }

  function clientKey() {
    var k = (cfg().TOSS_CLIENT_KEY || '').trim();
    if (!k || k.indexOf('YOUR_') === 0) return '';
    return k;
  }

  function isDemoMode() {
    var mode = (cfg().TOSS_MODE || 'auto').toLowerCase();
    if (mode === 'demo') return true;
    if (mode === 'live') return false;
    return !clientKey();
  }

  function pages() {
    var F = window.FO && window.FO.PAGES;
    return {
      success: (F && F.paymentSuccess) || '/payment/success',
      fail: (F && F.paymentFail) || '/payment/fail',
      complete: (F && F.complete) || '/order-complete',
      checkout: (F && F.checkout) || '/checkout',
      cart: (F && F.cart) || '/cart',
    };
  }

  function originBase() {
    return location.origin;
  }

  function toast(msg) {
    if (window.FO && typeof window.FO.toast === 'function') window.FO.toast(msg);
    else console.warn('[CHODRUM PG]', msg);
  }

  /* ── pending order (결제 인증 전 임시 저장) ── */
  function getPending() {
    try {
      return Store.get(PENDING_KEY, null);
    } catch (e) {
      return null;
    }
  }

  function setPending(order) {
    Store.set(PENDING_KEY, order);
  }

  function clearPending() {
    Store.set(PENDING_KEY, null);
  }

  function customerKeyFor(order) {
    if (!order || order.guest) {
      return (window.TossPayments && window.TossPayments.ANONYMOUS) || 'ANONYMOUS';
    }
    var email = (order.email || 'member').toLowerCase().replace(/[^a-z0-9@._=-]/gi, '');
    var key = 'm_' + email;
    if (key.length < 2) key = 'm_guest';
    if (key.length > 50) key = key.slice(0, 50);
    return key;
  }

  function orderNameFrom(order) {
    var items = (order && order.items) || [];
    if (!items.length) return 'CHODRUM 악보';
    var t = items[0].title || '악보';
    if (items.length === 1) return t;
    return t + ' 외 ' + (items.length - 1) + '건';
  }

  function buildRequestPayload(order, payId) {
    var amount = Number(order.total) || 0;
    var base = {
      amount: { currency: 'KRW', value: amount },
      orderId: order.no,
      orderName: orderNameFrom(order),
      successUrl: originBase() + pages().success,
      failUrl: originBase() + pages().fail,
      customerEmail: order.email || undefined,
      customerName: order.buyer || undefined,
    };

    if (payId === 'bank') {
      base.method = 'TRANSFER';
      base.transfer = {
        cashReceipt: { type: '소득공제' },
        useEscrow: false,
      };
      return base;
    }

    /* 카드 / 카카오 / 네이버 → CARD 결제창 (간편결제는 DIRECT + easyPay) */
    base.method = 'CARD';
    if (payId === 'kakao') {
      base.card = { flowMode: 'DIRECT', easyPay: 'KAKAOPAY', useEscrow: false };
    } else if (payId === 'naver') {
      base.card = { flowMode: 'DIRECT', easyPay: 'NAVERPAY', useEscrow: false };
    } else {
      base.card = { flowMode: 'DEFAULT', useEscrow: false, useCardPoint: false };
    }
    return base;
  }

  function loadSdk() {
    if (window.TossPayments) return Promise.resolve(window.TossPayments);
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = SDK_URL;
      s.async = true;
      s.onload = function () {
        if (window.TossPayments) resolve(window.TossPayments);
        else reject(new Error('TossPayments SDK 로드 실패'));
      };
      s.onerror = function () {
        reject(new Error('TossPayments SDK를 불러오지 못했어요'));
      };
      document.head.appendChild(s);
    });
  }

  /* ── 데모 결제창 (키 없을 때 / TOSS_MODE=demo) ── */
  function openDemoCheckout(order, payId) {
    return new Promise(function (resolve) {
      var existing = document.getElementById('chodrum-pg-demo');
      if (existing) existing.remove();

      var wrap = document.createElement('div');
      wrap.id = 'chodrum-pg-demo';
      wrap.setAttribute('role', 'dialog');
      wrap.setAttribute('aria-modal', 'true');
      wrap.style.cssText =
        'position:fixed;inset:0;z-index:100;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px;';

      var box = document.createElement('div');
      box.style.cssText =
        'width:100%;max-width:400px;background:var(--color-paper-white,#fff);border-radius:12px;padding:24px;box-shadow:0 16px 48px rgba(0,0,0,.18);';

      var amount = Number(order.total) || 0;
      var methodLabel = METHOD_LABEL[payId] || METHOD_LABEL.card;

      box.innerHTML =
        '<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px">' +
        '<span style="font-size:16px;font-weight:600;letter-spacing:-0.3px">토스페이먼츠 · 테스트 결제</span>' +
        '<span style="font-size:11px;font-weight:600;padding:3px 8px;border-radius:999px;background:var(--status-warning-bg,#fff7e6);color:var(--status-warning,#b45309)">DEMO</span>' +
        '</div>' +
        '<p style="font-size:13px;line-height:1.55;color:var(--text-secondary,#666);margin:0 0 16px">' +
        'Client Key가 없거나 데모 모드예요. 실제 PG 창 대신 성공/취소를 시뮬레이션합니다.' +
        '</p>' +
        '<div style="padding:14px 16px;background:var(--surface-sunken,#f6f6f6);border-radius:10px;margin-bottom:18px">' +
        '<div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:8px"><span style="color:var(--text-secondary,#666)">주문번호</span><span class="ds-mono" style="font-size:12.5px">' +
        escapeHtml(order.no) +
        '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:13.5px;margin-bottom:8px"><span style="color:var(--text-secondary,#666)">결제 수단</span><span>' +
        escapeHtml(methodLabel) +
        '</span></div>' +
        '<div style="display:flex;justify-content:space-between;align-items:baseline"><span style="font-weight:600">결제 금액</span><span style="font-size:18px;font-weight:600;font-variant-numeric:tabular-nums">₩' +
        amount.toLocaleString('ko-KR') +
        '</span></div></div>' +
        '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button type="button" data-act="ok" style="height:48px;border:0;border-radius:10px;background:var(--color-ink,#171717);color:#fff;font-size:15px;font-weight:600;cursor:pointer">결제 완료 (성공)</button>' +
        '<button type="button" data-act="cancel" style="height:44px;border:1px solid var(--border-default,#eaeaea);border-radius:10px;background:transparent;font-size:14px;font-weight:500;cursor:pointer;color:var(--text-secondary,#666)">결제 취소</button>' +
        '</div>';

      wrap.appendChild(box);
      document.body.appendChild(wrap);

      function done(act) {
        wrap.remove();
        resolve(act);
      }

      box.querySelector('[data-act="ok"]').addEventListener('click', function () {
        done('success');
      });
      box.querySelector('[data-act="cancel"]').addEventListener('click', function () {
        done('cancel');
      });
      wrap.addEventListener('click', function (e) {
        if (e.target === wrap) done('cancel');
      });
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /**
   * 결제 요청 시작 (FO-06 doPay에서 호출)
   * @param {object} order — lastOrder와 동일 형태 + cartIds
   * @param {string} payId — card | kakao | naver | bank
   */
  async function requestCheckout(order, payId) {
    if (!order || !order.no) throw new Error('주문 정보가 없어요');
    var amount = Number(order.total) || 0;
    if (amount < 1) throw new Error('결제 금액이 올바르지 않아요');

    order.method = METHOD_LABEL[payId] || METHOD_LABEL.card;
    order.payId = payId || 'card';
    order.pg = 'tosspayments';
    order.pendingAt = Date.now();
    setPending(order);

    if (isDemoMode()) {
      var act = await openDemoCheckout(order, payId);
      if (act === 'success') {
        var demoKey = 'demo_pk_' + order.no.replace(/[^a-zA-Z0-9]/g, '');
        location.href =
          pages().success +
          '?paymentKey=' +
          encodeURIComponent(demoKey) +
          '&orderId=' +
          encodeURIComponent(order.no) +
          '&amount=' +
          encodeURIComponent(String(amount)) +
          '&paymentType=NORMAL&demo=1';
        return;
      }
      clearPending();
      location.href =
        pages().fail +
        '?code=PAY_PROCESS_CANCELED&message=' +
        encodeURIComponent('결제를 취소했어요') +
        '&orderId=' +
        encodeURIComponent(order.no);
      return;
    }

    var TossPayments = await loadSdk();
    var tossPayments = TossPayments(clientKey());
    var payment = tossPayments.payment({ customerKey: customerKeyFor(order) });
    var payload = buildRequestPayload(order, payId);

    try {
      await payment.requestPayment(payload);
    } catch (err) {
      /* 사용자가 창을 닫거나 SDK 오류 */
      var code = (err && (err.code || err.errorCode)) || 'PAY_ERROR';
      var message = (err && (err.message || err.msg)) || '결제 요청에 실패했어요';
      if (code === 'USER_CANCEL' || code === 'PAY_PROCESS_CANCELED' || /cancel/i.test(String(code))) {
        clearPending();
        toast('결제를 취소했어요. 장바구니는 그대로 유지돼요.');
        return;
      }
      clearPending();
      location.href =
        pages().fail +
        '?code=' +
        encodeURIComponent(code) +
        '&message=' +
        encodeURIComponent(message) +
        '&orderId=' +
        encodeURIComponent(order.no);
    }
  }

  /**
   * 성공 콜백 처리 — 금액 검증 후 주문 확정
   * 데모/프로토타입: Secret Key 없으므로 confirm API 생략하고 로컬·Supabase 주문만 생성
   * 프로덕션: 여기서 Edge Function 호출 → confirm 성공 시에만 finalize
   */
  async function handleSuccess(params) {
    var paymentKey = params.paymentKey;
    var orderId = params.orderId;
    var amount = Number(params.amount);
    var isDemo = params.demo === '1' || String(paymentKey || '').indexOf('demo_pk_') === 0;

    var pending = getPending();
    if (!pending || pending.no !== orderId) {
      return { ok: false, error: '결제 대기 주문을 찾을 수 없어요. 장바구니에서 다시 시도해주세요.' };
    }
    if (Number(pending.total) !== amount) {
      clearPending();
      return {
        ok: false,
        error: '결제 금액이 주문과 달라요. 보안을 위해 결제를 중단했어요. (금액 위변조 방지)',
      };
    }

    /* TODO(production): await confirmOnServer({ paymentKey, orderId, amount }) */
    var confirmed = await confirmPayment({ paymentKey: paymentKey, orderId: orderId, amount: amount, demo: isDemo });
    if (!confirmed.ok) {
      return { ok: false, error: confirmed.error || '결제 승인에 실패했어요' };
    }

    await finalizeOrder(pending, {
      paymentKey: paymentKey,
      paymentType: params.paymentType || 'NORMAL',
      demo: isDemo,
    });
    clearPending();
    return { ok: true, order: pending };
  }

  /**
   * 결제 승인 — 프로토타입은 클라이언트에서 스킵/모의 처리
   * Secret Key는 브라우저에 두면 안 되므로, 실서비스는 Edge Function 필수
   */
  async function confirmPayment(opts) {
    if (opts.demo) {
      return { ok: true, demo: true };
    }

    var confirmUrl = (cfg().TOSS_CONFIRM_URL || '').trim();
    if (confirmUrl) {
      try {
        var res = await fetch(confirmUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentKey: opts.paymentKey,
            orderId: opts.orderId,
            amount: opts.amount,
          }),
        });
        var body = await res.json().catch(function () {
          return {};
        });
        if (!res.ok) {
          return {
            ok: false,
            error: (body && (body.message || body.error)) || '결제 승인 API 오류 (' + res.status + ')',
          };
        }
        return { ok: true, data: body };
      } catch (e) {
        return { ok: false, error: (e && e.message) || '결제 승인 요청 실패' };
      }
    }

    /*
     * 정적 프로토타입: Secret Key 없이 인증(auth)까지만 완료된 상태.
     * 테스트 키로 결제창을 열었다면 실제 승인이 되지 않아 정산/입금은 없습니다.
     * 주문·다운로드는 UX 확인을 위해 로컬/Supabase에 기록합니다.
     */
    console.warn(
      '[CHODRUM PG] confirm API 미연동 — TOSS_CONFIRM_URL 또는 Edge Function toss-confirm 을 배포하세요. 지금은 인증 성공만으로 주문을 확정합니다.'
    );
    return { ok: true, skippedConfirm: true };
  }

  async function finalizeOrder(order, meta) {
    var member = !order.guest;
    var ids = order.cartIds || (order.items || []).map(function (it) {
      return it.id;
    });

    order.paymentKey = meta && meta.paymentKey;
    order.paymentType = meta && meta.paymentType;
    order.pgDemo = !!(meta && meta.demo);
    order.date =
      order.date ||
      new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });

    try {
      if (window.ChodrumAPI && ChodrumAPI.orders && ChodrumAPI.orders.create) {
        await ChodrumAPI.orders.create({
          no: order.no,
          buyer: order.buyer,
          email: order.email,
          member: member,
          method: order.method,
          status: '결제완료',
          total: order.total,
          items: order.items,
          authUserId: order.authUserId || order.auth_user_id || null,
          provider: order.provider || order.auth_provider || null,
          auth_provider: order.auth_provider || order.provider || null,
        });
      }
    } catch (e) {
      console.warn('[CHODRUM PG] orders.create', e);
      toast('주문 동기화에 실패했지만 로컬로 계속 진행해요');
    }

    Store.lastOrder.set(order);
    if (member) {
      Store.purchases.add(
        (order.items || []).map(function (it) {
          return {
            id: it.id,
            sheetId: it.id,
            title: it.title || '악보',
            orderNo: order.no,
            paidAt: Date.now(),
            authUserId: order.authUserId || order.auth_user_id || null,
            provider: order.provider || order.auth_provider || null,
          };
        })
      );
    } else {
      Store.guestOrders.add(order.email, {
        orderNo: order.no,
        date: order.date,
        items: (order.items || []).map(function (it) {
          return { id: it.id, sheetId: it.id, title: it.title || '악보', dday: 7 };
        }),
      });
    }
    if (ids && ids.length) Store.cart.remove(ids);
  }

  function handleFail(params) {
    /* 실패 시 pending 제거 — 장바구니는 건드리지 않음 */
    var pending = getPending();
    if (pending && (!params.orderId || pending.no === params.orderId)) {
      clearPending();
    }
    return {
      code: params.code || 'UNKNOWN',
      message: params.message || '결제에 실패했어요',
      orderId: params.orderId || (pending && pending.no) || '',
    };
  }

  window.ChodrumPayments = {
    METHOD_LABEL: METHOD_LABEL,
    isDemoMode: isDemoMode,
    clientKey: clientKey,
    getPending: getPending,
    setPending: setPending,
    clearPending: clearPending,
    requestCheckout: requestCheckout,
    handleSuccess: handleSuccess,
    handleFail: handleFail,
    pages: pages,
  };
})();
