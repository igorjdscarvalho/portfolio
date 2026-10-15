# Portfólio Igor C.

Site estático (HTML + CSS + JavaScript puro), sem build e sem dependências.

## Estrutura

```
index.html          página principal
css/style.css       estilos (inclui o @font-face da Sora)
js/main.js          tema claro/escuro, copiar e-mail, hover dos botões, cursor "Abrir"
assets/img/         imagens dos projetos (WebP 700/1400 + JPG de fallback)
assets/fonts/       fonte Sora (woff2, hospedada junto, sem Google Fonts)
assets/favicon.svg  ícone da aba
robots.txt          instruções para buscadores
```

## Como publicar

Suba o CONTEÚDO da pasta (não a pasta em si) para a raiz do site: o `index.html` precisa ficar
na raiz (`public_html` em Hostinger, Hostgator e Locaweb). Em Netlify, Vercel ou Cloudflare Pages,
basta arrastar a pasta.

## Depois de publicar (SEO)

1. No `<head>` do `index.html`, adicione: `<link rel="canonical" href="https://SEU-DOMINIO.com/">`
2. Adicione `<meta property="og:url" content="https://SEU-DOMINIO.com/">` e um `og:image` (URL completa, imagem 1200x630).
3. Crie um `sitemap.xml` com a URL da página e referencie no `robots.txt`.
4. Cadastre o site no Google Search Console.

## Onde editar

- Links e e-mail: `index.html`, seção "Entre em contato".
- Cores, fontes e espaçamentos: variáveis no topo de `css/style.css`.
- Respiro do scroll dos projetos: `--pad-y` (topo/base) e `--pad-x` (laterais) em `.work`, no `css/style.css`.
