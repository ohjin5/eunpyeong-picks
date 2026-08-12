import React, { useState, useEffect, useMemo } from 'react';
import { Product, MaterialRequest, StoreStats, UserSubmission, SubmissionStatus } from './types/store';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { QuickCategory } from './components/QuickCategory';
import { ProductCard } from './components/ProductCard';
import { FeaturedProductCard } from './components/FeaturedProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RequestModal } from './components/RequestModal';
import { GuideModal } from './components/GuideModal';
import { AdminAuthModal } from './components/AdminAuthModal';
import { RegisterToolModal } from './components/RegisterToolModal';
import { EmptyState } from './components/EmptyState';
import { SkeletonCard } from './components/SkeletonCard';

import { AdminLayout, AdminTab } from './components/Admin/AdminLayout';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AdminProductList } from './components/Admin/AdminProductList';
import { AdminProductForm } from './components/Admin/AdminProductForm';
import { AdminRequestList } from './components/Admin/AdminRequestList';
import { AdminSubmissionList } from './components/Admin/AdminSubmissionList';

import {
  ArrowUpDown,
  Search
} from 'lucide-react';

export default function App() {
  // Store Data State
  const [products, setProducts] = useState<Product[]>([]);
  const [stats, setStats] = useState<StoreStats | null>(null);
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [submissions, setSubmissions] = useState<UserSubmission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<string>('latest');

  // Modals State
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [serviceRequestProduct, setServiceRequestProduct] = useState<Product | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);

  // Admin Mode State
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTab>('dashboard');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Session view history
  const [viewedInSession, setViewedInSession] = useState<Set<string>>(new Set());

  // Random recommendation products shown on the home screen
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  // Check initial admin session status on mount
  useEffect(() => {
    fetch('/api/admin/verify')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated) {
          setIsAdmin(true);
        }
      })
      .catch(() => {});
  }, []);

  // Fetch store data
  const fetchProductsAndStats = async () => {
    try {
      setLoading(true);
      const resProducts = await fetch(`/api/products?includeHidden=${isAdmin}`);
      if (resProducts.ok) {
        const data = await resProducts.json();
        setProducts(data);
      }

      const resStats = await fetch('/api/stats');
      if (resStats.ok) {
        const statsData = await resStats.json();
        setStats(statsData);
      }

      const resRequests = await fetch('/api/requests');
      if (resRequests.ok) {
        const reqData = await resRequests.json();
        setRequests(reqData);
      }

      const resSubmissions = await fetch('/api/submissions');
      if (resSubmissions.ok) {
        const subData = await resSubmissions.json();
        setSubmissions(subData);
      }
    } catch (err) {
      console.error('Failed to load store data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsAndStats();
  }, [isAdmin]);

  // Handle Admin Access Click
  const handleRequestAdminAccess = async () => {
    if (isAdmin) {
      // Return to store view
      setIsAdmin(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/verify');
      const data = await res.json();
      if (data.authenticated) {
        setIsAdmin(true);
      } else {
        setIsAdminAuthModalOpen(true);
      }
    } catch (err) {
      setIsAdminAuthModalOpen(true);
    }
  };

  // Handle Admin Logout
  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setIsAdmin(false);
    setIsAdminAuthModalOpen(false);
  };

  // Open Product Detail Modal
  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);

    if (!viewedInSession.has(product.id)) {
      setViewedInSession(prev => new Set(prev).add(product.id));
      fetch(`/api/products/${product.id}/view`, { method: 'POST' })
        .then(() => {
          setProducts(prev => prev.map(p => p.id === product.id ? { ...p, viewCount: p.viewCount + 1 } : p));
        })
        .catch(() => {});
    }
  };

  // Filtered and Sorted Products for Store
  const filteredProducts = useMemo(() => {
    let result = products.filter(p => p.status === 'PUBLISHED');

    if (selectedCategory !== 'ALL') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      result = result.filter(p =>
        p.title.toLowerCase().includes(term) ||
        p.shortDescription.toLowerCase().includes(term) ||
        p.description.toLowerCase().includes(term) ||
        p.creatorName.toLowerCase().includes(term) ||
        p.creatorDepartment.toLowerCase().includes(term)
      );
    }

    if (sortBy === 'views') {
      result.sort((a, b) => b.viewCount - a.viewCount);
    } else if (sortBy === 'downloads') {
      result.sort((a, b) => b.downloadCount - a.downloadCount);
    } else if (sortBy === 'title') {
      result.sort((a, b) => a.title.localeCompare(b.title, 'ko'));
    } else {
      // 'latest'
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [products, selectedCategory, searchQuery, sortBy]);

  // ----------------------------------------------------
  // RANDOM RECOMMENDATIONS
  // ----------------------------------------------------
  // 홈의 추천 도구는 공개된 전체 목록에서 최대 3개를 무작위로 노출한다.
  // 공개 도구가 충분하면 직전 추천을 우선 제외해 반복 노출을 줄인다.
  useEffect(() => {
    const publishedProducts =
      products.filter(
        product =>
          product.status === 'PUBLISHED'
      );

    if (publishedProducts.length === 0) {
      setFeaturedProducts([]);
      return;
    }

    const shuffleProducts = (
      items: Product[]
    ): Product[] => {
      const copied = [...items];

      for (
        let i = copied.length - 1;
        i > 0;
        i -= 1
      ) {
        const j =
          Math.floor(
            Math.random() * (i + 1)
          );

        [
          copied[i],
          copied[j],
        ] = [
          copied[j],
          copied[i],
        ];
      }

      return copied;
    };

    const updateFeaturedProducts =
      () => {
        setFeaturedProducts(
          previous => {
            const previousIds =
              new Set(
                previous.map(
                  product =>
                    product.id
                )
              );

            const nonRepeated =
              publishedProducts.filter(
                product =>
                  !previousIds.has(
                    product.id
                  )
              );

            const targetCount =
              Math.min(
                3,
                publishedProducts.length
              );

            const pool =
              nonRepeated.length >= targetCount
                ? nonRepeated
                : publishedProducts;

            return shuffleProducts(
              pool
            ).slice(
              0,
              targetCount
            );
          }
        );
      };

    // 첫 화면에서 바로 추천 도구 표시
    updateFeaturedProducts();

    // 8초마다 추천 도구 교체
    const intervalId =
      window.setInterval(
        updateFeaturedProducts,
        8000
      );

    return () => {
      window.clearInterval(
        intervalId
      );
    };
  }, [products]);

  // Admin Product Actions
  const handleSaveProduct = async (productData: Partial<Product>) => {
    const isEdit = !!productData.id;
    const url = isEdit ? `/api/products/${productData.id}` : '/api/products';
    const method = isEdit ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData)
    });

    if (!response.ok) {
      throw new Error('산출물 저장에 실패했습니다.');
    }

    await fetchProductsAndStats();
    setEditingProduct(null);
    setAdminTab('products');
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      await fetchProductsAndStats();
    }
  };

  const handleToggleProductStatus = async (product: Product) => {
    const newStatus = product.status === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    await fetchProductsAndStats();
  };

  const handleToggleProductFeatured = async (product: Product) => {
    await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ featured: !product.featured })
    });
    await fetchProductsAndStats();
  };

  const handleUpdateRequestStatus = async (id: string, status: any) => {
    await fetch(`/api/requests/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    await fetchProductsAndStats();
  };

  const handleUpdateSubmissionStatus = async (id: string, status: SubmissionStatus, adminComment?: string) => {
    let endpoint = `/api/submissions/${id}`;
    let method = 'PATCH';

    if (status === 'APPROVED') {
      endpoint = `/api/admin/submissions/${id}/approve`;
      method = 'POST';
    } else if (status === 'REJECTED') {
      endpoint = `/api/admin/submissions/${id}/reject`;
      method = 'POST';
    }

    await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminComment })
    });
    await fetchProductsAndStats();
  };

  const pendingRequestsCount = requests.filter(r => r.status === 'REQUESTED').length;
  const pendingSubmissionsCount = submissions.filter(s => s.status === 'REVIEW').length;

  // ----------------------------------------------------
  // ADMIN MODE RENDER
  // ----------------------------------------------------
  if (isAdmin) {
    return (
      <AdminLayout
        activeTab={adminTab}
        setActiveTab={(tab) => {
          if (tab === 'new_product') setEditingProduct(null);
          setAdminTab(tab);
        }}
        onExitAdmin={() => setIsAdmin(false)}
        onLogout={handleAdminLogout}
        pendingRequestsCount={pendingRequestsCount}
        pendingSubmissionsCount={pendingSubmissionsCount}
      >
        {adminTab === 'dashboard' && (
          <AdminDashboard
            stats={stats}
            onNavigateTab={(tab) => {
              if (tab === 'new_product') setEditingProduct(null);
              setAdminTab(tab);
            }}
          />
        )}

        {adminTab === 'submissions' && (
          <AdminSubmissionList
            submissions={submissions}
            onUpdateStatus={handleUpdateSubmissionStatus}
          />
        )}

        {adminTab === 'products' && (
          <AdminProductList
            products={products}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setAdminTab('new_product');
            }}
            onDeleteProduct={handleDeleteProduct}
            onToggleStatus={handleToggleProductStatus}
            onToggleFeatured={handleToggleProductFeatured}
            onNewProduct={() => {
              setEditingProduct(null);
              setAdminTab('new_product');
            }}
          />
        )}

        {adminTab === 'new_product' && (
          <AdminProductForm
            initialProduct={editingProduct}
            onSave={handleSaveProduct}
            onCancel={() => {
              setEditingProduct(null);
              setAdminTab('products');
            }}
          />
        )}

        {adminTab === 'requests' && (
          <AdminRequestList
            requests={requests}
            onUpdateStatus={handleUpdateRequestStatus}
          />
        )}
      </AdminLayout>
    );
  }

  // ----------------------------------------------------
  // MAIN USER STORE RENDER
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      
      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenGuide={() => setIsGuideOpen(true)}
        onSelectCategory={setSelectedCategory}
        currentCategory={selectedCategory}
        isAdmin={isAdmin}
        onToggleAdmin={handleRequestAdminAccess}
      />

      {/* Hero Section */}
      <Hero
        onExploreClick={() => {
          const el = document.getElementById('all-products-section');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
        onRegisterToolClick={() => setIsRegisterModalOpen(true)}
        totalProducts={stats?.totalProducts || products.length}
        totalViews={stats?.totalViews || 0}
        totalRequests={stats?.totalRequests || 0}
      />

      {/* Quick Category Bar */}
      <QuickCategory
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={stats?.categoryCounts}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* If user is actively searching or filtering a category, show targeted results */}
        {(searchQuery || selectedCategory !== 'ALL') ? (
          <section className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span>
                    {searchQuery ? `'${searchQuery}' 검색 결과` : '카테고리 산출물 탐색'}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  총 {filteredProducts.length}개의 AI 도구를 발견했습니다.
                </p>
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
                >
                  <option value="latest">최신 등록순</option>
                  <option value="views">많이 본 순</option>
                  <option value="downloads">다운로드 많은 순</option>
                  <option value="title">가나다순</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[1, 2, 3, 4].map(n => <SkeletonCard key={n} />)}
              </div>
            ) : filteredProducts.length === 0 ? (
              <EmptyState
                onResetSearch={() => {
                  setSearchQuery('');
                  setSelectedCategory('ALL');
                }}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredProducts.map(prod => (
                  <ProductCard key={prod.id} product={prod} onClick={handleOpenDetail} />
                ))}
              </div>
            )}
          </section>
        ) : (
          /* Store Home Content Sections */
          <div className="space-y-16">
            
            {/* Section 1: 추천 도구 (Featured Tools) - Horizontal Scroll */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    추천 도구
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    등록된 업무 도구 중 다양한 도구를 자동으로 추천해드립니다.
                  </p>
                </div>
              </div>

              {/* Horizontal Scroll Container */}
              {featuredProducts.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs">
                  <p className="text-sm text-slate-500 dark:text-slate-400">아직 추천할 수 있는 도구가 없습니다.</p>
                </div>
              ) : (
                <div className="flex gap-6 overflow-x-auto scrollbar-none pb-6 pt-2 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 snap-x snap-mandatory">
                  {featuredProducts.map(prod => (
                    <div key={prod.id} className="snap-start shrink-0">
                      <FeaturedProductCard product={prod} onClick={handleOpenDetail} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Section 2: 모든 도구 (All Tools) - Compact Grid */}
            <section id="all-products-section" className="space-y-6 pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
                    모든 도구
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    등록된 모든 AI 산출물과 업무 도구 모음입니다.
                  </p>
                </div>

                {/* Minimal Sort Selector */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-xs text-slate-400 font-medium">정렬:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-white dark:bg-[#1c1c1e] border-none rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none shadow-xs cursor-pointer"
                  >
                    <option value="latest">최신 등록순</option>
                    <option value="views">많이 본 순</option>
                    <option value="downloads">다운로드 많은 순</option>
                    <option value="title">가나다순</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {[1, 2, 3, 4, 5, 6].map(n => <SkeletonCard key={n} />)}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-12 text-center bg-white dark:bg-[#1c1c1e] rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-xs space-y-2">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-200">
                    아직 등록된 도구가 없습니다.
                  </p>
                  <p className="text-xs text-slate-400">
                    오른쪽 상단의 [내 도구 등록하기]를 통해 새로운 AI 도구를 등록할 수 있습니다.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProducts.map(prod => (
                    <ProductCard key={prod.id} product={prod} onClick={handleOpenDetail} />
                  ))}
                </div>
              )}
            </section>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 py-8 transition-colors mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500 dark:text-slate-400">
          
          {/* Bottom Left: Hospital Official Logo & Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-3">
            <img
              src="/brand/logo.png"
              alt="가톨릭대학교 은평성모병원"
              className="h-8 sm:h-9 max-w-[180px] sm:max-w-[220px] w-auto object-contain dark:bg-white/95 dark:px-2.5 dark:py-1 dark:rounded-lg"
            />
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1" />
            <div className="text-center sm:text-left">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                <span className="font-extrabold text-blue-800 dark:text-blue-400">E</span>unpyeong <span className="font-extrabold text-teal-600 dark:text-teal-400">P</span>icks
              </div>
              <p className="text-[11px] text-slate-400">
                은평성모병원 Beta Crew 업무혁신 프로젝트
              </p>
            </div>
          </div>

          {/* Bottom Right: Navigation links */}
          <div className="flex items-center gap-4 text-slate-500">
            <button onClick={() => setIsGuideOpen(true)} className="hover:underline cursor-pointer">
              활용 가이드
            </button>
            <span>•</span>
            <button onClick={handleRequestAdminAccess} className="hover:underline font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              관리자 모드 (/admin)
            </button>
          </div>

        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onRequestService={(prod) => {
          setSelectedProduct(null);
          setServiceRequestProduct(prod);
        }}
      />

      {serviceRequestProduct && (
        <RequestModal
          product={serviceRequestProduct}
          onClose={() => setServiceRequestProduct(null)}
          onSubmitSuccess={() => {
            setServiceRequestProduct(null);
            fetchProductsAndStats();
          }}
        />
      )}

      {isRegisterModalOpen && (
        <RegisterToolModal
          onClose={() => setIsRegisterModalOpen(false)}
          onSubmitSuccess={() => {
            setIsRegisterModalOpen(false);
            fetchProductsAndStats();
          }}
        />
      )}

      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={() => {
          setIsAdminAuthModalOpen(false);
          setIsAdmin(true);
        }}
      />

      {isGuideOpen && (
        <GuideModal onClose={() => setIsGuideOpen(false)} />
      )}

    </div>
  );
}