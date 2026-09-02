'use client';

import Image from 'next/image';
import { SyntheticEvent, useMemo, useState } from 'react';
import {
  Check,
  ChevronRight,
  Coffee,
  Heart,
  LoaderCircle,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Wheat,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

type Product = {
  name: string;
  kind: 'bread' | 'syrup' | 'bundle';
  note: string;
  image: string;
  bundleImages?: readonly [string, string];
  includes?: string;
  seasonal?: boolean;
  availableAddIns?: readonly AddIn[];
};

const breadAddIns = [
  'Chocolate chips',
  'Blueberries',
  'Walnuts',
  'Pecans',
] as const;

type AddIn = (typeof breadAddIns)[number];

const products: Product[] = [
  {
    name: 'Pumpkin Vanilla Morning',
    kind: 'bundle',
    includes: 'Pumpkin Bread + Vanilla Syrup',
    note: 'Warm spice and smooth vanilla make an easy cozy classic.',
    image: '/products/pumpkin-bread.webp',
    bundleImages: [
      '/products/pumpkin-bread.webp',
      '/products/vanilla-syrup.webp',
    ],
    availableAddIns: breadAddIns,
  },
  {
    name: 'Banana Caramel Comfort',
    kind: 'bundle',
    includes: 'Banana Bread + Caramel Syrup',
    note: 'Tender banana bread meets a buttery caramel coffee pour.',
    image: '/products/banana-bread.webp',
    bundleImages: [
      '/products/banana-bread.webp',
      '/products/caramel-syrup.webp',
    ],
    availableAddIns: breadAddIns,
  },
  {
    name: 'Lemon Vanilla Bright',
    kind: 'bundle',
    includes: 'Lemon Loaf + Vanilla Syrup',
    note: 'Bright citrus and soft vanilla for a lighter morning pairing.',
    image: '/products/lemon-loaf.webp',
    bundleImages: ['/products/lemon-loaf.webp', '/products/vanilla-syrup.webp'],
    availableAddIns: breadAddIns,
  },
  {
    name: 'Banana Mocha Treat',
    kind: 'bundle',
    includes: 'Banana Bread + Mocha Syrup',
    note: 'Rich chocolate and banana make this the indulgent pick.',
    image: '/products/banana-bread.webp',
    bundleImages: ['/products/banana-bread.webp', '/products/mocha-syrup.webp'],
    availableAddIns: breadAddIns,
  },
  {
    name: 'Pumpkin Bread',
    kind: 'bread',
    note: 'Soft, spiced, and made for cozy mornings.',
    image: '/products/pumpkin-bread.webp',
    availableAddIns: breadAddIns,
  },
  {
    name: 'Banana Bread',
    kind: 'bread',
    note: 'A familiar favorite with a tender crumb.',
    image: '/products/banana-bread.webp',
    availableAddIns: breadAddIns,
  },
  {
    name: 'Lemon Loaf',
    kind: 'bread',
    note: 'Bright, tender, and finished with a delicate lemon glaze.',
    image: '/products/lemon-loaf.webp',
    availableAddIns: breadAddIns,
  },
  {
    name: 'Caramel Syrup',
    kind: 'syrup',
    note: 'Buttery sweetness for coffee, lattes, and more.',
    image: '/products/caramel-syrup.webp',
  },
  {
    name: 'Vanilla Syrup',
    kind: 'syrup',
    note: 'Smooth, classic vanilla with an easy sweetness.',
    image: '/products/vanilla-syrup.webp',
  },
  {
    name: 'Mocha Syrup',
    kind: 'syrup',
    note: 'Rich chocolate flavor for a cafe-style cup.',
    image: '/products/mocha-syrup.webp',
  },
  {
    name: 'Brown Sugar Syrup',
    kind: 'syrup',
    note: 'Deep, mellow sweetness with warm notes.',
    image: '/products/brown-sugar-syrup.webp',
  },
  {
    name: 'Pumpkin Spice Syrup',
    kind: 'syrup',
    note: 'The coziest fall flavor, bottled in small batches.',
    image: '/products/pumpkin-spice-syrup.webp',
    seasonal: true,
  },
  {
    name: 'Banana Bread Syrup',
    kind: 'syrup',
    note: 'A playful seasonal pour inspired by the loaf.',
    image: '/products/banana-bread-syrup.webp',
    seasonal: true,
  },
];

const filters = [
  { value: 'bundles', label: 'Bundles' },
  { value: 'bread', label: 'Homemade breads' },
  { value: 'syrup', label: 'Coffee syrups' },
  { value: 'seasonal', label: 'Seasonal' },
] as const;

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const formspreeEndpoint =
  process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT ??
  'https://formspree.io/f/xppzpqey';

export default function Home() {
  const [filter, setFilter] =
    useState<(typeof filters)[number]['value']>('bundles');
  const [order, setOrder] = useState<Record<string, number>>({});
  const [selectedAddIns, setSelectedAddIns] = useState<Record<string, AddIn[]>>(
    {},
  );
  const [customizingProductName, setCustomizingProductName] = useState<
    string | null
  >(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const visibleProducts = products.filter(
    (product) =>
      (filter === 'seasonal' && product.seasonal) ||
      (filter === 'bundles' && product.kind === 'bundle') ||
      product.kind === filter,
  );
  const orderItems = useMemo(
    () =>
      products
        .filter((product) => order[product.name])
        .map((product) => ({
          ...product,
          quantity: order[product.name],
          selectedAddIns: selectedAddIns[product.name] ?? [],
        })),
    [order, selectedAddIns],
  );
  const itemCount = orderItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );
  const customizingProduct = products.find(
    (product) => product.name === customizingProductName,
  );

  const changeQuantity = (name: string, amount: number) => {
    setSubmitError('');
    setOrder((current) => {
      const quantity = Math.max(0, (current[name] ?? 0) + amount);
      const next = { ...current };
      if (quantity === 0) delete next[name];
      else next[name] = quantity;
      return next;
    });
  };

  const toggleAddIn = (productName: string, addIn: AddIn) => {
    setSubmitError('');
    setSelectedAddIns((current) => {
      const productAddIns = current[productName] ?? [];
      const nextProductAddIns = productAddIns.includes(addIn)
        ? productAddIns.filter((item) => item !== addIn)
        : [...productAddIns, addIn];

      return { ...current, [productName]: nextProductAddIns };
    });
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!orderItems.length) return;
    if (!formspreeEndpoint) {
      setSubmitError('Ordering is almost ready. Please try again shortly.');
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setSubmitting(true);
    setSubmitError('');
    try {
      const response = await fetch(formspreeEndpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          _subject: 'New Loaves & Lattes order request',
          name: formData.get('name'),
          email: formData.get('email'),
          'Phone number': formData.get('phone') || 'Not provided',
          'Preferred pickup': formData.get('pickup'),
          'Order request': orderItems
            .map((item) => {
              const addInDetails =
                item.kind !== 'syrup'
                  ? ` — Add-ins: ${
                      item.selectedAddIns.length
                        ? item.selectedAddIns.join(', ')
                        : 'None'
                    }`
                  : '';
              return `${item.quantity} x ${item.name}${addInDetails}`;
            })
            .join('\n'),
          'Total items': itemCount,
          Notes: formData.get('notes') || 'No additional notes',
        }),
      });
      if (!response.ok) throw new Error('Submission failed');
      form.reset();
      setOrder({});
      setSelectedAddIns({});
      setSheetOpen(false);
      setSuccessOpen(true);
    } catch {
      setSubmitError(
        'We could not send your request. Please check your connection and try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <div className="announcement">
        <span aria-hidden="true">♡</span> Handmade in small batches · Local
        pickup available
      </div>

      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Loaves and Lattes home">
          Loaves <span>&amp;</span> Lattes
        </a>
        <nav aria-label="Main navigation">
          <a href="#menu">Our menu</a>
          <a href="#seasonal">Seasonal</a>
          <a href="#story">Our story</a>
        </nav>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button className="order-trigger" />}>
            <ShoppingBag aria-hidden="true" /> My order{' '}
            <span className="order-count">{itemCount}</span>
          </SheetTrigger>
          <SheetContent className="order-sheet">
            <SheetHeader>
              <p className="eyebrow">A little something sweet</p>
              <SheetTitle>Your order request</SheetTitle>
              <SheetDescription>
                Choose quantities, customize your loaves, and share your
                details. We will follow up to confirm availability, pickup, and
                your total.
              </SheetDescription>
            </SheetHeader>
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="order-items">
                {orderItems.length ? (
                  orderItems.map((item) => (
                    <div className="order-item" key={item.name}>
                      <div className="order-item-top">
                        <div className="order-product">
                          <Image
                            src={`${publicBasePath}${item.image}`}
                            alt=""
                            width={64}
                            height={64}
                          />
                          <span>
                            <strong>{item.name}</strong>
                            <small>
                              {item.kind === 'bread'
                                ? 'Homemade loaf'
                                : item.kind === 'syrup'
                                  ? 'Coffee syrup'
                                  : 'Curated bundle'}
                            </small>
                          </span>
                        </div>
                        <div
                          className="quantity-control"
                          aria-label={`${item.name} quantity`}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => changeQuantity(item.name, -1)}
                            aria-label={`Remove one ${item.name}`}
                          >
                            <Minus />
                          </Button>
                          <span>{item.quantity}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => changeQuantity(item.name, 1)}
                            aria-label={`Add one ${item.name}`}
                          >
                            <Plus />
                          </Button>
                        </div>
                      </div>
                      {item.availableAddIns && (
                        <button
                          type="button"
                          className="customize-trigger compact"
                          onClick={() => setCustomizingProductName(item.name)}
                        >
                          <span className="customize-icon">
                            <Sparkles aria-hidden="true" />
                          </span>
                          <span className="customize-copy">
                            <strong>Edit add-ins</strong>
                            <small>
                              {item.selectedAddIns.length
                                ? item.selectedAddIns.join(', ')
                                : 'No add-ins selected'}
                            </small>
                          </span>
                          <ChevronRight aria-hidden="true" />
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="empty-order">
                    <ShoppingBag aria-hidden="true" />
                    <p>Your order is waiting for something delicious.</p>
                    <span>Choose any item from the menu below.</span>
                  </div>
                )}
              </div>
              {orderItems.length > 0 && (
                <div className="customer-fields">
                  <div className="field-row">
                    <label>
                      Full name
                      <input
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Your name"
                      />
                    </label>
                    <label>
                      Email
                      <input
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>
                  <label>
                    Phone number <span>(optional)</span>
                    <input
                      name="phone"
                      type="tel"
                      autoComplete="tel"
                      placeholder="(555) 555-5555"
                    />
                  </label>
                  <label>
                    Preferred pickup day or time
                    <input
                      name="pickup"
                      required
                      placeholder="Example: Saturday morning"
                    />
                  </label>
                  <label>
                    Anything else? <span>(optional)</span>
                    <textarea
                      name="notes"
                      rows={3}
                      placeholder="Questions, preferences, or a note for us"
                    />
                  </label>
                </div>
              )}
              <div className="order-sheet-footer">
                {submitError && (
                  <p className="form-error" role="alert">
                    {submitError}
                  </p>
                )}
                <Button
                  className="submit-order"
                  type="submit"
                  disabled={!orderItems.length || submitting}
                >
                  {submitting ? <LoaderCircle className="spin" /> : <Heart />}
                  {submitting
                    ? 'Sending your request...'
                    : `Send order request · ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`}
                </Button>
                <p>
                  No payment is collected here. Prices and availability are
                  confirmed personally before your order is final.
                </p>
              </div>
            </form>
          </SheetContent>
        </Sheet>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Made from scratch · Made with love</p>
          <h1>
            Good mornings
            <br />
            start <em>homemade.</em>
          </h1>
          <p className="intro">
            Cozy loaves and small-batch coffee syrups, thoughtfully made for
            slow mornings, shared tables, and the people you love.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#menu">
              Explore the menu <ChevronRight />
            </a>
            <a className="button button-secondary" href="#story">
              Meet the maker
            </a>
          </div>
        </div>
        <div className="hero-mark">
          <Image
            className="hero-photo"
            src={`${publicBasePath}/og.png`}
            alt="Fresh pumpkin and banana breads with coffee syrups and a latte in warm morning light"
            width={1200}
            height={630}
            priority
          />
          <div className="photo-caption">
            <span>Sunday morning, made sweeter.</span>
            <small>Baked fresh · Poured with love ♡</small>
          </div>
        </div>
      </section>

      <section className="trust-wrap" aria-label="Why Loaves and Lattes">
        <div className="trust-strip">
          <div>
            <span className="trust-icon">
              <Wheat />
            </span>
            <span>
              <strong>Made from scratch</strong>
              <small>Thoughtful ingredients</small>
            </span>
          </div>
          <div>
            <span className="trust-icon">
              <Heart />
            </span>
            <span>
              <strong>Made by a new mom</strong>
              <small>For your family, from mine</small>
            </span>
          </div>
          <div>
            <span className="trust-icon">
              <Coffee />
            </span>
            <span>
              <strong>Morning made sweeter</strong>
              <small>Cozy flavors for every cup</small>
            </span>
          </div>
          <div>
            <span className="trust-icon">
              <Sparkles />
            </span>
            <span>
              <strong>Small-batch care</strong>
              <small>In every loaf and bottle</small>
            </span>
          </div>
        </div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <p className="eyebrow">Fresh from the kitchen</p>
          <h2>Pick your cozy.</h2>
          <p>
            Browse the current menu and build an order request. We will
            personally confirm what is fresh, your total, and local pickup.
          </p>
        </div>
        <fieldset className="filters">
          <legend className="sr-only">Filter menu items</legend>
          {filters.map((item) => (
            <Button
              key={item.value}
              variant="ghost"
              className={
                filter === item.value ? 'filter-button active' : 'filter-button'
              }
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
            >
              {item.label}
            </Button>
          ))}
        </fieldset>
        <div className="product-grid">
          {visibleProducts.map((product) => {
            const quantity = order[product.name] ?? 0;
            return (
              <article
                className={
                  product.kind === 'bundle'
                    ? 'product-card bundle-card'
                    : 'product-card'
                }
                key={product.name}
              >
                <div className="product-image">
                  {product.bundleImages ? (
                    <div className="bundle-image-grid" aria-hidden="true">
                      {product.bundleImages.map((image) => (
                        <Image
                          key={image}
                          src={`${publicBasePath}${image}`}
                          alt=""
                          width={350}
                          height={700}
                        />
                      ))}
                    </div>
                  ) : (
                    <Image
                      src={`${publicBasePath}${product.image}`}
                      alt={product.name}
                      width={700}
                      height={700}
                    />
                  )}
                  {product.seasonal && (
                    <span className="seasonal-tag">Limited season</span>
                  )}
                </div>
                <div className="product-copy">
                  <span className="product-kind">
                    {product.kind === 'bread'
                      ? 'Homemade loaf'
                      : product.kind === 'syrup'
                        ? 'Coffee syrup'
                        : 'Curated bundle'}
                  </span>
                  <h3>{product.name}</h3>
                  {product.includes && (
                    <span className="bundle-includes">{product.includes}</span>
                  )}
                  <p>{product.note}</p>
                  {product.availableAddIns && (
                    <button
                      type="button"
                      className="customize-trigger"
                      onClick={() => setCustomizingProductName(product.name)}
                    >
                      <span className="customize-icon">
                        <Sparkles aria-hidden="true" />
                      </span>
                      <span className="customize-copy">
                        <strong>
                          <span className="customize-label-full">
                            Customize loaf
                          </span>
                          <span className="customize-label-short">Add-ins</span>
                        </strong>
                        <small>
                          {(selectedAddIns[product.name] ?? []).length
                            ? (selectedAddIns[product.name] ?? []).join(', ')
                            : 'Choose optional add-ins'}
                        </small>
                      </span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  )}
                </div>
                {quantity === 0 ? (
                  <Button
                    variant="outline"
                    className="add-button"
                    onClick={() => changeQuantity(product.name, 1)}
                  >
                    <Plus />
                    <span className="add-label-full">Add to my order</span>
                    <span className="add-label-short">Add</span>
                  </Button>
                ) : (
                  <div className="card-quantity">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => changeQuantity(product.name, -1)}
                      aria-label={`Remove one ${product.name}`}
                    >
                      <Minus />
                    </Button>
                    <span>
                      <strong>{quantity}</strong> in my order
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => changeQuantity(product.name, 1)}
                      aria-label={`Add one ${product.name}`}
                    >
                      <Plus />
                    </Button>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </section>

      <section className="seasonal-feature" id="seasonal">
        <div className="seasonal-photo">
          <Image
            src={`${publicBasePath}/products/pumpkin-spice-syrup.webp`}
            alt="Example bottle of pumpkin spice syrup in a cozy autumn setting"
            width={900}
            height={900}
          />
        </div>
        <div className="seasonal-copy">
          <p className="eyebrow">Seasonal favorites</p>
          <h2>Cozy flavors are here.</h2>
          <p>
            Two limited-batch syrups bring the feeling of a warm kitchen
            straight to your morning cup.
          </p>
          <div className="seasonal-links">
            <button onClick={() => changeQuantity('Pumpkin Spice Syrup', 1)}>
              Pumpkin Spice <Plus />
            </button>
            <button onClick={() => changeQuantity('Banana Bread Syrup', 1)}>
              Banana Bread <Plus />
            </button>
          </div>
          <small>Perfect in hot coffee, cold brew, or a homemade latte.</small>
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-mark">
          <Image
            className="story-photo"
            src={`${publicBasePath}/products/banana-bread.webp`}
            alt="Example loaf of homemade banana bread on a warm kitchen table"
            width={900}
            height={900}
          />
          <div className="story-seal">
            <Image
              src={`${publicBasePath}/logo.png`}
              alt="Loaves and Lattes logo"
              width={240}
              height={240}
            />
          </div>
        </div>
        <div className="story-copy">
          <p className="eyebrow">The heart behind the kitchen</p>
          <h2>Made by a new mom.</h2>
          <p className="story-lead">
            Loaves &amp; Lattes began with a love for homemade food, cozy
            mornings, and making something special for the people we love.
          </p>
          <p>
            Every loaf and syrup is made in small batches with the kind of care
            that turns an ordinary morning into something worth lingering over.
          </p>
          <blockquote>
            “Made for your family, from mine.” <span>♡</span>
          </blockquote>
        </div>
      </section>

      <section className="how-section">
        <div className="section-heading compact">
          <p className="eyebrow">Easy as Sunday morning</p>
          <h2>How to order.</h2>
        </div>
        <div className="steps">
          <div>
            <span>01</span>
            <h3>Choose your favorites</h3>
            <p>Customize your loaves, add syrups, then adjust quantities.</p>
          </div>
          <div>
            <span>02</span>
            <h3>Share the details</h3>
            <p>Tell us how to reach you and when pickup works best.</p>
          </div>
          <div>
            <span>03</span>
            <h3>We confirm</h3>
            <p>
              We will personally confirm availability, your total, and local
              pickup.
            </p>
          </div>
        </div>
        <Button
          className="button button-primary final-cta"
          onClick={() => setSheetOpen(true)}
        >
          <ShoppingBag /> Review my order ({itemCount})
        </Button>
      </section>

      <footer>
        <div className="footer-brand">
          <p>
            Loaves <em>&amp;</em> Lattes
          </p>
          <span>Homemade breads &amp; coffee syrups</span>
        </div>
        <div className="footer-links">
          <a href="#menu">Menu</a>
          <a href="#seasonal">Seasonal</a>
          <a href="#story">Our story</a>
          <a href="#top">Back to top ↑</a>
        </div>
        <p className="footer-thanks">
          ♡ Thank you for supporting a small business and a new mom’s dream.
        </p>
      </footer>

      <Dialog
        open={Boolean(customizingProduct)}
        onOpenChange={(open) => {
          if (!open) setCustomizingProductName(null);
        }}
      >
        <DialogContent className="customize-dialog">
          <DialogHeader>
            <p className="eyebrow">A little something extra</p>
            <DialogTitle>Make {customizingProduct?.name} yours.</DialogTitle>
            <DialogDescription>
              Pick any add-ins you would like. Choose one, mix a few, or keep
              your loaf classic.
            </DialogDescription>
          </DialogHeader>
          <div className="add-in-choice-grid">
            {customizingProduct?.availableAddIns?.map((addIn) => {
              const isSelected = (
                selectedAddIns[customizingProduct.name] ?? []
              ).includes(addIn);
              return (
                <button
                  type="button"
                  key={addIn}
                  className={isSelected ? 'selected' : ''}
                  aria-pressed={isSelected}
                  onClick={() => toggleAddIn(customizingProduct.name, addIn)}
                >
                  <span className="add-in-check">
                    {isSelected && <Check aria-hidden="true" />}
                  </span>
                  <span>
                    <strong>{addIn}</strong>
                    <small>{isSelected ? 'Added to loaf' : 'Tap to add'}</small>
                  </span>
                </button>
              );
            })}
          </div>
          <DialogClose render={<Button className="finish-customizing" />}>
            Done customizing
          </DialogClose>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="success-dialog" showCloseButton={false}>
          <div className="success-heart">
            <Check />
          </div>
          <DialogHeader>
            <p className="eyebrow">Sweet — it is on the way</p>
            <DialogTitle>Order request received.</DialogTitle>
            <DialogDescription>
              Thank you! We will review your order and reach out soon to confirm
              availability, pickup details, and your total.
            </DialogDescription>
          </DialogHeader>
          <DialogClose
            render={<Button className="button button-primary success-button" />}
          >
            Back to the menu
          </DialogClose>
          <p className="success-note">
            Nothing is charged until we confirm everything with you.
          </p>
        </DialogContent>
      </Dialog>
    </main>
  );
}
