#!/usr/bin/env python
# -*- coding: utf-8 -*-

import argparse
import base64
import json
import os
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from typing import Dict, List
from urllib.parse import parse_qs, urlparse

from bs4 import BeautifulSoup


SRC_DIR = os.path.dirname(__file__)
ROOT_DIR = os.path.abspath(os.path.join(SRC_DIR, ".."))
OPEN_ACCESS_DOMAINS = (
    "arxiv.org",
    "openreview.net",
    "biorxiv.org",
    "medrxiv.org",
    "chemrxiv.org",
    "aclanthology.org",
    "aaai.org",
)
SOURCE_FRESH_FETCH = "fresh_fetch"


def normalize_date_token(value: str) -> str:
    text = str(value or "").strip()
    if not text:
        return datetime.now(timezone.utc).strftime("%Y%m%d")
    for fmt in ("%Y%m%d", "%Y-%m-%d", "%Y/%m/%d"):
        try:
            return datetime.strptime(text, fmt).strftime("%Y%m%d")
        except Exception:
            continue
    raise ValueError(f"Invalid date '{value}', expected YYYYMMDD / YYYY-MM-DD / YYYY/MM/DD")


def parse_date_input(value: str) -> tuple[str, list[str]]:
    text = str(value or "").strip()
    if not text:
        today = datetime.now(timezone.utc).strftime("%Y%m%d")
        return today, [today]

    if re.match(r"^\d{8}-\d{8}$", text):
        start = datetime.strptime(text[:8], "%Y%m%d").date()
        end = datetime.strptime(text[9:], "%Y%m%d").date()
        if start > end:
            raise ValueError(f"Invalid date range '{value}': start > end")
        days: list[str] = []
        current = start
        while current <= end:
            days.append(current.strftime("%Y%m%d"))
            current += timedelta(days=1)
        return f"{start:%Y%m%d}-{end:%Y%m%d}", days

    day = normalize_date_token(text)
    return day, [day]


def gmail_decode(data: str) -> str:
    if not data:
        return ""
    data = data.replace("-", "+").replace("_", "/")
    padding = 4 - (len(data) % 4)
    if padding and padding != 4:
        data += "=" * padding
    return base64.b64decode(data).decode("utf-8", errors="ignore")


def extract_html_from_payload(payload: dict) -> str:
    if not payload:
        return ""

    mime_type = payload.get("mimeType", "")
    body = payload.get("body", {}) or {}
    data = body.get("data")

    if mime_type == "text/html" and data:
        return gmail_decode(data)

    parts = payload.get("parts", []) or []
    for part in parts:
        html = extract_html_from_payload(part)
        if html and ("<html" in html.lower() or "<div" in html.lower() or "<table" in html.lower()):
            return html

    if mime_type == "text/plain" and data:
        return gmail_decode(data)

    for part in parts:
        plain = extract_html_from_payload(part)
        if plain:
            return plain

    return ""


def get_related_research_emails_by_day(target_date: str, subject_text: str = "new related research") -> Dict:
    api_key = os.environ.get("MATON_API_KEY")
    if not api_key:
        raise RuntimeError("Missing MATON_API_KEY environment variable")

    base_url = "https://gateway.maton.ai/google-mail/gmail/v1/users/me/messages"
    headers = {"Authorization": f"Bearer {api_key}"}

    day_dt = datetime.strptime(target_date, "%Y%m%d")
    next_day_dt = day_dt + timedelta(days=1)

    today_str = day_dt.strftime("%Y/%m/%d")
    tomorrow_str = next_day_dt.strftime("%Y/%m/%d")
    search_query = f'subject:"{subject_text}" after:{today_str} before:{tomorrow_str}'

    all_message_ids = []
    page_token = None

    while True:
        params = {"maxResults": 100, "q": search_query}
        if page_token:
            params["pageToken"] = page_token

        list_url = f"{base_url}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(list_url, headers=headers)

        with urllib.request.urlopen(req) as response:
            list_data = json.loads(response.read().decode("utf-8"))

        messages = list_data.get("messages", []) or []
        all_message_ids.extend(messages)

        page_token = list_data.get("nextPageToken")
        if not page_token:
            break

    results = []
    for msg in all_message_ids:
        msg_id = msg["id"]
        detail_url = f"{base_url}/{msg_id}?format=full"

        detail_req = urllib.request.Request(detail_url, headers=headers)
        with urllib.request.urlopen(detail_req) as response:
            msg_detail = json.loads(response.read().decode("utf-8"))

        snippet = msg_detail.get("snippet", "")
        payload = msg_detail.get("payload", {}) or {}
        headers_list = payload.get("headers", []) or []

        subject = next((h["value"] for h in headers_list if h.get("name", "").lower() == "subject"), "")
        sender = next((h["value"] for h in headers_list if h.get("name", "").lower() == "from"), "")
        date_header = next((h["value"] for h in headers_list if h.get("name", "").lower() == "date"), "")
        html_content = extract_html_from_payload(payload)

        results.append(
            {
                "message_id": msg_id,
                "subject": subject,
                "sender": sender,
                "date": date_header,
                "snippet": snippet,
                "html_content": html_content,
            }
        )

    return {"query": search_query, "count": len(results), "emails": results}


def normalize_possible_pdf_url(url: str) -> str:
    if not url:
        return ""

    url = url.strip()
    url = unwrap_google_scholar_redirect(url)
    if url.lower().endswith(".pdf"):
        return url

    matched = re.search(r"https?://arxiv\.org/abs/([^/?#]+)", url)
    if matched:
        arxiv_id = matched.group(1)
        return f"https://arxiv.org/pdf/{arxiv_id}.pdf"

    if "openreview.net/forum" in url:
        parsed = urlparse(url)
        q = parse_qs(parsed.query)
        paper_id = q.get("id", [""])[0]
        if paper_id:
            return f"https://openreview.net/pdf?id={paper_id}"

    return url


def unwrap_google_scholar_redirect(url: str) -> str:
    text = str(url or "").strip()
    if not text:
        return ""
    try:
        parsed = urlparse(text)
        host = (parsed.netloc or "").lower()
        if host.endswith("scholar.google.com") and parsed.path == "/scholar_url":
            q = parse_qs(parsed.query)
            target = str((q.get("url") or [""])[0] or "").strip()
            if target:
                return target
    except Exception:
        return text
    return text


def is_open_access_pdf_url(url: str) -> bool:
    text = str(url or "").strip()
    if not text:
        return False
    lowered = text.lower()
    parsed = urlparse(lowered)
    host = (parsed.netloc or "").strip()
    if host.startswith("www."):
        host = host[4:]
    is_open_host = any(host == d or host.endswith(f".{d}") for d in OPEN_ACCESS_DOMAINS)
    if not is_open_host:
        return False
    return lowered.endswith(".pdf") or "/pdf" in lowered or "openaccesspdf" in lowered


def title_norm(text: str) -> str:
    return re.sub(r"\s+", " ", re.sub(r"[^a-z0-9]+", " ", str(text or "").lower())).strip()


def slugify_text(text: str, max_len: int = 80) -> str:
    s = str(text or "").strip().lower()
    s = re.sub(r"\s+", "-", s)
    s = re.sub(r"[^a-z0-9\-]+", "", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    if not s:
        s = "paper"
    return s[:max_len].strip("-") or "paper"


def build_stable_email_paper_id(title: str, link: str, pdf_url: str) -> str:
    return slugify_text(title)


def search_arxiv_pdf_by_title(title: str) -> str:
    q = str(title or "").strip()
    if not q:
        return ""
    query = urllib.parse.quote(f'ti:"{q}"')
    url = f"https://export.arxiv.org/api/query?search_query={query}&start=0&max_results=3"
    req = urllib.request.Request(url, headers={"User-Agent": "daily-paper-reader/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            xml_text = resp.read().decode("utf-8", errors="ignore")
    except Exception:
        return ""

    try:
        root = ET.fromstring(xml_text)
    except Exception:
        return ""

    ns = {"atom": "http://www.w3.org/2005/Atom"}
    target = title_norm(q)
    for entry in root.findall("atom:entry", ns):
        e_title = " ".join(((entry.findtext("atom:title", "", ns)) or "").split())
        e_norm = title_norm(e_title)
        if not e_norm:
            continue
        if e_norm == target or target in e_norm or e_norm in target:
            for link in entry.findall("atom:link", ns):
                href = (link.attrib.get("href") or "").strip()
                if not href:
                    continue
                if href.lower().endswith(".pdf"):
                    return href
                if link.attrib.get("title") == "pdf":
                    return href
    return ""


def search_semantic_scholar_open_pdf(title: str) -> str:
    q = str(title or "").strip()
    if not q:
        return ""
    params = urllib.parse.urlencode(
        {
            "query": q,
            "limit": 5,
            "fields": "title,openAccessPdf,url",
        }
    )
    url = f"https://api.semanticscholar.org/graph/v1/paper/search?{params}"
    req = urllib.request.Request(url, headers={"User-Agent": "daily-paper-reader/1.0"})
    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except Exception:
        return ""

    rows = payload.get("data", []) or []
    target = title_norm(q)
    for row in rows:
        row_title = title_norm(row.get("title") or "")
        if not row_title:
            continue
        if not (row_title == target or target in row_title or row_title in target):
            continue
        oa = row.get("openAccessPdf") or {}
        oa_url = str(oa.get("url") or "").strip()
        if oa_url:
            return oa_url
    return ""


def resolve_non_open_pdf_urls(papers: List[Dict]) -> int:
    updated = 0
    for p in papers:
        current = normalize_possible_pdf_url(str(p.get("pdf_url") or p.get("link") or "").strip())
        if is_open_access_pdf_url(current):
            p["pdf_url"] = current
            if not str(p.get("pdf_resolved_from") or "").strip():
                p["pdf_resolved_from"] = "original_open_access"
            continue

        title = str(p.get("title") or "").strip()
        replacement = search_arxiv_pdf_by_title(title)
        source = "arxiv_title_search"
        if not replacement:
            replacement = search_semantic_scholar_open_pdf(title)
            source = "semantic_scholar_open_access"

        replacement = normalize_possible_pdf_url(replacement)
        if replacement and is_open_access_pdf_url(replacement):
            p["pdf_url"] = replacement
            p["pdf_resolved_from"] = source
            updated += 1
        else:
            # fallback: keep original (possibly paid) link such as Springer.
            if current:
                p["pdf_url"] = current
            p["pdf_resolved_from"] = "fallback_original_non_open"
    return updated


def extract_pdf_url_from_title_block(a_tag) -> str:
    title_link = a_tag.get("href", "").strip()
    if title_link:
        normalized = normalize_possible_pdf_url(title_link)
        if normalized.lower().endswith(".pdf") or "arxiv.org/pdf/" in normalized or "openreview.net/pdf" in normalized:
            return normalized

    parent = a_tag.find_parent()
    if parent:
        nearby_links = parent.find_all("a", href=True)
        for lk in nearby_links:
            href = lk["href"].strip()
            text = lk.get_text(" ", strip=True).lower()
            if href.lower().endswith(".pdf") or text in ("[pdf]", "pdf"):
                return href

    block = a_tag.find_parent(["h3", "td", "tr", "div"])
    if block:
        nearby_links = block.find_all("a", href=True)
        for lk in nearby_links:
            href = lk["href"].strip()
            text = lk.get_text(" ", strip=True).lower()
            if href.lower().endswith(".pdf") or text in ("[pdf]", "pdf"):
                return href

    return normalize_possible_pdf_url(title_link)


def parse_scholar_html_to_dict(html_content: str) -> Dict:
    soup = BeautifulSoup(html_content, "html.parser")
    result = {"papers": []}

    title_links = soup.find_all("a", class_="gse_alrt_title")
    for a_tag in title_links:
        title = a_tag.get_text(strip=True)
        link = unwrap_google_scholar_redirect(a_tag.get("href", "").strip())

        h3_tag = a_tag.find_parent("h3")
        if not h3_tag:
            h3_tag = a_tag.find_parent(["div", "td", "tr"]) or a_tag

        author_venue_div = h3_tag.find_next_sibling("div") if h3_tag else None
        snippet_div = h3_tag.find_next_sibling("div", class_="gse_alrt_sni") if h3_tag else None

        author_venue = author_venue_div.get_text(strip=True) if author_venue_div else ""
        author_text = author_venue.replace("\xa0", " ").strip()
        author_part = re.split(r"\s-\s", author_text, maxsplit=1)[0].strip()
        snippet = snippet_div.get_text(strip=True) if snippet_div else ""

        pdf_url = extract_pdf_url_from_title_block(a_tag)
        result["papers"].append(
            {
                "title": title,
                "authors": author_part,
                "snippet": snippet,
                "link": link,
                "pdf_url": pdf_url,
                "source": "google_scholar_email",
            }
        )

    return result


def convert_email_paper_to_deep_item(paper: Dict) -> Dict:
    title = (paper.get("title") or "").strip()
    link = unwrap_google_scholar_redirect((paper.get("link") or "").strip())
    pdf_url = unwrap_google_scholar_redirect((paper.get("pdf_url") or "").strip())
    snippet = (paper.get("snippet") or "").strip()
    authors = (paper.get("authors") or "").strip()

    if not pdf_url:
        pdf_url = normalize_possible_pdf_url(link)
    paper_id = build_stable_email_paper_id(title, link, pdf_url)

    return {
        "id": paper_id,
        "paper_id": paper_id,
        "title": title,
        "pdf_url": pdf_url,
        "url": link,
        "entry_id": paper_id,
        "abstract": snippet,
        "summary": snippet,
        "authors_and_venue": authors,
        "source": "google_scholar_email",
        "selection_source": SOURCE_FRESH_FETCH,
    }


def build_deep_list_from_email_papers(papers: List[Dict]) -> List[Dict]:
    deep_list = []
    for p in papers:
        title = (p.get("title") or "").strip()
        pdf_url = (p.get("pdf_url") or "").strip()
        link = (p.get("link") or "").strip()
        if not title:
            continue
        if not pdf_url and not link:
            continue
        deep_list.append(convert_email_paper_to_deep_item(p))
    return deep_list


def deduplicate_email_papers(papers: List[Dict]) -> List[Dict]:
    deduped: List[Dict] = []
    seen: set[str] = set()

    for p in papers:
        title = re.sub(r"\s+", " ", str(p.get("title") or "").strip()).lower()
        link = str(p.get("link") or "").strip()
        pdf_url = str(p.get("pdf_url") or "").strip()
        normalized_pdf = normalize_possible_pdf_url(pdf_url or link).strip()

        if normalized_pdf:
            key = f"pdf::{normalized_pdf.lower()}"
        elif link:
            key = f"link::{link.lower()}"
        else:
            key = f"title::{title}"

        if key in seen:
            continue
        seen.add(key)
        deduped.append(p)

    return deduped


def save_recommend_file(date_token: str, mode: str, deep_list: List[Dict], query: str, email_count: int) -> str:
    recommend_dir = os.path.join(ROOT_DIR, "archive", date_token, "recommend")
    os.makedirs(recommend_dir, exist_ok=True)
    out_path = os.path.join(recommend_dir, f"gmail_papers_{date_token}.{mode}.json")

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "updated_date": date_token,
        "mode": mode,
        "source": "gmail",
        "query": query,
        "email_count": email_count,
        "stats": {
            "mode": mode,
            "tag_count": 0,
            "deep_divecandidates": len(deep_list),
            "deep_cap": len(deep_list),
            "deep_selected": len(deep_list),
            "quick_candidates": 0,
            "quick_skim_target": 0,
            "quick_selected": 0,
        },
        "deep_dive": deep_list,
        "quick_skim": [],
    }
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")

    # Keep arxiv_* filename for backward compatibility with code paths expecting original naming.
    legacy_arxiv_path = os.path.join(recommend_dir, f"arxiv_papers_{date_token}.{mode}.json")
    if legacy_arxiv_path != out_path:
        with open(legacy_arxiv_path, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)
            f.write("\n")
    return out_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Step 1: fetch and parse Gmail paper list")
    parser.add_argument(
        "--date",
        type=str,
        default="",
        help="target date token: YYYYMMDD / YYYY-MM-DD / YYYY/MM/DD / YYYYMMDD-YYYYMMDD",
    )
    parser.add_argument("--mode", type=str, default="standard", help="output mode tag, e.g. standard/skims")
    parser.add_argument("--subject", type=str, default="new related research", help="gmail subject filter")
    args = parser.parse_args()

    date_token, day_list = parse_date_input(args.date)
    mode = str(args.mode or "standard").strip() or "standard"

    all_email_papers: List[Dict] = []
    total_email_count = 0
    queries: list[str] = []

    for day in day_list:
        result = get_related_research_emails_by_day(day, subject_text=args.subject)
        emails = result.get("emails", []) or []
        total_email_count += len(emails)
        q = str(result.get("query") or "").strip()
        if q:
            queries.append(q)
        for mail in emails:
            html_content = mail.get("html_content", "")
            if not html_content:
                continue
            parsed_data = parse_scholar_html_to_dict(html_content)
            email_papers = parsed_data.get("papers", []) or []
            all_email_papers.extend(email_papers)

    deduped_email_papers = deduplicate_email_papers(all_email_papers)
    replaced = resolve_non_open_pdf_urls(deduped_email_papers)
    deep_list = build_deep_list_from_email_papers(deduped_email_papers)
    out_path = save_recommend_file(
        date_token=date_token,
        mode=mode,
        deep_list=deep_list,
        query=" | ".join(queries),
        email_count=total_email_count,
    )

    print(
        f"[INFO] date={date_token} days={len(day_list)} emails={total_email_count} "
        f"papers_raw={len(all_email_papers)} papers_dedup={len(deduped_email_papers)} "
        f"pdf_replaced={replaced}"
    )
    print(f"[INFO] saved: {out_path}")


if __name__ == "__main__":
    main()
