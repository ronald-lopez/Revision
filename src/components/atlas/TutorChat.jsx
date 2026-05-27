import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { getAtlasResponse } from '../../utils/mockAtlas.js';

// Render a block from mockAtlas response
function Block({ block, onForgeCta }) {
  switch (block.type) {
    case 'text':
      return (
        <p style={{ margin: '6px 0' }}
          dangerouslySetInnerHTML={{
            __html: block.content
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
          }}
        />
      );
    case 'heading':
      return (
        <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '12px 0 5px' }}>
          {block.content}
        </div>
      );
    case 'list':
      return (
        <ul style={{ paddingLeft: '18px', margin: '6px 0' }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ margin: '4px 0', fontSize: '13.5px' }}
              dangerouslySetInnerHTML={{
                __html: item
                  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
              }}
            />
          ))}
        </ul>
      );
    case 'tip':
      return (
        <div className="examiner-tip"
          dangerouslySetInnerHTML={{
            __html: block.content
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
          }}
        />
      );
    case 'divider':
      return <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '12px 0' }} />;
    case 'forge-cta':
      return (
        <button className="forge-cta-btn" onClick={onForgeCta}>
          📄 {block.content}
        </button>
      );
    default:
      return null;
  }
}

function AtlasMessage({ msg, onForgeCta }) {
  return (
    <div className="chat-msg">
      <div className="chat-avatar atlas-av">AT</div>
      <div className="chat-bubble">
        {msg.blocks.map((block, i) => (
          <Block key={i} block={block} onForgeCta={onForgeCta} />
        ))}
      </div>
    </div>
  );
}

function UserMessage({ text, userName }) {
  const initials = userName ? userName[0].toUpperCase() : 'U';
  return (
    <div className="chat-msg user">
      <div className="chat-avatar user-av">{initials}</div>
      <div className="chat-bubble">{text}</div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="chat-msg">
      <div className="chat-avatar atlas-av">AT</div>
      <div className="chat-bubble" style={{ padding: '14px 18px' }}>
        <div className="typing-indicator">
          <div className="typing-dot" />
          <div className="typing-dot" />
          <div className="typing-dot" />
        </div>
      </div>
    </div>
  );
}

const SUGGESTIONS = [
  'Explain insulin and blood glucose',
  'How do I structure a 12-mark essay?',
  'What does AO3 actually require?',
  'Give me a practice question on enzymes',
  'I\'m struggling with extended writing',
];

export default function TutorChat({ onStartDiagnostic }) {
  const { user, chatHistory, addChatMessage, atlasMemory, navigateToForge } = useApp();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  async function send(text) {
    const msg = text.trim();
    if (!msg) return;
    setInput('');
    addChatMessage({ role: 'user', text: msg });
    setIsTyping(true);
    try {
      const blocks = await getAtlasResponse(msg);
      addChatMessage({ role: 'atlas', blocks });
    } finally {
      setIsTyping(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  function handleForge() {
    navigateToForge();
  }

  const showWelcome = chatHistory.length === 0;

  return (
    <>
      <div className="atlas-chat-area">
        {showWelcome ? (
          <div className="atlas-welcome-banner">
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧠</div>
            <h2>
              {atlasMemory ? `Welcome back.` : `Hello, let's get started.`}
            </h2>
            <p>
              {atlasMemory
                ? `ATLAS remembers your profile — ${atlasMemory.weakAreas?.length || 0} focus areas identified. Ask me to explain anything, give you a practice question, or walk you through exam technique.`
                : `Run your diagnostic first so ATLAS can build your profile, then ask me anything about your subjects.`}
            </p>
            {!atlasMemory && (
              <button className="btn-primary" onClick={onStartDiagnostic}>
                Start Diagnostic →
              </button>
            )}
          </div>
        ) : (
          chatHistory.map((msg, i) =>
            msg.role === 'user'
              ? <UserMessage key={i} text={msg.text} userName={user?.name} />
              : <AtlasMessage key={i} msg={msg} onForgeCta={handleForge} />
          )
        )}
        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {showWelcome && (
        <div className="atlas-suggestions">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} className="atlas-suggestion-chip" onClick={() => send(s)}>
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="chat-input-area">
        <div className="chat-input-row">
          <textarea
            ref={textareaRef}
            className="chat-textarea"
            placeholder="Ask ATLAS anything — concepts, technique, practice questions…"
            value={input}
            onChange={e => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={() => send(input)}
            disabled={!input.trim() || isTyping}
          >
            ↑
          </button>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text3)', marginTop: '8px', textAlign: 'center' }}>
          ATLAS responses are simulated in this prototype · Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </>
  );
}
