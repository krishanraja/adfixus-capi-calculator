
import { Helmet } from 'react-helmet';
import ROICalculator from '@/components/ROICalculator';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>AdFixus CAPI Revenue Calculator - Maximize Your Ad Revenue</title>
        <meta 
          name="description" 
          content="Calculate your potential revenue increase with AdFixus Conversion API. See how CAPI can improve conversion rates and boost your advertising revenue by up to 200%." 
        />
        <meta name="keywords" content="CAPI, conversion API, ad revenue calculator, AdFixus, advertising revenue optimization" />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="AdFixus CAPI Revenue Calculator" />
        <meta property="og:description" content="Calculate your potential revenue increase with AdFixus Conversion API" />
        <meta property="og:type" content="website" />
      </Helmet>
      <main>
        <ROICalculator />
      </main>
    </>
  );
};

export default Index;
