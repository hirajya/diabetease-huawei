export default function Glucount() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Glucose Tracking
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Monitor and track your blood glucose levels to better manage your diabetes page.tsx ng glucount .
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">--</div>
            <div className="text-gray-600">Current Level</div>
            <div className="text-sm text-gray-500">mg/dL</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">--</div>
            <div className="text-gray-600">7-Day Average</div>
            <div className="text-sm text-gray-500">mg/dL</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">--</div>
            <div className="text-gray-600">Time in Range</div>
            <div className="text-sm text-gray-500">%</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Add Reading Form */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Add New Reading
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Glucose Level (mg/dL)
                </label>
                <input
                  type="number"
                  placeholder="Enter glucose level"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Time of Reading
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900">
                  <option>Before breakfast</option>
                  <option>After breakfast</option>
                  <option>Before lunch</option>
                  <option>After lunch</option>
                  <option>Before dinner</option>
                  <option>After dinner</option>
                  <option>Before bedtime</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Add Reading
              </button>
            </form>
          </div>

          {/* Recent Readings */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Recent Readings
            </h2>
            <div className="space-y-4">
              <div className="text-center text-gray-500 py-8">
                No readings recorded yet.
                <br />
                Add your first reading to get started!
              </div>
            </div>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Glucose Trends
            </h2>
            <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p>Chart will appear here once you have readings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}