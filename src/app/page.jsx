import Hero from './components/Hero';
import OfferSection from './components/offerSection';
import ProductsSection from './components/productsSection';


export default function Home() {
  return (
     <main className="bg-white">
      <Hero />
      <ProductsSection/>
      <OfferSection/>
    </main>
  );
}
