import React, { useEffect, useState } from 'react';
import { surveyService } from '../../services/surveyService';

export const DynamicScripts: React.FC = () => {
  const [trackingScript, setTrackingScript] = useState<string>('');
  const [anychatScript, setAnychatScript] = useState<string>('');

  useEffect(() => {
    surveyService.getSettings().then((settings) => {
      if (settings.tracking_script?.script) {
        setTrackingScript(settings.tracking_script.script);
      }
      if (settings.anychat_script?.script) {
        setAnychatScript(settings.anychat_script.script);
      }
    });
  }, []);

  // Helper to execute/inject scripts into document
  useEffect(() => {
    const scriptsToInject = [trackingScript, anychatScript].filter(Boolean);
    if (scriptsToInject.length === 0) return;

    scriptsToInject.forEach((codeStr, idx) => {
      try {
        const containerId = `dyn-script-injected-${idx}`;
        let existingContainer = document.getElementById(containerId);
        if (!existingContainer) {
          existingContainer = document.createElement('div');
          existingContainer.id = containerId;
          document.body.appendChild(existingContainer);
        }

        // Parse HTML and append scripts
        const range = document.createRange();
        range.selectNode(document.body);
        const fragment = range.createContextualFragment(codeStr);
        existingContainer.innerHTML = '';
        existingContainer.appendChild(fragment);
      } catch (err) {
        console.warn('[DynamicScripts] Error injecting external script:', err);
      }
    });
  }, [trackingScript, anychatScript]);

  return null;
};

