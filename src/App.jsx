import React, { useState } from 'react';
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  Eye,
  EyeOff,
  User,
  Chrome,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Zap,
  Search,
  FileText,
  BarChart3,
  Globe,
  Settings,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Bell,
  Activity,
  Plus,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  X,
  History,
  RotateCcw
} from 'lucide-react';

const COMPETITORS = [
  "General", "2380 Capital", "AIP", "AVPN", "Acquaviva", "Adda Education", "Alt DRX", "Ameliya Ventures", "Anand Sweets", "Angara Jewelry", "Anu Rathninde", "Asha Ventures", "AssetPlus", "Astra Security", "AstraZeneca", "Aurobindo Pharma", "Avaamo", "AxiTrust", "BCG", "Battery Smart", "Bayone", "Blue Tokai", "Bolna.ai", "BotLab Dynamics", "Brand Alpha", "Bright Money", "CHOSEN", "CSF", "Capgemini", "Caterpillar Inc", "Chai Bisket", "Chalet Hotels", "Chupps", "Circuit House", "Clinikally", "College Vidya", "Competitor Beta", "ComputaCenter", "Coupang", "D2C Insider", "DailyObjects", "Decentro", "Demandbase", "Edenred", "Emeritus", "Engie", "Enkash", "Eume", "FRND", "Falcon FS", "Folk Frequency", "Fujifilm", "GNFZ", "GPS Renewables", "Global Markets", "GoHighLevel", "Goldi Solar", "Good Bug", "Google", "GradRight (SUNY Buffalo)", "Great Learning", "Guardian Health", "GullyLabs", "Hasbro", "Healthkois", "Hexagon", "HiSense", "IBDIC", "IHG", "IIMA Ventures", "Illumine", "Inc.5 Shoes", "Indian Oil", "Ingram Micro", "Jar", "JoshTalks", "JumpCloud", "JustJobs", "KFC", "Kaizen Analytix", "KisanKfraft", "Kissht", "Loreal", "Mahina", "Masin", "Maybelline New York", "Mehta Family Foundation", "MetaShop AI", "Milliken", "Milliken - Flooring", "Mitigata", "Modi Illva", "Montra Electric", "Murf AI", "Musashi", "Namma Yatri", "National Law School (NLS)", "Netflix", "Nicobar", "Novo Camps", "Nuuk", "Observe.ai", "Omnicom Global Solutions", "Optimeus", "Origin Fresh", "Paasa", "Paasa (2)", "Panasonic", "PayGlocal", "Pearl Academy", "PetG", "Pixxel", "Playbook Partners", "Plum", "Prime Ventures", "Pronto", "Qualcomm", "Qure.ai", "Rakuten Symphony - Crisis", "Rakuten Symphony - Prajaka Profiling", "Rakuten Symphony - brand", "Red Pen", "Reddit", "Room to Read", "SCALE", "SVP", "Sattva Consulting", "Scale AKA TCF", "Scaler", "Scapia", "Seekho", "SenseAI", "Shubhanshu Shukla", "Simple Energy", "SleepyCat", "Smallest", "Smile Group", "Snabbit", "South Park Commons", "Squadstack", "Straive", "Suez India", "SunSiyam", "Swiggy", "Synergy Capital", "TWC", "Tech Innovations", "TrueBlue", "UPES", "Udaiti", "Udhyam Learning", "Ugaao", "University of San Diego", "University of Surrey (UPES IBC)", "University of Western Australia", "Upliance.ai", "Urban Degh", "VMS Group", "Walmart Global Tech", "Way2News", "Weaver Finance", "Windsor House", "YuWaah", "Zappfresh", "Zeno Health", "Zeta", "iLead", "iTel", "mPokket", "slice", "v-Titan", "vivo"
].sort();

const SearchableDropdown = ({ value, onChange, placeholder, items, label, theme = 'indigo', exclude }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState(value || '');
  
  React.useEffect(() => {
    setSearch(value || '');
  }, [value]);

  const filteredItems = items.filter(item => 
    item.toLowerCase().includes(search.toLowerCase()) && item !== exclude
  );


  const colors = {
    indigo: {
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      text: 'text-indigo-600',
      hover: 'hover:bg-indigo-600',
      focus: 'focus:border-indigo-600 focus:ring-indigo-50',
      accent: 'text-indigo-900'
    },
    slate: {
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      text: 'text-slate-600',
      hover: 'hover:bg-slate-900',
      focus: 'focus:border-slate-900 focus:ring-slate-50',
      accent: 'text-slate-900'
    }
  }[theme];

  return (
    <div className="relative group w-full">
      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">{label}</label>
      <div className="relative z-50">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${isOpen ? colors.text : 'text-slate-400'}`} size={18} />
        <input 
          type="text"
          placeholder={placeholder}
          className={`w-full py-4 pl-12 pr-10 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none transition-all shadow-sm ${isOpen ? colors.border + ' ring-4 ' + colors.focus : 'hover:border-slate-200'}`}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {search && (
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSearch('');
                onChange('');
                setIsOpen(false);
              }}
              className="text-slate-300 hover:text-red-500 transition-colors p-1"
            >
              <X size={16} />
            </button>
          )}
          <div className="w-px h-4 bg-slate-200 mx-1"></div>
          <ChevronDown size={18} className={`transition-transform duration-500 text-slate-300 ${isOpen ? 'rotate-180 ' + colors.text : ''}`} />
        </div>
      </div>


      {isOpen && (
        <>
          <div className="absolute z-[60] w-full mt-3 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-200/80 max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-300 custom-scrollbar p-2">
            {filteredItems.length > 0 ? (
              filteredItems.map((item, idx) => (
                <button
                  key={idx}
                  className={`w-full text-left px-5 py-3 rounded-xl text-sm font-bold text-slate-700 ${colors.hover} hover:text-white transition-all flex items-center gap-3 group/item mb-1 last:mb-0`}
                  onClick={() => {
                    onChange(item);
                    setSearch(item);
                    setIsOpen(false);
                  }}
                >
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center group-hover/item:bg-white/20 transition-colors">
                    <span className="text-[10px] font-black">{item[0]}</span>
                  </div>
                  <span className="truncate">{item}</span>
                </button>
              ))
            ) : (
              <div className="px-6 py-8 text-center">
                <p className="text-slate-400 text-xs font-black uppercase tracking-widest">No matching entities</p>
              </div>
            )}
          </div>
          <div className="fixed inset-0 z-40 bg-black/0" onClick={() => setIsOpen(false)} />
        </>
      )}

      {search && items.includes(search) && (
        <div className={`mt-4 p-4 ${colors.bg} border ${colors.border} rounded-2xl animate-in fade-in slide-in-from-top-2 duration-500`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border ${colors.border}`}>
              <span className={`${colors.text} font-black text-lg`}>{search[0]}</span>
            </div>
            <div className="min-w-0">
              <p className={`text-[10px] font-black ${colors.accent} uppercase tracking-wider opacity-60 leading-none mb-1`}>Selection Active</p>
              <p className={`text-sm font-bold ${colors.text} truncate`}>{search}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const SentimentPieChart = ({ positive, neutral, negative }) => {
  const total = positive + neutral + negative;
  const posP = (positive / total) * 100;
  const neuP = (neutral / total) * 100;
  const negP = (negative / total) * 100;
  
  return (
    <div className="flex items-center gap-8">
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90 scale-125">
          <circle r="16" cx="16" cy="16" fill="transparent" stroke="#f1f5f9" strokeWidth="32" />
          <circle r="16" cx="16" cy="16" fill="transparent" stroke="#ef4444" strokeWidth="32" strokeDasharray={`${negP} 100`} />
          <circle r="16" cx="16" cy="16" fill="transparent" stroke="#94a3b8" strokeWidth="32" strokeDasharray={`${neuP} 100`} strokeDashoffset={`-${negP}`} />
          <circle r="16" cx="16" cy="16" fill="transparent" stroke="#10b981" strokeWidth="32" strokeDasharray={`${posP} 100`} strokeDashoffset={`-${negP + neuP}`} />
        </svg>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Positive: {posP.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Neutral: {neuP.toFixed(0)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Negative: {negP.toFixed(0)}%</span>
        </div>
      </div>
    </div>
  );
};



const CerebroLogo = ({ className }) => (

  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2C6.477 2 2 6.477 2 12C2 17.523 6.477 22 12 22C17.523 22 22 17.523 22 12C22 6.477 17.523 2 12 2ZM12 20C7.589 20 4 16.411 4 12C4 7.589 7.589 4 12 4C16.411 4 20 7.589 20 12C20 16.411 16.411 20 12 20Z" fill="currentColor" fillOpacity="0.3"/>
    <path d="M12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17Z" fill="currentColor"/>
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" fill="#151D48"/>
    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    <path d="M12 2V4M12 20V22M2 12H4M20 12H22" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

function App() {
  const [view, setViewInternal] = useState('login'); // 'login', 'signup', 'forgot', 'reset', 'landing'
  
  const setView = (newView) => {
    setError('');
    setSuccessMessage('');
    setViewInternal(newView);
  };
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [comp1, setComp1] = useState('');
  const [comp2, setComp2] = useState('');
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [mustHave, setMustHave] = useState('');
  const [shouldNotHave, setShouldNotHave] = useState('');
  const [isSearchingKeyword, setIsSearchingKeyword] = useState(false);
  const [reachUrl, setReachUrl] = useState('');
  const [isScanningReach, setIsScanningReach] = useState(false);
  const [reachMode, setReachMode] = useState('single'); // 'single', 'excel'
  const [excelFile, setExcelFile] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleKeywordSearch = () => {
    if (keyword) {
      setIsSearchingKeyword(true);
    }
  };

  const handleReachScan = () => {
    if (reachUrl) {
      setReachMode('single');
      setIsScanningReach(true);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setExcelFile(file);
      setReachMode('excel');
      setIsScanningReach(true);
    }
  };

  const handleAnalyse = () => {
    if (comp1 && comp2) {
      setIsAnalysing(true);
      const newEntry = { 
        id: Date.now(),
        comp1, 
        comp2, 
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 10));
      alert(`Starting analysis: ${comp1} vs ${comp2}`);
    }
  };

  const validateEmail = (email) => {
    return email.toLowerCase().endsWith('@themavericksindia.com');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (view === 'login') {
        if (!validateEmail(email)) {
          setError('Only @themavericksindia.com emails are allowed.');
          return;
        }
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        setLoading(false);
        if (!response.ok) {
          setError(data.error || 'Login failed');
          return;
        }
        setSuccessMessage('Login successful!');
        setUser(data.user);
        setTimeout(() => setView('landing'), 1500);
      } else if (view === 'signup') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        if (!agreeTerms) {
          setError('You must agree to the Terms and Conditions.');
          return;
        }
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        setLoading(false);
        if (!response.ok) {
          setError(data.error || 'Signup failed');
          return;
        }
        setSuccessMessage('Account created successfully! You can now log in.');
        setTimeout(() => setView('login'), 2000);
      } else if (view === 'forgot') {
        setLoading(true);
        const response = await fetch('http://localhost:3000/api/check-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });
        const data = await response.json();
        setLoading(false);
        if (response.ok && data.exists) {
          setSuccessMessage('A recovery link has been sent to your email.');
        } else {
          setError(data.error || 'This email address is not registered in our system.');
        }
      } else if (view === 'reset') {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        setLoading(true);
        // Reset password logic would go here
        setTimeout(() => {
          setLoading(false);
          setView('success');
        }, 1500);
      }
    } catch (err) {
      setLoading(false);
      setError('Server connection error. Is the backend running?');
    }
  };

  const renderHeader = (title, subtitle) => (
    <div className="flex flex-col items-center mb-8 ">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4 border border-slate-200 shadow-inner group overflow-hidden">
        <CerebroLogo className="w-10 h-10 text-black group-hover:scale-110 transition-transform duration-500" />
      </div>
      <h1 className="text-4xl font-black text-black tracking-tighter mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Cerebro</h1>
      <p className="text-[#334155] text-sm font-medium">{subtitle}</p>
    </div>
  );

  if (view === 'landing') {
    return (
      <div className={`fixed inset-0 flex flex-col font-body transition-colors duration-500 ${darkMode ? 'dark bg-[#011627]' : 'bg-white'}`}>
        {/* Navbar */}
        <nav className="h-16 bg-[#8ecae6] border-b border-[#a8dadc]/30 flex items-center justify-between px-6 z-30 shadow-sm">
          <div className="flex items-center gap-3">
            <CerebroLogo className="w-8 h-8 text-[#023047]" />
            <span className="text-xl font-black tracking-tighter text-[#023047]">Cerebro</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-[#023047]/60 hover:text-[#023047] transition-all hover:bg-white/20 rounded-xl"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button className="p-2 text-[#023047]/60 hover:text-[#023047] transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#ffb703] rounded-full border-2 border-[#8ecae6]"></span>
            </button>
            <div className="h-8 w-px bg-[#023047]/10 mx-1"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-black text-[#023047] leading-tight">{user?.name || 'Maverick'}</p>
                <p className="text-[10px] font-bold text-[#023047]/50 uppercase tracking-widest">Admin Access</p>
              </div>
              <div className="w-10 h-10 bg-[#023047] rounded-xl flex items-center justify-center text-white font-black shadow-lg shadow-[#023047]/20">
                {(user?.name || 'M')[0]}
              </div>
            </div>
          </div>
        </nav>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className={`${sidebarCollapsed ? 'w-24' : 'w-72'} ${darkMode ? 'bg-[#023047] border-[#219ebc]/20' : 'bg-[#8ecae6] border-[#a8dadc]/30'} flex flex-col z-20 transition-all duration-500 ease-in-out relative group`}>
            {/* Collapse Toggle Button */}
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="absolute -right-4 top-10 w-8 h-8 bg-white border border-slate-200 rounded-full flex items-center justify-center text-[#023047] shadow-xl hover:bg-indigo-600 hover:text-white transition-all z-50 group-hover:scale-110"
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className="flex-1 py-6 overflow-y-auto px-4 space-y-8 custom-scrollbar">
              <div>
                {!sidebarCollapsed && (
                  <label className="px-4 text-[10px] font-black text-[#023047]/40 uppercase tracking-[0.2em] mb-4 block animate-in fade-in duration-500">Intelligence Core</label>
                )}
                <div className="space-y-1">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'keyword-search', label: 'Keyword Search', icon: Search },
                    { id: 'report-analysis', label: 'Report Analysis', icon: FileText },
                    { id: 'article-reach', label: 'Article Reach', icon: Globe },
                    { id: 'brand-tracker', label: 'Brand Tracker', icon: Activity },
                    { id: 'competitor-analysis', label: 'Competitor Analysis', icon: BarChart3 },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold transition-all relative group/btn ${
                        activeTab === item.id 
                          ? (darkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'bg-[#023047] text-white shadow-lg shadow-[#023047]/20')
                          : (darkMode ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-[#023047]/70 hover:bg-[#219ebc]/10 hover:text-[#023047]')
                      }`}
                    >
                      <item.icon size={20} className={sidebarCollapsed ? 'shrink-0' : ''} />
                      {!sidebarCollapsed && <span className="animate-in slide-in-from-left-2 duration-300">{item.label}</span>}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#023047] text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-xl">
                          {item.label}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                {!sidebarCollapsed && (
                  <label className="px-4 text-[10px] font-black text-[#023047]/40 uppercase tracking-[0.2em] mb-4 block animate-in fade-in duration-500">Preferences</label>
                )}
                <div className="space-y-1">
                  {[
                    { id: 'settings', label: 'Settings', icon: Settings },
                    { id: 'help', label: 'Help & Support', icon: HelpCircle },
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold transition-all relative group/btn ${
                        activeTab === item.id 
                          ? (darkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'bg-[#023047] text-white shadow-lg shadow-[#023047]/20')
                          : (darkMode ? 'text-white/70 hover:bg-white/10 hover:text-white' : 'text-[#023047]/70 hover:bg-[#219ebc]/10 hover:text-[#023047]')
                      }`}
                    >
                      <item.icon size={20} className={sidebarCollapsed ? 'shrink-0' : ''} />
                      {!sidebarCollapsed && <span className="animate-in slide-in-from-left-2 duration-300">{item.label}</span>}
                      {sidebarCollapsed && (
                        <div className="absolute left-full ml-4 px-3 py-1.5 bg-[#023047] text-white text-[10px] rounded-xl opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-xl">
                          {item.label}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[#023047]/10">
              <button 
                onClick={() => setView('login')}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold text-[#023047]/50 hover:bg-red-50 hover:text-red-600 transition-all group/logout`}
              >
                <LogOut size={20} />
                {!sidebarCollapsed && <span>Sign Out</span>}
              </button>
            </div>
          </aside>





                {/* Main Content Area */}
                <main className="flex-1 overflow-hidden flex flex-col relative">
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Header with Create Report Button for Report Analysis */}
                    {activeTab !== 'competitor-analysis' && (
                      <div className={`px-8 pt-8 flex items-center justify-between ${activeTab === 'report-analysis' ? 'mb-4' : 'mb-10'}`}>
                        <div className="flex items-center gap-6">
                          {activeTab === 'report-analysis' ? (
                            <button className="group flex items-center bg-white border border-slate-200 p-2 rounded-full hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-500 ease-in-out shadow-sm overflow-hidden whitespace-nowrap max-w-[56px] hover:max-w-[200px] z-50">
                              <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:rotate-180 transition-transform duration-700 ease-in-out shrink-0">
                                <Plus size={24} />
                              </div>
                              <span className="ml-3 pr-4 text-sm font-black text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">Create Report</span>
                            </button>
                          ) : (
                            <div>
                              <h2 className="text-3xl font-black text-black tracking-tight capitalize">
                                {activeTab.replace('-', ' ')}
                              </h2>
                              <p className="text-slate-500 font-bold text-sm mt-1">
                                Welcome back, {user?.name || 'Maverick'}. Here is your intelligence report.
                              </p>
                            </div>
                          )}
                        </div>
                        {activeTab !== 'report-analysis' && (
                          <div className="flex gap-3">
                            <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black hover:bg-slate-50 transition-all shadow-sm">Export Data</button>
                            <button className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">Refresh Core</button>
                          </div>
                        )}
                      </div>
                    )}


                    {/* Main Page Content */}
                    <div className={`flex-1 min-h-0 p-8 overflow-y-auto custom-scrollbar ${activeTab === 'competitor-analysis' ? 'pt-6' : 'pt-0'}`}>
                      {activeTab === 'article-reach' ? (
                        <div className={`flex flex-col ${sidebarCollapsed ? 'max-w-[1850px]' : 'max-w-[1700px]'} mx-auto w-full animate-in fade-in duration-700 pr-2 transition-all duration-500`}>
                          {!isScanningReach ? (
                            <div className="space-y-10">
                              {/* Clean Scanner Section */}
                              <div className="w-full bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                
                                <div className="relative z-10 text-center max-w-2xl mx-auto">
                                  <h2 className="text-4xl font-black text-black tracking-tighter mb-4">
                                    Article Reach Analysis
                                  </h2>
                                  <p className="text-slate-500 font-bold text-sm mb-10">
                                    Analyze the impact and reach of a single URL or process multiple links in batch.
                                  </p>

                                  <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="relative flex-1 w-full">
                                      <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                      <input 
                                        type="text" 
                                        placeholder="Paste article URL here..." 
                                        className="w-full py-5 pl-14 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none transition-all hover:border-indigo-200 focus:border-indigo-600 shadow-sm"
                                        value={reachUrl}
                                        onChange={(e) => setReachUrl(e.target.value)}
                                      />
                                    </div>
                                    <button 
                                      onClick={handleReachScan}
                                      className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-3 shrink-0"
                                    >
                                      <Zap size={18} />
                                      Check Reach
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Batch Upload Section */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-12 flex flex-col items-center justify-center group hover:border-indigo-600 hover:bg-indigo-50/30 transition-all cursor-pointer relative overflow-hidden">
                                  <input 
                                    type="file" 
                                    accept=".xlsx, .xls" 
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10" 
                                    onChange={handleExcelUpload}
                                  />
                                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                                    <FileText size={28} className="text-slate-300 group-hover:text-white" />
                                  </div>
                                  <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">Batch Analysis</h3>
                                  <p className="text-xs font-bold text-slate-400">Upload Excel sheet for multiple URLs</p>
                                </div>

                                <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-12 flex flex-col items-center justify-center text-center">
                                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">
                                    <ShieldCheck size={24} className="text-indigo-600" />
                                  </div>
                                  <h3 className="text-lg font-black text-slate-900 mb-1 uppercase tracking-tight">System Ready</h3>
                                  <p className="text-[10px] font-bold text-slate-400 max-w-[180px] uppercase tracking-wider">
                                    Sovereign Processing Core v3.0 Active
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : reachMode === 'single' ? (
                            /* Single URL Result View */
                            <div className="space-y-8 pb-20">
                              {/* Header Card */}
                              <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-xl shadow-slate-200/50 flex flex-col md:flex-row items-start md:items-center justify-between relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[#8ecae6]/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                                <div className="flex-1 min-w-0 pr-8">
                                  <div className="flex items-center gap-3 mb-4">
                                    <div className="px-3 py-1 bg-indigo-600 rounded-full text-[9px] font-black text-white uppercase tracking-widest">Sovereign Data Asset</div>
                                    <div className="px-3 py-1 bg-slate-100 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">Sentiment: Negative</div>
                                  </div>
                                  <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2 truncate">Mocked Reach Lens Analysis for URL</h2>
                                  <p className="text-indigo-600 text-sm font-bold truncate underline">{reachUrl}</p>
                                </div>
                                <div className="mt-8 md:mt-0 flex gap-4">
                                  <button onClick={() => setIsScanningReach(false)} className="px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">New Scan</button>
                                </div>
                              </div>

                              {/* Primary Stats Grid */}
                              <div className="grid grid-cols-2 gap-6">
                                {[
                                  { label: 'Total Mentions', value: '1,254', color: 'slate' },
                                  { label: 'Estimated Reach', value: '845,000', sub: '95% Precision Window', color: 'indigo' },
                                ].map((stat, idx) => (
                                  <div key={idx} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-lg shadow-slate-100 transition-transform hover:scale-[1.02]">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">{stat.label}</p>
                                    <div className="flex flex-col">
                                      <span className={`text-4xl font-black tracking-tighter ${
                                        stat.color === 'indigo' ? 'text-indigo-600' : 'text-slate-900'
                                      }`}>{stat.value}</span>
                                      {stat.sub && <span className="text-[9px] font-bold text-slate-300 uppercase mt-1 tracking-wider">{stat.sub}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Detailed Metrics Grid */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {[
                                  { label: 'Google Mentions', value: '450', icon: Chrome, color: 'border-l-indigo-500' },
                                  { label: 'Reddit Mentions', value: '125', icon: Mail, color: 'border-l-orange-500' },
                                  { label: 'UVR (Unique Reach)', value: '1,200,000', sub: 'DE-DUPLICATED HUMANS', icon: Globe, color: 'border-l-emerald-500' },
                                  { label: 'X (Twitter) Proof', value: '450', icon: Chrome, color: 'border-l-blue-400' },
                                  { label: 'LinkedIn Proof', value: '120', icon: LayoutDashboard, color: 'border-l-indigo-700' },
                                  { label: 'Sentiment Impact', value: 'Positive', sub: 'SMEAR SCORE: 1.4', icon: Activity, color: 'border-l-teal-500' },
                                  { label: 'Growth Velocity', value: '88', sub: 'VIRAL TIPPING POINT', icon: Zap, color: 'border-l-indigo-600' },
                                ].map((item, idx) => (
                                  <div key={idx} className={`bg-white border border-slate-100 ${item.color} border-l-4 rounded-[2rem] p-6 shadow-md transition-all hover:shadow-xl`}>
                                    <div className="flex items-center justify-between mb-4">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</span>
                                      <item.icon size={14} className="text-slate-300" />
                                    </div>
                                    <div className="flex flex-col">
                                      <span className="text-2xl font-black text-slate-900 tracking-tight">{item.value}</span>
                                      {item.sub && <span className="text-[8px] font-black text-slate-300 uppercase mt-1 tracking-tighter">{item.sub}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Footer Insights */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-lg relative overflow-hidden">
                                  <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                                      <FileText size={24} />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-black text-slate-900 tracking-tight">How we calculated this</h3>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sovereign Causal Model (v3.0)</p>
                                    </div>
                                  </div>
                                  
                                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-8 mb-8 relative overflow-hidden">
                                    <div className="relative flex items-center justify-center gap-6 text-slate-900 font-black text-xl">
                                      <div className="flex flex-col items-center">
                                        <span className="text-[8px] text-indigo-500 uppercase mb-1">RAW</span>
                                        UVR
                                      </div>
                                      <Plus size={20} className="text-slate-300" />
                                      <div className="flex flex-col items-center">
                                        <span className="text-[8px] text-indigo-500 uppercase mb-1">ENTROPY</span>
                                        Diffusion
                                      </div>
                                      <X size={20} className="text-slate-300" />
                                      <div className="flex flex-col items-center">
                                        <span className="text-[8px] text-indigo-500 uppercase mb-1">CAUSAL</span>
                                        Logic
                                      </div>
                                    </div>
                                  </div>

                                  <div className="space-y-4">
                                    {[
                                      "Unique Verified Reach (UVR): De-duplicate overlapping audiences between Google and Social.",
                                      "Quasi-Monte Carlo (Sobol): 99.2% confidence with a near-zero (±0.8%) error window.",
                                      "3-Tier Provenance Graph: Tracking content 'First Seen' to identify T0 (Origin) sources.",
                                      "Shannon Entropy: Measure organic 'Information Diffusion' across isolated audiences."
                                    ].map((text, idx) => (
                                      <div key={idx} className="flex gap-4 p-4 bg-slate-50 rounded-2xl group transition-all hover:bg-indigo-50">
                                        <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black flex items-center justify-center shrink-0">0{idx+1}</div>
                                        <p className="text-[11px] font-bold text-slate-600 leading-relaxed group-hover:text-indigo-900 transition-colors">{text}</p>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                <div className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-lg">
                                  <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-400 border border-orange-100">
                                      <Globe size={24} />
                                    </div>
                                    <div>
                                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Social Discussions</h3>
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verifiable Reddit Engagement</p>
                                    </div>
                                  </div>

                                  <div className="space-y-6">
                                    {[
                                      { label: 'Discussion about...', topic: 'BITCOIN TECHNOLOGY', status: 'ACTIVE', color: 'indigo' },
                                      { label: 'Amusing insights', topic: 'AI ARTIFICIAL', status: 'ACTIVE', color: 'emerald' },
                                      { label: 'Thread Sentiment', topic: 'HIGHLY POSITIVE', status: 'TRENDING', color: 'orange' },
                                    ].map((insight, idx) => (
                                      <div key={idx} className="p-5 border border-slate-100 rounded-3xl relative group hover:border-indigo-200 transition-all">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{insight.label}</p>
                                        <div className="flex items-center justify-between">
                                          <span className="text-sm font-black text-slate-800">{insight.topic}</span>
                                          <div className={`px-2.5 py-1 rounded-lg text-[8px] font-black border ${
                                            insight.color === 'indigo' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' :
                                            insight.color === 'emerald' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' :
                                            'bg-orange-50 border-orange-100 text-orange-600'
                                          }`}>{insight.status}</div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* Excel Batch Result Table View */
                            <div className="h-full flex flex-col space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Batch Reach Analysis</h2>
                                  <p className="text-slate-400 text-sm font-bold mt-1">Processed {excelFile?.name || 'URLs'} • Sovereign Core v3.0</p>
                                </div>
                                <div className="flex gap-4">
                                  <button onClick={() => setIsScanningReach(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Back</button>
                                  <button className="px-6 py-3 bg-[#219ebc] hover:bg-[#023047] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">Download Report</button>
                                </div>
                              </div>

                              <div className="flex-1 bg-white border border-slate-200 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col">
                                <div className="overflow-auto max-h-[1050px] custom-scrollbar">
                                  <table className="w-full text-left border-collapse">
                                    <thead className="sticky top-0 z-10 bg-slate-50">
                                      <tr className="border-b border-slate-100">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">ID</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Article URL</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Sentiment</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Mentions</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-[#219ebc] uppercase tracking-[0.2em] bg-[#219ebc]/5">Estimated Reach</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right bg-slate-50">Status</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {[
                                        { id: 'MAV-001', url: 'https://timesofindia.indiatimes.com/world/us/...', sentiment: 'Positive', mentions: '1,245', reach: '845,000' },
                                        { id: 'MAV-002', url: 'https://economictimes.indiatimes.com/tech/...', sentiment: 'Neutral', mentions: '892', reach: '420,000' },
                                        { id: 'MAV-003', url: 'https://mint.com/market/stocks/...', sentiment: 'Negative', mentions: '3,410', reach: '2,150,000' },
                                        { id: 'MAV-004', url: 'https://business-standard.com/industry/...', sentiment: 'Positive', mentions: '560', reach: '180,000' },
                                        { id: 'MAV-005', url: 'https://yourstory.com/entrepreneurship/...', sentiment: 'Positive', mentions: '2,100', reach: '960,000' },
                                        { id: 'MAV-006', url: 'https://inc42.com/startups/...', sentiment: 'Neutral', mentions: '430', reach: '125,000' },
                                        { id: 'MAV-007', url: 'https://thehindu.com/news/national/...', sentiment: 'Negative', mentions: '1,850', reach: '740,000' },
                                      ].map((row, idx) => (
                                        <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                          <td className="px-8 py-5 text-xs font-black text-slate-400">{row.id}</td>
                                          <td className="px-8 py-5 text-sm font-bold text-slate-900 max-w-xs truncate">{row.url}</td>
                                          <td className="px-8 py-5">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                              row.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600' : 
                                              row.sentiment === 'Negative' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                            }`}>{row.sentiment}</span>
                                          </td>
                                          <td className="px-8 py-5 text-sm font-black text-slate-700">{row.mentions}</td>
                                          <td className="px-8 py-5 text-sm font-black text-[#219ebc] bg-[#219ebc]/[0.02] group-hover:bg-[#219ebc]/5 transition-all">{row.reach}</td>
                                          <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2 text-emerald-500">
                                              <CheckCircle2 size={14} />
                                              <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                            </div>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : activeTab === 'keyword-search' ? (
                        <div className={`h-full flex flex-col items-center justify-start ${sidebarCollapsed ? 'max-w-7xl' : 'max-w-5xl'} mx-auto w-full transition-all duration-500`}>
                          {/* Top Actions Bar */}
                          <div className="w-full flex justify-end gap-3 mb-8 animate-in fade-in slide-in-from-right-4 duration-700">
                            <button 
                              onClick={() => {
                                setKeyword(''); setMustHave(''); setShouldNotHave('');
                                setIsSearchingKeyword(false);
                              }}
                              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-red-500 hover:text-red-500 transition-all duration-500 shadow-sm"
                            >
                              <RotateCcw size={14} />
                              Reset Search
                            </button>
                          </div>

                          <div className="w-full bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              <div className="space-y-1.5">
                                <input 
                                  type="text" 
                                  placeholder="Keyword" 
                                  className="w-full py-5 px-8 bg-white border border-slate-100 rounded-full text-sm font-bold text-slate-900 outline-none transition-all hover:border-indigo-200 focus:border-indigo-600 shadow-sm"
                                  value={keyword}
                                  onChange={(e) => setKeyword(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <input 
                                  type="text" 
                                  placeholder="Must Have - Keyword" 
                                  className="w-full py-5 px-8 bg-white border border-slate-100 rounded-full text-sm font-bold text-slate-900 outline-none transition-all hover:border-indigo-200 focus:border-indigo-600 shadow-sm"
                                  value={mustHave}
                                  onChange={(e) => setMustHave(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1.5">
                                <input 
                                  type="text" 
                                  placeholder="Shouldn't Have - Keyword" 
                                  className="w-full py-5 px-8 bg-white border border-slate-100 rounded-full text-sm font-bold text-slate-900 outline-none transition-all hover:border-indigo-200 focus:border-indigo-600 shadow-sm"
                                  value={shouldNotHave}
                                  onChange={(e) => setShouldNotHave(e.target.value)}
                                />
                              </div>
                            </div>

                            <div className="mt-8 flex justify-center">
                              <button 
                                onClick={handleKeywordSearch}
                                className="group relative px-16 py-5 bg-slate-100 hover:bg-slate-200 rounded-full overflow-hidden transition-all active:scale-95 shadow-sm"
                              >
                                <div className="relative flex items-center gap-3 text-slate-400 group-hover:text-slate-600 font-black uppercase tracking-[0.2em] text-xs">
                                  Explore Now
                                </div>
                              </button>
                            </div>
                          </div>

                          {isSearchingKeyword && (
                            <div className="w-full mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                              {/* Total Mentions Card */}
                              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                                <div className="relative flex items-center gap-4 mb-8">
                                  <div className="w-12 h-12 bg-teal-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-teal-100">
                                    <Activity size={24} />
                                  </div>
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Mentions</h4>
                                </div>
                                <div className="flex items-baseline gap-2">
                                  <span className="text-5xl font-black text-slate-900 tracking-tighter">4,892</span>
                                  <span className="text-teal-500 text-xs font-black">+24%</span>
                                </div>
                              </div>

                              {/* Sentiment Analysis Card */}
                              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col items-center justify-center relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                                <div className="w-full flex items-center gap-4 mb-8">
                                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                                    <BarChart3 size={24} />
                                  </div>
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Sentiment Analysis</h4>
                                </div>
                                <SentimentPieChart positive={65} neutral={25} negative={10} />
                              </div>

                              {/* Top Publications Card */}
                              <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 flex flex-col relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110"></div>
                                <div className="w-full flex items-center gap-4 mb-8">
                                  <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-100">
                                    <Globe size={24} />
                                  </div>
                                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Top Publications</h4>
                                </div>
                                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 max-h-32 pr-2">
                                  {[
                                    { name: 'The Economic Times', count: '142' },
                                    { name: 'Mint', count: '98' },
                                    { name: 'Business Standard', count: '87' },
                                    { name: 'YourStory', count: '76' },
                                    { name: 'Inc42', count: '65' },
                                    { name: 'The Hindu', count: '54' }
                                  ].map((pub, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                      <span className="text-[11px] font-bold text-slate-700">{pub.name}</span>
                                      <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">{pub.count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : activeTab === 'competitor-analysis' ? (
                        <div className={`h-full flex flex-col items-center justify-start ${sidebarCollapsed ? 'max-w-7xl' : 'max-w-5xl'} mx-auto w-full transition-all duration-500`}>
                          {/* Top Actions Bar */}
                          <div className="w-full flex justify-end gap-3 mb-8 animate-in fade-in slide-in-from-right-4 duration-700">
                            <button 
                              onClick={() => {
                                setComp1(''); setComp2(''); setSearch1(''); setSearch2('');
                                setShowHistory(false);
                                setIsAnalysing(false);
                              }}
                              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-red-500 hover:text-red-500 transition-all duration-500 shadow-sm"
                            >
                              <RotateCcw size={14} />
                              Refresh Tab
                            </button>
                            <button 
                              onClick={() => setShowHistory(!showHistory)}
                              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${
                                showHistory 
                                  ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' 
                                  : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'
                              }`}
                            >
                              <History size={14} />
                              {showHistory ? 'Back to Comparison' : 'View History'}
                            </button>
                          </div>

                          <div className="w-full bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50">
                            {showHistory ? (
                              <div className="relative z-10 animate-in fade-in zoom-in-95 duration-500">
                                <div className="flex items-center justify-between mb-8">
                                  <div>
                                    <h3 className="text-xl font-black text-black uppercase tracking-tight">Comparison History</h3>
                                    <p className="text-slate-400 text-xs font-bold mt-1">Review your recent intelligence sessions</p>
                                  </div>
                                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                                    <History size={24} />
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 gap-4 max-h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                                  {history.length > 0 ? history.map((item) => (
                                    <div key={item.id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all group">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-black text-xs">{item.comp1[0]}</div>
                                            <span className="text-sm font-black text-slate-900">{item.comp1}</span>
                                          </div>
                                          <div className="text-slate-300 font-black">VS</div>
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-xs">{item.comp2[0]}</div>
                                            <span className="text-sm font-black text-slate-900">{item.comp2}</span>
                                          </div>
                                        </div>
                                        <div className="text-right text-xs font-bold text-slate-400 uppercase tracking-widest">{item.date} • {item.time}</div>
                                      </div>
                                    </div>
                                  )) : (
                                    <div className="py-20 text-center">
                                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-200">
                                        <History size={32} />
                                      </div>
                                      <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No history recorded yet</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8">
                                <SearchableDropdown 
                                  label="Primary Entity"
                                  placeholder="Search entity..."
                                  items={COMPETITORS}
                                  value={search1}
                                  onChange={(val) => {
                                    setSearch1(val);
                                    setComp1(val);
                                  }}
                                  theme="indigo"
                                  exclude={comp2}
                                />

                                <div className="flex flex-col items-center py-8 md:py-0">
                                  <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-indigo-200/50 transform md:-rotate-12 border-4 border-white z-10 relative">
                                    <div className="absolute inset-0 bg-indigo-600/20 rounded-full blur-xl animate-pulse"></div>
                                    <span className="relative">VS</span>
                                  </div>
                                </div>

                                <SearchableDropdown 
                                  label="Competitor"
                                  placeholder="Search entity..."
                                  items={COMPETITORS}
                                  value={search2}
                                  onChange={(val) => {
                                    setSearch2(val);
                                    setComp2(val);
                                  }}
                                  theme="slate"
                                  exclude={comp1}
                                />
                              </div>
                            )}
                          </div>

                          {isAnalysing && !showHistory && (
                            <div className="w-full mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                              {/* Card for Brand 1 */}
                              <div className="bg-white border border-indigo-100 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative flex items-center justify-between mb-6">
                                  <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                    <Activity size={28} />
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Entity Analytics</p>
                                    <p className="text-lg font-black text-indigo-600 truncate max-w-[150px]">{comp1}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Mentions</h4>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-black tracking-tighter">1,248</span>
                                    <span className="text-green-500 text-xs font-black">+12.5%</span>
                                  </div>
                                </div>
                              </div>

                              {/* Card for Brand 2 */}
                              <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110"></div>
                                <div className="relative flex items-center justify-between mb-6">
                                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                    <Activity size={28} />
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Competitor Analytics</p>
                                    <p className="text-lg font-black text-slate-900 truncate max-w-[150px]">{comp2}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-2">Total Mentions</h4>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-black tracking-tighter">842</span>
                                    <span className="text-red-500 text-xs font-black">-4.2%</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {comp1 && comp2 && !isAnalysing && (
                              <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                                <button 
                                  onClick={handleAnalyse}
                                  className="group relative px-12 py-5 bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-200 transition-all hover:scale-105 active:scale-95"
                                >
                                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-indigo-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                  <div className="relative flex items-center gap-4 text-white font-black uppercase tracking-[0.2em] text-xs">
                                    <Zap size={18} className="text-indigo-400 group-hover:text-white group-hover:rotate-12 transition-all" />
                                    Analyse Comparison
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                  </div>
                                </button>
                              </div>
                            )}

                          <div className="mt-12 text-center">
                            <p className="text-slate-400 font-bold text-sm">
                              Select any two entities from the database to perform a detailed competitive intelligence analysis.
                            </p>
                          </div>
                        </div>
                      ) : activeTab === 'settings' ? (
                        <div className="flex flex-col max-w-4xl mx-auto w-full animate-in fade-in duration-700">
                          <div className="mb-10 text-center">
                            <h2 className="text-4xl font-black text-black tracking-tighter mb-2">Platform Settings</h2>
                            <p className="text-slate-500 font-bold text-sm">Manage your account preferences and system configurations.</p>
                          </div>

                          <div className="max-w-2xl mx-auto w-full">
                            {/* Profile Settings */}
                            <div className="bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
                              <div className="flex items-center gap-5 mb-10">
                                <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform hover:rotate-3">
                                  <User size={32} />
                                </div>
                                <div>
                                  <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">User Profile</h4>
                                  <p className="text-xs font-bold text-slate-400">Personal information and identity</p>
                                </div>
                              </div>
                              <div className="space-y-6">
                                <div className="group">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block group-focus-within:text-indigo-600 transition-colors">Full Name</label>
                                  <input type="text" defaultValue={user?.name || 'Divyansh Sharma'} className="w-full py-5 px-8 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-sm hover:border-indigo-200" />
                                </div>
                                <div className="group">
                                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Email Address</label>
                                  <input type="email" defaultValue={user?.email || 'divyansh@themavericksindia.com'} disabled className="w-full py-5 px-8 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed outline-none shadow-sm" />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="mt-12 flex justify-center gap-4">
                            <button className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">Save Changes</button>
                            <button className="px-10 py-4 bg-white border border-slate-200 text-slate-400 rounded-full font-black uppercase tracking-widest text-xs hover:text-red-500 hover:border-red-500 transition-all">Discard</button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] h-full flex flex-col items-center justify-center text-center p-12">
                          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <Zap size={32} className="text-slate-300" />
                          </div>
                          <h3 className="text-xl font-black text-black mb-2 uppercase tracking-tight">System Initialization Required</h3>
                          <p className="text-sm font-semibold text-slate-500 max-w-sm">
                            The <span className="text-black font-bold capitalize">{activeTab.replace('-', ' ')}</span> module is currently offline. 
                            Please proceed to design the internal architecture for this component.
                          </p>
                        </div>
                      )}

                    </div>

                  </div>
                </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center overflow-hidden font-body selection:bg-indigo-500/30 py-10">
      {/* Background Image with Low Opacity */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center "
        style={{ 
          backgroundImage: 'url("/image.png")',
          opacity: 1
        }}
      />
      
      {/* Dynamic Animated Orbs */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '0s' }}></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '-2s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="glass-card rounded-[2.5rem] p-8 md:p-10  glass-shimmer glow-on-hover" style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
          
          {view === 'login' && (
            <>
              {renderHeader('Cerebro', 'Intelligence at your fingertips')}
              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-[#7f1d1d] text-xs font-bold ">{error}</div>}
              {successMessage && <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-[#064e3b] text-xs font-bold ">{successMessage}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} />
                    <input type="email" required placeholder="user@themavericksindia.com" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em]">Password</label>
                    <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black text-indigo-400 hover:text-indigo-300 transition-colors uppercase">FORGOT?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-black transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-2">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><ShieldCheck size={18} /> Sign In to Cerebro</>}
                </button>
              </form>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black"><span className="bg-[#1e1b4b]/0 px-4 text-[#475569]">Or continue with</span></div>
              </div>
              <button className="glass-button w-full flex items-center justify-center gap-2 text-xs mb-8"><Chrome size={16} /> Sign in with Google</button>
              <p className="text-center text-xs font-bold text-[#475569]">Don't have an account? <button onClick={() => setView('signup')} className="text-black hover:underline transition-all">Create Account</button></p>
            </>
          )}

          {view === 'signup' && (
            <>
              {renderHeader('Cerebro', 'Join the next era of PR')}
              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-[#7f1d1d] text-xs font-bold ">{error}</div>}
              {successMessage && <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-[#064e3b] text-xs font-bold ">{successMessage}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 group"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">Full Name</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} /><input type="text" required placeholder="Your Full Name" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold" value={name} onChange={(e) => setName(e.target.value)} /></div></div>
                <div className="space-y-1.5 group"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">Email Address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} /><input type="email" required placeholder="email@company.com" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
                <div className="space-y-1.5 group"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">Create Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} /><input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-black transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                <div className="space-y-1.5 group"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">Confirm Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} /><input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div></div>
                <div className="flex items-center gap-3 px-1 py-2"><button type="button" onClick={() => setAgreeTerms(!agreeTerms)} className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${agreeTerms ? 'bg-indigo-600 border-indigo-600 text-black' : 'border-white/20 text-transparent'}`}><CheckCircle2 size={14} /></button><span className="text-[10px] font-bold text-[#334155] leading-tight">I agree to the <button type="button" className="text-indigo-400 hover:underline">Terms of Service</button> and <button type="button" className="text-indigo-400 hover:underline">Privacy Policy</button>.</span></div>
                <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-2">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Create Account <ArrowRight size={18} /></>}</button>
              </form>
              <p className="mt-10 text-center text-xs font-bold text-[#475569]">Already have an account? <button onClick={() => setView('login')} className="text-black hover:underline transition-all">Sign In Now</button></p>
            </>
          )}

          {view === 'forgot' && (
            <>
              {renderHeader('Recover Access', successMessage ? 'Check your inbox' : 'Enter your email to receive a recovery link')}
              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-[#7f1d1d] text-xs font-bold ">{error}</div>}
              {successMessage ? (
                <div className="space-y-6 ">
                  <div className="p-6 bg-green-500/10 border border-green-500/20 rounded-[2rem] text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-[#064e3b]"><CheckCircle2 size={24} /></div>
                    <p className="text-sm font-bold text-slate-700">{successMessage}</p>
                    <p className="text-xs text-[#475569] mt-2 italic">Note: Use "admin@themavericksindia.com" to simulate success.</p>
                  </div>
                  <button onClick={() => setView('reset')} className="glass-button w-full flex items-center justify-center gap-2 text-xs">Simulate: Go to Reset Page <ArrowRight size={16} /></button>
                  <button onClick={() => setView('login')} className="w-full text-center text-xs font-bold text-[#475569] hover:text-black transition-colors flex items-center justify-center gap-2"><ArrowLeft size={14} /> Back to Login</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1.5 group"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">Email Address</label><div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} /><input type="email" required placeholder="user@themavericksindia.com" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold" value={email} onChange={(e) => setEmail(e.target.value)} /></div></div>
                  <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-2">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Send Reset Link <ArrowRight size={18} /></>}</button>
                  <button onClick={() => setView('login')} className="w-full text-center text-xs font-bold text-[#475569] hover:text-black transition-colors flex items-center justify-center gap-2"><ArrowLeft size={14} /> Back to Login</button>
                </form>
              )}
            </>
          )}

          {view === 'reset' && (
            <>
              {renderHeader('Reset Password', 'Create a new secure password for your account')}
              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-[#7f1d1d] text-xs font-bold ">{error}</div>}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5 group"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">New Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} /><input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold" value={password} onChange={(e) => setPassword(e.target.value)} /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#475569] hover:text-black transition-colors">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></div>
                <div className="space-y-1.5 group"><label className="text-[10px] font-black text-[#475569] uppercase tracking-[0.2em] ml-1">Confirm New Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#475569] group-focus-within:text-black transition-colors" size={18} /><input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} /></div></div>
                <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-2">{loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Reset Password <CheckCircle2 size={18} /></>}</button>
              </form>
            </>
          )}

          {view === 'success' && (
            <div className="flex flex-col items-center py-10 ">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-[#064e3b] border border-green-500/20"><CheckCircle2 size={40} /></div>
              <h2 className="text-3xl font-black text-black tracking-tighter mb-2 text-center">Password Updated</h2>
              <p className="text-[#334155] text-sm font-medium mb-10 text-center">Your account is now secure. You can sign in with your new password.</p>
              <button onClick={() => setView('login')} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3">Back to Login <ArrowRight size={18} /></button>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}

export default App;
