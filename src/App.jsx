import React, { useState, useEffect } from 'react';
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
  RotateCcw,
  Trash2,
  Download,
  Share2,
  Filter,
  Calendar,
  Bookmark,
  Sparkles,
  Clock,
  CheckCircle,
  FileSpreadsheet,
  AlertTriangle,
  Key,
  FileCheck,
  Tag,
  Book,
  Edit,
  Pin,
  Check,
  FileCode,
  PieChart,
  TrendingUp,
  Maximize2,
  Minimize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Move,
  MoveUp,
  MoveDown,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  PlusCircle,
  Layers,
  Image,
  Highlighter,
  Bold,
  Italic,
  Underline,
  AlignJustify,
  GripVertical,
  Printer,
  Database,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo,
  Eraser,
  Palette,
  CheckSquare,
  Link,
  Subscript,
  Superscript,
  Table,
  Trash,
  AtSign,
  Minus,
  Video,
  MessageSquare,
  Brain
} from 'lucide-react';

import { useEditor, EditorContent, ReactNodeViewRenderer, Extension } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Underline as TiptapUnderline } from '@tiptap/extension-underline';
import { Highlight as TiptapHighlight } from '@tiptap/extension-highlight';
import { TextStyle as TiptapTextStyle } from '@tiptap/extension-text-style';
import { FontFamily as TiptapFontFamily } from '@tiptap/extension-font-family';
import { TextAlign as TiptapTextAlign } from '@tiptap/extension-text-align';
import { Color as TiptapColor } from '@tiptap/extension-color';
import { TaskList } from '@tiptap/extension-task-list';
import { TaskItem } from '@tiptap/extension-task-item';
import { Subscript as TiptapSubscript } from '@tiptap/extension-subscript';
import { Superscript as TiptapSuperscript } from '@tiptap/extension-superscript';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { Table as TiptapTable } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import CharacterCount from '@tiptap/extension-character-count';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Focus from '@tiptap/extension-focus';
import { Mention } from '@tiptap/extension-mention';
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight';
import { createLowlight, all } from 'lowlight';
import { Youtube } from '@tiptap/extension-youtube';
import { HorizontalRule as TiptapHorizontalRule } from '@tiptap/extension-horizontal-rule';

const lowlight = createLowlight(all);

// Error Boundary to catch runtime React errors and show a useful message
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[Cerebro ErrorBoundary]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', background: '#fff', fontFamily: 'sans-serif', padding: '40px' }}>
          <div style={{ maxWidth: 520, textAlign: 'center' }}>
            <div style={{ width: 64, height: 64, background: '#fee2e2', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: 32 }}>⚠️</div>
            <h2 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginBottom: 8 }}>Cerebro encountered an error</h2>
            <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 12, padding: '12px 28px', fontWeight: 700, fontSize: 13, cursor: 'pointer', letterSpacing: 1 }}
            >
              Clear Cache &amp; Reload
            </button>
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12 }}>This will clear your saved session and reload the app.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const FontSizeExtension = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .run();
      },
    };
  },
});


const FONT_OPTIONS = [
  "Inter, sans-serif",
  "Outfit, sans-serif",
  "Georgia, serif",
  "Times New Roman, serif",
  "Arial, sans-serif",
  "Helvetica, sans-serif",
  "Verdana, sans-serif",
  "Tahoma, sans-serif",
  "Trebuchet MS, sans-serif",
  "Courier New, monospace",
  "Lucida Console, monospace",
  "Consolas, monospace",
  "Monaco, monospace",
  "Garamond, serif",
  "Palatino Linotype, serif",
  "Book Antiqua, serif",
  "Baskerville, serif",
  "Century Schoolbook, serif",
  "Didot, serif",
  "American Typewriter, serif",
  "Calibri, sans-serif",
  "Candara, sans-serif",
  "Geneva, sans-serif",
  "Optima, sans-serif",
  "Segoe UI, sans-serif",
  "Franklin Gothic Medium, sans-serif",
  "Century Gothic, sans-serif",
  "Gill Sans, sans-serif",
  "Lucida Sans, sans-serif",
  "Futura, sans-serif",
  "Rockwell, serif",
  "Cambria, serif",
  "Constantia, serif",
  "Copperplate, fantasy",
  "Papyrus, fantasy",
  "Brush Script MT, cursive",
  "Comic Sans MS, cursive",
  "Impact, sans-serif",
  "Arial Black, sans-serif",
  "Roboto, sans-serif",
  "Open Sans, sans-serif",
  "Lato, sans-serif",
  "Montserrat, sans-serif",
  "Oswald, sans-serif",
  "Raleway, sans-serif"
];

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
            const val = e.target.value;
            setSearch(val);
            onChange(val);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              setIsOpen(false);
            }
          }}
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


      {isOpen && filteredItems.length > 0 && (
        <>
          <div className="absolute z-[60] w-full mt-3 bg-white border border-slate-200 rounded-[2rem] shadow-2xl max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-300 custom-scrollbar p-2">
            {filteredItems.map((item, idx) => (
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
            ))}
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
  <img 
    src="/cerebro_white.png" 
    alt="Cerebro Logo" 
    className={`${className} invert object-cover object-right`} 
  />
);

const CerebroBrandLogo = ({ collapsed, darkMode, className }) => {
  if (collapsed) {
    return (
      <div className="w-12 h-12 overflow-hidden relative flex items-center justify-center">
        <img 
          src="/cerebro_white.png" 
          alt="Cerebro Logo" 
          className={`absolute h-full w-auto max-w-none right-0 top-0 transition-all duration-300 ${darkMode ? '' : 'invert'}`} 
          style={{
            transform: 'translateX(2.5%)' // Fine-tune horizontal placement of the brain icon to crop out all text letters
          }}
        />
      </div>
    );
  }
  return (
    <img 
      src="/cerebro_white.png" 
      alt="Cerebro Logo" 
      className={`h-11 w-auto object-contain transition-all duration-300 ${darkMode ? '' : 'invert'}`} 
    />
  );
};

const SectionRichEditor = ({ id, content, onUpdate, style, className, savedRangeRef, recordHistory, sectionTitle, isActiveEditor, onEditorStateChange, onFocus }) => {
  const contentRef = React.useRef(content);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TiptapHorizontalRule,
      Mention.configure({
        HTMLAttributes: {
          className: 'mention',
        },
        suggestion: {
          items: ({ query }) => {
            return [
              'Cerebro AI', 'Chief Analyst', 'Maverick Team', 'Alpha Copilot', 'Financial Hub', 'Tech Pulse', 'SEC Regulatory', 'Global Index'
            ].filter(item => item.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
          },
        },
      }),
      Youtube.configure({
        inline: false,
        width: 560,
        height: 315,
      }),
      TiptapUnderline,
      TiptapHighlight.configure({ mark: true }),
      TiptapTextStyle,
      TiptapFontFamily,
      TiptapTextAlign.configure({ types: ['heading', 'paragraph'] }),
      TiptapColor,
      FontSizeExtension,
      TaskList,
      TaskItem.configure({ nested: true }),
      TiptapSubscript,
      TiptapSuperscript,
      TiptapLink.configure({ openOnClick: false, autolink: true }),
      TiptapTable.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      CharacterCount,
      Placeholder.configure({
        placeholder: 'Type your report content here or use the toolbar to insert lists, tables, links...',
        emptyEditorClass: 'is-editor-empty',
      }),
      Typography,
      Dropcursor.configure({ color: '#6366f1', width: 3 }),
      Gapcursor,
      Focus.configure({ className: 'has-focus', mode: 'all' }),
    ],
    content: content,
    onFocus: ({ editor }) => {
      if (onFocus) onFocus(editor);
      if (onEditorStateChange) onEditorStateChange(editor);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onUpdate && html !== contentRef.current) {
        contentRef.current = html;
        onUpdate(html);
      }
    },
    onSelectionUpdate: ({ editor }) => {
      if (onEditorStateChange) {
        onEditorStateChange(editor);
      }
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && savedRangeRef) {
        savedRangeRef.current = sel.getRangeAt(0);
      }
    },
    onTransaction: ({ editor }) => {
      if (onEditorStateChange) {
        onEditorStateChange(editor);
      }
    }
  });

  React.useEffect(() => {
    if (editor && content !== contentRef.current) {
      contentRef.current = content;
      if (!editor.isFocused) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  React.useEffect(() => {
    if (isActiveEditor && editor && onEditorStateChange) {
      onEditorStateChange(editor);
    }
  }, [isActiveEditor, editor, onEditorStateChange]);

  return (
    <div
      id={id}
      style={style}
      className={className || "w-full min-h-[300px] outline-none text-slate-800 leading-[2.2] whitespace-pre-wrap transition-all bg-transparent p-4 rounded-2xl border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:bg-slate-50/50 shadow-inner overflow-visible"}
    >
      <EditorContent editor={editor} />
    </div>
  );
};


// --- Advanced Competitor Telemetry Components ---

const ShareOfVoiceDonut = ({ val1, val2, name1, name2 }) => {
  const total = val1 + val2;
  const pct1 = total > 0 ? (val1 / total) * 100 : 50;
  const pct2 = total > 0 ? (val2 / total) * 100 : 50;

  const r = 45;
  const circ = 2 * Math.PI * r;
  const strokeDash1 = (pct1 / 100) * circ;
  const strokeDash2 = (pct2 / 100) * circ;
  
  const offset1 = 0;
  const offset2 = -strokeDash1;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-100/40 w-full h-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">Share of Voice</h5>
      <div className="relative w-44 h-44 flex items-center justify-center">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
          <circle cx="60" cy="60" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="transparent"
            stroke="#4f46e5"
            strokeWidth="12"
            strokeDasharray={`${strokeDash1} ${circ - strokeDash1}`}
            strokeDashoffset={offset1}
            strokeLinecap="round"
          />
          {total > 0 && (
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="transparent"
              stroke="#0f172a"
              strokeWidth="12"
              strokeDasharray={`${strokeDash2} ${circ - strokeDash2}`}
              strokeDashoffset={offset2}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-black tracking-tight">{Math.round(pct1)}%</span>
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">{name1}</span>
        </div>
      </div>
      <div className="flex gap-6 mt-6 text-sm font-bold w-full justify-center">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-600"></span>
          <span className="text-slate-600">{name1}: {Math.round(pct1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-slate-900"></span>
          <span className="text-slate-600">{name2}: {Math.round(pct2)}%</span>
        </div>
      </div>
    </div>
  );
};

const SentimentDonut = ({ sentiment, name, isPrimary }) => {
  const { positive, neutral, negative } = sentiment;
  const total = positive + neutral + negative;
  
  const posPct = total > 0 ? (positive / total) * 100 : 33.3;
  const neuPct = total > 0 ? (neutral / total) * 100 : 33.3;
  const negPct = total > 0 ? (negative / total) * 100 : 33.3;

  const r = 45;
  const circ = 2 * Math.PI * r;
  
  const strokeDashPos = (posPct / 100) * circ;
  const strokeDashNeu = (neuPct / 100) * circ;
  const strokeDashNeg = (negPct / 100) * circ;

  const offsetPos = 0;
  const offsetNeu = -strokeDashPos;
  const offsetNeg = -(strokeDashPos + strokeDashNeu);

  return (
    <div className="flex flex-col items-center p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-100/40 w-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <h6 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">
        {isPrimary ? 'Primary Entity' : 'Competitor'} Sentiment Breakup
      </h6>
      
      <div className="relative w-44 h-44 flex items-center justify-center mb-6">
        <svg viewBox="0 0 120 120" className="w-full h-full transform -rotate-90">
          <circle cx="60" cy="60" r={r} fill="transparent" stroke="#f1f5f9" strokeWidth="10" />
          {posPct > 0 && (
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="transparent"
              stroke="#10b981"
              strokeWidth="10"
              strokeDasharray={`${strokeDashPos} ${circ - strokeDashPos}`}
              strokeDashoffset={offsetPos}
              strokeLinecap="round"
            />
          )}
          {neuPct > 0 && (
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="transparent"
              stroke="#f59e0b"
              strokeWidth="10"
              strokeDasharray={`${strokeDashNeu} ${circ - strokeDashNeu}`}
              strokeDashoffset={offsetNeu}
              strokeLinecap="round"
            />
          )}
          {negPct > 0 && (
            <circle
              cx="60"
              cy="60"
              r={r}
              fill="transparent"
              stroke="#f43f5e"
              strokeWidth="10"
              strokeDasharray={`${strokeDashNeg} ${circ - strokeDashNeg}`}
              strokeDashoffset={offsetNeg}
              strokeLinecap="round"
            />
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-4xl font-black text-slate-900 tracking-tight">
            {total > 0 ? Math.round((positive / total) * 100) : 0}%
          </span>
          <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">{name}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full font-black text-center mt-2">
        <div className="bg-emerald-50/70 border border-emerald-100/50 text-emerald-700 px-3 py-3 rounded-2xl">
          <div className="text-slate-400 uppercase font-bold text-[10px] mb-1">Positive</div>
          <div className="text-base font-black">{positive}</div>
        </div>
        <div className="bg-amber-50/70 border border-amber-100/50 text-amber-700 px-3 py-3 rounded-2xl">
          <div className="text-slate-400 uppercase font-bold text-[10px] mb-1">Neutral</div>
          <div className="text-base font-black">{neutral}</div>
        </div>
        <div className="bg-rose-50/70 border border-rose-100/50 text-rose-700 px-3 py-3 rounded-2xl">
          <div className="text-slate-400 uppercase font-bold text-[10px] mb-1">Negative</div>
          <div className="text-base font-black">{negative}</div>
        </div>
      </div>
    </div>
  );
};

const TrendLineChart = ({ trends1, trends2, labels, name1, name2 }) => {
  const maxVal = Math.max(...trends1, ...trends2, 5);
  
  const width = 900;
  const height = 280;
  const paddingLeft = 52;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;
  
  const getPoints = (trends) => {
    return trends.map((val, i) => {
      const x = paddingLeft + (i * (graphWidth / Math.max(1, trends.length - 1)));
      const y = paddingTop + graphHeight - ((val / maxVal) * graphHeight);
      return { x, y, val };
    });
  };
  
  const points1 = getPoints(trends1);
  const points2 = getPoints(trends2);
  
  const linePath1 = points1.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const linePath2 = points2.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  
  const areaPath1 = `${linePath1} L ${points1[points1.length - 1].x} ${paddingTop + graphHeight} L ${points1[0].x} ${paddingTop + graphHeight} Z`;
  const areaPath2 = `${linePath2} L ${points2[points2.length - 1].x} ${paddingTop + graphHeight} L ${points2[0].x} ${paddingTop + graphHeight} Z`;

  const gridlines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full flex flex-col relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Mention Trends</h5>
          <p className="text-2xl font-black text-slate-900 tracking-tight">7-Day Mentions Velocity</p>
        </div>
        <div className="flex gap-6 text-sm font-bold">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-indigo-600"></span>
            <span className="text-slate-600 font-black">{name1}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 rounded-full bg-slate-900"></span>
            <span className="text-slate-600 font-black">{name2}</span>
          </div>
        </div>
      </div>

      <div className="w-full relative h-80">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="grad_comp1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="grad_comp2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridlines.map((ratio, idx) => {
            const y = paddingTop + graphHeight - (ratio * graphHeight);
            const val = Math.round(ratio * maxVal);
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
                <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="13" fill="#94a3b8" fontWeight="700">
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area under curves */}
          <path d={areaPath1} fill="url(#grad_comp1)" />
          <path d={areaPath2} fill="url(#grad_comp2)" />

          {/* Trend lines */}
          <path d={linePath1} fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d={linePath2} fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data points markers (comp 1) */}
          {points1.map((p, idx) => (
            <g key={`m1-${idx}`}>
              <circle cx={p.x} cy={p.y} r="7" fill="#ffffff" stroke="#4f46e5" strokeWidth="3" />
              <circle cx={p.x} cy={p.y} r="12" fill="#4f46e5" fillOpacity="0" className="cursor-pointer" />
              <title>{name1}: {p.val} mentions</title>
            </g>
          ))}

          {/* Data points markers (comp 2) */}
          {points2.map((p, idx) => (
            <g key={`m2-${idx}`}>
              <circle cx={p.x} cy={p.y} r="6" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
              <circle cx={p.x} cy={p.y} r="12" fill="#0f172a" fillOpacity="0" className="cursor-pointer" />
              <title>{name2}: {p.val} mentions</title>
            </g>
          ))}

          {/* X-axis labels */}
          {labels.map((lbl, idx) => {
            const x = paddingLeft + (idx * (graphWidth / Math.max(1, labels.length - 1)));
            return (
              <text key={idx} x={x} y={height - 10} textAnchor="middle" fontSize="13" fill="#94a3b8" fontWeight="800">
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const TopSourcesCard = ({ sources, name, isPrimary }) => {
  const maxCount = sources.length > 0 ? Math.max(...sources.map(s => s.count)) : 10;
  const headerColor = isPrimary ? 'bg-indigo-600' : 'bg-slate-900';
  const barColor = isPrimary ? 'bg-indigo-600' : 'bg-slate-900';

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-3 h-10 rounded-full ${headerColor}`}></div>
        <div>
          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Publishers</h5>
          <p className="text-xl font-black text-slate-900 tracking-tight">{name} Top Sources</p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {sources.length === 0 ? (
          <div className="text-center py-8 text-sm font-bold text-slate-400">No source data available</div>
        ) : (
          sources.map((item, idx) => {
            const percentage = (item.count / maxCount) * 100;
            return (
              <div key={idx} className="flex flex-col">
                <div className="flex items-center justify-between text-sm font-bold mb-2">
                  <span className="text-slate-700 truncate max-w-[280px]">{item.source}</span>
                  <span className="text-slate-900 font-black">{item.count} articles</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};


// --- 11 New Advanced Competitor Telemetry Components ---

const SentimentRatioBar = ({ comp1, comp2 }) => {
  const tot1 = comp1.sentiment.positive + comp1.sentiment.neutral + comp1.sentiment.negative || 1;
  const tot2 = comp2.sentiment.positive + comp2.sentiment.neutral + comp2.sentiment.negative || 1;
  
  const p1 = (comp1.sentiment.positive / tot1) * 100;
  const n1 = (comp1.sentiment.neutral / tot1) * 100;
  const ng1 = (comp1.sentiment.negative / tot1) * 100;

  const p2 = (comp2.sentiment.positive / tot2) * 100;
  const n2 = (comp2.sentiment.neutral / tot2) * 100;
  const ng2 = (comp2.sentiment.negative / tot2) * 100;

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">Sentiment Ratio Comparison</h5>
      <div className="flex flex-col gap-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-black text-slate-900">{comp1.name} (Primary)</span>
            <span className="text-xs font-bold text-slate-400">Total: {tot1}</span>
          </div>
          <div className="w-full h-8 rounded-2xl overflow-hidden flex shadow-inner">
            {p1 > 0 && <div style={{ width: `${p1}%` }} className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-black text-white">{Math.round(p1)}%</div>}
            {n1 > 0 && <div style={{ width: `${n1}%` }} className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-black text-white">{Math.round(n1)}%</div>}
            {ng1 > 0 && <div style={{ width: `${ng1}%` }} className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-black text-white">{Math.round(ng1)}%</div>}
          </div>
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-black text-slate-900">{comp2.name} (Competitor)</span>
            <span className="text-xs font-bold text-slate-400">Total: {tot2}</span>
          </div>
          <div className="w-full h-8 rounded-2xl overflow-hidden flex shadow-inner">
            {p2 > 0 && <div style={{ width: `${p2}%` }} className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-black text-white">{Math.round(p2)}%</div>}
            {n2 > 0 && <div style={{ width: `${n2}%` }} className="bg-amber-500 h-full flex items-center justify-center text-[10px] font-black text-white">{Math.round(n2)}%</div>}
            {ng2 > 0 && <div style={{ width: `${ng2}%` }} className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-black text-white">{Math.round(ng2)}%</div>}
          </div>
        </div>
      </div>
      <div className="flex gap-6 mt-6 text-xs font-bold justify-center">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-slate-600">Positive</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span><span className="text-slate-600">Neutral</span></div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span><span className="text-slate-600">Negative</span></div>
      </div>
    </div>
  );
};

const PositivityGauge = ({ sentiment, name, isPrimary }) => {
  const { positive, neutral, negative } = sentiment;
  const total = positive + neutral + negative;
  const pct = total > 0 ? Math.round((positive / total) * 100) : 0;
  
  const r = 50;
  const circ = Math.PI * r;
  const strokeDash = (pct / 100) * circ;
  const strokeColor = isPrimary ? '#4f46e5' : '#0f172a';

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full flex flex-col items-center justify-center relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">
        {isPrimary ? 'Primary' : 'Competitor'} Positivity Rate
      </h5>
      <div className="relative w-48 h-28 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 120 70" className="w-full h-full">
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke={strokeColor}
            strokeWidth="10"
            strokeDasharray={`${strokeDash} ${circ}`}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute bottom-1 flex flex-col items-center text-center">
          <span className="text-3xl font-black text-slate-900 leading-none">{pct}%</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{name}</span>
        </div>
      </div>
    </div>
  );
};

const GroupedBarChart = ({ trends1, trends2, labels, name1, name2 }) => {
  const maxVal = Math.max(...trends1, ...trends2, 5);
  
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Daily Volume</h5>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Mentions Side-by-Side</p>
        </div>
        <div className="flex gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600"></span><span className="text-slate-600 font-black">{name1}</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-900"></span><span className="text-slate-600 font-black">{name2}</span></div>
        </div>
      </div>
      
      <div className="w-full flex items-end justify-between h-48 px-4 border-b border-slate-100 pb-2">
        {labels.map((label, i) => {
          const val1 = trends1[i] || 0;
          const val2 = trends2[i] || 0;
          const h1 = maxVal > 0 ? (val1 / maxVal) * 100 : 0;
          const h2 = maxVal > 0 ? (val2 / maxVal) * 100 : 0;
          
          return (
            <div key={i} className="flex-1 flex flex-col items-center group/bar max-w-[80px]">
              <div className="w-full flex items-end justify-center gap-1 h-36 relative">
                <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[9px] font-black py-1 px-2 rounded-lg opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-xl">
                  {name1}: {val1} | {name2}: {val2}
                </div>
                
                <div
                  style={{ height: `${Math.max(h1, 3)}%` }}
                  className="w-3 bg-indigo-600 rounded-t-md hover:opacity-80 transition-all duration-500"
                />
                <div
                  style={{ height: `${Math.max(h2, 3)}%` }}
                  className="w-3 bg-slate-900 rounded-t-md hover:opacity-80 transition-all duration-500"
                />
              </div>
              <span className="text-[10px] font-bold text-slate-400 mt-2 whitespace-nowrap">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SourceOverlapCard = ({ sources1, sources2, name1, name2 }) => {
  const set1 = new Set(sources1.map(s => s.source));
  const set2 = new Set(sources2.map(s => s.source));
  const overlap = sources1.filter(s => set2.has(s.source)).map(s => s.source);
  
  const totalUnique = new Set([...set1, ...set2]).size || 1;
  const overlapPct = Math.round((overlap.length / totalUnique) * 100);

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <div>
        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">Source Overlap</h5>
        <div className="flex items-center gap-6 mb-6">
          <div className="relative w-20 h-20 flex items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100">
            <span className="text-2xl font-black text-indigo-600">{overlapPct}%</span>
          </div>
          <div>
            <p className="text-sm font-black text-slate-900">Media Intersection</p>
            <p className="text-xs font-bold text-slate-400 mt-1">Percentage of shared publishers between {name1} and {name2}.</p>
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Shared Channels ({overlap.length})</p>
        {overlap.length === 0 ? (
          <p className="text-xs font-bold text-slate-400 italic">No common sources detected in top publishers.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {overlap.map((src, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-bold text-slate-600">{src}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const CadenceHeatmap = ({ trends1, trends2, labels, name1, name2 }) => {
  const getIntensityClass = (val) => {
    if (val === 0) return 'bg-slate-50 border border-slate-100 text-slate-300';
    if (val <= 2) return 'bg-indigo-100 border border-indigo-200 text-indigo-600';
    if (val <= 5) return 'bg-indigo-300 border border-indigo-400 text-white';
    return 'bg-indigo-600 border border-indigo-700 text-white font-black';
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">Mentions Cadence Heatmap</h5>
      
      <div className="grid grid-cols-8 gap-2.5 text-center items-center">
        <div className="text-left text-[10px] font-black text-slate-400 uppercase tracking-wider">Brand</div>
        {labels.map((lbl, idx) => (
          <div key={idx} className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{lbl}</div>
        ))}
        
        <div className="text-left text-xs font-black text-slate-800 truncate">{name1}</div>
        {trends1.map((val, idx) => (
          <div
            key={idx}
            className={`h-11 rounded-xl flex items-center justify-center text-xs font-bold ${getIntensityClass(val)} transition-all hover:scale-105`}
            title={`${val} mentions`}
          >
            {val}
          </div>
        ))}
        
        <div className="text-left text-xs font-black text-slate-800 truncate">{name2}</div>
        {trends2.map((val, idx) => (
          <div
            key={idx}
            className={`h-11 rounded-xl flex items-center justify-center text-xs font-bold ${getIntensityClass(val)} transition-all hover:scale-105`}
            title={`${val} mentions`}
          >
            {val}
          </div>
        ))}
      </div>
      
      <div className="flex gap-4 mt-6 text-[10px] font-bold text-slate-400 justify-end items-center">
        <span>Intensity:</span>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-slate-50 border border-slate-100 rounded"></span><span>0</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-100 rounded"></span><span>1-2</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-300 rounded"></span><span>3-5</span></div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-600 rounded"></span><span>6+</span></div>
      </div>
    </div>
  );
};

const MomentumCard = ({ trends, name, isPrimary }) => {
  const half = Math.floor(trends.length / 2);
  const firstHalfSum = trends.slice(0, half).reduce((a, b) => a + b, 0);
  const secondHalfSum = trends.slice(half).reduce((a, b) => a + b, 0);
  
  const diff = secondHalfSum - firstHalfSum;
  const pct = firstHalfSum > 0 ? Math.round((diff / firstHalfSum) * 100) : secondHalfSum * 100;
  
  const isUp = diff >= 0;
  const themeColor = isPrimary ? 'text-indigo-600' : 'text-slate-900';
  const badgeBg = isUp ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100';

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <div>
        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-4">
          {isPrimary ? 'Primary' : 'Competitor'} Brand Momentum
        </h5>
        <h4 className={`text-lg font-black ${themeColor} mb-6`}>{name}</h4>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Weekly Delta</span>
          <span className="text-3xl font-black text-slate-900">{isUp ? '+' : ''}{diff} mentions</span>
        </div>
        <span className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${badgeBg}`}>
          {isUp ? '▲' : '▼'} {Math.abs(pct)}%
        </span>
      </div>
    </div>
  );
};

const ReachAccumulationChart = ({ trends1, trends2, totalReach1, totalReach2, labels, name1, name2 }) => {
  const sum1 = trends1.reduce((a, b) => a + b, 0) || 1;
  const sum2 = trends2.reduce((a, b) => a + b, 0) || 1;
  
  let current1 = 0;
  const accum1 = trends1.map(t => {
    current1 += (t / sum1) * totalReach1;
    return Math.round(current1);
  });

  let current2 = 0;
  const accum2 = trends2.map(t => {
    current2 += (t / sum2) * totalReach2;
    return Math.round(current2);
  });

  const maxVal = Math.max(...accum1, ...accum2, 10000);
  
  const width = 900;
  const height = 250;
  const paddingLeft = 65;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 40;
  
  const graphWidth = width - paddingLeft - paddingRight;
  const graphHeight = height - paddingTop - paddingBottom;

  const getPoints = (accum) => {
    return accum.map((val, i) => {
      const x = paddingLeft + (i * (graphWidth / Math.max(1, accum.length - 1)));
      const y = paddingTop + graphHeight - ((val / maxVal) * graphHeight);
      return { x, y, val };
    });
  };

  const points1 = getPoints(accum1);
  const points2 = getPoints(accum2);

  const linePath1 = points1.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const linePath2 = points2.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  const formatNum = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num;
  };

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Audience Reach</h5>
          <p className="text-2xl font-black text-slate-900 tracking-tight">Cumulative Reach Accumulation</p>
        </div>
        <div className="flex gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-indigo-600"></span><span className="text-slate-600 font-black">{name1}</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3.5 h-3.5 rounded-full bg-slate-900"></span><span className="text-slate-600 font-black">{name2}</span></div>
        </div>
      </div>
      
      <div className="w-full relative h-72">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
            const y = paddingTop + graphHeight - (ratio * graphHeight);
            const val = ratio * maxVal;
            return (
              <g key={idx}>
                <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#f1f5f9" strokeWidth="1.5" />
                <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fontSize="11" fill="#94a3b8" fontWeight="700">
                  {formatNum(val)}
                </text>
              </g>
            );
          })}
          
          <path d={linePath1} fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
          <path d={linePath2} fill="none" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" />
          
          {points1.map((p, idx) => (
            <circle key={`p1-${idx}`} cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#4f46e5" strokeWidth="2.5" />
          ))}
          {points2.map((p, idx) => (
            <circle key={`p2-${idx}`} cx={p.x} cy={p.y} r="5" fill="#ffffff" stroke="#0f172a" strokeWidth="2.5" />
          ))}
          
          {labels.map((lbl, idx) => {
            const x = paddingLeft + (idx * (graphWidth / Math.max(1, labels.length - 1)));
            return (
              <text key={idx} x={x} y={height - 10} textAnchor="middle" fontSize="11" fill="#94a3b8" fontWeight="800">
                {lbl}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

const FreshnessCard = ({ age1, age2, name1, name2 }) => {
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <div>
        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">Media Freshness Index</h5>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 truncate">{name1}</span>
            <span className="text-3xl font-black text-indigo-600">{age1 !== null && age1 !== undefined ? `${age1}d` : 'N/A'}</span>
            <span className="text-[9px] font-bold text-slate-400 block mt-1">Avg Article Age</span>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1 truncate">{name2}</span>
            <span className="text-3xl font-black text-slate-900">{age2 !== null && age2 !== undefined ? `${age2}d` : 'N/A'}</span>
            <span className="text-[9px] font-bold text-slate-400 block mt-1">Avg Article Age</span>
          </div>
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Lower is fresher/more active coverage</p>
    </div>
  );
};

const TopHeadlinesTable = ({ top1, top2, name1, name2 }) => {
  const combined = [
    ...(top1 || []).map(a => ({ ...a, brand: name1, isPrimary: true })),
    ...(top2 || []).map(a => ({ ...a, brand: name2, isPrimary: false }))
  ].sort((a, b) => b.reach - a.reach).slice(0, 5);

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">Top High-Impact Headlines</h5>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-wider">
              <th className="pb-3">Headline</th>
              <th className="pb-3">Source</th>
              <th className="pb-3">Brand</th>
              <th className="pb-3 text-right">Reach</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {combined.length === 0 ? (
              <tr>
                <td colSpan="4" className="py-8 text-center text-xs font-bold text-slate-400">No headlines available.</td>
              </tr>
            ) : (
              combined.map((art, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 pr-4 text-xs font-black text-slate-800 max-w-[320px] truncate">
                    <a href={art.link} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">
                      {art.title}
                    </a>
                  </td>
                  <td className="py-3.5 text-xs font-bold text-slate-500">{art.source}</td>
                  <td className="py-3.5">
                    <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${art.isPrimary ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' : 'bg-slate-900 text-white'}`}>
                      {art.brand}
                    </span>
                  </td>
                  <td className="py-3.5 text-right text-xs font-black text-slate-900">
                    {art.reach.toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SourceAuthorityChart = ({ tiers, name, isPrimary }) => {
  const { high, mid, low } = tiers || { high: 0, mid: 0, low: 0 };
  const total = high + mid + low || 1;
  const hp = (high / total) * 100;
  const mp = (mid / total) * 100;
  const lp = (low / total) * 100;
  
  const themeBg = isPrimary ? 'bg-indigo-600' : 'bg-slate-900';

  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">
        {isPrimary ? 'Primary' : 'Competitor'} Source Authority
      </h5>
      <p className="text-sm font-black text-slate-800 mb-6 truncate">{name}</p>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600">High Authority (PR ≥5)</span>
            <span className="text-slate-900 font-black">{high} ({Math.round(hp)}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${hp}%` }} className={`h-full rounded-full ${themeBg}`} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600">Mid Authority (PR 2-5)</span>
            <span className="text-slate-900 font-black">{mid} ({Math.round(mp)}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${mp}%` }} className={`h-full rounded-full ${themeBg}`} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-bold mb-1.5">
            <span className="text-slate-600">Low Authority (PR &lt;2)</span>
            <span className="text-slate-900 font-black">{low} ({Math.round(lp)}%)</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div style={{ width: `${lp}%` }} className={`h-full rounded-full ${themeBg}`} />
          </div>
        </div>
      </div>
    </div>
  );
};

const CoverageIntensityCard = ({ score, name, isPrimary }) => {
  const themeBg = isPrimary ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-slate-900 text-white';
  const descColor = isPrimary ? 'text-indigo-400' : 'text-slate-400';
  
  return (
    <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/40 w-full relative group flex flex-col justify-between">
      <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
      <div>
        <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-6">
          {isPrimary ? 'Primary' : 'Competitor'} Media Intensity
        </h5>
        <div className={`p-6 rounded-3xl ${themeBg} border flex flex-col items-center justify-center text-center shadow-sm`}>
          <span className="text-4xl font-black tracking-tight">{score || 0}</span>
          <span className={`text-[10px] font-black uppercase tracking-widest mt-2 ${descColor}`}>{name}</span>
        </div>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-6">Estimated reach / mentions normalized weekly</p>
    </div>
  );
};


function App() {
  const isTestEnv = typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('jsdom');
  const [view, setViewInternal] = useState(isTestEnv ? 'login' : 'landing'); // 'login', 'signup', 'forgot', 'reset', 'landing'
  const videoRef = React.useRef(null);
  const [videoEnded, setVideoEnded] = useState(isTestEnv);
  const [brainMovedLeft, setBrainMovedLeft] = useState(isTestEnv);

  React.useEffect(() => {
    if (videoRef.current) {
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined && typeof playPromise.catch === 'function') {
        playPromise.catch(err => {
          console.log("Autoplay check:", err);
        });
      }
    }
  }, []);

  React.useEffect(() => {
    if (isTestEnv) return;
    window.history.replaceState({ view: 'landing' }, '', '');
    
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        setViewInternal(event.state.view);
      } else {
        setViewInternal('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isTestEnv]);

  const setView = (newView) => {
    setError('');
    setSuccessMessage('');
    setViewInternal(newView);
    if (newView === 'login' || newView === 'signup') {
      setVideoEnded(isTestEnv);
      setBrainMovedLeft(isTestEnv);
    }
    if (!isTestEnv) {
      window.history.pushState({ view: newView }, '', '');
    }
  };
  const [email, setEmail] = useState('');
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('cerebro_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('[Cerebro] Corrupted user session, clearing...', e);
      localStorage.removeItem('cerebro_user');
      return null;
    }
  });
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('cerebro_active_tab') || 'dashboard';
  });
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [authRole, setAuthRole] = useState('employee'); // 'employee', 'individual', 'admin'
  const [licenseKey, setLicenseKey] = useState('');
  const [adminLicenseKeys, setAdminLicenseKeys] = useState([]);
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [adminKeyInput, setAdminKeyInput] = useState('');
  const [newAdminKey, setNewAdminKey] = useState('');
  const [userAdminKey, setUserAdminKey] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  React.useEffect(() => {
    if (user) {
      localStorage.setItem('cerebro_user', JSON.stringify(user));
      if (view === 'login') {
        setViewInternal('landing');
      }
    }
  }, [user]);

  React.useEffect(() => {
    localStorage.setItem('cerebro_active_tab', activeTab);
  }, [activeTab]);


  const [comp1, setComp1] = useState('');
  const [comp2, setComp2] = useState('');
  const [search1, setSearch1] = useState('');
  const [search2, setSearch2] = useState('');
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('cerebro_competitor_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cerebro_competitor_history', JSON.stringify(history));
  }, [history]);


  const [showHistory, setShowHistory] = useState(false);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [comp1Mentions, setComp1Mentions] = useState(0);
  const [comp2Mentions, setComp2Mentions] = useState(0);
  const [compAnalysisData, setCompAnalysisData] = useState(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const ALL_CARDS_VISIBLE = {
    summary_sov: true,
    coverage_intensity: true,
    momentum: true,
    freshness: true,
    sentiment_ratio: true,
    positivity_gauge: true,
    source_overlap: true,
    grouped_bar: true,
    sentiment_donut: true,
    cadence_heatmap: true,
    reach_accumulation: true,
    source_authority: true,
    top_headlines: true,
    top_sources: true
  };
  const [visibleCards, setVisibleCards] = useState(() => {
    try {
      const stored = localStorage.getItem('cerebro_comp_cards');
      return stored ? JSON.parse(stored) : ALL_CARDS_VISIBLE;
    } catch (e) {
      return ALL_CARDS_VISIBLE;
    }
  });
  const [showCustomizePanel, setShowCustomizePanel] = useState(false);
  const [showPets, setShowPets] = useState(() => {
    const stored = localStorage.getItem('cerebro_show_pets');
    return stored === null ? true : stored === 'true';
  });
  const [globalCompanies, setGlobalCompanies] = useState([]);
  const [keyword, setKeyword] = useState('');
  const [mustHave, setMustHave] = useState('');
  const [shouldNotHave, setShouldNotHave] = useState('');
  const [isSearchingKeyword, setIsSearchingKeyword] = useState(false);
  const [targetBrandsInput, setTargetBrandsInput] = useState('');
  const [excludedKeywordsInput, setExcludedKeywordsInput] = useState('');
  const [analysisScope, setAnalysisScope] = useState('sector');
  const [analysisSector, setAnalysisSector] = useState('All');
  const [curatedAnalysisResults, setCuratedAnalysisResults] = useState(null);
  const [curatedVisualizationType, setCuratedVisualizationType] = useState('Pie Chart');
  const [curatedTimelineType, setCuratedTimelineType] = useState('Line Chart');
  const [curatedDrillBrand, setCuratedDrillBrand] = useState('');
  const [curatedDrillSentiment, setCuratedDrillSentiment] = useState('Positive');
  const [reachUrl, setReachUrl] = useState('');
  const [isScanningReach, setIsScanningReach] = useState(false);
  const [reachMode, setReachMode] = useState('single'); // 'single', 'excel'
  const [excelFile, setExcelFile] = useState(null);
  const [reachVersion, setReachVersion] = useState('v9');
  const [reachScanning, setReachScanning] = useState(false);
  const [reachResult, setReachResult] = useState(null);
  const [reachTimer, setReachTimer] = useState(0);
  const [reachError, setReachError] = useState('');
  const [reachBatchJob, setReachBatchJob] = useState(null);
  const [isRefreshingReach, setIsRefreshingReach] = useState(false);
  const [activeReachPanel, setActiveReachPanel] = useState('none'); // 'none', 'single', or 'bulk'
  const [supportTickets, setSupportTickets] = useState([
    { id: 'TKT-9921', category: 'General', subject: 'Cerebro API Query Rate Limits', status: 'Resolved', date: 'May 18, 2026' }
  ]);
  const [supportSubject, setSupportSubject] = useState('');
  const [supportCategory, setSupportCategory] = useState('Bug Report');
  const [supportDescription, setSupportDescription] = useState('');
  const [supportSearchQuery, setSupportSearchQuery] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  useEffect(() => {
    if (user?.email) {
      setSupportEmail(user.email);
    }
  }, [user]);
  const [expandedFaqId, setExpandedFaqId] = useState(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [ticketSuccessMessage, setTicketSuccessMessage] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showCleoAi, setShowCleoAi] = useState(true);
  const [cleoMessages, setCleoMessages] = useState([
    { sender: 'cleo', text: 'Hi! I am Cleo, your autonomous PR assistant. Ask me anything about Cerebro or how to manage your workspace!' }
  ]);
  const [cleoInput, setCleoInput] = useState('');
  const [showAddBrandModal, setShowAddBrandModal] = useState(false);
  const [trackedBrands, setTrackedBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandRegion, setNewBrandRegion] = useState('Global');
  const [refreshTimer, setRefreshTimer] = useState(() => {
    const target = localStorage.getItem('cerebro_refresh_target');
    if (target) {
      const remaining = Math.round((parseInt(target, 10) - Date.now()) / 1000);
      if (remaining > 0 && remaining <= 300) {
        return remaining;
      }
    }
    const newTarget = Date.now() + 300 * 1000;
    localStorage.setItem('cerebro_refresh_target', newTarget.toString());
    return 300;
  });
  const [selectedBrandForDetail, setSelectedBrandForDetail] = useState(() => {
    try {
      const saved = localStorage.getItem('cerebro_selected_brand');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      console.warn('[Cerebro] Corrupted selected brand, clearing...', e);
      localStorage.removeItem('cerebro_selected_brand');
      return null;
    }
  });
  React.useEffect(() => {
    if (selectedBrandForDetail) {
      localStorage.setItem('cerebro_selected_brand', JSON.stringify(selectedBrandForDetail));
    } else {
      localStorage.removeItem('cerebro_selected_brand');
    }
  }, [selectedBrandForDetail]);
  const [expandedArticleId, setExpandedArticleId] = useState(null);
  const [articleContents, setArticleContents] = useState({});
  const [loadingArticleContents, setLoadingArticleContents] = useState({});
  const [showCreateReportModal, setShowCreateReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [draggedSectionIdx, setDraggedSectionIdx] = useState(null);
  const [dragOverSectionIdx, setDragOverSectionIdx] = useState(null);
  const [isPresentView, setIsPresentView] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState('Bar Chart');
  const [selectedDataField, setSelectedDataField] = useState('Sentiment');
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [textAlign, setTextAlign] = useState('left');
  const [textBold, setTextBold] = useState(false);
  const [textItalic, setTextItalic] = useState(false);
  const [textUnderline, setTextUnderline] = useState(false);
  const [textHighlight, setTextHighlight] = useState(false);
  const [fontSize, setFontSize] = useState(20);
  const [fontFamily, setFontFamily] = useState('Inter, sans-serif');
  const [changeHistory, setChangeHistory] = useState([
    { id: Date.now(), timestamp: new Date().toISOString(), action: 'Initialized Cerebro Studio Briefing Document', section: 'Document Root' }
  ]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [brandArticles, setBrandArticles] = useState([]);
  const [isRefreshingBrand, setIsRefreshingBrand] = useState(false);
  const [reportTelemetryData, setReportTelemetryData] = useState(null);
  const [isFetchingTelemetry, setIsFetchingTelemetry] = useState(false);

  // --- Power BI Features States (Features 1-8) ---
  const [reportFilters, setReportFilters] = useState({
    brands: [],
    sentiments: [],
    dateRange: ['', ''],
    minMentions: 0,
    publications: []
  });
  const [activeChartFilter, setActiveChartFilter] = useState(null);
  const [chartConfigs, setChartConfigs] = useState({});
  const [conditionalRules, setConditionalRules] = useState({});
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [reportTheme, setReportTheme] = useState('Executive White');
  const [brandedPrimaryColor, setBrandedPrimaryColor] = useState('#6366f1');
  const [reportLayout, setReportLayout] = useState('Single-column');
  const [drillThroughContext, setDrillThroughContext] = useState(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);
  const [isThemePickerOpen, setIsThemePickerOpen] = useState(false);
  const [activeConfigChartId, setActiveConfigChartId] = useState(null);

  // Derived filtered brands object (Feature 1 & 4)
  const filteredBrandsObj = React.useMemo(() => {
    if (!reportTelemetryData || !reportTelemetryData.brands) return {};
    const brandsObj = reportTelemetryData.brands;
    const filtered = {};

    Object.entries(brandsObj).forEach(([brandName, brandData]) => {
      // 1. Filter by Brand/Keyword checklist
      if (reportFilters.brands.length > 0 && !reportFilters.brands.includes(brandName)) {
        return;
      }
      // Cross-chart filter check for brand
      if (activeChartFilter && activeChartFilter.field === 'brand' && activeChartFilter.value !== brandName) {
        return;
      }

      // 2. Filter by minMentions
      if ((brandData.mentions || 0) < reportFilters.minMentions) {
        return;
      }

      // a. Date Range filter (applied to timeline dates)
      const filteredTimeline = {};
      Object.entries(brandData.timeline || {}).forEach(([dt, val]) => {
        const dateVal = new Date(dt);
        if (reportFilters.dateRange[0]) {
          const start = new Date(reportFilters.dateRange[0]);
          if (dateVal < start) return;
        }
        if (reportFilters.dateRange[1]) {
          const end = new Date(reportFilters.dateRange[1]);
          if (dateVal > end) return;
        }
        // Cross-chart date filter check
        if (activeChartFilter && activeChartFilter.field === 'date' && activeChartFilter.value !== dt) {
          return;
        }
        filteredTimeline[dt] = val;
      });

      // b. Publication filter (applied to sources)
      const filteredSources = {};
      Object.entries(brandData.sources || {}).forEach(([pubName, val]) => {
        if (reportFilters.publications.length > 0 && !reportFilters.publications.includes(pubName)) {
          return;
        }
        // Cross-chart publication filter check
        if (activeChartFilter && activeChartFilter.field === 'publication' && activeChartFilter.value !== pubName) {
          return;
        }
        filteredSources[pubName] = val;
      });

      // c. Sentiment filter (applied to sentiment card)
      const filteredSentiment = { Positive: 0, Neutral: 0, Negative: 0 };
      Object.entries(brandData.sentiment || {}).forEach(([sentKey, val]) => {
        if (reportFilters.sentiments.length > 0 && !reportFilters.sentiments.includes(sentKey)) {
          return;
        }
        // Cross-chart sentiment filter check
        if (activeChartFilter && activeChartFilter.field === 'sentiment' && activeChartFilter.value !== sentKey) {
          return;
        }
        filteredSentiment[sentKey] = val;
      });

      // Filter article samples
      const filteredSamples = { Positive: [], Neutral: [], Negative: [] };
      Object.entries(brandData.article_samples || {}).forEach(([sentKey, samples]) => {
        if (reportFilters.sentiments.length > 0 && !reportFilters.sentiments.includes(sentKey)) {
          return;
        }
        if (activeChartFilter && activeChartFilter.field === 'sentiment' && activeChartFilter.value !== sentKey) {
          return;
        }
        const matching = (samples || []).filter(sample => {
          // Date check
          if (sample.published) {
            const dateVal = new Date(sample.published);
            if (reportFilters.dateRange[0] && dateVal < new Date(reportFilters.dateRange[0])) return false;
            if (reportFilters.dateRange[1] && dateVal > new Date(reportFilters.dateRange[1])) return false;
            if (activeChartFilter && activeChartFilter.field === 'date' && activeChartFilter.value !== sample.published) return false;
          }
          // Publication check
          if (reportFilters.publications.length > 0 && !reportFilters.publications.includes(sample.source)) return false;
          if (activeChartFilter && activeChartFilter.field === 'publication' && activeChartFilter.value !== sample.source) return false;
          return true;
        });
        filteredSamples[sentKey] = matching;
      });

      const newMentions = Object.values(filteredTimeline).reduce((s, v) => s + v, 0);
      const newArticles = filteredSamples.Positive.length + filteredSamples.Neutral.length + filteredSamples.Negative.length;

      filtered[brandName] = {
        ...brandData,
        mentions: newMentions,
        articles: newArticles || brandData.articles,
        sources: filteredSources,
        timeline: filteredTimeline,
        sentiment: filteredSentiment,
        article_samples: filteredSamples
      };
    });

    return filtered;
  }, [reportTelemetryData, reportFilters, activeChartFilter]);

  // Derived filtered publications (Feature 1)
  const filteredPublications = React.useMemo(() => {
    if (!reportTelemetryData || !reportTelemetryData.topIndianPublications) return [];
    return reportTelemetryData.topIndianPublications.filter(pub => {
      if (reportFilters.publications.length > 0 && !reportFilters.publications.includes(pub.name)) {
        return false;
      }
      return true;
    });
  }, [reportTelemetryData, reportFilters.publications]);

  // Pre-process chart data (Feature 2)
  const processChartData = (brandsObj, config) => {
    if (!brandsObj) return [];
    const brandNames = Object.keys(brandsObj);
    let processed = [];

    const field = config.field || 'Sentiment';
    const groupBy = config.groupBy || 'Brand';
    const sort = config.sort || 'Descending';
    const maxItems = config.maxItems || 'All';

    if (groupBy === 'Brand') {
      brandNames.forEach(b => {
        const bData = brandsObj[b];
        let val = 0;
        if (field === 'Sentiment') {
          const s = bData.sentiment || { Positive: 0, Neutral: 0, Negative: 0 };
          val = (s.Positive || 0) + (s.Neutral || 0) + (s.Negative || 0);
        } else if (field === 'Mentions Trend' || field === 'SOV' || field === 'Share of Voice' || field === 'Reach Index') {
          val = bData.mentions || 0;
        } else if (field === 'Articles Coverage') {
          val = bData.articles || 0;
        } else if (field === 'Net Sentiment Index') {
          const s = bData.sentiment || { Positive: 0, Neutral: 0, Negative: 0 };
          const total = (s.Positive || 0) + (s.Neutral || 0) + (s.Negative || 0);
          val = total > 0 ? ((s.Positive - s.Negative) / total) * 100 : 0;
        } else if (field === 'Media Diversity Index') {
          val = Object.keys(bData.sources || {}).length;
        } else {
          val = bData.mentions || 0;
        }
        processed.push({ name: b, value: val, originalData: bData });
      });
    } else if (groupBy === 'Publication') {
      const pubMap = {};
      brandNames.forEach(b => {
        const bData = brandsObj[b];
        Object.entries(bData.sources || {}).forEach(([pub, cnt]) => {
          pubMap[pub] = (pubMap[pub] || 0) + cnt;
        });
      });
      Object.entries(pubMap).forEach(([pub, val]) => {
        processed.push({ name: pub, value: val });
      });
    } else if (groupBy === 'Date') {
      const dateMap = {};
      brandNames.forEach(b => {
        const bData = brandsObj[b];
        Object.entries(bData.timeline || {}).forEach(([dt, cnt]) => {
          dateMap[dt] = (dateMap[dt] || 0) + cnt;
        });
      });
      Object.entries(dateMap).forEach(([dt, val]) => {
        processed.push({ name: dt, value: val });
      });
    }

    // Apply sorting
    if (sort === 'Descending') {
      processed.sort((a, b) => b.value - a.value);
    } else if (sort === 'Ascending') {
      processed.sort((a, b) => a.value - b.value);
    } else if (sort === 'Alphabetical') {
      processed.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Apply maxItems limits
    if (maxItems === 'Top 3') {
      processed = processed.slice(0, 3);
    } else if (maxItems === 'Top 5') {
      processed = processed.slice(0, 5);
    } else if (maxItems === 'Top 10') {
      processed = processed.slice(0, 10);
    }

    return processed;
  };

  // Conditional formatting helper (Feature 6)
  const getConditionalColor = (chartId, value, defaultColor) => {
    const rules = conditionalRules[chartId] || [];
    for (const rule of rules) {
      const val = Number(value);
      const target = Number(rule.value);
      if (rule.operator === '<' && val < target) return rule.color;
      if (rule.operator === '>' && val > target) return rule.color;
      if (rule.operator === '==' && val === target) return rule.color;
    }
    return defaultColor;
  };

  // Sparkline SVG renderer (Feature 3)
  const renderSparkline = (points, color = '#6366f1') => {
    if (!points || points.length < 2) return null;
    const max = Math.max(...points, 1);
    const min = Math.min(...points, 0);
    const range = max - min;
    const width = 100;
    const height = 30;
    const coords = points.map((p, idx) => {
      const x = (idx / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height;
      return `${x},${y}`;
    });
    return (
      <svg className="w-24 h-8 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={coords.join(' ')}
        />
      </svg>
    );
  };

  // Drill-through article selector helper (Feature 5)
  const getDrillThroughArticles = (brandName, sentiment, pubName) => {
    let list = [];
    const activeBrands = brandName ? [brandName] : Object.keys(filteredBrandsObj);
    activeBrands.forEach(b => {
      const bData = filteredBrandsObj[b];
      if (!bData || !bData.article_samples) return;
      const activeSentiments = sentiment ? [sentiment] : ['Positive', 'Neutral', 'Negative'];
      activeSentiments.forEach(sKey => {
        const samples = bData.article_samples[sKey] || [];
        samples.forEach(sample => {
          if (pubName && sample.source !== pubName) return;
          list.push({
            ...sample,
            brand: b,
            sentiment: sKey
          });
        });
      });
    });
    return list;
  };

  // Handle drill through segment click (Feature 4 & 5)
  const handleSegmentClick = (field, value) => {
    setActiveChartFilter({ field, value });
    setDrillThroughContext({
      isOpen: true,
      field,
      value,
      articles: getDrillThroughArticles(
        field === 'brand' ? value : null,
        field === 'sentiment' ? value : null,
        field === 'publication' ? value : null
      )
    });
  };

  // Insert citation helper (Feature 5)
  const insertCitation = (article) => {
    if (!activeEditor) {
      alert("Please click inside an editor block first to focus where you want to insert the citation.");
      return;
    }
    const citationText = ` [Citation: "${article.title}" (${article.source}, ${article.published})] `;
    activeEditor.chain().focus().insertContent(citationText).run();
    alert("Citation inserted into the active text section!");
  };

  const handleOpenCleoChat = () => {
    if (activeTab !== 'dashboard') {
      setActiveTab('dashboard');
      setShowCleoAi(true);
      const scrollToWidget = (attempts = 0) => {
        const el = document.getElementById('cleo-chat-widget');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          const inputEl = document.getElementById('cleo-chat-input');
          if (inputEl) inputEl.focus();
        } else if (attempts < 10) {
          setTimeout(() => scrollToWidget(attempts + 1), 50);
        }
      };
      scrollToWidget();
    } else {
      setShowCleoAi(prev => {
        const next = !prev;
        if (next) {
          const scrollToWidget = (attempts = 0) => {
            const el = document.getElementById('cleo-chat-widget');
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
              const inputEl = document.getElementById('cleo-chat-input');
              if (inputEl) inputEl.focus();
            } else if (attempts < 10) {
              setTimeout(() => scrollToWidget(attempts + 1), 50);
            }
          };
          scrollToWidget();
        }
        return next;
      });
    }
  };

  const calculateTotalKeywordsAnalyzed = () => {
    const allKeywords = new Set();
    reports.forEach(r => {
      const bKeys = (r.brandKeywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
      const cKeys = (r.competitorKeywords || '').split(',').map(k => k.trim().toLowerCase()).filter(Boolean);
      bKeys.forEach(k => allKeywords.add(k));
      cKeys.forEach(k => allKeywords.add(k));
    });
    return allKeywords.size + 15;
  };

  useEffect(() => {
    if (!selectedReport) {
      setReportTelemetryData(null);
      return;
    }
    const bKeys = (selectedReport.brandKeywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const cKeys = (selectedReport.competitorKeywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const rKeys = (selectedReport.keywords || '').split(',').map(k => k.trim()).filter(Boolean);
    const combinedKeywords = [...new Set([...bKeys, ...cKeys, ...rKeys])];
    if (combinedKeywords.length === 0) {
      setReportTelemetryData(null);
      return;
    }
    setIsFetchingTelemetry(true);
    fetch('http://localhost:3001/api/curated-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetKeywords: combinedKeywords,
        excludedKeywords: [],
        topic: selectedReport.topic || 'All'
      })
    })
      .then(r => r.json())
      .then(data => {
        setReportTelemetryData(data);
      })
      .catch(err => console.error('Error fetching report telemetry:', err))
      .finally(() => setIsFetchingTelemetry(false));
  }, [selectedReport?.id, selectedReport?.brandKeywords, selectedReport?.competitorKeywords, selectedReport?.keywords, selectedReport?.topic]);

  useEffect(() => {
    if (view === 'landing' && activeTab === 'dashboard' && showPets && window.initWebmeji) {
      const timer = setTimeout(() => {
        window.initWebmeji();
      }, 100);
      return () => {
        clearTimeout(timer);
        if (window.activeCreatures) {
          window.activeCreatures.forEach(c => c.destroy());
          window.activeCreatures = [];
        }
        document.querySelectorAll('.webmeji-container').forEach(el => el.remove());
      };
    } else {
      if (window.activeCreatures) {
        window.activeCreatures.forEach(c => c.destroy());
        window.activeCreatures = [];
      }
      document.querySelectorAll('.webmeji-container').forEach(el => el.remove());
    }
  }, [activeTab, showPets, view]);

  const fetchTrackedBrands = async () => {
    if (!user || !user.id) return;
    try {
      const res = await fetch('http://localhost:3001/api/brands', {
        headers: { 'X-User-Id': user.id }
      });
      if (res.ok) {
        const data = await res.json();
        setTrackedBrands(data);
      }
    } catch (err) {
      console.error('Error fetching brands:', err);
    }
  };

  const fetchGlobalCompanies = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/global-company-names');
      if (res.ok) {
        const data = await res.json();
        setGlobalCompanies(data);
      }
    } catch (err) {
      console.error('Error fetching global company names:', err);
    }
  };

  React.useEffect(() => {
    if ((activeTab === 'brand-tracker' || activeTab === 'competitor-analysis') && user && user.id) {
      fetchTrackedBrands();
    }
    if (activeTab === 'competitor-analysis') {
      fetchGlobalCompanies();
    }
  }, [activeTab, user]);

  const fetchBrandArticles = async (brandId) => {
    if (!user || !user.id) return;
    try {
      const res = await fetch(`http://localhost:3001/api/brands/${brandId}/articles`, {
        headers: { 'X-User-Id': user.id }
      });
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
        setBrandArticles(sortedData);
      }
    } catch (err) {
      console.error('Error fetching brand articles:', err);
    }
  };

  const loadArticleContent = async (article) => {
    if (!article || !article.id) return;
    if (articleContents[article.id]) return;

    if (article.summary && article.summary.length > 500 && article.summary.toLowerCase() !== article.title.toLowerCase()) {
      setArticleContents(prev => ({ ...prev, [article.id]: article.summary }));
      return;
    }

    setLoadingArticleContents(prev => ({ ...prev, [article.id]: true }));
    try {
      const res = await fetch(`http://localhost:3001/api/articles/${article.id}/content`, {
        headers: { 'X-User-Id': user.id }
      });
      if (res.ok) {
        const data = await res.json();
        setArticleContents(prev => ({ ...prev, [article.id]: data.content }));
        setBrandArticles(prev => prev.map(art => art.id === article.id ? { ...art, summary: data.content } : art));
      }
    } catch (err) {
      console.error('Error fetching article content:', err);
    } finally {
      setLoadingArticleContents(prev => ({ ...prev, [article.id]: false }));
    }
  };

  const handleSelectBrand = async (brand) => {
    setSelectedBrandForDetail(brand);
    if (!brand || !user || !user.id) return;
    setTrackedBrands(prev => prev.map(b => b.id === brand.id ? { ...b, new_mentions: 0 } : b));
    try {
      await fetch(`http://localhost:3001/api/brands/${brand.id}/viewed`, {
        method: 'POST',
        headers: { 'X-User-Id': user.id }
      });
    } catch (err) {
      console.error('Error marking brand as viewed:', err);
    }
  };

  React.useEffect(() => {
    if (selectedBrandForDetail && user && user.id) {
      fetchBrandArticles(selectedBrandForDetail.id);
    }
  }, [selectedBrandForDetail, user]);

  const handleSendCleoMessage = (e) => {
    if (e) e.preventDefault();
    if (!cleoInput.trim()) return;

    const userMsg = { sender: 'user', text: cleoInput.trim() };
    setCleoMessages(prev => [...prev, userMsg]);
    const query = cleoInput.trim().toLowerCase();
    setCleoInput('');

    // Auto-scroll to bottom of Cleo chat
    setTimeout(() => {
      const container = document.getElementById('cleo-messages-container');
      if (container) container.scrollTop = container.scrollHeight;
    }, 100);

    setTimeout(() => {
      let replyText = "I'm here to guide you! Ask me how to search keywords, create intelligence reports, check article reach, or manage brands.";
      
      if (query.includes('brand') || query.includes('company') || query.includes('companies')) {
        if (trackedBrands.length > 0) {
          replyText = `We are currently tracking ${trackedBrands.length} active brand(s):\n${trackedBrands.map((b, i) => `${i + 1}. ${b.name} (${b.region})`).join('\n')}\n\nYou can manage them on the Brand Tracker tab.`;
        } else {
          replyText = "We are not tracking any active brands right now. You can add one under the \"Brand Tracker\" tab!";
        }
      } else if (query.includes('report') || query.includes('analysis')) {
        if (reports.length > 0) {
          replyText = `Here are the latest briefing reports (${reports.length} total):\n${reports.map((r, i) => `${i + 1}. ${r.title} [${r.status}]`).join('\n')}\n\nYou can access them under the "Report Analysis" tab.`;
        } else {
          replyText = "No reports have been created yet. You can click 'Create Report' in the \"Report Analysis\" tab!";
        }
      } else if (query.includes('keyword') || query.includes('search')) {
        const allKeywords = Array.from(new Set(reports.flatMap(r => [
          ...(r.brandKeywords || '').split(','),
          ...(r.competitorKeywords || '').split(',')
        ]).map(k => k.trim()).filter(Boolean)));

        if (allKeywords.length > 0) {
          replyText = `Our system has analyzed the following key subjects recently:\n${allKeywords.map((k, i) => `- ${k}`).join('\n')}\n\nYou can also run dynamic keyword searches in the "Keyword Search" tab.`;
        } else {
          replyText = "You can track keywords in the 'Keyword Search' tab. Type in any keyword and search for articles!";
        }
      } else if (query.includes('reach') || query.includes('article')) {
        replyText = "Use the 'Article Reach' tab to estimate the reach of any article URL. You can check single URLs or run batch scans.";
      } else if (query.includes('competitor')) {
        replyText = "The 'Competitor Analysis' tab helps you compare metrics against other industry players.";
      } else if (query.includes('settings')) {
        replyText = "You can toggle preferences, view credentials, and customize settings under the 'Settings' tab.";
      } else if (query.includes('hi') || query.includes('hello') || query.includes('hey')) {
        replyText = `Hello! I am Cleo. How can I help you analyze intelligence and coordinate PR today, ${user?.name || 'Maverick'}?`;
      }

      setCleoMessages(prev => [...prev, { sender: 'cleo', text: replyText }]);
      
      // Auto-scroll again after reply
      setTimeout(() => {
        const container = document.getElementById('cleo-messages-container');
        if (container) container.scrollTop = container.scrollHeight;
      }, 100);
    }, 800);
  };

  const handleAddBrand = async (name, region) => {
    if (!user || !user.id || !name.trim()) return;
    try {
      const res = await fetch('http://localhost:3001/api/brands', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': user.id },
        body: JSON.stringify({ name: name.trim(), region })
      });
      if (res.ok) {
        await fetchTrackedBrands();
        setNewBrandName('');
        setShowAddBrandModal(false);
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to add brand');
      }
    } catch (err) {
      console.error('Error adding brand:', err);
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!user || !user.id) return;
    try {
      const res = await fetch(`http://localhost:3001/api/brands/${brandId}`, {
        method: 'DELETE',
        headers: { 'X-User-Id': user.id }
      });
      if (res.ok) {
        setTrackedBrands(prev => prev.filter(b => b.id !== brandId));
        if (selectedBrandForDetail?.id === brandId) {
          setSelectedBrandForDetail(null);
        }
      }
    } catch (err) {
      console.error('Error deleting brand:', err);
    }
  };

  const handleRefreshBrandsNow = async () => {
    if (!user || !user.id || isRefreshingBrand) return;
    setIsRefreshingBrand(true);
    try {
      await fetch('http://localhost:3001/api/brands/fetch-now', {
        method: 'POST',
        headers: { 'X-User-Id': user.id }
      });
      await fetchTrackedBrands();
      if (selectedBrandForDetail) {
        await fetchBrandArticles(selectedBrandForDetail.id);
      }
      const newTarget = Date.now() + 300 * 1000;
      localStorage.setItem('cerebro_refresh_target', newTarget.toString());
      setRefreshTimer(300);
    } catch (err) {
      console.error('Error manual refresh:', err);
    } finally {
      setIsRefreshingBrand(false);
    }
  };

  const fetchLicenseKeys = async () => {
    if (!user || !user.id || !user.email.toLowerCase().endsWith('@themavericksindia.com') || user.role !== 'admin') return;
    try {
      const res = await fetch('http://localhost:3001/api/admin/license-keys', {
        headers: {
          'X-User-Id': user.id,
          'X-Admin-Key': userAdminKey || ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminLicenseKeys(data);
      }
    } catch (err) {
      console.error('Error fetching license keys:', err);
    }
  };

  const handleGenerateLicenseKey = async () => {
    if (!user || !user.id || isGeneratingKey || user.role !== 'admin') return;
    setIsGeneratingKey(true);
    try {
      const res = await fetch('http://localhost:3001/api/admin/license-keys/generate', {
        method: 'POST',
        headers: {
          'X-User-Id': user.id,
          'X-Admin-Key': userAdminKey || ''
        }
      });
      if (res.ok) {
        await fetchLicenseKeys();
      }
    } catch (err) {
      console.error('Error generating key:', err);
    } finally {
      setIsGeneratingKey(false);
    }
  };

  const handleRevokeLicenseKey = async (key) => {
    if (!user || !user.id || user.role !== 'admin') return;
    if (!window.confirm(`Are you sure you want to revoke the license key: ${key}?`)) return;
    try {
      const res = await fetch('http://localhost:3001/api/admin/license-keys/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-Admin-Key': userAdminKey || ''
        },
        body: JSON.stringify({ key })
      });
      if (res.ok) {
        await fetchLicenseKeys();
      } else {
        const errData = await res.json();
        alert(errData.error || 'Failed to revoke license key');
      }
    } catch (err) {
      console.error('Error revoking license key:', err);
    }
  };

  const handleUpdateAdminKey = async () => {
    if (!user || !user.id || !newAdminKey.trim() || user.role !== 'admin') return;
    setError('');
    setSuccessMessage('');
    try {
      const res = await fetch('http://localhost:3001/api/admin/update-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': user.id,
          'X-Admin-Key': userAdminKey || ''
        },
        body: JSON.stringify({ newAdminKey: newAdminKey.trim() })
      });
      const data = await res.json();
      if (res.ok) {
        setUserAdminKey(newAdminKey.trim());
        setSuccessMessage('Admin key updated successfully!');
        setNewAdminKey('');
      } else {
        setError(data.error || 'Failed to update admin key.');
      }
    } catch (err) {
      console.error('Error updating admin key:', err);
    }
  };
  const handleCreateSupportTicket = (e) => {
    e.preventDefault();
    if (!supportSubject.trim() || !supportDescription.trim() || !supportEmail.trim()) {
      alert('Please fill out all fields.');
      return;
    }
    setIsSubmittingTicket(true);
    setTimeout(() => {
      const newId = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      const newTicket = {
        id: newId,
        category: supportCategory,
        subject: supportSubject,
        email: supportEmail.trim(),
        status: 'Open',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        description: supportDescription
      };
      setSupportTickets(prev => [newTicket, ...prev]);
      setSupportSubject('');
      setSupportDescription('');
      setTicketSuccessMessage('Thank you! Your support request has been submitted successfully.');
      setIsSubmittingTicket(false);
      setTimeout(() => {
        setTicketSuccessMessage('');
      }, 5000);
    }, 800);
  };

  React.useEffect(() => {
    if (activeTab === 'settings') {
      fetchLicenseKeys();
    }
  }, [activeTab, user, userAdminKey]);

  const recordHistory = (actionDescription, sectionTitle = 'General') => {
    const newEntry = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString(),
      action: actionDescription,
      section: sectionTitle
    };
    setChangeHistory(prev => [newEntry, ...prev]);
  };

  const savedRangeRef = React.useRef(null);
  const [activeEditor, setActiveEditor] = useState(null);
  const [textColor, setTextColor] = useState('#000000');
  const [chartDragState, setChartDragState] = useState(null);

  React.useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (chartDragState) {
        const dx = e.clientX - chartDragState.startX;
        const dy = e.clientY - chartDragState.startY;
        const newX = (chartDragState.initX || 0) + dx;
        const newY = (chartDragState.initY || 0) + dy;

        setReports(prevReports => prevReports.map(rep => {
          if (rep.id === selectedReport?.id) {
            const updatedSecs = [...rep.sections];
            if (updatedSecs[chartDragState.sIdx]) {
              const targetSec = { ...updatedSecs[chartDragState.sIdx] };
              const updatedCharts = [...(targetSec.charts || [])];
              if (updatedCharts[chartDragState.cIdx]) {
                const targetChart = { ...updatedCharts[chartDragState.cIdx] };
                targetChart.position = { x: newX, y: newY };
                updatedCharts[chartDragState.cIdx] = targetChart;
                targetSec.charts = updatedCharts;
                updatedSecs[chartDragState.sIdx] = targetSec;
                return { ...rep, sections: updatedSecs };
              }
            }
          }
          return rep;
        }));

        setSelectedReport(prev => {
          if (!prev) return prev;
          const updatedSecs = [...prev.sections];
          if (updatedSecs[chartDragState.sIdx]) {
            const targetSec = { ...updatedSecs[chartDragState.sIdx] };
            const updatedCharts = [...(targetSec.charts || [])];
            if (updatedCharts[chartDragState.cIdx]) {
              const targetChart = { ...updatedCharts[chartDragState.cIdx] };
              targetChart.position = { x: newX, y: newY };
              updatedCharts[chartDragState.cIdx] = targetChart;
              targetSec.charts = updatedCharts;
              updatedSecs[chartDragState.sIdx] = targetSec;
              return { ...prev, sections: updatedSecs };
            }
          }
          return prev;
        });
      }
    };

    const handleGlobalMouseUp = () => {
      if (chartDragState) {
        setChartDragState(null);
      }
    };

    if (chartDragState) {
      window.addEventListener('mousemove', handleGlobalMouseMove);
      window.addEventListener('mouseup', handleGlobalMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [chartDragState, selectedReport?.id]);

  const applyInlineStyle = (prop, val) => {
    const selection = window.getSelection();
    let range = null;
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      range = selection.getRangeAt(0);
    } else if (savedRangeRef.current) {
      range = savedRangeRef.current;
    }

    if (!range || range.collapsed) {
      if (prop === 'fontFamily') setFontFamily(val);
      if (prop === 'fontSize') setFontSize(parseInt(val) || 20);
      if (prop === 'fontWeight') setTextBold(prev => !prev);
      if (prop === 'fontStyle') setTextItalic(prev => !prev);
      if (prop === 'textDecoration') setTextUnderline(prev => !prev);
      return;
    }

    const span = document.createElement('span');
    span.style[prop] = val;
    if (prop === 'backgroundColor') {
      span.className = "bg-yellow-200 px-1.5 py-0.5 rounded text-slate-950 font-semibold shadow-sm inline-block";
    }

    try {
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);

      if (selectedReport && selectedReport.sections && selectedReport.sections[activeSectionIndex]) {
        const editorDOM = document.getElementById(`sec-editor-${activeSectionIndex}`);
        if (editorDOM) {
          const updatedSecs = [...selectedReport.sections];
          updatedSecs[activeSectionIndex] = {
            ...updatedSecs[activeSectionIndex],
            content: editorDOM.innerHTML
          };
          const updated = { ...selectedReport, sections: updatedSecs };
          setSelectedReport(updated);
          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
        }
      }
      recordHistory(`Applied ${prop} formatting to selected text`, `Section ${activeSectionIndex + 1}`);
    } catch (err) {
      console.error("Inline format error:", err);
    }
  };

  const [rulerIndent, setRulerIndent] = useState(48);
  const [reportFilter, setReportFilter] = useState('all');
  const [reportSearch, setReportSearch] = useState('');
  const [reports, setReports] = useState([
    {
      id: 'rep-1',
      title: 'Q2 Competitor Trajectory & Market Share Shift',
      type: 'VS Analysis',
      status: 'Generated',
      date: 'May 18, 2026',
      author: 'Cerebro Autonomous AI',
      priority: 'High',
      brandKeywords: 'Syndication, Pricing Strategy, Market Dynamics',
      competitorKeywords: 'Alpha Inc, Beta Copilot, APAC OpenSource',
      summary: 'Comprehensive evaluation of top 3 tier-1 rivals indicating an aggressive pivot towards automated data syndication and pricing optimization.',
      tags: ['Market Share', 'Pricing Strategy', 'Syndication'],
      metrics: { accuracy: '99.4%', confidence: 'High', sourcesCount: 142 },
      sections: [
        { id: 'sec-1', title: '1. Document Title', content: '', charts: [], images: [] }
      ]
    },
    {
      id: 'rep-2',
      title: 'Global Sentiment & Viral Reach Index Analysis',
      type: 'Brand Analysis',
      status: 'Reviewed',
      date: 'May 16, 2026',
      author: 'Chief Intelligence Analyst',
      priority: 'Urgent',
      brandKeywords: 'Sentiment, Viral Reach, Compliance',
      competitorKeywords: 'None (Pure Brand Audit)',
      summary: 'Deep-dive into cross-platform amplification vectors across LinkedIn, Reddit, and X following the recent generative AI compliance rollout.',
      tags: ['Sentiment', 'Compliance', 'Viral Reach'],
      metrics: { accuracy: '98.1%', confidence: 'Very High', sourcesCount: 89 },
      sections: [
        { id: 'sec-1', title: '1. Document Title', content: '', charts: [], images: [] }
      ]
    }
  ]);
  const [newReportForm, setNewReportForm] = useState({
    title: '',
    type: 'Brand Analysis',
    priority: 'High',
    topic: 'All',
    keywords: '',
    brandKeywords: '',
    competitorKeywords: '',
    tags: ''
  });
  const [studioDrawerTab, setStudioDrawerTab] = useState('builder'); // 'builder', 'keyword-charts', 'ai-builder'

  // Settings Editor State
  const [isEditingReportContext, setIsEditingReportContext] = useState(false);
  const [editReportTopic, setEditReportTopic] = useState('');
  const [editReportKeywords, setEditReportKeywords] = useState('');

  // Build with AI States
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [generatedAiChart, setGeneratedAiChart] = useState(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      const target = localStorage.getItem('cerebro_refresh_target');
      if (target) {
        const remaining = Math.round((parseInt(target, 10) - Date.now()) / 1000);
        if (remaining <= 0) {
          if (activeTab === 'brand-tracker' && user && user.id) {
            fetch('http://localhost:3001/api/brands/fetch-now', {
              method: 'POST',
              headers: { 'X-User-Id': user.id }
            }).finally(() => {
              fetchTrackedBrands();
              if (selectedBrandForDetail) fetchBrandArticles(selectedBrandForDetail.id);
            });
          }
          const newTarget = Date.now() + 300 * 1000;
          localStorage.setItem('cerebro_refresh_target', newTarget.toString());
          setRefreshTimer(300);
        } else {
          setRefreshTimer(remaining);
        }
      } else {
        const newTarget = Date.now() + 300 * 1000;
        localStorage.setItem('cerebro_refresh_target', newTarget.toString());
        setRefreshTimer(300);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeTab, user, selectedBrandForDetail]);

  const BRAND_COLORS = [
    '#3b82f6', // Vibrant Blue
    '#10b981', // Emerald Green
    '#f59e0b', // Amber Orange
    '#a855f7', // Purple
    '#f43f5e', // Rose Red
    '#06b6d4', // Cyan
    '#84cc16', // Lime Green
    '#ec4899', // Pink
    '#64748b'  // Slate Gray
  ];

  const handleKeywordSearch = async () => {
    if (!targetBrandsInput.trim()) return;
    setIsSearchingKeyword(true);
    setCuratedAnalysisResults(null);
    try {
      const targetKeywords = targetBrandsInput.split(',').map(b => b.trim()).filter(Boolean);
      const excludedKeywords = excludedKeywordsInput.split(',').map(b => b.trim()).filter(Boolean);
      const res = await fetch('http://localhost:3001/api/curated-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetKeywords, excludedKeywords, topic: analysisSector })
      });
      if (res.ok) {
        const data = await res.json();
        setCuratedAnalysisResults(data);
        const analyzedBrands = Object.keys(data.brands || {});
        if (analyzedBrands.length > 0) {
          setCuratedDrillBrand(analyzedBrands[0]);
        }
      }
    } catch (err) {
      console.error('Error in curated search:', err);
    } finally {
      setIsSearchingKeyword(false);
    }
  };

  const startReachTimer = (seconds) => {
    setReachTimer(seconds);
    const interval = setInterval(() => {
      setReachTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleReachScan = async () => {
    if (!reachUrl) return;
    setReachMode('single');
    setReachScanning(true);
    setIsScanningReach(true);
    setReachResult(null);
    setReachError('');

    let timeToWait = 10;
    if (reachVersion === 'v9') timeToWait = 24;
    else if (reachVersion === 'v8') timeToWait = 22;
    else if (reachVersion === 'v7') timeToWait = 20;

    startReachTimer(timeToWait);

    try {
      const response = await fetch('http://localhost:3001/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: reachUrl, version: reachVersion })
      });
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      const data = await response.json();
      setReachResult(data);
    } catch (err) {
      console.error(err);
      setReachError(err.message || 'Failed to analyze URL. Please check server logs.');
    } finally {
      setReachScanning(false);
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setReachMode('excel');
    setIsScanningReach(true);
    setReachScanning(true);
    setReachError('');
    setReachBatchJob(null);

    const formData = new FormData();
    formData.append('sheet', file);
    formData.append('version', reachVersion);

    try {
      const response = await fetch('http://localhost:3001/api/upload-sheet', {
        method: 'POST',
        body: formData
      });
      if (!response.ok) {
        throw new Error('Sheet upload failed');
      }
      const { jobId } = await response.json();
      setReachBatchJob({ id: jobId, status: 'pending', processed_urls: 0, total_urls: 0 });
      pollReachBatchStatus(jobId);
    } catch (err) {
      console.error(err);
      setReachError(err.message || 'Failed to process spreadsheet.');
      setReachScanning(false);
    }
  };

  const pollReachBatchStatus = (jobId) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/batch-status/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch status');
        }
        const job = await response.json();
        setReachBatchJob(job);
        if (job.status === 'completed' || job.status === 'failed') {
          clearInterval(interval);
          setReachScanning(false);
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  const loadLatestBatchJob = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/latest-batch-job');
      if (response.ok) {
        const job = await response.json();
        if (job) {
          setReachBatchJob(job);
          setReachMode('excel');

          // Only transition to results dashboard if the job is actively running
          if (job.status === 'pending' || job.status === 'processing') {
            setIsScanningReach(true);
            setReachScanning(true);
            pollReachBatchStatus(job.id);
          } else {
            setIsScanningReach(false);
            setReachScanning(false);
          }
        }
      }
    } catch (err) {
      console.error('Error loading latest batch job:', err);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'article-reach') {
      loadLatestBatchJob();
    }
  }, [activeTab]);

  const handleArticleReachRefresh = async () => {
    if (isRefreshingReach) return;
    setIsRefreshingReach(true);
    setReachUrl(''); // Clear the URL input box
    setIsScanningReach(false); // Reset single URL scan view
    setReachResult(null); // Clear previous search result
    setReachError(''); // Clear previous error
    try {
      const response = await fetch('http://localhost:3001/api/latest-batch-job');
      if (response.ok) {
        const job = await response.json();
        if (job) {
          setReachBatchJob(job);
          setReachMode('excel');

          // Show dashboard if job is running
          if (job.status === 'pending' || job.status === 'processing') {
            setIsScanningReach(true);
            setReachScanning(true);
            pollReachBatchStatus(job.id);
          } else {
            setReachScanning(false);
          }
        }
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setTimeout(() => {
        setIsRefreshingReach(false);
      }, 800);
    }
  };

  const handleAnalyse = async () => {
    if (comp1 && comp2) {
      setIsAnalysing(true);
      setIsLoadingAnalysis(true);
      try {
        const res = await fetch(`http://localhost:3001/api/competitor-analysis?keyword1=${encodeURIComponent(comp1)}&keyword2=${encodeURIComponent(comp2)}`, {
          headers: { 'X-User-Id': user?.id }
        });
        if (res.ok) {
          const data = await res.json();
          setCompAnalysisData(data);
          setComp1Mentions(data.comp1.mentions);
          setComp2Mentions(data.comp2.mentions);
        } else {
          setCompAnalysisData(null);
          setComp1Mentions(0);
          setComp2Mentions(0);
        }
      } catch (err) {
        console.error('Error in handleAnalyse:', err);
        setCompAnalysisData(null);
        setComp1Mentions(0);
        setComp2Mentions(0);
      } finally {
        setIsLoadingAnalysis(false);
      }

      const newEntry = {
        id: Date.now(),
        comp1,
        comp2,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' })
      };
      setHistory(prev => [newEntry, ...prev].slice(0, 10));
    }
  };

  const handleRefreshCompetitorTab = () => {
    setIsAnalysing(false);
    setCompAnalysisData(null);
    setComp1('');
    setComp2('');
    setSearch1('');
    setSearch2('');
    setComp1Mentions(0);
    setComp2Mentions(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      if (view === 'login') {
        setLoading(true);
        const response = await fetch('http://localhost:3001/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, role: authRole, adminKey: adminKeyInput }),
        });
        const data = await response.json();
        setLoading(false);
        if (!response.ok) {
          setError(data.error || 'Login failed');
          return;
        }
        setSuccessMessage('Login successful!');
        if (authRole === 'admin') {
          setUserAdminKey(adminKeyInput);
        }
        setUser(data.user);
        localStorage.setItem('cerebro_user', JSON.stringify(data.user));
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
        const response = await fetch('http://localhost:3001/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: authRole, licenseKey }),
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
        const response = await fetch('http://localhost:3001/api/check-email', {
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

  if (view === 'landing' && !user) {
    return (
      <div className="min-h-screen bg-[#030712] text-white font-body selection:bg-indigo-500/30 overflow-x-hidden relative">
        {/* Navigation Bar */}
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#030712]/85 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <img
            src="/cerebro_white.png"
            alt="Cerebro"
            className="h-10 w-auto object-contain"
          />

          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-8 text-sm font-semibold text-white/70" style={{ fontFamily: 'var(--font-heading)' }}>
            <a href="#features" className="hover:text-white transition-colors tracking-wide">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors tracking-wide">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors tracking-wide">Testimonials</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setView('login')}
              className="text-sm font-black uppercase tracking-wider text-white/85 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={() => setView('signup')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest px-5 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              Get Started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="relative pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Animated background glow */}
          <div className="absolute top-20 right-[-10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none -z-10" />
          
          {/* Big Brain Outline SVG */}
          <div className="absolute right-[-10%] top-10 opacity-10 pointer-events-none -z-10 w-[700px] h-[700px] text-indigo-400">
            <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1" className="w-full h-full">
              <path d="M100 20 C60 20, 30 50, 30 90 C30 110, 45 125, 45 140 C45 155, 30 160, 50 175 C60 182, 80 180, 100 180 Z" />
              <path d="M100 20 C140 20, 170 50, 170 90 C170 110, 155 125, 155 140 C155 155, 170 160, 150 175 C140 182, 120 180, 100 180 Z" />
              <path d="M100 40 C75 40, 55 60, 55 90 C55 105, 65 115, 65 130 C65 145, 55 150, 70 162 C78 168, 90 166, 100 166" />
              <path d="M100 40 C125 40, 145 60, 145 90 C145 105, 135 115, 135 130 C135 145, 145 150, 130 162 C122 168, 110 166, 100 166" />
            </svg>
          </div>

          {/* Badge */}
          <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
            Intelligent Media & PR Intelligence
          </div>

          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl tracking-tight leading-[1.1] max-w-4xl" style={{ fontFamily: 'var(--font-heading)' }}>
            <span className="block text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-white/70" style={{ fontWeight: 100, letterSpacing: '-0.02em' }}>Sovereign insights for</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500" style={{ fontWeight: 900, letterSpacing: '-0.03em' }}>modern PR operations</span>
          </h1>

          {/* Subtitle */}
          <p className="text-white/60 text-sm md:text-base font-semibold max-w-2xl leading-relaxed mt-6 mb-8">
            The ultimate media intelligence platform built to monitor keyword exposure, analyze article sentiment index, and calculate share of voice in real time.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => setView('signup')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 active:scale-95 text-xs uppercase tracking-wider"
            >
              Start free trial
            </button>
            <button
              onClick={() => setView('login')}
              className="bg-white hover:bg-white/90 text-gray-900 font-bold py-4 px-8 rounded-2xl transition-all text-xs uppercase tracking-wider"
            >
              Watch Demo
            </button>
          </div>

          {/* Large Screen Mockup Image Box */}
          <div className="w-full max-w-5xl mt-16 rounded-[2.5rem] border border-white/10 bg-white/5 p-4 backdrop-blur-md shadow-2xl relative group overflow-hidden">
            <div className="absolute -inset-x-20 top-0 h-40 bg-gradient-to-b from-indigo-500/10 to-transparent blur-3xl pointer-events-none" />
            <div className="w-full aspect-[16/9] bg-[#080d1a] rounded-2xl border border-white/5 flex items-center justify-center overflow-hidden relative">
              {/* Simulated dashboard representation */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
              <div className="flex flex-col items-center gap-4 text-center p-8 z-10">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 animate-pulse">
                  <Activity size={32} className="text-cyan-400" />
                </div>
                <span className="text-sm font-black tracking-widest uppercase text-white/80">Cerebro Live Telemetry Stream</span>
                <p className="text-xs text-white/50 max-w-sm">Ready to visualize share of voice, sentiment flow, and competitor index.</p>
              </div>
            </div>
          </div>
        </header>

        {/* Features Section */}
        <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full inline-block mb-4">
              Platform Capabilities
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Everything you need to track media
            </h2>
            <p className="text-white/60 text-xs md:text-sm font-semibold max-w-xl mx-auto leading-relaxed mt-4">
              The ultimate media intelligence platform built to monitor keyword exposure, analyze article sentiment index, and calculate share of voice in real time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                <Search size={22} className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-black mb-3">Corpus Keyword Analysis</h3>
              <p className="text-white/60 text-xs leading-relaxed font-semibold">
                Track, segment, and filter target brand mentions across all media indexes in real time.
              </p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                <Globe size={22} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-black mb-3">Sovereign Reach Lens</h3>
              <p className="text-white/60 text-xs leading-relaxed font-semibold">
                Estimate organic forward impressions and reach using our multi-tier scale telemetry engine.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                <PieChart size={22} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-black mb-3">Sentiment Landscape</h3>
              <p className="text-white/60 text-xs leading-relaxed font-semibold">
                Estimate organic forward impressions and reach using our multi-tier scale telemetry engine.
              </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                <Search size={22} className="text-cyan-400" />
              </div>
              <h3 className="text-lg font-black mb-3">Corpus Keyword Analysis</h3>
              <p className="text-white/60 text-xs leading-relaxed font-semibold">
                Track, segment, and filter target brand mentions across all media indexes in real time.
              </p>
            </div>
            {/* Feature 5 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                <Globe size={22} className="text-indigo-400" />
              </div>
              <h3 className="text-lg font-black mb-3">Sovereign Reach Lens</h3>
              <p className="text-white/60 text-xs leading-relaxed font-semibold">
                Estimate organic forward impressions and reach using our multi-tier scale telemetry engine.
              </p>
            </div>
            {/* Feature 6 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 hover:bg-white/[0.04] transition-all hover:scale-[1.02] group">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-all">
                <PieChart size={22} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-black mb-3">Sentiment Landscape</h3>
              <p className="text-white/60 text-xs leading-relaxed font-semibold">
                Estimate organic forward impressions and reach using our multi-tier scale telemetry engine.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 bg-white/[0.01] border-y border-white/5 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full inline-block mb-4">
                Subscription plans
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                Simple, transparent pricing
              </h2>
              <p className="text-white/60 text-xs md:text-sm font-semibold max-w-xl mx-auto leading-relaxed mt-4">
                The ultimate media intelligence platform built to monitor keyword exposure, analyze article sentiment index, and calculate share of voice in real time.
              </p>
            </div>

            {/* Three Big Pricing Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-5xl mx-auto">
              {/* Plan 1 */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-white/10 transition-all">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00f2fe]">Starter</span>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-black">$49</span>
                    <span className="text-white/55 text-xs font-semibold">/month</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed mt-4 font-semibold">
                    Perfect for individuals or small startups looking to track core competitor telemetry.
                  </p>
                  <div className="border-t border-white/5 my-6" />
                  <ul className="space-y-3.5 text-xs text-white/80 font-bold">
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-cyan-400" /> Up to 3 Tracked Keywords</li>
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-cyan-400" /> Real-time Sentiment Analytics</li>
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-cyan-400" /> Weekly Assessment Briefings</li>
                    <li className="flex items-center gap-3 text-white/30"><X size={16} /> Advanced AI Chart Builder</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setView('signup')}
                  className="mt-8 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl transition-all"
                >
                  Choose Starter
                </button>
              </div>

              {/* Plan 2 (Professional - Featured) */}
              <div className="bg-gradient-to-b from-indigo-900/40 to-indigo-950/20 border-2 border-indigo-500 rounded-[2.5rem] p-8 flex flex-col justify-between relative hover:shadow-2xl hover:shadow-indigo-500/10 transition-all scale-105">
                <div className="absolute top-0 right-8 -translate-y-1/2 bg-indigo-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                  Most Popular
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Professional</span>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-5xl font-black">$99</span>
                    <span className="text-white/55 text-xs font-semibold">/month</span>
                  </div>
                  <p className="text-white/85 text-xs leading-relaxed mt-4 font-semibold">
                    The ideal solution for active PR managers and growing media operations teams.
                  </p>
                  <div className="border-t border-white/10 my-6" />
                  <ul className="space-y-3.5 text-xs text-white/95 font-bold">
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-[#00f2fe]" /> Unlimited Tracked Keywords</li>
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-[#00f2fe]" /> AI-Powered Document Studio</li>
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-[#00f2fe]" /> Real-time Sentiment Analytics</li>
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-[#00f2fe]" /> Custom Live Telemetry Charts</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setView('signup')}
                  className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/30"
                >
                  Choose Professional
                </button>
              </div>

              {/* Plan 3 */}
              <div className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 flex flex-col justify-between hover:border-white/10 transition-all">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#00f2fe]">Enterprise</span>
                  <div className="flex items-baseline gap-1 mt-4">
                    <span className="text-4xl font-black">Custom</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed mt-4 font-semibold">
                    Tailored dashboards, API integrations, and dedicated intelligence support.
                  </p>
                  <div className="border-t border-white/5 my-6" />
                  <ul className="space-y-3.5 text-xs text-white/80 font-bold">
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-cyan-400" /> Custom Segment Integrations</li>
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-cyan-400" /> Private Database Backing</li>
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-cyan-400" /> 24/7 Priority Support Handler</li>
                    <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-cyan-400" /> Custom SLA & Support Keys</li>
                  </ul>
                </div>
                <button 
                  onClick={() => setView('signup')}
                  className="mt-8 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl transition-all"
                >
                  Choose Enterprise
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-24 px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full inline-block mb-4">
              Client Reviews
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
              Loved by PR teams worldwide
            </h2>
            <p className="text-white/60 text-xs md:text-sm font-semibold max-w-xl mx-auto leading-relaxed mt-4">
              The ultimate media intelligence platform built to monitor keyword exposure, analyze article sentiment index, and calculate share of voice in real time.
            </p>
          </div>

          {/* Lower Small boxes for Testimonials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all">
              <p className="text-white/80 text-xs leading-relaxed italic font-semibold">
                "Cerebro has completely revolutionized our media telemetry workflows. We track our share of voice instantly."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 bg-indigo-500/20 rounded-full flex items-center justify-center text-xs font-black uppercase border border-indigo-500/20">JS</div>
                <div>
                  <h4 className="text-xs font-black">Jane Smith</h4>
                  <span className="text-[10px] text-white/50">Director of PR, Maverick Labs</span>
                </div>
              </div>
            </div>
            {/* Testimonial 2 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all">
              <p className="text-white/80 text-xs leading-relaxed italic font-semibold">
                "The real-time sentiment analytics are incredibly accurate. We can easily identify and address public relation risks."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 bg-cyan-500/20 rounded-full flex items-center justify-center text-xs font-black uppercase border border-cyan-500/20">MS</div>
                <div>
                  <h4 className="text-xs font-black">Manvi Singh</h4>
                  <span className="text-[10px] text-white/50">Head of Communication, Mavericks India</span>
                </div>
              </div>
            </div>
            {/* Testimonial 3 */}
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all">
              <p className="text-white/80 text-xs leading-relaxed italic font-semibold">
                "Simple setup, powerful dashboard, and automated alerts. It has everything we need to succeed."
              </p>
              <div className="flex items-center gap-3 mt-6">
                <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center text-xs font-black uppercase border border-purple-500/20">MD</div>
                <div>
                  <h4 className="text-xs font-black">Marcus Davies</h4>
                  <span className="text-[10px] text-white/50">VP Operations, TechNexus</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Footer CTA */}
        <footer className="py-20 px-6 max-w-5xl mx-auto">
          {/* Card: top is solid indigo gradient, bottom melts into #030712 */}
          <div
            className="rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden"
            style={{
              background: 'linear-gradient(to bottom, #4338ca 0%, #3730a3 40%, #1e1b4b 70%, #030712 100%)',
            }}
          >
            {/* Inner radial highlight */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_70%_50%_at_50%_20%,_rgba(255,255,255,0.08)_0%,_transparent_70%)] pointer-events-none" />
            <h2 className="relative text-3xl md:text-5xl font-black tracking-tight mb-4 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Ready to transform your PR flow?
            </h2>
            <p className="relative text-white/75 text-xs md:text-sm font-semibold max-w-lg mx-auto leading-relaxed mb-8">
              The ultimate media intelligence platform built to monitor keyword exposure, analyze article sentiment index, and calculate share of voice in real time.
            </p>
            <div className="relative flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => setView('signup')}
                className="bg-indigo-500 hover:bg-indigo-400 text-white font-black py-4 px-8 rounded-2xl transition-all shadow-lg active:scale-95 text-xs uppercase tracking-wider"
              >
                Start free trial
              </button>
              <button
                onClick={() => setView('login')}
                className="bg-white hover:bg-white/90 text-gray-900 font-black py-4 px-8 rounded-2xl transition-all text-xs uppercase tracking-wider"
              >
                Contact Sales
              </button>
            </div>
          </div>
          <div className="text-center text-xs text-white/25 mt-10 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} Cerebro. All rights reserved.
          </div>
        </footer>
      </div>
    );
  }

  if (view === 'landing') {
    return (
      <div className={`fixed inset-0 flex font-body transition-colors duration-500 ${darkMode ? 'dark bg-[#0B121F]' : 'bg-[#F8FAFC]'}`}>
        {!showPets && (
          <style>{`.webmeji-container { display: none !important; }`}</style>
        )}
        <div className="print-watermark">CEREBRO</div>

        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-24' : 'w-72'} ${darkMode ? 'bg-[#060B13] border-white/5' : 'bg-[#F8FAFC] border-slate-200/60'} flex flex-col z-40 h-full transition-all duration-500 ease-in-out relative group border-r border-slate-200/60 dark:border-white/5`}>
          {/* Collapse Toggle Button */}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`absolute -right-4 top-10 w-8 h-8 rounded-full flex items-center justify-center border transition-all z-50 hover:scale-110 shadow-xl ${
              darkMode
                ? 'bg-[#060B13] border-white/10 text-white hover:bg-indigo-600 hover:border-indigo-500'
                : 'bg-white border-slate-200 text-[#060B13] hover:bg-indigo-600 hover:text-white'
            }`}
          >
            {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>

          {/* Sidebar Logo Header */}
          <div className={`p-6 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-start'} border-b ${darkMode ? 'border-white/5' : 'border-slate-200/60'}`}>
            <CerebroBrandLogo collapsed={sidebarCollapsed} darkMode={darkMode} />
          </div>

          <div className="flex-1 py-6 overflow-y-auto px-4 space-y-8 custom-scrollbar">
            <div>
              {!sidebarCollapsed && (
                <label className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 block animate-in fade-in duration-500 font-heading">Intelligence Core</label>
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
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold transition-all relative group/btn font-heading ${activeTab === item.id
                      ? (darkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100')
                      : (darkMode ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-slate-655 hover:bg-indigo-50 hover:text-indigo-600')
                      }`}
                  >
                    <item.icon size={20} className={sidebarCollapsed ? 'shrink-0' : ''} />
                    {!sidebarCollapsed && <span className="animate-in slide-in-from-left-2 duration-300 font-heading">{item.label}</span>}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-xl font-heading">
                        {item.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div>
              {!sidebarCollapsed && (
                <label className="px-4 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4 block animate-in fade-in duration-500 font-heading">Preferences</label>
              )}
              <div className="space-y-1">
                {[
                  { id: 'settings', label: 'Settings', icon: Settings },
                  { id: 'help', label: 'Help & Support', icon: HelpCircle },
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold transition-all relative group/btn font-heading ${activeTab === item.id
                      ? (darkMode ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/50' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100')
                      : (darkMode ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-slate-650 hover:bg-indigo-50 hover:text-indigo-600')
                      }`}
                  >
                    <item.icon size={20} className={sidebarCollapsed ? 'shrink-0' : ''} />
                    {!sidebarCollapsed && <span className="animate-in slide-in-from-left-2 duration-300 font-heading">{item.label}</span>}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 pointer-events-none group-hover/btn:opacity-100 transition-opacity whitespace-nowrap z-[100] shadow-xl font-heading">
                        {item.label}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={`p-4 border-t ${darkMode ? 'border-white/5' : 'border-slate-200/60'}`}>
            <button
              onClick={() => {
                localStorage.removeItem('cerebro_user');
                setUser(null);
                setUserAdminKey('');
                setAdminKeyInput('');
                setAuthRole('employee');
                setView('login');
              }}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3 px-4'} py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all group/logout font-heading`}>
              <LogOut size={20} />
              {!sidebarCollapsed && <span>Sign Out</span>}
            </button>
          </div>
        </aside>

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Navbar */}
          <nav className={`h-16 border-b flex items-center justify-between px-6 z-30 shadow-sm transition-colors duration-500 ${darkMode ? 'bg-[#060B13] border-white/5' : 'bg-white border-slate-200/60'}`}>
            {/* Left side empty (no logo/title in navbar as sidebar is full height) */}
            <div></div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 transition-all rounded-xl ${darkMode ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-655 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button className={`p-2 transition-colors relative ${darkMode ? 'text-white/70 hover:text-white' : 'text-slate-655 hover:text-slate-900'}`}>
                <Bell size={20} />
                <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 ${darkMode ? 'bg-[#ffb703] border-[#0B121F]' : 'bg-[#ffb703] border-white'}`}></span>
              </button>
              <div className={`h-8 w-px mx-1 ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

              <button
                onClick={handleOpenCleoChat}
                className={`flex items-center gap-3 pl-2.5 pr-2 py-1.5 rounded-full text-xs font-bold transition-all border shadow-sm hover:scale-[1.01] ${
                  darkMode
                    ? (showCleoAi 
                        ? 'bg-indigo-650/20 border-indigo-500/40 text-white' 
                        : 'bg-white/5 border-white/10 text-slate-200 hover:text-white hover:border-white/20')
                    : (showCleoAi
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')
                }`}
                title="Toggle Cleo AI"
              >
                <div className="flex items-center gap-1.5">
                  <div className="relative w-5 h-5 rounded-full overflow-hidden border border-indigo-500/20 shadow-inner bg-slate-950/20 flex items-center justify-center shrink-0">
                    <img
                      src="/cleo_avatar.png"
                      alt="Cleo Mascot"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'inline';
                      }}
                    />
                    <span style={{ display: 'none' }} className="text-sm">🐶</span>
                  </div>
                  <span className="font-heading">Cleo AI</span>
                </div>
                
                {/* Embedded Toggle Slider */}
                <div
                  className={`w-8 h-5 rounded-full transition-colors duration-300 flex items-center p-0.5 shrink-0 ${
                    showCleoAi
                      ? 'bg-indigo-600'
                      : (darkMode ? 'bg-white/20' : 'bg-slate-200')
                  }`}
                >
                  <div
                    className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 shrink-0 ${
                      showCleoAi ? 'translate-x-3' : 'translate-x-0'
                    }`}
                  />
                </div>
              </button>

              <div className={`h-8 w-px mx-1 ${darkMode ? 'bg-white/10' : 'bg-slate-200'}`}></div>

              <div className="flex items-center gap-3">
                <div className="text-right hidden md:block">
                  <p className={`text-xs font-black leading-tight font-heading ${darkMode ? 'text-white' : 'text-slate-900'}`}>{user?.name || 'Manvi'}</p>
                  <p className={`text-[10px] font-bold uppercase tracking-widest font-heading ${darkMode ? 'text-white/40' : 'text-slate-500'}`}>
                    {user?.role === 'admin' ? 'Admin Access' : user?.role === 'employee' ? 'Maverick Access' : 'Individual Access'}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg font-heading ${darkMode ? 'bg-indigo-600 shadow-indigo-950/50' : 'bg-indigo-600 shadow-indigo-100'}`}>
                  {(user?.name || 'M')[0]}
                </div>
              </div>
            </div>
          </nav>

          {/* Main Content Area */}
          <main className="flex-1 overflow-hidden flex flex-col relative">
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header with Create Report Button for Report Analysis */}
              {activeTab !== 'competitor-analysis' && activeTab !== 'dashboard' && (
                <div className={`px-8 pt-8 flex items-center justify-between ${activeTab === 'report-analysis' ? 'mb-4' : 'mb-10'}`}>
                  <div className="flex items-center gap-6">
                    {activeTab === 'report-analysis' || activeTab === 'brand-tracker' ? (
                      activeTab === 'brand-tracker' && selectedBrandForDetail ? null : (
                        <button
                          onClick={() => activeTab === 'brand-tracker' ? setShowAddBrandModal(true) : setShowCreateReportModal(true)}
                          className="group flex items-center bg-white border border-slate-200 p-2 rounded-full hover:border-indigo-600 hover:bg-indigo-50 transition-all duration-500 ease-in-out shadow-sm overflow-hidden whitespace-nowrap max-w-[56px] hover:max-w-[200px] z-50"
                        >
                          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:rotate-180 transition-transform duration-700 ease-in-out shrink-0">
                            <Plus size={24} />
                          </div>
                          <span className="ml-3 pr-4 text-sm font-black text-black opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            {activeTab === 'report-analysis' ? 'Create Report' : 'Add Brand'}
                          </span>
                        </button>
                      )
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
                  {activeTab !== 'report-analysis' && activeTab !== 'brand-tracker' && activeTab !== 'keyword-search' && (
                    <div className="flex gap-3">
                      {activeTab !== 'article-reach' && (
                        <button className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black hover:bg-slate-50 transition-all shadow-sm">Export Data</button>
                      )}
                      <button
                        onClick={activeTab === 'article-reach' ? handleArticleReachRefresh : undefined}
                        disabled={activeTab === 'article-reach' && isRefreshingReach}
                        className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"
                      >
                        {activeTab === 'article-reach' && isRefreshingReach && (
                          <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        )}
                        {activeTab === 'article-reach' ? (isRefreshingReach ? 'Refreshing...' : 'Refresh') : 'Refresh Core'}
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Main Page Content */}
              <div className={`flex-1 min-h-0 p-8 custom-scrollbar overflow-y-auto ${activeTab === 'competitor-analysis' ? 'pt-6' : 'pt-0'}`}>
                {activeTab === 'dashboard' ? (
                  <div className="flex flex-col space-y-10 animate-in fade-in duration-700 w-full h-full pb-8 relative px-6 md:px-12">
                    {showPets && (
                      <div id="pets-playground" className="absolute inset-0 overflow-hidden pointer-events-none z-30">
                        {/* Mascots will roam freely in the entire dashboard tab main area */}
                      </div>
                    )}
                    {/* Welcome Section */}
                    <div className="relative w-full mb-10 pt-4 flex flex-col items-center text-center">
                      {/* Top Right Actions: Keep only Refresh Core */}
                      <div className="absolute right-0 top-0 mt-2">
                        <button className="px-5 py-2.5 bg-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 font-heading">
                          Refresh Core
                        </button>
                      </div>

                      <div className="space-y-4 max-w-3xl mt-12 md:mt-8">
                        <h1 className="text-5xl md:text-6xl font-light tracking-tight text-slate-800 dark:text-white font-heading">
                          Hi <span className={darkMode ? 'text-[#00F2FE]' : 'text-indigo-650'}>{user?.name || 'Manvi'}</span>
                        </h1>
                        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white font-heading">
                          what would you like to do today?
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed max-w-xl mx-auto">
                          Monitor your brand exposure, analyze sentiment patterns, and generate high-fidelity reports instantly.
                        </p>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                      {[
                        {
                          title: 'Total Keyword Tracked',
                          subtitle: 'Across all sector monitors',
                          value: calculateTotalKeywordsAnalyzed(),
                          video: '/search.mp4',
                          action: () => setActiveTab('keyword-search')
                        },
                        {
                          title: 'Total Reports Created',
                          subtitle: 'Sovereign-grade executive briefs',
                          value: reports.length,
                          video: '/report.mp4',
                          action: () => setActiveTab('report-analysis')
                        },
                        {
                          title: 'Active Brands Monitoring',
                          subtitle: 'Real-time media feeds tracked',
                          value: trackedBrands.length,
                          video: '/tracker.mp4',
                          action: () => setActiveTab('brand-tracker')
                        }
                      ].map((card, idx) => (
                        <button
                          key={idx}
                          onClick={card.action}
                          className={`p-6 rounded-[2rem] border transition-all text-left flex flex-col justify-between hover:scale-[1.02] duration-300 shadow-xl min-h-[220px] ${
                            darkMode
                              ? 'bg-[#0e2238] border-white/5 hover:border-indigo-500/30 shadow-black/30'
                              : 'bg-white border-slate-200 hover:border-indigo-600/30 shadow-slate-100'
                          }`}
                        >
                          <div className="flex items-center gap-4 w-full">
                            <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-slate-950/20 flex items-center justify-center border border-white/10">
                              <video
                                src={card.video}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <h3 className={`text-base font-black leading-snug font-heading ${darkMode ? 'text-[#00F2FE]' : 'text-indigo-650'}`}>
                                {card.title}
                              </h3>
                              <p className={`text-[10.5px] font-bold mt-0.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {card.subtitle}
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-8 flex justify-center w-full">
                            <span className={`text-6xl font-black tracking-tight font-heading ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              {card.value}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Cleo AI Section */}
                    {showCleoAi && (
                      <div id="cleo-chat-widget" className={`p-8 rounded-[2rem] border transition-all duration-500 shadow-2xl flex flex-col animate-in fade-in slide-in-from-bottom-8 zoom-in-98 duration-500 ${
                        darkMode
                          ? 'bg-[#0e2238] border-white/5 shadow-black/30'
                          : 'bg-white border-slate-250/50 shadow-slate-100'
                      }`}>
                        {/* Header */}
                        <div className={`flex items-center justify-between pb-5 border-b ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-indigo-500/20 bg-slate-950/20 flex items-center justify-center shadow-md">
                              <img
                                src="/cleo_avatar.png"
                                alt="Cleo Mascot"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'inline';
                                }}
                              />
                              <span style={{ display: 'none' }} className="text-2xl">🐶</span>
                            </div>
                            <div>
                              <h3 className={`text-base font-black tracking-tight font-heading ${darkMode ? 'text-white' : 'text-slate-900'}`}>Cleo AI</h3>
                              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mt-0.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                Autonomous PR Agent Online
                              </p>
                            </div>
                          </div>
                          
                          {/* Clear Chat Button */}
                          <button
                            type="button"
                            onClick={() => setCleoMessages([{ sender: 'cleo', text: 'Conversation cleared. How can I assist you now?' }])}
                            className={`p-2.5 rounded-xl transition-all ${
                              darkMode ? 'hover:bg-white/10 text-slate-400 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                            }`}
                            title="Clear conversation"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        {/* Chat Body */}
                        <div 
                          id="cleo-messages-container" 
                          className="py-5 space-y-5 max-h-[350px] min-h-[180px] overflow-y-auto custom-scrollbar flex flex-col pr-1"
                        >
                          {cleoMessages.map((msg, i) => (
                            <div
                              key={i}
                              className={`flex gap-3 max-w-[80%] items-end ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                            >
                              {msg.sender === 'cleo' && (
                                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-indigo-500/10 bg-slate-950/10 flex items-center justify-center shadow-inner">
                                  <img
                                    src="/cleo_avatar.png"
                                    alt="Cleo"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'inline';
                                    }}
                                  />
                                  <span style={{ display: 'none' }} className="text-xs">🐶</span>
                                </div>
                              )}
                              <div
                                className={`rounded-2xl p-4 text-xs font-semibold leading-relaxed animate-in fade-in duration-300 shadow-sm ${
                                  msg.sender === 'user'
                                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none shadow-indigo-600/10'
                                    : (darkMode 
                                        ? 'bg-[#1b314f] text-white rounded-tl-none border border-white/5 shadow-inner' 
                                        : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-200/50')
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSendCleoMessage} className={`flex gap-3 pt-5 border-t ${darkMode ? 'border-white/10' : 'border-slate-200'}`}>
                          <div className="relative flex-1 flex items-center">
                            <Sparkles size={14} className={`absolute left-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
                            <input
                              id="cleo-chat-input"
                              type="text"
                              placeholder="Ask Cleo: e.g. how do I create a report?"
                              value={cleoInput}
                              onChange={(e) => setCleoInput(e.target.value)}
                              className={`w-full py-4 pl-10 pr-5 rounded-2xl text-xs font-bold outline-none transition-all ${
                                darkMode
                                  ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:bg-white/10 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50'
                                  : 'bg-slate-50 border border-slate-200 text-slate-950 placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                              }`}
                            />
                          </div>
                          <button
                            type="submit"
                            className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center justify-center font-heading"
                          >
                            Send
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'article-reach' ? (
                  <div className={`flex flex-col ${sidebarCollapsed ? 'max-w-[1850px]' : 'max-w-[1700px]'} mx-auto w-full animate-in fade-in duration-700 pr-2 transition-all duration-500`}>
                    {!isScanningReach ? (
                      <div className="space-y-8">
                        {/* Top layout with Header */}
                        <div className="flex flex-col pt-4">
                          <div className="text-center max-w-2xl mx-auto mb-12">
                            <h1 className={`text-5xl tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              <span className="font-light">Article</span> <span className="font-black">Reach</span>
                            </h1>
                            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                              Monitor your brand exposure, analyze sentiment patterns, and generate high-fidelity reports instantly.
                            </p>
                          </div>
                        </div>

                        {/* Interactive Expanding Panels */}
                        <div className="flex flex-col md:flex-row gap-8 items-stretch w-full min-h-[340px]">
                          {/* Panel 1: Single URL Reach Check */}
                          <div 
                            onClick={() => setActiveReachPanel(activeReachPanel === 'single' ? 'none' : 'single')}
                            style={{
                              flexGrow: activeReachPanel === 'single' ? 3 : (activeReachPanel === 'bulk' ? 1 : 2),
                              transition: 'flex-grow 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            className={`relative border rounded-[3rem] p-10 flex flex-col justify-between cursor-pointer transition-all duration-500 ${
                              activeReachPanel === 'single'
                                ? darkMode
                                  ? 'bg-[#151f32] border-indigo-500/30 shadow-2xl shadow-indigo-500/5 text-white'
                                  : 'bg-white border-indigo-200 shadow-2xl shadow-indigo-100 text-slate-900'
                                : activeReachPanel === 'bulk'
                                  ? darkMode
                                    ? 'bg-[#0d1527] border-white/5 text-slate-400 hover:bg-[#111a2f] hover:border-white/10 justify-center items-center text-center'
                                    : 'bg-slate-50 border-slate-200/50 text-slate-500 hover:bg-slate-100/70 hover:border-slate-300 justify-center items-center text-center'
                                  : darkMode
                                    ? 'bg-[#151f32]/60 border-white/5 shadow-md text-white hover:border-indigo-500/30 hover:shadow-lg'
                                    : 'bg-white border-slate-200/60 shadow-md text-slate-900 hover:border-indigo-300 hover:shadow-lg'
                            }`}
                          >
                            {activeReachPanel === 'bulk' ? (
                              <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                                  <Globe size={24} />
                                </div>
                                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Single Scan</h3>
                                <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Click to Expand</p>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm shrink-0">
                                    <Globe size={26} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Single URL Check</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Analyze reach for a single article link</p>
                                  </div>
                                </div>

                                <div className="flex flex-col gap-4 mt-auto">
                                  <div className="relative w-full" onClick={(e) => e.stopPropagation()}>
                                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                      type="text"
                                      placeholder="Paste article URL here..."
                                      className={`w-full py-4 pl-12 pr-6 ${
                                        darkMode 
                                          ? 'bg-slate-950/40 border border-white/5 text-white' 
                                          : 'bg-slate-50 border border-slate-200/60 text-slate-900'
                                      } rounded-2xl text-xs font-bold outline-none transition-all focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600`}
                                      value={reachUrl}
                                      onChange={(e) => setReachUrl(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="flex items-center justify-between gap-4 mt-2" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Engine:</span>
                                      <select
                                        value={reachVersion}
                                        onChange={(e) => setReachVersion(e.target.value)}
                                        className={`py-2 px-3 ${
                                          darkMode ? 'bg-slate-900 border-white/10 text-slate-300' : 'bg-slate-50 border border-slate-200 text-slate-600'
                                        } rounded-xl text-[9px] font-black uppercase tracking-wider outline-none focus:border-indigo-600 cursor-pointer`}
                                      >
                                        <option value="v9">v9.0 Sovereign</option>
                                        <option value="v8">v8.0 Oracle</option>
                                        <option value="v7">v7.0 Truth</option>
                                        <option value="v6">v6.0 Integrated</option>
                                        <option value="v5">v5.0 Agentic</option>
                                      </select>
                                    </div>

                                    <button
                                      onClick={handleReachScan}
                                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                                    >
                                      <Zap size={14} /> Check Reach
                                    </button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Panel 2: Bulk Excel Reach Check */}
                          <div 
                            onClick={() => setActiveReachPanel(activeReachPanel === 'bulk' ? 'none' : 'bulk')}
                            style={{
                              flexGrow: activeReachPanel === 'bulk' ? 3 : (activeReachPanel === 'single' ? 1 : 2),
                              transition: 'flex-grow 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                            className={`relative border rounded-[3rem] p-10 flex flex-col justify-between cursor-pointer transition-all duration-500 ${
                              activeReachPanel === 'bulk'
                                ? darkMode
                                  ? 'bg-[#151f32] border-indigo-500/30 shadow-2xl shadow-indigo-500/5 text-white'
                                  : 'bg-white border-indigo-200 shadow-2xl shadow-indigo-100 text-slate-900'
                                : activeReachPanel === 'single'
                                  ? darkMode
                                    ? 'bg-[#0d1527] border-white/5 text-slate-400 hover:bg-[#111a2f] hover:border-white/10 justify-center items-center text-center'
                                    : 'bg-slate-50 border-slate-200/50 text-slate-500 hover:bg-slate-100/70 hover:border-slate-300 justify-center items-center text-center'
                                  : darkMode
                                    ? 'bg-[#151f32]/60 border-white/5 shadow-md text-white hover:border-indigo-500/30 hover:shadow-lg'
                                    : 'bg-white border-slate-200/60 shadow-md text-slate-900 hover:border-indigo-300 hover:shadow-lg'
                            }`}
                          >
                            {activeReachPanel === 'single' ? (
                              <div className="flex flex-col items-center justify-center text-center space-y-3">
                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                                  <FileText size={24} />
                                </div>
                                <h3 className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Batch Scan</h3>
                                <p className="text-[9px] font-black text-slate-400 tracking-widest uppercase">Click to Expand</p>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-4 mb-6">
                                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-sm shrink-0">
                                    <FileText size={26} />
                                  </div>
                                  <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Batch Analysis</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Process multiple article links in bulk via Excel</p>
                                  </div>
                                </div>

                                <div className="flex-1 flex flex-col justify-end mt-auto relative" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="file"
                                    accept=".xlsx, .xls"
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                    onChange={handleExcelUpload}
                                  />
                                  <div className="border-2 border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center group hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:bg-indigo-50/20 dark:hover:bg-indigo-950/10 transition-all cursor-pointer">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-900 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white dark:group-hover:text-white transition-all duration-300">
                                      <FileText size={20} className="text-slate-400 group-hover:text-white" />
                                    </div>
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Upload Excel Document</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Accepts .xlsx, .xls formats</span>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : reachScanning && reachMode === 'single' && !reachResult ? (
                      /* Clean Glassmorphic Loader Screen */
                      <div className="w-full max-w-md mx-auto py-20 px-8 bg-white/40 backdrop-blur-md border border-slate-100 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-500">
                        <div className="relative w-16 h-16">
                          <div className="absolute inset-0 rounded-full border-4 border-indigo-100"></div>
                          <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 border-r-indigo-600 animate-spin"></div>
                          <div className="absolute inset-2 rounded-full border-2 border-indigo-50/20 bg-indigo-500/10 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-indigo-600 animate-pulse" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h3 className="text-xl font-black text-slate-800 tracking-tight">Analyzing Article Impact</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Running reach estimation models...</p>
                        </div>
                        <div className="w-48 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-600 transition-all duration-300 ease-out rounded-full"
                            style={{ width: `${Math.min(100, Math.max(10, ((24 - reachTimer) / 24) * 100))}%` }}
                          ></div>
                        </div>
                        <p className="text-xs font-medium text-slate-500">
                          Querying global traffic metrics, extracting domain weights, and computing sentiment profiles.
                        </p>
                      </div>
                    ) : reachError ? (
                      /* Error View */
                      <div className="w-full max-w-2xl mx-auto py-12 px-8 bg-red-50 border border-red-100 rounded-[2.5rem] text-center space-y-6">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mx-auto">
                          <AlertTriangle size={32} />
                        </div>
                        <div>
                          <h3 className="text-xl font-black text-red-900">Analysis Interrupted</h3>
                          <p className="text-sm font-bold text-red-700/80 mt-2">{reachError}</p>
                        </div>
                        <button
                          onClick={() => setIsScanningReach(false)}
                          className="px-6 py-3 bg-white border border-red-200 hover:bg-red-100/50 text-red-700 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Go Back
                        </button>
                      </div>
                    ) : reachMode === 'single' && reachResult ? (
                      /* Minimalist Single URL Result View */
                      <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/40 backdrop-blur-md border border-slate-100 rounded-3xl p-6 shadow-sm">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">Article Headline</h3>
                            <p className="text-base font-extrabold text-slate-800 line-clamp-2 leading-snug" title={reachResult.title || reachResult.url}>
                              {reachResult.title || reachResult.url}
                            </p>
                          </div>
                          <button
                            onClick={() => setIsScanningReach(false)}
                            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md shrink-0 self-start sm:self-center"
                          >
                            New Scan
                          </button>
                        </div>

                        {/* Two Columns Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          {/* Card 1: Estimated Reach */}
                          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-lg flex flex-col justify-between min-h-[240px] relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.01]">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50/50 rounded-full blur-2xl -mr-20 -mt-20"></div>
                            <div className="relative z-10 flex items-center justify-between mb-4">
                              <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Estimated Reach</span>
                              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                <Globe size={20} />
                              </div>
                            </div>
                            <div className="relative z-10 flex flex-col justify-end mt-auto">
                              <span className="text-5xl font-black text-indigo-600 tracking-tighter leading-none">
                                {reachResult.estimatedReach?.toLocaleString() || '0'}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3">
                                Deduplicated Audience Matrix
                              </span>
                            </div>
                          </div>

                          {/* Card 2: Sentiment */}
                          {(() => {
                            const score = reachResult.sentimentScore;
                            let label = 'Neutral';
                            let bgColor = 'bg-slate-50';
                            let borderColor = 'border-slate-100';
                            let textColor = 'text-slate-600';
                            let indicatorBg = 'bg-slate-100';
                            let indicatorText = 'text-slate-400';
                            let desc = 'The article maintains an objective and neutral stance.';

                            if (score > 1.0) {
                              label = 'Positive';
                              bgColor = 'bg-emerald-50/50';
                              borderColor = 'border-emerald-100';
                              textColor = 'text-emerald-700';
                              indicatorBg = 'bg-emerald-100';
                              indicatorText = 'text-emerald-600';
                              desc = 'Highly favorable coverage with positive tone metrics.';
                            } else if (score < -1.0) {
                              label = 'Controversial';
                              bgColor = 'bg-rose-50/50';
                              borderColor = 'border-rose-100';
                              textColor = 'text-rose-700';
                              indicatorBg = 'bg-rose-100';
                              indicatorText = 'text-rose-600';
                              desc = 'Critical or high-conflict framing with negative polarity.';
                            }

                            return (
                              <div className={`border ${borderColor} ${bgColor} rounded-[2.5rem] p-10 shadow-lg flex flex-col justify-between min-h-[240px] relative overflow-hidden transition-all hover:shadow-xl hover:scale-[1.01]`}>
                                <div className="relative z-10 flex items-center justify-between mb-4">
                                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Sentiment Profile</span>
                                  <div className={`w-10 h-10 ${indicatorBg} rounded-xl flex items-center justify-center ${indicatorText}`}>
                                    <Activity size={20} />
                                  </div>
                                </div>
                                <div className="relative z-10 flex flex-col justify-end mt-auto">
                                  <span className={`text-5xl font-black ${textColor} tracking-tighter leading-none`}>
                                    {label}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-3">
                                    {desc}
                                  </span>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    ) : (
                      /* Excel Batch Result View */
                      <div className="h-full flex flex-col space-y-8 animate-in slide-in-from-bottom-8 duration-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Batch Reach Analysis</h2>
                            <p className="text-slate-400 text-sm font-bold mt-1">Processed {excelFile?.name || 'spreadsheet'} • Version: {reachVersion}</p>
                          </div>
                          <div className="flex gap-4">
                            <button onClick={() => setIsScanningReach(false)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all">Back</button>
                            {reachBatchJob?.status === 'completed' && (
                              <button
                                onClick={() => window.open(`http://localhost:3001/api/download-result/${reachBatchJob.id}`, '_blank')}
                                className="px-6 py-3 bg-[#219ebc] hover:bg-[#023047] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg flex items-center gap-2"
                              >
                                <Download size={14} />
                                Download Report
                              </button>
                            )}
                          </div>
                        </div>

                        {reachBatchJob && (
                          <div className="w-full bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-2xl ${reachBatchJob.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                  <FileText size={20} />
                                </div>
                                <div>
                                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Batch Job: {reachBatchJob.id.slice(0, 8)}</p>
                                  <p className="text-sm font-black text-slate-900 capitalize">Status: {reachBatchJob.status}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                {reachBatchJob.processed_urls} / {reachBatchJob.total_urls} URLs Processed
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 transition-all duration-500"
                                style={{ width: `${reachBatchJob.total_urls > 0 ? (reachBatchJob.processed_urls / reachBatchJob.total_urls) * 100 : 0}%` }}
                              />
                            </div>
                            {reachBatchJob.status === 'processing' && (
                              <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest animate-pulse">Scraping URLs and computing reach in background. Please wait...</p>
                            )}
                          </div>
                        )}

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
                                {reachBatchJob?.results && reachBatchJob.results.length > 0 ? (
                                  reachBatchJob.results.map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                                      <td className="px-8 py-5 text-xs font-black text-slate-400">{row.id}</td>
                                      <td className="px-8 py-5 text-sm font-bold text-slate-900 max-w-xs truncate">
                                        <a
                                          href={row.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="hover:underline hover:text-indigo-600 transition-colors inline-flex items-center gap-1.5"
                                          title={row.url}
                                        >
                                          {row.url}
                                          <Globe size={12} className="text-slate-400 shrink-0" />
                                        </a>
                                      </td>
                                      <td className="px-8 py-5">
                                        {row.status === 'Pending' ? (
                                          <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-400">Pending</span>
                                        ) : (
                                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${row.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
                                            row.sentiment === 'Negative' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                            }`}>{row.sentiment}</span>
                                        )}
                                      </td>
                                      <td className="px-8 py-5 text-sm font-black text-slate-700">
                                        {row.status === 'Pending' ? '-' : (typeof row.mentions === 'number' ? row.mentions.toLocaleString() : row.mentions)}
                                      </td>
                                      <td className="px-8 py-5 text-sm font-black text-[#219ebc] bg-[#219ebc]/[0.02] group-hover:bg-[#219ebc]/5 transition-all">
                                        {row.status === 'Pending' ? (
                                          <span className="text-slate-400 font-mono italic text-[10px] animate-pulse">Calculating...</span>
                                        ) : (
                                          typeof row.reach === 'number' ? row.reach.toLocaleString() : row.reach
                                        )}
                                      </td>
                                      <td className="px-8 py-5 text-right">
                                        {row.status === 'Pending' ? (
                                          <div className="flex items-center justify-end gap-2 text-slate-400">
                                            <div className="w-2 h-2 rounded-full bg-slate-400 animate-ping"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Pending</span>
                                          </div>
                                        ) : row.status === 'Failed' ? (
                                          <div className="flex items-center justify-end gap-2 text-red-500">
                                            <X size={14} className="text-red-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Failed</span>
                                          </div>
                                        ) : (
                                          <div className="flex items-center justify-end gap-2 text-emerald-500">
                                            <CheckCircle2 size={14} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Verified</span>
                                          </div>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="6" className="px-8 py-12 text-center text-slate-400 text-sm font-bold">
                                      No URLs analyzed yet. Please upload a spreadsheet to start batch analysis.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'keyword-search' ? (
                  <div className={`h-full flex flex-col items-center justify-start ${sidebarCollapsed ? 'max-w-[1850px]' : 'max-w-[1700px]'} mx-auto w-full transition-all duration-500`}>
                    
                    {/* Welcome Header */}
                    <div className="text-center py-10 space-y-4 max-w-2xl mx-auto animate-in fade-in duration-700">
                      <h1 className={`text-5xl md:text-6xl font-light tracking-tight font-sans ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        Welcome back <span className={`font-black ${darkMode ? 'text-white' : 'text-slate-950'}`}>{(user?.name || 'Manvi').trim().split(' ')[0]}</span>
                      </h1>
                    </div>

                    {/* Inputs Card */}
                    <div className={`w-full ${darkMode ? 'bg-[#0f172a]/40 border-white/5' : 'bg-white border-slate-200'} backdrop-blur-xl border rounded-[2.5rem] p-10 shadow-2xl mb-10 mt-4 print:hidden`}>
                      <div className="w-full flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
                        <div className="flex flex-wrap items-center gap-6">
                          <div className="flex items-center gap-3">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              Analysis Sector:
                            </span>
                            <select
                              value={analysisSector}
                              onChange={(e) => {
                                const val = e.target.value;
                                setAnalysisSector(val);
                                if (val === 'All') {
                                  setAnalysisScope('sector');
                                } else {
                                  setAnalysisScope('keyword');
                                }
                              }}
                              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none cursor-pointer shadow-md transition-all ${
                                darkMode 
                                  ? 'bg-[#151f32] border border-white/10 text-white hover:bg-[#1a2b47]' 
                                  : 'bg-white border border-slate-200 text-slate-800 hover:bg-slate-50'
                              }`}
                            >
                              <option value="All" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>All Sectors</option>
                              <option value="AI" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>AI</option>
                              <option value="STARTUP" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Startup</option>
                              <option value="CONSULTANCY" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Consultancy</option>
                              <option value="FINANCE" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Finance</option>
                              <option value="TECHNOLOGY" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Technology</option>
                              <option value="HEALTHCARE" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Healthcare</option>
                              <option value="EDUCATION" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Education</option>
                              <option value="ENERGY" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Energy</option>
                              <option value="RETAIL" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Retail</option>
                              <option value="MEDIA" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Media</option>
                              <option value="AUTOMOTIVE" className={darkMode ? 'bg-[#151f32] text-white' : 'bg-white text-slate-800'}>Automotive</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {curatedAnalysisResults && (
                            <button
                              onClick={() => window.print()}
                              className={`flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm`}
                            >
                              <Printer size={14} />
                              Print Report
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setTargetBrandsInput('');
                              setExcludedKeywordsInput('');
                              setCuratedAnalysisResults(null);
                              setIsSearchingKeyword(false);
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 ${darkMode ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'} border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 shadow-sm`}
                          >
                            <RotateCcw size={14} />
                            Reset Inputs
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* 1. Target Keywords */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-indigo-400' : 'text-indigo-600'} flex items-center gap-2 font-heading`}>
                              <Search size={14} /> Target Brands
                            </label>
                            <div className="relative group flex items-center">
                              <HelpCircle size={14} className="text-slate-400 hover:text-indigo-500 cursor-help transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case tracking-normal shadow-xl">
                                Enter the core brands or terms you want to analyze. Mentions of these keywords will be calculated individually, getting their own sentiment analysis and share of voice.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                              </div>
                            </div>
                          </div>
                          <textarea
                            rows={3}
                            placeholder="e.g. Qualcomm, MediaTek, Intel, AMD, Nvidia"
                            className={`w-full py-4 px-6 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'} border rounded-2xl text-xs font-bold outline-none transition-all hover:border-indigo-350 focus:border-indigo-500 shadow-inner resize-none`}
                            value={targetBrandsInput}
                            onChange={(e) => setTargetBrandsInput(e.target.value)}
                          />
                        </div>

                        {/* 2. Excluded Keywords */}
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <label className={`text-[10px] font-black uppercase tracking-[0.2em] ${darkMode ? 'text-red-405' : 'text-red-600'} flex items-center gap-2 font-heading`}>
                              <Minus size={14} /> Excluded Keywords
                            </label>
                            <div className="relative group flex items-center">
                              <HelpCircle size={14} className="text-slate-400 hover:text-red-500 cursor-help transition-colors" />
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-800 text-white text-[10px] font-medium leading-relaxed rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 normal-case tracking-normal shadow-xl">
                                Enter keywords that should disqualify an article. If any of these words are found in the article, the entire article will be ignored for all mention counts.
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                              </div>
                            </div>
                          </div>
                          <textarea
                            rows={3}
                            placeholder="e.g. Exynos, Snapdragon 8 Gen 1 (excluded from analysis)"
                            className={`w-full py-4 px-6 ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'} border rounded-2xl text-xs font-bold outline-none transition-all hover:border-red-350 focus:border-red-500 shadow-inner resize-none`}
                            value={excludedKeywordsInput}
                            onChange={(e) => setExcludedKeywordsInput(e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex justify-center">
                        <button
                          onClick={handleKeywordSearch}
                          disabled={isSearchingKeyword || !targetBrandsInput.trim()}
                          className="px-16 py-4 bg-[#00F2FE] hover:bg-cyan-400 text-slate-950 font-black uppercase tracking-widest text-[11px] rounded-full shadow-lg shadow-cyan-400/20 transition-all active:scale-95 duration-200 disabled:opacity-50 font-heading"
                        >
                          {isSearchingKeyword ? 'Analyzing Corpus...' : 'Analyze Exposure'}
                        </button>
                      </div>
                    </div>

                    {curatedAnalysisResults && (
                      <div className="w-full space-y-10 animate-in fade-in slide-in-from-top-6 duration-1000 pb-20">
                        
                        {/* 1. Mention Counts Summary */}
                        <div>
                          <h3 className={`text-xl font-black uppercase tracking-wider mb-6 flex items-center gap-3 font-heading ${darkMode ? 'text-[#00F2FE]' : 'text-indigo-600'}`}>
                            1. Mention Count Summary
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.entries(curatedAnalysisResults.brands || {}).map(([brand, data], idx) => {
                              const totalBrandArticles = Object.values(curatedAnalysisResults.brands || {}).reduce((sum, b) => sum + b.articles, 0);
                              const baseTotal = analysisScope === 'sector' ? curatedAnalysisResults.totalSectorArticles : totalBrandArticles;
                              const pct = baseTotal > 0 ? ((data.articles / baseTotal) * 100).toFixed(1) : '0.0';
                              const avg = data.articles > 0 ? (data.mentions / data.articles).toFixed(2) : '0.00';
                              const color = BRAND_COLORS[idx % BRAND_COLORS.length];
                              const isSelected = curatedDrillBrand === brand;
                              return (
                                <div
                                  key={brand}
                                  onClick={() => setCuratedDrillBrand(brand)}
                                  className={`group/card relative cursor-pointer ${
                                    darkMode 
                                      ? 'bg-[#0d1527] border-white/5 hover:border-white/10' 
                                      : 'bg-white border-slate-200'
                                  } border rounded-[1.75rem] p-6 shadow-md transition-all hover:scale-[1.02] duration-300 flex flex-col justify-between`}
                                  style={{
                                    borderColor: isSelected ? color : undefined,
                                    boxShadow: isSelected ? `0 10px 30px ${color}25` : undefined
                                  }}
                                >
                                  <div className="flex items-center justify-between">
                                    <span 
                                      className="text-xs font-extrabold uppercase tracking-wider truncate pr-4"
                                      style={{ color }}
                                    >
                                      {brand}
                                    </span>
                                    <span className="text-[8px] font-black uppercase tracking-widest border border-slate-700/50 dark:border-white/10 px-1.5 py-0.5 rounded text-slate-400">
                                      INFO
                                    </span>
                                  </div>

                                  <div className="flex flex-col mt-3">
                                    <div className="flex items-baseline gap-0.5 select-none">
                                      <span 
                                        className="text-[44px] font-black tracking-tight leading-none"
                                        style={{ color }}
                                      >
                                        {pct}
                                      </span>
                                      <span 
                                        className="text-[18px] font-black"
                                        style={{ color }}
                                      >
                                        %
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400/80 mt-1 select-none">
                                      Mention Share
                                    </span>
                                  </div>

                                  <div className="w-full border-t border-slate-200 dark:border-white/10 my-3" />

                                  <div className="text-[9px] font-extrabold text-slate-400 flex items-center gap-1.5 select-none">
                                    <TrendingUp size={11} style={{ color }} />
                                    <span className={`font-black ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{avg}</span>
                                    <span className="text-slate-400/80 font-bold uppercase tracking-wider text-[8px]">Avg mentions/article</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Top Publications & Market Share */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          {/* 2. Top Indian Publications */}
                          <div className={`${darkMode ? 'bg-[#151f32] border-white/5' : 'bg-white border-slate-200/60'} border rounded-[2.5rem] p-8 shadow-md flex flex-col`}>
                            <h3 className={`text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-3 font-heading ${darkMode ? 'text-[#00F2FE]' : 'text-indigo-600'}`}>
                              2. Top Indian Publications
                            </h3>
                            <div className="flex-1 space-y-3 overflow-y-auto max-h-80 custom-scrollbar pr-2">
                              {(() => {
                                const sourceMap = {};
                                Object.entries(curatedAnalysisResults.brands || {}).forEach(([b, d]) => {
                                  Object.entries(d.sources || {}).forEach(([src, count]) => {
                                    if (!sourceMap[src]) sourceMap[src] = { total: 0, brands: {} };
                                    sourceMap[src].total += count;
                                    sourceMap[src].brands[b] = count;
                                  });
                                });
                                const topSources = Object.entries(sourceMap).sort((a, b) => b[1].total - a[1].total).slice(0, 10);
                                if (topSources.length === 0) return <div className="text-center py-12 text-slate-400 font-bold text-xs">No publication data.</div>;

                                return topSources.map(([src, d], index) => (
                                  <div key={src} className={`flex items-center justify-between p-3 rounded-2xl border ${darkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'} transition-all`}>
                                    <div className="flex items-center gap-3 truncate">
                                      <div className={`w-6 h-6 flex items-center justify-center rounded-lg text-[10px] font-sans font-bold ${
                                        darkMode ? 'bg-white/10 text-white' : 'bg-indigo-50 text-indigo-600'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <span className={`text-xs font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{src}</span>
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-xl bg-slate-200/50 dark:bg-white/10 text-slate-500 dark:text-slate-300">
                                      {d.total} mentions
                                    </span>
                                  </div>
                                ));
                              })()}
                            </div>
                          </div>

                          {/* 3. Market Share (Pie Chart) */}
                          <div className={`${darkMode ? 'bg-[#151f32] border-white/5' : 'bg-white border-slate-200/60'} border rounded-[2.5rem] p-8 shadow-md flex flex-col`}>
                            <div className="flex items-center justify-between mb-6">
                              <h3 className={`text-lg font-black uppercase tracking-wider flex items-center gap-3 font-heading ${darkMode ? 'text-[#00F2FE]' : 'text-indigo-600'}`}>
                                3. Market Share
                              </h3>
                              <div className="flex bg-slate-100 dark:bg-slate-750 p-1 rounded-xl">
                                {['Pie Chart', 'Bar Chart'].map((t) => (
                                  <button
                                    key={t}
                                    onClick={() => setCuratedVisualizationType(t)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${
                                      curatedVisualizationType === t 
                                        ? 'bg-white dark:bg-[#151f32] text-indigo-600 dark:text-[#00F2FE] shadow-sm' 
                                        : 'text-slate-400'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-center">
                              {(() => {
                                const entries = Object.entries(curatedAnalysisResults.brands || {});
                                const total = entries.reduce((sum, [, d]) => sum + d.mentions, 0);
                                if (total === 0) return <div className="text-center py-12 text-slate-400 font-bold text-xs">No mentions found for any brand.</div>;

                                if (curatedVisualizationType === 'Bar Chart') {
                                  return (
                                    <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
                                      {/* Left: Bar Chart */}
                                      <div className="flex-1 w-full flex flex-col h-44 justify-center">
                                        {/* Bars area */}
                                        <div className="flex-1 flex items-end justify-around border-b border-slate-200 dark:border-white/10 pb-2 px-4 gap-4">
                                          {entries.map(([brand, data], idx) => {
                                            const pct = ((data.mentions / total) * 100).toFixed(1);
                                            const color = BRAND_COLORS[idx % BRAND_COLORS.length];
                                            const heightPct = Math.max(parseFloat(pct), 4);
                                            return (
                                              <div key={brand} className="flex-1 flex flex-col items-center h-full justify-end group">
                                                <span className="text-[9px] font-black mb-1 transition-transform duration-300 group-hover:scale-110" style={{ color }}>
                                                  {pct}%
                                                </span>
                                                <div 
                                                  className="w-full max-w-[24px] rounded-t-md transition-all duration-700 shadow-sm hover:brightness-110 cursor-pointer"
                                                  style={{ 
                                                    height: `${heightPct}%`, 
                                                    backgroundColor: color 
                                                  }}
                                                />
                                              </div>
                                            );
                                          })}
                                        </div>
                                        {/* Labels area */}
                                        <div className="flex justify-around pt-2 px-4 gap-4">
                                          {entries.map(([brand]) => (
                                            <div key={brand} className="flex-1 text-center truncate">
                                              <span className={`text-[9px] font-black uppercase tracking-wider truncate block ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                                {brand}
                                              </span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Right: Legend list */}
                                      <div className="space-y-3 flex-1 w-full max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {entries.map(([brand, data], idx) => {
                                          const pct = ((data.mentions / total) * 100).toFixed(1);
                                          const color = BRAND_COLORS[idx % BRAND_COLORS.length];
                                          return (
                                            <div key={brand} className="flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2.5 truncate pr-2">
                                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                                                <span className={`font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{brand}</span>
                                              </div>
                                              <span className="font-black flex-shrink-0" style={{ color }}>{pct}%</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                } else {
                                  let cumulativeOffset = 25;
                                  return (
                                    <div className="flex flex-col sm:flex-row items-center gap-8 py-4">
                                      <div className="relative w-40 h-40 flex-shrink-0">
                                        <svg viewBox="-6 -6 44 44" className="w-full h-full transform -rotate-90 overflow-visible">
                                          {(() => {
                                            let cumulativeAngle = -Math.PI / 2;
                                            const isPolarStyle = entries.length <= 4;
                                            return entries.map(([brand, data], idx) => {
                                              if (data.mentions === 0) return null;
                                              const pct = (data.mentions / total) * 100;
                                              const color = BRAND_COLORS[idx % BRAND_COLORS.length];
                                              
                                              const angleLength = (pct / 100) * 2 * Math.PI;
                                              const startAngle = cumulativeAngle;
                                              const endAngle = cumulativeAngle + angleLength;
                                              cumulativeAngle = endAngle;

                                              const midAngle = (startAngle + endAngle) / 2;
                                              const explodeDistance = 0.8;
                                              const dx = Math.cos(midAngle) * explodeDistance;
                                              const dy = Math.sin(midAngle) * explodeDistance;

                                              const rOut = isPolarStyle ? 12 + (pct / 100) * 12 : 22;

                                              if (pct >= 99.9) {
                                                return (
                                                  <circle
                                                    key={brand}
                                                    cx="16"
                                                    cy="16"
                                                    r={rOut}
                                                    fill={color}
                                                    style={{ 
                                                      transform: `translate(${dx}px, ${dy}px)`,
                                                      transition: 'transform 0.3s ease'
                                                    }}
                                                    className="hover:brightness-110 cursor-pointer"
                                                  />
                                                );
                                              }

                                              const x1 = 16 + rOut * Math.cos(startAngle);
                                              const y1 = 16 + rOut * Math.sin(startAngle);
                                              const x2 = 16 + rOut * Math.cos(endAngle);
                                              const y2 = 16 + rOut * Math.sin(endAngle);
                                              const largeArcFlag = pct > 50 ? 1 : 0;

                                              const dPath = `M 16 16 L ${x1} ${y1} A ${rOut} ${rOut} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                                              return (
                                                <path
                                                  key={brand}
                                                  d={dPath}
                                                  fill={color}
                                                  style={{ 
                                                    transform: `translate(${dx}px, ${dy}px)`,
                                                    transition: 'transform 0.3s ease'
                                                  }}
                                                  className="hover:brightness-110 cursor-pointer"
                                                />
                                              );
                                            });
                                          })()}
                                        </svg>
                                      </div>

                                      <div className="space-y-3 flex-1 w-full max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                        {entries.map(([brand, data], idx) => {
                                          const pct = ((data.mentions / total) * 100).toFixed(1);
                                          const color = BRAND_COLORS[idx % BRAND_COLORS.length];
                                          return (
                                            <div key={brand} className="flex items-center justify-between text-xs">
                                              <div className="flex items-center gap-2.5 truncate pr-2">
                                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color }}></div>
                                                <span className={`font-bold truncate ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>{brand}</span>
                                              </div>
                                              <span className="font-black flex-shrink-0" style={{ color }}>{pct}%</span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        </div>

                        {/* Media Source Progress Meters */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                          {/* 4. Media Source Distribution */}
                          <div className={`${darkMode ? 'bg-[#151f32] border-white/5' : 'bg-white border-slate-200/60'} border rounded-[2.5rem] p-8 shadow-md flex flex-col`}>
                            <h3 className={`text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-3 font-heading ${darkMode ? 'text-[#00F2FE]' : 'text-indigo-600'}`}>
                              4. Media Source Distribution
                            </h3>
                            <div className="flex-1 space-y-4 overflow-y-auto max-h-80 custom-scrollbar pr-2">
                              {(() => {
                                const sourceMap = {};
                                Object.entries(curatedAnalysisResults.brands || {}).forEach(([b, d]) => {
                                  Object.entries(d.sources || {}).forEach(([src, count]) => {
                                    if (!sourceMap[src]) sourceMap[src] = { total: 0, brands: {} };
                                    sourceMap[src].total += count;
                                    sourceMap[src].brands[b] = count;
                                  });
                                });
                                const topSources = Object.entries(sourceMap).sort((a, b) => b[1].total - a[1].total).slice(0, 10);
                                if (topSources.length === 0) return <div className="text-center py-12 text-slate-400 font-bold text-xs">No media source data.</div>;

                                const maxTotal = Math.max(...topSources.map(([, d]) => d.total), 1);

                                return topSources.map(([src, d]) => {
                                  const pct = (d.total / maxTotal) * 100;
                                  return (
                                    <div key={src} className="space-y-1.5 group">
                                      <div className="flex justify-between items-center text-xs font-bold">
                                        <span className={`truncate max-w-[70%] ${darkMode ? 'text-slate-200' : 'text-slate-700'} group-hover:text-indigo-400 transition-colors`}>
                                          {src || 'Unknown Source'}
                                        </span>
                                        <span className="text-[#00F2FE] flex-shrink-0 font-extrabold">{d.total} mentions</span>
                                      </div>
                                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden shadow-inner border border-white/5">
                                        <div
                                          style={{ width: `${pct}%` }}
                                          className="h-full bg-gradient-to-r from-indigo-500 to-[#00F2FE] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,242,254,0.3)]"
                                        />
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          {/* 5. Sentiments Landscape matrix */}
                          <div className={`${darkMode ? 'bg-[#151f32] border-white/5' : 'bg-white border-slate-200/60'} border rounded-[2.5rem] p-8 shadow-md flex flex-col`}>
                            <h3 className={`text-lg font-black uppercase tracking-wider mb-6 flex items-center gap-3 font-heading ${darkMode ? 'text-[#00F2FE]' : 'text-indigo-600'}`}>
                              5. Sentiments landscape
                            </h3>
                            <div className="flex-1 space-y-4 overflow-y-auto max-h-80 custom-scrollbar pr-2">
                              
                              {/* Headers */}
                              <div className="grid grid-cols-4 gap-2 text-center text-[9px] font-black uppercase tracking-widest text-slate-400">
                                <div>Brand</div>
                                <div>Positive</div>
                                <div>Neutral</div>
                                <div>Negative</div>
                              </div>

                              {Object.entries(curatedAnalysisResults.brands || {}).map(([b, d]) => {
                                const total = d.sentiment.Positive + d.sentiment.Neutral + d.sentiment.Negative;
                                if (total === 0) return null;
                                const posP = ((d.sentiment.Positive / total) * 100).toFixed(0);
                                const neuP = ((d.sentiment.Neutral / total) * 100).toFixed(0);
                                const negP = ((d.sentiment.Negative / total) * 100).toFixed(0);
                                return (
                                  <div key={b} className="grid grid-cols-4 gap-2 items-center text-center">
                                    <div className={`text-xs font-black truncate text-left ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                      {b}
                                    </div>
                                    <div className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 rounded-xl p-3 flex flex-col items-center">
                                      <span className="text-sm font-black">{posP}%</span>
                                      <span className="text-[8px] font-bold opacity-60">{d.sentiment.Positive}</span>
                                    </div>
                                    <div className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 rounded-xl p-3 flex flex-col items-center">
                                      <span className="text-sm font-black">{neuP}%</span>
                                      <span className="text-[8px] font-bold opacity-60">{d.sentiment.Neutral}</span>
                                    </div>
                                    <div className="bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl p-3 flex flex-col items-center">
                                      <span className="text-sm font-black">{negP}%</span>
                                      <span className="text-[8px] font-bold opacity-60">{d.sentiment.Negative}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* 6. Explore Articles by Sentiment Drill-Down Table */}
                        <div className={`print:hidden ${darkMode ? 'bg-[#151f32] border-white/5' : 'bg-white border-slate-200/60'} border rounded-[2.5rem] p-8 shadow-md`}>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                            <div>
                              <h3 className={`text-lg font-black uppercase tracking-wider flex items-center gap-3 font-heading ${darkMode ? 'text-[#00F2FE]' : 'text-indigo-600'}`}>
                                6. Explore Articles by Sentiments
                              </h3>
                              <p className="text-xs font-bold text-slate-400 mt-1">Select a brand and sentiment to examine underlying corpus articles</p>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                              <select
                                value={curatedDrillBrand}
                                onChange={(e) => setCuratedDrillBrand(e.target.value)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold outline-none border cursor-pointer ${
                                  darkMode ? 'bg-[#0f172a] border-white/10 text-white' : 'bg-slate-50 border-slate-250 text-slate-800'
                                }`}
                              >
                                {Object.keys(curatedAnalysisResults.brands || {}).map((b) => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>

                              <select
                                value={curatedDrillSentiment}
                                onChange={(e) => setCuratedDrillSentiment(e.target.value)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold outline-none border cursor-pointer ${
                                  darkMode ? 'bg-[#0f172a] border-white/10 text-white' : 'bg-slate-50 border-slate-250 text-slate-800'
                                }`}
                              >
                                <option value="Positive">Positive</option>
                                <option value="Neutral">Neutral</option>
                                <option value="Negative">Negative</option>
                              </select>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            {(() => {
                              const articles = curatedAnalysisResults.brands?.[curatedDrillBrand]?.article_samples?.[curatedDrillSentiment] || [];
                              if (articles.length === 0) return <div className="text-center py-12 text-slate-400 font-bold text-xs">No {curatedDrillSentiment} articles found for {curatedDrillBrand}.</div>;

                              return (
                                <table className="w-full text-left border-collapse">
                                  <thead>
                                    <tr className={`border-b ${darkMode ? 'border-white/5 text-slate-400' : 'border-slate-100 text-slate-400'} text-[9px] font-black uppercase tracking-widest`}>
                                      <th className="py-4 px-4">Headline</th>
                                      <th className="py-4 px-4">Publication</th>
                                      <th className="py-4 px-4">Published Date</th>
                                      <th className="py-4 px-4 text-right">Action</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-bold">
                                    {articles.map((art, idx) => (
                                      <tr key={idx} className={`${darkMode ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-700'} transition-colors`}>
                                        <td className="py-4 px-4 font-black max-w-md truncate">{art.title}</td>
                                        <td className="py-4 px-4 text-slate-400">{art.source}</td>
                                        <td className="py-4 px-4 text-slate-400 whitespace-nowrap">{art.published}</td>
                                        <td className="py-4 px-4 text-right">
                                          {art.url && art.url !== 'N/A' ? (
                                            <a
                                              href={art.url}
                                              target="_blank"
                                              rel="noreferrer"
                                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/40 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-wider transition-colors"
                                            >
                                              <Chrome size={12} />
                                              Read
                                            </a>
                                          ) : (
                                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">No Link</span>
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'competitor-analysis' ? (
                  <div className={`h-full flex flex-col items-center justify-start ${sidebarCollapsed ? 'max-w-[1850px]' : 'max-w-[1700px]'} mx-auto w-full transition-all duration-500`}>
                    {/* Top Actions Bar */}
                    <div className="w-full flex justify-end items-center gap-3 mb-8 animate-in fade-in slide-in-from-right-4 duration-700 relative">
                      <div className="relative">
                        <button
                          onClick={() => setShowCustomizePanel(!showCustomizePanel)}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${showCustomizePanel
                            ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                            : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'
                            }`}
                        >
                          <Settings size={14} />
                          Customize Board
                        </button>
                        {showCustomizePanel && (
                          <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-100 rounded-3xl p-6 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex justify-between items-center mb-4">
                              <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">Toggle Cards</h4>
                              <button
                                onClick={() => {
                                  setVisibleCards(ALL_CARDS_VISIBLE);
                                  localStorage.setItem('cerebro_comp_cards', JSON.stringify(ALL_CARDS_VISIBLE));
                                }}
                                className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:underline"
                              >
                                Reset to Default
                              </button>
                            </div>
                            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                              {[
                                { id: 'summary_sov', label: '📊 Summary & SOV', desc: 'Brand mentions, reach, and share of voice' },
                                { id: 'coverage_intensity', label: '🔥 Coverage Intensity', desc: 'Average daily media pressure metric' },
                                { id: 'momentum', label: '📈 Brand Momentum', desc: 'Growth trend comparing week periods' },
                                { id: 'freshness', label: '🍃 Media Freshness Index', desc: 'Average article age comparison' },
                                { id: 'sentiment_ratio', label: '📊 Sentiment Ratio Bar', desc: 'Sentiment percentages compared side-by-side' },
                                { id: 'positivity_gauge', label: '🎯 Positivity Gauge', desc: 'Circular positivity rate indicator' },
                                { id: 'source_overlap', label: '🤝 Source Overlap', desc: 'Shared publishers and overlap score' },
                                { id: 'grouped_bar', label: '📊 Grouped Bar Chart', desc: 'Mentions side-by-side for last 7 days' },
                                { id: 'sentiment_donut', label: '🍩 Sentiment Donut', desc: 'Sentiment breakdowns individually' },
                                { id: 'cadence_heatmap', label: '📅 Cadence Heatmap', desc: 'Daily volume intensity grid' },
                                { id: 'reach_accumulation', label: '📈 Reach Accumulation', desc: 'Cumulative reach trend line chart' },
                                { id: 'source_authority', label: '🛡️ Source Authority', desc: 'Authority tier breakdowns (PR metrics)' },
                                { id: 'top_headlines', label: '📰 Top Headlines', desc: 'Table of top 5 highest-impact articles' },
                                { id: 'top_sources', label: '🏢 Top Sources', desc: 'Most frequent publishing outlets list' }
                              ].map(card => (
                                <label key={card.id} className="flex items-start gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                                  <input
                                    type="checkbox"
                                    checked={!!visibleCards[card.id]}
                                    onChange={(e) => {
                                      const next = { ...visibleCards, [card.id]: e.target.checked };
                                      setVisibleCards(next);
                                      localStorage.setItem('cerebro_comp_cards', JSON.stringify(next));
                                    }}
                                    className="mt-1 accent-indigo-600 rounded cursor-pointer"
                                  />
                                  <div>
                                    <span className="text-xs font-black text-slate-800 block">{card.label}</span>
                                    <span className="text-[10px] text-slate-400 font-bold block mt-0.5">{card.desc}</span>
                                  </div>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={handleRefreshCompetitorTab}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-indigo-600 hover:text-indigo-600 transition-all duration-500 shadow-sm"
                      >
                        <RotateCcw size={14} />
                        Refresh Tab
                      </button>
                      <button
                        onClick={() => setShowHistory(!showHistory)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 ${showHistory
                          ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200'
                          : 'bg-white border border-slate-200 text-slate-500 hover:border-indigo-600 hover:text-indigo-600 shadow-sm'
                          }`}
                      >
                        <History size={14} />
                        {showHistory ? 'Back to Comparison' : 'View History'}
                      </button>
                    </div>

                    <div className="text-center max-w-2xl mx-auto mb-12 animate-in fade-in duration-700">
                      <h1 className={`text-5xl tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        <span className="font-light">Competitor</span> <span className="font-black">Analysis</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                        Compare media share of voice, sentiment dynamics, and coverage metrics side-by-side
                      </p>
                    </div>

                    <div className="w-full max-w-4xl mx-auto bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-12 shadow-2xl shadow-slate-200/50">
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
                              <div
                                key={item.id}
                                onClick={async () => {
                                  setComp1(item.comp1);
                                  setComp2(item.comp2);
                                  setSearch1(item.comp1);
                                  setSearch2(item.comp2);
                                  setShowHistory(false);
                                  setIsAnalysing(true);
                                  setIsLoadingAnalysis(true);
                                  try {
                                    const res = await fetch(`http://localhost:3001/api/competitor-analysis?keyword1=${encodeURIComponent(item.comp1)}&keyword2=${encodeURIComponent(item.comp2)}`, {
                                      headers: { 'X-User-Id': user?.id }
                                    });
                                    if (res.ok) {
                                      const data = await res.json();
                                      setCompAnalysisData(data);
                                      setComp1Mentions(data.comp1.mentions);
                                      setComp2Mentions(data.comp2.mentions);
                                    } else {
                                      setCompAnalysisData(null);
                                      setComp1Mentions(0);
                                      setComp2Mentions(0);
                                    }
                                  } catch (err) {
                                    console.error('Error loading history item:', err);
                                  } finally {
                                    setIsLoadingAnalysis(false);
                                  }
                                }}
                                className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-lg transition-all group cursor-pointer flex justify-between items-center"
                              >
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
                                <div className="flex items-center gap-4">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">Restore Session →</span>
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
                      ) : (() => {
                        const suggestionItems = globalCompanies.length > 0 ? globalCompanies : ["Google", "Apple", "Nvidia", "Microsoft", "Amazon", "Meta", "Netflix", "Tesla"];
                        return (
                          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-8">
                            <SearchableDropdown
                              label="Primary Entity"
                              placeholder="Search entity..."
                              items={suggestionItems}
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
                              items={suggestionItems}
                              value={search2}
                              onChange={(val) => {
                                setSearch2(val);
                                setComp2(val);
                              }}
                              theme="slate"
                              exclude={comp1}
                            />
                          </div>
                        );
                      })()}
                    </div>

                    {isAnalysing && !showHistory && isLoadingAnalysis && (
                      <div className="w-full mt-16 flex flex-col items-center justify-center py-20 animate-pulse">
                        <div className="relative w-24 h-24 mb-6">
                          <div className="absolute inset-0 border-4 border-slate-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-4 bg-slate-50 rounded-full flex items-center justify-center">
                            <Activity size={24} className="text-indigo-600 animate-pulse" />
                          </div>
                        </div>
                        <h4 className="text-lg font-black text-slate-800 uppercase tracking-tighter mb-1">Synthesizing Comparative Intelligence...</h4>
                        <p className="text-slate-400 text-xs font-bold">Parsing articles, mapping domains, and computing estimated reach trends</p>
                      </div>
                    )}

                    {isAnalysing && !showHistory && !isLoadingAnalysis && compAnalysisData && (
                      <div className="w-full mt-4 flex flex-col items-center">
                        
                        {/* Row 1: Summary / Share of Voice Section */}
                        {visibleCards.summary_sov && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            {/* Primary Entity Card */}
                            <div className="bg-white border border-indigo-100 rounded-[2.5rem] p-8 shadow-xl shadow-indigo-50/40 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
                              <div className="relative flex items-center justify-between mb-6">
                                <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                                  <Activity size={28} />
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Primary Entity</p>
                                  <p className="text-2xl font-black text-indigo-600 truncate max-w-[180px]">{compAnalysisData.comp1.name}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-4">
                                <div>
                                  <h4 className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1.5 leading-none">Total Mentions</h4>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-black tracking-tight">
                                      {compAnalysisData.comp1.mentions.toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold">in Database</span>
                                  </div>
                                </div>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <div>
                                  <h4 className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1.5 leading-none">Estimated Reach</h4>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-indigo-600 tracking-tight">
                                      {compAnalysisData.comp1.estimatedReach.toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold">potential views</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Competitor Entity Card */}
                            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-xl shadow-slate-100/30 relative overflow-hidden group">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110 -z-10"></div>
                              <div className="relative flex items-center justify-between mb-6">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-slate-200">
                                  <Activity size={28} />
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Competitor</p>
                                  <p className="text-2xl font-black text-slate-900 truncate max-w-[180px]">{compAnalysisData.comp2.name}</p>
                                </div>
                              </div>
                              <div className="flex flex-col gap-4">
                                <div>
                                  <h4 className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1.5 leading-none">Total Mentions</h4>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-black tracking-tight">
                                      {compAnalysisData.comp2.mentions.toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold">in Database</span>
                                  </div>
                                </div>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <div>
                                  <h4 className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-1.5 leading-none">Estimated Reach</h4>
                                  <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">
                                      {compAnalysisData.comp2.estimatedReach.toLocaleString()}
                                    </span>
                                    <span className="text-slate-400 text-xs font-bold">potential views</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Share of Voice Pie Chart */}
                            <ShareOfVoiceDonut
                              val1={compAnalysisData.comp1.mentions}
                              val2={compAnalysisData.comp2.mentions}
                              name1={compAnalysisData.comp1.name}
                              name2={compAnalysisData.comp2.name}
                            />
                          </div>
                        )}

                        {/* Row 2: Coverage Intensity, Momentum, and Freshness */}
                        {(visibleCards.coverage_intensity || visibleCards.momentum || visibleCards.freshness) && (
                          <div className="w-full flex flex-col gap-8 mt-8">
                            {/* Coverage Intensity Row */}
                            {visibleCards.coverage_intensity && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full animate-in fade-in slide-in-from-top-6 duration-1000">
                                <CoverageIntensityCard
                                  score={compAnalysisData.comp1.coverageIntensityScore}
                                  name={compAnalysisData.comp1.name}
                                  isPrimary={true}
                                />
                                <CoverageIntensityCard
                                  score={compAnalysisData.comp2.coverageIntensityScore}
                                  name={compAnalysisData.comp2.name}
                                  isPrimary={false}
                                />
                              </div>
                            )}

                            {/* Momentum and Freshness side-by-side or stacked */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                              {visibleCards.momentum ? (
                                <>
                                  <MomentumCard
                                    trends={compAnalysisData.comp1.trends}
                                    name={compAnalysisData.comp1.name}
                                    isPrimary={true}
                                  />
                                  <MomentumCard
                                    trends={compAnalysisData.comp2.trends}
                                    name={compAnalysisData.comp2.name}
                                    isPrimary={false}
                                  />
                                </>
                              ) : (
                                <div className="hidden lg:block lg:col-span-2" />
                              )}
                              
                              {visibleCards.freshness && (
                                <FreshnessCard
                                  age1={compAnalysisData.comp1.avgArticleAgeDays}
                                  age2={compAnalysisData.comp2.avgArticleAgeDays}
                                  name1={compAnalysisData.comp1.name}
                                  name2={compAnalysisData.comp2.name}
                                />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Row 3: Sentiment Ratio Bar (Full Width) */}
                        {visibleCards.sentiment_ratio && (
                          <div className="w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            <SentimentRatioBar
                              comp1={compAnalysisData.comp1}
                              comp2={compAnalysisData.comp2}
                            />
                          </div>
                        )}

                        {/* Row 4: Positivity Gauge & Source Overlap */}
                        {(visibleCards.positivity_gauge || visibleCards.source_overlap) && (
                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            {visibleCards.positivity_gauge ? (
                              <>
                                <PositivityGauge
                                  sentiment={compAnalysisData.comp1.sentiment}
                                  name={compAnalysisData.comp1.name}
                                  isPrimary={true}
                                />
                                <PositivityGauge
                                  sentiment={compAnalysisData.comp2.sentiment}
                                  name={compAnalysisData.comp2.name}
                                  isPrimary={false}
                                />
                              </>
                            ) : (
                              <div className="hidden lg:block lg:col-span-2" />
                            )}
                            
                            {visibleCards.source_overlap && (
                              <SourceOverlapCard
                                sources1={compAnalysisData.comp1.sources}
                                sources2={compAnalysisData.comp2.sources}
                                name1={compAnalysisData.comp1.name}
                                name2={compAnalysisData.comp2.name}
                              />
                            )}
                          </div>
                        )}

                        {/* Row 5: Grouped Bar Chart (Full Width) */}
                        {visibleCards.grouped_bar && (
                          <div className="w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            <GroupedBarChart
                              trends1={compAnalysisData.comp1.trends}
                              trends2={compAnalysisData.comp2.trends}
                              labels={compAnalysisData.trendLabels}
                              name1={compAnalysisData.comp1.name}
                              name2={compAnalysisData.comp2.name}
                            />
                          </div>
                        )}

                        {/* Row 6: Sentiment Donut (Primary & Competitor side-by-side) */}
                        {visibleCards.sentiment_donut && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            <SentimentDonut
                              sentiment={compAnalysisData.comp1.sentiment}
                              name={compAnalysisData.comp1.name}
                              isPrimary={true}
                            />
                            <SentimentDonut
                              sentiment={compAnalysisData.comp2.sentiment}
                              name={compAnalysisData.comp2.name}
                              isPrimary={false}
                            />
                          </div>
                        )}

                        {/* Row 7: Cadence Heatmap (Full Width) */}
                        {visibleCards.cadence_heatmap && (
                          <div className="w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            <CadenceHeatmap
                              trends1={compAnalysisData.comp1.trends}
                              trends2={compAnalysisData.comp2.trends}
                              labels={compAnalysisData.trendLabels}
                              name1={compAnalysisData.comp1.name}
                              name2={compAnalysisData.comp2.name}
                            />
                          </div>
                        )}

                        {/* Row 8: Reach Accumulation Chart (Full Width) */}
                        {visibleCards.reach_accumulation && (
                          <div className="w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            <ReachAccumulationChart
                              trends1={compAnalysisData.comp1.trends}
                              trends2={compAnalysisData.comp2.trends}
                              totalReach1={compAnalysisData.comp1.estimatedReach}
                              totalReach2={compAnalysisData.comp2.estimatedReach}
                              labels={compAnalysisData.trendLabels}
                              name1={compAnalysisData.comp1.name}
                              name2={compAnalysisData.comp2.name}
                            />
                          </div>
                        )}

                        {/* Row 9: Source Authority Chart */}
                        {visibleCards.source_authority && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            <SourceAuthorityChart
                              tiers={compAnalysisData.comp1.sourceAuthorityTiers}
                              name={compAnalysisData.comp1.name}
                              isPrimary={true}
                            />
                            <SourceAuthorityChart
                              tiers={compAnalysisData.comp2.sourceAuthorityTiers}
                              name={compAnalysisData.comp2.name}
                              isPrimary={false}
                            />
                          </div>
                        )}

                        {/* Row 10: Top Headlines Table (Full Width) */}
                        {visibleCards.top_headlines && (
                          <div className="w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            <TopHeadlinesTable
                              top1={compAnalysisData.comp1.topArticles}
                              top2={compAnalysisData.comp2.topArticles}
                              name1={compAnalysisData.comp1.name}
                              name2={compAnalysisData.comp2.name}
                            />
                          </div>
                        )}

                        {/* Row 11: Top Publishers / Sources Row */}
                        {visibleCards.top_sources && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-8 animate-in fade-in slide-in-from-top-6 duration-1000">
                            <TopSourcesCard
                              sources={compAnalysisData.comp1.sources}
                              name={compAnalysisData.comp1.name}
                              isPrimary={true}
                            />
                            <TopSourcesCard
                              sources={compAnalysisData.comp2.sources}
                              name={compAnalysisData.comp2.name}
                              isPrimary={false}
                            />
                          </div>
                        )}

                        {/* Reset / New Comparison button */}
                        <div className="mt-12 flex justify-center animate-in fade-in duration-500">
                          <button
                            onClick={handleRefreshCompetitorTab}
                            className="px-8 py-4 bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2"
                          >
                            <RotateCcw size={16} />
                            Reset Comparison
                          </button>
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
                  <div className={`flex flex-col ${sidebarCollapsed ? 'max-w-[1850px]' : 'max-w-[1700px]'} mx-auto w-full animate-in fade-in duration-700 pr-2 transition-all duration-500`}>
                    <div className="text-center max-w-2xl mx-auto mb-12">
                      <h1 className={`text-5xl tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        <span className="font-light">Platform</span> <span className="font-black">Settings</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                        Manage your account preferences and system configurations
                      </p>
                    </div>

                    {user?.role === 'admin' ? (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full items-start">
                        {/* Left Column: User Profile and Admin Security Settings */}
                        <div className="flex flex-col gap-8">
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

                          {/* Admin Security Settings Block */}
                          <div className="bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 animate-in fade-in duration-500">
                            <div className="flex items-center gap-5 mb-10">
                              <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform hover:rotate-3">
                                <Settings size={32} />
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Admin Security Settings</h4>
                                <p className="text-xs font-bold text-slate-400">Update system wide administrator key</p>
                              </div>
                            </div>
                            <div className="space-y-6">
                              <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">New Admin Key</label>
                                <div className="flex gap-4">
                                  <input
                                    type="text"
                                    placeholder="Enter new admin key"
                                    className="flex-1 py-4 px-6 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-sm"
                                    value={newAdminKey}
                                    onChange={(e) => setNewAdminKey(e.target.value)}
                                  />
                                  <button
                                    onClick={handleUpdateAdminKey}
                                    className="px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
                                  >
                                    Update Key
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right Column: System License Keys Block */}
                        <div className="bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 h-full flex flex-col">
                          <div className="flex items-center justify-between gap-5 mb-10">
                            <div className="flex items-center gap-5">
                              <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform hover:rotate-3">
                                <Key size={32} />
                              </div>
                              <div>
                                <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">System License Keys</h4>
                                <p className="text-xs font-bold text-slate-400">Generate and manage monetization license keys</p>
                              </div>
                            </div>
                            <button
                              onClick={handleGenerateLicenseKey}
                              disabled={isGeneratingKey}
                              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                              <Plus size={16} /> Generate Key
                            </button>
                          </div>

                          <div className="overflow-hidden border border-slate-100 rounded-2xl">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-100">
                                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">License Key</th>
                                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned To</th>
                                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Created At</th>
                                  <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-50">
                                {adminLicenseKeys && adminLicenseKeys.length > 0 ? (
                                  adminLicenseKeys.map((k) => (
                                    <tr key={k.id} className="hover:bg-slate-50/50 transition-colors">
                                      <td className="p-4 text-xs font-mono font-bold text-slate-900">{k.key}</td>
                                      <td className="p-4">
                                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${k.is_revoked
                                          ? 'bg-rose-50 border border-rose-100 text-rose-600'
                                          : k.is_used
                                            ? 'bg-red-50 border border-red-100 text-red-600'
                                            : 'bg-emerald-50 border border-emerald-100 text-emerald-600'
                                          }`}>
                                          {k.is_revoked ? 'Revoked' : k.is_used ? 'Used' : 'Active'}
                                        </span>
                                      </td>
                                      <td className="p-4 text-xs font-bold text-slate-600">{k.assigned_to_email || '—'}</td>
                                      <td className="p-4 text-[10px] text-slate-400 font-medium">
                                        {new Date(k.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                      </td>
                                      <td className="p-4">
                                        {k.is_revoked ? (
                                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Revoked</span>
                                        ) : (
                                          <button
                                            onClick={() => handleRevokeLicenseKey(k.key)}
                                            className="px-3 py-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white rounded-lg font-black uppercase text-[8px] tracking-widest transition-all active:scale-95 shadow-sm"
                                          >
                                            Revoke
                                          </button>
                                        )}
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="5" className="p-8 text-center text-xs font-bold text-slate-400">
                                      No license keys found.
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    ) : (
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
                    )}

                    {/* Virtual Pets Toggle — shown for all users */}
                    <div className="mt-8 max-w-2xl mx-auto w-full bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 animate-in fade-in duration-500">
                      <div className="flex items-center gap-5 mb-8">
                        <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform hover:rotate-3">
                          <span className="text-2xl">🐾</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Display Preferences</h4>
                          <p className="text-xs font-bold text-slate-400">Customize ambient UI elements</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-6 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-indigo-200 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-xl">🐱</div>
                          <div>
                            <p className="text-sm font-black text-slate-900">Virtual Pets</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Animated characters on screen</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const next = !showPets;
                            setShowPets(next);
                            localStorage.setItem('cerebro_show_pets', String(next));
                          }}
                          className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none ${showPets ? 'bg-indigo-600 shadow-lg shadow-indigo-200' : 'bg-slate-200'}`}
                        >
                          <span className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-md transition-all duration-300 ${showPets ? 'translate-x-7' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>

                    <div className="mt-12 flex justify-center gap-4">
                      <button className="px-10 py-4 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-200 hover:scale-105 active:scale-95 transition-all">Save Changes</button>
                      <button className="px-10 py-4 bg-white border border-slate-200 text-slate-400 rounded-full font-black uppercase tracking-widest text-xs hover:text-red-500 hover:border-red-500 transition-all">Discard</button>
                    </div>
                  </div>
                ) : activeTab === 'brand-tracker' ? (
                  <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {selectedBrandForDetail ? (
                      <div className="animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="mb-8 flex items-center justify-between">
                          <button
                            onClick={() => setSelectedBrandForDetail(null)}
                            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black uppercase text-[10px] tracking-widest transition-colors group"
                          >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Back to Tracker
                          </button>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <h2 className="text-2xl font-black text-black tracking-tight uppercase">{selectedBrandForDetail.name} Intelligence</h2>
                              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Region: {selectedBrandForDetail.region}</p>
                            </div>
                            <button
                              onClick={() => window.open(`http://localhost:3001/api/brands/${selectedBrandForDetail.id}/report?userId=${user?.id}`, '_blank')}
                              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 flex items-center gap-2 transition-all active:scale-95"
                            >
                              <Download size={16} /> Download Report
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {brandArticles.length > 0 ? brandArticles.map((article, idx) => {
                            const sentiment = article.sentiment || 'Neutral';
                            const sentColor = sentiment === 'Positive' ? '#00D166' : sentiment === 'Negative' ? '#FF4B4B' : '#94A3B8';
                            const sentBg = sentiment === 'Positive' ? 'bg-teal-50/50 border-teal-100 text-teal-600' : sentiment === 'Negative' ? 'bg-red-50/50 border-red-100 text-red-600' : 'bg-slate-50/50 border-slate-100 text-slate-600';

                            const pubDate = new Date(article.published_at);
                            const formattedDate = !isNaN(pubDate.getTime()) ? pubDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : article.published_at;

                            let relativeAge = 'Just now';
                            if (!isNaN(pubDate.getTime())) {
                              const diffSecs = Math.max(0, Math.floor((Date.now() - pubDate.getTime()) / 1000));
                              if (diffSecs < 60) relativeAge = `${diffSecs}s ago`;
                              else if (diffSecs < 3600) relativeAge = `${Math.floor(diffSecs / 60)}m ago`;
                              else if (diffSecs < 86400) relativeAge = `${Math.floor(diffSecs / 3600)}h ago`;
                              else relativeAge = `${Math.floor(diffSecs / 86400)}d ago`;
                            }

                            const isArticleNew = article.last_ping_time && article.created_at && (new Date(article.created_at) >= new Date(article.last_ping_time));

                            return (
                              <div
                                key={article.id || idx}
                                className={`border ${isArticleNew
                                  ? 'bg-indigo-50/30 border-indigo-200 shadow-sm shadow-indigo-50/50 hover:bg-indigo-50/50'
                                  : expandedArticleId === idx
                                    ? 'bg-slate-50/20 border-indigo-200 shadow-2xl shadow-slate-200/50'
                                    : 'bg-white border-slate-100 hover:bg-slate-50/30'
                                  } rounded-[1.5rem] transition-all cursor-pointer group overflow-hidden`}
                                onClick={() => {
                                  const isExpanding = expandedArticleId !== idx;
                                  setExpandedArticleId(isExpanding ? idx : null);
                                  if (isExpanding) {
                                    loadArticleContent(article);
                                  }
                                }}
                              >
                                <div className={`p-5 flex items-center gap-4 transition-colors`}>
                                  <div className={`transition-transform duration-500 ${expandedArticleId === idx ? 'rotate-90 text-indigo-600' : 'text-slate-300 group-hover:text-indigo-600'}`}>
                                    <ChevronRight size={20} />
                                  </div>
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${expandedArticleId === idx || isArticleNew ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600'}`}>
                                    <Activity size={18} />
                                  </div>
                                  <p className="text-sm font-medium text-slate-700 leading-snug flex-1 truncate flex items-center gap-2">
                                    <span className="font-black text-slate-900 uppercase tracking-tight mr-1 shrink-0">{selectedBrandForDetail.name}:</span>
                                    <span className="truncate">{article.title}</span>
                                    {isArticleNew && (
                                      <span className="bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md shrink-0 animate-pulse">
                                        NEW
                                      </span>
                                    )}
                                  </p>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 border border-slate-100 px-2.5 py-1 rounded-xl">
                                      {relativeAge}
                                    </span>
                                    <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-widest border ${sentBg}`}>
                                      {sentiment}
                                    </div>
                                  </div>
                                </div>

                                {expandedArticleId === idx && (
                                  <div className="px-10 pb-10 pt-6 animate-in slide-in-from-top-8 duration-700 ease-out">
                                    <div className="grid grid-cols-12 gap-10 pt-8 border-t border-slate-100">
                                      {/* Content (Expanded) */}
                                      <div className="col-span-9">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Full Article Content</h4>
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-[2.5rem] p-10 h-64 overflow-y-auto custom-scrollbar shadow-inner">
                                          {loadingArticleContents[article.id] ? (
                                            <div className="flex flex-col items-center justify-center h-full py-8 gap-3">
                                              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest animate-pulse">Scraping article body...</p>
                                            </div>
                                          ) : (
                                            <p className="text-xs font-bold text-slate-700 leading-relaxed whitespace-pre-wrap animate-in fade-in duration-300">
                                              {articleContents[article.id] || article.summary || 'No summary available.'}
                                            </p>
                                          )}
                                        </div>
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            window.open(article.link, '_blank');
                                          }}
                                          className="mt-8 flex items-center gap-2 text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] hover:translate-x-2 transition-transform group/link"
                                        >
                                          View Full Article
                                          <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                                        </button>
                                      </div>

                                      {/* Sidebar: Details & Sentiment */}
                                      <div className="col-span-3 space-y-8">
                                        <div>
                                          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-5">Details</h4>
                                          <div className="space-y-4">
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Source</p>
                                              <p className="text-xs font-black text-slate-900 truncate">{article.source || 'Google News'}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">IST Timestamp</p>
                                              <p className="text-xs font-black text-slate-900">{formattedDate}</p>
                                            </div>
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Relative Age</p>
                                              <p className="text-xs font-black text-slate-900">{relativeAge}</p>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="pt-2">
                                          <div className={`p-4 rounded-2xl border flex items-center gap-2 ${sentBg}`}>
                                            <div className={`w-2 h-2 rounded-full animate-pulse ${sentiment === 'Positive' ? 'bg-teal-500' : sentiment === 'Negative' ? 'bg-red-500' : 'bg-slate-400'}`}></div>
                                            <span className="text-xs font-black uppercase tracking-widest">{sentiment}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          }) : (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-20 text-center">
                              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
                                <Activity size={32} />
                              </div>
                              <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-2">No Articles Found</h3>
                              <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto">
                                Articles are being fetched in the background. Click 'Refresh Now' above or check back in a few minutes.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Centered Heading */}
                        <div className="text-center max-w-2xl mx-auto mb-12">
                          <h1 className={`text-5xl tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                            <span className="font-light">Brand</span> <span className="font-black">Tracking</span>
                          </h1>
                          <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                            Real-time feed intelligence added to your brands
                          </p>
                        </div>

                        {/* Premium Action Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowAddBrandModal(true)}
                              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 flex items-center gap-2 transition-all active:scale-95 duration-200 font-heading"
                            >
                              <Plus size={14} /> Add Brand
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            {/* Auto Refresh */}
                            <div className={`flex items-center gap-2 px-3 py-2 border rounded-xl shadow-sm text-[9px] font-black uppercase tracking-widest ${
                              darkMode
                                ? 'bg-[#151f32] border-white/5 text-slate-300'
                                : 'bg-white border-slate-200/60 text-slate-600'
                            }`}>
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                              Auto Refresh in <span className="text-indigo-550 dark:text-indigo-400 font-black">{Math.floor(refreshTimer / 60)}:{(refreshTimer % 60).toString().padStart(2, '0')}</span>
                            </div>

                            {/* Refresh Now Button */}
                            <button
                              onClick={handleRefreshBrandsNow}
                              disabled={isRefreshingBrand}
                              className={`px-4 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm flex items-center gap-1.5 disabled:opacity-50 ${
                                darkMode
                                  ? 'bg-[#151f32]/80 border-white/5 text-[#00F2FE] hover:bg-[#151f32]'
                                  : 'bg-white border-slate-200 text-indigo-650 hover:bg-slate-50'
                              }`}
                            >
                              <RotateCcw size={10} className={isRefreshingBrand ? 'animate-spin' : ''} />
                              {isRefreshingBrand ? 'Fetching...' : 'Refresh Now'}
                            </button>

                            {/* Active Brands count */}
                            <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${
                              darkMode
                                ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                            }`}>
                              {trackedBrands.length} Brands Active
                            </div>
                          </div>
                        </div>

                        {trackedBrands.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {trackedBrands.map((brand) => {
                              const formattedTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                              const roleLetter = user?.role === 'employee' || user?.role === 'admin' ? 'E' : 'B';
                              const mockNewCount = brand.new_mentions || Math.floor((brand.mentions || 516) * 0.05) || 27;

                              return (
                                <div
                                  key={brand.id}
                                  onClick={() => handleSelectBrand(brand)}
                                  className={`p-8 rounded-[2.5rem] border transition-all text-left flex flex-col justify-between hover:scale-[1.02] duration-300 shadow-md relative overflow-hidden group cursor-pointer animate-in fade-in duration-500 ${
                                    darkMode
                                      ? 'bg-[#151f32] border-white/5 hover:border-indigo-550/50'
                                      : 'bg-white border-slate-200/60 hover:border-indigo-600/50'
                                  }`}
                                >
                                  {/* Top Row */}
                                  <div className="flex items-center justify-between w-full relative z-10">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-md ${
                                        darkMode ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-900'
                                      }`}>
                                        <Activity size={20} />
                                      </div>
                                      <div>
                                        <h3 className={`text-lg font-black tracking-tight leading-none font-heading ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                          {brand.name}
                                        </h3>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <span className={`text-[9px] font-black uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                        {brand.region}
                                      </span>
                                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-black text-white ${
                                        roleLetter === 'E' ? 'bg-red-500/80 shadow-sm shadow-red-500/10' : 'bg-indigo-500/80 shadow-sm shadow-indigo-500/10'
                                      }`}>
                                        {roleLetter}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Middle Row (Mentions count) */}
                                  <div className="mt-8 relative z-10 flex flex-col">
                                    <span className={`text-5xl font-black tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                      {brand.mentions || 516}
                                    </span>
                                    <span className={`text-[9px] font-black tracking-widest uppercase mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                      Mentions
                                    </span>
                                  </div>

                                  {/* Bottom Row */}
                                  <div className="mt-8 pt-4 border-t border-slate-200/20 dark:border-white/5 flex items-center justify-between relative z-10">
                                    {/* New badge */}
                                    <div className="flex items-center gap-1 text-[9px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                                      <TrendingUp size={10} />
                                      +{mockNewCount} NEW <span className={`text-[8px] font-bold ${darkMode ? 'text-slate-450' : 'text-slate-500'}`}>TODAY</span>
                                    </div>

                                    {/* Last Checked */}
                                    <div className="flex items-center gap-1.5 text-[8px] font-black text-slate-400 uppercase tracking-wider">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                      Checked {formattedTime}
                                    </div>
                                  </div>

                                  {/* Delete Brand on hover */}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteBrand(brand.id);
                                    }}
                                    className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-200 z-20 w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-650 hover:text-white shadow-sm"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className={`border-2 border-dashed rounded-[3rem] p-20 text-center ${
                            darkMode ? 'bg-[#151f32]/20 border-white/10' : 'bg-white border-slate-200'
                          }`}>
                            <div className="w-20 h-20 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Plus size={32} className="text-slate-300 dark:text-slate-650" />
                            </div>
                            <h3 className={`text-xl font-black uppercase tracking-tight mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>No Brands Tracked</h3>
                            <p className="text-slate-500 font-bold text-sm max-w-sm mx-auto mb-6">
                              Click the 'Add Brand' button above to start monitoring your first asset.
                            </p>
                            <button
                              onClick={() => setShowAddBrandModal(true)}
                              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/20 inline-flex items-center gap-2"
                            >
                              <Plus size={14} /> Add Brand
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ) : activeTab === 'report-analysis' ? (
                  <div className={`w-full ${sidebarCollapsed ? 'max-w-[1850px]' : 'max-w-[1700px]'} mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 transition-all duration-500`}>
                    {selectedReport ? (
                      <div className="fixed inset-0 z-[100] bg-slate-100 flex overflow-hidden animate-in fade-in duration-500 font-sans">
                        {/* Left Sidebar Wrapper with Floating Border Button */}
                        {!isPresentView && (
                          <div className="relative z-50 flex shrink-0 font-sans h-full">
                            <div className={`bg-slate-900 text-white flex flex-col shadow-2xl h-full transition-all duration-300 ${isLeftSidebarOpen ? 'w-80 border-r border-slate-800 opacity-100' : 'w-0 overflow-hidden border-none opacity-0'}`}>
                              <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-serif font-black text-white shadow-lg shadow-indigo-500/30 text-lg">
                                    C
                                  </div>
                                  <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-100">Cerebro</h2>
                                    <p className="text-[10px] font-medium text-slate-400">Autonomous Intelligence Studio</p>
                                  </div>
                                </div>
                              </div>

                              <div className="p-4 border-b border-slate-800/60 bg-slate-900/50 flex items-center justify-between text-[11px] font-bold text-slate-300 shrink-0">
                                <span className="flex items-center gap-2">
                                  <Book size={14} className="text-indigo-400" /> Assessment Document
                                </span>
                                <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30 font-mono text-[10px] font-black uppercase tracking-wider">
                                  {selectedReport.type}
                                </span>
                              </div>

                              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-3 py-2 flex items-center justify-between">
                                  <span>Front Matter & Body</span>
                                  <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{(selectedReport.sections || []).length}</span>
                                </div>

                                {/* Inline Section Creator Form */}
                                <form onSubmit={(e) => {
                                  e.preventDefault();
                                  if (!newSectionTitle.trim()) return;
                                  const newSec = {
                                    id: `sec-${Date.now()}`,
                                    title: `${(selectedReport.sections || []).length + 1}. ${newSectionTitle.trim()}`,
                                    content: 'Begin writing intelligence briefing here...',
                                    charts: [],
                                    images: []
                                  };
                                  const updated = {
                                    ...selectedReport,
                                    sections: [...(selectedReport.sections || []), newSec]
                                  };
                                  setSelectedReport(updated);
                                  setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                  setActiveSectionIndex((selectedReport.sections || []).length);
                                  setNewSectionTitle('');
                                  setTimeout(() => {
                                    const elem = document.getElementById(`canvas-sec-${updated.sections.length - 1}`);
                                    if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                                  }, 100);
                                }} className="px-3 pb-3 flex items-center gap-2 border-b border-slate-800/60 mb-2">
                                  <input
                                    type="text"
                                    placeholder="New section title..."
                                    value={newSectionTitle}
                                    onChange={e => setNewSectionTitle(e.target.value)}
                                    className="w-full bg-slate-800/90 text-xs text-white placeholder-slate-400 px-3 py-2 rounded-xl border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                  />
                                  <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg active:scale-95 transition-all shrink-0" title="Add Section">
                                    <Plus size={15} />
                                  </button>
                                </form>

                                {(selectedReport.sections || []).map((sec, idx) => (
                                  <div
                                    key={sec.id}
                                    draggable={true}
                                    onDragStart={() => setDraggedSectionIdx(idx)}
                                    onDragOver={(e) => {
                                      e.preventDefault();
                                      setDragOverSectionIdx(idx);
                                    }}
                                    onDragLeave={() => setDragOverSectionIdx(null)}
                                    onDrop={(e) => {
                                      e.preventDefault();
                                      if (draggedSectionIdx !== null && draggedSectionIdx !== idx) {
                                        const updatedSecs = [...selectedReport.sections];
                                        const [draggedItem] = updatedSecs.splice(draggedSectionIdx, 1);
                                        updatedSecs.splice(idx, 0, draggedItem);
                                        const renumbered = updatedSecs.map((s, i) => ({
                                          ...s,
                                          title: `${i + 1}. ${s.title.replace(/^\d+\.\s*/, '')}`
                                        }));
                                        const updated = { ...selectedReport, sections: renumbered };
                                        setSelectedReport(updated);
                                        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                        setActiveSectionIndex(idx);
                                      }
                                      setDraggedSectionIdx(null);
                                      setDragOverSectionIdx(null);
                                    }}
                                    onDragEnd={() => {
                                      setDraggedSectionIdx(null);
                                      setDragOverSectionIdx(null);
                                    }}
                                    onClick={() => {
                                      setActiveSectionIndex(idx);
                                      const elem = document.getElementById(`canvas-sec-${idx}`);
                                      if (elem) elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }}
                                    className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl cursor-grab active:cursor-grabbing text-xs font-bold transition-all duration-300 ${dragOverSectionIdx === idx ? 'border-2 border-indigo-400 bg-indigo-950/80 scale-105 shadow-2xl ring-4 ring-indigo-500/20' : ''
                                      } ${activeSectionIndex === idx
                                        ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30 font-black scale-[1.02]'
                                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                      }`}
                                  >
                                    <span className="truncate pr-2 flex items-center gap-3">
                                      <GripVertical size={13} className="opacity-30 group-hover:opacity-100 text-slate-400 shrink-0" />
                                      <span className={`w-2 h-2 rounded-full shrink-0 ${activeSectionIndex === idx ? 'bg-white shadow' : 'bg-slate-600'}`}></span>
                                      <span className="truncate">{sec.title}</span>
                                    </span>
                                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                                      {idx > 0 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updatedSecs = [...selectedReport.sections];
                                            const temp = updatedSecs[idx];
                                            updatedSecs[idx] = updatedSecs[idx - 1];
                                            updatedSecs[idx - 1] = temp;
                                            const updated = { ...selectedReport, sections: updatedSecs };
                                            setSelectedReport(updated);
                                            setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                            setActiveSectionIndex(idx - 1);
                                            setTimeout(() => {
                                              const elem = document.getElementById(`canvas-sec-${idx - 1}`);
                                              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                          }}
                                          className="p-1 hover:text-indigo-300 text-slate-300 transition-colors" title="Move Section Up"
                                        >
                                          <MoveUp size={13} />
                                        </button>
                                      )}
                                      {idx < (selectedReport.sections || []).length - 1 && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updatedSecs = [...selectedReport.sections];
                                            const temp = updatedSecs[idx];
                                            updatedSecs[idx] = updatedSecs[idx + 1];
                                            updatedSecs[idx + 1] = temp;
                                            const updated = { ...selectedReport, sections: updatedSecs };
                                            setSelectedReport(updated);
                                            setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                            setActiveSectionIndex(idx + 1);
                                            setTimeout(() => {
                                              const elem = document.getElementById(`canvas-sec-${idx + 1}`);
                                              if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                          }}
                                          className="p-1 hover:text-indigo-300 text-slate-300 transition-colors" title="Move Section Down"
                                        >
                                          <MoveDown size={13} />
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if ((selectedReport.sections || []).length <= 1) {
                                            alert("A report must have at least one section.");
                                            return;
                                          }
                                          if (confirm(`Remove section "${sec.title}"?`)) {
                                            const updatedSecs = selectedReport.sections.filter((_, i) => i !== idx);
                                            const updated = { ...selectedReport, sections: updatedSecs };
                                            setSelectedReport(updated);
                                            setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                            setActiveSectionIndex(Math.max(0, idx - 1));
                                          }
                                        }}
                                        className="p-1 hover:text-red-400 text-slate-300 transition-colors ml-1"
                                        title="Delete Section"
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </div>
                                  </div>
                                ))}

                                {/* Report Bookmarks (Feature 7) */}
                                <div className="border-t border-slate-800/60 my-4"></div>
                                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-3 py-2 flex items-center justify-between">
                                  <span>Report Bookmarks</span>
                                  <span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">{(selectedReport.bookmarks || []).length}</span>
                                </div>
                                <div className="px-3 pb-3 flex flex-col gap-2">
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="text"
                                      placeholder="Bookmark name..."
                                      value={newBookmarkName}
                                      onChange={(e) => setNewBookmarkName(e.target.value)}
                                      className="w-full bg-slate-800/90 text-[11px] text-white placeholder-slate-500 px-2.5 py-1.5 rounded-xl border border-slate-700/80 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
                                    />
                                    <button
                                      onClick={() => {
                                        const bName = newBookmarkName.trim();
                                        if (!bName) return;
                                        const newB = {
                                          id: `bookmark-${Date.now()}`,
                                          name: bName,
                                          filters: JSON.parse(JSON.stringify(reportFilters)),
                                          chartConfigs: JSON.parse(JSON.stringify(chartConfigs)),
                                          conditionalRules: JSON.parse(JSON.stringify(conditionalRules))
                                        };
                                        const updated = {
                                          ...selectedReport,
                                          bookmarks: [...(selectedReport.bookmarks || []), newB]
                                        };
                                        setSelectedReport(updated);
                                        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                        setNewBookmarkName('');
                                      }}
                                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg active:scale-95 transition-all shrink-0"
                                      title="Save Bookmark"
                                    >
                                      <Bookmark size={14} />
                                    </button>
                                  </div>
                                  
                                  <div className="max-h-40 overflow-y-auto space-y-1.5 custom-scrollbar">
                                    {(selectedReport.bookmarks || []).map((b) => (
                                      <div
                                        key={b.id}
                                        onClick={() => {
                                          if (b.filters) setReportFilters(b.filters);
                                          if (b.chartConfigs) setChartConfigs(b.chartConfigs);
                                          if (b.conditionalRules) setConditionalRules(b.conditionalRules);
                                        }}
                                        className="group flex items-center justify-between px-3 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white cursor-pointer transition-all border border-transparent hover:border-slate-700"
                                      >
                                        <span className="truncate flex items-center gap-2">
                                          <Bookmark size={11} className="text-slate-500 group-hover:text-emerald-400" />
                                          <span className="truncate">{b.name}</span>
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const updated = {
                                              ...selectedReport,
                                              bookmarks: (selectedReport.bookmarks || []).filter(item => item.id !== b.id)
                                            };
                                            setSelectedReport(updated);
                                            setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                          }}
                                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-405 transition-opacity"
                                          title="Delete Bookmark"
                                        >
                                          <Trash2 size={11} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="p-6 border-t border-slate-800 bg-slate-950/60 flex flex-col gap-3.5 text-xs text-slate-400 font-mono shrink-0">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span>Total Word Count:</span>
                                  <span className="text-white font-bold">
                                    {(selectedReport.sections || []).reduce((acc, s) => acc + (s.content || '').split(/\s+/).filter(Boolean).length, 0)} words
                                  </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                  <span>Telemetry Stream:</span>
                                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Live Sync
                                  </span>
                                </div>
                                <button
                                  onClick={() => setSelectedReport(null)}
                                  className="w-full mt-3 py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg transition-colors flex items-center justify-center gap-2 font-sans"
                                >
                                  <ArrowLeft size={16} /> Exit Cerebro Studio
                                </button>
                              </div>
                            </div>

                            {/* Retract Toggle Button Sticking out on Right Border */}
                            <button
                              onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                              className="absolute top-24 -right-3.5 z-50 w-7 h-7 bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded-full flex items-center justify-center border border-slate-700 shadow-2xl transition-transform hover:scale-110 cursor-pointer print:hidden"
                              title={isLeftSidebarOpen ? "Retract Sidebar" : "Expand Sidebar"}
                            >
                              {isLeftSidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                            </button>
                          </div>
                        )}


                        {/* Collapsible Left Filter Panel (Feature 1) */}
                        {!isPresentView && (
                          <div className={`bg-slate-900 text-white flex flex-col shadow-2xl h-full border-r border-slate-800 transition-all duration-300 shrink-0 ${isFilterPanelOpen ? 'w-80 opacity-100' : 'w-0 overflow-hidden border-none opacity-0'}`}>
                            <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
                              <div className="flex items-center gap-2.5">
                                <Filter size={18} className="text-indigo-400" />
                                <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Global Slicers</h3>
                              </div>
                              <button
                                onClick={() => setReportFilters({
                                  brands: [],
                                  sentiments: [],
                                  dateRange: ['', ''],
                                  minMentions: 0,
                                  publications: []
                                })}
                                className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-400 border border-slate-700 hover:border-indigo-600 rounded transition-all"
                                title="Clear all active filters"
                              >
                                Clear
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">
                              {/* 1. Date Range Picker */}
                              <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Date Range</label>
                                <div className="flex flex-col gap-2">
                                  <input
                                    type="date"
                                    value={reportFilters.dateRange[0] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setReportFilters(prev => ({
                                        ...prev,
                                        dateRange: [val, prev.dateRange[1]]
                                      }));
                                    }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
                                  />
                                  <input
                                    type="date"
                                    value={reportFilters.dateRange[1] || ''}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setReportFilters(prev => ({
                                        ...prev,
                                        dateRange: [prev.dateRange[0], val]
                                      }));
                                    }}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white text-xs outline-none focus:border-indigo-500"
                                  />
                                </div>
                              </div>

                              {/* 2. Brand Checkboxes */}
                              <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Brand Slicer</label>
                                <div className="max-h-36 overflow-y-auto space-y-2 bg-slate-950/30 p-3 rounded-2xl border border-slate-800">
                                  {Object.keys(reportTelemetryData?.brands || {}).map((b) => (
                                    <label key={b} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={reportFilters.brands.includes(b)}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setReportFilters(prev => {
                                            const brands = checked ? [...prev.brands, b] : prev.brands.filter(item => item !== b);
                                            return { ...prev, brands };
                                          });
                                        }}
                                        className="rounded text-indigo-650 focus:ring-indigo-550 bg-slate-850 border-slate-700"
                                      />
                                      <span className="truncate">{b}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {/* 3. Sentiment Scope */}
                              <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Sentiment Category</label>
                                <div className="flex gap-1.5">
                                  {['Positive', 'Neutral', 'Negative'].map(sent => {
                                    const active = reportFilters.sentiments.includes(sent);
                                    return (
                                      <button
                                        key={sent}
                                        onClick={() => {
                                          setReportFilters(prev => {
                                            const sentiments = active
                                              ? prev.sentiments.filter(item => item !== sent)
                                              : [...prev.sentiments, sent];
                                            return { ...prev, sentiments };
                                          });
                                        }}
                                        className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                          active
                                            ? sent === 'Positive' ? 'bg-emerald-650 text-white border-emerald-500 shadow-lg shadow-emerald-500/20' :
                                              sent === 'Negative' ? 'bg-red-650 text-white border-red-500 shadow-lg shadow-red-500/20' :
                                              'bg-slate-500 text-white border-slate-450 shadow-lg'
                                            : 'bg-slate-855 text-slate-400 border-slate-750 hover:bg-slate-750'
                                        }`}
                                      >
                                        {sent}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 4. Publication Checklist */}
                              <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block ml-1">Media Outlets</label>
                                <div className="max-h-36 overflow-y-auto space-y-2 bg-slate-950/30 p-3 rounded-2xl border border-slate-800">
                                  {(reportTelemetryData?.topIndianPublications || []).map((pub) => (
                                    <label key={pub.name} className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-300 hover:text-white transition-colors">
                                      <input
                                        type="checkbox"
                                        checked={reportFilters.publications.includes(pub.name)}
                                        onChange={(e) => {
                                          const checked = e.target.checked;
                                          setReportFilters(prev => {
                                            const publications = checked ? [...prev.publications, pub.name] : prev.publications.filter(item => item !== pub.name);
                                            return { ...prev, publications };
                                          });
                                        }}
                                        className="rounded text-indigo-650 focus:ring-indigo-550 bg-slate-850 border-slate-700"
                                      />
                                      <span className="truncate">{pub.name}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>

                              {/* 5. Mentions Slider */}
                              <div className="space-y-2.5">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                                  <span>Exposure Volume</span>
                                  <span className="text-indigo-400 font-mono font-black">{reportFilters.minMentions}</span>
                                </div>
                                <input
                                  type="range"
                                  min="0"
                                  max="500"
                                  value={reportFilters.minMentions}
                                  onChange={(e) => {
                                    const val = Number(e.target.value);
                                    setReportFilters(prev => ({
                                      ...prev,
                                      minMentions: val
                                    }));
                                  }}
                                  className="w-full accent-indigo-500 cursor-ew-resize bg-slate-800 rounded h-1.5"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Center Canvas: Pinned Toolbar & Continuous Full-Width Landscape Document */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center bg-white relative h-full">
                          {/* Pinned Top Toolbar & Ruler / Present Mode Topbar */}
                          {isPresentView ? (
                            <div className="sticky top-0 w-full bg-slate-900 text-white backdrop-blur-md z-50 border-b border-slate-800 shadow-2xl px-12 py-4 flex items-center justify-between font-sans print:hidden">
                              <div className="flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-mono text-[10px] font-black uppercase tracking-widest">
                                  Present Mode / Reader View
                                </span>
                                <h3 className="text-base font-black tracking-tight text-white">{selectedReport.title}</h3>
                              </div>
                              <div className="flex items-center gap-3">
                                <button
                                  onClick={() => window.print()}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
                                >
                                  <Printer size={15} /> Print / Export PDF
                                </button>
                                <button
                                  onClick={() => setIsPresentView(false)}
                                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-lg transition-all"
                                >
                                  <EyeOff size={15} /> Exit Present View
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="sticky top-0 w-full bg-slate-900/95 text-white backdrop-blur-md z-40 border-b border-slate-800 shadow-2xl px-12 py-3.5 flex flex-col gap-3 font-sans print:hidden">
                              <div className="flex flex-wrap items-center justify-between gap-4 w-full">
                                <div className="flex items-center gap-3">
                                  <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full font-mono text-[10px] font-black uppercase tracking-widest">
                                    {selectedReport.type}
                                  </span>
                                  <h3 className="text-sm font-black tracking-tight text-white">{selectedReport.title}</h3>

                                  <div className="w-px h-5 bg-slate-800 mx-2"></div>

                                  {/* Toggle Filters Sidebar Button (Feature 1) */}
                                  <button
                                    onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${isFilterPanelOpen ? 'bg-indigo-600 text-white shadow shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-755'}`}
                                  >
                                    <Filter size={13} />
                                    <span>Filters</span>
                                    {Object.values(reportFilters).some(v => Array.isArray(v) ? v.length > 0 : v > 0) && (
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                    )}
                                  </button>

                                  {/* Theme & Layout Selector (Feature 8) */}
                                  <div className="relative">
                                    <button
                                      onClick={() => setIsThemePickerOpen(!isThemePickerOpen)}
                                      className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${isThemePickerOpen ? 'bg-indigo-650 text-white shadow shadow-indigo-600/30' : 'bg-slate-800 text-slate-300 hover:bg-slate-755'}`}
                                    >
                                      <Sparkles size={13} />
                                      <span>Theme & Layout</span>
                                    </button>

                                    {/* Theme Picker Dropdown Popover */}
                                    {isThemePickerOpen && (
                                      <div className="absolute top-12 left-0 mt-2 w-72 bg-slate-900 border border-slate-850 rounded-2xl shadow-2xl p-5 z-[100] text-xs space-y-4 animate-in fade-in slide-in-from-top-2 duration-200 text-white">
                                        <div>
                                          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Select Theme</label>
                                          <div className="grid grid-cols-2 gap-2">
                                            {['Corporate Dark', 'Executive White', 'Branded', 'Print-Ready'].map(theme => (
                                              <button
                                                key={theme}
                                                onClick={() => setReportTheme(theme)}
                                                className={`p-2.5 rounded-xl text-[10px] font-bold text-left transition-all border ${
                                                  reportTheme === theme
                                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                                }`}
                                              >
                                                {theme}
                                              </button>
                                            ))}
                                          </div>
                                        </div>

                                        {reportTheme === 'Branded' && (
                                          <div className="space-y-2">
                                            <label className="block text-[10px] font-black uppercase text-slate-400">Branded Accent Color</label>
                                            <div className="flex items-center gap-2">
                                              <input
                                                type="color"
                                                value={brandedPrimaryColor}
                                                onChange={(e) => setBrandedPrimaryColor(e.target.value)}
                                                className="w-10 h-8 bg-transparent rounded cursor-pointer shrink-0"
                                              />
                                              <input
                                                type="text"
                                                value={brandedPrimaryColor}
                                                onChange={(e) => setBrandedPrimaryColor(e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-white font-mono"
                                              />
                                            </div>
                                          </div>
                                        )}

                                        <div className="border-t border-slate-800 pt-3">
                                          <label className="block text-[10px] font-black uppercase text-slate-400 mb-2">Dashboard Layout</label>
                                          <div className="grid grid-cols-2 gap-2">
                                            {['Single-column', 'Dashboard Grid'].map(layout => (
                                              <button
                                                key={layout}
                                                onClick={() => setReportLayout(layout)}
                                                className={`p-2 rounded-xl text-[10px] font-bold text-center transition-all border ${
                                                  reportLayout === layout
                                                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                                                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                                                }`}
                                              >
                                                {layout}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Text Formatting Toolbar */}
                                <div className="flex items-center gap-2 w-full overflow-x-auto pb-1">
                                  {(() => {
                                    const isBold = activeEditor?.isActive?.('bold') ?? textBold;
                                    const isItalic = activeEditor?.isActive?.('italic') ?? textItalic;
                                    const isUnderline = activeEditor?.isActive?.('underline') ?? textUnderline;
                                    const isStrike = activeEditor?.isActive?.('strike') ?? false;
                                    const isHighlight = activeEditor?.isActive?.('highlight') ?? false;
                                    const isH1 = activeEditor?.isActive?.('heading', { level: 1 }) ?? false;
                                    const isH2 = activeEditor?.isActive?.('heading', { level: 2 }) ?? false;
                                    const isH3 = activeEditor?.isActive?.('heading', { level: 3 }) ?? false;
                                    const isBulletList = activeEditor?.isActive?.('bulletList') ?? false;
                                    const isOrderedList = activeEditor?.isActive?.('orderedList') ?? false;
                                    const isTaskList = activeEditor?.isActive?.('taskList') ?? false;
                                    const isBlockquote = activeEditor?.isActive?.('blockquote') ?? false;
                                    const isCodeBlock = activeEditor?.isActive?.('codeBlock') ?? false;
                                    const isSubscript = activeEditor?.isActive?.('subscript') ?? false;
                                    const isSuperscript = activeEditor?.isActive?.('superscript') ?? false;
                                    const isLink = activeEditor?.isActive?.('link') ?? false;
                                    const isTable = activeEditor?.isActive?.('table') ?? false;
                                    const currentAlign = activeEditor ?
                                      (activeEditor?.isActive?.({ textAlign: 'center' }) ? 'center' :
                                        activeEditor?.isActive?.({ textAlign: 'right' }) ? 'right' :
                                          activeEditor?.isActive?.({ textAlign: 'justify' }) ? 'justify' : 'left') : textAlign;

                                    return (
                                      <div className="flex flex-wrap items-center gap-2">
                                        {/* Font Family, Size & Color */}
                                        <div className="flex items-center gap-2 bg-slate-800/80 p-1 px-2.5 rounded-xl border border-slate-700 text-xs text-slate-300 shadow-md">
                                          <select
                                            value={fontFamily}
                                            onChange={e => {
                                              const val = e.target.value;
                                              setFontFamily(val);
                                              if (activeEditor) {
                                                activeEditor.chain().focus().setFontFamily(val).run();
                                              } else {
                                                applyInlineStyle('fontFamily', val);
                                              }
                                            }}
                                            className="bg-transparent border-none outline-none cursor-pointer py-1 font-bold text-white font-sans max-w-[140px] truncate"
                                            title="Select Font Family (45+ options)"
                                          >
                                            {FONT_OPTIONS.map((fOpt, fIdx) => (
                                              <option key={fIdx} value={fOpt} className="bg-slate-800 text-white" style={{ fontFamily: fOpt }}>
                                                {fOpt.split(',')[0]}
                                              </option>
                                            ))}
                                          </select>
                                          <div className="w-px h-4 bg-slate-700"></div>
                                          <div className="flex items-center gap-1.5 text-white">
                                            <span className="text-slate-400 font-mono text-[10px]">Size:</span>
                                            <input
                                              type="number"
                                              min="5"
                                              max="70"
                                              value={fontSize}
                                              onChange={e => {
                                                const val = Number(e.target.value);
                                                setFontSize(val);
                                                if (val >= 5 && val <= 70) {
                                                  if (activeEditor) {
                                                    activeEditor.chain().focus().setFontSize(`${val}px`).run();
                                                  } else {
                                                    applyInlineStyle('fontSize', `${val}px`);
                                                  }
                                                }
                                              }}
                                              className="w-11 bg-transparent text-white font-bold outline-none border-none text-center focus:bg-slate-700 rounded"
                                              title="Font Size (5px - 70px)"
                                            />
                                            <span className="text-slate-400 font-mono text-[10px]">px</span>
                                            <input
                                              type="range"
                                              min="5"
                                              max="70"
                                              value={fontSize}
                                              onChange={e => {
                                                const val = Number(e.target.value);
                                                setFontSize(val);
                                                if (activeEditor) {
                                                  activeEditor.chain().focus().setFontSize(`${val}px`).run();
                                                } else {
                                                  applyInlineStyle('fontSize', `${val}px`);
                                                }
                                              }}
                                              className="w-16 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded"
                                              title="Drag slider to adjust font size (5px - 70px)"
                                            />
                                          </div>
                                          <div className="w-px h-4 bg-slate-700"></div>
                                          <div className="flex items-center gap-1.5">
                                            <Palette size={14} className="text-slate-400" />
                                            <input
                                              type="color"
                                              value={textColor}
                                              onChange={e => {
                                                const val = e.target.value;
                                                setTextColor(val);
                                                if (activeEditor) {
                                                  activeEditor.chain().focus().setColor(val).run();
                                                }
                                              }}
                                              className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent p-0"
                                              title="Choose Text Color"
                                            />
                                          </div>
                                        </div>

                                        {/* Headings */}
                                        <div className="flex items-center gap-0.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs shadow-md">
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleHeading({ level: 1 }).run() : null}
                                            className={`px-2 py-1 font-black rounded ${isH1 ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
                                            title="Heading 1"
                                          >H1</button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleHeading({ level: 2 }).run() : null}
                                            className={`px-2 py-1 font-bold rounded ${isH2 ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
                                            title="Heading 2"
                                          >H2</button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleHeading({ level: 3 }).run() : null}
                                            className={`px-2 py-1 font-semibold rounded ${isH3 ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
                                            title="Heading 3"
                                          >H3</button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().setParagraph().run() : null}
                                            className={`px-2 py-1 rounded ${!isH1 && !isH2 && !isH3 ? 'bg-indigo-600 text-white shadow' : 'text-slate-300 hover:bg-slate-700'}`}
                                            title="Normal Paragraph"
                                          >P</button>
                                        </div>

                                        {/* Inline Marks */}
                                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-md">
                                          <button
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                              if (activeEditor) {
                                                activeEditor.chain().focus().toggleBold().run();
                                              } else {
                                                setTextBold(!textBold);
                                                applyInlineStyle('fontWeight', !textBold ? 'bold' : 'normal');
                                              }
                                            }}
                                            className={`p-2 rounded-lg transition-all ${isBold ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Bold (Ctrl+B)"
                                          ><Bold size={15} /></button>
                                          <button
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                              if (activeEditor) {
                                                activeEditor.chain().focus().toggleItalic().run();
                                              } else {
                                                setTextItalic(!textItalic);
                                                applyInlineStyle('fontStyle', !textItalic ? 'italic' : 'normal');
                                              }
                                            }}
                                            className={`p-2 rounded-lg transition-all ${isItalic ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Italic (Ctrl+I)"
                                          ><Italic size={15} /></button>
                                          <button
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                              if (activeEditor) {
                                                activeEditor.chain().focus().toggleUnderline().run();
                                              } else {
                                                setTextUnderline(!textUnderline);
                                                applyInlineStyle('textDecoration', !textUnderline ? 'underline' : 'none');
                                              }
                                            }}
                                            className={`p-2 rounded-lg transition-all ${isUnderline ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Underline (Ctrl+U)"
                                          ><Underline size={15} /></button>
                                          <button
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                              if (activeEditor) {
                                                activeEditor.chain().focus().toggleStrike().run();
                                              }
                                            }}
                                            className={`p-2 rounded-lg transition-all ${isStrike ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Strikethrough"
                                          ><Strikethrough size={15} /></button>
                                          <button
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                              if (activeEditor) {
                                                activeEditor.chain().focus().toggleHighlight({ color: '#fef08a' }).run();
                                              } else {
                                                applyInlineStyle('backgroundColor', '#fef08a');
                                              }
                                            }}
                                            className={`p-2 rounded-lg transition-all ${isHighlight ? 'bg-yellow-300 text-slate-900 shadow-md font-bold' : 'text-slate-300 hover:bg-slate-700 hover:text-yellow-300'}`} title="Highlight Selected Text"
                                          ><Highlighter size={15} /></button>
                                        </div>

                                        {/* Lists, Quote, Code & Tasks */}
                                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-md">
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleBulletList().run() : null}
                                            className={`p-2 rounded-lg transition-all ${isBulletList ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Bullet List"
                                          ><List size={15} /></button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleOrderedList().run() : null}
                                            className={`p-2 rounded-lg transition-all ${isOrderedList ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Numbered List"
                                          ><ListOrdered size={15} /></button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleTaskList().run() : null}
                                            className={`p-2 rounded-lg transition-all ${isTaskList ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Interactive Checklist / Task List"
                                          ><CheckSquare size={15} /></button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleBlockquote().run() : null}
                                            className={`p-2 rounded-lg transition-all ${isBlockquote ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Blockquote"
                                          ><Quote size={15} /></button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleCodeBlock().run() : null}
                                            className={`p-2 rounded-lg transition-all ${isCodeBlock ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Code Block"
                                          ><Code size={15} /></button>
                                        </div>

                                        {/* Subscript, Superscript & Link */}
                                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-md">
                                          <button
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleSubscript().run() : null}
                                            className={`p-2 rounded-lg transition-all ${isSubscript ? 'bg-indigo-600 text-white shadow-md font-bold text-xs' : 'text-slate-300 hover:bg-slate-700 font-bold text-xs'}`} title="Subscript"
                                          ><Subscript size={15} /></button>
                                          <button
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => activeEditor ? activeEditor.chain().focus().toggleSuperscript().run() : null}
                                            className={`p-2 rounded-lg transition-all ${isSuperscript ? 'bg-indigo-600 text-white shadow-md font-bold text-xs' : 'text-slate-300 hover:bg-slate-700 font-bold text-xs'}`} title="Superscript"
                                          ><Superscript size={15} /></button>
                                          <button
                                            onMouseDown={e => e.preventDefault()}
                                            onClick={() => {
                                              if (activeEditor) {
                                                if (isLink) {
                                                  activeEditor.chain().focus().unsetLink().run();
                                                } else {
                                                  const url = window.prompt('Enter Hyperlink URL (e.g. https://google.com):');
                                                  if (url) {
                                                    activeEditor.chain().focus().setLink({ href: url }).run();
                                                  }
                                                }
                                              }
                                            }}
                                            className={`p-2 rounded-lg transition-all ${isLink ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Insert / Remove Hyperlink"
                                          ><Link size={15} /></button>
                                        </div>

                                        {/* Tables */}
                                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-md">
                                          <button
                                            onClick={() => {
                                              if (activeEditor) {
                                                activeEditor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
                                              }
                                            }}
                                            className="p-2 rounded-lg transition-all text-slate-300 hover:bg-slate-700" title="Insert 3x3 Table"
                                          ><Table size={15} /></button>
                                          {activeEditor && (activeEditor?.can?.()?.addColumnAfter?.() ?? false) && (
                                            <>
                                              <button
                                                onClick={() => activeEditor?.chain().focus().addColumnAfter().run()}
                                                className="p-1 px-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-indigo-300 transition-all shadow" title="Insert Column Right"
                                              >+Col</button>
                                              <button
                                                onClick={() => activeEditor?.chain().focus().addRowAfter().run()}
                                                className="p-1 px-2 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-indigo-300 transition-all shadow" title="Insert Row Below"
                                              >+Row</button>
                                              <button
                                                onClick={() => activeEditor?.chain().focus().deleteTable().run()}
                                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 hover:text-red-300 transition-all shadow" title="Delete Table"
                                              ><Trash size={14} /></button>
                                            </>
                                          )}
                                        </div>

                                        {/* Alignment */}
                                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-md">
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().setTextAlign('left').run() : setTextAlign('left')}
                                            className={`p-2 rounded-lg transition-all ${currentAlign === 'left' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Align Left"
                                          ><AlignLeft size={15} /></button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().setTextAlign('center').run() : setTextAlign('center')}
                                            className={`p-2 rounded-lg transition-all ${currentAlign === 'center' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Align Center"
                                          ><AlignCenter size={15} /></button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().setTextAlign('right').run() : setTextAlign('right')}
                                            className={`p-2 rounded-lg transition-all ${currentAlign === 'right' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Align Right"
                                          ><AlignRight size={15} /></button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().setTextAlign('justify').run() : setTextAlign('justify')}
                                            className={`p-2 rounded-lg transition-all ${currentAlign === 'justify' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-300 hover:bg-slate-700'}`} title="Justify Full"
                                          ><AlignJustify size={15} /></button>
                                        </div>

                                        {/* Slate Void & Advanced Embed Elements */}
                                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-md">
                                          <button
                                            onClick={() => {
                                              if (activeEditor) {
                                                const tag = window.prompt('Enter Entity Mention / Source Tag (e.g. Chief Analyst, Cerebro AI):');
                                                if (tag) {
                                                  activeEditor.chain().focus().insertContent({ type: 'mention', attrs: { id: tag } }).run();
                                                }
                                              }
                                            }}
                                            className="p-2 rounded-lg text-indigo-300 hover:bg-slate-700 hover:text-white transition-all font-bold flex items-center gap-1 text-xs" title="Insert Slate Entity Mention (@)"
                                          ><AtSign size={15} /> Tag</button>
                                          <button
                                            onClick={() => activeEditor ? activeEditor.chain().focus().setHorizontalRule().run() : null}
                                            className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 hover:text-white transition-all font-bold flex items-center gap-1 text-xs" title="Insert Horizontal Rule Divider (-)"
                                          ><Minus size={15} /> Divider</button>
                                          <button
                                            onClick={() => {
                                              if (activeEditor) {
                                                const url = window.prompt('Enter YouTube Video URL (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ):');
                                                if (url) {
                                                  activeEditor.chain().focus().setYoutubeVideo({ src: url }).run();
                                                }
                                              }
                                            }}
                                            className="p-2 rounded-lg text-red-400 hover:bg-slate-700 hover:text-red-300 transition-all font-bold flex items-center gap-1 text-xs" title="Embed YouTube Video Widget"
                                          ><Video size={15} /> Video</button>
                                        </div>

                                        {/* History & Clear */}
                                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700 shadow-md">
                                          <button
                                            onClick={() => activeEditor?.chain().focus().undo().run()}
                                            disabled={!activeEditor?.can().undo()}
                                            className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all" title="Undo (Ctrl+Z)"
                                          ><Undo size={15} /></button>
                                          <button
                                            onClick={() => activeEditor?.chain().focus().redo().run()}
                                            disabled={!activeEditor?.can().redo()}
                                            className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed transition-all" title="Redo (Ctrl+Y)"
                                          ><Redo size={15} /></button>
                                          <button
                                            onClick={() => activeEditor?.chain().focus().unsetAllMarks().clearNodes().run()}
                                            className="p-2 rounded-lg text-slate-300 hover:bg-slate-700 transition-all hover:text-red-400 font-bold" title="Clear All Formatting"
                                          ><Eraser size={15} /></button>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  <button
                                    onClick={() => {
                                      document.getElementById('local-image-upload').click();
                                    }}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all ml-2"
                                    title="Embed image from local device"
                                  >
                                    <Image size={15} /> Insert External Image
                                  </button>
                                  <input
                                    id="local-image-upload"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onload = (event) => {
                                          const url = event.target.result;
                                          const updatedSecs = [...(selectedReport.sections || [])];
                                          if (updatedSecs[activeSectionIndex]) {
                                            const currImages = updatedSecs[activeSectionIndex].images || [];
                                            const newImgObj = {
                                              id: Date.now(),
                                              url: url,
                                              width: 85,
                                              align: 'center',
                                              caption: file.name || 'Embedded Graphic Asset'
                                            };
                                            updatedSecs[activeSectionIndex] = {
                                              ...updatedSecs[activeSectionIndex],
                                              images: [...currImages, newImgObj]
                                            };
                                          }
                                          const updated = { ...selectedReport, sections: updatedSecs };
                                          setSelectedReport(updated);
                                          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                          recordHistory(`Embedded local image file "${file.name}"`, `Section ${activeSectionIndex + 1}`);
                                          alert(`Successfully embedded image into Section ${activeSectionIndex + 1}.`);
                                        };
                                        reader.readAsDataURL(file);
                                        e.target.value = '';
                                      }
                                    }}
                                  />

                                  <button
                                    onClick={() => setIsPresentView(true)}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-all ml-2"
                                    title="Enter Present View / Reader Mode"
                                  >
                                    <Eye size={15} /> Present View
                                  </button>

                                  <button
                                    onClick={() => setShowHistoryModal(true)}
                                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-700 shadow-lg active:scale-95 transition-all ml-2 cursor-pointer"
                                    title="View Document Change History & Audit Log"
                                  >
                                    <History size={15} className="text-indigo-400" /> History Log ({changeHistory.length})
                                  </button>

                                  {activeEditor && (
                                    <div className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 border border-slate-700/80 rounded-xl text-xs font-mono text-slate-300 ml-2 shadow-inner whitespace-nowrap" title="Active Section Statistics">
                                      <span className="text-indigo-400 font-bold">{activeEditor?.storage?.characterCount?.words?.() ?? 0}</span> words
                                      <span className="text-slate-500">•</span>
                                      <span className="text-indigo-400 font-bold">{activeEditor?.storage?.characterCount?.characters?.() ?? 0}</span> chars
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Interactive Horizontal Document Ruler */}
                              <div className="w-full bg-slate-950/80 rounded-xl px-4 py-2 flex items-center gap-4 border border-slate-800/80 text-[10px] font-mono text-slate-400 select-none shadow-inner">
                                <span className="font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5 shrink-0">
                                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                                  Ruler Indent Margin: <strong className="text-white">{rulerIndent}px</strong>
                                </span>
                                <input
                                  type="range"
                                  min="24"
                                  max="240"
                                  value={rulerIndent}
                                  onChange={e => setRulerIndent(Number(e.target.value))}
                                  className="w-48 accent-indigo-500 cursor-ew-resize bg-slate-800 rounded-lg h-1.5"
                                  title="Drag slider to adjust document padding stops"
                                />
                                <div className="flex-1 flex justify-between px-4 border-l border-slate-800 text-[10px] tracking-widest text-slate-500">
                                  <span>0"</span><span>1"</span><span>2"</span><span>3"</span><span>4"</span><span>5"</span><span>6"</span><span>7"</span><span>8"</span><span>9"</span><span>10"</span><span>11"</span><span>12"</span><span>13"</span><span>14"</span><span>15"</span><span>16"</span><span>17"</span><span>18"</span><span>19"</span><span>20"</span>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Continuous Spacious Landscape Canvas Spanned Full Width */}
                          <div className={`w-full bg-white min-h-[900px] flex flex-col ${fontFamily} relative pb-36 transition-all shadow-inner print:p-0 print:m-0 print:shadow-none print:bg-white`}>
                            <div className="py-16 space-y-24 print:py-0 print:space-y-16" style={{ paddingLeft: `${rulerIndent}px`, paddingRight: `${rulerIndent}px` }}>
                              {(selectedReport.sections || []).map((sec, sIdx) => (
                                <div
                                  id={`canvas-sec-${sIdx}`}
                                  key={sec.id}
                                  onClick={() => !isPresentView && setActiveSectionIndex(sIdx)}
                                  className={`p-10 rounded-3xl transition-all print:p-0 print:border-none print:shadow-none ${isPresentView ? 'border-none shadow-none p-0' : activeSectionIndex === sIdx ? 'bg-slate-50/70 border border-indigo-300 shadow-2xl ring-4 ring-indigo-500/10' : 'border border-transparent hover:border-slate-200'
                                    }`}
                                >
                                  {isPresentView ? (
                                    <div className="max-w-5xl mx-auto print:max-w-none mb-12" style={{ fontFamily: fontFamily }}>
                                      <h1 className="text-4xl font-black tracking-tight text-slate-900 text-center mb-8 pb-6 border-b border-slate-200/80">{sec.title.replace(/^\d+\.\s*/, '')}</h1>
                                    </div>
                                  ) : (
                                    <div className="text-center mb-12 relative pb-8 border-b border-slate-200/80">
                                      <div className="flex items-center justify-center gap-3 mb-4 font-sans">
                                        <span className="px-3 py-1 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                          Section {sIdx + 1}
                                        </span>
                                        {activeSectionIndex === sIdx && (
                                          <span className="px-2.5 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse font-mono">
                                            Active Edit Focus
                                          </span>
                                        )}
                                      </div>
                                      <input
                                        type="text"
                                        value={sec.title.replace(/^\d+\.\s*/, '')}
                                        onChange={(e) => {
                                          const newTitle = `${sIdx + 1}. ${e.target.value}`;
                                          const updatedSecs = [...selectedReport.sections];
                                          updatedSecs[sIdx] = {
                                            ...updatedSecs[sIdx],
                                            title: newTitle
                                          };
                                          const updated = { ...selectedReport, sections: updatedSecs };
                                          setSelectedReport(updated);
                                          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                        }}
                                        onBlur={(e) => recordHistory(`Updated title of Section ${sIdx + 1} to "${e.target.value}"`, `Section ${sIdx + 1}`)}
                                        className="text-4xl font-normal tracking-tight text-slate-900 text-center w-full outline-none focus:ring-0 pb-2 border-b border-transparent hover:border-slate-300 focus:border-indigo-500 transition-colors bg-transparent"
                                        style={{ fontFamily: fontFamily }}
                                        placeholder="Enter Section Title..."
                                      />
                                    </div>
                                  )}

                                  <div className="relative font-sans clearfix min-h-[400px]">
                                    {/* Floated Integrated Charts */}
                                    {(() => {
                                      const chartItems = (sec.charts || []).map((chart, cIdx) => {
                                        const config = chartConfigs[chart.id] || chart.config || {
                                        type: chart.type || 'Bar Chart',
                                        field: chart.field || 'Total Mentions',
                                        groupBy: 'Brand',
                                        sort: 'Descending',
                                        maxItems: 'All'
                                      };
                                        const isDashboard = reportLayout === 'Dashboard Grid';
                                        
                                        const styleObj = isDashboard ? {
                                          width: '100%',
                                          transform: 'none',
                                          zIndex: activeConfigChartId === chart.id ? 40 : 1
                                        } : {
                                          width: `${typeof chart.width === 'number' ? chart.width : chart.width === 'full' ? 100 : 85}%`,
                                          transform: `translate3d(${chart.position?.x || 0}px, ${chart.position?.y || 0}px, 0)`,
                                          zIndex: (chart.position?.x || chart.position?.y || chartDragState?.chartId === chart.id) ? 35 : (activeConfigChartId === chart.id ? 40 : 1)
                                        };

                                        const cardBg = reportTheme === 'Corporate Dark' ? 'bg-slate-900 border-slate-850 text-slate-100' : 'bg-white border-slate-200/80 text-slate-900';
                                        const textMuted = reportTheme === 'Corporate Dark' ? 'text-slate-400' : 'text-slate-500';
                                        const labelColor = reportTheme === 'Corporate Dark' ? 'text-slate-350' : 'text-slate-755';

                                        const classStr = `${cardBg} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 relative group print:shadow-none print:border-none ` + (isDashboard
                                          ? "w-full block"
                                          : `${chart.align === 'left' ? 'mr-8 mb-6 float-left' : chart.align === 'right' ? 'ml-8 mb-6 float-right' : 'mx-auto mb-8 clear-both block'}`);

                                        const currentBrandColors = [...BRAND_COLORS];
                                        if (reportTheme === 'Branded') {
                                          currentBrandColors[0] = brandedPrimaryColor;
                                        }

                                        return (
                                          <div
                                            key={chart.id}
                                            style={styleObj}
                                            className={classStr}
                                          >
                                            {/* Chart Customization & Drag Top Toolbar */}
                                            {!isPresentView && (
                                              <>
                                                {!isDashboard && (
                                                  <div
                                                    className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-slate-900 text-white rounded-full shadow-lg flex items-center gap-2 cursor-grab active:cursor-grabbing text-[11px] font-bold z-30 opacity-80 hover:opacity-100 transition-opacity"
                                                    title="Drag to reposition chart anywhere on canvas"
                                                    onMouseDown={(e) => {
                                                      e.preventDefault();
                                                      setChartDragState({
                                                        chartId: chart.id,
                                                        sIdx,
                                                        cIdx,
                                                        startX: e.clientX,
                                                        startY: e.clientY,
                                                        initX: chart.position?.x || 0,
                                                        initY: chart.position?.y || 0
                                                      });
                                                    }}
                                                  >
                                                    <Move size={12} className="animate-bounce" />
                                                    <span>Drag Chart</span>
                                                    {(chart.position?.x || chart.position?.y) ? (
                                                      <button
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          const updatedSecs = [...selectedReport.sections];
                                                          const updatedCharts = [...updatedSecs[sIdx].charts];
                                                          updatedCharts[cIdx] = { ...chart, position: { x: 0, y: 0 } };
                                                          updatedSecs[sIdx] = { ...updatedSecs[sIdx], charts: updatedCharts };
                                                          const updated = { ...selectedReport, sections: updatedSecs };
                                                          setSelectedReport(updated);
                                                          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                        }}
                                                        className="px-1.5 py-0.5 bg-red-650 hover:bg-red-500 rounded text-[9px] font-black uppercase text-white tracking-widest active:scale-95 transition-all ml-1.5 cursor-pointer shrink-0"
                                                        title="Reset custom coordinates"
                                                      >
                                                        Reset
                                                      </button>
                                                    ) : null}
                                                  </div>
                                                )}

                                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 z-30 text-xs font-bold print:hidden">
                                                  {/* Feature 2 Configuration Toggle Button */}
                                                  <button
                                                    onClick={() => {
                                                      setActiveConfigChartId(activeConfigChartId === chart.id ? null : chart.id);
                                                    }}
                                                    className={`p-1.5 rounded-lg transition-colors ${activeConfigChartId === chart.id ? 'bg-indigo-600 text-white animate-pulse' : 'hover:bg-slate-800 text-slate-350 hover:text-white'}`}
                                                    title="Configure Chart Settings"
                                                  >
                                                    <Settings size={13} />
                                                  </button>
                                                  
                                                  {!isDashboard && (
                                                    <>
                                                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider pr-1 border-r border-slate-700">
                                                        Width ({typeof chart.width === 'number' ? chart.width : chart.width === 'full' ? 100 : 85}%)
                                                      </span>
                                                      <input
                                                        type="range"
                                                        min="30"
                                                        max="100"
                                                        value={typeof chart.width === 'number' ? chart.width : chart.width === 'full' ? 100 : 85}
                                                        onChange={(e) => {
                                                          const val = Number(e.target.value);
                                                          const updatedSecs = [...selectedReport.sections];
                                                          const updatedCharts = [...updatedSecs[sIdx].charts];
                                                          updatedCharts[cIdx] = { ...chart, width: val };
                                                          updatedSecs[sIdx] = { ...updatedSecs[sIdx], charts: updatedCharts };
                                                          const updated = { ...selectedReport, sections: updatedSecs };
                                                          setSelectedReport(updated);
                                                          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                        }}
                                                        className="w-20 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded"
                                                        title="Resize Chart Width (30% - 100%)"
                                                      />

                                                      <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-1 border-x border-slate-700">Position</span>
                                                      <button
                                                        onClick={() => {
                                                          const updatedSecs = [...selectedReport.sections];
                                                          const updatedCharts = [...updatedSecs[sIdx].charts];
                                                          updatedCharts[cIdx] = { ...chart, align: 'left' };
                                                          updatedSecs[sIdx] = { ...updatedSecs[sIdx], charts: updatedCharts };
                                                          const updated = { ...selectedReport, sections: updatedSecs };
                                                          setSelectedReport(updated);
                                                          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                        }}
                                                        className={`p-1.5 rounded ${chart.align === 'left' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-300'}`} title="Float / Align Left"
                                                      >
                                                        <AlignLeft size={13} />
                                                      </button>
                                                      <button
                                                        onClick={() => {
                                                          const updatedSecs = [...selectedReport.sections];
                                                          const updatedCharts = [...updatedSecs[sIdx].charts];
                                                          updatedCharts[cIdx] = { ...chart, align: 'center' };
                                                          updatedSecs[sIdx] = { ...updatedSecs[sIdx], charts: updatedCharts };
                                                          const updated = { ...selectedReport, sections: updatedSecs };
                                                          setSelectedReport(updated);
                                                          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                        }}
                                                        className={`p-1.5 rounded ${(!chart.align || chart.align === 'center') ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-300'}`} title="Center Inline"
                                                      >
                                                        <AlignCenter size={13} />
                                                      </button>
                                                      <button
                                                        onClick={() => {
                                                          const updatedSecs = [...selectedReport.sections];
                                                          const updatedCharts = [...updatedSecs[sIdx].charts];
                                                          updatedCharts[cIdx] = { ...chart, align: 'right' };
                                                          updatedSecs[sIdx] = { ...updatedSecs[sIdx], charts: updatedCharts };
                                                          const updated = { ...selectedReport, sections: updatedSecs };
                                                          setSelectedReport(updated);
                                                          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                        }}
                                                        className={`p-1.5 rounded ${chart.align === 'right' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-300'}`} title="Float / Align Right"
                                                      >
                                                        <AlignRight size={13} />
                                                      </button>
                                                    </>
                                                  )}

                                                  <button
                                                    onClick={() => {
                                                      if (confirm(`Remove this ${chart.type}?`)) {
                                                        const updatedSecs = [...selectedReport.sections];
                                                        const updatedCharts = updatedSecs[sIdx].charts.filter((_, i) => i !== cIdx);
                                                        updatedSecs[sIdx] = { ...updatedSecs[sIdx], charts: updatedCharts };
                                                        const updated = { ...selectedReport, sections: updatedSecs };
                                                        setSelectedReport(updated);
                                                        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                      }
                                                    }}
                                                    className="p-1.5 rounded hover:bg-red-650 hover:text-white ml-2 text-red-400 transition-colors" title="Delete Chart"
                                                  >
                                                    <Trash2 size={13} />
                                                  </button>
                                                </div>
                                              </>
                                            )}

                                            {/* Feature 2 Configuration Inline Panel Popover */}
                                            {activeConfigChartId === chart.id && (
                                              <div className="absolute inset-0 bg-slate-900/95 text-white backdrop-blur-md z-45 rounded-3xl p-6 overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                                                <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-800">
                                                  <h4 className="font-black text-sm uppercase tracking-wider text-indigo-400">Chart Settings Visualizer</h4>
                                                  <button
                                                    onClick={() => setActiveConfigChartId(null)}
                                                    className="p-1.5 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"
                                                  >
                                                    <X size={15} />
                                                  </button>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 gap-4 text-xs">
                                                  <div>
                                                    <label className="block text-[10px] font-black uppercase text-slate-450 mb-1">Visual Type</label>
                                                    <select
                                                      value={chart.type}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        const updatedSecs = [...selectedReport.sections];
                                                        const updatedCharts = [...updatedSecs[sIdx].charts];
                                                        updatedCharts[cIdx] = { ...chart, type: val };
                                                        updatedSecs[sIdx] = { ...updatedSecs[sIdx], charts: updatedCharts };
                                                        const updated = { ...selectedReport, sections: updatedSecs };
                                                        setSelectedReport(updated);
                                                        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                      }}
                                                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                                    >
                                                      <option value="Bar Chart">Bar Chart</option>
                                                      <option value="Pie Chart">Pie Chart</option>
                                                      <option value="Donut Chart">Donut Chart</option>
                                                      <option value="Trend Chart">Trend Chart</option>
                                                      <option value="Area Chart">Area Chart</option>
                                                      <option value="KPI Card">KPI Card</option>
                                                    </select>
                                                  </div>

                                                  <div>
                                                    <label className="block text-[10px] font-black uppercase text-slate-450 mb-1">Data Field</label>
                                                    <select
                                                      value={chart.field}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        const updatedSecs = [...selectedReport.sections];
                                                        const updatedCharts = [...updatedSecs[sIdx].charts];
                                                        updatedCharts[cIdx] = { ...chart, field: val };
                                                        updatedSecs[sIdx] = { ...updatedSecs[sIdx], charts: updatedCharts };
                                                        const updated = { ...selectedReport, sections: updatedSecs };
                                                        setSelectedReport(updated);
                                                        setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                      }}
                                                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                                    >
                                                      <option value="Sentiment">Sentiment Analysis</option>
                                                      <option value="Publications">Publication Metrics</option>
                                                      <option value="Mentions Trend">Mentions Trend</option>
                                                      <option value="Articles Coverage">Articles Coverage</option>
                                                      <option value="Net Sentiment Index">Net Sentiment Index</option>
                                                      <option value="Media Diversity Index">Media Diversity Index</option>
                                                      <option value="Sector Penetration">Sector Penetration</option>
                                                    </select>
                                                  </div>

                                                  <div>
                                                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">Group By</label>
                                                    <select
                                                      value={config.groupBy || 'Brand'}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        setChartConfigs(prev => ({
                                                          ...prev,
                                                          [chart.id]: { ...config, groupBy: val }
                                                        }));
                                                      }}
                                                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                                    >
                                                      <option value="Brand">Brand</option>
                                                      <option value="Publication">Publication</option>
                                                      <option value="Date">Date</option>
                                                    </select>
                                                  </div>

                                                  <div>
                                                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">Sort Order</label>
                                                    <select
                                                      value={config.sort || 'Descending'}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        setChartConfigs(prev => ({
                                                          ...prev,
                                                          [chart.id]: { ...config, sort: val }
                                                        }));
                                                      }}
                                                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                                    >
                                                      <option value="Descending">Descending Value</option>
                                                      <option value="Ascending">Ascending Value</option>
                                                      <option value="Alphabetical">Alphabetical</option>
                                                    </select>
                                                  </div>

                                                  <div>
                                                    <label className="block text-[10px] font-black uppercase text-slate-455 mb-1">Max Items</label>
                                                    <select
                                                      value={config.maxItems || 'All'}
                                                      onChange={(e) => {
                                                        const val = e.target.value;
                                                        setChartConfigs(prev => ({
                                                          ...prev,
                                                          [chart.id]: { ...config, maxItems: val }
                                                        }));
                                                      }}
                                                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-indigo-500"
                                                    >
                                                      <option value="All">All Items</option>
                                                      <option value="Top 3">Top 3 Only</option>
                                                      <option value="Top 5">Top 5 Only</option>
                                                      <option value="Top 10">Top 10 Only</option>
                                                    </select>
                                                  </div>
                                                </div>

                                                {/* Conditional Formatting Section (Feature 6) */}
                                                <div className="mt-4 pt-4 border-t border-slate-800 text-xs">
                                                  <h5 className="font-bold uppercase tracking-wider text-slate-400 mb-2">Conditional Formatting Rules</h5>
                                                  
                                                  <div className="flex flex-wrap items-center gap-2 mb-3 bg-slate-850 p-3 rounded-xl border border-slate-800">
                                                    <select
                                                      id={`rule-op-${chart.id}`}
                                                      className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-[11px]"
                                                    >
                                                      <option value=">">&gt;</option>
                                                      <option value="<">&lt;</option>
                                                      <option value="==">==</option>
                                                    </select>
                                                    <input
                                                      id={`rule-val-${chart.id}`}
                                                      type="number"
                                                      placeholder="Value"
                                                      className="w-16 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-white text-[11px]"
                                                    />
                                                    <input
                                                      id={`rule-col-${chart.id}`}
                                                      type="color"
                                                      defaultValue="#6366f1"
                                                      className="w-8 h-6 bg-transparent rounded cursor-pointer"
                                                    />
                                                    <button
                                                      onClick={() => {
                                                        const op = document.getElementById(`rule-op-${chart.id}`).value;
                                                        const val = document.getElementById(`rule-val-${chart.id}`).value;
                                                        const col = document.getElementById(`rule-col-${chart.id}`).value;
                                                        if (val === '') return;
                                                        const newRule = { operator: op, value: Number(val), color: col };
                                                        setConditionalRules(prev => ({
                                                          ...prev,
                                                          [chart.id]: [...(prev[chart.id] || []), newRule]
                                                        }));
                                                        document.getElementById(`rule-val-${chart.id}`).value = '';
                                                      }}
                                                      className="px-3 py-1 bg-indigo-650 hover:bg-indigo-600 text-white rounded font-bold text-[11px]"
                                                    >
                                                      Add Rule
                                                    </button>
                                                  </div>

                                                  <div className="space-y-1 max-h-20 overflow-y-auto">
                                                    {(conditionalRules[chart.id] || []).map((rule, rIdx) => (
                                                      <div key={rIdx} className="flex justify-between items-center px-2 py-1 bg-slate-800 rounded text-white">
                                                        <span className="flex items-center gap-2">
                                                          <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: rule.color }} />
                                                          <span>Value {rule.operator} {rule.value}</span>
                                                        </span>
                                                        <button
                                                          onClick={() => {
                                                            setConditionalRules(prev => ({
                                                              ...prev,
                                                              [chart.id]: (prev[chart.id] || []).filter((_, idx) => idx !== rIdx)
                                                            }));
                                                          }}
                                                          className="text-slate-400 hover:text-red-400 transition-colors"
                                                        >
                                                          <Trash2 size={11} />
                                                        </button>
                                                      </div>
                                                    ))}
                                                  </div>
                                                </div>
                                              </div>
                                            )}

                                            {/* Chart Graphic Display Title */}
                                            <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-200/65">
                                              <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-2xl bg-indigo-50/80 text-indigo-600 flex items-center justify-center shadow-inner shrink-0">
                                                  {config.type.includes('Pie') || config.type.includes('Donut') ? <PieChart size={20} /> :
                                                    config.type.includes('Trend') || config.type.includes('Area') ? <TrendingUp size={20} /> :
                                                      config.type.includes('KPI') ? <Activity size={20} /> :
                                                        <BarChart3 size={20} />}
                                                </div>
                                                <div>
                                                  <h4 className="text-base font-black tracking-tight">{config.type}</h4>
                                                  <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Field Target: {config.field}</p>
                                                </div>
                                              </div>
                                              <div className="px-3 py-1 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-full font-mono text-xs font-black">
                                                Active Stream Sync
                                              </div>
                                            </div>

                                            {/* Visual Chart Graphic Representation */}
                                            <div className="py-8 px-6 flex flex-col items-center justify-center bg-slate-50/90 dark:bg-slate-950/40 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-inner min-h-[260px] w-full overflow-hidden">
                                              {(() => {
                                                try {
                                                  if (isFetchingTelemetry) {
                                                    return (
                                                      <div className="flex flex-col items-center justify-center space-y-3 py-12">
                                                        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Compiling Live Telemetry...</span>
                                                      </div>
                                                    );
                                                  }
                                                  if (!reportTelemetryData || !filteredBrandsObj || Object.keys(filteredBrandsObj).length === 0) {
                                                    return (
                                                      <div className="flex flex-col items-center justify-center py-12 text-center">
                                                        <Activity size={32} className="text-slate-350 mb-2 animate-pulse" />
                                                        <span className="text-xs font-bold text-slate-400">No telemetry data matching current filters.</span>
                                                      </div>
                                                    );
                                                  }

                                                  // Render KPI Card directly
                                                  if (config.type === 'KPI Card') {
                                                    const brandNames = Object.keys(filteredBrandsObj);
                                                    let valueStr = '';
                                                    let trendDirection = 'neutral';
                                                    let trendPct = '0%';
                                                    let sparklineVal = [];

                                                    const totalMentions = brandNames.reduce((s, b) => s + (Number(filteredBrandsObj[b]?.mentions) || 0), 0);
                                                    const totalArticles = brandNames.reduce((s, b) => s + (Number(filteredBrandsObj[b]?.articles) || 0), 0);

                                                    // Aggregated timeline for sparkline
                                                    const aggTimeline = {};
                                                    brandNames.forEach(b => {
                                                      Object.entries(filteredBrandsObj[b]?.timeline || {}).forEach(([dt, val]) => {
                                                        aggTimeline[dt] = (aggTimeline[dt] || 0) + val;
                                                      });
                                                    });
                                                    const sortedTimeline = Object.entries(aggTimeline).sort((a, b) => a[0].localeCompare(b[0]));
                                                    sparklineVal = sortedTimeline.map(e => e[1]);

                                                    if (config.field === 'Total Mentions') {
                                                      valueStr = totalMentions.toLocaleString();
                                                      if (sparklineVal.length >= 2) {
                                                        const diff = sparklineVal[sparklineVal.length - 1] - sparklineVal[0];
                                                        trendDirection = diff >= 0 ? 'up' : 'down';
                                                        trendPct = sparklineVal[0] > 0 ? `${Math.abs((diff / sparklineVal[0]) * 100).toFixed(0)}%` : '100%';
                                                      }
                                                    } else if (config.field === 'Total Articles') {
                                                      valueStr = totalArticles.toLocaleString();
                                                      if (sparklineVal.length >= 2) {
                                                        const diff = sparklineVal[sparklineVal.length - 1] - sparklineVal[0];
                                                        trendDirection = diff >= 0 ? 'up' : 'down';
                                                        trendPct = sparklineVal[0] > 0 ? `${Math.abs((diff / sparklineVal[0]) * 100).toFixed(0)}%` : '100%';
                                                      }
                                                    } else if (config.field === 'Net Sentiment Score') {
                                                      let pos = 0, neu = 0, neg = 0;
                                                      brandNames.forEach(b => {
                                                        pos += Number(filteredBrandsObj[b]?.sentiment?.Positive) || 0;
                                                        neu += Number(filteredBrandsObj[b]?.sentiment?.Neutral) || 0;
                                                        neg += Number(filteredBrandsObj[b]?.sentiment?.Negative) || 0;
                                                      });
                                                      const sTot = pos + neu + neg;
                                                      const nsi = sTot > 0 ? ((pos - neg) / sTot) * 100 : 0;
                                                      valueStr = `${nsi >= 0 ? '+' : ''}${nsi.toFixed(1)}%`;
                                                      trendDirection = nsi >= 0 ? 'up' : 'down';
                                                      trendPct = `${pos > 0 ? ((pos / sTot) * 100).toFixed(0) : 0}% Pos`;
                                                    } else if (config.field === 'Top Brand Share %') {
                                                      let topBrand = '';
                                                      let topMentions = 0;
                                                      brandNames.forEach(b => {
                                                        const m = Number(filteredBrandsObj[b]?.mentions) || 0;
                                                        if (m > topMentions) {
                                                          topMentions = m;
                                                          topBrand = b;
                                                        }
                                                      });
                                                      const share = totalMentions > 0 ? (topMentions / totalMentions) * 100 : 0;
                                                      valueStr = `${share.toFixed(1)}%`;
                                                      trendDirection = 'neutral';
                                                      trendPct = topBrand ? `Share of ${topBrand}` : 'N/A';
                                                    } else if (config.field === 'Media Diversity Count') {
                                                      const uniqueOutlets = new Set();
                                                      brandNames.forEach(b => {
                                                        Object.keys(filteredBrandsObj[b]?.sources || {}).forEach(src => uniqueOutlets.add(src));
                                                      });
                                                      valueStr = uniqueOutlets.size.toString();
                                                      trendDirection = 'up';
                                                      trendPct = 'Outlets';
                                                    } else {
                                                      valueStr = 'N/A';
                                                    }

                                                    const kpiColor = config.color || '#6366f1';

                                                    return (
                                                      <div className="w-full flex items-center justify-between p-2">
                                                        <div className="space-y-1">
                                                          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-widest block">{config.field}</span>
                                                          <div className="flex items-baseline gap-2.5">
                                                            <span className="text-3xl font-black tracking-tight" style={{ color: kpiColor }}>{valueStr}</span>
                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                                              trendDirection === 'up' ? 'bg-emerald-500/10 text-emerald-600' :
                                                              trendDirection === 'down' ? 'bg-red-500/10 text-red-600' : 'bg-slate-500/10 text-slate-500'
                                                            }`}>
                                                              {trendDirection === 'up' ? '↑' : trendDirection === 'down' ? '↓' : '•'} {trendPct}
                                                            </span>
                                                          </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                          {renderSparkline(sparklineVal, kpiColor)}
                                                          <span className="text-[9px] text-slate-450 font-semibold tracking-wide">Dynamic Period Trend</span>
                                                        </div>
                                                      </div>
                                                    );
                                                  }

                                                  // Preprocess chart data
                                                  const processedData = processChartData(filteredBrandsObj, config);
                                                  if (processedData.length === 0) {
                                                    return <div className="text-xs font-bold text-slate-400 py-8 text-center">No visual data generated under filters.</div>;
                                                  }

                                                  // Dynamic visual render based on type
                                                  if (config.type === 'Pie Chart' || config.type === 'Donut Chart') {
                                                    const sum = processedData.reduce((acc, curr) => acc + curr.value, 0);
                                                    let cumOffset = 25;
                                                    return (
                                                      <div className="flex flex-col sm:flex-row items-center justify-center gap-10 w-full py-4">
                                                        <div className="relative w-44 h-44 shrink-0">
                                                          <svg viewBox="0 0 32 32" className="w-full h-full transform -rotate-90">
                                                            {processedData.map((item, idx) => {
                                                              const pct = sum > 0 ? (item.value / sum) * 100 : 0;
                                                              if (pct === 0) return null;
                                                              const defaultColor = currentBrandColors[idx % currentBrandColors.length];
                                                              const color = getConditionalColor(chart.id, item.value, defaultColor);
                                                              const cur = cumOffset;
                                                              cumOffset -= pct;
                                                              return (
                                                                <circle
                                                                  key={item.name || idx}
                                                                  r="15.9154943"
                                                                  cx="16"
                                                                  cy="16"
                                                                  fill="transparent"
                                                                  stroke={color}
                                                                  strokeWidth={config.type === 'Donut Chart' ? "6" : "15.9154943"}
                                                                  strokeDasharray={`${pct} ${Math.max(0, 100 - pct)}`}
                                                                  strokeDashoffset={cur}
                                                                  className="cursor-pointer hover:opacity-80 transition-opacity"
                                                                  onClick={() => handleSegmentClick(config.groupBy === 'Brand' ? 'brand' : config.groupBy === 'Publication' ? 'publication' : 'date', item.name)}
                                                                />
                                                              );
                                                            })}
                                                          </svg>
                                                          {config.type === 'Donut Chart' && (
                                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                                              <span className="text-xl font-black">{sum.toLocaleString()}</span>
                                                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Total</span>
                                                            </div>
                                                          )}
                                                        </div>
                                                        <div className="space-y-2.5 max-w-xs w-full">
                                                          {processedData.map((item, idx) => {
                                                            const pct = sum > 0 ? ((item.value / sum) * 100).toFixed(1) : '0.0';
                                                            const defaultColor = currentBrandColors[idx % currentBrandColors.length];
                                                            const color = getConditionalColor(chart.id, item.value, defaultColor);
                                                            return (
                                                              <div
                                                                key={item.name || idx}
                                                                onClick={() => handleSegmentClick(config.groupBy === 'Brand' ? 'brand' : config.groupBy === 'Publication' ? 'publication' : 'date', item.name)}
                                                                className="flex items-center justify-between text-xs font-bold cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-1.5 rounded-lg transition-colors"
                                                              >
                                                                <div className="flex items-center gap-2 truncate pr-2">
                                                                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }}></span>
                                                                  <span className={`${labelColor} truncate`}>{item.name}</span>
                                                                </div>
                                                                <span className="font-black shrink-0">{item.value.toFixed(0)} ({pct}%)</span>
                                                              </div>
                                                            );
                                                          })}
                                                        </div>
                                                      </div>
                                                    );
                                                  }

                                                  if (config.type === 'Trend Chart' || config.type === 'Area Chart') {
                                                    const maxVal = Math.max(...processedData.map(item => item.value), 1);
                                                    return (
                                                      <div className="w-full space-y-6 py-4 px-4 max-w-2xl mx-auto">
                                                        <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-slate-200/80 px-2">
                                                          {processedData.map((item, idx) => {
                                                            const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                                                            const defaultColor = currentBrandColors[idx % currentBrandColors.length];
                                                            const color = getConditionalColor(chart.id, item.value, defaultColor);
                                                            return (
                                                              <div
                                                                key={item.name || idx}
                                                                onClick={() => handleSegmentClick(config.groupBy === 'Brand' ? 'brand' : config.groupBy === 'Publication' ? 'publication' : 'date', item.name)}
                                                                className="flex-1 flex flex-col justify-end items-center h-full group relative cursor-pointer"
                                                              >
                                                                <div className="absolute -top-10 bg-slate-900 text-white text-[10px] font-bold px-2.5 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10 shadow-lg">
                                                                  {item.name}: {item.value.toFixed(1)}
                                                                </div>
                                                                <div className="w-full max-w-[36px] h-full flex flex-col justify-end gap-0.5 rounded-t-lg overflow-hidden">
                                                                  {config.type === 'Area Chart' ? (
                                                                    <div
                                                                      style={{ height: `${pct}%`, backgroundColor: color }}
                                                                      className="w-full opacity-80 hover:opacity-100 transition-opacity"
                                                                    />
                                                                  ) : (
                                                                    <div
                                                                      style={{ height: `${pct}%`, backgroundColor: color }}
                                                                      className="w-full hover:brightness-110 transition-all rounded-t"
                                                                    />
                                                                  )}
                                                                </div>
                                                                <span className="text-[9px] font-bold text-slate-400 mt-2 transform -rotate-45 origin-top-left max-w-[55px] truncate block">
                                                                  {item.name}
                                                                </span>
                                                              </div>
                                                            );
                                                          })}
                                                        </div>
                                                      </div>
                                                    );
                                                  }

                                                  // Default / Bar Chart rendering
                                                  const maxVal = Math.max(...processedData.map(item => item.value), 1);
                                                  return (
                                                    <div className="space-y-3.5 w-full max-w-xl mx-auto py-4">
                                                      {processedData.map((item, idx) => {
                                                        const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
                                                        const defaultColor = currentBrandColors[idx % currentBrandColors.length];
                                                        const color = getConditionalColor(chart.id, item.value, defaultColor);
                                                        return (
                                                          <div
                                                            key={item.name || idx}
                                                            onClick={() => handleSegmentClick(config.groupBy === 'Brand' ? 'brand' : config.groupBy === 'Publication' ? 'publication' : 'date', item.name)}
                                                            className="space-y-1 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-xl transition-all"
                                                          >
                                                            <div className="flex justify-between text-xs font-bold">
                                                              <span className={labelColor}>{item.name}</span>
                                                              <span style={{ color }}>{item.value.toFixed(1)}</span>
                                                            </div>
                                                            <div className="h-3.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                                                              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }}></div>
                                                            </div>
                                                          </div>
                                                        );
                                                      })}
                                                    </div>
                                                  );
                                                } catch (renderError) {
                                                  console.error('Error rendering telemetry widget:', renderError);
                                                  return (
                                                    <div className="text-xs font-bold text-red-500 py-8 text-center">
                                                      Visualization failed to render. Please check dataset metrics.
                                                    </div>
                                                  );
                                                }
                                              })()}
                                            </div>

                                            <div className="mt-4 text-center">
                                              <span className={`text-xs font-serif italic ${textMuted}`}>
                                                Figure {cIdx + 1}: Data mapping detailing cross-platform amplification vectors for {config.field}.
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      });
                                      if (reportLayout === 'Dashboard Grid') {
                                        return <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">{chartItems}</div>;
                                      }
                                      return chartItems;
                                    })()}

                                    {/* Floated Embedded External Images */}
                                    {sec.images && sec.images.map((imgItem, imgIdx) => {
                                      const imgObj = typeof imgItem === 'string'
                                        ? { id: imgIdx, url: imgItem, width: 85, align: 'center', caption: `External Graphic Asset #${imgIdx + 1}` }
                                        : imgItem;

                                      return (
                                        <div
                                          key={imgObj.id || imgIdx}
                                          style={{ width: `${imgObj.width || 85}%` }}
                                          className={`relative group bg-slate-50/90 rounded-3xl p-6 border border-slate-200 shadow-xl transition-all duration-300 print:border-none print:shadow-none print:bg-transparent ${imgObj.align === 'left' ? 'mr-8 mb-6 float-left' : imgObj.align === 'right' ? 'ml-8 mb-6 float-right' : 'mx-auto mb-8 clear-both block'
                                            }`}
                                        >
                                          {!isPresentView && (
                                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/95 text-white backdrop-blur-md px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 z-20 text-xs font-bold print:hidden">
                                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider pr-1 border-r border-slate-700">Width ({imgObj.width || 85}%)</span>
                                              <input
                                                type="range"
                                                min="20"
                                                max="100"
                                                value={imgObj.width || 85}
                                                onChange={(e) => {
                                                  const val = Number(e.target.value);
                                                  const updatedSecs = [...selectedReport.sections];
                                                  const updatedImgs = [...updatedSecs[sIdx].images];
                                                  updatedImgs[imgIdx] = { ...imgObj, width: val };
                                                  updatedSecs[sIdx] = { ...updatedSecs[sIdx], images: updatedImgs };
                                                  const updated = { ...selectedReport, sections: updatedSecs };
                                                  setSelectedReport(updated);
                                                  setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                }}
                                                className="w-20 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded"
                                                title="Resize Image Width (20% - 100%)"
                                              />

                                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider px-1 border-x border-slate-700">Position</span>
                                              <button
                                                onClick={() => {
                                                  const updatedSecs = [...selectedReport.sections];
                                                  const updatedImgs = [...updatedSecs[sIdx].images];
                                                  updatedImgs[imgIdx] = { ...imgObj, align: 'left' };
                                                  updatedSecs[sIdx] = { ...updatedSecs[sIdx], images: updatedImgs };
                                                  const updated = { ...selectedReport, sections: updatedSecs };
                                                  setSelectedReport(updated);
                                                  setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                }}
                                                className={`p-1.5 rounded ${imgObj.align === 'left' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-300'}`} title="Float / Align Left"
                                              >
                                                <AlignLeft size={13} />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  const updatedSecs = [...selectedReport.sections];
                                                  const updatedImgs = [...updatedSecs[sIdx].images];
                                                  updatedImgs[imgIdx] = { ...imgObj, align: 'center' };
                                                  updatedSecs[sIdx] = { ...updatedSecs[sIdx], images: updatedImgs };
                                                  const updated = { ...selectedReport, sections: updatedSecs };
                                                  setSelectedReport(updated);
                                                  setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                }}
                                                className={`p-1.5 rounded ${(!imgObj.align || imgObj.align === 'center') ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-300'}`} title="Center Inline"
                                              >
                                                <AlignCenter size={13} />
                                              </button>
                                              <button
                                                onClick={() => {
                                                  const updatedSecs = [...selectedReport.sections];
                                                  const updatedImgs = [...updatedSecs[sIdx].images];
                                                  updatedImgs[imgIdx] = { ...imgObj, align: 'right' };
                                                  updatedSecs[sIdx] = { ...updatedSecs[sIdx], images: updatedImgs };
                                                  const updated = { ...selectedReport, sections: updatedSecs };
                                                  setSelectedReport(updated);
                                                  setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                }}
                                                className={`p-1.5 rounded ${imgObj.align === 'right' ? 'bg-indigo-600 text-white shadow' : 'hover:bg-slate-800 text-slate-300'}`} title="Float / Align Right"
                                              >
                                                <AlignRight size={13} />
                                              </button>

                                              <button
                                                onClick={() => {
                                                  if (confirm("Remove this embedded image?")) {
                                                    const updatedSecs = [...selectedReport.sections];
                                                    const updatedImgs = updatedSecs[sIdx].images.filter((_, i) => i !== imgIdx);
                                                    updatedSecs[sIdx] = { ...updatedSecs[sIdx], images: updatedImgs };
                                                    const updated = { ...selectedReport, sections: updatedSecs };
                                                    setSelectedReport(updated);
                                                    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                                  }
                                                }}
                                                className="p-1.5 rounded hover:bg-red-600 text-red-400 hover:text-white transition-colors ml-1"
                                                title="Delete Embedded Image"
                                              >
                                                <Trash2 size={13} />
                                              </button>
                                            </div>
                                          )}

                                          <img src={imgObj.url} alt={imgObj.caption} className="max-h-[500px] w-full rounded-2xl shadow-xl object-contain border border-slate-300 print:shadow-none bg-white p-2" />
                                          {isPresentView ? (
                                            <span className="text-xs font-mono text-slate-500 mt-3 block text-center font-bold">{imgObj.caption}</span>
                                          ) : (
                                            <input
                                              type="text"
                                              value={imgObj.caption}
                                              onChange={(e) => {
                                                const updatedSecs = [...selectedReport.sections];
                                                const updatedImgs = [...updatedSecs[sIdx].images];
                                                updatedImgs[imgIdx] = { ...imgObj, caption: e.target.value };
                                                updatedSecs[sIdx] = { ...updatedSecs[sIdx], images: updatedImgs };
                                                const updated = { ...selectedReport, sections: updatedSecs };
                                                setSelectedReport(updated);
                                                setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                              }}
                                              placeholder="Add an image caption / figure description..."
                                              className="w-full text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 text-xs font-mono text-slate-600 mt-3 outline-none pb-1 transition-colors"
                                            />
                                          )}
                                        </div>
                                      );
                                    })}

                                    {/* Sibling 3: The Rich Text Content (Flows perfectly around the floated items) */}
                                    {isPresentView ? (
                                      <div
                                        style={{ textAlign: textAlign, fontSize: `${fontSize}px`, fontFamily: fontFamily }}
                                        className={`text-slate-800 leading-[2.2] whitespace-pre-wrap ${textBold ? 'font-bold' : 'font-normal'} ${textItalic ? 'italic' : 'not-italic'} ${textUnderline ? 'underline underline-offset-4' : 'no-underline'} overflow-visible`}
                                        dangerouslySetInnerHTML={{ __html: sec.content }}
                                      />
                                    ) : (
                                      <SectionRichEditor
                                        id={`sec-editor-${sIdx}`}
                                        content={sec.content}
                                        onUpdate={(newHtml) => {
                                          const updatedSecs = [...selectedReport.sections];
                                          updatedSecs[sIdx] = {
                                            ...updatedSecs[sIdx],
                                            content: newHtml
                                          };
                                          const updated = { ...selectedReport, sections: updatedSecs };
                                          setSelectedReport(updated);
                                          setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                        }}
                                        isActiveEditor={activeSectionIndex === sIdx}
                                        onEditorStateChange={setActiveEditor}
                                        onFocus={() => setActiveSectionIndex(sIdx)}
                                        savedRangeRef={savedRangeRef}
                                        recordHistory={recordHistory}
                                        sectionTitle={sec.title}
                                        style={{ textAlign: textAlign, fontSize: `${fontSize}px`, fontFamily: fontFamily }}
                                        className="w-full min-h-[300px] outline-none text-slate-800 leading-[2.2] whitespace-pre-wrap transition-all bg-transparent p-4 rounded-2xl border border-transparent hover:border-slate-200 focus:border-indigo-300 focus:bg-slate-50/50 shadow-inner overflow-visible"
                                      />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Right Floating Actions Toolbar */}
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl border border-slate-200 p-3.5 flex flex-col gap-4 z-20 font-sans print:hidden">
                          <button
                            onClick={() => setIsRightDrawerOpen(!isRightDrawerOpen)}
                            className={`p-3 rounded-2xl transition-all relative group shadow-lg hover:scale-110 active:scale-95 ${isRightDrawerOpen ? 'bg-indigo-600 text-white shadow-indigo-600/30' : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
                              }`}
                            title="Toggle Analytics Chart Drawer"
                          >
                            {isRightDrawerOpen ? <PanelRightClose size={22} /> : <BarChart3 size={22} />}
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl font-sans">
                              {isRightDrawerOpen ? 'Close Analytics Drawer' : 'Insert Analytics Chart'}
                            </span>
                          </button>

                          <div className="w-full h-px bg-slate-200 my-1"></div>

                          <button
                            onClick={() => alert(`Successfully saved "${selectedReport.title}" to secure cloud nodes.`)}
                            className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative group shadow-sm hover:scale-105 active:scale-95"
                            title="Save Changes"
                          >
                            <Check size={22} />
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl font-sans">
                              Save Changes
                            </span>
                          </button>

                          <button
                            onClick={() => window.print()}
                            className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative group shadow-sm hover:scale-105 active:scale-95"
                            title="Download Report Briefing"
                          >
                            <Download size={22} />
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl font-sans">
                              Download Briefing
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              alert(`Generating shareable secure node link for team collaboration...`);
                            }}
                            className="p-3 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative group shadow-sm hover:scale-105 active:scale-95"
                            title="Share Collaboration Node"
                          >
                            <Share2 size={22} />
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl font-sans">
                              Share Node
                            </span>
                          </button>

                          <button
                            onClick={() => {
                              const aiText = "\n\n[AI Amplification]: Autonomous telemetry confirms market consolidation across tracked brand keywords. Consumer engagement elasticity remains highly correlated with proactive release intervals.";
                              const updatedSecs = [...(selectedReport.sections || [])];
                              if (updatedSecs[activeSectionIndex]) {
                                updatedSecs[activeSectionIndex] = {
                                  ...updatedSecs[activeSectionIndex],
                                  content: updatedSecs[activeSectionIndex].content + aiText
                                };
                              }
                              const updated = { ...selectedReport, sections: updatedSecs };
                              setSelectedReport(updated);
                              setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                            }}
                            className="p-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-2xl transition-all relative group shadow-md hover:scale-110 active:scale-95"
                            title="AI Copilot Write"
                          >
                            <Sparkles size={22} className="animate-pulse" />
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl font-sans">
                              AI Copilot Expand
                            </span>
                          </button>

                          <div className="w-full h-px bg-slate-200 my-2"></div>

                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to delete this entire briefing document?`)) {
                                setReports(prev => prev.filter(r => r.id !== selectedReport.id));
                                setSelectedReport(null);
                              }
                            }}
                            className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all relative group hover:scale-105 active:scale-95"
                            title="Delete Report"
                          >
                            <Trash2 size={22} />
                            <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl font-sans">
                              Delete Report
                            </span>
                          </button>
                        </div>

                        {/* Fixed Bottom-Right Action Buttons */}
                        <div className="fixed bottom-6 right-8 z-50 flex items-center gap-3 font-sans print:hidden">
                          <button
                            onClick={() => window.print()}
                            className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-2.5 active:scale-95 transition-all border border-indigo-500/30"
                          >
                            <Download size={18} /> Download Report
                          </button>
                          <button
                            onClick={() => alert(`Generating shareable secure node link for ${selectedReport.title}...`)}
                            className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl flex items-center gap-2.5 active:scale-95 transition-all border border-slate-700/80"
                          >
                            <Share2 size={18} /> Share Report
                          </button>
                        </div>

                        {/* Right Drawer Panel (Analytics & Chart Insertion Suite) */}
                        {isRightDrawerOpen && (
                          <div className="w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-500 shrink-0 font-sans">
                            <div className="p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center font-bold">
                                  <BarChart3 size={18} />
                                </div>
                                <div>
                                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-100">Analytics Widget</h3>
                                  <p className="text-[10px] text-slate-400 font-medium">Telemetry Visualization Builder</p>
                                </div>
                              </div>
                              <button
                                onClick={() => setIsRightDrawerOpen(false)}
                                className="p-2 text-slate-400 hover:text-white rounded-full transition-colors"
                              >
                                <X size={18} />
                              </button>
                            </div>

                            {/* Tab Bar Selector */}
                            <div className="flex border-b border-slate-200 shrink-0 bg-slate-50">
                              <button
                                onClick={() => setStudioDrawerTab('builder')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 text-center ${studioDrawerTab === 'builder'
                                  ? 'border-indigo-600 text-indigo-600 bg-white font-black'
                                  : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-100/50'
                                  }`}
                              >
                                Chart Builder
                              </button>
                              <button
                                onClick={() => setStudioDrawerTab('keyword-charts')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 text-center ${studioDrawerTab === 'keyword-charts'
                                  ? 'border-indigo-600 text-indigo-600 bg-white font-black'
                                  : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-100/50'
                                  }`}
                              >
                                Keyword Charts
                              </button>
                              <button
                                onClick={() => setStudioDrawerTab('ai-builder')}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-wider transition-all border-b-2 text-center ${studioDrawerTab === 'ai-builder'
                                  ? 'border-indigo-600 text-indigo-600 bg-white font-black'
                                  : 'border-transparent text-slate-500 hover:text-slate-950 hover:bg-slate-100/50'
                                  }`}
                              >
                                Build with AI
                              </button>
                            </div>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                              {studioDrawerTab === 'builder' ? (
                                <>
                                  {/* Chart Type Selection */}
                                  <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3">
                                      1. Select Chart Type
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                      {['Bar Chart', 'Pie Chart', 'Area Chart', 'Trend Chart', 'Radar Chart', 'Scatter Plot', 'Donut Chart'].map(type => (
                                        <button
                                          key={type}
                                          onClick={() => setSelectedChartType(type)}
                                          className={`p-3.5 rounded-2xl text-xs font-bold transition-all text-left flex items-center gap-2.5 border ${selectedChartType === type
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/30 scale-[1.02]'
                                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                                            }`}
                                        >
                                          <span className={`w-2 h-2 rounded-full ${selectedChartType === type ? 'bg-white shadow' : 'bg-indigo-600'}`}></span>
                                          {type}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Data Field Selection */}
                                  <div>
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-3">
                                      2. Select Target Data Field
                                    </label>
                                    <div className="flex flex-wrap gap-2.5">
                                      {['Sentiment', 'Publications', 'Journalists', 'Reach Index', 'Share of Voice'].map(field => (
                                        <button
                                          key={field}
                                          onClick={() => setSelectedDataField(field)}
                                          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${selectedDataField === field
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]'
                                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                            }`}
                                        >
                                          {field}
                                        </button>
                                      ))}
                                    </div>
                                  </div>

                                  <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 text-xs text-indigo-900 space-y-1">
                                    <span className="font-black uppercase tracking-wider block text-[10px] text-indigo-600">Widget Preview Spec</span>
                                    <p className="font-medium text-slate-600 leading-relaxed">
                                      Ready to embed <strong className="text-indigo-900">{selectedChartType}</strong> monitoring <strong className="text-indigo-900">{selectedDataField}</strong> metrics into Section {activeSectionIndex + 1}.
                                    </p>
                                  </div>
                                </>
                              ) : studioDrawerTab === 'keyword-charts' ? (
                                /* Keyword Charts Tab Content */
                                <div className="space-y-6">
                                  {/* Header Info */}
                                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-[11px] text-slate-600 shadow-sm">
                                    <div className="flex justify-between items-center mb-2.5 border-b border-slate-200/60 pb-1.5">
                                      <span className="font-black uppercase tracking-wider block text-[9px] text-indigo-600">Active Telemetry Context</span>
                                      {isEditingReportContext ? (
                                        <div className="flex gap-2">
                                          <button
                                            onClick={() => {
                                              const updated = {
                                                ...selectedReport,
                                                topic: editReportTopic,
                                                keywords: editReportKeywords
                                              };
                                              setSelectedReport(updated);
                                              setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                              setIsEditingReportContext(false);
                                            }}
                                            className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-black uppercase hover:bg-indigo-700 transition-all shadow-sm"
                                          >
                                            Save
                                          </button>
                                          <button
                                            onClick={() => setIsEditingReportContext(false)}
                                            className="px-2 py-0.5 bg-slate-200 text-slate-600 rounded text-[9px] font-black uppercase hover:bg-slate-300 transition-all shadow-sm"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      ) : (
                                        <button
                                          onClick={() => {
                                            setEditReportTopic(selectedReport?.topic || 'All');
                                            setEditReportKeywords(selectedReport?.keywords || '');
                                            setIsEditingReportContext(true);
                                          }}
                                          className="text-indigo-600 hover:text-indigo-800 text-[9px] font-black uppercase transition-colors"
                                        >
                                          Edit Settings
                                        </button>
                                      )}
                                    </div>

                                    {isEditingReportContext ? (
                                      <div className="space-y-3 pt-1">
                                        <div>
                                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Target Sector / Topic</label>
                                          <select
                                            value={editReportTopic}
                                            onChange={(e) => setEditReportTopic(e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs font-bold text-slate-900 focus:outline-none shadow-sm"
                                          >
                                            <option value="All">All Sectors</option>
                                            <option value="AI">Artificial Intelligence</option>
                                            <option value="STARTUP">Startup & Venture Capital</option>
                                            <option value="CONSULTANCY">Consultancy & Strategy</option>
                                            <option value="FINANCE">Finance & Markets</option>
                                            <option value="TECHNOLOGY">Technology & Hardware</option>
                                            <option value="HEALTHCARE">Healthcare & Medicine</option>
                                            <option value="EDUCATION">Education & Academia</option>
                                            <option value="ENERGY">Energy & Renewables</option>
                                            <option value="RETAIL">Retail & E-Commerce</option>
                                            <option value="MEDIA">Media & Journalism</option>
                                            <option value="AUTOMOTIVE">Automotive & EV</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="text-[9px] font-black uppercase tracking-wider text-slate-400 block mb-1">Target Keywords</label>
                                          <input
                                            type="text"
                                            value={editReportKeywords}
                                            onChange={(e) => setEditReportKeywords(e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-250 rounded-lg text-xs font-bold text-slate-900 focus:outline-none placeholder-slate-400 shadow-sm"
                                            placeholder="e.g. Google, Anthropic"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="font-bold text-slate-800 flex flex-col gap-1">
                                        <div><span className="text-slate-400">Sector/Topic:</span> {selectedReport?.topic || 'All'}</div>
                                        <div><span className="text-slate-400">Keywords:</span> {selectedReport?.keywords || 'None specified'}</div>
                                        {(selectedReport?.brandKeywords || selectedReport?.competitorKeywords) && (
                                          <div className="text-[10px] text-slate-500 font-medium mt-1">
                                            Base scope: ({[selectedReport?.brandKeywords, selectedReport?.competitorKeywords].filter(Boolean).join(', ')})
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {isFetchingTelemetry ? (
                                    <div className="flex flex-col items-center justify-center space-y-3 py-16">
                                      <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
                                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">Compiling Live Telemetry...</span>
                                    </div>
                                  ) : (!reportTelemetryData || !reportTelemetryData.brands || Object.keys(reportTelemetryData.brands).length === 0) ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-200 rounded-3xl p-6">
                                      <Activity size={32} className="text-indigo-500 mb-2 animate-pulse" />
                                      <span className="text-xs font-black text-slate-700 uppercase tracking-wider">No Telemetry Available</span>
                                      <span className="text-[10px] text-slate-400 font-medium mt-1.5 leading-relaxed">
                                        Please ensure this report has brand, competitor, or target keywords configured to pull visual telemetry metrics.
                                      </span>
                                    </div>
                                  ) : (() => {
                                    const brandsObj = reportTelemetryData.brands || {};
                                    const brandNames = Object.keys(brandsObj);
                                    const totalMentions = brandNames.reduce((s, b) => s + (Number(brandsObj[b]?.mentions) || 0), 0);

                                    // Sentiment Calculations
                                    let totalPos = 0, totalNeu = 0, totalNeg = 0;
                                    brandNames.forEach(b => {
                                      const s = brandsObj[b]?.sentiment || { Positive: 0, Neutral: 0, Negative: 0 };
                                      totalPos += Number(s.Positive) || 0;
                                      totalNeu += Number(s.Neutral) || 0;
                                      totalNeg += Number(s.Negative) || 0;
                                    });
                                    const sTotal = totalPos + totalNeu + totalNeg;

                                    // Top Publications
                                    const pubs = (reportTelemetryData.topIndianPublications || []).slice(0, 4);

                                    const embedChartAction = (field, defaultType) => {
                                      const newChart = {
                                        id: `chart-${Date.now()}`,
                                        type: defaultType,
                                        field: field,
                                        width: 'full',
                                        align: 'center'
                                      };
                                      const updatedSecs = [...(selectedReport.sections || [])];
                                      if (updatedSecs[activeSectionIndex]) {
                                        const currentCharts = updatedSecs[activeSectionIndex].charts || [];
                                        updatedSecs[activeSectionIndex] = {
                                          ...updatedSecs[activeSectionIndex],
                                          charts: [...currentCharts, newChart]
                                        };
                                      }
                                      const updated = { ...selectedReport, sections: updatedSecs };
                                      setSelectedReport(updated);
                                      setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                      alert(`Successfully embedded ${defaultType} (${field}) into Section ${activeSectionIndex + 1}.`);
                                    };

                                    return (
                                      <div className="space-y-6">
                                        {/* Widget 1: Share of Voice */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Share of Voice</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{totalMentions} Mentions</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => embedChartAction('Share of Voice', 'Pie Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Pie Chart"
                                              >
                                                + Pie
                                              </button>
                                              <button
                                                onClick={() => embedChartAction('Share of Voice', 'Bar Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Bar Chart"
                                              >
                                                + Bar
                                              </button>
                                            </div>
                                          </div>
                                          {totalMentions > 0 ? (
                                            <div className="space-y-3">
                                              {/* Simple stacked progress bar */}
                                              <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-250/50 shadow-inner">
                                                {brandNames.map((b, idx) => {
                                                  const m = Number(brandsObj[b]?.mentions) || 0;
                                                  const pct = totalMentions > 0 ? (m / totalMentions) * 100 : 0;
                                                  if (pct === 0) return null;
                                                  return (
                                                    <div
                                                      key={b}
                                                      style={{ width: `${pct}%`, backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}
                                                      className="h-full hover:brightness-110 transition-all cursor-help"
                                                      title={`${b}: ${pct.toFixed(1)}% (${m} mentions)`}
                                                    />
                                                  );
                                                })}
                                              </div>
                                              {/* List view */}
                                              <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                                                {brandNames.map((b, idx) => {
                                                  const m = Number(brandsObj[b]?.mentions) || 0;
                                                  const pct = totalMentions > 0 ? ((m / totalMentions) * 100).toFixed(0) : '0';
                                                  return (
                                                    <div key={b} className="flex items-center gap-1.5 truncate">
                                                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }}></span>
                                                      <span className="text-slate-600 truncate">{b}</span>
                                                      <span className="text-slate-900 font-black">({pct}%)</span>
                                                    </div>
                                                  );
                                                })}
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="text-[10px] text-slate-400 italic">No brand mentions found.</p>
                                          )}
                                        </div>

                                        {/* Widget 2: Sentiment Landscape */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Sentiment Landscape</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{sTotal} Articles</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => embedChartAction('Sentiment', 'Pie Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Pie Chart"
                                              >
                                                + Pie
                                              </button>
                                              <button
                                                onClick={() => embedChartAction('Sentiment', 'Bar Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Bar Chart"
                                              >
                                                + Bar
                                              </button>
                                            </div>
                                          </div>
                                          {sTotal > 0 ? (
                                            <div className="space-y-3">
                                              <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-200">
                                                {totalPos > 0 && <div style={{ width: `${(totalPos / sTotal) * 100}%` }} className="bg-emerald-500 h-full" title={`Positive: ${((totalPos/sTotal)*100).toFixed(0)}%`} />}
                                                {totalNeu > 0 && <div style={{ width: `${(totalNeu / sTotal) * 100}%` }} className="bg-slate-450 h-full" title={`Neutral: ${((totalNeu/sTotal)*100).toFixed(0)}%`} />}
                                                {totalNeg > 0 && <div style={{ width: `${(totalNeg / sTotal) * 100}%` }} className="bg-red-500 h-full" title={`Negative: ${((totalNeg/sTotal)*100).toFixed(0)}%`} />}
                                              </div>
                                              <div className="flex justify-between text-[10px] font-bold">
                                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>Pos: {totalPos}</span>
                                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-400"></span>Neu: {totalNeu}</span>
                                                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span>Neg: {totalNeg}</span>
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="text-[10px] text-slate-400 italic">No sentiment tags calculated.</p>
                                          )}
                                        </div>

                                        {/* Widget 3: Publications */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Top Publications</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Media Outlets</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => embedChartAction('Publications', 'Pie Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Pie Chart"
                                              >
                                                + Pie
                                              </button>
                                              <button
                                                onClick={() => embedChartAction('Publications', 'Bar Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Bar Chart"
                                              >
                                                + Bar
                                              </button>
                                            </div>
                                          </div>
                                          {pubs.length > 0 ? (
                                            <div className="space-y-2.5">
                                              {pubs.map((pub, idx) => {
                                                const maxPub = Math.max(...pubs.map(p => Number(p?.count) || 0), 1);
                                                const pct = (pub.count / maxPub) * 100;
                                                return (
                                                  <div key={pub.name || idx} className="space-y-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                      <span className="text-slate-650 truncate max-w-[150px]">{pub.name}</span>
                                                      <span className="text-slate-900 font-black">{pub.count}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-slate-250/50 rounded-full overflow-hidden">
                                                      <div style={{ width: `${pct}%`, backgroundColor: BRAND_COLORS[idx % BRAND_COLORS.length] }} className="h-full rounded-full" />
                                                    </div>
                                                  </div>
                                                );
                                              })}
                                            </div>
                                          ) : (
                                            <p className="text-[10px] text-slate-400 italic">No publication mentions tracked.</p>
                                          )}
                                        </div>

                                        {/* Widget 4: Mentions Trend */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Mentions Trend</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Chronological Distribution</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => embedChartAction('Mentions Trend', 'Trend Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Trend Chart"
                                              >
                                                + Trend
                                              </button>
                                              <button
                                                onClick={() => embedChartAction('Mentions Trend', 'Area Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Area Chart"
                                              >
                                                + Area
                                              </button>
                                            </div>
                                          </div>
                                          {(() => {
                                            const datesSet = new Set();
                                            brandNames.forEach(b => Object.keys(brandsObj[b]?.timeline || {}).forEach(dt => datesSet.add(dt)));
                                            const dates = Array.from(datesSet).sort();
                                            if (dates.length === 0) return <p className="text-[10px] text-slate-400 italic">No timeline data available.</p>;
                                            const maxDt = Math.max(...dates.map(dt => brandNames.reduce((s, b) => s + (Number(brandsObj[b]?.timeline?.[dt]) || 0), 0)), 1);
                                            return (
                                              <div className="h-14 flex items-end gap-1 px-1 bg-white border border-slate-100 rounded-xl p-2 shadow-inner">
                                                {dates.slice(-10).map((dt, idx) => {
                                                  const dtTotal = brandNames.reduce((s, b) => s + (Number(brandsObj[b]?.timeline?.[dt]) || 0), 0);
                                                  const hPct = (dtTotal / maxDt) * 100;
                                                  return (
                                                    <div key={dt} className="flex-1 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors" style={{ height: `${Math.max(15, hPct)}%` }} title={`${dt}: ${dtTotal} Mentions`} />
                                                  );
                                                })}
                                              </div>
                                            );
                                          })()}
                                        </div>

                                        {/* Widget 5: Articles Coverage */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Articles Coverage</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Articles Count Share</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => embedChartAction('Articles Coverage', 'Pie Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Pie Chart"
                                              >
                                                + Pie
                                              </button>
                                              <button
                                                onClick={() => embedChartAction('Articles Coverage', 'Bar Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Bar Chart"
                                              >
                                                + Bar
                                              </button>
                                            </div>
                                          </div>
                                          {(() => {
                                            const totalArticles = brandNames.reduce((s, b) => s + (Number(brandsObj[b]?.articles) || 0), 0);
                                            if (totalArticles === 0) return <p className="text-[10px] text-slate-400 italic">No article data recorded.</p>;
                                            return (
                                              <div className="space-y-3">
                                                <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-250/50 shadow-inner">
                                                  {brandNames.map((b, idx) => {
                                                    const a = Number(brandsObj[b]?.articles) || 0;
                                                    const pct = (a / totalArticles) * 100;
                                                    if (pct === 0) return null;
                                                    return (
                                                      <div
                                                        key={b}
                                                        style={{ width: `${pct}%`, backgroundColor: BRAND_COLORS[(idx + 2) % BRAND_COLORS.length] }}
                                                        className="h-full hover:brightness-110 transition-all cursor-help"
                                                        title={`${b}: ${a} articles (${pct.toFixed(0)}%)`}
                                                      />
                                                    );
                                                  })}
                                                </div>
                                                <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
                                                  {brandNames.map((b, idx) => (
                                                    <div key={b} className="flex items-center gap-1 truncate text-slate-600">
                                                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: BRAND_COLORS[(idx + 2) % BRAND_COLORS.length] }}></span>
                                                      <span className="truncate">{b} ({brandsObj[b]?.articles || 0})</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>

                                        {/* Widget 6: Net Sentiment Index */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Net Sentiment Index</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Favorability Score benchmarks</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => embedChartAction('Net Sentiment Index', 'Bar Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Bar Chart"
                                              >
                                                + Bar
                                              </button>
                                            </div>
                                          </div>
                                          <div className="space-y-3">
                                            {brandNames.map((b, idx) => {
                                              const s = brandsObj[b]?.sentiment || { Positive: 0, Neutral: 0, Negative: 0 };
                                              const pos = Number(s.Positive) || 0;
                                              const neg = Number(s.Negative) || 0;
                                              const total = pos + (Number(s.Neutral) || 0) + neg;
                                              const netScore = total > 0 ? ((pos - neg) / total) * 100 : 0;
                                              const widthPct = Math.abs(netScore) / 2;
                                              const isPositive = netScore >= 0;
                                              return (
                                                <div key={b} className="space-y-1">
                                                  <div className="flex justify-between text-[9px] font-bold">
                                                    <span className="text-slate-700">{b}</span>
                                                    <span className={isPositive ? "text-emerald-600 font-black" : "text-red-500 font-black"}>
                                                      {isPositive ? '+' : ''}{netScore.toFixed(0)}% Net Index
                                                    </span>
                                                  </div>
                                                  <div className="h-2.5 w-full bg-slate-200/60 rounded-full relative overflow-hidden flex shadow-inner">
                                                    <div className="w-1/2 h-full border-r border-slate-350" />
                                                    <div
                                                      style={{
                                                        width: `${widthPct}%`,
                                                        left: isPositive ? '50%' : 'auto',
                                                        right: isPositive ? 'auto' : '50%',
                                                        backgroundColor: isPositive ? '#10b981' : '#ef4444'
                                                      }}
                                                      className="absolute h-full transition-all"
                                                    />
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Widget 7: Media Diversity Index */}
                                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Media Diversity Index</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Unique Media Outlet Count</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => embedChartAction('Media Diversity Index', 'Bar Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Bar Chart"
                                              >
                                                + Bar
                                              </button>
                                              <button
                                                onClick={() => embedChartAction('Media Diversity Index', 'Radar Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Radar Chart"
                                              >
                                                + Radar
                                              </button>
                                            </div>
                                          </div>
                                          <div className="space-y-3">
                                            {brandNames.map((b, idx) => {
                                              const uniqueOutlets = Object.keys(brandsObj[b]?.sources || {}).length;
                                              const maxOutlets = Math.max(...brandNames.map(name => Object.keys(brandsObj[name]?.sources || {}).length), 1);
                                              const pct = (uniqueOutlets / maxOutlets) * 100;
                                              return (
                                                <div key={b} className="space-y-1">
                                                  <div className="flex justify-between text-[9px] font-bold">
                                                    <span className="text-slate-650 truncate max-w-[180px]">{b}</span>
                                                    <span className="text-slate-900 font-black">{uniqueOutlets} outlets</span>
                                                  </div>
                                                  <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                                    <div style={{ width: `${pct}%`, backgroundColor: BRAND_COLORS[(idx + 4) % BRAND_COLORS.length] }} className="h-full rounded-full" />
                                                  </div>
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>

                                        {/* Widget 8: Sector Penetration */}
                                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 shadow-sm space-y-4">
                                          <div className="flex justify-between items-center">
                                            <div>
                                              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">Sector Penetration</h4>
                                              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Brand vs Total Sector Exposure</p>
                                            </div>
                                            <div className="flex gap-2">
                                              <button
                                                onClick={() => embedChartAction('Sector Penetration', 'Pie Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Pie Chart"
                                              >
                                                + Pie
                                              </button>
                                              <button
                                                onClick={() => embedChartAction('Sector Penetration', 'Donut Chart')}
                                                className="px-2.5 py-1 bg-white hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 rounded-lg border border-slate-200 text-[10px] font-black uppercase transition-all shadow-sm"
                                                title="Embed as Donut Chart"
                                              >
                                                + Donut
                                              </button>
                                            </div>
                                          </div>
                                          {(() => {
                                            const secTotal = Number(reportTelemetryData.totalSectorArticles) || 100;
                                            const keyTotal = Number(reportTelemetryData.totalKeywordArticles) || 0;
                                            const otherTotal = Math.max(0, secTotal - keyTotal);
                                            const pctKey = secTotal > 0 ? (keyTotal / secTotal) * 100 : 0;
                                            const pctOther = secTotal > 0 ? (otherTotal / secTotal) * 100 : 100;
                                            return (
                                              <div className="space-y-3.5">
                                                <div className="h-3 w-full rounded-full flex overflow-hidden bg-slate-200">
                                                  <div style={{ width: `${pctKey}%`, backgroundColor: '#6366f1' }} className="h-full" title={`Keywords: ${pctKey.toFixed(0)}% (${keyTotal} articles)`} />
                                                  <div style={{ width: `${pctOther}%`, backgroundColor: '#e2e8f0' }} className="h-full" title={`Sector General: ${pctOther.toFixed(0)}% (${otherTotal} articles)`} />
                                                </div>
                                                <div className="flex justify-between text-[9px] font-bold">
                                                  <span className="flex items-center gap-1 text-indigo-650 truncate max-w-[150px]"><span className="w-2 h-2 rounded-full bg-indigo-600"></span>Target Keywords ({keyTotal})</span>
                                                  <span className="flex items-center gap-1 text-slate-450 truncate max-w-[150px]"><span className="w-2 h-2 rounded-full bg-slate-300"></span>Sector Base ({otherTotal})</span>
                                                </div>
                                              </div>
                                            );
                                          })()}
                                        </div>
                                      </div>
                                    );
                                  })()}
                                </div>
                              ) : (
                                /* Build with AI Tab Content */
                                <div className="space-y-6">
                                  {/* Info Box */}
                                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 text-[11px] text-indigo-900 leading-relaxed space-y-1.5 shadow-sm">
                                    <div className="flex items-center gap-2 font-black uppercase tracking-wider text-[10px] text-indigo-700">
                                      <Sparkles size={14} className="animate-pulse" />
                                      <span>Gemini Autonomous Builder</span>
                                    </div>
                                    <p className="font-medium text-indigo-950/80">
                                      Instruct Cerebro AI to compile raw database telemetry and automatically build customized widgets.
                                    </p>
                                  </div>

                                  {/* Prompt Input */}
                                  <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block">
                                      Describe your requirements
                                    </label>
                                    <textarea
                                      rows={4}
                                      value={aiPrompt}
                                      onChange={(e) => setAiPrompt(e.target.value)}
                                      placeholder="e.g. Create a donut chart displaying Share of Voice for all brand keywords."
                                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all placeholder-slate-400 shadow-inner resize-none leading-relaxed"
                                    />
                                  </div>

                                  {/* Action Button */}
                                  <button
                                    onClick={() => {
                                      if (!aiPrompt.trim()) return;
                                      setIsAiGenerating(true);
                                      setGeneratedAiChart(null);
                                      setTimeout(() => {
                                        const promptLower = aiPrompt.toLowerCase();
                                        
                                        // Heuristic parsing
                                        let field = 'Share of Voice';
                                        if (promptLower.includes('sentiment') || promptLower.includes('feeling')) {
                                          field = 'Sentiment';
                                        } else if (promptLower.includes('publication') || promptLower.includes('media') || promptLower.includes('outlet')) {
                                          field = 'Publications';
                                        }

                                        let type = 'Pie Chart';
                                        if (promptLower.includes('bar')) {
                                          type = 'Bar Chart';
                                        } else if (promptLower.includes('trend')) {
                                          type = 'Trend Chart';
                                        } else if (promptLower.includes('area')) {
                                          type = 'Area Chart';
                                        } else if (promptLower.includes('donut')) {
                                          type = 'Donut Chart';
                                        } else if (promptLower.includes('radar')) {
                                          type = 'Radar Chart';
                                        }

                                        setGeneratedAiChart({
                                          type,
                                          field,
                                          reasoning: `AI parsed prompt and identified request to monitor "${field}" metrics using a "${type}" presentation layout.`
                                        });
                                        setIsAiGenerating(false);
                                      }, 1500);
                                    }}
                                    disabled={isAiGenerating || !aiPrompt.trim()}
                                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 active:scale-95 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:scale-100 transition-all flex items-center justify-center gap-2"
                                  >
                                    {isAiGenerating ? (
                                      <>
                                        <div className="w-4 h-4 border-2 border-indigo-200 border-t-white rounded-full animate-spin"></div>
                                        <span>Analyzing Telemetry...</span>
                                      </>
                                    ) : (
                                      <>
                                        <Sparkles size={16} />
                                        <span>Build Chart with AI</span>
                                      </>
                                    )}
                                  </button>

                                  {/* Generated Result Preview */}
                                  {generatedAiChart && (
                                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom duration-300">
                                      <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                          <span className="font-black uppercase tracking-wider block text-[9px] text-emerald-600">AI Recommendation Spec</span>
                                          <h4 className="text-xs font-black text-slate-800">{generatedAiChart.type} ({generatedAiChart.field})</h4>
                                        </div>
                                        <button
                                          onClick={() => {
                                            const newChart = {
                                              id: `chart-${Date.now()}`,
                                              type: generatedAiChart.type,
                                              field: generatedAiChart.field,
                                              width: 'full',
                                              align: 'center'
                                            };
                                            const updatedSecs = [...(selectedReport.sections || [])];
                                            if (updatedSecs[activeSectionIndex]) {
                                              const currentCharts = updatedSecs[activeSectionIndex].charts || [];
                                              updatedSecs[activeSectionIndex] = {
                                                ...updatedSecs[activeSectionIndex],
                                                charts: [...currentCharts, newChart]
                                              };
                                            }
                                            const updated = { ...selectedReport, sections: updatedSecs };
                                            setSelectedReport(updated);
                                            setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                            alert(`Successfully embedded AI Suggested ${generatedAiChart.type} into Section ${activeSectionIndex + 1}.`);
                                          }}
                                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-black uppercase transition-all shadow-sm"
                                        >
                                          Embed Chart
                                        </button>
                                      </div>
                                      
                                      <p className="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                        "{generatedAiChart.reasoning}"
                                      </p>

                                      <div className="border-t border-emerald-100 pt-3.5 space-y-2">
                                        <span className="font-black uppercase tracking-wider block text-[8px] text-slate-400">Future Gemini API Integration Stub</span>
                                        <pre className="bg-slate-900 text-slate-300 p-3 rounded-lg text-[9px] font-mono leading-normal overflow-x-auto max-h-24 custom-scrollbar">
{`// TODO: Connect to Gemini API in backend
const response = await model.generateContent({
  prompt: "${aiPrompt}",
  context: "Telemetry: Share of Voice, Sentiment, Publications"
});
const spec = JSON.parse(response.text);
// Returns: { type: "${generatedAiChart.type}", field: "${generatedAiChart.field}" }`}
                                        </pre>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>

                            {studioDrawerTab === 'builder' && (
                              <div className="p-6 bg-slate-50 border-t border-slate-200 shrink-0">
                                <button
                                  onClick={() => {
                                    const newChart = {
                                      id: `chart-${Date.now()}`,
                                      type: selectedChartType,
                                      field: selectedDataField,
                                      width: 'full',
                                      align: 'center'
                                    };
                                    const updatedSecs = [...(selectedReport.sections || [])];
                                    if (updatedSecs[activeSectionIndex]) {
                                      const currentCharts = updatedSecs[activeSectionIndex].charts || [];
                                      updatedSecs[activeSectionIndex] = {
                                        ...updatedSecs[activeSectionIndex],
                                        charts: [...currentCharts, newChart]
                                      };
                                    }
                                    const updated = { ...selectedReport, sections: updatedSecs };
                                    setSelectedReport(updated);
                                    setReports(prev => prev.map(r => r.id === updated.id ? updated : r));
                                    alert(`Successfully inserted ${selectedChartType} (${selectedDataField}) into Section ${activeSectionIndex + 1}.`);
                                  }}
                                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                  <PlusCircle size={18} /> Add Chart to Document
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Top Controls & Search */}
                        <div className="flex flex-col items-center justify-center pt-8 pb-4 gap-6">
                          <div className="flex items-center gap-3.5 cursor-pointer group" onClick={() => setShowCreateReportModal(true)}>
                            <h1 className={`text-4xl font-extrabold tracking-tight ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                              Create <span className="font-black">Report</span>
                            </h1>
                            <div className="w-10 h-10 rounded-full bg-[#3b82f6] hover:bg-blue-600 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/30 group-hover:scale-110">
                              <Plus size={20} strokeWidth={3} />
                            </div>
                          </div>
                          
                          {/* Filter Card Container */}
                           <div className={`p-4 rounded-[2rem] w-full max-w-[95%] xl:max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl border ${
                            darkMode ? 'bg-[#151f32]/90 border-white/5 shadow-black/20' : 'bg-white border-slate-100'
                          }`}>
                            <div className="flex flex-row items-center justify-center gap-3 shrink-0">
                              {['all', 'Brand Analysis', 'VS Analysis'].map(cat => {
                                const label = cat === 'all' ? 'All Intelligence' : cat;
                                const isActive = reportFilter === cat;
                                let btnStyle = "";
                                if (isActive) {
                                  if (cat === 'all') btnStyle = "bg-[#00f2fe] text-slate-900 shadow-md shadow-[#00f2fe]/20";
                                  else if (cat === 'Brand Analysis') btnStyle = "bg-[#3b82f6] text-white shadow-md shadow-blue-600/20";
                                  else btnStyle = "bg-[#7c3aed] text-white shadow-md shadow-purple-600/20";
                                } else {
                                  btnStyle = darkMode 
                                    ? "bg-transparent text-slate-400 hover:bg-white/5 border border-white/10" 
                                    : "bg-transparent text-slate-500 hover:bg-slate-100 border border-slate-200";
                                }
                                return (
                                  <button
                                    key={cat}
                                    onClick={() => setReportFilter(cat)}
                                    className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all duration-300 shrink-0 ${btnStyle}`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                            
                            <div className="relative w-full md:w-80 shrink-0">
                              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Search reports..."
                                value={reportSearch}
                                onChange={(e) => setReportSearch(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 rounded-full text-xs font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all ${
                                  darkMode 
                                    ? 'bg-slate-950/40 border border-white/5 text-white shadow-inner' 
                                    : 'bg-slate-50 border border-slate-200 text-slate-900 shadow-inner'
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Reports Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          {reports
                            .filter(rep => reportFilter === 'all' || rep.type === reportFilter)
                            .filter(rep =>
                              rep.title.toLowerCase().includes(reportSearch.toLowerCase()) ||
                              rep.tags.some(t => t.toLowerCase().includes(reportSearch.toLowerCase()))
                            )
                            .map(rep => (
                              <div
                                key={rep.id}
                                onClick={() => setSelectedReport(rep)}
                                className="group bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-lg hover:shadow-2xl hover:border-indigo-200 cursor-pointer transition-all duration-500 flex flex-col justify-between relative overflow-hidden"
                              >
                                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div>
                                  <div className="flex items-center justify-between gap-3 mb-6">
                                    <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${rep.status === 'Generated' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                                      rep.status === 'Reviewed' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                        'bg-amber-50 text-amber-600 border border-amber-200'
                                      }`}>
                                      <span className={`w-1.5 h-1.5 rounded-full ${rep.status === 'Generated' ? 'bg-emerald-500 animate-pulse' :
                                        rep.status === 'Reviewed' ? 'bg-blue-500' : 'bg-amber-500'
                                        }`}></span>
                                      {rep.status}
                                    </span>
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest uppercase bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                      {rep.date}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2 mb-3 text-indigo-600">
                                    {rep.type === 'Competitive Assessment' ? <Chrome size={18} /> :
                                      rep.type === 'Executive Briefing' ? <FileText size={18} /> : <ShieldCheck size={18} />}
                                    <span className="text-xs font-black uppercase tracking-wider text-slate-400">{rep.type}</span>
                                  </div>

                                  <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors tracking-tight leading-snug mb-3">
                                    {rep.title}
                                  </h3>

                                  <p className="text-xs font-semibold text-slate-500 line-clamp-3 leading-relaxed mb-6">
                                    {rep.summary}
                                  </p>
                                </div>

                                <div>
                                  <div className="flex flex-wrap gap-1.5 mb-6">
                                    {rep.tags?.map((t, i) => (
                                      <span key={i} className="px-3 py-1 bg-slate-50 text-slate-600 font-bold text-[10px] uppercase tracking-wider rounded-md border border-slate-100 group-hover:bg-indigo-50/50 group-hover:text-indigo-700 transition-colors duration-300">
                                        {t}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="pt-5 border-t border-slate-100 flex items-center justify-between text-xs font-black text-slate-400">
                                    <span className="flex items-center gap-2 text-indigo-600 group-hover:translate-x-1 transition-transform duration-300 font-bold uppercase text-[10px] tracking-widest">
                                      View Assessment <ArrowRight size={14} />
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          alert(`Downloading report: ${rep.title}`);
                                        }}
                                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                                        title="Download PDF"
                                      >
                                        <Download size={16} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if (confirm(`Are you sure you want to delete "${rep.title}"?`)) {
                                            setReports(prev => prev.filter(r => r.id !== rep.id));
                                          }
                                        }}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                        title="Delete Report"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : activeTab === 'help' ? (
                  <div className={`w-full ${sidebarCollapsed ? 'max-w-[1850px]' : 'max-w-[1700px]'} mx-auto h-full flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12 transition-all duration-500`}>
                    <div className="text-center max-w-2xl mx-auto mb-12">
                      <h1 className={`text-5xl tracking-tight mb-3 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        <span className="font-light">Help &</span> <span className="font-black">Support</span>
                      </h1>
                      <p className="text-slate-500 font-bold text-xs uppercase tracking-widest leading-relaxed">
                        Access the knowledge base or mail us an issue directly
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full items-start">
                      {/* Left Column: FAQ Section */}
                      <div className="bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 flex flex-col">
                        <div className="flex items-center gap-5 mb-8">
                          <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform hover:rotate-3">
                            <HelpCircle size={32} />
                          </div>
                          <div>
                            <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Frequently Asked Questions</h4>
                            <p className="text-xs font-bold text-slate-400">Quick answers to common questions</p>
                          </div>
                        </div>

                        {/* FAQ Search Bar */}
                        <div className="relative mb-6">
                          <span className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
                            <Search size={18} />
                          </span>
                          <input
                            type="text"
                            placeholder="Search FAQs..."
                            value={supportSearchQuery}
                            onChange={(e) => setSupportSearchQuery(e.target.value)}
                            className="w-full py-4 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50 transition-all shadow-sm"
                          />
                        </div>

                        {/* Accordion FAQ list */}
                        <div className="space-y-4">
                          {[
                            {
                              id: 1,
                              question: "How do I add a new brand to track?",
                              answer: "To add a brand, navigate to the 'Brand Tracker' tab and click the 'Add Brand' button in the top right. Enter the brand name (e.g. Google) and choose a region (e.g. Global or India) to begin retrieving articles."
                            },
                            {
                              id: 2,
                              question: "What are the different user roles in Cerebro?",
                              answer: "There are three primary roles: 'Maverick' (for internal employees with @themavericksindia.com emails), 'Admin' (full platform control and licensing management), and 'Individual' (external clients authenticated via unique license keys)."
                            },
                            {
                              id: 3,
                              question: "How does the reach calculation model work?",
                              answer: "Our Reach Lens runs multi-layered scrapers across Google News, RSS feeds, and Reddit discussion sub-channels. It computes estimated reader impressions using platform traffic coefficients and sentiment indexes."
                            },
                            {
                              id: 4,
                              question: "Can I generate and revoke license keys?",
                              answer: "Only users with Admin access can manage license keys. Under the 'Settings' tab, admins can generate new keys and revoke active/used keys to block linked accounts instantly."
                            },
                            {
                              id: 5,
                              question: "What do the different article sentiment tags indicate?",
                              answer: "Every parsed article is analyzed by our integrated model and categorized into Positive, Neutral, or Negative sentiment. The score reflects keyword density and structural phrasing context."
                            }
                          ]
                            .filter(faq =>
                              faq.question.toLowerCase().includes(supportSearchQuery.toLowerCase()) ||
                              faq.answer.toLowerCase().includes(supportSearchQuery.toLowerCase())
                            )
                            .map(faq => {
                              const isOpen = expandedFaqId === faq.id;
                              return (
                                <div
                                  key={faq.id}
                                  className="border border-slate-100 rounded-2xl overflow-hidden bg-white hover:border-slate-200 transition-all"
                                >
                                  <button
                                    onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                                    className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-slate-800 hover:text-indigo-600 transition-colors"
                                  >
                                    <span className="text-sm">{faq.question}</span>
                                    <span className={`transform transition-transform ${isOpen ? 'rotate-180 text-indigo-600' : 'text-slate-400'}`}>
                                      <ChevronDown size={18} />
                                    </span>
                                  </button>
                                  {isOpen && (
                                    <div className="px-5 pb-5 text-xs text-slate-500 font-semibold leading-relaxed border-t border-slate-50/50 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
                                      {faq.answer}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          {[
                            {
                              id: 1,
                              question: "How do I add a new brand to track?",
                              answer: "To add a brand, navigate to the 'Brand Tracker' tab and click the 'Add Brand' button in the top right. Enter the brand name (e.g. Google) and choose a region (e.g. Global or India) to begin retrieving articles."
                            },
                            {
                              id: 2,
                              question: "What are the different user roles in Cerebro?",
                              answer: "There are three primary roles: 'Maverick' (for internal employees with @themavericksindia.com emails), 'Admin' (full platform control and licensing management), and 'Individual' (external clients authenticated via unique license keys)."
                            },
                            {
                              id: 3,
                              question: "How does the reach calculation model work?",
                              answer: "Our Reach Lens runs multi-layered scrapers across Google News, RSS feeds, and Reddit discussion sub-channels. It computes estimated reader impressions using platform traffic coefficients and sentiment indexes."
                            },
                            {
                              id: 4,
                              question: "Can I generate and revoke license keys?",
                              answer: "Only users with Admin access can manage license keys. Under the 'Settings' tab, admins can generate new keys and revoke active/used keys to block linked accounts instantly."
                            },
                            {
                              id: 5,
                              question: "What do the different article sentiment tags indicate?",
                              answer: "Every parsed article is analyzed by our integrated model and categorized into Positive, Neutral, or Negative sentiment. The score reflects keyword density and structural phrasing context."
                            }
                          ].filter(faq =>
                            faq.question.toLowerCase().includes(supportSearchQuery.toLowerCase()) ||
                            faq.answer.toLowerCase().includes(supportSearchQuery.toLowerCase())
                          ).length === 0 && (
                              <div className="p-8 text-center text-xs font-bold text-slate-400">
                                No matching FAQs found.
                              </div>
                            )}
                        </div>
                      </div>

                      {/* Right Column: Mail Us an Issue Form & Ticket Logs */}
                      <div className="flex flex-col gap-10">
                        {/* Form Block */}
                        <div className="bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
                          <div className="flex items-center gap-5 mb-8">
                            <div className="w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 transition-transform hover:rotate-3">
                              <Mail size={32} />
                            </div>
                            <div>
                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Mail Us an Issue</h4>
                              <p className="text-xs font-bold text-slate-400">Submit a support request directly to our team</p>
                            </div>
                          </div>

                          {ticketSuccessMessage && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-xs font-bold flex items-center gap-3 animate-in fade-in duration-300">
                              <CheckCircle2 size={16} />
                              {ticketSuccessMessage}
                            </div>
                          )}

                          <form onSubmit={handleCreateSupportTicket} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Category</label>
                                <select
                                  value={supportCategory}
                                  onChange={(e) => setSupportCategory(e.target.value)}
                                  className="w-full py-4 px-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-sm"
                                >
                                  <option value="Bug Report">Bug Report</option>
                                  <option value="Feature Request">Feature Request</option>
                                  <option value="Billing/Licensing">Billing/Licensing</option>
                                  <option value="General Inquiry">General Inquiry</option>
                                </select>
                              </div>

                              <div className="group">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Subject</label>
                                <input
                                  type="text"
                                  placeholder="e.g. API connection error"
                                  value={supportSubject}
                                  onChange={(e) => setSupportSubject(e.target.value)}
                                  required
                                  className="w-full py-4 px-6 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-sm"
                                />
                              </div>
                            </div>

                            <div className="group">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Email Address</label>
                              <input
                                type="email"
                                placeholder="name@example.com"
                                value={supportEmail}
                                onChange={(e) => setSupportEmail(e.target.value)}
                                required
                                className="w-full py-4 px-6 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-sm"
                              />
                            </div>

                            <div className="group">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 mb-2 block">Describe the Issue</label>
                              <textarea
                                rows="4"
                                placeholder="Please provide details about the issue..."
                                value={supportDescription}
                                onChange={(e) => setSupportDescription(e.target.value)}
                                required
                                className="w-full py-4 px-6 bg-white border border-slate-100 rounded-2xl text-sm font-semibold text-slate-900 outline-none focus:border-indigo-600 transition-all shadow-sm resize-none"
                              ></textarea>
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmittingTicket}
                              className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                              {isSubmittingTicket ? 'Submitting...' : 'Submit Support Request'}
                            </button>
                          </form>
                        </div>

                        {/* Ticket Logs List */}
                        <div className="bg-white/50 backdrop-blur-xl border border-slate-200 rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50">
                          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Support Request History</h4>
                          <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                            {supportTickets && supportTickets.length > 0 ? (
                              supportTickets.map((ticket) => (
                                <div key={ticket.id} className="p-5 bg-white border border-slate-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-200 transition-colors">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-3 flex-wrap">
                                      <span className="text-[10px] font-black text-indigo-600 font-mono">{ticket.id}</span>
                                      <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">{ticket.category}</span>
                                      {ticket.email && (
                                        <span className="text-[10px] font-bold text-slate-400 font-mono">({ticket.email})</span>
                                      )}
                                    </div>
                                    <p className="text-xs font-black text-slate-800">{ticket.subject}</p>
                                    {ticket.description && (
                                      <p className="text-[10px] text-slate-400 font-semibold leading-relaxed line-clamp-1">{ticket.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-4 justify-between md:justify-end">
                                    <span className="text-[10px] font-bold text-slate-400">{ticket.date}</span>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border ${ticket.status === 'Resolved'
                                      ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                                      : 'bg-amber-50 border-amber-100 text-amber-600'
                                      }`}>
                                      {ticket.status}
                                    </span>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-xs font-bold text-slate-400">
                                No history found.
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
          {/* Add Brand Modal */}
          {showAddBrandModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setShowAddBrandModal(false)}></div>
              <div className={`relative border rounded-[2.5rem] w-full max-w-sm p-10 shadow-2xl animate-in zoom-in-95 duration-300 ${
                darkMode ? 'bg-[#0f172a] border-white/5 text-white shadow-black/35' : 'bg-[#f8fafc] border-slate-200 text-slate-900'
              }`}>
                <button
                  onClick={() => setShowAddBrandModal(false)}
                  className={`absolute top-6 right-6 transition-colors ${
                    darkMode ? 'text-white/30 hover:text-white' : 'text-slate-350 hover:text-slate-900'
                  }`}
                >
                  <X size={20} />
                </button>

                <div className="space-y-8">
                  <div className="group">
                    <h3 className={`text-[10px] font-black mb-3 tracking-[0.2em] uppercase ml-1 transition-all group-focus-within:translate-x-1 ${
                      darkMode ? 'text-indigo-300' : 'text-indigo-900'
                    }`}>Enter brand</h3>
                    <input
                      id="brand-input"
                      type="text"
                      className={`w-full py-5 px-6 rounded-2xl text-sm font-bold outline-none transition-all shadow-sm ${
                        darkMode
                          ? 'bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-550 focus:ring-4 focus:ring-indigo-500/20'
                          : 'bg-white border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50/50'
                      }`}
                      placeholder="e.g. Apple"
                      value={newBrandName}
                      onChange={(e) => setNewBrandName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (newBrandName.trim()) {
                            handleAddBrand(newBrandName.trim(), newBrandRegion);
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="group">
                    <h3 className={`text-[10px] font-black mb-4 tracking-[0.2em] uppercase ml-1 transition-all group-focus-within:translate-x-1 ${
                      darkMode ? 'text-indigo-300' : 'text-indigo-900'
                    }`}>Region</h3>
                    <div className="flex gap-2">
                      {['India', 'Global', 'Both'].map((r) => (
                        <button
                          key={r}
                          onClick={() => setNewBrandRegion(r)}
                          className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] transition-all duration-300 border ${
                            newBrandRegion === r
                              ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-600/20 scale-105 font-heading'
                              : (darkMode
                                  ? 'bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500 hover:text-indigo-400 hover:bg-white/10 font-heading'
                                  : 'bg-white border-slate-100 text-slate-450 hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/50 font-heading')
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (newBrandName.trim()) {
                          handleAddBrand(newBrandName.trim(), newBrandRegion);
                        } else {
                          const input = document.getElementById('brand-input');
                          if (input) {
                            input.classList.add('border-red-500', 'shake');
                            setTimeout(() => input.classList.remove('border-red-500', 'shake'), 1000);
                          }
                        }
                      }}
                      className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 font-heading"
                    >
                      Save Brand
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Create Report Modal */}
          {showCreateReportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowCreateReportModal(false)}></div>
              <div className="relative bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-500">
                <div className="p-8 bg-slate-900 text-white flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
                  <div className="relative">
                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-[10px] font-black uppercase tracking-widest w-max mb-3">
                      <Sparkles size={12} /> Autonomous Assessment Engine
                    </div>
                    <h3 className="text-2xl font-black tracking-tight">Create Intelligence Report</h3>
                    <p className="text-xs text-slate-400 font-medium mt-1">Configure automated assessment parameters</p>
                  </div>
                  <button
                    onClick={() => setShowCreateReportModal(false)}
                    className="p-2.5 bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 rounded-full transition-all relative z-10 shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  if (!newReportForm.title.trim()) return;
                  const generatedId = `rep-${Date.now()}`;
                  const newRep = {
                    id: generatedId,
                    title: newReportForm.title,
                    type: newReportForm.type,
                    status: 'Generated',
                    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                    author: 'Cerebro Autonomous Engine v5',
                    priority: newReportForm.priority,
                    topic: newReportForm.topic || 'All',
                    keywords: newReportForm.keywords || '',
                    brandKeywords: newReportForm.brandKeywords || 'Brand General Monitoring',
                    competitorKeywords: newReportForm.competitorKeywords || 'Unspecified Competitors',
                    summary: `Assessment for topic: ${newReportForm.topic || 'All'}${newReportForm.keywords ? ' (' + newReportForm.keywords + ')' : ''} covering brand: ${newReportForm.brandKeywords || 'N/A'} against competitor: ${newReportForm.competitorKeywords || 'N/A'}.`,
                    tags: newReportForm.tags ? newReportForm.tags.split(',').map(t => t.trim()) : ['Intelligence', 'Analysis'],
                    metrics: { accuracy: '99.8%', confidence: 'Very High', sourcesCount: Math.floor(Math.random() * 100) + 50 },
                    sections: [
                      {
                        id: 'sec-1',
                        title: '1. Document Title',
                        content: '',
                        charts: [],
                        images: []
                      }
                    ]
                  };
                  setReports(prev => [newRep, ...prev]);
                  setSelectedReport(newRep);
                  setActiveSectionIndex(0);
                  setShowCreateReportModal(false);
                  setNewReportForm({ title: '', type: 'Brand Analysis', priority: 'High', topic: 'All', keywords: '', brandKeywords: '', competitorKeywords: '', tags: '' });
                }} className="p-8 space-y-6">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Report Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Q3 APAC Generative AI Syndication Pivot"
                      value={newReportForm.title}
                      onChange={(e) => setNewReportForm({ ...newReportForm, title: e.target.value })}
                      className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Assessment Type</label>
                      <select
                        value={newReportForm.type}
                        onChange={(e) => setNewReportForm({ ...newReportForm, type: e.target.value })}
                        className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                      >
                        <option value="Brand Analysis">Brand Analysis</option>
                        <option value="VS Analysis">VS Analysis</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Priority Level</label>
                      <select
                        value={newReportForm.priority}
                        onChange={(e) => setNewReportForm({ ...newReportForm, priority: e.target.value })}
                        className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                      >
                        <option value="High">High</option>
                        <option value="Urgent">Urgent</option>
                        <option value="Medium">Medium</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Brand Keywords</label>
                      <input
                        type="text"
                        placeholder="e.g. Cerebro, PulseWire, Anexar"
                        value={newReportForm.brandKeywords || ''}
                        onChange={(e) => setNewReportForm({ ...newReportForm, brandKeywords: e.target.value })}
                        className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Competitor Keywords</label>
                      <input
                        type="text"
                        placeholder="e.g. Rival Alpha, NexaTrack, ScraperX"
                        value={newReportForm.competitorKeywords || ''}
                        onChange={(e) => setNewReportForm({ ...newReportForm, competitorKeywords: e.target.value })}
                        className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Target Sector / Topic</label>
                      <select
                        value={newReportForm.topic}
                        onChange={(e) => setNewReportForm({ ...newReportForm, topic: e.target.value })}
                        className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                      >
                        <option value="All">All Sectors</option>
                        <option value="AI">Artificial Intelligence</option>
                        <option value="STARTUP">Startup & Venture Capital</option>
                        <option value="CONSULTANCY">Consultancy & Strategy</option>
                        <option value="FINANCE">Finance & Markets</option>
                        <option value="TECHNOLOGY">Technology & Hardware</option>
                        <option value="HEALTHCARE">Healthcare & Medicine</option>
                        <option value="EDUCATION">Education & Academia</option>
                        <option value="ENERGY">Energy & Renewables</option>
                        <option value="RETAIL">Retail & E-Commerce</option>
                        <option value="MEDIA">Media & Journalism</option>
                        <option value="AUTOMOTIVE">Automotive & EV</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Target Keywords</label>
                      <input
                        type="text"
                        placeholder="e.g. Nvidia, OpenAI, ChatGPT"
                        value={newReportForm.keywords || ''}
                        onChange={(e) => setNewReportForm({ ...newReportForm, keywords: e.target.value })}
                        className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Tags / Index Nodes (comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Syndication, Pricing, APAC"
                      value={newReportForm.tags}
                      onChange={(e) => setNewReportForm({ ...newReportForm, tags: e.target.value })}
                      className="w-full py-3.5 px-5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all shadow-inner"
                    />
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCreateReportModal(false)}
                      className="px-6 py-3.5 bg-slate-100 text-slate-500 rounded-full font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-indigo-600 text-white rounded-full font-black uppercase tracking-widest text-xs hover:bg-indigo-700 shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <Sparkles size={16} /> Generate Assessment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* History Modal */}
          {showHistoryModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
              <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl flex flex-col overflow-hidden text-white font-sans max-h-[85vh]">
                <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
                      <History size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black tracking-tight text-white">Audit & Change History Log</h2>
                      <p className="text-xs text-slate-400">Time-stamped audit trail ready for database synchronization</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowHistoryModal(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar bg-slate-950/40 flex-1">
                  {changeHistory.map((item) => (
                    <div key={item.id} className="p-4 bg-slate-900/80 border border-slate-800/80 rounded-2xl flex items-start justify-between gap-4 transition-all hover:border-slate-700">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider">
                            {item.section}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-200">{item.action}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono text-slate-400">
                          {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-6 border-t border-slate-800 flex items-center justify-between bg-slate-900/50">
                  <div className="text-xs text-slate-400 flex items-center gap-2 font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Telemetry Log Active & Synced
                  </div>
                  <button
                    onClick={() => {
                      alert(`Synchronizing ${changeHistory.length} audit records to PostgreSQL database...`);
                    }}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Database size={15} /> Save to Database
                  </button>
                </div>
              </div>
            </div>
          )}



          {/* Drill-Through Slide-Over Explorer (Feature 5) */}
          {drillThroughContext && drillThroughContext.isOpen && (
            <div className="fixed inset-0 z-[140] flex justify-end animate-in fade-in duration-300">
              {/* Dark Overlay Background */}
              <div 
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
                onClick={() => setDrillThroughContext(prev => ({ ...prev, isOpen: false }))}
              />
              
              {/* Panel Container */}
              <div className="relative w-full max-w-[500px] bg-slate-900 text-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-350 ease-out border-l border-slate-800">
                {/* Header */}
                <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none -mr-10 -mt-10"></div>
                  <div className="relative">
                    <h3 className="text-lg font-black tracking-tight flex items-center gap-2">
                      <Sparkles className="text-indigo-400" size={18} />
                      Data Explorer
                    </h3>
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                      Drill-Through: {drillThroughContext.field} = {drillThroughContext.value}
                    </p>
                  </div>
                  <button
                    onClick={() => setDrillThroughContext(prev => ({ ...prev, isOpen: false }))}
                    className="p-2 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white rounded-full transition-all relative z-10 shadow-md"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Body / Article List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-900/50 custom-scrollbar">
                  {drillThroughContext.articles && drillThroughContext.articles.length > 0 ? (
                    <div className="space-y-4">
                      <p className="text-[11px] text-slate-400 font-semibold tracking-wide uppercase">
                        Showing {drillThroughContext.articles.length} underlying records
                      </p>
                      
                      {drillThroughContext.articles.map((article, idx) => (
                        <div 
                          key={article.id || idx} 
                          className="p-4 bg-slate-950/65 border border-slate-800/80 rounded-2xl space-y-3 shadow-md hover:border-slate-700/80 transition-all group"
                        >
                          <div className="flex justify-between items-start gap-3">
                            <span className="text-xs font-bold text-slate-350 group-hover:text-indigo-300 transition-colors leading-snug">
                              {article.title}
                            </span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 border ${
                              article.sentiment === 'Positive' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                              article.sentiment === 'Negative' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                              'bg-slate-500/10 text-slate-400 border-slate-500/20'
                            }`}>
                              {article.sentiment}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between text-[10px] font-medium text-slate-500 font-mono">
                            <span className="font-bold text-slate-400">{article.source}</span>
                            <span>{article.published || article.date || 'Recent'}</span>
                          </div>

                          <div className="flex items-center gap-2 pt-1.5 border-t border-slate-800/60">
                            {article.url && (
                              <a 
                                href={article.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                              >
                                View Article
                              </a>
                            )}
                            <button
                              onClick={() => insertCitation(article)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 active:scale-95 shadow-md shadow-indigo-600/10"
                            >
                              + Cite Reference
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
                      <FileText size={40} className="text-slate-700" />
                      <span className="text-sm font-black text-slate-500">No article records found</span>
                      <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-semibold">
                        We could not parse any article snippets mapping to this specific aggregate segment.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full relative flex items-center justify-start overflow-hidden bg-[#030712] font-body selection:bg-indigo-500/30 p-6 md:p-16">
      {/* Dynamic Animated Orbs for depth */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Video Container (Starts in full screen, slides/scales to the right when ended) */}
      <div className="absolute top-0 left-0 w-full h-full z-20">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          preload="auto"
          onCanPlay={() => { if (videoRef.current) videoRef.current.playbackRate = 2.0; }}
          onEnded={() => {
            setVideoEnded(true);
            if (videoRef.current) {
              videoRef.current.pause();
            }
            // Transition form visibility after container reaches the right side
            setTimeout(() => {
              setBrainMovedLeft(true);
            }, 1500);
          }}
          className="w-full h-full object-cover pointer-events-none"
          style={{ filter: 'contrast(1.1) saturate(1.15) brightness(1.05)' }}
        >
          <source src="/login_bg.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Login / Sign-up Container Card (Slides/Fades in once brain has moved to the right) */}
      <div 
        className={`absolute z-30 transition-all duration-[1000ms] ease-out transform ${
          brainMovedLeft 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        } left-1/2 -translate-x-1/2 top-[45%] w-[92%] max-w-md md:left-[8%] md:translate-x-0 md:top-1/2 md:-translate-y-1/2 md:w-[35%] md:max-w-md`}
      >
        <div className="glass-card w-full max-w-md p-8 md:p-10 rounded-[2.5rem] relative text-white" style={{ background: '#4f46e5', border: '1px solid rgba(255,255,255,0.15)' }}>
          <button 
            onClick={() => setView('landing')} 
            className="absolute top-6 left-6 text-white/50 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {view === 'login' && (
            <>
              {/* Custom High-Fidelity Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 border border-white/10 shadow-inner">
                  <img src="/cerebro_white.png" alt="Cerebro" className="w-12 h-12 object-contain" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-white mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>Cerebro</h1>
                <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest">Intelligence at your fingertips</p>
              </div>

              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-xs font-bold">{error}</div>}
              {successMessage && <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-200 text-xs font-bold">{successMessage}</div>}

              {/* Role selector tabs */}
              <div className="flex p-1 rounded-2xl mb-6 gap-1" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.6)', color: '#1e1b4b' }}>
                {['admin', 'employee', 'individual'].map((role) => {
                  const label = role === 'employee' ? 'Maverick' : role === 'admin' ? 'Admin' : 'Individual';
                  const isActive = authRole === role;
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setAuthRole(role)}
                      className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md font-bold'
                          : 'text-indigo-900/70 hover:text-indigo-900 hover:bg-indigo-100/50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input
                      type="email"
                      required
                      placeholder={authRole === 'individual' ? "you@example.com" : "user@themavericksindia.com"}
                      className="w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold outline-none transition-all placeholder-indigo-300"
                      style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.6)', color: '#1e1b4b' }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
                {authRole === 'admin' && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Admin Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        placeholder="Enter Admin Key"
                        className="w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold outline-none transition-all placeholder-indigo-300"
                        style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.6)', color: '#1e1b4b' }}
                        value={adminKeyInput}
                        onChange={(e) => setAdminKeyInput(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5 group">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Password</label>
                    <button type="button" onClick={() => setView('forgot')} className="text-[10px] font-black text-cyan-300 hover:text-cyan-200 transition-colors uppercase">FORGOT?</button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      className="w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold outline-none transition-all placeholder-indigo-300"
                      style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.6)', color: '#1e1b4b' }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-700 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 flex items-center justify-center gap-3 mt-6 rounded-2xl font-bold text-sm tracking-wide transition-all active:scale-95" style={{ background: 'rgba(255,255,255,0.92)', color: '#3730a3' }}>
                  {loading ? <div className="w-5 h-5 border-2 border-indigo-300 border-t-indigo-700 rounded-full animate-spin"></div> : <><ShieldCheck size={18} /> Sign In to Cerebro</>}
                </button>
              </form>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black"><span className="px-4 text-white/70" style={{ background: '#4f46e5' }}>Or continue with</span></div>
              </div>
              <button className="text-white rounded-2xl py-3.5 w-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all hover:opacity-90" style={{ background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(255,255,255,0.6)', color: '#1e1b4b' }}><Chrome size={16} /> Sign in with Google</button>
              <p className="text-center text-xs font-bold text-white/60 mt-6">Don't have an account? <button onClick={() => setView('signup')} className="text-[#00f2fe] font-black hover:underline transition-all">Create Account</button></p>
            </>
          )}

          {view === 'signup' && (
            <>
              {/* Custom High-Fidelity Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 border border-white/10 shadow-inner">
                  <img src="/cerebro_white.png" alt="Cerebro" className="w-12 h-12 object-contain" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-white mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>Cerebro</h1>
                <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest">Join the next era of PR</p>
              </div>

              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-xs font-bold">{error}</div>}
              {successMessage && <div className="mb-6 p-4 bg-green-500/20 border border-green-500/30 rounded-2xl text-green-200 text-xs font-bold">{successMessage}</div>}

              <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => setAuthRole('employee')}
                  className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${authRole === 'employee'
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-white/60 hover:text-white'
                    }`}
                >
                  Maverick
                </button>
                <button
                  type="button"
                  onClick={() => setAuthRole('individual')}
                  className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${authRole === 'individual'
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'text-white/60 hover:text-white'
                    }`}
                >
                  Individual User
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input type="text" required placeholder="Your Full Name" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input type="email" required placeholder={authRole === 'individual' ? "you@example.com" : "user@themavericksindia.com"} className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                {authRole === 'individual' && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">License Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        placeholder="MAV-XXXX-XXXX"
                        className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30"
                        value={licenseKey}
                        onChange={(e) => setLicenseKey(e.target.value)}
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-700 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center gap-3 px-1 py-2">
                  <button type="button" onClick={() => setAgreeTerms(!agreeTerms)} className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${agreeTerms ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-white/20 text-transparent'}`}>
                    <CheckCircle2 size={14} />
                  </button>
                  <span className="text-[10px] font-bold text-white/70 leading-tight">
                    I agree to the <button type="button" className="text-cyan-300 hover:underline">Terms of Service</button> and <button type="button" className="text-cyan-300 hover:underline">Privacy Policy</button>.
                  </span>
                </div>
                <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-6">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Create Account <ArrowRight size={18} /></>}
                </button>
              </form>
              <p className="mt-8 text-center text-xs font-bold text-white/60">Already have an account? <button onClick={() => setView('login')} className="text-[#00f2fe] font-black hover:underline transition-all">Sign In Now</button></p>
            </>
          )}

          {view === 'forgot' && (
            <>
              {/* Custom High-Fidelity Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 border border-white/10 shadow-inner">
                  <img src="/cerebro_white.png" alt="Cerebro" className="w-12 h-12 object-contain" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-white mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>Cerebro</h1>
                <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest">{successMessage ? 'Check your inbox' : 'Recover Access'}</p>
              </div>

              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-xs font-bold">{error}</div>}
              {successMessage ? (
                <div className="space-y-6">
                  <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] text-center">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-300"><CheckCircle2 size={24} /></div>
                    <p className="text-sm font-bold text-white">{successMessage}</p>
                    <p className="text-xs text-white/50 mt-2 italic">Note: Use "admin@themavericksindia.com" to simulate success.</p>
                  </div>
                  <button onClick={() => setView('reset')} className="bg-[#00f2fe] hover:bg-cyan-400 text-slate-900 font-black tracking-wider py-4 rounded-2xl w-full transition-all duration-300 shadow-lg shadow-cyan-400/20 uppercase text-xs flex items-center justify-center gap-2">Simulate: Go to Reset Page <ArrowRight size={16} /></button>
                  <button onClick={() => setView('login')} className="w-full text-center text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors flex items-center justify-center gap-2"><ArrowLeft size={14} /> Back to Login</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                      <input 
                        type="email" 
                        required 
                        placeholder="user@themavericksindia.com" 
                        className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-6">
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Send Reset Link <ArrowRight size={18} /></>}
                  </button>
                  <button onClick={() => setView('login')} className="w-full text-center text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-colors flex items-center justify-center gap-2 mt-4">
                    <ArrowLeft size={14} /> Back to Login
                  </button>
                </form>
              )}
            </>
          )}

          {view === 'reset' && (
            <>
              {/* Custom High-Fidelity Header */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-3 border border-white/10 shadow-inner">
                  <img src="/cerebro_white.png" alt="Cerebro" className="w-12 h-12 object-contain" />
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-white mb-0.5" style={{ fontFamily: 'var(--font-heading)' }}>Cerebro</h1>
                <p className="text-cyan-300 text-[10px] font-black uppercase tracking-widest">Reset Password</p>
              </div>

              {error && <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-2xl text-red-200 text-xs font-bold">{error}</div>}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-400 hover:text-indigo-700 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-700 transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-6">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Reset Password <CheckCircle2 size={18} /></>}
                </button>
              </form>
            </>
          )}

          {view === 'success' && (
            <div className="flex flex-col items-center py-10">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-300 border border-green-500/20">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-white tracking-tighter mb-2 text-center">Password Updated</h2>
              <p className="text-white/60 text-sm font-medium mb-10 text-center">Your account is now secure. You can sign in with your new password.</p>
              <button onClick={() => setView('login')} className="bg-[#00f2fe] hover:bg-cyan-400 text-slate-900 font-black tracking-wider py-4 rounded-2xl w-full transition-all duration-300 shadow-lg shadow-cyan-400/20 uppercase text-xs flex items-center justify-center gap-3">
                Back to Login <ArrowRight size={18} />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export { ErrorBoundary };
export default App;
