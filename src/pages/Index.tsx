import { Helmet } from 'react-helmet';
import SalesPlanApp from '@/components/SalesPlanApp';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AdFixus CAPI — The Publisher ↔ Advertiser Data Bridge</title>
        <meta
          name="description"
          content="Without durable identity, the conversion signal a publisher sends its advertisers is broken across the anonymous majority. See how AdFixus + CAPI restores a clean, verified-human signal across all traffic — and what closing that gap is worth."
        />
        <meta name="keywords" content="CAPI, conversion API, durable identity, match rate, publisher revenue, attribution, AdFixus" />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="AdFixus CAPI — The Publisher ↔ Advertiser Data Bridge" />
        <meta
          property="og:description"
          content="Restore a clean, verified-human conversion signal across all your traffic — so advertisers see true conversions and budget follows."
        />
        <meta property="og:type" content="website" />
      </Helmet>
      <main>
        <SalesPlanApp />
      </main>
    </>
  );
};

export default Index;
