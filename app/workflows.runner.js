// 工作流触发面板：用于从前端触发 GitHub Actions workflow，并展示运行进度
// 依赖：GitHub Token（Classic PAT），需要 repo + workflow 权限

window.DPRWorkflowRunner = (function () {
  const WORKFLOWS = [
    {
      key: 'daily-now',
      id: 'daily-paper-reader.yml',
      name: '绔嬪嵆鐖彇骞跺鐞嗚鏂?,
      desc: '瑙﹀彂 daily-paper-reader 宸ヤ綔娴侊紙鎶撳彇鈫掑彫鍥炩啋閲嶆帓鈫掔敓鎴?docs锛夈€?,
      dispatchInputs: {
        run_enrich: 'false',
      },
    },
    {
      key: 'sync',
      id: 'sync.yml',
      name: '鍚屾涓婃父浠ｇ爜',
      desc: '瑙﹀彂 Upstream Sync 宸ヤ綔娴侊紙鍚堝苟涓婃父 main 鍒板綋鍓嶄粨搴擄級銆?,
    },
    {
      key: 'reset-content',
      id: 'reset-content.yml',
      name: '閲嶇疆 content锛坉ocs + archive锛?,
      desc: '灏?docs 鎭㈠涓?docs_init 鍩虹嚎锛屽苟娓呯┖ archive銆傝鎿嶄綔涓哄嵄闄╂搷浣溿€?,
    },
  ];

  const QUICK_FETCH_PRESETS = {
    '10': {
      key: 'daily-now',
      dispatchInputs: {
        run_enrich: 'false',
        fetch_days: '10',
      },
    },
    '30': {
      key: 'daily-now',
      dispatchInputs: {
        run_enrich: 'false',
        fetch_days: '30',
        fetch_mode: 'skims',
      },
    },
    '30-skims': {
      key: 'daily-now',
      dispatchInputs: {
        run_enrich: 'false',
        fetch_days: '30',
        fetch_mode: 'skims',
      },
    },
    '30-standard': {
      key: 'daily-now',
      dispatchInputs: {
        run_enrich: 'false',
        fetch_days: '30',
        fetch_mode: 'standard',
      },
    },
  };

  let overlay = null;
  let panel = null;
  let statusEl = null;
  let runsEl = null;
  let recentEl = null;
  let refreshTimer = null;
  let activeRun = null;
  let selectedRun = null;
  const lastRunStateById = {};
  let repoContextCache = null;

  const escapeHtml = (str) => {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  const loadGithubToken = () => {
    try {
      const secret = window.decoded_secret_private || {};
      if (secret.github && secret.github.token) {
        return String(secret.github.token || '').trim();
      }
    } catch {
      // ignore
    }
    try {
      const raw = window.localStorage
        ? window.localStorage.getItem('github_token_data')
        : '';
      if (!raw) return '';
      const obj = JSON.parse(raw);
      return String((obj && obj.token) || '').trim();
    } catch {
      return '';
    }
  };

  const resolveRepoFromUrl = async (token) => {
    const currentUrl = window.location.href || '';
    const githubPagesMatch = currentUrl.match(
      /https?:\/\/([^.]+)\.github\.io\/([^\/]+)/,
    );
    if (githubPagesMatch) {
      return { owner: githubPagesMatch[1], repo: githubPagesMatch[2] };
    }

    // 闈?GitHub Pages URL锛氬洖閫€鍒般€孴oken 瀵瑰簲鐨勭敤鎴?+ daily-paper-reader銆嶄綔涓洪粯璁ょ洰鏍囦粨搴?    try {
      const userRes = await ghFetch(token, 'https://api.github.com/user');
      if (userRes.ok) {
        const user = await userRes.json();
        const login = (user && user.login) ? String(user.login) : '';
        if (login) {
          return { owner: login, repo: 'daily-paper-reader' };
        }
      }
    } catch {
      // ignore
    }

    return { owner: '', repo: '' };
  };

  const resolveRepoContext = async (token, options = {}) => {
    const { forceRefresh = false } = options || {};
    const { owner, repo } = await resolveRepoFromUrl(token);
    if (!owner || !repo) {
      return { owner: '', repo: '', isFork: null, defaultBranch: 'main' };
    }

    const cacheKey = `${owner}/${repo}`;
    if (!forceRefresh && repoContextCache && repoContextCache.key === cacheKey && repoContextCache.value) {
      return repoContextCache.value;
    }
    if (!forceRefresh && repoContextCache && repoContextCache.key === cacheKey && repoContextCache.promise) {
      return repoContextCache.promise;
    }

    const fetchPromise = (async () => {
      try {
        const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
        const res = await ghFetch(token, repoUrl);
        if (!res.ok) {
          return { owner, repo, isFork: null, defaultBranch: 'main' };
        }
        const data = await res.json().catch(() => null);
        return {
          owner,
          repo,
          isFork: !!(data && data.fork),
          defaultBranch: String((data && data.default_branch) || 'main'),
        };
      } catch {
        return { owner, repo, isFork: null, defaultBranch: 'main' };
      }
    })();

    repoContextCache = { key: cacheKey, promise: fetchPromise, value: null };
    const value = await fetchPromise;
    repoContextCache = { key: cacheKey, promise: null, value };
    return value;
  };

  const ghFetch = async (token, url, init) => {
    const res = await fetch(url, {
      ...(init || {}),
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        ...(init && init.headers ? init.headers : {}),
      },
    });
    return res;
  };

  const resolveWorkflowRunInputs = async (owner, repo, token, runId) => {
    if (!owner || !repo || !runId || !token) return null;
    const runUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`;
    try {
      const res = await ghFetch(token, runUrl);
      if (!res.ok) return null;
      const data = await res.json().catch(() => null);
      if (!data || typeof data !== 'object') return null;
      if (data.inputs && typeof data.inputs === 'object') {
        return data.inputs;
      }
      return null;
    } catch {
      return null;
    }
  };

  const resolveRecentRunTag = async (owner, repo, token, run) => {
    if (!run) return 'daily-now';
    // 缁熶竴褰掔被鍒?daily-now锛岃Е鍙戦潰鏉夸笉鍐嶅崟鐙睍绀轰竴涓湀/涓€涓湀鏍囧噯鍏ュ彛
    if (run.inputs && typeof run.inputs === 'object') return 'daily-now';
    await resolveWorkflowRunInputs(owner, repo, token, run.id);
    return 'daily-now';
  };

  const setStatus = (text, color, options = {}) => {
    if (!statusEl) return;
    statusEl.textContent = text || '';
    statusEl.style.color = color || '#666';
    statusEl.classList.toggle('is-waiting', !!(options && options.waiting));
  };

  const ensureOverlay = () => {
    if (overlay && panel) return;
    overlay = document.getElementById('dpr-workflow-overlay');
    if (overlay) {
      panel = document.getElementById('dpr-workflow-panel');
      statusEl = document.getElementById('dpr-workflow-status');
      runsEl = document.getElementById('dpr-workflow-runs');
      recentEl = document.getElementById('dpr-workflow-recent');
      return;
    }

    overlay = document.createElement('div');
    overlay.id = 'dpr-workflow-overlay';
    overlay.innerHTML = `
      <div id="dpr-workflow-panel">
        <div id="dpr-workflow-header">
          <div style="font-weight:600;">宸ヤ綔娴佽Е鍙?/div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button id="dpr-workflow-refresh-btn" class="arxiv-tool-btn" style="padding:2px 10px;">鍒锋柊</button>
            <button id="dpr-workflow-close-btn" class="arxiv-tool-btn" style="padding:2px 6px;">鍏抽棴</button>
          </div>
        </div>
        <div id="dpr-workflow-body">
          <div id="dpr-workflow-status" style="font-size:12px; color:#666; margin-bottom:10px;">鍑嗗灏辩华銆?/div>
          <div style="font-weight:600; font-size:13px; margin-bottom:6px;">鏈€杩戣繍琛岋紙鍚勫彇 3 鏉★級</div>
          <div id="dpr-workflow-recent" style="font-size:12px; color:#333; border:1px solid #eee; border-radius:8px; background:#fff; padding:10px; margin-bottom:12px;">
            <div style="color:#999;">鍔犺浇涓?..</div>
          </div>
          <div style="font-weight:600; font-size:13px; margin-bottom:6px;">鎵ц杩囩▼</div>
          <div id="dpr-workflow-runs" style="font-size:12px; color:#333; border:1px solid #eee; border-radius:8px; background:#fff; padding:10px; min-height:120px;">
            <div style="color:#999;">灏氭湭瑙﹀彂宸ヤ綔娴併€?/div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);

    panel = document.getElementById('dpr-workflow-panel');
    statusEl = document.getElementById('dpr-workflow-status');
    runsEl = document.getElementById('dpr-workflow-runs');
    recentEl = document.getElementById('dpr-workflow-recent');

    const closeBtn = document.getElementById('dpr-workflow-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', close);
    }
    overlay.addEventListener('mousedown', (e) => {
      if (e.target === overlay) close();
    });

    const refreshBtn = document.getElementById('dpr-workflow-refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        const r = selectedRun || activeRun;
        if (r && r.owner && r.repo && r.runId) {
          refreshRun(r.owner, r.repo, r.runId);
        } else {
          setStatus('鏆傛棤鍙埛鏂扮殑杩愯璁板綍銆?, '#666');
        }
      });
    }

  };

  const open = () => {
    ensureOverlay();
    if (!overlay) return;
    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('show'));
    // 鎵撳紑闈㈡澘鏃跺皾璇曞姞杞芥渶杩戣繍琛岋紙涓嶄緷璧栬Е鍙戯級
    loadRecentRuns();
    return true;
  };

  const close = () => {
    if (!overlay) return;
    overlay.classList.remove('show');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 160);
    stopPolling();
  };

  const stopPolling = () => {
    if (refreshTimer) {
      clearInterval(refreshTimer);
      refreshTimer = null;
    }
  };

  const badgeColorFor = (status, conclusion) => {
    if (conclusion === 'success') return '#2e7d32';
    if (conclusion === 'failure') return '#c00';
    if (conclusion === 'cancelled') return '#666';
    if (status === 'in_progress') return '#1565c0';
    return '#666';
  };

  const formatRunBadgeText = (status, conclusion) => {
    const s = String(status || '');
    const c = String(conclusion || '');
    // 鐢ㄦ埛甯屾湜 completed / success 杩欑鍐椾綑灞曠ず鍘绘帀锛氫紭鍏堝睍绀?conclusion锛屽叾娆?status
    return c || s || '';
  };

  const formatRunTime = (isoTime) => {
    if (!isoTime) return '';
    try {
      const d = new Date(isoTime);
      if (Number.isNaN(d.getTime())) {
        return String(isoTime).replace('T', ' ').replace('Z', '');
      }
      return d.toLocaleString('zh-CN', {
        timeZone: 'Asia/Shanghai',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return String(isoTime || '');
    }
  };

  const renderRecentRuns = (owner, repo, byWorkflow, errText, repoContext = null) => {
    if (!recentEl) return;
    recentEl.classList.remove('is-loading');
    if (errText) {
      recentEl.innerHTML = `<div style="color:#c00;">${escapeHtml(errText)}</div>`;
      return;
    }
    const blocks = WORKFLOWS.map((wf) => {
      if (wf.key === 'sync' && repoContext && repoContext.isFork === false) {
        return `
          <div class="dpr-wf-recent-block">
            <div class="dpr-wf-recent-block-title">${escapeHtml(wf.name)}</div>
            <div style="color:#c90;">褰撳墠浠撳簱涓嶆槸 GitHub Fork锛屽凡绂佺敤涓婃父鍚屾銆?/div>
          </div>
        `;
      }
      const list = (byWorkflow && byWorkflow[String(wf.key || wf.id || '')]) || [];
      const items = Array.isArray(list) ? list : [];
      const lines = items
        .map((r) => {
          const status = r.status || '';
          const conclusion = r.conclusion || '';
          const color = badgeColorFor(status, conclusion);
          const isActive =
            selectedRun &&
            String(selectedRun.runId || '') === String(r.id || '');
          const createdAt = formatRunTime(r.created_at);
          const badge = formatRunBadgeText(status, conclusion);
          const title = `#${r.run_number || r.id}${badge ? ` ${badge}` : ''}`;
          return `
            <button class="dpr-wf-recent-item ${isActive ? 'is-active' : ''}" data-run-id="${escapeHtml(
              String(r.id || ''),
            )}" style="text-align:left;">
              <div class="dpr-wf-recent-title">
                <span class="dpr-wf-recent-badge" style="color:${color};">${escapeHtml(
                  title,
                )}</span>
                <span class="dpr-wf-recent-time">${escapeHtml(createdAt)}</span>
              </div>
              <div class="dpr-wf-recent-sub">${escapeHtml(wf.name)}</div>
            </button>
          `;
        })
        .join('');
      return `
        <div class="dpr-wf-recent-block">
          <div class="dpr-wf-recent-block-title">${escapeHtml(wf.name)}</div>
          ${lines || '<div style="color:#999;">鏆傛棤杩愯璁板綍</div>'}
        </div>
      `;
    }).join('');

    recentEl.innerHTML = blocks;

    recentEl.querySelectorAll('.dpr-wf-recent-item').forEach((btn) => {
      if (btn._bound) return;
      btn._bound = true;
      btn.addEventListener('click', async () => {
        const runId = btn.getAttribute('data-run-id') || '';
        if (!runId) return;
        stopPolling();
        recentEl
          .querySelectorAll('.dpr-wf-recent-item.is-active')
          .forEach((n) => n.classList.remove('is-active'));
        btn.classList.add('is-active');
        selectedRun = { owner, repo, runId, token: loadGithubToken() };
        setStatus(`姝ｅ湪鍔犺浇杩愯璇︽儏锛歳un_id=${runId}`, '#666', { waiting: true });
        await refreshRun(owner, repo, runId);
        refreshTimer = setInterval(() => {
          if (!selectedRun) return;
          refreshRun(selectedRun.owner, selectedRun.repo, selectedRun.runId);
        }, 5000);
      });
    });
  };

  const loadRecentRuns = async () => {
    ensureOverlay();
    if (!recentEl) return;
    const token = loadGithubToken();
    if (!token) {
      recentEl.classList.remove('is-loading');
      recentEl.innerHTML =
        '<div style="color:#c00;">鏈娴嬪埌 GitHub Token锛屾棤娉曞姞杞芥渶杩戣繍琛岃褰曘€?/div>';
      return;
    }

    try {
      const repoContext = await resolveRepoContext(token);
      const { owner, repo } = repoContext;
      if (!owner || !repo) {
        renderRecentRuns(owner, repo, null, '鏃犳硶鎺ㄦ柇鐩爣浠撳簱锛屾棤娉曞姞杞芥渶杩戣繍琛岃褰曘€?);
        return;
      }

      const hasRendered = !!recentEl.querySelector('.dpr-wf-recent-block');
      if (!hasRendered) {
        recentEl.innerHTML = '<div style="color:#999;">姝ｅ湪鍔犺浇鏈€杩戣繍琛岃褰?..</div>';
      } else {
        // 鍒锋柊鏃朵笉瑕佹竻绌虹幇鏈夊唴瀹癸紝閬垮厤鈥滈棯涓€涓嬪啀鍑虹幇鈥濈殑瑙傛劅
        recentEl.classList.add('is-loading');
      }
      const byWorkflow = {};
      const runsByWorkflowId = {};
      const uniqueWorkflowIds = Array.from(
        new Set(WORKFLOWS.map((wf) => String(wf.id || ''))),
      );

      for (const wfId of uniqueWorkflowIds) {
        const url = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(
          wfId,
        )}/runs?per_page=12`;
        const res = await ghFetch(token, url);
        if (!res.ok) {
          const txt = await res.text().catch(() => '');
          throw new Error(
            `璇诲彇鏈€杩戣繍琛屽け璐?${wfId})锛欻TTP ${res.status} ${res.statusText} - ${txt}`,
          );
        }
        const data = await res.json();
        runsByWorkflowId[wfId] = Array.isArray(data.workflow_runs)
          ? data.workflow_runs
          : [];
      }

      const dailyFileRuns = runsByWorkflowId['daily-paper-reader.yml'] || [];
      const dailyNowRuns = [];
      if (dailyFileRuns.length > 0) {
        const tagged = await Promise.all(
          dailyFileRuns.map((run) =>
            resolveRecentRunTag(owner, repo, token, run).then((runTag) => ({ run, runTag })),
          ),
        );
        tagged.forEach(({ run }) => {
          dailyNowRuns.push(run);
        });
      }

      WORKFLOWS.forEach((wf) => {
        const wfId = String(wf.id || '');
        if (wf.id === 'daily-paper-reader.yml' && wf.key === 'daily-now') {
          byWorkflow[String(wf.key)] = dailyNowRuns.slice(0, 3);
          return;
        }
        byWorkflow[String(wf.key || wfId)] = (runsByWorkflowId[wfId] || []).slice(0, 3);
      });

      renderRecentRuns(owner, repo, byWorkflow, '', repoContext);
    } catch (e) {
      console.error(e);
      if (recentEl) recentEl.classList.remove('is-loading');
      renderRecentRuns('', '', null, e.message || String(e), null);
    }
  };

  const getWorkflowByKey = (workflowKey) =>
    WORKFLOWS.find((wf) => String(wf.key || '') === String(workflowKey || ''));

  const combineInputs = (baseInputs, extraInputs) => {
    const merged = {};
    const mergeOne = (source) => {
      if (!source || typeof source !== 'object') return;
      Object.keys(source).forEach((k) => {
        const v = source[k];
        if (typeof v === 'undefined' || v === null) return;
        const txt = String(v).trim();
        if (!txt) return;
        merged[String(k)] = txt;
      });
    };
    mergeOne(baseInputs);
    mergeOne(extraInputs);
    return merged;
  };

  const dispatchAndMonitor = async (workflow, extraInputs) => {
    const wf = workflow || {};
    const workflowFile = String(wf.id || '');
    if (!workflowFile) {
      setStatus('宸ヤ綔娴侀厤缃己澶憋紝鏃犳硶瑙﹀彂銆?, '#c00');
      return;
    }
    const token = loadGithubToken();
    if (!token) {
      setStatus('鏈娴嬪埌 GitHub Token锛氳鍦ㄢ€滃瘑閽ラ厤缃€濇垨鈥淕itHub Token鈥濆瀹屾垚閰嶇疆銆?, '#c00');
      return;
    }
    const repoContext = await resolveRepoContext(token);
    const { owner, repo } = repoContext;
    if (!owner || !repo) {
      setStatus('鏃犳硶鎺ㄦ柇鐩爣浠撳簱锛氳纭 GitHub Token 鏈夋晥锛屾垨浣跨敤 xxx.github.io/浠撳簱鍚? 璁块棶銆?, '#c00');
      return;
    }
    if (wf.key === 'sync' && repoContext.isFork === false) {
      setStatus('褰撳墠浠撳簱涓嶆槸 GitHub Fork锛屾棤娉曚娇鐢ㄤ笂娓稿悓姝ャ€?, '#c00');
      runsEl.innerHTML =
        '<div style="color:#c00;">褰撳墠浠撳簱涓嶆槸 Fork 浠撳簱锛孶pstream Sync 涓嶄細杩愯銆?/div>' +
        `<div style="margin-top:8px;"><a class="arxiv-tool-btn" style="padding:6px 10px; text-decoration:none;" target="_blank" href="https://github.com/${owner}/${repo}/fork">鍓嶅線 Fork 褰撳墠浠撳簱</a></div>`;
      return;
    }

    setStatus(`姝ｅ湪妫€鏌ュ伐浣滄祦鐘舵€侊細${wf.name || workflowFile} ...`, '#666', { waiting: true });
    runsEl.innerHTML = '<div style="color:#999;">姝ｅ湪妫€鏌ユ槸鍚︽湁杩愯涓殑宸ヤ綔娴?..</div>';
    stopPolling();
    activeRun = null;

    try {
      // 妫€鏌ユ槸鍚︽湁姝ｅ湪杩愯涓殑鍚屽悕宸ヤ綔娴侊紙闃叉璇Е閲嶅瑙﹀彂锛?      const activeStatuses = new Set(['queued', 'in_progress', 'waiting']);
      const statusZhMap = { queued: '鎺掗槦涓?, in_progress: '杩愯涓?, waiting: '绛夊緟涓? };
      const checkUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(
        workflowFile,
      )}/runs?per_page=5`;
      const checkRes = await ghFetch(token, checkUrl);
      if (checkRes.ok) {
        const checkData = await checkRes.json();
        const runs = Array.isArray(checkData.workflow_runs) ? checkData.workflow_runs : [];
        const activeRuns = runs.filter((r) => activeStatuses.has(r.status));
        if (activeRuns.length > 0) {
          const r = activeRuns[0];
          const runUrl = `https://github.com/${owner}/${repo}/actions/runs/${r.id}`;
          const statusText = statusZhMap[r.status] || r.status;
          setStatus(
            `宸叉湁姝ｅ湪杩愯鐨勫伐浣滄祦锛?${r.run_number || r.id}锛岀姸鎬侊細${statusText}锛夛紝璇风瓑寰呭畬鎴愬悗鍐嶈Е鍙戙€俙,
            '#c00',
          );
          runsEl.innerHTML =
            `<div style="color:#c00;">鍚屼竴鏃堕棿鍙厑璁歌繍琛屼竴涓宸ヤ綔娴佸疄渚嬶紝璇风瓑寰呭綋鍓嶈繍琛岀粨鏉熴€?/div>` +
            `<div style="margin-top:8px;"><a class="arxiv-tool-btn" style="padding:6px 10px; text-decoration:none;" target="_blank" href="${runUrl}">鏌ョ湅褰撳墠杩愯</a></div>`;
          return;
        }
      }

      setStatus(`姝ｅ湪瑙﹀彂宸ヤ綔娴侊細${wf.name || workflowFile} ...`, '#666', { waiting: true });
      runsEl.innerHTML = '<div style="color:#999;">姝ｅ湪瑙﹀彂锛岃绋嶅€?..</div>';

      const createdAt = new Date();

      // 瑙﹀彂 dispatch
      const dispatchUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(
        workflowFile,
      )}/dispatches`;
      const dispatchInputs = combineInputs(wf.dispatchInputs, extraInputs);
      const dispatchBody = {
        ref: String(repoContext.defaultBranch || 'main'),
      };
      if (Object.keys(dispatchInputs).length > 0) {
        dispatchBody.inputs = dispatchInputs;
      }

      const res = await ghFetch(token, dispatchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatchBody),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        if (res.status === 422 && txt.includes('disabled workflow')) {
          const err = new Error('瑙﹀彂澶辫触锛氳 Workflow 褰撳墠澶勪簬绂佺敤鐘舵€侊紝璇峰厛鍓嶅線 Actions 椤甸潰鍚敤璇ュ伐浣滄祦銆?);
          err.workflowEnableUrl = `https://github.com/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflowFile)}`;
          throw err;
        }
        throw new Error(`瑙﹀彂澶辫触锛欻TTP ${res.status} ${res.statusText} - ${txt}`);
      }

      setStatus('宸茶Е鍙戯紝姝ｅ湪绛夊緟杩愯璁板綍鍒涘缓...', '#666', { waiting: true });

      // 杞鎵惧埌鏈 dispatch 瀵瑰簲鐨?run
      const lookup = async () => {
        const runsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(
          workflowFile,
        )}/runs?event=workflow_dispatch&per_page=10`;
        const runsRes = await ghFetch(token, runsUrl);
        if (!runsRes.ok) {
          const txt = await runsRes.text().catch(() => '');
          throw new Error(`璇诲彇 workflow runs 澶辫触锛欻TTP ${runsRes.status} ${runsRes.statusText} - ${txt}`);
        }
        const data = await runsRes.json();
        const list = Array.isArray(data.workflow_runs) ? data.workflow_runs : [];
        const found = list.find((r) => {
          try {
            const t = new Date(r.created_at);
            return t.getTime() >= createdAt.getTime() - 5000;
          } catch {
            return false;
          }
        });
        return found || null;
      };

      let run = null;
      for (let i = 0; i < 18; i += 1) {
        // 鏈€澶氱瓑 ~90 绉?        // eslint-disable-next-line no-await-in-loop
        run = await lookup();
        if (run) break;
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 5000));
      }

      if (!run || !run.id) {
        setStatus('宸茶Е鍙戯紝浣嗘湭鑳藉湪鐭椂闂村唴鎵惧埌瀵瑰簲鐨勮繍琛岃褰曘€傚缓璁墦寮€ Actions 椤甸潰鏌ョ湅銆?, '#c00');
        runsEl.innerHTML = `<div style="color:#666;">璇峰湪 GitHub Actions 鏌ョ湅锛?a target="_blank" href="https://github.com/${owner}/${repo}/actions">鎵撳紑 Actions</a></div>`;
        return;
      }

      activeRun = { owner, repo, runId: run.id, token };
      selectedRun = activeRun;
      setStatus(`杩愯宸插垱寤猴細run_id=${run.id}锛屽紑濮嬫媺鍙栬繘搴?..`, '#080', { waiting: true });
      await refreshRun(owner, repo, run.id);

      refreshTimer = setInterval(() => {
        const r = selectedRun || activeRun;
        if (!r) return;
        refreshRun(r.owner, r.repo, r.runId);
      }, 5000);

      // 瑙﹀彂鍚庡埛鏂版渶杩戣繍琛屽垪琛?      loadRecentRuns();
    } catch (e) {
      console.error(e);
      const msg = e.message || String(e);
      setStatus(`瑙﹀彂澶辫触锛?{msg}`, '#c00');
      if (e.workflowEnableUrl) {
        runsEl.innerHTML =
          `<div style="color:#c00;">${escapeHtml(msg)}<br/>` +
          `馃憠 <a href="${e.workflowEnableUrl}" target="_blank" style="color:#1a73e8;">鍓嶅線 Actions 椤甸潰鍚敤宸ヤ綔娴?/a></div>`;
      } else {
        runsEl.innerHTML = `<div style="color:#c00;">${escapeHtml(msg)}</div>`;
      }
    }
  };

  const renderRun = (owner, repo, run, jobs) => {
    const runUrl = `https://github.com/${owner}/${repo}/actions/runs/${run.id}`;
    const status = run.status || '';
    const conclusion = run.conclusion || '';

    const badgeColor =
      conclusion === 'success'
        ? '#2e7d32'
        : conclusion === 'failure'
          ? '#c00'
          : status === 'in_progress'
            ? '#1565c0'
            : '#666';
    const badgeText = formatRunBadgeText(status, conclusion);

    const jobList = Array.isArray(jobs) ? jobs : [];
    const jobHtml = jobList
      .map((j) => {
        const steps = Array.isArray(j.steps) ? j.steps : [];
        const stepLines = steps
          .map((s) => {
            const c = s.conclusion || s.status || '';
            const icon =
              c === 'success'
                ? '鉁?
                : c === 'failure'
                  ? '鉂?
                  : c === 'skipped'
                    ? '鈴?
                    : c === 'in_progress'
                      ? '鈴?
                      : '鈥?;
            return `<div class="dpr-wf-step">${icon} ${escapeHtml(
              s.name || '',
            )}</div>`;
          })
          .join('');
        const jobId = j.id ? String(j.id) : '';
        return `
          <div class="dpr-wf-job">
            <div class="dpr-wf-job-title">${escapeHtml(j.name || '')}</div>
            <div class="dpr-wf-job-meta">
              <span class="dpr-wf-job-meta-text">${escapeHtml(j.status || '')}${j.conclusion ? ` / ${escapeHtml(j.conclusion)}` : ''}</span>
            </div>
            <div class="dpr-wf-steps">${stepLines || '<div style="color:#999;">鏆傛棤姝ラ淇℃伅</div>'}</div>
          </div>
        `;
      })
      .join('');

    runsEl.innerHTML = `
      <div style="display:flex; justify-content:space-between; gap:10px; align-items:center; margin-bottom:8px;">
        <div style="min-width:0;">
          <div style="font-weight:600;">Run #${run.run_number || run.id}</div>
          <div style="color:#666; margin-top:2px;">
            <span style="display:inline-block; padding:1px 6px; border-radius:999px; background:rgba(0,0,0,0.06); color:${badgeColor};">
              ${escapeHtml(badgeText)}
            </span>
            <span style="margin-left:8px;">${escapeHtml(
              formatRunTime(run.created_at),
            )}</span>
          </div>
        </div>
        <div style="flex-shrink:0; display:flex; gap:8px;">
          <a class="arxiv-tool-btn" style="padding:6px 10px; text-decoration:none;" target="_blank" href="${runUrl}">鎵撳紑 Actions</a>
        </div>
      </div>
      ${jobHtml || '<div style="color:#999;">鏆傛棤 Job 淇℃伅</div>'}
    `;
  };

  const refreshRun = async (owner, repo, runId) => {
    const token = activeRun && activeRun.token ? activeRun.token : loadGithubToken();
    if (!token) return;

    try {
      const runUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}`;
      const res = await ghFetch(token, runUrl);
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(`璇诲彇 run 澶辫触锛欻TTP ${res.status} ${res.statusText} - ${txt}`);
      }
      const run = await res.json();
      const stateKey = `${run.status || ''}/${run.conclusion || ''}`;
      const prevStateKey = lastRunStateById[String(runId)];
      lastRunStateById[String(runId)] = stateKey;

      const jobsUrl = `https://api.github.com/repos/${owner}/${repo}/actions/runs/${runId}/jobs?per_page=100`;
      const jobsRes = await ghFetch(token, jobsUrl);
      let jobs = [];
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        jobs = Array.isArray(jobsData.jobs) ? jobsData.jobs : [];
      }

      renderRun(owner, repo, run, jobs);

      if (run.status === 'completed') {
        stopPolling();
        setStatus(
          `杩愯宸茬粨鏉燂細${run.conclusion || 'completed'}`,
          run.conclusion === 'success' ? '#080' : '#c00',
        );
        // run 鐘舵€佺粨鏉熷悗锛屽埛鏂扳€滄渶杩戣繍琛屸€濆垪琛紝纭繚 completed/success 绛夌姸鎬佽兘鍙婃椂鍙嶆槧
        if (prevStateKey !== stateKey) {
          loadRecentRuns();
        }
      } else {
        setStatus('杩愯涓細姣?5 绉掕嚜鍔ㄥ埛鏂?..', '#1565c0', { waiting: true });
      }
    } catch (e) {
      console.error(e);
      setStatus(`鍒锋柊澶辫触锛?{e.message || e}`, '#c00');
    }
  };

  const runWorkflowByKey = async (workflowKey, extraInputs) => {
    const wf = getWorkflowByKey(workflowKey);
    if (!wf) {
      setStatus('鏈壘鍒板搴旂殑宸ヤ綔娴侀厤缃€?, '#c00');
      return;
    }
    open();
    return dispatchAndMonitor(wf, extraInputs);
  };

  const runQuickFetchByDays = async (days, extra) => {
    const parsed = parseInt(days, 10);
    const normalized = Number.isFinite(parsed) && parsed > 0 ? String(Math.max(1, parsed)) : '10';
    const options = extra && typeof extra === 'object' ? extra : {};
    const fetchMode = (typeof options.fetchMode === 'string' ? options.fetchMode : '').trim().toLowerCase();
    const presetKey = fetchMode ? `${normalized}-${fetchMode}` : normalized;
    const preset = QUICK_FETCH_PRESETS[presetKey] || QUICK_FETCH_PRESETS[normalized] || {
      key: 'daily-now',
      dispatchInputs: {
        run_enrich: 'false',
        fetch_days: normalized,
      },
    };
    const mergedInputs = combineInputs(preset.dispatchInputs, options.dispatchInputs);
    return runWorkflowByKey(preset.key, mergedInputs);
  };

  const runMainByDateToken = async (dateToken, options) => {
    const token = String(dateToken || '').trim();
    const opts = options && typeof options === 'object' ? options : {};
    const mode = String(opts.mode || 'auto').trim();
    const fetchSource = String(opts.fetchSource || opts.fetch_source || 'email').trim();
    const dispatchInputs = combineInputs(
      {
        run_enrich: 'false',
        email_date: token,
        mode,
        fetch_source: fetchSource || 'email',
      },
      opts.dispatchInputs,
    );
    return runWorkflowByKey('daily-now', dispatchInputs);
  };

  return {
    open,
    runWorkflowByKey,
    runQuickFetchByDays,
    runMainByDateToken,
  };
})();
