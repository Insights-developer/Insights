'use client';

import { FeatureGate } from '@/utils/hooks/useRequireFeatureNew';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext/FeatureGate pattern
export default function InsightsPage() {
  return (
    <FeatureGate feature="insights_page">
      <main style={{ 
        maxWidth: 600, 
        margin: '3rem auto', 
        textAlign: 'center',
        backgroundColor: 'transparent',
        minHeight: '400px'
      }}>
        <Card title="Insights" icon={<Icon name="eye" animate />}>
          <div style={{ minHeight: '100px' }}>
            <div style={{ padding: '1rem 0' }}>
              <p style={{ marginBottom: '1rem', color: '#4a5568' }}>
                Analyze lottery patterns and trends to make informed decisions.
              </p>
              <div style={{ marginTop: '2rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  Coming Soon
                </h3>
                <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                  Advanced analytics and insights tools are in development.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </FeatureGate>
  );
}
