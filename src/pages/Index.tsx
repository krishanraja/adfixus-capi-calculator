import { Helmet } from 'react-helmet';
import SalesPlanApp from '@/components/SalesPlanApp';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AdFixus CAPI Sales-Plan Simulator</title>
        <meta
          name="description"
          content="Model your publisher CAPI opportunity and get a concrete plan to mobilise your sales team — monthly campaign ramp, per-campaign economics, and commercial model comparison."
        />
        <meta name="keywords" content="CAPI, conversion API, publisher revenue, sales plan, AdFixus" />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="AdFixus CAPI Sales-Plan Simulator" />
        <meta
          property="og:description"
          content="Model your publisher CAPI opportunity and mobilise your sales team to sell it."
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
