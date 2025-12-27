import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, FileText, Zap } from "lucide-react";
import { GridScan } from "@/components/GridScan";

const Home = () => {
  return (
    <div className="flex flex-col w-full h-full relative">
      {/* Hero Section */}
      <section className="min-h-screen h-full relative w-full flex flex-col items-center justify-center text-center px-4">
        {/* GridScan Background */}
        <div className="absolute inset-0 z-0 opacity-20">
          <GridScan
            sensitivity={0.55}
            lineThickness={1}
            linesColor="#392e4e"
            gridScale={0.1}
            scanColor="#FF9FFC"
            scanOpacity={0.4}
            enablePost
            bloomIntensity={0.6}
            chromaticAberration={0.002}
            noiseIntensity={0.01}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="text-primary">NCCC</span> Portal
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mb-10">
            Search through thousands of NCCC contract documents with powerful
            query capabilities. Get direct links to the files you need in
            seconds.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link to="/auth/signin">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-center mb-10">
            Why NCCC Portal?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">Smart Search</h3>
              <p className="text-sm text-muted-foreground">
                Advanced search algorithms to find exactly what you're looking
                for.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <FileText className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">PDF Access</h3>
              <p className="text-sm text-muted-foreground">
                Direct links to PDF documents for quick viewing and download.
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="font-medium mb-2">Fast Results</h3>
              <p className="text-sm text-muted-foreground">
                Get search results in milliseconds, not minutes.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
