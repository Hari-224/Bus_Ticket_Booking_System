import React, { useState, useRef, useEffect } from 'react';
import { 
    FaRobot, 
    FaPaperPlane, 
    FaTimes, 
    FaSync, 
    FaBookOpen, 
    FaLightbulb,
    FaTicketAlt,
    FaCheckCircle,
    FaTimesCircle,
    FaClock,
    FaReceipt
} from 'react-icons/fa';
import { aiService } from '../services/busService';
import toast from 'react-hot-toast';
import './AiChatWidget.css';

const SUGGESTIONS = [
    "If I cancel my ticket now, how much refund will I get?",
    "If I cancel after 3 hours, what will be my refund?",
    "If I cancel tomorrow morning, what is the refund amount?",
    "Am I eligible for a refund?",
    "Free luggage allowance limit?",
    "Required ID for boarding?"
];

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            sender: 'assistant',
            text: "Hello! 👋 I'm your **BusEase AI Travel & Booking Assistant**.\n\nAsk me anything about your **booking**, **refund amounts** for future cancellation times, or **cancellation policies**!",
            sources: [],
            sourcesCount: 0,
            bookingSummary: null,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
    ]);
    const [inputQuestion, setInputQuestion] = useState('');
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen, loading]);

    const handleSend = async (textToSend) => {
        const questionText = textToSend || inputQuestion;
        if (!questionText.trim() || loading) return;

        const userMsg = {
            id: Date.now() + '-user',
            sender: 'user',
            text: questionText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInputQuestion('');
        setLoading(true);

        try {
            const res = await aiService.askQuestion(questionText);
            const assistantMsg = {
                id: Date.now() + '-ai',
                sender: 'assistant',
                text: res.answer,
                contextFound: res.contextFound,
                sourcesCount: res.retrievedSourcesCount || 0,
                sources: res.sourceSnippets || [],
                bookingSummary: res.bookingSummary || null,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } catch (error) {
            console.error('RAG Query Error:', error);
            const errorMsg = {
                id: Date.now() + '-err',
                sender: 'assistant',
                text: "I'm sorry, I encountered an issue retrieving your refund breakdown. Please try again shortly.",
                sourcesCount: 0,
                sources: [],
                bookingSummary: null,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages((prev) => [...prev, errorMsg]);
            toast.error("AI Assistant connection error");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setMessages([
            {
                id: 'welcome',
                sender: 'assistant',
                text: "Hello! 👋 I'm your **BusEase AI Travel & Booking Assistant**.\n\nAsk me anything about your **booking**, **refund amounts** for future cancellation times, or **cancellation policies**!",
                sources: [],
                sourcesCount: 0,
                bookingSummary: null,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
        ]);
    };

    const renderFormattedMessage = (text) => {
        if (!text) return null;
        const lines = text.split('\n');
        return lines.map((line, lIdx) => {
            if (!line.trim()) return <div key={lIdx} className="msg-space" />;
            
            const parts = line.split(/(\*\*.*?\*\*)/g);
            const formattedLine = parts.map((part, pIdx) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={pIdx} className="highlight-text">{part.slice(2, -2)}</strong>;
                }
                return part;
            });

            const trimmed = line.trim();
            if (trimmed.startsWith('•') || trimmed.startsWith('-')) {
                const bulletContent = trimmed.substring(1).trim();
                const bulletParts = bulletContent.split(/(\*\*.*?\*\*)/g).map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={pIdx} className="highlight-text">{part.slice(2, -2)}</strong>;
                    }
                    return part;
                });

                return (
                    <div key={lIdx} className="bullet-item">
                        <span className="bullet-icon">•</span>
                        <span>{bulletParts}</span>
                    </div>
                );
            }

            return <p key={lIdx}>{formattedLine}</p>;
        });
    };

    const renderBookingSummaryCard = (summary) => {
        if (!summary) return null;
        return (
            <div className="refund-summary-card">
                <div className="summary-card-header">
                    <FaTicketAlt className="ticket-icon" />
                    <div>
                        <span className="pnr-badge">PNR: {summary.pnr}</span>
                        <h4 className="summary-route">{summary.route}</h4>
                    </div>
                </div>

                <div className="summary-details-grid">
                    <div className="summary-row">
                        <span className="label">Departure Time:</span>
                        <span className="value">{summary.departureTime}</span>
                    </div>
                    <div className="summary-row">
                        <span className="label">Cancellation Time:</span>
                        <span className="value highlight-time">{summary.simulatedCancelTime}</span>
                    </div>
                    <div className="summary-row">
                        <span className="label"><FaReceipt /> Total Ticket Fare:</span>
                        <span className="value font-bold">₹{summary.bookingAmount.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="label">Cancellation Fee:</span>
                        <span className="value text-red">₹{summary.cancellationCharge.toFixed(2)} ({summary.cancellationFeePercentage}%)</span>
                    </div>
                    <div className="summary-row net-refund-row">
                        <span className="label">Estimated Net Refund:</span>
                        <span className="value net-refund-amount">₹{summary.refundAmount.toFixed(2)}</span>
                    </div>
                    <div className="summary-row">
                        <span className="label">Refund Status:</span>
                        <span className={`eligibility-badge ${summary.refundEligibility ? 'eligible' : 'ineligible'}`}>
                            {summary.refundEligibility ? <FaCheckCircle /> : <FaTimesCircle />}
                            {summary.refundEligibility ? 'Eligible for Refund' : 'Non-Refundable'}
                        </span>
                    </div>
                    <div className="summary-row">
                        <span className="label"><FaClock /> Expected Processing:</span>
                        <span className="value">{summary.refundProcessingTime}</span>
                    </div>
                </div>

                <div className="summary-policy-footer">
                    <FaBookOpen /> {summary.applicablePolicy}
                </div>
            </div>
        );
    };

    return (
        <div className="ai-chat-widget-container">
            {/* Floating Trigger Button */}
            {!isOpen && (
                <button 
                    className="ai-chat-trigger-btn"
                    onClick={() => setIsOpen(true)}
                    title="Ask AI Travel Assistant"
                    aria-label="Ask AI Travel Assistant"
                >
                    <div className="ai-trigger-icon-wrapper">
                        <FaRobot className="ai-trigger-icon" />
                        <span className="ai-trigger-badge">AI</span>
                    </div>
                    <span className="ai-trigger-text">AI Travel Assistant</span>
                </button>
            )}

            {/* Chat Window Container */}
            {isOpen && (
                <div className="ai-chat-window">
                    {/* Header */}
                    <div className="ai-chat-header">
                        <div className="ai-chat-title">
                            <div className="ai-avatar">
                                <FaRobot />
                            </div>
                            <div>
                                <h3>BusEase AI Travel Assistant</h3>
                                <p className="ai-status">
                                    <span className="status-dot"></span> Online & Ready to Help
                                </p>
                            </div>
                        </div>
                        <div className="ai-chat-actions">
                            <button onClick={handleReset} title="Reset Chat" className="icon-action-btn">
                                <FaSync />
                            </button>
                            <button onClick={() => setIsOpen(false)} title="Close" className="icon-action-btn close-btn">
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Messages List */}
                    <div className="ai-chat-messages">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`ai-message-wrapper ${msg.sender === 'user' ? 'user-msg' : 'assistant-msg'}`}
                            >
                                <div className="ai-message-bubble">
                                    <div className="ai-message-content">
                                        {renderFormattedMessage(msg.text)}
                                    </div>

                                    {/* Refund Summary Breakdown Card */}
                                    {msg.sender === 'assistant' && msg.bookingSummary && renderBookingSummaryCard(msg.bookingSummary)}

                                    <span className="msg-timestamp">{msg.timestamp}</span>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="ai-message-wrapper assistant-msg">
                                <div className="ai-message-bubble loading-bubble">
                                    <div className="typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                    <span className="loading-text">Calculating refund & checking policy rules...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestion Chips */}
                    {messages.length < 5 && !loading && (
                        <div className="ai-suggestions-container">
                            <div className="suggestions-label">
                                <FaLightbulb /> Suggested Queries:
                            </div>
                            <div className="suggestions-scroll">
                                {SUGGESTIONS.map((q, idx) => (
                                    <button 
                                        key={idx} 
                                        className="suggestion-chip"
                                        onClick={() => handleSend(q)}
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Bar */}
                    <form 
                        className="ai-chat-input-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSend();
                        }}
                    >
                        <input
                            type="text"
                            placeholder="Ask about your booking, refund, cancellation, luggage..."
                            value={inputQuestion}
                            onChange={(e) => setInputQuestion(e.target.value)}
                            disabled={loading}
                        />
                        <button 
                            type="submit" 
                            disabled={loading || !inputQuestion.trim()}
                            className="ai-send-btn"
                        >
                            <FaPaperPlane />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
