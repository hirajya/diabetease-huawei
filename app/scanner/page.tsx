export default function Scanner() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Food Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Scan food labels and barcodes to get instant nutritional information and carb counts.
          </p>
        </div>

        {/* Scanner Interface */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Camera/Scanner Area */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Scan Product
            </h2>
            <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center text-gray-500">
                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="mb-4">Camera preview will appear here</p>
                <p className="text-sm">Position the barcode or nutrition label in the frame</p>
              </div>
            </div>
            <div className="flex gap-4">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md transition-colors">
                Start Camera
              </button>
              <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-md transition-colors">
                Upload Photo
              </button>
            </div>
          </div>

          {/* Manual Entry */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">
              Manual Entry
            </h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Enter barcode number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Serving Size
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 1 cup"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Carbs (g)
                  </label>
                  <input
                    type="number"
                    placeholder="Enter carbs"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition-colors"
              >
                Add to Log
              </button>
            </form>
          </div>
        </div>

        {/* Recent Scans */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Recent Scans
          </h2>
          <div className="space-y-4">
            <div className="text-center text-gray-500 py-8">
              No recent scans.
              <br />
              Start scanning products to see your history here!
            </div>
          </div>
        </div>

        {/* Quick Access Foods */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            Common Foods
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { name: 'Apple', carbs: '25g', icon: '🍎' },
              { name: 'Banana', carbs: '27g', icon: '🍌' },
              { name: 'Bread Slice', carbs: '15g', icon: '🍞' },
              { name: 'Rice (1 cup)', carbs: '45g', icon: '🍚' },
              { name: 'Pasta (1 cup)', carbs: '43g', icon: '🍝' },
              { name: 'Orange', carbs: '15g', icon: '🍊' },
            ].map((food, index) => (
              <div
                key={index}
                className="bg-gray-50 p-4 rounded-lg text-center hover:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="text-2xl mb-2">{food.icon}</div>
                <div className="font-medium text-gray-900 text-sm">{food.name}</div>
                <div className="text-xs text-gray-600">{food.carbs} carbs</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button className="text-blue-600 hover:text-blue-700 font-medium transition-colors">
              View All Common Foods →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}