import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, AlertTriangle, WifiOff, MessageSquare, Sparkles } from 'lucide-react';
import { Button, Card, Input, Modal, Alert } from '@/components/ui';
import MarkdownRenderer from './MarkdownRenderer';
import { askTrendScout } from '@/services/apiClient';
import { cn } from '@/utils/cn';
import type { DiscoveryFilters, AskTrendScoutResponse, ProductResearch, CompetitorObservation, EvidenceStatus } from '@/types';
import { STORAGE_KEYS, scopedGetItem, scopedSetItem, scopedRemoveItem } from '@/utils/scopedStorage';
import { useAppSelector } from '@/store/hooks';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isFallback?: boolean;
}

interface TrendScoutChatProps {
  filters: DiscoveryFilters;
  currency: string;
  selectedProductResearch?: ProductResearch;
  className?: string;
}

const SUGGESTED_QUESTIONS = [
  'Find problem-solving products for Pakistan under my budget',
  'Which products have rising demand but appear underserved locally?',
  'Find product ideas that solve a frustrating everyday problem',
  'How can I validate demand before buying inventory?',
  'Give me a step-by-step plan to launch the best candidate.',
];

export default function TrendScoutChat({ filters, currency, selectedProductResearch, className }: TrendScoutChatProps) {
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load user-scoped chat history when userId changes
  useEffect(() => {
    if (!userId) return;
    setMessages(
      scopedGetItem<ChatMessage[]>(STORAGE_KEYS.TRENDSCOUT_CHAT, userId, [])
    );
  }, [userId]);

  // Persist chat to scoped localStorage
  useEffect(() => {
    scopedSetItem(STORAGE_KEYS.TRENDSCOUT_CHAT, userId, messages);
  }, [messages, userId]);

  // Auto-scroll to bottom when new messages appear
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    const trimmedQuestion = question.trim();
    setInputValue('');
    setError(null);

    // Add user message
    const userMessage: ChatMessage = { role: 'user', content: trimmedQuestion };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Build conversation history
    const historyForApi = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      // Build research context if available
      const researchContext = selectedProductResearch && selectedProductResearch.observations.length > 0
        ? {
            observations: selectedProductResearch.observations,
            status: selectedProductResearch.status,
            productName: selectedProductResearch.productName,
          }
        : undefined;

      const response: AskTrendScoutResponse = await askTrendScout({
        question: trimmedQuestion,
        conversationHistory: historyForApi,
        filterContext: filters,
        currency,
        researchData: researchContext,
      });

      if (response.success && response.data) {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.data.reply,
          isFallback: response.data.isFallback,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        setError(response.error || 'Failed to get a response. Please try again.');
      }
    } catch {
      setError('Unable to connect to the server. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, filters, currency, selectedProductResearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(inputValue);
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    setError(null);
    setShowClearModal(false);
    scopedRemoveItem(STORAGE_KEYS.TRENDSCOUT_CHAT, userId);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  const hasMessages = messages.length > 0;

  return (
    <div className={cn('flex flex-col', className)} data-icod-id="trendscout_chat">
      {/* Disclosure Banner */}
      <Alert variant="info" className="mb-4" data-icod-id="trendscout_chat_disclosure">
        <p className="text-xs" data-icod-id="src_components_trendscoutchat_tsx_89a7">
          Responses may include AI-generated estimates. Always validate product data before making business decisions.
        </p>
      </Alert>
      {/* Messages Area */}
      <Card variant="mint" className="mb-4 min-h-[350px] max-h-[500px] overflow-y-auto p-4" data-icod-id="trendscout_chat_messages">
        {!hasMessages && !isLoading && (
          <div className="flex h-full flex-col items-center justify-center text-center" data-icod-id="trendscout_chat_empty">
            <MessageSquare
              className="mb-3 h-12 w-12 text-muted-foreground/40"
              data-icod-id="src_components_trendscoutchat_tsx_464d" />
            <p
              className="text-sm font-medium text-muted-foreground"
              data-icod-id="src_components_trendscoutchat_tsx_9d6e">
              Ask TrendScout about products, markets, validation, and opportunities.
            </p>
          </div>
        )}

        <div className="space-y-4" data-icod-id="trendscout_chat_list">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              data-icod-id={`src_components_trendscoutchat_tsx_0bad_${index}`}>
              <div
                className={cn(
                  'max-w-[85%] rounded-lg px-4 py-3',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#DE85E2] to-[#DE8DDB] text-white'
                    : 'border border-border bg-card shadow-sm'
                )}
                data-icod-id={`src_components_trendscoutchat_tsx_c33a_${index}`}>
                {message.role === 'assistant' && message.isFallback && (
                  <Alert
                    variant="warning"
                    className="mb-3"
                    data-icod-id={`src_components_trendscoutchat_tsx_1d85_${index}`}>
                    <div
                      className="flex items-start gap-2"
                      data-icod-id={`src_components_trendscoutchat_tsx_956a_${index}`}>
                      <WifiOff
                        className="mt-0.5 h-4 w-4 shrink-0"
                        data-icod-id={`src_components_trendscoutchat_tsx_8724_${index}`} />
                      <div data-icod-id={`src_components_trendscoutchat_tsx_db37_${index}`}>
                        <p
                          className="text-xs font-semibold"
                          data-icod-id={`src_components_trendscoutchat_tsx_f67f_${index}`}>Rule-Based Response</p>
                        <p
                          className="mt-0.5 text-xs opacity-80"
                          data-icod-id={`src_components_trendscoutchat_tsx_d338_${index}`}>
                          Live AI is not connected. This is a rule-based suggestion.
                        </p>
                      </div>
                    </div>
                  </Alert>
                )}
                {message.role === 'user' ? (
                  <p
                    className="whitespace-pre-wrap leading-relaxed"
                    data-icod-id={`src_components_trendscoutchat_tsx_0620_${index}`}>{message.content}</p>
                ) : (
                  <MarkdownRenderer
                    content={message.content}
                    data-icod-id={`src_components_trendscoutchat_tsx_1219_${index}`} />
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              className="flex justify-start"
              data-icod-id="src_components_trendscoutchat_tsx_981b">
              <div
                className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
                data-icod-id="src_components_trendscoutchat_tsx_ab15">
                <div
                  className="flex items-center gap-2"
                  data-icod-id="src_components_trendscoutchat_tsx_f95e">
                  <div
                    className="flex items-center gap-1"
                    aria-hidden="true"
                    data-icod-id="src_components_trendscoutchat_tsx_5e9a">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block h-2 w-2 rounded-full bg-[#C9D0FC]"
                        style={{ animation: `bounceDot 1.4s ease-in-out ${i * 0.16}s infinite` }}
                        data-icod-id={`src_components_trendscoutchat_tsx_13d4_${i}`} />
                    ))}
                  </div>
                  <span
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_components_trendscoutchat_tsx_206b">TrendScout is thinking…</span>
                </div>
              </div>
            </div>
          )}

          <div
            ref={messagesEndRef}
            data-icod-id="src_components_trendscoutchat_tsx_d74b" />
        </div>
      </Card>
      {/* Error Display */}
      {error && (
        <Alert
          variant="error"
          className="mb-4"
          data-icod-id="src_components_trendscoutchat_tsx_01db">
          <div
            className="flex items-start gap-2"
            data-icod-id="src_components_trendscoutchat_tsx_0ade">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0"
              data-icod-id="src_components_trendscoutchat_tsx_a287" />
            <div className="flex-1" data-icod-id="src_components_trendscoutchat_tsx_8689">
              <p className="text-sm" data-icod-id="src_components_trendscoutchat_tsx_f4ca">{error}</p>
            </div>
          </div>
        </Alert>
      )}
      {/* Suggested Questions */}
      {!hasMessages && !isLoading && (
        <div className="mb-4" data-icod-id="src_components_trendscoutchat_tsx_d361">
          <p
            className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            data-icod-id="src_components_trendscoutchat_tsx_717d">
            Try asking:
          </p>
          <div
            className="flex flex-wrap gap-2"
            data-icod-id="src_components_trendscoutchat_tsx_850f">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                disabled={isLoading}
                className="rounded-full border border-[#C9D0FC]/30 bg-[#F6F6F6] px-3 py-1.5 text-xs font-medium text-[#C9D0FC] transition-colors hover:bg-[#C9D0FC] hover:text-white disabled:opacity-50"
                data-icod-id={`src_components_trendscoutchat_tsx_c5a7_${index}`}>
                <Sparkles
                  className="mr-1 inline-block h-3 w-3"
                  data-icod-id={`src_components_trendscoutchat_tsx_b2de_${index}`} />
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      {/* Input Area */}
      <form
        onSubmit={handleSubmit}
        className="flex gap-2"
        data-icod-id="src_components_trendscoutchat_tsx_d451">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about products, markets, validation…"
          disabled={isLoading}
          className="flex-1"
          data-icod-id="src_components_trendscoutchat_tsx_c4b9" />
        <Button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          loading={isLoading}
          data-icod-id="src_components_trendscoutchat_tsx_bcf2">
          {!isLoading && <Send className="h-4 w-4" data-icod-id="src_components_trendscoutchat_tsx_9feb" />}
        </Button>
        {hasMessages && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowClearModal(true)}
            disabled={isLoading}
            title="Clear chat"
            data-icod-id="src_components_trendscoutchat_tsx_3efd">
            <Trash2 className="h-4 w-4" data-icod-id="src_components_trendscoutchat_tsx_6566" />
          </Button>
        )}
      </form>
      {/* Clear Confirmation Modal */}
      <Modal
        open={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear Conversation"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_components_trendscoutchat_tsx_de72">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
              data-icod-id="src_components_trendscoutchat_tsx_a607">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearChat}
              data-icod-id="src_components_trendscoutchat_tsx_cb95">
              Clear Chat
            </Button>
          </div>
        }
        data-icod-id="src_components_trendscoutchat_tsx_d11f">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_components_trendscoutchat_tsx_1882">
          Are you sure you want to clear this conversation? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
