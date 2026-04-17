import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

const AIHelpDesk = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'model', text: 'Hello! I am the Crime Detection & Alert AI Help Desk. How can I assist you with the system data today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'model', text: data.response || "No response received." }]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      setMessages(prev => [...prev, { role: 'model', text: "Error connecting to the AI Help Desk network." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="ai-helpdesk-overlay" onClick={onClose}>
      <div className="ai-helpdesk-panel panel" onClick={e => e.stopPropagation()}>
        <div className="panel-header ai-chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bot size={24} className="accent" />
            <h3>AI Help Desk</h3>
          </div>
          <button className="close-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="chat-messages">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble-container ${msg.role === 'user' ? 'user' : 'model'}`}>
              <div className="chat-avatar">
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className={`chat-bubble ${msg.role}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-bubble-container model">
              <div className="chat-avatar"><Bot size={16} /></div>
              <div className="chat-bubble model writing">
                <span className="dot"></span><span className="dot"></span><span className="dot"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-input-area">
          <textarea 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI about system data..."
            rows={1}
            disabled={isLoading}
          />
          <button className="send-btn primary-btn" onClick={handleSend} disabled={!input.trim() || isLoading}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIHelpDesk;
