// import ListGroup from "./components/ListGroup";
import ProductCard from "./components/ProductCard";

interface ProductProps {
  name: string;
  prog: string;
}

function App() {  
    let productItems: ProductProps[] = [
    {name: "Knob", prog: "1234"},
    {name: "Spacer, 4-1", prog: "1234"},
    {name: "Signal, Repair, Honda", prog: "n1258"},
    {name: "Hanger, Grinder, Screw-On", prog: "1234"},
    {name: "Shroud", prog: "n1259"},
    {name: "Mount, Relay", prog: "n1256"},
    {name: "Plate, Hitch", prog: "n1228"},
    {name: "Hanger, Screwdriver", prog: "n1232"},
    {name: "Anchor", prog: "n1281"},
    {name: "Spacer, Reed", prog: "n1310"},
    {name: "Strainer, Gutter", prog: "n1314"},
    {name: "Hanger - Saw (1311)", prog: "n1311"},
    {name: "Hanger, Edge (1241)", prog: "n1241"},
    {name: "Mount, Large (1297)", prog: "n1297"},
    ];

  return (
    <div className="container">
      {/* <ListGroup items={listItems} heading="Cities" /> */}
      <ProductCard items={productItems.map(({name}) => name)} heading="Products" />
    </div>
  );
}

export default App;