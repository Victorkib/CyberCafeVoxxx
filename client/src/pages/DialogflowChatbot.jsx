// src/components/DialogflowChatbot.jsx
import { useEffect } from 'react';

const DialogflowChatbot = () => {
  useEffect(() => {
    // Ensure custom element loads after script is available
    const script = document.querySelector('script[src*="df-messenger.js"]');
    if (!script) {
      const newScript = document.createElement('script');
      newScript.src =
        'https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js';
      newScript.defer = true;
      document.body.appendChild(newScript);
    }
  }, []);

  return (
    <div className="z-[999] fixed bottom-2 right-4">
      <df-messenger
        project-id="my-project-6198-460808"
        agent-id="0cbdda9e-6eaa-495d-8261-3a169c0e2610"
        language-code="en"
        max-query-length="-1"
      >
        <df-messenger-chat-bubble chat-title="serenityAgent"></df-messenger-chat-bubble>
      </df-messenger>
    </div>
  );
};

export default DialogflowChatbot;
