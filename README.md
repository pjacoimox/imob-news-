# Notícias do Mercado Imobiliário + Gerador de Posts

Site estático que **busca automaticamente** notícias do mercado imobiliário de São Paulo
e permite **gerar um post 1080×1080 para o Instagram** com um clique. Roda 100% no GitHub
(GitHub Pages + GitHub Actions), sem servidor e sem custo.

## Como funciona

- Uma **GitHub Action** roda algumas vezes por dia, busca notícias no **Google News RSS**
  (sem chave de API) e grava o arquivo `news.json`.
- A página (`index.html`) lê o `news.json`, lista as notícias e, ao clicar em **"Gerar post"**,
  monta a imagem no próprio navegador. Você edita a manchete se quiser e baixa o PNG.

## Estrutura

```
.
├── index.html               # site + gerador de post
├── news.json                # notícias (atualizado pela Action)
├── scripts/fetch-news.mjs   # busca as notícias
└── .github/workflows/update-news.yml  # agendamento automático
```

## Passo a passo para subir no GitHub

1. Crie um repositório novo (ex.: `imob-news`) e suba estes arquivos:
   ```bash
   git init
   git add .
   git commit -m "primeiro commit"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/imob-news.git
   git push -u origin main
   ```

2. **Ative o GitHub Pages**: repositório → **Settings** → **Pages** →
   em *Source* escolha **Deploy from a branch**, branch **main**, pasta **/(root)** → **Save**.
   Em ~1 minuto o site fica disponível em `https://SEU_USUARIO.github.io/imob-news/`.

3. **Habilite a Action**: aba **Actions** → se pedir, clique em *I understand... enable workflows*.
   Para permitir que ela faça commit do `news.json`:
   **Settings** → **Actions** → **General** → *Workflow permissions* →
   marque **Read and write permissions** → **Save**.

4. **Rode a busca pela primeira vez**: aba **Actions** → *Atualizar notícias* →
   **Run workflow**. Depois disso ela roda sozinha no horário agendado.

## Personalizar a marca da imobiliária

Abra o `index.html` e edite o bloco **CONFIG** (perto do fim do arquivo):

```js
const CONFIG = {
  agencyName: "Sua Imobiliária",
  handle: "@suaimobiliaria",
  brand: "#0f3d2e",     // cor principal
  accent: "#c8a24a",    // cor de destaque
  logoUrl: "logo.png",  // opcional: suba um logo.png no repositório
};
```

Para que as cores do topo da página também mudem, ajuste `--brand` e `--accent`
no bloco `:root` do CSS (no topo do mesmo arquivo).

## Ajustar a frequência ou as fontes da busca

- **Frequência**: edite o `cron` em `.github/workflows/update-news.yml`
  (atualmente 11h, 16h e 21h UTC ≈ 08h, 13h e 18h de Brasília).
- **Temas buscados**: edite a lista `QUERIES` em `scripts/fetch-news.mjs`.

## Testar localmente (opcional)

Como a página usa `fetch`, abra via um servidor local (não direto no `file://`):

```bash
node scripts/fetch-news.mjs   # atualiza news.json
python3 -m http.server 8000   # acesse http://localhost:8000
```
