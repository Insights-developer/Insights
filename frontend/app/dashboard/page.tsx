'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Forbidden from '../components/Forbidden';
import PageLayout from '../components/ui/PageLayout';
import Card from '../components/ui/Cards';
import Icon from '../components/ui/Icon';
import Spinner from '../components/ui/Spinner';

// ✅ CENTRALIZED SESSION MANAGEMENT - Updated to use AuthContext pattern

export default function DashboardPage() {
  const auth = useAuth();
  const [mounted, setMounted] = useState(false);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if AuthContext is initialized
  if (!auth.initialized) {
    return (
      <PageLayout 
        title="Dashboard" 
        icon={<Icon name="home" animate={true} />}
      >
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Spinner size={48} />
          <div className="mt-4 text-gray-500">Loading dashboard…</div>
        </div>
      </PageLayout>
    );
  }

  // Check authentication
  if (!auth.user) {
    return (
      <PageLayout 
        title="Dashboard" 
        icon={<Icon name="home" animate={true} />}
      >
        <div className="text-center py-8">
          <p>Please log in to access the dashboard.</p>
        </div>
      </PageLayout>
    );
  }

  // Dashboard is available to all authenticated users
  // Individual features will be checked per card
  return (
    <PageLayout title="Dashboard" icon={<Icon name="home" animate />}>
      <div className="space-y-6">
        {/* Welcome section */}
        <div className="text-center py-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Insights</h2>
          <p className="text-gray-600">Access your lottery tools and analytics</p>
        </div>
        
        {/* Feature cards grid - responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {auth.hasFeature('games_page') && (
            <Card title="Games" icon={<Icon name="gamepad" animate />}>
              <p className="text-gray-600">View or play lottery games.</p>
            </Card>
          )}
          {auth.hasFeature('insights_page') && (
            <Card title="Insights" icon={<Icon name="eye" animate />}>
              <p className="text-gray-600">Analyze draw patterns and trends.</p>
            </Card>
          )}
          {auth.hasFeature('results_page') && (
            <Card title="Results" icon={<Icon name="trophy" animate />}>
              <p className="text-gray-600">Browse past draw results.</p>
            </Card>
          )}
          {auth.hasFeature('draws_page') && (
            <Card title="Draws" icon={<Icon name="shuffle" animate />}>
              <p className="text-gray-600">Participate in lottery draws.</p>
            </Card>
          )}
          {auth.hasFeature('admin_dashboard') && (
            <Card title="Admin" icon={<Icon name="user" animate />}>
              <p className="text-gray-600">Administrative tools and user management.</p>
            </Card>
          )}
          {auth.hasFeature('contact') && (
            <Card title="Contact" icon={<Icon name="mail" animate />}>
              <p className="text-gray-600">Get in touch with support.</p>
            </Card>
          )}
        </div>

        {/* Quick stats or additional info section */}
        {auth.features.length > 0 && (
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-center text-sm text-blue-700">
              <Icon name="user" className="mr-2" />
              <span>You have access to {auth.features.length} feature{auth.features.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Debug information for troubleshooting */}
        {auth.features.length === 0 && (
          <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
            <div className="text-center text-sm text-yellow-700">
              <Icon name="alert-triangle" className="mr-2" />
              <span>No features detected. Please contact your administrator to assign proper access groups.</span>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
