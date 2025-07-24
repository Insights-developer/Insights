'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
export default function ResultsPage() {
  return (
    <FeatureGate feature="results_page">
      <main style={{ 
        maxWidth: 600, 
        margin: '3rem auto', 
        textAlign: 'center',
        backgroundColor: 'transparent',
        minHeight: '400px'
      }}>
        <Card title="Results" icon={<Icon name="trophy" animate />}>
          <div style={{ minHeight: '100px' }}>
            <div>
              <p>Browse past draw results here.</p>
              {/* Your results content goes here */}
            </div>
          </div>
        </Card>
      </main>
    </FeatureGate>
  );
}
