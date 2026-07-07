import dynamic from 'next/dynamic';

// Lazy load chart components with loading skeleton
const LazyBarChart = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.BarChart })), 
  { 
    loading: () => null,
    ssr: true 
  }
);

const LazyPieChart = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.PieChart })), 
  { 
    loading: () => null,
    ssr: true 
  }
);

const LazyResponsiveContainer = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.ResponsiveContainer })), 
  { 
    loading: () => null,
    ssr: true 
  }
);

const LazyXAxis = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.XAxis })), 
  { 
    loading: () => null,
    ssr: false 
  }
);

const LazyYAxis = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.YAxis })), 
  { 
    loading: () => null,
    ssr: false 
  }
);

const LazyCartesianGrid = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.CartesianGrid })), 
  { 
    loading: () => null,
    ssr: false 
  }
);

const LazyTooltip = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.Tooltip })), 
  { 
    loading: () => null,
    ssr: false 
  }
);

const LazyBar = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.Bar })), 
  { 
    loading: () => null,
    ssr: false 
  }
);

const LazyPie = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.Pie })), 
  { 
    loading: () => null,
    ssr: false 
  }
);

const LazyCell = dynamic(() => 
  import('recharts').then(mod => ({ default: mod.Cell })), 
  { 
    loading: () => null,
    ssr: false 
  }
);

export {
  LazyBarChart,
  LazyPieChart,
  LazyResponsiveContainer,
  LazyXAxis,
  LazyYAxis,
  LazyCartesianGrid,
  LazyTooltip,
  LazyBar,
  LazyPie,
  LazyCell
};
