import React from "react";

const Navbar = () => {
  return (
    // Χρησιμοποιούμε ένα βαθύ μπλε (blue-900) όπως στα επίσημα sites
    <nav className="bg-blue-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center h-16">
          {/* Logo / Title Area */}
          <div className="flex items-center gap-3">
            <div className="bg-white text-blue-900 font-bold h-8 w-8 flex items-center justify-center rounded text-lg">
              DB
            </div>
            <span className="font-semibold text-xl tracking-tight">
              Virtuoso SPARQL Endpoint
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;