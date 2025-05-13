'use client';
import './browse-pods.css';
import { useEffect, useState, useMemo } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CircuitBoard, 
  Cpu, 
  HardDrive, 
  MemoryStick, 
  Wifi, 
  MapPin, 
  Clock, 
  Server,
  SlidersHorizontal,
  X,
  Grid,
  LayoutDashboard,
  Menu
} from 'lucide-react';
import Logo from '../components/Logo';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type Pod = {
  id: string;
  price: number;
  gpu_display: string;
  cpu_display: string;
  memory?: number | null;
  disk?: number | null;
  network_up?: number | null;
  network_down?: number | null;
  location: { city?: string; country?: string };
  ports?: number | null;
  uptime_display: string;
  gpu_types: string[];
};

const PAGE_SIZE = 8;

export default function BrowsePodsPage() {
  const pathname = usePathname();
  const [pods, setPods] = useState<Pod[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // filtres
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('');
  const [gpuCountFilter, setGpuCountFilter] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [gpuTypeFilter, setGpuTypeFilter] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  // fetch des pods
  useEffect(() => {
    fetch('/api/offers')
      .then(r => r.json())
      .then(data => setPods(Array.isArray(data) ? data : []))
      .catch(() => setPods([]))
      .finally(() => setLoading(false));
  }, []);

  // options filtres
  const locations = useMemo(() => {
    const s = new Set<string>();
    pods.forEach(p => {
      const label = [p.location.city, p.location.country]
        .filter(Boolean)
        .join(', ');
      if (label) s.add(label);
    });
    return Array.from(s);
  }, [pods]);

  const gpuTypes = useMemo(() => {
    const s = new Set<string>();
    pods.forEach(p => p.gpu_types.forEach(t => t && s.add(t)));
    return Array.from(s);
  }, [pods]);

  // application des filtres
  const filtered = useMemo(() => {
    return pods
      .filter(p => p.gpu_display.toLowerCase().includes(search.toLowerCase()))
      .filter(
        p =>
          !locFilter ||
          `${p.location.city}, ${p.location.country}` === locFilter
      )
      .filter(p =>
        gpuCountFilter ? p.gpu_display.startsWith(`${gpuCountFilter}x`) : true
      )
      .filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])
      .filter(p =>
        gpuTypeFilter.length === 0
          ? true
          : p.gpu_types.some(t => gpuTypeFilter.includes(t))
      );
  }, [pods, search, locFilter, gpuCountFilter, priceRange, gpuTypeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageItems = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  // Fonction pour lancer le checkout Stripe
  const handleRent = async (podId: string) => {
    const userEmail = prompt('Please enter your email');
    if (!userEmail) return;

    setLoadingCheckout(true);
    try {
      const res = await fetch('/api/checkout_sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: podId, userEmail }),
      });
      const data = await res.json();
      const stripe = await stripePromise;
      if (data.url) {
        window.location.assign(data.url);
      } else if (data.sessionId && stripe) {
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      } else {
        console.error('Invalid response from checkout_sessions', data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCheckout(false);
    }
  };

  // Skeleton loader component
  const SkeletonCard = () => (
    <div className="card skeleton">
      <div className="skeleton-title"></div>
      <div className="skeleton-price"></div>
                <div className="border-t border-gray-700 my-3"></div>
      <div className="card-details skeleton-details">
        {Array(7).fill(0).map((_, i) => (
          <div key={i}>
            <span className="skeleton-label"></span>
            <span className="skeleton-value"></span>
          </div>
        ))}
      </div>
      <div className="skeleton-button"></div>
    </div>
  );

  // Toggle panels
  const toggleFilterPanel = () => {
    setFilterPanelOpen(!filterPanelOpen);
  };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (loading) return (
    <div className="layout overflow-x-hidden flex">
      {/* NAV GAUCHE */}
      <nav className={`sidebar-nav ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <Logo />
            <span className="logo-text">VoltageGPU</span>
          </div>
          <button className="btn-close-sidebar" onClick={toggleSidebar}>
            <X size={18} />
          </button>
        </div>
        <ul>
          <li className={pathname === '/browse-pods' ? 'active' : ''}>
            <Link href="/browse-pods">
              <Grid size={18} className="nav-icon" />
              <span>Browse Pods</span>
            </Link>
          </li>
          <li className={pathname === '/dashboard' ? 'active' : ''}>
            <Link href="/dashboard">
              <LayoutDashboard size={18} className="nav-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
        </ul>
      </nav>
      

      {/* CONTENU PRINCIPAL */}
      <main className="main">
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <h1 className="text-3xl font-semibold mb-6">Browse Pods</h1>
          <div className="grid">
            {Array(8).fill(0).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </main>

      {/* PANEL FILTRES DROITE */}
      <aside className={`panel-filters ${filterPanelOpen ? 'open' : ''}`}>
        <h2>Filter</h2>
        <button className="btn-close-filter" onClick={toggleFilterPanel}>
          <X size={18} />
        </button>
                <div className="border-t border-gray-700 my-3"></div>
      </aside>

      {/* Mobile filter button */}
      <button className="mobile-filter-button" onClick={toggleFilterPanel}>
        <SlidersHorizontal size={18} />
        <span>Filters</span>
      </button>
    </div>
  );
  
  if (!loading && pods.length === 0)
    return <div className="loading">No pods available.</div>;

  return (
    <div className="layout overflow-x-hidden flex">
      {/* NAV GAUCHE */}
      <nav className={`sidebar-nav ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <Logo />
            <span className="logo-text">VoltageGPU</span>
          </div>
          <button className="btn-close-sidebar" onClick={toggleSidebar}>
            <X size={18} />
          </button>
        </div>
        <ul>
          <li className={pathname === '/browse-pods' ? 'active' : ''}>
            <Link href="/browse-pods">
              <Grid size={18} className="nav-icon" />
              <span>Browse Pods</span>
            </Link>
          </li>
          <li className={pathname === '/dashboard' ? 'active' : ''}>
            <Link href="/dashboard">
              <LayoutDashboard size={18} className="nav-icon" />
              <span>Dashboard</span>
            </Link>
          </li>
        </ul>
      </nav>
      

      {/* CONTENU PRINCIPAL */}
      <main className="main">
        <div className="max-w-6xl mx-auto px-4 mt-8">
          <h1 className="text-3xl font-semibold mb-6">Browse Pods</h1>
          <div className="grid">
            {pageItems.map(p => (
              <div key={p.id} className="card">
                {/* Badges */}
                <div className="badges">
                  {p.uptime_display && parseInt(p.uptime_display) > 24 && (
                    <span className="badge badge-stable">Stable</span>
                  )}
                  {p.price < 1 && (
                    <span className="badge badge-low-price">Low price</span>
                  )}
                </div>
                
                {/* Card Header */}
                <div className="card-header">
                  <div className="card-title">
                    <CircuitBoard size={18} className="gpu-icon" />
                    <h2>{p.gpu_display}</h2>
                  </div>
                  <div className="price">${p.price.toFixed(2)}/hour</div>
                </div>
                
        <div className="border-t border-gray-700 my-3"></div>

                {/* Card Body - Details as dl/dt/dd list */}
                <dl className="card-details">
                  <div className="detail-row">
                    <dt className="detail-label">
                      <Cpu size={16} className="detail-icon" />
                      <span>CPU</span>
                    </dt>
                    <dd className="detail-value">{p.cpu_display}</dd>
                  </div>
                  
                  <div className="detail-row">
                    <dt className="detail-label">
                      <MemoryStick size={16} className="detail-icon" />
                      <span>Memory</span>
                    </dt>
                    <dd className="detail-value">{p.memory ? `${p.memory} GB` : '–'}</dd>
                  </div>
                  
                  <div className="detail-row">
                    <dt className="detail-label">
                      <HardDrive size={16} className="detail-icon" />
                      <span>Hard Disk</span>
                    </dt>
                    <dd className="detail-value">{p.disk ? `${p.disk} GB` : '–'}</dd>
                  </div>
                  
                  <div className="detail-row">
                    <dt className="detail-label">
                      <Wifi size={16} className="detail-icon" />
                      <span>Network</span>
                    </dt>
                    <dd className="detail-value">
                      ↑{p.network_up != null ? p.network_up.toLocaleString() : '–'} / ↓
                      {p.network_down != null ? p.network_down.toLocaleString() : '–'} Mbps
                    </dd>
                  </div>
                  
                  <div className="detail-row">
                    <dt className="detail-label">
                      <MapPin size={16} className="detail-icon" />
                      <span>Location</span>
                    </dt>
                    <dd className="detail-value">
                      {[p.location.city, p.location.country]
                        .filter(Boolean)
                        .join(', ')}
                    </dd>
                  </div>
                  
                  <div className="detail-row">
                    <dt className="detail-label">
                      <Server size={16} className="detail-icon" />
                      <span># of ports</span>
                    </dt>
                    <dd className="detail-value">{p.ports ?? '–'}</dd>
                  </div>
                  
                  <div className="detail-row">
                    <dt className="detail-label">
                      <Clock size={16} className="detail-icon" />
                      <span>Uptime</span>
                    </dt>
                    <dd className="detail-value">{p.uptime_display}</dd>
                  </div>
                </dl>

                {/* Card Footer - Rent Button */}
                <div className="card-footer">
                  <button
                    className="btn-rent"
                    onClick={() => handleRent(p.id)}
                    disabled={loadingCheckout}
                  >
                    {loadingCheckout ? 'Processing…' : 'Rent now'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                className={`page${page === i + 1 ? ' active' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* PANEL FILTRES DROITE */}
      <aside className={`panel-filters ${filterPanelOpen ? 'open' : ''}`}>
        <h2>Filter</h2>
        <button className="btn-close-filter" onClick={toggleFilterPanel}>
          <X size={18} />
        </button>
        <button
          className="btn-reset"
          onClick={() => {
            setSearch('');
            setLocFilter('');
            setGpuCountFilter(null);
            setPriceRange([0, 100]);
            setGpuTypeFilter([]);
            setPage(1);
          }}
        >
          Reset all
        </button>
        <div className="border-t border-gray-700 my-3"></div>

        {/* Search filter */}
        <div className="filter-group">
          <label htmlFor="search">Search</label>
          <input
            type="text"
            id="search"
            placeholder="Search GPU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Location filter */}
        <div className="filter-group">
          <label htmlFor="location">Location</label>
          <select
            id="location"
            value={locFilter}
            onChange={(e) => setLocFilter(e.target.value)}
          >
            <option value="">All locations</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* GPU Count filter */}
        <div className="filter-group">
          <label>GPU Count</label>
          <div className="btn-group">
            {[1, 2, 4, 6, 8].map((count) => (
              <button
                key={count}
                className={gpuCountFilter === count ? 'active' : ''}
                onClick={() => setGpuCountFilter(gpuCountFilter === count ? null : count)}
              >
                {count}x
              </button>
            ))}
          </div>
        </div>

        {/* Price Range filter */}
        <div className="filter-group">
          <label>Price Range ($/h)</label>
          <div className="price-range">
            <input
              type="number"
              min="0"
              max={priceRange[1]}
              value={priceRange[0]}
              onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            />
            <span className="dash">-</span>
            <input
              type="number"
              min={priceRange[0]}
              max="100"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={priceRange[0]}
            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
            className="price-slider"
          />
          <input
            type="range"
            min="0"
            max="100"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            className="price-slider"
          />
        </div>

        {/* GPU Type filter */}
        <div className="filter-group gpu-types">
          <div className="group-header">
            <label>GPU Type</label>
            <button
              className="btn-select-all"
              onClick={() => {
                setGpuTypeFilter(gpuTypeFilter.length === gpuTypes.length ? [] : [...gpuTypes]);
              }}
            >
              {gpuTypeFilter.length === gpuTypes.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
          <div className="types-list">
            {[
              'NVIDIA GeForce RTX 3090',
              'A100 80GB PCIe',
              'GeForce RTX 4090',
              'H100 80GB HBM3',
              'L40',
              'RTX A5000',
              'H200',
              'GeForce RTX 4090 D',
              'RTX A4000',
              'B200',
              'L40S',
              'RTX A6000',
              'GeForce RTX 5090'
            ].map((type) => (
              <div key={type} className="type-item">
                <input
                  type="checkbox"
                  id={`type-${type}`}
                  checked={gpuTypeFilter.includes(type)}
                  onChange={() => {
                    if (gpuTypeFilter.includes(type)) {
                      setGpuTypeFilter(gpuTypeFilter.filter((t) => t !== type));
                    } else {
                      setGpuTypeFilter([...gpuTypeFilter, type]);
                    }
                  }}
                />
                <label htmlFor={`type-${type}`}>{type}</label>
              </div>
            ))}
          </div>
        </div>
      </aside>
      
      {/* Mobile filter button */}
      <button className="mobile-filter-button" onClick={toggleFilterPanel}>
        <SlidersHorizontal size={18} />
        <span>Filters</span>
      </button>
    </div>
  );
}