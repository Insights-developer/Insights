'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
export default function GamesPage() {
  return (
    <FeatureGate feature="games_page">
      <main style={{ 
        maxWidth: 600, 
        margin: '3rem auto', 
        textAlign: 'center',
        backgroundColor: 'transparent',
        minHeight: '400px'
      }}>
        <Card title="Games" icon={<Icon name="gamepad" animate />}>
          <div style={{ minHeight: '100px' }}>
            <div>
              <p>Welcome to the Games page. View or play lottery games here.</p>
              {/* ...your games page content... */}
            </div>
          </div>
        </Card>
      </main>
    </FeatureGate>
  );
}
