# Viggio · Notícias do Mercado + Gerador de Posts

Site estático que **busca automaticamente** notícias **positivas** do mercado imobiliário de
alto padrão da Zona Leste (Tatuapé, Anália Franco, Mooca) e permite **gerar um post 1080×1350
para o Instagram** — com **imagem de fundo e o título por cima**. Roda 100% no GitHub
(GitHub Pages + GitHub Actions), sem servidor e sem custo. Marca Viggio, fonte **Outfit**.

## Destaques

- **Só notícias positivas**: o script descarta manchetes com palavras negativas
  (queda, crise, despejo, etc.). Edite as listas em `scripts/fetch-news.mjs`.
- **Foco na região/alto padrão**: buscas por Tatuapé, Mooca, Anália Franco, Eixo Platina e luxo.
- **Post com foto de fundo**: no gerador, suba uma foto do imóvel/bairro; o título entra por
  cima com um leve escurecimento para leitura, e o logo "viggio" no rodapé.

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

## Logo oficial (opcional)

O post já desenha o wordmark "viggio" em vetor. Se quiser usar o **PNG oficial** (branco,
fundo transparente, fica melhor sobre a foto):

1. Suba o arquivo no repositório como `logo.png`.
2. No `index.html`, no bloco **CONFIG**, troque `logoUrl: ""` por `logoUrl: "logo.png"`.

## Buscar fotos grátis no gerador (Pexels)

No gerador de post você pode **buscar fotos gratuitas** (uso comercial liberado) ou **subir a sua
própria foto**. Para ativar a busca, gere uma chave gratuita do Pexels:

1. Acesse https://www.pexels.com/api/ e clique em "Get Started" (crie conta grátis).
2. Copie sua **API Key**.
3. No `index.html`, bloco **CONFIG**, cole em `pexelsApiKey: "SUA_CHAVE_AQUI"`.

Pronto: digite um termo (ex.: "apartamento luxo", "sala moderna", "São Paulo"), clique numa foto
e ela vira o fundo do post. O upload de foto própria funciona mesmo sem a chave.

## Personalizar a marca

No `index.html`, bloco **CONFIG** (perto do fim do arquivo):

```js
const CONFIG = {
  agencyName: "viggio",
  handle: "@viggioimoveis",
  brand: "#0a0a0a",   // cor de fundo padrão (quando não há foto)
  font: "Outfit",
  logoUrl: "",        // "logo.png" para usar o PNG oficial
};
```

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
