"use client";

import { useMemo, useRef, useState } from "react";
import styles from "./supportPortal.module.css";

const prompts = [
  {
    icon: "person",
    title: "Réserver un trajet",
    prompt: "Comment réserver un trajet ?",
    description: "Recherche, message conductrice et demande de réservation.",
  },
  {
    icon: "alert",
    title: "Signaler un message",
    prompt: "Je veux signaler un message",
    description: "Conversation, motif et étapes à suivre.",
  },
  {
    icon: "spark",
    title: "Page support",
    prompt: "Où est la page support du site ?",
    description: "Accès à la page support classique.",
  },
  {
    icon: "chat",
    title: "Contacter Drive Lady",
    prompt: "Comment contacter Drive Lady ?",
    description: "Choisir le bon canal selon votre demande.",
  },
];

const recentChats = [
  ["Première réservation", "Recherche et demande de place", "Aujourd'hui"],
  ["Signalement", "Message ou comportement à remonter", "Hier"],
  ["Compte Drive Lady", "Connexion, profil et données", "Cette semaine"],
];

const answers = new Map([
  [
    normalizePrompt("Comment réserver un trajet ?"),
    "Cherchez un trajet, ouvrez l'annonce, contactez la conductrice si besoin, puis envoyez votre demande de réservation. L'article Premiers pas détaille toutes les étapes.",
  ],
  [
    normalizePrompt("Je veux signaler un message"),
    "Ouvrez la conversation concernée, utilisez les options de la conversation, puis choisissez Signaler. Si vous ne trouvez pas l'action, ouvrez l'article dédié depuis la rubrique Sécurité.",
  ],
  [
    normalizePrompt("Où est la page support du site ?"),
    "La page support classique reste disponible ici : http://localhost:5173/support. Le bouton Support classique en haut de page y mène aussi.",
  ],
  [
    normalizePrompt("Comment contacter Drive Lady ?"),
    "Utilisez l'article Contacter le support pour choisir le bon canal : aide compte, trajet, partenariat ou signalement. Ajoutez votre adresse e-mail et le trajet concerné si possible.",
  ],
  [
    normalizePrompt("Je n'arrive pas à me connecter"),
    "Vérifiez l'adresse e-mail utilisée à l'inscription, puis demandez un nouveau lien ou mot de passe depuis l'application. Si le problème continue, contactez le support avec une capture de l'écran d'erreur.",
  ],
]);

export default function SupportChatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [showModeMenu, setShowModeMenu] = useState(false);
  const [mode, setMode] = useState("floating");
  const [showContext, setShowContext] = useState(true);
  const inputRef = useRef(null);
  const panelTitle = useMemo(() => {
    const firstUser = messages.find((message) => message.role === "user");
    return firstUser?.text || "Nouveau chat support";
  }, [messages]);

  function openChat() {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 120);
  }

  function startNewChat() {
    setMessages([]);
    setDraft("");
    setShowHistory(false);
    setShowModeMenu(false);
    window.setTimeout(() => inputRef.current?.focus(), 120);
  }

  function loadRecentChat(title) {
    sendPrompt(title);
    setShowHistory(false);
  }

  function sendPrompt(value) {
    const question = value.trim();
    if (!question) return;

    const answer =
      answers.get(normalizePrompt(question)) ||
      "Je peux vous orienter vers les articles du centre d'aide. Pour une demande précise, ouvrez Contacter le support et indiquez votre e-mail, le trajet ou la conversation concernée.";

    setMessages((current) => [
      ...current,
      { role: "user", text: question },
      { role: "assistant", text: answer },
    ]);
    setDraft("");
    setOpen(true);
    setShowHistory(false);
    setShowModeMenu(false);
    window.setTimeout(() => inputRef.current?.focus(), 120);
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendPrompt(draft);
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendPrompt(draft);
    }
  }

  if (!open) {
    return (
      <button className={styles.chatbotLauncher} type="button" onClick={openChat} aria-label="Ouvrir le chatbot">
        <AssistantBotIcon />
      </button>
    );
  }

  return (
    <section className={styles.chatbotPanel} data-mode={mode} aria-label="Assistant support Drive Lady">
      <header className={styles.chatbotHeader}>
        <div className={styles.chatbotHeaderMenu}>
          <button
            className={styles.chatbotTitleButton}
            type="button"
            aria-expanded={showHistory}
            onClick={() => {
              setShowHistory((value) => !value);
              setShowModeMenu(false);
            }}
          >
            <span>{panelTitle}</span>
            <ChevronDownIcon />
          </button>
          {showHistory ? (
            <div className={styles.chatbotHistoryMenu}>
              <button type="button" onClick={startNewChat}>
                <PlusIcon />
                Nouveau chat support
              </button>
              <p>Conversations récentes</p>
              {recentChats.map(([title, preview, time]) => (
                <button type="button" onClick={() => loadRecentChat(title)} key={title}>
                  <MessageIcon />
                  <span>
                    <strong>{title}</strong>
                    <small>{preview} - {time}</small>
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className={styles.chatbotToolbar}>
          <button type="button" onClick={startNewChat} aria-label="Nouveau chat">
            <PlusIcon />
          </button>
          <div className={styles.chatbotModeWrapper}>
            <button
              type="button"
              aria-label="Changer le mode du chatbot"
              aria-expanded={showModeMenu}
              onClick={() => {
                setShowModeMenu((value) => !value);
                setShowHistory(false);
              }}
            >
              <ModeIcon mode={mode} />
            </button>
            {showModeMenu ? (
              <div className={styles.chatbotModeMenu}>
                {[
                  ["sidebar", "Sidebar"],
                  ["floating", "Floating"],
                ].map(([nextMode, label]) => (
                  <button
                    className={mode === nextMode ? styles.activeMode : undefined}
                    type="button"
                    onClick={() => {
                      setMode(nextMode);
                      setShowModeMenu(false);
                    }}
                    key={nextMode}
                  >
                    <ModeIcon mode={nextMode} />
                    {label}
                  </button>
                ))}
                <a href="/fr-fr/articles/contacter-support">
                  <ModeIcon mode="fullscreen" />
                  Full screen
                </a>
              </div>
            ) : null}
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Réduire le chatbot">
            <MinimizeIcon />
          </button>
        </div>
      </header>

      {showContext ? (
        <div className={styles.chatbotContext}>
          <span>
            <SparklesIcon />
            Contexte : Centre d'aide Drive Lady
          </span>
          <button type="button" onClick={() => setShowContext(false)} aria-label="Masquer le contexte">
            <CloseIcon />
          </button>
        </div>
      ) : null}

      <div className={styles.chatbotBody}>
        {messages.length === 0 ? (
          <section className={styles.chatbotIntro}>
            <div className={styles.chatbotIntroIcon} aria-hidden="true">
              <AssistantBotIcon />
            </div>
            <p className={styles.chatbotEyebrow}>Assistant Drive Lady</p>
            <h2>Nouveau chat support</h2>
            <p>Posez une question sur un trajet, un compte, la sécurité ou le support classique.</p>
            <div className={styles.chatbotSuggestionGrid}>
              {prompts.map((item) => (
                <button type="button" onClick={() => sendPrompt(item.prompt)} key={item.prompt}>
                  <span aria-hidden="true">
                    <SuggestionIcon name={item.icon} />
                  </span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </button>
              ))}
            </div>
          </section>
        ) : (
          <section className={styles.chatbotLog} aria-label="Conversation">
            {messages.map((message, index) => (
              <article className={message.role === "assistant" ? styles.chatbotMessageAssistant : styles.chatbotMessageUser} key={`${message.role}-${index}-${message.text}`}>
                {message.role === "user" ? <div className={styles.chatbotUserAvatar} aria-hidden="true">D</div> : null}
                <div className={styles.chatbotBubble}>
                  <span>{message.role === "user" ? "Vous" : "Assistant Drive Lady"}</span>
                  <p>{message.text}</p>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>

      <form className={styles.chatbotComposer} onSubmit={handleSubmit}>
        <label className={styles.srOnly} htmlFor="support-chat-input">
          Message
        </label>
        <div className={styles.chatbotInputShell}>
          <AssistantBotIcon />
          <textarea
            id="support-chat-input"
            ref={inputRef}
            value={draft}
            rows={1}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Demandez de l'aide sur un trajet, un compte ou un signalement"
          />
          <button type="submit" aria-label="Envoyer le message" disabled={!draft.trim()}>
            <ArrowUpIcon />
          </button>
        </div>
        <p>Les réponses automatiques peuvent être incomplètes. Vérifiez les informations importantes.</p>
      </form>
    </section>
  );
}

function normalizePrompt(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function AssistantBotIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="7" width="16" height="12" rx="3" />
      <path d="M9 7V4h6v3" />
      <path d="M8.5 13h.01" />
      <path d="M15.5 13h.01" />
      <path d="M9 17h6" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
    </svg>
  );
}

function SuggestionIcon({ name }) {
  if (name === "person") return <PersonIcon />;
  if (name === "alert") return <AlertIcon />;
  if (name === "spark") return <SparklesIcon />;
  return <MessageIcon />;
}

function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 21c1.4-4 4-6 7-6s5.6 2 7 6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 9v5M12 17h.01" />
    </svg>
  );
}

function MessageIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 5h16v11H8l-4 4V5Z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8z" />
      <path d="M5 14l.8 2.2L8 17l-2.2.8L5 20l-.8-2.2L2 17l2.2-.8z" />
    </svg>
  );
}

function ModeIcon({ mode }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
      {mode === "sidebar" ? (
        <>
          <rect x="1.5" y="2.5" width="13" height="11" rx="2" />
          <rect x="9.5" y="2.5" width="5" height="11" rx="2" className={styles.modeIconFill} />
        </>
      ) : mode === "fullscreen" ? (
        <rect x="1.5" y="2.5" width="13" height="11" rx="2" className={styles.modeIconFill} />
      ) : (
        <>
          <rect x="1.5" y="2.5" width="13" height="11" rx="2" />
          <rect x="8" y="7" width="5.5" height="5" rx="1.2" className={styles.modeIconFill} />
        </>
      )}
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MinimizeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 12h10" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m7 10 5 5 5-5" />
    </svg>
  );
}

function ArrowUpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 19V5M6 11l6-6 6 6" />
    </svg>
  );
}
