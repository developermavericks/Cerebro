# Complete Cerebro Local UI Changes & Feature Reintegration Guide

This document preserves the exact code blocks, configurations, and layout solutions implemented today in `src/App.jsx` and `src/index.css`. Keep this file safe. After resetting or pulling clean remote repository updates, you can use these exact segments to restore our custom high-fidelity design.

---

## 1. Custom CSS Stylesheet Additions (`src/index.css`)
We added premium glassmorphism utility classes, custom keyframes, scrollbar behavior, and body transitions.

```css
@layer components {
  /* Glassmorphism Utilities */
  .glass-card {
    @apply bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl;
  }
  
  .glass-input {
    @apply bg-white/5 border border-white/10 text-black placeholder:text-slate-500 focus:bg-white/10 focus:border-white/30 transition-all outline-none;
  }

  .glass-button {
    @apply bg-white/20 hover:bg-white/30 text-slate-700 font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 border border-white/10;
  }

  .glass-button-primary {
    @apply bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-2xl transition-all active:scale-95 shadow-lg shadow-indigo-600/30;
  }

  @keyframes float {
    0% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
    100% { transform: translateY(0px) rotate(0deg); }
  }

  @keyframes shimmer {
    0% { transform: translateX(-100%) rotate(45deg); }
    100% { transform: translateX(100%) rotate(45deg); }
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .glass-shimmer {
    position: relative;
    overflow: hidden;
  }

  .glass-shimmer::after {
    content: "";
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: linear-gradient(
      45deg,
      transparent,
      rgba(255, 255, 255, 0.03),
      transparent
    );
    transform: rotate(45deg);
    animation: shimmer 10s linear infinite;
    pointer-events: none;
  }

  .glow-on-hover {
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .glow-on-hover:hover {
    box-shadow: 0 0 40px rgba(99, 102, 241, 0.3);
    border-color: rgba(255, 255, 255, 0.4);
  }

  /* Custom Scrollbar for Dropdowns */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-300 rounded-full hover:bg-slate-400 transition-colors;
  }
}
```

---

## 2. Cleo AI Navigation Toggle Button (`src/App.jsx`)
Placed inside the main top navigation menu (adjacent to the notification bell icon).

```jsx
<button
  onClick={() => setShowCleoAi(!showCleoAi)}
  className={`p-2 bg-slate-50 border border-slate-200/60 rounded-xl hover:bg-slate-100 text-slate-600 transition-all duration-300 relative shadow-sm hover:scale-105 active:scale-95 flex items-center justify-center gap-1.5`}
  title="Toggle Cleo AI"
>
  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
  <span className="text-[10px] font-black uppercase tracking-wider text-slate-800">Cleo Ai</span>
</button>
```

---

## 3. Cleo AI Chatbot Widget (`src/App.jsx`)
Appended to the bottom of the main dashboard viewport, responding to the `showCleoAi` state variable.

```jsx
{/* Cleo AI Section (Toggled dynamically) */}
{showCleoAi && (
  <div className={`p-6 rounded-[2rem] border transition-all duration-500 animate-in slide-in-from-bottom-5 ${
    darkMode
      ? 'bg-[#151f32] border-white/5 shadow-xl shadow-black/10'
      : 'bg-white border-slate-200/60 shadow-xl shadow-slate-100'
  }`}>
    {/* Header */}
    <div className="flex items-center justify-between pb-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <img
          src="/cleo_avatar.png"
          alt="Cleo Mascot"
          className="w-8 h-8 rounded-full object-cover border border-white/20"
        />
        <div>
          <h3 className={`text-sm font-black tracking-tight font-heading ${darkMode ? 'text-white' : 'text-slate-950'}`}>Cleo Ai</h3>
          <p className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Autonomous PR Agent Online
          </p>
        </div>
      </div>
    </div>

    {/* Chat Body */}
    <div className="py-4 space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col">
      {cleoMessages.map((msg, i) => (
        <div
          key={i}
          className={`max-w-[80%] rounded-2xl p-4 text-xs font-semibold leading-relaxed ${
            msg.sender === 'user'
              ? 'self-end bg-indigo-600 text-white'
              : (darkMode ? 'self-start bg-white/5 text-slate-200' : 'self-start bg-slate-50 text-slate-800')
          }`}
        >
          {msg.text}
        </div>
      ))}
    </div>

    {/* Chat Input */}
    <form onSubmit={handleCleoSubmit} className="flex gap-3 pt-4 border-t border-slate-200/60">
      <input
        type="text"
        value={cleoInput}
        onChange={(e) => setCleoInput(e.target.value)}
        placeholder="Type a message..."
        className={`flex-1 rounded-xl px-4 py-3.5 text-xs font-bold outline-none transition-all ${
          darkMode
            ? 'bg-white/5 border border-white/10 text-white placeholder:text-white/35 focus:bg-white/10 focus:border-indigo-500'
            : 'bg-slate-50 border border-slate-200 text-slate-950 placeholder:text-slate-400 focus:bg-slate-100 focus:border-slate-300'
        }`}
      />
      <button
        type="submit"
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
      >
        Send
      </button>
    </form>
  </div>
)}
```

---

## 4. Landing Page Custom Layout with Animated Orbs
The initial landing screen styling including the premium glassmorphic cards, custom logo representation, background image, and slow-floating gradient effects.

```jsx
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
```

---

## 5. Video-Based Sign-In & Authentication Flows (`src/App.jsx`)
Starts with a full-screen cinematic video `login_bg.mp4`, which dynamically shrinks to the right-hand panel while sliding the authentication card onto the left-hand panel.

```jsx
  return (
    <div className="min-h-screen w-full relative flex items-center justify-start overflow-hidden bg-[#030712] font-body selection:bg-indigo-500/30 p-6 md:p-16">
      {/* Dynamic Animated Orbs for depth */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Video Container (Starts in full screen, slides/scales to the right when ended) */}
      <div 
        className={`absolute transition-all duration-[1500ms] ease-in-out z-20 ${
          videoEnded 
            ? 'top-0 left-0 w-full h-[40%] md:left-[35%] md:w-[65%] md:h-full'
            : 'top-0 left-0 w-full h-full'
        }`}
      >
        <video 
          ref={videoRef}
          autoPlay 
          muted 
          playsInline 
          onEnded={() => {
            setVideoEnded(true);
            if (videoRef.current) {
              videoRef.current.pause();
            }
            setTimeout(() => {
              setBrainMovedLeft(true);
            }, 1500);
          }}
          className="w-full h-full object-cover pointer-events-none"
        >
          <source src="/login_bg.mp4" type="video/mp4" />
        </video>
        <div 
          className={`absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/50 to-transparent pointer-events-none transition-all duration-[1500ms] ${
            videoEnded ? 'opacity-100' : 'opacity-0'
          }`} 
        />
      </div>

      {/* Login / Sign-up Container Card (Slides/Fades in once brain has moved to the right) */}
      <div 
        className={`absolute z-30 transition-all duration-[1000ms] ease-out transform ${
          brainMovedLeft 
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' 
            : 'opacity-0 translate-y-8 scale-95 pointer-events-none'
        } left-1/2 -translate-x-1/2 top-[45%] w-[92%] max-w-md md:left-[8%] md:translate-x-0 md:top-1/2 md:-translate-y-1/2 md:w-[35%] md:max-w-md`}
      >
        <div className="glass-card w-full max-w-md p-8 md:p-10 rounded-[2.5rem] relative text-white">
          <button 
            onClick={() => setView('landing')} 
            className="absolute top-6 left-6 text-white/50 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={14} /> Back
          </button>

          {/* VIEW: LOGIN */}
          {view === 'login' && (
            <>
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
              <div className="flex bg-white/5 border border-white/10 p-1 rounded-2xl mb-6 gap-1">
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
                          : 'text-white/60 hover:text-white hover:bg-white/5'
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
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                    <input 
                      type="email" 
                      required 
                      placeholder={authRole === 'individual' ? "you@example.com" : "user@themavericksindia.com"} 
                      className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                    />
                  </div>
                </div>
                {authRole === 'admin' && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Admin Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                      <input
                        type="text"
                        required
                        placeholder="Enter Admin Key"
                        className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30"
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
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="••••••••" 
                      className="glass-input w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold text-white placeholder-white/30" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-6">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><ShieldCheck size={18} /> Sign In to Cerebro</>}
                </button>
              </form>
              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black"><span className="bg-[#0b0f19] px-4 text-white/55">Or continue with</span></div>
              </div>
              <button className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl py-3.5 w-full font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all"><Chrome size={16} /> Sign in with Google</button>
              <p className="text-center text-xs font-bold text-white/60 mt-6">Don't have an account? <button onClick={() => setView('signup')} className="text-[#00f2fe] font-black hover:underline transition-all">Create Account</button></p>
            </>
          )}

          {/* VIEW: SIGNUP */}
          {view === 'signup' && (
            <>
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
                  className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${authRole === 'employee' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-white/60 hover:text-white'}`}
                >
                  Maverick
                </button>
                <button
                  type="button"
                  onClick={() => setAuthRole('individual')}
                  className={`flex-1 py-2 px-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${authRole === 'individual' ? 'bg-indigo-600 text-white shadow-md font-bold' : 'text-white/60 hover:text-white'}`}
                >
                  Individual User
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                    <input type="text" required placeholder="Your Full Name" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                    <input type="email" required placeholder={authRole === 'individual' ? "you@example.com" : "user@themavericksindia.com"} className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                {authRole === 'individual' && (
                  <div className="space-y-1.5 group">
                    <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">License Key</label>
                    <div className="relative">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                      <input type="text" required placeholder="MAV-XXXX-XXXX" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={licenseKey} onChange={(e) => setLicenseKey(e.target.value)} />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Create Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
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

          {/* VIEW: FORGOT PASSWORD */}
          {view === 'forgot' && (
            <>
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
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
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

          {/* VIEW: RESET PASSWORD */}
          {view === 'reset' && (
            <>
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
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-12 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5 group">
                  <label className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em] ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/45 group-focus-within:text-white transition-colors" size={18} />
                    <input type={showPassword ? "text" : "password"} required placeholder="••••••••" className="glass-input w-full py-4 pl-12 pr-4 rounded-2xl text-sm font-semibold text-white placeholder-white/30" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="glass-button-primary w-full py-4 flex items-center justify-center gap-3 mt-6">
                  {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <>Reset Password <CheckCircle2 size={18} /></>}
                </button>
              </form>
            </>
          )}

          {/* VIEW: SUCCESS */}
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
```

---

## 6. Port Fixes for Backend APIs (Port 3000 vs 3001)
*   **The Issue**: The frontend was hardcoded to fetch from `http://localhost:3000` (port 3000) for competitor analysis endpoints and global company lists, but the backend server runs on `http://localhost:3001` (port 3001). This blocked autocomplete search dropdowns and competitor comparison telemetry.
*   **The Fix**: Align fetches in `src/App.jsx` to port `3001`:
    ```javascript
    // 1. fetchGlobalCompanies (around line 2057)
    const res = await fetch('http://localhost:3001/api/global-company-names');

    // 2. handleAnalyse (around line 2778)
    const res = await fetch(`http://localhost:3001/api/competitor-analysis?keyword1=${encodeURIComponent(comp1)}&keyword2=${encodeURIComponent(comp2)}`, { ... });

    // 3. History list loading (around line 4648)
    const res = await fetch(`http://localhost:3001/api/competitor-analysis?keyword1=${encodeURIComponent(item.comp1)}&keyword2=${encodeURIComponent(item.comp2)}`, { ... });
    ```
