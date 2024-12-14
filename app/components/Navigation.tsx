const Navbar = () => {
    return (
      <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <a href="/" className="text-xl font-bold hover:text-blue-200">
                Plant Identifier
              </a>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <a href="/" className="hover:bg-blue-800 px-3 py-2 rounded-md transition-colors">
                  Home
                </a>
                <a href="/about" className="hover:bg-blue-800 px-3 py-2 rounded-md transition-colors">
                  About
                </a>
                <a href="/contact" className="hover:bg-blue-800 px-3 py-2 rounded-md transition-colors">
                  Contact
                </a>
                <a href="/guide" className="hover:bg-blue-800 px-3 py-2 rounded-md transition-colors">
                  Plant Guide
                </a>
              </div>
            </div>
  
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button className="p-2 rounded-md hover:bg-blue-800">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }
  
  export default Navbar