// 订阅管理总模块（智能 Query）
// 负责：
// 1) 维护本地草稿配置
// 2) 统一渲染 intent_profiles
// 3) 保存前仅保留 intent_profiles

window.SubscriptionsManager = (function () {
  const MAX_KEYWORDS_PER_PROFILE = 6;
  const MAX_INTENT_QUERIES_PER_PROFILE = 4;
  let overlay = null;
  let panel = null;
  let saveBtn = null;
  let closeBtn = null;
  let msgEl = null;
  let quickRun10dBtn = null;
  let quickRun30dBtn = null;
  let quickRun30dStandardBtn = null;
  let quickRunOpenWorkflowPanelBtn = null;
  let runByDateBtn = null;
  let runDateSingleEl = null;
  let runDateRangeStartEl = null;
  let runDateRangeEndEl = null;
  let runModeSelectEl = null;
  let runSourceSelectEl = null;
  let quickRunConferenceBtn = null;
  let quickRunYearSelect = null;
  let quickRunConferenceSelect = null;
  let quickRunMsgEl = null;
  let resetContentBtn = null;
  let resetContentMsgEl = null;

  let draftConfig = null;
  let hasUnsavedChanges = false;
  let isSavingDraftConfig = false;

  const defaultPromptTemplate = [
    'You are a retrieval planning assistant.',
    '鏍囩 (Tag): {{TAG}}',
    '涓枃鎻忚堪 (Description): {{USER_DESCRIPTION}}',
    'Retrieval context: {{RETRIEVAL_CONTEXT}}',
    '',
    'Return JSON only:',
    '{',
    '  "tag": "optional tag suggestion (for user convenience)",',
    '  "description": "optional Chinese description (for user convenience)",',
    '  "keywords": [',
    '    {',
      '      "keyword": "short keyword phrase for BM25 recall",',
      '      "query": "semantic rewrite for this keyword",',
      '      "keyword_cn": "涓枃鐩磋瘧锛堝彲閫夛級",',
    '    },',
    '  ],',
    '  "intent_queries": [',
    '    {',
      '      "query": "intent-oriented semantic query 1",',
      '      "query_cn": "涓枃鐩磋瘧锛堝彲閫夛級",',
    '    },',
    '    {',
      '      "query": "intent-oriented semantic query 2",',
      '      "query_cn": "涓枃鐩磋瘧锛堝彲閫夛級",',
    '    }',
    '  ],',
    '}',
    'Requirements:',
    '1) keywords: output 5-12 objects; each item must include keyword and query, keyword_cn optional.',
    '2) keywords are used for recall and should be atomic phrases (prefer 1-3 core words).',
    '3) Avoid coupling core terms (e.g., "symbolic regression", "reinforcement learning", "genetic programming", "Transformer") with extra qualifiers into one keyword. Keep core terms atomic in keyword and use query for full intent.',
    '4) Suggested example:',
    '   {"keyword":"symbolic regression","query":"deep symbolic regression methods","keyword_cn":"绗﹀彿鍥炲綊","query_cn":"绗﹀彿鍥炲綊娣卞害鏂规硶"},',
    '   {"keyword":"reinforcement learning","query":"policy gradient symbolic regression","keyword_cn":"寮哄寲瀛︿範","query_cn":"绛栫暐姊害鍦ㄧ鍙峰洖褰掍腑鐨勫簲鐢?},',
    '   {"keyword":"MCTS","query":"MCTS for symbolic regression"}',
    '5) intent_queries: output 1-4 actionable intent queries. Each item should include query and optional query_cn.',
    '6) Do not output extra fields like must_have / optional / exclude / rewrite_for_embedding / must_have.',
    '7) Return pure JSON only, no explanations.',
    '8) Tag suggestion should be concise, preferably under 6 characters.',
  ].join('\n');

  const QUICK_RUN_CONFERENCES = [
    'ACL',
    'AAAI',
    'COLING',
    'EMNLP',
    'ICCV',
    'ICLR',
    'ICML',
    'IJCAI',
    'NeurIPS',
    'SIGIR',
  ];

  const normalizeText = (v) => String(v || '').trim();
  const normalizeSourceKey = (v) => normalizeText(v).toLowerCase();
  const toStableId = (value) => {
    const text = normalizeText(value).toLowerCase();
    const slug = text
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')
      .trim();
    return slug || 'item';
  };

  const cloneDeep = (obj) => {
    try {
      return JSON.parse(JSON.stringify(obj || {}));
    } catch {
      return obj || {};
    }
  };

  const isPlainObject = (value) => !!value && typeof value === 'object' && !Array.isArray(value);

  const PAPER_SOURCE_ORDER = [
    'arxiv',
    'biorxiv',
    'email',
    'medrxiv',
    'chemrxiv',
    'neurips',
    'iclr',
    'icml',
    'acl',
    'emnlp',
    'aaai',
  ];
  const VISIBLE_PAPER_SOURCES = ['arxiv', 'biorxiv', 'email'];
  const SOURCE_BACKEND_DEFAULTS = {
    arxiv: {
      papers_table: 'arxiv_papers',
      use_vector_rpc: true,
      vector_rpc: 'match_arxiv_papers_exact',
      vector_rpc_exact: 'match_arxiv_papers_exact',
      use_bm25_rpc: true,
      bm25_rpc: 'match_arxiv_papers_bm25',
      sync_table: 'arxiv_sync_status',
      sync_success_value: 'success',
      schema: 'public',
    },
    biorxiv: {
      papers_table: 'biorxiv_papers',
      use_vector_rpc: true,
      vector_rpc: 'match_biorxiv_papers_exact',
      vector_rpc_exact: 'match_biorxiv_papers_exact',
      use_bm25_rpc: true,
      bm25_rpc: 'match_biorxiv_papers_bm25',
      schema: 'public',
    },
  };

  const filterVisiblePaperSources = (values) => {
    const visible = new Set(VISIBLE_PAPER_SOURCES);
    return (Array.isArray(values) ? values : []).filter((value) => visible.has(normalizeSourceKey(value)));
  };

  const getAvailablePaperSources = (config) => {
    const cfg = config && typeof config === 'object' ? config : {};
    const rawBackends = cfg.source_backends && typeof cfg.source_backends === 'object'
      ? cfg.source_backends
      : {};
    const seen = new Set();
    const out = [];
    const runtimeCandidates = [];
    if (window.DPR_RUNTIME_SOURCE_BACKENDS && typeof window.DPR_RUNTIME_SOURCE_BACKENDS === 'object') {
      runtimeCandidates.push(...Object.keys(window.DPR_RUNTIME_SOURCE_BACKENDS || {}));
    }
    ['arxiv', 'email', ...Object.keys(rawBackends || {}), ...runtimeCandidates].forEach((key) => {
      const normalized = normalizeSourceKey(key);
      if (!normalized || seen.has(normalized)) return;
      seen.add(normalized);
      out.push(normalized);
    });
    const visibleOut = filterVisiblePaperSources(out);
    visibleOut.sort((a, b) => {
      const idxA = PAPER_SOURCE_ORDER.indexOf(a);
      const idxB = PAPER_SOURCE_ORDER.indexOf(b);
      const rankA = idxA >= 0 ? idxA : Number.MAX_SAFE_INTEGER;
      const rankB = idxB >= 0 ? idxB : Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      return a.localeCompare(b);
    });
    return visibleOut;
  };

  const normalizePaperSources = (values, options = {}) => {
    const fallbackToArxiv = options.fallbackToArxiv !== false;
    const rawList = Array.isArray(values)
      ? values
      : (typeof values === 'string' && values ? [values] : []);
    const seen = new Set();
    const out = [];
    rawList.forEach((value) => {
      const key = normalizeSourceKey(value);
      if (!key || seen.has(key)) return;
      seen.add(key);
      out.push(key);
    });
    const visibleOut = filterVisiblePaperSources(out);
    if (!visibleOut.length && fallbackToArxiv) {
      return ['arxiv'];
    }
    return visibleOut;
  };

  const mergeDefinedFields = (base, override) => {
    const next = { ...(isPlainObject(base) ? base : {}) };
    if (!isPlainObject(override)) return next;
    Object.keys(override).forEach((key) => {
      const value = override[key];
      if (value === undefined) return;
      next[key] = value;
    });
    return next;
  };

  const buildDefaultSourceBackend = (sourceKey, config) => {
    const normalizedKey = normalizeSourceKey(sourceKey);
    const defaults = SOURCE_BACKEND_DEFAULTS[normalizedKey];
    if (!defaults) return null;

    const cfg = isPlainObject(config) ? config : {};
    const shared = isPlainObject(cfg.supabase_shared) ? cfg.supabase_shared : {};
    const legacy = isPlainObject(cfg.supabase) ? cfg.supabase : {};

    let base = {
      kind: normalizeText(shared.kind || legacy.kind || 'supabase') || 'supabase',
      enabled: shared.enabled !== false && legacy.enabled !== false,
      url: normalizeText(shared.url || legacy.url || ''),
      anon_key: normalizeText(shared.anon_key || legacy.anon_key || ''),
      schema: normalizeText(shared.schema || legacy.schema || defaults.schema || 'public') || 'public',
    };

    if (normalizedKey === 'arxiv') {
      base = mergeDefinedFields(base, {
        enabled: Object.prototype.hasOwnProperty.call(legacy, 'enabled') ? legacy.enabled !== false : undefined,
        papers_table: normalizeText(legacy.papers_table || ''),
        use_vector_rpc: Object.prototype.hasOwnProperty.call(legacy, 'use_vector_rpc') ? legacy.use_vector_rpc !== false : undefined,
        vector_rpc: normalizeText(legacy.vector_rpc || ''),
        vector_rpc_exact: normalizeText(legacy.vector_rpc_exact || legacy.vector_rpc || ''),
        use_bm25_rpc: Object.prototype.hasOwnProperty.call(legacy, 'use_bm25_rpc') ? legacy.use_bm25_rpc !== false : undefined,
        bm25_rpc: normalizeText(legacy.bm25_rpc || ''),
        sync_table: normalizeText(legacy.sync_table || ''),
        sync_success_value: normalizeText(legacy.sync_success_value || ''),
      });
    }

    return mergeDefinedFields(defaults, base);
  };

  const ensureSourceBackendsForProfiles = (config) => {
    const next = isPlainObject(config) ? config : {};
    const subs = isPlainObject(next.subscriptions) ? next.subscriptions : {};
    const profiles = Array.isArray(subs.intent_profiles) ? subs.intent_profiles : [];
    const existingBackends = isPlainObject(next.source_backends) ? next.source_backends : {};
    const mergedBackends = cloneDeep(existingBackends);
    let changed = !isPlainObject(next.source_backends);

    profiles.forEach((profile) => {
      if (!isPlainObject(profile)) return;
      const fallbackToArxiv = !Object.prototype.hasOwnProperty.call(profile, 'paper_sources');
      const paperSources = normalizePaperSources(profile.paper_sources, { fallbackToArxiv });
      paperSources.forEach((sourceKey) => {
        const template = buildDefaultSourceBackend(sourceKey, next);
        if (!template) return;
        const current = isPlainObject(mergedBackends[sourceKey]) ? mergedBackends[sourceKey] : {};
        const merged = mergeDefinedFields(template, current);
        const before = JSON.stringify(current);
        const after = JSON.stringify(merged);
        if (before !== after) {
          mergedBackends[sourceKey] = merged;
          changed = true;
        }
      });
    });

    if (changed) {
      next.source_backends = mergedBackends;
    }
    return next;
  };

  const normalizeKeywordItem = (item) => {
    if (typeof item === 'string') {
      const text = normalizeText(item);
      if (!text) return null;
      return {
        keyword: text,
        keyword_cn: '',
        query: text,
      };
    }
    if (!item || typeof item !== 'object') return null;

    const keyword = normalizeText(item.keyword || item.expr || item.text || '');
    if (!keyword) return null;
    const query = normalizeText(
      item.query ||
        item.rewrite ||
        item.rewrite_for_embedding ||
        item.text ||
        item.keyword ||
        '',
    );
    const keywordCn = normalizeText(item.keyword_cn || item.keyword_zh || item.zh || '');

    return {
      keyword,
      keyword_cn: keywordCn,
      query: query || keyword,
      embedding_cache:
        item.embedding_cache && typeof item.embedding_cache === 'object'
          ? cloneDeep(item.embedding_cache)
          : undefined,
    };
  };

  const dedupeKeywords = (items) => {
    const list = Array.isArray(items) ? items : [];
    const seen = new Set();
    const out = [];
    for (const item of list) {
      if (!item || typeof item !== 'object') continue;
      const key = normalizeText(item.keyword || '').toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(item);
    }
    return out;
  };

  const normalizeIntentQueryItem = (item) => {
    if (typeof item === 'string') {
      const query = normalizeText(item);
      if (!query) return null;
      return {
        query,
        query_cn: '',
        enabled: true,
        source: 'manual',
      };
    }
    if (!item || typeof item !== 'object') return null;

    const query = normalizeText(item.query || item.text || item.keyword || item.expr || '');
    if (!query) return null;
    const queryCn = normalizeText(item.query_cn || item.query_zh || item.zh || item.note || '');

    return {
      query,
      query_cn: queryCn,
      enabled: item.enabled !== false,
      source: normalizeText(item.source || 'manual'),
      note: normalizeText(item.note || ''),
      embedding_cache:
        item.embedding_cache && typeof item.embedding_cache === 'object'
          ? cloneDeep(item.embedding_cache)
          : undefined,
    };
  };

  const normalizeIntentQueries = (items) => {
    const list = Array.isArray(items) ? items : [];
    const seen = new Set();
    const out = [];
    for (const item of list) {
      const normalized = normalizeIntentQueryItem(item);
      if (!normalized) continue;
      const key = normalizeText(normalized.query).toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(normalized);
    }
    return out;
  };

  const fillQuickRunOptions = (yearSelectEl, confSelectEl) => {
    if (yearSelectEl && !yearSelectEl._dprQuickRunOptionsFilled) {
      yearSelectEl._dprQuickRunOptionsFilled = true;
      const currentYear = new Date().getFullYear();
      for (let y = currentYear; y >= currentYear - 8; y -= 1) {
        const opt = document.createElement('option');
        opt.value = String(y);
        opt.textContent = String(y);
        yearSelectEl.appendChild(opt);
      }
    }

    if (confSelectEl && !confSelectEl._dprQuickRunOptionsFilled) {
      confSelectEl._dprQuickRunOptionsFilled = true;
      QUICK_RUN_CONFERENCES.forEach((name) => {
        const opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        confSelectEl.appendChild(opt);
      });
    }
  };

    const refreshQuickRunButtons = () => {
    const blocked = hasUnsavedChanges;
    [quickRun10dBtn, quickRun30dBtn, quickRun30dStandardBtn, runByDateBtn].forEach((btn) => {
      if (!btn) return;
      btn.disabled = blocked;
      btn.classList.toggle('chat-quick-run-item--disabled', blocked);
      btn.title = blocked
        ? '请先点击“保存”后再运行。'
        : (btn.getAttribute('data-default-title') || btn.textContent || '');
    });
    if (blocked && quickRunMsgEl) {
      quickRunMsgEl.textContent = '检测到未保存修改，请先保存。';
      quickRunMsgEl.style.color = '#c00';
    }
  };

  const setQuickRunMessage = (text, color) => {
    if (quickRunMsgEl) {
      quickRunMsgEl.textContent = text || '';
      quickRunMsgEl.style.color = color || '#666';
    }
    if (msgEl && msgEl !== quickRunMsgEl) {
      msgEl.textContent = text || '';
      msgEl.style.color = color || '#666';
    }
  };
  const buildDateTokenFromInputs = () => {
    const single = normalizeText(runDateSingleEl && runDateSingleEl.value);
    const start = normalizeText(runDateRangeStartEl && runDateRangeStartEl.value);
    const end = normalizeText(runDateRangeEndEl && runDateRangeEndEl.value);
    if (single) {
      return { token: single.replace(/-/g, ''), error: '' };
    }
    if (start && end) {
      if (start > end) {
        return { token: '', error: '日期范围无效：开始日期不能晚于结束日期。' };
      }
      return {
        token: `${start.replace(/-/g, '')}-${end.replace(/-/g, '')}`,
        error: '',
      };
    }
    return { token: '', error: '' };
  };

  const runMainByDate = () => {
    if (hasUnsavedChanges) {
      setQuickRunMessage('请先保存配置后再运行。', '#c00');
      return;
    }
    if (!window.DPRWorkflowRunner || typeof window.DPRWorkflowRunner.runMainByDateToken !== 'function') {
      setQuickRunMessage('工作流触发器未加载。', '#c00');
      return;
    }

    const dateResult = buildDateTokenFromInputs();
    if (dateResult.error) {
      setQuickRunMessage(dateResult.error, '#c00');
      return;
    }
    if (!dateResult.token) {
      setQuickRunMessage('请选择单日，或填写完整的连续日期范围。', '#c00');
      return;
    }

    const mode = normalizeText(runModeSelectEl && runModeSelectEl.value) || 'auto';
    const fetchSource = normalizeText(runSourceSelectEl && runSourceSelectEl.value) || 'email';
    window.DPRWorkflowRunner.runMainByDateToken(dateResult.token, {
      mode,
      fetchSource,
    });
    setQuickRunMessage(`已触发：date=${dateResult.token}, mode=${mode}, source=${fetchSource}`, '#080');
  };

  const runQuickFetch = (days, msgEl, tipText, runOptions) => {
    if (hasUnsavedChanges) {
      const text = '妫€娴嬪埌鏈繚瀛樹慨鏀癸紝璇峰厛鐐瑰嚮鈥滀繚瀛樷€濆悗鍐嶅彂璧峰揩閫熸姄鍙栥€?;
      if (msgEl) {
        msgEl.textContent = text;
        msgEl.style.color = '#c00';
      }
      setQuickRunMessage(text, '#c00');
      return false;
    }
    if (!window.DPRWorkflowRunner || typeof window.DPRWorkflowRunner.runQuickFetchByDays !== 'function') {
      const text = '宸ヤ綔娴佽Е鍙戝櫒鏈姞杞藉埌褰撳墠椤甸潰銆?;
      if (msgEl) {
        msgEl.textContent = text;
        msgEl.style.color = '#c00';
      }
      setQuickRunMessage(text, '#c00');
      return false;
    }
    const options = runOptions && typeof runOptions === 'object' ? runOptions : {};
    window.DPRWorkflowRunner.runQuickFetchByDays(days, options);
    const finalTip = (typeof tipText === 'string' ? tipText : null) || `宸插彂璧?${days} 澶╁唴鎶撳彇浠诲姟銆俙;
    if (msgEl) {
      msgEl.textContent = finalTip;
      msgEl.style.color = '#080';
    }
    setQuickRunMessage(finalTip, '#080');
    return true;
  };

  const runProfileQuickFetch = (profileTag, days, runOptions) => {
    const normalizedTag = normalizeText(profileTag);
    if (!normalizedTag) {
      setQuickRunMessage('璇嶆潯鏍囩涓虹┖锛屾棤娉曞彂璧峰崟璇嶆潯鎶撳彇銆?, '#c00');
      return false;
    }
    const options = runOptions && typeof runOptions === 'object' ? cloneDeep(runOptions) : {};
    const dispatchInputs = isPlainObject(options.dispatchInputs) ? options.dispatchInputs : {};
    options.dispatchInputs = {
      ...dispatchInputs,
      profile_tag: normalizedTag,
    };
    const fetchMode = normalizeText(options.fetchMode).toLowerCase();
    const modeText = fetchMode === 'standard'
      ? '30 澶╂爣鍑嗘姄鍙栦换鍔?
      : (fetchMode === 'skims' ? '30 澶╅€熻鎶撳彇浠诲姟' : `${days} 澶╂姄鍙栦换鍔);
    const tip = `宸插彂璧疯瘝鏉°€?{normalizedTag}銆嶇殑${modeText}銆俙;
    return runQuickFetch(days, quickRunMsgEl || msgEl, tip, options);
  };

  const runQuickConferencePlaceholder = (yearSelectEl, confSelectEl, msgEl) => {
    const year = (yearSelectEl && yearSelectEl.value) || '';
    const conf = String((confSelectEl && confSelectEl.value) || '').trim();
    if (!year || !conf) {
      if (msgEl) {
        msgEl.textContent = '璇峰厛閫夋嫨骞翠唤鍜屼細璁悕銆?;
        msgEl.style.color = '#c00';
      }
      return;
    }
    if (msgEl) {
      msgEl.textContent = `${year} ${conf} 鐨勪細璁鏂囨姄鍙栧姛鑳芥殏鏈帴鍏ャ€俙;
      msgEl.style.color = '#c90';
    }
  };

  const runResetContent = (msgEl) => {
    if (String(window.DPR_ACCESS_MODE || '') !== 'full') {
      if (msgEl) {
        msgEl.textContent = '鏈娴嬪埌瀹屾暣鐧诲綍鏉冮檺锛屽嵄闄╂搷浣滄湭寮€鍚€?;
        msgEl.style.color = '#c00';
      }
      return;
    }

    const confirmText = window.prompt(
      '鍗遍櫓鎿嶄綔锛氳鎿嶄綔浼氬皢 docs 澶囦唤涓?docs_backup_xxx 鍚庢仮澶嶄负 docs_init锛屽苟娓呯┖ archive銆傝緭鍏ャ€孯ESET_ALL銆嶇‘璁ゃ€?,
    );
    if (confirmText !== 'RESET_ALL') {
      if (msgEl) {
        msgEl.textContent = '宸插彇娑堝嵄闄╂搷浣溿€?;
        msgEl.style.color = '#666';
      }
      return;
    }

    if (!window.DPRWorkflowRunner || typeof window.DPRWorkflowRunner.runWorkflowByKey !== 'function') {
      if (msgEl) {
        msgEl.textContent = '宸ヤ綔娴佽Е鍙戝櫒鏈姞杞藉埌褰撳墠椤甸潰銆?;
        msgEl.style.color = '#c00';
      }
      return;
    }

    window.DPRWorkflowRunner.runWorkflowByKey('reset-content');
    if (msgEl) {
      msgEl.textContent = '宸插彂璧峰垹闄ゅ苟閲嶇疆浠诲姟锛屽凡瑙﹀彂宸ヤ綔娴併€?;
      msgEl.style.color = '#080';
    }
  };

  const normalizeProfiles = (subs, availableSources) => {
    const profiles = Array.isArray(subs.intent_profiles) ? subs.intent_profiles : [];
    return profiles
      .map((p, idx) => {
        if (!p || typeof p !== 'object') return null;
        const tag = normalizeText(p.tag) || toStableId(p.description || `profile-${idx + 1}`);
        const description = normalizeText(p.description || '');
        const enabled = p.enabled !== false;
        const fallbackToArxiv = !Object.prototype.hasOwnProperty.call(p, 'paper_sources');
        const paperSources = normalizePaperSources(p.paper_sources, { fallbackToArxiv });
        const keywordRules = (Array.isArray(p.keywords) ? p.keywords : []).map(normalizeKeywordItem).filter(Boolean);
        const normalizedKeywords = dedupeKeywords(keywordRules);
        const normalizedIntentQueries = normalizeIntentQueries(p.intent_queries);
        if (!keywordRules.length && !normalizedKeywords.length && !normalizedIntentQueries.length) {
          return null;
        }

        const result = {
          tag,
          description,
          enabled,
          paper_sources: paperSources,
          keywords: normalizedKeywords,
          intent_queries: normalizedIntentQueries,
          updated_at: normalizeText(p.updated_at) || new Date().toISOString(),
        };
        if ('paused' in p) {
          result.paused = !!p.paused;
        }
        return result;
      })
      .filter(Boolean);
  };

  const validateIntentProfiles = (config) => {
    const cfg = ensureSourceBackendsForProfiles(cloneDeep(config || {}));
    const subs = (cfg && cfg.subscriptions) || {};
    const availableSources = getAvailablePaperSources(cfg);
    const profiles = Array.isArray(subs.intent_profiles) ? subs.intent_profiles : [];
    for (let idx = 0; idx < profiles.length; idx += 1) {
      const profile = profiles[idx];
      if (!profile || typeof profile !== 'object') continue;
      const tag = normalizeText(profile.tag) || `璇嶆潯${idx + 1}`;
      const fallbackToArxiv = !Object.prototype.hasOwnProperty.call(profile, 'paper_sources');
      const paperSources = normalizePaperSources(profile.paper_sources, { fallbackToArxiv });
      const keywords = dedupeKeywords(
        (Array.isArray(profile.keywords) ? profile.keywords : [])
          .map(normalizeKeywordItem)
          .filter(Boolean),
      );
      const intentQueries = normalizeIntentQueries(profile.intent_queries);
      if (!paperSources.length) {
        return `璇嶆潯銆?{tag}銆嶈嚦灏戦渶瑕?1 涓鏂囨簮銆俙;
      }
      const unknownSources = paperSources.filter((item) => !availableSources.includes(item));
      if (unknownSources.length) {
        return `璇嶆潯銆?{tag}銆嶅寘鍚湭閰嶇疆鐨勮鏂囨簮锛?{unknownSources.join(', ')}銆俙;
      }
      if (!keywords.length) {
        return `璇嶆潯銆?{tag}銆嶈嚦灏戦渶瑕?1 鏉″叧閿瘝銆俙;
      }
      if (keywords.length > MAX_KEYWORDS_PER_PROFILE) {
        return `璇嶆潯銆?{tag}銆嶇殑鍏抽敭璇嶆渶澶氬彧鑳戒繚鐣?${MAX_KEYWORDS_PER_PROFILE} 鏉°€俙;
      }
      if (!intentQueries.length) {
        return `璇嶆潯銆?{tag}銆嶈嚦灏戦渶瑕?1 鏉℃剰鍥綫uery銆俙;
      }
      if (intentQueries.length > MAX_INTENT_QUERIES_PER_PROFILE) {
        return `璇嶆潯銆?{tag}銆嶇殑鎰忓浘Query 鏈€澶氬彧鑳戒繚鐣?${MAX_INTENT_QUERIES_PER_PROFILE} 鏉°€俙;
      }
    }
    return '';
  };

  const stripIntentProfileIds = (config) => {
    const next = cloneDeep(config || {});
    if (!next || typeof next !== 'object') return next;
    const subscriptions = next.subscriptions;
    if (!subscriptions || typeof subscriptions !== 'object') return next;
    const profiles = Array.isArray(subscriptions.intent_profiles) ? subscriptions.intent_profiles : [];
    if (!profiles.length) return next;

    subscriptions.intent_profiles = profiles
      .filter((p) => p && typeof p === 'object')
      .map((p) => {
        const profile = cloneDeep(p) || {};
        delete profile.id;

        if (Array.isArray(profile.keywords)) {
          profile.keywords = profile.keywords
            .filter((k) => k && typeof k === 'object')
            .map((k) => {
              const keyword = cloneDeep(k);
              delete keyword.id;
              return keyword;
            });
        }

        if (Array.isArray(profile.intent_queries)) {
          profile.intent_queries = profile.intent_queries
            .filter((item) => item && typeof item === 'object')
            .map((item) => {
              const intentQuery = cloneDeep(item);
              delete intentQuery.id;
              return intentQuery;
            });
        }

        return profile;
      });

    next.subscriptions = subscriptions;
    return next;
  };

  const migrateLegacyToProfilesIfNeeded = (subs) => {
    const existingProfiles = normalizeProfiles(subs);
    if (existingProfiles.length > 0) {
      subs.intent_profiles = existingProfiles;
    } else {
      subs.intent_profiles = [];
    }
    delete subs.keywords;
    delete subs.llm_queries;
    return subs;
  };

  const normalizeSubscriptions = (config) => {
    const next = cloneDeep(config || {});
    if (!next.arxiv_paper_setting || typeof next.arxiv_paper_setting !== 'object') {
      next.arxiv_paper_setting = {};
    }
    const fetchSource = normalizeText(next.arxiv_paper_setting.fetch_source).toLowerCase();
    next.arxiv_paper_setting.fetch_source = fetchSource === 'arxiv' ? 'arxiv' : 'email';

    if (!next.subscriptions) next.subscriptions = {};
    const subs = next.subscriptions;

    migrateLegacyToProfilesIfNeeded(subs);
      subs.intent_profiles = normalizeProfiles(subs, getAvailablePaperSources(next));

    if (!subs.schema_migration || typeof subs.schema_migration !== 'object') {
      subs.schema_migration = {};
    }
    if (!normalizeText(subs.schema_migration.stage)) {
      subs.schema_migration.stage = 'A';
    }
    if (!normalizeText(subs.schema_migration.diff_threshold_pct)) {
      subs.schema_migration.diff_threshold_pct = 15;
    }

    if (!normalizeText(subs.keyword_recall_mode)) {
      subs.keyword_recall_mode = 'or';
    }

    next.subscriptions = subs;
    ensureSourceBackendsForProfiles(next);
    return stripIntentProfileIds(next);
  };

  const setMessage = (text, color) => {
    if (!msgEl) return;
    msgEl.textContent = text || '';
    msgEl.style.color = color || '#666';
  };

  const ensureOverlay = () => {
    if (overlay && panel) return;
    overlay = document.getElementById('arxiv-search-overlay');
    if (overlay) {
      panel = document.getElementById('arxiv-search-panel');
      return;
    }

    overlay = document.createElement('div');
    overlay.id = 'arxiv-search-overlay';
    overlay.innerHTML = `
      <div id="arxiv-search-panel">
        <div id="arxiv-search-panel-header">
          <div style="font-weight:600;">鍚庡彴绠＄悊</div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button id="arxiv-config-save-btn" class="arxiv-tool-btn" style="padding:2px 10px; background:#2e7d32; color:white;">淇濆瓨</button>
            <button id="arxiv-open-secret-setup-btn" class="arxiv-tool-btn" style="padding:2px 10px;">瀵嗛挜閰嶇疆</button>
            <button id="arxiv-search-close-btn" class="arxiv-tool-btn" style="padding:2px 6px;">鍏抽棴</button>
          </div>
        </div>

        <div id="arxiv-search-panel-body">
          <div id="arxiv-search-panel-main">
            <div id="dpr-smart-query-section" class="arxiv-pane dpr-smart-pane">
              <div class="dpr-display-card">
                <div id="dpr-sq-display" class="dpr-sq-display"></div>
              </div>

              <div class="dpr-input-card">
                <div class="dpr-inline-row">
                  <button id="dpr-sq-open-chat-btn" class="arxiv-tool-btn" style="background:#2e7d32; color:#fff;">鏂板</button>
                </div>
              </div>
            </div>

            <div id="dpr-smart-msg" style="font-size:12px; color:#666; margin-top:10px;">鎻愮ず锛氫慨鏀瑰悗鐐瑰嚮銆屼繚瀛樸€嶆墠浼氬啓鍏?config.yaml銆?/div>
          </div>

          <div id="arxiv-search-quick-run-divider" aria-hidden="true"></div>

          <div id="arxiv-search-quick-run-side">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px;">
              <div class="chat-quick-run-title" style="margin:0;">按日期运行</div>
              <button id="arxiv-admin-open-workflow-panel-btn" class="arxiv-tool-btn" type="button" style="padding:2px 8px;">打开工作流面板</button>
            </div>
            <div class="chat-quick-run-row">
              <label for="arxiv-admin-run-date-single">单日</label>
              <input id="arxiv-admin-run-date-single" type="date" style="width:100%;" />
            </div>
            <div class="chat-quick-run-row">
              <label for="arxiv-admin-run-date-start">范围开始</label>
              <input id="arxiv-admin-run-date-start" type="date" style="width:100%;" />
            </div>
            <div class="chat-quick-run-row">
              <label for="arxiv-admin-run-date-end">范围结束</label>
              <input id="arxiv-admin-run-date-end" type="date" style="width:100%;" />
            </div>
            <div class="chat-quick-run-row">
              <label for="arxiv-admin-run-source-select">来源</label>
              <select id="arxiv-admin-run-source-select">
                <option value="email">email</option>
                <option value="arxiv">arxiv</option>
              </select>
            </div>
            <div class="chat-quick-run-row">
              <label for="arxiv-admin-run-mode-select">模式</label>
              <select id="arxiv-admin-run-mode-select">
                <option value="auto">auto</option>
                <option value="standard">standard</option>
                <option value="skims">skims</option>
              </select>
            </div>
            <button id="arxiv-admin-run-by-date-btn" class="chat-quick-run-run-btn" type="button">运行 main.py</button>
            <div id="arxiv-admin-quick-run-msg" class="chat-quick-run-msg"></div>

            <div class="chat-quick-run-divider" aria-hidden="true"></div>
            <div class="chat-quick-run-title">危险操作</div>
            <button
              id="arxiv-admin-reset-content-btn"
              class="chat-quick-run-run-btn"
              type="button"
              style="background:#c62828; color:#fff; border-color:#b71c1c;"
            >
              删除所有
            </button>
            <div id="arxiv-admin-reset-content-msg" class="chat-quick-run-msg"></div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    panel = document.getElementById('arxiv-search-panel');

    saveBtn = document.getElementById('arxiv-config-save-btn');
    closeBtn = document.getElementById('arxiv-search-close-btn');
    msgEl = document.getElementById('dpr-smart-msg');

    const reloadAll = () => {
      renderFromDraft();
    };

    if (window.SubscriptionsSmartQuery) {
      window.SubscriptionsSmartQuery.attach({
        displayListEl: document.getElementById('dpr-sq-display'),
        openChatBtn: document.getElementById('dpr-sq-open-chat-btn'),
        msgEl,
        reloadAll,
      });
    }

    bindBaseEvents();
  };

  const renderFromDraft = () => {
    const cfg = draftConfig || {};
    const subs = (cfg && cfg.subscriptions) || {};
    const profiles = Array.isArray(subs.intent_profiles) ? subs.intent_profiles : [];
    if (window.SubscriptionsSmartQuery && window.SubscriptionsSmartQuery.render) {
      window.SubscriptionsSmartQuery.render(profiles);
    }
    if (window.SubscriptionsSmartQuery && window.SubscriptionsSmartQuery.clearPendingDeletedProfileIds) {
      window.SubscriptionsSmartQuery.clearPendingDeletedProfileIds();
    }
  };

  const loadSubscriptions = async () => {
    try {
      if (!window.SubscriptionsGithubToken || !window.SubscriptionsGithubToken.loadConfig) {
        throw new Error('SubscriptionsGithubToken.loadConfig 涓嶅彲鐢?);
      }
      const { config } = await window.SubscriptionsGithubToken.loadConfig();
      draftConfig = normalizeSubscriptions(config || {});
      hasUnsavedChanges = false;
      if (runSourceSelectEl) {
        const sourceValue = normalizeText(
          draftConfig
          && draftConfig.arxiv_paper_setting
          && draftConfig.arxiv_paper_setting.fetch_source,
        ).toLowerCase();
        runSourceSelectEl.value = sourceValue === 'arxiv' ? 'arxiv' : 'email';
      }
      refreshQuickRunButtons();
      if (window.SubscriptionsSmartQuery && window.SubscriptionsSmartQuery.clearPendingDeletedProfileIds) {
        window.SubscriptionsSmartQuery.clearPendingDeletedProfileIds();
      }
      renderFromDraft();
      setMessage('宸插姞杞介厤缃紝鍙紑濮嬬紪杈戙€?, '#666');
    } catch (e) {
      console.error(e);
      setMessage('鍔犺浇閰嶇疆澶辫触锛岃纭 GitHub Token 鍙敤銆?, '#c00');
    }
  };

  const saveDraftConfig = async () => {
    if (isSavingDraftConfig) {
      setMessage('姝ｅ湪淇濆瓨涓紝璇风◢鍚?..', '#666');
      return;
    }
    if (!window.SubscriptionsGithubToken || !window.SubscriptionsGithubToken.saveConfig) {
      setMessage('褰撳墠鏃犳硶淇濆瓨閰嶇疆锛岃鍏堝畬鎴?GitHub 鐧诲綍銆?, '#c00');
      return;
    }
    if (!draftConfig) {
      setMessage('閰嶇疆灏氭湭鍔犺浇瀹屾垚锛岃鍏堢瓑寰呴厤缃鍙栧畬鎴愬悗鍐嶈瘯銆?, '#c00');
      return;
    }
    try {
      isSavingDraftConfig = true;
      if (saveBtn) {
        saveBtn.disabled = true;
      }
      const draftToSave = cloneDeep(draftConfig || {});
      if (!draftToSave.arxiv_paper_setting || typeof draftToSave.arxiv_paper_setting !== 'object') {
        draftToSave.arxiv_paper_setting = {};
      }
      const selectedFetchSource = normalizeText(runSourceSelectEl && runSourceSelectEl.value).toLowerCase();
      draftToSave.arxiv_paper_setting.fetch_source = selectedFetchSource === 'arxiv' ? 'arxiv' : 'email';

      const toSave = normalizeSubscriptions(draftToSave);
      const validationError = validateIntentProfiles(toSave);
      if (validationError) {
        setMessage(validationError, '#c00');
        return;
      }
      setMessage('姝ｅ湪淇濆瓨閰嶇疆...', '#666');
      await window.SubscriptionsGithubToken.saveConfig(
        toSave,
        'chore: save smart query config from dashboard',
      );
      draftConfig = toSave;
      hasUnsavedChanges = false;
      refreshQuickRunButtons();
      if (window.SubscriptionsSmartQuery && window.SubscriptionsSmartQuery.clearPendingDeletedProfileIds) {
        window.SubscriptionsSmartQuery.clearPendingDeletedProfileIds();
      }
      setMessage('閰嶇疆宸蹭繚瀛樸€?, '#080');
    } catch (e) {
      console.error(e);
      const msg = e && e.message ? e.message : '鏈煡閿欒';
      setMessage(`淇濆瓨閰嶇疆澶辫触锛?{msg}`.slice(0, 180), '#c00');
    } finally {
      isSavingDraftConfig = false;
      if (saveBtn) {
        saveBtn.disabled = false;
      }
    }
  };

  const reallyCloseOverlay = () => {
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 300);
  };

  const closeOverlay = () => {
    if (hasUnsavedChanges) {
      const ok = window.confirm('妫€娴嬪埌鏈繚瀛樹慨鏀癸紝纭鐩存帴鍏抽棴骞朵涪寮冩湰鍦拌崏绋垮悧锛?);
      if (!ok) return;
      if (window.SubscriptionsSmartQuery && window.SubscriptionsSmartQuery.clearPendingDeletedProfileIds) {
        window.SubscriptionsSmartQuery.clearPendingDeletedProfileIds();
      }
      draftConfig = null;
      hasUnsavedChanges = false;
      refreshQuickRunButtons();
    }
    reallyCloseOverlay();
  };

  const openOverlay = () => {
    ensureOverlay();
    if (!overlay) return;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.classList.add('show');
      });
    });

    if (draftConfig) {
      renderFromDraft();
    } else {
      loadSubscriptions();
    }
  };

  const bindBaseEvents = () => {
    if (closeBtn && !closeBtn._bound) {
      closeBtn._bound = true;
      closeBtn.addEventListener('click', closeOverlay);
    }

    if (overlay && !overlay._boundClick) {
      overlay._boundClick = true;
      overlay.addEventListener('mousedown', (e) => {
        if (e.target === overlay) closeOverlay();
      });
    }

    if (saveBtn && !saveBtn._bound) {
      saveBtn._bound = true;
      saveBtn.addEventListener('click', saveDraftConfig);
    }

    const secretBtn = document.getElementById('arxiv-open-secret-setup-btn');
    if (secretBtn && !secretBtn._bound) {
      secretBtn._bound = true;
      secretBtn.addEventListener('click', () => {
        try {
          if (window.DPRSecretSetup && window.DPRSecretSetup.openStep2) {
            window.DPRSecretSetup.openStep2();
          } else {
            alert('褰撳墠椤甸潰灏氭湭鍔犺浇瀵嗛挜閰嶇疆鍚戝鑴氭湰锛岃鍒锋柊鍚庨噸璇曘€?);
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    quickRunOpenWorkflowPanelBtn = document.getElementById('arxiv-admin-open-workflow-panel-btn');
    runByDateBtn = document.getElementById('arxiv-admin-run-by-date-btn');
    runDateSingleEl = document.getElementById('arxiv-admin-run-date-single');
    runDateRangeStartEl = document.getElementById('arxiv-admin-run-date-start');
    runDateRangeEndEl = document.getElementById('arxiv-admin-run-date-end');
    runModeSelectEl = document.getElementById('arxiv-admin-run-mode-select');
    runSourceSelectEl = document.getElementById('arxiv-admin-run-source-select');
    quickRunMsgEl = document.getElementById('arxiv-admin-quick-run-msg');
    resetContentBtn = document.getElementById('arxiv-admin-reset-content-btn');
    resetContentMsgEl = document.getElementById('arxiv-admin-reset-content-msg');
    const fetchSource = normalizeText(
      draftConfig
      && draftConfig.arxiv_paper_setting
      && draftConfig.arxiv_paper_setting.fetch_source,
    ).toLowerCase();
    if (runSourceSelectEl) {
      runSourceSelectEl.value = fetchSource === 'arxiv' ? 'arxiv' : 'email';
    }
    [runByDateBtn].forEach((btn) => {
      if (!btn) return;
      if (!btn.dataset.defaultTitle) {
        btn.setAttribute('data-default-title', btn.textContent || '');
      }
    });
    refreshQuickRunButtons();

    if (runByDateBtn && !runByDateBtn._bound) {
      runByDateBtn._bound = true;
      runByDateBtn.addEventListener('click', runMainByDate);
    }
    if (runSourceSelectEl && !runSourceSelectEl._bound) {
      runSourceSelectEl._bound = true;
      runSourceSelectEl.addEventListener('change', () => {
        const selected = normalizeText(runSourceSelectEl.value).toLowerCase();
        if (!draftConfig || typeof draftConfig !== 'object') draftConfig = {};
        if (!draftConfig.arxiv_paper_setting || typeof draftConfig.arxiv_paper_setting !== 'object') {
          draftConfig.arxiv_paper_setting = {};
        }
        draftConfig.arxiv_paper_setting.fetch_source = selected === 'arxiv' ? 'arxiv' : 'email';
        hasUnsavedChanges = true;
        refreshQuickRunButtons();
      });
    }

    if (quickRunOpenWorkflowPanelBtn && !quickRunOpenWorkflowPanelBtn._bound) {
      quickRunOpenWorkflowPanelBtn._bound = true;
      quickRunOpenWorkflowPanelBtn.addEventListener('click', () => {
        try {
          if (window.DPRWorkflowRunner && typeof window.DPRWorkflowRunner.open === 'function') {
            window.DPRWorkflowRunner.open();
            return;
          }
        } catch (e) {
          console.error(e);
        }
        if (quickRunMsgEl) {
          quickRunMsgEl.textContent = '宸ヤ綔娴佽Е鍙戦潰鏉挎湭鍔犺浇锛岃鍒锋柊椤甸潰鍚庨噸璇曘€?;
          quickRunMsgEl.style.color = '#c00';
        }
      });
    }

    if (resetContentBtn && !resetContentBtn._bound) {
      resetContentBtn._bound = true;
      resetContentBtn.addEventListener('click', () => {
        runResetContent(resetContentMsgEl);
      });
    }

  };

  const init = () => {
    const run = () => {
      ensureOverlay();
      document.addEventListener('ensure-arxiv-ui', () => {
        ensureOverlay();
      });
      if (!document._arxivLoadSubscriptionsEventBound) {
        document._arxivLoadSubscriptionsEventBound = true;
        document.addEventListener('load-arxiv-subscriptions', () => {
          ensureOverlay();
          loadSubscriptions();
          openOverlay();
        });
      }
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', run);
    } else {
      run();
    }
  };

  return {
    init,
    openOverlay,
    closeOverlay,
    loadSubscriptions,
    markConfigDirty: () => {
      hasUnsavedChanges = true;
      refreshQuickRunButtons();
    },
    updateDraftConfig: (updater) => {
      const base = draftConfig || {};
      const next = typeof updater === 'function' ? updater(cloneDeep(base)) || base : base;
      draftConfig = normalizeSubscriptions(next);
      hasUnsavedChanges = true;
      refreshQuickRunButtons();
    },
    getDraftConfig: () => cloneDeep(draftConfig || {}),
    validateDraftConfig: () => validateIntentProfiles(draftConfig || {}),
    runProfileQuickFetch: (profileTag, days, runOptions) => runProfileQuickFetch(profileTag, days, runOptions),
    __test: {
      normalizeSubscriptions: (config) => normalizeSubscriptions(config),
      ensureSourceBackendsForProfiles: (config) => ensureSourceBackendsForProfiles(cloneDeep(config || {})),
      buildDefaultSourceBackend: (sourceKey, config) => buildDefaultSourceBackend(sourceKey, cloneDeep(config || {})),
      normalizePaperSources: (values, options) => normalizePaperSources(values, options),
    },
  };
})();



