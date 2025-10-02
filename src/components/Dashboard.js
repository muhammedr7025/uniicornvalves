// FIXED: Dashboard.js - Shows accurate real-time data
// Location: src/components/Dashboard.js
// Action: REPLACE existing file

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  FileText, 
  TrendingUp, 
  Package,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';

function Dashboard({ userRole, customers, modules }) {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalCustomers: 0,
    totalQuotes: 0,
    totalModules: 0,
    recentQuotes: [],
    monthlyGrowth: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load quotes from Firestore
      const quotesRef = collection(db, 'quotes');
      const quotesSnapshot = await getDocs(quotesRef);
      const quotes = quotesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Load customers from Firestore
      const customersRef = collection(db, 'customers');
      const customersSnapshot = await getDocs(customersRef);
      const firestoreCustomers = customersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Load modules from Firestore
      const modulesRef = collection(db, 'modules');
      const modulesSnapshot = await getDocs(modulesRef);
      const firestoreModules = modulesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate total sales from quotes
      const totalSales = quotes.reduce((sum, quote) => sum + (parseFloat(quote.total) || 0), 0);

      // Get recent quotes (last 5, sorted by date)
      const recentQuotes = quotes
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB - dateA;
        })
        .slice(0, 5);

      // Calculate this month's growth
      const now = new Date();
      const thisMonth = quotes.filter(q => {
        if (!q.createdAt) return false;
        const quoteDate = new Date(q.createdAt);
        return quoteDate.getMonth() === now.getMonth() && 
               quoteDate.getFullYear() === now.getFullYear();
      });

      const lastMonth = quotes.filter(q => {
        if (!q.createdAt) return false;
        const quoteDate = new Date(q.createdAt);
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        return quoteDate.getMonth() === lastMonthDate.getMonth() && 
               quoteDate.getFullYear() === lastMonthDate.getFullYear();
      });

      const monthlyGrowth = lastMonth.length > 0 
        ? Math.round(((thisMonth.length - lastMonth.length) / lastMonth.length) * 100)
        : thisMonth.length > 0 ? 100 : 0;

      // Use Firestore data if available, otherwise use props
      const customerCount = firestoreCustomers.length > 0 ? firestoreCustomers.length : (customers?.length || 0);
      const moduleCount = firestoreModules.length > 0 ? firestoreModules.length : (modules?.length || 0);

      setStats({
        totalSales,
        totalCustomers: customerCount,
        totalQuotes: quotes.length,
        totalModules: moduleCount,
        recentQuotes,
        monthlyGrowth
      });

      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading dashboard:', error);
      
      // If Firestore fails, use local data
      setStats({
        totalSales: 0,
        totalCustomers: customers?.length || 0,
        totalQuotes: 0,
        totalModules: modules?.length || 0,
        recentQuotes: [],
        monthlyGrowth: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
    <div className="bg-white rounded-xl shadow-md p-6 border-l-4 hover:shadow-lg transition transform hover:-translate-y-1" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mt-2">{value}</h3>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && trend !== 0 && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp size={16} className={trend > 0 ? "text-green-600" : "text-red-600"} />
              <span className={`text-sm font-medium ${trend > 0 ? "text-green-600" : "text-red-600"}`}>
                {trend > 0 ? '+' : ''}{trend}% this month
              </span>
            </div>
          )}
        </div>
        <div className="p-4 rounded-full" style={{ backgroundColor: `${color}15` }}>
          <Icon size={32} style={{ color }} />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {userRole === 'admin' ? '👨‍💼 Admin Dashboard' : '👷 Employee Dashboard'}
            </h1>
            <p className="text-indigo-100">
              Welcome back! Here's what's happening with your business today.
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={loadDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-sm"
              title="Refresh data"
            >
              <RefreshCw size={18} />
              <span className="text-sm">Refresh</span>
            </button>
            <p className="text-xs text-indigo-200 mt-2">
              Last updated: {lastRefresh.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={DollarSign}
          title="Total Sales"
          value={`$${stats.totalSales.toLocaleString()}`}
          subtitle="All time revenue"
          color="#10b981"
          trend={stats.monthlyGrowth}
        />
        
        <StatCard
          icon={FileText}
          title="Total Quotes"
          value={stats.totalQuotes}
          subtitle="Generated quotes"
          color="#6366f1"
        />
        
        <StatCard
          icon={Users}
          title="Customers"
          value={stats.totalCustomers}
          subtitle="Active customers"
          color="#f59e0b"
        />
        
        <StatCard
          icon={Package}
          title="Modules"
          value={stats.totalModules}
          subtitle="Available modules"
          color="#8b5cf6"
        />
      </div>

      {/* Info Box if no data */}
      {stats.totalQuotes === 0 && stats.totalCustomers === 0 && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="text-blue-600 text-4xl">💡</div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Getting Started</h3>
              <p className="text-blue-800 mb-3">
                {userRole === 'admin' 
                  ? 'Start by adding customers and modules in the "Manage Data" tab. Then your employees can generate quotes!'
                  : 'Ask your admin to add customers and modules first. Then you can start generating quotes!'}
              </p>
              <ul className="text-sm text-blue-700 space-y-1 ml-4 list-disc">
                {userRole === 'admin' ? (
                  <>
                    <li>Go to "Manage Data" tab</li>
                    <li>Add at least one customer</li>
                    <li>Add modules with pricing</li>
                    <li>Employees can then generate quotes</li>
                  </>
                ) : (
                  <>
                    <li>Wait for admin to add customers</li>
                    <li>Wait for admin to add modules</li>
                    <li>Then go to "Generate Quote" tab</li>
                    <li>Create your first quote!</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Recent Quotes */}
      {stats.recentQuotes.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="text-indigo-600" />
              Recent Quotes
            </h2>
            <span className="text-sm text-gray-500">Last 5 quotes</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quote #</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Amount</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentQuotes.map((quote) => (
                  <tr key={quote.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-indigo-600">
                      {quote.quoteNumber || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {quote.customerName || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {quote.date || new Date(quote.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-right text-gray-900">
                      ${(parseFloat(quote.total) || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        ✓ Completed
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State for Recent Quotes */}
      {stats.totalQuotes === 0 && (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
          <FileText className="mx-auto text-gray-400 mb-4" size={64} />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Quotes Generated Yet</h3>
          <p className="text-gray-500 mb-4">
            {userRole === 'admin' 
              ? 'Quotes generated by employees will appear here.'
              : 'Start creating quotes to see them listed here.'}
          </p>
          {userRole === 'employee' && stats.totalCustomers > 0 && stats.totalModules > 0 && (
            <button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium">
              Go to Generate Quote →
            </button>
          )}
        </div>
      )}

      {/* Quick Stats Summary */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
        <h3 className="font-bold text-gray-800 mb-4">📊 Quick Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-indigo-600">{stats.totalCustomers}</p>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Customers</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{stats.totalModules}</p>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Modules</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.totalQuotes}</p>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Quotes</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-orange-600">${stats.totalSales.toLocaleString()}</p>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Revenue</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;