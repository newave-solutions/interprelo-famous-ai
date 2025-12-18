import React, { useState } from 'react';
import { Search, Filter, Grid, List } from 'lucide-react';
import ScenarioCard from '../cards/ScenarioCard';
import { scenarios, Scenario } from '../../data/appData';

interface ScenarioLibraryProps {
  onSelectScenario: (scenario: Scenario) => void;
}

const categories = ['All', 'Emergency', 'Pediatrics', 'Oncology', 'Surgical', 'Obstetrics', 'Palliative Care', 'Mental Health', 'Chronic Care'];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const ScenarioLibrary: React.FC<ScenarioLibraryProps> = ({ onSelectScenario }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          scenario.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || scenario.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || scenario.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Practice Scenarios</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose from our library of realistic medical scenarios. Each scenario is designed 
            to challenge and improve specific aspects of your vocal delivery.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5F8D]/20 focus:border-[#2C5F8D]"
              />
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5F8D]/20 focus:border-[#2C5F8D]"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2C5F8D]/20 focus:border-[#2C5F8D]"
            >
              {difficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-[#2C5F8D]' : 'text-gray-400'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-[#2C5F8D]' : 'text-gray-400'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredScenarios.length}</span> scenarios
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select className="text-sm text-gray-700 font-medium bg-transparent border-none focus:outline-none cursor-pointer">
              <option>Recommended</option>
              <option>Difficulty</option>
              <option>Duration</option>
              <option>Recently Added</option>
            </select>
          </div>
        </div>

        {/* Scenario Grid */}
        {viewMode === 'grid' ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredScenarios.map(scenario => (
              <ScenarioCard
                key={scenario.id}
                scenario={scenario}
                onClick={onSelectScenario}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredScenarios.map(scenario => (
              <div
                key={scenario.id}
                onClick={() => scenario.unlocked && onSelectScenario(scenario)}
                className={`flex items-center gap-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all ${
                  scenario.unlocked ? 'hover:shadow-md cursor-pointer' : 'opacity-70 cursor-not-allowed'
                }`}
              >
                <img
                  src={scenario.image}
                  alt={scenario.title}
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-800">{scenario.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      scenario.difficulty === 'Beginner' ? 'bg-green-100 text-green-700' :
                      scenario.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {scenario.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{scenario.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{scenario.category}</span>
                    <span>{scenario.duration}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredScenarios.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No scenarios match your filters. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ScenarioLibrary;
