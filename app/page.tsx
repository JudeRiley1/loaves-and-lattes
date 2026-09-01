'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Check, ChevronRight, Clipboard, Coffee, Heart, Minus, Plus, ShoppingBag, Sparkles, Wheat } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
  kind: 'bread' | 'syrup';
  note: string;
  accent: string;
  seasonal?: boolean;
};

const products: Product[] = [
  { name: 'Pumpkin Bread', kind: 'bread', note: 'Soft, spiced & made for cozy mornings.', accent: 'pumpkin' },
  { name: 'Banana Bread', kind: 'bread', note: 'A familiar favorite with a tender crumb.', accent: 'banana' },
  { name: 'Caramel Syrup', kind: 'syrup', note: 'Buttery sweetness for coffee, lattes & more.', accent: 'caramel' },
  { name: 'Vanilla Syrup', kind: 'syrup', note: 'Smooth, classic vanilla with an easy sweetness.', accent: 'vanilla' },
  { name: 'Mocha Syrup', kind: 'syrup', note: 'Rich chocolate flavor for a café-style cup.', accent: 'mocha' },
  { name: 'Brown Sugar Syrup', kind: 'syrup', note: 'Deep, mellow sweetness with warm notes.', accent: 'brown-sugar' },
  { name: 'Pumpkin Spice Syrup', kind: 'syrup', note: 'The coziest fall flavor, bottled in small batches.', accent: 'spice', seasonal: true },
  { name: 'Banana Bread Syrup', kind: 'syrup', note: 'A playful seasonal pour inspired by the loaf.', accent: 'banana-spice', seasonal: true },
];

const filters = [
  { value: 'all', label: 'Everything' },
  { value: 'bread', label: 'Homemade breads' },
  { value: 'syrup', label: 'Coffee syrups' },
  { value: 'seasonal', label: 'Seasonal' },
] as const;

const publicBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function Home() {
  const [filter, setFilter] = useState<(typeof filters)[number]['value']>('all');
  const [order, setOrder] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const visibleProducts = products.filter((product) => {
    if (filter === 'all') return true;
    if (filter === 'seasonal') return product.seasonal;
    return product.kind === filter;
  });

  const toggleProduct = (name: string) => {
    setCopied(false);
    setOrder((current) => current.includes(name) ? current.filter((item) => item !== name) : [...current, name]);
  };

  const copyOrder = async () => {
    if (!order.length) return;
    await navigator.clipboard.writeText(`Hi Loaves & Lattes! I'm interested in:\n${order.map((item) => `• ${item}`).join('\n')}\n\nCould you share availability and pickup details?`);
    setCopied(true);
  };

  return (
    <main>
      <div className="announcement">
        <span aria-hidden="true">♡</span> Handmade in small batches · Local pickup available
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
        <Sheet>
          <SheetTrigger render={<Button className="order-trigger" />}>
            <ShoppingBag aria-hidden="true" />
            My list <span className="order-count">{order.length}</span>
          </SheetTrigger>
          <SheetContent className="order-sheet">
            <SheetHeader>
              <p className="eyebrow">A little something sweet</p>
              <SheetTitle>Your order list</SheetTitle>
              <SheetDescription>
                Build a wish list, then copy it to send to Loaves & Lattes for current availability and pickup details.
              </SheetDescription>
            </SheetHeader>
            <div className="order-items">
              {order.length ? order.map((item) => (
                <div className="order-item" key={item}>
                  <span>{item}</span>
                  <Button variant="ghost" size="icon-sm" onClick={() => toggleProduct(item)} aria-label={`Remove ${item}`}><Minus /></Button>
                </div>
              )) : (
                <div className="empty-order">
                  <ShoppingBag aria-hidden="true" />
                  <p>Your list is waiting for something delicious.</p>
                  <span>Choose any item from the menu below.</span>
                </div>
              )}
            </div>
            <div className="order-sheet-footer">
              <Button className="copy-button" onClick={copyOrder} disabled={!order.length}>
                {copied ? <Check /> : <Clipboard />}
                {copied ? 'Copied — ready to send!' : 'Copy my order list'}
              </Button>
              <p>Prices and availability are confirmed when you order.</p>
            </div>
          </SheetContent>
        </Sheet>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">Made from scratch · Made with love</p>
          <h1>Good mornings<br />start <em>homemade.</em></h1>
          <p className="intro">
            Cozy loaves and small-batch coffee syrups, thoughtfully made for
            slow mornings, shared tables, and the people you love.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href="#menu">Explore the menu <ChevronRight /></a>
            <a className="button button-secondary" href="#story">Meet the maker</a>
          </div>
        </div>
        <div className="hero-mark" aria-label="Loaves and Lattes logo">
          <div className="sun-wash" />
          <Image
            src={`${publicBasePath}/logo.png`}
            alt="Loaves and Lattes — homemade breads and coffee sauces"
            width={840}
            height={840}
            priority
          />
          <p>from our kitchen to yours <span>♡</span></p>
        </div>
      </section>

      <section className="trust-strip" aria-label="Why Loaves and Lattes">
        <div><Wheat /><span><strong>Made from scratch</strong><small>Simple, thoughtful ingredients</small></span></div>
        <div><Heart /><span><strong>Made by a new mom</strong><small>For your family, from mine</small></span></div>
        <div><Coffee /><span><strong>Morning made sweeter</strong><small>Cozy flavors for every cup</small></span></div>
        <div><Sparkles /><span><strong>Small-batch made</strong><small>Care in every loaf and bottle</small></span></div>
      </section>

      <section className="menu-section" id="menu">
        <div className="section-heading">
          <p className="eyebrow">Fresh from the kitchen</p>
          <h2>Pick your cozy.</h2>
          <p>Start a list of what sounds good. No prices are guessed here—availability and totals are confirmed when you order.</p>
        </div>

        <div className="filters" role="group" aria-label="Filter menu items">
          {filters.map((item) => (
            <Button
              key={item.value}
              variant="ghost"
              className={filter === item.value ? 'filter-button active' : 'filter-button'}
              onClick={() => setFilter(item.value)}
              aria-pressed={filter === item.value}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="product-grid">
          {visibleProducts.map((product) => {
            const selected = order.includes(product.name);
            return (
              <article className={`product-card ${product.accent}`} key={product.name}>
                <div className="product-topline">
                  <span>{product.kind === 'bread' ? 'Homemade loaf' : 'Coffee syrup'}</span>
                  {product.seasonal && <span className="seasonal-tag">Limited season</span>}
                </div>
                <div className="product-monogram" aria-hidden="true">
                  {product.kind === 'bread' ? <Wheat /> : <Coffee />}
                </div>
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.note}</p>
                </div>
                <Button
                  variant="outline"
                  className={selected ? 'add-button selected' : 'add-button'}
                  onClick={() => toggleProduct(product.name)}
                  aria-pressed={selected}
                >
                  {selected ? <Check /> : <Plus />}
                  {selected ? 'Added to my list' : 'Add to my list'}
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="seasonal-feature" id="seasonal">
        <div className="seasonal-number" aria-hidden="true">02</div>
        <div className="seasonal-copy">
          <p className="eyebrow">— Seasonal favorites —</p>
          <h2>Cozy flavors are here.</h2>
          <p>Two limited-batch syrups bring the feeling of a warm kitchen straight to your morning cup.</p>
          <div className="seasonal-links">
            <button onClick={() => toggleProduct('Pumpkin Spice Syrup')}>Pumpkin Spice <Plus /></button>
            <button onClick={() => toggleProduct('Banana Bread Syrup')}>Banana Bread <Plus /></button>
          </div>
        </div>
        <div className="seasonal-note">
          <span>the fall pour</span>
          <Coffee />
          <p>Stir into hot coffee, cold brew, or a homemade latte.</p>
        </div>
      </section>

      <section className="story-section" id="story">
        <div className="story-mark">
          <Image src={`${publicBasePath}/logo.png`} alt="Loaves and Lattes logo" width={620} height={620} />
        </div>
        <div className="story-copy">
          <p className="eyebrow">The heart behind the kitchen</p>
          <h2>Made by a new mom.</h2>
          <p className="story-lead">
            Loaves &amp; Lattes began with a love for homemade food, cozy mornings, and making something special for the people we love.
          </p>
          <p>
            Every loaf and syrup is made in small batches with the kind of care that turns an ordinary morning into something worth lingering over.
          </p>
          <blockquote>“Made for your family, from mine.” <span>♡</span></blockquote>
        </div>
      </section>

      <section className="how-section">
        <div className="section-heading compact">
          <p className="eyebrow">Easy as Sunday morning</p>
          <h2>How to order.</h2>
        </div>
        <div className="steps">
          <div><span>01</span><h3>Choose</h3><p>Add your favorite loaves and syrups to your list.</p></div>
          <div><span>02</span><h3>Copy</h3><p>Copy your ready-made order message in one click.</p></div>
          <div><span>03</span><h3>Confirm</h3><p>Send it to Loaves &amp; Lattes to confirm availability and local pickup.</p></div>
        </div>
        <Sheet>
          <SheetTrigger render={<Button className="button button-primary final-cta" />}>
            <ShoppingBag /> View my list ({order.length})
          </SheetTrigger>
          <SheetContent className="order-sheet">
            <SheetHeader>
              <p className="eyebrow">A little something sweet</p>
              <SheetTitle>Your order list</SheetTitle>
              <SheetDescription>Copy this list to send to Loaves &amp; Lattes for availability and pickup details.</SheetDescription>
            </SheetHeader>
            <div className="order-items">
              {order.length ? order.map((item) => (
                <div className="order-item" key={item}><span>{item}</span><Button variant="ghost" size="icon-sm" onClick={() => toggleProduct(item)} aria-label={`Remove ${item}`}><Minus /></Button></div>
              )) : <div className="empty-order"><ShoppingBag /><p>Your list is waiting for something delicious.</p><span>Choose any item from the menu.</span></div>}
            </div>
            <div className="order-sheet-footer"><Button className="copy-button" onClick={copyOrder} disabled={!order.length}>{copied ? <Check /> : <Clipboard />}{copied ? 'Copied — ready to send!' : 'Copy my order list'}</Button><p>Prices and availability are confirmed when you order.</p></div>
          </SheetContent>
        </Sheet>
      </section>

      <footer>
        <div className="footer-brand">
          <p>Loaves <em>&amp;</em> Lattes</p>
          <span>Homemade breads &amp; coffee syrups</span>
        </div>
        <div className="footer-links">
          <a href="#menu">Menu</a><a href="#seasonal">Seasonal</a><a href="#story">Our story</a><a href="#top">Back to top ↑</a>
        </div>
        <p className="footer-thanks">♡ Thank you for supporting a small business and a new mom’s dream.</p>
      </footer>
    </main>
  );
}
