'use client';

import { useState } from 'react';
import Header from '@/components/layout/Header';
import ScenarioSelector from '@/components/simulator/ScenarioSelector';
import SimulatorChat from '@/components/simulator/SimulatorChat';
import type { ScenarioId } from '@/lib/simulatorTypes';

export default function SimulatorPage() {
  const [activeScenario, setActiveScenario] = useState<ScenarioId | null>(null);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {activeScenario ? (
        <SimulatorChat
          key={activeScenario}
          initialScenario={activeScenario}
          onBack={() => setActiveScenario(null)}
        />
      ) : (
        <main className="flex-1">
          <ScenarioSelector onSelect={setActiveScenario} />
        </main>
      )}
    </div>
  );
}
