/* =========================================================
   Tastylicious Cakes — product catalogue + image prompt registry
   Every image on the site is looked up by "slug" in IMAGES.
   Drop a file named  assets/img/<slug>.webp  (or .png / .jpg)
   and it replaces the placeholder automatically.
   ========================================================= */

const SHOP = {
  name: 'Tastylicious Cakes',
  phone: '+91-7439303013',
  tel: '+917439303013',
  wa: '917439303013',
  freeDeliveryAt: 1500,
  deliveryFee: 80,
  promo: { code: 'SWEET10', pct: 10 },
};

const STYLE_PHOTO =
  'Photorealistic professional food photography, soft natural window light from the left, ' +
  'warm cream (#FFF6E9) seamless background with a few scattered pastel sprinkles, shallow depth of field, ' +
  'rich appetizing detail, true-to-life colours. No text, no watermark, no logos, no hands.';

const STYLE_CUTOUT =
  'Isolated product cut-out on a fully transparent background (PNG with alpha), soft subtle contact shadow under the object, ' +
  'photorealistic, crisp edges, bright and appetizing, slightly playful 3/4 front angle. No text, no watermark, no logos, no props.';

const prompt = (subject, aspect, style = STYLE_PHOTO) =>
  `${subject}. ${style} Aspect ratio ${aspect}. High resolution.`;

const SIZESETS = {
  cake: [
    { label: '½ kg', mult: 1 },
    { label: '1 kg', mult: 1.9 },
    { label: '2 kg', mult: 3.6 },
  ],
  tier: [
    { label: '1.5 kg', mult: 1 },
    { label: '2.5 kg', mult: 1.6 },
    { label: '3.5 kg', mult: 2.2 },
  ],
  cupcake: [
    { label: 'Box of 2', mult: 1 },
    { label: 'Box of 4', mult: 1.9 },
    { label: 'Box of 6', mult: 2.7 },
  ],
  pastry: [
    { label: '1 pc', mult: 1 },
    { label: '2 pcs', mult: 2 },
    { label: '4 pcs', mult: 3.8 },
  ],
};

const PRODUCTS = [
  /* ---------------- Cakes ---------------- */
  {
    id: 'strawberry-delight', cat: 'cakes', name: 'Strawberry Delight',
    tag: 'Vanilla & fresh strawberries', price: 650, sizes: 'cake', eggless: true, badge: 'Bestseller', tint: 'pink',
    desc: 'Cloud-soft vanilla sponge layered with whipped cream and fresh Mahabaleshwar strawberries. Light, juicy and dangerously easy to finish.',
    subject: 'A two-layer semi-naked vanilla sponge cake with whipped cream filling, topped generously with fresh halved strawberries and two pastel macarons, sitting on a speckled stoneware cake stand, a few whole strawberries scattered around',
  },
  {
    id: 'party-sprinkles-drip', cat: 'cakes', name: 'Party Sprinkles & Drips',
    tag: 'Pastel layers, macaron crown', price: 850, sizes: 'cake', eggless: true, badge: 'Signature', tint: 'mint',
    desc: 'Our showstopper. Pastel pink, mint and butter-yellow buttercream bands, rainbow pastel drips and a crown of macarons and meringue kisses.',
    subject: 'A tall round celebration cake frosted in horizontal pastel bands of baby pink, mint and butter yellow buttercream, with pastel lilac, pink and yellow drips running down the sides, crowned with a pile of pastel macarons and white meringue kisses, rainbow nonpareil sprinkles around the base, on a beige ceramic cake stand',
  },
  {
    id: 'double-chocolate-dream', cat: 'cakes', name: 'Double Chocolate Dream',
    tag: 'Ganache drip & forest berries', price: 750, sizes: 'cake', eggless: true, badge: 'Bestseller', tint: 'choc',
    desc: 'Dark Belgian chocolate sponge, fudge filling and a glossy ganache drip, finished with chocolate curls and forest berries.',
    subject: 'A rich dark chocolate layer cake with a glossy dark ganache drip, topped with chocolate curls, fresh raspberries, blackberries and blueberries, on a dark rustic ceramic plate, a few berries and chocolate shavings around it, moody warm light',
  },
  {
    id: 'nolen-gur-caramel', cat: 'cakes', name: 'Nolen Gur Caramel',
    tag: 'Kolkata winter special', price: 780, sizes: 'cake', eggless: true, badge: 'Winter Special', tint: 'butter',
    desc: 'Our love letter to a Kolkata winter: date-palm jaggery sponge, nolen gur caramel drip and a crumble of sandesh and pistachio.',
    subject: 'A golden-brown round cake with a glossy amber caramel drip made from nolen gur (Bengali date palm jaggery), topped with small round white Bengali sandesh sweets and crushed green pistachio, on a polished brass plate lined with a fresh banana leaf, a small clay pot of jaggery beside it',
  },
  {
    id: 'mishti-doi-cheesecake', cat: 'cakes', name: 'Mishti Doi Cheesecake',
    tag: 'Baked Bengali yoghurt cheesecake', price: 820, sizes: 'cake', eggless: false, badge: 'New', tint: 'peach',
    desc: 'Creamy baked cheesecake inspired by mishti doi, on a cardamom biscuit base, glazed with caramelised jaggery.',
    subject: 'A round baked cheesecake with a smooth caramel-brown jaggery glazed top, one slice cut out showing creamy pale beige interior and a biscuit base, garnished with a few saffron strands and crushed cardamom, served beside a small traditional terracotta clay bowl (bhaar), on a light wooden board',
  },
  {
    id: 'pastel-fantasy', cat: 'cakes', name: 'Pastel Fantasy',
    tag: 'Two-tier fondant stars', price: 2200, sizes: 'tier', eggless: true, badge: 'Party', tint: 'sky',
    desc: 'Two tiers of pastel fondant, white chocolate drip, sugar stars and a sweet little pearl border. Made for birthdays that need a wow.',
    subject: 'A two-tier pastel birthday cake covered in soft pastel fondant stripes of pink, lilac, mint and yellow, with a white chocolate drip on the top tier, decorated with pink and lilac sugar stars, white sugar pearls along the bases and a pastel fondant swag border, a large pink star topper, on a white cake stand, pastel party cups softly blurred behind',
  },
  {
    id: 'rustic-floral', cat: 'cakes', name: 'Rustic Floral',
    tag: 'Semi-naked with fresh blooms', price: 900, sizes: 'cake', eggless: true, badge: '', tint: 'peach',
    desc: 'A semi-naked red-velvet beauty with cream-cheese frosting, finished with food-safe fresh flowers and rosemary sprigs.',
    subject: 'A three-layer semi-naked cake with thin white frosting scraped to show the red-velvet sponge layers, topped with fresh pink gerbera, small roses and rosemary sprigs, set on a rustic round wooden log slice, a few loose petals around, warm rustic setting',
  },
  {
    id: 'rainbow-celebration', cat: 'cakes', name: 'Rainbow Celebration',
    tag: 'Funfetti from top to bottom', price: 800, sizes: 'cake', eggless: true, badge: '', tint: 'pink',
    desc: 'Vanilla funfetti sponge, whipped vanilla buttercream and a full jacket of rainbow sprinkles. Happiness, but make it cake.',
    subject: 'A round cake completely covered on top and sides with colourful rainbow sprinkles (jimmies and nonpareils), on a white plate, a few sprinkles scattered on the table, bright cheerful pink-toned background',
  },
  {
    id: 'black-forest', cat: 'cakes', name: 'Black Forest Classic',
    tag: 'Cherries, cream, chocolate', price: 600, sizes: 'cake', eggless: true, badge: 'Classic', tint: 'choc',
    desc: 'The one everyone grew up with — chocolate sponge, whipped cream, cherries and a snowfall of chocolate shavings.',
    subject: 'A classic black forest cake with whipped cream rosettes, each topped with a glossy red cherry, sides covered in dark chocolate shavings, on a white cake stand',
  },

  /* ---------------- Cupcakes ---------------- */
  {
    id: 'red-velvet-cupcake', cat: 'cupcakes', name: 'Red Velvet Cupcakes',
    tag: 'Cream cheese swirl', price: 180, sizes: 'cupcake', eggless: true, badge: 'Bestseller', tint: 'pink',
    desc: 'Velvety cocoa-red cupcakes with a tall swirl of tangy cream-cheese frosting and red velvet crumbs.',
    subject: 'Two red velvet cupcakes in white paper liners with tall swirls of white cream cheese frosting sprinkled with red velvet crumbs, one cupcake slightly in front',
  },
  {
    id: 'salted-caramel-cupcake', cat: 'cupcakes', name: 'Salted Caramel Cupcakes',
    tag: 'Gooey caramel heart', price: 200, sizes: 'cupcake', eggless: true, badge: '', tint: 'butter',
    desc: 'Brown-butter sponge with a molten salted-caramel centre, caramel buttercream and flaky sea salt.',
    subject: 'Two brown butter cupcakes in kraft paper liners with swirls of caramel buttercream, drizzled with glossy salted caramel and a pinch of flaky sea salt, one cut in half showing a gooey caramel centre',
  },
  {
    id: 'rose-pistachio-cupcake', cat: 'cupcakes', name: 'Rose Pistachio Cupcakes',
    tag: 'Gulab buttercream', price: 220, sizes: 'cupcake', eggless: true, badge: 'New', tint: 'mint',
    desc: 'Cardamom sponge, delicate rose buttercream, crushed pistachios and dried rose petals. Very Kolkata wedding-season.',
    subject: 'Two cupcakes in pale pink liners topped with soft pink rose-flavoured buttercream piped as a rose, sprinkled with crushed green pistachio and dried red rose petals',
  },
  {
    id: 'oreo-crunch-cupcake', cat: 'cupcakes', name: 'Cookies & Cream Cupcakes',
    tag: 'Chocolate cookie crunch', price: 190, sizes: 'cupcake', eggless: true, badge: '', tint: 'choc',
    desc: 'Chocolate cupcakes with cookies-and-cream frosting and a whole chocolate sandwich cookie on top.',
    subject: 'Two dark chocolate cupcakes in black paper liners with swirls of white cookies-and-cream frosting speckled with crushed chocolate cookie crumbs, each topped with half a plain round chocolate sandwich cookie (no brand markings)',
  },

  /* ---------------- Pastries ---------------- */
  {
    id: 'chocolate-truffle-pastry', cat: 'pastries', name: 'Chocolate Truffle Pastry',
    tag: 'Glossy ganache slab', price: 120, sizes: 'pastry', eggless: true, badge: 'Bestseller', tint: 'choc',
    desc: 'Three layers of moist chocolate sponge and truffle ganache with a mirror-glaze top.',
    subject: 'A single rectangular chocolate truffle pastry slice with three visible layers of chocolate sponge and ganache, glossy mirror-glazed top with a chocolate curl and a gold leaf flake, on a small white plate',
  },
  {
    id: 'pineapple-pastry', cat: 'pastries', name: 'Pineapple Pastry',
    tag: "Kolkata's old-school favourite", price: 90, sizes: 'pastry', eggless: true, badge: 'Classic', tint: 'butter',
    desc: 'The bakery-counter classic: vanilla sponge, pineapple cream, a cherry on top. Exactly how you remember it.',
    subject: 'A single rectangular pineapple pastry slice with vanilla sponge and pale yellow pineapple cream layers, topped with whipped cream piping, a pineapple chunk and a bright red glacé cherry, on a small white plate, nostalgic old-school bakery feel',
  },
  {
    id: 'blueberry-cheesecake-slice', cat: 'pastries', name: 'Blueberry Cheesecake Slice',
    tag: 'NY-style, berry compote', price: 180, sizes: 'pastry', eggless: false, badge: '', tint: 'sky',
    desc: 'Dense, creamy New-York-style cheesecake on a buttery crumb base, topped with a glossy blueberry compote.',
    subject: 'A single triangular slice of creamy New York style cheesecake on a golden biscuit crumb base, topped with glossy blueberry compote and fresh blueberries spilling down the side, on a small pale blue plate',
  },
  {
    id: 'butterscotch-crunch-pastry', cat: 'pastries', name: 'Butterscotch Crunch',
    tag: 'Praline crunch layers', price: 100, sizes: 'pastry', eggless: true, badge: '', tint: 'peach',
    desc: 'Butterscotch sponge, whipped cream and crunchy caramel praline, finished with a butterscotch drizzle.',
    subject: 'A single square butterscotch pastry slice with layers of golden sponge and whipped cream, topped with crunchy amber caramel praline bits and a butterscotch sauce drizzle, on a small white plate',
  },
];

/* ---------- Image prompt registry (slug -> {label, icon, prompt}) ---------- */
const IMAGES = {
  'nav-cakes': {
    label: 'Nav · Two-tier chocolate birthday cake', icon: '🎂',
    prompt: prompt('A realistic two-tier chocolate birthday cake: a larger bottom tier and a smaller top tier stacked directly on it, both covered in glossy dark chocolate ganache with drips running down the sides, a few chocolate truffles and fresh raspberries on each tier, and five slim lit birthday candles in red, blue and yellow on the top tier, seen from the front at a slight high angle', '4:5', STYLE_CUTOUT),
  },
  'nav-cupcakes': {
    label: 'Nav · Cupcake', icon: '🧁',
    prompt: prompt('A single chocolate cupcake in a dark brown paper liner with a tall swirl of vanilla buttercream and a few chocolate sprinkles', '4:3', STYLE_CUTOUT),
  },
  'nav-pastries': {
    label: 'Nav · Brownie pastry', icon: '🍫',
    prompt: prompt('A single thick square fudgy chocolate brownie pastry with a glossy crackled chocolate ganache top and a chocolate drizzle, seen from a 3/4 angle so the dense side shows', '4:3', STYLE_CUTOUT),
  },
  'nav-croissant': {
    label: 'Nav · #BakeTheWorldBetter croissant', icon: '🥐',
    prompt: prompt('A single large, long, golden-brown glazed croissant lying horizontally, gently curved, with a shiny honey glaze and thin white icing drizzle only at the two ends; the long smooth middle of the croissant must be left clean and evenly golden with no drizzle, because a hashtag text will be overlaid on it later. Wide panoramic framing, croissant fills the frame edge to edge', '5:2', STYLE_CUTOUT),
  },
  'hero-1': {
    label: 'Hero · Pastel macaron drip cake', icon: '🎂',
    prompt: prompt('A tall round pastel layer cake (pink, mint and butter-yellow bands) with pastel drips, crowned with a pile of pastel macarons and meringue kisses, rainbow sprinkles at the base, just the cake itself with no plate and no cake stand, the flat base of the cake clearly visible at the bottom edge, centred, a few sprinkles and tiny doodle-like confetti floating around', '1:1', STYLE_CUTOUT),
  },
  'hero-2': {
    label: 'Hero · Chocolate ganache cake', icon: '🎂',
    prompt: prompt('A tall dark chocolate drip cake with chocolate curls, gold leaf flakes, raspberries and blueberries on top, just the cake itself with no plate and no cake stand, the flat base of the cake clearly visible at the bottom edge, centred', '1:1', STYLE_CUTOUT),
  },
  'hero-3': {
    label: 'Hero · Nolen gur caramel cake', icon: '🎂',
    prompt: prompt('A tall golden caramel drip cake made with Bengali nolen gur (date palm jaggery), topped with small round white sandesh sweets, crushed pistachio and a few marigold petals, just the cake itself with no plate and no cake stand, the flat base of the cake clearly visible at the bottom edge, centred', '1:1', STYLE_CUTOUT),
  },
  'promo-oven': {
    label: 'Promo · Triple chocolate drip', icon: '🍫',
    prompt: prompt('A round triple chocolate drip cake topped with a ring of chocolate buttercream rosettes and dark chocolate drips running down the sides, front view, on a white plate', '4:3', STYLE_CUTOUT),
  },
  'promo-outlet': {
    label: 'Promo · Chocolate cupcake', icon: '🧁',
    prompt: prompt('A single chocolate cupcake with a tall vanilla buttercream swirl and chocolate sprinkles, seen from the front', '1:1', STYLE_CUTOUT),
  },
  'story-baker': {
    label: 'Story · Baker at work', icon: '👩‍🍳',
    prompt: prompt('A joyful young Indian woman baker with flour on her cheek, hair in a loose bun, wearing a beige linen apron, laughing while smoothing white frosting on a layered cake on a turntable in a cosy warm rustic home kitchen with open wooden shelves and jars, candid documentary style', '4:3', 'Photorealistic lifestyle photography, warm golden ambient light, shallow depth of field, film-like warmth. No text, no watermark, no logos.'),
  },
  'story-shop': {
    label: 'Story · Our little shop', icon: '🏪',
    prompt: prompt('Interior of a cosy small artisan cake shop in Kolkata with a curved glass display counter full of pastries, cupcakes and cakes, warm pendant lights, dark wood shelves, a chalkboard menu on the wall, a large window showing a softly blurred street outside, no people', '4:3', 'Photorealistic interior photography, warm inviting light, slight film grain. Absolutely no readable text or signage, no logos, no watermark.'),
  },
  'story-batter': {
    label: 'Story · Rainbow batter', icon: '🥣',
    prompt: prompt('Close-up of hands whisking a swirl of pastel rainbow cake batter in a large glass bowl with a metal whisk, flour dusted on a light marble counter, a few strawberries nearby', '4:5', STYLE_PHOTO),
  },
  'journey-1': {
    label: 'Custom · Floral tiered cake', icon: '💐',
    prompt: prompt('An elegant three-tier white buttercream wedding cake with horizontal ridged texture, decorated with cascading fresh pink and white roses, on a white pedestal stand in a softly lit banquet hall', '3:4', STYLE_PHOTO),
  },
  'journey-2': {
    label: 'Custom · Kids theme cake', icon: '🎈',
    prompt: prompt('A bright colourful two-tier kids first-birthday cake with rainbow-striped fondant on the bottom tier, a sky-blue top tier with a big red fondant number 1 and a yellow star, small fondant balloons and stars around it, on a white board', '3:4', STYLE_PHOTO),
  },
  'journey-3': {
    label: 'Custom · Semi-naked floral', icon: '🌸',
    prompt: prompt('A two-tier semi-naked cake with strawberry layers peeking through thin white frosting, topped with fresh pink roses, baby\'s breath and eucalyptus leaves, on a cake stand', '3:4', STYLE_PHOTO),
  },
  'cake-box': {
    label: 'Cart · Branded cake box', icon: '🎁',
    prompt:
      'A single closed square bakery cake box made of rich matte cherry-red cardboard (#C41E2E) with a subtle tone-on-tone lighter-red polka-dot pattern, ' +
      'seen from a 3/4 front angle and slightly from above so the lid and one front face are visible. ' +
      'The box is tied with a cream satin ribbon (#F6E2C3) that runs down the middle of the front and across the lid, finishing in a neat, generous bow on top. ' +
      'On the front face, centred, is the bakery logo: the words "Tastylicious" on the first line and "Cakes" on the second line, ' +
      'in a playful, bold, rounded hand-lettered script, warm cream (#FFF3DF) with a thin chocolate-brown (#4A2318) outline so it stands out clearly on the red box, slightly tilted upward to the right, ' +
      'with the smaller word "CAKES" spaced out in cream capitals beneath it. The spelling must be exactly "Tastylicious Cakes" — no other text anywhere. ' +
      'Premium boutique packaging, crisp clean edges, soft realistic lighting from the top left, gentle soft contact shadow under the box. ' +
      'Photorealistic product render, isolated cut-out on a fully transparent background (PNG with alpha), no background, no props, no watermark. ' +
      'Aspect ratio 1:1. High resolution.',
  },
};

PRODUCTS.forEach((p) => {
  IMAGES[p.id] = {
    label: p.name,
    icon: p.cat === 'cakes' ? '🎂' : p.cat === 'cupcakes' ? '🧁' : '🍰',
    prompt: prompt(p.subject, '1:1'),
  };
});

/* Which images were compressed to JPEG (everything else is a PNG cut-out).
   The loader tries this format first, so no request is wasted on a missing .png. */
const IMG_EXT = { 'black-forest': 'jpg', 'blueberry-cheesecake-slice': 'jpg', 'butterscotch-crunch-pastry': 'jpg', 'chocolate-truffle-pastry': 'jpg', 'double-chocolate-dream': 'jpg', 'journey-1': 'jpg', 'journey-2': 'jpg', 'journey-3': 'jpg', 'mishti-doi-cheesecake': 'jpg', 'nolen-gur-caramel': 'jpg', 'oreo-crunch-cupcake': 'jpg', 'party-sprinkles-drip': 'jpg', 'pastel-fantasy': 'jpg', 'pineapple-pastry': 'jpg', 'rainbow-celebration': 'jpg', 'red-velvet-cupcake': 'jpg', 'rose-pistachio-cupcake': 'jpg', 'rustic-floral': 'jpg', 'salted-caramel-cupcake': 'jpg', 'story-baker': 'jpg', 'story-batter': 'jpg', 'story-shop': 'jpg' };

/* Set to true after adding assets/img/cake-box.png (branded box for the nav and floating cart). */
const USE_CAKE_BOX_IMAGE = false;
