import { useState } from "react";

interface ListGroupProps {
    // get the items from the parent component
    items: string[];
    heading: string;
}

function ListGroup({items, heading}: ListGroupProps) {
    
    // Hook
    const [selectedIndex, setSelectedIndex] = useState(-1);    
    
    // const getMessage = () => {
    //     return listItems.length === 0 ? "No items in list" : null;
    // }

    const handleClick = (e: MouseEvent) => console.log(e);

  return (
    <>
    {/* <h1>Section</h1> */}
    {/* {getMessage()} */}
    {items.length === 0 && <p>No items in list</p>}
    <h2>{heading}</h2>
    <ul className="list-group">
        {items.map((item, index) => (
            <section key={index} className={ selectedIndex === index ? 'list-group-item active' : 'list-group-item'} >
                <h2>
                {item}
                </h2>
                {/* <p className="productDescription">{prog}</p> */}
                {/* <p>{...item}</p> */}
                {/* <img src="/assets/images/"{$item}".png" alt="image of product" /> */}
                {/* create image tag using variable for the item */}
                <img src={`/assets/images/${item}.png`} alt="image of product" />
                {/* Display the item prog in a pagraph */}
                {/* <p>{items(key)}</p> */}
            </section>
        ))}
    </ul>
    </>
  );
}

export default ListGroup;
