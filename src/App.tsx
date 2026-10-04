import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivePage,
  ContentItem,
  ContentCategoryType,
  ContentFormatType,
  TargetAudienceType,
  Category,
} from './types';
import { ARTICLES_DATA } from './data/mockData';
import { CATEGORIES_LIST, getCategoryBySlug, getCategoryByName } from './data/categories';
import { getContentBySlug } from './data/content';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { MobileNavigation } from './components/MobileNavigation';
import { HeroSection } from './components/HeroSection';
import { StatisticsStrip } from './components/StatisticsStrip';
import { LibrarySection } from './components/LibrarySection';
import { CategoryGrid } from './components/CategoryGrid';
import { ContentTypesSection } from './components/ContentTypesSection';
import { AIAssistantPreview } from './components/AIAssistantPreview';
import { HowItWorks } from './components/HowItWorks';
import { AudiencesSection } from './components/AudiencesSection';
import { FeaturedMaterial } from './components/FeaturedMaterial';
import { FamilyEducationSection } from './components/FamilyEducationSection';
import { FAQAccordion } from './components/FAQAccordion';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';
import { SearchModal } from './components/SearchModal';
import { LoginModal } from './components/LoginModal';
import { ArticleReader } from './components/ArticleReader';
import { LibraryPage } from './components/LibraryPage';
import { FavoritesPage } from './components/FavoritesPage';
import { AboutPage } from './components/AboutPage';
import { CategoryPage } from './components/CategoryPage';
import { AIAssistantWizard } from './components/AIAssistantWizard';
import { GeneratedContentViewer } from './components/GeneratedContentViewer';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AccountPage } from './components/AccountPage';
import { MyMaterialsPage } from './components/MyMaterialsPage';
import { SetupNoticeBanner } from './components/SetupNoticeBanner';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminTab } from './types';
import {
  GeneratedContentResult,
  AIGenerationParams,
} from './lib/ai/types';
import {
  fetchUserFavoriteIds,
  toggleFavoriteInDb,
  fetchReadingHistoryIds,
  recordReadingHistoryInDb,
  clearReadingHistoryInDb,
  fetchUserGenerations,
  fetchContentsFromDb,
  fetchCategoriesFromDb,
} from './services/dataService';

function AppContent() {
  const { user, profile } = useAuth();

  const [activePage, setActivePage] = useState<ActivePage>('home');
  const [articles, setArticles] = useState<ContentItem[]>(ARTICLES_DATA);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES_LIST);
  const [selectedArticle, setSelectedArticle] = useState<ContentItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [libraryInitialCategory, setLibraryInitialCategory] = useState<string | undefined>(undefined);
  const [libraryInitialType, setLibraryInitialType] = useState<string | undefined>(undefined);
  const [assistantTopic, setAssistantTopic] = useState<string>('تربية الأبناء على الصلاة');

  // AI Generated Material state
  const [currentGeneratedResult, setCurrentGeneratedResult] = useState<GeneratedContentResult | null>(null);
  const [currentGeneratedParams, setCurrentGeneratedParams] = useState<AIGenerationParams | undefined>(undefined);
  const [generationsCount, setGenerationsCount] = useState(0);

  // Modals state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Admin SubTab state
  const [adminSubTab, setAdminSubTab] = useState<AdminTab>('dashboard');
  const [adminContentId, setAdminContentId] = useState<string | undefined>(undefined);

  // Bookmarks state (synchronized with Supabase / localStorage)
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());

  // Reading history state (synchronized with Supabase / localStorage)
  const [readingHistoryIds, setReadingHistoryIds] = useState<string[]>([]);

  // Initial load of content, categories, favorites, history, and generations from Supabase
  useEffect(() => {
    fetchContentsFromDb().then((items) => {
      if (items && items.length > 0) setArticles(items);
    });

    fetchCategoriesFromDb().then((cats) => {
      if (cats && cats.length > 0) setCategories(cats);
    });

    fetchUserFavoriteIds(user?.id).then((ids) => {
      setBookmarkedIds(ids);
    });

    fetchReadingHistoryIds(user?.id).then((history) => {
      setReadingHistoryIds(history);
    });

    fetchUserGenerations(user?.id).then((gens) => {
      setGenerationsCount(gens.length);
    });
  }, [user]);

  // Toggle bookmark handler
  const toggleBookmark = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    const isFav = bookmarkedIds.has(id);
    const { newStatus } = await toggleFavoriteInDb(id, isFav, user?.id);

    setBookmarkedIds((prev) => {
      const next = new Set(prev);
      if (newStatus) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const clearAllBookmarks = () => {
    setBookmarkedIds(new Set());
    localStorage.setItem('zad_bookmarks', JSON.stringify([]));
  };

  const clearReadingHistory = async () => {
    await clearReadingHistoryInDb(user?.id);
    setReadingHistoryIds([]);
  };

  // Push state helper for smooth in-app navigation
  const navigateWithHash = (hash: string) => {
    if (typeof window !== 'undefined' && window.location.hash !== `#${hash}`) {
      window.history.pushState(null, '', hash ? `#${hash}` : window.location.pathname);
    }
  };

  // Parse current URL hash to restore router state
  const syncFromHash = useCallback(() => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash.replace(/^#\/?/, '');

    if (!hash || hash === 'home') {
      setActivePage('home');
      setSelectedArticle(null);
      setSelectedCategory(null);
      document.title = 'زاد الداعية | من الفكرة إلى الكلمة النافعة';
    } else if (hash === 'library') {
      setActivePage('library');
      document.title = 'مكتبة زاد الداعية | مواد دعوية وتربوية';
    } else if (hash === 'assistant') {
      setActivePage('assistant');
      document.title = 'مساعد زاد الداعية | صياغة الكلمة النافعة';
    } else if (hash.startsWith('assistant?topic=')) {
      const decodedTopic = decodeURIComponent(hash.replace('assistant?topic=', ''));
      setAssistantTopic(decodedTopic);
      setActivePage('assistant');
      document.title = 'مساعد زاد الداعية | صياغة الكلمة النافعة';
    } else if (hash === 'favorites') {
      setActivePage('favorites');
      document.title = 'المواد المحفوظة | زاد الداعية';
    } else if (hash === 'my-materials') {
      setActivePage('my-materials');
      document.title = 'موادي | زاد الداعية';
    } else if (hash === 'login') {
      setActivePage('login');
      document.title = 'تسجيل الدخول | زاد الداعية';
    } else if (hash === 'register') {
      setActivePage('register');
      document.title = 'إنشاء حساب | زاد الداعية';
    } else if (hash === 'account') {
      setActivePage('account');
      document.title = 'حسابي | زاد الداعية';
    } else if (hash === 'about') {
      setActivePage('about');
      document.title = 'عن المنصة | زاد الداعية';
    } else if (hash.startsWith('article/')) {
      const slug = hash.replace('article/', '');
      const found = getContentBySlug(slug) || ARTICLES_DATA.find((a) => a.id === slug);
      if (found) {
        setSelectedArticle(found);
        setActivePage('article');
        document.title = `${found.title} | زاد الداعية`;
      } else {
        setActivePage('library');
      }
    } else if (hash.startsWith('category/')) {
      const catSlug = hash.replace('category/', '');
      const foundCat = getCategoryBySlug(catSlug) || CATEGORIES_LIST.find((c) => c.name === catSlug);
      if (foundCat) {
        setSelectedCategory(foundCat);
        setActivePage('category');
        document.title = `${foundCat.name} | زاد الداعية`;
      } else {
        setActivePage('library');
      }
    } else if (hash === 'admin' || hash === 'admin/dashboard') {
      setActivePage('admin');
      setAdminSubTab('dashboard');
      document.title = 'لوحة التحكم | زاد الداعية';
    } else if (hash === 'admin/content') {
      setActivePage('admin');
      setAdminSubTab('content');
      document.title = 'إدارة المحتوى | لوحة التحكم';
    } else if (hash === 'admin/content/new') {
      setActivePage('admin');
      setAdminSubTab('content-new');
      document.title = 'إضافة مادة جديدة | لوحة التحكم';
    } else if (hash.startsWith('admin/content/') && hash.endsWith('/edit')) {
      const cId = hash.replace('admin/content/', '').replace('/edit', '');
      setActivePage('admin');
      setAdminSubTab('content-edit');
      setAdminContentId(cId);
      document.title = 'تعديل المادة | لوحة التحكم';
    } else if (hash === 'admin/categories') {
      setActivePage('admin');
      setAdminSubTab('categories');
      document.title = 'إدارة المجالات | لوحة التحكم';
    } else if (hash === 'admin/users') {
      setActivePage('admin');
      setAdminSubTab('users');
      document.title = 'إدارة المستخدمين | لوحة التحكم';
    } else if (hash === 'admin/ai-materials') {
      setActivePage('admin');
      setAdminSubTab('ai-materials');
      document.title = 'المواد المولدة | لوحة التحكم';
    } else if (hash === 'admin/analytics') {
      setActivePage('admin');
      setAdminSubTab('analytics');
      document.title = 'الإحصائيات والتحليلات | لوحة التحكم';
    } else if (hash === 'admin/settings') {
      setActivePage('admin');
      setAdminSubTab('settings');
      document.title = 'إعدادات المنصة | لوحة التحكم';
    } else if (hash === 'admin/activity-logs') {
      setActivePage('admin');
      setAdminSubTab('activity-logs');
      document.title = 'سجل العمليات | لوحة التحكم';
    }
  }, []);

  // Listen to browser popstate / hashchange for back/forward support
  useEffect(() => {
    syncFromHash();
    window.addEventListener('popstate', syncFromHash);
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.removeEventListener('popstate', syncFromHash);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, [syncFromHash]);

  // Main navigation handler
  const handleNavigate = (page: ActivePage, sectionId?: string) => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const routeTitles: Record<string, string> = {
      home: 'زاد الداعية | من الفكرة إلى الكلمة النافعة',
      library: 'مكتبة زاد الداعية | مواد دعوية وتربوية',
      assistant: 'مساعد زاد الداعية | صياغة الكلمة النافعة',
      favorites: 'المواد المحفوظة | زاد الداعية',
      'my-materials': 'موادي | زاد الداعية',
      login: 'تسجيل الدخول | زاد الداعية',
      register: 'إنشاء حساب | زاد الداعية',
      account: 'حسابي | زاد الداعية',
      about: 'عن المنصة | زاد الداعية',
      admin: 'لوحة التحكم | زاد الداعية',
    };

    if (routeTitles[page]) {
      document.title = routeTitles[page];
      navigateWithHash(page === 'home' ? '' : page);
    }

    if (sectionId) {
      setTimeout(() => {
        const elem = document.getElementById(sectionId);
        if (elem) {
          elem.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  };

  // Select an article to view in the Reader
  const handleSelectArticle = (article: ContentItem) => {
    setSelectedArticle(article);
    setActivePage('article');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigateWithHash(`article/${article.slug}`);
    document.title = `${article.title} | زاد الداعية`;

    // Record in reading history
    recordReadingHistoryInDb(article.id, user?.id);
    setReadingHistoryIds((prev) => [article.id, ...prev.filter((id) => id !== article.id)].slice(0, 10));
  };

  // Select dedicated category page
  const handleSelectCategoryPage = (catSlugOrName: string) => {
    const cat =
      getCategoryBySlug(catSlugOrName) ||
      getCategoryByName(catSlugOrName as any) ||
      CATEGORIES_LIST.find((c) => c.slug === catSlugOrName || c.name === catSlugOrName);

    if (cat) {
      setSelectedCategory(cat);
      setActivePage('category');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigateWithHash(`category/${cat.slug}`);
      document.title = `${cat.name} | زاد الداعية`;
    } else {
      setLibraryInitialCategory(catSlugOrName);
      setActivePage('library');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      navigateWithHash('library');
    }
  };

  // Start creation in AI Assistant
  const handleStartCreation = (topic: string) => {
    setAssistantTopic(topic);
    setActivePage('assistant');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigateWithHash(`assistant?topic=${encodeURIComponent(topic)}`);
    document.title = 'مساعد زاد الداعية | صياغة الكلمة النافعة';
  };

  // When AI generation is finished
  const handleGenerationComplete = (result: GeneratedContentResult, params: AIGenerationParams) => {
    setCurrentGeneratedResult(result);
    setCurrentGeneratedParams(params);
    setActivePage('generated');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigateWithHash(`generated/${result.id || 'new'}`);
    document.title = `${result.title} | زاد الداعية`;

    fetchUserGenerations(user?.id).then((gens) => setGenerationsCount(gens.length));
  };

  const handleOpenMaterial = (material: GeneratedContentResult) => {
    setCurrentGeneratedResult(material);
    setActivePage('generated');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    navigateWithHash(`generated/${material.id || 'view'}`);
    document.title = `${material.title} | زاد الداعية`;
  };

  const handleCategorySelect = (categoryName: string, categorySlug?: string) => {
    if (categorySlug) {
      handleSelectCategoryPage(categorySlug);
    } else {
      setLibraryInitialCategory(categoryName);
      setLibraryInitialType(undefined);
      handleNavigate('library');
    }
  };

  const handleTypeSelect = (format: ContentFormatType) => {
    setLibraryInitialType(format);
    setLibraryInitialCategory(undefined);
    handleNavigate('library');
  };

  const handleAudienceSelect = (_audience: TargetAudienceType) => {
    setLibraryInitialCategory(undefined);
    setLibraryInitialType(undefined);
    handleNavigate('library');
  };

  const handleChannelSelect = (_place: string) => {
    setLibraryInitialCategory(undefined);
    setLibraryInitialType(undefined);
    handleNavigate('library');
  };

  // Find featured article
  const featuredArticle = articles.find((a) => a.featured) || articles[0];

  // Bookmarked articles list
  const savedArticles = articles.filter((a) => bookmarkedIds.has(a.id));

  // Recently viewed articles list
  const recentlyViewedArticles = readingHistoryIds
    .map((id) => articles.find((a) => a.id === id))
    .filter((a): a is ContentItem => a !== undefined);

  // Dedicated Admin Dashboard View
  if (activePage === 'admin') {
    return (
      <AdminDashboard
        initialSubTab={adminSubTab}
        initialContentId={adminContentId}
        onNavigateHome={() => handleNavigate('home')}
        onNavigateLogin={() => handleNavigate('login')}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#070e17] text-[#0b1b2b] dark:text-stone-100 font-sans selection:bg-[#c8a962]/20 selection:text-[#0b1b2b] dark:selection:text-[#dfc27e] transition-colors duration-200">
      {/* Environment Setup Notice (Phase 3 Status) */}
      <SetupNoticeBanner />

      {/* Sticky Header with integrated ThemeSwitcher and Auth */}
      <Header
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenLogin={() => handleNavigate(user ? 'account' : 'login')}
        savedCount={bookmarkedIds.size}
      />

      {/* Main Page Views */}
      <main className="flex-1">
        {/* 1. HOMEPAGE */}
        {activePage === 'home' && (
          <>
            {/* Hero Section with AI input connected to Assistant */}
            <HeroSection
              onStartCreation={handleStartCreation}
              onBrowseLibrary={() => handleNavigate('library')}
            />

            {/* Statistics Strip */}
            <StatisticsStrip />

            {/* Featured Material Showcase */}
            <FeaturedMaterial
              item={featuredArticle}
              isBookmarked={bookmarkedIds.has(featuredArticle.id)}
              onToggleBookmark={toggleBookmark}
              onRead={handleSelectArticle}
            />

            {/* Library Section */}
            <LibrarySection
              items={articles}
              bookmarkedIds={bookmarkedIds}
              onToggleBookmark={toggleBookmark}
              onSelectItem={handleSelectArticle}
              onViewAll={() => handleNavigate('library')}
            />

            {/* AI Assistant Preview Section */}
            <AIAssistantPreview
              initialTopic={assistantTopic}
              onOpenFullAssistant={handleStartCreation}
            />

            {/* Content Categories */}
            <CategoryGrid onSelectCategory={handleCategorySelect} />

            {/* Content Types */}
            <ContentTypesSection onSelectType={handleTypeSelect} />

            {/* How It Works */}
            <HowItWorks />

            {/* Target Audiences */}
            <AudiencesSection onSelectAudience={handleAudienceSelect} />

            {/* Family & Education */}
            <FamilyEducationSection onExploreChannel={handleChannelSelect} />

            {/* FAQ Accordion */}
            <FAQAccordion />

            {/* Final CTA */}
            <FinalCTA onStartNow={() => handleStartCreation('خطبة عن بر الوالدين')} />
          </>
        )}

        {/* 2. REAL AI ASSISTANT WIZARD */}
        {activePage === 'assistant' && (
          <AIAssistantWizard
            initialTopic={assistantTopic}
            onGenerationComplete={handleGenerationComplete}
            onNavigateHome={() => handleNavigate('home')}
            onOpenLogin={() => handleNavigate('login')}
          />
        )}

        {/* 3. GENERATED MATERIAL VIEWER */}
        {activePage === 'generated' && currentGeneratedResult && (
          <GeneratedContentViewer
            content={currentGeneratedResult}
            originalParams={currentGeneratedParams}
            onBackToWizard={() => handleNavigate('assistant')}
            onOpenMyMaterials={() => handleNavigate('my-materials')}
            onOpenLogin={() => handleNavigate('login')}
          />
        )}

        {/* 4. MY MATERIALS ("موادي") */}
        {activePage === 'my-materials' && (
          <MyMaterialsPage
            onOpenMaterial={handleOpenMaterial}
            onStartNewCreation={() => handleStartCreation('مادة جديدة')}
            onOpenLogin={() => handleNavigate('login')}
          />
        )}

        {/* 5. LIBRARY PAGE */}
        {activePage === 'library' && (
          <LibraryPage
            items={articles}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onSelectItem={handleSelectArticle}
            initialCategory={libraryInitialCategory}
            initialType={libraryInitialType}
            onSelectCategoryPage={handleSelectCategoryPage}
            recentlyViewedItems={recentlyViewedArticles}
            onClearHistory={clearReadingHistory}
          />
        )}

        {/* 6. CATEGORY DEDICATED PAGE */}
        {activePage === 'category' && selectedCategory && (
          <CategoryPage
            category={selectedCategory}
            items={articles}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onSelectItem={handleSelectArticle}
            onBackToLibrary={() => handleNavigate('library')}
          />
        )}

        {/* 7. ARTICLE READER */}
        {activePage === 'article' && selectedArticle && (
          <ArticleReader
            article={selectedArticle}
            allArticles={articles}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onBack={() => handleNavigate('library')}
            onSelectArticle={handleSelectArticle}
          />
        )}

        {/* 8. FAVORITES PAGE */}
        {activePage === 'favorites' && (
          <FavoritesPage
            savedItems={savedArticles}
            bookmarkedIds={bookmarkedIds}
            onToggleBookmark={toggleBookmark}
            onSelectItem={handleSelectArticle}
            onBrowseLibrary={() => handleNavigate('library')}
            onClearAll={clearAllBookmarks}
          />
        )}

        {/* 9. LOGIN PAGE */}
        {activePage === 'login' && (
          <LoginPage
            onNavigateRegister={() => handleNavigate('register')}
            onNavigateHome={() => handleNavigate('home')}
            onLoginSuccess={() => handleNavigate('account')}
          />
        )}

        {/* 10. REGISTER PAGE */}
        {activePage === 'register' && (
          <RegisterPage
            onNavigateLogin={() => handleNavigate('login')}
            onNavigateHome={() => handleNavigate('home')}
            onRegisterSuccess={() => handleNavigate('account')}
          />
        )}

        {/* 11. ACCOUNT PAGE */}
        {activePage === 'account' && (
          <AccountPage
            onNavigate={handleNavigate}
            savedCount={bookmarkedIds.size}
            historyCount={readingHistoryIds.length}
            generationsCount={generationsCount}
            onOpenMyMaterials={() => handleNavigate('my-materials')}
          />
        )}

        {/* 12. ABOUT PAGE */}
        {activePage === 'about' && (
          <AboutPage
            onBrowseLibrary={() => handleNavigate('library')}
            onStartAssistant={() => handleStartCreation('تربية الأبناء على الصلاة')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Bottom Navigation */}
      <MobileNavigation
        activePage={activePage}
        onNavigate={handleNavigate}
        onOpenLogin={() => handleNavigate(user ? 'account' : 'login')}
        savedCount={bookmarkedIds.size}
      />

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        items={articles}
        onSelectItem={handleSelectArticle}
      />

      {/* Login Demo Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        isLoggedIn={Boolean(user)}
        onToggleLogin={() => handleNavigate('account')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
