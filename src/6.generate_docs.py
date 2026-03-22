# -*- coding: utf-8 -*-

import os
import re
import json
import traceback
from typing import Dict, List, Optional
from urllib.parse import urljoin, urlparse, parse_qs, unquote
from datetime import datetime
from bs4 import BeautifulSoup
import base64
import urllib.request
from generate_docs import *

def gmail_decode(data):
    # 补全 Base64 填充符号 (Padding)
    missing_padding = len(data) % 4
    if missing_padding:
        data += '=' * (4 - missing_padding)
    return base64.urlsafe_b64decode(data).decode('utf-8')

def get_latest_research_email():
    """获取最新一封标题包含 'new related research' 的邮件内容"""
    
    # 1. 配置 API 密钥和基础 URL
    # 建议通过环境变量设置：export MATON_API_KEY='your_key'
    api_key = os.environ.get("MATON_API_KEY")
    if not api_key:
        return "错误：未找到 MATON_API_KEY 环境变量。"

    base_url = "https://gateway.maton.ai/google-mail/gmail/v1/users/me/messages"
    headers = {'Authorization': f'Bearer {api_key}'}

    try:
        # 2. 搜索邮件：使用 Gmail 的搜索语法 q='subject:"new related research"'
        # 限制只取 1 条结果（最新的）
        search_query = 'subject:"new related research"'
        list_url = f"{base_url}?maxResults=1&q={urllib.parse.quote(search_query)}"
        
        req = urllib.request.Request(list_url, headers=headers)
        with urllib.request.urlopen(req) as response:
            list_data = json.loads(response.read().decode('utf-8'))
        
        messages = list_data.get('messages', [])
        if not messages:
            return "未找到标题包含 'new related research' 的邮件。"

        # 3. 获取该邮件的详细内容
        msg_id = messages[0]['id']
        detail_url = f"{base_url}/{msg_id}?format=full"
        
        detail_req = urllib.request.Request(detail_url, headers=headers)
        with urllib.request.urlopen(detail_req) as response:
            msg_detail = json.loads(response.read().decode('utf-8'))

        # 4. 解析邮件关键信息
        snippet = msg_detail.get('snippet', '')
        payload = msg_detail.get('payload', {})
        headers_list = payload.get('headers', [])
        
        subject = next((h['value'] for h in headers_list if h['name'] == 'Subject'), "无主题")
        sender = next((h['value'] for h in headers_list if h['name'] == 'From'), "未知发件人")

        email_data = payload['body']['data']

        html_content = gmail_decode(email_data)
        
        # 返回格式化后的结果
        return {
            "subject": subject,
            "sender": sender,
            "snippet": snippet,
            "full_data": msg_detail, 
            "html_content": html_content
        }

    except Exception as e:
        return f"程序运行出错: {str(e)}"

os.environ['MATON_API_KEY'] = 'fiAs2yYLwCFTokXLsNQAPlza0HV0td4jg3NVWH0AW1BIaWapZleJuUM52sx2XFLbQoBFBCnTUGuxtJgw6KPZrJKcR8zOX33EgwY'




# --------------------------------------------------
# 1. 从 Google Scholar 提醒邮件中解析论文条目
# --------------------------------------------------
def normalize_possible_pdf_url(url: str) -> str:
    """
    尽量把各种 url 规范成可下载/可访问的 pdf_url。
    这里只做轻量规则，不做联网解析。
    """
    if not url:
        return ""

    url = url.strip()

    # 有些 scholar / arxiv 链接是 PDF 直链
    if url.lower().endswith(".pdf"):
        return url

    # arXiv abs -> pdf
    # https://arxiv.org/abs/2501.12345 -> https://arxiv.org/pdf/2501.12345.pdf
    m = re.search(r"https?://arxiv\.org/abs/([^/?#]+)", url)
    if m:
        arxiv_id = m.group(1)
        return f"https://arxiv.org/pdf/{arxiv_id}.pdf"

    # OpenReview PDF
    # https://openreview.net/forum?id=xxx -> https://openreview.net/pdf?id=xxx
    if "openreview.net/forum" in url:
        parsed = urlparse(url)
        q = parse_qs(parsed.query)
        paper_id = q.get("id", [""])[0]
        if paper_id:
            return f"https://openreview.net/pdf?id={paper_id}"

    return url


def extract_pdf_url_from_title_block(a_tag) -> str:
    """
    从单条 scholar 邮件记录附近尽量找 PDF 链接。
    常见情况：
    - 左侧/附近有 [PDF] 链接
    - 标题链接本身就是 pdf
    - 标题链接是 arxiv abs，可转成 pdf
    """
    title_link = a_tag.get("href", "").strip()
    if title_link:
        normalized = normalize_possible_pdf_url(title_link)
        if normalized.lower().endswith(".pdf") or "arxiv.org/pdf/" in normalized or "openreview.net/pdf" in normalized:
            return normalized

    # 在相邻节点中找 [PDF] 或明显 pdf 链接
    parent = a_tag.find_parent()
    if parent:
        nearby_links = parent.find_all("a", href=True)
        for lk in nearby_links:
            href = lk["href"].strip()
            text = lk.get_text(" ", strip=True).lower()
            if href.lower().endswith(".pdf") or text == "[pdf]" or text == "pdf":
                return href

    # 向上找更大块容器
    block = a_tag.find_parent(["h3", "td", "tr", "div"])
    if block:
        nearby_links = block.find_all("a", href=True)
        for lk in nearby_links:
            href = lk["href"].strip()
            text = lk.get_text(" ", strip=True).lower()
            if href.lower().endswith(".pdf") or text == "[pdf]" or text == "pdf":
                return href

    # 最后再从标题链接规则推断
    return normalize_possible_pdf_url(title_link)


def parse_scholar_html_to_dict(html_content: str) -> Dict:
    """
    将 Google Scholar 提醒邮件的 HTML 解析为字典列表。
    新增 pdf_url 字段。
    """
    soup = BeautifulSoup(html_content, 'html.parser')
    result = {"papers": []}

    title_links = soup.find_all('a', class_='gse_alrt_title')

    for a_tag in title_links:
        title = a_tag.get_text(strip=True)
        link = a_tag.get('href', '').strip()

        h3_tag = a_tag.find_parent('h3')
        if not h3_tag:
            # 有些 scholar 邮件结构可能不是 h3，退化处理
            parent = a_tag.find_parent(["div", "td", "tr"])
            h3_tag = parent if parent else a_tag

        author_venue_div = None
        snippet_div = None

        # 尽量贴近旧逻辑
        if h3_tag:
            author_venue_div = h3_tag.find_next_sibling('div')
            snippet_div = h3_tag.find_next_sibling('div', class_='gse_alrt_sni')

        author_venue = author_venue_div.get_text(strip=True) if author_venue_div else "未知作者/期刊"
        snippet = snippet_div.get_text(strip=True) if snippet_div else "无摘要"

        pdf_url = extract_pdf_url_from_title_block(a_tag)

        paper_dict = {
            "title": title,
            "authors_and_venue": author_venue,
            "snippet": snippet,
            "link": link,
            "pdf_url": pdf_url,
            "source": "google_scholar_email",
        }
        result["papers"].append(paper_dict)

    return result


# --------------------------------------------------
# 2. 邮件论文条目 -> 旧 deep_list 风格
# --------------------------------------------------
def sanitize_filename(name: str, max_len: int = 180) -> str:
    name = re.sub(r'[\\/:*?"<>|]+', '_', name)
    name = re.sub(r'\s+', ' ', name).strip()
    if len(name) > max_len:
        name = name[:max_len].rstrip()
    return name


def convert_email_paper_to_deep_item(paper: Dict) -> Dict:
    """
    把邮件里解析出的 paper 转成更接近 generate_docs.py 原来可能使用的 deep_list 单条格式。
    尽量多给几个常见字段，增加兼容性。
    """
    title = (paper.get("title") or "").strip()
    link = (paper.get("link") or "").strip()
    pdf_url = (paper.get("pdf_url") or "").strip()
    authors_and_venue = (paper.get("authors_and_venue") or "").strip()
    snippet = (paper.get("snippet") or "").strip()

    if not pdf_url:
        pdf_url = normalize_possible_pdf_url(link)

    deep_item = {
        # 新输入核心字段
        "title": title,
        "pdf_url": pdf_url,

        # 兼容旧逻辑时常见字段
        "url": link,
        "entry_id": link or pdf_url or title,
        "abstract": snippet,
        "summary": snippet,
        "authors_and_venue": authors_and_venue,
        "source": "google_scholar_email",

        # 保留原始信息
        # "raw_email_item": paper,
    }
    return deep_item


def build_deep_list_from_email_papers(papers: List[Dict]) -> List[Dict]:
    deep_list = []
    for p in papers:
        title = (p.get("title") or "").strip()
        pdf_url = (p.get("pdf_url") or "").strip()
        link = (p.get("link") or "").strip()

        # 至少要有 title，并且有 pdf_url 或 link
        if not title:
            continue
        if not pdf_url and not link:
            continue

        deep_list.append(convert_email_paper_to_deep_item(p))
    return deep_list


def fallback_process_paper(paper: Dict,
                           output_dir: str,
                           save_jsonl: bool = True) -> Dict:
    """
    兜底版 process_paper：
    当原 generate_docs.process_paper 无法复用时，至少生成一个与“docs 生成管线”兼容的中间结果文件。
    这里不会强行猜测你的所有老字段，只保留常用关键字段。
    """
    os.makedirs(output_dir, exist_ok=True)

    title = paper.get("title", "").strip()
    pdf_url = paper.get("pdf_url", "").strip()
    url = paper.get("url", "").strip()
    abstract = paper.get("abstract", "").strip()
    authors_and_venue = paper.get("authors_and_venue", "").strip()

    paper_id = sanitize_filename(title) if title else "untitled_paper"

    result = {
        "paper_id": paper_id,
        "title": title,
        "pdf_url": pdf_url,
        "url": url,
        "abstract": abstract,
        "authors_and_venue": authors_and_venue,
        "source": paper.get("source", "google_scholar_email"),
        "status": "parsed_from_email",
    }

    # 单篇 json
    json_path = os.path.join(output_dir, f"{paper_id}.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2)

    # 汇总 jsonl
    if save_jsonl:
        jsonl_path = os.path.join(output_dir, "papers.jsonl")
        with open(jsonl_path, "a", encoding="utf-8") as f:
            f.write(json.dumps(result, ensure_ascii=False) + "\n")

    return result


def process_paper_gmail(paper: Dict,
                  output_dir: str = "./generated_docs_from_email",
                  date_str: str='',
                  *args, **kwargs) -> Dict:
    """
    新版 process_paper：
    1) 输入兼容新的 email paperlist
    2) 内部先标准化为 deep_item
    3) 尽量调用 generate_docs.py 原始 process_paper
    4) 失败时使用 fallback，保证流程不中断
    """
    docs_dir = output_dir

    section = 'deep'
    try:
        return process_paper(
            paper,
            section,
            date_str,
            docs_dir,
            *args,
            **kwargs
        )

    except Exception:
        print(f"[WARN] 原始 process_paper 调用失败，切换 fallback: {paper.get('title', '')}")
        traceback.print_exc()
        return fallback_process_paper(paper, output_dir=output_dir)


# --------------------------------------------------
# 4. 新 main：
#    从邮件解析论文，然后作为 deep_list 逐篇处理
# --------------------------------------------------
def main(output_dir: str = "./generated_docs_from_email"):
    result = get_latest_research_email()

    if not isinstance(result, dict):
        print(result)
        return
    date_str = datetime.now().strftime("%Y-%m-%d")
    print(f"找到邮件！")
    print(f"主题: {result.get('subject', '')}")
    print(f"发件人: {result.get('sender', '')}")
    print(f"摘要: {result.get('snippet', '')}")

    html_content = result.get("html_content", "")
    if not html_content:
        print("[ERROR] 邮件中没有 html_content")
        return

    parsed_data = parse_scholar_html_to_dict(html_content)
    email_papers = parsed_data.get("papers", [])

    if not email_papers:
        print("[INFO] 邮件中没有解析到论文条目")
        return

    email_list = build_deep_list_from_email_papers(email_papers)

    print(f"[INFO] 从邮件中解析到 {len(email_papers)} 篇论文")
    print(f"[INFO] 可用于 docs 生成的 email_list 数量: {len(email_list)}")

    os.makedirs(output_dir, exist_ok=True)

    # all_results = []
    # for idx, paper in enumerate(deep_list, 1):
    #     print("=" * 80)
    #     print(f"[{idx}/{len(deep_list)}] {paper.get('title', '')}")
    #     print(f"pdf_url: {paper.get('pdf_url', '')}")

    #     try:
    #         one_result = process_paper_gmail(
    #             paper,
    #             output_dir=output_dir,
    #             date_str=date_str, 
                
    #         )
    #         all_results.append(one_result)
    #     except Exception as e:
    #         print(f"[ERROR] 处理失败: {paper.get('title', '')}")
    #         print(str(e))
    #         traceback.print_exc()

    # # 最终汇总
    # summary_path = os.path.join(output_dir, "all_results.json")
    # with open(summary_path, "w", encoding="utf-8") as f:
    #     json.dump(all_results, f, ensure_ascii=False, indent=2)

    # print("=" * 80)
    # print(f"[DONE] 全部处理完成，结果保存在: {output_dir}")
    # print(f"[DONE] 汇总文件: {summary_path}")



    parser = argparse.ArgumentParser(description="Step 6: generate docs for deep/quick sections.")
    parser.add_argument("--date", type=str, default=TODAY_STR, help="date string YYYYMMDD.")
    parser.add_argument("--mode", type=str, default=None, help="mode for recommend file.")
    parser.add_argument("--docs-dir", type=str, default=None, help="override docs dir.")
    parser.add_argument(
        "--sidebar-date-label",
        type=str,
        default=None,
        help="侧边栏日期标题展示文本（例如：2026-01-01 ~ 2026-01-27）。不填则使用单日日期。",
    )
    parser.add_argument(
        "--glance-only",
        action="store_true",
        help="只生成/补齐 `## 速览`（基于 title+abstract），不下载 PDF/Jina 文本，不生成精读总结。",
    )
    parser.add_argument(
        "--force-glance",
        action="store_true",
        help="强制重生成 `## 速览` 并覆盖写入（即使文件里已存在该块）。",
    )
    parser.add_argument(
        "--sidebar-only",
        action="store_true",
        help="只更新 docs/_sidebar.md（不生成/不重写论文 Markdown，避免触发 LLM 调用）。",
    )
    parser.add_argument(
        "--fix-tags-only",
        action="store_true",
        help="仅修复已生成文章里的 `**Tags**`（移除“精读区/速读区”标签），不触发 LLM。",
    )
    parser.add_argument(
        "--paper-id",
        type=str,
        default=None,
        help="单篇模式：填写 arXiv id（如 1706.03762v1 / https://arxiv.org/abs/1706.03762v1）。",
    )
    parser.add_argument(
        "--paper-date",
        type=str,
        default="",
        help="单篇模式：论文输出目录日期（YYYYMMDD），默认使用论文发布时间。",
    )
    parser.add_argument(
        "--paper-section",
        type=str,
        default="quick",
        help="单篇模式：deep 或 quick（默认 quick）。",
    )
    parser.add_argument(
        "--paper-title",
        type=str,
        default=None,
        help="单篇模式：可选，手动覆盖论文标题。",
    )
    parser.add_argument(
        "--docs-concurrency",
        type=int,
        default=DEFAULT_DOCS_CONCURRENCY,
        help="step6 每篇论文并发生成数量。",
    )
    args = parser.parse_args()

    date_str = args.date or TODAY_STR
    mode = args.mode
    if not mode:
        config = load_config()
        setting = (config or {}).get("arxiv_paper_setting") or {}
        mode = str(setting.get("mode") or "standard").strip()
    if "," in mode:
        mode = mode.split(",", 1)[0].strip()

    docs_dir = args.docs_dir or resolve_docs_dir()
    # created_reports = backfill_history_day_reports(docs_dir)
    # if created_reports > 0:
    #     log(f"[INFO] 已补齐历史日报 README：{created_reports} 个")


    archive_dir = os.path.join(ROOT_DIR, "archive", date_str, "recommend")
    
    recommend_path = os.path.join(archive_dir, f"gmail_papers_{date_str}.{mode}.json")
    recommend_exists = os.path.exists(recommend_path)
    if not recommend_exists:
        log(f"[WARN] recommend 文件不存在（今天可能没有新论文）：{recommend_path}。将生成空日报并更新首页。")
        
    deep_list = email_list
    quick_list = []

    def _paper_score(p: dict) -> float:
        try:
            return float(p.get("llm_score", 0) or 0)
        except Exception:
            return 0.0

    def _paper_id(p: dict) -> str:
        return str(p.get("id") or p.get("paper_id") or "").strip()

    # 侧边栏展示按分数降序（同分按 id 稳定排序），避免“高分被埋在下面”
    deep_list = sorted(deep_list, key=lambda p: (-_paper_score(p), _paper_id(p)))
    # quick_list = sorted(quick_list, key=lambda p: (-_paper_score(p), _paper_id(p)))
    
    if args.fix_tags_only:
        changed_files = 0
        total_files = 0
        for section, lst in (("deep", deep_list)):
            for paper in lst:
                title = (paper.get("title") or "").strip()
                arxiv_id = str(paper.get("id") or paper.get("paper_id") or "").strip()
                md_path, _, _ = prepare_paper_paths(docs_dir, date_str, title, arxiv_id)
                if not os.path.exists(md_path):
                    continue
                total_files += 1
                try:
                    with open(md_path, "r", encoding="utf-8") as f:
                        content = f.read()
                except Exception:
                    continue
                fixed, changed = normalize_meta_tags_line(content)
                if not changed:
                    continue
                try:
                    with open(md_path, "w", encoding="utf-8") as f:
                        f.write(fixed + ("\n" if not fixed.endswith("\n") else ""))
                    changed_files += 1
                except Exception:
                    continue
        log(f"[OK] fix-tags-only: scanned={total_files}, updated={changed_files}")
        return

    deep_entries: List[Tuple[str, str, List[Tuple[str, str]]]] = []
    quick_entries: List[Tuple[str, str, List[Tuple[str, str]]]] = []
    docs_concurrency = max(1, int(args.docs_concurrency))

    def _process_section(
        section: str,
        papers: List[Dict[str, Any]],
        paper_evidence_by_id: Dict[str, str],
    ) -> List[Tuple[str, str, List[Tuple[str, str]]]]:
        if not papers:
            return []
        max_workers = max(1, docs_concurrency)
        futures: Dict[Any, Tuple[int, Dict[str, Any]]] = {}
        results: List[Tuple[int, Tuple[str, str, List[Tuple[str, str]]]]] = []
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            for index, paper in enumerate(papers):
                future = executor.submit(
                    process_paper,
                    paper,
                    section,
                    date_str,
                    docs_dir,
                    args.glance_only,
                    args.force_glance,
                )
                futures[future] = (index, paper)

            for future in as_completed(futures):
                index, paper = futures[future]
                try:
                    pid, title = future.result()
                except Exception as e:
                    log(f"[WARN] 生成{section}论文失败：{e}")
                    continue
                paper_evidence_by_id[str((pid or "").strip())] = get_paper_sidebar_evidence(paper)
                section_tags = extract_sidebar_tags(paper)
                results.append((index, (pid, title, section_tags)))

        results.sort(key=lambda item: item[0])
        return [v for _, v in results]

    sidebar_evidence_by_id: Dict[str, str] = {}

    if args.sidebar_only:
        log_substep("6.2", "跳过生成文章（仅更新侧边栏）", "SKIP")
        for paper in deep_list:
            title = (paper.get("title") or "").strip()
            arxiv_id = str(paper.get("id") or paper.get("paper_id") or "").strip()
            _, _, pid = prepare_paper_paths(docs_dir, date_str, title, arxiv_id)
            sidebar_evidence_by_id[str(pid).strip()] = get_paper_sidebar_evidence(paper)
            deep_entries.append((pid, title, extract_sidebar_tags(paper)))

        # for paper in quick_list:
        #     title = (paper.get("title") or "").strip()
        #     arxiv_id = str(paper.get("id") or paper.get("paper_id") or "").strip()
        #     _, _, pid = prepare_paper_paths(docs_dir, date_str, title, arxiv_id)
        #     sidebar_evidence_by_id[str(pid).strip()] = get_paper_sidebar_evidence(paper)
        #     quick_entries.append((pid, title, extract_sidebar_tags(paper)))
        log_substep("6.3", "跳过生成文章（仅更新侧边栏）", "SKIP")
    else:
        log_substep("6.2", "生成精读区文章", "START")
        deep_entries = _process_section("deep", deep_list, sidebar_evidence_by_id)
        log_substep("6.2", "生成精读区文章", "END")


    log_substep("6.4", "生成当日日报并同步首页 README", "START")
    run_generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")
    day_readme = write_day_report_readme(
        docs_dir=docs_dir,
        date_str=date_str,
        date_label=args.sidebar_date_label,
        deep_entries=deep_entries,
        quick_entries=quick_entries,
        recommend_exists=False,
    )
    home_readme = sync_home_readme_from_day_report(
        docs_dir=docs_dir,
        date_str=date_str,
        date_label=args.sidebar_date_label,
        generated_at=run_generated_at,
        recommend_exists=False,
        deep_entries=deep_entries,
        quick_entries=quick_entries,
        paper_evidence_by_id=sidebar_evidence_by_id,
    )
    log(f"[OK] day report saved: {day_readme}")
    log(f"[OK] home README synced: {home_readme}")
    log_substep("6.4", "生成当日日报并同步首页 README", "END")

    sidebar_path = os.path.join(docs_dir, "_sidebar.md")
    if deep_entries or quick_entries:
        log_substep("6.5", "更新侧边栏", "START")
        update_sidebar(
            sidebar_path,
            date_str,
            deep_entries,
            quick_entries,
            sidebar_evidence_by_id,
            date_label=args.sidebar_date_label,
        )
        log_substep("6.5", "更新侧边栏", "END")
    else:
        log_substep("6.5", "更新侧边栏", "SKIP")
        log("[INFO] 本次无推荐论文，不写入 Sidebar 日期目录。")

    log_substep("6.6", "生成可下载元数据索引（JSON）", "START")
    try:
        out_path = write_day_meta_index_json(
            docs_dir,
            date_str,
            args.sidebar_date_label,
            deep_list,
            quick_list,
        )
        log(f"[OK] meta index saved: {out_path}")
    except Exception as e:
        log(f"[WARN] 生成元数据索引失败：{e}")
    log_substep("6.6", "生成可下载元数据索引（JSON）", "END")

    log_substep("6.7", "写入运行日志（日报）", "START")
    run_log = write_run_daily_log(
        date_str=date_str,
        mode=mode,
        recommend_path=recommend_path,
        recommend_exists=recommend_exists,
        deep_count=len(deep_entries),
        quick_count=len(quick_entries),
        docs_dir=docs_dir,
        day_readme=day_readme,
    )
    log(f"[OK] daily report log saved: {run_log}")
    log_substep("6.7", "写入运行日志（日报）", "END")

    log(f"[OK] docs updated: {docs_dir}")

if __name__ == "__main__":
    main()
