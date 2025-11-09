'use client';

import { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import type { TooltipItem } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface GlucoseReading {
  id: string;
  timestamp: string;
  value: number;
  period: 'Fasting' | 'Before Meal' | 'After Meal' | 'Bedtime' | 'Random';
  notes?: string;
  mealContext?: string;
  medication?: boolean;
}

interface GlucoseStats {
  average: number;
  min: number;
  max: number;
  inRange: number;
  aboveRange: number;
  belowRange: number;
  timeInRange: number;
}

export default function Glucount() {
  const [selectedPeriod, setSelectedPeriod] = useState<'7days' | '30days' | '3months'>('7days');
  const [newReading, setNewReading] = useState({
    value: '',
    period: 'Before Meal' as GlucoseReading['period'],
    notes: '',
    mealContext: '',
    medication: false
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [readings, setReadings] = useState<GlucoseReading[]>([]);
  const [stats, setStats] = useState<GlucoseStats | null>(null);
  const [selectedView, setSelectedView] = useState<'chart' | 'list' | 'trends'>('chart');

  const calculateStats = (data: GlucoseReading[], period: string) => {
    const cutoffDate = new Date();
    switch (period) {
      case '7days':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
      case '3months':
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        break;
    }

    const filteredData = data.filter(reading => new Date(reading.timestamp) >= cutoffDate);
    
    if (filteredData.length === 0) {
      setStats(null);
      return;
    }

    const values = filteredData.map(r => r.value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Target range: 80-180 mg/dL (ADA recommendations)
    const inRange = values.filter(v => v >= 80 && v <= 180).length;
    const aboveRange = values.filter(v => v > 180).length;
    const belowRange = values.filter(v => v < 80).length;
    const timeInRange = (inRange / values.length) * 100;

    setStats({
      average: Math.round(average),
      min,
      max,
      inRange,
      aboveRange,
      belowRange,
      timeInRange: Math.round(timeInRange)
    });
  };

  // Generate comprehensive historical glucose data
  useEffect(() => {
    const generateHistoricalData = (): GlucoseReading[] => {
      const data: GlucoseReading[] = [];
      const now = new Date();
      const periods = ['Fasting', 'Before Meal', 'After Meal', 'Bedtime', 'Random'] as const;
      const mealContexts = ['Breakfast', 'Lunch', 'Dinner', 'Snack', ''];
      const notes = [
        'Feeling good today',
        'Had a large meal',
        'Exercised before reading',
        'Stressed day at work',
        'Forgot medication',
        'Feeling tired',
        'Normal day',
        'Had dessert',
        'Skipped meal',
        ''
      ];

      // Generate last 90 days of data
      for (let i = 90; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Generate 2-4 readings per day
        const readingsPerDay = Math.floor(Math.random() * 3) + 2;
        
        for (let j = 0; j < readingsPerDay; j++) {
          const hour = j === 0 ? 7 : j === 1 ? 12 : j === 2 ? 18 : 22;
          const readingDate = new Date(date);
          readingDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
          
          let baseValue = 120;
          const period = periods[j % periods.length];
          
          // Adjust base value based on period
          switch (period) {
            case 'Fasting':
              baseValue = 95 + Math.random() * 30; // 95-125
              break;
            case 'Before Meal':
              baseValue = 90 + Math.random() * 35; // 90-125
              break;
            case 'After Meal':
              baseValue = 140 + Math.random() * 40; // 140-180
              break;
            case 'Bedtime':
              baseValue = 110 + Math.random() * 30; // 110-140
              break;
            case 'Random':
              baseValue = 100 + Math.random() * 50; // 100-150
              break;
          }
          
          // Add some trending (gradually improving over time)
          const improvementFactor = (90 - i) * 0.1;
          baseValue -= improvementFactor;
          
          // Add daily variation
          const dailyVariation = (Math.random() - 0.5) * 20;
          const finalValue = Math.max(70, Math.min(300, Math.round(baseValue + dailyVariation)));
          
          data.push({
            id: `reading-${i}-${j}`,
            timestamp: readingDate.toISOString(),
            value: finalValue,
            period,
            notes: notes[Math.floor(Math.random() * notes.length)],
            mealContext: period.includes('Meal') ? mealContexts[Math.floor(Math.random() * mealContexts.length)] : '',
            medication: Math.random() > 0.3
          });
        }
      }
      
      return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    // Use a timeout to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      const historicalData = generateHistoricalData();
      setReadings(historicalData);
      calculateStats(historicalData, selectedPeriod);
    }, 0);

    return () => clearTimeout(timer);
  }, [selectedPeriod]);

  const addNewReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReading.value || isNaN(Number(newReading.value))) return;

    const reading: GlucoseReading = {
      id: `reading-${Date.now()}`,
      timestamp: new Date().toISOString(),
      value: Number(newReading.value),
      period: newReading.period,
      notes: newReading.notes,
      mealContext: newReading.mealContext,
      medication: newReading.medication
    };

    const updatedReadings = [reading, ...readings];
    setReadings(updatedReadings);
    calculateStats(updatedReadings, selectedPeriod);
    
    setNewReading({
      value: '',
      period: 'Before Meal',
      notes: '',
      mealContext: '',
      medication: false
    });
    setShowAddForm(false);
  };

  const getFilteredReadings = () => {
    const cutoffDate = new Date();
    switch (selectedPeriod) {
      case '7days':
        cutoffDate.setDate(cutoffDate.getDate() - 7);
        break;
      case '30days':
        cutoffDate.setDate(cutoffDate.getDate() - 30);
        break;
      case '3months':
        cutoffDate.setDate(cutoffDate.getDate() - 90);
        break;
    }
    return readings.filter(reading => new Date(reading.timestamp) >= cutoffDate);
  };

  const getChartData = () => {
    const filteredReadings = getFilteredReadings();
    const chartReadings = filteredReadings.slice(0, 50).reverse(); // Limit for chart readability
    
    const labels = chartReadings.map(reading => {
      const date = new Date(reading.timestamp);
      return selectedPeriod === '7days' 
        ? date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    const data = chartReadings.map(reading => reading.value);

    return {
      labels,
      datasets: [
        {
          label: 'Blood Glucose (mg/dL)',
          data,
          borderColor: '#3B82F6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.3,
          pointBackgroundColor: data.map(value => {
            if (value < 80) return '#EF4444'; // Red for low
            if (value > 180) return '#F59E0B'; // Orange for high
            return '#10B981'; // Green for normal
          }),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 5,
        }
      ],
    };
  };

  const getTrendData = () => {
    const filteredReadings = getFilteredReadings();
    const periods = ['Fasting', 'Before Meal', 'After Meal', 'Bedtime'];
    
    const data = periods.map(period => {
      const periodReadings = filteredReadings.filter(r => r.period === period);
      const average = periodReadings.length > 0 
        ? periodReadings.reduce((sum, r) => sum + r.value, 0) / periodReadings.length
        : 0;
      return Math.round(average);
    });

    return {
      labels: periods,
      datasets: [
        {
          label: 'Average Glucose by Period',
          data,
          backgroundColor: [
            'rgba(99, 102, 241, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(139, 92, 246, 0.8)',
          ],
          borderColor: [
            'rgb(99, 102, 241)',
            'rgb(16, 185, 129)',
            'rgb(245, 158, 11)',
            'rgb(139, 92, 246)',
          ],
          borderWidth: 2,
        },
      ],
    };
  };

  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { status: 'Very Low', color: 'text-red-600', bg: 'bg-red-100' };
    if (value < 80) return { status: 'Low', color: 'text-orange-600', bg: 'bg-orange-100' };
    if (value <= 180) return { status: 'Normal', color: 'text-green-600', bg: 'bg-green-100' };
    if (value <= 250) return { status: 'High', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'Very High', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 60,
        max: 250,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: number | string) {
            return value + ' mg/dL';
          }
        }
      },
      x: {
        grid: {
          display: false,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: TooltipItem<'line'>) {
            const value = tooltipItem.parsed.y;
            return value !== null ? `${value} mg/dL` : '';
          },
        },
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(tooltipItem: TooltipItem<'bar'>) {
            const value = tooltipItem.parsed.y;
            return value !== null ? `Average: ${value} mg/dL` : '';
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        min: 80,
        max: 200,
        ticks: {
          callback: function(value: number | string) {
            return value + ' mg/dL';
          }
        }
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Glucose Tracking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor and track your blood glucose levels to better manage your Type 2 diabetes
          </p>
          
          {/* Period Selector */}
          <div className="flex justify-center mt-6">
            <div className="bg-white rounded-lg p-1 shadow-md">
              {(['7days', '30days', '3months'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedPeriod === period
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {period === '7days' ? '7 Days' : period === '30days' ? '30 Days' : '3 Months'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.average}</div>
              <div className="text-gray-600">Average Level</div>
              <div className="text-sm text-gray-500">mg/dL</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.timeInRange}%</div>
              <div className="text-gray-600">Time in Range</div>
              <div className="text-sm text-gray-500">80-180 mg/dL</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.min}</div>
              <div className="text-gray-600">Lowest</div>
              <div className="text-sm text-gray-500">mg/dL</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.max}</div>
              <div className="text-gray-600">Highest</div>
              <div className="text-sm text-gray-500">mg/dL</div>
            </div>
          </div>
        )}

        {/* Add Reading Button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
          >
            ➕ Add New Reading
          </button>
        </div>

        {/* Add Reading Form */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Add New Glucose Reading</h3>
            <form onSubmit={addNewReading} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Glucose Level (mg/dL)
                </label>
                <input
                  type="number"
                  min="50"
                  max="400"
                  value={newReading.value}
                  onChange={(e) => setNewReading({...newReading, value: e.target.value})}
                  placeholder="Enter glucose level"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time Period
                </label>
                <select 
                  value={newReading.period}
                  onChange={(e) => setNewReading({...newReading, period: e.target.value as GlucoseReading['period']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                >
                  <option value="Fasting">Fasting</option>
                  <option value="Before Meal">Before Meal</option>
                  <option value="After Meal">After Meal</option>
                  <option value="Bedtime">Bedtime</option>
                  <option value="Random">Random</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Context (optional)
                </label>
                <input
                  type="text"
                  value={newReading.mealContext}
                  onChange={(e) => setNewReading({...newReading, mealContext: e.target.value})}
                  placeholder="e.g., Breakfast, Lunch"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={newReading.notes}
                  onChange={(e) => setNewReading({...newReading, notes: e.target.value})}
                  placeholder="Any additional notes..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="medication"
                  checked={newReading.medication}
                  onChange={(e) => setNewReading({...newReading, medication: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="medication" className="text-sm text-gray-700">
                  Taken with medication
                </label>
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
                >
                  Add Reading
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* View Selector */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-md">
            {(['chart', 'trends', 'list'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setSelectedView(view)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedView === view
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {view === 'chart' ? 'Chart' : view === 'trends' ? 'Trends' : 'List'}
              </button>
            ))}
          </div>
        </div>

        {/* Chart View */}
        {selectedView === 'chart' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              📈 Glucose Trends - {selectedPeriod === '7days' ? '7 Days' : selectedPeriod === '30days' ? '30 Days' : '3 Months'}
            </h2>
            <div className="h-96">
              <Line data={getChartData()} options={chartOptions} />
            </div>
            <div className="mt-4 flex justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                <span>Normal (80-180 mg/dL)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                <span>High (&gt;180 mg/dL)</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                <span>Low (&lt;80 mg/dL)</span>
              </div>
            </div>
          </div>
        )}

        {/* Trends View */}
        {selectedView === 'trends' && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              📊 Average by Time Period
            </h2>
            <div className="h-96">
              <Bar data={getTrendData()} options={barChartOptions} />
            </div>
          </div>
        )}

        {/* List View */}
        {selectedView === 'list' && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b">
              <h2 className="text-2xl font-semibold text-gray-900">
                Recent Readings
              </h2>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {getFilteredReadings().slice(0, 20).map((reading) => {
                const status = getGlucoseStatus(reading.value);
                return (
                  <div key={reading.id} className="p-4 border-b hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-gray-900">
                            {reading.value}
                            <span className="text-sm font-normal text-gray-500 ml-1">mg/dL</span>
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                            {status.status}
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-4 text-sm text-gray-600">
                          <span>📅 {formatDate(reading.timestamp)}</span>
                          <span>🕐 {reading.period}</span>
                          {reading.mealContext && <span>🍽️ {reading.mealContext}</span>}
                          {reading.medication && <span>💊 With Medication</span>}
                        </div>
                        {reading.notes && (
                          <div className="mt-2 text-sm text-gray-500">
                            📝 {reading.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Diabetes Management Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Target Ranges</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                <span className="font-medium">Before meals</span>
                <span className="text-blue-600">80-130 mg/dL</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                <span className="font-medium">After meals (2 hours)</span>
                <span className="text-green-600">&lt;180 mg/dL</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                <span className="font-medium">Bedtime</span>
                <span className="text-purple-600">100-140 mg/dL</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Management Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Check glucose 2 hours after meals</li>
              <li>• Log readings consistently for better patterns</li>
              <li>• Note what affects your levels (food, exercise, stress)</li>
              <li>• Share data with your healthcare provider</li>
              <li>• Monitor for trends, not just individual readings</li>
              <li>• Keep glucose tablets handy for low readings</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}