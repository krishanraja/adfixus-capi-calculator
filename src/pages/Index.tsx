import { Helmet } from 'react-helmet';
import SalesPlanApp from '@/components/SalesPlanApp';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AdFixus CAPI: What Your Own Conversions API Is Worth</title>
        <meta
          name="description"
          content="Walled gardens took about half of open-web ad revenue with one thing publishers do not have: their own Conversions API. Answer two questions and see the incremental annual ad revenue standing up your own CAPI on AdFixus identity could be worth."
        />
        <meta
          name="keywords"
          content="CAPI, conversions API, publisher revenue, outcome-based advertising, durable identity, attribution, AdFixus, open web"
        />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="AdFixus CAPI: What Your Own Conversions API Is Worth" />
        <meta
          property="og:description"
          content="Win outcome budgets back from the walled gardens. See what standing up your own Conversions API on AdFixus identity is worth in incremental annual ad revenue."
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
