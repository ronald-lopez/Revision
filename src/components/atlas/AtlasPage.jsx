import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import MemoryPanel from './MemoryPanel.jsx';
import TutorChat from './TutorChat.jsx';
import DiagnosticFlow from './DiagnosticFlow.jsx';

export default function AtlasPage() {
  const { atlasTriggerDiag, setAtlasTriggerDiag } = useApp();
  const [showDiag, setShowDiag] = useState(false);

  useEffect(() => {
    if (atlasTriggerDiag) {
      setShowDiag(true);
      setAtlasTriggerDiag(false);
    }
  }, [atlasTriggerDiag, setAtlasTriggerDiag]);

  return (
    <>
      <div className="atlas-layout">
        <MemoryPanel onStartDiagnostic={() => setShowDiag(true)} />
        <div className="atlas-main">
          <TutorChat onStartDiagnostic={() => setShowDiag(true)} />
        </div>
      </div>
      {showDiag && <DiagnosticFlow onClose={() => setShowDiag(false)} />}
    </>
  );
}
