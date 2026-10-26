/* Igor Carvalho - portfólio: tradução PT <-> EN (botão "EN/PT" ao lado do botão de tema).
   Como funciona: o site é escrito em português. Ao escolher inglês, este arquivo troca cada texto pelo
   equivalente do dicionário abaixo (textos, alt de imagens, aria-label, <title>, meta). Também traduz o que o
   JavaScript cria depois (bolhas, etapas do processo, legendas do Instagram...). A escolha fica salva no navegador.
   Para um texto novo: adicione uma linha  "texto em português": "English text",  no dicionário (DICT).
   No console do navegador, I18N.missing() lista os textos da página que ainda não têm tradução. */
(function () {
  'use strict';
  var DICT = {
    "Igor Carvalho | Diretor de Arte e UI Designer": "Igor Carvalho | Art Director & UI Designer",
    "Igor Carvalho, Diretor de Arte e UI Designer. Identidade visual, naming, redes sociais e landing pages. Disponível para novos projetos.": "Igor Carvalho, Art Director and UI Designer. Visual identity, naming, social media and landing pages. Available for new projects.",
    "Igor Carvalho: marcas, sites e coisas que funcionam": "Igor Carvalho: brands, sites and things that work",
    "Capa em construção": "Cover coming soon",
    "E-mail copiado": "Email copied",
    "Sobre": "About",
    "Serviços": "Services",
    "Projetos": "Projects",
    "Processo": "Process",
    "Agendar ↗": "Book a call ↗",
    "Alternar tema claro e escuro": "Toggle light and dark theme",
    "Abrir menu": "Open menu",
    "Diretor de Arte e UI Designer": "Art Director & UI Designer",
    "Disponível para novos projetos": "Available for new projects",
    "Marcas, sites": "Brands, sites",
    "e coisas que": "and things that",
    "funcionam.": "work.",
    "Crio identidades visuais, projetos digitais e soluções criativas que dão vida a marcas e conectam ideias às pessoas.": "I create visual identities, digital projects and creative solutions that bring brands to life and connect ideas with people.",
    "Agendar conversa →": "Book a call →",
    "Ver projetos": "View projects",
    "Sobre mim": "About me",
    "Estoure uma bolha.": "Pop a bubble.",
    "Me conheça.": "Get to know me.",
    "Cada bolha guarda uma curiosidade sobre mim: do que me inspira até o que tem na minha playlist de trabalho.": "Each bubble holds a fun fact about me: from what inspires me to what's on my work playlist.",
    "↻ Reiniciar": "↻ Restart",
    "O que eu": "What I",
    "posso": "can",
    "construir.": "build.",
    "Do nome ao site no ar: soluções visuais e digitais para marcas que querem ser lembradas.": "From the name to the live site: visual and digital solutions for brands that want to be remembered.",
    "Identidade visual": "Visual identity",
    "Logo, paleta, tipografia e diretrizes para a marca ter uma presença coerente em qualquer lugar.": "Logo, palette, typography and guidelines so the brand has a consistent presence everywhere.",
    "Sistema": "System",
    "Guia": "Guide",
    "Nomes memoráveis, pensados com conceito e posicionamento, prontos para virar marca.": "Memorable names, built on concept and positioning, ready to become a brand.",
    "Conceito": "Concept",
    "Marca": "Brand",
    "Estruturação de perfil": "Profile setup",
    "Bio, destaques, grid e linha visual para o seu perfil comunicar com clareza quem você é.": "Bio, highlights, grid and visual language so your profile clearly communicates who you are.",
    "Destaques": "Highlights",
    "Gestão de redes sociais": "Social media management",
    "Planejamento, criação e publicação de conteúdo com consistência visual e estratégica.": "Planning, creation and publishing of content with visual and strategic consistency.",
    "Planejamento": "Planning",
    "Conteúdo": "Content",
    "Calendário": "Calendar",
    "Páginas objetivas, rápidas e responsivas, pensadas para transformar visitas em contatos.": "Focused, fast and responsive pages, designed to turn visits into leads.",
    "Conversão": "Conversion",
    "Edição de vídeos": "Video editing",
    "Cortes, ritmo e motion em vídeos curtos que prendem a atenção e reforçam a marca.": "Cuts, pacing and motion in short videos that grab attention and reinforce the brand.",
    "Corte": "Cut",
    "Projetos selecionados": "Selected projects",
    "Ideias que": "Ideas that",
    "ganharam": "took",
    "forma.": "shape.",
    "Abra com dois dedos sobre um card para ver a capa": "Spread two fingers over a card to see the cover",
    "Design para redes sociais": "Social media design",
    "Ver projeto →": "View project →",
    "Ver o próximo projeto": "See the next project",
    "← Voltar": "← Back",
    "Processo · role para girar": "Process · scroll to rotate",
    "Como eu": "How I",
    "trabalho.": "operate.",
    "Começar projeto →": "Start a project →",
    "EM BREVE — BASTIDORES — REFERÊNCIAS — PROCESSOS — EM BREVE — BASTIDORES — REFERÊNCIAS — PROCESSOS —": "COMING SOON — BEHIND THE SCENES — REFERENCES — PROCESS — COMING SOON — BEHIND THE SCENES — REFERENCES — PROCESS —",
    "NEWSLETTER — EM CONSTRUÇÃO — NEWSLETTER — EM CONSTRUÇÃO — NEWSLETTER — EM CONSTRUÇÃO —": "NEWSLETTER — UNDER CONSTRUCTION — NEWSLETTER — UNDER CONSTRUCTION — NEWSLETTER — UNDER CONSTRUCTION —",
    "Ideias em": "Ideas in the",
    "preparo.": "making.",
    "Em breve, bastidores, referências e processos de criação direto na sua caixa de entrada.": "Coming soon: behind the scenes, references and creative processes straight to your inbox.",
    "Em construção": "Under construction",
    "Contato": "Contact",
    "Vamos": "Let's",
    "conversar?": "talk?",
    "Escolha um dia e um horário para uma conversa rápida sobre o seu projeto.": "Pick a day and time for a quick chat about your project.",
    "Agenda": "Schedule",
    "Agendar conversa": "Book a call",
    "Identidades visuais, projetos digitais e soluções criativas que movem a sua marca.": "Visual identities, digital projects and creative solutions that move your brand.",
    "Novidades em breve": "News coming soon",
    "Newsletter em construção": "Newsletter under construction",
    "Links rápidos": "Quick links",
    "Início": "Home",
    "Fale comigo": "Get in touch",
    "Me siga": "Follow me",
    "© 2026 Igor Carvalho. Todos os direitos reservados.": "© 2026 Igor Carvalho. All rights reserved.",
    "Voltar ao topo ↑": "Back to top ↑",
    "Nome do Projeto | Igor Carvalho": "Project Name | Igor Carvalho",
    "Nome do Projeto": "Project Name",
    "Escreva aqui a descrição do projeto.": "Write the project description here.",
    "Sobre o projeto": "About the project",
    "Clique aqui para ver os stories": "Click here to see the stories",
    "Os posts com este ícone": "Posts with this icon",
    "no canto são carrosséis: têm mais de uma tela. Clique em um post para abrir.": "in the corner are carousels: they have more than one screen. Click a post to open.",
    "Frase curta do perfil.": "Short profile tagline.",
    "Descreva o post": "Describe the post",
    "Imagem em breve": "Image coming soon",
    "Projeto desenvolvido através da agência Luz Própria.": "Project developed through the agency Luz Própria.",
    "Médico Oftalmológico": "Ophthalmologist",
    "Estrategista em Delivery": "Delivery Strategist",
    "Imóveis de Alto Padrão": "Luxury Real Estate",
    "Gerenciamento de Obras": "Construction Management",
    "Acessoria Empresarial": "Business Consulting",
    "Química Industrial": "Industrial Chemistry",
    "“Algum Criativo” é um estúdio de design que transcende o convencional, fundamentado na premissa de que cada projeto é uma oportunidade de criar algo único e impactante. Mais do que uma agência, é um espaço onde ideias ganham vida e visões se tornam realidade.": "“Algum Criativo” is a design studio that goes beyond the conventional, grounded in the premise that every project is an opportunity to create something unique and impactful. More than an agency, it is a space where ideas come to life and visions become reality.",
    "Seu logo distintivo, com a letra “A” reinventada e uma estrela cintilante, simboliza um portal para a imaginação e o nascimento das melhores ideias. Com uma gama diversificada de serviços, “Algum Criativo” não se limita a atender clientes; eleva suas expectativas. Especializado em identidades visuais, o estúdio trata cada projeto com cuidado meticuloso, desde a concepção até a execução.": "Its distinctive logo, with a reinvented letter “A” and a twinkling star, symbolizes a portal to the imagination and the birth of the best ideas. With a diverse range of services, “Algum Criativo” doesn't just serve clients; it raises their expectations. Specializing in visual identities, the studio treats each project with meticulous care, from conception through execution.",
    "“LOPESARQ” é um estúdio de arquitetura que surge para redefinir padrões estéticos e funcionais, ancorado nos princípios da Tríade Vitruviana: Firmitas, Utilitas e Venustas. O logo do estúdio é uma síntese dessas ideias, começando com a letra \"Lo\", que simboliza Firmitas e representa a estabilidade, o alicerce de todo o conceito. Influenciado pela Bauhaus, a letra \"O\" apresenta um círculo vazado com linhas geométricas, personificando Utilitas e destacando a harmonia entre forma e função no design arquitetônico contemporâneo.": "“LOPESARQ” is an architecture studio created to redefine aesthetic and functional standards, anchored in the principles of the Vitruvian Triad: Firmitas, Utilitas and Venustas. The studio's logo is a synthesis of these ideas, starting with the letters \"Lo\", which symbolize Firmitas and represent stability, the foundation of the entire concept. Influenced by the Bauhaus, the letter \"O\" features a hollow circle with geometric lines, embodying Utilitas and highlighting the harmony between form and function in contemporary architectural design.",
    "Para capturar a essência de Venustas, o estúdio incorpora o formato de pontas de moldura clássica nas extremidades do “L”. Este detalhe confere uma camada de elegância ao logo e sugere que o trabalho de “LOPESARQ” vai além da construção de espaços funcionais, criando verdadeiras obras de arte arquitetônicas.": "To capture the essence of Venustas, the studio incorporates the shape of classical molding tips at the ends of the “L”. This detail adds a layer of elegance to the logo and suggests that the work of “LOPESARQ” goes beyond building functional spaces, creating true architectural works of art.",
    "A Serenia Aromas é uma marca de velas aromáticas e perfumes para casa que convida os clientes a uma experiência sensorial única, onde cada fragrância é uma porta para um universo de tranquilidade e reflexão. Inspirada nos conceitos de portais, mosaicos e a luz do sol, a identidade visual da Serenia evoca a ideia de atravessar um limiar para um estado de serenidade e bem-estar. Para o logotipo, trabalhamos com linhas finas e formas geométricas que simbolizam um portal, enquanto a paleta de cores combina tons profundos e suaves para representar elegância e introspecção. A tipografia mistura modernidade e fluidez, refletindo o espírito de leveza e harmonia da marca. Cada vela e perfume não apenas complementa um ambiente, mas também transforma o espaço, criando um refúgio sensorial que permite ao usuário imergir em diferentes universos emocionais.": "Serenia Aromas is a brand of scented candles and home fragrances that invites customers into a unique sensory experience, where each fragrance is a doorway to a universe of tranquility and reflection. Inspired by the concepts of portals, mosaics and sunlight, Serenia's visual identity evokes the idea of crossing a threshold into a state of serenity and well-being. For the logotype, we worked with fine lines and geometric shapes that symbolize a portal, while the color palette combines deep and soft tones to convey elegance and introspection. The typography blends modernity and fluidity, reflecting the brand's spirit of lightness and harmony. Each candle and fragrance not only complements a space but also transforms it, creating a sensory refuge that lets the user immerse themselves in different emotional universes.",
    "Bento grid, várias aplicações do logo Algum Criativo": "Bento grid with several applications of the Algum Criativo logo",
    "mockup cartão de visita do Algum Criativo": "Algum Criativo business card mockup",
    "Letreiro com o logo Algum Criativo sobre bloco de concreto": "Sign with the Algum Criativo logo on a concrete block",
    "Slogan \"Alguma coisa criativa.\" em branco sobre fundo preto": "Slogan \"Alguma coisa criativa.\" in white on a black background",
    "Monitor de computador antigo exibindo o símbolo da marca em tela vermelha": "Old computer monitor showing the brand symbol on a red screen",
    "Fita adesiva preta com estrelas e flores da identidade visual": "Black tape with stars and flowers from the visual identity",
    "Três cartões da marca: bege quadriculado, vermelho com o símbolo e verde-menta com texto circular": "Three brand cards: beige checkered, red with the symbol and mint green with circular text",
    "Chaveiro preto com o nome Algum Criativo sobre fundo verde-menta": "Black keychain with the name Algum Criativo on a mint green background",
    "Construção geométrica do símbolo da marca em vermelho": "Geometric construction of the brand symbol in red",
    "Elemento gráfico vermelho com estrela de quatro pontas sobre fundo preto": "Red graphic element with a four-pointed star on a black background",
    "Logotipo Algum Criativo em bege sobre fundo verde-menta": "Algum Criativo logotype in beige on a mint green background",
    "Símbolo vermelho da marca sobre fundo bege": "Red brand symbol on a beige background",
    "Logotipo Algum Criativo em bege sobre fundo vermelho": "Algum Criativo logotype in beige on a red background",
    "Cartão de visita verde da Lopes ARQ sobre couro marrom": "Green Lopes ARQ business card on brown leather",
    "Cartazes da Lopes ARQ em uma vitrine de rua com frases institucionais": "Lopes ARQ posters in a street window with institutional phrases",
    "Construção geométrica do símbolo da Lopes ARQ sobre fundo verde-escuro": "Geometric construction of the Lopes ARQ symbol on a dark green background",
    "Tapume de obra com o aviso \"Em breve um novo ambiente\" e o logo da Lopes ARQ": "Construction hoarding with the notice \"Em breve um novo ambiente\" and the Lopes ARQ logo",
    "Porta-copo verde com o símbolo da Lopes ARQ ao lado de um copo d'água": "Green coaster with the Lopes ARQ symbol next to a glass of water",
    "Três posts de Instagram da Lopes ARQ: verde, sala de estar e bege": "Three Lopes ARQ Instagram posts: green, living room and beige",
    "Paleta de cores da Lopes ARQ com códigos CMYK, RGB e hexadecimais": "Lopes ARQ color palette with CMYK, RGB and hex codes",
    "Símbolo da Lopes ARQ sobre uma sala de estar em tons de bege": "Lopes ARQ symbol over a living room in beige tones",
    "Vela aromática Flor de Cerejeira entre flores de cerejeira": "Flor de Cerejeira scented candle among cherry blossoms",
    "Logotipo da Serenia em bege sobre fundo azul-petróleo": "Serenia logotype in beige on a teal background",
    "Cartões de visita da Serenia": "Serenia business cards",
    "Versões do logotipo da Serenia Aromas": "Serenia Aromas logotype versions",
    "Potes de velas aromáticas Serenia com rótulos Lavanda Francesa, Flor de Cerejeira, Frutas Vermelhas, Limão Siciliano e Âmbar": "Serenia scented candle jars with labels Lavanda Francesa, Flor de Cerejeira, Frutas Vermelhas, Limão Siciliano and Âmbar",
    "Padrão gráfico geométrico da Serenia": "Serenia geometric graphic pattern",
    "Velas aromáticas da Serenia com rótulos da identidade visual": "Serenia scented candles with labels from the visual identity",
    "Post para redes sociais da Serenia": "Serenia social media post",
    "Post com padrão geométrico da Serenia": "Post with Serenia geometric pattern",
    "Papelaria da Serenia": "Serenia stationery",
    "Aba de navegador Serenia Aromas - Loja Oficial": "Browser tab Serenia Aromas - Loja Oficial",
    "Símbolo da Serenia sobre fundo escuro": "Serenia symbol on a dark background",
    "Post anterior": "Previous post",
    "Próximo post": "Next post",
    "Slide anterior": "Previous slide",
    "Próximo slide": "Next slide",
    "Story anterior": "Previous story",
    "Próximo story": "Next story",
    "Fechar": "Close",
    "Abrir": "Open",
    "Fechar ✕": "Close ✕",
    "Formato": "Format",
    "Retomar": "Resume",
    "Pausar": "Pause",
    "Post estático": "Static post",
    "Copiar": "Copy",
    "Copiado!": "Copied!",
    "Arrastar": "Drag",
    "Redimensionar": "Resize",
    "☀ Claro": "☀ Light",
    "☾ Escuro": "☾ Dark",
    "Trajetória": "Background",
    "Formação": "Education",
    "Formado em Publicidade e Design Gráfico.": "Degree in Advertising and Graphic Design.",
    "Profissão": "Profession",
    "Multidisciplinar": "Multidisciplinary",
    "Atuo entre branding, direção de arte e UI Design.": "I work across branding, art direction and UI Design.",
    "Curiosidade": "Fun fact",
    "100% remoto": "100% remote",
    "Trabalho remotamente desde meu primeiro estágio.": "I've worked remotely since my first internship.",
    "Personalidade": "Personality",
    "Autodidata": "Self-taught",
    "Aprendo explorando, testando e criando.": "I learn by exploring, testing and making.",
    "Especialidade": "Specialty",
    "Tipografia": "Typography",
    "Tenho um carinho especial pelas formas das letras.": "I have a special fondness for the shapes of letters.",
    "Pessoal": "Personal",
    "Arte desde cedo": "Art from an early age",
    "Desenho e pintura fazem parte da minha vida desde a infância.": "Drawing and painting have been part of my life since childhood.",
    "Além do logo": "Beyond the logo",
    "Crio sistemas visuais que vão além de símbolos.": "I create visual systems that go beyond symbols.",
    "Transformo ideias em interfaces e experiências digitais.": "I turn ideas into interfaces and digital experiences.",
    "Inspiração": "Inspiration",
    "Olhar visual": "Visual eye",
    "Fotografia e audiovisual alimentam minha criatividade.": "Photography and audiovisual work fuel my creativity.",
    "Colecionador de sons": "Sound collector",
    "Vinis, música e descobertas sonoras fazem parte do meu universo.": "Vinyl, music and sonic discoveries are part of my universe.",
    "Direção de arte": "Art direction",
    "Descoberta": "Discovery",
    "Entendo os objetivos, o público e o contexto antes de definir qualquer direção criativa.": "I understand the goals, the audience and the context before defining any creative direction.",
    "Estratégia": "Strategy",
    "Organizo ideias, referências e conceitos para encontrar o caminho mais adequado ao projeto.": "I organize ideas, references and concepts to find the path best suited to the project.",
    "Criação": "Creation",
    "Transformo a estratégia em soluções visuais, explorando formas, cores, tipografia e experiências.": "I turn strategy into visual solutions, exploring shapes, color, typography and experiences.",
    "Entrega": "Delivery",
    "Finalizo os arquivos e entrego tudo pronto para uso.": "I finalize the files and hand over everything ready to use.",
    "Título em breve...": "Title coming soon...",
    "Descrição em breve...": "Description coming soon...",
    "Título do post estático": "Static post title",
    "Título do carrossel": "Carousel title",
    "Outro post estático": "Another static post",
    "Explique o conceito do post em uma ou duas frases.": "Explain the post concept in one or two sentences.",
    "Explique o conceito do carrossel. Os slides seguem a ordem das imagens.": "Explain the carousel concept. The slides follow the order of the images.",
    "Conceito do post.": "Post concept.",
    "Não confunda estabilidade com progresso": "Don't confuse stability with progress",
    "É falta de planejamento": "It's a lack of planning",
    "Você merece mais do que 3 pedidos por dia no iFood": "You deserve more than 3 orders a day on iFood",
    "Vaga aberta para corretor de imóveis": "Open position for real estate agent",
    "Uma mentalidade positiva": "A positive mindset",
    "Transforme seu delivery em lucro real": "Turn your delivery into real profit",
    "Sua obra com orçamento e cronograma bem definidos": "Your project with a well-defined budget and schedule",
    "Seu delivery não sai do lugar?": "Is your delivery business stuck?",
    "Remocil: só existe um": "Remocil: there is only one",
    "Remocil 270: a revolução na pavimentação": "Remocil 270: the revolution in paving",
    "Proporcione à sua família o estilo de vida que ela merece!": "Give your family the lifestyle they deserve!",
    "Problemas na obra não se resolvem sozinhos": "Problems on the job site don't solve themselves",
    "Para a sua conquista, conte com a nossa expertise": "For your achievement, count on our expertise",
    "O tempo é um recurso limitado": "Time is a limited resource",
    "O sucesso da obra começa antes do seu início": "A project's success starts before it begins",
    "Mais de 42 anos de inteligência química aplicada": "Over 42 years of applied chemical intelligence",
    "Light Steel Frame vs Alvenaria": "Light Steel Frame vs Masonry",
    "Imóvel na planta: mais vantajoso do que você imagina": "Off-plan property: more advantageous than you think",
    "Feliz Ano Novo": "Happy New Year",
    "Etapas da sua primeira consulta até a cirurgia": "Steps from your first consultation to surgery",
    "Esses são os valores por trás da sua obra": "These are the values behind your project",
    "Desengraxante hidrossolúvel de baixa espuma": "Low-foam water-soluble degreaser",
    "Cuidado com imitações… Remocil só existe um": "Beware of imitations… there is only one Remocil",
    "Cirurgias que realizo para cuidar da sua visão": "Surgeries I perform to care for your vision",
    "Chega de soluções genéricas": "Enough of generic solutions",
    "Cada cirurgia que eu realizo para cuidar da sua visão": "Every surgery I perform to take care of your vision",
    "Apartamentos de alto padrão por até R$ 1.200.000": "Luxury apartments for up to R$ 1,200,000",
    "Antes de adquirir o seu futuro lar, pense nisso…": "Before buying your future home, think about this…",
    "Antes & Depois": "Before & After",
    "A verdade sobre o delivery...": "The truth about delivery...",
    "3 condomínios fechados com alta segurança em Presidente Prudente": "3 gated communities with high security in Presidente Prudente",
    "Simulação do app Notas, com texto selecionado, para um tom direto e cotidiano.": "Simulation of the Notes app, with selected text, for a direct and everyday tone.",
    "Interface de editor com seleção e botão “Deletar” como metáfora de trocar a mentalidade.": "Editor interface with a selection and a “Delete” button as a metaphor for changing your mindset.",
    "Ilustração central da ampulheta separa a frase em duas metades, como o próprio fluxo da areia.": "The central hourglass illustration splits the phrase into two halves, like the flow of the sand itself.",
    "Blocos de cor que se deslocam como um slider de edição: o layout “arrasta” a mensagem.": "Color blocks that shift like an editing slider: the layout “drags” the message.",
    "Fundos escuro e claro se alternam e a curva de transição continua de um slide para o outro.": "Dark and light backgrounds alternate and the transition curve continues from one slide to the next."
  };

  var REV = {}, k;
  for (k in DICT) if (!(DICT[k] in REV)) REV[DICT[k]] = k;

  /* padrões com número/nome no meio. A = português -> inglês, B = inglês -> português */
  function tags(s, f) { return s.split(', ').map(f).join(', '); }
  function parts(s, f) { return s.split(' · ').map(f).join(' · '); }
  var RULES = [
    [/^Etapa (\d+)$/, 'Step $1', /^Step (\d+)$/, 'Etapa $1'],
    [/^Bolha (\d+)$/, 'Bubble $1', /^Bubble (\d+)$/, 'Bolha $1'],
    [/^Carrossel · (\d+) slides$/, 'Carousel · $1 slides', /^Carousel · (\d+) slides$/, 'Carrossel · $1 slides'],
    [/^Carrossel, slide (\d+)(?: de (\d+))?$/, function (m) { return 'Carousel, slide ' + m[1] + (m[2] ? ' of ' + m[2] : ''); },
     /^Carousel, slide (\d+)(?: of (\d+))?$/, function (m) { return 'Carrossel, slide ' + m[1] + (m[2] ? ' de ' + m[2] : ''); }],
    [/^Foto de perfil de (.+)$/, 'Profile photo of $1', /^Profile photo of (.+)$/, 'Foto de perfil de $1'],
    [/^Abrir projeto (.+)$/, 'Open project $1', /^Open project (.+)$/, 'Abrir projeto $1'],
    [/^Ver stories de (.+)$/, 'View stories from $1', /^View stories from (.+)$/, 'Ver stories de $1'],
    [/^Abrir post: (.+)$/, function (m) { return 'Open post: ' + toEn(m[1]); }, /^Open post: (.+)$/, function (m) { return 'Abrir post: ' + toPt(m[1]); }],
    [/^Post: (.+)$/, function (m) { return 'Post: ' + toEn(m[1]); }, /^Post: (.+)$/, function (m) { return 'Post: ' + toPt(m[1]); }],
    [/^Projeto (.+) por Igor Carvalho: (.+)\.$/, function (m) { return 'Project ' + m[1] + ' by Igor Carvalho: ' + tags(m[2], toEn) + '.'; },
     /^Project (.+) by Igor Carvalho: (.+)\.$/, function (m) { return 'Projeto ' + m[1] + ' por Igor Carvalho: ' + tags(m[2], toPt) + '.'; }],
    [/^(.+), projeto de Igor Carvalho$/, '$1, project by Igor Carvalho', /^(.+), project by Igor Carvalho$/, '$1, projeto de Igor Carvalho'],
    [/^(\[ \d+ \]) (.+)$/, function (m) { return m[1] + ' ' + parts(m[2], toEn); }, /^(\[ \d+ \]) (.+)$/, function (m) { return m[1] + ' ' + parts(m[2], toPt); }]
  ];

  function toEn(s) {
    if (DICT.hasOwnProperty(s)) return DICT[s];
    for (var i = 0; i < RULES.length; i++) { var r = RULES[i], m = r[0].exec(s); if (m) return typeof r[1] === 'function' ? r[1](m) : s.replace(r[0], r[1]); }
    return s;
  }
  function toPt(s) {
    if (REV.hasOwnProperty(s)) return REV[s];
    for (var i = 0; i < RULES.length; i++) { var r = RULES[i], m = r[2].exec(s); if (m) return typeof r[3] === 'function' ? r[3](m) : s.replace(r[2], r[3]); }
    return s;
  }

  var lang = 'pt', observer = null;
  var conv = function (s) { return lang === 'en' ? toEn(s) : toPt(s); };
  var ATTRS = ['alt', 'aria-label', 'placeholder', 'title'];
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1 };

  function text(n) {
    var v = n.nodeValue; if (!v || !/\S/.test(v)) return;
    var m = /^(\s*)([\s\S]*?)(\s*)$/.exec(v), o = conv(m[2]);
    if (o !== m[2]) n.nodeValue = m[1] + o + m[3];
  }
  function attrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute && el.getAttribute(a);
      if (v) { var o = conv(v); if (o !== v) el.setAttribute(a, o); }
    }
  }
  function walk(root) {
    if (root.nodeType === 3) { if (!SKIP[root.parentNode && root.parentNode.nodeName]) text(root); return; }
    if (root.nodeType !== 1 || SKIP[root.nodeName]) return;
    attrs(root);
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  var METAS = 'meta[name="description"],meta[property="og:title"],meta[property="og:description"],meta[property="og:image:alt"],meta[name="twitter:title"],meta[name="twitter:description"]';
  function head() {
    var t = document.title, o = conv(t); if (o !== t) document.title = o;
    [].forEach.call(document.querySelectorAll(METAS), function (m) { var v = m.getAttribute('content'), o = v && conv(v); if (o && o !== v) m.setAttribute('content', o); });
    var og = document.querySelector('meta[property="og:locale"]'); if (og) og.setAttribute('content', lang === 'en' ? 'en_US' : 'pt_BR');
  }

  /* links e iframe que dependem do idioma */
  var WA_EN = 'Hi! I came through the link and would like more information.';
  function links() {
    [].forEach.call(document.querySelectorAll('a[href*="api.whatsapp.com"]'), function (a) {
      var h = a.getAttribute('href'); if (h.indexOf('text=') < 0 && !a.dataset.hrefPt) return;
      if (!a.dataset.hrefPt) a.dataset.hrefPt = h;
      if (lang === 'en') { try { var u = new URL(a.dataset.hrefPt); u.searchParams.set('text', WA_EN); a.setAttribute('href', u.toString()); } catch (e) {} }
      else a.setAttribute('href', a.dataset.hrefPt);
    });
    [].forEach.call(document.querySelectorAll('.cal iframe'), function (f) {
      var s = f.getAttribute('src'); if (!f.dataset.srcPt) f.dataset.srcPt = s;
      var want = lang === 'en' ? f.dataset.srcPt + (f.dataset.srcPt.indexOf('?') < 0 ? '?' : '&') + 'hl=en' : f.dataset.srcPt;
      if (s !== want) f.setAttribute('src', want);
    });
  }

  function button() {
    var b = document.getElementById('lg'); if (!b) return;
    b.textContent = lang === 'en' ? 'PT' : 'EN';
    b.setAttribute('aria-label', lang === 'en' ? 'Mudar o site para português' : 'Switch site to English');
    b.setAttribute('aria-pressed', lang === 'en');
  }

  function watch(on) {
    if (observer) { observer.disconnect(); observer = null; }
    if (!on || !window.MutationObserver) return;
    observer = new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'childList') [].forEach.call(m.addedNodes, walk);
        else if (m.type === 'characterData') { if (!SKIP[m.target.parentNode && m.target.parentNode.nodeName]) text(m.target); }
        else if (m.type === 'attributes') attrs(m.target);
      });
    });
    observer.observe(document.documentElement, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }

  function set(l, save) {
    lang = l === 'en' ? 'en' : 'pt';
    document.documentElement.lang = lang === 'en' ? 'en' : 'pt-BR';
    if (save) try { localStorage.setItem('lang', lang); } catch (e) {}
    watch(false); walk(document.documentElement); head(); links(); button(); watch(lang === 'en');
    try { dispatchEvent(new Event('langchange')); } catch (e) {}
  }

  var saved = null;
  try { saved = localStorage.getItem('lang'); } catch (e) {}
  if (saved === 'en') set('en', false); else { button(); }

  var btn = document.getElementById('lg');
  if (btn) btn.addEventListener('click', function () { set(lang === 'en' ? 'pt' : 'en', true); });

  /* ferramenta para quem edita o site: lista textos sem tradução (rode I18N.missing() no console, com o site em inglês) */
  window.I18N = {
    get lang() { return lang; }, set: set, t: function (s) { return conv(s); },
    missing: function () {
      var out = {}, w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), n;
      while ((n = w.nextNode())) { var v = n.nodeValue.trim(); if (v && !SKIP[n.parentNode.nodeName] && /[A-Za-zÀ-ú]{3,}/.test(v) && toEn(v) === v && toPt(v) === v) out[v] = 1; }
      return Object.keys(out);
    }
  };

  /* FERRAMENTA DE TRADUÇÃO: abra qualquer página com ?traducao no endereço (ex.: projetos/prop.html?traducao).
     Ela muda para inglês e lista, num quadro preto, os textos sem tradução já no formato do DICT, para copiar e preencher. */
  if (/[?&]traducao/.test(location.search)) addEventListener('load', function () {
    setTimeout(function () { set('en', false); setTimeout(function () {
      var m = window.I18N.missing(), pre = document.createElement('pre');
      pre.style.cssText = 'position:fixed;z-index:99999;right:12px;bottom:12px;max-width:min(92vw,720px);max-height:60vh;overflow:auto;background:#111;color:#e8e6df;padding:14px;font:12px/1.5 monospace;white-space:pre-wrap;border:1px solid #CA271C';
      pre.textContent = m.length ? 'TEXTOS SEM TRADUÇÃO (' + m.length + ')\nCopie as linhas, escreva o inglês depois dos dois pontos e cole dentro do DICT em js/i18n.js:\n\n' + m.map(function (s) { return '    ' + JSON.stringify(s) + ': "",'; }).join('\n') : 'Tudo traduzido nesta página ✔';
      document.body.appendChild(pre);
    }, 700); }, 1000);
  });
})();
