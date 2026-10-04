import { useState, useEffect, useCallback } from 'react';
import { ActivePage, Content, Category } from '../types';
import { CONTENT_DATABASE, getContentBySlug } from '../data/content';
import { CATEGORIES_LIST, getCategoryBySlug } from '../data/categories';

export interface RouteState {
  page: ActivePage;
  selectedContent?: Content;
  selectedCategory?: Category;
  searchQuery?: string;
  categoryFilter?: string;
  typeFilter?: string;
}

const BASE_TITLE = 'زاد الداعية | من الفكرة إلى الكلمة النافعة';
const BASE_DESC =
  'منصة إسلامية معرفية حديثة لإعداد المحتوى التربوي والدعوي والخطب والمواعظ. من الفكرة إلى الكلمة النافعة.';

export function useAppRouter() {
  const [routeState, setRouteState] = useState<RouteState>(() => {
    if (typeof window === 'undefined') {
      return { page: 'home' };
    }
    return parseCurrentUrl();
  });

  // Helper to parse current browser URL
  function parseCurrentUrl(): RouteState {
    const path = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);

    if (path.startsWith('/content/')) {
      const slug = path.replace('/content/', '').trim();
      const content = getContentBySlug(slug);
      if (content) {
        return { page: 'content', selectedContent: content };
      }
    }

    if (path.startsWith('/category/')) {
      const slug = path.replace('/category/', '').trim();
      const category = getCategoryBySlug(slug);
      if (category) {
        return { page: 'category', selectedCategory: category };
      }
    }

    if (path === '/library') {
      return {
        page: 'library',
        searchQuery: searchParams.get('q') || undefined,
        categoryFilter: searchParams.get('category') || undefined,
        typeFilter: searchParams.get('type') || undefined,
      };
    }

    if (path === '/favorites') {
      return { page: 'favorites' };
    }

    if (path === '/about') {
      return { page: 'about' };
    }

    return { page: 'home' };
  }

  // Update SEO meta tags
  const updateSeoMeta = useCallback((title: string, description: string) => {
    document.title = title;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', description);
  }, []);

  // Update browser URL and push history
  const navigateTo = useCallback(
    (newPath: string, newState: RouteState) => {
      if (window.location.pathname + window.location.search !== newPath) {
        window.history.pushState({}, '', newPath);
      }
      setRouteState(newState);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    []
  );

  // Popstate listener for back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      setRouteState(parseCurrentUrl());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Sync SEO whenever routeState changes
  useEffect(() => {
    if (routeState.page === 'content' && routeState.selectedContent) {
      const c = routeState.selectedContent;
      updateSeoMeta(`${c.title} | زاد الداعية`, c.description);
    } else if (routeState.page === 'category' && routeState.selectedCategory) {
      const cat = routeState.selectedCategory;
      updateSeoMeta(`${cat.name} | مكتبة زاد الداعية`, cat.description);
    } else if (routeState.page === 'library') {
      updateSeoMeta('مكتبة زاد الداعية | تصفح الخطب والدروس والمواعظ', BASE_DESC);
    } else if (routeState.page === 'favorites') {
      updateSeoMeta('المفضلة | زاد الداعية', 'المواد التي اخترت الاحتفاظ بها في زاد الداعية.');
    } else if (routeState.page === 'about') {
      updateSeoMeta('عن زاد الداعية | الرسالة والمنهج', BASE_DESC);
    } else {
      updateSeoMeta(BASE_TITLE, BASE_DESC);
    }
  }, [routeState, updateSeoMeta]);

  // Public navigation actions
  const navigateHome = useCallback(
    (sectionId?: string) => {
      navigateTo('/', { page: 'home' });
      if (sectionId) {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      }
    },
    [navigateTo]
  );

  const navigateLibrary = useCallback(
    (params?: { q?: string; category?: string; type?: string }) => {
      const searchParams = new URLSearchParams();
      if (params?.q) searchParams.set('q', params.q);
      if (params?.category) searchParams.set('category', params.category);
      if (params?.type) searchParams.set('type', params.type);

      const qs = searchParams.toString();
      const path = qs ? `/library?${qs}` : '/library';

      navigateTo(path, {
        page: 'library',
        searchQuery: params?.q,
        categoryFilter: params?.category,
        typeFilter: params?.type,
      });
    },
    [navigateTo]
  );

  const navigateContent = useCallback(
    (content: Content) => {
      navigateTo(`/content/${content.slug}`, {
        page: 'content',
        selectedContent: content,
      });
    },
    [navigateTo]
  );

  const navigateCategory = useCallback(
    (categorySlug: string) => {
      const category = getCategoryBySlug(categorySlug);
      if (category) {
        navigateTo(`/category/${category.slug}`, {
          page: 'category',
          selectedCategory: category,
        });
      }
    },
    [navigateTo]
  );

  const navigateFavorites = useCallback(() => {
    navigateTo('/favorites', { page: 'favorites' });
  }, [navigateTo]);

  const navigateAbout = useCallback(() => {
    navigateTo('/about', { page: 'about' });
  }, [navigateTo]);

  return {
    routeState,
    navigateHome,
    navigateLibrary,
    navigateContent,
    navigateCategory,
    navigateFavorites,
    navigateAbout,
  };
}
