'use client';

import { useState, useEffect } from 'react';
import { useRequireFeature } from '../../utils/hooks/useRequireFeature';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';
import Forbidden from '../components/Forbidden';

export default function ResultsPage() {
  const { allowed, loading } = useRequireFeature('results_page');
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    // Set initial render to false after component mounts
    setIsInitialRender(false);
  }, []);

  // Always render the main layout structure to prevent layout shifts
  const renderResultsLayout = (content: React.ReactNode) => (
    <main style={{ 
      maxWidth: 600, 
      margin: '3rem auto', 
      textAlign: 'center',
      backgroundColor: 'transparent',
      minHeight: '400px' // Ensure consistent minimum height
    }}>
      <Card title="Results" icon={<Icon name="trophy" animate />}>
        <div style={{ minHeight: '100px' }}>
          {content}
        </div>
      </Card>
    </main>
  );

  // Loading state with consistent layout structure
  if (loading || isInitialRender) {
    return renderResultsLayout(
      <div className="flex flex-col items-center justify-center py-12">
        <Spinner size={48} />
        <div className="mt-4 text-muted" style={{ color: '#6b7280' }}>Loading results…</div>
      </div>
    );
  }
  
  if (!allowed) return <Forbidden />;

  // Results content
  const resultsContent = (
    <div>
      <p>Browse past draw results here.</p>
      {/* Your results content goes here */}
    </div>
  );

  return renderResultsLayout(resultsContent);
}
