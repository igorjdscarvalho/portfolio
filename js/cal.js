/* Agendamento próprio, ligado à API pública do Cal.com (sem iframe, sem chave de API).
   - horários:  GET  https://api.cal.com/v2/slots     (cal-api-version 2024-09-04)
   - reserva:   POST https://api.cal.com/v2/bookings  (cal-api-version 2026-02-25)
   Para trocar o evento, mexa só em CFG. Visual: css/cal.css. Textos em inglês: dicionário em js/i18n.js. */
(function () {
  'use strict';
  var host = document.getElementById('cal-app');
  if (!host) return;

  var CFG = {
    eventTypeId: 7806199,
    minutes: 30,                      /* duração exibida (confira no Cal.com) */
    place: 'Google Meet',
    fallback: 'https://cal.com/igorcarvalho/conversa-de-25-min',
    slotsV: '2024-09-04',
    bookV: '2026-02-25',
    api: 'https://api.cal.com/v2',
    monthsAhead: 3,
    workerApi: 'https://igor-cal-booking.igorjdscarvalho.workers.dev' /* Endpoint publicado no Cloudflare. */
  };

  /* ---------- utilidades ---------- */
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (k === 'class') e.className = attrs[k];
      else if (k === 'text') e.textContent = attrs[k];
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== false && attrs[k] != null) e.setAttribute(k, attrs[k] === true ? '' : attrs[k]);
    }
    (kids || []).forEach(function (c) { if (c) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function loc() { return document.documentElement.lang === 'en' ? 'en-US' : 'pt-BR'; }
  function T(s) { return (window.I18N && window.I18N.t) ? window.I18N.t(s) : s; }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function key(y, m, d) { return y + '-' + pad(m + 1) + '-' + pad(d); }

  var browserTz = 'America/Sao_Paulo';
  try { browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone || browserTz; } catch (e) {}

  var now = new Date();
  var S = {
    tz: 'America/Sao_Paulo',
    hour12: false,
    year: now.getFullYear(), month: now.getMonth(),
    slots: {},            /* 'YYYY-MM-DD' -> [ISO,...] */
    loading: false, error: false,
    day: null, slot: null,
    step: 'pick',         /* pick | form | done */
    sending: false, formError: '', done: null, rescheduleOffer: null, formEmail: '', wasRescheduled: false,
    event: null, eventError: '',
    cache: {}
  };
  var todayKey = key(now.getFullYear(), now.getMonth(), now.getDate());
  var reqId = 0;

  /* ---------- API ---------- */
  function loadMonth() {
    var y = S.year, m = S.month, ck = S.tz + '|' + y + '-' + m;
    if (S.cache[ck]) { S.slots = S.cache[ck]; S.loading = false; S.error = false; render(); return; }
    var id = ++reqId;
    S.loading = true; S.error = false; S.slots = {}; render();
    var last = new Date(y, m + 1, 0).getDate();
    var url = CFG.api + '/slots?eventTypeId=' + CFG.eventTypeId +
      '&start=' + key(y, m, 1) + '&end=' + key(y, m, last) + '&timeZone=' + encodeURIComponent(S.tz);
    fetch(url, { headers: { 'cal-api-version': CFG.slotsV } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) {
        if (id !== reqId) return;
        var out = {}, data = (j && j.data) || {};
        Object.keys(data).forEach(function (d) {
          var list = (data[d] || []).map(function (x) { return x.start; }).filter(Boolean);
          if (list.length) out[d] = list;
        });
        S.cache[ck] = out; S.slots = out; S.loading = false; render();
      })
      .catch(function () { if (id !== reqId) return; S.loading = false; S.error = true; render(); });
  }

  function loadEventConfig() {
    if (!CFG.workerApi || CFG.workerApi.indexOf('YOUR-WORKER') >= 0) { S.eventError = 'A integração dinâmica precisa da URL do endpoint serverless.'; render(); return; }
    fetch(CFG.workerApi.replace(/\/$/, '') + '/event-type')
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (j) { if (!j || !j.data || !Array.isArray(j.data.bookingFields)) throw new Error('Invalid event configuration'); S.event = j.data; if (j.data.lengthInMinutes != null && Number.isFinite(Number(j.data.lengthInMinutes))) CFG.minutes = Number(j.data.lengthInMinutes); S.eventError = ''; render(); })
      .catch(function () { S.eventError = 'Não foi possível carregar os campos configurados no Cal.com.'; render(); });
  }

  function submitBooking(attendee, responses, guests) {
    S.sending = true; S.formError = ''; render();
    var body = { eventTypeId: CFG.eventTypeId, start: new Date(S.slot).toISOString(), attendee: attendee };
    if (Object.keys(responses).length) body.bookingFieldsResponses = responses;
    if (guests.length) body.guests = guests;
    fetch(CFG.workerApi.replace(/\/$/, '') + '/bookings', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }, function () { return { ok: r.ok, status: r.status, j: null }; }); })
      .then(function (res) {
        S.sending = false;
        if (res.ok) { S.step = 'done'; S.done = { email: attendee.email }; S.cache = {}; render(); return; }
        if (res.status === 409 && res.j && res.j.code === 'ACTIVE_BOOKING_EXISTS' && res.j.existingBooking) {
          S.rescheduleOffer = res.j.existingBooking; S.formError = ''; render(); return;
        }
        if (res.status === 409 || res.status === 400) {
          S.formError = 'Esse horário acabou de ser ocupado ou algum campo precisa ser revisto. Confira os dados e escolha novamente.';
          S.cache = {}; S.step = 'pick'; S.slot = null; loadMonth(); return;
        }
        S.formError = 'Não consegui concluir o agendamento. Tente de novo ou use o link direto.'; render();
      })
      .catch(function () { S.sending = false; S.formError = 'Sem conexão com o agendamento. Tente de novo ou use o link direto.'; render(); });
  }

  function rescheduleBooking() {
    if (!S.rescheduleOffer || S.sending) return;
    S.sending = true; S.formError = ''; render();
    fetch(CFG.workerApi.replace(/\/$/, '') + '/bookings/' + encodeURIComponent(S.rescheduleOffer.uid) + '/reschedule', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: S.formEmail, start: new Date(S.slot).toISOString() })
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, status: r.status, j: j }; }, function () { return { ok: r.ok, status: r.status, j: null }; }); })
      .then(function (res) {
        S.sending = false;
        if (res.ok) { S.rescheduleOffer = null; S.wasRescheduled = true; S.step = 'done'; S.done = { email: S.formEmail }; S.cache = {}; render(); return; }
        S.formError = 'Não foi possível reagendar essa reserva. Ela pode ter sido alterada ou cancelada. Atualize os horários e tente novamente.'; render();
      })
      .catch(function () { S.sending = false; S.formError = 'Sem conexão com o Cal.com. Tente novamente.'; render(); });
  }

  /* ---------- formatação ---------- */
  function fmtTime(iso) {
    return new Intl.DateTimeFormat(loc(), { hour: '2-digit', minute: '2-digit', hour12: S.hour12, timeZone: S.tz }).format(new Date(iso));
  }
  function fmtDayLong(k) {
    var p = k.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
    return new Intl.DateTimeFormat(loc(), { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(d);
  }
  function fmtDayShort(k) {
    var p = k.split('-'), d = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12));
    return new Intl.DateTimeFormat(loc(), { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(d);
  }
  function monthLabel() {
    return new Intl.DateTimeFormat(loc(), { month: 'long', year: 'numeric' }).format(new Date(S.year, S.month, 1));
  }
  function tzLabel(z) { return z.replace(/_/g, ' ').replace('/', ' / '); }
  var countries = [
    ['BR','🇧🇷','+55','Brasil'],['US','🇺🇸','+1','Estados Unidos'],['PT','🇵🇹','+351','Portugal'],['GB','🇬🇧','+44','Reino Unido'],
    ['AR','🇦🇷','+54','Argentina'],['CL','🇨🇱','+56','Chile'],['CO','🇨🇴','+57','Colômbia'],['MX','🇲🇽','+52','México'],
    ['CA','🇨🇦','+1','Canadá'],['ES','🇪🇸','+34','Espanha'],['FR','🇫🇷','+33','França'],['DE','🇩🇪','+49','Alemanha'],
    ['IT','🇮🇹','+39','Itália'],['AU','🇦🇺','+61','Austrália'],['JP','🇯🇵','+81','Japão'],['IN','🇮🇳','+91','Índia']
  ];
  function phoneValue(country, number) { return country[2] + number.replace(/\D/g, ''); }
  function phoneLengthOk(country, number) {
    var n = number.replace(/\D/g, ''), min = { BR: 10, US: 10, CA: 10, PT: 9, GB: 10, ES: 9, FR: 9, AU: 9, JP: 9, IN: 10 }[country[0]] || 7;
    return n.length >= min && n.length + country[2].replace(/\D/g, '').length <= 15;
  }
  function zones() {
    var list = [];
    try { list = Intl.supportedValuesOf('timeZone'); } catch (e) {}
    if (!list.length) list = ['America/Sao_Paulo', 'America/Manaus', 'America/New_York', 'America/Los_Angeles', 'Europe/Lisbon', 'Europe/London', 'Europe/Madrid', 'Europe/Paris', 'Asia/Tokyo', 'UTC'];
    if (list.indexOf(S.tz) < 0) list = [S.tz].concat(list);
    return list;
  }

  /* ---------- partes da interface ---------- */
  function meta() {
    var sel = h('select', { class: 'cal-tz-select mono', 'aria-label': 'Fuso horário', onchange: function (e) { S.tz = e.target.value; S.day = null; S.slot = null; S.step = 'pick'; loadMonth(); } },
      zones().map(function (z) { return h('option', { value: z, text: tzLabel(z), selected: z === S.tz }); }));
    var tz = h('label', { class: 'cal-tool-wrap', title: 'Fuso horário' }, [
      h('span', { class: 'cal-sr', text: 'Fuso horário' }),
      h('button', { type: 'button', class: 'cal-tool', 'aria-label': 'Selecionar fuso horário', text: '◷', onclick: function () { sel.focus(); sel.click(); } }), sel
    ]);
    var clock = h('button', { type: 'button', class: 'cal-tool', 'aria-label': 'Alternar formato de hora', title: S.hour12 ? 'Usar formato 24 horas' : 'Usar formato 12 horas', text: S.hour12 ? '24h' : '12h', onclick: function () {
      var form = host.querySelector('.cal-f'), values = [], checked = [];
      if (form) {
        Array.prototype.forEach.call(form.querySelectorAll('input:not([type=checkbox]), textarea'), function (el) { values.push(el.value); });
        Array.prototype.forEach.call(form.querySelectorAll('input[type=checkbox],input[type=radio]'), function (el) { checked.push(el.checked); });
      }
      S.hour12 = !S.hour12; render();
      form = host.querySelector('.cal-f');
      if (form) {
        Array.prototype.forEach.call(form.querySelectorAll('input:not([type=checkbox]), textarea'), function (el, i) { el.value = values[i] || ''; });
        Array.prototype.forEach.call(form.querySelectorAll('input[type=checkbox],input[type=radio]'), function (el, i) { el.checked = !!checked[i]; });
      }
    } });
    return h('div', { class: 'cal-meta mono' }, [
      h('span', { text: CFG.minutes + ' min' }),
      h('span', { text: CFG.place }),
      h('div', { class: 'cal-tools' }, [tz, clock])
    ]);
  }

  function calendar() {
    var first = new Date(S.year, S.month, 1), days = new Date(S.year, S.month + 1, 0).getDate();
    var offset = first.getDay();             /* 0 = domingo */
    var cm = now.getFullYear() * 12 + now.getMonth(), vm = S.year * 12 + S.month;
    var prev = h('button', { type: 'button', class: 'cal-nav', 'aria-label': 'Mês anterior', text: '←', disabled: vm <= cm,
      onclick: function () { if (S.month === 0) { S.month = 11; S.year--; } else S.month--; S.day = null; S.slot = null; loadMonth(); } });
    var next = h('button', { type: 'button', class: 'cal-nav', 'aria-label': 'Próximo mês', text: '→', disabled: vm >= cm + CFG.monthsAhead,
      onclick: function () { if (S.month === 11) { S.month = 0; S.year++; } else S.month++; S.day = null; S.slot = null; loadMonth(); } });
    var head = h('div', { class: 'cal-mh' }, [h('b', { class: 'mono', text: monthLabel() }), h('span', { class: 'cal-navs' }, [prev, next])]);

    var wd = h('div', { class: 'cal-wd mono', 'aria-hidden': 'true' });
    for (var i = 0; i < 7; i++) {
      wd.appendChild(h('span', { text: new Intl.DateTimeFormat(loc(), { weekday: 'narrow', timeZone: 'UTC' }).format(new Date(Date.UTC(2023, 0, 1 + i))) }));
    }
    var grid = h('div', { class: 'cal-grid', role: 'grid' });
    for (var b = 0; b < offset; b++) grid.appendChild(h('span', { class: 'cal-e' }));
    for (var d = 1; d <= days; d++) {
      (function (d) {
        var k = key(S.year, S.month, d), has = !!S.slots[k] && k >= todayKey;
        var cls = 'cal-d mono' + (k === S.day ? ' on' : '') + (k === todayKey ? ' td' : '') + (has ? ' av' : '');
        grid.appendChild(h('button', {
          type: 'button', class: cls, text: String(d), disabled: !has,
          'aria-pressed': k === S.day ? 'true' : 'false', 'aria-label': fmtDayLong(k),
          onclick: function () { S.day = k; S.slot = null; render(); }
        }));
      })(d);
    }
    return h('div', { class: 'cal-c' }, [head, wd, grid]);
  }

  function slotsCol() {
    var col = h('div', { class: 'cal-s' });
    if (S.loading) { col.appendChild(h('p', { class: 'cal-msg mono', text: 'Carregando horários…' })); return col; }
    if (S.error) {
      col.appendChild(h('p', { class: 'cal-msg mono', text: 'Não foi possível carregar os horários.' }));
      col.appendChild(h('button', { type: 'button', class: 'cal-link mono', text: 'Tentar de novo', onclick: loadMonth }));
      col.appendChild(h('a', { class: 'cal-link mono', href: CFG.fallback, target: '_blank', rel: 'noopener', text: 'Abrir agenda ↗' }));
      return col;
    }
    if (!S.day) {
      var any = Object.keys(S.slots).length;
      col.appendChild(h('p', { class: 'cal-msg mono', text: any ? 'Escolha um dia' : 'Sem horários neste mês' }));
      return col;
    }
    col.appendChild(h('p', { class: 'cal-sd mono', text: fmtDayShort(S.day) }));
    var list = h('div', { class: 'cal-sl' });
    (S.slots[S.day] || []).forEach(function (iso) {
      list.appendChild(h('button', { type: 'button', class: 'cal-t mono', text: fmtTime(iso), onclick: function () { S.slot = iso; S.step = 'form'; S.formError = ''; render(); } }));
    });
    col.appendChild(list);
    return col;
  }

  function fieldKey(f) { return f.slug || f.field || f.name || 'custom'; }
  function fieldType(f) { return String(f.type || f.variant || f.fieldType || '').toLowerCase(); }
  function fieldOptions(f) {
    var raw = f.options || f.variants || f.selectOptions || [];
    if (raw && !Array.isArray(raw) && Array.isArray(raw.options)) raw = raw.options;
    if (typeof raw === 'string') raw = raw.split(',').map(function (x) { return x.trim(); }).filter(Boolean);
    if (raw && !Array.isArray(raw) && typeof raw === 'object') raw = Object.keys(raw).map(function (key) { return { value: key, label: raw[key] }; });
    if (!Array.isArray(raw)) return [];
    return raw.map(function (o) {
      if (typeof o === 'string' || typeof o === 'number') return { value: String(o), label: String(o) };
      var value = o.value != null ? o.value : (o.id != null ? o.id : (o.slug != null ? o.slug : (o.label || o.name || '')));
      return { value: String(value), label: String(o.label || o.name || value) };
    }).filter(function (o) { return o.value !== ''; });
  }
  function isRequired(f) { return f.required === true || f.required === 'true' || f.isRequired === true; }
  function isMulti(f) { var t = fieldType(f); return t.indexOf('checkbox') >= 0 || t.indexOf('multiselect') >= 0 || t.indexOf('multi-select') >= 0; }
  function kindOfField(f) {
    var k = String(fieldKey(f)).toLowerCase(), nativeField = String(f.field || '').toLowerCase(), type = fieldType(f);
    if (nativeField === 'name' || k === 'name' || type === 'fullname') return 'name';
    if (nativeField === 'email' || k === 'email') return 'email';
    if (k.indexOf('phone') >= 0 || nativeField.indexOf('phone') >= 0 || type.indexOf('phone') >= 0) return 'phone';
    return 'other';
  }
  function isInternalField(f) {
    var k = String(fieldKey(f)).toLowerCase(), n = String(f.field || '').toLowerCase();
    return ['location','notes','reschedulereason','guests'].indexOf(k) >= 0 || ['location','notes','reschedulereason','guests'].indexOf(n) >= 0;
  }
  function renderField(f, responseEls) {
    var k = fieldKey(f), type = fieldType(f), options = fieldOptions(f), kind = kindOfField(f);
    var label = kind === 'name' ? 'Seu nome' : (kind === 'email' ? 'Seu e-mail' : (kind === 'phone' ? 'Telefone' : (f.label || f.name || k)));
    var req = isRequired(f), core = kind === 'name', email = kind === 'email', phone = kind === 'phone';
    var ctrl, wrapper;
    if (isMulti(f) && options.length) {
      ctrl = h('fieldset', { class: 'cal-service-field cal-dynamic-multi', 'data-response-key': k, 'data-required': req });
      ctrl.appendChild(h('legend', { text: label + (req ? ' *' : '') }));
      var grid = h('div', { class: 'cal-services' });
      options.forEach(function (o) {
        var cb = h('input', { type: 'checkbox', value: o.value, name: 'cal-' + k });
        grid.appendChild(h('label', { class: 'cal-service' }, [cb, h('span', { text: o.label })]));
      });
      ctrl.appendChild(grid); responseEls.push({ key: k, kind: 'multi', node: ctrl, required: req }); return ctrl;
    }
    if (options.length && (type.indexOf('select') >= 0 || type.indexOf('dropdown') >= 0 || type.indexOf('radio') >= 0)) {
      if (type.indexOf('radio') >= 0) {
        ctrl = h('fieldset', { class: 'cal-service-field cal-dynamic-choice', 'data-response-key': k, 'data-required': req });
        ctrl.appendChild(h('legend', { text: label + (req ? ' *' : '') }));
        options.forEach(function (o) {
          var radio = h('input', { type: 'radio', value: o.value, name: 'cal-' + k, required: req });
          ctrl.appendChild(h('label', { class: 'cal-service' }, [radio, h('span', { text: o.label })]));
        });
        responseEls.push({ key: k, kind: 'radio', node: ctrl, required: req }); return ctrl;
      }
      ctrl = h('select', { name: 'cal-' + k, required: req, 'data-response-key': k, class: 'cal-dynamic-input' }, [h('option', { value: '', text: 'Selecione ' + label, disabled: true, selected: true })]);
      options.forEach(function (o) { ctrl.appendChild(h('option', { value: o.value, text: o.label })); });
      responseEls.push({ key: k, kind: 'value', node: ctrl, required: req });
    } else if (phone) {
      var country = h('select', { name: 'cal-country-' + k, class: 'cal-country', 'aria-label': label + ' — país e código' }, countries.map(function (c) { return h('option', { value: c[0], text: c[1] + ' ' + c[2], selected: c[0] === 'BR' }); }));
      ctrl = h('input', { name: 'cal-' + k, type: 'tel', autocomplete: 'tel-national', inputmode: 'tel', placeholder: f.placeholder || '(11) 99999-9999', required: req, 'data-response-key': k, class: 'cal-dynamic-input' });
      wrapper = h('div', { class: 'cal-phone' }, [country, ctrl]);
      responseEls.push({ key: k, kind: 'phone', node: ctrl, country: country, required: req });
      return h('label', { class: 'cal-dynamic-field' }, [h('span', { text: label + (req ? ' *' : '') }), wrapper]);
    } else {
      var inputType = email ? 'email' : (type.indexOf('number') >= 0 ? 'number' : 'text');
      if (type.indexOf('textarea') >= 0 || type.indexOf('long') >= 0) ctrl = h('textarea', { name: 'cal-' + k, rows: '3', placeholder: f.placeholder || '', required: req, 'data-response-key': k, class: 'cal-dynamic-input' });
      else ctrl = h('input', { name: 'cal-' + k, type: inputType, placeholder: f.placeholder || '', autocomplete: core ? 'name' : (email ? 'email' : 'off'), required: req, 'data-response-key': k, class: 'cal-dynamic-input' });
      responseEls.push({ key: k, kind: core ? 'name' : (email ? 'email' : 'value'), node: ctrl, required: req });
    }
    return h('label', { class: 'cal-dynamic-field' }, [h('span', { text: label + (req ? ' *' : '') }), ctrl]);
  }

  function formView() {
    var responseEls = [], fields = (S.event && S.event.bookingFields) || [];
    if (!fields.length) return h('div', { class: 'cal-event-state' }, [
      h('p', { class: 'cal-msg mono', text: S.eventError || 'Carregando os campos configurados no Cal.com…' }),
      S.eventError ? h('a', { class: 'cal-link mono', href: CFG.fallback, target: '_blank', rel: 'noopener', text: 'Abrir agenda Cal.com ↗' }) : null
    ]);
    var visibleFields = fields.filter(function (f) { return !f.hidden && !f.isHidden && !isInternalField(f); });
    visibleFields.sort(function (a, b) { var order = { name: 0, email: 1, phone: 2, other: 3 }; return order[kindOfField(a)] - order[kindOfField(b)]; });
    var identityFields = visibleFields.filter(function (f) { var k = kindOfField(f); return k === 'name' || k === 'email'; });
    var phoneFields = visibleFields.filter(function (f) { return kindOfField(f) === 'phone'; });
    var otherFields = visibleFields.filter(function (f) { return kindOfField(f) === 'other'; });
    var identityControls = identityFields.map(function (f) { return renderField(f, responseEls); });
    var phoneControls = phoneFields.map(function (f) { return renderField(f, responseEls); });
    var otherControls = otherFields.map(function (f) { return renderField(f, responseEls); });
    var guestList = [], guestInput = h('input', { type: 'email', autocomplete: 'email', placeholder: 'nome@exemplo.com' });
    var guestListInput = h('textarea', { rows: '3', placeholder: 'Cole os e-mails separados por vírgulas ou linhas' });
    var guestTags = h('div', { class: 'cal-guest-tags' });
    var singleGuestPanel = h('div', { class: 'cal-guest-panel', hidden: true }, [guestInput, h('button', { type: 'button', class: 'cal-guest-add-btn', text: 'Adicionar', onclick: function () { addGuest(guestInput.value); } })]);
    var listGuestPanel = h('div', { class: 'cal-guest-panel', hidden: true }, [guestListInput, h('button', { type: 'button', class: 'cal-guest-add-btn cal-guest-list-btn', text: 'Adicionar lista', onclick: function () { addGuest(guestListInput.value); } })]);
    var addGuest = function (raw) {
      var values = raw.split(/[\s,;]+/).map(function (x) { return x.trim(); }).filter(Boolean);
      values.forEach(function (v) { if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v) && guestList.indexOf(v) < 0) guestList.push(v); });
      guestInput.value = ''; guestListInput.value = ''; guestTags.replaceChildren.apply(guestTags, guestList.map(function (v) { return h('button', { type: 'button', class: 'cal-guest-tag', text: v + ' ×', 'aria-label': 'Remover ' + v, onclick: function () { guestList = guestList.filter(function (x) { return x !== v; }); addGuest(''); } }); }));
    };
    var guestOptions;
    var guests = S.event.allowGuests ? h('div', { class: 'cal-guest-block' }, [
      h('button', { type: 'button', class: 'cal-add-guests', text: '＋ Adicionar participantes', onclick: function () { guestOptions.hidden = !guestOptions.hidden; } }),
      guestOptions = h('div', { class: 'cal-guest-options', hidden: true }, [
        h('div', { class: 'cal-guest-modes' }, [
          h('button', { type: 'button', class: 'cal-guest-mode', text: 'Adicionar um e-mail', onclick: function () { singleGuestPanel.hidden = false; listGuestPanel.hidden = true; } }),
          h('button', { type: 'button', class: 'cal-guest-mode', text: 'Adicionar uma lista', onclick: function () { listGuestPanel.hidden = false; singleGuestPanel.hidden = true; } })
        ]), singleGuestPanel, listGuestPanel, guestTags
      ])
    ]) : null;
    var err = h('p', { class: 'cal-err', role: 'alert', text: S.formError ? T(S.formError) : '' });
    var form = h('form', { class: 'cal-f', novalidate: true, onsubmit: function (e) {
      e.preventDefault();
      var attendee = { timeZone: S.tz }, responses = {};
      for (var i = 0; i < responseEls.length; i++) {
        var r = responseEls[i], value;
        if (r.kind === 'multi') value = Array.prototype.map.call(r.node.querySelectorAll('input:checked'), function (x) { return x.value; });
        else if (r.kind === 'radio') { var picked = r.node.querySelector('input:checked'); value = picked ? picked.value : ''; }
        else if (r.kind === 'phone') {
          var c = countries.filter(function (x) { return x[0] === r.country.value; })[0] || countries[0];
          if (r.required && !phoneLengthOk(c, r.node.value)) { err.textContent = T('Informe um telefone válido com DDD.'); r.node.focus(); return; }
          value = r.node.value.trim() ? phoneValue(c, r.node.value) : '';
        } else value = r.node.value.trim();
        var empty = Array.isArray(value) ? !value.length : !String(value || '').trim();
        if (r.required && empty) { err.textContent = 'Preencha o campo obrigatório: ' + (r.node.closest('label,fieldset').querySelector('span,legend').textContent || r.key); var first = r.node.querySelector && r.node.querySelector('input') || r.node; if (first.focus) first.focus(); return; }
        if (r.kind === 'name') attendee.name = value;
        else if (r.kind === 'email') attendee.email = value;
        else if (r.kind === 'phone' && value) attendee.phoneNumber = value;
        else responses[r.key] = value;
      }
      addGuest(guestListInput.value || guestInput.value);
      if (attendee.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(attendee.email)) { err.textContent = T('Preencha seu nome e um e-mail válido.'); return; }
      S.formEmail = attendee.email;
      submitBooking(attendee, responses, guestList);
    } }, [
      h('div', { class: 'cal-sum mono' }, [
        h('button', { type: 'button', class: 'cal-back', 'aria-label': 'Voltar', text: '←', onclick: function () { S.step = 'pick'; S.slot = null; render(); } }),
        h('span', { text: fmtDayShort(S.day) + ' · ' + fmtTime(S.slot) }),
        h('span', { class: 'cal-mut', text: CFG.minutes + ' min · ' + CFG.place })
      ]),
      ].concat(identityControls, [guests], phoneControls, otherControls, [err,
      S.rescheduleOffer ? h('div', { class: 'cal-reschedule-offer' }, [
        h('p', { text: 'Você já tem uma reserva para este evento em ' + new Intl.DateTimeFormat(loc(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: S.hour12, timeZone: S.tz }).format(new Date(S.rescheduleOffer.start)) + '. Deseja reagendar para o horário selecionado?' }),
        h('button', { type: 'button', class: 'btn a', disabled: S.sending, text: S.sending ? 'Reagendando…' : 'Sim, reagendar →', onclick: rescheduleBooking }),
        h('button', { type: 'button', class: 'cal-keep-booking', disabled: S.sending, text: 'Manter agendamento atual', onclick: function () { S.rescheduleOffer = null; S.formError = ''; S.step = 'pick'; S.day = null; S.slot = null; render(); } })
      ]) : null,
      S.rescheduleOffer ? null : h('button', { type: 'submit', class: 'btn a', disabled: S.sending, text: S.sending ? 'Agendando…' : 'Confirmar agendamento →' })
    ]));
    return form;
  }

  function doneView() {
    return h('div', { class: 'cal-ok' }, [
      h('div', { class: 'mono cal-okt', text: S.wasRescheduled ? '✓ Reagendado' : '✓ Agendado' }),
      h('p', { class: 'cal-okd', text: fmtDayLong(S.day) + ' · ' + fmtTime(S.slot) }),
      h('p', { class: 'cal-mut', text: T('Enviamos a confirmação com o link do Google Meet para') + ' ' + S.done.email + '.' }),
      h('button', { type: 'button', class: 'cal-link mono', text: S.wasRescheduled ? 'Voltar ao calendário' : 'Agendar outro horário', onclick: function () { S.step = 'pick'; S.day = null; S.slot = null; S.done = null; S.wasRescheduled = false; loadMonth(); } })
    ]);
  }

  function render() {
    var kids;
    if (S.step === 'done') kids = [doneView()];
    else if (S.step === 'form') kids = [meta(), formView()];
    else {
      kids = [meta()];
      if (S.formError) kids.push(h('p', { class: 'cal-err', role: 'alert', text: T(S.formError) }));
      kids.push(h('div', { class: 'cal-body' }, [calendar(), slotsCol()]));
    }
    host.replaceChildren.apply(host, kids);
  }

  addEventListener('langchange', render);

  /* só chama a API quando a seção Contato está perto da tela */
  var started = false;
  function start() { if (started) return; started = true; loadMonth(); }
  render();
  loadEventConfig();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { io.disconnect(); start(); } }, { rootMargin: '500px 0px' });
    io.observe(host);
  } else start();
})();
