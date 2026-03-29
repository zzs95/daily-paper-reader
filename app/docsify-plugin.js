// Docsify 配置与公共插件（评论区 + Zotero 元数据）
window.$docsify = {
  name: 'Daily Paper Reader',
  repo: '',
  // 文档内容与侧边栏都存放在 docs/ 下
  basePath: 'docs/', // 所有 Markdown 路由以 docs/ 为前缀
  loadSidebar: '_sidebar.md', // 在 basePath 下加载 _sidebar.md
  // 始终使用根目录的 _sidebar.md，避免每个子目录都要放一份
  alias: {
    '/.*/_sidebar.md': '/_sidebar.md',
  },
  // 只在侧边栏展示论文列表标题，不展示文内小节（例如 Abstract）
  subMaxLevel: 0,

  // --- 核心：注册自定义插件 ---
  plugins: [
    function (hook, vm) {
      // 确保 marked 开启 GFM 表格支持，并允许内联 HTML（用于聊天区 Markdown 渲染）
      if (window.marked && window.marked.setOptions) {
        const baseOptions =
          (window.marked.getDefaults && window.marked.getDefaults()) || {};
        window.marked.setOptions(
          Object.assign({}, baseOptions, {
            gfm: true,
            breaks: false,
            tables: true,
            // 閸忎浇顔?<sup> 缁涘鍞撮懕?HTML 閻╁瓨甯村〒鍙夌厠閿涘矁鈧奔绗夐弰顖濐潶鏉烆兛绠?            sanitize: false,
            mangle: false,
            headerIds: false,
          }),
        );
      }

      // 1. 鐟欙絾鐎借ぐ鎾冲閺傚洨鐝?ID (缁犫偓閸楁洜鏁ら弬鍥︽閸氬秳缍旀稉?ID)
      const getPaperId = () => {
        return vm.route.file.replace('.md', '');
      };

      const metaFallbacks = {
        citation_title: 'Daily Paper Reader Default Entry',
        citation_journal_title: 'arxiv',
        citation_pdf_url: 'https://daily-paper-reader.invalid/default.pdf',
        citation_publication_date: '2024-01-01',
        citation_date: '2024/01/01',
      };

      const defaultAuthors = ['Daily Paper Reader Team', 'Docsify Renderer'];

      // Zotero 閹芥顩︾紒鎾寸€弽鍥唶閿涙碍鏌熸笟鍨倵缂侇厼婀?Zotero 閹绘帊娆㈡稉顓㈠櫢閺傛媽袙閺?      const START_MARKER = '閵嗘劮鐓?AI Summary閵?;
      const CHAT_MARKER = '閵嗘劮鐓?Chat History閵?;
      const ORIG_MARKER = '閵嗘劮鐓?Original Abstract閵?;
      const TLDR_MARKER = '閵嗘劮鐓?TLDR閵?;
      const GLANCE_MARKER = '閵嗘劮鐓?闁喕顫嶉崠鎭掆偓?;
      const GLANCE_MARKER_LEGACY = '閵嗘劮鐓?Glance閵?;
      const DETAIL_MARKER = '閵嗘劮鐓?鐠佺儤鏋冪拠锔剧矎閹崵绮ㄩ崠鎭掆偓?;
      const DETAIL_MARKER_LEGACY = '閵嗘劮鐓?鐠佺儤鏋冪拠锔剧矎閹崵绮ㄩ妴?;
      let latestPaperRawMarkdown = '';

      const extractSectionByTitle = (rawContent, matchFn) => {
        if (!rawContent || typeof rawContent !== 'string') return '';
        const contentWithoutFrontMatter = rawContent
          .replace(/^---[\s\S]*?---\s*/, '')
          .replace(/\r\n/g, '\n');
        const lines = contentWithoutFrontMatter.split('\n');
        let headingIndex = -1;
        for (let i = 0; i < lines.length; i += 1) {
          const m = lines[i].match(/^#{1,6}\s+(.*)$/);
          if (!m) continue;
          if (matchFn(m[1])) {
            headingIndex = i;
            break;
          }
        }
        if (headingIndex < 0) return '';

        const chunk = [];
        for (
          let i = headingIndex + 1;
          i < lines.length && !/^#{1,6}\s+/.test(lines[i]);
          i += 1
        ) {
          chunk.push(lines[i]);
        }
        return chunk.join('\n').trim();
      };

      const escapeRegExp = (value) =>
        String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const normalizeTextForMeta = (value) =>
        (value || '').toString().replace(/\r\n/g, '\n').trim();
      const CITATION_ABSTRACT_BR = '__BR__';
      const encodeCitationAbstractForMeta = (value) =>
        normalizeTextForMeta(value)
          .replace(/\r/g, '\n')
          .replace(/\n/g, CITATION_ABSTRACT_BR);

      const trimBeforeMarkers = (value, markers) => {
        const text = normalizeTextForMeta(value);
        if (!text) return '';
        const indices = markers
          .map((marker) => text.indexOf(marker))
          .filter((idx) => idx >= 0)
          .sort((a, b) => a - b);
        if (indices.length === 0) return text;
        return text.slice(0, indices[0]).trim();
      };

      const cleanSectionText = (value) => {
        let text = normalizeTextForMeta(value);
        if (!text) return '';

        text = trimBeforeMarkers(text, [
          CHAT_MARKER,
          ORIG_MARKER,
          START_MARKER,
          TLDR_MARKER,
          GLANCE_MARKER,
          GLANCE_MARKER_LEGACY,
          DETAIL_MARKER,
          DETAIL_MARKER_LEGACY,
        ]);
        text = text.replace(new RegExp(`^\\s*${escapeRegExp(START_MARKER)}\\s*\\n?`, 'i'), '');
        text = text.replace(new RegExp(`^\\s*${escapeRegExp(ORIG_MARKER)}\\s*\\n?`, 'i'), '');
        text = text.replace(new RegExp(`^\\s*${escapeRegExp(CHAT_MARKER)}\\s*\\n?`, 'i'), '');
        text = text.replace(new RegExp(`^\\s*${escapeRegExp(TLDR_MARKER)}\\s*\\n?`, 'i'), '');
        text = text.replace(new RegExp(`^\\s*${escapeRegExp(GLANCE_MARKER)}\\s*\\n?`, 'i'), '');
        text = text.replace(
          new RegExp(`^\\s*${escapeRegExp(GLANCE_MARKER_LEGACY)}\\s*\\n?`, 'i'),
          '',
        );
        text = text.replace(new RegExp(`^\\s*${escapeRegExp(DETAIL_MARKER)}\\s*\\n?`, 'i'), '');
        text = text.replace(
          new RegExp(`^\\s*${escapeRegExp(DETAIL_MARKER_LEGACY)}\\s*\\n?`, 'i'),
          '',
        );
        text = text.replace(/^Tags:\s*.*$/gim, '');
        text = text.replace(/^>?\s*閻㈢浂s*daily-paper-reader\s*閼奉亜濮╅悽鐔稿灇\s*$/gim, '');
        return text.trim();
      };

      const parseDateFromText = (value) => {
        const text = normalizeTextForMeta(value);
        if (!text) return '';
        const ymdMatch = text.match(/(\d{4})-(\d{2})-(\d{2})/);
        if (ymdMatch) {
          return `${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}`;
        }
        const date8Match = text.match(/(\d{4})(\d{2})(\d{2})/);
        if (date8Match && text.indexOf('/') === -1 && text.indexOf('.') === -1) {
          return `${date8Match[1]}-${date8Match[2]}-${date8Match[3]}`;
        }
        return '';
      };

      const splitRawSectionByTitle = (rawContent, shouldMatchTitle) => {
        const source = (rawContent || '').toString();
        const parsed = parseFrontMatter(source);
        const body = (parsed && parsed.body) || source;
        const lines = normalizeTextForMeta(body).split('\n');
        const headingMeta = (lineText) => {
          const normalized = normalizeTextForMeta(lineText).trim();
          const match = normalized.match(/^(#{1,6})\s+(.*)$/);
          if (!match) return null;
          return {
            level: match[1].length,
            title: normalizeTextForMeta(match[2]),
          };
        };
        const isBoundary = (lineText, sectionHeadingLevel) => {
          const t = normalizeTextForMeta(lineText);
          if (!t) return false;
          if (
            t.startsWith(START_MARKER) ||
            t.startsWith(CHAT_MARKER) ||
            t.startsWith(ORIG_MARKER) ||
            t.startsWith(TLDR_MARKER) ||
            t.startsWith(GLANCE_MARKER) ||
            t.startsWith(GLANCE_MARKER_LEGACY) ||
            t.startsWith(DETAIL_MARKER)
            || t.startsWith(DETAIL_MARKER_LEGACY)
          ) {
            return true;
          }
          const heading = headingMeta(lineText);
          if (heading && sectionHeadingLevel) {
            return heading.level <= sectionHeadingLevel;
          }
          return /^#{1,6}\s+/.test(t);
        };

        const extractHeadingTitle = (lineText) => {
          const normalized = normalizeTextForMeta(lineText).trim();
          if (!normalized) return '';
          if (normalized.startsWith(START_MARKER)) return START_MARKER;
          if (normalized.startsWith(CHAT_MARKER)) return CHAT_MARKER;
            if (normalized.startsWith(ORIG_MARKER)) return ORIG_MARKER;
            if (normalized.startsWith(TLDR_MARKER)) return TLDR_MARKER;
            if (normalized.startsWith(GLANCE_MARKER)) return GLANCE_MARKER;
            if (normalized.startsWith(GLANCE_MARKER_LEGACY)) return GLANCE_MARKER_LEGACY;
            if (normalized.startsWith(DETAIL_MARKER)) return DETAIL_MARKER;
            if (normalized.startsWith(DETAIL_MARKER_LEGACY)) return DETAIL_MARKER_LEGACY;
          return normalized.replace(/^#{1,6}\s*/, '');
        };

        let start = -1;
        let sectionHeadingLevel = 1;
        for (let i = 0; i < lines.length; i += 1) {
          const title = extractHeadingTitle(lines[i]);
          if (!title) continue;
          if (shouldMatchTitle(title)) {
            start = i;
            const heading = headingMeta(lines[i]);
            sectionHeadingLevel = heading ? heading.level : 1;
            break;
          }
        }
        if (start < 0) {
          return '';
        }

        let end = lines.length;
        for (let j = start + 1; j < lines.length; j += 1) {
          if (isBoundary(lines[j], sectionHeadingLevel)) {
            end = j;
            break;
          }
        }
        return lines
          .slice(start + 1, end)
          .join('\n')
          .trim();
      };

      const getRawPaperSections = (rawContent) => {
        const helper =
          window.DPRZoteroMetaUtils &&
          typeof window.DPRZoteroMetaUtils.getRawPaperSections === 'function'
            ? window.DPRZoteroMetaUtils.getRawPaperSections
            : null;
        if (helper) {
          return helper(rawContent);
        }
        return {
          aiSummaryText: splitRawSectionByTitle(
            rawContent,
            (title) => {
              const t = normalizeTextForMeta(title).replace(/^\s*#{1,6}\s*/, '').trim().toLowerCase();
              return (
                t.includes('鐠佺儤鏋冪拠锔剧矎閹崵绮?) ||
                t.includes('鐠佺儤鏋冪拠锔剧矎閹崵绮ㄩ敍鍫ｅ殰閸斻劎鏁撻幋鎰剁礆') ||
                t.includes('ai summary') ||
                t.includes('棣冾樆 ai summary')
              );
            },
          ),
          originalAbstractText: splitRawSectionByTitle(
            rawContent,
            (title) => {
              const t = normalizeTextForMeta(title)
                .replace(/^\s*#{1,6}\s*/, '')
                .trim()
                .toLowerCase();
              return (
                t === 'abstract' ||
                t.includes('閸樼喐鏋冮幗妯款洣') ||
                t.includes('original abstract')
              );
            },
          ),
          tldrText: splitRawSectionByTitle(
            rawContent,
            (title) => {
              const t = normalizeTextForMeta(title)
                .replace(/^\s*#{1,6}\s*/, '')
                .trim()
                .toLowerCase();
              return t.includes('tldr') || t.includes('tl;dr') || t.includes('閹芥顩︾憰浣哄仯');
            },
          ),
        };
      };

      const collectPaperBodySections = (sectionEl) => {
        if (!sectionEl || !sectionEl.children) return [];

        const headingTag = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6'];
        const shouldSkipHeadingBlock = (headingText) => {
          const text = normalizeTextForMeta(headingText || '').toLowerCase();
          if (!text) return false;
          const blocked = [
            'paper-title-row',
            'paper-meta-row',
            'paper-glance-section',
            '娴滄帒濮╅崠?,
            '妞ょ敻娼扮€佃壈鍩呮稉搴濇唉娴滄帒鐪?,
            '閸樼喐鏋冮幗妯款洣',
            'original abstract',
            '鐠佺儤鏋冪拠锔剧矎閹崵绮?,
            'ai summary',
            'chat history',
          ];
          return blocked.some((token) => text.includes(token));
        };

        const shouldSkipNode = (node) =>
          !!(
            node &&
            node.classList &&
            (node.classList.contains('paper-title-row') ||
              node.classList.contains('paper-meta-row') ||
              node.classList.contains('paper-glance-section') ||
              node.classList.contains('paper-title-cn') ||
              node.classList.contains('paper-title-en'))
          );
        const sections = [];
        let currentTitle = '棣冩憫 鐠佺儤鏋冨锝嗘瀮';
        let currentContent = [];
        let seenHeading = false;
        let skipCurrentSection = false;
        const collectText = (node) => normalizeTextForMeta(node && (node.innerText || node.textContent || ''));

        const flush = () => {
          const text = trimBeforeMarkers(collectText({ innerText: currentContent.join('\n') }), []);
          const cleanText = text.replace(/\n{3,}/g, '\n\n').trim();
          if (cleanText) {
            sections.push({
              title: currentTitle,
              text: cleanText,
            });
          }
          currentContent = [];
        };

        const children = Array.from(sectionEl.children);
        for (const child of children) {
          const tag = child.tagName || '';
          if (shouldSkipNode(child)) {
            flush();
            continue;
          }
          if (
            child.id === 'paper-chat-container' ||
            (child.querySelector && child.querySelector('#paper-chat-container'))
          ) {
            flush();
            continue;
          }

          if (headingTag.includes(tag)) {
            flush();
            const text = normalizeTextForMeta(child.innerText || '').trim();
            skipCurrentSection = shouldSkipHeadingBlock(text);
            if (skipCurrentSection) {
              continue;
            }
            if (text) {
              currentTitle = text;
              seenHeading = true;
            }
            continue;
          }
          if (skipCurrentSection) {
            continue;
          }

          const txt = collectText(child).replace(/\n{2,}/g, '\n').trim();
          if (!txt) {
            continue;
          }
          currentContent.push(txt);
          seenHeading = true;
        }

        if (seenHeading) {
          flush();
        } else {
          const fallback = collectText(sectionEl);
          if (fallback) {
            sections.push({
              title: currentTitle,
              text: fallback,
            });
          }
        }
        return sections;
      };

      // Zotero 閸忓啯鏆熼幑顔芥纯閺傛澘鍤遍弫甯窗閸欘垵顫?Docsify 閻㈢喎鎳￠崨銊︽埂閸滃矁浜版径鈺偰侀崸妤呭櫢婢跺秷鐨熼悽?      const updateZoteroMetaFromPage = async (
        paperId,
        vmRouteFile,
        rawPaperContent = '',
      ) => {
        try {
          // 娴兼ê鍘涙担璺ㄦ暏閼奉亜鐣炬稊澶嬬垼妫版ɑ娼敍鍫ヤ缉閸?h1 鐞氼偊娈ｉ挊?閺€褰掆偓鐘叉倵 innerText 娑撳秶菙鐎规熬绱?          const dprEn = document.querySelector('.dpr-title-en');
          const dprCn = document.querySelector('.dpr-title-cn');
          let title = '';
          if (dprEn && (dprEn.textContent || '').trim()) {
            title = (dprEn.textContent || '').trim();
          } else if (dprCn && (dprCn.textContent || '').trim()) {
            title = (dprCn.textContent || '').trim();
          } else {
            const titleEl = document.querySelector('.markdown-section h1');
            title = titleEl ? (titleEl.textContent || '').trim() : document.title;
          }
          if (title) {
            // 濞撳懐鎮婇弽鍥暯娑擃厾娈戞径姘稇缁岃櫣娅ф稉搴㈠絻娴犺埖鏁為崗銉ュ敶鐎?            title = title.replace(/\s+/g, ' ').trim();
          }

          let pdfLinkEl = document.querySelector('a[href*="arxiv.org/pdf"]');
          if (!pdfLinkEl) {
            pdfLinkEl = document.querySelector('a[href$=".pdf"]');
          }

          let pdfUrl = '';
          if (pdfLinkEl) {
            pdfUrl = new URL(pdfLinkEl.href, window.location.href).href;
          }

          const frontmatterPaperMeta = (() => {
            try {
              const parsed = parseFrontMatter(rawPaperContent || '');
              return parsed && parsed.meta ? parsed.meta : {};
            } catch {
              return {};
            }
          })();

          let date = parseDateFromText(frontmatterPaperMeta.date);
          if (!date) {
            const matchDate = vmRouteFile
              ? vmRouteFile.match(/(\d{4}-\d{2}-\d{2})/)
              : null;
            if (matchDate) {
              date = matchDate[1];
            }
          }
          if (!date) {
            const matchFolderDate = vmRouteFile
              ? vmRouteFile.match(/(?:^|\/)(\d{4})(\d{2})\/(\d{2})(?:\/|$)/)
              : null;
            if (matchFolderDate) {
              date = `${matchFolderDate[1]}-${matchFolderDate[2]}-${matchFolderDate[3]}`;
            }
          }
          if (!date) {
            date = parseDateFromText(frontmatterPaperMeta.published);
          }
          if (!date) {
            date = parseDateFromText(frontmatterPaperMeta.submitted);
          }
          if (!date) {
            date = parseDateFromText(frontmatterPaperMeta.submit_date);
          }
          if (!date && vmRouteFile) {
            const routeMatch = vmRouteFile.match(/(\d{6})\/(\d{2})/);
            if (routeMatch) {
              const yyyymm = routeMatch[1];
              date = `${yyyymm.slice(0, 4)}-${yyyymm.slice(4)}-${routeMatch[2]}`;
            }
          }
          const citationDate = date ? date.replace(/-/g, '/') : '';

          let authors = [];
          document.querySelectorAll('.markdown-section p').forEach((p) => {
            if (p.innerText.includes('Authors:')) {
              let text = p.innerText.replace('Authors:', '').trim();
              // 濞撳懐鎮婇崣顖濆厴鐞氼偄鍙剧€瑰啯澧跨仦鏇熸暈閸忋儳娈戦幑銏ｎ攽閸滃苯鐔柈銊や繆閹垽绱濇禒銉ュ挤鐏忛箖鍎撮弮銉︽埂
              text = text.replace(/\s+/g, ' ').trim();
              text = text
                .replace(/Date\s*:\s*\d{4}-\d{2}-\d{2}.*/i, '')
                .trim();
              authors = text
                .split(/,|閿?)
                .map((a) => a.trim())
                .filter(Boolean);
            }
          });

          updateMetaTag('citation_title', title);
          updateMetaTag('citation_journal_title', 'arxiv');
          updateMetaTag('citation_pdf_url', pdfUrl, {
            useFallback: false,
          });
          updateMetaTag('citation_publication_date', date, { useFallback: false });
          updateMetaTag('citation_date', citationDate, { useFallback: false });

          const {
            aiSummaryText: rawSummary,
            originalAbstractText: rawOriginal,
            tldrText: rawTldrText,
          } =
            getRawPaperSections(rawPaperContent || '');

          // 濮ｅ繑顐肩捄顖滄暠閸掗攱鏌婇崗鍫熺閻炲棔绗傛稉鈧稉顏堛€夐棃銏℃暈閸忋儳娈戦幗妯款洣 meta閿涘矂浼╅崗宥夊櫢婢跺秵鐣悾?          clearSummaryMetaFields();

          // 閺嬪嫰鈧姷绮?Zotero 閻劎娈戦垾婊勬喅鐟曚讲鈧繂鍘撴穱鈩冧紖閿涙碍瀵滈妴瀛塈 閹崵绮?/ 鐎电鐦介崢鍡楀蕉 / 閸樼喎顫愰幗妯款洣閵嗗秴鍨庡▓鐢电矋缂?          let abstractText = '';
          let abstractTextForMetaRaw = '';
          const sectionEl = document.querySelector('.markdown-section');
          if (sectionEl) {
            let aiSummaryText = rawSummary;
            let origAbstractText = rawOriginal;
            aiSummaryText = cleanSectionText(aiSummaryText);
            origAbstractText = cleanSectionText(origAbstractText);

            // 3) 鐟欙絾鐎介懕濠傘亯閸樺棗褰堕敍灞肩喘閸忓牐顕伴崣鏍ㄦ拱閸︽澘甯慨瀣喊婢垛晞顔囪ぐ鏇礉闁灝鍘ゆ禒?DOM innerText 鐠囪鍙曞蹇旀鐞氼偅濯剁喊?            let chatSection = '';
            const buildChatLinesFromMessages =
              window.DPRZoteroChatUtils &&
              typeof window.DPRZoteroChatUtils.buildChatLinesFromMessages === 'function'
                ? window.DPRZoteroChatUtils.buildChatLinesFromMessages
                : null;
            const storedChat = await loadChatHistoryForPaper(paperId);
            const storedLines = buildChatLinesFromMessages
              ? buildChatLinesFromMessages(storedChat)
              : [];
            if (storedLines.length) {
              chatSection = storedLines.join('\n\n');
            } else {
              const chatRoot = document.getElementById('chat-history');
              if (chatRoot) {
                const items = chatRoot.querySelectorAll('.msg-item');
                const lines = [];
                const inferSpeaker =
                  window.DPRZoteroChatUtils &&
                  typeof window.DPRZoteroChatUtils.inferSpeaker === 'function'
                    ? window.DPRZoteroChatUtils.inferSpeaker
                    : ({ roleText = '', className = '' } = {}) => {
                        const role = String(roleText || '').trim();
                        const cls = String(className || '').trim();
                        if (role.includes('閹繆鈧啳绻冪粙?)) return '';
                        if (role.includes('娴?)) return 'User';
                        if (role.includes('閸斺晜澧?)) return 'AI';
                        if (/\bmsg-content-user\b/.test(cls)) return 'User';
                        if (/\bmsg-content-ai\b/.test(cls)) return 'AI';
                        return '';
                      };
                items.forEach((item) => {
                  const roleEl = item.querySelector('.msg-role');
                  const contentEl = item.querySelector('.msg-content');
                  if (!contentEl) return;
                  const roleText = roleEl ? (roleEl.textContent || '') : '';
                  const speaker = inferSpeaker({
                    roleText,
                    className: contentEl.className || '',
                  });
                  if (!speaker) return;
                  const contentText = (contentEl.innerText || '').trim();
                  if (!contentText) return;
                  const icon = speaker === 'User' ? '棣冩噥' : '棣冾樆';
                  lines.push(`${icon} ${speaker}: ${contentText}`);
                });
                if (lines.length) {
                  chatSection = lines.join('\n\n');
                }
              }
            }

            chatSection = cleanSectionText(chatSection);

            const parts = [];
            const seenBlocks = new Set();
            const seenTitles = new Set();
            const cleanText = (value) => cleanSectionText(normalizeTextForMeta(value));
            const rawParts = [];
            const seenRawBlocks = new Set();
            const addMetaSectionBlock = (title, content) => {
              const cleanText = cleanSectionText(content);
              if (!cleanText) return;
              const titleKey = normalizeTextForMeta(title)
                .toLowerCase()
                .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
              const contentKey = cleanText
                .toLowerCase()
                .replace(/\s+/g, '')
                .replace(/[#>*_`[\]]/g, '');
              const signature = `${titleKey}|${contentKey}`;
              if (seenTitles.has(titleKey) && seenBlocks.has(signature)) {
                return;
              }
              seenTitles.add(titleKey);
              if (seenBlocks.has(signature)) return;
              seenBlocks.add(signature);
              parts.push(`## ${title}\n${cleanText}`);
            };
            const normalizeMarkerTitle = (label) => {
              const raw = normalizeTextForMeta(label).trim();
              if (!raw) return "";
              if (raw === START_MARKER) return "棣冾樆 AI Summary";
              if (raw === CHAT_MARKER) return "棣冩尠 Chat History";
              if (raw === ORIG_MARKER) return "棣冩惈 Original Abstract";
              if (raw === TLDR_MARKER) return "棣冩憫 TLDR";
              if (raw === GLANCE_MARKER || raw === GLANCE_MARKER_LEGACY) return "棣冃?闁喕顫嶉崠?;
              if (raw === DETAIL_MARKER || raw === DETAIL_MARKER_LEGACY) return "棣冃?鐠佺儤鏋冪拠锔剧矎閹崵绮ㄩ崠?;
              return raw.replace(/^#{1,6}\s*/, '');
            };
            const addRawMetaBlock = (label, content) => {
              const text = normalizeTextForMeta(content);
              if (!text) return;
              const sectionTitle = normalizeMarkerTitle(label);
              const signature = `${sectionTitle}|${text.replace(/\s+/g, ' ')}`;
              if (seenRawBlocks.has(signature)) return;
              seenRawBlocks.add(signature);
              rawParts.push(`## ${sectionTitle}\n${text}`);
            };
            const addMetaBlock = (label, content) => {
              const cleanText = cleanSectionText(content);
              if (!cleanText) return;
              const signature = cleanText.replace(/\s+/g, ' ');
              if (seenBlocks.has(signature)) return;
              seenBlocks.add(signature);
              const sectionTitle = normalizeMarkerTitle(label);
              parts.push(`## ${sectionTitle}\n${cleanText}`);
            };
            const parseLabelLine = (line) => {
              const raw = normalizeTextForMeta(line || '').trim();
              if (!raw) return null;
              const lineText = raw
                .replace(/^[\-\*]\s*/, '')
                .replace(/^\*\*(.*?)\*\*\s*:?\s*/, '$1:');
              const m = lineText.match(/^(.+?)\s*[:閿涙瓥\s*(.*)$/);
              if (!m) return null;
              return [normalizeTextForMeta(m[1]).trim(), normalizeTextForMeta(m[2]).trim()];
            };
            const pickFirst = (labelList, fallbackValue) => {
              for (const item of labelList) {
                if (item) return item;
              }
              return fallbackValue || '';
            };
            const normalizeTagValue = (value) =>
              normalizeTextForMeta(value || '')
                .replace(/\s+/g, ' ')
                .trim();

            const collectLabeledPairs = (rows) => {
              const map = new Map();
              rows.forEach((line) => {
                const parsed = parseLabelLine(line);
                if (!parsed) return;
                const [label, value] = parsed;
                if (!label || !value) return;
                const key = label.toLowerCase();
                if (!map.has(key) || normalizeTagValue(map.get(key)).length < value.length) {
                  map.set(key, value);
                }
              });
              return map;
            };
            const buildLabeledText = (map, order) => {
              const lines = [];
              order.forEach((label) => {
                const key = normalizeTextForMeta(label).toLowerCase();
                if (map.has(key)) {
                  lines.push(`- **${label}**: ${map.get(key)}`);
                }
              });
              map.forEach((value, key) => {
                if (!order.includes(key)) {
                  lines.push(`- **${key}**: ${value}`);
                }
              });
              return lines.join('\n');
            };

            const splitBlockText = (text) => {
              const normalized = normalizeTextForMeta(text || '');
              if (!normalized) return [];
              return normalized
                .split('\n')
                .map((item) => item.trim())
                .filter(Boolean);
            };
            const getNodeText = (el) =>
              normalizeTextForMeta(el && (el.innerText || el.textContent || ''));
            const titleZhText = getNodeText(
              document.querySelector('.paper-title-row .paper-title-zh'),
            ) || getNodeText(document.querySelector('.paper-title-zh'));
            const titleEnText = getNodeText(
              document.querySelector('.paper-title-row .paper-title-en'),
            ) || getNodeText(document.querySelector('.dpr-title-en'));
            const metaLeftRows = Array.from(
              document.querySelectorAll('.paper-meta-left p'),
            ).flatMap((el) => splitBlockText(getNodeText(el)));
            const metaRightRows = Array.from(
              document.querySelectorAll('.paper-meta-right p'),
            ).flatMap((el) => splitBlockText(getNodeText(el)));
            const glanceRows = Array.from(
              document.querySelectorAll('.paper-glance-col'),
            ).map((col) => {
              const label = getNodeText(
                col.querySelector('.paper-glance-label'),
              );
              const content = getNodeText(
                col.querySelector('.paper-glance-content'),
              );
              if (!label && !content) return '';
              return `- **${label || '妞?}**: ${content || '-'}`;
            });
            const fallbackArray = (value, label = '') =>
              value ? [`- **${label}**: ${Array.isArray(value) ? value.join(' / ') : String(value)}`] : [];

            const titleRowText = [
              `- **娑擃叀瀚抽弬鍥ㄧ垼妫?*: ${titleZhText || frontmatterPaperMeta.title_zh || '-'} / ${titleEnText || frontmatterPaperMeta.title || '-'}`,
            ].filter(Boolean);

            const metaPairs = collectLabeledPairs([...metaLeftRows, ...metaRightRows]);
            const fallbackMetaPairs = collectLabeledPairs([
              ...fallbackArray(frontmatterPaperMeta.evidence, 'Evidence'),
              ...fallbackArray(frontmatterPaperMeta.tldr, 'TLDR'),
              ...fallbackArray(frontmatterPaperMeta.authors, 'Authors'),
              ...fallbackArray(frontmatterPaperMeta.date, 'Date'),
              ...fallbackArray(frontmatterPaperMeta.pdf, 'PDF'),
              ...fallbackArray(frontmatterPaperMeta.tags, 'Tags'),
              ...fallbackArray(frontmatterPaperMeta.score, 'Score'),
            ]);
            ['Evidence', 'TLDR', 'Authors', 'Date', 'PDF', 'Tags', 'Score'].forEach(
              (label) => {
                const key = label.toLowerCase();
                if (!metaPairs.has(key)) {
                  const value = normalizeTagValue(
                    fallbackMetaPairs.get(key) || '',
                  );
                  if (value) metaPairs.set(key, value);
                }
              },
            );
            const glancePairs = collectLabeledPairs(glanceRows);
            const fallbackGlancePairs = collectLabeledPairs([
              ...fallbackArray(frontmatterPaperMeta.motivation, 'Motivation'),
              ...fallbackArray(frontmatterPaperMeta.method, 'Method'),
              ...fallbackArray(frontmatterPaperMeta.result, 'Result'),
              ...fallbackArray(frontmatterPaperMeta.conclusion, 'Conclusion'),
            ]);
            ['Motivation', 'Method', 'Result', 'Conclusion'].forEach((label) => {
              const key = label.toLowerCase();
              if (!glancePairs.has(key)) {
                const value = normalizeTagValue(
                  fallbackGlancePairs.get(key) || '',
                );
                if (value) glancePairs.set(key, value);
              }
            });

            const titleBarEl = document.querySelector('.dpr-title-bar');
            const pageContentEl = document.querySelector('.dpr-page-content');
            const chatContainerEl = document.getElementById('paper-chat-container');
            const chatHistoryEl = document.getElementById('chat-history');
            const uiRows = [
              `- **dpr-title-bar**: ${titleBarEl ? '瀹稿弶瀵曟潪? : '閺堫亝顥呭ù瀣煂'}`,
              `- **dpr-page-content**: ${pageContentEl ? '瀹稿弶瀵曟潪? : '閺堫亝顥呭ù瀣煂'}`,
              `- **paper-title-row**: ${document.querySelector('.paper-title-row') ? '瀹稿弶瀵曟潪? : '閺堫亝顥呭ù瀣煂'}`,
              `- **paper-meta-row**: ${document.querySelector('.paper-meta-row') ? '瀹稿弶瀵曟潪? : '閺堫亝顥呭ù瀣煂'}`,
              `- **paper-glance-section**: ${document.querySelector('.paper-glance-section') ? '瀹稿弶瀵曟潪? : '閺堫亝顥呭ù瀣煂'}`,
              `- **#paper-chat-container**: ${chatContainerEl ? '瀹稿弶瀵曟潪? : '閺堫亝顥呭ù瀣煂'}`,
              `- **#chat-history**: ${chatHistoryEl ? '瀹稿弶瀵曟潪? : '閺堫亝顥呭ù瀣煂'}`,
            ];

            addMetaSectionBlock(
              'paper-title-row閿涘牆寮荤拠顓熺垼妫版ê灏崺鐕傜礆',
              titleRowText.join('\n'),
            );
            addMetaSectionBlock(
              'paper-meta-row閿涘牅鑵戦梻缈犱繆閹垰灏敍?,
              cleanText(
                buildLabeledText(
                  metaPairs,
                  ['evidence', 'tldr', 'authors', 'date', 'pdf', 'tags', 'score'],
                ),
              ),
            );
            const tldrText = pickFirst(
              [
                rawTldrText,
                metaPairs.get('tldr'),
                fallbackMetaPairs.get('tldr'),
              ],
              '',
            );
            if (tldrText) {
              addMetaBlock(TLDR_MARKER, normalizeTagValue(tldrText));
              addRawMetaBlock(TLDR_MARKER, normalizeTagValue(tldrText));
            }
            const glanceText = cleanText(
              buildLabeledText(glancePairs, [
                'motivation',
                'method',
                'result',
                'conclusion',
              ]),
            );
            if (glanceText) {
              addMetaBlock(GLANCE_MARKER, glanceText);
              addRawMetaBlock(GLANCE_MARKER, glanceText);
            }
            addMetaSectionBlock(
              '妞ょ敻娼扮€佃壈鍩呮稉搴濇唉娴滄帒鐪?,
              cleanText(uiRows.join('\n')),
            );

            // 1) 閸忋劍鏋冨▓浣冩儰閿涙碍瀵滄い鐢告桨 heading 閼奉亜濮╅崚鍥ф健閿涘奔绻氶幐渚€銆庢惔蹇撳晸閸?            const paperBodySections = collectPaperBodySections(sectionEl);
            paperBodySections.forEach((section) => {
              if (section && section.text) {
                addMetaSectionBlock(section.title, section.text);
              }
            });

            if (aiSummaryText) {
              // AI Summary 閸栧搫娼￠敍姘矌娣囨繄鏆€ AI 閹芥顩﹀锝嗘瀮閿涘奔绗夐崘宥堝殰閸斻劍瀚鹃崗?Tags
              let aiBlock = `${START_MARKER}\n`;
              if (aiSummaryText) {
                aiBlock += aiSummaryText;
              }
              addMetaBlock(START_MARKER, aiBlock);
              addRawMetaBlock(
                START_MARKER,
                [rawSummary]
                  .filter(Boolean)
                  .join('\n\n'),
              );
            }
            if (chatSection) {
              addMetaBlock(CHAT_MARKER, chatSection);
              addRawMetaBlock(CHAT_MARKER, chatSection);
            }
            if (origAbstractText) {
              addMetaBlock(ORIG_MARKER, origAbstractText);
              addRawMetaBlock(ORIG_MARKER, rawOriginal);
            }

            // 閸忔粌绨?raw 閼辨艾鎮庨敍姘扁€樻穱婵呯箽閻?AI Summary / Original Abstract 閸樼喎顫?Markdown
            // 閿涘牓浼╅崗宥囩病鏉?DOM 閺傚洦婀伴崠鏍熅瀵板嫬鎮楅崗顒€绱＄悮顐ｆ暭閸愭瑱绱?            abstractText = parts.join('\n\n\n').trim();
            abstractTextForMetaRaw = rawParts.join('\n\n\n').trim();
          }

          if (abstractText) {
            const abstractTextForMeta =
              abstractTextForMetaRaw || abstractText;
            if (abstractTextForMeta) {
              // 閻?Zotero Connector 鐢瓕鐦戦崚顐ゆ畱鐎涙顔岄崥宥忕窗citation_abstract
              // 閻劌宕版担宥囶儊缂傛牜鐖滈幑銏ｎ攽閿涘矂浼╅崗?Connector 鐎电厧鍙嗛弮鏈垫丢婢惰鲸顔岄拃鍊熺珶閻?              const metaText = encodeCitationAbstractForMeta(abstractTextForMeta);
              updateMetaTag('citation_abstract', metaText, {
                useFallback: false,
              });
            }
          }

          document
            .querySelectorAll('meta[name="citation_author"]')
            .forEach((el) => el.remove());
          const authorList = authors.length ? authors : defaultAuthors;
          authorList.forEach((author) => {
            const meta = document.createElement('meta');
            meta.name = 'citation_author';
            meta.content = author;
            document.head.appendChild(meta);
          });

          document.dispatchEvent(
            new Event('ZoteroItemUpdated', {
              bubbles: true,
              cancelable: true,
            }),
          );
        } catch (e) {
          console.error('Zotero meta update failed:', e);
        }
      };

      // 鐎电厧鍤紒娆忓従鐎瑰啫澧犵粩顖浤侀崸妤嬬礄娓氬顩ч懕濠傘亯濡€虫健閿涘瀵岄崝銊ュ煕閺?Zotero 閸忓啯鏆熼幑?      window.DPRZoteroMeta = window.DPRZoteroMeta || {};
      window.DPRZoteroMeta.updateFromPage = (paperId, vmRouteFile) =>
        Promise.resolve(
          updateZoteroMetaFromPage(paperId, vmRouteFile, latestPaperRawMarkdown),
        ).catch((e) => {
          console.error('Zotero meta update failed:', e);
        });

      // 閸忣剙鍙″銉ュ徔閿涙艾婀幐鍥х暰閸忓啰绀屾稉濠冭閺屾挸鍙曞?      const renderMathInEl = (el) => {
        if (!window.renderMathInElement || !el) return;
        window.renderMathInElement(el, {
          delimiters: [
            { left: '$$', right: '$$', display: true },
            { left: '$', right: '$', display: false },
          ],
          throwOnError: false,
        });
      };

      // 閸忣剙鍙″銉ュ徔閿涙氨鐣濋崡鏇°€冮弽?+ 閺嶅洩顔囨穱顔筋劀閿?      // 1閿涘些闂勩倕宕楃拋顔界垼鐠?[ANS]/[THINK]
      // 2閿涘些闂勩倛銆冮弽鑹邦攽娑斿妫挎径姘稇缁岄缚顢戦敍宀勪缉閸忓秵濡搁崥灞肩瀵姾銆冮幏鍡樺灇娑撱倕娼?      const normalizeTables = (markdown) => {
        if (!markdown) return '';
        // 濞撳懐鎮婇崢鍡楀蕉闁鏆€閻ㄥ嫬宕楃拋顔界垼鐠?        let text = markdown
          .replace(/\[ANS\]/g, '')
          .replace(/\[THINK\]/g, '');

        const lines = text.split('\n');
        const isTableLine = (line) => /^\s*\|.*\|\s*$/.test(line);
        const result = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          const prev = result.length ? result[result.length - 1] : '';
          const next = i + 1 < lines.length ? lines[i + 1] : '';
          if (
            line.trim() === '' &&
            isTableLine(prev || '') &&
            isTableLine(next || '')
          ) {
            // 鐠哄疇绻冪悰銊︾壐鐞涘奔绠ｉ梻瀵告畱缁岄缚顢?            continue;
          }
          result.push(line);
        }
        return result.join('\n');
      };

      const escapeHtml = (str) => {
        return str
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;');
      };

      // 閼奉亜鐣炬稊澶庛€冮弽鍏艰閺屾搫绱板Λ鈧ù?Markdown 鐞涖劍鐗搁崸妤€鑻熼幍瀣晸閻㈢喐鍨?<table>閿?      // 閸忔湹绮崘鍛啇娴犲秳姘︾紒?marked 濞撳弶鐓嬮妴?      // 閸氬本妞傛穱婵囧Б LaTeX 閸忣剙绱￠崸妤嬬礉闁灝鍘ょ悮?marked 鐠囶垵袙閺嬫劑鈧?      const renderMarkdownWithTables = (markdown) => {
        const text = normalizeTables(markdown || '');

        // 娣囨繃濮?LaTeX 閸忣剙绱￠敍姘帥閻劌宕版担宥囶儊閺囨寧宕查敍灞捐閺屾挸鎮楅崘宥嗕划婢?        const latexBlocks = [];
        let protectedText = text;

        // 娣囨繃濮㈤崸妤冮獓閸忣剙绱?$$...$$
        protectedText = protectedText.replace(/\$\$([\s\S]*?)\$\$/g, (match) => {
          const idx = latexBlocks.length;
          latexBlocks.push(match);
          return `%%LATEX_BLOCK_${idx}%%`;
        });

        // 娣囨繃濮㈢悰灞藉敶閸忣剙绱?$...$閿涘牅绗夌捄銊攽閿?        protectedText = protectedText.replace(/\$([^\$\n]+?)\$/g, (match) => {
          const idx = latexBlocks.length;
          latexBlocks.push(match);
          return `%%LATEX_INLINE_${idx}%%`;
        });

        // 妫板嫬顦╅悶鍡窗閹靛濮╃亸?**...** 閸?*...* 鏉烆剚宕叉稉?HTML 閺嶅洨顒?        // 鐟欙絽鍠?marked 鐎甸€涜厬閺傚洤鐡х粭锔芥⒑閻ㄥ嫮鐭栨担?閺傛粈缍嬬拠鍡楀焼闂傤噣顣?        // 濞夈劍鍓伴敍姘涧閸栧綊鍘ら崥灞肩鐞涘苯鍞撮妴浣风瑬閸愬懎顔愭稉宥堢Т鏉?100 鐎涙顑侀惃鍕剰閸愮绱濋柆鍨帳鐠囶垰灏柊?        protectedText = protectedText.replace(/\*\*([^*\n]{1,100}?)\*\*/g, '<strong>$1</strong>');
        // 閺傛粈缍嬮敍姘愁洣濮瑰倸澧犻崥搴㈡箒缁岀儤鐗搁幋鏍﹁厬閺傚洤鐡х粭锕佺珶閻ｅ矉绱濋柆鍨帳鐠囶垰灏柊宥勭閸欓鐡?        protectedText = protectedText.replace(/(?<=[^\*]|^)\*([^*\n]{1,50}?)\*(?=[^\*]|$)/g, '<em>$1</em>');

        const lines = protectedText.split('\n');
        const isTableLine = (line) => /^\s*\|.*\|\s*$/.test(line);
        const isAlignLine = (line) =>
          /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/.test(line);

        const parseRow = (line) => {
          const trimmed = line.trim().replace(/^\|/, '').replace(/\|$/, '');
          return trimmed.split('|').map((cell) => cell.trim());
        };

        const inlineRender = (cellText) => {
          if (!cellText) return '';
          if (window.marked && window.marked.parseInline) {
            return window.marked.parseInline(cellText);
          }
          return escapeHtml(cellText);
        };

        const blocks = [];
        let i = 0;

        const flushParagraph = (paraLines) => {
          const paraText = paraLines.join('\n').trim();
          if (!paraText) return;
          if (window.marked) {
            blocks.push(window.marked.parse(`\n${paraText}\n`));
          } else {
            blocks.push(`<p>${escapeHtml(paraText)}</p>`);
          }
        };

        while (i < lines.length) {
          const line = lines[i];

          // 濡偓濞村銆冮弽鐓庢健閿涙艾缍嬮崜宥堫攽閺勵垵銆冮弽鑹邦攽閿涘奔绗呮稉鈧悰灞炬Ц鐎靛綊缍堢悰?          if (
            isTableLine(line) &&
            i + 1 < lines.length &&
            isAlignLine(lines[i + 1])
          ) {
            const headerLine = lines[i];
            i += 2; // 鐠哄疇绻冪€靛綊缍堢悰?
            const bodyLines = [];
            while (i < lines.length && isTableLine(lines[i])) {
              bodyLines.push(lines[i]);
              i++;
            }

            const headers = parseRow(headerLine);
            const rows = bodyLines.map(parseRow);

            let html = '<table class="chat-table"><thead><tr>';
            headers.forEach((h) => {
              html += `<th>${inlineRender(h)}</th>`;
            });
            html += '</tr></thead><tbody>';
            rows.forEach((row) => {
              html += '<tr>';
              row.forEach((cell) => {
                html += `<td>${inlineRender(cell)}</td>`;
              });
              html += '</tr>';
            });
            html += '</tbody></table>';

            blocks.push(html);
          } else {
            // 闂堢偠銆冮弽鐓庢健閿涙碍鏁归梿鍡楀煂娑撳绔存稉顏囥€冮弽鍏煎灗缂佹挸鐔?            const paraLines = [];
            while (
              i < lines.length &&
              !(
                isTableLine(lines[i]) &&
                i + 1 < lines.length &&
                isAlignLine(lines[i + 1])
              )
            ) {
              paraLines.push(lines[i]);
              i++;
            }
            flushParagraph(paraLines);
          }
        }

        let result = blocks.join('');

        // 閹垹顦?LaTeX 閸忣剙绱?        result = result.replace(/%%LATEX_BLOCK_(\d+)%%/g, (_, idx) => latexBlocks[parseInt(idx, 10)]);
        result = result.replace(/%%LATEX_INLINE_(\d+)%%/g, (_, idx) => latexBlocks[parseInt(idx, 10)]);

        return result;
      };

      const updateMetaTag = (name, content, options = {}) => {
        document
          .querySelectorAll(`meta[name="${name}"]`)
          .forEach((el) => el.remove());
        const useFallback = options.useFallback !== false;
        const value = content || (useFallback ? metaFallbacks[name] : '');
        if (!value) return;
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = value;
        document.head.appendChild(meta);
      };

      const SUMMARY_META_NAMES = ['citation_abstract'];

      const clearSummaryMetaFields = () => {
        SUMMARY_META_NAMES.forEach((name) => {
          document
            .querySelectorAll(`meta[name="${name}"]`)
            .forEach((el) => el.remove());
        });
      };

      // 鐎电厧鍤紒娆忣樆闁劍膩閸ф绱欐笟瀣洤閼卞﹤銇夊Ο鈥虫健閿涘顦查悽?      window.DPRMarkdown = {
        normalizeTables,
        renderMarkdownWithTables,
        renderMathInEl,
      };

      // 3. 鐏忓繐鐫嗘稉瀣剁窗閻愮懓鍤笟褑绔熼弽蹇旀蒋閻╊喖鎮楅懛顏勫З閺€鎯版崳娓氀嗙珶閺嶅骏绱欓崗銊ョ潌閸掓銆?閳?濮濓絾鏋冮敍?      const setupMobileSidebarAutoCloseOnItemClick = () => {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;
        if (nav.dataset.mobileAutoCloseBound === '1') return;
        nav.dataset.mobileAutoCloseBound = '1';

        nav.addEventListener('click', (event) => {
          const link = event.target.closest('a');
          if (!link) return;

          const href = link.getAttribute('href') || '';
          // 閸欘亜顦╅悶?Docsify 閸愬懘鍎寸捄顖滄暠閿?/ 瀵偓婢惰揪绱氶敍宀勪缉閸忓秴濂栭崫宥咁樆闁?          if (!href.includes('#/')) return;

          const width =
            window.innerWidth || document.documentElement.clientWidth || 0;
          // 缂佺喍绔撮垾婊冧簳鐎硅棄鐫?+ 缁愬嫬鐫嗛垾婵呰礋閸氬奔绔存總妤呪偓鏄忕帆閿?1024 閺冨墎鍋ｉ崙缁樻蒋閻╊喖鎮楅懛顏勫З閺€鎯版崳 sidebar閿涘牆鍙忕仦蹇撳灙鐞?閳?濮濓絾鏋冮敍?          if (width >= 1024) return;

          // 鐠?Docsify 閸忓牆鐣幋鎰熅閻㈣精鐑︽潪顒婄礉閸愬秵鏁圭挧铚傛櫠鏉堣鐖?          setTimeout(() => {
            const body = document.body;
            if (!body) return;
            // 闁倿鍘?Docsify 缁夎濮╃粩顖氬斧閻㈢喕顕㈡稊澶涚窗鐏忓繐鐫嗛弨鎯版崳娓氀嗙珶閺嶅繑妞傛稉宥勭箽閻?close 缁?            body.classList.remove('close');
          }, 0);
        });
      };

      // 4. 娓氀嗙珶閺嶅繑瀵滈垾婊勬）閺堢啿鈧繃濮岄崣鐘垫畱鏉堝懎濮崙鑺ユ殶
      const setupCollapsibleSidebarByDay = () => {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;

        const joinUrlPath = (a, b) => {
          const aa = String(a || '');
          const bb = String(b || '');
          if (!aa) return bb.replace(/^\/+/, '');
          if (!bb) return aa;
          const left = aa.endsWith('/') ? aa : `${aa}/`;
          const right = bb.replace(/^\/+/, '');
          return `${left}${right}`;
        };

        const getDocsifyBasePath = () => {
          const bp =
            window.$docsify && typeof window.$docsify.basePath === 'string'
              ? window.$docsify.basePath
              : '';
          return String(bp || '');
        };

        const normalizeHashHref = (href) => {
          const raw = String(href || '').trim();
          if (!raw) return '';
          if (raw.startsWith('#/')) return raw;
          if (raw.startsWith('#')) return `#/${raw.slice(1).replace(/^\//, '')}`;
          return `#/${raw.replace(/^\//, '')}`;
        };

        const isPaperRouteHash = (hash) => {
          const route = String(hash || '')
            .replace(/^#\/?/, '')
            .replace(/\.md$/i, '')
            .replace(/\/$/, '');
          return (
            /^(\d{6}\/\d{2}|\d{8}(?:-\d{8}))\/(?!README$).+/i.test(route) &&
            /^(\d{6}\/\d{2}|\d{8}(?:-\d{8}))\/[^/]+$/i.test(route)
          );
        };

        const getDirectText = (li) => {
          if (!li) return '';
          if (typeof Node !== 'undefined') {
            const directTextNode = Array.from(li.childNodes || []).find((n) => {
              if (!n || n.nodeType !== Node.TEXT_NODE) return false;
              return String(n.textContent || '').trim();
            });
            if (directTextNode) {
              return String(directTextNode.textContent || '').trim();
            }
          }
          const title = li.querySelector(
            ':scope > .sidebar-day-toggle .sidebar-day-toggle-label',
          );
          return String((title && title.textContent) || '').trim();
        };

        const getPaperSectionFromAnchor = (anchor, rowLi) => {
          if (!anchor || !rowLi) return '';
          let currentLi = anchor.closest('li');
          while (currentLi) {
            const parentUl = currentLi.parentElement;
            const parentLi = parentUl ? parentUl.closest('li') : null;
            if (!parentLi || parentLi === rowLi) break;
            const text = getDirectText(parentLi);
            if (
              text &&
              !/^(\d{4}-\d{2}-\d{2})(\s*~\s*\d{4}-\d{2}-\d{2})?$/.test(
                text,
              )
            ) {
              return text;
            }
            currentLi = parentLi;
          }
          return '';
        };

        const collectDayPaperItems = (rowLi) => {
          if (!rowLi) return [];
          const anchors = Array.from(rowLi.querySelectorAll('a[href*=\"#/\"]'));
          const out = [];
          const seen = new Set();

          anchors.forEach((anchor) => {
            const href = normalizeHashHref(anchor.getAttribute('href'));
            if (!href || !isPaperRouteHash(href)) return;
            const paperId = href.replace(/^#\//, '');
            if (!paperId || paperId.endsWith('/README')) return;
            if (seen.has(paperId)) return;
            seen.add(paperId);
            out.push({
              anchor,
              href,
              paperId,
              section: getPaperSectionFromAnchor(anchor, rowLi),
            });
          });
          return out;
        };

        const EMAIL_PREFIX = '\u{1F4E7} ';
        const EMAIL_SOURCE_PATTERN = /(gmail|email|google[_\s-]*scholar)/i;
        const DAY_SOURCE_CACHE_KEY = 'dpr_sidebar_day_source_v1';
        let daySourceCache = {};
        try {
          const raw = window.localStorage
            ? window.localStorage.getItem(DAY_SOURCE_CACHE_KEY)
            : null;
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed === 'object') {
              daySourceCache = parsed;
            }
          }
        } catch {
          daySourceCache = {};
        }

        const stripEmailPrefix = (text) => String(text || '').replace(/^\u{1F4E7}\s*/u, '').trim();
        const applyDayLabelText = (labelEl, rawText, isEmailDay) => {
          if (!labelEl) return;
          const plain = stripEmailPrefix(rawText);
          labelEl.textContent = isEmailDay ? `${EMAIL_PREFIX}${plain}` : plain;
        };
        const isEmailSource = (sourceValue) => EMAIL_SOURCE_PATTERN.test(String(sourceValue || ''));

        const saveDaySourceCache = () => {
          try {
            if (window.localStorage) {
              window.localStorage.setItem(DAY_SOURCE_CACHE_KEY, JSON.stringify(daySourceCache || {}));
            }
          } catch {
            // ignore
          }
        };

        const fetchPaperSourceFromMarkdown = async (paperId) => {
          const id = String(paperId || '').trim();
          if (!id) return '';
          const baseHref = window.location.href.split('#')[0];
          const rel = joinUrlPath(getDocsifyBasePath(), `${id}.md`);
          const mdUrl = new URL(rel, baseHref).toString();
          const resp = await fetch(mdUrl, { cache: 'no-store' });
          if (!resp.ok) return '';
          const rawMarkdown = await resp.text();
          const parsed = parseFrontMatter(rawMarkdown || '');
          const meta = parsed && parsed.meta ? parsed.meta : {};
          return String(meta.source || meta.Source || '').trim();
        };

        const detectEmailDayByPaperItems = async (paperItems) => {
          const items = Array.isArray(paperItems) ? paperItems : [];
          if (!items.length) return false;
          const probeItems = items.slice(0, 3);
          for (const item of probeItems) {
            try {
              const source = await fetchPaperSourceFromMarkdown(item.paperId);
              if (isEmailSource(source)) {
                return true;
              }
            } catch {
              // ignore
            }
          }
          return false;
        };

        const normalizeSection = (section) => {
          const v = String(section || '').trim();
          if (!v) return '';
          if (/濞ｅ崬瀹硘缁崘顕皘deep/i.test(v)) return 'deep';
          if (/闁喕顕皘闁喕顫峾quick/i.test(v)) return 'quick';
          return v.toLowerCase();
        };

        const normalizeAuthorsForExport = (authors) => {
          if (Array.isArray(authors)) {
            return authors
              .map((item) => String(item || '').trim())
              .filter(Boolean)
              .join(', ');
          }
          return String(authors || '').trim();
        };

        const normalizeTagsForExport = (tags) => {
          if (!tags) return '';
          if (Array.isArray(tags)) {
            return tags
              .map((tag) => {
                if (typeof tag === 'string') return tag.trim();
                if (!tag || typeof tag !== 'object') return '';
                const kind = String(tag.kind || '').trim();
                const label = String(tag.label || '').trim();
                return kind ? `${kind}:${label}` : label;
              })
              .filter(Boolean)
              .join(', ');
          }
          return String(tags || '').trim();
        };

        const normalizeDateField = (value) => {
          const text = String(value || '').trim();
          if (!text) return '';
          const m = text.match(/(\d{4})(\d{2})(\d{2})/);
          if (!m) return text;
          return `${m[1]}-${m[2]}-${m[3]}`;
        };

        const buildPaperMetaFromMarkdown = (paperId, section, markdownText) => {
          const parsed = parseFrontMatter(markdownText || '');
          const meta = parsed && parsed.meta ? parsed.meta : {};
          const body = parsed && parsed.body ? parsed.body : '';

          const title_en = String(meta.title_en || meta.title || '').trim();
          const abstractFromFrontMatter = String(
            meta.abstract_en || meta.abstract || '',
          ).trim();
          const authors = normalizeAuthorsForExport(meta.authors || meta.author);
          const score = String(meta.score || '').trim();
          const evidence = String(meta.evidence || '').trim();
          const tldr = String(meta.tldr || meta.summary || '').trim();

          const abstractFromBody = trimBeforeMarkers(
            extractSectionByTitle(body, (title) => {
              const normalized = String(title || '').trim().toLowerCase();
              return normalized === 'abstract' || normalized === '閹芥顩?;
            }),
            [],
          ).trim();

          return {
            paper_id: paperId,
            section: normalizeSection(section) || 'quick',
            title_en,
            source: String(meta.source || meta.Source || '').trim(),
            selection_source: String(meta.selection_source || '').trim(),
            authors,
            date: normalizeDateField(meta.date || ''),
            pdf: String(meta.pdf || meta.PDF || '').trim(),
            score,
            evidence,
            tldr,
            tags: normalizeTagsForExport(meta.tags || []),
            abstract_en: abstractFromFrontMatter || abstractFromBody,
          };
        };

        const markDayPapersUnrecommended = (paperItems) => {
          if (!Array.isArray(paperItems) || !paperItems.length) return;
          let readState = loadReadState();
          if (!readState || typeof readState !== 'object') readState = {};
          const toClear = new Set(['good', 'blue', 'orange', 'bad']);
          let changed = false;
          paperItems.forEach((item) => {
            const paperId = item && typeof item.paperId === 'string' ? item.paperId : '';
            if (!paperId) return;
            if (toClear.has(String(readState[paperId] || '').trim().toLowerCase())) {
              delete readState[paperId];
              changed = true;
            }
          });
          if (changed) saveReadState(readState);
        };

        const closeAllDayMenus = () => {
          const openedMenus = nav.querySelectorAll('.sidebar-day-menu.is-open');
          openedMenus.forEach((m) => {
            m.classList.remove('is-open');
          });
        };

        if (!nav.dataset.dprDayMenuBound) {
          nav.dataset.dprDayMenuBound = '1';
          document.addEventListener('click', (e) => {
            const target = e && e.target ? e.target : null;
            if (!target || !target.closest) return;
            if (!target.closest('.sidebar-day-toggle-actions')) {
              closeAllDayMenus();
            }
          });
        }

        const downloadJson = (filename, data) => {
          const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json;charset=utf-8',
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.className = 'dpr-sidebar-export-link';
          a.target = '_self';
          a.style.display = 'none';
          const stopLinkNav = (event) => {
            event.stopPropagation();
            if (event.stopImmediatePropagation) event.stopImmediatePropagation();
          };
          a.addEventListener('click', stopLinkNav, true);
          document.body.appendChild(a);
          requestAnimationFrame(() => {
            a.click();
            setTimeout(() => {
              a.remove();
            }, 0);
          });
          setTimeout(() => URL.revokeObjectURL(url), 500);
        };

        const STORAGE_KEY = 'dpr_sidebar_day_state_v1';
        const HIDDEN_DAYS_KEY = '__hiddenDays';
        let state = {};
        let hiddenDays = new Set();
        try {
          const raw = window.localStorage
            ? window.localStorage.getItem(STORAGE_KEY)
            : null;
          if (raw) {
            state = JSON.parse(raw) || {};
            const savedHidden = state[HIDDEN_DAYS_KEY];
            if (Array.isArray(savedHidden)) {
              hiddenDays = new Set(
                savedHidden
                  .map((x) => (typeof x === 'string' ? x : ''))
                  .filter(Boolean),
              );
            }
          }
        } catch {
          state = {};
          hiddenDays = new Set();
        }
        // 閸忓牊澹傞幓蹇庣闁稄绱濋幍鎯у毉閹碘偓閺堝妫╅張鐔锋嫲閺堚偓閺傞绔存径?        const items = nav.querySelectorAll('li');
        const dayItems = [];
        let latestDay = '';

        items.forEach((li) => {
          const childUl = li.querySelector(':scope > ul');
          const directLink = li.querySelector(':scope > a');
          if (!childUl || directLink) return;

          // 閸欐牗妫╅張鐔告瀮閺堫剨绱?          // - 閸掓繃顐奸敍姝璱 閻ㄥ嫮顑囨稉鈧稉顏呮瀮閺堫剝濡悙?          // - 瀹告彃鍨垫慨瀣鏉╁浄绱皐rapper 閸愬懐娈?label
          let rawText = '';
          let firstTextNode = null;
          const first = li.firstChild;
          if (first && first.nodeType === Node.TEXT_NODE) {
            rawText = (first.textContent || '').trim();
            firstTextNode = first;
          } else {
            const label = li.querySelector(
              ':scope > .sidebar-day-toggle .sidebar-day-toggle-label',
            );
            rawText = (label && (label.textContent || '').trim()) || '';
          }
          rawText = rawText.replace(/^\u{1F4E7}\s*/u, '').trim();

          const rangeMatch = rawText.match(
            /^(\d{4}-\d{2}-\d{2})\s*~\s*(\d{4}-\d{2}-\d{2})$/,
          );
          const isSingleDay = /^\d{4}-\d{2}-\d{2}$/.test(rawText);
          if (!isSingleDay && !rangeMatch) return;

          const dayKey = rangeMatch ? rangeMatch[2] : rawText; // 閻劌灏梻绮光偓婊呯波閺夌喐妫╅垾婵嗗棘娑撳孩娓堕弬鐗堟）閸掋倖鏌?          if (hiddenDays.has(dayKey)) return;

          dayItems.push({ li, text: rawText, firstTextNode, dayKey });
          if (!latestDay || dayKey > latestDay) {
            latestDay = dayKey;
          }
        });

        if (!dayItems.length) return;

        // 閸掋倖鏌囬弰顖氭儊閸戣櫣骞囨禍鍡忊偓婊勬纯閺傛澘鎮楅惃鍕煀娑撯偓婢垛斁鈧?        const prevLatest =
          typeof state.__latestDay === 'string' ? state.__latestDay : null;
        const isNewDay =
          latestDay &&
          (!prevLatest || (typeof prevLatest === 'string' && latestDay > prevLatest));

        // 婵″倹鐏夐崙铏瑰箛娴滃棙鏌婇惃鍕婢垛晪绱板〒鍛敄閸樺棗褰堕悩鑸碘偓渚婄礉閸欘亙绻氶悾娆愭付閺傞绔存径鈺冩畱娣団剝浼?        if (isNewDay) {
          const prevHidden = hiddenDays;
          state = { __latestDay: latestDay };
          if (prevHidden.size) {
            state[HIDDEN_DAYS_KEY] = Array.from(prevHidden);
          }
        } else if (!prevLatest && latestDay) {
          // 缁楊兛绔村▎鈥插▏閻㈩煉绱濆▽鈩冩箒閸樺棗褰剁拋鏉跨秿娴ｅ棔绡冩稉宥囩暬閳ユ粍鏌婃稉鈧径鈺勑曢崣鎴﹀櫢缂冾喒鈧繄娈戦崷鐑樻珯閿涙俺顔囪ぐ鏇炵秼閸撳秵娓堕弬鐗堟）閺?          state.__latestDay = latestDay;
        }

        const hasAnyState =
          !isNewDay &&
          Object.keys(state).some((k) => k && !k.startsWith('__'));

        const ensureStateSaved = () => {
          try {
            if (window.localStorage) {
              state[HIDDEN_DAYS_KEY] = Array.from(hiddenDays);
              window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            }
          } catch {
            // ignore
          }
        };

        const downloadDayMeta = async (opts) => {
          const { li: rowLi, rawText: rowText } = opts || {};
          const dayPaperItems = collectDayPaperItems(rowLi);
          const payload = {
            label: String(rowText || 'daily-papers').trim(),
            date: String(rowText || '').trim(),
            generated_at: new Date().toISOString(),
            count: 0,
            papers: [],
            errors: [],
          };

          const menuDownload = rowLi
            ? rowLi.querySelector('.sidebar-day-menu-item-download')
            : null;
          const oldText = menuDownload ? menuDownload.textContent : null;
          if (menuDownload) {
            menuDownload.disabled = true;
            menuDownload.textContent = '娑撳娴囨稉?..';
          }
          try {
            if (!dayPaperItems.length) {
              payload.errors.push({
                paper_id: '',
                error: '閺堫剚妫╅崚鍡欑矋娑撳婀幍鎯у煂閸欘垰顕遍崙铏规畱鐠佺儤鏋?,
              });
            } else {
              const baseHref = window.location.href.split('#')[0];
              await Promise.all(
                dayPaperItems.map(async (item) => {
                  let rawMarkdown = '';
                  try {
                    const rel = joinUrlPath(
                      getDocsifyBasePath(),
                      `${item.paperId}.md`,
                    );
                    const mdUrl = new URL(rel, baseHref).toString();
                    const resp = await fetch(mdUrl, { cache: 'no-store' });
                    if (!resp.ok) {
                      throw new Error(`HTTP ${resp.status}`);
                    }
                    rawMarkdown = await resp.text();
                  } catch (err) {
                    payload.errors.push({
                      paper_id: item.paperId,
                      error: String(err && err.message ? err.message : err),
                    });
                    return;
                  }

                  try {
                    payload.papers.push(
                      buildPaperMetaFromMarkdown(item.paperId, item.section, rawMarkdown),
                    );
                  } catch (err) {
                    payload.errors.push({
                      paper_id: item.paperId,
                      error: String(err && err.message ? err.message : err),
                    });
                  }
                }),
              );
            }

            payload.count = payload.papers.length;
            window.DPRLastDayExport = payload;

            const safeLabel = String(payload.label || 'daily-papers')
              .replace(/\s+/g, ' ')
              .trim()
              .replace(/[^\d\-~_ ]/g, '')
              .replace(/\s+/g, '_');
            const filename = `${safeLabel || 'daily-papers'}.json`;
            downloadJson(filename, payload);

            if (rowLi) {
              const trigger = rowLi.querySelector('.sidebar-day-menu-trigger');
              if (trigger) {
                trigger.title = `瀹歌弓绗呮潪鏂ょ窗${payload.count || 0} 缁″樃;
              }
            }
          } catch (err) {
            if (rowLi) {
              const trigger = rowLi.querySelector('.sidebar-day-menu-trigger');
              if (trigger) {
                trigger.title = `娑撳娴囨径杈Е閿涘牐顫嗛幒褍鍩楅崣甯礆閿?{String(
                  err && err.message ? err.message : err,
                )}`;
              }
            }
            console.warn('[DPR Export] 娑撳娴囨径杈Е閿?, err);
            throw err;
          } finally {
            if (menuDownload) {
              menuDownload.disabled = false;
              menuDownload.textContent = oldText || '娑撳娴?JSON';
            }
          }
        };

        const deleteDaySection = ({ rowLi, rowText, dayKey }) => {
          if (!rowLi) return;
          if (dayKey) hiddenDays.add(dayKey);
          if (dayKey) delete state[dayKey];
          if (rowText) delete state[rowText];
          markDayPapersUnrecommended(collectDayPaperItems(rowLi));
          closeAllDayMenus();
          ensureStateSaved();
          rowLi.remove();
          syncSidebarActiveIndicator({ animate: false });
        };

        const DAY_ANIM_MS = 240;

        const setDayCollapsed = (li, collapsed, options = {}) => {
          const { animate = true } = options || {};
          const ul = li.querySelector(':scope > ul');
          if (!ul) return;
          ul.classList.add('sidebar-day-content');

          const doAnimate = animate && !prefersReducedMotion();
          if (!doAnimate) {
            ul.style.transition = 'none';
            ul.style.maxHeight = collapsed ? '0px' : `${ul.scrollHeight}px`;
            ul.style.opacity = collapsed ? '0' : '1';
            requestAnimationFrame(() => {
              ul.style.transition = '';
            });
            return;
          }

          if (collapsed) {
            ul.style.maxHeight = `${ul.scrollHeight}px`;
            ul.style.opacity = '0';
            requestAnimationFrame(() => {
              ul.style.maxHeight = '0px';
            });
          } else {
            ul.style.opacity = '1';
            ul.style.maxHeight = '0px';
            requestAnimationFrame(() => {
              ul.style.maxHeight = `${ul.scrollHeight}px`;
            });
          }

          setTimeout(() => {
            try {
              if (!li.classList.contains('sidebar-day-collapsed')) {
                ul.style.maxHeight = `${ul.scrollHeight}px`;
              }
            } catch {
              // ignore
            }
          }, DAY_ANIM_MS + 30);
        };

        // 缁楊兛绨╅柆宥忕窗閻喐顒滅€瑰顥婇幎妯哄綌鐞涘奔璐?        dayItems.forEach(({ li, text: rawText, firstTextNode, dayKey }) => {
          const childUl = li.querySelector(':scope > ul');
          if (childUl) childUl.classList.add('sidebar-day-content');
          const key = dayKey || rawText;

          // 婢跺秶鏁ら幋鏍у灡瀵?wrapper閿涘牆瀵橀崥顐ｆ）閺堢喐鏋冪€涙鎷扮亸蹇曨唲婢惰揪绱?          let wrapper = li.querySelector(':scope > .sidebar-day-toggle');
          if (!wrapper) {
            wrapper = document.createElement('div');
            wrapper.className = 'sidebar-day-toggle';

            const labelSpan = document.createElement('span');
            labelSpan.className = 'sidebar-day-toggle-label';
            applyDayLabelText(
              labelSpan,
              rawText,
              String(daySourceCache[String(dayKey || rawText)] || '') === 'email',
            );

            const menuTrigger = document.createElement('button');
            menuTrigger.type = 'button';
            menuTrigger.className = 'sidebar-day-menu-trigger';
            menuTrigger.title = '閺囨潙顦块幙宥勭稊';
            menuTrigger.setAttribute('aria-label', '閺囨潙顦块幙宥勭稊');
            menuTrigger.textContent = '閳?;

            const menu = document.createElement('span');
            menu.className = 'sidebar-day-menu';

            const downloadBtn = document.createElement('button');
            downloadBtn.type = 'button';
            downloadBtn.className = 'sidebar-day-menu-item sidebar-day-menu-item-download';
            downloadBtn.textContent = '娑撳娴?JSON';
            downloadBtn.setAttribute('aria-label', '娑撳娴囩拋鐑樻瀮閸忓啯鏆熼幑?JSON');

            const arrowSpan = document.createElement('span');
            arrowSpan.className = 'sidebar-day-toggle-arrow';
            arrowSpan.textContent = '閳?;

            const actions = document.createElement('span');
            actions.className = 'sidebar-day-toggle-actions';
            actions.appendChild(menuTrigger);
            menu.appendChild(downloadBtn);
            actions.appendChild(menu);
            actions.appendChild(arrowSpan);

            wrapper.appendChild(labelSpan);
            wrapper.appendChild(actions);

            // 閻?wrapper 閺囨寧宕查崢鐔奉潗閺傚洦婀伴懞鍌滃仯
            if (firstTextNode && firstTextNode.parentNode === li) {
              li.replaceChild(wrapper, firstTextNode);
            }
          }

          const labelSpan = wrapper.querySelector('.sidebar-day-toggle-label');
          if (labelSpan) {
            applyDayLabelText(
              labelSpan,
              rawText,
              String(daySourceCache[String(dayKey || rawText)] || '') === 'email',
            );
          }
          const arrowSpan = wrapper.querySelector('.sidebar-day-toggle-arrow');
          const menuTrigger = wrapper.querySelector('.sidebar-day-menu-trigger');
          const menu = wrapper.querySelector('.sidebar-day-menu');
          const downloadBtn = wrapper.querySelector('.sidebar-day-menu-item-download');

          if (menuTrigger && !menuTrigger.dataset.dprDayMenuTriggerBound) {
            menuTrigger.dataset.dprDayMenuTriggerBound = '1';
            menuTrigger.addEventListener('click', (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.stopImmediatePropagation) e.stopImmediatePropagation();
              if (!menu) return;
              const nowOpen = !menu.classList.contains('is-open');
              if (nowOpen) {
                closeAllDayMenus();
                menu.classList.add('is-open');
              } else {
                menu.classList.remove('is-open');
              }
            });
          }

          if (downloadBtn && !downloadBtn.dataset.dprDownloadBound) {
            downloadBtn.dataset.dprDownloadBound = '1';
            downloadBtn.addEventListener('click', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (e.stopImmediatePropagation) e.stopImmediatePropagation();
              if (downloadBtn.disabled) return;
              try {
                await downloadDayMeta({
                  li,
                  rawText,
                  dateKey: dayKey || rawText,
                });
              } catch {
                // ignore
              }
              if (menu) {
                menu.classList.remove('is-open');
              }
            });
          }

          // 閸愬啿鐣炬妯款吇鐏炴洖绱?/ 閺€鎯版崳閿?          // - 婵″倹鐏夐張顒侇偧閺勵垪鈧粌鍤悳棰佺啊閺傛壆娈戞稉鈧径鈹锯偓婵撶窗濞撳懐鈹栭崢鍡楀蕉閿涘苯褰х仦鏇炵磻閺堚偓閺傞绔存径鈺嬬幢
          // - 閸氾箑鍨懟銉ュ嚒閺堝鏁ら幋宄颁焊婵傛枻绱檚tate閿涘绱濋幐澶婁焊婵傝姤娼甸敍?          // - 閸氾箑鍨敍鍫ヮ浕濞嗏€插▏閻劋绗栧▽鈩冩箒閸樺棗褰堕敍澶涚窗娴犲應鈧粍娓堕弬棰佺婢垛斁鈧繂鐫嶅鈧敍灞藉従娴ｆ瑦鏁圭挧鏋偓?          let collapsed;
          if (isNewDay) {
            collapsed = key === latestDay ? false : true;
          } else if (hasAnyState) {
            const saved = state[rawText];
            if (saved === 'open') {
              collapsed = false;
            } else if (saved === 'closed') {
              collapsed = true;
            } else {
              // 閺傛澘鍤悳鎵畱閺冦儲婀￠敍姘剁帛鐠併倛绐￠張鈧弬棰佺婢垛晝鐡ラ悾銉ㄨ泲
              collapsed = key === latestDay ? false : true;
            }
          } else {
            collapsed = key === latestDay ? false : true;
          }

          if (collapsed) {
            li.classList.add('sidebar-day-collapsed');
            if (arrowSpan) arrowSpan.textContent = '閳?;
          } else {
            li.classList.remove('sidebar-day-collapsed');
            if (arrowSpan) arrowSpan.textContent = '閳?;
          }

          // 閸掓繂顫愰崠鏍︾濞嗭繝鐝惔锔肩礄娑撳秴浠涢崝銊ф暰閿涘矂浼╅崗宥夘浕濞嗏剝瑕嗛弻鎾绘／閸旑煉绱?          setDayCollapsed(li, collapsed, { animate: false });

          // 缂佹垵鐣鹃悙鐟板毊閿涙矮濞囬悽?capture 闂冭埖顔岄敍宀€鈥樻穱婵嗗祮娴ｆ寧妫悧鍫熸拱瀹稿弶婀?handler 娑旂喕鍏樼憰鍡欐磰
          if (!wrapper.dataset.dprDayToggleBound) {
            wrapper.dataset.dprDayToggleBound = '1';
            wrapper.addEventListener(
              'click',
              (e) => {
                // 閻愮懓鍤懣婊冨礋閹貉傛閺冭绱濇稉宥埿曢崣鎴炴）閺堢喐濮岄崣鐙呯礄閸氾箑鍨?capture 闂冭埖顔屾导姘帥鐞?wrapper 閹凤附鍩呴敍灞筋嚤閼风褰嶉崡鏇熸￥閸濆秴绨查敍?                try {
                  const target = e && e.target && e.target.closest
                    ? e.target.closest(
                        '.sidebar-day-menu-trigger,.sidebar-day-menu,.sidebar-day-menu-item',
                      )
                    : null;
                  if (target) return;
                } catch {
                  // ignore
                }
                closeAllDayMenus();
                e.preventDefault();
                e.stopPropagation();
                if (e.stopImmediatePropagation) e.stopImmediatePropagation();
                const collapsed = li.classList.toggle('sidebar-day-collapsed');
                if (arrowSpan) arrowSpan.textContent = collapsed ? '閳? : '閳?;
                setDayCollapsed(li, collapsed, { animate: true });
                state[rawText] = collapsed ? 'closed' : 'open';
                state.__latestDay = latestDay;
                ensureStateSaved();
                // 閸忓牆浠涙稉鈧▎鈥冲祮閺冭泛鎮撳銉礄娣囨繆鐦夋禍銈勭鞍閸欏秹顩敍澶涚礉閸愬秴婀崝銊ф暰缂佹挻娼崥搴′粵娑撯偓濞嗭紕绮撻幀浣圭墡閸戝棴绱?                // 閸氾箑鍨崚妤勩€冮崷?max-height 鏉╁洦娴稉顓犳埛缂侇厺缍呯粔浼欑礉娴兼俺顔€妤傛ü瀵掗弶鈾€鈧粏绉哄鈧搾濠傜窔娑撳﹤浜搁垾婵勨偓?                requestAnimationFrame(() => {
                  syncSidebarActiveIndicator({ animate: false });
                });
                setTimeout(() => {
                  syncSidebarActiveIndicator({ animate: false });
                }, DAY_ANIM_MS + 34);
              },
              true,
            );
          }

          li.dataset.dayToggleApplied = '2';
        });
        const annotateEmailDayBadges = async () => {
          for (const item of dayItems) {
            const rowLi = item && item.li ? item.li : null;
            const rawText = item && item.text ? item.text : '';
            const key = String((item && (item.dayKey || item.text)) || '').trim();
            if (!rowLi || !key) continue;
            const wrapper = rowLi.querySelector(':scope > .sidebar-day-toggle');
            const labelSpan = wrapper ? wrapper.querySelector('.sidebar-day-toggle-label') : null;

            const cached = String(daySourceCache[key] || '').trim();
            if (cached === 'email' || cached === 'other') {
              applyDayLabelText(labelSpan, rawText, cached === 'email');
              continue;
            }

            const paperItems = collectDayPaperItems(rowLi);
            const isEmailDay = await detectEmailDayByPaperItems(paperItems);
            daySourceCache[key] = isEmailDay ? 'email' : 'other';
            saveDaySourceCache();
            applyDayLabelText(labelSpan, rawText, isEmailDay);
          }
        };
        setTimeout(() => {
          annotateEmailDayBadges().catch(() => {});
        }, 0);

        // 濮ｅ繑顐?doneEach 鐟欙箑褰傞弮鍫曞厴閸掗攱鏌婃稉鈧▎鈾€鈧粌鍑＄仦鏇炵磻閸掑棛绮嶉垾婵堟畱 max-height閿?        // 闁灝鍘?active 妞よ妯夌粈楦跨槑娴犻攱瀵滈柦顔剧搼鐎佃壈鍤ч崘鍛啇妤傛ê瀹抽崣妯哄閸氬氦顫﹂幋顏呮焽閿涘奔绮犻懓灞藉毉閻滄壋鈧粌褰ч張澶屼紗閼规煡鐝禍顔荤稻閻绗夐崚鐗堟瀮鐎涙せ鈧繄娈戦柨娆掝潕閵?        requestAnimationFrame(() => {
          try {
            nav
              .querySelectorAll('li:not(.sidebar-day-collapsed) > ul.sidebar-day-content')
              .forEach((ul) => {
                // 娴犲懎浠涢垾婊堟饯姒涙ü鎱ㄥ锝傗偓婵撶礉闁灝鍘ら崶鐘辫礋 max-height 閸欐ê瀵茬憴锕€褰傛潻鍥ㄦ诞閿涘苯顕遍懛缈犳櫠鏉堣鐖惇瀣崳閺夈儮鈧粍绮撮崝?閸掗攱鏌婇垾婵呯娑?                const prevTransition = ul.style.transition;
                ul.style.transition = 'none';
                ul.style.maxHeight = `${ul.scrollHeight}px`;
                ul.style.opacity = '1';
                requestAnimationFrame(() => {
                  ul.style.transition = prevTransition || '';
                });
              });
          } catch {
            // ignore
          }
        });
      };

      // 4. 鐠佺儤鏋冮垾婊冨嚒闂冨懓顕伴垾婵堝Ц閹胶顓搁悶鍡礄鐎涙ê鍋嶉崷?localStorage閿?      const READ_STORAGE_KEY = 'dpr_read_papers_v1';

      const loadReadState = () => {
        try {
          if (!window.localStorage) return {};
          const raw = window.localStorage.getItem(READ_STORAGE_KEY);
          if (!raw) return {};
          const obj = JSON.parse(raw);
          if (!obj || typeof obj !== 'object') return {};

          // 閸忕厧顔愰弮褏澧楅張顒婄礄閸婇棿璐?true 閻ㄥ嫭鍎忛崘纰夌礆
          const normalized = {};
          Object.keys(obj).forEach((k) => {
            const v = obj[k];
            if (v === true || v === 'read') {
              normalized[k] = 'read';
            } else if (v === 'good' || v === 'bad' || v === 'blue' || v === 'orange') {
              normalized[k] = v;
            }
          });
          return normalized;
        } catch {
          return {};
        }
      };

      const saveReadState = (state) => {
        try {
          if (!window.localStorage) return;
          window.localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(state));
        } catch {
          // ignore
        }
      };

      // ---------- Share to GitHub Gist ----------
      const loadGithubTokenForGist = () => {
        try {
          const secret = window.decoded_secret_private || {};
          if (secret.github && secret.github.token) {
            const t = String(secret.github.token || '').trim();
            if (t) return t;
          }
        } catch {
          // ignore
        }
        try {
          if (!window.localStorage) return null;
          const raw = window.localStorage.getItem('github_token_data');
          if (!raw) return null;
          const obj = JSON.parse(raw) || {};
          const t = String(obj.token || '').trim();
          return t || null;
        } catch {
          return null;
        }
      };

      const joinUrlPath = (a, b) => {
        const aa = String(a || '');
        const bb = String(b || '');
        if (!aa) return bb.replace(/^\/+/, '');
        if (!bb) return aa;
        const left = aa.endsWith('/') ? aa : `${aa}/`;
        const right = bb.replace(/^\/+/, '');
        return `${left}${right}`;
      };

      const getDocsifyBasePath = () => {
        const bp =
          window.$docsify && typeof window.$docsify.basePath === 'string'
            ? window.$docsify.basePath
            : 'docs/';
        return String(bp || 'docs/');
      };

      const buildDocsUrl = (rel) => {
        try {
          const baseHref = window.location.href.split('#')[0];
          return new URL(rel, baseHref).toString();
        } catch {
          return rel;
        }
      };

      const fetchPaperMarkdownById = async (paperId) => {
        const rel = joinUrlPath(getDocsifyBasePath(), `${paperId}.md`);
        const url = buildDocsUrl(rel);
        const res = await fetch(url, { cache: 'no-store' });
        if (!res.ok) throw new Error(`閺冪姵纭剁拠璇插絿閺傚洨鐝?Markdown閿涘湚TTP ${res.status}閿涘ˇ);
        return await res.text();
      };

      const loadChatHistoryForPaper = async (paperId) => {
        if (!paperId) return [];
        // IndexedDB 娴兼ê鍘涢敍姝瀙r_chat_db_v1 / paper_chats
        if (typeof indexedDB !== 'undefined') {
          try {
            const db = await new Promise((resolve) => {
              const req = indexedDB.open('dpr_chat_db_v1', 1);
              req.onupgradeneeded = (e) => {
                const d = e.target.result;
                if (!d.objectStoreNames.contains('paper_chats')) {
                  d.createObjectStore('paper_chats', { keyPath: 'paperId' });
                }
              };
              req.onsuccess = (e) => resolve(e.target.result);
              req.onerror = () => resolve(null);
            });
            if (db) {
              return await new Promise((resolve) => {
                try {
                  const tx = db.transaction('paper_chats', 'readonly');
                  const store = tx.objectStore('paper_chats');
                  const r = store.get(paperId);
                  r.onsuccess = () => {
                    const rec = r.result;
                    resolve(rec && Array.isArray(rec.messages) ? rec.messages : []);
                  };
                  r.onerror = () => resolve([]);
                } catch {
                  resolve([]);
                }
              });
            }
          } catch {
            // ignore
          }
        }
        // 閸忔粌绨抽敍姘＋閻?localStorage
        try {
          if (!window.localStorage) return [];
          const raw = window.localStorage.getItem('dpr_chat_history_v1');
          if (!raw) return [];
          const obj = JSON.parse(raw) || {};
          const list = obj[paperId];
          return Array.isArray(list) ? list : [];
        } catch {
          return [];
        }
      };

      const buildShareMarkdown = (paperId, pageMd, chatMessages) => {
        const builder =
          window.DPRGistShareUtils &&
          typeof window.DPRGistShareUtils.buildShareMarkdown === 'function'
            ? window.DPRGistShareUtils.buildShareMarkdown
            : null;
        if (builder) {
          return builder({
            paperId,
            pageMd,
            chatMessages,
            origin: String(window.location.origin || ''),
            generatedAt: new Date().toISOString(),
          });
        }

        const parsed = parseFrontMatter(String(pageMd || ''));
        const safeMeta = parsed && parsed.meta && typeof parsed.meta === 'object' ? parsed.meta : {};
        const body = parsed && typeof parsed.body === 'string'
          ? parsed.body
          : String(pageMd || '').replace(/^---\n[\s\S]*?\n---\n?/, '').trim();
        const heading = String(safeMeta.title_zh || safeMeta.title || paperId || 'Paper Share').trim();
        const subtitle = safeMeta.title_zh && safeMeta.title ? String(safeMeta.title).trim() : '';
        const tags = Array.isArray(safeMeta.tags) ? safeMeta.tags : [];
        const pageUrl = `${String(window.location.origin || '').replace(/\/+$/, '')}/#/${paperId}`;
        const parts = [];

        parts.push('<!-- Shared by Daily Paper Reader -->');
        parts.push('');
        parts.push(`# ${heading}`);
        if (subtitle) {
          parts.push('');
          parts.push(`_${subtitle}_`);
        }
        parts.push('');
        if (safeMeta.authors) parts.push(`- **Authors**: ${String(safeMeta.authors).trim()}`);
        if (safeMeta.source) parts.push(`- **Source**: ${String(safeMeta.source).trim()}`);
        if (safeMeta.date) parts.push(`- **Date**: ${String(safeMeta.date).trim()}`);
        if (safeMeta.pdf) parts.push(`- **PDF**: ${String(safeMeta.pdf).trim()}`);
        if (tags.length) parts.push(`- **Tags**: ${tags.join(', ')}`);
        if (safeMeta.evidence) parts.push(`- **Evidence**: ${String(safeMeta.evidence).trim()}`);
        if (safeMeta.tldr) parts.push(`- **TLDR**: ${String(safeMeta.tldr).trim()}`);
        parts.push(`- **閸樼喎顫愭い鐢告桨**: ${pageUrl}`);
        parts.push(`- **閻㈢喐鍨氶弮鍫曟？**: ${new Date().toISOString()}`);
        parts.push('');
        parts.push('---');
        parts.push('');
        parts.push(body || String(pageMd || '').trim());
        parts.push('');
        parts.push('---');
        parts.push('');
        parts.push('## 棣冩尠 Chat History閿涘牊婀伴張楦款唶瑜版洩绱?);
        parts.push('');
        if (!chatMessages || !chatMessages.length) {
          parts.push('閺嗗倹妫ょ€电鐦介妴?);
          return parts.join('\n');
        }
        chatMessages.forEach((m) => {
          const role = m && m.role ? String(m.role) : 'unknown';
          const time = m && m.time ? String(m.time) : '';
          const content = m && m.content ? String(m.content) : '';
          if (role === 'thinking') {
            parts.push('<details>');
            parts.push(`<summary>棣冾潵 閹繆鈧啳绻冪粙?${time ? `(${time})` : ''}</summary>`);
            parts.push('');
            parts.push('```');
            parts.push(content);
            parts.push('```');
            parts.push('</details>');
            parts.push('');
            return;
          }
          const label = role === 'ai' ? '棣冾樆 AI' : role === 'user' ? '棣冩噥 娴? : role;
          parts.push(`### ${label}${time ? ` (${time})` : ''}`);
          parts.push(content);
          parts.push('');
        });
        return parts.join('\n');
      };

      const ensureShareModal = () => {
        let overlay = document.getElementById('dpr-gist-share-overlay');
        if (overlay) return overlay;
        overlay = document.createElement('div');
        overlay.id = 'dpr-gist-share-overlay';
        overlay.innerHTML = `
          <div class="dpr-gist-share-modal" role="dialog" aria-modal="true">
            <div class="dpr-gist-share-title">閸掑棔闊╅柧鐐复</div>
            <div class="dpr-gist-share-row">
              <input class="dpr-gist-share-input" type="text" readonly />
              <button class="dpr-gist-share-copy" type="button">婢跺秴鍩?/button>
            </div>
            <div class="dpr-gist-share-hint"></div>
          </div>
        `;
        overlay.addEventListener('pointerdown', (e) => {
          // 閻愬湱鈹栭惂钘夘槱閸忔娊妫?          if (e && e.target === overlay) {
            overlay.classList.remove('show');
          }
        });
        document.addEventListener('keydown', (e) => {
          if (e && e.key === 'Escape') overlay.classList.remove('show');
        });
        document.body.appendChild(overlay);

        const copyBtn = overlay.querySelector('.dpr-gist-share-copy');
        if (copyBtn) {
          copyBtn.addEventListener('click', async () => {
            const input = overlay.querySelector('.dpr-gist-share-input');
            const v = input ? String(input.value || '') : '';
            if (!v) return;
            try {
              if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(v);
              } else {
                input.focus();
                input.select();
                document.execCommand('copy');
              }
              const hint = overlay.querySelector('.dpr-gist-share-hint');
              if (hint) hint.textContent = '瀹告彃顦查崚?;
            } catch {
              const hint = overlay.querySelector('.dpr-gist-share-hint');
              if (hint) hint.textContent = '婢跺秴鍩楁径杈Е閿涘矁顕幍瀣З婢跺秴鍩?;
            }
          });
        }
        return overlay;
      };

      const showShareModal = (url, hintText) => {
        const overlay = ensureShareModal();
        const input = overlay.querySelector('.dpr-gist-share-input');
        const hint = overlay.querySelector('.dpr-gist-share-hint');
        if (input) input.value = url || '';
        if (hint) hint.textContent = hintText || '';
        overlay.classList.add('show');
      };

      const createGist = async (token, filename, content) => {
        const res = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description: '鐠佺儤鏋冮崚鍡曢煩閿涘湒aily Paper Reader閿?,
            public: false,
            files: {
              [filename]: { content },
            },
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          const msg = data && data.message ? String(data.message) : '';
          // GitHub 鐎甸€涚瑝閺€顖涘瘮/閺冪姵娼堥梽鎰畱 token閿涘牆鎸ㄩ崗鑸垫Ц fine-grained PAT 娑撳秵鏁幐?Gist閿涘绮＄敮姝岀箲閸?404 Not Found
          if (res.status === 404) {
            throw new Error(
              'Not Found閿涘牆鐖剁憴浣稿斧閸ョ媴绱版担鐘垫暏閻ㄥ嫭妲?Fine-grained PAT閿涘瓘itHub Gist API 娑撳秵鏁幐渚婄幢鐠囬攱鏁奸悽?Classic PAT 楠炶泛瀣€闁?gist 閺夊啴妾洪敍?,
            );
          }
          if (res.status === 401) {
            throw new Error('閺堫亝宸块弶鍐跨礄Token 閺冪姵鏅ラ幋鏍у嚒鏉╁洦婀￠敍?);
          }
          if (res.status === 403) {
            throw new Error(
              `閺夊啴妾烘稉宥堝喕閿涘牓娓剁憰?Classic PAT 閸曢箖鈧?gist 閺夊啴妾洪敍澶堚偓?{msg ? `鐠囷附鍎忛敍?{msg}` : ''}`.trim(),
            );
          }
          throw new Error(msg || `HTTP ${res.status}`);
        }
        return data;
      };

      const sharePaperToGist = async (paperId) => {
        const token = loadGithubTokenForGist();
        if (!token) {
          showShareModal('', '閺堫亝顥呭ù瀣煂 GitHub Token閿涘矁顕崗鍫濇躬妫ｆ牠銆夐柊宥囩枂 GitHub Token閵?);
          return;
        }
        const pageMd = await fetchPaperMarkdownById(paperId);
        const chat = await loadChatHistoryForPaper(paperId);
        const content = buildShareMarkdown(paperId, pageMd, chat);

        // 閺傚洣娆㈤崥宥忕窗paperId 閺堚偓閸氬簼绔村▓?+ .md
        const slug = String(paperId || 'paper').split('/').slice(-1)[0] || 'paper';
        const filename = `${slug}.md`;
        const data = await createGist(token, filename, content);
        const url = data && data.html_url ? String(data.html_url) : '';
        const preview = data && data.id ? `https://gist.io/${data.id}` : '';
        showShareModal(url, preview ? `缁墽绶ㄦ０鍕潔閿?{preview}` : '');
      };

	      const markSidebarReadState = (currentPaperId) => {
	        const nav = document.querySelector('.sidebar-nav');
	        if (!nav) return;

	        const state = loadReadState();
        if (currentPaperId) {
          if (!state[currentPaperId]) {
            state[currentPaperId] = 'read';
          }
          saveReadState(state);
        }

        const applyLiState = (li, paperIdFromHref) => {
          const status = state[paperIdFromHref];
          li.classList.remove(
            'sidebar-paper-read',
            'sidebar-paper-good',
            'sidebar-paper-bad',
            'sidebar-paper-blue',
            'sidebar-paper-orange',
          );
          if (status === 'good') {
            li.classList.add('sidebar-paper-good');
          } else if (status === 'bad') {
            li.classList.add('sidebar-paper-bad');
          } else if (status === 'blue') {
            li.classList.add('sidebar-paper-blue');
          } else if (status === 'orange') {
            li.classList.add('sidebar-paper-orange');
          } else if (status) {
            li.classList.add('sidebar-paper-read');
          }
        };

	        const links = nav.querySelectorAll('a[href*="#/"]');
	        links.forEach((a) => {
	          const href = a.getAttribute('href') || '';
	          const m = href.match(/#\/(.+)$/);
	          if (!m) return;
	          const paperIdFromHref = m[1].replace(/\/$/, '');
	          const li = a.closest('li');
	          if (!li) return;
	          // 閺嶅洩顔囨潻娆愭Ц娑撯偓娑擃亜鍙挎担鎾诡啈閺傚洦娼惄顕嗙礉閺傞€涚┒閺嶅嘲绱＄紒鍡楀閿涘牓浼╅崗宥嗘殻婢垛晜鐖ｆ０妯圭鐠х兘鐝禍顕嗙礆
	          li.classList.add('sidebar-paper-item');

          // 娑撹桨鏅舵潏瑙勭埉閺夛紕娲版潻钘夊"娑旓妇顒烽弽鍥唶"閹稿鎸抽敍鍫㈣雹/閽?濮?缁绢澁绱?	          let actionWrapper = li.querySelector('.sidebar-paper-rating-icons');
	          let goodIcon = actionWrapper
	            ? actionWrapper.querySelector('.sidebar-paper-rating-icon.good')
	            : null;
            let blueIcon = actionWrapper
              ? actionWrapper.querySelector('.sidebar-paper-rating-icon.blue')
              : null;
            let orangeIcon = actionWrapper
              ? actionWrapper.querySelector('.sidebar-paper-rating-icon.orange')
              : null;
	          let badIcon = actionWrapper
	            ? actionWrapper.querySelector('.sidebar-paper-rating-icon.bad')
	            : null;

          // 瀹革缚鏅堕幐澶愭尦鐎圭懓娅掗敍鍫濆瀻娴?+ 閺€鎯版閿?          let leftActions = li.querySelector('.sidebar-paper-left-actions');
	          if (!actionWrapper) {
	            actionWrapper = document.createElement('span');
	            actionWrapper.className = 'sidebar-paper-rating-icons';

	            goodIcon = document.createElement('button');
	            goodIcon.className = 'sidebar-paper-rating-icon good';
	            goodIcon.title = '閺嶅洩顔囨稉鎭掆偓宀€璞㈤懝韫姛缁涗勘鈧?;
	            goodIcon.setAttribute('aria-label', '缂佽儻澹婃稊锔绢劮');
	            goodIcon.innerHTML = '';

              blueIcon = document.createElement('button');
              blueIcon.className = 'sidebar-paper-rating-icon blue';
              blueIcon.title = '閺嶅洩顔囨稉鎭掆偓宀冩憫閼硅弓鍔熺粵淇扁偓?;
              blueIcon.setAttribute('aria-label', '閽冩繆澹婃稊锔绢劮');
              blueIcon.innerHTML = '';

              orangeIcon = document.createElement('button');
              orangeIcon.className = 'sidebar-paper-rating-icon orange';
              orangeIcon.title = '閺嶅洩顔囨稉鎭掆偓灞绢煻閼硅弓鍔熺粵淇扁偓?;
              orangeIcon.setAttribute('aria-label', '濮楁瑨澹婃稊锔绢劮');
              orangeIcon.innerHTML = '';

	            badIcon = document.createElement('button');
	            badIcon.className = 'sidebar-paper-rating-icon bad';
	            badIcon.title = '閺嶅洩顔囨稉鎭掆偓宀€瀛╅懝韫姛缁涗勘鈧?;
	            badIcon.setAttribute('aria-label', '缁俱垼澹婃稊锔绢劮');
	            badIcon.innerHTML = '';

              // 閸掓稑缂撳锔挎櫠閹稿鎸崇€圭懓娅?              leftActions = document.createElement('span');
              leftActions.className = 'sidebar-paper-left-actions';

              const favoriteIcon = document.createElement('button');
              favoriteIcon.className = 'sidebar-paper-favorite-icon';
              favoriteIcon.title = '閺€鎯版';
              favoriteIcon.setAttribute('aria-label', '閺€鎯版');
              favoriteIcon.textContent = '閳?;
              favoriteIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // 閸掑洦宕查弨鎯版閻樿埖鈧緤绱欓崝鐔诲厴瀵板懎鐤勯悳甯礆
                const isActive = favoriteIcon.classList.toggle('active');
                favoriteIcon.textContent = isActive ? '閳? : '閳?;
              });

              const shareIcon = document.createElement('button');
              shareIcon.className = 'sidebar-paper-share-icon';
              shareIcon.title = '閸掑棔闊╅敍鍫㈡晸閹?GitHub Gist 闁剧偓甯撮敍?;
              shareIcon.setAttribute('aria-label', '閸掑棔闊?);
              shareIcon.textContent = '鐚?;

              const setStateAndRefresh = (value) => {
                const latestState = loadReadState();
                const current = latestState[paperIdFromHref];
                if (current === value) {
                  latestState[paperIdFromHref] = 'read';
                } else {
                  latestState[paperIdFromHref] = value;
                }
                saveReadState(latestState);
                markSidebarReadState(null);
                requestAnimationFrame(() => {
                  syncSidebarActiveIndicator({ animate: false });
                });
              };

	            goodIcon.addEventListener('click', (e) => {
	              e.preventDefault();
	              e.stopPropagation();
	              setStateAndRefresh('good');
	            });

              blueIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                setStateAndRefresh('blue');
              });

              orangeIcon.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                setStateAndRefresh('orange');
              });

              shareIcon.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (shareIcon.disabled) return;
                const old = shareIcon.textContent;
                shareIcon.disabled = true;
                shareIcon.textContent = '...';
                try {
                  await sharePaperToGist(paperIdFromHref);
                } catch (err) {
                  const msg = String(err && err.message ? err.message : err);
                  showShareModal('', `娑撳﹣绱舵径杈Е閿?{msg}`);
                } finally {
                  shareIcon.disabled = false;
                  shareIcon.textContent = old || '鐚?;
                }
              });

	            badIcon.addEventListener('click', (e) => {
	              e.preventDefault();
	              e.stopPropagation();
	              setStateAndRefresh('bad');
	            });

              // 瀹革缚鏅剁€圭懓娅掑ǎ璇插閺€鎯版閸滃苯鍨庢禍顐ｅ瘻闁?              leftActions.appendChild(favoriteIcon);
              leftActions.appendChild(shareIcon);
              a.parentNode.insertBefore(leftActions, a);

              // 閸欏厖鏅剁€圭懓娅掑ǎ璇插娑旓妇顒烽幐澶愭尦
	            actionWrapper.appendChild(goodIcon);
              actionWrapper.appendChild(blueIcon);
              actionWrapper.appendChild(orangeIcon);
	            actionWrapper.appendChild(badIcon);
	            a.parentNode.insertBefore(actionWrapper, a.nextSibling);
	          }

	          // 閺冪姾顔戦幐澶愭尦閺勵垰鎯侀崚姘灡瀵ょ尨绱濋柈鍊燁洣閸╄桨绨垾婊勬付閺?state閳ユ繂鍩涢弬鐗堢负濞茬粯鈧緤绱欓弨顖涘瘮缁岀儤鐗搁柨顔煎瀼閹诡澁绱?	          try {
	            const s = state[paperIdFromHref];
	            if (goodIcon) goodIcon.classList.toggle('active', s === 'good');
              if (blueIcon) blueIcon.classList.toggle('active', s === 'blue');
              if (orangeIcon) orangeIcon.classList.toggle('active', s === 'orange');
	            if (badIcon) badIcon.classList.toggle('active', s === 'bad');
	          } catch {
	            // ignore
	          }

	          applyLiState(li, paperIdFromHref);
	        });
	      };

      const scoreToStarRating = (scoreValue) => {
        const score = Number(scoreValue);
        if (!Number.isFinite(score)) return 0;
        const clamped = Math.max(0, Math.min(10, score));
        return Math.floor(clamped + 0.5) / 2;
      };

      const buildSidebarStarsHtml = (scoreValue) => {
        const rating = scoreToStarRating(scoreValue);
        const scoreNum = Number(scoreValue);
        const scoreText = Number.isFinite(scoreNum) ? scoreNum.toFixed(1) : '';
        const title = scoreText
          ? `鐠囧嫬鍨庨敍?{scoreText}/10閿?{rating.toFixed(1)}/5閿涘ˇ
          : '鐠囧嫬鍨庨敍姘￥';
        const pct = Math.max(0, Math.min(100, (rating / 5) * 100));
        return (
          `<span class="dpr-stars" title="${escapeHtml(title)}" aria-label="${rating.toFixed(1)} out of 5">` +
          '<span class="dpr-stars-bg">閳藉棌妲呴埥鍡忔閳?/span>' +
          `<span class="dpr-stars-fill" style="width:${pct.toFixed(0)}%">閳藉應妲勯埥鍛閳?/span>` +
          '</span>'
        );
      };

      const hydrateStructuredSidebarItems = () => {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;
        const links = nav.querySelectorAll('a.dpr-sidebar-item-link[href*="#/"]');
        links.forEach((a) => {
          if (a.dataset.sidebarStructuredHydrated === '1') return;
          const href = String(a.getAttribute('href') || '').trim();
          const routeMatch = href.match(/#\/(.+)$/);
          const routeId = routeMatch ? decodeURIComponent(routeMatch[1]).replace(/\/$/, '') : '';
          const arxivId = routeId ? routeId.split('/').slice(-1)[0] : '';
          const fallbackLink = arxivId ? `https://arxiv.org/abs/${arxivId}` : '';

          let payload = null;
          const raw = a.getAttribute('data-sidebar-item') || '';
          if (raw) {
            try {
              payload = JSON.parse(raw);
            } catch {
              payload = null;
            }
          }

          // 閸忕厧顔愰崢鍡楀蕉 sidebar閿涙矮绮犻弮?DOM閿涘澅itle/tags/score閿涘娲栨繅顐ょ波閺嬪嫬瀵查弫鐗堝祦
          if (!payload || typeof payload !== 'object') {
            const legacyTitle = String(
              (a.querySelector('.dpr-sidebar-title') && a.querySelector('.dpr-sidebar-title').textContent) ||
                a.textContent ||
                '',
            ).trim();
            const legacyScoreNode = a.querySelector('.dpr-sidebar-tag-score .dpr-stars');
            const legacyScoreTitle = String(
              (legacyScoreNode && legacyScoreNode.getAttribute('title')) || '',
            );
            const scoreMatch = legacyScoreTitle.match(/鐠囧嫬鍨庨敍姝晄*([0-9]+(?:\.[0-9]+)?)\s*\/10/);
            const legacyScore = scoreMatch ? scoreMatch[1] : '-';
            const legacyTags = [];
            const tagNodes = a.querySelectorAll('.dpr-sidebar-tag');
            tagNodes.forEach((node) => {
              if (node.classList.contains('dpr-sidebar-tag-score')) return;
              const label = String(node.textContent || '').trim();
              if (!label) return;
              let kind = 'other';
              if (node.classList.contains('dpr-sidebar-tag-keyword')) kind = 'keyword';
              if (node.classList.contains('dpr-sidebar-tag-query')) kind = 'query';
              if (node.classList.contains('dpr-sidebar-tag-paper')) kind = 'paper';
              legacyTags.push({ kind, label });
            });
            payload = {
              title: legacyTitle || routeId,
              link: fallbackLink || href,
              score: legacyScore,
              tags: legacyTags,
            };
          }

          if (!payload || typeof payload !== 'object') return;

          const title = String(payload.title || a.textContent || '').trim();
          const link = String(payload.link || fallbackLink || href || '').trim();
          const score = String(payload.score || '').trim();
          const evidence = String((payload && payload.evidence) || '').trim();
          const tags = Array.isArray(payload.tags) ? payload.tags : [];

          const scoreHtml =
            score && score !== '-'
              ? `<span class="dpr-sidebar-tag dpr-sidebar-tag-score">${buildSidebarStarsHtml(score)}</span>`
              : '<span class="dpr-sidebar-score-empty">-</span>';

          const tagsHtml = tags
            .map((item) => {
              const rawKind = String((item && item.kind) || 'other').trim().toLowerCase();
              const kind = /^(keyword|query|paper|other)$/.test(rawKind) ? rawKind : 'other';
              const label = String((item && item.label) || '').trim();
              if (!label) return '';
              return `<span class="dpr-sidebar-tag dpr-sidebar-tag-${kind}">${escapeHtml(label)}</span>`;
            })
            .filter(Boolean)
            .join(' ');

          a.innerHTML =
            `<div class="dpr-sidebar-title">${escapeHtml(title)}</div>` +
            `<div class="dpr-sidebar-link-line">${escapeHtml(evidence || '-')}</div>` +
            `<div class="dpr-sidebar-meta-line">` +
            `${scoreHtml}` +
            `<span class="dpr-sidebar-meta-tags">${tagsHtml || '<span class="dpr-sidebar-tag dpr-sidebar-tag-other">-</span>'}</span>` +
            `</div>`;
          a.dataset.sidebarStructuredHydrated = '1';
        });
      };

      const neutralizeSidebarNoactiveLinks = () => {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;
        const links = nav.querySelectorAll('a.dpr-sidebar-noactive-link');
        links.forEach((a) => {
          try {
            a.classList.remove('active', 'router-link-active');
          } catch {
            // ignore
          }
          try {
            const li = a.closest('li');
            if (li) {
              li.classList.remove('active');
            }
          } catch {
            // ignore
          }
        });
      };

      const bindSidebarVirtualHashLinks = () => {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;
        const links = nav.querySelectorAll('a[data-dpr-hash]');
        links.forEach((a) => {
          if (a.dataset.dprHashBound === '1') return;
          a.dataset.dprHashBound = '1';
          a.addEventListener('click', (e) => {
            const target = normalizeHref(a.getAttribute('data-dpr-hash') || '');
            if (!target) return;
            e.preventDefault();
            DPR_NAV_STATE.lastNavSource = 'click';
            window.location.hash = target;
          });
        });
      };

      // 娓氀嗙珶閺?濮濓絾鏋冮惃鍕啈閺傚洭銆夐弽鍥暯閺夆槄绱伴懟杈ㄦ瀮閸欏厖鏅堕敍灞艰厬閺傚洤涔忔笟褝绱濇稉顓㈡？缁旀牜鍤?      const isPaperRouteFile = (file) => {
        const f = String(file || '');
        return /^(?:\d{6}\/\d{2}|\d{8}-\d{8})\/(?!README\.md$).+\.md$/i.test(f);
      };

      const isReportRouteFile = (file) => {
        const f = String(file || '');
        return /^(?:\d{6}\/\d{2}|\d{8}-\d{8})\/README\.md$/i.test(f);
      };

      const fitTextToBox = (el, minPx, maxPx) => {
        if (!el) return;
        let size = maxPx;
        el.style.fontSize = `${size}px`;
        // 闁劖顒炵紓鈺佺毈閻╂潙鍩屾稉宥嗗閸戠儤鍨ㄦ潏鎯у煂閺堚偓鐏忓繐鈧?        // 濞夈劍鍓伴敍姝碿rollHeight > clientHeight 鐞涖劎銇氬┃銏犲毉閿涘牆瀵橀崥顐ヮ潶 line-clamp 閹搭亝鏌囬惃鍕剰閸愮绱?        while (size > minPx && el.scrollHeight > el.clientHeight + 1) {
          size -= 1;
          el.style.fontSize = `${size}px`;
        }
      };

      // 娑撳搫鍨忔い闈涘З閺佸牆鍣径鍥︾娑擃亖鈧粍顒滈弬鍥у瘶鐟佸懎鐪伴垾婵撶礉闁灝鍘ら幎濠呬喊婢垛晜璇炵仦?閻у€熷闁喚鍍垫稉鈧挧宄颁粵濞ｂ€冲弳濞ｂ€冲毉閿涘牆鎯侀崚娆庣窗闂傤亞鍎婇敍?      const DPR_PAGE_CONTENT_CLASS = 'dpr-page-content';

      const ensurePageContentRoot = () => {
        const section = document.querySelector('.markdown-section');
        if (!section) return null;
        const existing = section.querySelector(
          `:scope > .${DPR_PAGE_CONTENT_CLASS}`,
        );
        if (existing) return existing;

        const root = document.createElement('div');
        root.className = DPR_PAGE_CONTENT_CLASS;
        // 鐏忓棗缍嬮崜宥嗚閺屾挸鍤弶銉ф畱濮濓絾鏋冮崘鍛啇閺佺繝缍嬬粔璇插弳 root閿涘牊顒濋弮?chat 濡€虫健鐏忔碍婀幓鎺戝弳閿涘矂浼╅崗宥嗗Ω鏉堟挸鍙嗗鍡曠鐠ч些閸忋儻绱?        while (section.firstChild) {
          root.appendChild(section.firstChild);
        }
        section.appendChild(root);
        return root;
      };

      const getPageAnimEl = () => {
        const section = document.querySelector('.markdown-section');
        if (!section) return null;
        return (
          section.querySelector(`:scope > .${DPR_PAGE_CONTENT_CLASS}`) || section
        );
      };

      const syncPageTypeClasses = ({
        isHomePage = false,
        isReportPage = false,
        isPaperPage = false,
      } = {}) => {
        const body = document.body;
        if (!body || !body.classList) return;
        body.classList.toggle('dpr-home-page', !!isHomePage);
        body.classList.toggle('dpr-report-page', !!isReportPage);
        body.classList.toggle('dpr-landing-page', !!(isHomePage || isReportPage));
        body.classList.toggle('dpr-paper-page', !!isPaperPage);
      };

      const applyPaperTitleBar = () => {
        const file = vm && vm.route ? vm.route.file : '';
        if (!isPaperRouteFile(file)) {
          return;
        }

        const section = document.querySelector('.markdown-section');
        if (!section) return;
        const root =
          section.querySelector(`:scope > .${DPR_PAGE_CONTENT_CLASS}`) || section;

        // 闂冨弶顒涢柌宥咁槻閹绘帒鍙?        const existing = root.querySelector('.dpr-title-bar');
        if (existing) existing.remove();
        const h1s = Array.from(root.querySelectorAll('h1'));
        if (!h1s.length) return;

        // 娴兼ê鍘涙禒搴＄敨閺?paper-title-zh / paper-title-en 缁鎮曢惃?h1 娑擃叀骞忛崣鏍ㄧ垼妫版﹫绱檉rontmatter 濞撳弶鐓嬮敍?        const paperTitleZh = root.querySelector('h1.paper-title-zh');
        const paperTitleEn = root.querySelector('h1.paper-title-en');

        let cnTitle = '';
        let enTitle = '';

        if (paperTitleZh || paperTitleEn) {
          // 閺傜増鐗稿蹇ョ窗娴?frontmatter 濞撳弶鐓嬮惃鍕敨缁鎮?h1 娑擃叀骞忛崣?          cnTitle = paperTitleZh ? (paperTitleZh.textContent || '').trim() : '';
          enTitle = paperTitleEn ? (paperTitleEn.textContent || '').trim() : '';
        } else {
          // 閺冄勭壐瀵繐鍚嬬€圭櫢绱版俊鍌涚亯閺堝琚辨稉?h1閿涘苯鍨粭顑跨娑擃亙璐熼懟杈ㄦ瀮閵嗕胶顑囨禍灞奸嚋娑撹桨鑵戦弬鍥风幢
          // 婵″倹鐏夐崣顏呮箒娑撯偓娑?h1閿涘苯鍨拋銈勮礋閺?閸楁洘鐖ｆ０?閿涘本鏂侀崷銊ヤ箯娓氀嶇礄cn 閸栫尨绱?          enTitle = (h1s[0].textContent || '').trim();
          cnTitle = (h1s[1] ? (h1s[1].textContent || '').trim() : '').trim();
          if (h1s.length === 1) {
            cnTitle = enTitle;
            enTitle = '';
          }
        }

        // 閸忔粌绨抽敍姘冲閸欘亝婀侀懟杈ㄦ瀮閺嶅洭顣介敍鍫㈠繁鐏?title_zh閿涘绱濈亸鍡氬閺傚洦灏撻崚鏉夸箯娓氀勬▔缁€鐚寸礉
        // 闁灝鍘?dpr-title-single 閺嶅嘲绱￠幎濠傚礁娓氀嗗閺傚洤灏崺鐔兼閽樺繐鎮楅崙铏瑰箛閳ユ粍妫ら弽鍥暯閳ユ縿鈧?        if (!cnTitle && enTitle) {
          cnTitle = enTitle;
          enTitle = '';
        }

        // 闂呮劘妫岄崢鐔奉潗 h1閿涘奔绲炬穱婵堟殌閸?DOM 闁插奔绶垫径宥呭煑/SEO/閸忓啩淇婇幁顖涘絹閸欐牕鍘规惔?        h1s.forEach((h) => h.classList.add('dpr-title-hidden'));

        const bar = document.createElement('div');
        bar.className = 'dpr-title-bar';
        bar.innerHTML = `
          <div class="dpr-title-cn">${escapeHtml(cnTitle || '')}</div>
          <div class="dpr-title-sep" aria-hidden="true"></div>
          <div class="dpr-title-en">${escapeHtml(enTitle || '')}</div>
        `;
        if (!cnTitle) {
          bar.classList.add('dpr-title-single');
        }

        root.insertBefore(bar, root.firstChild);

        // 鐎涙ぞ缍嬮懛顏堚偓鍌氱安閿涙俺顔€閺嶅洭顣介弶锟犵彯鎼达妇菙鐎规熬绱濋梹鎸庣垼妫版鍤滈崝銊х級鐏?        requestAnimationFrame(() => {
          const cnEl = bar.querySelector('.dpr-title-cn');
          const enEl = bar.querySelector('.dpr-title-en');
          if (cnEl && cnTitle) fitTextToBox(cnEl, 14, 22);
          if (enEl && enTitle) fitTextToBox(enEl, 13, 20);
        });
      };

      // 鐠佺儤鏋冩い闈涱嚤閼割亷绱板锕€褰稿鎴濆З / 闁款喚娲忛弬鐟版倻闁款喖鍨忛幑銏ｎ啈閺?      const DPR_NAV_STATE = {
        paperHrefs: [],
        reportHrefs: [],
        currentHref: '',
        currentReportHref: '',
        lastNavTs: 0,
        lastNavSource: '', // 'click' | 'key' | 'wheel' | 'swipe' | ''
      };

      const DPR_SIDEBAR_CENTER_STATE = {
        lastHref: '',
        lastTs: 0,
      };

      const DPR_SIDEBAR_ACTIVE_INDICATOR = {
        el: null,
        parent: null,
        justMoved: false,
      };

      const getSidebarScrollEl = () => {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return null;
        const candidates = [
          nav,
          nav.closest('.sidebar'),
          nav.parentElement,
          document.querySelector('.sidebar'),
        ].filter(Boolean);
        for (const el of candidates) {
          try {
            if (el.scrollHeight > el.clientHeight + 4) return el;
          } catch {
            // ignore
          }
        }
        return nav;
      };

      const ensureSidebarActiveIndicator = () => {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return null;

        if (
          DPR_SIDEBAR_ACTIVE_INDICATOR.el &&
          DPR_SIDEBAR_ACTIVE_INDICATOR.parent === nav &&
          nav.contains(DPR_SIDEBAR_ACTIVE_INDICATOR.el)
        ) {
          return { el: DPR_SIDEBAR_ACTIVE_INDICATOR.el, newlyCreated: false };
        }

        // 濞撳懐鎮婇弮褏娈戦敍鍫滅伐婵″倻鍎归弴瀛樻煀/闁插秴顦查崚婵嗩潗閸栨牕婧€閺咁垽绱?        try {
          if (DPR_SIDEBAR_ACTIVE_INDICATOR.el && DPR_SIDEBAR_ACTIVE_INDICATOR.el.remove) {
            DPR_SIDEBAR_ACTIVE_INDICATOR.el.remove();
          }
        } catch {
          // ignore
        }

        const indicator = document.createElement('div');
        indicator.className = 'dpr-sidebar-active-indicator';
        indicator.setAttribute('aria-hidden', 'true');
        // 閸掓艾鍨卞鐑樻閸忓牏顩﹂悽?transition閿涘矂浼╅崗宥呭毉閻滄壋鈧粈绮?sidebar 妞ゅ爼鍎村鎴滅瑓閺夈儮鈧繄娈戞禍灞绢偧閸斻劍鏅?        indicator.style.transition = 'none';
        // 閺€鎯ф躬閺堚偓閸撳秹娼伴敍宀€鈥樻穱婵嗘躬閹碘偓閺?li 娑撳娼?        nav.insertBefore(indicator, nav.firstChild);
        DPR_SIDEBAR_ACTIVE_INDICATOR.el = indicator;
        DPR_SIDEBAR_ACTIVE_INDICATOR.parent = nav;
        return { el: indicator, newlyCreated: true };
      };

      const hideSidebarActiveIndicator = () => {
        const ensured = ensureSidebarActiveIndicator();
        if (!ensured || !ensured.el) return;
        const indicator = ensured.el;
        // 闁灝鍘ら崥搴ｇ敾婢跺秶鏁ら弮鑸电暙閻?good/bad 闁板秷澹?        indicator.classList.remove('is-good', 'is-bad', 'is-blue', 'is-orange');
        indicator.style.opacity = '0';
        indicator.style.width = '0';
        indicator.style.height = '0';
      };

      const showSidebarActiveIndicator = () => {
        const ensured = ensureSidebarActiveIndicator();
        if (!ensured || !ensured.el) return;
        ensured.el.style.opacity = '1';
      };

      const isSidebarItemVisible = (el) => {
        try {
          if (!el) return false;
          // display:none / 鐞氼偅濮岄崣鐘虫 offsetParent 娴兼碍妲?null
          if (el.offsetParent === null) return false;
          const rect = el.getBoundingClientRect();
          return rect && rect.width > 0 && rect.height > 0;
        } catch {
          return false;
        }
      };

      const moveSidebarActiveIndicatorToEl = (li, options = {}) => {
        if (!li) return;
        const { animate = true } = options || {};
        const ensured = ensureSidebarActiveIndicator();
        if (!ensured || !ensured.el) return;
        const indicator = ensured.el;
        const newlyCreated = ensured.newlyCreated;

        // 閸忓牊绔荤粚杞扮瑐娑撯偓閺夛紕娲伴惃鍕帳閼硅尙濮搁幀渚婄礉闁灝鍘ら崙铏瑰箛閳ユ粌褰囧☉鍫濆瑎闁?閸欏鈧鎮楁禒宥嗙暙閻ｆ瑥绨抽懝娴嬧偓?        try {
          indicator.classList.remove('is-good', 'is-bad', 'is-blue', 'is-orange');
        } catch {
          // ignore
        }

        // 閸欘亜顕拋鐑樻瀮閺夛紕娲伴崥顖滄暏閿涘牓浼╅崗宥嗘）閺堢喎鍨庣紒鍕垼妫版鐡戦敍?        if (!li.classList || !li.classList.contains('sidebar-paper-item')) return;
        // 閼汇儴顕氶弶锛勬窗閸︺劉鈧粍濮岄崣鐘垫畱閺冦儲婀￠垾婵呯娑撳绱伴梾鎰妤傛ü瀵掔仦鍌︾礉闁灝鍘ら幎妯哄綌閸氬簼绮涘▓瀣殌闁鑵戦懗灞炬珯
        try {
          if (li.closest && li.closest('li.sidebar-day-collapsed')) {
            hideSidebarActiveIndicator();
            return;
          }
        } catch {
          // ignore
        }
        if (!isSidebarItemVisible(li)) {
          hideSidebarActiveIndicator();
          return;
        }

        showSidebarActiveIndicator();

        // 闁鑵戞妯瑰瘨鐏炲倿鍘ら懝璇х窗閺嶈宓?good/bad 閻樿埖鈧礁鍨忛幑顫礄閻劋绨垾婊冨嚒閹垫挸瀣€/閹垫挸寮堕垾婵堟畱闁鑵戞惔鏇″閿?        try {
          const isGood =
            li.classList && li.classList.contains('sidebar-paper-good');
          const isBad = li.classList && li.classList.contains('sidebar-paper-bad');
          const isBlue =
            li.classList && li.classList.contains('sidebar-paper-blue');
          const isOrange =
            li.classList && li.classList.contains('sidebar-paper-orange');

          // 閸楁洟鈧绱版俊鍌涚亯閸氬本妞傜€涙ê婀敍鍫㈡倞鐠佽桨绗傛稉宥呯安閸欐垹鏁撻敍澶涚礉閹稿绱崗鍫㈤獓閸欐牜顑囨稉鈧稉?          const any = isGood || isBad || isBlue || isOrange;
          indicator.classList.toggle('is-good', !!isGood && any && !isBad && !isBlue && !isOrange);
          indicator.classList.toggle('is-bad', !!isBad && any && !isGood && !isBlue && !isOrange);
          indicator.classList.toggle('is-blue', !!isBlue && any && !isGood && !isBad && !isOrange);
          indicator.classList.toggle('is-orange', !!isOrange && any && !isGood && !isBad && !isBlue);
        } catch {
          // ignore
        }

        // 娑撳秷鍏橀悽?offsetTop/offsetLeft閿?        // 娓氀嗙珶閺嶅繑妲告径姘湴瀹撳苯顨?li/ul閿涘ffset* 閸欏倻鍙庣化璁崇窗閽€钘夋躬娑擃參妫跨仦鍌︾礉鐎佃壈鍤х搾濠傜窔娑撳鈧鑵戦崑蹇曅╃搾濠冩閺勪勘鈧?        // 缂佺喍绔存担璺ㄦ暏閻╃顕?.sidebar-nav 閻ㄥ嫬鍤戞担鏇炴綏閺嶅浄绱濇穱婵婄槈鐏炴洖绱戞径姘亯閸氬簼绮涢崙鍡欌€樼€靛綊缍堥妴?        const nav = ensured.parent || (li.closest && li.closest('.sidebar-nav'));
        const navRect = nav ? nav.getBoundingClientRect() : null;
        const liRect = li.getBoundingClientRect();
        const x = navRect ? liRect.left - navRect.left + (nav.scrollLeft || 0) : li.offsetLeft;
        const y = navRect ? liRect.top - navRect.top + (nav.scrollTop || 0) : li.offsetTop;
        const w = liRect.width || li.offsetWidth;
        const h = liRect.height || li.offsetHeight;

        // 閺傛澘缂?閹存牞顩﹀Ч鍌欑瑝閸斻劎鏁鹃弮璁圭窗閸忓牆鍙?transition閿涘瞼娲块幒銉ョ暰娴ｅ秴鍩岄張鈧紒鍫滅秴缂冾噯绱濋崘宥嗕划婢?transition
        if (newlyCreated || !animate) {
          indicator.style.transition = 'none';
        }

        indicator.style.width = `${w}px`;
        indicator.style.height = `${h}px`;
        indicator.style.transform = `translate3d(${x}px, ${y}px, 0)`;

        if (newlyCreated || !animate) {
          requestAnimationFrame(() => {
            indicator.style.transition = '';
          });
        }
      };

      const moveSidebarActiveIndicatorToHref = (href, options = {}) => {
        const targetHref = normalizeHref(href);
        if (!targetHref) return;
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;
        const link = nav.querySelector(`a[href="${targetHref}"]`);
        if (!link) return;
        const li = link.closest('li');
        moveSidebarActiveIndicatorToEl(li, options);
      };

      const syncSidebarActiveIndicator = (options = {}) => {
        const { animate = false } = options || {};
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;

        // 1) 娴兼ê鍘涢幐澶嗏偓婊冪秼閸撳秷鐭鹃悽?href閳ユ繄绨跨涵顔煎爱闁板稄绱濋柆鍨帳 Docsify 婢舵矮閲?active 閺冭泛鎳℃稉顓㈡晩鐠囶垶銆?        const routeHref = DPR_NAV_STATE.currentHref || '';
        if (routeHref) {
          const links = Array.from(nav.querySelectorAll('a[href]'));
          for (let i = 0; i < links.length; i += 1) {
            const a = links[i];
            const href = normalizeHref(a.getAttribute('href') || '');
            if (href !== routeHref) continue;
            const li = a.closest('li');
            if (li && li.classList && li.classList.contains('sidebar-paper-item')) {
              moveSidebarActiveIndicatorToEl(li, { animate });
              return;
            }
          }
        }

        // 2) 閸忔粌绨抽敍姘洤閺嬫粌鐡ㄩ崷銊ヮ樋娑?active閿涘苯褰囬張鈧崥搴濈娑擃亷绱欓柅姘埗閺勵垱娲垮ǎ鍗炵湴閵嗕礁缍嬮崜宥囨埂濮濓綁鈧鑵戞い鐧哥礆
        const activeLis = Array.from(
          nav.querySelectorAll('li.active.sidebar-paper-item'),
        );
        if (activeLis.length > 0) {
          moveSidebarActiveIndicatorToEl(activeLis[activeLis.length - 1], {
            animate,
          });
          return;
        }

        hideSidebarActiveIndicator();
      };

      // 閺嗘挳婀堕崚鏉垮弿鐏炩偓閿涘奔绶?sidebar resize 閺冩儼鐨熼悽?      window.syncSidebarActiveIndicator = syncSidebarActiveIndicator;

      const DPR_TRANSITION = {
        // 'enter-from-left' | 'enter-from-right' | ''
        pendingEnter: '',
      };

      const decodeLegacyIdHash = (rawHash) => {
        const raw = String(rawHash || '').trim();
        if (!raw) return '';
        // 閸忕厧顔?Docsify 閺冄冪础 hash閿?/?id=%2f202602%2f06%2fxxx 閹?#?id=/202602/06/xxx
        const m = raw.match(/^#\/?\?id=([^&]+)(?:&.*)?$/i);
        if (!m) return '';
        let decoded = '';
        try {
          decoded = decodeURIComponent(m[1] || '');
        } catch {
          decoded = m[1] || '';
        }
        decoded = String(decoded || '').trim();
        if (!decoded) return '';
        // 缂佺喍绔存稉鐑樻￥ .md 閻ㄥ嫯鐭鹃悽鍗炶埌瀵?        decoded = decoded.replace(/\.md$/i, '');
        if (!decoded.startsWith('/')) decoded = '/' + decoded;
        return '#'+ decoded;
      };

      const normalizeHref = (href) => {
        const raw = String(href || '').trim();
        if (!raw) return '';
        const legacy = decodeLegacyIdHash(raw);
        if (legacy) return legacy;
        // 缂佺喍绔撮幋?"#/xxxx" 瑜般垹绱?        if (raw.startsWith('#/')) return raw;
        if (raw.startsWith('#')) return '#/' + raw.slice(1).replace(/^\//, '');
        return '#/' + raw.replace(/^\//, '');
      };

      const isPaperHref = (href) => {
        const h = normalizeHref(href);
        // 閸栧綊鍘ょ拋鐑樻瀮妞ょ绱?        // - 娴肩姷绮虹捄顖氱窞閿?/YYYYMM/DD/slug
        // - 閸栨椽妫跨捄顖氱窞閿?/YYYYMMDD-YYYYMMDD/slug
        return /^#\/(?:\d{6}\/\d{2}|\d{8}-\d{8})\/(?!README$).+/i.test(h);
      };

      const isReportHref = (href) => {
        const h = normalizeHref(href);
        // 閸栧綊鍘ら弮銉﹀Г妞ょ绱?        // - 娴肩姷绮虹捄顖氱窞閿?/YYYYMM/DD/README
        // - 閸栨椽妫跨捄顖氱窞閿?/YYYYMMDD-YYYYMMDD/README
        return /^#\/(?:\d{6}\/\d{2}|\d{8}-\d{8})\/README$/i.test(h);
      };

      const isPaperHrefFallback = (href) => {
        const h = normalizeHref(href);
        return h.startsWith('#/') && h.includes('/') && !/\/README$/i.test(h);
      };

      const collectPaperHrefsFromSidebar = () => {
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return [];
        const links = Array.from(nav.querySelectorAll('a[href]'));
        const out = [];
        const seen = new Set();
        links.forEach((a) => {
          const href = a.getAttribute('href') || '';
          if (!isPaperHref(href)) return;
          const norm = normalizeHref(href);
          if (seen.has(norm)) return;
          seen.add(norm);
          out.push(norm);
        });
        return out;
      };

      const collectReportHrefsFromSidebar = () => {
        const links = [];
        const nav = document.querySelector('.sidebar-nav');
        if (nav) {
          links.push(...Array.from(nav.querySelectorAll('a[href]')));
        }
        const main = document.querySelector('.markdown-section');
        if (main) {
          links.push(...Array.from(main.querySelectorAll('a[href]')));
        }
        const out = [];
        const seen = new Set();
        links.forEach((a) => {
          const href = a.getAttribute('href') || '';
          if (!isReportHref(href)) return;
          const norm = normalizeHref(href);
          if (seen.has(norm)) return;
          seen.add(norm);
          out.push(norm);
        });
        return out;
      };

      const updateNavState = () => {
        DPR_NAV_STATE.paperHrefs = collectPaperHrefsFromSidebar();
        DPR_NAV_STATE.reportHrefs = collectReportHrefsFromSidebar();
        const file = vm && vm.route ? vm.route.file : '';
        if (file && isPaperRouteFile(file)) {
          DPR_NAV_STATE.currentHref = normalizeHref('#/' + String(file).replace(/\.md$/i, ''));
        } else {
          DPR_NAV_STATE.currentHref = '';
        }
        if (file && isReportRouteFile(file)) {
          DPR_NAV_STATE.currentReportHref = normalizeHref('#/' + String(file).replace(/\.md$/i, ''));
        } else {
          DPR_NAV_STATE.currentReportHref = '';
        }
      };

      const centerSidebarOnHref = (href) => {
        const targetHref = normalizeHref(href);
        if (!targetHref) return;
        if (targetHref === DPR_SIDEBAR_CENTER_STATE.lastHref) return;
        const nav = document.querySelector('.sidebar-nav');
        if (!nav) return;

        const link =
          nav.querySelector(`a[href="${targetHref}"]`) ||
          nav.querySelector(`a[href="${targetHref.replace(/^#\//, '#/')}"]`);
        if (!link) return;

        const item = link.closest('li') || link;
        const scrollEl = getSidebarScrollEl();
        if (!scrollEl || scrollEl.scrollHeight <= scrollEl.clientHeight + 4) {
          DPR_SIDEBAR_CENTER_STATE.lastHref = targetHref;
          return;
        }

        const scrollRect = scrollEl.getBoundingClientRect();
        const itemRect = item.getBoundingClientRect();

        const currentTop = scrollEl.scrollTop;
        const deltaTop = itemRect.top - scrollRect.top;
        const targetTop =
          currentTop + deltaTop - (scrollRect.height / 2 - itemRect.height / 2);

        const clamped = Math.max(
          0,
          Math.min(targetTop, scrollEl.scrollHeight - scrollEl.clientHeight),
        );

        DPR_SIDEBAR_CENTER_STATE.lastTs = Date.now();
        DPR_SIDEBAR_CENTER_STATE.lastHref = targetHref;

        // 鐏炲懍鑵戦弮璺哄涧闂団偓鐟曚讲鈧粍绮撮崝銊⑩偓婵嗗З閻紮绱濇稉宥呬粵妫版繂顦绘妯瑰瘨閸斻劎鏁?        const duration = prefersReducedMotion() ? 0 : DPR_TRANSITION_MS;
        animateScrollTop(scrollEl, clamped, duration);
      };

      const centerSidebarOnCurrent = () => {
        // 娴兼ê鍘涚捄鐔兼 Docsify 閻ㄥ嫧鈧竵ctive閳ユ繄濮搁幀渚婄礄鏉╂瑦澧犻弰顖欑稑閻鍩岄惃鍕偓澶夎厬妞ょ櫢绱?        const nav = document.querySelector('.sidebar-nav');
        if (nav) {
          const activeLi = nav.querySelector('li.active');
          const activeLink = nav.querySelector('a.active');
          const el = activeLi || activeLink;
          if (el) {
            const href = (activeLink && activeLink.getAttribute('href')) || '';
            // 婵″倹鐏夐幏鍨繁閸?href閿涘苯姘ㄧ挧?href 閸樺鍣搁敍娑樻儊閸掓瑧鏁ゆ稉鈧稉顏喦旂€规氨娈戦崡鐘辩秴 key
            const key = href ? normalizeHref(href) : '__active__';
            if (key && key === DPR_SIDEBAR_CENTER_STATE.lastHref) return;

            const scrollEl = getSidebarScrollEl();
            if (!scrollEl) return;

            const scrollRect = scrollEl.getBoundingClientRect();
            const itemRect = el.getBoundingClientRect();

            const currentTop = scrollEl.scrollTop;
            const deltaTop = itemRect.top - scrollRect.top;
            const targetTop =
              currentTop +
              deltaTop -
              (scrollRect.height / 2 - itemRect.height / 2);

            const clamped = Math.max(
              0,
              Math.min(targetTop, scrollEl.scrollHeight - scrollEl.clientHeight),
            );

            DPR_SIDEBAR_CENTER_STATE.lastTs = Date.now();
            DPR_SIDEBAR_CENTER_STATE.lastHref = key;

            const duration = prefersReducedMotion() ? 0 : DPR_TRANSITION_MS;
            animateScrollTop(scrollEl, clamped, duration);
            return;
          }
        }

        // 閸忔粌绨抽敍姘瘻瑜版挸澧犵捄顖滄暠 href 閸栧綊鍘?        const href = DPR_NAV_STATE.currentHref || '';
        if (!href) return;
        centerSidebarOnHref(href);
      };

      const shouldIgnoreKeyNav = (event) => {
        if (!event) return true;
        if (event.defaultPrevented) return true;
        if (event.metaKey || event.ctrlKey || event.altKey) return true;
        const target = event.target;
        if (!target) return false;
        const tag = (target.tagName || '').toUpperCase();
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
        if (target.isContentEditable) return true;
        return false;
      };

      const navigateByDelta = (delta) => {
        const paperList = DPR_NAV_STATE.paperHrefs || [];
        const reportList = DPR_NAV_STATE.reportHrefs || [];
        const now = Date.now();
        if (now - (DPR_NAV_STATE.lastNavTs || 0) < 450) return;
        DPR_NAV_STATE.lastNavTs = now;

        const current = DPR_NAV_STATE.currentHref;
        const currentReport = DPR_NAV_STATE.currentReportHref;
        const isHome = !current && !currentReport;
        const reportMode = isHome || !!currentReport;
        const list = reportMode ? reportList : paperList;
        if (!list.length) return;

        // 妫ｆ牠銆夐敍姘礁闁?瀹革附绮﹂敍鍧塭lta=+1閿涘鐑﹂崚鐗堟付閺傞绔存径鈺冾儑娑撯偓缁?        if (isHome) {
          if (delta > 0) {
            triggerPageNav(list[0], 'forward');
          }
          return;
        }

        const anchor = reportMode ? currentReport : current;
        const idx = list.indexOf(anchor);
        if (idx === -1) return;
        const nextIdx = idx + delta;
        if (nextIdx < 0 || nextIdx >= list.length) return;
        triggerPageNav(list[nextIdx], delta > 0 ? 'forward' : 'backward');
      };

      const prefersReducedMotion = () => {
        try {
          return (
            window.matchMedia &&
            window.matchMedia('(prefers-reduced-motion: reduce)').matches
          );
        } catch {
          return false;
        }
      };

      // 缂佺喍绔撮垾娓焛debar 鐏炲懍鑵戝姘З閳ユ繂鎷伴垾婊堛€夐棃銏犲瀼閹光懇鈧繄娈戦崝銊ф暰閺冨爼鏆遍敍宀€鈥樻穱婵婎潎閹扮喍绔撮懛?      const DPR_TRANSITION_MS = 320;
      try {
        document.documentElement.style.setProperty(
          '--dpr-transition-ms',
          `${DPR_TRANSITION_MS}ms`,
        );
      } catch {
        // ignore
      }

      const DPR_SIDEBAR_SCROLL_ANIM = {
        rafId: 0,
      };

      const easeInOutCubic = (t) => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      };

      const animateScrollTop = (el, targetTop, durationMs) => {
        if (!el) return;

        try {
          if (DPR_SIDEBAR_SCROLL_ANIM.rafId) {
            cancelAnimationFrame(DPR_SIDEBAR_SCROLL_ANIM.rafId);
            DPR_SIDEBAR_SCROLL_ANIM.rafId = 0;
          }
        } catch {
          // ignore
        }

        const to = Math.max(
          0,
          Math.min(targetTop, el.scrollHeight - el.clientHeight),
        );
        const from = el.scrollTop;
        const delta = to - from;
        if (Math.abs(delta) < 1 || !durationMs) {
          el.scrollTop = to;
          return;
        }

        const start =
          (window.performance && performance.now && performance.now()) ||
          Date.now();
        const step = (now) => {
          const t = Math.min(1, (now - start) / durationMs);
          const p = easeInOutCubic(t);
          el.scrollTop = from + delta * p;
          if (t < 1) {
            DPR_SIDEBAR_SCROLL_ANIM.rafId = requestAnimationFrame(step);
          } else {
            DPR_SIDEBAR_SCROLL_ANIM.rafId = 0;
          }
        };
        DPR_SIDEBAR_SCROLL_ANIM.rafId = requestAnimationFrame(step);
      };

      const triggerPageNav = (href, direction) => {
        const target = normalizeHref(href);
        if (!target) return;

        // 閸忓牊濡?sidebar 閻ㄥ嫧鈧粓鈧鑵戞妯瑰瘨鐏炲倵鈧繃绮﹂崝銊ュ煂閻╊喗鐖ｉ弶锛勬窗閿涘苯鎷版い鐢告桨閸掑洦宕查崥灞绢劄
        moveSidebarActiveIndicatorToHref(target, { animate: true });
        DPR_SIDEBAR_ACTIVE_INDICATOR.justMoved = true;

        // 闁俺绻冨锕€褰搁柨?濠婃垵濮╅崚鍥ㄥ床閺冭绱伴幓鎰閹?sidebar 濠婃艾鍩岄惄顔界垼妞ゅ綊妾潻鎴礉閹绘劕宕岄垾婊嗙閹靛鈧繆顫囬幇?        if (DPR_NAV_STATE.lastNavSource !== 'click') {
          centerSidebarOnHref(target);
        }

        // 閸愬啿鐣鹃崗銉ユ簚閺傜懓鎮滈敍姝爋rward => 閺備即銆夋禒搴″礁鏉╂冻绱眀ackward => 閺備即銆夋禒搴′箯鏉?        DPR_TRANSITION.pendingEnter =
          direction === 'backward' ? 'enter-from-left' : 'enter-from-right';

        if (prefersReducedMotion()) {
          window.location.hash = target;
          return;
        }

        const animEl = getPageAnimEl();
        if (!animEl) {
          window.location.hash = target;
          return;
        }

        const exitClass =
          direction === 'backward' ? 'dpr-page-exit-right' : 'dpr-page-exit-left';

        animEl.classList.add('dpr-page-exit', exitClass);
        // 缁涘鈧偓閸﹀搫濮╅悽鑽ょ波閺夌喎鎮楅崘宥呭瀼閹广垼鐭鹃悽?        setTimeout(() => {
          window.location.hash = target;
        }, DPR_TRANSITION_MS);
      };

      const PREFETCH_STATE = {
        cache: new Map(),
      };

      const hrefToMdUrl = (href) => {
        const h = normalizeHref(href);
        const m = h.match(/^#\/(.+)$/);
        if (!m) return '';
        const file = m[1].replace(/\/$/, '') + '.md';
        return 'docs/' + file;
      };

      const prefetchHref = async (href) => {
        const url = hrefToMdUrl(href);
        if (!url) return;
        const key = url;
        const now = Date.now();
        const prev = PREFETCH_STATE.cache.get(key);
        if (prev && now - prev.ts < 5 * 60 * 1000) return; // 5 閸掑棝鎸撻崘鍛瑝闁插秴顦查幏澶婂絿
        try {
          const res = await fetch(url, { cache: 'force-cache' });
          if (!res.ok) return;
          // 鐠囪绔存稉?body閿涘瞼鈥樻穱婵嗗晸閸忋儲绁荤憴鍫濇珤缂傛挸鐡ㄩ敍鍫濇倱閺冭泛浠涢崘鍛摠缂傛挸鐡ㄩ崗婊冪俺閿?          const text = await res.text();
          PREFETCH_STATE.cache.set(key, { ts: now, len: text.length });
        } catch {
          // ignore
        }
      };

      const prefetchAdjacent = () => {
        const list = DPR_NAV_STATE.paperHrefs || [];
        if (!list.length) return;
        const current = DPR_NAV_STATE.currentHref;
        if (!current) {
          // 妫ｆ牠銆夐敍姘额暕閸欐牗娓堕弬棰佺婢垛晝顑囨稉鈧弧?          prefetchHref(list[0]);
          return;
        }
        const idx = list.indexOf(current);
        if (idx === -1) return;
        const prev = idx > 0 ? list[idx - 1] : '';
        const next = idx + 1 < list.length ? list[idx + 1] : '';
        if (prev) prefetchHref(prev);
        if (next) prefetchHref(next);
      };

      const ensureNavHandlers = () => {
        if (window.__dprNavBound) return;
        window.__dprNavBound = true;

        // 缁備胶鏁?Docsify 閸樼喓鏁撻惃鍕垼妫版﹢鏁嬮悙鍦仯閸戣濮涢懗?        document.addEventListener('click', (e) => {
          try {
            if (!e || e.defaultPrevented) return;
            const target = e.target;
            // 濡偓濞村妲搁崥锔惧仯閸戣绨￠弽鍥暯閹存牗鐖ｆ０妯哄敶閻ㄥ嫰鏁嬮悙?            if (target && target.closest) {
              const heading = target.closest('h1, h2, h3, h4, h5, h6');
              if (heading && heading.closest('.markdown-section')) {
                const link = target.closest('a');
                if (link && link.hash && link.hash.startsWith('#') && !link.hash.startsWith('#/')) {
                  // 闂冪粯顒涢弽鍥暯闁挎氨鍋ｉ惃鍕帛鐠併倛鐑︽潪顒冾攽娑?                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }
            }
          } catch {
            // ignore
          }
        }, true); // 娴ｈ法鏁ら幑鏇″箯闂冭埖顔岄敍宀€鈥樻穱婵嗘躬 Docsify 娑斿澧犻幏锔藉焻

        const toggleGoodForCurrent = () => {
          const current = DPR_NAV_STATE.currentHref || '';
          if (!current) return;
          const m = current.match(/^#\/(.+)$/);
          if (!m) return;
          const paperId = m[1];

          const state = loadReadState();
          const cur = state[paperId];
          // 缁岀儤鐗搁敍姘躬 good 娑?read 娑斿妫块崚鍥ㄥ床
          if (cur === 'good') {
            state[paperId] = 'read';
          } else {
            state[paperId] = 'good';
          }
	          saveReadState(state);
	          markSidebarReadState(null);
	          // 閸氬本顒為柅澶夎厬妤傛ü瀵掔仦鍌烆杹閼硅绱檊ood <-> read 閸掑洦宕查弮鍫曚缉閸忓秵鐣悾娆戣雹閼规彃绨抽敍?	          requestAnimationFrame(() => {
	            syncSidebarActiveIndicator({ animate: false });
	          });
	        };

        // 闁氨鏁ゆ稊锔绢劮閸掑洦宕查崙鑺ユ殶閿涙碍鏆熺€涙鏁?1234 鐎电懓绨?缂佽儻鎽戠槐顐ゅ
        const toggleBookmarkForCurrent = (bookmarkType) => {
          const current = DPR_NAV_STATE.currentHref || '';
          if (!current) return;
          const m = current.match(/^#\/(.+)$/);
          if (!m) return;
          const paperId = m[1];

          const state = loadReadState();
          const cur = state[paperId];
          // 閸掑洦宕查敍姘洤閺嬫粌缍嬮崜宥呭嚒閺勵垵顕氶悩鑸碘偓浣稿灟閸欐牗绉烽敍鍫濆綁娑?read閿涘绱濋崥锕€鍨拋鍓х枂娑撻缚顕氶悩鑸碘偓?          if (cur === bookmarkType) {
            state[paperId] = 'read';
          } else {
            state[paperId] = bookmarkType;
          }
          saveReadState(state);
          markSidebarReadState(null);
          requestAnimationFrame(() => {
            syncSidebarActiveIndicator({ animate: false });
          });
          // 缁夊娅庨幍鈧張澶嬪瘻闁筋喚鍔嶉悙鐧哥礉闁灝鍘ら弫鏉跨摟闁款喛袝閸欐垶瀵滈柦?          if (document.activeElement && document.activeElement.blur) {
            document.activeElement.blur();
          }
        };

        // 闁款喚娲忛敍姘箯閸欒櫕鏌熼崥鎴︽暛 + 閺佹澘鐡ч柨?1234
        window.addEventListener('keydown', (e) => {
          const key = e.key || '';
          if (shouldIgnoreKeyNav(e)) return;

          // 閺佹澘鐡ч柨?1234閿涙氨璞㈤拑婵堜紶缁绢澀鍔熺粵?          if (key === '1') {
            e.preventDefault();
            toggleBookmarkForCurrent('good');   // 缂佽儻澹?            return;
          }
          if (key === '2') {
            e.preventDefault();
            toggleBookmarkForCurrent('blue');   // 閽冩繆澹?            return;
          }
          if (key === '3') {
            e.preventDefault();
            toggleBookmarkForCurrent('orange'); // 缁鳖偉澹婇敍鍫燁煻閼硅绱?            return;
          }
          if (key === '4') {
            e.preventDefault();
            toggleBookmarkForCurrent('bad');    // 缁俱垼澹?            return;
          }

          if (key === ' ') {
            // 缁岀儤鐗搁柨顕嗙窗閸掑洦宕?娑撳秹鏁婇敍鍫㈣雹閼规彃瀣€閿?
            e.preventDefault();
            toggleGoodForCurrent();
            return;
          }
          if (key !== 'ArrowLeft' && key !== 'ArrowRight') return;
          // 閸欘亜婀ぐ鎾冲妞ょ敻娼伴懕姘卞妽閺冭泛浼愭担婊愮窗濞村繗顫嶉崳銊ュ嚒閼辨氨鍔嶇粣妤€褰涢崡鍐插讲
          e.preventDefault();
          DPR_NAV_STATE.lastNavSource = 'key';
          navigateByDelta(key === 'ArrowRight' ? +1 : -1);
        });

        // 閻愮懓鍤拋鐑樻瀮闁剧偓甯存稊鐔昏泲閸氬奔绔存總妞烩偓婊勬殻妞ら潧鍨忛幑鈶┾偓婵嗗З閺佸牞绱欓柆鍨帳閸欘亝婀佸鎴濆З/閺傜懓鎮滈柨顔芥箒閸斻劎鏁鹃敍?        document.addEventListener('click', (e) => {
          try {
            if (!e || e.defaultPrevented) return;
            // 娴犲懏瀚ら幋顏呮珮闁艾涔忛柨顔惧仯閸戜紮绱濋柆鍨帳瑜板崬鎼烽弬鐗堢垼缁涢箖銆?婢跺秴鍩楅柧鐐复缁涘顢戞稉?            if (typeof e.button === 'number' && e.button !== 0) return;
            if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;

            const link = e.target && e.target.closest ? e.target.closest('a[href]') : null;
            if (!link) return;
            if (link.hasAttribute('download')) return;
            if (link.classList && link.classList.contains('dpr-sidebar-export-link')) return;
            const rawHref = String(link.getAttribute('href') || '').trim();
            if (rawHref.startsWith('blob:')) return;
            // 鐠哄疇绻冩径鏍劥闁剧偓甯撮敍鍫濐洤 PDF 閸︽澘娼冮敍澶涚礉鐠佲晜绁荤憴鍫濇珤閻╁瓨甯撮幍鎾崇磻
            if (/^https?:\/\//i.test(rawHref)) return;
            const href = link.getAttribute('href') || '';
            const target = normalizeHref(href);
            if (!target || !isPaperHref(target) && !isPaperHrefFallback(target)) {
              return;
            }
            if (!target) return;
            if (target === (DPR_NAV_STATE.currentHref || '')) return;

            // 姒х姵鐖ｉ悙鐟板毊 sidebar閿涙矮绗夌憴锕€褰傞垾婊冪湷娑擃厸鈧繈鈧槒绶?            DPR_NAV_STATE.lastNavSource = 'click';

            // 閹恒劍鏌囬弬鐟版倻閿涙碍瀵滄笟褑绔熼弽蹇涖€庢惔蹇撳灲閺傤厸鈧粌澧犳潻?閸氬酣鈧偓閳?            let direction = 'forward';
            const list = DPR_NAV_STATE.paperHrefs || [];
            const cur = DPR_NAV_STATE.currentHref || '';
            if (list.length && cur) {
              const curIdx = list.indexOf(cur);
              const tgtIdx = list.indexOf(target);
              if (curIdx !== -1 && tgtIdx !== -1) {
                direction = tgtIdx < curIdx ? 'backward' : 'forward';
              }
            }

            // 閸欘亜婀拋鐑樻瀮妞ら潧鎯庨悽銊ュЗ閺佸牊瀚ら幋顏庣礉闁灝鍘ゆ＃鏍€夐悙鐟板毊閸戣櫣骞囬垾婊勬￥閸斻劎鏁炬担鍡樻箒瀵ゆ儼绻滈垾婵堟畱娴ｆ捇鐛?            if (document.body && document.body.classList.contains('dpr-paper-page') && !prefersReducedMotion()) {
              e.preventDefault();
              triggerPageNav(target, direction);
            }
          } catch {
            // ignore
          }
        });

        // 姒х姵鐖?鐟欙附甯堕弶鎸幟崥鎴炵泊閸旑煉绱伴崚鍥ㄥ床鐠佺儤鏋冮敍灞借嫙闂冪粯顒涘ù蹇氼潔閸ｃ劎娈戦垾婊勬殻妞ゅ灚绮﹂崝?閸ョ偤鈧偓閸斻劍鏅ラ垾?        document.addEventListener(
          'wheel',
          (e) => {
            if (shouldIgnoreKeyNav(e)) return;
            const dx = e.deltaX || 0;
            const dy = e.deltaY || 0;
            if (Math.abs(dx) < 28) return;
            if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
            e.preventDefault();
            // dx < 0閿涙艾鎮滃锔界拨 => 娑撳绔寸弧?            // dx > 0閿涙艾鎮滈崣铏拨 => 娑撳﹣绔寸弧?            DPR_NAV_STATE.lastNavSource = 'wheel';
            navigateByDelta(dx < 0 ? +1 : -1);
          },
          { passive: false },
        );

        // 鐟欙附鎳滃鎴濆З閿涙艾涔忛崣鍐插瀼閹?        let startX = 0;
        let startY = 0;
        let startAt = 0;
        let lockHorizontal = false;
        const threshold = 60;

        const onTouchStart = (e) => {
          const t = e.touches && e.touches[0];
          if (!t) return;
          startX = t.clientX;
          startY = t.clientY;
          startAt = Date.now();
          lockHorizontal = false;
        };

        const onTouchMove = (e) => {
          const t = e.touches && e.touches[0];
          if (!t) return;
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          if (Math.abs(dx) < 18) return;
          if (Math.abs(dx) > Math.abs(dy) * 1.2) {
            lockHorizontal = true;
          }
          if (lockHorizontal) {
            // 闂冪粯顒涘ù蹇氼潔閸ｃ劎娈戝Ο顏勬倻濠婃垵濮?閸ョ偤鈧偓閸斻劍鏅ラ敍宀冾唨閸掑洦宕查弴绮光偓婊€绗ｅ鎴斺偓?            if (e.cancelable) {
              e.preventDefault();
            }
          }
        };

        const onTouchEnd = (e) => {
          const t = e.changedTouches && e.changedTouches[0];
          if (!t) return;
          const dx = t.clientX - startX;
          const dy = t.clientY - startY;
          const dt = Date.now() - startAt;
          // 閹烘帡娅庨梹鎸庡瘻閵嗕浇浜ゅ顔界拨閸斻劊鈧焦妲戦弰鍙ョ瑐娑撳绮撮崝?          if (dt > 900) return;
          if (Math.abs(dx) < threshold) return;
          if (Math.abs(dx) < Math.abs(dy) * 1.2) return;
          // dx < 0閿涙艾鎮滃锔界拨 => 娑撳绔寸弧鍥风礄閻╃缍嬫禍?ArrowRight閿?          // dx > 0閿涙艾鎮滈崣铏拨 => 娑撳﹣绔寸弧鍥风礄閻╃缍嬫禍?ArrowLeft閿?          DPR_NAV_STATE.lastNavSource = 'swipe';
          navigateByDelta(dx < 0 ? +1 : -1);
        };

        document.addEventListener('touchstart', onTouchStart, { passive: true });
        document.addEventListener('touchmove', onTouchMove, { passive: false });
        document.addEventListener('touchend', onTouchEnd, { passive: true });
      };

      // --- 鐟欙絾鐎?YAML front matter 楠炴儼娴嗛幑顫礋 HTML ---
      const parseFrontMatter = (content) => {
        if (!content || !content.startsWith('---')) {
          return { meta: null, body: content };
        }
        const endIdx = content.indexOf('\n---', 3);
        if (endIdx === -1) {
          return { meta: null, body: content };
        }
        const yamlStr = content.slice(4, endIdx).trim();
        const body = content.slice(endIdx + 4).trim();

        // 缁犫偓閸楁洝袙閺?YAML閿涘牅绗夋笟婵婄婢舵牠鍎存惔鎿勭礆
        const meta = {};
        const lines = yamlStr.split('\n');
        for (const line of lines) {
          const colonIdx = line.indexOf(':');
          if (colonIdx === -1) continue;
          const key = line.slice(0, colonIdx).trim();
          let value = line.slice(colonIdx + 1).trim();

          // 婢跺嫮鎮婇弫鎵矋閺嶇厧绱?[a, b, c]
          if (value.startsWith('[') && value.endsWith(']')) {
            const inner = value.slice(1, -1);
            // 缁犫偓閸楁洖鍨庨崜璇х礉婢跺嫮鎮婂鏇炲娇閸愬懐娈戦柅妤€褰?            const items = [];
            let current = '';
            let inQuote = false;
            let quoteChar = '';
            for (let i = 0; i < inner.length; i++) {
              const c = inner[i];
              if (!inQuote && (c === '"' || c === "'")) {
                inQuote = true;
                quoteChar = c;
              } else if (inQuote && c === quoteChar) {
                inQuote = false;
              } else if (!inQuote && c === ',') {
                items.push(current.trim());
                current = '';
                continue;
              }
              current += c;
            }
            if (current.trim()) items.push(current.trim());
            // 閸樺娅庡鏇炲娇
            meta[key] = items.map(s => s.replace(/^["']|["']$/g, ''));
          } else {
            // 閸樺娅庡鏇炲娇
            meta[key] = value.replace(/^["']|["']$/g, '').replace(/\\n/g, '\n').replace(/\\"/g, '"');
          }
        }
        return { meta, body };
      };

      const escapePaperHtml = (s) => {
        if (!s) return '';
        return String(s)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      };

      const parseFiguresMeta = (meta) => {
        const raw = meta && typeof meta.figures_json === 'string' ? meta.figures_json.trim() : '';
        if (!raw) return [];
        try {
          const parsed = JSON.parse(raw);
          if (!Array.isArray(parsed)) return [];
          return parsed
            .filter((item) => item && typeof item === 'object')
            .map((item, index) => ({
              url: String(item.url || '').trim(),
              caption: String(item.caption || '').trim(),
              page: Number(item.page || 0),
              index: Number(item.index || index + 1),
              width: Number(item.width || 0),
              height: Number(item.height || 0),
            }))
            .filter((item) => item.url);
        } catch (_err) {
          return [];
        }
      };

      const resolveDocsAssetUrl = (value) => {
        const url = String(value || '').trim();
        if (!url) return '';
        if (/^(https?:)?\/\//i.test(url) || url.startsWith('data:')) return url;
        const basePath = (window.$docsify && window.$docsify.basePath) || 'docs/';
        const safeBase = /\/$/.test(basePath) ? basePath : `${basePath}/`;
        if (url.startsWith('docs/')) return url;
        return `${safeBase}${url.replace(/^\/+/, '')}`;
      };

      const renderFigureCarousel = (figures) => {
        if (!figures || !figures.length) return '';
        const slides = figures.map((figure, index) => {
          const pageText = figure.page ? `PDF 缁?${figure.page} 妞ょぐ : '';
          const caption = figure.caption ? `<div class="paper-figure-caption">${escapePaperHtml(figure.caption)}</div>` : '';
          return [
            `<div class="paper-figure-slide${index === 0 ? ' is-active' : ''}" data-figure-slide="${index}">`,
            `<img class="paper-figure-image" src="${escapePaperHtml(resolveDocsAssetUrl(figure.url))}" alt="Paper Figure ${index + 1}" loading="lazy">`,
            '<div class="paper-figure-meta">',
            `<div class="paper-figure-badge">Figure ${index + 1}${pageText ? ` 璺?${escapePaperHtml(pageText)}` : ''}</div>`,
            caption,
            '</div>',
            '</div>',
          ].join('');
        }).join('');

        const thumbs = figures.map((figure, index) => {
          const thumbPageText = figure.page ? ` 璺?PDF 缁?${figure.page} 妞ょぐ : '';
          return [
            `<button class="paper-figure-thumb${index === 0 ? ' is-active' : ''}" type="button" data-figure-thumb="${index}" aria-label="閸掑洦宕查崚鎵儑 ${index + 1} 瀵姵褰冮崶?>`,
            `<img class="paper-figure-thumb-image" src="${escapePaperHtml(resolveDocsAssetUrl(figure.url))}" alt="Thumbnail ${index + 1}" loading="lazy">`,
            `<span class="paper-figure-thumb-label">Figure ${index + 1}${thumbPageText ? escapePaperHtml(thumbPageText) : ''}</span>`,
            '</button>',
          ].join('');
        }).join('');

        return [
          '<div class="paper-figure-section" data-paper-figure-carousel>',
          '<div class="paper-figure-toolbar">',
          `<div class="paper-figure-counter"><span data-figure-current>1</span> / ${figures.length}</div>`,
          '</div>',
          '<div class="paper-figure-stage">',
          figures.length > 1 ? '<button class="paper-figure-nav paper-figure-nav-prev" type="button" data-figure-prev aria-label="娑撳﹣绔村?>閳?/button>' : '',
          `<div class="paper-figure-viewport">${slides}</div>`,
          figures.length > 1 ? '<button class="paper-figure-nav paper-figure-nav-next" type="button" data-figure-next aria-label="娑撳绔村?>閳?/button>' : '',
          '</div>',
          figures.length > 1 ? `<div class="paper-figure-thumbs">${thumbs}</div>` : '',
          '</div>',
          '',
        ].join('');
      };

      const bindPaperFigureCarousels = () => {
        document.querySelectorAll('[data-paper-figure-carousel]').forEach((root) => {
          if (root.dataset.bound === '1') return;
          root.dataset.bound = '1';

          const slides = Array.from(root.querySelectorAll('[data-figure-slide]'));
          const thumbs = Array.from(root.querySelectorAll('[data-figure-thumb]'));
          const prevBtn = root.querySelector('[data-figure-prev]');
          const nextBtn = root.querySelector('[data-figure-next]');
          const counter = root.querySelector('[data-figure-current]');
          if (!slides.length) return;

          let current = 0;
          const render = () => {
            slides.forEach((slide, index) => {
              slide.classList.toggle('is-active', index === current);
            });
            thumbs.forEach((thumb, index) => {
              thumb.classList.toggle('is-active', index === current);
            });
            if (counter) {
              counter.textContent = String(current + 1);
            }
            if (prevBtn) prevBtn.disabled = slides.length <= 1;
            if (nextBtn) nextBtn.disabled = slides.length <= 1;
          };

          if (prevBtn) {
            prevBtn.addEventListener('click', () => {
              current = (current - 1 + slides.length) % slides.length;
              render();
            });
          }
          if (nextBtn) {
            nextBtn.addEventListener('click', () => {
              current = (current + 1) % slides.length;
              render();
            });
          }
          thumbs.forEach((thumb, index) => {
            thumb.addEventListener('click', () => {
              current = index;
              render();
            });
          });

          render();
        });
      };

      // 閺嶈宓?front matter 閻㈢喐鍨氱拋鐑樻瀮妞ょ敻娼?HTML
      const renderPaperFromMeta = (meta) => {
        if (!meta) return '';

        // 鐟欙絾鐎介弽鍥╊劮閿涘瞼鏁撻幋鎰敨妫版粏澹婇惃?HTML
        const renderTags = (tags) => {
          if (!tags || !tags.length) return '';
          return tags.map(tag => {
            const [kind, label] = tag.includes(':') ? tag.split(':', 2) : ['other', tag];
            const css = { keyword: 'tag-green', query: 'tag-blue', paper: 'tag-pink' }[kind] || 'tag-pink';
            return `<span class="tag-label ${css}">${escapeHtml(label)}</span>`;
          }).join(' ');
        };

        const lines = [];

        // 閺嶅洭顣介崠鍝勭厵
        lines.push('<div class="paper-title-row">');
        if (meta.title_zh) {
          lines.push(`<h1 class="paper-title-zh">${escapeHtml(meta.title_zh)}</h1>`);
        }
        if (meta.title) {
          lines.push(`<h1 class="paper-title-en">${escapeHtml(meta.title)}</h1>`);
        }
        lines.push('</div>');
        lines.push('');

        // 娑擃參妫块崠鍝勭厵
        lines.push('<div class="paper-meta-row">');

        // 瀹革缚鏅堕敍娆祐idence 閸?TLDR
        lines.push('<div class="paper-meta-left">');
        if (meta.evidence) {
          lines.push(`<p><strong>Evidence</strong>: ${escapeHtml(meta.evidence)}</p>`);
        }
        if (meta.tldr) {
          lines.push(`<p><strong>TLDR</strong>: ${escapeHtml(meta.tldr)}</p>`);
        }
        lines.push('</div>');

        // 閸欏厖鏅堕敍姘唨閺堫兛淇婇幁?        lines.push('<div class="paper-meta-right">');
        lines.push(`<p><strong>Authors</strong>: ${escapeHtml(meta.authors || 'Unknown')}</p>`);
        if (meta.source) {
          lines.push(`<p><strong>Source</strong>: ${escapeHtml(meta.source)}</p>`);
        }
        lines.push(`<p><strong>Date</strong>: ${escapeHtml(meta.date || 'Unknown')}</p>`);
        if (meta.pdf) {
          lines.push(
            `<p class="paper-meta-link-row"><span class="paper-meta-link-label"><strong>PDF</strong>:</span> <a class="paper-meta-link" href="${escapeHtml(meta.pdf)}" target="_blank">${escapeHtml(meta.pdf)}</a></p>`
          );
        }
        if (meta.tags && meta.tags.length) {
          lines.push(`<p><strong>Tags</strong>: ${renderTags(meta.tags)}</p>`);
        }
        if (meta.score !== undefined && meta.score !== null) {
          lines.push(`<p><strong>Score</strong>: ${escapeHtml(String(meta.score))}</p>`);
        }
        lines.push('</div>');

        lines.push('</div>');
        lines.push('');

        // 闁喕顫嶉崠鍝勭厵
        if (meta.motivation || meta.method || meta.result || meta.conclusion) {
          lines.push('<div class="paper-glance-section">');
          lines.push('<div class="paper-glance-row">');

          lines.push('<div class="paper-glance-col">');
          lines.push('<div class="paper-glance-label">Motivation</div>');
          lines.push(`<div class="paper-glance-content">${escapeHtml(meta.motivation || '-')}</div>`);
          lines.push('</div>');

          lines.push('<div class="paper-glance-col">');
          lines.push('<div class="paper-glance-label">Method</div>');
          lines.push(`<div class="paper-glance-content">${escapeHtml(meta.method || '-')}</div>`);
          lines.push('</div>');

          lines.push('<div class="paper-glance-col">');
          lines.push('<div class="paper-glance-label">Result</div>');
          lines.push(`<div class="paper-glance-content">${escapeHtml(meta.result || '-')}</div>`);
          lines.push('</div>');

          lines.push('<div class="paper-glance-col">');
          lines.push('<div class="paper-glance-label">Conclusion</div>');
          lines.push(`<div class="paper-glance-content">${escapeHtml(meta.conclusion || '-')}</div>`);
          lines.push('</div>');

          lines.push('</div>');
          lines.push('</div>');
          lines.push('');
        }

        const figures = parseFiguresMeta(meta);
        if (figures.length) {
          lines.push(renderFigureCarousel(figures));
        }

        // 濞夈劍鍓伴敍姘躬 Markdown 娑擃厽褰冮崗?HTML block閿涘牆顩?<hr>閿涘鎮楅敍宀勬付鐟曚椒绔存稉顏佲偓婊呪敄鐞涘备鈧繃澧犻懗鍊燁唨閸氬海鐢婚惃?`##` 缁?Markdown 濮濓絽鐖剁憴锝嗙€介妴?        // 鏉╂瑩鍣烽柅姘崇箖鏉╄棄濮炴稉銈勯嚋缁岄缚顢戦敍宀€鈥樻穱婵囨付缂佸牐绶崙杞颁簰 `<hr>\n\n` 缂佹挸鐔妴?        lines.push('<hr>');
        lines.push('');
        lines.push('');

        return lines.join('\n');
      };

      // --- Docsify beforeEach 闁解晛鐡欓敍姘承掗弸?front matter ---
      hook.beforeEach(function (content) {
        const file = vm && vm.route ? vm.route.file : '';
        // 閸欘亜顕拋鐑樻瀮妞ょ敻娼版径鍕倞
        if (!isPaperRouteFile(file)) {
          latestPaperRawMarkdown = '';
          return content;
        }
        latestPaperRawMarkdown = content || '';

        const { meta, body } = parseFrontMatter(content);
        if (!meta) {
          return content;
        }

        // 閻㈢喐鍨氱拋鐑樻瀮妞ょ敻娼?HTML + 濮濓絾鏋?        const paperHtml = renderPaperFromMeta(meta);
        return paperHtml + body;
      });

      // --- Docsify 閻㈢喎鎳￠崨銊︽埂闁解晛鐡?---
      hook.doneEach(function () {
        // 鐠侯垳鏁辩紒鐔剁閿涙艾鐨?#/?id=%2f... 閼奉亜濮╃憴鍕殻娑?#/...
        try {
          const canonical = decodeLegacyIdHash(window.location.hash || '');
          if (canonical && canonical !== window.location.hash) {
            window.location.replace(canonical);
            return;
          }
        } catch {
          // ignore
        }

        // 瑜版挸澧犵捄顖滄暠鐎电懓绨查惃鍕ㄢ偓婊嗩啈閺?ID閳ユ繐绱欑粻鈧崡鏇犳暏閺傚洣娆㈤崥宥呭箵閹?.md閿?        const paperId = getPaperId();
        const routePath = vm.route && vm.route.path ? vm.route.path : '';
        const lowerId = (paperId || '').toLowerCase();

        // 妫ｆ牠銆夐敍鍫濐洤 README.md 閹存牗鐗寸捄顖氱窞閿涘绗夌仦鏇犮仛閻棁顓块崠鐚寸礉閸欘亜浠涢弫鏉款劅濞撳弶鐓嬮崪?Zotero 閸忓啯鏆熼幑顔芥纯閺?        const isHomePage =
          !paperId ||
          lowerId === 'readme' ||
          routePath === '/' ||
          routePath === '';
        const file = vm && vm.route ? vm.route.file : '';
        const isReportPage = isReportRouteFile(file);
        const isPaperPage = isPaperRouteFile(file);
        const isLandingLikePage = isHomePage || isReportPage;
        syncPageTypeClasses({ isHomePage, isReportPage, isPaperPage });

        // A. 鐎佃顒滈弬鍥у隘閸╃喕绻樼悰灞肩濞嗏€冲弿鐏炩偓閸忣剙绱″〒鍙夌厠閿涘牊鏁幐?$...$ / $$...$$閿?        const mainContent = document.querySelector('.markdown-section');
        if (mainContent) {
          // 閸忓牆鍨卞鐑橆劀閺傚洤瀵樼憗鍛湴閿涘矂浼╅崗宥呮倵缂侇厼鍨忔い闈涘З閻㈣濂栭崫宥堜喊婢垛晜璇炵仦?          const root = isPaperPage ? ensurePageContentRoot() : null;
          renderMathInEl(root || mainContent);
        }

        // 鐠佺儤鏋冩い鍨垼妫版ɑ娼幒鎺斿閿涘牆褰х€?docs/YYYYMM/DD/*.md 閻㈢喐鏅ラ敍?        applyPaperTitleBar();

        // 鐠佺儤鏋冩い闈涗箯閸欏啿鍨忛幑顫窗閺囧瓨鏌婄€佃壈鍩呴崚妤勩€冮獮鍓佺拨鐎规矮绨ㄦ禒璁圭礄閸欘亞绮︾€规矮绔村▎鈽呯礆
        updateNavState();
        ensureNavHandlers();
        // 妫板嫬褰囬惄鎼佸仸鐠佺儤鏋冮惃?Markdown閿涘牆鍩勯悽銊︾セ鐟欏牆娅?cache閿涘矁顔€閸掑洦宕查弴缈犵濠婃埊绱?        prefetchAdjacent();

        // 妞ょ敻娼伴崗銉ユ簚閸斻劎鏁鹃敍姘壌閹诡喕绗傛稉鈧捄宕囨畱閺傜懓鎮滈崑姘拨閸?        const animEl = getPageAnimEl();
        if (animEl) {
          // 濞撳懐鎮婃稉濠佺濞嗭繝鈧偓閸︾儤鐣悾娆欑礄闂冨弶顒涢弸浣侯伂閹懎鍠屾稉瀣梾濞撳懏甯€閿?          animEl.classList.remove(
            'dpr-page-exit',
            'dpr-page-exit-left',
            'dpr-page-exit-right',
              );
          const enter = DPR_TRANSITION.pendingEnter;
          DPR_TRANSITION.pendingEnter = '';
          if (enter && !prefersReducedMotion()) {
            animEl.classList.add('dpr-page-enter', enter);
            requestAnimationFrame(() => {
              // 鐟欙箑褰?transition 閸掓壋鈧粓娼ゅ銏♀偓浣测偓?              animEl.classList.add('dpr-page-enter-active');
              setTimeout(() => {
                animEl.classList.remove(
                  'dpr-page-enter',
                  'dpr-page-enter-active',
                  'enter-from-left',
                  'enter-from-right',
                );
              }, DPR_TRANSITION_MS + 40);
            });
          }
        }

        if (!isLandingLikePage && window.PrivateDiscussionChat) {
          window.PrivateDiscussionChat.initForPage(paperId);
        }

        bindPaperFigureCarousels();

        // ----------------------------------------------------
        // E. 鐏忓繐鐫嗛悙鐟板毊娓氀嗙珶閺嶅繑娼惄顔兼倵閼奉亜濮╅弨鎯版崳
        // ----------------------------------------------------
        setupMobileSidebarAutoCloseOnItemClick();

        // ----------------------------------------------------
        // F. 娓氀嗙珶閺嶅繑瀵滈弮銉︽埂閹舵ê褰?        // ----------------------------------------------------
        setupCollapsibleSidebarByDay();
        hydrateStructuredSidebarItems();
        bindSidebarVirtualHashLinks();
        neutralizeSidebarNoactiveLinks();

        // ----------------------------------------------------
        // G. 娓氀嗙珶閺嶅繐鍑￠梼鍛邦嚢鐠佺儤鏋冮悩鑸碘偓渚€鐝禍?        // ----------------------------------------------------
        if (!isLandingLikePage && paperId) {
          markSidebarReadState(paperId);
        } else {
          // 妫ｆ牠銆夋稊鐔兼付鐟曚礁绨查悽銊ュ嚒閺堝娈戦垾婊冨嚒鐠囧鐝禍顔光偓婵撶礉娴ｅ棔绗夐弬鏉款杻鐠佹澘缍?          markSidebarReadState(null);
        }

        // 鐠佲晜绮﹂崝銊╃彯娴滎喖鐪扮捄鐔兼瑜版挸澧?active 妞ょ櫢绱欓悙鐟板毊閵嗕浇鐭鹃悽鍗炲綁閸栨牕鎮楁导姘纯閺?active 缁紮绱?        try {
          const movedByNavAnim = !!DPR_SIDEBAR_ACTIVE_INDICATOR.justMoved;
          if (!movedByNavAnim) {
            // 闂堢偐鈧粎鍋ｉ崙鏄徯曢崣鎴犳畱妫板嫬鍘涘鎴濆З閳ユ繂婧€閺咁垽绱伴崗鍫㈢彌閸楀疇鍒涙鎰濞?            syncSidebarActiveIndicator({ animate: false });
          }
          // 缂佺喍绔撮崑姘濞嗏€虫鏉╃喓绮撻幀浣圭墡閸戝棴绱?          // - 閻愮懓鍤崚鍥€夐弮鍫曚缉閸忓秮鈧粌鍘涚€靛綊缍?-> 娑撳﹨鐑?-> 閸愬秴娲栨担宥佲偓婵堟畱閸欏矂鍣搁幎鏍уЗ
          // - 閸掑棛绮嶇仦鏇炵磻/閺€鎯版崳閺?max-height 鏉╁洦娴敍灞界鐏炩偓缁嬪啿鐣鹃崥搴″晙閺嶁€冲櫙娑撯偓濞?          setTimeout(() => {
            try {
              requestAnimationFrame(() => {
                syncSidebarActiveIndicator({ animate: false });
              });
            } finally {
              DPR_SIDEBAR_ACTIVE_INDICATOR.justMoved = false;
            }
          }, movedByNavAnim ? 220 : 280);
        } catch {
          // ignore
          DPR_SIDEBAR_ACTIVE_INDICATOR.justMoved = false;
        }

        // 閼奉亜濮╅幎濠傜秼閸撳秷顔戦弬鍥ф躬 sidebar 娑擃厽绮撮崝銊ュ煂鐏炲懍鑵戞担宥囩枂閿涘奔绌舵禍搴ょ箾缂侇參妲勭拠?        if (DPR_NAV_STATE.lastNavSource !== 'click') {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              centerSidebarOnCurrent();
            });
          });
        }

        // 閺堫剚顐?doneEach 閻ㄥ嫭娼靛┃鎰涧閻劋绨幒褍鍩楅垾婊勬Ц閸氾箑鐪虫稉顓涒偓婵撶礉閻劌鐣崡铏閻?        DPR_NAV_STATE.lastNavSource = '';

        // ----------------------------------------------------
        // H. Zotero 閸忓啯鏆熼幑顔芥暈閸忋儵鈧槒绶?(鐢箑娆㈤弮璺烘嫲閸炪倝鍟?
        // ----------------------------------------------------
        setTimeout(() => {
          updateZoteroMetaFromPage(
            paperId,
            vm.route.file,
            latestPaperRawMarkdown,
          );
        }, 1); // 瀵ゆ儼绻滈幍褑顢戦敍宀€鐡戝?DOM 濞撳弶鐓嬬€瑰本鐦?      });
      // ----------------------------------------------------
      // I. 閸濆秴绨插蹇庢櫠鏉堣鐖敍姘辩崕鐏炲繘顩诲▎鈥冲鏉炶姤妞傜涵顔荤箽閺€鎯版崳閿涘牅绮庣粔濠氭珟 close 缁紮绱?      // ----------------------------------------------------
      const SIDEBAR_AUTO_COLLAPSE_WIDTH = 1024;

      const ensureCollapsedOnNarrowScreen = () => {
        const windowWidth =
          window.innerWidth || document.documentElement.clientWidth || 0;
        if (windowWidth >= SIDEBAR_AUTO_COLLAPSE_WIDTH) return;

        const body = document.body;
        if (!body.classList) return;
        // 鏉╂稑鍙嗙粣鍕潌閺冩湹濞囬悽?"姒涙顓绘稉宥呯敨 close" 閻ㄥ嫭鏁圭挧閿嬧偓渚婄礉閸忕厧顔?Docsify 閻ㄥ嫮些閸斻劎顏拠顓濈疅
        body.classList.remove('close');
      };

      // 閸掓繂顫愰崠鏍ㄦ閹笛嗩攽娑撯偓濞?      ensureCollapsedOnNarrowScreen();
    },
  ],
};




