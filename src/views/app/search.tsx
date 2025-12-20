import { useState } from "react";
import { Search as SearchIcon, Mic, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const recentSearches = [
  "SEPLAT drilling contracts 2023",
  "Offshore maintenance services",
  "NNPC wireline agreements",
];

const trendingSearches = [
  "Environmental compliance contracts",
  "Subsea installation services",
  "Pipeline maintenance 2024",
];

const Search = () => {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("Searching for:", query);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">DocQuery</h1>
          <p className="text-muted-foreground">
            Search contracts, documents, and more
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search documents, contracts, operators..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-12 text-base rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 h-8 w-8 rounded-full"
            >
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Search Buttons */}
          <div className="flex justify-center gap-3 mt-6">
            <Button type="submit" variant="secondary">
              Search Documents
            </Button>
            <Button type="button" variant="secondary">
              I'm Feeling Lucky
            </Button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="grid md:grid-cols-2 gap-6 pt-4">
          {/* Recent Searches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Recent Searches
            </div>
            <ul className="space-y-2">
              {recentSearches.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSuggestionClick(item)}
                    className="text-sm text-left w-full px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Trending Searches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              Trending Searches
            </div>
            <ul className="space-y-2">
              {trendingSearches.map((item, index) => (
                <li key={index}>
                  <button
                    onClick={() => handleSuggestionClick(item)}
                    className="text-sm text-left w-full px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Search;
