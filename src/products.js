export const categories = [
  { id: 'all', label: 'الكل' },
  { id: 'women', label: 'النساء' },
  { id: 'men', label: 'الرجال' },
  { id: 'accessories', label: 'الإكسسوارات' },
]

// Sample catalogue: replace these products, prices and images before accepting orders.
export const products = [
  {
    id: 'structured-blazer', category: 'women', name: 'بليزر بقصة مريحة',
    price: 8900, color: 'أسود', swatch: '#242421', sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: '/images/product-blazer.jpg', badge: 'الأكثر رواجاً',
    description: 'قصة انسيابية بكتفين محددين وتفاصيل بسيطة، لقطعة ترافقك من الصباح إلى المساء.',
    keywords: 'blazer black jacket بليزر جاكيت أسود رسمي',
  },
  {
    id: 'soft-knit', category: 'women', name: 'كنزة محاكة بياقة عالية',
    price: 4900, color: 'عاجي', swatch: '#e6ded0', sizes: ['S', 'M', 'L', 'XL'],
    image: '/images/product-knit.jpg', badge: 'جديد',
    description: 'ملمس ناعم وياقة منسدلة برقي، صُممت لتكون من قطعك المفضلة في كل يوم.',
    keywords: 'knit sweater ivory top كنزة صوف ابيض محاك',
  },
  {
    id: 'relaxed-shirt', category: 'women', name: 'قميص بقصة واسعة',
    price: 5500, color: 'أزرق فاتح', swatch: '#cbd7e1', sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: '/images/product-shirt.jpg', badge: '',
    description: 'قميص مريح بخطوط نظيفة ولون هادئ، يمنح إطلالتك لمسة كلاسيكية معاصرة.',
    keywords: 'shirt blue cotton قميص ازرق',
  },
  {
    id: 'tailored-trousers', category: 'women', name: 'بنطلون واسع بخصر عالٍ',
    price: 6900, color: 'بني رمادي', swatch: '#87786e', sizes: ['XS', 'S', 'M', 'L', 'XL'],
    image: '/images/product-trousers.jpg', badge: 'اختيارنا',
    description: 'بنطلون بقصة واسعة وثنيات أمامية أنيقة، قطعة سهلة التنسيق لكل المناسبات.',
    keywords: 'trousers pants brown wide بنطال سروال بنطلون',
  },
  {
    id: 'midi-dress', category: 'women', name: 'فستان ميدي بانسياب ناعم',
    price: 7900, color: 'أسود', swatch: '#242421', sizes: ['XS', 'S', 'M', 'L'],
    image: '/images/product-dress.jpg', badge: 'جديد',
    description: 'فستان ميدي بقصة مستقيمة وتفصيل ناعم عند الخصر لإطلالة بسيطة ولافتة.',
    keywords: 'dress midi black فستان اسود',
  },
  {
    id: 'trench-coat', category: 'women', name: 'معطف ترنش طويل',
    price: 12900, color: 'رملي', swatch: '#b8a28a', sizes: ['S', 'M', 'L', 'XL'],
    image: '/images/product-coat.jpg', badge: 'قطعة مميزة',
    description: 'معطف طويل بقصة كلاسيكية مريحة ولون محايد ينسجم مع كل إطلالاتك.',
    keywords: 'coat trench beige معطف بيج ترنش',
  },
  {
    id: 'overshirt', category: 'men', name: 'جاكيت أوفرشيرت',
    price: 8500, color: 'فحمي', swatch: '#2d2b29', sizes: ['S', 'M', 'L', 'XL'],
    image: '/images/product-man-jacket.jpg', badge: 'جديد',
    description: 'جاكيت خفيف بتفاصيل عملية وقصة معاصرة، صُمم لطبقات سهلة كل يوم.',
    keywords: 'men jacket overshirt black رجال جاكيت قميص رجالي',
  },
  {
    id: 'shoulder-bag', category: 'accessories', name: 'حقيبة كتف بتصميم منحني',
    price: 6200, color: 'بني داكن', swatch: '#51382d', sizes: ['مقاس واحد'],
    image: '/images/product-bag.jpg', badge: 'اختيارنا',
    description: 'حقيبة بتصميم هادئ وخطوط منحنية، اللمسة الأخيرة لكل إطلالة.',
    keywords: 'bag shoulder brown accessories حقيبة شنطة اكسسوارات',
  },
  {
    id: 'knit-polo', category: 'men', name: 'كنزة بولو محاكة',
    price: 5900, color: 'بني ترابي', swatch: '#66564d', sizes: ['S', 'M', 'L', 'XL'],
    image: '/images/product-man-knit.jpg', badge: '',
    description: 'كنزة بولو ناعمة بتفاصيل بسيطة وقصة مريحة تمنح إطلالتك توازناً سهلاً.',
    keywords: 'men polo knit brown رجالي بولو كنزة رجال',
  },
]

export const formatPrice = (price) => `${new Intl.NumberFormat('en-US').format(price)} د.ج`
