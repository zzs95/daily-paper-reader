// 后台管理面板（精简版）：
// 1) 移除 arXiv 关键词编辑与“快速抓取 xx 天”按钮
// 2) 保留密钥配置入口
// 3) 新增按日期（单日/范围）触发 main.py 的入口

window.SubscriptionsManager = (function () {
  let overlay = null;
  let panel = null;
  let saveBtn = null;
  let closeBtn = null;
  let msgEl = null;

  let runByDateBtn = null;
  let runDateSingleEl = null;
  let runDateRangeStartEl = null;
  let runDateRangeEndEl = null;
  let runModeSelectEl = null;
  let runMsgEl = null;
  let openWorkflowPanelBtn = null;

  let resetContentBtn = null;
  let resetContentMsgEl = null;

  let draftConfig = null;
  let hasUnsavedChanges = false;
  let isSavingDraftConfig = false;

  const cloneDeep = (obj) => {
    try {
      return JSON.parse(JSON.stringify(obj || {}));
    } catch {
      return obj || {};
    }
  };

  const normalizeText = (v) => String(v || '').trim();

  const setMessage = (text, color) => {
    if (!msgEl) return;
    msgEl.textContent = text || '';
    msgEl.style.color = color || '#666';
  };

  const refreshRunButtonState = () => {
    const blocked = hasUnsavedChanges;
    if (runByDateBtn) {
      runByDateBtn.disabled = blocked;
      runByDateBtn.classList.toggle('chat-quick-run-item--disabled', blocked);
      runByDateBtn.title = blocked
        ? '请先点击“保存”后再运行。'
        : '按日期运行 main.py';
    }
    if (blocked && runMsgEl) {
      runMsgEl.textContent = '检测到未保存修改，请先保存。';
      runMsgEl.style.color = '#c00';
    }
  };

  const buildDateTokenFromInputs = () => {
    const single = normalizeText(runDateSingleEl && runDateSingleEl.value);
    const start = normalizeText(runDateRangeStartEl && runDateRangeStartEl.value);
    const end = normalizeText(runDateRangeEndEl && runDateRangeEndEl.value);

    if (single) {
      return { token: single, error: '' };
    }
    if (start && end) {
      if (start > end) {
        return { token: '', error: '日期范围无效：开始日期不能晚于结束日期。' };
      }
      return { token: `${start.replace(/-/g, '')}-${end.replace(/-/g, '')}`, error: '' };
    }
    return { token: '', error: '' };
  };

  const runMainByDate = () => {
    if (hasUnsavedChanges) {
      if (runMsgEl) {
        runMsgEl.textContent = '请先保存配置后再运行。';
        runMsgEl.style.color = '#c00';
      }
      return;
    }

    if (!window.DPRWorkflowRunner || typeof window.DPRWorkflowRunner.runMainByDateToken !== 'function') {
      if (runMsgEl) {
        runMsgEl.textContent = '工作流触发器未加载。';
        runMsgEl.style.color = '#c00';
      }
      return;
    }

    const dateResult = buildDateTokenFromInputs();
    const dateToken = dateResult.token;
    if (dateResult.error) {
      if (runMsgEl) {
        runMsgEl.textContent = dateResult.error;
        runMsgEl.style.color = '#c00';
      }
      return;
    }
    if (!dateToken) {
      if (runMsgEl) {
        runMsgEl.textContent = '请选择单日，或填写完整的连续日期范围。';
        runMsgEl.style.color = '#c00';
      }
      return;
    }

    const mode = normalizeText(runModeSelectEl && runModeSelectEl.value) || 'auto';
    window.DPRWorkflowRunner.runMainByDateToken(dateToken, { mode });
    if (runMsgEl) {
      runMsgEl.textContent = `已触发：date=${dateToken}, mode=${mode}`;
      runMsgEl.style.color = '#080';
    }
  };

  const runResetContent = (msgElRef) => {
    if (String(window.DPR_ACCESS_MODE || '') !== 'full') {
      if (msgElRef) {
        msgElRef.textContent = '未检测到完整登录权限，危险操作未开启。';
        msgElRef.style.color = '#c00';
      }
      return;
    }

    const confirmText = window.prompt(
      '危险操作：该操作会将 docs 备份后恢复为 docs_init，并清空 archive。输入 RESET_ALL 确认。',
    );
    if (confirmText !== 'RESET_ALL') {
      if (msgElRef) {
        msgElRef.textContent = '已取消危险操作。';
        msgElRef.style.color = '#666';
      }
      return;
    }

    if (!window.DPRWorkflowRunner || typeof window.DPRWorkflowRunner.runWorkflowByKey !== 'function') {
      if (msgElRef) {
        msgElRef.textContent = '工作流触发器未加载到当前页面。';
        msgElRef.style.color = '#c00';
      }
      return;
    }

    window.DPRWorkflowRunner.runWorkflowByKey('reset-content');
    if (msgElRef) {
      msgElRef.textContent = '已发起重置任务。';
      msgElRef.style.color = '#080';
    }
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
          <div style="font-weight:600;">后台管理</div>
          <div style="display:flex; gap:8px; align-items:center;">
            <button id="arxiv-config-save-btn" class="arxiv-tool-btn" style="padding:2px 10px; background:#2e7d32; color:white;">保存</button>
            <button id="arxiv-open-secret-setup-btn" class="arxiv-tool-btn" style="padding:2px 10px;">密钥配置</button>
            <button id="arxiv-search-close-btn" class="arxiv-tool-btn" style="padding:2px 6px;">关闭</button>
          </div>
        </div>

        <div id="arxiv-search-panel-body">
          <div id="arxiv-search-panel-main">
            <div id="dpr-smart-query-section" class="arxiv-pane dpr-smart-pane">
              <div class="dpr-display-card">
                <div class="dpr-sq-display" style="padding:12px; color:#666;">
                  已移除 arXiv 关键词配置与“快速抓取 xx 天”入口。<br/>
                  当前后台仅保留：密钥配置、按日期运行主流程。
                </div>
              </div>
            </div>
            <div id="dpr-smart-msg" style="font-size:12px; color:#666; margin-top:10px;">提示：点击“密钥配置”可更新 BLT / MATON 等密钥。</div>
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

    bindBaseEvents();
  };

  const renderFromDraft = () => {
    // 关键词编辑已移除，保留占位函数供旧调用。
  };

  const loadSubscriptions = async () => {
    try {
      if (!window.SubscriptionsGithubToken || !window.SubscriptionsGithubToken.loadConfig) {
        throw new Error('SubscriptionsGithubToken.loadConfig 不可用');
      }
      const { config } = await window.SubscriptionsGithubToken.loadConfig();
      draftConfig = cloneDeep(config || {});
      hasUnsavedChanges = false;
      refreshRunButtonState();
      renderFromDraft();
      setMessage('已加载配置。', '#666');
    } catch (e) {
      console.error(e);
      setMessage('加载配置失败，请确认 GitHub Token 可用。', '#c00');
    }
  };

  const saveDraftConfig = async () => {
    if (isSavingDraftConfig) {
      setMessage('正在保存中，请稍后...', '#666');
      return;
    }
    if (!window.SubscriptionsGithubToken || !window.SubscriptionsGithubToken.saveConfig) {
      setMessage('当前无法保存配置，请先完成 GitHub 登录。', '#c00');
      return;
    }
    if (!draftConfig) {
      setMessage('配置尚未加载完成，请稍后再试。', '#c00');
      return;
    }
    try {
      isSavingDraftConfig = true;
      if (saveBtn) saveBtn.disabled = true;
      setMessage('正在保存配置...', '#666');
      await window.SubscriptionsGithubToken.saveConfig(
        draftConfig,
        'chore: save dashboard config',
      );
      hasUnsavedChanges = false;
      refreshRunButtonState();
      setMessage('配置已保存。', '#080');
    } catch (e) {
      console.error(e);
      const msg = e && e.message ? e.message : '未知错误';
      setMessage(`保存配置失败：${msg}`.slice(0, 180), '#c00');
    } finally {
      isSavingDraftConfig = false;
      if (saveBtn) saveBtn.disabled = false;
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
      const ok = window.confirm('检测到未保存修改，确认直接关闭并丢弃本地草稿吗？');
      if (!ok) return;
      draftConfig = null;
      hasUnsavedChanges = false;
      refreshRunButtonState();
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
            alert('当前页面尚未加载密钥配置向导脚本，请刷新后重试。');
          }
        } catch (e) {
          console.error(e);
        }
      });
    }

    openWorkflowPanelBtn = document.getElementById('arxiv-admin-open-workflow-panel-btn');
    runByDateBtn = document.getElementById('arxiv-admin-run-by-date-btn');
    runDateSingleEl = document.getElementById('arxiv-admin-run-date-single');
    runDateRangeStartEl = document.getElementById('arxiv-admin-run-date-start');
    runDateRangeEndEl = document.getElementById('arxiv-admin-run-date-end');
    runModeSelectEl = document.getElementById('arxiv-admin-run-mode-select');
    runMsgEl = document.getElementById('arxiv-admin-quick-run-msg');

    resetContentBtn = document.getElementById('arxiv-admin-reset-content-btn');
    resetContentMsgEl = document.getElementById('arxiv-admin-reset-content-msg');

    refreshRunButtonState();

    if (runByDateBtn && !runByDateBtn._bound) {
      runByDateBtn._bound = true;
      runByDateBtn.addEventListener('click', runMainByDate);
    }

    if (openWorkflowPanelBtn && !openWorkflowPanelBtn._bound) {
      openWorkflowPanelBtn._bound = true;
      openWorkflowPanelBtn.addEventListener('click', () => {
        try {
          if (window.DPRWorkflowRunner && typeof window.DPRWorkflowRunner.open === 'function') {
            window.DPRWorkflowRunner.open();
            return;
          }
        } catch (e) {
          console.error(e);
        }
        if (runMsgEl) {
          runMsgEl.textContent = '工作流触发面板未加载，请刷新后重试。';
          runMsgEl.style.color = '#c00';
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
      refreshRunButtonState();
    },
    updateDraftConfig: (updater) => {
      const base = draftConfig || {};
      const next = typeof updater === 'function' ? updater(cloneDeep(base)) || base : base;
      draftConfig = cloneDeep(next || {});
      hasUnsavedChanges = true;
      refreshRunButtonState();
    },
    getDraftConfig: () => cloneDeep(draftConfig || {}),
    validateDraftConfig: () => '',
  };
})();
