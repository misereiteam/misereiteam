import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, collection, addDoc, query, where, getDocs, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { Shield, Swords, BookOpen, Info, Youtube, Home, ShoppingCart, Layers, Users, LogIn, LogOut, Sun, Moon, Search, Menu, X as IconX, ExternalLink, ListChecks, Palette, Puzzle, Filter, ChevronDown, ChevronUp, Tag, Package, ImageIcon, ShieldCheck, Gem, Archive, Square, Columns, Dices, Star, Newspaper, FileText, CalendarDays, ArrowRight, Database, Grid, List, HelpCircle, ScrollText, MessageSquare, Play, TrendingUp, MapPin, Atom, AlertTriangle, Loader2, Library, ArrowLeft, Construction, Share2 } from 'lucide-react';

// Firebase configuration
const firebaseConfig = typeof __firebase_config !== 'undefined' // eslint-disable-line no-undef
  ? JSON.parse(__firebase_config) // eslint-disable-line no-undef
  : {
      apiKey: "YOUR_LOCAL_API_KEY_FALLBACK",
      authDomain: "YOUR_LOCAL_AUTH_DOMAIN_FALLBACK",
      projectId: "YOUR_LOCAL_PROJECT_ID_FALLBACK",
      storageBucket: "YOUR_LOCAL_STORAGE_BUCKET_FALLBACK",
      messagingSenderId: "YOUR_LOCAL_MESSAGING_SENDER_ID_FALLBACK",
      appId: "YOUR_LOCAL_APP_ID_FALLBACK"
    };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const appId = typeof __app_id !== 'undefined' // eslint-disable-line no-undef
  ? __app_id // eslint-disable-line no-undef
  : 'gundam-card-tsv-v3-local-dev';

const parseCSV = (csvString) => {
  const rows = [];
  let currentRow = [];
  let inQuotes = false;
  let currentField = '';
  for (let i = 0; i < csvString.length; i++) {
    const char = csvString[i];
    if (char === '"') {
      if (inQuotes && i + 1 < csvString.length && csvString[i + 1] === '"') {
        currentField += '"'; i++;
      } else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim()); currentField = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (csvString[i + 1] === '\n' && char === '\r') i++;
      if (currentField.trim() !== '' || currentRow.length > 0) {
        currentRow.push(currentField.trim()); rows.push(currentRow); currentRow = [];
      } currentField = '';
    } else { currentField += char; }
  }
  if (currentField.trim() !== '' || currentRow.length > 0) {
    currentRow.push(currentField.trim()); rows.push(currentRow);
  }
  if (rows.length < 2) return [];
  const headers = rows[0].map(h => h.replace(/^"|"$/g, ''));
  const data = rows.slice(1).map((values, index) => {
    if (values.length === 0 || (values.length === 1 && values[0].trim() === '')) return null;
    if (values.length < headers.length) {
      console.warn(`Skipping row ${index + 2} due to insufficient columns.`); return null;
    }
    const item = {};
    headers.forEach((header, i) => { item[header] = values[i] !== undefined ? values[i].replace(/^"|"$/g, '') : ''; });
    return item;
  }).filter(item => item !== null);
  return data;
};

const loadGsap = (callback) => {
  const gsapUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js";
  const scrollTriggerUrl = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js";
  let gsapLoaded = false, scrollTriggerLoaded = false;
  const check = () => { if (gsapLoaded && scrollTriggerLoaded && window.gsap && window.ScrollTrigger) { window.gsap.registerPlugin(window.ScrollTrigger); callback(window.gsap); }};
  const s1 = document.createElement('script'); s1.src = gsapUrl; s1.async = true; s1.onload = () => { gsapLoaded = true; check(); }; document.head.appendChild(s1);
  const s2 = document.createElement('script'); s2.src = scrollTriggerUrl; s2.async = true; s2.onload = () => { scrollTriggerLoaded = true; check(); }; document.head.appendChild(s2);
};

const gqColors = { gold: '#FBBF24', red: '#DC2626', redDark: '#B91C1C' };
const gquuuuuuxTheme = { bgBase: 'bg-slate-900', bgNavbar: 'bg-black/80 backdrop-blur-md', bgCard: 'bg-slate-800/70 border border-gq-red-dark', bgArticleCard: 'bg-slate-800 border border-gq-gold border-opacity-30', bgSidebar: 'bg-slate-800/50', textPrimary: 'text-slate-100', textSecondary: 'text-slate-400', textAccent: 'text-gq-gold', accentGold: 'gq-gold', accentRed: 'gq-red', borderColor: 'border-gq-gold border-opacity-50', buttonPrimaryBg: 'bg-gq-red hover:bg-gq-red-dark', buttonPrimaryText: 'text-white', buttonSecondaryBg: 'bg-gq-gold hover:bg-yellow-400', buttonSecondaryText: 'text-slate-900 font-semibold', inputBg: 'bg-slate-700/50', inputBorder: 'border-slate-600', focusRing: 'focus:ring-[#FBBF24]' };
const defaultThemeColors = { sky500: '#0ea5e9', sky600: '#0284c7', red500: '#ef4444', slate200: '#e2e8f0', slate300: '#cbd5e1', slate400: '#94a3b8', slate600: '#475569', slate700: '#334155', slate800: '#1e2937', gray100: '#f3f4f6', sky400: '#38bdf8' };
const defaultTheme = { bgBase: 'bg-gray-100', bgNavbar: 'bg-sky-600', bgCard: 'bg-white', bgArticleCard: 'bg-white border border-slate-200', bgSidebar: 'bg-slate-100', textPrimary: 'text-slate-800', textSecondary: 'text-slate-600', textAccent: 'text-sky-500', accentGold: 'text-sky-500', accentRed: 'text-red-500', borderColor: 'border-sky-500/50', buttonPrimaryBg: 'bg-sky-600 hover:bg-sky-500', buttonPrimaryText: 'text-white', buttonSecondaryBg: 'bg-slate-200 hover:bg-slate-300', buttonSecondaryText: 'text-sky-600', inputBg: 'bg-white', inputBorder: 'border-slate-300', focusRing: 'focus:ring-sky-500' };

const Navbar = ({ setCurrentPage, currentPage, toggleDarkMode, isDarkMode, isMobileMenuOpen, toggleMobileMenu, gsap, theme, navigateToSeriesList }) => {
  const navRef = useRef(null); const logoRef = useRef(null); const navItemsRef = useRef([]);
  navItemsRef.current = []; const NOTE_URL = "https://note.com/miserei_team";
  const addToRefs = (el) => { if (el && !navItemsRef.current.includes(el)) navItemsRef.current.push(el); };
  useEffect(() => {
    if (gsap && navRef.current && logoRef.current && navItemsRef.current.length > 0) {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(navRef.current, { y: -90, opacity: 0, duration: 0.8, delay: 0.2 })
        .from(logoRef.current, { opacity: 0, scale: 0.5, duration: 0.5 }, "-=0.3")
        .from(navItemsRef.current, { opacity: 0, y: -20, stagger: 0.1, duration: 0.4 }, "-=0.2");
    }
  }, [gsap]);
  const navItemsData = [
    { name: 'ホーム', icon: <Home size={18} />, page: 'home' },
    { name: 'サプライ', icon: <ShoppingCart size={18} />, page: 'supplies' },
    { name: '記事アーカイブ', icon: <Newspaper size={18} />, page: 'articles', externalLink: NOTE_URL },
    { name: 'カードリスト', icon: <Database size={18} />, page: 'cardlist' },
    { name: '作品一覧', icon: <Library size={18} />, page: 'serieslist' },
    { name: '用語集', icon: <HelpCircle size={18} />, page: 'glossary' },
    { name: 'ルール解説', icon: <ScrollText size={18} />, page: 'rules' },
    // 「公式情報」「動画」を削除
  ];
  return (
    <nav ref={navRef} className={`p-4 shadow-xl sticky top-0 z-50 ${isDarkMode ? theme.bgNavbar : defaultTheme.bgNavbar} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>
      <div className="container mx-auto flex justify-between items-center">
        <div ref={logoRef} className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentPage('home')}>
          <Layers size={32} className={isDarkMode ? theme.accentRed : defaultTheme.accentRed } />
          <h1 className={`text-2xl font-bold tracking-tight ${isDarkMode ? theme.textAccent : 'text-yellow-300'}`}>ミセレイ小隊</h1>
        </div>
        <div className="hidden md:flex space-x-1 items-center">
          {navItemsData.map((item) => ( <button key={item.page} ref={addToRefs} onClick={() => { if (item.externalLink) window.open(item.externalLink, '_blank'); else if (item.page === 'serieslist') navigateToSeriesList(); else setCurrentPage(item.page); }} className={`flex items-center space-x-1 px-3 py-2 rounded-sm transition-all duration-200 border-b-2 ${currentPage === item.page || (currentPage === 'story' && item.page === 'serieslist') ? (isDarkMode ? `border-gq-gold ${theme.textAccent}` : `bg-sky-700 border-yellow-300 text-yellow-300`) : (isDarkMode ? `border-transparent hover:border-gq-gold hover:border-opacity-[0.7] hover:${theme.textAccent}` : `border-transparent hover:bg-sky-500`)}`}>{item.icon}<span>{item.name}</span>{item.externalLink && <ExternalLink size={14} className="ml-1 opacity-70" />}</button>))}
          <button ref={addToRefs} onClick={toggleDarkMode} className={`p-2 rounded-full transition-colors duration-200 ${isDarkMode ? `hover:bg-slate-700` : `hover:bg-sky-500`}`}>{isDarkMode ? <Sun size={20} className={theme.accentGold} /> : <Moon size={20} />}</button>
        </div>
        <div className="md:hidden"><button onClick={toggleMobileMenu} className="focus:outline-none p-2">{isMobileMenuOpen ? <IconX size={28} className={isDarkMode ? theme.accentRed : defaultTheme.accentRed} /> : <Menu size={28} />}</button></div>
      </div>
      {isMobileMenuOpen && (<div className={`md:hidden mt-3 rounded-md shadow-xl ${isDarkMode ? 'bg-slate-800/90' : defaultTheme.bgNavbar}`}><div className="flex flex-col space-y-1 p-2">{navItemsData.map(item => (<button key={item.page} onClick={() => { if (item.externalLink) window.open(item.externalLink, '_blank'); else if (item.page === 'serieslist') navigateToSeriesList(); else setCurrentPage(item.page); toggleMobileMenu(); }} className={`flex items-center space-x-2 px-3 py-3 rounded-sm text-left w-full transition-colors duration-200 ${currentPage === item.page || (currentPage === 'story' && item.page === 'serieslist') ? (isDarkMode ? `bg-gq-red text-white` : `bg-sky-700 text-yellow-300`) : (isDarkMode ? `hover:bg-slate-700 hover:${theme.textAccent}` : `hover:bg-sky-400`)}`}>{item.icon}<span>{item.name}</span>{item.externalLink && <ExternalLink size={14} className="ml-auto opacity-70" />}</button>))}<button onClick={() => { toggleDarkMode(); toggleMobileMenu(); }} className={`flex items-center space-x-2 px-3 py-3 rounded-sm text-left w-full transition-colors duration-200 ${isDarkMode ? `hover:bg-slate-700 hover:${theme.textAccent}` : `hover:bg-sky-400`}`}>{isDarkMode ? <Sun size={20} className={theme.accentGold} /> : <Moon size={20} />}<span>{isDarkMode ? 'ライトモードへ' : 'ダークモードへ'}</span></button></div></div>)}
    </nav>
  );
};
const Footer = ({ isDarkMode, theme }) => ( <footer className={`py-8 mt-12 border-t ${isDarkMode ? `${theme.bgBase} ${theme.borderColor}` : `${defaultTheme.bgBase} ${defaultTheme.borderColor}`} `}><div className={`container mx-auto text-center ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}><p>© {new Date().getFullYear()} ミセレイ小隊. All rights reserved.</p><p className="text-sm mt-1">当サイトはアフィリエイトプログラムに参加しています。</p></div></footer> );
const Card = ({ children, className = '', isDarkMode, gsap, theme, onClick }) => { const cardRef = useRef(null); useEffect(() => { if (gsap && cardRef.current) { gsap.fromTo(cardRef.current, { opacity: 0, y: 60, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: cardRef.current, start: 'top bottom-=100px', toggleActions: 'play none none none' }}); const el = cardRef.current; let enterAnim, leaveAnim; if (onClick) { enterAnim = () => gsap.to(el, { y: -10, scale: 1.02, duration: 0.3, ease: 'power2.out', boxShadow: isDarkMode ? `0 0 25px rgba(234, 179, 8, 0.4), 0 0 10px rgba(185, 28, 28, 0.3)` : '0 20px 25px -5px rgba(147, 197, 253, 0.3), 0 10px 10px -5px rgba(147, 197, 253, 0.2)', borderColor: isDarkMode ? gqColors.gold : defaultThemeColors.sky500 }); leaveAnim = () => gsap.to(el, { y: 0, scale: 1, duration: 0.3, ease: 'power2.out', boxShadow: isDarkMode ? '0 10px 15px -3px rgba(0,0,0,0.2), 0 4px 6px -2px rgba(0,0,0,0.1)' : '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)', borderColor: isDarkMode ? gqColors.redDark : defaultThemeColors.slate200 }); el.addEventListener('mouseenter', enterAnim); el.addEventListener('mouseleave', leaveAnim); } return () => { if (onClick && enterAnim && leaveAnim) { el.removeEventListener('mouseenter', enterAnim); el.removeEventListener('mouseleave', leaveAnim); } if (gsap?.plugins?.ScrollTrigger) gsap.plugins.ScrollTrigger.getTweensOf(el)?.forEach(t => t.scrollTrigger?.kill()); }; }}, [gsap, isDarkMode, theme, onClick]); return <div ref={cardRef} className={`rounded-lg shadow-2xl p-6 transition-colors duration-300 border ${isDarkMode ? `${theme.bgCard} ${theme.borderColor}` : `${defaultTheme.bgCard} border-slate-200`} ${className}`} onClick={onClick}>{children}</div>; };
const Button = ({ children, onClick, className = '', variant = 'primary', isDarkMode, theme, icon, disabled = false }) => { const base = 'px-6 py-3 rounded-sm font-semibold uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 flex items-center justify-center space-x-2'; let vStyle; if (isDarkMode) { if (variant === 'primary') vStyle = `${theme.buttonPrimaryBg} ${theme.buttonPrimaryText} ${theme.focusRing}/70`; else if (variant === 'secondary') vStyle = `${theme.buttonSecondaryBg} ${theme.buttonSecondaryText} ${theme.focusRing}/70`; else vStyle = `bg-red-700 hover:bg-red-600 text-white focus:ring-red-500/70`; } else { if (variant === 'primary') vStyle = `${defaultTheme.buttonPrimaryBg} ${defaultTheme.buttonPrimaryText} focus:ring-sky-400/70`; else if (variant === 'secondary') vStyle = `${defaultTheme.buttonSecondaryBg} ${defaultTheme.buttonSecondaryText} focus:ring-slate-400/70`; else vStyle = `bg-red-600 hover:bg-red-500 text-white focus:ring-red-400/70`; } const disStyle = disabled ? 'opacity-50 cursor-not-allowed' : ''; return <button onClick={onClick} className={`${base} ${vStyle} ${className} ${disStyle}`} disabled={disabled}>{icon && React.isValidElement(icon) && React.cloneElement(icon, { size: 18, className:"mr-2"})}<span>{children}</span></button>; };
const PageTitle = ({ title, subtitle, icon, isDarkMode, gsap, theme }) => { const titleRef = useRef(null); const subtitleRef = useRef(null); const lineRef = useRef(null); useEffect(() => { let tl; if (gsap && titleRef.current && lineRef.current) { tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.7 }}); tl.from(titleRef.current, { opacity: 0, x: -60, delay: 0.1 }); tl.from(lineRef.current, { width: 0, opacity:0, duration: 0.6, ease: 'power2.inOut'}, "-=0.5"); if (subtitleRef.current) tl.from(subtitleRef.current, { opacity: 0, y: 25, duration: 0.5 }, "-=0.3"); } return () => { if (tl) tl.kill(); }; }, [gsap, title]); return( <div className="mb-10 text-center md:text-left relative"><div className="flex items-center justify-center md:justify-start space-x-4 mb-1">{icon && React.isValidElement(icon) && React.cloneElement(icon, { size: 40, className: `inline-block ${isDarkMode ? theme.accentRed : defaultTheme.accentRed}` })}<h2 ref={titleRef} className={`text-4xl md:text-5xl font-bold tracking-wider uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>{title}</h2></div><div ref={lineRef} className={`h-1 w-24 md:w-32 mt-1 mb-3 rounded-full mx-auto md:mx-0 ${isDarkMode ? `bg-gq-gold` : `bg-sky-500`}`}></div>{subtitle && <p ref={subtitleRef} className={`text-lg ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>{subtitle}</p>}</div> ); };

const HomePage = ({ setCurrentPage, isDarkMode, gsap, theme, topPageData, isTopPageDataLoading, topPageDataFetchError }) => {
  const defaultHeroImage = `https://placehold.co/1200x500/${isDarkMode ? '5C1E3C' : 'A5B4FC'}/${isDarkMode ? gqColors.gold.replace('#','') : '1E293B'}?text=${encodeURIComponent('ミセレイ小隊 - Visual Concept')}&font=montserrat`;
  const NOTE_URL_FALLBACK = "https://note.com/miserei_team";

  const heroData = useMemo(() => {
    if (topPageData && topPageData.length > 0) {
      return topPageData[0];
    }
    return {};
  }, [topPageData]);

  const localHeroImagePath = process.env.PUBLIC_URL + '/images/hero/misereiteam.png';
  const heroImageUrl = localHeroImagePath;

  const xLink = heroData['Ｘアドレス'];
  const youtubeLink = heroData['Youtubeアドレス'];
  const noteLinkFromSheet = heroData['Noteアドレス'];

  const heroSectionRef = useRef(null);
  const heroButtonsRef = useRef(null);
  const sectionTitleRef = useRef(null);

  useEffect(() => {
    if (gsap && !isTopPageDataLoading) {
      if (heroSectionRef.current) {
        gsap.fromTo(heroSectionRef.current, {opacity: 0.5, scale: 1.05}, {opacity: 1, scale: 1, duration: 1.2, ease: 'power2.out', delay: 0.3});
      }
      if (heroButtonsRef.current && (xLink || youtubeLink || noteLinkFromSheet)) {
        gsap.set(heroButtonsRef.current, {opacity: 0, y: 20});
        gsap.to(heroButtonsRef.current, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          delay: 0.8,
          stagger: 0.15,
          ease: 'expo.out'
        });
      }
    }
    if (gsap && sectionTitleRef.current) {
        gsap.from(sectionTitleRef.current, {
            opacity:0, y:40, duration:0.8, ease: 'power3.out',
            scrollTrigger: { trigger: sectionTitleRef.current, start: 'top bottom-=120px', toggleActions: 'play none none none'}
        });
    }
  }, [gsap, isDarkMode, heroImageUrl, isTopPageDataLoading, topPageData, xLink, youtubeLink, noteLinkFromSheet]);

  if (isTopPageDataLoading && !topPageData) {
    return (
      <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>
        <Loader2 size={48} className={`animate-spin ${isDarkMode ? theme.accentGold : defaultTheme.accentGold} mb-4`} />
        <p className="text-lg">トップページデータをロード中...</p>
      </div>
    );
  }

  if (topPageDataFetchError && !topPageData) {
    console.warn("トップページデータ取得エラーのため、ヒーローセクションのSNSリンクは表示されない可能性があります。", topPageDataFetchError);
  }

  return (
    <div className="space-y-16">
      <section ref={heroSectionRef} className={`relative rounded-lg shadow-2xl overflow-hidden border-2 ${isDarkMode ? theme.borderColor : defaultTheme.borderColor}`}>
        <img
          src={heroImageUrl}
          alt="メインビジュアル"
          className="w-full h-72 md:h-96 lg:h-[500px] object-cover"
          onError={(e) => {
            console.warn(`ヒーロー画像の読み込みに失敗しました: ${heroImageUrl}。デフォルトのプレースホルダーを表示します。`);
            e.target.onerror = null;
            e.target.src = defaultHeroImage;
          }}
        />
        <div className="absolute inset-0 flex flex-col justify-end items-center text-center p-4 sm:p-8"> {/* グラデーション削除 */}
          <div ref={heroButtonsRef} style={{opacity:0 }} className="flex flex-wrap justify-center gap-3 sm:gap-4 pb-8 md:pb-12">
            {xLink && (
              <Button onClick={() => window.open(xLink, '_blank')} isDarkMode={isDarkMode} theme={theme} variant="secondary" icon={<MessageSquare />}>
                X (Twitter)
              </Button>
            )}
            {youtubeLink && (
              <Button onClick={() => window.open(youtubeLink, '_blank')} isDarkMode={isDarkMode} theme={theme} variant="secondary" icon={<Youtube />}>
                YouTube
              </Button>
            )}
            {noteLinkFromSheet && (
              <Button onClick={() => window.open(noteLinkFromSheet, '_blank')} isDarkMode={isDarkMode} theme={theme} variant="secondary" icon={<Newspaper />}>
                Note
              </Button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h3 ref={sectionTitleRef} className={`text-3xl md:text-4xl font-semibold mb-10 text-center uppercase tracking-wide ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}>注目のコンテンツ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          <Card isDarkMode={isDarkMode} gsap={gsap} theme={theme} className={`hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'}`}>
            <ShoppingCart size={48} className={`mb-4 ${isDarkMode ? theme.accentRed : defaultTheme.accentRed}`} />
            <h4 className={`text-2xl font-semibold mb-2 uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>最新サプライ</h4>
            <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-4`}>デッキを彩るサプライをチェック。</p> {/* 修正 */}
            <Button onClick={() => setCurrentPage('supplies')} isDarkMode={isDarkMode} theme={theme}>サプライを見る</Button>
          </Card>
          <Card isDarkMode={isDarkMode} gsap={gsap} theme={theme} className={`hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'}`}>
            <Database size={48} className={`mb-4 ${isDarkMode ? theme.accentRed : defaultTheme.accentRed}`} />
            <h4 className={`text-2xl font-semibold mb-2 uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>カードリスト</h4>
            <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-4`}>出展タイトルやカードの種類ごとに検索可能。詳細検索はこちら。</p> {/* 修正 */}
            <Button onClick={() => setCurrentPage('cardlist')} isDarkMode={isDarkMode} theme={theme}>カードリストへ</Button>
          </Card>
           <Card isDarkMode={isDarkMode} gsap={gsap} theme={theme} className={`hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'}`}>
            <Newspaper size={48} className={`mb-4 ${isDarkMode ? theme.accentRed : defaultTheme.accentRed}`} />
            <h4 className={`text-2xl font-semibold mb-2 uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>記事アーカイブ</h4>
            <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-4`}>攻略情報やレビュー記事を読む。</p>
            <Button onClick={() => window.open(NOTE_URL_FALLBACK, '_blank')} isDarkMode={isDarkMode} theme={theme}>記事一覧へ</Button>
          </Card>
          <Card isDarkMode={isDarkMode} gsap={gsap} theme={theme} className={`hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'}`}>
            <HelpCircle size={48} className={`mb-4 ${isDarkMode ? theme.accentRed : defaultTheme.accentRed}`} />
            <h4 className={`text-2xl font-semibold mb-2 uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>用語集</h4>
            <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-4`}>ゲーム内の専門用語をチェック。</p>
            <Button onClick={() => setCurrentPage('glossary')} isDarkMode={isDarkMode} theme={theme}>用語集を見る</Button>
          </Card>
           <Card isDarkMode={isDarkMode} gsap={gsap} theme={theme} className={`hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'}`}>
            <ScrollText size={48} className={`mb-4 ${isDarkMode ? theme.accentRed : defaultTheme.accentRed}`} />
            <h4 className={`text-2xl font-semibold mb-2 uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>ルール解説</h4>
            <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-4`}>詳しいルールやQ&Aを確認。</p>
            <Button onClick={() => setCurrentPage('rules')} isDarkMode={isDarkMode} theme={theme}>ルール解説へ</Button>
          </Card>
          <Card isDarkMode={isDarkMode} gsap={gsap} theme={theme} className={`hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'}`}>
            <BookOpen size={48} className={`mb-4 ${isDarkMode ? theme.accentRed : defaultTheme.accentRed}`} />
            <h4 className={`text-2xl font-semibold mb-2 uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>作品一覧</h4>
            <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-4`}>ガンダムシリーズの壮大な物語を辿る。</p> {/* 修正 */}
            <Button onClick={() => setCurrentPage('serieslist')} isDarkMode={isDarkMode} theme={theme}>作品一覧を見る</Button>
          </Card>
        </div>
      </section>
    </div>
  );
};

const SuppliesPage = ({ isDarkMode, gsap, theme, setCurrentPage }) => {
  const SUPPLIES_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSa3Iw_LyIox-9vbVH4uF3nc-5BYhP2Cp4ITALJFFOKb6SmZqedg7xPyjSemhq2JzhCDYsaZ6YaaPrp/pub?gid=741105973&single=true&output=csv';
  const placeholderImageBase = (width, height, text) => `https://placehold.co/${width}x${height}/${isDarkMode ? '374151' : 'E5E7EB'}/${isDarkMode ? 'F4F4F5' : '374151'}?text=${encodeURIComponent(text)}&font=orbitron`;
  const [suppliesData, setSuppliesData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  useEffect(() => {
    const fetchSuppliesData = async () => {
      if (!SUPPLIES_SPREADSHEET_URL || SUPPLIES_SPREADSHEET_URL.includes('YOUR_SPREADSHEET_ID_PLACEHOLDER') || SUPPLIES_SPREADSHEET_URL.includes('YOUR_GID_PLACEHOLDER')) {
        setFetchError("サプライシートのURLが設定されていません。コード内の SUPPLIES_SPREADSHEET_URL を正しい公開CSV形式のURL（gid指定を含む）に更新してください。"); setIsLoading(false); return;
      }
      setIsLoading(true); setFetchError(null);
      try {
        const response = await fetch(SUPPLIES_SPREADSHEET_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`サプライデータの取得に失敗: ${response.status} ${response.statusText}`);
        const csvText = await response.text(); const parsedItems = parseCSV(csvText);
        const formattedSupplies = parsedItems.map((item, index) => ({ id: item['商品名'] ? `${item['商品名'].replace(/\s+/g, '-')}-${index}` : `supply-${index}`, name: item['商品名'] || 'N/A', price: item['価格'] ? parseFloat(item['価格'].replace(/,/g, '')) : 0, category: item['カテゴリ'] || 'N/A', brand: item['ブランド名'] || 'N/A', description: item['説明文'] || item['商品名'] || '', affiliateLink: item['アフィリンク'] || '#', releaseDate: item['発売日'] || 'N/A', imageUrl: item['画像アドレス'] || null, imageText: item['画像代替テキスト'] || item['商品名'] || '商品画像', }));
        setSuppliesData(formattedSupplies);
      } catch (error) { console.error("サプライデータの取得エラー:", error); setFetchError(error.message); } finally { setIsLoading(false); }
    }; fetchSuppliesData();
  }, [SUPPLIES_SPREADSHEET_URL]);
  const [searchTerm, setSearchTerm] = useState(''); const [selectedCategories, setSelectedCategories] = useState([]); const [selectedBrands, setSelectedBrands] = useState([]); const [sortBy, setSortBy] = useState('releaseDateDesc'); const [filteredSupplies, setFilteredSupplies] = useState([]); const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const categories = useMemo(() => [...new Set(suppliesData.map(s => s.category))].filter(Boolean).sort(), [suppliesData]);
  const brands = useMemo(() => [...new Set(suppliesData.map(s => s.brand))].filter(Boolean).sort(), [suppliesData]);
  const FilterSection = ({ title, items, selectedItems, onToggleItem, icon }) => {
    const [isOpen, setIsOpen] = useState(true);
    return (
      <div className={`py-3 border-b ${isDarkMode ? theme.borderColor : defaultTheme.borderColor}`}>
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-2"><div className="flex items-center">{icon && React.isValidElement(icon) && React.cloneElement(icon, {size:18, className: `mr-2 ${isDarkMode ? theme.accentGold : defaultTheme.accentGold}`})}<span className={`font-semibold uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>{title}</span></div>{isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
        {isOpen && (<div className="mt-2 space-y-1 pl-2 max-h-48 overflow-y-auto">{items.map(item => (<label key={item} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-slate-700/50"><input type="checkbox" className={`form-checkbox h-4 w-4 rounded ${isDarkMode ? `${theme.inputBg} text-gq-gold border-slate-500` : `${defaultTheme.inputBg} text-sky-600 border-slate-400`} ${isDarkMode ? theme.focusRing : defaultTheme.focusRing} focus:ring-offset-0`} checked={selectedItems.includes(item)} onChange={() => onToggleItem(item)} /><span className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>{item}</span></label>))}</div>)}
      </div>);
  };
  useEffect(() => {
    let result = [...suppliesData];
    if (searchTerm) result = result.filter(s => (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) || (s.description && s.description.toLowerCase().includes(searchTerm.toLowerCase())));
    if (selectedCategories.length > 0) result = result.filter(s => s.category && selectedCategories.includes(s.category));
    if (selectedBrands.length > 0) result = result.filter(s => s.brand && selectedBrands.includes(s.brand));
    switch (sortBy) {
      case 'priceAsc': result.sort((a, b) => (a.price || 0) - (b.price || 0)); break;
      case 'priceDesc': result.sort((a, b) => (b.price || 0) - (a.price || 0)); break;
      case 'nameAsc': result.sort((a, b) => (a.name || "").localeCompare(b.name || "")); break;
      case 'releaseDateDesc': default: result.sort((a,b) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime());
    } setFilteredSupplies(result);
  }, [searchTerm, selectedCategories, selectedBrands, sortBy, suppliesData]);
  const productCardRefs = useRef([]); productCardRefs.current = [];
  const addToProductCardRefs = el => { if (el && !productCardRefs.current.includes(el)) productCardRefs.current.push(el); };
  useEffect(() => {
    if (gsap && productCardRefs.current.length > 0) {
      productCardRefs.current.forEach((el, index) => { if (!el) return; gsap.set(el, {opacity:0, y: 50, scale: 0.9}); gsap.to(el, { opacity:1, y: 0, scale: 1, duration: 0.5, delay: index * 0.05, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top bottom-=50px', toggleActions: 'play none none none' }}); });
    } return () => { if (gsap && gsap.plugins && gsap.plugins.ScrollTrigger) { productCardRefs.current.forEach(el => { if (!el) return; const st = gsap.plugins.ScrollTrigger.getTweensOf(el); if (st) st.forEach(tween => tween.scrollTrigger && tween.scrollTrigger.kill()); }); }};
  }, [gsap, filteredSupplies]);
  const sidebarRef = useRef(null); useEffect(() => { if (gsap && sidebarRef.current) gsap.from(sidebarRef.current, {opacity:0, x:-100, duration:0.8, ease: 'power3.out', delay:0.3}); }, [gsap]);
  if (isLoading) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}><Loader2 size={48} className={`animate-spin ${isDarkMode ? theme.accentGold : defaultTheme.accentGold} mb-4`} /><p className="text-lg">サプライデータをロード中...</p></div>;
  if (fetchError) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} text-center px-4`}><AlertTriangle size={48} className={`${isDarkMode ? theme.accentRed : defaultTheme.accentRed} mb-4`} /><p className="text-lg font-semibold">データ取得エラー</p><p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-2`}>サプライデータの読み込みに失敗しました。</p><p className={`text-sm ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>エラー詳細: {fetchError}</p></div>;
  return (
    <div>
      <PageTitle title="サプライ" subtitle="戦場を彩る至高の装備 - 全ての戦士へ" icon={<ShoppingCart />} isDarkMode={isDarkMode} gsap={gsap} theme={theme}/>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <aside ref={sidebarRef} className={`md:w-1/4 lg:w-1/5 ${isMobileFilterOpen ? 'block fixed inset-0 bg-opacity-100 z-40 overflow-y-auto p-6' : 'hidden'} md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:block rounded-lg shadow-lg ${isDarkMode ? theme.bgSidebar : defaultTheme.bgSidebar} ${isDarkMode ? 'p-4' : 'p-6'}`}>
          <div className="flex justify-between items-center md:hidden mb-4"><h3 className={`text-xl font-semibold uppercase ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}>フィルター</h3><Button onClick={() => setIsMobileFilterOpen(false)} isDarkMode={isDarkMode} theme={theme} variant="danger" className="p-2 h-auto"><IconX size={20}/></Button></div>
          <div className="mb-4"><label htmlFor="search-supply" className={`block text-sm font-medium mb-1 ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>キーワード検索</label><div className="relative"><input type="text" id="search-supply" placeholder="商品名、説明文..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full p-2 pr-8 rounded-md border ${isDarkMode ? `${theme.inputBg} ${theme.inputBorder} ${theme.textPrimary}` : `${defaultTheme.inputBg} ${defaultTheme.inputBorder} ${defaultTheme.textPrimary}`} ${isDarkMode ? theme.focusRing : defaultTheme.focusRing} focus:border-transparent`} /><Search size={18} className={`absolute right-2 top-1/2 -translate-y-1/2 ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`} /></div></div>
          <FilterSection title="カテゴリ" items={categories} selectedItems={selectedCategories} onToggleItem={(cat) => setSelectedCategories(p => p.includes(cat) ? p.filter(c => c !== cat) : [...p, cat])} icon={<Layers />}/>
          <FilterSection title="ブランド" items={brands} selectedItems={selectedBrands} onToggleItem={(brand) => setSelectedBrands(p => p.includes(brand) ? p.filter(b => b !== brand) : [...p, brand])} icon={<ShieldCheck/>}/>
        </aside>
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4"><p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>{filteredSupplies.length} 件の商品が見つかりました</p><div className="flex items-center gap-4"><button onClick={() => setIsMobileFilterOpen(true)} className={`md:hidden p-2 rounded-md flex items-center gap-1 ${isDarkMode ? `${theme.buttonSecondaryBg} ${theme.buttonSecondaryText}` : `${defaultTheme.buttonSecondaryBg} ${defaultTheme.buttonSecondaryText}`} `}><Filter size={18}/>フィルター</button><select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`p-2 rounded-md border ${isDarkMode ? `${theme.inputBg} ${theme.inputBorder} ${theme.textPrimary}` : `${defaultTheme.inputBg} ${defaultTheme.inputBorder} ${defaultTheme.textPrimary}`} ${isDarkMode ? theme.focusRing : defaultTheme.focusRing} focus:border-transparent`}><option value="releaseDateDesc">新着順</option><option value="priceAsc">価格が安い順</option><option value="priceDesc">価格が高い順</option><option value="nameAsc">商品名順</option></select></div></div>
          {filteredSupplies.length > 0 ? (<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">{filteredSupplies.map(item => (<div key={item.id} ref={addToProductCardRefs}><Card isDarkMode={isDarkMode} gsap={null} theme={theme} className={`flex flex-col justify-between h-full hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'}`}><div><div className="relative mb-3 aspect-[4/3] bg-slate-700/30 rounded-md overflow-hidden"><img src={item.imageUrl || placeholderImageBase(300, 225, item.imageText)} alt={item.name} className={`w-full h-full object-contain rounded-md shadow-lg border ${isDarkMode ? `border-gq-gold/20` : `border-slate-300/50` }`} onError={(e) => { e.target.onerror = null; e.target.src = placeholderImageBase(300, 225, '画像読込エラー'); }}/></div><h3 className={`text-lg font-semibold mb-1 uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} min-h-[2.5em] line-clamp-2`}>{item.name}</h3><p className={`text-md font-bold mb-1 ${isDarkMode ? `text-gq-red` : `text-red-500`}`}>{item.price > 0 ? item.price.toLocaleString() + "円 (税込)" : "価格未定"}</p><p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} text-xs mb-2`}>発売日: {item.releaseDate}</p><p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} text-xs mb-3 line-clamp-2 min-h-[2.2em]`}>{item.description}</p></div><Button onClick={() => window.open(item.affiliateLink, '_blank')} isDarkMode={isDarkMode} theme={theme} className="w-full mt-auto" variant="secondary" disabled={!item.affiliateLink || item.affiliateLink === '#'}>購入サイトへ</Button></Card></div>))}</div>) : (<div className={`text-center py-10 ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}><ImageIcon size={48} className="mx-auto mb-4 opacity-50"/><p className="text-xl">該当する商品が見つかりませんでした。</p><p>検索条件を変更してお試しください。</p></div>)}
        </main>
      </div>
    </div>);
};

const OriginalStoryPage = ({ isDarkMode, gsap, theme, setCurrentPage, seriesTitle, allSeriesData }) => {
  const placeholderImageBase = (width, height, text) => `https://placehold.co/${width}x${height}/${isDarkMode ? '374151' : 'E5E7EB'}/${isDarkMode ? gqColors.gold.replace('#','') : '1F2937'}?text=${encodeURIComponent(text)}&font=orbitron`;
  const [storyData, setStoryData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  useEffect(() => {
    setIsLoading(true); setFetchError(null);
    if (allSeriesData && allSeriesData.length > 0 && seriesTitle) {
      const currentSeriesData = allSeriesData.find(s => s['作品名'] === seriesTitle);
      if (currentSeriesData) {
        const relatedProducts = [];
        for (let i = 1; i <= 4; i++) {
          if (currentSeriesData[`関連商品${i}`] && currentSeriesData[`関連商品${i}（リンク）`]) {
            relatedProducts.push({ name: currentSeriesData[`関連商品${i}`], link: currentSeriesData[`関連商品${i}（リンク）`] });
          }
        }
        setStoryData({
          title: currentSeriesData['作品名'] || 'N/A', year: currentSeriesData['放送年'] || '',
          overview: currentSeriesData['作品概要'] ? currentSeriesData['作品概要'].replace(/\\n/g, '\n') : 'N/A',
          gameFeatures: currentSeriesData['ガンダムカードゲームにおける特徴'] ? currentSeriesData['ガンダムカードゲームにおける特徴'].replace(/\\n/g, '\n') : 'N/A',
          deckExamples: currentSeriesData['代表的なデッキ/カード'] ? currentSeriesData['代表的なデッキ/カード'].split('\n').map(line => line.trim()).filter(line => line) : [],
          relatedProducts: relatedProducts,
          cardIllustration: currentSeriesData['画像アドレス'] || placeholderImageBase(600, 840, 'イラスト準備中'),
        });
      } else setFetchError(`作品「${seriesTitle}」のデータが見つかりませんでした。`);
    } else if (!seriesTitle) setFetchError("表示する作品が選択されていません。");
    setIsLoading(false);
  }, [seriesTitle, allSeriesData]);
  const containerRef = useRef(null); const imageRef = useRef(null); const contentRef = useRef(null);
  useEffect(() => {
    if (gsap && storyData && containerRef.current && imageRef.current && contentRef.current) {
      gsap.set([imageRef.current, contentRef.current], { opacity: 0 });
      const tl = gsap.timeline({ scrollTrigger: { trigger: containerRef.current, start: 'top center+=100px', toggleActions: 'play none none none' }, defaults: { ease: 'power3.out' }});
      tl.to(imageRef.current, { opacity: 1, x: 0, duration: 0.8, delay:0.2 }).to(contentRef.current, { opacity: 1, y: 0, duration: 0.8 }, "-=0.5");
    }
  }, [gsap, storyData]);
  if (isLoading && !storyData && !fetchError) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}><Loader2 size={48} className={`animate-spin ${isDarkMode ? theme.accentGold : defaultTheme.accentGold} mb-4`} /><p className="text-lg">作品データを準備中...</p></div>;
  if (fetchError) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} text-center px-4`}><AlertTriangle size={48} className={`${isDarkMode ? theme.accentRed : defaultTheme.accentRed} mb-4`} /><p className="text-lg font-semibold">データ表示エラー</p><p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-2`}>{fetchError}</p><Button onClick={() => setCurrentPage('serieslist')} isDarkMode={isDarkMode} theme={theme} variant="secondary" icon={<ArrowLeft size={18}/>}>作品一覧へ戻る</Button></div>;
  if (!storyData) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}><HelpCircle size={48} className={`${isDarkMode ? theme.accentGold : defaultTheme.accentGold} mb-4`} /><p className="text-lg">表示する作品データが見つかりませんでした。</p><Button onClick={() => setCurrentPage('serieslist')} isDarkMode={isDarkMode} theme={theme} variant="secondary" className="mt-4" icon={<ArrowLeft size={18}/>}>作品一覧へ戻る</Button></div>;
  return (
    <div ref={containerRef}>
      <div className="mb-6"><Button onClick={() => setCurrentPage('serieslist')} isDarkMode={isDarkMode} theme={theme} variant="secondary" icon={<ArrowLeft size={18}/>}>作品一覧へ戻る</Button></div>
      <PageTitle title={storyData.title} subtitle={storyData.year ? `放送年: ${storyData.year}` : ''} icon={<BookOpen />} isDarkMode={isDarkMode} gsap={gsap} theme={theme}/>
      <div className={`rounded-lg shadow-2xl p-6 md:p-8 ${isDarkMode ? theme.bgCard : defaultTheme.bgCard} ${isDarkMode ? `border ${theme.borderColor}` : 'border border-slate-200'}`}>
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          <div ref={imageRef} style={{opacity:0, transform: 'translateX(-50px)'}} className="w-full md:w-1/3 lg:w-2/5 flex-shrink-0">
            <img src={storyData.cardIllustration} alt={`カードイラスト: ${storyData.title}`} className={`w-full h-auto object-contain rounded-md shadow-lg ${isDarkMode ? `border-2 ${theme.borderColor}` : 'border-2 border-slate-300'}`} onError={(e) => { e.target.onerror = null; e.target.src = placeholderImageBase(600, 840, '画像読込エラー'); }}/>
            <p className={`text-xs mt-2 text-center ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>※表示はイメージです。実際のカードイラストとは異なる場合があります。</p>
          </div>
          <div ref={contentRef} style={{opacity:0, transform: 'translateY(50px)'}} className="w-full md:w-2/3 lg:w-3/5 space-y-6">
            <div><h3 className={`text-2xl font-bold uppercase mb-2 flex items-center ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}><Info size={24} className="mr-2"/> 作品概要</h3><p className={`${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} leading-relaxed whitespace-pre-line`}>{storyData.overview}</p></div>
            <div><h3 className={`text-2xl font-bold uppercase mb-2 flex items-center ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}><Puzzle size={24} className="mr-2"/> ガンダムカードゲームにおける特徴</h3><p className={`${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} leading-relaxed whitespace-pre-line`}>{storyData.gameFeatures}</p></div>
            {storyData.deckExamples && storyData.deckExamples.length > 0 && (<div><h3 className={`text-2xl font-bold uppercase mb-3 flex items-center ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}><ListChecks size={24} className="mr-2"/> 代表的なデッキ/カード</h3><ul className="space-y-2">{storyData.deckExamples.map((deckExample, index) => (<li key={index} className={`${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} border-l-4 ${isDarkMode ? theme.borderColor : defaultTheme.borderColor} pl-3 py-1`}>{deckExample}</li>))}</ul></div>)}
            {storyData.relatedProducts && storyData.relatedProducts.length > 0 && (<div><h3 className={`text-2xl font-bold uppercase mb-3 flex items-center ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}><Palette size={24} className="mr-2" /> 関連商品</h3><div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{storyData.relatedProducts.map((product, index) => (<Button key={index} onClick={() => window.open(product.link, '_blank')} isDarkMode={isDarkMode} theme={theme} variant="primary" icon={<ExternalLink />} className="w-full" disabled={!product.link || product.link === '#'}>{product.name}</Button>))}</div></div>)}
          </div>
        </div>
      </div>
    </div>
  );
};

const SeriesListPage = ({ isDarkMode, gsap, theme, setCurrentPage, setSelectedSeriesTitle, allSeriesData, isLoading, fetchError }) => {
  const placeholderImageBase = (width, height, text) => `https://placehold.co/${width}x${height}/${isDarkMode ? '1F2937' : 'E5E7EB'}/${isDarkMode ? gqColors.gold.replace('#','') : '1F2937'}?text=${encodeURIComponent(text)}&font=orbitron`;
  const seriesCardRefs = useRef([]); seriesCardRefs.current = [];
  const addToSeriesCardRefs = el => { if (el && !seriesCardRefs.current.includes(el)) seriesCardRefs.current.push(el); };
  const sortedSeriesData = React.useMemo(() => { if (!allSeriesData) return []; return [...allSeriesData].sort((a, b) => { const yearA = parseInt(a['放送年'], 10); const yearB = parseInt(b['放送年'], 10); if (isNaN(yearA) && isNaN(yearB)) return 0; if (isNaN(yearA)) return 1; if (isNaN(yearB)) return -1; return yearA - yearB; }); }, [allSeriesData]);
  useEffect(() => {
    if (gsap && seriesCardRefs.current.length > 0) {
      seriesCardRefs.current.forEach((el, index) => { if (!el) return; gsap.set(el, { opacity: 0, y: 50, scale: 0.95 }); gsap.to(el, { opacity: 1, y: 0, scale: 1, duration: 0.6, delay: index * 0.07, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top bottom-=70px', toggleActions: 'play none none none' }}); });
    } return () => { if (gsap && gsap.plugins && gsap.plugins.ScrollTrigger) { seriesCardRefs.current.forEach(el => { if (!el) return; const st = gsap.plugins.ScrollTrigger.getTweensOf(el); if (st) st.forEach(tween => tween.scrollTrigger && tween.scrollTrigger.kill()); }); }};
  }, [gsap, sortedSeriesData]);
  if (isLoading) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}><Loader2 size={48} className={`animate-spin ${isDarkMode ? theme.accentGold : defaultTheme.accentGold} mb-4`} /><p className="text-lg">作品リストをロード中...</p></div>;
  if (fetchError) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} text-center px-4`}><AlertTriangle size={48} className={`${isDarkMode ? theme.accentRed : defaultTheme.accentRed} mb-4`} /><p className="text-lg font-semibold">データ取得エラー</p><p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-2`}>作品リストの読み込みに失敗しました。</p><p className={`text-sm ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>エラー詳細: {fetchError}</p></div>;
  if (!sortedSeriesData || sortedSeriesData.length === 0) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}><HelpCircle size={48} className={`${isDarkMode ? theme.accentGold : defaultTheme.accentGold} mb-4`} /><p className="text-lg">表示する作品がありません。</p></div>;
  return (
    <div>
      <PageTitle title="作品一覧" subtitle="ガンダムサーガの各時代を辿る" icon={<Library />} isDarkMode={isDarkMode} gsap={gsap} theme={theme} />
      <div className="relative md:py-8">
        <div className={`hidden md:block absolute left-1/2 top-0 bottom-0 w-1 ${isDarkMode ? 'bg-gq-gold opacity-30' : `bg-sky-500 opacity-30`} transform -translate-x-1/2`}></div>
        {sortedSeriesData.map((series, index) => (
          <div key={series['作品名'] || index} ref={addToSeriesCardRefs} className={`mb-8 md:mb-0 flex group relative`}>
            <div className={`md:hidden absolute left-5 top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-gq-gold opacity-50' : `bg-sky-500 opacity-50`}`}></div>
            <div className={`md:hidden absolute left-[1.125rem] top-1 w-4 h-4 rounded-full ${isDarkMode ? 'bg-gq-gold' : `bg-sky-600`} transform -translate-x-1/2 z-10`}></div>
            <div className={`hidden md:flex w-1/2 ${index % 2 === 0 ? 'md:pr-8 md:justify-end' : 'md:pl-8 md:order-2 md:justify-start'}`}></div>
            <div className={`w-full md:w-1/2 ${index % 2 === 0 ? 'md:pl-8' : 'md:pr-8 md:order-1'} pl-10 md:pl-0 md:py-4 relative`}>
              <div className={`hidden md:block absolute top-1/2 w-4 h-4 rounded-full ${isDarkMode ? 'bg-gq-gold' : `bg-sky-600`} transform -translate-y-1/2 z-10 ${index % 2 === 0 ? 'right-[calc(100%-0.5rem)] -translate-x-0' : 'left-[calc(100%-0.5rem)] translate-x-0'}`}></div>
              <Card isDarkMode={isDarkMode} gsap={null} theme={theme} className={`flex flex-col md:flex-row items-center p-4 cursor-pointer hover:shadow-xl transition-all duration-300 ${isDarkMode ? theme.bgArticleCard : defaultTheme.bgArticleCard} hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'}`}
                onClick={() => { setSelectedSeriesTitle(series['作品名']); setCurrentPage('story'); }}>
                <img src={series['画像アドレス'] || placeholderImageBase(120, 160, series['作品名'] || 'No Image')} alt={series['作品名']} className="w-20 h-auto md:w-24 md:h-auto object-contain rounded-md shadow-lg mr-0 md:mr-4 mb-3 md:mb-0 flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = placeholderImageBase(120, 160, 'Load Error'); }}/>
                <div className="text-center md:text-left"><h3 className={`text-lg md:text-xl font-bold uppercase ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}>{String(series['作品名'] || '')}</h3>{series['放送年'] && (<p className={`text-xs md:text-sm ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mt-1`}>放送年: {String(series['放送年'] || '')}</p>)}</div>
              </Card>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CardListPage = ({ isDarkMode, gsap, theme, setCurrentPage }) => {
  const CARDLIST_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSa3Iw_LyIox-9vbVH4uF3nc-5BYhP2Cp4ITALJFFOKb6SmZqedg7xPyjSemhq2JzhCDYsaZ6YaaPrp/pub?gid=0&single=true&output=csv';
  const cardImagePlaceholderBg = isDarkMode ? '2D2D2D' : 'E0E0E0'; const cardImagePlaceholderText = isDarkMode ? 'A0A0A0' : '6B7280';
  const placeholderImageUrl = (width, height, text) => `https://placehold.co/${width}x${height}/${cardImagePlaceholderBg.replace('#','')}/${cardImagePlaceholderText.replace('#','')}?text=${encodeURIComponent(text)}&font=rajdhani`;
  const [initialCardsData, setInitialCardsData] = useState([]); const [isLoading, setIsLoading] = useState(true); const [fetchError, setFetchError] = useState(null);
  useEffect(() => {
    if (!CARDLIST_SPREADSHEET_URL || CARDLIST_SPREADSHEET_URL.includes('YOUR_SPREADSHEET_ID_PLACEHOLDER')) {
      setFetchError("カードリストシートのURLが設定されていません。コード内の CARDLIST_SPREADSHEET_URL を正しい公開CSV形式のURL（gid指定を含む）に更新してください。"); setIsLoading(false); return;
    }
    const fetchCardData = async () => {
      setIsLoading(true); setFetchError(null);
      try {
        const response = await fetch(CARDLIST_SPREADSHEET_URL, { cache: 'no-store' }); if (!response.ok) throw new Error(`カードデータの取得に失敗しました: ${response.status} ${response.statusText}`);
        const csvText = await response.text(); const parsedItems = parseCSV(csvText);
        const formattedCards = parsedItems.map((item, index) => {
          const card = { id: item['画像アドレス'] ? item['画像アドレス'].split('/').pop().split('?')[0].split('.')[0] : `${item['カード名'] || 'unknownCard'}-${index}`, cardNumber: item['リンク'] || 'N/A', name: item['カード名'] || 'N/A', level: item['レベル'] ? (parseInt(item['レベル'], 10) || 0) : 0, cost: item['コスト'] ? (parseInt(item['コスト'], 10) || 0) : 0, color: item['色'] || '-', type: item['タイプ'] || '-', effect: item['効果'] ? item['効果'].replace(/\\n/g, '\n') : '-', terrain: item['地形'] || '-', characteristic: item['特徴'] || '-', ap: item['AP'] ? (parseInt(item['AP'], 10) || 0) : 0, hp: item['HP'] ? (parseInt(item['HP'], 10) || 0) : 0, series: item['出典タイトル'] || '-', imageUrl: item['画像アドレス'] || '', imageText: item['カード名'] || 'カード画像', rarity: item['レアリティ'] || 'N/A' };
          return card;
        });
        setInitialCardsData(formattedCards);
      } catch (error) { console.error("カードデータの取得エラー:", error); setFetchError(error.message); } finally { setIsLoading(false); }
    }; fetchCardData();
  }, [CARDLIST_SPREADSHEET_URL]);
  const [searchTerm, setSearchTerm] = useState(''); const [selectedSeries, setSelectedSeries] = useState([]); const [selectedTypes, setSelectedTypes] = useState([]); const [selectedColors, setSelectedColors] = useState([]); const [selectedLevels, setSelectedLevels] = useState([]); const [selectedTerrains, setSelectedTerrains] = useState([]);
  const [sortBy, setSortBy] = useState('nameAsc');
  const [viewMode, setViewMode] = useState('grid'); const [filteredCards, setFilteredCards] = useState([]); const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); const [modalCardDetails, setModalCardDetails] = useState(null);
  const showModal = (card) => { setModalCardDetails(card); setIsModalOpen(true); }; const closeModal = () => { setIsModalOpen(false); setModalCardDetails(null); };
  const allSeries = useMemo(() => [...new Set(initialCardsData.map(c => c.series))].filter(Boolean).sort((a,b) => a.localeCompare(b, 'ja')), [initialCardsData]);
  const allTypes = useMemo(() => [...new Set(initialCardsData.map(c => c.type))].filter(Boolean).sort((a,b) => a.localeCompare(b, 'ja')), [initialCardsData]);
  const allColors = useMemo(() => [...new Set(initialCardsData.map(c => c.color))].filter(Boolean).sort((a,b) => a.localeCompare(b, 'ja')), [initialCardsData]);
  const allLevels = useMemo(() => [...new Set(initialCardsData.map(c => c.level?.toString()))].filter(Boolean).sort((a,b) => parseInt(a) - parseInt(b)), [initialCardsData]);
  const allTerrains = useMemo(() => [...new Set(initialCardsData.flatMap(c => c.terrain ? c.terrain.split(',').map(t => t.trim()).filter(t => t) : []))].filter(Boolean).sort((a,b) => a.localeCompare(b, 'ja')), [initialCardsData]);
  const FilterSection = ({ title, items, selectedItems, onToggleItem, icon }) => {
    const [isOpen, setIsOpen] = useState(true); if (!items || items.length === 0) return null;
    return (
      <div className={`py-3 border-b ${isDarkMode ? theme.borderColor : defaultTheme.borderColor}`}>
        <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center py-2">
          <div className="flex items-center">{icon && React.isValidElement(icon) && React.cloneElement(icon, {size:18, className: `mr-2 ${isDarkMode ? theme.accentGold : defaultTheme.accentGold}`})}<span className={`font-semibold uppercase ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>{title}</span></div>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {isOpen && (<div className="mt-2 space-y-1 pl-2 max-h-40 overflow-y-auto">{items.map(item => (<label key={item} className="flex items-center space-x-2 cursor-pointer p-1 rounded hover:bg-slate-700/50"><input type="checkbox" className={`form-checkbox h-4 w-4 rounded ${isDarkMode ? `${theme.inputBg} text-gq-gold border-slate-500` : `${defaultTheme.inputBg} text-sky-600 border-slate-400`} ${isDarkMode ? theme.focusRing : defaultTheme.focusRing} focus:ring-offset-0`} checked={selectedItems.includes(item)} onChange={() => onToggleItem(item)} /><span className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>{item}</span></label>))}</div>)}
      </div>);
  };
  useEffect(() => {
    let result = [...initialCardsData]; if (!initialCardsData.length) { setFilteredCards([]); return; }
    if (searchTerm) { const lowerSearchTerm = searchTerm.toLowerCase(); result = result.filter(c => (c.name && c.name.toLowerCase().includes(lowerSearchTerm)) || (c.cardNumber && c.cardNumber.toLowerCase().includes(lowerSearchTerm)) || (c.effect && c.effect.toLowerCase().includes(lowerSearchTerm)) || (c.characteristic && c.characteristic.toLowerCase().includes(lowerSearchTerm)) || (c.series && c.series.toLowerCase().includes(lowerSearchTerm)));}
    if (selectedSeries.length > 0) result = result.filter(c => c.series && selectedSeries.includes(c.series));
    if (selectedTypes.length > 0) result = result.filter(c => c.type && selectedTypes.includes(c.type));
    if (selectedColors.length > 0) result = result.filter(c => c.color && selectedColors.includes(c.color));
    if (selectedLevels.length > 0) result = result.filter(c => c.level !== undefined && selectedLevels.includes(c.level.toString()));
    if (selectedTerrains.length > 0) { result = result.filter(c => { const cardTerrains = c.terrain ? c.terrain.split(',').map(t => t.trim()) : []; return selectedTerrains.some(st => cardTerrains.includes(st)); });}
    switch (sortBy) {
      case 'nameAsc': result.sort((a, b) => (a.name || "").localeCompare(b.name || "", 'ja')); break;
      case 'apDesc': result.sort((a, b) => (b.ap || 0) - (a.ap || 0)); break;
      case 'hpDesc': result.sort((a, b) => (b.hp || 0) - (a.hp || 0)); break;
      case 'costAsc': result.sort((a,b) => (a.cost || 0) - (b.cost || 0)); break;
      case 'levelAsc': result.sort((a,b) => (a.level || 0) - (b.level || 0)); break;
      default: result.sort((a,b) => (a.name || "").localeCompare(b.name || "", 'ja'));
    } setFilteredCards(result);
  }, [searchTerm, selectedSeries, selectedTypes, selectedColors, selectedLevels, selectedTerrains, sortBy, initialCardsData]);
  const cardItemRefs = useRef([]); cardItemRefs.current = [];
  const addToCardItemRefs = el => { if (el && !cardItemRefs.current.includes(el)) cardItemRefs.current.push(el); };
  useEffect(() => {
    const triggers = [];
    if (gsap && cardItemRefs.current.length > 0) {
      cardItemRefs.current.forEach((el, index) => {
        if (!el) return;
        gsap.killTweensOf(el);
        if (gsap.plugins.ScrollTrigger) { // ScrollTriggerが利用可能か確認 (gsapInstanceから取得)
            const existingTrigger = gsap.plugins.ScrollTrigger.getById(`card-${el.dataset.id || index}`);
            if(existingTrigger) existingTrigger.kill();
        }

        const anim = gsap.fromTo(el,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0, duration: 0.5, delay: index * 0.03, ease: 'power2.out',
            scrollTrigger: {
              id: `card-${el.dataset.id || index}`,
              trigger: el,
              start: 'top bottom-=30px',
              toggleActions: 'play none none none',
            }
          }
        );
        if (anim.scrollTrigger) {
            triggers.push(anim.scrollTrigger);
        }
      });
    }
    return () => {
      triggers.forEach(trigger => trigger && trigger.kill());
      cardItemRefs.current = [];
    };
  }, [gsap, filteredCards, viewMode]);

  const sidebarRef = useRef(null); useEffect(() => { if (gsap && sidebarRef.current) gsap.from(sidebarRef.current, {opacity:0, x:-100, duration:0.8, ease: 'power3.out', delay:0.3}); }, [gsap]);
  if (isLoading) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}><Loader2 size={48} className={`animate-spin ${isDarkMode ? theme.accentGold : defaultTheme.accentGold} mb-4`} /><p className="text-lg">カードデータをロード中...</p></div>;
  if (fetchError) return <div className={`flex flex-col justify-center items-center h-[calc(100vh-200px)] ${isDarkMode ? theme.bgBase : defaultTheme.bgBase} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} text-center px-4`}><AlertTriangle size={48} className={`${isDarkMode ? theme.accentRed : defaultTheme.accentRed} mb-4`} /><p className="text-lg font-semibold">データ取得エラー</p><p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mb-2`}>カードデータの読み込みに失敗しました。</p><p className={`text-sm ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>エラー詳細: {fetchError}</p>{(CARDLIST_SPREADSHEET_URL.includes('YOUR_SPREADSHEET_ID_PLACEHOLDER')) && (<p className={`mt-4 p-3 rounded-md ${isDarkMode ? 'bg-yellow-900/50 border border-yellow-700' : 'bg-yellow-100 border border-yellow-300'} text-sm ${isDarkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>コード内の `CARDLIST_SPREADSHEET_URL` を、Googleスプレッドシートを「ウェブに公開」して取得した実際のURL（gid指定を含む）に置き換えてください。</p>)}</div>;
  return (
    <div>
      <PageTitle title="カードデータベース" subtitle="全カードを網羅！詳細検索可能" icon={<Database />} isDarkMode={isDarkMode} gsap={gsap} theme={theme}/>
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <aside ref={sidebarRef} className={`md:w-1/4 lg:w-1/5 ${isMobileFilterOpen ? 'block fixed inset-0 bg-opacity-90 z-40 overflow-y-auto p-6' : 'hidden'} md:sticky md:top-24 md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:block rounded-lg shadow-lg ${isDarkMode ? theme.bgSidebar : defaultTheme.bgSidebar} ${isDarkMode ? 'p-4' : 'p-6'}`}>
          <div className="flex justify-between items-center md:hidden mb-4"><h3 className={`text-xl font-semibold uppercase ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}>フィルター</h3><Button onClick={() => setIsMobileFilterOpen(false)} isDarkMode={isDarkMode} theme={theme} variant="danger" className="p-2 h-auto"><IconX size={20}/></Button></div>
          <div className="mb-4"><label htmlFor="search-card" className={`block text-sm font-medium mb-1 ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>キーワード/カード番号</label><div className="relative"><input type="text" id="search-card" placeholder="カード名、効果、シリーズ..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full p-2 pr-8 rounded-md border ${isDarkMode ? `${theme.inputBg} ${theme.inputBorder} ${theme.textPrimary}` : `${defaultTheme.inputBg} ${defaultTheme.inputBorder} ${defaultTheme.textPrimary}`} ${isDarkMode ? theme.focusRing : defaultTheme.focusRing} focus:border-transparent`} /><Search size={18} className={`absolute right-2 top-1/2 -translate-y-1/2 ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`} /></div></div>
          <FilterSection title="出典タイトル" items={allSeries} selectedItems={selectedSeries} onToggleItem={(item) => setSelectedSeries(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])} icon={<BookOpen />} />
          <FilterSection title="種類" items={allTypes} selectedItems={selectedTypes} onToggleItem={(item) => setSelectedTypes(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])} icon={<Layers />} />
          <FilterSection title="色" items={allColors} selectedItems={selectedColors} onToggleItem={(item) => setSelectedColors(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])} icon={<Palette />} />
          <FilterSection title="レベル" items={allLevels} selectedItems={selectedLevels} onToggleItem={(item) => setSelectedLevels(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])} icon={<TrendingUp />} />
          <FilterSection title="地形" items={allTerrains} selectedItems={selectedTerrains} onToggleItem={(item) => setSelectedTerrains(p => p.includes(item) ? p.filter(x => x !== item) : [...p, item])} icon={<MapPin />} />
        </aside>
        <main className="w-full md:w-3/4 lg:w-4/5">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>{filteredCards.length} 件のカード</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMobileFilterOpen(true)} className={`md:hidden p-2 rounded-md flex items-center gap-1 ${isDarkMode ? `${theme.buttonSecondaryBg} ${theme.buttonSecondaryText}` : `${defaultTheme.buttonSecondaryBg} ${defaultTheme.buttonSecondaryText}`} `}><Filter size={18}/>フィルター</button>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`p-2 rounded-md border ${isDarkMode ? `${theme.inputBg} ${theme.inputBorder} ${theme.textPrimary}` : `${defaultTheme.inputBg} ${defaultTheme.inputBorder} ${defaultTheme.textPrimary}`} ${isDarkMode ? theme.focusRing : defaultTheme.focusRing} focus:border-transparent`}>
                <option value="nameAsc">名称順 (日)</option>
                <option value="apDesc">AP降順</option>
                <option value="hpDesc">HP降順</option>
                <option value="costAsc">コスト昇順</option>
                <option value="levelAsc">レベル昇順</option>
              </select>
              <div className="flex rounded-md" role="group"><button type="button" onClick={() => setViewMode('grid')} className={`p-2 border ${viewMode === 'grid' ? (isDarkMode ? `bg-gq-gold text-black` : `bg-sky-500 text-white`) : (isDarkMode ? `${theme.inputBg} ${theme.inputBorder} hover:bg-slate-700` : `${defaultTheme.inputBg} ${defaultTheme.inputBorder} hover:bg-slate-200`)} rounded-l-md`}><Grid size={20}/></button><button type="button" onClick={() => setViewMode('list')} className={`p-2 border ${viewMode === 'list' ? (isDarkMode ? `bg-gq-gold text-black` : `bg-sky-500 text-white`) : (isDarkMode ? `${theme.inputBg} ${theme.inputBorder} hover:bg-slate-700` : `${defaultTheme.inputBg} ${defaultTheme.inputBorder} hover:bg-slate-200`)} rounded-r-md`}><List size={20}/></button></div>
            </div>
          </div>
          {filteredCards.length > 0 ? ( viewMode === 'grid' ? (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4">{filteredCards.map(card => (<div key={card.id} data-id={card.id} ref={addToCardItemRefs} className={`rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer ${isDarkMode ? `bg-slate-800 border border-gq-gold/30 hover:border-gq-gold` : `bg-white border border-slate-200 hover:border-sky-500`}`} onClick={() => showModal(card)}><img src={card.imageUrl || placeholderImageUrl(200, 280, card.imageText)} alt={card.name} className="w-full aspect-[5/7] object-cover" onError={(e) => { e.target.onerror = null; e.target.src = placeholderImageUrl(200,280, 'Error'); }}/><div className="p-3"><h4 className={`font-bold text-sm truncate ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>{card.name}</h4></div></div>))}</div>) : (<div className="space-y-3">{filteredCards.map(card => (<div key={card.id} data-id={card.id} ref={addToCardItemRefs} className={`flex flex-col sm:flex-row items-start sm:items-center p-3 rounded-lg shadow-md cursor-pointer ${isDarkMode ? theme.bgArticleCard : defaultTheme.bgArticleCard} hover:border-${isDarkMode ? 'gq-gold' : 'sky-500'} border`} onClick={() => showModal(card)}><img src={card.imageUrl || placeholderImageUrl(80, 112, card.imageText)} alt={card.name} className="w-[80px] h-[112px] object-cover rounded-sm mr-0 sm:mr-4 mb-2 sm:mb-0 flex-shrink-0" onError={(e) => { e.target.onerror = null; e.target.src = placeholderImageUrl(80,112, 'Err'); }}/><div className="flex-1"><h4 className={`font-bold ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>{card.name}</h4><p className={`text-sm ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>作品: {card.series || '-'} | タイプ: {card.type || '-'} | 色: {card.color || '-'}</p><p className={`text-sm ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>レベル: {card.level} | コスト: {card.cost} | AP: {card.ap} | HP: {card.hp}</p><p className={`text-sm ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>地形: {card.terrain || '-'} | 特徴: {card.characteristic || '-'}</p><p className={`text-xs mt-1 ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} line-clamp-2`}>効果: {card.effect || '-'}</p></div></div>))}</div>)
          ) : (<div className={`text-center py-10 ${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}><Database size={48} className="mx-auto mb-4 opacity-50"/><p className="text-xl">該当するカードが見つかりませんでした。</p><p>検索条件を変更してお試しください。</p></div>)}
        </main>
      </div>
      {isModalOpen && modalCardDetails && (<div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4 overflow-y-auto" onClick={closeModal}><div className={`${isDarkMode ? theme.bgCard : defaultTheme.bgCard} ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary} p-5 sm:p-6 rounded-lg shadow-xl max-w-2xl w-full mx-auto my-8 max-h-[90vh] overflow-y-auto border-2 ${isDarkMode ? theme.borderColor : defaultTheme.borderColor}`} onClick={(e) => e.stopPropagation()}><div className="flex justify-between items-center mb-4"><h4 className={`text-2xl font-bold ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}>{modalCardDetails.name || 'N/A'}</h4><Button onClick={closeModal} isDarkMode={isDarkMode} theme={theme} variant="danger" className="p-2 h-auto w-auto"><IconX size={20}/></Button></div><div className="flex flex-col md:flex-row gap-4"><img src={modalCardDetails.imageUrl || placeholderImageUrl(300, 420, modalCardDetails.imageText || 'No Image')} alt={modalCardDetails.name || 'Card Image'} className="w-full md:w-1/2 max-w-[300px] h-auto object-contain rounded-md shadow-lg mx-auto md:mx-0" onError={(e) => { e.target.onerror = null; e.target.src = placeholderImageUrl(300,420, 'Error'); }}/>
              <div className="md:w-1/2 space-y-2 text-sm">
                <p><strong>出典:</strong> {modalCardDetails.series || '-'}</p>
                <p><strong>タイプ:</strong> {modalCardDetails.type || '-'}</p>
                <p><strong>色:</strong> {modalCardDetails.color || '-'}</p>
                <p><strong>レベル:</strong> {modalCardDetails.level}</p>
                <p><strong>コスト:</strong> {modalCardDetails.cost}</p>
                <p><strong>AP:</strong> {modalCardDetails.ap}</p>
                <p><strong>HP:</strong> {modalCardDetails.hp}</p>
                <p><strong>地形:</strong> {modalCardDetails.terrain || '-'}</p>
                <p><strong>特徴:</strong> {modalCardDetails.characteristic || '-'}</p>
              </div>
            </div>
            <div className="mt-4">
              <h5 className={`text-lg font-semibold mb-1 ${isDarkMode ? theme.textAccent : defaultTheme.textAccent}`}>効果:</h5>
              <p className="whitespace-pre-line text-sm">{modalCardDetails.effect || '-'}</p>
            </div>
          </div></div>)}
    </div>
  );
};

const GlossaryPage = ({ isDarkMode, gsap, theme, setCurrentPage }) => ( <div> <PageTitle title="用語集" subtitle="ガンダムカードゲームの専門用語を解説" icon={<HelpCircle />} isDarkMode={isDarkMode} gsap={gsap} theme={theme}/> <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg shadow-xl ${isDarkMode ? theme.bgCard : defaultTheme.bgCard} ${isDarkMode ? `border ${theme.borderColor}` : 'border border-slate-200'}`}> <Construction size={64} className={`mb-6 ${isDarkMode ? theme.accentGold : defaultTheme.accentGold}`} /> <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>用語集ページは現在整備中です</h3> <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>より詳細な情報を提供できるよう準備を進めております。今しばらくお待ちください。</p> <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mt-2`}>お急ぎの場合は、<a href="https://www.gundam-gcg.com/jp/welcome/playguide.php" target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? theme.textAccent : defaultTheme.textAccent} hover:text-opacity-80`}>公式サイトのプレイガイド</a>をご確認ください。</p> </div> </div> );
const RuleExplanationPage = ({ isDarkMode, gsap, theme, setCurrentPage }) => ( <div> <PageTitle title="ルール解説" subtitle="詳細なルールとQ&A" icon={<ScrollText />} isDarkMode={isDarkMode} gsap={gsap} theme={theme}/> <div className={`flex flex-col items-center justify-center text-center p-8 rounded-lg shadow-xl ${isDarkMode ? theme.bgCard : defaultTheme.bgCard} ${isDarkMode ? `border ${theme.borderColor}` : 'border border-slate-200'}`}> <Construction size={64} className={`mb-6 ${isDarkMode ? theme.accentGold : defaultTheme.accentGold}`} /> <h3 className={`text-2xl font-bold mb-3 ${isDarkMode ? theme.textPrimary : defaultTheme.textPrimary}`}>ルール解説ページは現在整備中です</h3> <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary}`}>より分かりやすい解説を提供できるよう準備を進めております。今しばらくお待ちください。</p> <p className={`${isDarkMode ? theme.textSecondary : defaultTheme.textSecondary} mt-2`}>お急ぎの場合は、<a href="https://www.gundam-gcg.com/jp/welcome/playguide.php" target="_blank" rel="noopener noreferrer" className={`underline ${isDarkMode ? theme.textAccent : defaultTheme.textAccent} hover:text-opacity-80`}>公式サイトのプレイガイド</a>をご確認ください。</p> </div> </div> );
// OfficialInfoPage と PlayerVideosPage は削除

// --- Main App Component ---
const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [gsapInstance, setGsapInstance] = useState(null);
  const [selectedSeriesTitle, setSelectedSeriesTitle] = useState(null);
  const [allSeriesData, setAllSeriesData] = useState([]);
  const [isSeriesDataLoading, setIsSeriesDataLoading] = useState(true);
  const [seriesDataFetchError, setSeriesDataFetchError] = useState(null);

  const [topPageData, setTopPageData] = useState(null);
  const [isTopPageDataLoading, setIsTopPageDataLoading] = useState(true);
  const [topPageDataFetchError, setTopPageDataFetchError] = useState(null);

  const STORY_SPREADSHEET_URL_GLOBAL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSa3Iw_LyIox-9vbVH4uF3nc-5BYhP2Cp4ITALJFFOKb6SmZqedg7xPyjSemhq2JzhCDYsaZ6YaaPrp/pub?gid=744795432&single=true&output=csv';
  const TOP_PAGE_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSa3Iw_LyIox-9vbVH4uF3nc-5BYhP2Cp4ITALJFFOKb6SmZqedg7xPyjSemhq2JzhCDYsaZ6YaaPrp/pub?gid=302390419&single=true&output=csv';

  const currentTheme = isDarkMode ? gquuuuuuxTheme : defaultTheme;
  const initialAuthToken = typeof __initial_auth_token !== 'undefined' // eslint-disable-line no-undef
    ? __initial_auth_token // eslint-disable-line no-undef
    : undefined;


  useEffect(() => { loadGsap((gsap) => { setGsapInstance(gsap); }); }, []);

  useEffect(() => {
    const fetchAllSeries = async () => {
      if (!STORY_SPREADSHEET_URL_GLOBAL || STORY_SPREADSHEET_URL_GLOBAL.includes('YOUR_SPREADSHEET_ID_PLACEHOLDER')) {
        setSeriesDataFetchError("作品紹介シートのURLが正しく設定されていません。"); setIsSeriesDataLoading(false); return;
      }
      setIsSeriesDataLoading(true); setSeriesDataFetchError(null);
      try {
        const response = await fetch(STORY_SPREADSHEET_URL_GLOBAL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`全作品データの取得に失敗: ${response.status} ${response.statusText}`);
        const csvText = await response.text(); const parsedItems = parseCSV(csvText);
        setAllSeriesData(parsedItems);
      } catch (error) { console.error("全作品データの取得エラー:", error); setSeriesDataFetchError(error.message);
      } finally { setIsSeriesDataLoading(false); }
    };
    fetchAllSeries();
  }, [STORY_SPREADSHEET_URL_GLOBAL]);

  useEffect(() => {
    const fetchTopPageData = async () => {
      if (!TOP_PAGE_SPREADSHEET_URL) {
        setTopPageDataFetchError("トップページシートのURLが設定されていません。");
        setIsTopPageDataLoading(false);
        return;
      }
      setIsTopPageDataLoading(true); setTopPageDataFetchError(null);
      try {
        const response = await fetch(TOP_PAGE_SPREADSHEET_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`トップページデータの取得に失敗: ${response.status} ${response.statusText}`);
        const csvText = await response.text(); const parsedItems = parseCSV(csvText);
        setTopPageData(parsedItems);
      } catch (error) { console.error("トップページデータの取得エラー:", error); setTopPageDataFetchError(error.message);
      } finally { setIsTopPageDataLoading(false); }
    };
    fetchTopPageData();
  }, [TOP_PAGE_SPREADSHEET_URL]);



  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) { setUser(currentUser); setUserId(currentUser.uid); }
      else { setUser(null); if (!initialAuthToken) { try { console.log("Attempting anonymous sign-in..."); await signInAnonymously(auth); } catch (error) { console.error("Anonymous sign-in failed:", error); setUserId(crypto.randomUUID()); }} else { setUserId(crypto.randomUUID()); }}
      setIsAuthReady(true);
    });
    const attemptSignInWithToken = async () => {
      if (initialAuthToken) {
        try { console.log("Attempting sign-in with custom token..."); await setPersistence(auth, browserLocalPersistence); await signInWithCustomToken(auth, initialAuthToken); }
        catch (error) { console.error("Error signing in with custom token:", error); if (!auth.currentUser) { try { console.log("Attempting anonymous sign-in after token error..."); await signInAnonymously(auth); } catch (anonError) { console.error("Anonymous sign-in failed after token error:", anonError); }}}
      } else if (!auth.currentUser) { try { console.log("Attempting initial anonymous sign-in..."); await signInAnonymously(auth); } catch (error) { console.error("Initial anonymous sign-in failed:", error); }}
    };
    if (!auth.currentUser) attemptSignInWithToken(); else { setUser(auth.currentUser); setUserId(auth.currentUser.uid); setIsAuthReady(true); }
    return () => unsubscribe();
  }, [initialAuthToken]);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .gq-gold { color: ${gqColors.gold} !important; } .bg-gq-gold { background-color: ${gqColors.gold} !important; } .border-gq-gold { border-color: ${gqColors.gold} !important; } .text-gq-gold { color: ${gqColors.gold} !important; }
      .gq-red { color: ${gqColors.red} !important; } .bg-gq-red { background-color: ${gqColors.red} !important; } .border-gq-red { border-color: ${gqColors.red} !important; } .text-gq-red { color: ${gqColors.red} !important; }
      .gq-red-dark { color: ${gqColors.redDark} !important; } .bg-gq-red-dark { background-color: ${gqColors.redDark} !important; } .border-gq-red-dark { border-color: ${gqColors.redDark} !important; } .text-gq-red-dark { color: ${gqColors.redDark} !important; }
      body { background-color: ${isDarkMode ? '#111827' : '#F3F4F6'}; }
      .max-h-48::-webkit-scrollbar, .max-h-40::-webkit-scrollbar { width: 8px; } .max-h-48::-webkit-scrollbar-track, .max-h-40::-webkit-scrollbar-track { background: ${isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(203, 213, 225, 0.5)'}; border-radius: 4px; } .max-h-48::-webkit-scrollbar-thumb, .max-h-40::-webkit-scrollbar-thumb { background: ${isDarkMode ? gqColors.gold : defaultThemeColors.sky500}; border-radius: 4px; } .max-h-48::-webkit-scrollbar-thumb:hover, .max-h-40::-webkit-scrollbar-thumb:hover { background: ${isDarkMode ? '#FDE047' : defaultThemeColors.sky600}; }
      .line-clamp-1 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 1; } .line-clamp-2 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; } .line-clamp-3 { overflow: hidden; display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 3; }
      .shadow-gq-gold-glow:hover { box-shadow: 0 0 15px 3px ${gqColors.gold}66; }
      .aspect-video { aspect-ratio: 16 / 9; } .aspect-\\[5\\/7\\] { aspect-ratio: 5 / 7; } .aspect-\\[3\\/4\\] { aspect-ratio: 3 / 4; }`;
    document.head.appendChild(style);
    if (isDarkMode) { document.documentElement.classList.add('dark'); document.documentElement.classList.remove('light'); }
    else { document.documentElement.classList.add('light'); document.documentElement.classList.remove('dark'); }
    return () => { if (document.head.contains(style)) document.head.removeChild(style); };
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const navigateToSeriesList = () => { setSelectedSeriesTitle(null); setCurrentPage('serieslist'); };

  useEffect(() => {
    if (gsapInstance && gsapInstance.ScrollTrigger) {
      gsapInstance.ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      const refreshTimeout = setTimeout(() => { if (gsapInstance && gsapInstance.ScrollTrigger) { console.log("Refreshing ScrollTrigger on page/mode change."); gsapInstance.ScrollTrigger.refresh(); }}, 250);
      return () => clearTimeout(refreshTimeout);
    }
  }, [currentPage, gsapInstance, isDarkMode]);

  const renderPage = () => {
    if (!isAuthReady || !gsapInstance) {
      return <div className={`flex flex-col justify-center items-center h-screen ${currentTheme.bgBase} ${currentTheme.textPrimary}`}><div className={`animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-gq-red mb-6`}></div><p className="text-xl tracking-wider">システム起動中...</p></div>;
    }
    switch (currentPage) {
      case 'home': return <HomePage setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} gsap={gsapInstance} theme={currentTheme} topPageData={topPageData} isTopPageDataLoading={isTopPageDataLoading} topPageDataFetchError={topPageDataFetchError} />;
      case 'supplies': return <SuppliesPage setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} gsap={gsapInstance} theme={currentTheme} />;
      case 'cardlist': return <CardListPage setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} gsap={gsapInstance} theme={currentTheme} />;
      case 'serieslist': return <SeriesListPage setCurrentPage={setCurrentPage} setSelectedSeriesTitle={setSelectedSeriesTitle} isDarkMode={isDarkMode} gsap={gsapInstance} theme={currentTheme} allSeriesData={allSeriesData} isLoading={isSeriesDataLoading} fetchError={seriesDataFetchError} />;
      case 'story': return <OriginalStoryPage seriesTitle={selectedSeriesTitle} setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} gsap={gsapInstance} theme={currentTheme} allSeriesData={allSeriesData} />;
      case 'glossary': return <GlossaryPage setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} gsap={gsapInstance} theme={currentTheme} />;
      case 'rules': return <RuleExplanationPage setCurrentPage={setCurrentPage} isDarkMode={isDarkMode} gsap={gsapInstance} theme={currentTheme} />;
      // OfficialInfoPage と PlayerVideosPage の case を削除
      default:
        console.warn(`Unknown page key: ${currentPage}. Displaying fallback page.`);
        return <div className="text-center p-8">ページが見つかりません。ホームに戻ってください。</div>;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${currentTheme.bgBase} ${currentTheme.textPrimary} transition-colors duration-500 font-['Orbitron',sans-serif]`}>
      <style>{` @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap'); body { font-family: 'Rajdhani', sans-serif; } h1, h2, h3, h4, .uppercase { font-family: 'Orbitron', sans-serif; } `}</style>
      <Navbar setCurrentPage={setCurrentPage} currentPage={currentPage} toggleDarkMode={toggleDarkMode} isDarkMode={isDarkMode} isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} gsap={gsapInstance} theme={currentTheme} navigateToSeriesList={navigateToSeriesList} />
      <main className="container mx-auto p-4 md:p-8 flex-grow">{renderPage()}</main>
      <Footer isDarkMode={isDarkMode} theme={currentTheme} />
    </div>
  );
};

export default App;
