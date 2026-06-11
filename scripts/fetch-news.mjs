// Busca notícias do mercado imobiliário de São Paulo via Google News RSS.
// Não precisa de chave de API. Gera o arquivo ../news.json.
//
// Uso: node scripts/fetch-news.mjs

import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT = join(__dirname, "..", "news.json");

// Consultas usadas na busca. Edite à vontade.
const QUERIES = [
  "mercado imobiliário São Paulo",
  "imóveis São Paulo preço",
  "lançamentos imobiliários São Paulo",
  "Secovi-SP",
  "aluguel São Paulo mercado",
];

const MAX_ITEMS = 24; // quantas notícias manter no total

function googleNewsUrl(query) {
  const q = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${q}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
}

// Parser de RSS simples (sem dependências externas).
function parseRss(xml) {
  const items = [];
  const blocks = xml.split(/<item>/i).slice(1);
  for (const block of blocks) {
    const chunk = block.split(/<\/item>/i)[0];
    const get = (tag) => {
      const m = chunk.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
      return m ? m[1].trim() : "";
    };
    let title = get("title");
    let link = get("link");
    const pubDate = get("pubDate");
    let source = get("source");

    // Limpa CDATA e entidades
    const clean = (s) =>
      s
        .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/<[^>]+>/g, "")
        .trim();

    title = clean(title);
    source = clean(source);

    // No Google News o título costuma vir "Manchete - Fonte"
    if (!source && title.includes(" - ")) {
      const parts = title.split(" - ");
      source = parts[parts.length - 1].trim();
      title = parts.slice(0, -1).join(" - ").trim();
    } else if (source && title.endsWith(` - ${source}`)) {
      // Remove sufixo redundante "- Fonte" quando a fonte já veio em tag própria
      title = title.slice(0, -(` - ${source}`).length).trim();
    }

    if (title && link) {
      items.push({
        title,
        link: clean(link),
        source: source || "Google News",
        pubDate,
        ts: pubDate ? new Date(pubDate).getTime() || 0 : 0,
      });
    }
  }
  return items;
}

async function fetchQuery(query) {
  try {
    const res = await fetch(googleNewsUrl(query), {
      headers: { "User-Agent": "Mozilla/5.0 (imob-news bot)" },
    });
    if (!res.ok) {
      console.warn(`Falha (${res.status}) na consulta: ${query}`);
      return [];
    }
    const xml = await res.text();
    return parseRss(xml);
  } catch (err) {
    console.warn(`Erro na consulta "${query}":`, err.message);
    return [];
  }
}

async function main() {
  const all = [];
  for (const q of QUERIES) {
    const items = await fetchQuery(q);
    all.push(...items);
  }

  // Deduplica por título normalizado
  const seen = new Set();
  const deduped = [];
  for (const item of all) {
    const key = item.title.toLowerCase().replace(/\s+/g, " ").slice(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(item);
  }

  // Ordena do mais recente para o mais antigo
  deduped.sort((a, b) => b.ts - a.ts);

  const news = deduped.slice(0, MAX_ITEMS).map((n) => ({
    title: n.title,
    link: n.link,
    source: n.source,
    pubDate: n.pubDate,
  }));

  const payload = {
    updatedAt: new Date().toISOString(),
    count: news.length,
    news,
  };

  await writeFile(OUTPUT, JSON.stringify(payload, null, 2), "utf-8");
  console.log(`OK: ${news.length} notícias gravadas em news.json`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
