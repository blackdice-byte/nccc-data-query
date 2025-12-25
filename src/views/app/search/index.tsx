import { useState, useEffect, useCallback } from "react";
import {
  Search as SearchIcon,
  Mic,
  Clock,
  TrendingUp,
  Loader2,
  FileText,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSocket } from "@/config/socket";
import { SearchTable } from "./search-table";
import { searchColumns, type SearchResult } from "./search-columns";
import { useAuthStore } from "@/store/auth.store";

const trendingSearches = [
  "Environmental compliance contracts",
  "Subsea installation services",
  "Pipeline maintenance 2024",
];

type SearchTab = "all" | "ai-mode" | "documents" | "contracts";

const Search = () => {
  const { recentSearches } = useAuthStore();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchStatus, setSearchStatus] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");

  useEffect(() => {
    const socket = getSocket();

    socket.on("contract:search:start", (data: { message: string }) => {
      setSearchStatus(data.message);
      setResults([]);
    });

    socket.on(
      "contract:search:progress",
      (data: { message: string; count: number }) => {
        setSearchStatus(data.message);
      }
    );

    socket.on("contract:search:result", (data: { contract: SearchResult }) => {
      setResults((prev) => [...prev, data.contract]);
    });

    socket.on(
      "contract:search:complete",
      (data: { message: string; total: number }) => {
        setSearchStatus(`${data.total} results found`);
        setIsSearching(false);
      }
    );

    socket.on("contract:search:error", (data: { message: string }) => {
      setSearchStatus(`Error: ${data.message}`);
      setIsSearching(false);
    });

    return () => {
      socket.off("contract:search:start");
      socket.off("contract:search:progress");
      socket.off("contract:search:result");
      socket.off("contract:search:complete");
      socket.off("contract:search:error");
    };
  }, []);

  const handleSearch = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      if (!query.trim()) return;

      const socket = getSocket();
      setIsSearching(true);
      setHasSearched(true);
      setResults([]);
      setSearchStatus("Connecting...");

      socket.emit("contract:search", { query: query.trim(), tab: activeTab });
    },
    [query, activeTab]
  );

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  const handleClearSearch = () => {
    setQuery("");
    setHasSearched(false);
    setResults([]);
    setSearchStatus("");
  };

  const tabs: { id: SearchTab; label: string }[] = [
    { id: "all", label: "All" },
    { id: "ai-mode", label: "AI Mode" },
    { id: "documents", label: "Documents" },
    { id: "contracts", label: "Contracts" },
  ];

  // Get display recent searches - from API or fallback
  const displayRecentSearches =
    recentSearches.length > 0
      ? recentSearches.map((s) => s.query + " .........")
      : [
          "SEPLAT drilling contracts 2023",
          "Offshore maintenance services",
          "NNPC wireline agreements",
        ];

  // Results view - search bar at top left with tabs
  if (hasSearched) {
    return (
      <div className="min-h-[calc(100vh-3.5rem)]">
        {/* Top search bar */}
        <div className="border-b bg-background sticky top-0 z-10">
          <div className="px-6 py-4">
            <form onSubmit={handleSearch} className="flex items-center gap-4">
              <h1
                className="text-xl font-bold cursor-pointer"
                onClick={handleClearSearch}
              >
                DocQuery
              </h1>
              <div className="relative flex items-center max-w-xl flex-1">
                <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full h-10 pl-10 pr-20 rounded-full border-2"
                  disabled={isSearching}
                />
                <div className="absolute right-2 flex items-center gap-1">
                  {query && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setQuery("")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                  >
                    <Mic className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    type="submit"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    disabled={isSearching}
                  >
                    <SearchIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>
          </div>

          {/* Tabs */}
          <div className="px-6 flex items-center gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results content */}
        <div className="px-6 py-4">
          {/* Search Status */}
          {searchStatus && (
            <p className="text-sm text-muted-foreground mb-4">{searchStatus}</p>
          )}

          {/* Loading state */}
          {isSearching && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Searching...</span>
            </div>
          )}

          {/* Results Table */}
          {results.length > 0 && (
            <SearchTable columns={searchColumns} data={results} />
          )}

          {/* No Results */}
          {!isSearching && results.length === 0 && (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No NCCC contracts found</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Initial centered search view
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-3.5rem)] px-4 py-8">
      <div className="w-full max-w-6xl space-y-6">
        {/* Logo/Title */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">DocQuery</h1>
          <p className="text-muted-foreground">
            Search NCCC contracts, documents, and more
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
          <div className="relative flex items-center">
            <SearchIcon className="absolute left-4 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by month, year, operator, contractor, contract title, contract number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-12 text-base rounded-full border-2 focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isSearching}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-2 h-8 w-8 rounded-full"
              disabled={isSearching}
            >
              <Mic className="h-5 w-5 text-muted-foreground" />
            </Button>
          </div>

          {/* Search Buttons */}
          <div className="flex justify-center gap-3 mt-6">
            <Button type="submit" variant="secondary" disabled={isSearching}>
              {isSearching ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search NCCC Documents"
              )}
            </Button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="grid md:grid-cols-2 gap-6 pt-4 max-w-3xl mx-auto">
          {/* Recent Searches */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              Recent Searches
            </div>
            <ul className="space-y-2">
              {displayRecentSearches.slice(0, 5).map((item, index) => (
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
