import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft, ArrowUpLeft, Check, ChevronDown, Heart, Menu, Minus, Plus,
  Search, ShoppingBag, SlidersHorizontal, Trash2, X,
} from 'lucide-react'
import { categories, formatPrice, products } from './products'

const WHATSAPP_NUMBER = (import.meta.env.VITE_WHATSAPP_NUMBER || '').trim()
const canOrder = /^[1-9]\d{7,14}$/.test(WHATSAPP_NUMBER)

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(window.localStorage.getItem(key))
    return Array.isArray(value) ? value : fallback
  } catch {
    return fallback
  }
}

function normalize(text) {
  return String(text).toLowerCase().normalize('NFKD').replace(/[\u064b-\u065f\u0670]/g, '')
}

function scrollToProducts() {
  requestAnimationFrame(() => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}

function pieceCount(count) {
  if (count === 0) return 'لا توجد قطع'
  if (count === 1) return 'قطعة واحدة'
  if (count === 2) return 'قطعتان'
  return `${count} ${count <= 10 ? 'قطع' : 'قطعة'}`
}

function App() {
  const [category, setCategory] = useState('all')
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [sort, setSort] = useState('featured')
  const [showAll, setShowAll] = useState(false)
  const [favorites, setFavorites] = useState(() => readStorage('zara-demo-favorites-v1', []).filter((id) => products.some((product) => product.id === id)))
  const [cart, setCart] = useState(() => readStorage('zara-demo-cart-v1', []).filter((item) =>
    item && products.some((product) => product.id === item.id && product.sizes.includes(item.size)) && Number.isInteger(item.qty) && item.qty > 0 && item.qty <= 99))
  const [activeProduct, setActiveProduct] = useState(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [sizeError, setSizeError] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [infoOpen, setInfoOpen] = useState('')
  const [toast, setToast] = useState('')
  const searchRef = useRef(null)
  const [customer, setCustomer] = useState({ name: '', phone: '', city: '', address: '', notes: '' })

  useEffect(() => { try { localStorage.setItem('zara-demo-favorites-v1', JSON.stringify(favorites)) } catch {} }, [favorites])
  useEffect(() => { try { localStorage.setItem('zara-demo-cart-v1', JSON.stringify(cart)) } catch {} }, [cart])
  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])
  useEffect(() => {
    const hasDialog = Boolean(activeProduct || cartOpen || checkoutOpen || infoOpen)
    document.body.classList.toggle('dialog-open', hasDialog)
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      if (activeProduct) setActiveProduct(null)
      else if (checkoutOpen) setCheckoutOpen(false)
      else if (cartOpen) setCartOpen(false)
      else if (infoOpen) setInfoOpen('')
      else if (menuOpen) setMenuOpen(false)
      else if (searchOpen) setSearchOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('dialog-open')
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeProduct, cartOpen, checkoutOpen, infoOpen, menuOpen, searchOpen])
  useEffect(() => {
    const dialog = document.querySelector('[role="dialog"]')
    if (!dialog) return undefined
    const previousFocus = document.activeElement
    const getFocusable = () => Array.from(dialog.querySelectorAll('button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])')).filter((element) => element.getClientRects().length)
    const frame = requestAnimationFrame(() => getFocusable()[0]?.focus())
    const trapFocus = (event) => {
      if (event.key !== 'Tab') return
      const elements = getFocusable()
      if (!elements.length) { event.preventDefault(); return }
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (!dialog.contains(document.activeElement) || (event.shiftKey && document.activeElement === first)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', trapFocus)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('keydown', trapFocus)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [activeProduct, cartOpen, checkoutOpen, infoOpen])

  const filtered = useMemo(() => {
    const needle = normalize(query.trim())
    const result = products.filter((product) => {
      const matchesCategory = category === 'all' || product.category === category
      const matchesFavorite = !favoritesOnly || favorites.includes(product.id)
      const matchesQuery = !needle || normalize(`${product.name} ${product.color} ${product.description} ${product.keywords}`).includes(needle)
      return matchesCategory && matchesFavorite && matchesQuery
    })
    if (sort === 'low') return result.sort((a, b) => a.price - b.price)
    if (sort === 'high') return result.sort((a, b) => b.price - a.price)
    return result
  }, [category, favorites, favoritesOnly, query, sort])

  const visibleProducts = showAll ? filtered : filtered.slice(0, 8)
  const cartItems = cart.map((item) => ({ ...item, product: products.find((product) => product.id === item.id) })).filter((item) => item.product)
  const cartCount = cartItems.reduce((sum, item) => sum + item.qty, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.product.price, 0)

  function chooseCategory(next) {
    setCategory(next)
    setQuery('')
    setSearchOpen(false)
    setFavoritesOnly(false)
    setShowAll(next !== 'all')
    setMenuOpen(false)
    scrollToProducts()
  }

  function toggleFavoritesView() {
    setFavoritesOnly((current) => !current)
    setCategory('all')
    setQuery('')
    setSearchOpen(false)
    setShowAll(true)
    setMenuOpen(false)
    scrollToProducts()
  }

  function toggleFavorite(id) {
    const adding = !favorites.includes(id)
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
    setToast(adding ? 'أُضيفت القطعة إلى المفضلة' : 'أُزيلت القطعة من المفضلة')
  }

  function openProduct(product) {
    setSelectedSize(product.sizes.length === 1 ? product.sizes[0] : '')
    setSizeError(false)
    setActiveProduct(product)
  }

  function addToCart() {
    if (!selectedSize) {
      setSizeError(true)
      return
    }
    setCart((current) => {
      const existing = current.find((item) => item.id === activeProduct.id && item.size === selectedSize)
      if (existing) return current.map((item) => item === existing ? { ...item, qty: Math.min(item.qty + 1, 99) } : item)
      return [...current, { id: activeProduct.id, size: selectedSize, qty: 1 }]
    })
    setActiveProduct(null)
    setCartOpen(true)
    setToast('أُضيفت القطعة إلى حقيبتك')
  }

  function changeQuantity(id, size, delta) {
    setCart((current) => current.map((item) => item.id === id && item.size === size
      ? { ...item, qty: Math.min(99, item.qty + delta) } : item).filter((item) => item.qty > 0))
  }

  function removeItem(id, size) {
    setCart((current) => current.filter((item) => !(item.id === id && item.size === size)))
    setToast('أُزيلت القطعة من الحقيبة')
  }

  function orderSummary() {
    return ['مرحباً، أود الاستفسار عن الطلب التالي:', '',
      ...cartItems.map((item) => `• ${item.product.name} | المقاس: ${item.size} | العدد: ${item.qty} | ${formatPrice(item.product.price * item.qty)}`),
      '', `المجموع التقديري: ${formatPrice(subtotal)}`, 'التوصيل غير محسوب في المجموع.'].join('\n')
  }

  async function copySummary() {
    const text = orderSummary()
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(text)
      else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        const copied = document.execCommand('copy')
        textarea.remove()
        if (!copied) throw new Error('copy unavailable')
      }
      setToast('تم نسخ ملخص الحقيبة')
    } catch {
      setToast('تعذّر النسخ؛ يرجى المحاولة من متصفح آخر')
    }
  }

  function sendOrder(event) {
    event.preventDefault()
    if (!canOrder || !cartItems.length) return
    const message = [orderSummary(), '', `الاسم: ${customer.name.trim()}`, `الهاتف: ${customer.phone.trim()}`,
      `الولاية / المدينة: ${customer.city.trim()}`, `العنوان: ${customer.address.trim()}`,
      customer.notes.trim() ? `ملاحظات: ${customer.notes.trim()}` : ''].filter(Boolean).join('\n')
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setToast('أرسلي الرسالة من واتساب لإكمال الطلب')
  }

  const infoContent = {
    about: {
      title: 'عن المتجر',
      text: 'ZARA واجهة متجر تجريبية مستقلة للأزياء، صُممت لتقديم تجربة تسوق عربية بسيطة. هذا المشروع غير تابع لعلامة Zara العالمية. المنتجات والصور والأسعار المعروضة للتجربة.',
    },
    orders: {
      title: 'الطلبات والتوصيل',
      text: canOrder ? 'يمكن إرسال تفاصيل الحقيبة عبر واتساب. يرجى الاتفاق على توفر المنتجات والتوصيل مباشرةً مع المتجر؛ لا توجد خدمة دفع إلكتروني مفعّلة داخل الموقع.' : 'هذه نسخة تجريبية. لم تُضف بعد وسيلة لاستقبال الطلبات أو خدمة دفع أو توصيل. يمكنك تجربة الحقيبة واختيار المقاسات دون إجراء عملية شراء.',
    },
    sizes: {
      title: 'المقاسات',
      text: 'اختاري المقاس المتاح من صفحة كل قطعة. المقاسات والمنتجات المعروضة حالياً للتجربة، ويُنصح بالتأكد من القياسات الفعلية قبل بدء البيع.',
    },
  }

  return (
    <>
      <div className="announcement">
        <span>تشكيلة جديدة، تفاصيل تشبهك</span>
        <span className="announcement-divider" aria-hidden="true" />
        <button onClick={() => chooseCategory('all')}>اكتشفي المجموعة <ArrowUpLeft size={12} strokeWidth={1.5} /></button>
      </div>

      <header className="site-header">
        <div className="header-inner">
          <button className="brand" aria-label="ZARA، العودة إلى بداية الصفحة" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>ZARA<span className="brand-dot">.</span></button>
          <nav className="desktop-nav" aria-label="القائمة الرئيسية">
            <button onClick={() => chooseCategory('all')}>الجديد</button>
            <button onClick={() => chooseCategory('women')}>النساء</button>
            <button onClick={() => chooseCategory('men')}>الرجال</button>
            <button onClick={() => chooseCategory('accessories')}>الإكسسوارات</button>
          </nav>
          <div className="header-actions">
            <button className="search-trigger" onClick={() => { setSearchOpen(!searchOpen); setMenuOpen(false) }} aria-label="البحث" aria-expanded={searchOpen}>
              <Search size={19} strokeWidth={1.5} /><span>بحث</span>
            </button>
            <button className={`icon-btn favorite-header ${favoritesOnly ? 'is-active' : ''}`} onClick={toggleFavoritesView} aria-label={`المفضلة، ${favorites.length} منتجات`} title="المفضلة">
              <Heart size={19} strokeWidth={1.5} fill={favoritesOnly ? 'currentColor' : 'none'} />
              {favorites.length > 0 && <span className="small-badge">{favorites.length}</span>}
            </button>
            <button className="bag-trigger" onClick={() => setCartOpen(true)} aria-label={`حقيبة التسوق، ${pieceCount(cartCount)}`}>
              <ShoppingBag size={19} strokeWidth={1.5} /><span className="bag-label">الحقيبة</span><span className="bag-count">{cartCount}</span>
            </button>
            <button className="icon-btn menu-trigger" onClick={() => { setMenuOpen(!menuOpen); setSearchOpen(false) }} aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'} aria-expanded={menuOpen}>
              {menuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
            </button>
          </div>
        </div>
        {searchOpen && <form className="search-panel" onSubmit={(event) => { event.preventDefault(); setShowAll(true); scrollToProducts() }}>
          <Search size={20} strokeWidth={1.4} aria-hidden="true" />
          <input ref={searchRef} value={query} onChange={(event) => { setQuery(event.target.value); setCategory('all'); setFavoritesOnly(false); setShowAll(true) }} placeholder="ابحثي عن قطعة أو لون..." aria-label="ابحث في المنتجات" />
          {query && <button type="button" className="clear-search" onClick={() => { setQuery(''); searchRef.current?.focus() }}>مسح</button>}
          <button type="submit" className="search-submit">عرض النتائج <ArrowLeft size={16} /></button>
          <button type="button" className="icon-btn" onClick={() => setSearchOpen(false)} aria-label="إغلاق البحث"><X size={20} strokeWidth={1.5} /></button>
        </form>}
        {menuOpen && <nav className="mobile-nav" aria-label="قائمة الهاتف">
          <button onClick={() => chooseCategory('all')}>الجديد <ArrowLeft size={16} /></button>
          <button onClick={() => chooseCategory('women')}>النساء <ArrowLeft size={16} /></button>
          <button onClick={() => chooseCategory('men')}>الرجال <ArrowLeft size={16} /></button>
          <button onClick={() => chooseCategory('accessories')}>الإكسسوارات <ArrowLeft size={16} /></button>
          <button onClick={toggleFavoritesView}>المفضلة <Heart size={16} /></button>
        </nav>}
      </header>

      <main>
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-shade" />
          <div className="hero-copy">
            <div className="hero-kicker"><span className="kicker-line" /> THE NEW COLLECTION <span className="kicker-number">/ 01</span></div>
            <h1 id="hero-heading">أناقة تشبهكِ،<br /><span>في كل يوم.</span></h1>
            <p>قطع مختارة بعناية، لتكون جزءاً من حكايتكِ اليومية.</p>
            <button className="hero-button" onClick={() => chooseCategory('all')}><span>اكتشفي المجموعة</span><ArrowLeft size={18} strokeWidth={1.5} /></button>
          </div>
          <div className="hero-bottom" aria-hidden="true"><span>THE EVERYDAY EDIT</span><span className="hero-index">01 <i /> 01</span></div>
          <div className="hero-side" aria-hidden="true">DESIGNED FOR EVERYDAY MOMENTS</div>
        </section>

        <div className="intro-line page-width" aria-hidden="true">
          <span>CURATED WITH INTENTION</span>
          <div><span className="intro-dot" /> أسلوبك يبدأ من التفاصيل</div>
          <span>THE EVERYDAY EDIT / 01</span>
        </div>

        <section className="collection page-width" id="collection" aria-labelledby="collection-title">
          <div className="section-heading">
            <div>
              <div className="section-kicker"><span /> THE CURATED EDIT</div>
              <h2 id="collection-title">{favoritesOnly ? 'قطعك المفضلة' : query.trim() ? 'نتائج البحث' : 'مختارات الموسم'}<span className="heading-period">.</span></h2>
              <p>{favoritesOnly ? 'كل القطع التي أحببتِها، في مكان واحد.' : query.trim() ? `نتائج البحث عن «${query.trim()}»` : 'قطع استثنائية، صُممت لترافق تفاصيل يومك.'}</p>
            </div>
            <button className="text-link section-all" onClick={() => { setCategory('all'); setFavoritesOnly(false); setQuery(''); setShowAll(true) }}>عرض كل المنتجات <ArrowLeft size={17} strokeWidth={1.4} /></button>
          </div>
          <div className="collection-toolbar">
            <div className="category-tabs" role="group" aria-label="تصفية حسب الفئة">
              {categories.map((item) => <button key={item.id} className={category === item.id && !favoritesOnly ? 'selected' : ''} aria-pressed={category === item.id && !favoritesOnly} onClick={() => { setCategory(item.id); setFavoritesOnly(false); setShowAll(item.id !== 'all') }}>{item.label}</button>)}
              {favoritesOnly && <button className="selected" aria-pressed="true" onClick={() => setFavoritesOnly(false)}>المفضلة</button>}
            </div>
            <div className="sort-controls">
              <span className="product-count">{pieceCount(filtered.length)}</span>
              <label className="sort-label"><SlidersHorizontal size={16} strokeWidth={1.4} /><span className="sr-only">ترتيب المنتجات</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="ترتيب المنتجات">
                  <option value="featured">الترتيب: مختارة لك</option><option value="low">السعر: من الأقل</option><option value="high">السعر: من الأعلى</option>
                </select><ChevronDown size={13} strokeWidth={1.4} />
              </label>
            </div>
          </div>

          {visibleProducts.length ? <div className="product-grid">
            {visibleProducts.map((product, index) => <article className="product-card" key={product.id}>
              <div className="product-image-wrap">
                <button className="product-image-button" onClick={() => openProduct(product)} aria-label={`عرض تفاصيل ${product.name}`}>
                  <img src={product.image} alt={product.name} loading={index < 4 ? 'eager' : 'lazy'} />
                </button>
                {product.badge && <span className="product-badge">{product.badge}</span>}
                <button className={`product-favorite ${favorites.includes(product.id) ? 'liked' : ''}`} onClick={() => toggleFavorite(product.id)} aria-label={`${favorites.includes(product.id) ? 'إزالة من' : 'إضافة إلى'} المفضلة: ${product.name}`} aria-pressed={favorites.includes(product.id)}>
                  <Heart size={18} strokeWidth={1.4} fill={favorites.includes(product.id) ? 'currentColor' : 'none'} />
                </button>
                <button className="quick-add" onClick={() => openProduct(product)} aria-label={`اختيار مقاس ${product.name}`}><Plus size={19} strokeWidth={1.4} /></button>
              </div>
              <div className="product-meta">
                <div className="product-details"><button className="product-name" onClick={() => openProduct(product)}>{product.name}</button><div className="product-color"><span style={{ background: product.swatch }} />{product.color}</div></div>
                <span className="price" dir="ltr">{formatPrice(product.price)}</span>
              </div>
            </article>)}
          </div> : <div className="empty-results"><Search size={29} strokeWidth={1.2} /><h3>{favoritesOnly ? 'لا توجد قطع مفضلة بعد' : 'لم نجد ما تبحثين عنه'}</h3><p>{favoritesOnly ? 'اضغطي على علامة القلب لحفظ القطع التي تعجبك.' : 'جرّبي كلمات أخرى أو اكتشفي كل القطع.'}</p><button className="outline-button" onClick={() => { setCategory('all'); setFavoritesOnly(false); setQuery(''); setSearchOpen(false); setShowAll(false) }}>استكشفي المجموعة</button></div>}
          {!showAll && filtered.length > visibleProducts.length && <div className="more-wrap"><button className="outline-button" onClick={() => setShowAll(true)}>اكتشفي المزيد <Plus size={16} strokeWidth={1.4} /></button><span>عرض {visibleProducts.length} من {filtered.length} قطع</span></div>}
        </section>

        <section className="editorial" aria-labelledby="editorial-title">
          <div className="editorial-image"><img src="/images/product-coat.jpg" alt="إطلالة بمعطف ترنش بلون رملي" loading="lazy" /><span className="editorial-image-label">THE EVERYDAY EDIT &nbsp; / &nbsp; 02</span></div>
          <div className="editorial-copy">
            <div className="section-kicker"><span /> A NOTE ON STYLE</div>
            <div className="editorial-watermark" aria-hidden="true">less<br /><i>is more.</i></div>
            <h2 id="editorial-title">الجمال في<br /><span>بساطة التفاصيل.</span></h2>
            <p>قصّات مدروسة، ألوان هادئة، وقطع تمنحك المساحة لتعبّري عن نفسكِ بطريقتك الخاصة.</p>
            <button className="text-link editorial-link" onClick={() => chooseCategory('women')}>اكتشفي إطلالات النساء <ArrowLeft size={18} strokeWidth={1.4} /></button>
            <span className="editorial-foot">AN EVERYDAY KIND OF ELEGANCE</span>
          </div>
        </section>

        <section className="values page-width" aria-label="فلسفة المجموعة">
          <div><span className="value-number">01 /</span><h3>قطع تدوم في أسلوبك</h3><p>تصاميم تتجاوز تفاصيل اللحظة.</p></div>
          <div><span className="value-number">02 /</span><h3>جمال في البساطة</h3><p>ألوان هادئة وقصّات يسهل تنسيقها.</p></div>
          <div><span className="value-number">03 /</span><h3>تفاصيل تشبهك</h3><p>اختيارات لتكتبي بها حكايتك الخاصة.</p></div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-main page-width">
          <div className="footer-about"><button className="brand footer-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>ZARA<span className="brand-dot">.</span></button><p>أناقة بسيطة، لتفاصيل الحياة الجميلة.</p><span>THE EVERYDAY EDIT</span></div>
          <div className="footer-column"><h3>اكتشفي</h3><button onClick={() => chooseCategory('women')}>النساء</button><button onClick={() => chooseCategory('men')}>الرجال</button><button onClick={() => chooseCategory('accessories')}>الإكسسوارات</button></div>
          <div className="footer-column"><h3>المساعدة</h3><button onClick={() => setInfoOpen('orders')}>الطلبات والتوصيل</button><button onClick={() => setInfoOpen('sizes')}>دليل المقاسات</button><button onClick={() => setInfoOpen('about')}>عن المتجر</button></div>
          <div className="footer-note"><span>MADE FOR YOUR EVERYDAY</span><p>كل يوم،<br />حكاية جديدة.</p></div>
        </div>
        <div className="footer-bottom page-width"><span>© {new Date().getFullYear()} ZARA · تجربة متجر مستقلة</span><span>المنتجات والأسعار تجريبية · غير تابع لعلامة Zara العالمية</span><span dir="ltr">ALGERIA / DZD</span></div>
      </footer>

      {activeProduct && <div className="overlay modal-overlay" onMouseDown={() => setActiveProduct(null)}>
        <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="product-modal-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="close-modal" onClick={() => setActiveProduct(null)} aria-label="إغلاق تفاصيل المنتج"><X size={20} strokeWidth={1.5} /></button>
          <div className="modal-image"><img src={activeProduct.image} alt={activeProduct.name} /></div>
          <div className="modal-content">
            <div className="section-kicker"><span /> THE CURATED EDIT</div>
            <h2 id="product-modal-title">{activeProduct.name}</h2>
            <div className="modal-price" dir="ltr">{formatPrice(activeProduct.price)}</div>
            <p className="modal-description">{activeProduct.description}</p>
            <div className="modal-color">اللون: <strong>{activeProduct.color}</strong><span style={{ background: activeProduct.swatch }} /></div>
            <fieldset className="size-fieldset"><legend>اختاري المقاس <span>{sizeError ? 'يرجى اختيار المقاس' : ''}</span></legend><div className="size-list">{activeProduct.sizes.map((size) => <button key={size} className={selectedSize === size ? 'size-selected' : ''} aria-pressed={selectedSize === size} onClick={() => { setSelectedSize(size); setSizeError(false) }}>{size}</button>)}</div></fieldset>
            <button className="dark-button add-to-bag" onClick={addToCart}>إضافة إلى الحقيبة <ShoppingBag size={18} strokeWidth={1.5} /></button>
            <button className="modal-wishlist" onClick={() => toggleFavorite(activeProduct.id)}><Heart size={17} strokeWidth={1.5} fill={favorites.includes(activeProduct.id) ? 'currentColor' : 'none'} /> {favorites.includes(activeProduct.id) ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}</button>
            <div className="sample-note">المنتجات والأسعار معروضة لأغراض تجريبية.</div>
          </div>
        </section>
      </div>}

      {cartOpen && <div className="overlay drawer-overlay" onMouseDown={() => setCartOpen(false)}>
        <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title" onMouseDown={(event) => event.stopPropagation()}>
          <div className="drawer-header"><div><span className="drawer-kicker">YOUR SELECTION</span><h2 id="cart-title">حقيبتك <span>({cartCount})</span></h2></div><button className="icon-btn" onClick={() => setCartOpen(false)} aria-label="إغلاق الحقيبة"><X size={21} strokeWidth={1.5} /></button></div>
          {cartItems.length ? <><div className="cart-items">{cartItems.map((item) => <article className="cart-item" key={`${item.id}-${item.size}`}>
            <img src={item.product.image} alt={item.product.name} />
            <div className="cart-item-info"><div className="cart-item-top"><h3>{item.product.name}</h3><button className="remove-item" onClick={() => removeItem(item.id, item.size)} aria-label={`حذف ${item.product.name} من الحقيبة`}><Trash2 size={16} strokeWidth={1.4} /></button></div><p>{item.product.color} <span> / </span> {item.size}</p><span className="cart-item-price" dir="ltr">{formatPrice(item.product.price)}</span>
              <div className="quantity"><button onClick={() => changeQuantity(item.id, item.size, -1)} aria-label={`تقليل كمية ${item.product.name}`}><Minus size={13} /></button><span>{item.qty}</span><button onClick={() => changeQuantity(item.id, item.size, 1)} disabled={item.qty >= 99} aria-label={`زيادة كمية ${item.product.name}`}><Plus size={13} /></button></div>
            </div>
          </article>)}</div><div className="cart-bottom"><div className="subtotal"><span>المجموع التقديري</span><strong dir="ltr">{formatPrice(subtotal)}</strong></div><p>رسوم التوصيل غير مشمولة في المجموع.</p><button className="dark-button checkout-button" onClick={() => { setCartOpen(false); setCheckoutOpen(true) }}>متابعة الطلب <ArrowLeft size={18} strokeWidth={1.5} /></button>{!canOrder && <div className="checkout-disclaimer">نسخة تجريبية: استقبال الطلبات والدفع غير مفعّلَين.</div>}</div></> : <div className="empty-cart"><div className="empty-bag"><ShoppingBag size={30} strokeWidth={1.1} /></div><h3>حقيبتك فارغة حتى الآن</h3><p>اختاري ما يشبهك من مجموعتنا.</p><button className="dark-button" onClick={() => { setCartOpen(false); chooseCategory('all') }}>اكتشفي المجموعة <ArrowLeft size={17} /></button></div>}
        </aside>
      </div>}

      {checkoutOpen && <div className="overlay modal-overlay" onMouseDown={() => setCheckoutOpen(false)}>
        <section className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title" onMouseDown={(event) => event.stopPropagation()}>
          <button className="close-modal" onClick={() => setCheckoutOpen(false)} aria-label="إغلاق صفحة الطلب"><X size={20} strokeWidth={1.5} /></button>
          <div className="section-kicker"><span /> YOUR SELECTION</div><h2 id="checkout-title">متابعة الطلب</h2>
          <div className="checkout-total"><span>{pieceCount(cartCount)} · المجموع التقديري</span><strong dir="ltr">{formatPrice(subtotal)}</strong></div>
          {canOrder ? <form className="checkout-form" onSubmit={sendOrder}>
            <p>أدخلي بياناتك لإنشاء رسالة طلب عبر واتساب. لن يُرسل الطلب حتى تؤكدي إرسال الرسالة بنفسك.</p>
            <div className="form-grid"><label>الاسم الكامل<input value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} required maxLength="100" /></label><label>رقم الهاتف<input value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} type="tel" required maxLength="30" dir="auto" /></label><label>الولاية / المدينة<input value={customer.city} onChange={(e) => setCustomer({ ...customer, city: e.target.value })} required maxLength="100" /></label><label>العنوان<input value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} required maxLength="200" /></label></div>
            <label>ملاحظات (اختياري)<textarea value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} maxLength="500" rows="2" /></label>
            <p className="checkout-disclaimer">لا تتوفر بوابة دفع إلكتروني. تُناقش تفاصيل التوصيل والدفع مع المتجر.</p><button className="dark-button" type="submit">فتح واتساب لإرسال الطلب <ArrowUpLeft size={17} /></button>
          </form> : <div className="checkout-unavailable"><ShoppingBag size={30} strokeWidth={1.1} /><h3>الطلب غير مفعّل بعد</h3><p>هذا المتجر نموذج تجريبي. لم يتم ربط وسيلة لاستقبال الطلبات أو الدفع؛ لن تُرسل بيانات ولن تُجرى عملية شراء.</p><button className="outline-button" onClick={copySummary}>نسخ محتويات الحقيبة</button></div>}
          <button className="back-to-cart" onClick={() => { setCheckoutOpen(false); setCartOpen(true) }}>العودة إلى الحقيبة</button>
        </section>
      </div>}

      {infoOpen && <div className="overlay modal-overlay" onMouseDown={() => setInfoOpen('')}><section className="info-modal" role="dialog" aria-modal="true" aria-labelledby="info-title" onMouseDown={(event) => event.stopPropagation()}><button className="close-modal" onClick={() => setInfoOpen('')} aria-label="إغلاق"><X size={20} /></button><div className="section-kicker"><span /> ZARA / INFORMATION</div><h2 id="info-title">{infoContent[infoOpen].title}</h2><p>{infoContent[infoOpen].text}</p><button className="text-link" onClick={() => setInfoOpen('')}>حسناً <ArrowLeft size={16} /></button></section></div>}

      <div className={`toast ${toast ? 'show' : ''}`} role="status" aria-live="polite"><Check size={16} strokeWidth={1.6} />{toast}</div>
    </>
  )
}

export default App
