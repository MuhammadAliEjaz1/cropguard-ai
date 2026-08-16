import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, ChevronDown } from 'lucide-react';

function Navbar() {
  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);
  const location = useLocation();

  // Core tools stay inline. Everything else lives under "More" so the bar
  // doesn't wrap into a messy multi-line header as pages keep getting added.
  const mainLinks = [
    { path: '/',        label: 'Home' },
    { path: '/detect',  label: 'Detect Disease' },
    { path: '/pest', label: 'Pest ID' },
    { path: '/chat',    label: 'Ask AI' },
    { path: '/calendar', label: 'Crop Calendar' },
    { path: '/fertilizer', label: 'Fertilizer Calc' },
    { path: '/map', label: 'Disease Map' },
  ];

  const moreLinks = [
    { path: '/weather', label: 'Weather' },
    { path: '/mandi-rates', label: 'Mandi Rates' },
    { path: '/analytics', label: 'Insights' },
    { path: '/about',   label: 'About' },
  ];

  const allLinks = [...mainLinks, ...moreLinks];
  const isMoreActive = moreLinks.some(l => l.path === location.pathname);

  // Close the "More" dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <nav className="bg-green-700 text-white shadow-lg relative">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold flex-shrink-0">
          <Leaf size={24} />
          CropGuard AI
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          {mainLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              className={`hover:text-green-200 transition whitespace-nowrap ${
                location.pathname === l.path ? 'text-green-200 font-semibold' : ''
              }`}
            >
              {l.label}
            </Link>
          ))}

          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setMoreOpen(o => !o)}
              className={`flex items-center gap-1 hover:text-green-200 transition whitespace-nowrap ${
                isMoreActive ? 'text-green-200 font-semibold' : ''
              }`}
            >
              More <ChevronDown size={15} className={`transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            {moreOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white text-gray-700 rounded-lg shadow-lg border border-gray-100 py-1.5 min-w-[160px] z-50">
                {moreLinks.map(l => (
                  <Link
                    key={l.path}
                    to={l.path}
                    onClick={() => setMoreOpen(false)}
                    className={`block px-4 py-2 text-sm hover:bg-green-50 hover:text-green-700 transition ${
                      location.pathname === l.path ? 'text-green-700 font-semibold bg-green-50' : ''
                    }`}
                  >
                    {l.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Mobile */}
        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-green-800 px-4 pb-4 flex flex-col gap-3">
          {allLinks.map(l => (
            <Link
              key={l.path}
              to={l.path}
              onClick={() => setOpen(false)}
              className="hover:text-green-200 transition"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
