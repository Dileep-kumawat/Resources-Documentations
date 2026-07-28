# Recharts — Quick Recall Notes (MERN Stack)

> Recharts = React charting library built on **D3 (math) + SVG (rendering)**. Declarative, component-based — fits naturally into React/MERN apps.

---

## 1. Install & Setup

```bash
npm install recharts
```

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
```

No CSS imports needed — charts render as pure SVG.

---

## 2. Core Mental Model

Every chart follows the same pattern:

```jsx
<ChartType data={dataArray} width={500} height={300}>
  <CartesianGrid />      {/* background grid */}
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />             {/* hover popup */}
  <Legend />              {/* key for series */}
  <Line dataKey="value" /> {/* or Bar, Area, etc — the actual series */}
</ChartType>
```

**Data shape** — always an array of objects:
```js
const data = [
  { name: 'Jan', sales: 400, profit: 240 },
  { name: 'Feb', sales: 300, profit: 139 },
];
```
- `dataKey` on `XAxis`/`YAxis`/`Line`/`Bar` etc. tells Recharts which object key to read.

---

## 3. Chart Types (with minimal working examples)

### a) LineChart
```jsx
<ResponsiveContainer width="100%" height={300}>
  <LineChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="name" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="sales" stroke="#8884d8" />
    <Line type="monotone" dataKey="profit" stroke="#82ca9d" />
  </LineChart>
</ResponsiveContainer>
```
- `type="monotone"` = smooth curve (other options: `linear`, `step`, `basis`).

### b) BarChart
```jsx
<BarChart data={data}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="sales" fill="#8884d8" />
  <Bar dataKey="profit" fill="#82ca9d" />
</BarChart>
```
- Multiple `<Bar>` = grouped bars (side by side) by default.
- Add `stackId="a"` on each Bar to **stack** them instead.

### c) AreaChart
```jsx
<AreaChart data={data}>
  <defs>
    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <XAxis dataKey="name" />
  <YAxis />
  <CartesianGrid strokeDasharray="3 3" />
  <Tooltip />
  <Area type="monotone" dataKey="sales" stroke="#8884d8" fill="url(#colorSales)" />
</AreaChart>
```
- Same as LineChart but filled below the line. Gradient fill is a common pattern.

### d) PieChart / Donut
```jsx
<PieChart width={400} height={400}>
  <Pie
    data={data}
    dataKey="value"
    nameKey="name"
    cx="50%" cy="50%"
    outerRadius={100}
    innerRadius={60}   // remove this for full pie, keep for donut
    label
  >
    {data.map((entry, index) => (
      <Cell key={index} fill={COLORS[index % COLORS.length]} />
    ))}
  </Pie>
  <Tooltip />
  <Legend />
</PieChart>
```
- No `XAxis`/`YAxis` needed.
- `<Cell>` lets you color each slice individually.

### e) RadarChart (skills/comparison charts)
```jsx
<RadarChart data={data}>
  <PolarGrid />
  <PolarAngleAxis dataKey="subject" />
  <PolarRadiusAxis />
  <Radar dataKey="score" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
</RadarChart>
```

### f) ScatterChart
```jsx
<ScatterChart>
  <CartesianGrid />
  <XAxis dataKey="x" type="number" />
  <YAxis dataKey="y" type="number" />
  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
  <Scatter data={data} fill="#8884d8" />
</ScatterChart>
```

### g) ComposedChart (mix Bar + Line + Area in one chart)
```jsx
<ComposedChart data={data}>
  <CartesianGrid stroke="#f5f5f5" />
  <XAxis dataKey="name" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Bar dataKey="sales" barSize={20} fill="#413ea0" />
  <Line type="monotone" dataKey="profit" stroke="#ff7300" />
</ComposedChart>
```

### h) RadialBarChart (circular progress / gauges)
```jsx
<RadialBarChart innerRadius="10%" outerRadius="80%" data={data}>
  <RadialBar dataKey="value" />
  <Legend />
  <Tooltip />
</RadialBarChart>
```

---

## 4. Key Components Cheat Sheet

| Component | Purpose |
|---|---|
| `ResponsiveContainer` | Makes chart fill parent width/height — **always wrap charts in this** for responsive layouts |
| `CartesianGrid` | Background gridlines (`strokeDasharray="3 3"` = dashed) |
| `XAxis` / `YAxis` | Axes; `dataKey` = which field to plot; `type="number"|"category"` |
| `Tooltip` | Hover info box; customizable via `content` prop |
| `Legend` | Shows series names/colors |
| `Line` / `Bar` / `Area` / `Pie` / `Scatter` / `Radar` | The actual data series |
| `Cell` | Per-data-point styling (mainly used in Pie/Bar for individual colors) |
| `ReferenceLine` / `ReferenceArea` / `ReferenceDot` | Draw a fixed line/area (e.g., target value, average) |
| `Brush` | Adds a draggable zoom/range-selector below the chart |
| `ErrorBar` | Show error margins on Line/Bar/Scatter |

---

## 5. ResponsiveContainer (MUST KNOW for real apps)

```jsx
<div style={{ width: '100%', height: 400 }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      {/* ... */}
    </LineChart>
  </ResponsiveContainer>
</div>
```
⚠️ Common gotcha: `ResponsiveContainer` needs its **parent** to have a defined height (percentage height doesn't work without an ancestor with fixed height).

---

## 6. Customizing Tooltip (very common interview/real-task ask)

```jsx
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-2 border rounded shadow">
        <p className="font-bold">{label}</p>
        {payload.map((entry, i) => (
          <p key={i} style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// usage
<Tooltip content={<CustomTooltip />} />
```

---

## 7. Custom Axis Tick / Label Formatting

```jsx
<XAxis dataKey="name" tickFormatter={(value) => value.toUpperCase()} />
<YAxis tickFormatter={(value) => `$${value}`} />
```

Custom tick component (e.g., rotated labels):
```jsx
const CustomTick = ({ x, y, payload }) => (
  <text x={x} y={y} dy={16} textAnchor="end" transform={`rotate(-35, ${x}, ${y})`}>
    {payload.value}
  </text>
);
<XAxis dataKey="name" tick={<CustomTick />} />
```

---

## 8. Animations
- Enabled by default (`isAnimationActive={true}`).
- Disable for performance on large datasets: `isAnimationActive={false}`.
- Control speed: `animationDuration={1500}`.

---

## 9. Handling Click / Hover Events (interactivity)

```jsx
<Bar
  dataKey="sales"
  onClick={(data, index) => console.log(data, index)}
  onMouseEnter={(data) => console.log('hover', data)}
/>
```
- Also available on `Line`, `Pie` (`onClick` on `<Pie>` or `<Cell>`).

---

## 10. Fetching & Feeding API Data (MERN-specific pattern)

```jsx
import { useEffect, useState } from 'react';

function SalesChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch('/api/sales')           // Express backend endpoint
      .then(res => res.json())
      .then(json => setData(json)); // must match [{name, sales}, ...] shape
  }, []);

  if (!data.length) return <p>Loading...</p>;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="sales" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```
**Key MERN tip:** shape your MongoDB aggregation `$project`/`$group` output on the Express side to directly match Recharts' expected array-of-objects format — saves transformation logic on frontend.

---

## 11. Multiple Y-Axes (dual metrics, e.g., revenue vs. count)

```jsx
<LineChart data={data}>
  <XAxis dataKey="name" />
  <YAxis yAxisId="left" />
  <YAxis yAxisId="right" orientation="right" />
  <Tooltip />
  <Line yAxisId="left" dataKey="revenue" stroke="#8884d8" />
  <Line yAxisId="right" dataKey="orders" stroke="#82ca9d" />
</LineChart>
```

---

## 12. Stacked Bar/Area Charts

```jsx
<Bar dataKey="sales" stackId="a" fill="#8884d8" />
<Bar dataKey="profit" stackId="a" fill="#82ca9d" />
```
Same `stackId` = stacked together. Different `stackId` = separate groups.

---

## 13. Common Real-World Use Cases (MERN dashboards)

| Use Case | Chart |
|---|---|
| Revenue over time | LineChart / AreaChart |
| Sales by category | BarChart |
| Market share / user roles split | PieChart |
| Order status distribution | PieChart / RadialBarChart |
| Performance comparison (multi-metric) | RadarChart |
| Correlation (price vs rating) | ScatterChart |
| Revenue + order count combo | ComposedChart |
| KPI gauge / completion % | RadialBarChart |

---

## 14. Styling Tips
- Colors: pass any valid CSS color to `fill`/`stroke`.
- Use a constant array for multi-series palettes:
```js
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
```
- Tailwind: Recharts SVG elements don't take Tailwind classes directly for fill/stroke (use inline style/props), but wrapper `<div>`s can use Tailwind freely.

---

## 15. Common Gotchas / Debugging Checklist
1. **Chart not showing?** → Check parent div has explicit height; `ResponsiveContainer` needs it.
2. **Empty chart?** → Verify `data` array isn't empty before first render (loading state).
3. **`dataKey` mismatch** → Must exactly match the key name in your data objects (case-sensitive).
4. **Tooltip shows "undefined"** → `dataKey`/`nameKey` typo, or data field is missing in some objects.
5. **Multiple lines not appearing** → Each needs its own `<Line dataKey="...">`, not one Line with multiple keys.
6. **Pie chart all one color** → Forgot to wrap with `<Cell>` per data point.

---

## 16. Quick Import Reference

```jsx
import {
  LineChart, Line,
  BarChart, Bar,
  AreaChart, Area,
  PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ScatterChart, Scatter,
  ComposedChart,
  RadialBarChart, RadialBar,
  XAxis, YAxis, ZAxis,
  CartesianGrid,
  Tooltip, Legend,
  ResponsiveContainer,
  ReferenceLine, ReferenceArea, ReferenceDot,
  Brush, ErrorBar
} from 'recharts';
```

---

## 17. One-Glance Summary
- Recharts = declarative React components wrapping D3+SVG.
- Pattern: `<ChartType data={...}><Axes/><Tooltip/><Legend/><Series dataKey="x"/></ChartType>`
- Always wrap in `ResponsiveContainer` inside a height-bound div.
- Data = array of flat objects; `dataKey` binds fields to chart elements.
- Customize via `Cell` (per-point), `content` prop (custom Tooltip), `tickFormatter` (axis labels).
- For MERN: shape backend API response to match chart data format directly.

