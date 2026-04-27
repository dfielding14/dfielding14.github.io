(() => {
  const config = window.LEDGER_CONFIG || {};
  const hasSupabaseConfig = Boolean(config.supabaseUrl && config.supabaseAnonKey);
  const sessionKey = 'the-ledger-session-v1';
  const localStoreKey = 'the-ledger-local-store-v1';
  const epithetKey = 'the-ledger-page-epithet-v1';

  const templateHelp = {
    binary: 'Example: This event happens by the close date. Resolution is yes/no using the source of truth below.',
    pooled_binary: 'Example: Yes and No backers each add their own stake. The winning side splits the losing pool in proportion to each winner\'s stake.',
    multiple_choice: 'Example: Outcome is one of A, B, C, or D. Define how ties, delays, and ambiguous results resolve.',
    metric: 'Example: The measured value crosses, stays above, stays below, or lands inside a range by the close date.',
    date: 'Example: The condition remains true until a date, happens before a date, or lasts for a defined duration.',
    custom: 'Write the contract in plain English. Include what counts, what does not, and who adjudicates weirdness.'
  };

  const labels = {
    binary: 'Binary',
    pooled_binary: 'Pooled yes/no',
    multiple_choice: 'Multiple choice',
    metric: 'Metric',
    date: 'Date',
    custom: 'Custom',
    open: 'Open',
    proposed: 'Proposed',
    accepted: 'Accepted',
    agreed: 'Agreed',
    countered: 'Countered',
    withdrawn: 'Withdrawn',
    settled: 'Settled',
    voided: 'Voided',
    unpaid: 'Unpaid',
    partially_paid: 'Partially paid',
    paid: 'Paid',
    not_applicable: 'Not applicable'
  };

  const epithets = [
    'Degenerate',
    'Deadbeat',
    'Doomed',
    'Unlucky',
    'Jinxed',
    'Cursed',
    'Forlorn',
    'Bankrupt',
    'Haunted',
    'Forsaken',
    'Ill-starred',
    'Down-bad',
    'Condemned',
    'Marked'
  ];

  const state = {
    client: null,
    inviteCode: '',
    identityId: '',
    displayName: '',
    wagers: [],
    filters: {
      status: 'all',
      template: 'all',
      search: ''
    }
  };

  const app = document.querySelector('[data-ledger-app]');
  if (!app) {
    return;
  }

  const views = {
    gate: app.querySelector('[data-view="gate"]'),
    identity: app.querySelector('[data-view="identity"]'),
    app: app.querySelector('[data-view="app"]')
  };

  const forms = {
    access: app.querySelector('[data-form="access"]'),
    identity: app.querySelector('[data-form="identity"]'),
    wager: app.querySelector('[data-form="wager"]'),
    position: app.querySelector('[data-form="position"]'),
    settlement: app.querySelector('[data-form="settlement"]'),
    settings: app.querySelector('[data-form="settings"]')
  };

  const messages = {
    gate: app.querySelector('[data-message="gate"]'),
    identity: app.querySelector('[data-message="identity"]'),
    wager: app.querySelector('[data-message="wager"]'),
    position: app.querySelector('[data-message="position"]'),
    settlement: app.querySelector('[data-message="settlement"]'),
    settings: app.querySelector('[data-message="settings"]')
  };

  const listEl = app.querySelector('[data-wager-list]');
  const emptyEl = app.querySelector('[data-empty-state]');
  const setupNote = app.querySelector('[data-setup-note]');
  const currentUserEl = app.querySelector('[data-current-user]');
  const currentEpithetEl = app.querySelector('[data-current-epithet]');
  const templateSelect = app.querySelector('[data-template-select]');
  const templateTerms = app.querySelector('[data-template-terms]');
  const positionDialog = app.querySelector('[data-dialog="position"]');
  const settlementDialog = app.querySelector('[data-dialog="settlement"]');
  const settingsDialog = app.querySelector('[data-dialog="settings"]');

  const escapeHtml = (value) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const normalizeText = (value) => String(value ?? '').trim();

  const normalizeKey = (value) => normalizeText(value).toLowerCase().replace(/\s+/g, ' ');

  const randomEpithet = (choices = epithets) => choices[Math.floor(Math.random() * choices.length)];
  const choosePageEpithet = () => {
    let previous = '';

    try {
      previous = window.sessionStorage.getItem(epithetKey) || '';
    } catch (error) {
      previous = '';
    }

    const choices = epithets.filter((epithet) => epithet !== previous);
    const next = randomEpithet(choices.length ? choices : epithets);

    try {
      window.sessionStorage.setItem(epithetKey, next);
    } catch (error) {
      // Storage can be unavailable in restrictive browsers; the label can still be random.
    }

    return next;
  };
  const pageEpithet = choosePageEpithet();

  const normalizeIdentity = (identity) => {
    if (!identity) {
      return null;
    }

    const displayName = normalizeText(identity.displayName || identity.display_name);
    if (!displayName) {
      return null;
    }

    const identityId = identity.identityId || identity.identity_id || identity.id || normalizeKey(displayName);
    return {
      identityId,
      displayName
    };
  };

  const applyIdentity = (identity) => {
    const normalized = normalizeIdentity(identity);
    if (!normalized) {
      return false;
    }

    state.identityId = normalized.identityId;
    state.displayName = normalized.displayName;
    return true;
  };

  const toNumber = (value) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const isPoolTemplate = (templateType) => templateType === 'pooled_binary';

  const normalizePoolSide = (value) => {
    const side = normalizeKey(value);
    if (['yes', 'y', 'will', 'true'].includes(side)) {
      return 'yes';
    }

    if (['no', 'n', 'wont', "won't", 'false'].includes(side)) {
      return 'no';
    }

    return '';
  };

  const poolSideLabel = (side) => side === 'no' ? 'No' : 'Yes';

  const activePoolPositions = (wager) => wager.positions.filter((position) => {
    const side = normalizePoolSide(position.claim);
    return side && position.state !== 'withdrawn' && position.state !== 'countered';
  });

  const calculatePool = (wager) => {
    const positions = activePoolPositions(wager);
    const totals = positions.reduce((acc, position) => {
      const side = normalizePoolSide(position.claim);
      acc[side] += toNumber(position.stakeAmount);
      acc.total += toNumber(position.stakeAmount);
      return acc;
    }, { yes: 0, no: 0, total: 0 });

    return { positions, ...totals };
  };

  const projectedPoolReturn = (position, pool) => {
    const side = normalizePoolSide(position.claim);
    const stake = toNumber(position.stakeAmount);
    const sameSidePool = pool[side] || 0;
    const oppositePool = side === 'yes' ? pool.no : pool.yes;

    if (!stake || !sameSidePool) {
      return 0;
    }

    return stake + (oppositePool * (stake / sameSidePool));
  };

  const makeId = () => {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  const nowIso = () => new Date().toISOString();

  const formatDate = (value) => {
    if (!value) {
      return 'Unspecified';
    }

    const dateOnlyMatch = String(value).match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const date = dateOnlyMatch
      ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
      : new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  const formatTime = (value) => {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const formatMoney = (value) => {
    const amount = toNumber(value);
    if (!amount) {
      return '$0';
    }

    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2
    }).format(amount);
  };

  const setMessage = (slot, text, tone = '') => {
    const el = messages[slot];
    if (!el) {
      return;
    }

    el.textContent = text || '';
    el.dataset.tone = tone;
  };

  const setBusy = (form, busy) => {
    form.querySelectorAll('button, input, select, textarea').forEach((el) => {
      el.disabled = busy;
    });
  };

  const readSession = () => {
    try {
      return JSON.parse(window.sessionStorage.getItem(sessionKey) || '{}');
    } catch (_error) {
      return {};
    }
  };

  const writeSession = () => {
    window.sessionStorage.setItem(sessionKey, JSON.stringify({
      inviteCode: state.inviteCode,
      identityId: state.identityId,
      displayName: state.displayName
    }));
  };

  const clearSession = () => {
    window.sessionStorage.removeItem(sessionKey);
    state.inviteCode = '';
    state.identityId = '';
    state.displayName = '';
  };

  const inviteCodeFromHash = () => {
    const hash = window.location.hash.replace(/^#/, '');
    if (!hash) {
      return '';
    }

    const params = new URLSearchParams(hash);
    return normalizeText(params.get('invite'));
  };

  const clearInviteHash = () => {
    if (!window.location.hash) {
      return;
    }

    window.history.replaceState(null, document.title, `${window.location.pathname}${window.location.search}`);
  };

  const showView = (name) => {
    Object.entries(views).forEach(([viewName, el]) => {
      el.hidden = viewName !== name;
    });
  };

  const openDialog = (dialog) => {
    if (!dialog) {
      return;
    }

    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.hidden = false;
    }
  };

  const closeDialog = (dialog) => {
    if (!dialog) {
      return;
    }

    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.hidden = true;
    }
  };

  const snakeWager = (wager) => ({
    id: wager.id,
    title: wager.title,
    template_type: wager.templateType,
    terms: wager.terms,
    source_of_truth: wager.sourceOfTruth,
    close_date: wager.closeDate,
    resolution_date: wager.resolutionDate,
    status: wager.status,
    outcome: wager.outcome,
    settlement_notes: wager.settlementNotes,
    payment_status: wager.paymentStatus,
    created_by: wager.createdBy,
    created_at: wager.createdAt,
    updated_at: wager.updatedAt,
    settled_at: wager.settledAt,
    settled_by: wager.settledBy,
    positions: wager.positions.map(snakePosition),
    events: wager.events.map(snakeEvent)
  });

  const snakePosition = (position) => ({
    id: position.id,
    wager_id: position.wagerId,
    display_name: position.displayName,
    claim: position.claim,
    stake_amount: position.stakeAmount,
    odds_text: position.oddsText,
    counterparty: position.counterparty,
    state: position.state,
    notes: position.notes,
    created_at: position.createdAt,
    updated_at: position.updatedAt
  });

  const snakeEvent = (event) => ({
    id: event.id,
    wager_id: event.wagerId,
    event_type: event.eventType,
    actor_name: event.actorName,
    body: event.body,
    created_at: event.createdAt
  });

  const normalizePosition = (position) => ({
    id: position.id,
    wagerId: position.wagerId || position.wager_id,
    displayName: position.displayName || position.display_name || 'Unknown',
    claim: position.claim || '',
    stakeAmount: toNumber(position.stakeAmount ?? position.stake_amount),
    oddsText: position.oddsText || position.odds_text || '',
    counterparty: position.counterparty || '',
    state: position.state || 'open',
    notes: position.notes || '',
    createdAt: position.createdAt || position.created_at || nowIso(),
    updatedAt: position.updatedAt || position.updated_at || position.createdAt || position.created_at || nowIso()
  });

  const normalizeEvent = (event) => ({
    id: event.id || makeId(),
    wagerId: event.wagerId || event.wager_id,
    eventType: event.eventType || event.event_type || 'note',
    actorName: event.actorName || event.actor_name || 'Unknown',
    body: event.body || {},
    createdAt: event.createdAt || event.created_at || nowIso()
  });

  const normalizeWager = (wager) => ({
    id: wager.id,
    title: wager.title || 'Untitled wager',
    templateType: wager.templateType || wager.template_type || 'custom',
    terms: wager.terms || '',
    sourceOfTruth: wager.sourceOfTruth || wager.source_of_truth || '',
    closeDate: wager.closeDate || wager.close_date || '',
    resolutionDate: wager.resolutionDate || wager.resolution_date || '',
    status: wager.status || 'open',
    outcome: wager.outcome || '',
    settlementNotes: wager.settlementNotes || wager.settlement_notes || '',
    paymentStatus: wager.paymentStatus || wager.payment_status || 'unpaid',
    createdBy: wager.createdBy || wager.created_by || 'Unknown',
    createdAt: wager.createdAt || wager.created_at || nowIso(),
    updatedAt: wager.updatedAt || wager.updated_at || nowIso(),
    settledAt: wager.settledAt || wager.settled_at || '',
    settledBy: wager.settledBy || wager.settled_by || '',
    positions: (wager.positions || []).map(normalizePosition),
    events: (wager.events || []).map(normalizeEvent)
  });

  const eventSummary = (event) => {
    const body = event.body || {};

    if (body.summary) {
      return body.summary;
    }

    if (body.note) {
      return body.note;
    }

    const actor = event.actorName || 'Someone';
    switch (event.eventType) {
      case 'created':
        return `${actor} opened the wager.`;
      case 'position_added':
        return `${actor} added a position.`;
      case 'position_state_changed':
        return `${actor} marked a position ${labels[body.state] || body.state || 'updated'}.`;
      case 'settled':
        return `${actor} settled the wager.`;
      case 'voided':
        return `${actor} voided the wager.`;
      default:
        return `${actor} updated the record.`;
    }
  };

  const effectiveStatus = (wager) => {
    if (wager.status === 'settled' || wager.status === 'voided') {
      return wager.status;
    }

    if (isPoolTemplate(wager.templateType)) {
      const pool = calculatePool(wager);
      return pool.yes > 0 && pool.no > 0 ? 'agreed' : wager.status || 'open';
    }

    if (wager.positions.some((position) => position.state === 'accepted')) {
      return 'agreed';
    }

    return wager.status || 'open';
  };

  const buildCreatedEvent = (wager, actorName) => ({
    id: makeId(),
    wagerId: wager.id,
    eventType: 'created',
    actorName,
    body: { summary: `${actorName} opened "${wager.title}".` },
    createdAt: wager.createdAt
  });

  const buildPositionEvent = (wagerId, actorName, position) => ({
    id: makeId(),
    wagerId,
    eventType: 'position_added',
    actorName,
    body: {
      position_id: position.id,
      summary: `${actorName} added a ${labels[position.state]?.toLowerCase() || position.state} position.`
    },
    createdAt: position.createdAt
  });

  class LocalLedgerClient {
    read() {
      try {
        const parsed = JSON.parse(window.localStorage.getItem(localStoreKey) || '{}');
        return {
          wagers: (parsed.wagers || []).map(normalizeWager),
          participants: (parsed.participants || []).map((participant) => ({
            identityId: participant.identityId || participant.identity_id || participant.id,
            inviteKey: participant.inviteKey || participant.invite_key,
            displayName: participant.displayName || participant.display_name,
            createdAt: participant.createdAt || participant.created_at || nowIso(),
            updatedAt: participant.updatedAt || participant.updated_at || nowIso()
          })).filter((participant) => participant.identityId && participant.inviteKey && participant.displayName)
        };
      } catch (_error) {
        return { wagers: [], participants: [] };
      }
    }

    write(data) {
      window.localStorage.setItem(localStoreKey, JSON.stringify({
        wagers: data.wagers.map(snakeWager),
        participants: (data.participants || []).map((participant) => ({
          identity_id: participant.identityId,
          invite_key: participant.inviteKey,
          display_name: participant.displayName,
          created_at: participant.createdAt,
          updated_at: participant.updatedAt
        }))
      }));
    }

    inviteKey(inviteCode) {
      return normalizeKey(inviteCode);
    }

    async checkInvite(inviteCode) {
      return Boolean(normalizeText(inviteCode));
    }

    async getIdentity(inviteCode) {
      const data = this.read();
      const inviteKey = this.inviteKey(inviteCode);
      return normalizeIdentity(data.participants.find((participant) => participant.inviteKey === inviteKey));
    }

    async bootstrap(inviteCode, displayName) {
      const data = this.read();
      const inviteKey = this.inviteKey(inviteCode);
      let participant = data.participants.find((entry) => entry.inviteKey === inviteKey);

      if (!participant) {
        const timestamp = nowIso();
        participant = {
          identityId: makeId(),
          inviteKey,
          displayName,
          createdAt: timestamp,
          updatedAt: timestamp
        };
        data.participants.push(participant);
        this.write(data);
      }

      return normalizeIdentity(participant);
    }

    async list() {
      return this.read().wagers;
    }

    renameEverywhere(data, oldName, newName) {
      data.wagers.forEach((wager) => {
        if (wager.createdBy === oldName) {
          wager.createdBy = newName;
        }
        if (wager.settledBy === oldName) {
          wager.settledBy = newName;
        }

        wager.positions.forEach((position) => {
          if (position.displayName === oldName) {
            position.displayName = newName;
          }
        });

        wager.events.forEach((event) => {
          if (event.actorName === oldName) {
            event.actorName = newName;
          }
          if (event.body && typeof event.body.summary === 'string') {
            event.body.summary = event.body.summary.replaceAll(oldName, newName);
          }
        });
      });
    }

    async updateDisplayName(inviteCode, currentName, nextName) {
      const cleanName = normalizeText(nextName);
      if (!cleanName) {
        throw new Error('Display name is required.');
      }

      const data = this.read();
      const inviteKey = this.inviteKey(inviteCode);
      let participant = data.participants.find((entry) => entry.inviteKey === inviteKey);

      if (!participant) {
        participant = {
          identityId: makeId(),
          inviteKey,
          displayName: cleanName,
          createdAt: nowIso(),
          updatedAt: nowIso()
        };
        data.participants.push(participant);
      }

      const oldName = participant.displayName || currentName;
      participant.displayName = cleanName;
      participant.updatedAt = nowIso();
      if (oldName && oldName !== cleanName) {
        this.renameEverywhere(data, oldName, cleanName);
      }
      this.write(data);
      return normalizeIdentity(participant);
    }

    async createWager(_inviteCode, actorName, payload) {
      const data = this.read();
      const timestamp = nowIso();
      const wager = normalizeWager({
        id: makeId(),
        title: payload.title,
        template_type: payload.template_type,
        terms: payload.terms,
        source_of_truth: payload.source_of_truth,
        close_date: payload.close_date,
        resolution_date: payload.resolution_date,
        status: 'open',
        payment_status: 'unpaid',
        created_by: actorName,
        created_at: timestamp,
        updated_at: timestamp,
        positions: [],
        events: []
      });

      wager.events.push(buildCreatedEvent(wager, actorName));

      if (payload.initial_position && payload.initial_position.claim) {
        const position = normalizePosition({
          id: makeId(),
          wager_id: wager.id,
          display_name: actorName,
          claim: payload.initial_position.claim,
          stake_amount: payload.initial_position.stake_amount,
          odds_text: payload.initial_position.odds_text,
          counterparty: payload.initial_position.counterparty,
          state: payload.initial_position.state,
          notes: payload.initial_position.notes,
          created_at: timestamp,
          updated_at: timestamp
        });
        wager.positions.push(position);
        wager.events.push(buildPositionEvent(wager.id, actorName, position));
      }

      data.wagers.unshift(wager);
      this.write(data);
      return wager;
    }

    async addPosition(_inviteCode, wagerId, actorName, payload) {
      const data = this.read();
      const wager = data.wagers.find((entry) => entry.id === wagerId);
      if (!wager) {
        throw new Error('Wager not found.');
      }

      const timestamp = nowIso();
      const position = normalizePosition({
        id: makeId(),
        wager_id: wager.id,
        display_name: actorName,
        claim: payload.claim,
        stake_amount: payload.stake_amount,
        odds_text: payload.odds_text,
        counterparty: payload.counterparty,
        state: payload.state,
        notes: payload.notes,
        created_at: timestamp,
        updated_at: timestamp
      });

      wager.positions.push(position);
      wager.events.push(buildPositionEvent(wager.id, actorName, position));
      wager.updatedAt = timestamp;
      this.write(data);
      return position;
    }

    async updatePositionState(_inviteCode, positionId, actorName, nextState) {
      const data = this.read();
      const timestamp = nowIso();

      for (const wager of data.wagers) {
        const position = wager.positions.find((entry) => entry.id === positionId);
        if (!position) {
          continue;
        }

        position.state = nextState;
        position.updatedAt = timestamp;
        wager.updatedAt = timestamp;
        wager.events.push({
          id: makeId(),
          wagerId: wager.id,
          eventType: 'position_state_changed',
          actorName,
          body: {
            position_id: position.id,
            state: nextState,
            summary: `${actorName} marked ${position.displayName}'s position ${labels[nextState]?.toLowerCase() || nextState}.`
          },
          createdAt: timestamp
        });
        this.write(data);
        return position;
      }

      throw new Error('Position not found.');
    }

    async settleWager(_adminCode, wagerId, actorName, payload) {
      if (!normalizeText(payload.admin_code)) {
        throw new Error('Admin code is required.');
      }

      const data = this.read();
      const wager = data.wagers.find((entry) => entry.id === wagerId);
      if (!wager) {
        throw new Error('Wager not found.');
      }

      const timestamp = nowIso();
      wager.status = payload.status;
      wager.outcome = payload.outcome;
      wager.settlementNotes = payload.settlement_notes;
      wager.paymentStatus = payload.payment_status;
      wager.settledAt = timestamp;
      wager.settledBy = actorName;
      wager.updatedAt = timestamp;
      wager.events.push({
        id: makeId(),
        wagerId: wager.id,
        eventType: payload.status,
        actorName,
        body: {
          outcome: payload.outcome,
          settlement_notes: payload.settlement_notes,
          payment_status: payload.payment_status,
          summary: `${actorName} marked the wager ${labels[payload.status]?.toLowerCase() || payload.status}.`
        },
        createdAt: timestamp
      });

      this.write(data);
      return wager;
    }
  }

  class SupabaseLedgerClient {
    constructor() {
      if (!window.supabase || typeof window.supabase.createClient !== 'function') {
        throw new Error('Supabase client did not load.');
      }

      this.client = window.supabase.createClient(config.supabaseUrl, config.supabaseAnonKey);
    }

    async rpc(functionName, args) {
      const { data, error } = await this.client.rpc(functionName, args);
      if (error) {
        throw new Error(error.message);
      }

      return data;
    }

    async checkInvite(inviteCode) {
      const result = await this.rpc('ledger_check_invite', { p_invite_code: inviteCode });
      return Boolean(result && result.ok);
    }

    async getIdentity(inviteCode) {
      const result = await this.rpc('ledger_get_identity', { p_invite_code: inviteCode });
      return normalizeIdentity(result && result.identity);
    }

    async bootstrap(inviteCode, displayName) {
      const result = await this.rpc('ledger_bootstrap_access', {
        p_invite_code: inviteCode,
        p_display_name: displayName
      });
      return normalizeIdentity(result && result.identity);
    }

    async list(inviteCode) {
      const result = await this.rpc('ledger_list_wagers', { p_invite_code: inviteCode });
      const wagers = Array.isArray(result) ? result : result?.wagers || [];
      return wagers.map(normalizeWager);
    }

    async createWager(inviteCode, actorName, payload) {
      const result = await this.rpc('ledger_create_wager', {
        p_invite_code: inviteCode,
        p_actor_name: actorName,
        p_payload: payload
      });
      return normalizeWager(result);
    }

    async addPosition(inviteCode, wagerId, actorName, payload) {
      const result = await this.rpc('ledger_add_position', {
        p_invite_code: inviteCode,
        p_wager_id: wagerId,
        p_actor_name: actorName,
        p_payload: payload
      });
      return normalizePosition(result);
    }

    async updatePositionState(inviteCode, positionId, actorName, nextState) {
      const result = await this.rpc('ledger_update_position_state', {
        p_invite_code: inviteCode,
        p_position_id: positionId,
        p_actor_name: actorName,
        p_state: nextState
      });
      return normalizePosition(result);
    }

    async settleWager(adminCode, wagerId, actorName, payload) {
      const result = await this.rpc('ledger_settle_wager', {
        p_admin_code: adminCode,
        p_wager_id: wagerId,
        p_actor_name: actorName,
        p_payload: payload
      });
      return normalizeWager(result);
    }

    async updateDisplayName(inviteCode, _currentName, nextName) {
      const result = await this.rpc('ledger_update_display_name', {
        p_invite_code: inviteCode,
        p_current_display_name: _currentName,
        p_display_name: nextName
      });
      return normalizeIdentity(result && result.identity);
    }
  }

  const createClient = () => {
    if (hasSupabaseConfig) {
      return new SupabaseLedgerClient();
    }

    if (setupNote) {
      setupNote.hidden = false;
    }

    return new LocalLedgerClient();
  };

  const refresh = async () => {
    state.wagers = await state.client.list(state.inviteCode);
    render();
  };

  const updatePoolFields = (form, templateType) => {
    const pooled = isPoolTemplate(templateType);
    const claimField = form.querySelector('[data-claim-field]');
    const poolSideField = form.querySelector('[data-pool-side-field]');
    const oddsField = form.querySelector('[data-odds-field]');
    const counterpartyField = form.querySelector('[data-counterparty-field]');
    const modeField = form.querySelector('[data-mode-field]');
    const claimInput = form.elements.claim;
    const stakeInput = form.elements.stakeAmount;

    if (claimField) {
      claimField.hidden = pooled;
    }

    if (poolSideField) {
      poolSideField.hidden = !pooled;
    }

    if (oddsField) {
      oddsField.hidden = pooled;
    }

    if (counterpartyField) {
      counterpartyField.hidden = pooled;
    }

    if (modeField) {
      modeField.hidden = pooled;
    }

    if (claimInput) {
      claimInput.required = !pooled && form === forms.position;
      claimInput.placeholder = pooled ? '' : 'It drops 20% before the close date';
    }

    if (stakeInput) {
      stakeInput.required = pooled;
      stakeInput.min = pooled ? '0.01' : '0';
    }
  };

  const collectWagerPayload = (form) => {
    const formData = new FormData(form);
    const templateType = formData.get('templateType');
    const pooled = isPoolTemplate(templateType);
    const claim = pooled ? poolSideLabel(formData.get('poolSide')) : normalizeText(formData.get('claim'));
    const mode = pooled ? 'accepted' : formData.get('positionMode') === 'proposal' ? 'proposed' : 'open';
    const initialPosition = claim ? {
      claim,
      stake_amount: toNumber(formData.get('stakeAmount')),
      odds_text: pooled ? 'Proportional pool' : normalizeText(formData.get('oddsText')),
      counterparty: pooled ? 'Pool' : normalizeText(formData.get('counterparty')),
      state: mode,
      notes: normalizeText(formData.get('positionNotes'))
    } : null;

    return {
      title: normalizeText(formData.get('title')),
      template_type: templateType,
      terms: normalizeText(formData.get('terms')),
      source_of_truth: normalizeText(formData.get('sourceOfTruth')),
      close_date: formData.get('closeDate') || null,
      resolution_date: formData.get('resolutionDate') || null,
      initial_position: initialPosition
    };
  };

  const collectPositionPayload = (form) => {
    const formData = new FormData(form);
    const pooled = isPoolTemplate(formData.get('templateType'));
    return {
      claim: pooled ? poolSideLabel(formData.get('poolSide')) : normalizeText(formData.get('claim')),
      stake_amount: toNumber(formData.get('stakeAmount')),
      odds_text: pooled ? 'Proportional pool' : normalizeText(formData.get('oddsText')),
      counterparty: pooled ? 'Pool' : normalizeText(formData.get('counterparty')),
      state: pooled ? 'accepted' : formData.get('state') || 'open',
      notes: normalizeText(formData.get('notes'))
    };
  };

  const collectSettlementPayload = (form) => {
    const formData = new FormData(form);
    return {
      admin_code: normalizeText(formData.get('adminCode')),
      status: formData.get('status') || 'settled',
      outcome: normalizeText(formData.get('outcome')),
      settlement_notes: normalizeText(formData.get('settlementNotes')),
      payment_status: formData.get('paymentStatus') || 'unpaid'
    };
  };

  const renderStats = () => {
    const stats = state.wagers.reduce((acc, wager) => {
      const status = effectiveStatus(wager);
      acc[status] = (acc[status] || 0) + 1;
      wager.positions.forEach((position) => {
        if (position.state !== 'withdrawn') {
          acc.totalStake += toNumber(position.stakeAmount);
        }
      });
      return acc;
    }, { open: 0, agreed: 0, settled: 0, totalStake: 0 });

    app.querySelector('[data-stat="open"]').textContent = stats.open || 0;
    app.querySelector('[data-stat="agreed"]').textContent = stats.agreed || 0;
    app.querySelector('[data-stat="settled"]').textContent = stats.settled || 0;
    app.querySelector('[data-stat="totalStake"]').textContent = formatMoney(stats.totalStake);

    app.querySelectorAll('[data-stat-filter]').forEach((button) => {
      button.setAttribute('aria-pressed', String(state.filters.status === button.dataset.statFilter));
    });
  };

  const matchesFilters = (wager) => {
    const status = effectiveStatus(wager);
    if (state.filters.status !== 'all' && status !== state.filters.status) {
      return false;
    }

    if (state.filters.template !== 'all' && wager.templateType !== state.filters.template) {
      return false;
    }

    const search = state.filters.search.toLowerCase();
    if (!search) {
      return true;
    }

    const searchable = [
      wager.title,
      wager.terms,
      wager.sourceOfTruth,
      wager.createdBy,
      wager.outcome,
      ...wager.positions.flatMap((position) => [
        position.displayName,
        position.claim,
        position.counterparty,
        position.notes
      ])
    ].join(' ').toLowerCase();

    return searchable.includes(search);
  };

  const renderPositionRows = (wager) => {
    if (!wager.positions.length) {
      return '<tr><td colspan="7">No positions yet.</td></tr>';
    }

    if (isPoolTemplate(wager.templateType)) {
      const pool = calculatePool(wager);
      return wager.positions.map((position) => {
        const side = normalizePoolSide(position.claim);
        const projectedReturn = side ? projectedPoolReturn(position, pool) : 0;
        const projectedNet = projectedReturn - toNumber(position.stakeAmount);
        return `
          <tr>
            <td><strong>${escapeHtml(position.displayName)}</strong></td>
            <td>${escapeHtml(side ? poolSideLabel(side) : position.claim)}</td>
            <td>${escapeHtml(formatMoney(position.stakeAmount))}</td>
            <td>${escapeHtml(side ? `${formatMoney(projectedReturn)} total / ${formatMoney(projectedNet)} net` : 'Unspecified')}</td>
            <td>${escapeHtml(side ? `${poolSideLabel(side)} pool` : 'Pool')}</td>
            <td><span class="ledger-pill ledger-pill--${escapeHtml(position.state)}">${escapeHtml(labels[position.state] || position.state)}</span></td>
            <td>
              <div class="ledger-table__actions">
                ${position.state !== 'withdrawn' ? `<button type="button" data-action="withdraw-position" data-position-id="${escapeHtml(position.id)}">Withdraw</button>` : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    return wager.positions.map((position) => `
      <tr>
        <td><strong>${escapeHtml(position.displayName)}</strong></td>
        <td>${escapeHtml(position.claim)}</td>
        <td>${escapeHtml(formatMoney(position.stakeAmount))}</td>
        <td>${escapeHtml(position.oddsText || 'Unspecified')}</td>
        <td>${escapeHtml(position.counterparty || 'Open')}</td>
        <td><span class="ledger-pill ledger-pill--${escapeHtml(position.state)}">${escapeHtml(labels[position.state] || position.state)}</span></td>
        <td>
          <div class="ledger-table__actions">
            ${position.state === 'proposed' ? `<button type="button" data-action="accept-position" data-position-id="${escapeHtml(position.id)}">Accept</button>` : ''}
            ${position.state !== 'countered' && position.state !== 'withdrawn' && position.state !== 'accepted' ? `<button type="button" data-action="counter-position" data-position-id="${escapeHtml(position.id)}">Counter</button>` : ''}
            ${position.state !== 'withdrawn' ? `<button type="button" data-action="withdraw-position" data-position-id="${escapeHtml(position.id)}">Withdraw</button>` : ''}
          </div>
        </td>
      </tr>
    `).join('');
  };

  const renderPoolSummary = (wager) => {
    if (!isPoolTemplate(wager.templateType)) {
      return '';
    }

    const pool = calculatePool(wager);
    return `
      <section class="ledger-pool-summary" aria-label="Pool summary">
        <div>
          <span>Yes pool</span>
          <strong>${escapeHtml(formatMoney(pool.yes))}</strong>
        </div>
        <div>
          <span>No pool</span>
          <strong>${escapeHtml(formatMoney(pool.no))}</strong>
        </div>
        <div>
          <span>Total pool</span>
          <strong>${escapeHtml(formatMoney(pool.total))}</strong>
        </div>
        <p>Winning side splits the losing pool in proportion to each winner's stake. Projected payouts include returned stake.</p>
      </section>
    `;
  };

  const renderEvents = (wager) => {
    const events = [...wager.events].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
    if (!events.length) {
      return '<li><time></time><span>No activity recorded.</span></li>';
    }

    return events.map((event) => `
      <li>
        <time>${escapeHtml(formatTime(event.createdAt))}</time>
        <span>${escapeHtml(eventSummary(event))}</span>
      </li>
    `).join('');
  };

  const renderCard = (wager) => {
    const status = effectiveStatus(wager);
    const settlement = wager.status === 'settled' || wager.status === 'voided'
      ? `
        <div class="ledger-detail">
          <span>Outcome</span>
          <strong>${escapeHtml(wager.outcome || labels[wager.status])}</strong>
        </div>
        <div class="ledger-detail">
          <span>Payment</span>
          <strong>${escapeHtml(labels[wager.paymentStatus] || wager.paymentStatus || 'Unspecified')}</strong>
        </div>
        <div class="ledger-detail">
          <span>Settled by</span>
          <strong>${escapeHtml(wager.settledBy || 'Unknown')}</strong>
        </div>
      `
      : '';

    return `
      <article class="ledger-card" data-wager-id="${escapeHtml(wager.id)}">
        <div class="ledger-card__header">
          <div>
            <h2>${escapeHtml(wager.title)}</h2>
            <div class="ledger-card__meta">
              <span class="ledger-pill ledger-pill--${escapeHtml(status)}">${escapeHtml(labels[status] || status)}</span>
              <span class="ledger-pill">${escapeHtml(labels[wager.templateType] || wager.templateType)}</span>
              <span class="ledger-pill">Opened by ${escapeHtml(wager.createdBy)}</span>
              <span class="ledger-pill">${escapeHtml(formatDate(wager.createdAt))}</span>
            </div>
          </div>
          <div class="ledger-card__actions">
            <button type="button" data-action="open-position" data-wager-id="${escapeHtml(wager.id)}">Add position</button>
            <button type="button" data-action="open-settle" data-wager-id="${escapeHtml(wager.id)}">Settle</button>
          </div>
        </div>

        <div class="ledger-card__body">
          <p class="ledger-terms">${escapeHtml(wager.terms)}</p>

          <div class="ledger-detail-grid">
            <div class="ledger-detail">
              <span>Source of truth</span>
              <strong>${escapeHtml(wager.sourceOfTruth || 'Unspecified')}</strong>
            </div>
            <div class="ledger-detail">
              <span>Close date</span>
              <strong>${escapeHtml(formatDate(wager.closeDate))}</strong>
            </div>
            <div class="ledger-detail">
              <span>Resolution date</span>
              <strong>${escapeHtml(formatDate(wager.resolutionDate))}</strong>
            </div>
            ${settlement}
          </div>

          ${renderPoolSummary(wager)}

          <section>
            <h3 class="ledger-section-title">Positions</h3>
            <div class="ledger-table-wrap">
              <table class="ledger-table">
                <thead>
                  ${isPoolTemplate(wager.templateType) ? `
                    <tr>
                      <th>Name</th>
                      <th>Side</th>
                      <th>Stake</th>
                      <th>If side wins</th>
                      <th>Pool</th>
                      <th>State</th>
                      <th>Actions</th>
                    </tr>
                  ` : `
                    <tr>
                      <th>Name</th>
                      <th>Claim</th>
                      <th>Stake</th>
                      <th>Odds</th>
                      <th>Counterparty</th>
                      <th>State</th>
                      <th>Actions</th>
                    </tr>
                  `}
                </thead>
                <tbody>${renderPositionRows(wager)}</tbody>
              </table>
            </div>
          </section>

          <section>
            <h3 class="ledger-section-title">Activity</h3>
            <ul class="ledger-activity">${renderEvents(wager)}</ul>
          </section>
        </div>
      </article>
    `;
  };

  const render = () => {
    currentUserEl.textContent = state.displayName || '';
    currentEpithetEl.textContent = pageEpithet;
    if (forms.settings && state.displayName) {
      forms.settings.elements.displayName.value = state.displayName;
    }
    renderStats();

    const filtered = state.wagers
      .filter(matchesFilters)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    emptyEl.hidden = filtered.length > 0;
    listEl.innerHTML = filtered.map(renderCard).join('');
  };

  const enterApp = async () => {
    showView('app');
    setMessage('gate', '');
    setMessage('identity', '');
    const identity = await state.client.bootstrap(state.inviteCode, state.displayName);
    applyIdentity(identity);
    await refresh();
    writeSession();
  };

  const enterWithInviteCode = async (inviteCode, options = {}) => {
    const cleanInviteCode = normalizeText(inviteCode);
    if (!cleanInviteCode) {
      throw new Error('Invite code is required.');
    }

    state.inviteCode = cleanInviteCode;
    const ok = await state.client.checkInvite(state.inviteCode);
    if (!ok) {
      throw new Error(options.fromLink ? 'That invite link did not work.' : 'That invite code did not work.');
    }

    const session = readSession();
    const sameInviteSession = normalizeText(session.inviteCode) === state.inviteCode;
    if (sameInviteSession) {
      applyIdentity(session);
    } else {
      state.identityId = '';
      state.displayName = '';
    }

    const storedIdentity = await state.client.getIdentity(state.inviteCode);
    applyIdentity(storedIdentity);

    if (state.displayName) {
      await enterApp();
    } else {
      showView('identity');
    }
  };

  forms.access.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('gate', '');
    const inviteCode = normalizeText(new FormData(forms.access).get('inviteCode'));
    setBusy(forms.access, true);

    try {
      await enterWithInviteCode(inviteCode);
    } catch (error) {
      setMessage('gate', error.message || 'Could not enter The Ledger.');
    } finally {
      setBusy(forms.access, false);
    }
  });

  forms.identity.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('identity', '');
    const displayName = normalizeText(new FormData(forms.identity).get('displayName'));
    setBusy(forms.identity, true);

    try {
      state.displayName = displayName;
      if (!state.displayName) {
        throw new Error('Display name is required.');
      }

      await enterApp();
    } catch (error) {
      setMessage('identity', error.message || 'Could not save that name.');
    } finally {
      setBusy(forms.identity, false);
    }
  });

  forms.wager.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('wager', '');
    const payload = collectWagerPayload(forms.wager);
    setBusy(forms.wager, true);

    try {
      if (!payload.title || !payload.terms) {
        throw new Error('Title and terms are required.');
      }

      if (isPoolTemplate(payload.template_type) && (!payload.initial_position || toNumber(payload.initial_position.stake_amount) <= 0)) {
        throw new Error('Pooled wagers need your side and a stake greater than $0.');
      }

      await state.client.createWager(state.inviteCode, state.displayName, payload);
      forms.wager.reset();
      updateTemplateHelp();
      setMessage('wager', 'Recorded. The future has been notified.', 'success');
      await refresh();
    } catch (error) {
      setMessage('wager', error.message || 'Could not post this wager.');
    } finally {
      setBusy(forms.wager, false);
    }
  });

  forms.position.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('position', '');
    const positionData = new FormData(forms.position);
    const wagerId = positionData.get('wagerId');
    const payload = collectPositionPayload(forms.position);
    setBusy(forms.position, true);

    try {
      if (!payload.claim) {
        throw new Error('Claim is required.');
      }

      if (isPoolTemplate(positionData.get('templateType')) && toNumber(payload.stake_amount) <= 0) {
        throw new Error('Pooled positions need a stake greater than $0.');
      }

      await state.client.addPosition(state.inviteCode, wagerId, state.displayName, payload);
      forms.position.reset();
      closeDialog(positionDialog);
      await refresh();
    } catch (error) {
      setMessage('position', error.message || 'Could not add that position.');
    } finally {
      setBusy(forms.position, false);
    }
  });

  forms.settlement.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('settlement', '');
    const settlementData = new FormData(forms.settlement);
    const wagerId = settlementData.get('wagerId');
    const payload = collectSettlementPayload(forms.settlement);
    setBusy(forms.settlement, true);

    try {
      await state.client.settleWager(payload.admin_code, wagerId, state.displayName, payload);
      forms.settlement.reset();
      closeDialog(settlementDialog);
      await refresh();
    } catch (error) {
      setMessage('settlement', error.message || 'Could not settle this wager.');
    } finally {
      setBusy(forms.settlement, false);
    }
  });

  forms.settings.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage('settings', '');
    const nextName = normalizeText(new FormData(forms.settings).get('displayName'));
    setBusy(forms.settings, true);

    try {
      if (!nextName) {
        throw new Error('Display name is required.');
      }

      const identity = await state.client.updateDisplayName(state.inviteCode, state.displayName, nextName);
      applyIdentity(identity);
      writeSession();
      await refresh();
      setMessage('settings', 'Name updated across your ledger history.', 'success');
    } catch (error) {
      setMessage('settings', error.message || 'Could not update your name.');
    } finally {
      setBusy(forms.settings, false);
    }
  });

  app.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
      return;
    }

    const action = button.dataset.action;

    if (action === 'sign-out') {
      clearSession();
      closeDialog(settingsDialog);
      showView('gate');
      return;
    }

    if (action === 'open-settings') {
      forms.settings.elements.displayName.value = state.displayName;
      setMessage('settings', '');
      openDialog(settingsDialog);
      return;
    }

    if (action === 'open-position') {
      const wager = state.wagers.find((entry) => entry.id === button.dataset.wagerId);
      forms.position.reset();
      forms.position.elements.wagerId.value = button.dataset.wagerId;
      forms.position.elements.templateType.value = wager?.templateType || '';
      updatePoolFields(forms.position, wager?.templateType || '');
      setMessage('position', '');
      openDialog(positionDialog);
      return;
    }

    if (action === 'open-settle') {
      forms.settlement.reset();
      forms.settlement.elements.wagerId.value = button.dataset.wagerId;
      setMessage('settlement', '');
      openDialog(settlementDialog);
      return;
    }

    const positionActions = {
      'accept-position': 'accepted',
      'counter-position': 'countered',
      'withdraw-position': 'withdrawn'
    };

    if (positionActions[action]) {
      button.disabled = true;
      try {
        await state.client.updatePositionState(
          state.inviteCode,
          button.dataset.positionId,
          state.displayName,
          positionActions[action]
        );
        await refresh();
      } catch (error) {
        window.alert(error.message || 'Could not update that position.');
      } finally {
        button.disabled = false;
      }
    }
  });

  app.querySelectorAll('[data-stat-filter]').forEach((button) => {
    button.addEventListener('click', () => {
      const nextStatus = state.filters.status === button.dataset.statFilter ? 'all' : button.dataset.statFilter;
      state.filters.status = nextStatus;
      const statusFilter = app.querySelector('[data-filter="status"]');
      if (statusFilter) {
        statusFilter.value = nextStatus;
      }
      render();
    });
  });

  app.querySelectorAll('[data-filter]').forEach((field) => {
    field.addEventListener('input', () => {
      state.filters[field.dataset.filter] = field.value;
      render();
    });
  });

  const updateTemplateHelp = () => {
    if (templateTerms && templateSelect) {
      templateTerms.placeholder = templateHelp[templateSelect.value] || templateHelp.custom;
    }
    if (forms.wager && templateSelect) {
      updatePoolFields(forms.wager, templateSelect.value);
    }
  };

  templateSelect.addEventListener('change', updateTemplateHelp);

  const init = async () => {
    try {
      state.client = createClient();
    } catch (error) {
      setMessage('gate', error.message || 'The Ledger could not initialize.');
      showView('gate');
      return;
    }

    updateTemplateHelp();

    const hashInviteCode = inviteCodeFromHash();
    if (hashInviteCode) {
      clearInviteHash();
      try {
        await enterWithInviteCode(hashInviteCode, { fromLink: true });
      } catch (error) {
        clearSession();
        showView('gate');
        setMessage('gate', error.message || 'Could not use that invite link.');
      }
      return;
    }

    const session = readSession();
    state.inviteCode = normalizeText(session.inviteCode);
    applyIdentity(session);

    if (!hasSupabaseConfig) {
      setMessage('gate', 'Local demo mode is active until Supabase is configured.', 'quiet');
    }

    if (state.inviteCode && state.displayName) {
      try {
        await enterApp();
      } catch (_error) {
        clearSession();
        showView('gate');
      }
    } else if (state.inviteCode) {
      showView('identity');
    } else {
      showView('gate');
    }
  };

  init();
})();
