import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Trash2, AlertTriangle, WifiOff, MessageSquare, Sparkles, Copy, Check } from 'lucide-react';
import { Button, Card, Input, Modal, Alert } from '@/components/ui';
import MarkdownRenderer from './MarkdownRenderer';
import { sendChatMessage, type AIInsightsContext, type ChatResponse } from '@/services/apiClient';
import { cn } from '@/utils/cn';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  isFallback?: boolean;
}

interface ChatInterfaceProps {
  simulationContext: AIInsightsContext;
  className?: string;
}

const SUGGESTED_QUESTIONS = [
  "How can I improve my ROAS?",
  "Why is my campaign not profitable?",
  "Should I increase my ad budget?",
  "How can I get more orders?",
  "Create a 30-day growth roadmap.",
];

export default function ChatInterface({ simulationContext, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showClearModal, setShowClearModal] = useState(false);
  const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

    // Build conversation history (excluding the current message we just added)
    const historyForApi = messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    try {
      const response: ChatResponse = await sendChatMessage(
        trimmedQuestion,
        historyForApi,
        simulationContext
      );

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
  }, [messages, isLoading, simulationContext]);

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
  };

  const handleCopyMessage = useCallback(async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    setCopiedMessageIndex(index);
    setTimeout(() => setCopiedMessageIndex(null), 2000);
  }, []);

  const handleSuggestedQuestion = (question: string) => {
    handleSend(question);
  };

  const hasMessages = messages.length > 0;

  return (
    <div
      className={cn('flex flex-col', className)}
      data-icod-id="src_components_chatinterface_tsx_9435">
      {/* Messages Area */}
      <Card
        variant="cream"
        className="mb-4 min-h-[400px] max-h-[600px] overflow-y-auto p-4"
        data-icod-id="src_components_chatinterface_tsx_36e7">
        {!hasMessages && !isLoading && (
          <div
            className="flex h-full flex-col items-center justify-center text-center"
            data-icod-id="src_components_chatinterface_tsx_6747">
            <MessageSquare
              className="mb-3 h-12 w-12 text-muted-foreground/40"
              data-icod-id="src_components_chatinterface_tsx_d676" />
            <p
              className="text-sm font-medium text-muted-foreground"
              data-icod-id="src_components_chatinterface_tsx_12ec">
              Ask LaunchLens anything about your product, profit, ads, or growth strategy.
            </p>
          </div>
        )}

        <div
          className="space-y-4"
          data-icod-id="src_components_chatinterface_tsx_1c04">
          {messages.map((message, index) => (
            <div
              key={index}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
              data-icod-id={`src_components_chatinterface_tsx_89ba_${index}`}>
              <div
                className={cn(
                  'max-w-[85%] rounded-lg px-4 py-3',
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#DE85E2] to-[#DE8DDB] text-white'
                    : 'border border-border bg-card shadow-sm'
                )}
                data-icod-id={`src_components_chatinterface_tsx_b62a_${index}`}>
                {message.role === 'assistant' && message.isFallback && (
                  <Alert
                    variant="warning"
                    className="mb-3"
                    data-icod-id={`src_components_chatinterface_tsx_f064_${index}`}>
                    <div
                      className="flex items-start gap-2"
                      data-icod-id={`src_components_chatinterface_tsx_84a7_${index}`}>
                      <WifiOff
                        className="mt-0.5 h-4 w-4 shrink-0"
                        data-icod-id={`src_components_chatinterface_tsx_178d_${index}`} />
                      <div data-icod-id={`src_components_chatinterface_tsx_b8be_${index}`}>
                        <p
                          className="text-xs font-semibold"
                          data-icod-id={`src_components_chatinterface_tsx_f739_${index}`}>Rule-Based Response</p>
                        <p
                          className="mt-0.5 text-xs opacity-80"
                          data-icod-id={`src_components_chatinterface_tsx_ffcc_${index}`}>
                          Live AI is not connected. This is a rule-based suggestion.
                        </p>
                      </div>
                    </div>
                  </Alert>
                )}
                {message.role === 'user' ? (
                  <p
                    className="whitespace-pre-wrap leading-relaxed"
                    data-icod-id={`src_components_chatinterface_tsx_6773_${index}`}>{message.content}</p>
                ) : (
                  <>
                    <MarkdownRenderer
                      content={message.content}
                      data-icod-id={`src_components_chatinterface_tsx_fca4_${index}`} />
                    <button
                      type="button"
                      onClick={() => handleCopyMessage(message.content, index)}
                      className="mt-2 inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Copy response"
                      data-icod-id={`src_components_chatinterface_tsx_copy_msg_${index}`}>
                      {copiedMessageIndex === index ? (
                        <>
                          <Check
                            className="h-3 w-3"
                            data-icod-id={`src_components_chatinterface_tsx_9058_${index}`} />
                          <span data-icod-id={`src_components_chatinterface_tsx_6c35_${index}`}>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy
                            className="h-3 w-3"
                            data-icod-id={`src_components_chatinterface_tsx_bf1d_${index}`} />
                          <span data-icod-id={`src_components_chatinterface_tsx_b703_${index}`}>Copy</span>
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div
              className="flex justify-start"
              data-icod-id="src_components_chatinterface_tsx_f03c">
              <div
                className="rounded-lg border border-border bg-card px-4 py-3 shadow-sm"
                data-icod-id="src_components_chatinterface_tsx_45e8">
                <div
                  className="flex items-center gap-2"
                  data-icod-id="src_components_chatinterface_tsx_4fbe">
                  <div
                    className="flex items-center gap-1"
                    aria-hidden="true"
                    data-icod-id="src_components_chatinterface_tsx_142b">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="inline-block h-2 w-2 rounded-full bg-[#C9D0FC]"
                        style={{ animation: `bounceDot 1.4s ease-in-out ${i * 0.16}s infinite` }}
                        data-icod-id={`src_components_chatinterface_tsx_d9aa_${i}`} />
                    ))}
                  </div>
                  <span
                    className="text-sm text-muted-foreground"
                    data-icod-id="src_components_chatinterface_tsx_4a40">LaunchLens is thinking…</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} data-icod-id="src_components_chatinterface_tsx_81bc" />
        </div>
      </Card>
      {/* Error Display */}
      {error && (
        <Alert
          variant="error"
          className="mb-4"
          data-icod-id="src_components_chatinterface_tsx_e713">
          <div
            className="flex items-start gap-2"
            data-icod-id="src_components_chatinterface_tsx_fe61">
            <AlertTriangle
              className="mt-0.5 h-4 w-4 shrink-0"
              data-icod-id="src_components_chatinterface_tsx_b8c9" />
            <div className="flex-1" data-icod-id="src_components_chatinterface_tsx_2fb7">
              <p className="text-sm" data-icod-id="src_components_chatinterface_tsx_7bd7">{error}</p>
            </div>
          </div>
        </Alert>
      )}
      {/* Suggested Questions (only show when chat is empty) */}
      {!hasMessages && !isLoading && (
        <div className="mb-4" data-icod-id="src_components_chatinterface_tsx_a2f9">
          <p
            className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground"
            data-icod-id="src_components_chatinterface_tsx_a87d">
            Try asking:
          </p>
          <div
            className="flex flex-wrap gap-2"
            data-icod-id="src_components_chatinterface_tsx_bd72">
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                disabled={isLoading}
                className="rounded-full border border-[#C9D0FC]/30 bg-[#F6F6F6] px-3 py-1.5 text-xs font-medium text-[#C9D0FC] transition-colors hover:bg-[#C9D0FC] hover:text-white disabled:opacity-50"
                data-icod-id={`src_components_chatinterface_tsx_c785_${index}`}>
                <Sparkles
                  className="mr-1 inline-block h-3 w-3"
                  data-icod-id={`src_components_chatinterface_tsx_0474_${index}`} />
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
        data-icod-id="src_components_chatinterface_tsx_1956">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about your product, profit, ads, sales or growth…"
          disabled={isLoading}
          className="flex-1"
          data-icod-id="src_components_chatinterface_tsx_f97a" />
        <Button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          loading={isLoading}
          data-icod-id="src_components_chatinterface_tsx_54fe">
          {!isLoading && <Send className="h-4 w-4" data-icod-id="src_components_chatinterface_tsx_7e0a" />}
        </Button>
        {hasMessages && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowClearModal(true)}
            disabled={isLoading}
            title="Clear chat"
            data-icod-id="src_components_chatinterface_tsx_e017">
            <Trash2 className="h-4 w-4" data-icod-id="src_components_chatinterface_tsx_9480" />
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
            data-icod-id="src_components_chatinterface_tsx_eeca">
            <Button
              variant="outline"
              onClick={() => setShowClearModal(false)}
              data-icod-id="src_components_chatinterface_tsx_8021">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleClearChat}
              data-icod-id="src_components_chatinterface_tsx_042f">
              Clear Chat
            </Button>
          </div>
        }
        data-icod-id="src_components_chatinterface_tsx_0388">
        <p
          className="text-sm text-muted-foreground"
          data-icod-id="src_components_chatinterface_tsx_5461">
          Are you sure you want to clear this conversation? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
