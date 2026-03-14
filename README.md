# 🌐 Tradutor MSA — Extensão de Navegador

<div align="center">

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)

**Extensão leve e gratuita para tradução instantânea — com voz, histórico e menu de contexto. Disponível para Edge e Chrome.**

[![Edge Store](https://img.shields.io/badge/Microsoft%20Edge-Instalar%20Agora-0078D7?style=for-the-badge&logo=microsoftedge&logoColor=white)](https://microsoftedge.microsoft.com/addons/detail/tradutor-r%C3%A1pido-edge/dkojdeehfjpjphkndhagfbhknnlckami)
[![Chrome Web Store](https://img.shields.io/badge/Chrome%20Web%20Store-Em%20breve-AAAAAA?style=for-the-badge&logo=googlechrome&logoColor=white)](#)

![Version](https://img.shields.io/badge/versão-2.1-blue)
![License](https://img.shields.io/badge/licença-MIT-green)

</div>

---

## ✨ Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| 🌍 **Tradução Instantânea** | Tradução via MyMemory API com suporte a dezenas de idiomas |
| 🔍 **Detecção Automática** | Detecta o idioma de origem automaticamente |
| 🎤 **Entrada por Voz** | Fale e a extensão converte para texto e traduz |
| 🔊 **Leitura em Voz Alta** | Ouve a tradução com seleção de voz e idioma |
| 🔄 **Trocar Idiomas** | Inverte origem/destino com um clique, trocando os textos junto |
| 📋 **Copiar com 1 Clique** | Copia o texto original ou traduzido para o clipboard |
| 🖱️ **Menu de Contexto** | Selecione texto em qualquer página e traduza com botão direito |
| 📜 **Histórico** | Armazena até 20 traduções recentes — clique para recarregar |
| 💾 **Salva Preferências** | Lembra os idiomas usados na última sessão |

---

## 📦 Instalação

### Microsoft Edge *(disponível agora)*
1. Acesse a [Edge Add-ons Store](https://microsoftedge.microsoft.com/addons/detail/tradutor-r%C3%A1pido-edge/dkojdeehfjpjphknddagfbhknnlckami)
2. Clique em **Obter**
3. Confirme em **Adicionar extensão**

### Chrome *(em breve na store)*
Enquanto não está na Chrome Web Store, instale manualmente:
1. Baixe o `.zip` na aba [Releases](https://github.com/fernando-msa/Tradutor-MSA-Extensao/releases)
2. Descompacte a pasta
3. No Chrome, acesse `chrome://extensions/`
4. Ative o **Modo do desenvolvedor** (canto superior direito)
5. Clique em **Carregar sem compactação** e selecione a pasta descompactada

---

## 🖥️ Como Usar

### Tradução pelo popup
1. Clique no ícone da extensão na barra do navegador
2. Digite ou cole o texto no campo esquerdo
3. Selecione os idiomas de origem e destino
4. Clique em **Traduzir** ou pressione `Ctrl + Enter`

### Tradução por voz
1. Clique no ícone do microfone 🎤
2. Fale normalmente — a extensão detecta e traduz automaticamente

### Tradução via menu de contexto
1. Selecione qualquer texto em uma página web
2. Clique com o botão direito
3. Escolha **Traduzir com MSA**

### Histórico
- Acesse a aba **Histórico** no popup para ver as últimas 20 traduções
- Clique em qualquer item para recarregá-lo no tradutor

---

## 🛠️ Estrutura do Projeto

```
Tradutor-MSA-Extensao/
├── manifest.json       # Configuração da extensão (Manifest V3)
├── popup.html          # Interface principal do popup
├── popup.css           # Estilos do popup
├── popup.js            # Lógica principal: tradução, voz, histórico, clipboard
├── background.js       # Service Worker: menu de contexto
├── languages.js        # Lista de idiomas suportados
├── permission.html     # Página de solicitação de permissão de microfone
└── permission.js       # Lógica da permissão de microfone
```

---

## 🔐 Permissões Utilizadas

| Permissão | Motivo |
|---|---|
| `activeTab` | Capturar texto selecionado na aba ativa |
| `scripting` | Injetar script para leitura de texto selecionado |
| `contextMenus` | Adicionar opção no menu de botão direito |
| `storage` | Salvar histórico de traduções e preferências de idioma |

> Nenhum dado é enviado a servidores próprios. A tradução é feita exclusivamente via [MyMemory API](https://mymemory.translated.net/) (gratuita e sem conta).

---

## 🧑‍💻 Desenvolvimento Local

### Pré-requisitos
- Navegador Edge ou Chrome
- Nenhuma dependência externa — JavaScript puro

### Rodando localmente

```bash
# 1. Clone o repositório
git clone https://github.com/fernando-msa/Tradutor-MSA-Extensao.git

# 2. No Edge, acesse:
edge://extensions/

# 3. Ative o Modo do desenvolvedor

# 4. Clique em "Carregar sem compactação"
# Selecione a pasta clonada
```

Qualquer alteração nos arquivos é refletida ao clicar em **Atualizar** na página de extensões.

---

## 🐛 Bugs Conhecidos / Limitações

| Item | Detalhe |
|---|---|
| Limite da API gratuita | MyMemory limita ~5.000 palavras/dia por IP sem chave de API |
| Voz no Chrome | Disponibilidade de vozes varia por sistema operacional |
| Detecção automática | Textos muito curtos (1-2 palavras) podem ter detecção imprecisa |

---

## 🔧 Melhorias Planejadas

- [ ] Publicação na Chrome Web Store
- [ ] Suporte a chave de API MyMemory para aumentar o limite diário
- [ ] Tradução automática ao selecionar texto (sem abrir popup)
- [ ] Tema escuro
- [ ] Atalho de teclado configurável

---

## 🤝 Contribuindo

Contribuições são bem-vindas!

1. Faça um fork do repositório
2. Crie uma branch: `git checkout -b feature/minha-melhoria`
3. Commite: `git commit -m 'feat: descrição da melhoria'`
4. Abra um Pull Request

Para reportar bugs ou sugerir funcionalidades, abra uma [Issue](https://github.com/fernando-msa/Tradutor-MSA-Extensao/issues).

---

## 👤 Autor

**Fernando S. De Santana Júnior**  
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fernando-junior-1a74ab29b/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/fernando-msa)

---

## 📜 Licença

Distribuído sob licença MIT. Consulte `LICENSE` para mais detalhes.
