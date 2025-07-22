'use client';

import { useState, useEffect } from 'react';
import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';

export default function InsightsPage() {
  const { allowed, loading } = useRequireFeature('insights_page');
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Set initial render to false after component mounts
    setIsInitialRender(false);
  }, []);

  // Always render the main layout structure to prevent layout shifts
  const renderInsightsLayout = (content: React.ReactNode) => (
    <main style={{ 
      maxWidth: 600, 
      margin: '3rem auto', 
      textAlign: 'center',
      backgroundColor: 'transparent',
      minHeight: '400px' // Ensure consistent minimum height
    }}>
      <Card title="Insights" icon={<Icon name="eye" animate />}>
        <div style={{ minHeight: '100px' }}>
          {content}
        </div>
      </Card>
    </main>
  );

  // Loading state with consistent layout structure
  if (loading || isInitialRender) {
    return renderInsightsLayout(
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size={48} />
        <div className="mt-4 text-muted" style={{ color: '#6b7280' }}>Loading insights…</div>
      </div>
    );
  }

  if (!allowed) return null; // or <div>Access denied.</div>;

  // Insights content
  const insightsContent = (
    <div>
      <p>Analyze draw patterns and trends here.</p>
      {/* Place your insights-related content here */}
    </div>
  );

  return renderInsightsLayout(insightsContent);
}
